import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { MenuItem, useTheme } from '@mui/material';
import { IconSettings, IconScan } from '@tabler/icons-react';
import axios from 'utils/axios';
import { useDispatch } from 'react-redux';
import { openSnackbar } from 'store/slices/snackbar';
import { BOSFormDialog, BOSFormSection, BOSTextField } from 'ui-component/bos';
import ConfirmDeleteDialog from 'ui-component/ConfirmDeleteDialog';
import useBOSValidation from 'hooks/useBOSValidation';

// ==============================|| ENQUIRY - ADD/EDIT DIALOG (BOS SOP COMPLIANT) ||============================== //

const VALIDATION_RULES = [
  { field: 'customerName', label: 'Customer Name', required: true, maxLength: 200 },
  { field: 'subject', label: 'Subject', required: true, maxLength: 500 }
];

const INITIAL_STATE = {
  enquiryNo: '',
  enquiryDate: new Date().toISOString().split('T')[0],
  customerName: '',
  contactPerson: '',
  email: '',
  phone: '',
  subject: '',
  requirements: '',
  source: 'Email',
  priority: 'Medium',
  ocrDocumentPath: '',
  ocrExtractedText: '',
  ocrConfidence: '',
  status: 'Open',
  remarks: ''
};

const AddEnquiryDialog = ({ open, handleClose, initialData, readOnly = false }) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { errors, validate, clearErrors } = useBOSValidation();

  const [formData, setFormData] = useState(INITIAL_STATE);
  const [isEditing, setIsEditing] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await axios.get('/api/sm/customers');
        setCustomers(res.data);
      } catch (err) {
        console.error('Failed to fetch customers:', err);
      }
    };
    fetchCustomers();
  }, []);

  useEffect(() => {
    clearErrors();
    if (initialData) {
      setFormData({
        id: initialData.id,
        enquiryNo: initialData.enquiryNo || '',
        enquiryDate: initialData.enquiryDate ? new Date(initialData.enquiryDate).toISOString().split('T')[0] : '',
        customerName: initialData.customerName || '',
        customerId: initialData.customer?.id || '',
        contactPerson: initialData.contactPerson || '',
        email: initialData.email || '',
        phone: initialData.phone || '',
        subject: initialData.subject || '',
        requirements: initialData.requirements || '',
        source: initialData.source || 'Email',
        priority: initialData.priority || 'Medium',
        ocrDocumentPath: initialData.ocrDocumentPath || '',
        ocrExtractedText: initialData.ocrExtractedText || '',
        ocrConfidence: initialData.ocrConfidence || '',
        status: initialData.status || 'Open',
        remarks: initialData.remarks || ''
      });
      setIsEditing(false);
    } else {
      setFormData(INITIAL_STATE);
      setIsEditing(!readOnly);
    }
  }, [initialData, open, readOnly, clearErrors]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'customerId') {
      const selectedCust = customers.find(c => c.id === value);
      setFormData((prev) => ({ 
        ...prev, 
        customerId: value, 
        customerName: selectedCust ? selectedCust.customerName : prev.customerName,
        contactPerson: selectedCust ? selectedCust.contactPerson : prev.contactPerson,
        email: selectedCust ? selectedCust.email : prev.email,
        phone: selectedCust ? selectedCust.phone : prev.phone
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleClear = () => { setFormData(INITIAL_STATE); clearErrors(); };

  const handleSave = async () => {
    if (!validate(formData, VALIDATION_RULES)) return;
    const submissionData = {
      ...formData,
      customer: formData.customerId ? { id: formData.customerId } : null
    };
    try {
      if (formData.id) {
        await axios.put(`/api/sm/enquiry/${formData.id}`, submissionData);
        dispatch(openSnackbar({ open: true, message: 'Enquiry updated successfully!', variant: 'alert', alert: { variant: 'filled' }, severity: 'success', close: false }));
      } else {
        await axios.post('/api/sm/enquiry', submissionData);
        dispatch(openSnackbar({ open: true, message: 'Enquiry created successfully!', variant: 'alert', alert: { variant: 'filled' }, severity: 'success', close: false }));
      }
      handleClose(true);
    } catch (error) {
      console.error('Failed to save enquiry:', error);
      dispatch(openSnackbar({ open: true, message: 'Failed to save enquiry.', variant: 'alert', alert: { variant: 'filled' }, severity: 'error', close: false }));
    }
  };

  const handleDeleteConfirm = async () => {
    setDeleteOpen(false);
    try {
      await axios.delete(`/api/sm/enquiry/${formData.id}`);
      dispatch(openSnackbar({ open: true, message: 'Enquiry deleted!', variant: 'alert', alert: { variant: 'filled' }, severity: 'success', close: false }));
      handleClose(true);
    } catch (error) {
      console.error('Failed to delete enquiry:', error);
      dispatch(openSnackbar({ open: true, message: 'Failed to delete.', variant: 'alert', alert: { variant: 'filled' }, severity: 'error', close: false }));
    }
  };

  const isViewOnly = readOnly && !isEditing;

  return (
    <>
      <BOSFormDialog
        open={open}
        onClose={() => handleClose()}
        onSave={handleSave}
        onDelete={() => setDeleteOpen(true)}
        onClear={handleClear}
        onEditClick={() => setIsEditing(true)}
        title={initialData ? 'Edit Enquiry' : 'New Enquiry'}
        isViewOnly={isViewOnly}
        hasId={!!formData.id}
        maxWidth="lg"
      >
        <BOSFormSection icon={<IconSettings size={20} color={theme.palette.primary.main} />} title="Customer Details">
          <BOSTextField name="enquiryNo" label="Enquiry No" value={formData.enquiryNo} onChange={handleChange} disabled placeholder="Auto-generated" />
          <BOSTextField name="enquiryDate" label="Enquiry Date" type="date" value={formData.enquiryDate} onChange={handleChange} disabled={isViewOnly} />
          <BOSTextField 
            select 
            name="customerId" 
            label="Customer" 
            value={formData.customerId || ''} 
            onChange={handleChange} 
            disabled={isViewOnly} 
            required 
            error={!!errors.customerName} 
            helperText={errors.customerName}
          >
            {customers.map((cust) => (
              <MenuItem key={cust.id} value={cust.id}>
                {cust.customerName} ({cust.customerCode})
              </MenuItem>
            ))}
          </BOSTextField>
          <BOSTextField name="contactPerson" label="Contact Person" value={formData.contactPerson} onChange={handleChange} disabled={isViewOnly} />
          <BOSTextField name="email" label="Email" value={formData.email} onChange={handleChange} disabled={isViewOnly} />
          <BOSTextField name="phone" label="Phone" value={formData.phone} onChange={handleChange} disabled={isViewOnly} />
        </BOSFormSection>

        <BOSFormSection icon={<IconSettings size={20} color={theme.palette.primary.main} />} title="Enquiry Details">
          <BOSTextField name="subject" label="Subject" value={formData.subject} onChange={handleChange} disabled={isViewOnly} required maxLength={500} error={!!errors.subject} helperText={errors.subject} />
          <BOSTextField name="requirements" label="Requirements" value={formData.requirements} onChange={handleChange} disabled={isViewOnly} multiline rows={3} />
          <BOSTextField select name="source" label="Source" value={formData.source} onChange={handleChange} disabled={isViewOnly}>
            <MenuItem value="Email">Email</MenuItem>
            <MenuItem value="Phone">Phone</MenuItem>
            <MenuItem value="Website">Website</MenuItem>
            <MenuItem value="Walk-in">Walk-in</MenuItem>
            <MenuItem value="Referral">Referral</MenuItem>
            <MenuItem value="OCR Document">OCR Document</MenuItem>
          </BOSTextField>
          <BOSTextField select name="priority" label="Priority" value={formData.priority} onChange={handleChange} disabled={isViewOnly}>
            <MenuItem value="Low">Low</MenuItem>
            <MenuItem value="Medium">Medium</MenuItem>
            <MenuItem value="High">High</MenuItem>
            <MenuItem value="Urgent">Urgent</MenuItem>
          </BOSTextField>
          <BOSTextField select name="status" label="Status" value={formData.status} onChange={handleChange} disabled={isViewOnly}>
            <MenuItem value="Open">Open</MenuItem>
            <MenuItem value="In Progress">In Progress</MenuItem>
            <MenuItem value="Closed">Closed</MenuItem>
            <MenuItem value="Cancelled">Cancelled</MenuItem>
          </BOSTextField>
          <BOSTextField name="remarks" label="Remarks" value={formData.remarks} onChange={handleChange} disabled={isViewOnly} multiline rows={2} />
        </BOSFormSection>

        <BOSFormSection icon={<IconScan size={20} color={theme.palette.warning.main} />} title="OCR Data (Document Digitization)">
          <BOSTextField name="ocrDocumentPath" label="OCR Document Path" value={formData.ocrDocumentPath} onChange={handleChange} disabled={isViewOnly} />
          <BOSTextField name="ocrExtractedText" label="OCR Extracted Text" value={formData.ocrExtractedText} onChange={handleChange} disabled={isViewOnly} multiline rows={3} />
          <BOSTextField name="ocrConfidence" label="OCR Confidence (%)" value={formData.ocrConfidence} onChange={handleChange} disabled={isViewOnly} />
        </BOSFormSection>
      </BOSFormDialog>

      <ConfirmDeleteDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Enquiry"
        message="Are you sure you want to delete this enquiry? This action cannot be undone."
        itemName={formData.enquiryNo || formData.customerName}
      />
    </>
  );
};

AddEnquiryDialog.propTypes = { open: PropTypes.bool, handleClose: PropTypes.func, initialData: PropTypes.object, readOnly: PropTypes.bool };

export default AddEnquiryDialog;
