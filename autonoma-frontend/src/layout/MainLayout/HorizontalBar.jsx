import PropTypes from 'prop-types';
import { cloneElement, useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import { useTheme, alpha } from '@mui/material/styles';
import useScrollTrigger from '@mui/material/useScrollTrigger';
import AppBar from '@mui/material/AppBar';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import ButtonBase from '@mui/material/ButtonBase';
import Paper from '@mui/material/Paper';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Divider from '@mui/material/Divider';
import Popper from '@mui/material/Popper';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';

import MenuList from './MenuList';
import NavCollapse from './MenuList/NavCollapse';
import NavItem from './MenuList/NavItem';
import menuItem from 'menu-items';
import useConfig from 'hooks/useConfig';
import { useRibbon } from 'contexts/RibbonContext';

import { IconChevronDown, IconChevronUp, IconChevronLeft, IconChevronRight } from '@tabler/icons-react';

const getGroupColors = (title) => {
  const t = (title || '').toUpperCase();
  if (t.includes('MASTER')) {
    return {
      main: '#1e88e5',    // Professional Blue
      light: '#6ab7ff',
      lighter: 'rgba(30, 136, 229, 0.08)'
    };
  }
  if (t.includes('HRA') || t.includes('HR')) {
    return {
      main: '#e65100',    // Warm Amber/Orange
      light: '#ffb74d',
      lighter: 'rgba(230, 81, 0, 0.08)'
    };
  }
  if (t.includes('SALES') || t.includes('MARKETING')) {
    return {
      main: '#2e7d32',    // Forest Green
      light: '#81c784',
      lighter: 'rgba(46, 125, 50, 0.08)'
    };
  }
  if (t.includes('QUALITY') || t.includes('QMS')) {
    return {
      main: '#673ab7',    // Deep Violet/Indigo
      light: '#b39ddb',
      lighter: 'rgba(103, 58, 183, 0.08)'
    };
  }
  if (t.includes('REPORTS') || t.includes('ANALYTICS')) {
    return {
      main: '#c2185b',    // Premium Rose/Magenta
      light: '#f48fb1',
      lighter: 'rgba(194, 24, 91, 0.08)'
    };
  }
  if (t.includes('ADMIN')) {
    return {
      main: '#0097a7',    // Clean Cyan/Teal
      light: '#80deea',
      lighter: 'rgba(0, 151, 167, 0.08)'
    };
  }
  // Default (e.g., Dashboard, others)
  return {
    main: '#455a64',      // Sleek Slate Blue/Grey
    light: '#90a4ae',
    lighter: 'rgba(69, 90, 100, 0.08)'
  };
};

// ==============================|| RIBBON CHILD ITEM ||============================== //

function RibbonChildItem({ item, onClose, isGroup, colors: customColors }) {
  const theme = useTheme();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const timeoutRef = useRef(null);
  const open = Boolean(anchorEl);
  const Icon = item.icon;
  const hasChildren = item.children?.length > 0;

  const defaultColors = {
    main: theme.palette.primary.main,
    light: theme.palette.primary.light,
    lighter: theme.palette.primary.lighter
  };
  const colors = customColors || defaultColors;

  const handleMouseEnter = (e) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (hasChildren && !anchorEl) {
      setAnchorEl(e.currentTarget);
    }
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setAnchorEl(null);
    }, 200); // 200ms delay to allow crossing the gap
  };

  const handleClick = () => {
    if (!hasChildren && item.url) {
      navigate(item.url);
    }
  };

  return (
    <Box onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} sx={{ height: '100%' }}>
      <ButtonBase
        onClick={handleClick}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: isGroup ? 'center' : 'flex-start',
          px: 0.75,
          pt: isGroup ? 0 : 0.75,
          pb: isGroup ? 0 : 0.25,
          minWidth: isGroup ? 52 : 46,
          maxWidth: 80,
          height: '100%',
          borderRadius: isGroup ? '12px' : '8px',
          color: open 
            ? colors.main 
            : isGroup 
              ? colors.main 
              : 'text.secondary',
          background: open 
            ? `linear-gradient(135deg, ${alpha(colors.main, 0.15)} 0%, ${alpha(colors.main, 0.05)} 100%)` 
            : isGroup 
              ? `linear-gradient(135deg, ${alpha(colors.main, 0.08)} 0%, ${alpha(colors.main, 0.02)} 100%)` 
              : 'transparent',
          border: isGroup 
            ? `1px solid ${alpha(colors.main, 0.12)}` 
            : '1px solid transparent',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': { 
            background: isGroup 
              ? `linear-gradient(135deg, ${alpha(colors.main, 0.16)} 0%, ${alpha(colors.main, 0.06)} 100%)` 
              : alpha(colors.main, 0.06),
            borderColor: isGroup ? colors.main : 'transparent',
            color: colors.main,
            transform: 'translateY(-2px)',
            boxShadow: isGroup ? `0 6px 16px -4px ${alpha(colors.main, 0.35)}` : 'none',
            '& .child-icon': {
              transform: 'scale(1.08)',
              color: colors.main
            }
          }
        }}
      >
        <Box 
          className="child-icon"
          sx={{ 
            mb: !isGroup ? 0.5 : 0, 
            lineHeight: 0,
            transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            color: open || isGroup ? colors.main : 'text.secondary'
          }}
        >
          {Icon && <Icon stroke={isGroup ? 1.5 : 1.8} size={isGroup ? '28px' : '20px'} />}
        </Box>
        {!isGroup && (
          <Typography
            sx={{
              fontSize: '0.6rem',
              lineHeight: 1.1,
              textAlign: 'center',
              maxWidth: 70,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'normal',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              color: 'inherit'
            }}
            title={item.title}
          >
            {item.title}
          </Typography>
        )}
      </ButtonBase>

      {hasChildren && (
        <Popper
          open={open}
          anchorEl={anchorEl}
          placement="bottom-start"
          sx={{ zIndex: 2001 }}
          modifiers={[
            {
              name: 'offset',
              options: {
                offset: [0, 8]
              }
            }
          ]}
        >
          <Paper sx={{ boxShadow: theme.shadows[8], py: 0.5, minWidth: 190, backgroundImage: 'none' }}>
            <List dense disablePadding>
              {item.children.map((menu) => {
                switch (menu.type) {
                  case 'collapse':
                    return <NavCollapse key={menu.id} menu={menu} level={1} />;
                  case 'item':
                    return <NavItem key={menu.id} item={menu} level={1} />;
                  default:
                    return (
                      <Typography key={menu.id} variant="h6" color="error" align="center">
                        Menu Items Error
                      </Typography>
                    );
                }
              })}
            </List>
          </Paper>
        </Popper>
      )}
    </Box>
  );
}

