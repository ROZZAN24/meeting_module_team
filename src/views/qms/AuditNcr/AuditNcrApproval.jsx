import { useState, useEffect, useCallback, useMemo } from 'react';
import { Typography, Stack, Button, Tooltip, IconButton, Box, Chip, Grid, Divider, useTheme, Card, CardContent } from '@mui/material';
import { IconAlertTriangle, IconFileDownload, IconCircleCheck, IconRefresh, IconFileDescription, IconUser, IconChecks, IconX, IconEye, IconEdit } from '@tabler/icons-react';
import axios from 'utils/axios';
import MainCard from 'ui-component/cards/MainCard';
import { exportToExcel } from 'utils/excelExport';
import { format, differenceInDays } from 'date-fns';
import { useDispatch, useSelector } from 'react-redux';
import { setFilterConfig } from 'store/slices/search';
import { openSnackbar } from 'store/slices/snackbar';
import { 
  BOSDataTable, 
  BOSExportButton,
  BOSFormDialog, 
  BOSFormSection, 
  BOSTextField, 
  BOSPersonnelCard, 
  useBOSForm, 
  BOSFileGallery, 
  btnExport, 
  getStatusChipSx 
} from 'ui-component/bos';

// ==============================|| AUDIT NCR / OFI APPROVAL (REFACTORED WITH PATTERNS) ||============================== //

const columns = [
  { id: 'index', label: '#', minWidth: 50 },
  { id: 'ncrNo', label: 'NCR No', minWidth: 130, bold: true },
  { id: 'departmentName', label: 'Department', minWidth: 130 },
  { id: 'remarks', label: 'Comment', minWidth: 200 },
  { id: 'rootCause', label: 'Root Cause', minWidth: 200 },
  { id: 'correctiveAction', label: 'Corrective Action', minWidth: 200 },
  { id: 'preventiveAction', label: 'Preventive Action', minWidth: 200 },
  { id: 'observationNo', label: 'Observation No', minWidth: 250 },
  { id: 'criteriaDetails', label: 'Criteria Details', minWidth: 250 },
  { id: 'createdDate', label: 'Created Date', minWidth: 130 },
  { id: 'ncrStatus', label: 'Status', minWidth: 130 }
];

const R = ({ children, lg = 6 }) => <Grid item xs={12} md={lg}>{children}</Grid>;

