// assets
import { IconUserPlus, IconUsers, IconShieldLock, IconSettings, IconBuildingSkyscraper } from '@tabler/icons-react';

// constant
const icons = {
  IconUserPlus,
  IconUsers,
  IconShieldLock,
  IconSettings,
  IconBuildingSkyscraper
};

// ==============================|| MENU ITEMS - ADMIN ||============================== //

const admin = {
  id: 'admin',
  title: 'Admin',
  type: 'group',
  icon: icons.IconShieldLock,
  children: [
    {
      id: 'user-credentials',
      title: 'User Credentials',
      type: 'item',
      url: '/admin/user-credentials',
      icon: icons.IconUsers,
      breadcrumbs: true
    },
    {
      id: 'preference-master',
      title: 'App Preference',
      type: 'item',
      url: '/admin/preference-master',
      icon: icons.IconSettings,
      breadcrumbs: true
    },
    {
      id: 'company-profile',
      title: 'Company Profile',
      type: 'item',
      url: '/admin/company-profile',
      icon: icons.IconBuildingSkyscraper,
      breadcrumbs: true
    }
  ]
};

export default admin;
