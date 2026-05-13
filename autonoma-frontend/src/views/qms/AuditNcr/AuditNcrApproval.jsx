import { useState, useEffect, useCallback, useMemo } from 'react';
import { Typography, Stack, Button, Tooltip, IconButton, Box, Chip, Card, CardContent, Divider } from '@mui/material';
import { IconChecks, IconFileDownload, IconCircleCheck, IconRefresh, IconEye } from '@tabler/icons-react';
import axios from 'utils/axios';
import MainCard from 'ui-component/cards/MainCard';
import { exportToExcel } from 'utils/excelExport';
import { format } from 'date-fns';
import { useDispatch, useSelector } from 'react-redux';
import { setFilterConfig } from 'store/slices/search';
import { openSnackbar } from 'store/slices/snackbar';
import { BOSDataTable, BOSFormDialog, BOSFormSection, btnExport, getStatusChipSx } from 'ui-component/bos';

const columns = [
  { id: 'index', label: '#', minWidth: 50 },
  { id: 'observationNo', label: 'Observation No', minWidth: 130, bold: true },
  { id: 'clause', label: 'Clause', minWidth: 100 },
  { id: 'criteriaDetails', label: 'Criteria Details', minWidth: 250 },
  { id: 'observationStatus', label: 'Type', minWidth: 80 },
  { id: 'closedBy', label: 'Closed By', minWidth: 120 },
  { id: 'ncrStatus', label: 'Status', minWidth: 130 }
];

export default function AuditNcrApproval() {
  const dispatch = useDispatch();
  const globalQuery = useSelector((state) => state.search.query);
  const globalFilters = useSelector((state) => state.search.filters);

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedFinding, setSelectedFinding] = useState(null);

  useEffect(() => {
    dispatch(setFilterConfig([
      { id: 'fromDate', label: 'From Date', type: 'date', defaultValue: format(new Date().setMonth(new Date().getMonth() - 1), 'yyyy-MM-dd') },
      { id: 'toDate', label: 'To Date', type: 'date', defaultValue: format(new Date(), 'yyyy-MM-dd') },
      { id: 'considerDate', label: 'Consider Date?', type: 'select', options: [{ value: 'Yes', label: 'Yes' }, { value: 'No', label: 'No' }], defaultValue: 'No' },
      {
        id: 'ncrStatus',
        label: 'Status',
        type: 'select',
        options: [
          { value: 'All', label: 'ALL' },
          { value: 'WAITING_APPROVAL', label: 'WAITING APPROVAL' },
          { value: 'CLOSED', label: 'CLOSED' }
        ],
        defaultValue: 'WAITING_APPROVAL'
      },
      {
        id: 'searchBy',
        label: 'Search By',
        type: 'select',
        options: [
          { value: 'ncrNo', label: 'NCR No' },
          { value: 'observationNo', label: 'Observation No' }
        ],
        defaultValue: 'ncrNo'
      }
    ]));
    return () => dispatch(setFilterConfig(null));
  }, [dispatch]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/qms/audit/ncr/findings');
      setRows(response.data || []);
    } catch (error) {
      console.error('Failed to fetch findings:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleOpenReview = (row) => {
    setSelectedFinding(row);
    setDialogOpen(true);
  };

  const handleApprove = async () => {
    try {
      await axios.put(`/api/qms/audit/ncr/approve/${selectedFinding.id}`);
      dispatch(openSnackbar({ open: true, message: 'NCR / OFI closure approved!', severity: 'success', variant: 'alert' }));
      setDialogOpen(false);
      fetchData();
    } catch (error) {
      dispatch(openSnackbar({ open: true, message: 'Failed to approve closure', severity: 'error', variant: 'alert' }));
    }
  };

  const handleExport = () => {
    const exportData = filteredRows.map((r, i) => ({
      '#': i + 1,
      'Observation No': r.observationNo || '-',
      'Type': r.observationStatus,
      'Root Cause': r.rootCause,
      'Corrective Action': r.correctiveAction,
      'Status': r.ncrStatus
    }));
    exportToExcel(exportData, 'NCR_Approval_List');
  };

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const statusFilter = globalFilters.ncrStatus || 'WAITING_APPROVAL';
      const matchesStatus = statusFilter === 'All' || (row.ncrStatus || 'OPEN') === statusFilter;
      const matchesSearch = !globalQuery || 
        (row.criteriaDetails && row.criteriaDetails.toLowerCase().includes(globalQuery.toLowerCase())) ||
        (row.clause && row.clause.toLowerCase().includes(globalQuery.toLowerCase()));
      return matchesStatus && matchesSearch;
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
    return row[col.id] || '-';
  };

  return (
    <MainCard
      title={
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <IconChecks size={24} />
          <Typography variant="h3">Audit NCR / OFI Approval</Typography>
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
          <Tooltip title="Review & Approve">
            <IconButton
              size="small"
              color="success"
              onClick={() => handleOpenReview(row)}
              disabled={row.ncrStatus === 'CLOSED' || row.ncrStatus === 'OPEN'}
              sx={{ bgcolor: 'success.light', color: 'success.dark', '&:hover': { bgcolor: 'success.main', color: 'white' } }}
            >
              <IconEye size={18} />
            </IconButton>
          </Tooltip>
        )}
      />

      <BOSFormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSave={handleApprove}
        title="Review NCR / OFI Closure"
        maxWidth="md"
        saveText="Approve Closure"
      >
        <Stack spacing={3}>
           <BOSFormSection title="Finding Overview" icon={<IconChecks size={20} />}>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                  <Box><Typography variant="caption" color="textSecondary">Type</Typography><Typography variant="body1" fontWeight={600}>{selectedFinding?.observationStatus}</Typography></Box>
                  <Box><Typography variant="caption" color="textSecondary">Clause</Typography><Typography variant="body1" fontWeight={600}>{selectedFinding?.clause}</Typography></Box>
                  <Box sx={{ gridColumn: 'span 2' }}><Typography variant="caption" color="textSecondary">Criteria Details</Typography><Typography variant="body1">{selectedFinding?.criteriaDetails}</Typography></Box>
              </Box>
           </BOSFormSection>

           <Divider />

           <BOSFormSection title="Closure Analysis" icon={<IconChecks size={20} />}>
              <Stack spacing={2.5}>
                  <Card variant="outlined" sx={{ bgcolor: 'grey.50' }}>
                      <CardContent sx={{ p: 2 }}>
                          <Typography variant="subtitle2" color="primary" gutterBottom>Root Cause</Typography>
                          <Typography variant="body2">{selectedFinding?.rootCause || 'Not provided'}</Typography>
                      </CardContent>
                  </Card>
                  <Card variant="outlined" sx={{ bgcolor: 'grey.50' }}>
                      <CardContent sx={{ p: 2 }}>
                          <Typography variant="subtitle2" color="primary" gutterBottom>Corrective Action</Typography>
                          <Typography variant="body2">{selectedFinding?.correctiveAction || 'Not provided'}</Typography>
                      </CardContent>
                  </Card>
                  <Card variant="outlined" sx={{ bgcolor: 'grey.50' }}>
                      <CardContent sx={{ p: 2 }}>
                          <Typography variant="subtitle2" color="primary" gutterBottom>Preventive Action</Typography>
                          <Typography variant="body2">{selectedFinding?.preventiveAction || 'Not provided'}</Typography>
                      </CardContent>
                  </Card>
              </Stack>
           </BOSFormSection>
        </Stack>
      </BOSFormDialog>
    </MainCard>
  );
}
