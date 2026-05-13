import PropTypes from 'prop-types';
import { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

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

// third party
import PopupState, { bindPopper, bindToggle } from 'material-ui-popup-state';

// project imports
import Transitions from 'ui-component/extended/Transitions';
import { useDispatch, useSelector } from 'react-redux';
import { setQuery, setFilters, resetFilters, setFilterPreferences } from 'store/slices/search';

// assets
import { IconSearch, IconX, IconApps, IconFileText, IconAdjustmentsHorizontal, IconCalendar, IconFilter, IconPlus } from '@tabler/icons-react';
import { Divider, MenuItem, Select, Button, Stack, Popover, Checkbox, FormControlLabel, Chip, Badge } from '@mui/material';

const SUGGESTIONS = [
  { label: 'Master Check List', path: '/qms/checklist/master', type: 'Module' },
  { label: 'Check List Reports', path: '/qms/checklist/renewal-report', type: 'Module' },
  { label: 'Verifications', path: '/qms/checklist/verify', type: 'Module' },
  { label: 'Close Check List Renewal', path: '/qms/checklist/close-renewal', type: 'Module' },
  { label: 'Renewal Verify', path: '/qms/checklist/renewal-verify', type: 'Module' },
  { label: 'User Credentials', path: '/admin/user-overview', type: 'Module' },
  { label: 'Dashboard', path: '/dashboard/default', type: 'Page' },
  { label: 'Analytics', path: '/dashboard/analytics', type: 'Page' }
];

function HeaderAvatar({ children, ref, ...others }) {
  const theme = useTheme();

  return (
    <Avatar
      ref={ref}
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
      placeholder={placeholder || 'Search anything...'}
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
      slotProps={{ input: { 'aria-label': 'weight', sx: { bgcolor: 'transparent', pl: 0.5 } } }}
      sx={{ width: '100%', ml: 0.5, px: 2, bgcolor: 'background.paper' }}
    />
  );
}

const EMPTY_ARRAY = [];

// ==============================|| SEARCH INPUT ||============================== //

export default function SearchSection() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const value = useSelector((state) => state.search.query);
  const filters = useSelector((state) => state.search.filters);
  const searchConfig = useSelector((state) => state.search.config);

  const [isFocused, setIsFocused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [advancedAnchorEl, setAdvancedAnchorEl] = useState(null);
  const [visibleFilterIds, setVisibleFilterIds] = useState([]); 
  const anchorRef = useRef(null);
  const isAdvancedOpen = Boolean(advancedAnchorEl);

  const handleAdvancedClick = () => {
    setAdvancedAnchorEl(advancedAnchorEl ? null : anchorRef.current);
  };

  const handleAdvancedClose = () => {
    setAdvancedAnchorEl(null);
  };

  const setValue = (val) => {
    dispatch(setQuery(val));
  };

  const currentPrefs = useSelector((state) => state.search.preferences[location.pathname]) || EMPTY_ARRAY;

  // Sync visible filter IDs with searchConfig and preferences
  useEffect(() => {
    if (searchConfig && searchConfig.length > 0) {
      if (currentPrefs.length > 0) {
        setVisibleFilterIds(currentPrefs);
      } else {
        const starred = searchConfig.filter(f => f.isStarred).map(f => f.id);
        if (starred.length > 0) {
          setVisibleFilterIds(starred);
        } else {
          // Systemic Fix: Default to empty if constant filters are present, otherwise slice first 2
          const hasConstants = searchConfig.some(f => f.isConstant);
          const defaultIds = hasConstants ? [] : searchConfig.slice(0, 2).map(f => f.id);
          setVisibleFilterIds(defaultIds);
        }
      }
    }
  }, [searchConfig, location.pathname, currentPrefs]);

  const updateVisibleFilters = (newIds) => {
    setVisibleFilterIds(newIds);
    dispatch(setFilterPreferences({ path: location.pathname, visibleIds: newIds }));
  };

  const handleFilterChange = (key, val) => {
    dispatch(setFilters({ [key]: val }));
  };

  // --- Context Awareness Logic ---
  const isDashboard = location.pathname.startsWith('/dashboard') || location.pathname === '/';

  // Dynamic Placeholder
  let searchPlaceholder = 'Search across Autonoma...';
  if (searchConfig && searchConfig.length > 0) searchPlaceholder = 'Search with filters...';
  else if (isDashboard) searchPlaceholder = 'Search Dashboard...';

  // Dynamic Suggestions - Only show on Dashboard
  const currentSuggestions = isDashboard ? SUGGESTIONS : [];

  // Calculate active filter count
  const activeFilterCount = useMemo(() => {
    if (!searchConfig || !filters) return 0;
    let count = 0;
    searchConfig.forEach((f) => {
      if (f.type === 'dateRange') {
        if (filters[`${f.id}Start`] || filters[`${f.id}End`]) count++;
      } else if (f.type === 'select') {
        const val = filters[f.id];
        if (val && val !== 'All' && val !== f.defaultValue) count++;
      } else if (f.type === 'autocomplete') {
        const val = filters[f.id];
        if (Array.isArray(val) ? val.length > 0 : val) count++;
      } else {
        if (filters[f.id]) count++;
      }
    });
    return count;
  }, [searchConfig, filters]);

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
                  <>
                    <Transitions type="zoom" {...TransitionProps} sx={{ transformOrigin: 'center left' }}>
                      <Card sx={{ bgcolor: 'background.default', border: 0, boxShadow: 'none' }}>
                        <Box sx={{ p: 2 }}>
                          <Grid container sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                            <Grid size="grow">
                              <MobileSearch value={value} setValue={setValue} popupState={popupState} placeholder={searchPlaceholder} />
                            </Grid>
                          </Grid>
                        </Box>
                      </Card>
                    </Transitions>
                  </>
                )}
              </Popper>
            </>
          )}
        </PopupState>
      </Box>

      {/* Desktop Global Search - O365 Style */}
      <Box
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        sx={{
          display: { xs: 'none', md: 'block' },
          width: '100%',
          maxWidth: isFocused ? 750 : 500,
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          ml: isFocused ? -15 : 0
        }}
      >
        <Autocomplete
          freeSolo
          options={currentSuggestions}
          noOptionsText={isDashboard ? undefined : null}
          open={isFocused && !isAdvancedOpen && currentSuggestions.length > 0 && (value.length > 0 || isDashboard)}
          openOnFocus={false}
          getOptionLabel={(option) => (typeof option === 'string' ? option : option.label)}
          inputValue={value}
          onInputChange={(event, newInputValue) => {
            setValue(newInputValue);
          }}
          onChange={(event, newValue) => {
            if (typeof newValue === 'object' && newValue !== null && newValue.path) {
              navigate(newValue.path);
              setValue('');
            } else if (typeof newValue === 'string') {
              const match = currentSuggestions.find((s) => s.label.toLowerCase() === newValue.toLowerCase());
              if (match) {
                navigate(match.path);
                setValue('');
              }
            }
          }}
          renderOption={(props, option) => (
            <Box component="li" {...props} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {option.type === 'Module' ? <IconApps size={18} /> : <IconFileText size={18} />}
              <Typography variant="body2">{option.label}</Typography>
              <Typography variant="caption" color="textSecondary" sx={{ ml: 'auto' }}>
                {option.type}
              </Typography>
            </Box>
          )}
          renderInput={(params) => (
            <TextField
              {...params}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={searchPlaceholder}
              variant="outlined"
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)'),
                  borderRadius: 2,
                  pr: 1,
                  pl: 1,
                  transition: 'all 0.3s ease',
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
                ...params.InputProps,
                startAdornment: (
                  <InputAdornment position="start" sx={{ pl: 1, mr: 1 }}>
                    <IconSearch stroke={1.5} size="18px" style={{ flexShrink: 0 }} />
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
                      {searchConfig && searchConfig.length > 0 ? (
                        <IconButton
                          size="small"
                          ref={anchorRef}
                          onClick={handleAdvancedClick}
                          sx={{
                            p: 0.5,
                            transition: 'all 0.2s ease-in-out',
                            color: isAdvancedOpen || activeFilterCount > 0 ? 'primary.main' : 'text.secondary',
                            '&:hover': { color: 'primary.main' }
                          }}
                        >
                          <Badge badgeContent={activeFilterCount} color="primary" sx={{ '& .MuiBadge-badge': { right: -2, top: 2 } }}>
                            <IconFilter stroke={1.5} size="20px" />
                          </Badge>
                        </IconButton>
                      ) : (
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
                      )}
                      <Popover
                        open={isAdvancedOpen}
                        anchorEl={advancedAnchorEl}
                        onClose={handleAdvancedClose}
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                        slotProps={{
                          paper: {
                            sx: {
                              mt: 1.5,
                              width: 440,
                              maxHeight: '82vh',
                              display: 'flex',
                              flexDirection: 'column',
                              boxShadow: (theme) => `0 20px 50px ${theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0.12)'}`,
                              borderRadius: '20px',
                              border: '1px solid',
                              borderColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                              overflow: 'hidden',
                              backdropFilter: 'blur(20px)',
                              bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(22, 24, 30, 0.88)' : 'rgba(255, 255, 255, 0.92)'
                            }
                          }
                        }}
                      >
                        {/* Header */}
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
                        
                        {/* Content */}
                        <Box sx={{ p: 2.5, overflowY: 'auto', flexGrow: 1 }}>
                          <Stack spacing={2.2}>
                            {searchConfig?.filter(f => f.isConstant || visibleFilterIds.includes(f.id)).map((field) => (
                              <Stack spacing={0.6} key={field.id}>
                                <Typography variant="caption" color="text.primary" fontWeight={700} sx={{ textTransform: 'uppercase', fontSize: '0.68rem', letterSpacing: '0.5px', opacity: 0.85 }}>
                                  {field.label}
                                </Typography>
                                {field.type === 'autocomplete' ? (
                                  <Autocomplete
                                    multiple={field.multiple}
                                    size="small"
                                    options={field.options || []}
                                    getOptionLabel={(option) => (typeof option === 'string' ? option : option.label)}
                                    value={filters[field.id] || (field.multiple ? [] : null)}
                                    onChange={(e, newVal) => handleFilterChange(field.id, newVal)}
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

                        {/* Footer */}
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
                            <PopupState variant="popper" popupId="add-filter-popper">
                              {(popupState) => (
                                <>
                                  <Button 
                                    variant="text" 
                                    size="small" 
                                    startIcon={<IconPlus size={16} />}
                                    {...bindToggle(popupState)}
                                    sx={{ borderRadius: '10px', fontWeight: 700, px: 1.5, color: 'primary.main', '&:hover': { bgcolor: 'primary.light', color: 'primary.dark' } }}
                                  >
                                    Add Filter
                                  </Button>
                                  <Popper {...bindPopper(popupState)} transition sx={{ zIndex: 1300 }}>
                                    {({ TransitionProps }) => (
                                      <Transitions type="fade" {...TransitionProps}>
                                        <Card sx={{ 
                                          p: 1.5, 
                                          boxShadow: (theme) => `0 12px 30px ${theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.9)' : 'rgba(0,0,0,0.15)'}`, 
                                          border: '1px solid', 
                                          borderColor: 'divider', 
                                          width: 360, 
                                          mt: 1, 
                                          borderRadius: '16px',
                                          backdropFilter: 'blur(16px)',
                                          bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(30, 32, 40, 0.95)' : 'rgba(255, 255, 255, 0.95)'
                                        }}>
                                          <Stack spacing={1}>
                                            <Typography variant="caption" sx={{ px: 0.5, fontWeight: 800, color: 'primary.main', fontSize: '0.65rem', letterSpacing: '0.6px' }}>
                                              DYNAMIC DATA COLUMNS
                                            </Typography>
                                            <Divider sx={{ my: '4px !important' }} />
                                            <Grid container spacing={0}>
                                              {searchConfig?.filter(field => !field.isConstant).map((field) => (
                                                <Grid size={6} key={field.id}>
                                                  <FormControlLabel
                                                    sx={{ m: 0, px: 1, py: 0.5, width: '100%', borderRadius: '8px', transition: 'all 0.15s', '&:hover': { bgcolor: 'action.hover' } }}
                                                    control={
                                                      <Checkbox 
                                                        size="small" 
                                                        checked={visibleFilterIds.includes(field.id)} 
                                                        onChange={(e) => {
                                                          if (e.target.checked) updateVisibleFilters([...visibleFilterIds, field.id]);
                                                          else updateVisibleFilters(visibleFilterIds.filter(id => id !== field.id));
                                                        }}
                                                        sx={{ p: 0.5, mr: 0.5 }}
                                                      />
                                                    }
                                                    label={<Typography variant="caption" sx={{ fontSize: '0.75rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{field.label}</Typography>}
                                                  />
                                                </Grid>
                                              ))}
                                            </Grid>
                                          </Stack>
                                        </Card>
                                      </Transitions>
                                    )}
                                  </Popper>
                                </>
                              )}
                            </PopupState>
                          </Box>
                          <Stack direction="row" spacing={1.2}>
                            <Button variant="outlined" color="inherit" size="small" onClick={() => dispatch(resetFilters())} sx={{ borderRadius: '10px', fontWeight: 600, borderColor: 'divider', '&:hover': { bgcolor: 'action.hover' } }}>
                              Reset
                            </Button>
                            <Button variant="contained" color="primary" size="small" onClick={handleAdvancedClose} sx={{ borderRadius: '10px', fontWeight: 700, px: 2.5, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', '&:hover': { transform: 'translateY(-1px)' } }}>
                              Apply Filters
                            </Button>
                          </Stack>
                        </Box>
                      </Popover>
                    </Stack>
                  </InputAdornment>
                )
              }}
            />
          )}
        />
      </Box>
    </>
  );
}

HeaderAvatar.propTypes = { children: PropTypes.node, ref: PropTypes.any, others: PropTypes.any };
MobileSearch.propTypes = { value: PropTypes.string, setValue: PropTypes.func, popupState: PropTypes.any, placeholder: PropTypes.string };
