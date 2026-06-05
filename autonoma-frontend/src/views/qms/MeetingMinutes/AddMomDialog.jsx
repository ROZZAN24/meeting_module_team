import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { openSnackbar } from 'store/slices/snackbar';
import PropTypes from 'prop-types';
import {
  MenuItem,
  Stack,
  Box,
  Typography,
  Autocomplete,
  Chip,
  Divider,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Button
} from '@mui/material';
import {
  BOSFormDialog,
  BOSTextField, BOSAutocomplete,
  BOSDatePicker,
  BOSFormSection,
  BOSAnalogTimePicker,
  BOSDataTable
} from 'ui-component/bos';
import { IconPlus, IconTrash, IconSettings, IconUsers, IconMessageDots } from '@tabler/icons-react';
import useBOSValidation from 'hooks/useBOSValidation';
import { useLookups } from 'hooks/useLookups';

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

const to24h = (time12h) => {
  if (!time12h) return '';
  if (!time12h.toUpperCase().includes('AM') && !time12h.toUpperCase().includes('PM')) {
    return formatTo24hString(time12h);
  }
  const [time, modifier] = time12h.trim().split(' ');
  let [hours, minutes] = time.split(':');
  let h = parseInt(hours, 10);
  if (modifier === 'PM' && h < 12) h += 12;
  if (modifier === 'AM' && h === 12) h = 0;
  return `${h.toString().padStart(2, '0')}:${minutes}`;
};

const to12h = (timeVal) => {
  if (!timeVal) return '';
  const time24h = formatTo24hString(timeVal);
  if (!time24h) return '';
  const parts = time24h.split(':');
  const h24 = parseInt(parts[0], 10);
  const ampm = h24 >= 12 ? 'PM' : 'AM';
  const h12 = h24 % 12 || 12;
  return `${String(h12).padStart(2, '0')}:${parts[1].substring(0, 2)} ${ampm}`;
};

const INITIAL_FORM = {
  momNo: 'AUTO',
  momDate: new Date().toISOString().split('T')[0],
  schedule: null,
  agenda: '',
  chairedBy: null,
  startTime: '09:00',
  endTime: '10:00',
  attendanceList: [],
  details: [
    { discussedPoint: '', processType: 'INFO', assignedBy: null, assignedTo: null, targetDate: '', reviewDate: '', attachmentRequired: 'NO' }
  ]
};

