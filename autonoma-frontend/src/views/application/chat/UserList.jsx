import PropTypes from 'prop-types';
import { Fragment } from 'react';

// material-ui
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';

// project imports
import AvatarStatus from './AvatarStatus';
import { getUserImageUrl } from 'utils/upload-helper';
import Badge from '@mui/material/Badge';
import Avatar from '@mui/material/Avatar';

export default function UserList({ channels, setChannel, activeChannel, currentUserId }) {
  if (!channels) return null;

  return (
    <List component="nav">
      {channels.map((channel) => {
        let displayMember = channel.members?.find(m => m.userId !== currentUserId);
        if (!displayMember && channel.members?.length > 0) {
           displayMember = channel.members[0];
        }
        const isGroup = channel.channelType === 'GROUP' || channel.isGroup;
        const displayName = (!isGroup && displayMember?.employeeName) ? displayMember.employeeName : (channel.channelName || 'Unknown');
        const avatarSrc = (!isGroup && displayMember?.imgName) ? getUserImageUrl(displayMember.imgName) : (channel.imgName ? getUserImageUrl(channel.imgName) : '');
        const onlineStatus = displayMember?.isOnline ? 'available' : 'offline';

        return (
          <Fragment key={channel.id}>
            <ListItemButton selected={activeChannel?.id === channel.id} onClick={() => setChannel(channel)}>
              <ListItemAvatar>
                <Badge
                  overlap="circular"
                  badgeContent={!isGroup ? <AvatarStatus status={onlineStatus} /> : null}
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                >
                  <Avatar alt={displayName} src={avatarSrc} />
                </Badge>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Grid container spacing={1} component="span" sx={{ alignItems: 'center' }}>
                    <Grid component="span" size="grow">
                      <Typography
                        variant="h5"
                        component="span"
                        sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block', color: 'inherit' }}
                      >
                        {displayName}
                      </Typography>
                    </Grid>
                    <Grid component="span">
                      <Typography component="span" variant="subtitle2">
                        {channel.lastMessageTime ? new Date(channel.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </Typography>
                    </Grid>
                  </Grid>
                }
                secondary={
                  <Grid container spacing={1} component="span" sx={{ alignItems: 'center' }}>
                    <Grid component="span" size="grow">
                      <Typography
                        variant="caption"
                        component="span"
                        sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}
                      >
                        {channel.lastMessage || 'No messages yet'}
                      </Typography>
                    </Grid>
                    <Grid component="span">
                      {channel.unreadCount && channel.unreadCount !== 0 ? (
                        <Chip
                          slotProps={{ label: { sx: { px: 0.5 } } }}
                          label={channel.unreadCount}
                          component="span"
                          color="secondary"
                          variant="filled"
                          sx={{ width: 20, height: 20 }}
                        />
                      ) : null}
                    </Grid>
                  </Grid>
                }
              />
            </ListItemButton>
            <Divider />
          </Fragment>
        );
      })}
    </List>
  );
}

UserList.propTypes = { channels: PropTypes.array, setChannel: PropTypes.func, activeChannel: PropTypes.object, currentUserId: PropTypes.string };
