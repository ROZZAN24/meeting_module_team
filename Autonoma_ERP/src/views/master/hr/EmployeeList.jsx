import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Typography, Button, Stack, Tooltip, IconButton } from '@mui/material';
import { IconFileDownload, IconRefresh, IconUsers } from '@tabler/icons-react';
import axios from 'utils/axios';
import { useDispatch, useSelector } from 'react-redux';
import { setFilterConfig } from 'store/slices/search';
import { openSnackbar } from 'store/slices/snackbar';
import { format } from 'date-fns';
import MainCard from 'ui-component/cards/MainCard';
import { exportToExcel } from 'utils/excelExport';
import ConfirmDeleteDialog from 'ui-component/ConfirmDeleteDialog';
import useKeyboardShortcuts, { shortcutTooltip } from 'hooks/useKeyboardShortcuts';
import { BOSDataTable, btnExport, btnNew } from 'ui-component/bos';
import { API_PATHS } from 'utils/api-constants';
import { useLookups } from 'hooks/useLookups';

// ==============================|| EMPLOYEE MASTER LIST (BOS SOP COMPLIANT) ||============================== //

const columns = [
  { id: 'index', label: '#', minWidth: 50 },
  { id: 'oldEmpCode', label: 'OLD EMP CODE', minWidth: 110 },
  { id: 'firstName', label: 'FIRST NAME', minWidth: 140, bold: true },
  { id: 'lastName', label: 'LAST NAME', minWidth: 140 },
  { id: 'empCode', label: 'EMP CODE', minWidth: 110 },
  { id: 'designationId', label: 'DESIGNATION', minWidth: 120 },
  { id: 'gradeCode', label: 'GRADE', minWidth: 80 },
  { id: 'departmentId', label: 'DEPARTMENT', minWidth: 120 },
  { id: 'empLevelId', label: 'LEVEL', minWidth: 100 },
  { id: 'unitId', label: 'UNIT NAME', minWidth: 100 },
  { id: 'homeManager', label: 'HOME MANAGER', minWidth: 130 },
  { id: 'businessManager', label: 'BUSINESS MANAGER', minWidth: 140 },
  { id: 'supplierName', label: 'SUPPLIER NAME', minWidth: 130 },
  { id: 'createdBy', label: 'CREATED BY', minWidth: 110 },
  { id: 'createdAt', label: 'CREATED DATE', minWidth: 140 },
  { id: 'updatedBy', label: 'MODIFIED BY', minWidth: 110 },
  { id: 'updatedAt', label: 'MODIFIED DATE', minWidth: 140 },
  { id: 'status', label: 'STATUS', minWidth: 90 }
];

