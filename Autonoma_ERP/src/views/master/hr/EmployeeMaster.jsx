import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Grid, Box, Button, Typography, Stack, MenuItem, useTheme, Tooltip, Dialog, DialogTitle, DialogContent, IconButton } from '@mui/material';
import { IconUserPlus, IconDeviceFloppy, IconArrowLeft, IconTrash, IconEraser, IconUser, IconBriefcase, IconCalendar, IconSettings, IconShieldCheck, IconCloudUpload, IconFileDescription, IconEye, IconX } from '@tabler/icons-react';
import { useColorScheme } from '@mui/material/styles';
import MainCard from 'ui-component/cards/MainCard';
import { BOSFormSection, BOSTextField, btnSave, btnDelete, btnCancel, btnClear, getDialogStyles } from 'ui-component/bos';
import ConfirmDeleteDialog from 'ui-component/ConfirmDeleteDialog';
import useBOSValidation from 'hooks/useBOSValidation';
import useKeyboardShortcuts, { shortcutTooltip } from 'hooks/useKeyboardShortcuts';
import { useDispatch } from 'react-redux';
import { openSnackbar } from 'store/slices/snackbar';
import axios from 'utils/axios';
import { API_PATHS } from 'utils/api-constants';
import { useLookups } from 'hooks/useLookups';
import EmployeeSubSections from './EmployeeSubSections';
import mammoth from 'mammoth';
import * as XLSX from 'xlsx';
import { CircularProgress } from '@mui/material';

const INITIAL = {
  categoryId: '', empLevelId: '', employeeTypeId: '', gradeCode: '',
  title: '', firstName: '', lastName: '', fatherHusbandName: '',
  departmentId: '', designationId: '', unitId: '', verticalHead: '', hr: '', vendorName: '', referMode: '', referenceComments: '',
  dateOfJoining: '', probationPeriod: '', confirmationDate: '', inductionStatus: 'PENDING', exitDate: '', exitReason: '', exitComments: '', rejoiningDate: '',
  graceMinutes: '0', petrolMode: 'NA', petrolAllowance: '0.00', shift: 'Yes', shiftName: 'GENERAL', shiftDuration: '480',
  isAuditor: 'NO', auditorType: '', auditorFileInfo: '',
  isAuditee: 'NO', auditeeType: '', auditeeFileInfo: '',
  isNcrApprover: 'NO', ncrApproverType: '', ncrApproverFileInfo: '',
  isChaired: 'NO', chairedType: '',
  isHost: 'YES', hostType: 'DDRM',
  isParticipants: 'YES', participantsType: 'DDRM',
  segment: '', subSegment: '',
  isFirstAid: 'NO', firstAidFileInfo: '',
  isFireFighter: 'NO', fireFighterFileInfo: '',
  isTwoWheeler: 'NO', twoWheelerFileInfo: '',
  isFourWheeler: 'NO', fourWheelerFileInfo: '',
  isInductionEligible: 'NO', isInterviewer: 'NO', isEnquiryAssignee: 'NO', isPrAssignee: 'NO'
};

const RULES = [
  { field: 'firstName', label: 'First Name', required: true, maxLength: 100 },
  { field: 'lastName', label: 'Last Name', required: true, maxLength: 100 },
  { field: 'categoryId', label: 'Category', required: true },
  { field: 'employeeTypeId', label: 'Type', required: true },
  { field: 'title', label: 'Title', required: true },
  { field: 'departmentId', label: 'Department', required: true }
];

// Shared field renderer using Grid for consistent layout
// Shared field renderer using Grid for consistent layout - standardized to 4 columns for even spacing
const R = ({ children, lg = 3 }) => <Grid item xs={12} sm={6} md={4} lg={lg}>{children}</Grid>;

