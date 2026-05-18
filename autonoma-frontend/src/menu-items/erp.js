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
<<<<<<< HEAD
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
=======
  IconSettings
>>>>>>> origin/chore/repo-cleanup
} from '@tabler/icons-react';

const icons = {
  IconDashboard,
<<<<<<< HEAD
  IconCategory,
=======
>>>>>>> origin/chore/repo-cleanup
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
<<<<<<< HEAD
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
=======
  IconSettings
>>>>>>> origin/chore/repo-cleanup
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
<<<<<<< HEAD
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
              icon: icons.IconClipboardCheck
            },
            {
              id: 'master-hr-ats-email',
              title: 'Email Content Master',
              type: 'item',
              url: '/master/hr/ats/email-content',
              icon: icons.IconMessage2
            },
            {
              id: 'master-hr-ats-verification',
              title: 'Applicant Verification Criteria',
              type: 'item',
              url: '/master/hr/ats/verification',
              icon: icons.IconShieldCheck
            },
            {
              id: 'master-hr-ats-induction',
              title: 'Induction Criteria',
              type: 'item',
              url: '/master/hr/ats/induction-criteria',
              icon: icons.IconUserPlus
            },
            {
              id: 'master-hr-ats-induction-assignment',
              title: 'Induction Pending',
              type: 'item',
              url: '/master/hr/ats/induction-assignment',
              icon: icons.IconCalendarEvent
            },
            {
              id: 'master-hr-ats-induction-training',
              title: 'Induction Training',
              type: 'item',
              url: '/master/hr/ats/induction-training',
              icon: icons.IconClipboardCheck
            },
            {
              id: 'master-hr-ats-induction-trainee',
              title: 'Induction Trainee',
              type: 'item',
              url: '/master/hr/ats/induction-trainee',
              icon: icons.IconUserCheck
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
              icon: icons.IconUserPlus
            },
            {
              id: 'master-hr-employee-type',
              title: 'Employee Type',
              type: 'item',
              url: '/master/hr/employee-type',
              icon: icons.IconTags
            },
            {
              id: 'master-hr-dept-details',
              title: 'Department',
              type: 'item',
              url: '/master/hr/department',
              icon: icons.IconBuilding
            },
            {
              id: 'master-hr-designation-details',
              title: 'Designation',
              type: 'item',
              url: '/master/hr/designation',
              icon: icons.IconBriefcase
            },
            {
              id: 'master-hr-designation-level',
              title: 'Level',
              type: 'item',
              url: '/master/hr/desg-level',
              icon: icons.IconHierarchy
            },
            {
              id: 'master-hr-employee-satisfaction',
              title: 'Employee Satisfaction Criteria',
              type: 'item',
              url: '/master/hr/satisfaction',
              icon: icons.IconAward
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
              icon: icons.IconCalendarEvent
            },
            {
              id: 'master-hr-payroll-bank',
              title: 'Bank Details',
              type: 'item',
              url: '/master/hr/payroll/bank',
              icon: icons.IconBuildingBank
            },
            {
              id: 'master-hr-payroll-shift',
              title: 'Shift',
              type: 'item',
              url: '/master/hr/payroll/shift',
              icon: icons.IconClock
            },
            {
              id: 'master-hr-payroll-loan',
              title: 'Loan Master',
              type: 'item',
              url: '/master/hr/payroll/loan',
              icon: icons.IconCoins
            },
            {
              id: 'master-hr-payroll-leave',
              title: 'Leave Master',
              type: 'item',
              url: '/master/hr/payroll/leave',
              icon: icons.IconCalendar
            },
            {
              id: 'master-hr-payroll-permission',
              title: 'Permission Master',
              type: 'item',
              url: '/master/hr/payroll/permission',
              icon: icons.IconLock
            },
            {
              id: 'master-hr-payroll-petrol',
              title: 'Petrol Allowance',
              type: 'item',
              url: '/master/hr/payroll/petrol',
              icon: icons.IconGasStation
            },
            {
              id: 'master-hr-payroll-policy',
              title: 'Policy Master',
              type: 'item',
              url: '/master/hr/payroll/policy',
              icon: icons.IconFileText
            }
          ]
