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
  IconRocket,
  IconUsersGroup,
  IconCoins,
  IconChartBar,
  IconChartPie,
  IconCreditCard,
  IconMapPin
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
  IconRocket,
  IconUsersGroup,
  IconCoins,
  IconChartBar,
  IconChartPie,
  IconCreditCard,
  IconMapPin
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
      children: [
        {
          id: 'master-hr-dept-details',
          title: 'Department Details',
          type: 'item',
          url: '/master/hr/department'
        },
        {
          id: 'master-hr-designation-details',
          title: 'Designation Details',
          type: 'item',
          url: '/master/hr/designation'
        },
        {
          id: 'master-hr-grade-details',
          title: 'Grade Details',
          type: 'item',
          url: '/master/hr/grade'
        },
        {
          id: 'master-hr-designation-level',
          title: 'Designation Level',
          type: 'item',
          url: '/master/hr/desg-level'
        }
      ]
    },
    {
      id: 'master-qms',
      title: 'QMS',
      type: 'collapse',
      children: [
        {
          id: 'master-qms-checklist-parent',
          title: 'Checklist',
          type: 'collapse',
          children: [
            {
              id: 'master-qms-checklist',
              title: 'Checklist Master',
              type: 'item',
              url: '/master/qms/checklist/master'
            }
          ]
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
    },
    {
      id: 'master-meeting',
      title: 'Meeting',
      type: 'collapse',
      children: [
        {
          id: 'master-meeting-master',
          title: 'Meeting Master',
          type: 'item',
          url: '/master/qms/meeting/master'
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
      children: [
        {
          id: 'hra-hr-employee-details',
          title: 'Employee Master',
          type: 'item',
          url: '/hra/employee/master'
        }
      ]
    },
    {
      id: 'sam',
      title: 'SAM - Sales & Management',
      type: 'collapse',
      icon: icons.IconBriefcase,
      children: [
        {
          id: 'sam-ocr',
          title: 'OCR',
          type: 'collapse',
          icon: icons.IconServerCog,
          children: [
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
              id: 'sm-customer-address',
              title: 'Customer Address',
              type: 'item',
              url: '/sm/customer-address',
              icon: icons.IconMapPin
            },
            {
              id: 'sm-currency-master',
              title: 'Currency Master',
              type: 'item',
              url: '/sm/ocr/currency-master',
              icon: icons.IconCoins
            },
            {
              id: 'sm-segment-master',
              title: 'Segment Master',
              type: 'item',
              url: '/sm/ocr/segment-master',
              icon: icons.IconChartBar
            },
            {
              id: 'sm-sub-segment-master',
              title: 'Sub Segment Master',
              type: 'item',
              url: '/sm/ocr/sub-segment-master',
              icon: icons.IconChartPie
            },
            {
              id: 'sm-payment-terms',
              title: 'Payment Terms',
              type: 'item',
              url: '/sm/ocr/payment-terms',
              icon: icons.IconCreditCard
            },
            {
              id: 'sm-delivery-terms',
              title: 'Delivery Terms',
              type: 'item',
              url: '/sm/ocr/delivery-terms',
              icon: icons.IconTruckDelivery
            }

          ]
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
      id: 'sm-enquiry-dashboard',
      title: 'Enquiry Dashboard',
      type: 'item',
      url: '/sm/enquiry/dashboard',
      icon: icons.IconDashboard
    },
    {
      id: 'sm-work-items',
      title: 'Work Items',
      type: 'item',
      url: '/sm/work-items',
      icon: icons.IconRocket
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
      title: 'Checklist',
      type: 'collapse',
      children: [
        {
          id: 'checklist-verify',
          title: 'Checklist Verify',
          type: 'item',
          url: '/qms/checklist/verify'
        },
        {
          id: 'close-renewal',
          title: 'Close Checklist / Renewal',
          type: 'item',
          url: '/qms/checklist/close-renewal'
        },
        {
          id: 'renewal-verify',
          title: 'Checklist / Renewal Verify',
          type: 'item',
          url: '/qms/checklist/renewal-verify'
        },
        {
          id: 'renewal-report',
          title: 'Checklist / Renewal Report',
          type: 'item',
          url: '/qms/checklist/renewal-report'
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
        },
        {
          id: 'qms-audit-attendance',
          title: 'Audit User Attendance',
          type: 'item',
          url: '/qms/audit/attendance'
        },
        {
          id: 'qms-audit-observation',
          title: 'Audit Observation',
          type: 'item',
          url: '/qms/audit/observation'
        },
        {
          id: 'qms-audit-ncr-close',
          title: 'Close NCR / OFI',
          type: 'item',
          url: '/qms/audit/ncr/close'
        },
        {
          id: 'qms-audit-ncr-approval',
          title: 'Audit NCR / OFI approval',
          type: 'item',
          url: '/qms/audit/ncr/approval'
        },
        {
          id: 'qms-audit-report',
          title: 'Audit Report',
          type: 'item',
          url: '/qms/audit/report'
        }
      ]
    },
    {
      id: 'qms-meeting',
      title: 'Meeting',
      type: 'collapse',
      children: [
        {
          id: 'qms-meeting-schedule',
          title: 'Meeting Schedule',
          type: 'item',
          url: '/qms/meeting-schedule'
        },
        {
          id: 'qms-minutes-of-meeting',
          title: 'Minutes of Meeting',
          type: 'item',
          url: '/qms/minutesofmeeting'
        },
        {
          id: 'qms-meeting-attendance',
          title: 'Meeting User Attendance',
          type: 'item',
          url: '/qms/meeting-attendance'
        },
        {
          id: 'qms-close-mom',
          title: 'Close MOM',
          type: 'item',
          url: '/qms/close-mom'
        },
        {
          id: 'qms-mom-approval',
          title: 'MOM Approval',
          type: 'item',
          url: '/qms/mom-approval'
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
