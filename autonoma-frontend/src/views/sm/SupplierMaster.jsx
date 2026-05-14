import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Grid, Box, Button, Typography, Stack, MenuItem, useTheme, Tooltip, IconButton } from '@mui/material';
import { 
  IconUserPlus, IconDeviceFloppy, IconArrowLeft, IconTrash, IconEraser, 
  IconUser, IconMapPin, IconBusinessplan, IconBuildingBank, IconTruckDelivery, 
  IconPlus, IconCloudUpload, IconFileCheck, IconX, IconFiles
} from '@tabler/icons-react';
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
import useBOSValidation from 'hooks/useBOSValidation';
import useKeyboardShortcuts, { shortcutTooltip } from 'hooks/useKeyboardShortcuts';
import { useDispatch } from 'react-redux';
import { openSnackbar } from 'store/slices/snackbar';
import axios from 'axios';
import { STATES_INDIA, COUNTRIES, YES_NO_OPTIONS, STATUS_OPTIONS } from 'utils/constants';

const INITIAL = {
  supplierCode: '',
  gstNo: '',
  supplierName: '',
  ledgerName: '',
  shortName: '',
  supplierPrintName: '',
  address: '',
  city: '',
  state: '',
  country: 'India',
  pincode: '',
  mobileNo: '',
  contactPerson: '',
  emailId: '',
  website: '',
  panNo: '',
  msmeNo: '',
  isoNo: '',
  isoExpiryDate: '',
  approvedSupplier: 'No',
  ndaRequired: 'No',
  deliveryTerms: '',
  typeOfService: '',
  paymentTerms: '',
  primeSupplier: 'No',
  freightRequired: 'No',
  currency: 'INR',
  dueDays: '',
  isAuditorConsultant: 'No',
  accountNo: '',
  accountName: '',
  bankName: '',
  branchName: '',
  ifscCode: '',
  swiftCode: '',
  accountType: '',
  status: 'Active',
  uploadFiles: ''
};

const RULES = [
  { field: 'supplierName', label: 'Supplier Name', required: true, maxLength: 200 }
];

const R = ({ children, lg = 3 }) => <Grid item xs={12} sm={6} md={4} lg={lg}>{children}</Grid>;

