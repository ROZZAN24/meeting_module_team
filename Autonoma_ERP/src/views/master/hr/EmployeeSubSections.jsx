import { useState, useEffect, useCallback } from 'react';
import { Grid, Button, Stack, MenuItem, Typography, useTheme, Box, Divider } from '@mui/material';
import { IconPlus, IconDeviceFloppy, IconHeart, IconPhone, IconWallet, IconSchool, IconBriefcase, IconAlertTriangle, IconEPassport, IconUsers, IconDevices, IconShieldCheck, IconFileText, IconActivity, IconReceipt2, IconBuildingBank, IconMapPin } from '@tabler/icons-react';
import { BOSFormSection, BOSTextField, BOSDataTable, btnSave } from 'ui-component/bos';
import { useDispatch } from 'react-redux';
import { openSnackbar } from 'store/slices/snackbar';
import axios from 'utils/axios';
import { API_PATHS } from 'utils/api-constants';

const API = API_PATHS.HRM.EMPLOYEES;
const snack = (dispatch, msg, sev = 'success') => dispatch(openSnackbar({ open: true, message: msg, variant: 'alert', alert: { variant: 'filled' }, severity: sev, close: false }));

const R = ({ children, lg = 3 }) => <Grid item xs={12} sm={6} md={4} lg={lg}>{children}</Grid>;

function Section1to1({ title, icon, endpoint, employeeId, fields, validation }) {
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
    if (validation && !validation(form)) return;
    try { const { data } = await axios.post(`${API}/${employeeId}/${endpoint}`, form); setForm(data); snack(dispatch, `${title} saved!`); }
    catch { snack(dispatch, `Failed to save ${title}`, 'error'); }
  };

  if (!loaded) return null;
  return (
    <BOSFormSection icon={icon || <IconHeart size={20} color={theme.palette.primary.main} />} title={title}>
      <Grid container spacing={2.5}>
        {fields.map((f) => {
          const isHidden = f.hideIf && f.hideIf(form);
          if (isHidden) return null;
          return (
            <R key={f.name} lg={f.lg || 4}>
              {f.select ? (
                <BOSTextField select name={f.name} label={f.label} value={form[f.name] || ''} onChange={h} disabled={disabled || f.disabled}>
                  {f.options.map((o) => <MenuItem key={o} value={o}>{o}</MenuItem>)}
                </BOSTextField>
              ) : (
                <BOSTextField 
                  name={f.name} 
                  label={f.label} 
                  value={form[f.name] || ''} 
                  onChange={h} 
                  type={f.type || 'text'} 
                  maxLength={f.max} 
                  InputLabelProps={f.type === 'date' ? { shrink: true } : undefined} 
                  disabled={disabled || f.disabled} 
                  multiline={f.multiline} 
                  rows={f.rows}
                  required={f.required}
                />
              )}
            </R>
          );
        })}
      </Grid>
      <Stack direction="row" justifyContent="flex-end" sx={{ mt: 2 }}>
        <Button variant="contained" startIcon={<IconDeviceFloppy size={16} />} onClick={save} disabled={disabled} sx={btnSave}>
          {disabled ? 'Save Employee First' : 'Save Section'}
        </Button>
      </Stack>
    </BOSFormSection>
  );
}

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
        <Box sx={{ mt: 2 }}>
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
        </Box>
      )}
    </BOSFormSection>
  );
}

