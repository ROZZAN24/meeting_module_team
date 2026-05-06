import {
  IconDashboard,
  IconUsers,
  IconBriefcase,
  IconBuildingFactory,
  IconAward,
  IconTruckDelivery,
  IconReceiptTax,
  IconTool,
  IconServerCog,
  IconListCheck,
  IconReport,
  IconHelp,
  IconChecks,
  IconRocket
} from '@tabler/icons-react';

const icons = {
  IconDashboard,
  IconUsers,
  IconBriefcase,
  IconBuildingFactory,
  IconAward,
  IconTruckDelivery,
  IconReceiptTax,
  IconTool,
  IconServerCog,
  IconListCheck,
  IconReport,
  IconHelp,
  IconChecks,
  IconRocket
};

export const masters = {
  id: 'masters',
  title: 'Master',
  caption: 'Master Q0001',
  type: 'group',
  icon: icons.IconServerCog,
  children: [
    {
      id: 'inventory',
      title: 'Inventory',
      type: 'item',
      url: '/admin/user-credentials',
      icon: icons.IconBox,
      breadcrumbs: true
    },
    {
      id: 'master-hr',
      title: 'HR',
      type: 'collapse',
      icon: icons.IconUsers,
      children: [
        {
          id: 'master-hr-dept-details',
          title: 'Department Details',
          type: 'item',
          url: '/master/hr/department'
        }
      ]
    },
    {
      id: 'master-qms',
      title: 'QMS',
      type: 'collapse',
      icon: icons.IconListCheck,
      children: [
        {
          id: 'master-qms-checklist',
          title: 'Check List',
          type: 'collapse',
          icon: icons.IconListCheck,
          children: [
            {
              id: 'master-qms-checklist-master',
              title: 'Check List Master',
              type: 'item',
              url: '/master/qms/checklist/master'
            },
            {
              id: 'master-qms-audit',
              title: 'Audit',
              type: 'collapse',
              children: [
                {
                  id: 'master-qms-audit-type',
                  title: 'Audit Type',
                  type: 'item',
                  url: '/master/qms/audit/type'
                },
                {
                  id: 'master-qms-audit-area',
                  title: 'Audit Area / Zone',
                  type: 'item',
                  url: '/master/qms/audit/area'
                },
                {
                  id: 'master-qms-audit-criteria',
                  title: 'Audit Criteria',
                  type: 'item',
                  url: '/master/qms/audit/criteria'
                }
              ]
            }
          ]
        }
      ]
    }
  ]
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
          id: 'checklist-verify',
          title: 'Check List Verify',
          type: 'item',
          url: '/qms/checklist/verify',
          icon: icons.IconRocket
        },
        {
          id: 'close-renewal',
          title: 'Close Check List / Renewal',
          type: 'item',
          url: '/qms/checklist/close-renewal',
          icon: icons.IconRocket
        },
        {
          id: 'renewal-verify',
          title: 'Check List / Renewal Verify',
          type: 'item',
          url: '/qms/checklist/renewal-verify',
          icon: icons.IconRocket
        },
        {
          id: 'renewal-report',
          title: 'Check List / Renewal Report',
          type: 'item',
          url: '/qms/checklist/renewal-report',
          icon: icons.IconRocket
        }
      ]
    },
    {
      id: 'qms-audit',
      title: 'Audit',
      type: 'collapse',
      children: [
        {
          id: 'qms-audit-schedule',
          title: 'Audit Schedule',
          type: 'item',
          url: '/qms/audit/schedule'
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
