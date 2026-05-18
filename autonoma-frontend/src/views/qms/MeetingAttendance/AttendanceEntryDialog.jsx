import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Stack, Autocomplete, Typography, Box } from '@mui/material';
import { BOSFormDialog, BOSTextField, BOSFormSection } from 'ui-component/bos';
import { IconClock } from '@tabler/icons-react';
import useLookups from 'hooks/useLookups';
import { useDispatch } from 'react-redux';
import { openSnackbar } from 'store/slices/snackbar';
import axios from 'utils/axios';
import { API_PATHS } from 'utils/api-constants';

const formatTo12h = (time24) => {
  if (!time24) return '-';
  if (Array.isArray(time24)) {
    const [h, m] = time24;
    time24 = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }
  const [hours, minutes] = time24.split(':');
  const h = parseInt(hours, 10);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${String(h12).padStart(2, '0')}:${minutes} ${ampm}`;
};

const AttendanceEntryDialog = ({ open, item, onClose, onSave }) => {
  const dispatch = useDispatch();
  const { employees = [] } = useLookups(['EMPLOYEES']);
  const [schedules, setSchedules] = useState([]);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [attendeeName, setAttendeeName] = useState('');
  const [attendanceStatus, setAttendanceStatus] = useState('PRESENT');
  const [inTime, setInTime] = useState('');
  const [inTimeRaw, setInTimeRaw] = useState('');
  const [outTime, setOutTime] = useState('');
  const [outTimeRaw, setOutTimeRaw] = useState('');
  const [existingAttendance, setExistingAttendance] = useState([]);

  const isEdit = !!item;

  // Load eligible schedules (OPEN or RESCHEDULE, current date, within time window)
  useEffect(() => {
    if (open) {
      if (isEdit) {
        setSelectedSchedule(item.schedule);
        setAttendeeName(item.employee?.employeeName || 'N/A');
        setAttendanceStatus(item.status || 'PRESENT');
        setInTimeRaw(item.inTime);
        setInTime(formatTo12h(item.inTime));
        setOutTimeRaw(item.outTime || '');
        setOutTime(formatTo12h(item.outTime));
      } else {
        const loadSchedules = async () => {
          try {
            const response = await axios.get(API_PATHS.QMS.MEETING_SCHEDULES);
            const allSchedules = Array.isArray(response.data) ? response.data : [];
            const now = new Date();
            const today = now.toISOString().split('T')[0];

            const eligible = allSchedules.filter(s => {
              // Handle potential null/undefined status from backend just like the list page does
              const scheduleStatus = s.status || 'OPEN';
              
              // Restore strict eligibility checks
              if (scheduleStatus !== 'OPEN' && scheduleStatus !== 'RESCHEDULE') return false;
              if (s.meetingDate !== today) return false;
              if (!s.startTime) return false;
              const [h, m] = s.startTime.split(':').map(Number);
              const startMs = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m).getTime();
              
              // ── STRICT END TIME CHECK ──
              if (s.endTime) {
                const [eh, em] = s.endTime.split(':').map(Number);
                const endMs = new Date(now.getFullYear(), now.getMonth(), now.getDate(), eh, em).getTime();
                if (now.getTime() > endMs) return false;
              }
              
              const tenMinBefore = startMs - 10 * 60 * 1000;
              if (now.getTime() < tenMinBefore) return false;
              
              return true;
            });
            setSchedules(eligible);
          } catch (error) {
            console.error('Failed to load schedules:', error);
          }
        };
        loadSchedules();
        setSelectedSchedule(null);
        setInTime('');
        setInTimeRaw('');
        setAttendanceStatus('PRESENT');
        setOutTime('');
        setOutTimeRaw('');
      }
    }
  }, [open, item, isEdit]);

  // Determine attendance status based on time (Only for NEW entries)
  useEffect(() => {
    if (!isEdit && selectedSchedule && selectedSchedule.startTime) {
      const now = new Date();
      const [h, m] = selectedSchedule.startTime.split(':').map(Number);
      const startTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m);
      setAttendanceStatus(now > startTime ? 'LATE' : 'PRESENT');
      const timeStr = now.toTimeString().slice(0, 5);
      setInTimeRaw(timeStr);
      setInTime(formatTo12h(timeStr));

      // Fetch existing attendance to filter out already marked users
      axios.get(API_PATHS.QMS.MEETING_ATTENDANCE).then(res => {
        const filtered = (res.data || []).filter(a => a.schedule?.id === selectedSchedule.id);
        setExistingAttendance(filtered);
      }).catch(err => console.error('Failed to fetch attendance for filter', err));
    }
  }, [selectedSchedule, isEdit]);

  const handleSaveAction = async () => {
    if (!selectedSchedule) {
      dispatch(openSnackbar({ open: true, message: 'Please select a schedule', variant: 'alert', severity: 'warning' }));
      return;
    }

    try {
      if (isEdit) {
        // MARK OUT ACTION
        if (item.outTime) {
           dispatch(openSnackbar({ open: true, message: 'Out Time already marked', variant: 'alert', severity: 'info' }));
           onClose();
           return;
        }
        await axios.put(`${API_PATHS.QMS.MEETING_ATTENDANCE}/${item.id}/out`);
        dispatch(openSnackbar({ open: true, message: 'Out Time marked successfully', variant: 'alert', severity: 'success' }));
      } else {
        if (!attendeeName) {
          dispatch(openSnackbar({ open: true, message: 'Please select an attendee', variant: 'alert', severity: 'warning' }));
          return;
        }
        // FIND employeeId
        const selectedEmp = employees.find(e => e.employeeName === attendeeName);
        
        if (!selectedEmp) {
          dispatch(openSnackbar({ open: true, message: 'Invalid attendee selected', variant: 'alert', severity: 'error' }));
          return;
        }
        
        // MARK IN ACTION
        await axios.post(API_PATHS.QMS.MEETING_ATTENDANCE, {
          scheduleId: selectedSchedule.id,
          employeeId: selectedEmp.id,
          inTime: inTimeRaw,
          status: attendanceStatus
        });
        dispatch(openSnackbar({ open: true, message: 'Attendance marked successfully', variant: 'alert', severity: 'success' }));
      }
      onSave();
    } catch (error) {
      dispatch(openSnackbar({ open: true, message: error.response?.data?.message || 'Action failed', variant: 'alert', severity: 'error' }));
    }
  };

  return (
    <BOSFormDialog
      open={open}
      onClose={onClose}
      onSave={handleSaveAction}
      title={isEdit ? "View/Update Attendance" : "Meeting User Attendance"}
      saveLabel={isEdit ? (item.outTime ? "Close" : "Mark Out") : "Mark In"}
      maxWidth="sm"
    >
      <BOSFormSection title={isEdit ? "Attendance Details" : "Attendance Entry"} icon={<IconClock size={22} />}>
        <Stack spacing={2.5} sx={{ mt: 1 }}>
          {isEdit ? (
            <BOSTextField
              label="Schedule No"
              value={selectedSchedule?.scheduleNo || ''}
              InputProps={{ readOnly: true }}
              fullWidth
              sx={{ bgcolor: 'grey.50' }}
            />
          ) : (
            <Autocomplete
              options={schedules}
              getOptionLabel={(option) => option.scheduleNo || ''}
              value={selectedSchedule}
              onChange={(e, val) => setSelectedSchedule(val)}
              renderInput={(params) => (
                <BOSTextField {...params} label="Select Schedule No" required fullWidth />
              )}
            />
          )}

          {isEdit ? (
            <BOSTextField
              label="Attendee Name"
              value={attendeeName}
              InputProps={{ readOnly: true }}
              fullWidth
              sx={{ bgcolor: 'grey.50' }}
            />
          ) : (
            <Autocomplete
              options={employees.filter(emp => 
                // Only show participants assigned to this schedule who haven't marked attendance yet
                (!selectedSchedule || selectedSchedule.participants?.some(p => p.employee?.id === emp.id)) &&
                !existingAttendance.some(att => att.employee?.id === emp.id)
              )}
              getOptionLabel={(option) => option.employeeName || ''}
              value={employees.find(e => e.employeeName === attendeeName) || null}
              onChange={(e, val) => setAttendeeName(val ? val.employeeName : 'Current User')}
              renderInput={(params) => (
                <BOSTextField {...params} label="Select Attendee" required fullWidth />
              )}
              noOptionsText={selectedSchedule ? "All assigned participants have marked attendance" : "Select a schedule first"}
            />
          )}

          <BOSTextField
            label="Attendance Status"
            value={attendanceStatus}
            InputProps={{ readOnly: true }}
            fullWidth
            sx={{
              bgcolor: attendanceStatus === 'LATE' ? 'warning.lighter' : (attendanceStatus === 'ABSENT' ? 'error.lighter' : 'success.lighter'),
              '& .MuiInputBase-input': {
                color: attendanceStatus === 'LATE' ? 'warning.dark' : (attendanceStatus === 'ABSENT' ? 'error.dark' : 'success.dark'),
                fontWeight: 700
              }
            }}
          />

          <Stack direction="row" spacing={2}>
            <BOSTextField
              label="In Time"
              value={inTime}
              InputProps={{ readOnly: true }}
              fullWidth
              sx={{ bgcolor: 'grey.50' }}
            />
            <BOSTextField
              label="Out Time"
              value={isEdit ? (outTime || 'NOT MARKED') : 'PENDING'}
              InputProps={{ readOnly: true }}
              fullWidth
              sx={{ bgcolor: 'grey.50' }}
            />
          </Stack>

          {selectedSchedule && (
            <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2, bgcolor: 'primary.lighter' }}>
              <Typography variant="subtitle2" color="primary" gutterBottom>Schedule Details</Typography>
              <Typography variant="body2"><strong>Meeting Type:</strong> {selectedSchedule.meetingType?.meetingName || '-'}</Typography>
              <Typography variant="body2"><strong>Date:</strong> {selectedSchedule.meetingDate || '-'}</Typography>
              <Typography variant="body2"><strong>Time:</strong> {formatTo12h(selectedSchedule.startTime)} - {formatTo12h(selectedSchedule.endTime)}</Typography>
            </Box>
          )}
        </Stack>
      </BOSFormSection>
    </BOSFormDialog>
  );
};

AttendanceEntryDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  item: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired
};

export default AttendanceEntryDialog;
