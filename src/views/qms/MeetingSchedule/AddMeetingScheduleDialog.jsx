import React, { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  MenuItem,
  Stack,
  Box,
  Typography,
  Autocomplete,
  Chip,
  Divider,
  Grid
} from '@mui/material';
import {
  BOSFormDialog,
  BOSTextField,
  BOSFormSection,
  BOSPersonnelCard
} from 'ui-component/bos';
import useBOSValidation from 'hooks/useBOSValidation';
import { useLookups } from 'hooks/useLookups';
import { IconSettings, IconCalendarEvent, IconUsers, IconFileText } from '@tabler/icons-react';

const FREQUENCIES = ['NONE', 'DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'BI-ANNUAL', 'ANNUAL'];
const TIME_OPTIONS = Array.from({ length: 96 }).map((_, i) => {
  const hour24 = Math.floor(i / 4);
  const m = ((i % 4) * 15).toString().padStart(2, '0');
  const ampm = hour24 >= 12 ? 'PM' : 'AM';
  const hour12 = (hour24 % 12 || 12).toString().padStart(2, '0');
  return `${hour12}:${m} ${ampm}`;
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

const AddMeetingScheduleDialog = ({ open, onClose, onSave, item }) => {
  const { 
    meetings = [], 
    activeDepartments = [], 
    employees = [] 
  } = useLookups(['MEETINGS', 'ACTIVE_DEPARTMENTS', 'EMPLOYEES']);
  
  const { errors, validate, clearErrors } = useBOSValidation();
  const [form, setForm] = useState(INITIAL_FORM);

  useEffect(() => {
    if (open) {
      if (item) {
        setForm({
          ...item,
          startTime: to12h(item.startTime),
          endTime: to12h(item.endTime),
          intervalTime: to12h(item.intervalTime),
          departments: (item.departments || []).map(d => d.department),
          participants: (item.participants || []).map(p => p.employee)
        });
      } else {
        setForm(INITIAL_FORM);
      }
      clearErrors();
    }
  }, [open, item, clearErrors]);

  const h = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  // Auto-populate based on Meeting Type
  useEffect(() => {
    if (form.meetingType && !item && employees.length > 0) {
      // Find matching employees based on codes/names stored in Meeting Master
      const masterEmpEntries = (form.meetingType.employeeName || '').split(',').map(s => s.trim()).filter(Boolean);
      
      const matchedParticipants = employees.filter(emp => 
        masterEmpEntries.some(entry => {
          if (entry.includes(';')) {
            const [code] = entry.split(';');
            return emp.empCode === code;
          }
          return emp.employeeName === entry; // Fallback for old records
        })
      );

      setForm(p => ({
        ...p,
        description: form.meetingType.meetingDescription || '',
        agenda: form.meetingType.meetingAgenda || '',
        participants: matchedParticipants
      }));
    }
  }, [form.meetingType, item, employees]);

  // Derive weekday from meetingDate when Weekly frequency is selected or date changes
  useEffect(() => {
    if (form.frequency === 'WEEKLY' && form.meetingDate) {
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const [y, m, d] = form.meetingDate.split('-').map(Number);
      const dateObj = new Date(y, m - 1, d);
      const dayName = days[dateObj.getDay()];
      
      setForm(p => ({ ...p, weekdays: dayName }));
    }
  }, [form.frequency, form.meetingDate]);

  const handleSave = () => {
    const rules = [
      { field: 'meetingDate', label: 'Meeting Date', required: true },
      { field: 'meetingType', label: 'Meeting Type', required: true },
      { field: 'startTime', label: 'Start Time', required: true },
      { field: 'endTime', label: 'End Time', required: true },
      { field: 'departments', label: 'Departments', required: true, type: 'array' },
      { field: 'hostBy', label: 'Host', required: true },
      { field: 'participants', label: 'Participants', required: true, type: 'array' },
      { field: 'weekdays', label: 'Weekdays', required: form.frequency === 'WEEKLY' }
    ];

    if (validate(form, rules)) {
      const payload = {
        ...form,
        startTime: to24h(form.startTime),
        endTime: to24h(form.endTime),
        intervalTime: to24h(form.intervalTime),
        departments: form.departments.map(d => ({ department: d })),
        participants: form.participants.map(e => ({ employee: e }))
      };
      onSave(payload);
    }
  };

  return (
    <BOSFormDialog
      open={open}
      onClose={onClose}
      onSave={handleSave}
      onClear={() => setForm(INITIAL_FORM)}
      title={item ? `Edit Schedule - ${item.scheduleNo}` : 'New Meeting Schedule'}
      maxWidth="md"
      fullWidth
    >
      <Stack spacing={4}>
        {/* HEADER INFO */}
        <Grid container spacing={2} sx={{ p: 2, bgcolor: 'primary.lighter', borderRadius: 2, border: '1px solid', borderColor: 'primary.light' }}>
          <Grid item xs={4}>
            <Typography variant="caption" color="text.secondary">Schedule No</Typography>
            <Typography variant="h6" fontWeight={700} color="primary.main">{form.scheduleNo}</Typography>
          </Grid>
          <Grid item xs={4}>
            <Typography variant="caption" color="text.secondary">Date</Typography>
            <Typography variant="h6" fontWeight={700}>{form.momDate || new Date().toISOString().split('T')[0]}</Typography>
          </Grid>
          <Grid item xs={4}>
            <Typography variant="caption" color="text.secondary">Status</Typography>
            <Typography variant="h6" fontWeight={700} color="success.main">{form.status}</Typography>
          </Grid>
        </Grid>

        {/* MEETING DETAILS SECTION */}
        <BOSFormSection title="1. Meeting Configuration" icon={<IconSettings size={22} />}>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <Autocomplete
              options={meetings}
              getOptionLabel={(option) => option.meetingName || ''}
              value={form.meetingType}
              onChange={(e, val) => setForm(p => ({ ...p, meetingType: val }))}
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
        <BOSFormSection title="2. Date & Time" icon={<IconCalendarEvent size={22} />}>
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
              <BOSTextField select label="Frequency" name="frequency" value={form.frequency} onChange={h} fullWidth>
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
                {TIME_OPTIONS.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
              </BOSTextField>
            </Grid>
            <Grid item xs={12} sm={4}>
              <BOSTextField select label="Interval Time" name="intervalTime" value={form.intervalTime} onChange={h} fullWidth>
                {TIME_OPTIONS.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
              </BOSTextField>
            </Grid>
            <Grid item xs={12} sm={4}>
              <BOSTextField select label="End Time" name="endTime" value={form.endTime} onChange={h} required fullWidth>
                {TIME_OPTIONS.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
              </BOSTextField>
            </Grid>
          </Grid>
        </BOSFormSection>

        {/* PERSONNEL SECTION */}
        <BOSFormSection title="3. Participants & Host" icon={<IconUsers size={22} />}>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <Autocomplete
              multiple
              options={activeDepartments}
              getOptionLabel={(option) => option.departmentName || ''}
              value={form.departments}
              onChange={(e, val) => setForm(p => ({ ...p, departments: val }))}
              renderInput={(params) => <BOSTextField {...params} label="Target Department(s)" required error={!!errors.departments} fullWidth />}
            />
            
            <Autocomplete
              fullWidth
              options={employees.filter(e => e.isChaired === 'YES')}
              getOptionLabel={(option) => `${option.employeeName} (${option.empCode})`}
              value={form.chairedBy}
              onChange={(e, val) => setForm(p => ({ ...p, chairedBy: val }))}
              renderInput={(params) => <BOSTextField {...params} label="Chaired By" required error={!!errors.chairedBy} fullWidth />}
            />

            <Autocomplete
              fullWidth
              options={employees.filter(e => e.isHost === 'YES')}
              getOptionLabel={(option) => `${option.employeeName} (${option.empCode})`}
              value={form.hostBy}
              onChange={(e, val) => setForm(p => ({ ...p, hostBy: val }))}
              renderInput={(params) => <BOSTextField {...params} label="Host By" required error={!!errors.hostBy} fullWidth />}
            />

            <Autocomplete
              multiple
              options={employees.filter(e => e.isParticipants === 'YES')}
              getOptionLabel={(option) => `${option.employeeName} (${option.empCode})`}
              value={form.participants}
              onChange={(e, val) => setForm(p => ({ ...p, participants: val }))}
              renderInput={(params) => <BOSTextField {...params} label="Participants" required error={!!errors.participants} fullWidth />}
            />

            {/* PARTICIPANTS PREVIEW GALLERY */}
            {form.participants.length > 0 && (
              <Box sx={{ mt: 1 }}>
                <Typography variant="subtitle2" color="primary" sx={{ mb: 1, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <IconUsers size={18} /> SELECTED PARTICIPANTS ({form.participants.length})
                </Typography>
                <Grid container spacing={1.5}>
                  {form.participants.map((emp, idx) => (
                    <Grid item xs={12} sm={6} md={4} key={emp.id || idx}>
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
              </Box>
            )}

            {/* QUICK PREVIEW PANEL (CHAIRED & HOST) */}
            <BOSPersonnelCard 
              title="Chaired By"
              name={form.chairedBy?.employeeName}
              empCode={form.chairedBy?.empCode}
              department={form.chairedBy?.department?.departmentName}
              photo={form.chairedBy?.employeePhotoUpload}
              color="primary.main"
              bgcolor="primary.lighter"
            />
            
            <BOSPersonnelCard 
              title="Host By"
              name={form.hostBy?.employeeName}
              empCode={form.hostBy?.empCode}
              department={form.hostBy?.department?.departmentName}
              photo={form.hostBy?.employeePhotoUpload}
              color="secondary.main"
              bgcolor="secondary.lighter"
            />
          </Stack>
        </BOSFormSection>

        <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2, border: '1px dashed', borderColor: 'divider', textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary">All fields marked with * are mandatory for compliance.</Typography>
        </Box>
      </Stack>
    </BOSFormDialog>
  );
};

AddMeetingScheduleDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  item: PropTypes.object
};

export default AddMeetingScheduleDialog;
