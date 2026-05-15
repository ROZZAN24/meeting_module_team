import { useState, useEffect, useCallback } from 'react';
import { Grid, Button, Stack, MenuItem, Typography, useTheme, Box, Divider, IconButton } from '@mui/material';
import { IconPlus, IconDeviceFloppy, IconTrash, IconHeart, IconFileText, IconMapPin, IconCertificate, IconCar, IconActivity, IconGavel, IconCamera, IconDeviceLaptop, IconUsers, IconAmbulance, IconAlertTriangle, IconEPassport, IconShieldCheck, IconBuildingBank, IconSchool, IconReceipt2, IconBriefcase, IconDevices } from '@tabler/icons-react';
import { BOSFormSection, BOSTextField, BOSDatePicker, BOSDataTable, btnSave, btnDelete, BOSFileUpload } from 'ui-component/bos';
import { useDispatch } from 'react-redux';
import { openSnackbar } from 'store/slices/snackbar';
import axios from 'utils/axios';
import { API_PATHS } from 'utils/api-constants';
import { autoUploadFile } from 'utils/upload-helper';

const API = API_PATHS.HRM.EMPLOYEES;
const snack = (dispatch, msg, sev = 'success') => dispatch(openSnackbar({ open: true, message: msg, variant: 'alert', alert: { variant: 'filled' }, severity: sev, close: false }));

const R = ({ children, lg = 3 }) => <Grid item xs={12} sm={6} md={4} lg={lg}>{children}</Grid>;

