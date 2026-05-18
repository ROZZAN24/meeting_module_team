<<<<<<< HEAD
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
import InputAdornment from '@mui/material/InputAdornment';
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
import { useSelector } from 'react-redux';

import { IconAdjustmentsHorizontal, IconChevronDown, IconChevronUp, IconCheck, IconFileDownload, IconX } from '@tabler/icons-react';
import { exportToExcel } from 'utils/excelExport';

const columns = [
  '#', 'Task Type', 'Seq.No', 'Checking Point', 'Descriptions', 'Category', 'Frequency', 'Dept',
  'Date', 'Checklist Date', 'Next Due Date', 'Status', 'Attended Date', 'Attended By', 'Verification Required', 'Photo Required', 'Created Date', 'Created By'
];

const STATUS_OPTIONS = [
  'Pending','Started','Unresolved','Missed','Completed','Not Completed',
  '25%','50%','75%','Pending for Verified','Verified',
  'Pending for Accepted','Accepted','Attended'
];

const SEARCH_BY_OPTIONS = [
  { key:'All', label:'Global Search' },
  { key:'checkingPoint', label:'Checking Point' },
  { key:'seqNo', label:'Seq.No' }
];

const DEFAULT_FILTERS = {
  taskType: 'All',
  fromDate: '',
  toDate: '',
  considerDate: 'No',
  statuses: [],
  searchBy: 'All'
};

function FilterSection({ title, open, onToggle, children }) {
  return (
    <Box sx={{ mb:0.5 }}>
      <Box onClick={onToggle} sx={{ display:'flex', justifyContent:'space-between', alignItems:'center', cursor:'pointer', py:1, px:2, '&:hover':{ bgcolor:'action.hover' }, borderRadius:1 }}>
        <Typography variant="subtitle2" sx={{ fontWeight:700 }}>{title}</Typography>
        {open ? <IconChevronUp size={16}/> : <IconChevronDown size={16}/>}
      </Box>
      <Collapse in={open}><Box sx={{ px:2, pb:1 }}>{children}</Box></Collapse>
    </Box>
  );
}

function StatusChip({ status }) {
  const colorMap = { Pending:'warning', Started:'info', Completed:'success', Verified:'success', Accepted:'success', Attended:'success', Missed:'error', Unresolved:'error', 'Not Completed':'error', '25%':'warning', '50%':'warning', '75%':'info', 'Pending for Verified':'warning', 'Pending for Accepted':'warning' };
  const label = typeof status === 'object' ? status?.name : status;
  return <Chip label={label || 'Pending'} size="small" color={colorMap[label] || 'default'} variant="outlined"/>;
}

export default function CloseCheckListRenewal() {
=======
import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Typography, Box, Button, Stack, Tooltip, IconButton, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField
} from '@mui/material';
import {
  IconFileDownload,
  IconListCheck,
  IconRefresh,
  IconUser,
  IconCalendar,
  IconChecks,
  IconBan
} from '@tabler/icons-react';
import axios from 'utils/axios';
import { useDispatch, useSelector } from 'react-redux';
import { setFilterConfig } from 'store/slices/search';
import { openSnackbar } from 'store/slices/snackbar';
import MainCard from 'ui-component/cards/MainCard';
import { exportToExcel } from 'utils/excelExport';
import { BOSDataTable, BOSExportButton, btnExport, getStatusChipSx } from 'ui-component/bos';
import useLookups from 'hooks/useLookups';
import { API_PATHS } from 'utils/api-constants';
import ExecutionVerifyDialog from './ExecutionVerifyDialog';
import { autoUploadFile } from 'utils/upload-helper';

const columns = [
  { id: 'index', label: 'S.No', minWidth: 50 },
  { id: 'seqNo', label: 'Seq No', minWidth: 80, bold: true },
  { id: 'checkingPoint', label: 'Checking Point', minWidth: 200 },
  { id: 'category', label: 'Category', minWidth: 120 },
  { id: 'frequency', label: 'Frequency', minWidth: 120 },
  { id: 'department', label: 'Department', minWidth: 150 },
  { id: 'photoRequired', label: 'Photo Required', minWidth: 120 },
  { id: 'verificationRequired', label: 'Verification Required', minWidth: 150 },
  { id: 'stockLink', label: 'Stock Link', minWidth: 100 },
  { id: 'itemCode', label: 'Item Code', minWidth: 100 },
  { id: 'qty', label: 'Qty', minWidth: 80 },
  { id: 'assignTo', label: 'Assign To', minWidth: 120 },
  { id: 'checklistDate', label: 'Checklist Date', minWidth: 120 },
  { id: 'expiryDate', label: 'Expire Date', minWidth: 120 },
  { id: 'carryForward', label: 'Carry Forward Count', minWidth: 150 },
  { id: 'assignType', label: 'Assign Type', minWidth: 120 },
  { id: 'nextDueDate', label: 'NextDue Date/Next Expire Date', minWidth: 200 },
  { id: 'status', label: 'Status', minWidth: 150 }
];

