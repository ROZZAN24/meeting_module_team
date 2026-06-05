import React, { forwardRef } from 'react';
import { TextField as MuiTextField } from '@mui/material';

const CustomTextField = forwardRef((props, ref) => {
  const { onChange, select, ...rest } = props;

  const handleChange = (e) => {
    const caseStyle = window.localStorage.getItem('inputCaseStyle') || 'CUSTOM';
    
    // Only transform if it's a string value, target is standard, and not a select dropdown
    if (!select && e && e.target && typeof e.target.value === 'string') {
      if (caseStyle === 'UPPER_CASE') {
        e.target.value = e.target.value.toUpperCase();
      } else if (caseStyle === 'LOWER_CASE') {
        e.target.value = e.target.value.toLowerCase();
      } else if (caseStyle === 'PROPER_CASE') {
        // Simple proper case transformation (capitalize first letter of each word)
        e.target.value = e.target.value.replace(/\b\w/g, c => c.toUpperCase());
      }
      // 'CUSTOM' or unrecognized means do nothing
    }

    if (onChange) {
      onChange(e);
    }
  };

  // Add the CSS text-transform to visually reflect it immediately, 
  // preventing a brief flash of lowercase before React updates
  const caseStyle = window.localStorage.getItem('inputCaseStyle') || 'CUSTOM';
  let textTransform = 'none';
  if (!select) {
    if (caseStyle === 'UPPER_CASE') textTransform = 'uppercase';
    if (caseStyle === 'LOWER_CASE') textTransform = 'lowercase';
    if (caseStyle === 'PROPER_CASE') textTransform = 'capitalize';
  }

  return (
    <MuiTextField
      ref={ref}
      select={select}
      onChange={handleChange}
      {...rest}
      inputProps={{
        ...rest.inputProps,
        style: {
          textTransform: textTransform,
          ...(rest.inputProps?.style || {})
        }
      }}
    />
  );
});

CustomTextField.displayName = 'CustomTextField';

export default CustomTextField;
