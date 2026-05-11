import { useState, useEffect, useCallback, useMemo } from 'react';
import { Typography, Button, Stack, Tooltip, IconButton } from '@mui/material';
import { IconFileDownload, IconRefresh, IconUserPlus } from '@tabler/icons-react';
import axios from 'utils/axios';
import { useDispatch, useSelector } from 'react-redux';
import { setFilterConfig } from 'store/slices/search';
import { openSnackbar } from 'store/slices/snackbar';
import MainCard from 'ui-component/cards/MainCard';
import AddSupplierDialog from './AddSupplierDialog';
import { exportToExcel } from 'utils/excelExport';
import ConfirmDeleteDialog from 'ui-component/ConfirmDeleteDialog';
import useKeyboardShortcuts, { shortcutTooltip } from 'hooks/useKeyboardShortcuts';
import { BOSDataTable, btnExport, btnNew } from 'ui-component/bos';

// ==============================|| SM - SUPPLIER LIST (BOS SOP COMPLIANT) ||============================== //

const columns = [
  { id: 'index', label: '#', minWidth: 50 },
  { id: 'supplierCode', label: 'Code', minWidth: 100, bold: true },
  { id: 'supplierName', label: 'Supplier Name', minWidth: 200 },
  { id: 'contactPerson', label: 'Contact Person', minWidth: 150 },
  { id: 'email', label: 'Email', minWidth: 180 },
  { id: 'phone', label: 'Phone', minWidth: 120 },
  { id: 'status', label: 'Status', minWidth: 100 }
];

export default function SupplierList() {
  const dispatch = useDispatch();
  const globalQuery = useSelector((state) => state.search.query);
  const globalFilters = useSelector((state) => state.search.filters);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [deleteTargetName, setDeleteTargetName] = useState('');

  useEffect(() => {
    const config = [
      { id: 'supplierName', label: 'Supplier Name', type: 'text', placeholder: 'Search by Name...' },
      { id: 'supplierCode', label: 'Supplier Code', type: 'text', placeholder: 'Search by Code...' }
    ];
    dispatch(setFilterConfig(config));
    return () => dispatch(setFilterConfig(null));
  }, [dispatch]);

  const fetchSuppliers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/sm/suppliers');
      setRows(response.data);
    } catch (error) {
      console.error('Failed to fetch suppliers:', error);
      // Fallback for missing endpoint
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSuppliers(); }, [fetchSuppliers]);

  const handleOpenAdd = () => { setSelectedRow(null); setIsReadOnly(false); setDialogOpen(true); };
  const handleOpenEdit = (row) => { setSelectedRow(row); setIsReadOnly(false); setDialogOpen(true); };
  const handleCloseDialog = (refresh) => { setDialogOpen(false); if (refresh === true) fetchSuppliers(); };

  const handleDeleteClick = (row) => {
    setDeleteTargetId(row.id);
    setDeleteTargetName(row.supplierName);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    setDeleteDialogOpen(false);
    try {
      await axios.delete(`/api/sm/suppliers/${deleteTargetId}`);
      dispatch(openSnackbar({ open: true, message: 'Supplier deleted successfully!', variant: 'alert', alert: { variant: 'filled' }, severity: 'success', close: false }));
      fetchSuppliers();
    } catch (error) {
      console.error('Failed to delete supplier:', error);
      dispatch(openSnackbar({ open: true, message: 'Failed to delete supplier.', variant: 'alert', alert: { variant: 'filled' }, severity: 'error', close: false }));
    }
  };

  useKeyboardShortcuts({
    'ctrl+n': handleOpenAdd,
    'escape': () => { if (dialogOpen) handleCloseDialog(); }
  });

  const handleExport = () => {
    const exportData = filteredRows.map((r, i) => ({
      '#': i + 1,
      'Code': r.supplierCode,
      'Name': r.supplierName,
      'Contact': r.contactPerson,
      'Email': r.email,
      'Phone': r.phone,
      'Address': r.address,
      'GST': r.gstNo,
      'Status': r.status
    }));
    exportToExcel(exportData, 'Supplier_Master');
  };

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const nameFilter = globalFilters.supplierName || '';
      const codeFilter = globalFilters.supplierCode || '';
      const matchesName = !nameFilter || (row.supplierName && row.supplierName.toLowerCase().includes(nameFilter.toLowerCase()));
      const matchesCode = !codeFilter || (row.supplierCode && row.supplierCode.toLowerCase().includes(codeFilter.toLowerCase()));
      const matchesSearch = !globalQuery ||
        (row.supplierName && row.supplierName.toLowerCase().includes(globalQuery.toLowerCase())) ||
        (row.supplierCode && row.supplierCode.toLowerCase().includes(globalQuery.toLowerCase()));
      return matchesName && matchesCode && matchesSearch;
    });
  }, [rows, globalQuery, globalFilters]);

  const paginatedRows = useMemo(() => filteredRows.slice(page * size, page * size + size), [filteredRows, page, size]);

  return (
    <MainCard
      title={
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <IconUserPlus size={24} />
          <Typography variant="h3">Supplier Master</Typography>
        </Stack>
      }
      secondary={
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Tooltip title="Refresh">
            <IconButton onClick={fetchSuppliers} color="primary" size="small" sx={{
              border: '2px solid', borderColor: 'divider', borderRadius: '8px', p: 1,
              transition: 'all 0.2s', '&:hover': { bgcolor: 'primary.light', transform: 'scale(1.05)' }
            }}>
              <IconRefresh size={20} />
            </IconButton>
          </Tooltip>
          <Button variant="outlined" color="primary" size="medium" startIcon={<IconFileDownload size={18} />} onClick={handleExport} sx={btnExport}>
            Export Excel
          </Button>
          <Tooltip title={shortcutTooltip('Create New Supplier', 'Ctrl + N')}>
            <Button variant="contained" color="primary" size="medium" onClick={handleOpenAdd} sx={btnNew}>
              + New
            </Button>
          </Tooltip>
        </Stack>
      }
    >
      <BOSDataTable
        columns={columns}
        rows={paginatedRows}
        page={page}
        size={size}
        totalCount={filteredRows.length}
        loading={loading}
        onPageChange={(p) => setPage(p)}
        onSizeChange={(s) => { setSize(s); setPage(0); }}
        onDoubleClickRow={handleOpenEdit}
        onEditRow={handleOpenEdit}
        onDeleteRow={handleDeleteClick}
      />

      <AddSupplierDialog open={dialogOpen} handleClose={handleCloseDialog} initialData={selectedRow} readOnly={isReadOnly} />
      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Supplier"
        message="Are you sure you want to delete this supplier? This action cannot be undone."
        itemName={deleteTargetName}
      />
    </MainCard>
  );
}
