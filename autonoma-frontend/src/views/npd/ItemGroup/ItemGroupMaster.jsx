import { useState, useEffect, useCallback, useMemo } from 'react';
import { Typography, Button, Stack, Tooltip, IconButton } from '@mui/material';
import { IconCategory, IconRefresh } from '@tabler/icons-react';
import axios from 'utils/axios';
import MainCard from 'ui-component/cards/MainCard';
import AddItemGroupDialog from './AddItemGroupDialog';
import { format } from 'date-fns';
import { useDispatch, useSelector } from 'react-redux';
import { setFilterConfig, setFilters } from 'store/slices/search';
import { openSnackbar } from 'store/slices/snackbar';
import ConfirmDeleteDialog from 'ui-component/ConfirmDeleteDialog';
import useKeyboardShortcuts, { shortcutTooltip } from 'hooks/useKeyboardShortcuts';
import { BOSDataTable, btnNew, BOSTableToolbar, getCommonDateFilters, matchCommonDateFilters } from 'ui-component/bos';;
import { API_PATHS } from 'utils/api-constants';
import usePagePermissions, { PAGE_CODES } from 'hooks/usePagePermissions';

// ==============================|| PRODUCT ITEM GROUP MASTER (BOS SOP COMPLIANT) ||============================== //

const columns = [
  { id: 'index', label: '#', minWidth: 50 },
  { id: 'groupName', label: 'Product Item Group', minWidth: 200, bold: true },
  { id: 'description', label: 'Group Description', minWidth: 300 },
  { id: 'createdBy', label: 'CREATED USER', minWidth: 120 },
  { id: 'createdAt', label: 'CREATED DATE', minWidth: 150 },
  { id: 'updatedBy', label: 'UPDATED USER', minWidth: 120 },
  { id: 'updatedAt', label: 'UPDATED DATE', minWidth: 150 },
  { id: 'status', label: 'Status', minWidth: 100, status: true }
];

export default function ItemGroupMaster() {
  const dispatch = useDispatch();
  const globalQuery = useSelector((state) => state.search.query);
  const globalFilters = useSelector((state) => state.search.filters);
  const perms = usePagePermissions(PAGE_CODES.NPD_ITEM_GROUP);

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
      { id: 'groupName', label: 'Product Item Group', type: 'text', placeholder: 'Search product item group...', isStarred: true },
      ...getCommonDateFilters('createdAt', 'updatedAt')];
    dispatch(setFilterConfig(config));
    dispatch(setFilters({
      status: 'ACTIVE',
      createdAtStart: today,
      createdAtEnd: today
    }));
    return () => dispatch(setFilterConfig(null));
  }, [dispatch]);

  const fetchItemGroups = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(API_PATHS.NPD.ITEM_GROUP);
      setRows(response.data);
    } catch (error) {
      console.error('Failed to fetch item groups:', error);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchItemGroups(); }, [fetchItemGroups]);

  const handleOpenAdd = () => { setSelectedRow(null); setIsReadOnly(false); setDialogOpen(true); };
  const handleOpenEdit = (row) => { setSelectedRow(row); setIsReadOnly(false); setDialogOpen(true); };
  const handleCloseDialog = (refresh) => { setDialogOpen(false); if (refresh === true) fetchItemGroups(); };

  const handleDeleteClick = (row) => {
    setDeleteTargetId(row.id);
    setDeleteTargetName(row.groupName);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    setDeleteDialogOpen(false);
    try {
      await axios.delete(`${API_PATHS.NPD.ITEM_GROUP}/${deleteTargetId}`);
      dispatch(openSnackbar({ open: true, message: 'Item Group deleted successfully!', variant: 'alert', alert: { variant: 'filled' }, severity: 'success', close: false }));
      fetchItemGroups();
    } catch (error) {
      console.error('Failed to delete item group:', error);
      dispatch(openSnackbar({ open: true, message: 'Failed to delete item group.', variant: 'alert', alert: { variant: 'filled' }, severity: 'error', close: false }));
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

      // 3. Primary Field (Product Item Group)
      const groupNameFilter = globalFilters.groupName || '';
      if (groupNameFilter && !(row.groupName || '').toLowerCase().includes(groupNameFilter.toLowerCase())) return false;

      // 4. Wildcard Query Search
      const matchesSearch = !globalQuery ||
        (row.groupName && row.groupName.toLowerCase().includes(globalQuery.toLowerCase())) ||
        (row.description && row.description.toLowerCase().includes(globalQuery.toLowerCase()));

      return matchesSearch;
    });
  }, [rows, globalQuery, globalFilters]);

  const paginatedRows = useMemo(() => filteredRows.slice(page * size, page * size + size), [filteredRows, page, size]);

  return (
    <MainCard fullWidth
      title={
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <IconCategory size={24} />
          <Typography variant="h3">Product Item Group Master</Typography>
        </Stack>
      }
            secondary={
        <BOSTableToolbar
          onRefresh={fetchItemGroups}
          onNew={handleOpenAdd}
          newTooltip={shortcutTooltip('Create New Item Group', 'Ctrl + N')}
          hasWritePermission={perms.write}
          exportData={filteredRows}
          
          exportFilename="Product_Item_Group_Master"
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

      <AddItemGroupDialog open={dialogOpen} handleClose={handleCloseDialog} initialData={selectedRow} readOnly={isReadOnly} />
      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Item Group"
        message="Are you sure you want to delete this item group? This action cannot be undone."
        itemName={deleteTargetName}
      />
    </MainCard>
  );
}
