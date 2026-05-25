import { useState, useEffect, useCallback, useMemo } from 'react';
import { Typography, Button, Stack, Tooltip, IconButton, Chip, Box } from '@mui/material';
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
  { id: 'expiryDate',   label: 'Expiry Date',     minWidth: 120 },
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
    label: 'Record Status',   
    minWidth: 120,
    render: (row) => {
      const statusText = row.status || 'Active';
      const isActive = statusText === 'Active';
      return (
        <Chip 
          label={statusText} 
          size="small" 
          color={isActive ? 'success' : 'error'} 
          variant="outlined" 
          sx={{ fontWeight: 700 }}
        />
      );
    }
  },
  { 
    id: 'taskStatus',   
    label: 'Task Status',     
    minWidth: 120,
    render: (row) => {
      const statusText = row.taskStatus || 'Pending';
      const map = {
        'Completed': { color: 'success' },
        'Pending': { color: 'warning' },
        'In Progress': { color: 'info' },
        'Missed': { color: 'error' }
      };
      const cfg = map[statusText] || { color: 'default' };
      return (
        <Chip 
          label={statusText} 
          size="small" 
          color={cfg.color} 
          variant="outlined" 
          sx={{ fontWeight: 700 }}
        />
      );
    }
  },
  { 
    id: 'verifyStatus', 
    label: 'Verify Status',   
    minWidth: 140,
    render: (row) => {
      const statusText = row.verifyStatus || 'Pending for Verify';
      const map = {
        'Verified': { color: 'success', icon: <IconCheck size={14} /> },
        'Rejected': { color: 'error', icon: <IconBan size={14} /> },
        'Pending for Verify': { color: 'warning', icon: null }
      };
      const cfg = map[statusText] || { color: 'default', icon: null };
      return (
        <Chip 
          label={statusText} 
          size="small" 
          color={cfg.color} 
          icon={cfg.icon} 
          variant="outlined" 
          sx={{ fontWeight: 700 }}
        />
      );
    }
  },
  { id: 'verifiedBy',   label: 'Verified By',     minWidth: 120 },
  { id: 'verifiedDate', label: 'Verified Date',   minWidth: 120 },
  { id: 'createdBy',    label: 'Created By',      minWidth: 120 },
  { id: 'createdDate',  label: 'Created Date',    minWidth: 140 },
  { id: 'updatedBy',    label: 'Updated By',      minWidth: 120 },
  { id: 'updatedDate',  label: 'Updated Date',    minWidth: 140 },
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
  { header: 'Record Status',      key: 'status' },
  { header: 'Task Status',        key: 'taskStatus' },
  { header: 'Verify Status',      key: 'verifyStatus' },
  { header: 'Verified By',        key: 'verifiedBy' },
  { header: 'Verified Date',      key: (r) => formatDate(r.verifiedDate) },
  { header: 'Created By',         key: 'createdBy' },
  { header: 'Created Date',       key: (r) => formatDate(r.createdAt) },
  { header: 'Updated By',         key: 'updatedBy' },
  { header: 'Updated Date',       key: (r) => formatDate(r.updatedAt) },
];

// ── Filter config for the global search bar ─────────────────────────────────────
const filterConfig = [
  { id: 'category',    label: 'Category',      type: 'select', isStarred: true, defaultValue: 'All', options: [
    { value: 'All', label: 'All' }, { value: 'RENEWAL', label: 'RENEWAL' }, { value: 'CHECK LIST', label: 'CHECK LIST' }
  ]},
  { id: 'verifyStatus', label: 'Verify Status', type: 'select', isStarred: true, defaultValue: 'All', options: [
    { value: 'All', label: 'All' }, { value: 'Pending for Verify', label: 'Pending for Verify' },
    { value: 'Verified', label: 'Verified' }, { value: 'Rejected', label: 'Rejected' }
  ]},
  { id: 'recordStatus', label: 'Record Status', type: 'select', isStarred: true, defaultValue: 'All', options: [
    { value: 'All', label: 'All' }, { value: 'Active', label: 'Active' }, { value: 'In Active', label: 'In Active' }
  ]},
  { id: 'taskStatus',  label: 'Task Status',   type: 'select', isStarred: true, defaultValue: 'All', options: [
    { value: 'All', label: 'All' }, { value: 'Pending', label: 'Pending' }, { value: 'In Progress', label: 'In Progress' },
    { value: 'Completed', label: 'Completed' }, { value: 'Missed', label: 'Missed' }
  ]},
  { id: 'frequency',   label: 'Frequency',     type: 'select', isStarred: false, defaultValue: 'All', options: [
    { value: 'All', label: 'All' }, { value: 'DAILY', label: 'DAILY' }, { value: 'WEEKLY', label: 'WEEKLY' },
    { value: 'FORTNIGHTLY', label: 'FORTNIGHTLY' }, { value: 'MONTHLY', label: 'MONTHLY' },
    { value: 'QUARTERLY', label: 'QUARTERLY' }, { value: 'HALF YEARLY', label: 'HALF YEARLY' }, { value: 'YEARLY', label: 'YEARLY' }
  ]},
  { id: 'stockLink',   label: 'Stock Link',    type: 'select', isStarred: false, defaultValue: 'All', options: [
    { value: 'All', label: 'All' }, { value: 'YES', label: 'YES' }, { value: 'NO', label: 'NO' }
  ]},
  { id: 'photoRequired', label: 'Photo Required', type: 'select', isStarred: false, defaultValue: 'All', options: [
    { value: 'All', label: 'All' }, { value: 'YES', label: 'YES' }, { value: 'NO', label: 'NO' }
  ]},
];