=======
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
>>>>>>> origin/chore/repo-cleanup
        }
      ]
    },
    {
      id: 'master-qms',
      title: 'QMS',
      type: 'collapse',
<<<<<<< HEAD
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
              icon: icons.IconClipboardCheck
=======
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
>>>>>>> origin/chore/repo-cleanup
            }
          ]
        },
        {
          id: 'master-qms-audit',
          title: 'Audit',
          type: 'collapse',
<<<<<<< HEAD
          icon: icons.IconFileCheck,
=======
>>>>>>> origin/chore/repo-cleanup
          children: [
            {
              id: 'master-qms-audit-type',
              title: 'Audit Type',
              type: 'item',
<<<<<<< HEAD
              url: '/master/qms/audit/type',
              icon: icons.IconNotes
=======
              url: '/master/qms/audit/type'
>>>>>>> origin/chore/repo-cleanup
            },
            {
              id: 'master-qms-audit-area',
              title: 'Audit Area / Zone',
              type: 'item',
<<<<<<< HEAD
              url: '/master/qms/audit/area',
              icon: icons.IconMapPin
=======
              url: '/master/qms/audit/area'
>>>>>>> origin/chore/repo-cleanup
            },
            {
              id: 'master-qms-audit-criteria',
              title: 'Audit Criteria',
              type: 'item',
<<<<<<< HEAD
              url: '/master/qms/audit/criteria',
              icon: icons.IconShieldCheck
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
              icon: icons.IconCalendarEvent
=======
              url: '/master/qms/audit/criteria'
>>>>>>> origin/chore/repo-cleanup
            }
          ]
        }
      ]
    },
    {
<<<<<<< HEAD
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
              icon: icons.IconCategory
            },
            {
              id: 'master-npd-product-type',
              title: 'Product Item Type',
              type: 'item',
              url: '/master/npd/product-type',
              icon: icons.IconListCheck
            },
            {
              id: 'master-npd-product-subtype',
              title: 'Product Item Sub Type',
              type: 'item',
              url: '/master/npd/product-subtype',
              icon: icons.IconNotes
            },
            {
              id: 'master-npd-product-oem',
              title: 'Product OEM Master',
              type: 'item',
              url: '/master/npd/product-oem',
              icon: icons.IconBuilding
            },
            {
              id: 'master-npd-product-oem-mapping',
              title: 'Product OEM Mapping',
              type: 'item',
              url: '/master/npd/product-oem-mapping',
              icon: icons.IconHierarchy
            },
            {
              id: 'master-npd-product-model',
              title: 'Product Model Master',
              type: 'item',
              url: '/master/npd/product-model',
              icon: icons.IconSettings
            },
            {
              id: 'master-npd-product-capacity',
              title: 'Product Capacity Master',
              type: 'item',
              url: '/master/npd/product-capacity',
              icon: icons.IconAward
            },
            {
              id: 'master-npd-wind-farm',
              title: 'Wind Farm',
              type: 'item',
              url: '/master/npd/wind-farm',
              icon: icons.IconMapPin
            },
            {
              id: 'master-npd-model-name',
              title: 'Model Name',
              type: 'item',
              url: '/master/npd/model-name',
              icon: icons.IconListCheck
            },
            {
              id: 'master-npd-uom',
              title: 'UOM',
              type: 'item',
              url: '/master/npd/uom',
              icon: icons.IconScale
            }
          ]
