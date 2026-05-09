import { useState, useEffect, useCallback } from 'react';
import { Grid, Button, Stack, MenuItem, Typography, useTheme } from '@mui/material';
import { IconPlus, IconDeviceFloppy, IconHeart, IconPhone, IconWallet, IconSchool, IconBriefcase, IconAlertTriangle, IconEPassport, IconUsers, IconDevices, IconShieldCheck, IconFileText, IconActivity } from '@tabler/icons-react';
import { BOSFormSection, BOSTextField, BOSDataTable, btnSave } from 'ui-component/bos';
import { useDispatch } from 'react-redux';
import { openSnackbar } from 'store/slices/snackbar';
import axios from 'utils/axios';
import { API_PATHS } from 'utils/api-constants';

const API = API_PATHS.HRM.EMPLOYEES;
const snack = (dispatch, msg, sev = 'success') => dispatch(openSnackbar({ open: true, message: msg, variant: 'alert', alert: { variant: 'filled' }, severity: sev, close: false }));

// ─── Grid field wrapper ────────────────────────────
const R = ({ children, lg = 4 }) => <Grid item xs={12} sm={6} md={4} lg={lg}>{children}</Grid>;

// ─── SECTION 1:1 (single record per employee) ────────────────
function Section1to1({ title, icon, endpoint, employeeId, fields }) {
  const theme = useTheme();
  const dispatch = useDispatch();
  const [form, setForm] = useState({});
  const [loaded, setLoaded] = useState(!employeeId);
  const h = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  const disabled = !employeeId;

  useEffect(() => {
    if (!employeeId) { setLoaded(true); return; }
    axios.get(`${API}/${employeeId}/${endpoint}`).then(({ data }) => { if (data && data.id) setForm(data); setLoaded(true); }).catch(() => setLoaded(true));
  }, [employeeId, endpoint]);

  const save = async () => {
    if (!employeeId) return;
    try { const { data } = await axios.post(`${API}/${employeeId}/${endpoint}`, form); setForm(data); snack(dispatch, `${title} saved!`); }
    catch { snack(dispatch, `Failed to save ${title}`, 'error'); }
  };

  if (!loaded) return null;
  return (
    <BOSFormSection icon={icon || <IconHeart size={20} color={theme.palette.primary.main} />} title={title}>
      <Grid container spacing={2.5}>
        {fields.map((f) => (
          <R key={f.name} lg={f.lg || 4}>
            {f.select ? (
              <BOSTextField select name={f.name} label={f.label} value={form[f.name] || ''} onChange={h} disabled={disabled}>{f.options.map((o) => <MenuItem key={o} value={o}>{o}</MenuItem>)}</BOSTextField>
            ) : (
              <BOSTextField name={f.name} label={f.label} value={form[f.name] || ''} onChange={h} type={f.type || 'text'} maxLength={f.max} InputLabelProps={f.type === 'date' ? { shrink: true } : undefined} disabled={disabled} multiline={f.multiline} rows={f.rows} />
            )}
          </R>
        ))}
      </Grid>
      <Stack direction="row" justifyContent="flex-end" sx={{ mt: 2 }}>
        <Button variant="contained" startIcon={<IconDeviceFloppy size={16} />} onClick={save} disabled={disabled} sx={btnSave}>
          {disabled ? 'Save Employee First' : 'Save Section'}
        </Button>
      </Stack>
    </BOSFormSection>
  );
}

