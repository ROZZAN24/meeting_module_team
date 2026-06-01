import { useState, useEffect, useCallback, useMemo } from 'react';
import { Typography, Button, Stack, Tooltip, IconButton } from '@mui/material';
import { IconPackage, IconRefresh } from '@tabler/icons-react';
import axios from 'utils/axios';
import MainCard from 'ui-component/cards/MainCard';
import AddItemTypeDialog from './AddItemTypeDialog';
import { format } from 'date-fns';
import { useDispatch, useSelector } from 'react-redux';
import { setFilterConfig, setFilters } from 'store/slices/search';
import { openSnackbar } from 'store/slices/snackbar';
import ConfirmDeleteDialog from 'ui-component/ConfirmDeleteDialog';
import useKeyboardShortcuts, { shortcutTooltip } from 'hooks/useKeyboardShortcuts';
import { BOSDataTable, btnNew, BOSTableToolbar } from 'ui-component/bos';
import { API_PATHS } from 'utils/api-constants';
import usePagePermissions, { PAGE_CODES } from 'hooks/usePagePermissions';

// ==============================|| PRODUCT ITEM TYPE MASTER (BOS SOP COMPLIANT) ||============================== //

const columns = [
  { id: 'index', label: 'Row Id', minWidth: 70 },
  { id: 'groupName', label: 'Item Group', minWidth: 150, bold: true },
  { id: 'itemType', label: 'Item Type', minWidth: 150, bold: true },
  { id: 'groupPrefix', label: 'Group Prefix', minWidth: 120 },
  { id: 'itemPrefix', label: 'Item Prefix', minWidth: 120 },
  { id: 'status', label: 'Status', minWidth: 100, status: true },
  { id: 'createdBy', label: 'CREATED USER', minWidth: 120 },
  { id: 'createdAt', label: 'CREATED DATE', minWidth: 150 },
  { id: 'updatedBy', label: 'UPDATED USER', minWidth: 120 },
  { id: 'updatedAt', label: 'UPDATED DATE', minWidth: 150 }
];

