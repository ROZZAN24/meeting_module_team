import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { useTheme } from '@mui/material/styles';
import { useColorScheme } from '@mui/material/styles';
import { getInputStyles } from './BOSStyles';
import { MobileTimePicker } from '@mui/x-date-pickers/MobileTimePicker';
import { parse, format } from 'date-fns';

const parseTimeStringToDate = (timeStr) => {
  if (!timeStr || timeStr === 'undefined' || timeStr === 'null' || typeof timeStr !== 'string') return null;
  try {
    const parsed = parse(timeStr.trim(), 'hh:mm a', new Date());
    if (isNaN(parsed.getTime())) {
      const fallbackParsed = parse(timeStr.trim(), 'HH:mm', new Date());
      if (!isNaN(fallbackParsed.getTime())) return fallbackParsed;
    }
    return parsed;
  } catch (e) {
    console.error('Failed to parse time string:', timeStr, e);
    return null;
  }
};

/**
 * BOSTimePicker
 * Wraps @mui/x-date-pickers/MobileTimePicker to show the analog clock selector.
 * Blocks manual typing and only allows time selection from the analog dial.
 */
export default function BOSTimePicker({ 
  label, 
  value, 
  onChange, 
  disabled, 
  required, 
  error, 
  helperText, 
  minTime, 
  maxTime, 
  name, 
  ...rest 
}) {
  const theme = useTheme();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const bosInput = getInputStyles(theme, isDark);

  const parsedValue = useMemo(() => {
    if (!value) return null;
    if (value instanceof Date) return value;
    return parseTimeStringToDate(value);
  }, [value]);

  const parsedMinTime = useMemo(() => {
    if (!minTime) return undefined;
    return parseTimeStringToDate(minTime) || undefined;
  }, [minTime]);

  const parsedMaxTime = useMemo(() => {
    if (!maxTime) return undefined;
    return parseTimeStringToDate(maxTime) || undefined;
  }, [maxTime]);

  const handlePickerChange = (newDate) => {
    if (!newDate || isNaN(newDate.getTime())) {
      onChange({ target: { name, value: '' } });
      return;
    }
    const formattedStr = format(newDate, 'hh:mm a'); // e.g. "07:00 AM"
    onChange({ target: { name, value: formattedStr } });
  };

  return (
    <MobileTimePicker
      label={`${label}${required ? ' *' : ''}`}
      value={parsedValue}
      onChange={handlePickerChange}
      disabled={disabled}
      minTime={parsedMinTime}
      maxTime={parsedMaxTime}
      slotProps={{
        textField: {
          size: 'small',
          fullWidth: true,
          error: !!error,
          helperText: helperText,
          name: name,
          autoComplete: 'off',
          inputProps: {
            readOnly: true
          },
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
            '& .MuiSvgIcon-root': {
              fontSize: '1.2rem !important'
            }
          }
        }
      }}
      {...rest}
    />
  );
}

BOSTimePicker.propTypes = {
  label: PropTypes.string,
  value: PropTypes.any,
  onChange: PropTypes.func,
  disabled: PropTypes.bool,
  required: PropTypes.bool,
  error: PropTypes.bool,
  helperText: PropTypes.string,
  name: PropTypes.string,
  minTime: PropTypes.string,
  maxTime: PropTypes.string
};