// ─── SECTION 1:N (multiple records per employee) ────────────
function Section1toN({ title, icon, endpoint, employeeId, fields, tableCols }) {
  const theme = useTheme();
  const dispatch = useDispatch();
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState({});
  const h = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  const disabled = !employeeId;

  const load = useCallback(() => {
    if (!employeeId) return;
    axios.get(`${API}/${employeeId}/${endpoint}`).then(({ data }) => setRows(data || [])).catch(() => {});
  }, [employeeId, endpoint]);
  useEffect(() => { load(); }, [load]);

  const save = async () => {
    if (!employeeId) return;
    try { await axios.post(`${API}/${employeeId}/${endpoint}`, form); setForm({}); load(); snack(dispatch, 'Record added!'); }
    catch { snack(dispatch, 'Failed to save', 'error'); }
  };
  const del = async (row) => {
    if (!employeeId) return;
    try { await axios.delete(`${API}/${endpoint}/${row.id}`); load(); snack(dispatch, 'Deleted!'); }
    catch { snack(dispatch, 'Failed to delete', 'error'); }
  };

  return (
    <BOSFormSection icon={icon || <IconFileText size={20} color={theme.palette.primary.main} />} title={title}>
      <Grid container spacing={2.5}>
        {fields.map((f) => (
          <R key={f.name} lg={f.lg || 4}>
            {f.select ? (
              <BOSTextField select name={f.name} label={f.label} value={form[f.name] || ''} onChange={h} disabled={disabled}>{f.options.map((o) => <MenuItem key={o} value={o}>{o}</MenuItem>)}</BOSTextField>
            ) : (
              <BOSTextField name={f.name} label={f.label} value={form[f.name] || ''} onChange={h} type={f.type || 'text'} maxLength={f.max} InputLabelProps={f.type === 'date' ? { shrink: true } : undefined} disabled={disabled} />
            )}
          </R>
        ))}
      </Grid>
      <Stack direction="row" justifyContent="flex-end" sx={{ mt: 2 }}>
        <Button variant="contained" color="primary" startIcon={<IconPlus size={16} />} onClick={save} disabled={disabled} sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600 }}>
          {disabled ? 'Save Employee First' : 'Add Record'}
        </Button>
      </Stack>
      {rows.length > 0 && (
        <BOSDataTable
          columns={tableCols}
          rows={rows}
          page={0}
          size={rows.length}
          totalCount={rows.length}
          loading={false}
          onPageChange={() => {}}
          onSizeChange={() => {}}
          onDeleteRow={del}
        />
      )}
      {rows.length === 0 && employeeId && (
        <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center', mt: 2, fontStyle: 'italic' }}>No records added yet</Typography>
      )}
    </BOSFormSection>
  );
}

