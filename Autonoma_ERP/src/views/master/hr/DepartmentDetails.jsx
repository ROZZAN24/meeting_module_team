import { useState, useEffect, useCallback, useMemo } from 'react';
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
  Chip,
  TextField,
  InputAdornment,
  Stack,
  useTheme
} from '@mui/material';
import { IconPlus, IconEdit, IconTrash, IconFileDownload, IconSearch, IconRefresh, IconBuilding } from '@tabler/icons-react';
import axios from 'utils/axios';
import { useDispatch, useSelector } from 'react-redux';
import { setFilterConfig } from 'store/slices/search';
import { format } from 'date-fns';
import MainCard from 'ui-component/cards/MainCard';
import AddDepartmentDialog from './AddDepartmentDialog';
import { exportToExcel } from 'utils/excelExport';
import AnimateButton from 'ui-component/extended/AnimateButton';

const columns = [
  { id: 'index', label: '#', minWidth: 50 },
  { id: 'departmentNo', label: 'Dept.No', minWidth: 100 },
  { id: 'departmentName', label: 'Dept.Name', minWidth: 180 },
  { id: 'ndaCertificate', label: 'NDA', minWidth: 80 },
  { id: 'sequenceNo', label: 'Seq.No', minWidth: 80 },
  { id: 'createdBy', label: 'Created User', minWidth: 120 },
  { id: 'createdDate', label: 'Created Date', minWidth: 150 },
  { id: 'updatedBy', label: 'Updated User', minWidth: 120 },
  { id: 'updatedDate', label: 'Updated Date', minWidth: 150 },
  { id: 'status', label: 'Status', minWidth: 100 }
];

