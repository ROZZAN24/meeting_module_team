import React, { useEffect, useState } from 'react';

// material-ui
import {
  Box,
  Grid,
  Typography,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  Avatar,
  Stack,
  LinearProgress,
  Button,
  useTheme,
  Tooltip,
  Snackbar,
  Alert
} from '@mui/material';
import { alpha } from '@mui/material/styles';

// third-party
import Chart from 'react-apexcharts';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import axios from 'utils/axios';
import { useDispatch, useSelector } from 'react-redux';
import { setFilterConfig, resetFilters } from 'store/slices/search';

// assets
import HistoryIcon from '@mui/icons-material/History';
import PersonIcon from '@mui/icons-material/Person';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import DownloadIcon from '@mui/icons-material/Download';
import FilePresentIcon from '@mui/icons-material/FilePresent';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import TableViewIcon from '@mui/icons-material/TableView';
import RefreshIcon from '@mui/icons-material/Refresh';

// ==============================|| MINI CHART CARD ||============================== //

const HeaderStatCard = ({ title, count, color, icon }) => {
  const theme = useTheme();

  const chartOptions = {
    chart: { type: 'area', sparkline: { enabled: true }, animations: { enabled: false } },
    stroke: { curve: 'smooth', width: 2 },
    fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0 } },
    colors: [color],
    tooltip: { enabled: false }
  };

  return (
    <Paper elevation={0} sx={{
      p: 1.2,
      width: 140,
      height: 75,
      borderRadius: '12px',
      bgcolor: '#fff',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mb: 0.5 }}>
        <Box sx={{ color: 'text.secondary', display: 'flex' }}>{icon}</Box>
        <Typography variant="caption" sx={{ fontSize: '0.65rem', fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase' }}>
          {title}
        </Typography>
      </Stack>
      <Typography variant="h3" sx={{ fontWeight: 800, color: 'text.primary', zIndex: 1 }}>{count}</Typography>
      <Box sx={{ position: 'absolute', bottom: -5, left: 0, right: 0, height: 35 }}>
        <Chart options={chartOptions} series={[{ data: [10, 15, 8, 22, 14, 25, 18] }]} type="area" height={40} />
      </Box>
    </Paper>
  );
};

// ==============================|| FILE TRACEABILITY HUB PAGE ||============================== //

const API_BASE = (import.meta.env.VITE_APP_API_URL || 'http://localhost:8081').replace(/\/+$/, '');

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const FileTraceabilityHub = () => {
  const theme = useTheme();
  const dispatch = useDispatch();

  const globalSearch = useSelector((state) => state.search.query);
  const globalFilters = useSelector((state) => state.search.filters);

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    const traceFilterConfig = [
      { id: 'pageName', label: 'Page Name', type: 'text', isStarred: true },
      { id: 'reportName', label: 'Report Name', type: 'text', isStarred: true },
      { id: 'createdBy', label: 'User ID', type: 'text' },
      { id: 'singleDate', label: 'Single Date', type: 'date', isStarred: true },
      { id: 'startDate', label: 'Start Date', type: 'date', isStarred: true },
      { id: 'endDate', label: 'End Date', type: 'date', isStarred: true }
    ];
    dispatch(setFilterConfig(traceFilterConfig));
    loadLogs();
    return () => {
      dispatch(setFilterConfig(null));
      dispatch(resetFilters());
    };
  }, [dispatch]);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/file-traceability?_t=${new Date().getTime()}`);
      setLogs(response.data);
    } catch (error) {
      console.error('Error loading file traceability logs:', error);
      setSnackbar({ open: true, message: 'Failed to load file traceability logs', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

  // Filtering Logic
  const filteredLogs = logs.filter((log) => {
    const matchesSearch = !globalSearch ||
      (log.pageName && log.pageName.toLowerCase().includes(globalSearch.toLowerCase())) ||
      (log.reportName && log.reportName.toLowerCase().includes(globalSearch.toLowerCase())) ||
      (log.createdBy && log.createdBy.toLowerCase().includes(globalSearch.toLowerCase()));

    const matchesPage = !globalFilters.pageName || (log.pageName && log.pageName.toLowerCase().includes(globalFilters.pageName.toLowerCase()));
    const matchesReport = !globalFilters.reportName || (log.reportName && log.reportName.toLowerCase().includes(globalFilters.reportName.toLowerCase()));
    const matchesUser = !globalFilters.createdBy || (log.createdBy && log.createdBy.toLowerCase().includes(globalFilters.createdBy.toLowerCase()));

    // Date Filtering
    if (!log.createdAt) return matchesSearch && matchesPage && matchesReport && matchesUser;

    const logDate = new Date(log.createdAt);
    logDate.setHours(0, 0, 0, 0);

    let matchesSingleDate = true;
    if (globalFilters.singleDate) {
      const single = new Date(globalFilters.singleDate);
      single.setHours(0, 0, 0, 0);
      matchesSingleDate = logDate.getTime() === single.getTime();
    }

    let matchesStartDate = true;
    if (globalFilters.startDate) {
      const start = new Date(globalFilters.startDate);
      start.setHours(0, 0, 0, 0);
      matchesStartDate = logDate >= start;
    }

    let matchesEndDate = true;
    if (globalFilters.endDate) {
      const end = new Date(globalFilters.endDate);
      end.setHours(0, 0, 0, 0);
      matchesEndDate = logDate <= end;
    }

    return matchesSearch && matchesPage && matchesReport && matchesUser && matchesSingleDate && matchesStartDate && matchesEndDate;
  });

  const pagedLogs = filteredLogs.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  // Statistics
  const totalCount = logs.length;
  const excelCount = logs.filter(l => l.reportName && (l.reportName.toLowerCase().endsWith('.xls') || l.reportName.toLowerCase().endsWith('.xlsx'))).length;
  const pdfCount = logs.filter(l => l.reportName && l.reportName.toLowerCase().endsWith('.pdf')).length;
  const otherCount = totalCount - excelCount - pdfCount;
  const uniqueUsers = new Set(logs.map(l => l.createdBy).filter(Boolean)).size;

  const getFileIcon = (reportName) => {
    if (!reportName) return <FilePresentIcon color="action" />;
    const lower = reportName.toLowerCase();
    if (lower.endsWith('.xls') || lower.endsWith('.xlsx')) {
      return <TableViewIcon sx={{ color: '#2e7d32' }} />;
    } else if (lower.endsWith('.pdf')) {
      return <PictureAsPdfIcon sx={{ color: '#d32f2f' }} />;
    }
    return <FilePresentIcon color="primary" />;
  };

  return (
    <Box sx={{ p: 0 }}>
      {/* ── HEADER BANNER ── */}
      <Paper sx={{
        p: 3, mb: 2, borderRadius: '16px',
        background: 'linear-gradient(90deg, #673ab7 0%, #512da8 100%)',
        color: '#fff', position: 'relative'
      }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ width: '100%' }}>
          {/* Left Side: Branding */}
          <Box>
            <Typography variant="h2" sx={{ color: '#fff', fontWeight: 800 }}>File Traceability Hub</Typography>
            <Typography variant="subtitle2" sx={{ color: alpha('#fff', 0.8), mt: 0.5 }}>
              Comprehensive log tracking and auditing for exported documents (Excel, PDF) across system modules
            </Typography>
          </Box>

          {/* Right Side: Stats & Actions */}
          <Stack direction="row" spacing={1.5} alignItems="center">
            <HeaderStatCard title="Excel Exports" count={excelCount} color={theme.palette.success.main} icon={<TableViewIcon sx={{ fontSize: 10 }} />} />
            <HeaderStatCard title="PDF Exports" count={pdfCount} color={theme.palette.error.main} icon={<PictureAsPdfIcon sx={{ fontSize: 10 }} />} />
            <HeaderStatCard title="Active Users" count={uniqueUsers} color={theme.palette.info.main} icon={<PersonIcon sx={{ fontSize: 10 }} />} />
            <HeaderStatCard title="Total Exports" count={totalCount} color={theme.palette.primary.main} icon={<DownloadIcon sx={{ fontSize: 10 }} />} />

            <Button
              variant="contained"
              onClick={loadLogs}
              startIcon={<RefreshIcon />}
              sx={{
                height: 75, px: 3, borderRadius: '12px',
                bgcolor: '#8e24aa', color: '#fff',
                boxShadow: '0 4px 14px 0 rgba(142,36,170,0.39)',
                '&:hover': { bgcolor: '#7b1fa2', boxShadow: '0 6px 20px rgba(142,36,170,0.23)' },
                textTransform: 'none', fontWeight: 700, fontSize: '1rem'
              }}
            >
              Refresh
            </Button>
          </Stack>
        </Stack>
      </Paper>

      {/* ── DATA TABLE ── */}
      <MainCard sx={{ borderRadius: '16px' }} content={false}>
        <TableContainer sx={{ maxHeight: 'calc(100vh - 300px)', minHeight: '400px' }}>
          {loading && <LinearProgress sx={{ height: 2 }} />}
          <Table stickyHeader>
            <TableHead>
              <TableRow sx={{ '& th': { fontWeight: 800, color: 'text.primary', borderBottom: '2px solid', borderColor: 'divider' } }}>
                <TableCell>Row ID</TableCell>
                <TableCell>Timeline Details</TableCell>
                <TableCell>Page Context</TableCell>
                <TableCell>Report File Name</TableCell>
                <TableCell>Exported By</TableCell>
                <TableCell align="center">Format</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pagedLogs.map((log) => {
                const isExcel = log.reportName && (log.reportName.toLowerCase().endsWith('.xls') || log.reportName.toLowerCase().endsWith('.xlsx'));
                const isPdf = log.reportName && log.reportName.toLowerCase().endsWith('.pdf');

                return (
                  <TableRow key={log.rowId} hover sx={{ '& td': { py: 1.5 } }}>
                    <TableCell>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>#{log.rowId}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        {log.createdAt ? new Date(log.createdAt).toLocaleTimeString() : 'N/A'}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {log.createdAt ? formatDate(log.createdAt) : ''}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'primary.dark' }}>
                          {log.pageName || 'Unknown Page'}
                        </Typography>
                        {(log.pageId || log.page?.pageId) && (
                          <Typography variant="caption" color="textSecondary">
                            Page ID: {log.pageId || log.page?.pageId}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.08), width: 34, height: 34 }}>
                          {getFileIcon(log.reportName)}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                            {log.reportName || 'export_document'}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Avatar sx={{ width: 28, height: 28, bgcolor: theme.palette.secondary.main, fontSize: '0.8rem' }}>
                          {log.createdBy ? log.createdBy.charAt(0).toUpperCase() : 'U'}
                        </Avatar>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                          {log.createdBy || 'System User'}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={isExcel ? 'EXCEL' : isPdf ? 'PDF' : 'DOC'}
                        size="small"
                        sx={{
                          fontWeight: 800, fontSize: '0.65rem',
                          bgcolor: isExcel ? alpha(theme.palette.success.main, 0.1) :
                            isPdf ? alpha(theme.palette.error.main, 0.1) : alpha(theme.palette.primary.main, 0.1),
                          color: isExcel ? 'success.main' :
                            isPdf ? 'error.main' : 'primary.main'
                        }}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
              {pagedLogs.length === 0 && !loading && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                    <Typography variant="h4" color="textSecondary" sx={{ fontWeight: 600 }}>
                      No Export Events Logged
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Whenever excel or pdf files are exported, they will appear here.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ p: '1px', display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid', borderColor: 'divider' }}>
          <TablePagination
            component="div"
            count={filteredLogs.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(e, p) => setPage(p)}
            onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
            sx={{ '& .MuiTablePagination-toolbar': { minHeight: '34px', p: '0 8px' } }}
          />
        </Box>
      </MainCard>

      {/* ── NOTIFICATION SNACKBAR ── */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} variant="filled" sx={{ width: '100%', borderRadius: '8px', fontWeight: 600 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default FileTraceabilityHub;
