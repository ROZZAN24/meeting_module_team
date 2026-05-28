import { useState, useEffect, useCallback, useMemo } from 'react';

import { Typography, Stack, Tooltip, IconButton, Chip, Button } from '@mui/material';
import { IconReport, IconFileText, IconRefresh } from '@tabler/icons-react';
import axios from 'utils/axios';
import MainCard from 'ui-component/cards/MainCard';
import { format } from 'date-fns';
import { useDispatch } from 'react-redux';
import { setFilterConfig } from 'store/slices/search';
import { openSnackbar } from 'store/slices/snackbar';
import { BOSDataTable, BOSExportButton, getStatusChipSx, btnNew } from 'ui-component/bos';
import usePagePermissions, { PAGE_CODES } from 'hooks/usePagePermissions';
import useLookups from 'hooks/useLookups';
import ConfirmDeleteDialog from 'ui-component/ConfirmDeleteDialog';
import { API_PATHS } from 'utils/api-constants';
import AddAuditReportDialog from './AddAuditReportDialog';

const columns = [
  { id: 'index', label: 'Sl.No', minWidth: 50 },
  { id: 'auditType', label: 'Audit Type', minWidth: 150 },
  { id: 'scheduleNo', label: 'Schedule No', minWidth: 130 },
  { id: 'scheduleDate', label: 'Schedule Date', minWidth: 120 },
  { id: 'observationNo', label: 'Observation No', minWidth: 130, bold: true },
  { id: 'observationDate', label: 'Observation Date', minWidth: 120 },
  { id: 'status', label: 'Status', minWidth: 100 },
  { id: 'pdf', label: 'Pdf', minWidth: 80, align: 'center' },
  { id: 'auditCriteria', label: 'Audit Criteria', minWidth: 200, wrap: true },
  { id: 'observationStatus', label: 'Observation Status', minWidth: 180 },
  { id: 'createdUser', label: 'CREATED USER', minWidth: 120 },
  { id: 'createdDate', label: 'CREATED DATE', minWidth: 150 },
  { id: 'updatedUser', label: 'UPDATED USER', minWidth: 120 },
  { id: 'updatedDate', label: 'UPDATED DATE', minWidth: 150 }
];

export default function AuditReport() {
  const dispatch = useDispatch();
  const perms = usePagePermissions(PAGE_CODES.QMS_AUDIT_REPORT);

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null); // row data for edit popup

  const { auditSchedules = [] } = useLookups(['AUDIT_SCHEDULE']);

  // ── RESOLVED ROWS (SOP #16 Standard) ──
  const resolvedRows = useMemo(() => {
    if (!Array.isArray(rows)) return [];
    return rows.map(row => {
      const schNo = row.auditScheduleNo || row.scheduleNo || '';
      const matchingSch = auditSchedules.find(s => s.scheduleNo === schNo);
      
      const criteriaStr = Array.isArray(row.details)
        ? row.details.map(d => d.clause || d.criteriaDetails).filter(Boolean).join(', ')
        : '-';
      
      return {
        ...row,
        auditType: typeof row.auditType === 'object' ? row.auditType?.name : (row.auditType || row.auditTypeName || ''),
        scheduleNo: schNo,
        scheduleDate: matchingSch ? matchingSch.scheduleDate : '-',
        auditCriteria: criteriaStr || '-',
        observationStatus: `C: ${row.complianceCount || 0} | O: ${row.ofiCount || 0} | NC: ${row.ncrCount || 0}`,
        status: row.status || 'PENDING',
        createdUser: row.createdUser || row.createdBy || '-',
        updatedUser: row.updatedUser || row.updatedBy || '-'
      };
    });
  }, [rows, auditSchedules]);

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

  const handleDeleteConfirm = async () => {
    try {
      await axios.delete(`${API_PATHS.QMS.AUDIT_OBSERVATION}/${deleteTarget.id}`);
      dispatch(openSnackbar({ open: true, message: 'Observation deleted!', severity: 'success', variant: 'alert' }));
      setDeleteDialogOpen(false);
      fetchData();
    } catch (error) {
      dispatch(openSnackbar({ open: true, message: 'Failed to delete observation', severity: 'error', variant: 'alert' }));
    }
  };

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

  const renderCell = (col, row, idx) => {
    if (col.id === 'status') {
      const statusText = row.status === 'APPROVED' ? 'ACTIVE' : (row.status === 'PENDING' ? 'PENDING' : 'INACTIVE');
      return <Chip label={row.status} size="small" sx={getStatusChipSx(statusText)} />;
    }
    if (col.id === 'scheduleDate' || col.id === 'observationDate') {
      return formatDateOnly(row[col.id]);
    }
    if (col.id === 'pdf') {
      return (
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
      );
    }
    if (col.id === 'observationStatus') {
      return (
        <Stack direction="row" spacing={0.5}>
          <Chip label={`C: ${row.complianceCount || 0}`} size="small" sx={{ bgcolor: 'success.light', color: 'success.dark', fontWeight: 600 }} />
          <Chip label={`O: ${row.ofiCount || 0}`} size="small" sx={{ bgcolor: 'warning.light', color: 'warning.dark', fontWeight: 600 }} />
          <Chip label={`NC: ${row.ncrCount || 0}`} size="small" sx={{ bgcolor: 'error.light', color: 'error.dark', fontWeight: 600 }} />
        </Stack>
      );
    }
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
              { header: 'Schedule No', key: 'scheduleNo' },
              { header: 'Schedule Date', key: 'scheduleDate' },
              { header: 'Observation No', key: 'observationNo' },
              { header: 'Observation Date', key: 'observationDate' },
              { header: 'Status', key: 'status' },
              { header: 'Audit Criteria', key: 'auditCriteria' },
              { header: 'Observation Status', key: 'observationStatus' },
              { header: 'Created User', key: 'createdUser' },
              { header: 'Created Date', key: 'createdDate' },
              { header: 'Updated User', key: 'updatedUser' },
              { header: 'Updated Date', key: 'updatedDate' }
            ]}
          />}
          {perms.write && (
            <Tooltip title="Create New Observation">
              <Button
                variant="contained"
                color="primary"
                size="medium"
                onClick={() => setAddDialogOpen(true)}
                sx={btnNew}
              >
                + New
              </Button>
            </Tooltip>
          )}
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
        onEditRow={perms.write ? (row) => { setEditTarget(row); setAddDialogOpen(true); } : undefined}
        onDeleteRow={perms.delete ? (row) => { setDeleteTarget(row); setDeleteDialogOpen(true); } : undefined}
        renderCell={renderCell}
      />

      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Observation"
        message="Are you sure you want to delete this observation?"
        itemName={deleteTarget?.observationNo}
      />

      <AddAuditReportDialog
        open={addDialogOpen}
        initialData={editTarget}
        onClose={(refresh) => {
          setAddDialogOpen(false);
          setEditTarget(null);
          if (refresh) fetchData();
        }}
      />
    </MainCard>
  );
}
