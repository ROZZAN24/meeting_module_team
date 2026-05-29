import PropTypes from 'prop-types';

// material-ui
import { useTheme } from '@mui/material/styles';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// project imports
import { withAlpha } from 'utils/colorUtils';

// assets
import { IconBrandTelegram, IconBuildingStore, IconMailbox, IconPhoto } from '@tabler/icons-react';
import User1 from 'assets/images/users/avatar-1.png';

function ListItemWrapper({ children }) {
  const theme = useTheme();

  return (
    <Box
      sx={{
        p: 2,
        borderBottom: '1px solid',
        borderColor: 'divider',
        cursor: 'pointer',
        '&:hover': {
          bgcolor: withAlpha(theme.palette.grey[200], 0.3),
          ...theme.applyStyles('dark', { bgcolor: 'dark.900' })
        }
      }}
    >
      {children}
    </Box>
  );
}

// ==============================|| NOTIFICATION LIST ITEM ||============================== //

export default function NotificationList({ notifications = [] }) {
  const theme = useTheme();
  const containerSX = { gap: 2, pl: 7 };

  if (!notifications || notifications.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="body2" color="textSecondary">No new notifications</Typography>
      </Box>
    );
  }

  return (
    <List sx={{ width: '100%', maxWidth: { xs: 300, md: 330 }, py: 0 }}>
      {notifications.map((chan, index) => (
        <ListItemWrapper key={chan.id || index}>
          <ListItem
            alignItems="center"
            disablePadding
            secondaryAction={
              <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'flex-end' }}>
                <Typography variant="caption">
                  {chan.lastMessageTime ? new Date(chan.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'now'}
                </Typography>
              </Stack>
            }
          >
            <ListItemAvatar>
              <Avatar alt={chan.channelName} src={User1} />
            </ListItemAvatar>
            <ListItemText primary={chan.channelName} />
          </ListItem>
          <Stack sx={containerSX}>
            <Typography variant="subtitle2" sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {chan.lastMessageSender ? `${chan.lastMessageSender}: ` : ''}{chan.lastMessage || 'Sent an attachment'}
            </Typography>
            <Stack direction="row" sx={{ alignItems: 'center', gap: 1 }}>
              <Chip label={`${chan.unreadCount} Unread`} color="error" size="small" sx={{ width: 'min-content' }} />
            </Stack>
          </Stack>
        </ListItemWrapper>
      ))}
    </List>
  );
}

ListItemWrapper.propTypes = { children: PropTypes.node };
