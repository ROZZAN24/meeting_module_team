import { useState, useEffect, useCallback, useMemo } from 'react';
import { Typography, Button, Stack, Tooltip, IconButton, useTheme } from '@mui/material';
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
  { id: 'gstin', label: 'GSTIN Number', minWidth: 150 },
  { id: 'supplierName', label: 'Supplier Name', minWidth: 200, bold: true },
  { id: 'invoiceName', label: 'Supplier Invoice Name', minWidth: 200 },
  { id: 'shortName', label: 'Short Name', minWidth: 120 },
  { id: 'address', label: 'Address', minWidth: 250 },
  { id: 'pincode', label: 'PinCode', minWidth: 100 },
  { id: 'city', label: 'City', minWidth: 120 },
  { id: 'state', label: 'State', minWidth: 120 },
  { id: 'country', label: 'Country', minWidth: 120 },
  { id: 'dispatchMode', label: 'Mode of Dispatch', minWidth: 150 },
  { id: 'supplierCode', label: 'Supplier Code', minWidth: 120 },
  { id: 'isoNumber', label: 'ISO Number', minWidth: 120 },
  { id: 'isoExpiry', label: 'ISO Expiry', minWidth: 120 },
  { id: 'ndaRequired', label: 'NDA Required', minWidth: 120 },
  { id: 'currency', label: 'Currency', minWidth: 100 },
  { id: 'segment', label: 'Segment', minWidth: 120 },
  { id: 'subSegment', label: 'Sub Segment', minWidth: 120 },
  { id: 'paymentTerms', label: 'Payment Terms', minWidth: 150 },
  { id: 'deliveryTerms', label: 'Delivery Terms', minWidth: 150 },
  { id: 'domainName', label: 'Domain Name', minWidth: 150 },
  { id: 'stateCode', label: 'State Code', minWidth: 100 },
  { id: 'status', label: 'Status', minWidth: 100 },
  { id: 'distance', label: 'Distance', minWidth: 100 },
  { id: 'negotiateSupplier', label: 'Negotiate Supplier', minWidth: 150 },
  { id: 'dailyMailReq', label: 'Daily Mail Req?', minWidth: 180 }
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
  const [selectedListRow, setSelectedListRow] = useState(null);
  const theme = useTheme();

  useEffect(() => {
    const config = [
      { id: 'supplierName', label: 'Supplier Name', type: 'text', placeholder: 'Search by Name...' },
      { id: 'gstin', label: 'GSTIN', type: 'text', placeholder: 'Search by GSTIN...' },
      { id: 'invoiceName', label: 'Invoice Name', type: 'text', placeholder: 'Search by Invoice Name...' }
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
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSuppliers(); }, [fetchSuppliers]);

  const handleOpenAdd = () => { setSelectedRow(null); setIsReadOnly(false); setDialogOpen(true); };
  const handleOpenEdit = (row) => { setSelectedRow(row); setIsReadOnly(false); setDialogOpen(true); };
  const handleCloseDialog = (refresh) => { setDialogOpen(false); if (refresh === true) fetchSuppliers(); };

  const handleRowClick = (row) => {
    if (selectedListRow?.id === row.id) {
      setSelectedListRow(null);
    } else {
      setSelectedListRow(row);
    }
  };

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
      'GSTIN Number': r.gstin,
      'Supplier Name': r.supplierName,
      'Supplier Invoice Name': r.invoiceName,
      'Short Name': r.shortName,
      'Address': r.address,
      'PinCode': r.pincode,
      'City': r.city,
      'State': r.state,
      'Country': r.country,
      'Mode of Dispatch': r.dispatchMode,
      'Supplier Code': r.supplierCode,
      'ISO Number': r.isoNumber,
      'ISO Expiry': r.isoExpiry,
      'NDA Required': r.ndaRequired,
      'Currency': r.currency,
      'Segment': r.segment,
      'Sub Segment': r.subSegment,
      'Payment Terms': r.paymentTerms,
      'Delivery Terms': r.deliveryTerms,
      'Domain Name': r.domainName,
      'State Code': r.stateCode,
      'Status': r.status,
      'Distance': r.distance,
      'Negotiate Supplier': r.negotiateSupplier,
      'Daily Mail Req?': r.dailyMailReq
    }));
    exportToExcel(exportData, 'Supplier_Master');
  };

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const nameFilter = (globalFilters.supplierName || '').toLowerCase();
      const gstinFilter = (globalFilters.gstin || '').toLowerCase();
      const invoiceFilter = (globalFilters.invoiceName || '').toLowerCase();
      
      const matchesName = !nameFilter || (row.supplierName && row.supplierName.toLowerCase().includes(nameFilter));
      const matchesGstin = !gstinFilter || (row.gstin && row.gstin.toLowerCase().includes(gstinFilter));
      const matchesInvoice = !invoiceFilter || (row.invoiceName && row.invoiceName.toLowerCase().includes(invoiceFilter));
      
      const q = (globalQuery || '').toLowerCase();
      const matchesSearch = !q ||
        (row.supplierName && row.supplierName.toLowerCase().includes(q)) ||
        (row.gstin && row.gstin.toLowerCase().includes(q)) ||
        (row.invoiceName && row.invoiceName.toLowerCase().includes(q)) ||
        (row.shortName && row.shortName.toLowerCase().includes(q));

      return matchesName && matchesGstin && matchesInvoice && matchesSearch;
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
        onClickRow={handleRowClick}
        selectedRowId={selectedListRow?.id}
        onEditRow={handleOpenEdit}
        onDeleteRow={handleDeleteClick}
      />

      <AddSupplierDialog key={selectedRow?.id || 'new'} open={dialogOpen} handleClose={handleCloseDialog} initialData={selectedRow} readOnly={isReadOnly} />
      
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
