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
  Checkbox
} from '@mui/material';
import { IconPlus, IconEdit, IconTrash, IconFileDownload, IconListCheck } from '@tabler/icons-react';
import axios from 'utils/axios';
import MainCard from 'ui-component/cards/MainCard';
import AddAuditTypeDialog from './AddAuditTypeDialog';
import { exportToExcel } from 'utils/excelExport';
import AnimateButton from 'ui-component/extended/AnimateButton';
import { format } from 'date-fns';
import { useDispatch, useSelector } from 'react-redux';
import { setFilterConfig } from 'store/slices/search';

const columns = [
  { id: 'index', label: '#', minWidth: 50 },
  { id: 'auditType', label: 'Audit Type', minWidth: 150 },
  { id: 'standard', label: 'Standard', minWidth: 120 },
  { id: 'description', label: 'Description', minWidth: 200 },
  { id: 'criteriaMinCount', label: 'Min Count', minWidth: 100 },
  { id: 'customerAuditArea', label: 'Cust. Audit Area', minWidth: 120 },
  { id: 'auditArea', label: 'Audit Area', minWidth: 150 },
  { id: 'criteriaType', label: 'Audit Criteria Type', minWidth: 150 },
  { id: 'status', label: 'Status', minWidth: 100 },
  { id: 'createdBy', label: 'Created User', minWidth: 120 },
  { id: 'createdDate', label: 'Created Date', minWidth: 150 },
  { id: 'updatedBy', label: 'Updated User', minWidth: 120 },
  { id: 'updatedDate', label: 'Updated Date', minWidth: 150 }
];

