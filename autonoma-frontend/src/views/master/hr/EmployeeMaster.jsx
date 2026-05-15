import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Box, Grid, Stack, Typography, MenuItem, Button, Divider, IconButton, 
  InputAdornment, Card, CardContent, Autocomplete, Chip, useTheme, Paper, Tooltip, Dialog, DialogTitle, DialogContent, CircularProgress 
} from '@mui/material';
import { IconUserPlus, IconDeviceFloppy, IconArrowLeft, IconTrash, IconEraser, IconUser, IconBriefcase, IconCalendar, IconSettings, IconShieldCheck, IconCloudUpload, IconFileDescription, IconEye, IconX, IconSignature, IconFileCertificate, IconLock, IconMail, IconFileUpload, IconPlus } from '@tabler/icons-react';
import { useColorScheme } from '@mui/material/styles';
import MainCard from 'ui-component/cards/MainCard';
import { BOSFormSection, BOSTextField, BOSDatePicker, BOSFileUpload, btnSave, btnDelete, btnCancel, btnClear, getDialogStyles } from 'ui-component/bos';
import ConfirmDeleteDialog from 'ui-component/ConfirmDeleteDialog';
import useBOSValidation from 'hooks/useBOSValidation';
import useKeyboardShortcuts, { shortcutTooltip } from 'hooks/useKeyboardShortcuts';
import { useDispatch } from 'react-redux';
import { openSnackbar } from 'store/slices/snackbar';
import axios from 'utils/axios';
import { sanitizeHTML } from 'utils/sanitize';
import { API_PATHS } from 'utils/api-constants';
import { useLookups } from 'hooks/useLookups';
import { autoUploadFile } from 'utils/upload-helper';
import useAuth from 'hooks/useAuth';
import BOSFilePreview from 'ui-component/bos/BOSFilePreview';
import EmployeeSubSections from './EmployeeSubSections';

const INITIAL = {
  // 1. Classification & Identity
  empCode: '', 
  categoryId: '', 
  empLevelId: '', 
  employeeTypeId: '', 
  gradeCode: '', 
  title: '', 
  employeeName: '', 
  fatherHusbandName: '',
  employeePhotoUpload: '', 
  employeeSignatureUpload: '', 
  ndaUpload: '', 
  fitnessCertificateUpload: '',

  // 2. Organization
  departmentId: '', 
  designationId: '', 
  unitId: '', 
  verticalHead: '', 
  hrManager: '', 
  officeMail: '', 
  officeMailPassword: '',
  pfToggle: 'NO', 
  esiToggle: 'NO', 
  pTaxToggle: 'NO', 
  bonusToggle: 'NO', 
  otToggle: 'NO', 
  otFactorial: '', 
  lomDeduction: 'NO', 
  lomAllow: '', 
  ltaEligible: 'NO', 
  pfRestriction: '',
  permissionToggle: 'NO', 
  permissionLimit: '',
  vendorName: '', 
  referMode: '', 
  referenceComments: '', 

  // 3. Date & Scheduling
  dateOfJoining: '', 
  probationPeriod: '', 
  confirmationDate: '', 
  inductionStatus: 'PENDING', 
  exitDate: '', 
  exitReason: '', 
  exitComments: '', 
  rejoiningDate: '',
  
  // 4. Operations And Allowances
  graceMinutes: '0', 
  petrolMode: 'NA', 
  petrolAllowance: '0.00', 
  shift: 'GENERAL', 
  shiftName: 'GENERAL', 
  shiftDuration: '480',

  // 16. Ability (Master Section - Restored)
  isAuditor: 'NO', auditorType: '', auditorFileInfo: '',
  isAuditee: 'NO', auditeeType: '', auditeeFileInfo: '',
  isNcrApprover: 'NO', ncrApproverType: '', ncrApproverFileInfo: '',
  isChaired: 'NO', chairedType: '', chairedFileInfo: '',
  isHost: 'NO', hostType: '', hostFileInfo: '',
  isParticipants: 'NO', participantsType: '', participantsFileInfo: '',
  isFirstAid: 'NO', firstAidFileInfo: '',
  isFireFighter: 'NO', fireFighterFileInfo: '',
  isTwoWheeler: 'NO', twoWheelerFileInfo: '',
  isFourWheeler: 'NO', fourWheelerFileInfo: '',

  // System
  createdBy: null, createdAt: null, updatedBy: null, updatedAt: null
};