// ==============================|| RIBBON GROUP SECTION ||============================== //

function RibbonGroupSection({ group, onClose }) {
  const theme = useTheme();
  const children = group.children || [];
  const GroupIcon = group.icon;
  const colors = getGroupColors(group.title);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100% - 10px)',
        my: 0.5,
        px: 1,
        py: 0.5,
        justifyContent: 'space-between',
        alignItems: 'center',
        minWidth: children.length === 0 ? 64 : 'auto',
        borderRadius: '10px',
        border: `1px solid ${alpha(colors.main, 0.3)}`,
        bgcolor: alpha(colors.main, 0.15),
        boxShadow: `inset 0 0 20px ${alpha(colors.main, 0.05)}`,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          bgcolor: alpha(colors.main, 0.25),
          borderColor: alpha(colors.main, 0.5),
          boxShadow: `0 4px 12px ${alpha(colors.main, 0.15)}`
        }
      }}
    >
      {/* Top part: Main module icon + Children icons */}
      <Box sx={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', gap: 0.5, width: '100%' }}>
        {/* Always show the main module icon as a functional button */}
        <RibbonChildItem item={group} onClose={onClose} isGroup={true} colors={colors} />

        {/* Show children if any */}
        {children.length > 0 && (
          <>
            <Divider 
              orientation="vertical" 
              flexItem 
              sx={{ 
                mx: 0.35, 
                my: 1.25, 
                opacity: 0.4, 
                borderColor: alpha(theme.palette.divider, 0.5) 
              }} 
            />
            {children.map((child) => (
              <RibbonChildItem key={child.id} item={child} onClose={onClose} isGroup={false} colors={colors} />
            ))}
          </>
        )}
      </Box>

      {/* Bottom part: Clean, centered Outlook-style category title */}
      <Box 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          mt: 0.5, 
          gap: 0.5,
          width: 'max-content'
        }}
      >
        <Typography
          variant="caption"
          sx={{
            textAlign: 'center',
            color: colors.main,
            fontSize: '0.62rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            whiteSpace: 'nowrap'
          }}
        >
          {group.title}
        </Typography>
      </Box>
    </Box>
  );
}

