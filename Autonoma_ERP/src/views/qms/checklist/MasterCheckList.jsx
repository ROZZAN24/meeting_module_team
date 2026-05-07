import { useState, useEffect, useCallback, useMemo } from 'react';
import { Typography, Box, Button, Stack, Tooltip, IconButton, Chip } from '@mui/material';
import {
  IconPlus,
  IconListCheck,
  IconUserPlus,
  IconFileDots,
  IconFileDownload,
  IconTrash
} from '@tabler/icons-react';
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

const columns = [
  { id: 'index', label: '#', minWidth: 50 },
  { id: 'seqNo', label: 'Seq No', minWidth: 80, bold: true },
  { id: 'checkingPoint', label: 'Checking Point', minWidth: 200 },
  { id: 'category', label: 'Category', minWidth: 120 },
  { id: 'frequency', label: 'Frequency', minWidth: 120 },
  { id: 'department', label: 'Department', minWidth: 150 },
  { id: 'effectiveFrom', label: 'Effective from', minWidth: 120 },
  { id: 'reminderDays', label: 'Days', minWidth: 80 },
  { id: 'expiryDate', label: 'Expire Date', minWidth: 120 },
  { id: 'reminderDate', label: 'Reminder Date', minWidth: 120 },
  { id: 'stockLink', label: 'Stock Link', minWidth: 100 },
  { id: 'itemCode', label: 'Item Code', minWidth: 120 },
  { id: 'qty', label: 'Qty', minWidth: 80 },
  { id: 'photoRequired', label: 'Photo Required', minWidth: 120 },
  { id: 'status', label: 'Status', minWidth: 100 },
  { id: 'verifyStatus', label: 'Verify Status', minWidth: 150 }
];

const DEPARTMENTS = [
  'ACCOUNTS', 'ADMIN', 'ASSEMBLY', 'BUSINESS DEVELOPMENT', 'DESIGN & DEVELOPMENT', 
  'HRA', 'LOGISTICS', 'MAINTENANCE', 'MANAGEMENT', 'MANAGEMENT REPRESENTATIVE', 
  'OPERATIONS', 'PLANNING', 'PRODUCT DEVELOPMENT', 'PRODUCTION', 'PURCHASE', 
  'QMS', 'QUALITY', 'SALES & MARKETING', 'STORES', 'STRATEGIC PROCUREMENT', 'TOP MANAGEMENT'
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
  const [isView, setIsView] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

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
        options: [{ label: 'All', value: 'All' }, ...DEPARTMENTS.map(d => ({ label: d, value: d }))],
        defaultValue: 'All'
      }
    ]));
    return () => dispatch(setFilterConfig(null));
  }, [dispatch]);

  const fetchChecklists = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page, size,
        category: filters.category !== 'All' ? filters.category : undefined,
        department: filters.department !== 'All' ? filters.department : undefined,
        status: filters.status !== 'All' ? filters.status : undefined,
        searchValue: globalQuery || undefined
      };
      const response = await axios.get('/api/qms/checklist', { params });
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
      await axios.delete(`/api/qms/checklist/${selectedRow.id}`);
      dispatch(openSnackbar({ open: true, message: 'Checklist deleted successfully', severity: 'success', variant: 'alert' }));
      fetchChecklists();
      setSelectedRow(null);
      setDeleteDialogOpen(false);
    } catch (err) {
      dispatch(openSnackbar({ open: true, message: 'Failed to delete', severity: 'error', variant: 'alert' }));
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
    if (col.id === 'status') return <Chip label={row.status} size="small" sx={getStatusChipSx(row.status === 'Active' ? 'ACTIVE' : 'INACTIVE')} />;
    if (col.id === 'verifyStatus') return <Chip label={row.verifyStatus || 'Pending'} size="small" sx={getStatusChipSx(row.verifyStatus === 'Verified' ? 'ACTIVE' : 'PENDING')} />;
    if (col.id === 'department') return (row.departments || []).map((d) => d.departmentName).join(', ');
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
        <Stack direction="row" spacing={1.5}>
          <Button variant="contained" color="secondary" size="medium" startIcon={<IconUserPlus size={18} />} disabled={!selectedRow} sx={{ borderRadius: '8px' }}>
            Assign
          </Button>
          <Button variant="contained" color="secondary" size="medium" startIcon={<IconFileDots size={18} />} disabled={!selectedRow} sx={{ borderRadius: '8px' }}>
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
        onDoubleClickRow={handleOpenView}
        onClickRow={setSelectedRow}
        selectedRowId={selectedRow?.id}
        onEditRow={handleOpenEdit}
        onDeleteRow={() => setDeleteDialogOpen(true)}
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
            await axios.post(`/api/qms/checklist?${params.toString()}`, data);
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
    </MainCard>
  );
}
