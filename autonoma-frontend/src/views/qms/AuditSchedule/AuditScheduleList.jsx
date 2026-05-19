import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Typography, Stack, Button, Tooltip, IconButton, Chip } from '@mui/material';
import { IconPlus, IconFileDownload, IconCalendarEvent, IconEdit, IconTrash, IconCircleCheck, IconRefresh } from '@tabler/icons-react';
import axios from 'utils/axios';
import MainCard from 'ui-component/cards/MainCard';
import { exportToExcel } from 'utils/excelExport';
import { format } from 'date-fns';
import { useDispatch, useSelector } from 'react-redux';
import { setFilterConfig } from 'store/slices/search';
import { openSnackbar } from 'store/slices/snackbar';
import ConfirmDeleteDialog from 'ui-component/ConfirmDeleteDialog';
import useKeyboardShortcuts, { shortcutTooltip } from 'hooks/useKeyboardShortcuts';
import { BOSDataTable, BOSExportButton, btnExport, btnNew, getStatusChipSx } from 'ui-component/bos';
import { API_PATHS } from 'utils/api-constants';
import usePagePermissions, { PAGE_CODES } from 'hooks/usePagePermissions';

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
  const perms = usePagePermissions(PAGE_CODES.QMS_AUDIT_SCHEDULE);

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
        defaultValue: 'OPEN',
        isStarred: true
      },
      { id: 'scheduleNo', label: 'Schedule No', type: 'text', placeholder: 'Filter by No...', isStarred: true },
      { id: 'auditType', label: 'Audit Type', type: 'text', placeholder: 'Filter by Type...', isStarred: true },
      { id: 'auditArea', label: 'Audit Area', type: 'text', placeholder: 'Filter by Area...' },
      { id: 'department', label: 'Department', type: 'text', placeholder: 'Filter by Dept...' },
      { id: 'auditor', label: 'Auditor', type: 'text', placeholder: 'Filter by Auditor...' },
      { id: 'auditee', label: 'Auditee', type: 'text', placeholder: 'Filter by Auditee...' }
    ]));
    return () => dispatch(setFilterConfig(null));
  }, [dispatch]);

  const fetchAuditSchedules = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(API_PATHS.QMS.AUDIT_SCHEDULE);
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
      await axios.put(`${API_PATHS.QMS.AUDIT_SCHEDULE}/${row.id}`, { ...row, status: 'CLOSED' });
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
      await axios.delete(`${API_PATHS.QMS.AUDIT_SCHEDULE}/${deleteTarget.id}`);
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
      'Date': r.scheduleDate ? format(new Date(r.scheduleDate), 'dd/MM/yyyy') : '',
      'Audit Type': r.auditType,
      'Audit Area': r.auditArea,
      'Auditee': r.auditee,
      'Status': r.status
    }));
    exportToExcel(exportData, 'Audit_Schedule_Details');
  };

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const statusFilter = globalFilters.status || 'OPEN';
      const matchesStatus = statusFilter === 'All' || row.status === statusFilter;
      
      const scheduleNoFilter = globalFilters.scheduleNo || '';
      const matchesScheduleNo = !scheduleNoFilter || (row.scheduleNo && row.scheduleNo.toLowerCase().includes(scheduleNoFilter.toLowerCase()));
      const auditTypeFilter = globalFilters.auditType || '';
      const matchesAuditType = !auditTypeFilter || (row.auditType && row.auditType.toLowerCase().includes(auditTypeFilter.toLowerCase()));
      const auditAreaFilter = globalFilters.auditArea || '';
      const matchesAuditArea = !auditAreaFilter || (row.auditArea && row.auditArea.toLowerCase().includes(auditAreaFilter.toLowerCase()));
      const departmentFilter = globalFilters.department || '';
      const matchesDepartment = !departmentFilter || (row.department && row.department.toLowerCase().includes(departmentFilter.toLowerCase()));
      const auditorFilter = globalFilters.auditor || '';
      const matchesAuditor = !auditorFilter || (row.auditor && row.auditor.toLowerCase().includes(auditorFilter.toLowerCase()));
      const auditeeFilter = globalFilters.auditee || '';
      const matchesAuditee = !auditeeFilter || (row.auditee && row.auditee.toLowerCase().includes(auditeeFilter.toLowerCase()));

      const matchesSearch = !globalQuery ||
        (row.scheduleNo && row.scheduleNo.toLowerCase().includes(globalQuery.toLowerCase())) ||
        (row.auditType && row.auditType.toLowerCase().includes(globalQuery.toLowerCase())) ||
        (row.auditArea && row.auditArea.toLowerCase().includes(globalQuery.toLowerCase()));
      
      return matchesStatus && matchesScheduleNo && matchesAuditType && matchesAuditArea && matchesDepartment && matchesAuditor && matchesAuditee && matchesSearch;
    });
  }, [rows, globalQuery, globalFilters]);

  const paginatedRows = useMemo(() => filteredRows.slice(page * size, page * size + size), [filteredRows, page, size]);

  useKeyboardShortcuts({
    'ctrl+n': handleOpenAdd,
    'ctrl+e': () => { if (paginatedRows.length > 0) handleOpenEdit(paginatedRows[0]); }
  });

  const renderCell = (col, row, idx) => {
    if (col.id === 'index') return idx + 1 + page * size;
    const val = row[col.id];
    if (col.id === 'status') {
      const statusText = typeof val === 'object' ? val?.name : val;
      return <Chip label={statusText} size="small" sx={getStatusChipSx(statusText === 'OPEN' ? 'ACTIVE' : 'INACTIVE')} />;
    }
    if (col.id === 'auditDate' || col.id === 'createdDate') return val ? format(new Date(val), 'dd/MM/yyyy') : '-';
    
    if (typeof val === 'object' && val !== null) {
      return val.name || val.label || val.id || '-';
    }
    return val || '-';
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
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Tooltip title="Refresh">
            <IconButton onClick={fetchAuditSchedules} color="primary" size="small" sx={{ border: '2px solid', borderColor: 'divider', borderRadius: '8px', p: 1, transition: 'all 0.2s', '&:hover': { bgcolor: 'primary.light', transform: 'scale(1.05)' } }}>
              <IconRefresh size={20} />
            </IconButton>
          </Tooltip>
          {perms.export && <BOSExportButton
            data={filteredRows}
            filename="Audit_Schedule_Details"
            columns={[
              { header: 'Schedule No', key: 'scheduleNo' },
              { header: 'Audit Type', key: 'auditType' },
              { header: 'Audit Area', key: 'auditArea' },
              { header: 'Auditee', key: 'auditee' },
              { header: 'Status', key: 'status' }
            ]}
          />}
          {perms.write && <Tooltip title={shortcutTooltip('Create New Schedule', 'Ctrl + N')}>
            <Button variant="contained" color="primary" size="medium" onClick={handleOpenAdd} sx={btnNew}>
              + New
            </Button>
          </Tooltip>}
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
        onDoubleClickRow={perms.write ? handleOpenEdit : undefined}
        onEditRow={perms.write ? handleOpenEdit : undefined}
        onDeleteRow={perms.delete ? handleDeleteClick : undefined}
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