// ==============================|| ELEVATION SCROLL ||============================== //

function ElevationScroll({ children, window }) {
  const theme = useTheme();
  const trigger = useScrollTrigger({ disableHysteresis: true, threshold: 0, target: window });
  theme.shadows[4] = theme.vars.customShadows.z1;
  return cloneElement(children, { elevation: trigger ? 4 : 0 });
}

// ==============================|| HORIZONTAL BAR ||============================== //

export default function HorizontalBar() {
  const theme = useTheme();
  const {
    state: { container }
  } = useConfig();
  const { pathname } = useLocation();
  const { ribbonOpen, setRibbonOpen } = useRibbon();

  const groups = menuItem.items;

  // Close ribbon on route change (removed as per user request to keep it expanded)
  // useEffect(() => { setRibbonOpen(false); }, [pathname]);

  const COMPACT_H = 62;
  const RIBBON_H = 96;

  const compactScrollRef = useRef(null);
  const ribbonScrollRef = useRef(null);

  const handleScroll = (ref, amount) => {
    if (ref.current) {
      ref.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };

  return (
    <ElevationScroll>
      <AppBar
        sx={(theme) => ({
          top: 71,
          bgcolor: 'rgba(255, 255, 255, 0.75)',
          backdropFilter: 'blur(16px)',
          width: '100%',
          height: ribbonOpen ? RIBBON_H : COMPACT_H,
          transition: theme.transitions.create(['height', 'background-color'], {
            easing: theme.transitions.easing.easeInOut,
            duration: theme.transitions.duration.shorter
          }),
          borderTop: '1px solid rgba(229, 231, 235, 0.5)',
          borderBottom: '1px solid rgba(229, 231, 235, 0.5)',
          boxShadow: '0 4px 20px -8px rgba(0,0,0,0.06)',
          zIndex: 1098,
          ...theme.applyStyles('dark', {
            bgcolor: 'rgba(18, 18, 18, 0.75)',
            borderColor: 'rgba(255, 255, 255, 0.08)'
          }),
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start'
        })}
      >
        {/* ── Compact icon row — hidden when ribbon is open ── */}
        {!ribbonOpen && (
          <Box sx={{ width: '100%', px: 2, display: 'flex', flex: 'none', position: 'relative' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
              <IconButton
                onClick={() => handleScroll(compactScrollRef, -300)}
                size="small"
                sx={{ mr: 1, '&:hover': { bgcolor: 'action.hover' } }}
              >
                <IconChevronLeft size="16px" />
              </IconButton>

              <Box
                ref={compactScrollRef}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  height: COMPACT_H,
                  overflowX: 'auto',
                  flex: 1,
                  '&::-webkit-scrollbar': { display: 'none' },
                  msOverflowStyle: 'none',
                  scrollbarWidth: 'none'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <MenuList />
                </Box>
              </Box>

              <IconButton
                onClick={() => handleScroll(compactScrollRef, 300)}
                size="small"
                sx={{ mx: 1, '&:hover': { bgcolor: 'action.hover' } }}
              >
                <IconChevronRight size="16px" />
              </IconButton>

              {/* Toggle — expand */}
              <Tooltip title="Expand Menu" placement="bottom" arrow>
                <IconButton
                  onClick={() => setRibbonOpen(true)}
                  size="small"
                  sx={{
                    flexShrink: 0,
                    width: 28,
                    height: 28,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                    color: 'text.secondary',
                    '&:hover': { borderColor: 'primary.main', color: 'primary.main', bgcolor: 'primary.lighter' }
                  }}
                >
                  <IconChevronDown size="16px" stroke={2} />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        )}

        {/* ── Ribbon row — shown when expanded, replaces icon bar ── */}
        {ribbonOpen && (
          <Box sx={{ width: '100%', px: 2, display: 'flex', flex: 1, position: 'relative' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', height: RIBBON_H, width: '100%' }}>
              <IconButton
                onClick={() => handleScroll(ribbonScrollRef, -400)}
                size="small"
                sx={{
                  mr: 1,
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  border: '1px solid rgba(0,0,0,0.06)',
                  bgcolor: 'background.paper',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                  transition: 'all 0.2s',
                  '&:hover': { 
                    bgcolor: 'primary.lighter',
                    color: 'primary.main',
                    borderColor: 'primary.main',
                    transform: 'scale(1.05)'
                  }
                }}
              >
                <IconChevronLeft size="18px" />
              </IconButton>

              <Box
                ref={ribbonScrollRef}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  height: '100%',
                  overflowX: 'auto',
                  overflowY: 'hidden',
                  flex: 1,
                  scrollBehavior: 'smooth',
                  '&::-webkit-scrollbar': { display: 'none' },
                  msOverflowStyle: 'none',
                  scrollbarWidth: 'none'
                }}
              >
                {/* All groups as sections with micro-margins */}
                <Box sx={{ display: 'flex', alignItems: 'stretch', gap: 1.25, height: '100%' }}>
                  {groups.map((group) => (
                    <RibbonGroupSection key={group.id} group={group} onClose={() => setRibbonOpen(false)} />
                  ))}
                </Box>
              </Box>

              <IconButton
                onClick={() => handleScroll(ribbonScrollRef, 400)}
                size="small"
                sx={{
                  mx: 1,
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  border: '1px solid rgba(0,0,0,0.06)',
                  bgcolor: 'background.paper',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                  transition: 'all 0.2s',
                  '&:hover': { 
                    bgcolor: 'primary.lighter',
                    color: 'primary.main',
                    borderColor: 'primary.main',
                    transform: 'scale(1.05)'
                  }
                }}
              >
                <IconChevronRight size="18px" />
              </IconButton>

              {/* Collapse toggle at far right */}
              <Tooltip title="Collapse Menu" placement="bottom" arrow>
                <IconButton
                  onClick={() => setRibbonOpen(false)}
                  size="small"
                  sx={{
                    flexShrink: 0,
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    border: '1px solid',
                    borderColor: 'primary.main',
                    color: 'primary.main',
                    bgcolor: 'primary.lighter',
                    boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.15)}`,
                    transition: 'all 0.2s',
                    '&:hover': { 
                      bgcolor: 'primary.main',
                      color: '#fff',
                      transform: 'scale(1.05)',
                      boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`
                    }
                  }}
                >
                  <IconChevronUp size="16px" stroke={2.5} />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        )}
      </AppBar>
    </ElevationScroll>
  );
}

ElevationScroll.propTypes = { children: PropTypes.node, window: PropTypes.any };
RibbonChildItem.propTypes = { item: PropTypes.object, onClose: PropTypes.func };
RibbonGroupSection.propTypes = { group: PropTypes.object, onClose: PropTypes.func };
