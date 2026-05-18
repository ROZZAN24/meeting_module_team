import { useState, useEffect, useCallback, useMemo } from 'react';
import { Typography, Button, Stack, Tooltip, IconButton } from '@mui/material';
import { IconFolders, IconRefresh } from '@tabler/icons-react';
import axios from 'utils/axios';
import MainCard from 'ui-component/cards/MainCard';
import AddItemSubtypeDialog from './AddItemSubtypeDialog';
import { format } from 'date-fns';
import { useDispatch, useSelector } from 'react-redux';
import { setFilterConfig } from 'store/slices/search';
import { openSnackbar } from 'store/slices/snackbar';
import ConfirmDeleteDialog from 'ui-component/ConfirmDeleteDialog';
import useKeyboardShortcuts, { shortcutTooltip } from 'hooks/useKeyboardShortcuts';
import { BOSDataTable, BOSExportButton, btnNew } from 'ui-component/bos';
import { API_PATHS } from 'utils/api-constants';

// ==============================|| PRODUCT ITEM SUB TYPE MASTER (BOS SOP COMPLIANT) ||============================== //

const columns = [
  { id: 'index', label: '#', minWidth: 70 },
  { id: 'itemType', label: 'Item Type', minWidth: 180, bold: true },
  { id: 'subType', label: 'Sub Type', minWidth: 200, bold: true },
  { id: 'createdBy', label: 'CREATED USER', minWidth: 120 },
  { id: 'createdAt', label: 'CREATED DATE', minWidth: 150 },
  { id: 'updatedBy', label: 'UPDATED USER', minWidth: 120 },
  { id: 'updatedAt', label: 'UPDATED DATE', minWidth: 150 }
];

export default function ItemSubtypeMaster() {
  const dispatch = useDispatch();
  const globalQuery = useSelector((state) => state.search.query);
  const globalFilters = useSelector((state) => state.search.filters);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [rows, setRows] = useState([]);
  const [types, setTypes] = useState([]);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [deleteTargetName, setDeleteTargetName] = useState('');

  // Fetch Item Types to populate dynamic starred filter
  useEffect(() => {
    const fetchTypes = async () => {
      try {
        const response = await axios.get(API_PATHS.NPD.ITEM_TYPE);
        setTypes(response.data);
      } catch (error) {
        console.error('Failed to fetch types for filter config:', error);
      }
    };
    fetchTypes();
  }, []);

  // Dispatch standard starred filter configs
  useEffect(() => {
    const typeOptions = [
      { value: 'All', label: 'ALL' },
      ...types.map(t => ({ value: t.id.toString(), label: t.itemType }))
    ];

    const config = [
      {
        id: 'typeId', label: 'Item Type', type: 'select',
        options: typeOptions,
        defaultValue: 'All',
        isStarred: true
      },
      {
        id: 'status', label: 'Status', type: 'select',
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
  }, [dispatch, types]);

  const fetchItemSubtypes = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(API_PATHS.NPD.ITEM_SUBTYPE);
      setRows(response.data);
    } catch (error) {
      console.error('Failed to fetch item subtypes:', error);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchItemSubtypes(); }, [fetchItemSubtypes]);

  const handleOpenAdd = () => { setSelectedRow(null); setIsReadOnly(false); setDialogOpen(true); };
  const handleOpenEdit = (row) => { setSelectedRow(row); setIsReadOnly(false); setDialogOpen(true); };
  const handleCloseDialog = (refresh) => { setDialogOpen(false); if (refresh === true) fetchItemSubtypes(); };

  const handleDeleteClick = (row) => {
    setDeleteTargetId(row.id);
    setDeleteTargetName(row.subType);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    setDeleteDialogOpen(false);
    try {
      await axios.delete(`${API_PATHS.NPD.ITEM_SUBTYPE}/${deleteTargetId}`);
      dispatch(openSnackbar({ open: true, message: 'Item Sub Type deleted successfully!', variant: 'alert', alert: { variant: 'filled' }, severity: 'success', close: false }));
      fetchItemSubtypes();
    } catch (error) {
      console.error('Failed to delete item subtype:', error);
      dispatch(openSnackbar({ open: true, message: 'Failed to delete item subtype.', variant: 'alert', alert: { variant: 'filled' }, severity: 'error', close: false }));
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

      // 2. Item Type Filter
      const typeFilter = globalFilters.typeId || 'All';
      const matchesType = typeFilter === 'All' || (row.type?.id && row.type.id.toString() === typeFilter);

      // 3. Search query
      const matchesSearch = !globalQuery ||
        (row.subType && row.subType.toLowerCase().includes(globalQuery.toLowerCase())) ||
        (row.type?.itemType && row.type.itemType.toLowerCase().includes(globalQuery.toLowerCase())) ||
        (row.subItemPrefix && row.subItemPrefix.toLowerCase().includes(globalQuery.toLowerCase()));

      return matchesStatus && matchesType && matchesSearch;
    });
  }, [rows, globalQuery, globalFilters]);

  // Map rows for correct table display
  const mappedRows = useMemo(() => {
    return filteredRows.map(r => ({
      ...r,
      itemType: r.type?.itemType || ''
    }));
  }, [filteredRows]);

  const paginatedRows = useMemo(() => mappedRows.slice(page * size, page * size + size), [mappedRows, page, size]);

  return (
    <MainCard
      title={
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <IconFolders size={24} />
          <Typography variant="h3">Product Item Sub Type Master</Typography>
        </Stack>
      }
      secondary={
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Tooltip title="Refresh">
            <IconButton onClick={fetchItemSubtypes} color="primary" size="small" sx={{ border: '2px solid', borderColor: 'divider', borderRadius: '8px', p: 1, transition: 'all 0.2s', '&:hover': { bgcolor: 'primary.light', transform: 'scale(1.05)' } }}>
              <IconRefresh size={20} />
            </IconButton>
          </Tooltip>
          <BOSExportButton
            data={mappedRows}
            filename="Product_Item_Sub_Type_Master"
            columns={[
              { header: 'Item Type', key: 'itemType' },
              { header: 'Sub Type', key: 'subType' },
              { header: 'Sub Item Prefix', key: 'subItemPrefix' },
              { header: 'Is Auto Generate Code', key: 'isAutoGenerateCode' },
              { header: 'Prefix Based', key: 'prefixBased' },
              { header: 'Status', key: 'status' }
            ]}
          />
          <Tooltip title={shortcutTooltip('Create New Item Sub Type', 'Ctrl + N')}>
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

      <AddItemSubtypeDialog open={dialogOpen} handleClose={handleCloseDialog} initialData={selectedRow} readOnly={isReadOnly} />
      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Item Sub Type"
        message="Are you sure you want to delete this item sub type? This action cannot be undone."
        itemName={deleteTargetName}
      />
    </MainCard>
  );
}
