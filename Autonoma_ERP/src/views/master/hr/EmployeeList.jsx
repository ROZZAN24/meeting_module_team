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

// ==============================|| EMPLOYEE MASTER LIST (BOS SOP COMPLIANT) ||============================== //

const columns = [
  { id: 'index', label: '#', minWidth: 50 },
  { id: 'oldEmpCode', label: 'Old Emp Code', minWidth: 110 },
  { id: 'firstName', label: 'First Name', minWidth: 140, bold: true },
  { id: 'lastName', label: 'Last Name', minWidth: 140 },
  { id: 'empCode', label: 'Emp Code', minWidth: 110 },
  { id: 'designationId', label: 'Designation', minWidth: 120 },
  { id: 'gradeCode', label: 'Grade', minWidth: 80 },
  { id: 'departmentId', label: 'Department', minWidth: 120 },
  { id: 'unitId', label: 'Unit Name', minWidth: 100 },
  { id: 'homeManager', label: 'Home Manager', minWidth: 130 },
  { id: 'businessManager', label: 'Business Manager', minWidth: 140 },
  { id: 'supplierName', label: 'Supplier Name', minWidth: 130 },
  { id: 'createdBy', label: 'Created By', minWidth: 110 },
  { id: 'createdDate', label: 'Created Date', minWidth: 140 },
  { id: 'updatedBy', label: 'Modified By', minWidth: 110 },
  { id: 'updatedDate', label: 'Modified Date', minWidth: 140 },
  { id: 'status', label: 'Status', minWidth: 90 }
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
      setRows(response.data);
    } catch (error) {
      console.error('Failed to fetch employees:', error);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchEmployees(); }, [fetchEmployees]);

  const handleOpenAdd = () => navigate('/hra/hr/employee/master/create');
  const handleOpenEdit = (row) => navigate(`/hra/hr/employee/master/create?id=${row.id}`);

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
      'Old Emp Code': r.oldEmpCode,
      'First Name': r.firstName,
      'Last Name': r.lastName,
      'Emp Code': r.empCode,
      'Designation': r.designationId,
      'Grade': r.gradeCode,
      'Department': r.departmentId,
      'Unit Name': r.unitId,
      'Home Manager': r.homeManager,
      'Business Manager': r.businessManager,
      'Supplier Name': r.supplierName,
      'Created By': r.createdBy,
      'Created Date': r.createdDate ? format(new Date(r.createdDate), 'dd-MM-yyyy HH:mm') : '',
      'Modified By': r.updatedBy,
      'Modified Date': r.updatedDate ? format(new Date(r.updatedDate), 'dd-MM-yyyy HH:mm') : '',
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
      const matchesDept = !deptFilter || String(row.departmentId || '').toLowerCase().includes(deptFilter.toLowerCase());

      const desigFilter = globalFilters.designationId || '';
      const matchesDesig = !desigFilter || String(row.designationId || '').toLowerCase().includes(desigFilter.toLowerCase());

      const matchesSearch = !globalQuery || [
        row.firstName, row.lastName, row.empCode, row.oldEmpCode,
        row.homeManager, row.businessManager, row.supplierName
      ].some((val) => val && val.toLowerCase().includes(globalQuery.toLowerCase()));

      return matchesStatus && matchesDept && matchesDesig && matchesSearch;
    });
  }, [rows, globalQuery, globalFilters]);

  const paginatedRows = useMemo(() => filteredRows.slice(page * size, page * size + size), [filteredRows, page, size]);

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
            Export Excel
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
