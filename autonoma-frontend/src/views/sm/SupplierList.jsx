import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Typography, Button, Stack, Tooltip, IconButton, useTheme } from '@mui/material';
import { IconFileDownload, IconRefresh, IconUserPlus } from '@tabler/icons-react';
import axios from 'utils/axios';
import { API_PATHS } from 'utils/api-constants';
import { setFilterConfig } from 'store/slices/search';
import { openSnackbar } from 'store/slices/snackbar';
import MainCard from 'ui-component/cards/MainCard';
import { exportToExcel } from 'utils/excelExport';
import ConfirmDeleteDialog from 'ui-component/ConfirmDeleteDialog';
import useKeyboardShortcuts, { shortcutTooltip } from 'hooks/useKeyboardShortcuts';
import { BOSDataTable, BOSExportButton, btnExport, btnNew } from 'ui-component/bos';
import { useSelector, useDispatch } from 'react-redux';

// ==============================|| SM - SUPPLIER LIST (BOS SOP COMPLIANT) ||============================== //

const columns = [
  { id: 'index', label: '#', minWidth: 50 },
  { id: 'gstNo', label: 'GST No', minWidth: 150, required: true },
  { id: 'supplierCode', label: 'Supplier Code', minWidth: 120, required: true },
  { id: 'supplierName', label: 'Supplier Name', minWidth: 200, bold: true, required: true },
  { id: 'status', label: 'Status', minWidth: 100 },
  { id: 'createdBy', label: 'Created By', minWidth: 120 },
  { id: 'createdDate', label: 'Created Date', minWidth: 150 },
  { id: 'updatedBy', label: 'Updated By', minWidth: 120 },
  { id: 'updatedDate', label: 'Updated Date', minWidth: 150 }
];

export default function SupplierList() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [deleteTargetName, setDeleteTargetName] = useState('');
  const [selectedListRow, setSelectedListRow] = useState(null);

  // ── RESOLVED ROWS (SOP #16 Standard) ──
  const resolvedRows = useMemo(() => {
    if (!Array.isArray(rows)) return [];
    return rows.map(row => ({
      ...row,
      status: row.status || 'Active'
    }));
  }, [rows]);

  const fetchSuppliers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(API_PATHS.SM.SUPPLIERS);
      setRows(response.data);
    } catch (error) {
      console.error('Failed to fetch suppliers:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSuppliers(); }, [fetchSuppliers]);

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
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    setDeleteDialogOpen(false);
    try {
      await axios.delete(`${API_PATHS.SM.SUPPLIERS}/${deleteTargetId}`);
      dispatch(openSnackbar({ open: true, message: 'Supplier deleted successfully!', variant: 'alert', severity: 'success' }));
      fetchSuppliers();
    } catch (error) {
      console.error('Failed to delete supplier:', error);
      dispatch(openSnackbar({ open: true, message: 'Failed to delete supplier.', variant: 'alert', severity: 'error' }));
    }
  };

  useKeyboardShortcuts({ 'ctrl+n': handleOpenAdd });

  
  useEffect(() => {
    const config = [
      { id: 'gstNo', label: 'GST No', type: 'text' },
      { id: 'supplierCode', label: 'Supplier Code', type: 'text' },
      { id: 'supplierName', label: 'Supplier Name', type: 'text' }
    ];
    dispatch(setFilterConfig(config));
    return () => dispatch(setFilterConfig(null));
  }, [dispatch]);

  const filteredRows = useMemo(() => {
    const q = (globalQuery || '').toLowerCase();
    const sourceRows = typeof resolvedRows !== 'undefined' ? resolvedRows : rows; // handle if resolvedRows exists (like SupplierList)
    if (!q) return sourceRows.map((r, i) => ({ ...r, index: i + 1 }));
    return sourceRows.filter(row =>
      (row.gstNo && row.gstNo.toString().toLowerCase().includes(q)) ||
      (row.supplierCode && row.supplierCode.toString().toLowerCase().includes(q)) ||
      (row.supplierName && row.supplierName.toString().toLowerCase().includes(q))
    ).map((r, i) => ({ ...r, index: i + 1 }));
  }, [rows, globalQuery, resolvedRows]);
return (
    <MainCard
      title={
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <IconUserPlus size={24} />
          <Typography variant="h3">Supplier Master</Typography>
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
