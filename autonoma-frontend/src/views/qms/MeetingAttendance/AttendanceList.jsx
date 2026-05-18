import { useState, useEffect, useCallback, useMemo } from 'react';
import { Typography, Stack, Button, Tooltip, IconButton, Chip } from '@mui/material';
import { IconPlus, IconClock, IconRefresh } from '@tabler/icons-react';
import axios from 'utils/axios';
import MainCard from 'ui-component/cards/MainCard';
import { useDispatch, useSelector } from 'react-redux';
import { setFilterConfig } from 'store/slices/search';
import { openSnackbar } from 'store/slices/snackbar';
import useKeyboardShortcuts, { shortcutTooltip } from 'hooks/useKeyboardShortcuts';
import { BOSDataTable, BOSExportButton, btnNew, getStatusChipSx } from 'ui-component/bos';
import { API_PATHS } from 'utils/api-constants';
import AttendanceEntryDialog from './AttendanceEntryDialog';

const columns = [
  { id: 'index', label: 'Sl No', minWidth: 60 },
  { id: 'scheduleNo', label: 'Meeting Sch No', minWidth: 200, bold: true },
  { id: 'participantName', label: 'Meeting Participant', minWidth: 180 },
  { id: 'inTime', label: 'In Time', minWidth: 100 },
  { id: 'outTime', label: 'Out Time', minWidth: 100 },
  { id: 'status', label: 'Status', minWidth: 120 }
];

export default function AttendanceList() {
  const dispatch = useDispatch();
  const globalQuery = useSelector((state) => state.search.query);
  const globalFilters = useSelector((state) => state.search.filters);

  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  // ── GLOBAL FILTER CONFIG ──
  useEffect(() => {
    dispatch(setFilterConfig([
      {
        id: 'filterType', label: 'Filter Type', type: 'select', isStarred: true,
        options: [{ value: 'Mine', label: 'Mine' }, { value: 'All', label: 'All' }],
        defaultValue: 'Mine'
      },
      { id: 'fromDate', label: 'From Date', type: 'date', isStarred: true },
      { id: 'toDate', label: 'To Date', type: 'date', isStarred: true },
      {
        id: 'considerDate', label: 'Consider Date', type: 'select', isStarred: true,
        options: [{ value: 'YES', label: 'YES' }, { value: 'NO', label: 'NO' }],
        defaultValue: 'NO'
      },
      {
        id: 'searchBy', label: 'Search By', type: 'select', isStarred: true,
        options: [
          { value: 'scheduleNo', label: 'Schedule No' },
          { value: 'participant', label: 'Participant' }
        ],
        defaultValue: 'scheduleNo'
      },
      { id: 'searchText', label: 'Search', type: 'text', placeholder: 'Search...', isStarred: true }
    ]));
    return () => dispatch(setFilterConfig(null));
  }, [dispatch]);

  // ── FETCH ──
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(API_PATHS.QMS.MEETING_ATTENDANCE);
      const data = Array.isArray(response.data) ? response.data : [];
      setRows(data.sort((a, b) => b.id - a.id));
    } catch (error) {
      console.error('Failed to fetch attendance:', error);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── FILTERING ──
  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const searchText = globalFilters.searchText || '';
      if (searchText) {
        const q = searchText.toLowerCase();
        const field = globalFilters.searchBy || 'scheduleNo';
        if (field === 'scheduleNo' && !(row.schedule?.scheduleNo || '').toLowerCase().includes(q)) return false;
        if (field === 'participant' && !(row.employee?.employeeName || '').toLowerCase().includes(q)) return false;
      }
      if (globalQuery) {
        const q = globalQuery.toLowerCase();
        return (row.schedule?.scheduleNo || '').toLowerCase().includes(q) ||
               (row.employee?.employeeName || '').toLowerCase().includes(q);
      }
      return true;
    });
  }, [rows, globalQuery, globalFilters]);

  const paginatedRows = useMemo(() => filteredRows.slice(page * size, page * size + size), [filteredRows, page, size]);

  const handleAdd = () => setDialogOpen(true);
  useKeyboardShortcuts({ 'ctrl+n': handleAdd });

  // ── RENDER CELL ──
  const renderCell = (col, row, idx) => {
    const format12h = (time24) => {
      if (!time24) return '-';
      if (Array.isArray(time24)) {
        const [h, m] = time24;
        time24 = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
      }
      const [h, m] = time24.split(':');
      const hour = parseInt(h, 10);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const h12 = hour % 12 || 12;
      return `${h12.toString().padStart(2, '0')}:${m} ${ampm}`;
    };

    if (col.id === 'index') return idx + 1 + page * size;
    if (col.id === 'scheduleNo') return row.schedule?.scheduleNo || '-';
    if (col.id === 'participantName') return row.employee?.employeeName || '-';
    if (col.id === 'inTime') return format12h(row.inTime);
    if (col.id === 'outTime') return format12h(row.outTime);
    if (col.id === 'status') {
      const s = row.status || 'PRESENT';
      let chipStatus = 'ACTIVE';
      if (s === 'LATE') chipStatus = 'PENDING';
      if (s === 'ABSENT') chipStatus = 'INACTIVE';
      return <Chip label={s} size="small" sx={getStatusChipSx(chipStatus)} />;
    }
    return row[col.id] || '-';
  };

  const handleEdit = (row) => {
    setDialogOpen(true);
    setSelectedRow(row);
  };

  return (
    <MainCard
      title={
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <IconClock size={24} />
          <Typography variant="h3">Meeting User Attendance</Typography>
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
            filename="Meeting_User_Attendance"
            columns={[
              { header: 'Meeting Sch No', key: r => r.schedule?.scheduleNo || '' },
              { header: 'Participant', key: r => r.employee?.employeeName || '' },
              { header: 'In Time', key: r => {
                if (!r.inTime) return '-';
                let time24 = r.inTime;
                if (Array.isArray(time24)) {
                  const [hh, mm] = time24;
                  time24 = `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
                }
                const [h, m] = time24.split(':');
                const hour = parseInt(h, 10);
                const ampm = hour >= 12 ? 'PM' : 'AM';
                const h12 = hour % 12 || 12;
                return `${h12.toString().padStart(2, '0')}:${m} ${ampm}`;
              }},
              { header: 'Out Time', key: r => {
                if (!r.outTime) return '-';
                let time24 = r.outTime;
                if (Array.isArray(time24)) {
                  const [hh, mm] = time24;
                  time24 = `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
                }
                const [h, m] = time24.split(':');
                const hour = parseInt(h, 10);
                const ampm = hour >= 12 ? 'PM' : 'AM';
                const h12 = hour % 12 || 12;
                return `${h12.toString().padStart(2, '0')}:${m} ${ampm}`;
              }},
              { header: 'Status', key: 'status' }
            ]}
          />
          <Tooltip title={shortcutTooltip('Mark Attendance', 'Ctrl + N')}>
            <Button variant="contained" color="primary" size="medium" onClick={() => { setSelectedRow(null); setDialogOpen(true); }} sx={btnNew}>
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
        renderCell={renderCell}
        showActions={false}
        onDoubleClickRow={handleEdit}
        id="meeting-attendance-table"
      />

      <AttendanceEntryDialog
        open={dialogOpen}
        item={selectedRow}
        onClose={() => { setDialogOpen(false); setSelectedRow(null); }}
        onSave={() => { setDialogOpen(false); setSelectedRow(null); fetchData(); }}
      />
    </MainCard>
  );
}
