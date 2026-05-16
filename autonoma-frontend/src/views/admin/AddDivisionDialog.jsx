import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import { MenuItem, useTheme, Autocomplete, TextField, Box, Typography, Grid } from '@mui/material';
import { IconLayoutColumns, IconBuilding, IconMapPin } from '@tabler/icons-react';
import axios from 'utils/axios';
import { useDispatch } from 'react-redux';
import { openSnackbar } from 'store/slices/snackbar';
import { BOSFormDialog, BOSFormSection, BOSTextField, BOSAutocomplete } from 'ui-component/bos';
import ConfirmDeleteDialog from 'ui-component/ConfirmDeleteDialog';
import useBOSValidation from 'hooks/useBOSValidation';

// ==============================|| DIVISION - ADD/EDIT DIALOG (BOS SOP COMPLIANT) ||============================== //

// ─── Static Geo Data (Parity with Company Profile) ──────────────────────────
const COUNTRIES = ['India', 'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 'France', 'Singapore', 'UAE'];

const STATES_BY_COUNTRY = {
  India: [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa',
    'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala',
    'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland',
    'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
    'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi', 'Jammu & Kashmir', 'Ladakh'
  ],
  'United States': ['California', 'Texas', 'New York', 'Florida', 'Washington', 'Illinois', 'Pennsylvania', 'Ohio'],
  'United Kingdom': ['England', 'Scotland', 'Wales', 'Northern Ireland'],
  Canada: ['Ontario', 'Quebec', 'British Columbia', 'Alberta', 'Manitoba', 'Saskatchewan'],
  Australia: ['New South Wales', 'Victoria', 'Queensland', 'Western Australia', 'South Australia', 'Tasmania'],
  Germany: ['Bavaria', 'Berlin', 'Hamburg', 'Hesse', 'North Rhine-Westphalia', 'Saxony'],
  France: ['Île-de-France', 'Provence', 'Normandy', 'Brittany', 'Alsace'],
  Singapore: ['Central Region', 'East Region', 'North Region', 'North-East Region', 'West Region'],
  UAE: ['Abu Dhabi', 'Dubai', 'Sharjah', 'Ajman', 'Ras Al Khaimah', 'Fujairah', 'Umm Al Quwain'],
};

const STATE_CODES = {
  'Andhra Pradesh': 37, 'Arunachal Pradesh': 12, 'Assam': 18, 'Bihar': 10,
  'Chhattisgarh': 22, 'Goa': 30, 'Gujarat': 24, 'Haryana': 6, 'Himachal Pradesh': 2,
  'Jharkhand': 20, 'Karnataka': 29, 'Kerala': 32, 'Madhya Pradesh': 23,
  'Maharashtra': 27, 'Manipur': 14, 'Meghalaya': 17, 'Mizoram': 15, 'Nagaland': 13,
  'Odisha': 21, 'Punjab': 3, 'Rajasthan': 8, 'Sikkim': 11, 'Tamil Nadu': 33,
  'Telangana': 36, 'Tripura': 16, 'Uttar Pradesh': 9, 'Uttarakhand': 5,
  'West Bengal': 19, 'Delhi': 7, 'Jammu & Kashmir': 1, 'Ladakh': 38,
};

const CITIES_BY_STATE = {
  'Maharashtra': ['Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Aurangabad', 'Solapur', 'Kolhapur'],
  'Karnataka': ['Bengaluru', 'Mysuru', 'Hubli', 'Mangaluru', 'Belagavi', 'Dharwad'],
  'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Salem', 'Tiruchirappalli'],
  'Gujarat': ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Gandhinagar'],
  'Telangana': ['Hyderabad', 'Warangal', 'Nizamabad', 'Karimnagar', 'Khammam'],
  'Delhi': ['New Delhi', 'North Delhi', 'South Delhi', 'East Delhi', 'West Delhi'],
  'Rajasthan': ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Ajmer'],
  'Uttar Pradesh': ['Lucknow', 'Kanpur', 'Agra', 'Varanasi', 'Allahabad'],
  'West Bengal': ['Kolkata', 'Howrah', 'Durgapur', 'Asansol', 'Siliguri'],
  'Punjab': ['Chandigarh', 'Amritsar', 'Ludhiana', 'Jalandhar', 'Patiala'],
};

