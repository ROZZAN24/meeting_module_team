import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Typography,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  TablePagination,
  Stack,
  useTheme,
  Chip
} from '@mui/material';
import { IconPlus, IconEdit, IconTrash, IconFileDownload, IconCalendarEvent } from '@tabler/icons-react';
import axios from 'utils/axios';
import MainCard from 'ui-component/cards/MainCard';
import { exportToExcel } from 'utils/excelExport';
import AnimateButton from 'ui-component/extended/AnimateButton';
import { format } from 'date-fns';
import { useDispatch, useSelector } from 'react-redux';
import { setFilterConfig } from 'store/slices/search';

const columns = [
  { id: 'index', label: '#', minWidth: 50 },
  { id: 'scheduleNo', label: 'Schedule No', minWidth: 120 },
  { id: 'auditType', label: 'Audit Type', minWidth: 150 },
  { id: 'auditArea', label: 'Audit Area', minWidth: 120 },
  { id: 'department', label: 'Department', minWidth: 120 },
  { id: 'auditDate', label: 'Audit Date', minWidth: 100 },
  { id: 'auditor', label: 'Auditor', minWidth: 120 },
  { id: 'auditee', label: 'Auditee', minWidth: 120 },
  { id: 'status', label: 'Status', minWidth: 100 },
  { id: 'createdDate', label: 'Created Date', minWidth: 120 },
  { id: 'createdBy', label: 'Created By', minWidth: 100 },
  { id: 'actions', label: 'Actions', minWidth: 100 }
];

