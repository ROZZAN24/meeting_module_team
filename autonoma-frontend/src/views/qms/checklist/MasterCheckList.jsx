import { useState, useEffect, useCallback, useMemo } from 'react';
import { Typography, Button, Stack, Tooltip, IconButton, Chip, Box, Popover, Checkbox } from '@mui/material';
import { IconRefresh, IconEdit, IconUserPlus, IconFileDots, IconClipboardList, IconAdjustmentsHorizontal, IconCheck, IconBan } from '@tabler/icons-react';
import axios from 'utils/axios';
import { useDispatch, useSelector } from 'react-redux';
import { setFilterConfig } from 'store/slices/search';
import { openSnackbar } from 'store/slices/snackbar';
import MainCard from 'ui-component/cards/MainCard';
import AddCheckListDialog from './AddCheckListDialog';
import ChecklistAssignDialog from './ChecklistAssignDialog';
import { BOSDataTable, BOSExportButton, btnNew } from 'ui-component/bos';
import useAuth from 'hooks/useAuth';
import usePagePermissions, { PAGE_CODES } from 'hooks/usePagePermissions';
import useKeyboardShortcuts, { shortcutTooltip } from 'hooks/useKeyboardShortcuts';

// ── Date formatter ──────────────────────────────────────────────────────────────
const formatDate = (dateVal) => {
  if (!dateVal) return '-';
  try {
    if (typeof dateVal === 'string') {
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateVal)) {
        const [yyyy, mm, dd] = dateVal.split('-');
        return `${dd}/${mm}/${yyyy}`;
      }
      if (dateVal.includes('T')) {
        const [yyyy, mm, dd] = dateVal.split('T')[0].split('-');
        return `${dd}/${mm}/${yyyy}`;
      }
    }
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return '-';
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  } catch {
    return '-';
  }
};

// ── DateTime formatter (Date + Time) ────────────────────────────────────────────
const formatDateTime = (dateVal) => {
  if (!dateVal) return '-';
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return '-';
    const date = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
    const hours = String(d.getHours()).padStart(2, '0');
    const mins  = String(d.getMinutes()).padStart(2, '0');
    return `${date} ${hours}:${mins}`;
  } catch {
    return '-';
  }
};

