import { useState, useEffect, useCallback } from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import TablePagination from '@mui/material/TablePagination';
import axios from 'utils/axios';

import MainCard from 'ui-component/cards/MainCard';
import { useSelector, useDispatch } from 'react-redux';
import { setFilterConfig, setTableConfig } from 'store/slices/search';
import { openSnackbar } from 'store/slices/snackbar';
import ExecutionVerifyDialog from './ExecutionVerifyDialog';
import useAuth from 'hooks/useAuth';
import useLookups from 'hooks/useLookups';
import { BOSTableToolbar, getCommonDateFilters, matchCommonDateFilters } from 'ui-component/bos';

import usePagePermissions, { PAGE_CODES } from 'hooks/usePagePermissions';

const columns = [
  '#', 'Task Type', 'Seq No', 'Checking Point', 'Descriptions', 'Category', 'Frequency', 'Dept',
  'Date', 'Checklist Date', 'Task Status', 'Next Due Date', 'Assigned To', 'Dual Check',
  'Verification Required', 'Photo Required',
  'Created By', 'Created Date', 'Updated By', 'Update Date & Time'
];

const STATUS_OPTIONS = ['Pending for Verified', 'Pending for Accepted', 'Verified', 'Rejected', 'Not Accepted', 'Accepted', 'Missed'];

const SEARCH_BY_OPTIONS = [
  { key: 'All', label: 'Global Search' },
  { key: 'checkingPoint', label: 'Checking Point' },
  { key: 'description', label: 'Descriptions' },
  { key: 'seqNo', label: 'Seq.No' }
];

const DEFAULT_FILTERS = {
  taskType: 'All',
  fromDate: '',
  toDate: '',
  considerDate: 'All',
  considerDateValue: '',
  statuses: ['Pending for Verified', 'Pending for Accepted'],
  assignTo: '',
  category: 'All',
  searchBy: 'All',

  // Add-on filter support
  seqNo: '',
  checkingPoint: '',
  frequency: 'All',
  stockLink: 'All',
  dualCheck: 'All'
};

const tableCols = [
  { id: 'taskType', label: 'Task Type' },
  { id: 'seqNo', label: 'Seq No' },
  { id: 'checkingPoint', label: 'Checking Point' },
  { id: 'description', label: 'Descriptions' },
  { id: 'category', label: 'Category' },
  { id: 'frequency', label: 'Frequency' },
  { id: 'department', label: 'Dept' },
  { id: 'assignedDate', label: 'Date' },
  { id: 'checklistDate', label: 'Checklist Date' },
  { id: 'status', label: 'Task Status' },
  { id: 'nextDueDate', label: 'Next Due Date' },
  { id: 'assignedTo', label: 'Assigned To' },
  { id: 'dualCheck', label: 'Dual Check' },
  { id: 'createdUser', label: 'Created By' },
  { id: 'createdDate', label: 'Created Date' },
  { id: 'updatedUser', label: 'Updated By' },
  { id: 'updatedDate', label: 'Update Date & Time' }
];

const formatDate = (dateVal) => {
  if (!dateVal) return '-';
  try {
    let d;
    if (typeof dateVal === 'string') {
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateVal)) {
        const [yyyy, mm, dd] = dateVal.split('-');
        return `${dd}/${mm}/${yyyy}`;
      }
      if (dateVal.includes('T')) {
        const datePart = dateVal.split('T')[0];
        const [yyyy, mm, dd] = datePart.split('-');
        return `${dd}/${mm}/${yyyy}`;
      }
      d = new Date(dateVal);
    } else {
      d = new Date(dateVal);
    }
    if (isNaN(d.getTime())) return '-';
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  } catch (e) {
    return '-';
  }
};

