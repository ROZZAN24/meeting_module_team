import { useState, useEffect, useCallback } from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Drawer from '@mui/material/Drawer';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControl from '@mui/material/FormControl';
import Collapse from '@mui/material/Collapse';
import TablePagination from '@mui/material/TablePagination';
import axios from 'utils/axios';

import MainCard from 'ui-component/cards/MainCard';
import { useSelector, useDispatch } from 'react-redux';
import { setFilterConfig, setTableConfig } from 'store/slices/search';
import ExecutionVerifyDialog from './ExecutionVerifyDialog';
import useAuth from 'hooks/useAuth';
import { BOSExportButton } from 'ui-component/bos';

import { IconAdjustmentsHorizontal, IconChevronDown, IconChevronUp, IconCheck, IconFileDownload, IconX } from '@tabler/icons-react';

const columns = [
  '#', 'Task Type', 'Seq.No', 'Checking Point', 'Descriptions', 'Category', 'Frequency', 'Dept',
  'Date', 'Checklist Date', 'Next Due Date', 'Status', 'Attended Date', 'Attended By', 'Verification Required', 'Photo Required',
  'CREATED USER', 'CREATED DATE', 'UPDATED USER', 'UPDATED DATE'
];

const STATUS_OPTIONS = [
  'Pending', 'Started', 'Unresolved', 'Missed', 'Completed', 'Not Completed',
  '25%', '50%', '75%', 'Pending for Verified', 'Verified',
  'Pending for Accepted', 'Accepted', 'Attended'
];

const SEARCH_BY_OPTIONS = [
  { key: 'All', label: 'Global Search' },
  { key: 'checkingPoint', label: 'Checking Point' },
  { key: 'seqNo', label: 'Seq.No' }
];

const DEFAULT_FILTERS = {
  taskType: 'Mine',
  fromDate: '',
  toDate: '',
  considerDate: 'No',
  statuses: [],
  searchBy: 'All',

  // Add-on filter support
  seqNo: '',
  checkingPoint: '',
  category: 'All',
  frequency: 'All',
  stockLink: 'All'
};

const tableCols = [
  { id: 'taskType', label: 'Task Type' },
  { id: 'seqNo', label: 'Seq.No' },
  { id: 'checkingPoint', label: 'Checking Point' },
  { id: 'description', label: 'Descriptions' },
  { id: 'category', label: 'Category' },
  { id: 'frequency', label: 'Frequency' },
  { id: 'department', label: 'Dept' },
  { id: 'assignedDate', label: 'Date' },
  { id: 'checklistDate', label: 'Checklist Date' },
  { id: 'nextDueDate', label: 'Next Due Date' },
  { id: 'status', label: 'Status' },
  { id: 'attendedDate', label: 'Attended Date' },
  { id: 'attendedBy', label: 'Attended By' },
  { id: 'verificationRequired', label: 'Verification Required' },
  { id: 'photoRequired', label: 'Photo Required' },
  { id: 'createdBy', label: 'CREATED USER' },
  { id: 'createdDate', label: 'CREATED DATE' },
  { id: 'updatedBy', label: 'UPDATED USER' },
  { id: 'updatedDate', label: 'UPDATED DATE' }
];

