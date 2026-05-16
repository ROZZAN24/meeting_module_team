import PropTypes from 'prop-types';
import { Autocomplete } from '@mui/material';
import BOSTextField from './BOSTextField';

/**
 * BOSAutocomplete — Searchable dropdown using BOS styling.
 * Drop-in replacement for <BOSTextField select> for static option lists.
 *
 * Usage:
 *   <BOSAutocomplete
 *     label="Status"
 *     name="status"
 *     value={form.status}
 *     options={['Active', 'Inactive']}
 *     onChange={(val) => setForm(p => ({ ...p, status: val || '' }))}
 *     required
 *   />
 */
export default function BOSAutocomplete({
  label,
  name,
  value,
  options = [],
  onChange,
  required,
  disabled,
  error,
  helperText,
  sx,
  noOptionsText = 'No options',
  placeholder,
  size = 'small',
  ...rest
}) {
  return (
    <Autocomplete
      fullWidth
      size={size}
      value={value || null}
      options={options}
      disabled={disabled}
      noOptionsText={noOptionsText}
      onChange={(_, newValue) => onChange(newValue || '')}
      isOptionEqualToValue={(option, val) => option === val}
      renderInput={(params) => (
        <BOSTextField
          {...params}
          label={label}
          name={name}
          required={required}
          error={error}
          helperText={helperText}
          placeholder={placeholder}
          sx={sx}
        />
      )}
      {...rest}
    />
  );
}

BOSAutocomplete.propTypes = {
  label: PropTypes.string.isRequired,
  name: PropTypes.string,
  value: PropTypes.any,
  options: PropTypes.arrayOf(PropTypes.any).isRequired,
  onChange: PropTypes.func.isRequired,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
  error: PropTypes.bool,
  helperText: PropTypes.string,
  sx: PropTypes.object,
  noOptionsText: PropTypes.string,
  placeholder: PropTypes.string,
  size: PropTypes.string
};
