import { useState, useEffect, useCallback, useMemo } from 'react';
<<<<<<<< HEAD:autonoma-frontend/src/views/npd/Capacity/CapacityMaster.jsx
import { Typography, Button, Stack, Tooltip, IconButton } from '@mui/material';
import { IconSettings, IconRefresh } from '@tabler/icons-react';
========
import { useNavigate } from 'react-router-dom';
import { Typography, Button, Stack, Tooltip, IconButton, useTheme } from '@mui/material';
import { IconFileDownload, IconRefresh, IconUserPlus } from '@tabler/icons-react';
>>>>>>>> origin/chore/repo-cleanup:autonoma-frontend/src/views/sm/SupplierList.jsx
import axios from 'utils/axios';
import MainCard from 'ui-component/cards/MainCard';
import AddCapacityDialog from './AddCapacityDialog';
import { format } from 'date-fns';
import { useDispatch, useSelector } from 'react-redux';
import { setFilterConfig } from 'store/slices/search';
import { openSnackbar } from 'store/slices/snackbar';
<<<<<<<< HEAD:autonoma-frontend/src/views/npd/Capacity/CapacityMaster.jsx
========
import MainCard from 'ui-component/cards/MainCard';
import { exportToExcel } from 'utils/excelExport';
>>>>>>>> origin/chore/repo-cleanup:autonoma-frontend/src/views/sm/SupplierList.jsx
import ConfirmDeleteDialog from 'ui-component/ConfirmDeleteDialog';
import useKeyboardShortcuts, { shortcutTooltip } from 'hooks/useKeyboardShortcuts';
import { BOSDataTable, BOSExportButton, btnNew } from 'ui-component/bos';
import { API_PATHS } from 'utils/api-constants';

// ==============================|| PRODUCT CAPACITY MASTER (BOS SOP COMPLIANT) ||============================== //

const columns = [
<<<<<<<< HEAD:autonoma-frontend/src/views/npd/Capacity/CapacityMaster.jsx
  { id: 'index', label: '#', minWidth: 70 },
  { id: 'uom', label: 'UOM', minWidth: 120, bold: true },
  { id: 'capacityVal', label: 'Capacity', minWidth: 150, bold: true },
  { id: 'model.modelNo', label: 'Model Name', minWidth: 180 },
  { id: 'createdBy', label: 'CREATED USER', minWidth: 140 },
  { id: 'createdAt', label: 'CREATED DATE', minWidth: 160 },
  { id: 'updatedBy', label: 'UPDATED USER', minWidth: 140 },
  { id: 'updatedAt', label: 'UPDATED DATE', minWidth: 160 }
========
  { id: 'index', label: '#', minWidth: 50 },
  { id: 'gstNo', label: 'GST No', minWidth: 150 },
  { id: 'supplierCode', label: 'Supplier Code', minWidth: 120 },
  { id: 'supplierName', label: 'Supplier Name', minWidth: 200, bold: true },
  { id: 'supplierPrintName', label: 'Print Name', minWidth: 200 },
  { id: 'shortName', label: 'Short Name', minWidth: 120 },
  { id: 'contactPerson', label: 'Contact Person', minWidth: 150 },
  { id: 'mobileNo', label: 'Mobile No', minWidth: 120 },
  { id: 'city', label: 'City', minWidth: 120 },
  { id: 'state', label: 'State', minWidth: 120 },
  { id: 'isoNo', label: 'ISO No', minWidth: 120 },
  { id: 'approvedSupplier', label: 'Approved', minWidth: 100 },
  { id: 'status', label: 'Status', minWidth: 100 }
>>>>>>>> origin/chore/repo-cleanup:autonoma-frontend/src/views/sm/SupplierList.jsx
];

