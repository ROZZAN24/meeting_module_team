import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Typography, Button, Stack, Tooltip, IconButton, useTheme } from '@mui/material';
import { IconFileDownload, IconRefresh, IconUserPlus, IconMapPin } from '@tabler/icons-react';
import axios from 'utils/axios';
import { API_PATHS } from 'utils/api-constants';
import usePagePermissions, { PAGE_CODES } from 'hooks/usePagePermissions';
import { useDispatch, useSelector } from 'react-redux';
import { setFilterConfig } from 'store/slices/search';
import { openSnackbar } from 'store/slices/snackbar';
import MainCard from 'ui-component/cards/MainCard';
// import AddCustomerDialog from './AddCustomerDialog'; // Replaced with page navigation
import AddContactDialog from './AddContactDialog';
import AddCustomerDetailsDialog from './AddCustomerDetailsDialog';
import { exportToExcel } from 'utils/excelExport';
import ConfirmDeleteDialog from 'ui-component/ConfirmDeleteDialog';
import useKeyboardShortcuts, { shortcutTooltip } from 'hooks/useKeyboardShortcuts';
import { BOSDataTable, BOSExportButton, btnExport, btnNew } from 'ui-component/bos';

// ==============================|| SM - CUSTOMER MASTER (BOS SOP COMPLIANT) ||============================== //

const columns = [
  { id: 'index', label: '#', minWidth: 50 },
  { id: 'gstin', label: 'GSTIN Number', minWidth: 150 },
  { id: 'customerName', label: 'Customer Name', minWidth: 200, bold: true },
  { id: 'invoiceName', label: 'Customer Invoice Name', minWidth: 200 },
  { id: 'shortName', label: 'Short Name', minWidth: 120 },
  { id: 'address', label: 'Address', minWidth: 250 },
  { id: 'pincode', label: 'PinCode', minWidth: 100 },
  { id: 'city', label: 'City', minWidth: 120 },
  { id: 'state', label: 'State', minWidth: 120 },
  { id: 'country', label: 'Country', minWidth: 120 },
  { id: 'dispatchMode', label: 'Mode of Dispatch', minWidth: 150 },
  { id: 'vendorCode', label: 'Vendor Code', minWidth: 120 },
  { id: 'isoNumber', label: 'ISO Number', minWidth: 120 },
  { id: 'isoExpiry', label: 'ISO Expiry', minWidth: 120 },
  { id: 'ndaRequired', label: 'NDA Required', minWidth: 120 },
  { id: 'currency', label: 'Currency', minWidth: 100 },
  { id: 'segment', label: 'Segment', minWidth: 120 },
  { id: 'subSegment', label: 'Sub Segment', minWidth: 120 },
  { id: 'paymentTerms', label: 'Payment Terms', minWidth: 150 },
  { id: 'deliveryTerms', label: 'Delivey Terms', minWidth: 150 },
  { id: 'domainName', label: 'Domain Name', minWidth: 150 },
  { id: 'stateCode', label: 'State Code', minWidth: 100 },
  { id: 'status', label: 'Status', minWidth: 100 },
  { id: 'distance', label: 'Distance', minWidth: 100 },
  { id: 'negotiateCustomer', label: 'Negotiate Customer', minWidth: 150 },
  { id: 'dailyDispatchMail', label: 'Daily Dispatch Mail Req?', minWidth: 180 },
  { id: 'createdBy', label: 'Created By', minWidth: 120 },
  { id: 'createdDate', label: 'Created Date', minWidth: 150 },
  { id: 'updatedBy', label: 'Updated By', minWidth: 120 },
  { id: 'updatedDate', label: 'Updated Date', minWidth: 150 }
];

