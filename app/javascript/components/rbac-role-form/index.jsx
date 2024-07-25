import React, { useState, useEffect } from 'react';
import MiqFormRenderer, { useFieldApi } from '@@ddf';
import PropTypes from 'prop-types';
import { Loading } from 'carbon-components-react';
import createSchema from './rbac-role-form.schema';
import miqRedirectBack from '../../helpers/miq-redirect-back';

const RbacRoleForm = ({
  selectOptions, url, getURL, customProps, role, rbacMenuTree,
}) => {
  // console.log(customProps.bs_tree);
  // const { input } = useFieldApi(customProps);
  const [formData, setFormData] = useState({
    isLoading: false,
    params: {},
    initialValues: {},
  });

  const isEdit = !!(role && role.id);

  useEffect(() => {
    if (formData.isLoading) {
      http.post(url, formData.params)
        .then(() => {
          const confirmation = isEdit ? __('Role Edited') : __('Role Created');
          miqRedirectBack(sprintf(confirmation), 'success', '/ops/explorer');
        })
        .catch((error) => console.log('error: ', error));
    } else if (isEdit) {
      http.get(`${getURL}/${role.id}`).then((roleValues) => {
        if (roleValues) {
          setFormData({ ...formData, isLoading: false, initialValues: roleValues });
        }
      });
    } else {
      const initialValues = {
        name: role.name !== null ? `Copy of ${role.name}` : '',
        vms: role && role.settings && role.settings.restrictions && role.settings.restrictions.vms,
        service_templates: role && role.settings && role.settings.restrictions && role.settings.restrictions.service_templates,
        // check: role.miq_product_features,
      };
      setFormData({ ...formData, isLoading: false, initialValues });
    }
  }, [formData.isLoading, role]);

  const onSubmit = (values) => {
    miqSparkleOn();

    const params = {
      name: values.name,
      vm_restriction: values.access_restriction_orchestration,
      service_template_restriction: values.access_restriction_catalog,
      check: '0',
    };

    setFormData({
      ...formData,
      isLoading: true,
      params,
    });
  };

  return (
    <div>
      {formData.isLoading ? (
        <div className="summary-spinner">
          <Loading active small withOverlay={false} className="loading" />
        </div>
      ) : (
        <div className="dialog-provision-form">
          <MiqFormRenderer
            schema={createSchema(selectOptions, customProps, formData.initialValues, rbacMenuTree, role)}
            onSubmit={onSubmit}
            canCancel
            canReset
            validate={() => {}}
          />
        </div>
      )}
    </div>
  );
};

RbacRoleForm.propTypes = {
  selectOptions: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.string.isRequired)).isRequired,
  url: PropTypes.string,
  getURL: PropTypes.string,
  customProps: PropTypes.oneOfType([PropTypes.string, PropTypes.object, PropTypes.array]).isRequired,
  role: PropTypes.shape({
    id: PropTypes.number,
    name: PropTypes.string,
    settings: PropTypes.shape({
      restrictions: PropTypes.shape({
        service_templates: PropTypes.string.isRequired,
        vms: PropTypes.string.isRequired,
      }),
    }),
  }),
};

RbacRoleForm.defaultProps = {
  url: '',
  getURL: '',
  role: undefined,
};

export default RbacRoleForm;
