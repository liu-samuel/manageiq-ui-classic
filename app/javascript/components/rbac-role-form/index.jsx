import React, { useState, useEffect } from 'react';
import MiqFormRenderer from '@@ddf';
import PropTypes from 'prop-types';
import createSchema from './rbac-role-form.schema';
import miqRedirectBack from '../../helpers/miq-redirect-back';

const RbacRoleForm = ({ selectOptions, url, customProps }) => {
  const onSubmit = () => {
    http.post(url);
  };

  return (
    <div className="dialog-provision-form">
      <MiqFormRenderer
        schema={createSchema(selectOptions, customProps)}
        canSubmit
        canCancel
        canReset
        validate={() => {}}
      />
    </div>
  );
};

RbacRoleForm.propTypes = {
  selectOptions: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
  url: PropTypes.string,
  customProps: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
};

RbacRoleForm.defaultProps = {
  url: '',
};

export default RbacRoleForm;
