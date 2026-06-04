import React, { useMemo, useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useTheme } from '@mui/material/styles';
import { useColorScheme } from '@mui/material/styles';
import { getInputStyles } from './BOSStyles';
import { TextField, Popover, Box, Typography, IconButton, InputAdornment } from '@mui/material';
import { IconClock } from '@tabler/icons-react';

const HOURS_12 = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
const HOURS_24 = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));
const MERIDIEMS = ['AM', 'PM'];

function WheelColumn({ items, value, onChange }) {
  const containerRef = useRef(null);
  const itemHeight = 40;
  const paddingRows = 2;
  const scrollTimeoutRef = useRef(null);

  // Convert to string for comparison since 24h hours are strings, 12h hours are numbers
  const strValue = String(value);
  const selectedIndex = items.findIndex(item => String(item) === strValue);

  useEffect(() => {
    if (containerRef.current && selectedIndex !== -1) {
      const targetScrollTop = selectedIndex * itemHeight;
      if (Math.abs(containerRef.current.scrollTop - targetScrollTop) > 1) {
        containerRef.current.scrollTop = targetScrollTop;
      }
    }
  }, [selectedIndex]);

  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, []);

  const handleScroll = () => {
    if (!containerRef.current) return;
    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    scrollTimeoutRef.current = setTimeout(() => {
      if (!containerRef.current) return;
      const scrollTop = containerRef.current.scrollTop;
      const index = Math.round(scrollTop / itemHeight);
      if (index >= 0 && index < items.length) {
        const newValue = items[index];
        if (String(newValue) !== strValue) onChange(newValue);
      }
    }, 80);
  };

  const handleItemClick = (index) => {
    if (containerRef.current) {
      containerRef.current.scrollTo({ top: index * itemHeight, behavior: 'smooth' });
      onChange(items[index]);
    }
  };

  return (
    <Box
      ref={containerRef}
      onScroll={handleScroll}
      sx={{
        height: `${itemHeight * (paddingRows * 2 + 1)}px`,
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
        const isSelected = String(item) === strValue;
        return (
          <Box
            key={String(item)}
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

// ── helpers ──────────────────────────────────────────────────────────────────

/** Parse a time string to total minutes.
 *  Accepts "HH:MM" (24-h) or "hh:mm AM/PM" (12-h). */
const parseTimeToMinutes = (timeStr) => {
  if (!timeStr) return null;
  const clean = timeStr.trim().toUpperCase();
  const match = clean.match(/^(\d{1,2}):(\d{2})(?:\s*(AM|PM))?$/);
  if (!match) return null;
  let h = parseInt(match[1], 10);
  const m = parseInt(match[2], 10);
  const ampm = match[3]; // undefined when no meridiem (24-h input)

  if (ampm) {
    // 12-hour input
    if (h < 1 || h > 12 || m < 0 || m > 59) return null;
    if (ampm === 'PM' && h !== 12) h += 12;
    if (ampm === 'AM' && h === 12) h = 0;
  } else {
    // 24-hour input
    if (h < 0 || h > 23 || m < 0 || m > 59) return null;
  }
  return h * 60 + m;
};

const minutesToTimeParts12 = (totalMins) => {
  const h24 = Math.floor(totalMins / 60) % 24;
  const m = totalMins % 60;
  const ampm = h24 >= 12 ? 'PM' : 'AM';
  let h12 = h24 % 12;
  if (h12 === 0) h12 = 12;
  return { hour: h12, minute: String(m).padStart(2, '0'), ampm };
};

const minutesToTimeParts24 = (totalMins) => {
  const h = Math.floor(totalMins / 60) % 24;
  const m = totalMins % 60;
  return { hour: String(h).padStart(2, '0'), minute: String(m).padStart(2, '0') };
};

/** Convert 12-h components to minutes */
const timeToMinutes12 = (h, m, ampm) => {
  let hrs = parseInt(h, 10);
  const mins = parseInt(m, 10);
  if (ampm === 'PM' && hrs !== 12) hrs += 12;
  if (ampm === 'AM' && hrs === 12) hrs = 0;
  return hrs * 60 + mins;
};

/** Convert 24-h components to minutes */
const timeToMinutes24 = (h, m) => parseInt(h, 10) * 60 + parseInt(m, 10);

// ── component ─────────────────────────────────────────────────────────────────

/**
 * BOSTimePicker
 *
 * Props:
 *   format24h {bool} – When true, shows a 24-hour wheel (00-23) without AM/PM column
 *                      and emits values in "HH:MM" format.
 *                      When false/omitted, uses the original 12-hour wheel with AM/PM
 *                      and emits values in "hh:mm AM/PM" format.
 *
 *   minTime / maxTime – Accept both "HH:MM" (24-h) and "hh:mm AM/PM" (12-h) regardless of mode.
 */
export default function BOSTimePicker({
  label, value, onChange, disabled, required,
  error, helperText, minTime, maxTime, name,
  format24h = false,
  ...rest
}) {
  const theme = useTheme();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const bosInput = getInputStyles(theme, isDark);

  const [open, setOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  // ── range limits ──────────────────────────────────────────────────────────
  const finalMinMins = useMemo(() => {
    const parsedMin = parseTimeToMinutes(minTime);
    const parsedMax = parseTimeToMinutes(maxTime);
    const minM = parsedMin !== null ? parsedMin : 0;
    const maxM = parsedMax !== null ? parsedMax : 1439;
    return Math.min(minM, maxM);
  }, [minTime, maxTime]);

  const finalMaxMins = useMemo(() => {
    const parsed = parseTimeToMinutes(maxTime);
    return parsed !== null ? parsed : 1439;
  }, [maxTime]);

  // ── clean value ───────────────────────────────────────────────────────────
  const cleanValue = !value || value === 'undefined' || value === 'null' ? '' : value;

  // ── parse incoming value into picker state ────────────────────────────────
  const parsedTime = useMemo(() => {
    if (format24h) {
      // 24-hour mode: value is "HH:MM" or empty
      if (!cleanValue) {
        const now = new Date();
        return {
          hour: String(now.getHours()).padStart(2, '0'),
          minute: String(now.getMinutes()).padStart(2, '0')
        };
      }
      try {
        const [hStr, mStr] = cleanValue.split(':');
        let h = parseInt(hStr, 10);
        let m = parseInt(mStr, 10);
        if (isNaN(h) || h < 0 || h > 23) h = 9;
        if (isNaN(m) || m < 0 || m > 59) m = 0;
        return { hour: String(h).padStart(2, '0'), minute: String(m).padStart(2, '0') };
      } catch {
        return { hour: '09', minute: '00' };
      }
    } else {
      // 12-hour mode (original behaviour)
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
        return { hour: h, minute: String(m).padStart(2, '0'), ampm: meridiem === 'PM' ? 'PM' : 'AM' };
      } catch {
        return { hour: 12, minute: '00', ampm: 'AM' };
      }
    }
  }, [cleanValue, format24h]);

  // ── clamp value if outside min/max ────────────────────────────────────────
  useEffect(() => {
    if (!cleanValue) return;
    const currentMins = parseTimeToMinutes(cleanValue);
    if (currentMins === null) return;
    if (currentMins < finalMinMins || currentMins > finalMaxMins) {
      const clampedMins = Math.max(finalMinMins, Math.min(finalMaxMins, currentMins));
      let formatted;
      if (format24h) {
        const p = minutesToTimeParts24(clampedMins);
        formatted = `${p.hour}:${p.minute}`;
      } else {
        const p = minutesToTimeParts12(clampedMins);
        formatted = `${String(p.hour).padStart(2, '0')}:${p.minute} ${p.ampm}`;
      }
      if (formatted !== cleanValue) onChange({ target: { name, value: formatted } });
    }
  }, [cleanValue, finalMinMins, finalMaxMins, onChange, name, format24h]);

  // ── allowed items ─────────────────────────────────────────────────────────
  const allowedHours24 = useMemo(() => {
    return HOURS_24.filter(hStr => {
      const h = parseInt(hStr, 10);
      const minPossible = h * 60;
      const maxPossible = h * 60 + 59;
      return Math.max(finalMinMins, minPossible) <= Math.min(finalMaxMins, maxPossible);
    });
  }, [finalMinMins, finalMaxMins]);

  const allowedHours12 = useMemo(() => {
    const selectedAmpm = parsedTime.ampm;
    return HOURS_12.filter(h => {
      const minPossible = timeToMinutes12(h, 0, selectedAmpm);
      const maxPossible = timeToMinutes12(h, 59, selectedAmpm);
      return Math.max(finalMinMins, minPossible) <= Math.min(finalMaxMins, maxPossible);
    });
  }, [finalMinMins, finalMaxMins, parsedTime.ampm]);

  const allowedMeridiems = useMemo(() => {
    const list = [];
    if (finalMinMins < 720) list.push('AM');
    if (finalMaxMins >= 720) list.push('PM');
    return list.length > 0 ? list : ['PM'];
  }, [finalMinMins, finalMaxMins]);

  const allowedMinutes = useMemo(() => {
    if (format24h) {
      const selectedHour = parsedTime.hour;
      return MINUTES.filter(mStr => {
        const m = parseInt(mStr, 10);
        const currentMins = timeToMinutes24(selectedHour, m);
        return currentMins >= finalMinMins && currentMins <= finalMaxMins;
      });
    } else {
      const selectedAmpm = parsedTime.ampm;
      const selectedHour = parsedTime.hour;
      return MINUTES.filter(mStr => {
        const m = parseInt(mStr, 10);
        const currentMins = timeToMinutes12(selectedHour, m, selectedAmpm);
        return currentMins >= finalMinMins && currentMins <= finalMaxMins;
      });
    }
  }, [finalMinMins, finalMaxMins, parsedTime.ampm, parsedTime.hour, format24h]);

  // ── change handler ────────────────────────────────────────────────────────
  const handleTimePartChange = (part, newVal) => {
    if (format24h) {
      let { hour, minute } = parsedTime;
      if (part === 'hour') hour = newVal;
      if (part === 'minute') minute = newVal;
      const rawMins = timeToMinutes24(hour, minute);
      const clampedMins = Math.max(finalMinMins, Math.min(finalMaxMins, rawMins));
      const p = minutesToTimeParts24(clampedMins);
      onChange({ target: { name, value: `${p.hour}:${p.minute}` } });
    } else {
      let { hour, minute, ampm } = parsedTime;
      if (part === 'hour') hour = newVal;
      if (part === 'minute') minute = newVal;
      if (part === 'ampm') ampm = newVal;
      const rawMins = timeToMinutes12(hour, parseInt(minute, 10), ampm);
      const clampedMins = Math.max(finalMinMins, Math.min(finalMaxMins, rawMins));
      const p = minutesToTimeParts12(clampedMins);
      onChange({ target: { name, value: `${String(p.hour).padStart(2, '0')}:${p.minute} ${p.ampm}` } });
    }
  };

  const handleIconClick = (e) => {
    setAnchorEl(e.currentTarget);
    setOpen(true);
  };

  // ── render ────────────────────────────────────────────────────────────────
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
              width: format24h ? '180px' : '240px'
            }
          }
        }}
      >
        <Typography
          variant="subtitle2"
          color="text.secondary"
          fontWeight={700}
          sx={{ letterSpacing: '0.5px', textTransform: 'uppercase', display: 'block', mb: 1.5, textAlign: 'center' }}
        >
          {format24h ? 'Select Time (24h)' : 'Select Time'}
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
            items={format24h ? allowedHours24 : allowedHours12}
            value={parsedTime.hour}
            onChange={(val) => handleTimePartChange('hour', val)}
          />

          <Typography variant="h3" sx={{ zIndex: 3, color: 'text.secondary', userSelect: 'none', px: 0.2 }}>:</Typography>

          {/* Minute Column */}
          <WheelColumn
            items={allowedMinutes.length > 0 ? allowedMinutes : MINUTES}
            value={parsedTime.minute}
            onChange={(val) => handleTimePartChange('minute', val)}
          />

          {/* AM/PM Column — 12-hour mode only */}
          {!format24h && (
            <WheelColumn
              items={allowedMeridiems}
              value={parsedTime.ampm}
              onChange={(val) => handleTimePartChange('ampm', val)}
            />
          )}
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
  maxTime: PropTypes.string,
  format24h: PropTypes.bool
};