const exportColumns = [
  { header: 'Task Type', key: (r) => r.assignType || 'Mine' },
  { header: 'Seq.No', key: (r) => r.checklist?.seqNo },
  { header: 'Checking Point', key: (r) => r.checklist?.checkingPoint },
  { header: 'Descriptions', key: (r) => r.checklist?.description },
  { header: 'Category', key: (r) => r.checklist?.category },
  { header: 'Frequency', key: (r) => r.checklist?.frequency },
  { header: 'Dept', key: (r) => (r.checklist?.departments || []).map(d => d.departmentName).join(', ') },
  { header: 'Date', key: (r) => r.assignedDate ? new Date(r.assignedDate).toLocaleDateString() : '' },
  { header: 'Checklist Date', key: 'checklistDate' },
  { header: 'Next Due Date', key: (r) => r.checklist?.nextDueDate },
  { header: 'Status', key: (r) => typeof r.status === 'object' ? r.status?.name : r.status },
  { header: 'Attended Date', key: 'attendedDate' },
  { header: 'Attended By', key: 'attendedBy' },
  { header: 'Verification Required', key: (r) => r.checklist?.verificationRequired },
  { header: 'Photo Required', key: (r) => r.checklist?.photoRequired },
  { header: 'CREATED USER', key: (r) => r.checklist?.createdBy },
  { header: 'CREATED DATE', key: (r) => r.checklist?.createdAt ? new Date(r.checklist.createdAt).toLocaleDateString() : (r.checklist?.createdDate ? new Date(r.checklist.createdDate).toLocaleDateString() : '') },
  { header: 'UPDATED USER', key: (r) => r.checklist?.updatedBy },
  { header: 'UPDATED DATE', key: (r) => r.checklist?.updatedAt ? new Date(r.checklist.updatedAt).toLocaleDateString() : '' }
];

const filterConfig = [
  {
    id: 'taskType', label: 'Task Type', type: 'select', isStarred: true, defaultValue: 'All', options: [
      { value: 'All', label: 'All' },
      { value: 'Mine', label: 'Mine' },
      { value: 'Team', label: 'Team' },
      { value: 'Company', label: 'Company' }
    ]
  },
  { id: 'fromDate', label: 'From Date', type: 'date', isStarred: true },
  { id: 'toDate', label: 'To Date', type: 'date', isStarred: true },
  {
    id: 'considerDate', label: 'Consider Date?', type: 'select', isStarred: true, defaultValue: 'No', options: [
      { value: 'All', label: 'All' },
      { value: 'Yes', label: 'Yes' },
      { value: 'No', label: 'No' }
    ]
  },
  { id: 'statuses', label: 'Status', type: 'autocomplete', multiple: true, isStarred: true, options: STATUS_OPTIONS.map(s => ({ value: s, label: s })) },
  {
    id: 'searchBy', label: 'Search by', type: 'select', isStarred: true, defaultValue: 'All', options: [
      { value: 'All', label: 'Global Search' },
      { value: 'checkingPoint', label: 'Checking Point' },
      { value: 'seqNo', label: 'Seq.No' }
    ]
  },

  // The remaining fields in the table can be added by the "Add Filter" option (isStarred: false)
  { id: 'seqNo', label: 'Sequence No', type: 'text', isStarred: false },
  { id: 'checkingPoint', label: 'Checking Point', type: 'text', isStarred: false },
  {
    id: 'category', label: 'Category', type: 'select', isStarred: false, defaultValue: 'All', options: [
      { value: 'All', label: 'All' },
      { value: 'RENEWAL', label: 'RENEWAL' },
      { value: 'CHECK LIST', label: 'CHECK LIST' }
    ]
  },
  {
    id: 'frequency', label: 'Frequency', type: 'select', isStarred: false, defaultValue: 'All', options: [
      { value: 'All', label: 'All' },
      { value: 'DAILY', label: 'DAILY' },
      { value: 'WEEKLY', label: 'WEEKLY' },
      { value: 'FORTNIGHTLY', label: 'FORTNIGHTLY' },
      { value: 'MONTHLY', label: 'MONTHLY' },
      { value: 'QUARTERLY', label: 'QUARTERLY' },
      { value: 'HALF YEARLY', label: 'HALF YEARLY' },
      { value: 'YEARLY', label: 'YEARLY' }
    ]
  },
  {
    id: 'stockLink', label: 'Stock Link', type: 'select', isStarred: false, defaultValue: 'All', options: [
      { value: 'All', label: 'All' },
      { value: 'YES', label: 'YES' },
      { value: 'NO', label: 'NO' }
    ]
  }
];

