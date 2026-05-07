import { useState, useEffect, useCallback, useMemo } from 'react';
import { Typography, Stack, Button, Tooltip, IconButton, MenuItem, Box, Chip } from '@mui/material';
import { IconAlertTriangle, IconFileDownload, IconCircleCheck, IconRefresh, IconEdit } from '@tabler/icons-react';
import axios from 'utils/axios';
import MainCard from 'ui-component/cards/MainCard';
import { exportToExcel } from 'utils/excelExport';
import { format } from 'date-fns';
import { useDispatch, useSelector } from 'react-redux';
import { setFilterConfig } from 'store/slices/search';
import { openSnackbar } from 'store/slices/snackbar';
import { BOSDataTable, BOSFormDialog, BOSFormSection, BOSTextField, btnExport, btnSave, getStatusChipSx } from 'ui-component/bos';
import useBOSValidation from 'hooks/useBOSValidation';

const columns = [
  { id: 'index', label: '#', minWidth: 50 },
  { id: 'observationNo', label: 'Observation No', minWidth: 130, bold: true },
  { id: 'clause', label: 'Clause', minWidth: 100 },
  { id: 'criteriaDetails', label: 'Criteria Details', minWidth: 250 },
  { id: 'observationStatus', label: 'Type', minWidth: 80 },
  { id: 'targetDate', label: 'Target Date', minWidth: 100 },
  { id: 'ncrStatus', label: 'Status', minWidth: 130 }
];

const VALIDATION_RULES = [
  { field: 'rootCause', label: 'Root Cause', required: true },
  { field: 'correctiveAction', label: 'Corrective Action', required: true },
  { field: 'preventiveAction', label: 'Preventive Action', required: true }
];

