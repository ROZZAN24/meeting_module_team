import { useState, useEffect, useCallback, useMemo } from 'react';
import { Typography, Button, Stack, Tooltip, IconButton } from '@mui/material';
import { IconSettings, IconRefresh } from '@tabler/icons-react';
import axios from 'utils/axios';
import MainCard from 'ui-component/cards/MainCard';
import AddModelDialog from './AddModelDialog';
import { format } from 'date-fns';
import { useDispatch, useSelector } from 'react-redux';
import { setFilterConfig, setFilters } from 'store/slices/search';
import { openSnackbar } from 'store/slices/snackbar';
import ConfirmDeleteDialog from 'ui-component/ConfirmDeleteDialog';
import useKeyboardShortcuts, { shortcutTooltip } from 'hooks/useKeyboardShortcuts';
import { BOSDataTable, btnNew, BOSTableToolbar, getCommonDateFilters, matchCommonDateFilters } from 'ui-component/bos';;
import { API_PATHS } from 'utils/api-constants';
import usePagePermissions, { PAGE_CODES } from 'hooks/usePagePermissions';

// ==============================|| PRODUCT MODEL MASTER (BOS SOP COMPLIANT) ||============================== //

const columns = [
  { id: 'index', label: '#', minWidth: 70 },
  { id: 'oem.oemShortName', label: 'OEM Short Name', minWidth: 180, bold: true },
  { id: 'modelNo', label: 'Model No', minWidth: 150, bold: true },
  { id: 'rotorDiameter', label: 'Rotor Diameter (in Meter)', minWidth: 200 },
  { id: 'status', label: 'Model Status', minWidth: 130, status: true },
  { id: 'createdBy', label: 'CREATED USER', minWidth: 140 },
  { id: 'createdAt', label: 'CREATED DATE', minWidth: 160 },
  { id: 'updatedBy', label: 'UPDATED USER', minWidth: 140 },
  { id: 'updatedAt', label: 'UPDATED DATE', minWidth: 160 }
];

export default function ModelMaster() {
  const dispatch = useDispatch();
  const globalQuery = useSelector((state) => state.search.query);
  const globalFilters = useSelector((state) => state.search.filters);
  const perms = usePagePermissions(PAGE_CODES.NPD_MODEL);

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

  // Dispatch starred filter configuration matching Status, Date range, and Model No
  useEffect(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const config = [{
        id: 'status',
        label: 'Status',
        type: 'select',
        isStarred: true,
        options: [
          { value: 'ALL', label: 'ALL' },
          { value: 'ACTIVE', label: 'ACTIVE' },
          { value: 'INACTIVE', label: 'INACTIVE' }
        ],
        defaultValue: 'ACTIVE'
      },
      { id: 'modelNo', label: 'Model No', type: 'text', placeholder: 'Search model no...', isStarred: true },
      ...getCommonDateFilters('createdAt', 'updatedAt')];
    dispatch(setFilterConfig(config));
    dispatch(setFilters({
      status: 'ACTIVE',
      createdAtStart: today,
      createdAtEnd: today
    }));
    return () => dispatch(setFilterConfig(null));
  }, [dispatch]);

  const fetchModels = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(API_PATHS.NPD.ITEM_MODEL);
      setRows(response.data);
    } catch (error) {
      console.error('Failed to fetch Models:', error);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchModels(); }, [fetchModels]);

  const handleOpenAdd = () => { setSelectedRow(null); setIsReadOnly(false); setDialogOpen(true); };
  const handleOpenEdit = (row) => { setSelectedRow(row); setIsReadOnly(false); setDialogOpen(true); };
  const handleCloseDialog = (refresh) => { setDialogOpen(false); if (refresh === true) fetchModels(); };

  const handleDeleteClick = (row) => {
    setDeleteTargetId(row.id);
    setDeleteTargetName(row.modelNo);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    setDeleteDialogOpen(false);
    try {
      await axios.delete(`${API_PATHS.NPD.ITEM_MODEL}/${deleteTargetId}`);
      dispatch(openSnackbar({ open: true, message: 'Model deleted successfully!', variant: 'alert', alert: { variant: 'filled' }, severity: 'success', close: false }));
      fetchModels();
    } catch (error) {
      console.error('Failed to delete model:', error);
      dispatch(openSnackbar({ open: true, message: 'Failed to delete model.', variant: 'alert', alert: { variant: 'filled' }, severity: 'error', close: false }));
    }
  };

  useKeyboardShortcuts({
    'ctrl+n': handleOpenAdd,
    'escape': () => { if (dialogOpen) handleCloseDialog(); }
  });

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      if (!matchCommonDateFilters(row, globalFilters, 'createdAt', 'updatedAt')) return false;

      // 1. Status Filter
      const statusFilter = globalFilters.status || 'ACTIVE';
      if (statusFilter !== 'ALL' && row.status !== statusFilter) return false;

      // 2. Created Date Range Filter
      const today = format(new Date(), 'yyyy-MM-dd');
      const startDate = globalFilters.createdAtStart || today;
      const endDate = globalFilters.createdAtEnd || today;
      const rowDate = row.createdAt ? format(new Date(row.createdAt), 'yyyy-MM-dd') : '';
      if (rowDate && (rowDate < startDate || rowDate > endDate)) return false;

      // 3. Primary Field (Model No)
      const modelNoFilter = globalFilters.modelNo || '';
      if (modelNoFilter && !(row.modelNo || '').toLowerCase().includes(modelNoFilter.toLowerCase())) return false;

      // 4. Wildcard search query
      const matchesSearch = !globalQuery ||
        (row.modelNo && row.modelNo.toLowerCase().includes(globalQuery.toLowerCase())) ||
        (row.oem && row.oem.oemShortName && row.oem.oemShortName.toLowerCase().includes(globalQuery.toLowerCase()));

      return matchesSearch;
    });
  }, [rows, globalQuery, globalFilters]);

  const paginatedRows = useMemo(() => filteredRows.slice(page * size, page * size + size), [filteredRows, page, size]);

  return (
    <MainCard fullWidth
      title={
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <IconSettings size={24} />
          <Typography variant="h3">Product Model Master</Typography>
        </Stack>
      }
            secondary={
        <BOSTableToolbar
          onRefresh={fetchModels}
          onNew={handleOpenAdd}
          newTooltip={shortcutTooltip('Create New Model', 'Ctrl + N')}
          hasWritePermission={perms.write}
          exportData={filteredRows}
          
          exportFilename="Product_Model_Master"
          hasExportPermission={perms.export}
         columns={columns} />
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
        onEditRow={perms.write ? handleOpenEdit : undefined}
        onDeleteRow={perms.delete ? handleDeleteClick : undefined}
      />

      <AddModelDialog open={dialogOpen} handleClose={handleCloseDialog} initialData={selectedRow} readOnly={isReadOnly} />
      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Model details"
        message="Are you sure you want to delete this Model? This action cannot be undone."
        itemName={deleteTargetName}
      />
    </MainCard>
  );
}