export default function EmployeeSubSections({ employeeId }) {
  const theme = useTheme();
  const pc = theme.palette.primary.main;
  const sc = theme.palette.secondary.main;
  const wc = theme.palette.warning.main;

  return (
    <Stack spacing={3}>
      {/* PERSONAL DETAILS */}
      <Section1to1 title="Personal Details" icon={<IconHeart size={20} color={pc} />} endpoint="personal" employeeId={employeeId} fields={[
        { name: 'gender', label: 'Gender', select: true, options: ['MALE', 'FEMALE', 'TRANS GENDER'] },
        { name: 'maritalStatus', label: 'Marital Status', select: true, options: ['UNMARRIED', 'MARRIED', 'WIDOW', 'DIVORCED'] },
        { name: 'marriageDate', label: 'Married Date', type: 'date', hideIf: (f) => f.maritalStatus !== 'MARRIED' }, 
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
      <BOSFormSection icon={<IconMapPin size={20} color={pc} />} title="Address Details">
        <Stack spacing={3}>
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 700, color: 'text.secondary' }}>PERMANENT ADDRESS</Typography>
            <Section1to1 endpoint="contact" employeeId={employeeId} fields={[
              { name: 'address', label: 'Address', max: 500, multiline: true, rows: 2, lg: 12 },
              { name: 'city', label: 'City', max: 100 },
              { name: 'state', label: 'State', max: 100 },
              { name: 'country', label: 'Country', max: 100 },
              { name: 'pincode', label: 'Pincode', max: 20 }
            ]} />
          </Box>
          <Divider />
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 700, color: 'text.secondary' }}>COMMUNICATION ADDRESS</Typography>
            <Section1to1 endpoint="contact" employeeId={employeeId} fields={[
              { name: 'commAddress', label: 'Address', max: 500, multiline: true, rows: 2, lg: 12 },
              { name: 'commCity', label: 'City', max: 100 },
              { name: 'commState', label: 'State', max: 100 },
              { name: 'commCountry', label: 'Country', max: 100 },
              { name: 'commPincode', label: 'Pincode', max: 20 }
            ]} />
          </Box>
        </Stack>
      </BOSFormSection>

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
      <Section1to1 title="Bank Details" icon={<IconBuildingBank size={20} color={pc} />} endpoint="job-profile" employeeId={employeeId} fields={[
        { name: 'salaryAccountNumber', label: 'Account No', max: 50 },
        { name: 'accountName', label: 'Account Name', max: 100 },
        { name: 'branchName', label: 'Branch Name', max: 100 },
        { name: 'bankAccountType', label: 'Bank Account Type', select: true, options: ['SAVINGS', 'CURRENT', 'SALARY'] },
        { name: 'bankName', label: 'Bank Name', max: 100 },
        { name: 'ifscCode', label: 'IFSC Code', max: 20 }
      ]} />

      {/* QUALIFICATION DETAILS */}
      <Section1toN title="Qualification Details" icon={<IconSchool size={20} color={pc} />} endpoint="education" employeeId={employeeId}
        fields={[
          { name: 'education', label: 'Qualification', max: 100 }, { name: 'institutionName', label: 'Institution', max: 255 },
          { name: 'type', label: 'Type', select: true, options: ['Full Time', 'Part Time', 'Distance'] },
          { name: 'yearOfPassing', label: 'Year', max: 10 }, { name: 'percentageGrade', label: '% / Grade', max: 20 }
        ]}
        tableCols={[{ id: 'education', label: 'Qualification', minWidth: 140 }, { id: 'institutionName', label: 'Institution', minWidth: 200 }, { id: 'type', label: 'Type', minWidth: 100 }, { id: 'yearOfPassing', label: 'Year', minWidth: 80 }, { id: 'percentageGrade', label: '% / Grade', minWidth: 100 }]}
      />

      {/* PAY COMPONENTS & CTC DETAILS */}
      <BOSFormSection icon={<IconReceipt2 size={20} color={sc} />} title="Pay Component & CTC Details">
        <Stack spacing={3}>
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 700, color: 'secondary.main' }}>PAY COMPONENTS</Typography>
            <Section1to1 endpoint="job-profile" employeeId={employeeId} fields={[
              { name: 'grossSalary', label: 'Gross Salary', type: 'number' },
              { name: 'netSalary', label: 'Net Salary', type: 'number' },
              { name: 'basicSalary', label: 'Basic', type: 'number' },
              { name: 'da', label: 'DA', type: 'number' },
              { name: 'hra', label: 'HRA', type: 'number' },
              { name: 'specialAllowance', label: 'Special Allowance', type: 'number' },
              { name: 'performanceIncentive', label: 'Performance Incentive', type: 'number' },
              { name: 'canteenDeduction', label: 'Canteen Deduction', type: 'number' },
              { name: 'pfType', label: 'PF Type', select: true, options: ['FULL', 'RESTRICTED', 'NONE'] },
              { name: 'pfEmployee', label: 'PF Employee Contribution', type: 'number' },
              { name: 'esiEmployee', label: 'ESI Employee Contribution', type: 'number' },
              { name: 'professionalTax', label: 'Professional Tax', type: 'number' }
            ]} />
          </Box>
          <Divider />
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 700, color: 'secondary.main' }}>ANNUAL CTC DETAILS</Typography>
            <Section1to1 endpoint="job-profile" employeeId={employeeId} fields={[
              { name: 'monthlyCtc', label: 'Monthly CTC', type: 'number' },
              { name: 'annualCtc', label: 'Annual CTC', type: 'number' },
              { name: 'gratuity', label: 'Gratuity', type: 'number' },
              { name: 'employerPf', label: 'Employer Contribution PF', type: 'number' },
              { name: 'employerEsi', label: 'Employer Contribution ESI', type: 'number' },
              { name: 'uniformAllowance', label: 'Uniform Allowance', type: 'number' },
              { name: 'shoeAllowance', label: 'Shoe Allowance', type: 'number' },
              { name: 'mobileAllowanceCug', label: 'Mobile Allowance CUG', type: 'number' },
              { name: 'healthInsurance', label: 'Health Insurance', type: 'number' },
              { name: 'bonus', label: 'Bonus', type: 'number' },
              { name: 'specialIncentive', label: 'Special Incentive', type: 'number' }
            ]} />
          </Box>
        </Stack>
      </BOSFormSection>

      {/* EXPERIENCE */}
      <Section1toN title="Work Experience" icon={<IconBriefcase size={20} color={pc} />} endpoint="experience" employeeId={employeeId}
        fields={[
          { name: 'companyName', label: 'Company', max: 255 }, { name: 'location', label: 'Location', max: 255 },
          { name: 'designation', label: 'Designation', max: 100 },
          { name: 'fromDate', label: 'From', type: 'date' }, { name: 'toDate', label: 'To', type: 'date' },
          { name: 'totalExperienceMonths', label: 'Experience (Months)', type: 'number' }
        ]}
        tableCols={[{ id: 'companyName', label: 'Company', minWidth: 200 }, { id: 'designation', label: 'Designation', minWidth: 150 }, { id: 'fromDate', label: 'From', minWidth: 120 }, { id: 'toDate', label: 'To', minWidth: 120 }, { id: 'totalExperienceMonths', label: 'Months', minWidth: 80 }]}
      />

      {/* FAMILY DETAILS */}
      <Section1toN title="Family Details" icon={<IconUsers size={20} color={pc} />} endpoint="dependent" employeeId={employeeId}
        fields={[
          { name: 'name', label: 'Name', max: 100 },
          { name: 'gender', label: 'Gender', select: true, options: ['MALE', 'FEMALE', 'OTHER'] },
          { name: 'dob', label: 'DOB', type: 'date' },
          { name: 'relationship', label: 'Relationship', max: 50 },
          { name: 'occupation', label: 'Occupation', max: 100 },
          { name: 'bloodGroup', label: 'Blood Group', max: 10 },
          { name: 'contactNo', label: 'Contact No', max: 20 }
        ]}
        tableCols={[{ id: 'name', label: 'Name', minWidth: 150 }, { id: 'relationship', label: 'Relation', minWidth: 100 }, { id: 'gender', label: 'Gender', minWidth: 100 }, { id: 'contactNo', label: 'Contact', minWidth: 120 }]}
      />

      {/* EMERGENCY CONTACTS */}
      <Section1toN title="Emergency Contact Details" icon={<IconAlertTriangle size={20} color={wc} />} endpoint="emergency-contact" employeeId={employeeId}
        fields={[
          { name: 'contactName', label: 'Name', max: 100 }, { name: 'relation', label: 'Relation', max: 50 },
          { name: 'mobileNumber', label: 'Mobile', max: 20 }, { name: 'address1', label: 'Address', max: 255 }
        ]}
        tableCols={[{ id: 'contactName', label: 'Name', minWidth: 150 }, { id: 'relation', label: 'Relation', minWidth: 100 }, { id: 'mobileNumber', label: 'Mobile', minWidth: 120 }]}
      />

      {/* KYC DOCUMENTS */}
      <Section1toN title="KYC Documents" icon={<IconFileText size={20} color={pc} />} endpoint="kyc-document" employeeId={employeeId}
        fields={[
          { name: 'documentName', label: 'Document Name', max: 255 },
          { name: 'documentNumber', label: 'Document Number', max: 100 }, { name: 'fileName', label: 'File Name', max: 255 }
        ]}
        tableCols={[{ id: 'documentName', label: 'Document', minWidth: 200 }, { id: 'documentNumber', label: 'Number', minWidth: 150 }, { id: 'fileName', label: 'File', minWidth: 150 }]}
      />
    </Stack>
  );
}
