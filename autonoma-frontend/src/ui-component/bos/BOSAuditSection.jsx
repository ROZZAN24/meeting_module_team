import TextField from 'ui-component/CustomTextField';
import React from 'react';
import PropTypes from 'prop-types';
import { Grid, InputAdornment } from '@mui/material';
import { IconUser, IconCalendar } from '@tabler/icons-react';
import useAuth from 'hooks/useAuth';
import BOSFormSection from './BOSFormSection';

/**
 * BOSAuditSection — Displays system audit fields (Created By, Created Date, Updated By, Updated Date)
 * in the same order as Employee Master.
 * All fields are read-only and automatically populated.
 */
export default function BOSAuditSection({ initialData, isCreate = false }) {
  const { user } = useAuth();

  // Helper to extract value from initialData
  const getVal = (fields) => {
    if (!initialData) return '';
    for (const f of fields) {
      if (initialData[f] !== undefined && initialData[f] !== null) {
        return initialData[f];
      }
    }
    return '';
  };

  const formatDateString = (d) => {
    if (!d) return '';
    try {
      const dateObj = new Date(d);
      if (isNaN(dateObj.getTime())) return String(d);
      const day = String(dateObj.getDate()).padStart(2, '0');
      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
      const year = dateObj.getFullYear();
      const hours = String(dateObj.getHours()).padStart(2, '0');
      const minutes = String(dateObj.getMinutes()).padStart(2, '0');
      return `${day}/${month}/${year} ${hours}:${minutes}`;
    } catch {
      return '';
    }
  };

  const createdByUser = isCreate 
    ? (user?.name || user?.username || user?.empId || 'SYSTEM')
    : getVal(['createdUser', 'createdBy', 'created_by']);

  const createdDateVal = isCreate
    ? formatDateString(new Date())
    : (() => {
        const d = getVal(['createdDate', 'createdAt', 'created_at']);
        return d ? formatDateString(d) : '';
      })();

  const updatedByUser = isCreate
    ? ''
    : getVal(['updatedUser', 'updatedBy', 'updated_by']);

  const updatedDateVal = isCreate
    ? ''
    : (() => {
        const d = getVal(['updatedDate', 'updatedAt', 'updated_at']);
        return d ? formatDateString(d) : '';
      })();

  return (
    <BOSFormSection title="System Audit Details">
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            label="Created By"
            value={createdByUser}
            fullWidth
            size="small"
            InputProps={{
              readOnly: true,
              startAdornment: (
                <InputAdornment position="start">
                  <IconUser size={18} opacity={0.5} />
                </InputAdornment>
              )
            }}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: 'action.hover' } }}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            label="Created Date"
            value={createdDateVal}
            fullWidth
            size="small"
            InputProps={{
              readOnly: true,
              startAdornment: (
                <InputAdornment position="start">
                  <IconCalendar size={18} opacity={0.5} />
                </InputAdornment>
              )
            }}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: 'action.hover' } }}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            label="Updated By"
            value={updatedByUser}
            fullWidth
            size="small"
            InputProps={{
              readOnly: true,
              startAdornment: (
                <InputAdornment position="start">
                  <IconUser size={18} opacity={0.5} />
                </InputAdornment>
              )
            }}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: 'action.hover' } }}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            label="Updated Date"
            value={updatedDateVal}
            fullWidth
            size="small"
            InputProps={{
              readOnly: true,
              startAdornment: (
                <InputAdornment position="start">
                  <IconCalendar size={18} opacity={0.5} />
                </InputAdornment>
              )
            }}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: 'action.hover' } }}
          />
        </Grid>
      </Grid>
    </BOSFormSection>
  );
}

BOSAuditSection.propTypes = {
  initialData: PropTypes.object,
  isCreate: PropTypes.bool
};
