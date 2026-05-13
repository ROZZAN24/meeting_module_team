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

// ─── Grid field wrapper (standardized to 4 columns for even spacing) ────────────────────────────
const R = ({ children, lg = 3 }) => <Grid item xs={12} sm={6} md={4} lg={lg}>{children}</Grid>;

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
        { name: 'maritalStatus', label: 'Marital Status', select: true, options: ['UNMARRIED', 'MARRIED', 'WIDOW', 'DIVORCED'] },
        { name: 'marriageDate', label: 'Married Date', type: 'date' }, 
        { name: 'birthDate', label: 'DOB', type: 'date' },
        { name: 'dateOfJoining', label: 'DOJ', type: 'date' }, 
        { name: 'nationality', label: 'Nationality', max: 100 },
        { name: 'emailId', label: 'Email', max: 255 },
        { name: 'bloodGroup', label: 'Blood Group', select: true, options: ['UNINFORMED', 'O+ve', 'O-ve', 'A+ve', 'A-ve', 'B+ve', 'B-ve', 'AB+ve', 'AB-ve'] },
        { name: 'region', label: 'Region', max: 100 },
        { name: 'shirtSize', label: 'Shirt Size', max: 20 },
        { name: 'pantSize', label: 'Pant Size', max: 20 },
        { name: 'shoeSize', label: 'Shoe Size', max: 20 },
        { name: 'height', label: 'Height', max: 20 },
        { name: 'weight', label: 'Weight', max: 20 }
      ]} />

      {/* ADDRESS DETAILS */}
      <Section1to1 title="Address Details" icon={<IconPhone size={20} color={pc} />} endpoint="contact" employeeId={employeeId} fields={[
        { name: 'permCity', label: 'Permanent Address - City', max: 100 },
        { name: 'permState', label: 'Permanent Address - State', max: 100 },
        { name: 'permCountry', label: 'Permanent Address - Country', max: 100 },
        { name: 'permPinCode', label: 'Permanent Address - Pincode', max: 20 },
        { name: 'commCity', label: 'Communication Address - City', max: 100 },
        { name: 'commState', label: 'Communication Address - State', max: 100 },
        { name: 'commCountry', label: 'Communication Address - Country', max: 100 },
        { name: 'commPinCode', label: 'Communication Address - Pincode', max: 20 }
      ]} />

      {/* ID DETAILS */}
      <Section1to1 title="ID Details" icon={<IconEPassport size={20} color={pc} />} endpoint="personal" employeeId={employeeId} fields={[
        { name: 'aadharNumber', label: 'Aadhar No', max: 20 },
        { name: 'drivingLicenseNumber', label: 'Driving License No', max: 50 },
        { name: 'passportNumber', label: 'Passport No', max: 50 },
        { name: 'passportIssueCity', label: 'Place Of Issue', max: 100 },
        { name: 'licenseExpiryDate', label: 'Date Of Expiry', type: 'date' },
        { name: 'loanInstallmentAmount', label: 'Loan Installment Amount', type: 'number' }
      ]} />

      {/* STATUTORY DETAILS */}
      <Section1to1 title="Statutory Details" icon={<IconShieldCheck size={20} color={pc} />} endpoint="personal" employeeId={employeeId} fields={[
        { name: 'panNumber', label: 'PAN No', max: 20 },
        { name: 'pfNumber', label: 'PF No', max: 100 },
        { name: 'uanNumber', label: 'UAN No', max: 100 }
      ]} />

      {/* BANK DETAILS */}
      <Section1to1 title="Bank Details" icon={<IconWallet size={20} color={pc} />} endpoint="job-profile" employeeId={employeeId} fields={[
        { name: 'salaryAccountNumber', label: 'Account No', max: 50 },
        { name: 'accountName', label: 'Account Name', max: 100 },
        { name: 'branchName', label: 'Branch Name', max: 100 },
        { name: 'bankAccountType', label: 'Bank Account Type', select: true, options: ['SAVINGS', 'CURRENT', 'SALARY'] },
        { name: 'bankName', label: 'Bank Name', max: 100 },
        { name: 'ifscCode', label: 'IFSC Code', max: 20 }
      ]} />

      {/* QUALIFICATION DETAILS (1:N) */}
      <Section1toN title="Qualification Details" icon={<IconSchool size={20} color={pc} />} endpoint="education" employeeId={employeeId}
        fields={[
          { name: 'education', label: 'Qualification', max: 100 }, { name: 'institutionName', label: 'Institution', max: 255 },
          { name: 'type', label: 'Type', select: true, options: ['Full Time', 'Part Time', 'Distance'] },
          { name: 'yearOfPassing', label: 'Year', max: 10 }, { name: 'percentageGrade', label: '% / Grade', max: 20 }
        ]}
        tableCols={[{ id: 'education', label: 'Qualification', minWidth: 140 }, { id: 'institutionName', label: 'Institution', minWidth: 200 }, { id: 'type', label: 'Type', minWidth: 100 }, { id: 'yearOfPassing', label: 'Year', minWidth: 80 }, { id: 'percentageGrade', label: '% / Grade', minWidth: 100 }]}
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
