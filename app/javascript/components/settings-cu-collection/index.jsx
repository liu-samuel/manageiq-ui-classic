import React, { useState, useEffect } from 'react';
import MiqFormRenderer, { useFormApi } from '@@ddf';
import {
  Db2Database20, BareMetalServer20,
} from '@carbon/icons-react';
import createSchema from './settings-cu-collection-tab.schema.js';

let idCounter = 0;

const SettingsCUCollectionTab = ({
  url, clusterTree, datastoreTree, allClusters, allDatastores,
}) => {
  const [data, setData] = useState({
    isLoading: false,
    tempData: undefined,
    clustersNodes: [],
    datastoresNodes: [],
    clustersChecked: [],
    datastoresChecked: [],
  });

  const generateId = () => idCounter++;

  const parseLabel = (text) => {
    const parts = text.match(/<strong>(.*?)<\/strong>(.*)/);

    if (parts) {
      return (
        <span>
          <strong>{parts[1]}</strong>
          {parts[2]}
        </span>
      );
    }
    return <span>{text}</span>;
  };

  const transformTree = (node) => {
    const currentId = generateId();

    const nodeObject = {
      value: `${node.key}#${currentId}`,
      label: parseLabel(node.text),
    };

    let icon;
    switch (node.icon) {
      case 'fa fa-database':
        icon = Db2Database20 ? <Db2Database20 color="black" /> : <span>Icon DATABSEnot available</span>;
        break;

      case 'pficon pficon-cluster':
        icon = BareMetalServer20 ? <BareMetalServer20 color="black" /> : <span>Icon SERvERASDSADASDSADSADASDa not available</span>;
        break;
      default:
        break;
    }

    if (node.image) {
      icon = <img src={node.image} alt="node" />;
    }
    if (icon) {
      nodeObject.icon = <span>{ icon }</span>;
    }

    if (node.nodes) {
      nodeObject.children = node.nodes.map(transformTree);
    }
    return nodeObject;
  };

  useEffect(() => {
    if (data.isLoading) {
      http.post(url, data.tempData)
        .then(() => {
          setData({
            ...data,
            isLoading: false,
          });
        })
        .catch((error) => console.log('error: ', error));
    }
  }, [data.isLoading]);

  useEffect(() => {
    let clustersNodes = [];
    let datastoresNodes = [];
    if (clusterTree) {
      const clustersBsTree = JSON.parse(clusterTree.bs_tree);
      clustersNodes = clustersBsTree.map(transformTree);
    }
    if (datastoreTree) {
      const datastoresBsTree = JSON.parse(datastoreTree.bs_tree);
      datastoresNodes = datastoresBsTree.map(transformTree);
    }
    setData({
      ...data,
      clustersNodes,
      datastoresNodes,
    });
  }, []);

  const handleSubmit = (values) => {
    console.log("values: ", values);
    if (!values.tree_dropdown) {
      values.tree_dropdown = data.checked;
    }

    const params = {
      all_clusters: values.all_clusters,
      all_datastores: values.all_datastores,
      button: 'save',
    };

    if (!values.all_clusters) {
      params.clusters_checked_with_id = values.clusters_tree;
      const clustersTreeDropdown = values.clusters_tree;
      const clustersSplitValues = clustersTreeDropdown.map((string) => string.split('#')[0]);
      params.clusters_checked = clustersSplitValues;
    }

    if (!values.all_datastores) {
      params.datastores_checked_with_id = values.datastores_tree;
      const datastoresTreeDropdown = values.datastores_tree;
      const datastoresSplitValues = datastoresTreeDropdown.map((string) => string.split('#')[0]);
      params.datastores_checked = datastoresSplitValues;
    }

    setData({
      ...data,
      isLoading: true,
      tempData: params,
    });
  };

  return (
    <MiqFormRenderer
      className="toggle"
      schema={createSchema(
        clusterTree, datastoreTree, data.clustersNodes, data.datastoresNodes, allClusters, allDatastores,
      )}
      onSubmit={handleSubmit}
      canSubmit
      canReset
      // FormTemplate={(props) => <FormTemplate {...props} />}
    />
  );
};

export default SettingsCUCollectionTab;
