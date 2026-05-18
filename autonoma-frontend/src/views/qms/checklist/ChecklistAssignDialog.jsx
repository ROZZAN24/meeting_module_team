import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  Typography,
  MenuItem,
  Box,
  Chip
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { IconUserPlus, IconUsersGroup, IconEdit } from '@tabler/icons-react';
import axios from 'utils/axios';
import { useDispatch } from 'react-redux';
import { openSnackbar } from 'store/slices/snackbar';
import { API_PATHS } from 'utils/api-constants';
import useLookups from 'hooks/useLookups';
import { BOSDataTable, BOSTextField, btnSave, btnCancel, getStatusChipSx } from 'ui-component/bos';
import ConfirmDeleteDialog from 'ui-component/ConfirmDeleteDialog';

export default function ChecklistAssignDialog({ open, onClose, checklistId, initialData }) {
  const theme = useTheme();
  const dispatch = useDispatch();
  const lookups = useLookups(['EMPLOYEES', 'DEPARTMENTS']);
  
  // Get allowed department names for this checklist
  const allowedDeptNames = (initialData?.departments || []).map(d => d.departmentName);
  
  // Filter employees whose department matches one of the checklist's departments
  const filteredEmployees = (lookups.employees || []).filter(emp => {
    if (!allowedDeptNames.length) return true; // If no departments specified, show all (fallback)
    const empDept = (lookups.departments || []).find(d => String(d.id) === String(emp.departmentId));
    return empDept && allowedDeptNames.includes(empDept.departmentName);
  });

  const employeeOptions = filteredEmployees.map(e => ({
    label: `${e.employeeName || (e.firstName + ' ' + e.lastName)} (${(lookups.departments || []).find(d => String(d.id) === String(e.departmentId))?.departmentName || 'No Dept'})${e.status !== 'Active' ? ' - INACTIVE' : ''}`,
    value: e.employeeName || (e.firstName + ' ' + e.lastName),
    status: e.status
  }));

  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);
<<<<<<< HEAD
  const [selectedRowId, setSelectedRowId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    assignTo: '',
    assignType: '',
=======
  const [formData, setFormData] = useState({
    assignTo: '',
    assignType: 'PRIMARY',
>>>>>>> origin/main
    id: null
  });

  useEffect(() => {
    if (open && checklistId) {
      fetchAssignments();
<<<<<<< HEAD
      setSelectedRowId(null);
      setIsEditing(false);
    } else {
      setAssignments([]);
      setFormData({ assignTo: '', assignType: '', id: null });
      setSelectedRowId(null);
      setIsEditing(false);
=======
    } else {
      setAssignments([]);
      setFormData({ assignTo: '', assignType: 'PRIMARY', id: null });
>>>>>>> origin/main
    }
  }, [open, checklistId]);

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      // Reusing the assignments API, filtered by this checklist's category/seqNo if needed, 
      // or we can just fetch all and filter client side.
      // A better way is to add an endpoint or just fetch the checklist with assignments.
      // For now, we will fetch assignments and filter by seqNo
      const res = await axios.get(`${API_PATHS.QMS.CHECKLIST}/assignments?size=100&searchBy=checklist.seqNo&searchValue=${initialData?.seqNo}`);
<<<<<<< HEAD
      const list = res.data.content || [];
      setAssignments(list);
      setFormData({ assignTo: '', assignType: '', id: null });
=======
      setAssignments(res.data.content || []);
>>>>>>> origin/main
    } catch (error) {
      console.error('Failed to fetch assignments', error);
    } finally {
      setLoading(false);
    }
  };
<<<<<<< HEAD
  
=======

