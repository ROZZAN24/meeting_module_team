import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Typography, Box, Button, Stack, Tooltip, IconButton, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField
} from '@mui/material';
import {
  IconFileDownload,
  IconListCheck,
  IconRefresh,
  IconUser,
  IconCalendar,
  IconChecks,
  IconBan
} from '@tabler/icons-react';
import axios from 'utils/axios';
import { useDispatch, useSelector } from 'react-redux';
import { setFilterConfig } from 'store/slices/search';
import { openSnackbar } from 'store/slices/snackbar';
import MainCard from 'ui-component/cards/MainCard';
import { exportToExcel } from 'utils/excelExport';
import { BOSDataTable, btnExport, getStatusChipSx } from 'ui-component/bos';
import useLookups from 'hooks/useLookups';
import { API_PATHS } from 'utils/api-constants';
import ExecutionVerifyDialog from './ExecutionVerifyDialog';

const columns = [
  { id: 'index', label: 'S.No', minWidth: 50 },
  { id: 'seqNo', label: 'Seq No', minWidth: 80, bold: true },
  { id: 'checkingPoint', label: 'Checking Point', minWidth: 200 },
  { id: 'category', label: 'Category', minWidth: 120 },
  { id: 'frequency', label: 'Frequency', minWidth: 120 },
  { id: 'department', label: 'Department', minWidth: 150 },
  { id: 'photoRequired', label: 'Photo Required', minWidth: 120 },
  { id: 'verificationRequired', label: 'Verification Required', minWidth: 150 },
  { id: 'stockLink', label: 'Stock Link', minWidth: 100 },
  { id: 'itemCode', label: 'Item Code', minWidth: 100 },
  { id: 'qty', label: 'Qty', minWidth: 80 },
  { id: 'assignTo', label: 'Assign To', minWidth: 120 },
  { id: 'checklistDate', label: 'Checklist Date', minWidth: 120 },
  { id: 'expiryDate', label: 'Expire Date', minWidth: 120 },
  { id: 'carryForward', label: 'Carry Forward Count', minWidth: 150 },
  { id: 'assignType', label: 'Assign Type', minWidth: 120 },
  { id: 'nextDueDate', label: 'NextDue Date/Next Expire Date', minWidth: 200 },
  { id: 'status', label: 'Status', minWidth: 150 }
];

const EXECUTION_STATUSES = ['-Select-', 'Started', '25%', '50%', '75%', 'Completed'];

