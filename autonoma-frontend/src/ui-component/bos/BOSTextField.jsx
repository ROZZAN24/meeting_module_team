import PropTypes from 'prop-types';
import { TextField, useTheme } from '@mui/material';
import { useColorScheme } from '@mui/material/styles';
import { getInputStyles } from './BOSStyles';

/**
 * BOS TextField — SOP #9, #10, #13
 * Wraps MUI TextField with standardized BOS styles.
 * Handles mandatory (*) indicator, maxLength enforcement, and UTF-8 display.
 */
export default function BOSTextField({ error, helperText, maxLength, sx, inputProps, InputLabelProps, value, type, ...rest }) {
  const theme = useTheme();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const bosInput = getInputStyles(theme, isDark);

  const isDateType = type === 'date' || type === 'datetime-local';

  // Auto-shrink label if value exists, if it's a date type, or if explicitly told to shrink
  const shouldShrink = isDateType || (value !== undefined && value !== null && value !== '') ? true : undefined;

  // Date inputs: show the native calendar picker icon; non-date inputs: hide it
  const calendarStyles = isDateType
    ? {
        '& input::-webkit-calendar-picker-indicator': {
          cursor: 'pointer',
          opacity: 0.6,
          '&:hover': { opacity: 1 }
        }
      }
    : {
        '& input::-webkit-calendar-picker-indicator': {
          display: 'none',
          webkitAppearance: 'none'
        }
      };

  return (
    <TextField
      fullWidth
      size="small"
      type={type}
      error={error}
      helperText={helperText}
      value={value}
      inputProps={{ maxLength, ...inputProps }}
      InputLabelProps={{ 
        shrink: shouldShrink !== undefined ? shouldShrink : InputLabelProps?.shrink, 
        ...InputLabelProps 
      }}
      sx={{ 
        ...bosInput, 
        ...calendarStyles,
        ...sx 
      }}
      {...rest}
    />
  );
}

BOSTextField.propTypes = {
  error: PropTypes.bool,
  helperText: PropTypes.string,
  maxLength: PropTypes.number,
  sx: PropTypes.object,
  inputProps: PropTypes.object
};
