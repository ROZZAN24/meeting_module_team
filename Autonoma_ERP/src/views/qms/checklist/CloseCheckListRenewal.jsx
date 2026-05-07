import { useState, useEffect, useCallback, useMemo } from 'react';
import { Typography, Box, Button, Stack, Tooltip, IconButton, Chip } from '@mui/material';
import {
  IconCheck,
  IconFileDownload,
  IconListCheck,
  IconSettings
} from '@tabler/icons-react';
import axios from 'utils/axios';
import { useDispatch, useSelector } from 'react-redux';
import { setFilterConfig } from 'store/slices/search';
import { openSnackbar } from 'store/slices/snackbar';
import MainCard from 'ui-component/cards/MainCard';
import { exportToExcel } from 'utils/excelExport';
import { BOSDataTable, btnExport, getStatusChipSx } from 'ui-component/bos';
import useKeyboardShortcuts, { shortcutTooltip } from 'hooks/useKeyboardShortcuts';
import AddCheckListDialog from './AddCheckListDialog';

const columns = [
  { id: 'index', label: '#', minWidth: 50 },
  { id: 'taskType', label: 'Task Type', minWidth: 100 },
  { id: 'seqNo', label: 'Seq.No', minWidth: 80, bold: true },
  { id: 'checkingPoint', label: 'Checking Point', minWidth: 200 },
  { id: 'category', label: 'Category', minWidth: 120 },
  { id: 'frequency', label: 'Frequency', minWidth: 120 },
  { id: 'department', label: 'Dept', minWidth: 150 },
  { id: 'assignedDate', label: 'Date', minWidth: 120 },
  { id: 'checklistDate', label: 'Checklist Date', minWidth: 120 },
  { id: 'nextDueDate', label: 'Next Due Date', minWidth: 120 },
  { id: 'status', label: 'Status', minWidth: 150 },
  { id: 'attendedBy', label: 'Attended By', minWidth: 120 },
  { id: 'verificationRequired', label: 'Verify Req', minWidth: 100 },
  { id: 'photoRequired', label: 'Photo Req', minWidth: 100 }
];

const STATUS_OPTIONS = [
  'Pending', 'Started', 'Unresolved', 'Missed', 'Completed', 
  'Not Completed', 'Pending for Verified', 'Verified', 
  'Pending for Accepted', 'Accepted', 'Attended'
];

