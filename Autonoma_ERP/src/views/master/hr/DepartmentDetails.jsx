import { useState, useEffect, useCallback, useMemo } from 'react';
import { Typography, Button, Stack, Tooltip, IconButton } from '@mui/material';
import { IconFileDownload, IconRefresh, IconBuilding } from '@tabler/icons-react';
import axios from 'utils/axios';
import { useDispatch, useSelector } from 'react-redux';
import { setFilterConfig } from 'store/slices/search';
import { openSnackbar } from 'store/slices/snackbar';
import { format } from 'date-fns';
import MainCard from 'ui-component/cards/MainCard';
import AddDepartmentDialog from './AddDepartmentDialog';
import { exportToExcel } from 'utils/excelExport';
import ConfirmDeleteDialog from 'ui-component/ConfirmDeleteDialog';
import useKeyboardShortcuts, { shortcutTooltip } from 'hooks/useKeyboardShortcuts';
import { BOSDataTable, btnExport, btnNew } from 'ui-component/bos';

// ==============================|| DEPARTMENT MASTER (BOS SOP COMPLIANT) ||============================== //

const columns = [
  { id: 'index', label: '#', minWidth: 50 },
  { id: 'departmentNo', label: 'Department Number', minWidth: 150, bold: true },
  { id: 'departmentName', label: 'Department Name', minWidth: 180 },
  { id: 'ndaCertificate', label: 'NDA', minWidth: 80 },
  { id: 'sequenceNo', label: 'Organization Sequence Number', minWidth: 200 },
  { id: 'createdBy', label: 'Created User', minWidth: 120 },
  { id: 'createdDate', label: 'Created Date', minWidth: 150 },
  { id: 'updatedBy', label: 'Updated User', minWidth: 120 },
  { id: 'updatedDate', label: 'Updated Date', minWidth: 150 },
  { id: 'status', label: 'Status', minWidth: 100 }
];

