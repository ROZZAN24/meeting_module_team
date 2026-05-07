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
  Stack,
  useTheme,
  Chip,
  Link
} from '@mui/material';
import { IconPlus, IconEdit, IconTrash, IconFileDownload, IconChecks } from '@tabler/icons-react';
import axios from 'utils/axios';
import MainCard from 'ui-component/cards/MainCard';
import AddAuditCriteriaDialog from './AddAuditCriteriaDialog';
import { exportToExcel } from 'utils/excelExport';
import AnimateButton from 'ui-component/extended/AnimateButton';
import { format } from 'date-fns';
import { useDispatch, useSelector } from 'react-redux';
import { setFilterConfig } from 'store/slices/search';

const columns = [
  { id: 'seqNo', label: 'Seq No', minWidth: 80 },
  { id: 'clause', label: 'Clause', minWidth: 100 },
  { id: 'auditType', label: 'Type', minWidth: 120 },
  { id: 'criteriaText', label: 'Criteria', minWidth: 250 },
  { id: 'department', label: 'Department', minWidth: 120 },
  { id: 'createdBy', label: 'Created User', minWidth: 120 },
  { id: 'createdDate', label: 'Created Date', minWidth: 150 },
  { id: 'updatedBy', label: 'Updated User', minWidth: 120 },
  { id: 'updatedDate', label: 'Updated Date', minWidth: 150 },
  { id: 'attachmentRequired', label: 'Attachment Req', minWidth: 120 },
  { id: 'status', label: 'Status', minWidth: 100 }
];

