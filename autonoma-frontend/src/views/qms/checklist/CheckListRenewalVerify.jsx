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
import { BOSExportButton } from 'ui-component/bos';

import usePagePermissions, { PAGE_CODES } from 'hooks/usePagePermissions';

const columns = [
  '#',
  'Task Type',
  'Seq No',
  'Checking Point',
  'Descriptions',
  'Category',
  'Frequency',
  'Dept',
  'Date',
  'Checklist Date',
  'Status',
  'Next Due Date',
  'Assigned To',
  'Dual Check',
  'Verification Required',
  'Photo Required',
  'CREATED USER',
  'CREATED DATE',
  'UPDATED USER',
  'UPDATED DATE'
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
  } catch {
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
  { header: 'Dept', key: (r) => (r.checklist?.departments || []).map((d) => d.departmentName).join(', ') },
  { header: 'Date', key: (r) => formatDate(r.assignedDate) },
  { header: 'Checklist Date', key: (r) => formatDate(r.checklistDate) },
  { header: 'Status', key: (r) => (typeof r.status === 'object' ? r.status?.name : r.status) },
  { header: 'Next Due Date', key: (r) => formatDate(r.checklist?.nextDueDate) },
  { header: 'Assigned To', key: 'assignedTo' },
  { header: 'Dual Check', key: (r) => (r.checklist?.dualCheck?.toUpperCase() === 'YES' ? 'yes' : 'No') },
  { header: 'Verification Required', key: (r) => (r.checklist?.dualCheck?.toUpperCase() === 'YES' ? 'yes' : 'No') },
  { header: 'Photo Required', key: (r) => r.checklist?.photoRequired || 'NO' },
  { header: 'CREATED USER', key: (r) => r.checklist?.createdBy },
  { header: 'CREATED DATE', key: (r) => formatDate(r.checklist?.createdAt || r.checklist?.createdDate) },
  { header: 'UPDATED USER', key: (r) => r.updatedBy || r.checklist?.updatedBy },
  { header: 'UPDATED DATE', key: (r) => formatDate(r.updatedAt || r.checklist?.updatedAt) }
];

