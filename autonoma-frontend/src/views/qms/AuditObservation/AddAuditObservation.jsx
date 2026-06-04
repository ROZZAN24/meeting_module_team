import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Typography,
  Box,
  Button,
  MenuItem,
  Stack,
  useTheme,
  Tooltip,
  Chip,
  Card,
  CardContent,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  IconCheck,
  IconEraser,
  IconFileText,
  IconCalendarEvent,
  IconUsers,
  IconListCheck,
  IconReportAnalytics,
  IconArrowLeft,
  IconPlus,
} from '@tabler/icons-react';
import axios from 'utils/axios';
import { useDispatch } from 'react-redux';
import { openSnackbar } from 'store/slices/snackbar';
import MainCard from 'ui-component/cards/MainCard';
import {
  BOSFormSection,
  BOSTextField, BOSAutocomplete,
  BOSDataTable,
  BOSFileUpload,
  BOSDatePicker,
  BOSTimePicker,
  btnSave,
  btnCancel,
  btnClear,
  getStatusChipSx
} from 'ui-component/bos';
import useBOSValidation from 'hooks/useBOSValidation';
import useKeyboardShortcuts, { shortcutTooltip } from 'hooks/useKeyboardShortcuts';
import { format } from 'date-fns';
import { API_PATHS } from 'utils/api-constants';
import { useLookups } from 'hooks/useLookups';
import { autoUploadFile } from 'utils/upload-helper';
import mammoth from 'mammoth';
import * as XLSX from 'xlsx';
import { IconX, IconDownload, IconDeviceFloppy } from '@tabler/icons-react';
import usePagePermissions, { PAGE_CODES } from 'hooks/usePagePermissions';
import useAuth from 'hooks/useAuth';

const VALIDATION_RULES = [
  { field: 'observationDate', label: 'Observation Date', required: true },
  { field: 'auditScheduleNo', label: 'Schedule No', required: true }
];

const OBS_STATUSES = ['COMPLIANCE', 'OFI', 'NC', 'NO ENTRY'];

const formatTime12 = (hour, minute) => {
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')} ${ampm}`;
};

const TIME_OPTIONS = [
  '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM',
  '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM',
  '04:30 PM', '05:00 PM', '05:30 PM', '06:00 PM', '06:30 PM', '07:00 PM', '07:30 PM',
  '08:00 PM', '08:30 PM', '09:00 PM'
];

const convertToMinutes = (timeStr) => {
  if (!timeStr) return 0;
  const parts = timeStr.trim().split(' ');
  if (parts.length < 2) return 0;
  const timeParts = parts[0].split(':');
  let hours = parseInt(timeParts[0], 10);
  const minutes = parseInt(timeParts[1], 10) || 0;
  const ampm = parts[1].toUpperCase();

  if (ampm === 'PM' && hours !== 12) {
    hours += 12;
  } else if (ampm === 'AM' && hours === 12) {
    hours = 0;
  }
  return hours * 60 + minutes;
};

const isTimeBefore = (t1, t2) => {
  if (!t1 || !t2) return false;
  return convertToMinutes(t1) < convertToMinutes(t2);
};

