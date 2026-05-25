import { useState, useEffect, useCallback, useMemo } from 'react';
import { Typography, Stack, Button, Tooltip, IconButton, Chip } from '@mui/material';
import { IconPlus, IconUsersGroup, IconRefresh, IconDownload } from '@tabler/icons-react';
import axios from 'utils/axios';
import MainCard from 'ui-component/cards/MainCard';
import { useDispatch, useSelector } from 'react-redux';
import { setFilterConfig } from 'store/slices/search';
import { openSnackbar } from 'store/slices/snackbar';
import ConfirmDeleteDialog from 'ui-component/ConfirmDeleteDialog';
import useKeyboardShortcuts, { shortcutTooltip } from 'hooks/useKeyboardShortcuts';
import { BOSDataTable, BOSExportButton, btnNew, getStatusChipSx } from 'ui-component/bos';
import { API_PATHS } from 'utils/api-constants';
import usePagePermissions, { PAGE_CODES } from 'hooks/usePagePermissions';
import useAuth from 'hooks/useAuth';
import AddMeetingMasterDialog from './AddMeetingMasterDialog';

const columns = [
  { id: 'index', label: '#', minWidth: 50 },
  { id: 'meetingName', label: 'Meeting Name', minWidth: 150, bold: true },
  { id: 'meetingDescription', label: 'Meeting Description', minWidth: 200 },
  { id: 'meetingPrefix', label: 'Meeting Prefix', minWidth: 100 },
  { id: 'meetingAgenda', label: 'Meeting AGENDA', minWidth: 200 },
  { id: 'employeeName', label: 'Employee Name', minWidth: 250 },
  { id: 'createdBy', label: 'Created User', minWidth: 120 },
  { id: 'createdAt', label: 'Created Date', minWidth: 140 },
  { id: 'updatedBy', label: 'Updated User', minWidth: 120 },
  { id: 'updatedAt', label: 'Updated Date', minWidth: 140 },
  { id: 'attachmentName', label: 'Attachment', minWidth: 100 },
  { id: 'status', label: 'Status', minWidth: 100 }
];