const EXECUTION_STATUSES = ['-Select-', 'Started', '25%', '50%', '75%', 'Completed'];

const STATUS_OPTIONS = [
  'Pending', 'Pending for Verified', 'Pending for Accepted',
  'Accepted', 'Not Accepted', 'Verified', 'Rejected', 'Missed'
];

export default function CloseCheckListRenewal() {
  const dispatch = useDispatch();
>>>>>>> origin/chore/repo-cleanup
  const [rows, setRows] = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [loading, setLoading] = useState(false);
<<<<<<< HEAD

  const [selectedRowId, setSelectedRowId] = useState(null);
  const searchQuery = useSelector((state) => state.search.query);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [filters, setFilters] = useState({ ...DEFAULT_FILTERS });
  const [openSections, setOpenSections] = useState({ taskType: true, date: true, status: true, searchBy: false });
  const toggleSection = (key) => setOpenSections((p) => ({ ...p, [key]: !p[key] }));
=======
  const [selectedRow, setSelectedRow] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectRemarks, setRejectRemarks] = useState('');

  const globalQuery = useSelector((state) => state.search.query);
  const filters = useSelector((state) => state.search.filters);
  const lookups = useLookups(['EMPLOYEES']);

  useEffect(() => {
    dispatch(setFilterConfig([
      { id: 'taskType', label: 'Task Type', type: 'select', isStarred: true, options: [{ label: 'Mine', value: 'Mine' }, { label: 'Team', value: 'Team' }, { label: 'Company', value: 'Company' }], defaultValue: 'Mine' },
      { id: 'status', label: 'Status', type: 'select', isStarred: true, options: [{ label: 'All', value: 'All' }, ...STATUS_OPTIONS.map(s => ({ label: s, value: s }))], defaultValue: 'All' },
      { id: 'assignedTo', label: 'Assign To', type: 'autocomplete', multiple: true, isStarred: true, options: (lookups.employees || []).map(e => e.employeeName || `${e.firstName} ${e.lastName}`), defaultValue: [] },
      { id: 'seqNo', label: 'Seq No', type: 'text' },
      { id: 'checkingPoint', label: 'Checking Point', type: 'text' },
      { id: 'category', label: 'Category', type: 'select', options: [{ label: 'All', value: 'All' }, { label: 'Renewal', value: 'RENEWAL' }, { label: 'Check List', value: 'CHECK LIST' }], defaultValue: 'All' },
      { id: 'frequency', label: 'Frequency', type: 'select', options: [{ label: 'All', value: 'All' }, { label: 'DAILY', value: 'DAILY' }, { label: 'WEEKLY', value: 'WEEKLY' }, { label: 'MONTHLY', value: 'MONTHLY' }, { label: 'YEARLY', value: 'YEARLY' }], defaultValue: 'All' },
      { id: 'department', label: 'Department', type: 'text' },
      { id: 'photoRequired', label: 'Photo Required', type: 'select', options: [{ label: 'All', value: 'All' }, { label: 'YES', value: 'YES' }, { label: 'NO', value: 'NO' }], defaultValue: 'All' },
      { id: 'verificationRequired', label: 'Verification Required', type: 'select', options: [{ label: 'All', value: 'All' }, { label: 'YES', value: 'YES' }, { label: 'NO', value: 'NO' }], defaultValue: 'All' },
      { id: 'stockLink', label: 'Stock Link', type: 'text' },
      { id: 'itemCode', label: 'Item Code', type: 'text' },
      { id: 'qty', label: 'Qty', type: 'text' },
      { id: 'checklistDate', label: 'Checklist Date', type: 'date' },
      { id: 'expiryDate', label: 'Expire Date', type: 'date' },
      { id: 'assignType', label: 'Assign Type', type: 'select', options: [{ label: 'All', value: 'All' }, { label: 'PRIMARY', value: 'PRIMARY' }, { label: 'SECONDARY', value: 'SECONDARY' }], defaultValue: 'All' },
      { id: 'nextDueDate', label: 'NextDue Date', type: 'date' },
      { id: 'considerDate', label: 'Consider Date?', type: 'select', options: [{ label: 'No', value: 'No' }, { label: 'Yes', value: 'Yes' }], defaultValue: 'No' },
      { id: 'fromDate', label: 'From Date', type: 'date' },
      { id: 'toDate', label: 'To Date', type: 'date' }
    ]));
    return () => dispatch(setFilterConfig(null));
  }, [dispatch, lookups.employees]);
