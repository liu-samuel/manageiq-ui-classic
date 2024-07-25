import { componentTypes, validatorTypes } from '@@ddf';

const createSchema = (selectOptions, customProps, initialValues, rbacRoleMenu, role) => ({
  fields: [
    {
      component: componentTypes.TEXT_FIELD,
      id: 'name',
      name: 'name',
      initialValue: initialValues.name || '',
      label: __('Name'),
      maxLength: 128,
      validate: [{ type: validatorTypes.REQUIRED }],
      isRequired: true,
    },
    {
      component: componentTypes.SELECT,
      id: 'access_restriction_orchestration',
      name: 'access_restriction_orchestration',
      initialValue: initialValues.vms || '',
      label: __('Access Restriction for Orchestration Stacks, Key Pairs, Services, VMs, and Templates'),
      maxLength: 128,
      options: selectOptions.map((option) => ({ label: option[1], value: option[0] })),
    },
    {
      component: componentTypes.SELECT,
      id: 'access_restriction_catalog',
      name: 'access_restriction_catalog',
      initialValue: initialValues.service_templates || '',
      label: __('Access Restriction for Catalog Items'),
      maxLength: 128,
      options: selectOptions.map((option) => ({ label: option[1], value: option[0] })),
    },
    {
      component: componentTypes.SUB_FORM,
      id: 'tree-view-section',
      name: 'tree-view-section',
      fields: [{
        component: 'tree-view',
        name: 'tree-dropdown',
        id: customProps.tree_id,
        label: __('Product Features (Editing)'),
        loadData: JSON.parse(customProps.bs_tree),
      }],
    },
  ],
});

export default createSchema;

// loadData, lazyLoadData, validateOnMount, helperText, identifier, ...props

// TreeViewField.propTypes = {
//   loadData: PropTypes.func.isRequired,
//   lazyLoadData: PropTypes.func,
//   helperText: PropTypes.string,
//   isRequired: PropTypes.bool,
//   label: PropTypes.string.isRequired,
//   identifier: PropTypes.func,
//   validateOnMount: PropTypes.bool,
// };