const STATUS_OPTIONS = [
  'Pending', 'Pending for Verified', 'Pending for Accepted',
  'Accepted', 'Not Accepted', 'Verified', 'Rejected', 'Missed'
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
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectRemarks, setRejectRemarks] = useState('');

  const globalQuery = useSelector((state) => state.search.query);
  const filters = useSelector((state) => state.search.filters);
  const lookups = useLookups(['EMPLOYEES']);

  useEffect(() => {
    dispatch(setFilterConfig([
      { id: 'taskType', label: 'Task Type', type: 'select', isStarred: true, options: [{ label: 'Mine', value: 'Mine' }, { label: 'Team', value: 'Team' }, { label: 'Company', value: 'Company' }], defaultValue: 'Mine' },
      { id: 'status', label: 'Status', type: 'select', isStarred: true, options: [{ label: 'All', value: 'All' }, ...STATUS_OPTIONS.map(s => ({ label: s, value: s }))], defaultValue: 'All' },
      { id: 'assignedTo', label: 'Assign To', type: 'autocomplete', multiple: true, isStarred: true, options: (lookups.employees || []).map(e => e.employeeName || `${e.firstName} ${e.lastName}`), defaultValue: [] },
      { id: 'seqNo', label: 'Seq No', type: 'text' },
      { id: 'checkingPoint', label: 'Checking Point', type: 'text' },
      { id: 'category', label: 'Category', type: 'select', options: [{ label: 'All', value: 'All' }, { label: 'Renewal', value: 'RENEWAL' }, { label: 'Check List', value: 'CHECK LIST' }], defaultValue: 'All' },
      { id: 'frequency', label: 'Frequency', type: 'select', options: [{ label: 'All', value: 'All' }, { label: 'DAILY', value: 'DAILY' }, { label: 'WEEKLY', value: 'WEEKLY' }, { label: 'MONTHLY', value: 'MONTHLY' }, { label: 'YEARLY', value: 'YEARLY' }], defaultValue: 'All' },
      { id: 'department', label: 'Department', type: 'text' },
      { id: 'photoRequired', label: 'Photo Required', type: 'select', options: [{ label: 'All', value: 'All' }, { label: 'YES', value: 'YES' }, { label: 'NO', value: 'NO' }], defaultValue: 'All' },
      { id: 'verificationRequired', label: 'Verification Required', type: 'select', options: [{ label: 'All', value: 'All' }, { label: 'YES', value: 'YES' }, { label: 'NO', value: 'NO' }], defaultValue: 'All' },
      { id: 'stockLink', label: 'Stock Link', type: 'text' },
      { id: 'itemCode', label: 'Item Code', type: 'text' },
      { id: 'qty', label: 'Qty', type: 'text' },
      { id: 'checklistDate', label: 'Checklist Date', type: 'date' },
      { id: 'expiryDate', label: 'Expire Date', type: 'date' },
      { id: 'assignType', label: 'Assign Type', type: 'select', options: [{ label: 'All', value: 'All' }, { label: 'PRIMARY', value: 'PRIMARY' }, { label: 'SECONDARY', value: 'SECONDARY' }], defaultValue: 'All' },
      { id: 'nextDueDate', label: 'NextDue Date', type: 'date' },
      { id: 'considerDate', label: 'Consider Date?', type: 'select', options: [{ label: 'No', value: 'No' }, { label: 'Yes', value: 'Yes' }], defaultValue: 'No' },
      { id: 'fromDate', label: 'From Date', type: 'date' },
      { id: 'toDate', label: 'To Date', type: 'date' }
    ]));
    return () => dispatch(setFilterConfig(null));
  }, [dispatch, lookups.employees]);

  const fetchAssignments = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page, size,
        taskType: filters.taskType || 'Mine',
        status: filters.status !== 'All' ? filters.status : undefined,
        assignedTo: filters.assignedTo && filters.assignedTo.length > 0 ? filters.assignedTo.join(',') : undefined,
        category: filters.category !== 'All' ? filters.category : undefined,
        assignType: filters.assignType !== 'All' ? filters.assignType : undefined,
        seqNo: filters.seqNo || undefined,
        checkingPoint: filters.checkingPoint || undefined,
        frequency: filters.frequency !== 'All' ? filters.frequency : undefined,
        department: filters.department || undefined,
        photoRequired: filters.photoRequired !== 'All' ? filters.photoRequired : undefined,
        verificationRequired: filters.verificationRequired !== 'All' ? filters.verificationRequired : undefined,
        stockLink: filters.stockLink || undefined,
        itemCode: filters.itemCode || undefined,
        qty: filters.qty || undefined,
        checklistDate: filters.checklistDate || undefined,
        expiryDate: filters.expiryDate || undefined,
        nextDueDate: filters.nextDueDate || undefined,
        fromDate: filters.considerDate === 'Yes' ? filters.fromDate : undefined,
        toDate: filters.considerDate === 'Yes' ? filters.toDate : undefined,
        searchBy: filters.searchBy !== 'All' ? filters.searchBy : undefined,
        searchValue: globalQuery || undefined,
        masterVerifyStatus: 'Verified'
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

  // Accept or Not Accept the assignment
  const handleVerifyAction = async (status, remarks) => {
    if (!selectedRow) return;
    try {
      await axios.post('/api/qms/checklist/verify', {
        assignmentId: selectedRow.id,
        status: status,
        verifiedBy: 'Current User',
        remarks: remarks || `Action: ${status}`
      });
      dispatch(openSnackbar({
        open: true,
        message: `Checklist ${status} successfully!`,
        severity: status === 'Accepted' || status === 'Pending for Verified' ? 'success' : 'warning',
        variant: 'alert'
      }));
      setDialogOpen(false);
      setRejectDialogOpen(false);
      setRejectRemarks('');
      setSelectedRow(null);
      fetchAssignments();
    } catch (error) {
      console.error('Action failed:', error);
      dispatch(openSnackbar({ open: true, message: 'Action failed', severity: 'error', variant: 'alert' }));
    }
  };

  const handleExport = () => {
    const exportData = rows.map((r, i) => {
      const m = r.checklist || {};
      const statusRaw = r.status;
      const statusText = typeof statusRaw === 'object' ? statusRaw?.name : statusRaw;
      return {
        '#': i + 1,
        'Seq.No': m.seqNo,
        'Checking Point': m.checkingPoint,
        'Frequency': m.frequency,
        'Category': m.category,
        'Assign Type': r.assignType || 'NONE',
        'Photo Required': m.photoRequired || '-',
        'Verification Required': m.verificationRequired || '-',
        'Assign Date': r.assignedDate ? new Date(r.assignedDate).toLocaleDateString() : '-',
        'Next Renewal Date': (r.nextDueDate || m.nextDueDate) ? new Date(r.nextDueDate || m.nextDueDate).toLocaleDateString() : '-',
        'Assign To': r.assignedTo || m.assignTo || '-',
        'Created Date': r.assignedDate ? new Date(r.assignedDate).toLocaleString() : '-',
        'Verification Status': statusText || 'Pending'
      };
    });
    exportToExcel(exportData, 'Close_Checklist_Renewal');
  };

  const renderCell = (col, row, idx) => {
    if (col.id === 'index') return idx + 1 + page * size;
    const master = row.checklist || {};

    if (col.id === 'seqNo') return master.seqNo || '-';
    if (col.id === 'checkingPoint') return master.checkingPoint || '-';
    if (col.id === 'category') return master.category || '-';
    if (col.id === 'frequency') return master.frequency || '-';
    if (col.id === 'department') return (master.departments || []).map(d => d.departmentName).join(', ') || '-';
    if (col.id === 'photoRequired') return master.photoRequired || '-';
    if (col.id === 'verificationRequired') return master.verificationRequired || '-';
    if (col.id === 'stockLink') return master.stockLink || '-';
    if (col.id === 'itemCode') return master.itemCode || '-';
    if (col.id === 'qty') return master.qty || '-';
    if (col.id === 'assignTo') return row.assignedTo || master.assignTo || '-';
    if (col.id === 'checklistDate') return row.checklistDate ? new Date(row.checklistDate).toLocaleDateString() : '-';
    if (col.id === 'expiryDate') return master.expiryDate ? new Date(master.expiryDate).toLocaleDateString() : '-';
    if (col.id === 'carryForward') return row.carryForward || '0';
    if (col.id === 'assignType') return row.assignType || 'NONE';
    if (col.id === 'nextDueDate') {
      const next = row.nextDueDate || master.nextDueDate;
      return next ? new Date(next).toLocaleDateString() : '-';
    }

    if (col.id === 'status') {
      let s = row.status;
      if (typeof s === 'object' && s !== null) s = s.name;
      s = s || 'Pending';
      let chipStatus = 'PENDING';
      if (s === 'Accepted' || s === 'Verified' || s === 'Completed') chipStatus = 'ACTIVE';
      if (s === 'Rejected' || s === 'Not Accepted' || s === 'Missed') chipStatus = 'INACTIVE';
      return <Chip label={s} size="small" sx={getStatusChipSx(chipStatus)} />;
    }
    return row[col.id] || master[col.id] || '-';
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
        onDoubleClickRow={(row) => { setSelectedRow(row); setDialogOpen(true); }}
        onClickRow={setSelectedRow}
        selectedRowId={selectedRow?.id}
        showActions={false}
        renderCell={renderCell}
        id="close-renewal-table"
      />

      <ExecutionVerifyDialog
        open={dialogOpen}
        handleClose={() => setDialogOpen(false)}
        data={selectedRow}
        isExecution={true}
        onSave={async (updateData) => {
          try {
            setLoading(true);
            
            // Helper to upload files and return formatted string "filename|details"
            const uploadFile = async (fileObj) => {
              if (fileObj.isServer) return fileObj.serverFileName; // Already on server
              
              const formDataUpload = new FormData();
              formDataUpload.append('file', fileObj.file);
              const res = await axios.post(`${API_PATHS.FILES}/upload`, formDataUpload, {
                headers: { 'Content-Type': 'multipart/form-data' }
              });
              const serverName = res.data;
              return fileObj.docDetails ? `${serverName}|${fileObj.docDetails}` : serverName;
            };

            const finalFiles = await Promise.all(updateData.actualFiles.map(uploadFile));

            await axios.post('/api/qms/checklist/verify', {
              assignmentId: selectedRow.id,
              status: updateData.status,
              remarks: updateData.remarks,
              actualFiles: finalFiles,
              verifiedBy: 'Current User'
            });

            dispatch(openSnackbar({ open: true, message: 'Progress saved successfully!', severity: 'success', variant: 'alert' }));
            setDialogOpen(false);
            fetchAssignments();
          } catch (error) {
            console.error('Failed to save progress:', error);
            dispatch(openSnackbar({ open: true, message: 'Failed to save progress', severity: 'error', variant: 'alert' }));
          } finally {
            setLoading(false);
          }
        }}
      />

      {/* ===== Not Accept Reason Dialog ===== */}
      <Dialog open={rejectDialogOpen} onClose={() => setRejectDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Not Accept — Provide Reason</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Reason / Comments"
            value={rejectRemarks}
            onChange={(e) => setRejectRemarks(e.target.value)}
            placeholder="Please explain why this is not accepted..."
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => handleVerifyAction('Not Accepted', rejectRemarks)}
            disabled={!rejectRemarks.trim()}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </MainCard>
  );
}