export default function ItemTypeMaster() {
  const dispatch = useDispatch();
  const globalQuery = useSelector((state) => state.search.query);
  const globalFilters = useSelector((state) => state.search.filters);
  const perms = usePagePermissions(PAGE_CODES.NPD_ITEM_TYPE);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [rows, setRows] = useState([]);
  const [groups, setGroups] = useState([]);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [deleteTargetName, setDeleteTargetName] = useState('');

  // Fetch Item Groups to populate the dynamic filter
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await axios.get(API_PATHS.NPD.ITEM_GROUP);
        setGroups(response.data);
      } catch (error) {
        console.error('Failed to fetch groups for filter config:', error);
      }
    };
    fetchGroups();
  }, []);

  // Set standard star filters for Item Group, Status, Date range, and Item Type
  useEffect(() => {
    const groupOptions = [
      { value: 'All', label: 'ALL' },
      ...groups.map(g => ({ value: g.id.toString(), label: g.groupName }))
    ];

    const today = format(new Date(), 'yyyy-MM-dd');
    const config = [
      {
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
      { id: 'createdAt', label: 'CREATED DATE', type: 'dateRange', isStarred: true },
      { id: 'itemType', label: 'Item Type', type: 'text', placeholder: 'Search item type...', isStarred: true },
      {
        id: 'groupId', label: 'Item Group', type: 'select',
        options: groupOptions,
        defaultValue: 'All'
      }
    ];
    dispatch(setFilterConfig(config));
    dispatch(setFilters({
      status: 'ACTIVE',
      createdAtStart: today,
      createdAtEnd: today,
      groupId: 'All'
    }));
    return () => dispatch(setFilterConfig(null));
  }, [dispatch, groups]);

  const fetchItemTypes = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(API_PATHS.NPD.ITEM_TYPE);
      setRows(response.data);
    } catch (error) {
      console.error('Failed to fetch item types:', error);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchItemTypes(); }, [fetchItemTypes]);

  const handleOpenAdd = () => { setSelectedRow(null); setIsReadOnly(false); setDialogOpen(true); };
  const handleOpenEdit = (row) => { setSelectedRow(row); setIsReadOnly(false); setDialogOpen(true); };
  const handleCloseDialog = (refresh) => { setDialogOpen(false); if (refresh === true) fetchItemTypes(); };

  const handleDeleteClick = (row) => {
    setDeleteTargetId(row.id);
    setDeleteTargetName(row.itemType);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    setDeleteDialogOpen(false);
    try {
      await axios.delete(`${API_PATHS.NPD.ITEM_TYPE}/${deleteTargetId}`);
      dispatch(openSnackbar({ open: true, message: 'Item Type deleted successfully!', variant: 'alert', alert: { variant: 'filled' }, severity: 'success', close: false }));
      fetchItemTypes();
    } catch (error) {
      console.error('Failed to delete item type:', error);
      dispatch(openSnackbar({ open: true, message: 'Failed to delete item type.', variant: 'alert', alert: { variant: 'filled' }, severity: 'error', close: false }));
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
      if (statusFilter !== 'ALL' && row.status !== statusFilter) return false;

      // 2. Created Date Range Filter
      const today = format(new Date(), 'yyyy-MM-dd');
      const startDate = globalFilters.createdAtStart || today;
      const endDate = globalFilters.createdAtEnd || today;
      const rowDate = row.createdAt ? format(new Date(row.createdAt), 'yyyy-MM-dd') : '';
      if (rowDate && (rowDate < startDate || rowDate > endDate)) return false;

      // 3. Primary Field (Item Type)
      const itemTypeFilter = globalFilters.itemType || '';
      if (itemTypeFilter && !(row.itemType || '').toLowerCase().includes(itemTypeFilter.toLowerCase())) return false;

      // 4. Item Group Filter
      const groupFilter = globalFilters.groupId || 'All';
      const matchesGroup = groupFilter === 'All' || (row.group?.id && row.group.id.toString() === groupFilter);
      if (!matchesGroup) return false;

      // 5. Wildcard Search query
      const matchesSearch = !globalQuery ||
        (row.itemType && row.itemType.toLowerCase().includes(globalQuery.toLowerCase())) ||
        (row.group?.groupName && row.group.groupName.toLowerCase().includes(globalQuery.toLowerCase())) ||
        (row.groupPrefix && row.groupPrefix.toLowerCase().includes(globalQuery.toLowerCase())) ||
        (row.itemPrefix && row.itemPrefix.toLowerCase().includes(globalQuery.toLowerCase()));

      return matchesSearch;
    });
  }, [rows, globalQuery, globalFilters]);

  // Transform rows for rendering in standard table layout
  const mappedRows = useMemo(() => {
    return filteredRows.map(r => ({
      ...r,
      groupName: r.group?.groupName || ''
    }));
  }, [filteredRows]);

  const paginatedRows = useMemo(() => mappedRows.slice(page * size, page * size + size), [mappedRows, page, size]);

  return (
    <MainCard
      title={
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <IconPackage size={24} />
          <Typography variant="h3">Product Item Type Master</Typography>
        </Stack>
      }
            secondary={
        <BOSTableToolbar
          onRefresh={fetchItemTypes}
          onNew={handleOpenAdd}
          newTooltip={shortcutTooltip('Create New Item Type', 'Ctrl + N')}
          hasWritePermission={perms.write}
          exportData={mappedRows}
          exportColumns={[
            { header: 'Item Group', key: 'groupName' },
            { header: 'Item Type', key: 'itemType' },
            { header: 'Group Prefix', key: 'groupPrefix' },
            { header: 'Item Prefix', key: 'itemPrefix' },
            { header: 'Is Auto Generate Code', key: 'isAutoGenerateCode' },
            { header: 'Prefix Based', key: 'prefixBased' },
            { header: 'Status', key: 'status' }
          ]}
          exportFilename="Product_Item_Type_Master"
          hasExportPermission={perms.export}
        />
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

      <AddItemTypeDialog open={dialogOpen} handleClose={handleCloseDialog} initialData={selectedRow} readOnly={isReadOnly} />
      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Item Type"
        message="Are you sure you want to delete this item type? This action cannot be undone."
        itemName={deleteTargetName}
      />
    </MainCard>
  );
}
