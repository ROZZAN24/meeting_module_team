import { useState, useEffect, useCallback, useMemo } from 'react';
import { Typography, Stack, Tooltip, IconButton, Chip } from '@mui/material';
import { IconShieldCheck, IconRefresh } from '@tabler/icons-react';
import axios from 'utils/axios';
import MainCard from 'ui-component/cards/MainCard';
import { useDispatch, useSelector } from 'react-redux';
import { setFilterConfig } from 'store/slices/search';
import { openSnackbar } from 'store/slices/snackbar';
import useLookups from 'hooks/useLookups';
import { BOSDataTable, BOSExportButton, getStatusChipSx } from 'ui-component/bos';
import { API_PATHS } from 'utils/api-constants';
import usePagePermissions, { PAGE_CODES } from 'hooks/usePagePermissions';
import MomApprovalDialog from './MomApprovalDialog';

const columns = [
  { id: 'index', label: '#', minWidth: 50 },
  { id: 'actionNo', label: 'Meeting Action No', minWidth: 200, bold: true },
  { id: 'discussedPoint', label: 'Discussed Point', minWidth: 300 },
  { id: 'actionTaken', label: 'Action Taken', minWidth: 200 },
  { id: 'actionObservation', label: 'Action Observation', minWidth: 200 },
  { id: 'targetDate', label: 'Target Date', minWidth: 120 },
  { id: 'assignedTo', label: 'Assigned To', minWidth: 130 },
  { id: 'createdBy', label: 'Created By', minWidth: 120 },
  { id: 'status', label: 'Status', minWidth: 160 },
  { id: 'createdAt', label: 'Created Date', minWidth: 140 }
];

export default function MomApprovalList() {
  const dispatch = useDispatch();
  const globalQuery = useSelector((state) => state.search.query);
  const globalFilters = useSelector((state) => state.search.filters);
  const perms = usePagePermissions(PAGE_CODES.QMS_MEETING_MOM_APPROVAL);
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
        options: [{ value: 'Mine', label: 'Mine' }, { value: 'All', label: 'All' }],
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
          { value: 'PENDING FOR APPROVAL', label: 'PENDING FOR APPROVAL' },
          { value: 'APPROVED', label: 'APPROVED' },
          { value: 'REJECTED', label: 'REJECTED' },
          { value: 'All', label: 'All' }
        ],
        defaultValue: 'PENDING FOR APPROVAL'
      },
      {
        id: 'searchBy', label: 'Search By', type: 'select', isStarred: true,
        options: [
          { value: 'actionNo', label: 'Action No' },
          { value: 'discussedPoint', label: 'Discussed Point' }
        ],
        defaultValue: 'actionNo'
      },
      { id: 'searchText', label: 'Search', type: 'text', placeholder: 'Search...', isStarred: true }
    ]));
    return () => dispatch(setFilterConfig(null));
  }, [dispatch]);

  // ── FETCH — Load only PENDING FOR APPROVAL + completed action items ──
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(API_PATHS.QMS.MOMS);
      const momsRaw = Array.isArray(response.data) ? response.data : [];
      momsRaw.sort((a, b) => b.id - a.id);
      const flat = [];
      momsRaw.forEach(mom => {
        (mom.details || []).forEach(detail => {
          // Show items that have been submitted for approval (not OPEN, not CREATED)
          if (detail.processType === 'ACTION' && detail.status !== 'OPEN' && detail.status !== 'CANCELLED') {
            flat.push({
              ...detail,
              _momId: mom.id,
              _momNo: mom.momNo,
              _momDate: mom.momDate,
              _scheduleNo: mom.schedule?.scheduleNo || '',
              _createdAt: detail.createdAt || mom.createdAt,
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
      const statusFilter = globalFilters.status || 'PENDING FOR APPROVAL';
      if (statusFilter !== 'All' && (row.status || '') !== statusFilter) return false;

      const searchText = globalFilters.searchText || '';
      if (searchText) {
        const q = searchText.toLowerCase();
        const field = globalFilters.searchBy || 'actionNo';
        if (field === 'actionNo' && !(row._momNo || '').toLowerCase().includes(q)) return false;
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

  const handleOpenApproval = (item) => { setSelectedItem(item); setDialogOpen(true); };

  // ── RENDER CELL ──
  const renderCell = (col, row, idx) => {
    if (col.id === 'index') return idx + 1 + page * size;
    if (col.id === 'actionNo') return row._momNo || '-';
    if (col.id === 'discussedPoint') return row.discussedPoint || '-';
    if (col.id === 'actionTaken') return row.actionTaken || '-';
    if (col.id === 'actionObservation') return row.actionObservation || '-';
    if (col.id === 'targetDate') return row.targetDate || '-';
    if (col.id === 'assignedTo') return row.assignedTo?.employeeName || '-';
    if (col.id === 'createdBy') return row.createdBy || '-';
    if (col.id === 'createdAt') {
      if (!row._createdAt) return '-';
      const dt = new Date(row._createdAt);
      return `${dt.toLocaleDateString('en-GB')} ${dt.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`;
    }
    if (col.id === 'status') {
      const s = row.status || 'PENDING FOR APPROVAL';
      let chipStatus = 'PENDING';
      if (s === 'APPROVED' || s === 'CLOSED') chipStatus = 'ACTIVE';
      if (s === 'REJECTED') chipStatus = 'INACTIVE';
      return <Chip label={s} size="small" sx={getStatusChipSx(chipStatus)} />;
    }
    return row[col.id] || '-';
  };

  return (
    <MainCard
      title={
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <IconShieldCheck size={24} />
          <Typography variant="h3">MOM Verify / Approval</Typography>
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
            data={filteredRows}
            filename="MOM_Approval"
            columns={[
              { header: 'Action No', key: '_momNo' },
              { header: 'Discussed Point', key: 'discussedPoint' },
              { header: 'Action Taken', key: 'actionTaken' },
              { header: 'Target Date', key: 'targetDate' },
              { header: 'Status', key: 'status' }
            ]}
          />}
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
        onDoubleClickRow={handleOpenApproval}
        onEditRow={handleOpenApproval}
        renderCell={renderCell}
        showActions={true}
        id="mom-approval-table"
      />

      <MomApprovalDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        item={selectedItem}
        onAction={() => { setDialogOpen(false); fetchData(); }}
      />
    </MainCard>
  );
}