const exportColumns = [
  { header: 'Task Type', key: (r) => r.assignType || 'Mine' },
  { header: 'Seq No', key: (r) => r.checklist?.seqNo },
  { header: 'Checking Point', key: (r) => r.checklist?.checkingPoint },
  { header: 'Descriptions', key: (r) => r.checklist?.description },
  { header: 'Category', key: (r) => r.checklist?.category },
  { header: 'Frequency', key: (r) => r.checklist?.frequency },
  { header: 'Dept', key: (r) => (r.checklist?.departments || []).map(d => d.departmentName).join(', ') },
  { header: 'Date', key: (r) => formatDate(r.assignedDate) },
  { header: 'Checklist Date', key: (r) => formatDate(r.checklistDate) },
  { header: 'Task Status', key: (r) => typeof r.status === 'object' ? r.status?.name : r.status },
  { header: 'Next Due Date', key: (r) => formatDate(r.checklist?.nextDueDate) },
  { header: 'Assigned To', key: 'assignedTo' },
  { header: 'Dual Check', key: (r) => r.checklist?.dualCheck?.toUpperCase() === 'YES' ? 'yes' : 'No' },
  { header: 'Verification Required', key: (r) => r.checklist?.dualCheck?.toUpperCase() === 'YES' ? 'yes' : 'No' },
  { header: 'Photo Required', key: (r) => r.checklist?.photoRequired || 'NO' },
  { header: 'Created By', key: (r) => r.checklist?.createdUser || r.checklist?.createdBy },
  { header: 'Created Date', key: (r) => formatDate(r.checklist?.createdAt || r.checklist?.createdDate) },
  { header: 'Updated By', key: (r) => {
    const upAt = r.updatedAt || r.checklist?.updatedAt;
    const crAt = r.createdAt || r.checklist?.createdAt;
    if (!upAt || !crAt) return '';
    const msDiff = Math.abs(new Date(upAt) - new Date(crAt));
    if (msDiff <= 60000) return '';
    let upUser = r.updatedUser || r.updatedBy || r.checklist?.updatedUser || r.checklist?.updatedBy || '';
    if (upUser === 'Admin istrator' || upUser === 'Administrator') upUser = 'Admin';
    return upUser;
  }},
  { header: 'Update Date & Time', key: (r) => {
    const upAt = r.updatedAt || r.checklist?.updatedAt;
    const crAt = r.createdAt || r.checklist?.createdAt;
    if (!upAt || !crAt) return '';
    const msDiff = Math.abs(new Date(upAt) - new Date(crAt));
    if (msDiff <= 60000) return '';
    return formatDateTime(upAt);
  }}
];

const filterConfig = [{
    id: 'taskType', label: 'Task Type', type: 'select', isStarred: true, defaultValue: 'Mine', options: [
      { value: 'Mine', label: 'Mine' },
      { value: 'Team', label: 'Team' },
      { value: 'Company', label: 'Company' }
    ]
  },
  { id: 'statuses', label: 'Status', type: 'autocomplete', multiple: true, isStarred: true, options: STATUS_OPTIONS.map(s => ({ value: s, label: s })) },
  { id: 'assignTo', label: 'Assign To', type: 'text', isStarred: true },
  {
    id: 'category', label: 'Category', type: 'select', isStarred: true, defaultValue: 'All', options: [
      { value: 'All', label: 'All' },
      { value: 'RENEWAL', label: 'RENEWAL' },
      { value: 'CHECK LIST', label: 'CHECK LIST' }
    ]
  },
  {
    id: 'searchBy', label: 'Search by', type: 'select', isStarred: true, defaultValue: 'All', options: [
      { value: 'All', label: 'Global Search' },
      { value: 'checkingPoint', label: 'Checking Point' },
      { value: 'description', label: 'Descriptions' },
      { value: 'seqNo', label: 'Seq.No' }
    ]
  },

  // The remaining fields in the table can be added by the "Add Filter" option (isStarred: false)
  { id: 'seqNo', label: 'Sequence No', type: 'text', isStarred: false },
  { id: 'checkingPoint', label: 'Checking Point', type: 'text', isStarred: false },
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
  {
    id: 'dualCheck', label: 'Dual Check', type: 'select', isStarred: true, defaultValue: 'All', options: [
      { value: 'All', label: 'All' },
      { value: 'YES', label: 'YES' },
      { value: 'NO', label: 'NO' }
    ]
  },
  ...getCommonDateFilters('createdDate', 'updatedDate')];

// Local Filter drawer helper functions removed (filtering managed globally)

