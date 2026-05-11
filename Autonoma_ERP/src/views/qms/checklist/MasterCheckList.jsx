import { useState, useEffect, useCallback, useMemo } from 'react';
import { Typography, Box, Button, Stack, Tooltip, IconButton, Chip } from '@mui/material';
import {
  IconPlus,
  IconListCheck,
  IconUserPlus,
  IconFileDots,
  IconFileDownload,
  IconTrash,
  IconRefresh,
  IconPaperclip,
  IconEye,
  IconX
} from '@tabler/icons-react';
import { Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import axios from 'utils/axios';
import { useDispatch, useSelector } from 'react-redux';
import { setFilterConfig } from 'store/slices/search';
import { openSnackbar } from 'store/slices/snackbar';
import MainCard from 'ui-component/cards/MainCard';
import { exportToExcel } from 'utils/excelExport';
import { BOSDataTable, btnExport, btnNew, getStatusChipSx } from 'ui-component/bos';
import mammoth from 'mammoth';
import * as XLSX from 'xlsx';
import { CircularProgress } from '@mui/material';
import useKeyboardShortcuts, { shortcutTooltip } from 'hooks/useKeyboardShortcuts';
import ConfirmDeleteDialog from 'ui-component/ConfirmDeleteDialog';
import { AddCheckListDialog } from './AddCheckListDialog';
import ChecklistAssignDialog from './ChecklistAssignDialog';
import { API_PATHS } from 'utils/api-constants';
import useLookups from 'hooks/useLookups';

const columns = [
  { id: 'index', label: '#', minWidth: 50 },
  { id: 'seqNo', label: 'Seq No', minWidth: 80, bold: true },
  { id: 'checkingPoint', label: 'Checking Point', minWidth: 200 },
  { id: 'category', label: 'Category', minWidth: 120 },
  { id: 'frequency', label: 'Frequency', minWidth: 120 },
  { id: 'level', label: 'Level', minWidth: 150 },
  { id: 'department', label: 'Department', minWidth: 150 },
  { id: 'effectiveFrom', label: 'Effective from', minWidth: 120 },
  { id: 'reminderDays', label: 'Days', minWidth: 80 },
  { id: 'expiryDate', label: 'Expire Date', minWidth: 120 },
  { id: 'reminderDate', label: 'Reminder Date', minWidth: 120 },
  { id: 'stockLink', label: 'Stock Link', minWidth: 100 },
  { id: 'assignTo', label: 'Assign To', minWidth: 120 },
  { id: 'assignDate', label: 'Assign Date', minWidth: 120 },
  { id: 'itemCode', label: 'Item Code', minWidth: 120 },
  { id: 'qty', label: 'Qty', minWidth: 80 },
  { id: 'photoRequired', label: 'Photo Required', minWidth: 100 },
  { id: 'createdDate', label: 'Created Date', minWidth: 120 },
  { id: 'createdBy', label: 'Created By', minWidth: 120 },
  { id: 'updatedBy', label: 'Modified By', minWidth: 120 },
  { id: 'status', label: 'Status', minWidth: 100 },
  { id: 'taskStatus', label: 'Task Status', minWidth: 120 },
  { id: 'verifyStatus', label: 'Verify Status', minWidth: 150 },
  { id: 'verifiedBy', label: 'Verified By', minWidth: 120 },
  { id: 'verifiedDate', label: 'Verified Date', minWidth: 120 },
  { id: 'rejReason', label: 'Rej Reason', minWidth: 200 },
  { id: 'attachments', label: 'Docs', minWidth: 80, align: 'center' }
];



export default function MasterCheckList() {
  const dispatch = useDispatch();
  const [rows, setRows] = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [isView, setIsView] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const lookups = useLookups(['DEPARTMENTS', 'EMPLOYEES']);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState({ url: '', name: '', content: '', loading: false });

  const globalQuery = useSelector((state) => state.search.query);
  const filters = useSelector((state) => state.search.filters);

  useEffect(() => {
    dispatch(setFilterConfig([
      { id: 'status', label: 'Status', type: 'select', isStarred: true, options: [{ label: 'All', value: 'All' }, { label: 'Active', value: 'Active' }, { label: 'In Active', value: 'In Active' }], defaultValue: 'All' },
      { id: 'taskStatus', label: 'Task Status', type: 'select', isStarred: true, options: [{ label: 'All', value: 'All' }, { label: 'COMPLETED', value: 'COMPLETED' }, { label: 'PENDING', value: 'PENDING' }, { label: 'IN PROGRESS', value: 'IN PROGRESS' }], defaultValue: 'All' },
      { id: 'verifyStatus', label: 'Verify Status', type: 'select', isStarred: true, options: [{ label: 'All', value: 'All' }, { label: 'Pending for Verify', value: 'Pending for Verify' }, { label: 'Verified', value: 'Verified' }, { label: 'Rejected', value: 'Rejected' }], defaultValue: 'All' },
      { id: 'category', label: 'Category', type: 'select', isStarred: true, options: [{ label: 'All', value: 'All' }, { label: 'Renewal', value: 'RENEWAL' }, { label: 'Check List', value: 'CHECK LIST' }], defaultValue: 'All' },
      { id: 'department', label: 'Department', type: 'select', isStarred: true, options: [{ label: 'All', value: 'All' }, ...(lookups.departments || []).map(d => ({ label: d.departmentName, value: d.departmentName }))], defaultValue: 'All' },
      { id: 'assignedTo', label: 'Employee Name', type: 'autocomplete', multiple: true, isStarred: true, options: (lookups.employees || []).map(e => e.employeeName || `${e.firstName} ${e.lastName}`), defaultValue: [] },
      { id: 'leftCompany', label: 'Left Company', type: 'select', isStarred: true, options: [{ label: 'No', value: 'No' }, { label: 'Yes', value: 'Yes' }], defaultValue: 'No' },
      { id: 'searchBy', label: 'Search by', type: 'select', isStarred: true, options: [{ label: 'Seq No', value: 'seqNo' }, { label: 'Checking Point', value: 'checkingPoint' }, { label: 'Category', value: 'category' }, { label: 'Frequency', value: 'frequency' }, { label: 'Assigned To', value: 'assignTo' }], defaultValue: 'checkingPoint' },
      { id: 'frequency', label: 'Frequency', type: 'select', options: [{ label: 'All', value: 'All' }, { label: 'DAILY', value: 'DAILY' }, { label: 'WEEKLY', value: 'WEEKLY' }, { label: 'MONTHLY', value: 'MONTHLY' }, { label: 'YEARLY', value: 'YEARLY' }], defaultValue: 'All' },
      { id: 'level', label: 'Level', type: 'text' },
      { id: 'photoRequired', label: 'Photo Required', type: 'select', options: [{ label: 'All', value: 'All' }, { label: 'YES', value: 'YES' }, { label: 'NO', value: 'NO' }], defaultValue: 'All' },
      { id: 'verificationRequired', label: 'Verification Required', type: 'select', options: [{ label: 'All', value: 'All' }, { label: 'YES', value: 'YES' }, { label: 'NO', value: 'NO' }], defaultValue: 'All' },
      { id: 'stockLink', label: 'Stock Link', type: 'text' },
      { id: 'itemCode', label: 'Item Code', type: 'text' },
      { id: 'qty', label: 'Qty', type: 'text' }
    ]));
    return () => dispatch(setFilterConfig(null));
  }, [dispatch, lookups.departments, lookups.employees]);

  const fetchChecklists = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page, size,
        status: filters.status !== 'All' ? filters.status : undefined,
        verifyStatus: filters.verifyStatus !== 'All' ? filters.verifyStatus : undefined,
        category: filters.category !== 'All' ? filters.category : undefined,
        department: filters.department !== 'All' ? filters.department : undefined,
        dualCheck: filters.dualCheck !== 'All' ? filters.dualCheck : undefined,
        assignTo: filters.assignedTo && filters.assignedTo.length > 0 ? filters.assignedTo.join(',') : undefined,
        searchBy: filters.searchBy !== 'All' ? filters.searchBy : undefined,
        searchValue: globalQuery || undefined
      };
      const response = await axios.get(API_PATHS.QMS.CHECKLIST, { params });
      setRows(response.data.content || []);
      setTotalElements(response.data.totalElements || 0);
    } catch (error) {
      console.error('Failed to fetch checklists:', error);
    } finally {
      setLoading(false);
    }
  }, [page, size, filters, globalQuery]);

  useEffect(() => { fetchChecklists(); }, [fetchChecklists]);

  const handleOpenAdd = () => { setSelectedRow(null); setIsView(false); setDialogOpen(true); };
  const handleOpenEdit = (row) => { setSelectedRow(row); setIsView(false); setDialogOpen(true); };
  const handleOpenView = (row) => { setSelectedRow(row); setIsView(true); setDialogOpen(true); };

  const handleDeleteConfirm = async () => {
    if (!selectedRow) return;
    console.log('BOS Checklist Delete - Attempting to delete ID:', selectedRow.id);
    const deleteUrl = `${API_PATHS.QMS.CHECKLIST}/${selectedRow.id}`;
    console.log('BOS Checklist Delete - Request URL:', deleteUrl);
    
    try {
      const response = await axios.delete(deleteUrl);
      console.log('BOS Checklist Delete - Server Response Status:', response.status);
      dispatch(openSnackbar({ open: true, message: 'Checklist deleted successfully', severity: 'success', variant: 'alert' }));
      fetchChecklists();
      setSelectedRow(null);
      setDeleteDialogOpen(false);
    } catch (err) {
      console.error('BOS Checklist Delete - Error Object:', err);
      if (err.response) {
        console.error('BOS Checklist Delete - Error Response Data:', err.response.data);
        console.error('BOS Checklist Delete - Error Response Status:', err.response.status);
      }
      dispatch(openSnackbar({ open: true, message: 'Failed to delete', severity: 'error', variant: 'alert' }));
    }
  };

  const handleAssign = () => {
    if (!selectedRow) return;
    setAssignDialogOpen(true);
  };

  const handleOpenPreview = async (serverFileName, originalName) => {
    const baseUrl = (axios.defaults.baseURL || '').replace(/\/+$/, '');
    const url = `${baseUrl}${API_PATHS.FILES}/view/${encodeURIComponent(serverFileName)}`;
    const ext = originalName.split('.').pop()?.toLowerCase();
    
    setPreviewOpen(true);
    setPreviewData({ url, name: originalName, content: '', loading: true });

    try {
      if (['docx', 'doc', 'xlsx', 'xls'].includes(ext)) {
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        const arrayBuffer = response.data;
        let content = '';
        if (ext.startsWith('doc')) {
          const result = await mammoth.convertToHtml({ arrayBuffer });
          content = result.value;
        } else if (ext.startsWith('xls')) {
          const workbook = XLSX.read(arrayBuffer, { type: 'array' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          content = XLSX.utils.sheet_to_html(firstSheet);
        }
        setPreviewData(p => ({ ...p, content, loading: false }));
      } else {
        setPreviewData(p => ({ ...p, loading: false }));
      }
    } catch (e) {
      setPreviewData(p => ({ ...p, content: '<div style="color:red;padding:20px;">Failed to load preview.</div>', loading: false }));
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
      Status: r.status
    }));
    exportToExcel(exportData, 'Checklist_Master');
  };

  useKeyboardShortcuts({
    'ctrl+n': handleOpenAdd,
    'escape': () => setDialogOpen(false)
  });

  const renderCell = (col, row, idx) => {
    if (col.id === 'index') return idx + 1 + page * size;
    if (col.id === 'status') {
      const s = row.status || 'Active';
      return <Chip label={s} size="small" sx={getStatusChipSx(s === 'Active' ? 'ACTIVE' : 'INACTIVE')} />;
    }
    if (col.id === 'verifyStatus') {
      const s = row.verifyStatus || 'Pending for Verify';
      let chipStatus = 'PENDING';
      if (s === 'Verified') chipStatus = 'ACTIVE';
      if (s === 'Rejected') chipStatus = 'INACTIVE';
      return <Chip label={s} size="small" sx={getStatusChipSx(chipStatus)} />;
    }
    if (col.id === 'taskStatus') {
      return <Chip label={row.taskStatus || 'Pending'} size="small" sx={getStatusChipSx(row.taskStatus === 'Completed' ? 'ACTIVE' : 'PENDING')} />;
    }
    if (col.id === 'department') return (row.departments || []).map((d) => d.departmentName).join(', ');
    if (col.id === 'level') return row.levelIds || '-';
    if (col.id === 'rejReason') return row.rejReason || '-';
    if (['createdDate', 'verifiedDate', 'updatedDate', 'assignDate'].includes(col.id)) {
      return row[col.id] ? new Date(row[col.id]).toLocaleDateString() : '-';
    }
    if (col.id === 'attachments') {
      const hasFiles = (row.uploadedFiles && row.uploadedFiles.length > 0) || (row.scannedFiles && row.scannedFiles.length > 0);
      if (!hasFiles) return '-';
      const fileName = row.uploadedFiles?.[0] || row.scannedFiles?.[0];
      return (
        <Tooltip title="Preview First Attachment">
          <IconButton 
            size="small" 
            color="primary" 
            onClick={(e) => {
              e.stopPropagation();
              handleOpenPreview(fileName, fileName);
            }}
          >
            <IconEye size={18} />
          </IconButton>
        </Tooltip>
      );
    }
    const val = row[col.id];
    if (typeof val === 'object' && val !== null) {
      return val.name || val.label || val.id || '-';
    }
    return val || '-';
  };

  return (
    <MainCard
      title={
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <IconListCheck size={24} />
          <Typography variant="h3">Master Check List</Typography>
        </Stack>
      }
      secondary={
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Tooltip title="Refresh">
            <IconButton onClick={fetchChecklists} color="primary" size="small" sx={{ border: '2px solid', borderColor: 'divider', borderRadius: '8px', p: 1, transition: 'all 0.2s', '&:hover': { bgcolor: 'primary.light', transform: 'scale(1.05)' } }}>
              <IconRefresh size={20} />
            </IconButton>
          </Tooltip>
          <Button variant="contained" color="secondary" size="medium" startIcon={<IconUserPlus size={18} />} disabled={!selectedRow || selectedRow.verifyStatus !== 'Verified'} onClick={handleAssign} sx={{ borderRadius: '8px' }}>
            Assign
          </Button>
          <Button variant="contained" color="secondary" size="medium" startIcon={<IconFileDots size={18} />} disabled={!selectedRow || selectedRow.verifyStatus !== 'Verified'} onClick={() => handleOpenEdit(selectedRow)} sx={{ borderRadius: '8px' }}>
            Amendment
          </Button>
          <Button variant="outlined" color="primary" size="medium" startIcon={<IconFileDownload size={18} />} onClick={handleExport} sx={btnExport}>
            Export Excel
          </Button>
          <Tooltip title={shortcutTooltip('Create New Check List', 'Ctrl + N')}>
            <Button variant="contained" color="primary" size="medium" onClick={handleOpenAdd} sx={btnNew}>
              + New
            </Button>
          </Tooltip>
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
        onClickRow={setSelectedRow}
        selectedRowId={selectedRow?.id}
        onEditRow={(row) => {
          if (row.verifyStatus === 'Verified') {
            dispatch(openSnackbar({ open: true, message: 'Verified checklists can only be modified via Amendment', severity: 'info', variant: 'alert' }));
            return;
          }
          handleOpenEdit(row);
        }}
        onDeleteRow={(row) => {
          if (row.verifyStatus === 'Verified') {
            dispatch(openSnackbar({ open: true, message: 'Verified checklists cannot be deleted', severity: 'error', variant: 'alert' }));
            return;
          }
          setSelectedRow(row);
          setDeleteDialogOpen(true);
        }}
        renderCell={renderCell}
        showActions={true}
        id="master-checklist-table"
      />

      <AddCheckListDialog 
        open={dialogOpen} 
        handleClose={() => setDialogOpen(false)} 
        initialData={selectedRow} 
        readOnly={isView}
        onSave={async (data) => {
          try {
            const params = new URLSearchParams();
            (data.department || []).forEach((d) => params.append('departments', d));
            
            const payload = { 
              ...data, 
              createdBy: data.id ? data.createdBy : 'Current User',
              updatedBy: 'Current User'
            };
            
            await axios.post(`${API_PATHS.QMS.CHECKLIST}?${params.toString()}`, payload);
            dispatch(openSnackbar({ open: true, message: 'Checklist saved successfully!', severity: 'success', variant: 'alert' }));
            fetchChecklists();
            setDialogOpen(false);
          } catch (err) {
            dispatch(openSnackbar({ open: true, message: 'Failed to save', severity: 'error', variant: 'alert' }));
          }
        }}
      />

      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Check List"
        message="Are you sure you want to delete this check list item?"
        itemName={selectedRow?.seqNo + ' - ' + selectedRow?.checkingPoint}
      />

      <ChecklistAssignDialog
        open={assignDialogOpen}
        onClose={() => {
          setAssignDialogOpen(false);
          fetchChecklists();
        }}
        checklistId={selectedRow?.id}
        initialData={selectedRow}
      />

      <Dialog open={previewOpen} onClose={() => setPreviewOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4">Quick Preview: {previewData.name}</Typography>
          <IconButton onClick={() => setPreviewOpen(false)}><IconX size={20} /></IconButton>
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center', bgcolor: '#fafafa', p: previewData.content ? 2 : 0, minHeight: '500px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {previewData.loading ? (
            <CircularProgress />
          ) : previewData.content ? (
            <Box sx={{ width: '100%', height: '70vh', overflow: 'auto', textAlign: 'left', bgcolor: '#fff', p: 2, borderRadius: 1, border: '1px solid #ddd' }} dangerouslySetInnerHTML={{ __html: previewData.content }} />
          ) : (
            <Box component="img" src={`${(axios.defaults.baseURL || '').replace(/\/+$/, '')}${API_PATHS.FILES}/view/${previewData.name}`} sx={{ maxWidth: '100%', maxHeight: '70vh', borderRadius: 2, boxShadow: 3 }} />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewOpen(false)}>Close</Button>
          <Button variant="contained" onClick={() => window.open(`${(axios.defaults.baseURL || '').replace(/\/+$/, '')}${API_PATHS.FILES}/view/${previewData.name}`, '_blank')}>Open Full</Button>
        </DialogActions>
      </Dialog>
    </MainCard>
  );
}
