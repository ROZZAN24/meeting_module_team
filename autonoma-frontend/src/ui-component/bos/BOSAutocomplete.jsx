import React from 'react';
import PropTypes from 'prop-types';
import { Autocomplete, Checkbox, Chip, Box, Typography, useTheme } from '@mui/material';
import { useColorScheme } from '@mui/material/styles';
import BOSTextField from './BOSTextField';

/**
 * Helper to get the display label of an option.
 */
const getLabelOf = (option) => {
  if (option === null || option === undefined) return '';
  if (typeof option === 'string') return option;
  if (typeof option === 'object') {
    return option.label || option.name || option.title || String(option);
  }
  return String(option);
};

/**
 * Helper to get the underlying value or ID of an option.
 */
const getValueOf = (option) => {
  if (option === null || option === undefined) return '';
  if (typeof option === 'string') return option;
  if (typeof option === 'object') {
    return option.value !== undefined ? option.value : (option.id !== undefined ? option.id : option);
  }
  return option;
};

/**
 * BOSAutocomplete — Enriched, Searchable and Premium Dropdown Component.
 * Supports:
 * - Single-select and Multi-select (`multiple={true}`)
 * - Checkboxes next to options in multi-select mode
 * - Integrated "Select All" toggle at the top of the multi-select dropdown
 * - Premium Chip tags for selected items
 * - Automatic primitive-to-object value resolution
 */
