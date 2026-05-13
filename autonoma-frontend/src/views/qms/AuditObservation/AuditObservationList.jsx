import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Typography, Stack, Button, Tooltip, IconButton, Chip } from '@mui/material';
import { IconSearch, IconFileDownload, IconPlus, IconEdit, IconTrash, IconRefresh, IconFileText } from '@tabler/icons-react';
import axios from 'utils/axios';
import MainCard from 'ui-component/cards/MainCard';
import { exportToExcel } from 'utils/excelExport';
import { format } from 'date-fns';
import { useDispatch, useSelector } from 'react-redux';
import { setFilterConfig } from 'store/slices/search';
import { openSnackbar } from 'store/slices/snackbar';
import { BOSDataTable, BOSExportButton, btnExport, btnNew, getStatusChipSx } from 'ui-component/bos';
import { API_PATHS } from 'utils/api-constants';
import ConfirmDeleteDialog from 'ui-component/ConfirmDeleteDialog';
import useKeyboardShortcuts, { shortcutTooltip } from 'hooks/useKeyboardShortcuts';

const columns = [
  { id: 'index', label: '#', minWidth: 50 },
  { id: 'observationNo', label: 'Observation No', minWidth: 130, bold: true },
  { id: 'observationDate', label: 'Date', minWidth: 100 },
  { id: 'auditScheduleNo', label: 'Schedule No', minWidth: 130 },
  { id: 'auditType', label: 'Audit Type', minWidth: 150 },
  { id: 'departmentName', label: 'Dept Name', minWidth: 150 },
  { id: 'auditee', label: 'Auditee', minWidth: 120 },
  { id: 'auditor', label: 'Auditor', minWidth: 120 },
  { id: 'ncrCount', label: 'NCR', minWidth: 80 },
  { id: 'ofiCount', label: 'OFI', minWidth: 80 },
  { id: 'auditScore', label: 'Score', minWidth: 80 },
  { id: 'status', label: 'Status', minWidth: 100 }
];

export default function AuditObservationList() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const globalQuery = useSelector((state) => state.search.query);
  const globalFilters = useSelector((state) => state.search.filters);

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    dispatch(setFilterConfig([
      { id: 'fromDate', label: 'From Date', type: 'date', defaultValue: format(new Date().setMonth(new Date().getMonth() - 1), 'yyyy-MM-dd') },
      { id: 'toDate', label: 'To Date', type: 'date', defaultValue: format(new Date(), 'yyyy-MM-dd') },
      { id: 'considerDate', label: 'Consider Date?', type: 'select', options: [{ value: 'Yes', label: 'Yes' }, { value: 'No', label: 'No' }], defaultValue: 'No' },
      {
        id: 'auditType',
        label: 'Audit Type',
        type: 'select',
        options: [
          { value: 'All', label: 'ALL' },
          { value: 'INTERNAL', label: 'INTERNAL' },
          { value: 'EXTERNAL', label: 'EXTERNAL' }
        ],
        defaultValue: 'All'
      },
      {
        id: 'status',
        label: 'Status',
        type: 'select',
        options: [
          { value: 'All', label: 'ALL' },
          { value: 'PENDING', label: 'PENDING' },
          { value: 'APPROVED', label: 'APPROVED' },
          { value: 'REJECTED', label: 'REJECTED' }
        ],
        defaultValue: 'All'
      },
      {
        id: 'searchBy',
        label: 'Search By',
        type: 'select',
        options: [
          { value: 'observationNo', label: 'Observation No' },
          { value: 'auditScheduleNo', label: 'Schedule No' }
        ],
        defaultValue: 'observationNo'
      }
    ]));
    return () => dispatch(setFilterConfig(null));
  }, [dispatch]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(API_PATHS.QMS.AUDIT_OBSERVATION);
      setRows(response.data || []);
    } catch (error) {
      console.error('Failed to fetch observations:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleOpenAdd = () => navigate('/qms/audit/observation/add');
  const handleOpenEdit = (row) => navigate(`/qms/audit/observation/edit/${row.id}`);

  const handleDeleteConfirm = async () => {
    try {
      await axios.delete(`${API_PATHS.QMS.AUDIT_OBSERVATION}/${deleteTarget.id}`);
      dispatch(openSnackbar({ open: true, message: 'Observation deleted!', severity: 'success', variant: 'alert' }));
      setDeleteDialogOpen(false);
      fetchData();
    } catch (error) {
      dispatch(openSnackbar({ open: true, message: 'Failed to delete observation', severity: 'error', variant: 'alert' }));
    }
  };

  const handleExport = () => {
    const exportData = filteredRows.map((r, i) => ({
      '#': i + 1,
      'Observation No': r.observationNo,
      'Date': r.observationDate ? format(new Date(r.observationDate), 'dd-MM-yyyy') : '',
      'Schedule No': r.auditScheduleNo,
      'Dept': r.departmentName,
      'Auditor': r.auditor,
      'Score': r.auditScore,
      'Status': r.status
    }));
    exportToExcel(exportData, 'Audit_Observations');
  };

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const statusFilter = globalFilters.status || 'All';
      const matchesStatus = statusFilter === 'All' || row.status === statusFilter;
      const matchesSearch = !globalQuery || 
        (row.observationNo && row.observationNo.toLowerCase().includes(globalQuery.toLowerCase())) ||
        (row.departmentName && row.departmentName.toLowerCase().includes(globalQuery.toLowerCase()));
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
    const val = row[col.id];
    if (col.id === 'observationDate') return val ? format(new Date(val), 'dd-MM-yyyy') : '-';
    if (col.id === 'status') {
      const statusText = typeof val === 'object' ? val?.name : val;
      return <Chip label={statusText} size="small" sx={getStatusChipSx(statusText === 'APPROVED' ? 'ACTIVE' : (statusText === 'PENDING' ? 'PENDING' : 'INACTIVE'))} />;
    }
    if (typeof val === 'object' && val !== null) {
      return val.name || val.label || val.id || '-';
    }
    return val || '-';
  };

  return (
    <MainCard
      title={
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <IconFileText size={24} />
          <Typography variant="h3">Audit Observation Master</Typography>
        </Stack>
      }
      secondary={
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Tooltip title="Refresh">
            <IconButton onClick={fetchData} color="primary" size="small" sx={{ border: '2px solid', borderColor: 'divider', borderRadius: '8px', p: 1, transition: 'all 0.2s', '&:hover': { bgcolor: 'primary.light', transform: 'scale(1.05)' } }}>
              <IconRefresh size={20} />
            </IconButton>
          </Tooltip>
          <BOSExportButton
            data={filteredRows}
            filename="Audit_Observations"
            columns={[
              { header: 'Observation No', key: 'observationNo' },
              { header: 'Date', key: 'observationDate' },
              { header: 'Schedule No', key: 'auditScheduleNo' },
              { header: 'Dept Name', key: 'departmentName' },
              { header: 'Status', key: 'status' }
            ]}
          />
          <Tooltip title={shortcutTooltip('Create New Observation', 'Ctrl + N')}>
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
        onEditRow={handleOpenEdit}
        onDeleteRow={(row) => { setDeleteTarget(row); setDeleteDialogOpen(true); }}
        renderCell={renderCell}
      />

      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Observation"
        message="Are you sure you want to delete this observation?"
        itemName={deleteTarget?.observationNo}
      />
    </MainCard>
  );
}
