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
import { BOSExportButton } from 'ui-component/bos';

import { IconAdjustmentsHorizontal, IconChevronDown, IconChevronUp, IconX, IconFileDownload } from '@tabler/icons-react';

const columns = ['#', 'Category', 'Check Point', 'Dept', 'Level', 'Frequency', 'Stock Link', 'Comments', 'Verification Required', 'Assigned To', 'Assigned By', 'Status'];

const DEPARTMENTS = [
  'ACCOUNTS', 'ADMIN', 'ASSEMBLY', 'BUSINESS DEVELOPMENT', 'DESIGN & DEVELOPMENT',
  'HRA', 'LOGISTICS', 'MAINTENANCE', 'MANAGEMENT', 'MANAGEMENT REPRESENTATIVE',
  'OPERATIONS', 'PLANNING', 'PRODUCT DEVELOPMENT', 'PRODUCTION', 'PURCHASE',
  'QMS', 'QUALITY', 'SALES & MARKETING', 'STORES', 'STRATEGIC PROCUREMENT', 'TOP MANAGEMENT'
];

const DEFAULT_FILTERS = {
  fromDate: '',
  toDate: '',
  considerDate: 'All',
  status: 'All',

  // Add-on filters
  category: 'All',
  checkingPoint: '',
  department: [],
  level: '',
  frequency: 'All',
  stockLink: 'All',
  assignedTo: '',
  assignedBy: ''
};

const tableCols = [
  { id: 'category', label: 'Category' },
  { id: 'checkingPoint', label: 'Check Point' },
  { id: 'department', label: 'Dept' },
  { id: 'level', label: 'Level' },
  { id: 'frequency', label: 'Frequency' },
  { id: 'stockLink', label: 'Stock Link' },
  { id: 'remarks', label: 'Comments' },
  { id: 'verificationRequired', label: 'Verification Required' },
  { id: 'assignedTo', label: 'Assigned To' },
  { id: 'assignedBy', label: 'Assigned By' },
  { id: 'status', label: 'Status' }
];

const exportColumns = [
  { header: 'Category', key: (r) => r.checklist?.category },
  { header: 'Check Point', key: (r) => r.checklist?.checkingPoint },
  { header: 'Dept', key: (r) => (r.checklist?.departments || []).map(d => d.departmentName).join(', ') },
  { header: 'Level', key: () => '' },
  { header: 'Frequency', key: (r) => r.checklist?.frequency },
  { header: 'Stock Link', key: (r) => r.checklist?.stockLink },
  { header: 'Comments', key: 'remarks' },
  { header: 'Verification Required', key: (r) => r.checklist?.verificationRequired },
  { header: 'Assigned To', key: 'assignedTo' },
  { header: 'Assigned By', key: 'assignedBy' },
  { header: 'Status', key: (r) => typeof r.status === 'object' ? r.status?.name : r.status }
];

const filterConfig = [
  { id: 'fromDate', label: 'From Date', type: 'date', isStarred: true },
  { id: 'toDate', label: 'To Date', type: 'date', isStarred: true },
  {
    id: 'considerDate', label: 'Consider Date?', type: 'select', isStarred: true, defaultValue: 'All', options: [
      { value: 'All', label: 'All' },
      { value: 'Yes', label: 'Yes' },
      { value: 'No', label: 'No' }
    ]
  },
  {
    id: 'status', label: 'Status', type: 'select', isStarred: true, defaultValue: 'All', options: [
      { value: 'All', label: 'All' },
      { value: 'Open', label: 'Open' },
      { value: 'Pending for Verified', label: 'Pending for Verified' },
      { value: 'Verified', label: 'Verified' }
    ]
  },

  // The remaining fields in the table can be added by the "Add Filter" option (isStarred: false)
  {
    id: 'category', label: 'Category', type: 'select', isStarred: false, defaultValue: 'All', options: [
      { value: 'All', label: 'All' },
      { value: 'RENEWAL', label: 'RENEWAL' },
      { value: 'CHECK LIST', label: 'CHECK LIST' }
    ]
  },
  { id: 'checkingPoint', label: 'Check Point', type: 'text', isStarred: false },
  { id: 'department', label: 'Dept', type: 'autocomplete', multiple: true, isStarred: false, options: DEPARTMENTS.map(d => ({ value: d, label: d })) },
  { id: 'level', label: 'Level', type: 'text', isStarred: false },
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
  },
  { id: 'assignedTo', label: 'Assigned To', type: 'text', isStarred: false },
  { id: 'assignedBy', label: 'Assigned By', type: 'text', isStarred: false }
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
  const colorMap = { 'Open': 'info', 'Pending for Verified': 'warning', 'Verified': 'success' };
  const label = typeof status === 'object' ? status?.name : status;
  return <Chip label={label || 'Open'} size="small" color={colorMap[label] || 'default'} variant="outlined" />;
}

