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
      onChange={(newValue) => {
        if (newValue && isValid(newValue)) {
          const formatted = format(newValue, 'yyyy-MM-dd');
          onChange({ target: { name: rest.name, value: formatted } });
        } else if (newValue === null) {
          onChange({ target: { name: rest.name, value: '' } });
        }
      }}
      slotProps={{
        textField: {
          fullWidth: true,
          size: 'small',
          error: !!error,
          helperText: helperText,
          sx: { 
            ...bosInput,
            '& .MuiOutlinedInput-root': {
              ...bosInput['& .MuiOutlinedInput-root'],
              backgroundColor: isDark ? 'background.default !important' : '#fafafa !important',
              height: '38px !important',
              borderRadius: '12px !important',
              '& .MuiOutlinedInput-notchedOutline': {
                borderRadius: '12px !important',
                borderColor: 'divider !important',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: isDark ? '#8b949e !important' : `${theme.palette.primary.main} !important`,
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: isDark ? '#58a6ff !important' : `${theme.palette.primary.main} !important`,
                borderWidth: '2px !important',
              }
            },
            '& .MuiInputBase-input': { 
              cursor: 'text',
              paddingTop: '0px !important',
              paddingBottom: '0px !important',
              height: '38px !important',
              lineHeight: '38px !important',
              boxSizing: 'border-box !important',
              backgroundColor: 'transparent !important',
            },
            '& .MuiInputAdornment-root': {
              marginLeft: 0,
              height: '100% !important',
              alignSelf: 'center !important',
            },
            '& .MuiIconButton-root': {
              padding: '4px !important',
              marginRight: '-4px !important',
            },
            '& .MuiSvgIcon-root': {
              fontSize: '1.2rem !important'
            }
          },
          name: rest.name,
          autoComplete: 'off',
          ...rest
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
