import React, { useMemo, useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useTheme } from '@mui/material/styles';
import { useColorScheme } from '@mui/material/styles';
import { getInputStyles } from './BOSStyles';
import { TextField, Popover, Box, Stack, Typography, IconButton, InputAdornment } from '@mui/material';
import { IconClock } from '@tabler/icons-react';

const HOURS = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));
const MERIDIEMS = ['AM', 'PM'];

function WheelColumn({ items, value, onChange }) {
  const containerRef = useRef(null);
  const itemHeight = 40; // Height of each row in pixels
  const paddingRows = 2; // Number of empty rows for top/bottom padding
  const scrollTimeoutRef = useRef(null);
  
  const selectedIndex = items.indexOf(value);

  // Set initial scroll position to center the selected item
  useEffect(() => {
    if (containerRef.current && selectedIndex !== -1) {
      const targetScrollTop = selectedIndex * itemHeight;
      if (Math.abs(containerRef.current.scrollTop - targetScrollTop) > 1) {
        containerRef.current.scrollTop = targetScrollTop;
      }
    }
  }, [selectedIndex]);

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  const handleScroll = () => {
    if (!containerRef.current) return;
    
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    scrollTimeoutRef.current = setTimeout(() => {
      if (!containerRef.current) return;
      const scrollTop = containerRef.current.scrollTop;
      const index = Math.round(scrollTop / itemHeight);
      if (index >= 0 && index < items.length) {
        const newValue = items[index];
        if (newValue !== value) {
          onChange(newValue);
        }
      }
    }, 80); // Quick debounce for smooth interaction
  };

  const handleItemClick = (index) => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: index * itemHeight,
        behavior: 'smooth'
      });
      onChange(items[index]);
    }
  };

  return (
    <Box
      ref={containerRef}
      onScroll={handleScroll}
      sx={{
        height: `${itemHeight * (paddingRows * 2 + 1)}px`, // 5 rows total
        overflowY: 'auto',
        scrollSnapType: 'y mandatory',
        scrollbarWidth: 'none',
        '&::-webkit-scrollbar': { display: 'none' },
        width: '60px',
        position: 'relative',
        zIndex: 2
      }}
    >
      <Box sx={{ height: `${itemHeight * paddingRows}px` }} />
      {items.map((item, idx) => {
        const isSelected = item === value;
        return (
          <Box
            key={item}
            onClick={() => handleItemClick(idx)}
            sx={{
              height: `${itemHeight}px`,
              lineHeight: `${itemHeight}px`,
              textAlign: 'center',
              scrollSnapAlign: 'center',
              cursor: 'pointer',
              fontSize: isSelected ? '20px' : '16px',
              fontWeight: isSelected ? '700' : '500',
              color: isSelected ? 'primary.main' : 'text.secondary',
              opacity: isSelected ? 1 : 0.4,
              transition: 'all 0.15s ease',
              userSelect: 'none'
            }}
          >
            {item}
          </Box>
        );
      })}
      <Box sx={{ height: `${itemHeight * paddingRows}px` }} />
    </Box>
  );
}

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

/**
 * BOSTimePicker
 * Wraps custom scroll wheel popover with standardized BOS styles and 12-hour format ("hh:mm a").
 * Displays a clock icon on the right side, allows keyboard typing, and opens the wheel picker popover.
 */
