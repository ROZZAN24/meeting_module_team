import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Typography,
  Box,
  Button,
  MenuItem,
  Stack,
  useTheme,
  Tooltip,
  Chip,
  Card,
  CardContent,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent
} from '@mui/material';
import {
  IconCheck,
  IconEraser,
  IconFileText,
  IconCalendarEvent,
  IconUsers,
  IconListCheck,
  IconReportAnalytics,
  IconArrowLeft,
  IconPlus,
  IconUpload,
  IconEye
} from '@tabler/icons-react';
import axios from 'utils/axios';
import { sanitizeHTML } from 'utils/sanitize';
import { useDispatch } from 'react-redux';
import { openSnackbar } from 'store/slices/snackbar';
import MainCard from 'ui-component/cards/MainCard';
import {
  BOSFormSection,
  BOSTextField,
  BOSDataTable,
  btnSave,
  btnClear,
  getStatusChipSx
} from 'ui-component/bos';
import useBOSValidation from 'hooks/useBOSValidation';
import useKeyboardShortcuts, { shortcutTooltip } from 'hooks/useKeyboardShortcuts';
import { format } from 'date-fns';
import { API_PATHS } from 'utils/api-constants';
import { useLookups } from 'hooks/useLookups';
import { autoUploadFile } from 'utils/upload-helper';
import mammoth from 'mammoth';
import * as XLSX from 'xlsx';
import { IconX, IconDownload } from '@tabler/icons-react';

const VALIDATION_RULES = [
  { field: 'observationDate', label: 'Observation Date', required: true },
  { field: 'auditScheduleNo', label: 'Schedule No', required: true }
];

const OBS_STATUSES = ['COMPLIANCE', 'OFI', 'NCR'];

