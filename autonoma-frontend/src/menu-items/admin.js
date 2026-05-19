// assets
import {
  IconUserPlus, IconUsers, IconShieldLock, IconSettings, IconBuildingSkyscraper,
  IconAccessPoint, IconHistory, IconLayoutColumns, IconTimeline,
  IconFingerprint, IconActivity, IconUserShield, IconCategory, IconFileAnalytics
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
  IconLayoutColumns,
  IconTimeline,
  IconFingerprint,
  IconActivity,
  IconUserShield,
  IconCategory,
  IconFileAnalytics
};

// ==============================|| MENU ITEMS - ADMIN ||============================== //

const admin = {
  id: 'admin',
  title: 'Admin',
  type: 'group',
  icon: icons.IconShieldLock,
  children: [
    {
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
          breadcrumbs: true,
          pageCode: 'AD1110'
        },
        {
          id: 'division-master',
          title: 'Division Master (Units)',
          type: 'item',
          url: '/admin/division',
          icon: icons.IconLayoutColumns,
          breadcrumbs: true,
          pageCode: 'AD1120'
        },
        {
          id: 'user-credentials',
          title: 'User Credentials',
          type: 'item',
          url: '/admin/user-credentials',
          icon: icons.IconUsers,
          breadcrumbs: true,
          pageCode: 'AD1130'
        },
        {
          id: 'user-access',
          title: 'User Access',
          type: 'item',
          url: '/admin/user-access',
          icon: icons.IconFingerprint,
          breadcrumbs: true,
          pageCode: 'AD1140'
        },
        {
          id: 'audit-trail',
          title: 'Audit Trail',
          type: 'item',
          url: '/admin/audit-trail',
          icon: icons.IconHistory,
          breadcrumbs: true,
          pageCode: 'AD1150'
        },
        {
          id: 'session-analytics',
          title: 'User Session Analytics',
          type: 'item',
          url: '/admin/session-analytics',
          icon: icons.IconTimeline,
          breadcrumbs: true,
          pageCode: 'AD1160'
        },
        {
          id: 'file-traceability-hub',
          title: 'File Traceability Hub',
          type: 'item',
          url: '/admin/file-traceability-hub',
          icon: icons.IconFileAnalytics,
          breadcrumbs: true,
          pageCode: 'AD1170'
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
          breadcrumbs: true,
          pageCode: 'AD1210'
        },
        {
          id: 'preference-master',
          title: 'App Preference',
          type: 'item',
          url: '/admin/preference-master',
          icon: icons.IconSettings,
          breadcrumbs: true,
          pageCode: 'AD1220'
        },
        {
          id: 'prefix-credentials',
          title: 'Prefix/Suffix Credentials',
          type: 'item',
          url: '/admin/prefix-credentials',
          icon: icons.IconSettings,
          breadcrumbs: true,
          pageCode: 'AD1230'
        },
        {
          id: 'session-monitoring',
          title: 'Session Monitoring',
          type: 'item',
          url: '/admin/session-monitoring',
          icon: icons.IconActivity,
          breadcrumbs: true,
          pageCode: 'AD1240'
        }
      ]
    }
  ]
};

export default admin;
