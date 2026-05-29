import React, { useEffect, useState, useRef, useTransition } from 'react';

// material-ui
import { useTheme, styled } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import CircularProgress from '@mui/material/CircularProgress';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Collapse from '@mui/material/Collapse';
import Divider from '@mui/material/Divider';
import Dialog from '@mui/material/Dialog';
import Grid from '@mui/material/Grid';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Popper from '@mui/material/Popper';
import OutlinedInput from '@mui/material/OutlinedInput';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import TextField from '@mui/material/TextField';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Checkbox from '@mui/material/Checkbox';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import InputBase from '@mui/material/InputBase';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';

// third party
import EmojiPicker, { SkinTones } from 'emoji-picker-react';
import { useSnackbar } from 'notistack';

// project imports
import UserDetails from './UserDetails';
import ChatDrawer from './ChatDrawer';
import ChartHistory from './ChartHistory';
import AvatarStatus from './AvatarStatus';

import Loader from 'ui-component/Loader';
import MainCard from 'ui-component/cards/MainCard';
import Avatar from 'ui-component/extended/Avatar';
import SimpleBar from 'ui-component/third-party/SimpleBar';

import { appDrawerWidth as drawerWidth, gridSpacing } from 'store/constant';
import { withAlpha } from 'utils/colorUtils';
import { getImageUrl, ImagePath } from 'utils/getImageUrl';
import { getUserImageUrl } from 'utils/upload-helper';

import axiosServices from 'utils/axios';
import useAuth from 'hooks/useAuth';
import { useWebRTC } from 'hooks/useWebRTC';

// assets
import AttachmentTwoToneIcon from '@mui/icons-material/AttachmentTwoTone';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import MoreHorizTwoToneIcon from '@mui/icons-material/MoreHorizTwoTone';
import ErrorTwoToneIcon from '@mui/icons-material/ErrorTwoTone';
import VideoCallTwoToneIcon from '@mui/icons-material/VideoCallTwoTone';
import CallTwoToneIcon from '@mui/icons-material/CallTwoTone';
import SendTwoToneIcon from '@mui/icons-material/SendTwoTone';
import MoodTwoToneIcon from '@mui/icons-material/MoodTwoTone';
import HighlightOffTwoToneIcon from '@mui/icons-material/HighlightOffTwoTone';
import MicTwoToneIcon from '@mui/icons-material/MicTwoTone';
import StopCircleTwoToneIcon from '@mui/icons-material/StopCircleTwoTone';
import DeleteTwoToneIcon from '@mui/icons-material/DeleteTwoTone';
import PauseTwoToneIcon from '@mui/icons-material/PauseTwoTone';
import ChatTwoToneIcon from '@mui/icons-material/ChatTwoTone';
import ForwardToInboxTwoToneIcon from '@mui/icons-material/ForwardToInboxTwoTone';
import CloseTwoToneIcon from '@mui/icons-material/CloseTwoTone';
import ReplyTwoToneIcon from '@mui/icons-material/ReplyTwoTone';

// call icons
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import VideocamOutlinedIcon from '@mui/icons-material/VideocamOutlined';
import VideocamOffOutlinedIcon from '@mui/icons-material/VideocamOffOutlined';
import MicOutlinedIcon from '@mui/icons-material/MicOutlined';
import MicOffOutlinedIcon from '@mui/icons-material/MicOffOutlined';
import PresentToAllOutlinedIcon from '@mui/icons-material/PresentToAllOutlined';
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';
import ChatOutlinedIcon from '@mui/icons-material/ChatOutlined';
import CallEndIcon from '@mui/icons-material/CallEnd';

// drawer content element
const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })(({ theme, open }) => ({
  flexGrow: 1,
  paddingLeft: open ? theme.spacing(3) : 0,
  transition: theme.transitions.create('margin', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.shorter
  }),
  marginLeft: `-${drawerWidth}px`,
  [theme.breakpoints.down('lg')]: {
    paddingLeft: 0,
    marginLeft: 0
  },
  ...(open && {
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.shorter
    }),
    marginLeft: 0
  })
}));

// ==============================|| APPLICATION CHAT ||============================== //

