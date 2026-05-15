import { useState, useEffect, useMemo, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import axios from 'utils/axios';
import { useTheme } from '@mui/material/styles';

// MUI & Icons
import {
  Box,
  Typography,
  Stack,
  Tooltip,
  IconButton,
  MenuItem,
  Button,
  Chip,
  Divider
} from '@mui/material';
import {
  IconRefresh,
  IconPlus,
  IconCalendarEvent,
  IconEdit,
  IconUserPlus,
  IconCloudUpload,
  IconTrash
} from '@tabler/icons-react';

// BOS Components
import MainCard from 'ui-component/cards/MainCard';
import {
  BOSDataTable,
  BOSFormDialog,
  BOSFormSection,
  BOSTextField,
  BOSExportButton,
  btnNew,
  errorStyle
} from 'ui-component/bos';
import { openSnackbar } from 'store/slices/snackbar';
import { useLookups } from 'hooks/useLookups';
import useBOSValidation from 'hooks/useBOSValidation';

// ==============================|| INDUCTION ASSIGNMENT MANAGEMENT ||============================== //

const columns = [
  { id: 'index', label: 'Sl.No', minWidth: 60 },
  { id: 'serialNo', label: 'Assign.ID', bold: true, color: 'primary.main', minWidth: 100 },
  { id: 'empCode', label: 'Emp.Code', bold: true, minWidth: 100 },
  { id: 'oldEmpCode', label: 'Old Emp.Code', minWidth: 120 },
  { id: 'empName', label: 'Employee Name', minWidth: 180 },
  { id: 'department', label: 'Department', minWidth: 150 },
  { id: 'designation', label: 'Designation', minWidth: 150 },
  { id: 'inductionRound', label: 'Round', minWidth: 120 },
  { id: 'screeningLevel', label: 'Level', minWidth: 100 },
  { id: 'inductionDate', label: 'Date', minWidth: 120 },
  { id: 'inductionTime', label: 'Time', minWidth: 100 },
  { id: 'trainerName', label: 'Trainer/Person', minWidth: 150 },
  { 
    id: 'currentStatus', 
    label: 'Current Status', 
    minWidth: 130,
    render: (row) => {
      const colors = {
        'PENDING': 'warning',
        'RESCHEDULE': 'secondary',
        'TRAINING GIVEN': 'info',
        'COMPLETED': 'success',
        'REJECTED': 'error'
      };
      return (
        <Chip 
          label={row.currentStatus} 
          size="small" 
          color={colors[row.currentStatus] || 'default'}
          sx={{ fontWeight: 700, borderRadius: '6px' }}
        />
      );
    }
  },
  { 
    id: 'inductionStatus', 
    label: 'Induction Status', 
    minWidth: 120,
    render: (row) => (
      <Chip 
        label={row.inductionStatus} 
        variant="outlined"
        size="small" 
        color={row.inductionStatus === 'ACTIVE' ? 'success' : 'error'}
      />
    )
  },
  { id: 'createdBy', label: 'Assigned By', minWidth: 120 }
];

const INITIAL_STATE = {
  id: null,
  empCode: '',
  oldEmpCode: '',
  empName: '',
  department: '',
  designation: '',
  inductionRound: '',
  screeningLevel: 'Level 1', 
  inductionDate: new Date().toISOString().split('T')[0],
  inductionTime: '09:00',
  trainerName: '',
  currentStatus: 'PENDING',
  inductionStatus: 'ACTIVE',
  remarks: ''
};

const SEARCH_OPTIONS = [
  { value: 'empCode', label: 'Employee Code' },
  { value: 'empName', label: 'Employee Name' },
  { value: 'department', label: 'Department' },
  { value: 'currentStatus', label: 'Current Status' },
  { value: 'inductionRound', label: 'Induction Round' }
];

const ROUND_OPTIONS = ['HR', 'QMS', 'DEPARTMENT', 'MANAGEMENT'];
const LEVEL_OPTIONS = ['Level 1', 'Level 2', 'Level 3', 'Level 4'];
const STATUS_OPTIONS = ['PENDING', 'RESCHEDULE', 'TRAINING GIVEN', 'COMPLETED'];

const VALIDATION_RULES = [
  { field: 'empCode', label: 'Employee', required: true },
  { field: 'inductionRound', label: 'Induction Round', required: true },
  { field: 'screeningLevel', label: 'Screening Level', required: true },
  { field: 'inductionDate', label: 'Induction Date', required: true },
  { field: 'inductionTime', label: 'Induction Time', required: true },
  { field: 'trainerName', label: 'Trainer Name', required: true }
];

const InductionAssignment = () => {
  const theme = useTheme();
  const dispatch = useDispatch();

  const { departments = [] } = useLookups(['DEPARTMENTS']);
  const [rows, setRows] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchBy, setSearchBy] = useState('empCode');
  const [searchText, setSearchText] = useState('');
  const [formData, setFormData] = useState(INITIAL_STATE);
  const { errors, validate, clearErrors, setErrors } = useBOSValidation();

  const [history, setHistory] = useState([]);

  const handleAssign = useCallback(async (row) => {
    setLoading(true);
    try {
      const { data } = await axios.get(`/api/hr/induction-assignment/employee/${row.empCode}`);
      setHistory(data || []);
      
      const cleanData = { ...INITIAL_STATE };
      
      Object.keys(cleanData).forEach(key => {
        if (row[key] !== undefined && row[key] !== null) {
          cleanData[key] = row[key];
        }
      });

      // Special handling for dates
      if (row.inductionDate && row.inductionDate !== '-') {
        cleanData.inductionDate = new Date(row.inductionDate).toISOString().split('T')[0];
      } else {
        cleanData.inductionDate = new Date().toISOString().split('T')[0];
      }

      // Add gradeCode/Level info for summary header
      cleanData.gradeCode = row.gradeCode || row.grade?.gradeCode || '-';
      cleanData.empName = row.empName || row.employeeName || '';
      cleanData.empCode = row.empCode || '';
      cleanData.oldEmpCode = row.oldEmpCode || '';
      cleanData.department = row.department || (typeof row.department === 'object' ? row.department?.departmentName : row.department) || '';
      cleanData.designation = row.designation || (typeof row.designation === 'object' ? row.designation?.designationName : row.designation) || '';

      setFormData(cleanData);
      setErrors({});
      setDialogOpen(true);
    } catch (err) {
      console.error('History fetch error:', err);
      // Fallback if history fails
      setFormData({
        ...INITIAL_STATE,
        empCode: row.empCode,
        empName: row.empName || row.employeeName,
        department: row.department,
        designation: row.designation,
        oldEmpCode: row.oldEmpCode
      });
      setDialogOpen(true);
    } finally {
      setLoading(false);
    }
  }, [setErrors]);

  const columns = useMemo(() => [
    { id: 'index', label: 'No', minWidth: 50 },
    { id: 'empCode', label: 'EmpCode', bold: true, minWidth: 100 },
    { id: 'empName', label: 'Employee Name', minWidth: 180 },
    { id: 'oldEmpCode', label: 'OldEmpCode', minWidth: 120, render: (row) => row.oldEmpCode || '-' },
    { id: 'department', label: 'Department', minWidth: 150 },
    { id: 'designation', label: 'Designation', minWidth: 150 },
    { 
      id: 'inductionStatus', 
      label: 'Induction Status', 
      minWidth: 130,
      render: (row) => {
        const status = row.inductionStatus || 'PENDING';
        return (
          <Chip 
            label={status} 
            variant="outlined"
            size="small" 
            color={status === 'COMPLETED' ? 'success' : 'warning'}
          />
        );
      }
    },
    {
      id: 'actions',
      label: 'Actions',
      align: 'center',
      render: (row) => (
        <Tooltip title={row.isVirtual ? "Assign Now" : "Edit Assignment"}>
          <IconButton onClick={() => handleAssign(row)} size="small" color={row.isVirtual ? "primary" : "secondary"}>
            {row.isVirtual ? <IconUserPlus size={18} /> : <IconEdit size={18} />}
          </IconButton>
        </Tooltip>
      )
    }
  ], [handleAssign]);

  const fetchRows = useCallback(async () => {
    setLoading(true);
    try {
      const [assignRes, empRes] = await Promise.all([
        axios.get('/api/hr/induction-assignment'),
        axios.get('/api/master/employee/filter/active')
      ]);

      const assignments = assignRes.data;
      const allActiveEmployees = empRes.data;
      
      const finalRows = [];
      assignments.forEach(a => {
        const emp = allActiveEmployees.find(e => e.empCode === a.empCode);
        finalRows.push({ ...a, ...emp, isVirtual: false });
      });

      allActiveEmployees.forEach(emp => {
        if (!assignments.some(a => a.empCode === emp.empCode)) {
          finalRows.push({ 
            ...emp, 
            empName: emp.employeeName,
            department: typeof emp.department === 'object' ? emp.department?.departmentName : emp.department,
            designation: typeof emp.designation === 'object' ? emp.designation?.designationName : emp.designation,
            isVirtual: true, 
            currentStatus: 'PENDING', 
            inductionRound: '-', 
            screeningLevel: '-' 
          });
        }
      });

      setRows(finalRows);
      setEmployees(allActiveEmployees);
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchRows(); }, [fetchRows]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) clearErrors(name);
  };

  const handleSave = async () => {
    if (!validate(formData, VALIDATION_RULES)) return;
    
    // Find trainer emp code
    const selectedTrainer = employees.find(e => e.employeeName === formData.trainerName);
    
    // Clean payload to match backend model exactly
    const payload = {
      empCode: formData.empCode,
      empName: formData.empName,
      oldEmpCode: formData.oldEmpCode,
      department: formData.department,
      designation: formData.designation,
      inductionRound: formData.inductionRound,
      screeningLevel: formData.screeningLevel,
      inductionDate: formData.inductionDate,
      inductionTime: formData.inductionTime,
      trainerName: formData.trainerName,
      trainerEmpCode: selectedTrainer?.empCode || '',
      currentStatus: formData.currentStatus,
      inductionStatus: formData.inductionStatus,
      remarks: formData.remarks
    };

    if (formData.id) {
      payload.id = formData.id;
    }

    // Additional validation for default values
    if (formData.screeningLevel === '-' || formData.inductionRound === '-') {
      dispatch(openSnackbar({ open: true, message: 'Please select a valid Level and Round', variant: 'alert', alert: { variant: 'filled' }, severity: 'error' }));
      return;
    }

    try {
      if (payload.id) {
        await axios.put(`/api/hr/induction-assignment/${payload.id}`, payload);
      } else {
        await axios.post('/api/hr/induction-assignment', payload);
      }
      dispatch(openSnackbar({ open: true, message: 'Assignment saved!', variant: 'alert', alert: { variant: 'filled' }, severity: 'success' }));
      setDialogOpen(false);
      fetchRows();
    } catch (error) {
      console.error('Save error details:', error.response?.data);
      const serverMsg = error.response?.data;
      const message = typeof serverMsg === 'string' ? serverMsg : (serverMsg?.message || 'Failed to save');
      
      dispatch(openSnackbar({ 
        open: true, 
        message: message, 
        variant: 'alert', 
        alert: { variant: 'filled' }, 
        severity: 'error' 
      }));
    }
  };

  const resolvedRows = useMemo(() => {
    return rows.filter(row => {
      const matchesStatus = statusFilter === 'ALL' || row.inductionStatus === statusFilter;
      const term = searchText.toLowerCase();
      const matchesSearch = !term || (row[searchBy] && row[searchBy].toString().toLowerCase().includes(term));
      return matchesStatus && matchesSearch;
    }).map((r, i) => ({ ...r, index: i + 1 }));
  }, [rows, statusFilter, searchBy, searchText]);

  return (
    <MainCard
      title="Employee Induction Summary"
      secondary={
        <Stack direction="row" spacing={1.5} alignItems="center">
          <BOSTextField
            select
            size="small"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            sx={{ width: 150 }}
            label="STATUS"
          >
            <MenuItem value="ALL">ALL</MenuItem>
            <MenuItem value="PENDING">PENDING</MenuItem>
            <MenuItem value="COMPLETED">COMPLETED</MenuItem>
          </BOSTextField>
 
          <BOSTextField
            select
            size="small"
            value={searchBy}
            onChange={(e) => setSearchBy(e.target.value)}
            sx={{ width: 160 }}
            label="SEARCH BY"
          >
            <MenuItem value="">-SELECT-</MenuItem>
            {SEARCH_OPTIONS.map(opt => (
              <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
            ))}
          </BOSTextField>

          <BOSTextField
            size="small"
            placeholder="Search..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            sx={{ width: 180 }}
          />

          <Button 
            variant="contained" 
            startIcon={<IconRefresh size={18} />} 
            onClick={fetchRows}
            size="small"
            sx={{ height: 40, px: 2, borderRadius: '8px' }}
          >
            Get Details
          </Button>

          <BOSExportButton 
            data={resolvedRows} 
            filename="Induction_Summary" 
            columns={columns.filter(c => c.id !== 'actions' && c.id !== 'index').map(c => ({ header: c.label, key: c.id }))} 
          />
        </Stack>
      }
    >
      <BOSDataTable
        columns={columns}
        rows={resolvedRows}
        loading={loading}
        onDoubleClickRow={handleAssign}
        onEditRow={handleAssign}
      />

      <BOSFormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title={formData.id ? 'Update Induction Process' : 'Assign Induction Process'}
        fullWidth
        maxWidth="md"
        onSave={handleSave}
        onClear={() => {
          setFormData(INITIAL_STATE);
          setErrors({});
        }}
      >
        {/* Summary Header */}
        <Box sx={{ bgcolor: 'primary.light', p: 2, borderRadius: 2, mb: 3, display: 'flex', flexWrap: 'wrap', gap: 4, border: '1px solid', borderColor: 'primary.main' }}>
          <Box><Typography variant="caption" color="textSecondary">DEPARTMENT</Typography><Typography variant="subtitle1" fontWeight={700}>{formData.department || '-'}</Typography></Box>
          <Box><Typography variant="caption" color="textSecondary">POSITION</Typography><Typography variant="subtitle1" fontWeight={700}>{formData.designation || '-'}</Typography></Box>
          <Box><Typography variant="caption" color="textSecondary">LEVEL</Typography><Typography variant="subtitle1" fontWeight={700}>{formData.gradeCode || '-'}</Typography></Box>
          <Box><Typography variant="caption" color="textSecondary">SCREEN LEVEL</Typography><Typography variant="subtitle1" fontWeight={700}>{history.length + 1}</Typography></Box>
        </Box>

        <BOSFormSection title="1. Assignment Details">
          <Box sx={{ display: 'flex', gap: 2.5, width: '100%', mb: 2 }}>
            <Box sx={{ flex: 1 }}>
              <BOSTextField
                select
                name="screeningLevel"
                label="SCREENING LEVEL"
                value={formData.screeningLevel}
                onChange={handleInputChange}
                required
                error={!!errors.screeningLevel}
                sx={errorStyle(!!errors.screeningLevel)}
              >
                {LEVEL_OPTIONS.map(l => (
                  <MenuItem key={l} value={l}>{l}</MenuItem>
                ))}
              </BOSTextField>
            </Box>
            <Box sx={{ flex: 1 }}>
              <BOSTextField
                select
                name="inductionRound"
                label="ROUND"
                value={formData.inductionRound}
                onChange={handleInputChange}
                required
                error={!!errors.inductionRound}
                sx={errorStyle(!!errors.inductionRound)}
              >
                <MenuItem value="">-SELECT-</MenuItem>
                {departments.map(d => (
                  <MenuItem key={d.id} value={d.departmentName}>{d.departmentName}</MenuItem>
                ))}
              </BOSTextField>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 2.5, width: '100%', mb: 2 }}>
            <Box sx={{ flex: 1 }}>
              <BOSTextField
                type="date"
                name="inductionDate"
                label="INDUCTION DATE"
                value={formData.inductionDate}
                onChange={handleInputChange}
                required
                InputLabelProps={{ shrink: true }}
                error={!!errors.inductionDate}
                sx={errorStyle(!!errors.inductionDate)}
              />
            </Box>
            <Box sx={{ flex: 1 }}>
              <BOSTextField
                type="time"
                name="inductionTime"
                label="INDUCTION TIME"
                value={formData.inductionTime}
                onChange={handleInputChange}
                required
                InputLabelProps={{ shrink: true }}
                error={!!errors.inductionTime}
                sx={errorStyle(!!errors.inductionTime)}
              />
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 2.5, width: '100%', mb: 2 }}>
            <Box sx={{ flex: 1 }}>
              <BOSTextField
                select
                name="trainerName"
                label="INDUCTION PERSON"
                value={formData.trainerName}
                onChange={handleInputChange}
                required
                error={!!errors.trainerName}
                sx={errorStyle(!!errors.trainerName)}
              >
                <MenuItem value="">-Select-</MenuItem>
                {employees
                  .filter(emp => {
                    const empDept = typeof emp.department === 'object' ? emp.department?.departmentName : emp.department;
                    return emp.isInductionEligible === 'YES' && empDept === formData.inductionRound;
                  })
                  .map(emp => (
                    <MenuItem key={emp.id} value={emp.employeeName}>
                      {emp.employeeName} ({emp.empCode})
                    </MenuItem>
                  ))}
              </BOSTextField>
            </Box>
            <Box sx={{ flex: 1 }}>
              <BOSTextField
                select
                name="currentStatus"
                label="STATUS"
                value={formData.currentStatus}
                onChange={handleInputChange}
                required
                error={!!errors.currentStatus}
                sx={errorStyle(!!errors.currentStatus)}
              >
                {STATUS_OPTIONS.map(s => (
                  <MenuItem key={s} value={s}>{s}</MenuItem>
                ))}
              </BOSTextField>
            </Box>
          </Box>
        </BOSFormSection>

        {/* History Table */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" sx={{ mb: 2, color: 'primary.main', fontWeight: 600 }}>Induction History</Typography>
          <BOSDataTable
            columns={[
              { id: 'index', label: '#', minWidth: 40 },
              { id: 'screeningLevel', label: 'Screening Level' },
              { id: 'inductionRound', label: 'Round' },
              { id: 'inductionDate', label: 'Date', render: (r) => `${r.inductionDate} ${r.inductionTime}` },
              { id: 'trainerName', label: 'Induction by' },
              { id: 'currentStatus', label: 'Induction Status', render: (r) => (
                <Chip label={r.currentStatus} size="small" color={r.currentStatus === 'REJECTED' ? 'error' : 'primary'} />
              )},
              { id: 'rescheduled', label: 'Rescheduled', render: () => 'NO' },
              { id: 'createdBy', label: 'Created By' },
              { id: 'inductionStatus', label: 'Status', render: (r) => (
                <Chip label={r.inductionStatus} size="small" variant="outlined" color={r.inductionStatus === 'ACTIVE' ? 'success' : 'default'} />
              )}
            ]}
            rows={history.map((h, i) => ({ ...h, index: i + 1 }))}
            pagination={false}
          />
        </Box>
      </BOSFormDialog>
    </MainCard>
  );
};

export default InductionAssignment;
