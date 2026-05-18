import { useState, useEffect, useCallback, useMemo } from 'react';
import { Typography, Stack, Button, Tooltip, IconButton, Chip } from '@mui/material';
import { IconReport, IconFileDownload, IconFileText, IconRefresh } from '@tabler/icons-react';
import axios from 'utils/axios';
import MainCard from 'ui-component/cards/MainCard';
import { exportToExcel } from 'utils/excelExport';
import { format } from 'date-fns';
import { useDispatch, useSelector } from 'react-redux';
import { setFilterConfig } from 'store/slices/search';
import { BOSDataTable, BOSExportButton, btnExport, getStatusChipSx } from 'ui-component/bos';

const columns = [
  { id: 'index', label: '#', minWidth: 50 },
<<<<<<< HEAD
  { id: 'observationNo', label: 'Obs No.', minWidth: 130, bold: true, required: true },
  { id: 'scheduleNo', label: 'Schedule No.', minWidth: 130, required: true },
  { id: 'observationDate', label: 'Date', minWidth: 120 },
  { id: 'auditTypeName', label: 'Audit Type', minWidth: 150, required: true },
  { id: 'status', label: 'Status', minWidth: 100 },
  { id: 'createdBy', label: 'Created By', minWidth: 120 },
  { id: 'createdDate', label: 'Created Date', minWidth: 150 },
  { id: 'updatedBy', label: 'Updated By', minWidth: 120 },
  { id: 'updatedDate', label: 'Updated Date', minWidth: 150 }
=======
  { id: 'auditType', label: 'Audit Type', minWidth: 150 },
  { id: 'observationNo', label: 'Observation No', minWidth: 150, bold: true },
  { id: 'observationDate', label: 'Observation Date', minWidth: 120 },
  { id: 'auditScheduleNo', label: 'Schedule No', minWidth: 130 },
  { id: 'status', label: 'Status', minWidth: 120 },
  { id: 'auditScore', label: 'Score', minWidth: 100 }
>>>>>>> origin/chore/repo-cleanup
];

export default function AuditReport() {
  const dispatch = useDispatch();
<<<<<<< HEAD
=======
  const globalQuery = useSelector((state) => state.search.query);
  const globalFilters = useSelector((state) => state.search.filters);
>>>>>>> origin/chore/repo-cleanup

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);

