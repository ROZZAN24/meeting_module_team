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
  Tooltip,
  Paper,
  Chip
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
  BOSDataTable,
  btnSave,
  btnClear,
  getStatusChipSx
} from 'ui-component/bos';
import useBOSValidation from 'hooks/useBOSValidation';
import useKeyboardShortcuts, { shortcutTooltip } from 'hooks/useKeyboardShortcuts';
import { useLookups } from 'hooks/useLookups';
import { API_PATHS } from 'utils/api-constants';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

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
  const { errors, validate, clearErrors } = useBOSValidation();

  const [formData, setFormData] = useState({
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
    ncrApprovedByType: ''
  });

  const [criteriaList, setCriteriaList] = useState([]);
  const { 
    auditTypes = [], 
    departments = [], 
    auditCriterias: masterCriteria = [], 
    employees = [] 
  } = useLookups(['AUDIT_TYPE', 'DEPARTMENTS', 'AUDIT_CRITERIA', 'EMPLOYEES']);

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
        ncrApprovedByType: data.ncrApprovedByType || ''
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

    const startNum = parseInt(formData.startTime.replace(':', ''));
    const endNum = parseInt(formData.endTime.replace(':', ''));
    if (endNum <= startNum) {
      dispatch(openSnackbar({ open: true, message: 'End Time must be greater than Start Time.', severity: 'error', variant: 'alert' }));
      return;
    }

    if (criteriaList.length === 0) {
      dispatch(openSnackbar({ open: true, message: 'At least one criteria must be added.', severity: 'error', variant: 'alert' }));
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
        ncrApprovedByType: ''
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
    const selectedTypes = formData.auditType.split(',').filter((t) => t);
    return masterCriteria.filter((c) => {
      const criteriaTypes = c.auditType ? c.auditType.split(', ') : [];
      const matchesType = selectedTypes.length === 0 || selectedTypes.some((st) => criteriaTypes.includes(st));
      const isAlreadyAdded = (Array.isArray(criteriaList) ? criteriaList : []).some((cl) => cl.criteriaDetails === c.criteriaText);
      return matchesType && !isAlreadyAdded;
    });
  }, [masterCriteria, formData.auditType, criteriaList]);

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
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' }, gap: 2.5 }}>
              <BOSTextField label="Schedule No" value={formData.scheduleNo} inputProps={{ readOnly: true }} />
              <BOSTextField
                required
                label="Schedule Date"
                type="date"
                name="scheduleDate"
                value={formData.scheduleDate}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                error={!!errors.scheduleDate}
                helperText={errors.scheduleDate}
              />
              <BOSTextField select label="Status" name="status" value={formData.status} onChange={handleChange}>
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
            </Box>
          </BOSFormSection>

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
                  setFormData({ ...formData, auditType: newValue.map((v) => v.auditType).join(',') });
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
                label="Audit Area"
                name="auditArea"
                value={formData.auditArea}
                onChange={handleChange}
                error={!!errors.auditArea}
                helperText={errors.auditArea}
              />
              <BOSTextField
                required
                label="Audit Date"
                type="date"
                name="auditDate"
                value={formData.auditDate}
                onChange={handleChange}
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
              <Box sx={{ display: 'flex', gap: 1 }}>
                <BOSTextField
                  select
                  label="Start Hour"
                  value={formData.startTime.split(':')[0]}
                  onChange={(e) => setFormData({ ...formData, startTime: `${e.target.value}:${formData.startTime.split(':')[1]}` })}
                >
                  {Array.from({ length: 24 }).map((_, i) => (
                    <MenuItem key={i} value={i.toString().padStart(2, '0')}>{i.toString().padStart(2, '0')}</MenuItem>
                  ))}
                </BOSTextField>
                <BOSTextField
                  select
                  label="Start Min"
                  value={formData.startTime.split(':')[1]}
                  onChange={(e) => setFormData({ ...formData, startTime: `${formData.startTime.split(':')[0]}:${e.target.value}` })}
                >
                  {Array.from({ length: 60 }).map((_, i) => (
                    <MenuItem key={i} value={i.toString().padStart(2, '0')}>{i.toString().padStart(2, '0')}</MenuItem>
                  ))}
                </BOSTextField>
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <BOSTextField
                  select
                  label="End Hour"
                  value={formData.endTime.split(':')[0]}
                  onChange={(e) => setFormData({ ...formData, endTime: `${e.target.value}:${formData.endTime.split(':')[1]}` })}
                >
                  {Array.from({ length: 24 }).map((_, i) => (
                    <MenuItem key={i} value={i.toString().padStart(2, '0')}>{i.toString().padStart(2, '0')}</MenuItem>
                  ))}
                </BOSTextField>
                <BOSTextField
                  select
                  label="End Min"
                  value={formData.endTime.split(':')[1]}
                  onChange={(e) => setFormData({ ...formData, endTime: `${formData.endTime.split(':')[0]}:${e.target.value}` })}
                >
                  {Array.from({ length: 60 }).map((_, i) => (
                    <MenuItem key={i} value={i.toString().padStart(2, '0')}>{i.toString().padStart(2, '0')}</MenuItem>
                  ))}
                </BOSTextField>
              </Box>
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
                  if (person.field === 'auditor') return emp.isAuditor === 'YES';
                  if (person.field === 'auditee') {
                    if (!formData.department) return false;
                    const empDept = departments.find(d => String(d.id) === String(emp.departmentId));
                    return emp.isAuditee === 'YES' && empDept?.departmentName === formData.department;
                  }
                  if (person.field === 'ncrApprovedBy') return emp.isNcrApprover === 'YES';
                  return true;
                });

                const employeeOptions = filteredEmployees.map(emp => `${emp.employeeName || (emp.firstName + ' ' + emp.lastName)} - ${emp.empCode || emp.employeeCode}`);

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
                      <Box sx={{
                        width: 100, height: 100, borderRadius: '50%', bgcolor: isDark ? '#1c2128' : '#fff', border: '4px solid',
                        borderColor: isDark ? 'background.default' : '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center',
                        color: 'primary.main', boxShadow: '0 4px 16px rgba(0,0,0,0.1)', mb: 2
                      }}>
                        <IconUsers size={48} />
                      </Box>
                      <Typography variant="overline" color="primary.main" sx={{ fontWeight: 800, mb: 0.5, fontSize: '0.8rem' }}>{person.role}</Typography>
                      <Typography variant="h6" fontWeight={700} color="text.primary" noWrap sx={{ width: '100%', textAlign: 'center', mb: 1 }}>{name !== '-' ? name : 'Not Selected'}</Typography>
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
                        
                        <BOSTextField
                          select
                          required
                          label={`${person.label} Type`}
                          name={person.typeField}
                          value={formData[person.typeField]}
                          onChange={handleChange}
                          error={!!errors[person.typeField]}
                          helperText={errors[person.typeField]}
                        >
                          <MenuItem value="">-Select Type-</MenuItem>
                          {auditTypes.map((type) => (
                            <MenuItem key={type.auditType} value={type.auditType}>{type.auditType}</MenuItem>
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
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <Tooltip title={shortcutTooltip('Add Criteria', 'Ctrl + N')}>
                <Button variant="contained" size="small" onClick={() => setCriteriaDialogOpen(true)} startIcon={<IconPlus size={16} />} sx={{ borderRadius: '8px' }}>
                  Add Criteria
                </Button>
              </Tooltip>
            </Box>
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
              onDeleteRow={(row) => handleRemoveCriteria(criteriaList.indexOf(row))}
              showActions={true}
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
