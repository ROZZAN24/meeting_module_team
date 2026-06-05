import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Stack, Typography, Chip, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Paper, Checkbox
} from '@mui/material';
import { BOSFormDialog, BOSAutocomplete, BOSDatePicker } from 'ui-component/bos';
import useLookups from 'hooks/useLookups';
import { useDispatch } from 'react-redux';
import { openSnackbar } from 'store/slices/snackbar';
import axios from 'utils/axios';
import { API_PATHS } from 'utils/api-constants';

const ReassignDialog = ({ open, onClose, item, onConfirm }) => {
  const dispatch = useDispatch();
  const { employees = [] } = useLookups(['EMPLOYEES']);
  const [selectedRows, setSelectedRows] = useState([]);
  const [assignBy, setAssignBy] = useState(null);
  const [assignTo, setAssignTo] = useState(null);
  const [targetDate, setTargetDate] = useState('');
  const [details, setDetails] = useState([]);

  useEffect(() => {
    if (open && item) {
      // Load MOM transaction details for the parent MOM
      const mom = item._mom;
      if (mom && mom.details) {
        setDetails(mom.details.filter(d => d.processType === 'ACTION' && d.status !== 'CLOSED' && d.status !== 'CANCELLED'));
      } else if (item.discussedPoint) {
        setDetails([item]);
      }
      setSelectedRows([]);
      setAssignBy(null);
      setAssignTo(null);
      setTargetDate('');
    }
  }, [open, item]);

  const handleToggle = (id) => {
    setSelectedRows(prev =>
      prev.includes(id) ? prev.filter(rId => rId !== id) : [...prev, id]
    );
  };

  const handleConfirm = async () => {
    if (selectedRows.length === 0) {
      dispatch(openSnackbar({ open: true, message: 'Please select at least one action item', variant: 'alert', severity: 'warning' }));
      return;
    }
    if (!assignBy || !assignTo || !targetDate) {
      dispatch(openSnackbar({ open: true, message: 'Please fill in all mandatory fields', variant: 'alert', severity: 'warning' }));
      return;
    }

    try {
      await axios.post(API_PATHS.REASSIGN_MM_DETAILS, {
        detailIds: selectedRows,
        assignById: assignBy.id,
        assignToId: assignTo.id,
        targetDate
      });
      dispatch(openSnackbar({ open: true, message: 'Updated Successfully...', variant: 'alert', severity: 'success' }));
      onConfirm();
    } catch (error) {
      dispatch(openSnackbar({ open: true, message: 'Failed to reassign', variant: 'alert', severity: 'error' }));
    }
  };

  const getStatusColor = (status) => {
    if (status === 'OPEN') return 'warning';
    if (status === 'CLOSED') return 'success';
    if (status === 'PENDING FOR APPROVAL') return 'info';
    return 'default';
  };

  return (
    <BOSFormDialog
      open={open}
      onClose={onClose}
      onSave={handleConfirm}
      title="Reassign Meeting Minutes"
      maxWidth="lg"
    >
      <Stack spacing={3} sx={{ mt: 1 }}>
        {/* Detail rows table */}
        <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 350 }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">#</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Min No</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Discussed Point</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Process</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Assigned To</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Assigned By</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Target Date</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {details.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Typography variant="body2" color="text.secondary">No ACTION items found</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                details.map((d, idx) => (
                  <TableRow
                    key={d.id || idx}
                    hover
                    selected={selectedRows.includes(d.id)}
                    onClick={() => handleToggle(d.id)}
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox checked={selectedRows.includes(d.id)} size="small" />
                    </TableCell>
                    <TableCell>{item?._momNo || '-'}</TableCell>
                    <TableCell sx={{ maxWidth: 350, whiteSpace: 'normal' }}>{d.discussedPoint || '-'}</TableCell>
                    <TableCell>{d.processType || '-'}</TableCell>
                    <TableCell>{d.assignedTo?.employeeName || '-'}</TableCell>
                    <TableCell>{d.assignedBy?.employeeName || '-'}</TableCell>
                    <TableCell>{d.targetDate || '-'}</TableCell>
                    <TableCell>
                      <Chip label={d.status} size="small" color={getStatusColor(d.status)} variant="outlined" />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Reassign fields */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <BOSAutocomplete
            options={employees}
            getOptionLabel={(option) => option.employeeName || ''}
            value={assignBy}
            onChange={(val) => setAssignBy(val)}
            label="Assign By"
            placeholder="Select Assignor"
            required
          />
          <BOSAutocomplete
            options={employees}
            getOptionLabel={(option) => option.employeeName || ''}
            value={assignTo}
            onChange={(val) => setAssignTo(val)}
            label="Assign To"
            placeholder="Select Assignee"
            required
          />
          <BOSDatePicker
            name="targetDate"
            label="Target Date"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
            required
          />
        </Stack>
      </Stack>
    </BOSFormDialog>
  );
};

ReassignDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  item: PropTypes.object,
  onConfirm: PropTypes.func.isRequired
};

export default ReassignDialog;