export default function AuditNcrApproval() {
  const theme = useTheme();
  const dispatch = useDispatch();
  const globalQuery = useSelector((state) => state.search.query);
  const globalFilters = useSelector((state) => state.search.filters);

  const [rows, setRows] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedFinding, setSelectedFinding] = useState(null);
  const [attachments, setAttachments] = useState([]);

  // useBOSForm ensures no uncontrolled input warnings
  const { formData, handleFormChange, updateForm, resetForm } = useBOSForm({ remarks: '' });
  const [errors, setErrors] = useState({});

  const getEmployeeDetails = (input) => {
    if (!input) return {};
    const parts = input.split(' - ');
    const emp = employees.find(e => e.employeeName === parts[0]?.trim() || e.empCode === input);
    return emp || { empCode: parts[1]?.trim() || '-', departmentName: '-', empLevelId: '-' };
  };

  useEffect(() => {
    dispatch(setFilterConfig([
      { id: 'fromDate', label: 'From Date', type: 'date', defaultValue: format(new Date().setMonth(new Date().getMonth() - 6), 'yyyy-MM-dd') },
      { id: 'toDate', label: 'To Date', type: 'date', defaultValue: format(new Date(), 'yyyy-MM-dd') },
      { id: 'considerDate', label: 'Consider Date?', type: 'select', options: [{ value: 'Yes', label: 'Yes' }, { value: 'No', label: 'No' }], defaultValue: 'No' },
      { id: 'observationStatus', label: 'Obr Status', type: 'select', options: [{ value: 'All', label: 'ALL' }, { value: 'NCR', label: 'NCR' }, { value: 'OFI', label: 'OFI' }], defaultValue: 'NCR' },
      { id: 'ncrStatus', label: 'Status', type: 'select', options: [{ value: 'All', label: 'ALL' }, { value: 'WAITING_APPROVAL', label: 'PENDING APPROVAL' }, { value: 'CLOSED', label: 'CLOSED' }, { value: 'REJECTED', label: 'REJECTED' }], defaultValue: 'WAITING_APPROVAL' },
      { id: 'searchBy', label: 'Search By', type: 'select', options: [{ value: 'ncrNo', label: 'NCR No' }, { value: 'observationNo', label: 'Observation No' }], defaultValue: 'ncrNo' }
    ]));
    return () => dispatch(setFilterConfig(null));
  }, [dispatch]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [fRes, eRes] = await Promise.all([
        axios.get('/api/qms/audit/observation/ncr/findings', { params: { ...globalFilters, query: globalQuery } }),
        axios.get('/api/master/employee')
      ]);
      setRows(fRes.data || []);
      setEmployees(eRes.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [globalFilters, globalQuery]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleOpenReview = async (row) => {
    setSelectedFinding(row);
    updateForm({ remarks: row.remarks || '' });
    
    try {
        const res = await axios.get(`/api/qms/ncr-ofi/attachments/${row.id}`);
        setAttachments(res.data || []);
    } catch (e) { setAttachments([]); }
    
    setErrors({});
    setDialogOpen(true);
  };

  const handleProcessApproval = async (status) => {
    if (status === 'REJECTED' && !formData.remarks) {
        setErrors({ remarks: 'Remarks are mandatory for rejection' });
        return;
    }
    
    try {
      const endpoint = status === 'APPROVED' ? 'approve' : 'reject';
      await axios.put(`/api/qms/audit/observation/ncr/${endpoint}/${selectedFinding.id}`, null, {
        params: { remarks: formData.remarks }
      });
      dispatch(openSnackbar({ open: true, message: `NCR / OFI ${status} successfully!`, severity: status === 'APPROVED' ? 'success' : 'error' }));
      setDialogOpen(false);
      fetchData();
    } catch (e) { dispatch(openSnackbar({ open: true, message: 'Process failed', severity: 'error' })); }
  };

  const renderCell = (col, row, idx) => {
    if (col.id === 'index') return idx + 1 + page * size;
    if (col.id === 'ncrStatus') {
        const status = row.ncrStatus || 'OPEN';
        return <Chip label={status.replace('_', ' ')} size="small" sx={getStatusChipSx(status === 'CLOSED' ? 'ACTIVE' : (status === 'OPEN' ? 'INACTIVE' : 'PENDING'))} />;
    }
    const val = row[col.id];
    if (['observationDate', 'targetDate', 'createdDate'].includes(col.id)) return val ? format(new Date(val), 'dd/MM/yyyy') : '-';
    return String(val || '-');
  };

  const getDelayDays = () => {
    if (!selectedFinding?.targetDate) return 0;
    const d = differenceInDays(new Date(), new Date(selectedFinding.targetDate));
    return d > 0 ? d : 0;
  };

  const getAttachment = (category) => attachments.find(a => a.category === category);

  return (
    <MainCard
      title={<Stack direction="row" alignItems="center" spacing={1.5}><IconChecks size={24} /><Typography variant="h3">NCR / OFI Approval & CAPA Management</Typography></Stack>}
      secondary={
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Tooltip title="Refresh"><IconButton onClick={fetchData} color="primary" size="small" sx={{ border: '2px solid', borderColor: 'divider', borderRadius: '8px', p: 1 }}><IconRefresh size={20} /></IconButton></Tooltip>
          <BOSExportButton
            data={rows}
            filename="NCR_Approval_Report"
            columns={[
              { header: 'NCR No', key: 'ncrNo' },
              { header: 'Department', key: 'departmentName' },
              { header: 'Observation No', key: 'observationNo' },
              { header: 'Status', key: 'ncrStatus' }
            ]}
          />
        </Stack>
      }
    >
      <BOSDataTable columns={columns} rows={rows.slice(page * size, page * size + size)} page={page} size={size} totalCount={rows.length} loading={loading} onPageChange={setPage} onSizeChange={setSize} onDoubleClickRow={handleOpenReview} renderCell={renderCell} customActions={(row) => (<Tooltip title="Review & Approve"><IconButton size="small" color="success" onClick={() => handleOpenReview(row)} disabled={row.ncrStatus === 'CLOSED' || row.ncrStatus === 'REJECTED'} sx={{ bgcolor: 'success.light', color: 'success.dark', '&:hover': { bgcolor: 'success.main', color: 'white' } }}><IconEye size={18} /></IconButton></Tooltip>)} />

      <BOSFormDialog open={dialogOpen} onClose={() => setDialogOpen(false)} onSave={() => handleProcessApproval('APPROVED')} onClear={resetForm} title="NCR / OFI Approval Workflow" maxWidth="lg"
        customButtons={
          <Stack direction="row" spacing={2}>
            <Button variant="outlined" color="error" startIcon={<IconX size={20} />} onClick={() => handleProcessApproval('REJECTED')}>Reject CAPA</Button>
            <Button variant="contained" color="success" startIcon={<IconCircleCheck size={20} />} onClick={() => handleProcessApproval('APPROVED')}>Approve & Close</Button>
          </Stack>
        }
      >
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1.8fr 1.2fr' }, gap: 4, width: '100%' }}>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <Box sx={{ p: 2.5, bgcolor: 'primary.light', borderRadius: '12px', border: '1px solid', borderColor: 'primary.200' }}>
               <Grid container spacing={2}>
                  <Grid item xs={3}><Typography variant="caption" color="primary.main" fontWeight={700}>NCR / OFI NO</Typography><Typography variant="h4" fontWeight={800}>{selectedFinding?.ncrNo || 'N/A'}</Typography></Grid>
                  <Grid item xs={3}><Typography variant="caption" color="primary.main" fontWeight={700}>OBS NO</Typography><Typography variant="h4" fontWeight={800}>{selectedFinding?.observationNo || 'N/A'}</Typography></Grid>
                  <Grid item xs={3}><Typography variant="caption" color="primary.main" fontWeight={700}>DATE</Typography><Typography variant="h4" fontWeight={800}>{selectedFinding?.observationDate ? format(new Date(selectedFinding.observationDate), 'dd/MM/yyyy') : '-'}</Typography></Grid>
                  <Grid item xs={3}><Typography variant="caption" color="error.main" fontWeight={700}>DELAY DAYS</Typography><Typography variant="h4" fontWeight={800} color="error.main">{getDelayDays()} Days</Typography></Grid>
               </Grid>
            </Box>

            <BOSFormSection title="Observation Details" icon={<IconAlertTriangle size={20} color={theme.palette.error.main} />}>
              <Grid container spacing={3.5}>
                <R lg={6}><BOSTextField label="Audit Type" value={selectedFinding?.auditType || ''} inputProps={{ readOnly: true }} InputLabelProps={{ shrink: true }} /></R>
                <R lg={6}><BOSTextField label="Clause / Criteria" value={selectedFinding?.clause || ''} inputProps={{ readOnly: true }} InputLabelProps={{ shrink: true }} /></R>
                <Grid item xs={12}><BOSTextField label="Finding / Observation" value={selectedFinding?.criteriaDetails || ''} multiline rows={2} inputProps={{ readOnly: true }} InputLabelProps={{ shrink: true }} /></Grid>
              </Grid>
            </BOSFormSection>

            <BOSFormSection title="CAPA Analysis Review" icon={<IconEdit size={20} color={theme.palette.secondary.main} />}>
              <Grid container spacing={3.5}>
                {[
                  { label: 'Root Cause Analysis', value: selectedFinding?.rootCause, key: 'ROOT_CAUSE' },
                  { label: 'Corrective Action Plan', value: selectedFinding?.correctiveAction, key: 'CORRECTIVE' },
                  { label: 'Preventive Action Plan', value: selectedFinding?.preventiveAction, key: 'PREVENTIVE' }
                ].map((a) => (
                  <Grid item xs={12} key={a.label}>
                    <Box sx={{ display: 'flex', gap: 2.5, alignItems: 'flex-start' }}>
                      <Card variant="outlined" sx={{ flex: 1, bgcolor: 'grey.50', border: '1px solid', borderColor: 'divider' }}>
                        <CardContent sx={{ p: 2 }}>
                          <Typography variant="caption" sx={{ fontWeight: 800, color: 'primary.main', mb: 1, display: 'block' }}>{a.label.toUpperCase()}</Typography>
                          <Typography variant="body2" sx={{ lineHeight: 1.6, color: 'text.primary' }}>{a.value || 'No content provided'}</Typography>
                        </CardContent>
                      </Card>
                      {getAttachment(a.key) && (
                        <Tooltip title="Preview Proof">
                          <IconButton size="small" color="secondary" onClick={() => window.open(`/api/files/view/${getAttachment(a.key).fileName}`, '_blank')} sx={{ mt: 1, border: '1px solid', borderColor: 'divider', p: 1.5 }}>
                            <IconEye size={20} />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </Grid>
                ))}
                <R lg={6}><BOSTextField label="Planned Target Date" value={selectedFinding?.targetDate ? format(new Date(selectedFinding.targetDate), 'dd/MM/yyyy') : ''} inputProps={{ readOnly: true }} InputLabelProps={{ shrink: true }} /></R>
                <Grid item xs={12}>
                  <BOSTextField required label="Approver Remarks" name="remarks" value={formData.remarks} onChange={handleFormChange} multiline rows={3} error={!!errors.remarks} helperText={errors.remarks} placeholder="Enter approval or rejection remarks here..." InputLabelProps={{ shrink: true }} />
                </Grid>
              </Grid>
            </BOSFormSection>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <BOSFormSection title="Personnel Information" icon={<IconUser size={20} color={theme.palette.primary.main} />}>
              <Stack spacing={3}>
                <BOSPersonnelCard 
                    title="Auditee / Owner" 
                    name={selectedFinding?.auditee} 
                    empCode={getEmployeeDetails(selectedFinding?.auditee).empCode}
                    department={getEmployeeDetails(selectedFinding?.auditee).departmentName}
                    color="primary.main"
                />
                <BOSPersonnelCard 
                    title="Auditor / Reviewer" 
                    name={selectedFinding?.auditor} 
                    empCode={getEmployeeDetails(selectedFinding?.auditor).empCode}
                    department={getEmployeeDetails(selectedFinding?.auditor).departmentName}
                    color="secondary.main"
                />
              </Stack>
            </BOSFormSection>

            <BOSFormSection title="Attachment Gallery" icon={<IconFileDescription size={20} color={theme.palette.warning.main} />}>
              <Stack spacing={2}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.secondary', borderBottom: '1px solid', borderColor: 'divider', pb: 0.5 }}>CLOSURE EVIDENCE</Typography>
                <BOSFileGallery files={attachments} maxHeight={400} />
              </Stack>
            </BOSFormSection>
          </Box>
        </Box>
      </BOSFormDialog>
    </MainCard>
  );
}