export default function AuditScheduleList() {
  const theme = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Global Search State
  const globalQuery = useSelector((state) => state.search.query);
  const globalFilters = useSelector((state) => state.search.filters);

  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [loading, setLoading] = useState(false);

  // Set Global Search Config on Mount
  useEffect(() => {
    const config = [
      {
        id: 'status',
        label: 'Status',
        type: 'select',
        options: [
          { value: 'All', label: 'ALL' },
          { value: 'OPEN', label: 'OPEN' },
          { value: 'CLOSED', label: 'CLOSED' },
          { value: 'CANCELLED', label: 'CANCELLED' }
        ],
        defaultValue: 'All'
      }
    ];
    dispatch(setFilterConfig(config));

    // Cleanup on unmount
    return () => dispatch(setFilterConfig(null));
  }, [dispatch]);

  const fetchAuditSchedules = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/qms/audit-schedules');
      setRows(response.data);
    } catch (error) {
      console.error('Failed to fetch audit schedules:', error);
      // Dummy data for testing if backend is empty/failing
      setRows([
        {
          id: 1,
          scheduleNo: 'SCH-2026-001',
          scheduleDate: new Date('2026-01-10T10:00:00'),
          auditType: '5S - BLUE ZONE',
          auditArea: 'PRODUCTION',
          auditee: 'JOHN DOE',
          status: 'OPEN'
        }
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAuditSchedules();
  }, [fetchAuditSchedules]);

  const handleOpenAdd = () => {
    navigate('/qms/audit/schedule/add');
  };

  const handleOpenEdit = (id) => {
    navigate(`/qms/audit/schedule/edit/${id}`);
  };

  const handleCloseAudit = async (row) => {
    try {
      await axios.put(`/api/qms/audit-schedules/${row.id}`, { ...row, status: 'CLOSED' });
      fetchAuditSchedules();
    } catch (error) {
      console.error('Failed to close audit:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this audit schedule?')) {
      try {
        await axios.delete(`/api/qms/audit-schedules/${id}`);
        fetchAuditSchedules();
      } catch (error) {
        console.error('Failed to delete audit schedule:', error);
      }
    }
  };

  const handleExport = () => {
    const exportData = filteredRows.map((r, i) => ({
      '#': i + 1,
      'Schedule No': r.scheduleNo,
      Date: r.scheduleDate ? format(new Date(r.scheduleDate), 'dd-MM-yyyy') : '',
      'Audit Type': r.auditType,
      'Audit Area': r.auditArea,
      Auditee: r.auditee,
      Status: r.status
    }));
    exportToExcel(exportData, 'Audit_Schedule_Details');
  };

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      // Apply Global Filter Bar logic
      const statusFilter = globalFilters.status || 'All';
      const matchesStatus = statusFilter === 'All' || row.status === statusFilter;

      // Apply Global Search Query logic
      const matchesSearch =
        !globalQuery ||
        (row.scheduleNo && row.scheduleNo.toLowerCase().includes(globalQuery.toLowerCase())) ||
        (row.auditType && row.auditType.toLowerCase().includes(globalQuery.toLowerCase())) ||
        (row.auditArea && row.auditArea.toLowerCase().includes(globalQuery.toLowerCase()));

      return matchesStatus && matchesSearch;
    });
  }, [rows, globalQuery, globalFilters]);

  return (
    <MainCard
      title={
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <IconCalendarEvent size={24} />
          <Typography variant="h3">Audit Schedule Master</Typography>
        </Stack>
      }
      secondary={
        <Stack direction="row" spacing={1.5}>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<IconFileDownload size={18} />}
            onClick={handleExport}
            sx={{ borderRadius: 2 }}
          >
            Excel
          </Button>
          <AnimateButton>
            <Button variant="contained" color="primary" startIcon={<IconPlus size={18} />} onClick={handleOpenAdd} sx={{ borderRadius: 2 }}>
              New Schedule
            </Button>
          </AnimateButton>
        </Stack>
      }
    >
      <TableContainer
        component={Paper}
        sx={{
          height: 'calc(100vh - 240px)',
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: 'none',
          borderRadius: 2
        }}
      >
        <Table stickyHeader aria-label="audit schedule table" size="small">
          <TableHead>
            <TableRow>
              {columns.map((col) => (
                <TableCell
                  key={col.id}
                  sx={{
                    bgcolor: '#f5f7fa',
                    color: '#455a64',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    py: 1.5,
                    borderBottom: '2px solid',
                    borderColor: 'primary.main',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05rem',
                    borderRight: '1px solid',
                    borderColor: 'divider'
                  }}
                >
                  {col.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length} align="center" sx={{ py: 3 }}>
                  Loading...
                </TableCell>
              </TableRow>
            ) : filteredRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} align="center" sx={{ py: 3 }}>
                  No records found.
                </TableCell>
              </TableRow>
            ) : (
              filteredRows.slice(page * size, page * size + size).map((row, index) => (
                <TableRow
                  key={row.id}
                  hover
                  onDoubleClick={() => handleOpenEdit(row.id)}
                  sx={{
                    cursor: 'pointer',
                    '&:last-child td, &:last-child th': { border: 0 },
                    '&:hover': { bgcolor: 'primary.light' }
                  }}
                >
                  <TableCell>{index + 1 + page * size}</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: 'primary.main' }}>{row.scheduleNo}</TableCell>
                  <TableCell>{row.auditType}</TableCell>
                  <TableCell>{row.auditArea}</TableCell>
                  <TableCell>{row.department}</TableCell>
                  <TableCell>{row.auditDate ? format(new Date(row.auditDate), 'dd-MM-yyyy') : '-'}</TableCell>
                  <TableCell>{row.auditor}</TableCell>
                  <TableCell>{row.auditee}</TableCell>
                  <TableCell>
                    <Chip
                      label={row.status}
                      size="small"
                      sx={{
                        bgcolor: row.status === 'OPEN' ? theme.palette.success.light + 20 : theme.palette.error.light + 20,
                        color: row.status === 'OPEN' ? theme.palette.success.dark : theme.palette.error.dark,
                        fontWeight: 'bold',
                        border: '1px solid',
                        borderColor: row.status === 'OPEN' ? theme.palette.success.main : theme.palette.error.main
                      }}
                    />
                  </TableCell>
                  <TableCell>{row.createdDate ? format(new Date(row.createdDate), 'dd-MM-yyyy') : '-'}</TableCell>
                  <TableCell>{row.createdBy}</TableCell>
                  <TableCell align="center">
                    <Stack direction="row" spacing={1}>
                      <Tooltip title="Close Audit">
                        <IconButton
                          color="success"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm('Are you sure you want to close this audit?')) {
                              handleCloseAudit(row);
                            }
                          }}
                          size="small"
                          sx={{ bgcolor: '#e8f5e9', '&:hover': { bgcolor: 'success.main', color: 'white' } }}
                          disabled={row.status === 'CLOSED'}
                        >
                          <IconCalendarEvent size={18} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit">
                        <IconButton
                          color="primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenEdit(row.id);
                          }}
                          size="small"
                          sx={{ bgcolor: 'primary.light', '&:hover': { bgcolor: 'primary.main', color: 'white' } }}
                        >
                          <IconEdit size={18} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          color="error"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(row.id);
                          }}
                          size="small"
                          sx={{ bgcolor: '#ffebee', '&:hover': { bgcolor: 'error.main', color: 'white' } }}
                        >
                          <IconTrash size={18} />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[10, 25, 50]}
        component="div"
        count={filteredRows.length}
        rowsPerPage={size}
        page={page}
        onPageChange={(e, newPage) => setPage(newPage)}
        onRowsPerPageChange={(e) => {
          setSize(parseInt(e.target.value, 10));
          setPage(0);
        }}
      />
    </MainCard>
  );
}
