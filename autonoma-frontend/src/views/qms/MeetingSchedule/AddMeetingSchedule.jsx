import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  MenuItem,
  Stack,
  Box,
  Typography,
  Autocomplete,
  Divider,
  Grid,
  Card,
  CardContent,
  Avatar,
  Button,
  Tooltip,
  CircularProgress,
  Checkbox,
  Chip
} from '@mui/material';
import { useColorScheme } from '@mui/material/styles';
import {
  BOSTextField,
  BOSFormSection,
  BOSPersonnelCard,
  getPhotoUrl,
  btnSave,
  btnCancel,
  btnClear
} from 'ui-component/bos';
import MainCard from 'ui-component/cards/MainCard';
import useBOSValidation from 'hooks/useBOSValidation';
import useAuth from 'hooks/useAuth';
import { useLookups } from 'hooks/useLookups';
import useKeyboardShortcuts, { shortcutTooltip } from 'hooks/useKeyboardShortcuts';
import { openSnackbar } from 'store/slices/snackbar';
import axios from 'utils/axios';
import { API_PATHS } from 'utils/api-constants';
import { IconSettings, IconCalendarEvent, IconUsers, IconArrowLeft, IconEraser, IconDeviceFloppy, IconBarcode, IconCircleCheck } from '@tabler/icons-react';

