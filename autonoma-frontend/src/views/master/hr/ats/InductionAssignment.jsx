import { useState, useEffect, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
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
  Divider,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper
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
import ConfirmDeleteDialog from 'ui-component/ConfirmDeleteDialog';
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
import { setFilterConfig, resetFilters, setQuery } from 'store/slices/search';
import usePagePermissions, { PAGE_CODES } from 'hooks/usePagePermissions';

// ==============================|| INDUCTION ASSIGNMENT MANAGEMENT ||============================== //



const INITIAL_STATE = {
  empCode: '',
  oldEmpCode: '',
  empName: '',
  department: '',
  designation: '',
  levels: [
    {
      id: null,
      screeningLevel: 'Level 1',
      inductionRound: '',
      inductionDate: new Date().toISOString().split('T')[0],
      inductionTime: '09:00',
      trainerName: '',
      trainerEmpCode: '',
      currentStatus: 'PENDING',
      inductionStatus: 'ACTIVE',
      remarks: ''
    }
  ]
};

const ROUND_OPTIONS = ['HR', 'QMS', 'DEPARTMENT', 'MANAGEMENT'];
const LEVEL_OPTIONS = ['Level 1', 'Level 2', 'Level 3', 'Level 4'];
const STATUS_OPTIONS = ['PENDING', 'RESCHEDULE', 'TRAINING GIVEN', 'COMPLETED', 'REJECTED'];

const TIME_OPTIONS = [
  { value: '09:00', label: '09:00 AM' },
  { value: '09:30', label: '09:30 AM' },
  { value: '10:00', label: '10:00 AM' },
  { value: '10:30', label: '10:30 AM' },
  { value: '11:00', label: '11:00 AM' },
  { value: '11:30', label: '11:30 AM' },
  { value: '12:00', label: '12:00 PM' },
  { value: '12:30', label: '12:30 PM' },
  { value: '13:00', label: '01:00 PM' },
  { value: '13:30', label: '01:30 PM' },
  { value: '14:00', label: '02:00 PM' },
  { value: '14:30', label: '02:30 PM' },
  { value: '15:00', label: '03:00 PM' },
  { value: '15:30', label: '03:30 PM' },
  { value: '16:00', label: '04:00 PM' },
  { value: '16:30', label: '04:30 PM' },
  { value: '17:00', label: '05:00 PM' },
  { value: '17:30', label: '05:30 PM' },
  { value: '18:00', label: '06:00 PM' },
  { value: '18:30', label: '06:30 PM' },
  { value: '19:00', label: '07:00 PM' },
  { value: '19:30', label: '07:30 PM' },
  { value: '20:00', label: '08:00 PM' },
  { value: '20:30', label: '08:30 PM' },
  { value: '21:00', label: '09:00 PM' }
];


const VALIDATION_RULES = [
  { field: 'empCode', label: 'Employee', required: true },
  { field: 'inductionRound', label: 'Induction Round', required: true },
  { field: 'screeningLevel', label: 'Screening Level', required: true },
  { field: 'inductionDate', label: 'Induction Date', required: true },
  { field: 'inductionTime', label: 'Induction Time', required: true },
  { field: 'trainerName', label: 'Trainer Name', required: true }
];

const normalizeScreeningLevel = (level) => {
  if (!level) return '';
  const trimmed = level.trim();
  if (trimmed === '-' || trimmed === '') return '';
  
  const matchL = trimmed.match(/^L(\d+)$/i);
  if (matchL) {
    return `Level ${matchL[1]}`;
  }
  
  const matchLevel = trimmed.match(/^Level\s*(\d+)$/i);
  if (matchLevel) {
    return `Level ${matchLevel[1]}`;
  }
  
  const matchNum = trimmed.match(/^(\d+)$/);
  if (matchNum) {
    return `Level ${matchNum[1]}`;
  }
  
  return trimmed;
};

const normalizeInductionTime = (time) => {
  if (!time) return '';
  const trimmed = time.trim();
  if (trimmed === '-' || trimmed === '') return '';
  
  const match = trimmed.match(/^(\d{2}):(\d{2})(?::\d{2})?$/);
  if (match) {
    const formatted = `${match[1]}:${match[2]}`;
    if (TIME_OPTIONS.some(option => option.value === formatted)) {
      return formatted;
    }
  }
  return '';
};


const InductionAssignment = () => {
  const theme = useTheme();
  const dispatch = useDispatch();

  const { departments = [] } = useLookups(['DEPARTMENTS']);
  const [rows, setRows] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState(INITIAL_STATE);
  const { errors, validate, clearErrors, setErrors } = useBOSValidation();

  const [history, setHistory] = useState([]);

  const globalQuery = useSelector((state) => state.search.query);
  const globalFilters = useSelector((state) => state.search.filters);
  const perms = usePagePermissions(PAGE_CODES.ATS_INDUCTION_PENDING);

  // Dispatch starred filter configuration matching Status and Search By
  useEffect(() => {
    const config = [
      {
        id: 'status',
        label: 'Status',
        type: 'select',
        options: [
          { value: 'ALL', label: 'ALL' },
          { value: 'PENDING', label: 'PENDING' },
          { value: 'COMPLETED', label: 'COMPLETED' }
        ],
        defaultValue: 'ALL',
        isStarred: true
      },
      {
        id: 'searchBy',
        label: 'Search By',
        type: 'select',
        options: [
          { value: 'empCode', label: 'Employee Code' },
          { value: 'empName', label: 'Employee Name' },
          { value: 'department', label: 'Department' },
          { value: 'currentStatus', label: 'Current Status' },
          { value: 'inductionRound', label: 'Induction Round' }
        ],
        defaultValue: 'empCode',
        isStarred: true
      }
    ];
    dispatch(setFilterConfig(config));
    return () => {
      dispatch(setFilterConfig(null));
      dispatch(resetFilters());
      dispatch(setQuery(''));
    };
  }, [dispatch]);

  const handleAssign = useCallback(async (row) => {
    setLoading(true);
    try {
      const { data } = await axios.get(`/api/hr/induction-assignment/employee/${row.empCode}`);
      const normalizedHistory = (data || [])
        .map(h => ({
          ...h,
          screeningLevel: normalizeScreeningLevel(h.screeningLevel),
          inductionTime: normalizeInductionTime(h.inductionTime)
        }))
        .sort((a, b) => {
          const aNum = parseInt(a.screeningLevel.replace(/^\D+/g, ''), 10) || 0;
          const bNum = parseInt(b.screeningLevel.replace(/^\D+/g, ''), 10) || 0;
          return aNum - bNum;
        });
      setHistory(normalizedHistory);
      
      const cleanData = { ...INITIAL_STATE };
      
      Object.keys(cleanData).forEach(key => {
        if (row[key] !== undefined && row[key] !== null) {
          cleanData[key] = row[key];
        }
      });

      // Special handling for dates
      const defaultDate = row.inductionDate && row.inductionDate !== '-'
        ? new Date(row.inductionDate).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0];

      // Add gradeCode/Level info for summary header
      cleanData.gradeCode = row.gradeCode || row.grade?.gradeCode || '-';
      cleanData.empName = row.empName || row.employeeName || '';
      cleanData.empCode = row.empCode || '';
      cleanData.oldEmpCode = row.oldEmpCode || '';
      cleanData.department = typeof row.department === 'object' ? row.department?.departmentName : (row.department || '');
      cleanData.designation = typeof row.designation === 'object' ? row.designation?.designationName : (row.designation || '');
      
      const isCompleted = row.currentStatus === 'COMPLETED';
      cleanData.levels = [
        {
          id: row.isVirtual || isCompleted ? null : row.id,
          screeningLevel: row.isVirtual || isCompleted ? `Level ${normalizedHistory.length + 1}` : normalizeScreeningLevel(row.screeningLevel),
          inductionRound: row.isVirtual || isCompleted ? '' : (row.inductionRound && row.inductionRound !== '-' ? row.inductionRound : ''),
          inductionDate: row.isVirtual || isCompleted ? new Date().toISOString().split('T')[0] : defaultDate,
          inductionTime: row.isVirtual || isCompleted ? '09:00' : (row.inductionTime && row.inductionTime !== '-' ? normalizeInductionTime(row.inductionTime) : '09:00'),
          trainerName: row.isVirtual || isCompleted ? '' : (row.trainerName && row.trainerName !== '-' ? row.trainerName : ''),
          trainerEmpCode: row.isVirtual || isCompleted ? '' : (row.trainerEmpCode && row.trainerEmpCode !== '-' ? row.trainerEmpCode : ''),
          currentStatus: row.isVirtual || isCompleted ? 'PENDING' : (row.currentStatus || 'PENDING'),
          inductionStatus: row.isVirtual || isCompleted ? 'ACTIVE' : (row.inductionStatus || 'ACTIVE'),
          remarks: row.isVirtual || isCompleted ? '' : (row.remarks || '')
        }
      ];
 
      setFormData(cleanData);
      setErrors({});
      setDialogOpen(true);
    } catch (err) {
      console.error('History fetch error:', err);
      // Fallback if history fails
      const defaultDate = row.inductionDate && row.inductionDate !== '-'
        ? new Date(row.inductionDate).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0];
      const isCompleted = row.currentStatus === 'COMPLETED';
      setFormData({
        empCode: row.empCode,
        empName: row.empName || row.employeeName,
        department: row.department,
        designation: row.designation,
        oldEmpCode: row.oldEmpCode,
        levels: [
          {
            id: row.isVirtual || isCompleted ? null : row.id,
            screeningLevel: row.isVirtual || isCompleted ? 'Level 1' : normalizeScreeningLevel(row.screeningLevel),
            inductionRound: row.isVirtual || isCompleted ? '' : (row.inductionRound && row.inductionRound !== '-' ? row.inductionRound : ''),
            inductionDate: row.isVirtual || isCompleted ? new Date().toISOString().split('T')[0] : defaultDate,
            inductionTime: row.isVirtual || isCompleted ? '09:00' : (row.inductionTime && row.inductionTime !== '-' ? normalizeInductionTime(row.inductionTime) : '09:00'),
            trainerName: row.isVirtual || isCompleted ? '' : (row.trainerName && row.trainerName !== '-' ? row.trainerName : ''),
            trainerEmpCode: row.isVirtual || isCompleted ? '' : (row.trainerEmpCode && row.trainerEmpCode !== '-' ? row.trainerEmpCode : ''),
            currentStatus: row.isVirtual || isCompleted ? 'PENDING' : (row.currentStatus || 'PENDING'),
            inductionStatus: row.isVirtual || isCompleted ? 'ACTIVE' : (row.inductionStatus || 'ACTIVE'),
            remarks: row.isVirtual || isCompleted ? '' : (row.remarks || '')
          }
        ]
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
    { id: 'updatedUser', label: 'Updated By', minWidth: 120, render: (row) => row.updatedUser || row.updatedBy || '-' },
    { id: 'updatedDate', label: 'Updated Date', minWidth: 150 }
  ], []);

  const currentLevelOptions = useMemo(() => {
    const optionsSet = new Set(LEVEL_OPTIONS);
    if (formData && formData.levels) {
      formData.levels.forEach(level => {
        const norm = normalizeScreeningLevel(level.screeningLevel);
        if (norm) {
          optionsSet.add(norm);
        }
      });
    }
    if (history) {
      history.forEach(h => {
        const norm = normalizeScreeningLevel(h.screeningLevel);
        if (norm) {
          optionsSet.add(norm);
        }
      });
    }
    return Array.from(optionsSet).sort((a, b) => {
      const aNum = parseInt(a.replace(/^\D+/g, ''), 10) || 0;
      const bNum = parseInt(b.replace(/^\D+/g, ''), 10) || 0;
      return aNum - bNum;
    });
  }, [formData, history]);

  const fetchRows = useCallback(async () => {
    setLoading(true);
    try {
      const [assignRes, empRes] = await Promise.all([
        axios.get('/api/hr/induction-assignment'),
        axios.get('/api/master/hr/employees/filter/active')
      ]);

      const assignments = assignRes.data;
      const allActiveEmployees = empRes.data;
      
      const finalRows = [];
      allActiveEmployees.forEach(emp => {
        const empAssignments = (assignments || []).filter(a => a.empCode === emp.empCode);
        const empDept = emp && typeof emp.department === 'object' ? emp.department?.departmentName : emp.department;
        const empDesig = emp && typeof emp.designation === 'object' ? emp.designation?.designationName : emp.designation;

        if (empAssignments.length === 0) {
          const editors = [];
          const creator = emp.createdUser || emp.createdBy;
          const updater = emp.updatedUser || emp.updatedBy;
          if (creator) editors.push(creator.trim());
          if (updater) editors.push(updater.trim());
          const combinedEditors = [...new Set(editors)].filter(Boolean).join(', ') || '-';

          finalRows.push({ 
            ...emp, 
            id: null,
            employeeId: emp.id,
            empName: emp.employeeName,
            department: empDept,
            designation: empDesig,
            isVirtual: true, 
            currentStatus: 'PENDING', 
            inductionRound: '-', 
            screeningLevel: '-',
            updatedUser: combinedEditors,
            updatedBy: combinedEditors
          });
        } else {
          // Sort assignments by screening level descending, then by ID descending
          const sorted = [...empAssignments].sort((a, b) => {
            const aNum = parseInt(a.screeningLevel?.replace(/^\D+/g, ''), 10) || 0;
            const bNum = parseInt(b.screeningLevel?.replace(/^\D+/g, ''), 10) || 0;
            if (aNum !== bNum) return bNum - aNum;
            return (b.id || 0) - (a.id || 0);
          });
          
          // Prioritize ACTIVE status assignments
          const activeAssign = sorted.find(a => a.inductionStatus === 'ACTIVE') || sorted[0];

          const editors = [];
          empAssignments.forEach(a => {
            const creator = a.createdUser || a.createdBy;
            const updater = a.updatedUser || a.updatedBy;
            if (creator) editors.push(creator.trim());
            if (updater) editors.push(updater.trim());
          });
          const combinedEditors = [...new Set(editors)].filter(Boolean).join(', ') || '-';

          finalRows.push({
            ...emp,
            ...activeAssign,
            id: activeAssign.id,
            employeeId: emp.id,
            empName: emp.employeeName,
            department: empDept || activeAssign.department,
            designation: empDesig || activeAssign.designation,
            screeningLevel: normalizeScreeningLevel(activeAssign.screeningLevel),
            inductionTime: normalizeInductionTime(activeAssign.inductionTime),
            isVirtual: false,
            updatedUser: combinedEditors,
            updatedBy: combinedEditors
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

  const [deleteHistoryOpen, setDeleteHistoryOpen] = useState(false);
  const [historyItemToDelete, setHistoryItemToDelete] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) clearErrors(name);
  };

  const handleLevelInputChange = (index, fieldName, value) => {
    setFormData(prev => {
      let updatedLevels = [...prev.levels];
      updatedLevels[index] = { ...updatedLevels[index], [fieldName]: value };
      
      if (fieldName === 'screeningLevel' && value) {
        const normValue = normalizeScreeningLevel(value);
        const duplicateInForm = updatedLevels.some((l, idx) => idx !== index && normalizeScreeningLevel(l.screeningLevel) === normValue);
        const duplicateInHistory = history.some(h => normalizeScreeningLevel(h.screeningLevel) === normValue);
        
        if (duplicateInForm || duplicateInHistory) {
          updatedLevels[index] = { ...updatedLevels[index], screeningLevel: '' };
          dispatch(openSnackbar({ 
            open: true, 
            message: `${normValue} is already assigned or in history.`, 
            variant: 'alert', 
            severity: 'warning' 
          }));
          return { ...prev, levels: updatedLevels };
        }
      }
      return { ...prev, levels: updatedLevels };
    });
    
    const errorKey = `level_${index}_${fieldName}`;
    if (errors[errorKey]) {
      setErrors(prev => {
        const copy = { ...prev };
        delete copy[errorKey];
        return copy;
      });
    }
  };

  const handleAddLevel = () => {
    const nextLevelNum = formData.levels.length + history.length + 1;
    setFormData(prev => ({
      ...prev,
      levels: [
        ...prev.levels,
        {
          id: null,
          screeningLevel: `Level ${nextLevelNum}`,
          inductionRound: '',
          inductionDate: new Date().toISOString().split('T')[0],
          inductionTime: '09:00',
          trainerName: '',
          trainerEmpCode: '',
          currentStatus: 'PENDING',
          inductionStatus: 'ACTIVE',
          remarks: ''
        }
      ]
    }));
  };

  const handleRemoveLevel = (index) => {
    setFormData(prev => ({
      ...prev,
      levels: prev.levels.filter((_, i) => i !== index)
    }));
  };

  const handleDeleteHistoryItem = async (item) => {
    try {
      setLoading(true);
      const { data } = await axios.get(`/api/hr/induction-assignment/${item.id}/check-references`);
      if (data && data.isUsed) {
        dispatch(openSnackbar({ 
          open: true, 
          message: 'Cannot delete this induction assignment because it is already used in training records.', 
          variant: 'alert', 
          alert: { variant: 'filled' },
          severity: 'error' 
        }));
        return;
      }
      setHistoryItemToDelete(item);
      setDeleteHistoryOpen(true);
    } catch (err) {
      console.error('Check references error:', err);
      dispatch(openSnackbar({ 
        open: true, 
        message: 'Failed to verify references for induction assignment', 
        variant: 'alert', 
        severity: 'error' 
      }));
    } finally {
      setLoading(false);
    }
  };

  const confirmDeleteHistoryItem = async () => {
    if (!historyItemToDelete) return;
    try {
      await axios.delete(`/api/hr/induction-assignment/${historyItemToDelete.id}`);
      dispatch(openSnackbar({ open: true, message: 'Induction record deleted successfully', variant: 'alert', severity: 'success' }));
      
      const { data } = await axios.get(`/api/hr/induction-assignment/employee/${formData.empCode}`);
      const normalizedHistory = (data || [])
        .map(h => ({
          ...h,
          screeningLevel: normalizeScreeningLevel(h.screeningLevel),
          inductionTime: normalizeInductionTime(h.inductionTime)
        }))
        .sort((a, b) => {
          const aNum = parseInt(a.screeningLevel.replace(/^\D+/g, ''), 10) || 0;
          const bNum = parseInt(b.screeningLevel.replace(/^\D+/g, ''), 10) || 0;
          return aNum - bNum;
        });
      setHistory(normalizedHistory);
      
      setFormData(prev => {
        const updatedLevels = (prev.levels || []).map(level => {
          if (level.id === historyItemToDelete.id) {
            return {
              ...level,
              id: null
            };
          }
          return level;
        });
        return { ...prev, levels: updatedLevels };
      });
      
      fetchRows();
    } catch (err) {
      console.error('Delete error:', err);
      const errMsg = err.response?.data?.message || err.response?.data || err.message || 'Failed to delete record';
      let displayMsg = 'Failed to delete record';
      if (typeof errMsg === 'string' && (
        errMsg.toLowerCase().includes('conflict') || 
        errMsg.toLowerCase().includes('reference') || 
        errMsg.toLowerCase().includes('constraint') || 
        errMsg.toLowerCase().includes('training')
      )) {
        displayMsg = 'Cannot delete this induction assignment because it is already used in training records.';
      } else if (typeof errMsg === 'string') {
        displayMsg = errMsg;
      }
      dispatch(openSnackbar({ 
        open: true, 
        message: displayMsg, 
        variant: 'alert', 
        alert: { variant: 'filled' },
        severity: 'error' 
      }));
    } finally {
      setDeleteHistoryOpen(false);
      setHistoryItemToDelete(null);
    }
  };

  const handleSave = async () => {
    if (!formData.empCode) {
      dispatch(openSnackbar({ open: true, message: 'Employee Code is mandatory', variant: 'alert', severity: 'error' }));
      return;
    }

    let validationFailed = false;
    const newErrors = {};
    
    formData.levels.forEach((level, index) => {
      if (!level.screeningLevel || level.screeningLevel === '-') {
        newErrors[`level_${index}_screeningLevel`] = 'Screening Level is required';
        validationFailed = true;
      }
      if (!level.inductionRound || level.inductionRound === '-') {
        newErrors[`level_${index}_inductionRound`] = 'Round is required';
        validationFailed = true;
      }
      if (!level.inductionDate) {
        newErrors[`level_${index}_inductionDate`] = 'Induction Date is required';
        validationFailed = true;
      }
      if (!level.inductionTime) {
        newErrors[`level_${index}_inductionTime`] = 'Induction Time is required';
        validationFailed = true;
      }
      if (!level.trainerName) {
        newErrors[`level_${index}_trainerName`] = 'Trainer Name is required';
        validationFailed = true;
      }
    });

    if (validationFailed) {
      setErrors(newErrors);
      dispatch(openSnackbar({ open: true, message: 'Please fix validation errors', variant: 'alert', severity: 'error' }));
      return;
    }

    // Map all dynamic levels to payloads
    const payloads = formData.levels.map(level => {
      const pay = {
        empCode: formData.empCode,
        empName: formData.empName,
        oldEmpCode: formData.oldEmpCode,
        department: formData.department,
        designation: formData.designation,
        inductionRound: level.inductionRound,
        screeningLevel: normalizeScreeningLevel(level.screeningLevel),
        inductionDate: level.inductionDate,
        inductionTime: normalizeInductionTime(level.inductionTime),
        trainerName: level.trainerName,
        trainerEmpCode: level.trainerEmpCode || '',
        currentStatus: level.currentStatus,
        inductionStatus: level.inductionStatus,
        remarks: level.remarks
      };
      if (level.id) {
        pay.id = level.id;
      }
      return pay;
    });

    // Sort payloads sequentially by screeningLevel
    payloads.sort((a, b) => {
      const aNum = parseInt(a.screeningLevel.replace(/^\D+/g, ''), 10) || 0;
      const bNum = parseInt(b.screeningLevel.replace(/^\D+/g, ''), 10) || 0;
      return aNum - bNum;
    });

    try {
      if (payloads.length === 1 && payloads[0].id) {
        await axios.put(`/api/hr/induction-assignment/${payloads[0].id}`, payloads[0]);
      } else {
        // Bulk save/POST
        await axios.post('/api/hr/induction-assignment', payloads);
      }
      dispatch(openSnackbar({ open: true, message: 'Assignment saved successfully!', variant: 'alert', alert: { variant: 'filled' }, severity: 'success' }));
      setDialogOpen(false);
      fetchRows();
    } catch (error) {
      console.error('Save error details:', error);
      const message = typeof error === 'string'
        ? error
        : (error.response?.data?.message || error.response?.data || error.message || error.error || 'Failed to save');
      
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
      const statusVal = globalFilters.status || 'ALL';
      const matchesStatus = statusVal === 'ALL' || row.inductionStatus === statusVal;
      
      const searchByVal = globalFilters.searchBy || 'empCode';
      const term = globalQuery ? globalQuery.toLowerCase() : '';
      const matchesSearch = !term || (row[searchByVal] && row[searchByVal].toString().toLowerCase().includes(term));
      
      return matchesStatus && matchesSearch;
    }).map((r, i) => ({
      ...r,
      index: i + 1,
      createdUser: r.createdUser || r.createdBy || '-',
      updatedUser: r.updatedUser || r.updatedBy || '-',
      createdDate: r.createdDate || r.createdAt ? new Date(r.createdDate || r.createdAt).toLocaleString('en-GB') : '-',
      updatedDate: r.updatedDate || r.updatedAt ? new Date(r.updatedDate || r.updatedAt).toLocaleString('en-GB') : '-'
    }));
  }, [rows, globalFilters.status, globalFilters.searchBy, globalQuery]);

  return (
    <MainCard
      title={
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          Employee Induction Summary
        </Typography>
      }
      secondary={
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Tooltip title="Refresh">
            <IconButton onClick={fetchRows} color="primary" size="small" sx={{
              border: '2px solid', borderColor: 'divider', borderRadius: '8px', p: 1,
              transition: 'all 0.2s', '&:hover': { bgcolor: 'primary.light', transform: 'scale(1.05)' }
            }}>
              <IconRefresh size={20} />
            </IconButton>
          </Tooltip>

          {perms.export && <BOSExportButton 
            data={resolvedRows} 
            filename="Induction_Summary" 
            columns={columns.filter(c => c.id !== 'actions' && c.id !== 'index').map(c => ({ header: c.label, key: c.id }))} 
          />}
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
        onSave={perms.write ? handleSave : null}
        onClear={perms.write ? () => {
          setFormData(prev => ({
            ...prev,
            levels: [
              {
                id: null,
                screeningLevel: 'Level 1',
                inductionRound: '',
                inductionDate: new Date().toISOString().split('T')[0],
                inductionTime: '09:00',
                trainerName: '',
                trainerEmpCode: '',
                currentStatus: 'PENDING',
                inductionStatus: 'ACTIVE',
                remarks: ''
              }
            ]
          }));
          setErrors({});
        } : null}
        isViewOnly={!perms.write}
      >
        {/* Summary Header */}
        <Box sx={{ bgcolor: 'primary.light', p: 2, borderRadius: 2, mb: 3, display: 'flex', flexWrap: 'wrap', gap: 4, border: '1px solid', borderColor: 'primary.main' }}>
          <Box><Typography variant="caption" color="textSecondary">DEPARTMENT</Typography><Typography variant="subtitle1" fontWeight={700}>{formData.department || '-'}</Typography></Box>
          <Box><Typography variant="caption" color="textSecondary">POSITION</Typography><Typography variant="subtitle1" fontWeight={700}>{formData.designation || '-'}</Typography></Box>
          <Box><Typography variant="caption" color="textSecondary">LEVEL</Typography><Typography variant="subtitle1" fontWeight={700}>{formData.gradeCode || '-'}</Typography></Box>
          <Box><Typography variant="caption" color="textSecondary">SCREEN LEVEL</Typography><Typography variant="subtitle1" fontWeight={700}>{history.length + 1}</Typography></Box>
        </Box>

        <BOSFormSection title="Assign Induction Process">
          {(formData.levels || []).map((level, index) => (
            <Box key={index} sx={{ mb: index < formData.levels.length - 1 ? 4 : 0 }}>
              {index > 0 ? (
                <Box sx={{ display: 'flex', alignItems: 'center', my: 3 }}>
                  <Divider sx={{ flexGrow: 1 }} />
                  {formData.levels.length > 1 && (
                    <Button 
                      size="small" 
                      color="error" 
                      onClick={() => handleRemoveLevel(index)}
                      disabled={!perms.write}
                      sx={{ ml: 2 }}
                    >
                      Remove Level
                    </Button>
                  )}
                </Box>
              ) : (
                formData.levels.length > 1 && (
                  <Stack direction="row" justifyContent="flex-end" sx={{ mb: 1 }}>
                    <Button 
                      size="small" 
                      color="error" 
                      onClick={() => handleRemoveLevel(index)}
                      disabled={!perms.write}
                    >
                      Remove Level
                    </Button>
                  </Stack>
                )
              )}
              <Box sx={{ display: 'flex', gap: 2.5, width: '100%', mb: 2 }}>
                <Box sx={{ flex: 1 }}>
                  <BOSTextField
                    select
                    name="screeningLevel"
                    label="SCREENING LEVEL"
                    value={normalizeScreeningLevel(level.screeningLevel)}
                    onChange={(e) => handleLevelInputChange(index, 'screeningLevel', e.target.value)}
                    required
                    disabled={!perms.write}
                    error={!!errors[`level_${index}_screeningLevel`]}
                    helperText={errors[`level_${index}_screeningLevel`]}
                    sx={errorStyle(!!errors[`level_${index}_screeningLevel`])}
                  >
                    <MenuItem value="">-SELECT-</MenuItem>
                    {currentLevelOptions.map(l => (
                      <MenuItem key={l} value={l}>{l}</MenuItem>
                    ))}
                  </BOSTextField>
                </Box>
                <Box sx={{ flex: 1 }}>
                  <BOSTextField
                    select
                    name="inductionRound"
                    label="ROUND"
                    value={level.inductionRound}
                    onChange={(e) => handleLevelInputChange(index, 'inductionRound', e.target.value)}
                    required
                    disabled={!perms.write}
                    error={!!errors[`level_${index}_inductionRound`]}
                    helperText={errors[`level_${index}_inductionRound`]}
                    sx={errorStyle(!!errors[`level_${index}_inductionRound`])}
                  >
                    <MenuItem value="">-SELECT-</MenuItem>
                    {ROUND_OPTIONS.map(r => (
                      <MenuItem key={r} value={r}>{r}</MenuItem>
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
                    value={level.inductionDate}
                    onChange={(e) => handleLevelInputChange(index, 'inductionDate', e.target.value)}
                    required
                    disabled={!perms.write}
                    inputProps={{ min: new Date().toISOString().split('T')[0] }}
                    InputLabelProps={{ shrink: true }}
                    onClick={(e) => {
                      try {
                        e.target.showPicker();
                      } catch (err) {
                        // Fallback
                      }
                    }}
                    error={!!errors[`level_${index}_inductionDate`]}
                    helperText={errors[`level_${index}_inductionDate`]}
                    sx={errorStyle(!!errors[`level_${index}_inductionDate`])}
                  />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <BOSTextField
                    select
                    name="inductionTime"
                    label="INDUCTION TIME"
                    value={normalizeInductionTime(level.inductionTime)}
                    onChange={(e) => handleLevelInputChange(index, 'inductionTime', e.target.value)}
                    required
                    disabled={!perms.write}
                    error={!!errors[`level_${index}_inductionTime`]}
                    helperText={errors[`level_${index}_inductionTime`]}
                    sx={errorStyle(!!errors[`level_${index}_inductionTime`])}
                  >
                    <MenuItem value="">-SELECT-</MenuItem>
                    {TIME_OPTIONS.map(t => (
                      <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>
                    ))}
                  </BOSTextField>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', gap: 2.5, width: '100%', mb: 2 }}>
                <Box sx={{ flex: 1 }}>
                  <BOSTextField
                    select
                    name="trainerEmpCode"
                    label="INDUCTION PERSON"
                    value={level.trainerEmpCode || ''}
                    onChange={(e) => {
                      const selectedEmp = employees.find(emp => emp.empCode === e.target.value);
                      handleLevelInputChange(index, 'trainerEmpCode', e.target.value);
                      handleLevelInputChange(index, 'trainerName', selectedEmp ? selectedEmp.employeeName : '');
                    }}
                    required
                    disabled={!perms.write}
                    error={!!errors[`level_${index}_trainerName`]}
                    helperText={errors[`level_${index}_trainerName`]}
                    sx={errorStyle(!!errors[`level_${index}_trainerName`])}
                  >
                    <MenuItem value="">-Select-</MenuItem>
                    {employees
                      .filter(emp => {
                        if (emp.isInductionEligible?.toUpperCase() !== 'YES') return false;
                        if (emp.inductionStatus?.toUpperCase() !== 'COMPLETED') return false;
                        const empDept = typeof emp.department === 'object' ? emp.department?.departmentName : emp.department;
                        const round = level.inductionRound;
                        if (round === 'HR') {
                          return ['HR', 'HUMAN RESOURCES', 'HRA', 'HR & ADMIN', 'HUMAN RESOURCE'].includes(empDept?.toUpperCase());
                        }
                        if (round === 'QMS') {
                          return ['QMS', 'QUALITY MANAGEMENT', 'QUALITY', 'QMS DEPARTMENT', 'QUALITY ASSURANCE'].includes(empDept?.toUpperCase());
                        }
                        if (round === 'DEPARTMENT') {
                          return empDept?.toLowerCase() === formData.department?.toLowerCase();
                        }
                        return true;
                      })
                      .map(emp => (
                        <MenuItem key={emp.id} value={emp.empCode}>
                          {emp.employeeName} ({emp.empCode})
                        </MenuItem>
                      ))}
                  </BOSTextField>
                </Box>
              </Box>
            </Box>
          ))}
          {perms.write && (formData.levels || []).length + history.length < 4 && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-start', mt: 2 }}>
              <Button 
                variant="outlined" 
                color="secondary" 
                startIcon={<IconPlus size={16} />}
                onClick={handleAddLevel}
              >
                Add Level
              </Button>
            </Box>
          )}
        </BOSFormSection>

        {/* History Table */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" sx={{ mb: 2, color: 'primary.main', fontWeight: 600 }}>Induction History</Typography>
          <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: '10px', maxHeight: '300px', overflowY: 'auto' }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: 'primary.light' }}>
                  <TableCell sx={{ fontWeight: 700, width: 50 }}>#</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Screening Level</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Round</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Induction by</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Induction Status</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Rescheduled</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>CREATED USER</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {history.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center" sx={{ py: 2, fontStyle: 'italic', color: 'text.secondary' }}>
                      No history found
                    </TableCell>
                  </TableRow>
                ) : (
                  history.map((h, i) => (
                    <TableRow key={h.id || i} sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
                      <TableCell>{i + 1}</TableCell>
                      <TableCell>{h.screeningLevel || '-'}</TableCell>
                      <TableCell>{h.inductionRound || '-'}</TableCell>
                      <TableCell>{h.inductionDate ? `${h.inductionDate} ${h.inductionTime || ''}` : '-'}</TableCell>
                      <TableCell>{h.trainerName || '-'}</TableCell>
                      <TableCell>
                        <Chip 
                          label={h.currentStatus || 'PENDING'} 
                          size="small" 
                          color={h.currentStatus === 'REJECTED' ? 'error' : (h.currentStatus === 'COMPLETED' ? 'success' : 'primary')} 
                          sx={{ fontWeight: 600 }}
                        />
                      </TableCell>
                      <TableCell>NO</TableCell>
                      <TableCell>{(h.createdUser || h.createdBy) || '-'}</TableCell>
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Chip 
                            label={h.inductionStatus || 'ACTIVE'} 
                            size="small" 
                            variant="outlined" 
                            color={h.inductionStatus === 'ACTIVE' ? 'success' : 'default'} 
                          />
                          {perms.delete && (
                            <Tooltip title="Delete">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleDeleteHistoryItem(h)}
                              >
                                <IconTrash size={16} />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </BOSFormDialog>

      <ConfirmDeleteDialog
        open={deleteHistoryOpen}
        onClose={() => setDeleteHistoryOpen(false)}
        onConfirm={confirmDeleteHistoryItem}
        title="Delete Induction Assignment"
        message="Are you sure you want to delete this induction assignment?"
        itemName={historyItemToDelete ? `${historyItemToDelete.screeningLevel} - ${historyItemToDelete.inductionRound}` : ''}
      />
    </MainCard>
  );
};

export default InductionAssignment;
