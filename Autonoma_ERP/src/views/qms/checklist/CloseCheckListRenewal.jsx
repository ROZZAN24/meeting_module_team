import { useState, useEffect, useCallback, useMemo } from 'react';
import { Typography, Box, Button, Stack, Tooltip, IconButton, Chip } from '@mui/material';
import {
  IconCheck,
  IconFileDownload,
  IconListCheck,
  IconSettings,
  IconRefresh
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
import { API_PATHS } from 'utils/api-constants';
import { BOSFileGallery } from 'ui-component/bos';

const columns = [
  { id: 'index', label: '#', minWidth: 50 },
  { id: 'seqNo', label: 'Seq No', minWidth: 80, bold: true },
  { id: 'checkingPoint', label: 'Checking Point', minWidth: 200 },
  { id: 'category', label: 'Category', minWidth: 120 },
  { id: 'frequency', label: 'Frequency', minWidth: 100 },
  { id: 'department', label: 'Department', minWidth: 150 },
  { id: 'photoRequired', label: 'Photo Req', minWidth: 90 },
  { id: 'verificationRequired', label: 'Verify Req', minWidth: 90 },
  { id: 'stockLink', label: 'Stock Link', minWidth: 90 },
  { id: 'itemCode', label: 'Item Code', minWidth: 100 },
  { id: 'qty', label: 'Qty', minWidth: 60 },
  { id: 'assignTo', label: 'Assign To', minWidth: 120 },
  { id: 'checklistDate', label: 'Checklist Date', minWidth: 120 },
  { id: 'expireDate', label: 'Expire Date', minWidth: 120 },
  { id: 'carryForwardCount', label: 'CF Count', minWidth: 80 },
  { id: 'assignType', label: 'Assign Type', minWidth: 100 },
  { id: 'nextDueDate', label: 'Next Due / Expire', minWidth: 140 },
  { id: 'status', label: 'Status', minWidth: 130 }
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
  const [actualFiles, setActualFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  const globalQuery = useSelector((state) => state.search.query);
  const filters = useSelector((state) => state.search.filters);

  useEffect(() => {
    dispatch(setFilterConfig([
      {
        id: 'taskType', label: 'Task Type', type: 'select',
        options: [
          { label: 'Mine', value: 'Mine' },
          { label: 'Team', value: 'Team' },
          { label: 'All', value: 'All' }
        ],
        defaultValue: 'Mine'
      },
      {
        id: 'status', label: 'Status', type: 'select',
        options: [{ label: 'All', value: 'All' }, ...STATUS_OPTIONS.map(s => ({ label: s, value: s }))],
        defaultValue: 'All'
      },
      { id: 'fromDate', label: 'From Date', type: 'date' },
      { id: 'toDate', label: 'To Date', type: 'date' },
      {
        id: 'considerDate', label: 'Consider Date?', type: 'select',
        options: [
          { label: 'No', value: 'No' },
          { label: 'Yes', value: 'Yes' }
        ],
        defaultValue: 'No'
      },
      {
        id: 'searchBy', label: 'Search by', type: 'select',
        options: [
          { label: 'Seq No', value: 'seqNo' },
          { label: 'Checking Point', value: 'checkingPoint' },
          { label: 'Category', value: 'category' }
        ],
        defaultValue: 'checkingPoint'
      }
    ]));
    return () => dispatch(setFilterConfig(null));
  }, [dispatch]);

  const fetchAssignments = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page, size,
        taskType: filters.taskType || 'Mine',
        status: filters.status !== 'All' ? filters.status : undefined,
        fromDate: filters.considerDate === 'Yes' ? filters.fromDate : undefined,
        toDate: filters.considerDate === 'Yes' ? filters.toDate : undefined,
        searchBy: filters.searchBy !== 'All' ? filters.searchBy : undefined,
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
    setUploading(true);
    try {
      // 1. Upload files if any
      const uploadFile = async (fileObj) => {
        if (fileObj.isServer) return fileObj.name;
        const formDataUpload = new FormData();
        formDataUpload.append('file', fileObj);
        const res = await axios.post(`${API_PATHS.FILES}/upload`, formDataUpload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        return res.data;
      };

      const finalActualFiles = await Promise.all(actualFiles.map(uploadFile));

      // 2. Submit status update with files
      await axios.post('/api/qms/checklist/verify', {
        assignmentId: selectedRow.id,
        status: status,
        verifiedBy: 'Current User', // Should be dynamic
        remarks: `Execution completed. Proof uploaded.`,
        actualFiles: finalActualFiles
      });
      
      dispatch(openSnackbar({ open: true, message: `Task submitted for verification`, severity: 'success', variant: 'alert' }));
      setActualFiles([]);
      setSelectedRow(null);
      fetchAssignments();
    } catch (error) {
      console.error('Submission failed:', error);
      dispatch(openSnackbar({ open: true, message: 'Submission failed', severity: 'error', variant: 'alert' }));
    } finally {
      setUploading(false);
    }
  };

  const handleExport = () => {
    const exportData = rows.map((r, i) => {
      const m = r.checklist || {};
      return {
        '#': i + 1,
        'Seq No': m.seqNo,
        'Checking Point': m.checkingPoint,
        'Category': m.category,
        'Frequency': m.frequency,
        'Department': (m.departments || []).map((d) => d.departmentName).join(', '),
        'Photo Required': m.photoRequired || '-',
        'Verification Required': m.dualCheck || '-',
        'Stock Link': m.stockLink || '-',
        'Item Code': m.itemCode || '-',
        'Qty': m.qty || '-',
        'Assign To': r.assignedTo || m.assignTo || '-',
        'Checklist Date': r.checklistDate ? new Date(r.checklistDate).toLocaleDateString() : '-',
        'Expire Date': m.expiryDate ? new Date(m.expiryDate).toLocaleDateString() : '-',
        'CF Count': r.carryForwardCount ?? 0,
        'Assign Type': r.assignType || 'NONE',
        'Next Due / Expire': r.nextDueDate ? new Date(r.nextDueDate).toLocaleDateString() : '-',
        'Status': typeof r.status === 'object' ? r.status?.name : r.status
      };
    });
    exportToExcel(exportData, 'Close_Checklist');
  };

  const renderCell = (col, row, idx) => {
    if (col.id === 'index') return idx + 1 + page * size;
    
    // Fields from the nested master checklist
    const master = row.checklist || {};
    
    if (col.id === 'seqNo') return master.seqNo;
    if (col.id === 'checkingPoint') return master.checkingPoint;
    if (col.id === 'category') return master.category;
    if (col.id === 'frequency') return master.frequency;
    if (col.id === 'department') return (master.departments || []).map((d) => d.departmentName).join(', ');
    if (col.id === 'photoRequired') return master.photoRequired || '-';
    if (col.id === 'verificationRequired') return master.dualCheck || '-';
    if (col.id === 'stockLink') return master.stockLink || '-';
    if (col.id === 'itemCode') return master.itemCode || '-';
    if (col.id === 'qty') return master.qty || '-';
    if (col.id === 'assignTo') return row.assignedTo || master.assignTo || '-';
    if (col.id === 'checklistDate') return row.checklistDate ? new Date(row.checklistDate).toLocaleDateString() : (row.assignedDate ? new Date(row.assignedDate).toLocaleDateString() : '-');
    if (col.id === 'expireDate') return master.expiryDate ? new Date(master.expiryDate).toLocaleDateString() : '-';
    if (col.id === 'carryForwardCount') return row.carryForwardCount ?? master.carryForwardCount ?? 0;
    if (col.id === 'assignType') return row.assignType || 'NONE';
    if (col.id === 'nextDueDate') {
      const next = row.nextDueDate || master.nextDueDate;
      return next ? new Date(next).toLocaleDateString() : '-';
    }
    if (col.id === 'status') {
      const s = typeof row.status === 'object' ? row.status?.name : row.status;
      let chipStatus = 'PENDING';
      if (s === 'Completed' || s === 'Verified' || s === 'Accepted') chipStatus = 'ACTIVE';
      if (s === 'Started' || s === '25%' || s === '50%' || s === '75%') chipStatus = 'PENDING';
      if (s === 'Missed' || s === 'Unresolved' || s === 'Not Completed') chipStatus = 'INACTIVE';
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
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Tooltip title="Refresh">
            <IconButton onClick={fetchAssignments} color="primary" size="small" sx={{ border: '2px solid', borderColor: 'divider', borderRadius: '8px', p: 1, transition: 'all 0.2s', '&:hover': { bgcolor: 'primary.light', transform: 'scale(1.05)' } }}>
              <IconRefresh size={20} />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            color="success"
            size="medium"
            startIcon={<IconCheck size={18} />}
            onClick={() => handleUpdateStatus('Pending for Verified')}
            disabled={!selectedRow || actualFiles.length === 0 || uploading}
            sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600 }}
          >
            {uploading ? 'Submitting...' : 'Submit Proof'}
          </Button>
          <Button variant="outlined" color="primary" size="medium" startIcon={<IconFileDownload size={18} />} onClick={handleExport} sx={btnExport}>
            Export Excel
          </Button>
        </Stack>
      }
    >
      {selectedRow && (
        <Box sx={{ mb: 3, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: '12px', bgcolor: 'grey.50' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="h4" color="primary">Upload Execution Proof (Actual)</Typography>
            <Button
              component="label"
              variant="outlined"
              size="small"
              startIcon={<IconFileDownload size={18} />}
            >
              Select Files
              <input type="file" multiple hidden onChange={(e) => setActualFiles(prev => [...prev, ...Array.from(e.target.files)])} />
            </Button>
          </Stack>
          <BOSFileGallery 
            files={actualFiles} 
            onRemove={(idx) => setActualFiles(prev => prev.filter((_, i) => i !== idx))} 
            isEditing={true} 
          />
        </Box>
      )}
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
