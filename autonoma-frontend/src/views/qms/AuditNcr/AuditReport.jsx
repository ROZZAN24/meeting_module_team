import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Typography, 
  Stack, 
  Tooltip, 
  IconButton, 
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  Box,
  alpha
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { IconReport, IconFileText } from '@tabler/icons-react';
import axios from 'utils/axios';
import MainCard from 'ui-component/cards/MainCard';
import { format } from 'date-fns';
import { useDispatch, useSelector } from 'react-redux';
import { setFilterConfig } from 'store/slices/search';
import { openSnackbar } from 'store/slices/snackbar';
import { BOSTableToolbar, getCommonDateFilters, matchCommonDateFilters, tableHeadCellSx } from 'ui-component/bos';
import usePagePermissions, { PAGE_CODES } from 'hooks/usePagePermissions';
import useLookups from 'hooks/useLookups';
import { API_PATHS } from 'utils/api-constants';

const columns = [
  { id: 'index', label: 'Sl.No', minWidth: 60, align: 'center' },
  { id: 'auditType', label: 'Audit Type', minWidth: 150 },
  { id: 'scheduleNo', label: 'Schedule No', minWidth: 130 },
  { id: 'scheduleDate', label: 'Schedule Date', minWidth: 120, align: 'center' },
  { id: 'observationNo', label: 'Observation No', minWidth: 130, bold: true },
  { id: 'observationDate', label: 'Observation Date', minWidth: 120, align: 'center' },
  { id: 'status', label: 'Status', minWidth: 100, align: 'center' },
  { id: 'pdf', label: 'Pdf', minWidth: 80, align: 'center' },
  { id: 'auditCriteria', label: 'Audit Criteria', minWidth: 450 },
  { id: 'observationStatus', label: 'Observation Status', minWidth: 180, align: 'center' }
];

