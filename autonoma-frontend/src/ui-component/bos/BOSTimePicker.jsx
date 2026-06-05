import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { MobileTimePicker } from '@mui/x-date-pickers/MobileTimePicker';
import { useTheme } from '@mui/material/styles';
import { useColorScheme } from '@mui/material/styles';
import { getInputStyles } from './BOSStyles';
import { parse, format, isValid } from 'date-fns';

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
 * Wraps MUI MobileTimePicker with standardized BOS styles and an analog clock dial face.
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
  onAccept,
  ...rest 
}) {
  const theme = useTheme();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const bosInput = getInputStyles(theme, isDark);

  // Convert string value to Date object for MUI TimePicker
  const dateValue = useMemo(() => {
    if (!value) return null;
    if (value instanceof Date) return value;
    return parseTimeStringToDate(value);
  }, [value]);

  const minTimeDate = useMemo(() => {
    if (!minTime) return undefined;
    if (minTime instanceof Date) return minTime;
    return parseTimeStringToDate(minTime) || undefined;
  }, [minTime]);

  const maxTimeDate = useMemo(() => {
    if (!maxTime) return undefined;
    if (maxTime instanceof Date) return maxTime;
    return parseTimeStringToDate(maxTime) || undefined;
  }, [maxTime]);

  return (
    <MobileTimePicker
      label={`${label}${required ? ' *' : ''}`}
      value={dateValue}
      disabled={disabled}
      minTime={minTimeDate}
      maxTime={maxTimeDate}
      onChange={(newValue) => {
        if (newValue && isValid(newValue)) {
          const formatted = format(newValue, 'hh:mm a');
          onChange({ target: { name, value: formatted } });
        } else if (newValue === null) {
          onChange({ target: { name, value: '' } });
        }
      }}
      onAccept={onAccept}
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
          name: name,
          autoComplete: 'off',
          ...rest
        }
      }}
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
  minTime: PropTypes.any,
  maxTime: PropTypes.any,
  onAccept: PropTypes.func
};



