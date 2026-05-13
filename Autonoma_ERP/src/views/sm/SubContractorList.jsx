import { useState, useEffect, useCallback, useMemo } from 'react';
import { Typography, Button, Stack, Tooltip, IconButton } from '@mui/material';
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

// ==============================|| SM - SUB CONTRACTOR LIST (BOS SOP COMPLIANT) ||============================== //

const columns = [
  { id: 'index', label: '#', minWidth: 50 },
  { id: 'contractorCode', label: 'Code', minWidth: 100, bold: true },
  { id: 'contractorName', label: 'Contractor Name', minWidth: 200 },
  { id: 'contactPerson', label: 'Contact Person', minWidth: 150 },
  { id: 'email', label: 'Email', minWidth: 180 },
  { id: 'phone', label: 'Phone', minWidth: 120 },
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

  useEffect(() => {
    const config = [
      { id: 'contractorName', label: 'Contractor Name', type: 'text', placeholder: 'Search by Name...' },
      { id: 'contractorCode', label: 'Contractor Code', type: 'text', placeholder: 'Search by Code...' }
    ];
    dispatch(setFilterConfig(config));
    return () => dispatch(setFilterConfig(null));
  }, [dispatch]);

  const fetchContractors = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/sm/sub-contractors');
      setRows(response.data);
    } catch (error) {
      console.error('Failed to fetch sub-contractors:', error);
      // Fallback for missing endpoint
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchContractors(); }, [fetchContractors]);

  const handleOpenAdd = () => { setSelectedRow(null); setIsReadOnly(false); setDialogOpen(true); };
  const handleOpenEdit = (row) => { setSelectedRow(row); setIsReadOnly(false); setDialogOpen(true); };
  const handleCloseDialog = (refresh) => { setDialogOpen(false); if (refresh === true) fetchContractors(); };

  const handleDeleteClick = (row) => {
    setDeleteTargetId(row.id);
    setDeleteTargetName(row.contractorName);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    setDeleteDialogOpen(false);
    try {
      await axios.delete(`/api/sm/sub-contractors/${deleteTargetId}`);
      dispatch(openSnackbar({ open: true, message: 'Sub Contractor deleted successfully!', variant: 'alert', alert: { variant: 'filled' }, severity: 'success', close: false }));
      fetchContractors();
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
      'Code': r.contractorCode,
      'Name': r.contractorName,
      'Contact': r.contactPerson,
      'Email': r.email,
      'Phone': r.phone,
      'Address': r.address,
      'GST': r.gstNo,
      'Status': r.status
    }));
    exportToExcel(exportData, 'Sub_Contractor_Master');
  };

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const nameFilter = globalFilters.contractorName || '';
      const codeFilter = globalFilters.contractorCode || '';
      const matchesName = !nameFilter || (row.contractorName && row.contractorName.toLowerCase().includes(nameFilter.toLowerCase()));
      const matchesCode = !codeFilter || (row.contractorCode && row.contractorCode.toLowerCase().includes(codeFilter.toLowerCase()));
      const matchesSearch = !globalQuery ||
        (row.contractorName && row.contractorName.toLowerCase().includes(globalQuery.toLowerCase())) ||
        (row.contractorCode && row.contractorCode.toLowerCase().includes(globalQuery.toLowerCase()));
      return matchesName && matchesCode && matchesSearch;
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
            <IconButton onClick={fetchContractors} color="primary" size="small" sx={{
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
        onEditRow={handleOpenEdit}
        onDeleteRow={handleDeleteClick}
      />

      <AddSubContractorDialog open={dialogOpen} handleClose={handleCloseDialog} initialData={selectedRow} readOnly={isReadOnly} />
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
