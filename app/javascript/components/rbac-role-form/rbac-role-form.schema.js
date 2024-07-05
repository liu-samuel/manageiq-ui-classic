import { componentTypes, validatorTypes } from '@@ddf';

const createSchema = (selectOptions, customProps) => ({
  fields: [
    {
      component: componentTypes.TEXT_FIELD,
      id: 'name',
      name: 'name',
      label: __('Name'),
      maxLength: 128,
      validate: [{ type: validatorTypes.REQUIRED }],
      isRequired: true,
    },
    {
      component: componentTypes.SELECT,
      id: 'access_restriction_orchestration',
      name: 'access_restriction_orchestration',
      label: __('Access Restriction for Orchestration Stacks, Key Pairs, Services, VMs, and Templates'),
      maxLength: 128,
      options: selectOptions.map((option) => ({ label: option[1], value: option[0] })),
    },
    {
      component: componentTypes.SELECT,
      id: 'access_restriction_catalog',
      name: 'access_restriction_catalog',
      label: __('Access Restriction for Catalog Items'),
      maxLength: 128,
      options: selectOptions.map((option) => ({ label: option[1], value: option[0] })),
    },
    {
      component: componentTypes.SUB_FORM,
      id: 'tree-view-section',
      name: 'tree-view-section',
      fields: [{
        component: 'tree-view-redux',
        name: 'tree-dropdown',
        id: customProps.tree_id,
        label: __('Product Features (Editing)'),
        tree_name: customProps.tree_name,
        bs_tree: customProps.bs_tree,
      }],
    },
  ],
});

export default createSchema;
