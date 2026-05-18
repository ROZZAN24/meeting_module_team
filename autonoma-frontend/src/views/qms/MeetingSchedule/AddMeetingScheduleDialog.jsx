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
  Grid,
  Card,
  CardContent,
  Avatar
} from '@mui/material';
import { useColorScheme } from '@mui/material/styles';
import {
  BOSFormDialog,
  BOSTextField, BOSAutocomplete,
  BOSFormSection,
  BOSPersonnelCard,
  getPhotoUrl
} from 'ui-component/bos';
import useBOSValidation from 'hooks/useBOSValidation';
import { useLookups } from 'hooks/useLookups';
import { IconSettings, IconCalendarEvent, IconUsers, IconFileText } from '@tabler/icons-react';

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

const AddMeetingScheduleDialog = ({ open, onClose, onSave, item }) => {
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
  const [form, setForm] = useState(INITIAL_FORM);

  const filteredTimeOptions = useMemo(() => {
    // Original logic: Restricted 9:00 AM to 11:00 PM for scheduling, up to 9:00 PM for modifications
    const limit = item ? 21 : 23;
    return ALL_TIME_OPTIONS.filter((t) => {
      const isAfter9AM = t.hour24 >= 9;
      const isBeforeLimit = t.hour24 < limit || (t.hour24 === limit && t.minutes === 0);
      return isAfter9AM && isBeforeLimit;
    }).map((t) => t.label);
  }, [item]);

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

  const h = (e) => handleInputChange(e, setForm);

  // Auto-populate based on Meeting Type
  useEffect(() => {
    if (form.meetingType && !item && employees.length > 0) {
      // Find matching employees based on codes/names stored in Meeting Master
      const masterEmpEntries = (form.meetingType.employeeName || '').split(',').map(s => s.trim()).filter(Boolean);
      
      const matchedParticipants = employees.filter(emp => 
        masterEmpEntries.some(entry => {
          // Check for new hyphen standard or legacy semicolon
          const separator = entry.includes(' - ') ? ' - ' : entry.includes(';') ? ';' : null;
          if (separator) {
            const [code] = entry.split(separator);
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
              onChange={(e, val) => {
                setForm(p => ({ ...p, meetingType: val }));
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
        <BOSFormSection title="3. Participants & Host" icon={<IconUsers size={22} />}>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <Autocomplete
              multiple
              options={activeDepartments}
              getOptionLabel={(option) => option.departmentName || ''}
              value={form.departments}
              onChange={(e, val) => {
                setForm(p => ({ ...p, departments: val }));
                if (errors.departments) clearErrors('departments');
              }}
              renderInput={(params) => <BOSTextField {...params} label="Target Department(s)" required error={!!errors.departments} fullWidth />}
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

                // Resolution for Level
                let level = '-';
                if (selectedEmp) {
                  const levelMatch = levels.find(l => String(l.rowId || l.id) === String(selectedEmp.empLevelId));
                  const desigMatch = designations.find(d => String(d.id) === String(selectedEmp.designationId));
                  level = levelMatch?.level || desigMatch?.designationName || '-';
                }

                const filteredEmployees = employees.filter(emp => emp.status === 'Active' && person.filter(emp));

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
                        options={filteredEmployees}
                        getOptionLabel={(option) => `${option.employeeName} (${option.empCode})`}
                        value={selectedEmp}
                        onChange={(e, val) => {
                          setForm(p => ({ ...p, [person.field]: val }));
                          if (errors[person.field]) clearErrors(person.field);
                        }}
                        renderInput={(params) => <BOSTextField {...params} label={`Select ${person.label}`} required error={!!errors[person.field]} fullWidth />}
                      />
                    </CardContent>
                  </Card>
                );
              })}
            </Box>

            <Divider sx={{ my: 1 }} />

            <Autocomplete
              multiple
              options={employees.filter(e => e.isParticipants === 'YES')}
              getOptionLabel={(option) => `${option.employeeName} (${option.empCode})`}
              value={form.participants}
              onChange={(e, val) => {
                setForm(p => ({ ...p, participants: val }));
                if (errors.participants) clearErrors('participants');
              }}
              renderInput={(params) => <BOSTextField {...params} label="Participants" required error={!!errors.participants} fullWidth />}
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
                      {/* Original + Duplicate for seamless scroll */}
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
