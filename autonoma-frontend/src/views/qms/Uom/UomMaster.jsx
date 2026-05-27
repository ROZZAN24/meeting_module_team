import { useState, useEffect, useCallback, useMemo } from 'react';
import { Typography, Button, Stack, Tooltip, IconButton } from '@mui/material';
import { IconListCheck, IconRefresh } from '@tabler/icons-react';
import axios from 'utils/axios';
import MainCard from 'ui-component/cards/MainCard';
import AddUomDialog from './AddUomDialog';
import { useDispatch, useSelector } from 'react-redux';
import { setFilterConfig } from 'store/slices/search';
import { openSnackbar } from 'store/slices/snackbar';
import ConfirmDeleteDialog from 'ui-component/ConfirmDeleteDialog';
import useKeyboardShortcuts, { shortcutTooltip } from 'hooks/useKeyboardShortcuts';
import { BOSDataTable, BOSExportButton, btnNew } from 'ui-component/bos';
import { API_PATHS } from 'utils/api-constants';

// ==============================|| UOM MASTER (BOS SOP COMPLIANT) ||============================== //

const columns = [
  { id: 'index', label: '#', minWidth: 70 },
  { id: 'uomCode', label: 'UOM Code', minWidth: 180, bold: true },
  { id: 'uomDescription', label: 'Description', minWidth: 220 },
  { id: 'status', label: 'Status', minWidth: 120, status: true },
  { id: 'createdUser', label: 'CREATED USER', minWidth: 140 },
  { id: 'createdAt', label: 'CREATED DATE', minWidth: 160 },
  { id: 'updatedUser', label: 'UPDATED USER', minWidth: 140 },
  { id: 'updatedAt', label: 'UPDATED DATE', minWidth: 160 }
];

export default function UomMaster() {
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

  // Dispatch starred filter configuration matching UOM Code and Status
  useEffect(() => {
    const config = [
      {
        id: 'uomCodeContains',
        label: 'UOM Contains',
        type: 'text',
        defaultValue: '',
        isStarred: true
      },
      {
        id: 'status',
        label: 'Status',
        type: 'select',
        options: [
          { value: 'All', label: 'ALL' },
          { value: 'ACTIVE', label: 'ACTIVE' },
          { value: 'INACTIVE', label: 'INACTIVE' }
        ],
        defaultValue: 'ACTIVE',
        isStarred: true
      }
    ];
    dispatch(setFilterConfig(config));
    return () => dispatch(setFilterConfig(null));
  }, [dispatch]);

  const fetchUoms = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(API_PATHS.QMS.UOM);
      setRows(response.data);
    } catch (error) {
      console.error('Failed to fetch UOMs:', error);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUoms(); }, [fetchUoms]);

  const handleOpenAdd = () => { setSelectedRow(null); setIsReadOnly(false); setDialogOpen(true); };
  const handleOpenEdit = (row) => { setSelectedRow(row); setIsReadOnly(false); setDialogOpen(true); };
  const handleCloseDialog = (refresh) => { setDialogOpen(false); if (refresh === true) fetchUoms(); };

  const handleDeleteClick = (row) => {
    setDeleteTargetId(row.id);
    setDeleteTargetName(row.uomCode);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    setDeleteDialogOpen(false);
    try {
      await axios.delete(`${API_PATHS.QMS.UOM}/${deleteTargetId}`);
      dispatch(openSnackbar({ open: true, message: 'UOM deleted successfully!', variant: 'alert', alert: { variant: 'filled' }, severity: 'success', close: false }));
      fetchUoms();
    } catch (error) {
      console.error('Failed to delete UOM:', error);
      dispatch(openSnackbar({ open: true, message: 'Failed to delete UOM.', variant: 'alert', alert: { variant: 'filled' }, severity: 'error', close: false }));
    }
  };

  useKeyboardShortcuts({
    'ctrl+n': handleOpenAdd,
    'escape': () => { if (dialogOpen) handleCloseDialog(); }
  });

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      // 1. Status Filter
      const statusFilter = globalFilters.status || 'ACTIVE';
      const matchesStatus = statusFilter === 'All' || row.status === statusFilter;

      // 2. UOM Code Contains Filter
      const uomCodeContains = globalFilters.uomCodeContains || '';
      const matchesUomCodeContains = !uomCodeContains ||
        (row.uomCode && row.uomCode.toLowerCase().includes(uomCodeContains.toLowerCase()));

      // 3. Search query
      const matchesSearch = !globalQuery ||
        (row.uomCode && row.uomCode.toLowerCase().includes(globalQuery.toLowerCase())) ||
        (row.uomDescription && row.uomDescription.toLowerCase().includes(globalQuery.toLowerCase()));

      return matchesStatus && matchesUomCodeContains && matchesSearch;
    }).map((r) => ({
      ...r,
      createdUser: r.createdUser || r.createdBy || '-',
      updatedUser: r.updatedUser || r.updatedBy || '-',
      createdAt: r.createdAt ? new Date(r.createdAt).toLocaleString('en-GB') : '-',
      updatedAt: r.updatedAt ? new Date(r.updatedAt).toLocaleString('en-GB') : '-'
    }));
  }, [rows, globalQuery, globalFilters]);

  const paginatedRows = useMemo(() => filteredRows.slice(page * size, page * size + size), [filteredRows, page, size]);

  return (
    <MainCard
      title={
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <IconListCheck size={24} />
          <Typography variant="h3">UOM Master</Typography>
        </Stack>
      }
      secondary={
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Tooltip title="Refresh">
            <IconButton onClick={fetchUoms} color="primary" size="small" sx={{ border: '2px solid', borderColor: 'divider', borderRadius: '8px', p: 1, transition: 'all 0.2s', '&:hover': { bgcolor: 'primary.light', transform: 'scale(1.05)' } }}>
              <IconRefresh size={20} />
            </IconButton>
          </Tooltip>
          <BOSExportButton
            data={filteredRows}
            filename="UOM_Master"
            columns={[
              { header: 'UOM Code', key: 'uomCode' },
              { header: 'Description', key: 'uomDescription' },
              { header: 'Status', key: 'status' },
              { header: 'Created User', key: 'createdUser' },
              { header: 'Created Date', key: 'createdAt' },
              { header: 'Updated User', key: 'updatedUser' },
              { header: 'Updated Date', key: 'updatedAt' }
            ]}
          />
          <Tooltip title={shortcutTooltip('Create New UOM', 'Ctrl + N')}>
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

      <AddUomDialog open={dialogOpen} handleClose={handleCloseDialog} initialData={selectedRow} readOnly={isReadOnly} />
      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete UOM details"
        message="Are you sure you want to delete this UOM? This action cannot be undone."
        itemName={deleteTargetName}
      />
    </MainCard>
  );
}