export default function CapacityMaster() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const globalQuery = useSelector((state) => state.search.query);
  const globalFilters = useSelector((state) => state.search.filters);

  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [deleteTargetName, setDeleteTargetName] = useState('');
  const [selectedListRow, setSelectedListRow] = useState(null);
  const theme = useTheme();

  // Dispatch starred filter configuration matching Capacity
  useEffect(() => {
    const config = [
<<<<<<<< HEAD:autonoma-frontend/src/views/npd/Capacity/CapacityMaster.jsx
      {
        id: 'capacityValueContains',
        label: 'Capacity Contains',
        type: 'text',
        defaultValue: '',
        isStarred: true
      }
========
      { id: 'supplierName', label: 'Supplier Name', type: 'text', placeholder: 'Search by Name...' },
      { id: 'gstNo', label: 'GST No', type: 'text', placeholder: 'Search by GST No...' },
      { id: 'supplierPrintName', label: 'Print Name', type: 'text', placeholder: 'Search by Print Name...' }
>>>>>>>> origin/chore/repo-cleanup:autonoma-frontend/src/views/sm/SupplierList.jsx
    ];
    dispatch(setFilterConfig(config));
    return () => dispatch(setFilterConfig(null));
  }, [dispatch]);

  const fetchCapacities = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(API_PATHS.NPD.ITEM_CAPACITY);
      setRows(response.data);
    } catch (error) {
<<<<<<<< HEAD:autonoma-frontend/src/views/npd/Capacity/CapacityMaster.jsx
      console.error('Failed to fetch Capacities:', error);
      setRows([]);
========
      console.error('Failed to fetch suppliers:', error);
>>>>>>>> origin/chore/repo-cleanup:autonoma-frontend/src/views/sm/SupplierList.jsx
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCapacities(); }, [fetchCapacities]);

<<<<<<<< HEAD:autonoma-frontend/src/views/npd/Capacity/CapacityMaster.jsx
  const handleOpenAdd = () => { setSelectedRow(null); setIsReadOnly(false); setDialogOpen(true); };
  const handleOpenEdit = (row) => { setSelectedRow(row); setIsReadOnly(false); setDialogOpen(true); };
  const handleCloseDialog = (refresh) => { setDialogOpen(false); if (refresh === true) fetchCapacities(); };
========
  const handleOpenAdd = () => { navigate('/sm/suppliers/create'); };
  const handleOpenEdit = (row) => { navigate(`/sm/suppliers/edit/${row.id}`); };

  const handleRowClick = (row) => {
    if (selectedListRow?.id === row.id) {
      setSelectedListRow(null);
    } else {
      setSelectedListRow(row);
    }
  };
>>>>>>>> origin/chore/repo-cleanup:autonoma-frontend/src/views/sm/SupplierList.jsx

  const handleDeleteClick = (row) => {
    setDeleteTargetId(row.id);
    setDeleteTargetName(row.capacityVal ? `${row.capacityVal} ${row.uom}` : 'Capacity');
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    setDeleteDialogOpen(false);
    try {
      await axios.delete(`${API_PATHS.NPD.ITEM_CAPACITY}/${deleteTargetId}`);
      dispatch(openSnackbar({ open: true, message: 'Capacity deleted successfully!', variant: 'alert', alert: { variant: 'filled' }, severity: 'success', close: false }));
      fetchCapacities();
    } catch (error) {
      console.error('Failed to delete capacity:', error);
      dispatch(openSnackbar({ open: true, message: 'Failed to delete capacity.', variant: 'alert', alert: { variant: 'filled' }, severity: 'error', close: false }));
    }
  };

  useKeyboardShortcuts({
    'ctrl+n': handleOpenAdd
  });

<<<<<<<< HEAD:autonoma-frontend/src/views/npd/Capacity/CapacityMaster.jsx
  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      // 1. Capacity Contains Text Filter
      const capacityValueContains = globalFilters.capacityValueContains || '';
      const matchesCapacityValueContains = !capacityValueContains ||
        (row.capacityVal && String(row.capacityVal).includes(capacityValueContains)) ||
        (row.uom && row.uom.toLowerCase().includes(capacityValueContains.toLowerCase()));

      // 2. Search query
      const matchesSearch = !globalQuery ||
        (row.capacityVal && String(row.capacityVal).includes(globalQuery)) ||
        (row.uom && row.uom.toLowerCase().includes(globalQuery.toLowerCase())) ||
        (row.model && row.model.modelNo && row.model.modelNo.toLowerCase().includes(globalQuery.toLowerCase()));

      return matchesCapacityValueContains && matchesSearch;
