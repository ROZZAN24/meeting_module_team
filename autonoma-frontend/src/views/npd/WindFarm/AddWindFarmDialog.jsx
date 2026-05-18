import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { MenuItem, useTheme, Autocomplete, TextField as MuiTextField } from '@mui/material';
import { IconClipboardCheck } from '@tabler/icons-react';
import axios from 'utils/axios';
import { useDispatch } from 'react-redux';
import { openSnackbar } from 'store/slices/snackbar';
import { BOSFormDialog, BOSFormSection, BOSTextField } from 'ui-component/bos';
import ConfirmDeleteDialog from 'ui-component/ConfirmDeleteDialog';
import useBOSValidation from 'hooks/useBOSValidation';
import { API_PATHS } from 'utils/api-constants';
import useAuth from 'hooks/useAuth';

// ==============================|| WIND FARM - ADD/EDIT DIALOG (BOS SOP COMPLIANT) ||============================== //

const VALIDATION_RULES = [
  { field: 'windFarmName', label: 'Wind Farm Name', required: true, maxLength: 100 },
  { field: 'country', label: 'Country', required: true },
  { field: 'state', label: 'State', required: true },
  { field: 'city', label: 'City', required: true, maxLength: 100 }
];

const INITIAL_STATE = {
  windFarmName: '',
  city: '',
  state: '',
  country: ''
};

