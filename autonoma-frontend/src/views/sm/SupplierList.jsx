import { useState, useEffect, useCallback, useMemo } from 'react';
import { Typography, Button, Stack, Tooltip, IconButton } from '@mui/material';
import { IconSettings, IconRefresh } from '@tabler/icons-react';
import axios from 'utils/axios';
import MainCard from 'ui-component/cards/MainCard';
import AddCapacityDialog from './AddCapacityDialog';
import { format } from 'date-fns';
import { useDispatch, useSelector } from 'react-redux';
import { setFilterConfig } from 'store/slices/search';
import { openSnackbar } from 'store/slices/snackbar';
import ConfirmDeleteDialog from 'ui-component/ConfirmDeleteDialog';
import useKeyboardShortcuts, { shortcutTooltip } from 'hooks/useKeyboardShortcuts';
import { BOSDataTable, BOSExportButton, btnNew } from 'ui-component/bos';
import { API_PATHS } from 'utils/api-constants';

// ==============================|| PRODUCT CAPACITY MASTER (BOS SOP COMPLIANT) ||============================== //

const columns = [
  { id: 'index', label: '#', minWidth: 70 },
  { id: 'uom', label: 'UOM', minWidth: 120, bold: true },
  { id: 'capacityVal', label: 'Capacity', minWidth: 150, bold: true },
  { id: 'model.modelNo', label: 'Model Name', minWidth: 180 },
  { id: 'createdBy', label: 'CREATED USER', minWidth: 140 },
  { id: 'createdAt', label: 'CREATED DATE', minWidth: 160 },
  { id: 'updatedBy', label: 'UPDATED USER', minWidth: 140 },
  { id: 'updatedAt', label: 'UPDATED DATE', minWidth: 160 }
];

export default function CapacityMaster() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const globalQuery = useSelector((state) => state.search.query);
  const globalFilters = useSelector((state) => state.search.filters);
>>>>>>> origin/chore/repo-cleanup

  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [deleteTargetName, setDeleteTargetName] = useState('');
  const [selectedListRow, setSelectedListRow] = useState(null);
      {
        id: 'capacityValueContains',
        label: 'Capacity Contains',
        type: 'text',
        defaultValue: '',
        isStarred: true
      }
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
      console.error('Failed to fetch Capacities:', error);
      setRows([]);
>>>>>>> origin/chore/repo-cleanup
    } finally {
      setLoading(false);
    }
  }, []);

  const handleOpenAdd = () => { setSelectedRow(null); setIsReadOnly(false); setDialogOpen(true); };
  const handleOpenEdit = (row) => { setSelectedRow(row); setIsReadOnly(false); setDialogOpen(true); };
  const handleCloseDialog = (refresh) => { setDialogOpen(false); if (refresh === true) fetchCapacities(); };
  const handleOpenAdd = () => { navigate('/sm/suppliers/create'); };
  const handleOpenEdit = (row) => { navigate(`/sm/suppliers/edit/${row.id}`); };

  const handleRowClick = (row) => {
    if (selectedListRow?.id === row.id) {
      setSelectedListRow(null);
    } else {
      setSelectedListRow(row);
    }
  };

  const handleDeleteClick = (row) => {
    setDeleteTargetId(row.id);
    setDeleteTargetName(row.supplierName);

  const handleDeleteClick = (row) => {
    setDeleteTargetId(row.id);
    setDeleteTargetName(row.capacityVal ? `${row.capacityVal} ${row.uom}` : 'Capacity');
>>>>>>> origin/chore/repo-cleanup
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    setDeleteDialogOpen(false);
    try {
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
    });
  }, [rows, globalQuery, globalFilters]);

  const paginatedRows = useMemo(() => filteredRows.slice(page * size, page * size + size), [filteredRows, page, size]);

  return (
    <MainCard
      title={
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <IconSettings size={24} />
          <Typography variant="h3">Product Capacity Master</Typography>
>>>>>>> origin/chore/repo-cleanup
        </Stack>
      }
      secondary={
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Tooltip title="Refresh">
            <IconButton onClick={fetchSuppliers} color="primary" size="small" sx={{
              border: '2px solid', borderColor: 'divider', borderRadius: '8px', p: 1,
              transition: 'all 0.2s', '&:hover': { bgcolor: 'primary.light', transform: 'scale(1.05)' }
            }}>
              <IconRefresh size={20} />
            </IconButton>
          </Tooltip>
          <BOSExportButton
            data={resolvedRows}
            filename="Supplier_Master"
            columns={[
              { header: 'Code', key: 'supplierCode' },
              { header: 'Supplier Name', key: 'supplierName' },
              { header: 'GST No', key: 'gstNo' },
              { header: 'Status', key: 'status' }
            ]}
          />
          <Tooltip title={shortcutTooltip('Create New Supplier', 'Ctrl + N')}>
            <Button variant="contained" color="primary" size="medium" onClick={handleOpenAdd} sx={btnNew}>
              + New
            </Button>
          </Tooltip>
        </Stack>
      }
    >
      <BOSDataTable columns={columns}
        rows={filteredRows}
        page={page}
        size={size}
        loading={loading}
        onPageChange={(p) => setPage(p)}
        onSizeChange={(s) => { setSize(s); setPage(0); }}
        onDoubleClickRow={handleOpenEdit}
        onClickRow={handleRowClick}
        selectedRowId={selectedListRow?.id}
        onEditRow={handleOpenEdit}
        onDeleteRow={handleDeleteClick}
      />

      <AddCapacityDialog open={dialogOpen} handleClose={handleCloseDialog} initialData={selectedRow} readOnly={isReadOnly} />
>>>>>>> origin/chore/repo-cleanup
      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Supplier"
        message="Are you sure you want to delete this supplier? This action cannot be undone."
        itemName={deleteTargetName}
      />
    </MainCard>
  );
}