const DEFAULT_FILTERS = {
  category: 'All', verifyStatus: 'All', recordStatus: 'All',
  taskStatus: 'All', frequency: 'All', stockLink: 'All', photoRequired: 'All',
};

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

  // Register global filter bar config
  useEffect(() => {
    dispatch(setFilterConfig(filterConfig));
    return () => dispatch(setFilterConfig(null));
  }, [dispatch]);

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
  const resolvedRows = useMemo(() => rows.map((row) => ({
    ...row,
    department:   (row.departments || []).map(d => d.departmentName).join(', '),
    effectiveFrom: formatDate(row.effectiveFrom),
    expiryDate:    formatDate(row.expiryDate),
    reminderDate:  formatDate(row.reminderDate),
    verifiedDate:  formatDate(row.verifiedDate),
    createdDate:   formatDate(row.createdAt),
    updatedDate:   formatDate(row.updatedAt),
    status:        row.status || 'Active',
  })), [rows]);

  // ── Save / Edit ───────────────────────────────────────────────────────────────
  const handleSave = async (data) => {
    try {
      const { department, ...rawBody } = data;
      const departments = department || [];
      const body = Object.fromEntries(
        Object.entries(rawBody).filter(([, v]) => v !== undefined && v !== null && v === v)
      );
      body.updatedBy = user?.name || user?.id || 'Admin';
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
  const tableColumns = useMemo(() => columns.map((col) => (
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
  )), [rows]);

  // ── Custom action column (Amendment + Assign) ─────────────────────────────────
  const actionColumn = {
    label: 'Actions',
    render: (row) => (
      <Stack direction="row" spacing={0.5}>
        <Tooltip title="Amendment">
          <IconButton 
            size="small" 
            onClick={(e) => { e.stopPropagation(); handleAmendment(row); }} 
            sx={{
              color: 'warning.main',
              bgcolor: '#fff3e0',
              transition: 'all 0.2s',
              '&:hover': { bgcolor: 'warning.main', color: '#fff', transform: 'scale(1.05)' }
            }}
          >
            <IconFileDots size={16} />
          </IconButton>
        </Tooltip>
        <Tooltip title="Assign To">
          <IconButton 
            size="small" 
            onClick={(e) => { e.stopPropagation(); handleAssign(row); }} 
            sx={{
              color: 'info.main',
              bgcolor: '#e0f7fa',
              transition: 'all 0.2s',
              '&:hover': { bgcolor: 'info.main', color: '#fff', transform: 'scale(1.05)' }
            }}
          >
            <IconUserPlus size={16} />
          </IconButton>
        </Tooltip>
      </Stack>
    )
  };

  return (
    <MainCard
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

          {perms.export && (
            <BOSExportButton
              data={resolvedRows}
              filename="Master_Check_List"
              columns={exportColumns}
            />
          )}

          <Tooltip title={selectedRow ? `Amendment: ${selectedRow.seqNo || selectedRow.id}` : 'Select a row first'}>
            <span>
              <Button
                variant="outlined"
                color="warning"
                size="medium"
                disabled={!selectedRow}
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

          <Tooltip title={selectedRow ? `Assign: ${selectedRow.seqNo || selectedRow.id}` : 'Select a row first'}>
            <span>
              <Button
                variant="outlined"
                color="info"
                size="medium"
                disabled={!selectedRow}
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
    </MainCard>
  );
}
