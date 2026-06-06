import PropTypes from 'prop-types';

// material-ui
import { useTheme } from '@mui/material/styles';
import Avatar from '@mui/material/Avatar';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';

// project imports
import { withAlpha } from 'utils/colorUtils';

// assets
import { IconBell, IconX, IconInfoCircle } from '@tabler/icons-react';

function ListItemWrapper({ children, isRead, onClick }) {
  const theme = useTheme();

  return (
    <Box
      onClick={onClick}
      sx={{
        p: 2,
        borderBottom: '1px solid',
        borderColor: 'divider',
        cursor: 'pointer',
        bgcolor: isRead ? 'transparent' : withAlpha(theme.palette.primary.light, 0.15),
        '&:hover': {
          bgcolor: isRead ? withAlpha(theme.palette.grey[200], 0.3) : withAlpha(theme.palette.primary.light, 0.25),
          ...theme.applyStyles('dark', { 
            bgcolor: isRead ? 'dark.900' : withAlpha(theme.palette.primary.dark, 0.2) 
          })
        }
      }}
    >
      {children}
    </Box>
  );
}

ListItemWrapper.propTypes = {
  children: PropTypes.node,
  isRead: PropTypes.bool,
  onClick: PropTypes.func
};

const formatTime = (dateStr) => {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    const today = new Date();
    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  } catch (e) {
    return '';
  }
};

export default function NotificationList({ notifications = [], onNotifClick, onNotifDismiss }) {
  const theme = useTheme();
  const containerSX = { gap: 1, pl: 7 };

  if (!notifications || notifications.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="body2" color="textSecondary">No notifications</Typography>
      </Box>
    );
  }

  return (
    <List sx={{ width: '100%', maxWidth: { xs: 300, md: 330 }, py: 0 }}>
      {notifications.map((notif, index) => (
        <ListItemWrapper key={notif.id || index} isRead={notif.isRead} onClick={() => onNotifClick && onNotifClick(notif)}>
          <ListItem
            alignItems="flex-start"
            disablePadding
            secondaryAction={
              <Stack direction="row" sx={{ alignItems: 'center', gap: 0.5 }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', whiteSpace: 'nowrap', mr: 0.5 }}>
                  {formatTime(notif.createdAt)}
                </Typography>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    onNotifClick && onNotifClick(notif);
                  }}
                  sx={{ 
                    p: 0.25,
                    color: 'primary.main',
                    '&:hover': { color: 'primary.dark' }
                  }}
                  title="View Details"
                >
                  <IconInfoCircle size={15} />
                </IconButton>
                {!notif.isRead && (
                  <IconButton
                    size="small"
                    color="error"
                    onClick={(e) => onNotifDismiss && onNotifDismiss(notif, e)}
                    sx={{ p: 0.25 }}
                    title="Dismiss"
                  >
                    <IconX size={15} />
                  </IconButton>
                )}
              </Stack>
            }
          >
            <ListItemAvatar sx={{ minWidth: 44 }}>
              <Avatar 
                variant="rounded"
                sx={{ 
                  width: 32, 
                  height: 32, 
                  bgcolor: notif.isRead ? 'grey.300' : 'primary.light',
                  color: notif.isRead ? 'grey.600' : 'primary.main' 
                }}
              >
                <IconBell size={18} />
              </Avatar>
            </ListItemAvatar>
            <ListItemText 
              primary={
                <Typography variant="subtitle2" sx={{ fontWeight: notif.isRead ? 500 : 700, pr: '120px' }}>
                  {notif.title}
                </Typography>
              } 
            />
          </ListItem>
          <Stack sx={containerSX}>
            <Typography 
              variant="body2" 
              sx={{ 
                color: 'text.secondary', 
                whiteSpace: 'pre-line',
                fontSize: '0.8rem',
                lineHeight: 1.4
              }}
            >
              {notif.message}
            </Typography>
          </Stack>
        </ListItemWrapper>
      ))}
    </List>
  );
}

NotificationList.propTypes = {
  notifications: PropTypes.array,
  onNotifClick: PropTypes.func,
  onNotifDismiss: PropTypes.func
};