export default function AddAuditObservation() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const theme = useTheme();
  const { user } = useAuth();
  const isEditing = Boolean(id);
  const perms = usePagePermissions(PAGE_CODES.QMS_AUDIT_OBSERVATION);
  const { errors, validate, clearErrors } = useBOSValidation();
  const [showTableErrors, setShowTableErrors] = useState(false);

  const [formData, setFormData] = useState({
    observationNo: '',
    observationDate: new Date().toISOString().split('T')[0],
    auditScheduleNo: '',
    auditType: '',
    auditArea: '',
    departmentName: '',
    auditee: '',
    auditor: '',
    ncrApprovedBy: '',
    status: 'PENDING',
    auditScore: 0,
    ofiCount: 0,
    complianceCount: 0,
    ncrCount: 0
  });

  const [details, setDetails] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [editingRowId, setEditingRowId] = useState(null);
  const { auditSchedules: schedules = [] } = useLookups(['AUDIT_SCHEDULE']);

  const activeScheduleStartTime = useMemo(() => {
    if (!formData.auditScheduleNo || !schedules.length) return '';
    const sch = schedules.find(s => s.scheduleNo === formData.auditScheduleNo);
    return sch?.startTime || '';
  }, [formData.auditScheduleNo, schedules]);

  const [existingObsScheduleNos, setExistingObsScheduleNos] = useState([]);

  useEffect(() => {
    const fetchExistingObservations = async () => {
      try {
        const res = await axios.get(API_PATHS.QMS.AUDIT_OBSERVATION);
        const obsList = res.data || [];
        const nos = obsList.map(o => o.auditScheduleNo).filter(Boolean);
        setExistingObsScheduleNos(nos);
      } catch (err) {
        console.error('Failed to fetch existing observations:', err);
      }
    };
    if (!isEditing) {
      fetchExistingObservations();
    }
  }, [isEditing]);

  const availableSchedules = useMemo(() => {
    if (isEditing) {
      return schedules;
    }
    return schedules.filter(s => !existingObsScheduleNos.includes(s.scheduleNo));
  }, [schedules, existingObsScheduleNos, isEditing]);

  const validDetailsCount = useMemo(() => {
    return details.filter(d => d.observationStatus && d.observationStatus !== 'NO ENTRY' && d.observationStatus !== 'NO_ENTRY').length;
  }, [details]);

  const [isAuditorEligible, setIsAuditorEligible] = useState(false);

  useEffect(() => {
    const checkAuditorEligibility = async () => {
      if (!user) return;
      try {
        const res = await axios.get('/api/master/hr/employees/filter/active');
        const employees = res.data || [];
        
        const userEmpCode = (user.employeeCode || user.empCode || '').trim().toLowerCase();
        const userUserId = (user.id || '').trim().toLowerCase();
        const userName = (user.name || '').trim().toLowerCase();
        
        const emp = employees.find(e => {
          const empCode = (e.employeeCode || '').trim().toLowerCase();
          const empName = (e.employeeName || '').trim().toLowerCase();
          
          if (userEmpCode && empCode && userEmpCode === empCode) return true;
          if (userUserId && empCode && userUserId === empCode) return true;
          if (userName && empName && userName === empName) return true;
          return false;
        });
        
        if (emp && emp.isAuditor === 'YES') {
          setIsAuditorEligible(true);
        }
      } catch (err) {
        console.error('Failed to check auditor eligibility:', err);
      }
    };
    
    checkAuditorEligibility();
  }, [user]);

  const isAuditorUser = useMemo(() => {
    if (!user) return false;
    if (!formData.auditor) return false;
    
    const auditorStr = formData.auditor.trim().toLowerCase();
    const userEmpCode = (user.employeeCode || user.empCode || '').trim().toLowerCase();
    const userUserId = (user.id || '').trim().toLowerCase();
    const userName = (user.name || '').trim().toLowerCase();

    // Check with ' - ' splitting (auditor usually stored as "Name - Code" or similar)
    if (auditorStr.includes(' - ')) {
      const parts = auditorStr.split(' - ');
      const namePart = parts[0]?.trim();
      const codePart = parts[1]?.trim();

      if (userEmpCode && codePart && userEmpCode === codePart) return true;
      if (userUserId && codePart && userUserId === codePart) return true;
      if (userName && namePart && userName === namePart) return true;
    } else {
      // Direct comparison if no delimiter
      if (userEmpCode && userEmpCode === auditorStr) return true;
      if (userUserId && userUserId === auditorStr) return true;
      if (userName && userName === auditorStr) return true;
    }
    
    return false;
  }, [user, formData.auditor]);

  const isRowAuditor = useCallback((row) => {
    if (!formData.auditor || !row) return false;
    const auditorStr = formData.auditor.trim().toLowerCase();
    const rowEmpCode = (row.employeeCode || '').trim().toLowerCase();
    const rowName = (row.name || '').trim().toLowerCase();
    
    if (auditorStr.includes(' - ')) {
      const parts = auditorStr.split(' - ');
      const namePart = parts[0]?.trim();
      const codePart = parts[1]?.trim();
      if (rowEmpCode && codePart && rowEmpCode === codePart) return true;
      if (rowName && namePart && rowName === namePart) return true;
    } else {
      if (rowEmpCode && auditorStr === rowEmpCode) return true;
      if (rowName && auditorStr === rowName) return true;
    }
    return false;
  }, [formData.auditor]);

  const attendanceColumns = useMemo(() => [
    { id: 'name', label: 'Name', minWidth: 150 },
    { id: 'inTime', label: 'In Time', minWidth: 100 },
    { id: 'outTime', label: 'Out Time', minWidth: 120 },
    { id: 'attendanceStatus', label: 'Status', minWidth: 100 }
  ], []);

  useEffect(() => {
    if (isEditing) {
      fetchObservation();
    } else {
      generateObservationNo();
    }
  }, [id, isEditing]);

  // Remove manual fetch as useLookups handles it now

  const generateObservationNo = async () => {
    try {
      const res = await axios.get(`${API_PATHS.QMS.AUDIT_OBSERVATION}/next-no`);
      setFormData(prev => ({ ...prev, observationNo: res.data || 'OB-001' }));
    } catch (e) { 
      setFormData(prev => ({ ...prev, observationNo: 'OB-001' })); 
    }
  };

  const fetchObservation = async () => {
    try {
      const res = await axios.get(`${API_PATHS.QMS.AUDIT_OBSERVATION}/${id}`);
      setFormData(res.data);
      setDetails(res.data.details || []);
      if (res.data.auditScheduleNo) fetchAttendance(res.data.auditScheduleNo);
      if (res.data.details) {
        recalculateCounts(res.data.details, res.data.observationDate);
      }
    } catch (e) { console.error('Failed to fetch observation'); }
  };

  const fetchAttendance = async (scheduleNo) => {
    try {
      const res = await axios.get(`${API_PATHS.QMS.AUDIT_ATTENDANCE}/by-schedule/${scheduleNo}`);
      setAttendance(res.data || []);
    } catch (e) { console.error('Failed to fetch attendance'); }
  };

  const handleScheduleChange = (e) => {
    const schNo = e.target.value;
    const sch = schedules.find(s => s.scheduleNo === schNo);
    if (sch) {
      setFormData(prev => ({
        ...prev,
        auditScheduleNo: schNo,
        auditType: sch.auditType,
        auditArea: sch.auditArea || '',
        departmentName: sch.department,
        auditee: sch.auditee,
        auditor: sch.auditor,
        ncrApprovedBy: sch.ncrApprovedBy
      }));
      const initialDetails = sch.criteriaList.map(c => ({
        seqNo: c.seqNo,
        clause: c.clause,
        criteriaDetails: c.criteriaDetails,
        attachmentReq: c.attachmentReq,
        observationStatus: 'COMPLIANCE',
        approvalStatus: 'PENDING',
        comments: ''
      }));
      setDetails(initialDetails);
      recalculateCounts(initialDetails, formData.observationDate);
      fetchAttendance(schNo);
    }
  };

  const updateDetail = (idx, field, value) => {
    const newDetails = [...details];
    newDetails[idx][field] = value;
    setDetails(newDetails);
    recalculateCounts(newDetails);
  };

  const recalculateCounts = (currDetails, customDate) => {
    const obsDateStr = customDate || formData.observationDate || new Date().toISOString().split('T')[0];
    const obsDate = new Date(obsDateStr);
    const today = new Date();
    obsDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    const diffTime = today.getTime() - obsDate.getTime();
    const diffDays = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));

    let compliance = 0;
    let ofi = 0;
    let ncCount = 0;
    let score = 0;

    currDetails.forEach(d => {
      const status = d.observationStatus || '';
      const appStatus = d.approvalStatus || '';
      
      if (status === 'COMPLIANCE') {
        compliance++;
        score += 1;
      } else if (status === 'OFI') {
        ofi++;
        score += 0;
      } else if (status === 'NC' || status === 'NCR') {
        ncCount++;
        if (appStatus === 'CLOSED') {
          score += 0;
        } else {
          if (diffDays <= 3) {
            score += -1;
          } else if (diffDays <= 5) {
            score += -3;
          } else if (diffDays <= 8) {
            score += -5;
          } else {
            score += -8;
          }
        }
      }
    });

    setFormData(prev => ({
      ...prev,
      complianceCount: compliance,
      ofiCount: ofi,
      ncrCount: ncCount,
      auditScore: score
    }));
  };

  const handleSave = async () => {
    const hasSummaryErrors = !validate(formData, VALIDATION_RULES);
    
    // SOP: Observation Transaction Validation (SOP 5.2.4) - only mandatory for NC and OFI
    const missingComments = details.some(d => 
      (d.observationStatus === 'NC' || d.observationStatus === 'NCR' || d.observationStatus === 'OFI') && 
      (!d.comments || d.comments.trim() === '')
    );

    // SOP: Mandatory Attachment Rule (SOP 5.1.4) - required for Compliance/OFI if marked
    const missingAttachments = details.some(d => d.attachmentReq === 'YES' && d.observationStatus !== 'NC' && d.observationStatus !== 'NCR' && d.observationStatus !== 'NO ENTRY' && d.observationStatus !== 'NO_ENTRY' && d.observationStatus && !d.attachmentPath);
    
    if (hasSummaryErrors || missingComments || missingAttachments) {
      setShowTableErrors(true);
      dispatch(openSnackbar({ open: true, message: 'Please correct the highlighted validation errors.', severity: 'error', variant: 'alert' }));
      return;
    }

    try {
      const payload = { ...formData, details };
      if (isEditing) {
        await axios.put(`${API_PATHS.QMS.AUDIT_OBSERVATION}/${id}`, payload, { skipGlobalAlert: true });
      } else {
        await axios.post(API_PATHS.QMS.AUDIT_OBSERVATION, payload, { skipGlobalAlert: true });
      }
      dispatch(openSnackbar({ open: true, message: 'Observation saved successfully!', severity: 'success', variant: 'alert' }));
      navigate('/qms/audit/observation');
    } catch (e) {
      dispatch(openSnackbar({ open: true, message: 'Failed to save observation', severity: 'error', variant: 'alert' }));
    }
  };

  useKeyboardShortcuts({
    'ctrl+s': handleSave,
    'escape': () => navigate('/qms/audit/observation')
  });

  return (
    <MainCard
      title={
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <IconFileText size={24} />
          <Typography variant="h3">Audit Observation {isEditing ? 'Edit' : 'Creation'}</Typography>
        </Stack>
      }
      secondary={
        <Stack direction="row" spacing={2}>
          <Button variant="contained" sx={btnCancel} startIcon={<IconArrowLeft size={20} />} onClick={() => navigate('/qms/audit/observation')}>Back</Button>
          {perms.write && <Button variant="contained" sx={btnSave} onClick={handleSave} startIcon={<IconCheck size={20} />}>Save</Button>}
        </Stack>
      }
    >
      <Stack spacing={3}>
        <BOSFormSection icon={<IconCalendarEvent size={20} color={theme.palette.primary.main} />} title="Observation Summary">
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 2.5 }}>
            <BOSTextField label="Observation No" value={formData.observationNo || ''} inputProps={{ readOnly: true }} />
            <BOSDatePicker
              required
              label="Observation Date"
              name="observationDate"
              value={formData.observationDate || ''}
              onChange={(e) => {
                const newDate = e.target.value;
                setFormData(prev => ({ ...prev, observationDate: newDate }));
                recalculateCounts(details, newDate);
              }}
              error={!!errors.observationDate}
              helperText={errors.observationDate}
              disabled={!perms.write}
            />
            <BOSTextField
              select
              required
              label="Schedule No"
              name="auditScheduleNo"
              value={formData.auditScheduleNo || ''}
              onChange={handleScheduleChange}
              disabled={!perms.write || isEditing}
              error={!!errors.auditScheduleNo}
              helperText={errors.auditScheduleNo}
            >
              {availableSchedules.map(s => <MenuItem key={s.id} value={s.scheduleNo}>{s.scheduleNo}</MenuItem>)}
            </BOSTextField>
            <BOSTextField label="Audit Type" value={formData.auditType || ''} inputProps={{ readOnly: true }} />
            <BOSTextField label="Department" value={formData.departmentName || ''} inputProps={{ readOnly: true }} />
            <BOSTextField label="Auditee" value={formData.auditee && formData.auditee.includes(' - ') ? formData.auditee.split(' - ')[0].trim() : (formData.auditee || '')} inputProps={{ readOnly: true }} />
            <BOSTextField label="Auditor" value={formData.auditor && formData.auditor.includes(' - ') ? formData.auditor.split(' - ')[0].trim() : (formData.auditor || '')} inputProps={{ readOnly: true }} />
            <BOSTextField label="NC Approved By" value={formData.ncrApprovedBy && formData.ncrApprovedBy.includes(' - ') ? formData.ncrApprovedBy.split(' - ')[0].trim() : (formData.ncrApprovedBy || '')} inputProps={{ readOnly: true }} />
          </Box>
        </BOSFormSection>

        {/* Section 2: Attendance & Stats */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '3fr 1fr' }, gap: 3 }}>
          <BOSFormSection icon={<IconUsers size={20} color={theme.palette.secondary.main} />} title="Audit Attendance" sx={{ height: 'fit-content' }}>
            <BOSDataTable
              columns={attendanceColumns}
              rows={attendance}
              page={0}
              size={attendance.length || 5}
              loading={false}
              showActions={false}
              sx={{ height: attendance.length > 0 ? '250px' : '135px' }}
              renderCell={(col, row) => {
                if (col.id === 'name') {
                  const isAud = isRowAuditor(row);
                  return (
                    <Typography sx={{ color: isAud ? 'error.main' : 'inherit', fontWeight: isAud ? 600 : 'inherit' }}>
                      {row.name || '-'}
                    </Typography>
                  );
                }
                if (col.id === 'attendanceStatus') return <Chip label={row.attendanceStatus} size="small" sx={getStatusChipSx(row.attendanceStatus === 'PRESENT' ? 'ACTIVE' : 'INACTIVE')} />;
                if (col.id === 'outTime') {
                  const cleanedOutTime = !row.outTime || row.outTime === 'undefined' || row.outTime === 'null' ? '' : row.outTime;
                  return (
                    <BOSTimePicker
                      size="small"
                      value={cleanedOutTime}
                      disabled={!isAuditorUser}
                      onChange={async (e) => {
                        const val = e.target.value;
                        try {
                          const updatedRow = { ...row, outTime: val };
                          await axios.put(`${API_PATHS.QMS.AUDIT_ATTENDANCE}/${row.id}`, updatedRow);
                          dispatch(openSnackbar({ open: true, message: `Out Time updated for ${row.name}!`, severity: 'success', variant: 'alert' }));
                          if (formData.auditScheduleNo) {
                            fetchAttendance(formData.auditScheduleNo);
                          }
                        } catch (err) {
                          console.error(err);
                          dispatch(openSnackbar({ open: true, message: 'Failed to update Out Time', severity: 'error', variant: 'alert' }));
                        }
                      }}
                      minTime={activeScheduleStartTime}
                      maxTime="09:00 PM"
                      fullWidth
                    />
                  );
                }
                return row[col.id] || '-';
              }}
            />
          </BOSFormSection>

          <Card sx={{ 
            border: 'none',
            borderRadius: '20px', 
            height: 'fit-content',
            background: theme.palette.mode === 'dark' 
              ? `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, rgba(20, 24, 33, 0.95) 100%)`
              : `linear-gradient(135deg, ${theme.palette.primary.light} 0%, #ffffff 100%)`,
            boxShadow: theme.palette.mode === 'dark'
              ? '0 10px 30px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
              : '0 10px 30px rgba(98, 54, 255, 0.08)',
            position: 'relative',
            overflow: 'hidden',
            transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: theme.palette.mode === 'dark'
                ? '0 15px 35px rgba(0, 0, 0, 0.6)'
                : '0 15px 35px rgba(98, 54, 255, 0.15)',
            }
          }}>
            <Box sx={{
              position: 'absolute',
              top: '-50px',
              right: '-50px',
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              background: `radial-gradient(circle, ${theme.palette.primary.main} 0%, transparent 70%)`,
              opacity: 0.15,
              filter: 'blur(10px)',
              zIndex: 0
            }} />
            <CardContent sx={{ position: 'relative', zIndex: 1, p: 3 }}>
              <Stack spacing={2.5} alignItems="center">
                <Avatar sx={{ 
                  bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.06)' : 'rgba(98, 54, 255, 0.08)',
                  color: 'primary.main', 
                  width: 56, 
                  height: 56,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                }}>
                  <IconReportAnalytics size={30} />
                </Avatar>
                <Stack spacing={0.5} alignItems="center">
                  <Typography variant="subtitle2" sx={{ 
                    fontWeight: 700, 
                    color: 'text.secondary', 
                    textTransform: 'uppercase', 
                    letterSpacing: '1px',
                    fontSize: '0.75rem'
                  }}>
                    Audit Score
                  </Typography>
                   <Typography variant="h1" sx={{ 
                    fontSize: '3.5rem', 
                    fontWeight: 900,
                    background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    lineHeight: 1.1
                  }}>
                    {validDetailsCount > 0 ? `${Math.round((formData.auditScore / validDetailsCount) * 100)}%` : '0%'}
                  </Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'text.secondary', mt: 0.5 }}>
                    {formData.auditScore} / {validDetailsCount} Points
                  </Typography>
                </Stack>
                <Box sx={{ 
                  width: '100%', 
                  bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
                  borderRadius: '14px', 
                  p: 2,
                  border: '1px solid',
                  borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'
                }}>
                  <Stack spacing={1.5}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'success.main' }} />
                        <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.secondary' }}>Compliance</Typography>
                      </Stack>
                      <Chip label={formData.complianceCount} size="small" color="success" sx={{ fontWeight: 700, borderRadius: '6px', height: 20 }} />
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'warning.main' }} />
                        <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.secondary' }}>OFI</Typography>
                      </Stack>
                      <Chip label={formData.ofiCount} size="small" color="warning" sx={{ fontWeight: 700, borderRadius: '6px', height: 20 }} />
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'error.main' }} />
                        <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.secondary' }}>NC</Typography>
                      </Stack>
                      <Chip label={formData.ncrCount} size="small" color="error" sx={{ fontWeight: 700, borderRadius: '6px', height: 20 }} />
                    </Box>
                  </Stack>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Box>

        {/* Section 3: Findings Checklist */}
        <BOSFormSection icon={<IconListCheck size={20} color={theme.palette.success.main} />} title="Audit Findings Checklist">
          <BOSDataTable
            columns={[
              { id: 'seqNo', label: 'Seq', minWidth: 50 },
              { id: 'clause', label: 'Clause', minWidth: 100 },
              { id: 'criteriaDetails', label: 'Criteria Details', minWidth: 250 },
              { id: 'attachmentReq', label: 'Req.', minWidth: 60 },
              { id: 'observationStatus', label: 'Status', minWidth: 150 },
              { id: 'approvalStatus', label: 'Approval', minWidth: 100 },
              { id: 'comments', label: 'Comments *', minWidth: 200 },
              { id: 'attachment', label: 'Evidence', minWidth: 80 }
            ]}
            rows={details}
            page={0}
            size={details.length || 10}
            showActions={false}
            sx={{ maxHeight: '500px' }}
            renderCell={(col, row, idx) => {
              if (col.id === 'observationStatus') {
                return (
                  <BOSTextField select size="small" value={row.observationStatus || 'NO ENTRY'} onChange={(e) => updateDetail(idx, 'observationStatus', e.target.value)} disabled={!perms.write} fullWidth>
                    {OBS_STATUSES.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                  </BOSTextField>
                );
              }
              if (col.id === 'approvalStatus') {
                const status = row.approvalStatus || 'PENDING';
                let chipStatus = 'INACTIVE'; // Red by default for Open/Rejected/Unresolved
                if (status === 'CLOSED' || status === 'APPROVED') {
                  chipStatus = 'ACTIVE'; // Green
                } else if (status === 'WAITING_APPROVAL' || status === 'PENDING' || status === 'REWORK') {
                  chipStatus = 'PENDING'; // Yellow
                }
                const displayLabel = status === 'CLOSED' ? 'APPROVED' : status.replace('_', ' ');
                return <Chip label={displayLabel} size="small" sx={getStatusChipSx(chipStatus)} />;
              }
              if (col.id === 'attachment') {
                const attachmentFiles = row.attachmentPath 
                  ? [{
                      id: row.id || idx,
                      fileName: row.attachmentPath.split('/').pop(),
                      serverFileName: row.attachmentPath,
                      isServer: true
                    }] 
                  : [];
                const isAttachmentMissing = showTableErrors && row.attachmentReq === 'YES' && row.observationStatus !== 'NC' && row.observationStatus !== 'NCR' && row.observationStatus !== 'NO ENTRY' && row.observationStatus !== 'NO_ENTRY' && row.observationStatus && !row.attachmentPath;
                return (
                  <Box sx={{ minWidth: 140, border: isAttachmentMissing ? '1px solid #f44336' : 'none', borderRadius: 2.5, p: isAttachmentMissing ? 0.5 : 0 }}>
                    <BOSFileUpload
                      files={attachmentFiles}
                      onChange={(files) => {
                        const file = files[0];
                        updateDetail(idx, 'attachmentPath', file ? file.serverFileName : '');
                      }}
                      module="QUALITY_MANAGEMENT_SYSTEMS_AUDIT_AUDIT_OBSERVATION"
                      multiple={false}
                      compact={true}
                      isEditing={perms.write}
                      disabled={!perms.write}
                      label="Upload"
                      helperText={isAttachmentMissing ? "Evidence required" : "Click to upload file"}
                    />
                  </Box>
                );
              }
              if (col.id === 'comments') {
                const isNCOFI = row.observationStatus === 'NC' || row.observationStatus === 'NCR' || row.observationStatus === 'OFI';
                const isCommentMissing = showTableErrors && isNCOFI && (!row.comments || row.comments.trim() === '');
                return (
                  <BOSTextField
                    multiline
                    size="small"
                    value={row.comments || ''}
                    onChange={(e) => updateDetail(idx, 'comments', e.target.value)}
                    placeholder="Enter findings..."
                    disabled={!perms.write}
                    error={isCommentMissing}
                    helperText={isCommentMissing ? 'Comments are mandatory for NC/OFI' : ''}
                    fullWidth
                  />
                );
              }
              return row[col.id] || '-';
            }}
          />
        </BOSFormSection>
      </Stack>

    </MainCard>
  );
}
