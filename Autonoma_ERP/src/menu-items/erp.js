import { IconDashboard, IconUsers, IconBriefcase, IconBuildingFactory, IconAward, IconTruckDelivery, IconReceiptTax, IconTool, IconServerCog, IconListCheck, IconReport, IconHelp, IconChecks } from '@tabler/icons-react';

const icons = {
  IconDashboard, IconUsers, IconBriefcase, IconBuildingFactory, IconAward, IconTruckDelivery, IconReceiptTax, IconTool, IconServerCog, IconListCheck, IconReport, IconHelp
  , IconChecks
};

export const masters = {
  id: 'masters',
  title: 'Masters',
  caption: 'Masters M0000',
  type: 'group',
  icon: icons.IconServerCog,
  children: []
};

export const hra = {
  id: 'hra',
  title: 'HRA',
  caption: 'HR & Admin HA0000',
  type: 'group',
  icon: icons.IconUsers,
  children: []
};

export const sm = {
  id: 'sm',
  title: 'Sales & Marketing',
  caption: 'Sales & Marketing SM0000',
  type: 'group',
  icon: icons.IconBriefcase,
  children: []
};

export const pp = {
  id: 'pp',
  title: 'Planning & Purchase',
  caption: 'Planning & Purchase PP0000',
  type: 'group',
  icon: icons.IconBriefcase,
  children: []
};

export const production = {
  id: 'production',
  title: 'Production',
  caption: 'Production P0000',
  type: 'group',
  icon: icons.IconBuildingFactory,
  children: []
};

export const quality = {
  id: 'quality',
  title: 'Quality',
  caption: 'Quality Q0000',
  type: 'group',
  icon: icons.IconAward,
  children: []
};

export const sl = {
  id: 'sl',
  title: 'Stores & Logistics',
  caption: 'Stores & Logistics SL0000',
  type: 'group',
  icon: icons.IconTruckDelivery,
  children: []
};

export const fa = {
  id: 'fa',
  title: 'Finance & Accounts',
  caption: 'Finance & Accounts FA0000',
  type: 'group',
  icon: icons.IconReceiptTax,
  children: []
};

export const dd = {
  id: 'dd',
  title: 'Design & Development',
  caption: 'Design & Development DD0000',
  type: 'group',
  icon: icons.IconTool,
  children: []
};

export const ms = {
  id: 'ms',
  title: 'Maintenance & Services',
  caption: 'Maintenance & Services MS0000',
  type: 'group',
  icon: icons.IconServerCog,
  children: []
};

export const qms = {
  id: 'qms',
  title: 'Quality Management Systems',
  caption: 'Quality Management Systems QM0000',
  type: 'group',
  icon: icons.IconListCheck,
  children: [
    {
      id: 'qms-checklist',
      title: 'Check List',
      type: 'collapse',
      icon: icons.IconChecks,
      children: [
        {
          id: 'master-checklist',
          title: 'Master Check List',
          type: 'item',
          url: '/qms/checklist/master'
        },
        {
          id: 'checklist-verify',
          title: 'Check List Verify',
          type: 'item',
          url: '/qms/checklist/verify'
        },
        {
          id: 'close-renewal',
          title: 'Close Check List / Renewal',
          type: 'item',
          url: '/qms/checklist/close-renewal'
        },
        {
          id: 'renewal-verify',
          title: 'Check List / Renewal Verify',
          type: 'item',
          url: '/qms/checklist/renewal-verify'
        },
        {
          id: 'renewal-report',
          title: 'Check List / Renewal Report',
          type: 'item',
          url: '/qms/checklist/renewal-report'
        }
      ]
    }
  ]
};

export const reports = {
  id: 'reports',
  title: 'Reports',
  caption: 'Reports R0000',
  type: 'group',
  icon: icons.IconReport,
  children: []
};

export const erpSupport = {
  id: 'erp-support',
  title: 'Support',
  caption: 'Support S0000',
  type: 'group',
  icon: icons.IconHelp,
  children: []
};
