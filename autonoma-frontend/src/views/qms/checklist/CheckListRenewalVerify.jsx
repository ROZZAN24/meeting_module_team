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

import { IconAdjustmentsHorizontal, IconChevronDown, IconChevronUp, IconCheck, IconBan, IconFileDownload, IconX } from '@tabler/icons-react';
import { exportToExcel } from 'utils/excelExport';

const columns = [
  '#', 'Task Type', 'Seq No', 'Checking Point', 'Descriptions', 'Category', 'Frequency', 'Dept',
  'Date', 'Checklist Date', 'Status', 'Next Due Date', 'Assigned To'
=======
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Typography, Box, Button, Stack, Tooltip, IconButton, Chip } from '@mui/material';
import {
  IconBan,
  IconFileDownload,
  IconRefresh,
  IconChecks,
  IconX,
  IconEye
} from '@tabler/icons-react';
import axios from 'utils/axios';
import { useDispatch, useSelector } from 'react-redux';
import { setFilterConfig } from 'store/slices/search';
import { openSnackbar } from 'store/slices/snackbar';
import MainCard from 'ui-component/cards/MainCard';
import { exportToExcel } from 'utils/excelExport';
import { BOSDataTable, BOSExportButton, btnExport, getStatusChipSx } from 'ui-component/bos';
import useKeyboardShortcuts from 'hooks/useKeyboardShortcuts';
import useLookups from 'hooks/useLookups';
import { AddCheckListDialog } from './AddCheckListDialog';
import ExecutionVerifyDialog from './ExecutionVerifyDialog';
import { Tabs, Tab, TextField, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { API_PATHS } from 'utils/api-constants';
import { BOSFileGallery } from 'ui-component/bos';
import { autoUploadFile } from 'utils/upload-helper';

const columns = [
  { id: 'index', label: '#', minWidth: 50 },
  { id: 'category', label: 'Category', minWidth: 120 },
  { id: 'checkingPoint', label: 'Check Point', minWidth: 200 },
  { id: 'department', label: 'Dept', minWidth: 150 },
  { id: 'level', label: 'Level', minWidth: 100 },
  { id: 'frequency', label: 'Frequency', minWidth: 120 },
  { id: 'stockLink', label: 'Stock Link', minWidth: 100 },
  { id: 'remarks', label: 'Comments', minWidth: 200 },
  { id: 'verificationRequired', label: 'Verification Required', minWidth: 150 },
  { id: 'assignedTo', label: 'Assigned To', minWidth: 120 },
  { id: 'assignedBy', label: 'Assigned By', minWidth: 120 },
  { id: 'status', label: 'Status', minWidth: 150 }
];

const masterColumns = [
  { id: 'index', label: '#', minWidth: 50 },
  { id: 'seqNo', label: 'Seq No', minWidth: 80, bold: true },
  { id: 'checkingPoint', label: 'Checking Point', minWidth: 200 },
  { id: 'category', label: 'Category', minWidth: 120 },
  { id: 'frequency', label: 'Frequency', minWidth: 120 },
  { id: 'department', label: 'Department', minWidth: 150 },
  { id: 'effectiveFrom', label: 'Effective From', minWidth: 120 },
  { id: 'reminderDays', label: 'Days', minWidth: 80 },
  { id: 'expiryDate', label: 'Expire Date', minWidth: 120 },
  { id: 'stockLink', label: 'Stock Link', minWidth: 100 },
  { id: 'createdDate', label: 'Created Date', minWidth: 120 },
  { id: 'createdBy', label: 'Created By', minWidth: 120 },
  { id: 'verifyStatus', label: 'Verify Status', minWidth: 150 },
  { id: 'verifiedBy', label: 'Verified By', minWidth: 120 },
  { id: 'verifiedDate', label: 'Verified Date', minWidth: 120 }
>>>>>>> origin/chore/repo-cleanup
];

const STATUS_OPTIONS = ['Pending for Verified', 'Pending for Accepted', 'Verified', 'Rejected', 'Not Accepted', 'Accepted', 'Missed'];

<<<<<<< HEAD
const SEARCH_BY_OPTIONS = [
  { key:'All', label:'Global Search' },
  { key:'checkingPoint', label:'Checking Point' },
  { key:'description', label:'Descriptions' },
  { key:'seqNo', label:'Seq.No' }
];

const DEFAULT_FILTERS = {
  taskType: 'All',
  fromDate: '',
  toDate: '',
  considerDate: 'No',
  statuses: [],
  assignTo: '',
  category: 'All',
  searchBy: 'All',
  searchByValue: ''
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
  const colorMap = { 'Pending for Verified':'warning', 'Pending for Accepted':'warning', Verified:'success', Rejected:'error', 'Not Accepted':'error', Accepted:'success', Missed:'error' };
  const label = typeof status === 'object' ? status?.name : status;
  return <Chip label={label || 'Pending'} size="small" color={colorMap[label] || 'default'} variant="outlined"/>;
}

export default function CheckListRenewalVerify() {
=======
export default function CheckListRenewalVerify() {
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
  const [openSections, setOpenSections] = useState({ taskType: true, date: true, status: true, assignTo: false, category: false, searchBy: false });
  const toggleSection = (key) => setOpenSections((p) => ({ ...p, [key]: !p[key] }));
=======
  const [selectedRow, setSelectedRow] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0); // 0: Assignments, 1: Master Records (Dual Check)
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectRemarks, setRejectRemarks] = useState('');
  const [previewOpen, setPreviewOpen] = useState(false);

  const globalQuery = useSelector((state) => state.search.query);
  const filters = useSelector((state) => state.search.filters);

  const lookups = useLookups(['EMPLOYEES']);

  useEffect(() => {
    dispatch(setFilterConfig([
      { id: 'taskType', label: 'Task Type', type: 'select', isStarred: true, options: [{ label: 'Mine', value: 'Mine' }, { label: 'Team', value: 'Team' }, { label: 'All', value: 'All' }], defaultValue: 'Mine' },
      { id: 'status', label: 'Status', type: 'select', isStarred: true, options: [{ label: 'All', value: 'All' }, ...STATUS_OPTIONS.map(s => ({ label: s, value: s }))], defaultValue: 'Pending' },
      { id: 'assignedTo', label: 'Assign To', type: 'select', isStarred: true, options: [{ label: 'All', value: 'All' }, ...(lookups.employees || []).map(e => ({ label: e.employeeName || `${e.firstName} ${e.lastName}`, value: e.employeeName || `${e.firstName} ${e.lastName}` }))], defaultValue: 'All' },
      { id: 'seqNo', label: 'Seq No', type: 'text' },
      { id: 'checkingPoint', label: 'Checking Point', type: 'text' },
      { id: 'category', label: 'Category', type: 'select', options: [{ label: 'All', value: 'All' }, { label: 'Renewal', value: 'RENEWAL' }, { label: 'Check List', value: 'CHECK LIST' }], defaultValue: 'All' },
      { id: 'frequency', label: 'Frequency', type: 'select', options: [{ label: 'All', value: 'All' }, { label: 'DAILY', value: 'DAILY' }, { label: 'WEEKLY', value: 'WEEKLY' }, { label: 'MONTHLY', value: 'MONTHLY' }, { label: 'YEARLY', value: 'YEARLY' }], defaultValue: 'All' },
      { id: 'department', label: 'Department', type: 'text' },
      { id: 'considerDate', label: 'Consider Date?', type: 'select', options: [{ label: 'No', value: 'No' }, { label: 'Yes', value: 'Yes' }], defaultValue: 'No' },
      { id: 'fromDate', label: 'From Date', type: 'date' },
      { id: 'toDate', label: 'To Date', type: 'date' },
      { id: 'searchBy', label: 'Search by', type: 'select', options: [{ label: 'Seq No', value: 'seqNo' }, { label: 'Checking Point', value: 'checkingPoint' }, { label: 'Category', value: 'category' }], defaultValue: 'checkingPoint' }
    ]));
    return () => dispatch(setFilterConfig(null));
  }, [dispatch, lookups.employees]);
>>>>>>> origin/chore/repo-cleanup

  const fetchAssignments = useCallback(async () => {
    setLoading(true);
    try {
<<<<<<< HEAD
      const params = {
        page,
        size,
        status: filters.statuses.length > 0 ? filters.statuses[0] : undefined,
        fromDate: filters.fromDate || undefined,
        toDate: filters.toDate || undefined,
        category: filters.category !== 'All' ? filters.category : undefined,
        assignedTo: filters.assignTo || undefined,
        searchValue: searchQuery || filters.searchByValue || undefined,
        searchBy: filters.searchBy !== 'All' ? filters.searchBy : undefined
      };
      const response = await axios.get('/api/qms/checklist/assignments', { params });
      setRows(response.data.content);
      setTotalElements(response.data.totalElements);
    } catch (error) {
      console.error('Failed to fetch assignments for verification:', error);
    } finally {
      setLoading(false);
    }
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

  const handleVerify = async (status) => {
    if (!selectedRowId) return;
    try {
      await axios.post('/api/qms/checklist/verify', {
        assignmentId: selectedRowId,
        status: status,
        verifiedBy: 'Current User',
        remarks: `Verification action: ${status}`
      });
      fetchAssignments();
    } catch (error) {
      console.error('Verification failed:', error);
=======
      if (activeTab === 0) {
        // Fetch Execution Assignments
        const params = {
          page, size,
          taskType: filters.taskType || 'Mine',
          status: filters.status !== 'All' ? filters.status : undefined,
          assignedTo: filters.assignedTo !== 'All' ? filters.assignedTo : undefined,
          category: filters.category !== 'All' ? filters.category : undefined,
          seqNo: filters.seqNo || undefined,
          checkingPoint: filters.checkingPoint || undefined,
          frequency: filters.frequency !== 'All' ? filters.frequency : undefined,
          department: filters.department || undefined,
          fromDate: filters.considerDate === 'Yes' ? filters.fromDate : undefined,
          toDate: filters.considerDate === 'Yes' ? filters.toDate : undefined,
          searchBy: filters.searchBy !== 'All' ? filters.searchBy : undefined,
          searchValue: globalQuery || undefined,
          masterVerifyStatus: 'Verified',
          currentUser: 'Current User' // Replace with actual logged in user in production
        };
        const response = await axios.get('/api/qms/checklist/assignments', { params });
        setRows(response.data.content || []);
        setTotalElements(response.data.totalElements || 0);
      } else {
        // Fetch Dual Check Assignments (Second Level Approval)
        const params = {
          page, size,
          status: 'Pending for Verified',
          taskType: 'All', 
          assignedTo: filters.assignedTo !== 'All' ? filters.assignedTo : undefined,
          category: filters.category !== 'All' ? filters.category : undefined,
          seqNo: filters.seqNo || undefined,
          checkingPoint: filters.checkingPoint || undefined,
          frequency: filters.frequency !== 'All' ? filters.frequency : undefined,
          department: filters.department || undefined,
          searchBy: filters.searchBy !== 'All' ? filters.searchBy : undefined,
          searchValue: globalQuery || undefined,
          taskType: 'All', // Dual check is always 'All'
          currentUser: 'Current User'
        };
        const response = await axios.get('/api/qms/checklist/assignments', { params });
        setRows(response.data.content || []);
        setTotalElements(response.data.totalElements || 0);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  }, [page, size, filters, globalQuery, activeTab]);

  useEffect(() => { fetchAssignments(); }, [fetchAssignments]);

  const handleSaveExecution = async (executionData) => {
    if (!selectedRow) return;
    try {
      // First, handle file uploads if any new files are present
      const uploadFile = async (fileObj) => {
        if (fileObj.isServer) return fileObj.name + (fileObj.docDetails ? `|${fileObj.docDetails}` : '');
        // autoUploadFile automatically detects 'QMS' from the URL
        const serverName = await autoUploadFile(fileObj.file);
        return serverName + (fileObj.docDetails ? `|${fileObj.docDetails}` : '');
      };

      const actualFiles = await Promise.all((executionData.actualFiles || []).map(uploadFile));

      const payload = {
        assignmentId: selectedRow.id,
        status: executionData.status,
        remarks: executionData.remarks,
        verifiedBy: 'Current User', // In execution mode, this acts as 'Last Updated By'
        actualFiles
      };

      await axios.post('/api/qms/checklist/verify', payload);
      dispatch(openSnackbar({ open: true, message: 'Progress saved successfully!', severity: 'success', variant: 'alert' }));
      setDialogOpen(false);
      fetchAssignments();
    } catch (err) {
      dispatch(openSnackbar({ open: true, message: 'Failed to save progress', severity: 'error', variant: 'alert' }));
    }
  };

  const handleVerify = async (status, remarks) => {
    if (!selectedRow) return;
    try {
      const payload = {
        assignmentId: selectedRow.id,
        verifiedBy: 'Current User',
        status: status,
        remarks: remarks || `Verification: ${status}`
      };

      await axios.post('/api/qms/checklist/verify', payload);
      dispatch(openSnackbar({ 
        open: true, 
        message: `Checklist ${status} successfully!`, 
        severity: ['Verified', 'Accepted'].includes(status) ? 'success' : 'error', 
        variant: 'alert' 
      }));
      setDialogOpen(false);
      setRejectDialogOpen(false);
      setRejectRemarks('');
      fetchAssignments();
    } catch (err) {
      dispatch(openSnackbar({ open: true, message: 'Verification failed', severity: 'error', variant: 'alert' }));
>>>>>>> origin/chore/repo-cleanup
    }
  };

  const handleExport = () => {
    const exportData = rows.map((r, i) => ({
      '#': i + 1,
<<<<<<< HEAD
      'Task Type': r.assignType || 'Mine',
      'Seq No': r.checklist?.seqNo,
      'Checking Point': r.checklist?.checkingPoint,
      'Descriptions': r.checklist?.description,
      'Category': r.checklist?.category,
      'Frequency': r.checklist?.frequency,
      'Department': (r.checklist?.departments || []).map(d => d.departmentName).join(', '),
      'Date': r.assignedDate ? new Date(r.assignedDate).toLocaleDateString() : '',
      'Checklist Date': r.checklistDate,
      'Status': typeof r.status === 'object' ? r.status?.name : r.status,
      'Next Due Date': r.checklist?.nextDueDate,
      'Assigned To': r.assignedTo
=======
      'Seq No': r.checklist?.seqNo || r.seqNo,
      'Checking Point': r.checklist?.checkingPoint || r.checkingPoint,
      Status: typeof r.status === 'object' ? r.status?.name : r.status
>>>>>>> origin/chore/repo-cleanup
    }));
    exportToExcel(exportData, 'Checklist_Renewal_Verify');
  };

<<<<<<< HEAD
  const activeCount = (filters.taskType !== 'All' ? 1 : 0) + (filters.fromDate ? 1 : 0) + (filters.toDate ? 1 : 0) + (filters.considerDate !== 'No' ? 1 : 0) + (filters.statuses?.length || 0) + (filters.assignTo ? 1 : 0) + (filters.category !== 'All' ? 1 : 0);

  return (
    <MainCard title="Check List / Renewal Verify"
      secondary={
        <Box sx={{ display:'flex', alignItems:'center', gap:1 }}>
          <Button variant="contained" color="error" size="small" startIcon={<IconBan size={18}/>} onClick={() => handleVerify('Rejected')} disabled={!selectedRowId}>Reject</Button>
          <Button variant="contained" color="secondary" size="small" onClick={() => handleVerify('Not Accepted')} disabled={!selectedRowId}>Not Accepted</Button>
          <Button variant="contained" color="primary" size="small" startIcon={<IconCheck size={18}/>} onClick={() => handleVerify('Accepted')} disabled={!selectedRowId}>Accept</Button>
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
          {filters.statuses.map((s) => <Chip key={s} label={s} size="small" color="warning" onDelete={() => toggleStatus(s)}/>)}
          {filters.assignTo && <Chip label={`Assign To: ${filters.assignTo}`} size="small" color="info" onDelete={() => setFilter('assignTo','')}/>}
          {filters.category !== 'All' && <Chip label={`Category: ${filters.category}`} size="small" color="secondary" onDelete={() => setFilter('category','All')}/>}
          <Button size="small" color="error" onClick={resetFilters} sx={{ ml:1 }}>Clear All</Button>
        </Box>
      )}

      <TableContainer component={Paper} sx={{ maxHeight:'calc(100vh - 400px)', border:'1px solid', borderColor:'divider', '&::-webkit-scrollbar':{width:10,height:10}, '&::-webkit-scrollbar-track':{backgroundColor:'background.paper'}, '&::-webkit-scrollbar-thumb':{backgroundColor:'grey.400',borderRadius:2} }}>
        <Table stickyHeader sx={{ minWidth:2500 }} aria-label="renewal verify table">
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
                <TableCell><StatusChip status={row.status}/></TableCell>
                <TableCell>{row.checklist?.nextDueDate}</TableCell>
                <TableCell>{row.assignedTo}</TableCell>
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
          <FilterSection title="Assign To" open={openSections.assignTo} onToggle={() => toggleSection('assignTo')}>
            <TextField size="small" fullWidth placeholder="Search employee..." value={filters.assignTo} onChange={(e) => setFilter('assignTo', e.target.value)}/>
          </FilterSection>
          <Divider/>
          <FilterSection title="Category" open={openSections.category} onToggle={() => toggleSection('category')}>
            <FormControl><RadioGroup value={filters.category} onChange={(e) => setFilter('category', e.target.value)}>
              {['All','RENEWAL','CHECK LIST'].map((v) => <FormControlLabel key={v} value={v} control={<Radio size="small"/>} label={<Typography variant="body2">{v==='All'?'All':v==='RENEWAL'?'Renewal':'Check List'}</Typography>}/>)}
            </RadioGroup></FormControl>
          </FilterSection>
          <Divider/>
          <FilterSection title="Search By" open={openSections.searchBy} onToggle={() => toggleSection('searchBy')}>
            <FormControl fullWidth><RadioGroup value={filters.searchBy} onChange={(e) => setFilter('searchBy', e.target.value)}>
              {SEARCH_BY_OPTIONS.map((opt) => <FormControlLabel key={opt.key} value={opt.key} control={<Radio size="small"/>} label={<Typography variant="body2">{opt.label}</Typography>}/>)}
            </RadioGroup></FormControl>
            {filters.searchBy && <TextField size="small" fullWidth placeholder={`Search by ${SEARCH_BY_OPTIONS.find((o)=>o.key===filters.searchBy)?.label}...`} value={filters.searchByValue} onChange={(e) => setFilter('searchByValue', e.target.value)} sx={{ mt:1 }}/>}
          </FilterSection>
        </Box>
        <Box sx={{ p:2, borderTop:'1px solid', borderColor:'divider', display:'flex', gap:1 }}>
          <Button fullWidth variant="outlined" color="error" onClick={() => { resetFilters(); setDrawerOpen(false); }}>Reset All</Button>
          <Button fullWidth variant="contained" onClick={() => setDrawerOpen(false)}>Apply</Button>
        </Box>
      </Drawer>
=======
  const renderCell = (col, row, idx) => {
    if (col.id === 'index') return idx + 1 + page * size;

    // Both tabs now display Assignments, which have nested checklist data
    const data = row.checklist || row;

    if (col.id === 'seqNo') return data.seqNo;
    if (col.id === 'checkingPoint') return data.checkingPoint;
    if (col.id === 'category') return data.category;
    if (col.id === 'frequency') return data.frequency;
    
    if (col.id === 'assignedTo') return row.assignedTo;
    if (col.id === 'checklistDate') return row.checklistDate ? new Date(row.checklistDate).toLocaleDateString() : '-';
    if (col.id === 'createdDate') return row.createdDate ? new Date(row.createdDate).toLocaleDateString() : '-';

    if (col.id === 'status' || col.id === 'verifyStatus') {
      let s = row.verifyStatus || row.status || 'OPEN';
      if (typeof s === 'object' && s !== null) s = s.name || 'OPEN';
      
      // Missed Logic (SOP Item 15)
      const scheduledDate = row.checklistDate ? new Date(row.checklistDate) : null;
      const isMissed = scheduledDate && scheduledDate < new Date() && s !== 'CLOSED' && s !== 'Verified' && s !== 'Accepted';
      if (isMissed) s = 'MISSED';

      // SOP Rule 13: Expiry Status Logic
      const isExpired = data.expiryDate && new Date(data.expiryDate) < new Date();
      if (isExpired && s !== 'Verified' && s !== 'Accepted' && s !== 'CLOSED' && s !== 'Completed') {
        s = 'EXPIRED';
      }

      let chipStatus = 'PENDING';
      if (['Verified', 'Accepted', 'CLOSED', 'COMPLETED', 'STARTED'].includes(s)) chipStatus = 'ACTIVE';
      if (['Rejected', 'Missed', 'MISSED', 'UNRESOLVED', 'EXPIRED', 'NOT COMPLETED'].includes(s)) chipStatus = 'INACTIVE';
      if (s === 'OPEN') chipStatus = 'PENDING';
      
      return <Chip label={s.toUpperCase()} size="small" sx={getStatusChipSx(chipStatus)} />;
    }

    if (col.id === 'department') return (data.departments || []).map((d) => d.departmentName).join(', ');

    if (col.id === 'effectiveFrom') return data.effectiveFrom ? new Date(data.effectiveFrom).toLocaleDateString() : '-';
    if (col.id === 'reminderDays') return data.reminderDays || '-';
    if (col.id === 'expiryDate') {
      if (!data.expiryDate) return '-';
      const expiry = new Date(data.expiryDate);
      const diff = Math.ceil((expiry - new Date()) / (1000 * 60 * 60 * 24));
      
      // SOP Rule 19: Reminder Thresholds
      let threshold = 3;
      if (data.frequency === 'QUARTERLY') threshold = 7;
      if (data.frequency === 'YEARLY') threshold = 30;

      const isUrgent = diff <= threshold && diff >= 0;
      const isExpired = diff < 0;

      return (
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography variant="body2">{expiry.toLocaleDateString()}</Typography>
          {isExpired ? (
            <Chip label="OVERDUE" size="small" color="error" variant="filled" sx={{ height: 20, fontSize: '0.65rem' }} />
          ) : isUrgent ? (
            <Chip label={`${diff}d left`} size="small" color="warning" variant="filled" sx={{ height: 20, fontSize: '0.65rem' }} />
          ) : null}
        </Stack>
      );
    }
    if (col.id === 'stockLink') return data.stockLink || 'No';
    if (col.id === 'photoRequired') return data.photoRequired || '-';
    if (col.id === 'verificationRequired') return data.verificationRequired || '-';
    if (col.id === 'itemCode') return data.itemCode || '-';
    if (col.id === 'qty') return data.qty || '-';
    if (col.id === 'carryForward') return row.carryForward || '-';
    if (col.id === 'assignType') return row.assignType || '-';
    if (col.id === 'nextDueDate') return data.nextDueDate ? new Date(data.nextDueDate).toLocaleDateString() : '-';

    if (col.id === 'createdBy') return data.createdBy || '-';
    if (col.id === 'assignedBy') return row.assignedBy || '-';
    if (col.id === 'remarks') return row.remarks || data.description || '-';
    if (col.id === 'level') return data.levelIds || '-';
    if (col.id === 'verifiedBy') return data.verifiedBy || '-';
    if (col.id === 'verifiedDate') return data.verifiedDate ? new Date(data.verifiedDate).toLocaleDateString() : '-';

    if (col.id === 'actualFiles') {
      const files = row.actualFiles || [];
      if (files.length === 0) return '-';
      return (
        <IconButton 
          size="small" 
          color="secondary" 
          onClick={(e) => {
            e.stopPropagation();
            setSelectedRow(row);
            setPreviewOpen(true);
          }}
        >
          <IconEye size={18} />
        </IconButton>
      );
    }
    return row[col.id] || data[col.id] || '-';
  };

  return (
    <MainCard
      title={
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <IconChecks size={24} />
          <Typography variant="h3">Check List / Renewal Verify</Typography>
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
            filename="Checklist_Renewal_Verify"
            columns={[
              { header: 'Category', key: 'category' },
              { header: 'Check Point', key: 'checkingPoint' },
              { header: 'Status', key: 'status' }
            ]}
          />
        </Stack>
      }
    >
      <Tabs value={activeTab} onChange={(e, v) => { setActiveTab(v); setPage(0); setSelectedRow(null); }} sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Tab label="Renewal Assignments" />
        <Tab label="Second Level Approval (Dual Check)" />
      </Tabs>
      <BOSDataTable
        columns={activeTab === 0 ? columns : masterColumns}
        rows={rows}
        page={page}
        size={size}
        totalCount={totalElements}
        loading={loading}
        onPageChange={setPage}
        onSizeChange={(s) => { setSize(s); setPage(0); }}
        onDoubleClickRow={() => setDialogOpen(true)}
        onClickRow={setSelectedRow}
        selectedRowId={selectedRow?.id}
        showActions={false}
        renderCell={renderCell}
        id="renewal-verify-table"
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
          const data = row.checklist || row;
          const isExpired = data.expiryDate && new Date(data.expiryDate) < new Date();
          const s = row.verifyStatus || row.status;
          return (isExpired && s !== 'Verified' && s !== 'Accepted') ? 'expired-row' : '';
        }}
      />

      <ExecutionVerifyDialog
        open={dialogOpen}
        handleClose={() => setDialogOpen(false)}
        data={selectedRow}
        onSave={activeTab === 0 ? handleSaveExecution : null}
        onVerify={activeTab === 1 ? () => handleVerify('Accepted') : null}
        onReject={activeTab === 1 ? () => setRejectDialogOpen(true) : null}
        isExecution={activeTab === 0}
      />

      <Dialog open={rejectDialogOpen} onClose={() => setRejectDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Reject {activeTab === 1 ? 'Master Record' : 'Assignment'}</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Reason for Rejection / Comments"
            value={rejectRemarks}
            onChange={(e) => setRejectRemarks(e.target.value)}
            placeholder="Please explain why this is being rejected..."
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={() => handleVerify('Rejected', rejectRemarks)} disabled={!rejectRemarks.trim()}>
            Confirm Reject
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={previewOpen} onClose={() => setPreviewOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4">Execution Proof (Actual Files)</Typography>
          <IconButton onClick={() => setPreviewOpen(false)}><IconX size={20} /></IconButton>
        </DialogTitle>
        <DialogContent sx={{ bgcolor: 'grey.50', p: 3 }}>
          <BOSFileGallery files={selectedRow?.actualFiles || []} isEditing={false} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
>>>>>>> origin/chore/repo-cleanup
    </MainCard>
  );
}