const FREQUENCIES = ['NONE', 'DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'BI-ANNUAL', 'ANNUAL'];
const ALL_TIME_OPTIONS = Array.from({ length: 96 }).map((_, i) => {
  const hour24 = Math.floor(i / 4);
  const m = ((i % 4) * 15).toString().padStart(2, '0');
  const ampm = hour24 >= 12 ? 'PM' : 'AM';
  const hour12 = (hour24 % 12 || 12).toString().padStart(2, '0');
  return { label: `${hour12}:${m} ${ampm}`, hour24, minutes: parseInt(m, 10) };
});

const to24h = (time12h) => {
  if (!time12h) return null;
  const [time, modifier] = time12h.split(' ');
  let [hours, minutes] = time.split(':');
  let h = parseInt(hours, 10);
  if (modifier === 'PM' && h < 12) h += 12;
  if (modifier === 'AM' && h === 12) h = 0;
  return `${h.toString().padStart(2, '0')}:${minutes}`;
};

const to12h = (time24h) => {
  if (!time24h) return null;
  const [hours, minutes] = time24h.split(':');
  const h24 = parseInt(hours, 10);
  const ampm = h24 >= 12 ? 'PM' : 'AM';
  const h12 = (h24 % 12 || 12).toString().padStart(2, '0');
  return `${h12}:${minutes.substring(0, 2)} ${ampm}`;
};

const INITIAL_FORM = {
  scheduleNo: 'AUTO',
  meetingDate: new Date().toISOString().split('T')[0],
  status: 'OPEN',
  meetingType: null,
  description: '',
  agenda: '',
  subject: '',
  startTime: '09:00 AM',
  endTime: '10:00 AM',
  intervalTime: '12:00 AM',
  frequency: 'NONE',
  departments: [],
  chairedBy: null,
  hostBy: null,
  participants: [],
  weekdays: ''
};

export default function AddMeetingSchedule() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();
  
  const { 
    meetings = [], 
    activeDepartments = [], 
    employees = [],
    levels = [],
    designations = []
  } = useLookups(['MEETINGS', 'ACTIVE_DEPARTMENTS', 'EMPLOYEES', 'LEVELS', 'DESIGNATIONS']);
  
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { errors, validate, clearErrors, handleInputChange } = useBOSValidation();
  const { user } = useAuth();
  const [form, setForm] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Clear handler to reset form but keep current user populated
  const handleClear = useCallback(() => {
    setForm({
      ...INITIAL_FORM,
      createdBy: user?.employeeName || user?.userName || user?.name || 'System'
    });
    clearErrors();
  }, [user, clearErrors]);



  const filteredTimeOptions = useMemo(() => {
    const limit = id ? 21 : 23;
    return ALL_TIME_OPTIONS.filter((t) => {
      const isAfter9AM = t.hour24 >= 9;
      const isBeforeLimit = t.hour24 < limit || (t.hour24 === limit && t.minutes === 0);
      return isAfter9AM && isBeforeLimit;
    }).map((t) => t.label);
  }, [id]);

  const fetchSchedule = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const { data } = await axios.get(`${API_PATHS.QMS.MEETING_SCHEDULES}/${id}`);
      setForm({
        ...data,
        startTime: to12h(data.startTime),
        endTime: to12h(data.endTime),
        intervalTime: to12h(data.intervalTime),
        departments: (data.departments || []).map(d => d.department),
        participants: (data.participants || []).map(p => p.employee)
      });
    } catch (error) {
      console.error('Failed to fetch schedule:', error);
      dispatch(openSnackbar({ open: true, message: 'Failed to load schedule details', variant: 'alert', severity: 'error' }));
    } finally {
      setLoading(false);
    }
  }, [id, dispatch]);

  useEffect(() => {
    if (id) {
      fetchSchedule();
    } else {
      setForm({
        ...INITIAL_FORM,
        createdBy: user?.employeeName || user?.userName || user?.name || 'System'
      });
    }
    clearErrors();
  }, [id, fetchSchedule, clearErrors, user]);

  useEffect(() => {
    if (!id && user) {
      const currentUser = user.employeeName || user.userName || user.name || 'System';
      setForm(p => ({ ...p, createdBy: currentUser }));
    }
  }, [id, user]);

  const h = (e) => handleInputChange(e, setForm);

  // Auto-populate based on Meeting Type
  useEffect(() => {
    if (form.meetingType && !id && employees.length > 0) {
      setForm(p => ({
        ...p,
        description: form.meetingType.meetingDescription || '',
        agenda: form.meetingType.meetingAgenda || ''
      }));
    }
  }, [form.meetingType, id, employees]);

  useEffect(() => {
    if (form.frequency === 'WEEKLY' && form.meetingDate) {
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const [y, m, d] = form.meetingDate.split('-').map(Number);
      const dateObj = new Date(y, m - 1, d);
      const dayName = days[dateObj.getDay()];
      
      setForm(p => ({ ...p, weekdays: dayName }));
    }
  }, [form.frequency, form.meetingDate]);

  // Automatically clear selected chairedBy, hostBy, and participants if their department is removed
  useEffect(() => {
    const selectedDeptIds = (form.departments || []).map(d => String(d.id));
    
    setForm(prev => {
      let updated = false;
      const nextForm = { ...prev };

      // Check chairedBy
      if (nextForm.chairedBy && !selectedDeptIds.includes(String(nextForm.chairedBy.departmentId))) {
        nextForm.chairedBy = null;
        updated = true;
      }

      // Check hostBy
      if (nextForm.hostBy && !selectedDeptIds.includes(String(nextForm.hostBy.departmentId))) {
        nextForm.hostBy = null;
        updated = true;
      }

      // Check participants
      const validParticipants = (nextForm.participants || []).filter(p => 
        selectedDeptIds.includes(String(p.departmentId))
      );
      if (validParticipants.length !== (nextForm.participants || []).length) {
        nextForm.participants = validParticipants;
        updated = true;
      }

      return updated ? nextForm : prev;
    });
  }, [form.departments]);

  const handleSave = async () => {
    if (submitting) return;

    const rules = [
      { field: 'meetingDate', label: 'Schedule Date', required: true },
      { field: 'meetingType', label: 'Meeting Type', required: true },
      { field: 'startTime', label: 'Schedule Time', required: true },
      { field: 'endTime', label: 'End Time', required: true },
      { field: 'frequency', label: 'frequency', required: true },
      { field: 'departments', label: 'Departments', required: true, type: 'array' },
      { field: 'hostBy', label: 'Host', required: true },
      { field: 'participants', label: 'Participants', required: true, type: 'array' },
      { field: 'weekdays', label: 'Weekdays', required: form.frequency === 'WEEKLY' }
    ];

    if (validate(form, rules)) {
      setSubmitting(true);
      try {
        const payload = {
          ...form,
          startTime: to24h(form.startTime),
          endTime: to24h(form.endTime),
          intervalTime: to24h(form.intervalTime),
          departments: form.departments.map(d => ({ department: d })),
          participants: form.participants.map(e => ({ employee: e })),
          createdBy: form.createdBy || user?.employeeName || user?.userName || user?.name || 'System'
        };

        if (id) {
          await axios.put(`${API_PATHS.QMS.MEETING_SCHEDULES}/${id}`, payload);
          dispatch(openSnackbar({ open: true, message: 'Meeting schedule updated successfully.', variant: 'alert', severity: 'success' }));
        } else {
          await axios.post(API_PATHS.QMS.MEETING_SCHEDULES, payload);
          dispatch(openSnackbar({ open: true, message: 'Meeting schedule saved successfully.', variant: 'alert', severity: 'success' }));
        }
        navigate('/qms/meeting-schedule');
      } catch (error) {
        setSubmitting(false);
        const errorMsg = error.response?.data?.message || error.response?.data?.error || error.message || 'Failed to save schedule due to connection or validation issues.';
        dispatch(openSnackbar({ open: true, message: `Failed to save schedule: ${errorMsg}`, variant: 'alert', severity: 'error' }));
      }
    }
  };

  // Keyboard Shortcuts — placed after handleSave/handleClear so refs are defined
  // (hook uses a ref internally, so handlers are always up-to-date)
  useKeyboardShortcuts({
    'ctrl+s': handleSave,
    'ctrl+backspace': handleClear,
    'escape': () => navigate('/qms/meeting-schedule')
  }, true);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <MainCard
      title={
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box sx={{ p: 1, bgcolor: 'primary.light', borderRadius: 2, display: 'flex' }}>
             <IconCalendarEvent size={22} color={isDark ? '#fff' : '#1e88e5'} />
          </Box>
          <Typography variant="h3" sx={{ fontWeight: 800 }}>{id ? `Edit Schedule - ${form.scheduleNo}` : 'Meeting Schedule'}</Typography>
        </Stack>
      }
      secondary={
        <Stack direction="row" spacing={1.5}>
          <Tooltip title={shortcutTooltip('Back', 'Esc')}>
            <Button variant="outlined" color="error" startIcon={<IconArrowLeft size={18} />} onClick={() => navigate('/qms/meeting-schedule')} sx={btnCancel}>Back</Button>
          </Tooltip>
          <Tooltip title={shortcutTooltip('Clear Form', 'Ctrl + Backspace')}>
            <Button variant="outlined" color="primary" startIcon={<IconEraser size={18} />} onClick={handleClear} sx={btnClear}>Clear</Button>
          </Tooltip>
          <Tooltip title={shortcutTooltip('Save', 'Ctrl + S')}>
            <Button 
              variant="contained" 
              color="secondary" 
              startIcon={submitting ? <CircularProgress size={18} color="inherit" /> : <IconDeviceFloppy size={18} />} 
              onClick={handleSave} 
              disabled={submitting}
              sx={btnSave}
            >
              {submitting ? 'Saving...' : 'Save'}
            </Button>
          </Tooltip>
        </Stack>
      }
    >
      <Stack spacing={4}>
        {/* HEADER INFO */}
        <Grid container spacing={3} sx={{ mb: 1 }}>
          {/* Card 1: Schedule No */}
          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                p: 2.5,
                borderRadius: '16px',
                border: '1px solid',
                borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'primary.light',
                bgcolor: isDark ? 'rgba(30, 136, 229, 0.05)' : 'rgba(30, 136, 229, 0.03)',
                boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.3)' : '0 4px 12px rgba(30, 136, 229, 0.05)',
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-3px)',
                  boxShadow: isDark ? '0 8px 24px rgba(30, 136, 229, 0.2)' : '0 8px 24px rgba(30, 136, 229, 0.12)',
                  borderColor: 'primary.main',
                }
              }}
            >
              <Stack direction="row" alignItems="center" spacing={2.5}>
                <Avatar
                  sx={{
                    width: 54,
                    height: 54,
                    borderRadius: '12px',
                    bgcolor: isDark ? 'primary.dark' : 'primary.light',
                    color: isDark ? '#fff' : 'primary.main',
                    boxShadow: '0 4px 10px rgba(30, 136, 229, 0.15)'
                  }}
                >
                  <IconBarcode size={26} />
                </Avatar>
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.8px',
                      display: 'block',
                      mb: 0.5
                    }}
                  >
                    Schedule No
                  </Typography>
                  <Typography
                    variant="h3"
                    noWrap
                    sx={{
                      fontWeight: 800,
                      color: isDark ? 'primary.light' : 'primary.main',
                    }}
                  >
                    {form.scheduleNo}
                  </Typography>
                </Box>
              </Stack>
            </Card>
          </Grid>

          {/* Card 2: Date */}
          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                p: 2.5,
                borderRadius: '16px',
                border: '1px solid',
                borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'secondary.light',
                bgcolor: isDark ? 'rgba(103, 58, 183, 0.05)' : 'rgba(103, 58, 183, 0.03)',
                boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.3)' : '0 4px 12px rgba(103, 58, 183, 0.05)',
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-3px)',
                  boxShadow: isDark ? '0 8px 24px rgba(103, 58, 183, 0.2)' : '0 8px 24px rgba(103, 58, 183, 0.12)',
                  borderColor: 'secondary.main',
                }
              }}
            >
              <Stack direction="row" alignItems="center" spacing={2.5}>
                <Avatar
                  sx={{
                    width: 54,
                    height: 54,
                    borderRadius: '12px',
                    bgcolor: isDark ? 'secondary.dark' : 'secondary.light',
                    color: isDark ? '#fff' : 'secondary.main',
                    boxShadow: '0 4px 10px rgba(103, 58, 183, 0.15)'
                  }}
                >
                  <IconCalendarEvent size={26} />
                </Avatar>
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.8px',
                      display: 'block',
                      mb: 0.5
                    }}
                  >
                    Schedule Date
                  </Typography>
                  <Typography
                    variant="h3"
                    noWrap
                    sx={{
                      fontWeight: 800,
                      color: isDark ? 'secondary.light' : 'secondary.main',
                    }}
                  >
                    {form.meetingDate || new Date().toISOString().split('T')[0]}
                  </Typography>
                </Box>
              </Stack>
            </Card>
          </Grid>

          {/* Card 3: Status */}
          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                p: 2.5,
                borderRadius: '16px',
                border: '1px solid',
                borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'success.light',
                bgcolor: isDark ? 'rgba(0, 200, 83, 0.05)' : 'rgba(0, 200, 83, 0.03)',
                boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.3)' : '0 4px 12px rgba(0, 200, 83, 0.05)',
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-3px)',
                  boxShadow: isDark ? '0 8px 24px rgba(0, 200, 83, 0.2)' : '0 8px 24px rgba(0, 200, 83, 0.12)',
                  borderColor: 'success.main',
                }
              }}
            >
              <Stack direction="row" alignItems="center" spacing={2.5}>
                <Avatar
                  sx={{
                    width: 54,
                    height: 54,
                    borderRadius: '12px',
                    bgcolor: isDark ? 'success.dark' : 'success.light',
                    color: isDark ? '#fff' : 'success.main',
                    boxShadow: '0 4px 10px rgba(0, 200, 83, 0.15)'
                  }}
                >
                  <IconCircleCheck size={26} />
                </Avatar>
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.8px',
                      display: 'block',
                      mb: 0.5
                    }}
                  >
                    Schedule Status
                  </Typography>
                  <Chip
                    label={form.status}
                    color="success"
                    size="small"
                    sx={{
                      fontWeight: 800,
                      fontSize: '0.875rem',
                      height: '28px',
                      borderRadius: '8px',
                      px: 0.5,
                      boxShadow: '0 2px 8px rgba(0, 200, 83, 0.2)'
                    }}
                  />
                </Box>
              </Stack>
            </Card>
          </Grid>

          {/* Card 4: Created User */}
          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                p: 2.5,
                borderRadius: '16px',
                border: '1px solid',
                borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'warning.light',
                bgcolor: isDark ? 'rgba(255, 193, 7, 0.05)' : 'rgba(255, 193, 7, 0.03)',
                boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.3)' : '0 4px 12px rgba(255, 193, 7, 0.05)',
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-3px)',
                  boxShadow: isDark ? '0 8px 24px rgba(255, 193, 7, 0.2)' : '0 8px 24px rgba(255, 193, 7, 0.12)',
                  borderColor: 'warning.main',
                }
              }}
            >
              <Stack direction="row" alignItems="center" spacing={2.5}>
                <Avatar
                  sx={{
                    width: 54,
                    height: 54,
                    borderRadius: '12px',
                    bgcolor: isDark ? 'warning.dark' : 'warning.light',
                    color: isDark ? '#fff' : 'warning.main',
                    boxShadow: '0 4px 10px rgba(255, 193, 7, 0.15)'
                  }}
                >
                  <IconUsers size={26} />
                </Avatar>
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.8px',
                      display: 'block',
                      mb: 0.5
                    }}
                  >
                    Created User
                  </Typography>
                  <Typography
                    variant="h3"
                    noWrap
                    sx={{
                      fontWeight: 800,
                      color: isDark ? 'warning.light' : 'warning.main',
                    }}
                  >
                    {form.createdBy || user?.employeeName || user?.userName || user?.name || 'System'}
                  </Typography>
                </Box>
              </Stack>
            </Card>
          </Grid>
        </Grid>

        {/* MEETING DETAILS SECTION */}
        <BOSFormSection title="Schedule Configuration" icon={<IconSettings size={22} />}>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <Autocomplete
              options={meetings}
              getOptionLabel={(option) => option.meetingName || ''}
              value={form.meetingType}
              onChange={(e, val) => {
                if (!val || (form.meetingType && val.id !== form.meetingType.id)) {
                  setForm(p => ({
                    ...INITIAL_FORM,
                    scheduleNo: p.scheduleNo,
                    status: p.status,
                    meetingType: val
                  }));
                } else {
                  setForm(p => ({ ...p, meetingType: val }));
                }
                if (errors.meetingType) clearErrors('meetingType');
              }}
              renderInput={(params) => (
                <BOSTextField {...params} label="Meeting Type" required error={!!errors.meetingType} helperText={errors.meetingType} fullWidth />
              )}
            />
            <BOSTextField label="Description" value={form.description} multiline rows={2} InputProps={{ readOnly: true }} sx={{ bgcolor: 'grey.50' }} fullWidth />
            <BOSTextField label="Agenda" value={form.agenda} multiline rows={2} InputProps={{ readOnly: true }} sx={{ bgcolor: 'grey.50' }} fullWidth />
            <BOSTextField label="Subject" name="subject" value={form.subject || ''} onChange={h} required error={!!errors.subject} fullWidth />
          </Stack>
        </BOSFormSection>

        {/* SCHEDULING SECTION */}
        <BOSFormSection title="Date & Time" icon={<IconCalendarEvent size={22} />}>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <BOSTextField 
                type="date" 
                label="Meeting Date" 
                name="meetingDate" 
                value={form.meetingDate} 
                onChange={h} 
                required 
                error={!!errors.meetingDate} 
                fullWidth 
                inputProps={{ min: new Date().toISOString().split('T')[0] }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <BOSTextField select label="Frequency" name="frequency" value={form.frequency} onChange={h} required error={!!errors.frequency} helperText={errors.frequency} fullWidth>
                {FREQUENCIES.map(f => <MenuItem key={f} value={f}>{f}</MenuItem>)}
              </BOSTextField>
            </Grid>

            {form.frequency === 'WEEKLY' && (
              <Grid item xs={12}>
                <BOSTextField
                  label="Weekday (Derived from Date)"
                  name="weekdays"
                  value={form.weekdays || ''}
                  InputProps={{ readOnly: true }}
                  sx={{ bgcolor: 'grey.50' }}
                  fullWidth
                  helperText="Automatically derived from the meeting date"
                />
              </Grid>
            )}
            <Grid item xs={12} sm={4}>
              <BOSTextField select label="Start Time" name="startTime" value={form.startTime} onChange={h} required fullWidth>
                {filteredTimeOptions.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
              </BOSTextField>
            </Grid>
            <Grid item xs={12} sm={4}>
              <BOSTextField select label="Interval Time" name="intervalTime" value={form.intervalTime} onChange={h} fullWidth>
                {filteredTimeOptions.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
              </BOSTextField>
            </Grid>
            <Grid item xs={12} sm={4}>
              <BOSTextField select label="End Time" name="endTime" value={form.endTime} onChange={h} required fullWidth>
                {filteredTimeOptions.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
              </BOSTextField>
            </Grid>
          </Grid>
        </BOSFormSection>

        {/* PERSONNEL SECTION */}
        <BOSFormSection title="Participants & Host" icon={<IconUsers size={22} />}>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <Autocomplete
              multiple
              disableCloseOnSelect
              options={[{ id: 'select-all', departmentName: 'Select All' }, ...activeDepartments]}
              getOptionLabel={(option) => option.departmentName || ''}
              value={form.departments}
              onChange={(e, newValue, reason, details) => {
                if (details?.option?.id === 'select-all') {
                  if (form.departments.length === activeDepartments.length) {
                    setForm(p => ({ ...p, departments: [] }));
                  } else {
                    setForm(p => ({ ...p, departments: activeDepartments }));
                  }
                } else {
                  const finalValues = newValue.filter(v => v.id !== 'select-all');
                  setForm(p => ({ ...p, departments: finalValues }));
                }
                if (errors.departments) clearErrors('departments');
              }}
              renderOption={(props, option, { selected }) => {
                if (option.id === 'select-all') {
                  const isAllSelected = form.departments.length === activeDepartments.length && activeDepartments.length > 0;
                  return (
                    <MenuItem {...props}>
                      <Checkbox checked={isAllSelected} />
                      <Typography fontWeight="bold">Select All</Typography>
                    </MenuItem>
                  );
                }
                return (
                  <MenuItem {...props}>
                    <Checkbox checked={selected} />
                    {option.departmentName}
                  </MenuItem>
                );
              }}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => {
                  const { key, ...tagProps } = getTagProps({ index });
                  return (
                    <Chip
                      key={key}
                      label={option.departmentName}
                      color="primary"
                      variant="filled"
                      size="small"
                      {...tagProps}
                    />
                  );
                })
              }
              renderInput={(params) => <BOSTextField {...params} label="Departments" required error={!!errors.departments} fullWidth />}
            />

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3, mt: 1 }}>
              {[
                { role: 'CHAIRED BY', field: 'chairedBy', label: 'Chaired By', filter: (e) => e.isChaired === 'YES' },
                { role: 'HOST BY', field: 'hostBy', label: 'Host By', filter: (e) => e.isHost === 'YES' }
              ].map((person) => {
                const selectedEmp = form[person.field];
                const name = selectedEmp ? selectedEmp.employeeName : 'Not Selected';
                const code = selectedEmp ? selectedEmp.empCode : 'No Code';
                const dept = selectedEmp ? (activeDepartments.find(d => String(d.id) === String(selectedEmp.departmentId))?.departmentName || '-') : '-';

                let level = '-';
                if (selectedEmp) {
                  const levelMatch = levels.find(l => String(l.rowId || l.id) === String(selectedEmp.empLevelId));
                  const desigMatch = designations.find(d => String(d.id) === String(selectedEmp.designationId));
                  level = levelMatch?.level || desigMatch?.designationName || '-';
                }

                const selectedDeptIds = (form.departments || []).map(d => String(d.id));
                const filteredEmployees = employees.filter(emp => 
                  emp.status === 'Active' && 
                  person.filter(emp) &&
                  selectedDeptIds.includes(String(emp.departmentId))
                );

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
                    height: '100%',
                    width: '100%'
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
                      <Typography variant="overline" color="primary.main" sx={{ fontWeight: 800, mb: 0.5, fontSize: '0.75rem' }}>{person.role}</Typography>
                      <Typography variant="h6" fontWeight={700} color="text.primary" noWrap sx={{ width: '100%', textAlign: 'center', mb: 0.5 }}>{name}</Typography>
                      
                      <Stack spacing={0.5} alignItems="center" sx={{ mb: 2, width: '100%' }}>
                        <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>Dept: {dept}</Typography>
                        <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>Level: {level}</Typography>
                      </Stack>

                      <Box sx={{ bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'grey.100', px: 2.5, py: 0.5, borderRadius: '16px', mb: 3 }}>
                        <Typography variant="body2" color="text.secondary" fontWeight={600} noWrap>{code}</Typography>
                      </Box>
                      
                      <Autocomplete
                        fullWidth
                        disabled={form.departments.length === 0}
                        options={filteredEmployees}
                        getOptionLabel={(option) => `${option.employeeName} (${option.empCode})`}
                        value={selectedEmp}
                        onChange={(e, val) => {
                          setForm(p => ({ ...p, [person.field]: val }));
                          if (errors[person.field]) clearErrors(person.field);
                        }}
                        renderInput={(params) => (
                          <BOSTextField 
                            {...params} 
                            label={form.departments.length === 0 ? `Select ${person.label} (Please select a department first)` : `Select ${person.label}`} 
                            required 
                            error={!!errors[person.field]} 
                            fullWidth 
                          />
                        )}
                      />
                    </CardContent>
                  </Card>
                );
              })}
            </Box>

            <Divider sx={{ my: 1 }} />

            <Autocomplete
              multiple
              disableCloseOnSelect
              disabled={form.departments.length === 0}
              options={employees.filter(e => 
                e.status === 'Active' && 
                e.isParticipants === 'YES' && 
                form.departments.map(d => String(d.id)).includes(String(e.departmentId)) &&
                !form.participants.some(p => p.id === e.id || p.empCode === e.empCode)
              )}
              getOptionLabel={(option) => `${option.employeeName} (${option.empCode})`}
              value={form.participants}
              onChange={(e, val) => {
                setForm(p => ({ ...p, participants: val }));
                if (errors.participants) clearErrors('participants');
              }}
              renderInput={(params) => (
                <BOSTextField 
                  {...params} 
                  label={form.departments.length === 0 ? "Participants (Please select a department first)" : "Participants"} 
                  required 
                  error={!!errors.participants} 
                  fullWidth 
                />
              )}
            />

            {/* PARTICIPANTS PREVIEW GALLERY */}
            {form.participants.length > 0 && (
              <Box sx={{ mt: 1, width: '100%' }}>
                <Typography variant="subtitle2" color="primary" sx={{ mb: 1.5, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <IconUsers size={18} /> SELECTED PARTICIPANTS ({form.participants.length})
                </Typography>
                
                {form.participants.length <= 4 ? (
                  <Grid container spacing={1.5}>
                    {form.participants.map((emp, idx) => (
                      <Grid item xs={12} sm={6} md={3} key={emp.id || idx}>
                        <BOSPersonnelCard 
                          variant="compact"
                          title={`Participant #${idx + 1}`}
                          name={emp.employeeName}
                          empCode={emp.empCode}
                          department={emp.department?.departmentName}
                          photo={emp.employeePhotoUpload}
                          color="primary.main"
                        />
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Box sx={{ 
                    overflow: 'hidden', 
                    width: '100%', 
                    position: 'relative',
                    bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'grey.50',
                    py: 1.5,
                    px: 1,
                    borderRadius: '12px',
                    border: '1px dashed',
                    borderColor: 'divider',
                    '&:hover .marquee-inner': { animationPlayState: 'paused' }
                  }}>
                    <Box 
                      className="marquee-inner"
                      sx={{ 
                        display: 'flex', 
                        gap: 2, 
                        width: 'max-content',
                        animation: `marquee ${form.participants.length * 3}s linear infinite`,
                        '@keyframes marquee': {
                          '0%': { transform: 'translateX(0)' },
                          '100%': { transform: 'translateX(-50%)' }
                        }
                      }}
                    >
                      {[...form.participants, ...form.participants].map((emp, idx) => (
                        <Box key={`${emp.id}-${idx}`} sx={{ width: 280, flexShrink: 0 }}>
                          <BOSPersonnelCard 
                            variant="compact"
                            title={`Participant #${(idx % form.participants.length) + 1}`}
                            name={emp.employeeName}
                            empCode={emp.empCode}
                            department={emp.department?.departmentName}
                            photo={emp.employeePhotoUpload}
                            color="primary.main"
                          />
                        </Box>
                      ))}
                    </Box>
                  </Box>
                )}
              </Box>
            )}
          </Stack>
        </BOSFormSection>

        <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2, border: '1px dashed', borderColor: 'divider', textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary">All fields marked with * are mandatory for compliance.</Typography>
        </Box>
      </Stack>
    </MainCard>
  );
}
