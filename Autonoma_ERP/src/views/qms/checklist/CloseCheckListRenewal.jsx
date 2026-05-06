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
import Tooltip from '@mui/material/Tooltip';
import axios from 'utils/axios';

import AddCheckListDialog from './AddCheckListDialog';

import MainCard from 'ui-component/cards/MainCard';
import { useDispatch, useSelector } from 'react-redux';
import { setFilters, resetFilters } from 'store/slices/search';
import useSearchFilter from 'hooks/useSearchFilter';

import { IconAdjustmentsHorizontal, IconChevronDown, IconChevronUp, IconCheck, IconFileDownload, IconX } from '@tabler/icons-react';
import { exportToExcel } from 'utils/excelExport';

const columns = [
  '#',
  'Task Type',
  'Seq.No',
  'Checking Point',
  'Descriptions',
  'Category',
  'Frequency',
  'Dept',
  'Date',
  'Checklist Date',
  'Next Due Date',
  'Status',
  'Attended Date',
  'Attended By',
  'Verification Required',
  'Photo Required',
  'Created Date',
  'Created By'
];

const STATUS_OPTIONS = [
  'Pending',
  'Started',
  'Unresolved',
  'Missed',
  'Completed',
  'Not Completed',
  '25%',
  '50%',
  '75%',
  'Pending for Verified',
  'Verified',
  'Pending for Accepted',
  'Accepted',
  'Attended'
];

