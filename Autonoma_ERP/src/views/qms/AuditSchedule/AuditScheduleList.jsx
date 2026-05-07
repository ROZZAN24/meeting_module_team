import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Typography, Stack, Button, Tooltip, IconButton, Chip } from '@mui/material';
import { IconPlus, IconFileDownload, IconCalendarEvent, IconEdit, IconTrash, IconCircleCheck } from '@tabler/icons-react';
import axios from 'utils/axios';
import MainCard from 'ui-component/cards/MainCard';
import { exportToExcel } from 'utils/excelExport';
import { format } from 'date-fns';
import { useDispatch, useSelector } from 'react-redux';
import { setFilterConfig } from 'store/slices/search';
import { openSnackbar } from 'store/slices/snackbar';
import ConfirmDeleteDialog from 'ui-component/ConfirmDeleteDialog';
import useKeyboardShortcuts, { shortcutTooltip } from 'hooks/useKeyboardShortcuts';
import { BOSDataTable, btnExport, btnNew, getStatusChipSx } from 'ui-component/bos';

const columns = [
  { id: 'index', label: '#', minWidth: 50 },
  { id: 'scheduleNo', label: 'Schedule No', minWidth: 120, bold: true },
  { id: 'auditType', label: 'Audit Type', minWidth: 150 },
  { id: 'auditArea', label: 'Audit Area', minWidth: 120 },
  { id: 'department', label: 'Department', minWidth: 120 },
  { id: 'auditDate', label: 'Audit Date', minWidth: 100 },
  { id: 'auditor', label: 'Auditor', minWidth: 120 },
  { id: 'auditee', label: 'Auditee', minWidth: 120 },
  { id: 'status', label: 'Status', minWidth: 100 },
  { id: 'createdDate', label: 'Created Date', minWidth: 120 },
  { id: 'createdBy', label: 'Created By', minWidth: 100 }
];

export default function AuditScheduleList() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const globalQuery = useSelector((state) => state.search.query);
  const globalFilters = useSelector((state) => state.search.filters);

  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    dispatch(setFilterConfig([
      {
        id: 'status',
        label: 'Status',
        type: 'select',
        options: [
          { value: 'All', label: 'ALL' },
          { value: 'OPEN', label: 'OPEN' },
          { value: 'CLOSED', label: 'CLOSED' },
          { value: 'CANCELLED', label: 'CANCELLED' }
        ],
        defaultValue: 'All'
      }
    ]));
    return () => dispatch(setFilterConfig(null));
  }, [dispatch]);

  const fetchAuditSchedules = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/qms/audit-schedules');
      setRows(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Failed to fetch audit schedules:', error);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAuditSchedules(); }, [fetchAuditSchedules]);

  const handleOpenAdd = () => navigate('/qms/audit/schedule/add');
  const handleOpenEdit = (row) => navigate(`/qms/audit/schedule/edit/${row.id}`);

  const handleCloseAudit = async (row) => {
    try {
      await axios.put(`/api/qms/audit-schedules/${row.id}`, { ...row, status: 'CLOSED' });
      dispatch(openSnackbar({ open: true, message: 'Audit closed successfully!', severity: 'success', variant: 'alert' }));
      fetchAuditSchedules();
    } catch (error) {
      dispatch(openSnackbar({ open: true, message: 'Failed to close audit.', severity: 'error', variant: 'alert' }));
    }
  };

  const handleDeleteClick = (row) => {
    setDeleteTarget(row);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    setDeleteDialogOpen(false);
    try {
      await axios.delete(`/api/qms/audit-schedules/${deleteTarget.id}`);
      dispatch(openSnackbar({ open: true, message: 'Audit Schedule deleted!', severity: 'success', variant: 'alert' }));
      fetchAuditSchedules();
    } catch (error) {
      dispatch(openSnackbar({ open: true, message: 'Failed to delete schedule.', severity: 'error', variant: 'alert' }));
    }
  };

  const handleExport = () => {
    const exportData = filteredRows.map((r, i) => ({
      '#': i + 1,
      'Schedule No': r.scheduleNo,
      'Date': r.scheduleDate ? format(new Date(r.scheduleDate), 'dd-MM-yyyy') : '',
      'Audit Type': r.auditType,
      'Audit Area': r.auditArea,
      'Auditee': r.auditee,
      'Status': r.status
    }));
    exportToExcel(exportData, 'Audit_Schedule_Details');
  };

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const statusFilter = globalFilters.status || 'All';
      const matchesStatus = statusFilter === 'All' || row.status === statusFilter;
      const matchesSearch = !globalQuery ||
        (row.scheduleNo && row.scheduleNo.toLowerCase().includes(globalQuery.toLowerCase())) ||
        (row.auditType && row.auditType.toLowerCase().includes(globalQuery.toLowerCase())) ||
        (row.auditArea && row.auditArea.toLowerCase().includes(globalQuery.toLowerCase()));
      return matchesStatus && matchesSearch;
    });
  }, [rows, globalQuery, globalFilters]);

  const paginatedRows = useMemo(() => filteredRows.slice(page * size, page * size + size), [filteredRows, page, size]);

  useKeyboardShortcuts({
    'ctrl+n': handleOpenAdd,
    'ctrl+e': () => { if (paginatedRows.length > 0) handleOpenEdit(paginatedRows[0]); }
  });

  const renderCell = (col, row, idx) => {
    if (col.id === 'index') return idx + 1 + page * size;
    if (col.id === 'status') return <Chip label={row.status} size="small" sx={getStatusChipSx(row.status === 'OPEN' ? 'ACTIVE' : 'INACTIVE')} />;
    if (col.id === 'auditDate' || col.id === 'createdDate') return row[col.id] ? format(new Date(row[col.id]), 'dd-MM-yyyy') : '-';
    return row[col.id] || '-';
  };

  return (
    <MainCard
      title={
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <IconCalendarEvent size={24} />
          <Typography variant="h3">Audit Schedule Master</Typography>
        </Stack>
      }
      secondary={
        <Stack direction="row" spacing={1.5}>
          <Button variant="outlined" color="primary" size="medium" startIcon={<IconFileDownload size={18} />} onClick={handleExport} sx={btnExport}>
            Export Excel
          </Button>
          <Tooltip title={shortcutTooltip('Create New Schedule', 'Ctrl + N')}>
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
        onPageChange={setPage}
        onSizeChange={(s) => { setSize(s); setPage(0); }}
        onDoubleClickRow={handleOpenEdit}
        onEditRow={handleOpenEdit}
        onDeleteRow={handleDeleteClick}
        renderCell={renderCell}
        customActions={(row) => (
          <Tooltip title="Close Audit">
            <IconButton
              size="small"
              color="success"
              onClick={() => handleCloseAudit(row)}
              disabled={row.status === 'CLOSED'}
              sx={{ bgcolor: 'success.light', color: 'success.dark', opacity: row.status === 'CLOSED' ? 0.5 : 1, '&:hover': { bgcolor: 'success.main', color: 'white' } }}
            >
              <IconCircleCheck size={18} />
            </IconButton>
          </Tooltip>
        )}
      />

      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Audit Schedule"
        message="Are you sure you want to delete this audit schedule? This action cannot be undone."
        itemName={deleteTarget?.scheduleNo}
      />
    </MainCard>
  );
}