export default function ChatMainPage() {
  const theme = useTheme();
  const downLG = useMediaQuery(theme.breakpoints.down('lg'));
  const downMD = useMediaQuery((theme) => theme.breakpoints.down('md'));
  const { enqueueSnackbar } = useSnackbar();

  const [loading, setLoading] = useState(false);
  const { user: authUser } = useAuth();
  const currentUserId = authUser?.userId || authUser?.id || 'bos';

  // handle right sidebar dropdown menu
  const [anchorEl, setAnchorEl] = React.useState(null);
  const handleClickSort = (event) => {
    setAnchorEl(event?.currentTarget);
  };

  const handleCloseSort = () => {
    setAnchorEl(null);
  };

  // set chat details page open when user is selected from sidebar
  const [emailDetails, setEmailDetails] = React.useState(false);
  const handleUserChange = (event) => {
    setEmailDetails((prev) => !prev);
  };

  // toggle sidebar
  const [openChatDrawer, setOpenChatDrawer] = React.useState(true);
  const handleDrawerOpen = () => {
    setOpenChatDrawer((prevState) => !prevState);
  };

  // close sidebar when widow size below 'md' breakpoint
  useEffect(() => {
    setOpenChatDrawer(!downLG);
  }, [downLG]);

  const [channels, setChannels] = useState([]);
  const [activeChannel, setActiveChannel] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isChatLoading, setIsChatLoading] = useState(false);

  const [sortType, setSortType] = useState('Date'); // 'Date', 'Name', 'Unread'
  
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState([]);
  const [replyingTo, setReplyingTo] = useState(null);
  
  const [reactions, setReactions] = useState({}); // { msgId: ['👍', '❤️'] }
  const handleReact = (msgId, emoji) => {
    setReactions(prev => {
      const current = prev[msgId] || [];
      if (current.includes(emoji)) {
        return { ...prev, [msgId]: current.filter(e => e !== emoji) };
      }
      return { ...prev, [msgId]: [...current, emoji] };
    });
  };

  const [forwardDialogOpen, setForwardDialogOpen] = useState(false);
  const [forwardSearch, setForwardSearch] = useState('');
  const [forwardSelectedChannels, setForwardSelectedChannels] = useState([]);
  const [forwardText, setForwardText] = useState('');

  const sortedChannels = [...channels].sort((a, b) => {
    if (sortType === 'Name') return a.channelName.localeCompare(b.channelName);
    if (sortType === 'Unread') return (b.unreadCount || 0) - (a.unreadCount || 0);
    // default Date
    return new Date(b.lastMessageTime || 0) - new Date(a.lastMessageTime || 0);
  });

  const channelsRef = useRef(channels);
  useEffect(() => { channelsRef.current = channels; }, [channels]);

  const messagesRef = useRef(messages);
  useEffect(() => { messagesRef.current = messages; }, [messages]);

  const pollingRef = useRef(null);
  useEffect(() => {
    fetchChannels();
    pollingRef.current = setInterval(() => {
      pollData();
    }, 3000);
    return () => clearInterval(pollingRef.current);
  }, [activeChannel?.id]);

  const scrollRef = useRef(null);
  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    if (!isChatLoading && messages.length > 0) {
      setTimeout(scrollToBottom, 50);
    }
  }, [messages, isChatLoading]);

  const fetchChannels = async () => {
    try {
      const res = await axiosServices.get('/api/chat/channels');
      setChannels(res.data);
    } catch (e) { }
  };

  const fetchSmartReplies = async (channelId) => {
    try {
      const res = await axiosServices.get(`/api/chat/channels/${channelId}/smart-replies`);
      if (res.data && res.data.suggestions) {
        setSmartReplies(res.data.suggestions.slice(0, 5));
      } else {
        setSmartReplies([]);
      }
    } catch (e) {
      setSmartReplies([]);
    }
  };

  const pollData = async () => {
    try {
      const resChan = await axiosServices.get('/api/chat/channels');
      setChannels(resChan.data);

      if (activeChannel) {
        const resMsg = await axiosServices.get(`/api/chat/channels/${activeChannel.id}/messages`);
        const currentMessages = messagesRef.current || [];
        if (currentMessages.length !== resMsg.data.length) {
          setMessages(resMsg.data);
          fetchSmartReplies(activeChannel.id);
          setTimeout(scrollToBottom, 100);
        }
      }
    } catch (e) { }
  };

  const [smartReplies, setSmartReplies] = useState([]);

  const handleChannelSelect = async (chan) => {
    setActiveChannel(chan);
    setIsChatLoading(true);
    setMessages([]);
    setSmartReplies([]);

    try {
      const res = await axiosServices.get(`/api/chat/channels/${chan.id}/messages`);
      setMessages(res.data);
      setIsChatLoading(false); // Instantly show messages

      // Run secondary updates in the background without blocking the UI
      axiosServices.post(`/api/chat/channels/${chan.id}/read`)
        .then(() => fetchChannels())
        .catch(console.error);
        
      fetchSmartReplies(chan.id);
    } catch (e) {
      console.error(e);
      setIsChatLoading(false);
    }
  };

  const handleDeleteChat = async () => {
    if (!activeChannel) return;
    try {
      await axiosServices.delete(`/api/chat/channels/${activeChannel.id}`);
      setActiveChannel(null);
      setMessages([]);
      fetchChannels();
    } catch (e) {
      console.error("Failed to delete chat", e);
    }
    handleCloseSort();
  };

  const handleReply = (msg) => {
    setReplyingTo(msg);
    document.getElementById('message-send')?.focus();
  };

  const handleForward = (msg) => {
    setSelectedMessages([msg]);
    setForwardSelectedChannels([]);
    setForwardSearch('');
    setForwardText('');
    setForwardDialogOpen(true);
  };

  const handleToggleSelect = (msg) => {
    if (!selectionMode) setSelectionMode(true);
    setSelectedMessages(prev => {
      const isSelected = prev.some(m => m.id === msg.id);
      if (isSelected) {
        const next = prev.filter(m => m.id !== msg.id);
        if (next.length === 0) setSelectionMode(false);
        return next;
      }
      return [...prev, msg];
    });
  };

  const clearSelection = () => {
    setSelectionMode(false);
    setSelectedMessages([]);
  };

  const handleDeleteSelected = () => {
    // Basic frontend mockup for delete selected
    setMessages(prev => prev.filter(m => !selectedMessages.some(sm => sm.id === m.id)));
    clearSelection();
  };

  const fileInputRef = useRef(null);
  const handleAttachmentClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !activeChannel) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await axiosServices.post('/api/files/upload?module=CHAT_UPLOAD', formData);
      if (res.data) {
        await axiosServices.post('/api/chat/channels/messages', {
          channelId: activeChannel.id,
          messageType: 'FILE',
          attachmentUrl: res.data,
          attachmentName: file.name,
          attachmentType: file.type.includes('image') ? 'IMAGE' : (file.type.includes('pdf') ? 'PDF' : 'FILE')
        });
        const resMsg = await axiosServices.get(`/api/chat/channels/${activeChannel.id}/messages`);
        setMessages(resMsg.data);
        fetchChannels();
        fetchSmartReplies(activeChannel.id);
      }
    } catch (err) {
      console.error(err);
    }
    e.target.value = ''; // reset
  };


  // handle new message form
  const [message, setMessage] = useState('');

  const handleOnSend = async (textOverride) => {
    const textToSend = (typeof textOverride === 'string') ? textOverride.trim() : message.trim();
    if (!textToSend) return;
    if (!activeChannel) return;

    try {
      let finalMessage = textToSend;
      
      if (replyingTo) {
        finalMessage = `[REPLY_TO:${replyingTo.id}|${replyingTo.senderName}|${replyingTo.messageContent?.substring(0, 50) || 'Attachment'}]\n` + textToSend;
      }

      const payload = {
        channelId: activeChannel.id,
        messageType: 'TEXT',
        messageContent: finalMessage
      };

      await axiosServices.post('/api/chat/channels/messages', payload);
      
      if (typeof textOverride !== 'string') {
        setMessage('');
      }
      
      setReplyingTo(null);
      const resMsg = await axiosServices.get(`/api/chat/channels/${activeChannel.id}/messages`);
      setMessages(resMsg.data);
      fetchChannels();
      fetchSmartReplies(activeChannel.id);
      setTimeout(scrollToBottom, 100);
    } catch (e) {
      console.error(e);
      enqueueSnackbar('Failed to send message', { variant: 'error' });
    }
  };

  const handleForwardSubmit = async () => {
    try {
      for (const channelId of forwardSelectedChannels) {
        for (const msg of selectedMessages) {
          let text = `[FORWARDED_FROM:${msg.senderName}]\n` + (msg.messageContent || '');
          if (forwardText.trim()) text += `\n\n${forwardText.trim()}`;
          
          const payload = {
            channelId: channelId,
            messageType: msg.messageType || 'TEXT',
            messageContent: text,
            attachmentUrl: msg.attachmentUrl,
            attachmentName: msg.attachmentName,
            attachmentType: msg.attachmentType
          };
          await axiosServices.post('/api/chat/channels/messages', payload);
        }
      }
      enqueueSnackbar(`Forwarded ${selectedMessages.length} message(s) to ${forwardSelectedChannels.length} chat(s)`, { variant: 'success' });
      setForwardDialogOpen(false);
      clearSelection();
    } catch (e) {
      enqueueSnackbar('Failed to forward messages', { variant: 'error' });
    }
  };

  // voice recording logic
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const recordingTimerRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const startRecordingTimer = () => {
    setRecordingTime(0);
    recordingTimerRef.current = setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);
  };

  const stopRecordingTimer = () => {
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
  };

  const handleMicClick = async () => {
    if (!activeChannel) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = e => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        if (audioChunksRef.current.length === 0) return; // Cancelled
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const formData = new FormData();
        formData.append('file', audioBlob, 'voice_message.webm');

        try {
          const res = await axiosServices.post('/api/files/upload?module=CHAT_VOICE', formData);
          if (res.data) {
            await axiosServices.post('/api/chat/channels/messages', {
              channelId: activeChannel.id,
              messageType: 'VOICE',
              attachmentUrl: res.data
            });
            const resMsg = await axiosServices.get(`/api/chat/channels/${activeChannel.id}/messages`);
            setMessages(resMsg.data);
          }
        } catch (e) {
          console.error(e);
        }
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      startRecordingTimer();
    } catch (e) {
      console.error('Failed to start recording', e);
      enqueueSnackbar('Microphone permission denied', { variant: 'error' });
    }
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current) {
      audioChunksRef.current = []; // Empty chunks to prevent upload
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(t => t.stop());
    }
    setIsRecording(false);
    stopRecordingTimer();
  };

  const sendRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(t => t.stop());
    }
    setIsRecording(false);
    stopRecordingTimer();
  };

  // WebRTC Call Logic
  const [callingState, setCallingState] = useState(null); // null, 'RINGING', 'IN_CALL', 'INCOMING_CALL'
  const [callDuration, setCallDuration] = useState(0);
  const callTimerRef = useRef(null);
  const [incomingCallOffer, setIncomingCallOffer] = useState(null);
  const [incomingCallerId, setIncomingCallerId] = useState(null);
  
  const [incomingCallVideo, setIncomingCallVideo] = useState(false);

  const handleIncomingCall = (callerId, video, offer) => {
    setIncomingCallerId(callerId);
    setIncomingCallOffer(offer);
    setIncomingCallVideo(video);
    setCallingState('INCOMING_CALL');
  };

  const handleCallEnded = () => {
    setCallingState(null);
    if (callTimerRef.current) clearInterval(callTimerRef.current);
  };

  const {
    localStream,
    remoteStream,
    makeCall: startWebRTCCall,
    acceptCall: acceptWebRTCCall,
    rejectCall: rejectWebRTCCall,
    endCall: endWebRTCCall,
    toggleAudio,
    toggleVideo,
    isAudioEnabled,
    isVideoEnabled
  } = useWebRTC(currentUserId, handleIncomingCall, handleCallEnded);

  const startCall = (isVideo = false) => {
    if (!activeChannel) return;
    const targetUserId = activeChannel.members?.find(m => m.userId !== currentUserId)?.userId;
    if (!targetUserId) {
      enqueueSnackbar('Cannot call in a group chat yet', { variant: 'warning' });
      return;
    }
    setCallingState('RINGING');
    startWebRTCCall(targetUserId, isVideo);
  };

  const answerIncomingCall = () => {
    acceptWebRTCCall(incomingCallerId, incomingCallOffer, incomingCallVideo);
    setCallingState('IN_CALL');
    setCallDuration(0);
    callTimerRef.current = setInterval(() => setCallDuration(prev => prev + 1), 1000);
  };

  const declineIncomingCall = () => {
    rejectWebRTCCall(incomingCallerId);
    handleCallEnded();
  };

  const endCall = () => {
    const wasRinging = callingState === 'RINGING';
    endWebRTCCall();
    handleCallEnded();

    if (wasRinging && activeChannel) {
      const isVideo = incomingCallVideo; // assuming we track this, or we just say voice/video
      const text = isVideo ? '📞 Missed video call' : '📞 Missed voice call';
      const msgData = {
        channelId: activeChannel.id,
        messageType: 'SYSTEM',
        messageContent: text
      };
      axiosServices.post(`/api/chat/channels/messages`, msgData).then(() => {
        pollData();
      }).catch(err => console.error(err));
    }
  };


  // handle emoji
  const onEmojiClick = (emojiObject, event) => {
    setMessage(message + emojiObject.emoji);
  };

  const [anchorElEmoji, setAnchorElEmoji] = React.useState();
  const handleOnEmojiButtonClick = (event) => {
    setAnchorElEmoji(anchorElEmoji ? null : event?.currentTarget);
  };

  const emojiOpen = Boolean(anchorElEmoji);
  const emojiId = emojiOpen ? 'simple-popper' : undefined;
  const handleCloseEmoji = () => {
    setAnchorElEmoji(null);
  };

  if (loading) return <Loader />;

  return (
    <Box sx={{ display: 'flex', height: 'calc(100vh - 170px)', overflow: 'hidden' }}>
      <ChatDrawer openChatDrawer={openChatDrawer} handleDrawerOpen={handleDrawerOpen} setChannel={handleChannelSelect} channels={sortedChannels} activeChannel={activeChannel} currentUserId={currentUserId} />
      <Main open={openChatDrawer} sx={{ minWidth: 0, height: '100%' }}>
        <Grid container spacing={gridSpacing} sx={{ height: '100%' }}>
          <Grid
            size={{ xs: 12, md: emailDetails ? 8 : 12, xl: emailDetails ? 9 : 12 }}
            sx={(theme) => ({
              height: '100%',
              transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.easeOut,
                duration: theme.transitions.duration.shorter + 200
              })
            })}
          >
            <MainCard
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                bgcolor: 'grey.50',
                ...theme.applyStyles('dark', { bgcolor: 'dark.main' }),
                transition: theme.transitions.create('width', {
                  easing: theme.transitions.easing.easeOut,
                  duration: theme.transitions.duration.shorter + 200
                })
              }}
              content={false}
            >
              <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                {!activeChannel ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center', alignItems: 'center', p: 4, bgcolor: 'background.paper', textAlign: 'center' }}>
                    <Avatar sx={{ width: 120, height: 120, bgcolor: 'primary.light', color: 'primary.main', mb: 4 }}>
                      <ChatTwoToneIcon sx={{ fontSize: '4rem' }} />
                    </Avatar>
                    <Typography variant="h2" sx={{ mb: 2, fontWeight: 300, color: 'text.primary' }}>
                      Autonoma Oneconnect
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'text.secondary', maxWidth: 500, mb: 4 }}>
                      Experience seamless communication and smart collaboration with your colleagues. Select a conversation from the left panel or start a new chat to stay connected, productive, and engaged in real time.
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.disabled', mt: 'auto' }}>
                      <LockOutlinedIcon sx={{ fontSize: '0.8rem', verticalAlign: 'text-bottom', mr: 0.5 }} />
                      End-to-end encrypted
                    </Typography>
                  </Box>
                ) : (
                  <>
                    <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', bgcolor: selectionMode ? 'primary.light' : 'transparent', ...theme.applyStyles('dark', { bgcolor: selectionMode ? 'primary.dark' : 'transparent' }) }}>
                      <Grid container spacing={gridSpacing} sx={{ justifyContent: 'space-between' }}>
                        <Grid size={{ sm: 'grow' }}>
                          <Grid container spacing={2} sx={{ alignItems: 'center' }}>
                            {selectionMode ? (
                              <>
                                <Grid>
                                  <IconButton onClick={clearSelection}>
                                    <CloseTwoToneIcon />
                                  </IconButton>
                                </Grid>
                                <Grid size="grow">
                                  <Typography variant="h4">{selectedMessages.length} selected</Typography>
                                </Grid>
                              </>
                            ) : (
                              <>
                                <Grid sx={{ display: { xs: 'block', sm: 'none' } }}>
                                  <IconButton onClick={handleDrawerOpen} size="large">
                                    <MenuRoundedIcon />
                                  </IconButton>
                                </Grid>
                                <Grid sx={{ display: { xs: 'none', sm: 'block' } }}>
                                  {(() => {
                                    const isGroup = activeChannel?.channelType === 'GROUP' || activeChannel?.isGroup;
                                    const displayMember = activeChannel?.members?.find(m => m.userId !== currentUserId) || activeChannel?.members?.[0];
                                    const displayName = (!isGroup && displayMember?.employeeName) ? displayMember.employeeName : (activeChannel?.channelName || "Select User");
                                    const avatarSrc = (!isGroup && displayMember?.imgName) ? getUserImageUrl(displayMember.imgName) : (activeChannel?.imgName ? getUserImageUrl(activeChannel.imgName) : '');

                                    return (
                                      <Avatar
                                        alt={displayName}
                                        src={avatarSrc}
                                        sx={{ width: 48, height: 48, border: '2px solid', borderColor: 'divider' }}
                                      />
                                    );
                                  })()}
                                </Grid>
                                <Grid size={{ sm: 'grow' }}>
                                  <Grid container spacing={0} sx={{ alignItems: 'center' }}>
                                    <Grid size={12}>
                                      <Stack direction="row" sx={{ alignItems: 'center', gap: 1 }}>
                                        {(() => {
                                          const isGroup = activeChannel?.channelType === 'GROUP' || activeChannel?.isGroup;
                                          const displayMember = activeChannel?.members?.find(m => m.userId !== currentUserId) || activeChannel?.members?.[0];
                                          const displayName = (!isGroup && displayMember?.employeeName) ? displayMember.employeeName : (activeChannel?.channelName || "Select User");

                                          return (
                                            <>
                                              <Typography variant="h4">{displayName}</Typography>
                                              {activeChannel && !isGroup && <AvatarStatus status={displayMember?.isOnline ? 'available' : 'offline'} />}
                                              {!isGroup && (displayMember?.designationName || displayMember?.departmentName) && (
                                                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                                                  • {displayMember?.designationName}{displayMember?.designationName && displayMember?.departmentName ? ' | ' : ''}{displayMember?.departmentName}
                                                </Typography>
                                              )}
                                            </>
                                          );
                                        })()}
                                      </Stack>
                                    </Grid>
                                    <Grid size={12}>
                                      {(() => {
                                        const isGroup = activeChannel?.channelType === 'GROUP' || activeChannel?.isGroup;
                                        if (isGroup) {
                                          const memberCount = activeChannel?.members?.length || 0;
                                          return <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>{memberCount} Members</Typography>;
                                        }

                                        const displayMember = activeChannel?.members?.find(m => m.userId !== currentUserId) || activeChannel?.members?.[0];
                                        if (!displayMember) return null;
                                        if (displayMember.isOnline) {
                                          return <Typography variant="subtitle2" sx={{ color: 'success.main' }}>Online</Typography>;
                                        }
                                        return (
                                          <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                                            Last seen {displayMember.lastSeen ? new Date(displayMember.lastSeen).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : 'recently'}
                                          </Typography>
                                        );
                                      })()}
                                    </Grid>
                                  </Grid>
                                </Grid>
                              </>
                            )}
                          </Grid>
                        </Grid>
                        <Grid size="grow" />
                        <Grid>
                          {selectionMode ? (
                            <>
                              <IconButton size="large" aria-label="forward" onClick={() => setForwardDialogOpen(true)} color="primary">
                                <ForwardToInboxTwoToneIcon />
                              </IconButton>
                              <IconButton size="large" aria-label="delete" onClick={handleDeleteSelected} color="error">
                                <DeleteTwoToneIcon />
                              </IconButton>
                            </>
                          ) : (
                            <>
                              <IconButton size="large" aria-label="phone call" onClick={() => startCall(false)}>
                                <CallTwoToneIcon />
                              </IconButton>
                              <IconButton size="large" aria-label="video call" onClick={() => startCall(true)}>
                                <VideoCallTwoToneIcon />
                              </IconButton>
                              <IconButton size="large" onClick={handleUserChange} aria-label="user info">
                                <ErrorTwoToneIcon />
                              </IconButton>
                              <IconButton size="large" onClick={handleClickSort} aria-label="chat info">
                                <MoreHorizTwoToneIcon />
                              </IconButton>
                              <Menu
                                id="simple-menu"
                                anchorEl={anchorEl}
                                keepMounted
                                open={Boolean(anchorEl)}
                                onClose={handleCloseSort}
                                anchorOrigin={{
                                  vertical: 'bottom',
                                  horizontal: 'right'
                                }}
                                transformOrigin={{
                                  vertical: 'top',
                                  horizontal: 'right'
                                }}
                              >
                                <MenuItem onClick={() => { setSortType('Name'); handleCloseSort(); }}>Name</MenuItem>
                                <MenuItem onClick={() => { setSortType('Date'); handleCloseSort(); }}>Date</MenuItem>
                                <MenuItem onClick={() => { setSortType('Unread'); handleCloseSort(); }}>Unread</MenuItem>
                                <Divider />
                                <MenuItem onClick={handleDeleteChat} sx={{ color: 'error.main' }}>
                                  <DeleteTwoToneIcon sx={{ mr: 1, fontSize: '1.2rem' }} /> Delete Chat
                                </MenuItem>
                              </Menu>
                            </>
                          )}
                        </Grid>
                      </Grid>
                    </Box>

                    <Divider />

                    <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
                      <SimpleBar scrollableNodeProps={{ ref: scrollRef }} sx={{ height: '100%', overflowX: 'hidden' }}>
                        <Box sx={{ minHeight: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                          {isChatLoading ? (
                            <Stack sx={{ height: 1, justifyContent: 'center', alignItems: 'center', py: 4 }}>
                              <CircularProgress color="secondary" />
                            </Stack>
                          ) : (
                            <Box sx={{ pb: 2, pt: 2 }}>
                              <ChartHistory theme={theme} currentUserId={currentUserId} data={messages} selectionMode={selectionMode} selectedMessages={selectedMessages} onToggleSelect={handleToggleSelect} onReply={handleReply} onForward={handleForward} reactions={reactions} onReact={handleReact} />
                            </Box>
                          )}
                        </Box>
                      </SimpleBar>
                    </Box>

                    <Box sx={{ flexShrink: 0, px: 2 }}>
                      {smartReplies.length > 0 && (
                        <Stack direction="row" spacing={1} sx={{ overflowX: 'auto', pt: 1, pb: 1, '&::-webkit-scrollbar': { display: 'none' } }}>
                          {smartReplies.map((reply, i) => (
                            <Chip
                              key={i}
                              label={reply}
                              onClick={() => handleOnSend(reply)}
                              color="primary"
                              variant="outlined"
                              size="small"
                              sx={{ cursor: 'pointer', flexShrink: 0, borderRadius: '16px' }}
                            />
                          ))}
                        </Stack>
                      )}
                    </Box>

                    <Divider />

                    {replyingTo && (
                      <Box sx={{ px: 2, pt: 1, pb: 1, mx: 2, mt: 1, mb: 1, bgcolor: 'rgba(0,0,0,0.05)', borderRadius: '4px 8px 8px 4px', borderLeft: '4px solid #00a884', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box sx={{ overflow: 'hidden' }}>
                          <Typography variant="subtitle2" sx={{ color: '#00a884', fontWeight: 600 }}>{replyingTo.senderName}</Typography>
                          <Typography variant="caption" sx={{ display: 'block', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', color: 'text.secondary' }}>
                            {replyingTo.messageType === 'VOICE' ? '🎤 Voice Message' : (replyingTo.messageContent || 'Attachment')}
                          </Typography>
                        </Box>
                        <IconButton size="small" onClick={() => setReplyingTo(null)}>
                          <CloseTwoToneIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    )}
                    <Box sx={{ p: 2, pt: 1.5, flexShrink: 0 }}>
                      {isRecording ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', bgcolor: 'background.paper', borderRadius: '32px', px: 2, py: 1, boxShadow: 1 }}>
                          <IconButton onClick={cancelRecording} size="small" sx={{ border: '2px solid', borderColor: '#00a884', color: 'text.secondary', mr: 2, width: 36, height: 36 }}>
                            <DeleteTwoToneIcon fontSize="small" />
                          </IconButton>
                          
                          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
                            <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: 'error.main', mr: 1, animation: 'pulse 1.5s infinite', '@keyframes pulse': { '0%': { opacity: 1 }, '50%': { opacity: 0.3 }, '100%': { opacity: 1 } } }} />
                            <Typography variant="body1" sx={{ fontWeight: 600, width: 45, mr: 2 }}>{formatTime(recordingTime)}</Typography>
                            
                            <Box sx={{ display: 'flex', alignItems: 'center', height: 24, gap: '3px', flexGrow: 1, overflow: 'hidden', opacity: 0.7 }}>
                              {[...Array(40)].map((_, i) => (
                                <Box key={i} sx={{ width: 3, height: `${Math.random() * 80 + 20}%`, bgcolor: 'grey.500', borderRadius: '2px' }} />
                              ))}
                            </Box>
                          </Box>
                          
                          <IconButton size="small" sx={{ color: 'error.main', mx: 2 }}>
                            <PauseTwoToneIcon fontSize="small" />
                          </IconButton>
                          
                          <IconButton onClick={sendRecording} sx={{ bgcolor: '#00a884', color: 'white', '&:hover': { bgcolor: '#008f6f' }, width: 44, height: 44 }}>
                            <SendTwoToneIcon />
                          </IconButton>
                        </Box>
                      ) : (
                        <Grid container spacing={1} sx={{ alignItems: 'center' }}>
                        <Grid>
                          <IconButton aria-label="attachment" onClick={handleAttachmentClick} size="large">
                            <AttachmentTwoToneIcon />
                          </IconButton>
                          <input type="file" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} />
                          <IconButton
                            ref={anchorElEmoji}
                            aria-haspopup="true"
                            onClick={handleOnEmojiButtonClick}
                            size="large"
                            aria-label="emoji"
                          >
                            <MoodTwoToneIcon />
                          </IconButton>
                        </Grid>
                        <Grid size="grow" sx={{ minWidth: 0 }}>
                            <TextField
                              id="message-send"
                              fullWidth
                              value={message}
                              onChange={(e) => setMessage(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleOnSend();
                                }
                              }}
                              placeholder="Type a Message"
                              InputProps={{
                                endAdornment: (
                                  <InputAdornment position="end">
                                    <IconButton onClick={handleMicClick} color="inherit" aria-label="voice message">
                                      <MicTwoToneIcon />
                                    </IconButton>
                                    <IconButton disableRipple color="primary" onClick={() => handleOnSend()} aria-label="send message">
                                      <SendTwoToneIcon />
                                    </IconButton>
                                  </InputAdornment>
                                )
                              }}
                              aria-describedby="search-helper-text"
                              inputProps={{ 'aria-label': 'weight' }}
                            />
                          </Grid>
                        </Grid>
                      )}
                    </Box>
                  </>
                )}
              </Box>
              <Popper
                id={emojiId}
                open={emojiOpen}
                anchorEl={anchorElEmoji}
                disablePortal
                sx={{ zIndex: 1200 }}
                modifiers={[
                  {
                    name: 'offset',
                    options: {
                      offset: [-20, 20]
                    }
                  }
                ]}
              >
                <ClickAwayListener onClickAway={handleCloseEmoji}>
                  <MainCard
                    elevation={8}
                    content={false}
                    sx={{
                      '& .EmojiPickerReact': {
                        backgroundColor: 'background.default',
                        ...theme.applyStyles('dark', {
                          borderColor: withAlpha(theme.vars.palette.grey[500], 0.2),
                          'div:last-child': {
                            borderColor: withAlpha(theme.vars.palette.grey[500], 0.2)
                          }
                        })
                      },
                      '& .EmojiPickerReact .epr-emoji-category-label': {
                        backgroundColor: 'background.paper'
                      },
                      '& .epr-search-container input': {
                        backgroundColor: 'grey.50',
                        ...theme.applyStyles('dark', {
                          backgroundColor: 'background.paper',
                          borderColor: withAlpha(theme.vars.palette.grey[500], 0.2)
                        }),
                        '&:focus': {
                          borderColor: 'primary.main',
                          ...theme.applyStyles('dark', { borderColor: 'common.white' })
                        }
                      }
                    }}
                  >
                    <EmojiPicker onEmojiClick={onEmojiClick} defaultSkinTone={SkinTones.DARK} lazyLoadEmojis={true} />
                  </MainCard>
                </ClickAwayListener>
              </Popper>
            </MainCard>
          </Grid>

          <Grid sx={{ overflow: 'hidden', display: emailDetails ? 'flex' : 'none', height: '100%' }} size={{ xs: 12, md: 4, xl: 3 }}>
            <Collapse orientation="horizontal" in={emailDetails && !downMD} sx={{ height: '100%' }}>
              <MainCard sx={{ height: '100%', overflow: 'auto' }} content={false}>
                <Box sx={{ display: { xs: 'block', sm: 'none', textAlign: 'right' }, p: 2 }}>
                  <IconButton onClick={handleUserChange} size="large">
                    <HighlightOffTwoToneIcon />
                  </IconButton>
                </Box>
                {isChatLoading ? (
                  <Stack sx={{ height: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <CircularProgress color="secondary" />
                  </Stack>
                ) : (
                  <UserDetails 
                    channel={activeChannel} 
                    currentUserId={currentUserId}
                    startCall={startCall}
                    messages={messages}
                  />
                )}
              </MainCard>
            </Collapse>
          </Grid>

          <Dialog onClose={handleUserChange} open={downMD && emailDetails} scroll="body" slotProps={{ paper: { sx: { p: 2 } } }}>
            {isChatLoading ? (
              <Stack sx={{ height: 1, justifyContent: 'center', alignItems: 'center' }}>
                <CircularProgress color="secondary" />
              </Stack>
            ) : (
              <UserDetails 
                channel={activeChannel} 
                currentUserId={currentUserId}
                startCall={startCall}
                messages={messages}
              />
            )}
          </Dialog>

          <Dialog
            open={forwardDialogOpen}
            onClose={() => setForwardDialogOpen(false)}
            maxWidth="sm"
            fullWidth
            PaperProps={{ sx: { borderRadius: '16px', bgcolor: 'background.paper', overflow: 'hidden' } }}
          >
            <Box sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
              <IconButton onClick={() => setForwardDialogOpen(false)} sx={{ mr: 1 }}>
                <CloseIcon />
              </IconButton>
              <Typography variant="h4" sx={{ fontWeight: 600 }}>Forward message to</Typography>
            </Box>
            
            <Box sx={{ px: 3, pb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: 'background.paper', borderRadius: '8px', px: 2, py: 0.5, border: '1px solid', borderColor: 'divider', '&:focus-within': { borderColor: '#00a884', borderWidth: 2 } }}>
                <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />
                <InputBase 
                  placeholder="Search name or number" 
                  fullWidth 
                  value={forwardSearch}
                  onChange={(e) => setForwardSearch(e.target.value)}
                  sx={{ ml: 1 }}
                />
              </Box>
            </Box>
            
            <Box sx={{ px: 3, py: 1 }}>
              <Typography variant="subtitle2" sx={{ color: 'text.secondary', fontWeight: 600 }}>Recent chats</Typography>
            </Box>

            <DialogContent sx={{ p: 0, maxHeight: 400 }}>
              <List sx={{ pt: 0 }}>
                {sortedChannels
                  .filter(c => c.channelName.toLowerCase().includes(forwardSearch.toLowerCase()))
                  .map(channel => {
                  const displayMember = channel.members?.find(m => m.userId !== currentUserId) || channel.members?.[0];
                  return (
                    <ListItem 
                      key={channel.id} 
                      button 
                      onClick={() => {
                        setForwardSelectedChannels(prev => prev.includes(channel.id) ? prev.filter(id => id !== channel.id) : [...prev, channel.id]);
                      }}
                      sx={{ '&:hover': { bgcolor: 'action.hover' } }}
                    >
                      <Checkbox 
                        checked={forwardSelectedChannels.includes(channel.id)} 
                        sx={{ mr: 1, '&.Mui-checked': { color: '#00a884' } }}
                      />
                      <ListItemAvatar>
                        <Avatar src={displayMember?.imgName ? getUserImageUrl(displayMember.imgName) : ''} />
                      </ListItemAvatar>
                      <ListItemText primary={channel.channelName} />
                    </ListItem>
                  );
                })}
              </List>
            </DialogContent>
            
            <Box sx={{ p: 2, bgcolor: 'background.paper', display: 'flex', alignItems: 'center', boxShadow: '0 -2px 10px rgba(0,0,0,0.05)' }}>
              <Box sx={{ display: 'flex', flexGrow: 1, bgcolor: 'rgba(0,0,0,0.05)', borderRadius: '12px', overflow: 'hidden', p: 1, alignItems: 'center' }}>
                <Box sx={{ width: 40, height: 40, bgcolor: '#00a884', borderRadius: '8px', mr: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography variant="caption" sx={{ color: 'white', fontWeight: 'bold' }}>MSG</Typography>
                </Box>
                <InputBase 
                  fullWidth 
                  placeholder="Add a message..." 
                  value={forwardText}
                  onChange={(e) => setForwardText(e.target.value)}
                  sx={{ bgcolor: 'transparent' }}
                />
              </Box>
              <IconButton 
                disabled={forwardSelectedChannels.length === 0}
                onClick={handleForwardSubmit}
                sx={{ 
                  ml: 2,
                  bgcolor: '#00a884', 
                  color: 'white', 
                  width: 48,
                  height: 48,
                  '&:hover': { bgcolor: '#008f6f' }, 
                  '&.Mui-disabled': { bgcolor: 'action.disabledBackground', color: 'action.disabled' },
                  boxShadow: forwardSelectedChannels.length > 0 ? '0 2px 5px rgba(0,0,0,0.2)' : 'none'
                }}
              >
                <SendTwoToneIcon />
              </IconButton>
            </Box>
          </Dialog>

          <Dialog
            open={!!callingState}
            onClose={endCall}
            maxWidth="md"
            fullWidth
            PaperProps={{
              sx: {
                bgcolor: '#111b21',
                color: '#e9edef',
                borderRadius: '12px',
                minHeight: '600px',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
              }
            }}
          >
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, bgcolor: '#202c33' }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Avatar sx={{ width: 28, height: 28, bgcolor: 'primary.main' }}>
                  <CallTwoToneIcon sx={{ color: '#fff', fontSize: '1rem' }} />
                </Avatar>
                <Typography variant="body2" sx={{ fontWeight: 500, color: '#e9edef' }}>Autonoma Call</Typography>
              </Stack>
              <Stack direction="row" spacing={0.5} alignItems="center" sx={{ color: '#8696a0' }}>
                <LockOutlinedIcon sx={{ fontSize: '1rem' }} />
                <Typography variant="caption">End-to-end encrypted</Typography>
              </Stack>
              <Box sx={{ width: 120 }} /> {/* Spacer to center the lock icon relatively */}
            </Box>

            {/* Body */}
            <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', p: 4, position: 'relative', width: '100%' }}>
              {(callingState === 'IN_CALL' && remoteStream) ? (
                <Box sx={{ width: '100%', flexGrow: 1, position: 'relative', minHeight: 300 }}>
                  <video 
                    autoPlay 
                    playsInline 
                    ref={node => { if (node && node.srcObject !== remoteStream) node.srcObject = remoteStream; }} 
                    style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '8px', backgroundColor: '#000' }} 
                  />
                  {localStream && (
                    <Box sx={{ position: 'absolute', bottom: 16, right: 16, width: 150, height: 200, borderRadius: '8px', overflow: 'hidden', boxShadow: '0 4px 10px rgba(0,0,0,0.5)', bgcolor: '#000' }}>
                      <video 
                        autoPlay 
                        playsInline 
                        muted 
                        ref={node => { if (node && node.srcObject !== localStream) node.srcObject = localStream; }} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }} 
                      />
                    </Box>
                  )}
                </Box>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', flexGrow: 1, position: 'relative' }}>
                  {localStream && (callingState === 'RINGING' || callingState === 'INCOMING_CALL') && (
                    <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.5, zIndex: 0, overflow: 'hidden', borderRadius: '8px', backgroundColor: '#000' }}>
                      <video 
                        autoPlay 
                        playsInline 
                        muted 
                        ref={node => { if (node && node.srcObject !== localStream) node.srcObject = localStream; }} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }} 
                      />
                    </Box>
                  )}
                  <Box sx={{ zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 8 }}>
                    {(() => {
                      const displayMember = activeChannel?.members?.find(m => m.userId !== currentUserId) || activeChannel?.members?.[0];
                      return (
                        <Avatar
                          alt={displayMember?.employeeName || activeChannel?.channelName}
                          src={displayMember?.imgName ? getUserImageUrl(displayMember.imgName) : ''}
                          sx={{ width: 160, height: 160, mb: 3, boxShadow: '0 0 20px rgba(0,0,0,0.5)' }}
                        />
                      );
                    })()}
                    <Typography variant="h3" sx={{ color: '#e9edef', mb: 1, fontWeight: 400 }}>
                      {(() => {
                        const displayMember = activeChannel?.members?.find(m => m.userId !== currentUserId) || activeChannel?.members?.[0];
                        return displayMember?.employeeName || activeChannel?.channelName;
                      })()}
                    </Typography>
                    <Typography variant="subtitle1" sx={{ color: '#8696a0' }}>
                      {callingState === 'RINGING' ? 'Calling...' : 
                       callingState === 'INCOMING_CALL' ? 'Incoming call...' : 
                       `${Math.floor(callDuration / 60).toString().padStart(2, '0')}:${(callDuration % 60).toString().padStart(2, '0')}`}
                    </Typography>
                  </Box>
                </Box>
              )}
            </Box>

            {/* Footer / Controls */}
            {callingState === 'INCOMING_CALL' ? (
              <Box sx={{ p: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', bgcolor: '#202c33', gap: 6 }}>
                <IconButton
                  onClick={declineIncomingCall}
                  sx={{
                    bgcolor: '#f15c6d',
                    color: '#fff',
                    '&:hover': { bgcolor: '#e05060' },
                    width: 72, height: 72, borderRadius: '36px'
                  }}
                >
                  <CallEndIcon sx={{ fontSize: '2rem' }} />
                </IconButton>
                <IconButton
                  onClick={answerIncomingCall}
                  sx={{
                    bgcolor: '#00a884',
                    color: '#fff',
                    '&:hover': { bgcolor: '#008f6f' },
                    width: 72, height: 72, borderRadius: '36px'
                  }}
                >
                  <CallTwoToneIcon sx={{ fontSize: '2rem' }} />
                </IconButton>
              </Box>
            ) : callingState === 'RINGING' ? (
              <Box sx={{ p: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', bgcolor: '#202c33', gap: 6 }}>
                <IconButton
                  onClick={endCall}
                  sx={{
                    bgcolor: '#f15c6d',
                    color: '#fff',
                    '&:hover': { bgcolor: '#e05060' },
                    width: 72, height: 72, borderRadius: '36px'
                  }}
                >
                  <CallEndIcon sx={{ fontSize: '2rem' }} />
                </IconButton>
              </Box>
            ) : (
              <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#202c33' }}>
                <Stack direction="row" spacing={2}>
                  <IconButton
                    onClick={toggleVideo}
                    sx={{
                      bgcolor: isVideoEnabled ? '#e9edef' : '#374045',
                      color: isVideoEnabled ? '#111b21' : '#e9edef',
                      '&:hover': { bgcolor: isVideoEnabled ? '#d1d7db' : '#455056' },
                      width: 48, height: 48
                    }}
                  >
                    {isVideoEnabled ? <VideocamOutlinedIcon /> : <VideocamOffOutlinedIcon />}
                  </IconButton>
                  <IconButton
                    onClick={toggleAudio}
                    sx={{
                      bgcolor: isAudioEnabled ? '#374045' : '#e9edef',
                      color: isAudioEnabled ? '#e9edef' : '#111b21',
                      '&:hover': { bgcolor: isAudioEnabled ? '#455056' : '#d1d7db' },
                      width: 48, height: 48
                    }}
                  >
                    {isAudioEnabled ? <MicOutlinedIcon /> : <MicOffOutlinedIcon />}
                  </IconButton>
                </Stack>

                <Stack direction="row" spacing={3}>
                  <IconButton sx={{ color: '#8696a0', '&:hover': { color: '#e9edef' } }}>
                    <MoodTwoToneIcon />
                  </IconButton>
                  <IconButton sx={{ color: '#8696a0', '&:hover': { color: '#e9edef' } }}>
                    <PresentToAllOutlinedIcon />
                  </IconButton>
                  <IconButton sx={{ color: '#8696a0', '&:hover': { color: '#e9edef' } }}>
                    <PersonAddOutlinedIcon />
                  </IconButton>
                  <IconButton sx={{ color: '#8696a0', '&:hover': { color: '#e9edef' } }}>
                    <ChatOutlinedIcon />
                  </IconButton>
                </Stack>

                <IconButton
                  onClick={endCall}
                  sx={{
                    bgcolor: '#f15c6d',
                    color: '#fff',
                    '&:hover': { bgcolor: '#e05060' },
                    width: 64, height: 48, borderRadius: '24px'
                  }}
                >
                  <CallEndIcon />
                </IconButton>
              </Box>
            )}
          </Dialog>

        </Grid>
      </Main>
    </Box>
  );
}
