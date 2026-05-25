import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams, useNavigate, useParams } from 'react-router-dom';
import { Grid, Box, Button, Typography, Stack, MenuItem, useTheme, Tooltip, Autocomplete, TextField as MuiTextField, alpha } from '@mui/material';
import { IconUserPlus, IconDeviceFloppy, IconArrowLeft, IconTrash, IconEraser, IconUser, IconMapPin, IconBusinessplan, IconTruckDelivery } from '@tabler/icons-react';
import { useColorScheme } from '@mui/material/styles';
import MainCard from 'ui-component/cards/MainCard';
import {
  BOSFormSection,
  BOSTextField, BOSAutocomplete,
  btnSave,
  btnDelete,
  btnCancel,
  btnClear,
  BOSDocumentPreviewDialog,
  BOSFileUpload,
  formatBOSFiles
} from 'ui-component/bos';
import ConfirmDeleteDialog from 'ui-component/ConfirmDeleteDialog';
import { autoUploadFile } from 'utils/upload-helper';
import { IconFiles } from '@tabler/icons-react';
import useBOSValidation from 'hooks/useBOSValidation';
import useKeyboardShortcuts, { shortcutTooltip } from 'hooks/useKeyboardShortcuts';
import { useDispatch } from 'react-redux';
import { openSnackbar } from 'store/slices/snackbar';
import axios from 'utils/axios';
import { YES_NO_OPTIONS, STATUS_OPTIONS } from 'utils/constants';
import usePagePermissions, { PAGE_CODES } from 'hooks/usePagePermissions';

const INITIAL = {
  customerCode: '',
  gstin: '',
  customerName: '',
  customerPrintName: '',
  accountsLedger: '',
  groupName: '',
  shortName: '',
  address: '',
  city: '',
  state: '',
  stateCode: '',
  country: '',
  pincode: '',
  primeCustomer: 'No',
  panNo: '',
  website: '',
  registerNo: '',
  cinNo: '',
  isoNumber: '',
  isoExpiry: '',
  ndaRequired: 'No',
  currency: '',
  segment: '',
  subSegment: '',
  paymentTerms: '',
  deliveryTerms: '',
  freight: '',
  domainName: '',
  distance: '',
  location: '',
  ldApplicable: 'No',
  negotiateCustomer: 'No',
  dailyDispatchMail: 'No',
  status: 'Active',
  fileUpload: '',
  panFileInfo: '',
  createdBy: '',
  createdDate: '',
  updatedBy: '',
  updatedDate: ''
};

const RULES = [
  { field: 'customerName', label: 'Customer Name', required: true, maxLength: 200 }
];

// Shared field renderer using Grid for consistent layout
const R = ({ children, lg = 3, md = 4, sm = 6 }) => <Grid item xs={12} sm={sm} md={md} lg={lg}>{children}</Grid>;

