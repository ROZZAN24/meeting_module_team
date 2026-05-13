import { useState, useEffect, useCallback, useMemo } from 'react';
import { Typography, Stack, Button, Tooltip, IconButton, Box, Grid, useTheme, Chip } from '@mui/material';
import { IconAlertTriangle, IconFileDownload, IconCircleCheck, IconRefresh, IconUser, IconEdit, IconPlus } from '@tabler/icons-react';
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
  BOSActionSection, 
  useBOSForm, 
  btnExport, 
  getStatusChipSx 
} from 'ui-component/bos';

// ==============================|| AUDIT NCR / OFI CLOSURE (REFACTORED WITH PATTERNS) ||============================== //

const columns = [
  { id: 'index', label: '#', minWidth: 50 },
  { id: 'observationNo', label: 'OBSERVATION NO', minWidth: 130, bold: true },
  { id: 'observationDate', label: 'OBSERVATION DATE', minWidth: 130 },
  { id: 'targetDate', label: 'TARGET DATE', minWidth: 120 },
  { id: 'auditScheduleNo', label: 'SCHEDULE NO', minWidth: 120 },
  { id: 'auditType', label: 'AUDIT TYPE', minWidth: 120 },
  { id: 'departmentName', label: 'DEPARTMENT', minWidth: 120 },
  { id: 'seqNo', label: 'SEQ NO', minWidth: 80 },
  { id: 'clause', label: 'CLAUSE', minWidth: 80 },
  { id: 'criteriaDetails', label: 'CRITERIA DETAILS', minWidth: 250 },
  { id: 'auditee', label: 'AUDITEE NAME', minWidth: 150 },
  { id: 'ncrApprovedBy', label: 'NCR APPROVED BY', minWidth: 150 },
  { id: 'attachmentReq', label: 'ATTACH REQ', minWidth: 100 },
  { id: 'observationStatus', label: 'OBR STATUS', minWidth: 100 },
  { id: 'ncrStatus', label: 'APPROVAL STATUS', minWidth: 130 },
  { id: 'delayDays', label: 'DELAY DAYS', minWidth: 100 }
];

const R = ({ children, lg = 6 }) => <Grid item xs={12} md={lg}>{children}</Grid>;