function Section1to1({ title, icon, endpoint, employeeId, fields, validation, onPreview }) {
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
    
    // Check if any data was actually entered
    const hasData = Object.values(form).some(v => v !== null && v !== '' && v !== undefined);
    if (!hasData) {
      snack(dispatch, 'Please fill the details in this section before saving.', 'warning');
      return;
    }

    if (validation && !validation(form)) return;
    try { 
      const { data } = await axios.post(`${API}/${employeeId}/${endpoint}`, form); 
      setForm(data); 
      snack(dispatch, `${title} saved successfully!`); 
    }
    catch { snack(dispatch, `Failed to save ${title}. Please try again.`, 'error'); }
  };

  const upload = (field, files) => {
    if (files && files.length > 0) {
      setForm(p => ({ ...p, [field]: files[0].serverFileName }));
    } else {
      setForm(p => ({ ...p, [field]: '' }));
    }
  };

  if (!loaded) return null;
  const content = (
    <Grid container spacing={2.5}>
      {fields.map((f, i) => {
        const isHidden = f.hideIf && f.hideIf(form);
        if (isHidden) return null;
        if (f.type === 'subheader') return (
          <Grid item xs={12} key={`sub-${i}`} sx={{ flexBasis: '100% !important', maxWidth: '100% !important' }}>
            <Box sx={{ mt: i === 0 ? 0 : 4, mb: 1.5, width: '100%' }}>
              <Typography variant="subtitle1" sx={{ color: 'primary.main', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{ width: 4, height: 20, bgcolor: 'primary.main', borderRadius: 1 }} />
                {f.label}
              </Typography>
              <Divider sx={{ mt: 1, borderColor: 'primary.light', borderBottomWidth: 2, opacity: 0.2 }} />
            </Box>
          </Grid>
        );
      return (
        <R key={f.name || i} lg={f.lg || 4}>
            {f.select ? (
              <BOSTextField select name={f.name} label={f.label} value={form[f.name] || ''} onChange={h} disabled={disabled || f.disabled}>
                {f.options.map((o) => <MenuItem key={o} value={o}>{o}</MenuItem>)}
              </BOSTextField>
            ) : f.type === 'file' ? (
              <BOSFileUpload
                files={form[f.name] ? [{ fileName: form[f.name].split('/').pop(), serverFileName: form[f.name], isServer: true }] : []}
                onChange={(files) => upload(f.name, files)}
                module="HRA_PROFILE"
                multiple={false}
                maxFiles={1}
                compact={true}
                label={f.label}
                disabled={disabled || f.disabled}
              />
            ) : f.type === 'date' ? (
              <BOSDatePicker
                name={f.name}
                label={f.label}
                value={form[f.name] || ''}
                onChange={h}
                disabled={disabled || f.disabled}
                required={f.required}
              />
            ) : (
              <BOSTextField 
                name={f.name} 
                label={f.label} 
                value={form[f.name] || ''} 
                onChange={h} 
                type={f.type || 'text'} 
                maxLength={f.max} 
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
  );

  const footer = employeeId ? (
    <Box sx={{ display: 'flex', justifyContent: 'flex-end', width: '100%', mt: 2 }}>
      <Button variant="contained" startIcon={<IconDeviceFloppy size={16} />} onClick={save} sx={{ ...btnSave, ml: 'auto' }}>
        Save Section
      </Button>
    </Box>
  ) : null;

  if (!title) return (
    <Box sx={{ p: 0 }}>
      {content}
      {footer}
    </Box>
  );

  return (
    <BOSFormSection icon={icon || <IconHeart size={20} color={theme.palette.primary.main} />} title={title}>
      {content}
      {footer}
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

  const upload = (field, files) => {
    if (files && files.length > 0) {
      setForm(p => ({ ...p, [field]: files[0].serverFileName }));
    } else {
      setForm(p => ({ ...p, [field]: '' }));
    }
  };

  const add = async () => {
    if (!employeeId) return;
    
    // Check if any data was actually entered
    const hasData = Object.values(form).some(v => v !== null && v !== '' && v !== undefined);
    if (!hasData) {
      snack(dispatch, 'Please fill the record details before adding.', 'warning');
      return;
    }

    try { 
      await axios.post(`${API}/${employeeId}/${endpoint}`, form); 
      setForm({}); 
      load(); 
      snack(dispatch, `${title} record added successfully!`); 
    }
    catch { snack(dispatch, 'Failed to save record. Please check required fields.', 'error'); }
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
            {f.type === 'file' ? (
              <BOSFileUpload
                files={form[f.name] ? [{ fileName: form[f.name].split('/').pop(), serverFileName: form[f.name], isServer: true }] : []}
                onChange={(files) => upload(f.name, files)}
                module="HRA_PROFILE"
                multiple={false}
                maxFiles={1}
                compact={true}
                label={f.label}
                disabled={disabled}
              />
            ) : f.select ? (
              <BOSTextField select name={f.name} label={f.label} value={form[f.name] || ''} onChange={h} disabled={disabled}>
                {f.options.map((o) => <MenuItem key={o} value={o}>{o}</MenuItem>)}
              </BOSTextField>
            ) : f.type === 'date' ? (
              <BOSDatePicker name={f.name} label={f.label} value={form[f.name] || ''} onChange={h} disabled={disabled} required={f.required} />
            ) : (
              <BOSTextField name={f.name} label={f.label} value={form[f.name] || ''} onChange={h} type={f.type || 'text'} disabled={disabled} />
            )}
          </R>
        ))}
      </Grid>

      {!disabled && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', width: '100%', mt: 2 }}>
          <Button variant="contained" startIcon={<IconDeviceFloppy size={16} />} onClick={add} sx={{ ...btnSave, ml: 'auto' }}>
            Save Section
          </Button>
        </Box>
      )}

      {rows.length > 0 && (
        <BOSDataTable
          columns={tableCols}
          rows={rows}
          onDeleteRow={del}
        />
      )}
    </BOSFormSection>
  );
}

export default function EmployeeSubSections({ employeeId, onPreview }) {
  const theme = useTheme();
  const pc = theme.palette.primary.main;
  const sc = theme.palette.secondary.main;
  const wc = theme.palette.warning.main;

  return (
    <Stack spacing={3}>
      {!employeeId && (
        <Box sx={{ p: 2.5, bgcolor: 'warning.light', borderRadius: 2, border: '1px dashed', borderColor: 'warning.main', mb: 1 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <IconAlertTriangle color={theme.palette.warning.dark} size={28} />
            <Box>
              <Typography variant="h4" color="warning.dark" sx={{ fontWeight: 700 }}>Save Main Employee Details First</Typography>
              <Typography variant="body2" color="warning.dark">Auxiliary sections (Personal, Address, Bank, etc.) will be enabled after you click the "Save" button at the top.</Typography>
            </Box>
          </Stack>
        </Box>
      )}
      {/* 5. PERSONAL DETAILS */}
      <Section1to1 title="Personal Details" icon={<IconHeart size={20} color={pc} />} endpoint="personal" employeeId={employeeId} onPreview={onPreview} fields={[
        { name: 'gender', label: 'Gender', select: true, options: ['MALE', 'FEMALE', 'OTHER'] },
        { name: 'maritalStatus', label: 'Marital Status', select: true, options: ['SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED'] },
        { name: 'marriageDate', label: 'Married Date', type: 'date', hideIf: (f) => f.maritalStatus !== 'MARRIED', required: true }, 
        { name: 'birthDate', label: 'DOB', type: 'date' },
        { name: 'dateOfJoining', label: 'DOJ', type: 'date', disabled: true }, 
        { name: 'nationality', label: 'Nationality', max: 100 },
        { name: 'personalEmail', label: 'Email', max: 255 }, // Changed to "Email" as per list
        { name: 'bloodGroup', label: 'Blood group', select: true, options: ['O+ve', 'O-ve', 'A+ve', 'A-ve', 'B+ve', 'B-ve', 'AB+ve', 'AB-ve'] },
        { name: 'region', label: 'Region', max: 100 },
        { name: 'shirtSize', label: 'Shirt Size', select: true, options: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'] },
        { name: 'pantSize', label: 'Pant Size', max: 20 },
        { name: 'shoeSize', label: 'Shoe Size', max: 20 },
        { name: 'height', label: 'Height', type: 'number' },
        { name: 'weight', label: 'Weight', type: 'number' }
      ]} />

      {/* 6. ADDRESS DETAILS */}
      <BOSFormSection icon={<IconMapPin size={20} color={pc} />} title="Address Details">
        <Section1to1 endpoint="contact" employeeId={employeeId} fields={[
          { name: 'address', label: 'Permanent Address (Communication Address)', max: 500, multiline: true, rows: 2, lg: 12 },
          { name: 'city', label: 'City', max: 100 },
          { name: 'state', label: 'State', max: 100 },
          { name: 'country', label: 'Country', max: 100 },
          { name: 'pincode', label: 'Pincode', max: 20 }
        ]} />
      </BOSFormSection>

      {/* 7. ID DETAILS */}
      <Section1to1 title="ID Details" icon={<IconEPassport size={20} color={pc} />} endpoint="personal" employeeId={employeeId} fields={[
        { name: 'aadharNumber', label: 'Aadhar No', max: 12 },
        { name: 'drivingLicenseNumber', label: 'Driving License No', max: 50 },
        { name: 'passportNumber', label: 'Passport No', max: 50 },
        { name: 'passportIssueCity', label: 'Place Of Issue', max: 100 },
        { name: 'licenseExpiryDate', label: 'Date Of Expiry', type: 'date' },
        { name: 'loanInstallmentAmount', label: 'Loan Installment Amount', type: 'number' }
      ]} />

      {/* 8. STATUTORY DETAILS */}
      <Section1to1 title="Statutory Details" icon={<IconShieldCheck size={20} color={pc} />} endpoint="personal" employeeId={employeeId} fields={[
        { name: 'panNumber', label: 'PAN No', max: 20 },
        { name: 'pfNumber', label: 'PF No', max: 100 },
        { name: 'uanNumber', label: 'UAN No', max: 100 }
      ]} />

      {/* 9. BANK DETAILS */}
      <Section1to1 title="Bank Details" icon={<IconBuildingBank size={20} color={pc} />} endpoint="job-profile" employeeId={employeeId} fields={[
        { name: 'salaryAccountNumber', label: 'Account No', max: 50 },
        { name: 'accountName', label: 'Account Name', max: 100 },
        { name: 'branchName', label: 'Branch Name', max: 100 },
        { name: 'bankAccountType', label: 'Bank Account Type', select: true, options: ['SAVINGS', 'CURRENT'] },
        { name: 'bankName', label: 'Bank Name', max: 100 },
        { name: 'ifscCode', label: 'IFSC Code', max: 20 }
      ]} />

      {/* 10. QUALIFICATION DETAILS */}
      <Section1toN title="Qualification Details" icon={<IconSchool size={20} color={pc} />} endpoint="education" employeeId={employeeId}
        fields={[
          { name: 'education', label: 'Qualification', max: 100 }, 
          { name: 'institutionName', label: 'Institution', max: 255 },
          { name: 'university', label: 'University', max: 255 },
          { name: 'yearOfPassing', label: 'Year Of Passing', max: 10 }, 
          { name: 'percentageGrade', label: 'Percentage/CGPA', max: 20 },
          { name: 'certificateFile', label: 'Certificate Upload', type: 'file' }
        ]}
        tableCols={[
          { id: 'education', label: 'Qualification', minWidth: 140 }, 
          { id: 'institutionName', label: 'Institution', minWidth: 150 }, 
          { id: 'yearOfPassing', label: 'Year', minWidth: 80 }, 
          { id: 'percentageGrade', label: '% / Grade', minWidth: 100 }
        ]}
      />

      {/* 11. PAY COMPONENTS */}
      <Section1to1 title="Pay Component" icon={<IconReceipt2 size={20} color={sc} />} endpoint="job-profile" employeeId={employeeId} onPreview={onPreview} fields={[
        { name: 'grossSalary', label: 'Gross Salary', type: 'number' },
        { name: 'netSalary', label: 'Net Salary', type: 'number' },
        { name: 'basicSalary', label: 'Basic', type: 'number' },
        { name: 'da', label: 'DA', type: 'number' },
        { name: 'hra', label: 'HRA', type: 'number' },
        { name: 'specialAllowance', label: 'Special Allowance', type: 'number' },
        { name: 'performanceIncentive', label: 'Performance Incentive', type: 'number' },
        { name: 'canteenDeduction', label: 'Canteen Deduction', type: 'number' },
        { name: 'pfType', label: 'PF Type', select: true, options: ['FULL', 'RESTRICTED', 'NONE'] },
        { name: 'pfEmployee', label: 'PF Employee', type: 'number' },
        { name: 'esiEmployee', label: 'ESI Employee', type: 'number' },
        { name: 'professionalTax', label: 'Professional tax', type: 'number' },
        { name: 'pfDocument', label: 'Upload PF Document', type: 'file' }
      ]} />

      {/* 12. CTC DETAILS */}
      <Section1to1 title="CTC Details" icon={<IconReceipt2 size={20} color={sc} />} endpoint="job-profile" employeeId={employeeId} fields={[
        { type: 'subheader', label: 'Monthly Components' },
        { name: 'monthlyCtc', label: 'Monthly CTC', type: 'number', lg: 4 },
        { name: 'basicSalaryCtc', label: 'Basic Salary', type: 'number', lg: 4 },
        { name: 'daCtc', label: 'DA', type: 'number', lg: 4 },
        { name: 'specialAllowanceCtc', label: 'Special Allowance', type: 'number', lg: 4 },
        { name: 'canteenAllowance', label: 'Canteen Allowance', type: 'number', lg: 4 },
        { name: 'performanceIncentiveCtc', label: 'Performance Incentive', type: 'number', lg: 4 },
        { name: 'esiCtc', label: 'ESI', type: 'number', lg: 4 },
        { name: 'pfCtc', label: 'PF', type: 'number', lg: 4 },
        { name: 'grossCtc', label: 'Gross', type: 'number', lg: 4 },
        { name: 'employerPf', label: 'Employer Contribution PF', type: 'number', lg: 4 },
        { name: 'employerEsi', label: 'Employer Contribution ESI', type: 'number', lg: 4 },
        { name: 'uniformAllowance', label: 'Uniform', type: 'number', lg: 4 },
        { name: 'shoeAllowance', label: 'Shoe', type: 'number', lg: 4 },
        { name: 'mobileAllowanceCug', label: 'Mobile Allowance CUG', type: 'number', lg: 4 },
        
        { type: 'subheader', label: 'Annual Components & Contributions' },
        { name: 'annualCtc', label: 'Annual CTC', type: 'number', lg: 4 },
        { name: 'salaryCtc', label: 'Salary', type: 'number', lg: 4 },
        { name: 'gratuity', label: 'Gratuity', type: 'number', lg: 4 },
        { name: 'pfEmpContribution', label: 'Employee Contribution PF', type: 'number', lg: 4 },
        { name: 'esiEmpContribution', label: 'Employee Contribution ESI', type: 'number', lg: 4 },
        { name: 'pfEmployerContribution', label: 'Employer Contribution PF', type: 'number', lg: 4 },
        { name: 'esiEmployerContribution', label: 'Employer Contribution ESI', type: 'number', lg: 4 },
        { name: 'bonus', label: 'Bonus', type: 'number', lg: 4 },
        { name: 'specialIncentive', label: 'Special Incentive', type: 'number', lg: 4 },
        { name: 'performanceLinkedIncentive', label: 'Performance Linked Incentive', type: 'number', lg: 4 },
        { name: 'healthInsurance', label: 'Health Insurance', type: 'number', lg: 4 },
        { name: 'uniformAnnual', label: 'Uniform (Annual)', type: 'number', lg: 4 },
        { name: 'shoeAnnual', label: 'Shoe (Annual)', type: 'number', lg: 4 },
        { name: 'mobileCugAnnual', label: 'Mobile Allowance CUG (Annual)', type: 'number', lg: 4 }
      ]} />

      {/* 13. WORK EXPERIENCE */}
      <Section1toN title="Work Experience" icon={<IconBriefcase size={20} color={pc} />} endpoint="experience" employeeId={employeeId}
        fields={[
          { name: 'companyName', label: 'Company Name', max: 255 }, 
          { name: 'designation', label: 'Designation', max: 100 },
          { name: 'fromDate', label: 'From Date', type: 'date' }, { name: 'toDate', label: 'To Date', type: 'date' },
          { name: 'totalExperience', label: 'Experience', max: 100 },
          { name: 'lastSalary', label: 'Salary', type: 'number' },
          { name: 'leavingReason', label: 'Reason For Leaving', max: 255 }
        ]}
        tableCols={[
          { id: 'companyName', label: 'Company', minWidth: 200 }, 
          { id: 'designation', label: 'Designation', minWidth: 150 }, 
          { id: 'fromDate', label: 'From', minWidth: 100 }, 
          { id: 'toDate', label: 'To', minWidth: 100 }
        ]}
      />

      {/* 14. FAMILY DETAILS */}
      <Section1toN title="Family Details" icon={<IconUsers size={20} color={pc} />} endpoint="dependent" employeeId={employeeId}
        fields={[
          { name: 'name', label: 'Name', max: 100 },
          { name: 'gender', label: 'Gender', select: true, options: ['MALE', 'FEMALE', 'OTHER'] },
          { name: 'dob', label: 'DOB', type: 'date' },
          { name: 'age', label: 'Age', type: 'number' },
          { name: 'relationship', label: 'Relationship', select: true, options: ['FATHER', 'MOTHER', 'SPOUSE', 'CHILD', 'SIBLING'] },
          { name: 'occupation', label: 'Occupation', max: 100 },
          { name: 'bloodGroup', label: 'Blood Group', select: true, options: ['O+ve', 'O-ve', 'A+ve', 'A-ve', 'B+ve', 'B-ve', 'AB+ve', 'AB-ve'] },
          { name: 'contactNo', label: 'Contract No', max: 20 }
        ]}
        tableCols={[
          { id: 'name', label: 'Name', minWidth: 150 }, 
          { id: 'relationship', label: 'Relation', minWidth: 100 }, 
          { id: 'contactNo', label: 'Contact', minWidth: 120 }
        ]}
      />

      {/* 15. OFFICE ASSETS */}
      <Section1toN title="Office Assets" icon={<IconDevices size={20} color={pc} />} endpoint="asset" employeeId={employeeId}
        fields={[
          { name: 'assetName', label: 'Asset Name', max: 100 },
          { name: 'issueDate', label: 'Asset Issue Date', type: 'date' },
          { name: 'condition', label: 'Condition of Asset', select: true, options: ['NEW', 'GOOD', 'USED', 'DAMAGED'] },
          { name: 'qty', label: 'QTY', type: 'number' },
          { name: 'serialNo', label: 'Serial No', max: 100 }
        ]}
        tableCols={[
          { id: 'assetName', label: 'Asset Name', minWidth: 150 }, 
          { id: 'issueDate', label: 'Asset Issue Date', minWidth: 100 }, 
          { id: 'serialNo', label: 'Serial No', minWidth: 150 }
        ]}
      />

    </Stack>
  );
}