>>>>>>> origin/chore/repo-cleanup

  const fetchAssignments = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
<<<<<<< HEAD
        page,
        size,
        status: filters.statuses.length > 0 ? filters.statuses[0] : undefined,
        fromDate: filters.fromDate || undefined,
        toDate: filters.toDate || undefined,
        searchValue: searchQuery || undefined,
        searchBy: filters.searchBy !== 'All' ? filters.searchBy : undefined
      };
      const response = await axios.get('/api/qms/checklist/assignments', { params });
      setRows(response.data.content);
      setTotalElements(response.data.totalElements);
=======
        page, size,
        taskType: filters.taskType || 'Mine',
        status: filters.status !== 'All' ? filters.status : undefined,
        assignedTo: filters.assignedTo && filters.assignedTo.length > 0 ? filters.assignedTo.join(',') : undefined,
        category: filters.category !== 'All' ? filters.category : undefined,
        assignType: filters.assignType !== 'All' ? filters.assignType : undefined,
        seqNo: filters.seqNo || undefined,
        checkingPoint: filters.checkingPoint || undefined,
        frequency: filters.frequency !== 'All' ? filters.frequency : undefined,
        department: filters.department || undefined,
        photoRequired: filters.photoRequired !== 'All' ? filters.photoRequired : undefined,
        verificationRequired: filters.verificationRequired !== 'All' ? filters.verificationRequired : undefined,
        stockLink: filters.stockLink || undefined,
        itemCode: filters.itemCode || undefined,
        qty: filters.qty || undefined,
        checklistDate: filters.checklistDate || undefined,
        expiryDate: filters.expiryDate || undefined,
        nextDueDate: filters.nextDueDate || undefined,
        fromDate: filters.considerDate === 'Yes' ? filters.fromDate : undefined,
        toDate: filters.considerDate === 'Yes' ? filters.toDate : undefined,
        searchBy: filters.searchBy !== 'All' ? filters.searchBy : undefined,
        searchValue: globalQuery || undefined,
        masterVerifyStatus: 'Verified',
        excludeCompleted: true,
        taskType: filters.taskType || 'Mine',
        currentUser: 'Current User'
      };
      const response = await axios.get('/api/qms/checklist/assignments', { params });
      setRows(response.data.content || []);
      setTotalElements(response.data.totalElements || 0);
>>>>>>> origin/chore/repo-cleanup
    } catch (error) {
      console.error('Failed to fetch assignments:', error);
    } finally {
      setLoading(false);
    }
