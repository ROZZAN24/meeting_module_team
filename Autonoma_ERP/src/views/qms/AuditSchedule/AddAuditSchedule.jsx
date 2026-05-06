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
  Tooltip,
  Divider,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox,
  Autocomplete,
  ListItemText
} from '@mui/material';
import { IconDeviceFloppy, IconArrowLeft, IconPlus, IconTrash, IconClearAll, IconX } from '@tabler/icons-react';
import axios from 'utils/axios';
import AnimateButton from 'ui-component/extended/AnimateButton';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function AddAuditSchedule() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

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
  const [loading, setLoading] = useState(false);
  const [auditTypes, setAuditTypes] = useState([]);
  const [auditAreas, setAuditAreas] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [masterCriteria, setMasterCriteria] = useState([]);

  // Criteria Dialog state
  const [criteriaDialogOpen, setCriteriaDialogOpen] = useState(false);
  const [criteriaForm, setCriteriaForm] = useState({
    seqNo: '',
    clause: '',
    criteriaDetails: '',
    attachmentReq: 'NO',
    remarks: ''
  });
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
      const [typeRes, areaRes, deptRes, masterCritRes] = await Promise.all([
        axios.get('/api/master/qms/audit-type/active'),
        axios.get('/api/master/qms/audit-area'),
        axios.get('/api/hrm/departments'),
        axios.get('/api/master/qms/audit-criteria')
      ]);
      setAuditTypes(typeRes.data);
      setAuditAreas(areaRes.data);
      setDepartments(deptRes.data);
      setMasterCriteria(masterCritRes.data);
    } catch (error) {
      console.error('Failed to fetch dropdowns:', error);
      setAuditTypes([]);
      setAuditAreas([]);
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
    setLoading(true);
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
    } finally {
      setLoading(false);
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

  const handleAddCriteria = () => {
    setCriteriaList((prev) => [...prev, { ...criteriaForm, seqNo: prev.length + 1 }]);
    setCriteriaDialogOpen(false);
    setCriteriaForm({ seqNo: '', clause: '', criteriaDetails: '', attachmentReq: 'NO', remarks: '' });
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
    <Box sx={{ p: 2, bgcolor: 'white', minHeight: 'calc(100vh - 100px)' }}>
      {/* Top Bar for Back/Save/Clear if needed, or put them at bottom. User image doesn't show them at top. */}
      <Stack direction="row" justifyContent="space-between" mb={2}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <IconButton onClick={() => navigate('/qms/audit/schedule')} size="small" color="primary">
            <IconArrowLeft />
          </IconButton>
          <Typography variant="h4" color="primary">
            Audit Schedule Creation
          </Typography>
        </Stack>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" size="small" onClick={handleClear}>
            Clear
          </Button>
          <Button variant="contained" size="small" onClick={handleSave}>
            Save
          </Button>
        </Stack>
      </Stack>

      <Grid container spacing={2}>
        {/* LEFT SIDE FORM */}
        <Grid item xs={12} md={6}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, fontSize: '0.85rem' }}>
            {/* Row 1: Schedule No, Date, Status */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="body2" sx={{ width: 80, fontSize: '0.8rem' }}>
                  Schedule No
                </Typography>
                <input
                  readOnly
                  value={formData.scheduleNo}
                  style={{
                    backgroundColor: '#a5d6a7',
                    border: '1px solid #ccc',
                    padding: '2px 6px',
                    height: '24px',
                    width: '130px',
                    color: '#000'
                  }}
                />
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="body2" sx={{ width: 40, fontSize: '0.8rem' }}>
                  Date
                </Typography>
                <input
                  type="date"
                  name="scheduleDate"
                  value={formData.scheduleDate}
                  onChange={handleChange}
                  style={{
                    backgroundColor: '#a5d6a7',
                    border: '1px solid #ccc',
                    padding: '2px 6px',
                    height: '24px',
                    width: '120px',
                    color: '#000'
                  }}
                />
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="body2" sx={{ width: 50, fontSize: '0.8rem' }}>
                  Status
                </Typography>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  style={{
                    backgroundColor: '#a5d6a7',
                    border: '1px solid #ccc',
                    padding: '2px 6px',
                    height: '24px',
                    width: '100px',
                    color: '#000'
                  }}
                >
                  <option value="OPEN">OPEN</option>
                  <option value="CLOSED">CLOSED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </Box>
            </Box>

            {/* Audit Type (Searchable Multi-select) */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Typography variant="body2" sx={{ width: 120, fontSize: '0.8rem', color: '#333' }}>
                Audit Type
              </Typography>
              <Autocomplete
                multiple
                disableCloseOnSelect
                id="audit-type-schedule"
                options={auditTypes}
                getOptionLabel={(option) => option.auditType || ''}
                value={auditTypes.filter((t) => (formData.auditType ? formData.auditType.split(',').includes(t.auditType) : false))}
                onChange={(event, newValue) => {
                  setFormData({
                    ...formData,
                    auditType: newValue.map((v) => v.auditType).join(',')
                  });
                }}
                sx={{ flexGrow: 1 }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    size="small"
                    placeholder="Select Audit Types"
                    sx={{
                      '& .MuiInputBase-root': { py: 0.2, minHeight: '30px' },
                      '& .MuiOutlinedInput-input': { p: '2px !important' }
                    }}
                  />
                )}
                renderOption={(props, option, { selected }) => (
                  <li {...props} style={{ padding: '4px 8px' }}>
                    <Checkbox size="small" style={{ marginRight: 4 }} checked={selected} />
                    <Typography variant="body2">{option.auditType}</Typography>
                  </li>
                )}
              />
            </Box>

            {/* Department (Searchable) */}

            {/* Audit Area */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Typography variant="body2" sx={{ width: 120, fontSize: '0.8rem', color: '#333' }}>
                Audit Area <span style={{ color: 'red' }}>*</span>
              </Typography>
              <input
                type="text"
                name="auditArea"
                value={formData.auditArea}
                onChange={handleChange}
                style={{ flexGrow: 1, padding: '4px', border: '1px solid #ccc', height: '28px' }}
              />
            </Box>

            {/* Audit Date */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Typography variant="body2" sx={{ width: 120, fontSize: '0.8rem', color: '#333' }}>
                Audit Date
              </Typography>
              <input
                type="date"
                name="auditDate"
                value={formData.auditDate}
                onChange={handleChange}
                style={{ flexGrow: 1, padding: '4px', border: '1px solid #ccc', height: '28px' }}
              />
            </Box>

            {/* Audit Month */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Typography variant="body2" sx={{ width: 120, fontSize: '0.8rem', color: '#333' }}>
                Audit Month
              </Typography>
              <select
                name="auditMonth"
                value={formData.auditMonth}
                onChange={handleChange}
                style={{ flexGrow: 1, padding: '4px', border: '1px solid #ccc', height: '28px' }}
              >
                {MONTHS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </Box>

            {/* Start Time */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Typography variant="body2" sx={{ width: 120, fontSize: '0.8rem', color: '#333' }}>
                Start Time
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <select
                  value={formData.startTime.split(':')[0]}
                  onChange={(e) => setFormData({ ...formData, startTime: `${e.target.value}:${formData.startTime.split(':')[1]}` })}
                  style={{ padding: '2px', border: '1px solid #ccc' }}
                >
                  {Array.from({ length: 24 }).map((_, i) => (
                    <option key={i} value={i.toString().padStart(2, '0')}>
                      {i.toString().padStart(2, '0')}
                    </option>
                  ))}
                </select>
                <span>:</span>
                <select
                  value={formData.startTime.split(':')[1]}
                  onChange={(e) => setFormData({ ...formData, startTime: `${formData.startTime.split(':')[0]}:${e.target.value}` })}
                  style={{ padding: '2px', border: '1px solid #ccc' }}
                >
                  {Array.from({ length: 60 }).map((_, i) => (
                    <option key={i} value={i.toString().padStart(2, '0')}>
                      {i.toString().padStart(2, '0')}
                    </option>
                  ))}
                </select>
              </Box>
            </Box>

            {/* End Time */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Typography variant="body2" sx={{ width: 120, fontSize: '0.8rem', color: '#333' }}>
                End Time
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <select
                  value={formData.endTime.split(':')[0]}
                  onChange={(e) => setFormData({ ...formData, endTime: `${e.target.value}:${formData.endTime.split(':')[1]}` })}
                  style={{ padding: '2px', border: '1px solid #ccc' }}
                >
                  {Array.from({ length: 24 }).map((_, i) => (
                    <option key={i} value={i.toString().padStart(2, '0')}>
                      {i.toString().padStart(2, '0')}
                    </option>
                  ))}
                </select>
                <span>:</span>
                <select
                  value={formData.endTime.split(':')[1]}
                  onChange={(e) => setFormData({ ...formData, endTime: `${formData.endTime.split(':')[0]}:${e.target.value}` })}
                  style={{ padding: '2px', border: '1px solid #ccc' }}
                >
                  {Array.from({ length: 60 }).map((_, i) => (
                    <option key={i} value={i.toString().padStart(2, '0')}>
                      {i.toString().padStart(2, '0')}
                    </option>
                  ))}
                </select>
              </Box>
            </Box>

            {/* Department selection */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Typography variant="body2" sx={{ width: 120, fontSize: '0.8rem', color: '#333' }}>
                Department
              </Typography>
              <Autocomplete
                id="department-schedule-main"
                options={departments}
                getOptionLabel={(option) => option.departmentName || ''}
                value={departments.find((d) => d.departmentName === formData.department) || null}
                onChange={(event, newValue) => {
                  setFormData({
                    ...formData,
                    department: newValue ? newValue.departmentName : ''
                  });
                }}
                sx={{ flexGrow: 1 }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    size="small"
                    placeholder="Search Department"
                    sx={{
                      '& .MuiInputBase-root': { py: 0.2, minHeight: '28px' },
                      '& .MuiOutlinedInput-input': { p: '2px !important' }
                    }}
                  />
                )}
              />
            </Box>

            {/* Roles */}
            {[
              { label: 'Auditee', name: 'auditee', options: ['RAM GANESH - NT07L2-20059', 'OTHERS'] },
              { label: 'Auditor', name: 'auditor', options: ['UMAPATHY - NT09L4-19036', 'OTHERS'], highlight: true },
              { label: 'NCR Approved By', name: 'ncrApprovedBy', options: ['SIVARAMAN - NT10L5-16025', 'OTHERS'] }
            ].map((field) => (
              <Box key={field.name} sx={{ display: 'flex', alignItems: 'center', mb: 1.2 }}>
                <Typography variant="body2" sx={{ width: 140, fontSize: '0.85rem', fontWeight: 600, color: '#333' }}>
                  {field.label}
                </Typography>
                <select
                  name={field.name}
                  value={formData[field.name]}
                  onChange={handleChange}
                  style={{
                    flexGrow: 1,
                    padding: '4px 8px',
                    border: '1px solid #ccc',
                    height: '30px',
                    borderRadius: '4px',
                    backgroundColor: field.highlight ? '#f1f8e9' : 'white'
                  }}
                >
                  <option value="">-Select-</option>
                  {field.options.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </Box>
            ))}
          </Box>
        </Grid>

        {/* RIGHT SIDE INFO PANELS */}
        <Grid item xs={12} md={6}>
          <Grid container spacing={1} sx={{ border: '1px solid #ccc', height: '100%' }}>
            {['AUDITEE', 'AUDITOR', 'NCR APPROVED BY'].map((role, idx) => (
              <Grid item xs={4} key={role} sx={{ borderRight: idx < 2 ? '1px solid #ccc' : 'none' }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: 'white' }}>
                  <Box sx={{ bgcolor: '#4e73df', color: 'white', py: 1, textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ fontSize: '0.9rem', fontWeight: 700 }}>
                      {role}
                    </Typography>
                  </Box>
                  <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', flexGrow: 1 }}>
                    <Box
                      sx={{
                        width: 120,
                        height: 140,
                        bgcolor: '#e0e0e0',
                        mb: 2,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        overflow: 'hidden',
                        border: '1px solid #ddd'
                      }}
                    >
                      {/* Placeholder for user image */}
                      <svg width="80" height="80" viewBox="0 0 24 24" fill="#9e9e9e">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                      </svg>
                    </Box>
                    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 1.2 }}>
                      <Box sx={{ display: 'flex', fontSize: '0.85rem' }}>
                        <Box sx={{ width: 110, color: '#000', fontWeight: 600 }}>Name</Box>
                        <Box sx={{ width: 15 }}>:</Box>
                        <Box sx={{ flexGrow: 1, color: '#e65100', fontWeight: 'bold' }}>
                          {role === 'AUDITEE'
                            ? formData.auditee
                              ? formData.auditee.split(' - ')[0]
                              : '-'
                            : role === 'AUDITOR'
                              ? formData.auditor
                                ? formData.auditor.split(' - ')[0]
                                : '-'
                              : formData.ncrApprovedBy
                                ? formData.ncrApprovedBy.split(' - ')[0]
                                : '-'}
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', fontSize: '0.85rem' }}>
                        <Box sx={{ width: 110, color: '#000', fontWeight: 600 }}>Code</Box>
                        <Box sx={{ width: 15 }}>:</Box>
                        <Box sx={{ flexGrow: 1, color: '#333' }}>
                          {role === 'AUDITEE'
                            ? formData.auditee
                              ? formData.auditee.split(' - ')[1]
                              : '-'
                            : role === 'AUDITOR'
                              ? formData.auditor
                                ? formData.auditor.split(' - ')[1]
                                : '-'
                              : formData.ncrApprovedBy
                                ? formData.ncrApprovedBy.split(' - ')[1]
                                : '-'}
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', fontSize: '0.85rem' }}>
                        <Box sx={{ width: 110, color: '#000', fontWeight: 600 }}>Dept Name</Box>
                        <Box sx={{ width: 15 }}>:</Box>
                        <Box sx={{ flexGrow: 1, color: '#333' }}>{formData.department || '-'}</Box>
                      </Box>
                      <Box sx={{ display: 'flex', fontSize: '0.85rem' }}>
                        <Box sx={{ width: 110, color: '#000', fontWeight: 600 }}>Level</Box>
                        <Box sx={{ width: 15 }}>:</Box>
                        <Box sx={{ flexGrow: 1, color: '#333' }}>-</Box>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Grid>

        {/* BOTTOM TABLE */}
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, px: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#333' }}>
              Audit Criteria Checklist
            </Typography>
            <Button
              variant="contained"
              size="small"
              startIcon={<IconPlus size={16} />}
              onClick={() => setCriteriaDialogOpen(true)}
              sx={{ bgcolor: '#4e73df', '&:hover': { bgcolor: '#2e59d9' }, textTransform: 'none', height: '28px' }}
            >
              Add Audit Criteria
            </Button>
          </Box>
          <TableContainer sx={{ border: '1px solid #ccc', borderRadius: 0 }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: '#607D8B' }}>
                  <TableCell sx={{ color: 'white', p: 1, borderRight: '1px solid #90a4ae', fontSize: '0.75rem', fontWeight: 'bold' }}>
                    #
                  </TableCell>
                  <TableCell sx={{ color: 'white', p: 1, borderRight: '1px solid #90a4ae', fontSize: '0.75rem', fontWeight: 'bold' }}>
                    Seq No
                  </TableCell>
                  <TableCell sx={{ color: 'white', p: 1, borderRight: '1px solid #90a4ae', fontSize: '0.75rem', fontWeight: 'bold' }}>
                    Clause
                  </TableCell>
                  <TableCell sx={{ color: 'white', p: 1, borderRight: '1px solid #90a4ae', fontSize: '0.75rem', fontWeight: 'bold' }}>
                    Criteria Details
                  </TableCell>
                  <TableCell sx={{ color: 'white', p: 1, borderRight: '1px solid #90a4ae', fontSize: '0.75rem', fontWeight: 'bold' }}>
                    Attachment Req
                  </TableCell>
                  <TableCell sx={{ color: 'white', p: 1, borderRight: '1px solid #90a4ae', fontSize: '0.75rem', fontWeight: 'bold' }}>
                    Remarks
                  </TableCell>
                  <TableCell sx={{ color: 'white', p: 1, fontSize: '0.75rem', fontWeight: 'bold', textAlign: 'center' }}>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {criteriaList.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} sx={{ p: 1, color: '#2196f3', fontSize: '0.8rem', fontWeight: 500 }}>
                      No records found.
                    </TableCell>
                  </TableRow>
                ) : (
                  criteriaList.map((criteria, index) => (
                    <TableRow key={index} hover>
                      <TableCell sx={{ p: 1, borderRight: '1px solid #e0e0e0', fontSize: '0.8rem' }}>{index + 1}</TableCell>
                      <TableCell sx={{ p: 1, borderRight: '1px solid #e0e0e0', fontSize: '0.8rem' }}>{criteria.seqNo}</TableCell>
                      <TableCell sx={{ p: 1, borderRight: '1px solid #e0e0e0', fontSize: '0.8rem' }}>{criteria.clause}</TableCell>
                      <TableCell sx={{ p: 1, borderRight: '1px solid #e0e0e0', fontSize: '0.8rem' }}>{criteria.criteriaDetails}</TableCell>
                      <TableCell sx={{ p: 1, borderRight: '1px solid #e0e0e0', fontSize: '0.8rem' }}>{criteria.attachmentReq}</TableCell>
                      <TableCell sx={{ p: 1, borderRight: '1px solid #e0e0e0', fontSize: '0.8rem' }}>{criteria.remarks}</TableCell>
                      <TableCell align="center" sx={{ p: 1 }}>
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
        </Grid>
      </Grid>

      {/* Add Criteria Dialog */}
      <Dialog
        open={criteriaDialogOpen}
        onClose={() => setCriteriaDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 2, height: '80vh' } }}
      >
        <DialogTitle
          sx={{ bgcolor: '#546e7a', color: 'white', py: 1.2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600, color: 'white', fontSize: '1rem' }}>
            Audit
          </Typography>
          <IconButton onClick={() => setCriteriaDialogOpen(false)} size="small" sx={{ color: 'white' }}>
            <IconX size={20} />
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
        <DialogActions sx={{ p: 2, bgcolor: '#f8f9fa', justifyContent: 'center' }}>
          <Button
            variant="contained"
            onClick={handleAddSelectedCriteria}
            disabled={selectedCriteriaIds.length === 0}
            startIcon={<IconDeviceFloppy size={18} />}
            sx={{ bgcolor: '#546e7a', '&:hover': { bgcolor: '#455a64' }, textTransform: 'none', px: 4 }}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
