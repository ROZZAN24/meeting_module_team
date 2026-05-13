import { useState, useEffect, useCallback, useMemo } from 'react';
import { Typography, Button, Stack, Tooltip, IconButton } from '@mui/material';
import { IconFileDownload, IconRefresh, IconMail } from '@tabler/icons-react';
import axios from 'utils/axios';
import { API_PATHS } from 'utils/api-constants';
import { useDispatch, useSelector } from 'react-redux';
import { setFilterConfig } from 'store/slices/search';
import { openSnackbar } from 'store/slices/snackbar';
import { format } from 'date-fns';
import MainCard from 'ui-component/cards/MainCard';
import AddEnquiryDialog from './AddEnquiryDialog';
import { exportToExcel } from 'utils/excelExport';
import ConfirmDeleteDialog from 'ui-component/ConfirmDeleteDialog';
import useKeyboardShortcuts, { shortcutTooltip } from 'hooks/useKeyboardShortcuts';
import { BOSDataTable, BOSExportButton, btnExport, btnNew } from 'ui-component/bos';

// ==============================|| SM - ENQUIRY MANAGEMENT (BOS SOP COMPLIANT) ||============================== //

const columns = [
  { id: 'index', label: '#', minWidth: 50 },
  { id: 'enquiryNo', label: 'Enquiry No', minWidth: 130, bold: true },
  { id: 'enquiryDate', label: 'Date', minWidth: 110 },
  { id: 'customerName', label: 'Customer', minWidth: 180 },
  { id: 'contactPerson', label: 'Contact', minWidth: 140 },
  { id: 'subject', label: 'Subject', minWidth: 200 },
  { id: 'source', label: 'Source', minWidth: 100 },
  { id: 'priority', label: 'Priority', minWidth: 90 },
  { id: 'status', label: 'Status', minWidth: 100 }
];

export default function EnquiryList() {
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

  useEffect(() => {
    const config = [
      {
        id: 'status', label: 'Status', type: 'select',
        options: [
          { value: 'All', label: 'ALL' },
          { value: 'Open', label: 'OPEN' },
          { value: 'In Progress', label: 'IN PROGRESS' },
          { value: 'Closed', label: 'CLOSED' },
          { value: 'Cancelled', label: 'CANCELLED' }
        ],
        defaultValue: 'All'
      },
      { id: 'customerName', label: 'Customer', type: 'text', placeholder: 'Search by Customer...' }
    ];
    dispatch(setFilterConfig(config));
    return () => dispatch(setFilterConfig(null));
  }, [dispatch]);

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
      dispatch(openSnackbar({ open: true, message: 'Enquiry deleted successfully!', variant: 'alert', alert: { variant: 'filled' }, severity: 'success', close: false }));
      fetchEnquiries();
    } catch (error) {
      console.error('Failed to delete enquiry:', error);
      dispatch(openSnackbar({ open: true, message: 'Failed to delete enquiry.', variant: 'alert', alert: { variant: 'filled' }, severity: 'error', close: false }));
    }
  };

  useKeyboardShortcuts({
    'ctrl+n': handleOpenAdd,
    'escape': () => { if (dialogOpen) handleCloseDialog(); }
  });

  const handleExport = () => {
    const exportData = filteredRows.map((r, i) => ({
      '#': i + 1,
      'Enquiry No': r.enquiryNo,
      'Date': r.enquiryDate ? format(new Date(r.enquiryDate), 'dd-MM-yyyy') : '',
      'Customer': r.customerName,
      'Contact Person': r.contactPerson,
      'Email': r.email,
      'Phone': r.phone,
      'Subject': r.subject,
      'Source': r.source,
      'Priority': r.priority,
      'Status': r.status
    }));
    exportToExcel(exportData, 'SM_Enquiries');
  };

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const statusFilter = globalFilters.status || 'All';
      const matchesStatus = statusFilter === 'All' || row.status === statusFilter;
      const nameFilter = globalFilters.customerName || '';
      const matchesName = !nameFilter || (row.customerName && row.customerName.toLowerCase().includes(nameFilter.toLowerCase()));
      const matchesSearch = !globalQuery ||
        (row.customerName && row.customerName.toLowerCase().includes(globalQuery.toLowerCase())) ||
        (row.enquiryNo && row.enquiryNo.toLowerCase().includes(globalQuery.toLowerCase())) ||
        (row.subject && row.subject.toLowerCase().includes(globalQuery.toLowerCase()));
      return matchesStatus && matchesName && matchesSearch;
    });
  }, [rows, globalQuery, globalFilters]);

  const paginatedRows = useMemo(() => filteredRows.slice(page * size, page * size + size), [filteredRows, page, size]);

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
            data={filteredRows}
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
