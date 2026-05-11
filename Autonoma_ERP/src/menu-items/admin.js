// assets
import {
  IconUserPlus, IconUsers, IconShieldLock, IconSettings, IconBuildingSkyscraper
  , IconAccessPoint, IconHistory
} from '@tabler/icons-react';

// constant
const icons = {
  IconUserPlus,
  IconUsers,
  IconShieldLock,
  IconSettings,
  IconBuildingSkyscraper,
  IconAccessPoint,
  IconHistory
};

// ==============================|| MENU ITEMS - ADMIN ||============================== //

const admin = {
  id: 'admin',
  title: 'Admin',
  type: 'group',
  icon: icons.IconShieldLock,
  children: [
    {
      id: 'company-profile',
      title: 'Company Profile',
      type: 'item',
      url: '/admin/company-profile',
      icon: icons.IconBuildingSkyscraper,
      breadcrumbs: true
    },
    {
      id: 'business-authorization',
      title: 'Business Authorization',
      type: 'item',
      url: '/admin/business-authorization',
      icon: icons.IconShieldLock,
      breadcrumbs: true
    },
    {
      id: 'preference-master',
      title: 'App Preference',
      type: 'item',
      url: '/admin/preference-master',
      icon: icons.IconSettings,
      breadcrumbs: true
    }, {
      id: 'user-credentials',
      title: 'User Credentials',
      type: 'item',
      url: '/admin/user-credentials',
      icon: icons.IconUsers,
      breadcrumbs: true
    },

    {
      id: 'user-access',
      title: 'User Access',
      type: 'item',
      url: '/admin/user-access',
      icon: icons.IconAccessPoint,
      breadcrumbs: true
    },
    {
      id: 'session-monitoring',
      title: 'Session Monitoring',
      type: 'item',
      url: '/admin/session-monitoring',
      icon: icons.IconHistory,
      breadcrumbs: true
    }
  ]
};

export default admin;