export default function CustomerMaster() {
  const theme = useTheme();
  const { colorScheme } = useColorScheme();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const { id: pathId } = useParams();
  const customerId = pathId || searchParams.get('id');
  const perms = usePagePermissions(PAGE_CODES.CRM_CUSTOMER);
  const { errors, validate, clearErrors } = useBOSValidation();
  const [form, setForm] = useState(INITIAL);
  const [loading, setLoading] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState({ url: '', name: '', type: 'pdf' });
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [panFile, setPanFile] = useState([]);

  // Master Data
  const [deliveryTerms, setDeliveryTerms] = useState([]);
  const [paymentTerms, setPaymentTerms] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [segments, setSegments] = useState([]);
  const [subSegments, setSubSegments] = useState([]);
  const [countries, setCountries] = useState([]);
  const [allStates, setAllStates] = useState([]);

  const fetchMasterData = useCallback(async () => {
    try {
      const [dt, pt, cur, seg, sub, countryRes, stateRes] = await Promise.all([
        axios.get('/api/delivery-terms'),
        axios.get('/api/payment-terms'),
        axios.get('/api/currency'),
        axios.get('/api/sm/segments'),
        axios.get('/api/sm/sub-segments'),
        axios.get('/api/master/countries'),
        axios.get('/api/master/states')
      ]);
      setDeliveryTerms(dt.data.filter(t => t.status === 'Active'));
      setPaymentTerms(pt.data.filter(p => p.status === 'Active'));
      setCurrencies(cur.data.filter(c => c.status === 'Active'));
      setSegments(seg.data.filter(s => s.status === 'Active'));
      setSubSegments(sub.data.filter(s => s.status === 'Active'));
      setCountries(countryRes.data.filter(c => c.status === 'Active'));
      setAllStates(stateRes.data.filter(s => s.status === 'Active'));
    } catch (e) { console.error('Error fetching master data:', e); }
  }, []);

  const fetchCustomer = useCallback(async () => {
    if (!customerId) return;
    try {
      const { data } = await axios.get(`/api/sm/customers/${customerId}`);
      const d = { ...INITIAL };
      Object.keys(d).forEach((k) => { if (data[k] !== undefined && data[k] !== null) d[k] = data[k]; });
      if (d.isoExpiry && typeof d.isoExpiry === 'string') d.isoExpiry = d.isoExpiry.split('T')[0];
      setForm(d);
      setUploadedFiles(formatBOSFiles(data.fileUpload));
      setPanFile(formatBOSFiles(data.panFileInfo));
    } catch (e) { console.error(e); }
  }, [customerId]);

  const fetchNextCode = useCallback(async () => {
    if (customerId) return;
    try {
      const { data } = await axios.get('/api/sm/customers/next-code');
      setForm(p => ({ ...p, customerCode: data }));
    } catch (e) {
      console.error(e);
      const year = new Date().getFullYear().toString().slice(-2);
      setForm(p => ({ ...p, customerCode: `C-${year}-00001` }));
    }
  }, [customerId]);

  useEffect(() => {
    if (!customerId) {
      setPanFile([]);
      setUploadedFiles([]);
    }
  }, [customerId]);


  useEffect(() => {
    fetchMasterData();
    if (customerId) fetchCustomer();
    else fetchNextCode();
  }, [customerId, fetchCustomer, fetchNextCode, fetchMasterData]);

  const h = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    if (e.target.name === 'ndaRequired' && e.target.value === 'No') {
      setUploadedFiles([]);
    }
  };

  // Autocomplete Handlers
  const handleAC = (field) => (event, newValue) => {
    setForm(p => ({ ...p, [field]: newValue || '' }));
  };

  const handleCountryChange = (event, newValue) => {
    setForm(p => ({ ...p, country: newValue || '', state: '', stateCode: '' }));
  };

  const handleStateChange = (event, newValue) => {
    if (newValue) {
      const s = allStates.find(x => x.stateName === newValue);
      setForm(p => ({ 
        ...p, 
        state: newValue, 
        stateCode: s?.stateCode || '', 
        country: s?.countryName || p.country 
      }));
    } else {
      setForm(p => ({ ...p, state: '', stateCode: '' }));
    }
  };

  const handleSave = async () => {
    if (!validate(form, RULES)) return;

    if (form.ndaRequired === 'Yes' && uploadedFiles.length === 0) {
      dispatch(openSnackbar({ 
        open: true, 
        message: 'NDA document is required when "NDA Required" is set to Yes. Please upload the document in the Standard Attachments section.', 
        variant: 'alert', 
        alert: { variant: 'filled' }, 
        severity: 'error', 
        close: false 
      }));
      return;
    }

    setLoading(true);
    try {
      const uploadFile = async (f) => f.isServer ? f.name : await autoUploadFile(f.file, 'SALES_CUSTOMER');
      const finalFiles = await Promise.all(uploadedFiles.map(uploadFile));
      const panFilesResult = await Promise.all(panFile.map(uploadFile));
      
      const updatedForm = { 
        ...form, 
        fileUpload: finalFiles.join(','),
        panFileInfo: panFilesResult.join(',')
      };

      if (customerId) {
        await axios.put(`/api/sm/customers/${customerId}`, updatedForm);
        dispatch(openSnackbar({ open: true, message: 'Customer updated!', variant: 'alert', alert: { variant: 'filled' }, severity: 'success', close: false }));
      } else {
        const { data } = await axios.post('/api/sm/customers', updatedForm);
        dispatch(openSnackbar({ open: true, message: 'Customer created!', variant: 'alert', alert: { variant: 'filled' }, severity: 'success', close: false }));
        navigate(`/sm/customers/create?id=${data.id}`, { replace: true });
      }
    } catch (error) {
      const msg = error.response?.data?.message || error.response?.data || 'Failed to save customer.';
      dispatch(openSnackbar({ 
        open: true, 
        message: typeof msg === 'string' ? msg : 'Failed to save customer.', 
        variant: 'alert', 
        alert: { variant: 'filled' }, 
        severity: 'error', 
        close: false 
      }));
    } finally { setLoading(false); }
  };

  const handleDelete = async () => {
    setDeleteOpen(false);
    try {
      await axios.delete(`/api/sm/customers/${customerId}`);
      dispatch(openSnackbar({ open: true, message: 'Customer deleted!', variant: 'alert', alert: { variant: 'filled' }, severity: 'success', close: false }));
      navigate('/sm/customers');
    } catch (e) {
      dispatch(openSnackbar({ open: true, message: 'Failed to delete.', variant: 'alert', alert: { variant: 'filled' }, severity: 'error', close: false }));
    }
  };

  const handleClear = () => { setForm(INITIAL); clearErrors(); };

  useKeyboardShortcuts({ 'ctrl+s': handleSave, 'escape': () => navigate('/sm/customers') });

  const filteredStates = useMemo(() => {
    return form.country 
      ? allStates.filter(s => s.countryName === form.country)
      : allStates;
  }, [form.country, allStates]);

  const acSx = {
    width: '100%',
    '& .MuiOutlinedInput-root': {
      borderRadius: '12px',
      backgroundColor: theme.palette.mode === 'dark' ? theme.palette.dark[800] : theme.palette.grey[50],
      '&:hover': {
        backgroundColor: theme.palette.mode === 'dark' ? theme.palette.dark[700] : theme.palette.grey[100]
      }
    }
  };

  return (
    <MainCard
      title={<Stack direction="row" alignItems="center" spacing={1.5}><IconUserPlus size={24} /><Typography variant="h3">{customerId ? 'Edit Customer' : 'New Customer'}</Typography></Stack>}
      secondary={
        <Stack direction="row" spacing={1.5}>
          <Tooltip title="Back to List"><Button variant="contained" startIcon={<IconArrowLeft size={18} />} onClick={() => navigate('/sm/customers')} sx={btnCancel}>Back</Button></Tooltip>
          {customerId && perms.delete && <Tooltip title={shortcutTooltip('Delete', 'Ctrl + D')}><Button variant="contained" startIcon={<IconTrash size={18} />} onClick={() => setDeleteOpen(true)} sx={btnDelete}>Delete</Button></Tooltip>}
          {perms.write && <Tooltip title="Clear"><Button variant="contained" startIcon={<IconEraser size={18} />} onClick={handleClear} sx={btnClear}>Clear</Button></Tooltip>}
          {perms.write && <Tooltip title={shortcutTooltip('Save', 'Ctrl + S')}><span><Button variant="contained" startIcon={<IconDeviceFloppy size={18} />} onClick={handleSave} disabled={loading} sx={btnSave}>{loading ? 'Saving...' : 'Save'}</Button></span></Tooltip>}
        </Stack>
      }
    >
      <Stack spacing={3}>
        <BOSFormSection icon={<IconUser size={20} color={theme.palette.primary.main} />} title="Identity & Contact">
          <Grid container spacing={2.5}>
            <R><BOSTextField name="customerCode" label="Customer Code" value={form.customerCode} onChange={h} disabled inputProps={{ readOnly: true }} sx={{ '& .MuiInputBase-input': { fontWeight: 700, color: 'primary.main' } }} /></R>
            <R><BOSTextField disabled={!perms.write} name="gstin" label="GSTIN No" value={form.gstin} onChange={h} /></R>
            <R><BOSTextField disabled={!perms.write} name="customerName" label="Customer Name" value={form.customerName} onChange={h} required error={!!errors.customerName} helperText={errors.customerName} /></R>
            <R><BOSTextField disabled={!perms.write} name="customerPrintName" label="Customer Print Name" value={form.customerPrintName} onChange={h} /></R>
            <R><BOSTextField disabled={!perms.write} name="accountsLedger" label="Accounts Ledger" value={form.accountsLedger} onChange={h} /></R>
            <R><BOSTextField disabled={!perms.write} name="groupName" label="Group Name" value={form.groupName} onChange={h} /></R>
            <R><BOSTextField disabled={!perms.write} name="shortName" label="Short Name" value={form.shortName} onChange={h} /></R>
            <R lg={6}><BOSTextField disabled={!perms.write} name="website" label="Website" value={form.website} onChange={h} /></R>
            <R lg={6}><BOSTextField disabled={!perms.write} name="domainName" label="Domain Name" value={form.domainName} onChange={h} /></R>
          </Grid>
        </BOSFormSection>

        <BOSFormSection icon={<IconMapPin size={20} color={theme.palette.primary.main} />} title="Location Details">
          <Grid container spacing={3}>
            <Grid item xs={12} lg={6}>
              <BOSTextField disabled={!perms.write} fullWidth name="address" label="Address" value={form.address} onChange={h} multiline rows={5} placeholder="Enter detailed address..." />
            </Grid>
            <Grid item xs={12} lg={6}>
              <Grid container spacing={2}>
                <R lg={6} md={6}><BOSTextField disabled={!perms.write} fullWidth name="city" label="City" value={form.city} onChange={h} /></R>
                <R lg={6} md={6}><Autocomplete disabled={!perms.write} fullWidth value={form.country || null} onChange={handleCountryChange} options={countries.map(c => c.country)} renderInput={(params) => <BOSTextField disabled={!perms.write} {...params} label="Country" sx={acSx} />} /></R>
                <R lg={6} md={6}><Autocomplete disabled={!perms.write} fullWidth value={form.state || null} onChange={handleStateChange} options={filteredStates.map(s => s.stateName)} renderInput={(params) => <BOSTextField disabled={!perms.write} {...params} label="State Name" sx={acSx} />} noOptionsText={form.country ? 'No states found' : 'Select country first'} /></R>
                <R lg={6} md={6}><BOSTextField fullWidth name="stateCode" label="State Code" value={form.stateCode} onChange={h} disabled placeholder="Auto-filled" /></R>
                <R lg={6} md={6}><BOSTextField disabled={!perms.write} fullWidth name="pincode" label="Pin Code" value={form.pincode} onChange={h} /></R>
                <R lg={6} md={6}><BOSTextField disabled={!perms.write} fullWidth name="distance" label="Distance (KM)" value={form.distance} onChange={h} type="number" /></R>
                <Grid item xs={12}><BOSTextField disabled={!perms.write} fullWidth name="location" label="Location" value={form.location} onChange={h} placeholder="Google Maps link or landmarks" /></Grid>
              </Grid>
            </Grid>
          </Grid>
        </BOSFormSection>

        <BOSFormSection icon={<IconBusinessplan size={20} color={theme.palette.primary.main} />} title="Business & Compliance">
          <Grid container spacing={2.5}>
            <R>
              <BOSTextField disabled={!perms.write} name="primeCustomer" label="Prime Customer" value={form.primeCustomer} onChange={h} select>
                <MenuItem value="Yes">Yes</MenuItem>
                <MenuItem value="No">No</MenuItem>
              </BOSTextField>
            </R>
            <Grid item xs={12} sm={6} md={4} lg={3}>
              <Stack direction="row" spacing={1} alignItems="center">
                <BOSTextField disabled={!perms.write} name="panNo" label="PAN No" value={form.panNo} onChange={h} fullWidth />
                <BOSFileUpload disabled={!perms.write} files={panFile} onChange={setPanFile} module="SALES_CUSTOMER" label="PAN" compact multiple={false} />
              </Stack>
            </Grid>
            <R><BOSTextField disabled={!perms.write} name="registerNo" label="Register No" value={form.registerNo} onChange={h} /></R>
            <R><BOSTextField disabled={!perms.write} name="cinNo" label="CIN No" value={form.cinNo} onChange={h} /></R>
            <R><BOSTextField disabled={!perms.write} name="isoNumber" label="ISO No" value={form.isoNumber} onChange={h} /></R>
            <R><BOSTextField disabled={!perms.write} name="isoExpiry" label="ISO Expiry Date" value={form.isoExpiry} onChange={h} type="date" InputLabelProps={{ shrink: true }} /></R>
            <R>
              <BOSTextField disabled={!perms.write} name="ndaRequired" label="NDA Required" value={form.ndaRequired} onChange={h} select>
                <MenuItem value="Yes">Yes</MenuItem>
                <MenuItem value="No">No</MenuItem>
              </BOSTextField>
            </R>
            {form.ndaRequired === 'Yes' && (
              <Grid item xs={12} lg={6}>
                <Box sx={{ border: '1px dashed', borderColor: 'primary.main', borderRadius: 2, bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
                  <BOSFileUpload disabled={!perms.write}
                    files={uploadedFiles}
                    onChange={setUploadedFiles}
                    module="SALES_CUSTOMER"
                    label="Upload NDA Document"
                    compact
                    multiple={true}
                    helperText="Upload signed NDA agreement."
                  />
                </Box>
              </Grid>
            )}
          </Grid>
        </BOSFormSection>

        <BOSFormSection icon={<IconTruckDelivery size={20} color={theme.palette.primary.main} />} title="Terms & Logistics">
          <Grid container spacing={3}>
            <R lg={4} md={6}>
              <Autocomplete disabled={!perms.write} fullWidth value={form.currency || null} onChange={handleAC('currency')} options={currencies.map(c => c.currencyCode)} renderOption={(props, option) => { const { key, ...optionProps } = props; const c = currencies.find(x => x.currencyCode === option); return (<li key={key} {...optionProps}><Typography variant="body2"><b>{option}</b> - {c?.currencyName}</Typography></li>); }} renderInput={(params) => <BOSTextField disabled={!perms.write} {...params} label="Currency" sx={acSx} required />} />
            </R>
            <R lg={4} md={6}><Autocomplete disabled={!perms.write} fullWidth value={form.segment || null} onChange={handleAC('segment')} options={segments.map(s => s.segmentName)} renderInput={(params) => <BOSTextField disabled={!perms.write} {...params} label="Segment" sx={acSx} />} /></R>
            <R lg={4} md={6}><Autocomplete disabled={!perms.write} fullWidth value={form.subSegment || null} onChange={handleAC('subSegment')} options={subSegments.map(s => s.subSegmentName)} renderInput={(params) => <BOSTextField disabled={!perms.write} {...params} label="Sub Segment" sx={acSx} />} /></R>
            <R lg={4} md={6}><BOSTextField disabled={!perms.write} fullWidth name="freight" label="Freight" value={form.freight} onChange={h} /></R>
            
            <R lg={4} md={6}><Autocomplete disabled={!perms.write} fullWidth value={form.paymentTerms || null} onChange={handleAC('paymentTerms')} options={paymentTerms.map(p => p.termName)} renderInput={(params) => <BOSTextField disabled={!perms.write} {...params} label="Payment Terms" sx={acSx} />} /></R>
            <R lg={4} md={6}><Autocomplete disabled={!perms.write} fullWidth value={form.deliveryTerms || null} onChange={handleAC('deliveryTerms')} options={deliveryTerms.map(t => t.termName)} renderInput={(params) => <BOSTextField disabled={!perms.write} {...params} label="Delivery Terms" sx={acSx} />} /></R>
            
            <R lg={4} md={6}><BOSTextField disabled={!perms.write} fullWidth name="ldApplicable" label="LD Applicable" value={form.ldApplicable} onChange={h} select>{YES_NO_OPTIONS.map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}</BOSTextField></R>
            <R lg={4} md={6}><BOSTextField disabled={!perms.write} fullWidth name="negotiateCustomer" label="Is Negotiate Customer" value={form.negotiateCustomer} onChange={h} select>{YES_NO_OPTIONS.map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}</BOSTextField></R>
            <R lg={4} md={6}><BOSTextField disabled={!perms.write} fullWidth name="dailyDispatchMail" label="Daily Dispatch Mail Req?" value={form.dailyDispatchMail} onChange={h} select>{YES_NO_OPTIONS.map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}</BOSTextField></R>
            <R lg={4} md={6}><BOSAutocomplete disabled={!perms.write}
  label="Status"
  name="status"
  value={form.status}
  options={STATUS_OPTIONS}
  onChange={(val) => setForm(p => ({ ...p, status: val || 'Active' }))}
/></R>
          </Grid>
        </BOSFormSection>

        {customerId && (
          <BOSFormSection icon={<IconFiles size={20} color={theme.palette.primary.main} />} title="Audit Information">
            <Grid container spacing={2.5}>
              <R><BOSTextField label="Created By" value={form.createdBy} disabled /></R>
              <R><BOSTextField label="Created Date" value={form.createdDate} disabled /></R>
              <R><BOSTextField label="Updated By" value={form.updatedBy} disabled /></R>
              <R><BOSTextField label="Updated Date" value={form.updatedDate} disabled /></R>
            </Grid>
          </BOSFormSection>
        )}

        <BOSFormSection icon={<IconFiles size={22} color={theme.palette.primary.main} />} title="Standard Attachments">
          <BOSFileUpload disabled={!perms.write}
            files={uploadedFiles}
            onChange={setUploadedFiles}
            module="SALES_CUSTOMER"
            label="Upload Customer Documents"
            helperText="PDFs, Images, or Excel sheets"
          />
        </BOSFormSection>
      </Stack>


      <ConfirmDeleteDialog open={deleteOpen} onClose={() => setDeleteOpen(false)} onConfirm={handleDelete} title="Delete Customer" message="Are you sure you want to delete this customer?" itemName={form.customerName} />

      <BOSDocumentPreviewDialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        fileUrl={previewData.url}
        fileName={previewData.name}
        type={previewData.type}
        onDownload={() => window.open(previewData.url.replace('/view/', '/download/'), '_blank')}
      />
    </MainCard>
  );
}
