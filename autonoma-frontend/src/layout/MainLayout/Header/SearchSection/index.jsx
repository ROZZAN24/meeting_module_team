import PropTypes from 'prop-types';
import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

// material-ui
import { useTheme } from '@mui/material/styles';
import Avatar from '@mui/material/Avatar';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import InputAdornment from '@mui/material/InputAdornment';
import OutlinedInput from '@mui/material/OutlinedInput';
import Popper from '@mui/material/Popper';
import Box from '@mui/material/Box';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import { Divider, MenuItem, Select, Button, Stack, Popover, Checkbox, FormControlLabel, Tooltip } from '@mui/material';

// third party
import PopupState, { bindPopper, bindToggle } from 'material-ui-popup-state';

// project imports
import Transitions from 'ui-component/extended/Transitions';
import { useDispatch, useSelector } from 'react-redux';
import { setQuery, setFilters, resetFilters, setFilterPreferences } from 'store/slices/search';
import { openSnackbar } from 'store/slices/snackbar';

// assets
import { IconSearch, IconX, IconAdjustmentsHorizontal, IconFilter, IconCheck, IconPlus, IconRefresh, IconMicrophone } from '@tabler/icons-react';

function HeaderAvatar({ children, ...others }) {
  const theme = useTheme();

  return (
    <Avatar
      variant="rounded"
      sx={{
        ...theme.typography.commonAvatar,
        ...theme.typography.mediumAvatar,
        color: theme.vars.palette.secondary.dark,
        background: theme.vars.palette.secondary.light,
        '&:hover': {
          color: theme.vars.palette.secondary.light,
          background: theme.vars.palette.secondary.dark
        },

        ...theme.applyStyles('dark', {
          color: theme.vars.palette.secondary.main,
          background: theme.vars.palette.dark.main,
          '&:hover': {
            color: theme.vars.palette.secondary.light,
            background: theme.vars.palette.secondary.main
          }
        })
      }}
      {...others}
    >
      {children}
    </Avatar>
  );
}

// ==============================|| SEARCH INPUT - MOBILE||============================== //

function MobileSearch({ value, setValue, popupState, placeholder }) {
  const theme = useTheme();

  return (
    <OutlinedInput
      id="input-search-header-mobile"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      placeholder={placeholder || 'Search in current page...'}
      startAdornment={
        <InputAdornment position="start">
          <IconSearch stroke={1.5} size="16px" />
        </InputAdornment>
      }
      endAdornment={
        <InputAdornment position="end">
          <Box sx={{ ml: 2 }}>
            <Avatar
              variant="rounded"
              sx={{
                ...theme.typography.commonAvatar,
                ...theme.typography.mediumAvatar,
                bgcolor: 'orange.light',
                color: 'orange.dark',
                '&:hover': { bgcolor: 'orange.dark', color: 'orange.light' },

                ...theme.applyStyles('dark', { bgcolor: theme.vars.palette.dark.main })
              }}
              {...bindToggle(popupState)}
            >
              <IconX stroke={1.5} size="20px" />
            </Avatar>
          </Box>
        </InputAdornment>
      }
      aria-describedby="search-helper-text"
      sx={{ width: '100%', ml: 0.5, px: 2, bgcolor: 'background.paper' }}
    />
  );
}

// ==============================|| SEARCH INPUT ||============================== //

