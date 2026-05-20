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
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import axios from 'utils/axios';

import { useSelector, useDispatch } from 'react-redux';
import { setFilterConfig, setTableConfig } from 'store/slices/search';

import MainCard from 'ui-component/cards/MainCard';
import AddCheckListDialog from './AddCheckListDialog';
import ChecklistAssignDialog from './ChecklistAssignDialog';
import { BOSExportButton } from 'ui-component/bos';
import useAuth from 'hooks/useAuth';

import { IconUserPlus, IconEdit, IconPlus, IconFileDots, IconAdjustmentsHorizontal, IconChevronDown, IconChevronUp, IconX } from '@tabler/icons-react';
const columns = [
  { id: 'index', label: '#', minWidth: 50 },
  { id: 'seqNo', label: 'Seq No', minWidth: 80, bold: true },
  { id: 'checkingPoint', label: 'Checking Point', minWidth: 200 },
  { id: 'category', label: 'Category', minWidth: 120 },
  { id: 'frequency', label: 'Frequency', minWidth: 120 },
  { id: 'level', label: 'Level', minWidth: 150 },
  { id: 'department', label: 'Department', minWidth: 150 },
  { id: 'effectiveFrom', label: 'Effective from', minWidth: 120 },
  { id: 'reminderDays', label: 'Days', minWidth: 80 },
  { id: 'expiryDate', label: 'Expire Date', minWidth: 120 },
  { id: 'reminderDate', label: 'Reminder Date', minWidth: 120 },
  { id: 'stockLink', label: 'Stock Link', minWidth: 100 },
  { id: 'assignTo', label: 'Assign To', minWidth: 120 },
  { id: 'assignDate', label: 'Assign Date', minWidth: 120 },
  { id: 'itemCode', label: 'Item Code', minWidth: 120 },
  { id: 'qty', label: 'Qty', minWidth: 80 },
  { id: 'photoRequired', label: 'Photo Required', minWidth: 100 },
  { id: 'dualCheck', label: 'Dual Check', minWidth: 100 },
  { id: 'carryForward', label: 'Carry Forward', minWidth: 100 },
  { id: 'createdBy', label: 'CREATED USER', minWidth: 120 },
  { id: 'createdDate', label: 'CREATED DATE', minWidth: 120 },
  { id: 'updatedBy', label: 'UPDATED USER', minWidth: 120 },
  { id: 'updatedDate', label: 'UPDATED DATE', minWidth: 120 },
  { id: 'status', label: 'Status', minWidth: 100 },
  { id: 'taskStatus', label: 'Task Status', minWidth: 120 },
  { id: 'verifyStatus', label: 'Verify Status', minWidth: 150 },
  { id: 'verifiedBy', label: 'Verified By', minWidth: 120 },
  { id: 'verifiedDate', label: 'Verified Date', minWidth: 120 },
  { id: 'rejReason', label: 'Rej Reason', minWidth: 200 },
  { id: 'attachments', label: 'Docs', minWidth: 80, align: 'center' }
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
  { header: 'Seq No', key: 'seqNo' },
  { header: 'Checking Point', key: 'checkingPoint' },
  { header: 'Category', key: 'category' },
  { header: 'Frequency', key: 'frequency' },
  { header: 'Level', key: 'levelIds' },
  { header: 'Department', key: (r) => (r.departments || []).map(d => d.departmentName).join(', ') },
  { header: 'Effective From', key: (r) => formatDate(r.effectiveFrom) },
  { header: 'Days', key: 'reminderDays' },
  { header: 'Expire Date', key: (r) => formatDate(r.expiryDate) },
  { header: 'Reminder Date', key: (r) => formatDate(r.reminderDate) },
  { header: 'Stock Link', key: 'stockLink' },
  { header: 'Assign To', key: 'assignTo' },
  { header: 'Assign Date', key: (r) => formatDate(r.assignDate) },
  { header: 'Item Code', key: 'itemCode' },
  { header: 'Qty', key: 'qty' },
  { header: 'Photo Required', key: 'photoRequired' },
  { header: 'Dual Check', key: 'dualCheck' },
  { header: 'Carry Forward', key: 'carryForward' },
  { header: 'CREATED USER', key: 'createdBy' },
  { header: 'CREATED DATE', key: (r) => formatDate(r.createdAt || r.createdDate) },
  { header: 'UPDATED USER', key: 'updatedBy' },
  { header: 'UPDATED DATE', key: (r) => formatDate(r.updatedAt || r.updatedDate) },
  { header: 'Status', key: 'status' },
  { header: 'Task Status', key: 'taskStatus' },
  { header: 'Verify Status', key: 'verifyStatus' },
  { header: 'Verified By', key: 'verifiedBy' },
  { header: 'Verified Date', key: (r) => formatDate(r.verifiedDate) },
  { header: 'Rej Reason', key: 'rejReason' }
];

