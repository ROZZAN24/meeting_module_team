import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Grid, Button, Typography, Stack, MenuItem, useTheme, Tooltip } from '@mui/material';
import { IconUserPlus, IconDeviceFloppy, IconArrowLeft, IconTrash, IconEraser, IconUser, IconBriefcase, IconCalendar, IconSettings, IconShieldCheck, IconCloudUpload, IconFileDescription } from '@tabler/icons-react';
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

const INITIAL = {
  categoryId: '', subCategoryId: '', empLevelId: '', employeeTypeId: '', gradeCode: '',
  title: '', firstName: '', lastName: '', empCode: '', oldEmpCode: '', fatherHusbandName: '', guest: 'No',
  departmentId: '', designationId: '', unitId: '', productionLine: '', empClass: '', teamGroup: '', additionalRole: '',
  dateOfJoining: '', confirmationDate: '', nextRevisionDate: '', exitDate: '', exitReason: '',
  dailySheetRequired: 'No', attendanceRequired: 'Yes', inductionStatus: 'PENDING', shift: 'Yes', shiftName: 'GENERAL', shiftDuration: '480', graceMinutes: '0',
  petrolAllowance: '0.00', petrolMode: 'NA', referMode: '', userName: '', homeManager: '', businessManager: '', supplierName: '',
  profileUpload: '', signature: '', ndaCertificateUpload: '', fitnessCertificateUpload: '', status: 'Active',
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
  { field: 'empCode', label: 'Employee Code', required: true, maxLength: 50 },
  { field: 'categoryId', label: 'Category', required: true },
  { field: 'empLevelId', label: 'Level', required: false },
  { field: 'employeeTypeId', label: 'Type', required: true },
  { field: 'title', label: 'Title', required: true },
  { field: 'departmentId', label: 'Department', required: true }
];

