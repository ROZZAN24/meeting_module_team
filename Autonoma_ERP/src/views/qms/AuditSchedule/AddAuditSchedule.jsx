import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Typography,
  Box,
  Button,
  TextField,
  Grid,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Divider,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox,
  Autocomplete
} from '@mui/material';
import { useColorScheme, useTheme } from '@mui/material/styles';
import { IconDeviceFloppy, IconPlus, IconTrash, IconX, IconEraser, IconCheck, IconFileDescription, IconCalendarEvent, IconUsers, IconListCheck } from '@tabler/icons-react';
import axios from 'utils/axios';
import MainCard from 'ui-component/cards/MainCard';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function AddAuditSchedule() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);
  const theme = useTheme();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const darkStyles = {
    dialog: {
      bgcolor: isDark ? '#161b22' : theme.palette.background.paper,
      color: isDark ? '#c9d1d9' : theme.palette.text.primary
    },
    input: {
      width: '100% !important',
      '& .MuiOutlinedInput-root': {
        width: '100%',
        bgcolor: isDark ? 'background.default' : 'grey.50',
        color: 'text.primary',
        '& fieldset': { borderColor: 'divider' },
        '&:hover fieldset': { borderColor: isDark ? '#8b949e' : theme.palette.primary.main },
        '&.Mui-focused fieldset': { borderColor: isDark ? '#58a6ff' : theme.palette.primary.main },
        '& input': { py: 1.2, fontSize: '0.9rem' },
        '& .MuiSelect-select': { py: 1.2, fontSize: '0.9rem', width: '100%', minWidth: '150px' }
      },
      '& .MuiInputLabel-root': { color: isDark ? '#8b949e' : theme.palette.text.secondary },
      '& .MuiSvgIcon-root': { color: isDark ? '#8b949e' : theme.palette.text.secondary },
      '& .MuiFormLabel-asterisk': { color: '#ef4444' }
    },
    btnSave: {
      bgcolor: 'success.main',
      color: '#fff',
      '&:hover': { bgcolor: 'success.dark', transform: 'translateY(-2px)', boxShadow: 6 },
      borderRadius: '24px',
      textTransform: 'none',
      px: 4,
      py: 1,
      fontWeight: 700,
      transition: 'all 0.2s',
      boxShadow: '0 4px 14px 0 rgba(0,0,0,0.1)'
    },
    btnClear: {
      bgcolor: 'secondary.main',
      color: '#fff',
      '&:hover': { bgcolor: 'secondary.dark', transform: 'translateY(-2px)', boxShadow: 6 },
      borderRadius: '24px',
      textTransform: 'none',
      px: 4,
      py: 1,
      fontWeight: 700,
      transition: 'all 0.2s'
    }
  };

  const [formData, setFormData] = useState({
    scheduleNo: '',
    scheduleDate: new Date().toISOString().split('T')[0],
    status: 'OPEN',
    auditType: '',
    auditArea: '',
    auditDate: new Date().toISOString().split('T')[0],
    auditMonth: MONTHS[new Date().getMonth()],
    startTime: '09:00',
    endTime: '17:00',
    department: '',
    auditee: '',
    auditor: '',
    ncrApprovedBy: ''
  });

  const [criteriaList, setCriteriaList] = useState([]);
  const [auditTypes, setAuditTypes] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [masterCriteria, setMasterCriteria] = useState([]);

  // Criteria Dialog state
  const [criteriaDialogOpen, setCriteriaDialogOpen] = useState(false);
  const [selectedCriteriaIds, setSelectedCriteriaIds] = useState([]);

  useEffect(() => {
    fetchDropdowns();
    if (isEditing) {
      fetchSchedule();
    } else {
      generateScheduleNo();
    }
  }, [id]);

  const fetchDropdowns = async () => {
    try {
      const [typeRes, deptRes, masterCritRes] = await Promise.all([
        axios.get('/api/master/qms/audit-type/active'),
        axios.get('/api/hrm/departments'),
        axios.get('/api/master/qms/audit-criteria')
      ]);
      setAuditTypes(typeRes.data);
      setDepartments(deptRes.data);
      setMasterCriteria(masterCritRes.data);
    } catch (error) {
      console.error('Failed to fetch dropdowns:', error);
      setAuditTypes([]);
      setMasterCriteria([]);
    }
  };

  const generateScheduleNo = async () => {
    try {
      const res = await axios.get('/api/qms/audit-schedules/next-no');
      setFormData((prev) => ({ ...prev, scheduleNo: res.data }));
    } catch (error) {
      console.error('Failed to get next schedule no:', error);
      setFormData((prev) => ({ ...prev, scheduleNo: `SCH-${Math.floor(1000 + Math.random() * 9000)}` }));
    }
  };

  const fetchSchedule = async () => {
    try {
      const res = await axios.get(`/api/qms/audit-schedules/${id}`);
      const data = res.data;
      setFormData({
        scheduleNo: data.scheduleNo || '',
        scheduleDate: data.scheduleDate ? data.scheduleDate.split('T')[0] : '',
        status: data.status || 'OPEN',
        auditType: data.auditType || '',
        auditArea: data.auditArea || '',
        auditDate: data.auditDate ? data.auditDate.split('T')[0] : '',
        auditMonth: data.auditMonth || '',
        startTime: data.startTime || '00:00',
        endTime: data.endTime || '00:00',
        department: data.department || '',
        auditee: data.auditee || '',
        auditor: data.auditor || '',
        ncrApprovedBy: data.ncrApprovedBy || ''
      });
      setCriteriaList(data.criteriaList || []);
    } catch (error) {
      console.error('Failed to fetch schedule:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    // 5. Validations
    const mandatoryFields = ['auditType', 'auditArea', 'auditDate', 'department', 'auditee', 'auditor'];
    for (let field of mandatoryFields) {
      if (!formData[field]) {
        alert(`${field.charAt(0).toUpperCase() + field.slice(1)} is mandatory.`);
        return;
      }
    }

    // Time Validation
    const startNum = parseInt(formData.startTime.replace(':', ''));
    const endNum = parseInt(formData.endTime.replace(':', ''));
    if (endNum <= startNum) {
      alert('End Time must be greater than Start Time.');
      return;
    }

    // Criteria Validation
    if (criteriaList.length === 0) {
      alert('At least one criteria must be added.');
      return;
    }

    try {
      const payload = {
        ...formData,
        criteriaList: criteriaList
      };

      if (isEditing) {
        await axios.put(`/api/qms/audit-schedules/${id}`, payload);
        alert('Audit Schedule updated successfully!');
      } else {
        await axios.post('/api/qms/audit-schedules', payload);
        alert('Audit Schedule created successfully!');
      }
      navigate('/qms/audit/schedule');
    } catch (error) {
      console.error('Failed to save:', error);
      alert('Error saving Audit Schedule.');
    }
  };

  const handleClear = () => {
    if (isEditing) {
      fetchSchedule();
    } else {
      setFormData({
        scheduleNo: '',
        scheduleDate: new Date().toISOString().split('T')[0],
        status: 'OPEN',
        auditType: '',
        auditArea: '',
        auditDate: new Date().toISOString().split('T')[0],
        auditMonth: MONTHS[new Date().getMonth()],
        startTime: '09:00',
        endTime: '17:00',
        department: '',
        auditee: '',
        auditor: '',
        ncrApprovedBy: ''
      });
      setCriteriaList([]);
      generateScheduleNo();
    }
  };

  const handleRemoveCriteria = (index) => {
    setCriteriaList((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddSelectedCriteria = () => {
    const selected = masterCriteria.filter((c) => selectedCriteriaIds.includes(c.id));

    const newItems = selected.map((c, idx) => ({
      seqNo: c.seqNo || criteriaList.length + idx + 1,
      clause: c.clause || '',
      criteriaDetails: c.criteriaText || '',
      attachmentReq: c.attachmentRequired || 'NO',
      remarks: ''
    }));

    setCriteriaList((prev) => [...prev, ...newItems]);
    setSelectedCriteriaIds([]);
    setCriteriaDialogOpen(false);
  };

  return (
    <>
      <MainCard
        title="Audit Schedule Creation"
        secondary={
          <Stack direction="row" spacing={2}>
            <Button variant="outlined" color="secondary" onClick={handleClear} startIcon={<IconEraser size={20} />}>
              Clear
            </Button>
            <Button variant="contained" color="primary" onClick={handleSave} startIcon={<IconCheck size={20} />}>
              Save
            </Button>
          </Stack>
        }
      >
        <Stack spacing={3}>
          {/* Card 1: General Information */}
          <Card sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '16px', boxShadow: 2 }}>
            <Box sx={{ bgcolor: isDark ? 'background.default' : 'grey.50', py: 1.5, px: 3, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconFileDescription size={20} color={theme.palette.primary.main} />
              <Typography variant="h6" color="text.primary" fontWeight={600}>General Information</Typography>
            </Box>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' }, 
                gap: 2.5 
              }}>
                <TextField label="Schedule No" value={formData.scheduleNo} InputProps={{ readOnly: true }} sx={darkStyles.input} />
                <TextField
                  required
                  error={!formData.scheduleDate}
                  helperText={!formData.scheduleDate ? 'Please fill this' : ''}
                  label="Schedule Date"
                  type="date"
                  name="scheduleDate"
                  value={formData.scheduleDate}
                  onChange={handleChange}
                  sx={darkStyles.input}
                  InputLabelProps={{ shrink: true }}
                />
                <TextField select label="Status" name="status" value={formData.status} onChange={handleChange} sx={darkStyles.input}>
                  <MenuItem value="OPEN">OPEN</MenuItem>
                  <MenuItem value="CLOSED">CLOSED</MenuItem>
                  <MenuItem value="CANCELLED">CANCELLED</MenuItem>
                </TextField>
                <Autocomplete
                  options={departments}
                  getOptionLabel={(option) => option.departmentName || ''}
                  value={departments.find((d) => d.departmentName === formData.department) || null}
                  onChange={(event, newValue) => {
                    setFormData({ ...formData, department: newValue ? newValue.departmentName : '' });
                  }}
                  renderInput={(params) => (
                    <TextField 
                      {...params} 
                      required 
                      error={!formData.department}
                      helperText={!formData.department ? 'Please fill this' : ''}
                      label="Department" 
                      sx={darkStyles.input} 
                    />
                  )}
                />
              </Box>
            </CardContent>
          </Card>

          {/* Card 2: Audit Specifics */}
          <Card sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '16px', boxShadow: 2 }}>
            <Box sx={{ bgcolor: isDark ? 'background.default' : 'grey.50', py: 1.5, px: 3, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconCalendarEvent size={20} color={theme.palette.secondary.main} />
              <Typography variant="h6" color="text.primary" fontWeight={600}>Audit Specifics</Typography>
            </Box>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, 
                gap: 2.5 
              }}>
                <Autocomplete
                  multiple
                  disableCloseOnSelect
                  options={auditTypes}
                  getOptionLabel={(option) => option.auditType || ''}
                  value={auditTypes.filter((t) => (formData.auditType ? formData.auditType.split(',').includes(t.auditType) : false))}
                  onChange={(event, newValue) => {
                    setFormData({ ...formData, auditType: newValue.map((v) => v.auditType).join(',') });
                  }}
                  renderInput={(params) => (
                    <TextField 
                      {...params} 
                      required
                      error={!formData.auditType}
                      helperText={!formData.auditType ? 'Please fill this' : ''}
                      label="Audit Type" 
                      sx={darkStyles.input} 
                    />
                  )}
                />
                <TextField
                  required
                  error={!formData.auditArea}
                  helperText={!formData.auditArea ? 'Please fill this' : ''}
                  label="Audit Area"
                  name="auditArea"
                  value={formData.auditArea}
                  onChange={handleChange}
                  sx={darkStyles.input}
                />
                <TextField
                  required
                  error={!formData.auditDate}
                  helperText={!formData.auditDate ? 'Please fill this' : ''}
                  label="Audit Date"
                  type="date"
                  name="auditDate"
                  value={formData.auditDate}
                  onChange={handleChange}
                  sx={darkStyles.input}
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  select
                  required
                  error={!formData.auditMonth}
                  helperText={!formData.auditMonth ? 'Please fill this' : ''}
                  label="Audit Month"
                  name="auditMonth"
                  value={formData.auditMonth}
                  onChange={handleChange}
                  sx={darkStyles.input}
                >
                  {MONTHS.map((m) => (
                    <MenuItem key={m} value={m}>
                      {m}
                    </MenuItem>
                  ))}
                </TextField>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TextField
                    select
                    fullWidth
                    label="Start Hour"
                    value={formData.startTime.split(':')[0]}
                    onChange={(e) => setFormData({ ...formData, startTime: `${e.target.value}:${formData.startTime.split(':')[1]}` })}
                    sx={darkStyles.input}
                  >
                    {Array.from({ length: 24 }).map((_, i) => (
                      <MenuItem key={i} value={i.toString().padStart(2, '0')}>
                        {i.toString().padStart(2, '0')}
                      </MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    select
                    fullWidth
                    label="Start Min"
                    value={formData.startTime.split(':')[1]}
                    onChange={(e) => setFormData({ ...formData, startTime: `${formData.startTime.split(':')[0]}:${e.target.value}` })}
                    sx={darkStyles.input}
                  >
                    {Array.from({ length: 60 }).map((_, i) => (
                      <MenuItem key={i} value={i.toString().padStart(2, '0')}>
                        {i.toString().padStart(2, '0')}
                      </MenuItem>
                    ))}
                  </TextField>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TextField
                    select
                    fullWidth
                    label="End Hour"
                    value={formData.endTime.split(':')[0]}
                    onChange={(e) => setFormData({ ...formData, endTime: `${e.target.value}:${formData.endTime.split(':')[1]}` })}
                    sx={darkStyles.input}
                  >
                    {Array.from({ length: 24 }).map((_, i) => (
                      <MenuItem key={i} value={i.toString().padStart(2, '0')}>
                        {i.toString().padStart(2, '0')}
                      </MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    select
                    fullWidth
                    label="End Min"
                    value={formData.endTime.split(':')[1]}
                    onChange={(e) => setFormData({ ...formData, endTime: `${formData.endTime.split(':')[0]}:${e.target.value}` })}
                    sx={darkStyles.input}
                  >
                    {Array.from({ length: 60 }).map((_, i) => (
                      <MenuItem key={i} value={i.toString().padStart(2, '0')}>
                        {i.toString().padStart(2, '0')}
                      </MenuItem>
                    ))}
                  </TextField>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Card 3: Personnel Information */}
          <Card sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '16px', boxShadow: 2 }}>
            <Box sx={{ bgcolor: isDark ? 'background.default' : 'grey.50', py: 1.5, px: 3, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconUsers size={20} color={theme.palette.warning.main} />
              <Typography variant="h6" color="text.primary" fontWeight={600}>Personnel Information</Typography>
            </Box>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, 
                gap: 3 
              }}>
                {[
                  { role: 'AUDITEE', field: 'auditee', label: 'Auditee', options: ['RAM GANESH - NT07L2-20059', 'OTHERS'] },
                  { role: 'AUDITOR', field: 'auditor', label: 'Auditor', options: ['UMAPATHY - NT09L4-19036', 'OTHERS'] },
                  { role: 'NCR APPROVED BY', field: 'ncrApprovedBy', label: 'NCR Approved By', options: ['SIVARAMAN - NT10L5-16025', 'OTHERS'] }
                ].map((person) => {
                  const value = formData[person.field];
                  const name = value ? value.split(' - ')[0] : '-';
                  const code = value ? value.split(' - ')[1] || '-' : '-';

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
                      minWidth: 0 // Prevent flex/grid overflow
                    }}>
                      {/* Banner Background */}
                      <Box sx={{ height: 60, bgcolor: isDark ? 'primary.dark' : 'primary.light', width: '100%', position: 'absolute', top: 0, left: 0, opacity: isDark ? 0.3 : 0.6 }} />
                      
                      <CardContent sx={{ p: 3, pt: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 1, flexGrow: 1 }}>
                        {/* Avatar / Future Image Placeholder */}
                        <Box sx={{ 
                          width: 100, 
                          height: 100, 
                          borderRadius: '50%', 
                          bgcolor: isDark ? '#1c2128' : '#fff', 
                          border: '4px solid', 
                          borderColor: isDark ? 'background.default' : '#fff', 
                          display: 'flex', 
                          justifyContent: 'center', 
                          alignItems: 'center', 
                          color: 'primary.main',
                          boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                          mb: 2
                        }}>
                          <IconUsers size={48} />
                        </Box>
                        
                        <Typography variant="overline" color="primary.main" sx={{ fontWeight: 800, letterSpacing: 1, mb: 0.5, fontSize: '0.8rem', lineHeight: 1 }}>
                          {person.role}
                        </Typography>
                        
                        <Typography variant="h6" fontWeight={700} color="text.primary" noWrap sx={{ width: '100%', textAlign: 'center', mb: 1, minHeight: '28px' }}>
                          {name !== '-' ? name : 'Not Selected'}
                        </Typography>
                        
                        <Box sx={{ bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'grey.100', px: 2.5, py: 0.5, borderRadius: '16px', mb: 3 }}>
                          <Typography variant="body2" color="text.secondary" fontWeight={600} noWrap>
                            {code !== '-' ? code : 'No Code'}
                          </Typography>
                        </Box>

                        {/* Dropdown Selector */}
                        <Box sx={{ width: '100%', mt: 'auto' }}>
                          <TextField
                            select
                            fullWidth
                            required
                            error={!formData[person.field]}
                            helperText={!formData[person.field] ? 'Please fill this' : ''}
                            label={`Select ${person.label}`}
                            name={person.field}
                            value={formData[person.field]}
                            onChange={handleChange}
                            sx={darkStyles.input}
                          >
                            <MenuItem value="">-Select-</MenuItem>
                            {person.options.map((opt) => (
                              <MenuItem key={opt} value={opt}>
                                {opt}
                              </MenuItem>
                            ))}
                          </TextField>
                        </Box>
                      </CardContent>
                    </Card>
                  );
                })}
              </Box>
            </CardContent>
          </Card>

          {/* Card 4: Audit Criteria Checklist */}
          <Card sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '16px', boxShadow: 2 }}>
            <Box sx={{ bgcolor: isDark ? 'background.default' : 'grey.50', py: 1.5, px: 3, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <IconListCheck size={20} color={theme.palette.success.main} />
                <Typography variant="h6" color="text.primary" fontWeight={600}>Audit Criteria Checklist</Typography>
              </Box>
              <Button
                variant="contained"
                size="small"
                onClick={() => setCriteriaDialogOpen(true)}
                startIcon={<IconPlus size={16} />}
                sx={{ borderRadius: '8px' }}
              >
                Add Criteria
              </Button>
            </Box>
            <CardContent sx={{ p: 3 }}>
              <TableContainer
                component={Paper}
                sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '12px', boxShadow: 'none' }}
              >
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      {['#', 'Seq No', 'Clause', 'Criteria Details', 'Attachment Req', 'Remarks', 'Action'].map((head) => (
                        <TableCell
                          key={head}
                          sx={{
                            bgcolor: 'primary.dark',
                            color: 'primary.light',
                            fontWeight: 600,
                            py: 1.5,
                            borderBottom: 'none',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {head}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {criteriaList.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                          No criteria added.
                        </TableCell>
                      </TableRow>
                    ) : (
                      criteriaList.map((criteria, index) => (
                        <TableRow key={index} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>{criteria.seqNo}</TableCell>
                          <TableCell>{criteria.clause}</TableCell>
                          <TableCell>{criteria.criteriaDetails}</TableCell>
                          <TableCell>{criteria.attachmentReq}</TableCell>
                          <TableCell>{criteria.remarks}</TableCell>
                          <TableCell align="center">
                            <IconButton color="error" size="small" onClick={() => handleRemoveCriteria(index)}>
                              <IconTrash size={16} />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Stack>
      </MainCard>

      {/* Add Criteria Dialog */}
      <Dialog
        open={criteriaDialogOpen}
        onClose={() => setCriteriaDialogOpen(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            height: 'auto',
            maxHeight: '95vh',
            bgcolor: darkStyles.dialog.bgcolor,
            backgroundImage: 'none',
            borderRadius: '24px',
            border: isDark ? '1px solid #30363d' : 'none',
            boxShadow: isDark ? '0 24px 48px rgba(0,0,0,0.5)' : '0 24px 48px rgba(0,0,0,0.1)'
          }
        }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            bgcolor: isDark ? 'background.default' : 'primary.light',
            borderBottom: '1px solid',
            borderColor: 'divider',
            py: 2.5,
            px: 4
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 600, color: isDark ? '#58a6ff' : theme.palette.primary.main, fontSize: '1.25rem' }}>
            Audit Criteria Checklist
          </Typography>
          <IconButton
            onClick={() => setCriteriaDialogOpen(false)}
            size="small"
            sx={{ color: isDark ? '#8b949e' : theme.palette.text.secondary }}
          >
            <IconX size={24} />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 0, bgcolor: '#f1f4f6' }}>
          <Box sx={{ p: 1.5 }}>
            <TableContainer component={Paper} sx={{ border: '1px solid #455a64', borderRadius: 0 }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox" sx={{ bgcolor: '#607d8b', color: 'white', borderRight: '1px solid #78909c' }}>
                      <Checkbox
                        size="small"
                        sx={{ color: 'white', '&.Mui-checked': { color: 'white' }, '&.MuiCheckbox-indeterminate': { color: 'white' } }}
                        indeterminate={
                          selectedCriteriaIds.length > 0 &&
                          selectedCriteriaIds.length <
                            masterCriteria.filter((c) => {
                              const selectedTypes = formData.auditType.split(',').filter((t) => t);
                              const criteriaTypes = c.auditType ? c.auditType.split(', ') : [];
                              return (
                                selectedTypes.some((st) => criteriaTypes.includes(st)) &&
                                !criteriaList.some((cl) => cl.criteriaDetails === c.criteriaText)
                              );
                            }).length
                        }
                        checked={
                          selectedCriteriaIds.length > 0 &&
                          selectedCriteriaIds.length ===
                            masterCriteria.filter((c) => {
                              const selectedTypes = formData.auditType.split(',').filter((t) => t);
                              const criteriaTypes = c.auditType ? c.auditType.split(', ') : [];
                              return (
                                selectedTypes.some((st) => criteriaTypes.includes(st)) &&
                                !criteriaList.some((cl) => cl.criteriaDetails === c.criteriaText)
                              );
                            }).length
                        }
                        onChange={(e) => {
                          if (e.target.checked) {
                            const filtered = masterCriteria.filter((c) => {
                              const selectedTypes = formData.auditType.split(',').filter((t) => t);
                              const criteriaTypes = c.auditType ? c.auditType.split(', ') : [];
                              return (
                                selectedTypes.some((st) => criteriaTypes.includes(st)) &&
                                !criteriaList.some((cl) => cl.criteriaDetails === c.criteriaText)
                              );
                            });
                            setSelectedCriteriaIds(filtered.map((c) => c.id));
                          } else {
                            setSelectedCriteriaIds([]);
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell
                      sx={{ bgcolor: '#607d8b', color: 'white', fontWeight: 700, fontSize: '0.75rem', borderRight: '1px solid #78909c' }}
                    >
                      #
                    </TableCell>
                    <TableCell
                      sx={{ bgcolor: '#607d8b', color: 'white', fontWeight: 700, fontSize: '0.75rem', borderRight: '1px solid #78909c' }}
                    >
                      Seq No
                    </TableCell>
                    <TableCell
                      sx={{ bgcolor: '#607d8b', color: 'white', fontWeight: 700, fontSize: '0.75rem', borderRight: '1px solid #78909c' }}
                    >
                      Clause
                    </TableCell>
                    <TableCell
                      sx={{
                        bgcolor: '#607d8b',
                        color: 'white',
                        fontWeight: 700,
                        fontSize: '0.75rem',
                        borderRight: '1px solid #78909c',
                        width: '40%'
                      }}
                    >
                      Criteria Details
                    </TableCell>
                    <TableCell sx={{ bgcolor: '#607d8b', color: 'white', fontWeight: 700, fontSize: '0.75rem' }}>Attachment Req</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {masterCriteria
                    .filter((c) => {
                      const selectedTypes = formData.auditType.split(',').filter((t) => t);
                      const criteriaTypes = c.auditType ? c.auditType.split(', ') : [];
                      const matchesType = selectedTypes.some((st) => criteriaTypes.includes(st));
                      const isAlreadyAdded = criteriaList.some((cl) => cl.criteriaDetails === c.criteriaText);
                      return matchesType && !isAlreadyAdded;
                    })
                    .map((crit, idx) => (
                      <TableRow
                        key={crit.id}
                        hover
                        onClick={() => {
                          const idIdx = selectedCriteriaIds.indexOf(crit.id);
                          if (idIdx > -1) {
                            setSelectedCriteriaIds((prev) => prev.filter((id) => id !== crit.id));
                          } else {
                            setSelectedCriteriaIds((prev) => [...prev, crit.id]);
                          }
                        }}
                        sx={{ cursor: 'pointer', '&:nth-of-type(even)': { bgcolor: '#f9f9f9' } }}
                      >
                        <TableCell padding="checkbox" sx={{ borderRight: '1px solid #e0e0e0' }}>
                          <Checkbox
                            size="small"
                            checked={selectedCriteriaIds.indexOf(crit.id) > -1}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedCriteriaIds((prev) => [...prev, crit.id]);
                              } else {
                                setSelectedCriteriaIds((prev) => prev.filter((id) => id !== crit.id));
                              }
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.75rem', borderRight: '1px solid #e0e0e0' }}>{idx + 1}</TableCell>
                        <TableCell sx={{ fontSize: '0.75rem', borderRight: '1px solid #e0e0e0' }}>{crit.seqNo}</TableCell>
                        <TableCell sx={{ fontSize: '0.75rem', borderRight: '1px solid #e0e0e0' }}>{crit.clause}</TableCell>
                        <TableCell sx={{ fontSize: '0.75rem', borderRight: '1px solid #e0e0e0', lineHeight: 1.4 }}>
                          {crit.criteriaText}
                        </TableCell>
                        <TableCell
                          sx={{
                            fontSize: '0.75rem',
                            fontWeight: 'bold',
                            color: crit.attachmentRequired === 'YES' ? '#2e7d32' : 'inherit',
                            bgcolor: crit.attachmentRequired === 'YES' ? '#c8e6c9' : 'transparent',
                            textAlign: 'center'
                          }}
                        >
                          {crit.attachmentRequired}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Paginator Placeholder as per screenshot */}
            <Box
              sx={{
                bgcolor: '#37474f',
                color: 'white',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                py: 0.5,
                mt: -0.1,
                fontSize: '0.75rem'
              }}
            >
              <Typography sx={{ fontSize: '0.75rem' }}>
                Showing 1-
                {
                  masterCriteria.filter((c) => {
                    const selectedTypes = formData.auditType.split(',').filter((t) => t);
                    const criteriaTypes = c.auditType ? c.auditType.split(', ') : [];
                    return (
                      selectedTypes.some((st) => criteriaTypes.includes(st)) &&
                      !criteriaList.some((cl) => cl.criteriaDetails === c.criteriaText)
                    );
                  }).length
                }{' '}
                out of{' '}
                {
                  masterCriteria.filter((c) => {
                    const selectedTypes = formData.auditType.split(',').filter((t) => t);
                    const criteriaTypes = c.auditType ? c.auditType.split(', ') : [];
                    return (
                      selectedTypes.some((st) => criteriaTypes.includes(st)) &&
                      !criteriaList.some((cl) => cl.criteriaDetails === c.criteriaText)
                    );
                  }).length
                }
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions
          sx={{
            p: 3,
            borderTop: isDark ? '1px solid #30363d' : `1px solid ${theme.palette.divider}`,
            justifyContent: 'flex-end',
            bgcolor: darkStyles.dialog.bgcolor
          }}
        >
          <Button
            variant="contained"
            onClick={handleAddSelectedCriteria}
            disabled={selectedCriteriaIds.length === 0}
            startIcon={<IconDeviceFloppy size={20} />}
            sx={darkStyles.btnSave}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
