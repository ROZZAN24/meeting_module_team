import PropTypes from 'prop-types';
import { useState, useRef } from 'react';
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
import { setQuery, setFilters, resetFilters } from 'store/slices/search';

// assets
import { IconSearch, IconX, IconApps, IconFileText, IconAdjustmentsHorizontal, IconCalendar, IconFilter, IconPlus } from '@tabler/icons-react';
import { Divider, MenuItem, Select, Button, Stack, Popover, Checkbox, FormControlLabel, Chip } from '@mui/material';

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
  const [visibleFilterIds, setVisibleFilterIds] = useState(['status', 'category']); // Default visible filters
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
          open={isFocused && !isAdvancedOpen && (value.length > 0 || isDashboard)}
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
                    <Stack 
                      direction="row" 
                      spacing={0.5} 
                      alignItems="center" 
                      sx={{ 
                        maxWidth: isFocused ? 400 : 200, 
                        overflowX: 'auto', 
                        overflowY: 'hidden',
                        pb: 0.2,
                        '&::-webkit-scrollbar': { height: 0 }, // Hide scrollbar for cleaner look
                        msOverflowStyle: 'none',
                        scrollbarWidth: 'none'
                      }}
                    >
                      <IconSearch stroke={1.5} size="18px" style={{ flexShrink: 0 }} />
                      {searchConfig && searchConfig.filter(f => visibleFilterIds.includes(f.id)).map(f => (
                        <Chip
                          key={f.id}
                          label={`${f.label}: ${f.options?.find(o => o.value === (filters[f.id] || f.defaultValue))?.label || filters[f.id] || 'All'}`}
                          size="small"
                          onDelete={() => setVisibleFilterIds(prev => prev.filter(id => id !== f.id))}
                          sx={{ 
                            height: 22, 
                            fontSize: '0.7rem', 
                            bgcolor: 'secondary.light', 
                            color: 'secondary.dark',
                            fontWeight: 600,
                            flexShrink: 0,
                            borderRadius: '6px',
                            '& .MuiChip-deleteIcon': { color: 'secondary.dark', fontSize: 14, '&:hover': { color: 'secondary.main' } }
                          }}
                        />
                      ))}
                    </Stack>
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
                              mt: 1.5, p: 2, width: 350, maxHeight: '80vh', overflow: 'hidden',
                              boxShadow: (theme) => theme.customShadows?.z1 || theme.shadows[8],
                              border: '1px solid', borderColor: 'divider'
                            }
                          }
                        }}
                      >
                        <Stack spacing={2}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Filter Selection</Typography>
                          <Typography variant="caption" color="textSecondary">Toggle filters to show them in the search bar</Typography>
                          
                          <Box sx={{ overflowY: 'auto', maxHeight: '50vh', px: 0.5 }}>
                            <Stack spacing={1}>
                              {searchConfig?.map((field) => (
                                <Box key={field.id} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1, borderRadius: 1, '&:hover': { bgcolor: 'action.hover' } }}>
                                  <FormControlLabel
                                    control={
                                      <Checkbox 
                                        size="small" 
                                        checked={visibleFilterIds.includes(field.id)} 
                                        onChange={(e) => {
                                          if (e.target.checked) setVisibleFilterIds(prev => [...prev, field.id]);
                                          else setVisibleFilterIds(prev => prev.filter(id => id !== field.id));
                                        }}
                                      />
                                    }
                                    label={<Typography variant="body2">{field.label}</Typography>}
                                  />
                                  {visibleFilterIds.includes(field.id) && (
                                    <Box sx={{ width: 140 }}>
                                      {field.type === 'select' ? (
                                        <Select
                                          fullWidth size="small"
                                          value={filters[field.id] || field.defaultValue || 'All'}
                                          onChange={(e) => handleFilterChange(field.id, e.target.value)}
                                          sx={{ height: 32, fontSize: '0.8rem' }}
                                        >
                                          {field.options.map((opt) => (
                                            <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                                          ))}
                                        </Select>
                                      ) : (
                                        <TextField
                                          fullWidth size="small"
                                          value={filters[field.id] || ''}
                                          onChange={(e) => handleFilterChange(field.id, e.target.value)}
                                          placeholder={field.placeholder}
                                          sx={{ '& .MuiInputBase-root': { height: 32, fontSize: '0.8rem' } }}
                                        />
                                      )}
                                    </Box>
                                  )}
                                </Box>
                              ))}
                            </Stack>
                          </Box>

                          <Divider />
                          <Stack direction="row" spacing={1} justifyContent="flex-end">
                            <Button size="small" color="error" onClick={() => dispatch(resetFilters())}>Reset</Button>
                            <Button size="small" variant="contained" onClick={handleAdvancedClose}>Done</Button>
                          </Stack>
                        </Stack>
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
