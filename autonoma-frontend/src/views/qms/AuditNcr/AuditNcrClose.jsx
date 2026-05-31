import { useState, useEffect, useCallback, useMemo } from 'react';
import { Typography, Stack, Button, Tooltip, IconButton, Box, Grid, useTheme, Chip, MenuItem } from '@mui/material';
import { IconAlertTriangle, IconFileDownload, IconEye, IconCircleCheck, IconRefresh, IconUser, IconEdit, IconPlus, IconDeviceFloppy, IconEraser } from '@tabler/icons-react';
import { getFileDownloadUrl, getFileViewUrl } from 'utils/upload-helper';
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
  btnNew,
  btnSave,
  getStatusChipSx 
} from 'ui-component/bos';
import usePagePermissions, { PAGE_CODES } from 'hooks/usePagePermissions';

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
  { id: 'ncrApprovedBy', label: 'NC APPROVED BY', minWidth: 150 },
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
  const perms = usePagePermissions(PAGE_CODES.QMS_AUDIT_NCR_CLOSE);

  const [rows, setRows] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [criteriaList, setCriteriaList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedFinding, setSelectedFinding] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [nextNcrNo, setNextNcrNo] = useState('');
  const [isNewMode, setIsNewMode] = useState(false);
  const [ncrAttachments, setNcrAttachments] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);

  const matchingCriteria = useMemo(() => {
    if (!selectedFinding || !criteriaList.length) return null;
    // Try matching by seqNo first, then by clause + auditType as fallback
    let match = criteriaList.find(c => String(c.seqNo) === String(selectedFinding.seqNo));
    if (!match && selectedFinding.clause) {
      match = criteriaList.find(c => 
        String(c.clause).toLowerCase() === String(selectedFinding.clause).toLowerCase() &&
        (!selectedFinding.auditType || !c.auditType || 
          String(c.auditType).toLowerCase().includes(String(selectedFinding.auditType).toLowerCase()))
      );
    }
    return match;
  }, [selectedFinding, criteriaList]);

  const criteriaAttachments = useMemo(() => {
    if (!matchingCriteria?.attachmentInfo) return [];
    try {
      const parsed = JSON.parse(matchingCriteria.attachmentInfo);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }, [matchingCriteria]);

  // Parse observation detail attachments robustly (single path, comma-separated, or JSON)
  const observationAttachments = useMemo(() => {
    const path = selectedFinding?.attachmentPath;
    if (!path || !path.trim()) return [];
    // Try parsing as JSON first (in case it was stored as JSON array)
    try {
      const parsed = JSON.parse(path);
      if (Array.isArray(parsed)) {
        return parsed.map(item => ({
          fileName: item.fileName || item.serverFileName?.split('/').pop() || 'Document',
          serverFileName: item.serverFileName || item.filePath || ''
        }));
      }
    } catch (e) {
      // Not JSON, treat as path string
    }
    // Split by comma for multiple paths, filter empties
    return path.split(',').filter(Boolean).map(p => ({
      fileName: p.trim().split('/').pop(),
      serverFileName: p.trim()
    }));
  }, [selectedFinding]);

  // Use the new useBOSForm hook to handle state and eliminate uncontrolled input warnings
  const { formData, handleFormChange, updateForm, resetForm } = useBOSForm({
    rootCause: '', correctiveAction: '', preventiveAction: '', targetDate: ''
  });

  const [errors, setErrors] = useState({});

  const handleOpenNew = () => {
    setIsNewMode(true);
    setSelectedFinding(null);
    resetForm();
    setUploadedFiles([]);
    setNcrAttachments([]);
    setErrors({});
    setNextNcrNo('');
    setDialogOpen(true);
  };

  // Fetch NCR-specific attachments uploaded during previous closure submissions
  const fetchNcrAttachments = async (detailId) => {
    try {
      const res = await axios.get(`/api/qms/ncr-ofi/attachments/${detailId}`);
      setNcrAttachments(res.data || []);
    } catch (e) {
      setNcrAttachments([]);
    }
  };

  const handleFindingSelectChange = async (e) => {
    const findingId = e.target.value;
    const row = rows.find(r => r.id === findingId);
    if (row) {
      setSelectedFinding(row);
      updateForm({
        rootCause: row.rootCause || '',
        correctiveAction: row.correctiveAction || '',
        preventiveAction: row.preventiveAction || '',
        targetDate: row.targetDate ? format(new Date(row.targetDate), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd')
      });
      setUploadedFiles([]);
      setErrors({});
      fetchNcrAttachments(row.id);
      try {
        const res = await axios.get('/api/qms/ncr-ofi/next-no/' + row.observationStatus);
        setNextNcrNo(res.data);
      } catch (err) {
        setNextNcrNo('N/A');
      }
    } else {
      setSelectedFinding(null);
      resetForm();
      setNextNcrNo('');
      setNcrAttachments([]);
    }
  };

  const handleReset = () => {
    resetForm();
    setUploadedFiles([]);
    setErrors({});
    if (isNewMode) {
      setSelectedFinding(null);
      setNextNcrNo('');
      setNcrAttachments([]);
    } else if (selectedFinding) {
      updateForm({
        rootCause: selectedFinding.rootCause || '',
        correctiveAction: selectedFinding.correctiveAction || '',
        preventiveAction: selectedFinding.preventiveAction || '',
        targetDate: selectedFinding.targetDate ? format(new Date(selectedFinding.targetDate), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd')
      });
    }
  };

  const getEmployeeDetails = (input) => {
    if (!input) return {};
    const parts = input.split(' - ');
    const emp = employees.find(e => e.employeeName === parts[0]?.trim() || e.empCode === input);
    if (!emp) return { empCode: parts[1]?.trim() || '-', departmentName: '-', level: '-' };
    return {
      ...emp,
      departmentName: emp.department?.departmentName || '-',
      level: emp.empLevelId ? `L${emp.empLevelId}` : '-'
    };
  };

  useEffect(() => {
    dispatch(setFilterConfig([
      { id: 'fromDate', label: 'From Date', type: 'date', defaultValue: format(new Date().setMonth(new Date().getMonth() - 6), 'yyyy-MM-dd') },
      { id: 'toDate', label: 'To Date', type: 'date', defaultValue: format(new Date(), 'yyyy-MM-dd') },
      { id: 'considerDate', label: 'Consider Date?', type: 'select', options: [{ value: 'Yes', label: 'Yes' }, { value: 'No', label: 'No' }], defaultValue: 'No' },
      { id: 'observationStatus', label: 'Status', type: 'select', options: [{ value: 'All', label: 'ALL' }, { value: 'NC', label: 'NC' }, { value: 'OFI', label: 'OFI' }], defaultValue: 'All' },
      { id: 'searchBy', label: 'Search By', type: 'select', options: [{ value: 'observationNo', label: 'Observation No' }, { value: 'ncrNo', label: 'NC No' }], defaultValue: 'observationNo' }
    ]));
    return () => dispatch(setFilterConfig(null));
  }, [dispatch]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setSelectedRecord(null);
    try {
      const [fRes, eRes, cRes] = await Promise.all([
        axios.get('/api/qms/audit/observation/ncr/findings', { params: { ...globalFilters, query: globalQuery } }),
        axios.get('/api/master/hr/employees'),
        axios.get('/api/master/qms/audit-criteria')
      ]);
      setRows(fRes.data || []);
      setEmployees(eRes.data || []);
      setCriteriaList(cRes.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [globalFilters, globalQuery]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleOpenClose = async (row) => {
    setIsNewMode(false);
    setSelectedFinding(row);
    updateForm({ 
        rootCause: row.rootCause || '', 
        correctiveAction: row.correctiveAction || '', 
        preventiveAction: row.preventiveAction || '', 
        targetDate: row.targetDate ? format(new Date(row.targetDate), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd')
    });
    setUploadedFiles([]);
    setErrors({});
    fetchNcrAttachments(row.id);
    
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
    if (isNewMode && !selectedFinding) {
      newErrors.observationNo = 'Observation is required';
      setErrors(newErrors);
      return;
    }
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
      dispatch(openSnackbar({ open: true, message: 'NC / OFI submitted for closure successfully!', severity: 'success' }));
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
    if (col.id === 'observationStatus') return <Chip label={row.observationStatus} size="small" color={row.observationStatus === 'NC' || row.observationStatus === 'NCR' ? 'error' : 'warning'} />;
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
      title={<Stack direction="row" alignItems="center" spacing={1.5}><IconCircleCheck size={24} /><Typography variant="h3">Close NC / OFI Findings</Typography></Stack>}
      secondary={
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Tooltip title="Refresh"><IconButton onClick={fetchData} color="primary" size="small" sx={{ border: '2px solid', borderColor: 'divider', borderRadius: '8px', p: 1 }}><IconRefresh size={20} /></IconButton></Tooltip>
          {perms.export && <BOSExportButton
            data={rows}
            filename="NC_Closure_List"
            columns={[
              { header: 'OBSERVATION NO', key: 'observationNo' },
              { header: 'OBSERVATION DATE', key: 'observationDate' },
              { header: 'SCHEDULE NO', key: 'auditScheduleNo' },
              { header: 'DEPARTMENT', key: 'departmentName' },
              { header: 'APPROVAL STATUS', key: 'ncrStatus' }
            ]}
          />}
          {perms.write && (
            <Tooltip title={selectedRecord ? "Close Selected NCR / OFI" : "Select a record first to close"}>
              <span>
                <Button
                  variant="contained"
                  color="primary"
                  size="medium"
                  onClick={() => selectedRecord && handleOpenClose(selectedRecord)}
                  disabled={!selectedRecord}
                  sx={btnNew}
                >
                  Close NCR / OFI
                </Button>
              </span>
            </Tooltip>
          )}
        </Stack>
      }
    >
      <BOSDataTable columns={columns} rows={rows.slice(page * size, page * size + size)} page={page} size={size} totalCount={rows.length} loading={loading} onPageChange={setPage} onSizeChange={setSize} onDoubleClickRow={handleOpenClose} renderCell={renderCell} selectedRowId={selectedRecord?.id} onClickRow={(row) => setSelectedRecord(row)} customActions={(row) => (<Tooltip title="Submit for Closure"><IconButton size="small" color="primary" onClick={() => handleOpenClose(row)} disabled={row.ncrStatus === 'CLOSED' || row.ncrStatus === 'WAITING_APPROVAL'} sx={{ bgcolor: 'primary.light', color: 'primary.dark', '&:hover': { bgcolor: 'primary.main', color: 'white' } }}><IconCircleCheck size={18} /></IconButton></Tooltip>)} />

      <BOSFormDialog open={dialogOpen} onClose={() => setDialogOpen(false)} title="NCR / OFI Details" maxWidth="lg" hideFooter={true}>
        <Stack spacing={3} sx={{ width: '100%' }}>
          {/* Custom Premium Metadata Header Bar */}
          <Box sx={{ 
            bgcolor: '#e3f2fd', 
            borderRadius: '12px', 
            p: 2, 
            display: 'flex', 
            flexWrap: 'wrap', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            gap: 2,
            border: '1px solid',
            borderColor: 'primary.light',
            boxShadow: '0 2px 8px rgba(33, 150, 243, 0.05)',
            width: '100%'
          }}>
            <Stack direction="row" spacing={3} useFlexGap flexWrap="wrap" alignItems="center">
              <Typography variant="subtitle1" sx={{ color: '#0A2540', fontWeight: 600 }}>
                NCR No : <Box component="span" sx={{ color: 'primary.main', fontWeight: 800 }}>{selectedFinding?.ncrNo || nextNcrNo || '-'}</Box>
              </Typography>
              <Typography variant="subtitle1" sx={{ color: '#0A2540', fontWeight: 600 }}>
                Date : <Box component="span" sx={{ color: 'primary.main', fontWeight: 800 }}>{selectedFinding?.observationDate ? format(new Date(selectedFinding.observationDate), 'dd/MM/yyyy') : format(new Date(), 'dd/MM/yyyy')}</Box>
              </Typography>
              <Typography variant="subtitle1" sx={{ color: '#0A2540', fontWeight: 600 }}>
                Observation No : <Box component="span" sx={{ color: 'primary.main', fontWeight: 800 }}>{selectedFinding?.observationNo || '-'}</Box>
              </Typography>
              <Typography variant="subtitle1" sx={{ color: '#0A2540', fontWeight: 600 }}>
                Schedule No : <Box component="span" sx={{ color: 'primary.main', fontWeight: 800 }}>{selectedFinding?.auditScheduleNo || '-'}</Box>
              </Typography>
              <Typography variant="subtitle1" sx={{ color: '#0A2540', fontWeight: 600 }}>
                Status : <Box component="span" sx={{ color: 'primary.main', fontWeight: 800 }}>{selectedFinding?.ncrStatus || 'PENDING'}</Box>
              </Typography>
              <Typography variant="subtitle1" sx={{ color: '#0A2540', fontWeight: 600 }}>
                Delay Days : <Box component="span" sx={{ color: 'error.main', fontWeight: 800 }}>{selectedFinding?.targetDate ? Math.max(0, differenceInDays(new Date(), new Date(selectedFinding.targetDate))) : '0'}</Box>
              </Typography>
            </Stack>

            <Stack direction="row" spacing={1.5}>
              <Button 
                variant="contained" 
                startIcon={<IconDeviceFloppy size={18} />} 
                onClick={handleSaveClose}
                sx={btnSave}
              >
                Save
              </Button>
            </Stack>
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1.8fr 1.2fr' }, gap: 4, width: '100%' }}>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              {!isNewMode ? (
                <BOSTextField label="Observation No" value={selectedFinding?.observationNo || ''} inputProps={{ readOnly: true }} InputLabelProps={{ shrink: true }} />
              ) : (
                <BOSTextField
                  select
                  label="Observation No *"
                  name="observationNoSelect"
                  value={selectedFinding?.id || ''}
                  onChange={handleFindingSelectChange}
                  error={!!errors.observationNo}
                  helperText={errors.observationNo}
                  InputLabelProps={{ shrink: true }}
                >
                  <MenuItem value=""><em>— Select Observation —</em></MenuItem>
                  {rows
                    .filter(r => r.ncrStatus !== 'CLOSED' && r.ncrStatus !== 'WAITING_APPROVAL')
                    .map(r => (
                      <MenuItem key={r.id} value={r.id}>
                        {`${r.observationNo} (${r.observationStatus}) - ${r.criteriaDetails || ''}`.substring(0, 100)}
                      </MenuItem>
                    ))}
                </BOSTextField>
              )}
              <BOSTextField label="Audit Type" value={selectedFinding?.auditType || ''} inputProps={{ readOnly: true }} InputLabelProps={{ shrink: true }} />
              <BOSTextField label="Audit Area" value={selectedFinding?.auditAreaDetail || selectedFinding?.departmentName || 'ALL DEPARTMENTS'} inputProps={{ readOnly: true }} InputLabelProps={{ shrink: true }} />
              
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
                  rows={2}
                />
              ))}

              <BOSTextField label="Observation" value={selectedFinding?.clause || ''} multiline rows={2} inputProps={{ readOnly: true }} InputLabelProps={{ shrink: true }} />
              <BOSTextField label="Audit Criteria Details" value={selectedFinding?.criteriaDetails || ''} multiline rows={2} inputProps={{ readOnly: true }} InputLabelProps={{ shrink: true }} />
              <BOSTextField label="Observation Comment" value={selectedFinding?.remarks || ''} multiline rows={2} inputProps={{ readOnly: true }} InputLabelProps={{ shrink: true }} />
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <BOSFormSection title="Personnel Information" icon={<IconUser size={20} color={theme.palette.primary.main} />}>
                <Stack spacing={3}>
                  <BOSPersonnelCard 
                      title="Auditor" 
                      name={selectedFinding?.auditor} 
                      empCode={getEmployeeDetails(selectedFinding?.auditor).empCode}
                      department={getEmployeeDetails(selectedFinding?.auditor).departmentName}
                      photo={getEmployeeDetails(selectedFinding?.auditor).employeePhotoUpload}
                      level={getEmployeeDetails(selectedFinding?.auditor).level}
                      color="primary.main"
                  />
                  <BOSPersonnelCard 
                      title="NCR Approved By" 
                      name={selectedFinding?.ncrApprovedBy} 
                      empCode={getEmployeeDetails(selectedFinding?.ncrApprovedBy).empCode}
                      department={getEmployeeDetails(selectedFinding?.ncrApprovedBy).departmentName}
                      photo={getEmployeeDetails(selectedFinding?.ncrApprovedBy).employeePhotoUpload}
                      level={getEmployeeDetails(selectedFinding?.ncrApprovedBy).level}
                      color="secondary.main"
                  />
                </Stack>
              </BOSFormSection>
            </Box>
          </Box>

          {/* Double Document Panel at bottom */}
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, width: '100%', mt: 2 }}>
            {/* Criteria Document */}
            <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '8px', overflow: 'hidden' }}>
              <Box sx={{ bgcolor: '#ffe082', color: 'rgba(0, 0, 0, 0.87)', py: 1, px: 2, textAlign: 'center', fontWeight: 700, fontSize: '0.85rem' }}>
                Criteria Document
              </Box>
              <Box sx={{ p: 2, minHeight: '180px', bgcolor: 'background.paper' }}>
                {criteriaAttachments.length > 0 ? (
                  <Box sx={{ 
                    border: '1px solid', 
                    borderColor: 'success.light', 
                    borderRadius: '6px', 
                    p: 2, 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: 1.5,
                    bgcolor: 'rgba(76, 175, 80, 0.02)'
                  }}>
                    {criteriaAttachments.map((att, idx) => {
                      const path = att.serverFileName || att.filePath || '';
                      const fileName = att.fileName || path.split('/').pop();
                      const downloadUrl = getFileDownloadUrl(path);
                      const viewUrl = getFileViewUrl(path);
                      return (
                        <Stack 
                          key={idx} 
                          direction="row" 
                          spacing={1.5} 
                          alignItems="center" 
                          sx={{ 
                            p: 1, 
                            borderRadius: '6px',
                            border: '1px dashed transparent',
                            '&:hover': { 
                              bgcolor: 'rgba(76, 175, 80, 0.05)',
                              borderColor: 'success.main'
                            } 
                          }}
                        >
                          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'success.dark' }}>
                            {idx + 1}.
                          </Typography>
                          <Typography 
                            variant="subtitle2" 
                            sx={{ 
                              fontWeight: 700, 
                              color: 'primary.main', 
                              flex: 1 
                            }}
                          >
                            {fileName}
                          </Typography>
                          <Tooltip title="View Document">
                            <IconButton 
                              size="small" 
                              color="primary"
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(viewUrl, '_blank');
                              }}
                            >
                              <IconEye size={18} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Download Document">
                            <IconButton 
                              size="small" 
                              color="primary"
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(downloadUrl, '_blank');
                              }}
                            >
                              <IconFileDownload size={18} />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      );
                    })}
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '140px' }}>
                    <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                      No criteria attachments found.
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>

            {/* Observation Document */}
            <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '8px', overflow: 'hidden' }}>
              <Box sx={{ bgcolor: '#ffe082', color: 'rgba(0, 0, 0, 0.87)', py: 1, px: 2, textAlign: 'center', fontWeight: 700, fontSize: '0.85rem' }}>
                Observation Document
              </Box>
              <Box sx={{ p: 2, minHeight: '180px', bgcolor: 'background.paper' }}>
                {observationAttachments.length > 0 || ncrAttachments.length > 0 ? (
                  <Box sx={{ 
                    border: '1px solid', 
                    borderColor: 'error.light', 
                    borderRadius: '6px', 
                    p: 2, 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: 1.5,
                    bgcolor: 'rgba(211, 47, 47, 0.02)'
                  }}>
                    {/* Observation detail attachments */}
                    {observationAttachments.map((att, idx) => {
                      const path = att.serverFileName || '';
                      const downloadUrl = getFileDownloadUrl(path);
                      const viewUrl = getFileViewUrl(path);
                      return (
                        <Stack 
                          key={`obs-${idx}`} 
                          direction="row" 
                          spacing={1.5} 
                          alignItems="center" 
                          sx={{ 
                            p: 1, 
                            borderRadius: '6px',
                            border: '1px dashed transparent',
                            '&:hover': { 
                              bgcolor: 'rgba(211, 47, 47, 0.05)',
                              borderColor: 'error.main'
                            } 
                          }}
                        >
                          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'error.main' }}>
                            {idx + 1}.
                          </Typography>
                          <Typography 
                            variant="subtitle2" 
                            sx={{ 
                              fontWeight: 700, 
                              color: 'primary.main', 
                              flex: 1 
                            }}
                          >
                            {att.fileName}
                          </Typography>
                          <Tooltip title="View Document">
                            <IconButton 
                              size="small" 
                              color="primary"
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(viewUrl, '_blank');
                              }}
                            >
                              <IconEye size={18} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Download Document">
                            <IconButton 
                              size="small" 
                              color="primary"
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(downloadUrl, '_blank');
                              }}
                            >
                              <IconFileDownload size={18} />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      );
                    })}
                    {/* NCR closure-specific attachments */}
                    {ncrAttachments.map((att, idx) => {
                      const path = att.filePath || att.serverFileName || '';
                      const downloadUrl = getFileDownloadUrl(path);
                      const viewUrl = getFileViewUrl(path);
                      return (
                        <Stack 
                          key={`ncr-${idx}`} 
                          direction="row" 
                          spacing={1.5} 
                          alignItems="center" 
                          sx={{ 
                            p: 1, 
                            borderRadius: '6px',
                            border: '1px dashed transparent',
                            '&:hover': { 
                              bgcolor: 'rgba(211, 47, 47, 0.05)',
                              borderColor: 'error.main'
                            } 
                          }}
                        >
                          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'error.main' }}>
                            {observationAttachments.length + idx + 1}.
                          </Typography>
                          <Typography 
                            variant="subtitle2" 
                            sx={{ 
                              fontWeight: 700, 
                              color: 'primary.main', 
                              flex: 1 
                            }}
                          >
                            {att.fileName || att.filePath?.split('/').pop() || 'Document'}
                          </Typography>
                          <Chip label={att.fileType || att.docDetails || 'NCR'} size="small" variant="outlined" color="error" sx={{ fontSize: '0.7rem' }} />
                          <Tooltip title="View Document">
                            <IconButton 
                              size="small" 
                              color="primary"
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(viewUrl, '_blank');
                              }}
                            >
                              <IconEye size={18} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Download Document">
                            <IconButton 
                              size="small" 
                              color="primary"
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(downloadUrl, '_blank');
                              }}
                            >
                              <IconFileDownload size={18} />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      );
                    })}
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '140px' }}>
                    <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                      No observation attachments found.
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          </Box>
        </Stack>
      </BOSFormDialog>
    </MainCard>
  );
}