export default function CustomerMasterList() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const globalQuery = useSelector((state) => state.search.query);
  const globalFilters = useSelector((state) => state.search.filters);
  const perms = usePagePermissions(PAGE_CODES.CRM_CUSTOMER);

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
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedListRow, setSelectedListRow] = useState(null);
  const theme = useTheme();

  useEffect(() => {
    const config = [
      { id: 'customerName', label: 'Customer Name', type: 'text', placeholder: 'Search by Name...' },
      { id: 'gstin', label: 'GSTIN', type: 'text', placeholder: 'Search by GSTIN...' },
      { id: 'invoiceName', label: 'Invoice Name', type: 'text', placeholder: 'Search by Invoice Name...' }
    ];
    dispatch(setFilterConfig(config));
    return () => dispatch(setFilterConfig(null));
  }, [dispatch]);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(API_PATHS.SM.CUSTOMERS);
      setRows(response.data);
    } catch (error) {
      console.error('Failed to fetch customers:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

  const handleOpenAdd = () => navigate('/sm/customers/create');
  const handleOpenEdit = (row) => navigate(`/sm/customers/create?id=${row.id}`);
  const handleCloseDialog = (refresh) => { setDialogOpen(false); if (refresh === true) fetchCustomers(); };

  const handleRowClick = (row) => {
    if (selectedListRow?.id === row.id) {
      setSelectedListRow(null);
    } else {
      setSelectedListRow(row);
    }
  };

  const handleDeleteClick = (row) => {
    setDeleteTargetId(row.id);
    setDeleteTargetName(row.customerName);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    setDeleteDialogOpen(false);
    try {
      await axios.delete(`${API_PATHS.SM.CUSTOMERS}/${deleteTargetId}`);
      dispatch(openSnackbar({ open: true, message: 'Customer deleted successfully!', variant: 'alert', alert: { variant: 'filled' }, severity: 'success', close: false }));
      fetchCustomers();
    } catch (error) {
      console.error('Failed to delete customer:', error);
      dispatch(openSnackbar({ open: true, message: 'Failed to delete customer.', variant: 'alert', alert: { variant: 'filled' }, severity: 'error', close: false }));
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
      'Customer Name': r.customerName,
      'Customer Invoice Name': r.invoiceName,
      'Short Name': r.shortName,
      'Address': r.address,
      'PinCode': r.pincode,
      'City': r.city,
      'State': r.state,
      'Country': r.country,
      'Mode of Dispatch': r.dispatchMode,
      'Vendor Code': r.vendorCode,
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
      'Negotiate Customer': r.negotiateCustomer,
      'Daily Dispatch Mail Req?': r.dailyDispatchMail
    }));
    exportToExcel(exportData, 'Customer_Master');
  };

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const nameFilter = (globalFilters.customerName || '').toLowerCase();
      const gstinFilter = (globalFilters.gstin || '').toLowerCase();
      const invoiceFilter = (globalFilters.invoiceName || '').toLowerCase();
      
      const matchesName = !nameFilter || (row.customerName && row.customerName.toLowerCase().includes(nameFilter));
      const matchesGstin = !gstinFilter || (row.gstin && row.gstin.toLowerCase().includes(gstinFilter));
      const matchesInvoice = !invoiceFilter || (row.invoiceName && row.invoiceName.toLowerCase().includes(invoiceFilter));
      
      const q = (globalQuery || '').toLowerCase();
      const matchesSearch = !q ||
        (row.customerName && row.customerName.toLowerCase().includes(q)) ||
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
          <Typography variant="h3">Customer Master</Typography>
        </Stack>
      }
      secondary={
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Tooltip title="Refresh">
            <IconButton onClick={fetchCustomers} color="primary" size="small" sx={{
              border: '2px solid', borderColor: 'divider', borderRadius: '8px', p: 1,
              transition: 'all 0.2s', '&:hover': { bgcolor: 'primary.light', transform: 'scale(1.05)' }
            }}>
              <IconRefresh size={20} />
            </IconButton>
          </Tooltip>
          {perms.export && <BOSExportButton
            data={filteredRows}
            filename="Customer_Master"
            columns={[
              { header: 'GSTIN Number', key: 'gstin' },
              { header: 'Customer Name', key: 'customerName' },
              { header: 'City', key: 'city' },
              { header: 'Status', key: 'status' }
            ]}
          />}
          {perms.write && <Tooltip title={shortcutTooltip('Create New Customer', 'Ctrl + N')}>
            <Button variant="contained" color="primary" size="medium" onClick={handleOpenAdd} sx={btnNew}>
              + New
            </Button>
          </Tooltip>}
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
        onDoubleClickRow={perms.write ? handleOpenEdit : undefined}
        onClickRow={handleRowClick}
        selectedRowId={selectedListRow?.id}
        onEditRow={perms.write ? handleOpenEdit : undefined}
        onDeleteRow={perms.delete ? handleDeleteClick : undefined}
        renderCell={null}
        footerActions={
          <Stack direction="row" spacing={1.5}>
            <Button 
              variant="contained" 
              color="secondary" 
              disabled={!selectedListRow}
              startIcon={<IconUserPlus size={18} />} 
              onClick={() => setContactDialogOpen(true)}
              sx={{ borderRadius: '8px', px: 2, fontWeight: 600, textTransform: 'none' }}
            >
              Add Contact Master
            </Button>
            <Button 
              variant="contained" 
              color="primary" 
              disabled={!selectedListRow}
              startIcon={<IconMapPin size={18} />} 
              onClick={() => setDetailsDialogOpen(true)}
              sx={{ borderRadius: '8px', px: 2, fontWeight: 600, textTransform: 'none' }}
            >
              Add Customer Details
            </Button>
          </Stack>
        }
      />

      {/* <AddCustomerDialog key={selectedRow?.id || 'new'} open={dialogOpen} handleClose={handleCloseDialog} initialData={selectedRow} readOnly={isReadOnly} /> */}
      <AddContactDialog open={contactDialogOpen} handleClose={() => setContactDialogOpen(false)} initialGroupName={selectedListRow?.customerName} />
      <AddCustomerDetailsDialog open={detailsDialogOpen} handleClose={() => setDetailsDialogOpen(false)} initialData={selectedListRow} />
      
      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Customer"
        message="Are you sure you want to delete this customer? This action cannot be undone."
        itemName={deleteTargetName}
      />
    </MainCard>
  );
}