export default function BOSTimePicker({ label, value, onChange, disabled, required, error, helperText, minTime, maxTime, name, ...rest }) {
  const theme = useTheme();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const bosInput = getInputStyles(theme, isDark);

  const [open, setOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const finalMinMins = useMemo(() => {
    const parsedMin = parseTimeToMinutes(minTime);
    const parsedMax = parseTimeToMinutes(maxTime);
    const minM = parsedMin !== null ? parsedMin : 0;
    const maxM = parsedMax !== null ? parsedMax : 1439;
    return Math.min(minM, maxM);
  }, [minTime, maxTime]);

  const finalMaxMins = useMemo(() => {
    const parsedMax = parseTimeToMinutes(maxTime);
    return parsedMax !== null ? parsedMax : 1439;
  }, [maxTime]);

  const cleanValue = !value || value === 'undefined' || value === 'null' ? '' : value;

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

  // Automatically clamp value if outside min/max range
  useEffect(() => {
    if (!cleanValue) return;
    const currentMins = parseTimeToMinutes(cleanValue);
    if (currentMins === null) return;

    if (currentMins < finalMinMins || currentMins > finalMaxMins) {
      const clampedMins = Math.max(finalMinMins, Math.min(finalMaxMins, currentMins));
      const parts = minutesToTimeParts(clampedMins);
      const formatted = `${String(parts.hour).padStart(2, '0')}:${parts.minute} ${parts.ampm}`;
      if (formatted !== cleanValue) {
        onChange({ target: { name, value: formatted } });
      }
    }
  }, [cleanValue, finalMinMins, finalMaxMins, onChange, name]);

  const allowedMeridiems = useMemo(() => {
    const list = [];
    if (finalMinMins < 720) list.push('AM');
    if (finalMaxMins >= 720) list.push('PM');
    return list.length > 0 ? list : ['PM'];
  }, [finalMinMins, finalMaxMins]);

  const allowedHours = useMemo(() => {
    const selectedAmpm = parsedTime.ampm;
    const allHours = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
    const filtered = allHours.filter(h => {
      const minPossible = timeToMinutes(h, 0, selectedAmpm);
      const maxPossible = timeToMinutes(h, 59, selectedAmpm);
      return Math.max(finalMinMins, minPossible) <= Math.min(finalMaxMins, maxPossible);
    });
    return filtered.length > 0 ? filtered : [12];
  }, [finalMinMins, finalMaxMins, parsedTime.ampm]);

  const allowedMinutes = useMemo(() => {
    const selectedAmpm = parsedTime.ampm;
    const selectedHour = parsedTime.hour;
    const allMinutes = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));
    const filtered = allMinutes.filter(mStr => {
      const m = parseInt(mStr, 10);
      const currentMins = timeToMinutes(selectedHour, m, selectedAmpm);
      return currentMins >= finalMinMins && currentMins <= finalMaxMins;
    });
    return filtered.length > 0 ? filtered : ['00'];
  }, [finalMinMins, finalMaxMins, parsedTime.ampm, parsedTime.hour]);

  const handleTimePartChange = (part, newVal) => {
    let { hour, minute, ampm } = parsedTime;
    if (part === 'hour') hour = newVal;
    if (part === 'minute') minute = newVal;
    if (part === 'ampm') ampm = newVal;

    const rawMins = timeToMinutes(hour, parseInt(minute, 10), ampm);
    const clampedMins = Math.max(finalMinMins, Math.min(finalMaxMins, rawMins));
    const parts = minutesToTimeParts(clampedMins);
    const formatted = `${String(parts.hour).padStart(2, '0')}:${parts.minute} ${parts.ampm}`;
    
    onChange({ target: { name, value: formatted } });
  };

  const handleIconClick = (e) => {
    setAnchorEl(e.currentTarget);
    setOpen(true);
  };

  return (
    <>
      <TextField
        label={`${label}${required ? ' *' : ''}`}
        value={cleanValue}
        disabled={disabled}
        onChange={onChange}
        size="small"
        fullWidth
        error={!!error}
        helperText={helperText}
        name={name}
        autoComplete="off"
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={handleIconClick} disabled={disabled} size="small" sx={{ p: '4px' }}>
                <IconClock size="20" stroke={1.5} />
              </IconButton>
            </InputAdornment>
          )
        }}
        sx={{ 
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
              p: 2,
              borderRadius: '16px',
              boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
              border: '1px solid',
              borderColor: 'divider',
              backgroundColor: 'background.paper',
              width: '240px'
            }
          }
        }}
      >
        <Typography variant="subtitle2" color="text.secondary" fontWeight={700} sx={{ letterSpacing: '0.5px', textTransform: 'uppercase', display: 'block', mb: 1.5, textAlign: 'center' }}>
          Select Time
        </Typography>

        <Box sx={{ position: 'relative', display: 'flex', gap: 1.5, alignItems: 'center', justifyContent: 'center', px: 1, py: 0.5 }}>
          {/* Central Highlight Selection Bar */}
          <Box
            sx={{
              position: 'absolute',
              left: 4,
              right: 4,
              top: '50%',
              transform: 'translateY(-50%)',
              height: '40px',
              borderRadius: '8px',
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)',
              pointerEvents: 'none',
              zIndex: 1,
              border: '1px solid',
              borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
            }}
          />

          {/* Hour Column */}
          <WheelColumn
            items={allowedHours}
            value={parsedTime.hour}
            onChange={(val) => handleTimePartChange('hour', val)}
          />

          <Typography variant="h3" sx={{ zIndex: 3, color: 'text.secondary', userSelect: 'none', px: 0.2 }}>:</Typography>

          {/* Minute Column */}
          <WheelColumn
            items={allowedMinutes}
            value={parsedTime.minute}
            onChange={(val) => handleTimePartChange('minute', val)}
          />

          {/* AM/PM Column */}
          <WheelColumn
            items={allowedMeridiems}
            value={parsedTime.ampm}
            onChange={(val) => handleTimePartChange('ampm', val)}
          />
        </Box>
      </Popover>
    </>
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
