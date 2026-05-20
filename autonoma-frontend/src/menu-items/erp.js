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
  IconMapPin,
  IconCoins,
  IconChartBar,
  IconChartPie,
  IconCreditCard,
  IconSettings,
  IconWorld,
  IconHierarchy,
  IconUserCheck,
  IconUserPlus,
  IconClipboardCheck,
  IconReportAnalytics,
  IconMessage2,
  IconCalendarEvent,
  IconFileCheck,
  IconNotes,
  IconBuilding,
  IconCertificate,
  IconShieldCheck,
  IconTags,
  IconFileText,
  IconBuildingBank,
  IconClock,
  IconCalendar,
  IconLock,
  IconGasStation,
  IconTruck,
  IconRuler2,
  IconChartDonut,
  IconPlaneTilt,
  IconTractor,
  IconMoodSmile,
  IconSearch,
  IconCategory
} from '@tabler/icons-react';

const icons = {
  IconDashboard,
  IconCategory,
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
  IconMapPin,
  IconCoins,
  IconChartBar,
  IconChartPie,
  IconCreditCard,
  IconSettings,
  IconWorld,
  IconHierarchy,
  IconUserCheck,
  IconUserPlus,
  IconClipboardCheck,
  IconReportAnalytics,
  IconMessage2,
  IconCalendarEvent,
  IconFileCheck,
  IconNotes,
  IconBuilding,
  IconCertificate,
  IconShieldCheck,
  IconTags,
  IconFileText,
  IconBuildingBank,
  IconClock,
  IconCalendar,
  IconLock,
  IconGasStation,
  IconTruck,
  IconRuler2,
  IconChartDonut,
  IconPlaneTilt,
  IconTractor,
  IconMoodSmile,
  IconSearch
};

