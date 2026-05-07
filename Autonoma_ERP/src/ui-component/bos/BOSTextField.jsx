import PropTypes from 'prop-types';
import { TextField, useTheme } from '@mui/material';
import { useColorScheme } from '@mui/material/styles';
import { getInputStyles } from './BOSStyles';

/**
 * BOS TextField — SOP #9, #10, #13
 * Wraps MUI TextField with standardized BOS styles.
 * Handles mandatory (*) indicator, maxLength enforcement, and UTF-8 display.
 */
export default function BOSTextField({ error, helperText, maxLength, sx, inputProps, ...rest }) {
  const theme = useTheme();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const bosInput = getInputStyles(theme, isDark);

  return (
    <TextField
      fullWidth
      size="small"
      error={error}
      helperText={helperText}
      inputProps={{ maxLength, ...inputProps }}
      sx={{ ...bosInput, ...sx }}
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
