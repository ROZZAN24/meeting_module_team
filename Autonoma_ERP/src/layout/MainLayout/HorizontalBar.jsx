import PropTypes from 'prop-types';
import { cloneElement, useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import { useTheme } from '@mui/material/styles';
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

// ==============================|| RIBBON CHILD ITEM ||============================== //

function RibbonChildItem({ item, onClose }) {
  const theme = useTheme();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const timeoutRef = useRef(null);
  const open = Boolean(anchorEl);
  const Icon = item.icon;
  const hasChildren = item.children?.length > 0;

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
          justifyContent: 'flex-start',
          px: 1,
          pt: 1,
          pb: 0.5,
          minWidth: 54,
          maxWidth: 80,
          height: '100%',
          borderRadius: 1,
          color: open ? 'primary.main' : 'text.primary',
          bgcolor: open ? 'primary.lighter' : 'transparent',
          transition: 'all 0.15s',
          '&:hover': { bgcolor: 'action.hover', color: 'primary.main' }
        }}
      >
        <Box sx={{ mb: 0.5, lineHeight: 0 }}>
          {Icon && <Icon stroke={1.5} size="20px" />}
        </Box>
        <Typography sx={{
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
        }} title={item.title}>
          {item.title}
        </Typography>
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
  const children = group.children || [];
  const GroupIcon = group.icon;

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100%', 
      px: 0.5,
      pt: 0.5,
      pb: 0.25,
      justifyContent: 'space-between',
      minWidth: children.length === 0 ? 80 : 'auto'
    }}>
      {/* Top part: Main module icon + Children icons */}
      <Box sx={{ display: 'flex', flex: 1, alignItems: 'stretch', gap: 0.25 }}>
        {/* Always show the main module icon as a functional button */}
        <RibbonChildItem item={group} onClose={onClose} />
        
        {/* Show children if any */}
        {children.length > 0 && (
          <>
            <Divider orientation="vertical" flexItem sx={{ mx: 0.5, my: 1, opacity: 0.5 }} />
            {children.map(child => (
               <RibbonChildItem key={child.id} item={child} onClose={onClose} />
            ))}
          </>
        )}
      </Box>
      {/* Bottom part: Group Title with Icon */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 0.5, gap: 0.5 }}>
        {GroupIcon && <GroupIcon stroke={1.5} size="12px" style={{ opacity: 0.7 }} />}
        <Typography 
          variant="caption" 
          sx={{ 
            textAlign: 'center', 
            color: 'text.secondary', 
            fontSize: '0.65rem',
            fontWeight: 500,
            opacity: 0.8,
            textTransform: 'uppercase',
            letterSpacing: '0.02em'
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
  const { state: { container } } = useConfig();
  const { pathname } = useLocation();
  const { ribbonOpen, setRibbonOpen } = useRibbon();

  const groups = menuItem.items;

  // Close ribbon on route change (removed as per user request to keep it expanded)
  // useEffect(() => { setRibbonOpen(false); }, [pathname]);

  const COMPACT_H = 62;
  const RIBBON_H = 86;

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
          bgcolor: 'background.paper',
          width: '100%',
          height: ribbonOpen ? RIBBON_H : COMPACT_H,
          transition: theme.transitions.create('height', {
            easing: theme.transitions.easing.easeInOut,
            duration: theme.transitions.duration.shorter
          }),
          borderTop: '1px solid',
          borderColor: 'grey.300',
          zIndex: 1098,
          ...theme.applyStyles('dark', {
            bgcolor: 'background.default',
            borderColor: 'background.paper'
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
              <IconButton onClick={() => handleScroll(compactScrollRef, -300)} size="small" sx={{ mr: 1, '&:hover': { bgcolor: 'action.hover' } }}>
                <IconChevronLeft size="16px" />
              </IconButton>
              
              <Box ref={compactScrollRef} sx={{
                display: 'flex',
                alignItems: 'center',
                height: COMPACT_H,
                overflowX: 'auto',
                flex: 1,
                '&::-webkit-scrollbar': { display: 'none' },
                msOverflowStyle: 'none',
                scrollbarWidth: 'none'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <MenuList />
                </Box>
              </Box>

              <IconButton onClick={() => handleScroll(compactScrollRef, 300)} size="small" sx={{ mx: 1, '&:hover': { bgcolor: 'action.hover' } }}>
                <IconChevronRight size="16px" />
              </IconButton>

              {/* Toggle — expand */}
              <Tooltip title="Expand Menu" placement="bottom" arrow>
                <IconButton
                  onClick={() => setRibbonOpen(true)}
                  size="small"
                  sx={{
                    flexShrink: 0, width: 28, height: 28,
                    border: '1px solid', borderColor: 'divider', borderRadius: 1,
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
              <IconButton onClick={() => handleScroll(ribbonScrollRef, -400)} size="small" sx={{ mr: 1, height: 32, '&:hover': { bgcolor: 'action.hover' } }}>
                <IconChevronLeft size="18px" />
              </IconButton>

              <Box ref={ribbonScrollRef} sx={{
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
              }}>
                {/* All groups as sections */}
                <Box sx={{ display: 'flex', alignItems: 'stretch', height: '100%' }}>
                  {groups.map((group, idx) => (
                    <Box key={group.id} sx={{ display: 'flex', alignItems: 'stretch' }}>
                      <RibbonGroupSection group={group} onClose={() => setRibbonOpen(false)} />
                      {idx < groups.length - 1 && (
                        <Divider orientation="vertical" flexItem sx={{ mx: 0.5, my: 0.75, borderColor: 'divider' }} />
                      )}
                    </Box>
                  ))}
                </Box>
              </Box>

              <IconButton onClick={() => handleScroll(ribbonScrollRef, 400)} size="small" sx={{ mx: 1, height: 32, '&:hover': { bgcolor: 'action.hover' } }}>
                <IconChevronRight size="18px" />
              </IconButton>

              {/* Collapse toggle at far right */}
              <Tooltip title="Collapse" placement="bottom" arrow>
                <IconButton
                  onClick={() => setRibbonOpen(false)}
                  size="small"
                  sx={{
                    flexShrink: 0, width: 28, height: 28,
                    border: '1px solid', borderColor: 'primary.main', borderRadius: 1,
                    color: 'primary.main', bgcolor: 'primary.lighter',
                    '&:hover': { bgcolor: 'primary.light' }
                  }}
                >
                  <IconChevronUp size="16px" stroke={2} />
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