const DEPARTMENTS = [
  'ACCOUNTS','ADMIN','ASSEMBLY','BUSINESS DEVELOPMENT','DESIGN & DEVELOPMENT',
  'HRA','LOGISTICS','MAINTENANCE','MANAGEMENT','MANAGEMENT REPRESENTATIVE',
  'OPERATIONS','PLANNING','PRODUCT DEVELOPMENT','PRODUCTION','PURCHASE',
  'QMS','QUALITY','SALES & MARKETING','STORES','STRATEGIC PROCUREMENT','TOP MANAGEMENT'
];

const DEFAULT_FILTERS = {
  seqNo: '',
  category: 'All',
  frequency: 'All',
  checkingPoint: '',
  description: '',
  departments: [],
  stockLink: 'All',
  photoRequired: 'All',
  dualCheck: 'All',
  carryForward: 'All',

  // Default visible filters
  status: 'All',       // Verify Status
  taskStatus: 'All',   // Task Status
  recordStatus: 'All', // Record Status (Active / In Active)
  employeeName: '',
  leftCompany: 'All',
  searchBy: '',        // Search by field selector
};

const filterConfig = [
  // ── STARRED (default visible) filters ──
  { id: 'recordStatus', label: 'Status', type: 'select', isStarred: true, defaultValue: 'All', options: [
    { value: 'All', label: 'All' },
    { value: 'Active', label: 'Active' },
    { value: 'In Active', label: 'In Active' }
  ]},
  { id: 'taskStatus', label: 'Task Status', type: 'select', isStarred: true, defaultValue: 'All', options: [
    { value: 'All', label: 'All' },
    { value: 'Pending', label: 'Pending' },
    { value: 'In Progress', label: 'In Progress' },
    { value: 'Completed', label: 'Completed' },
    { value: 'Missed', label: 'Missed' }
  ]},
  { id: 'status', label: 'Status', type: 'select', isStarred: true, defaultValue: 'All', options: [
    { value: 'All', label: 'All' },
    { value: 'Pending for Verify', label: 'Pending for Verify' },
    { value: 'Verified', label: 'Verified' },
    { value: 'Rejected', label: 'Rejected' }
  ]},
  { id: 'category', label: 'Category', type: 'select', isStarred: true, defaultValue: 'All', options: [
    { value: 'All', label: 'All' },
    { value: 'RENEWAL', label: 'RENEWAL' },
    { value: 'CHECK LIST', label: 'CHECK LIST' }
  ]},
  { id: 'departments', label: 'Department', type: 'autocomplete', multiple: true, isStarred: true, options: DEPARTMENTS.map(d => ({ value: d, label: d })) },
  { id: 'employeeName', label: 'Employee Name', type: 'text', isStarred: true },
  { id: 'leftCompany', label: 'Left Company', type: 'select', isStarred: true, defaultValue: 'All', options: [
    { value: 'All', label: 'All' },
    { value: 'YES', label: 'YES' },
    { value: 'NO', label: 'NO' }
  ]},
  { id: 'searchBy', label: 'Search by', type: 'select', isStarred: true, defaultValue: '', options: [
    { value: '', label: '-Select-' },
    { value: 'checkingPoint', label: 'Checking Point' },
    { value: 'description', label: 'Descriptions' },
    { value: 'levelIds', label: 'Level' },
    { value: 'seqNo', label: 'Seq.No' },
    { value: 'frequency', label: 'Frequency Level' }
  ]},

  // ── ADD-ON (extra via filter drawer) filters ──
  { id: 'seqNo', label: 'Sequence No', type: 'text', isStarred: false },
  { id: 'frequency', label: 'Frequency', type: 'select', isStarred: false, defaultValue: 'All', options: [
    { value: 'All', label: 'All' },
    { value: 'DAILY', label: 'DAILY' },
    { value: 'WEEKLY', label: 'WEEKLY' },
    { value: 'FORTNIGHTLY', label: 'FORTNIGHTLY' },
    { value: 'MONTHLY', label: 'MONTHLY' },
    { value: 'QUARTERLY', label: 'QUARTERLY' },
    { value: 'HALF YEARLY', label: 'HALF YEARLY' },
    { value: 'YEARLY', label: 'YEARLY' }
  ]},
  { id: 'checkingPoint', label: 'Renewal Point', type: 'text', isStarred: false },
  { id: 'description', label: 'Descriptions/SOP', type: 'text', isStarred: false },
  { id: 'stockLink', label: 'Stock Link', type: 'select', isStarred: false, defaultValue: 'All', options: [
    { value: 'All', label: 'All' },
    { value: 'YES', label: 'YES' },
    { value: 'NO', label: 'NO' }
  ]},
  { id: 'photoRequired', label: 'Photo Required', type: 'select', isStarred: false, defaultValue: 'All', options: [
    { value: 'All', label: 'All' },
    { value: 'YES', label: 'YES' },
    { value: 'NO', label: 'NO' }
  ]},
  { id: 'dualCheck', label: 'Dual Check', type: 'select', isStarred: false, defaultValue: 'All', options: [
    { value: 'All', label: 'All' },
    { value: 'YES', label: 'YES' },
    { value: 'NO', label: 'NO' }
  ]},
  { id: 'carryForward', label: 'Carry Forward', type: 'select', isStarred: false, defaultValue: 'All', options: [
    { value: 'All', label: 'All' },
    { value: 'YES', label: 'YES' },
    { value: 'NO', label: 'NO' }
  ]},
];

