import PropTypes from 'prop-types';
import { TextField, useTheme } from '@mui/material';
import { useColorScheme } from '@mui/material/styles';
import { getInputStyles } from './BOSStyles';

/**
 * BOS TextField — SOP #9, #10, #13
 * Wraps MUI TextField with standardized BOS styles.
 * Handles mandatory (*) indicator, maxLength enforcement, and UTF-8 display.
 */
<<<<<<< HEAD
export default function BOSTextField({ error, helperText, maxLength, sx, inputProps, InputLabelProps, value, ...rest }) {
=======
export default function BOSTextField({ error, helperText, maxLength, sx, inputProps, ...rest }) {
>>>>>>> origin/chore/repo-cleanup
  const theme = useTheme();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const bosInput = getInputStyles(theme, isDark);

<<<<<<< HEAD
  // Auto-shrink label if value exists, or if explicitly told to shrink
  const shouldShrink = value !== undefined && value !== null && value !== '' ? true : undefined;

=======
>>>>>>> origin/chore/repo-cleanup
  return (
    <TextField
      fullWidth
      size="small"
      error={error}
      helperText={helperText}
<<<<<<< HEAD
      value={value}
      inputProps={{ maxLength, ...inputProps }}
      InputLabelProps={{ 
        shrink: shouldShrink !== undefined ? shouldShrink : InputLabelProps?.shrink, 
        ...InputLabelProps 
      }}
      sx={{ 
        ...bosInput, 
        ...sx 
      }}
=======
      inputProps={{ maxLength, ...inputProps }}
      sx={{ ...bosInput, ...sx }}
>>>>>>> origin/chore/repo-cleanup
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