=======
      id: 'master-meeting',
      title: 'Meeting',
      type: 'collapse',
      children: [
        {
          id: 'master-meeting-master',
          title: 'Meeting Master',
          type: 'item',
          url: '/master/qms/meeting/master'
>>>>>>> origin/chore/repo-cleanup
        }
      ]
    },
    {
<<<<<<< HEAD
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
      id: 'master-sales',
=======
      id: 'sam',
>>>>>>> origin/chore/repo-cleanup
      title: 'Sales',
      type: 'collapse',
      icon: icons.IconBriefcase,
      children: [
        {
<<<<<<< HEAD
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
              icon: icons.IconMoodSmile
            },
            {
              id: 'master-sales-crm-contact',
=======
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
>>>>>>> origin/chore/repo-cleanup
              title: 'Contact Master',
              type: 'item',
              url: '/sm/contacts',
              icon: icons.IconUsers
            },
            {
<<<<<<< HEAD
              id: 'master-sales-crm-customer',
              title: 'Customer Master',
              type: 'item',
              url: '/sm/customers',
              icon: icons.IconBuilding
            },
            {
              id: 'master-sales-crm-potential',
              title: 'Customer Potential',
              type: 'item',
              url: '/master/sales/crm/potential',
              icon: icons.IconChartBar
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
              icon: icons.IconCreditCard
            },
            {
              id: 'master-sales-logistics-delivery-terms',
              title: 'Delivery Terms',
              type: 'item',
              url: '/master/common/delivery-terms',
              icon: icons.IconTruckDelivery
            },
            {
              id: 'master-sales-logistics-currency',
              title: 'Currency',
              type: 'item',
              url: '/master/accounts/currency',
              icon: icons.IconCoins
            },
            {
              id: 'master-sales-logistics-uom',
              title: 'Unit of Measurement',
              type: 'item',
              url: '/master/sales/logistics/uom',
              icon: icons.IconRuler2
            },
            {
              id: 'master-sales-logistics-country',
              title: 'Country Master',
              type: 'item',
              url: '/master/common/country',
              icon: icons.IconWorld
            },
            {
              id: 'master-sales-logistics-state',
              title: 'State Master',
              type: 'item',
              url: '/master/common/state',
              icon: icons.IconMapPin
            },
            {
              id: 'master-sales-logistics-segment',
              title: 'Segment',
              type: 'item',
              url: '/sm/ocr/segment-master',
              icon: icons.IconChartPie
            },
            {
              id: 'master-sales-logistics-subsegment',
              title: 'Sub Segment',
              type: 'item',
              url: '/sm/ocr/sub-segment-master',
              icon: icons.IconChartDonut
            }
,
            {
              id: 'master-sales-logistics-despatch-mode',
              title: 'Mode of Despatch',
              type: 'item',
              url: '/master/sales/logistics/despatch-mode',
              icon: icons.IconPlaneTilt
            },
            {
              id: 'master-sales-logistics-freight',
              title: 'Freight',
              type: 'item',
              url: '/master/sales/logistics/freight',
              icon: icons.IconTractor
=======
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
>>>>>>> origin/chore/repo-cleanup
            }
          ]
        }
      ]
    },
<<<<<<< HEAD

=======
    {
      id: 'sam',
      title: 'Sales',
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
            },
            {
              id: 'sm-type-of-service',
              title: 'Type of Service',
              type: 'item',
              url: '/sm/ocr/type-of-service',
              icon: icons.IconSettings
            }
          ]
        }
      ]
    }
>>>>>>> origin/chore/repo-cleanup
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
<<<<<<< HEAD
      icon: icons.IconUsers,
