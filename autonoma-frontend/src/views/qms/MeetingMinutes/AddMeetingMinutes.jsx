import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  MenuItem,
  Stack,
  Box,
  Typography,
  Autocomplete,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Button,
  Grid,
  useTheme,
  CircularProgress,
  Tooltip,
  Divider,
  Chip
} from '@mui/material';
import {
  BOSFormSection,
  BOSTextField,
  BOSFormDialog,
  btnSave,
  btnCancel,
  btnClear,
  getBOSStyles
} from 'ui-component/bos';
import { 
  IconPlus, 
  IconTrash, 
  IconSettings, 
  IconUsers, 
  IconMessageDots, 
  IconDeviceFloppy, 
  IconArrowLeft, 
  IconEraser, 
  IconFileText, 
  IconDeviceFloppy as IconSave,
  IconCheck,
  IconClock,
  IconEdit
} from '@tabler/icons-react';
import MainCard from 'ui-component/cards/MainCard';
import useBOSValidation from 'hooks/useBOSValidation';
import useAuth from 'hooks/useAuth';
import { useLookups } from 'hooks/useLookups';
import useKeyboardShortcuts, { shortcutTooltip } from 'hooks/useKeyboardShortcuts';
import { openSnackbar } from 'store/slices/snackbar';
import axios from 'utils/axios';
import { API_PATHS } from 'utils/api-constants';
import MaterialSelectionDialog from './MaterialSelectionDialog';
import usePagePermissions, { PAGE_CODES } from 'hooks/usePagePermissions';

// Format: MM/CCRM/2026-2027/001
const DEFAULT_MOM_NO = 'MM/CCRM/2026-2027/001';
const TODAY = new Date().toISOString().split('T')[0];

