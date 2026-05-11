import { useState, useEffect, useCallback, useMemo } from 'react';
import { Typography, Box, Button, Stack, Tooltip, IconButton, Chip } from '@mui/material';
import {
  IconBan,
  IconFileDownload,
  IconCheck,
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
  { id: 'assignedTo', label: 'Assign To', minWidth: 120 },
  { id: 'checklistDate', label: 'Checklist Date', minWidth: 120 },
  { id: 'expiryDate', label: 'Expire Date', minWidth: 120 },
  { id: 'carryForward', label: 'Carry Forward Count', minWidth: 150 },
  { id: 'assignType', label: 'Assign Type', minWidth: 120 },
  { id: 'nextDueDate', label: 'NextDue Date/Next Expire Date', minWidth: 200 },
  { id: 'status', label: 'Status', minWidth: 150 }
];

const masterColumns = [
  { id: 'index', label: '#', minWidth: 50 },
  { id: 'seqNo', label: 'Seq No', minWidth: 80, bold: true },
  { id: 'checkingPoint', label: 'Checking Point', minWidth: 200 },
  { id: 'category', label: 'Category', minWidth: 120 },
  { id: 'frequency', label: 'Frequency', minWidth: 120 },
  { id: 'department', label: 'Department', minWidth: 150 },
  { id: 'effectiveFrom', label: 'Effective from', minWidth: 120 },
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
      { id: 'status', label: 'Status', type: 'select', isStarred: true, options: [{ label: 'All', value: 'All' }, ...STATUS_OPTIONS.map(s => ({ label: s, value: s }))], defaultValue: 'All' },
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
          masterVerifyStatus: 'Verified'
        };
        const response = await axios.get('/api/qms/checklist/assignments', { params });
        setRows(response.data.content || []);
        setTotalElements(response.data.totalElements || 0);
      } else {
        // Fetch Master Records (Dual Check)
        const params = {
          page, size,
          verifyStatus: (filters.status && filters.status !== 'All') ? filters.status : 'Verified',
          assignedTo: filters.assignedTo !== 'All' ? filters.assignedTo : undefined,
          category: filters.category !== 'All' ? filters.category : undefined,
          seqNo: filters.seqNo || undefined,
          checkingPoint: filters.checkingPoint || undefined,
          frequency: filters.frequency !== 'All' ? filters.frequency : undefined,
          department: filters.department || undefined,
          searchBy: filters.searchBy !== 'All' ? filters.searchBy : undefined,
          searchValue: globalQuery || undefined,
          dualCheck: 'YES'
        };
        const response = await axios.get('/api/qms/checklist', { params });
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

  const handleVerify = async (status, remarks) => {
    if (!selectedRow) return;
    try {
      const endpoint = activeTab === 0 ? '/api/qms/checklist/verify' : '/api/qms/checklist/verify-master';
      const payload = activeTab === 0 ? {
        assignmentId: selectedRow.id,
        verifiedBy: 'Current User',
        status: status,
        remarks: remarks || `Verification action: ${status}`
      } : {
        checklistId: selectedRow.id,
        verifiedBy: 'Current User',
        status: status,
        remarks: remarks || `Verification action: ${status}`
      };

      await axios.post(endpoint, payload);
      dispatch(openSnackbar({ open: true, message: `Checklist ${status} successfully!`, severity: status === 'Verified' ? 'success' : 'error', variant: 'alert' }));
      setSelectedRow(null);
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

    // Use nested checklist object for assignments (activeTab 0)
    const data = activeTab === 0 ? (row.checklist || {}) : row;

    if (col.id === 'seqNo') return data.seqNo;
    if (col.id === 'checkingPoint') return data.checkingPoint;
    if (col.id === 'category') return data.category;
    if (col.id === 'frequency') return data.frequency;
    
    if (col.id === 'assignedTo') return row.assignedTo;
    if (col.id === 'checklistDate') return row.checklistDate ? new Date(row.checklistDate).toLocaleDateString() : '-';
    if (col.id === 'createdDate') return row.createdDate ? new Date(row.createdDate).toLocaleDateString() : '-';

    if (col.id === 'status' || col.id === 'verifyStatus') {
      let s = row.verifyStatus || row.status || 'Pending';
      if (typeof s === 'object' && s !== null) s = s.name || 'Pending';
      
      let chipStatus = 'PENDING';
      if (s === 'Verified' || s === 'Accepted' || s === 'COMPLETED' || s === 'STARTED') chipStatus = 'ACTIVE';
      if (s === 'Rejected' || s === 'Missed' || s === 'UNRESOLVED') chipStatus = 'INACTIVE';
      return <Chip label={s} size="small" sx={getStatusChipSx(chipStatus)} />;
    }

    if (col.id === 'department') return (data.departments || []).map((d) => d.departmentName).join(', ');

    if (col.id === 'effectiveFrom') return data.effectiveFrom ? new Date(data.effectiveFrom).toLocaleDateString() : '-';
    if (col.id === 'reminderDays') return data.reminderDays || '-';
    if (col.id === 'expiryDate') return data.expiryDate ? new Date(data.expiryDate).toLocaleDateString() : '-';
    if (col.id === 'stockLink') return data.stockLink || 'No';
    if (col.id === 'photoRequired') return data.photoRequired || '-';
    if (col.id === 'verificationRequired') return data.verificationRequired || '-';
    if (col.id === 'itemCode') return data.itemCode || '-';
    if (col.id === 'qty') return data.qty || '-';
    if (col.id === 'carryForward') return row.carryForward || '-';
    if (col.id === 'assignType') return row.assignType || '-';
    if (col.id === 'nextDueDate') return data.nextDueDate ? new Date(data.nextDueDate).toLocaleDateString() : '-';

    if (col.id === 'createdBy') return data.createdBy || '-';
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
            Export Excel
          </Button>
        </Stack>
      }
    >
      <Tabs value={activeTab} onChange={(e, v) => { setActiveTab(v); setPage(0); setSelectedRow(null); }} sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Tab label="Renewal Assignments (Execution)" />
        <Tab label="Dual Check Verification (Master)" />
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
      />

      {activeTab === 0 ? (
        <ExecutionVerifyDialog
          open={dialogOpen}
          handleClose={() => setDialogOpen(false)}
          data={selectedRow}
          onVerify={() => handleVerify('Accepted')}
          onReject={() => setRejectDialogOpen(true)}
        />
      ) : (
        <AddCheckListDialog 
          open={dialogOpen} 
          handleClose={() => setDialogOpen(false)} 
          initialData={selectedRow} 
          readOnly={true}
          onVerify={() => handleVerify('Accepted')}
          onReject={() => setRejectDialogOpen(true)}
          onSave={async (data) => {
            try {
              const payload = { 
                ...data, 
                createdBy: data.id ? data.createdBy : 'Current User',
                updatedBy: 'Current User'
              };
              await axios.post('/api/qms/checklist', payload);
              dispatch(openSnackbar({ open: true, message: 'Checklist saved successfully!', severity: 'success', variant: 'alert' }));
              fetchAssignments();
            } catch (err) {
              dispatch(openSnackbar({ open: true, message: 'Failed to save', severity: 'error', variant: 'alert' }));
            }
          }}
        />
      )}

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
