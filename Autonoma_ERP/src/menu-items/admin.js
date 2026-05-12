// assets
import {
  IconUserPlus, IconUsers, IconShieldLock, IconSettings, IconBuildingSkyscraper
<<<<<<< HEAD
  , IconAccessPoint, IconHistory, IconLayoutColumns
=======
  , IconAccessPoint, IconHistory, IconFingerprint, IconActivity, IconTimeline
>>>>>>> 6e447be8196c25206d186b7b32067fff78e84c05
} from '@tabler/icons-react';

// constant
const icons = {
  IconUserPlus,
  IconUsers,
  IconShieldLock,
  IconSettings,
  IconBuildingSkyscraper,
  IconAccessPoint,
  IconHistory,
<<<<<<< HEAD
  IconLayoutColumns
=======
  IconFingerprint,
  IconActivity,
  IconTimeline
>>>>>>> 6e447be8196c25206d186b7b32067fff78e84c05
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
      id: 'division-master',
      title: 'Division Master',
      type: 'item',
      url: '/admin/division-master',
      icon: icons.IconLayoutColumns,
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
      icon: icons.IconFingerprint,
      breadcrumbs: true
    },
    {
      id: 'session-monitoring',
      title: 'Session Audit Control',
      type: 'item',
      url: '/admin/session-monitoring',
      icon: icons.IconActivity,
      breadcrumbs: true
    },
    {
      id: 'audit-trail',
      title: 'Audit Trail',
      type: 'item',
      url: '/admin/audit-trail',
      icon: icons.IconHistory,
      breadcrumbs: true
    },
    {
      id: 'session-analytics',
      title: 'User Session Analytics',
      type: 'item',
      url: '/admin/session-analytics',
      icon: icons.IconTimeline,
      breadcrumbs: true
    }
  ]
};

export default admin;
