import TextField from 'ui-component/CustomTextField';
import { useEffect, useRef, useState, useMemo, forwardRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';

// material-ui
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import Chip from '@mui/material/Chip';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import Stack from '@mui/material/Stack';

import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Badge from '@mui/material/Badge';
import IconButton from '@mui/material/IconButton';

import axiosServices from 'utils/axios';

import { useSnackbar, SnackbarContent, closeSnackbar } from 'notistack';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import Transitions from 'ui-component/extended/Transitions';
import NotificationList from './NotificationList';
import useAuth from 'hooks/useAuth';

// assets
import { IconBell, IconX } from '@tabler/icons-react';

// notification status options
const status = [
  {
    value: 'all',
    label: 'All Notification'
  },
  {
    value: 'new',
    label: 'New'
  },
  {
    value: 'unread',
    label: 'Unread'
  },
  {
    value: 'other',
    label: 'Other'
  }
];

const playNotificationSound = () => {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
    oscillator.frequency.exponentialRampToValueAtTime(880.00, audioCtx.currentTime + 0.1); // A5

    gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.2, audioCtx.currentTime + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.start(audioCtx.currentTime);
    oscillator.stop(audioCtx.currentTime + 0.3);
  } catch (error) {}
};

// ==============================|| AUDIT NOTIFICATION TOAST ||============================== //

const AuditNotificationToast = forwardRef(({ id, notif, onClose, onClick }, ref) => {
  const theme = useTheme();
  return (
    <SnackbarContent ref={ref} role="alert" style={{ justifyContent: 'flex-end' }}>
      <Card
        onClick={onClick}
        sx={{
          width: '100%',
          minWidth: 280,
          maxWidth: 360,
          bgcolor: theme.vars ? theme.vars.palette.background.paper : theme.palette.background.paper,
          border: '1px solid',
          borderColor: theme.vars ? theme.vars.palette.divider : theme.palette.divider,
          borderRadius: '12px',
          boxShadow: theme.shadows[8],
          cursor: 'pointer',
          overflow: 'hidden',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: theme.shadows[12]
          }
        }}
      >
        <Box sx={{ p: 2, display: 'flex', gap: 1.5, alignItems: 'flex-start', position: 'relative' }}>
          <Avatar
            variant="rounded"
            sx={{
              width: 36,
              height: 36,
              bgcolor: theme.vars ? theme.vars.palette.primary.light : theme.palette.primary.light,
              color: theme.vars ? theme.vars.palette.primary.main : theme.palette.primary.main,
              flexShrink: 0
            }}
          >
            <IconBell size={20} />
          </Avatar>
          <Box sx={{ flex: 1, pr: 3 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5, lineHeight: 1.3 }}>
              {notif.title}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: theme.vars ? theme.vars.palette.text.secondary : theme.palette.text.secondary,
                whiteSpace: 'pre-line',
                fontSize: '0.825rem',
                lineHeight: 1.4
              }}
            >
              {notif.message}
            </Typography>
          </Box>
          <IconButton
            size="small"
            onClick={onClose}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              color: theme.vars ? theme.vars.palette.text.secondary : theme.palette.text.secondary,
              '&:hover': { color: theme.vars ? theme.vars.palette.error.main : theme.palette.error.main }
            }}
          >
            <IconX size={16} />
          </IconButton>
        </Box>
      </Card>
    </SnackbarContent>
  );
});

// ==============================|| NOTIFICATION ||============================== //