export default function EmployeeMaster() {
  const theme = useTheme();
  const TITLES = ['Mr.', 'Mrs.', 'Ms.', 'Dr.'];
  const SUB_CATEGORIES = ['STAFF', 'TRAINEE', 'OFFICER', 'ASSISTANT', 'DIRECTOR', 'CEO', 'MD', 'ENGINEER', 'OPERATOR', 'MANAGER'];
  const UNIT_NAMES = ['UNIT 1', 'UNIT 2'];
  const PRODUCTION_LINES = ['N/A'];
  const CLASSES = ['CLASS A', 'CLASS B', 'CLASS C'];
  const SHIFT_NAMES = ['GENERAL', 'SHIFT A', 'SHIFT B', 'SHIFT C'];
  const REF_MODES = ['INTERNAL', 'EXTERNAL', 'CONSULTANT'];
  const SUPPLIERS = ['SUPPLIER A', 'SUPPLIER B'];
  const TEAM_GROUPS = ['TEAM 1', 'TEAM 2'];
  const STATUSES = ['ACTIVE', 'INACTIVE', 'EXITED'];
  
  const CATEGORIES = [{id: 1, categoryName: 'OFFICE'}, {id: 2, categoryName: 'SHOP FLOOR'}];
  const TYPES = [{id: 1, typeName: 'CONFIRMED'}, {id: 2, typeName: 'PROBATION'}, {id: 3, typeName: 'TRAINEE'}, {id: 4, typeName: 'CONTRACT'}];

  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const ds = getDialogStyles(theme, isDark);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const employeeId = searchParams.get('id');
  const { errors, validate, clearErrors } = useBOSValidation();
  const [form, setForm] = useState(INITIAL);
  const [loading, setLoading] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState({ url: '', name: '', content: '', loading: false });
  
  // Added AUDIT_TYPE to lookups
  const { 
    departments = [], 
    designations = [], 
    levels = [],
    auditTypes = [],
    employees = []
  } = useLookups(['DEPARTMENTS', 'DESIGNATIONS', 'LEVELS', 'AUDIT_TYPE', 'EMPLOYEES']);

  const fetchEmployee = useCallback(async () => {
    if (!employeeId) return;
    try {
      const { data } = await axios.get(`${API_PATHS.HRM.EMPLOYEES}/${employeeId}`);
      const d = { ...INITIAL };
      Object.keys(d).forEach((k) => { if (data[k] !== undefined && data[k] !== null) d[k] = data[k]; });
      ['dateOfJoining', 'confirmationDate', 'nextRevisionDate', 'exitDate'].forEach((k) => {
        if (d[k] && typeof d[k] === 'string') d[k] = d[k].split('T')[0];
      });
      setForm(d);
    } catch (e) { console.error(e); }
  }, [employeeId]);

  useEffect(() => { fetchEmployee(); }, [fetchEmployee]);

  const h = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSave = async () => {
    if (!validate(form, RULES)) return;

    // --- Deep Validation for Employee Ability ---
    const abilities = [
      { label: 'Auditor', toggle: 'isAuditor', type: 'auditorType', file: 'auditorFileInfo', hasType: true, hasFile: true },
      { label: 'Auditee', toggle: 'isAuditee', type: 'auditeeType', file: 'auditeeFileInfo', hasType: true, hasFile: true },
      { label: 'NCR Approved by', toggle: 'isNcrApprover', type: 'ncrApproverType', file: 'ncrApproverFileInfo', hasType: true, hasFile: true },
      { label: 'Chaired', toggle: 'isChaired', type: 'chairedType', file: '', hasType: true, hasFile: false },
      { label: 'Host', toggle: 'isHost', type: 'hostType', file: '', hasType: true, hasFile: false },
      { label: 'Participants', toggle: 'isParticipants', type: 'participantsType', file: '', hasType: true, hasFile: false },
      { label: 'First Aid', toggle: 'isFirstAid', type: '', file: 'firstAidFileInfo', hasType: false, hasFile: true },
      { label: 'Fire Fighter', toggle: 'isFireFighter', type: '', file: 'fireFighterFileInfo', hasType: false, hasFile: true },
      { label: 'Two Wheeler', toggle: 'isTwoWheeler', type: '', file: 'twoWheelerFileInfo', hasType: false, hasFile: true },
      { label: 'Four Wheeler', toggle: 'isFourWheeler', type: '', file: 'fourWheelerFileInfo', hasType: false, hasFile: true }
    ];

    for (const ab of abilities) {
      if (form[ab.toggle] === 'YES') {
        if (ab.hasType && !form[ab.type]) {
          dispatch(openSnackbar({ open: true, message: `Please select Type for ${ab.label}`, variant: 'alert', alert: { variant: 'filled' }, severity: 'error', close: false }));
          return;
        }
        if (ab.hasFile && (!form[ab.file] || JSON.parse(form[ab.file]).length === 0)) {
          dispatch(openSnackbar({ open: true, message: `Proof upload is mandatory for ${ab.label}`, variant: 'alert', alert: { variant: 'filled' }, severity: 'error', close: false }));
          return;
        }
      }
    }

    setLoading(true);
    try {
      const payload = { ...form };
      ['categoryId', 'subCategoryId', 'empLevelId', 'employeeTypeId', 'departmentId', 'designationId', 'unitId', 'graceMinutes'].forEach((f) => {
        if (payload[f] === '') payload[f] = null;
      });
      ['dateOfJoining', 'confirmationDate', 'nextRevisionDate', 'exitDate'].forEach((f) => {
        if (payload[f] === '') payload[f] = null;
      });
      if (payload.petrolAllowance === '') payload.petrolAllowance = null;

      if (employeeId) {
        await axios.put(`${API_PATHS.HRM.EMPLOYEES}/${employeeId}`, payload);
        dispatch(openSnackbar({ open: true, message: 'Employee updated!', variant: 'alert', alert: { variant: 'filled' }, severity: 'success', close: false }));
      } else {
        const { data } = await axios.post(API_PATHS.HRM.EMPLOYEES, payload);
        dispatch(openSnackbar({ open: true, message: 'Employee created!', variant: 'alert', alert: { variant: 'filled' }, severity: 'success', close: false }));
        navigate(`/hra/hr/employee/master/create?id=${data.id}`, { replace: true });
        return;
      }
    } catch (e) {
      dispatch(openSnackbar({ open: true, message: 'Failed to save employee.', variant: 'alert', alert: { variant: 'filled' }, severity: 'error', close: false }));
    } finally { setLoading(false); }
  };

  const handleAbilityFileUpload = async (field, file) => {
    if (!file) return;
    try {
      const formData = new FormData();
      formData.append('file', file);
      const { data } = await axios.post(`${API_PATHS.FILES}/upload`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      const fileInfo = JSON.stringify([{ id: Date.now(), fileName: file.name, serverFileName: data }]);
      setForm(p => ({ ...p, [field]: fileInfo }));
      dispatch(openSnackbar({ open: true, message: 'File uploaded!', variant: 'alert', alert: { variant: 'filled' }, severity: 'success', close: false }));
    } catch (e) {
      dispatch(openSnackbar({ open: true, message: 'Upload failed.', variant: 'alert', alert: { variant: 'filled' }, severity: 'error', close: false }));
    }
  };

  const handleOpenPreview = async (serverFileName, originalName) => {
    const baseUrl = (axios.defaults.baseURL || '').replace(/\/+$/, '');
    const url = `${baseUrl}${API_PATHS.FILES}/view/${encodeURIComponent(serverFileName)}`;
    const ext = originalName.split('.').pop()?.toLowerCase();
    
    setPreviewOpen(true);
    setPreviewData({ url, name: originalName, content: '', loading: true });

    try {
      if (['docx', 'doc', 'xlsx', 'xls'].includes(ext)) {
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        const arrayBuffer = response.data;
        let content = '';
        if (ext.startsWith('doc')) {
          const result = await mammoth.convertToHtml({ arrayBuffer });
          content = result.value;
        } else if (ext.startsWith('xls')) {
          const workbook = XLSX.read(arrayBuffer, { type: 'array' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          content = XLSX.utils.sheet_to_html(firstSheet);
        }
        setPreviewData(p => ({ ...p, content, loading: false }));
      } else {
        setPreviewData(p => ({ ...p, loading: false }));
      }
    } catch (e) {
      setPreviewData(p => ({ ...p, content: '<div style="color:red;padding:20px;">Failed to load preview.</div>', loading: false }));
    }
  };

  const renderAbilityRow = (label, toggleName, typeName, fileName, hasType = true, hasFile = true) => {
    const fileValue = fileName ? form[fileName] : null;
    const fileData = fileValue ? JSON.parse(fileValue) : [];
    const displayFile = fileData[0]?.fileName || '';
    const isEnabled = form[toggleName] === 'YES';
    return (
      <Grid container spacing={2} alignItems="center" sx={{ mb: 1.5, p: 1, borderRadius: 1, border: '1px solid', borderColor: isEnabled ? 'primary.light' : 'divider', bgcolor: isEnabled ? 'action.hover' : 'transparent' }}>
        <Grid item xs={3}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: isEnabled ? 'primary.main' : 'text.primary' }}>{label}</Typography>
        </Grid>
        <Grid item xs={2}>
          <BOSTextField select name={toggleName} value={form[toggleName]} onChange={h} size="small">
            <MenuItem value="YES">YES</MenuItem>
            <MenuItem value="NO">NO</MenuItem>
          </BOSTextField>
        </Grid>
        <Grid item xs={3}>
          {hasType && (
            <BOSTextField 
              select 
              name={typeName} 
              label={isEnabled ? `Type *` : 'Type'}
              value={form[typeName] || ''} 
              onChange={h} 
              size="small"
              disabled={!isEnabled}
              error={isEnabled && !form[typeName]}
            >
              <MenuItem value="">-Select-</MenuItem>
              {auditTypes.map((t) => (
                <MenuItem key={t.id} value={t.auditType}>{t.auditType}</MenuItem>
              ))}
              {['DDRM'].map(fallback => (
                !auditTypes.some(at => at.auditType === fallback) && (
                  <MenuItem key={fallback} value={fallback}>{fallback}</MenuItem>
                )
              ))}
            </BOSTextField>
          )}
        </Grid>
        <Grid item xs={4}>
          {hasFile && (
            <Stack direction="row" spacing={1} alignItems="center">
              <Button component="label" variant={isEnabled && !displayFile ? 'contained' : 'outlined'} color={isEnabled && !displayFile ? 'error' : 'primary'} size="small" startIcon={<IconCloudUpload size={16} />} sx={{ textTransform: 'none' }}>
                {displayFile ? 'Replace' : 'Upload Proof *'}
                <input type="file" hidden onChange={(e) => handleAbilityFileUpload(fileName, e.target.files[0])} />
              </Button>
              {displayFile && (
                <>
                  <Tooltip title="View Uploaded File">
                    <Button 
                      size="small" 
                      variant="text" 
                      color="primary" 
                      onClick={() => handleOpenPreview(fileData[0]?.serverFileName, fileData[0]?.fileName)}
                      sx={{ minWidth: 0, p: 0.5 }}
                    >
                      <IconEye size={18} />
                    </Button>
                  </Tooltip>
                  <Tooltip title={displayFile}>
                    <Typography variant="caption" sx={{ maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {displayFile}
                    </Typography>
                  </Tooltip>
                </>
              )}
            </Stack>
          )}
        </Grid>
      </Grid>
    );
  };

  const handleDelete = async () => {
    setDeleteOpen(false);
    try {
      await axios.delete(`${API_PATHS.HRM.EMPLOYEES}/${employeeId}`);
      dispatch(openSnackbar({ open: true, message: 'Employee deleted!', variant: 'alert', alert: { variant: 'filled' }, severity: 'success', close: false }));
      navigate('/hra/hr/employee/master');
    } catch (e) {
      dispatch(openSnackbar({ open: true, message: 'Failed to delete.', variant: 'alert', alert: { variant: 'filled' }, severity: 'error', close: false }));
    }
  };

  const handleClear = () => { setForm(INITIAL); clearErrors(); };

  useKeyboardShortcuts({ 'ctrl+s': handleSave, 'escape': () => navigate('/hra/hr/employee/master') });
  return (
    <MainCard
      title={<Stack direction="row" alignItems="center" spacing={1.5}><IconUserPlus size={24} /><Typography variant="h3">{employeeId ? 'Edit Employee' : 'New Employee'}</Typography></Stack>}
      secondary={
        <Stack direction="row" spacing={1.5}>
          <Tooltip title="Back to List"><Button variant="contained" startIcon={<IconArrowLeft size={18} />} onClick={() => navigate('/hra/hr/employee/master')} sx={btnCancel}>Back</Button></Tooltip>
          {employeeId && <Tooltip title={shortcutTooltip('Delete', 'Ctrl + D')}><Button variant="contained" startIcon={<IconTrash size={18} />} onClick={() => setDeleteOpen(true)} sx={btnDelete}>Delete</Button></Tooltip>}
          <Tooltip title="Clear"><Button variant="contained" startIcon={<IconEraser size={18} />} onClick={handleClear} sx={btnClear}>Clear</Button></Tooltip>
          <Tooltip title={shortcutTooltip('Save', 'Ctrl + S')}><span><Button variant="contained" startIcon={<IconDeviceFloppy size={18} />} onClick={handleSave} disabled={loading} sx={btnSave}>{loading ? 'Saving...' : 'Save'}</Button></span></Tooltip>
        </Stack>
      }
    >
      <Stack spacing={3}>
        {/* ═══ SECTION 1: CLASSIFICATION & IDENTITY ═══ */}
        <BOSFormSection icon={<IconUser size={20} color={theme.palette.primary.main} />} title="Classification & Identity">
          <Grid container spacing={2.5}>
            <R><BOSTextField select name="categoryId" label="Category" value={form.categoryId} onChange={h} required error={!!errors.categoryId} helperText={errors.categoryId}>{CATEGORIES.map(c => <MenuItem key={c.id} value={c.id}>{c.categoryName}</MenuItem>)}</BOSTextField></R>
            <R><BOSTextField select name="empLevelId" label="Level" value={form.empLevelId} onChange={h}>{levels.map(l => <MenuItem key={l.id} value={l.id}>{l.levelName}</MenuItem>)}</BOSTextField></R>
            <R><BOSTextField select name="employeeTypeId" label="Type" value={form.employeeTypeId} onChange={h} required error={!!errors.employeeTypeId} helperText={errors.employeeTypeId}>{TYPES.map(t => <MenuItem key={t.id} value={t.id}>{t.typeName}</MenuItem>)}</BOSTextField></R>
            <R><BOSTextField select name="gradeCode" label="Grade" value={form.gradeCode} onChange={h}><MenuItem value="O">O</MenuItem><MenuItem value="P">P</MenuItem><MenuItem value="T">T</MenuItem><MenuItem value="C">C</MenuItem><MenuItem value="E">E</MenuItem></BOSTextField></R>
            <R><BOSTextField select name="title" label="Title" value={form.title} onChange={h} required error={!!errors.title} helperText={errors.title}>{TITLES.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}</BOSTextField></R>
            <R><BOSTextField name="firstName" label="Employee Name (First)" value={form.firstName} onChange={h} required maxLength={100} error={!!errors.firstName} helperText={errors.firstName} /></R>
            <R><BOSTextField name="lastName" label="Employee Name (Last)" value={form.lastName} onChange={h} required maxLength={100} error={!!errors.lastName} helperText={errors.lastName} /></R>
            <R><BOSTextField name="fatherHusbandName" label="Father / Husband Name" value={form.fatherHusbandName || ''} onChange={h} maxLength={100} /></R>
          </Grid>
        </BOSFormSection>

        {/* ═══ SECTION 2: ORGANIZATION ═══ */}
        <BOSFormSection icon={<IconBriefcase size={20} color={theme.palette.primary.main} />} title="Organization">
          <Grid container spacing={2.5}>
            <R><BOSTextField select name="departmentId" label="Department" value={form.departmentId} onChange={h} required error={!!errors.departmentId} helperText={errors.departmentId}>{departments.map((d) => <MenuItem key={d.id} value={d.id}>{d.departmentName}</MenuItem>)}</BOSTextField></R>
            <R><BOSTextField select name="designationId" label="Designation" value={form.designationId} onChange={h}>{designations.map((d) => <MenuItem key={d.id} value={d.id}>{d.designationName}</MenuItem>)}</BOSTextField></R>
            <R><BOSTextField select name="unitId" label="Unit Name" value={form.unitId} onChange={h}><MenuItem value={1}>UNIT 1</MenuItem></BOSTextField></R>
            <R><BOSTextField name="verticalHead" label="Vertical Head" value={form.verticalHead} onChange={h} /></R>
            <R><BOSTextField name="hr" label="HR" value={form.hr} onChange={h} /></R>
            <R>
              <BOSTextField 
                name="vendorName" 
                label="Vendor Name" 
                value={form.vendorName} 
                onChange={h} 
                disabled={form.categoryId === 1} // Assuming 1 is Office/Employee, change logic as needed
                placeholder={form.categoryId === 1 ? 'Only for Other Than Employee' : 'Enter Vendor Name'}
              />
            </R>
            <R>
              <BOSTextField select name="referMode" label="Reference Mode" value={form.referMode} onChange={h}>
                <MenuItem value="Direct">Direct</MenuItem>
                <MenuItem value="Employee">Employee</MenuItem>
                <MenuItem value="Consultant">Consultant</MenuItem>
              </BOSTextField>
            </R>
            {form.referMode === 'Employee' && (
              <R>
                <BOSTextField select name="referenceComments" label="Referral Employee" value={form.referenceComments} onChange={h}>
                  {employees.filter(e => e.status === 'Active').map(e => (
                    <MenuItem key={e.id} value={e.employeeName}>{e.employeeName}</MenuItem>
                  ))}
                </BOSTextField>
              </R>
            )}
            {form.categoryId !== 1 && (
              <R><BOSTextField name="referenceComments" label="Reference Comments" value={form.referenceComments} onChange={h} multiline rows={1} /></R>
            )}
          </Grid>
        </BOSFormSection>

        {/* ═══ SECTION 3: DATES & SCHEDULING ═══ */}
        <BOSFormSection icon={<IconCalendar size={20} color={theme.palette.primary.main} />} title="Date & Scheduling">
          <Grid container spacing={2.5}>
            <R><BOSTextField name="dateOfJoining" label="Date Of Joining" type="date" value={form.dateOfJoining} onChange={h} InputLabelProps={{ shrink: true }} /></R>
            <R><BOSTextField name="probationPeriod" label="Probation Period" value={form.probationPeriod} onChange={h} placeholder="e.g. 6 Months" /></R>
            <R><BOSTextField name="confirmationDate" label="Confirmation Date" type="date" value={form.confirmationDate} onChange={h} InputLabelProps={{ shrink: true }} /></R>
            <R><BOSTextField name="inductionStatus" label="Induction Status" value={form.inductionStatus} onChange={h} maxLength={50} inputProps={{ readOnly: true }} /></R>
            <R><BOSTextField name="exitDate" label="Exit Date" type="date" value={form.exitDate} onChange={h} InputLabelProps={{ shrink: true }} /></R>
            <R>
              <BOSTextField 
                select name="exitReason" label="Exit Reason" value={form.exitReason} onChange={h}
                required={!!form.exitDate}
                error={!!form.exitDate && !form.exitReason}
                helperText={!!form.exitDate && !form.exitReason ? 'Mandatory if Exit Date is set' : ''}
              >
                <MenuItem value="Resigned">Resigned</MenuItem>
                <MenuItem value="Termination">Termination</MenuItem>
                <MenuItem value="Death">Death</MenuItem>
                <MenuItem value="Others">Others</MenuItem>
              </BOSTextField>
            </R>
            <R>
              <BOSTextField 
                name="exitComments" label="Exit Comments" value={form.exitComments} onChange={h} 
                disabled={form.exitReason !== 'Others'}
                placeholder={form.exitReason === 'Others' ? 'Explain exit reason' : 'Disabled'}
              />
            </R>
            <R><BOSTextField name="rejoiningDate" label="Rejoining Date" type="date" value={form.rejoiningDate} onChange={h} InputLabelProps={{ shrink: true }} /></R>
          </Grid>
        </BOSFormSection>

        {/* ═══ SECTION 4: OPERATIONS ═══ */}
        <BOSFormSection icon={<IconSettings size={20} color={theme.palette.primary.main} />} title="Operations And Allowances">
          <Grid container spacing={2.5}>
            <R><BOSTextField name="graceMinutes" label="Grace Minutes" value={form.graceMinutes} onChange={h} type="number" /></R>
            <R><BOSTextField select name="petrolMode" label="Petrol Mode" value={form.petrolMode} onChange={h}><MenuItem value="BIKE">BIKE</MenuItem><MenuItem value="CAR">CAR</MenuItem><MenuItem value="NA">NA</MenuItem></BOSTextField></R>
            <R><BOSTextField name="petrolAllowance" label="Petrol Allowance" value={form.petrolAllowance} onChange={h} type="number" /></R>
            <R><BOSTextField select name="shift" label="Shift?" value={form.shift} onChange={h}><MenuItem value="Yes">Yes</MenuItem><MenuItem value="No">No</MenuItem></BOSTextField></R>
            <R><BOSTextField select name="shiftName" label="Shift Name" value={form.shiftName} onChange={h}><MenuItem value="GENERAL">GENERAL</MenuItem><MenuItem value="SHIFT 1">SHIFT 1</MenuItem><MenuItem value="SHIFT 2">SHIFT 2</MenuItem><MenuItem value="SHIFT 3">SHIFT 3</MenuItem></BOSTextField></R>
            <R><BOSTextField name="shiftDuration" label="Shift Duration" value={form.shiftDuration} onChange={h} maxLength={50} /></R>
          </Grid>
        </BOSFormSection>

        {/* ═══ SECTION 5: ABILITY ═══ */}
        <BOSFormSection icon={<IconShieldCheck size={20} color={theme.palette.secondary.main} />} title="Employee Ability">
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              {renderAbilityRow('Auditor', 'isAuditor', 'auditorType', 'auditorFileInfo')}
              {renderAbilityRow('Auditee', 'isAuditee', 'auditeeType', 'auditeeFileInfo')}
              {renderAbilityRow('NCR Approved by', 'isNcrApprover', 'ncrApproverType', 'ncrApproverFileInfo')}
              {renderAbilityRow('Chaired', 'isChaired', 'chairedType', '', true, false)}
              {renderAbilityRow('Host', 'isHost', 'hostType', '', true, false)}
              {renderAbilityRow('Participants', 'isParticipants', 'participantsType', '', true, false)}
              <Grid container spacing={2.5} sx={{ mt: 1 }}>
                <R lg={6}><BOSTextField name="segment" label="Segment" value={form.segment} onChange={h} /></R>
                <R lg={6}><BOSTextField name="subSegment" label="Sub Segment" value={form.subSegment} onChange={h} /></R>
              </Grid>
            </Grid>
            <Grid item xs={12} md={6}>
              {renderAbilityRow('First Aid', 'isFirstAid', '', 'firstAidFileInfo', false, true)}
              {renderAbilityRow('Fire Fighter', 'isFireFighter', '', 'fireFighterFileInfo', false, true)}
              {renderAbilityRow('Two Wheeler Driving', 'isTwoWheeler', '', 'twoWheelerFileInfo', false, true)}
              {renderAbilityRow('Four Wheeler Driving', 'isFourWheeler', '', 'fourWheelerFileInfo', false, true)}
              
              <Grid container spacing={2.5} sx={{ mt: 1, p: 1.5, bgcolor: 'action.hover', borderRadius: 2 }}>
                <R lg={6}><BOSTextField select name="isInductionEligible" label="Induction" value={form.isInductionEligible} onChange={h}><MenuItem value="YES">YES</MenuItem><MenuItem value="NO">NO</MenuItem></BOSTextField></R>
                <R lg={6}><BOSTextField select name="isInterviewer" label="Interviewer" value={form.isInterviewer} onChange={h}><MenuItem value="YES">YES</MenuItem><MenuItem value="NO">NO</MenuItem></BOSTextField></R>
                <R lg={6}><BOSTextField select name="isEnquiryAssignee" label="Enquiry Assign" value={form.isEnquiryAssignee} onChange={h}><MenuItem value="YES">YES</MenuItem><MenuItem value="NO">NO</MenuItem></BOSTextField></R>
                <R lg={6}><BOSTextField select name="isPrAssignee" label="PR Assign" value={form.isPrAssignee} onChange={h}><MenuItem value="YES">YES</MenuItem><MenuItem value="NO">NO</MenuItem></BOSTextField></R>
              </Grid>
            </Grid>
          </Grid>
        </BOSFormSection>

        {/* ═══ SUB-SECTIONS — Continuous Scroll ═══ */}
        {!employeeId && (
          <BOSFormSection icon={<IconUser size={20} color={theme.palette.warning.main} />} title="Additional Sections">
            <Typography variant="body2" color="warning.dark" sx={{ fontWeight: 600 }}>
              💡 Save the employee first to enable editing Personal, Contact, Job Profile, Education, Experience, Emergency, Passport, Dependent, Asset, KYC, and Activity sections below.
            </Typography>
          </BOSFormSection>
        )}
        <EmployeeSubSections employeeId={employeeId} />
      </Stack>

      <ConfirmDeleteDialog open={deleteOpen} onClose={() => setDeleteOpen(false)} onConfirm={handleDelete} title="Delete Employee" message="This will permanently delete the employee and ALL related data." itemName={`${form.firstName} ${form.lastName}`} />

      {/* --- Document Preview Dialog --- */}
      <Dialog open={previewOpen} onClose={() => setPreviewOpen(false)} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle component="div" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>{previewData.name}</Typography>
          <IconButton onClick={() => setPreviewOpen(false)}><IconX size={20} /></IconButton>
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center', bgcolor: '#fafafa', p: previewData.content ? 2 : 0, minHeight: '500px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {previewData.loading ? (
            <CircularProgress />
          ) : previewData.content ? (
            <Box sx={{ width: '100%', height: '70vh', overflow: 'auto', textAlign: 'left', bgcolor: '#fff', p: 2, borderRadius: 1, border: '1px solid #ddd' }} dangerouslySetInnerHTML={{ __html: previewData.content }} />
          ) : (
            previewData.url && (
              previewData.name?.toLowerCase().endsWith('.pdf') ? (
                <iframe title="PDF Preview" src={previewData.url} style={{ width: '100%', height: '70vh', border: 'none' }} />
              ) : (
                <Box 
                  component="img" 
                  src={previewData.url} 
                  sx={{ maxWidth: '100%', maxHeight: '70vh', objectFit: 'contain' }} 
                />
              )
            )
          )}
        </DialogContent>
      </Dialog>
    </MainCard>
  );
}
