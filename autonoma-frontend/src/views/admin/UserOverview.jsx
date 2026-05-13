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
  TablePagination,
  Box,
  Avatar,
  Tooltip,
  Autocomplete,
  TextField
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

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
import { IconPhoto, IconShieldLock, IconTrash, IconPencil, IconX } from '@tabler/icons-react';

const API_BASE = (import.meta.env.VITE_APP_API_URL || 'http://localhost:8081').replace(/\/+$/, '');

// ==============================|| ADMIN - USER OVERVIEW ||============================== //

const UserOverview = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const [users, setUsers] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [employeeMap, setEmployeeMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const query = useSelector((state) => state.search.query);

  const getErrorMessage = (err) => {
    if (typeof err === 'string') return err;
    return err?.message || err?.error || err?.detail || JSON.stringify(err) || 'An unexpected error occurred';
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    if (employees.length > 0) return; // Already loaded
    try {
      const response = await axios.get('/api/master/employee');
      const data = response.data;
      setEmployees(data);
      
      // Build an O(1) lookup map for names
      const map = {};
      data.forEach(emp => {
        map[emp.id] = emp;
      });
      setEmployeeMap(map);
    } catch (err) {
      console.error('Failed to fetch employees:', err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleClickOpen = () => {
    setOpen(true);
    fetchEmployees(); // Load employees only when dialog opens
  };

  const handleClose = () => {
    setOpen(false);
    setEditingUser(null);
    setShowPassword(false);
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setOpen(true);
    fetchEmployees(); // Ensure employees are loaded for the selection
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
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
    const searchString = query?.toLowerCase() || '';
    return (
      user.userId?.toLowerCase().includes(searchString) ||
      user.empId?.toString().includes(searchString) ||
      employeeMap[user.empId]?.employeeName?.toLowerCase().includes(searchString)
    );
  });

  const paginatedUsers = filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <MainCard
      title="User Credential"
      secondary={
        <AnimateButton>
          <Button variant="contained" color="secondary" onClick={handleClickOpen}>
            + New
          </Button>
        </AnimateButton>
      }
    >
      <TableContainer component={Paper} sx={{ boxShadow: 'none', borderRadius: 0, border: '1px solid', borderColor: 'divider' }}>
        <Table sx={{ minWidth: 650 }} aria-label="user table">
          <TableHead sx={{ bgcolor: 'grey.50' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>User</TableCell>
              <TableCell sx={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>Details</TableCell>
              <TableCell sx={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>Status</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                  Loading users...
                </TableCell>
              </TableRow>
            ) : paginatedUsers.length > 0 ? (
              paginatedUsers.map((row) => (
                <TableRow
                  key={row.userId}
                  sx={{
                    '&:last-child td, &:last-child th': { border: 0 },
                    '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.02)' }
                  }}
                >
                  <TableCell component="th" scope="row">
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Tooltip
                        title={
                          row.imgName ? (
                            <Paper elevation={12} sx={{ p: 0.5, bgcolor: 'background.paper', borderRadius: 2 }}>
                              <img
                                src={`${API_BASE}/api/users/image/${row.imgName}`}
                                alt="Profile"
                                style={{ maxWidth: 200, maxHeight: 200, borderRadius: 4, display: 'block' }}
                              />
                            </Paper>
                          ) : null
                        }
                        arrow
                      >
                        <Avatar
                          src={row.imgName ? `${API_BASE}/api/users/image/${row.imgName}` : ''}
                          sx={{
                            width: 40,
                            height: 40,
                            bgcolor: 'secondary.light',
                            border: '2px solid white',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                          }}
                        >
                          {row.userId.charAt(0).toUpperCase()}
                        </Avatar>
                      </Tooltip>
                      <Box>
                        <Typography variant="subtitle1" fontWeight={700} sx={{ lineHeight: 1.2 }}>
                          {row.userId}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          ID: {row.userId.toUpperCase()}
                        </Typography>
                      </Box>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight={600} color="primary">
                        {employeeMap[row.empId]?.employeeName || `ID: ${row.empId}`}
                      </Typography>
                      <Typography variant="caption" color="textSecondary" sx={{ display: 'block' }}>
                        {employeeMap[row.empId]?.empCode || 'No Code'}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={row.status === 1 ? 'ACTIVE' : 'INACTIVE'}
                      size="small"
                      sx={{
                        fontWeight: 800,
                        fontSize: '0.65rem',
                        height: 20,
                        borderRadius: '4px',
                        bgcolor: row.status === 1 ? 'success.light' : 'error.light',
                        color: row.status === 1 ? 'success.dark' : 'error.dark'
                      }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <IconButton
                        color="secondary"
                        size="small"
                        onClick={() => handleEdit(row)}
                        sx={{
                          bgcolor: 'secondary.light',
                          '&:hover': { bgcolor: 'secondary.main', color: 'white' }
                        }}
                      >
                        <IconPencil size={18} />
                      </IconButton>
                      <IconButton
                        color="error"
                        size="small"
                        onClick={() => handleDelete(row.userId)}
                        sx={{
                          bgcolor: 'error.light',
                          '&:hover': { bgcolor: 'error.main', color: 'white' }
                        }}
                      >
                        <IconTrash size={18} />
                      </IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  <Stack spacing={1} alignItems="center" sx={{ py: 5 }}>
                    <IconShieldLock size={48} color="#ccc" />
                    <Typography variant="h5" color="textSecondary">
                      No users found
                    </Typography>
                  </Stack>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50]}
        component="div"
        count={filteredUsers.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        sx={{
          borderTop: '1px solid',
          borderColor: 'divider',
          '.MuiTablePagination-toolbar': {
            minHeight: 60
          }
        }}
      />

      {/* Add User Dialog */}
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '24px',
            boxShadow: '0 24px 48px rgba(0,0,0,0.15)',
            overflow: 'hidden',
            border: '1px solid',
            borderColor: 'divider'
          }
        }}
      >
        <DialogTitle sx={{
          p: 0,
          position: 'relative',
          overflow: 'hidden',
          background: `linear-gradient(135deg, ${theme.palette.secondary.dark} 0%, ${theme.palette.secondary.main} 100%)`,
        }}>
          <Box sx={{
            p: 4,
            pb: 8, // More padding for overlap
            color: 'white',
            position: 'relative',
            zIndex: 1
          }}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
              <Box>
                <Typography variant="h3" fontWeight={800} color="inherit" sx={{ mb: 0.5, letterSpacing: '0.02em', textTransform: 'uppercase' }}>
                  {editingUser ? 'Edit User Credential' : 'New User Account'}
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ opacity: 0.8 }}>
                  <IconShieldLock size={16} />
                  <Typography variant="body2" fontWeight={500}>
                    {editingUser ? `Updating access for ${editingUser.userId}` : 'Configure credentials for a new system user'}
                  </Typography>
                </Stack>
              </Box>
              <IconButton 
                onClick={handleClose} 
                sx={{ 
                  color: 'white', 
                  bgcolor: 'rgba(255,255,255,0.15)',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.25)', transform: 'rotate(90deg)' },
                  transition: 'all 0.3s ease'
                }}
              >
                <IconX size={20} />
              </IconButton>
            </Stack>
          </Box>
          {/* Decorative Circle */}
          <Box sx={{
            position: 'absolute',
            top: -40,
            right: -40,
            width: 180,
            height: 180,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 100%)',
            zIndex: 0
          }} />
        </DialogTitle>
        <Formik
          enableReinitialize={true}
          initialValues={{
            userId: editingUser?.userId || '',
            empId: editingUser?.empId || '',
            password: editingUser?.password || '',
            status: editingUser?.status ?? 1,
            imgName: editingUser?.imgName || '',
            submit: null
          }}
          validationSchema={Yup.object().shape({
            userId: Yup.string().max(50).required('User ID is required'),
            empId: Yup.number().typeError('Employee ID must be a number').required('Employee ID is required'),
            password: editingUser ? Yup.string().max(255) : Yup.string().max(255).required('Password is required'),
            status: Yup.number().required('Status is required')
          })}
          onSubmit={async (values, { setErrors, setStatus, setSubmitting }) => {
            try {
              if (editingUser) {
                await axios.put(`/api/users/update/${editingUser.userId}`, {
                  empId: Number(values.empId),
                  password: values.password,
                  status: Number(values.status),
                  imgName: values.imgName
                });
              } else {
                await axios.post('/api/users/create', {
                  userId: values.userId,
                  empId: Number(values.empId),
                  password: values.password,
                  status: Number(values.status),
                  imgName: values.imgName
                });
              }

              dispatch(
                openSnackbar({
                  open: true,
                  message: `User ${editingUser ? 'updated' : 'created'} successfully`,
                  variant: 'alert',
                  severity: 'success',
                  close: false
                })
              );
              setOpen(false);
              await fetchUsers();
            } catch (err) {
              console.error('Create user failed:', err);
              setStatus({ success: false });
              const errorMessage = getErrorMessage(err) || 'Failed to save user';
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
          {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values, setFieldValue }) => (
            <form noValidate onSubmit={handleSubmit}>
              <DialogContent sx={{ 
                p: 0, 
                bgcolor: 'background.paper',
                position: 'relative',
                zIndex: 2,
                mt: -5,
                borderTopLeftRadius: '40px',
                borderTopRightRadius: '40px',
                overflowY: 'auto',
                maxHeight: 'calc(100vh - 200px)',
                '&::-webkit-scrollbar': { width: 6 },
                '&::-webkit-scrollbar-track': { background: 'transparent' },
                '&::-webkit-scrollbar-thumb': { background: theme.palette.divider, borderRadius: 10 }
              }}>
                <Grid container>
                  {/* Profile Section Card */}
                  <Grid item xs={12} md={5} lg={4} sx={{ p: 4, borderRight: '1px solid', borderColor: 'divider' }}>
                    <Box sx={{
                      p: 4,
                      height: '100%',
                      borderRadius: 6,
                      bgcolor: 'white',
                      border: '2px dashed',
                      borderColor: 'secondary.light',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 4,
                      position: 'relative',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
                    }}>
                      <Typography variant="subtitle2" fontWeight={800} color="secondary.main" sx={{ textTransform: 'uppercase', letterSpacing: '0.15em', fontSize: '0.75rem' }}>
                        PROFILE IDENTITY
                      </Typography>
                      <Box sx={{ position: 'relative' }}>
                        <Box sx={{
                          p: 1,
                          borderRadius: '50%',
                          background: `linear-gradient(135deg, ${theme.palette.secondary.light} 0%, #fff 100%)`,
                          boxShadow: '0 8px 32px rgba(103, 58, 183, 0.15)'
                        }}>
                          <Avatar
                            src={values.imgName ? `${API_BASE}/api/users/image/${values.imgName}` : ''}
                            sx={{
                              width: 130,
                              height: 130,
                              border: '4px solid white',
                              bgcolor: 'secondary.light',
                              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                              '&:hover': { transform: 'scale(1.02)' }
                            }}
                          >
                            <IconPhoto size={50} />
                          </Avatar>
                        </Box>
                        <IconButton
                          component="label"
                          sx={{
                            position: 'absolute',
                            bottom: 10,
                            right: 10,
                            bgcolor: 'secondary.main',
                            color: 'white',
                            '&:hover': { bgcolor: 'secondary.dark', transform: 'scale(1.15)' },
                            width: 40,
                            height: 40,
                            boxShadow: '0 6px 15px rgba(103, 58, 183, 0.4)',
                            border: '3px solid white',
                            transition: 'all 0.2s',
                            zIndex: 3
                          }}
                        >
                          <IconPencil size={18} />
                          <input
                            type="file"
                            hidden
                            accept="image/*"
                            onChange={async (event) => {
                              const file = event.target.files[0];
                              if (file) {
                                const formData = new FormData();
                                formData.append('file', file);
                                try {
                                  const res = await axios.post('/api/users/upload-profile-pic', formData, {
                                    headers: { 'Content-Type': 'multipart/form-data' }
                                  });
                                  setFieldValue('imgName', res.data.fileName);
                                } catch (err) {
                                  console.error('Upload failed', err);
                                  dispatch(openSnackbar({
                                    open: true,
                                    message: 'Image upload failed',
                                    variant: 'alert',
                                    severity: 'error'
                                  }));
                                }
                              }
                            }}
                          />
                        </IconButton>
                      </Box>
                      <Box sx={{ textAlign: 'center', width: '100%' }}>
                        <Typography variant="h3" fontWeight={800} color="secondary.main" sx={{ mb: 1 }}>
                          {values.userId || 'User Name'}
                        </Typography>
                        <Chip 
                          label={editingUser ? 'SYSTEM USER' : 'NEW USER'} 
                          size="small" 
                          sx={{ 
                            px: 1,
                            fontWeight: 800, 
                            fontSize: '0.65rem',
                            bgcolor: 'secondary.light',
                            color: 'secondary.dark',
                            borderRadius: '8px'
                          }} 
                        />
                      </Box>
                    </Box>
                  </Grid>

                  {/* Form Details Column */}
                  <Grid item xs={12} md={7} lg={8} sx={{ p: 4 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                      <Box>
                        <Typography variant="h4" fontWeight={900} color="textPrimary" sx={{ mb: 0.5 }}>
                          Account Credentials
                        </Typography>
                        <Typography variant="body2" color="textSecondary" sx={{ opacity: 0.8 }}>
                          Please provide the following details to manage user access
                        </Typography>
                      </Box>

                      <Stack spacing={3.5}>
                        <CustomFormControl fullWidth error={Boolean(touched.empId && errors.empId)}>
                          <Autocomplete
                            id="user-empId"
                            options={employees}
                            getOptionLabel={(option) => `${option.employeeName} (${option.empCode})`}
                            value={employees.find((e) => e.id === values.empId) || null}
                            onChange={(event, newValue) => {
                              setFieldValue('empId', newValue ? newValue.id : '');
                            }}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                label="Employee Selection"
                                placeholder="Search by name or code"
                                error={Boolean(touched.empId && errors.empId)}
                                sx={{
                                  '& .MuiOutlinedInput-root': {
                                    borderRadius: 4,
                                    bgcolor: 'white',
                                    boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
                                    padding: '12px !important'
                                  },
                                  '& .MuiInputLabel-root': {
                                    top: -2,
                                    fontSize: '0.85rem'
                                  }
                                }}
                              />
                            )}
                            sx={{ width: '100%' }}
                          />
                          {touched.empId && errors.empId && (
                            <FormHelperText error id="helper-text-user-empId" sx={{ mt: 1 }}>
                              {errors.empId}
                            </FormHelperText>
                          )}
                        </CustomFormControl>

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
                            disabled={Boolean(editingUser)}
                            placeholder="e.g. Admin"
                            sx={{ 
                              borderRadius: 4,
                              bgcolor: 'white',
                              boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
                              '&.Mui-focused': { boxShadow: '0 4px 15px rgba(103, 58, 183, 0.12)' }
                            }}
                          />
                          {touched.userId && errors.userId && (
                            <FormHelperText error id="helper-text-user-userId">
                              {errors.userId}
                            </FormHelperText>
                          )}
                        </CustomFormControl>

                        <CustomFormControl fullWidth error={Boolean(touched.password && errors.password)}>
                          <InputLabel htmlFor="user-password">
                            {editingUser ? 'Update Password' : 'Secure Password'}
                          </InputLabel>
                          <OutlinedInput
                            id="user-password"
                            autoComplete="new-password"
                            type={showPassword ? 'text' : 'password'}
                            value={values.password}
                            name="password"
                            onBlur={handleBlur}
                            onChange={handleChange}
                            placeholder={editingUser ? 'Leave blank to keep current' : 'Create a strong password'}
                            sx={{ 
                              borderRadius: 4,
                              bgcolor: 'white',
                              boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
                              '&.Mui-focused': { boxShadow: '0 4px 15px rgba(103, 58, 183, 0.12)' }
                            }}
                            endAdornment={
                              <InputAdornment position="end">
                                <IconButton aria-label="toggle password visibility" onClick={handleClickShowPassword} edge="end" size="large">
                                  {showPassword ? <Visibility /> : <VisibilityOff />}
                                </IconButton>
                              </InputAdornment>
                            }
                            label={editingUser ? 'Update Password' : 'Secure Password'}
                          />
                          {touched.password && errors.password && (
                            <FormHelperText error id="helper-text-user-password">
                              {errors.password}
                            </FormHelperText>
                          )}
                        </CustomFormControl>

                        <CustomFormControl fullWidth error={Boolean(touched.status && errors.status)}>
                          <InputLabel id="user-status-label">Account Status</InputLabel>
                          <Select
                            labelId="user-status-label"
                            id="user-status"
                            value={values.status}
                            name="status"
                            onBlur={handleBlur}
                            onChange={handleChange}
                            label="Account Status"
                            sx={{ 
                              borderRadius: 4,
                              bgcolor: 'white',
                              boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
                              '&.Mui-focused': { boxShadow: '0 4px 15px rgba(103, 58, 183, 0.12)' },
                              '& .MuiSelect-select': { 
                                display: 'flex', 
                                alignItems: 'center',
                                pt: 3.5, // Match CustomFormControl input padding
                                pb: 1.5
                              }
                            }}
                          >
                            <MenuItem value={1}>
                              <Stack direction="row" spacing={1.5} alignItems="center">
                                <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: 'success.main' }} />
                                <Typography fontWeight={600}>Active</Typography>
                              </Stack>
                            </MenuItem>
                            <MenuItem value={0}>
                              <Stack direction="row" spacing={1.5} alignItems="center">
                                <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: 'error.main' }} />
                                <Typography fontWeight={600}>Inactive</Typography>
                              </Stack>
                            </MenuItem>
                          </Select>
                          {touched.status && errors.status && (
                            <FormHelperText error id="helper-text-user-status">
                              {errors.status}
                            </FormHelperText>
                          )}
                        </CustomFormControl>
                      </Stack>
                    </Box>
                  </Grid>
                  {errors.submit && (
                    <Grid item xs={12}>
                      <FormHelperText error>{errors.submit}</FormHelperText>
                    </Grid>
                  )}
                </Grid>
              </DialogContent>
              <DialogActions sx={{ p: 4, px: 6, bgcolor: 'white', borderTop: 'none', justifyContent: 'flex-end', gap: 2 }}>
                <Button 
                  onClick={handleClose} 
                  variant="text"
                  color="inherit" 
                  sx={{ 
                    fontWeight: 700, 
                    color: 'text.secondary',
                    fontSize: '0.85rem',
                    letterSpacing: '0.05em',
                    px: 3,
                    '&:hover': { bgcolor: 'grey.100', color: 'text.primary' }
                  }}
                >
                  DISCARD
                </Button>
                <AnimateButton>
                  <Button
                    disableElevation
                    disabled={isSubmitting}
                    type="submit"
                    variant="contained"
                    sx={{
                      px: 4,
                      py: 1.2,
                      borderRadius: '12px',
                      fontWeight: 800,
                      fontSize: '0.9rem',
                      letterSpacing: '0.05em',
                      bgcolor: 'secondary.main',
                      color: 'white',
                      boxShadow: '0 8px 20px rgba(103, 58, 183, 0.3)',
                      '&:hover': { 
                        bgcolor: 'secondary.dark',
                        boxShadow: '0 12px 25px rgba(103, 58, 183, 0.4)',
                        transform: 'translateY(-1px)'
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {editingUser ? 'SAVE CHANGES' : 'CREATE ACCOUNT'}
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
