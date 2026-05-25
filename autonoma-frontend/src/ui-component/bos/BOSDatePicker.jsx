import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useTheme } from '@mui/material/styles';
import { useColorScheme } from '@mui/material/styles';
import { getInputStyles } from './BOSStyles';
import { parseISO, format, isValid } from 'date-fns';

/**
 * BOS DatePicker — SOP #9, #10
 * Wraps MUI DatePicker with standardized BOS styles and dd/MM/yyyy format.
 */
export default function BOSDatePicker({ label, value, onChange, disabled, required, error, helperText, showIcon = false, minDate, maxDate, ...rest }) {
  const theme = useTheme();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const bosInput = getInputStyles(theme, isDark);
  const [open, setOpen] = React.useState(false);

  // Convert string value to Date object for MUI DatePicker
  const dateValue = useMemo(() => {
    if (!value) return null;
    const date = parseISO(value);
    return isValid(date) ? date : null;
  }, [value]);

  return (
    <DatePicker
      label={`${label}${required ? ' *' : ''}`}
      value={dateValue}
      disabled={disabled}
      minDate={minDate}
      maxDate={maxDate}
      format="dd/MM/yyyy"
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      onChange={(newValue) => {
        if (newValue && isValid(newValue)) {
          const formatted = format(newValue, 'yyyy-MM-dd');
          onChange({ target: { name: rest.name, value: formatted } });
        } else if (newValue === null) {
          onChange({ target: { name: rest.name, value: '' } });
        }
      }}
      slots={{
        openPickerIcon: () => null,
      }}
      slotProps={{
        textField: {
          fullWidth: true,
          size: 'small',
          error: !!error,
          helperText: helperText,
          sx: { 
            ...bosInput,
            '& .MuiInputBase-input': { cursor: 'pointer' }
          },
          name: rest.name,
          autoComplete: 'off',
          onClick: () => !disabled && setOpen(true),
          ...rest
        },
        openPickerButton: {
          sx: { display: 'none' }
        }
      }}
    />
  );
}

BOSDatePicker.propTypes = {
  label: PropTypes.string,
  value: PropTypes.any,
  onChange: PropTypes.func,
  disabled: PropTypes.bool,
  required: PropTypes.bool,
  error: PropTypes.bool,
  helperText: PropTypes.string,
  name: PropTypes.string,
  showIcon: PropTypes.bool,
  minDate: PropTypes.any,
  maxDate: PropTypes.any
};