export default function EmployeeList() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const globalQuery = useSelector((state) => state.search.query);
  const globalFilters = useSelector((state) => state.search.filters);

  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [deleteTargetName, setDeleteTargetName] = useState('');

  // Resolution Lookups
  const { 
    departments = [], 
    designations = [], 
    levels = [],
    users = []
  } = useLookups(['DEPARTMENTS', 'DESIGNATIONS', 'LEVELS', 'USERS']);

  const getDeptName = (id) => departments.find(d => String(d.id) === String(id))?.departmentName || id || '-';
  const getDesigName = (id) => designations.find(d => String(d.id) === String(id))?.designationName || id || '-';
  const getLevelName = (id) => levels.find(l => String(l.rowId) === String(id))?.level || id || '-';
  const getUnitName = (id) => [{ id: 1, name: 'UNIT 1' }, { id: 2, name: 'UNIT 2' }].find(u => String(u.id) === String(id))?.name || id || '-';
  const getUserName = (id) => {
    if (!id) return '-';
    if (id === 'SYSTEM') return 'SYSTEM';
    const u = users.find(u => String(u.userId) === String(id));
    return u ? u.userId : id;
  };

  const safeDateFormat = (dateStr) => {
    if (!dateStr) return '-';
    // If it's a string, try to show at least the date part
    if (typeof dateStr === 'string') {
      return dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
    }
    try {
      const d = new Date(dateStr);
      return isNaN(d.getTime()) ? String(dateStr) : format(d, 'dd-MM-yyyy HH:mm');
    } catch (e) {
      return String(dateStr);
    }
  };

  // SOP #16 — Global filter config
  useEffect(() => {
    const config = [
      {
        id: 'status', label: 'Status', type: 'select',
        options: [
          { value: 'All', label: 'ALL' },
          { value: 'Active', label: 'ACTIVE' },
          { value: 'In Active', label: 'INACTIVE' }
        ],
        defaultValue: 'Active'
      },
      { id: 'departmentId', label: 'Department', type: 'text', placeholder: 'Filter by Department...' },
      { id: 'designationId', label: 'Designation', type: 'text', placeholder: 'Filter by Designation...' }
    ];
    dispatch(setFilterConfig(config));
    return () => dispatch(setFilterConfig(null));
  }, [dispatch]);

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(API_PATHS.HRM.EMPLOYEES);
      if (Array.isArray(response.data)) {
        setRows(response.data);
      } else {
        console.error('API did not return an array:', response.data);
        setRows([]);
      }
    } catch (error) {
      console.error('Failed to fetch employees:', error);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchEmployees(); }, [fetchEmployees]);

  const handleOpenAdd = () => navigate('/hra/employee/master/create');
  const handleOpenEdit = (row) => navigate(`/hra/employee/master/create?id=${row.id}`);

  const handleDeleteClick = (row) => {
    setDeleteTargetId(row.id);
    setDeleteTargetName(row.firstName ? `${row.firstName} ${row.lastName || ''}`.trim() : `Employee #${row.empCode}`);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    setDeleteDialogOpen(false);
    try {
      await axios.delete(`${API_PATHS.HRM.EMPLOYEES}/${deleteTargetId}`);
      dispatch(openSnackbar({ open: true, message: 'Employee deleted successfully!', variant: 'alert', alert: { variant: 'filled' }, severity: 'success', close: false }));
      fetchEmployees();
    } catch (error) {
      console.error('Failed to delete employee:', error);
      dispatch(openSnackbar({ open: true, message: 'Failed to delete employee.', variant: 'alert', alert: { variant: 'filled' }, severity: 'error', close: false }));
    }
  };

  // SOP #4 — Keyboard shortcuts
  useKeyboardShortcuts({
    'ctrl+n': handleOpenAdd,
    'escape': () => {}
  });

  const handleExport = () => {
    const exportData = filteredRows.map((r, i) => ({
      '#': i + 1,
      'First Name': r.firstName,
      'Last Name': r.lastName,
      'Emp Code': r.empCode,
      'Designation': getDesigName(r.designationId),
      'Grade': r.gradeCode,
      'Department': getDeptName(r.departmentId),
      'Level': getLevelName(r.empLevelId),
      'Home Manager': r.homeManager,
      'Business Manager': r.businessManager,
      'Supplier Name': r.supplierName || r.vendorName,
      'Created By': r.createdBy,
      'Created Date': r.createdAt ? format(new Date(r.createdAt), 'dd-MM-yyyy HH:mm') : '',
      'Status': r.status
    }));
    exportToExcel(exportData, 'Employee_Master');
  };

  // SOP #16 — Global search + filters
  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const statusFilter = globalFilters.status || 'All';
      const matchesStatus = statusFilter === 'All' || row.status === statusFilter;

      const deptFilter = globalFilters.departmentId || '';
      const matchesDept = !deptFilter || getDeptName(row.departmentId).toLowerCase().includes(deptFilter.toLowerCase());

      const desigFilter = globalFilters.designationId || '';
      const matchesDesig = !desigFilter || getDesigName(row.designationId).toLowerCase().includes(desigFilter.toLowerCase());

      const matchesSearch = !globalQuery || [
        row.firstName, row.lastName, row.empCode,
        row.homeManager, row.businessManager, row.supplierName, row.vendorName
      ].some((val) => val && String(val).toLowerCase().includes(globalQuery.toLowerCase()));

      return matchesStatus && matchesDept && matchesDesig && matchesSearch;
    });
  }, [rows, globalQuery, globalFilters, departments, designations]);

  const paginatedRows = useMemo(() => {
    if (rows.length > 0 && page === 0) {
       console.log('DEBUG: First Row Keys:', Object.keys(rows[0]));
       console.log('DEBUG: First Row Dates:', { createdAt: rows[0].createdAt, updatedAt: rows[0].updatedAt });
    }
    return filteredRows.slice(page * size, page * size + size).map((row, i) => ({
      ...row,
      index: page * size + i + 1,
      departmentId: getDeptName(row.departmentId),
      designationId: getDesigName(row.designationId),
      empLevelId: getLevelName(row.empLevelId),
      unitId: getUnitName(row.unitId),
      supplierName: row.supplierName || row.vendorName || '-',
      createdBy: getUserName(row.createdBy || row.created_by),
      createdAt: safeDateFormat(row.createdAt || row.created_at),
      updatedBy: getUserName(row.updatedBy || row.updated_by),
      updatedAt: safeDateFormat(row.updatedAt || row.updated_at),
      status: row.status || 'Active'
    }));
  }, [filteredRows, page, size, departments, designations, levels, users]);

  return (
    <MainCard
      title={
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <IconUsers size={24} />
          <Typography variant="h3">Employee Master</Typography>
        </Stack>
      }
      secondary={
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Tooltip title="Refresh">
            <IconButton onClick={fetchEmployees} color="primary" size="small" sx={{
              border: '2px solid', borderColor: 'divider', borderRadius: '8px', p: 1,
              transition: 'all 0.2s', '&:hover': { bgcolor: 'primary.light', transform: 'scale(1.05)' }
            }}>
              <IconRefresh size={20} />
            </IconButton>
          </Tooltip>
          <Button variant="outlined" color="primary" size="medium" startIcon={<IconFileDownload size={18} />} onClick={handleExport} sx={btnExport}>
            Export
          </Button>
          <Tooltip title={shortcutTooltip('Create New Employee', 'Ctrl + N')}>
            <Button variant="contained" color="primary" size="medium" onClick={handleOpenAdd} sx={btnNew}>
              + New
            </Button>
          </Tooltip>
        </Stack>
      }
    >
      <BOSDataTable
        columns={columns}
        rows={paginatedRows}
        page={page}
        size={size}
        totalCount={filteredRows.length}
        loading={loading}
        onPageChange={(p) => setPage(p)}
        onSizeChange={(s) => { setSize(s); setPage(0); }}
        onDoubleClickRow={handleOpenEdit}
        onEditRow={handleOpenEdit}
        onDeleteRow={handleDeleteClick}
      />

      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Employee"
        message="Are you sure you want to delete this employee? All related data (personal, contact, job profile, education, etc.) will be permanently removed."
        itemName={deleteTargetName}
      />
    </MainCard>
  );
}
