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
import ExecutionVerifyDialog from './ExecutionVerifyDialog';
import { BOSExportButton } from 'ui-component/bos';
import useAuth from 'hooks/useAuth';

import { IconCheck, IconBan } from '@tabler/icons-react';
import usePagePermissions, { PAGE_CODES } from 'hooks/usePagePermissions';

const columns = [
  '#', 'Seq No', 'Checking Point', 'Category', 'Frequency', 'Department',
  'Effective From', 'Days', 'Expire Date', 'Stock Link',
  'CREATED USER', 'CREATED DATE', 'UPDATED USER', 'UPDATED DATE',
  'Verify Status', 'Verified By', 'Verified Date'
];

const tableCols = [
  { id: 'seqNo', label: 'Seq No' },
  { id: 'checkingPoint', label: 'Checking Point' },
  { id: 'category', label: 'Category' },
  { id: 'frequency', label: 'Frequency' },
  { id: 'department', label: 'Department' },
  { id: 'effectiveFrom', label: 'Effective From' },
  { id: 'days', label: 'Days' },
  { id: 'expireDate', label: 'Expire Date' },
  { id: 'stockLink', label: 'Stock Link' },
  { id: 'createdUser', label: 'CREATED USER' },
  { id: 'createdDate', label: 'CREATED DATE' },
  { id: 'updatedUser', label: 'UPDATED USER' },
  { id: 'updatedDate', label: 'UPDATED DATE' },
  { id: 'verifyStatus', label: 'Verify Status' },
  { id: 'verifiedBy', label: 'Verified By' },
  { id: 'verifiedDate', label: 'Verified Date' }
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
  { header: 'Department', key: (r) => (r.departments || []).map(d => d.departmentName).join(', ') },
  { header: 'Effective From', key: (r) => formatDate(r.effectiveFrom) },
  { header: 'Days', key: 'reminderDays' },
  { header: 'Expire Date', key: (r) => formatDate(r.expiryDate) },
  { header: 'Stock Link', key: 'stockLink' },
  { header: 'CREATED USER', key: (r) => r.createdUser || r.createdBy },
  { header: 'CREATED DATE', key: (r) => formatDate(r.createdAt || r.createdDate) },
  { header: 'UPDATED USER', key: (r) => r.updatedUser || r.updatedBy },
  { header: 'UPDATED DATE', key: (r) => formatDate(r.updatedAt || r.updatedDate) },
  { header: 'Verify Status', key: 'status' },
  { header: 'Verified By', key: 'verifiedBy' },
  { header: 'Verified Date', key: (r) => formatDate(r.verifiedDate) }
];

const getFilterConfig = (departments) => [
  {
    id: 'status', label: 'Status', type: 'select', isStarred: true, defaultValue: 'Pending for Verify', options: [
      { value: 'All', label: 'All' },
      { value: 'Pending for Verify', label: 'Pending for Verify' },
      { value: 'Verified', label: 'Verified' },
      { value: 'Rejected', label: 'Rejected' }
    ]
  },
  {
    id: 'category', label: 'Category', type: 'select', isStarred: true, defaultValue: 'All', options: [
      { value: 'All', label: 'All' },
      { value: 'RENEWAL', label: 'RENEWAL' },
      { value: 'CHECK LIST', label: 'CHECK LIST' }
    ]
  },
  { id: 'departments', label: 'Department', type: 'autocomplete', multiple: true, isStarred: true, options: departments.map(d => ({ value: d, label: d })) },
  {
    id: 'searchBy', label: 'Search by', type: 'select', isStarred: true, defaultValue: 'All', options: [
      { value: 'All', label: 'Global Search' },
      { value: 'checkingPoint', label: 'Checking Point' },
      { value: 'description', label: 'Descriptions' },
      { value: 'seqNo', label: 'Seq.No' }
    ]
  },
  { id: 'seqNo', label: 'Sequence No', type: 'text', isStarred: false },
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
  }
];

