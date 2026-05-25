import PropTypes from 'prop-types';
import { Fragment, useEffect, useState } from 'react';
import { matchPath, useLocation } from 'react-router-dom';

// material-ui
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';

// third party
import { FormattedMessage } from 'react-intl';

// project imports
import NavCollapse from '../NavCollapse';
import NavItem from '../NavItem';

import { MenuOrientation } from 'config';
import useConfig from 'hooks/useConfig';
import Transitions from 'ui-component/extended/Transitions';
import { useGetMenuMaster } from 'api/menu';

// assets
import { IconChevronDown, IconChevronRight, IconMinusVertical } from '@tabler/icons-react';

// ==============================|| SIDEBAR MENU LIST GROUP ||============================== //

export default function NavGroup({ item, lastItem, remItems, lastItemId, selectedID, setSelectedID }) {
  const theme = useTheme();
  const downMD = useMediaQuery(theme.breakpoints.down('md'));
  const { pathname } = useLocation();

  const {
    state: { menuOrientation, borderRadius }
  } = useConfig();
  const { menuMaster } = useGetMenuMaster();
  const drawerOpen = menuMaster.isDashboardDrawerOpened;
  const isHorizontal = menuOrientation === MenuOrientation.HORIZONTAL && !downMD;

  const [anchorEl, setAnchorEl] = useState(null);
  const [currentItem, setCurrentItem] = useState(item);

  const openMini = Boolean(anchorEl);

  useEffect(() => {
    if (lastItem) {
      if (item.id === lastItemId) {
        const localItem = { ...item };
        const elements = remItems.map((ele) => ele.elements);
        localItem.children = elements.flat(1);
        setCurrentItem(localItem);
      } else {
        setCurrentItem(item);
      }
    }
  }, [item, lastItem, menuOrientation, remItems, lastItemId]);

  const checkOpenForParent = (child, id) => {
    child.forEach((ele) => {
      if (ele.children?.length) {
        checkOpenForParent(ele.children, currentItem.id);
      }
      if (ele?.url && !!matchPath({ path: ele?.link ? ele.link : ele.url, end: true }, pathname)) {
        setSelectedID(id);
      }
    });
  };

  const checkSelectedOnload = (data) => {
    const childrens = data.children ? data.children : [];
    childrens.forEach((itemCheck) => {
      if (itemCheck?.children?.length) {
        checkOpenForParent(itemCheck.children, currentItem.id);
      }
      if (itemCheck?.url && !!matchPath({ path: itemCheck?.link ? itemCheck.link : itemCheck.url, end: true }, pathname)) {
        setSelectedID(currentItem.id);
      }
    });

    if (data?.url && !!matchPath({ path: data?.link ? data.link : data.url, end: true }, pathname)) {
      setSelectedID(currentItem.id);
    }
  };

  // keep selected-menu on page load and use for horizontal menu close on change routes
  useEffect(() => {
    checkSelectedOnload(currentItem);
    if (openMini) setAnchorEl(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, currentItem]);

  const handleClick = (event) => {
    if (!openMini) {
      setAnchorEl(event?.currentTarget);
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const Icon = currentItem?.icon;
  const itemIcon = currentItem?.icon ? <Icon stroke={1.5} size="20px" /> : null;

  // menu list collapse & items
  const items = currentItem.children?.map((menu) => {
    switch (menu?.type) {
      case 'collapse':
        return <NavCollapse key={menu.id} menu={menu} level={1} parentId={currentItem.id} />;
      case 'item':
        return <NavItem key={menu.id} item={menu} level={1} />;
      default:
        return (
          <Typography key={menu?.id} variant="h6" align="center" sx={{ color: 'error.main' }}>
            Menu Items Error
          </Typography>
        );
    }
  });

  const moreItems = remItems.map((itemRem, i) => (
    <Fragment key={i}>
      {itemRem.url ? (
        <NavItem item={itemRem} level={1} />
      ) : (
        itemRem.title ? (
          <Typography variant="caption" sx={{ pl: 2 }}>
            {itemRem.title} {itemRem.url}
          </Typography>
        ) : null
      )}
      {itemRem?.elements?.map((menu) => {
        switch (menu?.type) {
          case 'collapse':
            return <NavCollapse key={menu.id} menu={menu} level={1} parentId={currentItem.id} />;
          case 'item':
            return <NavItem key={menu.id} item={menu} level={1} />;
          default:
            return (
              <Typography key={menu.id} variant="h6" align="center" sx={{ color: 'error.main' }}>
                Menu Items Error
              </Typography>
            );
        }
      })}
    </Fragment>
  ));

  const popperId = openMini ? `group-pop-${item.id}` : undefined;
  const isSelected = selectedID === currentItem.id;

  return (
    <>
      {!isHorizontal ? (
        <>
          <List
            disablePadding={!drawerOpen}
            subheader={
              currentItem.title &&
              drawerOpen && (
                <Typography
                  variant="caption"
                  gutterBottom
                  sx={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    color: 'text.heading',
                    padding: 0.75,
                    textTransform: 'capitalize',
                    marginTop: 1.25
                  }}
                >
                  <FormattedMessage id={currentItem.title} />
                  {currentItem.caption && (
                    <Typography
                      gutterBottom
                      component="span"
                      sx={{
                        display: 'block',
                        fontSize: '0.6875rem',
                        fontWeight: 500,
                        color: 'text.secondary',
                        textTransform: 'capitalize',
                        lineHeight: 1.66
                      }}
                    >
                      <FormattedMessage id={currentItem.caption} />
                    </Typography>
                  )}
                </Typography>
              )
            }
          >
            {items}
          </List>

          {/* group divider */}
          {drawerOpen && (
            <Divider sx={{ mt: 0.25, mb: 1.25 }} />
          )}
        </>
      ) : (
        <List sx={{ display: 'flex', alignItems: 'center' }}>
          <Tooltip title={<FormattedMessage id={currentItem.title} defaultMessage={currentItem.title} />} placement="bottom" arrow>
            <ListItemButton
              selected={isSelected}
              sx={{
                borderRadius: `${borderRadius}px`,
                p: 1,
                my: 0.5,
                mr: 0.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: 0,
                backgroundColor: 'inherit'
              }}
              onMouseEnter={handleClick}
              onClick={handleClick}
              onMouseLeave={handleClose}
              aria-describedby={popperId}
              className={anchorEl ? 'Mui-selected' : ''}
            >
              {/* Icon and Sub-icons container */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {itemIcon && (
                  <ListItemIcon sx={{ minWidth: 0, color: isSelected ? 'primary.main' : 'inherit' }}>
                    {currentItem.id === lastItemId ? <IconMinusVertical stroke={1.5} size="20px" /> : itemIcon}
                  </ListItemIcon>
                )}

                {/* Sub-menu icons (max 5) */}
                {currentItem.children && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, opacity: 0.6 }}>
                    {currentItem.children
                      .filter((child) => child.icon)
                      .slice(0, 5)
                      .map((child) => {
                        const ChildIcon = child.icon;
                        return <ChildIcon key={child.id} stroke={1.5} size="14px" />;
                      })}
                  </Box>
                )}
              </Box>{' '}
              {anchorEl && (
                <Popper
                  id={popperId}
                  open={openMini}
                  anchorEl={anchorEl}
                  placement="bottom-start"
                  sx={{
                    overflow: 'visible',
                    zIndex: 2001,
                    minWidth: 220,
                    '&:before': {
                      content: '""',
                      display: 'block',
                      position: 'absolute',
                      top: 5,
                      left: 20,
                      width: 12,
                      height: 12,
                      transform: 'translateY(-50%) rotate(45deg)',
                      zIndex: 120,
                      borderWidth: '6px',
                      borderStyle: 'solid',
                      borderTopColor: 'background.paper',
                      borderLeftColor: 'background.paper',
                      borderRightColor: 'transparent',
                      borderBottomColor: 'transparent'
                    }
                  }}
                >
                  {({ TransitionProps }) => (
                    <Transitions in={openMini} {...TransitionProps}>
                      <Paper
                        sx={{
                          mt: 0.5,
                          py: 1,
                          boxShadow: theme.shadows[8],
                          backgroundImage: 'none',
                          minWidth: 220
                        }}
                      >
                        <ClickAwayListener onClickAway={handleClose}>
                          <Box
                            sx={{
                              maxHeight: 'calc(100vh - 170px)',
                              overflowY: 'auto',
                              '&::-webkit-scrollbar': {
                                opacity: 0,
                                width: 4,
                                '&:hover': { opacity: 0.7 }
                              },
                              '&::-webkit-scrollbar-track': { bgcolor: 'transparent' },
                              '&::-webkit-scrollbar-thumb': { bgcolor: 'divider', borderRadius: 4 }
                            }}
                          >
                            {/* Group title header in dropdown */}
                            <Typography
                              variant="caption"
                              sx={{
                                display: 'block',
                                px: 2,
                                pt: 0.5,
                                pb: 1,
                                fontWeight: 600,
                                color: 'text.secondary',
                                textTransform: 'uppercase',
                                letterSpacing: '0.08em',
                                fontSize: '0.65rem',
                                borderBottom: '1px solid',
                                borderColor: 'divider',
                                mb: 0.5
                              }}
                            >
                              <FormattedMessage id={currentItem.title} defaultMessage={currentItem.title} />
                            </Typography>

                            {currentItem.id !== lastItemId ? items : moreItems}
                          </Box>
                        </ClickAwayListener>
                      </Paper>
                    </Transitions>
                  )}
                </Popper>
              )}
            </ListItemButton>
          </Tooltip>
          {currentItem.id !== lastItemId && (
            <Divider orientation="vertical" flexItem sx={{ height: 24, alignSelf: 'center', mx: 0.5, borderColor: 'divider' }} />
          )}
        </List>
      )}
    </>
  );
}

NavGroup.propTypes = {
  item: PropTypes.any,
  lastItem: PropTypes.number,
  remItems: PropTypes.array,
  lastItemId: PropTypes.string,
  selectedID: PropTypes.oneOfType([PropTypes.any, PropTypes.string]),
  setSelectedID: PropTypes.oneOfType([PropTypes.any, PropTypes.func])
};
