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
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Drawer from '@mui/material/Drawer';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import Collapse from '@mui/material/Collapse';
import TablePagination from '@mui/material/TablePagination';
import { useTheme } from '@mui/material/styles';
import axios from 'utils/axios';

import { useDispatch, useSelector } from 'react-redux';
import { setFilters, resetFilters } from 'store/slices/search';
import { openSnackbar } from 'store/slices/snackbar';
import useSearchFilter from 'hooks/useSearchFilter';

import MainCard from 'ui-component/cards/MainCard';
import AddCheckListDialog from './AddCheckListDialog';

import {
  IconPlus,
  IconSearch,
  IconEdit,
  IconTrash,
  IconAdjustmentsHorizontal,
  IconX,
  IconCheck,
  IconArrowBackUp,
  IconUserPlus,
  IconFileDots,
  IconChevronDown,
  IconChevronUp
} from '@tabler/icons-react';

const columns = [
  '#',
  'Seq No',
  'Checking Point',
  'Category',
  'Frequency',
  'Department',
  'Effective from',
  'Days',
  'Expire Date',
  'Reminder Date',
  'Stock Link',
  'Assign To',
  'Assign Date',
  'Item Code',
  'Qty',
  'Photo Required',
  'Created Date',
  'Created By',
  'Modified By',
  'Status',
  'Task Status',
  'Verify Status',
  'Verified By',
  'Verified Date',
  'Rej Reason'
];

const DEPARTMENTS = [
  'ACCOUNTS',
  'ADMIN',
  'ASSEMBLY',
  'BUSINESS DEVELOPMENT',
  'DESIGN & DEVELOPMENT',
  'HRA',
  'LOGISTICS',
  'MAINTENANCE',
  'MANAGEMENT',
  'MANAGEMENT REPRESENTATIVE',
  'OPERATIONS',
  'PLANNING',
  'PRODUCT DEVELOPMENT',
  'PRODUCTION',
  'PURCHASE',
  'QMS',
  'QUALITY',
  'SALES & MARKETING',
  'STORES',
  'STRATEGIC PROCUREMENT',
  'TOP MANAGEMENT'
];

const DEFAULT_FILTERS = {
  status: 'All',
  taskStatus: 'All',
  recordStatus: 'All',
  category: 'All',
  departments: [],
  employeeName: '',
  leftCompany: 'All'
};

// Collapsible filter section
function FilterSection({ title, open, onToggle, children }) {
  return (
    <Box sx={{ mb: 0.5 }}>
      <Box
        onClick={onToggle}
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'pointer',
          py: 1,
          px: 2,
          '&:hover': { bgcolor: 'action.hover' },
          borderRadius: 1
        }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
          {title}
        </Typography>
        {open ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
      </Box>
      <Collapse in={open}>
        <Box sx={{ px: 2, pb: 1 }}>{children}</Box>
      </Collapse>
    </Box>
  );
}