// Collapsible filter section
function FilterSection({ title, open, onToggle, children }) {
  return (
    <Box sx={{ mb: 0.5 }}>
      <Box onClick={onToggle} sx={{ display:'flex', justifyContent:'space-between', alignItems:'center', cursor:'pointer', py:1, px:2, '&:hover':{ bgcolor:'action.hover' }, borderRadius:1 }}>
        <Typography variant="subtitle2" sx={{ fontWeight:700 }}>{title}</Typography>
        {open ? <IconChevronUp size={16}/> : <IconChevronDown size={16}/>}
      </Box>
      <Collapse in={open}><Box sx={{ px:2, pb:1 }}>{children}</Box></Collapse>
    </Box>
  );
}

export default function MasterCheckList() {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [isAmendment, setIsAmendment] = useState(false);
  const [rows, setRows] = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [loading, setLoading] = useState(false);
  
  const [selectedRowId, setSelectedRowId] = useState(null);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [showDoubleTap, setShowDoubleTap] = useState(false);
  const searchQuery = useSelector((state) => state.search.query);
  const globalFilters = useSelector((state) => state.search.filters) || {};
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [filters, setFilters] = useState({ ...DEFAULT_FILTERS });
  const [anchorEl, setAnchorEl] = useState(null);

  // Dynamic filter visibility — now all are starred by default, no extra toggles needed
  const [visibleExtraFilters, setVisibleExtraFilters] = useState({
    status: true,
    taskStatus: true,
    recordStatus: true,
    employeeName: true,
    leftCompany: true
  });

  // Configure global search bar filters on mount
  useEffect(() => {
    dispatch(setFilterConfig(filterConfig));
    dispatch(setTableConfig(columns));
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
          'category', 'status', 'taskStatus', 'recordStatus', 'seqNo', 'frequency',
          'checkingPoint', 'description', 'departments', 'stockLink',
          'photoRequired', 'dualCheck', 'carryForward', 'employeeName', 'leftCompany',
          'searchBy'
        ];
        
        filterKeys.forEach((key) => {
          if (globalFilters[key] !== undefined && globalFilters[key] !== prev[key]) {
            newFilters[key] = globalFilters[key];
            hasChanges = true;
            
            // Auto-expand/make visible the extra filters in the drawer if they are activated globally
            if (key === 'status') {
              setVisibleExtraFilters((v) => ({ ...v, status: true }));
            }
            if (key === 'recordStatus') {
              setVisibleExtraFilters((v) => ({ ...v, recordStatus: true }));
            }
          }
        });
        
        return hasChanges ? newFilters : prev;
      });
    }
  }, [globalFilters]);

  // Section toggles
  const [openSections, setOpenSections] = useState({
    seqNo: true,
    category: true,
    frequency: false,
    checkingPoint: false,
    description: false,
    department: false,
    stockLink: false,
    photoRequired: false,
    dualCheck: false,
    carryForward: false
  });

  const toggleSection = (key) => setOpenSections((p) => ({ ...p, [key]: !p[key] }));

  const fetchChecklists = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page,
        size,
        category: filters.category !== 'All' ? filters.category : undefined,
        department: filters.departments.length > 0 ? filters.departments[0] : undefined,
        seqNo: filters.seqNo || undefined,
        frequency: filters.frequency !== 'All' ? filters.frequency : undefined,
        checkingPoint: filters.checkingPoint || undefined,
        description: filters.description || undefined,
        stockLink: filters.stockLink !== 'All' ? filters.stockLink : undefined,
        photoRequired: filters.photoRequired !== 'All' ? filters.photoRequired : undefined,
        dualCheck: filters.dualCheck !== 'All' ? filters.dualCheck : undefined,
        carryForward: filters.carryForward !== 'All' ? filters.carryForward : undefined,
        verifyStatus: filters.status !== 'All' ? filters.status : undefined,
        status: filters.recordStatus !== 'All' ? filters.recordStatus : undefined,
        taskStatus: filters.taskStatus !== 'All' ? filters.taskStatus : undefined,
        searchValue: searchQuery || undefined,
        searchBy: (searchQuery && filters.searchBy) ? filters.searchBy : undefined
      };
      const response = await axios.get('/api/qms/checklist', { params });
      setRows(response.data.content);
      setTotalElements(response.data.totalElements);
    } catch (error) {
      console.error('Failed to fetch checklists:', error);
    } finally {
      setLoading(false);
    }
  }, [page, size, filters, searchQuery]);

  useEffect(() => {
    fetchChecklists();
  }, [fetchChecklists]);

  const setFilter = (key, val) => {
    setFilters((p) => ({ ...p, [key]: val }));
    setPage(0);
  };
  
  const toggleDept = (dept) => {
    setFilters((p) => {
      const arr = p.departments;
      return { ...p, departments: arr.includes(dept) ? arr.filter((d) => d !== dept) : [...arr, dept] };
    });
    setPage(0);
  };

  const addExtraFilter = (key) => {
    setVisibleExtraFilters((p) => ({ ...p, [key]: true }));
  };

  const removeExtraFilter = (key) => {
    setVisibleExtraFilters((p) => ({ ...p, [key]: false }));
    setFilters((p) => ({ ...p, [key]: 'All' }));
    setPage(0);
  };

  const resetFilters = () => {
    setFilters({ ...DEFAULT_FILTERS });
    setVisibleExtraFilters({ status: false, recordStatus: false });
    setPage(0);
  };

  // Build the list of active chips
  const activeChips = [];
  if (filters.seqNo) activeChips.push({ key: 'seqNo', label: `Seq No: ${filters.seqNo}`, onDelete: () => setFilter('seqNo', '') });
  if (filters.category !== 'All') activeChips.push({ key: 'category', label: `Category: ${filters.category}`, onDelete: () => setFilter('category', 'All') });
  if (filters.frequency !== 'All') activeChips.push({ key: 'frequency', label: `Frequency: ${filters.frequency}`, onDelete: () => setFilter('frequency', 'All') });
  if (filters.checkingPoint) activeChips.push({ key: 'checkingPoint', label: `Renewal Point: ${filters.checkingPoint}`, onDelete: () => setFilter('checkingPoint', '') });
  if (filters.description) activeChips.push({ key: 'description', label: `Description: ${filters.description}`, onDelete: () => setFilter('description', '') });
  filters.departments.forEach((d) => {
    activeChips.push({ key: `dept-${d}`, label: d, onDelete: () => toggleDept(d) });
  });
  if (filters.stockLink !== 'All') activeChips.push({ key: 'stockLink', label: `Stock Link: ${filters.stockLink}`, onDelete: () => setFilter('stockLink', 'All') });
  if (filters.photoRequired !== 'All') activeChips.push({ key: 'photoRequired', label: `Photo: ${filters.photoRequired}`, onDelete: () => setFilter('photoRequired', 'All') });
  if (filters.dualCheck !== 'All') activeChips.push({ key: 'dualCheck', label: `Dual Check: ${filters.dualCheck}`, onDelete: () => setFilter('dualCheck', 'All') });
  if (filters.carryForward !== 'All') activeChips.push({ key: 'carryForward', label: `Carry Forward: ${filters.carryForward}`, onDelete: () => setFilter('carryForward', 'All') });
  
  if (visibleExtraFilters.status && filters.status !== 'All') {
    activeChips.push({ key: 'status', label: `Verify Status: ${filters.status}`, onDelete: () => setFilter('status', 'All') });
  }
  if (visibleExtraFilters.recordStatus && filters.recordStatus !== 'All') {
    activeChips.push({ key: 'recordStatus', label: `Record Status: ${filters.recordStatus}`, onDelete: () => setFilter('recordStatus', 'All') });
  }

  const activeCount = activeChips.length;

  const availableExtraFilters = [];
  if (!visibleExtraFilters.status) availableExtraFilters.push({ key: 'status', label: 'Verify Status' });
  if (!visibleExtraFilters.recordStatus) availableExtraFilters.push({ key: 'recordStatus', label: 'Record Status' });

  const handleSaveData = async (data) => {
    try {
      // Separate department list from body — departments go as query params, not body
      const { department, ...rawBody } = data;
      const departments = department || [];

      // Build a safe body with no undefined/NaN values
      const body = Object.fromEntries(
        Object.entries(rawBody).filter(([, v]) => v !== undefined && v !== null && v === v /* NaN check */)
      );

      // Inject current logged-in user context
      body.updatedBy = user?.name || user?.id || 'Admin';

      // Build query string with repeated departments params: ?departments=A&departments=B
      const qs = new URLSearchParams();
      departments.forEach((d) => qs.append('departments', d));

      await axios.post(`/api/qms/checklist?${qs.toString()}`, body);
      fetchChecklists();
      setDialogOpen(false);
    } catch (error) {
      console.error('Failed to save checklist:', error);
      const msg = error?.message || error?.error || 'Unknown error';
      alert(`Failed to save: ${msg}`);
    }
  };

  const handleEditClick = () => {
    if (!selectedRowId) {
      alert('Please select a row first!');
      return;
    }
    setIsAmendment(false);
    setDialogOpen(true);
  };

  const handleAmendmentClick = () => {
    if (!selectedRowId) {
      alert('Please select a row first!');
      return;
    }
    setIsAmendment(true);
    setDialogOpen(true);
  };

  const handleAssignClick = () => {
    if (!selectedRowId) {
      alert('Please select a row first!');
      return;
    }
    const selectedRow = rows.find((r) => r.id === selectedRowId);
    if (selectedRow?.verifyStatus !== 'Verified') {
      alert('Only verified checklists can be assigned to users!');
      return;
    }
    setAssignDialogOpen(true);
  };

  const activeRow = rows.find((r) => r.id === selectedRowId) || null;

  return (
    <MainCard
      title="Master Check List"
      secondary={
        <Box sx={{ display:'flex', alignItems:'center', gap:1 }}>
          <Button variant="contained" color="secondary" size="small" startIcon={<IconUserPlus size={18}/>} onClick={handleAssignClick}>Assign To</Button>
          <Button variant="contained" color="secondary" size="small" startIcon={<IconFileDots size={18}/>} onClick={handleAmendmentClick}>Amendment</Button>
          <Button variant="contained" color="secondary" size="small" startIcon={<IconEdit size={18}/>} onClick={handleEditClick}>Edit</Button>
          <Button variant="contained" color="primary" size="small" startIcon={<IconPlus size={18}/>} onClick={() => { setSelectedRowId(null); setIsAmendment(false); setDialogOpen(true); }}>Add</Button>
          <BOSExportButton data={rows} filename="Master_Check_List" columns={exportColumns} size="small" />
        </Box>
      }
    >
      <Box sx={{ p: 0.5, pb: 0 }}>
        {activeCount > 0 && (
          <Box sx={{ display:'flex', gap:0.5, mb:2, flexWrap:'wrap', alignItems:'center' }}>
            <Typography variant="body2" sx={{ fontWeight:600, mr:0.5 }}>Filters:</Typography>
            {activeChips.map((chip) => (
              <Chip key={chip.key} label={chip.label} size="small" color="primary" onDelete={chip.onDelete}/>
            ))}
            <Button size="small" color="error" onClick={resetFilters} sx={{ ml:1 }}>Clear All</Button>
          </Box>
        )}
      </Box>

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

      <TableContainer component={Paper} sx={{ height: 'calc(100vh - 240px)', borderTop:'1px solid', borderColor:'divider', borderRadius: 0, '&::-webkit-scrollbar':{width:10,height:10}, '&::-webkit-scrollbar-track':{backgroundColor:'background.paper'}, '&::-webkit-scrollbar-thumb':{backgroundColor:'grey.400',borderRadius:2} }}>
        <Table stickyHeader sx={{ minWidth: 4000 }} aria-label="checklist table">
          <TableHead>
            <TableRow>
              {columns.map((col,i) => (
                <TableCell key={i} sx={{ minWidth: col.minWidth || 200, bgcolor:'primary.dark', color:'white', fontWeight:'bold', whiteSpace:'nowrap', borderRight:'1px solid rgba(255,255,255,0.2)' }}>
                  {col.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={columns.length} align="center" sx={{ py:6 }}><Typography variant="body1" color="textSecondary">Loading...</Typography></TableCell></TableRow>
            ) : rows.length === 0 ? (
              <TableRow><TableCell colSpan={columns.length} align="center" sx={{ py:6 }}><Typography variant="body1" color="textSecondary">{searchQuery || activeCount > 0 ? 'No matching records found' : 'No data available in table'}</Typography></TableCell></TableRow>
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
                <TableCell sx={{ minWidth: 50 }}>{page * size + idx + 1}</TableCell>
                <TableCell sx={{ minWidth: 80, fontWeight:'bold' }}>{row.seqNo}</TableCell>
                <TableCell sx={{ minWidth: 200 }}>{row.checkingPoint}</TableCell>
                <TableCell sx={{ minWidth: 120 }}>{row.category}</TableCell>
                <TableCell sx={{ minWidth: 120 }}>{row.frequency}</TableCell>
                <TableCell sx={{ minWidth: 150 }}>{row.levelIds || '-'}</TableCell>
                <TableCell sx={{ minWidth: 150 }}>{(row.departments || []).map(d => d.departmentName).join(', ')}</TableCell>
                <TableCell sx={{ minWidth: 120 }}>{formatDate(row.effectiveFrom)}</TableCell>
                <TableCell sx={{ minWidth: 80 }}>{row.reminderDays}</TableCell>
                <TableCell sx={{ minWidth: 120 }}>{formatDate(row.expiryDate)}</TableCell>
                <TableCell sx={{ minWidth: 120 }}>{formatDate(row.reminderDate)}</TableCell>
                <TableCell sx={{ minWidth: 100 }}>{row.stockLink}</TableCell>
                <TableCell sx={{ minWidth: 120 }}>{row.assignTo}</TableCell>
                <TableCell sx={{ minWidth: 120 }}>{formatDate(row.assignDate)}</TableCell>
                <TableCell sx={{ minWidth: 120 }}>{row.itemCode}</TableCell>
                <TableCell sx={{ minWidth: 80 }}>{row.qty}</TableCell>
                <TableCell sx={{ minWidth: 100 }}>{row.photoRequired}</TableCell>
                <TableCell sx={{ minWidth: 100 }}>{row.dualCheck}</TableCell>
                <TableCell sx={{ minWidth: 100 }}>{row.carryForward}</TableCell>
                <TableCell sx={{ minWidth: 120 }}>{row.createdBy}</TableCell>
                <TableCell sx={{ minWidth: 120 }}>{formatDate(row.createdAt)}</TableCell>
                <TableCell sx={{ minWidth: 120 }}>{row.updatedBy}</TableCell>
                <TableCell sx={{ minWidth: 120 }}>{formatDate(row.updatedAt)}</TableCell>
                <TableCell sx={{ minWidth: 100 }}>{row.status}</TableCell>
                <TableCell sx={{ minWidth: 120 }}>{row.taskStatus}</TableCell>
                <TableCell sx={{ minWidth: 150 }}>{row.verifyStatus}</TableCell>
                <TableCell sx={{ minWidth: 120 }}>{row.verifiedBy}</TableCell>
                <TableCell sx={{ minWidth: 120 }}>{formatDate(row.verifiedDate)}</TableCell>
                <TableCell sx={{ minWidth: 200 }}>{row.rejReason}</TableCell>
                <TableCell sx={{ minWidth: 80, align:'center' }}>-</TableCell>
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

      {/* ===== FILTER DRAWER ===== */}
      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)} PaperProps={{ sx:{ width:320 } }}>
        <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'center', p:2, borderBottom:'1px solid', borderColor:'divider' }}>
          <Typography variant="h5" sx={{ fontWeight:700 }}>Filters</Typography>
          <IconButton size="small" onClick={() => setDrawerOpen(false)}><IconX size={20}/></IconButton>
        </Box>

        <Box sx={{ overflowY:'auto', flex:1, py:1 }}>
          
          {/* ================= DEFAULT FILTERS ================= */}
          <FilterSection title="Sequence No" open={openSections.seqNo} onToggle={() => toggleSection('seqNo')}>
            <TextField size="small" fullWidth placeholder="Search sequence no..." value={filters.seqNo} onChange={(e) => setFilter('seqNo', e.target.value)}/>
          </FilterSection>
          <Divider/>

          <FilterSection title="Category" open={openSections.category} onToggle={() => toggleSection('category')}>
            <FormControl><RadioGroup value={filters.category} onChange={(e) => setFilter('category', e.target.value)}>
              {['All','RENEWAL','CHECK LIST'].map((v) => <FormControlLabel key={v} value={v} control={<Radio size="small"/>} label={<Typography variant="body2">{v}</Typography>}/>)}
            </RadioGroup></FormControl>
          </FilterSection>
          <Divider/>

          <FilterSection title="Frequency" open={openSections.frequency} onToggle={() => toggleSection('frequency')}>
            <FormControl><RadioGroup value={filters.frequency} onChange={(e) => setFilter('frequency', e.target.value)}>
              {['All','DAILY','WEEKLY','FORTNIGHTLY','MONTHLY','QUARTERLY','HALF YEARLY','YEARLY'].map((v) => <FormControlLabel key={v} value={v} control={<Radio size="small"/>} label={<Typography variant="body2">{v}</Typography>}/>)}
            </RadioGroup></FormControl>
          </FilterSection>
          <Divider/>

          <FilterSection title="Renewal Point" open={openSections.checkingPoint} onToggle={() => toggleSection('checkingPoint')}>
            <TextField size="small" fullWidth placeholder="Search renewal point..." value={filters.checkingPoint} onChange={(e) => setFilter('checkingPoint', e.target.value)}/>
          </FilterSection>
          <Divider/>

          <FilterSection title="Descriptions/SOP" open={openSections.description} onToggle={() => toggleSection('description')}>
            <TextField size="small" fullWidth placeholder="Search description..." value={filters.description} onChange={(e) => setFilter('description', e.target.value)}/>
          </FilterSection>
          <Divider/>

          <FilterSection title="Department" open={openSections.department} onToggle={() => toggleSection('department')}>
            <Box sx={{ maxHeight:150, overflowY:'auto' }}>
              {DEPARTMENTS.map((d) => <FormControlLabel key={d} sx={{ display:'flex', ml:0, mr:0, py:0.2 }} control={<Checkbox size="small" checked={filters.departments.includes(d)} onChange={() => toggleDept(d)} sx={{ p:0.5 }}/>} label={<Typography variant="body2">{d}</Typography>}/>)}
            </Box>
          </FilterSection>
          <Divider/>

          <FilterSection title="Stock Link" open={openSections.stockLink} onToggle={() => toggleSection('stockLink')}>
            <FormControl><RadioGroup value={filters.stockLink} onChange={(e) => setFilter('stockLink', e.target.value)}>
              {['All','YES','NO'].map((v) => <FormControlLabel key={v} value={v} control={<Radio size="small"/>} label={<Typography variant="body2">{v}</Typography>}/>)}
            </RadioGroup></FormControl>
          </FilterSection>
          <Divider/>

          <FilterSection title="Photo Required" open={openSections.photoRequired} onToggle={() => toggleSection('photoRequired')}>
            <FormControl><RadioGroup value={filters.photoRequired} onChange={(e) => setFilter('photoRequired', e.target.value)}>
              {['All','YES','NO'].map((v) => <FormControlLabel key={v} value={v} control={<Radio size="small"/>} label={<Typography variant="body2">{v}</Typography>}/>)}
            </RadioGroup></FormControl>
          </FilterSection>
          <Divider/>

          <FilterSection title="Dual Check" open={openSections.dualCheck} onToggle={() => toggleSection('dualCheck')}>
            <FormControl><RadioGroup value={filters.dualCheck} onChange={(e) => setFilter('dualCheck', e.target.value)}>
              {['All','YES','NO'].map((v) => <FormControlLabel key={v} value={v} control={<Radio size="small"/>} label={<Typography variant="body2">{v}</Typography>}/>)}
            </RadioGroup></FormControl>
          </FilterSection>
          <Divider/>

          <FilterSection title="Carry Forward" open={openSections.carryForward} onToggle={() => toggleSection('carryForward')}>
            <FormControl><RadioGroup value={filters.carryForward} onChange={(e) => setFilter('carryForward', e.target.value)}>
              {['All','YES','NO'].map((v) => <FormControlLabel key={v} value={v} control={<Radio size="small"/>} label={<Typography variant="body2">{v}</Typography>}/>)}
            </RadioGroup></FormControl>
          </FilterSection>
          <Divider/>

          {/* ================= OPTIONAL EXTRA FILTERS ================= */}
          {visibleExtraFilters.status && (
            <>
              <Box sx={{ px:2, pt:1.5, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <Typography variant="subtitle2" sx={{ fontWeight:700 }}>Verify Status</Typography>
                <IconButton size="small" color="error" onClick={() => removeExtraFilter('status')}><IconX size={14}/></IconButton>
              </Box>
              <Box sx={{ px:2, pb:1 }}>
                <FormControl><RadioGroup value={filters.status} onChange={(e) => setFilter('status', e.target.value)}>
                  {['All','Pending for Verify','Verified','Rejected'].map((v) => <FormControlLabel key={v} value={v} control={<Radio size="small"/>} label={<Typography variant="body2">{v}</Typography>}/>)}
                </RadioGroup></FormControl>
              </Box>
              <Divider/>
            </>
          )}

          {visibleExtraFilters.recordStatus && (
            <>
              <Box sx={{ px:2, pt:1.5, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <Typography variant="subtitle2" sx={{ fontWeight:700 }}>Record Status</Typography>
                <IconButton size="small" color="error" onClick={() => removeExtraFilter('recordStatus')}><IconX size={14}/></IconButton>
              </Box>
              <Box sx={{ px:2, pb:1 }}>
                <FormControl><RadioGroup value={filters.recordStatus} onChange={(e) => setFilter('recordStatus', e.target.value)}>
                  {['All','Active','In Active'].map((v) => <FormControlLabel key={v} value={v} control={<Radio size="small"/>} label={<Typography variant="body2">{v}</Typography>}/>)}
                </RadioGroup></FormControl>
              </Box>
              <Divider/>
            </>
          )}

          {/* ADD FILTER DYNAMIC BUTTON */}
          {availableExtraFilters.length > 0 && (
            <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<IconPlus size={16} />}
                onClick={(e) => setAnchorEl(e.currentTarget)}
                sx={{ textTransform: 'none', borderRadius: 1.5 }}
              >
                Add Filter
              </Button>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => setAnchorEl(null)}
              >
                {availableExtraFilters.map((f) => (
                  <MenuItem
                    key={f.key}
                    onClick={() => {
                      addExtraFilter(f.key);
                      setAnchorEl(null);
                    }}
                  >
                    {f.label}
                  </MenuItem>
                ))}
              </Menu>
            </Box>
          )}

        </Box>

        <Box sx={{ p:2, borderTop:'1px solid', borderColor:'divider', display:'flex', gap:1 }}>
          <Button fullWidth variant="outlined" color="error" onClick={() => { resetFilters(); setDrawerOpen(false); }}>Reset All</Button>
          <Button fullWidth variant="contained" onClick={() => setDrawerOpen(false)}>Apply</Button>
        </Box>
      </Drawer>

      <AddCheckListDialog open={dialogOpen} handleClose={() => setDialogOpen(false)} onSave={handleSaveData} initialData={activeRow} isAmendment={isAmendment}/>
      <ChecklistAssignDialog open={assignDialogOpen} onClose={() => { setAssignDialogOpen(false); fetchChecklists(); }} checklistId={selectedRowId} initialData={activeRow}/>
    </MainCard>
  );
}
