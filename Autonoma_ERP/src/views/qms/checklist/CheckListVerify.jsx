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
  Paper
} from '@mui/material';
import {
  IconPlus,
  IconFileDownload,
  IconChecks,
  IconBan,
  IconCheck,
  IconCircleCheck,
  IconX
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
  btnNew,
  getStatusChipSx
} from 'ui-component/bos';
import useKeyboardShortcuts, { shortcutTooltip } from 'hooks/useKeyboardShortcuts';
import AddCheckListDialog from './AddCheckListDialog';

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
  const [isView, setIsView] = useState(true);

  const searchQuery = useSelector((state) => state.search.query);
  const filters = useSelector((state) => state.search.filters);

  useEffect(() => {
    dispatch(setFilterConfig([
      {
        id: 'status',
        label: 'Status',
        type: 'select',
        options: [
          { label: 'All Status', value: 'All' },
          { label: 'Pending for Verify', value: 'Pending for Verify' },
          { label: 'Verified', value: 'Verified' },
          { label: 'Rejected', value: 'Rejected' }
        ],
        defaultValue: 'All'
      },
      {
        id: 'category',
        label: 'Category',
        type: 'select',
        options: [
          { label: 'All Categories', value: 'All' },
          { label: 'Renewal', value: 'RENEWAL' },
          { label: 'Check List', value: 'CHECK LIST' }
        ],
        defaultValue: 'All'
      }
    ]));
    return () => dispatch(setFilterConfig(null));
  }, [dispatch]);

  const fetchChecklists = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page,
        size,
        status: filters.status !== 'All' ? filters.status : undefined,
        category: filters.category !== 'All' ? filters.category : undefined,
        searchValue: searchQuery || undefined
      };
      const response = await axios.get('/api/qms/checklist', { params });
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
    setIsView(true);
    setDialogOpen(true);
  };

  const handleVerify = async (status) => {
    if (!selectedRow) return;
    try {
      await axios.post('/api/qms/checklist/verify-master', {
        checklistId: selectedRow.id,
        status: status,
        verifiedBy: 'Current User',
        remarks: status === 'Rejected' ? 'Rejected by verifier' : 'Verified'
      });
      dispatch(openSnackbar({ open: true, message: `Checklist ${status.toLowerCase()} successfully`, severity: 'success', variant: 'alert' }));
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
      'Status': r.status
    }));
    exportToExcel(exportData, 'Checklist_Verify');
  };

  useKeyboardShortcuts({
    'ctrl+n': () => setDialogOpen(true),
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
    if (col.id === 'createdDate') return row.createdDate ? new Date(row.createdDate).toLocaleDateString() : '-';
    return row[col.id] || '-';
  };

  return (
    <MainCard
      title={
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <IconChecks size={24} />
          <Typography variant="h3">Check List Verify</Typography>
        </Stack>
      }
      secondary={
        <Stack direction="row" spacing={1.5}>
          <Button
            variant="contained"
            color="error"
            size="medium"
            startIcon={<IconBan size={18} />}
            onClick={() => handleVerify('Rejected')}
            disabled={!selectedRow}
            sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600 }}
          >
            Reject
          </Button>
          <Button
            variant="contained"
            color="success"
            size="medium"
            startIcon={<IconCheck size={18} />}
            onClick={() => handleVerify('Verified')}
            disabled={!selectedRow}
            sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600 }}
          >
            Verify
          </Button>
          <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
          <Button variant="outlined" color="primary" size="medium" startIcon={<IconFileDownload size={18} />} onClick={handleExport} sx={btnExport}>
            Export Excel
          </Button>
          <Tooltip title={shortcutTooltip('Create New Check List', 'Ctrl + N')}>
            <Button variant="contained" color="primary" size="medium" onClick={() => { setSelectedRow(null); setIsView(false); setDialogOpen(true); }} sx={btnNew}>
              + New
            </Button>
          </Tooltip>
        </Stack>
      }
    >
      <Box sx={{ mb: 2 }}>
        {selectedRow && (
          <Paper sx={{ p: 1.5, mb: 2, bgcolor: 'primary.light', border: '1px solid', borderColor: 'primary.main', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" fontWeight={600}>Selected Row: {selectedRow.seqNo} - {selectedRow.checkingPoint}</Typography>
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
        onEditRow={(row) => { setSelectedRow(row); setIsView(false); setDialogOpen(true); }}
        renderCell={renderCell}
        showActions={true}
        id="checklist-verify-table"
      />

      <AddCheckListDialog 
        open={dialogOpen} 
        handleClose={() => setDialogOpen(false)} 
        initialData={selectedRow} 
        readOnly={isView}
        onSave={async (data) => {
          try {
            await axios.post('/api/qms/checklist', data);
            dispatch(openSnackbar({ open: true, message: 'Checklist saved successfully!', severity: 'success', variant: 'alert' }));
            fetchChecklists();
          } catch (err) {
            dispatch(openSnackbar({ open: true, message: 'Failed to save', severity: 'error', variant: 'alert' }));
          }
        }}
      />
    </MainCard>
  );
}