const SEARCH_BY_OPTIONS = [
  { key: 'All', label: 'Global Search' },
  { key: 'checkingPoint', label: 'Checking Point' },
  { key: 'seqNo', label: 'Seq.No' }
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

function StatusChip({ status }) {
  const colorMap = {
    Pending: 'warning',
    Started: 'info',
    Completed: 'success',
    Verified: 'success',
    Accepted: 'success',
    Attended: 'success',
    Missed: 'error',
    Unresolved: 'error',
    'Not Completed': 'error',
    '25%': 'warning',
    '50%': 'warning',
    '75%': 'info',
    'Pending for Verified': 'warning',
    'Pending for Accepted': 'warning'
  };
  const label = typeof status === 'object' ? status?.name : status;
  return <Chip label={label || 'Pending'} size="small" color={colorMap[label] || 'default'} variant="outlined" />;
}

export default function CloseCheckListRenewal() {
  const [rows, setRows] = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const searchQuery = useSelector((state) => state.search.query);
  const filters = useSelector((state) => state.search.filters);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedRowId, setSelectedRowId] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [openSections, setOpenSections] = useState({ taskType: true, date: true, status: true, searchBy: false });
  const toggleSection = (key) => setOpenSections((p) => ({ ...p, [key]: !p[key] }));

  // Register filters for the top search bar
  useSearchFilter([
    {
      id: 'taskType',
      label: 'Task Type',
      type: 'select',
      options: [
        { label: 'All', value: 'All' },
        { label: 'Mine', value: 'Mine' },
        { label: 'Team', value: 'Team' },
        { label: 'Company', value: 'Company' }
      ]
    },
    {
      id: 'fromDate',
      label: 'From Date',
      type: 'date'
    },
    {
      id: 'toDate',
      label: 'To Date',
      type: 'date'
    },
    {
      id: 'considerDate',
      label: 'Consider Date',
      type: 'select',
      options: [
        { label: 'All', value: 'All' },
        { label: 'Yes', value: 'Yes' },
        { label: 'No', value: 'No' }
      ]
    },
    {
      id: 'statuses',
      label: 'Statuses',
      type: 'select',
      multiple: true,
      options: STATUS_OPTIONS.map((s) => ({ label: s, value: s }))
    },
    {
      id: 'searchBy',
      label: 'Search By',
      type: 'select',
      options: SEARCH_BY_OPTIONS.map((o) => ({ label: o.label, value: o.key }))
    }
  ]);

  const fetchAssignments = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page,
        size,
        status: (filters.statuses || []).length > 0 ? filters.statuses[0] : undefined,
        fromDate: filters.fromDate || undefined,
        toDate: filters.toDate || undefined,
        searchValue: searchQuery || undefined,
        searchBy: filters.searchBy !== 'All' ? filters.searchBy : undefined
      };
      const response = await axios.get('/api/qms/checklist/assignments', { params });
      setRows(response.data.content);
      setTotalElements(response.data.totalElements);
    } catch (error) {
      console.error('Failed to fetch assignments:', error);
    } finally {
      setLoading(false);
    }
  }, [page, size, filters, searchQuery]);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  const setFilter = (key, val) => {
    dispatch(setFilters({ [key]: val }));
    setPage(0);
  };

  const toggleStatus = (status) => {
    const arr = filters.statuses || [];
    const newStatuses = arr.includes(status) ? arr.filter((s) => s !== status) : [...arr, status];
    dispatch(setFilters({ statuses: newStatuses }));
    setPage(0);
  };

  const handleResetFilters = () => {
    dispatch(resetFilters());
    setPage(0);
  };

  const handleRowClick = (row) => {
    setSelectedRowId(row.id);
  };

  const handleRowOpen = (row) => {
    setSelectedRowId(row.id);
    setDialogOpen(true);
  };

  const activeAssignment = rows.find((r) => r.id === selectedRowId) || null;

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

  const handleExport = () => {
    const exportData = rows.map((r, i) => ({
      '#': i + 1,
      'Task Type': r.assignType || 'Mine',
      'Seq No': r.checklist?.seqNo,
      'Checking Point': r.checklist?.checkingPoint,
      Descriptions: r.checklist?.description,
      Category: r.checklist?.category,
      Frequency: r.checklist?.frequency,
      Department: (r.checklist?.departments || []).map((d) => d.departmentName).join(', '),
      Date: r.assignedDate ? new Date(r.assignedDate).toLocaleDateString() : '',
      'Checklist Date': r.checklistDate,
      'Next Due Date': r.checklist?.nextDueDate,
      Status: typeof r.status === 'object' ? r.status?.name : r.status,
      'Attended Date': r.attendedDate,
      'Attended By': r.attendedBy,
      'Verification Required': r.checklist?.verificationRequired,
      'Photo Required': r.checklist?.photoRequired,
      'Created Date': r.checklist?.createdDate ? new Date(r.checklist.createdDate).toLocaleDateString() : '',
      'Created By': r.checklist?.createdBy
    }));
    exportToExcel(exportData, 'Close_Checklist');
  };

  const activeCount =
    (filters.taskType && filters.taskType !== 'All' ? 1 : 0) +
    (filters.fromDate ? 1 : 0) +
    (filters.toDate ? 1 : 0) +
    (filters.considerDate && filters.considerDate !== 'No' ? 1 : 0) +
    (filters.statuses?.length || 0) +
    (filters.searchBy && filters.searchBy !== 'All' ? 1 : 0);

  return (
    <MainCard
      title="Close Check List / Renewal"
      secondary={
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Button
            variant="contained"
            color="primary"
            size="small"
            startIcon={<IconCheck size={18} />}
            onClick={() => handleUpdateStatus('Completed')}
            disabled={!selectedRowId}
          >
            Complete Task
          </Button>
          <Button
            variant="outlined"
            color="primary"
            size="small"
            startIcon={<IconFileDownload size={18} />}
            onClick={handleExport}
            sx={{ borderRadius: 1.5 }}
          >
            Export Excel
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
      {activeCount > 0 && (
        <Box sx={{ display: 'flex', gap: 0.5, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <Typography variant="body2" sx={{ fontWeight: 600, mr: 0.5 }}>
            Filters:
          </Typography>
          {filters.taskType && filters.taskType !== 'All' && (
            <Chip label={`Task: ${filters.taskType}`} size="small" color="primary" onDelete={() => setFilter('taskType', 'All')} />
          )}
          {filters.fromDate && (
            <Chip label={`From: ${filters.fromDate}`} size="small" color="info" onDelete={() => setFilter('fromDate', '')} />
          )}
          {filters.toDate && <Chip label={`To: ${filters.toDate}`} size="small" color="info" onDelete={() => setFilter('toDate', '')} />}
          {filters.considerDate && filters.considerDate !== 'No' && (
            <Chip
              label={`Consider Date: ${filters.considerDate}`}
              size="small"
              color="secondary"
              onDelete={() => setFilter('considerDate', 'No')}
            />
          )}
          {filters.statuses?.map((s) => (
            <Chip key={s} label={`Status: ${s}`} size="small" color="warning" onDelete={() => toggleStatus(s)} />
          ))}
          {filters.searchBy && filters.searchBy !== 'All' && (
            <Chip label={`Search By: ${filters.searchBy}`} size="small" color="info" onDelete={() => setFilter('searchBy', 'All')} />
          )}
          <Button size="small" color="error" onClick={handleResetFilters} sx={{ ml: 1 }}>
            Clear All
          </Button>
        </Box>
      )}

      <TableContainer
        component={Paper}
        sx={{
          height: 'calc(100vh - 210px)',
          border: '1px solid',
          borderColor: 'divider',
          '&::-webkit-scrollbar': { width: 10, height: 10 },
          '&::-webkit-scrollbar-track': { backgroundColor: 'background.paper' },
          '&::-webkit-scrollbar-thumb': { backgroundColor: 'grey.400', borderRadius: 2 }
        }}
      >
        <Table stickyHeader sx={{ minWidth: 2500 }} aria-label="close renewal table">
          <TableHead>
            <TableRow>
              {columns.map((col, i) => (
                <TableCell
                  key={i}
                  sx={{
                    bgcolor: 'primary.dark',
                    color: 'white',
                    fontWeight: 'bold',
                    whiteSpace: 'nowrap',
                    borderRight: '1px solid rgba(255,255,255,0.2)'
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
                    <TableCell>{page * size + idx + 1}</TableCell>
                    <TableCell>{row.assignType || 'Mine'}</TableCell>
                    <TableCell>{row.checklist?.seqNo}</TableCell>
                    <TableCell>{row.checklist?.checkingPoint}</TableCell>
                    <TableCell>{row.checklist?.description}</TableCell>
                    <TableCell>{row.checklist?.category}</TableCell>
                    <TableCell>{row.checklist?.frequency}</TableCell>
                    <TableCell>{(row.checklist?.departments || []).map((d) => d.departmentName).join(', ')}</TableCell>
                    <TableCell>{row.assignedDate ? new Date(row.assignedDate).toLocaleDateString() : ''}</TableCell>
                    <TableCell>{row.checklistDate}</TableCell>
                    <TableCell>{row.checklist?.nextDueDate}</TableCell>
                    <TableCell>
                      <StatusChip status={row.status} />
                    </TableCell>
                    <TableCell>{row.attendedDate}</TableCell>
                    <TableCell>{row.attendedBy}</TableCell>
                    <TableCell>{row.checklist?.verificationRequired}</TableCell>
                    <TableCell>{row.checklist?.photoRequired}</TableCell>
                    <TableCell>{row.checklist?.createdDate ? new Date(row.checklist.createdDate).toLocaleDateString() : ''}</TableCell>
                    <TableCell>{row.checklist?.createdBy}</TableCell>
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

      {/* FILTER DRAWER */}
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
          <FilterSection title="Task Type" open={openSections.taskType} onToggle={() => toggleSection('taskType')}>
            <FormControl>
              <RadioGroup value={filters.taskType} onChange={(e) => setFilter('taskType', e.target.value)}>
                {['All', 'Mine', 'Team', 'Company'].map((v) => (
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
          <FilterSection title="Date Range" open={openSections.dateRange} onToggle={() => toggleSection('dateRange')}>
            <Box sx={{ mb: 1.5 }}>
              <Typography variant="caption" sx={{ fontWeight: 600, mb: 0.5, display: 'block' }}>
                From
              </Typography>
              <TextField
                size="small"
                type="date"
                fullWidth
                value={filters.fromDate || ''}
                onChange={(e) => setFilter('fromDate', e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Box>
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 600, mb: 0.5, display: 'block' }}>
                To
              </Typography>
              <TextField
                size="small"
                type="date"
                fullWidth
                value={filters.toDate || ''}
                onChange={(e) => setFilter('toDate', e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Box>
          </FilterSection>
          <Divider />
          <FilterSection title="Consider Date?" open={openSections.considerDate} onToggle={() => toggleSection('considerDate')}>
            <FormControl>
              <RadioGroup value={filters.considerDate || 'All'} onChange={(e) => setFilter('considerDate', e.target.value)}>
                {['All', 'Yes', 'No'].map((v) => (
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
          <FilterSection title="Status" open={openSections.status} onToggle={() => toggleSection('status')}>
            <Box>
              {(STATUS_OPTIONS || []).map((s) => (
                <FormControlLabel
                  key={s}
                  sx={{ display: 'flex', ml: 0, mr: 0, py: 0.2 }}
                  control={
                    <Checkbox
                      size="small"
                      checked={(filters.statuses || []).includes(s)}
                      onChange={() => toggleStatus(s)}
                      sx={{ p: 0.5 }}
                    />
                  }
                  label={<Typography variant="body2">{s}</Typography>}
                />
              ))}
            </Box>
          </FilterSection>
          <Divider />
          <FilterSection title="Search By" open={openSections.searchBy} onToggle={() => toggleSection('searchBy')}>
            <FormControl fullWidth>
              <RadioGroup value={filters.searchBy} onChange={(e) => setFilter('searchBy', e.target.value)}>
                {SEARCH_BY_OPTIONS.map((opt) => (
                  <FormControlLabel
                    key={opt.key}
                    value={opt.key}
                    control={<Radio size="small" />}
                    label={<Typography variant="body2">{opt.label}</Typography>}
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
        initialData={activeAssignment?.checklist}
        readOnly={true}
      />
    </MainCard>
  );
}
