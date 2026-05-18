import { useState, useEffect, useCallback, useMemo } from 'react';
import { Typography, Button, Stack, Tooltip, IconButton } from '@mui/material';
import { IconSettings, IconRefresh, IconCloudUpload } from '@tabler/icons-react';
import axios from 'utils/axios';
import MainCard from 'ui-component/cards/MainCard';
import AddOemMappingDialog from './AddOemMappingDialog';
import BulkUploadDialog from './BulkUploadDialog';
import { format } from 'date-fns';
import { useDispatch, useSelector } from 'react-redux';
import { setFilterConfig } from 'store/slices/search';
import { openSnackbar } from 'store/slices/snackbar';
import ConfirmDeleteDialog from 'ui-component/ConfirmDeleteDialog';
import useKeyboardShortcuts, { shortcutTooltip } from 'hooks/useKeyboardShortcuts';
import { BOSDataTable, BOSExportButton, btnNew } from 'ui-component/bos';
import { API_PATHS } from 'utils/api-constants';

// ==============================|| PRODUCT OEM MAPPING MASTER (BOS SOP COMPLIANT) ||============================== //

const columns = [
  { id: 'index', label: '#', minWidth: 70 },
  { id: 'partNo', label: 'Part No', minWidth: 150, bold: true },
  { id: 'oemPartNo', label: 'OEM Part No', minWidth: 180, bold: true },
  { id: 'oemDescription', label: 'OEM Description', minWidth: 240 },
  { id: 'status', label: 'Status', minWidth: 110, status: true },
  { id: 'createdBy', label: 'CREATED USER', minWidth: 140 },
  { id: 'createdAt', label: 'CREATED DATE', minWidth: 160 },
  { id: 'updatedBy', label: 'UPDATED USER', minWidth: 140 },
  { id: 'updatedAt', label: 'UPDATED DATE', minWidth: 160 }
];

export default function OemMappingMaster() {
  const dispatch = useDispatch();
  const globalQuery = useSelector((state) => state.search.query);
  const globalFilters = useSelector((state) => state.search.filters);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [deleteTargetName, setDeleteTargetName] = useState('');

  // Dispatch starred filter configuration matching Status and Search By
  useEffect(() => {
    const config = [
      {
        id: 'searchBy',
        label: 'Search By',
        type: 'select',
        options: [
          { value: 'All', label: '-Select-' },
          { value: 'partNo', label: 'Part No' },
          { value: 'oemPartNo', label: 'OEM Part No' },
          { value: 'oemDescription', label: 'OEM Description' }
        ],
        defaultValue: 'All',
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

  const fetchMappings = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(API_PATHS.NPD.ITEM_OEM_MAPPING);
      setRows(response.data);
    } catch (error) {
      console.error('Failed to fetch OEM mappings:', error);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMappings(); }, [fetchMappings]);

  const handleOpenAdd = () => { setSelectedRow(null); setIsReadOnly(false); setDialogOpen(true); };
  const handleOpenEdit = (row) => { setSelectedRow(row); setIsReadOnly(false); setDialogOpen(true); };
  const handleCloseDialog = (refresh) => { setDialogOpen(false); if (refresh === true) fetchMappings(); };
  const handleCloseBulkDialog = (refresh) => { setBulkDialogOpen(false); if (refresh === true) fetchMappings(); };

  const handleDeleteClick = (row) => {
    setDeleteTargetId(row.id);
    setDeleteTargetName(row.partNo);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    setDeleteDialogOpen(false);
    try {
      await axios.delete(`${API_PATHS.NPD.ITEM_OEM_MAPPING}/${deleteTargetId}`);
      dispatch(openSnackbar({ open: true, message: 'OEM Mapping deleted successfully!', variant: 'alert', alert: { variant: 'filled' }, severity: 'success', close: false }));
      fetchMappings();
    } catch (error) {
      console.error('Failed to delete mapping:', error);
      dispatch(openSnackbar({ open: true, message: 'Failed to delete mapping.', variant: 'alert', alert: { variant: 'filled' }, severity: 'error', close: false }));
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

      // 2. Search By Column + Global Query Filter
      const searchBy = globalFilters.searchBy || 'All';
      let matchesSearch = true;

      if (globalQuery) {
        const query = globalQuery.toLowerCase();
        if (searchBy === 'partNo') {
          matchesSearch = row.partNo && row.partNo.toLowerCase().includes(query);
        } else if (searchBy === 'oemPartNo') {
          matchesSearch = row.oemPartNo && row.oemPartNo.toLowerCase().includes(query);
        } else if (searchBy === 'oemDescription') {
          matchesSearch = row.oemDescription && row.oemDescription.toLowerCase().includes(query);
        } else {
          // General wildcard search
          matchesSearch = (row.partNo && row.partNo.toLowerCase().includes(query)) ||
            (row.oemPartNo && row.oemPartNo.toLowerCase().includes(query)) ||
            (row.oemDescription && row.oemDescription.toLowerCase().includes(query));
        }
      }

      return matchesStatus && matchesSearch;
    });
  }, [rows, globalQuery, globalFilters]);

  const paginatedRows = useMemo(() => filteredRows.slice(page * size, page * size + size), [filteredRows, page, size]);

  return (
    <MainCard
      title={
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <IconSettings size={24} />
          <Typography variant="h3">Product OEM Mapping</Typography>
        </Stack>
      }
      secondary={
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Tooltip title="Refresh">
            <IconButton onClick={fetchMappings} color="primary" size="small" sx={{ border: '2px solid', borderColor: 'divider', borderRadius: '8px', p: 1, transition: 'all 0.2s', '&:hover': { bgcolor: 'primary.light', transform: 'scale(1.05)' } }}>
              <IconRefresh size={20} />
            </IconButton>
          </Tooltip>
          <BOSExportButton
            data={filteredRows}
            filename="Product_OEM_Mapping"
            columns={[
              { header: 'Part No', key: 'partNo' },
              { header: 'OEM Part No', key: 'oemPartNo' },
              { header: 'OEM Description', key: 'oemDescription' },
              { header: 'Status', key: 'status' },
              { header: 'Created By', key: 'createdBy' },
              { header: 'Created Date', key: 'createdAt' }
            ]}
          />
          <Tooltip title="Bulk OEM Upload">
            <Button
              variant="outlined"
              color="secondary"
              size="medium"
              startIcon={<IconCloudUpload size={18} />}
              onClick={() => setBulkDialogOpen(true)}
              sx={{ textTransform: 'none', borderRadius: '8px', border: '1.5px solid', fontWeight: 600 }}
            >
              Bulk Upload
            </Button>
          </Tooltip>
          <Tooltip title={shortcutTooltip('Create New Mapping', 'Ctrl + N')}>
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

      <AddOemMappingDialog open={dialogOpen} handleClose={handleCloseDialog} initialData={selectedRow} readOnly={isReadOnly} />
      <BulkUploadDialog open={bulkDialogOpen} handleClose={handleCloseBulkDialog} />
      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete OEM Mapping"
        message="Are you sure you want to delete this mapping? This action cannot be undone."
        itemName={deleteTargetName}
      />
    </MainCard>
  );
}