// ── Column definitions ──────────────────────────────────────────────────────────
const columns = [
  { id: 'index',        label: 'No',             minWidth: 55  },
  { id: 'seqNo',        label: 'Seq No',          minWidth: 90,  bold: true },
  { id: 'category',     label: 'Category',        minWidth: 120 },
  { id: 'checkingPoint',label: 'Checking Point',  minWidth: 200 },
  { id: 'description',  label: 'Descriptions/SOP',minWidth: 200 },
  { id: 'department',   label: 'Department',      minWidth: 160 },
  { id: 'effectiveFrom',label: 'Effective From',  minWidth: 120 },
  { id: 'frequency',    label: 'Frequency',       minWidth: 120 },
  {
    id: 'expiryDate',
    label: 'Expiry Date',
    minWidth: 120,
    render: (row) => {
      const val = row.expiryDate;
      if (!val || val === '-') return <span>-</span>;
      const isExpired = row._expiryExpired;
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
    }
  },
  { id: 'reminderDays', label: 'Reminder Days',   minWidth: 110 },
  { id: 'reminderDate', label: 'Reminder Date',   minWidth: 120 },
  { id: 'stockLink',    label: 'Stock Link',      minWidth: 100 },
  { id: 'photoRequired',label: 'Photo Required',  minWidth: 120 },
  { id: 'dualCheck',    label: 'Dual Check',      minWidth: 110 },
  { id: 'verificationRequired', label: 'Verification Req.', minWidth: 140 },
  { id: 'carryForward', label: 'Carry Forward',   minWidth: 120 },
  { id: 'levelIds',     label: 'Level',           minWidth: 120 },
  { id: 'assignTo',     label: 'Assign To',       minWidth: 130 },
  { 
    id: 'status',       
    label: 'Status',   
    minWidth: 120,
    render: (row) => {
      const statusText = row.status || 'Active';
      const map = {
        'Active':      { bg: '#E8F5E9', text: '#2E7D32' },
        'In Active':   { bg: '#EEEEEE', text: '#616161' },
        'Pending':     { bg: '#FFEBEE', text: '#C62828' },
        'Not Assigned':{ bg: '#FFEBEE', text: '#C62828' },
        'Rejected':    { bg: '#FFEBEE', text: '#C62828' }
      };
      const cfg = map[statusText] || { bg: '#FFEBEE', text: '#C62828' };
      return (
        <Chip 
          label={statusText} 
          size="small" 
          sx={{ 
            minWidth: 140, 
            maxWidth: 140, 
            height: 26, 
            fontSize: '0.75rem', 
            fontWeight: 700, 
            justifyContent: 'center', 
            bgcolor: cfg.bg,
            color: cfg.text,
            border: 'none',
            borderRadius: '4px',
            '& .MuiChip-label': { px: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } 
          }}
        />
      );
    }
  },
  { 
    id: 'taskStatus',   
    label: 'Task Status',     
    minWidth: 120,
    render: (row) => {
      const statusText = row._displayTaskStatus || 'UN ASSIGNED';
      const map = {
        'ASSIGNED':    { bg: '#E8F5E9', text: '#2E7D32' },
        'UN ASSIGNED':  { bg: '#FFEBEE', text: '#C62828' },
        'Completed':   { bg: '#E8F5E9', text: '#2E7D32' },
        'Pending':     { bg: '#FFEBEE', text: '#C62828' },
        'In Progress': { bg: '#E3F2FD', text: '#1565C0' },
        'Missed':      { bg: '#FFEBEE', text: '#C62828' }
      };
      const cfg = map[statusText] || { bg: '#F5F5F5', text: '#424242' };
      return (
        <Chip 
          label={statusText} 
          size="small" 
          sx={{ 
            minWidth: 140, 
            maxWidth: 140, 
            height: 26, 
            fontSize: '0.75rem', 
            fontWeight: 700, 
            justifyContent: 'center', 
            bgcolor: cfg.bg,
            color: cfg.text,
            border: 'none',
            borderRadius: '4px',
            textTransform: 'uppercase',
            '& .MuiChip-label': { px: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } 
          }}
        />
      );
    }
  },
  { 
    id: 'verifyStatus', 
    label: 'Verify Status',   
    minWidth: 160,
    render: (row) => {
      const statusText = row.verifyStatus || 'Pending for Verify';
      const map = {
        'Verified': { bg: '#E8F5E9', text: '#2E7D32', icon: <IconCheck size={14} style={{ color: '#2E7D32' }} /> },
        'Rejected': { bg: '#FFEBEE', text: '#C62828', icon: <IconBan size={14} style={{ color: '#C62828' }} /> },
        'Pending for Verify': { bg: '#FFF3E0', text: '#E65100', icon: null }
      };
      const cfg = map[statusText] || { bg: '#F5F5F5', text: '#424242', icon: null };
      return (
        <Chip 
          label={statusText} 
          size="small" 
          icon={cfg.icon} 
          sx={{ 
            minWidth: 160, 
            maxWidth: 160, 
            height: 26, 
            fontSize: '0.75rem', 
            fontWeight: 700, 
            justifyContent: 'center', 
            bgcolor: cfg.bg,
            color: cfg.text,
            border: 'none',
            borderRadius: '4px',
            '& .MuiChip-label': { px: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } 
          }}
        />
      );
    }
  },
  { id: 'verifiedBy',   label: 'Verified By',     minWidth: 120 },
  { id: 'verifiedDate', label: 'Verified Date',   minWidth: 120 },
  { id: 'createdUser',  label: 'CREATED USER',    minWidth: 120 },
  { id: 'createdDate',  label: 'CREATED DATE',    minWidth: 140 },
  { id: 'updatedUser',  label: 'UPDATED USER',    minWidth: 120 },
  { id: 'updatedDate',  label: 'UPDATED DATE',    minWidth: 160 },
];