========
  const handleExport = () => {
    const exportData = filteredRows.map((r, i) => ({
      '#': i + 1,
      'GST No': r.gstNo,
      'Supplier Code': r.supplierCode,
      'Supplier Name': r.supplierName,
      'Print Name': r.supplierPrintName,
      'Short Name': r.shortName,
      'Contact Person': r.contactPerson,
      'Mobile No': r.mobileNo,
      'Email': r.emailId,
      'City': r.city,
      'State': r.state,
      'Country': r.country,
      'ISO No': r.isoNo,
      'ISO Expiry': r.isoExpiryDate,
      'Approved': r.approvedSupplier,
      'NDA Required': r.ndaRequired,
      'Currency': r.currency,
      'Payment Terms': r.paymentTerms,
      'Delivery Terms': r.deliveryTerms,
      'Status': r.status
    }));
    exportToExcel(exportData, 'Supplier_Master');
  };

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const nameFilter = (globalFilters.supplierName || '').toLowerCase();
      const gstFilter = (globalFilters.gstNo || '').toLowerCase();
      const printFilter = (globalFilters.supplierPrintName || '').toLowerCase();
      
      const matchesName = !nameFilter || (row.supplierName && row.supplierName.toLowerCase().includes(nameFilter));
      const matchesGst = !gstFilter || (row.gstNo && row.gstNo.toLowerCase().includes(gstFilter));
      const matchesPrint = !printFilter || (row.supplierPrintName && row.supplierPrintName.toLowerCase().includes(printFilter));
      
      const q = (globalQuery || '').toLowerCase();
      const matchesSearch = !q ||
        (row.supplierName && row.supplierName.toLowerCase().includes(q)) ||
        (row.gstNo && row.gstNo.toLowerCase().includes(q)) ||
        (row.supplierPrintName && row.supplierPrintName.toLowerCase().includes(q)) ||
        (row.shortName && row.shortName.toLowerCase().includes(q));

      return matchesName && matchesGst && matchesPrint && matchesSearch;
>>>>>>>> origin/chore/repo-cleanup:autonoma-frontend/src/views/sm/SupplierList.jsx
    });
  }, [rows, globalQuery, globalFilters]);

  const paginatedRows = useMemo(() => filteredRows.slice(page * size, page * size + size), [filteredRows, page, size]);

  return (
    <MainCard
      title={
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <IconSettings size={24} />
          <Typography variant="h3">Product Capacity Master</Typography>
        </Stack>
      }
      secondary={
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Tooltip title="Refresh">
            <IconButton onClick={fetchCapacities} color="primary" size="small" sx={{ border: '2px solid', borderColor: 'divider', borderRadius: '8px', p: 1, transition: 'all 0.2s', '&:hover': { bgcolor: 'primary.light', transform: 'scale(1.05)' } }}>
              <IconRefresh size={20} />
            </IconButton>
          </Tooltip>
          <BOSExportButton
            data={filteredRows}
            filename="Product_Capacity_Master"
            columns={[
              { header: 'UOM', key: 'uom' },
              { header: 'Capacity', key: 'capacityVal' },
              { header: 'Model Name', key: 'model.modelNo' },
              { header: 'Created By', key: 'createdBy' },
              { header: 'Created Date', key: 'createdAt' }
            ]}
          />
          <Tooltip title={shortcutTooltip('Create New Capacity', 'Ctrl + N')}>
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
<<<<<<<< HEAD:autonoma-frontend/src/views/npd/Capacity/CapacityMaster.jsx

      <AddCapacityDialog open={dialogOpen} handleClose={handleCloseDialog} initialData={selectedRow} readOnly={isReadOnly} />
========
      
>>>>>>>> origin/chore/repo-cleanup:autonoma-frontend/src/views/sm/SupplierList.jsx
      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Capacity details"
        message="Are you sure you want to delete this Capacity? This action cannot be undone."
        itemName={deleteTargetName}
      />
    </MainCard>
  );
}