export default function SearchSection() {
  const dispatch = useDispatch();
  const location = useLocation();
  const value = useSelector((state) => state.search.query);
  const filters = useSelector((state) => state.search.filters);
  const searchConfig = useSelector((state) => state.search.config);
  const tableConfig = useSelector((state) => state.search.tableConfig);

  const [isFocused, setIsFocused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);
  const [advancedAnchorEl, setAdvancedAnchorEl] = useState(null);
  const [visibleFilterIds, setVisibleFilterIds] = useState([]);
  const [addFilterAnchorEl, setAddFilterAnchorEl] = useState(null);
  const [tempSelectedIds, setTempSelectedIds] = useState([]);
  const isAddFilterOpen = Boolean(addFilterAnchorEl);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recog = new SpeechRecognition();
    recog.continuous = false;
    recog.interimResults = false;
    recog.lang = 'en-US';

    recog.onstart = () => setIsListening(true);

    recog.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      if (transcript) {
        const cleaned = transcript
          .replace(/^[.,\/#!$%\^&\*;:{}=\-_`~()?"']+|[.,\/#!$%\^&\*;:{}=\-_`~()?"']+$/g, '')
          .trim();
        dispatch(setQuery(cleaned));
      }
      setIsListening(false);
    };

    recog.onerror = (event) => {
      console.error('Global search mic error', event.error);
      setIsListening(false);

      let errorMsg = 'Error during voice recognition. Please try again.';
      if (event.error === 'not-allowed') {
        errorMsg = 'Microphone permission denied. Please allow microphone access in your browser address bar/settings.';
      } else if (event.error === 'no-speech') {
        errorMsg = 'No speech detected. Please speak clearly into the microphone.';
      } else if (event.error === 'network') {
        errorMsg = 'Network error. Speech recognition requires an active internet connection.';
      } else if (event.error === 'audio-capture') {
        errorMsg = 'No microphone detected. Please connect a mic and try again.';
      }

      dispatch(
        openSnackbar({
          open: true,
          message: errorMsg,
          variant: 'alert',
          alert: { variant: 'filled' },
          severity: event.error === 'no-speech' ? 'info' : 'error',
          close: false
        })
      );
    };

    recog.onend = () => setIsListening(false);

    recognitionRef.current = recog;

    return () => {
      recog.onstart = null;
      recog.onresult = null;
      recog.onerror = null;
      recog.onend = null;
      try { recog.abort(); } catch (_) {}
      recognitionRef.current = null;
    };
  }, [dispatch]);

  const handleMicClick = useCallback((e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    const recog = recognitionRef.current;
    if (isListening) {
      if (recog) recog.stop();
    } else {
      if (recog) {
        try { recog.start(); } catch (err) { console.warn('Mic start error:', err); }
      } else {
        dispatch(
          openSnackbar({
            open: true,
            message: 'Speech Recognition is not supported by your browser.',
            variant: 'alert',
            alert: { variant: 'filled' },
            severity: 'warning',
            close: false
          })
        );
      }
    }
  }, [isListening, dispatch]);

  const anchorRef = useRef(null);
  const isAdvancedOpen = Boolean(advancedAnchorEl);

  const handleOpenAddFilter = (event) => {
    setTempSelectedIds([...visibleFilterIds]);
    setAddFilterAnchorEl(event.currentTarget);
  };

  const handleCloseAddFilter = () => {
    setAddFilterAnchorEl(null);
  };

  const handleApplyAddFilter = () => {
    updateVisibleFilters(tempSelectedIds);
    handleCloseAddFilter();
  };

  const combinedConfig = useMemo(() => {
    const baseConfig = Array.isArray(searchConfig) ? searchConfig : [];
    const list = [...baseConfig];
    if (Array.isArray(tableConfig)) {
      tableConfig.forEach(col => {
        if (!col || col.id === 'index' || col.id === 'photo' || col.id === 'actions') return;
        if (!list.find(f => f && f.id === col.id)) {
          list.push({ 
            id: col.id, 
            label: col.label || col.id, 
            type: col.options && col.options.length > 0 ? 'autocomplete' : 'text', 
            isRequired: col.required,
            options: col.options || []
          });
        }
      });
    }
    return list;
  }, [searchConfig, tableConfig]);

  const handleAdvancedClick = () => {
    setAdvancedAnchorEl(advancedAnchorEl ? null : anchorRef.current);
  };

  const handleAdvancedClose = () => {
    setAdvancedAnchorEl(null);
  };

  const setValue = (val) => {
    dispatch(setQuery(val));
  };

  const currentPrefs = useSelector((state) => state.search.preferences[location.pathname]);

  useEffect(() => {
    if (combinedConfig && combinedConfig.length > 0) {
      // Always start from the starred defaults for this filterConfig
      const starredDefaults = combinedConfig.filter(f => f.isStarred || f.isRequired).map(f => f.id);

      // If user has saved prefs, merge them: starred always show + user's extras
      if (currentPrefs !== undefined) {
        // Keep starred visible, plus any extra filters the user has manually added
        const extras = currentPrefs.filter(id => !starredDefaults.includes(id));
        setVisibleFilterIds([...starredDefaults, ...extras]);
      } else {
        if (starredDefaults.length > 0) {
          setVisibleFilterIds(starredDefaults);
        } else {
          const firstTwo = combinedConfig.slice(0, 2).map(f => f.id);
          setVisibleFilterIds(firstTwo);
        }
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [combinedConfig, location.pathname, currentPrefs]);

  const updateVisibleFilters = (newIds) => {
    setVisibleFilterIds(newIds);
    dispatch(setFilterPreferences({ path: location.pathname, visibleIds: newIds }));
  };

  const handleFilterChange = (key, val) => {
    dispatch(setFilters({ [key]: val }));
  };

  let searchPlaceholder = 'Search in current page...';
  if (searchConfig && searchConfig.length > 0) searchPlaceholder = 'Search with filters...';

  return (
    <>
      <Box sx={{ display: { xs: 'block', md: 'none' } }}>
        <PopupState variant="popper" popupId="demo-popup-popper">
          {(popupState) => (
            <>
              <Box sx={{ ml: 2 }}>
                <HeaderAvatar {...bindToggle(popupState)}>
                  <IconSearch stroke={1.5} size="19.2px" />
                </HeaderAvatar>
              </Box>
              <Popper
                {...bindPopper(popupState)}
                transition
                sx={{ zIndex: 1100, width: '99%', top: '-55px !important', px: { xs: 1.25, sm: 1.5 } }}
              >
                {({ TransitionProps }) => (
                  <Transitions type="zoom" {...TransitionProps} sx={{ transformOrigin: 'center left' }}>
                    <Card sx={{ bgcolor: 'background.default', border: 0, boxShadow: 'none' }}>
                      <Box sx={{ p: 2 }}>
                        <MobileSearch value={value} setValue={setValue} popupState={popupState} placeholder="Search in current page..." />
                      </Box>
                    </Card>
                  </Transitions>
                )}
              </Popper>
            </>
          )}
        </PopupState>
      </Box>

      <Box
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        sx={{
          display: { xs: 'none', md: 'block' },
          width: '100%',
          maxWidth: isFocused ? 600 : 400,
          transition: 'all 0.3s ease-in-out'
        }}
      >
        <TextField
          fullWidth
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={searchPlaceholder}
          variant="outlined"
          size="small"
          sx={{
            '& .MuiOutlinedInput-root': {
              bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)'),
              borderRadius: 2,
              '&:hover': {
                bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)')
              },
              '&.Mui-focused': {
                bgcolor: 'background.paper',
                boxShadow: (theme) => `0 4px 12px ${theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.1)'}`,
                borderColor: 'primary.main'
              }
            },
            '& .MuiOutlinedInput-notchedOutline': { border: 'none' }
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start" sx={{ pl: 1 }}>
                <IconSearch stroke={1.5} size="18px" />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <Stack direction="row" spacing={0.5} alignItems="center">
                  {value && (
                    <IconButton size="small" onClick={() => setValue('')} sx={{ p: 0.5 }}>
                      <IconX stroke={1.5} size="16px" />
                    </IconButton>
                  )}
                  <Divider orientation="vertical" flexItem sx={{ mx: 0.5, height: 20, alignSelf: 'center' }} />
                  <Tooltip title="Voice Search Page Content" placement="top" arrow>
                    <IconButton
                      size="small"
                      onClick={handleMicClick}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                      }}
                      onPointerDown={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                      }}
                      onTouchStart={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                      }}
                      sx={{
                        p: 0.5,
                        opacity: isHovered || isFocused || isListening ? 1 : 0,
                        visibility: isHovered || isFocused || isListening ? 'visible' : 'hidden',
                        transition: 'all 0.2s ease-in-out',
                        color: isListening ? 'error.main' : 'text.secondary',
                        animation: isListening ? 'globalPulse 1.5s infinite ease-in-out' : 'none',
                        '@keyframes globalPulse': {
                          '0%': { opacity: 0.6 },
                          '50%': { opacity: 1 },
                          '100%': { opacity: 0.6 }
                        },
                        '&:hover': { color: 'primary.main' }
                      }}
                    >
                      <IconMicrophone stroke={1.5} size="20px" />
                    </IconButton>
                  </Tooltip>
                  <IconButton
                    size="small"
                    ref={anchorRef}
                    onClick={handleAdvancedClick}
                    sx={{
                      p: 0.5,
                      opacity: isHovered || isFocused || isAdvancedOpen ? 1 : 0,
                      visibility: isHovered || isFocused || isAdvancedOpen ? 'visible' : 'hidden',
                      transition: 'all 0.2s ease-in-out',
                      color: isAdvancedOpen ? 'primary.main' : 'text.secondary',
                      '&:hover': { color: 'primary.main' }
                    }}
                  >
                    <IconFilter stroke={1.5} size="20px" />
                  </IconButton>
                  <Popover
                    open={isAdvancedOpen}
                    anchorEl={advancedAnchorEl}
                    onClose={handleAdvancedClose}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                    slotProps={{
                      paper: {
                        sx: {
                          mt: 1.2, width: 420, maxHeight: '80vh', display: 'flex', flexDirection: 'column',
                          boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                          borderRadius: 2, border: '1px solid', borderColor: 'divider', overflow: 'hidden'
                        }
                      }
                    }}
                  >
                    <Box sx={{ filter: isAddFilterOpen ? 'blur(2.5px)' : 'none', transition: 'filter 0.25s ease', display: 'flex', flexDirection: 'column', flexGrow: 1, minHeight: 0, overflow: 'hidden' }}>
                      <Box sx={{
                        p: 2,
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                        display: 'flex',
                        alignItems: 'center',
                        background: (theme) => theme.palette.mode === 'dark' ? 'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(0,0,0,0.2))' : 'linear-gradient(135deg, #f8f9fa, #ffffff)'
                      }}>
                        <Box sx={{
                          p: 0.8,
                          borderRadius: '10px',
                          background: (theme) => `linear-gradient(135deg, ${theme.palette.primary.light}, ${theme.palette.primary.main})`,
                          color: '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          mr: 1.5
                        }}>
                          <IconAdjustmentsHorizontal size={18} />
                        </Box>
                        <Typography variant="subtitle1" fontWeight={800} sx={{ flexGrow: 1, letterSpacing: '-0.3px' }}>
                          Filter Criteria
                        </Typography>
                        <IconButton size="small" onClick={handleAdvancedClose} sx={{
                          transition: 'all 0.2s',
                          '&:hover': { transform: 'rotate(90deg)', bgcolor: 'action.hover' }
                        }}>
                          <IconX size={16} />
                        </IconButton>
                      </Box>

                      <Box sx={{ p: 2.5, overflowY: 'auto', flexGrow: 1, minHeight: 0 }}>
                        <Stack spacing={2.2}>
                          {combinedConfig?.filter(f => f && (f.isConstant || (Array.isArray(visibleFilterIds) && visibleFilterIds.includes(f.id)))).map((field) => (
                            <Stack spacing={0.6} key={field.id}>
                              <Typography variant="caption" color="text.primary" fontWeight={700} sx={{ textTransform: 'uppercase', fontSize: '0.68rem', letterSpacing: '0.5px', opacity: 0.85 }}>
                                {field.label} {field.isRequired && '*'}
                              </Typography>
                              {field.type === 'autocomplete' ? (
                                <Autocomplete
                                  multiple={field.multiple}
                                  size="small"
                                  options={field.options || []}
                                  getOptionLabel={(option) => (typeof option === 'string' ? option : option.label)}
                                  value={
                                    field.multiple 
                                      ? (field.options || []).filter(opt => (filters[field.id] || []).includes(opt.value))
                                      : (field.options || []).find(opt => opt.value === filters[field.id]) || null
                                  }
                                  onChange={(e, newVal) => {
                                    const val = field.multiple 
                                      ? (newVal || []).map(v => typeof v === 'object' ? v.value : v)
                                      : (newVal && typeof newVal === 'object' ? newVal.value : newVal);
                                    handleFilterChange(field.id, val);
                                  }}
                                  renderInput={(params) => (
                                    <TextField {...params} variant="outlined" placeholder={`Select ${field.label}...`} />
                                  )}
                                  sx={{
                                    '& .MuiOutlinedInput-root': { borderRadius: '10px', transition: 'all 0.2s', '&:hover': { bgcolor: 'action.hover' } },
                                    '& .MuiAutocomplete-tag': { borderRadius: '6px', fontWeight: 600 }
                                  }}
                                />
                              ) : field.type === 'select' ? (
                                <Select
                                  fullWidth size="small"
                                  variant="outlined"
                                  value={filters[field.id] || field.defaultValue || 'All'}
                                  onChange={(e) => handleFilterChange(field.id, e.target.value)}
                                  sx={{ borderRadius: '10px', fontWeight: 500, transition: 'all 0.2s', '&:hover': { bgcolor: 'action.hover' } }}
                                >
                                  {field.options.map((opt) => (
                                    <MenuItem key={opt.value} value={opt.value} sx={{ fontWeight: 500, borderRadius: '6px', my: 0.2, mx: 0.5 }}>
                                      {opt.label}
                                    </MenuItem>
                                  ))}
                                </Select>
                              ) : field.type === 'dateRange' ? (
                                <Stack direction="row" spacing={1} alignItems="center">
                                  <TextField
                                    type="date"
                                    fullWidth size="small"
                                    variant="outlined"
                                    value={filters[`${field.id}Start`] || ''}
                                    onChange={(e) => handleFilterChange(`${field.id}Start`, e.target.value)}
                                    slotProps={{ inputLabel: { shrink: true } }}
                                    inputProps={{ min: new Date().toISOString().split('T')[0] }}
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', transition: 'all 0.2s', '&:hover': { bgcolor: 'action.hover' } } }}
                                  />
                                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>to</Typography>
                                  <TextField
                                    type="date"
                                    fullWidth size="small"
                                    variant="outlined"
                                    value={filters[`${field.id}End`] || ''}
                                    onChange={(e) => handleFilterChange(`${field.id}End`, e.target.value)}
                                    slotProps={{ inputLabel: { shrink: true } }}
                                    inputProps={{ min: new Date().toISOString().split('T')[0] }}
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', transition: 'all 0.2s', '&:hover': { bgcolor: 'action.hover' } } }}
                                  />
                                </Stack>
                              ) : field.type === 'date' ? (
                                <TextField
                                  type="date"
                                  fullWidth size="small"
                                  variant="outlined"
                                  value={filters[field.id] || ''}
                                  onChange={(e) => handleFilterChange(field.id, e.target.value)}
                                  slotProps={{ inputLabel: { shrink: true } }}
                                  inputProps={{ min: new Date().toISOString().split('T')[0] }}
                                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', transition: 'all 0.2s', '&:hover': { bgcolor: 'action.hover' } } }}
                                />
                              ) : (
                                <TextField
                                  fullWidth size="small"
                                  variant="outlined"
                                  value={filters[field.id] || ''}
                                  onChange={(e) => handleFilterChange(field.id, e.target.value)}
                                  placeholder={`Enter ${field.label.toLowerCase()}...`}
                                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', transition: 'all 0.2s', '&:hover': { bgcolor: 'action.hover' } } }}
                                />
                              )}
                            </Stack>
                          ))}
                        </Stack>
                      </Box>

                      <Box sx={{
                        p: 2,
                        borderTop: '1px solid',
                        borderColor: 'divider',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        background: (theme) => theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.15)' : 'rgba(0,0,0,0.02)'
                      }}>
                        <Box>
                          <Button
                            variant="text"
                            size="small"
                            startIcon={<IconPlus size={16} />}
                            onClick={handleOpenAddFilter}
                            sx={{ borderRadius: '10px', fontWeight: 700, px: 1.5, color: 'primary.main', '&:hover': { bgcolor: 'primary.light', color: 'primary.dark' } }}
                          >
                            Add Filter
                          </Button>
                          <Popover
                            open={isAddFilterOpen}
                            anchorEl={addFilterAnchorEl}
                            onClose={handleCloseAddFilter}
                            anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
                            transformOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                            slotProps={{
                              paper: {
                                sx: {
                                  p: 1.5,
                                  boxShadow: (theme) => `0 12px 30px ${theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.9)' : 'rgba(0,0,0,0.15)'}`,
                                  border: '1px solid',
                                  borderColor: 'divider',
                                  width: 360,
                                  mb: 1,
                                  borderRadius: '16px',
                                  backdropFilter: 'blur(16px)',
                                  bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(30, 32, 40, 0.95)' : 'rgba(255, 255, 255, 0.95)'
                                }
                              }
                            }}
                          >
                            <Stack spacing={1.5}>
                              <Stack spacing={1}>
                                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ px: 0.5 }}>
                                  <Typography variant="caption" sx={{ fontWeight: 800, color: 'primary.main', fontSize: '0.65rem', letterSpacing: '0.6px' }}>
                                    DYNAMIC DATA COLUMNS
                                  </Typography>
                                  <IconButton size="small" onClick={handleCloseAddFilter} sx={{ p: 0.2, color: 'text.secondary', '&:hover': { color: 'text.primary', bgcolor: 'action.hover' } }}>
                                    <IconX size={14} />
                                  </IconButton>
                                </Stack>
                                <Divider sx={{ my: '4px !important' }} />
                                <Box sx={{ maxHeight: 240, overflowY: 'auto', overflowX: 'hidden' }}>
                                  <Grid container spacing={0}>
                                    {combinedConfig?.filter(field => !field.isConstant).map((field) => (
                                      <Grid size={6} key={field.id}>
                                        <FormControlLabel
                                          sx={{ m: 0, px: 1, py: 0.5, width: '100%', borderRadius: '8px', transition: 'all 0.15s', '&:hover': { bgcolor: 'action.hover' } }}
                                          control={
                                            <Checkbox
                                              size="small"
                                              checked={tempSelectedIds.includes(field.id)}
                                              onChange={(e) => {
                                                if (e.target.checked) {
                                                  setTempSelectedIds([...tempSelectedIds, field.id]);
                                                } else {
                                                  setTempSelectedIds(tempSelectedIds.filter(id => id !== field.id));
                                                }
                                              }}
                                              sx={{ p: 0.5, mr: 0.5 }}
                                            />
                                          }
                                          label={
                                            <Typography variant="caption" sx={{ fontSize: '0.75rem', fontWeight: field.isRequired ? 800 : 600, color: field.isRequired ? 'primary.main' : 'inherit', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                              {field.label} {field.isRequired && '*'}
                                            </Typography>
                                          }
                                        />
                                      </Grid>
                                    ))}
                                  </Grid>
                                </Box>
                              </Stack>
                              <Divider sx={{ my: '0px !important' }} />
                              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ px: 0.5, pt: 0.5, gap: 1 }}>
                                <Button
                                  variant="outlined"
                                  color="inherit"
                                  size="small"
                                  startIcon={<IconRefresh size={14} />}
                                  onClick={() => {
                                    // Reset to Rule 2 Defaults (Required fields)
                                    const defaults = combinedConfig.filter(f => f.isStarred || f.isRequired).map(f => f.id);
                                    setTempSelectedIds(defaults.length > 0 ? defaults : combinedConfig.slice(0, 2).map(f => f.id));
                                  }}
                                  sx={{ borderRadius: '8px', fontWeight: 600, fontSize: '0.75rem', px: 1.5, py: 0.4, border: '1px solid', borderColor: 'text.disabled' }}
                                >
                                  Reset
                                </Button>
                                <Button
                                  variant="contained"
                                  color="primary"
                                  size="small"
                                  startIcon={<IconCheck size={14} />}
                                  onClick={handleApplyAddFilter}
                                  sx={{ borderRadius: '8px', fontWeight: 700, fontSize: '0.75rem', px: 2, py: 0.4, boxShadow: 'none' }}
                                >
                                  Apply
                                </Button>
                              </Stack>
                            </Stack>
                          </Popover>
                        </Box>
                        <Stack direction="row" spacing={1.2}>
                          <Button
                            variant="outlined"
                            color="inherit"
                            size="small"
                            startIcon={<IconRefresh size={15} />}
                            onClick={() => {
                              dispatch(resetFilters());
                              if (combinedConfig && combinedConfig.length > 0) {
                                const starredDefaults = combinedConfig.filter(f => f.isStarred || f.isRequired).map(f => f.id);
                                const defaultIds = starredDefaults.length > 0 ? starredDefaults : combinedConfig.slice(0, 2).map(f => f.id);
                                updateVisibleFilters(defaultIds);
                              }
                            }}
                            sx={{ borderRadius: '10px', fontWeight: 600, border: '1.5px solid', borderColor: 'text.secondary', px: 2, '&:hover': { bgcolor: 'action.hover', borderColor: 'text.primary' } }}
                          >
                            Reset
                          </Button>
                          <Button
                            variant="contained"
                            color="primary"
                            size="small"
                            startIcon={<IconCheck size={15} />}
                            onClick={handleAdvancedClose}
                            sx={{ borderRadius: '10px', fontWeight: 700, px: 2.5, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', '&:hover': { transform: 'translateY(-1px)' } }}
                          >
                            Apply Filters
                          </Button>
                        </Stack>
                      </Box>
                    </Box>
                  </Popover>
                </Stack>
              </InputAdornment>
            )
          }}
        />
      </Box>
    </>
  );
}

HeaderAvatar.propTypes = { children: PropTypes.node, others: PropTypes.any };
MobileSearch.propTypes = { value: PropTypes.string, setValue: PropTypes.func, popupState: PropTypes.any, placeholder: PropTypes.string };