// ── Export columns ──────────────────────────────────────────────────────────────
const exportColumns = [
  { header: 'Seq No',              key: 'seqNo' },
  { header: 'Category',           key: 'category' },
  { header: 'Checking Point',     key: 'checkingPoint' },
  { header: 'Descriptions/SOP',   key: 'description' },
  { header: 'Department',         key: (r) => (r.departments || []).map(d => d.departmentName).join(', ') },
  { header: 'Effective From',     key: (r) => formatDate(r.effectiveFrom) },
  { header: 'Frequency',          key: 'frequency' },
  { header: 'Expiry Date',        key: (r) => formatDate(r.expiryDate) },
  { header: 'Reminder Days',      key: 'reminderDays' },
  { header: 'Reminder Date',      key: (r) => formatDate(r.reminderDate) },
  { header: 'Stock Link',         key: 'stockLink' },
  { header: 'Photo Required',     key: 'photoRequired' },
  { header: 'Dual Check',         key: 'dualCheck' },
  { header: 'Verification Req.',  key: 'verificationRequired' },
  { header: 'Carry Forward',      key: 'carryForward' },
  { header: 'Level',              key: 'levelIds' },
  { header: 'Assign To',          key: 'assignTo' },
  { header: 'Status',             key: 'status' },
  { header: 'Task Status',        key: 'taskStatus' },
  { header: 'Verify Status',      key: 'verifyStatus' },
  { header: 'Verified By',        key: 'verifiedBy' },
  { header: 'Verified Date',      key: (r) => formatDate(r.verifiedDate) },
  { header: 'CREATED USER',       key: 'createdUser' },
  { header: 'CREATED DATE',       key: (r) => formatDateTime(r.createdAt) },
  { header: 'UPDATED USER',       key: 'updatedUser' },
  { header: 'UPDATED DATE',       key: (r) => formatDateTime(r.updatedAt) },
];

// ── Static filter options (department options are loaded dynamically) ────────────
const STATIC_FILTER_OPTIONS = {
  category:    [{ value: 'All', label: 'All' }, { value: 'RENEWAL', label: 'RENEWAL' }, { value: 'CHECK LIST', label: 'CHECK LIST' }],
  verifyStatus:[{ value: 'All', label: 'All' }, { value: 'Pending for Verify', label: 'Pending for Verify' }, { value: 'Verified', label: 'Verified' }, { value: 'Rejected', label: 'Rejected' }],
  recordStatus:[{ value: 'All', label: 'All' }, { value: 'Active', label: 'Active' }, { value: 'In Active', label: 'In Active' }],
  taskStatus:  [{ value: 'All', label: 'All' }, { value: 'Pending', label: 'Pending' }, { value: 'In Progress', label: 'In Progress' }, { value: 'Completed', label: 'Completed' }, { value: 'Missed', label: 'Missed' }],
  frequency:   [{ value: 'All', label: 'All' }, { value: 'DAILY', label: 'DAILY' }, { value: 'WEEKLY', label: 'WEEKLY' }, { value: 'FORTNIGHTLY', label: 'FORTNIGHTLY' }, { value: 'MONTHLY', label: 'MONTHLY' }, { value: 'QUARTERLY', label: 'QUARTERLY' }, { value: 'HALF YEARLY', label: 'HALF YEARLY' }, { value: 'YEARLY', label: 'YEARLY' }],
  stockLink:   [{ value: 'All', label: 'All' }, { value: 'YES', label: 'YES' }, { value: 'NO', label: 'NO' }],
  photoRequired:[{ value: 'All', label: 'All' }, { value: 'YES', label: 'YES' }, { value: 'NO', label: 'NO' }],
};

const DEFAULT_FILTERS = {
  department: 'All', category: 'All', verifyStatus: 'All', recordStatus: 'All',
  taskStatus: 'All', frequency: 'All', stockLink: 'All', photoRequired: 'All',
};

// Build the filter config from department options (called inside component)
const buildFilterConfig = (departmentOptions) => [
  { id: 'department',   label: 'Department',    type: 'select', isStarred: true, defaultValue: 'All', options: [
    { value: 'All', label: 'All' }, ...departmentOptions
  ]},
  { id: 'category',    label: 'Category',      type: 'select', isStarred: true, defaultValue: 'All', options: STATIC_FILTER_OPTIONS.category },
  { id: 'verifyStatus', label: 'Verify Status', type: 'select', isStarred: true, defaultValue: 'All', options: STATIC_FILTER_OPTIONS.verifyStatus },
  { id: 'recordStatus', label: 'Record Status', type: 'select', isStarred: true, defaultValue: 'All', options: STATIC_FILTER_OPTIONS.recordStatus },
  { id: 'taskStatus',  label: 'Task Status',   type: 'select', isStarred: true, defaultValue: 'All', options: STATIC_FILTER_OPTIONS.taskStatus },
  { id: 'frequency',   label: 'Frequency',     type: 'select', isStarred: false, defaultValue: 'All', options: STATIC_FILTER_OPTIONS.frequency },
  { id: 'stockLink',   label: 'Stock Link',    type: 'select', isStarred: false, defaultValue: 'All', options: STATIC_FILTER_OPTIONS.stockLink },
  { id: 'photoRequired', label: 'Photo Required', type: 'select', isStarred: false, defaultValue: 'All', options: STATIC_FILTER_OPTIONS.photoRequired },
];

