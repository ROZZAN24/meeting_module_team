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
  btnSave,
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

const OBS_STATUSES = ['COMPLIANCE', 'OFI', 'NCR', 'NO ENTRY'];

const TIME_OPTIONS = [
  '08:00 AM', '08:30 AM', '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '12:00 PM', '12:30 PM', '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM',
  '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM', '06:00 PM', '06:30 PM', '07:00 PM', '07:30 PM', '08:00 PM'
];

export default function AddAuditObservation() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const theme = useTheme();
  const { user } = useAuth();
  const isEditing = Boolean(id);
  const perms = usePagePermissions(PAGE_CODES.QMS_AUDIT_OBSERVATION);
  const { errors, validate, clearErrors } = useBOSValidation();

  const isAuditorUser = useMemo(() => {
    if (!user || !formData.auditor) return false;
    
    const auditorParts = formData.auditor.split(' - ');
    const auditorCode = auditorParts[1] ? auditorParts[1].trim() : '';
    const auditorName = auditorParts[0] ? auditorParts[0].trim() : '';
    
    const userEmpCode = (user.employeeCode || user.empCode || '').trim();
    const userUserId = (user.id || '').trim();
    const userName = (user.name || '').trim();
    
    if (userEmpCode && auditorCode && userEmpCode.toLowerCase() === auditorCode.toLowerCase()) {
      return true;
    }
    if (userUserId && auditorCode && userUserId.toLowerCase() === auditorCode.toLowerCase()) {
      return true;
    }
    if (userName && auditorName && userName.toLowerCase() === auditorName.toLowerCase()) {
      return true;
    }
    return false;
  }, [user, formData.auditor]);

  const attendanceColumns = useMemo(() => {
    const base = [
      { id: 'name', label: 'Name', minWidth: 150 },
      { id: 'inTime', label: 'In Time', minWidth: 100 },
      { id: 'outTime', label: 'Out Time', minWidth: 120 },
      { id: 'attendanceStatus', label: 'Status', minWidth: 100 }
    ];
    if (isAuditorUser) {
      base.push({ id: 'saveAction', label: 'Action', minWidth: 80 });
    }
    return base;
  }, [isAuditorUser]);

  const handleSaveAttendanceRow = async (row) => {
    try {
      await axios.put(`${API_PATHS.QMS.AUDIT_ATTENDANCE}/${row.id}`, row);
      dispatch(openSnackbar({ open: true, message: `Out Time saved for ${row.name}!`, severity: 'success', variant: 'alert' }));
      if (formData.auditScheduleNo) {
        fetchAttendance(formData.auditScheduleNo);
      }
    } catch (e) {
      dispatch(openSnackbar({ open: true, message: 'Failed to save Out Time', severity: 'error', variant: 'alert' }));
    }
  };

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
  const { auditSchedules: schedules = [] } = useLookups(['AUDIT_SCHEDULE']);

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
      setDetails(sch.criteriaList.map(c => ({
        seqNo: c.seqNo,
        clause: c.clause,
        criteriaDetails: c.criteriaDetails,
        attachmentReq: c.attachmentReq,
        observationStatus: 'COMPLIANCE',
        approvalStatus: 'PENDING',
        comments: ''
      })));
      fetchAttendance(schNo);
    }
  };

  const updateDetail = (idx, field, value) => {
    const newDetails = [...details];
    newDetails[idx][field] = value;
    setDetails(newDetails);
    recalculateCounts(newDetails);
  };

  const recalculateCounts = (currDetails) => {
    const counts = currDetails.reduce((acc, curr) => {
      const status = curr.observationStatus || '';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    const compliance = counts['COMPLIANCE'] || 0;
    const ofi = counts['OFI'] || 0;
    const ncCount = (counts['NC'] || 0) + (counts['NCR'] || 0);

    // Score format: compliance (+1), NC (-1), OFI (0), NO ENTRY (0)
    const score = (compliance * 1) + (ncCount * -1) + (ofi * 0);

    setFormData(prev => ({
      ...prev,
      complianceCount: compliance,
      ofiCount: ofi,
      ncrCount: ncCount,
      auditScore: score
    }));
  };

  const handleSave = async () => {
    if (!validate(formData, VALIDATION_RULES)) return;
    
    // SOP: Observation Transaction Validation (SOP 5.2.4) - only mandatory for NC and OFI
    const missingComments = details.some(d => 
      (d.observationStatus === 'NC' || d.observationStatus === 'NCR' || d.observationStatus === 'OFI') && 
      (!d.comments || d.comments.trim() === '')
    );
    if (missingComments) {
      dispatch(openSnackbar({ open: true, message: 'Comments are mandatory for NC and OFI findings.', severity: 'error', variant: 'alert' }));
      return;
    }

    // SOP: Mandatory Attachment Rule (SOP 5.1.4) - required for Compliance/OFI if marked
    const missingAttachments = details.some(d => d.attachmentReq === 'YES' && d.observationStatus !== 'NC' && d.observationStatus !== 'NCR' && !d.attachmentPath);
    if (missingAttachments) {
      dispatch(openSnackbar({ open: true, message: 'Evidence attachment is mandatory for rows marked as "Attachment Required".', severity: 'error', variant: 'alert' }));
      return;
    }

    try {
      const payload = { ...formData, details };
      if (isEditing) {
        await axios.put(`${API_PATHS.QMS.AUDIT_OBSERVATION}/${id}`, payload);
      } else {
        await axios.post(API_PATHS.QMS.AUDIT_OBSERVATION, payload);
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
          <Button variant="outlined" startIcon={<IconArrowLeft size={20} />} onClick={() => navigate('/qms/audit/observation')}>Back</Button>
          {perms.write && <Button variant="contained" sx={btnClear} onClick={() => isEditing ? fetchObservation() : generateObservationNo()} startIcon={<IconEraser size={20} />}>Reset</Button>}
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
              onChange={(e) => setFormData(prev => ({ ...prev, observationDate: e.target.value }))}
              error={!!errors.observationDate}
              helperText={errors.observationDate}
              disabled={!perms.write}
            />
            <BOSTextField select required label="Schedule No" name="auditScheduleNo" value={formData.auditScheduleNo || ''} onChange={handleScheduleChange} disabled={!perms.write}>
              {schedules.map(s => <MenuItem key={s.id} value={s.scheduleNo}>{s.scheduleNo}</MenuItem>)}
            </BOSTextField>
            <BOSTextField label="Audit Type" value={formData.auditType || ''} inputProps={{ readOnly: true }} />
            <BOSTextField label="Department" value={formData.departmentName || ''} inputProps={{ readOnly: true }} />
            <BOSTextField label="Auditee" value={formData.auditee || ''} inputProps={{ readOnly: true }} />
            <BOSTextField label="Auditor" value={formData.auditor || ''} inputProps={{ readOnly: true }} />
            <BOSTextField label="NC Approved By" value={formData.ncrApprovedBy || ''} inputProps={{ readOnly: true }} />
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
                if (col.id === 'attendanceStatus') return <Chip label={row.attendanceStatus} size="small" sx={getStatusChipSx(row.attendanceStatus === 'PRESENT' ? 'ACTIVE' : 'INACTIVE')} />;
                if (col.id === 'outTime') {
                  if (isAuditorUser) {
                    return (
                      <BOSTextField
                        select
                        size="small"
                        value={row.outTime || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setAttendance((prev) => 
                            prev.map((item) => item.id === row.id ? { ...item, outTime: val } : item)
                          );
                        }}
                        fullWidth
                      >
                        <MenuItem value="">-Select-</MenuItem>
                        {TIME_OPTIONS.map((t) => (
                          <MenuItem key={t} value={t}>{t}</MenuItem>
                        ))}
                      </BOSTextField>
                    );
                  }
                  return row.outTime || '-';
                }
                if (col.id === 'saveAction') {
                  return (
                    <Tooltip title="Save Out Time">
                      <IconButton 
                        color="primary" 
                        size="small" 
                        onClick={() => handleSaveAttendanceRow(row)}
                        sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '8px' }}
                      >
                        <IconDeviceFloppy size={18} />
                      </IconButton>
                    </Tooltip>
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
                    {formData.auditScore}
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
                        <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.secondary' }}>NC / NCR</Typography>
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
                return <Chip label={row.approvalStatus} size="small" color={row.approvalStatus === 'APPROVED' ? 'success' : 'warning'} variant="outlined" />;
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
                return (
                  <Box sx={{ minWidth: 140 }}>
                    <BOSFileUpload
                      files={attachmentFiles}
                      onChange={(files) => {
                        const file = files[0];
                        updateDetail(idx, 'attachmentPath', file ? file.serverFileName : '');
                      }}
                      module="QMS"
                      multiple={false}
                      compact={true}
                      isEditing={perms.write}
                      disabled={!perms.write}
                      label=""
                      helperText=""
                    />
                  </Box>
                );
              }
              if (col.id === 'comments') {
                return <BOSTextField multiline size="small" value={row.comments} onChange={(e) => updateDetail(idx, 'comments', e.target.value)} placeholder="Enter findings..." disabled={!perms.write} fullWidth />;
              }
              return row[col.id] || '-';
            }}
          />
        </BOSFormSection>
      </Stack>


    </MainCard>
  );
}
