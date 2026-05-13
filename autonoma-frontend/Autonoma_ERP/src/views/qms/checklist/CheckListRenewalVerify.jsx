import { useState, useEffect, useCallback, useMemo } from 'react';
import { Typography, Box, Button, Stack, Tooltip, IconButton, Chip } from '@mui/material';
import {
  IconBan,
  IconFileDownload,
  IconRefresh,
  IconChecks,
  IconX,
  IconEye
} from '@tabler/icons-react';
import axios from 'utils/axios';
import { useDispatch, useSelector } from 'react-redux';
import { setFilterConfig } from 'store/slices/search';
import { openSnackbar } from 'store/slices/snackbar';
import MainCard from 'ui-component/cards/MainCard';
import { exportToExcel } from 'utils/excelExport';
import { BOSDataTable, btnExport, getStatusChipSx } from 'ui-component/bos';
import useKeyboardShortcuts from 'hooks/useKeyboardShortcuts';
import useLookups from 'hooks/useLookups';
import { AddCheckListDialog } from './AddCheckListDialog';
import ExecutionVerifyDialog from './ExecutionVerifyDialog';
import { Tabs, Tab, TextField, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { API_PATHS } from 'utils/api-constants';
import { BOSFileGallery } from 'ui-component/bos';

const columns = [
  { id: 'index', label: '#', minWidth: 50 },
  { id: 'category', label: 'Category', minWidth: 120 },
  { id: 'checkingPoint', label: 'Check Point', minWidth: 200 },
  { id: 'department', label: 'Dept', minWidth: 150 },
  { id: 'level', label: 'Level', minWidth: 100 },
  { id: 'frequency', label: 'Frequency', minWidth: 120 },
  { id: 'stockLink', label: 'Stock Link', minWidth: 100 },
  { id: 'remarks', label: 'Comments', minWidth: 200 },
  { id: 'verificationRequired', label: 'Verification Required', minWidth: 150 },
  { id: 'assignedTo', label: 'Assigned To', minWidth: 120 },
  { id: 'assignedBy', label: 'Assigned By', minWidth: 120 },
  { id: 'status', label: 'Status', minWidth: 150 }
];

const masterColumns = [
  { id: 'index', label: '#', minWidth: 50 },
  { id: 'seqNo', label: 'Seq No', minWidth: 80, bold: true },
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
  { id: 'verifyStatus', label: 'Verify Status', minWidth: 150 },
  { id: 'verifiedBy', label: 'Verified By', minWidth: 120 },
  { id: 'verifiedDate', label: 'Verified Date', minWidth: 120 }
];

const STATUS_OPTIONS = ['Pending for Verified', 'Pending for Accepted', 'Verified', 'Rejected', 'Not Accepted', 'Accepted', 'Missed'];

export default function CheckListRenewalVerify() {
  const dispatch = useDispatch();
  const [rows, setRows] = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0); // 0: Assignments, 1: Master Records (Dual Check)
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectRemarks, setRejectRemarks] = useState('');
  const [previewOpen, setPreviewOpen] = useState(false);

  const globalQuery = useSelector((state) => state.search.query);
  const filters = useSelector((state) => state.search.filters);

  const lookups = useLookups(['EMPLOYEES']);

  useEffect(() => {
    dispatch(setFilterConfig([
      { id: 'taskType', label: 'Task Type', type: 'select', isStarred: true, options: [{ label: 'Mine', value: 'Mine' }, { label: 'Team', value: 'Team' }, { label: 'All', value: 'All' }], defaultValue: 'Mine' },
      { id: 'status', label: 'Status', type: 'select', isStarred: true, options: [{ label: 'All', value: 'All' }, ...STATUS_OPTIONS.map(s => ({ label: s, value: s }))], defaultValue: 'Pending' },
      { id: 'assignedTo', label: 'Assign To', type: 'select', isStarred: true, options: [{ label: 'All', value: 'All' }, ...(lookups.employees || []).map(e => ({ label: e.employeeName || `${e.firstName} ${e.lastName}`, value: e.employeeName || `${e.firstName} ${e.lastName}` }))], defaultValue: 'All' },
      { id: 'seqNo', label: 'Seq No', type: 'text' },
      { id: 'checkingPoint', label: 'Checking Point', type: 'text' },
      { id: 'category', label: 'Category', type: 'select', options: [{ label: 'All', value: 'All' }, { label: 'Renewal', value: 'RENEWAL' }, { label: 'Check List', value: 'CHECK LIST' }], defaultValue: 'All' },
      { id: 'frequency', label: 'Frequency', type: 'select', options: [{ label: 'All', value: 'All' }, { label: 'DAILY', value: 'DAILY' }, { label: 'WEEKLY', value: 'WEEKLY' }, { label: 'MONTHLY', value: 'MONTHLY' }, { label: 'YEARLY', value: 'YEARLY' }], defaultValue: 'All' },
      { id: 'department', label: 'Department', type: 'text' },
      { id: 'considerDate', label: 'Consider Date?', type: 'select', options: [{ label: 'No', value: 'No' }, { label: 'Yes', value: 'Yes' }], defaultValue: 'No' },
      { id: 'fromDate', label: 'From Date', type: 'date' },
      { id: 'toDate', label: 'To Date', type: 'date' },
      { id: 'searchBy', label: 'Search by', type: 'select', options: [{ label: 'Seq No', value: 'seqNo' }, { label: 'Checking Point', value: 'checkingPoint' }, { label: 'Category', value: 'category' }], defaultValue: 'checkingPoint' }
    ]));
    return () => dispatch(setFilterConfig(null));
  }, [dispatch, lookups.employees]);

  const fetchAssignments = useCallback(async () => {
    setLoading(true);
    try {
      if (activeTab === 0) {
        // Fetch Execution Assignments
        const params = {
          page, size,
          taskType: filters.taskType || 'Mine',
          status: filters.status !== 'All' ? filters.status : undefined,
          assignedTo: filters.assignedTo !== 'All' ? filters.assignedTo : undefined,
          category: filters.category !== 'All' ? filters.category : undefined,
          seqNo: filters.seqNo || undefined,
          checkingPoint: filters.checkingPoint || undefined,
          frequency: filters.frequency !== 'All' ? filters.frequency : undefined,
          department: filters.department || undefined,
          fromDate: filters.considerDate === 'Yes' ? filters.fromDate : undefined,
          toDate: filters.considerDate === 'Yes' ? filters.toDate : undefined,
          searchBy: filters.searchBy !== 'All' ? filters.searchBy : undefined,
          searchValue: globalQuery || undefined,
          masterVerifyStatus: 'Verified',
          currentUser: 'Current User' // Replace with actual logged in user in production
        };
        const response = await axios.get('/api/qms/checklist/assignments', { params });
        setRows(response.data.content || []);
        setTotalElements(response.data.totalElements || 0);
      } else {
        // Fetch Dual Check Assignments (Second Level Approval)
        const params = {
          page, size,
          status: 'Pending for Verified',
          taskType: 'All', 
          assignedTo: filters.assignedTo !== 'All' ? filters.assignedTo : undefined,
          category: filters.category !== 'All' ? filters.category : undefined,
          seqNo: filters.seqNo || undefined,
          checkingPoint: filters.checkingPoint || undefined,
          frequency: filters.frequency !== 'All' ? filters.frequency : undefined,
          department: filters.department || undefined,
          searchBy: filters.searchBy !== 'All' ? filters.searchBy : undefined,
          searchValue: globalQuery || undefined,
          taskType: 'All', // Dual check is always 'All'
          currentUser: 'Current User'
        };
        const response = await axios.get('/api/qms/checklist/assignments', { params });
        setRows(response.data.content || []);
        setTotalElements(response.data.totalElements || 0);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  }, [page, size, filters, globalQuery, activeTab]);

  useEffect(() => { fetchAssignments(); }, [fetchAssignments]);

  const handleSaveExecution = async (executionData) => {
    if (!selectedRow) return;
    try {
      // First, handle file uploads if any new files are present
      const uploadFile = async (fileObj) => {
        if (fileObj.isServer) return fileObj.name + (fileObj.docDetails ? `|${fileObj.docDetails}` : '');
        const formDataUpload = new FormData();
        formDataUpload.append('file', fileObj.file);
        const res = await axios.post(`${API_PATHS.FILES}/upload`, formDataUpload);
        return res.data + (fileObj.docDetails ? `|${fileObj.docDetails}` : '');
      };

      const actualFiles = await Promise.all((executionData.actualFiles || []).map(uploadFile));

      const payload = {
        assignmentId: selectedRow.id,
        status: executionData.status,
        remarks: executionData.remarks,
        verifiedBy: 'Current User', // In execution mode, this acts as 'Last Updated By'
        actualFiles
      };

      await axios.post('/api/qms/checklist/verify', payload);
      dispatch(openSnackbar({ open: true, message: 'Progress saved successfully!', severity: 'success', variant: 'alert' }));
      setDialogOpen(false);
      fetchAssignments();
    } catch (err) {
      dispatch(openSnackbar({ open: true, message: 'Failed to save progress', severity: 'error', variant: 'alert' }));
    }
  };

  const handleVerify = async (status, remarks) => {
    if (!selectedRow) return;
    try {
      const payload = {
        assignmentId: selectedRow.id,
        verifiedBy: 'Current User',
        status: status,
        remarks: remarks || `Verification: ${status}`
      };

      await axios.post('/api/qms/checklist/verify', payload);
      dispatch(openSnackbar({ 
        open: true, 
        message: `Checklist ${status} successfully!`, 
        severity: ['Verified', 'Accepted'].includes(status) ? 'success' : 'error', 
        variant: 'alert' 
      }));
      setDialogOpen(false);
      setRejectDialogOpen(false);
      setRejectRemarks('');
      fetchAssignments();
    } catch (err) {
      dispatch(openSnackbar({ open: true, message: 'Verification failed', severity: 'error', variant: 'alert' }));
    }
  };

  const handleExport = () => {
    const exportData = rows.map((r, i) => ({
      '#': i + 1,
      'Seq No': r.checklist?.seqNo || r.seqNo,
      'Checking Point': r.checklist?.checkingPoint || r.checkingPoint,
      Status: typeof r.status === 'object' ? r.status?.name : r.status
    }));
    exportToExcel(exportData, 'Checklist_Renewal_Verify');
  };

  const renderCell = (col, row, idx) => {
    if (col.id === 'index') return idx + 1 + page * size;

    // Both tabs now display Assignments, which have nested checklist data
    const data = row.checklist || row;

    if (col.id === 'seqNo') return data.seqNo;
    if (col.id === 'checkingPoint') return data.checkingPoint;
    if (col.id === 'category') return data.category;
    if (col.id === 'frequency') return data.frequency;
    
    if (col.id === 'assignedTo') return row.assignedTo;
    if (col.id === 'checklistDate') return row.checklistDate ? new Date(row.checklistDate).toLocaleDateString() : '-';
    if (col.id === 'createdDate') return row.createdDate ? new Date(row.createdDate).toLocaleDateString() : '-';

    if (col.id === 'status' || col.id === 'verifyStatus') {
      let s = row.verifyStatus || row.status || 'OPEN';
      if (typeof s === 'object' && s !== null) s = s.name || 'OPEN';
      
      // Missed Logic (SOP Item 15)
      const scheduledDate = row.checklistDate ? new Date(row.checklistDate) : null;
      const isMissed = scheduledDate && scheduledDate < new Date() && s !== 'CLOSED' && s !== 'Verified' && s !== 'Accepted';
      if (isMissed) s = 'MISSED';

      // SOP Rule 13: Expiry Status Logic
      const isExpired = data.expiryDate && new Date(data.expiryDate) < new Date();
      if (isExpired && s !== 'Verified' && s !== 'Accepted' && s !== 'CLOSED' && s !== 'Completed') {
        s = 'EXPIRED';
      }

      let chipStatus = 'PENDING';
      if (['Verified', 'Accepted', 'CLOSED', 'COMPLETED', 'STARTED'].includes(s)) chipStatus = 'ACTIVE';
      if (['Rejected', 'Missed', 'MISSED', 'UNRESOLVED', 'EXPIRED', 'NOT COMPLETED'].includes(s)) chipStatus = 'INACTIVE';
      if (s === 'OPEN') chipStatus = 'PENDING';
      
      return <Chip label={s.toUpperCase()} size="small" sx={getStatusChipSx(chipStatus)} />;
    }

    if (col.id === 'department') return (data.departments || []).map((d) => d.departmentName).join(', ');

    if (col.id === 'effectiveFrom') return data.effectiveFrom ? new Date(data.effectiveFrom).toLocaleDateString() : '-';
    if (col.id === 'reminderDays') return data.reminderDays || '-';
    if (col.id === 'expiryDate') {
      if (!data.expiryDate) return '-';
      const expiry = new Date(data.expiryDate);
      const diff = Math.ceil((expiry - new Date()) / (1000 * 60 * 60 * 24));
      
      // SOP Rule 19: Reminder Thresholds
      let threshold = 3;
      if (data.frequency === 'QUARTERLY') threshold = 7;
      if (data.frequency === 'YEARLY') threshold = 30;

      const isUrgent = diff <= threshold && diff >= 0;
      const isExpired = diff < 0;

      return (
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography variant="body2">{expiry.toLocaleDateString()}</Typography>
          {isExpired ? (
            <Chip label="OVERDUE" size="small" color="error" variant="filled" sx={{ height: 20, fontSize: '0.65rem' }} />
          ) : isUrgent ? (
            <Chip label={`${diff}d left`} size="small" color="warning" variant="filled" sx={{ height: 20, fontSize: '0.65rem' }} />
          ) : null}
        </Stack>
      );
    }
    if (col.id === 'stockLink') return data.stockLink || 'No';
    if (col.id === 'photoRequired') return data.photoRequired || '-';
    if (col.id === 'verificationRequired') return data.verificationRequired || '-';
    if (col.id === 'itemCode') return data.itemCode || '-';
    if (col.id === 'qty') return data.qty || '-';
    if (col.id === 'carryForward') return row.carryForward || '-';
    if (col.id === 'assignType') return row.assignType || '-';
    if (col.id === 'nextDueDate') return data.nextDueDate ? new Date(data.nextDueDate).toLocaleDateString() : '-';

    if (col.id === 'createdBy') return data.createdBy || '-';
    if (col.id === 'assignedBy') return row.assignedBy || '-';
    if (col.id === 'remarks') return row.remarks || data.description || '-';
    if (col.id === 'level') return data.levelIds || '-';
    if (col.id === 'verifiedBy') return data.verifiedBy || '-';
    if (col.id === 'verifiedDate') return data.verifiedDate ? new Date(data.verifiedDate).toLocaleDateString() : '-';

    if (col.id === 'actualFiles') {
      const files = row.actualFiles || [];
      if (files.length === 0) return '-';
      return (
        <IconButton 
          size="small" 
          color="secondary" 
          onClick={(e) => {
            e.stopPropagation();
            setSelectedRow(row);
            setPreviewOpen(true);
          }}
        >
          <IconEye size={18} />
        </IconButton>
      );
    }
    return row[col.id] || data[col.id] || '-';
  };

  return (
    <MainCard
      title={
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <IconChecks size={24} />
          <Typography variant="h3">Check List / Renewal Verify</Typography>
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
            Export
          </Button>
        </Stack>
      }
    >
      <Tabs value={activeTab} onChange={(e, v) => { setActiveTab(v); setPage(0); setSelectedRow(null); }} sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Tab label="Renewal Assignments" />
        <Tab label="Second Level Approval (Dual Check)" />
      </Tabs>
      <BOSDataTable
        columns={activeTab === 0 ? columns : masterColumns}
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
        id="renewal-verify-table"
        sx={{
          '& .MuiTableRow-root': {
            cursor: 'pointer',
            transition: 'background-color 0.2s',
            '&:hover': { bgcolor: 'primary.lighter' }
          },
          '& .expired-row': {
            bgcolor: 'error.lighter',
            '&:hover': { bgcolor: 'error.light' }
          }
        }}
        rowClassName={(row) => {
          const data = row.checklist || row;
          const isExpired = data.expiryDate && new Date(data.expiryDate) < new Date();
          const s = row.verifyStatus || row.status;
          return (isExpired && s !== 'Verified' && s !== 'Accepted') ? 'expired-row' : '';
        }}
      />

      <ExecutionVerifyDialog
        open={dialogOpen}
        handleClose={() => setDialogOpen(false)}
        data={selectedRow}
        onSave={activeTab === 0 ? handleSaveExecution : null}
        onVerify={activeTab === 1 ? () => handleVerify('Accepted') : null}
        onReject={activeTab === 1 ? () => setRejectDialogOpen(true) : null}
        isExecution={activeTab === 0}
      />

      <Dialog open={rejectDialogOpen} onClose={() => setRejectDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Reject {activeTab === 1 ? 'Master Record' : 'Assignment'}</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Reason for Rejection / Comments"
            value={rejectRemarks}
            onChange={(e) => setRejectRemarks(e.target.value)}
            placeholder="Please explain why this is being rejected..."
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

      <Dialog open={previewOpen} onClose={() => setPreviewOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4">Execution Proof (Actual Files)</Typography>
          <IconButton onClick={() => setPreviewOpen(false)}><IconX size={20} /></IconButton>
        </DialogTitle>
        <DialogContent sx={{ bgcolor: 'grey.50', p: 3 }}>
          <BOSFileGallery files={selectedRow?.actualFiles || []} isEditing={false} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </MainCard>
  );
}