// ─── MAIN EXPORT ────────────────────────────────────────────
export default function EmployeeSubSections({ employeeId }) {
  const theme = useTheme();
  const pc = theme.palette.primary.main;
  const wc = theme.palette.warning.main;

  return (
    <Stack spacing={3}>
      {/* PERSONAL DETAILS */}
      <Section1to1 title="Personal Details" icon={<IconHeart size={20} color={pc} />} endpoint="personal" employeeId={employeeId} fields={[
        { name: 'gender', label: 'Gender', select: true, options: ['MALE', 'FEMALE', 'TRANS GENDER'] },
        { name: 'birthDate', label: 'Birth Date', type: 'date' },
        { name: 'maritalStatus', label: 'Marital Status', select: true, options: ['UNMARRIED', 'MARRIED', 'WIDOW', 'DIVORCED'] },
        { name: 'marriageDate', label: 'Marriage Date', type: 'date' },
        { name: 'numberOfChildren', label: 'No. of Children', type: 'number' },
        { name: 'emailId', label: 'Email ID', max: 255 },
        { name: 'nationality', label: 'Nationality', max: 100 },
        { name: 'bloodGroup', label: 'Blood Group', select: true, options: ['UNINFORMED', 'O+ve', 'O-ve', 'A+ve', 'A-ve', 'B+ve', 'B-ve', 'AB+ve', 'AB-ve'] },
        { name: 'religion', label: 'Religion', select: true, options: ['HINDU', 'MUSLIM', 'CHRISTIAN', 'SIKHISM', 'BUDDHISM'] },
        { name: 'height', label: 'Height', max: 20 },
        { name: 'weight', label: 'Weight', max: 20 },
        { name: 'shirtSize', label: 'Shirt Size', max: 20 },
        { name: 'pantSize', label: 'Pant Size', max: 20 },
        { name: 'shoeSize', label: 'Shoe Size', max: 20 },
        { name: 'insuranceNumber', label: 'Insurance Number', max: 100 },
        { name: 'esicNumber', label: 'ESIC Number', max: 100 },
        { name: 'pfNumber', label: 'PF Number', max: 100 },
        { name: 'insuranceExpiryDate', label: 'Insurance Expiry', type: 'date' },
        { name: 'uanNumber', label: 'UAN Number', max: 100 },
        { name: 'panNumber', label: 'PAN Number', max: 20 },
        { name: 'aadharNumber', label: 'Aadhar Number', max: 20 },
        { name: 'drivingLicenseNumber', label: 'Driving License', max: 50 },
        { name: 'licenseExpiryDate', label: 'License Expiry', type: 'date' },
        { name: 'electionCardNumber', label: 'Election Card', max: 50 },
        { name: 'rationCardNumber', label: 'Ration Card', max: 50 },
        { name: 'companyIssuedMobile', label: 'Company Mobile', max: 20 },
        { name: 'mobileDeduction', label: 'Mobile Deduction', type: 'number' },
        { name: 'canteenAllowance', label: 'Canteen Allowance', type: 'number' },
        { name: 'loanInstallmentMonth', label: 'Loan Installment Month', max: 50 }
      ]} />

      {/* CONTACT DETAILS */}
      <Section1to1 title="Contact Details" icon={<IconPhone size={20} color={pc} />} endpoint="contact" employeeId={employeeId} fields={[
        { name: 'permAddress1', label: 'Perm Address 1', max: 255 }, { name: 'permAddress2', label: 'Perm Address 2', max: 255 },
        { name: 'permCity', label: 'Perm City', max: 100 }, { name: 'permState', label: 'Perm State', max: 100 },
        { name: 'permPinCode', label: 'Perm Pin Code', max: 20 }, { name: 'permPhone', label: 'Perm Phone', max: 20 }, { name: 'permMobile', label: 'Perm Mobile', max: 20 },
        { name: 'commAddress1', label: 'Comm Address 1', max: 255 }, { name: 'commAddress2', label: 'Comm Address 2', max: 255 },
        { name: 'commCity', label: 'Comm City', max: 100 }, { name: 'commState', label: 'Comm State', max: 100 },
        { name: 'commPinCode', label: 'Comm Pin Code', max: 20 }, { name: 'commPhone', label: 'Comm Phone', max: 20 }, { name: 'commMobile', label: 'Comm Mobile', max: 20 }
      ]} />

      {/* JOB PROFILE */}
      <Section1to1 title="Job Profile" icon={<IconWallet size={20} color={pc} />} endpoint="job-profile" employeeId={employeeId} fields={[
        { name: 'wagesType', label: 'Wages Type', select: true, options: ['Monthly', 'Daily', 'Hourly'] },
        { name: 'paymentMode', label: 'Payment Mode', select: true, options: ['Cheque', 'Cash', 'Bank'] },
        { name: 'salaryAccountNumber', label: 'Salary A/C No', max: 50 }, { name: 'personalAccountNumber', label: 'Personal A/C No', max: 50 },
        { name: 'bankName', label: 'Bank Name', max: 100 }, { name: 'ifscCode', label: 'IFSC Code', max: 20 },
        { name: 'branchName', label: 'Branch Name', max: 100 }, { name: 'bankMicroCode', label: 'Bank Micro Code', max: 50 },
        { name: 'officeEmail', label: 'Office Email', max: 255 }, { name: 'officialPassword', label: 'Official Password', max: 255 },
        { name: 'providentFund', label: 'Provident Fund', select: true, options: ['Yes', 'No'] },
        { name: 'esiAllowed', label: 'ESI Allowed', select: true, options: ['Yes', 'No'] },
        { name: 'professionalTax', label: 'Professional Tax', select: true, options: ['Yes', 'No'] },
        { name: 'bonus', label: 'Bonus', select: true, options: ['Yes', 'No'] },
        { name: 'overTimeAllowed', label: 'OT Allowed', select: true, options: ['Yes', 'No'] },
        { name: 'overTimeFactorial', label: 'OT Factorial', max: 20 },
        { name: 'physicallyChallenged', label: 'Physically Challenged', select: true, options: ['No', 'Yes-Locomotive disability', 'Yes-Visual', 'Yes-Hearing', 'Yes-Others'] },
        { name: 'lossOfMinutesDeduct', label: 'LOM Deduct', select: true, options: ['Yes', 'No'] },
        { name: 'lossOfMinutesAllow', label: 'LOM Allow', select: true, options: ['Yes', 'No'] },
        { name: 'internationalWorker', label: 'Intl Worker', select: true, options: ['Yes', 'No'] },
        { name: 'ltaEligible', label: 'LTA Eligible', select: true, options: ['Yes', 'No'] },
        { name: 'pfRestrictionTo', label: 'PF Restriction To', max: 50 },
        { name: 'companyContact1', label: 'Company Contact 1', max: 20 }, { name: 'companyContact2', label: 'Company Contact 2', max: 20 },
        { name: 'overTimeRatePerHour', label: 'OT Rate/Hr', type: 'number' }, { name: 'numberOfLeaveAllow', label: 'Leaves Allowed', type: 'number' },
        { name: 'assetId1', label: 'Asset ID 1', max: 50 }, { name: 'ipAddress1', label: 'IP Address 1', max: 50 },
        { name: 'assetId2', label: 'Asset ID 2', max: 50 }, { name: 'ipAddress2', label: 'IP Address 2', max: 50 },
        { name: 'permissionRequest', label: 'Permission Request', select: true, options: ['Yes', 'No'] },
        { name: 'permissionHours', label: 'Permission Hours', max: 20 }
      ]} />

      {/* EDUCATION (1:N) */}
      <Section1toN title="Education Details" icon={<IconSchool size={20} color={pc} />} endpoint="education" employeeId={employeeId}
        fields={[
          { name: 'education', label: 'Education', max: 100 }, { name: 'institutionName', label: 'Institution', max: 255 },
          { name: 'type', label: 'Type', select: true, options: ['Full Time', 'Part Time', 'Distance'] },
          { name: 'yearOfPassing', label: 'Year', max: 10 }, { name: 'percentageGrade', label: '% / Grade', max: 20 }
        ]}
        tableCols={[{ id: 'education', label: 'Education', minWidth: 140 }, { id: 'institutionName', label: 'Institution', minWidth: 200 }, { id: 'type', label: 'Type', minWidth: 100 }, { id: 'yearOfPassing', label: 'Year', minWidth: 80 }, { id: 'percentageGrade', label: '% / Grade', minWidth: 100 }]}
      />

      {/* EXPERIENCE (1:N) */}
      <Section1toN title="Experience / Services" icon={<IconBriefcase size={20} color={pc} />} endpoint="experience" employeeId={employeeId}
        fields={[
          { name: 'companyName', label: 'Company', max: 255 }, { name: 'location', label: 'Location', max: 255 },
          { name: 'fromDate', label: 'From', type: 'date' }, { name: 'toDate', label: 'To', type: 'date' },
          { name: 'totalExperienceMonths', label: 'Experience (Months)', type: 'number' }
        ]}
        tableCols={[{ id: 'companyName', label: 'Company', minWidth: 200 }, { id: 'location', label: 'Location', minWidth: 150 }, { id: 'fromDate', label: 'From', minWidth: 120 }, { id: 'toDate', label: 'To', minWidth: 120 }, { id: 'totalExperienceMonths', label: 'Months', minWidth: 80 }]}
      />

      {/* EMERGENCY CONTACTS (1:N) */}
      <Section1toN title="Emergency Contact Details" icon={<IconAlertTriangle size={20} color={wc} />} endpoint="emergency-contact" employeeId={employeeId}
        fields={[
          { name: 'contactName', label: 'Name', max: 100 }, { name: 'relation', label: 'Relation', max: 50 },
          { name: 'address1', label: 'Address 1', max: 255 }, { name: 'address2', label: 'Address 2', max: 255 },
          { name: 'mobileNumber', label: 'Mobile', max: 20 }, { name: 'homePhoneNumber', label: 'Home Phone', max: 20 }
        ]}
        tableCols={[{ id: 'contactName', label: 'Name', minWidth: 150 }, { id: 'relation', label: 'Relation', minWidth: 100 }, { id: 'mobileNumber', label: 'Mobile', minWidth: 120 }, { id: 'homePhoneNumber', label: 'Home Phone', minWidth: 120 }]}
      />

      {/* PASSPORT */}
      <Section1to1 title="Passport Details" icon={<IconEPassport size={20} color={pc} />} endpoint="passport" employeeId={employeeId} fields={[
        { name: 'passportNumber', label: 'Passport Number', max: 50 }, { name: 'passportIssueCity', label: 'Issue City', max: 100 },
        { name: 'issueDate', label: 'Issue Date', type: 'date' }, { name: 'expiryDate', label: 'Expiry Date', type: 'date' },
        { name: 'comments', label: 'Comments', max: 500, multiline: true, rows: 2 }
      ]} />

      {/* DEPENDENTS (1:N) */}
      <Section1toN title="Dependent Details" icon={<IconUsers size={20} color={pc} />} endpoint="dependent" employeeId={employeeId}
        fields={[
          { name: 'relationName', label: 'Name', max: 100 }, { name: 'relation', label: 'Relation', max: 50 },
          { name: 'gender', label: 'Gender', select: true, options: ['MALE', 'FEMALE', 'TRANS GENDER'] },
          { name: 'maritalStatus', label: 'Marital Status', select: true, options: ['UNMARRIED', 'MARRIED', 'WIDOW', 'DIVORCED'] },
          { name: 'aadharId', label: 'Aadhar ID', max: 20 },
          { name: 'contactNumber1', label: 'Contact 1', max: 20 }, { name: 'contactNumber2', label: 'Contact 2', max: 20 },
          { name: 'contactAddress', label: 'Address', max: 500 }
        ]}
        tableCols={[{ id: 'relationName', label: 'Name', minWidth: 150 }, { id: 'relation', label: 'Relation', minWidth: 100 }, { id: 'gender', label: 'Gender', minWidth: 80 }, { id: 'contactNumber1', label: 'Contact', minWidth: 120 }]}
      />

      {/* ASSETS (1:N) */}
      <Section1toN title="Asset Details" icon={<IconDevices size={20} color={pc} />} endpoint="asset" employeeId={employeeId}
        fields={[
          { name: 'assetId', label: 'Asset ID', max: 50 }, { name: 'assetName', label: 'Asset Name', max: 255 },
          { name: 'value', label: 'Value', type: 'number' }, { name: 'issueDate', label: 'Issue Date', type: 'date' },
          { name: 'comments', label: 'Comments', max: 500 }
        ]}
        tableCols={[{ id: 'assetId', label: 'Asset ID', minWidth: 100 }, { id: 'assetName', label: 'Name', minWidth: 200 }, { id: 'value', label: 'Value', minWidth: 100 }, { id: 'issueDate', label: 'Issue Date', minWidth: 120 }]}
      />

      {/* KYC */}
      <Section1to1 title="KYC Details" icon={<IconShieldCheck size={20} color={pc} />} endpoint="kyc" employeeId={employeeId} fields={[
        { name: 'pfNumber', label: 'PF Number', max: 100 }, { name: 'uanNumber', label: 'UAN Number', max: 100 },
        { name: 'panNumber', label: 'PAN Number', max: 20 }, { name: 'aadharNumber', label: 'Aadhar Number', max: 20 },
        { name: 'drivingLicenseNumber', label: 'Driving License', max: 50 }, { name: 'licenseExpiryDate', label: 'License Expiry', type: 'date' },
        { name: 'electionCardNumber', label: 'Election Card', max: 50 }, { name: 'rationCardNumber', label: 'Ration Card', max: 50 },
        { name: 'personalAccountNumber', label: 'Personal A/C', max: 50 }, { name: 'bankName', label: 'Bank Name', max: 100 },
        { name: 'ifscCode', label: 'IFSC Code', max: 20 },
        { name: 'physicallyChallenged', label: 'Physically Challenged', select: true, options: ['No', 'Yes-Locomotive disability', 'Yes-Visual', 'Yes-Hearing', 'Yes-Others'] },
        { name: 'physicallyChallengedCategory', label: 'PH Category', max: 50 },
        { name: 'internationalWorker', label: 'Intl Worker', select: true, options: ['Yes', 'No'] },
        { name: 'passportNumber', label: 'Passport Number', max: 50 }, { name: 'passportExpiryDate', label: 'Passport Expiry', type: 'date' }
      ]} />

      {/* KYC DOCUMENTS (1:N) */}
      <Section1toN title="KYC Documents" icon={<IconFileText size={20} color={pc} />} endpoint="kyc-document" employeeId={employeeId}
        fields={[
          { name: 'seqNo', label: 'Seq No', type: 'number' }, { name: 'documentName', label: 'Document Name', max: 255 },
          { name: 'documentNumber', label: 'Document Number', max: 100 }, { name: 'fileName', label: 'File Name', max: 255 }
        ]}
        tableCols={[{ id: 'seqNo', label: 'Seq', minWidth: 60 }, { id: 'documentName', label: 'Document', minWidth: 200 }, { id: 'documentNumber', label: 'Number', minWidth: 150 }, { id: 'fileName', label: 'File', minWidth: 150 }]}
      />

      {/* ACTIVITY (1:N) */}
      <Section1toN title="Employee Activity" icon={<IconActivity size={20} color={pc} />} endpoint="activity" employeeId={employeeId}
        fields={[{ name: 'activityDetails', label: 'Activity Details', max: 1000 }]}
        tableCols={[{ id: 'activityDetails', label: 'Activity Details', minWidth: 400 }]}
      />
    </Stack>
  );
}
