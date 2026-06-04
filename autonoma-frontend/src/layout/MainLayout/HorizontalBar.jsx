import PropTypes from 'prop-types';
import { cloneElement, useEffect, useState, useRef, useCallback, useMemo } from 'react';
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

import MenuList, { filterMenuByPermissions } from './MenuList';
import NavCollapse from './MenuList/NavCollapse';
import NavItem from './MenuList/NavItem';
import menuItem from 'menu-items';
import useConfig from 'hooks/useConfig';
import { useRibbon } from 'contexts/RibbonContext';
import SpeedDialConfigModal from './SpeedDialConfigModal';
import { useSelector } from 'store';

import { IconChevronDown, IconChevronUp, IconChevronLeft, IconChevronRight, IconSettings } from '@tabler/icons-react';

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

function RibbonChildItem({ item, onClose, isGroup, colors: customColors, onClick, isExpanded, isKeyTipActive, keyTip }) {
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

  const handleClick = (e) => {
    if (onClick) {
      onClick(e);
      return;
    }
    if (!hasChildren && item.url) {
      navigate(item.url);
    }
  };

  const innerContent = (
    <>
      <Box sx={{ position: 'relative' }}>
        {isKeyTipActive && keyTip && !isGroup && (
          <Box
            sx={{
              position: 'absolute',
              top: -6,
              left: '50%',
              transform: 'translateX(-50%)',
              bgcolor: '#222',
              color: '#fff',
              px: 0.6,
              py: 0.1,
              borderRadius: '2px',
              fontSize: '10px',
              fontWeight: 800,
              zIndex: 100,
              boxShadow: '1px 1px 4px rgba(0,0,0,0.5)',
              border: '1px solid #555',
              pointerEvents: 'none',
              letterSpacing: '0.05em'
            }}
          >
            {keyTip}
          </Box>
        )}
        <Box 
          className="child-icon"
          sx={{ 
            mb: !isGroup ? 0.5 : 0, 
            lineHeight: 0,
            transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            color: open || (isGroup && isExpanded) || (isGroup && !isExpanded && open) ? colors.main : 'text.secondary'
          }}
        >
          {Icon && <Icon stroke={isGroup ? 1.5 : 1.8} size={isGroup ? '24px' : '20px'} />}
        </Box>
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
    </>
  );

  const buttonBaseContent = (
    <ButtonBase
      onClick={handleClick}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: isGroup ? 'center' : 'flex-start', // Use flex-start so text flows naturally down
        px: 0.5,
        pt: isGroup ? 0 : 0.5,
        pb: isGroup ? 0 : 0.25,
        minWidth: isGroup ? 48 : 66,
        maxWidth: isGroup ? 80 : 66,
        height: isGroup ? 48 : '100%',
        borderRadius: isGroup ? '12px' : '8px',
        color: open || (isGroup && isExpanded)
          ? colors.main 
          : isGroup 
            ? colors.main 
            : 'text.secondary',
        background: open || (isGroup && isExpanded)
          ? `linear-gradient(135deg, ${alpha(colors.main, 0.18)} 0%, ${alpha(colors.main, 0.06)} 100%)` 
          : isGroup 
            ? `linear-gradient(135deg, ${alpha(colors.main, 0.08)} 0%, ${alpha(colors.main, 0.02)} 100%)` 
            : `linear-gradient(135deg, ${alpha(colors.main, 0.06)} 0%, ${alpha(colors.main, 0.01)} 100%)`,
        border: isGroup 
          ? `1px solid ${alpha(colors.main, isExpanded ? 0.4 : 0.2)}` 
          : `1px solid ${alpha(colors.main, 0.2)}`,
        boxShadow: isGroup && isExpanded ? `0 4px 10px -2px ${alpha(colors.main, 0.25)}` : 'none',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        overflow: 'hidden',
        '&::after': !isGroup ? {
          content: '""',
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          background: `radial-gradient(circle at center, ${alpha(colors.main, 0.15)} 0%, transparent 70%)`,
          opacity: 0,
          transition: 'opacity 0.3s ease',
          pointerEvents: 'none'
        } : {},
        '&:hover': { 
          background: isGroup 
            ? `linear-gradient(135deg, ${alpha(colors.main, 0.2)} 0%, ${alpha(colors.main, 0.08)} 100%)` 
            : alpha(colors.main, 0.04),
          borderColor: isGroup ? alpha(colors.main, 0.6) : alpha(colors.main, 0.15),
          color: colors.main,
          transform: 'translateY(-2px)',
          boxShadow: isGroup 
            ? `0 6px 16px -4px ${alpha(colors.main, 0.35)}` 
            : `0 4px 12px -4px ${alpha(colors.main, 0.2)}`,
          '&::after': !isGroup ? {
            opacity: 1
          } : {},
          '& .child-icon': {
            transform: 'scale(1.15) translateY(-1px)',
            color: colors.main,
            filter: !isGroup ? `drop-shadow(0px 2px 4px ${alpha(colors.main, 0.3)})` : 'none'
          }
        }
      }}
    >
      {innerContent}
    </ButtonBase>
  );

  return (
    <Box onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} sx={{ height: '100%' }}>
      {item.pageCode ? (
        <Tooltip 
          title={<span>{item.title} ({item.pageCode})</span>} 
          placement="top" 
          disableInteractive
          arrow
          slotProps={{
            popper: {
              sx: {
                zIndex: 2500
              }
            }
          }}
        >
          {buttonBaseContent}
        </Tooltip>
      ) : (
        buttonBaseContent
      )}

      {hasChildren && (
        <Popper
          open={open}
          anchorEl={anchorEl}
          placement="bottom-start"
          sx={{ zIndex: 2001 }}
          onMouseEnter={() => {
            if (timeoutRef.current) {
              clearTimeout(timeoutRef.current);
              timeoutRef.current = null;
            }
          }}
          onMouseLeave={handleMouseLeave}
          modifiers={[
            {
              name: 'offset',
              options: {
                offset: [0, 8]
              }
            }
          ]}
        >
          <ClickAwayListener onClickAway={() => setAnchorEl(null)}>
            <Paper 
              sx={{ 
                boxShadow: theme.shadows[8], 
                py: 0.5, 
                minWidth: 190, 
                backgroundImage: 'none',
                position: 'relative',
                overflow: 'visible',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: -12, // Bridges the 8px offset gap perfectly
                  left: 0,
                  right: 0,
                  height: 12,
                  bgcolor: 'transparent',
                  zIndex: 1
                }
              }}
            >
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
          </ClickAwayListener>
        </Popper>
      )}
    </Box>
  );
}

