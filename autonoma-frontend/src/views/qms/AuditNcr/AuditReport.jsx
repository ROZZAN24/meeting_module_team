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
import usePagePermissions, { PAGE_CODES } from 'hooks/usePagePermissions';

const columns = [
  { id: 'index', label: '#', minWidth: 50 },
  { id: 'observationNo', label: 'Obs No.', minWidth: 130, bold: true, required: true },
  { id: 'scheduleNo', label: 'Schedule No.', minWidth: 130, required: true },
  { id: 'observationDate', label: 'Date', minWidth: 120 },
  { id: 'auditTypeName', label: 'Audit Type', minWidth: 150, required: true },
  { id: 'status', label: 'Status', minWidth: 100 },
  { id: 'createdBy', label: 'Created By', minWidth: 120 },
  { id: 'createdDate', label: 'Created Date', minWidth: 150 },
  { id: 'updatedBy', label: 'Updated By', minWidth: 120 },
  { id: 'updatedDate', label: 'Updated Date', minWidth: 150 }
];

export default function AuditReport() {
  const dispatch = useDispatch();
  const perms = usePagePermissions(PAGE_CODES.QMS_AUDIT_REPORT);

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);

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

  const renderCell = (col, row, idx) => {
    if (col.id === 'status') return <Chip label={row.status} size="small" sx={getStatusChipSx(row.status === 'APPROVED' ? 'ACTIVE' : 'PENDING')} />;
    if (col.id === 'auditScore') return <Typography fontWeight={700} color="primary">{row.auditScore}%</Typography>;
    return null; // Let BOSDataTable handle others
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
          {perms.export && <BOSExportButton
            data={resolvedRows}
            filename="Audit_Summary_Report"
            columns={[
              { header: 'Audit Type', key: 'auditType' },
              { header: 'Observation No', key: 'observationNo' },
              { header: 'Date', key: 'observationDate' },
              { header: 'Status', key: 'status' },
              { header: 'Score', key: 'auditScore' }
            ]}
          />}
        </Stack>
      }
    >
      <BOSDataTable
        columns={columns}
        rows={resolvedRows}
        page={page}
        size={size}
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
