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
  IconEye
} from '@tabler/icons-react';
import { Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import axios from 'utils/axios';
import { useDispatch, useSelector } from 'react-redux';
import { setFilterConfig } from 'store/slices/search';
import { openSnackbar } from 'store/slices/snackbar';
import MainCard from 'ui-component/cards/MainCard';
import { exportToExcel } from 'utils/excelExport';
import { BOSDataTable, btnExport, btnNew, getStatusChipSx } from 'ui-component/bos';
import useKeyboardShortcuts, { shortcutTooltip } from 'hooks/useKeyboardShortcuts';
import ConfirmDeleteDialog from 'ui-component/ConfirmDeleteDialog';
import AddCheckListDialog from './AddCheckListDialog';
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
  const [previewUrl, setPreviewUrl] = useState('');
  const [previewName, setPreviewName] = useState('');

  const globalQuery = useSelector((state) => state.search.query);
  const filters = useSelector((state) => state.search.filters);

  useEffect(() => {
    dispatch(setFilterConfig([
      {
        id: 'status', label: 'Status', type: 'select',
        options: [
          { label: 'All', value: 'All' },
          { label: 'Active', value: 'Active' },
          { label: 'In Active', value: 'In Active' }
        ],
        defaultValue: 'All'
      },
      {
        id: 'taskStatus', label: 'Task Status', type: 'select',
        options: [
          { label: 'All', value: 'All' },
          { label: 'COMPLETED', value: 'COMPLETED' },
          { label: 'PENDING', value: 'PENDING' },
          { label: 'IN PROGRESS', value: 'IN PROGRESS' }
        ],
        defaultValue: 'All'
      },
      {
        id: 'verifyStatus', label: 'Verify Status', type: 'select',
        options: [
          { label: 'All', value: 'All' },
          { label: 'Pending for Verify', value: 'Pending for Verify' },
          { label: 'Verified', value: 'Verified' },
          { label: 'Rejected', value: 'Rejected' }
        ],
        defaultValue: 'All'
      },
      {
        id: 'category', label: 'Category', type: 'select',
        options: [
          { label: 'All', value: 'All' },
          { label: 'Renewal', value: 'RENEWAL' },
          { label: 'Check List', value: 'CHECK LIST' }
        ],
        defaultValue: 'All'
      },
      {
        id: 'department', label: 'Department', type: 'select',
        options: [{ label: 'All', value: 'All' }, ...(lookups.departments || []).map(d => ({ label: d.departmentName, value: d.departmentName }))],
        defaultValue: 'All'
      },
      {
        id: 'assignedTo', label: 'Employee Name', type: 'select',
        options: [{ label: 'All', value: 'All' }, ...(lookups.employees || []).map(e => ({ label: e.employeeName || `${e.firstName} ${e.lastName}`, value: e.employeeName || `${e.firstName} ${e.lastName}` }))],
        defaultValue: 'All'
      },
      {
        id: 'leftCompany', label: 'Left Company', type: 'select',
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
          { label: 'Category', value: 'category' },
          { label: 'Frequency', value: 'frequency' },
          { label: 'Assigned To', value: 'assignTo' }
        ],
        defaultValue: 'checkingPoint'
      }
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
        assignTo: filters.assignedTo !== 'All' ? filters.assignedTo : undefined,
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
    try {
      await axios.delete(`${API_PATHS.QMS.CHECKLIST}/${selectedRow.id}`);
      dispatch(openSnackbar({ open: true, message: 'Checklist deleted successfully', severity: 'success', variant: 'alert' }));
      fetchChecklists();
      setSelectedRow(null);
      setDeleteDialogOpen(false);
    } catch (err) {
      dispatch(openSnackbar({ open: true, message: 'Failed to delete', severity: 'error', variant: 'alert' }));
    }
  };

  const handleAssign = () => {
    if (!selectedRow) return;
    setAssignDialogOpen(true);
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
              setPreviewName(fileName);
              setPreviewUrl(`${axios.defaults.baseURL}${API_PATHS.FILES}/download/${fileName}`);
              setPreviewOpen(true);
            }}
          >
            <IconPaperclip size={18} />
          </IconButton>
        </Tooltip>
      );
    }
    return row[col.id] || '-';
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
          <Button variant="contained" color="secondary" size="medium" startIcon={<IconUserPlus size={18} />} disabled={!selectedRow} onClick={handleAssign} sx={{ borderRadius: '8px' }}>
            Assign
          </Button>
          <Button variant="contained" color="secondary" size="medium" startIcon={<IconFileDots size={18} />} disabled={!selectedRow} onClick={() => handleOpenEdit(selectedRow)} sx={{ borderRadius: '8px' }}>
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
        onEditRow={handleOpenEdit}
        onDeleteRow={(row) => { setSelectedRow(row); setDeleteDialogOpen(true); }}
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
          <Typography variant="h4">Quick Preview: {previewName}</Typography>
          <IconButton onClick={() => setPreviewOpen(false)}><IconEye size={20} /></IconButton>
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center', bgcolor: '#fafafa', p: 3 }}>
          <Box component="img" src={previewUrl} sx={{ maxWidth: '100%', maxHeight: '70vh', borderRadius: 2, boxShadow: 3 }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewOpen(false)}>Close</Button>
          <Button variant="contained" onClick={() => window.open(previewUrl, '_blank')}>Open Full</Button>
        </DialogActions>
      </Dialog>
    </MainCard>
  );
}
