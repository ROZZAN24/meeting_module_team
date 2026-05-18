import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Typography,
  Box,
  Button,
  Stack,
  IconButton,
  Tooltip,
  Chip,
  Divider,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid
} from '@mui/material';
import {
  IconFileDownload,
  IconChecks,
  IconX,
  IconRefresh,
  IconBan
} from '@tabler/icons-react';
import axios from 'utils/axios';
import { useDispatch, useSelector } from 'react-redux';
import { openSnackbar } from 'store/slices/snackbar';
import { setFilterConfig } from 'store/slices/search';
import MainCard from 'ui-component/cards/MainCard';
import { exportToExcel } from 'utils/excelExport';
import {
  BOSDataTable,
  btnExport,
  getStatusChipSx
} from 'ui-component/bos';
import useKeyboardShortcuts from 'hooks/useKeyboardShortcuts';
import useLookups from 'hooks/useLookups';
import { API_PATHS } from 'utils/api-constants';
import { AddCheckListDialog } from './AddCheckListDialog';

const columns = [
  { id: 'index', label: '#', minWidth: 50 },
  { id: 'seqNo', label: 'Seq No', minWidth: 80 },
  { id: 'checkingPoint', label: 'Checking Point', minWidth: 200 },
  { id: 'category', label: 'Category', minWidth: 120 },
  { id: 'frequency', label: 'Frequency', minWidth: 120 },
  { id: 'department', label: 'Department', minWidth: 150 },
  { id: 'effectiveFrom', label: 'Effective From', minWidth: 120 },
  { id: 'reminderDays', label: 'Days', minWidth: 80 },
  { id: 'expiryDate', label: 'Expire Date', minWidth: 120 },
  { id: 'stockLink', label: 'Stock Link', minWidth: 100 },
  { id: 'createdDate', label: 'Created Date', minWidth: 120 },
  { id: 'createdBy', label: 'Created By', minWidth: 120 },
  { id: 'status', label: 'Verify Status', minWidth: 150 },
  { id: 'verifiedBy', label: 'Verified By', minWidth: 120 },
  { id: 'verifiedDate', label: 'Verified Date', minWidth: 120 }
];