<<<<<<< HEAD
  }, [page, size, filters, searchQuery]);

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
=======
  }, [page, size, filters, globalQuery]);

  useEffect(() => { fetchAssignments(); }, [fetchAssignments]);

  // Accept or Not Accept the assignment
  const handleVerifyAction = async (status, remarks) => {
    if (!selectedRow) return;
    try {
      await axios.post('/api/qms/checklist/verify', {
        assignmentId: selectedRow.id,
        status: status,
        verifiedBy: 'Current User',
        remarks: remarks || `Action: ${status}`
      });
      dispatch(openSnackbar({
        open: true,
        message: `Checklist ${status} successfully!`,
        severity: status === 'Accepted' || status === 'Pending for Verified' ? 'success' : 'warning',
        variant: 'alert'
      }));
      setDialogOpen(false);
      setRejectDialogOpen(false);
      setRejectRemarks('');
      setSelectedRow(null);
      fetchAssignments();
    } catch (error) {
      console.error('Action failed:', error);
      dispatch(openSnackbar({ open: true, message: 'Action failed', severity: 'error', variant: 'alert' }));
>>>>>>> origin/chore/repo-cleanup
    }
  };

  const handleExport = () => {
<<<<<<< HEAD
    const exportData = rows.map((r, i) => ({
      '#': i + 1,
      'Task Type': r.assignType || 'Mine',
      'Seq No': r.checklist?.seqNo,
      'Checking Point': r.checklist?.checkingPoint,
      'Descriptions': r.checklist?.description,
      'Category': r.checklist?.category,
      'Frequency': r.checklist?.frequency,
      'Department': (r.checklist?.departments || []).map(d => d.departmentName).join(', '),
      'Date': r.assignedDate ? new Date(r.assignedDate).toLocaleDateString() : '',
      'Checklist Date': r.checklistDate,
      'Next Due Date': r.checklist?.nextDueDate,
      'Status': typeof r.status === 'object' ? r.status?.name : r.status,
      'Attended Date': r.attendedDate,
      'Attended By': r.attendedBy,
      'Verification Required': r.checklist?.verificationRequired,
      'Photo Required': r.checklist?.photoRequired,
      'Created Date': r.checklist?.createdDate ? new Date(r.checklist.createdDate).toLocaleDateString() : '',
      'Created By': r.checklist?.createdBy
    }));
    exportToExcel(exportData, 'Close_Checklist');
  };

  const activeCount = (filters.taskType !== 'All' ? 1 : 0) + (filters.fromDate ? 1 : 0) + (filters.toDate ? 1 : 0) + (filters.considerDate !== 'No' ? 1 : 0) + (filters.statuses?.length || 0);

  return (
    <MainCard
      title="Close Check List / Renewal"
      secondary={
        <Box sx={{ display:'flex', alignItems:'center', gap:1 }}>
          <Button variant="contained" color="primary" size="small" startIcon={<IconCheck size={18}/>} onClick={() => handleUpdateStatus('Completed')} disabled={!selectedRowId}>Complete Task</Button>
          <Button variant="outlined" color="primary" size="small" startIcon={<IconFileDownload size={18}/>} onClick={handleExport} sx={{ borderRadius: 1.5 }}>Export Excel</Button>
          <IconButton size="small" onClick={() => setDrawerOpen(true)}
            sx={{ border:'1px solid', borderColor: activeCount > 0 ? 'primary.main' : 'divider', bgcolor: activeCount > 0 ? 'primary.light' : 'transparent', borderRadius:1.5, p:0.8, position:'relative' }}>
            <IconAdjustmentsHorizontal size={20}/>
            {activeCount > 0 && <Box sx={{ position:'absolute', top:-4, right:-4, width:18, height:18, borderRadius:'50%', bgcolor:'error.main', color:'#fff', fontSize:11, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700 }}>{activeCount}</Box>}
          </IconButton>
        </Box>
      }
    >
      {activeCount > 0 && (
        <Box sx={{ display:'flex', gap:0.5, mb:2, flexWrap:'wrap', alignItems:'center' }}>
          <Typography variant="body2" sx={{ fontWeight:600, mr:0.5 }}>Filters:</Typography>
          {filters.taskType !== 'All' && <Chip label={`Task: ${filters.taskType}`} size="small" color="primary" onDelete={() => setFilter('taskType','All')}/>}
          {filters.fromDate && <Chip label={`From: ${filters.fromDate}`} size="small" color="info" onDelete={() => setFilter('fromDate','')}/>}
          {filters.toDate && <Chip label={`To: ${filters.toDate}`} size="small" color="info" onDelete={() => setFilter('toDate','')}/>}
          {filters.considerDate !== 'All' && <Chip label={`Consider Date: ${filters.considerDate}`} size="small" color="secondary" onDelete={() => setFilter('considerDate','All')}/>}
          {filters.statuses.map((s) => <Chip key={s} label={`Status: ${s}`} size="small" color="warning" onDelete={() => toggleStatus(s)}/>)}
          <Button size="small" color="error" onClick={resetFilters} sx={{ ml:1 }}>Clear All</Button>
        </Box>
      )}

      <TableContainer component={Paper} sx={{ maxHeight:'calc(100vh - 400px)', border:'1px solid', borderColor:'divider', '&::-webkit-scrollbar':{width:10,height:10}, '&::-webkit-scrollbar-track':{backgroundColor:'background.paper'}, '&::-webkit-scrollbar-thumb':{backgroundColor:'grey.400',borderRadius:2} }}>
        <Table stickyHeader sx={{ minWidth:2500 }} aria-label="close renewal table">
          <TableHead><TableRow>{columns.map((col,i) => <TableCell key={i} sx={{ bgcolor:'primary.dark', color:'white', fontWeight:'bold', whiteSpace:'nowrap', borderRight:'1px solid rgba(255,255,255,0.2)' }}>{col}</TableCell>)}</TableRow></TableHead>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={columns.length} align="center" sx={{ py:6 }}><Typography variant="body1" color="textSecondary">Loading...</Typography></TableCell></TableRow>
            ) : rows.length === 0 ? (
              <TableRow><TableCell colSpan={columns.length} align="center" sx={{ py:6 }}><Typography variant="body1" color="textSecondary">{searchQuery || activeCount > 0 ? 'No matching records found' : 'No data available in table'}</Typography></TableCell></TableRow>
            ) : rows.map((row, idx) => (
              <TableRow key={row.id} hover onClick={() => setSelectedRowId(row.id)} sx={{ cursor:'pointer', bgcolor: selectedRowId === row.id ? 'primary.light' : 'inherit' }}>
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
                <TableCell><StatusChip status={row.status}/></TableCell>
                <TableCell>{row.attendedDate}</TableCell>
                <TableCell>{row.attendedBy}</TableCell>
                <TableCell>{row.checklist?.verificationRequired}</TableCell>
                <TableCell>{row.checklist?.photoRequired}</TableCell>
                <TableCell>{row.checklist?.createdDate ? new Date(row.checklist.createdDate).toLocaleDateString() : ''}</TableCell>
                <TableCell>{row.checklist?.createdBy}</TableCell>
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
          '& .MuiTablePagination-toolbar': { justifyContent: 'center' },
          '& .MuiTablePagination-spacer': { display: 'none' }
        }}
      />



      {/* FILTER DRAWER */}
      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)} PaperProps={{ sx:{ width:320 } }}>
        <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'center', p:2, borderBottom:'1px solid', borderColor:'divider' }}>
          <Typography variant="h5" sx={{ fontWeight:700 }}>Filters</Typography>
          <IconButton size="small" onClick={() => setDrawerOpen(false)}><IconX size={20}/></IconButton>
        </Box>
        <Box sx={{ overflowY:'auto', flex:1 }}>
          <FilterSection title="Task Type" open={openSections.taskType} onToggle={() => toggleSection('taskType')}>
            <FormControl><RadioGroup value={filters.taskType} onChange={(e) => setFilter('taskType', e.target.value)}>
              {['All','Mine','Team','Company'].map((v) => <FormControlLabel key={v} value={v} control={<Radio size="small"/>} label={<Typography variant="body2">{v}</Typography>}/>)}
            </RadioGroup></FormControl>
          </FilterSection>
          <Divider/>
          <FilterSection title="Date Range" open={openSections.dateRange} onToggle={() => toggleSection('dateRange')}>
            <Box sx={{ mb:1.5 }}>
              <Typography variant="caption" sx={{ fontWeight:600, mb:0.5, display:'block' }}>From</Typography>
              <TextField size="small" type="date" fullWidth value={filters.fromDate} onChange={(e) => setFilter('fromDate', e.target.value)} InputLabelProps={{ shrink:true }}/>
            </Box>
            <Box>
              <Typography variant="caption" sx={{ fontWeight:600, mb:0.5, display:'block' }}>To</Typography>
              <TextField size="small" type="date" fullWidth value={filters.toDate} onChange={(e) => setFilter('toDate', e.target.value)} InputLabelProps={{ shrink:true }}/>
            </Box>
          </FilterSection>
          <Divider/>
          <FilterSection title="Consider Date?" open={openSections.considerDate} onToggle={() => toggleSection('considerDate')}>
            <FormControl><RadioGroup value={filters.considerDate} onChange={(e) => setFilter('considerDate', e.target.value)}>
              {['All','Yes','No'].map((v) => <FormControlLabel key={v} value={v} control={<Radio size="small"/>} label={<Typography variant="body2">{v}</Typography>}/>)}
            </RadioGroup></FormControl>
          </FilterSection>
          <Divider/>
          <FilterSection title="Status" open={openSections.status} onToggle={() => toggleSection('status')}>
            <Box>
              {STATUS_OPTIONS.map((s) => <FormControlLabel key={s} sx={{ display:'flex',ml:0,mr:0,py:0.2 }} control={<Checkbox size="small" checked={filters.statuses.includes(s)} onChange={() => toggleStatus(s)} sx={{ p:0.5 }}/>} label={<Typography variant="body2">{s}</Typography>}/>)}
            </Box>
          </FilterSection>
          <Divider/>
          <FilterSection title="Search By" open={openSections.searchBy} onToggle={() => toggleSection('searchBy')}>
            <FormControl fullWidth><RadioGroup value={filters.searchBy} onChange={(e) => setFilter('searchBy', e.target.value)}>
              {SEARCH_BY_OPTIONS.map((opt) => <FormControlLabel key={opt.key} value={opt.key} control={<Radio size="small"/>} label={<Typography variant="body2">{opt.label}</Typography>}/>)}
            </RadioGroup></FormControl>
          </FilterSection>
        </Box>
        <Box sx={{ p:2, borderTop:'1px solid', borderColor:'divider', display:'flex', gap:1 }}>
          <Button fullWidth variant="outlined" color="error" onClick={() => { resetFilters(); setDrawerOpen(false); }}>Reset All</Button>
          <Button fullWidth variant="contained" onClick={() => setDrawerOpen(false)}>Apply</Button>
        </Box>
      </Drawer>