function StatusChip({ status }) {
  const map = {
    'Verified': { color: 'success', icon: <IconCheck size={14} /> },
    'Rejected': { color: 'error', icon: <IconBan size={14} /> },
    'Pending for Verify': { color: 'warning', icon: null }
  };
  const cfg = map[status] || { color: 'default', icon: null };
  return (
    <Chip
      label={status}
      size="small"
      color={cfg.color}
      icon={cfg.icon}
      variant="outlined"
      sx={{ minWidth: 160, maxWidth: 160, height: 26, fontSize: '0.75rem', fontWeight: 700, justifyContent: 'center', '& .MuiChip-label': { px: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }}
    />
  );
}

export default function CheckListVerify() {
  const dispatch = useDispatch();
  const { user } = useAuth();
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
  const perms = usePagePermissions(PAGE_CODES.QMS_CHECKLIST_VERIFY);

  const [departmentsList, setDepartmentsList] = useState([]);

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

  const fetchChecklists = useCallback(async () => {
    setLoading(true);
    try {
      const status = globalFilters.status || 'Pending for Verify';
      const category = globalFilters.category || 'All';
      const depts = globalFilters.departments || [];
      const searchBy = globalFilters.searchBy || 'All';

      const params = {
        page,
        size,
        verifyStatus: status !== 'All' ? status : undefined,
        category: category !== 'All' ? category : undefined,
        department: depts.length > 0 ? depts[0] : undefined,
        searchValue: searchQuery || undefined,
        searchBy: searchBy !== 'All' ? searchBy : undefined
      };
      const response = await axios.get('/api/qms/checklist', { params });
      setRows(response.data.content);
      setTotalElements(response.data.totalElements);
    } catch (error) {
      console.error('Failed to fetch checklists for verification:', error);
    } finally {
      setLoading(false);
    }
  }, [page, size, globalFilters, searchQuery]);

  useEffect(() => {
    fetchChecklists();
  }, [fetchChecklists]);

  const handleVerify = async (status, remarks = '') => {
    if (selectedRowId === null || selectedRowId === undefined) return;
    try {
      await axios.post('/api/qms/checklist/verify-master', {
        checklistId: selectedRowId,
        status: status,
        verifiedBy: user?.name || user?.id || 'Admin',
        remarks: remarks || (status === 'Rejected' ? 'Rejected by verifier' : 'Verified')
      });
      fetchChecklists();
      setDialogOpen(false);
    } catch (error) {
      console.error('Verification failed:', error);
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
      title="Check List Verify"
      secondary={
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {perms.export && <BOSExportButton data={rows} filename="Checklist_Verify" columns={exportColumns} size="small" />}
        </Box>
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
          <Table stickyHeader sx={{ minWidth: 1800 }} aria-label="checklist verify table">
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
                        {searchQuery || Object.keys(globalFilters).length > 0 ? 'No matching records found' : 'No data available in table'}
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
                  <TableCell>{row.seqNo}</TableCell>
                  <TableCell>
                    {row.checkingPoint ? (
                      <Box
                        component="span"
                        onClick={(e) => { e.stopPropagation(); setSelectedRowId(row.id); setDialogOpen(true); }}
                        sx={{ color: 'primary.main', textDecoration: 'underline', cursor: 'pointer', fontWeight: 500, '&:hover': { color: 'primary.dark' } }}
                      >
                        {row.checkingPoint}
                      </Box>
                    ) : '-'}
                  </TableCell>
                  <TableCell>{row.category}</TableCell>
                  <TableCell>{row.frequency}</TableCell>
                  <TableCell>{(row.departments || []).map(d => d.departmentName).join(', ')}</TableCell>
                  <TableCell>{formatDate(row.effectiveFrom)}</TableCell>
                  <TableCell>{row.reminderDays}</TableCell>
                  <TableCell>{formatDate(row.expiryDate)}</TableCell>
                  <TableCell>{row.stockLink}</TableCell>
                  <TableCell>{row.createdUser || row.createdBy || '-'}</TableCell>
                  <TableCell>{formatDate(row.createdAt || row.createdDate)}</TableCell>
                  <TableCell>{row.updatedUser || row.updatedBy || '-'}</TableCell>
                  <TableCell>{formatDate(row.updatedAt || row.updatedDate)}</TableCell>
                  <TableCell><StatusChip status={row.verifyStatus} /></TableCell>
                  <TableCell>{row.verifiedBy}</TableCell>
                  <TableCell>{formatDate(row.verifiedDate)}</TableCell>
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
        handleClose={() => setDialogOpen(false)}
        data={activeRow}
        onVerify={(remarks) => handleVerify('Verified', remarks)}
        onReject={(remarks) => handleVerify('Rejected', remarks)}
        isExecution={false}
      />
    </MainCard>
  );
}