export default function MasterCheckList() {
  const theme = useTheme();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [rows, setRows] = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [loading, setLoading] = useState(false);

  const [selectedRowId, setSelectedRowId] = useState(null);
  const dispatch = useDispatch();
  const searchQuery = useSelector((state) => state.search.query);
  const filters = useSelector((state) => state.search.filters);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Register filters for the top search bar
  useSearchFilter([
    {
      id: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { label: 'All Status', value: 'All' },
        { label: 'Pending for Verify', value: 'Pending for Verify' },
        { label: 'Verified', value: 'Verified' },
        { label: 'Rejected', value: 'Rejected' }
      ]
    },
    {
      id: 'taskStatus',
      label: 'Task Status',
      type: 'select',
      options: [
        { label: 'All', value: 'All' },
        { label: 'Not Assigned', value: 'Not Assigned' },
        { label: 'Assigned', value: 'Assigned' }
      ]
    },
    {
      id: 'recordStatus',
      label: 'Record Status',
      type: 'select',
      options: [
        { label: 'All', value: 'All' },
        { label: 'Active', value: 'Active' },
        { label: 'In Active', value: 'In Active' }
      ]
    },
    {
      id: 'category',
      label: 'Category',
      type: 'select',
      options: [
        { label: 'All', value: 'All' },
        { label: 'Renewal', value: 'RENEWAL' },
        { label: 'Check List', value: 'CHECK LIST' }
      ]
    },
    {
      id: 'departments',
      label: 'Departments',
      type: 'select',
      multiple: true,
      options: DEPARTMENTS.map((d) => ({ label: d, value: d }))
    },
    {
      id: 'employeeName',
      label: 'Employee Name',
      type: 'text',
      placeholder: 'Search employee...'
    },
    {
      id: 'leftCompany',
      label: 'Left Company',
      type: 'select',
      options: [
        { label: 'All', value: 'All' },
        { label: 'No', value: 'No' },
        { label: 'Yes', value: 'Yes' }
      ]
    }
  ]);

  // Section toggles
  const [openSections, setOpenSections] = useState({
    status: true,
    taskStatus: true,
    recordStatus: true,
    category: true,
    department: false,
    employee: false,
    leftCompany: false
  });
  const toggleSection = (key) => setOpenSections((p) => ({ ...p, [key]: !p[key] }));

  const fetchChecklists = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page,
        size,
        category: filters.category !== 'All' ? filters.category : undefined,
        department: (filters.departments || []).length > 0 ? filters.departments[0] : undefined, // Simplification for now
        searchValue: searchQuery || undefined,
        searchBy: undefined
      };
      const response = await axios.get('/api/qms/checklist', { params });
      setRows(response.data.content);
      setTotalElements(response.data.totalElements);
    } catch (error) {
      console.error('Failed to fetch checklists:', error);
      dispatch(
        openSnackbar({
          open: true,
          message: 'Failed to fetch checklists',
          variant: 'alert',
          severity: 'error',
          close: false
        })
      );
    } finally {
      setLoading(false);
    }
  }, [page, size, filters, searchQuery]);

  useEffect(() => {
    fetchChecklists();
  }, [fetchChecklists]);

  const [isView, setIsView] = useState(false);

  const setFilter = (key, val) => {
    dispatch(setFilters({ [key]: val }));
    setPage(0);
  };

  const toggleDept = (dept) => {
    const arr = filters.departments || [];
    const newDepts = arr.includes(dept) ? arr.filter((d) => d !== dept) : [...arr, dept];
    dispatch(setFilters({ departments: newDepts }));
    setPage(0);
  };

  const handleResetFilters = () => {
    dispatch(resetFilters());
    setPage(0);
  };

  const activeCount =
    (filters.status && filters.status !== 'All' ? 1 : 0) +
    (filters.taskStatus && filters.taskStatus !== 'All' ? 1 : 0) +
    (filters.recordStatus && filters.recordStatus !== 'All' ? 1 : 0) +
    (filters.category && filters.category !== 'All' ? 1 : 0) +
    (filters.departments?.length || 0) +
    (filters.employeeName ? 1 : 0) +
    (filters.leftCompany && filters.leftCompany !== 'All' ? 1 : 0);

  const handleSaveData = async (data) => {
    try {
      // Build the payload matching the backend MasterChecklist model fields exactly
      const payload = {
        id: data.id,
        seqNo: data.seqNo,
        checkingPoint: data.checkingPoint,
        description: data.description,
        category: data.category,
        frequency: data.frequency,
        effectiveFrom: data.effectiveFrom || null,
        expiryDate: data.expiryDate || null,
        reminderDays: data.reminderDays ? parseInt(data.reminderDays) : null,
        reminderDate: data.reminderDate || null,
        stockLink: data.stockLink || null,
        photoRequired: data.photoRequired || null,
        itemCode: data.itemCode || null,
        qty: data.qty || null
      };

      // Build URLSearchParams so departments are sent as repeated params: ?departments=A&departments=B
      const params = new URLSearchParams();
      (data.department || []).forEach((d) => params.append('departments', d));

      await axios.post(`/api/qms/checklist?${params.toString()}`, payload);
      dispatch(
        openSnackbar({
          open: true,
          message: data.id ? 'Checklist updated successfully' : 'Checklist created successfully',
          variant: 'alert',
          severity: 'success',
          close: false
        })
      );
      fetchChecklists();
      setDialogOpen(false);
    } catch (error) {
      console.error('Failed to save checklist:', error);
      dispatch(
        openSnackbar({
          open: true,
          message: error.response?.data?.message || error.message || 'Failed to save checklist',
          variant: 'alert',
          severity: 'error',
          close: false
        })
      );
    }
  };
  const handleDelete = async () => {
    if (!selectedRowId) {
      dispatch(
        openSnackbar({
          open: true,
          message: 'Please select a row first!',
          variant: 'alert',
          severity: 'warning',
          close: false
        })
      );
      return;
    }
    if (window.confirm('Are you sure you want to delete this checklist?')) {
      try {
        await axios.delete(`/api/qms/checklist/${selectedRowId}`);
        setSelectedRowId(null);
        fetchChecklists();
        dispatch(
          openSnackbar({
            open: true,
            message: 'Checklist deleted successfully',
            variant: 'alert',
            severity: 'success',
            close: false
          })
        );
      } catch (err) {
        console.error('Failed to delete checklist:', err);
        dispatch(
          openSnackbar({
            open: true,
            message: 'Failed to delete checklist',
            variant: 'alert',
            severity: 'error',
            close: false
          })
        );
      }
    }
  };

  const handleEditClick = () => {
    if (!selectedRowId) {
      dispatch(
        openSnackbar({
          open: true,
          message: 'Please select a row first!',
          variant: 'alert',
          severity: 'warning',
          close: false
        })
      );
      return;
    }
    setIsView(false);
    setDialogOpen(true);
  };

  const handleRowClick = (row) => {
    setSelectedRowId(row.id);
  };

  const handleRowOpen = (row) => {
    setSelectedRowId(row.id);
    setIsView(true);
    setDialogOpen(true);
  };

  const activeRow = rows.find((r) => r.id === selectedRowId) || null;

  return (
    <MainCard
      title="Master Check List"
      secondary={
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Button variant="contained" color="secondary" size="small" startIcon={<IconUserPlus size={18} />}>
            Assign To
          </Button>
          <Button variant="contained" color="secondary" size="small" startIcon={<IconFileDots size={18} />}>
            Amendment
          </Button>
          <Button variant="contained" color="secondary" size="small" startIcon={<IconEdit size={18} />} onClick={handleEditClick}>
            Edit
          </Button>
          <Button variant="contained" color="error" size="small" startIcon={<IconTrash size={18} />} onClick={handleDelete}>
            Delete
          </Button>
          <Button
            variant="contained"
            color="primary"
            size="small"
            startIcon={<IconPlus size={18} />}
            onClick={() => {
              setSelectedRowId(null);
              setIsView(false);
              setDialogOpen(true);
            }}
          >
            New
          </Button>
          <IconButton
            size="small"
            onClick={() => setDrawerOpen(true)}
            sx={{
              border: '1px solid',
              borderColor: activeCount > 0 ? 'primary.main' : 'divider',
              bgcolor: activeCount > 0 ? 'primary.light' : 'transparent',
              borderRadius: 1.5,
              p: 0.8,
              position: 'relative'
            }}
          >
            <IconAdjustmentsHorizontal size={20} />
            {activeCount > 0 && (
              <Box
                sx={{
                  position: 'absolute',
                  top: -4,
                  right: -4,
                  width: 18,
                  height: 18,
                  borderRadius: '50%',
                  bgcolor: 'error.main',
                  color: '#fff',
                  fontSize: 11,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700
                }}
              >
                {activeCount}
              </Box>
            )}
          </IconButton>
        </Box>
      }
    >
      <Box sx={{ p: 0.5, pb: 0 }}>
        {activeCount > 0 && (
          <Box sx={{ display: 'flex', gap: 0.5, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ fontWeight: 600, mr: 0.5 }}>
              Filters:
            </Typography>
            {filters.status && filters.status !== 'All' && (
              <Chip label={`Status: ${filters.status}`} size="small" color="primary" onDelete={() => setFilter('status', 'All')} />
            )}
            {filters.taskStatus && filters.taskStatus !== 'All' && (
              <Chip label={`Task: ${filters.taskStatus}`} size="small" color="primary" onDelete={() => setFilter('taskStatus', 'All')} />
            )}
            {filters.recordStatus && filters.recordStatus !== 'All' && (
              <Chip
                label={`Record: ${filters.recordStatus}`}
                size="small"
                color="primary"
                onDelete={() => setFilter('recordStatus', 'All')}
              />
            )}
            {filters.category && filters.category !== 'All' && (
              <Chip label={`Category: ${filters.category}`} size="small" color="secondary" onDelete={() => setFilter('category', 'All')} />
            )}
            {filters.departments?.map((d) => (
              <Chip key={d} label={d} size="small" color="info" onDelete={() => toggleDept(d)} />
            ))}
            {filters.employeeName && (
              <Chip
                label={`Employee: ${filters.employeeName}`}
                size="small"
                color="warning"
                onDelete={() => setFilter('employeeName', '')}
              />
            )}
            {filters.leftCompany && filters.leftCompany !== 'All' && (
              <Chip label={`Left: ${filters.leftCompany}`} size="small" color="error" onDelete={() => setFilter('leftCompany', 'All')} />
            )}
            <Button size="small" color="error" onClick={handleResetFilters} sx={{ ml: 1 }}>
              Clear All
            </Button>
          </Box>
        )}
      </Box>

      <TableContainer
        component={Paper}
        sx={{
          height: 'calc(100vh - 210px)',
          borderTop: '1px solid',
          borderColor: 'divider',
          borderRadius: 0,
          '&::-webkit-scrollbar': { width: 10, height: 10 },
          '&::-webkit-scrollbar-track': { backgroundColor: 'background.paper' },
          '&::-webkit-scrollbar-thumb': { backgroundColor: 'grey.400', borderRadius: 2 }
        }}
      >
        <Table stickyHeader sx={{ minWidth: 4000 }} aria-label="checklist table">
          <TableHead>
            <TableRow>
              {columns.map((col, i) => (
                <TableCell
                  key={i}
                  sx={{
                    minWidth: 200,
                    bgcolor: theme.palette.mode === 'dark' ? 'dark.main' : 'grey[50]',
                    color: 'text.primary',
                    fontWeight: 700,
                    whiteSpace: 'nowrap',
                    borderBottom: '2px solid',
                    borderColor: 'primary.main',
                    borderRight: '1px solid',
                    borderRightColor: 'divider'
                  }}
                >
                  {col}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length} align="center" sx={{ py: 6 }}>
                  <Typography variant="body1" color="textSecondary">
                    Loading...
                  </Typography>
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} align="center" sx={{ py: 6 }}>
                  <Typography variant="body1" color="textSecondary">
                    {searchQuery || activeCount > 0 ? 'No matching records found' : 'No data available in table'}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row, idx) => (
                <Tooltip key={row.id} title="Double tap to view details" placement="top" followCursor arrow>
                  <TableRow
                    hover
                    onClick={() => handleRowClick(row)}
                    onDoubleClick={() => handleRowOpen(row)}
                    sx={{ cursor: 'pointer', bgcolor: selectedRowId === row.id ? 'primary.light' : 'inherit' }}
                  >
                    <TableCell sx={{ minWidth: 200, borderRight: '1px solid #eee' }}>{page * size + idx + 1}</TableCell>
                    <TableCell sx={{ minWidth: 200, borderRight: '1px solid #eee' }}>{row.seqNo}</TableCell>
                    <TableCell sx={{ minWidth: 200, borderRight: '1px solid #eee' }}>{row.checkingPoint}</TableCell>
                    <TableCell sx={{ minWidth: 200, borderRight: '1px solid #eee' }}>{row.category}</TableCell>
                    <TableCell sx={{ minWidth: 200, borderRight: '1px solid #eee' }}>{row.frequency}</TableCell>
                    <TableCell sx={{ minWidth: 200, borderRight: '1px solid #eee' }}>
                      {(row.departments || []).map((d) => d.departmentName).join(', ')}
                    </TableCell>
                    <TableCell sx={{ minWidth: 200, borderRight: '1px solid #eee' }}>{row.effectiveFrom}</TableCell>
                    <TableCell sx={{ minWidth: 200, borderRight: '1px solid #eee' }}>{row.reminderDays}</TableCell>
                    <TableCell sx={{ minWidth: 200, borderRight: '1px solid #eee' }}>{row.expiryDate}</TableCell>
                    <TableCell sx={{ minWidth: 200, borderRight: '1px solid #eee' }}>{row.reminderDate}</TableCell>
                    <TableCell sx={{ minWidth: 200, borderRight: '1px solid #eee' }}>{row.stockLink}</TableCell>
                    <TableCell sx={{ minWidth: 200, borderRight: '1px solid #eee' }}>{row.assignTo}</TableCell>
                    <TableCell sx={{ minWidth: 200, borderRight: '1px solid #eee' }}>{row.assignDate}</TableCell>
                    <TableCell sx={{ minWidth: 200, borderRight: '1px solid #eee' }}>{row.itemCode}</TableCell>
                    <TableCell sx={{ minWidth: 200, borderRight: '1px solid #eee' }}>{row.qty}</TableCell>
                    <TableCell sx={{ minWidth: 200, borderRight: '1px solid #eee' }}>{row.photoRequired}</TableCell>
                    <TableCell sx={{ minWidth: 200, borderRight: '1px solid #eee' }}>
                      {row.createdDate ? new Date(row.createdDate).toLocaleDateString() : ''}
                    </TableCell>
                    <TableCell sx={{ minWidth: 200, borderRight: '1px solid #eee' }}>{row.createdBy}</TableCell>
                    <TableCell sx={{ minWidth: 200, borderRight: '1px solid #eee' }}>{row.updatedBy}</TableCell>
                    <TableCell sx={{ minWidth: 200, borderRight: '1px solid #eee' }}>{row.status}</TableCell>
                    <TableCell sx={{ minWidth: 200, borderRight: '1px solid #eee' }}>{row.taskStatus}</TableCell>
                    <TableCell sx={{ minWidth: 200, borderRight: '1px solid #eee' }}>{row.verifyStatus}</TableCell>
                    <TableCell sx={{ minWidth: 200, borderRight: '1px solid #eee' }}>{row.verifiedBy}</TableCell>
                    <TableCell sx={{ minWidth: 200, borderRight: '1px solid #eee' }}>{row.verifiedDate}</TableCell>
                    <TableCell sx={{ minWidth: 200, borderRight: '1px solid #eee' }}>{row.rejReason}</TableCell>
                  </TableRow>
                </Tooltip>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={totalElements}
        page={page}
        onPageChange={(e, p) => setPage(p)}
        rowsPerPage={size}
        onRowsPerPageChange={(e) => {
          setSize(parseInt(e.target.value, 10));
          setPage(0);
        }}
        rowsPerPageOptions={[5, 10, 25, 50]}
        sx={{
          '& .MuiTablePagination-toolbar': { justifyContent: 'center' },
          '& .MuiTablePagination-spacer': { display: 'none' }
        }}
      />

      {/* ===== FILTER DRAWER ===== */}
      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)} PaperProps={{ sx: { width: 320 } }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            p: 2,
            borderBottom: '1px solid',
            borderColor: 'divider'
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Filters
          </Typography>
          <IconButton size="small" onClick={() => setDrawerOpen(false)}>
            <IconX size={20} />
          </IconButton>
        </Box>

        <Box sx={{ overflowY: 'auto', flex: 1 }}>
          <FilterSection title="Status" open={openSections.status} onToggle={() => toggleSection('status')}>
            <FormControl>
              <RadioGroup value={filters.status || 'All'} onChange={(e) => setFilter('status', e.target.value)}>
                {['All', 'Pending for Verify', 'Verified', 'Rejected'].map((v) => (
                  <FormControlLabel
                    key={v}
                    value={v}
                    control={<Radio size="small" />}
                    label={<Typography variant="body2">{v}</Typography>}
                  />
                ))}
              </RadioGroup>
            </FormControl>
          </FilterSection>
          <Divider />

          <FilterSection title="Task Status" open={openSections.taskStatus} onToggle={() => toggleSection('taskStatus')}>
            <FormControl>
              <RadioGroup value={filters.taskStatus || 'All'} onChange={(e) => setFilter('taskStatus', e.target.value)}>
                {['All', 'Not Assigned', 'Assigned'].map((v) => (
                  <FormControlLabel
                    key={v}
                    value={v}
                    control={<Radio size="small" />}
                    label={<Typography variant="body2">{v}</Typography>}
                  />
                ))}
              </RadioGroup>
            </FormControl>
          </FilterSection>
          <Divider />

          <FilterSection title="Record Status" open={openSections.recordStatus} onToggle={() => toggleSection('recordStatus')}>
            <FormControl>
              <RadioGroup value={filters.recordStatus} onChange={(e) => setFilter('recordStatus', e.target.value)}>
                {['All', 'Active', 'In Active'].map((v) => (
                  <FormControlLabel
                    key={v}
                    value={v}
                    control={<Radio size="small" />}
                    label={<Typography variant="body2">{v}</Typography>}
                  />
                ))}
              </RadioGroup>
            </FormControl>
          </FilterSection>
          <Divider />

          <FilterSection title="Category" open={openSections.category} onToggle={() => toggleSection('category')}>
            <FormControl>
              <RadioGroup value={filters.category} onChange={(e) => setFilter('category', e.target.value)}>
                {['All', 'RENEWAL', 'CHECK LIST'].map((v) => (
                  <FormControlLabel
                    key={v}
                    value={v}
                    control={<Radio size="small" />}
                    label={<Typography variant="body2">{v === 'All' ? 'All' : v === 'RENEWAL' ? 'Renewal' : 'Check List'}</Typography>}
                  />
                ))}
              </RadioGroup>
            </FormControl>
          </FilterSection>
          <Divider />

          <FilterSection title="Department" open={openSections.department} onToggle={() => toggleSection('department')}>
            <Box sx={{ maxHeight: 250, overflowY: 'auto' }}>
              {DEPARTMENTS.map((d) => (
                <FormControlLabel
                  key={d}
                  sx={{ display: 'flex', ml: 0, mr: 0, py: 0.2 }}
                  control={
                    <Checkbox
                      size="small"
                      checked={(filters.departments || []).includes(d)}
                      onChange={() => toggleDept(d)}
                      sx={{ p: 0.5 }}
                    />
                  }
                  label={<Typography variant="body2">{d}</Typography>}
                />
              ))}
            </Box>
          </FilterSection>
          <Divider />

          <FilterSection title="Employee Name" open={openSections.employee} onToggle={() => toggleSection('employee')}>
            <TextField
              size="small"
              fullWidth
              placeholder="Search employee..."
              value={filters.employeeName || ''}
              onChange={(e) => setFilter('employeeName', e.target.value)}
            />
          </FilterSection>
          <Divider />

          <FilterSection title="Left Company" open={openSections.leftCompany} onToggle={() => toggleSection('leftCompany')}>
            <FormControl>
              <RadioGroup value={filters.leftCompany || 'All'} onChange={(e) => setFilter('leftCompany', e.target.value)}>
                {['All', 'No', 'Yes'].map((v) => (
                  <FormControlLabel
                    key={v}
                    value={v}
                    control={<Radio size="small" />}
                    label={<Typography variant="body2">{v}</Typography>}
                  />
                ))}
              </RadioGroup>
            </FormControl>
          </FilterSection>
        </Box>

        <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider', display: 'flex', gap: 1 }}>
          <Button
            fullWidth
            variant="outlined"
            color="error"
            onClick={() => {
              handleResetFilters();
              setDrawerOpen(false);
            }}
          >
            Reset All
          </Button>
          <Button fullWidth variant="contained" onClick={() => setDrawerOpen(false)}>
            Apply
          </Button>
        </Box>
      </Drawer>

      <AddCheckListDialog
        open={dialogOpen}
        handleClose={() => setDialogOpen(false)}
        onSave={handleSaveData}
        initialData={activeRow}
        readOnly={isView}
      />
    </MainCard>
  );
}
