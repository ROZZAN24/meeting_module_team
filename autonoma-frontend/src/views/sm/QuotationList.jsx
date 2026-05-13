import { useState, useEffect, useCallback, useMemo } from 'react';
import { Typography, Button, Stack, Tooltip, IconButton } from '@mui/material';
import { IconFileDownload, IconRefresh, IconFileInvoice } from '@tabler/icons-react';
import axios from 'utils/axios';
import { API_PATHS } from 'utils/api-constants';
import { useDispatch, useSelector } from 'react-redux';
import { setFilterConfig } from 'store/slices/search';
import { openSnackbar } from 'store/slices/snackbar';
import { format } from 'date-fns';
import MainCard from 'ui-component/cards/MainCard';
import AddQuotationDialog from './AddQuotationDialog';
import { exportToExcel } from 'utils/excelExport';
import ConfirmDeleteDialog from 'ui-component/ConfirmDeleteDialog';
import useKeyboardShortcuts, { shortcutTooltip } from 'hooks/useKeyboardShortcuts';
import { BOSDataTable, BOSExportButton, btnExport, btnNew } from 'ui-component/bos';

// ==============================|| SM - QUOTATION MANAGEMENT (BOS SOP COMPLIANT) ||============================== //

const columns = [
  { id: 'index', label: '#', minWidth: 50 },
  { id: 'quotationNo', label: 'Quotation No', minWidth: 130, bold: true },
  { id: 'quotationDate', label: 'Date', minWidth: 110 },
  { id: 'enquiryRef', label: 'Enquiry Ref', minWidth: 120 },
  { id: 'customerName', label: 'Customer', minWidth: 180 },
  { id: 'productName', label: 'Product', minWidth: 160 },
  { id: 'totalAmount', label: 'Amount', minWidth: 100 },
  { id: 'currency', label: 'Currency', minWidth: 80 },
  { id: 'status', label: 'Status', minWidth: 100 }
];

export default function QuotationList() {
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
      {
        id: 'status', label: 'Status', type: 'select',
        options: [
          { value: 'All', label: 'ALL' },
          { value: 'Draft', label: 'DRAFT' },
          { value: 'Sent', label: 'SENT' },
          { value: 'Accepted', label: 'ACCEPTED' },
          { value: 'Rejected', label: 'REJECTED' },
          { value: 'Expired', label: 'EXPIRED' }
        ],
        defaultValue: 'All'
      },
      { id: 'customerName', label: 'Customer', type: 'text', placeholder: 'Search by Customer...' }
    ];
    dispatch(setFilterConfig(config));
    return () => dispatch(setFilterConfig(null));
  }, [dispatch]);

  const fetchQuotations = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(API_PATHS.SM.QUOTATIONS);
      setRows(response.data);
    } catch (error) {
      console.error('Failed to fetch quotations:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchQuotations(); }, [fetchQuotations]);

  const handleOpenAdd = () => { setSelectedRow(null); setIsReadOnly(false); setDialogOpen(true); };
  const handleOpenEdit = (row) => { setSelectedRow(row); setIsReadOnly(false); setDialogOpen(true); };
  const handleCloseDialog = (refresh) => { setDialogOpen(false); if (refresh === true) fetchQuotations(); };

  const handleDeleteClick = (row) => {
    setDeleteTargetId(row.id);
    setDeleteTargetName(row.quotationNo || row.customerName);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    setDeleteDialogOpen(false);
    try {
      await axios.delete(`${API_PATHS.SM.QUOTATIONS}/${deleteTargetId}`);
      dispatch(openSnackbar({ open: true, message: 'Quotation deleted successfully!', variant: 'alert', alert: { variant: 'filled' }, severity: 'success', close: false }));
      fetchQuotations();
    } catch (error) {
      console.error('Failed to delete quotation:', error);
      dispatch(openSnackbar({ open: true, message: 'Failed to delete quotation.', variant: 'alert', alert: { variant: 'filled' }, severity: 'error', close: false }));
    }
  };

  useKeyboardShortcuts({
    'ctrl+n': handleOpenAdd,
    'escape': () => { if (dialogOpen) handleCloseDialog(); }
  });

  const handleExport = () => {
    const exportData = filteredRows.map((r, i) => ({
      '#': i + 1,
      'Quotation No': r.quotationNo,
      'Date': r.quotationDate ? format(new Date(r.quotationDate), 'dd-MM-yyyy') : '',
      'Enquiry Ref': r.enquiryRef,
      'Customer': r.customerName,
      'Product': r.productName,
      'Quantity': r.quantity,
      'Unit Price': r.unitPrice,
      'Total Amount': r.totalAmount,
      'Currency': r.currency,
      'Status': r.status
    }));
    exportToExcel(exportData, 'SM_Quotations');
  };

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const statusFilter = globalFilters.status || 'All';
      const matchesStatus = statusFilter === 'All' || row.status === statusFilter;
      const nameFilter = globalFilters.customerName || '';
      const matchesName = !nameFilter || (row.customerName && row.customerName.toLowerCase().includes(nameFilter.toLowerCase()));
      const matchesSearch = !globalQuery ||
        (row.customerName && row.customerName.toLowerCase().includes(globalQuery.toLowerCase())) ||
        (row.quotationNo && row.quotationNo.toLowerCase().includes(globalQuery.toLowerCase())) ||
        (row.productName && row.productName.toLowerCase().includes(globalQuery.toLowerCase()));
      return matchesStatus && matchesName && matchesSearch;
    });
  }, [rows, globalQuery, globalFilters]);

  const paginatedRows = useMemo(() => filteredRows.slice(page * size, page * size + size), [filteredRows, page, size]);

  return (
    <MainCard
      title={
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <IconFileInvoice size={24} />
          <Typography variant="h3">Quotation Management</Typography>
        </Stack>
      }
      secondary={
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Tooltip title="Refresh">
            <IconButton onClick={fetchQuotations} color="primary" size="small" sx={{
              border: '2px solid', borderColor: 'divider', borderRadius: '8px', p: 1,
              transition: 'all 0.2s', '&:hover': { bgcolor: 'primary.light', transform: 'scale(1.05)' }
            }}>
              <IconRefresh size={20} />
            </IconButton>
          </Tooltip>
          <BOSExportButton
            data={filteredRows}
            filename="SM_Quotations"
            columns={[
              { header: 'Quotation No', key: 'quotationNo' },
              { header: 'Date', key: 'quotationDate' },
              { header: 'Customer', key: 'customerName' },
              { header: 'Amount', key: 'totalAmount' },
              { header: 'Status', key: 'status' }
            ]}
          />
          <Tooltip title={shortcutTooltip('Create New Quotation', 'Ctrl + N')}>
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

      <AddQuotationDialog open={dialogOpen} handleClose={handleCloseDialog} initialData={selectedRow} readOnly={isReadOnly} />
      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Quotation"
        message="Are you sure you want to delete this quotation? This action cannot be undone."
        itemName={deleteTargetName}
      />
    </MainCard>
  );
}
