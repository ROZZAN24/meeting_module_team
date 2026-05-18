import { useState, useEffect, useCallback, useMemo } from 'react';
import { Typography, Button, Stack, Tooltip, IconButton, useTheme } from '@mui/material';
import { IconFileDownload, IconRefresh, IconUserPlus } from '@tabler/icons-react';
import axios from 'utils/axios';
import { useDispatch, useSelector } from 'react-redux';
import { setFilterConfig } from 'store/slices/search';
import { openSnackbar } from 'store/slices/snackbar';
import MainCard from 'ui-component/cards/MainCard';
import AddSubContractorDialog from './AddSubContractorDialog';
import { exportToExcel } from 'utils/excelExport';
import ConfirmDeleteDialog from 'ui-component/ConfirmDeleteDialog';
import useKeyboardShortcuts, { shortcutTooltip } from 'hooks/useKeyboardShortcuts';
import { BOSDataTable, btnExport, btnNew } from 'ui-component/bos';

// ==============================|| SM - SUBCONTRACTOR LIST (BOS SOP COMPLIANT) ||============================== //

const columns = [
  { id: 'index', label: '#', minWidth: 50 },
  { id: 'gstNo', label: 'GST No', minWidth: 150 },
  { id: 'subcontractorCode', label: 'Code', minWidth: 120 },
  { id: 'subcontractorName', label: 'Name', minWidth: 200, bold: true },
  { id: 'subcontractorPrintName', label: 'Print Name', minWidth: 200 },
  { id: 'shortName', label: 'Short Name', minWidth: 120 },
  { id: 'contactPerson', label: 'Contact Person', minWidth: 150 },
  { id: 'mobileNo', label: 'Mobile No', minWidth: 120 },
  { id: 'city', label: 'City', minWidth: 120 },
  { id: 'state', label: 'State', minWidth: 120 },
  { id: 'isoNo', label: 'ISO No', minWidth: 120 },
  { id: 'status', label: 'Status', minWidth: 100 }
];

export default function SubContractorList() {
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
      { id: 'subcontractorName', label: 'Name', type: 'text', placeholder: 'Search by Name...' },
      { id: 'gstNo', label: 'GST No', type: 'text', placeholder: 'Search by GST No...' },
      { id: 'subcontractorPrintName', label: 'Print Name', type: 'text', placeholder: 'Search by Print Name...' }
    ];
    dispatch(setFilterConfig(config));
    return () => dispatch(setFilterConfig(null));
  }, [dispatch]);

  const fetchSubContractors = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/sm/sub-contractors');
      setRows(response.data);
    } catch (error) {
      console.error('Failed to fetch sub contractors:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSubContractors(); }, [fetchSubContractors]);

  const handleOpenAdd = () => { setSelectedRow(null); setIsReadOnly(false); setDialogOpen(true); };
  const handleOpenEdit = (row) => { setSelectedRow(row); setIsReadOnly(false); setDialogOpen(true); };
  const handleCloseDialog = (refresh) => { setDialogOpen(false); if (refresh === true) fetchSubContractors(); };

  const handleRowClick = (row) => {
    if (selectedListRow?.id === row.id) {
      setSelectedListRow(null);
    } else {
      setSelectedListRow(row);
    }
  };

  const handleDeleteClick = (row) => {
    setDeleteTargetId(row.id);
    setDeleteTargetName(row.subcontractorName);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    setDeleteDialogOpen(false);
    try {
      await axios.delete(`/api/sm/sub-contractors/${deleteTargetId}`);
      dispatch(openSnackbar({ open: true, message: 'Sub Contractor deleted successfully!', variant: 'alert', alert: { variant: 'filled' }, severity: 'success', close: false }));
      fetchSubContractors();
    } catch (error) {
      console.error('Failed to delete sub contractor:', error);
      dispatch(openSnackbar({ open: true, message: 'Failed to delete sub contractor.', variant: 'alert', alert: { variant: 'filled' }, severity: 'error', close: false }));
    }
  };

  useKeyboardShortcuts({
    'ctrl+n': handleOpenAdd,
    'escape': () => { if (dialogOpen) handleCloseDialog(); }
  });

  const handleExport = () => {
    const exportData = filteredRows.map((r, i) => ({
      '#': i + 1,
      'GST No': r.gstNo,
      'Sub Contractor Code': r.subcontractorCode,
      'Sub Contractor Name': r.subcontractorName,
      'Print Name': r.subcontractorPrintName,
      'Short Name': r.shortName,
      'Contact Person': r.contactPerson,
      'Mobile No': r.mobileNo,
      'City': r.city,
      'State': r.state,
      'Country': r.country,
      'ISO No': r.isoNo,
      'Status': r.status
    }));
    exportToExcel(exportData, 'SubContractor_Master');
  };

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const nameFilter = (globalFilters.subcontractorName || '').toLowerCase();
      const gstFilter = (globalFilters.gstNo || '').toLowerCase();
      const printFilter = (globalFilters.subcontractorPrintName || '').toLowerCase();
      
      const matchesName = !nameFilter || (row.subcontractorName && row.subcontractorName.toLowerCase().includes(nameFilter));
      const matchesGst = !gstFilter || (row.gstNo && row.gstNo.toLowerCase().includes(gstFilter));
      const matchesPrint = !printFilter || (row.subcontractorPrintName && row.subcontractorPrintName.toLowerCase().includes(printFilter));
      
      const q = (globalQuery || '').toLowerCase();
      const matchesSearch = !q ||
        (row.subcontractorName && row.subcontractorName.toLowerCase().includes(q)) ||
        (row.gstNo && row.gstNo.toLowerCase().includes(q)) ||
        (row.subcontractorPrintName && row.subcontractorPrintName.toLowerCase().includes(q)) ||
        (row.shortName && row.shortName.toLowerCase().includes(q));

      return matchesName && matchesGst && matchesPrint && matchesSearch;
    });
  }, [rows, globalQuery, globalFilters]);

  const paginatedRows = useMemo(() => filteredRows.slice(page * size, page * size + size), [filteredRows, page, size]);

  return (
    <MainCard
      title={
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <IconUserPlus size={24} />
          <Typography variant="h3">Sub Contractor Master</Typography>
        </Stack>
      }
      secondary={
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Tooltip title="Refresh">
            <IconButton onClick={fetchSubContractors} color="primary" size="small" sx={{
              border: '2px solid', borderColor: 'divider', borderRadius: '8px', p: 1,
              transition: 'all 0.2s', '&:hover': { bgcolor: 'primary.light', transform: 'scale(1.05)' }
            }}>
              <IconRefresh size={20} />
            </IconButton>
          </Tooltip>
          <Button variant="outlined" color="primary" size="medium" startIcon={<IconFileDownload size={18} />} onClick={handleExport} sx={btnExport}>
            Export
          </Button>
          <Tooltip title={shortcutTooltip('Create New Sub Contractor', 'Ctrl + N')}>
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

      <AddSubContractorDialog key={selectedRow?.id || 'new'} open={dialogOpen} handleClose={handleCloseDialog} initialData={selectedRow} readOnly={isReadOnly} />
      
      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Sub Contractor"
        message="Are you sure you want to delete this sub contractor? This action cannot be undone."
        itemName={deleteTargetName}
      />
    </MainCard>
  );
}
