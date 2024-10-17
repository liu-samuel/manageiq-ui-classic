/* eslint-disable no-restricted-syntax */
import React, { useState, useEffect } from 'react';
import MiqFormRenderer, { useFormApi } from '@@ddf';
import {
  Db2Database20, BareMetalServer20,
} from '@carbon/icons-react';
import createSchema from './settings-cu-collection-tab.schema.js';

let idCounter = 0;
const clustersValues = new Set();
const datastoresValues = new Set();

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

  const checkChildren = (collectionValue, child, collectionSet) => {
    if (!child.children) {
      collectionSet.add(child.value);
    } else {
      for (const nextChild of child.children) {
        checkChildren(collectionValue, nextChild, collectionSet);
      }
    }
  };

  // find checked boxes for all role features
  const findCheck = (treeValue, node, collectionSet) => {
    const result = node.value.split('#')[0];

    if (result === treeValue) {
      collectionSet.add(node.value);
      if (node.children) {
        for (const child of node.children) {
          checkChildren(treeValue, child, collectionSet);
        }
      }
    }
    if (node.children) {
      for (const child of node.children) {
        findCheck(treeValue, child, collectionSet);
      }
    }
  };

  const transformTree = (node, isDatastore, depth) => {
    const currentId = generateId();

    const nodeObject = {
      value: `${node.key}#${currentId}`,
      label: <span className="dropdown-label">
        {parseLabel(node.text)}
      </span>,
      showCheckbox: !isDatastore || node.nodes !== undefined || depth === 0,
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
      nodeObject.children = node.nodes.map((node) => transformTree(node, isDatastore, depth + 1));
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
      clustersNodes = clustersBsTree.map((node) => transformTree(node, false, 0));
    }
    if (datastoreTree) {
      const datastoresBsTree = JSON.parse(datastoreTree.bs_tree);
      datastoresNodes = datastoresBsTree.map((node) => transformTree(node, true, 0));
    }
    setData({
      ...data,
      clustersNodes,
      datastoresNodes,
    });
  }, []);

  const handleSubmit = (values) => {
    console.log('values: ', values);
    if (!values.tree_dropdown) {
      values.tree_dropdown = data.checked;
    }

    const params = {
      all_clusters: values.all_clusters,
      all_datastores: values.all_datastores,
      button: 'save',
      clusters_checked: [],
      datastores_checked: [],
    };
    console.log('datastores: ', values.datastores_tree);

    let clustersSplitValues = [];
    let datastoresSplitValues = [];

    if (!values.all_clusters) {
      const clustersTreeDropdown = values.clusters_tree;
      clustersSplitValues = clustersTreeDropdown.map((string) => string.split('#')[0]);
    }

    if (!values.all_datastores) {
      const datastoresTreeDropdown = values.datastores_tree;
      datastoresSplitValues = datastoresTreeDropdown.map((string) => string.split('#')[0]);
    }

    for (const node of clusterTree.tree_nodes) {
      const curr = [];
      if (node.nodes) {
        for (const hostNode of node.nodes) {
          if (clustersSplitValues.includes(hostNode.key)) {
            curr.push(hostNode.key);
          }
          if (hostNode === node.nodes[node.nodes.length - 1]) {
            if (curr.length === node.nodes.length) {
              params.clusters_checked.push({ id: node.key.split('-')[1], capture: true });
            } else {
              params.clusters_checked.push({ id: node.key.split('-')[1], capture: false });
            }
          }
        }
      } else {
        if (clustersSplitValues.includes(node.key)) {
          params.clusters_checked.push({ id: node.key.split('-')[1], capture: true });
        } else {
          params.clusters_checked.push({ id: node.key.split('-')[1], capture: false });
        }
      }
    }

    for (const node of datastoreTree.tree_nodes) {
      const curr = [];
      if (node.nodes) {
        for (const hostNode of node.nodes) {
          if (datastoresSplitValues.includes(hostNode.key)) {
            curr.push(hostNode.key);
          }
          if (hostNode === node.nodes[node.nodes.length - 1]) {
            if (curr.length === node.nodes.length) {
              params.datastores_checked.push({ id: node.key.split('-')[1], capture: true });
            } else {
              params.datastores_checked.push({ id: node.key.split('-')[1], capture: false });
            }
          }
        }
      } else {
        if (datastoresSplitValues.includes(node.key)) {
          params.datastores_checked.push({ id: node.key.split('-')[1], capture: true });
        } else {
          params.datastores_checked.push({ id: node.key.split('-')[1], capture: false });
        }
      }
    }

    console.log('params: ', params);

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
