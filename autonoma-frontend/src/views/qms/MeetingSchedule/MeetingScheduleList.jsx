import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Stack, Button, Tooltip, IconButton, Chip, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
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
import usePagePermissions, { PAGE_CODES } from 'hooks/usePagePermissions';
import { isMobile } from 'react-device-detect';

const formatTime12h = (time24) => {
  if (!time24) return '-';
  const [hours, minutes] = time24.split(':');
  const h = parseInt(hours, 10);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${String(h12).padStart(2, '0')}:${minutes} ${ampm}`;
};

const columns = [
  { id: 'index', label: '#', minWidth: 50 },
  { id: 'scheduleNo', label: 'Schedule No', minWidth: 180, bold: true },
  { id: 'revSourceScheduleNo', label: 'Amendment Schedule No', minWidth: 180 },
  { id: 'scheduleDate', label: 'Schedule Date', minWidth: 120 },
  { id: 'meetingTypeName', label: 'Meeting Type', minWidth: 150 },
  { id: 'meetingDateTime', label: 'Meeting Date/Time', minWidth: 180 },
  { id: 'departmentNames', label: 'Department', minWidth: 180 },
  { id: 'chairedByName', label: 'Chaired By', minWidth: 150 },
  { id: 'hostByName', label: 'Host By', minWidth: 150 },
  { id: 'participantsBy', label: 'Participants By', minWidth: 250 },
  { id: 'review', label: 'Review', minWidth: 80 },
  { id: 'createdBy', label: 'Created User', minWidth: 120 },
  { id: 'createdAt', label: 'Created Date', minWidth: 140 },
  { id: 'status', label: 'Status', minWidth: 110 }
];

export default function MeetingScheduleList() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const globalQuery = useSelector((state) => state.search.query);
  const globalFilters = useSelector((state) => state.search.filters);
  const perms = usePagePermissions(PAGE_CODES.QMS_MEETING_SCHEDULE);

  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [amendDialogOpen, setAmendDialogOpen] = useState(false);
  const [selectedForAmend, setSelectedForAmend] = useState(null);

  // ── RESOLVED ROWS (SOP #16 Standard) ──
  const resolvedRows = useMemo(() => {
    if (!Array.isArray(rows)) return [];
    return rows.map(row => {
      const d = row.meetingDate || '';
      const t = row.startTime || '';
      const formattedDate = d ? d.split('-').reverse().join('/') : '-';
      
      return {
        ...row,
        scheduleDate: row.createdAt ? row.createdAt.split('T')[0].split('-').reverse().join('/') : '-',
        meetingTypeName: row.meetingType?.meetingName || '-',
        meetingDateTime: d ? `${formattedDate} ${formatTime12h(t)}` : '-',
        departmentNames: (row.departments || []).map(d => d.department?.departmentName).filter(Boolean).join(','),
        chairedByName: row.chairedBy?.employeeName || '-',
        hostByName: row.hostBy?.employeeName || '-',
        participantsBy: (row.participants || []).map(pr => {
          const e = pr.employee;
          return e ? `${e.employeeName} - ${e.empCode}` : '';
        }).filter(Boolean).join(', '),
        status: row.status || 'OPEN'
      };
    });
  }, [rows]);

  // ── FILTERED ROWS ──
  const filteredRows = useMemo(() => {
    return resolvedRows.filter((row) => {
      const statusFilter = globalFilters?.status || 'OPEN';
      if (statusFilter !== 'ALL' && row.status !== statusFilter) return false;

      if (globalQuery) {
        const q = globalQuery.toLowerCase();
        return (row.scheduleNo || '').toLowerCase().includes(q) ||
               (row.meetingTypeName || '').toLowerCase().includes(q) ||
               (row.departmentNames || '').toLowerCase().includes(q) ||
               (row.participantsBy || '').toLowerCase().includes(q);
      }
      return true;
    });
  }, [resolvedRows, globalQuery, globalFilters]);

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
          { value: 'ALL', label: 'All' },
          { value: 'OPEN', label: 'Open' },
          { value: 'RESCHEDULE', label: 'Reschedule' },
          { value: 'CLOSED', label: 'Closed' },
          { value: 'AUTO CLOSED', label: 'Auto Closed' },
          { value: 'CANCELLED', label: 'Cancelled' }
        ],
        defaultValue: 'OPEN'
      }
    ]));
    return () => dispatch(setFilterConfig(null));
  }, [dispatch]);

  // ── FETCH ──
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(API_PATHS.QMS.MEETING_SCHEDULES);
      const data = Array.isArray(response.data) ? response.data : [];
      setRows(data.sort((a, b) => b.id - a.id));
    } catch (error) {
      console.error('Failed to fetch schedules:', error);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── HANDLERS ──
  const handleAdd = () => {
    if (!perms.write) return;
    navigate('/qms/meeting-schedule/create');
  };
  const handleEdit = (item) => { 
    navigate(`/qms/meeting-schedule/edit/${item.id}`); 
  };
  const handleDeleteClick = (row) => { setDeleteTarget(row); setDeleteDialogOpen(true); };

  const handleAmendmentClick = (row) => {
    setSelectedForAmend(row);
    setAmendDialogOpen(true);
  };

  const handleAmendConfirm = async () => {
    setAmendDialogOpen(false);
    try {
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


  // ── RENDER CELL ──
  const renderCell = (col, row, idx) => {
    let val;
    if (col.id === 'status') {
      const s = row.status || 'OPEN';
      let chipStatus = 'ACTIVE';
      if (s === 'CLOSED' || s === 'AUTO CLOSED') chipStatus = 'INACTIVE';
      if (s === 'RESCHEDULE') chipStatus = 'PENDING';
      if (s === 'CANCELLED') chipStatus = 'INACTIVE';
      val = <Chip label={s} size="small" sx={getStatusChipSx(chipStatus)} />;
    } else if (col.id === 'createdAt') {
      if (!row.createdAt) val = '-';
      else {
        const dt = new Date(row.createdAt);
        val = `${dt.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })} ${dt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}`;
      }
    } else if (col.id === 'index') {
      val = idx + 1 + page * size;
    } else {
      let rawVal = row[col.id];
      if (rawVal === undefined || rawVal === null) {
        const snakeCaseId = col.id.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
        rawVal = row[snakeCaseId];
      }
      if (typeof rawVal === 'boolean') {
        val = rawVal ? 'Yes' : 'No';
      } else if (typeof rawVal === 'object' && rawVal !== null) {
        val = rawVal.name || rawVal.label || rawVal.id || '-';
      } else {
        val = (rawVal !== null && rawVal !== undefined && rawVal !== '') ? String(rawVal) : '-';
      }
    }

    const tooltipText = isMobile ? 'Double-tap to edit' : 'Double-click to edit';
    return (
      <Tooltip title={tooltipText} placement="top" followCursor enterDelay={300}>
        <div style={{ width: '100%' }}>
          {val}
        </div>
      </Tooltip>
    );
  };

  return (
    <MainCard
      title={
        <Stack direction="row" alignItems="center" spacing={2} sx={{ py: 0.5 }}>
          <Box sx={{ p: 1, bgcolor: 'primary.light', borderRadius: 2, display: 'flex' }}>
            <IconCalendarEvent size={26} color="#fff" />
          </Box>
          <Typography variant="h3" sx={{ fontWeight: 800 }}>Meeting Schedule</Typography>
        </Stack>
      }
      secondary={
        <Stack direction="row" spacing={2} alignItems="center">
          <Tooltip title="Refresh">
            <IconButton onClick={fetchData} color="primary" size="small" sx={{ border: '2px solid', borderColor: 'divider', borderRadius: '8px', p: 1, transition: 'all 0.2s', '&:hover': { bgcolor: 'primary.light', transform: 'scale(1.05)' } }}>
              <IconRefresh size={20} />
            </IconButton>
          </Tooltip>
          {perms.export && <BOSExportButton
            data={filteredRows}
            filename="Meeting_Schedule"
            columns={[
              { header: '#', key: 'index' },
              { header: 'Schedule No', key: 'scheduleNo' },
              { header: 'Amendment No', key: 'revSourceScheduleNo' },
              { header: 'Meeting Type', key: 'meetingTypeName' },
              { header: 'Meeting Date', key: 'meetingDateTime' },
              { header: 'Status', key: 'status' },
              { header: 'Chaired By', key: 'chairedByName' },
              { header: 'Host By', key: 'hostByName' },
              { header: 'Created By', key: 'createdBy' }
            ]}
          />}
          <Tooltip title="Create Amendment">
            <Button
              variant="outlined"
              color="warning"
              size="medium"
              onClick={() => {
                if (resolvedRows.length > 0) handleAmendmentClick(resolvedRows[0]);
                else dispatch(openSnackbar({ open: true, message: 'Please select a schedule to amend', variant: 'alert', severity: 'warning' }));
              }}
              sx={{ borderRadius: '12px', fontWeight: 700 }}
              startIcon={<IconGitBranch size={18} />}
            >
              + Amendment
            </Button>
          </Tooltip>
          {perms.write && <Tooltip title={shortcutTooltip('Create New Schedule', 'Ctrl + N')}>
            <Button variant="contained" color="primary" size="medium" onClick={handleAdd} sx={btnNew}>
              + New
            </Button>
          </Tooltip>}
        </Stack>
      }
    >
      <BOSDataTable
        columns={columns}
        rows={filteredRows}
        page={page}
        size={size}
        loading={loading}
        onPageChange={setPage}
        onSizeChange={(s) => { setSize(s); setPage(0); }}
        onDoubleClickRow={handleEdit}
        onDeleteRow={perms.delete ? handleDeleteClick : undefined}
        renderCell={renderCell}
        id="meeting-schedule-table"
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