const AddMomDialog = ({ open, onClose, onSave, item }) => {
  const dispatch = useDispatch();
  const { meetingSchedules = [], employees = [] } = useLookups(['MEETING_SCHEDULES', 'EMPLOYEES']);
  const { errors, validate, clearErrors } = useBOSValidation();
  const [form, setForm] = useState(INITIAL_FORM);

  useEffect(() => {
    if (open) {
      if (item) {
        setForm(item);
      } else {
        setForm(INITIAL_FORM);
      }
      clearErrors();
    }
  }, [open, item, clearErrors]);

  useEffect(() => {
    if (form.schedule?.id && meetingSchedules.length > 0) {
      const fullSch = meetingSchedules.find((s) => s.id === form.schedule.id);
      if (fullSch) {
        const hostEmployee = fullSch.hostBy;
        const hostIdStr = hostEmployee ? String(hostEmployee.id) : null;
        
        let attendanceUpdated = false;
        let updatedAttendanceList = [...(form.attendanceList || [])];
        
        if (hostEmployee && hostIdStr && !updatedAttendanceList.some(att => att.employee && String(att.employee.id) === hostIdStr)) {
          updatedAttendanceList.push({
            employee: hostEmployee,
            inTime: '',
            outTime: '',
            attendanceStatus: 'ABSENT'
          });
          attendanceUpdated = true;
        }

        if (!form.schedule._isFull || attendanceUpdated) {
          setForm((prev) => ({
            ...prev,
            schedule: {
              ...prev.schedule,
              ...fullSch,
              _isFull: true
            },
            attendanceList: updatedAttendanceList
          }));
        }
      }
    }
  }, [form.schedule, form.attendanceList, meetingSchedules]);

  // When schedule is selected, auto-fill header details
  const handleScheduleChange = (e, val) => {
    if (!val) return;
    let listToMap = [...(val.participants || [])];
    if (val.hostBy && !listToMap.some((p) => p.employee && String(p.employee.id) === String(val.hostBy.id))) {
      listToMap.push({ employee: val.hostBy });
    }

    const participants = listToMap.map(p => ({
      employee: p.employee,
      inTime: val.startTime || '09:00',
      outTime: '',
      attendanceStatus: 'Present'
    }));

    setForm(p => ({
      ...p,
      schedule: val,
      agenda: val.agenda || '',
      chairedBy: val.chairedBy,
      startTime: val.startTime || '09:00',
      endTime: val.endTime || '10:00',
      attendanceList: participants
    }));
  };

  const addDetailRow = () => {
    setForm(p => ({
      ...p,
      details: [...p.details, { discussedPoint: '', processType: 'INFO', assignedBy: null, assignedTo: null, targetDate: '', reviewDate: '', attachmentRequired: 'NO' }]
    }));
  };

  const removeDetailRow = (index) => {
    if (form.details.length === 1) return;
    const newDetails = [...form.details];
    newDetails.splice(index, 1);
    setForm(p => ({ ...p, details: newDetails }));
  };

  const handleDetailChange = (index, field, value) => {
    const newDetails = [...form.details];
    newDetails[index][field] = value;
    setForm(p => ({ ...p, details: newDetails }));
  };

  const handleSave = () => {
    const rules = [
      { field: 'schedule', label: 'Meeting Schedule', required: true },
      { field: 'agenda', label: 'Agenda', required: true }
    ];

    if (validate(form, rules)) {
      // Validation: Out Time must not be before In Time
      const invalidOutTime = form.attendanceList.some((att) => {
        if (att.attendanceStatus === 'Absent' || !att.inTime || !att.outTime) return false;
        return to24h(att.outTime) < to24h(att.inTime);
      });
      if (invalidOutTime) {
        dispatch(openSnackbar({ open: true, message: 'Out time cannot be before in time for any attendee', variant: 'alert', severity: 'warning' }));
        return;
      }

      // Custom validation for discussed points (SOP: 150 chars or 50 with attachment)
      for (const [idx, det] of form.details.entries()) {
        const minChars = det.attachmentRequired === 'YES' ? 50 : 150;
        if ((det.discussedPoint || '').length < minChars) {
          dispatch(openSnackbar({ open: true, message: `Point #${idx + 1} must be at least ${minChars} characters.`, variant: 'alert', severity: 'warning' }));
          return;
        }
        if (det.processType === 'ACTION' && (!det.assignedTo || !det.targetDate)) {
          dispatch(openSnackbar({ open: true, message: `Action Point #${idx + 1} requires an assignee and target date.`, variant: 'alert', severity: 'warning' }));
          return;
        }
      }
      onSave(form);
    }
  };

  return (
    <BOSFormDialog
      open={open}
      onClose={onClose}
      onSave={handleSave}
      title={item ? `Edit MOM - ${item.momNo}` : 'New Meeting Minutes'}
      maxWidth="lg"
    >
      <Stack spacing={3}>
        {/* HEADER */}
        <BOSFormSection title="Meeting Header" icon={<IconSettings size={22} />}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Autocomplete
                options={meetingSchedules.filter(s => s.status === 'OPEN')}
                getOptionLabel={(option) => option.scheduleNo || ''}
                value={form.schedule}
                onChange={handleScheduleChange}
                renderInput={(params) => <BOSTextField {...params} label="Meeting Schedule No" required error={!!errors.schedule} />}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <BOSTextField label="Agenda" value={form.agenda} onChange={(e) => setForm({ ...form, agenda: e.target.value })} multiline rows={1} />
            </Grid>
            <Grid item xs={12} md={4}>
              <Autocomplete
                options={employees}
                getOptionLabel={(option) => option.employeeName || ''}
                value={form.chairedBy}
                onChange={(e, val) => setForm({ ...form, chairedBy: val })}
                renderInput={(params) => <BOSTextField {...params} label="Chaired By" />}
              />
            </Grid>
          </Grid>
        </BOSFormSection>

        {/* ATTENDANCE */}
        <BOSFormSection title="Attendance Details" icon={<IconUsers size={22} />}>
          <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
            <Table size="small">
              <TableHead sx={{ bgcolor: 'grey.50' }}>
                <TableRow>
                  <TableCell width={50}>Sl No</TableCell>
                  <TableCell>Department</TableCell>
                  <TableCell>Employee Name</TableCell>
                  <TableCell width={150}>In Time</TableCell>
                  <TableCell width={150}>Out Time</TableCell>
                  <TableCell width={150}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {form.attendanceList.map((att, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{idx + 1}</TableCell>
                    <TableCell>{att.employee?.department?.departmentName || 'N/A'}</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: att.employee && form.schedule?.hostBy && String(att.employee.id) === String(form.schedule.hostBy.id) ? 'error.main' : 'text.primary' }}>
                      {att.employee?.employeeName}
                      {att.employee && form.schedule?.hostBy && String(att.employee.id) === String(form.schedule.hostBy.id) && ' (HOST)'}
                    </TableCell>
                    <TableCell>
                      <BOSAnalogTimePicker
                        size="small"
                        value={to12h(att.inTime)}
                        onChange={(e) => {
                          const list = [...form.attendanceList];
                          list[idx].inTime = to24h(e.target.value);
                          setForm({ ...form, attendanceList: list });
                        }}
                        disableFutureValidation
                      />
                    </TableCell>
                    <TableCell>
                      <BOSAnalogTimePicker
                        size="small"
                        value={to12h(att.outTime)}
                        onChange={(e) => {
                          const list = [...form.attendanceList];
                          list[idx].outTime = to24h(e.target.value);
                          setForm({ ...form, attendanceList: list });
                        }}
                        disableFutureValidation
                        minTime={to12h(att.inTime)}
                        minTimeMessage="Out time cannot be before in time."
                      />
                    </TableCell>
                    <TableCell>
                      <BOSTextField select size="small" value={att.attendanceStatus} onChange={(e) => {
                        const list = [...form.attendanceList];
                        list[idx].attendanceStatus = e.target.value;
                        setForm({ ...form, attendanceList: list });
                      }}>
                        <MenuItem value="Present">Present</MenuItem>
                        <MenuItem value="Absent">Absent</MenuItem>
                      </BOSTextField>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </BOSFormSection>

        {/* DISCUSSION POINTS */}
        <BOSFormSection title="Discussion & Action Items" icon={<IconMessageDots size={22} />}>
          <Stack spacing={2}>
            {form.details.map((det, idx) => (
              <Box key={idx} sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2, bgcolor: 'background.default' }}>
                <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="primary" sx={{ display: 'flex', alignItems: 'center' }}>#{idx + 1}</Typography>
                  <BOSTextField
                    fullWidth
                    label="Discussed Point"
                    value={det.discussedPoint}
                    onChange={(e) => handleDetailChange(idx, 'discussedPoint', e.target.value.toUpperCase())}
                    multiline
                    rows={2}
                    placeholder="Describe the point in detail..."
                  />
                  <IconButton color="error" onClick={() => removeDetailRow(idx)} disabled={form.details.length === 1}><IconTrash /></IconButton>
                </Stack>
                <Grid container spacing={2}>
                  <Grid item xs={3}>
                    <BOSTextField select label="Process" size="small" value={det.processType} onChange={(e) => handleDetailChange(idx, 'processType', e.target.value)}>
                      <MenuItem value="INFO">INFO</MenuItem>
                      <MenuItem value="ACTION">ACTION</MenuItem>
                    </BOSTextField>
                  </Grid>
                  {det.processType === 'ACTION' && (
                    <>
                      <Grid item xs={3}>
                        <Autocomplete
                          options={employees}
                          getOptionLabel={(option) => option.employeeName || ''}
                          value={det.assignedTo}
                          onChange={(e, val) => handleDetailChange(idx, 'assignedTo', val)}
                          renderInput={(params) => <BOSTextField {...params} label="Assigned To" size="small" />}
                        />
                      </Grid>
                      <Grid item xs={3}>
                        <BOSDatePicker label="Target Date" size="small" value={det.targetDate} onChange={(e) => handleDetailChange(idx, 'targetDate', e.target.value)} name="targetDate" />
                      </Grid>
                      <Grid item xs={3}>
                        <BOSTextField select label="Attach Required?" size="small" value={det.attachmentRequired} onChange={(e) => handleDetailChange(idx, 'attachmentRequired', e.target.value)}>
                          <MenuItem value="YES">YES</MenuItem>
                          <MenuItem value="NO">NO</MenuItem>
                        </BOSTextField>
                      </Grid>
                    </>
                  )}
                </Grid>
              </Box>
            ))}
            <Button startIcon={<IconPlus />} variant="outlined" onClick={addDetailRow} sx={{ width: 'fit-content' }}>Add Discussion Point</Button>
          </Stack>
        </BOSFormSection>
      </Stack>
    </BOSFormDialog>
  );
};

AddMomDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  item: PropTypes.object
};

export default AddMomDialog;
