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
import { isMobile } from 'react-device-detect';

const columns = [
  { id: 'index', label: '#', minWidth: 50 },
  { id: 'actionNo', label: 'Meeting Action No', minWidth: 200, bold: true },
  { id: 'discussedPoint', label: 'Discussed Point', minWidth: 300 },
  { id: 'actionTaken', label: 'Action Taken', minWidth: 200 },
  { id: 'actionObservation', label: 'Action Observation', minWidth: 200 },
  { id: 'targetDate', label: 'Target Date', minWidth: 120 },
  { id: 'assignedTo', label: 'Assigned To', minWidth: 130 },
  { id: 'createdUser', label: 'CREATED USER', minWidth: 120 },
  { id: 'createdAt', label: 'CREATED DATE', minWidth: 140 },
  { id: 'updatedUser', label: 'UPDATED USER', minWidth: 120 },
  { id: 'updatedAt', label: 'UPDATED DATE', minWidth: 140 },
  { id: 'status', label: 'Status', minWidth: 160 }
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
              _updatedAt: detail.updatedAt || mom.updatedAt,
              createdUser: detail.createdUser || detail.createdBy || mom.createdUser || mom.createdBy || '-',
              updatedUser: detail.updatedUser || detail.updatedBy || mom.updatedUser || mom.updatedBy || '-',
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
    let val;
    if (col.id === 'index') val = idx + 1 + page * size;
    else if (col.id === 'actionNo') val = row._momNo || '-';
    else if (col.id === 'discussedPoint') val = row.discussedPoint || '-';
    else if (col.id === 'actionTaken') val = row.actionTaken || '-';
    else if (col.id === 'actionObservation') val = row.actionObservation || '-';
    else if (col.id === 'targetDate') val = row.targetDate || '-';
    else if (col.id === 'assignedTo') val = row.assignedTo?.employeeName || '-';
    else if (col.id === 'createdUser') val = row.createdUser || '-';
    else if (col.id === 'updatedUser') val = row.updatedUser || '-';
    else if (col.id === 'createdAt') {
      if (!row._createdAt) val = '-';
      else {
        const dt = new Date(row._createdAt);
        val = `${dt.toLocaleDateString('en-GB')} ${dt.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`;
      }
    } else if (col.id === 'updatedAt') {
      if (!row._updatedAt) val = '-';
      else {
        const dt = new Date(row._updatedAt);
        val = `${dt.toLocaleDateString('en-GB')} ${dt.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`;
      }
    } else if (col.id === 'status') {
      const s = row.status || 'PENDING FOR APPROVAL';
      let chipStatus = 'PENDING';
      if (s === 'APPROVED' || s === 'CLOSED') chipStatus = 'ACTIVE';
      if (s === 'REJECTED') chipStatus = 'INACTIVE';
      val = <Chip label={s} size="small" sx={getStatusChipSx(chipStatus)} />;
    } else {
      val = row[col.id] || '-';
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