export default function BOSAutocomplete({
  label,
  name,
  value,
  options = [],
  onChange,
  multiple = false,
  required,
  disabled,
  error,
  helperText,
  sx,
  noOptionsText = 'No options',
  placeholder,
  size = 'small',
  getOptionLabel,
  ...rest
}) {
  const theme = useTheme();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Helper to resolve display label (respecting custom getOptionLabel prop)
  const getDisplayLabel = (option) => {
    if (option === null || option === undefined) return '';
    if (option === 'Select All' || (option && option.isSelectAll)) return 'Select All';
    if (getOptionLabel) {
      return getOptionLabel(option);
    }
    return getLabelOf(option);
  };

  // 1. Resolve raw/primitive value to corresponding option items
  const getResolvedValue = () => {
    if (value === undefined || value === null || value === '') return multiple ? [] : null;

    if (multiple) {
      if (!Array.isArray(value)) return [];
      return value.map(val => {
        const match = options.find(opt => getValueOf(opt) === getValueOf(val) || opt === val);
        return match !== undefined ? match : val;
      });
    } else {
      const match = options.find(opt => getValueOf(opt) === getValueOf(value) || opt === value);
      return match !== undefined ? match : value;
    }
  };

  const resolvedValue = getResolvedValue();

  // 2. Prepend a virtual "Select All" option when multiple is enabled
  const selectAllOption = options.length > 0 && typeof options[0] === 'object'
    ? { isSelectAll: true, label: 'Select All', value: 'SELECT_ALL' }
    : 'Select All';

  const autocompleteOptions = multiple && options.length > 0
    ? [selectAllOption, ...options]
    : options;

  // 3. Handle change event (with "Select All" logic & primitive formatting fallback)
  const handleValueChange = (newValue) => {
    if (!onChange) return;

    if (multiple) {
      const containsSelectAll = newValue.some(val => val === 'Select All' || (val && val.isSelectAll));
      let finalValues;

      if (containsSelectAll) {
        const allSelected = resolvedValue.length === options.length;
        finalValues = allSelected ? [] : options;
      } else {
        finalValues = newValue;
      }

      // Check if value is primitive or options are primitive to map output correctly
      const isPrimitiveArray = value && Array.isArray(value) && value.every(v => typeof v !== 'object');
      if (isPrimitiveArray || (options.length > 0 && typeof options[0] !== 'object')) {
        onChange(finalValues.map(val => getValueOf(val)));
      } else {
        onChange(finalValues);
      }
    } else {
      // Single select mapping
      const isPrimitive = value && typeof value !== 'object';
      if (isPrimitive || (options.length > 0 && typeof options[0] !== 'object')) {
        onChange(getValueOf(newValue));
      } else {
        onChange(newValue);
      }
    }
  };

  return (
    <Autocomplete
      multiple={multiple}
      fullWidth
      size={size}
      value={resolvedValue}
      options={autocompleteOptions}
      disabled={disabled}
      noOptionsText={noOptionsText}
      disableCloseOnSelect={multiple}
      onChange={(_, newValue) => handleValueChange(newValue)}
      isOptionEqualToValue={(option, val) => {
        if (option === val) return true;
        if (option && (option === 'Select All' || option.isSelectAll)) return false;
        if (val && (val === 'Select All' || val.isSelectAll)) return false;
        return getValueOf(option) === getValueOf(val);
      }}
      getOptionLabel={(option) => {
        return getDisplayLabel(option);
      }}
      renderOption={(props, option, { selected }) => {
        // Extract key from props if present to ensure proper list keying
        const { key, ...otherProps } = props;
        const isSelectAll = option && (option === 'Select All' || option.isSelectAll);

        if (isSelectAll) {
          const allSelected = options.length > 0 && resolvedValue.length === options.length;
          const someSelected = resolvedValue.length > 0 && resolvedValue.length < options.length;

          return (
            <li key={key || 'select-all'} {...otherProps} style={{ fontWeight: 600 }}>
              <Checkbox
                checked={allSelected}
                indeterminate={someSelected}
                size="small"
                sx={{ mr: 1 }}
              />
              Select All
            </li>
          );
        }

        const label = getDisplayLabel(option);
        return (
          <li key={key || getValueOf(option)} {...otherProps}>
            {multiple && (
              <Checkbox
                checked={selected}
                size="small"
                sx={{ mr: 1 }}
              />
            )}
            {label}
          </li>
        );
      }}
      renderTags={(tagValue, getTagProps) =>
        tagValue.map((option, index) => {
          const { key, ...otherProps } = getTagProps({ index });
          return (
            <Chip
              key={key || getValueOf(option)}
              label={getDisplayLabel(option)}
              size="small"
              variant="outlined"
              sx={{
                borderRadius: '8px',
                bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'primary.lighter',
                color: isDark ? 'primary.light' : 'primary.dark',
                borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'primary.light',
                fontWeight: 600,
                m: 0.5,
              }}
              {...otherProps}
            />
          );
        })
      }
      renderInput={(params) => (
        <BOSTextField
          {...params}
          label={label}
          name={name}
          required={required}
          error={error}
          helperText={helperText}
          placeholder={placeholder || (multiple ? 'Select options...' : 'Select option...')}
          sx={sx}
        />
      )}
      slotProps={{
        paper: {
          sx: {
            borderRadius: '16px',
            border: isDark ? '1px solid #30363d' : '1px solid rgba(0,0,0,0.08)',
            boxShadow: isDark ? '0 12px 32px rgba(0,0,0,0.5)' : '0 12px 32px rgba(0,0,0,0.1)',
            bgcolor: isDark ? '#161b22' : '#ffffff',
            mt: 0.5,
            '& .MuiAutocomplete-listbox': {
              p: 1,
              '& .MuiAutocomplete-option': {
                borderRadius: '8px',
                my: 0.25,
                transition: 'all 0.15s',
                '&[aria-selected="true"]': {
                  bgcolor: isDark ? 'rgba(88, 166, 255, 0.15) !important' : 'primary.lighter !important',
                  color: isDark ? '#58a6ff' : 'primary.main',
                  fontWeight: 600,
                },
                '&:hover': {
                  bgcolor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'grey.50',
                }
              }
            }
          }
        }
      }}
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
  multiple: PropTypes.bool,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
  error: PropTypes.bool,
  helperText: PropTypes.string,
  sx: PropTypes.object,
  noOptionsText: PropTypes.string,
  placeholder: PropTypes.string,
  size: PropTypes.string
};