export default function AuditTypeMaster() {
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
  const [totalElements, setTotalElements] = useState(0);
  const [selectedIds, setSelectedIds] = useState([]);

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
        id: 'standard',
        label: 'Standard',
        type: 'text',
        placeholder: 'Filter by Standard...'
      }
    ];
    dispatch(setFilterConfig(config));

    // Cleanup on unmount
    return () => dispatch(setFilterConfig(null));
  }, [dispatch]);

  const fetchAuditTypes = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/master/qms/audit-type', {
        params: {
          page: page,
          size: size,
          search: globalQuery,
          status: globalFilters?.status === 'All' ? '' : globalFilters?.status
        }
      });
      setRows(response.data.content);
      setTotalElements(response.data.totalElements);
    } catch (error) {
      console.error('Failed to fetch audit types:', error);
      setRows([
        {
          id: 1,
          auditType: 'Internal Audit',
          standard: 'ISO 9001',
          description: 'Internal quality assessment',
          createdBy: 'Admin',
          createdDate: new Date(),
          updatedBy: 'Admin',
          updatedDate: new Date(),
          status: 'ACTIVE'
        },
        {
          id: 2,
          auditType: 'External Audit',
          standard: 'AS9100',
          description: 'Third party certification',
          createdBy: 'System',
          createdDate: new Date(),
          updatedBy: 'Admin',
          updatedDate: new Date(),
          status: 'ACTIVE'
        }
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAuditTypes();
  }, [fetchAuditTypes]);

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
      fetchAuditTypes();
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this audit type?')) {
      try {
        await axios.delete(`/api/qms/audit-types/${id}`);
        fetchAuditTypes();
      } catch (error) {
        console.error('Failed to delete audit type:', error);
      }
    }
  };

  const handleExport = () => {
    const exportData = filteredRows.map((r, i) => ({
      '#': i + 1,
      'Audit Type': r.auditType,
      Standard: r.standard,
      Description: r.description,
      'Created User': r.createdBy,
      'Created Date': r.createdDate ? format(new Date(r.createdDate), 'dd-MM-yyyy HH:mm') : '',
      'Updated User': r.updatedBy,
      'Updated Date': r.updatedDate ? format(new Date(r.updatedDate), 'dd-MM-yyyy HH:mm') : '',
      Status: r.status
    }));
    exportToExcel(exportData, 'Audit_Type_Details');
  };

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      // Apply Global Filter Bar logic
      const statusFilter = globalFilters.status || 'All';
      const matchesStatus = statusFilter === 'All' || row.status === statusFilter;

      const standardFilter = globalFilters.standard || '';
      const matchesStandard = !standardFilter || (row.standard && row.standard.toLowerCase().includes(standardFilter.toLowerCase()));

      // Apply Global Search Query logic
      const matchesSearch =
        !globalQuery ||
        (row.auditType && row.auditType.toLowerCase().includes(globalQuery.toLowerCase())) ||
        (row.standard && row.standard.toLowerCase().includes(globalQuery.toLowerCase()));

      return matchesStatus && matchesStandard && matchesSearch;
    });
  }, [rows, globalQuery, globalFilters]);

  return (
    <MainCard
      title={
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <IconListCheck size={24} />
          <Typography variant="h3">Audit Type Master</Typography>
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
              Add Audit Type
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
        <Table stickyHeader aria-label="audit types table" size="small">
          <TableHead>
            <TableRow>
              <TableCell
                padding="checkbox"
                sx={{
                  bgcolor: '#f5f7fa',
                  borderBottom: '2px solid',
                  borderColor: 'primary.main',
                  borderRight: '1px solid',
                  borderColor: 'divider'
                }}
              >
                <Checkbox
                  size="small"
                  indeterminate={selectedIds.length > 0 && selectedIds.length < rows.length}
                  checked={rows.length > 0 && selectedIds.length === rows.length}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedIds(rows.map((r) => r.id));
                    } else {
                      setSelectedIds([]);
                    }
                  }}
                />
              </TableCell>
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
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + 1} align="center" sx={{ py: 3 }}>
                  No records found.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row, idx) => (
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
                    <TableCell padding="checkbox" sx={{ borderRight: '1px solid #eee' }}>
                      <Checkbox
                        size="small"
                        checked={selectedIds.indexOf(row.id) > -1}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedIds((prev) => [...prev, row.id]);
                          } else {
                            setSelectedIds((prev) => prev.filter((id) => id !== row.id));
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ color: 'primary.main', fontWeight: 600, borderRight: '1px solid #eee' }}>
                      {page * size + idx + 1}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#37474f', borderRight: '1px solid #eee' }}>{row.auditType}</TableCell>
                    <TableCell sx={{ fontWeight: 500, borderRight: '1px solid #eee' }}>{row.standard}</TableCell>
                    <TableCell
                      sx={{
                        borderRight: '1px solid #eee',
                        maxWidth: 250,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {row.description}
                    </TableCell>
                    <TableCell sx={{ borderRight: '1px solid #eee' }}>{row.criteriaMinCount}</TableCell>
                    <TableCell sx={{ borderRight: '1px solid #eee' }}>{row.customerAuditArea}</TableCell>
                    <TableCell sx={{ borderRight: '1px solid #eee' }}>{row.auditArea}</TableCell>
                    <TableCell sx={{ borderRight: '1px solid #eee' }}>{row.criteriaType}</TableCell>
                    <TableCell sx={{ borderRight: '1px solid #eee' }}>
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
                    <TableCell sx={{ borderRight: '1px solid #eee' }}>{row.createdBy || '-'}</TableCell>
                    <TableCell sx={{ borderRight: '1px solid #eee' }}>
                      {row.createdDate ? format(new Date(row.createdDate), 'dd-MM-yyyy HH:mm') : '-'}
                    </TableCell>
                    <TableCell sx={{ borderRight: '1px solid #eee' }}>{row.updatedBy || '-'}</TableCell>
                    <TableCell sx={{ borderRight: '1px solid #eee' }}>
                      {row.updatedDate ? format(new Date(row.updatedDate), 'dd-MM-yyyy HH:mm') : '-'}
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
          count={totalElements}
          rowsPerPage={size}
          page={page}
          onPageChange={(e, p) => setPage(p)}
          onRowsPerPageChange={(e) => {
            setSize(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </Box>

      <AddAuditTypeDialog open={dialogOpen} handleClose={handleCloseDialog} initialData={selectedRow} readOnly={isReadOnly} />
    </MainCard>
  );
}
