import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Typography,
  Button,
  Stack,
  Tooltip,
  IconButton,
  MenuItem,
  Checkbox,
  Grid,
  Box,
  Tabs,
  Tab,
  Card,
  CardContent,
  FormControlLabel,
  InputAdornment,
  Divider,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Chip
} from '@mui/material';
import axios from 'utils/axios';
import {
  IconSearch,
  IconRefresh,
  IconPlus,
  IconUser,
  IconFileText,
  IconTrash,
  IconEdit,
  IconMail,
  IconCalendar,
  IconCheck,
  IconAlertCircle,
  IconBriefcase,
  IconSchool,
  IconCurrencyDollar,
  IconAddressBook,
  IconUserCheck,
  IconLock,
  IconStar,
  IconTrendingUp
} from '@tabler/icons-react';
import { useDispatch } from 'react-redux';
import { openSnackbar } from 'store/slices/snackbar';
import MainCard from 'ui-component/cards/MainCard';
import ConfirmDeleteDialog from 'ui-component/ConfirmDeleteDialog';
import {
  BOSDataTable,
  BOSFormDialog,
  BOSTextField,
  BOSFileUpload,
  errorStyle
} from 'ui-component/bos';
import { useLookups } from 'hooks/useLookups';
import useBOSValidation from 'hooks/useBOSValidation';
import { setFilterConfig } from 'store/slices/search';
import usePagePermissions, { PAGE_CODES } from 'hooks/usePagePermissions';
import useKeyboardShortcuts, { shortcutTooltip } from 'hooks/useKeyboardShortcuts';

// ==============================|| APPLICATION TRACKING SYSTEM ||============================== //