const DEFAULT_CITIES = ['City 1', 'City 2', 'City 3', 'City 4'];

const VALIDATION_RULES = [
  { field: 'companyId', label: 'Company', required: true },
  { field: 'divisionName', label: 'Division Name', required: true, maxLength: 100 },
  { field: 'address', label: 'Address Details', maxLength: 500 },
  { field: 'pincode', label: 'Postal / Zip Code', maxLength: 10 },
  { field: 'gstIn', label: 'GSTIN Registration No', maxLength: 15, pattern: /^[0-9A-Z]{15}$/, patternMessage: 'GSTIN must be exactly 15 uppercase alphanumeric characters' }
];

const INITIAL_STATE = {
  companyId: null,
  divisionName: '',
  description: '',
  address: '',
  city: '',
  state: '',
  stateCode: '',
  country: '',
  pincode: '',
  gstIn: '',
  sequenceNo: 0,
  status: true
};

const AddDivisionDialog = ({ open, handleClose, initialData, readOnly = false }) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { errors, validate, clearErrors } = useBOSValidation();

  const [formData, setFormData] = useState(INITIAL_STATE);
  const [isEditing, setIsEditing] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [companies, setCompanies] = useState([]);  // list of {id, companyName}

  const citiesForState = CITIES_BY_STATE[formData.state] || DEFAULT_CITIES;
  const statesForCountry = STATES_BY_COUNTRY[formData.country] || [];

  // ── Load company list once ────────────────────────────────────────────────
  useEffect(() => {
    axios.get('/api/company-profile/all')
      .then(res => {
        const list = Array.isArray(res.data) ? res.data : [];
        setCompanies(list.map(c => ({ id: c.id, label: c.companyName })));
      })
      .catch(() => {
        dispatch(openSnackbar({
          open: true, message: 'Could not load company list.',
          variant: 'alert', alert: { variant: 'filled' }, severity: 'warning', close: false
        }));
      });
  }, [dispatch]);

  // ── Initialize form data when dialog opens ───────────────────────────────
  useEffect(() => {
    clearErrors();
    if (initialData) {
      setFormData({
        id: initialData.id,
        companyId: initialData.companyId || null,
        divisionName: initialData.divisionName || '',
        description: initialData.description || '',
        address: initialData.address || '',
        city: initialData.city || '',
        state: initialData.state || '',
        stateCode: initialData.stateCode != null ? String(initialData.stateCode) : '',
        country: initialData.country || '',
        pincode: initialData.pincode || '',
        gstIn: initialData.gstIn || '',
        sequenceNo: initialData.sequenceNo || 0,
        status: initialData.status !== undefined ? initialData.status : true
      });
      setIsEditing(false);
    } else {
      setFormData(INITIAL_STATE);
      setIsEditing(!readOnly);
      if (!readOnly) fetchNextSeq();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData, open, readOnly]);

  // ── Fetch next sequence number ─────────────────────────────────────────────
  const fetchNextSeq = async () => {
    try {
      const seqRes = await axios.get('/api/admin/divisions/next-seq');
      setFormData(prev => ({ ...prev, sequenceNo: seqRes.data }));
    } catch (e) {
      console.error('Failed to fetch next sequence', e);
    }
  };

  // ── Field change handlers ─────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = { ...prev };
      if (name === 'gstIn') {
        updated[name] = value.toUpperCase();
      } else {
        updated[name] = value;
      }

      // Geo resolution logic identical to CompanyProfile cascades
      if (name === 'state' && STATE_CODES[value] !== undefined) {
        updated.stateCode = String(STATE_CODES[value]);
      }
      if (name === 'country') {
        updated.state = '';
        updated.city = '';
        updated.stateCode = '';
      }
      if (name === 'state') {
        updated.city = '';
      }
      return updated;
    });
  };

  const handleCompanyChange = (_event, selected) => {
    setFormData(prev => ({
      ...prev,
      companyId: selected ? selected.id : null
    }));
  };

  const handleClear = () => {
    setFormData(INITIAL_STATE);
    clearErrors();
    fetchNextSeq();
  };

  // ── Save ──────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!validate(formData, VALIDATION_RULES)) return;

    try {
      const payload = {
        ...formData,
        stateCode: formData.stateCode ? parseInt(formData.stateCode, 10) : null
      };

      if (formData.id) {
        await axios.put(`/api/admin/divisions/${formData.id}`, payload);
        dispatch(openSnackbar({
          open: true, message: 'Division updated successfully!',
          variant: 'alert', alert: { variant: 'filled' }, severity: 'success', close: false
        }));
      } else {
        await axios.post('/api/admin/divisions', payload);
        dispatch(openSnackbar({
          open: true, message: 'Division created successfully!',
          variant: 'alert', alert: { variant: 'filled' }, severity: 'success', close: false
        }));
      }
      handleClose(true);
    } catch (error) {
      console.error('Failed to save division:', error);
      dispatch(openSnackbar({
        open: true, message: 'Failed to save division.',
        variant: 'alert', alert: { variant: 'filled' }, severity: 'error', close: false
      }));
    }
  };

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDeleteConfirm = async () => {
    setDeleteOpen(false);
    try {
      await axios.delete(`/api/admin/divisions/${formData.id}`);
      dispatch(openSnackbar({
        open: true, message: 'Division deleted!',
        variant: 'alert', alert: { variant: 'filled' }, severity: 'success', close: false
      }));
      handleClose(true);
    } catch (error) {
      console.error('Failed to delete division:', error);
      dispatch(openSnackbar({
        open: true, message: 'Failed to delete division.',
        variant: 'alert', alert: { variant: 'filled' }, severity: 'error', close: false
      }));
    }
  };

  const isViewOnly = readOnly && !isEditing;
  const selectedCompany = companies.find(c => c.id === formData.companyId) || null;

  // Reusable Dropdown component bound to static/dynamic list configs
  const DropdownField = ({ name, label, options, disabled }) => (
    <Autocomplete
      fullWidth
      size="small"
      disabled={disabled}
      options={options}
      value={formData[name] || null}
      onChange={(event, newValue) => {
        handleChange({
          target: { name, value: newValue || '' }
        });
      }}
      isOptionEqualToValue={(option, value) => option === value || value === ""}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          error={!!errors[name]}
          helperText={errors[name]}
          placeholder={`Select ${label}...`}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              bgcolor: disabled ? 'action.hover' : 'background.paper',
              '&:hover fieldset': { borderColor: 'primary.main' }
            }
          }}
        />
      )}
    />
  );

  return (
    <>
      <BOSFormDialog
        open={open}
        onClose={() => handleClose()}
        onSave={handleSave}
        onDelete={() => setDeleteOpen(true)}
        onClear={handleClear}
        onEditClick={() => setIsEditing(true)}
        title={initialData ? 'Edit Division' : 'New Division'}
        isViewOnly={isViewOnly}
        hasId={!!formData.id}
        maxWidth="md"
      >
        {/* ── Section 1: Company Relationship ───────────────────────────── */}
        <BOSFormSection
          icon={<IconBuilding size={20} color={theme.palette.primary.main} />}
          title="Company Association"
        >
          <Autocomplete
            fullWidth
            size="small"
            disabled={isViewOnly}
            options={companies}
            value={selectedCompany}
            onChange={handleCompanyChange}
            isOptionEqualToValue={(option, value) => option.id === value?.id}
            getOptionLabel={(option) => option.label || ''}
            renderOption={(props, option) => (
              <Box component="li" {...props}>
                <IconBuilding size={16} style={{ marginRight: 8, opacity: 0.5 }} />
                <Typography variant="body2">{option.label}</Typography>
              </Box>
            )}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Company *"
                error={!!errors.companyId}
                helperText={errors.companyId || 'Select the company this division belongs to'}
                placeholder="Search company..."
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    bgcolor: isViewOnly ? 'action.hover' : 'background.paper',
                    '&:hover fieldset': { borderColor: 'primary.main' }
                  }
                }}
              />
            )}
          />
        </BOSFormSection>

        {/* ── Section 2: Division Details ────────────────────────────────── */}
        <BOSFormSection
          icon={<IconLayoutColumns size={20} color={theme.palette.primary.main} />}
          title="Division Details"
        >
          <BOSTextField
            name="divisionName"
            label="Division Name"
            value={formData.divisionName}
            onChange={handleChange}
            disabled={isViewOnly}
            required
            maxLength={100}
            error={!!errors.divisionName}
            helperText={errors.divisionName}
          />
          <BOSTextField
            name="description"
            label="Description"
            value={formData.description}
            onChange={handleChange}
            disabled={isViewOnly}
            maxLength={250}
            multiline
            rows={2}
          />
          <BOSTextField
            name="sequenceNo"
            label="Sequence No"
            type="number"
            value={formData.sequenceNo}
            onChange={handleChange}
            disabled={isViewOnly}
          />
          <BOSTextField
            select
            name="status"
            label="Status"
            value={formData.status}
            onChange={(e) => {
              const val = e.target.value;
              setFormData(prev => ({ ...prev, status: val === 'true' || val === true }));
            }}
            disabled={isViewOnly}
          >
            <MenuItem value={true}>Active</MenuItem>
            <MenuItem value={false}>Inactive</MenuItem>
          </BOSTextField>
        </BOSFormSection>

        {/* ── Section 3: Location & Tax Details ──────────────────────────── */}
        <BOSFormSection
          icon={<IconMapPin size={20} color={theme.palette.primary.main} />}
          title="Location & Tax Details"
        >
          <BOSTextField
            name="address"
            label="Address Details"
            value={formData.address}
            onChange={handleChange}
            disabled={isViewOnly}
            maxLength={500}
            multiline
            rows={2}
          />

          <Box sx={{ width: '100%', my: 0.5 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <DropdownField
                  name="country"
                  label="Country"
                  options={COUNTRIES}
                  disabled={isViewOnly}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <DropdownField
                  name="state"
                  label="State / Province"
                  options={statesForCountry}
                  disabled={isViewOnly || !formData.country}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <DropdownField
                  name="city"
                  label="City"
                  options={citiesForState}
                  disabled={isViewOnly || !formData.state}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="State Code"
                  value={formData.stateCode}
                  InputProps={{ readOnly: true }}
                  disabled={isViewOnly}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      bgcolor: 'action.hover'
                    }
                  }}
                />
              </Grid>
            </Grid>
          </Box>

          <BOSTextField
            name="pincode"
            label="Postal / Zip Code"
            value={formData.pincode}
            onChange={handleChange}
            disabled={isViewOnly}
            maxLength={10}
          />
          <BOSTextField
            name="gstIn"
            label="GSTIN Registration No"
            value={formData.gstIn}
            onChange={handleChange}
            disabled={isViewOnly}
            maxLength={15}
            error={!!errors.gstIn}
            helperText={errors.gstIn}
          />
        </BOSFormSection>
      </BOSFormDialog>

      <ConfirmDeleteDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Division"
        message="Are you sure you want to delete this division? This action cannot be undone."
        itemName={formData.divisionName}
      />
    </>
  );
};

AddDivisionDialog.propTypes = {
  open: PropTypes.bool,
  handleClose: PropTypes.func,
  initialData: PropTypes.object,
  readOnly: PropTypes.bool
};

export default AddDivisionDialog;