export const masters = {
  id: 'masters',
  title: 'Master',
  caption: 'Master Q0001',
  type: 'group',
  icon: icons.IconServerCog,
  children: [
    {
      id: 'master-hr',
      title: 'HR',
      type: 'collapse',
      icon: icons.IconUsers,
      children: [
        {
          id: 'master-hr-ats',
          title: 'ATS',
          type: 'collapse',
          icon: icons.IconSearch,
          children: [
            {
              id: 'master-hr-ats-interview',
              title: 'Interview Criteria Master',
              type: 'item',
              url: '/master/hr/ats/interview-criteria',
              icon: icons.IconClipboardCheck,
              pageCode: 'M2110'
            },
            {
              id: 'master-hr-ats-email',
              title: 'Email Content Master',
              type: 'item',
              url: '/master/hr/ats/email-content',
              icon: icons.IconMessage2,
              pageCode: 'M2120'
            },
            {
              id: 'master-hr-ats-verification',
              title: 'Applicant Verification Criteria',
              type: 'item',
              url: '/master/hr/ats/verification',
              icon: icons.IconShieldCheck,
              pageCode: 'M2130'
            },
            {
              id: 'master-hr-ats-induction',
              title: 'Induction Criteria',
              type: 'item',
              url: '/master/hr/ats/induction-criteria',
              icon: icons.IconUserPlus,
              pageCode: 'M2140'
            },
            {
              id: 'master-hr-ats-induction-assignment',
              title: 'Induction Pending',
              type: 'item',
              url: '/master/hr/ats/induction-assignment',
              icon: icons.IconCalendarEvent,
              pageCode: 'M2150'
            },
            {
              id: 'master-hr-ats-induction-training',
              title: 'Induction Training',
              type: 'item',
              url: '/master/hr/ats/induction-training',
              icon: icons.IconClipboardCheck,
              pageCode: 'M2160'
            },
            {
              id: 'master-hr-ats-induction-trainee',
              title: 'Induction Trainee',
              type: 'item',
              url: '/master/hr/ats/induction-trainee',
              icon: icons.IconUserCheck,
              pageCode: 'M2170'
            }
          ]
        },
        {
          id: 'master-hr-employee',
          title: 'Employee',
          type: 'collapse',
          icon: icons.IconUsers,
          children: [
            {
              id: 'master-hr-employee-master',
              title: 'Employee Master',
              type: 'item',
              url: '/hra/employee/master',
              icon: icons.IconUserPlus,
              pageCode: 'M2210'
            },
            {
              id: 'master-hr-employee-type',
              title: 'Employee Type',
              type: 'item',
              url: '/master/hr/employee-type',
              icon: icons.IconTags,
              pageCode: 'M2220'
            },
            {
              id: 'master-hr-dept-details',
              title: 'Department',
              type: 'item',
              url: '/master/hr/department',
              icon: icons.IconBuilding,
              pageCode: 'M2230'
            },
            {
              id: 'master-hr-designation-details',
              title: 'Designation',
              type: 'item',
              url: '/master/hr/designation',
              icon: icons.IconBriefcase,
              pageCode: 'M2240'
            },
            {
              id: 'master-hr-designation-level',
              title: 'Level',
              type: 'item',
              url: '/master/hr/desg-level',
              icon: icons.IconHierarchy,
              pageCode: 'M2250'
            },
            {
              id: 'master-hr-grade',
              title: 'Grade',
              type: 'item',
              url: '/master/hr/grade',
              icon: icons.IconAward,
              pageCode: 'M2260'
            },
            {
              id: 'master-hr-employee-satisfaction',
              title: 'Employee Satisfaction Criteria',
              type: 'item',
              url: '/master/hr/satisfaction',
              icon: icons.IconAward,
              pageCode: 'M2270'
            }
          ]
        },
        {
          id: 'master-hr-payroll',
          title: 'Payroll',
          type: 'collapse',
          icon: icons.IconCoins,
          children: [
            {
              id: 'master-hr-payroll-holiday',
              title: 'Holiday',
              type: 'item',
              url: '/master/hr/payroll/holiday',
              icon: icons.IconCalendarEvent,
              pageCode: 'M2310'
            },
            {
              id: 'master-hr-payroll-bank',
              title: 'Bank Details',
              type: 'item',
              url: '/master/hr/payroll/bank',
              icon: icons.IconBuildingBank,
              pageCode: 'M2320'
            },
            {
              id: 'master-hr-payroll-shift',
              title: 'Shift',
              type: 'item',
              url: '/master/hr/payroll/shift',
              icon: icons.IconClock,
              pageCode: 'M2330'
            },
            {
              id: 'master-hr-payroll-loan',
              title: 'Loan Master',
              type: 'item',
              url: '/master/hr/payroll/loan',
              icon: icons.IconCoins,
              pageCode: 'M2340'
            },
            {
              id: 'master-hr-payroll-leave',
              title: 'Leave Master',
              type: 'item',
              url: '/master/hr/payroll/leave',
              icon: icons.IconCalendar,
              pageCode: 'M2350'
            },
            {
              id: 'master-hr-payroll-permission',
              title: 'Permission Master',
              type: 'item',
              url: '/master/hr/payroll/permission',
              icon: icons.IconLock,
              pageCode: 'M2360'
            },
            {
              id: 'master-hr-payroll-petrol',
              title: 'Petrol Allowance',
              type: 'item',
              url: '/master/hr/payroll/petrol',
              icon: icons.IconGasStation,
              pageCode: 'M2370'
            },
            {
              id: 'master-hr-payroll-policy',
              title: 'Policy Master',
              type: 'item',
              url: '/master/hr/payroll/policy',
              icon: icons.IconFileText,
              pageCode: 'M2380'
            }
          ]
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
          id: 'master-qms-checklist-parent',
          title: 'Check List',
          type: 'collapse',
          icon: icons.IconClipboardCheck,
          children: [
            {
              id: 'master-qms-checklist',
              title: 'Check List Master',
              type: 'item',
              url: '/master/qms/checklist/master',
              icon: icons.IconClipboardCheck,
              pageCode: 'M1210'
            }
          ]
        },
        {
          id: 'master-qms-audit',
          title: 'Audit',
          type: 'collapse',
          icon: icons.IconFileCheck,
          children: [
            {
              id: 'master-qms-audit-type',
              title: 'Audit Type',
              type: 'item',
              url: '/master/qms/audit/type',
              icon: icons.IconNotes,
              pageCode: 'M1110'
            },
            {
              id: 'master-qms-audit-area',
              title: 'Audit Area / Zone',
              type: 'item',
              url: '/master/qms/audit/area',
              icon: icons.IconMapPin,
              pageCode: 'M1120'
            },
            {
              id: 'master-qms-audit-criteria',
              title: 'Audit Criteria',
              type: 'item',
              url: '/master/qms/audit/criteria',
              icon: icons.IconShieldCheck,
              pageCode: 'M1130'
            }
          ]
        },
        {
          id: 'master-qms-meeting',
          title: 'Meeting',
          type: 'collapse',
          icon: icons.IconMessage2,
          children: [
            {
              id: 'master-qms-meeting-master',
              title: 'Meeting Master',
              type: 'item',
              url: '/master/qms/meeting/master',
              icon: icons.IconCalendarEvent,
              pageCode: 'M1310'
            }
          ]
        }
      ]
    },
    {
      id: 'master-npd',
      title: 'NPD',
      type: 'collapse',
      icon: icons.IconRocket,
      children: [
        {
          id: 'master-npd-product',
          title: 'Product',
          type: 'collapse',
          icon: icons.IconBuildingFactory,
          children: [
            {
              id: 'master-npd-product-group',
              title: 'Product Item Group',
              type: 'item',
              url: '/master/npd/product-group',
              icon: icons.IconCategory,
              pageCode: 'M3110'
            },
            {
              id: 'master-npd-product-type',
              title: 'Product Item Type',
              type: 'item',
              url: '/master/npd/product-type',
              icon: icons.IconListCheck,
              pageCode: 'M3120'
            },
            {
              id: 'master-npd-product-subtype',
              title: 'Product Item Sub Type',
              type: 'item',
              url: '/master/npd/product-subtype',
              icon: icons.IconNotes,
              pageCode: 'M3130'
            },
            {
              id: 'master-npd-product-oem',
              title: 'Product OEM Master',
              type: 'item',
              url: '/master/npd/product-oem',
              icon: icons.IconBuilding,
              pageCode: 'M3140'
            },
            {
              id: 'master-npd-product-oem-mapping',
              title: 'Product OEM Mapping',
              type: 'item',
              url: '/master/npd/product-oem-mapping',
              icon: icons.IconHierarchy,
              pageCode: 'M3150'
            },
            {
              id: 'master-npd-product-model',
              title: 'Product Model Master',
              type: 'item',
              url: '/master/npd/product-model',
              icon: icons.IconSettings,
              pageCode: 'M3160'
            },
            {
              id: 'master-npd-product-capacity',
              title: 'Product Capacity Master',
              type: 'item',
              url: '/master/npd/product-capacity',
              icon: icons.IconAward,
              pageCode: 'M3170'
            }
          ]
        },
        {
          id: 'master-npd-wind-farm',
          title: 'Wind Farm Master',
          type: 'item',
          url: '/master/npd/wind-farm',
          icon: icons.IconRocket,
          pageCode: 'M3210'
        }
      ]
    },
    {
      id: 'master-vendor',
      title: 'Vendor Master',
      type: 'collapse',
      icon: icons.IconTruckDelivery,
      children: [
        {
          id: 'sm-supplier-master',
          title: 'Supplier Master',
          type: 'item',
          url: '/sm/suppliers',
          icon: icons.IconTruckDelivery,
          pageCode: 'M4110'
        },
        {
          id: 'sm-subcontractor',
          title: 'Sub Contractor',
          type: 'item',
          url: '/sm/sub-contractors',
          icon: icons.IconTool,
          pageCode: 'M4210'
        }
      ]
    },
    {
      id: 'master-sales',
      title: 'Sales',
      type: 'collapse',
      icon: icons.IconBriefcase,
      children: [
        {
          id: 'master-sales-crm',
          title: 'CRM',
          type: 'collapse',
          icon: icons.IconUserCheck,
          children: [
            {
              id: 'master-sales-crm-satisfaction',
              title: 'Customer Satisfaction Criteria',
              type: 'item',
              url: '/master/sales/crm/satisfaction',
              icon: icons.IconMoodSmile,
              pageCode: 'M5110'
            },
            {
              id: 'master-sales-crm-contact',
              title: 'Contact Master',
              type: 'item',
              url: '/sm/contacts',
              icon: icons.IconUsers,
              pageCode: 'M5120'
            },
            {
              id: 'master-sales-crm-customer',
              title: 'Customer Master',
              type: 'item',
              url: '/sm/customers',
              icon: icons.IconBuilding,
              pageCode: 'M5130'
            },
            {
              id: 'master-sales-crm-potential',
              title: 'Customer Potential',
              type: 'item',
              url: '/master/sales/crm/potential',
              icon: icons.IconChartBar,
              pageCode: 'M5140'
            }
          ]
        },
        {
          id: 'master-sales-logistics',
          title: 'Terms & Logistics',
          type: 'collapse',
          icon: icons.IconTruck,
          children: [
            {
              id: 'master-sales-logistics-payment-terms',
              title: 'Payment Terms',
              type: 'item',
              url: '/master/common/payment-terms',
              icon: icons.IconCreditCard,
              pageCode: 'M5210'
            },
            {
              id: 'master-sales-logistics-delivery-terms',
              title: 'Delivery Terms',
              type: 'item',
              url: '/master/common/delivery-terms',
              icon: icons.IconTruckDelivery,
              pageCode: 'M5220'
            },
            {
              id: 'master-sales-logistics-currency',
              title: 'Currency',
              type: 'item',
              url: '/master/accounts/currency',
              icon: icons.IconCoins,
              pageCode: 'M5230'
            },
            {
              id: 'master-sales-logistics-uom',
              title: 'Unit of Measurement',
              type: 'item',
              url: '/master/sales/logistics/uom',
              icon: icons.IconRuler2,
              pageCode: 'M5240'
            },
            {
              id: 'master-sales-logistics-country',
              title: 'Country Master',
              type: 'item',
              url: '/master/common/country',
              icon: icons.IconWorld,
              pageCode: 'M5250'
            },
            {
              id: 'master-sales-logistics-state',
              title: 'State Master',
              type: 'item',
              url: '/master/common/state',
              icon: icons.IconMapPin,
              pageCode: 'M5260'
            },
            {
              id: 'master-sales-logistics-segment',
              title: 'Segment',
              type: 'item',
              url: '/sm/ocr/segment-master',
              icon: icons.IconChartPie,
              pageCode: 'M5270'
            },
            {
              id: 'master-sales-logistics-subsegment',
              title: 'Sub Segment',
              type: 'item',
              url: '/sm/ocr/sub-segment-master',
              icon: icons.IconChartDonut,
              pageCode: 'M5280'
            }
,
            {
              id: 'master-sales-logistics-despatch-mode',
              title: 'Mode of Despatch',
              type: 'item',
              url: '/master/sales/logistics/despatch-mode',
              icon: icons.IconPlaneTilt,
              pageCode: 'M5290'
            },
            {
              id: 'master-sales-logistics-freight',
              title: 'Freight',
              type: 'item',
              url: '/master/sales/logistics/freight',
              icon: icons.IconTractor,
              pageCode: 'M5300'
            }
          ]
        }
      ]
    },

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
  children: [
    {
      id: 'sm-ocr-legacy',
      title: 'OCR',
      type: 'collapse',
      icon: icons.IconServerCog,
      children: [
        {
          id: 'sm-enquiry-dashboard',
          title: 'Enquiry Dashboard',
          type: 'item',
          url: '/sm/enquiry/dashboard',
          icon: icons.IconDashboard,
          pageCode: 'SM1110'
        },
        {
          id: 'sm-enquiry',
          title: 'Enquiry',
          type: 'item',
          url: '/sm/enquiries',
          icon: icons.IconListCheck,
          pageCode: 'SM1120'
        },
        {
          id: 'sm-price-master',
          title: 'Price Master',
          type: 'item',
          url: '/sm/price-master',
          icon: icons.IconReport,
          pageCode: 'SM1130'
        },
        {
          id: 'sm-quotation',
          title: 'Quotation',
          type: 'item',
          url: '/sm/quotations',
          icon: icons.IconReport,
          pageCode: 'SM1140'
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
      icon: icons.IconClipboardCheck,
      children: [
        {
          id: 'checklist-verify',
          title: 'Checklist Verify',
          type: 'item',
          url: '/qms/checklist/verify',
          icon: icons.IconChecks,
          pageCode: 'QM1110'
        },
        {
          id: 'close-renewal',
          title: 'Close Checklist / Renewal',
          type: 'item',
          url: '/qms/checklist/close-renewal',
          icon: icons.IconFileCheck,
          pageCode: 'QM1120'
        },
        {
          id: 'renewal-verify',
          title: 'Checklist / Renewal Verify',
          type: 'item',
          url: '/qms/checklist/renewal-verify',
          icon: icons.IconShieldCheck,
          pageCode: 'QM1130'
        },
        {
          id: 'renewal-report',
          title: 'Checklist / Renewal Report',
          type: 'item',
          url: '/qms/checklist/renewal-report',
          icon: icons.IconReport,
          pageCode: 'QM1140'
        }
      ]
    },
    {
      id: 'qms-audit',
      title: 'Audit',
      type: 'collapse',
      icon: icons.IconFileCheck,
      children: [
        {
          id: 'qms-audit-schedule',
          title: 'Audit Schedule',
          type: 'item',
          url: '/qms/audit/schedule',
          icon: icons.IconCalendarEvent,
          pageCode: 'QM1210'
        },
        {
          id: 'qms-audit-attendance',
          title: 'Audit User Attendance',
          type: 'item',
          url: '/qms/audit/attendance',
          icon: icons.IconUserCheck,
          pageCode: 'QM1220'
        },
        {
          id: 'qms-audit-observation',
          title: 'Audit Observation',
          type: 'item',
          url: '/qms/audit/observation',
          icon: icons.IconReportAnalytics,
          pageCode: 'QM1230'
        },
        {
          id: 'qms-audit-ncr-close',
          title: 'Close NCR / OFI',
          type: 'item',
          url: '/qms/audit/ncr/close',
          icon: icons.IconFileCheck,
          pageCode: 'QM1240'
        },
        {
          id: 'qms-audit-ncr-approval',
          title: 'Audit NCR / OFI approval',
          type: 'item',
          url: '/qms/audit/ncr/approval',
          icon: icons.IconShieldCheck,
          pageCode: 'QM1250'
        },
        {
          id: 'qms-audit-report',
          title: 'Audit Report',
          type: 'item',
          url: '/qms/audit/report',
          icon: icons.IconReport,
          pageCode: 'QM1260'
        }
      ]
    },
    {
      id: 'qms-meeting',
      title: 'Meeting',
      type: 'collapse',
      icon: icons.IconMessage2,
      children: [
        {
          id: 'qms-meeting-schedule',
          title: 'Meeting Schedule',
          type: 'item',
          url: '/qms/meeting-schedule',
          icon: icons.IconCalendarEvent,
          pageCode: 'QM1310'
        },
        {
          id: 'qms-meeting-attendance',
          title: 'Meeting User Attendance',
          type: 'item',
          url: '/qms/meeting-attendance',
          icon: icons.IconUserCheck,
          pageCode: 'QM1320'
        },
        {
          id: 'qms-minutes-of-meeting',
          title: 'Minutes of Meeting',
          type: 'item',
          url: '/qms/minutesofmeeting',
          icon: icons.IconNotes,
          pageCode: 'QM1330'
        },
        {
          id: 'qms-close-mom',
          title: 'Close MOM',
          type: 'item',
          url: '/qms/close-mom',
          icon: icons.IconFileCheck,
          pageCode: 'QM1340'
        },
        {
          id: 'qms-mom-approval',
          title: 'MOM Approval',
          type: 'item',
          url: '/qms/mom-approval',
          icon: icons.IconShieldCheck,
          pageCode: 'QM1350'
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