const formatTo24hString = (time) => {
  if (!time) return '';
  if (Array.isArray(time)) {
    const [h, m] = time;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }
  if (typeof time === 'string') {
    const parts = time.split(':');
    if (parts.length >= 2) {
      return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}`;
    }
  }
  return time;
};

const INITIAL_FORM = {
  momNo: 'AUTO-GENERATE',
  momDate: TODAY,
  schedule: null,
  agenda: '',
  chairedBy: null,
  startTime: '09:00',
  endTime: '10:00',
  attendanceList: [],
  details: [
    { 
      meetNo: `${DEFAULT_MOM_NO}/001`, 
      amendMeetNo: '', 
      discussedPoint: '', 
      type: 'RM', 
      materialList: '', 
      processType: 'INFO', 
      assignedBy: null, 
      assignedTo: null, 
      targetDate: '', 
      reviewDate: '', 
      attachmentRequired: 'NO',
      status: 'OPEN',
      isAmended: false
    }
  ]
};

export default function AddMeetingMinutes() {
  const theme = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const editId = id || searchParams.get('id');

  const { meetingSchedules = [], employees = [] } = useLookups(['MEETING_SCHEDULES', 'EMPLOYEES']);
  const perms = usePagePermissions(PAGE_CODES.QMS_MEETING_MOM);
  const { errors, validate, clearErrors, handleInputChange } = useBOSValidation();
  const { user } = useAuth();
  const [form, setForm] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [materialDialog, setMaterialDialog] = useState({ open: false, rowIdx: null, type: 'RM' });


  const isHost = user && form.schedule?.hostBy && (String(user.empId) === String(form.schedule.hostBy.id));
  const canSave = perms.write || isHost;
  const canEditOutTime = isHost;

  const meetingUsers = form.attendanceList
    .filter(a => a.attendanceStatus !== 'ABSENT')
    .map(a => a.employee || a)
    .filter(emp => emp && emp.id);

  const [detailDialog, setDetailDialog] = useState({
    open: false,
    rowIdx: null,
    form: {
      meetNo: '',
      amendMeetNo: '',
      discussedPoint: '',
      type: 'RM',
      materialList: '',
      processType: 'INFO',
      assignedBy: null,
      assignedTo: null,
      targetDate: '',
      reviewDate: '',
      attachmentRequired: 'NO',
      status: 'CLOSED',
      isAmended: false
    }
  });

  const handleOpenDetailDialog = (idx) => {
    if (idx === null) {
      setDetailDialog({
        open: true,
        rowIdx: null,
        form: {
          meetNo: '',
          amendMeetNo: '',
          discussedPoint: '',
          type: 'RM',
          materialList: '',
          processType: 'INFO',
          assignedBy: null,
          assignedTo: null,
          targetDate: '',
          reviewDate: '',
          attachmentRequired: 'NO',
          status: 'CLOSED',
          isAmended: false
        }
      });
    } else {
      const det = form.details[idx];
      setDetailDialog({
        open: true,
        rowIdx: idx,
        form: {
          meetNo: det.meetNo || '',
          amendMeetNo: det.amendMeetNo || '',
          discussedPoint: det.discussedPoint || '',
          type: det.type || 'RM',
          materialList: det.materialList || '',
          processType: det.processType || 'INFO',
          assignedBy: det.assignedBy || null,
          assignedTo: det.assignedTo || null,
          targetDate: det.targetDate || '',
          reviewDate: det.reviewDate || '',
          attachmentRequired: det.attachmentRequired || 'NO',
          status: det.status || 'CLOSED',
          isAmended: det.isAmended || false
        }
      });
    }
  };

  const handleSaveDetailDialog = () => {
    const { rowIdx, form: dialogForm } = detailDialog;
    
    // Character validation inside the dialog
    const minLen = dialogForm.attachmentRequired === 'YES' ? 50 : 150;
    if (dialogForm.discussedPoint.length < minLen) {
      dispatch(openSnackbar({ 
        open: true, 
        message: `Discussed Point must be at least ${minLen} characters (current: ${dialogForm.discussedPoint.length}).`, 
        variant: 'alert', 
        severity: 'error' 
      }));
      return;
    }

    // Action process validation inside the dialog
    if (dialogForm.processType === 'ACTION') {
      if (!dialogForm.assignedTo || !dialogForm.assignedBy) {
        dispatch(openSnackbar({ 
          open: true, 
          message: 'Assignee and Assignor are required for ACTION points.', 
          variant: 'alert', 
          severity: 'error' 
        }));
        return;
      }
      if (dialogForm.reviewDate && dialogForm.targetDate && dialogForm.reviewDate < dialogForm.targetDate) {
        dispatch(openSnackbar({ open: true, message: 'Review Date cannot be before Target Date', variant: 'alert', severity: 'error' }));
        return;
      }
      if ((dialogForm.targetDate && dialogForm.targetDate < TODAY) || (dialogForm.reviewDate && dialogForm.reviewDate < TODAY)) {
        dispatch(openSnackbar({ open: true, message: 'Target/Review Date cannot be in the past', variant: 'alert', severity: 'error' }));
        return;
      }
    }

    if (rowIdx === null) {
      const newDetails = [{ ...dialogForm }, ...form.details];
      setForm(p => ({
        ...p,
        details: syncMeetNumbers(p.momNo, newDetails)
      }));
    } else {
      const newDetails = [...form.details];
      newDetails[rowIdx] = { ...newDetails[rowIdx], ...dialogForm };
      setForm(p => ({
        ...p,
        details: syncMeetNumbers(p.momNo, newDetails)
      }));
    }
    setDetailDialog({ open: false, rowIdx: null, form: {
      meetNo: '',
      amendMeetNo: '',
      discussedPoint: '',
      type: 'RM',
      materialList: '',
      processType: 'INFO',
      assignedBy: null,
      assignedTo: null,
      targetDate: '',
      reviewDate: '',
      attachmentRequired: 'NO',
      status: 'CLOSED',
      isAmended: false
    } });
  };

  // Keyboard Shortcuts
  useKeyboardShortcuts({
    'ctrl+s': (e) => { e.preventDefault(); handleSave(); },
    'ctrl+backspace': (e) => { e.preventDefault(); setForm(INITIAL_FORM); },
    'escape': (e) => { e.preventDefault(); navigate('/qms/minutesofmeeting'); }
  }, true);

  // Helper to re-index all meet numbers and amendments in the table
  const syncMeetNumbers = useCallback((momNo, details) => {
    const total = details.length;
    return details.map((idx_d, idx) => {
      // Descending sequence: top row (idx=0) gets highest number
      const sequenceNum = total - idx;
      const meetNo = `${momNo}/${String(sequenceNum).padStart(3, '0')}`;
      return {
        ...idx_d,
        meetNo,
        amendMeetNo: idx_d.isAmended ? `${meetNo}/A01` : ''
      };
    });
  }, []);

  // SOP: Process -> Status Logic
  const handleProcessChange = (index, value) => {
    const newDetails = [...form.details];
    newDetails[index].processType = value;
    // SOP Rule: INFO -> CLOSED, ACTION -> OPEN
    newDetails[index].status = value === 'INFO' ? 'CLOSED' : 'OPEN';
    setForm(p => ({ ...p, details: newDetails }));
  };

  // SOP: Date Validation (No Sundays)
  const isSunday = (dateStr) => {
    if (!dateStr) return false;
    const date = new Date(dateStr);
    return date.getDay() === 0;
  };

  const fetchMom = useCallback(async () => {
    if (!editId) return;
    setLoading(true);
    try {
      const { data } = await axios.get(`${API_PATHS.QMS.MOMS}/${editId}`);
      if (data.momNo && data.momNo.endsWith('/AUTO') && data.schedule?.scheduleNo) {
        const scheduleParts = data.schedule.scheduleNo.split('/');
        const scheduleSeq = scheduleParts.length > 0 ? scheduleParts[scheduleParts.length - 1] : 'AUTO';
        data.momNo = data.momNo.replace(/\/AUTO$/, `/${scheduleSeq}`);
      }
      if (data.momDate) data.momDate = data.momDate.split('T')[0];
      if (data.attendanceList) {
        data.attendanceList = data.attendanceList.map(att => ({
          ...att,
          inTime: formatTo24hString(att.inTime),
          outTime: formatTo24hString(att.outTime),
          attendanceStatus: att.attendanceStatus ? att.attendanceStatus.toUpperCase() : 'ABSENT'
        }));
      }
      if (data.details) {
        data.details = data.details.map(d => ({
          ...d,
          isAmended: d.revNo > 0,
          targetDate: d.targetDate ? d.targetDate.split('T')[0] : '',
          reviewDate: d.reviewDate ? d.reviewDate.split('T')[0] : ''
        }));
        data.details = syncMeetNumbers(data.momNo, data.details);
      }
      setForm(data);
    } catch (error) {
      console.error('Failed to fetch MOM:', error);
      dispatch(openSnackbar({ open: true, message: 'Failed to load MOM details', variant: 'alert', severity: 'error' }));
    } finally {
      setLoading(false);
    }
  }, [editId, dispatch]);

  useEffect(() => {
    if (editId) {
      fetchMom();
    } else {
      setForm(INITIAL_FORM);
    }
    clearErrors();
  }, [editId, fetchMom, clearErrors]);

  const handleScheduleChange = async (e, val) => {
    if (!val) return;
    
    setLoading(true);
    const typePrefix = val.meetingType?.meetingPrefix || 'MEET';
    const year = new Date().getFullYear();
    const yearRange = `${year}-${year + 1}`;
    
    // Extract sequence number from the schedule number (e.g. "1" from "ARM/2026-2027/1")
    const scheduleParts = val.scheduleNo ? val.scheduleNo.split('/') : [];
    const scheduleSeq = scheduleParts.length > 0 ? scheduleParts[scheduleParts.length - 1] : 'AUTO';
    const dynamicMomNo = `MM/${typePrefix}/${yearRange}/${scheduleSeq}`;

    try {
      // 1. Fetch actual attendance records for this schedule
      const { data: attendanceRecords } = await axios.get(`${API_PATHS.QMS.MEETING_ATTENDANCE}/schedule/${val.id}`);
      
      // 2. Map participants to attendance status
      // If a record exists, use its status/times. Otherwise, they are ABSENT.
      const participants = (val.participants || []).map(p => {
        const record = attendanceRecords.find(r => r.employee?.id === p.employee?.id);
        
        if (record) {
          return {
            employee: p.employee,
            inTime: formatTo24hString(record.inTime) || formatTo24hString(val.startTime) || '09:00',
            outTime: formatTo24hString(record.outTime) || formatTo24hString(val.endTime) || '10:00',
            attendanceStatus: record.status ? record.status.toUpperCase() : 'PRESENT'
          };
        } else {
          // No attendance posted -> ABSENT
          return {
            employee: p.employee,
            inTime: '',
            outTime: '',
            attendanceStatus: 'ABSENT'
          };
        }
      });

      setForm(p => ({
        ...p,
        momNo: dynamicMomNo,
        schedule: val,
        agenda: val.agenda || '',
        chairedBy: val.chairedBy,
        startTime: val.startTime || '09:00',
        endTime: val.endTime || '10:00',
        attendanceList: participants,
        details: syncMeetNumbers(dynamicMomNo, p.details)
      }));
    } catch (error) {
      console.error('Failed to fetch attendance:', error);
      dispatch(openSnackbar({ open: true, message: 'Failed to load actual attendance records', variant: 'alert', severity: 'warning' }));
      
      // Fallback: Use participants from schedule but mark as Absent by default
      const fallbackParticipants = (val.participants || []).map(p => ({
        employee: p.employee,
        inTime: '',
        outTime: '',
        attendanceStatus: 'ABSENT'
      }));
      
      setForm(p => ({
        ...p,
        momNo: dynamicMomNo,
        schedule: val,
        agenda: val.agenda || '',
        chairedBy: val.chairedBy,
        startTime: val.startTime || '09:00',
        endTime: val.endTime || '10:00',
        attendanceList: fallbackParticipants,
        details: syncMeetNumbers(dynamicMomNo, p.details)
      }));
    } finally {
      setLoading(false);
    }
  };

  const addDetailRow = () => {
    const newDetails = [{ ...INITIAL_FORM.details[0] }, ...form.details];
    setForm(p => ({
      ...p,
      details: syncMeetNumbers(p.momNo, newDetails)
    }));
  };

  const removeDetailRow = (index) => {
    if (form.details.length === 1) return;
    const newDetails = [...form.details];
    newDetails.splice(index, 1);
    setForm(p => ({ 
      ...p, 
      details: syncMeetNumbers(p.momNo, newDetails)
    }));
  };

  const handleDetailChange = (index, field, value) => {
    const newDetails = [...form.details];
    newDetails[index][field] = value;
    setForm(p => ({ ...p, details: newDetails }));
  };

  const handleSelectMaterial = (item) => {
    const { rowIdx } = materialDialog;
    if (rowIdx !== null) {
      handleDetailChange(rowIdx, 'materialList', `${item.partNo} - ${item.partName}`);
    }
    setMaterialDialog({ open: false, rowIdx: null, type: 'RM' });
  };

  const toggleAmendment = (index) => {
    const newDetails = [...form.details];
    newDetails[index].isAmended = !newDetails[index].isAmended;
    setForm(p => ({
      ...p,
      details: syncMeetNumbers(p.momNo, newDetails)
    }));
  };

  const handleSave = async () => {
    const rules = [
      { field: 'schedule', label: 'Meeting Schedule', required: true },
      { field: 'agenda', label: 'Agenda', required: true }
    ];

    // Validation: Host's Out Time must be filled if other participants' Out Times are entered
    const hostAtt = form.attendanceList.find(att => att.employee?.id === form.schedule?.hostBy?.id);
    const hostOutTimeEmpty = !hostAtt || !hostAtt.outTime || !hostAtt.outTime.trim();
    const otherOutTimeFilled = form.attendanceList.some(att => 
      att.employee?.id !== form.schedule?.hostBy?.id && 
      att.attendanceStatus !== 'ABSENT' && 
      att.outTime && 
      att.outTime.trim()
    );

    if (hostOutTimeEmpty && otherOutTimeFilled) {
      dispatch(openSnackbar({ 
        open: true, 
        message: "Please enter the host's outTime first before proceeding", 
        variant: 'alert', 
        severity: 'error' 
      }));
      return;
    }

    // Validation: Out Time is required for all present/late attendees
    const missingOutTime = form.attendanceList.some(att => 
      att.attendanceStatus !== 'ABSENT' && (!att.outTime || !att.outTime.trim())
    );
    if (missingOutTime) {
      dispatch(openSnackbar({ 
        open: true, 
        message: "It is mandatory to enter the out time before saving", 
        variant: 'alert', 
        severity: 'error' 
      }));
      return;
    }

    // SOP: Discussed Point Validation
    const invalidPoints = form.details.filter(d => {
      const minLen = d.attachmentRequired === 'YES' ? 50 : 150;
      return d.discussedPoint.length < minLen;
    });

    if (invalidPoints.length > 0) {
      dispatch(openSnackbar({ 
        open: true, 
        message: `Discussed Point requires min ${invalidPoints[0].attachmentRequired === 'YES' ? 50 : 150} characters.`, 
        variant: 'alert', 
        severity: 'error' 
      }));
      return;
    }

    // SOP: Target Date vs Review Date
    const invalidDates = form.details.filter(d => d.processType === 'ACTION' && d.reviewDate && d.targetDate && d.reviewDate < d.targetDate);
    if (invalidDates.length > 0) {
      dispatch(openSnackbar({ open: true, message: 'Review Date cannot be before Target Date', variant: 'alert', severity: 'error' }));
      return;
    }

    // SOP: Non-past dates for Action Points
    const pastDates = form.details.filter(d => 
      d.processType === 'ACTION' && 
      ((d.targetDate && d.targetDate < TODAY) || (d.reviewDate && d.reviewDate < TODAY))
    );
    if (pastDates.length > 0) {
      dispatch(openSnackbar({ open: true, message: 'Target/Review Date cannot be in the past', variant: 'alert', severity: 'error' }));
      return;
    }

    // SOP: ACTION requires assignment
    const missingAssignments = form.details.filter(d => 
      d.processType === 'ACTION' && (!d.assignedBy || !d.assignedTo)
    );
    if (missingAssignments.length > 0) {
      dispatch(openSnackbar({ 
        open: true, 
        message: 'Assignor and Assignee are mandatory for ACTION points. Please assign or change Process to INFO.', 
        variant: 'alert', 
        severity: 'error' 
      }));
      return;
    }

    if (validate(form, rules)) {
      try {
        const currentUser = user?.employeeName || user?.userName || user?.name || 'System';
        const payload = {
          ...form,
          createdUser: editId ? form.createdUser || form.createdBy : currentUser,
          updatedUser: editId ? currentUser : null,
          details: form.details.map(d => ({
            ...d,
            targetDate: d.targetDate || null,
            reviewDate: d.reviewDate || null,
            createdUser: d.id ? d.createdUser || d.createdBy : currentUser,
            updatedUser: d.id ? currentUser : null
          }))
        };

        if (editId) {
          if (isHost && !perms.write) {
            const outTimePayload = form.attendanceList.map(att => ({
              employeeId: att.employee?.id,
              attendanceId: att.id,
              outTime: att.outTime
            }));
            await axios.put(`${API_PATHS.QMS.MOMS}/${editId}/attendance-out-times`, outTimePayload);
            dispatch(openSnackbar({ open: true, message: 'Attendance out times updated Successfully...', variant: 'alert', severity: 'success' }));
          } else {
            await axios.put(`${API_PATHS.QMS.MOMS}/${editId}`, payload);
            dispatch(openSnackbar({ open: true, message: 'Meeting Minutes updated Successfully...', variant: 'alert', severity: 'success' }));
          }
        } else {
          await axios.post(API_PATHS.QMS.MOMS, payload);
          dispatch(openSnackbar({ open: true, message: 'Meeting Minutes saved Successfully..', variant: 'alert', severity: 'success' }));
        }
        navigate('/qms/minutesofmeeting');
      } catch (error) {
        dispatch(openSnackbar({ open: true, message: 'Failed to save MOM', variant: 'alert', severity: 'error' }));
      }
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Professional Table Header Style
  const headerSx = { 
    bgcolor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.100', 
    color: theme.palette.mode === 'dark' ? 'grey.100' : 'grey.800', 
    fontWeight: 800, 
    fontSize: '0.7rem', 
    py: 1.5,
    borderBottom: '2px solid',
    borderColor: 'divider',
    borderRight: '1px solid',
    borderRightColor: 'divider'
  };

  // Seamless Input Style (Excel-like)
  const seamlessInputSx = {
    '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
    '&:hover .MuiOutlinedInput-notchedOutline': { border: '1px solid', borderColor: 'divider' },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { border: '2px solid', borderColor: 'primary.main' },
    '& .MuiInputBase-root': { p: 0.5, fontSize: '0.75rem', borderRadius: 0, bgcolor: 'transparent' },
    '& .MuiSelect-select': { py: 0.5, px: 1, fontSize: '0.75rem' },
    '& .MuiInputBase-input': { p: 0.5, px: 1, fontSize: '0.75rem' }
  };

  return (
    <MainCard
      title={
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box sx={{ p: 1, bgcolor: 'secondary.light', borderRadius: 2, display: 'flex' }}>
             <IconFileText size={22} color={theme.palette.secondary.dark} />
          </Box>
          <Typography variant="h3" sx={{ fontWeight: 800 }}>{editId ? `Edit MOM - ${form.momNo}` : 'New Meeting Minutes'}</Typography>
        </Stack>
      }
      secondary={
        <Stack direction="row" spacing={1.5}>
          <Tooltip title={shortcutTooltip('Back', 'Esc')}>
            <Button variant="outlined" color="error" startIcon={<IconArrowLeft size={18} />} onClick={() => navigate('/qms/minutesofmeeting')} sx={btnCancel}>Back</Button>
          </Tooltip>
          {canSave && (
            <>
              <Tooltip title={shortcutTooltip('Clear Form', 'Ctrl + Backspace')}>
                <Button variant="outlined" color="primary" startIcon={<IconEraser size={18} />} onClick={() => setForm(INITIAL_FORM)} sx={btnClear}>Clear</Button>
              </Tooltip>
              <Tooltip title={shortcutTooltip('Save', 'Ctrl + S')}>
                <Button variant="contained" color="secondary" startIcon={<IconDeviceFloppy size={18} />} onClick={handleSave} sx={btnSave}>Save</Button>
              </Tooltip>
            </>
          )}
        </Stack>
      }
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'stretch', flexWrap: { xs: 'wrap', md: 'nowrap' } }}>
          {/* TOP LEFT: MEETING MINUTES DETAILS */}
          <Box sx={{ flex: 4.5, minWidth: 0, display: 'flex' }}>
            <BOSFormSection 
              title="MEETING MINUTES DETAILS" 
              icon={<IconSettings size={20} />} 
              contentSx={{ p: 1 }} 
              sx={{ flex: 1, border: '1px solid', borderColor: 'divider', borderRadius: 2, bgcolor: 'background.paper' }}
            >
              <Table size="small" sx={{ '& td': { borderBottom: 'none', py: 0.2, px: 1 } }}>
                <TableBody>
                  {[
                    { label: 'Meeting Minutes No', component: <BOSTextField fullWidth value={form.momNo} onChange={(e) => {
                      const newNo = e.target.value.toUpperCase();
                      setForm({ ...form, momNo: newNo, details: syncMeetNumbers(newNo, form.details) });
                    }} disabled={!perms.write} sx={{ bgcolor: 'secondary.lighter', '& .MuiInputBase-input': { fontWeight: 800, color: 'secondary.dark', py: 0.8 } }} /> },
                    { label: 'Meeting Minutes Date', component: <BOSTextField fullWidth type="date" value={form.momDate} onChange={(e) => setForm({...form, momDate: e.target.value})} disabled={!perms.write} sx={{ bgcolor: 'secondary.lighter', '& .MuiInputBase-input': { py: 0.8 } }} /> },
                    { label: 'Meeting Schedule No', component: (
                      <Autocomplete
                        fullWidth
                        options={meetingSchedules.filter(s => s.status === 'OPEN' || s.status === 'AUTO CLOSED' || (editId && s.id === form.schedule?.id))}
                        getOptionLabel={(option) => option.scheduleNo || ''}
                        value={form.schedule}
                        onChange={(e, val) => {
                          handleScheduleChange(e, val);
                          if (errors.schedule) clearErrors('schedule');
                        }}
                        disabled={!perms.write}
                        renderInput={(params) => <BOSTextField {...params} placeholder="Select Schedule" required error={!!errors.schedule} sx={{ '& .MuiInputBase-root': { py: 0 } }} />}
                      />
                    ) },
                    { label: 'Meeting Agenda', component: <BOSTextField fullWidth name="agenda" value={form.agenda} onChange={(e) => handleInputChange(e, setForm)} multiline rows={2} placeholder="Enter Agenda..." disabled={!perms.write} sx={{ '& .MuiInputBase-root': { py: 0.5 } }} /> },
                    { label: 'Chaired By', component: (
                      <Autocomplete
                        fullWidth
                        options={employees}
                        getOptionLabel={(option) => option.employeeName || ''}
                        value={form.chairedBy}
                        onChange={(e, val) => {
                          setForm({...form, chairedBy: val});
                          if (errors.chairedBy) clearErrors('chairedBy');
                        }}
                        disabled={!perms.write}
                        renderInput={(params) => <BOSTextField {...params} placeholder="Select Chaired By" sx={{ '& .MuiInputBase-root': { py: 0 } }} />}
                      />
                    ) },
                    { label: 'Meeting Start Time', component: <BOSTextField fullWidth type="time" value={form.startTime} onChange={(e) => setForm({...form, startTime: e.target.value})} placeholder="" disabled={!perms.write} InputLabelProps={{ shrink: true }} sx={{ '& .MuiInputBase-input': { py: 0.8 } }} /> },
                    { label: 'Meeting End Time', component: <BOSTextField fullWidth type="time" value={form.endTime} onChange={(e) => setForm({...form, endTime: e.target.value})} placeholder="" disabled={!perms.write} InputLabelProps={{ shrink: true }} sx={{ '& .MuiInputBase-input': { py: 0.8 } }} /> }
                  ].map((row, idx) => (
                    <TableRow key={idx}>
                      <TableCell sx={{ width: '150px', whiteSpace: 'nowrap' }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.secondary', fontSize: '0.72rem' }}>{row.label}</Typography>
                      </TableCell>
                      <TableCell>
                        {row.component}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </BOSFormSection>
          </Box>

          {/* TOP RIGHT: ATTENDANCE DETAILS */}
          <Box sx={{ flex: 7.5, minWidth: 0, display: 'flex' }}>
            <BOSFormSection 
              title="ATTENDANCE DETAILS" 
              icon={<IconUsers size={20} />} 
              contentSx={{ p: 1 }}
              sx={{ flex: 1, border: '1px solid', borderColor: 'divider', borderRadius: 2, bgcolor: 'background.paper' }}
            >
              <TableContainer component={Paper} elevation={0} sx={{ mt: 0, height: 380, borderRadius: 2, border: '1px solid', borderColor: 'divider', overflow: 'auto' }}>
                <Table stickyHeader size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ bgcolor: 'primary.lighter', fontWeight: 800, color: 'primary.dark', py: 1, fontSize: '0.65rem', width: 60 }}>Si No</TableCell>
                      <TableCell sx={{ bgcolor: 'primary.lighter', fontWeight: 800, color: 'primary.dark', py: 1, fontSize: '0.65rem', width: 80 }}>Dept</TableCell>
                      <TableCell sx={{ bgcolor: 'primary.lighter', fontWeight: 800, color: 'primary.dark', py: 1, fontSize: '0.65rem' }}>Name</TableCell>
                      <TableCell sx={{ bgcolor: 'primary.lighter', fontWeight: 800, color: 'primary.dark', py: 1, fontSize: '0.65rem', width: 110 }}>In Time</TableCell>
                      <TableCell sx={{ bgcolor: 'primary.lighter', fontWeight: 800, color: 'primary.dark', py: 1, fontSize: '0.65rem', width: 110 }}>Out Time</TableCell>
                      <TableCell sx={{ bgcolor: 'primary.lighter', fontWeight: 800, color: 'primary.dark', py: 1, fontSize: '0.65rem', width: 100 }}>Status</TableCell>
                      <TableCell sx={{ bgcolor: 'primary.lighter', fontWeight: 800, color: 'primary.dark', py: 1, fontSize: '0.65rem', width: 50 }}></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {form.attendanceList.length === 0 ? (
                      <TableRow><TableCell colSpan={7} align="center" sx={{ py: 12, fontStyle: 'italic', color: 'text.secondary', fontSize: '0.75rem' }}>Select a schedule to load attendance</TableCell></TableRow>
                    ) : (
                      form.attendanceList.map((att, idx) => (
                        <TableRow key={idx} sx={{ '&:hover': { bgcolor: 'primary.lighter' }, transition: 'background 0.2s' }}>
                          <TableCell align="center" sx={{ fontSize: '0.7rem' }}>{idx + 1}</TableCell>
                          <TableCell sx={{ fontSize: '0.55rem', fontWeight: 800, color: 'text.secondary' }}>{(att.employee?.department?.departmentName || 'N/A').toUpperCase()}</TableCell>
                          <TableCell sx={{ 
                            fontWeight: 800, 
                            fontSize: '0.65rem', 
                            color: att.employee?.id === form.schedule?.hostBy?.id ? 'error.main' : (att.attendanceStatus === 'Absent' ? 'error.light' : 'text.primary') 
                          }}>
                            {att.employee?.employeeName?.toUpperCase()}
                            {att.employee?.id === form.schedule?.hostBy?.id && " (HOST)"}
                          </TableCell>
                          <TableCell>
                            <BOSTextField 
                              type={att.attendanceStatus === 'ABSENT' ? 'text' : 'time'} 
                              size="small" 
                              value={att.attendanceStatus === 'ABSENT' ? '' : att.inTime} 
                              disabled
                              placeholder="" 
                              InputLabelProps={{ shrink: true }} 
                              sx={{ '& .MuiInputBase-input': { p: 0.5, fontSize: '0.7rem' }, bgcolor: 'grey.50' }} 
                            />
                          </TableCell>
                          <TableCell>
                            <BOSTextField 
                              type={att.attendanceStatus === 'ABSENT' ? 'text' : 'time'} 
                              size="small" 
                              value={att.attendanceStatus === 'ABSENT' ? '' : att.outTime} 
                              onChange={(e) => {
                                const list = [...form.attendanceList];
                                list[idx].outTime = e.target.value;
                                setForm({...form, attendanceList: list});
                              }} 
                              disabled={!canEditOutTime || att.attendanceStatus === 'Absent' || att.attendanceStatus === 'ABSENT'}
                              placeholder="" 
                              InputLabelProps={{ shrink: true }} 
                              sx={{ 
                                '& .MuiInputBase-input': { p: 0.5, fontSize: '0.7rem' },
                                bgcolor: (!canEditOutTime || att.attendanceStatus === 'Absent' || att.attendanceStatus === 'ABSENT') ? 'grey.50' : 'inherit'
                              }} 
                            />
                          </TableCell>
                          <TableCell>
                            <BOSTextField 
                              select 
                              size="small" 
                              value={att.attendanceStatus} 
                              disabled
                              sx={{ 
                                '& .MuiSelect-select': { 
                                  bgcolor: att.attendanceStatus === 'LATE' ? 'warning.lighter' : (att.attendanceStatus === 'PRESENT' ? 'success.lighter' : 'error.lighter'),
                                  color: att.attendanceStatus === 'LATE' ? 'warning.dark' : (att.attendanceStatus === 'PRESENT' ? 'success.dark' : 'error.dark'),
                                  fontWeight: 900,
                                  fontSize: '0.55rem',
                                  textAlign: 'center',
                                  py: 0.3,
                                  borderRadius: 1,
                                  minWidth: '60px'
                                } 
                              }}
                            >
                              <MenuItem value="PRESENT">PRESENT</MenuItem>
                              <MenuItem value="LATE">LATE</MenuItem>
                              <MenuItem value="ABSENT">ABSENT</MenuItem>
                            </BOSTextField>
                          </TableCell>
                          <TableCell>
                            {canSave && (
                              <IconButton 
                                size="small" 
                                color="success" 
                                onClick={handleSave}
                                sx={{ bgcolor: 'success.lighter', '&:hover': { bgcolor: 'success.main', color: 'white' }, p: 0.3 }}
                              >
                                <IconSave size={10} />
                              </IconButton>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              <Box sx={{ mt: 1, textAlign: 'center', p: 0.5, bgcolor: 'error.lighter', borderRadius: 1.5 }}>
                 <Typography variant="caption" color="error.dark" fontWeight={800} sx={{ fontSize: '0.6rem' }}>*** Note: Please enter the host's outTime first before proceeding ***</Typography>
              </Box>
            </BOSFormSection>
          </Box>
        </Box>

        {/* BOTTOM: DISCUSSION POINTS */}
        <Box>
          <BOSFormSection 
            title="DISCUSSION & ACTION POINTS" 
            icon={<IconMessageDots size={20} />}
            contentSx={{ p: 0 }}
          >
            <TableContainer component={Paper} elevation={0} sx={{ border: 'none', borderRadius: 2, overflow: 'auto', maxHeight: 600 }}>
              <Table stickyHeader size="small" sx={{ tableLayout: 'fixed', minWidth: 1890, '& td, & th': { borderRight: '1px solid', borderColor: 'divider', verticalAlign: 'middle' } }}>
                <TableHead>
                  <TableRow>
                    {/* Action Left (Add/Edit) */}
                    <TableCell sx={{ ...headerSx, width: 60, textAlign: 'center', zIndex: 12, left: 0, position: 'sticky' }}>
                      {perms.write && (
                        <Tooltip title="Add New Row" placement="top" arrow>
                          <IconButton 
                            size="small" 
                            color="primary" 
                            onClick={() => handleOpenDetailDialog(null)}
                            sx={{ bgcolor: 'primary.lighter', '&:hover': { bgcolor: 'primary.main', color: 'white' } }}
                          >
                            <IconPlus size={16} />
                          </IconButton>
                        </Tooltip>
                      )}
                    </TableCell>
                    {/* Sticky Sl No Header */}
                    <TableCell sx={{ ...headerSx, width: 50, textAlign: 'center' }}>Sl No</TableCell>
                    <TableCell sx={{ ...headerSx, width: 160 }}>Min No</TableCell>
                    <TableCell sx={{ ...headerSx, width: 160 }}>Amend Min No</TableCell>
                    <TableCell sx={{ ...headerSx, width: 400 }}>Discussed Point</TableCell>
                    <TableCell sx={{ ...headerSx, width: 80 }}>Type</TableCell>
                    <TableCell sx={{ ...headerSx, width: 200 }}>Material List</TableCell>
                    <TableCell sx={{ ...headerSx, width: 90, textAlign: 'center' }}>Process</TableCell>
                    <TableCell sx={{ ...headerSx, width: 130 }}>Assigned To</TableCell>
                    <TableCell sx={{ ...headerSx, width: 130 }}>Assigned By</TableCell>
                    <TableCell sx={{ ...headerSx, width: 110 }}>Target Date</TableCell>
                    <TableCell sx={{ ...headerSx, width: 110 }}>Review Date</TableCell>
                    <TableCell sx={{ ...headerSx, width: 110, textAlign: 'center' }}>Attachment Req</TableCell>
                    <TableCell sx={{ ...headerSx, width: 90, textAlign: 'center', zIndex: 12, right: 0, position: 'sticky', borderRight: 'none' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {form.details.map((det, idx) => (
                    <TableRow key={idx} sx={{ '&:nth-of-type(odd)': { bgcolor: 'grey.50' }, '&:hover': { bgcolor: 'primary.lighter' } }}>
                      {/* Action Left: Edit Icon */}
                      <TableCell sx={{ position: 'sticky', left: 0, bgcolor: 'inherit', zIndex: 10, textAlign: 'center' }}>
                        {perms.write ? (
                          <Tooltip title="Edit Row" placement="top" arrow>
                            <IconButton 
                              size="small" 
                              color="secondary" 
                              onClick={() => handleOpenDetailDialog(idx)}
                              sx={{ bgcolor: 'secondary.lighter', '&:hover': { bgcolor: 'secondary.main', color: 'white' } }}
                            >
                              <IconEdit size={14} />
                            </IconButton>
                          </Tooltip>
                        ) : '-'}
                      </TableCell>

                      {/* Sticky Sl No Body */}
                      <TableCell align="center" sx={{ fontSize: '0.75rem', fontWeight: 800 }}>
                        {form.details.length - idx}
                      </TableCell>
                      
                      {/* References */}
                      <TableCell sx={{ fontSize: '0.75rem', fontWeight: 700, color: 'text.secondary', px: 1 }}>
                        {det.meetNo || '-'}
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.75rem', fontWeight: 700, color: 'text.secondary', px: 1 }}>
                        {det.amendMeetNo || '-'}
                      </TableCell>
                      
                      {/* Discussed Point (Truncated, Clickable) */}
                      <TableCell 
                        onClick={() => perms.write && handleOpenDetailDialog(idx)}
                        sx={{ 
                          p: 1.5, 
                          cursor: perms.write ? 'pointer' : 'default',
                          '&:hover': perms.write ? { bgcolor: 'action.hover' } : {}
                        }}
                      >
                        <Tooltip title={perms.write ? "Click to Edit" : ""} placement="top" arrow>
                          <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between" sx={{ width: '100%' }}>
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                fontSize: '0.75rem', 
                                wordBreak: 'break-word',
                                color: det.discussedPoint ? 'text.primary' : 'text.disabled',
                                fontStyle: det.discussedPoint ? 'normal' : 'italic',
                                fontWeight: 500,
                                pr: 1
                              }}
                            >
                              {det.discussedPoint 
                                ? (det.discussedPoint.length > 120 
                                    ? `${det.discussedPoint.substring(0, 120)}...` 
                                    : det.discussedPoint) 
                                : 'Click to enter discussed point...'}
                            </Typography>
                          </Stack>
                        </Tooltip>
                      </TableCell>
                      
                      {/* Details */}
                      <TableCell sx={{ fontSize: '0.75rem', px: 1 }}>
                        {det.type || '-'}
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.75rem', px: 1, color: 'text.secondary' }}>
                        {det.materialList || '-'}
                      </TableCell>
                      
                      {/* Responsibility */}
                      <TableCell align="center">
                        <Chip 
                          label={det.processType || 'INFO'} 
                          size="small" 
                          sx={{ 
                            fontSize: '0.65rem', 
                            fontWeight: 800,
                            bgcolor: det.processType === 'ACTION' ? 'secondary.lighter' : 'primary.lighter',
                            color: det.processType === 'ACTION' ? 'secondary.dark' : 'primary.dark',
                            border: '1px solid',
                            borderColor: det.processType === 'ACTION' ? 'secondary.main' : 'primary.main'
                          }} 
                        />
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.75rem', px: 1 }}>
                        {det.assignedTo?.employeeName || '-'}
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.75rem', px: 1 }}>
                        {det.assignedBy?.employeeName || '-'}
                      </TableCell>
                      
                      {/* Timeline */}
                      <TableCell sx={{ fontSize: '0.75rem', px: 1 }}>
                        {det.targetDate ? det.targetDate.split('-').reverse().join('/') : '-'}
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.75rem', px: 1 }}>
                        {det.reviewDate ? det.reviewDate.split('-').reverse().join('/') : '-'}
                      </TableCell>
                      
                      {/* Closure */}
                      <TableCell align="center" sx={{ fontSize: '0.75rem', px: 1 }}>
                        {det.attachmentRequired || 'NO'}
                      </TableCell>
                      
                      {/* Sticky Actions Body */}
                      <TableCell sx={{ position: 'sticky', right: 0, bgcolor: 'inherit', zIndex: 10, borderRight: 'none', textAlign: 'center' }}>
                        {perms.write ? (
                          <Stack direction="row" spacing={0.5} justifyContent="center">
                            <Tooltip title={det.isAmended ? "Revert Amendment" : "Mark as Amendment"}>
                              <IconButton size="small" color={det.isAmended ? "warning" : "primary"} onClick={() => toggleAmendment(idx)} sx={{ bgcolor: det.isAmended ? 'warning.lighter' : 'primary.lighter' }}>
                                <IconEdit size={16} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete Row">
                              <IconButton size="small" color="error" onClick={() => removeDetailRow(idx)} disabled={form.details.length === 1} sx={{ bgcolor: 'error.lighter' }}><IconTrash size={16} /></IconButton>
                            </Tooltip>
                          </Stack>
                        ) : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            {perms.write && (
              <Box sx={{ mt: 1.5, mb: 1.5, mr: 2, display: 'flex', justifyContent: 'flex-end' }}>
                 <Button 
                  variant="contained" 
                  color="primary" 
                  startIcon={<IconPlus size={18} />} 
                  onClick={() => handleOpenDetailDialog(null)} 
                  sx={{ px: 3, fontWeight: 800, borderRadius: '8px' }}
                 >
                   Add Row
                 </Button>
              </Box>
            )}
          </BOSFormSection>
        </Box>
      </Box>

      {/* Material Selection Popup */}
      <MaterialSelectionDialog
        open={materialDialog.open}
        type={materialDialog.type}
        onClose={() => setMaterialDialog({ open: false, rowIdx: null, type: 'RM' })}
        onSelect={handleSelectMaterial}
      />

      {/* Detail Add/Edit Dialog */}
      <BOSFormDialog
        open={detailDialog.open}
        onClose={() => setDetailDialog({ open: false, rowIdx: null, form: {
          meetNo: '',
          amendMeetNo: '',
          discussedPoint: '',
          type: 'RM',
          materialList: '',
          processType: 'INFO',
          assignedBy: null,
          assignedTo: null,
          targetDate: '',
          reviewDate: '',
          attachmentRequired: 'NO',
          status: 'CLOSED',
          isAmended: false
        } })}
        onSave={handleSaveDetailDialog}
        title={detailDialog.rowIdx === null ? "Add Discussion & Action Point" : "Edit Discussion & Action Point"}
        maxWidth="md"
      >
        {detailDialog.form && (
          <Stack spacing={3} sx={{ mt: 1 }}>
            {/* Header Readonly Info */}
            <Box sx={{ p: 2, bgcolor: 'primary.lighter', borderRadius: 2, border: '1px solid', borderColor: 'primary.light' }}>
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <Typography variant="caption" color="text.secondary">Minutes Number</Typography>
                  <Typography variant="subtitle1" fontWeight={800} color="primary.main">{detailDialog.form.meetNo || 'Auto-generated'}</Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="caption" color="text.secondary">Amend Minutes Number</Typography>
                  <Typography variant="subtitle1" fontWeight={800}>{detailDialog.form.amendMeetNo || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="caption" color="text.secondary">Status</Typography>
                  <Typography variant="subtitle1" fontWeight={800} color={detailDialog.form.status === 'OPEN' ? 'error.main' : 'success.main'}>
                    {detailDialog.form.status}
                  </Typography>
                </Grid>
              </Grid>
            </Box>

            {/* Discussed Point */}
            <BOSTextField
              fullWidth
              multiline
              rows={4}
              label="Discussed Point *"
              value={detailDialog.form.discussedPoint}
              onChange={(e) => setDetailDialog(prev => ({
                ...prev,
                form: { ...prev.form, discussedPoint: e.target.value.toUpperCase() }
              }))}
              placeholder="Type discussed points here..."
              required
              helperText={
                <Stack direction="row" justifyContent="space-between" sx={{ mt: 0.5 }}>
                  <Typography variant="caption" color={
                    detailDialog.form.discussedPoint.length < (
                      detailDialog.form.attachmentRequired === 'YES' ? 50 : 150
                    ) ? 'error.main' : 'success.main'
                  } sx={{ fontWeight: 'bold' }}>
                    {detailDialog.form.discussedPoint.length < (
                      detailDialog.form.attachmentRequired === 'YES' ? 50 : 150
                    ) 
                      ? `⚠️ Below minimum characters required (${detailDialog.form.discussedPoint.length} / ${
                          detailDialog.form.attachmentRequired === 'YES' ? 50 : 150
                        })` 
                      : `✅ Valid length (${detailDialog.form.discussedPoint.length} characters)`
                    }
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Length: {detailDialog.form.discussedPoint.length} characters
                  </Typography>
                </Stack>
              }
            />

            <Grid container spacing={2}>
              {/* Type */}
              <Grid item xs={6}>
                <BOSTextField
                  select
                  fullWidth
                  label="Type"
                  value={detailDialog.form.type}
                  onChange={(e) => setDetailDialog(prev => ({
                    ...prev,
                    form: { ...prev.form, type: e.target.value }
                  }))}
                >
                  <MenuItem value="RM">RM</MenuItem>
                  <MenuItem value="PRODUCT">PRODUCT</MenuItem>
                </BOSTextField>
              </Grid>

              {/* Material List */}
              <Grid item xs={6}>
                <BOSTextField
                  fullWidth
                  label="Material List"
                  value={detailDialog.form.materialList}
                  placeholder="Click to select material..."
                  onClick={() => perms.write && setMaterialDialog({ open: true, rowIdx: 'dialog', type: detailDialog.form.type || 'RM' })}
                  InputProps={{ 
                    readOnly: true,
                    sx: { cursor: perms.write ? 'pointer' : 'default' }
                  }}
                />
              </Grid>

              {/* Process */}
              <Grid item xs={4}>
                <BOSTextField
                  select
                  fullWidth
                  label="Process"
                  value={detailDialog.form.processType}
                  onChange={(e) => {
                    const val = e.target.value;
                    setDetailDialog(prev => ({
                      ...prev,
                      form: {
                        ...prev.form,
                        processType: val,
                        status: val === 'INFO' ? 'CLOSED' : 'OPEN'
                      }
                    }));
                  }}
                >
                  <MenuItem value="INFO">INFO</MenuItem>
                  <MenuItem value="ACTION">ACTION</MenuItem>
                </BOSTextField>
              </Grid>

              {/* Assigned To */}
              <Grid item xs={4}>
                <Autocomplete
                  options={meetingUsers}
                  getOptionLabel={(option) => option.employeeName || ''}
                  isOptionEqualToValue={(opt, val) => opt.id === val?.id}
                  value={detailDialog.form.assignedTo}
                  onChange={(e, val) => setDetailDialog(prev => ({
                    ...prev,
                    form: { ...prev.form, assignedTo: val }
                  }))}
                  disabled={detailDialog.form.processType === 'INFO'}
                  renderInput={(params) => <BOSTextField {...params} label="Assigned To" placeholder={detailDialog.form.processType === 'INFO' ? "N/A" : "Select Assignee"} />}
                />
              </Grid>

              {/* Assigned By */}
              <Grid item xs={4}>
                <Autocomplete
                  options={meetingUsers}
                  getOptionLabel={(option) => option.employeeName || ''}
                  isOptionEqualToValue={(opt, val) => opt.id === val?.id}
                  value={detailDialog.form.assignedBy}
                  onChange={(e, val) => setDetailDialog(prev => ({
                    ...prev,
                    form: { ...prev.form, assignedBy: val }
                  }))}
                  disabled={detailDialog.form.processType === 'INFO'}
                  renderInput={(params) => <BOSTextField {...params} label="Assigned By" placeholder={detailDialog.form.processType === 'INFO' ? "N/A" : "Select Assignor"} />}
                />
              </Grid>

              {/* Target Date */}
              <Grid item xs={4}>
                <BOSTextField
                  type="date"
                  fullWidth
                  label="Target Date"
                  value={detailDialog.form.targetDate}
                  onChange={(e) => setDetailDialog(prev => ({
                    ...prev,
                    form: { ...prev.form, targetDate: e.target.value }
                  }))}
                  disabled={detailDialog.form.processType === 'INFO'}
                  inputProps={{ min: TODAY }}
                  error={isSunday(detailDialog.form.targetDate) || (detailDialog.form.targetDate && detailDialog.form.targetDate < TODAY)}
                  helperText={isSunday(detailDialog.form.targetDate) ? 'Sunday!' : (detailDialog.form.targetDate && detailDialog.form.targetDate < TODAY ? 'Past Date!' : '')}
                />
              </Grid>

              {/* Review Date */}
              <Grid item xs={4}>
                <BOSTextField
                  type="date"
                  fullWidth
                  label="Review Date"
                  value={detailDialog.form.reviewDate}
                  onChange={(e) => setDetailDialog(prev => ({
                    ...prev,
                    form: { ...prev.form, reviewDate: e.target.value }
                  }))}
                  disabled={detailDialog.form.processType === 'INFO'}
                  inputProps={{ min: detailDialog.form.targetDate || TODAY }}
                  error={(detailDialog.form.reviewDate && detailDialog.form.targetDate && detailDialog.form.reviewDate < detailDialog.form.targetDate) || (detailDialog.form.reviewDate && detailDialog.form.reviewDate < TODAY)}
                  helperText={detailDialog.form.reviewDate && detailDialog.form.reviewDate < TODAY ? 'Past Date!' : ''}
                />
              </Grid>

              {/* Attachment Required */}
              <Grid item xs={4}>
                <BOSTextField
                  select
                  fullWidth
                  label="Attachment Req"
                  value={detailDialog.form.attachmentRequired}
                  onChange={(e) => setDetailDialog(prev => ({
                    ...prev,
                    form: { ...prev.form, attachmentRequired: e.target.value }
                  }))}
                  disabled={detailDialog.form.processType === 'INFO'}
                >
                  <MenuItem value="YES">YES</MenuItem>
                  <MenuItem value="NO">NO</MenuItem>
                </BOSTextField>
              </Grid>
            </Grid>
          </Stack>
        )}
      </BOSFormDialog>
    </MainCard>
  );
}


