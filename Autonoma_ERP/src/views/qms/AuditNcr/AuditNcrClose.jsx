import { useState, useEffect, useCallback, useMemo } from 'react';
import { Typography, Stack, Button, Tooltip, IconButton, MenuItem, Box, Chip, Grid, Divider, Link } from '@mui/material';
import { IconAlertTriangle, IconFileDownload, IconCircleCheck, IconRefresh, IconFileDescription, IconUser, IconCalendar, IconNumber, IconHierarchy, IconEdit } from '@tabler/icons-react';
import axios from 'utils/axios';
import MainCard from 'ui-component/cards/MainCard';
import { exportToExcel } from 'utils/excelExport';
import { format, differenceInDays } from 'date-fns';
import { useDispatch, useSelector } from 'react-redux';
import { setFilterConfig } from 'store/slices/search';
import { openSnackbar } from 'store/slices/snackbar';
import { BOSDataTable, BOSFormDialog, BOSFormSection, BOSTextField, btnExport, getStatusChipSx } from 'ui-component/bos';
import useBOSValidation from 'hooks/useBOSValidation';

const columns = [
  { id: 'index', label: '#', minWidth: 50 },
  { id: 'observationNo', label: 'Observation No', minWidth: 130, bold: true },
  { id: 'observationDate', label: 'Observation Date', minWidth: 130 },
  { id: 'targetDate', label: 'Target Date', minWidth: 110 },
  { id: 'auditScheduleNo', label: 'Schedule No', minWidth: 130 },
  { id: 'auditType', label: 'Audit Type', minWidth: 130 },
  { id: 'seqNo', label: 'Seq No', minWidth: 80 },
  { id: 'clause', label: 'Clause', minWidth: 100 },
  { id: 'criteriaDetails', label: 'Criteria Details', minWidth: 250 },
  { id: 'auditee', label: 'Auditee Name', minWidth: 150 },
  { id: 'ncrApprovedBy', label: 'NCR Approved By', minWidth: 150 },
  { id: 'attachmentReq', label: 'Attach Req', minWidth: 100 },
  { id: 'observationStatus', label: 'Obr Status', minWidth: 100 },
  { id: 'ncrStatus', label: 'Approval Status', minWidth: 130 },
  { id: 'createdDate', label: 'Created Date', minWidth: 120 }
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
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedFinding, setSelectedFinding] = useState(null);
  const [nextNcrNo, setNextNcrNo] = useState('');
  const [formData, setFormData] = useState({ rootCause: '', correctiveAction: '', preventiveAction: '' });

  useEffect(() => {
    dispatch(setFilterConfig([
      { id: 'fromDate', label: 'From Date', type: 'date', defaultValue: format(new Date().setMonth(new Date().getMonth() - 6), 'yyyy-MM-dd') },
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
        id: 'auditor',
        label: 'Auditor',
        type: 'select',
        options: [{ value: 'All', label: 'ALL' }, ...employees.map(e => ({ value: e.firstName, label: e.firstName }))],
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
    ]));
    return () => dispatch(setFilterConfig(null));
  }, [dispatch, employees]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [findingsRes, empRes] = await Promise.all([
        axios.get('/api/qms/audit/ncr/findings'),
        axios.get('/api/master/employee')
      ]);
      setRows(findingsRes.data || []);
      setEmployees(empRes.data || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleOpenClose = async (row) => {
    setSelectedFinding(row);
    setFormData({
      rootCause: row.rootCause || '',
      correctiveAction: row.correctiveAction || '',
      preventiveAction: row.preventiveAction || ''
    });
    
    // Fetch next NCR No if finding is NCR and doesn't have one
    if (row.observationStatus === 'NCR' && !row.ncrNo) {
        try {
            const res = await axios.get('/api/qms/audit/ncr/next-ncr-no');
            setNextNcrNo(res.data);
        } catch (e) { setNextNcrNo('NCR-Pending'); }
    } else {
        setNextNcrNo(row.ncrNo || 'N/A');
    }

    clearErrors();
    setDialogOpen(true);
  };

  const handleSaveClose = async () => {
    if (!validate(formData, VALIDATION_RULES)) return;
    try {
      await axios.put(`/api/qms/audit/ncr/close/${selectedFinding.id}`, formData);
      dispatch(openSnackbar({ open: true, message: 'NCR Closure submitted for approval!', severity: 'success', variant: 'alert' }));
      setDialogOpen(false);
      fetchData();
    } catch (error) {
      dispatch(openSnackbar({ open: true, message: 'Failed to submit closure', severity: 'error', variant: 'alert' }));
    }
  };

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const typeFilter = globalFilters.observationStatus || 'All';
      const matchesType = typeFilter === 'All' || row.observationStatus === typeFilter;
      
      const auditorFilter = globalFilters.auditor || 'All';
      const matchesAuditor = auditorFilter === 'All' || row.auditor === auditorFilter;

      const matchesSearch = !globalQuery || 
        (row.observationNo && row.observationNo.toLowerCase().includes(globalQuery.toLowerCase())) ||
        (row.auditScheduleNo && row.auditScheduleNo.toLowerCase().includes(globalQuery.toLowerCase())) ||
        (row.criteriaDetails && row.criteriaDetails.toLowerCase().includes(globalQuery.toLowerCase()));
      
      return matchesType && matchesAuditor && matchesSearch;
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
    if (['observationDate', 'targetDate', 'createdDate'].includes(col.id)) {
        return row[col.id] ? format(new Date(row[col.id]), 'dd/MM/yyyy') : '-';
    }
    return row[col.id] || '-';
  };

  const InfoItem = ({ label, value, icon: Icon }) => (
    <Box>
        <Stack direction="row" spacing={0.5} alignItems="center" mb={0.5}>
            {Icon && <Icon size={14} color="#616161" />}
            <Typography variant="caption" color="textSecondary" fontWeight={600} textTransform="uppercase">{label}</Typography>
        </Stack>
        <Typography variant="body2" fontWeight={600} color="primary.dark">{value || '-'}</Typography>
    </Box>
  );

  return (
    <MainCard
      title={
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <IconAlertTriangle size={24} />
          <Typography variant="h3">Close NCR / OFI Findings</Typography>
        </Stack>
      }
      secondary={
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Tooltip title="Refresh">
            <IconButton onClick={fetchData} color="primary" size="small" sx={{ border: '2px solid', borderColor: 'divider', borderRadius: '8px', p: 1, transition: 'all 0.2s', '&:hover': { bgcolor: 'primary.light', transform: 'scale(1.05)' } }}>
              <IconRefresh size={20} />
            </IconButton>
          </Tooltip>
          <Button variant="outlined" color="primary" size="medium" startIcon={<IconFileDownload size={18} />} onClick={() => exportToExcel(filteredRows, 'NCR_Closure_Report')} sx={btnExport}>
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
        onClear={() => setFormData({ rootCause: '', correctiveAction: '', preventiveAction: '' })}
        title={
            <Stack direction="row" spacing={2} alignItems="center">
                <IconAlertTriangle size={24} color="#d32f2f" />
                <Typography variant="h3">Submit NCR / OFI for Closure</Typography>
            </Stack>
        }
        maxWidth="lg"
      >
        <Stack spacing={3}>
          {/* Header Summary Strip */}
          <Box sx={{ p: 2, bgcolor: 'primary.light', borderRadius: '12px', border: '1px solid', borderColor: 'primary.200' }}>
            <Grid container spacing={3}>
                <Grid item xs={12} sm={2.4}><InfoItem label="NCR No" value={nextNcrNo} icon={IconNumber} /></Grid>
                <Grid item xs={12} sm={2.4}><InfoItem label="Observation No" value={selectedFinding?.observationNo} icon={IconFileDescription} /></Grid>
                <Grid item xs={12} sm={2.4}><InfoItem label="Schedule No" value={selectedFinding?.auditScheduleNo} icon={IconCalendar} /></Grid>
                <Grid item xs={12} sm={2.4}><InfoItem label="Status" value={selectedFinding?.ncrStatus || 'PENDING'} icon={IconHierarchy} /></Grid>
                <Grid item xs={12} sm={2.4}>
                    <InfoItem 
                        label="Delay Days" 
                        value={selectedFinding?.targetDate ? Math.max(0, differenceInDays(new Date(), new Date(selectedFinding.targetDate))) : '0'} 
                        icon={IconCalendar} 
                    />
                </Grid>
            </Grid>
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12} md={7}>
              <Stack spacing={3}>
                <BOSFormSection title="Finding Details" icon={<IconAlertTriangle size={20} />}>
                    <Grid container spacing={2}>
                        <Grid item xs={6}><InfoItem label="Audit Type" value={selectedFinding?.auditType} /></Grid>
                        <Grid item xs={6}><InfoItem label="Audit Area" value={selectedFinding?.auditArea} /></Grid>
                        <Grid item xs={12}>
                            <Typography variant="caption" color="textSecondary" fontWeight={600}>AUDIT CRITERIA DETAILS</Typography>
                            <Box sx={{ p: 1.5, mt: 0.5, bgcolor: 'grey.100', borderRadius: '8px' }}>
                                <Typography variant="body2" lineHeight={1.6}>{selectedFinding?.criteriaDetails}</Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={12}>
                            <Typography variant="caption" color="textSecondary" fontWeight={600}>OBSERVATION COMMENT</Typography>
                            <Typography variant="body1" fontWeight={500} sx={{ mt: 0.5 }}>{selectedFinding?.comments || 'No comments'}</Typography>
                        </Grid>
                    </Grid>
                </BOSFormSection>

                <BOSFormSection title="Corrective Actions" icon={<IconEdit size={20} />}>
                    <Stack spacing={2.5}>
                        <BOSTextField required multiline rows={2} label="Root Cause" value={formData.rootCause} onChange={(e) => setFormData({ ...formData, rootCause: e.target.value })} error={!!errors.rootCause} helperText={errors.rootCause} />
                        <BOSTextField required multiline rows={2} label="Corrective Action" value={formData.correctiveAction} onChange={(e) => setFormData({ ...formData, correctiveAction: e.target.value })} error={!!errors.correctiveAction} helperText={errors.correctiveAction} />
                        <BOSTextField required multiline rows={2} label="Preventive Action" value={formData.preventiveAction} onChange={(e) => setFormData({ ...formData, preventiveAction: e.target.value })} error={!!errors.preventiveAction} helperText={errors.preventiveAction} />
                    </Stack>
                </BOSFormSection>
              </Stack>
            </Grid>

            <Grid item xs={12} md={5}>
                <Stack spacing={3}>
                    <BOSFormSection title="Personnel Information" icon={<IconUser size={20} />}>
                        <Stack spacing={2}>
                            <Box>
                                <Typography variant="subtitle2" color="primary" sx={{ mb: 1 }}>AUDITOR</Typography>
                                <Stack direction="row" spacing={2} alignItems="center">
                                    <Box sx={{ width: 40, height: 40, bgcolor: 'secondary.light', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <IconUser size={20} />
                                    </Box>
                                    <Box>
                                        <Typography variant="body2" fontWeight={600}>{selectedFinding?.auditor || 'Not Assigned'}</Typography>
                                        <Typography variant="caption" color="textSecondary">Auditor Level: L2</Typography>
                                    </Box>
                                </Stack>
                            </Box>
                            <Divider />
                            <Box>
                                <Typography variant="subtitle2" color="primary" sx={{ mb: 1 }}>NCR APPROVED BY</Typography>
                                <Stack direction="row" spacing={2} alignItems="center">
                                    <Box sx={{ width: 40, height: 40, bgcolor: 'success.light', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <IconUser size={20} />
                                    </Box>
                                    <Box>
                                        <Typography variant="body2" fontWeight={600}>{selectedFinding?.ncrApprovedBy || 'Not Assigned'}</Typography>
                                        <Typography variant="caption" color="textSecondary">Approval Level: L5</Typography>
                                    </Box>
                                </Stack>
                            </Box>
                        </Stack>
                    </BOSFormSection>

                    <BOSFormSection title="Attachments" icon={<IconFileDescription size={20} />}>
                        <Stack spacing={1}>
                            <Typography variant="caption" color="textSecondary">REFERENCE DOCUMENTS</Typography>
                            <Link href="#" underline="hover" sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 1 }}>
                                <IconFileDescription size={18} />
                                <Typography variant="body2">Criteria_Proof_DOC.pdf</Typography>
                            </Link>
                            <Link href="#" underline="hover" sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 1 }}>
                                <IconFileDescription size={18} />
                                <Typography variant="body2">Observation_Finding_Photo.jpg</Typography>
                            </Link>
                        </Stack>
                    </BOSFormSection>
                </Stack>
            </Grid>
          </Grid>
        </Stack>
      </BOSFormDialog>
    </MainCard>
  );
}
