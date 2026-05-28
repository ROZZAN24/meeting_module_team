// assets
import { IconDashboard, IconDeviceAnalytics, IconFileInvoice, IconArticle, IconLifebuoy, IconClipboardList } from '@tabler/icons-react';

const icons = {
  IconDashboard: IconDashboard,
  IconDeviceAnalytics: IconDeviceAnalytics,
  IconFileInvoice: IconFileInvoice,
  IconArticle: IconArticle,
  IconLifebuoy: IconLifebuoy,
  IconClipboardList: IconClipboardList
};

// ==============================|| MENU ITEMS - DASHBOARD ||============================== //

const dashboard = {
  id: 'dashboard',
  title: 'Dashboard',
  icon: icons.IconDashboard,
  type: 'group',
  children: [
    {
      id: 'user-task-queue',
      title: 'Unified Work Dashboard',
      type: 'item',
      url: '/dashboard/user-task-queue',
      icon: icons.IconClipboardList,
      breadcrumbs: false
    },
    {
      id: 'default',
      title: 'Default',
      type: 'item',
      url: '/dashboard/default',
      icon: icons.IconDashboard,
      breadcrumbs: false
    },
    {
      id: 'analytics',
      title: 'Analytics',
      type: 'item',
      url: '/dashboard/analytics',
      icon: icons.IconDeviceAnalytics,
      breadcrumbs: false
    },
    {
      id: 'invoice1',
      title: 'Invoice',
      icon: icons.IconFileInvoice,
      type: 'item',
      url: '/dashboard/invoice',
      breadcrumbs: false
    },
    {
      id: 'crm1',
      title: 'CRM',
      icon: icons.IconLifebuoy,
      type: 'item',
      url: '/dashboard/crm',
      breadcrumbs: false
    },
    {
      id: 'blog1',
      title: 'Blog',
      icon: icons.IconArticle,
      type: 'item',
      url: '/dashboard/blog',
      breadcrumbs: false
    }
  ]
};

export default dashboard;
