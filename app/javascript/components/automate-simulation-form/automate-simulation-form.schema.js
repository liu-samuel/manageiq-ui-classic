import { componentTypes, validatorTypes } from '@@ddf';

const targetsURL = (targetClass) => `/miq_ae_tools/get_form_targets?target_class=${encodeURIComponent(targetClass)}`;
const loadTargets = (selectedTargetClass) => http.get(targetsURL(selectedTargetClass))
  .then((formVars) => {
    if (formVars && formVars.targets) {
      return [
        { label: `<${__('None')}>`, value: '-1' },
        ...formVars.targets.map(([key, value]) => ({
          label: String(key),
          value: String(value),
        })),
      ];
    }
    return [];
  });

const createSchema = (
  resolve, maxNameLength, url, aeAnsibleCustomButton, formAction, aeCustomButton,
  attrValuesPairs, maxLength, typeClassesOptions, formData, setFormData
) => {
  const fields = [
    {
      component: componentTypes.SELECT,
      id: 'instance_name',
      name: 'instance_name',
      label: __('System/Process'),
      initialValue: resolve.instance_names.sort((b, a) => a.toLowerCase().localeCompare(b.toLowerCase())),
      validate: [{ type: validatorTypes.REQUIRED }],
      isSearchable: true,
      simpleValue: true,
      options: resolve.instance_names.map((name) => ({ label: name, value: name })),
      url,
    },
    {
      component: componentTypes.TEXT_FIELD,
      id: 'object_message',
      name: 'object_message',
      label: __('Message'),
      maxLength: maxNameLength,
      initialValue: resolve.new.object_message,
      isRequired: true,
    },

    {
      component: componentTypes.TEXT_FIELD,
      id: 'object_request',
      name: 'object_request',
      label: __('Request'),
      initialValue: resolve.new.object_request,
      validate: [{ type: validatorTypes.REQUIRED }],
    },

    {
      component: componentTypes.PLAIN_TEXT,
      id: 'object_attribute',
      name: 'object_attribute',
      label: __('Object Attribute'),
      style: { fontSize: '16px' },
    },

    {
      component: componentTypes.SELECT,
      id: 'target_class',
      name: 'target_class',
      label: __('Type'),
      options: typeClassesOptions,
      isSearchable: true,
      simpleValue: true,
      onChange: (targetClass) => setFormData({ ...formData, targetClass }),
      validate: [
        {
          type: validatorTypes.REQUIRED,
          condition: {
            not: {
              or: [
                {
                  when: 'target_class',
                  is: '-1',
                },
                {
                  when: 'target_class',
                  isEmpty: true,
                },
              ],
            },
          },
        },
      ],
    },

    {
      component: componentTypes.SELECT,
      id: 'selection_target',
      name: 'selection_target',
      label: __('Selection'),
      key: `selection_target_${formData.targetClass}`,
      loadOptions: () => (loadTargets(formData.targetClass)),
      condition: {
        not: {
          or: [
            {
              when: 'target_class',
              is: '-1',
            },
            {
              when: 'target_class',
              isEmpty: true,
            },
          ],
        },
      },
      validate: [
        {
          type: validatorTypes.REQUIRED,
          condition: {
            not: {
              or: [
                {
                  when: 'target_class',
                  is: '-1',
                },
                {
                  when: 'target_class',
                  isEmpty: true,
                },
              ],
            },
          },
        },
      ],
    },
    {
      id: 'simulationParameters',
      component: componentTypes.PLAIN_TEXT,
      name: 'simulationParameters',
      label: __('Simulation Parameters'),
      style: { fontSize: '16px' },
    },
    {
      component: componentTypes.CHECKBOX,
      id: 'readonly',
      name: 'readonly',
      label: __('Execute Methods'),
      initialValue: resolve.new.readonly !== true,
      title: 'Simulation parameters',
    },
    {
      id: 'AttributeValuePairs',
      component: componentTypes.PLAIN_TEXT,
      name: 'AttributeValuePairs',
      label: __('Attribute/Value Pairs'),
      style: { fontSize: '16px' },
    },
  ];

  if (!document.getElementById('description') && document.getElementById('object_message')) {
    document.getElementById('object_message').focus();
  }

  attrValuesPairs.forEach((_, i) => {
    const f = `attribute_${i + 1}`;
    const v = `value_${i + 1}`;
    const labelKey = `attributeValuePairLabel_${i + 1}`;

    const subForm = [
      {
        component: componentTypes.SUB_FORM,
        id: `subform_${i + 1}`,
        name: `subform_${i + 1}`,
        className: 'subform',
        fields: [
          {
            component: componentTypes.PLAIN_TEXT,
            id: labelKey,
            name: labelKey,
            className: 'attributeValuePairLabel',
            label: `${i + 1}`,
            style: { fontWeight: 'bold' },
          },
          {
            component: componentTypes.TEXT_FIELD,
            id: f,
            name: f,
            maxLength,
            label: ' ',
            fieldprops: {
              className: 'field-input',
              'data-miq_observe': JSON.stringify({ interval: '.5', url }),
            },
          },
          {
            component: componentTypes.TEXT_FIELD,
            id: v,
            name: v,
            maxLength,
            label: ' ',
            fieldprops: {
              className: 'value-input',
              'data-miq_observe': JSON.stringify({ interval: '.5', url }),
            },
          },
        ],
      },
    ];
    fields.push(subForm);
  });

  return {
    title: 'Object Details',
    fields,
  };
};

export default createSchema;