export default function DepartmentDetails() {
  const dispatch = useDispatch();
  const globalQuery = useSelector((state) => state.search.query);
  const globalFilters = useSelector((state) => state.search.filters);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [deleteTargetName, setDeleteTargetName] = useState('');

  useEffect(() => {
    const config = [
      {
        id: 'departmentNo', label: 'Department Number', type: 'text', placeholder: 'Search Dept No...'
      },
      {
        id: 'departmentName', label: 'Department Name', type: 'text', placeholder: 'Search by Name...', isConstant: true
      },
      {
        id: 'ndaCertificate', label: 'NDA', type: 'select',
        options: [
          { value: 'All', label: 'ALL' },
          { value: 'Yes', label: 'YES' },
          { value: 'No', label: 'NO' }
        ],
        defaultValue: 'All',
        isConstant: true
      },
      {
        id: 'sequenceNo', label: 'Sequence No', type: 'text', placeholder: 'Search Seq No...'
      },
      {
        id: 'status', label: 'Status', type: 'select',
        options: [
          { value: 'All', label: 'ALL' },
          { value: 'Active', label: 'ACTIVE' },
          { value: 'In Active', label: 'INACTIVE' }
        ],
        defaultValue: 'Active',
        isConstant: true
      },
      {
        id: 'createdBy', label: 'Created User', type: 'text', placeholder: 'Search Created By...'
      },
      {
        id: 'createdDate', label: 'Created Date', type: 'date'
      },
      {
        id: 'updatedBy', label: 'Updated User', type: 'text', placeholder: 'Search Updated By...'
      },
      {
        id: 'updatedDate', label: 'Updated Date', type: 'date'
      }
    ];
    dispatch(setFilterConfig(config));
    return () => dispatch(setFilterConfig(null));
  }, [dispatch]);

  const fetchDepartments = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/hrm/departments');
      setRows(response.data);
    } catch (error) {
      console.error('Failed to fetch departments:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDepartments(); }, [fetchDepartments]);

  const handleOpenAdd = () => { setSelectedRow(null); setIsReadOnly(false); setDialogOpen(true); };
  const handleOpenEdit = (row) => { setSelectedRow(row); setIsReadOnly(false); setDialogOpen(true); };
  const handleCloseDialog = (refresh) => { setDialogOpen(false); if (refresh === true) fetchDepartments(); };

  const handleDeleteClick = (row) => {
    setDeleteTargetId(row.id);
    setDeleteTargetName(row.departmentName || `Department #${row.departmentNo}`);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    setDeleteDialogOpen(false);
    try {
      await axios.delete(`/api/hrm/departments/${deleteTargetId}`);
      dispatch(openSnackbar({ open: true, message: 'Department deleted successfully!', variant: 'alert', alert: { variant: 'filled' }, severity: 'success', close: false }));
      fetchDepartments();
    } catch (error) {
      console.error('Failed to delete department:', error);
      dispatch(openSnackbar({ open: true, message: 'Failed to delete department.', variant: 'alert', alert: { variant: 'filled' }, severity: 'error', close: false }));
    }
  };

  useKeyboardShortcuts({
    'ctrl+n': handleOpenAdd,
    'escape': () => { if (dialogOpen) handleCloseDialog(); }
  });

  const handleExport = () => {
    const exportData = filteredRows.map((r, i) => ({
      '#': i + 1,
      'Department Number': r.departmentNo,
      'Department Name': r.departmentName,
      'NDA Certificate': r.ndaCertificate,
      'Organization Sequence Number': r.sequenceNo,
      'Created User': r.createdBy,
      'Created Date': r.createdDate ? format(new Date(r.createdDate), 'dd-MM-yyyy HH:mm') : '',
      'Updated User': r.updatedBy,
      'Updated Date': r.updatedDate ? format(new Date(r.updatedDate), 'dd-MM-yyyy HH:mm') : '',
      Status: r.status
    }));
    exportToExcel(exportData, 'Department_Details');
  };

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      // Status
      const statusFilter = globalFilters.status || 'All';
      const matchesStatus = statusFilter === 'All' || row.status === statusFilter;

      // Department Name
      const nameFilter = globalFilters.departmentName || '';
      const matchesName = !nameFilter || (row.departmentName && row.departmentName.toLowerCase().includes(nameFilter.toLowerCase()));

      // Department Number
      const noFilter = globalFilters.departmentNo || '';
      const matchesNo = !noFilter || (row.departmentNo && row.departmentNo.toString().includes(noFilter.toString()));

      // NDA Certificate
      const ndaFilter = globalFilters.ndaCertificate || 'All';
      const matchesNda = ndaFilter === 'All' || row.ndaCertificate === ndaFilter;

      // Sequence Number
      const seqFilter = globalFilters.sequenceNo || '';
      const matchesSeq = !seqFilter || (row.sequenceNo && row.sequenceNo.toString().includes(seqFilter.toString()));

      // Created By
      const createdByFilter = globalFilters.createdBy || '';
      const matchesCreatedBy = !createdByFilter || (row.createdBy && row.createdBy.toLowerCase().includes(createdByFilter.toLowerCase()));

      // Updated By
      const updatedByFilter = globalFilters.updatedBy || '';
      const matchesUpdatedBy = !updatedByFilter || (row.updatedBy && row.updatedBy.toLowerCase().includes(updatedByFilter.toLowerCase()));

      // Created Date
      const createdDateFilter = globalFilters.createdDate || '';
      const matchesCreatedDate = !createdDateFilter || (row.createdDate && row.createdDate.includes(createdDateFilter));

      // Updated Date
      const updatedDateFilter = globalFilters.updatedDate || '';
      const matchesUpdatedDate = !updatedDateFilter || (row.updatedDate && row.updatedDate.includes(updatedDateFilter));

      // Global Search Query
      const q = globalQuery ? globalQuery.toLowerCase() : '';
      const matchesSearch = !q ||
        (row.departmentName && row.departmentName.toLowerCase().includes(q)) ||
        (row.departmentNo && row.departmentNo.toString().toLowerCase().includes(q)) ||
        (row.ndaCertificate && row.ndaCertificate.toLowerCase().includes(q)) ||
        (row.sequenceNo && row.sequenceNo.toString().toLowerCase().includes(q)) ||
        (row.createdBy && row.createdBy.toLowerCase().includes(q)) ||
        (row.createdDate && row.createdDate.toLowerCase().includes(q)) ||
        (row.updatedBy && row.updatedBy.toLowerCase().includes(q)) ||
        (row.updatedDate && row.updatedDate.toLowerCase().includes(q)) ||
        (row.status && row.status.toString().toLowerCase().includes(q));

      return matchesStatus && matchesName && matchesNo && matchesNda && matchesSeq &&
        matchesCreatedBy && matchesUpdatedBy && matchesCreatedDate && matchesUpdatedDate && matchesSearch;
    });
  }, [rows, globalQuery, globalFilters]);

  const paginatedRows = useMemo(() => filteredRows.slice(page * size, page * size + size), [filteredRows, page, size]);

  return (
    <MainCard
      title={
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <IconBuilding size={24} />
          <Typography variant="h3">Department Master</Typography>
        </Stack>
      }
      secondary={
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Tooltip title="Refresh">
            <IconButton onClick={fetchDepartments} color="primary" size="small" sx={{
              border: '2px solid', borderColor: 'divider', borderRadius: '8px', p: 1,
              transition: 'all 0.2s', '&:hover': { bgcolor: 'primary.light', transform: 'scale(1.05)' }
            }}>
              <IconRefresh size={20} />
            </IconButton>
          </Tooltip>
          <Button variant="outlined" color="primary" size="medium" startIcon={<IconFileDownload size={18} />} onClick={handleExport} sx={btnExport}>
            Export Excel
          </Button>
          <Tooltip title={shortcutTooltip('Create New Department', 'Ctrl + N')}>
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

      <AddDepartmentDialog open={dialogOpen} handleClose={handleCloseDialog} initialData={selectedRow} readOnly={isReadOnly} />
      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Department"
        message="Are you sure you want to delete this department? This action cannot be undone."
        itemName={deleteTargetName}
      />
    </MainCard>
  );
}