const TITLES = ['Mr.', 'Mrs.', 'Ms.', 'Dr.'];
const REF_MODES = ['EMPLOYEE', 'LINKED IN', 'NEWS PAPER', 'POSTER', 'WEBSITE', 'WHATS APP', 'OTHERS'];
const CATEGORIES = [{id: 1, categoryName: 'EMPLOYEE'}, {id: 2, categoryName: 'CONTRACTOR'}, {id: 3, categoryName: 'CONSULTANT'}];
const TYPES = [{id: 1, typeName: 'PERMANENT'}, {id: 2, typeName: 'TEMPORARY'}, {id: 3, typeName: 'TRAINEE'}, {id: 4, typeName: 'PROBATION'}];
const YES_NO = ['YES', 'NO'];

const RULES = [
  { field: 'empCode', label: 'Employee Code', required: true },
  { field: 'employeeName', label: 'Employee Name', required: true },
  { field: 'categoryId', label: 'Category', required: true },
  { field: 'empLevelId', label: 'Level', required: true },
  { field: 'employeeTypeId', label: 'Type', required: true },
  { field: 'gradeCode', label: 'Grade', required: true },
  { field: 'title', label: 'Title', required: true },
  { field: 'departmentId', label: 'Department', required: true },
  { field: 'dateOfJoining', label: 'Date Of Joining', required: true }
];

const R = ({ children, lg = 3 }) => <Grid item xs={12} sm={6} md={4} lg={lg}>{children}</Grid>;