export default function CheckListRenewalReport() {
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
  const [openSections, setOpenSections] = useState({ dateRange:true, considerDate:false, status:true });
  const toggleSection = (key) => setOpenSections((p) => ({ ...p, [key]:!p[key] }));

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
          'fromDate', 'toDate', 'considerDate', 'status',
          'category', 'checkingPoint', 'department', 'level',
          'frequency', 'stockLink', 'assignedTo', 'assignedBy'
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

  const fetchReportData = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page,
        size,
        status: filters.status !== 'All' ? filters.status : undefined,
        fromDate: filters.fromDate || undefined,
        toDate: filters.toDate || undefined,
        considerDate: filters.considerDate !== 'All' ? filters.considerDate : undefined,
        searchValue: searchQuery || undefined,
        searchBy: undefined,

        // Add-on filters
        category: filters.category !== 'All' ? filters.category : undefined,
        checkingPoint: filters.checkingPoint || undefined,
        department: filters.department && filters.department.length > 0 ? filters.department[0] : undefined,
        level: filters.level || undefined,
        frequency: filters.frequency !== 'All' ? filters.frequency : undefined,
        stockLink: filters.stockLink !== 'All' ? filters.stockLink : undefined,
        assignedTo: filters.assignedTo || undefined,
        assignedBy: filters.assignedBy || undefined
      };
      const response = await axios.get('/api/qms/checklist/assignments', { params });
      setRows(response.data.content);
      setTotalElements(response.data.totalElements);
    } catch (error) {
      console.error('Failed to fetch report data:', error);
    } finally {
      setLoading(false);
    }
  }, [page, size, filters, searchQuery]);

  useEffect(() => {
    fetchReportData();
  }, [fetchReportData]);

  const setFilter = (key, val) => {
    setFilters((p) => ({ ...p, [key]: val }));
    setPage(0);
  };

  const resetFilters = () => {
    setFilters({ ...DEFAULT_FILTERS });
    setPage(0);
  };

  const activeCount = (filters.fromDate ? 1 : 0) + (filters.toDate ? 1 : 0) + (filters.considerDate !== 'All' ? 1 : 0) + (filters.status !== 'All' ? 1 : 0);

  return (
    <MainCard
      title="Check List / Renewal Report"
      secondary={
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <BOSExportButton data={rows} filename="Checklist_Report" columns={exportColumns} size="small" />
          <IconButton size="small" onClick={() => setDrawerOpen(true)}
            sx={{ border: '1px solid', borderColor: activeCount > 0 ? 'primary.main' : 'divider', bgcolor: activeCount > 0 ? 'primary.light' : 'transparent', borderRadius: 1.5, p: 0.8, position: 'relative' }}>
            <IconAdjustmentsHorizontal size={20} />
            {activeCount > 0 && <Box sx={{ position: 'absolute', top: -4, right: -4, width: 18, height: 18, borderRadius: '50%', bgcolor: 'error.main', color: '#fff', fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>{activeCount}</Box>}
          </IconButton>
        </Box>
      }
    >
      {activeCount > 0 && (
        <Box sx={{ display: 'flex', gap: 0.5, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <Typography variant="body2" sx={{ fontWeight: 600, mr: 0.5 }}>Filters:</Typography>
          {filters.fromDate && <Chip label={`From: ${filters.fromDate}`} size="small" color="info" onDelete={() => setFilter('fromDate', '')} />}
          {filters.toDate && <Chip label={`To: ${filters.toDate}`} size="small" color="info" onDelete={() => setFilter('toDate', '')} />}
          {filters.considerDate !== 'All' && <Chip label={`Consider Date: ${filters.considerDate}`} size="small" color="secondary" onDelete={() => setFilter('considerDate', 'All')} />}
          {filters.status !== 'All' && <Chip label={`Status: ${filters.status}`} size="small" color="warning" onDelete={() => setFilter('status', 'All')} />}
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

      <TableContainer component={Paper} sx={{ height: 'calc(100vh - 240px)', border: '1px solid', borderColor: 'divider', borderRadius: 0, '&::-webkit-scrollbar': { width: 10, height: 10 }, '&::-webkit-scrollbar-track': { backgroundColor: 'background.paper' }, '&::-webkit-scrollbar-thumb': { backgroundColor: 'grey.400', borderRadius: 2 } }}>
        <Table stickyHeader sx={{ minWidth: 1600 }} aria-label="renewal report table">
          <TableHead><TableRow>{columns.map((col, i) => <TableCell key={i} sx={{ bgcolor: 'primary.dark', color: 'white', fontWeight: 'bold', whiteSpace: 'nowrap', borderRight: '1px solid rgba(255,255,255,0.2)' }}>{col}</TableCell>)}</TableRow></TableHead>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={columns.length} align="center" sx={{ py: 6 }}><Typography variant="body1" color="textSecondary">Loading...</Typography></TableCell></TableRow>
            ) : rows.length === 0 ? (
              <TableRow><TableCell colSpan={columns.length} align="center" sx={{ py: 6 }}><Typography variant="body1" color="textSecondary">{searchQuery || activeCount > 0 ? 'No matching records found' : 'No data available in table'}</Typography></TableCell></TableRow>
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
                <TableCell>{row.checklist?.category}</TableCell>
                <TableCell>{row.checklist?.checkingPoint}</TableCell>
                <TableCell>{(row.checklist?.departments || []).map(d => d.departmentName).join(', ')}</TableCell>
                <TableCell></TableCell>
                <TableCell>{row.checklist?.frequency}</TableCell>
                <TableCell>{row.checklist?.stockLink}</TableCell>
                <TableCell>{row.remarks}</TableCell>
                <TableCell>{row.checklist?.verificationRequired}</TableCell>
                <TableCell>{row.assignedTo}</TableCell>
                <TableCell>{row.assignedBy}</TableCell>
                <TableCell><StatusChip status={row.status} /></TableCell>
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

      {/* FILTER DRAWER */}
      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)} PaperProps={{ sx: { width: 320 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>Filters</Typography>
          <IconButton size="small" onClick={() => setDrawerOpen(false)}><IconX size={20} /></IconButton>
        </Box>
        <Box sx={{ overflowY: 'auto', flex: 1 }}>
          <FilterSection title="Date Range" open={openSections.dateRange} onToggle={() => toggleSection('dateRange')}>
            <Box sx={{ mb: 1.5 }}>
              <Typography variant="caption" sx={{ fontWeight: 600, mb: 0.5, display: 'block' }}>From Date</Typography>
              <TextField size="small" type="date" fullWidth value={filters.fromDate} onChange={(e) => setFilter('fromDate', e.target.value)} InputLabelProps={{ shrink: true }} inputProps={{ min: new Date().toISOString().split('T')[0] }} />
            </Box>
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 600, mb: 0.5, display: 'block' }}>To Date</Typography>
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
            <FormControl><RadioGroup value={filters.status} onChange={(e) => setFilter('status', e.target.value)}>
              {['All', 'Open', 'Pending for Verified', 'Verified'].map((v) => <FormControlLabel key={v} value={v} control={<Radio size="small" />} label={<Typography variant="body2">{v}</Typography>} />)}
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
