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
  { id: 'photo', label: 'PHOTO', minWidth: 80 },
  { id: 'employeeName', label: 'EMPLOYEE NAME', minWidth: 200, bold: true },
  { id: 'empCode', label: 'EMP CODE', minWidth: 110 },
  { id: 'designationId', label: 'DESIGNATION', minWidth: 150 },
  { id: 'departmentId', label: 'DEPARTMENT', minWidth: 150 },
  { id: 'gradeCode', label: 'GRADE', minWidth: 80 },
  { id: 'empLevelId', label: 'LEVEL', minWidth: 100 },
  { id: 'unitId', label: 'UNIT NAME', minWidth: 120 },
  { id: 'homeManager', label: 'MANAGER', minWidth: 150 },
  { id: 'status', label: 'STATUS', minWidth: 100 }
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

  // SOP #16 — Global filter config
  useEffect(() => {
    const config = [
      {
        id: 'status', label: 'Status', type: 'select', isStarred: true,
        options: [
          { value: 'All', label: 'ALL' },
          { value: 'Active', label: 'ACTIVE' },
          { value: 'In Active', label: 'INACTIVE' }
        ],
        defaultValue: 'Active'
      },
      {
        id: 'searchBy', label: 'Search By', type: 'select', isStarred: true,
        options: [
          { value: 'employeeName', label: 'Employee Name' },
          { value: 'empCode', label: 'Employee Code' },
          { value: 'homeManager', label: 'Home Manager' }
        ],
        defaultValue: 'employeeName'
      },
      { id: 'searchText', label: 'Search', type: 'text', placeholder: 'Type to filter...', isStarred: true }
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
    if (!Array.isArray(rows)) return [];

    return rows.filter((row) => {
      if (!row) return false;

      // 1. Status Filter
      const statusFilter = globalFilters?.status || 'Active';
      if (statusFilter !== 'All' && (row.status || 'Active') !== statusFilter) return false;

      // 2. Advanced Search (Search By + Search Text)
      const searchText = (globalFilters?.searchText || '').toLowerCase();
      const searchBy = globalFilters?.searchBy || 'employeeName';
      if (searchText) {
        let val = '';
        if (searchBy === 'employeeName') {
          val = row.employeeName || `${row.firstName || ''} ${row.lastName || ''}`.trim();
        } else {
          val = row[searchBy];
        }
        if (!String(val || '').toLowerCase().includes(searchText)) return false;
      }

      // 3. Global Query (Quick search across all fields)
      if (globalQuery) {
        const q = globalQuery.toLowerCase();
        return (row.firstName && row.firstName.toLowerCase().includes(q)) ||
               (row.lastName && row.lastName.toLowerCase().includes(q)) ||
               (row.empCode && row.empCode.toLowerCase().includes(q)) ||
               (row.homeManager && row.homeManager.toLowerCase().includes(q));
      }

      return true;
    });
  }, [rows, globalQuery, globalFilters]);

  const paginatedRows = useMemo(() => {
    if (!Array.isArray(filteredRows)) return [];
    console.debug(`EmployeeList: Paginating ${filteredRows.length} filtered rows (page ${page}, size ${size})`);
    return filteredRows.slice(page * size, page * size + size).map((row, i) => ({
      ...row,
      index: page * size + i + 1,
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
  }, [filteredRows, page, size, departments, designations, levels, users]);

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
            data={filteredRows}
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