function StatusChip({ status }) {
  const colorMap = {
    'Pending for Verified': 'warning',
    'Pending for Accepted': 'warning',
    Verified: 'success',
    Rejected: 'error',
    'Not Accepted': 'error',
    Accepted: 'success',
    Missed: 'error'
  };
  const label = typeof status === 'object' ? status?.name : status;
  return (
    <Chip
      label={label || 'Pending'}
      size="small"
      color={colorMap[label] || 'default'}
      variant="outlined"
      sx={{
        minWidth: 140,
        maxWidth: 140,
        height: 26,
        fontSize: '0.75rem',
        fontWeight: 600,
        justifyContent: 'center',
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
  const activeRow = (rows || []).find((r) => r?.id === selectedRowId) || null;
  const searchQuery = useSelector((state) => state.search.query);
  const perms = usePagePermissions(PAGE_CODES.QMS_CHECKLIST_RENEWAL_VERIFY);

  // Configure global search bar filters on mount (disabled for this page)
  useEffect(() => {
    dispatch(setFilterConfig(null));
    dispatch(setTableConfig(null));
  }, [dispatch]);

  const fetchAssignments = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page,
        size,
        status: 'Pending for Verified,Pending for Accepted',
        currentUser: user?.name || user?.id || undefined,
        excludePending: true,
        searchValue: searchQuery || undefined
      };
      const response = await axios.get('/api/qms/checklist/assignments', { params });
      setRows(response?.data?.content || []);
      setTotalElements(response?.data?.totalElements || 0);
    } catch (error) {
      console.error('Failed to fetch assignments for verification:', error);
      setRows([]);
      setTotalElements(0);
    } finally {
      setLoading(false);
    }
  }, [page, size, searchQuery, user]);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

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

      const isAdmin = user?.isBosAdmin === 1 || user?.id?.toLowerCase() === 'admin';

      if (!assignee) {
        if (!isAdmin) {
          dispatch(
            openSnackbar({
              open: true,
              message: `Assignee '${assigneeName}' not found in Employee Master. Only an administrator can verify.`,
              variant: 'alert',
              alert: { variant: 'filled' },
              severity: 'error',
              close: false
            })
          );
          return;
        }
      } else {
        try {
          const mappingRes = await axios.get(`/api/master/employee/manager-mapping/${assignee.id}`);
          const mapping = mappingRes.data;

          const isVerticalHead =
            mapping &&
            mapping.verticalHeadId &&
            (String(user?.empId) === String(mapping.verticalHeadId) ||
              (employees || []).find((emp) => String(emp.id) === String(mapping.verticalHeadId))?.firstName?.toLowerCase() ===
                user?.name?.split(' ')[0]?.toLowerCase());

          if (!isVerticalHead && !isAdmin) {
            dispatch(
              openSnackbar({
                open: true,
                message: `Only the mapped Vertical Head of '${assigneeName}' can verify or reject this record!`,
                variant: 'alert',
                alert: { variant: 'filled' },
                severity: 'error',
                close: false
              })
            );
            return;
          }
        } catch (err) {
          console.error('Failed to verify manager mapping:', err);
          if (!isAdmin) {
            dispatch(
              openSnackbar({
                open: true,
                message: 'Failed to validate manager permissions. Only administrators can bypass.',
                variant: 'alert',
                alert: { variant: 'filled' },
                severity: 'error',
                close: false
              })
            );
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
      dispatch(
        openSnackbar({
          open: true,
          message: `Task successfully ${status === 'Verified' ? 'verified' : 'rejected'}!`,
          variant: 'alert',
          alert: { variant: 'filled' },
          severity: 'success',
          close: false
        })
      );
      setDialogOpen(false);
      fetchAssignments();
    } catch (error) {
      console.error('Verification failed:', error);
      dispatch(
        openSnackbar({
          open: true,
          message: error?.response?.data?.message || 'Verification action failed.',
          variant: 'alert',
          alert: { variant: 'filled' },
          severity: 'error',
          close: false
        })
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
      title="Check List / Renewal Verify"
      secondary={
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {perms.export && <BOSExportButton data={rows || []} filename="Checklist_Renewal_Verify" columns={exportColumns} size="small" />}
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
        <TableContainer
          component={Paper}
          sx={{
            flexGrow: 1,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 0,
            '&::-webkit-scrollbar': { width: 10, height: 10 },
            '&::-webkit-scrollbar-track': { backgroundColor: 'background.paper' },
            '&::-webkit-scrollbar-thumb': { backgroundColor: 'grey.400', borderRadius: 2 }
          }}
        >
          <Table stickyHeader sx={{ minWidth: 2500 }} aria-label="renewal verify table">
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
                  <TableCell colSpan={columns.length} sx={{ p: 0, border: 'none' }}>
                    <Box
                      sx={{
                        position: 'sticky',
                        left: 0,
                        width: '100%',
                        maxWidth: 'calc(100vw - 280px)',
                        display: 'flex',
                        justifyContent: 'center',
                        py: 6
                      }}
                    >
                      <Typography variant="body1" color="textSecondary">
                        Loading...
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (rows || []).length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length} sx={{ p: 0, border: 'none' }}>
                    <Box
                      sx={{
                        position: 'sticky',
                        left: 0,
                        width: '100%',
                        maxWidth: 'calc(100vw - 280px)',
                        display: 'flex',
                        justifyContent: 'center',
                        py: 6
                      }}
                    >
                      <Typography variant="body1" color="textSecondary">
                        {searchQuery ? 'No matching records found' : 'No data available in table'}
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                (rows || []).map((row, idx) => (
                  <TableRow
                    key={row.id}
                    hover
                    onClick={() => setSelectedRowId(row.id)}
                    onDoubleClick={() => {
                      if (perms.approval || perms.write) {
                        setSelectedRowId(row.id);
                        setDialogOpen(true);
                      }
                    }}
                    onMouseEnter={() => {
                      if (perms.approval || perms.write) setShowDoubleTap(true);
                    }}
                    onMouseLeave={() => setShowDoubleTap(false)}
                    onMouseMove={(e) => setCursorPos({ x: e.clientX, y: e.clientY })}
                    sx={{
                      cursor: perms.approval || perms.write ? 'pointer' : 'default',
                      bgcolor: selectedRowId === row.id ? 'primary.light' : 'inherit'
                    }}
                  >
                    <TableCell>{page * size + idx + 1}</TableCell>
                    <TableCell>{row.assignType || 'Mine'}</TableCell>
                    <TableCell>{row.checklist?.seqNo}</TableCell>
                    <TableCell>
                      {row.checklist?.checkingPoint ? (
                        <Box
                          component="span"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedRowId(row.id);
                            setDialogOpen(true);
                          }}
                          sx={{
                            color: 'primary.main',
                            textDecoration: 'underline',
                            cursor: 'pointer',
                            fontWeight: 500,
                            '&:hover': { color: 'primary.dark' }
                          }}
                        >
                          {row.checklist.checkingPoint}
                        </Box>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>{row.checklist?.description}</TableCell>
                    <TableCell>{row.checklist?.category}</TableCell>
                    <TableCell>{row.checklist?.frequency}</TableCell>
                    <TableCell>{(row.checklist?.departments || []).map((d) => d.departmentName).join(', ')}</TableCell>
                    <TableCell>{formatDate(row.assignedDate)}</TableCell>
                    <TableCell>{formatDate(row.checklistDate)}</TableCell>
                    <TableCell>
                      <StatusChip status={row.status} />
                    </TableCell>
                    <TableCell>{formatDate(row.checklist?.nextDueDate)}</TableCell>
                    <TableCell>{row.assignedTo}</TableCell>
                    <TableCell>{row.checklist?.dualCheck?.toUpperCase() === 'YES' ? 'yes' : 'No'}</TableCell>
                    <TableCell>{row.checklist?.dualCheck?.toUpperCase() === 'YES' ? 'yes' : 'No'}</TableCell>
                    <TableCell>{row.checklist?.photoRequired || '-'}</TableCell>
                    <TableCell>{row.checklist?.createdBy || '-'}</TableCell>
                    <TableCell>{formatDate(row.checklist?.createdAt || row.checklist?.createdDate)}</TableCell>
                    <TableCell>{row.updatedBy || row.checklist?.updatedBy || '-'}</TableCell>
                    <TableCell>{formatDate(row.updatedAt || row.checklist?.updatedAt)}</TableCell>
                  </TableRow>
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
        handleClose={() => {
          setDialogOpen(false);
        }}
        data={activeRow}
        onVerify={(remarks) => handleVerify('Verified', remarks)}
        onReject={(remarks) => handleVerify('Rejected', remarks)}
        onNotAccept={(remarks) => handleVerify('Not Accepted', remarks)}
        isExecution={false}
      />
    </MainCard>
  );
}
