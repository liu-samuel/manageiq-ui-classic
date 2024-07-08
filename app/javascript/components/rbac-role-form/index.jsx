import React, { useState, useEffect } from 'react';
import MiqFormRenderer from '@@ddf';
import PropTypes from 'prop-types';
import { Loading } from 'carbon-components-react';
import createSchema from './rbac-role-form.schema';
import miqRedirectBack from '../../helpers/miq-redirect-back';

const RbacRoleForm = ({ selectOptions, url, customProps, role }) => {
  console.log(url);
  const [formData, setFormData] = useState({
    isLoading: false,
  });

  useEffect(() => {
    if (formData.isLoading) {
      http.post(url, formData.tempData, {
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then((result) => {
          setFormData({
            ...formData,
            isLoading: false,
            simulationTree: result,
          });
        })
        .catch((error) => console.log('error: ', error));
    }
  }, [formData.isLoading]);

  const isEdit = !!(role && role.id);

  const onSubmit = (values) => {
    console.log(values);
    miqSparkleOn();

    const params = {
      name: values.name,
      access_restriction_orchestration: values.access_restriction_orchestration,
      access_restriction_catalog: values.access_restriction_catalog,
      check: '1',
    };

    const request = isEdit
      ? http.post(`${url}/${role.id}`, params)
      : http.post(url, params);

    request
      .then(() => {
        const confirmation = isEdit ? __('Role Edited') : __('Role Created');
        miqRedirectBack(sprintf(confirmation, values.name), 'success', '/ops/explorer');
      })
      .catch(miqSparkleOff);
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
            schema={createSchema(selectOptions, customProps)}
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
  customProps: PropTypes.oneOfType([PropTypes.string, PropTypes.object, PropTypes.array]).isRequired,
  role: PropTypes.shape({
    id: PropTypes.number,
    name: PropTypes.string,
  }),
};

RbacRoleForm.defaultProps = {
  url: '',
  role: undefined,
};

export default RbacRoleForm;
