import PropTypes from 'prop-types';
import { useState } from 'react';

// material-ui
import { useColorScheme, useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Drawer from '@mui/material/Drawer';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import OutlinedInput from '@mui/material/OutlinedInput';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Checkbox from '@mui/material/Checkbox';
import ListItemIcon from '@mui/material/ListItemIcon';
import Badge from '@mui/material/Badge';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';

// project imports
import UserList from './UserList';
import AvatarStatus from './AvatarStatus';
import UserAvatar from './UserAvatar';
import { ThemeMode } from 'config';
import useAuth from 'hooks/useAuth';
import MainCard from 'ui-component/cards/MainCard';
import SimpleBar from 'ui-component/third-party/SimpleBar';
import { appDrawerWidth as drawerWidth, gridSpacing } from 'store/constant';
import axiosServices from 'utils/axios';
import { getUserImageUrl } from 'utils/upload-helper';

// assets
import SearchTwoToneIcon from '@mui/icons-material/SearchTwoTone';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import GroupAddTwoToneIcon from '@mui/icons-material/GroupAddTwoTone';
import ArrowBackTwoToneIcon from '@mui/icons-material/ArrowBackTwoTone';
import useConfig from 'hooks/useConfig';

export default function ChatDrawer({ handleDrawerOpen, openChatDrawer, setChannel, channels, activeChannel, currentUserId }) {
  const theme = useTheme();
  const { colorScheme } = useColorScheme();

  const { user } = useAuth();
  const {
    state: { borderRadius }
  } = useConfig();
  const downLG = useMediaQuery(theme.breakpoints.down('lg'));

  // show menu to set current user status
  const [anchorEl, setAnchorEl] = useState();
  const handleClickRightMenu = (event) => {
    setAnchorEl(event?.currentTarget);
  };

  const handleCloseRightMenu = () => {
    setAnchorEl(null);
  };

  // set user status on status menu click
  const [status, setStatus] = useState('available');
  const handleRightMenuItemClick = (userStatus) => () => {
    setStatus(userStatus);
    handleCloseRightMenu();
  };

  const [view, setView] = useState('chats'); // 'chats' | 'new_chat'
  const [allContacts, setAllContacts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  const fetchAllContacts = async () => {
    try {
      const res = await axiosServices.get('/api/chat/search/users?query=');
      // filter out self
      setAllContacts(res.data.filter(u => u.userId !== currentUserId));
    } catch(err) {}
  };

  const handleOpenNewChat = () => {
    fetchAllContacts();
    setView('new_chat');
    setSearchQuery('');
  };

  const handleBackToChats = () => {
    setView('chats');
    setSearchQuery('');
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const filteredContacts = allContacts.filter(c => 
    c.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.userId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredChannels = channels.filter(c => 
    c.channelName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleStartDirectChat = async (targetUserId) => {
    try {
      const res = await axiosServices.post(`/api/chat/channels/direct?targetUserId=${targetUserId}`);
      setChannel(res.data);
      handleBackToChats();
      if (openGroupDialog) setOpenGroupDialog(false);
    } catch(e) {}
  };
  
  const [openGroupDialog, setOpenGroupDialog] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  
  const handleCreateGroup = async () => {
    if (!groupName || selectedUsers.length === 0) return;
    try {
      const res = await axiosServices.post('/api/chat/channels', null, {
        params: {
          name: groupName,
          type: 'GROUP',
          userIds: selectedUsers.join(',')
        }
      });
      if (setChannel) setChannel(res.data);
      setOpenGroupDialog(false);
      setGroupName('');
      setSelectedUsers([]);
      handleBackToChats();
    } catch(e) {}
  };

  return (
    <Drawer
      slotProps={{
        paper: {
          sx: {
            height: '100%',
            width: drawerWidth,
            boxSizing: 'border-box',
            position: 'relative',
            border: 'none',
            borderRadius: { sx: 'none', lg: `${borderRadius}px` }
          }
        }
      }}
      sx={{ width: drawerWidth, flexShrink: 0, zIndex: { xs: 1100, lg: 0 } }}
      variant={downLG ? 'temporary' : 'persistent'}
      anchor="left"
      open={openChatDrawer}
      ModalProps={{ keepMounted: true }}
      onClose={handleDrawerOpen}
    >
      {openChatDrawer && (
        <MainCard
          sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            bgcolor: { xs: 'transparent', lg: 'grey.50' },
            borderRadius: { xs: 0, lg: `${borderRadius}px` },
            ...theme.applyStyles('dark', { bgcolor: { lg: 'dark.main' } })
          }}
          border={colorScheme === ThemeMode.LIGHT}
          content={false}
        >
          {view === 'chats' ? (
            <>
              <Box sx={{ p: 3, pb: 2, flexShrink: 0 }}>
                <Grid container spacing={gridSpacing}>
                  <Grid size={12}>
                    <Grid container spacing={2} sx={{ alignItems: 'center', flexWrap: 'nowrap' }}>
                      <Grid>
                        <Badge
                          overlap="circular"
                          badgeContent={<AvatarStatus status={status} />}
                          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                        >
                          <Avatar 
                            src={user?.imgName ? getUserImageUrl(user.imgName) : ''} 
                            alt={user?.name}
                            sx={{ width: 48, height: 48, border: '2px solid', borderColor: 'divider' }}
                          />
                        </Badge>
                      </Grid>
                      <Grid size="grow" sx={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {user?.name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, mb: 0.5 }}>
                          ID: {user?.id}
                        </Typography>
                        {(user?.designationName || user?.departmentName) && (
                          <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
                            {user?.designationName && (
                              <Chip 
                                label={user.designationName} 
                                size="small" 
                                sx={{ height: 18, fontSize: '0.65rem', bgcolor: 'primary.light', color: 'primary.dark', fontWeight: 700 }} 
                              />
                            )}
                            {user?.departmentName && (
                              <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.65rem' }}>
                                • {user.departmentName}
                              </Typography>
                            )}
                          </Stack>
                        )}
                      </Grid>
                      <Grid>
                        <IconButton onClick={handleOpenNewChat} size="large" aria-label="new chat" color="primary">
                          <GroupAddTwoToneIcon />
                        </IconButton>
                      </Grid>
                      <Grid>
                        <IconButton onClick={handleClickRightMenu} size="large" aria-label="expandMore">
                          <ExpandMoreIcon />
                        </IconButton>
                        <Menu
                          id="simple-menu"
                          anchorEl={anchorEl}
                          keepMounted
                          open={Boolean(anchorEl)}
                          onClose={handleCloseRightMenu}
                          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                        >
                          <MenuItem onClick={handleRightMenuItemClick('available')}><AvatarStatus status="available" mr={1} /> Available</MenuItem>
                          <MenuItem onClick={handleRightMenuItemClick('do_not_disturb')}><AvatarStatus status="do_not_disturb" mr={1} /> Do not disturb</MenuItem>
                          <MenuItem onClick={handleRightMenuItemClick('offline')}><AvatarStatus status="offline" mr={1} /> Offline</MenuItem>
                        </Menu>
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid size={12} sx={{ position: 'relative' }}>
                    <OutlinedInput
                      fullWidth
                      value={searchQuery}
                      onChange={handleSearchChange}
                      id="input-search-header"
                      placeholder="Search Chats"
                      startAdornment={
                        <InputAdornment position="start">
                          <SearchTwoToneIcon fontSize="small" />
                        </InputAdornment>
                      }
                    />
                  </Grid>
                </Grid>
              </Box>
              <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
                <SimpleBar sx={{ height: '100%', overflowX: 'hidden' }}>
                  <Box sx={{ p: 3, pt: 0 }}>
                    <UserList channels={filteredChannels} setChannel={setChannel} activeChannel={activeChannel} currentUserId={currentUserId} />
                  </Box>
                </SimpleBar>
              </Box>
            </>
          ) : (
            <>
              <Box sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', p: 2, display: 'flex', alignItems: 'center', gap: 2, borderTopLeftRadius: { lg: `${borderRadius}px` } }}>
                <IconButton onClick={handleBackToChats} sx={{ color: 'inherit' }} size="small">
                  <ArrowBackTwoToneIcon />
                </IconButton>
                <Typography variant="h4" sx={{ color: 'inherit' }}>New chat</Typography>
              </Box>
              <Box sx={{ p: 2, flexShrink: 0, bgcolor: 'background.paper', borderBottom: '1px solid', borderColor: 'divider' }}>
                <OutlinedInput
                  fullWidth
                  size="small"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder="Search name or ID"
                  startAdornment={<InputAdornment position="start"><SearchTwoToneIcon fontSize="small" /></InputAdornment>}
                  sx={{ borderRadius: '24px', bgcolor: 'grey.50' }}
                />
              </Box>
              <Box sx={{ flexGrow: 1, overflow: 'hidden', bgcolor: 'background.paper' }}>
                <SimpleBar sx={{ height: '100%', overflowX: 'hidden' }}>
                  <List sx={{ pt: 0 }}>
                    {!searchQuery && (
                      <ListItemButton onClick={() => setOpenGroupDialog(true)} sx={{ py: 1.5 }}>
                        <ListItemIcon>
                          <Avatar sx={{ bgcolor: 'success.main', color: '#fff', width: 40, height: 40 }}>
                            <GroupAddTwoToneIcon />
                          </Avatar>
                        </ListItemIcon>
                        <ListItemText primary={<Typography variant="subtitle1" sx={{ fontWeight: 600 }}>New group</Typography>} />
                      </ListItemButton>
                    )}
                    {filteredContacts.length > 0 && !searchQuery && (
                      <Typography variant="subtitle2" sx={{ px: 3, py: 1, color: 'text.secondary', bgcolor: 'grey.50' }}>Contacts on Autonoma</Typography>
                    )}
                    {filteredContacts.map(u => (
                      <ListItemButton key={u.userId} onClick={() => handleStartDirectChat(u.userId)} sx={{ py: 1 }}>
                        <ListItemIcon>
                          <Avatar src={u.imgName ? getUserImageUrl(u.imgName) : ''} alt={u.employeeName} sx={{ width: 40, height: 40 }} />
                        </ListItemIcon>
                        <ListItemText primary={<Typography variant="subtitle1">{u.employeeName}</Typography>} secondary={u.designationName} />
                      </ListItemButton>
                    ))}
                  </List>
                </SimpleBar>
              </Box>
            </>
          )}
        </MainCard>
      )}

      <Dialog open={openGroupDialog} onClose={() => setOpenGroupDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle>Create New Group</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Group Name"
            type="text"
            fullWidth
            variant="outlined"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
          />
          <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>Select Contacts</Typography>
          <List sx={{ maxHeight: 250, overflow: 'auto', border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
            {allContacts.length === 0 ? (
              <Typography variant="body2" color="textSecondary" sx={{ p: 2, textAlign: 'center' }}>No users found</Typography>
            ) : (
              allContacts.map(u => (
                <ListItemButton key={u.userId} onClick={() => {
                  const currentIndex = selectedUsers.indexOf(u.userId);
                  const newChecked = [...selectedUsers];
                  if (currentIndex === -1) {
                    newChecked.push(u.userId);
                  } else {
                    newChecked.splice(currentIndex, 1);
                  }
                  setSelectedUsers(newChecked);
                }}>
                  <ListItemIcon>
                    <Checkbox edge="start" checked={selectedUsers.indexOf(u.userId) !== -1} disableRipple />
                  </ListItemIcon>
                  <ListItemIcon>
                    <Avatar src={u.imgName ? getUserImageUrl(u.imgName) : ''} sx={{ width: 32, height: 32 }} />
                  </ListItemIcon>
                  <ListItemText primary={u.employeeName} secondary={u.designationName} />
                </ListItemButton>
              ))
            )}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setOpenGroupDialog(false); setGroupName(''); setSelectedUsers([]); }}>Cancel</Button>
          <Button onClick={handleCreateGroup} variant="contained" disabled={!groupName || selectedUsers.length === 0}>Create</Button>
        </DialogActions>
      </Dialog>
    </Drawer>
  );
}

ChatDrawer.propTypes = {
  handleDrawerOpen: PropTypes.func,
  openChatDrawer: PropTypes.oneOfType([PropTypes.any, PropTypes.bool]),
  setChannel: PropTypes.func,
  channels: PropTypes.array,
  activeChannel: PropTypes.object,
  currentUserId: PropTypes.string
};
