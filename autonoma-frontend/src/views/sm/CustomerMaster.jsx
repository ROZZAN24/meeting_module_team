<<<<<<< HEAD
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
=======
import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Grid, Box, Button, Typography, Stack, MenuItem, useTheme, Tooltip } from '@mui/material';
import { IconUserPlus, IconDeviceFloppy, IconArrowLeft, IconTrash, IconEraser, IconUser, IconMapPin, IconBusinessplan, IconTruckDelivery } from '@tabler/icons-react';
import { useColorScheme } from '@mui/material/styles';
import MainCard from 'ui-component/cards/MainCard';
import { BOSFormSection, BOSTextField, btnSave, btnDelete, btnCancel, btnClear } from 'ui-component/bos';
import ConfirmDeleteDialog from 'ui-component/ConfirmDeleteDialog';
>>>>>>> origin/chore/repo-cleanup
import useBOSValidation from 'hooks/useBOSValidation';
import useKeyboardShortcuts, { shortcutTooltip } from 'hooks/useKeyboardShortcuts';
import { useDispatch } from 'react-redux';
import { openSnackbar } from 'store/slices/snackbar';
import axios from 'utils/axios';
<<<<<<< HEAD
import { YES_NO_OPTIONS, STATUS_OPTIONS } from 'utils/constants';
=======
>>>>>>> origin/chore/repo-cleanup

const INITIAL = {
  customerCode: '',
  gstin: '',
  customerName: '',
<<<<<<< HEAD
  customerPrintName: '',
=======
>>>>>>> origin/chore/repo-cleanup
  accountsLedger: '',
  groupName: '',
  shortName: '',
  address: '',
  city: '',
  state: '',
  stateCode: '',
<<<<<<< HEAD
  country: '',
=======
  country: 'India',
>>>>>>> origin/chore/repo-cleanup
  pincode: '',
  primeCustomer: 'No',
  panNo: '',
  website: '',
  registerNo: '',
  cinNo: '',
  isoNumber: '',
  isoExpiry: '',
  ndaRequired: 'No',
<<<<<<< HEAD
  currency: '',
  segment: '',
  subSegment: '',
  paymentTerms: '',
  deliveryTerms: '',
=======
  currency: 'INR',
  segment: '',
  subSegment: '',
  paymentTerms: 'Immediate',
  deliveryTerms: '-Select-',
>>>>>>> origin/chore/repo-cleanup
  freight: '',
  domainName: '',
  distance: '',
  location: '',
  ldApplicable: 'No',
  negotiateCustomer: 'No',
<<<<<<< HEAD
  dailyDispatchMail: 'No',
  status: 'Active',
  fileUpload: '',
  panFileInfo: '',
  createdBy: '',
  createdDate: '',
  updatedBy: '',
  updatedDate: ''
=======
  status: 'Active'
>>>>>>> origin/chore/repo-cleanup
};

const RULES = [
  { field: 'customerName', label: 'Customer Name', required: true, maxLength: 200 }
];

<<<<<<< HEAD
// Shared field renderer using Grid for consistent layout
const R = ({ children, lg = 3, md = 4, sm = 6 }) => <Grid item xs={12} sm={sm} md={md} lg={lg}>{children}</Grid>;
=======
// Shared field renderer using Grid for consistent layout - standardized to 4 columns for even spacing
const R = ({ children, lg = 3 }) => <Grid item xs={12} sm={6} md={4} lg={lg}>{children}</Grid>;
>>>>>>> origin/chore/repo-cleanup

