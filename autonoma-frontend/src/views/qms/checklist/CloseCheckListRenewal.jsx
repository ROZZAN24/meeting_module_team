import TextField from 'ui-component/CustomTextField';
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
import { BOSTableToolbar, getCommonDateFilters, matchCommonDateFilters, BOSDatePicker } from 'ui-component/bos';

import { IconAdjustmentsHorizontal, IconChevronDown, IconChevronUp, IconCheck, IconFileDownload, IconX } from '@tabler/icons-react';
import usePagePermissions, { PAGE_CODES } from 'hooks/usePagePermissions';

const columns = [
  '#',
  'Seq.No',
  'Checking Point',
  'Frequency',
  'Category',
  'Assign Type',
  'Photo Required',
  'Verification Required',
  'Assign Date',
  'Next Renewal Date',
  'Assign To',
  'Verification Status',
  'Created By',
  'Created Date',
  'Updated By',
  'Update Date & Time'
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
  considerDateValue: '',
  statuses: [],
  searchBy: 'All',
  departments: [],

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
  { id: 'stockLink', label: 'Stock Link' },
  { id: 'itemCode', label: 'Item Code' },
  { id: 'qty', label: 'Quantity' },
  { id: 'assignedTo', label: 'Assign To' },
  { id: 'assignedDate', label: 'Date' },
  { id: 'checklistDate', label: 'Checklist Date' },
  { id: 'expireDate', label: 'Expire Date' },
  { id: 'nextDueDate', label: 'Next Due Date' },
  { id: 'status', label: 'Status' },
  { id: 'attendedDate', label: 'Attended Date' },
  { id: 'attendedBy', label: 'Attended By' },
  { id: 'verificationRequired', label: 'Verification Required' },
  { id: 'photoRequired', label: 'Photo Required' },
  { id: 'carryForward', label: 'Carry Forward' },
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
  { header: 'Seq.No', key: (r) => r.checklist?.seqNo },
  { header: 'Checking Point', key: (r) => r.checklist?.checkingPoint },
  { header: 'Frequency', key: (r) => r.checklist?.frequency },
  { header: 'Category', key: (r) => r.checklist?.category },
  { header: 'Assign Type', key: (r) => r.assignType || 'Mine' },
  { header: 'Photo Required', key: (r) => r.checklist?.photoRequired },
  { header: 'Verification Required', key: (r) => r.checklist?.dualCheck?.toUpperCase() === 'YES' ? 'yes' : 'No' },
  { header: 'Assign Date', key: (r) => formatDate(r.assignedDate) },
  { header: 'Next Renewal Date', key: (r) => r.checklist?.nextDueDate || formatDate(r.checklist?.expiryDate) },
  { header: 'Assign To', key: (r) => r.assignedTo },
  { header: 'Verification Status', key: (r) => typeof r.status === 'object' ? r.status?.name : r.status },
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

const getFilterConfig = (departments) => [{
    id: 'taskType', label: 'Task Type', type: 'select', isStarred: true, defaultValue: 'All', options: [
      { value: 'All', label: 'All' },
      { value: 'Mine', label: 'Mine' },
      { value: 'Team', label: 'Team' },
      { value: 'Company', label: 'Company' }
    ]
  },
  { id: 'fromDate', label: 'Created Date From', type: 'date', isStarred: true },
  { id: 'toDate', label: 'Created Date To', type: 'date', isStarred: true },
  {
    id: 'considerDate', label: 'Consider Date?', type: 'select', isStarred: true, defaultValue: 'No', options: [
      { value: 'All', label: 'All' },
      { value: 'Yes', label: 'Yes' },
      { value: 'No', label: 'No' }
    ]
  },
  { id: 'statuses', label: 'Status', type: 'autocomplete', multiple: true, isStarred: true, options: STATUS_OPTIONS.map(s => ({ value: s, label: s })) },
  { id: 'departments', label: 'Department', type: 'autocomplete', multiple: true, isStarred: true, options: departments.map(d => ({ value: d, label: d })) },
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
  },
  ...getCommonDateFilters('createdDate', 'updatedDate')];

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
  
  const greenStates = ['Completed', 'Verified', 'Accepted', 'Attended'];
  const redStates   = ['Pending', 'Missed', 'Unresolved', 'Not Completed', 'Pending for Verified', 'Pending for Accepted', 'Rejected'];
  const blueStates  = ['Started', '75%', '50%', '25%'];
  
  let bg = '#EEEEEE';
  let text = '#616161';
  
  if (greenStates.includes(label)) {
    bg = '#E8F5E9';
    text = '#2E7D32';
  } else if (redStates.includes(label)) {
    bg = '#FFEBEE';
    text = '#C62828';
  } else if (blueStates.includes(label)) {
    bg = '#E3F2FD';
    text = '#1565C0';
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
  const perms = usePagePermissions(PAGE_CODES.QMS_CHECKLIST_CLOSE);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [filters, setFilters] = useState({ ...DEFAULT_FILTERS });
  const [openSections, setOpenSections] = useState({ taskType: true, date: true, status: true, searchBy: false });
  const toggleSection = (key) => setOpenSections((p) => ({ ...p, [key]: !p[key] }));

  const [departmentsList, setDepartmentsList] = useState([]);

  // Auto-set fromDate to today when the filter drawer opens (only if not already set)
  useEffect(() => {
    if (drawerOpen && !filters.fromDate) {
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');
      setFilters((prev) => ({ ...prev, fromDate: `${yyyy}-${mm}-${dd}` }));
    }
  }, [drawerOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    axios.get('/api/master/hr/departments')
      .then(res => {
        const list = (res.data || [])
          .filter(d => d.status?.toLowerCase() === 'active' || d.status === null)
          .map(d => d.departmentName);
        setDepartmentsList(list);
      })
      .catch(err => {
        console.error("Failed to load departments from master", err);
      });
  }, []);

  // Configure global search bar filters on mount
  useEffect(() => {
    dispatch(setFilterConfig(getFilterConfig(departmentsList)));
    dispatch(setTableConfig(tableCols));
    return () => {
      dispatch(setFilterConfig(null));
      dispatch(setTableConfig(null));
    };
  }, [dispatch, departmentsList]);

  // Sync global search filters with local filters
  useEffect(() => {
    if (Object.keys(globalFilters).length > 0) {
      setFilters((prev) => {
        const newFilters = { ...prev };
        let hasChanges = false;

        const filterKeys = [
          'taskType', 'fromDate', 'toDate', 'considerDate', 'considerDateValue', 'statuses',
          'searchBy', 'departments', 'seqNo', 'checkingPoint', 'category',
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
      const depts = filters.departments || [];
      const considerDate = globalFilters.createdDateConsider || filters.considerDate || 'No';
      const params = {
        page,
        size,
        status: filters.statuses.length > 0 ? filters.statuses[0] : undefined,
        fromDate: globalFilters.createdDateStart || filters.fromDate || undefined,
        toDate: globalFilters.createdDateEnd || filters.toDate || undefined,
        considerDate: considerDate !== 'All' ? considerDate : undefined,
        considerDateValue: (String(considerDate).trim().toUpperCase() === 'YES' && (globalFilters.createdDateConsiderValue || filters.considerDateValue)) ? (globalFilters.createdDateConsiderValue || filters.considerDateValue) : undefined,
        searchValue: searchQuery || undefined,
        searchBy: filters.searchBy !== 'All' ? filters.searchBy : undefined,
        department: depts.length > 0 ? depts[0] : undefined,

        // Task Filtering
        taskType: filters.taskType !== 'All' ? filters.taskType : undefined,
        currentUser: user?.id || user?.name || undefined,
        excludeCompleted: true,
        excludePending: false,

        // Add-on filters
        seqNo: filters.seqNo || undefined,
        checkingPoint: filters.checkingPoint || undefined,
        category: filters.category !== 'All' ? filters.category : undefined,
        frequency: filters.frequency !== 'All' ? filters.frequency : undefined,
        stockLink: filters.stockLink !== 'All' ? filters.stockLink : undefined
      };

      // If no explicit date range is set, default toDate to today to hide future auto-generated tasks
      if (!params.fromDate && !params.toDate) {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        params.toDate = `${yyyy}-${mm}-${dd}`;
      }

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
        // Additional client-side filter: exclude any remaining finalized statuses
        const finalizedStatuses = ['Verified', 'Completed', 'Accepted', 'Attended', 'Rejected', 'Missed', 'Not Completed', 'Pending for Verified', 'Pending for Accepted'];
        const filteredRows = response.data.content.filter((r) => {
      if (!matchCommonDateFilters(r, globalFilters, 'createdDate', 'updatedDate')) return false;

          const statusName = typeof r.status === 'object' ? r.status?.name : r.status;
          return !finalizedStatuses.includes(statusName);
        });
        setRows(filteredRows);
        setTotalElements(filteredRows.length);
    } catch (error) {
      console.error('Failed to fetch assignments:', error);
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

  const handleUpdateStatus = async (status) => {
    if (selectedRowId === null || selectedRowId === undefined) return;
    try {
      await axios.post('/api/qms/checklist/verify', {
        assignmentId: selectedRowId,
        status: status,
        verifiedBy: user?.name || user?.id || 'Admin',
        remarks: `Status updated to ${status}`
      });
      fetchAssignments();
    } catch (error) {
      console.error('Failed to update assignment status:', error);
    }
  };

  const handleSaveExecution = async (formData) => {
    if (selectedRowId === null || selectedRowId === undefined) return;
    try {
      const uploadedFileNames = [];
      for (const f of formData.actualFiles) {
        if (f.isServer) {
          uploadedFileNames.push(f.serverFileName || f.name);
        } else if (f.file) {
          const upFormData = new FormData();
          upFormData.append('file', f.file);
          const res = await axios.post('/api/files/upload', upFormData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
          uploadedFileNames.push(res.data);
        }
      }

      await axios.post('/api/qms/checklist/verify', {
        assignmentId: selectedRowId,
        status: formData.status || 'Completed',
        verifiedBy: user?.name || user?.id || 'Executor',
        remarks: formData.remarks || '',
        actualFiles: uploadedFileNames
      });

      setDialogOpen(false);
      fetchAssignments();
    } catch (error) {
      console.error('Failed to save execution:', error);
    }
  };

  const activeCount = (filters.taskType !== 'Mine' ? 1 : 0) + (filters.fromDate ? 1 : 0) + (filters.toDate ? 1 : 0) + (filters.considerDate !== 'No' ? 1 : 0) + (filters.statuses?.length || 0);

  const canEditSelected = perms.write || (activeRow && activeRow.assignedTo && (
    activeRow.assignedTo.toLowerCase() === user?.id?.toLowerCase() ||
    activeRow.assignedTo.toLowerCase() === user?.name?.toLowerCase()
  ));

  return (
    <MainCard
      contentSX={{ p: 0 }}
      sx={{
        mx: { xs: -2, sm: -3 },
        width: { xs: 'calc(100% + 32px)', sm: 'calc(100% + 48px)' },
        borderRadius: 0
      }}
      title="Close Check List / Renewal"
      secondary={
        <BOSTableToolbar
          exportData={rows}
          
          exportFilename="Close_Checklist"
          hasExportPermission={perms.export}
          onCompleteTask={canEditSelected ? () => setDialogOpen(true) : null}
          completeTaskDisabled={!selectedRowId}
         columns={columns} />
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
              ) : rows.map((row, idx) => {
                const isRowEditable = perms.write || (row.assignedTo && (
                  row.assignedTo.toLowerCase() === user?.id?.toLowerCase() ||
                  row.assignedTo.toLowerCase() === user?.name?.toLowerCase()
                ));
                return (
                  <TableRow
                    key={row.id}
                    hover
                    onClick={() => setSelectedRowId(row.id)}
                    onDoubleClick={() => { if (isRowEditable) { setSelectedRowId(row.id); setDialogOpen(true); } }}
                    onMouseEnter={() => { if (isRowEditable) setShowDoubleTap(true); }}
                    onMouseLeave={() => setShowDoubleTap(false)}
                    onMouseMove={(e) => setCursorPos({ x: e.clientX, y: e.clientY })}
                    sx={{ cursor: isRowEditable ? 'pointer' : 'default', bgcolor: selectedRowId === row.id ? 'primary.light' : 'inherit' }}
                  >
                    <TableCell>{page * size + idx + 1}</TableCell>
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
                    <TableCell>{row.checklist?.frequency}</TableCell>
                    <TableCell>{row.checklist?.category}</TableCell>
                    <TableCell>{row.assignType || 'Mine'}</TableCell>
                    <TableCell>{row.checklist?.photoRequired || '-'}</TableCell>
                    <TableCell>{row.checklist?.dualCheck?.toUpperCase() === 'YES' ? 'yes' : 'No'}</TableCell>
                    <TableCell>{formatDate(row.assignedDate)}</TableCell>
                    <TableCell>
                      {(() => {
                        const rawDate = row.checklist?.nextDueDate || row.checklist?.expiryDate;
                        if (!rawDate) return '-';
                        const val = formatDate(rawDate);
                        if (val === '-') return '-';
                        const exp = new Date(rawDate);
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
                    <TableCell>{row.assignedTo || '-'}</TableCell>
                    <TableCell><StatusChip status={row.status} /></TableCell>
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
                );
              })}
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
              <BOSDatePicker label="From" value={filters.fromDate} onChange={(e) => setFilter('fromDate', e.target.value)} />
            </Box>
            <Box>
              <BOSDatePicker label="To" value={filters.toDate} onChange={(e) => setFilter('toDate', e.target.value)} />
            </Box>
          </FilterSection>
          <Divider />
          <FilterSection title="Consider Date?" open={openSections.considerDate} onToggle={() => toggleSection('considerDate')}>
            <FormControl><RadioGroup value={filters.considerDate} onChange={(e) => {
              const val = e.target.value;
              setFilter('considerDate', val);
              if (val === 'Yes') {
                const today = new Date();
                const yyyy = today.getFullYear();
                const mm = String(today.getMonth() + 1).padStart(2, '0');
                const dd = String(today.getDate()).padStart(2, '0');
                const todayStr = `${yyyy}-${mm}-${dd}`;
                setFilter('considerDateValue', todayStr);
                setFilter('fromDate', todayStr);
              }
            }}>
              {['All', 'Yes', 'No'].map((v) => <FormControlLabel key={v} value={v} control={<Radio size="small" />} label={<Typography variant="body2">{v}</Typography>} />)}
            </RadioGroup></FormControl>
            {filters.considerDate === 'Yes' && (
              <Box sx={{ mt: 1.5 }}>
                <Box sx={{ mb: 1.5 }}>
                  <BOSDatePicker label="Consider Date" value={filters.considerDateValue || ''} onChange={(e) => {
                    const val = e.target.value;
                    setFilter('considerDateValue', val);
                    if (val) {
                      setFilter('fromDate', val);
                    }
                  }} />
                </Box>
                {filters.considerDateValue && (
                  (() => {
                    const considerVal = new Date(filters.considerDateValue);
                    const fromVal = filters.fromDate ? new Date(filters.fromDate) : null;
                    const toVal = filters.toDate ? new Date(filters.toDate) : null;
                    let isInvalid = false;
                    if (fromVal && considerVal < fromVal) isInvalid = true;
                    if (toVal && considerVal > toVal) isInvalid = true;
                    if (isInvalid) {
                      return (
                        <Typography variant="caption" color="error" sx={{ fontWeight: 600, display: 'block', mt: 0.5 }}>
                          Consider Date must fall within Created Date From and Created Date To range
                        </Typography>
                      );
                    }
                    return null;
                  })()
                )}
              </Box>
            )}
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
        isExecution={true}
        onSave={handleSaveExecution}
      />
    </MainCard>
  );
}
