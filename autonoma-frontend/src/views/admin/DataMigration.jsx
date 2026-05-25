import { useState, useEffect } from 'react';
import { Typography, Stack, Button, Grid, Card, CardContent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, Tab, Tabs, Box, Avatar, TablePagination, Dialog, DialogTitle, DialogContent, DialogActions, Snackbar, Alert } from '@mui/material';
import { IconDatabaseExport, IconPlayerPlay, IconHistory, IconInfoCircle, IconCheck, IconServer } from '@tabler/icons-react';
import MainCard from 'ui-component/cards/MainCard';
import axios from 'utils/axios';
import { format } from 'date-fns';

// ==============================|| OLD DATA MIGRATION ||============================== //

export default function DataMigration() {
  const [loading, setLoading] = useState(false);
  const [auditLogs, setAuditLogs] = useState([]);
  const [fetchingLogs, setFetchingLogs] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [scopeOpen, setScopeOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const showNotification = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSnackbarClose = (_, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const fetchAuditLogs = async () => {
    setFetchingLogs(true);
    try {
      const response = await axios.get('/api/admin/migration/audit-logs');
      setAuditLogs(response.data);
    } catch (error) {
      console.error('Failed to fetch audit logs:', error);
    } finally {
      setFetchingLogs(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const runMigration = async (endpoint, successMessage) => {
    setLoading(true);
    try {
      const response = await axios.post(endpoint);
      showNotification(response.data.message || successMessage, 'success');
      fetchAuditLogs();
      // Auto switch to history tab to view results
      setActiveTab(1);
    } catch (error) {
      console.error('Migration failed:', error);
      showNotification('Migration failed: ' + (error.response?.data?.message || error.message), 'error');
      fetchAuditLogs();
    } finally {
      setLoading(false);
    }
  };

  // Paginated logs slicing
  const paginatedLogs = auditLogs.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <MainCard
      title={
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <IconDatabaseExport size={24} />
          <Typography variant="h3">Old Data Migration</Typography>
        </Stack>
      }
    >
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(e, v) => setActiveTab(v)}
          aria-label="migration tabs"
          textColor="primary"
          indicatorColor="primary"
        >
          <Tab
            label="Migration Run"
            icon={<IconPlayerPlay size={18} />}
            iconPosition="start"
            sx={{ fontWeight: 600, minHeight: 50 }}
          />
          <Tab
            label="Audit History"
            icon={<IconHistory size={18} />}
            iconPosition="start"
            sx={{ fontWeight: 600, minHeight: 50 }}
          />
        </Tabs>
      </Box>

      {activeTab === 0 && (
        <Grid container spacing={3}>
          {/* Main Safety Instruction Banner */}
          <Grid item xs={12}>
            <Box sx={{ p: 2.5, bgcolor: 'primary.light', borderRadius: '16px', borderLeft: '6px solid', borderColor: 'primary.main', display: 'flex', gap: 2, alignItems: 'flex-start' }}>
              <IconInfoCircle size={24} style={{ color: '#2196f3', flexShrink: 0, marginTop: 2 }} />
              <Box>
                <Typography variant="h4" color="primary.dark" sx={{ fontWeight: 700 }}>
                  Important Execution Safety
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5, lineHeight: 1.5 }}>
                  Before starting, verify database connection availability. Running migrations does not overwrite existing records, but appends new transaction contexts cleanly. It is recommended to run the migrations sequentially (Step 1, then Step 2, then Step 3) or use the "Run All Migrations" button.
                </Typography>
              </Box>
            </Box>
          </Grid>

          {/* Quick Action - Run All */}
          <Grid item xs={12}>
            <Card variant="outlined" sx={{
              borderColor: 'success.main',
              borderRadius: '16px',
              borderWidth: '1.5px',
              background: 'linear-gradient(135deg, #f1fcf4 0%, #ffffff 100%)',
              boxShadow: '0 4px 15px rgba(46, 125, 50, 0.05)'
            }}>
              <CardContent sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'between', flexWrap: 'wrap', gap: 3 }}>
                <Stack direction="row" alignItems="center" spacing={2} sx={{ flexGrow: 1 }}>
                  <Avatar sx={{ bgcolor: 'success.main', color: '#ffffff', width: 48, height: 48, borderRadius: '12px' }}>
                    <IconServer size={26} />
                  </Avatar>
                  <Box>
                    <Typography variant="h3" sx={{ fontWeight: 800, color: 'success.dark' }}>
                      Run All Migrations (Recommended)
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Sequentially runs Department Migration, Master Checklist Migration, and Checklist Assignment Migration.
                    </Typography>
                  </Box>
                </Stack>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Button
                    variant="contained"
                    color="success"
                    size="large"
                    startIcon={<IconPlayerPlay size={20} />}
                    onClick={() => runMigration('/api/admin/migration/all', 'All data migrations completed successfully.')}
                    disabled={loading}
                    sx={{
                      borderRadius: '10px',
                      px: 4,
                      py: 1.5,
                      fontWeight: 700,
                      boxShadow: '0 4px 12px 0 rgba(46, 125, 50, 0.3)',
                      '&:hover': {
                        boxShadow: '0 6px 20px 0 rgba(46, 125, 50, 0.4)'
                      }
                    }}
                  >
                    {loading ? 'Executing Migration...' : 'Run All Migrations'}
                  </Button>
                  <Button
                    variant="outlined"
                    color="secondary"
                    size="large"
                    startIcon={<IconInfoCircle size={20} />}
                    onClick={() => setScopeOpen(true)}
                    sx={{ borderRadius: '10px', px: 3, py: 1.5, fontWeight: 700 }}
                  >
                    View Scope
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Grid of steps */}
          <Grid item xs={12} md={4}>
            <Card variant="outlined" sx={{ borderRadius: '16px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', '&:hover': { boxShadow: '0 6px 20px rgba(0,0,0,0.05)', transform: 'translateY(-2px)', transition: 'all 0.3s' } }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" color="primary" sx={{ fontWeight: 800, mb: 1, textTransform: 'uppercase', letterSpacing: 1 }}>
                  Step 1
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 700, mb: 1.5 }}>
                  Department Migration
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ lineHeight: 1.6, mb: 3 }}>
                  Imports legacy department codes (DEPT_NO) from the DEPT table and registers them as professional department numbers (DEPT-XXX) and names.
                </Typography>
              </CardContent>
              <Box sx={{ p: 3, pt: 0 }}>
                <Button
                  variant="outlined"
                  color="primary"
                  fullWidth
                  startIcon={<IconPlayerPlay size={16} />}
                  onClick={() => runMigration('/api/admin/migration/departments', 'Departments migrated successfully.')}
                  disabled={loading}
                  sx={{ borderRadius: '8px', py: 1, fontWeight: 700 }}
                >
                  Migrate Departments
                </Button>
              </Box>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card variant="outlined" sx={{ borderRadius: '16px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', '&:hover': { boxShadow: '0 6px 20px rgba(0,0,0,0.05)', transform: 'translateY(-2px)', transition: 'all 0.3s' } }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" color="primary" sx={{ fontWeight: 800, mb: 1, textTransform: 'uppercase', letterSpacing: 1 }}>
                  Step 2
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 700, mb: 1.5 }}>
                  Master Checklist
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ lineHeight: 1.6, mb: 3 }}>
                  Imports checklist templates, SOP guidelines, categories, rules, and maps them to resolved department names.
                </Typography>
              </CardContent>
              <Box sx={{ p: 3, pt: 0 }}>
                <Button
                  variant="outlined"
                  color="primary"
                  fullWidth
                  startIcon={<IconPlayerPlay size={16} />}
                  onClick={() => runMigration('/api/admin/migration/checklists', 'Master checklists migrated successfully.')}
                  disabled={loading}
                  sx={{ borderRadius: '8px', py: 1, fontWeight: 700 }}
                >
                  Migrate Checklists
                </Button>
              </Box>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card variant="outlined" sx={{ borderRadius: '16px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', '&:hover': { boxShadow: '0 6px 20px rgba(0,0,0,0.05)', transform: 'translateY(-2px)', transition: 'all 0.3s' } }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" color="primary" sx={{ fontWeight: 800, mb: 1, textTransform: 'uppercase', letterSpacing: 1 }}>
                  Step 3
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 700, mb: 1.5 }}>
                  Assignments
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ lineHeight: 1.6, mb: 3 }}>
                  Imports history of checklist assignments, employee tasks, dates, carry forward counters, and verification parameters.
                </Typography>
              </CardContent>
              <Box sx={{ p: 3, pt: 0 }}>
                <Button
                  variant="outlined"
                  color="primary"
                  fullWidth
                  startIcon={<IconPlayerPlay size={16} />}
                  onClick={() => runMigration('/api/admin/migration/assignments', 'Checklist assignments migrated successfully.')}
                  disabled={loading}
                  sx={{ borderRadius: '8px', py: 1, fontWeight: 700 }}
                >
                  Migrate Assignments
                </Button>
              </Box>
            </Card>
          </Grid>
        </Grid>
      )}

      {activeTab === 1 && (
        <Grid container spacing={3}>
          {/* Audit Logs Table */}
          <Grid item xs={12}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2, mt: 1 }}>
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <IconHistory size={22} />
                <Typography variant="h4" sx={{ fontWeight: 600 }}>Migration History Log</Typography>
              </Stack>
              <Button
                variant="outlined"
                color="secondary"
                size="small"
                onClick={fetchAuditLogs}
                disabled={fetchingLogs}
                startIcon={<IconHistory size={16} />}
              >
                Refresh Log
              </Button>
            </Stack>

            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: '12px', overflow: 'hidden', maxHeight: 'calc(100vh - 380px)', minHeight: '400px' }}>
              <Table sx={{ minWidth: 650 }} aria-label="audit log table" stickyHeader>
                <TableHead>
                  <TableRow sx={{ '& th': { fontWeight: 700, bgcolor: 'grey.50', borderBottom: '2px solid', borderColor: 'divider' } }}>
                    <TableCell>Date & Time</TableCell>
                    <TableCell>User</TableCell>
                    <TableCell>Table Migrated</TableCell>
                    <TableCell align="center">Records</TableCell>
                    <TableCell align="center">Status</TableCell>
                    <TableCell>Execution Message</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {fetchingLogs && auditLogs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                        <Typography variant="body2" color="textSecondary">Loading...</Typography>
                      </TableCell>
                    </TableRow>
                  ) : auditLogs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                        <Typography variant="body2" color="textSecondary">No migration logs found.</Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedLogs.map((log) => (
                      <TableRow key={log.id} sx={{ '&:last-child td, &:last-child th': { border: 0 }, '&:hover': { bgcolor: 'action.hover' } }}>
                        <TableCell component="th" scope="row">
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            {log.migratedAt ? format(new Date(log.migratedAt), 'dd MMM yyyy') : 'N/A'}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {log.migratedAt ? format(new Date(log.migratedAt), 'hh:mm a') : ''}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            {log.migratedBy || 'System'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontFamily: 'monospace', color: 'primary.main', fontWeight: 500 }}>
                            {log.tableName}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {log.recordsCount}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={log.status}
                            color={log.status === 'SUCCESS' ? 'success' : 'error'}
                            size="small"
                            sx={{ fontWeight: 700, borderRadius: '6px' }}
                          />
                        </TableCell>
                        <TableCell sx={{ maxWidth: '300px' }}>
                          <Typography
                            variant="body2"
                            color={log.status === 'FAILED' ? 'error.main' : 'text.secondary'}
                            sx={{ wordBreak: 'break-word', fontWeight: log.status === 'FAILED' ? 500 : 400 }}
                          >
                            {log.message || 'No message logged.'}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Pagination at the bottom */}
            <Box sx={{ p: '1px', display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid', borderColor: 'divider', mt: 1 }}>
              <TablePagination
                component="div"
                count={auditLogs.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={(e, newPage) => setPage(newPage)}
                onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
                rowsPerPageOptions={[5, 10, 25, 50]}
                sx={{ '& .MuiTablePagination-toolbar': { minHeight: '34px', p: '0 8px' } }}
              />
            </Box>
          </Grid>
        </Grid>
      )}

      {/* Migration Scope Details Dialog */}
      <Dialog
        open={scopeOpen}
        onClose={() => setScopeOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '16px',
            p: 1
          }
        }}
      >
        <DialogTitle sx={{ pb: 1, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar sx={{ bgcolor: 'success.light', color: 'success.dark', width: 40, height: 40 }}>
            <IconInfoCircle size={24} />
          </Avatar>
          <Box>
            <Typography variant="h3" fontWeight={700}>Migration Scope</Typography>
            <Typography variant="caption" color="textSecondary">Target tables and synchronization rules</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
              <Avatar sx={{ bgcolor: 'success.light', color: 'success.dark', width: 28, height: 28, fontSize: '0.8rem', fontWeight: 700 }}>
                <IconCheck size={16} />
              </Avatar>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>hrm_department_master (Target)</Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mt: 0.2 }}>
                  Imports departments from legacy DEPT, maps integer codes to DEPT-XXX format, and registers department names.
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
              <Avatar sx={{ bgcolor: 'success.light', color: 'success.dark', width: 28, height: 28, fontSize: '0.8rem', fontWeight: 700 }}>
                <IconCheck size={16} />
              </Avatar>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>qms_checklist_master (Target)</Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mt: 0.2 }}>
                  Imports base checklist codes, revision headers, frequency rules, status values, and validity schedules.
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
              <Avatar sx={{ bgcolor: 'success.light', color: 'success.dark', width: 28, height: 28, fontSize: '0.8rem', fontWeight: 700 }}>
                <IconCheck size={16} />
              </Avatar>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>qms_checklist_department (Mapping)</Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mt: 0.2 }}>
                  Re-maps relational organization units and binds departments to imported checklists.
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
              <Avatar sx={{ bgcolor: 'success.light', color: 'success.dark', width: 28, height: 28, fontSize: '0.8rem', fontWeight: 700 }}>
                <IconCheck size={16} />
              </Avatar>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>qms_checklist_level (Hierarchy)</Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mt: 0.2 }}>
                  Maps structural target grades/levels to their corresponding checklists.
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
              <Avatar sx={{ bgcolor: 'success.light', color: 'success.dark', width: 28, height: 28, fontSize: '0.8rem', fontWeight: 700 }}>
                <IconCheck size={16} />
              </Avatar>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>ad_migration_audit_log (Audit)</Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mt: 0.2 }}>
                  Tracks execution timestamps, logging user identity, records migrated, success status, and details.
                </Typography>
              </Box>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, pt: 1.5 }}>
          <Button onClick={() => setScopeOpen(false)} variant="contained" sx={{ borderRadius: '8px', px: 3 }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success / Error Snackbar Notification */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          variant="filled"
          sx={{
            width: '100%',
            minWidth: 340,
            maxWidth: 600,
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
            fontSize: '0.95rem',
            fontWeight: 600,
            alignItems: 'center'
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </MainCard>
  );
}
