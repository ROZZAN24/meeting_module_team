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
  IconListCheck
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
import usePagePermissions, { PAGE_CODES } from 'hooks/usePagePermissions';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const TIME_OPTIONS = Array.from({ length: 96 }, (_, i) => {
  const hours = Math.floor(i / 4);
  const minutes = (i % 4) * 15;
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${ampm}`;
});

const VALIDATION_RULES = [
  { field: 'auditType', label: 'Audit Type', required: true },
  { field: 'auditArea', label: 'Audit Area', required: true },
  { field: 'auditDate', label: 'Audit Date', required: true },
  { field: 'department', label: 'Department', required: true },
  { field: 'auditee', label: 'Auditee', required: true },
  { field: 'auditor', label: 'Auditor', required: true }
];

export default function AddAuditSchedule() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const theme = useTheme();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const isEditing = Boolean(id);
  const perms = usePagePermissions(PAGE_CODES.QMS_AUDIT_SCHEDULE);
  const { errors, validate, clearErrors } = useBOSValidation();

  const [formData, setFormData] = useState({
    scheduleNo: '',
    scheduleDate: new Date().toISOString().split('T')[0],
    status: 'OPEN',
    auditType: '',
    auditArea: '',
    auditDate: new Date().toISOString().split('T')[0],
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
    criteriaMinCount: 0
  });

  const [criteriaList, setCriteriaList] = useState([]);
  const { 
    auditTypes = [], 
    departments = [], 
    auditCriterias: masterCriteria = [], 
    employees = [],
    levels = [],
    designations = []
  } = useLookups(['AUDIT_TYPE', 'DEPARTMENTS', 'AUDIT_CRITERIA', 'EMPLOYEES', 'LEVELS', 'DESIGNATIONS']);

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
      setFormData({
        scheduleNo: data.scheduleNo || '',
        scheduleDate: data.scheduleDate ? data.scheduleDate.split('T')[0] : '',
        status: data.status || 'OPEN',
        auditType: data.auditType || '',
        auditArea: data.auditArea || '',
        auditDate: data.auditDate ? data.auditDate.split('T')[0] : '',
        auditMonth: data.auditMonth || '',
        startTime: data.startTime || '09:00',
        endTime: data.endTime || '17:00',
        department: data.department || '',
        auditee: data.auditee || '',
        auditeeType: data.auditeeType || '',
        auditor: data.auditor || '',
        auditorType: data.auditorType || '',
        ncrApprovedBy: data.ncrApprovedBy || '',
        ncrApprovedByType: data.ncrApprovedByType || '',
        criteriaMinCount: data.criteriaMinCount || 0
      });
      setCriteriaList(data.criteriaList || []);
    } catch (error) {
      console.error('Failed to fetch schedule:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!validate(formData, VALIDATION_RULES)) return;

    const convertTo24h = (time12h) => {
      const [time, modifier] = time12h.split(' ');
      let [hours, minutes] = time.split(':');
      if (hours === '12') hours = '00';
      if (modifier === 'PM') hours = parseInt(hours, 10) + 12;
      return parseInt(`${hours}${minutes}`, 10);
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
      const payload = { ...formData, criteriaList };
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
        scheduleDate: new Date().toISOString().split('T')[0],
        status: 'OPEN',
        auditType: '',
        auditArea: '',
        auditDate: new Date().toISOString().split('T')[0],
        auditMonth: MONTHS[new Date().getMonth()],
        startTime: '09:00',
        endTime: '17:00',
        department: '',
        auditee: '',
        auditeeType: '',
        auditor: '',
        auditorType: '',
        ncrApprovedBy: '',
        ncrApprovedByType: '',
        criteriaMinCount: 0
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
            {perms.write ? (
              <>
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
              </>
            ) : (
              <Button variant="outlined" color="primary" onClick={() => navigate('/qms/audit/schedule')}>
                Back
              </Button>
            )}
          </Stack>
        }
      >
        <Stack spacing={3}>
          {/* Card 1: General Information */}
          <BOSFormSection icon={<IconFileDescription size={20} color={theme.palette.primary.main} />} title="General Information">
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' }, gap: 2.5 }}>
              <BOSTextField label="Schedule No" value={formData.scheduleNo} inputProps={{ readOnly: true }} />
              <BOSDatePicker
                required
                label="Schedule Date"
                name="scheduleDate"
                value={formData.scheduleDate}
                onChange={handleChange}
                error={!!errors.scheduleDate}
                helperText={errors.scheduleDate}
                disabled={!perms.write}
              />
              <BOSTextField select label="Status" name="status" value={formData.status} onChange={handleChange} disabled={!perms.write}>
                <MenuItem value="OPEN">OPEN</MenuItem>
                <MenuItem value="CLOSED">CLOSED</MenuItem>
                <MenuItem value="CANCELLED">CANCELLED</MenuItem>
              </BOSTextField>
              <Autocomplete
                options={departments}
                getOptionLabel={(option) => option.departmentName || ''}
                value={departments.find((d) => d.departmentName === formData.department) || null}
                onChange={(event, newValue) => {
                  setFormData({ ...formData, department: newValue ? newValue.departmentName : '', auditee: '' }); // Reset auditee when dept changes
                }}
                disabled={!perms.write}
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
              <BOSTextField
                label="Item Code"
                name="itemCode"
                value={formData.itemCode}
                onChange={handleChange}
                placeholder="Optional"
                disabled={!perms.write}
              />
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

          {/* SOP: Dynamic Sections (Supplier/Customer/External) */}
          {(formData.auditType || '').toUpperCase().includes('SUPPLIER') && (
            <BOSFormSection title="Supplier Information">
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2.5 }}>
                <BOSTextField label="Supplier Name" name="supplierName" onChange={handleChange} disabled={!perms.write} />
                <BOSTextField label="Supplier Code" name="supplierCode" onChange={handleChange} disabled={!perms.write} />
              </Box>
            </BOSFormSection>
          )}

          {(formData.auditType || '').toUpperCase().includes('CUSTOMER') && (
            <BOSFormSection title="Customer Information">
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2.5 }}>
                <BOSTextField label="Customer Name" name="customerName" onChange={handleChange} disabled={!perms.write} />
                <BOSTextField label="Customer Area" name="customerArea" onChange={handleChange} disabled={!perms.write} />
              </Box>
            </BOSFormSection>
          )}

          {/* Card 2: Audit Specifics */}
          <BOSFormSection icon={<IconCalendarEvent size={20} color={theme.palette.secondary.main} />} title="Audit Specifics">
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 2.5 }}>
              <Autocomplete
                multiple
                disableCloseOnSelect
                options={auditTypes}
                getOptionLabel={(option) => option.auditType || ''}
                value={(Array.isArray(auditTypes) ? auditTypes : []).filter((t) => (formData.auditType ? formData.auditType.split(',').includes(t.auditType) : false))}
                onChange={(event, newValue) => {
                  const selectedTypeStr = newValue.map((v) => v.auditType).join(',');
                  setFormData({ ...formData, auditType: selectedTypeStr });
                }}
                disabled={!perms.write}
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
                label="Audit Area"
                name="auditArea"
                value={formData.auditArea}
                onChange={handleChange}
                error={!!errors.auditArea}
                helperText={errors.auditArea}
                disabled={!perms.write}
              />
              <BOSDatePicker
                required
                label="Audit Date"
                name="auditDate"
                value={formData.auditDate}
                onChange={handleChange}
                error={!!errors.auditDate}
                helperText={errors.auditDate}
                disabled={!perms.write}
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
                disabled={!perms.write}
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
                disabled={!perms.write}
              >
                {TIME_OPTIONS.map((t) => (
                  <MenuItem key={t} value={t}>{t}</MenuItem>
                ))}
              </BOSTextField>
              <BOSTextField
                select
                label="End Time"
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
                disabled={!perms.write}
              >
                {TIME_OPTIONS.map((t) => (
                  <MenuItem key={t} value={t}>{t}</MenuItem>
                ))}
              </BOSTextField>
            </Box>
          </BOSFormSection>

          {/* Card 3: Personnel Information */}
          <BOSFormSection icon={<IconUsers size={20} color={theme.palette.warning.main} />} title="Personnel Information">
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 3 }}>
              {[
                { role: 'AUDITEE', field: 'auditee', typeField: 'auditeeType', label: 'Auditee' },
                { role: 'AUDITOR', field: 'auditor', typeField: 'auditorType', label: 'Auditor' },
                { role: 'NCR APPROVED BY', field: 'ncrApprovedBy', typeField: 'ncrApprovedByType', label: 'NCR Approved By' }
              ].map((person) => {
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
                  const fullName = emp.employeeName || `${emp.firstName || ''} ${emp.lastName || ''}`.trim();
                  return `${fullName} - ${emp.empCode || emp.employeeCode || emp.id}`;
                };

                const selectedEmp = filteredEmployees.find(emp => getEmpLabel(emp) === value);
                
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
                           disabled={!perms.write}
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
             {perms.write && (
               <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                 <Box />
                 <Tooltip title={shortcutTooltip('Add Criteria', 'Ctrl + N')}>
                   <Button variant="contained" size="small" onClick={() => setCriteriaDialogOpen(true)} startIcon={<IconPlus size={16} />} sx={{ borderRadius: '8px' }}>
                     Add Criteria
                   </Button>
                 </Tooltip>
               </Box>
             )}
             <BOSDataTable
               columns={[
                 { id: 'index', label: '#', minWidth: 50 },
                 { id: 'seqNo', label: 'Seq No', minWidth: 80 },
                 { id: 'clause', label: 'Clause', minWidth: 100 },
                 { id: 'criteriaDetails', label: 'Criteria Details', minWidth: 300 },
                 { id: 'attachmentReq', label: 'Attachment Req', minWidth: 120 },
                 { id: 'remarks', label: 'Remarks', minWidth: 150 }
               ]}
               rows={criteriaList}
               page={0}
               size={criteriaList.length || 10}
               onPageChange={() => {}}
               onSizeChange={() => {}}
               onDeleteRow={perms.write ? (row) => handleRemoveCriteria(criteriaList.indexOf(row)) : undefined}
               showActions={perms.write}
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
            columns={[
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
