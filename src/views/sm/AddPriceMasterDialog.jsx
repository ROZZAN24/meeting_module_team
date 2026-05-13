import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { MenuItem, useTheme } from '@mui/material';
import { IconSettings, IconScan } from '@tabler/icons-react';
import axios from 'utils/axios';
import { API_PATHS } from 'utils/api-constants';
import { useDispatch } from 'react-redux';
import { openSnackbar } from 'store/slices/snackbar';
import { BOSFormDialog, BOSFormSection, BOSTextField } from 'ui-component/bos';
import ConfirmDeleteDialog from 'ui-component/ConfirmDeleteDialog';
import useBOSValidation from 'hooks/useBOSValidation';

// ==============================|| PRICE MASTER - ADD/EDIT DIALOG (BOS SOP COMPLIANT) ||============================== //

const VALIDATION_RULES = [
  { field: 'customerName', label: 'Customer Name', required: true, maxLength: 200 },
  { field: 'productName', label: 'Product Name', required: true, maxLength: 200 }
];

const INITIAL_STATE = {
  masterNo: '',
  entryDate: new Date().toISOString().split('T')[0],
  customerName: '',
  productName: '',
  unitPrice: '',
  quantity: '',
  currency: 'INR',
  validFrom: '',
  validTo: '',
  termsAndConditions: '',
  ocrDocumentPath: '',
  ocrExtractedText: '',
  ocrConfidence: '',
  status: 'Active',
  remarks: ''
};

