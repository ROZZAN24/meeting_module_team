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

const AttendanceEntryDialog = ({ open, onClose, onSave }) => {
  const dispatch = useDispatch();
  const { employees = [] } = useLookups(['EMPLOYEES']);
  const [schedules, setSchedules] = useState([]);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [attendeeName, setAttendeeName] = useState('Current User');
  const [attendanceStatus, setAttendanceStatus] = useState('PRESENT');
  const [inTime, setInTime] = useState('');

  // Load eligible schedules (OPEN or RESCHEDULE, current date, within time window)
  useEffect(() => {
    if (open) {
      const loadSchedules = async () => {
        try {
          const response = await axios.get(API_PATHS.QMS.MEETING_SCHEDULES);
          const allSchedules = Array.isArray(response.data) ? response.data : [];
          const now = new Date();
          const today = now.toISOString().split('T')[0];

          // Filter: only OPEN/RESCHEDULE schedules for today, within 10 min of start
          const eligible = allSchedules.filter(s => {
            if (s.status !== 'OPEN' && s.status !== 'RESCHEDULE') return false;
            if (s.meetingDate !== today) return false;
            if (s.startTime) {
              const [h, m] = s.startTime.split(':').map(Number);
              const startMs = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m).getTime();
              const tenMinBefore = startMs - 10 * 60 * 1000;
              if (now.getTime() < tenMinBefore) return false;
            }
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
      setAttendanceStatus('PRESENT');
    }
  }, [open]);

  // Determine attendance status based on time
  useEffect(() => {
    if (selectedSchedule && selectedSchedule.startTime) {
      const now = new Date();
      const [h, m] = selectedSchedule.startTime.split(':').map(Number);
      const startTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m);
      setAttendanceStatus(now > startTime ? 'LATE' : 'PRESENT');
      setInTime(now.toTimeString().slice(0, 5));
    }
  }, [selectedSchedule]);

  const handleIn = async () => {
    if (!selectedSchedule) {
      dispatch(openSnackbar({ open: true, message: 'Please select a schedule', variant: 'alert', severity: 'warning' }));
      return;
    }
    try {
      await axios.post(API_PATHS.QMS.MEETING_ATTENDANCE, {
        scheduleId: selectedSchedule.id,
        inTime,
        status: attendanceStatus
      });
      dispatch(openSnackbar({ open: true, message: 'Attendance marked successfully', variant: 'alert', severity: 'success' }));
      onSave();
    } catch (error) {
      dispatch(openSnackbar({ open: true, message: error.response?.data?.message || 'Failed to mark attendance', variant: 'alert', severity: 'error' }));
    }
  };

  return (
    <BOSFormDialog
      open={open}
      onClose={onClose}
      onSave={handleIn}
      title="Meeting User Attendance"
      maxWidth="sm"
    >
      <BOSFormSection title="Attendance Entry" icon={<IconClock size={22} />}>
        <Stack spacing={2.5} sx={{ mt: 1 }}>
          <Autocomplete
            options={schedules}
            getOptionLabel={(option) => option.scheduleNo || ''}
            value={selectedSchedule}
            onChange={(e, val) => setSelectedSchedule(val)}
            renderInput={(params) => <BOSTextField {...params} label="Schedule No *" fullWidth />}
          />

          <BOSTextField
            label="Attendee Name"
            value={attendeeName}
            InputProps={{ readOnly: true }}
            fullWidth
            sx={{ bgcolor: 'grey.50' }}
          />

          <BOSTextField
            label="Attendance"
            value={attendanceStatus}
            InputProps={{ readOnly: true }}
            fullWidth
            sx={{
              bgcolor: attendanceStatus === 'LATE' ? 'warning.lighter' : 'success.lighter',
              '& .MuiInputBase-input': {
                color: attendanceStatus === 'LATE' ? 'warning.dark' : 'success.dark',
                fontWeight: 700
              }
            }}
          />

          <BOSTextField
            label="In Time"
            value={inTime}
            InputProps={{ readOnly: true }}
            fullWidth
            sx={{ bgcolor: 'grey.50' }}
          />

          {selectedSchedule && (
            <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2, bgcolor: 'primary.lighter' }}>
              <Typography variant="subtitle2" color="primary" gutterBottom>Schedule Details</Typography>
              <Typography variant="body2"><strong>Meeting Type:</strong> {selectedSchedule.meetingType?.meetingName || '-'}</Typography>
              <Typography variant="body2"><strong>Date:</strong> {selectedSchedule.meetingDate || '-'}</Typography>
              <Typography variant="body2"><strong>Time:</strong> {selectedSchedule.startTime} - {selectedSchedule.endTime}</Typography>
            </Box>
          )}
        </Stack>
      </BOSFormSection>
    </BOSFormDialog>
  );
};

AttendanceEntryDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired
};

export default AttendanceEntryDialog;
