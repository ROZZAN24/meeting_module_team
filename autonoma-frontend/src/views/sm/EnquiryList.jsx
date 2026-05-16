import { useState, useEffect, useCallback, useMemo } from 'react';
import { Typography, Button, Stack, Tooltip, IconButton } from '@mui/material';
import { IconFileDownload, IconRefresh, IconMail } from '@tabler/icons-react';
import axios from 'utils/axios';
import { API_PATHS } from 'utils/api-constants';
import { setFilterConfig } from 'store/slices/search';
import { openSnackbar } from 'store/slices/snackbar';
import { format } from 'date-fns';
import MainCard from 'ui-component/cards/MainCard';
import AddEnquiryDialog from './AddEnquiryDialog';
import { exportToExcel } from 'utils/excelExport';
import ConfirmDeleteDialog from 'ui-component/ConfirmDeleteDialog';
import useKeyboardShortcuts, { shortcutTooltip } from 'hooks/useKeyboardShortcuts';
import { BOSDataTable, BOSExportButton, btnExport, btnNew } from 'ui-component/bos';
import { useSelector, useDispatch } from 'react-redux';

// ==============================|| SM - ENQUIRY MANAGEMENT (BOS SOP COMPLIANT) ||============================== //

const columns = [
  { id: 'index', label: '#', minWidth: 50 },
  { id: 'enquiryNo', label: 'Enquiry No', minWidth: 130, bold: true, required: true },
  { id: 'enquiryDate', label: 'Date', minWidth: 110 },
  { id: 'customerName', label: 'Customer', minWidth: 180, required: true },
  { id: 'contactPerson', label: 'Contact', minWidth: 140 },
  { id: 'subject', label: 'Subject', minWidth: 200 },
  { id: 'source', label: 'Source', minWidth: 100 },
  { id: 'priority', label: 'Priority', minWidth: 90 },
  { id: 'status', label: 'Status', minWidth: 100 },
  { id: 'createdBy', label: 'Created By', minWidth: 120 },
  { id: 'createdDate', label: 'Created Date', minWidth: 150 },
  { id: 'updatedBy', label: 'Updated By', minWidth: 120 },
  { id: 'updatedDate', label: 'Updated Date', minWidth: 150 }
];

export default function EnquiryList() {
  const dispatch = useDispatch();

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

  // ── RESOLVED ROWS (SOP #16 Standard) ──
  const resolvedRows = useMemo(() => {
    if (!Array.isArray(rows)) return [];
    return rows.map(row => ({
      ...row,
      status: row.status || 'Open'
    }));
  }, [rows]);

  const fetchEnquiries = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(API_PATHS.SM.ENQUIRIES);
      setRows(response.data);
    } catch (error) {
      console.error('Failed to fetch enquiries:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchEnquiries(); }, [fetchEnquiries]);

  const handleOpenAdd = () => { setSelectedRow(null); setIsReadOnly(false); setDialogOpen(true); };
  const handleOpenEdit = (row) => { setSelectedRow(row); setIsReadOnly(false); setDialogOpen(true); };
  const handleCloseDialog = (refresh) => { setDialogOpen(false); if (refresh === true) fetchEnquiries(); };

  const handleDeleteClick = (row) => {
    setDeleteTargetId(row.id);
    setDeleteTargetName(row.enquiryNo || row.customerName);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    setDeleteDialogOpen(false);
    try {
      await axios.delete(`${API_PATHS.SM.ENQUIRIES}/${deleteTargetId}`);
      dispatch(openSnackbar({ open: true, message: 'Enquiry deleted successfully!', variant: 'alert', severity: 'success' }));
      fetchEnquiries();
    } catch (error) {
      console.error('Failed to delete enquiry:', error);
      dispatch(openSnackbar({ open: true, message: 'Failed to delete enquiry.', variant: 'alert', severity: 'error' }));
    }
  };

  useKeyboardShortcuts({
    'ctrl+n': handleOpenAdd,
    'escape': () => { if (dialogOpen) handleCloseDialog(); }
  });

  
  useEffect(() => {
    const config = [
      { id: 'enquiryNo', label: 'Enquiry No', type: 'text' },
      { id: 'enquiryDate', label: 'Date', type: 'text' },
      { id: 'customerName', label: 'Customer', type: 'text' },
      { id: 'contactPerson', label: 'Contact', type: 'text' },
      { id: 'subject', label: 'Subject', type: 'text' },
      { id: 'source', label: 'Source', type: 'text' },
      { id: 'priority', label: 'Priority', type: 'text' }
    ];
    dispatch(setFilterConfig(config));
    return () => dispatch(setFilterConfig(null));
  }, [dispatch]);

  const filteredRows = useMemo(() => {
    const q = (globalQuery || '').toLowerCase();
    const sourceRows = typeof resolvedRows !== 'undefined' ? resolvedRows : rows; // handle if resolvedRows exists (like SupplierList)
    if (!q) return sourceRows.map((r, i) => ({ ...r, index: i + 1 }));
    return sourceRows.filter(row =>
      (row.enquiryNo && row.enquiryNo.toString().toLowerCase().includes(q)) ||
      (row.enquiryDate && row.enquiryDate.toString().toLowerCase().includes(q)) ||
      (row.customerName && row.customerName.toString().toLowerCase().includes(q)) ||
      (row.contactPerson && row.contactPerson.toString().toLowerCase().includes(q)) ||
      (row.subject && row.subject.toString().toLowerCase().includes(q)) ||
      (row.source && row.source.toString().toLowerCase().includes(q)) ||
      (row.priority && row.priority.toString().toLowerCase().includes(q))
    ).map((r, i) => ({ ...r, index: i + 1 }));
  }, [rows, globalQuery, resolvedRows]);
return (
    <MainCard
      title={
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <IconMail size={24} />
          <Typography variant="h3">Enquiry Management</Typography>
        </Stack>
      }
      secondary={
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Tooltip title="Refresh">
            <IconButton onClick={fetchEnquiries} color="primary" size="small" sx={{
              border: '2px solid', borderColor: 'divider', borderRadius: '8px', p: 1,
              transition: 'all 0.2s', '&:hover': { bgcolor: 'primary.light', transform: 'scale(1.05)' }
            }}>
              <IconRefresh size={20} />
            </IconButton>
          </Tooltip>
          <BOSExportButton
            data={resolvedRows}
            filename="SM_Enquiries"
            columns={[
              { header: 'Enquiry No', key: 'enquiryNo' },
              { header: 'Date', key: 'enquiryDate' },
              { header: 'Customer', key: 'customerName' },
              { header: 'Priority', key: 'priority' },
              { header: 'Status', key: 'status' }
            ]}
          />
          <Tooltip title={shortcutTooltip('Create New Enquiry', 'Ctrl + N')}>
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
        onEditRow={handleOpenEdit}
        onDeleteRow={handleDeleteClick}
      />

      <AddEnquiryDialog open={dialogOpen} handleClose={handleCloseDialog} initialData={selectedRow} readOnly={isReadOnly} />
      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Enquiry"
        message="Are you sure you want to delete this enquiry? This action cannot be undone."
        itemName={deleteTargetName}
      />
    </MainCard>
  );
}