export default function EmployeeMaster() {
  const theme = useTheme();
  const { user } = useAuth();

  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const employeeId = searchParams.get('id');
  const { errors, validate, clearErrors } = useBOSValidation();
  const [form, setForm] = useState(INITIAL);
  const [loading, setLoading] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const { 
    departments = [], 
    designations = [], 
    levels = [],
    auditTypes = [],
    meetings = [],
    employees = [],
    grades = [],
    divisions = []
  } = useLookups(['DEPARTMENTS', 'DESIGNATIONS', 'LEVELS', 'AUDIT_TYPE', 'MEETINGS', 'EMPLOYEES', 'GRADES', 'DIVISIONS']);

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);

  const fetchEmployee = useCallback(async () => {
    if (!employeeId) return;
    try {
      const { data } = await axios.get(`${API_PATHS.HRM.EMPLOYEES}/${employeeId}`);
      const d = { ...INITIAL };
      Object.keys(d).forEach((k) => { if (data[k] !== undefined && data[k] !== null) d[k] = data[k]; });
      ['dateOfJoining', 'confirmationDate', 'exitDate', 'rejoiningDate', 'marriedDate', 'dob'].forEach((k) => {
        if (d[k] && typeof d[k] === 'string') d[k] = d[k].split('T')[0];
      });
      setForm(d);
    } catch (e) { console.error(e); }
  }, [employeeId]);

  useEffect(() => { fetchEmployee(); }, [fetchEmployee]);

  const h = (e) => {
    const { name, value } = e.target;
    setForm((p) => {
      const next = { ...p, [name]: value };
      if (name === 'exitReason' && value !== 'OTHER') next.exitComments = '';
      if (name === 'exitDate' && !value) { next.exitReason = ''; next.exitComments = ''; }
      return next;
    });
    if (errors[name]) clearErrors(name);
  };

  const generateEmpCode = useCallback(async () => {
    if (employeeId) return;
    try {
      const { data } = await axios.get(`${API_PATHS.HRM.EMPLOYEES}/next-no`);
      setForm(prev => ({ ...prev, empCode: data }));
    } catch (e) {
      setForm(prev => ({ ...prev, empCode: 'EMP-001' }));
    }
  }, [employeeId]);

  useEffect(() => {
    if (!employeeId) generateEmpCode();
  }, [generateEmpCode, employeeId]);

  const handleSave = async () => {
    if (!validate(form, RULES)) return;

    // Custom Validations from Plan
    if (form.maritalStatus === 'MARRIED' && !form.marriedDate) {
      dispatch(openSnackbar({ open: true, message: 'Married Date is mandatory for Marital Status: MARRIED', severity: 'error' }));
      return;
    }
    if (form.referMode === 'EMPLOYEE' && !form.referenceComments) {
      dispatch(openSnackbar({ open: true, message: 'Referring Employee is mandatory when Reference Mode is EMPLOYEE', severity: 'error' }));
      return;
    }
    if (form.referMode === 'OTHERS' && !form.referenceComments) {
      dispatch(openSnackbar({ open: true, message: 'Reference Comments are mandatory when Reference Mode is OTHERS', severity: 'error' }));
      return;
    }
    if (form.exitDate && !form.exitReason) {
      dispatch(openSnackbar({ open: true, message: 'Exit Reason is mandatory if Exit Date is entered', severity: 'error' }));
      return;
    }

    setLoading(true);
    try {
      const payload = { 
        ...form,
        createdBy: form.createdBy || user?.id || 'SYSTEM',
        updatedBy: user?.id || 'SYSTEM'
      };
      
      // Cleanup dates
      ['dateOfJoining', 'confirmationDate', 'exitDate', 'rejoiningDate'].forEach((f) => {
        if (payload[f] === '') payload[f] = null;
      });

      if (employeeId) {
        await axios.put(`${API_PATHS.HRM.EMPLOYEES}/${employeeId}`, payload);
        dispatch(openSnackbar({ open: true, message: 'Employee Master updated successfully!', variant: 'alert', alert: { variant: 'filled' }, severity: 'success' }));
      } else {
        const { data } = await axios.post(API_PATHS.HRM.EMPLOYEES, payload);
        dispatch(openSnackbar({ open: true, message: 'New Employee Master created successfully!', variant: 'alert', alert: { variant: 'filled' }, severity: 'success' }));
        navigate(`/hra/employee/master/create?id=${data.id}`, { replace: true });
        return;
      }
    } catch (e) {
      dispatch(openSnackbar({ open: true, message: 'Failed to save employee record.', variant: 'alert', alert: { variant: 'filled' }, severity: 'error' }));
    } finally { setLoading(false); }
  };

  const handleBOSFileChange = (field, files) => {
    if (files && files.length > 0) {
      setForm(p => ({ ...p, [field]: files[0].serverFileName }));
    } else {
      setForm(p => ({ ...p, [field]: '' }));
    }
  };

  const handleAbilityFileUpload = async (field, file, currentType) => {
    if (!file) return;
    if (!currentType) {
      dispatch(openSnackbar({ open: true, message: 'Please select a Type before uploading proof.', severity: 'warning' }));
      return;
    }
    try {
      const uploadedPath = await autoUploadFile(file);
      const currentFiles = form[field] ? JSON.parse(form[field]) : [];
      const newFile = { id: Date.now(), fileName: file.name, serverFileName: uploadedPath, type: currentType };
      const updatedFiles = JSON.stringify([...currentFiles, newFile]);
      setForm(p => ({ ...p, [field]: updatedFiles }));
      dispatch(openSnackbar({ open: true, message: `File added to proofs for ${currentType}!`, severity: 'success' }));
    } catch (e) {
      dispatch(openSnackbar({ open: true, message: 'Upload failed.', severity: 'error' }));
    }
  };

  const handleOpenPreview = useCallback((serverFileName, label) => {
    if (!serverFileName) return;
    const ext = serverFileName.split('.').pop();
    const fileName = label.includes('.') ? label : `${label}.${ext}`;
    setPreviewFile({ serverFileName, fileName, isServer: true });
    setPreviewOpen(true);
  }, []);

  const [abilityUpload, setAbilityUpload] = useState({ open: false, field: '', types: [], selectedType: '' });

  const renderAbilityRow = (label, toggleName, typeName, fileName, hasType = true, hasFile = true, customOptions = null) => {
    const isEnabled = form[toggleName] === 'YES';
    const fileValue = fileName ? form[fileName] : null;
    const fileData = fileValue ? JSON.parse(fileValue) : [];
    const selectedTypes = form[typeName] ? form[typeName].split(',').map(t => t.trim()).filter(t => t) : [];

    return (
      <Paper sx={{ mb: 3, p: 2, borderRadius: 3, border: '1px solid', borderColor: isEnabled ? 'primary.light' : 'divider', bgcolor: isEnabled ? (isDark ? 'rgba(33, 150, 243, 0.05)' : 'rgba(33, 150, 243, 0.02)') : 'transparent', transition: 'all 0.3s ease' }}>
        <Grid container spacing={2} alignItems="center">
          {/* Left: Icon & Label */}
          <Grid item xs={12} md={4} lg={3}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Box sx={{ minWidth: 42, height: 42, borderRadius: 1.5, bgcolor: isEnabled ? 'primary.main' : 'grey.200', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isEnabled ? 'white' : 'grey.500' }}>
                <IconShieldCheck size={22} />
              </Box>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: isEnabled ? 'text.primary' : 'text.secondary', lineHeight: 1.2 }}>{label}</Typography>
                <BOSTextField select name={toggleName} value={form[toggleName]} onChange={h} size="small" sx={{ width: 80, mt: 0.5 }}>
                  <MenuItem value="YES">YES</MenuItem>
                  <MenuItem value="NO">NO</MenuItem>
                </BOSTextField>
              </Box>
            </Stack>
          </Grid>

          {/* Right: Content or Disabled Message */}
          <Grid item xs={12} md={8} lg={9}>
            {isEnabled ? (
              <Stack spacing={2}>
                {hasType && (
                  <Autocomplete 
                    multiple 
                    options={customOptions || auditTypes.map(t => t.auditType)} 
                    value={selectedTypes} 
                    onChange={(e, val) => setForm(p => ({ ...p, [typeName]: val.join(',') }))} 
                    renderInput={(params) => (<BOSTextField {...params} label="Qualified For" placeholder="Select roles..." />)} 
                    renderTags={(v, getTagProps) => v.map((o, i) => {
                      const { key, ...tagProps } = getTagProps({ index: i });
                      return <Chip key={key} label={o} size="small" color="primary" {...tagProps} sx={{ fontWeight: 600 }} />;
                    })}
                    size="small" 
                  />
                )}

                {hasFile && (
                  <Box sx={{ p: 1.5, bgcolor: isDark ? 'rgba(0,0,0,0.2)' : 'grey.50', borderRadius: 2, border: '1px dashed', borderColor: 'divider' }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 1 }}>
                        <IconFileUpload size={16} /> Credentials & Proofs
                      </Typography>
                      <Button variant="contained" size="small" startIcon={<IconCloudUpload size={14} />} disabled={selectedTypes.length === 0} onClick={() => setAbilityUpload({ open: true, field: fileName, types: selectedTypes, selectedType: selectedTypes[0] || '', allOptions: customOptions || auditTypes.map(t => t.auditType) })} sx={{ height: 28, fontSize: '0.75rem' }}>Upload</Button>
                    </Stack>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {fileData.length === 0 ? (
                        <Typography variant="caption" sx={{ color: 'text.disabled', fontStyle: 'italic' }}>Select "Qualified For" and click "Upload".</Typography>
                      ) : (
                        fileData.map((f) => (
                          <Chip 
                            key={f.id} 
                            label={`${f.fileName} (${f.type})`} 
                            onDelete={() => setForm(p => ({ ...p, [fileName]: JSON.stringify(fileData.filter(x => x.id !== f.id)) }))} 
                            onClick={() => handleOpenPreview(f.serverFileName, f.fileName)} 
                            size="small" 
                            color="info" 
                            sx={{ height: 24, fontSize: '0.75rem' }}
                          />
                        ))
                      )}
                    </Box>
                  </Box>
                )}
              </Stack>
            ) : (
              <Box sx={{ p: 2, bgcolor: isDark ? 'rgba(0,0,0,0.1)' : 'grey.50', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="body2" sx={{ color: 'text.disabled', fontStyle: 'italic' }}>This eligibility is currently disabled for this employee.</Typography>
              </Box>
            )}
          </Grid>
        </Grid>
      </Paper>
    );
  };

  return (
    <MainCard
      title={<Stack direction="row" alignItems="center" spacing={1.5}><IconUserPlus size={24} /><Typography variant="h3">{employeeId ? 'Edit Employee' : 'New Employee'}</Typography></Stack>}
      secondary={
        <Stack direction="row" spacing={1.5}>
          <Tooltip title="Back to List"><Button variant="contained" startIcon={<IconArrowLeft size={18} />} onClick={() => navigate('/hra/employee/master')} sx={btnCancel}>Back</Button></Tooltip>
          {employeeId && <Tooltip title="Delete"><Button variant="contained" startIcon={<IconTrash size={18} />} onClick={() => setDeleteOpen(true)} sx={btnDelete}>Delete</Button></Tooltip>}
          <Tooltip title="Clear"><Button variant="contained" startIcon={<IconEraser size={18} />} onClick={() => { setForm(INITIAL); clearErrors(); }} sx={btnClear}>Clear</Button></Tooltip>
          <Tooltip title="Save"><span><Button variant="contained" startIcon={<IconDeviceFloppy size={18} />} onClick={handleSave} disabled={loading} sx={btnSave}>{loading ? 'Saving...' : 'Save'}</Button></span></Tooltip>
        </Stack>
      }
    >
      <Stack spacing={4}>
        {/* --- SECTION 1: CLASSIFICATION & IDENTITY --- */}
        <BOSFormSection icon={<IconUser size={20} color={theme.palette.primary.main} />} title="Classification & Identity">
          <Grid container spacing={2.5}>
            <R><BOSTextField name="empCode" label="Employee Code *" value={form.empCode} inputProps={{ readOnly: true }} /></R>
            <R>
              <BOSTextField select name="categoryId" label="Category *" value={form.categoryId} onChange={h} error={!!errors.categoryId} helperText={errors.categoryId}>
                {CATEGORIES.map((c) => <MenuItem key={c.id} value={c.id}>{c.categoryName}</MenuItem>)}
              </BOSTextField>
            </R>
            <R>
              <BOSTextField select name="empLevelId" label="Level *" value={form.empLevelId} onChange={h} error={!!errors.empLevelId} helperText={errors.empLevelId}>
                {levels.map((l) => <MenuItem key={l.rowId} value={l.rowId}>{l.level}</MenuItem>)}
              </BOSTextField>
            </R>
            <R>
              <BOSTextField select name="employeeTypeId" label="Employee Type *" value={form.employeeTypeId} onChange={h} error={!!errors.employeeTypeId} helperText={errors.employeeTypeId}>
                {TYPES.map((t) => <MenuItem key={t.id} value={t.id}>{t.typeName}</MenuItem>)}
              </BOSTextField>
            </R>
            <R>
              <BOSTextField select name="gradeCode" label="Grade *" value={form.gradeCode} onChange={h} error={!!errors.gradeCode} helperText={errors.gradeCode}>
                {grades.map((g) => <MenuItem key={g.id || g.rowId} value={g.gradeCode}>{g.gradeName}</MenuItem>)}
              </BOSTextField>
            </R>
            <R>
              <BOSTextField select name="title" label="Title *" value={form.title} onChange={h} error={!!errors.title} helperText={errors.title}>
                {TITLES.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
              </BOSTextField>
            </R>
            <R><BOSTextField name="employeeName" label="Employee Name *" value={form.employeeName} onChange={h} error={!!errors.employeeName} helperText={errors.employeeName} /></R>
            <R><BOSTextField name="fatherHusbandName" label="Father/Husband Name" value={form.fatherHusbandName} onChange={h} /></R>
            
            <R lg={6}>
              <Box sx={{ minHeight: 100 }}>
                <BOSFileUpload
                  files={form.employeePhotoUpload ? [{ fileName: form.employeePhotoUpload.split('/').pop(), serverFileName: form.employeePhotoUpload, isServer: true }] : []}
                  onChange={(files) => handleBOSFileChange('employeePhotoUpload', files)}
                  module="HRA_PROFILE"
                  multiple={false}
                  accept="image/*"
                  maxFiles={1}
                  compact={true}
                  label="Employee Photo Upload"
                />
              </Box>
            </R>
            <R lg={6}>
              <Box sx={{ minHeight: 100 }}>
                <BOSFileUpload
                  files={form.employeeSignatureUpload ? [{ fileName: form.employeeSignatureUpload.split('/').pop(), serverFileName: form.employeeSignatureUpload, isServer: true }] : []}
                  onChange={(files) => handleBOSFileChange('employeeSignatureUpload', files)}
                  module="HRA_SIGNATURE"
                  multiple={false}
                  accept="image/*"
                  maxFiles={1}
                  compact={true}
                  label="Employee Signature Upload"
                />
              </Box>
            </R>
            <R lg={6}>
              <Box sx={{ minHeight: 100 }}>
                <BOSFileUpload
                  files={form.ndaUpload ? [{ fileName: form.ndaUpload.split('/').pop(), serverFileName: form.ndaUpload, isServer: true }] : []}
                  onChange={(files) => handleBOSFileChange('ndaUpload', files)}
                  module="HRA_NDA"
                  multiple={false}
                  accept=".pdf"
                  maxFiles={1}
                  compact={true}
                  label="NDA Upload"
                />
              </Box>
            </R>
            <R lg={6}>
              <Box sx={{ minHeight: 100 }}>
                <BOSFileUpload
                  files={form.fitnessCertificateUpload ? [{ fileName: form.fitnessCertificateUpload.split('/').pop(), serverFileName: form.fitnessCertificateUpload, isServer: true }] : []}
                  onChange={(files) => handleBOSFileChange('fitnessCertificateUpload', files)}
                  module="HRA_FITNESS"
                  multiple={false}
                  accept=".pdf,image/*"
                  maxFiles={1}
                  compact={true}
                  label="Fitness Certificate Upload"
                />
              </Box>
            </R>
          </Grid>
        </BOSFormSection>

        {/* --- SECTION 2: ORGANIZATION --- */}
        <BOSFormSection icon={<IconBriefcase size={20} color={theme.palette.secondary.main} />} title="Organization">
          <Grid container spacing={2.5}>
            <R>
              <BOSTextField select name="departmentId" label="Department *" value={form.departmentId} onChange={h} error={!!errors.departmentId} helperText={errors.departmentId}>
                {departments.map((d) => <MenuItem key={d.id} value={d.id}>{d.departmentName}</MenuItem>)}
              </BOSTextField>
            </R>
            <R>
              <BOSTextField select name="designationId" label="Desiginaion" value={form.designationId} onChange={h}>
                {designations.map((d) => <MenuItem key={d.id} value={d.id}>{d.designationName}</MenuItem>)}
              </BOSTextField>
            </R>
            <R>
              <BOSTextField select name="unitId" label="Unit Name" value={form.unitId} onChange={h}>
                <MenuItem value="">-Select Unit-</MenuItem>
                {divisions.map((d) => <MenuItem key={d.id} value={d.id}>{d.divisionName}</MenuItem>)}
              </BOSTextField>
            </R>
            <R>
              <BOSTextField select name="verticalHead" label="Veritical Head" value={form.verticalHead} onChange={h}>
                <MenuItem value="">-Select-</MenuItem>
                {employees.map(e => <MenuItem key={e.id} value={e.employeeName}>{e.employeeName}</MenuItem>)}
              </BOSTextField>
            </R>
            <R>
              <BOSTextField select name="hrManager" label="HR" value={form.hrManager} onChange={h}>
                <MenuItem value="">-Select-</MenuItem>
                {employees.map(e => <MenuItem key={e.id} value={e.employeeName}>{e.employeeName}</MenuItem>)}
              </BOSTextField>
            </R>
            <R><BOSTextField name="officeMail" label="Office Mail" value={form.officeMail} onChange={h} InputProps={{ startAdornment: <InputAdornment position="start"><IconMail size={18} /></InputAdornment> }} /></R>
            <R><BOSTextField name="officeMailPassword" label="Office Mail password" value={form.officeMailPassword} onChange={h} type="password" InputProps={{ startAdornment: <InputAdornment position="start"><IconLock size={18} /></InputAdornment> }} /></R>
            
            <R><BOSTextField select name="pfToggle" label="PF" value={form.pfToggle} onChange={h}>{YES_NO.map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}</BOSTextField></R>
            <R><BOSTextField select name="esiToggle" label="ESI" value={form.esiToggle} onChange={h}>{YES_NO.map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}</BOSTextField></R>
            <R><BOSTextField select name="pTaxToggle" label="P.Tax" value={form.pTaxToggle} onChange={h}>{YES_NO.map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}</BOSTextField></R>
            <R><BOSTextField select name="bonusToggle" label="Bonus" value={form.bonusToggle} onChange={h}>{YES_NO.map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}</BOSTextField></R>
            
            <R><BOSTextField select name="otToggle" label="OT" value={form.otToggle} onChange={h}>{YES_NO.map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}</BOSTextField></R>
            <R><BOSTextField name="otFactorial" label="OT Factorial" value={form.otFactorial} onChange={h} disabled={form.otToggle !== 'YES'} type="number" /></R>
            <R><BOSTextField select name="lomDeduction" label="LOM Deduction" value={form.lomDeduction} onChange={h}>{YES_NO.map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}</BOSTextField></R>
            <R><BOSTextField name="lomAllow" label="LOM Allow" value={form.lomAllow} onChange={h} type="number" /></R>
            
            <R><BOSTextField select name="ltaEligible" label="LTA Eligible" value={form.ltaEligible} onChange={h}>{YES_NO.map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}</BOSTextField></R>
            <R><BOSTextField name="pfRestriction" label="PF Restriction" value={form.pfRestriction} onChange={h} type="number" /></R>
            <R><BOSTextField select name="permissionToggle" label="Permission" value={form.permissionToggle} onChange={h}>{YES_NO.map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}</BOSTextField></R>
            <R><BOSTextField name="permissionLimit" label="Permission Limit" value={form.permissionLimit} onChange={h} disabled={form.permissionToggle !== 'YES'} type="number" /></R>

            <R>
              {form.categoryId !== 1 && (
                <BOSTextField name="vendorName" label="Vendor Name" value={form.vendorName} onChange={h} placeholder="Enter Vendor" />
              )}
            </R>
            <R>
              <BOSTextField select name="referMode" label="Reference Mode" value={form.referMode} onChange={h}>
                <MenuItem value="">-Select-</MenuItem>
                {REF_MODES.map((m) => <MenuItem key={m} value={m}>{m}</MenuItem>)}
              </BOSTextField>
            </R>
            <R>
              {form.referMode === 'EMPLOYEE' ? (
                <BOSTextField select name="referenceComments" label="Referring Employee *" value={form.referenceComments} onChange={h}>
                  <MenuItem value="">-Select-</MenuItem>
                  {employees.filter(e => e.status === 'Active').map(e => (
                    <MenuItem key={e.id} value={e.employeeName}>{e.employeeName} ({e.empCode})</MenuItem>
                  ))}
                </BOSTextField>
              ) : (
                <BOSTextField 
                  name="referenceComments" 
                  label={`Reference Comments ${form.referMode === 'OTHERS' ? '*' : ''}`} 
                  value={form.referenceComments} 
                  onChange={h} 
                  placeholder="Enter details..." 
                />
              )}
            </R>
          </Grid>
        </BOSFormSection>

        {/* --- SECTION 3: DATES & SCHEDULING --- */}
        <BOSFormSection icon={<IconCalendar size={20} color={theme.palette.primary.main} />} title="Date & Scheduling">
          <Grid container spacing={2.5}>
            <R lg={3}><BOSDatePicker name="dateOfJoining" label="Date Of Joining" value={form.dateOfJoining} onChange={h} error={!!errors.dateOfJoining} helperText={errors.dateOfJoining} required /></R>
            <R lg={3}><BOSTextField name="probationPeriod" label="Probation (Months)" value={form.probationPeriod} onChange={h} type="number" /></R>
            <R lg={3}><BOSDatePicker name="confirmationDate" label="Confirmation Date" value={form.confirmationDate} onChange={h} /></R>
            <R lg={3}><BOSTextField select name="inductionStatus" label="Induction Status" value={form.inductionStatus} onChange={h}><MenuItem value="PENDING">PENDING</MenuItem><MenuItem value="COMPLETED">COMPLETED</MenuItem></BOSTextField></R>
            <R lg={3}><BOSDatePicker name="exitDate" label="Exit Date" value={form.exitDate} onChange={h} /></R>
            <R lg={3}>
              <BOSTextField select name="exitReason" label="Exit Reason" value={form.exitReason} onChange={h} disabled={!form.exitDate}>
                <MenuItem value="RESIGNED">RESIGNED</MenuItem>
                <MenuItem value="TERMINATED">TERMINATED</MenuItem>
                <MenuItem value="RETIRED">RETIRED</MenuItem>
                <MenuItem value="OTHER">OTHER</MenuItem>
              </BOSTextField>
            </R>
            {form.exitReason === 'OTHER' && (
              <R lg={3}><BOSTextField name="exitComments" label="Exit Comments" value={form.exitComments} onChange={h} required placeholder="Please explain..." /></R>
            )}
            <R lg={3}><BOSDatePicker name="rejoiningDate" label="Rejoining Date" value={form.rejoiningDate} onChange={h} /></R>
          </Grid>
        </BOSFormSection>

        {/* --- SECTION 4: OPERATIONS --- */}
        <BOSFormSection icon={<IconSettings size={20} color={theme.palette.primary.main} />} title="Operations And Allowances">
          <Grid container spacing={2.5}>
            <R><BOSTextField name="graceMinutes" label="Grace Minutes" value={form.graceMinutes} onChange={h} type="number" /></R>
            <R><BOSTextField select name="petrolMode" label="Petrol Mode" value={form.petrolMode} onChange={h}><MenuItem value="FIXED">FIXED</MenuItem><MenuItem value="KM BASED">KM BASED</MenuItem><MenuItem value="NA">NA</MenuItem></BOSTextField></R>
            <R><BOSTextField name="petrolAllowance" label="Petrol Allowance" value={form.petrolAllowance} onChange={h} type="number" disabled={form.petrolMode === 'NA'} /></R>
            <R><BOSTextField select name="shift" label="Shift" value={form.shift} onChange={h}><MenuItem value="GENERAL">GENERAL</MenuItem><MenuItem value="ROTATIONAL">ROTATIONAL</MenuItem></BOSTextField></R>
            <R><BOSTextField select name="shiftName" label="Shift Name" value={form.shiftName} onChange={h}><MenuItem value="GENERAL">GENERAL</MenuItem><MenuItem value="SHIFT A">SHIFT A</MenuItem><MenuItem value="SHIFT B">SHIFT B</MenuItem></BOSTextField></R>
            <R><BOSTextField name="shiftDuration" label="Shift Duration" value={form.shiftDuration} inputProps={{ readOnly: true }} /></R>
          </Grid>
        </BOSFormSection>

        <EmployeeSubSections employeeId={employeeId} />

        {/* ═══ SECTION 16: ABILITY (Restored Original) ═══ */}
        <BOSFormSection icon={<IconShieldCheck size={20} color={theme.palette.secondary.main} />} title="Ability">
          <Stack spacing={4}>
            <Box>
              <Typography variant="subtitle1" sx={{ mb: 2, color: 'secondary.main', fontWeight: 700 }}>Compliance & Auditing</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  {renderAbilityRow('Auditor', 'isAuditor', 'auditorType', 'auditorFileInfo')}
                  {renderAbilityRow('Auditee', 'isAuditee', 'auditeeType', 'auditeeFileInfo')}
                  {renderAbilityRow('NCR Approved by', 'isNcrApprover', 'ncrApproverType', 'ncrApproverFileInfo')}
                </Grid>
              </Grid>
            </Box>
            <Divider />
            <Box>
              <Typography variant="subtitle1" sx={{ mb: 2, color: 'secondary.main', fontWeight: 700 }}>Roles & Governance</Typography>
              <Grid item xs={12}>
                {renderAbilityRow('Chaired', 'isChaired', 'chairedType', 'chairedFileInfo', true, true, meetings.map(m => m.meetingName))}
                {renderAbilityRow('Host', 'isHost', 'hostType', 'hostFileInfo', true, true, meetings.map(m => m.meetingName))}
                {renderAbilityRow('Participants', 'isParticipants', 'participantsType', 'participantsFileInfo', true, true, meetings.map(m => m.meetingName))}
              </Grid>
            </Box>
            <Divider />
            <Box>
              <Typography variant="subtitle1" sx={{ mb: 2, color: 'secondary.main', fontWeight: 700 }}>Safety & Specialized Skills</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  {renderAbilityRow('First Aid', 'isFirstAid', '', 'firstAidFileInfo', false, true)}
                  {renderAbilityRow('Fire Fighter', 'isFireFighter', '', 'fireFighterFileInfo', false, true)}
                </Grid>
                <Grid item xs={12} md={6}>
                  {renderAbilityRow('Two Wheeler', 'isTwoWheeler', '', 'twoWheelerFileInfo', false, true)}
                  {renderAbilityRow('Four Wheeler', 'isFourWheeler', '', 'fourWheelerFileInfo', false, true)}
                </Grid>
              </Grid>
            </Box>
          </Stack>
        </BOSFormSection>

      </Stack>

      <ConfirmDeleteDialog open={deleteOpen} onClose={() => setDeleteOpen(false)} onConfirm={async () => { try { await axios.delete(`${API_PATHS.HRM.EMPLOYEES}/${employeeId}`); dispatch(openSnackbar({ open: true, message: 'Employee Master deleted permanently.', variant: 'alert', alert: { variant: 'filled' }, severity: 'success' })); navigate('/hra/employee/master'); } catch (e) { dispatch(openSnackbar({ open: true, message: 'Failed to delete record.', variant: 'alert', alert: { variant: 'filled' }, severity: 'error' })); } }} title="Delete Employee" message="This will permanently delete the employee and ALL related data." itemName={`${form.firstName} ${form.lastName}`} />

      <BOSFilePreview 
        open={previewOpen} 
        onClose={() => setPreviewOpen(false)} 
        file={previewFile} 
      />

      {/* --- Ability Proof Upload Dialog --- */}
      <Dialog 
        open={abilityUpload.open} 
        onClose={() => setAbilityUpload({ ...abilityUpload, open: false })} 
        maxWidth="xs" 
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box sx={{ p: 1, bgcolor: 'primary.lighter', borderRadius: 1.5, display: 'flex', color: 'primary.main' }}>
              <IconCloudUpload size={24} />
            </Box>
            <Typography variant="h4" fontWeight={800}>Upload Proof</Typography>
          </Stack>
          <IconButton onClick={() => setAbilityUpload({ ...abilityUpload, open: false })} sx={{ position: 'absolute', right: 16, top: 16, color: 'text.secondary' }}>
            <IconX size={20} />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 3, pt: '24px !important' }}>
          <Stack spacing={3.5}>
            <BOSTextField 
              select 
              label="Qualification Type" 
              value={abilityUpload.selectedType} 
              onChange={(e) => setAbilityUpload({ ...abilityUpload, selectedType: e.target.value })}
              fullWidth
              InputLabelProps={{ shrink: true }}
            >
              {(abilityUpload.allOptions || abilityUpload.types).map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
            </BOSTextField>
            
            <Box>
              <Button 
                component="label" 
                variant="contained" 
                fullWidth 
                size="large"
                startIcon={<IconFileUpload size={20} />} 
                sx={{ 
                  height: 56, 
                  borderRadius: 2, 
                  fontSize: '1rem', 
                  fontWeight: 700,
                  boxShadow: theme.customShadows.primary,
                  '&:hover': { boxShadow: 'none' }
                }}
              >
                Select & Upload File
                <input 
                  type="file" 
                  hidden 
                  onChange={(e) => { 
                    handleAbilityFileUpload(abilityUpload.field, e.target.files[0], abilityUpload.selectedType); 
                    setAbilityUpload({ ...abilityUpload, open: false }); 
                  }} 
                />
              </Button>
              <Typography variant="caption" sx={{ mt: 1.5, display: 'block', color: 'text.disabled', textAlign: 'center' }}>
                Supported formats: PDF, Images, DOCX (Max 10MB)
              </Typography>
            </Box>
          </Stack>
        </DialogContent>
      </Dialog>

    </MainCard>
  );
}
