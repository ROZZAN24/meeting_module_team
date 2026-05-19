import { memo, useLayoutEffect, useState, useEffect } from 'react';

import useMediaQuery from '@mui/material/useMediaQuery';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// project imports
import NavItem from './NavItem';
import NavGroup from './NavGroup';
import { MenuOrientation } from 'config';
import menuItem from 'menu-items';
import useConfig from 'hooks/useConfig';
import useAuth from 'hooks/useAuth';
import { useDispatch, useSelector } from 'store';
import { fetchUserPermissions } from 'store/slices/permissions';

import { HORIZONTAL_MAX_ITEM } from 'config';
import { useGetMenu, useGetMenuMaster } from 'api/menu';

// ==============================|| SIDEBAR MENU LIST ||============================== //

/**
 * Recursively filter menu items based on permission flags.
 * - type 'item' with a pageCode: hidden if enable === false
 * - type 'collapse': recursively filter children, hidden if all children removed
 * - type 'group': recursively filter children, hidden if all children removed
 * - Items without a pageCode: always visible (backwards compatible)
 */
function filterMenuByPermissions(items, permMap) {
  if (!items || !Array.isArray(items)) return [];

  return items
    .map((item) => {
      // Leaf item with a pageCode → check if user has enable=true
      if (item.type === 'item' && item.pageCode) {
        const perm = permMap[item.pageCode];
        // If permission record exists and enable is explicitly false → hide
        if (perm && perm.enable === false) return null;
        return item;
      }

      // Collapse or group with children → recursively filter
      if ((item.type === 'collapse' || item.type === 'group') && item.children) {
        const filteredChildren = filterMenuByPermissions(item.children, permMap);
        // Hide the group/collapse if all children were removed
        if (filteredChildren.length === 0) return null;
        return { ...item, children: filteredChildren };
      }

      // Everything else (dividers, headers, items without pageCode) → keep
      return item;
    })
    .filter(Boolean);
}

function MenuList() {
  const downMD = useMediaQuery((theme) => theme.breakpoints.down('md'));
  const reduxDispatch = useDispatch();
  const { user } = useAuth();

  const {
    state: { menuOrientation }
  } = useConfig();
  const { menu, menuLoading } = useGetMenu();
  const { menuMaster } = useGetMenuMaster();
  const drawerOpen = menuMaster.isDashboardDrawerOpened;
  const isHorizontal = menuOrientation === MenuOrientation.HORIZONTAL && !downMD;

  const [selectedID, setSelectedID] = useState('');
  const [menuItems, setMenuItems] = useState({ items: [] });

  // ── Fetch permissions on mount (once per session) ──
  const permStatus = useSelector((state) => state.permissions.status);
  const permMap = useSelector((state) => state.permissions.map);

  useEffect(() => {
    if (user?.id && permStatus === 'idle') {
      reduxDispatch(fetchUserPermissions(user.id));
    }
  }, [user?.id, permStatus, reduxDispatch]);

  // ── Build filtered menu items ──
  useLayoutEffect(() => {
    let currentItems = [...menuItem.items];

    // Apply permission filtering only when permissions are loaded
    if (permStatus === 'loaded' && Object.keys(permMap).length > 0) {
      currentItems = filterMenuByPermissions(currentItems, permMap);
    }

    setMenuItems({ items: currentItems });
  }, [menuLoading, menu, permStatus, permMap]);

  // last menu-item to show in horizontal menu bar
  const lastItem = isHorizontal ? HORIZONTAL_MAX_ITEM : null;

  let lastItemIndex = menuItems.items.length - 1;
  let remItems = [];
  let lastItemId;

  if (lastItem && lastItem < menuItems.items.length) {
    lastItemId = menuItems.items[lastItem - 1].id;
    lastItemIndex = lastItem - 1;
    remItems = menuItems.items.slice(lastItem - 1, menuItems.items.length).map((item) => ({
      title: item.title,
      elements: item.children,
      icon: item.icon,
      ...(item.url && {
        url: item.url
      })
    }));
  }

  const navItems = menuItems.items.slice(0, lastItemIndex + 1).map((item, index) => {
    switch (item.type) {
      case 'group':
        if (item.url && item.id !== lastItemId) {
          return (
            <List key={item.id}>
              <NavItem item={item} level={1} isParents setSelectedID={() => setSelectedID('')} />
              {!isHorizontal && index !== 0 && <Divider sx={{ py: 0.5 }} />}
            </List>
          );
        }

        return (
          <NavGroup
            key={item.id}
            setSelectedID={setSelectedID}
            selectedID={selectedID}
            item={item}
            lastItem={lastItem}
            remItems={remItems}
            lastItemId={lastItemId}
          />
        );
      default:
        return (
          <Typography key={item.id} variant="h6" align="center" sx={{ color: 'error.main' }}>
            Menu Items Error
          </Typography>
        );
    }
  });

  return !isHorizontal ? <Box {...(drawerOpen && { sx: { mt: 1.5 } })}>{navItems}</Box> : <>{navItems}</>;
}

export default memo(MenuList);
