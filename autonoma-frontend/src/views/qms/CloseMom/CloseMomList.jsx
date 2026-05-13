import { useState, useEffect, useCallback, useMemo } from 'react';
import { Typography, Stack, Button, Tooltip, IconButton, Chip } from '@mui/material';
import { IconCircleCheck, IconRefresh } from '@tabler/icons-react';
import axios from 'utils/axios';
import MainCard from 'ui-component/cards/MainCard';
import { useDispatch, useSelector } from 'react-redux';
import { setFilterConfig } from 'store/slices/search';
import { openSnackbar } from 'store/slices/snackbar';
import useKeyboardShortcuts from 'hooks/useKeyboardShortcuts';
import useLookups from 'hooks/useLookups';
import { BOSDataTable, BOSExportButton, getStatusChipSx } from 'ui-component/bos';
import { API_PATHS } from 'utils/api-constants';
import CloseMomDialog from './CloseMomDialog';

const columns = [
  { id: 'index', label: '#', minWidth: 50 },
  { id: 'momNo', label: 'Meeting Min No', minWidth: 200, bold: true },
  { id: 'momDate', label: 'MOM Date', minWidth: 120 },
  { id: 'scheduleNo', label: 'Meeting Sch No', minWidth: 180 },
  { id: 'discussedPoint', label: 'Discussed Point', minWidth: 300 },
  { id: 'pointType', label: 'Type', minWidth: 80 },
  { id: 'materialList', label: 'Material List', minWidth: 120 },
  { id: 'processType', label: 'Process', minWidth: 100 },
  { id: 'targetDate', label: 'Target Date', minWidth: 120 },
  { id: 'assignedTo', label: 'Assigned To', minWidth: 130 },
  { id: 'assignedBy', label: 'Assigned By', minWidth: 130 },
  { id: 'status', label: 'Status', minWidth: 140 },
  { id: 'createdAt', label: 'Created Date', minWidth: 140 },
  { id: 'attachmentRequired', label: 'Attachment Req', minWidth: 110 }
];

export default function CloseMomList() {
  const dispatch = useDispatch();
  const globalQuery = useSelector((state) => state.search.query);
  const globalFilters = useSelector((state) => state.search.filters);
  const lookups = useLookups(['EMPLOYEES']);

  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // ── GLOBAL FILTER CONFIG ──
  useEffect(() => {
    dispatch(setFilterConfig([
      {
        id: 'filterType', label: 'Type', type: 'select', isStarred: true,
        options: [
          { value: 'Mine', label: 'Mine' },
          { value: 'Team', label: 'Team' },
          { value: 'Both', label: 'Both' }
        ],
        defaultValue: 'Mine'
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
          { value: 'All', label: 'All' },
          { value: 'OPEN', label: 'OPEN' },
          { value: 'UNRESOLVED', label: 'UNRESOLVED' },
          { value: 'PENDING FOR APPROVAL', label: 'PENDING FOR APPROVAL' }
        ],
        defaultValue: 'All'
      },
      {
        id: 'searchBy', label: 'Search By', type: 'select', isStarred: true,
        options: [
          { value: 'momNo', label: 'Meeting Min No' },
          { value: 'discussedPoint', label: 'Discussed Point' }
        ],
        defaultValue: 'momNo'
      },
      { id: 'searchText', label: 'Search', type: 'text', placeholder: 'Search...', isStarred: true }
    ]));
    return () => dispatch(setFilterConfig(null));
  }, [dispatch]);

  // ── FETCH — Load only ACTION items ──
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(API_PATHS.QMS.MOMS);
      const momsRaw = Array.isArray(response.data) ? response.data : [];
      // Flatten: only ACTION process details
      const flat = [];
      momsRaw.forEach(mom => {
        (mom.details || []).forEach(detail => {
          if (detail.processType === 'ACTION') {
            flat.push({
              ...detail,
              _momId: mom.id,
              _momNo: mom.momNo,
              _momDate: mom.momDate,
              _scheduleNo: mom.schedule?.scheduleNo || '',
              _createdAt: mom.createdAt,
              _mom: mom
            });
          }
        });
      });
      setRows(flat);
    } catch (error) {
      console.error('Failed to fetch:', error);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── FILTERING ──
  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const statusFilter = globalFilters.status || 'All';
      if (statusFilter !== 'All' && (row.status || '') !== statusFilter) return false;

      const searchText = globalFilters.searchText || '';
      if (searchText) {
        const q = searchText.toLowerCase();
        const field = globalFilters.searchBy || 'momNo';
        if (field === 'momNo' && !(row._momNo || '').toLowerCase().includes(q)) return false;
        if (field === 'discussedPoint' && !(row.discussedPoint || '').toLowerCase().includes(q)) return false;
      }

      if (globalQuery) {
        const q = globalQuery.toLowerCase();
        return (row._momNo || '').toLowerCase().includes(q) || (row.discussedPoint || '').toLowerCase().includes(q);
      }
      return true;
    });
  }, [rows, globalQuery, globalFilters]);

  const paginatedRows = useMemo(() => filteredRows.slice(page * size, page * size + size), [filteredRows, page, size]);

  const handleOpenClose = (item) => { setSelectedItem(item); setDialogOpen(true); };

  // ── RENDER CELL ──
  const renderCell = (col, row, idx) => {
    if (col.id === 'index') return idx + 1 + page * size;
    if (col.id === 'momNo') return row._momNo || '-';
    if (col.id === 'momDate') return row._momDate || '-';
    if (col.id === 'scheduleNo') return row._scheduleNo || '-';
    if (col.id === 'discussedPoint') return row.discussedPoint || '-';
    if (col.id === 'assignedTo') return row.assignedTo?.employeeName || '-';
    if (col.id === 'assignedBy') return row.assignedBy?.employeeName || '-';
    if (col.id === 'targetDate') return row.targetDate || '-';
    if (col.id === 'createdAt') {
      if (!row._createdAt) return '-';
      const dt = new Date(row._createdAt);
      return `${dt.toLocaleDateString('en-GB')} ${dt.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`;
    }
    if (col.id === 'status') {
      const s = row.status || 'OPEN';
      let chipStatus = 'PENDING';
      if (s === 'CLOSED') chipStatus = 'ACTIVE';
      if (s === 'UNRESOLVED') chipStatus = 'INACTIVE';
      if (s === 'PENDING FOR APPROVAL') chipStatus = 'PENDING';
      return <Chip label={s} size="small" sx={getStatusChipSx(chipStatus)} />;
    }
    return row[col.id] || '-';
  };

  return (
    <MainCard
      title={
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <IconCircleCheck size={24} />
          <Typography variant="h3">Close MOM</Typography>
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
            filename="Close_MOM"
            columns={[
              { header: 'Meeting Min No', key: '_momNo' },
              { header: 'MOM Date', key: '_momDate' },
              { header: 'Discussed Point', key: 'discussedPoint' },
              { header: 'Target Date', key: 'targetDate' },
              { header: 'Status', key: 'status' }
            ]}
          />
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
        onDoubleClickRow={handleOpenClose}
        onEditRow={handleOpenClose}
        renderCell={renderCell}
        showActions={true}
        id="close-mom-table"
      />

      <CloseMomDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        item={selectedItem}
        onSave={() => { setDialogOpen(false); fetchData(); }}
      />
    </MainCard>
  );
}
