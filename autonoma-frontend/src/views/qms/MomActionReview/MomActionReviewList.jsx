import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Typography, Stack, Box, Button, Tooltip, IconButton, Chip 
} from '@mui/material';
import { 
  IconListCheck, IconRefresh, IconSettings, IconDeviceFloppy, IconCheck
} from '@tabler/icons-react';
import MainCard from 'ui-component/cards/MainCard';
import { setFilterConfig } from 'store/slices/search';
import { openSnackbar } from 'store/slices/snackbar';
import { BOSDataTable, BOSExportButton, getStatusChipSx } from 'ui-component/bos';
import axios from 'utils/axios';
import { API_PATHS } from 'utils/api-constants';
import MomActionClosureDialog from './MomActionClosureDialog';

// Reusable action status chip sx
const getActionStatusChipSx = (status) => {
  switch (status?.toUpperCase()) {
    case 'OPEN': return { bgcolor: 'error.lighter', color: 'error.dark', fontWeight: 800, border: '1px solid', borderColor: 'error.main' };
    case 'CLOSED': return { bgcolor: 'success.lighter', color: 'success.dark', fontWeight: 800, border: '1px solid', borderColor: 'success.main' };
    case 'UNRESOLVED': return { bgcolor: 'warning.lighter', color: 'warning.dark', fontWeight: 800, border: '1px solid', borderColor: 'warning.main' };
    case 'OVERDUE': return { bgcolor: 'error.main', color: 'white', fontWeight: 800, border: '1px solid', borderColor: 'error.dark' };
    case 'CANCELLED': return { bgcolor: 'grey.300', color: 'grey.700', fontWeight: 800, border: '1px solid', borderColor: 'grey.500' };
    case 'PENDING FOR APPROVAL': return { bgcolor: 'secondary.lighter', color: 'secondary.dark', fontWeight: 800, border: '1px solid', borderColor: 'secondary.main' };
    default: return getStatusChipSx('PENDING');
  }
};

const columns = [
  { id: 'index', label: '#', minWidth: 50, align: 'center' },
  { id: 'momNo', label: 'Meeting Min No', minWidth: 150, bold: true },
  { id: 'momDate', label: 'MOM Date', minWidth: 100 },
  { id: 'scheduleNo', label: 'Meeting Sch No', minWidth: 150 },
  { id: 'discussedPoint', label: 'Discussed Point', minWidth: 300, wrap: true },
  { id: 'pointType', label: 'Type', minWidth: 80 },
  { id: 'materialList', label: 'Material List', minWidth: 150 },
  { id: 'processType', label: 'Process', minWidth: 100 },
  { id: 'targetDate', label: 'Target Date', minWidth: 110 },
  { id: 'assignedBy', label: 'Assigned By', minWidth: 130 },
  { id: 'assignedTo', label: 'Assigned To', minWidth: 130 },
  { id: 'status', label: 'Status', minWidth: 140, align: 'center' },
  { id: 'createdAt', label: 'Created Date', minWidth: 140 },
  { id: 'attachmentRequired', label: 'Attachment Req', minWidth: 120, align: 'center' }
];

