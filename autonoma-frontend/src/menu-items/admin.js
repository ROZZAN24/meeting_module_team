// assets
import {
<<<<<<< HEAD
  IconUserPlus, IconUsers, IconShieldLock, IconSettings, IconBuildingSkyscraper,
  IconAccessPoint, IconHistory, IconLayoutColumns, IconTimeline,
  IconFingerprint, IconActivity, IconUserShield, IconCategory
=======
  IconUserPlus, IconUsers, IconShieldLock, IconSettings, IconBuildingSkyscraper
  , IconAccessPoint, IconHistory
>>>>>>> origin/chore/repo-cleanup
} from '@tabler/icons-react';

// constant
const icons = {
  IconUserPlus,
  IconUsers,
  IconShieldLock,
  IconSettings,
  IconBuildingSkyscraper,
  IconAccessPoint,
<<<<<<< HEAD
  IconHistory,
  IconLayoutColumns,
  IconTimeline,
  IconFingerprint,
  IconActivity,
  IconUserShield,
  IconCategory
=======
  IconHistory
>>>>>>> origin/chore/repo-cleanup
};

// ==============================|| MENU ITEMS - ADMIN ||============================== //

const admin = {
  id: 'admin',
  title: 'Admin',
  type: 'group',
  icon: icons.IconShieldLock,
  children: [
    {
<<<<<<< HEAD
      id: 'admin-hub',
      title: 'Admin Hub',
      type: 'collapse',
      icon: icons.IconCategory,
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
          title: 'Division Master (Units)',
          type: 'item',
          url: '/admin/division',
          icon: icons.IconLayoutColumns,
          breadcrumbs: true
        },
        {
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
    },
    {
      id: 'BOS(S)-Admin',
      title: 'BOS(S) Admin',
      type: 'collapse',
      icon: icons.IconUserShield,
      children: [
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
        },
        {
          id: 'prefix-credentials',
          title: 'Prefix/Suffix Credentials',
          type: 'item',
          url: '/admin/prefix-credentials',
          icon: icons.IconSettings,
          breadcrumbs: true
        },
        {
          id: 'session-monitoring',
          title: 'Session Monitoring',
          type: 'item',
          url: '/admin/session-monitoring',
          icon: icons.IconActivity,
          breadcrumbs: true
        }
      ]
=======
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
>>>>>>> origin/chore/repo-cleanup
    }
  ]
};

export default admin;