>>>>>>> origin/main
  const handleAssign = async () => {
    if (!formData.assignTo || !formData.assignType) {
      dispatch(openSnackbar({ open: true, message: 'Please select Assign To and Assign Type', severity: 'warning', variant: 'alert' }));
      return;
    }

    // Frontend duplicate check to avoid console errors
    const isDuplicate = assignments.some(a => a.assignedTo === formData.assignTo);
    if (isDuplicate && !formData.id) {
      dispatch(openSnackbar({ 
        open: true, 
        message: 'Duplicate assignment for this person!', 
        severity: 'error', 
        variant: 'alert' 
      }));
      return;
    }
    
    try {
      const res = await axios.post(`${API_PATHS.QMS.CHECKLIST}/assign`, {
        id: formData.id,
        checklistId: checklistId,
        assignedTo: formData.assignTo,
        assignType: formData.assignType,
        assignedBy: 'Current User' // TODO: Get from auth context
      });

      if (res.data?.remarks === 'DUPLICATE_ASSIGNMENT') {
        dispatch(openSnackbar({ 
          open: true, 
          message: 'Duplicate assignment for this person!', 
          severity: 'error', 
          variant: 'alert' 
        }));
        return;
      }

      dispatch(openSnackbar({ open: true, message: formData.id ? 'Assignment updated!' : 'Task assigned!', severity: 'success', variant: 'alert' }));
<<<<<<< HEAD
      setFormData({ assignTo: '', assignType: '', id: null });
      setSelectedRowId(null);
      setIsEditing(false);
=======
      setFormData({ assignTo: '', assignType: 'PRIMARY', id: null });
>>>>>>> origin/main
      fetchAssignments();
    } catch (err) {
      dispatch(openSnackbar({ 
        open: true, 
        message: 'Assignment failed', 
        severity: 'error', 
        variant: 'alert' 
      }));
    }
  };

  const columns = [
    { id: 'seqNo', label: 'Seq No', minWidth: 80 },
    { id: 'checkingPoint', label: 'Checking Point', minWidth: 150 },
    { id: 'frequency', label: 'Frequency', minWidth: 100 },
    { id: 'level', label: 'Level', minWidth: 100 },
    { id: 'department', label: 'Department', minWidth: 120 },
    { id: 'assignTo', label: 'Assign To', minWidth: 120 },
    { id: 'assignType', label: 'Assign Type', minWidth: 100 },
    { id: 'assignDate', label: 'Assign Date', minWidth: 100 },
    { id: 'assignedBy', label: 'Created By', minWidth: 100 },
<<<<<<< HEAD
    { id: 'modifiedBy', label: 'Modified By', minWidth: 100 },
=======
>>>>>>> origin/main
    { id: 'status', label: 'Status', minWidth: 100 }
  ];

  const rows = assignments.map(a => ({
    id: a.id,
    seqNo: a.checklist?.seqNo || '-',
    checkingPoint: a.checklist?.checkingPoint || '-',
    frequency: a.checklist?.frequency || '-',
    level: a.checklist?.levelIds || '-',
    department: (a.checklist?.departments || []).map(d => d.departmentName).join(', ') || '-',
    assignTo: a.assignedTo,
    assignType: a.assignType || 'PRIMARY',
    assignDate: a.assignedDate ? new Date(a.assignedDate).toLocaleDateString() : '-',
    assignedBy: a.assignedBy || '-',
<<<<<<< HEAD
    modifiedBy: '-',
=======
>>>>>>> origin/main
    status: a.status?.name || 'ACTIVE'
  }));

  const handleEditAssignment = (row) => {
    setFormData({
      assignTo: row.assignTo,
      assignType: row.assignType,
      id: row.id
    });
  };

<<<<<<< HEAD
  const handleReAssignClick = () => {
    const selectedRow = rows.find(r => r.id === selectedRowId);
    if (selectedRow) {
      handleEditAssignment(selectedRow);
      setIsEditing(true);
      dispatch(openSnackbar({ open: true, message: `Loaded assignment for ${selectedRow.assignTo}. Update fields above.`, severity: 'info', variant: 'alert' }));
    }
  };

  const handleInActiveClick = () => {
    if (selectedRowId) {
      setSelectedAssignmentId(selectedRowId);
      setDeleteDialogOpen(true);
    }
  };