export default function AuditReport() {
  const dispatch = useDispatch();
  const theme = useTheme();
  const perms = usePagePermissions(PAGE_CODES.QMS_AUDIT_REPORT);

  const globalQuery = useSelector((state) => state.search.query);
  const globalFilters = useSelector((state) => state.search.filters) || {};

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);

  const { auditSchedules = [] } = useLookups(['AUDIT_SCHEDULE']);

  const [filterOptions, setFilterOptions] = useState({
    employees: [],
    auditTypes: []
  });

  // Fetch filter options dynamically from appropriate master pages
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [empRes, typeRes] = await Promise.all([
          axios.get('/api/master/hr/employees/filter/active'),
          axios.get(API_PATHS.QMS.AUDIT_TYPE)
        ]);

        const employees = empRes.data || [];
        const types = typeRes.data || [];

        const getEmpLabel = (emp) => {
          const fName = emp.firstName || '';
          const lName = emp.lastName || '';
          const empName = emp.employeeName || '';
          let name = '';
          if (fName && lName) {
            name = `${fName} ${lName}`.trim();
          } else if (empName && lName && !empName.toLowerCase().includes(lName.toLowerCase())) {
            name = `${empName} ${lName}`.trim();
          } else if (empName) {
            name = empName;
          } else {
            name = `${fName} ${lName}`.trim();
          }
          return `${name} - ${emp.empCode || emp.employeeCode || emp.id}`;
        };

        const employeesOptions = employees.map(e => ({
          value: getEmpLabel(e),
          label: getEmpLabel(e).split(' - ')[0]
        }));

        const auditTypesOptions = types.map(t => ({ value: t.auditType, label: t.auditType }));

        setFilterOptions({
          employees: employeesOptions,
          auditTypes: auditTypesOptions
        });
      } catch (err) {
        console.error('Failed to fetch filter options:', err);
      }
    };

    fetchOptions();
  }, []);

  // Set filter config in Redux
  useEffect(() => {
    dispatch(setFilterConfig([
      { 
        id: 'status', 
        label: 'Status', 
        type: 'select', 
        isStarred: true, 
        options: [
          { value: 'All', label: 'ALL' },
          { value: 'PENDING', label: 'PENDING' },
          { value: 'CLOSED', label: 'CLOSED' },
          { value: 'CANCELLED', label: 'CANCELLED' }
        ], 
        defaultValue: 'All' 
      },
      {
        id: 'filterBy',
        label: 'Filter By',
        type: 'select',
        isStarred: true,
        options: [
          { value: 'All', label: '-Select-' },
          { value: 'auditor', label: 'Auditor' },
          { value: 'auditee', label: 'Auditee' }
        ],
        defaultValue: 'All'
      },
      {
        id: 'employee',
        label: 'Employee',
        type: 'select',
        isStarred: true,
        options: [
          { value: 'All', label: 'ALL' },
          ...filterOptions.employees
        ],
        defaultValue: 'All'
      },
      {
        id: 'auditType',
        label: 'Audit Type',
        type: 'select',
        isStarred: true,
        options: [
          { value: 'All', label: 'ALL' },
          ...filterOptions.auditTypes
        ],
        defaultValue: 'All'
      },
      ...getCommonDateFilters('createdDate', 'updatedDate')
    ]));
    return () => dispatch(setFilterConfig(null));
  }, [dispatch, filterOptions]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/qms/audit/observation');
      setRows(response.data || []);
    } catch (error) {
      console.error('Failed to fetch report data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Resolve rows with master names, formats and statuses
  const resolvedRows = useMemo(() => {
    if (!Array.isArray(rows)) return [];
    return rows.map(row => {
      const schNo = row.auditScheduleNo || row.scheduleNo || '';
      const matchingSch = auditSchedules.find(s => s.scheduleNo === schNo);
      
      return {
        ...row,
        auditType: typeof row.auditType === 'object' ? row.auditType?.name : (row.auditType || row.auditTypeName || ''),
        scheduleNo: schNo,
        scheduleDate: matchingSch ? matchingSch.scheduleDate : '-',
        status: row.status === 'APPROVED' ? 'CLOSED' : (row.status === 'CANCELLED' ? 'CANCELLED' : 'PENDING'),
        createdUser: row.createdUser || row.createdBy || '-',
        updatedUser: row.updatedUser || row.updatedBy || '-'
      };
    });
  }, [rows, auditSchedules]);

  const formatDateOnly = (d) => {
    if (!d || d === '-') return '-';
    try {
      const dateObj = new Date(d);
      if (isNaN(dateObj.getTime())) return String(d);
      return format(dateObj, 'dd/MM/yyyy');
    } catch {
      return String(d);
    }
  };

  const filteredRows = useMemo(() => {
    return resolvedRows.filter(row => {
      // 1. Date filters
      if (!matchCommonDateFilters(row, globalFilters, 'createdDate', 'updatedDate')) return false;

      // 2. Status filter
      const statusFilter = globalFilters.status || 'All';
      if (statusFilter !== 'All' && row.status !== statusFilter) return false;

      // 3. Filter By & Employee filter
      const filterBy = globalFilters.filterBy || 'All';
      const employeeFilter = globalFilters.employee || 'All';
      if (filterBy !== 'All' && employeeFilter !== 'All') {
        if (filterBy === 'auditor') {
          if (!row.auditor || !row.auditor.toLowerCase().includes(employeeFilter.toLowerCase())) {
            return false;
          }
        } else if (filterBy === 'auditee') {
          if (!row.auditee || !row.auditee.toLowerCase().includes(employeeFilter.toLowerCase())) {
            return false;
          }
        }
      }

      // 4. Audit Type filter
      const auditTypeFilter = globalFilters.auditType || 'All';
      if (auditTypeFilter !== 'All') {
        if (!row.auditType || row.auditType.toLowerCase() !== auditTypeFilter.toLowerCase()) {
          return false;
        }
      }

      // 5. Search query
      const matchesSearch = !globalQuery || 
        (row.observationNo && row.observationNo.toLowerCase().includes(globalQuery.toLowerCase())) ||
        (row.departmentName && row.departmentName.toLowerCase().includes(globalQuery.toLowerCase()));

      return matchesSearch;
    });
  }, [resolvedRows, globalQuery, globalFilters]);

  const paginatedRows = useMemo(() => filteredRows.slice(page * size, page * size + size), [filteredRows, page, size]);

  return (
    <MainCard fullWidth
      title={
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <IconReport size={24} />
          <Typography variant="h3">Audit Summary Report</Typography>
        </Stack>
      }
      secondary={
        <BOSTableToolbar
          onRefresh={fetchData}
          exportData={filteredRows}
          exportFilename="Audit_Summary_Report"
          hasExportPermission={perms.export}
          columns={columns}
        />
      }
    >
      <TableContainer component={Paper} sx={{ borderRadius: '12px', border: '1px solid #cbd5e1', overflow: 'hidden', boxShadow: 'none' }}>
        <Table sx={{ minWidth: 650, borderCollapse: 'collapse', '& td, & th': { borderBottom: '1px solid #cbd5e1' } }} aria-label="audit report table">
          <TableHead>
            <TableRow>
              {columns.map((col) => (
                <TableCell 
                  key={col.id} 
                  align={col.align || 'left'} 
                  sx={{ 
                    ...tableHeadCellSx,
                    py: 1.5, 
                    borderBottom: '1px solid #cbd5e1'
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
                <TableCell colSpan={columns.length} align="center" sx={{ py: 3, fontSize: '0.825rem' }}>
                  Loading...
                </TableCell>
              </TableRow>
            ) : paginatedRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} align="center" sx={{ py: 3, fontSize: '0.825rem' }}>
                  No records found
                </TableCell>
              </TableRow>
            ) : (
              paginatedRows.map((row, rowIdx) => {
                const details = row.details && row.details.length > 0 ? row.details : [{}];
                const N = details.length;

                return details.map((d, dIdx) => {
                  const isFirst = dIdx === 0;
                  return (
                    <TableRow 
                      key={`${row.id}-${dIdx}`} 
                      sx={{ 
                        bgcolor: rowIdx % 2 === 1 ? '#fafafa' : '#ffffff',
                        '&:hover': { bgcolor: `${alpha(theme.palette.primary.main, 0.05)} !important` } 
                      }}
                    >
                      {isFirst && (
                        <>
                          <TableCell rowSpan={N} align="center" sx={{ fontSize: '0.825rem' }}>
                            {rowIdx + 1 + page * size}
                          </TableCell>
                          <TableCell rowSpan={N} sx={{ fontSize: '0.825rem' }}>
                            {row.auditType || '-'}
                          </TableCell>
                          <TableCell rowSpan={N} sx={{ fontSize: '0.825rem' }}>
                            {row.scheduleNo || '-'}
                          </TableCell>
                          <TableCell rowSpan={N} align="center" sx={{ fontSize: '0.825rem' }}>
                            {formatDateOnly(row.scheduleDate)}
                          </TableCell>
                          <TableCell rowSpan={N} sx={{ fontWeight: 600, fontSize: '0.825rem' }}>
                            {row.observationNo || '-'}
                          </TableCell>
                          <TableCell rowSpan={N} align="center" sx={{ fontSize: '0.825rem' }}>
                            {formatDateOnly(row.observationDate)}
                          </TableCell>
                          <TableCell 
                            rowSpan={N} 
                            align="center" 
                            sx={{ 
                              fontWeight: 'bold', 
                              fontSize: '0.825rem', 
                              color: row.status === 'CLOSED' ? 'success.main' : (row.status === 'CANCELLED' ? 'error.main' : 'warning.main') 
                            }}
                          >
                            {row.status}
                          </TableCell>
                          <TableCell rowSpan={N} align="center">
                            <Tooltip title="View Detailed Report (PDF)">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => dispatch(openSnackbar({ open: true, message: 'PDF Generation coming soon!', severity: 'info', variant: 'alert' }))}
                                sx={{ p: 0, '&:hover': { opacity: 0.8 } }}
                              >
                                <IconFileText size={22} color="red" />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </>
                      )}
                      <TableCell sx={{ fontSize: '0.825rem' }}>
                        {d.criteriaDetails || '-'}
                      </TableCell>
                      <TableCell 
                        align="center" 
                        sx={{ 
                          fontWeight: 'bold', 
                          fontSize: '0.825rem', 
                          color: d.observationStatus === 'COMPLIANCE' ? 'success.main' : (d.observationStatus === 'NCR' ? 'error.main' : 'warning.main') 
                        }}
                      >
                        {d.observationStatus || '-'}
                      </TableCell>
                    </TableRow>
                  );
                });
              })
            )}
          </TableBody>
        </Table>
        <Box sx={{ 
          py: 0, 
          px: 1.5, 
          minHeight: '36px',
          height: '36px',
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          alignItems: 'center',
          borderTop: '1px solid', 
          borderColor: '#cbd5e1',
          bgcolor: '#fafafa'
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }} />
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredRows.length}
              rowsPerPage={size}
              page={page}
              onPageChange={(e, newPage) => setPage(newPage)}
              onRowsPerPageChange={(e) => {
                setSize(parseInt(e.target.value, 10));
                setPage(0);
              }}
              sx={{
                minHeight: '36px !important',
                height: '36px !important',
                overflow: 'hidden',
                border: 'none',
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
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }} />
        </Box>
      </TableContainer>
    </MainCard>
  );
}