export default function SupplierMaster() {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const supplierId = searchParams.get('id');
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
  const [typesOfService, setTypesOfService] = useState([]);
  const [currencies, setCurrencies] = useState([]);

  const fetchMasterData = useCallback(async () => {
    try {
      const [dt, pt, ts, cur] = await Promise.all([
        axios.get('/api/delivery-terms'),
        axios.get('/api/payment-terms'),
        axios.get('/api/type-of-service'),
        axios.get('/api/currency')
      ]);
      setDeliveryTerms(dt.data);
      setPaymentTerms(pt.data);
      setTypesOfService(ts.data);
      setCurrencies(cur.data);
    } catch (e) { console.error('Error fetching master data:', e); }
  }, []);

  const fetchSupplier = useCallback(async () => {
    if (!supplierId) return;
    try {
      const { data } = await axios.get(`/api/sm/suppliers/${supplierId}`);
      const d = { ...INITIAL };
      Object.keys(d).forEach((k) => { if (data[k] !== undefined && data[k] !== null) d[k] = data[k]; });
      if (d.isoExpiryDate && typeof d.isoExpiryDate === 'string') d.isoExpiryDate = d.isoExpiryDate.split('T')[0];
      setForm(d);
      setUploadedFiles(formatBOSFiles(data.uploadFiles));
    } catch (e) { console.error(e); }
  }, [supplierId]);

  const fetchNextCode = useCallback(async () => {
    if (supplierId) return;
    try {
      const { data } = await axios.get('/api/sm/suppliers/next-code');
      setForm(p => ({ ...p, supplierCode: data }));
    } catch (e) { 
      console.error(e);
      const year = new Date().getFullYear().toString().slice(-2);
      setForm(p => ({ ...p, supplierCode: `S-${year}-00001` }));
    }
  }, [supplierId]);

  useEffect(() => { 
    fetchMasterData();
    if (supplierId) fetchSupplier(); 
    else fetchNextCode();
  }, [supplierId, fetchSupplier, fetchNextCode, fetchMasterData]);

  const h = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSave = async () => {
    if (!validate(form, RULES)) return;
    setLoading(true);
    try {
      // Handle file uploads
      const uploadFile = async (f) => f.isServer ? f.name : await autoUploadFile(f.file, 'SALES_SUPPLIER');
      const finalFiles = await Promise.all(uploadedFiles.map(uploadFile));
      const updatedForm = { ...form, uploadFiles: finalFiles.join(',') };

      if (supplierId) {
        await axios.put(`/api/sm/suppliers/${supplierId}`, updatedForm);
        dispatch(openSnackbar({ open: true, message: 'Supplier updated!', variant: 'alert', alert: { variant: 'filled' }, severity: 'success', close: false }));
      } else {
        const { data } = await axios.post('/api/sm/suppliers', updatedForm);
        dispatch(openSnackbar({ open: true, message: 'Supplier created!', variant: 'alert', alert: { variant: 'filled' }, severity: 'success', close: false }));
        navigate(`/sm/suppliers/create?id=${data.id}`, { replace: true });
      }
    } catch (e) {
      dispatch(openSnackbar({ open: true, message: 'Failed to save supplier.', variant: 'alert', alert: { variant: 'filled' }, severity: 'error', close: false }));
    } finally { setLoading(false); }
  };

  const handleDelete = async () => {
    setDeleteOpen(false);
    try {
      await axios.delete(`/api/sm/suppliers/${supplierId}`);
      dispatch(openSnackbar({ open: true, message: 'Supplier deleted!', variant: 'alert', alert: { variant: 'filled' }, severity: 'success', close: false }));
      navigate('/sm/suppliers');
    } catch (e) {
      dispatch(openSnackbar({ open: true, message: 'Failed to delete.', variant: 'alert', alert: { variant: 'filled' }, severity: 'error', close: false }));
    }
  };

  const handleClear = () => { setForm(INITIAL); clearErrors(); };

  useKeyboardShortcuts({ 'ctrl+s': handleSave, 'escape': () => navigate('/sm/suppliers') });

  return (
    <MainCard
      title={<Stack direction="row" alignItems="center" spacing={1.5}><IconUserPlus size={24} /><Typography variant="h3">{supplierId ? 'Edit Supplier' : 'New Supplier'}</Typography></Stack>}
      secondary={
        <Stack direction="row" spacing={1.5}>
          <Tooltip title="Back to List"><Button variant="contained" startIcon={<IconArrowLeft size={18} />} onClick={() => navigate('/sm/suppliers')} sx={btnCancel}>Back</Button></Tooltip>
          {supplierId && <Tooltip title={shortcutTooltip('Delete', 'Ctrl + D')}><Button variant="contained" startIcon={<IconTrash size={18} />} onClick={() => setDeleteOpen(true)} sx={btnDelete}>Delete</Button></Tooltip>}
          <Tooltip title="Clear"><Button variant="contained" startIcon={<IconEraser size={18} />} onClick={handleClear} sx={btnClear}>Clear</Button></Tooltip>
          <Tooltip title={shortcutTooltip('Save', 'Ctrl + S')}><span><Button variant="contained" startIcon={<IconDeviceFloppy size={18} />} onClick={handleSave} disabled={loading} sx={btnSave}>{loading ? 'Saving...' : 'Save'}</Button></span></Tooltip>
        </Stack>
      }
    >
      <Stack spacing={3}>
        <BOSFormSection icon={<IconUser size={20} color={theme.palette.primary.main} />} title="Identity & Contact">
          <Grid container spacing={2.5}>
            <R><BOSTextField name="supplierCode" label="Supplier Code" value={form.supplierCode} onChange={h} disabled inputProps={{ readOnly: true }} sx={{ '& .MuiInputBase-input': { fontWeight: 700, color: 'primary.main' } }} /></R>
            <R><BOSTextField name="gstNo" label="GST No" value={form.gstNo} onChange={h} /></R>
            <R><BOSTextField name="supplierName" label="Supplier Name" value={form.supplierName} onChange={h} required error={!!errors.supplierName} helperText={errors.supplierName} /></R>
            <R><BOSTextField name="ledgerName" label="Ledger Name" value={form.ledgerName} onChange={h} select>
                <MenuItem value="">-Select-</MenuItem>
                <MenuItem value="General Ledger">General Ledger</MenuItem>
              </BOSTextField>
            </R>
            <R><BOSTextField name="shortName" label="Short Name" value={form.shortName} onChange={h} /></R>
            <R><BOSTextField name="supplierPrintName" label="Supplier Print Name" value={form.supplierPrintName} onChange={h} /></R>
            <R><BOSTextField name="mobileNo" label="Mobile No" value={form.mobileNo} onChange={h} /></R>
            <R><BOSTextField name="contactPerson" label="Contact Person" value={form.contactPerson} onChange={h} /></R>
            <R><BOSTextField name="emailId" label="Email Id" value={form.emailId} onChange={h} /></R>
            <R lg={6}><BOSTextField name="website" label="Website" value={form.website} onChange={h} /></R>
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
            <R><BOSTextField name="country" label="Country" value={form.country} onChange={h} select>
                {COUNTRIES.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
              </BOSTextField>
            </R>
            <R><BOSTextField name="pincode" label="Pin Code" value={form.pincode} onChange={h} /></R>
          </Grid>
        </BOSFormSection>

        <BOSFormSection icon={<IconBusinessplan size={20} color={theme.palette.primary.main} />} title="Business & Compliance">
          <Grid container spacing={2.5}>
            <R><BOSTextField name="panNo" label="PAN No" value={form.panNo} onChange={h} /></R>
            <R><BOSTextField name="msmeNo" label="MSME No" value={form.msmeNo} onChange={h} /></R>
            <R><BOSTextField name="isoNo" label="ISO No" value={form.isoNo} onChange={h} /></R>
            <R><BOSTextField name="isoExpiryDate" label="ISO Expiry Date" value={form.isoExpiryDate} onChange={h} type="date" InputLabelProps={{ shrink: true }} /></R>
            <R>
              <BOSTextField name="approvedSupplier" label="Approved Supplier" value={form.approvedSupplier} onChange={h} select>
                {YES_NO_OPTIONS.map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}
              </BOSTextField>
            </R>
            <R>
              <BOSTextField name="ndaRequired" label="NDA Required" value={form.ndaRequired} onChange={h} select>
                {YES_NO_OPTIONS.map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}
              </BOSTextField>
            </R>
            <R>
              <BOSTextField name="primeSupplier" label="Prime Supplier" value={form.primeSupplier} onChange={h} select>
                {YES_NO_OPTIONS.map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}
              </BOSTextField>
            </R>
            <R>
              <BOSTextField name="isAuditorConsultant" label="Is Auditor/Consultant" value={form.isAuditorConsultant} onChange={h} select>
                {YES_NO_OPTIONS.map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}
              </BOSTextField>
            </R>
          </Grid>
        </BOSFormSection>

        <BOSFormSection icon={<IconBuildingBank size={20} color={theme.palette.primary.main} />} title="Banking Details">
          <Grid container spacing={2.5}>
            <R><BOSTextField name="accountNo" label="Account No" value={form.accountNo} onChange={h} /></R>
            <R><BOSTextField name="accountName" label="Account Name" value={form.accountName} onChange={h} /></R>
            <R><BOSTextField name="bankName" label="Bank Name" value={form.bankName} onChange={h} /></R>
            <R><BOSTextField name="branchName" label="Branch Name" value={form.branchName} onChange={h} /></R>
            <R><BOSTextField name="ifscCode" label="IFSC Code" value={form.ifscCode} onChange={h} /></R>
            <R><BOSTextField name="swiftCode" label="Swift Code" value={form.swiftCode} onChange={h} /></R>
            <R><BOSTextField name="accountType" label="Account Type" value={form.accountType} onChange={h} /></R>
          </Grid>
        </BOSFormSection>

        <BOSFormSection icon={<IconTruckDelivery size={20} color={theme.palette.primary.main} />} title="Terms & Status">
          <Grid container spacing={2.5}>
            <R>
              <BOSTextField name="deliveryTerms" label="Delivery Terms" value={form.deliveryTerms} onChange={h} select>
                <MenuItem value="">-Select-</MenuItem>
                {deliveryTerms.map(t => (
                  <MenuItem key={t.id} value={t.termName}>{t.termName}</MenuItem>
                ))}
              </BOSTextField>
            </R>
            <R>
              <BOSTextField name="typeOfService" label="Type Of Service" value={form.typeOfService} onChange={h} select>
                <MenuItem value="">-Select-</MenuItem>
                {typesOfService.map(s => (
                  <MenuItem key={s.id} value={s.serviceName}>{s.serviceName}</MenuItem>
                ))}
              </BOSTextField>
            </R>
            <R>
              <BOSTextField name="paymentTerms" label="Payment Terms" value={form.paymentTerms} onChange={h} select>
                <MenuItem value="">-Select-</MenuItem>
                {paymentTerms.map(p => (
                  <MenuItem key={p.id} value={p.termName}>{p.termName}</MenuItem>
                ))}
              </BOSTextField>
            </R>
            <R>
              <BOSTextField name="freightRequired" label="Freight Required" value={form.freightRequired} onChange={h} select>
                <MenuItem value="Yes">Yes</MenuItem>
                <MenuItem value="No">No</MenuItem>
              </BOSTextField>
            </R>
            <R>
              <BOSTextField name="currency" label="Currency" value={form.currency} onChange={h} select required>
                <MenuItem value="">-Select-</MenuItem>
                {currencies.map(c => (
                  <MenuItem key={c.id} value={c.currencyCode}>{c.currencyCode} - {c.currencyName}</MenuItem>
                ))}
              </BOSTextField>
            </R>
            <R><BOSTextField name="dueDays" label="Due Days" value={form.dueDays} onChange={h} type="number" /></R>
            <R>
              <BOSTextField name="status" label="Status" value={form.status} onChange={h} select>
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="Inactive">Inactive</MenuItem>
              </BOSTextField>
            </R>
          </Grid>
        </BOSFormSection>

        <BOSFormSection icon={<IconFiles size={22} color={theme.palette.primary.main} />} title="Standard Attachments">
          <BOSFileUpload 
            files={uploadedFiles} 
            onChange={setUploadedFiles} 
            module="SALES_SUPPLIER"
            label="Upload Supplier Documents"
            helperText="PDFs, Images, or Excel sheets"
          />
        </BOSFormSection>
      </Stack>

      <ConfirmDeleteDialog open={deleteOpen} onClose={() => setDeleteOpen(false)} onConfirm={handleDelete} title="Delete Supplier" message="Are you sure you want to delete this supplier?" itemName={form.supplierName} />

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