function FilterSection({ title, open, onToggle, children }) {
  return (
    <Box sx={{ mb: 0.5 }}>
      <Box onClick={onToggle} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', py: 1, px: 2, '&:hover': { bgcolor: 'action.hover' }, borderRadius: 1 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{title}</Typography>
        {open ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
      </Box>
      <Collapse in={open}><Box sx={{ px: 2, pb: 1 }}>{children}</Box></Collapse>
    </Box>
  );
}

function StatusChip({ status }) {
  const colorMap = { Pending: 'warning', Started: 'info', Completed: 'success', Verified: 'success', Accepted: 'success', Attended: 'success', Missed: 'error', Unresolved: 'error', 'Not Completed': 'error', '25%': 'warning', '50%': 'warning', '75%': 'info', 'Pending for Verified': 'warning', 'Pending for Accepted': 'warning' };
  const label = typeof status === 'object' ? status?.name : status;
  return <Chip label={label || 'Pending'} size="small" color={colorMap[label] || 'default'} variant="outlined" />;
}

export default function CloseCheckListRenewal() {
  const { user } = useAuth();
  const dispatch = useDispatch();
  const [rows, setRows] = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [loading, setLoading] = useState(false);

  const [selectedRowId, setSelectedRowId] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [showDoubleTap, setShowDoubleTap] = useState(false);
  const activeRow = rows.find((r) => r.id === selectedRowId) || null;
  const searchQuery = useSelector((state) => state.search.query);
  const globalFilters = useSelector((state) => state.search.filters) || {};
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [filters, setFilters] = useState({ ...DEFAULT_FILTERS });
  const [openSections, setOpenSections] = useState({ taskType: true, date: true, status: true, searchBy: false });
  const toggleSection = (key) => setOpenSections((p) => ({ ...p, [key]: !p[key] }));

  // Configure global search bar filters on mount
  useEffect(() => {
    dispatch(setFilterConfig(filterConfig));
    dispatch(setTableConfig(tableCols));
    return () => {
      dispatch(setFilterConfig(null));
      dispatch(setTableConfig(null));
    };
  }, [dispatch]);

  // Sync global search filters with local filters
  useEffect(() => {
    if (Object.keys(globalFilters).length > 0) {
      setFilters((prev) => {
        const newFilters = { ...prev };
        let hasChanges = false;

        const filterKeys = [
          'taskType', 'fromDate', 'toDate', 'considerDate', 'statuses',
          'searchBy', 'seqNo', 'checkingPoint', 'category',
          'frequency', 'stockLink'
        ];

        filterKeys.forEach((key) => {
          if (globalFilters[key] !== undefined && globalFilters[key] !== prev[key]) {
            newFilters[key] = globalFilters[key];
            hasChanges = true;
          }
        });

        return hasChanges ? newFilters : prev;
      });
    }
  }, [globalFilters]);

  const fetchAssignments = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page,
        size,
        status: filters.statuses.length > 0 ? filters.statuses[0] : undefined,
        fromDate: filters.fromDate || undefined,
        toDate: filters.toDate || undefined,
        considerDate: filters.considerDate !== 'All' ? filters.considerDate : undefined,
        searchValue: searchQuery || undefined,
        searchBy: filters.searchBy !== 'All' ? filters.searchBy : undefined,

        // Task Filtering
        taskType: filters.taskType !== 'All' ? filters.taskType : undefined,
        currentUser: user?.name || user?.id || undefined,

        // Add-on filters
        seqNo: filters.seqNo || undefined,
        checkingPoint: filters.checkingPoint || undefined,
        category: filters.category !== 'All' ? filters.category : undefined,
        frequency: filters.frequency !== 'All' ? filters.frequency : undefined,
        stockLink: filters.stockLink !== 'All' ? filters.stockLink : undefined
      };
      const response = await axios.get('/api/qms/checklist/assignments', { params });
      setRows(response.data.content);
      setTotalElements(response.data.totalElements);
    } catch (error) {
      console.error('Failed to fetch assignments:', error);
    } finally {
      setLoading(false);
    }
  }, [page, size, filters, searchQuery, user]);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  const setFilter = (key, val) => {
    setFilters((p) => ({ ...p, [key]: val }));
    setPage(0);
  };

  const toggleStatus = (status) => {
    setFilters((p) => {
      const arr = p.statuses || [];
      return { ...p, statuses: arr.includes(status) ? arr.filter((s) => s !== status) : [...arr, status] };
    });
    setPage(0);
  };

  const resetFilters = () => {
    setFilters({ ...DEFAULT_FILTERS });
    setPage(0);
  };

  const handleUpdateStatus = async (status) => {
    if (!selectedRowId) return;
    try {
      await axios.post('/api/qms/checklist/verify', {
        assignmentId: selectedRowId,
        status: status,
        verifiedBy: 'Current User',
        remarks: `Status updated to ${status}`
      });
      fetchAssignments();
    } catch (error) {
      console.error('Failed to update assignment status:', error);
    }
  };

  const activeCount = (filters.taskType !== 'Mine' ? 1 : 0) + (filters.fromDate ? 1 : 0) + (filters.toDate ? 1 : 0) + (filters.considerDate !== 'No' ? 1 : 0) + (filters.statuses?.length || 0);

  return (
    <MainCard
      title="Close Check List / Renewal"
      secondary={
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Button variant="contained" color="primary" size="small" startIcon={<IconCheck size={18} />} onClick={() => handleUpdateStatus('Completed')} disabled={!selectedRowId}>Complete Task</Button>
          <BOSExportButton data={rows} filename="Close_Checklist" columns={exportColumns} size="small" />
        </Box>
      }
    >
      {activeCount > 0 && (
        <Box sx={{ display: 'flex', gap: 0.5, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <Typography variant="body2" sx={{ fontWeight: 600, mr: 0.5 }}>Filters:</Typography>
          {filters.taskType !== 'Mine' && <Chip label={`Task: ${filters.taskType}`} size="small" color="primary" onDelete={() => setFilter('taskType', 'Mine')} />}
          {filters.fromDate && <Chip label={`From: ${filters.fromDate}`} size="small" color="info" onDelete={() => setFilter('fromDate', '')} />}
          {filters.toDate && <Chip label={`To: ${filters.toDate}`} size="small" color="info" onDelete={() => setFilter('toDate', '')} />}
          {filters.considerDate !== 'All' && <Chip label={`Consider Date: ${filters.considerDate}`} size="small" color="secondary" onDelete={() => setFilter('considerDate', 'All')} />}
          {filters.statuses.map((s) => <Chip key={s} label={`Status: ${s}`} size="small" color="warning" onDelete={() => toggleStatus(s)} />)}
          <Button size="small" color="error" onClick={resetFilters} sx={{ ml: 1 }}>Clear All</Button>
        </Box>
      )}

      {/* ── Cursor-following 'Double tap' label ── */}
      {showDoubleTap && (
        <Box
          sx={{
            position: 'fixed',
            left: cursorPos.x + 14,
            top: cursorPos.y - 28,
            bgcolor: 'grey.800',
            color: '#fff',
            px: 1,
            py: 0.3,
            borderRadius: 1,
            fontSize: '0.7rem',
            fontWeight: 600,
            pointerEvents: 'none',
            zIndex: 9999,
            letterSpacing: 0.4,
            userSelect: 'none',
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
            whiteSpace: 'nowrap'
          }}
        >
          Double tap
        </Box>
      )}

      <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 185px)' }}>
        <TableContainer component={Paper} sx={{ flexGrow: 1, border: '1px solid', borderColor: 'divider', borderRadius: 0, '&::-webkit-scrollbar': { width: 10, height: 10 }, '&::-webkit-scrollbar-track': { backgroundColor: 'background.paper' }, '&::-webkit-scrollbar-thumb': { backgroundColor: 'grey.400', borderRadius: 2 } }}>
          <Table stickyHeader sx={{ minWidth: 2500 }} aria-label="close renewal table">
            <TableHead><TableRow>{columns.map((col, i) => <TableCell key={i} sx={{ bgcolor: 'primary.dark', color: 'white', fontWeight: 'bold', whiteSpace: 'nowrap', borderRight: '1px solid rgba(255,255,255,0.2)' }}>{col}</TableCell>)}</TableRow></TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={columns.length} sx={{ p: 0, border: 'none' }}>
                    <Box sx={{ position: 'sticky', left: 0, width: '100%', maxWidth: 'calc(100vw - 280px)', display: 'flex', justifyContent: 'center', py: 6 }}>
                      <Typography variant="body1" color="textSecondary">Loading...</Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length} sx={{ p: 0, border: 'none' }}>
                    <Box sx={{ position: 'sticky', left: 0, width: '100%', maxWidth: 'calc(100vw - 280px)', display: 'flex', justifyContent: 'center', py: 6 }}>
                      <Typography variant="body1" color="textSecondary">
                        {searchQuery || activeCount > 0 ? 'No matching records found' : 'No data available in table'}
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : rows.map((row, idx) => (
                <TableRow
                  key={row.id}
                  hover
                  onClick={() => setSelectedRowId(row.id)}
                  onDoubleClick={() => { setSelectedRowId(row.id); setDialogOpen(true); }}
                  onMouseEnter={() => setShowDoubleTap(true)}
                  onMouseLeave={() => setShowDoubleTap(false)}
                  onMouseMove={(e) => setCursorPos({ x: e.clientX, y: e.clientY })}
                  sx={{ cursor: 'pointer', bgcolor: selectedRowId === row.id ? 'primary.light' : 'inherit' }}
                >
                  <TableCell>{page * size + idx + 1}</TableCell>
                  <TableCell>{row.assignType || 'Mine'}</TableCell>
                  <TableCell>{row.checklist?.seqNo}</TableCell>
                  <TableCell>{row.checklist?.checkingPoint}</TableCell>
                  <TableCell>{row.checklist?.description}</TableCell>
                  <TableCell>{row.checklist?.category}</TableCell>
                  <TableCell>{row.checklist?.frequency}</TableCell>
                  <TableCell>{(row.checklist?.departments || []).map(d => d.departmentName).join(', ')}</TableCell>
                  <TableCell>{row.assignedDate ? new Date(row.assignedDate).toLocaleDateString() : ''}</TableCell>
                  <TableCell>{row.checklistDate}</TableCell>
                  <TableCell>{row.checklist?.nextDueDate}</TableCell>
                  <TableCell><StatusChip status={row.status} /></TableCell>
                  <TableCell>{row.attendedDate}</TableCell>
                  <TableCell>{row.attendedBy}</TableCell>
                  <TableCell>{row.checklist?.verificationRequired}</TableCell>
                  <TableCell>{row.checklist?.photoRequired}</TableCell>
                  <TableCell>{row.checklist?.createdBy || '-'}</TableCell>
                  <TableCell>{row.checklist?.createdAt ? new Date(row.checklist.createdAt).toLocaleDateString() : (row.checklist?.createdDate ? new Date(row.checklist.createdDate).toLocaleDateString() : '')}</TableCell>
                  <TableCell>{row.checklist?.updatedBy || '-'}</TableCell>
                  <TableCell>{row.checklist?.updatedAt ? new Date(row.checklist.updatedAt).toLocaleDateString() : '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={totalElements}
          page={page}
          onPageChange={(e, p) => setPage(p)}
          rowsPerPage={size}
          onRowsPerPageChange={(e) => { setSize(parseInt(e.target.value, 10)); setPage(0); }}
          rowsPerPageOptions={[5, 10, 25, 50]}
          sx={{
            minHeight: '36px !important',
            height: '36px !important',
            overflow: 'hidden',
            '& .MuiTablePagination-toolbar': {
              justifyContent: 'center',
              flexWrap: 'nowrap',
              minHeight: '36px !important',
              height: '36px',
              p: '0px !important',
              gap: 1
            },
            '& .MuiTablePagination-spacer': { display: 'none' },
            '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
              margin: 0,
              fontSize: '0.75rem',
              fontWeight: 500
            },
            '& .MuiTablePagination-select': {
              py: '2px',
              fontSize: '0.75rem',
              fontWeight: 500
            },
            '& .MuiTablePagination-actions': {
              margin: 0
            }
          }}
        />
      </Box>



      {/* FILTER DRAWER */}
      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)} PaperProps={{ sx: { width: 320 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>Filters</Typography>
          <IconButton size="small" onClick={() => setDrawerOpen(false)}><IconX size={20} /></IconButton>
        </Box>
        <Box sx={{ overflowY: 'auto', flex: 1 }}>
          <FilterSection title="Task Type" open={openSections.taskType} onToggle={() => toggleSection('taskType')}>
            <FormControl><RadioGroup value={filters.taskType} onChange={(e) => setFilter('taskType', e.target.value)}>
              {['All', 'Mine', 'Team', 'Company'].map((v) => <FormControlLabel key={v} value={v} control={<Radio size="small" />} label={<Typography variant="body2">{v}</Typography>} />)}
            </RadioGroup></FormControl>
          </FilterSection>
          <Divider />
          <FilterSection title="Date Range" open={openSections.dateRange} onToggle={() => toggleSection('dateRange')}>
            <Box sx={{ mb: 1.5 }}>
              <Typography variant="caption" sx={{ fontWeight: 600, mb: 0.5, display: 'block' }}>From</Typography>
              <TextField size="small" type="date" fullWidth value={filters.fromDate} onChange={(e) => setFilter('fromDate', e.target.value)} InputLabelProps={{ shrink: true }} inputProps={{ min: new Date().toISOString().split('T')[0] }} />
            </Box>
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 600, mb: 0.5, display: 'block' }}>To</Typography>
              <TextField size="small" type="date" fullWidth value={filters.toDate} onChange={(e) => setFilter('toDate', e.target.value)} InputLabelProps={{ shrink: true }} inputProps={{ min: new Date().toISOString().split('T')[0] }} />
            </Box>
          </FilterSection>
          <Divider />
          <FilterSection title="Consider Date?" open={openSections.considerDate} onToggle={() => toggleSection('considerDate')}>
            <FormControl><RadioGroup value={filters.considerDate} onChange={(e) => setFilter('considerDate', e.target.value)}>
              {['All', 'Yes', 'No'].map((v) => <FormControlLabel key={v} value={v} control={<Radio size="small" />} label={<Typography variant="body2">{v}</Typography>} />)}
            </RadioGroup></FormControl>
          </FilterSection>
          <Divider />
          <FilterSection title="Status" open={openSections.status} onToggle={() => toggleSection('status')}>
            <Box>
              {STATUS_OPTIONS.map((s) => <FormControlLabel key={s} sx={{ display: 'flex', ml: 0, mr: 0, py: 0.2 }} control={<Checkbox size="small" checked={filters.statuses.includes(s)} onChange={() => toggleStatus(s)} sx={{ p: 0.5 }} />} label={<Typography variant="body2">{s}</Typography>} />)}
            </Box>
          </FilterSection>
          <Divider />
          <FilterSection title="Search By" open={openSections.searchBy} onToggle={() => toggleSection('searchBy')}>
            <FormControl fullWidth><RadioGroup value={filters.searchBy} onChange={(e) => setFilter('searchBy', e.target.value)}>
              {SEARCH_BY_OPTIONS.map((opt) => <FormControlLabel key={opt.key} value={opt.key} control={<Radio size="small" />} label={<Typography variant="body2">{opt.label}</Typography>} />)}
            </RadioGroup></FormControl>
          </FilterSection>
        </Box>
        <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider', display: 'flex', gap: 1 }}>
          <Button fullWidth variant="outlined" color="error" onClick={() => { resetFilters(); setDrawerOpen(false); }}>Reset All</Button>
          <Button fullWidth variant="contained" onClick={() => setDrawerOpen(false)}>Apply</Button>
        </Box>
      </Drawer>
      <ExecutionVerifyDialog
        open={dialogOpen}
        handleClose={() => setDialogOpen(false)}
        data={activeRow}
        isExecution={false}
      />
    </MainCard>
  );
}
