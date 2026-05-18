import { useState, useEffect, useCallback, useMemo } from 'react';
<<<<<<<< HEAD:autonoma-frontend/src/views/npd/WindFarm/WindFarmMaster.jsx
import { Typography, Button, Stack, Tooltip, IconButton } from '@mui/material';
import { IconRocket, IconRefresh } from '@tabler/icons-react';
========
import { useNavigate } from 'react-router-dom';
import { Typography, Button, Stack, Tooltip, IconButton, useTheme } from '@mui/material';
import { IconFileDownload, IconRefresh, IconUserPlus } from '@tabler/icons-react';
>>>>>>>> origin/chore/repo-cleanup:autonoma-frontend/Autonoma_ERP/src/views/sm/SupplierList.jsx
import axios from 'utils/axios';
import MainCard from 'ui-component/cards/MainCard';
import AddWindFarmDialog from './AddWindFarmDialog';
import { useDispatch, useSelector } from 'react-redux';
import { setFilterConfig } from 'store/slices/search';
import { openSnackbar } from 'store/slices/snackbar';
<<<<<<<< HEAD:autonoma-frontend/src/views/npd/WindFarm/WindFarmMaster.jsx
========
import MainCard from 'ui-component/cards/MainCard';
import { exportToExcel } from 'utils/excelExport';
>>>>>>>> origin/chore/repo-cleanup:autonoma-frontend/Autonoma_ERP/src/views/sm/SupplierList.jsx
import ConfirmDeleteDialog from 'ui-component/ConfirmDeleteDialog';
import useKeyboardShortcuts, { shortcutTooltip } from 'hooks/useKeyboardShortcuts';
import { BOSDataTable, BOSExportButton, btnNew } from 'ui-component/bos';
import { API_PATHS } from 'utils/api-constants';

// ==============================|| WIND FARM MASTER (BOS SOP COMPLIANT) ||============================== //

const columns = [
<<<<<<<< HEAD:autonoma-frontend/src/views/npd/WindFarm/WindFarmMaster.jsx
  { id: 'index', label: '#', minWidth: 70 },
  { id: 'windFarmName', label: 'Wind Farm Name', minWidth: 180, bold: true },
  { id: 'city', label: 'City', minWidth: 140 },
  { id: 'state', label: 'State', minWidth: 140 },
  { id: 'country', label: 'Country', minWidth: 140 },
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
>>>>>>>> origin/chore/repo-cleanup:autonoma-frontend/Autonoma_ERP/src/views/sm/SupplierList.jsx
];

export default function WindFarmMaster() {
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

  // Dispatch starred filter configuration matching Wind Farm Search
  useEffect(() => {
    const config = [
<<<<<<<< HEAD:autonoma-frontend/src/views/npd/WindFarm/WindFarmMaster.jsx
      {
        id: 'windFarmNameContains',
        label: 'Wind Farm Contains',
        type: 'text',
        defaultValue: '',
        isStarred: true
      }
========
      { id: 'supplierName', label: 'Supplier Name', type: 'text', placeholder: 'Search by Name...' },
      { id: 'gstNo', label: 'GST No', type: 'text', placeholder: 'Search by GST No...' },
      { id: 'supplierPrintName', label: 'Print Name', type: 'text', placeholder: 'Search by Print Name...' }
>>>>>>>> origin/chore/repo-cleanup:autonoma-frontend/Autonoma_ERP/src/views/sm/SupplierList.jsx
    ];
    dispatch(setFilterConfig(config));
    return () => dispatch(setFilterConfig(null));
  }, [dispatch]);

  const fetchWindFarms = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(API_PATHS.NPD.WIND_FARMS);
      setRows(response.data);
    } catch (error) {
<<<<<<<< HEAD:autonoma-frontend/src/views/npd/WindFarm/WindFarmMaster.jsx
      console.error('Failed to fetch Wind Farms:', error);
      setRows([]);
========
      console.error('Failed to fetch suppliers:', error);
>>>>>>>> origin/chore/repo-cleanup:autonoma-frontend/Autonoma_ERP/src/views/sm/SupplierList.jsx
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchWindFarms(); }, [fetchWindFarms]);