// ==============================|| KEYTIP UTILITIES ||============================== //

/**
 * Assigns unique single-letter keytips to an array of items (modules or children).
 * Tries first letter of each word, then falls back to any unused letter in the title.
 */
function assignKeyTips(items) {
  const used = new Set();
  return items.map(item => {
    const title = (item.title || '').toUpperCase().replace(/[^A-Z]/g, '');
    let key = null;
    // Try each character in the title
    for (const ch of title) {
      if (!used.has(ch)) {
        key = ch;
        break;
      }
    }
    // Fallback: try A-Z
    if (!key) {
      for (let i = 65; i <= 90; i++) {
        const ch = String.fromCharCode(i);
        if (!used.has(ch)) { key = ch; break; }
      }
    }
    if (key) used.add(key);
    return { ...item, _keyTip: key };
  });
}

// ==============================|| RIBBON GROUP SECTION ||============================== //

function RibbonGroupSection({ group, onClose, speedDialIds, onEditClick, altMode, keyTip, isKeyTipActive }) {
  const theme = useTheme();
  const children = group.children || [];
  const colors = getGroupColors(group.title);
  const location = useLocation();

  const getAllLeafItems = (items) => {
    let result = [];
    items.forEach(item => {
      if (item.type === 'item') {
        result.push(item);
      } else if (item.children) {
        result = result.concat(getAllLeafItems(item.children));
      }
    });
    return result;
  };

  const allLeafItems = getAllLeafItems(children);

  const hasActiveChild = allLeafItems.some(child => child.url && location.pathname === child.url);

  const [isExpanded, setIsExpanded] = useState(hasActiveChild);

  useEffect(() => {
    if (hasActiveChild) {
      setIsExpanded(true);
    }
  }, [location.pathname, hasActiveChild]);

  const handleGroupClick = () => {
    if (children.length > 0) {
      setIsExpanded((prev) => !prev);
    }
  };

  const displayedChildren = speedDialIds && speedDialIds.length > 0
    ? speedDialIds.map(id => allLeafItems.find(c => c.id === id)).filter(Boolean)
    : allLeafItems.slice(0, 5);

  const displayedChildrenWithKeyTips = useMemo(() => {
    if (!isKeyTipActive) return displayedChildren;
    return assignKeyTips(displayedChildren);
  }, [displayedChildren, isKeyTipActive]);

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
        minWidth: isExpanded ? 'auto' : 100,
        width: isExpanded ? 'auto' : 100,
        borderRadius: '10px',
        border: `1px solid ${alpha(colors.main, 0.3)}`,
        bgcolor: alpha(colors.main, 0.15),
        boxShadow: `inset 0 0 20px ${alpha(colors.main, 0.05)}`,
        transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        '&:hover': {
          bgcolor: alpha(colors.main, 0.25),
          borderColor: alpha(colors.main, 0.5),
          boxShadow: `0 4px 12px ${alpha(colors.main, 0.15)}`,
          '& .edit-speed-dial-btn': {
            opacity: 1,
            visibility: 'visible'
          }
        }
      }}
    >
      {/* KeyTip Badge — shown in Alt mode */}
      {altMode && keyTip && (
        <Box
          sx={{
            position: 'absolute',
            top: -6,
            left: '50%',
            transform: 'translateX(-50%)',
            bgcolor: isKeyTipActive ? '#1565c0' : '#222',
            color: '#fff',
            px: 0.8,
            py: 0.15,
            borderRadius: '3px',
            fontSize: '11px',
            fontWeight: 900,
            zIndex: 100,
            boxShadow: isKeyTipActive
              ? '0 0 0 2px #90caf9, 0 2px 8px rgba(21,101,192,0.5)'
              : '0 2px 6px rgba(0,0,0,0.4)',
            border: isKeyTipActive ? '1px solid #90caf9' : '1px solid #444',
            pointerEvents: 'none',
            letterSpacing: '0.08em',
            minWidth: 18,
            textAlign: 'center',
            transition: 'all 0.15s'
          }}
        >
          {keyTip}
        </Box>
      )}

      {/* Edit Speed Dial Button */}
      {allLeafItems.length > 0 && (
        <Tooltip title="Customize Speed Dial" placement="top" arrow>
          <IconButton
            className="edit-speed-dial-btn"
            onClick={(e) => {
              e.stopPropagation();
              onEditClick({ ...group, allLeafItems });
            }}
            size="small"
            sx={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              bgcolor: alpha(colors.main, 0.8),
              color: '#fff',
              borderTopLeftRadius: '12px',
              borderBottomRightRadius: '9px',
              borderTopRightRadius: 0,
              borderBottomLeftRadius: 0,
              width: 24,
              height: 24,
              opacity: 0,
              visibility: 'hidden',
              transform: 'scale(0.8)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              zIndex: 10,
              padding: 0,
              boxShadow: `0 2px 8px ${alpha(colors.main, 0.4)}`,
              '&:hover': {
                opacity: 1,
                transform: 'scale(1.1)',
                bgcolor: colors.main,
                boxShadow: `0 4px 12px ${alpha(colors.main, 0.6)}`,
                '& .settings-icon': {
                  animation: 'spin 2s linear infinite'
                }
              },
              '@keyframes spin': {
                '0%': { transform: 'rotate(0deg)' },
                '100%': { transform: 'rotate(360deg)' }
              }
            }}
          >
            <IconSettings className="settings-icon" size="14px" />
          </IconButton>
        </Tooltip>
      )}

      {/* Top part: Main module icon + Children icons */}
      <Box sx={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', gap: 0.5, width: '100%' }}>
        {/* Always show the main module icon as a functional button */}
        <RibbonChildItem 
          item={group} 
          onClose={onClose} 
          isGroup={true} 
          colors={colors} 
          onClick={handleGroupClick} 
          isExpanded={isExpanded}
        />

        {/* Show children if any with premium horizontal slide/fade transition */}
        {children.length > 0 && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              overflow: 'hidden',
              maxWidth: isExpanded ? '800px' : '0px',
              opacity: isExpanded ? 1 : 0,
              transition: 'max-width 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease-in-out',
              visibility: isExpanded ? 'visible' : 'hidden',
              whiteSpace: 'nowrap'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, ml: 1 }}>
              {displayedChildrenWithKeyTips.map((child) => (
                <RibbonChildItem key={child.id} item={child} onClose={onClose} isGroup={false} colors={colors} isKeyTipActive={isKeyTipActive} keyTip={child._keyTip} />
              ))}
            </Box>
          </Box>
        )}
      </Box>

      {/* Bottom part: Clean, centered Outlook-style category title */}
      <Box 
        onClick={handleGroupClick}
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          mt: 0.5, 
          gap: 0.5,
          width: '100%',
          px: 0.5,
          cursor: children.length > 0 ? 'pointer' : 'default',
          transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': children.length > 0 ? {
            opacity: 0.8
          } : {}
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
            whiteSpace: 'normal',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            lineHeight: 1.1
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

  const permStatus = useSelector((state) => state.permissions.status);
  const permMap = useSelector((state) => state.permissions.map);

  const groups = useMemo(() => {
    let currentItems = [...menuItem.items];
    if (permStatus === 'loaded') {
      currentItems = filterMenuByPermissions(currentItems, permMap);
    } else {
      currentItems = filterMenuByPermissions(currentItems, {});
    }
    return currentItems;
  }, [permStatus, permMap]);

  // Speed Dial Customization State
  const [speedDialPreferences, setSpeedDialPreferences] = useState({});
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const [configModuleGroup, setConfigModuleGroup] = useState(null);

  useEffect(() => {
    const savedPrefs = localStorage.getItem('speedDialPreferences');
    if (savedPrefs) {
      try {
        setSpeedDialPreferences(JSON.parse(savedPrefs));
      } catch (e) {
        console.error('Failed to parse speedDialPreferences', e);
      }
    }
  }, []);

  const handleEditClick = (group) => {
    setConfigModuleGroup(group);
    setConfigModalOpen(true);
  };

  const handleSaveSpeedDial = (groupId, selectedIds) => {
    const newPrefs = { ...speedDialPreferences, [groupId]: selectedIds };
    setSpeedDialPreferences(newPrefs);
    localStorage.setItem('speedDialPreferences', JSON.stringify(newPrefs));
  };

  // Close ribbon on route change (removed as per user request to keep it expanded)
  // useEffect(() => { setRibbonOpen(false); }, [pathname]);

  const COMPACT_H = 62;
  const RIBBON_H = 96;

  const compactScrollRef = useRef(null);
  const ribbonScrollRef = useRef(null);

  // Overflow detection for scroll arrows
  const [ribbonOverflow, setRibbonOverflow] = useState({ canLeft: false, canRight: false });
  const [compactOverflow, setCompactOverflow] = useState({ canLeft: false, canRight: false });

  // ── KeyTips (Alt mode) ──────────────────────────────────────────────
  const [altMode, setAltMode] = useState(false);
  const [altActiveGroupId, setAltActiveGroupId] = useState(null); // group.id of the active keytip level
  const navigate = useNavigate();

  // Build keytip map once from groups
  const groupsWithKeyTips = useMemo(() => assignKeyTips(groups), [groups]);

  // Helper: get all direct-child items (collapse + item) with keytips for a group
  const getChildrenWithKeyTips = useCallback((groupId) => {
    const group = groups.find(g => g.id === groupId);
    if (!group) return [];
    return assignKeyTips(group.children || []);
  }, [groups]);

  // Helper: flatten all leaf items and their sub-items with keytips
  const getLeafItemsWithKeyTips = useCallback((children) => {
    const allLeaf = [];
    const walk = (items) => {
      items.forEach(item => {
        if (item.type === 'item') allLeaf.push(item);
        else if (item.children) walk(item.children);
      });
    };
    walk(children);
    return assignKeyTips(allLeaf);
  }, []);

  const [altChildItems, setAltChildItems] = useState([]); // items shown in the keytip submenu panel
  const [altPanelAnchor, setAltPanelAnchor] = useState(null); // DOM element of the active module badge
  const groupRefs = useRef({});

  const dismissAlt = useCallback(() => {
    setAltMode(false);
    setAltActiveGroupId(null);
    setAltChildItems([]);
    setAltPanelAnchor(null);
  }, []);

  const openGroupKeyTipMenu = useCallback((groupId) => {
    const group = groups.find(g => g.id === groupId);
    if (!group) return;
    const children = group.children || [];
    // Show top-level children of this group with keytips
    const topChildren = assignKeyTips(children);
    setAltActiveGroupId(groupId);
    setAltChildItems(topChildren);
    setAltPanelAnchor(groupRefs.current[groupId] || null);
  }, [groups]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Alt') {
        e.preventDefault();
      }
    };
    const handleKeyUp = (e) => {
      if (e.key === 'Alt') {
        e.preventDefault();
        if (!altMode) {
          // If entering Alt mode from compact mode, auto-expand the ribbon so keytips are visible
          setRibbonOpen(true);
        }
        setAltMode(prev => {
          if (prev) {
            // toggle off
            setAltActiveGroupId(null);
            setAltChildItems([]);
            setAltPanelAnchor(null);
          }
          return !prev;
        });
        return;
      }
      if (e.key === 'Escape') {
        dismissAlt();
        return;
      }
    };

    const handleKeyDown2 = (e) => {
      if (!altMode) return;
      if (e.key === 'Alt' || e.key === 'Escape') return;
      // Skip if typing in an input
      if (['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName)) return;

      const pressed = e.key.toUpperCase();

      if (!altActiveGroupId) {
        // Level 1: match a module keytip
        const match = groupsWithKeyTips.find(g => g._keyTip === pressed);
        if (match) {
          e.preventDefault();
          // Ensure ribbon is open
          setRibbonOpen(true);
          openGroupKeyTipMenu(match.id);
        }
      } else {
        // Level 2: match a child keytip
        const match = altChildItems.find(c => c._keyTip === pressed);
        if (match) {
          e.preventDefault();
          if (match.type === 'item' && match.url) {
            navigate(match.url);
            dismissAlt();
          } else if (match.children) {
            // Drill one more level
            const subChildren = assignKeyTips(match.children);
            setAltChildItems(subChildren);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('keydown', handleKeyDown2);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('keydown', handleKeyDown2);
    };
  }, [altMode, altActiveGroupId, altChildItems, groupsWithKeyTips, dismissAlt, navigate, openGroupKeyTipMenu, setRibbonOpen]);

  const checkOverflow = useCallback((ref, setter) => {
    if (!ref.current) return;
    const el = ref.current;
    setter({
      canLeft: el.scrollLeft > 1,
      canRight: el.scrollLeft + el.clientWidth < el.scrollWidth - 1
    });
  }, []);

  const checkAllOverflow = useCallback(() => {
    checkOverflow(ribbonScrollRef, setRibbonOverflow);
    checkOverflow(compactScrollRef, setCompactOverflow);
  }, [checkOverflow]);

  useEffect(() => {
    const ribbonEl = ribbonScrollRef.current;
    const compactEl = compactScrollRef.current;

    const onRibbonScroll = () => checkOverflow(ribbonScrollRef, setRibbonOverflow);
    const onCompactScroll = () => checkOverflow(compactScrollRef, setCompactOverflow);

    if (ribbonEl) {
      ribbonEl.addEventListener('scroll', onRibbonScroll, { passive: true });
      onRibbonScroll();
    }
    if (compactEl) {
      compactEl.addEventListener('scroll', onCompactScroll, { passive: true });
      onCompactScroll();
    }

    window.addEventListener('resize', checkAllOverflow);

    // Use ResizeObserver to detect content size changes (module expand/collapse)
    let resizeObserver;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        checkAllOverflow();
      });
      if (ribbonEl) {
        resizeObserver.observe(ribbonEl);
        // Also observe the inner content container if it exists
        const ribbonInner = ribbonEl.firstElementChild;
        if (ribbonInner) resizeObserver.observe(ribbonInner);
      }
      if (compactEl) {
        resizeObserver.observe(compactEl);
        const compactInner = compactEl.firstElementChild;
        if (compactInner) resizeObserver.observe(compactInner);
      }
    }

    return () => {
      if (ribbonEl) ribbonEl.removeEventListener('scroll', onRibbonScroll);
      if (compactEl) compactEl.removeEventListener('scroll', onCompactScroll);
      window.removeEventListener('resize', checkAllOverflow);
      if (resizeObserver) resizeObserver.disconnect();
    };
  }, [ribbonOpen, checkOverflow, checkAllOverflow]);

  // Re-check overflow after ribbon open/close transition ends
  useEffect(() => {
    const timer = setTimeout(checkAllOverflow, 500);
    return () => clearTimeout(timer);
  }, [ribbonOpen, checkAllOverflow]);

  const handleScroll = (ref, amount) => {
    if (ref.current) {
      ref.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };

  return (
    <>
      <ElevationScroll>
        <AppBar
          sx={(theme) => ({
            top: 64,
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
              {compactOverflow.canLeft && (
              <IconButton
                onClick={() => handleScroll(compactScrollRef, -300)}
                size="small"
                sx={{ mr: 1, '&:hover': { bgcolor: 'action.hover' } }}
              >
                <IconChevronLeft size="16px" />
              </IconButton>
              )}

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

              {compactOverflow.canRight && (
              <IconButton
                onClick={() => handleScroll(compactScrollRef, 300)}
                size="small"
                sx={{ mx: 1, '&:hover': { bgcolor: 'action.hover' } }}
              >
                <IconChevronRight size="16px" />
              </IconButton>
              )}

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
              {ribbonOverflow.canLeft && (
              <IconButton
                onClick={() => handleScroll(ribbonScrollRef, -400)}
                size="small"
                sx={{
                  mr: 0.5,
                  width: 24,
                  height: 24,
                  borderRadius: '6px',
                  border: '1px solid',
                  borderColor: 'divider',
                  bgcolor: 'background.paper',
                  color: 'text.secondary',
                  transition: 'all 0.2s',
                  '&:hover': { 
                    bgcolor: 'primary.lighter',
                    color: 'primary.main',
                    borderColor: 'primary.main'
                  }
                }}
              >
                <IconChevronLeft size="14px" />
              </IconButton>
              )}

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
                  {groupsWithKeyTips.map((group) => (
                    <Box key={group.id} ref={el => { groupRefs.current[group.id] = el; }} sx={{ display: 'contents' }}>
                      <RibbonGroupSection 
                        group={group}
                        onClose={() => setRibbonOpen(false)}
                        speedDialIds={speedDialPreferences[group.id]}
                        onEditClick={handleEditClick}
                        altMode={altMode}
                        keyTip={group._keyTip}
                        isKeyTipActive={altActiveGroupId === group.id}
                      />
                    </Box>
                  ))}

                  {/* KeyTip submenu panel */}
                  {altActiveGroupId && altChildItems.length > 0 && (
                    <Box
                      sx={{
                        position: 'fixed',
                        top: 130,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        zIndex: 3000,
                        bgcolor: '#1a1a2e',
                        border: '1.5px solid #3a3a6e',
                        borderRadius: '10px',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                        p: 1.5,
                        minWidth: 320,
                        maxWidth: '80vw',
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 0.75
                      }}
                    >
                      <Typography variant="caption" sx={{ width: '100%', color: '#aaa', mb: 0.5, fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                        {groups.find(g => g.id === altActiveGroupId)?.title} — Press key to navigate | Esc to dismiss
                      </Typography>
                      {altChildItems.map(child => (
                        <Box
                          key={child.id}
                          onClick={() => {
                            if (child.type === 'item' && child.url) {
                              navigate(child.url);
                              dismissAlt();
                            } else if (child.children) {
                              setAltChildItems(assignKeyTips(child.children));
                            }
                          }}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.75,
                            px: 1,
                            py: 0.5,
                            borderRadius: '6px',
                            cursor: 'pointer',
                            bgcolor: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            transition: 'all 0.15s',
                            '&:hover': { bgcolor: 'rgba(255,255,255,0.12)', borderColor: 'rgba(255,255,255,0.25)' }
                          }}
                        >
                          <Box sx={{
                            minWidth: 22, height: 22,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            bgcolor: '#1565c0',
                            borderRadius: '4px',
                            fontSize: '11px', fontWeight: 900, color: '#fff',
                            flexShrink: 0
                          }}>
                            {child._keyTip || '?'}
                          </Box>
                          <Typography sx={{ color: '#e0e0e0', fontSize: '0.78rem', fontWeight: 500 }}>
                            {child.title}
                          </Typography>
                          {child.children && (
                            <Typography sx={{ color: '#888', fontSize: '0.65rem', ml: 'auto' }}>▶</Typography>
                          )}
                        </Box>
                      ))}
                    </Box>
                  )}
                </Box>
              </Box>

              {ribbonOverflow.canRight && (
              <IconButton
                onClick={() => handleScroll(ribbonScrollRef, 400)}
                size="small"
                sx={{
                  ml: 0.5,
                  width: 24,
                  height: 24,
                  borderRadius: '6px',
                  border: '1px solid',
                  borderColor: 'divider',
                  bgcolor: 'background.paper',
                  color: 'text.secondary',
                  transition: 'all 0.2s',
                  '&:hover': { 
                    bgcolor: 'primary.lighter',
                    color: 'primary.main',
                    borderColor: 'primary.main'
                  }
                }}
              >
                <IconChevronRight size="14px" />
              </IconButton>
              )}

              {/* Collapse toggle at far right */}
              <Tooltip title="Collapse Menu" placement="bottom" arrow>
                <IconButton
                  onClick={() => setRibbonOpen(false)}
                  size="small"
                  sx={{
                    flexShrink: 0,
                    ml: 0.5,
                    width: 24,
                    height: 24,
                    borderRadius: '6px',
                    border: '1px solid',
                    borderColor: alpha(theme.palette.primary.main, 0.4),
                    color: 'primary.main',
                    bgcolor: alpha(theme.palette.primary.main, 0.06),
                    transition: 'all 0.2s',
                    '&:hover': { 
                      bgcolor: 'primary.main',
                      color: '#fff',
                      borderColor: 'primary.main'
                    }
                  }}
                >
                  <IconChevronUp size="14px" stroke={2.5} />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        )}
      </AppBar>
    </ElevationScroll>

    {/* Speed Dial Config Modal — outside ElevationScroll so cloneElement isn't broken */}
    <SpeedDialConfigModal
      open={configModalOpen}
      onClose={() => setConfigModalOpen(false)}
      moduleGroup={configModuleGroup}
      currentSpeedDialIds={configModuleGroup ? (speedDialPreferences[configModuleGroup.id] || configModuleGroup.children?.map(c => c.id) || []) : []}
      onSave={handleSaveSpeedDial}
    />
  </>
  );
}

ElevationScroll.propTypes = { children: PropTypes.node, window: PropTypes.any };
RibbonChildItem.propTypes = {
  item: PropTypes.object,
  onClose: PropTypes.func,
  isGroup: PropTypes.bool,
  colors: PropTypes.object,
  onClick: PropTypes.func,
  isExpanded: PropTypes.bool
};
RibbonGroupSection.propTypes = { group: PropTypes.object, onClose: PropTypes.func };
