import React, { useState, useRef, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useTheme } from '@mui/material/styles';
import { useColorScheme } from '@mui/material/styles';
import { getInputStyles } from './BOSStyles';
import { TextField, Popover, Box, Stack, Typography, IconButton, InputAdornment, Button } from '@mui/material';
import { IconClock } from '@tabler/icons-react';

const parseTimeToMinutes = (timeStr) => {
  if (!timeStr) return null;
  const clean = timeStr.trim().toUpperCase();
  const match = clean.match(/^(\d{1,2}):(\d{2})(?:\s*(AM|PM))?$/);
  if (!match) return null;
  let h = parseInt(match[1], 10);
  const m = parseInt(match[2], 10);
  const ampm = match[3] || 'AM';
  if (h < 1 || h > 12 || m < 0 || m > 59) return null;
  if (ampm === 'PM' && h !== 12) h += 12;
  if (ampm === 'AM' && h === 12) h = 0;
  return h * 60 + m;
};

const minutesToTimeParts = (totalMins) => {
  let h24 = Math.floor(totalMins / 60) % 24;
  let m = totalMins % 60;
  const ampm = h24 >= 12 ? 'PM' : 'AM';
  let h12 = h24 % 12;
  if (h12 === 0) h12 = 12;
  return {
    hour: h12,
    minute: String(m).padStart(2, '0'),
    ampm
  };
};

const timeToMinutes = (h, m, ampm) => {
  let hrs = parseInt(h, 10);
  const mins = parseInt(m, 10);
  if (ampm === 'PM' && hrs !== 12) hrs += 12;
  if (ampm === 'AM' && hrs === 12) hrs = 0;
  return hrs * 60 + mins;
};