export default function CustomerMaster() {
  const theme = useTheme();
  const { colorScheme } = useColorScheme();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
<<<<<<< HEAD
  const { id: pathId } = useParams();
  const customerId = pathId || searchParams.get('id');
=======
  const customerId = searchParams.get('id');
>>>>>>> origin/chore/repo-cleanup
  const { errors, validate, clearErrors } = useBOSValidation();
  const [form, setForm] = useState(INITIAL);
  const [loading, setLoading] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
<<<<<<< HEAD
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
=======
>>>>>>> origin/chore/repo-cleanup

  const fetchCustomer = useCallback(async () => {
    if (!customerId) return;
    try {
      const { data } = await axios.get(`/api/sm/customers/${customerId}`);
      const d = { ...INITIAL };
      Object.keys(d).forEach((k) => { if (data[k] !== undefined && data[k] !== null) d[k] = data[k]; });
      if (d.isoExpiry && typeof d.isoExpiry === 'string') d.isoExpiry = d.isoExpiry.split('T')[0];
      setForm(d);
<<<<<<< HEAD
      setUploadedFiles(formatBOSFiles(data.fileUpload));
      setPanFile(formatBOSFiles(data.panFileInfo));
=======
>>>>>>> origin/chore/repo-cleanup
    } catch (e) { console.error(e); }
  }, [customerId]);

  const fetchNextCode = useCallback(async () => {
    if (customerId) return;
    try {
      const { data } = await axios.get('/api/sm/customers/next-code');
      setForm(p => ({ ...p, customerCode: data }));
<<<<<<< HEAD
    } catch (e) {
      console.error(e);
=======
    } catch (e) { 
      console.error(e);
      // Fallback in case of error
>>>>>>> origin/chore/repo-cleanup
      const year = new Date().getFullYear().toString().slice(-2);
      setForm(p => ({ ...p, customerCode: `C-${year}-00001` }));
    }
  }, [customerId]);

<<<<<<< HEAD
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
=======

  useEffect(() => { 
    if (customerId) fetchCustomer(); 
    else fetchNextCode();
  }, [customerId, fetchCustomer, fetchNextCode]);

  const h = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSave = async () => {
    if (!validate(form, RULES)) return;
    setLoading(true);
    try {
      if (customerId) {
        await axios.put(`/api/sm/customers/${customerId}`, form);
        dispatch(openSnackbar({ open: true, message: 'Customer updated!', variant: 'alert', alert: { variant: 'filled' }, severity: 'success', close: false }));
      } else {
        const { data } = await axios.post('/api/sm/customers', form);
        dispatch(openSnackbar({ open: true, message: 'Customer created!', variant: 'alert', alert: { variant: 'filled' }, severity: 'success', close: false }));
        navigate(`/sm/customers/create?id=${data.id}`, { replace: true });
      }
    } catch (e) {
      dispatch(openSnackbar({ open: true, message: 'Failed to save customer.', variant: 'alert', alert: { variant: 'filled' }, severity: 'error', close: false }));
>>>>>>> origin/chore/repo-cleanup
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

<<<<<<< HEAD
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

=======
>>>>>>> origin/chore/repo-cleanup
  return (
    <MainCard
      title={<Stack direction="row" alignItems="center" spacing={1.5}><IconUserPlus size={24} /><Typography variant="h3">{customerId ? 'Edit Customer' : 'New Customer'}</Typography></Stack>}
      secondary={
        <Stack direction="row" spacing={1.5}>
          <Tooltip title="Back to List"><Button variant="contained" startIcon={<IconArrowLeft size={18} />} onClick={() => navigate('/sm/customers')} sx={btnCancel}>Back</Button></Tooltip>
          {customerId && <Tooltip title={shortcutTooltip('Delete', 'Ctrl + D')}><Button variant="contained" startIcon={<IconTrash size={18} />} onClick={() => setDeleteOpen(true)} sx={btnDelete}>Delete</Button></Tooltip>}
          <Tooltip title="Clear"><Button variant="contained" startIcon={<IconEraser size={18} />} onClick={handleClear} sx={btnClear}>Clear</Button></Tooltip>
          <Tooltip title={shortcutTooltip('Save', 'Ctrl + S')}><span><Button variant="contained" startIcon={<IconDeviceFloppy size={18} />} onClick={handleSave} disabled={loading} sx={btnSave}>{loading ? 'Saving...' : 'Save'}</Button></span></Tooltip>
        </Stack>
      }
    >
      <Stack spacing={3}>
        <BOSFormSection icon={<IconUser size={20} color={theme.palette.primary.main} />} title="Identity & Contact">
          <Grid container spacing={2.5}>
            <R><BOSTextField name="customerCode" label="Customer Code" value={form.customerCode} onChange={h} disabled inputProps={{ readOnly: true }} sx={{ '& .MuiInputBase-input': { fontWeight: 700, color: 'primary.main' } }} /></R>
            <R><BOSTextField name="gstin" label="GSTIN No" value={form.gstin} onChange={h} /></R>
            <R><BOSTextField name="customerName" label="Customer Name" value={form.customerName} onChange={h} required error={!!errors.customerName} helperText={errors.customerName} /></R>
<<<<<<< HEAD
            <R><BOSTextField name="customerPrintName" label="Customer Print Name" value={form.customerPrintName} onChange={h} /></R>
=======
>>>>>>> origin/chore/repo-cleanup
            <R><BOSTextField name="accountsLedger" label="Accounts Ledger" value={form.accountsLedger} onChange={h} /></R>
            <R><BOSTextField name="groupName" label="Group Name" value={form.groupName} onChange={h} /></R>
            <R><BOSTextField name="shortName" label="Short Name" value={form.shortName} onChange={h} /></R>
            <R lg={6}><BOSTextField name="website" label="Website" value={form.website} onChange={h} /></R>
            <R lg={6}><BOSTextField name="domainName" label="Domain Name" value={form.domainName} onChange={h} /></R>
          </Grid>
        </BOSFormSection>

        <BOSFormSection icon={<IconMapPin size={20} color={theme.palette.primary.main} />} title="Location Details">
<<<<<<< HEAD
          <Grid container spacing={3}>
            <Grid item xs={12} lg={6}>
              <BOSTextField fullWidth name="address" label="Address" value={form.address} onChange={h} multiline rows={5} placeholder="Enter detailed address..." />
            </Grid>
            <Grid item xs={12} lg={6}>
              <Grid container spacing={2}>
                <R lg={6} md={6}><BOSTextField fullWidth name="city" label="City" value={form.city} onChange={h} /></R>
                <R lg={6} md={6}><Autocomplete fullWidth value={form.country || null} onChange={handleCountryChange} options={countries.map(c => c.country)} renderInput={(params) => <BOSTextField {...params} label="Country" sx={acSx} />} /></R>
                <R lg={6} md={6}><Autocomplete fullWidth value={form.state || null} onChange={handleStateChange} options={filteredStates.map(s => s.stateName)} renderInput={(params) => <BOSTextField {...params} label="State Name" sx={acSx} />} noOptionsText={form.country ? 'No states found' : 'Select country first'} /></R>
                <R lg={6} md={6}><BOSTextField fullWidth name="stateCode" label="State Code" value={form.stateCode} onChange={h} disabled placeholder="Auto-filled" /></R>
                <R lg={6} md={6}><BOSTextField fullWidth name="pincode" label="Pin Code" value={form.pincode} onChange={h} /></R>
                <R lg={6} md={6}><BOSTextField fullWidth name="distance" label="Distance (KM)" value={form.distance} onChange={h} type="number" /></R>
                <Grid item xs={12}><BOSTextField fullWidth name="location" label="Location" value={form.location} onChange={h} placeholder="Google Maps link or landmarks" /></Grid>
              </Grid>
            </Grid>
=======
          <Grid container spacing={2.5}>
            <R lg={6}><BOSTextField name="address" label="Address" value={form.address} onChange={h} multiline rows={2} /></R>
            <R><BOSTextField name="city" label="City" value={form.city} onChange={h} /></R>
            <R><BOSTextField name="state" label="State" value={form.state} onChange={h} /></R>
            <R><BOSTextField name="stateCode" label="State Code" value={form.stateCode} onChange={h} /></R>
            <R><BOSTextField name="country" label="Country" value={form.country} onChange={h} /></R>
            <R><BOSTextField name="pincode" label="Pin Code" value={form.pincode} onChange={h} /></R>
            <R><BOSTextField name="distance" label="Distance (KM)" value={form.distance} onChange={h} type="number" /></R>
            <R><BOSTextField name="location" label="Location" value={form.location} onChange={h} /></R>
>>>>>>> origin/chore/repo-cleanup
          </Grid>
        </BOSFormSection>

        <BOSFormSection icon={<IconBusinessplan size={20} color={theme.palette.primary.main} />} title="Business & Compliance">
          <Grid container spacing={2.5}>
            <R>
              <BOSTextField name="primeCustomer" label="Prime Customer" value={form.primeCustomer} onChange={h} select>
                <MenuItem value="Yes">Yes</MenuItem>
                <MenuItem value="No">No</MenuItem>
              </BOSTextField>
            </R>
<<<<<<< HEAD
            <Grid item xs={12} sm={6} md={4} lg={3}>
              <Stack direction="row" spacing={1} alignItems="center">
                <BOSTextField name="panNo" label="PAN No" value={form.panNo} onChange={h} fullWidth />
                <BOSFileUpload files={panFile} onChange={setPanFile} module="SALES_CUSTOMER" label="PAN" compact multiple={false} />
              </Stack>
            </Grid>
=======
            <R><BOSTextField name="panNo" label="PAN No" value={form.panNo} onChange={h} /></R>
>>>>>>> origin/chore/repo-cleanup
            <R><BOSTextField name="registerNo" label="Register No" value={form.registerNo} onChange={h} /></R>
            <R><BOSTextField name="cinNo" label="CIN No" value={form.cinNo} onChange={h} /></R>
            <R><BOSTextField name="isoNumber" label="ISO No" value={form.isoNumber} onChange={h} /></R>
            <R><BOSTextField name="isoExpiry" label="ISO Expiry Date" value={form.isoExpiry} onChange={h} type="date" InputLabelProps={{ shrink: true }} /></R>
            <R>
              <BOSTextField name="ndaRequired" label="NDA Required" value={form.ndaRequired} onChange={h} select>
                <MenuItem value="Yes">Yes</MenuItem>
                <MenuItem value="No">No</MenuItem>
              </BOSTextField>
            </R>
<<<<<<< HEAD
            {form.ndaRequired === 'Yes' && (
              <Grid item xs={12} lg={6}>
                <Box sx={{ border: '1px dashed', borderColor: 'primary.main', borderRadius: 2, bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
                  <BOSFileUpload
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
=======
>>>>>>> origin/chore/repo-cleanup
          </Grid>
        </BOSFormSection>

        <BOSFormSection icon={<IconTruckDelivery size={20} color={theme.palette.primary.main} />} title="Terms & Logistics">
<<<<<<< HEAD
          <Grid container spacing={3}>
            <R lg={4} md={6}>
              <Autocomplete fullWidth value={form.currency || null} onChange={handleAC('currency')} options={currencies.map(c => c.currencyCode)} renderOption={(props, option) => { const { key, ...optionProps } = props; const c = currencies.find(x => x.currencyCode === option); return (<li key={key} {...optionProps}><Typography variant="body2"><b>{option}</b> - {c?.currencyName}</Typography></li>); }} renderInput={(params) => <BOSTextField {...params} label="Currency" sx={acSx} required />} />
            </R>
            <R lg={4} md={6}><Autocomplete fullWidth value={form.segment || null} onChange={handleAC('segment')} options={segments.map(s => s.segmentName)} renderInput={(params) => <BOSTextField {...params} label="Segment" sx={acSx} />} /></R>
            <R lg={4} md={6}><Autocomplete fullWidth value={form.subSegment || null} onChange={handleAC('subSegment')} options={subSegments.map(s => s.subSegmentName)} renderInput={(params) => <BOSTextField {...params} label="Sub Segment" sx={acSx} />} /></R>
            <R lg={4} md={6}><BOSTextField fullWidth name="freight" label="Freight" value={form.freight} onChange={h} /></R>
            
            <R lg={4} md={6}><Autocomplete fullWidth value={form.paymentTerms || null} onChange={handleAC('paymentTerms')} options={paymentTerms.map(p => p.termName)} renderInput={(params) => <BOSTextField {...params} label="Payment Terms" sx={acSx} />} /></R>
            <R lg={4} md={6}><Autocomplete fullWidth value={form.deliveryTerms || null} onChange={handleAC('deliveryTerms')} options={deliveryTerms.map(t => t.termName)} renderInput={(params) => <BOSTextField {...params} label="Delivery Terms" sx={acSx} />} /></R>
            
            <R lg={4} md={6}><BOSTextField fullWidth name="ldApplicable" label="LD Applicable" value={form.ldApplicable} onChange={h} select>{YES_NO_OPTIONS.map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}</BOSTextField></R>
            <R lg={4} md={6}><BOSTextField fullWidth name="negotiateCustomer" label="Is Negotiate Customer" value={form.negotiateCustomer} onChange={h} select>{YES_NO_OPTIONS.map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}</BOSTextField></R>
            <R lg={4} md={6}><BOSTextField fullWidth name="dailyDispatchMail" label="Daily Dispatch Mail Req?" value={form.dailyDispatchMail} onChange={h} select>{YES_NO_OPTIONS.map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}</BOSTextField></R>
            <R lg={4} md={6}><BOSAutocomplete
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
          <BOSFileUpload
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
=======
          <Grid container spacing={2.5}>
            <R>
              <BOSTextField name="currency" label="Currency" value={form.currency} onChange={h} select required>
                <MenuItem value="INR">INR</MenuItem>
                <MenuItem value="USD">USD</MenuItem>
                <MenuItem value="EUR">EUR</MenuItem>
              </BOSTextField>
            </R>
            <R><BOSTextField name="segment" label="Segment" value={form.segment} onChange={h} /></R>
            <R><BOSTextField name="subSegment" label="Sub Segment" value={form.subSegment} onChange={h} /></R>
            <R><BOSTextField name="paymentTerms" label="Payment Terms" value={form.paymentTerms} onChange={h} /></R>
            <R><BOSTextField name="deliveryTerms" label="Delivery Terms" value={form.deliveryTerms} onChange={h} /></R>
            <R><BOSTextField name="freight" label="Freight" value={form.freight} onChange={h} /></R>
            <R>
              <BOSTextField name="ldApplicable" label="LD Applicable" value={form.ldApplicable} onChange={h} select>
                <MenuItem value="Yes">Yes</MenuItem>
                <MenuItem value="No">No</MenuItem>
              </BOSTextField>
            </R>
            <R>
              <BOSTextField name="negotiateCustomer" label="Is Negotiate Customer" value={form.negotiateCustomer} onChange={h} select>
                <MenuItem value="Yes">Yes</MenuItem>
                <MenuItem value="No">No</MenuItem>
              </BOSTextField>
            </R>
            <R>
              <BOSTextField name="status" label="Status" value={form.status} onChange={h} select>
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="Inactive">Inactive</MenuItem>
              </BOSTextField>
            </R>
          </Grid>
        </BOSFormSection>
      </Stack>

      <ConfirmDeleteDialog open={deleteOpen} onClose={() => setDeleteOpen(false)} onConfirm={handleDelete} title="Delete Customer" message="Are you sure you want to delete this customer?" itemName={form.customerName} />
>>>>>>> origin/chore/repo-cleanup
    </MainCard>
  );
}