export default function CheckListVerify() {
  const dispatch = useDispatch();
  const [rows, setRows] = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectRemarks, setRejectRemarks] = useState('');
  const lookups = useLookups(['DEPARTMENTS']);

  const searchQuery = useSelector((state) => state.search.query);
  const filters = useSelector((state) => state.search.filters);

  useEffect(() => {
    dispatch(setFilterConfig([
      { id: 'status', label: 'Status', type: 'select', isStarred: true, options: [{ label: 'Pending for Verify', value: 'Pending for Verify' }, { label: 'Verified', value: 'Verified' }, { label: 'Rejected', value: 'Rejected' }, { label: 'All Status', value: 'All' }], defaultValue: 'Pending for Verify' },
      { id: 'category', label: 'Category', type: 'select', isStarred: true, options: [{ label: 'All', value: 'All' }, { label: 'Renewal', value: 'RENEWAL' }, { label: 'Check List', value: 'CHECK LIST' }], defaultValue: 'All' },
      { id: 'department', label: 'Department', type: 'select', isStarred: true, options: [{ label: 'All', value: 'All' }, ...(lookups.departments || []).map(d => ({ label: d.departmentName, value: d.departmentName }))], defaultValue: 'All' },
      { id: 'seqNo', label: 'Seq No', type: 'text' },
      { id: 'checkingPoint', label: 'Checking Point', type: 'text' },
      { id: 'frequency', label: 'Frequency', type: 'select', options: [{ label: 'All', value: 'All' }, { label: 'DAILY', value: 'DAILY' }, { label: 'WEEKLY', value: 'WEEKLY' }, { label: 'MONTHLY', value: 'MONTHLY' }, { label: 'YEARLY', value: 'YEARLY' }], defaultValue: 'All' },
      { id: 'searchBy', label: 'Search by', type: 'select', options: [{ label: 'Seq No', value: 'seqNo' }, { label: 'Checking Point', value: 'checkingPoint' }, { label: 'Category', value: 'category' }, { label: 'Frequency', value: 'frequency' }], defaultValue: 'checkingPoint' }
    ]));
    return () => dispatch(setFilterConfig(null));
  }, [dispatch, lookups.departments]);

  const fetchChecklists = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page, size,
        verifyStatus: (filters.status && filters.status !== 'All') ? filters.status : (filters.status === 'All' ? undefined : 'Pending for Verify'),
        category: filters.category !== 'All' ? filters.category : undefined,
        department: filters.department !== 'All' ? filters.department : undefined,
        seqNo: filters.seqNo || undefined,
        checkingPoint: filters.checkingPoint || undefined,
        frequency: filters.frequency !== 'All' ? filters.frequency : undefined,
        searchBy: filters.searchBy !== 'All' ? filters.searchBy : undefined,
        searchValue: searchQuery || undefined
      };
      const response = await axios.get(API_PATHS.QMS.CHECKLIST, { params });
      setRows(response.data.content || []);
      setTotalElements(response.data.totalElements || 0);
    } catch (error) {
      console.error('Failed to fetch checklists:', error);
    } finally {
      setLoading(false);
    }
  }, [page, size, filters, searchQuery]);

  useEffect(() => {
    fetchChecklists();
  }, [fetchChecklists]);

  const handleRowClick = (row) => setSelectedRow(row);
  const handleRowDoubleClick = (row) => {
    setSelectedRow(row);
    setDialogOpen(true);
  };

  const handleVerify = async (status, remarks) => {
    if (!selectedRow) return;
    try {
      await axios.post('/api/qms/checklist/verify-master', {
        checklistId: selectedRow.id,
        status: status,
        verifiedBy: 'Current User',
        remarks: remarks || (status === 'Rejected' ? 'Rejected by verifier' : 'Verified')
      });
      dispatch(openSnackbar({ open: true, message: `Checklist ${status.toLowerCase()} successfully`, severity: status === 'Verified' ? 'success' : 'warning', variant: 'alert' }));
      setDialogOpen(false);
      setRejectDialogOpen(false);
      setRejectRemarks('');
      fetchChecklists();
      setSelectedRow(null);
    } catch (error) {
      dispatch(openSnackbar({ open: true, message: 'Verification failed', severity: 'error', variant: 'alert' }));
    }
  };

  const handleExport = () => {
    const exportData = rows.map((r, i) => ({
      '#': i + 1,
      'Seq No': r.seqNo,
      'Checking Point': r.checkingPoint,
      Category: r.category,
      Frequency: r.frequency,
      Department: (r.departments || []).map((d) => d.departmentName).join(', '),
      'Effective From': r.effectiveFrom,
      'Expire Date': r.expiryDate,
      'Verify Status': r.verifyStatus || 'Pending for Verify'
    }));
    exportToExcel(exportData, 'Checklist_Verify');
  };

  useKeyboardShortcuts({
    'escape': () => setSelectedRow(null)
  });

  const renderCell = (col, row, idx) => {
    if (col.id === 'index') return idx + 1 + page * size;
    if (col.id === 'status') {
      const status = row.verifyStatus || row.status;
      let chipStatus = 'INACTIVE';
      if (status === 'Verified') chipStatus = 'ACTIVE';
      if (status === 'Pending for Verify') chipStatus = 'PENDING';
      return <Chip label={status} size="small" sx={getStatusChipSx(chipStatus)} />;
    }
    if (col.id === 'department') return (row.departments || []).map((d) => d.departmentName).join(', ');
    if (col.id === 'createdDate' || col.id === 'verifiedDate') {
      return row[col.id] ? new Date(row[col.id]).toLocaleDateString() : '-';
    }
    const val = row[col.id];
    if (typeof val === 'object' && val !== null) {
      return val.name || val.label || val.id || '-';
    }
    return val || '-';
  };

  // Build dialog data from selectedRow
  const dialogData = selectedRow ? {
    seqNo: selectedRow.seqNo || '-',
    checkingPoint: selectedRow.checkingPoint || '-',
    category: selectedRow.category || '-',
    frequency: selectedRow.frequency || '-',
    department: (selectedRow.departments || []).map(d => d.departmentName).join(', ') || '-',
    description: selectedRow.description || '',
    effectiveFrom: selectedRow.effectiveFrom,
    expiryDate: selectedRow.expiryDate,
    reminderDays: selectedRow.reminderDays,
    stockLink: selectedRow.stockLink || '-',
    photoRequired: selectedRow.photoRequired || '-',
    verificationRequired: selectedRow.verificationRequired || '-',
    dualCheck: selectedRow.dualCheck || '-',
    carryForward: selectedRow.carryForward || '-',
    verifyStatus: selectedRow.verifyStatus || 'Pending for Verify',
    rejReason: selectedRow.rejReason
  } : null;

  return (
    <MainCard
      title={
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <IconChecks size={24} />
          <Typography variant="h3">Check List Verify</Typography>
        </Stack>
      }
      secondary={
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Tooltip title="Refresh">
            <IconButton onClick={fetchChecklists} color="primary" size="small" sx={{ border: '2px solid', borderColor: 'divider', borderRadius: '8px', p: 1, transition: 'all 0.2s', '&:hover': { bgcolor: 'primary.light', transform: 'scale(1.05)' } }}>
              <IconRefresh size={20} />
            </IconButton>
          </Tooltip>
          <Button variant="outlined" color="primary" size="medium" startIcon={<IconFileDownload size={18} />} onClick={handleExport} sx={btnExport}>
            Export
          </Button>
        </Stack>
      }
    >
      <Box sx={{ mb: 2 }}>
        {selectedRow && (
          <Paper sx={{ p: 1.5, mb: 2, bgcolor: 'primary.light', border: '1px solid', borderColor: 'primary.main', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" fontWeight={600}>Selected: {selectedRow.seqNo} — {selectedRow.checkingPoint}</Typography>
            <IconButton size="small" onClick={() => setSelectedRow(null)}><IconX size={16} /></IconButton>
          </Paper>
        )}
      </Box>

      <BOSDataTable
        columns={columns}
        rows={rows}
        page={page}
        size={size}
        totalCount={totalElements}
        loading={loading}
        onPageChange={setPage}
        onSizeChange={(s) => { setSize(s); setPage(0); }}
        onDoubleClickRow={handleRowDoubleClick}
        onClickRow={handleRowClick}
        selectedRowId={selectedRow?.id}
        renderCell={renderCell}
        showActions={false}
        id="checklist-verify-table"
      />

      <AddCheckListDialog 
        open={dialogOpen} 
        handleClose={() => setDialogOpen(false)} 
        initialData={selectedRow} 
        readOnly={true}
        onVerify={() => handleVerify('Verified')}
        onReject={() => setRejectDialogOpen(true)}
      />

      {/* ===== Reject Reason Dialog ===== */}
      <Dialog open={rejectDialogOpen} onClose={() => setRejectDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Reject Master Checklist</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Reason for Rejection"
            value={rejectRemarks}
            onChange={(e) => setRejectRemarks(e.target.value)}
            placeholder="Please enter the reason for rejection..."
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={() => handleVerify('Rejected', rejectRemarks)} disabled={!rejectRemarks.trim()}>
            Confirm Reject
          </Button>
        </DialogActions>
      </Dialog>
    </MainCard>
  );
}
