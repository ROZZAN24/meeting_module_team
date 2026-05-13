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
  Divider
} from '@mui/material';
import {
  BOSFormSection,
  BOSTextField,
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
import { useLookups } from 'hooks/useLookups';
import useKeyboardShortcuts, { shortcutTooltip } from 'hooks/useKeyboardShortcuts';
import { openSnackbar } from 'store/slices/snackbar';
import axios from 'utils/axios';
import { API_PATHS } from 'utils/api-constants';
import MaterialSelectionDialog from './MaterialSelectionDialog';

// Format: MM/CCRM/2026-2027/016
const DEFAULT_MOM_NO = 'MM/CCRM/2026-2027/016';
const TODAY = new Date().toISOString().split('T')[0];

const INITIAL_FORM = {
  momNo: DEFAULT_MOM_NO,
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
  const { errors, validate, clearErrors } = useBOSValidation();
  const [form, setForm] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [materialDialog, setMaterialDialog] = useState({ open: false, rowIdx: null, type: 'RM' });

  // Keyboard Shortcuts
  useKeyboardShortcuts({
    'ctrl+s': (e) => { e.preventDefault(); handleSave(); },
    'ctrl+backspace': (e) => { e.preventDefault(); setForm(INITIAL_FORM); },
    'escape': (e) => { e.preventDefault(); navigate('/qms/minutesofmeeting'); }
  }, true);

  // Helper to re-index all meet numbers and amendments in the table
  const syncMeetNumbers = useCallback((momNo, details) => {
    return details.map((idx_d, idx) => {
      const meetNo = `${momNo}/${String(idx + 1).padStart(3, '0')}`;
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
      if (data.momDate) data.momDate = data.momDate.split('T')[0];
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
            inTime: record.inTime || val.startTime || '09:00',
            outTime: record.outTime || val.endTime || '10:00',
            attendanceStatus: record.attendanceStatus || 'Present'
          };
        } else {
          // No attendance posted -> ABSENT
          return {
            employee: p.employee,
            inTime: '',
            outTime: '',
            attendanceStatus: 'Absent'
          };
        }
      });

      setForm(p => ({
        ...p,
        schedule: val,
        agenda: val.agenda || '',
        chairedBy: val.chairedBy,
        startTime: val.startTime || '09:00',
        endTime: val.endTime || '10:00',
        attendanceList: participants
      }));
    } catch (error) {
      console.error('Failed to fetch attendance:', error);
      dispatch(openSnackbar({ open: true, message: 'Failed to load actual attendance records', variant: 'alert', severity: 'warning' }));
      
      // Fallback: Use participants from schedule but mark as Absent by default
      const fallbackParticipants = (val.participants || []).map(p => ({
        employee: p.employee,
        inTime: '',
        outTime: '',
        attendanceStatus: 'Absent'
      }));
      
      setForm(p => ({
        ...p,
        schedule: val,
        agenda: val.agenda || '',
        chairedBy: val.chairedBy,
        startTime: val.startTime || '09:00',
        endTime: val.endTime || '10:00',
        attendanceList: fallbackParticipants
      }));
    } finally {
      setLoading(false);
    }
  };

  const addDetailRow = () => {
    const newDetails = [...form.details, { ...INITIAL_FORM.details[0] }];
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
        const payload = {
          ...form,
          details: form.details.map(d => ({
            ...d,
            targetDate: d.targetDate || null,
            reviewDate: d.reviewDate || null
          }))
        };

        if (editId) {
          await axios.put(`${API_PATHS.QMS.MOMS}/${editId}`, payload);
          dispatch(openSnackbar({ open: true, message: 'Meeting Minutes updated Successfully...', variant: 'alert', severity: 'success' }));
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
          <Tooltip title={shortcutTooltip('Save Master', 'Ctrl + S')}>
            <Button variant="contained" color="secondary" startIcon={<IconDeviceFloppy size={18} />} onClick={handleSave} sx={btnSave}>Save Master</Button>
          </Tooltip>
          <Tooltip title={shortcutTooltip('Clear Form', 'Ctrl + Backspace')}>
            <Button variant="outlined" color="primary" startIcon={<IconEraser size={18} />} onClick={() => setForm(INITIAL_FORM)} sx={btnClear}>Clear</Button>
          </Tooltip>
          <Tooltip title={shortcutTooltip('Back', 'Esc')}>
            <Button variant="outlined" color="error" startIcon={<IconArrowLeft size={18} />} onClick={() => navigate('/qms/minutesofmeeting')} sx={btnCancel}>Back</Button>
          </Tooltip>
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
                    }} sx={{ bgcolor: 'secondary.lighter', '& .MuiInputBase-input': { fontWeight: 800, color: 'secondary.dark', py: 0.8 } }} /> },
                    { label: 'Meeting Minutes Date', component: <BOSTextField fullWidth type="date" value={form.momDate} onChange={(e) => setForm({...form, momDate: e.target.value})} sx={{ bgcolor: 'secondary.lighter', '& .MuiInputBase-input': { py: 0.8 } }} /> },
                    { label: 'Meeting Schedule No', component: (
                      <Autocomplete
                        fullWidth
                        options={meetingSchedules.filter(s => s.status === 'OPEN' || (editId && s.id === form.schedule?.id))}
                        getOptionLabel={(option) => option.scheduleNo || ''}
                        value={form.schedule}
                        onChange={handleScheduleChange}
                        renderInput={(params) => <BOSTextField {...params} placeholder="Select Schedule" required error={!!errors.schedule} sx={{ '& .MuiInputBase-root': { py: 0 } }} />}
                      />
                    ) },
                    { label: 'Meeting Agenda', component: <BOSTextField fullWidth value={form.agenda} onChange={(e) => setForm({...form, agenda: e.target.value})} multiline rows={2} placeholder="Enter Agenda..." sx={{ '& .MuiInputBase-root': { py: 0.5 } }} /> },
                    { label: 'Chaired By', component: (
                      <Autocomplete
                        fullWidth
                        options={employees}
                        getOptionLabel={(option) => option.employeeName || ''}
                        value={form.chairedBy}
                        onChange={(e, val) => setForm({...form, chairedBy: val})}
                        renderInput={(params) => <BOSTextField {...params} placeholder="Select Chaired By" sx={{ '& .MuiInputBase-root': { py: 0 } }} />}
                      />
                    ) },
                    { label: 'Meeting Start Time', component: <BOSTextField fullWidth type="time" value={form.startTime} onChange={(e) => setForm({...form, startTime: e.target.value})} placeholder="" InputLabelProps={{ shrink: true }} sx={{ '& .MuiInputBase-input': { py: 0.8 } }} /> },
                    { label: 'Meeting End Time', component: <BOSTextField fullWidth type="time" value={form.endTime} onChange={(e) => setForm({...form, endTime: e.target.value})} placeholder="" InputLabelProps={{ shrink: true }} sx={{ '& .MuiInputBase-input': { py: 0.8 } }} /> }
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
                            color: att.employee?.id === form.schedule?.host?.id ? 'error.main' : (att.attendanceStatus === 'Absent' ? 'error.light' : 'text.primary') 
                          }}>
                            {att.employee?.employeeName?.toUpperCase()}
                            {att.employee?.id === form.schedule?.host?.id && " (HOST)"}
                          </TableCell>
                          <TableCell>
                            <BOSTextField 
                              type={att.attendanceStatus === 'Absent' ? 'text' : 'time'} 
                              size="small" 
                              value={att.attendanceStatus === 'Absent' ? '' : att.inTime} 
                              onChange={(e) => {
                                const list = [...form.attendanceList];
                                list[idx].inTime = e.target.value;
                                setForm({...form, attendanceList: list});
                              }} 
                              placeholder="" 
                              InputLabelProps={{ shrink: true }} 
                              sx={{ '& .MuiInputBase-input': { p: 0.5, fontSize: '0.7rem' } }} 
                            />
                          </TableCell>
                          <TableCell>
                            <BOSTextField 
                              type={att.attendanceStatus === 'Absent' ? 'text' : 'time'} 
                              size="small" 
                              value={att.attendanceStatus === 'Absent' ? '' : att.outTime} 
                              onChange={(e) => {
                                const list = [...form.attendanceList];
                                list[idx].outTime = e.target.value;
                                setForm({...form, attendanceList: list});
                              }} 
                              placeholder="" 
                              InputLabelProps={{ shrink: true }} 
                              sx={{ '& .MuiInputBase-input': { p: 0.5, fontSize: '0.7rem' } }} 
                            />
                          </TableCell>
                          <TableCell>
                            <BOSTextField 
                              select 
                              size="small" 
                              value={att.attendanceStatus} 
                              onChange={(e) => {
                                const list = [...form.attendanceList];
                                list[idx].attendanceStatus = e.target.value;
                                setForm({...form, attendanceList: list});
                              }}
                              sx={{ 
                                '& .MuiSelect-select': { 
                                  bgcolor: att.attendanceStatus === 'LATE' ? 'warning.lighter' : (att.attendanceStatus === 'Present' ? 'success.lighter' : 'error.lighter'),
                                  color: att.attendanceStatus === 'LATE' ? 'warning.dark' : (att.attendanceStatus === 'Present' ? 'success.dark' : 'error.dark'),
                                  fontWeight: 900,
                                  fontSize: '0.55rem',
                                  textAlign: 'center',
                                  py: 0.3,
                                  borderRadius: 1,
                                  minWidth: '60px'
                                } 
                              }}
                            >
                              <MenuItem value="Present">PRESENT</MenuItem>
                              <MenuItem value="LATE">LATE</MenuItem>
                              <MenuItem value="Absent">ABSENT</MenuItem>
                            </BOSTextField>
                          </TableCell>
                          <TableCell>
                            <IconButton size="small" color="success" sx={{ bgcolor: 'success.lighter', '&:hover': { bgcolor: 'success.main', color: 'white' }, p: 0.3 }}>
                              <IconSave size={10} />
                            </IconButton>
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
            {(() => {
              const meetingUsers = form.attendanceList
                .filter(a => a.attendanceStatus !== 'Absent')
                .map(a => a.employee || a)
                .filter(emp => emp && emp.id);
              return (
                <TableContainer component={Paper} elevation={0} sx={{ border: 'none', borderRadius: 2, overflow: 'auto', maxHeight: 600 }}>
              <Table stickyHeader size="small" sx={{ tableLayout: 'fixed', minWidth: 2600, '& td, & th': { borderRight: '1px solid', borderColor: 'divider', verticalAlign: 'top' } }}>
                <TableHead>
                  <TableRow>
                    {/* Sticky Sl No Header */}
                    <TableCell sx={{ ...headerSx, width: 50, textAlign: 'center', zIndex: 12, left: 0, position: 'sticky' }}>Sl No</TableCell>
                    <TableCell sx={{ ...headerSx, width: 160 }}>Meet No</TableCell>
                    <TableCell sx={{ ...headerSx, width: 160 }}>Amend Meet No</TableCell>
                    <TableCell sx={{ ...headerSx, width: 450 }}>Discussed Point</TableCell>
                    <TableCell sx={{ ...headerSx, width: 130 }}>Type</TableCell>
                    <TableCell sx={{ ...headerSx, width: 250 }}>Material List</TableCell>
                    <TableCell sx={{ ...headerSx, width: 120 }}>Process</TableCell>
                    <TableCell sx={{ ...headerSx, width: 200 }}>Assigned By</TableCell>
                    <TableCell sx={{ ...headerSx, width: 200 }}>Assigned To</TableCell>
                    <TableCell sx={{ ...headerSx, width: 130 }}>Target Date</TableCell>
                    <TableCell sx={{ ...headerSx, width: 130 }}>Review Date</TableCell>
                    <TableCell sx={{ ...headerSx, width: 120 }}>Attachment Req</TableCell>
                    <TableCell sx={{ ...headerSx, width: 130 }}>Status</TableCell>
                    <TableCell sx={{ ...headerSx, width: 110, textAlign: 'center', zIndex: 12, right: 0, position: 'sticky', borderRight: 'none' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {form.details.map((det, idx) => (
                    <TableRow key={idx} sx={{ '&:nth-of-type(odd)': { bgcolor: 'grey.50' }, '&:hover': { bgcolor: 'primary.lighter' } }}>
                      {/* Sticky Sl No Body */}
                      <TableCell align="center" sx={{ position: 'sticky', left: 0, bgcolor: 'inherit', zIndex: 10, fontSize: '0.75rem', fontWeight: 800, pt: 1.5 }}>
                        {idx + 1}
                      </TableCell>
                      
                      {/* References (AUTO GENERATED) */}
                      <TableCell sx={{ p: 0 }}>
                        <BOSTextField fullWidth value={det.meetNo} InputProps={{ readOnly: true }} sx={{ ...seamlessInputSx, '& .MuiInputBase-input': { fontWeight: 800, color: 'text.secondary', pt: 1.5 } }} />
                      </TableCell>
                      <TableCell sx={{ p: 0 }}>
                        <BOSTextField fullWidth value={det.amendMeetNo} InputProps={{ readOnly: true }} sx={{ ...seamlessInputSx, '& .MuiInputBase-input': { fontWeight: 800, color: 'text.secondary', pt: 1.5 } }} />
                      </TableCell>
                      
                      {/* Discussed Point */}
                      <TableCell sx={{ p: 0 }}>
                        <BOSTextField 
                          fullWidth 
                          multiline 
                          minRows={2}
                          maxRows={8}
                          value={det.discussedPoint} 
                          onChange={(e) => handleDetailChange(idx, 'discussedPoint', e.target.value.toUpperCase())}
                          placeholder="Enter details..."
                          sx={{ 
                            ...seamlessInputSx, 
                            '& .MuiInputBase-root': { py: 1, px: 1 },
                            '& .MuiInputBase-input': { 
                              whiteSpace: 'pre-wrap', 
                              wordBreak: 'break-word',
                              overflowX: 'hidden',
                              overflowY: 'auto'
                            } 
                          }}
                        />
                      </TableCell>
                      
                      {/* Details */}
                      <TableCell sx={{ p: 0, pt: 0.5 }}>
                        <BOSTextField select value={det.type || 'RM'} onChange={(e) => handleDetailChange(idx, 'type', e.target.value)} sx={seamlessInputSx}>
                          <MenuItem value="RM">RM</MenuItem>
                          <MenuItem value="PRODUCT">PRODUCT</MenuItem>
                        </BOSTextField>
                      </TableCell>
                      <TableCell sx={{ p: 0 }}>
                        <BOSTextField 
                          fullWidth 
                          multiline 
                          minRows={2} 
                          maxRows={4} 
                          value={det.materialList} 
                          onClick={() => setMaterialDialog({ open: true, rowIdx: idx, type: det.type || 'RM' })}
                          InputProps={{ 
                            readOnly: true,
                            sx: { cursor: 'pointer' }
                          }}
                          placeholder="Click to select..."
                          sx={{ ...seamlessInputSx, '& .MuiInputBase-root': { py: 1, px: 1 } }} 
                        />
                      </TableCell>
                      
                      {/* Responsibility */}
                      <TableCell sx={{ p: 0, pt: 0.5 }}>
                        <BOSTextField select value={det.processType} onChange={(e) => handleProcessChange(idx, e.target.value)} sx={seamlessInputSx}>
                          <MenuItem value="INFO">INFO</MenuItem>
                          <MenuItem value="ACTION">ACTION</MenuItem>
                        </BOSTextField>
                      </TableCell>
                      <TableCell sx={{ p: 0, pt: 0.5 }}>
                        <Autocomplete
                          options={meetingUsers}
                          getOptionLabel={(option) => option.employeeName || ''}
                          isOptionEqualToValue={(opt, val) => opt.id === val?.id}
                          value={det.assignedBy}
                          onChange={(e, val) => handleDetailChange(idx, 'assignedBy', val)}
                          disabled={det.processType === 'INFO'}
                          renderInput={(params) => <BOSTextField {...params} placeholder={det.processType === 'INFO' ? "N/A" : "Select Assignor"} sx={seamlessInputSx} />}
                        />
                      </TableCell>
                      <TableCell sx={{ p: 0, pt: 0.5 }}>
                        <Autocomplete
                          options={meetingUsers}
                          getOptionLabel={(option) => option.employeeName || ''}
                          isOptionEqualToValue={(opt, val) => opt.id === val?.id}
                          value={det.assignedTo}
                          onChange={(e, val) => handleDetailChange(idx, 'assignedTo', val)}
                          disabled={det.processType === 'INFO'}
                          renderInput={(params) => <BOSTextField {...params} placeholder={det.processType === 'INFO' ? "N/A" : "Select Assignee"} sx={seamlessInputSx} />}
                        />
                      </TableCell>
                      
                      {/* Timeline */}
                      <TableCell sx={{ p: 0, pt: 0.5 }}>
                        <BOSTextField 
                          type="date" 
                          value={det.targetDate} 
                          onChange={(e) => handleDetailChange(idx, 'targetDate', e.target.value)} 
                          disabled={det.processType === 'INFO'} 
                          error={isSunday(det.targetDate) || (det.targetDate && det.targetDate < TODAY)}
                          helperText={isSunday(det.targetDate) ? 'Sunday!' : (det.targetDate && det.targetDate < TODAY ? 'Past Date!' : '')}
                          inputProps={{ min: TODAY }}
                          sx={seamlessInputSx} 
                        />
                      </TableCell>
                      <TableCell sx={{ p: 0, pt: 0.5 }}>
                        <BOSTextField 
                          type="date" 
                          value={det.reviewDate} 
                          onChange={(e) => handleDetailChange(idx, 'reviewDate', e.target.value)} 
                          sx={seamlessInputSx} 
                          inputProps={{ min: det.targetDate || TODAY }}
                          error={(det.reviewDate && det.targetDate && det.reviewDate < det.targetDate) || (det.reviewDate && det.reviewDate < TODAY)}
                          helperText={det.reviewDate && det.reviewDate < TODAY ? 'Past Date!' : ''}
                        />
                      </TableCell>
                      
                      {/* Closure */}
                      <TableCell sx={{ p: 0, pt: 0.5 }}>
                        <BOSTextField select value={det.attachmentRequired} onChange={(e) => handleDetailChange(idx, 'attachmentRequired', e.target.value)} disabled={det.processType === 'INFO'} sx={seamlessInputSx}>
                          <MenuItem value="YES">YES</MenuItem>
                          <MenuItem value="NO">NO</MenuItem>
                        </BOSTextField>
                      </TableCell>
                      <TableCell sx={{ p: 0, pt: 0.5 }}>
                         <BOSTextField 
                            select 
                            value={det.status || 'OPEN'} 
                            onChange={(e) => handleDetailChange(idx, 'status', e.target.value)}
                            sx={{ 
                              ...seamlessInputSx,
                              '& .MuiSelect-select': { 
                                fontWeight: 900, 
                                color: det.status === 'CLOSED' ? 'success.dark' : (det.status === 'IN_PROGRESS' ? 'warning.dark' : 'error.dark') 
                              } 
                            }}
                          >
                            <MenuItem value="OPEN">OPEN</MenuItem>
                            <MenuItem value="IN_PROGRESS">IN PROGRESS</MenuItem>
                            <MenuItem value="CLOSED">CLOSED</MenuItem>
                         </BOSTextField>
                      </TableCell>
                      
                      {/* Sticky Actions Body */}
                      <TableCell sx={{ position: 'sticky', right: 0, bgcolor: 'inherit', zIndex: 10, borderRight: 'none', pt: 1 }}>
                        <Stack direction="row" spacing={0.5} justifyContent="center">
                          <Tooltip title={det.isAmended ? "Revert Amendment" : "Mark as Amendment"}>
                            <IconButton size="small" color={det.isAmended ? "warning" : "primary"} onClick={() => toggleAmendment(idx)} sx={{ bgcolor: det.isAmended ? 'warning.lighter' : 'primary.lighter' }}>
                              <IconEdit size={16} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Save Row">
                            <IconButton size="small" color="primary" onClick={handleSave} sx={{ bgcolor: 'primary.lighter' }}><IconCheck size={16} /></IconButton>
                          </Tooltip>
                          <Tooltip title="Delete Row">
                            <IconButton size="small" color="error" onClick={() => removeDetailRow(idx)} disabled={form.details.length === 1} sx={{ bgcolor: 'error.lighter' }}><IconTrash size={16} /></IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            );
            })()}
            <Box sx={{ mt: 1.5, mb: 1.5, mr: 2, display: 'flex', justifyContent: 'flex-end' }}>
               <Button variant="contained" color="secondary" startIcon={<IconPlus />} onClick={addDetailRow} sx={{ px: 3, fontWeight: 800 }}>+ Add</Button>
            </Box>
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
    </MainCard>
  );
}