<<<<<<< HEAD
  // ── RESOLVED ROWS (SOP #16 Standard) ──
  const resolvedRows = useMemo(() => {
    if (!Array.isArray(rows)) return [];
    return rows.map(row => ({
      ...row,
      status: row.status || 'PENDING'
    }));
  }, [rows]);

  useEffect(() => {
    dispatch(setFilterConfig([
      { id: 'fromDate', label: 'From Date', type: 'date', isStarred: true, defaultValue: format(new Date().setMonth(new Date().getMonth() - 1), 'yyyy-MM-dd') },
      { id: 'toDate', label: 'To Date', type: 'date', isStarred: true, defaultValue: format(new Date(), 'yyyy-MM-dd') },
      { id: 'considerDate', label: 'Consider Date?', type: 'select', isStarred: true, options: [{ value: 'Yes', label: 'Yes' }, { value: 'No', label: 'No' }], defaultValue: 'No' }
=======
  useEffect(() => {
    dispatch(setFilterConfig([
      { id: 'fromDate', label: 'From Date', type: 'date', defaultValue: format(new Date().setMonth(new Date().getMonth() - 1), 'yyyy-MM-dd') },
      { id: 'toDate', label: 'To Date', type: 'date', defaultValue: format(new Date(), 'yyyy-MM-dd') },
      { id: 'considerDate', label: 'Consider Date?', type: 'select', options: [{ value: 'Yes', label: 'Yes' }, { value: 'No', label: 'No' }], defaultValue: 'No' },
      {
        id: 'auditType',
        label: 'Audit Type',
        type: 'select',
        options: [
          { value: 'All', label: 'ALL' },
          { value: 'INTERNAL', label: 'INTERNAL' },
          { value: 'EXTERNAL', label: 'EXTERNAL' }
        ],
        defaultValue: 'All'
      },
      {
        id: 'status',
        label: 'Status',
        type: 'select',
        options: [
          { value: 'All', label: 'ALL' },
          { value: 'PENDING', label: 'PENDING' },
          { value: 'APPROVED', label: 'APPROVED' }
        ],
        defaultValue: 'All'
      },
      {
        id: 'searchBy',
        label: 'Search By',
        type: 'select',
        options: [
          { value: 'observationNo', label: 'Observation No' },
          { value: 'auditScheduleNo', label: 'Schedule No' }
        ],
        defaultValue: 'observationNo'
      }
>>>>>>> origin/chore/repo-cleanup
    ]));
    return () => dispatch(setFilterConfig(null));
  }, [dispatch]);

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

<<<<<<< HEAD
  const renderCell = (col, row, idx) => {
    if (col.id === 'status') return <Chip label={row.status} size="small" sx={getStatusChipSx(row.status === 'APPROVED' ? 'ACTIVE' : 'PENDING')} />;
    if (col.id === 'auditScore') return <Typography fontWeight={700} color="primary">{row.auditScore}%</Typography>;
    return null; // Let BOSDataTable handle others
=======
  const handleExport = () => {
    const exportData = filteredRows.map((r, i) => ({
      '#': i + 1,
      'Audit Type': r.auditType,
      'Observation No': r.observationNo,
      'Date': r.observationDate ? format(new Date(r.observationDate), 'dd-MM-yyyy') : '',
      'Status': r.status,
      'Score': r.auditScore
    }));
    exportToExcel(exportData, 'Audit_Summary_Report');
  };

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const statusFilter = globalFilters.status || 'All';
      const matchesStatus = statusFilter === 'All' || row.status === statusFilter;
      const matchesSearch = !globalQuery || 
        (row.observationNo && row.observationNo.toLowerCase().includes(globalQuery.toLowerCase())) ||
        (row.auditType && row.auditType.toLowerCase().includes(globalQuery.toLowerCase()));
      return matchesStatus && matchesSearch;
    });
  }, [rows, globalQuery, globalFilters]);

  const paginatedRows = useMemo(() => filteredRows.slice(page * size, page * size + size), [filteredRows, page, size]);

  const renderCell = (col, row, idx) => {
    if (col.id === 'index') return idx + 1 + page * size;
    if (col.id === 'observationDate') return row[col.id] ? format(new Date(row[col.id]), 'dd-MM-yyyy') : '-';
    if (col.id === 'status') return <Chip label={row.status} size="small" sx={getStatusChipSx(row.status === 'APPROVED' ? 'ACTIVE' : 'PENDING')} />;
    if (col.id === 'auditScore') return <Typography fontWeight={700} color="primary">{row.auditScore}%</Typography>;
    return row[col.id] || '-';
>>>>>>> origin/chore/repo-cleanup
  };

  return (
    <MainCard
      title={
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <IconReport size={24} />
          <Typography variant="h3">Audit Summary Report</Typography>
        </Stack>
      }
      secondary={
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Tooltip title="Refresh">
            <IconButton onClick={fetchData} color="primary" size="small" sx={{ border: '2px solid', borderColor: 'divider', borderRadius: '8px', p: 1, transition: 'all 0.2s', '&:hover': { bgcolor: 'primary.light', transform: 'scale(1.05)' } }}>
              <IconRefresh size={20} />
            </IconButton>
          </Tooltip>
          <BOSExportButton
<<<<<<< HEAD
            data={resolvedRows}
=======
            data={filteredRows}
>>>>>>> origin/chore/repo-cleanup
            filename="Audit_Summary_Report"
            columns={[
              { header: 'Audit Type', key: 'auditType' },
              { header: 'Observation No', key: 'observationNo' },
              { header: 'Date', key: 'observationDate' },
<<<<<<< HEAD
              { header: 'Status', key: 'status' },
              { header: 'Score', key: 'auditScore' }
=======
              { header: 'Status', key: 'status' }
>>>>>>> origin/chore/repo-cleanup
            ]}
          />
        </Stack>
      }
    >
      <BOSDataTable
        columns={columns}
<<<<<<< HEAD
        rows={resolvedRows}
        page={page}
        size={size}
=======
        rows={paginatedRows}
        page={page}
        size={size}
        totalCount={filteredRows.length}
>>>>>>> origin/chore/repo-cleanup
        loading={loading}
        onPageChange={setPage}
        onSizeChange={(s) => { setSize(s); setPage(0); }}
        renderCell={renderCell}
        customActions={(row) => (
          <Tooltip title="View Detailed Report (PDF)">
            <IconButton
              size="small"
              color="secondary"
              onClick={() => dispatch(openSnackbar({ open: true, message: 'PDF Generation coming soon!', severity: 'info', variant: 'alert' }))}
              sx={{ bgcolor: 'secondary.light', color: 'secondary.dark', '&:hover': { bgcolor: 'secondary.main', color: 'white' } }}
            >
              <IconFileText size={18} />
            </IconButton>
          </Tooltip>
        )}
      />
    </MainCard>
  );
}
