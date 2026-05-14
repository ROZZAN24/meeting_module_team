import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Grid, Box, Button, Typography, Stack, MenuItem, useTheme, Tooltip } from '@mui/material';
import { IconUserPlus, IconDeviceFloppy, IconArrowLeft, IconTrash, IconEraser, IconUser, IconMapPin, IconBusinessplan, IconTruckDelivery } from '@tabler/icons-react';
import { useColorScheme } from '@mui/material/styles';
import MainCard from 'ui-component/cards/MainCard';
import { 
  BOSFormSection, 
  BOSTextField, 
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
import axios from 'axios';
import { STATES_INDIA, COUNTRIES, YES_NO_OPTIONS, STATUS_OPTIONS } from 'utils/constants';

const INITIAL = {
  customerCode: '',
  gstin: '',
  customerName: '',
  accountsLedger: '',
  groupName: '',
  shortName: '',
  address: '',
  city: '',
  state: '',
  stateCode: '',
  country: 'India',
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
  status: 'Active',
  fileUpload: ''
};

const RULES = [
  { field: 'customerName', label: 'Customer Name', required: true, maxLength: 200 }
];

// Shared field renderer using Grid for consistent layout - standardized to 4 columns for even spacing
const R = ({ children, lg = 3 }) => <Grid item xs={12} sm={6} md={4} lg={lg}>{children}</Grid>;

export default function CustomerMaster() {
  const theme = useTheme();
  const { colorScheme } = useColorScheme();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const customerId = searchParams.get('id');
  const { errors, validate, clearErrors } = useBOSValidation();
  const [form, setForm] = useState(INITIAL);
  const [loading, setLoading] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState({ url: '', name: '', type: 'pdf' });
  const [uploadedFiles, setUploadedFiles] = useState([]);

  // Master Data
  const [deliveryTerms, setDeliveryTerms] = useState([]);
  const [paymentTerms, setPaymentTerms] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [segments, setSegments] = useState([]);
  const [subSegments, setSubSegments] = useState([]);

  const fetchMasterData = useCallback(async () => {
    try {
      const [dt, pt, cur, seg, sub] = await Promise.all([
        axios.get('/api/delivery-terms'),
        axios.get('/api/payment-terms'),
        axios.get('/api/currency'),
        axios.get('/api/sm/segments'),
        axios.get('/api/sm/sub-segments')
      ]);
      setDeliveryTerms(dt.data);
      setPaymentTerms(pt.data);
      setCurrencies(cur.data);
      setSegments(seg.data);
      setSubSegments(sub.data);
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
    } catch (e) { console.error(e); }
  }, [customerId]);

  const fetchNextCode = useCallback(async () => {
    if (customerId) return;
    try {
      const { data } = await axios.get('/api/sm/customers/next-code');
      setForm(p => ({ ...p, customerCode: data }));
    } catch (e) { 
      console.error(e);
      // Fallback in case of error
      const year = new Date().getFullYear().toString().slice(-2);
      setForm(p => ({ ...p, customerCode: `C-${year}-00001` }));
    }
  }, [customerId]);


  useEffect(() => { 
    fetchMasterData();
    if (customerId) fetchCustomer(); 
    else fetchNextCode();
  }, [customerId, fetchCustomer, fetchNextCode, fetchMasterData]);

  const h = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const h = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSave = async () => {
    if (!validate(form, RULES)) return;
    setLoading(true);
    try {
      // Handle file uploads
      const uploadFile = async (f) => f.isServer ? f.name : await autoUploadFile(f.file, 'SALES_CUSTOMER');
      const finalFiles = await Promise.all(uploadedFiles.map(uploadFile));
      const updatedForm = { ...form, fileUpload: finalFiles.join(',') };

      if (customerId) {
        await axios.put(`/api/sm/customers/${customerId}`, updatedForm);
        dispatch(openSnackbar({ open: true, message: 'Customer updated!', variant: 'alert', alert: { variant: 'filled' }, severity: 'success', close: false }));
      } else {
        const { data } = await axios.post('/api/sm/customers', updatedForm);
        dispatch(openSnackbar({ open: true, message: 'Customer created!', variant: 'alert', alert: { variant: 'filled' }, severity: 'success', close: false }));
        navigate(`/sm/customers/create?id=${data.id}`, { replace: true });
      }
    } catch (e) {
      dispatch(openSnackbar({ open: true, message: 'Failed to save customer.', variant: 'alert', alert: { variant: 'filled' }, severity: 'error', close: false }));
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
            <R><BOSTextField name="accountsLedger" label="Accounts Ledger" value={form.accountsLedger} onChange={h} /></R>
            <R><BOSTextField name="groupName" label="Group Name" value={form.groupName} onChange={h} /></R>
            <R><BOSTextField name="shortName" label="Short Name" value={form.shortName} onChange={h} /></R>
            <R lg={6}><BOSTextField name="website" label="Website" value={form.website} onChange={h} /></R>
            <R lg={6}><BOSTextField name="domainName" label="Domain Name" value={form.domainName} onChange={h} /></R>
          </Grid>
        </BOSFormSection>

        <BOSFormSection icon={<IconMapPin size={20} color={theme.palette.primary.main} />} title="Location Details">
          <Grid container spacing={2.5}>
            <Grid item xs={12}><BOSTextField name="address" label="Address" value={form.address} onChange={h} multiline rows={4} /></Grid>
            <R><BOSTextField name="city" label="City" value={form.city} onChange={h} /></R>
            <R><BOSTextField name="state" label="State" value={form.state} onChange={h} select>
                <MenuItem value="">-Select-</MenuItem>
                {STATES_INDIA.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
              </BOSTextField>
            </R>
            <R><BOSTextField name="stateCode" label="State Code" value={form.stateCode} onChange={h} /></R>
            <R><BOSTextField name="country" label="Country" value={form.country} onChange={h} select>
                {COUNTRIES.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
              </BOSTextField>
            </R>
            <R><BOSTextField name="pincode" label="Pin Code" value={form.pincode} onChange={h} /></R>
            <R><BOSTextField name="distance" label="Distance (KM)" value={form.distance} onChange={h} type="number" /></R>
            <R><BOSTextField name="location" label="Location" value={form.location} onChange={h} /></R>
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
            <R><BOSTextField name="panNo" label="PAN No" value={form.panNo} onChange={h} /></R>
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
          </Grid>
        </BOSFormSection>

        <BOSFormSection icon={<IconTruckDelivery size={20} color={theme.palette.primary.main} />} title="Terms & Logistics">
          <Grid container spacing={2.5}>
            <R>
              <BOSTextField name="currency" label="Currency" value={form.currency} onChange={h} select required>
                <MenuItem value="">-Select-</MenuItem>
                {currencies.filter(c => c.status === 'Active').map(c => (
                  <MenuItem key={c.id} value={c.currencyCode}>{c.currencyCode} - {c.currencyName}</MenuItem>
                ))}
              </BOSTextField>
            </R>
            <R>
              <BOSTextField name="segment" label="Segment" value={form.segment} onChange={h} select>
                <MenuItem value="">-Select-</MenuItem>
                {segments.map(s => <MenuItem key={s.id} value={s.segmentName}>{s.segmentName}</MenuItem>)}
              </BOSTextField>
            </R>
            <R>
              <BOSTextField name="subSegment" label="Sub Segment" value={form.subSegment} onChange={h} select>
                <MenuItem value="">-Select-</MenuItem>
                {subSegments.map(s => <MenuItem key={s.id} value={s.subSegmentName}>{s.subSegmentName}</MenuItem>)}
              </BOSTextField>
            </R>
            <R>
              <BOSTextField name="paymentTerms" label="Payment Terms" value={form.paymentTerms} onChange={h} select>
                <MenuItem value="">-Select-</MenuItem>
                {paymentTerms.filter(p => p.status === 'Active').map(p => <MenuItem key={p.id} value={p.termName}>{p.termName}</MenuItem>)}
              </BOSTextField>
            </R>
            <R>
              <BOSTextField name="deliveryTerms" label="Delivery Terms" value={form.deliveryTerms} onChange={h} select>
                <MenuItem value="">-Select-</MenuItem>
                {deliveryTerms.filter(t => t.status === 'Active').map(t => <MenuItem key={t.id} value={t.termName}>{t.termName}</MenuItem>)}
              </BOSTextField>
            </R>
            <R><BOSTextField name="freight" label="Freight" value={form.freight} onChange={h} /></R>
            <R>
              <BOSTextField name="ldApplicable" label="LD Applicable" value={form.ldApplicable} onChange={h} select>
                {YES_NO_OPTIONS.map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}
              </BOSTextField>
            </R>
            <R>
              <BOSTextField name="negotiateCustomer" label="Is Negotiate Customer" value={form.negotiateCustomer} onChange={h} select>
                {YES_NO_OPTIONS.map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}
              </BOSTextField>
            </R>
            <R>
              <BOSTextField name="status" label="Status" value={form.status} onChange={h} select>
                {STATUS_OPTIONS.map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}
              </BOSTextField>
            </R>
          </Grid>
        </BOSFormSection>

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
    </MainCard>
  );
}