// ==============================|| MASTER CHECKLIST (BOS SOP COMPLIANT) ||============================== //

export default function MasterCheckList() {
  const dispatch   = useDispatch();
  const { user }   = useAuth();
  const perms      = usePagePermissions(PAGE_CODES.QMS_CHECKLIST);
  const searchQuery = useSelector((state) => state.search.query);
  const globalFilters = useSelector((state) => state.search.filters) || {};

  const [dialogOpen,       setDialogOpen]       = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [isAmendment,      setIsAmendment]      = useState(false);
  const [rows,             setRows]             = useState([]);
  const [totalElements,    setTotalElements]    = useState(0);
  const [page,             setPage]             = useState(0);
  const [size,             setSize]             = useState(10);
  const [loading,          setLoading]          = useState(false);
  const [selectedRow,      setSelectedRow]      = useState(null);
  const [filters,          setFilters]          = useState({ ...DEFAULT_FILTERS });
  const [departmentOptions, setDepartmentOptions] = useState([]);

  // Column picker states & toggles
  const [anchorEl, setAnchorEl] = useState(null);
  const [visibleColumnIds, setVisibleColumnIds] = useState(() => columns.map(c => c.id));

  const handlePopoverOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handlePopoverClose = () => {
    setAnchorEl(null);
  };
  const handleToggleColumn = (colId) => {
    setVisibleColumnIds((prev) => {
      if (prev.includes(colId)) {
        if (colId === 'index' || colId === 'seqNo' || colId === 'checkingPoint') {
          return prev;
        }
        return prev.filter((id) => id !== colId);
      } else {
        return [...prev, colId];
      }
    });
  };
  const handleSelectAllColumns = () => {
    setVisibleColumnIds(columns.map(c => c.id));
  };

  // Fetch active departments for the filter dropdown
  useEffect(() => {
    axios.get('/api/master/hr/departments/active')
      .then((res) => {
        const opts = (Array.isArray(res.data) ? res.data : (res.data?.content || []))
          .map((d) => ({ value: d.departmentName, label: d.departmentName }))
          .sort((a, b) => a.label.localeCompare(b.label));
        setDepartmentOptions(opts);
      })
      .catch(() => setDepartmentOptions([]));
  }, []);

  // Register global filter bar config (rebuilds when department options change)
  useEffect(() => {
    dispatch(setFilterConfig(buildFilterConfig(departmentOptions)));
    return () => dispatch(setFilterConfig(null));
  }, [dispatch, departmentOptions]);

  // Sync global search bar filters → local filters
  useEffect(() => {
    if (Object.keys(globalFilters).length > 0) {
      setFilters((prev) => {
        const next = { ...prev };
        let changed = false;
        Object.keys(DEFAULT_FILTERS).forEach((key) => {
          if (globalFilters[key] !== undefined && globalFilters[key] !== prev[key]) {
            next[key] = globalFilters[key];
            changed = true;
          }
        });
        return changed ? next : prev;
      });
      setPage(0);
    }
  }, [globalFilters]);

  // ── Fetch ────────────────────────────────────────────────────────────────────
  const fetchChecklists = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page, size,
        department:   filters.department   !== 'All' ? filters.department   : undefined,
        category:     filters.category     !== 'All' ? filters.category     : undefined,
        verifyStatus: filters.verifyStatus  !== 'All' ? filters.verifyStatus  : undefined,
        status:       filters.recordStatus  !== 'All' ? filters.recordStatus  : undefined,
        taskStatus:   filters.taskStatus    !== 'All' ? filters.taskStatus    : undefined,
        frequency:    filters.frequency     !== 'All' ? filters.frequency     : undefined,
        stockLink:    filters.stockLink     !== 'All' ? filters.stockLink     : undefined,
        photoRequired:filters.photoRequired !== 'All' ? filters.photoRequired : undefined,
        searchValue:  searchQuery || undefined,
      };
      const res = await axios.get('/api/qms/checklist', { params });
      setRows(res.data.content || []);
      setTotalElements(res.data.totalElements || 0);
    } catch (err) {
      console.error('Failed to fetch checklists:', err);
    } finally {
      setLoading(false);
    }
  }, [page, size, filters, searchQuery]);

  useEffect(() => { fetchChecklists(); }, [fetchChecklists]);

  // ── Resolved rows — flatten computed display fields ───────────────────────────
  const resolvedRows = useMemo(() => rows.map((row) => {
    // Check expiry
    let expiryExpired = false;
    if (row.expiryDate) {
      const exp = new Date(row.expiryDate);
      if (!isNaN(exp.getTime())) {
        exp.setHours(23, 59, 59, 999);
        expiryExpired = exp < new Date();
      }
    }
    
    // Determine ASSIGNED / UN ASSIGNED based on assignTo field
    const isAssigned = row.assignTo && row.assignTo !== '-' && row.assignTo.trim() !== '';
    const displayTaskStatus = isAssigned ? 'ASSIGNED' : 'UN ASSIGNED';

    return {
      ...row,
      department:    (row.departments || []).map(d => d.departmentName).join(', '),
      effectiveFrom: formatDate(row.effectiveFrom),
      expiryDate:    formatDate(row.expiryDate),
      _expiryExpired: expiryExpired,
      _displayTaskStatus: displayTaskStatus,
      reminderDate:  formatDate(row.reminderDate),
      verifiedDate:  formatDate(row.verifiedDate),
      createdUser:   row.createdUser || row.createdBy || '-',
      createdDate:   formatDateTime(row.createdAt),
      updatedUser:   row.updatedUser || row.updatedBy || '-',
      updatedDate:   formatDateTime(row.updatedAt),
      status:        row.status || 'Active',
    };
  }), [rows]);

  // ── Save / Edit ───────────────────────────────────────────────────────────────
  const handleSave = async (data) => {
    try {
      const { department, ...rawBody } = data;
      const departments = department || [];
      const body = Object.fromEntries(
        Object.entries(rawBody).filter(([, v]) => v !== undefined && v !== null && v === v)
      );
      delete body.createdUser;
      delete body.updatedUser;
      const qs = new URLSearchParams();
      departments.forEach((d) => qs.append('departments', d));
      await axios.post(`/api/qms/checklist?${qs.toString()}`, body);
      dispatch(openSnackbar({ open: true, message: 'Checklist saved successfully!', variant: 'alert', severity: 'success' }));
      fetchChecklists();
      setDialogOpen(false);
    } catch (err) {
      console.error('Failed to save checklist:', err);
      dispatch(openSnackbar({ open: true, message: err?.response?.data?.message || err?.message || 'Failed to save checklist.', variant: 'alert', severity: 'error' }));
    }
  };

  // ── Action handlers ───────────────────────────────────────────────────────────
  const handleOpenAdd = () => {
    setSelectedRow(null);
    setIsAmendment(false);
    setDialogOpen(true);
  };

  const handleOpenEdit = (row) => {
    // Find original (non-flattened) row
    const original = rows.find((r) => r.id === row.id) || row;
    setSelectedRow(original);
    setIsAmendment(false);
    setDialogOpen(true);
  };

  const handleAmendment = (row) => {
    if (row?.verifyStatus !== 'Verified') {
      dispatch(openSnackbar({ open: true, message: 'Only verified checklists can be amended!', variant: 'alert', severity: 'warning' }));
      return;
    }
    const original = rows.find((r) => r.id === row.id) || row;
    setSelectedRow(original);
    setIsAmendment(true);
    setDialogOpen(true);
  };

  const handleAssign = (row) => {
    if (row?.verifyStatus !== 'Verified') {
      dispatch(openSnackbar({ open: true, message: 'Only verified checklists can be assigned!', variant: 'alert', severity: 'warning' }));
      return;
    }
    const original = rows.find((r) => r.id === row.id) || row;
    setSelectedRow(original);
    setAssignDialogOpen(true);
  };

  // ── Keyboard shortcuts ────────────────────────────────────────────────────────
  useKeyboardShortcuts({
    'ctrl+n': handleOpenAdd,
    'escape': () => { if (dialogOpen) setDialogOpen(false); }
  });

  // ── Make Checking Point a clickable blue link that opens the edit dialog ─────
  const tableColumns = useMemo(() => columns
    .filter((col) => visibleColumnIds.includes(col.id))
    .map((col) => (
      col.id === 'checkingPoint'
        ? {
            ...col,
            render: (row) => {
              const text = row.checkingPoint;
              if (!text) return '-';
              return (
                <Box
                  component="span"
                  onClick={(e) => { e.stopPropagation(); handleOpenEdit(row); }}
                  sx={{
                    color: 'primary.main',
                    textDecoration: 'underline',
                    cursor: 'pointer',
                    fontWeight: 500,
                    '&:hover': { color: 'primary.dark' }
                  }}
                >
                  {text}
                </Box>
              );
            }
          }
        : col
    )), [visibleColumnIds, rows]);

  // ── Custom action column (Amendment + Assign) ─────────────────────────────────
  const actionColumn = {
    label: 'Actions',
    render: (row) => {
      const isVerified = row?.verifyStatus === 'Verified';
      return (
        <Stack direction="row" spacing={0.5}>
          <Tooltip title={isVerified ? 'Amendment' : 'Checklist must be verified first'}>
            <span>
              <IconButton 
                size="small" 
                disabled={!isVerified}
                onClick={(e) => { e.stopPropagation(); handleAmendment(row); }} 
                sx={{
                  color: isVerified ? 'warning.main' : 'text.disabled',
                  bgcolor: isVerified ? '#fff3e0' : 'action.disabledBackground',
                  transition: 'all 0.2s',
                  '&:hover': isVerified ? { bgcolor: 'warning.main', color: '#fff', transform: 'scale(1.05)' } : {},
                  '&.Mui-disabled': { opacity: 0.45 }
                }}
              >
                <IconFileDots size={16} />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title={isVerified ? 'Assign To' : 'Checklist must be verified first'}>
            <span>
              <IconButton 
                size="small" 
                disabled={!isVerified}
                onClick={(e) => { e.stopPropagation(); handleAssign(row); }} 
                sx={{
                  color: isVerified ? 'info.main' : 'text.disabled',
                  bgcolor: isVerified ? '#e0f7fa' : 'action.disabledBackground',
                  transition: 'all 0.2s',
                  '&:hover': isVerified ? { bgcolor: 'info.main', color: '#fff', transform: 'scale(1.05)' } : {},
                  '&.Mui-disabled': { opacity: 0.45 }
                }}
              >
                <IconUserPlus size={16} />
              </IconButton>
            </span>
          </Tooltip>
        </Stack>
      );
    }
  };

  return (
    <MainCard
      contentSX={{ p: 0 }}
      sx={{
        mx: { xs: -2, sm: -3 },
        width: { xs: 'calc(100% + 32px)', sm: 'calc(100% + 48px)' },
        borderRadius: 0
      }}
      title={
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <IconClipboardList size={24} />
          <Typography variant="h3">Master Check List</Typography>
        </Stack>
      }
      secondary={
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Tooltip title="Refresh">
            <IconButton
              onClick={fetchChecklists}
              color="primary"
              size="small"
              sx={{
                border: '2px solid', borderColor: 'divider', borderRadius: '8px', p: 1,
                transition: 'all 0.2s', '&:hover': { bgcolor: 'primary.light', transform: 'scale(1.05)' }
              }}
            >
              <IconRefresh size={20} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Column Visibility">
            <IconButton
              onClick={handlePopoverOpen}
              color="primary"
              size="small"
              sx={{
                border: '2px solid', borderColor: 'divider', borderRadius: '8px', p: 1,
                transition: 'all 0.2s', '&:hover': { bgcolor: 'primary.light', transform: 'scale(1.05)' }
              }}
            >
              <IconAdjustmentsHorizontal size={20} />
            </IconButton>
          </Tooltip>

          {perms.export && (
            <BOSExportButton
              data={resolvedRows}
              filename="Master_Check_List"
              columns={exportColumns}
            />
          )}

          <Tooltip title={
            !selectedRow
              ? 'Select a row first'
              : selectedRow.verifyStatus !== 'Verified'
              ? 'Checklist must be verified before amendment'
              : `Amendment: ${selectedRow.seqNo || selectedRow.id}`
          }>
            <span>
              <Button
                variant="outlined"
                color="warning"
                size="medium"
                disabled={!selectedRow || selectedRow.verifyStatus !== 'Verified'}
                startIcon={<IconFileDots size={18} />}
                onClick={() => selectedRow && handleAmendment(selectedRow)}
                sx={{
                  borderRadius: '8px',
                  fontWeight: 600,
                  textTransform: 'none',
                  transition: 'all 0.2s',
                  '&:hover': { transform: 'scale(1.03)' }
                }}
              >
                Amendment
              </Button>
            </span>
          </Tooltip>

          <Tooltip title={
            !selectedRow
              ? 'Select a row first'
              : selectedRow.verifyStatus !== 'Verified'
              ? 'Checklist must be verified before assigning'
              : `Assign: ${selectedRow.seqNo || selectedRow.id}`
          }>
            <span>
              <Button
                variant="outlined"
                color="info"
                size="medium"
                disabled={!selectedRow || selectedRow.verifyStatus !== 'Verified'}
                startIcon={<IconUserPlus size={18} />}
                onClick={() => selectedRow && handleAssign(selectedRow)}
                sx={{
                  borderRadius: '8px',
                  fontWeight: 600,
                  textTransform: 'none',
                  transition: 'all 0.2s',
                  '&:hover': { transform: 'scale(1.03)' }
                }}
              >
                Assign
              </Button>
            </span>
          </Tooltip>

          {perms.write && (
            <Tooltip title={shortcutTooltip('Add New Checklist', 'Ctrl + N')}>
              <Button variant="contained" color="primary" size="medium" onClick={handleOpenAdd} sx={btnNew}>
                + New
              </Button>
            </Tooltip>
          )}
        </Stack>
      }
    >
      <BOSDataTable
        columns={tableColumns}
        rows={resolvedRows}
        page={page}
        size={size}
        totalCount={totalElements}
        loading={loading}
        onPageChange={(p) => setPage(p)}
        onSizeChange={(s) => { setSize(s); setPage(0); }}
        onDoubleClickRow={handleOpenEdit}
        onClickRow={(row) => {
          const original = rows.find((r) => r.id === row.id) || row;
          setSelectedRow((prev) => prev?.id === original.id ? null : original);
        }}
        selectedRowId={selectedRow?.id}
        actionColumn={actionColumn}
      />

      <AddCheckListDialog
        open={dialogOpen}
        handleClose={() => setDialogOpen(false)}
        onSave={handleSave}
        initialData={selectedRow}
        isAmendment={isAmendment}
      />

      <ChecklistAssignDialog
        open={assignDialogOpen}
        onClose={() => { setAssignDialogOpen(false); fetchChecklists(); }}
        checklistId={selectedRow?.id}
        initialData={selectedRow}
      />

      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handlePopoverClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: {
            p: 2,
            width: 280,
            maxHeight: 450,
            boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.12)',
            borderRadius: '12px',
            border: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            flexDirection: 'column',
          }
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ pb: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Toggle Columns</Typography>
          <Button size="small" onClick={handleSelectAllColumns} sx={{ textTransform: 'none', fontWeight: 600 }}>
            Show All
          </Button>
        </Stack>

        <Box sx={{ overflowY: 'auto', flex: 1, py: 1, my: 1, pr: 0.5, '&::-webkit-scrollbar': { width: '6px' }, '&::-webkit-scrollbar-thumb': { bgcolor: 'divider', borderRadius: '4px' } }}>
          <Stack spacing={0.5}>
            {columns.map((col) => {
              const isRequired = col.id === 'index' || col.id === 'seqNo' || col.id === 'checkingPoint';
              return (
                <Box
                  key={col.id}
                  onClick={() => !isRequired && handleToggleColumn(col.id)}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    py: 0.5,
                    px: 1,
                    borderRadius: '6px',
                    cursor: isRequired ? 'default' : 'pointer',
                    bgcolor: isRequired ? 'grey.50' : 'transparent',
                    opacity: isRequired ? 0.7 : 1,
                    '&:hover': {
                      bgcolor: isRequired ? 'grey.50' : 'grey.100',
                    }
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: isRequired ? 600 : 400 }}>
                    {col.label}
                  </Typography>
                  <Checkbox
                    size="small"
                    checked={visibleColumnIds.includes(col.id)}
                    disabled={isRequired}
                    onClick={(e) => e.stopPropagation()}
                    onChange={() => handleToggleColumn(col.id)}
                    sx={{ p: 0.5 }}
                  />
                </Box>
              );
            })}
          </Stack>
        </Box>
      </Popover>
    </MainCard>
  );
}