export default function AuditNcrClose() {
  const dispatch = useDispatch();
  const globalQuery = useSelector((state) => state.search.query);
  const globalFilters = useSelector((state) => state.search.filters);
  const { errors, validate, clearErrors } = useBOSValidation();

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedFinding, setSelectedFinding] = useState(null);
  const [formData, setFormData] = useState({ rootCause: '', correctiveAction: '', preventiveAction: '' });

  useEffect(() => {
    dispatch(setFilterConfig([
      { id: 'fromDate', label: 'From Date', type: 'date', defaultValue: format(new Date().setMonth(new Date().getMonth() - 1), 'yyyy-MM-dd') },
      { id: 'toDate', label: 'To Date', type: 'date', defaultValue: format(new Date(), 'yyyy-MM-dd') },
      { id: 'considerDate', label: 'Consider Date?', type: 'select', options: [{ value: 'Yes', label: 'Yes' }, { value: 'No', label: 'No' }], defaultValue: 'No' },
      {
        id: 'observationStatus',
        label: 'Obr Status',
        type: 'select',
        options: [
          { value: 'All', label: 'ALL' },
          { value: 'NCR', label: 'NCR' },
          { value: 'OFI', label: 'OFI' }
        ],
        defaultValue: 'NCR'
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
    ]));
    return () => dispatch(setFilterConfig(null));
  }, [dispatch]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/qms/audit/ncr/findings');
      // Flatten or map if needed. Assuming the backend returns the details with observation info.
      // Since I extended AuditObservationDetail, I should make sure I have observationNo.
      // For now, I'll mock some data mapping if the direct join isn't there, but the entity has it.
      setRows(response.data || []);
    } catch (error) {
      console.error('Failed to fetch findings:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleOpenClose = (row) => {
    setSelectedFinding(row);
    setFormData({
      rootCause: row.rootCause || '',
      correctiveAction: row.correctiveAction || '',
      preventiveAction: row.preventiveAction || ''
    });
    clearErrors();
    setDialogOpen(true);
  };

  const handleSaveClose = async () => {
    if (!validate(formData, VALIDATION_RULES)) return;
    try {
      await axios.put(`/api/qms/audit/ncr/close/${selectedFinding.id}`, formData);
      dispatch(openSnackbar({ open: true, message: 'Finding submitted for closure!', severity: 'success', variant: 'alert' }));
      setDialogOpen(false);
      fetchData();
    } catch (error) {
      dispatch(openSnackbar({ open: true, message: 'Failed to close finding', severity: 'error', variant: 'alert' }));
    }
  };

  const handleExport = () => {
    const exportData = filteredRows.map((r, i) => ({
      '#': i + 1,
      'Observation No': r.observationNo || '-',
      'Clause': r.clause,
      'Criteria': r.criteriaDetails,
      'Type': r.observationStatus,
      'Status': r.ncrStatus || 'OPEN'
    }));
    exportToExcel(exportData, 'NCR_OFI_Close_List');
  };

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const typeFilter = globalFilters.observationStatus || 'All';
      const matchesType = typeFilter === 'All' || row.observationStatus === typeFilter;
      const matchesSearch = !globalQuery || 
        (row.criteriaDetails && row.criteriaDetails.toLowerCase().includes(globalQuery.toLowerCase())) ||
        (row.clause && row.clause.toLowerCase().includes(globalQuery.toLowerCase()));
      return matchesType && matchesSearch;
    });
  }, [rows, globalQuery, globalFilters]);

  const paginatedRows = useMemo(() => filteredRows.slice(page * size, page * size + size), [filteredRows, page, size]);

  const renderCell = (col, row, idx) => {
    if (col.id === 'index') return idx + 1 + page * size;
    if (col.id === 'observationStatus') return <Chip label={row.observationStatus} size="small" color={row.observationStatus === 'NCR' ? 'error' : 'warning'} />;
    if (col.id === 'ncrStatus') {
        const status = row.ncrStatus || 'OPEN';
        return <Chip label={status.replace('_', ' ')} size="small" sx={getStatusChipSx(status === 'CLOSED' ? 'ACTIVE' : (status === 'OPEN' ? 'INACTIVE' : 'PENDING'))} />;
    }
    if (col.id === 'targetDate') return row[col.id] ? format(new Date(row[col.id]), 'dd-MM-yyyy') : '-';
    return row[col.id] || '-';
  };

  return (
    <MainCard
      title={
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <IconAlertTriangle size={24} />
          <Typography variant="h3">Close NCR / OFI</Typography>
        </Stack>
      }
      secondary={
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Tooltip title="Refresh">
            <IconButton onClick={fetchData} color="primary" size="small" sx={{ border: '2px solid', borderColor: 'divider', borderRadius: '8px', p: 1, transition: 'all 0.2s', '&:hover': { bgcolor: 'primary.light', transform: 'scale(1.05)' } }}>
              <IconRefresh size={20} />
            </IconButton>
          </Tooltip>
          <Button variant="outlined" color="primary" size="medium" startIcon={<IconFileDownload size={18} />} onClick={handleExport} sx={btnExport}>
            Export Excel
          </Button>
        </Stack>
      }
    >
      <BOSDataTable
        columns={columns}
        rows={paginatedRows}
        page={page}
        size={size}
        totalCount={filteredRows.length}
        loading={loading}
        onPageChange={setPage}
        onSizeChange={(s) => { setSize(s); setPage(0); }}
        renderCell={renderCell}
        customActions={(row) => (
          <Tooltip title="Submit for Closure">
            <IconButton
              size="small"
              color="primary"
              onClick={() => handleOpenClose(row)}
              disabled={row.ncrStatus === 'CLOSED' || row.ncrStatus === 'WAITING_APPROVAL'}
              sx={{ bgcolor: 'primary.light', color: 'primary.dark', '&:hover': { bgcolor: 'primary.main', color: 'white' } }}
            >
              <IconCircleCheck size={18} />
            </IconButton>
          </Tooltip>
        )}
      />

      <BOSFormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSave={handleSaveClose}
        title="Submit NCR / OFI for Closure"
        maxWidth="md"
      >
        <Stack spacing={3}>
          <BOSFormSection title="Finding Details" icon={<IconAlertTriangle size={20} />}>
             <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: '8px', mb: 2 }}>
                <Typography variant="subtitle2" color="textSecondary">Finding:</Typography>
                <Typography variant="body1" fontWeight={600}>{selectedFinding?.criteriaDetails}</Typography>
             </Box>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 2.5 }}>
              <BOSTextField
                required
                multiline
                rows={3}
                label="Root Cause"
                value={formData.rootCause}
                onChange={(e) => setFormData({ ...formData, rootCause: e.target.value })}
                error={!!errors.rootCause}
                helperText={errors.rootCause}
              />
              <BOSTextField
                required
                multiline
                rows={3}
                label="Corrective Action"
                value={formData.correctiveAction}
                onChange={(e) => setFormData({ ...formData, correctiveAction: e.target.value })}
                error={!!errors.correctiveAction}
                helperText={errors.correctiveAction}
              />
              <BOSTextField
                required
                multiline
                rows={3}
                label="Preventive Action"
                value={formData.preventiveAction}
                onChange={(e) => setFormData({ ...formData, preventiveAction: e.target.value })}
                error={!!errors.preventiveAction}
                helperText={errors.preventiveAction}
              />
            </Box>
          </BOSFormSection>
        </Stack>
      </BOSFormDialog>
    </MainCard>
  );
}