export default function NotificationSection() {
  const theme = useTheme();
  const downMD = useMediaQuery(theme.breakpoints.down('md'));
  const { enqueueSnackbar } = useSnackbar();

  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');

  /**
   * anchorRef is used on different componets and specifying one type leads to other components throwing an error
   * */
  const anchorRef = useRef(null);

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }
    setOpen(false);
  };

  const prevOpen = useRef(open);
  useEffect(() => {
    if (prevOpen.current === true && open === false) {
      anchorRef.current.focus();
    }
    prevOpen.current = open;
  }, [open]);

  const handleChange = (event) => {
    event?.target.value && setValue(event?.target.value);
  };

  const navigate = useNavigate();
  const { user } = useAuth();
  const [channels, setChannels] = useState([]);
  const channelsRef = useRef([]);
  const [notifications, setNotifications] = useState([]);
  const notifsRef = useRef([]);

  const fetchNotifications = async () => {
    if (!user || !user.empId) return;
    try {
      const res = await axiosServices.get(`/api/notifications/all/${user.empId}`);
      const currentNotifs = notifsRef.current;
      if (currentNotifs.length > 0) {
        res.data.forEach(newNotif => {
          if (!newNotif.isRead) {
            const oldNotif = currentNotifs.find(n => n.id === newNotif.id);
            if (!oldNotif) {
              enqueueSnackbar('', {
                variant: 'info',
                anchorOrigin: { vertical: 'top', horizontal: 'right' },
                persist: true,
                content: (key) => (
                  <AuditNotificationToast
                    id={key}
                    notif={newNotif}
                    onClose={(e) => {
                      e.stopPropagation();
                      closeSnackbar(key);
                    }}
                    onClick={() => {
                      closeSnackbar();
                      handleNotifClick(newNotif);
                    }}
                  />
                )
              });
              playNotificationSound();
            }
          }
        });
      }
      setNotifications(res.data);
      notifsRef.current = res.data;
    } catch (e) {
      console.error('Failed to fetch notifications', e);
    }
  };

  useEffect(() => {
    const fetchChannels = async () => {
      const token = sessionStorage.getItem('serviceToken');
      if (!token) return;
      try {
        const res = await axiosServices.get('/api/chat/channels');
        const currentChannels = channelsRef.current;
        if (currentChannels.length > 0) {
          res.data.forEach(newChan => {
            const oldChan = currentChannels.find(c => c.id === newChan.id);
            if (oldChan && (newChan.unreadCount || 0) > (oldChan.unreadCount || 0)) {
               enqueueSnackbar(`New message in ${newChan.channelName}`, { variant: 'info', anchorOrigin: { vertical: 'top', horizontal: 'right' } });
               playNotificationSound();
            }
          });
        }
        setChannels(res.data);
        channelsRef.current = res.data;
      } catch(e) {}
    };
    fetchChannels();
    const interval = setInterval(fetchChannels, 10000);
    return () => clearInterval(interval);
  }, [enqueueSnackbar]);

  useEffect(() => {
    if (!user || !user.empId) return;
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, [user, enqueueSnackbar]);

  const handleNotifClick = async (notif) => {
    try {
      if (!notif.isRead) {
        await axiosServices.put(`/api/notifications/${notif.id}/read`);
      }
      setOpen(false);
      fetchNotifications();
      if (notif.linkUrl) {
        navigate(notif.linkUrl);
      }
    } catch (e) {
      console.error('Failed to handle notification click', e);
    }
  };

  const handleNotifDismiss = async (notif, event) => {
    if (event) event.stopPropagation();
    try {
      await axiosServices.put(`/api/notifications/${notif.id}/read`);
      fetchNotifications();
    } catch (e) {
      console.error('Failed to dismiss notification', e);
    }
  };

  const handleMarkAllRead = async () => {
    if (!user || !user.empId) return;
    try {
      await axiosServices.put(`/api/notifications/read-all/${user.empId}`);
      fetchNotifications();
    } catch (e) {
      console.error('Failed to mark all as read', e);
    }
  };

  const chatUnread = useMemo(() => {
    const unreadChannels = channels.filter(c => c.unreadCount > 0);
    return unreadChannels.reduce((sum, c) => sum + (c.unreadCount || 0), 0);
  }, [channels]);

  const appUnread = useMemo(() => {
    return notifications.filter(n => !n.isRead).length;
  }, [notifications]);

  const totalUnread = chatUnread + appUnread;

  const filteredNotifications = useMemo(() => {
    if (value === 'unread' || value === 'new') {
      return notifications.filter(n => !n.isRead);
    }
    if (value === 'other') {
      return notifications.filter(n => n.isRead);
    }
    return notifications; // 'all'
  }, [notifications, value]);

  return (
    <>
      <Box sx={{ ml: 2 }}>
        <Avatar
          variant="rounded"
          sx={{
            ...theme.typography.commonAvatar,
            ...theme.typography.mediumAvatar,
            transition: 'all .2s ease-in-out',
            color: theme.vars.palette.warning.dark,
            background: theme.vars.palette.warning.light,
            '&:hover, &[aria-controls="menu-list-grow"]': {
              color: theme.vars.palette.warning.light,
              background: theme.vars.palette.warning.dark
            },
            ...theme.applyStyles('dark', {
              color: theme.vars.palette.warning.dark,
              background: theme.vars.palette.dark.main,
              '&:hover, &[aria-controls="menu-list-grow"]': {
                color: theme.vars.palette.grey[800],
                background: theme.vars.palette.warning.dark
              }
            })
          }}
          ref={anchorRef}
          aria-controls={open ? 'menu-list-grow' : undefined}
          aria-haspopup="true"
          onClick={handleToggle}
        >
          <Badge color="error" badgeContent={totalUnread} max={99}>
            <IconBell stroke={1.5} size="20px" />
          </Badge>
        </Avatar>
      </Box>
      <Popper
        placement={downMD ? 'bottom' : 'bottom-end'}
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        transition
        disablePortal
        modifiers={[{ name: 'offset', options: { offset: [downMD ? 5 : 0, 20] } }]}
      >
        {({ TransitionProps }) => (
          <ClickAwayListener onClickAway={handleClose}>
            <Transitions position={downMD ? 'top' : 'top-right'} in={open} {...TransitionProps}>
              <Paper>
                <MainCard border={false} elevation={16} content={false} boxShadow shadow={theme.shadows[16]} sx={{ maxWidth: 330 }}>
                  <Stack sx={{ gap: 2 }}>
                    <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', pt: 2, px: 2 }}>
                      <Stack direction="row" sx={{ gap: 2 }}>
                        <Typography variant="subtitle1">All Notification</Typography>
                        {totalUnread > 0 && (
                          <Chip size="small" label={totalUnread} variant="filled" sx={{ color: 'background.default', bgcolor: 'warning.dark' }} />
                        )}
                      </Stack>
                      <Typography 
                        variant="subtitle2" 
                        onClick={handleMarkAllRead} 
                        sx={{ color: 'primary.main', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                      >
                        Mark as all read
                      </Typography>
                    </Stack>
                    <Box sx={{ height: 1, maxHeight: 'calc(100vh - 205px)', overflowX: 'hidden', '&::-webkit-scrollbar': { width: 5 } }}>
                      <Box sx={{ px: 2, pt: 0.25 }}>
                        <TextField
                           id="outlined-select-currency-native"
                          select
                          fullWidth
                          value={value}
                          onChange={handleChange}
                          slotProps={{ select: { native: true } }}
                        >
                          {status.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </TextField>
                      </Box>
                      <Divider sx={{ mt: 2 }} />
                      <NotificationList 
                        notifications={filteredNotifications} 
                        onNotifClick={handleNotifClick} 
                        onNotifDismiss={handleNotifDismiss} 
                      />
                    </Box>
                  </Stack>
                  <CardActions sx={{ p: 1.25, justifyContent: 'center' }}>
                    <Button size="small" disableElevation>
                      View All
                    </Button>
                  </CardActions>
                </MainCard>
              </Paper>
            </Transitions>
          </ClickAwayListener>
        )}
      </Popper>
    </>
  );
}
