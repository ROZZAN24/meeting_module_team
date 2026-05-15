import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Typography, Button, Stack, Tooltip, IconButton } from '@mui/material';
import { IconFileDownload, IconRefresh, IconUsers, IconUser } from '@tabler/icons-react';
import { Avatar } from '@mui/material';
import axios from 'utils/axios';
import { useDispatch, useSelector } from 'react-redux';
import { setFilterConfig } from 'store/slices/search';
import { openSnackbar } from 'store/slices/snackbar';
import { format } from 'date-fns';
import MainCard from 'ui-component/cards/MainCard';
import { exportToExcel } from 'utils/excelExport';
import ConfirmDeleteDialog from 'ui-component/ConfirmDeleteDialog';
import useKeyboardShortcuts, { shortcutTooltip } from 'hooks/useKeyboardShortcuts';
import { BOSDataTable, BOSExportButton, btnExport, btnNew, getPhotoUrl } from 'ui-component/bos';
import { API_PATHS } from 'utils/api-constants';
import { useLookups } from 'hooks/useLookups';

// ==============================|| EMPLOYEE MASTER LIST (BOS SOP COMPLIANT) ||============================== //

const columns = [
  { id: 'index', label: '#', minWidth: 50 },
  { id: 'photo', label: 'Photo', minWidth: 80 },
  { id: 'employeeName', label: 'Employee Name', required: true, bold: true, minWidth: 180 },
  { id: 'empCode', label: 'Emp Code', required: true, minWidth: 120 },
  { id: 'designationId', label: 'Designation', minWidth: 150 },
  { id: 'departmentId', label: 'Department', required: true, minWidth: 150 },
  { id: 'gradeCode', label: 'Grade', required: true, minWidth: 100 },
  { id: 'status', label: 'Status', required: true, minWidth: 100 },
  { id: 'createdBy', label: 'Created By', minWidth: 120 },
  { id: 'createdDate', label: 'Created Date', minWidth: 150 },
  { id: 'updatedBy', label: 'Updated By', minWidth: 120 },
  { id: 'updatedDate', label: 'Updated Date', minWidth: 150 }
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
    users = [],
    grades = []
  } = useLookups(['DEPARTMENTS', 'DESIGNATIONS', 'LEVELS', 'USERS', 'GRADES']);

  const getDeptName = (id) => String(departments.find(d => String(d.id) === String(id))?.departmentName || id || '-');
  const getDesigName = (id) => String(designations.find(d => String(d.id) === String(id))?.designationName || id || '-');
  const getLevelName = (id) => String(levels.find(l => String(l.rowId) === String(id))?.level || id || '-');
  const getUnitName = (id) => String([{ id: 1, name: 'UNIT 1' }, { id: 2, name: 'UNIT 2' }].find(u => String(u.id) === String(id))?.name || id || '-');
  const getUserName = (id) => {
    if (!id) return '-';
    if (id === 'SYSTEM') return 'SYSTEM';
    const u = users.find(u => String(u.userId) === String(id));
    return String(u ? u.userId : id);
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

  // SOP #16 — Global filter config handled automatically by Rule 1 & Rule 2
  useEffect(() => {
    // We no longer need manual config here as BOSDataTable now auto-extracts options from rows
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

  // SOP #16 — Global search + filters are now handled internally by BOSDataTable.
  // We just need to provide the resolved data for display.
  const resolvedRows = useMemo(() => {
    if (!Array.isArray(rows)) return [];
    console.debug(`EmployeeList: Resolving ${rows.length} rows for display`);
    return rows.map((row) => ({
      ...row,
      photo: row.employeePhotoUpload,
      employeeName: row.employeeName || `${row.firstName || ''} ${row.lastName || ''}`.trim() || '-',
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
  }, [rows, departments, designations, levels, users]);

  const handleExport = () => {
    const exportData = resolvedRows.map((r, i) => ({
      '#': i + 1,
      'First Name': r.firstName,
      'Last Name': r.lastName,
      'Emp Code': r.empCode,
      'Designation': r.designationId,
      'Grade': r.gradeCode,
      'Department': r.departmentId,
      'Level': r.empLevelId,
      'Home Manager': r.homeManager,
      'Business Manager': r.businessManager,
      'Supplier Name': r.supplierName || r.vendorName,
      'Created By': r.createdBy,
      'Created Date': r.createdAt,
      'Status': r.status
    }));
    exportToExcel(exportData, 'Employee_Master');
  };

  const renderCell = (col, row) => {
    if (col.id === 'index') return row.index;
    if (col.id === 'photo') {
      return (
        <Avatar
          src={getPhotoUrl(row.photo)}
          variant="rounded"
          sx={{ width: 32, height: 40, bgcolor: 'grey.100', border: '1px solid', borderColor: 'divider' }}
        >
          <IconUser size={18} color="#ccc" />
        </Avatar>
      );
    }
    return String(row[col.id] || '-');
  };

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
          <BOSExportButton
            data={resolvedRows}
            filename="Employee_Master"
            columns={[
              { header: 'Emp Code', key: 'empCode' },
              { header: 'First Name', key: 'firstName' },
              { header: 'Last Name', key: 'lastName' },
              { header: 'Status', key: 'status' }
            ]}
          />
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
        rows={resolvedRows}
        page={page}
        size={size}
        loading={loading}
        onPageChange={(p) => setPage(p)}
        onSizeChange={(s) => { setSize(s); setPage(0); }}
        onDoubleClickRow={handleOpenEdit}
        onEditRow={handleOpenEdit}
        onDeleteRow={handleDeleteClick}
        renderCell={renderCell}
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