const formatDateTime = (dateVal) => {
  if (!dateVal) return '-';
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return '-';
    const date = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
    let hours = d.getHours();
    const mins  = String(d.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${date} ${String(hours).padStart(2, '0')}:${mins} ${ampm}`;
  } catch {
    return '-';
  }
};

function StatusChip({ status }) {
  let label = typeof status === 'object' ? status?.name : status;
  label = label || 'Pending';
  
  const greenStates = ['Verified', 'Accepted', 'Completed'];
  const redStates   = ['Pending for Verified', 'Pending for Accepted', 'Rejected', 'Not Accepted', 'Missed', 'Pending'];
  
  let bg = '#EEEEEE';
  let text = '#616161';
  
  if (greenStates.includes(label)) {
    bg = '#E8F5E9';
    text = '#2E7D32';
  } else if (redStates.includes(label)) {
    bg = '#FFEBEE';
    text = '#C62828';
  }
  
  return (
    <Chip
      label={label}
      size="small"
      sx={{ 
        minWidth: 160, 
        maxWidth: 160, 
        height: 26, 
        fontSize: '0.75rem', 
        fontWeight: 700, 
        justifyContent: 'center', 
        bgcolor: bg,
        color: text,
        border: 'none',
        borderRadius: '4px',
        '& .MuiChip-label': { px: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } 
      }}
    />
  );
}

export default function CheckListRenewalVerify() {
  const { user } = useAuth();
  const dispatch = useDispatch();
  const { employees = [] } = useLookups(['EMPLOYEES']);
  const [rows, setRows] = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [loading, setLoading] = useState(false);

  const [selectedRowId, setSelectedRowId] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [showDoubleTap, setShowDoubleTap] = useState(false);
  const [verifyRemarks, setVerifyRemarks] = useState('');
  const activeRow = rows.find((r) => r.id === selectedRowId) || null;
  const searchQuery = useSelector((state) => state.search.query);
  const globalFilters = useSelector((state) => state.search.filters) || {};
  const perms = usePagePermissions(PAGE_CODES.QMS_CHECKLIST_RENEWAL_VERIFY);
  const [filters, setFilters] = useState({ ...DEFAULT_FILTERS });

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
          'taskType', 'fromDate', 'toDate', 'considerDate', 'considerDateValue', 'statuses',
          'assignTo', 'category', 'searchBy', 'seqNo', 'checkingPoint',
          'frequency', 'stockLink', 'dualCheck'
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
      const considerDate = globalFilters.createdDateConsider || filters.considerDate || 'No';
      const params = {
        page,
        size,
        status: filters.statuses.length > 0 ? filters.statuses.join(',') : undefined,
        fromDate: globalFilters.createdDateStart || filters.fromDate || undefined,
        toDate: globalFilters.createdDateEnd || filters.toDate || undefined,
        considerDate: considerDate !== 'All' ? considerDate : undefined,
        considerDateValue: (String(considerDate).trim().toUpperCase() === 'YES' && (globalFilters.createdDateConsiderValue || filters.considerDateValue)) ? (globalFilters.createdDateConsiderValue || filters.considerDateValue) : undefined,
        category: filters.category !== 'All' ? filters.category : undefined,
        assignedTo: filters.assignTo || undefined,
        searchValue: searchQuery || undefined,
        searchBy: filters.searchBy !== 'All' ? filters.searchBy : undefined,

        // Task Filtering
        taskType: filters.taskType !== 'All' ? filters.taskType : undefined,
        currentUser: user?.id || user?.name || undefined,
        excludePending: true,

        // Add-on filters
        seqNo: filters.seqNo || undefined,
        checkingPoint: filters.checkingPoint || undefined,
        frequency: filters.frequency !== 'All' ? filters.frequency : undefined,
        stockLink: filters.stockLink !== 'All' ? filters.stockLink : undefined,
        dualCheck: filters.dualCheck !== 'All' ? filters.dualCheck : undefined
      };

      // Validation: If Consider Date is Yes and outside From/To range, return no records
      const checkConsiderVal = globalFilters.createdDateConsiderValue || filters.considerDateValue;
      if (String(considerDate).trim().toUpperCase() === 'YES' && checkConsiderVal) {
        const considerVal = new Date(checkConsiderVal);
        const fromVal = params.fromDate ? new Date(params.fromDate) : null;
        const toVal = params.toDate ? new Date(params.toDate) : null;
        let isInvalid = false;
        if (fromVal && considerVal < fromVal) isInvalid = true;
        if (toVal && considerVal > toVal) isInvalid = true;
        if (isInvalid) {
          setRows([]);
          setTotalElements(0);
          setLoading(false);
          return;
        }
      }

      const response = await axios.get('/api/qms/checklist/assignments', { params });
      setRows(response.data.content);
      setTotalElements(response.data.totalElements);
    } catch (error) {
      console.error('Failed to fetch assignments for verification:', error);
    } finally {
      setLoading(false);
    }
  }, [page, size, filters, searchQuery, user, globalFilters]);

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

  const handleVerify = async (status, remarks) => {
    if (selectedRowId === null || selectedRowId === undefined) return;
    if (!activeRow) return;

    // ── Mapped Vertical Head Validation ──
    const assigneeName = activeRow.assignedTo;
    if (assigneeName) {
      const assignee = (employees || []).find((emp) => {
        const fullName = `${emp.firstName || ''} ${emp.lastName || ''}`.toLowerCase().trim();
        return fullName === assigneeName.toLowerCase().trim();
      });

      const isAdmin = user?.userLevel === 5 || user?.id?.toLowerCase() === 'admin';

      if (!assignee) {
        if (!isAdmin) {
          dispatch(openSnackbar({
            open: true,
            message: `Assignee '${assigneeName}' not found in Employee Master. Only an administrator can verify.`,
            variant: 'alert',
            alert: { variant: 'filled' },
            severity: 'error',
            close: false
          }));
          return;
        }
      } else {
        try {
          const mappingRes = await axios.get(`/api/master/hr/employees/manager-mapping/${assignee.id}`);
          const mapping = mappingRes.data;
          
          const isVerticalHead = mapping && mapping.verticalHeadId && (
            String(user?.empId) === String(mapping.verticalHeadId) ||
            (employees || []).find(emp => String(emp.id) === String(mapping.verticalHeadId))?.firstName?.toLowerCase() === user?.name?.split(' ')[0]?.toLowerCase()
          );

          if (!isVerticalHead && !isAdmin) {
            dispatch(openSnackbar({
              open: true,
              message: `Only the mapped Vertical Head of '${assigneeName}' can verify or reject this record!`,
              variant: 'alert',
              alert: { variant: 'filled' },
              severity: 'error',
              close: false
            }));
            return;
          }
        } catch (err) {
          console.error('Failed to verify manager mapping:', err);
          if (!isAdmin) {
            dispatch(openSnackbar({
              open: true,
              message: 'Failed to validate manager permissions. Only administrators can bypass.',
              variant: 'alert',
              alert: { variant: 'filled' },
              severity: 'error',
              close: false
            }));
            return;
          }
        }
      }
    }

    try {
      await axios.post('/api/qms/checklist/verify', {
        assignmentId: selectedRowId,
        status: status,
        verifiedBy: user?.name || user?.id || 'Admin',
        remarks: remarks || `Verification action: ${status}`
      });
      dispatch(openSnackbar({
        open: true,
        message: `Task successfully ${status === 'Verified' ? 'verified' : 'rejected'}!`,
        variant: 'alert',
        alert: { variant: 'filled' },
        severity: 'success',
        close: false
      }));
      setDialogOpen(false);
      setVerifyRemarks('');
      fetchAssignments();
    } catch (error) {
      console.error('Verification failed:', error);
      dispatch(openSnackbar({
        open: true,
        message: error?.response?.data?.message || 'Verification action failed.',
        variant: 'alert',
        alert: { variant: 'filled' },
        severity: 'error',
        close: false
      }));
    }
  };

  const activeCount = (filters.taskType !== 'All' ? 1 : 0) + (filters.fromDate ? 1 : 0) + (filters.toDate ? 1 : 0) + (filters.considerDate !== 'All' ? 1 : 0) + (filters.statuses?.length || 0) + (filters.assignTo ? 1 : 0) + (filters.category !== 'All' ? 1 : 0) + (filters.dualCheck !== 'All' ? 1 : 0);

  return (
    <MainCard
      contentSX={{ p: 0 }}
      sx={{
        mx: { xs: -2, sm: -3 },
        width: { xs: 'calc(100% + 32px)', sm: 'calc(100% + 48px)' },
        borderRadius: 0
      }}
      title="Check List / Renewal Verify"
      secondary={
        <BOSTableToolbar
          exportData={rows}
          
          exportFilename="Checklist_Renewal_Verify"
          hasExportPermission={perms.export}
         columns={columns} />
      }
    >

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
          <Table stickyHeader sx={{ minWidth: 2500 }} aria-label="renewal verify table">
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
                  onDoubleClick={() => { if (perms.approval || perms.write) { setSelectedRowId(row.id); setDialogOpen(true); } }}
                  onMouseEnter={() => { if (perms.approval || perms.write) setShowDoubleTap(true); }}
                  onMouseLeave={() => setShowDoubleTap(false)}
                  onMouseMove={(e) => setCursorPos({ x: e.clientX, y: e.clientY })}
                  sx={{ cursor: (perms.approval || perms.write) ? 'pointer' : 'default', bgcolor: selectedRowId === row.id ? 'primary.light' : 'inherit' }}
                >
                  <TableCell>{page * size + idx + 1}</TableCell>
                  <TableCell>{row.assignType || 'Mine'}</TableCell>
                  <TableCell>{row.checklist?.seqNo}</TableCell>
                  <TableCell>
                    {row.checklist?.checkingPoint ? (
                      <Box
                        component="span"
                        onClick={(e) => { e.stopPropagation(); setSelectedRowId(row.id); setDialogOpen(true); }}
                        sx={{ color: 'primary.main', textDecoration: 'none', cursor: 'pointer', fontWeight: 500, '&:hover': { color: 'primary.dark' } }}
                      >
                        {row.checklist.checkingPoint}
                      </Box>
                    ) : '-'}
                  </TableCell>
                  <TableCell>
                    {row.checklist?.description?.length > 50 
                      ? `${row.checklist.description.substring(0, 50)}...` 
                      : row.checklist?.description || '-'}
                  </TableCell>
                  <TableCell>{row.checklist?.category}</TableCell>
                  <TableCell>{row.checklist?.frequency}</TableCell>
                  <TableCell>{(row.checklist?.departments || []).map(d => d.departmentName).join(', ')}</TableCell>
                   <TableCell>{formatDate(row.assignedDate)}</TableCell>
                  <TableCell>{formatDate(row.checklistDate)}</TableCell>
                  <TableCell><StatusChip status={row.status} /></TableCell>
                  <TableCell>
                    {(() => {
                      const val = formatDate(row.checklist?.nextDueDate);
                      if (!row.checklist?.nextDueDate || val === '-') return '-';
                      const exp = new Date(row.checklist.nextDueDate);
                      let isExpired = false;
                      if (!isNaN(exp.getTime())) {
                        exp.setHours(23, 59, 59, 999);
                        isExpired = exp < new Date();
                      }
                      return (
                        <Box
                          component="span"
                          sx={{
                            fontWeight: isExpired ? 700 : 400,
                            color: isExpired ? '#C62828' : 'text.primary',
                            bgcolor: isExpired ? '#FFEBEE' : 'transparent',
                            px: isExpired ? 1 : 0,
                            py: isExpired ? 0.4 : 0,
                            borderRadius: isExpired ? '4px' : 0,
                            display: 'inline-block',
                            fontSize: '0.82rem',
                          }}
                        >
                          {val}
                        </Box>
                      );
                    })()}
                  </TableCell>
                  <TableCell>{row.assignedTo}</TableCell>
                  <TableCell>{row.checklist?.dualCheck?.toUpperCase() === 'YES' ? 'yes' : 'No'}</TableCell>
                  <TableCell>{row.checklist?.dualCheck?.toUpperCase() === 'YES' ? 'yes' : 'No'}</TableCell>
                  <TableCell>{row.checklist?.photoRequired || '-'}</TableCell>
                  <TableCell>{row.checklist?.createdUser || row.checklist?.createdBy || '-'}</TableCell>
                  <TableCell>{formatDate(row.checklist?.createdAt || row.checklist?.createdDate)}</TableCell>
                  <TableCell>{(() => {
                    const upAt = row.updatedAt || row.checklist?.updatedAt;
                    const crAt = row.createdAt || row.checklist?.createdAt;
                    if (!upAt || !crAt) return '-';
                    const msDiff = Math.abs(new Date(upAt) - new Date(crAt));
                    if (msDiff <= 60000) return '-';
                    let upUser = row.updatedUser || row.updatedBy || row.checklist?.updatedUser || row.checklist?.updatedBy || '-';
                    if (upUser === 'Admin istrator' || upUser === 'Administrator') upUser = 'Admin';
                    return upUser;
                  })()}</TableCell>
                  <TableCell>{(() => {
                    const upAt = row.updatedAt || row.checklist?.updatedAt;
                    const crAt = row.createdAt || row.checklist?.createdAt;
                    if (!upAt || !crAt) return '-';
                    const msDiff = Math.abs(new Date(upAt) - new Date(crAt));
                    if (msDiff <= 60000) return '-';
                    return formatDateTime(upAt);
                  })()}</TableCell>
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

      <ExecutionVerifyDialog
        open={dialogOpen}
        handleClose={() => { setDialogOpen(false); setVerifyRemarks(''); }}
        data={activeRow}
        onVerify={(remarks) => handleVerify('Verified', remarks)}
        onReject={(remarks) => handleVerify('Rejected', remarks)}
        onNotAccept={(remarks) => handleVerify('Not Accepted', remarks)}
        isExecution={false}
      />
    </MainCard>
  );
}