export default function DepartmentDetails() {
  const theme = useTheme();
  const dispatch = useDispatch();

  // Global Search State
  const globalQuery = useSelector((state) => state.search.query);
  const globalFilters = useSelector((state) => state.search.filters);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [isReadOnly, setIsReadOnly] = useState(false);

  // Set Global Search Config on Mount
  useEffect(() => {
    const config = [
      {
        id: 'status',
        label: 'Status',
        type: 'select',
        options: [
          { value: 'All', label: 'ALL' },
          { value: 'Active', label: 'ACTIVE' },
          { value: 'In Active', label: 'INACTIVE' }
        ],
        defaultValue: 'Active'
      },
      {
        id: 'departmentName',
        label: 'Dept Name',
        type: 'text',
        placeholder: 'Search by Name...'
      }
    ];
    dispatch(setFilterConfig(config));

    // Cleanup on unmount
    return () => dispatch(setFilterConfig(null));
  }, [dispatch]);

  const fetchDepartments = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/hrm/departments');
      setRows(response.data);
    } catch (error) {
      console.error('Failed to fetch departments:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  const handleOpenAdd = () => {
    setSelectedRow(null);
    setIsReadOnly(false);
    setDialogOpen(true);
  };

  const handleOpenEdit = (row) => {
    setSelectedRow(row);
    setIsReadOnly(false);
    setDialogOpen(true);
  };

  const handleOpenView = (row) => {
    setSelectedRow(row);
    setIsReadOnly(true);
    setDialogOpen(true);
  };

  const handleCloseDialog = (refresh) => {
    setDialogOpen(false);
    if (refresh === true) {
      fetchDepartments();
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this department?')) {
      try {
        await axios.delete(`/api/hrm/departments/${id}`);
        fetchDepartments();
      } catch (error) {
        console.error('Failed to delete department:', error);
      }
    }
  };

  const handleExport = () => {
    const exportData = filteredRows.map((r, i) => ({
      '#': i + 1,
      'Dept.No': r.departmentNo,
      'Dept.Name': r.departmentName,
      'NDA Certificate': r.ndaCertificate,
      'Seq.No': r.sequenceNo,
      'Created User': r.createdBy,
      'Created Date': r.createdDate ? format(new Date(r.createdDate), 'dd-MM-yyyy HH:mm') : '',
      'Updated User': r.updatedBy,
      'Updated Date': r.updatedDate ? format(new Date(r.updatedDate), 'dd-MM-yyyy HH:mm') : '',
      Status: r.status
    }));
    exportToExcel(exportData, 'Department_Details');
  };

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      // Apply Global Filter Bar logic
      const statusFilter = globalFilters.status || 'All';
      const matchesStatus = statusFilter === 'All' || row.status === statusFilter;

      const nameFilter = globalFilters.departmentName || '';
      const matchesName = !nameFilter || (row.departmentName && row.departmentName.toLowerCase().includes(nameFilter.toLowerCase()));

      // Apply Global Search Query logic
      const matchesSearch =
        !globalQuery ||
        (row.departmentName && row.departmentName.toLowerCase().includes(globalQuery.toLowerCase())) ||
        (row.departmentNo && row.departmentNo.toString().includes(globalQuery));

      return matchesStatus && matchesName && matchesSearch;
    });
  }, [rows, globalQuery, globalFilters]);

  return (
    <MainCard
      title={
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <IconBuilding size={24} />
          <Typography variant="h3">Department Master</Typography>
        </Stack>
      }
      secondary={
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Tooltip title="Refresh">
            <IconButton onClick={fetchDepartments} color="primary" size="small">
              <IconRefresh size={20} />
            </IconButton>
          </Tooltip>
          <AnimateButton>
            <Button variant="contained" color="primary" startIcon={<IconPlus size={18} />} onClick={handleOpenAdd} sx={{ borderRadius: 2 }}>
              Add Department
            </Button>
          </AnimateButton>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<IconFileDownload size={18} />}
            onClick={handleExport}
            sx={{ borderRadius: 2 }}
          >
            Export
          </Button>
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
        <Table stickyHeader aria-label="department table" size="small">
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
              <TableCell
                sx={{
                  bgcolor: '#f5f7fa',
                  color: '#455a64',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  py: 1.5,
                  textAlign: 'center',
                  borderBottom: '2px solid',
                  borderColor: 'primary.main',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05rem',
                  borderRight: '1px solid',
                  borderColor: 'divider'
                }}
              >
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length + 1} align="center" sx={{ py: 3 }}>
                  Loading...
                </TableCell>
              </TableRow>
            ) : filteredRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + 1} align="center" sx={{ py: 3 }}>
                  No records found
                </TableCell>
              </TableRow>
            ) : (
              filteredRows.slice(page * size, page * size + size).map((row, idx) => (
                <Tooltip key={row.id} title="Double tap to view details" placement="top" followCursor arrow>
                  <TableRow
                    hover
                    onDoubleClick={() => handleOpenView(row)}
                    sx={{
                      cursor: 'pointer',
                      '&:nth-of-type(even)': { bgcolor: '#fafafa' },
                      '&:hover': { bgcolor: '#f0f7ff !important' }
                    }}
                  >
                    <TableCell sx={{ color: 'primary.main', fontWeight: 600, borderRight: '1px solid #eee' }}>
                      {page * size + idx + 1}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#37474f', borderRight: '1px solid #eee' }}>{row.departmentNo}</TableCell>
                    <TableCell sx={{ fontWeight: 500, borderRight: '1px solid #eee' }}>{row.departmentName}</TableCell>
                    <TableCell sx={{ borderRight: '1px solid #eee' }}>{row.ndaCertificate}</TableCell>
                    <TableCell sx={{ borderRight: '1px solid #eee' }}>{row.sequenceNo}</TableCell>
                    <TableCell sx={{ borderRight: '1px solid #eee' }}>{row.createdBy || '-'}</TableCell>
                    <TableCell sx={{ borderRight: '1px solid #eee' }}>
                      {row.createdDate ? format(new Date(row.createdDate), 'dd-MM-yyyy HH:mm') : '-'}
                    </TableCell>
                    <TableCell sx={{ borderRight: '1px solid #eee' }}>{row.updatedBy || '-'}</TableCell>
                    <TableCell sx={{ borderRight: '1px solid #eee' }}>
                      {row.updatedDate ? format(new Date(row.updatedDate), 'dd-MM-yyyy HH:mm') : '-'}
                    </TableCell>
                    <TableCell sx={{ borderRight: '1px solid #eee' }}>
                      <Chip
                        label={row.status}
                        size="small"
                        sx={{
                          bgcolor: row.status === 'Active' ? '#e8f5e9' : '#ffebee',
                          color: row.status === 'Active' ? '#2e7d32' : '#c62828',
                          fontWeight: 700
                        }}
                      />
                    </TableCell>
                    <TableCell align="center" sx={{ borderRight: '1px solid #eee' }}>
                      <Stack direction="row" justifyContent="center" spacing={1}>
                        <Tooltip title="Edit">
                          <IconButton
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenEdit(row);
                            }}
                            size="small"
                            sx={{
                              color: 'primary.main',
                              bgcolor: '#e3f2fd',
                              '&:hover': { bgcolor: 'primary.main', color: '#fff' }
                            }}
                          >
                            <IconEdit size={16} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(row.id);
                            }}
                            size="small"
                            sx={{
                              color: 'error.main',
                              bgcolor: '#ffebee',
                              '&:hover': { bgcolor: 'error.main', color: '#fff' }
                            }}
                          >
                            <IconTrash size={16} />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                </Tooltip>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <Box sx={{ p: 0.5, display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid', borderColor: 'divider' }}>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={filteredRows.length}
          rowsPerPage={size}
          page={page}
          onPageChange={(e, p) => setPage(p)}
          onRowsPerPageChange={(e) => {
            setSize(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </Box>

      <AddDepartmentDialog open={dialogOpen} handleClose={handleCloseDialog} initialData={selectedRow} readOnly={isReadOnly} />
    </MainCard>
  );
}
