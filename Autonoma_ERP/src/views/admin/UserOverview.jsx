import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

// material-ui
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Chip,
  IconButton,
  Stack,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  InputLabel,
  OutlinedInput,
  FormHelperText,
  Select,
  MenuItem,
  InputAdornment,
  Box
} from '@mui/material';

// third party
import * as Yup from 'yup';
import { Formik } from 'formik';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import AnimateButton from 'ui-component/extended/AnimateButton';
import CustomFormControl from 'ui-component/extended/Form/CustomFormControl';
import axios from 'utils/axios';
import { openSnackbar } from 'store/slices/snackbar';

// assets
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

// ==============================|| ADMIN - USER OVERVIEW ||============================== //

const UserOverview = () => {
  const dispatch = useDispatch();
  const [users, setUsers] = useState([]);
  const [open, setOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const query = useSelector((state) => state.search.query);

  const getErrorMessage = (err) => {
    if (typeof err === 'string') return err;
    return err?.message || err?.error || err?.detail || JSON.stringify(err) || 'An unexpected error occurred';
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/api/users/all');
      setUsers(response.data);
    } catch (err) {
      console.error('Failed to fetch users:', err);
      dispatch(
        openSnackbar({
          open: true,
          message: getErrorMessage(err) || 'Failed to fetch users',
          variant: 'alert',
          severity: 'error',
          close: false
        })
      );
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setShowPassword(false);
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await axios.delete(`/api/users/${id}`);
        dispatch(
          openSnackbar({
            open: true,
            message: 'User deleted successfully',
            variant: 'alert',
            severity: 'success',
            close: false
          })
        );
        fetchUsers();
      } catch (err) {
        console.error('Delete failed:', err);
        dispatch(
          openSnackbar({
            open: true,
            message: getErrorMessage(err) || 'Delete failed',
            variant: 'alert',
            severity: 'error',
            close: false
          })
        );
      }
    }
  };

  // Filter users based on global search query
  const filteredUsers = users.filter((user) => {
    const searchStr = (user.userId + ' ' + user.empId).toLowerCase();
    return searchStr.includes(query.toLowerCase());
  });

  return (
    <MainCard
      title="User Overview"
      secondary={
        <AnimateButton>
          <Button variant="contained" color="secondary" onClick={handleClickOpen}>
            + New
          </Button>
        </AnimateButton>
      }
    >
      <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
        <Table sx={{ minWidth: 650 }} aria-label="user table">
          <TableHead>
            <TableRow>
              <TableCell>User ID</TableCell>
              <TableCell>Employee ID</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((row) => (
                <TableRow key={row.userId} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell component="th" scope="row">
                    <Typography variant="subtitle1">{row.userId}</Typography>
                  </TableCell>
                  <TableCell>{row.empId}</TableCell>
                  <TableCell>
                    <Chip
                      label={row.status === 1 ? 'Active' : 'Inactive'}
                      size="small"
                      color={row.status === 1 ? 'success' : 'error'}
                      sx={{ textTransform: 'capitalize' }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <IconButton color="primary" size="small">
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton color="error" size="small" onClick={() => handleDelete(row.userId)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  <Typography variant="subtitle1" sx={{ py: 3 }}>
                    No users found
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add User Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Create New User</DialogTitle>
        <Formik
          initialValues={{
            userId: '',
            empId: '',
            password: '',
            status: 1,
            submit: null
          }}
          validationSchema={Yup.object().shape({
            userId: Yup.string().max(50).required('User ID is required'),
            empId: Yup.number().typeError('Employee ID must be a number').required('Employee ID is required'),
            password: Yup.string().max(255).required('Password is required'),
            status: Yup.number().required('Status is required')
          })}
          onSubmit={async (values, { setErrors, setStatus, setSubmitting }) => {
            try {
              await axios.post('/api/users/create', {
                userId: values.userId,
                empId: parseInt(values.empId),
                password: values.password,
                status: parseInt(values.status)
              });

              dispatch(
                openSnackbar({
                  open: true,
                  message: 'User created successfully',
                  variant: 'alert',
                  severity: 'success',
                  close: false
                })
              );
              handleClose();
              fetchUsers();
            } catch (err) {
              console.error('Create user failed:', err);
              setStatus({ success: false });
              const errorMessage = getErrorMessage(err) || 'Failed to create user';
              setErrors({ submit: errorMessage });
              dispatch(
                openSnackbar({
                  open: true,
                  message: errorMessage,
                  variant: 'alert',
                  severity: 'error',
                  close: false
                })
              );
              setSubmitting(false);
            }
          }}
        >
          {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values }) => (
            <form noValidate onSubmit={handleSubmit}>
              <DialogContent>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <CustomFormControl fullWidth error={Boolean(touched.userId && errors.userId)}>
                      <InputLabel htmlFor="user-userId">User ID</InputLabel>
                      <OutlinedInput
                        id="user-userId"
                        type="text"
                        value={values.userId}
                        name="userId"
                        onBlur={handleBlur}
                        onChange={handleChange}
                        label="User ID"
                      />
                      {touched.userId && errors.userId && (
                        <FormHelperText error id="helper-text-user-userId">
                          {errors.userId}
                        </FormHelperText>
                      )}
                    </CustomFormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <CustomFormControl fullWidth error={Boolean(touched.empId && errors.empId)}>
                      <InputLabel htmlFor="user-empId">Employee ID (Numeric)</InputLabel>
                      <OutlinedInput
                        id="user-empId"
                        type="number"
                        value={values.empId}
                        name="empId"
                        onBlur={handleBlur}
                        onChange={handleChange}
                        label="Employee ID (Numeric)"
                        placeholder="e.g. 1001"
                      />
                      <FormHelperText>Must be a numeric value</FormHelperText>
                      {touched.empId && errors.empId && (
                        <FormHelperText error id="helper-text-user-empId">
                          {errors.empId}
                        </FormHelperText>
                      )}
                    </CustomFormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <CustomFormControl fullWidth error={Boolean(touched.password && errors.password)}>
                      <InputLabel htmlFor="user-password">Password</InputLabel>
                      <OutlinedInput
                        id="user-password"
                        type={showPassword ? 'text' : 'password'}
                        value={values.password}
                        name="password"
                        onBlur={handleBlur}
                        onChange={handleChange}
                        endAdornment={
                          <InputAdornment position="end">
                            <IconButton aria-label="toggle password visibility" onClick={handleClickShowPassword} edge="end" size="large">
                              {showPassword ? <Visibility /> : <VisibilityOff />}
                            </IconButton>
                          </InputAdornment>
                        }
                        label="Password"
                      />
                      {touched.password && errors.password && (
                        <FormHelperText error id="helper-text-user-password">
                          {errors.password}
                        </FormHelperText>
                      )}
                    </CustomFormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <CustomFormControl fullWidth error={Boolean(touched.status && errors.status)}>
                      <InputLabel htmlFor="user-status">Status</InputLabel>
                      <Select
                        id="user-status"
                        value={values.status}
                        name="status"
                        onBlur={handleBlur}
                        onChange={handleChange}
                        label="Status"
                      >
                        <MenuItem value={1}>Active</MenuItem>
                        <MenuItem value={0}>Inactive</MenuItem>
                      </Select>
                      {touched.status && errors.status && (
                        <FormHelperText error id="helper-text-user-status">
                          {errors.status}
                        </FormHelperText>
                      )}
                    </CustomFormControl>
                  </Grid>
                  {errors.submit && (
                    <Grid item xs={12}>
                      <FormHelperText error>{errors.submit}</FormHelperText>
                    </Grid>
                  )}
                </Grid>
              </DialogContent>
              <DialogActions sx={{ p: 3 }}>
                <Button onClick={handleClose} color="error">
                  Cancel
                </Button>
                <AnimateButton>
                  <Button disableElevation disabled={isSubmitting} type="submit" variant="contained" color="secondary">
                    Create User
                  </Button>
                </AnimateButton>
              </DialogActions>
            </form>
          )}
        </Formik>
      </Dialog>
    </MainCard>
  );
};

export default UserOverview;