// Shared field renderer using Grid for consistent layout
const R = ({ children, lg = 4 }) => <Grid item xs={12} sm={6} md={4} lg={lg}>{children}</Grid>;

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
  
  // Added AUDIT_TYPE to lookups
  const { 
    departments = [], 
    designations = [], 
    designationLevels = [],
    auditTypes = [] 
  } = useLookups(['DEPARTMENTS', 'DESIGNATIONS', 'DESIGNATION_LEVELS', 'AUDIT_TYPE']);

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

  const renderAbilityRow = (label, toggleName, typeName, fileName, hasType = true, hasFile = true) => {
    const fileData = form[fileName] ? JSON.parse(form[fileName]) : [];
    const displayFile = fileData[0]?.fileName || '';

    return (
      <Grid container spacing={2} alignItems="center" sx={{ mb: 1.5, p: 1, borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
        <Grid item xs={3}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{label}</Typography>
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
              label="Type" 
              value={form[typeName] || ''} 
              onChange={h} 
              size="small"
              disabled={form[toggleName] === 'NO'}
            >
              <MenuItem value="">-Select-</MenuItem>
              {auditTypes.map((t) => (
                <MenuItem key={t.id} value={t.auditType}>{t.auditType}</MenuItem>
              ))}
              {/* Fallback for system-defined types like DDRM if not in audit types */}
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
              <Button component="label" variant="outlined" size="small" startIcon={<IconCloudUpload size={16} />} sx={{ textTransform: 'none' }}>
                {displayFile ? 'Replace' : 'Upload'}
                <input type="file" hidden onChange={(e) => handleAbilityFileUpload(fileName, e.target.files[0])} />
              </Button>
              {displayFile && (
                <Tooltip title={displayFile}>
                  <Typography variant="caption" sx={{ maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {displayFile}
                  </Typography>
                </Tooltip>
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
            <R><BOSTextField select name="subCategoryId" label="Sub Category" value={form.subCategoryId} onChange={h}>{SUB_CATEGORIES.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}</BOSTextField></R>
            <R><BOSTextField select name="empLevelId" label="Level" value={form.empLevelId} onChange={h}>{designationLevels.map(l => <MenuItem key={l.rowId} value={l.rowId}>{l.level}</MenuItem>)}</BOSTextField></R>
            <R><BOSTextField select name="employeeTypeId" label="Type" value={form.employeeTypeId} onChange={h} required error={!!errors.employeeTypeId} helperText={errors.employeeTypeId}>{TYPES.map(t => <MenuItem key={t.id} value={t.id}>{t.typeName}</MenuItem>)}</BOSTextField></R>
            <R><BOSTextField select name="gradeCode" label="Grade Code" value={form.gradeCode} onChange={h}><MenuItem value="O">O</MenuItem><MenuItem value="P">P</MenuItem><MenuItem value="T">T</MenuItem><MenuItem value="C">C</MenuItem><MenuItem value="E">E</MenuItem></BOSTextField></R>
            <R><BOSTextField select name="title" label="Title" value={form.title} onChange={h} required error={!!errors.title} helperText={errors.title}><MenuItem value="Mr">Mr</MenuItem><MenuItem value="Miss">Miss</MenuItem><MenuItem value="Mrs">Mrs</MenuItem><MenuItem value="Mx">Mx</MenuItem></BOSTextField></R>
            <R><BOSTextField name="firstName" label="First Name" value={form.firstName} onChange={h} required maxLength={100} error={!!errors.firstName} helperText={errors.firstName} /></R>
            <R><BOSTextField name="lastName" label="Last Name" value={form.lastName} onChange={h} required maxLength={100} error={!!errors.lastName} helperText={errors.lastName} /></R>
            <R><BOSTextField name="empCode" label="Employee Code" value={form.empCode} onChange={h} required maxLength={50} error={!!errors.empCode} helperText={errors.empCode} /></R>
            <R><BOSTextField name="oldEmpCode" label="Old Employee Code" value={form.oldEmpCode} onChange={h} maxLength={50} /></R>
            <R><BOSTextField name="fatherHusbandName" label="Father / Husband Name" value={form.fatherHusbandName || ''} onChange={h} maxLength={100} /></R>
            <R><BOSTextField select name="guest" label="Guest?" value={form.guest} onChange={h}><MenuItem value="Yes">Yes</MenuItem><MenuItem value="No">No</MenuItem></BOSTextField></R>
          </Grid>
        </BOSFormSection>

        {/* ═══ SECTION 2: ORGANIZATION ═══ */}
        <BOSFormSection icon={<IconBriefcase size={20} color={theme.palette.primary.main} />} title="Organization & Assignment">
          <Grid container spacing={2.5}>
            <R><BOSTextField select name="departmentId" label="Department" value={form.departmentId} onChange={h} required error={!!errors.departmentId} helperText={errors.departmentId}>{departments.map((d) => <MenuItem key={d.id} value={d.id}>{d.departmentName}</MenuItem>)}</BOSTextField></R>
            <R><BOSTextField select name="designationId" label="Designation" value={form.designationId} onChange={h}>{designations.map((d) => <MenuItem key={d.id} value={d.id}>{d.designationName}</MenuItem>)}</BOSTextField></R>
            <R><BOSTextField select name="unitId" label="Unit Name" value={form.unitId} onChange={h}><MenuItem value={1}>UNIT1</MenuItem></BOSTextField></R>
            <R><BOSTextField name="productionLine" label="Production Line" value={form.productionLine} onChange={h} maxLength={100} /></R>
            <R><BOSTextField select name="empClass" label="Class" value={form.empClass} onChange={h}><MenuItem value="EXECUTIVE">EXECUTIVE</MenuItem><MenuItem value="STAFF">STAFF</MenuItem><MenuItem value="TRAINEE">TRAINEE</MenuItem><MenuItem value="WORKER">WORKER</MenuItem></BOSTextField></R>
            <R><BOSTextField name="teamGroup" label="Team Group" value={form.teamGroup} onChange={h} maxLength={100} /></R>
            <R><BOSTextField name="additionalRole" label="Additional Role" value={form.additionalRole} onChange={h} maxLength={100} /></R>
            <R><BOSTextField select name="referMode" label="Ref Mode" value={form.referMode} onChange={h}>{REF_MODES.map(r => <MenuItem key={r} value={r}>{r}</MenuItem>)}</BOSTextField></R>
            <R><BOSTextField name="userName" label="User Name" value={form.userName} onChange={h} maxLength={100} inputProps={{ readOnly: true }} /></R>
            <R><BOSTextField name="homeManager" label="Home Manager" value={form.homeManager} onChange={h} maxLength={100} /></R>
            <R><BOSTextField name="businessManager" label="Business Manager" value={form.businessManager} onChange={h} maxLength={100} /></R>
            <R><BOSTextField name="supplierName" label="Supplier Name" value={form.supplierName} onChange={h} maxLength={100} /></R>
          </Grid>
        </BOSFormSection>

        {/* ═══ SECTION 3: DATES & SCHEDULING ═══ */}
        <BOSFormSection icon={<IconCalendar size={20} color={theme.palette.primary.main} />} title="Dates & Scheduling">
          <Grid container spacing={2.5}>
            <R><BOSTextField name="dateOfJoining" label="Date Of Joining" type="date" value={form.dateOfJoining} onChange={h} InputLabelProps={{ shrink: true }} /></R>
            <R><BOSTextField name="confirmationDate" label="Confirmation Date" type="date" value={form.confirmationDate} onChange={h} InputLabelProps={{ shrink: true }} /></R>
            <R><BOSTextField name="nextRevisionDate" label="Next Revision Date" type="date" value={form.nextRevisionDate} onChange={h} InputLabelProps={{ shrink: true }} /></R>
            <R><BOSTextField name="exitDate" label="Exit Date" type="date" value={form.exitDate} onChange={h} InputLabelProps={{ shrink: true }} /></R>
            <R><BOSTextField select name="exitReason" label="Exit Reason" value={form.exitReason} onChange={h}><MenuItem value="Resigned">Resigned</MenuItem><MenuItem value="Termination">Termination</MenuItem><MenuItem value="Death">Death</MenuItem><MenuItem value="Others">Others</MenuItem></BOSTextField></R>
            <R><BOSTextField name="inductionStatus" label="Induction Status" value={form.inductionStatus} onChange={h} maxLength={50} inputProps={{ readOnly: true }} /></R>
          </Grid>
        </BOSFormSection>

        {/* ═══ SECTION 4: OPERATIONS ═══ */}
        <BOSFormSection icon={<IconSettings size={20} color={theme.palette.primary.main} />} title="Operations & Allowances">
          <Grid container spacing={2.5}>
            <R><BOSTextField select name="dailySheetRequired" label="Daily Sheet Required" value={form.dailySheetRequired} onChange={h}><MenuItem value="Yes">Yes</MenuItem><MenuItem value="No">No</MenuItem></BOSTextField></R>
            <R><BOSTextField select name="attendanceRequired" label="Attendance Required" value={form.attendanceRequired} onChange={h}><MenuItem value="Yes">Yes</MenuItem><MenuItem value="No">No</MenuItem></BOSTextField></R>
            <R><BOSTextField select name="shift" label="Shift?" value={form.shift} onChange={h}><MenuItem value="Yes">Yes</MenuItem><MenuItem value="No">No</MenuItem></BOSTextField></R>
            <R><BOSTextField select name="shiftName" label="Shift Name" value={form.shiftName} onChange={h}><MenuItem value="GENERAL">GENERAL</MenuItem><MenuItem value="SHIFT 1">SHIFT 1</MenuItem><MenuItem value="SHIFT 2">SHIFT 2</MenuItem><MenuItem value="SHIFT 3">SHIFT 3</MenuItem></BOSTextField></R>
            <R><BOSTextField name="shiftDuration" label="Shift Duration" value={form.shiftDuration} onChange={h} maxLength={50} /></R>
            <R><BOSTextField name="graceMinutes" label="Grace Minutes" value={form.graceMinutes} onChange={h} type="number" /></R>
            <R><BOSTextField select name="petrolMode" label="Petrol Mode" value={form.petrolMode} onChange={h}><MenuItem value="BIKE">BIKE</MenuItem><MenuItem value="CAR">CAR</MenuItem><MenuItem value="NA">NA</MenuItem></BOSTextField></R>
            <R><BOSTextField name="petrolAllowance" label="Petrol Allowance" value={form.petrolAllowance} onChange={h} type="number" /></R>
            <R><BOSTextField select name="status" label="Status" value={form.status} onChange={h}><MenuItem value="Active">Active</MenuItem><MenuItem value="In Active">In Active</MenuItem></BOSTextField></R>
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
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <R lg={6}><BOSTextField name="segment" label="Segment" value={form.segment} onChange={h} /></R>
                <R lg={6}><BOSTextField name="subSegment" label="Sub Segment" value={form.subSegment} onChange={h} /></R>
              </Grid>
            </Grid>
            <Grid item xs={12} md={6}>
              {renderAbilityRow('First Aid', 'isFirstAid', '', 'firstAidFileInfo', false, true)}
              {renderAbilityRow('Fire Fighter', 'isFireFighter', '', 'fireFighterFileInfo', false, true)}
              {renderAbilityRow('Two Wheeler Driving', 'isTwoWheeler', '', 'twoWheelerFileInfo', false, true)}
              {renderAbilityRow('Four Wheeler Driving', 'isFourWheeler', '', 'fourWheelerFileInfo', false, true)}
              
              <Grid container spacing={2} sx={{ mt: 1, p: 1.5, bgcolor: 'action.hover', borderRadius: 2 }}>
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
    </MainCard>
  );
}