const getTodayDateString = () => {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const calculateAge = (dob) => {
  if (!dob) return '';
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age >= 0 ? age : '';
};

// Initial state for the top-level form
const INITIAL_FORM_STATE = {
  id: null,
  enRolledNo: 'ATS-2026-001',
  applicantDate: getTodayDateString(),
  positionLookFor: '',
  title: 'Mr',
  firstName: '',
  lastName: '',
  department: '',
  mobileNo: '',
  emailId: '',
  aadharNo: '',
  birthDate: '',
  age: '',
  duplicateAadhar: false,
  refMode: '',
  refComments: '',
  call: 'PENDING',
  interview: 'PENDING',
  offer: 'PENDING',
  verification: 'PENDING',
  status: 'APPLIED'
};

const INITIAL_PERSONAL_STATE = {
  enRollNo: '0',
  gender: '',
  maritalStatus: '',
  birthDate: getTodayDateString(),
  panNo: '',
  officePhoneNo: '',
  phoneNo: '',
  mobileNo: '',
  emailId: '',
  religion: '',
  nationality: 'INDIAN',
  permAdd1: '',
  permAdd2: '',
  city: '',
  state: '',
  sameAsPermanent: false,
  persAdd1: '',
  persAdd2: ''
};

const INITIAL_SALARY_STATE = {
  basic: 0,
  da: 0,
  hra: 0,
  splAllowance: 0,
  perfIncentive: 0,
  statutoryBonus: 0,
  canteenAllowance: 0,
  attendanceAllow1: 0,
  attendanceAllow2: 0,
  uniform: 0,
  shoes: 0,
  mobileCug: 0,
  otAmount: 0,
  petrolAllow: 0,
  appraisalPer: 0,
  otherAllow: 0,
  pfEmployee: 0,
  pfEmployer: 0,
  esiEmployee: 0,
  esiEmployer: 0,
  canteenDeduct: 0,
  profTax: 0,
  labourWelFundEmp: 0,
  labourWelFundEmployer: 0,
  otherDeduct: 0,
  suspenseDeduct: 0
};

const INITIAL_EVALUATION_STATE = {
  enRolledNo: '0',
  interviewDate: getTodayDateString(),
  status: 'HOLD',
  comments: '',
  technicalInterviewedBy: '',
  hrInterviewedBy: ''
};

const INITIAL_CONTACT_STATE = {
  enRolledNo: '0',
  address1: '',
  address2: '',
  city: '',
  phoneNo: '',
  mobileNo: ''
};

const INITIAL_ASSESSMENT_STATE = {
  q1_native: '',
  q2_presentAddress: '',
  q3_permanentAddress: '',
  q4_fatherOccupation: '',
  q5_motherOccupation: '',
  q6_maritalStatus: 'UNMARRIED',
  q7_spouseOccupation: '',
  q8_children: '',
  q9_hasRelativesInCompany: 'NO',
  q10_relativesDetails: '',
  q11_siblingsOccupations: '',
  q12_hasTwoWheeler: 'NO',
  q13_hasAndroidPhone: 'NO',
  q14_knowsCarDriving: 'NO',
  q15_willingToTravel: 'NO',
  q16_covidVaccination: 'NO',
  q17_positivePoints: '',
  q18_negativePoints: '',
  q19_lifeGoals: '',
  q20_improvementSuggestions: '',
  q21_isExperienced: 'NO',
  q22_totalExperience: '0',
  q23_coreExperience: '0',
  q24_prevNetSalary: '0.00',
  q25_prevGrossSalary: '0.00',
  q26_expectedNetSalary: '0.00',
  q27_expectedGrossSalary: '0.00',
  q28_pfHigherPension: 'NO',
  q29_pfDeductionAmount: '0',
  q30_alternativeDepartment: '',
  q31_prevLocation: '',
  q32_prevShift: '',
  q33_reasonForLeaving: '',
  q34_noticePeriod: '0',
  q35_prevDeptPosition: '',
  q36_prevDeptCount: '0',
  q37_prevReportingTo: '',
  q38_handleMistake: '',
  q39_handleOpinionDifference: '',
  q40_computerSelfRating: 'AVERAGE',
  payslip: null
};

const REF_MODES = ['EMPLOYEE', 'LINKED IN', 'NEWS PAPER', 'POSTER', 'WEBSITE', 'WHATS APP', 'OTHERS'];
const TITLE_OPTIONS = ['Mr', 'Miss', 'Mrs', 'Mx'];
const GENDER_OPTIONS = ['MALE', 'FEMALE', 'TRANS GENDER'];
const MARITAL_STATUSES = ['UNMARRIED', 'MARRIED', 'WIDOW', 'DIVORCED'];
const RELIGIONS = ['HINDU', 'MUSLIM', 'CHRISTIAN', 'SIKHISM', 'BUDDHISM'];
const EVALUATION_STATUSES = ['SELECTED', 'HOLD', 'REJECTED'];

const VALIDATION_RULES = [
  { field: 'enRolledNo', label: 'En Rolled No', required: true },
  { field: 'firstName', label: 'First Name', required: true },
  { field: 'lastName', label: 'Last Name', required: true },
  { field: 'department', label: 'Department', required: true },
  { field: 'positionLookFor', label: 'Position Look For', required: true },
  { field: 'mobileNo', label: 'Mobile No', required: true, pattern: /^[0-9]{10}$/ },
  { field: 'emailId', label: 'Email ID', required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
  { field: 'aadharNo', label: 'Aadhar No', required: true, pattern: /^[0-9]{12}$/ },
  { field: 'birthDate', label: 'Birth Date', required: true }
];

export default function ApplicationTrackingSystem() {
  const dispatch = useDispatch();
  const perms = usePagePermissions(PAGE_CODES.HRA_ATS);

  // Lookups mapping
  const { departments = [], designations = [], employees = [] } = useLookups(['DEPARTMENTS', 'DESIGNATIONS', 'EMPLOYEES']);

  // Table and view states
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  
  // Dialog State
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Form states inside the Dialog
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [personalData, setPersonalData] = useState(INITIAL_PERSONAL_STATE);
  const [evaluationData, setEvaluationData] = useState(INITIAL_EVALUATION_STATE);
  const [contactData, setContactData] = useState(INITIAL_CONTACT_STATE);
  const [assessmentData, setAssessmentData] = useState(INITIAL_ASSESSMENT_STATE);
  const [salaryData, setSalaryData] = useState(INITIAL_SALARY_STATE);

  // Experience and Education table data state
  const [experienceRows, setExperienceRows] = useState([]);
  const [educationRows, setEducationRows] = useState([]);
  const [kycRows, setKycRows] = useState([
    { slNo: 1, seqNo: 'KYC-01', docName: 'AADHAR CARD', docNo: '', file: null },
    { slNo: 2, seqNo: 'KYC-02', docName: 'PAN CARD', docNo: '', file: null },
    { slNo: 3, seqNo: 'KYC-03', docName: 'VOTER ID', docNo: '', file: null },
    { slNo: 4, seqNo: 'KYC-04', docName: 'PASSPORT', docNo: '', file: null }
  ]);
  const [skillsRows, setSkillsRows] = useState([]);

  // Validation Hook
  const { errors, validate, clearErrors, setErrors } = useBOSValidation();

  const fetchApplicants = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get('/api/hra/applicants');
      setRows(data || []);
    } catch (e) {
      dispatch(openSnackbar({ open: true, message: 'Failed to load applicant records.', variant: 'alert', severity: 'error' }));
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  // Initial data load
  useEffect(() => {
    fetchApplicants();
  }, [fetchApplicants]);

  // Update default filters
  useEffect(() => {
    const config = [
      {
        id: 'status',
        label: 'Status',
        type: 'select',
        options: [
          { value: 'ALL', label: 'ALL' },
          { value: 'APPLIED', label: 'APPLIED' },
          { value: 'INTERVIEWING', label: 'INTERVIEWING' },
          { value: 'OFFERED', label: 'OFFERED' },
          { value: 'ON-ROLL', label: 'ON-ROLL' },
          { value: 'REJECTED', label: 'REJECTED' }
        ],
        defaultValue: 'ALL',
        isStarred: true
      }
    ];
    dispatch(setFilterConfig(config));
    return () => {
      dispatch(setFilterConfig(null));
    };
  }, [dispatch]);

  // Keyboard shortcut definitions
  const handleOpenAdd = async () => {
    setLoading(true);
    let nextCode = 'ATS-2026-001';
    try {
      const { data } = await axios.get('/api/hra/applicants/next-code');
      if (data) nextCode = data;
    } catch (e) {
      console.error('Failed to fetch next enrolled number', e);
    } finally {
      setLoading(false);
    }

    setFormData({
      ...INITIAL_FORM_STATE,
      enRolledNo: nextCode,
      applicantDate: getTodayDateString()
    });
    setPersonalData(INITIAL_PERSONAL_STATE);
    setEvaluationData(INITIAL_EVALUATION_STATE);
    setContactData(INITIAL_CONTACT_STATE);
    setAssessmentData(INITIAL_ASSESSMENT_STATE);
    setSalaryData(INITIAL_SALARY_STATE);
    setExperienceRows([]);
    setEducationRows([]);
    setSkillsRows([]);
    setKycRows([
      { slNo: 1, seqNo: 'KYC-01', docName: 'AADHAR CARD', docNo: '', file: null },
      { slNo: 2, seqNo: 'KYC-02', docName: 'PAN CARD', docNo: '', file: null },
      { slNo: 3, seqNo: 'KYC-03', docName: 'VOTER ID', docNo: '', file: null },
      { slNo: 4, seqNo: 'KYC-04', docName: 'PASSPORT', docNo: '', file: null }
    ]);
    setActiveTab(0);
    setErrors({});
    setDialogOpen(true);
  };

  const handleOpenEdit = async (row) => {
    setLoading(true);
    try {
      const { data: original } = await axios.get(`/api/hra/applicants/${row.id}`);
      if (!original) return;
      setFormData({
        id: original.id,
        enRolledNo: original.enRolledNo,
        applicantDate: original.applicantDate,
        positionLookFor: original.positionLookFor,
        title: original.title || 'Mr',
        firstName: original.firstName,
        lastName: original.lastName,
        department: original.department,
        mobileNo: original.mobileNo,
        emailId: original.emailId,
        aadharNo: original.aadharNo,
        birthDate: original.birthDate,
        age: original.age || '',
        duplicateAadhar: original.duplicateAadhar || false,
        refMode: original.refMode || '',
        refComments: original.refComments || '',
        call: original.callStatus || 'PENDING',
        interview: original.interviewStatus || 'PENDING',
        offer: original.offerStatus || 'PENDING',
        verification: original.verificationStatus || 'PENDING',
        status: original.status || 'APPLIED'
      });

      setPersonalData({
        enRollNo: original.enRolledNo || '0',
        gender: original.gender || '',
        maritalStatus: original.maritalStatus || '',
        birthDate: original.birthDate || '',
        panNo: original.panNo || '',
        officePhoneNo: original.officePhoneNo || '',
        phoneNo: original.phoneNo || '',
        mobileNo: original.mobileNo || '',
        emailId: original.emailId || '',
        religion: original.religion || '',
        nationality: original.nationality || 'INDIAN',
        permAdd1: original.permAdd1 || '',
        permAdd2: original.permAdd2 || '',
        city: original.city || '',
        state: original.state || '',
        sameAsPermanent: original.sameAsPermanent || false,
        persAdd1: original.persAdd1 || '',
        persAdd2: original.persAdd2 || ''
      });

      setSalaryData({
        basic: original.basic || 0,
        da: original.da || 0,
        hra: original.hra || 0,
        splAllowance: original.splAllowance || 0,
        perfIncentive: original.perfIncentive || 0,
        statutoryBonus: original.statutoryBonus || 0,
        canteenAllowance: original.canteenAllowance || 0,
        attendanceAllow1: original.attendanceAllow1 || 0,
        attendanceAllow2: original.attendanceAllow2 || 0,
        uniform: original.uniform || 0,
        shoes: original.shoes || 0,
        mobileCug: original.mobileCug || 0,
        otAmount: original.otAmount || 0,
        petrolAllow: original.petrolAllow || 0,
        appraisalPer: original.appraisalPer || 0,
        otherAllow: original.otherAllow || 0,
        pfEmployee: original.pfEmployee || 0,
        pfEmployer: original.pfEmployer || 0,
        esiEmployee: original.esiEmployee || 0,
        esiEmployer: original.esiEmployer || 0,
        canteenDeduct: original.canteenDeduct || 0,
        profTax: original.profTax || 0,
        labourWelFundEmp: original.labourWelFundEmp || 0,
        labourWelFundEmployer: original.labourWelFundEmployer || 0,
        otherDeduct: original.otherDeduct || 0,
        suspenseDeduct: original.suspenseDeduct || 0
      });

      setEvaluationData({
        enRolledNo: original.enRolledNo || '0',
        interviewDate: original.interviewDate || getTodayDateString(),
        status: original.evaluationStatus || 'HOLD',
        comments: original.evaluationComments || '',
        technicalInterviewedBy: original.technicalInterviewedBy || '',
        hrInterviewedBy: original.hrInterviewedBy || ''
      });

      setContactData({
        enRolledNo: original.enRolledNo || '0',
        address1: original.contactAddress1 || '',
        address2: original.contactAddress2 || '',
        city: original.contactCity || '',
        phoneNo: original.contactPhone || '',
        mobileNo: original.contactMobile || original.mobileNo || ''
      });

      setAssessmentData({
        q1_native: original.q1_native || '',
        q2_presentAddress: original.q2_present_address || '',
        q3_permanentAddress: original.q3_permanent_address || '',
        q4_fatherOccupation: original.q4_father_occupation || '',
        q5_motherOccupation: original.q5_mother_occupation || '',
        q6_maritalStatus: original.q6_marital_status || 'UNMARRIED',
        q7_spouseOccupation: original.q7_spouse_occupation || '',
        q8_children: original.q8_children || '',
        q9_hasRelativesInCompany: original.q9_has_relatives || 'NO',
        q10_relativesDetails: original.q10_relatives_details || '',
        q11_siblingsOccupations: original.q11_siblings_occupations || '',
        q12_hasTwoWheeler: original.q12_has_two_wheeler || 'NO',
        q13_hasAndroidPhone: original.q13_has_android_phone || 'NO',
        q14_knowsCarDriving: original.q14_knows_car_driving || 'NO',
        q15_willingToTravel: original.q15_willing_to_travel || 'NO',
        q16_covidVaccination: original.q16_covid_vaccination || 'NO',
        q17_positivePoints: original.q17_positive_points || '',
        q18_negativePoints: original.q18_negative_points || '',
        q19_lifeGoals: original.q19_life_goals || '',
        q20_improvementSuggestions: original.q20_improvement_suggestions || '',
        q21_isExperienced: original.q21_is_experienced || 'NO',
        q22_totalExperience: original.q22_total_experience || '0',
        q23_coreExperience: original.q23_core_experience || '0',
        q24_prevNetSalary: original.q24_prev_net_salary || '0.00',
        q25_prevGrossSalary: original.q25_prev_gross_salary || '0.00',
        q26_expectedNetSalary: original.q26_expected_net_salary || '0.00',
        q27_expectedGrossSalary: original.q27_expected_gross_salary || '0.00',
        q28_pfHigherPension: original.q28_pf_higher_pension || 'NO',
        q29_pfDeductionAmount: original.q29_pf_deduction_amount || '0',
        q30_alternativeDepartment: original.q30_alternative_department || '',
        q31_prevLocation: original.q31_prev_location || '',
        q32_prevShift: original.q32_prev_shift || '',
        q33_reasonForLeaving: original.q33_reason_for_leaving || '',
        q34_noticePeriod: original.q34_notice_period || '0',
        q35_prevDeptPosition: original.q35_prev_dept_position || '',
        q36_prevDeptCount: original.q36_prev_dept_count || '0',
        q37_prevReportingTo: original.q37_prev_reporting_to || '',
        q38_handleMistake: original.q38_handle_mistake || '',
        q39_handleOpinionDifference: original.q39_handle_opinion_difference || '',
        q40_computerSelfRating: original.q40_computer_self_rating || 'AVERAGE',
        payslip: original.payslipPath ? { fileName: original.payslipPath.split('/').pop(), serverFileName: original.payslipPath, isServer: true } : null
      });

      setExperienceRows((original.experience || []).map(exp => ({
        id: exp.id,
        slNo: exp.slNo,
        companyName: exp.companyName || '',
        location: exp.location || '',
        fromDate: exp.fromDate || '',
        toDate: exp.toDate || '',
        expYears: exp.expYears || '',
        file: exp.filePath ? { fileName: exp.filePath.split('/').pop(), serverFileName: exp.filePath, isServer: true } : null
      })));

      setEducationRows((original.education || []).map(edu => ({
        id: edu.id,
        slNo: edu.slNo,
        education: edu.education || '',
        institutionName: edu.institutionName || '',
        type: edu.type || 'FULL TIME',
        yearOfPassing: edu.yearOfPassing || '',
        grade: edu.grade || '',
        file: edu.filePath ? { fileName: edu.filePath.split('/').pop(), serverFileName: edu.filePath, isServer: true } : null
      })));

      setKycRows((original.kyc || [
        { slNo: 1, seqNo: 'KYC-01', docName: 'AADHAR CARD', docNo: '', file: null },
        { slNo: 2, seqNo: 'KYC-02', docName: 'PAN CARD', docNo: '', file: null },
        { slNo: 3, seqNo: 'KYC-03', docName: 'VOTER ID', docNo: '', file: null },
        { slNo: 4, seqNo: 'KYC-04', docName: 'PASSPORT', docNo: '', file: null }
      ]).map(k => ({
        id: k.id,
        slNo: k.slNo,
        seqNo: k.seqNo,
        docName: k.docName,
        docNo: k.docNo || '',
        file: k.filePath ? { fileName: k.filePath.split('/').pop(), serverFileName: k.filePath, isServer: true } : null
      })));

      setSkillsRows((original.skills || []).map(s => ({
        id: s.id,
        slNo: s.slNo,
        activityDetails: s.activityDetails || '',
        file: s.filePath ? { fileName: s.filePath.split('/').pop(), serverFileName: s.filePath, isServer: true } : null
      })));

      setActiveTab(0);
      setErrors({});
      setDialogOpen(true);
    } catch (e) {
      dispatch(openSnackbar({ open: true, message: 'Failed to fetch candidate details.', variant: 'alert', severity: 'error' }));
    } finally {
      setLoading(false);
    }
  };

  useKeyboardShortcuts({
    'ctrl+n': handleOpenAdd,
    'escape': () => setDialogOpen(false)
  });

  // Checkbox selection handlers
  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedIds(rows.map(r => r.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Status updates via bottom action buttons
  const handleBulkAction = async (action, successMsg) => {
    if (selectedIds.length === 0) {
      dispatch(openSnackbar({ open: true, message: 'Select at least one applicant.', variant: 'alert', severity: 'warning' }));
      return;
    }
    setLoading(true);
    try {
      await axios.post('/api/hra/applicants/bulk-action', {
        ids: selectedIds,
        action: action
      });
      dispatch(openSnackbar({ open: true, message: successMsg, variant: 'alert', severity: 'success' }));
      setSelectedIds([]);
      fetchApplicants();
    } catch (e) {
      dispatch(openSnackbar({ open: true, message: 'Bulk action failed. Please try again.', variant: 'alert', severity: 'error' }));
    } finally {
      setLoading(false);
    }
  };

  const handleSendCallLetter = () => handleBulkAction('CALL', 'Call letters successfully processed for selected candidates!');
  const handleAssignInterview = () => handleBulkAction('INTERVIEW', 'Interviews assigned successfully.');
  const handleIssueOffer = () => handleBulkAction('OFFER', 'Offer letters generated and sent successfully.');
  const handlePushOnRoll = () => handleBulkAction('PUSH-ON-ROLL', 'Selected candidates successfully integrated and pushed ON-ROLL!');

  const handleCancelSelection = () => {
    setSelectedIds([]);
  };

  const handleEditSelected = () => {
    if (selectedIds.length !== 1) {
      dispatch(openSnackbar({ open: true, message: 'Select exactly one applicant to edit.', variant: 'alert', severity: 'warning' }));
      return;
    }
    const target = rows.find(r => r.id === selectedIds[0]);
    if (target) handleOpenEdit(target);
  };

  // Form input changes
  const handleInputChange = (e) => {
    const { name, value, checked, type } = e.target;
    const finalVal = type === 'checkbox' ? checked : value;
    
    setFormData(prev => {
      const updated = { ...prev, [name]: finalVal };
      if (name === 'birthDate') {
        updated.age = calculateAge(finalVal);
      }
      if (name === 'refMode') {
        updated.refComments = '';
      }
      return updated;
    });
    
    if (errors[name]) clearErrors(name);
    if (name === 'refMode') clearErrors('refComments');
  };

  const handlePersonalChange = (e) => {
    const { name, value, checked, type } = e.target;
    const finalVal = type === 'checkbox' ? checked : value;
    setPersonalData(prev => {
      const updated = { ...prev, [name]: finalVal };
      if (name === 'sameAsPermanent') {
        if (finalVal) {
          updated.persAdd1 = prev.permAdd1;
          updated.persAdd2 = prev.permAdd2;
        } else {
          updated.persAdd1 = '';
          updated.persAdd2 = '';
        }
      }
      return updated;
    });
  };

  // Salary Calculations
  const computedGross = useMemo(() => {
    const sum = 
      Number(salaryData.basic || 0) +
      Number(salaryData.da || 0) +
      Number(salaryData.hra || 0) +
      Number(salaryData.splAllowance || 0) +
      Number(salaryData.perfIncentive || 0) +
      Number(salaryData.statutoryBonus || 0) +
      Number(salaryData.canteenAllowance || 0) +
      Number(salaryData.attendanceAllow1 || 0) +
      Number(salaryData.attendanceAllow2 || 0) +
      Number(salaryData.uniform || 0) +
      Number(salaryData.shoes || 0) +
      Number(salaryData.mobileCug || 0) +
      Number(salaryData.otAmount || 0) +
      Number(salaryData.petrolAllow || 0) +
      Number(salaryData.otherAllow || 0);
    return parseFloat(sum.toFixed(2));
  }, [salaryData]);

  const computedNet = useMemo(() => {
    const deduct = 
      Number(salaryData.pfEmployee || 0) +
      Number(salaryData.esiEmployee || 0) +
      Number(salaryData.canteenDeduct || 0) +
      Number(salaryData.profTax || 0) +
      Number(salaryData.labourWelFundEmp || 0) +
      Number(salaryData.otherDeduct || 0) +
      Number(salaryData.suspenseDeduct || 0);
    return parseFloat((computedGross - deduct).toFixed(2));
  }, [computedGross, salaryData]);

  const computedCTC = useMemo(() => {
    const employerCost = 
      Number(salaryData.pfEmployer || 0) +
      Number(salaryData.esiEmployer || 0) +
      Number(salaryData.labourWelFundEmployer || 0);
    return parseFloat((computedGross + employerCost).toFixed(2));
  }, [computedGross, salaryData]);

  const handleSalaryChange = (e) => {
    const { name, value } = e.target;
    setSalaryData(prev => ({ ...prev, [name]: Number(value) }));
  };

  // Save the master applicant form
  const handleSave = async () => {
    const dynamicRules = [...VALIDATION_RULES];
    if (formData.refMode === 'OTHERS') {
      dynamicRules.push({ field: 'refComments', label: 'Ref Comments', required: true });
    } else if (formData.refMode === 'EMPLOYEE') {
      dynamicRules.push({ field: 'refComments', label: 'Emp Name', required: true });
    }
    if (!validate(formData, dynamicRules)) {
      dispatch(openSnackbar({ open: true, message: 'Please fix validation errors in the main form.', variant: 'alert', severity: 'error' }));
      return;
    }

    setLoading(true);
    try {
      const payload = {
        id: formData.id,
        enRolledNo: formData.enRolledNo,
        applicantDate: formData.applicantDate,
        positionLookFor: formData.positionLookFor,
        title: formData.title,
        firstName: formData.firstName,
        lastName: formData.lastName,
        department: formData.department,
        mobileNo: formData.mobileNo,
        emailId: formData.emailId,
        aadharNo: formData.aadharNo,
        birthDate: formData.birthDate,
        age: formData.age ? parseInt(formData.age) : null,
        duplicateAadhar: formData.duplicateAadhar,
        refMode: formData.refMode,
        refComments: formData.refComments,
        callStatus: formData.call || 'PENDING',
        interviewStatus: formData.interview || 'PENDING',
        offerStatus: formData.offer || 'PENDING',
        verificationStatus: formData.verification || 'PENDING',
        status: formData.status || 'APPLIED',

        // Tab 1 Personal Details
        gender: personalData.gender,
        maritalStatus: personalData.maritalStatus,
        panNo: personalData.panNo,
        officePhoneNo: personalData.officePhoneNo,
        phoneNo: personalData.phoneNo,
        religion: personalData.religion,
        nationality: personalData.nationality,
        permAdd1: personalData.permAdd1,
        permAdd2: personalData.permAdd2,
        city: personalData.city,
        state: personalData.state,
        sameAsPermanent: personalData.sameAsPermanent,
        persAdd1: personalData.persAdd1,
        persAdd2: personalData.persAdd2,

        // Tab 4 Salary Structure
        basic: Number(salaryData.basic || 0),
        da: Number(salaryData.da || 0),
        hra: Number(salaryData.hra || 0),
        splAllowance: Number(salaryData.splAllowance || 0),
        perfIncentive: Number(salaryData.perfIncentive || 0),
        statutoryBonus: Number(salaryData.statutoryBonus || 0),
        canteenAllowance: Number(salaryData.canteenAllowance || 0),
        attendanceAllow1: Number(salaryData.attendanceAllow1 || 0),
        attendanceAllow2: Number(salaryData.attendanceAllow2 || 0),
        uniform: Number(salaryData.uniform || 0),
        shoes: Number(salaryData.shoes || 0),
        mobileCug: Number(salaryData.mobileCug || 0),
        otAmount: Number(salaryData.otAmount || 0),
        petrolAllow: Number(salaryData.petrolAllow || 0),
        appraisalPer: Number(salaryData.appraisalPer || 0),
        otherAllow: Number(salaryData.otherAllow || 0),
        pfEmployee: Number(salaryData.pfEmployee || 0),
        pfEmployer: Number(salaryData.pfEmployer || 0),
        esiEmployee: Number(salaryData.esiEmployee || 0),
        esiEmployer: Number(salaryData.esiEmployer || 0),
        canteenDeduct: Number(salaryData.canteenDeduct || 0),
        profTax: Number(salaryData.profTax || 0),
        labourWelFundEmp: Number(salaryData.labourWelFundEmp || 0),
        labourWelFundEmployer: Number(salaryData.labourWelFundEmployer || 0),
        otherDeduct: Number(salaryData.otherDeduct || 0),
        suspenseDeduct: Number(salaryData.suspenseDeduct || 0),
        grossSalary: computedGross,
        netSalary: computedNet,
        ctc: computedCTC,

        // Tab 5 Evaluation Details
        interviewDate: evaluationData.interviewDate,
        evaluationStatus: evaluationData.status || 'HOLD',
        evaluationComments: evaluationData.comments,
        technicalInterviewedBy: evaluationData.technicalInterviewedBy,
        hrInterviewedBy: evaluationData.hrInterviewedBy,

        // Tab 6 Contact Details
        contactAddress1: contactData.address1,
        contactAddress2: contactData.address2,
        contactCity: contactData.city,
        contactPhone: contactData.phoneNo,
        contactMobile: contactData.mobileNo || formData.mobileNo,

        // Tab 8 Self Assessment
        q1_native: assessmentData.q1_native,
        q2_present_address: assessmentData.q2_presentAddress,
        q3_permanent_address: assessmentData.q3_permanentAddress,
        q4_father_occupation: assessmentData.q4_fatherOccupation,
        q5_mother_occupation: assessmentData.q5_motherOccupation,
        q6_marital_status: assessmentData.q6_maritalStatus,
        q7_spouse_occupation: assessmentData.q7_spouseOccupation,
        q8_children: assessmentData.q8_children,
        q9_has_relatives: assessmentData.q9_hasRelativesInCompany,
        q10_relatives_details: assessmentData.q10_relativesDetails,
        q11_siblings_occupations: assessmentData.q11_siblingsOccupations,
        q12_has_two_wheeler: assessmentData.q12_hasTwoWheeler,
        q13_has_android_phone: assessmentData.q13_hasAndroidPhone,
        q14_knows_car_driving: assessmentData.q14_knowsCarDriving,
        q15_willing_to_travel: assessmentData.q15_willingToTravel,
        q16_covid_vaccination: assessmentData.q16_covidVaccination,
        q17_positive_points: assessmentData.q17_positivePoints,
        q18_negative_points: assessmentData.q18_negativePoints,
        q19_life_goals: assessmentData.q19_lifeGoals,
        q20_improvement_suggestions: assessmentData.q20_improvementSuggestions,
        q21_is_experienced: assessmentData.q21_isExperienced,
        q22_total_experience: assessmentData.q22_totalExperience,
        q23_core_experience: assessmentData.q23_coreExperience,
        q24_prev_net_salary: assessmentData.q24_prevNetSalary,
        q25_prev_gross_salary: assessmentData.q25_prevGrossSalary,
        q26_expected_net_salary: assessmentData.q26_expectedNetSalary,
        q27_expected_gross_salary: assessmentData.q27_expectedGrossSalary,
        q28_pf_higher_pension: assessmentData.q28_pfHigherPension,
        q29_pf_deduction_amount: assessmentData.q29_pfDeductionAmount,
        q30_alternative_department: assessmentData.q30_alternativeDepartment,
        q31_prev_location: assessmentData.q31_prevLocation,
        q32_prev_shift: assessmentData.q32_prevShift,
        q33_reason_for_leaving: assessmentData.q33_reasonForLeaving,
        q34_notice_period: assessmentData.q34_noticePeriod,
        q35_prev_dept_position: assessmentData.q35_prevDeptPosition,
        q36_prev_dept_count: assessmentData.q36_prevDeptCount,
        q37_prev_reporting_to: assessmentData.q37_prevReportingTo,
        q38_handle_mistake: assessmentData.q38_handleMistake,
        q39_handle_opinion_difference: assessmentData.q39_handleOpinionDifference,
        q40_computer_self_rating: assessmentData.q40_computerSelfRating,
        payslipPath: assessmentData.payslip ? assessmentData.payslip.serverFileName : null,

        // Child arrays
        experience: experienceRows.map((row, idx) => ({
          id: row.id || null,
          slNo: idx + 1,
          companyName: row.companyName,
          location: row.location,
          fromDate: row.fromDate || null,
          toDate: row.toDate || null,
          expYears: row.expYears,
          filePath: row.file ? row.file.serverFileName : null
        })),
        education: educationRows.map((row, idx) => ({
          id: row.id || null,
          slNo: idx + 1,
          education: row.education,
          institutionName: row.institutionName,
          type: row.type || 'FULL TIME',
          yearOfPassing: row.yearOfPassing,
          grade: row.grade,
          filePath: row.file ? row.file.serverFileName : null
        })),
        kyc: kycRows.map((row, idx) => ({
          id: row.id || null,
          slNo: idx + 1,
          seqNo: row.seqNo,
          docName: row.docName,
          docNo: row.docNo,
          filePath: row.file ? row.file.serverFileName : null
        })),
        skills: skillsRows.map((row, idx) => ({
          id: row.id || null,
          slNo: idx + 1,
          activityDetails: row.activityDetails,
          filePath: row.file ? row.file.serverFileName : null
        }))
      };

      if (formData.id) {
        // Edit mode
        await axios.put(`/api/hra/applicants/${formData.id}`, payload);
        dispatch(openSnackbar({ open: true, message: 'Applicant updated successfully.', variant: 'alert', severity: 'success' }));
      } else {
        // Create mode
        await axios.post('/api/hra/applicants', payload);
        dispatch(openSnackbar({ open: true, message: 'Applicant registered successfully.', variant: 'alert', severity: 'success' }));
      }
      setDialogOpen(false);
      fetchApplicants();
    } catch (e) {
      const errMsg = e.response?.data || 'Failed to save applicant. Please try again.';
      dispatch(openSnackbar({ open: true, message: typeof errMsg === 'string' ? errMsg : 'Failed to save applicant.', variant: 'alert', severity: 'error' }));
    } finally {
      setLoading(false);
    }
  };

  // Section Table operations
  const handleAddExperienceRow = () => {
    setExperienceRows(prev => [
      ...prev,
      { slNo: prev.length + 1, companyName: '', location: '', fromDate: '', toDate: '', expYears: '', file: null }
    ]);
  };

  const handleExperienceRowChange = (index, field, value) => {
    setExperienceRows(prev => prev.map((row, i) => i === index ? { ...row, [field]: value } : row));
  };

  const handleAddEducationRow = () => {
    setEducationRows(prev => [
      ...prev,
      { slNo: prev.length + 1, education: '', institutionName: '', type: 'FULL TIME', yearOfPassing: '', grade: '', file: null }
    ]);
  };

  const handleEducationRowChange = (index, field, value) => {
    setEducationRows(prev => prev.map((row, i) => i === index ? { ...row, [field]: value } : row));
  };

  const handleAddSkillRow = () => {
    setSkillsRows(prev => [
      ...prev,
      { slNo: prev.length + 1, activityDetails: '', file: null }
    ]);
  };

  const handleSkillRowChange = (index, field, value) => {
    setSkillsRows(prev => prev.map((row, i) => i === index ? { ...row, [field]: value } : row));
  };

  // Delete candidate from grid
  const handleDeleteRow = (row) => {
    setDeleteTarget(row);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    setLoading(true);
    try {
      await axios.delete(`/api/hra/applicants/${deleteTarget.id}`);
      dispatch(openSnackbar({ open: true, message: 'Applicant deleted successfully.', variant: 'alert', severity: 'success' }));
      setDeleteDialogOpen(false);
      setSelectedIds([]);
      fetchApplicants();
    } catch (e) {
      dispatch(openSnackbar({ open: true, message: 'Failed to delete applicant.', variant: 'alert', severity: 'error' }));
    } finally {
      setLoading(false);
    }
  };

  // Setup grid columns
  const tableColumns = useMemo(() => [
    {
      id: 'select',
      label: '',
      minWidth: 50,
      render: (row) => (
        <Checkbox
          checked={selectedIds.includes(row.id)}
          onChange={() => handleSelectRow(row.id)}
          size="small"
        />
      )
    },
    { id: 'index', label: 'Sl.no', minWidth: 60 },
    { id: 'enRolledNo', label: 'En.Rolled.No', minWidth: 120, bold: true, color: 'primary.main' },
    { id: 'firstName', label: 'First Name', minWidth: 120 },
    { id: 'lastName', label: 'Last Name', minWidth: 120 },
    {
      id: 'department',
      label: 'Dept Name',
      minWidth: 150,
      render: (row) => {
        const dept = departments.find(d => d.id.toString() === row.department || d.departmentName === row.department);
        return dept ? dept.departmentName : row.department || '-';
      }
    },
    {
      id: 'positionLookFor',
      label: 'Position Look for',
      minWidth: 150,
      render: (row) => {
        const desig = designations.find(d => d.id.toString() === row.positionLookFor || d.designationName === row.positionLookFor);
        return desig ? desig.designationName : row.positionLookFor || '-';
      }
    },
    { id: 'applicantDate', label: 'App Date', minWidth: 120 },
    {
      id: 'call',
      label: 'Call',
      minWidth: 100,
      render: (row) => (
        <Chip
          label={row.call || 'PENDING'}
          size="small"
          color={row.call === 'SENT' ? 'success' : 'default'}
          sx={{ fontWeight: 'bold' }}
        />
      )
    },
    {
      id: 'interview',
      label: 'Interview',
      minWidth: 120,
      render: (row) => (
        <Chip
          label={row.interview || 'PENDING'}
          size="small"
          color={row.interview === 'SCHEDULED' ? 'warning' : row.interview === 'COMPLETED' ? 'success' : 'default'}
          sx={{ fontWeight: 'bold' }}
        />
      )
    },
    {
      id: 'offer',
      label: 'Offer',
      minWidth: 100,
      render: (row) => (
        <Chip
          label={row.offer || 'PENDING'}
          size="small"
          color={row.offer === 'ISSUED' ? 'success' : 'default'}
          sx={{ fontWeight: 'bold' }}
        />
      )
    },
    {
      id: 'verification',
      label: 'Verification',
      minWidth: 120,
      render: (row) => (
        <Chip
          label={row.verification || 'PENDING'}
          size="small"
          color={row.verification === 'VERIFIED' ? 'success' : 'default'}
          sx={{ fontWeight: 'bold' }}
        />
      )
    },
    {
      id: 'status',
      label: 'Status',
      minWidth: 120,
      render: (row) => (
        <Chip
          label={row.status || 'APPLIED'}
          size="small"
          color={row.status === 'ON-ROLL' ? 'success' : row.status === 'REJECTED' ? 'error' : 'primary'}
          sx={{ fontWeight: 'bold' }}
        />
      )
    }
  ], [selectedIds, departments, designations]);

  return (
    <MainCard
      title={
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <IconTrendingUp size={24} />
          <Typography variant="h3">Application Tracking System</Typography>
        </Stack>
      }
      secondary={
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Tooltip title="Refresh">
            <IconButton onClick={fetchApplicants} color="primary" size="small" sx={{
              border: '2px solid', borderColor: 'divider', borderRadius: '8px', p: 1,
              transition: 'all 0.2s', '&:hover': { bgcolor: 'primary.light', transform: 'scale(1.05)' }
            }}>
              <IconRefresh size={20} />
            </IconButton>
          </Tooltip>
          <Tooltip title={shortcutTooltip('Register Candidate', 'Ctrl + N')}>
            <Button
              variant="contained"
              color="primary"
              size="medium"
              onClick={handleOpenAdd}
              startIcon={<IconPlus size={18} />}
              sx={{ borderRadius: '8px', textTransform: 'none', px: 2 }}
            >
              + New
            </Button>
          </Tooltip>
        </Stack>
      }
    >
      <Box sx={{ mb: 2 }}>
        {/* Bulk select checkbox info */}
        <FormControlLabel
          control={
            <Checkbox
              indeterminate={selectedIds.length > 0 && selectedIds.length < rows.length}
              checked={selectedIds.length === rows.length && rows.length > 0}
              onChange={(e) => handleSelectAll(e.target.checked)}
              size="small"
            />
          }
          label={`Select All Candidates (${selectedIds.length} selected)`}
          sx={{ ml: 1 }}
        />
      </Box>

      {/* Main Grid Table */}
      <BOSDataTable
        columns={tableColumns}
        rows={rows}
        page={page}
        size={size}
        loading={loading}
        onPageChange={(p) => setPage(p)}
        onSizeChange={(s) => { setSize(s); setPage(0); }}
        onDoubleClickRow={handleOpenEdit}
        onEditRow={handleOpenEdit}
        onDeleteRow={handleDeleteRow}
      />

      {/* Bottom Footer Actions */}
      <Paper elevation={0} sx={{ p: 2, mt: 2, borderTop: '1px solid', borderColor: 'divider', bgcolor: 'grey.50', borderRadius: '12px' }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="flex-end">
          <Button variant="outlined" color="primary" onClick={handleSendCallLetter} startIcon={<IconMail size={18} />} sx={{ borderRadius: '24px', textTransform: 'none' }}>
            Call Letter
          </Button>
          <Button variant="outlined" color="warning" onClick={handleAssignInterview} startIcon={<IconCalendar size={18} />} sx={{ borderRadius: '24px', textTransform: 'none' }}>
            Assign Interview
          </Button>
          <Button variant="outlined" color="success" onClick={handleIssueOffer} startIcon={<IconFileText size={18} />} sx={{ borderRadius: '24px', textTransform: 'none' }}>
            Offer Letter
          </Button>
          <Button variant="contained" color="success" onClick={handlePushOnRoll} startIcon={<IconUserCheck size={18} />} sx={{ borderRadius: '24px', textTransform: 'none', fontWeight: 600 }}>
            Push To On-Roll
          </Button>
          <Button variant="outlined" color="error" onClick={handleCancelSelection} sx={{ borderRadius: '24px', textTransform: 'none' }}>
            Cancel Selection
          </Button>
          <Button variant="outlined" color="secondary" onClick={handleEditSelected} disabled={selectedIds.length !== 1} startIcon={<IconEdit size={18} />} sx={{ borderRadius: '24px', textTransform: 'none' }}>
            Edit Candidate
          </Button>
        </Stack>
      </Paper>

      {/* Candidate Registration and Detailed Dialog */}
      <BOSFormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title={formData.id ? 'Edit Applicant Profile' : 'New Applicant Registration'}
        fullWidth
        maxWidth="lg"
        onSave={handleSave}
        onClear={() => {
          setFormData(INITIAL_FORM_STATE);
          setPersonalData(INITIAL_PERSONAL_STATE);
          setEvaluationData(INITIAL_EVALUATION_STATE);
          setContactData(INITIAL_CONTACT_STATE);
          setAssessmentData(INITIAL_ASSESSMENT_STATE);
          setSalaryData(INITIAL_SALARY_STATE);
          setExperienceRows([]);
          setEducationRows([]);
          setSkillsRows([]);
          setKycRows([
            { slNo: 1, seqNo: 'KYC-01', docName: 'AADHAR CARD', docNo: '', file: null },
            { slNo: 2, seqNo: 'KYC-02', docName: 'PAN CARD', docNo: '', file: null },
            { slNo: 3, seqNo: 'KYC-03', docName: 'VOTER ID', docNo: '', file: null },
            { slNo: 4, seqNo: 'KYC-04', docName: 'PASSPORT', docNo: '', file: null }
          ]);
          setErrors({});
        }}
      >
        <Grid container spacing={3}>
          {/* ── TOP SECTION: Main Registry Form ── */}
          <Grid item xs={12}>
            <Card variant="outlined" sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '16px', bgcolor: 'rgba(33, 150, 243, 0.02)', mb: 1 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h5" color="primary" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1, fontWeight: 700 }}>
                  <IconUser size={20} /> BASIC REGISTRATION DETAILS
                </Typography>
                <Grid container spacing={2.5}>
                  {/* Row 1: Registry Details */}
                  <Grid item xs={12} sm={6} md={3}>
                    <BOSTextField
                      required
                      label="En Rolled No"
                      name="enRolledNo"
                      value={formData.enRolledNo}
                      onChange={handleInputChange}
                      placeholder="ATS-2026-001"
                      error={!!errors.enRolledNo}
                      helperText={errors.enRolledNo}
                      sx={errorStyle(!!errors.enRolledNo)}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <BOSTextField
                      type="date"
                      label="Applicant Date"
                      name="applicantDate"
                      value={formData.applicantDate}
                      onChange={handleInputChange}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <BOSTextField
                      select
                      required
                      label="Position Look For"
                      name="positionLookFor"
                      value={formData.positionLookFor}
                      onChange={handleInputChange}
                      error={!!errors.positionLookFor}
                      helperText={errors.positionLookFor}
                      sx={errorStyle(!!errors.positionLookFor)}
                    >
                      <MenuItem value="">-SELECT-</MenuItem>
                      {designations.map(d => (
                        <MenuItem key={d.id} value={d.designationName || d.id.toString()}>{d.designationName}</MenuItem>
                      ))}
                      <MenuItem value="Software Engineer">Software Engineer</MenuItem>
                      <MenuItem value="HR Executive">HR Executive</MenuItem>
                      <MenuItem value="Quality Auditor">Quality Auditor</MenuItem>
                    </BOSTextField>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <BOSTextField
                      select
                      required
                      label="Department"
                      name="department"
                      value={formData.department}
                      onChange={handleInputChange}
                      error={!!errors.department}
                      helperText={errors.department}
                      sx={errorStyle(!!errors.department)}
                    >
                      <MenuItem value="">-SELECT-</MenuItem>
                      {departments.map(d => (
                        <MenuItem key={d.id} value={d.departmentName || d.id.toString()}>{d.departmentName}</MenuItem>
                      ))}
                      <MenuItem value="Development">Development</MenuItem>
                      <MenuItem value="Human Resources">Human Resources</MenuItem>
                      <MenuItem value="Finance">Finance</MenuItem>
                    </BOSTextField>
                  </Grid>

                  {/* Row 2: Candidate basic info */}
                  <Grid item xs={12} sm={6} md={1.5}>
                    <BOSTextField
                      select
                      label="Title"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                    >
                      {TITLE_OPTIONS.map(opt => (
                        <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                      ))}
                    </BOSTextField>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3.5}>
                    <BOSTextField
                      required
                      label="First Name"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      error={!!errors.firstName}
                      helperText={errors.firstName}
                      sx={errorStyle(!!errors.firstName)}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3.5}>
                    <BOSTextField
                      required
                      label="Last Name"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      error={!!errors.lastName}
                      helperText={errors.lastName}
                      sx={errorStyle(!!errors.lastName)}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={2}>
                    <BOSTextField
                      type="date"
                      required
                      label="Birth Date"
                      name="birthDate"
                      value={formData.birthDate}
                      onChange={handleInputChange}
                      InputLabelProps={{ shrink: true }}
                      error={!!errors.birthDate}
                      helperText={errors.birthDate}
                      sx={errorStyle(!!errors.birthDate)}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={1.5}>
                    <BOSTextField
                      label="Age"
                      name="age"
                      value={formData.age}
                      disabled
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>

                  {/* Row 3: Contact & ID info */}
                  <Grid item xs={12} sm={6} md={4}>
                    <BOSTextField
                      required
                      label="Mobile No"
                      name="mobileNo"
                      value={formData.mobileNo}
                      onChange={handleInputChange}
                      placeholder="10-digit number"
                      error={!!errors.mobileNo}
                      helperText={errors.mobileNo}
                      sx={errorStyle(!!errors.mobileNo)}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <BOSTextField
                      required
                      label="Email ID"
                      name="emailId"
                      value={formData.emailId}
                      onChange={handleInputChange}
                      placeholder="example@mail.com"
                      error={!!errors.emailId}
                      helperText={errors.emailId}
                      sx={errorStyle(!!errors.emailId)}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Stack spacing={1}>
                      <BOSTextField
                        required
                        label="Aadhar No"
                        name="aadharNo"
                        value={formData.aadharNo}
                        onChange={handleInputChange}
                        placeholder="12-digit number"
                        error={!!errors.aadharNo}
                        helperText={errors.aadharNo}
                        sx={errorStyle(!!errors.aadharNo)}
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={formData.duplicateAadhar}
                            onChange={handleInputChange}
                            name="duplicateAadhar"
                            size="small"
                          />
                        }
                        label="I know its duplicate Aadhaar No"
                        sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.75rem', fontWeight: 600 } }}
                      />
                    </Stack>
                  </Grid>

                  {/* Row 4: Reference Details */}
                  <Grid item xs={12} sm={6} md={3}>
                    <BOSTextField
                      select
                      label="Ref Mode"
                      name="refMode"
                      value={formData.refMode}
                      onChange={handleInputChange}
                    >
                      <MenuItem value="">-Select-</MenuItem>
                      {REF_MODES.map(opt => (
                        <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                      ))}
                    </BOSTextField>
                  </Grid>

                  {formData.refMode === 'EMPLOYEE' && (
                    <Grid item xs={12} sm={6} md={9}>
                      <BOSTextField
                        select
                        required
                        label="Emp Name"
                        name="refComments"
                        value={formData.refComments}
                        onChange={handleInputChange}
                        error={!!errors.refComments}
                        helperText={errors.refComments}
                        sx={errorStyle(!!errors.refComments)}
                      >
                        <MenuItem value="">-SELECT EMPLOYEE-</MenuItem>
                        {employees.map(emp => {
                          const fullName = emp.employeeName || `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || emp.empCode;
                          const valueStr = `${emp.empCode} - ${fullName}`;
                          return (
                            <MenuItem key={emp.id} value={valueStr}>
                              {valueStr}
                            </MenuItem>
                          );
                        })}
                      </BOSTextField>
                    </Grid>
                  )}

                  {formData.refMode && formData.refMode !== 'EMPLOYEE' && (
                    <Grid item xs={12} sm={6} md={9}>
                      <BOSTextField
                        required={formData.refMode === 'OTHERS'}
                        label="Ref Comments"
                        name="refComments"
                        value={formData.refComments}
                        onChange={handleInputChange}
                        error={!!errors.refComments}
                        helperText={errors.refComments}
                        sx={errorStyle(!!errors.refComments)}
                      />
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* ── BOTTOM TABS FOR SUB-SECTIONS ── */}
          <Grid item xs={12}>
            <Box sx={{ width: '100%', borderBottom: '1px solid', borderColor: 'divider', mb: 2 }}>
              <Tabs
                value={activeTab}
                onChange={(e, newTab) => setActiveTab(newTab)}
                variant="scrollable"
                scrollButtons="auto"
                textColor="primary"
                indicatorColor="primary"
              >
                <Tab label="Personal" icon={<IconUser size={18} />} iconPosition="start" />
                <Tab label="Experience" icon={<IconBriefcase size={18} />} iconPosition="start" />
                <Tab label="Education" icon={<IconSchool size={18} />} iconPosition="start" />
                <Tab label="Salary Structure" icon={<IconCurrencyDollar size={18} />} iconPosition="start" />
                <Tab label="Evaluation" icon={<IconFileText size={18} />} iconPosition="start" />
                <Tab label="Contact" icon={<IconAddressBook size={18} />} iconPosition="start" />
                <Tab label="KYC" icon={<IconLock size={18} />} iconPosition="start" />
                <Tab label="Self Assessment" icon={<IconStar size={18} />} iconPosition="start" />
                <Tab label="Skill" icon={<IconTrendingUp size={18} />} iconPosition="start" />
              </Tabs>
            </Box>

            {/* TAB CONTENTS */}
            <Box sx={{ minHeight: '300px', p: 1 }}>
              
              {/* 1. PERSONAL DETAILS */}
              {activeTab === 0 && (
                <Grid container spacing={2.5}>
                  <Grid item xs={12} sm={6} md={3}>
                    <BOSTextField
                      label="En Roll.No"
                      name="enRollNo"
                      value={personalData.enRollNo}
                      onChange={handlePersonalChange}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <BOSTextField
                      select
                      label="Gender"
                      name="gender"
                      value={personalData.gender}
                      onChange={handlePersonalChange}
                      required
                    >
                      <MenuItem value="">-Select-</MenuItem>
                      {GENDER_OPTIONS.map(opt => (
                        <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                      ))}
                    </BOSTextField>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <BOSTextField
                      select
                      label="Marital Status"
                      name="maritalStatus"
                      value={personalData.maritalStatus}
                      onChange={handlePersonalChange}
                    >
                      <MenuItem value="">-Select-</MenuItem>
                      {MARITAL_STATUSES.map(opt => (
                        <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                      ))}
                    </BOSTextField>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <BOSTextField
                      type="date"
                      label="Birth Date"
                      name="birthDate"
                      value={personalData.birthDate}
                      onChange={handlePersonalChange}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <BOSTextField
                      label="PAN No"
                      name="panNo"
                      value={personalData.panNo}
                      onChange={handlePersonalChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <BOSTextField
                      select
                      label="Religion"
                      name="religion"
                      value={personalData.religion}
                      onChange={handlePersonalChange}
                    >
                      <MenuItem value="">-Select-</MenuItem>
                      {RELIGIONS.map(opt => (
                        <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                      ))}
                    </BOSTextField>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <BOSTextField
                      label="Nationality"
                      name="nationality"
                      value={personalData.nationality}
                      onChange={handlePersonalChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <BOSTextField
                      label="Office Phone No"
                      name="officePhoneNo"
                      value={personalData.officePhoneNo}
                      onChange={handlePersonalChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <BOSTextField
                      label="Phone No"
                      name="phoneNo"
                      value={personalData.phoneNo}
                      onChange={handlePersonalChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <BOSTextField
                      label="Mobile No"
                      name="mobileNo"
                      value={personalData.mobileNo || formData.mobileNo}
                      onChange={handlePersonalChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <BOSTextField
                      label="Email Id"
                      name="emailId"
                      value={personalData.emailId || formData.emailId}
                      onChange={handlePersonalChange}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="h6" color="primary" sx={{ mb: 1, fontWeight: 600 }}>PERMANENT ADDRESS</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <BOSTextField
                      label="Address line 1"
                      name="permAdd1"
                      value={personalData.permAdd1}
                      onChange={handlePersonalChange}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <BOSTextField
                      label="Address line 2"
                      name="permAdd2"
                      value={personalData.permAdd2}
                      onChange={handlePersonalChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <BOSTextField
                      label="City"
                      name="city"
                      value={personalData.city}
                      onChange={handlePersonalChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <BOSTextField
                      label="State"
                      name="state"
                      value={personalData.state}
                      onChange={handlePersonalChange}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={personalData.sameAsPermanent}
                          onChange={handlePersonalChange}
                          name="sameAsPermanent"
                        />
                      }
                      label="Personal Address as above"
                      sx={{ fontWeight: 'bold' }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <BOSTextField
                      label="Personal Add1"
                      name="persAdd1"
                      value={personalData.persAdd1}
                      onChange={handlePersonalChange}
                      disabled={personalData.sameAsPermanent}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <BOSTextField
                      label="Personal Add2"
                      name="persAdd2"
                      value={personalData.persAdd2}
                      onChange={handlePersonalChange}
                      disabled={personalData.sameAsPermanent}
                    />
                  </Grid>
                </Grid>
              )}

              {/* 2. EXPERIENCE DETAILS */}
              {activeTab === 1 && (
                <Box>
                  <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: '8px', mb: 2 }}>
                    <Table size="small">
                      <TableHead sx={{ bgcolor: 'primary.light' }}>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600 }}>Sl.No</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Company Name</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Location</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>From Date</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>To Date</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Experience (Years)</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>File Attachment</TableCell>
                          <TableCell align="center">
                            <IconButton color="primary" size="small" onClick={handleAddExperienceRow}>
                              <IconPlus size={18} />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {experienceRows.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={8} align="center" sx={{ py: 3, color: 'text.secondary', fontStyle: 'italic' }}>
                              No experience records added. Click '+' to add one.
                            </TableCell>
                          </TableRow>
                        ) : (
                          experienceRows.map((row, idx) => (
                            <TableRow key={idx}>
                              <TableCell>{idx + 1}</TableCell>
                              <TableCell>
                                <BOSTextField
                                  value={row.companyName}
                                  onChange={(e) => handleExperienceRowChange(idx, 'companyName', e.target.value)}
                                  placeholder="Company Name"
                                  size="small"
                                />
                              </TableCell>
                              <TableCell>
                                <BOSTextField
                                  value={row.location}
                                  onChange={(e) => handleExperienceRowChange(idx, 'location', e.target.value)}
                                  placeholder="Location"
                                  size="small"
                                />
                              </TableCell>
                              <TableCell>
                                <BOSTextField
                                  type="date"
                                  value={row.fromDate}
                                  onChange={(e) => handleExperienceRowChange(idx, 'fromDate', e.target.value)}
                                  size="small"
                                  InputLabelProps={{ shrink: true }}
                                />
                              </TableCell>
                              <TableCell>
                                <BOSTextField
                                  type="date"
                                  value={row.toDate}
                                  onChange={(e) => handleExperienceRowChange(idx, 'toDate', e.target.value)}
                                  size="small"
                                  InputLabelProps={{ shrink: true }}
                                />
                              </TableCell>
                              <TableCell>
                                <BOSTextField
                                  type="number"
                                  value={row.expYears}
                                  onChange={(e) => handleExperienceRowChange(idx, 'expYears', e.target.value)}
                                  placeholder="Years"
                                  size="small"
                                />
                              </TableCell>
                              <TableCell>
                                <BOSFileUpload
                                  files={row.file ? [row.file] : []}
                                  onChange={(files) => handleExperienceRowChange(idx, 'file', files[0] || null)}
                                  multiple={false}
                                  size="small"
                                />
                              </TableCell>
                              <TableCell align="center">
                                <IconButton color="error" size="small" onClick={() => setExperienceRows(prev => prev.filter((_, rIdx) => rIdx !== idx))}>
                                  <IconTrash size={16} />
                                </IconButton>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}

              {/* 3. EDUCATION DETAILS */}
              {activeTab === 2 && (
                <Box>
                  <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: '8px', mb: 2 }}>
                    <Table size="small">
                      <TableHead sx={{ bgcolor: 'primary.light' }}>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600 }}>Sl.No</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Education</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Institution Name</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Year of Passing</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>% / Grade</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Documents</TableCell>
                          <TableCell align="center">
                            <IconButton color="primary" size="small" onClick={handleAddEducationRow}>
                              <IconPlus size={18} />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {educationRows.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={8} align="center" sx={{ py: 3, color: 'text.secondary', fontStyle: 'italic' }}>
                              No education records added. Click '+' to add one.
                            </TableCell>
                          </TableRow>
                        ) : (
                          educationRows.map((row, idx) => (
                            <TableRow key={idx}>
                              <TableCell>{idx + 1}</TableCell>
                              <TableCell>
                                <BOSTextField
                                  value={row.education}
                                  onChange={(e) => handleEducationRowChange(idx, 'education', e.target.value)}
                                  placeholder="Degree/Class"
                                  size="small"
                                />
                              </TableCell>
                              <TableCell>
                                <BOSTextField
                                  value={row.institutionName}
                                  onChange={(e) => handleEducationRowChange(idx, 'institutionName', e.target.value)}
                                  placeholder="Institution Name"
                                  size="small"
                                />
                              </TableCell>
                              <TableCell>
                                <BOSTextField
                                  select
                                  value={row.type}
                                  onChange={(e) => handleEducationRowChange(idx, 'type', e.target.value)}
                                  size="small"
                                >
                                  <MenuItem value="FULL TIME">FULL TIME</MenuItem>
                                  <MenuItem value="PART TIME">PART TIME</MenuItem>
                                  <MenuItem value="CORRESPONDENCE">CORRESPONDENCE</MenuItem>
                                </BOSTextField>
                              </TableCell>
                              <TableCell>
                                <BOSTextField
                                  type="number"
                                  value={row.yearOfPassing}
                                  onChange={(e) => handleEducationRowChange(idx, 'yearOfPassing', e.target.value)}
                                  placeholder="YYYY"
                                  size="small"
                                />
                              </TableCell>
                              <TableCell>
                                <BOSTextField
                                  value={row.grade}
                                  onChange={(e) => handleEducationRowChange(idx, 'grade', e.target.value)}
                                  placeholder="GPA / %"
                                  size="small"
                                />
                              </TableCell>
                              <TableCell>
                                <BOSFileUpload
                                  files={row.file ? [row.file] : []}
                                  onChange={(files) => handleEducationRowChange(idx, 'file', files[0] || null)}
                                  multiple={false}
                                  size="small"
                                />
                              </TableCell>
                              <TableCell align="center">
                                <IconButton color="error" size="small" onClick={() => setEducationRows(prev => prev.filter((_, rIdx) => rIdx !== idx))}>
                                  <IconTrash size={16} />
                                </IconButton>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}

              {/* 4. SALARY STRUCTURE */}
              {activeTab === 3 && (
                <Grid container spacing={2}>
                  {/* Earnings column */}
                  <Grid item xs={12} md={6}>
                    <Card variant="outlined" sx={{ p: 2, borderRadius: '12px' }}>
                      <Typography variant="h5" color="primary" sx={{ mb: 2, fontWeight: 700 }}>EARNING ALLOWANCES</Typography>
                      <Grid container spacing={1.5}>
                        {[
                          { name: 'basic', label: 'Basic' },
                          { name: 'da', label: 'DA' },
                          { name: 'hra', label: 'HRA' },
                          { name: 'splAllowance', label: 'Spl. Allowance' },
                          { name: 'perfIncentive', label: 'Performance Incentive' },
                          { name: 'statutoryBonus', label: 'Statutory Bonus' },
                          { name: 'canteenAllowance', label: 'Canteen Allowance' },
                          { name: 'attendanceAllow1', label: 'Attendance Allow 1' },
                          { name: 'attendanceAllow2', label: 'Attendance Allow 2' },
                          { name: 'uniform', label: 'Uniform' },
                          { name: 'shoes', label: 'Shoes' },
                          { name: 'mobileCug', label: 'Mobile CUG' },
                          { name: 'otAmount', label: 'OT Amount' },
                          { name: 'petrolAllow', label: 'Petrol Allow' },
                          { name: 'otherAllow', label: 'Other Allow' }
                        ].map((f) => (
                          <Grid item xs={12} sm={6} key={f.name}>
                            <BOSTextField
                              type="number"
                              label={f.label}
                              name={f.name}
                              value={salaryData[f.name]}
                              onChange={handleSalaryChange}
                              InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
                            />
                          </Grid>
                        ))}
                      </Grid>
                    </Card>
                  </Grid>

                  {/* Deductions & Employer Contributions */}
                  <Grid item xs={12} md={6}>
                    <Stack spacing={2}>
                      <Card variant="outlined" sx={{ p: 2, borderRadius: '12px' }}>
                        <Typography variant="h5" color="error" sx={{ mb: 2, fontWeight: 700 }}>DEDUCTIONS</Typography>
                        <Grid container spacing={1.5}>
                          {[
                            { name: 'pfEmployee', label: 'PF Employee' },
                            { name: 'esiEmployee', label: 'ESI Employee' },
                            { name: 'canteenDeduct', label: 'Canteen Deduct' },
                            { name: 'profTax', label: 'Prof. Tax' },
                            { name: 'labourWelFundEmp', label: 'Labour Wel Fund Emp' },
                            { name: 'otherDeduct', label: 'Other Deduct' },
                            { name: 'suspenseDeduct', label: 'Suspense Deduct' }
                          ].map((f) => (
                            <Grid item xs={12} sm={6} key={f.name}>
                              <BOSTextField
                                type="number"
                                label={f.label}
                                name={f.name}
                                value={salaryData[f.name]}
                                onChange={handleSalaryChange}
                                InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
                              />
                            </Grid>
                          ))}
                        </Grid>
                      </Card>

                      <Card variant="outlined" sx={{ p: 2, borderRadius: '12px' }}>
                        <Typography variant="h5" color="secondary" sx={{ mb: 2, fontWeight: 700 }}>EMPLOYER CONTRIBUTION</Typography>
                        <Grid container spacing={1.5}>
                          {[
                            { name: 'pfEmployer', label: 'PF Employer' },
                            { name: 'esiEmployer', label: 'ESI Employer' },
                            { name: 'labourWelFundEmployer', label: 'Labour Wel Fund Employer' }
                          ].map((f) => (
                            <Grid item xs={12} sm={6} key={f.name}>
                              <BOSTextField
                                type="number"
                                label={f.label}
                                name={f.name}
                                value={salaryData[f.name]}
                                onChange={handleSalaryChange}
                                InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
                              />
                            </Grid>
                          ))}
                        </Grid>
                      </Card>
                    </Stack>
                  </Grid>

                  {/* Calculations summary row */}
                  <Grid item xs={12}>
                    <Card variant="elevation" elevation={4} sx={{ p: 2, borderRadius: '16px', bgcolor: 'primary.light', border: '1px solid', borderColor: 'primary.main' }}>
                      <Grid container spacing={3} justifyContent="space-around">
                        <Grid item xs={12} sm={4} sx={{ textAlign: 'center' }}>
                          <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600 }}>GROSS SALARY</Typography>
                          <Typography variant="h3" color="primary.dark">₹{computedGross.toLocaleString()}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={4} sx={{ textAlign: 'center' }}>
                          <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600 }}>NET SALARY</Typography>
                          <Typography variant="h3" color="success.dark">₹{computedNet.toLocaleString()}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={4} sx={{ textAlign: 'center' }}>
                          <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600 }}>COST TO COMPANY (CTC)</Typography>
                          <Typography variant="h3" color="secondary.dark">₹{computedCTC.toLocaleString()}</Typography>
                        </Grid>
                      </Grid>
                    </Card>
                  </Grid>
                </Grid>
              )}

              {/* 5. EVALUATION DETAILS */}
              {activeTab === 4 && (
                <Grid container spacing={2.5}>
                  <Grid item xs={12} sm={6}>
                    <BOSTextField
                      label="En Rolled No"
                      name="enRolledNo"
                      value={evaluationData.enRolledNo || formData.enRolledNo}
                      disabled
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <BOSTextField
                      type="date"
                      label="Interview Date"
                      name="interviewDate"
                      value={evaluationData.interviewDate}
                      onChange={(e) => setEvaluationData(prev => ({ ...prev, interviewDate: e.target.value }))}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <BOSTextField
                      select
                      label="Interview Status"
                      name="status"
                      value={evaluationData.status}
                      onChange={(e) => setEvaluationData(prev => ({ ...prev, status: e.target.value }))}
                    >
                      {EVALUATION_STATUSES.map(opt => (
                        <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                      ))}
                    </BOSTextField>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <BOSTextField
                      label="Technical Interviewed By"
                      name="technicalInterviewedBy"
                      value={evaluationData.technicalInterviewedBy}
                      onChange={(e) => setEvaluationData(prev => ({ ...prev, technicalInterviewedBy: e.target.value }))}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <BOSTextField
                      label="HR Interviewed By"
                      name="hrInterviewedBy"
                      value={evaluationData.hrInterviewedBy}
                      onChange={(e) => setEvaluationData(prev => ({ ...prev, hrInterviewedBy: e.target.value }))}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <BOSTextField
                      label="Comments"
                      name="comments"
                      value={evaluationData.comments}
                      onChange={(e) => setEvaluationData(prev => ({ ...prev, comments: e.target.value }))}
                      multiline
                      rows={3}
                    />
                  </Grid>
                </Grid>
              )}

              {/* 6. CONTACT DETAILS */}
              {activeTab === 5 && (
                <Grid container spacing={2.5}>
                  <Grid item xs={12} sm={6}>
                    <BOSTextField
                      label="En Rolled No"
                      name="enRolledNo"
                      value={contactData.enRolledNo || formData.enRolledNo}
                      disabled
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <BOSTextField
                      label="Phone No"
                      name="phoneNo"
                      value={contactData.phoneNo}
                      onChange={(e) => setContactData(prev => ({ ...prev, phoneNo: e.target.value }))}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <BOSTextField
                      label="Mobile No"
                      name="mobileNo"
                      value={contactData.mobileNo || formData.mobileNo}
                      onChange={(e) => setContactData(prev => ({ ...prev, mobileNo: e.target.value }))}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <BOSTextField
                      label="City"
                      name="city"
                      value={contactData.city}
                      onChange={(e) => setContactData(prev => ({ ...prev, city: e.target.value }))}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <BOSTextField
                      label="Address line 1"
                      name="address1"
                      value={contactData.address1}
                      onChange={(e) => setContactData(prev => ({ ...prev, address1: e.target.value }))}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <BOSTextField
                      label="Address line 2"
                      name="address2"
                      value={contactData.address2}
                      onChange={(e) => setContactData(prev => ({ ...prev, address2: e.target.value }))}
                    />
                  </Grid>
                </Grid>
              )}

              {/* 7. KYC DETAILS */}
              {activeTab === 6 && (
                <Box>
                  <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: '8px' }}>
                    <Table size="small">
                      <TableHead sx={{ bgcolor: 'primary.light' }}>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600 }}>Sl.No</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Seq No</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Doc Name</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>DOC No</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>File</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {kycRows.map((row, idx) => (
                          <TableRow key={idx}>
                            <TableCell>{row.slNo}</TableCell>
                            <TableCell>{row.seqNo}</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>{row.docName}</TableCell>
                            <TableCell>
                              <BOSTextField
                                value={row.docNo}
                                onChange={(e) => setKycRows(prev => prev.map((item, i) => i === idx ? { ...item, docNo: e.target.value } : item))}
                                placeholder="Enter document number"
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              <BOSFileUpload
                                files={row.file ? [row.file] : []}
                                onChange={(files) => setKycRows(prev => prev.map((item, i) => i === idx ? { ...item, file: files[0] || null } : item))}
                                multiple={false}
                                size="small"
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}

              {/* 8. SELF ASSESSMENT */}
              {activeTab === 7 && (
                <Grid container spacing={2.5}>
                  {/* Group 1: Personal & Family Details */}
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'primary.main', mt: 1, borderBottom: '1px solid', borderColor: 'divider', pb: 0.5 }}>
                      I. PERSONAL & FAMILY DETAILS
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <BOSTextField label="1. Native" value={assessmentData.q1_native} onChange={(e) => setAssessmentData(p => ({ ...p, q1_native: e.target.value }))} />
                  </Grid>
                  <Grid item xs={12}>
                    <BOSTextField label="2. Present Address" value={assessmentData.q2_presentAddress} onChange={(e) => setAssessmentData(p => ({ ...p, q2_presentAddress: e.target.value }))} multiline rows={2} />
                  </Grid>
                  <Grid item xs={12}>
                    <BOSTextField label="3. Permanent Address" value={assessmentData.q3_permanentAddress} onChange={(e) => setAssessmentData(p => ({ ...p, q3_permanentAddress: e.target.value }))} multiline rows={2} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <BOSTextField label="4. Father's Occupation" value={assessmentData.q4_fatherOccupation} onChange={(e) => setAssessmentData(p => ({ ...p, q4_fatherOccupation: e.target.value }))} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <BOSTextField label="5. Mother's Occupation" value={assessmentData.q5_motherOccupation} onChange={(e) => setAssessmentData(p => ({ ...p, q5_motherOccupation: e.target.value }))} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <BOSTextField select label="6. Marital Status" value={assessmentData.q6_maritalStatus} onChange={(e) => setAssessmentData(p => ({ ...p, q6_maritalStatus: e.target.value }))}>
                      {MARITAL_STATUSES.map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
                    </BOSTextField>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <BOSTextField label="7. Occupation of Spouse" value={assessmentData.q7_spouseOccupation} onChange={(e) => setAssessmentData(p => ({ ...p, q7_spouseOccupation: e.target.value }))} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <BOSTextField label="8. Children" value={assessmentData.q8_children} onChange={(e) => setAssessmentData(p => ({ ...p, q8_children: e.target.value }))} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <BOSTextField select label="9. Any relative or friends working here?" value={assessmentData.q9_hasRelativesInCompany} onChange={(e) => setAssessmentData(p => ({ ...p, q9_hasRelativesInCompany: e.target.value }))}>
                      <MenuItem value="NO">NO</MenuItem>
                      <MenuItem value="YES">YES</MenuItem>
                    </BOSTextField>
                  </Grid>
                  <Grid item xs={12}>
                    <BOSTextField label="10. Relative or friends details" value={assessmentData.q10_relativesDetails} onChange={(e) => setAssessmentData(p => ({ ...p, q10_relativesDetails: e.target.value }))} multiline rows={2} />
                  </Grid>
                  <Grid item xs={12}>
                    <BOSTextField label="11. Siblings and their occupations" value={assessmentData.q11_siblingsOccupations} onChange={(e) => setAssessmentData(p => ({ ...p, q11_siblingsOccupations: e.target.value }))} multiline rows={2} />
                  </Grid>

                  {/* Group 2: General Habits, Vehicle & Health */}
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'primary.main', mt: 2, borderBottom: '1px solid', borderColor: 'divider', pb: 0.5 }}>
                      II. GENERAL HABITS, VEHICLE & HEALTH
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <BOSTextField select label="12. Do you have two wheeler?" value={assessmentData.q12_hasTwoWheeler} onChange={(e) => setAssessmentData(p => ({ ...p, q12_hasTwoWheeler: e.target.value }))}>
                      <MenuItem value="NO">NO</MenuItem>
                      <MenuItem value="YES">YES</MenuItem>
                    </BOSTextField>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <BOSTextField select label="13. Do you have Android phone?" value={assessmentData.q13_hasAndroidPhone} onChange={(e) => setAssessmentData(p => ({ ...p, q13_hasAndroidPhone: e.target.value }))}>
                      <MenuItem value="NO">NO</MenuItem>
                      <MenuItem value="YES">YES</MenuItem>
                    </BOSTextField>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <BOSTextField select label="14. Do you know car driving?" value={assessmentData.q14_knowsCarDriving} onChange={(e) => setAssessmentData(p => ({ ...p, q14_knowsCarDriving: e.target.value }))}>
                      <MenuItem value="NO">NO</MenuItem>
                      <MenuItem value="YES">YES</MenuItem>
                    </BOSTextField>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <BOSTextField select label="15. Willing to travel?" value={assessmentData.q15_willingToTravel} onChange={(e) => setAssessmentData(p => ({ ...p, q15_willingToTravel: e.target.value }))}>
                      <MenuItem value="NO">NO</MenuItem>
                      <MenuItem value="YES">YES</MenuItem>
                    </BOSTextField>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <BOSTextField select label="16. COVID vaccination with booster?" value={assessmentData.q16_covidVaccination} onChange={(e) => setAssessmentData(p => ({ ...p, q16_covidVaccination: e.target.value }))}>
                      <MenuItem value="NO">NO</MenuItem>
                      <MenuItem value="YES">YES</MenuItem>
                    </BOSTextField>
                  </Grid>

                  {/* Group 3: Personal Goals & Reflection */}
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'primary.main', mt: 2, borderBottom: '1px solid', borderColor: 'divider', pb: 0.5 }}>
                      III. PERSONAL GOALS & REFLECTION
                    </Typography>
                  </Grid>

                  <Grid item xs={12}>
                    <BOSTextField label="17. Brief about positive points" value={assessmentData.q17_positivePoints} onChange={(e) => setAssessmentData(p => ({ ...p, q17_positivePoints: e.target.value }))} multiline rows={3} />
                  </Grid>
                  <Grid item xs={12}>
                    <BOSTextField label="18. Brief about negative points" value={assessmentData.q18_negativePoints} onChange={(e) => setAssessmentData(p => ({ ...p, q18_negativePoints: e.target.value }))} multiline rows={3} />
                  </Grid>
                  <Grid item xs={12}>
                    <BOSTextField label="19. What's your life goals?" value={assessmentData.q19_lifeGoals} onChange={(e) => setAssessmentData(p => ({ ...p, q19_lifeGoals: e.target.value }))} multiline rows={3} />
                  </Grid>
                  <Grid item xs={12}>
                    <BOSTextField label="20. Productivity suggestion ideas" value={assessmentData.q20_improvementSuggestions} onChange={(e) => setAssessmentData(p => ({ ...p, q20_improvementSuggestions: e.target.value }))} multiline rows={3} />
                  </Grid>

                  {/* Group 4: Career, Salary & Benefits */}
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'primary.main', mt: 2, borderBottom: '1px solid', borderColor: 'divider', pb: 0.5 }}>
                      IV. CAREER, SALARY & BENEFITS
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <BOSTextField select label="21. Experienced?" value={assessmentData.q21_isExperienced} onChange={(e) => setAssessmentData(p => ({ ...p, q21_isExperienced: e.target.value }))}>
                      <MenuItem value="NO">NO</MenuItem>
                      <MenuItem value="YES">YES</MenuItem>
                    </BOSTextField>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <BOSTextField label="22. Total years of experience" value={assessmentData.q22_totalExperience} onChange={(e) => setAssessmentData(p => ({ ...p, q22_totalExperience: e.target.value }))} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <BOSTextField label="23. Core department experience years" value={assessmentData.q23_coreExperience} onChange={(e) => setAssessmentData(p => ({ ...p, q23_coreExperience: e.target.value }))} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <BOSTextField label="24. Previous Net Salary" value={assessmentData.q24_prevNetSalary} onChange={(e) => setAssessmentData(p => ({ ...p, q24_prevNetSalary: e.target.value }))} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <BOSTextField label="25. Previous Gross Salary" value={assessmentData.q25_prevGrossSalary} onChange={(e) => setAssessmentData(p => ({ ...p, q25_prevGrossSalary: e.target.value }))} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <BOSTextField label="26. Expected Net Salary" value={assessmentData.q26_expectedNetSalary} onChange={(e) => setAssessmentData(p => ({ ...p, q26_expectedNetSalary: e.target.value }))} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <BOSTextField label="27. Expected Gross Salary" value={assessmentData.q27_expectedGrossSalary} onChange={(e) => setAssessmentData(p => ({ ...p, q27_expectedGrossSalary: e.target.value }))} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <BOSTextField select label="28. PF higher pension required?" value={assessmentData.q28_pfHigherPension} onChange={(e) => setAssessmentData(p => ({ ...p, q28_pfHigherPension: e.target.value }))}>
                      <MenuItem value="NO">NO</MenuItem>
                      <MenuItem value="YES">YES</MenuItem>
                    </BOSTextField>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <BOSTextField label="29. PF deduction amount" value={assessmentData.q29_pfDeductionAmount} onChange={(e) => setAssessmentData(p => ({ ...p, q29_pfDeductionAmount: e.target.value }))} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <BOSTextField label="30. Alternate department interest" value={assessmentData.q30_alternativeDepartment} onChange={(e) => setAssessmentData(p => ({ ...p, q30_alternativeDepartment: e.target.value }))} />
                  </Grid>

                  {/* Group 5: Previous Employment Details */}
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'primary.main', mt: 2, borderBottom: '1px solid', borderColor: 'divider', pb: 0.5 }}>
                      V. PREVIOUS EMPLOYMENT DETAILS
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <BOSTextField label="31. Previous/current company location" value={assessmentData.q31_prevLocation} onChange={(e) => setAssessmentData(p => ({ ...p, q31_prevLocation: e.target.value }))} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <BOSTextField label="32. Previously worked shift" value={assessmentData.q32_prevShift} onChange={(e) => setAssessmentData(p => ({ ...p, q32_prevShift: e.target.value }))} />
                  </Grid>
                  <Grid item xs={12}>
                    <BOSTextField label="33. Reason for leaving previous job" value={assessmentData.q33_reasonForLeaving} onChange={(e) => setAssessmentData(p => ({ ...p, q33_reasonForLeaving: e.target.value }))} multiline rows={2} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <BOSTextField label="34. Notice period (days)" value={assessmentData.q34_noticePeriod} onChange={(e) => setAssessmentData(p => ({ ...p, q34_noticePeriod: e.target.value }))} />
                  </Grid>
                  <Grid item xs={12}>
                    <BOSTextField label="35. Prev dept and position details" value={assessmentData.q35_prevDeptPosition} onChange={(e) => setAssessmentData(p => ({ ...p, q35_prevDeptPosition: e.target.value }))} multiline rows={2} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <BOSTextField label="36. Prev dept employee count" value={assessmentData.q36_prevDeptCount} onChange={(e) => setAssessmentData(p => ({ ...p, q36_prevDeptCount: e.target.value }))} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <BOSTextField label="37. Prev manager/reporting to" value={assessmentData.q37_prevReportingTo} onChange={(e) => setAssessmentData(p => ({ ...p, q37_prevReportingTo: e.target.value }))} />
                  </Grid>

                  {/* Group 6: Behavioral & Work Ratings */}
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'primary.main', mt: 2, borderBottom: '1px solid', borderColor: 'divider', pb: 0.5 }}>
                      VI. BEHAVIORAL & WORK RATINGS
                    </Typography>
                  </Grid>

                  <Grid item xs={12}>
                    <BOSTextField label="38. How you handle mistakes" value={assessmentData.q38_handleMistake} onChange={(e) => setAssessmentData(p => ({ ...p, q38_handleMistake: e.target.value }))} multiline rows={3} />
                  </Grid>
                  <Grid item xs={12}>
                    <BOSTextField label="39. Handle team opinion differences" value={assessmentData.q39_handleOpinionDifference} onChange={(e) => setAssessmentData(p => ({ ...p, q39_handleOpinionDifference: e.target.value }))} multiline rows={3} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <BOSTextField select label="40. Self rating (MS-Office, Outlook)" value={assessmentData.q40_computerSelfRating} onChange={(e) => setAssessmentData(p => ({ ...p, q40_computerSelfRating: e.target.value }))}>
                      <MenuItem value="EXCELLENT">EXCELLENT</MenuItem>
                      <MenuItem value="GOOD">GOOD</MenuItem>
                      <MenuItem value="AVERAGE">AVERAGE</MenuItem>
                      <MenuItem value="POOR">POOR</MenuItem>
                    </BOSTextField>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <BOSFileUpload
                      label="PAY SLIP"
                      files={assessmentData.payslip ? [assessmentData.payslip] : []}
                      onChange={(files) => setAssessmentData(p => ({ ...p, payslip: files[0] || null }))}
                      multiple={false}
                    />
                  </Grid>
                </Grid>
              )}

              {/* 9. SKILLS */}
              {activeTab === 8 && (
                <Box>
                  <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: '8px', mb: 2 }}>
                    <Table size="small">
                      <TableHead sx={{ bgcolor: 'primary.light' }}>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600 }}>Sl.No</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Activity Details</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>File Name</TableCell>
                          <TableCell align="center">
                            <IconButton color="primary" size="small" onClick={handleAddSkillRow}>
                              <IconPlus size={18} />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {skillsRows.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={4} align="center" sx={{ py: 3, color: 'text.secondary', fontStyle: 'italic' }}>
                              No skills added yet. Click '+' to add one.
                            </TableCell>
                          </TableRow>
                        ) : (
                          skillsRows.map((row, idx) => (
                            <TableRow key={idx}>
                              <TableCell>{idx + 1}</TableCell>
                              <TableCell>
                                <BOSTextField
                                  value={row.activityDetails}
                                  onChange={(e) => handleSkillRowChange(idx, 'activityDetails', e.target.value)}
                                  placeholder="Activity / Skill Details"
                                  size="small"
                                />
                              </TableCell>
                              <TableCell>
                                <BOSFileUpload
                                  files={row.file ? [row.file] : []}
                                  onChange={(files) => handleSkillRowChange(idx, 'file', files[0] || null)}
                                  multiple={false}
                                  size="small"
                                />
                              </TableCell>
                              <TableCell align="center">
                                <IconButton color="error" size="small" onClick={() => setSkillsRows(prev => prev.filter((_, rIdx) => rIdx !== idx))}>
                                  <IconTrash size={16} />
                                </IconButton>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}

            </Box>
          </Grid>
        </Grid>
      </BOSFormDialog>

      {/* Delete Confirmation */}
      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        title="Remove Applicant"
        message="Are you sure you want to completely remove this candidate application?"
        itemName={`${deleteTarget?.firstName} ${deleteTarget?.lastName}`}
      />
    </MainCard>
  );
}
