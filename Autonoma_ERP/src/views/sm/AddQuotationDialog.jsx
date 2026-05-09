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

// ==============================|| QUOTATION - ADD/EDIT DIALOG (BOS SOP COMPLIANT) ||============================== //

const VALIDATION_RULES = [
  { field: 'customerName', label: 'Customer Name', required: true, maxLength: 200 },
  { field: 'productName', label: 'Product Name', required: true, maxLength: 200 }
];

const INITIAL_STATE = {
  quotationNo: '',
  quotationDate: new Date().toISOString().split('T')[0],
  enquiryRef: '',
  customerName: '',
  contactPerson: '',
  productName: '',
  description: '',
  quantity: '',
  unitPrice: '',
  totalAmount: '',
  currency: 'INR',
  validityPeriod: '30 Days',
  deliveryTerms: '',
  paymentTerms: '',
  ocrDocumentPath: '',
  ocrExtractedText: '',
  ocrConfidence: '',
  status: 'Draft',
  remarks: ''
};

const AddQuotationDialog = ({ open, handleClose, initialData, readOnly = false }) => {
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
        quotationNo: initialData.quotationNo || '',
        quotationDate: initialData.quotationDate ? new Date(initialData.quotationDate).toISOString().split('T')[0] : '',
        enquiryRef: initialData.enquiryRef || '',
        customerName: initialData.customerName || '',
        customerId: initialData.customer?.id || '',
        contactPerson: initialData.contactPerson || '',
        productName: initialData.productName || '',
        description: initialData.description || '',
        quantity: initialData.quantity || '',
        unitPrice: initialData.unitPrice || '',
        totalAmount: initialData.totalAmount || '',
        currency: initialData.currency || 'INR',
        validityPeriod: initialData.validityPeriod || '30 Days',
        deliveryTerms: initialData.deliveryTerms || '',
        paymentTerms: initialData.paymentTerms || '',
        ocrDocumentPath: initialData.ocrDocumentPath || '',
        ocrExtractedText: initialData.ocrExtractedText || '',
        ocrConfidence: initialData.ocrConfidence || '',
        status: initialData.status || 'Draft',
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
        contactPerson: selectedCust ? selectedCust.contactPerson : prev.contactPerson
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
        await axios.put(`/api/sm/quotation/${formData.id}`, submissionData);
        dispatch(openSnackbar({ open: true, message: 'Quotation updated successfully!', variant: 'alert', alert: { variant: 'filled' }, severity: 'success', close: false }));
      } else {
        await axios.post('/api/sm/quotation', submissionData);
        dispatch(openSnackbar({ open: true, message: 'Quotation created successfully!', variant: 'alert', alert: { variant: 'filled' }, severity: 'success', close: false }));
      }
      handleClose(true);
    } catch (error) {
      console.error('Failed to save quotation:', error);
      dispatch(openSnackbar({ open: true, message: 'Failed to save quotation.', variant: 'alert', alert: { variant: 'filled' }, severity: 'error', close: false }));
    }
  };

  const handleDeleteConfirm = async () => {
    setDeleteOpen(false);
    try {
      await axios.delete(`/api/sm/quotation/${formData.id}`);
      dispatch(openSnackbar({ open: true, message: 'Quotation deleted!', variant: 'alert', alert: { variant: 'filled' }, severity: 'success', close: false }));
      handleClose(true);
    } catch (error) {
      console.error('Failed to delete:', error);
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
        title={initialData ? 'Edit Quotation' : 'New Quotation'}
        isViewOnly={isViewOnly}
        hasId={!!formData.id}
        maxWidth="lg"
      >
        <BOSFormSection icon={<IconSettings size={20} color={theme.palette.primary.main} />} title="Quotation Details">
          <BOSTextField name="quotationNo" label="Quotation No" value={formData.quotationNo} onChange={handleChange} disabled placeholder="Auto-generated" />
          <BOSTextField name="quotationDate" label="Quotation Date" type="date" value={formData.quotationDate} onChange={handleChange} disabled={isViewOnly} />
          <BOSTextField name="enquiryRef" label="Enquiry Reference" value={formData.enquiryRef} onChange={handleChange} disabled={isViewOnly} />
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
        </BOSFormSection>

        <BOSFormSection icon={<IconSettings size={20} color={theme.palette.primary.main} />} title="Product & Pricing">
          <BOSTextField name="productName" label="Product Name" value={formData.productName} onChange={handleChange} disabled={isViewOnly} required error={!!errors.productName} helperText={errors.productName} />
          <BOSTextField name="description" label="Description" value={formData.description} onChange={handleChange} disabled={isViewOnly} multiline rows={2} />
          <BOSTextField name="quantity" label="Quantity" value={formData.quantity} onChange={handleChange} disabled={isViewOnly} />
          <BOSTextField name="unitPrice" label="Unit Price" value={formData.unitPrice} onChange={handleChange} disabled={isViewOnly} />
          <BOSTextField name="totalAmount" label="Total Amount" value={formData.totalAmount} onChange={handleChange} disabled={isViewOnly} />
          <BOSTextField select name="currency" label="Currency" value={formData.currency} onChange={handleChange} disabled={isViewOnly}>
            <MenuItem value="INR">INR</MenuItem>
            <MenuItem value="USD">USD</MenuItem>
            <MenuItem value="EUR">EUR</MenuItem>
            <MenuItem value="GBP">GBP</MenuItem>
          </BOSTextField>
        </BOSFormSection>

        <BOSFormSection icon={<IconSettings size={20} color={theme.palette.primary.main} />} title="Terms & Status">
          <BOSTextField name="validityPeriod" label="Validity Period" value={formData.validityPeriod} onChange={handleChange} disabled={isViewOnly} />
          <BOSTextField name="deliveryTerms" label="Delivery Terms" value={formData.deliveryTerms} onChange={handleChange} disabled={isViewOnly} multiline rows={2} />
          <BOSTextField name="paymentTerms" label="Payment Terms" value={formData.paymentTerms} onChange={handleChange} disabled={isViewOnly} multiline rows={2} />
          <BOSTextField select name="status" label="Status" value={formData.status} onChange={handleChange} disabled={isViewOnly}>
            <MenuItem value="Draft">Draft</MenuItem>
            <MenuItem value="Sent">Sent</MenuItem>
            <MenuItem value="Accepted">Accepted</MenuItem>
            <MenuItem value="Rejected">Rejected</MenuItem>
            <MenuItem value="Expired">Expired</MenuItem>
          </BOSTextField>
          <BOSTextField name="remarks" label="Remarks" value={formData.remarks} onChange={handleChange} disabled={isViewOnly} multiline rows={2} />
        </BOSFormSection>

        <BOSFormSection icon={<IconScan size={20} color={theme.palette.warning.main} />} title="OCR Data (Automated Quote Generation)">
          <BOSTextField name="ocrDocumentPath" label="OCR Document Path" value={formData.ocrDocumentPath} onChange={handleChange} disabled={isViewOnly} />
          <BOSTextField name="ocrExtractedText" label="OCR Extracted Text" value={formData.ocrExtractedText} onChange={handleChange} disabled={isViewOnly} multiline rows={3} />
          <BOSTextField name="ocrConfidence" label="OCR Confidence (%)" value={formData.ocrConfidence} onChange={handleChange} disabled={isViewOnly} />
        </BOSFormSection>
      </BOSFormDialog>

      <ConfirmDeleteDialog open={deleteOpen} onClose={() => setDeleteOpen(false)} onConfirm={handleDeleteConfirm} title="Delete Quotation" message="Are you sure you want to delete this quotation?" itemName={formData.quotationNo || formData.customerName} />
    </>
  );
};

AddQuotationDialog.propTypes = { open: PropTypes.bool, handleClose: PropTypes.func, initialData: PropTypes.object, readOnly: PropTypes.bool };

export default AddQuotationDialog;