=======
>>>>>>> origin/main
  const handleDeleteAssignment = async () => {
    if (!selectedAssignmentId) return;
    try {
      await axios.delete(`${API_PATHS.QMS.CHECKLIST}/assignment/${selectedAssignmentId}`);
      dispatch(openSnackbar({ open: true, message: 'Assignment removed', severity: 'success', variant: 'alert' }));
      fetchAssignments();
      setDeleteDialogOpen(false);
      setSelectedAssignmentId(null);
<<<<<<< HEAD
      setSelectedRowId(null);
=======
>>>>>>> origin/main
    } catch (err) {
      dispatch(openSnackbar({ open: true, message: 'Delete failed', severity: 'error', variant: 'alert' }));
    }
  };

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState(null);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle component="div" sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: theme.palette.primary.light, color: theme.palette.primary.dark }}>
        <IconUsersGroup size={24} />
        <Typography component="span" variant="h3" color="inherit">Assign Checklist - {initialData?.seqNo}</Typography>
      </DialogTitle>
      <DialogContent sx={{ p: 3, pt: '24px !important' }}>
        <Stack spacing={3}>
          {/* Assignment Form */}
          <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2, bgcolor: '#fafafa' }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr 1fr' }, gap: 2, alignItems: 'center' }}>
              <BOSTextField label="Checking Point" value={initialData?.checkingPoint || ''} disabled />
              <BOSTextField label="Department" value={(initialData?.departments || []).map((d) => d.departmentName).join(', ')} disabled />
              <BOSTextField label="Level" value={initialData?.levelIds || ''} disabled />
              <BOSTextField label="Frequency" value={initialData?.frequency || ''} disabled />
              
              <BOSTextField
                select
                label="Assign To"
                value={formData.assignTo}
                onChange={(e) => setFormData(p => ({ ...p, assignTo: e.target.value }))}
                required
              >
                {employeeOptions.map(opt => (
                  <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                ))}
              </BOSTextField>

              <BOSTextField
                select
                label="Assign Type"
                value={formData.assignType}
                onChange={(e) => setFormData(p => ({ ...p, assignType: e.target.value }))}
                required
              >
<<<<<<< HEAD
                <MenuItem value="">-Select-</MenuItem>
                <MenuItem value="PRIMARY">PRIMARY</MenuItem>
                <MenuItem value="SECONDARY">SECONDARY</MenuItem>
                <MenuItem value="TERTIARY">TERTIARY</MenuItem>
=======
                <MenuItem value="PRIMARY">PRIMARY</MenuItem>
                <MenuItem value="SECONDARY">SECONDARY</MenuItem>
>>>>>>> origin/main
              </BOSTextField>

              <Button 
                variant="contained" 
                color="primary" 
                startIcon={<IconUserPlus size={18} />} 
                onClick={handleAssign}
                sx={{ height: 40, mt: 2 }}
              >
<<<<<<< HEAD
                Update
=======
                {formData.id ? 'Update' : 'Assign'}
>>>>>>> origin/main
              </Button>
            </Box>
          </Box>

          {/* Assignments Table */}
          <Typography variant="h4" sx={{ mb: -1 }}>Existing Assignments</Typography>
          <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
            <BOSDataTable
              columns={columns}
              rows={rows}
              loading={loading}
              page={0}
<<<<<<< HEAD
              size={10}
              onPageChange={() => {}}
              onSizeChange={() => {}}
              onClickRow={(row) => setSelectedRowId(row.id)}
              selectedRowId={selectedRowId}
              showActions={false}
=======
              size={100}
              onPageChange={() => {}}
              onSizeChange={() => {}}
              onEditRow={handleEditAssignment}
              onDeleteRow={(row) => {
                setSelectedAssignmentId(row.id);
                setDeleteDialogOpen(true);
              }}
              showActions={true}
>>>>>>> origin/main
              renderCell={(col, row) => {
                if (col.id === 'status') return <Chip label={row.status} size="small" sx={getStatusChipSx(row.status === 'ACTIVE' || row.status === 'Started' ? 'ACTIVE' : 'INACTIVE')} />;
                return row[col.id];
              }}
            />
          </Box>
<<<<<<< HEAD

          {/* Control Actions */}
          <Stack direction="row" spacing={2} justifyContent="flex-start" sx={{ pt: 1 }}>
            <Button
              variant="contained"
              color="secondary"
              onClick={handleReAssignClick}
              disabled={!selectedRowId}
              sx={{ borderRadius: '8px', fontWeight: 600 }}
            >
              ReAssign
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={handleInActiveClick}
              disabled={!selectedRowId}
              sx={{ borderRadius: '8px', fontWeight: 600 }}
            >
              InActive
            </Button>
          </Stack>
=======
>>>>>>> origin/main
        </Stack>

        <ConfirmDeleteDialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          onConfirm={handleDeleteAssignment}
          title="Remove Assignment"
          message="Are you sure you want to remove this employee assignment? This action cannot be undone."
          itemName={assignments.find(a => a.id === selectedAssignmentId)?.assignedTo || 'Assignment'}
        />
      </DialogContent>
      <DialogActions sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
        <Button onClick={onClose} sx={btnCancel}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}

ChecklistAssignDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  checklistId: PropTypes.number,
  initialData: PropTypes.object
};