=======
>>>>>>> origin/chore/repo-cleanup
      children: [
        {
          id: 'hra-hr-employee-details',
          title: 'Employee Master',
          type: 'item',
<<<<<<< HEAD
          url: '/hra/employee/master',
          icon: icons.IconUserPlus
=======
          url: '/hra/employee/master'
>>>>>>> origin/chore/repo-cleanup
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
          icon: icons.IconDashboard
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
<<<<<<< HEAD
      icon: icons.IconClipboardCheck,
=======
>>>>>>> origin/chore/repo-cleanup
      children: [
        {
          id: 'checklist-verify',
          title: 'Checklist Verify',
          type: 'item',
<<<<<<< HEAD
          url: '/qms/checklist/verify',
          icon: icons.IconChecks
=======
          url: '/qms/checklist/verify'
>>>>>>> origin/chore/repo-cleanup
        },
        {
          id: 'close-renewal',
          title: 'Close Checklist / Renewal',
          type: 'item',
<<<<<<< HEAD
          url: '/qms/checklist/close-renewal',
          icon: icons.IconFileCheck
=======
          url: '/qms/checklist/close-renewal'
>>>>>>> origin/chore/repo-cleanup
        },
        {
          id: 'renewal-verify',
          title: 'Checklist / Renewal Verify',
          type: 'item',
<<<<<<< HEAD
          url: '/qms/checklist/renewal-verify',
          icon: icons.IconShieldCheck
=======
          url: '/qms/checklist/renewal-verify'
>>>>>>> origin/chore/repo-cleanup
        },
        {
          id: 'renewal-report',
          title: 'Checklist / Renewal Report',
          type: 'item',
<<<<<<< HEAD
          url: '/qms/checklist/renewal-report',
          icon: icons.IconReport
=======
          url: '/qms/checklist/renewal-report'
>>>>>>> origin/chore/repo-cleanup
        }
      ]
    },
    {
      id: 'qms-audit',
      title: 'Audit',
      type: 'collapse',
<<<<<<< HEAD
      icon: icons.IconFileCheck,
=======
>>>>>>> origin/chore/repo-cleanup
      children: [
        {
          id: 'qms-audit-schedule',
          title: 'Audit Schedule',
          type: 'item',
<<<<<<< HEAD
          url: '/qms/audit/schedule',
          icon: icons.IconCalendarEvent
=======
          url: '/qms/audit/schedule'
>>>>>>> origin/chore/repo-cleanup
        },
        {
          id: 'qms-audit-attendance',
          title: 'Audit User Attendance',
          type: 'item',
<<<<<<< HEAD
          url: '/qms/audit/attendance',
          icon: icons.IconUserCheck
=======
          url: '/qms/audit/attendance'
>>>>>>> origin/chore/repo-cleanup
        },
        {
          id: 'qms-audit-observation',
          title: 'Audit Observation',
          type: 'item',
<<<<<<< HEAD
          url: '/qms/audit/observation',
          icon: icons.IconReportAnalytics
=======
          url: '/qms/audit/observation'
>>>>>>> origin/chore/repo-cleanup
        },
        {
          id: 'qms-audit-ncr-close',
          title: 'Close NCR / OFI',
          type: 'item',
<<<<<<< HEAD
          url: '/qms/audit/ncr/close',
          icon: icons.IconFileCheck
=======
          url: '/qms/audit/ncr/close'
>>>>>>> origin/chore/repo-cleanup
        },
        {
          id: 'qms-audit-ncr-approval',
          title: 'Audit NCR / OFI approval',
          type: 'item',
<<<<<<< HEAD
          url: '/qms/audit/ncr/approval',
          icon: icons.IconShieldCheck
=======
          url: '/qms/audit/ncr/approval'
>>>>>>> origin/chore/repo-cleanup
        },
        {
          id: 'qms-audit-report',
          title: 'Audit Report',
          type: 'item',
<<<<<<< HEAD
          url: '/qms/audit/report',
          icon: icons.IconReport
=======
          url: '/qms/audit/report'
>>>>>>> origin/chore/repo-cleanup
        }
      ]
    },
    {
      id: 'qms-meeting',
      title: 'Meeting',
      type: 'collapse',
<<<<<<< HEAD
      icon: icons.IconMessage2,
=======
>>>>>>> origin/chore/repo-cleanup
      children: [
        {
          id: 'qms-meeting-schedule',
          title: 'Meeting Schedule',
          type: 'item',
<<<<<<< HEAD
          url: '/qms/meeting-schedule',
          icon: icons.IconCalendarEvent
        },
        {
          id: 'qms-meeting-attendance',
          title: 'Meeting User Attendance',
          type: 'item',
          url: '/qms/meeting-attendance',
          icon: icons.IconUserCheck
=======
          url: '/qms/meeting-schedule'
>>>>>>> origin/chore/repo-cleanup
        },
        {
          id: 'qms-minutes-of-meeting',
          title: 'Minutes of Meeting',
          type: 'item',
<<<<<<< HEAD
          url: '/qms/minutesofmeeting',
          icon: icons.IconNotes
=======
          url: '/qms/minutesofmeeting'
        },
        {
          id: 'qms-meeting-attendance',
          title: 'Meeting User Attendance',
          type: 'item',
          url: '/qms/meeting-attendance'
>>>>>>> origin/chore/repo-cleanup
        },
        {
          id: 'qms-close-mom',
          title: 'Close MOM',
          type: 'item',
<<<<<<< HEAD
          url: '/qms/close-mom',
          icon: icons.IconFileCheck
=======
          url: '/qms/close-mom'
>>>>>>> origin/chore/repo-cleanup
        },
        {
          id: 'qms-mom-approval',
          title: 'MOM Approval',
          type: 'item',
<<<<<<< HEAD
          url: '/qms/mom-approval',
          icon: icons.IconShieldCheck
=======
          url: '/qms/mom-approval'
>>>>>>> origin/chore/repo-cleanup
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