export default function CloseCheckListRenewal() {
  const dispatch = useDispatch();
  const [rows, setRows] = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const globalQuery = useSelector((state) => state.search.query);
  const filters = useSelector((state) => state.search.filters);

  useEffect(() => {
    dispatch(setFilterConfig([
      {
        id: 'taskType', label: 'Task Type', type: 'select',
        options: [
          { label: 'All', value: 'All' },
          { label: 'Mine', value: 'Mine' },
          { label: 'Team', value: 'Team' },
          { label: 'Company', value: 'Company' }
        ],
        defaultValue: 'All'
      },
      {
        id: 'status', label: 'Status', type: 'select',
        options: [{ label: 'All', value: 'All' }, ...STATUS_OPTIONS.map(s => ({ label: s, value: s }))],
        defaultValue: 'All'
      },
      { id: 'fromDate', label: 'From Date', type: 'date' },
      { id: 'toDate', label: 'To Date', type: 'date' }
    ]));
    return () => dispatch(setFilterConfig(null));
  }, [dispatch]);

  const fetchAssignments = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page, size,
        status: filters.status !== 'All' ? filters.status : undefined,
        fromDate: filters.fromDate || undefined,
        toDate: filters.toDate || undefined,
        searchValue: globalQuery || undefined
      };
      const response = await axios.get('/api/qms/checklist/assignments', { params });
      setRows(response.data.content || []);
      setTotalElements(response.data.totalElements || 0);
    } catch (error) {
      console.error('Failed to fetch assignments:', error);
    } finally {
      setLoading(false);
    }
  }, [page, size, filters, globalQuery]);

  useEffect(() => { fetchAssignments(); }, [fetchAssignments]);

  const handleUpdateStatus = async (status) => {
    if (!selectedRow) return;
    try {
      await axios.post('/api/qms/checklist/verify', {
        assignmentId: selectedRow.id,
        status: status,
        verifiedBy: 'Current User',
        remarks: `Status updated to ${status}`
      });
      dispatch(openSnackbar({ open: true, message: `Task marked as ${status}`, severity: 'success', variant: 'alert' }));
      fetchAssignments();
    } catch (error) {
      dispatch(openSnackbar({ open: true, message: 'Update failed', severity: 'error', variant: 'alert' }));
    }
  };

  const handleExport = () => {
    const exportData = rows.map((r, i) => ({
      '#': i + 1,
      'Seq No': r.checklist?.seqNo,
      'Checking Point': r.checklist?.checkingPoint,
      Status: typeof r.status === 'object' ? r.status?.name : r.status
    }));
    exportToExcel(exportData, 'Close_Checklist');
  };

  const renderCell = (col, row, idx) => {
    if (col.id === 'index') return idx + 1 + page * size;
    if (col.id === 'seqNo') return row.checklist?.seqNo;
    if (col.id === 'checkingPoint') return row.checklist?.checkingPoint;
    if (col.id === 'category') return row.checklist?.category;
    if (col.id === 'frequency') return row.checklist?.frequency;
    if (col.id === 'department') return (row.checklist?.departments || []).map((d) => d.departmentName).join(', ');
    if (col.id === 'nextDueDate') return row.checklist?.nextDueDate;
    if (col.id === 'verificationRequired') return row.checklist?.verificationRequired;
    if (col.id === 'photoRequired') return row.checklist?.photoRequired;
    if (col.id === 'assignedDate') return row.assignedDate ? new Date(row.assignedDate).toLocaleDateString() : '-';
    if (col.id === 'status') {
      const s = typeof row.status === 'object' ? row.status?.name : row.status;
      let chipStatus = 'PENDING';
      if (s === 'Completed' || s === 'Verified' || s === 'Accepted') chipStatus = 'ACTIVE';
      if (s === 'Missed' || s === 'Unresolved') chipStatus = 'INACTIVE';
      return <Chip label={s || 'Pending'} size="small" sx={getStatusChipSx(chipStatus)} />;
    }
    return row[col.id] || '-';
  };

  return (
    <MainCard
      title={
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <IconListCheck size={24} />
          <Typography variant="h3">Close Check List / Renewal</Typography>
        </Stack>
      }
      secondary={
        <Stack direction="row" spacing={1.5}>
          <Button
            variant="contained"
            color="success"
            size="medium"
            startIcon={<IconCheck size={18} />}
            onClick={() => handleUpdateStatus('Completed')}
            disabled={!selectedRow}
            sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600 }}
          >
            Complete Task
          </Button>
          <Button variant="outlined" color="primary" size="medium" startIcon={<IconFileDownload size={18} />} onClick={handleExport} sx={btnExport}>
            Export Excel
          </Button>
        </Stack>
      }
    >
      <BOSDataTable
        columns={columns}
        rows={rows}
        page={page}
        size={size}
        totalCount={totalElements}
        loading={loading}
        onPageChange={setPage}
        onSizeChange={(s) => { setSize(s); setPage(0); }}
        onDoubleClickRow={() => setDialogOpen(true)}
        onClickRow={setSelectedRow}
        selectedRowId={selectedRow?.id}
        showActions={false}
        renderCell={renderCell}
        id="close-renewal-table"
      />

      <AddCheckListDialog
        open={dialogOpen}
        handleClose={() => setDialogOpen(false)}
        initialData={selectedRow?.checklist}
        readOnly={true}
      />
    </MainCard>
  );
}
