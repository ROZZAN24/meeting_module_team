import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Typography,
  Box,
  Button,
  MenuItem,
  Stack,
  Card,
  CardContent,
  Checkbox,
  Autocomplete,
  useTheme,
  Chip,
  Avatar,
  Tooltip,
  Paper
} from '@mui/material';
import { useColorScheme } from '@mui/material/styles';
import {
  IconPlus,
  IconEraser,
  IconCheck,
  IconFileDescription,
  IconCalendarEvent,
  IconUsers,
  IconListCheck,
  IconArrowLeft
} from '@tabler/icons-react';
import axios from 'utils/axios';
import { useDispatch } from 'react-redux';
import { openSnackbar } from 'store/slices/snackbar';
import MainCard from 'ui-component/cards/MainCard';
import {
  BOSFormDialog,
  BOSFormSection,
  BOSTextField,
  BOSDatePicker,
  BOSDataTable,
  btnSave,
  btnClear,
  getStatusChipSx,
  getPhotoUrl
} from 'ui-component/bos';
import useBOSValidation from 'hooks/useBOSValidation';
import useKeyboardShortcuts, { shortcutTooltip } from 'hooks/useKeyboardShortcuts';
import { useLookups } from 'hooks/useLookups';
import { API_PATHS } from 'utils/api-constants';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const formatTime12 = (hour, minute) => {
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')} ${ampm}`;
};

const START_TIME_OPTIONS = [];
for (let h = 9; h <= 20; h++) {
  for (let m = 0; m < 60; m += 30) {
    if (h === 20 && m > 30) break;
    START_TIME_OPTIONS.push(formatTime12(h, m));
  }
}

const END_TIME_OPTIONS = [];
for (let h = 9; h <= 21; h++) {
  for (let m = 0; m < 60; m += 30) {
    if (h === 9 && m < 30) continue;
    if (h === 21 && m > 0) break;
    END_TIME_OPTIONS.push(formatTime12(h, m));
  }
}

const ensure12h = (timeStr) => {
  if (!timeStr) return '';
  if (timeStr.includes('AM') || timeStr.includes('PM')) {
    return timeStr;
  }
  const parts = timeStr.split(':');
  if (parts.length >= 2) {
    const h24 = parseInt(parts[0], 10);
    const m = parts[1].substring(0, 2);
    const ampm = h24 >= 12 ? 'PM' : 'AM';
    const h12 = (h24 % 12 || 12).toString().padStart(2, '0');
    return `${h12}:${m} ${ampm}`;
  }
  return timeStr;
};

const getAuditCategory = (auditTypeStr) => {
  if (!auditTypeStr) return 'DEFAULT';
  const type = auditTypeStr.toUpperCase();
  if (type.includes('CUSTOMER')) return 'CUSTOMER_AUDIT';
  if (type.includes('ISO')) return 'ISO_AUDIT';
  if (type.includes('SUPPLIER ASSESSMENT')) return 'SUPPLIER_ASSESSMENT';
  if (type.includes('SUPPLIER')) return 'SUPPLIER_AUDIT';
  if (type.includes('SUBCONTRACTOR')) return 'SUBCONTRACTOR_AUDIT';
  if (type.includes('PRODUCT')) return 'PRODUCT_AUDIT';
  if (type.includes('RECORD ROOM')) return 'RECORD_ROOM_AUDIT';
  if (type.includes('ERP')) return 'ERP_SCREEN_AUDIT';
  return 'DEFAULT';
};

