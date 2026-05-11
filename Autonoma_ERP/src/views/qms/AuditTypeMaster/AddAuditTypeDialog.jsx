import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { MenuItem } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { IconSettings } from '@tabler/icons-react';
import axios from 'utils/axios';
import { BOSFormDialog, BOSFormSection, BOSTextField } from 'ui-component/bos';
import Autocomplete from '@mui/material/Autocomplete';
import Checkbox from '@mui/material/Checkbox';
import { API_PATHS } from 'utils/api-constants';
import useAuth from 'hooks/useAuth';

// ==============================|| AUDIT TYPE - ADD/EDIT DIALOG (BOS SOP COMPLIANT) ||============================== //

const AddAuditTypeDialog = ({ open, handleClose, initialData, readOnly = false }) => {
  const theme = useTheme();

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
  const [auditAreas, setAuditAreas] = useState([]);

  useEffect(() => {
    const fetchAreas = async () => {
      try {
        const res = await axios.get(API_PATHS.QMS.AUDIT_AREA);
        setAuditAreas(res.data);
      } catch (error) {
        console.error('Failed to fetch areas:', error);
        setAuditAreas([]);
      }
    };
    if (open) fetchAreas();
  }, [open]);

  useEffect(() => {
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
        status: initialData.status || 'ACTIVE',
        createdBy: initialData.createdBy
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
    setFormData((prev) => ({ ...prev, [name]: value }));
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
    if (!formData.auditType?.trim()) {
      alert('Audit Type is required');
      return;
    }
    if (!formData.description?.trim()) {
      alert('Description is required');
      return;
    }

    try {
      const payload = {
        ...formData,
        auditArea: Array.isArray(formData.auditArea) ? formData.auditArea.join(', ') : formData.auditArea,
        createdBy: formData.id ? formData.createdBy : (user?.name || 'Admin'),
        updatedBy: user?.name || 'Admin'
      };

      if (formData.id) {
        await axios.put(`${API_PATHS.QMS.AUDIT_TYPE}/${formData.id}`, payload);
      } else {
        await axios.post(API_PATHS.QMS.AUDIT_TYPE, payload);
      }
      handleClose(true);
    } catch (error) {
      console.error('Failed to save audit type:', error);
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
          disabled={isViewOnly}
          required
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
        />

        <BOSTextField
          name="criteriaMinCount"
          label="Criteria Minimum Count"
          type="number"
          value={formData.criteriaMinCount}
          onChange={handleChange}
          disabled={isViewOnly}
          required
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
          <MenuItem value="Variable">Variable</MenuItem>
        </BOSTextField>

        <BOSTextField
          select
          name="status"
          label="Status"
          value={formData.status}
          onChange={handleChange}
          disabled={isViewOnly}
        >
          <MenuItem value="ACTIVE">ACTIVE</MenuItem>
          <MenuItem value="INACTIVE">INACTIVE</MenuItem>
        </BOSTextField>
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