export default function AuditCriteriaMaster() {
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
  const [nextSeq, setNextSeq] = useState('1');

  // Set Global Search Config on Mount
  useEffect(() => {
    const config = [
      {
        id: 'status',
        label: 'Status',
        type: 'select',
        options: [
          { value: 'All', label: 'ALL' },
          { value: 'ACTIVE', label: 'ACTIVE' },
          { value: 'INACTIVE', label: 'INACTIVE' }
        ],
        defaultValue: 'ACTIVE'
      },
      {
        id: 'auditType',
        label: 'Audit Type',
        type: 'text',
        placeholder: 'Search by Type...'
      },
      {
        id: 'clause',
        label: 'Clause',
        type: 'text',
        placeholder: 'Search by Clause...'
      },
      {
        id: 'department',
        label: 'Department',
        type: 'text',
        placeholder: 'Search by Department...'
      }
    ];
    dispatch(setFilterConfig(config));

    // Cleanup on unmount
    return () => dispatch(setFilterConfig(null));
  }, [dispatch]);

  const fetchAuditCriteria = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/master/qms/audit-criteria');
      setRows(response.data);
    } catch (error) {
      console.error('Failed to fetch audit criteria:', error);
      // Mock data matching screenshot
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAuditCriteria();
  }, [fetchAuditCriteria]);

  const handleOpenAdd = async () => {
    setSelectedRow(null);
    setIsReadOnly(false);
    try {
      const res = await axios.get('/api/qms/audit-criteria/next-seq');
      setNextSeq(res.data);
    } catch (e) {
      setNextSeq('1');
    }
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
      fetchAuditCriteria();
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this audit criteria?')) {
      try {
        await axios.delete(`/api/master/qms/audit-criteria/${id}`);
        fetchAuditCriteria();
      } catch (error) {
        console.error('Failed to delete audit criteria:', error);
      }
    }
  };

  const handleExport = () => {
    const exportData = filteredRows.map((r, i) => ({
      '#': i + 1,
      'Audit Type': r.auditType,
      Standard: r.standard,
      Type: r.criteriaType,
      Description: r.description,
      'Created User': r.createdBy,
      'Created Date': r.createdDate ? format(new Date(r.createdDate), 'dd-MM-yyyy HH:mm') : '',
      'Updated User': r.updatedBy,
      'Updated Date': r.updatedDate ? format(new Date(r.updatedDate), 'dd-MM-yyyy HH:mm') : '',
      Status: r.status
    }));
    exportToExcel(exportData, 'Audit_Criteria_Details');
  };

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      // Apply Global Filter Bar logic
      const statusFilter = globalFilters.status || 'All';
      const matchesStatus = statusFilter === 'All' || row.status === statusFilter;

      const auditTypeFilter = globalFilters.auditType || '';
      const matchesAuditType = !auditTypeFilter || (row.auditType && row.auditType.toLowerCase().includes(auditTypeFilter.toLowerCase()));

      const clauseFilter = globalFilters.clause || '';
      const matchesClause = !clauseFilter || (row.clause && row.clause.toLowerCase().includes(clauseFilter.toLowerCase()));

      const departmentFilter = globalFilters.department || '';
      const matchesDepartment =
        !departmentFilter || (row.department && row.department.toLowerCase().includes(departmentFilter.toLowerCase()));

      // Apply Global Search Query logic
      const matchesSearch =
        !globalQuery ||
        (row.criteriaText && row.criteriaText.toLowerCase().includes(globalQuery.toLowerCase())) ||
        (row.auditType && row.auditType.toLowerCase().includes(globalQuery.toLowerCase()));

      return matchesStatus && matchesAuditType && matchesClause && matchesDepartment && matchesSearch;
    });
  }, [rows, globalQuery, globalFilters]);

  return (
    <MainCard
      title={
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <IconChecks size={24} />
          <Typography variant="h3">Audit Criteria Master</Typography>
        </Stack>
      }
      secondary={
        <Stack direction="row" spacing={1.5}>
          <Button
            variant="outlined"
            color="primary"
            size="medium"
            startIcon={<IconFileDownload size={18} />}
            onClick={handleExport}
            sx={{
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 600,
              borderWidth: '2px',
              '&:hover': { borderWidth: '2px', bgcolor: 'primary.50' }
            }}
          >
            Export Excel
          </Button>
          <Button
            variant="contained"
            color="primary"
            size="medium"
            onClick={handleOpenAdd}
            sx={{
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 600,
              boxShadow: 2,
              transition: 'all 0.2s',
              '&:hover': { transform: 'translateY(-2px)', boxShadow: 4 }
            }}
          >
            + New
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
          boxShadow: 3,
          borderRadius: '16px',
          overflow: 'auto',
          '&::-webkit-scrollbar': { width: 8, height: 8 },
          '&::-webkit-scrollbar-track': { backgroundColor: 'transparent' },
          '&::-webkit-scrollbar-thumb': { backgroundColor: 'grey.300', borderRadius: 4, '&:hover': { backgroundColor: 'grey.500' } }
        }}
      >
        <Table stickyHeader aria-label="audit criteria table" size="small">
          <TableHead>
            <TableRow>
              {columns.map((col) => (
                <TableCell
                  key={col.id}
                  sx={{
                    bgcolor: 'primary.dark',
                    color: 'primary.light',
                    fontWeight: 600,
                    fontSize: '0.8rem',
                    py: 2,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    borderBottom: 'none',
                    whiteSpace: 'nowrap',
                    '&:first-of-type': { borderTopLeftRadius: '16px' }
                  }}
                >
                  {col.label}
                </TableCell>
              ))}
              <TableCell
                sx={{
                  bgcolor: 'primary.dark',
                  color: 'primary.light',
                  fontWeight: 600,
                  fontSize: '0.8rem',
                  py: 2,
                  textAlign: 'center',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  borderBottom: 'none',
                  whiteSpace: 'nowrap',
                  borderTopRightRadius: '16px'
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
                  No records found.
                </TableCell>
              </TableRow>
            ) : (
              filteredRows.slice(page * size, page * size + size).map((row, idx) => (
                <Tooltip key={row.id} title="Double tap to edit" placement="top" followCursor arrow>
                  <TableRow
                    hover
                    onDoubleClick={() => handleOpenEdit(row)}
                    sx={{
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      '& td': { borderBottom: '1px solid', borderColor: 'divider', py: 1.5 },
                      '&:nth-of-type(even)': { bgcolor: theme.palette.mode === 'dark' ? '#161b22' : '#fafafa' },
                      '&:hover': {
                        bgcolor: theme.palette.mode === 'dark' ? '#30363d !important' : 'grey.50 !important',
                        transform: 'translateY(-1px)',
                        boxShadow: 1
                      }
                    }}
                  >
                    <TableCell sx={{ color: 'primary.main', fontWeight: 600 }}>
                      {row.seqNo || page * size + idx + 1}
                    </TableCell>
                    <TableCell>{row.clause || '-'}</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#37474f' }}>{row.auditType}</TableCell>
                    <TableCell>
                      <Link
                        component="button"
                        variant="body2"
                        onClick={() => handleOpenEdit(row)}
                        sx={{
                          textAlign: 'left',
                          textDecoration: 'none',
                          color: 'secondary.main',
                          fontWeight: 500,
                          '&:hover': { textDecoration: 'underline' }
                        }}
                      >
                        {row.criteriaText}
                      </Link>
                    </TableCell>
                    <TableCell>{row.department}</TableCell>
                    <TableCell>{row.createdBy || '-'}</TableCell>
                    <TableCell>
                      {row.createdDate ? format(new Date(row.createdDate), 'dd-MM-yyyy HH:mm') : '-'}
                    </TableCell>
                    <TableCell>{row.updatedBy || '-'}</TableCell>
                    <TableCell>
                      {row.updatedDate ? format(new Date(row.updatedDate), 'dd-MM-yyyy HH:mm') : '-'}
                    </TableCell>
                    <TableCell>{row.attachmentRequired || '-'}</TableCell>
                    <TableCell>
                      <Chip
                        label={row.status}
                        size="small"
                        sx={{
                          bgcolor: row.status === 'ACTIVE' ? '#e8f5e9' : '#ffebee',
                          color: row.status === 'ACTIVE' ? '#2e7d32' : '#c62828',
                          fontWeight: 700
                        }}
                      />
                    </TableCell>
                    <TableCell align="center">
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

      <AddAuditCriteriaDialog
        open={dialogOpen}
        handleClose={handleCloseDialog}
        initialData={selectedRow}
        readOnly={isReadOnly}
        nextSeq={nextSeq}
      />
    </MainCard>
  );
}