export default function AddAuditSchedule() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const theme = useTheme();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const isEditing = Boolean(id);
  const { errors, validate, clearErrors } = useBOSValidation();

  const getLocalDateString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const date = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${date}`;
  };

  const [formData, setFormData] = useState({
    scheduleNo: '',
    scheduleDate: getLocalDateString(),
    status: 'OPEN',
    auditType: '',
    auditArea: '',
    auditDate: getLocalDateString(),
    auditMonth: MONTHS[new Date().getMonth()],
    startTime: '09:00 AM',
    endTime: '05:00 PM',
    department: '',
    auditee: '',
    auditeeType: '',
    auditor: '',
    auditorType: '',
    ncrApprovedBy: '',
    ncrApprovedByType: '',
    criteriaMinCount: 0,
    // Dynamic Fields
    customerName: '',
    contactName: '',
    externalName: '',
    emailToCustomer: '',
    fromEmailToCustomer: '',
    subcontractorName: '',
    supplierName: '',
    coOrdinator: ''
  });

  const [criteriaList, setCriteriaList] = useState([]);
  const category = getAuditCategory(formData.auditType);
  const { 
    auditTypes = [], 
    departments = [], 
    auditCriterias: masterCriteria = [], 
    employees = [],
    levels = [],
    designations = [],
    customers = [],
    contacts = []
  } = useLookups(['AUDIT_TYPE', 'DEPARTMENTS', 'AUDIT_CRITERIA', 'EMPLOYEES', 'LEVELS', 'DESIGNATIONS', 'CUSTOMERS', 'CONTACTS']);

  // Criteria Dialog state
  const [criteriaDialogOpen, setCriteriaDialogOpen] = useState(false);
  const [selectedCriteriaIds, setSelectedCriteriaIds] = useState([]);

  useEffect(() => {
    if (isEditing) {
      fetchSchedule();
    } else {
      generateScheduleNo();
    }
  }, [id, isEditing]);

  const generateScheduleNo = async () => {
    try {
      const res = await axios.get(`${API_PATHS.QMS.AUDIT_SCHEDULE}/next-no`);
      setFormData((prev) => ({ ...prev, scheduleNo: res.data }));
    } catch (error) {
      setFormData((prev) => ({ ...prev, scheduleNo: `SCH-${Math.floor(1000 + Math.random() * 9000)}` }));
    }
  };

  const fetchSchedule = async () => {
    try {
      const res = await axios.get(`${API_PATHS.QMS.AUDIT_SCHEDULE}/${id}`);
      const data = res.data;
      let extras = {};
      try {
        if (data.auditeeDetails) {
          extras = JSON.parse(data.auditeeDetails);
        }
      } catch (e) {
        console.error('Failed to parse auditeeDetails:', e);
      }
      setFormData({
        scheduleNo: data.scheduleNo || '',
        scheduleDate: data.scheduleDate ? data.scheduleDate.split('T')[0] : '',
        status: data.status || 'OPEN',
        auditType: data.auditType || '',
        auditArea: data.auditArea || '',
        auditDate: data.auditDate ? data.auditDate.split('T')[0] : '',
        auditMonth: data.auditMonth || '',
        startTime: ensure12h(data.startTime || '09:00 AM'),
        endTime: ensure12h(data.endTime || '05:00 PM'),
        department: data.department || '',
        auditee: data.auditee || '',
        auditeeType: data.auditeeType || '',
        auditor: data.auditor || '',
        auditorType: data.auditorType || '',
        ncrApprovedBy: data.ncrApprovedBy || '',
        ncrApprovedByType: data.ncrApprovedByType || '',
        criteriaMinCount: data.criteriaMinCount || 0,
        itemCode: data.itemCode || '',
        customerName: extras.customerName || '',
        contactName: extras.contactName || '',
        externalName: extras.externalName || '',
        emailToCustomer: extras.emailToCustomer || '',
        fromEmailToCustomer: extras.fromEmailToCustomer || '',
        subcontractorName: extras.subcontractorName || '',
        supplierName: extras.supplierName || '',
        coOrdinator: extras.coOrdinator || ''
      });
      setCriteriaList(data.criteriaList || []);
    } catch (error) {
      console.error('Failed to fetch schedule:', error);
    }
  };

  // Modernize legacy employee labels when employee lookups load
  useEffect(() => {
    if (employees.length > 0) {
      setFormData((prev) => {
        const updateField = (val) => {
          if (!val) return '';
          const code = val.includes(' - ') ? val.split(' - ')[1] : val;
          const match = employees.find(emp => String(emp.empCode || emp.employeeCode || emp.id) === String(code));
          if (match) {
            const fName = match.firstName || '';
            const lName = match.lastName || '';
            const empName = match.employeeName || '';
            let name = '';
            if (fName && lName) {
              name = `${fName} ${lName}`.trim();
            } else if (empName && lName && !empName.toLowerCase().includes(lName.toLowerCase())) {
              name = `${empName} ${lName}`.trim();
            } else if (empName) {
              name = empName;
            } else {
              name = `${fName} ${lName}`.trim();
            }
            return `${name} - ${match.empCode || match.employeeCode || match.id}`;
          }
          return val;
        };

        const updatedAuditee = updateField(prev.auditee);
        const updatedAuditor = updateField(prev.auditor);
        const updatedNcrApproved = updateField(prev.ncrApprovedBy);
        const updatedCoOrdinator = updateField(prev.coOrdinator);

        if (
          updatedAuditee !== prev.auditee || 
          updatedAuditor !== prev.auditor || 
          updatedNcrApproved !== prev.ncrApprovedBy || 
          updatedCoOrdinator !== prev.coOrdinator
        ) {
          return {
            ...prev,
            auditee: updatedAuditee,
            auditor: updatedAuditor,
            ncrApprovedBy: updatedNcrApproved,
            coOrdinator: updatedCoOrdinator
          };
        }
        return prev;
      });
    }
  }, [employees]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    const category = getAuditCategory(formData.auditType);
    const rules = [
      { field: 'auditType', label: 'Audit Type', required: true },
      { field: 'auditArea', label: 'Audit Area', required: true },
      { field: 'auditDate', label: 'Audit Date', required: true },
      { field: 'department', label: 'Department', required: true },
      { field: 'auditee', label: 'Auditee', required: true },
      { field: 'ncrApprovedBy', label: 'NCR Approved By', required: true }
    ];

    if (category === 'CUSTOMER_AUDIT') {
      rules.push({ field: 'customerName', label: 'Customer Name', required: true });
      rules.push({ field: 'contactName', label: 'Contact Name', required: true });
      rules.push({ field: 'coOrdinator', label: 'Co-Ordinator', required: true });
      if (formData.emailToCustomer === 'YES') {
        rules.push({ field: 'fromEmailToCustomer', label: 'From Email', required: true });
      }
    } else if (category === 'ISO_AUDIT' || category === 'SUPPLIER_ASSESSMENT') {
      rules.push({ field: 'externalName', label: 'External Name', required: true });
      rules.push({ field: 'contactName', label: 'Contact Name', required: true });
      rules.push({ field: 'coOrdinator', label: 'Co-Ordinator', required: true });
    } else if (category === 'PRODUCT_AUDIT') {
      rules.push({ field: 'itemCode', label: 'Item Code', required: true });
      rules.push({ field: 'auditor', label: 'Auditor', required: true });
    } else if (category === 'SUBCONTRACTOR_AUDIT') {
      rules.push({ field: 'subcontractorName', label: 'Subcontractor Name', required: true });
      rules.push({ field: 'auditor', label: 'Auditor', required: true });
    } else if (category === 'SUPPLIER_AUDIT') {
      rules.push({ field: 'supplierName', label: 'Supplier Name', required: true });
      rules.push({ field: 'auditor', label: 'Auditor', required: true });
    } else {
      rules.push({ field: 'auditor', label: 'Auditor', required: true });
    }

    if (!validate(formData, rules)) return;

    const convertTo24h = (time12h) => {
      const ensured = ensure12h(time12h);
      const [time, modifier] = ensured.split(' ');
      let [hours, minutes] = time.split(':');
      if (hours === '12') hours = '00';
      if (modifier === 'PM') hours = parseInt(hours, 10) + 12;
      return parseInt(`${hours.toString().padStart(2, '0')}${minutes.toString().padStart(2, '0')}`, 10);
    };

    const startNum = convertTo24h(formData.startTime);
    const endNum = convertTo24h(formData.endTime);
    if (endNum <= startNum) {
      dispatch(openSnackbar({ open: true, message: 'End Time must be greater than Start Time.', severity: 'error', variant: 'alert' }));
      return;
    }

    if (criteriaList.length === 0) {
      dispatch(openSnackbar({ open: true, message: 'At least one criteria must be added.', severity: 'error', variant: 'alert' }));
      return;
    }

    if (formData.criteriaMinCount > (Array.isArray(criteriaList) ? criteriaList.length : 0)) {
      dispatch(openSnackbar({ 
        open: true, 
        message: `Minimum ${formData.criteriaMinCount} criteria are required. Opening selection...`, 
        severity: 'warning', 
        variant: 'alert' 
      }));
      setCriteriaDialogOpen(true);
      return;
    }

    try {
      const extraDetails = {
        customerName: formData.customerName || '',
        contactName: formData.contactName || '',
        externalName: formData.externalName || '',
        emailToCustomer: formData.emailToCustomer || '',
        fromEmailToCustomer: formData.fromEmailToCustomer || '',
        subcontractorName: formData.subcontractorName || '',
        supplierName: formData.supplierName || '',
        coOrdinator: formData.coOrdinator || ''
      };
      
      const payload = { 
        ...formData, 
        auditeeDetails: JSON.stringify(extraDetails),
        criteriaList 
      };

      if (isEditing) {
        await axios.put(`${API_PATHS.QMS.AUDIT_SCHEDULE}/${id}`, payload);
        dispatch(openSnackbar({ open: true, message: 'Audit Schedule updated successfully!', severity: 'success', variant: 'alert' }));
      } else {
        await axios.post(API_PATHS.QMS.AUDIT_SCHEDULE, payload);
        dispatch(openSnackbar({ open: true, message: 'Audit Schedule created successfully!', severity: 'success', variant: 'alert' }));
      }
      navigate('/qms/audit/schedule');
    } catch (error) {
      dispatch(openSnackbar({ open: true, message: 'Error saving Audit Schedule.', severity: 'error', variant: 'alert' }));
    }
  };

  const handleClear = () => {
    if (isEditing) {
      fetchSchedule();
    } else {
      setFormData({
        scheduleNo: '',
        scheduleDate: getLocalDateString(),
        status: 'OPEN',
        auditType: '',
        auditArea: '',
        auditDate: getLocalDateString(),
        auditMonth: MONTHS[new Date().getMonth()],
        startTime: '09:00 AM',
        endTime: '05:00 PM',
        department: '',
        auditee: '',
        auditeeType: '',
        auditor: '',
        auditorType: '',
        ncrApprovedBy: '',
        ncrApprovedByType: '',
        criteriaMinCount: 0,
        customerName: '',
        contactName: '',
        externalName: '',
        emailToCustomer: '',
        fromEmailToCustomer: '',
        subcontractorName: '',
        supplierName: '',
        coOrdinator: '',
        itemCode: ''
      });
      setCriteriaList([]);
      generateScheduleNo();
    }
    clearErrors();
  };

  const handleRemoveCriteria = (index) => {
    setCriteriaList((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddSelectedCriteria = () => {
    const selected = masterCriteria.filter((c) => selectedCriteriaIds.includes(c.id));
    const newItems = selected.map((c, idx) => ({
      seqNo: c.seqNo || criteriaList.length + idx + 1,
      clause: c.clause || '',
      criteriaDetails: c.criteriaText || '',
      attachmentReq: c.attachmentRequired || 'NO',
      remarks: ''
    }));

    setCriteriaList((prev) => [...prev, ...newItems]);
    setSelectedCriteriaIds([]);
    setCriteriaDialogOpen(false);
  };

  useKeyboardShortcuts({
    'ctrl+s': handleSave,
    'ctrl+n': () => setCriteriaDialogOpen(true),
    'escape': () => navigate('/qms/audit/schedule')
  });

  const availableCriteria = useMemo(() => {
    const selectedTypes = (formData.auditType || '').split(',').filter((t) => t);
    const selectedDept = formData.department;
    return masterCriteria.filter((c) => {
      const criteriaTypes = c.auditType ? c.auditType.split(', ') : [];
      const criteriaDepts = c.department ? c.department.split(', ') : [];
      
      const matchesType = selectedTypes.length === 0 || selectedTypes.some((st) => criteriaTypes.includes(st));
      // SOP: Load criteria based on Audit Type AND Department
      const matchesDept = !selectedDept || criteriaDepts.includes(selectedDept);
      
      const isAlreadyAdded = (Array.isArray(criteriaList) ? criteriaList : []).some((cl) => cl.criteriaDetails === c.criteriaText);
      return matchesType && matchesDept && !isAlreadyAdded;
    });
  }, [masterCriteria, formData.auditType, formData.department, criteriaList]);

  const totalRequiredCount = useMemo(() => {
    const selectedTypes = (formData.auditType || '').split(',').filter((t) => t);
    return selectedTypes.reduce((acc, typeName) => {
      const match = auditTypes.find(t => t.auditType === typeName);
      return acc + (match?.criteriaMinCount || 0);
    }, 0);
  }, [formData.auditType, auditTypes]);

  useEffect(() => {
    if (totalRequiredCount > 0) {
      setFormData(prev => ({ ...prev, criteriaMinCount: totalRequiredCount }));
    }
  }, [totalRequiredCount]);

  return (
    <>
      <MainCard
        title={
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <IconCalendarEvent size={24} />
            <Typography variant="h3">Audit Schedule Creation</Typography>
          </Stack>
        }
        secondary={
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => navigate('/qms/audit/schedule')}
              startIcon={<IconArrowLeft size={20} />}
            >
              Back
            </Button>
            <Tooltip title="Clear all fields">
              <Button variant="contained" sx={btnClear} onClick={handleClear} startIcon={<IconEraser size={20} />}>
                Clear
              </Button>
            </Tooltip>
            <Tooltip title={shortcutTooltip('Save Schedule', 'Ctrl + S')}>
              <Button variant="contained" sx={btnSave} onClick={handleSave} startIcon={<IconCheck size={20} />}>
                Save
              </Button>
            </Tooltip>
          </Stack>
        }
      >
        <Stack spacing={3}>
          {/* Card 1: General Information */}
          <BOSFormSection icon={<IconFileDescription size={20} color={theme.palette.primary.main} />} title="General Information">
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 2.5 }}>
              <BOSTextField label="Schedule No" value={formData.scheduleNo} inputProps={{ readOnly: true }} />
              <BOSTextField
                required
                type="date"
                label="Schedule Date"
                name="scheduleDate"
                value={formData.scheduleDate}
                inputProps={{ readOnly: true }}
                InputLabelProps={{ shrink: true }}
                error={!!errors.scheduleDate}
                helperText={errors.scheduleDate}
              />
              <BOSTextField select label="Status" name="status" value={formData.status} onChange={handleChange}>
                <MenuItem value="OPEN">OPEN</MenuItem>
                <MenuItem value="CLOSED">CLOSED</MenuItem>
                <MenuItem value="CANCELLED">CANCELLED</MenuItem>
              </BOSTextField>

              {/* Dynamic Field: Item Code for Product Audit */}
              {category === 'PRODUCT_AUDIT' && (
                <BOSTextField
                  required
                  label="Item Code"
                  name="itemCode"
                  value={formData.itemCode}
                  onChange={handleChange}
                  error={!!errors.itemCode}
                  helperText={errors.itemCode}
                />
              )}

              {/* Dynamic Field: Supplier Name for Supplier Audit */}
              {category === 'SUPPLIER_AUDIT' && (
                <BOSTextField
                  required
                  label="Supplier Name"
                  name="supplierName"
                  value={formData.supplierName}
                  onChange={handleChange}
                  error={!!errors.supplierName}
                  helperText={errors.supplierName}
                />
              )}

              {/* Dynamic Field: Subcontractor Name for Subcontractor Audit */}
              {category === 'SUBCONTRACTOR_AUDIT' && (
                <BOSTextField
                  required
                  label="Subcontractor Name"
                  name="subcontractorName"
                  value={formData.subcontractorName}
                  onChange={handleChange}
                  error={!!errors.subcontractorName}
                  helperText={errors.subcontractorName}
                />
              )}

              {/* Dynamic Field: Customer Name for Customer Audit */}
              {category === 'CUSTOMER_AUDIT' && (
                <Autocomplete
                  options={customers}
                  getOptionLabel={(option) => option.customerName || ''}
                  value={customers.find((c) => c.customerName === formData.customerName) || null}
                  onChange={(event, newValue) => {
                    setFormData((prev) => ({
                      ...prev,
                      customerName: newValue ? newValue.customerName : '',
                      contactName: ''
                    }));
                  }}
                  renderInput={(params) => (
                    <BOSTextField
                      {...params}
                      required
                      label="Customer Name"
                      error={!!errors.customerName}
                      helperText={errors.customerName}
                    />
                  )}
                />
              )}

              {/* Dynamic Field: External Name for ISO / Supplier Assessment Audit */}
              {(category === 'ISO_AUDIT' || category === 'SUPPLIER_ASSESSMENT') && (
                <BOSTextField
                  required
                  label="External Name"
                  name="externalName"
                  value={formData.externalName}
                  onChange={handleChange}
                  error={!!errors.externalName}
                  helperText={errors.externalName}
                />
              )}

              <BOSTextField
                required
                type="number"
                label="Criteria Min Count"
                name="criteriaMinCount"
                value={formData.criteriaMinCount}
                onChange={handleChange}
                error={!!errors.criteriaMinCount}
                helperText={errors.criteriaMinCount}
                sx={{ display: 'none' }}
              />
            </Box>
          </BOSFormSection>

          {/* Card 2: Audit Specifics */}
          <BOSFormSection icon={<IconCalendarEvent size={20} color={theme.palette.secondary.main} />} title="Audit Specifics">
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 2.5 }}>
              <Autocomplete
                options={departments}
                getOptionLabel={(option) => option.departmentName || ''}
                value={departments.find((d) => d.departmentName === formData.department) || null}
                onChange={(event, newValue) => {
                  setFormData({ ...formData, department: newValue ? newValue.departmentName : '', auditee: '' }); // Reset auditee when dept changes
                }}
                renderInput={(params) => (
                  <BOSTextField
                    {...params}
                    required
                    label="Department"
                    error={!!errors.department}
                    helperText={errors.department}
                  />
                )}
              />
              <Autocomplete
                multiple
                disableCloseOnSelect
                options={auditTypes}
                getOptionLabel={(option) => option.auditType || ''}
                value={(Array.isArray(auditTypes) ? auditTypes : []).filter((t) => (formData.auditType ? formData.auditType.split(',').includes(t.auditType) : false))}
                onChange={(event, newValue) => {
                  const selectedTypeStr = newValue.map((v) => v.auditType).join(',');
                  const combinedAreas = newValue
                    .map((v) => v.auditArea)
                    .filter((a) => a)
                    .flatMap((a) => a.split(', '))
                    .map((a) => a.trim());
                  const uniqueAreas = Array.from(new Set(combinedAreas)).filter((a) => a).join(', ');
                  
                  setFormData((prev) => ({ 
                    ...prev, 
                    auditType: selectedTypeStr,
                    auditArea: uniqueAreas
                  }));
                }}
                renderInput={(params) => (
                  <BOSTextField
                    {...params}
                    required
                    label="Audit Type"
                    error={!!errors.auditType}
                    helperText={errors.auditType}
                  />
                )}
              />
              <BOSTextField
                required
                label={category === 'ISO_AUDIT' || category === 'SUPPLIER_ASSESSMENT' ? 'Audit Zone/Area' : 'Audit Area'}
                name="auditArea"
                value={formData.auditArea}
                onChange={handleChange}
                error={!!errors.auditArea}
                helperText={errors.auditArea}
              />
              
              {/* Dynamic Field: Contact Name */}
              {category === 'CUSTOMER_AUDIT' && (
                <Autocomplete
                  options={contacts.filter(c => (c.groupName === formData.customerName && c.status === 'Active') || c.contactName === formData.contactName)}
                  getOptionLabel={(option) => option.contactName || ''}
                  value={contacts.find(c => c.contactName === formData.contactName) || null}
                  onChange={(event, newValue) => {
                    setFormData((prev) => ({
                      ...prev,
                      contactName: newValue ? newValue.contactName : ''
                    }));
                  }}
                  renderInput={(params) => (
                    <BOSTextField
                      {...params}
                      required
                      label="Contact Name"
                      error={!!errors.contactName}
                      helperText={errors.contactName}
                    />
                  )}
                />
              )}
              {(category === 'ISO_AUDIT' || category === 'SUPPLIER_ASSESSMENT') && (
                <BOSTextField
                  required
                  label="Contact Name"
                  name="contactName"
                  value={formData.contactName}
                  onChange={handleChange}
                  error={!!errors.contactName}
                  helperText={errors.contactName}
                />
              )}

              {/* Dynamic Field: Email to Customer */}
              {category === 'CUSTOMER_AUDIT' && (
                <BOSTextField
                  select
                  label="Email To Customer"
                  name="emailToCustomer"
                  value={formData.emailToCustomer}
                  onChange={handleChange}
                  error={!!errors.emailToCustomer}
                  helperText={errors.emailToCustomer}
                >
                  <MenuItem value="">-Select-</MenuItem>
                  <MenuItem value="YES">YES</MenuItem>
                  <MenuItem value="NO">NO</MenuItem>
                </BOSTextField>
              )}

              {/* Dynamic Field: From Email to Customer */}
              {category === 'CUSTOMER_AUDIT' && formData.emailToCustomer === 'YES' && (
                <BOSTextField
                  required
                  label="From Email"
                  name="fromEmailToCustomer"
                  value={formData.fromEmailToCustomer}
                  onChange={handleChange}
                  error={!!errors.fromEmailToCustomer}
                  helperText={errors.fromEmailToCustomer}
                />
              )}
              <BOSTextField
                required
                type="date"
                label="Audit Date"
                name="auditDate"
                value={formData.auditDate}
                onChange={handleChange}
                inputProps={{ min: getLocalDateString() }}
                InputLabelProps={{ shrink: true }}
                error={!!errors.auditDate}
                helperText={errors.auditDate}
              />
              <BOSTextField
                select
                required
                label="Audit Month"
                name="auditMonth"
                value={formData.auditMonth}
                onChange={handleChange}
                error={!!errors.auditMonth}
                helperText={errors.auditMonth}
              >
                {MONTHS.map((m) => (
                  <MenuItem key={m} value={m}>{m}</MenuItem>
                ))}
              </BOSTextField>
              <BOSTextField
                select
                label="Start Time"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
              >
                {START_TIME_OPTIONS.map((t) => (
                  <MenuItem key={t} value={t}>{t}</MenuItem>
                ))}
              </BOSTextField>
              <BOSTextField
                select
                label="End Time"
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
              >
                {END_TIME_OPTIONS.map((t) => (
                  <MenuItem key={t} value={t}>{t}</MenuItem>
                ))}
              </BOSTextField>

              {/* Dynamic Field: Co-Ordinator Select */}
              {(category === 'CUSTOMER_AUDIT' || category === 'ISO_AUDIT' || category === 'SUPPLIER_ASSESSMENT') && (
                <BOSTextField
                  select
                  required
                  label="Co-Ordinator"
                  name="coOrdinator"
                  value={formData.coOrdinator}
                  onChange={handleChange}
                  error={!!errors.coOrdinator}
                  helperText={errors.coOrdinator}
                >
                  <MenuItem value="">-Select-</MenuItem>
                  {employees.filter(emp => {
                    if (emp.status !== 'Active') return false;
                    if (!formData.department) return false;
                    const empDept = departments.find(d => String(d.id) === String(emp.departmentId));
                    return empDept?.departmentName === formData.department;
                  }).map(emp => {
                    const fName = emp.firstName || '';
                    const lName = emp.lastName || '';
                    const empName = emp.employeeName || '';
                    let name = '';
                    if (fName && lName) {
                      name = `${fName} ${lName}`.trim();
                    } else if (empName && lName && !empName.toLowerCase().includes(lName.toLowerCase())) {
                      name = `${empName} ${lName}`.trim();
                    } else if (empName) {
                      name = empName;
                    } else {
                      name = `${fName} ${lName}`.trim();
                    }
                    const opt = `${name} - ${emp.empCode || emp.employeeCode || emp.id}`;
                    return <MenuItem key={opt} value={opt}>{opt}</MenuItem>;
                  })}
                </BOSTextField>
              )}
            </Box>
          </BOSFormSection>

          {/* Card 3: Personnel Information */}
          <BOSFormSection icon={<IconUsers size={20} color={theme.palette.warning.main} />} title="Personnel Information">
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: `repeat(${(category === 'CUSTOMER_AUDIT' || category === 'ISO_AUDIT' || category === 'SUPPLIER_ASSESSMENT') ? 2 : 3}, 1fr)` }, gap: 3 }}>
              {[
                { role: 'AUDITEE', field: 'auditee', typeField: 'auditeeType', label: 'Auditee' },
                { role: 'AUDITOR', field: 'auditor', typeField: 'auditorType', label: 'Auditor' },
                { role: 'NCR APPROVED BY', field: 'ncrApprovedBy', typeField: 'ncrApprovedByType', label: 'NCR Approved By' }
              ].filter(person => {
                if (person.role === 'AUDITOR') {
                  return !(category === 'CUSTOMER_AUDIT' || category === 'ISO_AUDIT' || category === 'SUPPLIER_ASSESSMENT');
                }
                return true;
              }).map((person) => {
                const value = formData[person.field];
                const name = value ? value.split(' - ')[0] : '-';
                const code = value ? value.split(' - ')[1] || '-' : '-';

                const filteredEmployees = employees.filter(emp => {
                  if (emp.status !== 'Active') return false;

                  if (person.field === 'auditor') return emp.isAuditor === 'YES';
                  if (person.field === 'auditee') {
                    if (!formData.department) return false;
                    const empDept = departments.find(d => String(d.id) === String(emp.departmentId));
                    return emp.isAuditee === 'YES' && empDept?.departmentName === formData.department;
                  }
                  if (person.field === 'ncrApprovedBy') return emp.isNcrApprover === 'YES';
                  return true;
                });

                const getEmpLabel = (emp) => {
                  const fName = emp.firstName || '';
                  const lName = emp.lastName || '';
                  const empName = emp.employeeName || '';
                  
                  let name = '';
                  if (fName && lName) {
                    name = `${fName} ${lName}`.trim();
                  } else if (empName && lName && !empName.toLowerCase().includes(lName.toLowerCase())) {
                    name = `${empName} ${lName}`.trim();
                  } else if (empName) {
                    name = empName;
                  } else {
                    name = `${fName} ${lName}`.trim();
                  }
                  return `${name} - ${emp.empCode || emp.employeeCode || emp.id}`;
                };

                const selectedEmp = filteredEmployees.find(emp => {
                  const label = getEmpLabel(emp);
                  if (label === value) return true;
                  if (value && value.includes(' - ')) {
                    const code = value.split(' - ')[1];
                    return String(emp.empCode || emp.employeeCode || emp.id) === String(code);
                  }
                  return false;
                });
                
                const empDeptName = selectedEmp ? (departments.find(d => String(d.id) === String(selectedEmp.departmentId))?.departmentName || '-') : '-';
                
                // Resolution for Level (using levels or designations lookup)
                let empLevel = '-';
                if (selectedEmp) {
                  const levelMatch = levels.find(l => String(l.rowId || l.id) === String(selectedEmp.empLevelId));
                  const desigMatch = designations.find(d => String(d.id) === String(selectedEmp.designationId));
                  empLevel = levelMatch?.level || desigMatch?.designationName || '-';
                }

                const employeeOptions = filteredEmployees.map(emp => getEmpLabel(emp));

                return (
                  <Card key={person.role} sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: '16px',
                    boxShadow: 2,
                    bgcolor: isDark ? 'background.default' : '#fff',
                    position: 'relative',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%'
                  }}>
                    <Box sx={{ height: 60, bgcolor: isDark ? 'primary.dark' : 'primary.light', width: '100%', position: 'absolute', top: 0, left: 0, opacity: isDark ? 0.3 : 0.6 }} />
                    <CardContent sx={{ p: 3, pt: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 1, flexGrow: 1 }}>
                      <Avatar
                        src={selectedEmp ? getPhotoUrl(selectedEmp.employeePhotoUpload) : null}
                        sx={{
                          width: 100, height: 100, borderRadius: '50%', bgcolor: isDark ? '#1c2128' : '#fff', border: '4px solid',
                          borderColor: isDark ? 'background.default' : '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center',
                          color: 'primary.main', boxShadow: '0 4px 16px rgba(0,0,0,0.1)', mb: 2
                        }}
                      >
                        {!selectedEmp || !selectedEmp.employeePhotoUpload ? <IconUsers size={48} /> : null}
                      </Avatar>
                      <Typography variant="overline" color="primary.main" sx={{ fontWeight: 800, mb: 0.5, fontSize: '0.8rem' }}>{person.role}</Typography>
                      <Typography variant="h6" fontWeight={700} color="text.primary" noWrap sx={{ width: '100%', textAlign: 'center', mb: 0.5 }}>{name !== '-' ? name : 'Not Selected'}</Typography>
                      
                      {/* SOP: Display Dept and Level in Profile Card */}
                      <Stack spacing={0.5} alignItems="center" sx={{ mb: 2, width: '100%' }}>
                        <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>Dept: {empDeptName}</Typography>
                        <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>Level: {empLevel}</Typography>
                      </Stack>

                      <Box sx={{ bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'grey.100', px: 2.5, py: 0.5, borderRadius: '16px', mb: 3 }}>
                        <Typography variant="body2" color="text.secondary" fontWeight={600} noWrap>{code !== '-' ? code : 'No Code'}</Typography>
                      </Box>
                      <Stack spacing={2} sx={{ width: '100%' }}>
                        <BOSTextField
                          select
                          required
                          label={`Select ${person.label}`}
                          name={person.field}
                          value={formData[person.field]}
                          onChange={handleChange}
                          error={!!errors[person.field]}
                          helperText={errors[person.field]}
                        >
                          <MenuItem value="">-Select-</MenuItem>
                          {employeeOptions.map((opt) => (
                            <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                          ))}
                        </BOSTextField>
                      </Stack>
                    </CardContent>
                  </Card>
                );
              })}
            </Box>
          </BOSFormSection>

          {/* Card 4: Audit Criteria Checklist */}
          <BOSFormSection icon={<IconListCheck size={20} color={theme.palette.success.main} />} title="Audit Criteria Checklist">
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box />
              <Tooltip title={category === 'CUSTOMER_AUDIT' ? 'Criteria are read-only for Customer Audits' : shortcutTooltip('Add Criteria', 'Ctrl + N')}>
                <span>
                  <Button variant="contained" size="small" onClick={() => setCriteriaDialogOpen(true)} disabled={category === 'CUSTOMER_AUDIT'} startIcon={<IconPlus size={16} />} sx={{ borderRadius: '8px' }}>
                    Add Criteria
                  </Button>
                </span>
              </Tooltip>
            </Box>
            <BOSDataTable
              columns={(category === 'CUSTOMER_AUDIT' || category === 'ISO_AUDIT' || category === 'SUPPLIER_ASSESSMENT') ? [
                { id: 'clause', label: 'Clause', minWidth: 100 },
                { id: 'criteriaDetails', label: 'Agenda', minWidth: 300 },
                { id: 'attachmentReq', label: 'Attachment Req', minWidth: 120 },
                { id: 'remarks', label: 'Remarks', minWidth: 150 }
              ] : [
                { id: 'index', label: '#', minWidth: 50 },
                { id: 'seqNo', label: 'Seq No', minWidth: 80 },
                { id: 'clause', label: 'Clause', minWidth: 100 },
                { id: 'criteriaDetails', label: 'Criteria Details', minWidth: 300 },
                { id: 'attachmentReq', label: 'Attachment Req', minWidth: 120 },
                { id: 'remarks', label: 'Remarks', minWidth: 150 }
              ]}
              rows={criteriaList}
              page={0}
              size={999}
              totalCount={criteriaList.length}
              disableFilters={true}
              onPageChange={() => {}}
              onSizeChange={() => {}}
              onDeleteRow={(row) => handleRemoveCriteria(criteriaList.indexOf(row))}
              showActions={category !== 'CUSTOMER_AUDIT'}
              renderCell={(col, row, idx) => {
                if (col.id === 'index') return idx + 1;
                if (col.id === 'attachmentReq') return <Chip label={row.attachmentReq} size="small" sx={getStatusChipSx(row.attachmentReq === 'YES' ? 'ACTIVE' : 'INACTIVE')} />;
                return row[col.id] || '-';
              }}
            />
          </BOSFormSection>
        </Stack>
      </MainCard>

      {/* Criteria Selection Dialog */}
      <BOSFormDialog
        open={criteriaDialogOpen}
        onClose={() => setCriteriaDialogOpen(false)}
        onSave={handleAddSelectedCriteria}
        onClear={() => setSelectedCriteriaIds([])}
        title="Select Audit Criteria"
        maxWidth="lg"
      >
        <Paper sx={{ p: 0, height: 500, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <BOSDataTable
            columns={(category === 'CUSTOMER_AUDIT' || category === 'ISO_AUDIT' || category === 'SUPPLIER_ASSESSMENT') ? [
              { id: 'select', label: '', minWidth: 50 },
              { id: 'clause', label: 'Clause', minWidth: 100 },
              { id: 'criteriaText', label: 'Agenda', minWidth: 400 },
              { id: 'attachmentRequired', label: 'Attachment Req', minWidth: 120 }
            ] : [
              { id: 'select', label: '', minWidth: 50 },
              { id: 'seqNo', label: 'Seq No', minWidth: 80 },
              { id: 'clause', label: 'Clause', minWidth: 100 },
              { id: 'criteriaText', label: 'Criteria Details', minWidth: 400 },
              { id: 'attachmentRequired', label: 'Attachment Req', minWidth: 120 }
            ]}
            rows={availableCriteria}
            page={0}
            size={availableCriteria.length}
            onPageChange={() => {}}
            onSizeChange={() => {}}
            showActions={false}
            renderCell={(col, row) => {
              if (col.id === 'select') {
                return (
                  <Checkbox
                    size="small"
                    checked={selectedCriteriaIds.includes(row.id)}
                    onChange={(e) => {
                      if (e.target.checked) setSelectedCriteriaIds([...selectedCriteriaIds, row.id]);
                      else setSelectedCriteriaIds(selectedCriteriaIds.filter(id => id !== row.id));
                    }}
                  />
                );
              }
              if (col.id === 'attachmentRequired') return <Chip label={row.attachmentRequired} size="small" sx={getStatusChipSx(row.attachmentRequired === 'YES' ? 'ACTIVE' : 'INACTIVE')} />;
              return row[col.id] || '-';
            }}
          />
        </Paper>
      </BOSFormDialog>
    </>
  );
}
