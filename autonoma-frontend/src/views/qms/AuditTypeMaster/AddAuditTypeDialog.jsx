import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { MenuItem } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { IconSettings } from '@tabler/icons-react';
import axios from 'utils/axios';
import { BOSFormDialog, BOSFormSection, BOSTextField, BOSStatusField } from 'ui-component/bos';
import Autocomplete from '@mui/material/Autocomplete';
import Checkbox from '@mui/material/Checkbox';
import { API_PATHS } from 'utils/api-constants';
import useAuth from 'hooks/useAuth';
import { useDispatch } from 'react-redux';
import { openSnackbar } from 'store/slices/snackbar';

// ==============================|| AUDIT TYPE - ADD/EDIT DIALOG (BOS SOP COMPLIANT) ||============================== //

const AddAuditTypeDialog = ({ open, handleClose, initialData, readOnly = false }) => {
  const theme = useTheme();
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    auditType: '',
    standard: '',
    description: '',
    criteriaMinCount: 0,
    customerAuditArea: 'NO',
    auditArea: [],
    criteriaType: 'Fixed',
    status: 'ACTIVE'
  });
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [errors, setErrors] = useState({});
  const [auditAreas, setAuditAreas] = useState([]);

  useEffect(() => {
    const fetchAreas = async () => {
      try {
        const res = await axios.get(API_PATHS.QMS.AUDIT_AREA);
        setAuditAreas((res.data || []).filter(a => a && a.status === 'ACTIVE'));
      } catch (error) {
        console.error('Failed to fetch areas:', error);
        setAuditAreas([]);
      }
    };
    if (open) fetchAreas();
  }, [open]);

  useEffect(() => {
    setErrors({});
    if (initialData) {
      setFormData({
        id: initialData.id,
        auditType: initialData.auditType || '',
        standard: initialData.standard || '',
        description: initialData.description || '',
        criteriaMinCount: initialData.criteriaMinCount || 0,
        customerAuditArea: initialData.customerAuditArea || 'NO',
        auditArea: initialData.auditArea ? initialData.auditArea.split(', ') : [],
        criteriaType: initialData.criteriaType || 'Fixed',
        status: initialData.status || 'ACTIVE'
      });
      setIsEditing(false);
    } else {
      setFormData({
        auditType: '',
        standard: '',
        description: '',
        criteriaMinCount: 0,
        customerAuditArea: 'NO',
        auditArea: [],
        criteriaType: 'Fixed',
        status: 'ACTIVE'
      });
      setIsEditing(!readOnly);
    }
  }, [initialData, open, readOnly]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    // SOP: Converted to uppercase automatically for auditType
    const finalValue = name === 'auditType' ? value.toUpperCase() : value;
    setFormData((prev) => ({ ...prev, [name]: finalValue }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleClear = () => {
    setFormData({
      auditType: '',
      standard: '',
      description: '',
      criteriaMinCount: 0,
      customerAuditArea: 'NO',
      auditArea: [],
      criteriaType: 'Fixed',
      status: 'ACTIVE'
    });
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${API_PATHS.QMS.AUDIT_TYPE}/${formData.id}`);
      handleClose(true);
    } catch (error) {
      console.error('Failed to delete audit type:', error);
    }
  };

  const handleSave = async () => {
    setErrors({});
    // SOP: Mandatory Field Validation & Error Messages
    if (!formData.auditType?.trim()) {
      setErrors((prev) => ({ ...prev, auditType: 'Please Enter Audit Type...' }));
      return;
    }
    if (!formData.description?.trim()) {
      setErrors((prev) => ({ ...prev, description: 'Please Enter Audit Description...' }));
      return;
    }
    if (Number(formData.criteriaMinCount) <= 0) {
      setErrors((prev) => ({ ...prev, criteriaMinCount: 'Please Enter Audit Criteria Minimum Count...' }));
      return;
    }

    try {
      const payload = {
        ...formData,
        auditArea: Array.isArray(formData.auditArea) ? formData.auditArea.join(', ') : formData.auditArea
      };
      delete payload.createdUser;
      delete payload.updatedUser;

      if (formData.id) {
        await axios.put(`${API_PATHS.QMS.AUDIT_TYPE}/${formData.id}`, payload, { skipGlobalAlert: true });
      } else {
        await axios.post(API_PATHS.QMS.AUDIT_TYPE, payload, { skipGlobalAlert: true });
      }
      handleClose(true);
    } catch (error) {
      console.error('Failed to save audit type:', error);
      let errorMsg = 'An error occurred while saving.';
      if (error.response?.data) {
        if (typeof error.response.data === 'string') {
          errorMsg = error.response.data;
        } else if (error.response.data.message) {
          errorMsg = error.response.data.message;
        } else if (error.response.data.error) {
          errorMsg = error.response.data.error;
        }
      }
      if (errorMsg.includes('auditType')) {
        setErrors({ auditType: 'Duplicate value! Please check.' });
      } else if (errorMsg.includes('description')) {
        setErrors({ description: 'Duplicate value! Please check.' });
      } else {
        dispatch(openSnackbar({
          open: true,
          message: errorMsg,
          variant: 'alert',
          alert: { variant: 'filled' },
          severity: 'error',
          close: false
        }));
      }
    }
  };

  const isViewOnly = readOnly && !isEditing;

  return (
    <BOSFormDialog
      open={open}
      onClose={() => handleClose()}
      onSave={handleSave}
      onDelete={handleDelete}
      onClear={handleClear}
      onEditClick={() => setIsEditing(true)}
      title={initialData ? 'Edit Audit Type' : 'New Audit Type'}
      isViewOnly={isViewOnly}
      hasId={!!formData.id}
      maxWidth="md"
    >
      <BOSFormSection icon={<IconSettings size={20} color={theme.palette.primary.main} />} title="Type Details">
        <BOSTextField
          name="auditType"
          label="Audit Type"
          value={formData.auditType}
          onChange={handleChange}
          // SOP: During edit operation, Audit Type field should become Read Only
          disabled={isViewOnly || !!formData.id}
          required
          error={!!errors.auditType}
          helperText={errors.auditType}
        />

        <BOSTextField
          name="standard"
          label="Standard"
          value={formData.standard}
          onChange={handleChange}
          disabled={isViewOnly}
        />

        <BOSTextField
          name="description"
          label="Description"
          multiline
          rows={2}
          value={formData.description}
          onChange={handleChange}
          disabled={isViewOnly}
          required
          error={!!errors.description}
          helperText={errors.description}
        />

        <BOSTextField
          name="criteriaMinCount"
          label="Criteria Minimum Count"
          type="number"
          value={formData.criteriaMinCount}
          onChange={handleChange}
          disabled={isViewOnly}
          required
          error={!!errors.criteriaMinCount}
          helperText={errors.criteriaMinCount}
        />

        <BOSTextField
          select
          name="customerAuditArea"
          label="Customer Audit Area"
          value={formData.customerAuditArea}
          onChange={handleChange}
          disabled={isViewOnly}
        >
          <MenuItem value="YES">YES</MenuItem>
          <MenuItem value="NO">NO</MenuItem>
        </BOSTextField>

        <Autocomplete
          multiple
          disableCloseOnSelect
          options={auditAreas}
          getOptionLabel={(option) => option.description || ''}
          value={auditAreas.filter((a) => (formData.auditArea || []).includes(a.description))}
          onChange={(event, newValue) => {
            setFormData({ ...formData, auditArea: newValue.map((v) => v.description) });
          }}
          disabled={isViewOnly}
          renderInput={(params) => (
            <BOSTextField {...params} label="Audit Area" />
          )}
          renderOption={(props, option, { selected }) => {
            const { key, ...optionProps } = props;
            return (
              <li key={key} {...optionProps}>
                <Checkbox size="small" style={{ marginRight: 8 }} checked={selected} />
                {option.description}
              </li>
            );
          }}
          sx={{
            '& .MuiAutocomplete-tag': {
              bgcolor: 'primary.light',
              color: 'primary.main',
              fontWeight: 600,
              height: 24
            }
          }}
        />

        <BOSTextField
          select
          name="criteriaType"
          label="Audit Criteria Type"
          value={formData.criteriaType}
          onChange={handleChange}
          disabled={isViewOnly}
        >
          <MenuItem value="Fixed">Fixed</MenuItem>
          <MenuItem value="Variable">Open</MenuItem>
        </BOSTextField>

        <BOSStatusField
          isCreate={!initialData}
          type="string-upper"
          name="status"
          label="Status"
          value={formData.status}
          onChange={handleChange}
          disabled={isViewOnly}
        />
      </BOSFormSection>
      
    </BOSFormDialog>
  );
};

AddAuditTypeDialog.propTypes = {
  open: PropTypes.bool,
  handleClose: PropTypes.func,
  initialData: PropTypes.object,
  readOnly: PropTypes.bool
};

export default AddAuditTypeDialog;