export default function AddAuditObservation() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const theme = useTheme();
  const isEditing = Boolean(id);
  const { errors, validate, clearErrors } = useBOSValidation();

  const [formData, setFormData] = useState({
    observationNo: '',
    observationDate: new Date().toISOString().split('T')[0],
    auditScheduleNo: '',
    auditType: '',
    departmentName: '',
    auditee: '',
    auditor: '',
    ncrApprovedBy: '',
    status: 'PENDING',
    auditScore: 0,
    ofiCount: 0,
    complianceCount: 0,
    ncrCount: 0
  });

  const [details, setDetails] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [previewData, setPreviewData] = useState({ url: '', name: '', type: '', content: '' });
  const { auditSchedules: schedules = [] } = useLookups(['AUDIT_SCHEDULE']);

  useEffect(() => {
    if (isEditing) {
      fetchObservation();
    } else {
      generateObservationNo();
    }
  }, [id, isEditing]);

  // Remove manual fetch as useLookups handles it now

  const generateObservationNo = async () => {
    try {
      const res = await axios.get(`${API_PATHS.QMS.AUDIT_OBSERVATION}/next-no`);
      setFormData(prev => ({ ...prev, observationNo: res.data || 'OB-001' }));
    } catch (e) { 
      setFormData(prev => ({ ...prev, observationNo: 'OB-001' })); 
    }
  };

  const fetchObservation = async () => {
    try {
      const res = await axios.get(`${API_PATHS.QMS.AUDIT_OBSERVATION}/${id}`);
      setFormData(res.data);
      setDetails(res.data.details || []);
      if (res.data.auditScheduleNo) fetchAttendance(res.data.auditScheduleNo);
    } catch (e) { console.error('Failed to fetch observation'); }
  };

  const fetchAttendance = async (scheduleNo) => {
    try {
      const res = await axios.get(`${API_PATHS.QMS.AUDIT_ATTENDANCE}/by-schedule/${scheduleNo}`);
      setAttendance(res.data || []);
    } catch (e) { console.error('Failed to fetch attendance'); }
  };

  const handleScheduleChange = (e) => {
    const schNo = e.target.value;
    const sch = schedules.find(s => s.scheduleNo === schNo);
    if (sch) {
      setFormData(prev => ({
        ...prev,
        auditScheduleNo: schNo,
        auditType: sch.auditType,
        departmentName: sch.department,
        auditee: sch.auditee,
        auditor: sch.auditor,
        ncrApprovedBy: sch.ncrApprovedBy
      }));
      setDetails(sch.criteriaList.map(c => ({
        seqNo: c.seqNo,
        clause: c.clause,
        criteriaDetails: c.criteriaDetails,
        attachmentReq: c.attachmentReq,
        observationStatus: 'COMPLIANCE',
        approvalStatus: 'PENDING',
        comments: ''
      })));
      fetchAttendance(schNo);
    }
  };

  const updateDetail = (idx, field, value) => {
    const newDetails = [...details];
    newDetails[idx][field] = value;
    setDetails(newDetails);
    recalculateCounts(newDetails);
  };

  const recalculateCounts = (currDetails) => {
    const counts = currDetails.reduce((acc, curr) => {
      acc[curr.observationStatus] = (acc[curr.observationStatus] || 0) + 1;
      return acc;
    }, {});

    const compliance = counts['COMPLIANCE'] || 0;
    const total = currDetails.length || 1;
    let score = Math.round((compliance / total) * 100);

    // SOP: NCR Aging Penalty Logic (SOP 5.3.3)
    const ncrCount = counts['NCR'] || 0;
    if (ncrCount > 0) {
      // Basic penalty: 5 points per NCR
      score = Math.max(0, score - (ncrCount * 5));
      
      // Additional aging penalty simulation (If this was real data, we'd check dates)
      // For now, we apply a 'Pending' status penalty as established in SOP
      if (formData.status === 'PENDING') score = Math.max(0, score - 10);
    }

    setFormData(prev => ({
      ...prev,
      complianceCount: compliance,
      ofiCount: counts['OFI'] || 0,
      ncrCount: ncrCount,
      auditScore: score
    }));
  };

  const handleFileUpload = (idx) => {
    // SOP: Supporting document upload for Compliance/OFI
    const input = document.createElement('input');
    input.type = 'file';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (file) {
        try {
          // autoUploadFile automatically detects the 'QMS' module from the URL path
          const uploadedPath = await autoUploadFile(file);
          
          updateDetail(idx, 'attachmentPath', uploadedPath);
          dispatch(openSnackbar({ 
            open: true, 
            message: `Evidence '${file.name}' uploaded successfully.`, 
            severity: 'success' 
          }));
        } catch (err) {
          console.error('Upload failed:', err);
          dispatch(openSnackbar({ 
            open: true, 
            message: 'Failed to upload evidence.', 
            severity: 'error' 
          }));
        }
      }
    };
    input.click();
  };

  const handlePreview = async (fileName) => {
    if (!fileName) return;
    const ext = fileName.includes('.') ? fileName.split('.').pop()?.toLowerCase() : '';
    
    setLoading(true);
    setPreviewOpen(true);
    setPreviewData({ url: '', name: fileName, type: '', content: '' });

    try {
      const baseUrl = (axios.defaults.baseURL || '').replace(/\/+$/, '');
      const filePath = API_PATHS.FILES.startsWith('/') ? API_PATHS.FILES : `/${API_PATHS.FILES}`;
      const url = `${baseUrl}${filePath}/view/${encodeURIComponent(fileName)}`;

      let content = '';
      if (['docx', 'doc', 'xlsx', 'xls'].includes(ext)) {
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        const arrayBuffer = response.data;

        if (ext === 'docx' || ext === 'doc') {
          const result = await mammoth.convertToHtml({ arrayBuffer });
          content = result.value;
        } else if (ext === 'xlsx' || ext === 'xls') {
          const workbook = XLSX.read(arrayBuffer, { type: 'array' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          content = XLSX.utils.sheet_to_html(firstSheet);
        }
      }

      setPreviewData({ url, name: fileName, type: ext, content });
    } catch (error) {
      console.error('Preview failed:', error);
      setPreviewData(prev => ({ ...prev, content: '<div style="padding: 20px; color: red;">Failed to load preview. Please download the file to view.</div>' }));
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!validate(formData, VALIDATION_RULES)) return;
    
    // SOP: Observation Transaction Validation (SOP 5.2.4)
    const missingComments = details.some(d => !d.comments || d.comments.trim() === '');
    if (missingComments) {
      dispatch(openSnackbar({ open: true, message: 'Comments are mandatory for all audit criteria.', severity: 'error', variant: 'alert' }));
      return;
    }

    // SOP: Mandatory Attachment Rule (SOP 5.1.4)
    const missingAttachments = details.some(d => d.attachmentReq === 'YES' && d.observationStatus !== 'NCR' && !d.attachmentPath);
    if (missingAttachments) {
      dispatch(openSnackbar({ open: true, message: 'Evidence attachment is mandatory for rows marked as "Attachment Required".', severity: 'error', variant: 'alert' }));
      return;
    }

    try {
      const payload = { ...formData, details };
      if (isEditing) {
        await axios.put(`${API_PATHS.QMS.AUDIT_OBSERVATION}/${id}`, payload);
      } else {
        await axios.post(API_PATHS.QMS.AUDIT_OBSERVATION, payload);
      }
      dispatch(openSnackbar({ open: true, message: 'Observation saved successfully!', severity: 'success', variant: 'alert' }));
      navigate('/qms/audit/observation');
    } catch (e) {
      dispatch(openSnackbar({ open: true, message: 'Failed to save observation', severity: 'error', variant: 'alert' }));
    }
  };

  useKeyboardShortcuts({
    'ctrl+s': handleSave,
    'escape': () => navigate('/qms/audit/observation')
  });

  return (
    <MainCard
      title={
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <IconFileText size={24} />
          <Typography variant="h3">Audit Observation {isEditing ? 'Edit' : 'Creation'}</Typography>
        </Stack>
      }
      secondary={
        <Stack direction="row" spacing={2}>
          <Button variant="outlined" startIcon={<IconArrowLeft size={20} />} onClick={() => navigate('/qms/audit/observation')}>Back</Button>
          <Button variant="contained" sx={btnClear} onClick={() => isEditing ? fetchObservation() : generateObservationNo()} startIcon={<IconEraser size={20} />}>Reset</Button>
          <Button variant="contained" sx={btnSave} onClick={handleSave} startIcon={<IconCheck size={20} />}>Save</Button>
        </Stack>
      }
    >
      <Stack spacing={3}>
        {/* Section 1: Header Information */}
        <BOSFormSection icon={<IconCalendarEvent size={20} color={theme.palette.primary.main} />} title="Observation Summary">
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 2.5 }}>
            <BOSTextField label="Observation No" value={formData.observationNo || ''} inputProps={{ readOnly: true }} />
            <BOSTextField required type="date" label="Observation Date" name="observationDate" value={formData.observationDate || ''} onChange={(e) => setFormData({ ...formData, observationDate: e.target.value })} InputLabelProps={{ shrink: true }} />
            <BOSTextField select required label="Schedule No" name="auditScheduleNo" value={formData.auditScheduleNo || ''} onChange={handleScheduleChange}>
              {schedules.map(s => <MenuItem key={s.id} value={s.scheduleNo}>{s.scheduleNo}</MenuItem>)}
            </BOSTextField>
            <BOSTextField label="Audit Type" value={formData.auditType || ''} inputProps={{ readOnly: true }} />
            <BOSTextField label="Department" value={formData.departmentName || ''} inputProps={{ readOnly: true }} />
            <BOSTextField label="Auditee" value={formData.auditee || ''} inputProps={{ readOnly: true }} />
            <BOSTextField label="Auditor" value={formData.auditor || ''} inputProps={{ readOnly: true }} />
            <BOSTextField label="NCR Approved By" value={formData.ncrApprovedBy || ''} inputProps={{ readOnly: true }} />
          </Box>
        </BOSFormSection>

        {/* Section 2: Attendance & Stats */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '3fr 1fr' }, gap: 3 }}>
          <BOSFormSection icon={<IconUsers size={20} color={theme.palette.secondary.main} />} title="Audit Attendance">
            <BOSDataTable
              columns={[
                { id: 'name', label: 'Name', minWidth: 150 },
                { id: 'inTime', label: 'In Time', minWidth: 100 },
                { id: 'outTime', label: 'Out Time', minWidth: 100 },
                { id: 'attendanceStatus', label: 'Status', minWidth: 100 }
              ]}
              rows={attendance}
              page={0}
              size={attendance.length || 5}
              loading={false}
              showActions={false}
              sx={{ maxHeight: '250px' }}
              renderCell={(col, row) => {
                if (col.id === 'attendanceStatus') return <Chip label={row.attendanceStatus} size="small" sx={getStatusChipSx(row.attendanceStatus === 'PRESENT' ? 'ACTIVE' : 'INACTIVE')} />;
                return row[col.id] || '-';
              }}
            />
          </BOSFormSection>

          <Card sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '12px' }}>
            <CardContent>
              <Stack spacing={2} alignItems="center">
                <IconReportAnalytics size={40} color={theme.palette.primary.main} />
                <Typography variant="h4">Audit Score</Typography>
                <Typography variant="h1" color="primary" sx={{ fontSize: '3rem', fontWeight: 800 }}>{formData.auditScore}%</Typography>
                <Box sx={{ width: '100%', mt: 2 }}>
                  <Stack spacing={1}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Compliance</Typography>
                      <Typography variant="body2" fontWeight={700}>{formData.complianceCount}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="warning.main">OFI</Typography>
                      <Typography variant="body2" fontWeight={700} color="warning.main">{formData.ofiCount}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="error.main">NCR</Typography>
                      <Typography variant="body2" fontWeight={700} color="error.main">{formData.ncrCount}</Typography>
                    </Box>
                  </Stack>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Box>

        {/* Section 3: Findings Checklist */}
        <BOSFormSection icon={<IconListCheck size={20} color={theme.palette.success.main} />} title="Audit Findings Checklist">
          <BOSDataTable
            columns={[
              { id: 'seqNo', label: 'Seq', minWidth: 50 },
              { id: 'clause', label: 'Clause', minWidth: 100 },
              { id: 'criteriaDetails', label: 'Criteria Details', minWidth: 250 },
              { id: 'attachmentReq', label: 'Req.', minWidth: 60 },
              { id: 'observationStatus', label: 'Status', minWidth: 150 },
              { id: 'approvalStatus', label: 'Approval', minWidth: 100 },
              { id: 'comments', label: 'Comments *', minWidth: 200 },
              { id: 'attachment', label: 'Evidence', minWidth: 80 }
            ]}
            rows={details}
            page={0}
            size={details.length || 10}
            showActions={false}
            sx={{ maxHeight: '500px' }}
            renderCell={(col, row, idx) => {
              if (col.id === 'observationStatus') {
                return (
                  <BOSTextField select size="small" value={row.observationStatus} onChange={(e) => updateDetail(idx, 'observationStatus', e.target.value)} fullWidth>
                    {OBS_STATUSES.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                  </BOSTextField>
                );
              }
              if (col.id === 'approvalStatus') {
                return <Chip label={row.approvalStatus} size="small" color={row.approvalStatus === 'APPROVED' ? 'success' : 'warning'} variant="outlined" />;
              }
              if (col.id === 'attachment') {
                return (
                  <Stack direction="row" spacing={0.5}>
                    <Tooltip title="Upload Evidence">
                      <IconButton size="small" color="primary" onClick={() => handleFileUpload(idx)}>
                        <IconUpload size={18} />
                      </IconButton>
                    </Tooltip>
                    {row.attachmentPath && (
                      <Tooltip title="Preview Evidence">
                        <IconButton size="small" color="secondary" onClick={() => handlePreview(row.attachmentPath)}>
                          <IconEye size={18} />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Stack>
                );
              }
              if (col.id === 'comments') {
                return <BOSTextField multiline size="small" value={row.comments} onChange={(e) => updateDetail(idx, 'comments', e.target.value)} placeholder="Enter findings..." fullWidth />;
              }
              return row[col.id] || '-';
            }}
          />
        </BOSFormSection>
      </Stack>

      {/* --- Evidence Preview Dialog --- */}
      <Dialog open={previewOpen} onClose={() => setPreviewOpen(false)} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: 'grey.50', borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="h4" fontWeight={700}>{previewData.name}</Typography>
          <IconButton onClick={() => setPreviewOpen(false)} size="small" sx={{ color: 'grey.500' }}>
            <IconX size={20} />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0, height: '80vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', bgcolor: '#fafafa', alignItems: 'center', justifyContent: 'center' }}>
          {loading ? (
            <Typography variant="body2" color="text.secondary">Converting for preview...</Typography>
          ) : (
            <>
              {previewData.content ? (
                <Box 
                  dangerouslySetInnerHTML={{ __html: sanitizeHTML(previewData.content) }} 
                  sx={{ 
                    width: '100%', 
                    height: '100%',
                    overflow: 'auto', 
                    textAlign: 'left', 
                    bgcolor: 'white', 
                    p: 3, 
                    '& table': { borderCollapse: 'collapse', width: '100%' },
                    '& th, & td': { border: '1px solid #ddd', p: 1 }
                  }} 
                />
              ) : previewData.url && (
                previewData.name.toLowerCase().endsWith('.pdf') ? (
                  <iframe title="PDF Preview" src={previewData.url} style={{ width: '100%', height: '100%', border: 'none' }} />
                ) : (
                  <Box 
                    component="img" 
                    src={previewData.url} 
                    sx={{ maxWidth: '100%', maxHeight: '100%', borderRadius: 2, boxShadow: '0 10px 30px rgba(0,0,0,0.1)', objectFit: 'contain' }} 
                  />
                )
              )}
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
          <Button startIcon={<IconDownload size={18} />} onClick={() => window.open(previewData.url, '_blank')}>Download</Button>
          <Button variant="contained" onClick={() => setPreviewOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </MainCard>
  );
}