const AddWindFarmDialog = ({ open, handleClose, initialData, readOnly = false }) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { user } = useAuth();
  const { errors, validate, clearErrors } = useBOSValidation();

  const [formData, setFormData] = useState(INITIAL_STATE);
  const [isEditing, setIsEditing] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  // States fetched dynamically from state master
  const [allStates, setAllStates] = useState([]);
  const [uniqueCountries, setUniqueCountries] = useState([]);
  const [filteredStates, setFilteredStates] = useState([]);

  useEffect(() => {
    const fetchStatesData = async () => {
      try {
        const response = await axios.get('/api/master/states');
        const statesList = response.data || [];
        setAllStates(statesList);
        
        // Extract unique countries
        const countriesSet = new Set(statesList.map(s => s.countryName).filter(Boolean));
        setUniqueCountries(Array.from(countriesSet));
      } catch (error) {
        console.error('Failed to fetch states for lookups:', error);
      }
    };
    if (open) {
      fetchStatesData();
    }
  }, [open]);

  useEffect(() => {
    clearErrors();
    if (initialData) {
      setFormData({
        id: initialData.id,
        windFarmName: initialData.windFarmName || '',
        city: initialData.city || '',
        state: initialData.state || '',
        country: initialData.country || '',
        createdBy: initialData.createdBy,
        createdAt: initialData.createdAt
      });
      setIsEditing(false);
    } else {
      setFormData(INITIAL_STATE);
      setIsEditing(!readOnly);
    }
  }, [initialData, open, readOnly, clearErrors]);

  // Filter states list based on country selection
  useEffect(() => {
    if (formData.country) {
      const filtered = allStates.filter(s => s.countryName?.toUpperCase() === formData.country.toUpperCase());
      setFilteredStates(filtered);
    } else {
      setFilteredStates([]);
    }
  }, [formData.country, allStates]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      // Clear dependent state if country changed
      if (name === 'country') {
        updated.state = '';
      }
      return updated;
    });
  };

  const handleClear = () => {
    setFormData(INITIAL_STATE);
    clearErrors();
  };

  const handleSave = async () => {
    if (!validate(formData, VALIDATION_RULES)) return;

    try {
      const payload = {
        id: formData.id,
        windFarmName: formData.windFarmName,
        city: formData.city,
        state: formData.state,
        country: formData.country,
        createdBy: formData.id ? formData.createdBy : (user?.name || 'Admin'),
        updatedBy: user?.name || 'Admin',
        createdAt: formData.createdAt
      };

      if (formData.id) {
        await axios.put(`${API_PATHS.NPD.WIND_FARMS}/${formData.id}`, payload);
        dispatch(openSnackbar({ open: true, message: 'Wind Farm updated successfully!', variant: 'alert', alert: { variant: 'filled' }, severity: 'success', close: false }));
      } else {
        await axios.post(API_PATHS.NPD.WIND_FARMS, payload);
        dispatch(openSnackbar({ open: true, message: 'Wind Farm created successfully!', variant: 'alert', alert: { variant: 'filled' }, severity: 'success', close: false }));
      }
      handleClose(true);
    } catch (error) {
      console.error('Failed to save Wind Farm:', error);
      const errorMsg = error.response?.data || 'Failed to save Wind Farm.';
      dispatch(openSnackbar({ open: true, message: errorMsg, variant: 'alert', alert: { variant: 'filled' }, severity: 'error', close: false }));
    }
  };

  const handleDeleteConfirm = async () => {
    setDeleteOpen(false);
    try {
      await axios.delete(`${API_PATHS.NPD.WIND_FARMS}/${formData.id}`);
      dispatch(openSnackbar({ open: true, message: 'Wind Farm deleted!', variant: 'alert', alert: { variant: 'filled' }, severity: 'success', close: false }));
      handleClose(true);
    } catch (error) {
      console.error('Failed to delete Wind Farm:', error);
      dispatch(openSnackbar({ open: true, message: 'Failed to delete Wind Farm.', variant: 'alert', alert: { variant: 'filled' }, severity: 'error', close: false }));
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
        title={initialData ? 'Edit Wind Farm details' : 'New Wind Farm details'}
        isViewOnly={isViewOnly}
        hasId={!!formData.id}
        maxWidth="md"
      >
        <BOSFormSection icon={<IconClipboardCheck size={20} color={theme.palette.primary.main} />} title="Wind Farm Details">
          <BOSTextField
            name="windFarmName"
            label="Wind Farm Name"
            value={formData.windFarmName}
            onChange={handleChange}
            disabled={isViewOnly}
            required
            maxLength={100}
            error={!!errors.windFarmName}
            helperText={errors.windFarmName}
          />

          <Autocomplete
            value={formData.country || null}
            onChange={(event, newValue) => {
              setFormData((prev) => ({
                ...prev,
                country: newValue || '',
                state: ''
              }));
            }}
            disabled={isViewOnly}
            options={uniqueCountries}
            freeSolo={false}
            renderInput={(params) => (
              <MuiTextField
                {...params}
                label="Country"
                variant="outlined"
                size="small"
                required
                error={!!errors.country}
                helperText={errors.country}
                sx={{ mt: 1, mb: 1, '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
              />
            )}
            isOptionEqualToValue={(option, value) => option === value}
            noOptionsText="No countries found"
          />

          <Autocomplete
            value={formData.state || null}
            onChange={(event, newValue) => {
              setFormData((prev) => ({
                ...prev,
                state: newValue || ''
              }));
            }}
            disabled={isViewOnly || !formData.country}
            options={filteredStates.map(s => s.stateName)}
            freeSolo={false}
            renderInput={(params) => (
              <MuiTextField
                {...params}
                label="State"
                variant="outlined"
                size="small"
                required
                error={!!errors.state}
                helperText={errors.state || (!formData.country ? 'Please select a country first' : '')}
                sx={{ mt: 1, mb: 1, '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
              />
            )}
            isOptionEqualToValue={(option, value) => option === value}
            noOptionsText={formData.country ? 'No states for this country' : 'Select a country first'}
          />

          <BOSTextField
            name="city"
            label="City"
            value={formData.city}
            onChange={handleChange}
            disabled={isViewOnly}
            required
            maxLength={100}
            error={!!errors.city}
            helperText={errors.city}
          />
        </BOSFormSection>
      </BOSFormDialog>

      <ConfirmDeleteDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Wind Farm details"
        message="Are you sure you want to delete this Wind Farm? This action cannot be undone."
        itemName={formData.windFarmName}
      />
    </>
  );
};

AddWindFarmDialog.propTypes = {
  open: PropTypes.bool,
  handleClose: PropTypes.func,
  initialData: PropTypes.object,
  readOnly: PropTypes.bool
};

export default AddWindFarmDialog;
