import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// material-ui
import {
  Box,
  Typography,
  IconButton,
  TextField,
  Avatar,
  Badge,
  Tabs,
  Tab,
  Button,
  CircularProgress,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  Paper,
  Tooltip,
  Grow,
  InputAdornment
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

// icons
import {
  IconMessage,
  IconSend,
  IconPaperclip,
  IconPhoto,
  IconMicrophone,
  IconScan,
  IconSearch,
  IconFileText,
  IconBrain,
  IconChevronLeft,
  IconPlus,
  IconX,
  IconCheck,
  IconChecks,
  IconClock,
  IconUsers,
  IconArrowLeft,
  IconSparkles,
  IconFileInvoice,
  IconMicrophoneOff,
  IconMaximize,
  IconMinimize,
  IconMoodSmile
} from '@tabler/icons-react';

import EmojiPicker from 'emoji-picker-react';

// project imports
import axiosServices from 'utils/axios';
import useAuth from 'hooks/useAuth';

// ==============================|| BOS CONNECT INTERNAL CHAT ||============================== //

export default function BOSConnect() {
  const theme = useTheme();
  const { user } = useAuth();
  const currentUserId = user?.userId || 'bos';

  // State
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0); // 0 = Chats, 1 = Search Users, 2 = Create Group
  const [channels, setChannels] = useState([]);
  const [activeChannel, setActiveChannel] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  // Search
  const [searchUserQuery, setSearchUserQuery] = useState('');
  const [userSearchResults, setUserSearchResults] = useState([]);
  const [searchMessageQuery, setSearchMessageQuery] = useState('');
  const [isSearchingMessages, setIsSearchingMessages] = useState(false);

  // Drawers / Panels
  const [showAiSummary, setShowAiSummary] = useState(false);
  const [aiSummary, setAiSummary] = useState('');
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [showFilesList, setShowFilesList] = useState(false);
  const [filesList, setFilesList] = useState([]);
  const [smartReplies, setSmartReplies] = useState([]);

  // Group Chat Creator
  const [groupName, setGroupName] = useState('');
  const [selectedGroupUsers, setSelectedGroupUsers] = useState([]);

  // Voice Note Simulation State
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);

  // Emoji State
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // Loading States
  const [isLoadingChannels, setIsLoadingChannels] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  // Dimensions & Maximize state
  const [isMaximized, setIsMaximized] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 430, height: 620 });
  const [otherUserTyping, setOtherUserTyping] = useState(false);

  const handleResizeStart = (e) => {
    e.preventDefault();
    const isTouch = e.type === 'touchstart';
    const startX = isTouch ? e.touches[0].clientX : e.clientX;
    const startY = isTouch ? e.touches[0].clientY : e.clientY;
    const startWidth = dimensions.width;
    const startHeight = dimensions.height;

    const handleMouseMove = (moveEvent) => {
      const currentX = isTouch ? moveEvent.touches[0].clientX : moveEvent.clientX;
      const currentY = isTouch ? moveEvent.clientY ? moveEvent.clientY : moveEvent.touches[0].clientY : moveEvent.clientY;
      const deltaX = startX - currentX;
      const deltaY = startY - currentY;
      setDimensions({
        width: Math.max(350, Math.min(window.innerWidth - 48, startWidth + deltaX)),
        height: Math.max(450, Math.min(window.innerHeight - 140, startHeight + deltaY))
      });
    };

    const handleMouseUp = () => {
      if (isTouch) {
        document.removeEventListener('touchmove', handleMouseMove);
        document.removeEventListener('touchend', handleMouseUp);
      } else {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      }
    };

    if (isTouch) {
      document.addEventListener('touchmove', handleMouseMove, { passive: false });
      document.addEventListener('touchend', handleMouseUp);
    } else {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
  };

  // References
  const messageEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const pollingRef = useRef(null);
  const prevMessagesCountRef = useRef({});
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingTimerRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // 1. Play premium chime using Web Audio API (Zero static asset dependency)
  const playPing = () => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880.00, ctx.currentTime + 0.08); // A5

      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);

      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } catch (e) {
      console.warn("Failed to play synth sound chime", e);
    }
  };

  // 2. HTML5 Desktop popup alert
  const showDesktopNotification = (msg) => {
    // if (Notification.permission === 'granted') {
    new Notification('BOS Connect : ' + msg.senderName, {
      body: msg.messageContent || 'Sent an attachment',
      tag: 'bos-connect-msg-' + msg.channelId
    });
    // }
  };

  // 3. Request Notification permissions on Mount
  useEffect(() => {
    if (window.Notification && Notification.permission === 'default') {
      Notification.requestPermission();
    }
    // Set presence online on Mount
    updatePresenceStatus(true);
    return () => {
      updatePresenceStatus(false);
      if (pollingRef.current) clearInterval(pollingRef.current);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, []);

  // 4. Update presence status on backend
  const updatePresenceStatus = (isOnline) => {
    axiosServices.post(`/api/chat/presence?isOnline=${isOnline}`).catch(() => { });
  };

  // 5. Poll channel list and messages
  useEffect(() => {
    if (isOpen) {
      fetchChannels();
      // Start real-time polling every 3 seconds
      pollingRef.current = setInterval(() => {
        pollData();
      }, 3000);
    } else {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    }
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [isOpen, activeChannel?.id]);

  // Fetch Channels initially
  const fetchChannels = async () => {
    setIsLoadingChannels(true);
    try {
      const res = await axiosServices.get('/api/chat/channels');
      setChannels(res.data);
    } catch (e) {
      console.error("Failed to load chat channels", e);
    } finally {
      setIsLoadingChannels(false);
    }
  };

  // Poll Channels & active room messages
  const pollData = async () => {
    try {
      // 1. Refresh channels list
      const resChan = await axiosServices.get('/api/chat/channels');
      setChannels(resChan.data);

      // Extract typing indicator status for active channel members
      if (activeChannel) {
        const updatedActive = resChan.data.find(c => c.id === activeChannel.id);
        if (updatedActive && updatedActive.members) {
          const isSomeoneTyping = updatedActive.members.some(
            m => m.userId !== currentUserId && m.isTyping
          );
          setOtherUserTyping(isSomeoneTyping);
        }
      }

      // 2. If room is open, fetch messages silently
      if (activeChannel) {
        const resMsg = await axiosServices.get(`/api/chat/channels/${activeChannel.id}/messages`);
        const polledMessages = resMsg.data;

        // Check if new messages loaded (compared to last recorded count)
        const prevCount = prevMessagesCountRef.current[activeChannel.id] || 0;
        if (polledMessages.length > prevCount) {
          const lastMsg = polledMessages[polledMessages.length - 1];
          // If message is from someone else, trigger alerts!
          if (lastMsg.senderId !== currentUserId && lastMsg.senderId !== 'BOS_AI_ASSISTANT') {
            playPing();
            showDesktopNotification(lastMsg);
          }
          setMessages(polledMessages);
          scrollMessageList();
          // Load smart replies since discussion state changed
          fetchSmartReplies(activeChannel.id);
        }
        prevMessagesCountRef.current[activeChannel.id] = polledMessages.length;
      }
    } catch (e) {
      console.warn("Polling request failed", e);
    }
  };

  // 6. Handle active room change
  const selectRoom = async (chan) => {
    setActiveChannel(chan);
    setIsLoadingMessages(true);
    setShowAiSummary(false);
    setShowFilesList(false);
    setSearchMessageQuery('');
    
    // Set otherUserTyping initially based on current channel data
    if (chan.members) {
      const isSomeoneTyping = chan.members.some(
        m => m.userId !== currentUserId && m.isTyping
      );
      setOtherUserTyping(isSomeoneTyping);
    }

    try {
      const res = await axiosServices.get(`/api/chat/channels/${chan.id}/messages`);
      setMessages(res.data);
      prevMessagesCountRef.current[chan.id] = res.data.length;
      scrollMessageList();
      fetchSmartReplies(chan.id);
      // Mark read
      await axiosServices.post(`/api/chat/channels/${chan.id}/read`);
    } catch (e) {
      console.error("Failed to load channel messages", e);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const scrollMessageList = () => {
    setTimeout(() => {
      messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // 7. Send message handler
  const handleSendMessage = async (customContent = null, customType = 'TEXT', customAttach = {}) => {
    const content = customContent || newMessage;
    if (!content.trim() && customType === 'TEXT') return;

    try {
      const payload = {
        channelId: activeChannel.id,
        messageType: customType,
        messageContent: content,
        attachmentUrl: customAttach.url || null,
        attachmentName: customAttach.name || null,
        attachmentType: customAttach.type || null
      };

      const res = await axiosServices.post('/api/chat/channels/messages', payload);

      // Update local state instantly
      const updatedMessages = [...messages, res.data];
      setMessages(updatedMessages);
      prevMessagesCountRef.current[activeChannel.id] = updatedMessages.length;
      setNewMessage('');
      scrollMessageList();

      // Trigger typing indicator stop
      axiosServices.post('/api/chat/typing').catch(() => { });
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

      // Call polling once after small delay to grab automatic system responses / AI actions!
      setTimeout(() => {
        pollData();
      }, 1000);

    } catch (e) {
      console.error("Failed to send message", e);
    }
  };

  // 8. Typing indicator triggers
  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
    if (activeChannel) {
      axiosServices.post(`/api/chat/typing?channelId=${activeChannel.id}`).catch(() => { });

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        axiosServices.post('/api/chat/typing').catch(() => { });
      }, 5000);
    }
  };

  // 9. User Search to start direct chat
  const handleUserSearch = async (val = '') => {
    setSearchUserQuery(val);
    try {
      const res = await axiosServices.get(`/api/chat/search/users?query=${val}`);
      // filter out self
      setUserSearchResults(res.data.filter(u => u.userId !== currentUserId));
    } catch (e) {
      console.error("User search failed", e);
    }
  };

  useEffect(() => {
    if (activeTab === 1 || activeTab === 2) {
      handleUserSearch(searchUserQuery);
    }
  }, [activeTab]);

  const startDirectChat = async (targetUser) => {
    try {
      const res = await axiosServices.post(`/api/chat/channels/direct?targetUserId=${targetUser.userId}`);
      // Refresh list
      await fetchChannels();
      // Select the direct room
      selectRoom(res.data);
      setActiveTab(0);
      setSearchUserQuery('');
      setUserSearchResults([]);
    } catch (e) {
      console.error("Failed to start direct chat", e);
    }
  };

  // 10. File attachment upload handler
  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fd = new FormData();
    fd.append('file', file);
    fd.append('module', 'CHAT_UPLOAD');

    try {
      // Upload using global file upload service
      const res = await axiosServices.post('/api/files/upload', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const fileUrl = res.data;
      const fileExt = file.name.split('.').pop().toUpperCase();
      let fileType = 'DOC';
      if (['PDF'].includes(fileExt)) fileType = 'PDF';
      else if (['XLS', 'XLSX', 'CSV'].includes(fileExt)) fileType = 'EXCEL';
      else if (['PNG', 'JPG', 'JPEG', 'GIF', 'WEBP'].includes(fileExt)) fileType = 'IMAGE';

      // Send as attachment message
      handleSendMessage(`Sent file: ${file.name}`, 'FILE', {
        url: fileUrl,
        name: file.name,
        type: fileType
      });
    } catch (err) {
      console.error("File upload failed", err);
    }
  };

  // 11. Real Voice Recorder Action
  const handleVoiceToggle = async () => {
    if (isRecordingVoice) {
      // Stop recording
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }
      setIsRecordingVoice(false);
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
      setRecordingDuration(0);
    } else {
      // Start recording
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const file = new File([audioBlob], `voice_message_${new Date().getTime()}.webm`, { type: 'audio/webm' });

          const fd = new FormData();
          fd.append('file', file);
          fd.append('module', 'CHAT_VOICE');

          try {
            const res = await axiosServices.post('/api/files/upload', fd, {
              headers: { 'Content-Type': 'multipart/form-data' }
            });
            const fileUrl = res.data;
            handleSendMessage('Voice Message', 'VOICE', {
              url: fileUrl,
              name: file.name,
              type: 'AUDIO'
            });
          } catch (err) {
            console.error("Voice upload failed", err);
          }

          // Stop tracks to release mic
          stream.getTracks().forEach(track => track.stop());
        };

        mediaRecorder.start();
        setIsRecordingVoice(true);
        setRecordingDuration(0);
        recordingTimerRef.current = setInterval(() => {
          setRecordingDuration(prev => prev + 1);
        }, 1000);
      } catch (err) {
        console.error("Failed to start voice recording", err);
        // Fallback for demo or no mic
        setIsRecordingVoice(true);
        setTimeout(() => {
          setIsRecordingVoice(false);
          handleSendMessage('Simulated Voice Note', 'VOICE');
        }, 2000);
      }
    }
  };

  // 12. Smart Replies and AI Summary Drawers
  const fetchSmartReplies = async (chanId) => {
    try {
      const res = await axiosServices.get(`/api/chat/channels/${chanId}/smart-replies`);
      setSmartReplies(res.data.suggestions || []);
    } catch (e) {
      setSmartReplies([]);
    }
  };

  const fetchAiSummary = async () => {
    if (!activeChannel) return;
    setIsLoadingSummary(true);
    setShowAiSummary(true);
    try {
      const res = await axiosServices.get(`/api/chat/channels/${activeChannel.id}/summary`);
      setAiSummary(res.data.summary);
    } catch (e) {
      setAiSummary("Failed to generate AI summary of the discussions.");
    } finally {
      setIsLoadingSummary(false);
    }
  };

  const fetchFilesList = async () => {
    if (!activeChannel) return;
    setShowFilesList(true);
    try {
      const res = await axiosServices.get(`/api/chat/channels/${activeChannel.id}/files`);
      setFilesList(res.data);
    } catch (e) {
      setFilesList([]);
    }
  };

  // 13. Create Group Chat
  const toggleGroupUser = (uid) => {
    if (selectedGroupUsers.includes(uid)) {
      setSelectedGroupUsers(selectedGroupUsers.filter(u => u !== uid));
    } else {
      setSelectedGroupUsers([...selectedGroupUsers, uid]);
    }
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim() || selectedGroupUsers.length === 0) return;
    try {
      await axiosServices.post(`/api/chat/channels/group?name=${groupName}&type=GROUP`, selectedGroupUsers);
      setGroupName('');
      setSelectedGroupUsers([]);
      setActiveTab(0);
      fetchChannels();
    } catch (e) {
      console.error("Failed to create group", e);
    }
  };

  // 14. Message Filtering (In-channel search)
  const filteredMessages = messages.filter(m => {
    if (!searchMessageQuery.trim()) return true;
    return m.messageContent?.toLowerCase().includes(searchMessageQuery.toLowerCase());
  });

  return (
    <>
      {/* 🚀 FLOATABLE & DRAGGABLE "BOS CONNECT" BUTTON (framer-motion powered) */}
      <motion.div
        drag
        dragMomentum={false}
        dragTransition={{ bounceStiffness: 600, bounceDamping: 15 }}
        whileHover={{ scale: 1.1, cursor: 'grab' }}
        whileTap={{ scale: 0.9, cursor: 'grabbing' }}
        initial={{ x: 0, y: 0 }}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 10000,
          touchAction: 'none'
        }}
      >
        <Tooltip title="Drag anywhere! Click to open internal chat." placement="top">
          <Button
            variant="contained"
            onClick={() => setIsOpen(!isOpen)}
            startIcon={<IconMessage size={18} />}
            sx={{
              background: '#6264A7',
              color: '#fff',
              fontWeight: 600,
              fontSize: '0.85rem',
              letterSpacing: 'normal',
              textTransform: 'none',
              px: 2.5,
              py: 0.8,
              borderRadius: '6px',
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)',
              border: 'none',
              backdropFilter: 'none',
              minWidth: 'auto',
              height: '40px',
              '&:hover': {
                background: '#464775'
              }
            }}
          >
            BOS Connect
            {channels.reduce((acc, c) => acc + c.unreadCount, 0) > 0 && (
              <Box
                sx={{
                  ml: 1,
                  width: 16,
                  height: 16,
                  borderRadius: '50%',
                  bgcolor: '#ff4d4f',
                  color: '#fff',
                  fontSize: '0.65rem',
                  fontWeight: 900,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 6px #ff4d4f'
                }}
              >
                {channels.reduce((acc, c) => acc + c.unreadCount, 0)}
              </Box>
            )}
          </Button>
        </Tooltip>
      </motion.div>

      {/* 🛡️ STUNNING GLASSMORPHISM CHAT CONTAINER */}
      <AnimatePresence>
        {isOpen && (
          <Grow in={isOpen} style={{ transformOrigin: 'bottom right' }}>
            <Box
              sx={{
                position: 'fixed',
                bottom: isMaximized ? '24px' : '90px',
                right: '24px',
                width: isMaximized ? 'calc(100vw - 48px)' : `${dimensions.width}px`,
                height: isMaximized ? 'calc(100vh - 120px)' : `${dimensions.height}px`,
                maxWidth: isMaximized ? 'none' : '95vw',
                maxHeight: isMaximized ? 'none' : '90vh',
                zIndex: 9999,
                display: 'flex',
                flexDirection: 'column',
                background: theme.palette.mode === 'dark' ? '#201f1f' : '#ffffff',
                backdropFilter: 'none',
                WebkitBackdropFilter: 'none',
                borderRadius: '8px',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
                border: theme.palette.mode === 'dark' ? '1px solid #3d3d3d' : '1px solid #e1dfdd',
                overflow: 'hidden',
                transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
                animation: 'slideUp 0.3s ease-out',
                '@keyframes slideUp': {
                  '0%': { transform: 'translateY(20px)', opacity: 0 },
                  '100%': { transform: 'translateY(0)', opacity: 1 }
                },
                '& ::-webkit-scrollbar': {
                  width: '6px',
                  height: '6px'
                },
                '& ::-webkit-scrollbar-track': {
                  background: 'transparent'
                },
                '& ::-webkit-scrollbar-thumb': {
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '10px',
                  '&:hover': {
                    background: 'rgba(99, 102, 241, 0.45)'
                  }
                }
              }}
            >
              {/* 📐 TOP-LEFT RESIZE HANDLE (active only in windowed mode) */}
              {!isMaximized && (
                <Box
                  onMouseDown={handleResizeStart}
                  onTouchStart={handleResizeStart}
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '30px',
                    height: '30px',
                    cursor: 'nw-resize',
                    zIndex: 10001,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'background-color 0.2s',
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.15)'
                    },
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: '6px',
                      left: '6px',
                      width: '8px',
                      height: '8px',
                      borderTop: '2px solid rgba(255, 255, 255, 0.5)',
                      borderLeft: '2px solid rgba(255, 255, 255, 0.5)',
                      transition: 'border-color 0.2s'
                    },
                    '&:hover::before': {
                      borderColor: '#fff'
                    }
                  }}
                />
              )}

              {/* HEADER GORGEOUS GRADIENT */}
              <Box
                sx={{
                  background: '#6264A7',
                  p: 1.5,
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderBottom: theme.palette.mode === 'dark' ? '1px solid #3d3d3d' : '1px solid #e1dfdd',
                  boxShadow: 'none',
                  position: 'relative'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  {activeChannel ? (
                    <IconButton size="small" onClick={() => setActiveChannel(null)} sx={{ color: '#fff' }}>
                      <IconArrowLeft size={20} />
                    </IconButton>
                  ) : (
                    <Avatar sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', width: 36, height: 36 }}>
                      <IconMessage size={20} />
                    </Avatar>
                  )}
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 800, color: '#fff', letterSpacing: '0.02em', mb: 0.1 }}>
                      {activeChannel ? activeChannel.channelName : 'BOS Connect'}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.75)', fontWeight: 500 }}>
                      {activeChannel ? `${activeChannel.channelType} Chat` : 'Internal Enterprise Workspace'}
                    </Typography>
                  </Box>
                </Box>

                {/* HEADER ACTIONS */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  {activeChannel && (
                    <>
                      <Tooltip title="In-chat Search">
                        <IconButton size="small" onClick={() => setIsSearchingMessages(!isSearchingMessages)} sx={{ color: '#fff' }}>
                          <IconSearch size={18} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Files Shared">
                        <IconButton size="small" onClick={fetchFilesList} sx={{ color: '#fff' }}>
                          <IconPaperclip size={18} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="BOS AI Thread Summary">
                        <IconButton size="small" onClick={fetchAiSummary} sx={{ color: '#fff' }}>
                          <IconBrain size={18} />
                        </IconButton>
                      </Tooltip>
                    </>
                  )}

                  {/* WINDOW CONTROLS: MAXIMIZE / RESTORE */}
                  <Tooltip title={isMaximized ? "Restore Size" : "Maximize Screen"}>
                    <IconButton size="small" onClick={() => setIsMaximized(!isMaximized)} sx={{ color: '#fff' }}>
                      {isMaximized ? <IconMinimize size={18} /> : <IconMaximize size={18} />}
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Close Chat">
                    <IconButton size="small" onClick={() => setIsOpen(false)} sx={{ color: '#fff' }}>
                      <IconX size={20} />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>

              {/* SEARCH MESSAGE BAR */}
              {activeChannel && isSearchingMessages && (
                <Box sx={{ p: 1, bgcolor: theme.palette.mode === 'dark' ? '#201f1f' : '#f5f5f5', borderBottom: theme.palette.mode === 'dark' ? '1px solid #3d3d3d' : '1px solid #e1dfdd' }}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Search messages..."
                    value={searchMessageQuery}
                    onChange={(e) => setSearchMessageQuery(e.target.value)}
                    variant="outlined"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '4px',
                        bgcolor: theme.palette.mode === 'dark' ? '#292929' : '#ffffff',
                        color: theme.palette.mode === 'dark' ? '#fff' : '#242424',
                        '& fieldset': { borderColor: theme.palette.mode === 'dark' ? '#3d3d3d' : '#e1dfdd' },
                        '&:hover fieldset': { borderColor: '#6264A7' },
                        '&.Mui-focused fieldset': { borderColor: '#6264A7' }
                      }
                    }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton size="small" onClick={() => { setSearchMessageQuery(''); setIsSearchingMessages(false); }}>
                            <IconX size={16} color={theme.palette.mode === 'dark' ? '#94a3b8' : '#616161'} />
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />
                </Box>
              )}

              {/* MAIN CONTENT AREA */}
              <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: isMaximized ? 'row-reverse' : 'column', overflow: 'hidden' }}>
                
                {/* EMPTY STATE FOR RIGHT PANE WHEN MAXIMIZED AND NO CHANNEL SELECTED */}
                {isMaximized && !activeChannel && (
                  <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', bgcolor: theme.palette.mode === 'dark' ? '#201f1f' : '#ffffff' }}>
                    <IconMessage size={64} color={theme.palette.mode === 'dark' ? '#3d3d3d' : '#e1dfdd'} />
                    <Typography variant="h6" sx={{ mt: 2, color: theme.palette.mode === 'dark' ? '#d1d1d1' : '#616161', fontWeight: 600 }}>Select a chat to start messaging</Typography>
                  </Box>
                )}

                {activeChannel && (
                  // ============================== MESSAGES WINDOW ==============================
                  <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
                    {isLoadingMessages ? (
                      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexGrow: 1 }}>
                        <CircularProgress size={36} sx={{ color: '#6366f1' }} />
                      </Box>
                    ) : (
                      <Box sx={{ flexGrow: 1, p: 2, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                        {filteredMessages.map((msg, index) => {
                          const isSelf = msg.senderId === currentUserId;
                          const isSystem = msg.senderId === 'BOS_AI_ASSISTANT' || msg.messageType === 'SYSTEM';

                          if (isSystem) {
                            return (
                              <Box key={msg.id || index} sx={{ display: 'flex', justifyContent: 'center', my: 1 }}>
                                <Paper
                                  elevation={0}
                                  sx={{
                                    p: 2,
                                    bgcolor: 'rgba(99, 102, 241, 0.05)',
                                    border: '1px dashed rgba(99, 102, 241, 0.35)',
                                    borderRadius: '16px',
                                    maxWidth: '90%',
                                    position: 'relative',
                                    '& table': {
                                      width: '100%',
                                      borderCollapse: 'collapse',
                                      my: 1
                                    },
                                    '& th, & td': {
                                      border: '1px solid rgba(255,255,255,0.1)',
                                      p: 0.75,
                                      fontSize: '0.75rem',
                                      color: '#e2e8f0'
                                    },
                                    '& th': {
                                      bgcolor: 'rgba(99, 102, 241, 0.15)'
                                    }
                                  }}
                                >
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, color: '#a5b4fc' }}>
                                    <IconSparkles size={16} />
                                    <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                                      {msg.senderName}
                                    </Typography>
                                  </Box>
                                  <Typography variant="body2" component="div" sx={{ color: '#e2e8f0', fontSize: '0.8rem', whiteSpace: 'pre-line' }}>
                                    {msg.messageContent}
                                  </Typography>
                                  <Typography variant="caption" sx={{ display: 'block', mt: 0.8, color: '#94a3b8', fontSize: '0.65rem' }}>
                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </Typography>
                                </Paper>
                              </Box>
                            );
                          }

                          return (
                            <Box
                              key={msg.id || index}
                              sx={{
                                display: 'flex',
                                justifyContent: isSelf ? 'flex-end' : 'flex-start',
                                gap: 1
                              }}
                            >
                              {!isSelf && (
                                <Avatar sx={{ width: 28, height: 28, fontSize: '0.75rem', bgcolor: '#312e81' }}>
                                  {msg.senderName.charAt(0).toUpperCase()}
                                </Avatar>
                              )}
                              <Box sx={{ maxWidth: '75%' }}>
                                <Box
                                  sx={{
                                    p: 1.5,
                                    borderRadius: '6px',
                                    background: isSelf ? (theme.palette.mode === 'dark' ? '#3B3A39' : '#E8EBFA') : (theme.palette.mode === 'dark' ? '#292929' : '#FFFFFF'),
                                    color: theme.palette.mode === 'dark' ? '#FFFFFF' : '#242424',
                                    border: isSelf ? 'none' : (theme.palette.mode === 'dark' ? '1px solid #3d3d3d' : '1px solid #e1dfdd'),
                                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                                    wordBreak: 'break-word'
                                  }}
                                >
                                  {!isSelf && (
                                    <Typography variant="caption" sx={{ display: 'block', fontWeight: 800, color: '#818cf8', mb: 0.5, fontSize: '0.7rem' }}>
                                      {msg.senderName}
                                    </Typography>
                                  )}

                                  {/* RENDER NORMAL TEXT */}
                                  {msg.messageType === 'TEXT' && (
                                    <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                                      {msg.messageContent}
                                    </Typography>
                                  )}

                                  {/* RENDER FILE ATTACHMENTS */}
                                  {msg.messageType === 'FILE' && (
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <IconFileText size={24} color={isSelf ? '#fff' : '#818cf8'} />
                                        <Box>
                                          <Typography variant="subtitle2" sx={{ fontWeight: 800, fontSize: '0.8rem', color: 'inherit' }}>
                                            {msg.attachmentName}
                                          </Typography>
                                          <Typography variant="caption" sx={{ opacity: 0.8, fontSize: '0.65rem' }}>
                                            {msg.attachmentType} File
                                          </Typography>
                                        </Box>
                                      </Box>
                                      <Button
                                        size="small"
                                        variant="outlined"
                                        href={`/api/files/view/${msg.attachmentUrl}`}
                                        target="_blank"
                                        sx={{
                                          borderColor: isSelf ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.15)',
                                          color: 'inherit',
                                          textTransform: 'none',
                                          fontSize: '0.7rem',
                                          borderRadius: '8px',
                                          '&:hover': {
                                            borderColor: isSelf ? '#fff' : '#818cf8',
                                            bgcolor: 'rgba(255,255,255,0.1)'
                                          }
                                        }}
                                      >
                                        Open Document
                                      </Button>
                                    </Box>
                                  )}

                                  {/* RENDER VOICE NOTE */}
                                  {msg.messageType === 'VOICE' && (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                      {msg.attachmentUrl ? (
                                        <audio
                                          controls
                                          src={`/api/files/view/${msg.attachmentUrl}`}
                                          style={{ outline: 'none', minWidth: '220px', height: '40px' }}
                                        />
                                      ) : (
                                        <>
                                          <IconMicrophone size={20} color={isSelf ? '#fff' : '#818cf8'} />
                                          <Box sx={{ width: 100, height: 16, display: 'flex', gap: '2px', alignItems: 'center' }}>
                                            {[...Array(12)].map((_, i) => (
                                              <Box
                                                key={i}
                                                sx={{
                                                  width: 3,
                                                  height: Math.floor(Math.random() * 12) + 4,
                                                  bgcolor: isSelf ? '#fff' : '#818cf8',
                                                  borderRadius: 1
                                                }}
                                              />
                                            ))}
                                          </Box>
                                          <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>
                                            0:05
                                          </Typography>
                                        </>
                                      )}
                                    </Box>
                                  )}
                                </Box>

                                {/* TIMESTAMP AND READ RECEIPT */}
                                <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                                  <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.65rem' }}>
                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </Typography>
                                  {isSelf && (
                                    <IconChecks size={14} color="#818cf8" />
                                  )}
                                </Box>
                              </Box>
                            </Box>
                          );
                        })}
                        <div ref={messageEndRef} />
                        
                        {/* TYPING INDICATOR UI */}
                        {otherUserTyping && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1, ml: 2, pb: 1 }}>
                            <Avatar sx={{ width: 24, height: 24, bgcolor: '#e1dfdd' }}>
                              <IconUsers size={14} color="#616161" />
                            </Avatar>
                            <Box sx={{ display: 'flex', gap: 0.5, bgcolor: theme.palette.mode === 'dark' ? '#292929' : '#f5f5f5', p: 1.5, borderRadius: '6px' }}>
                              <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: '#6264A7' }} />
                              <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: '#6264A7' }} />
                              <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: '#6264A7' }} />
                            </Box>
                          </Box>
                        )}
                      </Box>
                    )}

                    {/* SMART REPLIES CAROUSEL */}
                    {smartReplies.length > 0 && (
                      <Box sx={{ p: 1, borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', gap: 1, overflowX: 'auto', bgcolor: 'rgba(15, 23, 42, 0.95)', whiteSpace: 'nowrap' }}>
                        {smartReplies.map((r, i) => (
                          <Button
                            key={i}
                            size="small"
                            variant="outlined"
                            onClick={() => handleSendMessage(r)}
                            sx={{
                              borderRadius: '16px',
                              fontSize: '0.75rem',
                              textTransform: 'none',
                              color: '#a5b4fc',
                              borderColor: 'rgba(99, 102, 241, 0.3)',
                              flexShrink: 0,
                              px: 1.5,
                              '&:hover': {
                                bgcolor: 'rgba(99, 102, 241, 0.1)',
                                borderColor: '#a5b4fc'
                              }
                            }}
                          >
                            {r}
                          </Button>
                        ))}
                      </Box>
                    )}

                    {/* INPUT CONTROL PANEL */}
                    <Box
                      sx={{
                        p: 1.5,
                        borderTop: theme.palette.mode === 'dark' ? '1px solid #3d3d3d' : '1px solid #e1dfdd',
                        bgcolor: theme.palette.mode === 'dark' ? '#201f1f' : '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                      }}
                    >
                      <input
                        type="file"
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                        onChange={handleFileChange}
                      />
                      <IconButton size="small" onClick={triggerFileUpload} color="primary" sx={{ bgcolor: 'rgba(255, 255, 255, 0.05)', color: '#94a3b8' }}>
                        <IconPaperclip size={18} />
                      </IconButton>

                      <Box sx={{ position: 'relative' }}>
                        <IconButton size="small" onClick={() => setShowEmojiPicker(!showEmojiPicker)} color="primary" sx={{ bgcolor: showEmojiPicker ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255, 255, 255, 0.05)', color: showEmojiPicker ? '#818cf8' : '#94a3b8' }}>
                          <IconMoodSmile size={18} />
                        </IconButton>

                        {showEmojiPicker && (
                          <Box sx={{ position: 'absolute', bottom: '100%', left: 0, mb: 1, zIndex: 10 }}>
                            <EmojiPicker
                              theme="dark"
                              onEmojiClick={(emojiData) => {
                                setNewMessage(prev => prev + emojiData.emoji);
                                setShowEmojiPicker(false);
                              }}
                              width={280}
                              height={350}
                            />
                          </Box>
                        )}
                      </Box>

                      <IconButton
                        size="small"
                        onClick={handleVoiceToggle}
                        color={isRecordingVoice ? 'error' : 'primary'}
                        sx={{
                          bgcolor: isRecordingVoice ? 'rgba(244, 67, 54, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                          color: isRecordingVoice ? '#f44336' : '#94a3b8',
                          animation: isRecordingVoice ? 'pulse 1s infinite' : 'none',
                          '@keyframes pulse': {
                            '0%': { transform: 'scale(1)' },
                            '50%': { transform: 'scale(1.15)' },
                            '100%': { transform: 'scale(1)' }
                          }
                        }}
                      >
                        {isRecordingVoice ? <IconMicrophoneOff size={18} /> : <IconMicrophone size={18} />}
                      </IconButton>

                      <TextField
                        fullWidth
                        size="small"
                        placeholder={isRecordingVoice ? `Recording voice note... ${Math.floor(recordingDuration / 60)}:${(recordingDuration % 60).toString().padStart(2, '0')}` : 'Type a message or /boss...'}
                        disabled={isRecordingVoice}
                        value={newMessage}
                        onChange={handleInputChange}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                        variant="outlined"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '4px',
                            bgcolor: theme.palette.mode === 'dark' ? '#292929' : '#f5f5f5',
                            color: theme.palette.mode === 'dark' ? '#fff' : '#242424',
                            '& input': { color: theme.palette.mode === 'dark' ? '#fff' : '#242424' },
                            '& fieldset': { borderColor: theme.palette.mode === 'dark' ? '#3d3d3d' : '#e1dfdd' },
                            '&:hover fieldset': { borderColor: '#6264A7' },
                            '&.Mui-focused fieldset': { borderColor: '#6264A7' }
                          }
                        }}
                      />

                      <IconButton size="small" color="primary" onClick={() => handleSendMessage()} sx={{ bgcolor: '#6366f1', color: '#fff', boxShadow: '0 0 12px rgba(99, 102, 241, 0.4)', '&:hover': { bgcolor: '#4f46e5', boxShadow: '0 0 18px rgba(99, 102, 241, 0.6)' } }}>
                        <IconSend size={18} />
                      </IconButton>
                    </Box>

                    {/* AI SUMMARY SLIDE-IN PANEL */}
                    <AnimatePresence>
                      {showAiSummary && (
                        <motion.div
                          initial={{ x: '100%' }}
                          animate={{ x: 0 }}
                          exit={{ x: '100%' }}
                          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                          style={{
                            position: 'absolute',
                            top: 0,
                            right: 0,
                            width: '85%',
                            height: '100%',
                            background: theme.palette.mode === 'dark' ? '#292929' : '#ffffff',
                            borderLeft: theme.palette.mode === 'dark' ? '1px solid #3d3d3d' : '1px solid #e1dfdd',
                            boxShadow: '-4px 0 16px rgba(0,0,0,0.1)',
                            zIndex: 10,
                            display: 'flex',
                            flexDirection: 'column'
                          }}
                        >
                          <Box sx={{ p: 2, bgcolor: theme.palette.mode === 'dark' ? '#201f1f' : '#f5f5f5', borderBottom: theme.palette.mode === 'dark' ? '1px solid #3d3d3d' : '1px solid #e1dfdd', color: theme.palette.mode === 'dark' ? '#fff' : '#242424', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <IconSparkles size={18} color="#6264A7" />
                              <Typography variant="h6" sx={{ fontWeight: 700, color: theme.palette.mode === 'dark' ? '#fff' : '#242424' }}>M365 Copilot (BOS AI)</Typography>
                            </Box>
                            <IconButton size="small" onClick={() => setShowAiSummary(false)} sx={{ color: theme.palette.mode === 'dark' ? '#d1d1d1' : '#616161' }}>
                              <IconX size={18} />
                            </IconButton>
                          </Box>
                          <Box sx={{ flexGrow: 1, p: 2, overflowY: 'auto' }}>
                            {isLoadingSummary ? (
                              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center', mt: 4 }}>
                                <CircularProgress size={30} sx={{ color: '#6264A7' }} />
                                <Typography variant="caption" sx={{ color: theme.palette.mode === 'dark' ? '#d1d1d1' : '#616161' }}>Analyzing thread context...</Typography>
                              </Box>
                            ) : (
                              <Box sx={{
                                fontSize: '0.825rem',
                                color: theme.palette.mode === 'dark' ? '#e2e8f0' : '#242424',
                                '& h3': { color: '#6264A7', fontWeight: 700, mt: 0, mb: 1, fontSize: '0.95rem' },
                                '& ul': { pl: 2, mt: 0.5, mb: 1.5 },
                                '& li': { mb: 0.8 },
                                '& strong': { color: theme.palette.mode === 'dark' ? '#fff' : '#000' }
                              }}>
                                <Typography variant="body2" component="div" sx={{ whiteSpace: 'pre-line', lineHeight: 1.5, color: 'inherit' }}>
                                  {aiSummary}
                                </Typography>
                              </Box>
                            )}
                          </Box>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* FILES LIST DRAWER */}
                    <AnimatePresence>
                      {showFilesList && (
                        <motion.div
                          initial={{ x: '100%' }}
                          animate={{ x: 0 }}
                          exit={{ x: '100%' }}
                          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                          style={{
                            position: 'absolute',
                            top: 0,
                            right: 0,
                            width: '85%',
                            height: '100%',
                            background: 'rgba(15, 23, 42, 0.96)',
                            backdropFilter: 'blur(16px)',
                            borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
                            boxShadow: '-10px 0 30px rgba(0,0,0,0.4)',
                            zIndex: 10,
                            display: 'flex',
                            flexDirection: 'column'
                          }}
                        >
                          <Box sx={{ p: 2, bgcolor: '#0f172a', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <IconPaperclip size={18} />
                              <Typography variant="h6" sx={{ fontWeight: 800, color: '#fff' }}>Shared Files</Typography>
                            </Box>
                            <IconButton size="small" onClick={() => setShowFilesList(false)} sx={{ color: '#fff' }}>
                              <IconX size={18} />
                            </IconButton>
                          </Box>
                          <Box sx={{ flexGrow: 1, p: 2, overflowY: 'auto' }}>
                            {filesList.length === 0 ? (
                              <Typography variant="body2" color="#94a3b8" sx={{ textAlign: 'center', mt: 4 }}>
                                No files shared in this channel yet.
                              </Typography>
                            ) : (
                              <List size="small">
                                {filesList.map((f, i) => (
                                  <ListItem
                                    key={i}
                                    sx={{
                                      border: '1px solid rgba(255, 255, 255, 0.08)',
                                      borderRadius: '10px',
                                      mb: 1,
                                      bgcolor: 'rgba(255, 255, 255, 0.02)'
                                    }}
                                  >
                                    <ListItemAvatar>
                                      <Avatar sx={{ bgcolor: 'rgba(255, 255, 255, 0.05)' }}>
                                        <IconFileText size={20} color="#818cf8" />
                                      </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText
                                      primary={f.attachmentName}
                                      secondary={`${f.attachmentType} • ${new Date(f.createdAt).toLocaleDateString()}`}
                                      primaryTypographyProps={{ fontSize: '0.775rem', fontWeight: 800, color: '#f8fafc' }}
                                      secondaryTypographyProps={{ fontSize: '0.675rem', color: '#94a3b8' }}
                                    />
                                    <Button
                                      size="small"
                                      href={`/api/files/view/${f.attachmentUrl}`}
                                      target="_blank"
                                      sx={{ fontSize: '0.65rem', textTransform: 'none', color: '#818cf8' }}
                                    >
                                      View
                                    </Button>
                                  </ListItem>
                                ))}
                              </List>
                            )}
                          </Box>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Box>
                )}
                
                {(!activeChannel || isMaximized) && (
                  // ============================== CHANNELS / ROOMS LIST (SIDEBAR) ==============================
                  <Box sx={{ 
                    width: isMaximized ? '320px' : '100%', 
                    flexShrink: 0,
                    display: 'flex', 
                    flexDirection: 'column', 
                    overflow: 'hidden',
                    borderRight: isMaximized ? (theme.palette.mode === 'dark' ? '1px solid #3d3d3d' : '1px solid #e1dfdd') : 'none',
                    bgcolor: theme.palette.mode === 'dark' ? '#201f1f' : '#f5f5f5'
                  }}>
                    <Tabs
                      value={activeTab}
                      onChange={(e, val) => setActiveTab(val)}
                      variant="fullWidth"
                      sx={{
                        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                        '& .MuiTabs-indicator': { bgcolor: '#6366f1' },
                        '& .MuiTab-root': { fontWeight: 800, textTransform: 'none', color: '#94a3b8', fontSize: '0.8rem' },
                        '& .Mui-selected': { color: '#818cf8 !important' }
                      }}
                    >
                      <Tab label="Chats" />
                      <Tab label="Find Users" />
                      <Tab label="New Group" />
                    </Tabs>

                    <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
                      {activeTab === 0 && (
                        // TAB 0: ACTIVE CHATS LIST
                        isLoadingChannels ? (
                          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 4 }}>
                            <CircularProgress size={30} sx={{ color: '#6366f1' }} />
                          </Box>
                        ) : channels.length === 0 ? (
                          <Box sx={{ p: 4, textAlign: 'center' }}>
                            <Typography variant="body2" color="#94a3b8">No channels active.</Typography>
                          </Box>
                        ) : (
                          <List sx={{ p: 0 }}>
                            {channels.map((chan) => (
                              <ListItem
                                button
                                onClick={() => selectRoom(chan)}
                                key={chan.id}
                                sx={{
                                  borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                                  transition: '0.2s',
                                  '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.03)' }
                                }}
                              >
                                <ListItemAvatar>
                                  <Badge
                                    overlap="circular"
                                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                    variant="dot"
                                    color={chan.members.some(m => m.userId !== currentUserId && m.online) ? 'success' : 'default'}
                                  >
                                    <Avatar sx={{ bgcolor: '#312e81', width: 40, height: 40 }}>
                                      {chan.channelType === 'DIRECT' ? (
                                        chan.channelName.charAt(0).toUpperCase()
                                      ) : chan.channelType === 'DEPARTMENT' ? (
                                        <IconFileText size={20} />
                                      ) : (
                                        <IconUsers size={20} />
                                      )}
                                    </Avatar>
                                  </Badge>
                                </ListItemAvatar>
                                <ListItemText
                                  primary={
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#f8fafc' }}>
                                        {chan.channelName}
                                      </Typography>
                                      <Typography variant="caption" color="#94a3b8" sx={{ fontSize: '0.65rem' }}>
                                        {new Date(chan.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                      </Typography>
                                    </Box>
                                  }
                                  secondary={
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.5 }}>
                                      <Typography variant="caption" noWrap sx={{ maxWidth: '80%', color: '#94a3b8', fontWeight: chan.unreadCount > 0 ? 900 : 500 }}>
                                        {chan.lastMessageSender && `${chan.lastMessageSender}: `}{chan.lastMessage}
                                      </Typography>
                                      {chan.unreadCount > 0 && (
                                        <Box sx={{ bgcolor: '#ff4d4f', color: '#fff', borderRadius: '10px', px: 0.8, py: 0.2, fontSize: '0.65rem', fontWeight: 900 }}>
                                          {chan.unreadCount}
                                        </Box>
                                      )}
                                    </Box>
                                  }
                                />
                              </ListItem>
                            ))}
                          </List>
                        )
                      )}

                      {activeTab === 1 && (
                        // TAB 1: FIND USERS AND START DIRECT CHAT
                        <Box sx={{ p: 2 }}>
                          <TextField
                            fullWidth
                            size="small"
                            placeholder="Type user ID or employee name..."
                            value={searchUserQuery}
                            onChange={(e) => handleUserSearch(e.target.value)}
                            sx={{
                              mb: 2,
                              '& .MuiOutlinedInput-root': {
                                borderRadius: '12px',
                                bgcolor: 'rgba(255, 255, 255, 0.04)',
                                color: '#fff',
                                '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.1)' },
                                '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                                '&.Mui-focused fieldset': { borderColor: '#6366f1' }
                              },
                              '& .MuiInputAdornment-root svg': { color: '#94a3b8' }
                            }}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <IconSearch size={18} />
                                </InputAdornment>
                              )
                            }}
                          />
                          {userSearchResults.length === 0 ? (
                            <Typography variant="body2" color="#94a3b8" sx={{ textAlign: 'center', mt: 2 }}>
                              No matching BOS(S) users found.
                            </Typography>
                          ) : (
                            <List sx={{ p: 0 }}>
                              {userSearchResults.map((u) => (
                                <ListItem
                                  button
                                  onClick={() => startDirectChat(u)}
                                  key={u.userId}
                                  sx={{
                                    border: '1px solid rgba(255, 255, 255, 0.08)',
                                    borderRadius: '12px',
                                    mb: 1,
                                    bgcolor: 'rgba(255, 255, 255, 0.02)',
                                    '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.04)' }
                                  }}
                                >
                                  <ListItemAvatar>
                                    <Badge overlap="circular" anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} variant="dot" color={u.online ? 'success' : 'default'}>
                                      <Avatar sx={{ bgcolor: '#312e81' }}>{u.employeeName.charAt(0).toUpperCase()}</Avatar>
                                    </Badge>
                                  </ListItemAvatar>
                                  <ListItemText
                                    primary={u.userId}
                                    secondary={`${u.employeeName} • ${u.designationName || 'BOS Staff'} • ${u.departmentName || 'Admin'}`}
                                    primaryTypographyProps={{ fontSize: '0.8rem', fontWeight: 800, color: theme.palette.mode === 'dark' ? '#f8fafc' : '#0f172a' }}
                                    secondaryTypographyProps={{ fontSize: '0.7rem', color: '#94a3b8' }}
                                  />
                                  <Button size="small" variant="contained" sx={{ fontSize: '0.675rem', textTransform: 'none', borderRadius: '15px', bgcolor: '#6366f1', '&:hover': { bgcolor: '#4f46e5' } }}>
                                    Chat
                                  </Button>
                                </ListItem>
                              ))}
                            </List>
                          )}
                        </Box>
                      )}

                      {activeTab === 2 && (
                        // TAB 2: CREATE NEW GROUP CHAT
                        <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                          <TextField
                            fullWidth
                            size="small"
                            label="Group Chat Name"
                            value={groupName}
                            onChange={(e) => setGroupName(e.target.value)}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: '12px',
                                bgcolor: 'rgba(255, 255, 255, 0.04)',
                                color: '#fff',
                                '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.1)' },
                                '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                                '&.Mui-focused fieldset': { borderColor: '#6366f1' }
                              },
                              '& .MuiInputLabel-root': { color: '#94a3b8' }
                            }}
                          />

                          <Typography variant="subtitle2" sx={{ fontWeight: 800, mt: 1, color: '#f8fafc' }}>
                            Select Members:
                          </Typography>

                          <TextField
                            fullWidth
                            size="small"
                            placeholder="Filter members..."
                            value={searchUserQuery}
                            onChange={(e) => handleUserSearch(e.target.value)}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: '12px',
                                bgcolor: 'rgba(255, 255, 255, 0.04)',
                                color: '#fff',
                                '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.1)' },
                                '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                                '&.Mui-focused fieldset': { borderColor: '#6366f1' }
                              }
                            }}
                          />

                          <Box sx={{ maxHeight: 200, overflowY: 'auto', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', p: 1, bgcolor: 'rgba(255,255,255,0.02)' }}>
                            {userSearchResults.length === 0 ? (
                              <Typography variant="caption" color="#94a3b8" sx={{ display: 'block', textAlign: 'center', py: 2 }}>
                                Type in filter bar to list users
                              </Typography>
                            ) : (
                              <List size="small">
                                {userSearchResults.map((u) => (
                                  <ListItem
                                    button
                                    onClick={() => toggleGroupUser(u.userId)}
                                    key={u.userId}
                                    sx={{
                                      borderRadius: '8px',
                                      mb: 0.5,
                                      bgcolor: selectedGroupUsers.includes(u.userId) ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                                      '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.04)' }
                                    }}
                                  >
                                    <ListItemText
                                      primary={u.employeeName}
                                      secondary={u.departmentName}
                                      primaryTypographyProps={{ fontSize: '0.75rem', fontWeight: 800, color: '#f8fafc' }}
                                      secondaryTypographyProps={{ fontSize: '0.65rem', color: '#94a3b8' }}
                                    />
                                    {selectedGroupUsers.includes(u.userId) && (
                                      <IconCheck size={16} color="#6366f1" />
                                    )}
                                  </ListItem>
                                ))}
                              </List>
                            )}
                          </Box>

                          <Button
                            variant="contained"
                            disabled={!groupName.trim() || selectedGroupUsers.length === 0}
                            onClick={handleCreateGroup}
                            sx={{
                              borderRadius: '20px',
                              textTransform: 'none',
                              fontWeight: 800,
                              background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                              boxShadow: '0 0 15px rgba(99, 102, 241, 0.35)',
                              '&:hover': {
                                background: 'linear-gradient(135deg, #4f46e5 0%, #3b33c8 100%)',
                                boxShadow: '0 0 20px rgba(99, 102, 241, 0.5)'
                              }
                            }}
                          >
                            Create Group Discussions
                          </Button>
                        </Box>
                      )}
                    </Box>
                    </Box>
                  )}
              </Box>
            </Box>
          </Grow>
        )}
      </AnimatePresence>
    </>
  );
}
