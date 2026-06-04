import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { useTheme } from '@mui/material/styles';
import { useColorScheme } from '@mui/material/styles';
import { Select, MenuItem, Stack, Box, Typography } from '@mui/material';
import { parse } from 'date-fns';

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

const hoursOptions = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
const minutesOptions = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));
const periodOptions = ['AM', 'PM'];

/**
 * BOSTimePicker
 * Renders three custom inline select boxes for Hour, Minute, and AM/PM.
 * Provides a user-friendly and consistent desktop/mobile layout.
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

  // Parse the incoming value into local parts (hour, minute, ampm)
  const parts = useMemo(() => {
    let hh = '';
    let mm = '';
    let a = ''; // 'AM' or 'PM'

    if (value) {
      let dateObj = null;
      if (value instanceof Date) {
        dateObj = value;
      } else if (typeof value === 'string' && value.trim()) {
        dateObj = parseTimeStringToDate(value);
      }

      if (dateObj && !isNaN(dateObj.getTime())) {
        const hours24 = dateObj.getHours();
        const displayHour = hours24 % 12 || 12;
        hh = String(displayHour).padStart(2, '0');
        mm = String(dateObj.getMinutes()).padStart(2, '0');
        a = hours24 >= 12 ? 'PM' : 'AM';
      }
    }
    return { hh, mm, a };
  }, [value]);

  const handlePartChange = (field, newVal) => {
    const updated = {
      hh: field === 'hh' ? newVal : parts.hh,
      mm: field === 'mm' ? newVal : parts.mm,
      a: field === 'a' ? newVal : parts.a,
    };

    // Default other parts if one is selected and others are empty
    if (updated.hh && !updated.mm) updated.mm = '00';
    if (updated.hh && !updated.a) updated.a = 'AM';
    if (updated.mm && !updated.hh) updated.hh = '12';
    if (updated.mm && !updated.a) updated.a = 'AM';
    if (updated.a && !updated.hh) updated.hh = '12';
    if (updated.a && !updated.mm) updated.mm = '00';

    if (updated.hh && updated.mm && updated.a) {
      const formattedStr = `${updated.hh}:${updated.mm} ${updated.a}`;
      onChange({ target: { name, value: formattedStr } });
      
      // Auto-trigger onAccept if handler is provided
      if (onAccept) {
        const dateObj = parseTimeStringToDate(formattedStr);
        if (dateObj && !isNaN(dateObj.getTime())) {
          onAccept(dateObj);
        }
      }
    } else {
      onChange({ target: { name, value: '' } });
    }
  };

  const selectStyle = {
    height: '38px',
    borderRadius: '12px',
    backgroundColor: isDark ? 'background.default' : '#fafafa',
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: error ? 'error.main' : 'divider',
      borderRadius: '12px',
    },
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: isDark ? '#8b949e' : `${theme.palette.primary.main}`,
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: isDark ? '#58a6ff' : `${theme.palette.primary.main}`,
      borderWidth: '2px',
    },
    '& .MuiSelect-select': {
      py: '8px',
      px: '12px',
      fontSize: '0.875rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      {label && (
        <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.8, color: 'text.secondary', fontSize: '0.78rem' }}>
          {label} {required && <span style={{ color: 'red' }}>*</span>}
        </Typography>
      )}
      <Stack direction="row" alignItems="center" spacing={0.8}>
        <Select
          value={parts.hh || ''}
          onChange={(e) => handlePartChange('hh', e.target.value)}
          disabled={disabled}
          displayEmpty
          sx={{ ...selectStyle, width: '70px' }}
          MenuProps={{ PaperProps: { sx: { maxHeight: 200 } } }}
        >
          <MenuItem value="" disabled>00</MenuItem>
          {hoursOptions.map((h) => (
            <MenuItem key={h} value={h}>{h}</MenuItem>
          ))}
        </Select>

        <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>:</Typography>

        <Select
          value={parts.mm || ''}
          onChange={(e) => handlePartChange('mm', e.target.value)}
          disabled={disabled}
          displayEmpty
          sx={{ ...selectStyle, width: '70px' }}
          MenuProps={{ PaperProps: { sx: { maxHeight: 200 } } }}
        >
          <MenuItem value="" disabled>00</MenuItem>
          {minutesOptions.map((m) => (
            <MenuItem key={m} value={m}>{m}</MenuItem>
          ))}
        </Select>

        <Select
          value={parts.a || ''}
          onChange={(e) => handlePartChange('a', e.target.value)}
          disabled={disabled}
          displayEmpty
          sx={{ ...selectStyle, width: '85px' }}
        >
          <MenuItem value="" disabled>AM/PM</MenuItem>
          {periodOptions.map((p) => (
            <MenuItem key={p} value={p}>{p}</MenuItem>
          ))}
        </Select>
      </Stack>
      {helperText && (
        <Typography variant="caption" color={error ? 'error' : 'text.secondary'} sx={{ mt: 0.5 }}>
          {helperText}
        </Typography>
      )}
    </Box>
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
  maxTime: PropTypes.string,
  onAccept: PropTypes.func
};
