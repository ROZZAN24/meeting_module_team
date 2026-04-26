// assets
import { IconUserPlus, IconUsers, IconShieldLock } from '@tabler/icons-react';

// constant
const icons = {
  IconUserPlus,
  IconUsers,
  IconShieldLock
};

// ==============================|| MENU ITEMS - ADMIN ||============================== //

const admin = {
  id: 'admin',
  title: 'admin',
  type: 'group',
  icon: icons.IconShieldLock,
  children: [
    {
      id: 'user-overview',
      title: 'user-overview',
      type: 'item',
      url: '/admin/user-overview',
      icon: icons.IconUsers,
      breadcrumbs: true
    }
  ]
};

export default admin;
