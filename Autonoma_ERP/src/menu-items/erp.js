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
          url: '/master/hr/department',
          icon: icons.IconBuildingFactory
        },
        {
          id: 'master-hr-designation-details',
          title: 'Designation Details',
          type: 'item',
          url: '/master/hr/designation',
          icon: icons.IconUsers
        },
        {
          id: 'master-hr-grade-details',
          title: 'Grade Details',
          type: 'item',
          url: '/master/hr/grade',
          icon: icons.IconAward
        },
        {
          id: 'master-hr-designation-level',
          title: 'Designation Level',
          type: 'item',
          url: '/master/hr/desg-level',
          icon: icons.IconChecks
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
          type: 'item',
          url: '/master/qms/checklist/master',
          icon: icons.IconChecks
        },
        {
          id: 'master-qms-audit',
          title: 'Audit',
          type: 'collapse',
          icon: icons.IconReport,
          children: [
            {
              id: 'master-qms-audit-type',
              title: 'Audit Type',
              type: 'item',
              url: '/master/qms/audit/type',
              icon: icons.IconTool
            },
            {
              id: 'master-qms-audit-area',
              title: 'Audit Area / Zone',
              type: 'item',
              url: '/master/qms/audit/area',
              icon: icons.IconBuildingFactory
            },
            {
              id: 'master-qms-audit-criteria',
              title: 'Audit Criteria',
              type: 'item',
              url: '/master/qms/audit/criteria',
              icon: icons.IconListCheck
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
  children: [
    {
      id: 'hra-hr-employee',
      title: 'Employee',
      type: 'collapse',
      icon: icons.IconUsers,
      children: [
        {
          id: 'hra-hr-employee-details',
          title: 'Employee Master',
          type: 'item',
          url: '/hra/employee/master',
          icon: icons.IconBriefcase
        }
      ]
    }
  ]
};

export const sm = {
  id: 'sm',
  title: 'Sales & Marketing',
  caption: 'Sales & Marketing SM0000',
  type: 'group',
  icon: icons.IconBriefcase,
  children: [
    {
      id: 'sm-ocr',
      title: 'OCR',
      type: 'collapse',
      icon: icons.IconServerCog,
      children: [
        {
          id: 'sm-enquiry-dashboard',
          title: 'Enquiry Dashboard',
          type: 'item',
          url: '/sm/enquiry/dashboard',
          icon: icons.IconDashboard
        },
        {
          id: 'sm-customer-master',
          title: 'Customer Master',
          type: 'item',
          url: '/sm/customers',
          icon: icons.IconUsers
        },
        {
          id: 'sm-vendor',
          title: 'Vendor',
          type: 'collapse',
          icon: icons.IconTruckDelivery,
          children: [
            {
              id: 'sm-supplier-master',
              title: 'Supplier Master',
              type: 'item',
              url: '/sm/suppliers',
              icon: icons.IconTruckDelivery
            },
            {
              id: 'sm-subcontractor',
              title: 'Sub Contractor',
              type: 'item',
              url: '/sm/sub-contractors',
              icon: icons.IconTool
            }
          ]
        },
        {
          id: 'sm-contact-master',
          title: 'Contact Master',
          type: 'item',
          url: '/sm/contacts',
          icon: icons.IconUsers
        },
        {
          id: 'sm-enquiry',
          title: 'Enquiry',
          type: 'item',
          url: '/sm/enquiries',
          icon: icons.IconListCheck
        },
        {
          id: 'sm-price-master',
          title: 'Price Master',
          type: 'item',
          url: '/sm/price-master',
          icon: icons.IconReport
        },
        {
          id: 'sm-quotation',
          title: 'Quotation',
          type: 'item',
          url: '/sm/quotations',
          icon: icons.IconReport
        },
        {
          id: 'sm-work-items',
          title: 'Work Items',
          type: 'item',
          url: '/sm/work-items',
          icon: icons.IconRocket
        }
      ]
    }
  ]
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
      icon: icons.IconReport,
      children: [
        {
          id: 'qms-audit-schedule',
          title: 'Audit Schedule',
          type: 'item',
          url: '/qms/audit/schedule',
          icon: icons.IconListCheck
        },
        {
          id: 'qms-audit-attendance',
          title: 'Audit User Attendance',
          type: 'item',
          url: '/qms/audit/attendance',
          icon: icons.IconUsers
        },
        {
          id: 'qms-audit-observation',
          title: 'Audit Observation',
          type: 'item',
          url: '/qms/audit/observation',
          icon: icons.IconDashboard
        },
        {
          id: 'qms-audit-ncr-close',
          title: 'Close NCR / OFI',
          type: 'item',
          url: '/qms/audit/ncr/close',
          icon: icons.IconChecks
        },
        {
          id: 'qms-audit-ncr-approval',
          title: 'Audit NCR / OFI approval',
          type: 'item',
          url: '/qms/audit/ncr/approval',
          icon: icons.IconAward
        },
        {
          id: 'qms-audit-report',
          title: 'Audit Report',
          type: 'item',
          url: '/qms/audit/report',
          icon: icons.IconReport
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