export default function MeetingMasterList() {
  const dispatch = useDispatch();
  const globalQuery = useSelector((state) => state.search.query);
  const globalFilters = useSelector((state) => state.search.filters);
  const perms = usePagePermissions(PAGE_CODES.QMS_MEETING);
  const { user } = useAuth();

  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // ── GLOBAL FILTER CONFIG (same pattern as AuditScheduleList) ──
  useEffect(() => {
    dispatch(setFilterConfig([
      {
        id: 'status', label: 'Status', type: 'select', isStarred: true,
        options: [
          { value: 'All', label: 'ALL' },
          { value: 'ACTIVE', label: 'ACTIVE' },
          { value: 'INACTIVE', label: 'INACTIVE' }
        ],
        defaultValue: 'ACTIVE'
      },
      {
        id: 'searchBy', label: 'Search By', type: 'select', isStarred: true,
        options: [
          { value: 'meetingName', label: 'Meeting Name' },
          { value: 'meetingPrefix', label: 'Meeting Prefix' },
          { value: 'meetingAgenda', label: 'Meeting Agenda' }
        ],
        defaultValue: 'meetingName'
      },
      { id: 'meetingName', label: 'Meeting Name', type: 'text', placeholder: 'Search meeting name...', isStarred: true }
    ]));
    return () => dispatch(setFilterConfig(null));
  }, [dispatch]);

  // ── FETCH DATA ──
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(API_PATHS.QMS.MEETINGS);
      const data = Array.isArray(response.data) ? response.data : [];
      setRows(data.sort((a, b) => b.id - a.id));
    } catch (error) {
      console.error('Failed to fetch meetings:', error);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── CLIENT-SIDE FILTERING ──
  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const statusFilter = globalFilters.status || 'ACTIVE';
      if (statusFilter !== 'All' && row.status !== statusFilter) return false;

      const nameFilter = globalFilters.meetingName || '';
      if (nameFilter && !(row.meetingName || '').toLowerCase().includes(nameFilter.toLowerCase())) return false;

      if (globalQuery) {
        const q = globalQuery.toLowerCase();
        return (row.meetingName || '').toLowerCase().includes(q) ||
               (row.meetingPrefix || '').toLowerCase().includes(q) ||
               (row.meetingAgenda || '').toLowerCase().includes(q);
      }
      return true;
    });
  }, [rows, globalQuery, globalFilters]);

  const paginatedRows = useMemo(() => filteredRows.slice(page * size, page * size + size), [filteredRows, page, size]);

  // ── HANDLERS ──
  const handleAdd = () => { setSelectedItem(null); setDialogOpen(true); };
  const handleEdit = (item) => { setSelectedItem(item); setDialogOpen(true); };
  const handleDeleteClick = (row) => { setDeleteTarget(row); setDeleteDialogOpen(true); };

  const handleSave = async (form) => {
    try {
      if (selectedItem) {
        const payload = {
          ...form,
          updatedBy: user?.name || ''
        };
        await axios.put(`${API_PATHS.QMS.MEETINGS}/${selectedItem.id}`, payload);
        dispatch(openSnackbar({ open: true, message: 'Meeting updated successfully!', variant: 'alert', alert: { variant: 'filled' }, severity: 'success' }));
      } else {
        const payload = {
          ...form,
          createdBy: user?.name || ''
        };
        await axios.post(API_PATHS.QMS.MEETINGS, payload);
        dispatch(openSnackbar({ open: true, message: 'Meeting created successfully!', variant: 'alert', alert: { variant: 'filled' }, severity: 'success' }));
      }
      setDialogOpen(false);
      fetchData();
    } catch (error) {
      dispatch(openSnackbar({ open: true, message: 'Failed to save meeting', variant: 'alert', alert: { variant: 'filled' }, severity: 'error' }));
    }
  };

  const handleDeleteConfirm = async () => {
    setDeleteDialogOpen(false);
    try {
      await axios.delete(`${API_PATHS.QMS.MEETINGS}/${deleteTarget.id}`);
      dispatch(openSnackbar({ open: true, message: 'Meeting deleted successfully!', variant: 'alert', alert: { variant: 'filled' }, severity: 'success' }));
      fetchData();
    } catch (error) {
      // Axios interceptor un-wraps error.response.data into the 'error' variable directly.
      const errorMessage = error.message || error.response?.data?.message || 'Failed to delete meeting';
      dispatch(openSnackbar({ open: true, message: errorMessage, variant: 'alert', alert: { variant: 'filled' }, severity: 'error' }));
    }
  };

  useKeyboardShortcuts({ 'ctrl+n': handleAdd });

  // ── RENDER CELL ──
  const renderCell = (col, row, idx) => {
    if (col.id === 'index') return idx + 1 + page * size;
    if (col.id === 'status') {
      return <Chip label={row.status} size="small" sx={getStatusChipSx(row.status === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE')} />;
    }
    if (col.id === 'createdAt') {
      const dateVal = row[col.id];
      return dateVal ? new Date(dateVal).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-';
    }
    if (col.id === 'updatedAt') {
      const dateVal = row[col.id];
      return (dateVal && row.updatedBy) ? new Date(dateVal).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-';
    }
    if (col.id === 'attachmentName') {
      const url = row.attachmentUrl;
      const name = row.attachmentName;
      if (url && name) {
        return (
          <Tooltip title={`Download ${name}`}>
            <IconButton
              size="small"
              color="primary"
              onClick={() => window.open(`${window.location.origin}${API_PATHS.FILES}/download/${url}`, '_blank')}
            >
              <IconDownload size={18} />
            </IconButton>
          </Tooltip>
        );
      }
      return '-';
    }
    return row[col.id] || '-';
  };

  return (
    <MainCard
      title={
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <IconUsersGroup size={24} />
          <Typography variant="h3">Meeting Master</Typography>
        </Stack>
      }
      secondary={
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Tooltip title="Refresh">
            <IconButton onClick={fetchData} color="primary" size="small" sx={{ border: '2px solid', borderColor: 'divider', borderRadius: '8px', p: 1, transition: 'all 0.2s', '&:hover': { bgcolor: 'primary.light', transform: 'scale(1.05)' } }}>
              <IconRefresh size={20} />
            </IconButton>
          </Tooltip>
          {perms.export && <BOSExportButton
            data={filteredRows.map(row => ({
              ...row,
              updatedAt: row.updatedBy ? row.updatedAt : null
            }))}
            filename="Meeting_Master"
            columns={[
              { header: '#', key: 'index' },
              { header: 'Meeting Name', key: 'meetingName' },
              { header: 'Meeting Description', key: 'meetingDescription' },
              { header: 'Meeting Prefix', key: 'meetingPrefix' },
              { header: 'Meeting Agenda', key: 'meetingAgenda' },
              { header: 'Employee Name', key: 'employeeName' },
              { header: 'Created User', key: 'createdBy' },
              { header: 'Created Date', key: 'createdAt' },
              { header: 'Updated User', key: 'updatedBy' },
              { header: 'Updated Date', key: 'updatedAt' },
              { header: 'Status', key: 'status' }
            ]}
          />}
          {perms.write && <Tooltip title={shortcutTooltip('New Meeting', 'Ctrl + N')}>
            <Button variant="contained" color="primary" size="medium" onClick={handleAdd} sx={btnNew}>
              + New
            </Button>
          </Tooltip>}
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
        onPageChange={setPage}
        onSizeChange={(s) => { setSize(s); setPage(0); }}
        onDoubleClickRow={perms.write ? handleEdit : undefined}
        onEditRow={perms.write ? handleEdit : undefined}
        onDeleteRow={perms.delete ? handleDeleteClick : undefined}
        renderCell={renderCell}
        id="meeting-master-table"
      />

      <AddMeetingMasterDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSave={handleSave}
        item={selectedItem}
        existingData={rows}
      />

      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Meeting Master"
        message="Are you sure you want to delete this meeting? This action cannot be undone."
        itemName={deleteTarget?.meetingName}
      />
    </MainCard>
  );
}