=======
    const exportData = rows.map((r, i) => {
      const m = r.checklist || {};
      const statusRaw = r.status;
      const statusText = typeof statusRaw === 'object' ? statusRaw?.name : statusRaw;
      return {
        '#': i + 1,
        'Seq.No': m.seqNo,
        'Checking Point': m.checkingPoint,
        'Frequency': m.frequency,
        'Category': m.category,
        'Assign Type': r.assignType || 'NONE',
        'Photo Required': m.photoRequired || '-',
        'Verification Required': m.verificationRequired || '-',
        'Assign Date': r.assignedDate ? new Date(r.assignedDate).toLocaleDateString() : '-',
        'Next Renewal Date': (r.nextDueDate || m.nextDueDate) ? new Date(r.nextDueDate || m.nextDueDate).toLocaleDateString() : '-',
        'Assign To': r.assignedTo || m.assignTo || '-',
        'Created Date': r.assignedDate ? new Date(r.assignedDate).toLocaleString() : '-',
        'Verification Status': statusText || 'Pending'
      };
    });
    exportToExcel(exportData, 'Close_Checklist_Renewal');
  };

  const renderCell = (col, row, idx) => {
    if (col.id === 'index') return idx + 1 + page * size;
    const master = row.checklist || {};

    if (col.id === 'seqNo') return master.seqNo || '-';
    if (col.id === 'checkingPoint') return master.checkingPoint || '-';
    if (col.id === 'category') return master.category || '-';
    if (col.id === 'frequency') return master.frequency || '-';
    if (col.id === 'department') return (master.departments || []).map(d => d.departmentName).join(', ') || '-';
    if (col.id === 'photoRequired') return master.photoRequired || '-';
    if (col.id === 'verificationRequired') return master.verificationRequired || '-';
    if (col.id === 'stockLink') return master.stockLink || '-';
    if (col.id === 'itemCode') return master.itemCode || '-';
    if (col.id === 'qty') return master.qty || '-';
    if (col.id === 'assignTo') return row.assignedTo || master.assignTo || '-';
    if (col.id === 'checklistDate') return row.checklistDate ? new Date(row.checklistDate).toLocaleDateString() : '-';
    if (col.id === 'expiryDate') return master.expiryDate ? new Date(master.expiryDate).toLocaleDateString() : '-';
    if (col.id === 'carryForward') return row.carryForward || '0';
    if (col.id === 'assignType') return row.assignType || 'NONE';
    if (col.id === 'nextDueDate') {
      const next = row.nextDueDate || master.nextDueDate;
      return next ? new Date(next).toLocaleDateString() : '-';
    }

    if (col.id === 'status') {
      let s = row.status;
      if (typeof s === 'object' && s !== null) s = s.name;
      s = s || 'Pending';

      // SOP Rule 18: Expiry Status Logic
      const isExpired = master.expiryDate && new Date(master.expiryDate) < new Date();
      if (isExpired && s !== 'Verified' && s !== 'Accepted' && s !== 'Completed') {
        s = 'EXPIRED';
      }

      let chipStatus = 'PENDING';
      if (s === 'Accepted' || s === 'Verified' || s === 'Completed') chipStatus = 'ACTIVE';
      if (s === 'Rejected' || s === 'Not Accepted' || s === 'Missed' || s === 'EXPIRED') chipStatus = 'INACTIVE';
      return <Chip label={s} size="small" sx={getStatusChipSx(chipStatus)} />;
    }
    return row[col.id] || master[col.id] || '-';
  };

  return (
    <MainCard
      title={
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <IconListCheck size={24} />
          <Typography variant="h3">Close Check List / Renewal</Typography>
        </Stack>
      }
      secondary={
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Tooltip title="Refresh">
            <IconButton onClick={fetchAssignments} color="primary" size="small" sx={{ border: '2px solid', borderColor: 'divider', borderRadius: '8px', p: 1, transition: 'all 0.2s', '&:hover': { bgcolor: 'primary.light', transform: 'scale(1.05)' } }}>
              <IconRefresh size={20} />
            </IconButton>
          </Tooltip>
          <BOSExportButton
            data={rows}
            filename="Close_Checklist_Renewal"
            columns={[
              { header: 'Seq.No', key: 'seqNo' },
              { header: 'Checking Point', key: 'checkingPoint' },
              { header: 'Category', key: 'category' },
              { header: 'Status', key: 'status' }
            ]}
          />
        </Stack>
      }
    >
      <BOSDataTable
        columns={columns}
        rows={rows}
        page={page}
        size={size}
        totalCount={totalElements}
        loading={loading}
        onPageChange={setPage}
        onSizeChange={(s) => { setSize(s); setPage(0); }}
        onDoubleClickRow={(row) => { setSelectedRow(row); setDialogOpen(true); }}
        onClickRow={setSelectedRow}
        selectedRowId={selectedRow?.id}
        showActions={false}
        renderCell={renderCell}
        id="close-renewal-table"
        sx={{
          '& .MuiTableRow-root': {
            cursor: 'pointer',
            transition: 'background-color 0.2s',
            '&:hover': { bgcolor: 'primary.lighter' }
          },
          '& .expired-row': {
            bgcolor: 'error.lighter',
            '&:hover': { bgcolor: 'error.light' }
          }
        }}
        rowClassName={(row) => {
          const master = row.checklist || {};
          const isExpired = master.expiryDate && new Date(master.expiryDate) < new Date();
          const s = typeof row.status === 'object' ? row.status?.name : row.status;
          return (isExpired && s !== 'Verified' && s !== 'Accepted' && s !== 'Completed') ? 'expired-row' : '';
        }}
      />

      <ExecutionVerifyDialog
        open={dialogOpen}
        handleClose={() => setDialogOpen(false)}
        data={selectedRow}
        isExecution={true}
        onSave={async (updateData) => {
          try {
            setLoading(true);
            
            // Helper to upload files using automated system
            const uploadFile = async (fileObj) => {
              if (fileObj.isServer) return fileObj.serverFileName; // Already on server
              
              // autoUploadFile automatically detects 'QMS' from the URL
              const serverName = await autoUploadFile(fileObj.file);
              return fileObj.docDetails ? `${serverName}|${fileObj.docDetails}` : serverName;
            };

            const finalFiles = await Promise.all(updateData.actualFiles.map(uploadFile));

            await axios.post('/api/qms/checklist/verify', {
              assignmentId: selectedRow.id,
              status: updateData.status,
              remarks: updateData.remarks,
              actualFiles: finalFiles,
              verifiedBy: 'Current User'
            });

            dispatch(openSnackbar({ open: true, message: 'Progress saved successfully!', severity: 'success', variant: 'alert' }));
            setDialogOpen(false);
            fetchAssignments();
          } catch (error) {
            console.error('Failed to save progress:', error);
            dispatch(openSnackbar({ open: true, message: 'Failed to save progress', severity: 'error', variant: 'alert' }));
          } finally {
            setLoading(false);
          }
        }}
      />

      {/* ===== Not Accept Reason Dialog ===== */}
      <Dialog open={rejectDialogOpen} onClose={() => setRejectDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Not Accept — Provide Reason</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Reason / Comments"
            value={rejectRemarks}
            onChange={(e) => setRejectRemarks(e.target.value)}
            placeholder="Please explain why this is not accepted..."
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => handleVerifyAction('Not Accepted', rejectRemarks)}
            disabled={!rejectRemarks.trim()}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
>>>>>>> origin/chore/repo-cleanup
    </MainCard>
  );
}
