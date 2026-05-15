import { useState, useEffect, useCallback, useMemo } from 'react';
import { Typography, Button, Stack, Tooltip, IconButton } from '@mui/material';
import { IconBriefcase, IconFileDownload, IconRefresh } from '@tabler/icons-react';
import axios from 'utils/axios';
import { useDispatch, useSelector } from 'react-redux';
import { setFilterConfig } from 'store/slices/search';
import { openSnackbar } from 'store/slices/snackbar';
import MainCard from 'ui-component/cards/MainCard';
import { exportToExcel } from 'utils/excelExport';
import { BOSDataTable, BOSExportButton, btnExport, btnNew } from 'ui-component/bos';
import useKeyboardShortcuts, { shortcutTooltip } from 'hooks/useKeyboardShortcuts';
import ConfirmDeleteDialog from 'ui-component/ConfirmDeleteDialog';
import AddDesignationDialog from './AddDesignationDialog';
import { format } from 'date-fns';

const columns = [
  { id: 'index', label: 'No', minWidth: 60 },
  { id: 'designationCode', label: 'Designation Code', minWidth: 160, bold: true, required: true },
  { id: 'designationName', label: 'Designation Name', minWidth: 250, required: true },
  { id: 'subCategoryLevel', label: 'Sub Category Level', minWidth: 160 },
  { id: 'experience', label: 'Experience', minWidth: 120 },
  { id: 'status', label: 'Status', minWidth: 100 },
  { id: 'createdBy', label: 'Created By', minWidth: 130 },
  { id: 'createdDate', label: 'Created Date', minWidth: 160 },
  { id: 'updatedBy', label: 'Updated By', minWidth: 130 },
  { id: 'updatedDate', label: 'Updated Date', minWidth: 160 }
];

export default function DesignationMaster() {
  const dispatch = useDispatch();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [selectedRow, setSelectedRow] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // ── RESOLVED ROWS (SOP #16 Standard) ──
  const resolvedRows = useMemo(() => {
    if (!Array.isArray(rows)) return [];
    return rows.map(row => ({
      ...row,
      status: row.status || 'Active'
    }));
  }, [rows]);

  const fetchDesignations = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/hrm/designations');
      setRows(response.data || []);
    } catch (error) {
      console.error('Failed to fetch designations:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDesignations(); }, [fetchDesignations]);

  const handleOpenAdd = () => { setSelectedRow(null); setDialogOpen(true); };
  const handleOpenEdit = (row) => { setSelectedRow(row); setDialogOpen(true); };

  const handleDeleteConfirm = async () => {
    if (!selectedRow) return;
    try {
      await axios.delete(`/api/hrm/designations/${selectedRow.id}`);
      dispatch(openSnackbar({ open: true, message: 'Designation deleted successfully', severity: 'success', variant: 'alert' }));
      fetchDesignations();
      setDeleteDialogOpen(false);
    } catch (err) {
      dispatch(openSnackbar({ open: true, message: 'Failed to delete', severity: 'error', variant: 'alert' }));
    }
  };

  useKeyboardShortcuts({
    'ctrl+n': handleOpenAdd,
    'escape': () => setDialogOpen(false)
  });

  return (
    <MainCard
      title={
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <IconBriefcase size={24} />
          <Typography variant="h3">Designation Master</Typography>
        </Stack>
      }
      secondary={
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Tooltip title="Refresh">
            <IconButton
              onClick={fetchDesignations}
              color="primary"
              size="small"
              sx={{
                border: '2px solid',
                borderColor: 'divider',
                borderRadius: '8px',
                p: 1,
                transition: 'all 0.2s',
                '&:hover': { bgcolor: 'primary.light', transform: 'scale(1.05)' }
              }}
            >
              <IconRefresh size={20} />
            </IconButton>
          </Tooltip>
          <BOSExportButton
            data={resolvedRows}
            filename="Designation_Master"
            columns={[
              { header: 'Code', key: 'designationCode' },
              { header: 'Name', key: 'designationName' },
              { header: 'Level', key: 'subCategoryLevel' },
              { header: 'Status', key: 'status' },
              { header: 'Created By', key: 'createdBy' },
              { header: 'Created Date', key: 'createdDate' },
              { header: 'Updated By', key: 'updatedBy' },
              { header: 'Updated Date', key: 'updatedDate' }
            ]}
          />
          <Tooltip title={shortcutTooltip('Create New Designation', 'Ctrl + N')}>
            <Button variant="contained" color="primary" size="medium" onClick={handleOpenAdd} sx={btnNew}>
              + New
            </Button>
          </Tooltip>
        </Stack>
      }
    >
      <BOSDataTable
        columns={columns}
        rows={resolvedRows}
        page={page}
        size={size}
        loading={loading}
        onPageChange={setPage}
        onSizeChange={(s) => { setSize(s); setPage(0); }}
        onDoubleClickRow={handleOpenEdit}
        onEditRow={handleOpenEdit}
        onDeleteRow={(row) => { setSelectedRow(row); setDeleteDialogOpen(true); }}
      />

      <AddDesignationDialog
        open={dialogOpen}
        handleClose={(refresh) => { setDialogOpen(false); if (refresh) fetchDesignations(); }}
        initialData={selectedRow}
      />

      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Designation"
        message="Are you sure you want to delete this designation?"
        itemName={selectedRow?.designationName}
      />
    </MainCard>
  );
}