export default function MomActionReviewList() {
  const dispatch = useDispatch();
  const globalQuery = useSelector((state) => state.search.query);
  const globalFilters = useSelector((state) => state.search.filters);

  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState(null);

  useEffect(() => {
    dispatch(setFilterConfig([
      {
        id: 'dateType', label: 'Date Type', type: 'select', isStarred: true,
        options: [
          { value: 'targetDate', label: 'Target Date' },
          { value: 'createdAt', label: 'Create Date' },
          { value: 'momDate', label: 'MOM Date' }
        ],
        defaultValue: 'targetDate'
      },
      { id: 'fromDate', label: 'From Date', type: 'date', isStarred: true },
      { id: 'toDate', label: 'To Date', type: 'date', isStarred: true },
      {
        id: 'status', label: 'Status Filter', type: 'select', isStarred: true,
        options: [
          { value: 'All', label: 'ALL' },
          { value: 'OPEN', label: 'OPEN' },
          { value: 'UNRESOLVED', label: 'UNRESOLVED' },
          { value: 'PENDING FOR APPROVAL', label: 'PENDING FOR APPROVAL' },
          { value: 'CLOSED', label: 'CLOSED' },
          { value: 'OVERDUE', label: 'OVERDUE' }
        ],
        defaultValue: 'All'
      },
      {
        id: 'accessFilter', label: 'User Access', type: 'select', isStarred: true,
        options: [
          { value: 'Mine', label: 'Mine (My Assigned Actions)' },
          { value: 'Team', label: 'Team (My Created Actions)' },
          { value: 'All', label: 'All' }
        ],
        defaultValue: 'All'
      },
      {
        id: 'searchBy', label: 'Search By', type: 'select', isStarred: true,
        options: [
          { value: 'momNo', label: 'MOM Number' },
          { value: 'scheduleNo', label: 'Schedule Number' },
          { value: 'assignedTo', label: 'Assigned Employee' }
        ],
        defaultValue: 'momNo'
      },
      { id: 'searchText', label: 'Search Here', type: 'text', placeholder: 'Min 3 chars...', isStarred: true }
    ]));
    return () => dispatch(setFilterConfig(null));
  }, [dispatch]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_PATHS.QMS.MOMS}/actions`);
      let data = Array.isArray(response.data) ? response.data : [];
      
      // Calculate OVERDUE dynamically based on SOP
      const today = new Date().toISOString().split('T')[0];
      data = data.map(row => {
        if (row.targetDate && row.targetDate < today && row.status !== 'CLOSED' && row.status !== 'PENDING FOR APPROVAL') {
          return { ...row, displayStatus: 'OVERDUE' };
        }
        return { ...row, displayStatus: row.status };
      });
      
      setRows(data);
    } catch (error) {
      console.error('Failed to fetch MOM actions:', error);
      dispatch(openSnackbar({ open: true, message: 'Failed to load MOM actions', variant: 'alert', severity: 'error' }));
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      // Status Filter
      const statusFilter = globalFilters.status || 'All';
      if (statusFilter !== 'All' && row.displayStatus !== statusFilter) return false;

      // Access Filter (Mocked to employee name check for now)
      const accessFilter = globalFilters.accessFilter || 'All';
      // In a real app, this compares with loggedInUser.employeeName
      // if (accessFilter === 'Mine' && row.assignedTo !== loggedInUser.employeeName) return false;

      // Search Text Filter
      const searchText = globalFilters.searchText || '';
      if (searchText && searchText.length >= 3) {
        const q = searchText.toLowerCase();
        const searchField = globalFilters.searchBy || 'momNo';
        if (searchField === 'momNo' && !(row.momNo || '').toLowerCase().includes(q)) return false;
        if (searchField === 'scheduleNo' && !(row.scheduleNo || '').toLowerCase().includes(q)) return false;
        if (searchField === 'assignedTo' && !(row.assignedTo || '').toLowerCase().includes(q)) return false;
      }

      // Date Filtering
      if (globalFilters.fromDate && globalFilters.toDate) {
        const dateType = globalFilters.dateType || 'targetDate';
        let dateVal = null;
        if (dateType === 'targetDate') dateVal = row.targetDate;
        if (dateType === 'createdAt') dateVal = row.createdAt ? row.createdAt.split('T')[0] : null;
        if (dateType === 'momDate') dateVal = row.momDate;
        
        if (dateVal && (dateVal < globalFilters.fromDate || dateVal > globalFilters.toDate)) return false;
      }

      // Global Quick Search
      if (globalQuery) {
        const q = globalQuery.toLowerCase();
        return (row.momNo || '').toLowerCase().includes(q) ||
               (row.discussedPoint || '').toLowerCase().includes(q);
      }
      return true;
    });
  }, [rows, globalQuery, globalFilters]);

  const paginatedRows = useMemo(() => filteredRows.slice(page * size, page * size + size), [filteredRows, page, size]);

  const handleEdit = (item) => {
    setSelectedAction(item);
    setDialogOpen(true);
  };

  const renderCell = (col, row, idx) => {
    if (col.id === 'index') return idx + 1 + page * size;
    if (col.id === 'status') {
      return <Chip label={row.displayStatus || 'OPEN'} size="small" sx={getActionStatusChipSx(row.displayStatus)} />;
    }
    if (col.id === 'momDate' || col.id === 'targetDate') {
      return row[col.id] ? row[col.id].split('-').reverse().join('/') : '-';
    }
    if (col.id === 'createdAt') {
      if (!row.createdAt) return '-';
      const dt = new Date(row.createdAt);
      return `${dt.toLocaleDateString('en-GB')} ${dt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}`;
    }
    return row[col.id] || '-';
  };

  return (
    <MainCard
      title={
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <IconListCheck size={24} />
          <Typography variant="h3">MOM Action Review</Typography>
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
            filename="MOM_Actions_Summary"
            columns={[
              { header: '#', key: 'index' },
              { header: 'MOM Number', key: 'momNo' },
              { header: 'Discussed Point', key: 'discussedPoint' },
              { header: 'Target Date', key: 'targetDate' },
              { header: 'Assigned To', key: 'assignedTo' },
              { header: 'Status', key: 'displayStatus' }
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
        onDoubleClickRow={handleEdit}
        onEditRow={handleEdit}
        renderCell={renderCell}
        id="mom-action-review-table"
      />

      <MomActionClosureDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        item={selectedAction}
        onSave={() => { setDialogOpen(false); fetchData(); }}
      />
    </MainCard>
  );
}