const getLocalDateString = (dateInput) => {
  let d;
  if (!dateInput) {
    d = new Date();
  } else if (typeof dateInput === 'string') {
    // Handle YYYY-MM-DD
    const parts = dateInput.split('T')[0].split('-');
    if (parts.length === 3) {
      d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    } else {
      d = new Date(dateInput);
    }
  } else {
    d = new Date(dateInput);
  }
  
  if (isNaN(d.getTime())) d = new Date();

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function BOSAnalogTimePicker({
  label,
  value,
  onChange,
  disabled,
  required,
  error,
  helperText,
  name,
  selectedDate,
  minTime,
  minTimeMessage,
  disableFutureValidation = false,
  hideClockIcon = false,
  ...rest
}) {
  const theme = useTheme();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const bosInput = getInputStyles(theme, isDark);

  const [open, setOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [mode, setMode] = useState('hours'); // 'hours' or 'minutes'
  const [validationError, setValidationError] = useState('');

  const dialRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const cleanValue = !value || value === 'undefined' || value === 'null' ? '' : value;

  // Initialize selected components
  const parsedTime = useMemo(() => {
    if (!cleanValue) {
      const now = new Date();
      let h = now.getHours() % 12 || 12;
      return {
        hour: h,
        minute: String(now.getMinutes()).padStart(2, '0'),
        ampm: now.getHours() >= 12 ? 'PM' : 'AM'
      };
    }
    try {
      const parts = cleanValue.split(' ');
      const timeParts = parts[0].split(':');
      let h = parseInt(timeParts[0], 10);
      let m = parseInt(timeParts[1], 10);
      const meridiem = parts[1] || 'AM';

      if (isNaN(h) || h < 1 || h > 12) h = 12;
      if (isNaN(m) || m < 0 || m > 59) m = 0;

      return {
        hour: h,
        minute: String(m).padStart(2, '0'),
        ampm: meridiem === 'PM' ? 'PM' : 'AM'
      };
    } catch (e) {
      return { hour: 12, minute: '00', ampm: 'AM' };
    }
  }, [cleanValue]);

  // Keep internal state updated with parsedTime
  const [selectedHour, setSelectedHour] = useState(parsedTime.hour);
  const [selectedMinute, setSelectedMinute] = useState(parseInt(parsedTime.minute, 10));
  const [selectedAmpm, setSelectedAmpm] = useState(parsedTime.ampm);

  useEffect(() => {
    setSelectedHour(parsedTime.hour);
    setSelectedMinute(parseInt(parsedTime.minute, 10));
    setSelectedAmpm(parsedTime.ampm);
    setValidationError('');
  }, [parsedTime, open]);

  // Global mouseUp listener for dragging release
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
        if (mode === 'hours') {
          // Switch to minutes selection automatically
          setMode('minutes');
        }
      }
    };
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, [isDragging, mode]);

  const handleDialInteraction = (e) => {
    if (!dialRef.current) return;
    const rect = dialRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    
    // Calculate angle in degrees (0 is top/12 o'clock)
    let angle = Math.atan2(y, x) * (180 / Math.PI) + 90;
    if (angle < 0) angle += 360;

    if (mode === 'hours') {
      let hr = Math.round(angle / 30);
      if (hr === 0) hr = 12;
      setSelectedHour(hr);
    } else {
      let min = Math.round(angle / 6);
      if (min === 60) min = 0;
      setSelectedMinute(min);
    }
    setValidationError('');
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    handleDialInteraction(e);
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      handleDialInteraction(e);
    }
  };

  const validateTimeSelection = (hr, min, ampm) => {
    let checkH = parseInt(hr, 10);
    if (ampm === 'PM' && checkH !== 12) checkH += 12;
    if (ampm === 'AM' && checkH === 12) checkH = 0;
    
    const checkM = parseInt(min, 10);
    const selectedMinutes = checkH * 60 + checkM;

    // 1. MinTime check (applies to both today and future dates if minTime is set)
    if (minTime) {
      const minMins = parseTimeToMinutes(minTime);
      if (minMins !== null && selectedMinutes < minMins) {
        return { valid: false, reason: 'minTime' };
      }
    }

    // 2. Today's date check (must be at least 15 minutes in the future)
    if (!disableFutureValidation) {
      const todayStr = getLocalDateString(new Date());
      const targetDateStr = getLocalDateString(selectedDate);
      
      if (targetDateStr === todayStr) {
        const now = new Date();
        const currentMinutes = now.getHours() * 60 + now.getMinutes();

        // Must be at least 15 minutes in the future
        if (selectedMinutes < currentMinutes + 15) {
          return { valid: false, reason: 'future15' };
        }
      }
    }
    return { valid: true };
  };

  const handleConfirm = () => {
    const result = validateTimeSelection(selectedHour, selectedMinute, selectedAmpm);
    if (!result.valid) {
      if (result.reason === 'minTime') {
        setValidationError(minTimeMessage || `Time must be after ${minTime}.`);
      } else {
        setValidationError('You must choose a time at least 15 minutes in the future.');
      }
      return;
    }

    const formattedTime = `${String(selectedHour).padStart(2, '0')}:${String(selectedMinute).padStart(2, '0')} ${selectedAmpm}`;
    onChange({ target: { name, value: formattedTime } });
    setOpen(false);
  };

  const handleIconClick = (e) => {
    setAnchorEl(e.currentTarget);
    setMode('hours');
    setOpen(true);
  };

  // Math coordinates for placing numbers on the dial
  const getNumberCoordinates = (index, radius = 80) => {
    const angle = ((index * 30 - 90) * Math.PI) / 180;
    const x = 110 + radius * Math.cos(angle);
    const y = 110 + radius * Math.sin(angle);
    return { x, y };
  };

  const rotationAngle = mode === 'hours' ? (selectedHour % 12) * 30 : selectedMinute * 6;

  return (
    <>
      <TextField
        label={label ? `${label}${required ? ' *' : ''}` : undefined}
        value={cleanValue}
        disabled={disabled}
        readOnly
        onClick={handleIconClick}
        size="small"
        fullWidth
        error={!!error}
        helperText={helperText}
        name={name}
        autoComplete="off"
        InputProps={{
          endAdornment: (disabled || hideClockIcon) ? null : (
            <InputAdornment position="end">
              <IconButton onClick={handleIconClick} disabled={disabled} size="small" sx={{ p: '4px' }}>
                <IconClock size="20" stroke={1.5} />
              </IconButton>
            </InputAdornment>
          )
        }}
        sx={{
          ...bosInput,
          cursor: 'pointer',
          '& .MuiOutlinedInput-root': {
            ...bosInput['& .MuiOutlinedInput-root'],
            backgroundColor: isDark ? 'background.default !important' : '#fafafa !important',
            height: '38px !important',
            borderRadius: '12px !important',
            cursor: 'pointer',
            '& input': { cursor: 'pointer' },
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
          }
        }}
        {...rest}
      />

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={() => setOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          paper: {
            sx: {
              p: 2.5,
              borderRadius: '24px',
              boxShadow: '0 12px 40px rgba(0,0,0,0.2)',
              border: '1px solid',
              borderColor: 'divider',
              backgroundColor: 'background.paper',
              width: '270px',
              overflow: 'hidden'
            }
          }
        }}
      >
        <Stack spacing={2} alignItems="center">
          {/* Header Time Display */}
          <Stack direction="row" spacing={1} alignItems="center" justifyContent="center" sx={{ width: '100%' }}>
            <Stack direction="row" spacing={0.5} sx={{ bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'grey.100', borderRadius: '12px', p: 0.5 }}>
              <Button
                variant={mode === 'hours' ? 'contained' : 'text'}
                size="small"
                color="primary"
                onClick={() => setMode('hours')}
                sx={{ minWidth: '40px', borderRadius: '8px', fontWeight: 700 }}
              >
                {String(selectedHour).padStart(2, '0')}
              </Button>
              <Typography variant="h4" alignSelf="center" sx={{ color: 'text.secondary', px: 0.5 }}>:</Typography>
              <Button
                variant={mode === 'minutes' ? 'contained' : 'text'}
                size="small"
                color="primary"
                onClick={() => setMode('minutes')}
                sx={{ minWidth: '40px', borderRadius: '8px', fontWeight: 700 }}
              >
                {String(selectedMinute).padStart(2, '0')}
              </Button>
            </Stack>

            <Stack direction="row" spacing={0.5} sx={{ bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'grey.100', borderRadius: '12px', p: 0.5 }}>
              <Button
                variant={selectedAmpm === 'AM' ? 'contained' : 'text'}
                size="small"
                color="primary"
                onClick={() => { setSelectedAmpm('AM'); setValidationError(''); }}
                sx={{ minWidth: '35px', borderRadius: '8px', fontWeight: 700, fontSize: '0.75rem' }}
              >
                AM
              </Button>
              <Button
                variant={selectedAmpm === 'PM' ? 'contained' : 'text'}
                size="small"
                color="primary"
                onClick={() => { setSelectedAmpm('PM'); setValidationError(''); }}
                sx={{ minWidth: '35px', borderRadius: '8px', fontWeight: 700, fontSize: '0.75rem' }}
              >
                PM
              </Button>
            </Stack>
          </Stack>

          {/* Analog Clock Dial */}
          <Box
            ref={dialRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            sx={{
              width: '220px',
              height: '220px',
              borderRadius: '50%',
              bgcolor: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.03)',
              position: 'relative',
              cursor: 'pointer',
              userSelect: 'none',
              border: '2px solid',
              borderColor: 'divider',
              touchAction: 'none'
            }}
          >
            {/* Center dot */}
            <Box
              sx={{
                position: 'absolute',
                top: '107px',
                left: '107px',
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                bgcolor: 'primary.main',
                zIndex: 4
              }}
            />

            {/* Hand */}
            <Box
              sx={{
                position: 'absolute',
                bottom: '110px',
                left: '109px',
                width: '2px',
                height: '75px',
                bgcolor: 'primary.main',
                transformOrigin: 'bottom center',
                transform: `rotate(${rotationAngle}deg)`,
                zIndex: 2,
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  top: '-4px',
                  left: '-4px',
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  bgcolor: 'primary.main'
                }
              }}
            />

            {/* Numbers around the clock face */}
            {mode === 'hours' ? (
              [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((hr, idx) => {
                const { x, y } = getNumberCoordinates(idx, 80);
                const isSelected = selectedHour === hr;
                return (
                  <Box
                    key={`hr-${hr}`}
                    sx={{
                      position: 'absolute',
                      left: `${x - 14}px`,
                      top: `${y - 14}px`,
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.85rem',
                      fontWeight: isSelected ? 800 : 500,
                      bgcolor: isSelected ? 'primary.main' : 'transparent',
                      color: isSelected ? '#fff' : 'text.primary',
                      transition: 'all 0.15s ease',
                      zIndex: 3
                    }}
                  >
                    {hr}
                  </Box>
                );
              })
            ) : (
              [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55].map((min, idx) => {
                const { x, y } = getNumberCoordinates(idx, 80);
                // Highlight if selected minute matches or is close
                const isSelected = Math.round(selectedMinute / 5) * 5 === min;
                return (
                  <Box
                    key={`min-${min}`}
                    sx={{
                      position: 'absolute',
                      left: `${x - 14}px`,
                      top: `${y - 14}px`,
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.85rem',
                      fontWeight: isSelected ? 800 : 500,
                      bgcolor: isSelected ? 'primary.main' : 'transparent',
                      color: isSelected ? '#fff' : 'text.primary',
                      transition: 'all 0.15s ease',
                      zIndex: 3
                    }}
                  >
                    {String(min).padStart(2, '0')}
                  </Box>
                );
              })
            )}
          </Box>

          {/* Validation Error Message */}
          {validationError && (
            <Typography
              variant="caption"
              color="error"
              align="center"
              sx={{ fontWeight: 600, display: 'block', px: 1, lineHeight: '1.2' }}
            >
              {validationError}
            </Typography>
          )}

          {/* Action Buttons */}
          <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ width: '100%', pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
            <Button size="small" variant="outlined" color="secondary" onClick={() => setOpen(false)} sx={{ borderRadius: '8px' }}>
              Cancel
            </Button>
            <Button size="small" variant="contained" color="secondary" onClick={handleConfirm} sx={{ borderRadius: '8px' }}>
              Confirm
            </Button>
          </Stack>
        </Stack>
      </Popover>
    </>
  );
}

BOSAnalogTimePicker.propTypes = {
  label: PropTypes.string,
  value: PropTypes.any,
  onChange: PropTypes.func,
  disabled: PropTypes.bool,
  required: PropTypes.bool,
  error: PropTypes.bool,
  helperText: PropTypes.string,
  name: PropTypes.string,
  selectedDate: PropTypes.string,
  minTime: PropTypes.string,
  minTimeMessage: PropTypes.string,
  disableFutureValidation: PropTypes.bool,
  hideClockIcon: PropTypes.bool
};
