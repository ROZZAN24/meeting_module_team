import PropTypes from 'prop-types';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useTheme } from '@mui/material/styles';
import { useColorScheme } from '@mui/material/styles';
import { getInputStyles } from './BOSStyles';

/**
 * BOS DatePicker — SOP #9, #10
 * Wraps MUI DatePicker with standardized BOS styles and dd/MM/yyyy format.
 */
export default function BOSDatePicker({ label, value, onChange, disabled, required, error, helperText, showIcon, ...rest }) {
  const theme = useTheme();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const bosInput = getInputStyles(theme, isDark);

  return (
    <DatePicker
      label={`${label}${required ? ' *' : ''}`}
      value={value ? new Date(value) : null}
      slots={!showIcon ? { 
        openPickerIcon: () => null,
        openPickerButton: () => null 
      } : undefined}
      onChange={(newValue) => {
        if (newValue) {
          const date = new Date(newValue);
          if (!isNaN(date.getTime())) {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const formatted = `${year}-${month}-${day}`;
            onChange({ target: { name: rest.name, value: formatted } });
          }
        } else {
          onChange({ target: { name: rest.name, value: '' } });
        }
      }}
      disabled={disabled}
      format="dd/MM/yyyy"
      slotProps={{
        textField: {
          fullWidth: true,
          size: 'small',
          error: !!error,
          helperText: helperText,
          sx: bosInput,
          ...rest
        }
      }}
      {...rest}
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
  name: PropTypes.string
};