<<<<<<<< HEAD:autonoma-frontend/src/views/npd/WindFarm/WindFarmMaster.jsx
  const handleOpenAdd = () => { setSelectedRow(null); setIsReadOnly(false); setDialogOpen(true); };
  const handleOpenEdit = (row) => { setSelectedRow(row); setIsReadOnly(false); setDialogOpen(true); };
  const handleCloseDialog = (refresh) => { setDialogOpen(false); if (refresh === true) fetchWindFarms(); };
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
>>>>>>>> origin/chore/repo-cleanup:autonoma-frontend/Autonoma_ERP/src/views/sm/SupplierList.jsx

  const handleDeleteClick = (row) => {
    setDeleteTargetId(row.id);
    setDeleteTargetName(row.windFarmName);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    setDeleteDialogOpen(false);
    try {
      await axios.delete(`${API_PATHS.NPD.WIND_FARMS}/${deleteTargetId}`);
      dispatch(openSnackbar({ open: true, message: 'Wind Farm deleted successfully!', variant: 'alert', alert: { variant: 'filled' }, severity: 'success', close: false }));
      fetchWindFarms();
    } catch (error) {
      console.error('Failed to delete Wind Farm:', error);
      dispatch(openSnackbar({ open: true, message: 'Failed to delete Wind Farm.', variant: 'alert', alert: { variant: 'filled' }, severity: 'error', close: false }));
    }
  };

  useKeyboardShortcuts({
    'ctrl+n': handleOpenAdd
  });

<<<<<<<< HEAD:autonoma-frontend/src/views/npd/WindFarm/WindFarmMaster.jsx
  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      // 1. Wind Farm Contains Filter
      const nameFilter = globalFilters.windFarmNameContains || '';
      const matchesName = !nameFilter ||
        (row.windFarmName && row.windFarmName.toLowerCase().includes(nameFilter.toLowerCase()));

      // 2. Global search query
      const matchesSearch = !globalQuery ||
        (row.windFarmName && row.windFarmName.toLowerCase().includes(globalQuery.toLowerCase())) ||
        (row.city && row.city.toLowerCase().includes(globalQuery.toLowerCase())) ||
        (row.state && row.state.toLowerCase().includes(globalQuery.toLowerCase())) ||
        (row.country && row.country.toLowerCase().includes(globalQuery.toLowerCase()));

      return matchesName && matchesSearch;
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
>>>>>>>> origin/chore/repo-cleanup:autonoma-frontend/Autonoma_ERP/src/views/sm/SupplierList.jsx
    });
  }, [rows, globalQuery, globalFilters]);

  const paginatedRows = useMemo(() => filteredRows.slice(page * size, page * size + size), [filteredRows, page, size]);

  return (
    <MainCard
      title={
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <IconRocket size={24} />
          <Typography variant="h3">Wind Farm Master</Typography>
        </Stack>
      }
      secondary={
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Tooltip title="Refresh">
            <IconButton onClick={fetchWindFarms} color="primary" size="small" sx={{ border: '2px solid', borderColor: 'divider', borderRadius: '8px', p: 1, transition: 'all 0.2s', '&:hover': { bgcolor: 'primary.light', transform: 'scale(1.05)' } }}>
              <IconRefresh size={20} />
            </IconButton>
          </Tooltip>
          <BOSExportButton
            data={filteredRows}
            filename="Wind_Farm_Master"
            columns={[
              { header: 'Wind Farm Name', key: 'windFarmName' },
              { header: 'City', key: 'city' },
              { header: 'State', key: 'state' },
              { header: 'Country', key: 'country' },
              { header: 'Created By', key: 'createdBy' },
              { header: 'Created Date', key: 'createdAt' }
            ]}
          />
          <Tooltip title={shortcutTooltip('Create New Wind Farm', 'Ctrl + N')}>
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
<<<<<<<< HEAD:autonoma-frontend/src/views/npd/WindFarm/WindFarmMaster.jsx

      <AddWindFarmDialog open={dialogOpen} handleClose={handleCloseDialog} initialData={selectedRow} readOnly={isReadOnly} />
========
      
>>>>>>>> origin/chore/repo-cleanup:autonoma-frontend/Autonoma_ERP/src/views/sm/SupplierList.jsx
      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Wind Farm details"
        message="Are you sure you want to delete this Wind Farm? This action cannot be undone."
        itemName={deleteTargetName}
      />
    </MainCard>
  );
}
