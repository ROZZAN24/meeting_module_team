import React from 'react';
import PropTypes from 'prop-types';
import { MenuItem } from '@mui/material';
import BOSTextField from './BOSTextField';

/**
 * BOSStatusField Component
 * Enforces standardized status behavior across all Autonoma ERP modules:
 * - During record creation (isCreate = true), the Status dropdown is replaced by a read-only, non-editable text field displaying "Active".
 * - During editing (isCreate = false), shows the editable dropdown to toggle status.
 */
export default function BOSStatusField({ 
  isCreate, 
  value, 
  onChange, 
  disabled = false, 
  type = 'string-capital', // 'boolean' | 'string-upper' | 'string-capital' | 'string-in-active' | 'string-in-active-no-space' | 'number'
  name = 'status',
  label = 'Status',
  children,
  ...rest
}) {
  let activeValue = 'Active';
  let inactiveValue = 'Inactive';
  let activeDisplay = 'Active';

  if (type === 'boolean') {
    activeValue = true;
    inactiveValue = false;
  } else if (type === 'string-upper') {
    activeValue = 'ACTIVE';
    inactiveValue = 'INACTIVE';
    activeDisplay = 'Active';
  } else if (type === 'string-in-active') {
    activeValue = 'Active';
    inactiveValue = 'In Active';
  } else if (type === 'string-in-active-no-space') {
    activeValue = 'Active';
    inactiveValue = 'InActive';
  } else if (type === 'number') {
    activeValue = 1;
    inactiveValue = 0;
  }

  if (isCreate) {
    return (
      <BOSTextField
        name={name}
        label={label}
        value={activeDisplay}
        disabled
        InputProps={{ readOnly: true }}
        {...rest}
      />
    );
  }

  return (
    <BOSTextField
      select
      name={name}
      label={label}
      value={value !== undefined && value !== null ? value : activeValue}
      onChange={onChange}
      disabled={disabled}
      {...rest}
    >
      {children || (
        [
          <MenuItem key="active" value={activeValue}>Active</MenuItem>,
          type === 'string-in-active' ? (
            <MenuItem key="inactive" value="In Active">In Active</MenuItem>
          ) : type === 'string-in-active-no-space' ? (
            <MenuItem key="inactive" value="InActive">InActive</MenuItem>
          ) : (
            <MenuItem key="inactive" value={inactiveValue}>{type === 'string-upper' ? 'INACTIVE' : 'Inactive'}</MenuItem>
          ),
          type === 'string-in-active' && name === 'status' && (
            <MenuItem key="suspended" value="Suspended">Suspended</MenuItem>
          )
        ]
      )}
    </BOSTextField>
  );
}

BOSStatusField.propTypes = {
  isCreate: PropTypes.bool.isRequired,
  value: PropTypes.any,
  onChange: PropTypes.func,
  disabled: PropTypes.bool,
  type: PropTypes.oneOf([
    'boolean',
    'string-upper',
    'string-capital',
    'string-in-active',
    'string-in-active-no-space',
    'number'
  ]),
  name: PropTypes.string,
  label: PropTypes.string,
  children: PropTypes.node
};
