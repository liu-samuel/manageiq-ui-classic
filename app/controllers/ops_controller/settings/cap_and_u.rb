module OpsController::Settings::CapAndU
  extend ActiveSupport::Concern

  def cu_collection_update
    assert_privileges("region_edit")

    return unless load_edit("cu_edit__collection", "replace_cell__explorer")

    cu_collection_get_form_vars
    # require 'byebug'
    # byebug
    if params[:button] == "save"
      # C & U collection settings
      if @edit[:new][:all_clusters] != @edit[:current][:all_clusters]
        Metric::Targets.perf_capture_always = {
          :host_and_cluster => @edit[:new][:all_clusters]
        }
      end

      if @edit[:new][:all_storages] != @edit[:current][:all_storages]
        Metric::Targets.perf_capture_always = {
          :storage => @edit[:new][:all_storages]
        }
      end

      set_perf_collection_for_clusters if @edit[:new] != @edit[:current]

      if @edit[:current][:non_cl_hosts].present? # if there are any hosts without clusters
        @edit[:current][:non_cl_hosts].each_with_index do |h_id, i|
          h = Host.find(h_id[:id])
          h.perf_capture_enabled = @edit[:new][:non_cl_hosts][i][:capture]
        end
      end

      unless @edit[:new][:storages] == @edit[:current][:storages] # Check for storage changes
        @edit[:new][:storages].each do |_, s|
          storage = Storage.find(s[:id])
          storage.perf_capture_enabled = s[:capture]
        end
      end

      add_flash(_("Capacity and Utilization Collection settings saved"))
      get_node_info(x_node)
      replace_right_cell(:nodetype => @nodetype)
    end
  end

  def set_perf_collection_for_clusters
    cluster_ids = @edit[:new][:clusters].collect { |c| c[:id] }.uniq
    clusters = EmsCluster.where(:id => cluster_ids).includes(:hosts)

    clusters.each do |cl|
      enabled_hosts = @edit[:new][cl.id].select { |h| h[:capture] }
      enabled_host_ids = enabled_hosts.collect { |h| h[:id] }.uniq
      cl.perf_capture_enabled_host_ids = enabled_host_ids
    end
  end

  def cu_collection_fetch
    @edit = {}
    @edit[:new] = {}
    @edit[:current] = {}
    @edit[:key] = "cu_edit__collection"
    @edit[:current][:all_clusters] = Metric::Targets.perf_capture_always[:host_and_cluster]
    @edit[:current][:all_storages] = Metric::Targets.perf_capture_always[:storage]
    @edit[:current][:clusters] = []
    @cl_hash = EmsCluster.get_perf_collection_object_list
    @cl_hash.each_with_index do |h, j|
      _cid, cl_hash = h
      c = cl_hash[:cl_rec]
      enabled = cl_hash[:ho_enabled]
      enabled_host_ids = enabled.collect(&:id)
      hosts = (cl_hash[:ho_enabled] + cl_hash[:ho_disabled]).sort_by { |ho| ho.name.downcase }
      cl_enabled = enabled_host_ids.length == hosts.length
      en_flg = cl_enabled && !enabled.empty?
      @edit[:current][:clusters].push(:id => c.id, :capture => en_flg)
      @edit[:current][c.id] = []
      hosts.each do |host|
        host_capture = enabled_host_ids.include?(host.id.to_i)
        @edit[:current][c.id].push(:id => host.id, :capture => host_capture)
      end
      flg = true
      count = 0
      @edit[:current][c.id].each do |host|
        unless host[:capture]
          count += 1 # checking if all hosts are unchecked then cluster capture will be false else undefined
          flg = count == @edit[:current][c.id].length ? false : "undefined"
        end
        @edit[:current][:clusters][j][:capture] = flg
      end
    end
    @edit[:current][:clusters].sort_by! { |c| c[:name] }

    # ##################### Adding Non-Clustered hosts node
    @edit[:current][:non_cl_hosts] ||= []
    ExtManagementSystem.in_my_region.each do |e|
      all = e.non_clustered_hosts
      all.each do |h|
        @edit[:current][:non_cl_hosts] << {:id => h.id, :capture => h.perf_capture_enabled?}
      end
    end
    if @edit[:current][:clusters].present?
      @cluster_tree = TreeBuilderClusters.new(:cluster_tree, @sb, true, :root => @cl_hash)
    end
    @edit[:current][:storages] = {}
    Storage.in_my_region.includes(:taggings, :tags, :hosts).select(:id, :name, :location).sort_by { |s| s.name.downcase }.each do |s|
      @edit[:current][:storages][s.id] = {:id => s.id, :capture => s.perf_capture_enabled?}
    end
    if @edit[:current][:storages].present?
      @datastore_tree = TreeBuilderDatastores.new(:datastore_tree, @sb, true, :root => @edit[:current][:storages])
    end
    @edit[:new] = copy_hash(@edit[:current])

    clusters = []
    @edit[:current].each do |key, value|
      if key.is_a?(Numeric) && value != []
        clusters << value
      elsif key.is_a?(Numeric) && value == []
        clusters << key
      end
    end
    hosts = []
    clusters.each do |cluster|
      if !cluster.is_a?(Numeric) && !cluster.empty?
        cluster.each do |host|
          hosts << host
        end
      else
        hosts << cluster
      end
    end

    render :json => {
      :hosts      => hosts,
      :datastores => @edit[:current][:storages].values
    }
  end

  private

  def cu_build_edit_screen
    @edit = {}
    @edit[:new] = {}
    @edit[:current] = {}
    @edit[:key] = "cu_edit__collection"
    @edit[:current][:all_clusters] = Metric::Targets.perf_capture_always[:host_and_cluster]
    @edit[:current][:all_storages] = Metric::Targets.perf_capture_always[:storage]
    @edit[:current][:clusters] = []
    @cl_hash = EmsCluster.get_perf_collection_object_list
    @cl_hash.each_with_index do |h, j|
      _cid, cl_hash = h
      c = cl_hash[:cl_rec]
      enabled = cl_hash[:ho_enabled]
      enabled_host_ids = enabled.collect(&:id)
      hosts = (cl_hash[:ho_enabled] + cl_hash[:ho_disabled]).sort_by { |ho| ho.name.downcase }
      cl_enabled = enabled_host_ids.length == hosts.length
      en_flg = cl_enabled && !enabled.empty?
      @edit[:current][:clusters].push(:id => c.id, :capture => en_flg)
      @edit[:current][c.id] = []
      hosts.each do |host|
        host_capture = enabled_host_ids.include?(host.id.to_i)
        @edit[:current][c.id].push(:id => host.id, :capture => host_capture)
      end
      flg = true
      count = 0
      @edit[:current][c.id].each do |host|
        unless host[:capture]
          count += 1 # checking if all hosts are unchecked then cluster capture will be false else undefined
          flg = count == @edit[:current][c.id].length ? false : "undefined"
        end
        @edit[:current][:clusters][j][:capture] = flg
      end
    end
    @edit[:current][:clusters].sort_by! { |c| c[:name] }

    ##################### Adding Non-Clustered hosts node
    @edit[:current][:non_cl_hosts] ||= []
    ExtManagementSystem.in_my_region.each do |e|
      all = e.non_clustered_hosts
      all.each do |h|
        @edit[:current][:non_cl_hosts] << {:id => h.id, :capture => h.perf_capture_enabled?}
      end
    end
    if @edit[:current][:clusters].present?
      @cluster_tree = TreeBuilderClusters.new(:cluster_tree, @sb, true, :root => @cl_hash)
    end
    @edit[:current][:storages] = {}
    Storage.in_my_region.includes(:taggings, :tags, :hosts).select(:id, :name, :location).sort_by { |s| s.name.downcase }.each do |s|
      @edit[:current][:storages][s.id] = {:id => s.id, :capture => s.perf_capture_enabled?}
    end
    if @edit[:current][:storages].present?
      @datastore_tree = TreeBuilderDatastores.new(:datastore_tree, @sb, true, :root => @edit[:current][:storages])
    end
    @edit[:new] = copy_hash(@edit[:current])
    session[:edit] = @edit
  end

  def cu_collection_get_form_vars
    @edit[:new][:all_clusters] = params[:all_clusters]
    @edit[:new][:all_storages] = params[:all_datastores]

    params[:clusters_checked].each do |cluster|
      model, id, _ = TreeBuilder.extract_node_model_and_id(cluster[:id])
      cluster_tree_settings(model, id, cluster)
    end
    params[:datastores_checked].each do |storage|
      model, id, _ = TreeBuilder.extract_node_model_and_id(storage[:id])
      @edit[:new][:storages][id.to_i][:capture] = storage[:capture]
    end
    params[:hosts_checked].each do |host|
      model, id, _ = TreeBuilder.extract_node_model_and_id(host[:id])
      cluster_tree_settings(model, id, host)
    end
  end

  def cluster_tree_settings(model, id, cluster_or_host)
    if id == "NonCluster" # Clicked on all non-clustered hosts
      @edit[:new][:non_cl_hosts].each { |c| c[:capture] = cluster_or_host[:capture] }
    elsif model == "EmsCluster" # Clicked on a cluster
      @edit[:new][id.to_i].each { |h| h[:capture] = cluster_or_host[:capture] }
    elsif model == "Host" # Clicked on a host
      nc_host = @edit[:new][:non_cl_hosts].find { |x| x[:id] == id.to_i }
      # The host is among the non-clustered ones
      return nc_host[:capture] = cluster_or_host[:capture] if nc_host
      # The host is under a cluster, find it and change it
      @edit[:new][:clusters].find do |cl|
        @edit[:new][cl[:id]].find do |h|
          found = h[:id] == id.to_i
          h[:capture] = cluster_or_host[:capture] if found
          found
        end
      end
    end
  end
end