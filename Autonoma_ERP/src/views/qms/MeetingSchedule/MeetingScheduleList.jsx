import { useState, useEffect, useCallback, useMemo } from 'react';
import { Typography, Stack, Button, Tooltip, IconButton, Chip, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { IconPlus, IconCalendarEvent, IconRefresh, IconGitBranch } from '@tabler/icons-react';
import axios from 'utils/axios';
import MainCard from 'ui-component/cards/MainCard';
import { useDispatch, useSelector } from 'react-redux';
import { setFilterConfig } from 'store/slices/search';
import { openSnackbar } from 'store/slices/snackbar';
import ConfirmDeleteDialog from 'ui-component/ConfirmDeleteDialog';
import useKeyboardShortcuts, { shortcutTooltip } from 'hooks/useKeyboardShortcuts';
import { BOSDataTable, BOSExportButton, btnNew, getStatusChipSx } from 'ui-component/bos';
import { API_PATHS } from 'utils/api-constants';
import AddMeetingScheduleDialog from './AddMeetingScheduleDialog';

const columns = [
  { id: 'index', label: '#', minWidth: 50 },
  { id: 'scheduleNo', label: 'Schedule No', minWidth: 180, bold: true },
  { id: 'revSourceScheduleNo', label: 'Amendment Schedule No', minWidth: 180 },
  { id: 'scheduleDate', label: 'Schedule Date', minWidth: 120 },
  { id: 'meetingTypeName', label: 'Meeting Type', minWidth: 150 },
  { id: 'meetingDateTime', label: 'Meeting Date/Time', minWidth: 180 },
  { id: 'departments', label: 'Department', minWidth: 180 },
  { id: 'chairedByName', label: 'Chaired By', minWidth: 150 },
  { id: 'hostByName', label: 'Host By', minWidth: 150 },
  { id: 'participantsBy', label: 'Participants By', minWidth: 250 },
  { id: 'review', label: 'Review', minWidth: 80 },
  { id: 'createdBy', label: 'Created User', minWidth: 120 },
  { id: 'createdAt', label: 'Created Date', minWidth: 140 },
  { id: 'status', label: 'Status', minWidth: 110 }
];

export default function MeetingScheduleList() {
  const dispatch = useDispatch();
  const globalQuery = useSelector((state) => state.search.query);
  const globalFilters = useSelector((state) => state.search.filters);

  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [amendDialogOpen, setAmendDialogOpen] = useState(false);
  const [selectedForAmend, setSelectedForAmend] = useState(null);

  // ── GLOBAL FILTER CONFIG ──
  useEffect(() => {
    dispatch(setFilterConfig([
      {
        id: 'dateType', label: 'Date Type', type: 'select', isStarred: true,
        options: [
          { value: 'meetingDate', label: 'Meeting Date' },
          { value: 'createdAt', label: 'Created Date' }
        ],
        defaultValue: 'meetingDate'
      },
      { id: 'fromDate', label: 'From Date', type: 'date', isStarred: true },
      { id: 'toDate', label: 'To Date', type: 'date', isStarred: true },
      {
        id: 'considerDate', label: 'Consider Date?', type: 'select', isStarred: true,
        options: [{ value: 'YES', label: 'Yes' }, { value: 'NO', label: 'No' }],
        defaultValue: 'NO'
      },
      {
        id: 'status', label: 'Status', type: 'select', isStarred: true,
        options: [
          { value: 'All', label: 'ALL' },
          { value: 'OPEN', label: 'OPEN' },
          { value: 'CLOSED', label: 'CLOSED' },
          { value: 'RESCHEDULE', label: 'RESCHEDULE' },
          { value: 'AUTO CLOSED', label: 'AUTO CLOSED' },
          { value: 'CANCELLED', label: 'CANCELLED' }
        ],
        defaultValue: 'All'
      },
      {
        id: 'searchBy', label: 'Search By', type: 'select', isStarred: true,
        options: [
          { value: 'scheduleNo', label: 'Schedule No' },
          { value: 'meetingType', label: 'Meeting Type' },
          { value: 'department', label: 'Department' }
        ],
        defaultValue: 'scheduleNo'
      },
      { id: 'scheduleNo', label: 'Schedule No', type: 'text', placeholder: 'Search...', isStarred: true }
    ]));
    return () => dispatch(setFilterConfig(null));
  }, [dispatch]);

  // ── FETCH ──
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(API_PATHS.QMS.MEETING_SCHEDULES);
      setRows(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Failed to fetch schedules:', error);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── CLIENT FILTERING ──
  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const statusFilter = globalFilters.status || 'All';
      if (statusFilter !== 'All' && row.status !== statusFilter) return false;

      const searchText = globalFilters.scheduleNo || '';
      if (searchText) {
        const q = searchText.toLowerCase();
        const searchField = globalFilters.searchBy || 'scheduleNo';
        if (searchField === 'scheduleNo' && !(row.scheduleNo || '').toLowerCase().includes(q)) return false;
        if (searchField === 'meetingType' && !(row.meetingType?.meetingName || '').toLowerCase().includes(q)) return false;
        if (searchField === 'department') {
          const depts = (row.departments || []).map(d => d.department?.departmentName || '').join(', ').toLowerCase();
          if (!depts.includes(q)) return false;
        }
      }

      // Date filtering
      if (globalFilters.considerDate === 'YES' && globalFilters.fromDate && globalFilters.toDate) {
        const dateField = globalFilters.dateType === 'createdAt' ? row.createdAt?.split('T')[0] : row.meetingDate;
        if (dateField && (dateField < globalFilters.fromDate || dateField > globalFilters.toDate)) return false;
      }

      if (globalQuery) {
        const q = globalQuery.toLowerCase();
        return (row.scheduleNo || '').toLowerCase().includes(q) ||
               (row.meetingType?.meetingName || '').toLowerCase().includes(q);
      }
      return true;
    });
  }, [rows, globalQuery, globalFilters]);

  const paginatedRows = useMemo(() => filteredRows.slice(page * size, page * size + size), [filteredRows, page, size]);

  // ── HANDLERS ──
  const handleAdd = () => { setSelectedItem(null); setDialogOpen(true); };
  const handleEdit = (item) => { setSelectedItem(item); setDialogOpen(true); };
  const handleDeleteClick = (row) => { setDeleteTarget(row); setDeleteDialogOpen(true); };

  const handleAmendmentClick = (row) => {
    setSelectedForAmend(row);
    setAmendDialogOpen(true);
  };

  const handleAmendConfirm = async () => {
    setAmendDialogOpen(false);
    try {
      // Create amendment: copy existing schedule with incremented rev
      const amended = {
        ...selectedForAmend,
        id: undefined,
        revSourceScheduleNo: selectedForAmend.scheduleNo,
        revNo: (selectedForAmend.revNo || 0) + 1,
        status: 'OPEN',
        createdAt: undefined,
        updatedAt: undefined
      };
      await axios.post(API_PATHS.QMS.MEETING_SCHEDULES, amended);
      dispatch(openSnackbar({ open: true, message: 'Amendment created successfully!', variant: 'alert', severity: 'success' }));
      fetchData();
    } catch (error) {
      dispatch(openSnackbar({ open: true, message: 'Failed to create amendment', variant: 'alert', severity: 'error' }));
    }
  };

  const handleSave = async (formData) => {
    try {
      if (selectedItem) {
        await axios.put(`${API_PATHS.QMS.MEETING_SCHEDULES}/${selectedItem.id}`, formData);
        dispatch(openSnackbar({ open: true, message: 'Meeting Schedule updated Successfully...', variant: 'alert', severity: 'success' }));
      } else {
        await axios.post(API_PATHS.QMS.MEETING_SCHEDULES, formData);
        dispatch(openSnackbar({ open: true, message: 'Meeting Schedule saved Successfully.', variant: 'alert', severity: 'success' }));
      }
      setDialogOpen(false);
      fetchData();
    } catch (error) {
      dispatch(openSnackbar({ open: true, message: 'Failed to save schedule', variant: 'alert', severity: 'error' }));
    }
  };

  const handleDeleteConfirm = async () => {
    setDeleteDialogOpen(false);
    try {
      await axios.delete(`${API_PATHS.QMS.MEETING_SCHEDULES}/${deleteTarget.id}`);
      dispatch(openSnackbar({ open: true, message: 'Schedule deleted!', variant: 'alert', severity: 'success' }));
      fetchData();
    } catch (error) {
      dispatch(openSnackbar({ open: true, message: 'Failed to delete schedule', variant: 'alert', severity: 'error' }));
    }
  };

  useKeyboardShortcuts({ 'ctrl+n': handleAdd });

  const formatTime12h = (time24) => {
    if (!time24) return '-';
    const [hours, minutes] = time24.split(':');
    const h = parseInt(hours, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${String(h12).padStart(2, '0')}:${minutes} ${ampm}`;
  };

  // ── RENDER CELL ──
  const renderCell = (col, row, idx) => {
    if (col.id === 'index') return idx + 1 + page * size;
    if (col.id === 'status') {
      const s = row.status || 'OPEN';
      let chipStatus = 'ACTIVE';
      if (s === 'CLOSED' || s === 'AUTO CLOSED') chipStatus = 'INACTIVE';
      if (s === 'RESCHEDULE') chipStatus = 'PENDING';
      if (s === 'CANCELLED') chipStatus = 'INACTIVE';
      return <Chip label={s} size="small" sx={getStatusChipSx(chipStatus)} />;
    }
    if (col.id === 'scheduleDate') return row.createdAt ? row.createdAt.split('T')[0].split('-').reverse().join('/') : '-';
    if (col.id === 'meetingTypeName') return row.meetingType?.meetingName || '-';
    if (col.id === 'meetingDateTime') {
      const d = row.meetingDate || '';
      const t = row.startTime || '';
      if (!d) return '-';
      const formattedDate = d.split('-').reverse().join('/');
      return `${formattedDate} ${formatTime12h(t)}`;
    }
    if (col.id === 'departments') return (row.departments || []).map(d => d.department?.departmentName).filter(Boolean).join(',');
    if (col.id === 'chairedByName') return row.chairedBy?.employeeName || '-';
    if (col.id === 'hostByName') return row.hostBy?.employeeName || '-';
    if (col.id === 'participantsBy') {
      return (row.participants || []).map(pr => {
        const e = pr.employee;
        return e ? `${e.id};${e.employeeName} - ${e.empCode}` : '';
      }).filter(Boolean).join(',');
    }
    if (col.id === 'createdAt') {
      if (!row.createdAt) return '-';
      const dt = new Date(row.createdAt);
      return `${dt.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })} ${dt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}`;
    }
    return row[col.id] || '-';
  };

  return (
    <MainCard
      title={
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <IconCalendarEvent size={24} />
          <Typography variant="h3">Meeting Schedule</Typography>
        </Stack>
      }
      secondary={
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Tooltip title="Refresh">
            <IconButton onClick={fetchData} color="primary" size="small" sx={{ border: '2px solid', borderColor: 'divider', borderRadius: '8px', p: 1, transition: 'all 0.2s', '&:hover': { bgcolor: 'primary.light', transform: 'scale(1.05)' } }}>
              <IconRefresh size={20} />
            </IconButton>
          </Tooltip>
          <BOSExportButton
            data={filteredRows}
            filename="Meeting_Schedule"
            columns={[
              { header: '#', key: 'index' },
              { header: 'Schedule No', key: 'scheduleNo' },
              { header: 'Amendment No', key: 'revSourceScheduleNo' },
              { header: 'Meeting Type', key: r => r.meetingType?.meetingName || '' },
              { header: 'Meeting Date', key: 'meetingDate' },
              { header: 'Status', key: 'status' },
              { header: 'Chaired By', key: r => r.chairedBy?.employeeName || '' },
              { header: 'Host By', key: r => r.hostBy?.employeeName || '' },
              { header: 'Created By', key: 'createdBy' }
            ]}
          />
          <Tooltip title="Create Amendment">
            <Button
              variant="outlined"
              color="warning"
              size="medium"
              onClick={() => {
                if (paginatedRows.length > 0) handleAmendmentClick(paginatedRows[0]);
                else dispatch(openSnackbar({ open: true, message: 'Please select a schedule to amend', variant: 'alert', severity: 'warning' }));
              }}
              sx={{ borderRadius: '12px', fontWeight: 700 }}
              startIcon={<IconGitBranch size={18} />}
            >
              + Amendment
            </Button>
          </Tooltip>
          <Tooltip title={shortcutTooltip('Create New Schedule', 'Ctrl + N')}>
            <Button variant="contained" color="secondary" size="medium" onClick={handleAdd} sx={btnNew}>
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
        onPageChange={setPage}
        onSizeChange={(s) => { setSize(s); setPage(0); }}
        onDoubleClickRow={handleEdit}
        onEditRow={handleEdit}
        onDeleteRow={handleDeleteClick}
        renderCell={renderCell}
        id="meeting-schedule-table"
      />

      <AddMeetingScheduleDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSave={handleSave}
        item={selectedItem}
      />

      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Meeting Schedule"
        message="Are you sure you want to delete this schedule? This action cannot be undone."
        itemName={deleteTarget?.scheduleNo}
      />

      {/* Amendment Confirmation Dialog */}
      <Dialog open={amendDialogOpen} onClose={() => setAmendDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Amendment Confirmation</DialogTitle>
        <DialogContent>
          <Typography>Are you sure want to Amendment this Record?</Typography>
          {selectedForAmend && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Schedule: <strong>{selectedForAmend.scheduleNo}</strong>
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAmendDialogOpen(false)}>No</Button>
          <Button variant="contained" color="warning" onClick={handleAmendConfirm}>Yes</Button>
        </DialogActions>
      </Dialog>
    </MainCard>
  );
}
