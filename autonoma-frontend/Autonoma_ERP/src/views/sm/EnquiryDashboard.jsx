import { useState, useEffect, useMemo } from 'react';
import {
  Box, Typography, List, ListItem, Avatar,
  CircularProgress, IconButton, Paper, Divider,
  Grid, Card, CardContent, Tabs, Tab, TextField, InputAdornment,
  Button, Stack, Chip
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import EmailRoundedIcon from '@mui/icons-material/EmailRounded';
import ShieldRoundedIcon from '@mui/icons-material/ShieldRounded';
import ShoppingBagRoundedIcon from '@mui/icons-material/ShoppingBagRounded';
import AccountBalanceWalletRoundedIcon from '@mui/icons-material/AccountBalanceWalletRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import StarBorderRoundedIcon from '@mui/icons-material/StarBorderRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import ArchiveOutlinedIcon from '@mui/icons-material/ArchiveOutlined';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import AutoFixHighRoundedIcon from '@mui/icons-material/AutoFixHighRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import AttachFileRoundedIcon from '@mui/icons-material/AttachFileRounded';
import axios from 'axios';

// ==============================|| SM - ENQUIRY DASHBOARD (LIVE INBOX) ||============================== //

const INBOX_API = 'http://localhost:9090/api/inbox';
const MARK_READ_API = (id) => `http://localhost:9090/api/inbox/${id}/mark-read`;

export default function EnquiryDashboard() {
  const theme = useTheme();
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [currentTab, setCurrentTab] = useState('All Inbox');
  const [searchQuery, setSearchQuery] = useState('');

  const load = () => {
    setLoading(true);
    axios.get(`${INBOX_API}?limit=50`)
      .then(res => {
        const fetched = res.data || [];
        setEmails(fetched);
        if (fetched.length > 0) {
          setSelectedEmail(fetched[0]);
        }
      })
      .catch((err) => {
        console.error('Failed to load inbox', err);
        setEmails([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleMarkRead = async (id) => {
    try {
      await axios.post(MARK_READ_API(id));
      setEmails(emails.map(e => e.id === id ? { ...e, isRead: true } : e));
    } catch (err) {
      console.error('Failed to mark as read', err);
    }
  };

  const filteredEmails = useMemo(() => {
    let filtered = emails;
    if (currentTab !== 'All Inbox') {
      filtered = filtered.filter(e => e.category === currentTab);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(e => 
        (e.subject && e.subject.toLowerCase().includes(q)) || 
        (e.fromName && e.fromName.toLowerCase().includes(q)) ||
        (e.preview && e.preview.toLowerCase().includes(q))
      );
    }
    return filtered;
  }, [emails, currentTab, searchQuery]);

  const stats = useMemo(() => {
    return {
      total: emails.length,
      enquiry: emails.filter(e => e.category === 'Enquiry').length,
      order: emails.filter(e => e.category === 'Order').length,
      ledger: emails.filter(e => e.category === 'Ledger').length,
    };
  }, [emails]);

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'Enquiry': return { bg: 'rgba(108,99,255,0.1)', color: '#6C63FF' };
      case 'Order': return { bg: 'rgba(0,217,166,0.1)', color: '#00D9A6' };
      case 'Ledger': return { bg: 'rgba(255,152,0,0.1)', color: '#FF9800' };
      default: return { bg: 'rgba(128,128,128,0.1)', color: theme.palette.text.secondary };
    }
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      const now = new Date();
      const isToday = d.toDateString() === now.toDateString();
      if (isToday) {
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
      return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)', width: '100%', overflow: 'hidden' }}>
      {/* Fixed Header Section */}
      <Box sx={{ flexShrink: 0, mb: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h3" sx={{ fontWeight: 800 }}>Enquiry Inbox</Typography>
          <Button
            variant="outlined"
            size="small"
            startIcon={<RefreshRoundedIcon />}
            onClick={load}
            disabled={loading}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
          >
            Refresh
          </Button>
        </Stack>
        
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: 'background.paper', borderRadius: 2, border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', p: '16px !important' }}>
                <Box sx={{ p: 1, borderRadius: 2, bgcolor: 'rgba(108,99,255,0.1)', mr: 2 }}>
                  <EmailRoundedIcon sx={{ color: '#6C63FF', fontSize: 20 }} />
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={500}>Total Emails</Typography>
                  <Typography variant="h6" fontWeight={700} sx={{ lineHeight: 1 }}>{stats.total}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: 'background.paper', borderRadius: 2, border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', p: '16px !important' }}>
                <Box sx={{ p: 1, borderRadius: 2, bgcolor: 'rgba(108,99,255,0.1)', mr: 2 }}>
                  <ShieldRoundedIcon sx={{ color: '#6C63FF', fontSize: 20 }} />
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={500}>Enquiries</Typography>
                  <Typography variant="h6" fontWeight={700} sx={{ lineHeight: 1 }}>{stats.enquiry}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: 'background.paper', borderRadius: 2, border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', p: '16px !important' }}>
                <Box sx={{ p: 1, borderRadius: 2, bgcolor: 'rgba(0,217,166,0.1)', mr: 2 }}>
                  <ShoppingBagRoundedIcon sx={{ color: '#00D9A6', fontSize: 20 }} />
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={500}>Orders</Typography>
                  <Typography variant="h6" fontWeight={700} sx={{ lineHeight: 1 }}>{stats.order}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: 'background.paper', borderRadius: 2, border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', p: '16px !important' }}>
                <Box sx={{ p: 1, borderRadius: 2, bgcolor: 'rgba(255,152,0,0.1)', mr: 2 }}>
                  <AccountBalanceWalletRoundedIcon sx={{ color: '#FF9800', fontSize: 20 }} />
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={500}>Ledgers</Typography>
                  <Typography variant="h6" fontWeight={700} sx={{ lineHeight: 1 }}>{stats.ledger}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Tabs 
            value={currentTab} 
            onChange={(e, val) => { setCurrentTab(val); setSelectedEmail(null); }}
            sx={{ minHeight: 40, '& .MuiTab-root': { minHeight: 40, textTransform: 'none', fontWeight: 600 } }}
          >
            {['All Inbox', 'Enquiry', 'Order', 'Ledger', 'Others'].map(t => (
              <Tab key={t} label={t} value={t} />
            ))}
          </Tabs>

          <TextField 
            size="small" 
            placeholder="Search emails..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: <InputAdornment position="start"><SearchRoundedIcon fontSize="small"/></InputAdornment>
            }}
            sx={{ width: 250 }}
          />
        </Box>
      </Box>

      {/* Main Content Area: Split View */}
      <Paper sx={{ 
        flex: 1, 
        display: 'flex', 
        overflow: 'hidden', 
        borderRadius: 3, 
        border: '1px solid', 
        borderColor: 'divider',
        bgcolor: 'background.paper' 
      }}>
        {/* Left List: Scrollable */}
        <Box sx={{ width: '35%', borderRight: '1px solid', borderColor: 'divider', display: 'flex', flexDirection: 'column' }}>
          {loading ? (
            <Box sx={{ display: 'flex', flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <CircularProgress size={40} />
            </Box>
          ) : (
            <List sx={{ p: 0, overflowY: 'auto', flex: 1, '&::-webkit-scrollbar': { width: '6px' }, '&::-webkit-scrollbar-thumb': { backgroundColor: 'rgba(128,128,128,0.2)', borderRadius: '4px' } }}>
              {filteredEmails.map((email, idx) => {
                const colors = getCategoryColor(email.category || 'Others');
                const isSelected = selectedEmail?.id === email.id;
                
                return (
                  <Box key={email.id}>
                    <ListItem 
                      alignItems="flex-start"
                      onClick={() => {
                        if (!email.isRead) handleMarkRead(email.id);
                        setSelectedEmail(email);
                      }}
                      sx={{ 
                        px: 3, py: 2, 
                        cursor: 'pointer',
                        bgcolor: isSelected ? 'action.selected' : (email.isRead ? 'transparent' : 'action.hover'),
                        borderLeft: isSelected ? '4px solid #6C63FF' : '4px solid transparent',
                        '&:hover': { bgcolor: 'action.hover' },
                      }}
                    >
                      <Avatar sx={{ bgcolor: 'primary.light', color: 'primary.main', width: 36, height: 36, mr: 2, fontSize: '0.9rem', fontWeight: 600 }}>
                        {getInitials(email.fromName)}
                      </Avatar>
                      
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: email.isRead ? 600 : 800, fontSize: '0.85rem' }} noWrap>
                            {email.fromName || 'Unknown'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap', ml: 1 }}>
                            {formatTime(email.receivedAt)}
                          </Typography>
                        </Box>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                          <Typography variant="body2" sx={{ fontWeight: email.isRead ? 400 : 600, fontSize: '0.85rem', flex: 1 }} noWrap>
                            {email.subject || '(No Subject)'}
                          </Typography>
                          {email.hasAttachments && <AttachFileRoundedIcon sx={{ fontSize: 14, color: 'text.secondary' }} />}
                        </Box>
                        
                        <Stack direction="row" alignItems="center" spacing={0.5}>
                          <Typography variant="body2" color="text.secondary" sx={{ display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden', fontSize: '0.75rem', flex: 1 }}>
                            {email.preview || ''}
                          </Typography>
                          {email.category && email.category !== 'Others' && (
                            <Chip 
                              label={email.category} 
                              size="small" 
                              sx={{ 
                                height: 18, fontSize: '0.65rem', fontWeight: 700, 
                                bgcolor: colors.bg, color: colors.color, 
                                borderRadius: 1, '& .MuiChip-label': { px: 0.8 }
                              }} 
                            />
                          )}
                        </Stack>
                      </Box>
                    </ListItem>
                    {idx < filteredEmails.length - 1 && <Divider />}
                  </Box>
                );
              })}
              {filteredEmails.length === 0 && (
                <Box sx={{ p: 4, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">No emails found</Typography>
                </Box>
              )}
            </List>
          )}
        </Box>

        {/* Right Details: Scrollable */}
        <Box sx={{ width: '65%', display: 'flex', flexDirection: 'column', bgcolor: theme.palette.mode === 'dark' ? '#0A0E1A' : '#FAFAFA' }}>
          {selectedEmail ? (
            <>
              {/* Header */}
              <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar sx={{ bgcolor: 'rgba(108,99,255,0.2)', color: '#6C63FF', width: 40, height: 40, mr: 2, fontWeight: 700 }}>
                    {getInitials(selectedEmail.fromName)}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{selectedEmail.fromName || 'Unknown'}</Typography>
                    <Typography variant="caption" color="text.secondary">{selectedEmail.from || 'No email'}</Typography>
                  </Box>
                </Box>
                
                <Box sx={{ display: 'flex', gap: 0.5, color: 'text.secondary' }}>
                  <IconButton color="inherit" size="small"><StarBorderRoundedIcon fontSize="small" /></IconButton>
                  <IconButton color="inherit" size="small"><DeleteOutlineRoundedIcon fontSize="small" /></IconButton>
                  <IconButton color="inherit" size="small"><ArchiveOutlinedIcon fontSize="small" /></IconButton>
                  <IconButton color="inherit" size="small"><MoreVertIcon fontSize="small" /></IconButton>
                </Box>
              </Box>
              
              {/* Content area */}
              <Box sx={{ p: 3, overflowY: 'auto', flex: 1, '&::-webkit-scrollbar': { width: '8px' }, '&::-webkit-scrollbar-thumb': { backgroundColor: 'rgba(128,128,128,0.2)', borderRadius: '4px' } }}>
                <Box sx={{ mb: 3 }}>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                    <Typography variant="h5" sx={{ fontWeight: 800 }}>{selectedEmail.subject || '(No Subject)'}</Typography>
                    {selectedEmail.category && selectedEmail.category !== 'Others' && (
                      <Chip 
                        label={selectedEmail.category} 
                        size="small"
                        sx={{ 
                          fontWeight: 700, 
                          bgcolor: getCategoryColor(selectedEmail.category).bg, 
                          color: getCategoryColor(selectedEmail.category).color 
                        }}
                      />
                    )}
                  </Stack>
                  <Typography variant="caption" color="text.secondary">
                    {selectedEmail.receivedAt ? new Date(selectedEmail.receivedAt).toLocaleString() : ''}
                    {selectedEmail.hasAttachments && ' • 📎 Has Attachments'}
                  </Typography>
                </Box>

                {selectedEmail.category && selectedEmail.category !== 'Others' && (
                  <Paper sx={{ 
                    p: 2, mb: 3, 
                    bgcolor: getCategoryColor(selectedEmail.category).bg, 
                    border: '1px solid',
                    borderColor: getCategoryColor(selectedEmail.category).color,
                    borderRadius: 2,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <Box>
                      <Typography variant="subtitle2" sx={{ color: getCategoryColor(selectedEmail.category).color, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AutoFixHighRoundedIcon fontSize="small"/> 
                        {selectedEmail.category} Detected
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                        Automated classification for this request.
                      </Typography>
                    </Box>
                    <Button 
                      variant="contained" 
                      size="small"
                      sx={{ 
                        bgcolor: getCategoryColor(selectedEmail.category).color,
                        color: '#FFF',
                        fontWeight: 700,
                        px: 2,
                        '&:hover': { bgcolor: getCategoryColor(selectedEmail.category).color, opacity: 0.9 }
                      }}
                    >
                      {selectedEmail.category === 'Enquiry' ? 'Generate Quote' : 
                       selectedEmail.category === 'Order' ? 'Process Order' : 'View Ledger'}
                    </Button>
                  </Paper>
                )}

                {/* Render the full HTML email body */}
                <Box 
                  dangerouslySetInnerHTML={{ __html: selectedEmail.body || selectedEmail.preview || '<i>No body content available</i>' }} 
                  sx={{ 
                    fontFamily: 'inherit', 
                    lineHeight: 1.6, 
                    fontSize: '0.9rem',
                    '& img': { maxWidth: '100%', height: 'auto' },
                    '& a': { color: theme.palette.primary.main },
                    '& table': { borderCollapse: 'collapse', maxWidth: '100%' },
                    '& td, & th': { padding: '4px 8px' }
                  }}
                />
              </Box>
            </>
          ) : (
            <Box sx={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
              <Typography variant="body2" color="text.secondary">Select an email to read</Typography>
            </Box>
          )}
        </Box>
      </Paper>
    </Box>
  );
}