const AddPriceMasterDialog = ({ open, handleClose, initialData, initialGroupName, readOnly = false }) => {
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
        const res = await axios.get(API_PATHS.SM.CUSTOMERS);
        setCustomers(res.data);
      } catch (err) {
        console.error('Failed to fetch customers:', err);
      }
    };
    if (open) fetchCustomers();
  }, [open]);

  useEffect(() => {
    clearErrors();
    if (initialData) {
      setFormData({
        id: initialData.id,
        masterNo: initialData.masterNo || '',
        entryDate: initialData.entryDate ? new Date(initialData.entryDate).toISOString().split('T')[0] : '',
        customerName: initialData.customerName || '',
        customerId: initialData.customer?.id || '',
        productName: initialData.productName || '',
        unitPrice: initialData.unitPrice || '',
        quantity: initialData.quantity || '',
        currency: initialData.currency || 'INR',
        validFrom: initialData.validFrom ? new Date(initialData.validFrom).toISOString().split('T')[0] : '',
        validTo: initialData.validTo ? new Date(initialData.validTo).toISOString().split('T')[0] : '',
        termsAndConditions: initialData.termsAndConditions || '',
        ocrDocumentPath: initialData.ocrDocumentPath || '',
        ocrExtractedText: initialData.ocrExtractedText || '',
        ocrConfidence: initialData.ocrConfidence || '',
        status: initialData.status || 'Active',
        remarks: initialData.remarks || ''
      });
      setIsEditing(false);
    } else {
      setFormData(INITIAL_STATE);
      setIsEditing(!readOnly);
      
      // Autofill from initialGroupName
      if (initialGroupName && customers.length > 0) {
        const selectedCust = customers.find(c => c.customerName === initialGroupName);
        if (selectedCust) {
          setFormData(prev => ({
            ...prev,
            customerId: selectedCust.id,
            customerName: selectedCust.customerName
          }));
        }
      }
    }
  }, [initialData, initialGroupName, open, readOnly, clearErrors, customers]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'customerId') {
      const selectedCust = customers.find(c => c.id === value);
      setFormData((prev) => ({ 
        ...prev, 
        customerId: value, 
        customerName: selectedCust ? selectedCust.customerName : prev.customerName 
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
        await axios.put(`${API_PATHS.SM.PRICE_MASTER}/${formData.id}`, submissionData);
        dispatch(openSnackbar({ open: true, message: 'Price Master updated successfully!', variant: 'alert', alert: { variant: 'filled' }, severity: 'success', close: false }));
      } else {
        await axios.post(API_PATHS.SM.PRICE_MASTER, submissionData);
        dispatch(openSnackbar({ open: true, message: 'Price Master created successfully!', variant: 'alert', alert: { variant: 'filled' }, severity: 'success', close: false }));
      }
      handleClose(true);
    } catch (error) {
      console.error('Failed to save price master:', error);
      dispatch(openSnackbar({ open: true, message: 'Failed to save price master.', variant: 'alert', alert: { variant: 'filled' }, severity: 'error', close: false }));
    }
  };

  const handleDeleteConfirm = async () => {
    setDeleteOpen(false);
    try {
      await axios.delete(`${API_PATHS.SM.PRICE_MASTER}/${formData.id}`);
      dispatch(openSnackbar({ open: true, message: 'Price Master deleted!', variant: 'alert', alert: { variant: 'filled' }, severity: 'success', close: false }));
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
        title={initialData ? 'Edit Price Master' : 'New Price Master'}
        isViewOnly={isViewOnly}
        hasId={!!formData.id}
        maxWidth="lg"
      >
        <BOSFormSection icon={<IconSettings size={20} color={theme.palette.primary.main} />} title="Master Details">
          <BOSTextField name="masterNo" label="Master No" value={formData.masterNo} onChange={handleChange} disabled placeholder="Auto-generated" />
          <BOSTextField name="entryDate" label="Entry Date" type="date" value={formData.entryDate} onChange={handleChange} disabled={isViewOnly} />
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
          <BOSTextField name="productName" label="Product Name" value={formData.productName} onChange={handleChange} disabled={isViewOnly} required error={!!errors.productName} helperText={errors.productName} />
        </BOSFormSection>

        <BOSFormSection icon={<IconSettings size={20} color={theme.palette.primary.main} />} title="Pricing & Validity">
          <BOSTextField name="unitPrice" label="Unit Price" value={formData.unitPrice} onChange={handleChange} disabled={isViewOnly} />
          <BOSTextField name="quantity" label="Quantity" value={formData.quantity} onChange={handleChange} disabled={isViewOnly} />
          <BOSTextField select name="currency" label="Currency" value={formData.currency} onChange={handleChange} disabled={isViewOnly}>
            <MenuItem value="INR">INR</MenuItem>
            <MenuItem value="USD">USD</MenuItem>
            <MenuItem value="EUR">EUR</MenuItem>
            <MenuItem value="GBP">GBP</MenuItem>
          </BOSTextField>
          <BOSTextField name="validFrom" label="Valid From" type="date" value={formData.validFrom} onChange={handleChange} disabled={isViewOnly} />
          <BOSTextField name="validTo" label="Valid To" type="date" value={formData.validTo} onChange={handleChange} disabled={isViewOnly} />
          <BOSTextField name="termsAndConditions" label="Terms & Conditions" value={formData.termsAndConditions} onChange={handleChange} disabled={isViewOnly} multiline rows={3} />
          <BOSTextField select name="status" label="Status" value={formData.status} onChange={handleChange} disabled={isViewOnly}>
            <MenuItem value="Active">Active</MenuItem>
            <MenuItem value="Expired">Expired</MenuItem>
            <MenuItem value="Cancelled">Cancelled</MenuItem>
          </BOSTextField>
          <BOSTextField name="remarks" label="Remarks" value={formData.remarks} onChange={handleChange} disabled={isViewOnly} multiline rows={2} />
        </BOSFormSection>

        <BOSFormSection icon={<IconScan size={20} color={theme.palette.warning.main} />} title="OCR Data (Agreement Digitization)">
          <BOSTextField name="ocrDocumentPath" label="OCR Document Path" value={formData.ocrDocumentPath} onChange={handleChange} disabled={isViewOnly} />
          <BOSTextField name="ocrExtractedText" label="OCR Extracted Text" value={formData.ocrExtractedText} onChange={handleChange} disabled={isViewOnly} multiline rows={3} />
          <BOSTextField name="ocrConfidence" label="OCR Confidence (%)" value={formData.ocrConfidence} onChange={handleChange} disabled={isViewOnly} />
        </BOSFormSection>
      </BOSFormDialog>

      <ConfirmDeleteDialog open={deleteOpen} onClose={() => setDeleteOpen(false)} onConfirm={handleDeleteConfirm} title="Delete Price Master" message="Are you sure you want to delete this price master?" itemName={formData.masterNo || formData.customerName} />
    </>
  );
};

AddPriceMasterDialog.propTypes = { open: PropTypes.bool, handleClose: PropTypes.func, initialData: PropTypes.object, readOnly: PropTypes.bool };

export default AddPriceMasterDialog;