export default function AuditNcrClose() {
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
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [nextNcrNo, setNextNcrNo] = useState('');

  // Use the new useBOSForm hook to handle state and eliminate uncontrolled input warnings
  const { formData, handleFormChange, updateForm, resetForm } = useBOSForm({
    rootCause: '', correctiveAction: '', preventiveAction: '', targetDate: ''
  });

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
      { id: 'observationStatus', label: 'Status', type: 'select', options: [{ value: 'All', label: 'ALL' }, { value: 'NCR', label: 'NCR' }, { value: 'OFI', label: 'OFI' }], defaultValue: 'All' },
      { id: 'searchBy', label: 'Search By', type: 'select', options: [{ value: 'observationNo', label: 'Observation No' }, { value: 'ncrNo', label: 'NCR No' }], defaultValue: 'observationNo' }
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

  const handleOpenClose = async (row) => {
    setSelectedFinding(row);
    updateForm({ 
        rootCause: row.rootCause || '', 
        correctiveAction: row.correctiveAction || '', 
        preventiveAction: row.preventiveAction || '', 
        targetDate: row.targetDate ? format(new Date(row.targetDate), 'yyyy-MM-dd') : '' 
    });
    setUploadedFiles([]);
    setErrors({});
    
    try {
      const res = await axios.get('/api/qms/ncr-ofi/next-no/' + row.observationStatus);
      setNextNcrNo(res.data);
    } catch (e) { setNextNcrNo('N/A'); }
    
    setDialogOpen(true);
  };

  const handleFileSelect = (category, file) => {
    if (!file) return;
    if (file.size > 20 * 1024 * 1024) {
      dispatch(openSnackbar({ open: true, message: 'File size exceeds 20MB limit', severity: 'error' }));
      return;
    }
    setUploadedFiles(prev => {
      const filtered = prev.filter(f => f.docDetails !== category);
      return [...filtered, { file, name: file.name, docDetails: category }];
    });
  };

  const handleSaveClose = async () => {
    const newErrors = {};
    if (!formData.rootCause) newErrors.rootCause = 'Root Cause is required';
    if (!formData.correctiveAction) newErrors.correctiveAction = 'Corrective Action is required';
    if (!formData.preventiveAction) newErrors.preventiveAction = 'Preventive Action is required';
    if (!formData.targetDate) newErrors.targetDate = 'Target Date is required';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const payload = {
        observationDetailId: selectedFinding.id,
        observationId: selectedFinding.observationId,
        type: selectedFinding.observationStatus,
        ...formData,
        ncrOfiNo: nextNcrNo,
        observationDate: selectedFinding.observationDate,
        fileCategories: uploadedFiles.map(f => ({ fileName: f.name, docDetails: f.docDetails }))
      };

      const submitData = new FormData();
      submitData.append('data', JSON.stringify(payload));
      uploadedFiles.forEach(f => submitData.append('files', f.file));

      console.log('Submitting NCR Closure Payload:', payload);
      console.log('Files to upload:', uploadedFiles.map(f => f.name));

      await axios.post('/api/qms/ncr-ofi', submitData);
      dispatch(openSnackbar({ open: true, message: 'NCR / OFI submitted for closure successfully!', severity: 'success' }));
      setDialogOpen(false);
      fetchData();
    } catch (e) {
      console.error('Submission Error:', e);
      const msg = e.response?.data?.message || e.response?.data || e.message || 'Failed to submit closure';
      dispatch(openSnackbar({ 
        open: true, 
        message: `Submission Failed: ${typeof msg === 'string' ? msg : 'Internal Server Error'}`, 
        severity: 'error',
        variant: 'alert'
      }));
    }
  };

  const renderCell = (col, row, idx) => {
    if (col.id === 'index') return idx + 1 + page * size;
    if (col.id === 'observationStatus') return <Chip label={row.observationStatus} size="small" color={row.observationStatus === 'NCR' ? 'error' : 'warning'} />;
    if (col.id === 'ncrStatus') {
        const status = row.ncrStatus || 'OPEN';
        return <Chip label={status.replace('_', ' ')} size="small" sx={getStatusChipSx(status === 'CLOSED' ? 'ACTIVE' : (status === 'OPEN' ? 'INACTIVE' : 'PENDING'))} />;
    }
    if (col.id === 'delayDays') {
        if (!row.targetDate) return '0';
        const d = differenceInDays(new Date(), new Date(row.targetDate));
        return (
            <Typography variant="body2" color={d > 0 ? 'error.main' : 'text.primary'} sx={{ fontWeight: d > 0 ? 700 : 400 }}>
                {d > 0 ? `${d} Days` : '0'}
            </Typography>
        );
    }
    const val = row[col.id];
    if (['observationDate', 'targetDate', 'createdDate'].includes(col.id)) return val ? format(new Date(val), 'dd/MM/yyyy') : '-';
    return String(val || '-');
  };

  return (
    <MainCard
      title={<Stack direction="row" alignItems="center" spacing={1.5}><IconCircleCheck size={24} /><Typography variant="h3">Close NCR / OFI Findings</Typography></Stack>}
      secondary={
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Tooltip title="Refresh"><IconButton onClick={fetchData} color="primary" size="small" sx={{ border: '2px solid', borderColor: 'divider', borderRadius: '8px', p: 1 }}><IconRefresh size={20} /></IconButton></Tooltip>
          <BOSExportButton
            data={rows}
            filename="NCR_Closure_List"
            columns={[
              { header: 'OBSERVATION NO', key: 'observationNo' },
              { header: 'OBSERVATION DATE', key: 'observationDate' },
              { header: 'SCHEDULE NO', key: 'auditScheduleNo' },
              { header: 'DEPARTMENT', key: 'departmentName' },
              { header: 'APPROVAL STATUS', key: 'ncrStatus' }
            ]}
          />
        </Stack>
      }
    >
      <BOSDataTable columns={columns} rows={rows.slice(page * size, page * size + size)} page={page} size={size} totalCount={rows.length} loading={loading} onPageChange={setPage} onSizeChange={setSize} onDoubleClickRow={handleOpenClose} renderCell={renderCell} customActions={(row) => (<Tooltip title="Submit for Closure"><IconButton size="small" color="primary" onClick={() => handleOpenClose(row)} disabled={row.ncrStatus === 'CLOSED' || row.ncrStatus === 'WAITING_APPROVAL'} sx={{ bgcolor: 'primary.light', color: 'primary.dark', '&:hover': { bgcolor: 'primary.main', color: 'white' } }}><IconCircleCheck size={18} /></IconButton></Tooltip>)} />

      <BOSFormDialog open={dialogOpen} onClose={() => setDialogOpen(false)} onSave={handleSaveClose} onClear={resetForm} title="Submit NCR / OFI for Closure" maxWidth="lg">
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1.8fr 1.2fr' }, gap: 4, width: '100%' }}>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <BOSFormSection title="Finding Summary" icon={<IconAlertTriangle size={20} color={theme.palette.error.main} />}>
              <Grid container spacing={3.5}>
                <R lg={4}><BOSTextField label="Observation No" value={selectedFinding?.observationNo || ''} inputProps={{ readOnly: true }} InputLabelProps={{ shrink: true }} /></R>
                <R lg={4}><BOSTextField label="NCR / OFI No" value={nextNcrNo || ''} inputProps={{ readOnly: true }} InputLabelProps={{ shrink: true }} /></R>
                <R lg={4}><BOSTextField label="Observation Date" value={selectedFinding?.observationDate ? format(new Date(selectedFinding.observationDate), 'dd/MM/yyyy') : ''} inputProps={{ readOnly: true }} InputLabelProps={{ shrink: true }} /></R>
                <R lg={6}><BOSTextField label="Audit Type" value={selectedFinding?.auditType || ''} inputProps={{ readOnly: true }} InputLabelProps={{ shrink: true }} /></R>
                <R lg={6}><BOSTextField label="Department" value={selectedFinding?.departmentName || ''} inputProps={{ readOnly: true }} InputLabelProps={{ shrink: true }} /></R>
                <Grid item xs={12}><BOSTextField label="Audit Criteria Details" value={selectedFinding?.criteriaDetails || ''} multiline rows={2} inputProps={{ readOnly: true }} InputLabelProps={{ shrink: true }} /></Grid>
              </Grid>
            </BOSFormSection>

            <BOSFormSection title="Closure Action Plan" icon={<IconEdit size={20} color={theme.palette.secondary.main} />}>
              <Grid container spacing={3.5}>
                {[
                  { id: 'rootCause', label: 'Root Cause', key: 'ROOT_CAUSE' },
                  { id: 'correctiveAction', label: 'Corrective Action', key: 'CORRECTIVE' },
                  { id: 'preventiveAction', label: 'Preventive Action', key: 'PREVENTIVE' }
                ].map((a) => (
                  <BOSActionSection
                    key={a.id}
                    label={a.label}
                    name={a.id}
                    value={formData[a.id]}
                    onChange={handleFormChange}
                    onFileSelect={(file) => handleFileSelect(a.key, file)}
                    onFilePreview={() => window.open(URL.createObjectURL(uploadedFiles.find(f => f.docDetails === a.key).file), '_blank')}
                    onFileRemove={() => setUploadedFiles(p => p.filter(f => f.docDetails !== a.key))}
                    hasFile={uploadedFiles.some(f => f.docDetails === a.key)}
                    fileName={uploadedFiles.find(f => f.docDetails === a.key)?.name}
                    error={errors[a.id]}
                    helperText={errors[a.id]}
                  />
                ))}
                <R><BOSTextField required label="Closure Target Date" name="targetDate" type="date" value={formData.targetDate} onChange={handleFormChange} InputLabelProps={{ shrink: true }} error={!!errors.targetDate} helperText={errors.targetDate} /></R>
              </Grid>
            </BOSFormSection>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <BOSFormSection title="Personnel Information" icon={<IconUser size={20} color={theme.palette.primary.main} />}>
              <Stack spacing={3}>
                <BOSPersonnelCard 
                    title="Auditor" 
                    name={selectedFinding?.auditor} 
                    empCode={getEmployeeDetails(selectedFinding?.auditor).empCode}
                    department={getEmployeeDetails(selectedFinding?.auditor).departmentName}
                    color="primary.main"
                />
                <BOSPersonnelCard 
                    title="NCR Approved By" 
                    name={selectedFinding?.ncrApprovedBy} 
                    empCode={getEmployeeDetails(selectedFinding?.ncrApprovedBy).empCode}
                    department={getEmployeeDetails(selectedFinding?.ncrApprovedBy).departmentName}
                    color="secondary.main"
                />
              </Stack>
            </BOSFormSection>

            <BOSFormSection title="Observation Evidence" icon={<IconPlus size={20} color={theme.palette.warning.main} />}>
               <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', p: 1 }}>No observation attachments found.</Typography>
            </BOSFormSection>
          </Box>
        </Box>
      </BOSFormDialog>
    </MainCard>
  );
}
