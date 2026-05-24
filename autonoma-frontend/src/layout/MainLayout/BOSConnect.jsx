import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';

// third party
import FullCalendar from '@fullcalendar/react';
import listPlugin from '@fullcalendar/list';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

// material-ui
import {
  Box,
  Typography,
  IconButton,
  TextField,
  Avatar,
  Badge,
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
  InputAdornment,
  Checkbox,
  Stack,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  OutlinedInput,
  Chip
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';

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
  IconMoodSmile,
  IconBell,
  IconBellOff,
  IconCalendar,
  IconPaperclip as IconFiles,
  IconFolder,
  IconMessageCircle,
  IconInfoCircle,
  IconDots,
  IconTrash,
  IconEdit,
  IconUserCheck,
  IconCalendarEvent,
  IconPhone,
  IconVideo,
  IconPhoneOff,
  IconVideoOff,
  IconScreenShare,
  IconVolume
} from '@tabler/icons-react';

import EmojiPicker from 'emoji-picker-react';

// project imports
import axiosServices from 'utils/axios';
import useAuth from 'hooks/useAuth';
import { getCompanyImageUrl, getUserImageUrl } from 'utils/upload-helper';

const TEAMS_PURPLE = '#5B5FC7'; // Classic Microsoft Teams signature color
const TEAMS_DARK_BG = '#1F1F1F'; // Teams desktop client dark mode bg
const TEAMS_LIGHT_BG = '#F5F5F5'; // Teams light pane bg
const TEAMS_BORDER_LIGHT = '#E1DFDD';
const TEAMS_BORDER_DARK = '#292929';

const getFormattedSeparatorDate = (dateStr) => {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  } else if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  } else {
    return date.toLocaleDateString([], { day: '2-digit', month: '2-digit', year: 'numeric' });
  }
};

// ==============================|| AUTONOMA ONE-CONNECT (TEAMS DESIGNED) ||============================== //

export default function BOSConnect() {
  const theme = useTheme();
  const location = useLocation();
  const { user } = useAuth();
  const currentUserId = user?.userId || user?.id || 'bos';

  // State
  const [isOpen, setIsOpen] = useState(false);
  const [companyLogoUrl, setCompanyLogoUrl] = useState('/logo.png');
  const [activeToast, setActiveToast] = useState(null);
  const [notificationPermission, setNotificationPermission] = useState(
    window.Notification ? Notification.permission : 'default'
  );
  
  // Teams-style sidebar navigation state: 'chats' | 'teams' | 'copilot' | 'files' | 'calendar'
  const [teamsSidebarTab, setTeamsSidebarTab] = useState('chats');

  // Meeting Schedule & Calendar View states
  const [meetingSchedules, setMeetingSchedules] = useState([]);
  const [isLoadingSchedules, setIsLoadingSchedules] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [isScheduling, setIsScheduling] = useState(false);
  const [isEditingMeeting, setIsEditingMeeting] = useState(false);
  const [searchMeetingQuery, setSearchMeetingQuery] = useState('');

  // Simulated calling states
  const [callState, setCallState] = useState('IDLE'); // 'IDLE' | 'RINGING' | 'ACTIVE'
  const [callType, setCallType] = useState('AUDIO'); // 'AUDIO' | 'VIDEO'
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isCamOff, setIsCamOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  // Meeting Metadata Cache
  const [meetingMasters, setMeetingMasters] = useState([]);
  const [activeEmployees, setActiveEmployees] = useState([]);
  const [activeDepartments, setActiveDepartments] = useState([]);

  // Meeting Cancellation Reason Prompt
  const [showCancelPrompt, setShowCancelPrompt] = useState(false);
  const [cancelReasonText, setCancelReasonText] = useState('');

  // Meeting Form Data state
  const [meetingForm, setMeetingForm] = useState({
    meetingTypeId: '',
    meetingName: '',
    subject: '',
    description: '',
    agenda: '',
    meetingDate: '',
    startTime: '',
    endTime: '',
    chairedById: '',
    hostById: '',
    participantIds: [],
    departmentIds: []
  });
  
  // Search & View states
  const [activeTab, setActiveTab] = useState(0); // 0 = Chats list, 1 = Find Users, 2 = New Group
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

  // Active channel context tabs: 'posts' | 'files' | 'summary'
  const [activeChannelTab, setActiveChannelTab] = useState('posts');

  // Group Chat Creator
  const [groupName, setGroupName] = useState('');
  const [selectedGroupUsers, setSelectedGroupUsers] = useState([]);

  // Voice Note State
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);

  // Emoji State
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // Loading States
  const [isLoadingChannels, setIsLoadingChannels] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  // Dimensions & Maximize state
  const [isMaximized, setIsMaximized] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 450, height: 650 });
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
        width: Math.max(380, Math.min(window.innerWidth - 48, startWidth + deltaX)),
        height: Math.max(485, Math.min(window.innerHeight - 140, startHeight + deltaY))
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

  // Play Microsoft Teams styled notification synth chime
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

  // HTML5 Desktop popup alert
  const showDesktopNotification = (msg) => {
    if (!window.Notification) return;

    const options = {
      body: msg.messageContent || 'Sent an attachment',
      icon: companyLogoUrl || '/logo.png',
      tag: 'bos-connect-msg-' + msg.channelId
    };

    if (Notification.permission === 'granted') {
      try {
        new Notification('Autonoma OneConnect : ' + msg.senderName, options);
      } catch (err) {
        console.warn('Direct notification failed, falling back to service worker...', err);
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.ready.then((registration) => {
            registration.showNotification('Autonoma OneConnect : ' + msg.senderName, options);
          });
        }
      }
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          try {
            new Notification('Autonoma OneConnect : ' + msg.senderName, options);
          } catch (err) {
            if ('serviceWorker' in navigator) {
              navigator.serviceWorker.ready.then((registration) => {
                registration.showNotification('Autonoma OneConnect : ' + msg.senderName, options);
              });
            }
          }
        }
      });
    }
  };

  const requestNotificationPermission = () => {
    if (window.Notification) {
      Notification.requestPermission().then((perm) => {
        setNotificationPermission(perm);
        console.log('Notification permission request returned:', perm);
      });
    }
  };

  // Request Notification permissions and fetch company logo on Mount
  useEffect(() => {
    requestNotificationPermission();

    const fetchCompanyLogo = async () => {
      try {
        const response = await axiosServices.get('/api/company-profile/all');
        if (response.data && response.data.length > 0 && response.data[0].logoFileName) {
          const logoUrl = getCompanyImageUrl(response.data[0].logoFileName);
          setCompanyLogoUrl(logoUrl);
        }
      } catch (e) {
        console.warn('Failed to fetch company profile logo', e);
      }
    };
    fetchCompanyLogo();

    updatePresenceStatus(true);
    return () => {
      updatePresenceStatus(false);
      if (pollingRef.current) clearInterval(pollingRef.current);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, []);

  const updatePresenceStatus = (isOnline) => {
    axiosServices.post(`/api/chat/presence?isOnline=${isOnline}`).catch(() => { });
  };

  // Fetch Calendar Data
  useEffect(() => {
    if (isOpen && teamsSidebarTab === 'calendar') {
      fetchMeetingSchedules();
      fetchCalendarMetadata();
    }
  }, [isOpen, teamsSidebarTab]);

  const fetchCalendarMetadata = async () => {
    try {
      const resMasters = await axiosServices.get('/api/qms/meetings');
      setMeetingMasters(resMasters.data || []);
    } catch (e) {
      console.warn("Failed to fetch meeting masters", e);
    }

    try {
      const resEmployees = await axiosServices.get('/api/master/employee/filter/active');
      setActiveEmployees(resEmployees.data || []);
    } catch (e) {
      console.warn("Failed to fetch active employees", e);
    }

    try {
      const resDepts = await axiosServices.get('/api/hrm/departments/active');
      setActiveDepartments(resDepts.data || []);
    } catch (e) {
      console.warn("Failed to fetch active departments", e);
    }
  };

  const fetchMeetingSchedules = async () => {
    setIsLoadingSchedules(true);
    try {
      const res = await axiosServices.get('/api/qms/meeting-schedules');
      setMeetingSchedules(res.data || []);
    } catch (e) {
      console.error("Failed to load meeting schedules", e);
    } finally {
      setIsLoadingSchedules(false);
    }
  };

  const handleSaveMeeting = async (e) => {
    if (e) e.preventDefault();
    if (!meetingForm.meetingTypeId || !meetingForm.meetingName || !meetingForm.meetingDate || !meetingForm.startTime || !meetingForm.endTime) {
      alert("Please fill in all required fields.");
      return;
    }

    const selectedMeetingType = meetingMasters.find(m => m.id === parseInt(meetingForm.meetingTypeId));
    const selectedChaired = meetingForm.chairedById ? activeEmployees.find(emp => emp.id === parseInt(meetingForm.chairedById)) : null;
    const selectedHost = meetingForm.hostById ? activeEmployees.find(emp => emp.id === parseInt(meetingForm.hostById)) : null;

    const payload = {
      id: isEditingMeeting ? selectedMeeting.id : null,
      scheduleNo: isEditingMeeting ? selectedMeeting.scheduleNo : 'AUTO',
      revNo: isEditingMeeting ? (selectedMeeting.revNo || 0) + 1 : 0,
      meetingType: selectedMeetingType,
      meetingName: meetingForm.meetingName,
      subject: meetingForm.subject || meetingForm.meetingName,
      description: meetingForm.description || selectedMeetingType?.meetingDescription || '',
      agenda: meetingForm.agenda || selectedMeetingType?.meetingAgenda || '',
      meetingDate: meetingForm.meetingDate,
      startTime: meetingForm.startTime,
      endTime: meetingForm.endTime,
      intervalTime: '00:00',
      frequency: 'NONE',
      weekdays: '',
      chairedBy: selectedChaired,
      hostBy: selectedHost,
      status: selectedMeeting?.status || 'OPEN',
      departments: (meetingForm.departmentIds || []).map(deptId => {
        const dept = activeDepartments.find(d => d.id === deptId);
        return { department: dept };
      }),
      participants: (meetingForm.participantIds || []).map(empId => {
        const emp = activeEmployees.find(e => e.id === empId);
        return { employee: emp };
      })
    };

    try {
      if (isEditingMeeting && selectedMeeting?.id) {
        const res = await axiosServices.put(`/api/qms/meeting-schedules/${selectedMeeting.id}`, payload);
        setSelectedMeeting(res.data);
      } else {
        await axiosServices.post('/api/qms/meeting-schedules', payload);
        setSelectedMeeting(null);
      }
      setIsScheduling(false);
      setIsEditingMeeting(false);
      fetchMeetingSchedules();
    } catch (err) {
      console.error("Failed to save meeting schedule", err);
      alert(err.response?.data?.message || err.message || "Failed to save meeting.");
    }
  };

  const handleCancelMeeting = async () => {
    if (!selectedMeeting || !cancelReasonText.trim()) return;
    try {
      const payload = {
        ...selectedMeeting,
        status: 'CANCELLED',
        cancelReason: cancelReasonText
      };
      const res = await axiosServices.put(`/api/qms/meeting-schedules/${selectedMeeting.id}`, payload);
      setSelectedMeeting(res.data);
      setShowCancelPrompt(false);
      setCancelReasonText('');
      fetchMeetingSchedules();
    } catch (err) {
      console.error("Failed to cancel meeting", err);
      alert("Failed to cancel meeting.");
    }
  };

  const handleDeleteMeeting = async (meetingId) => {
    if (!window.confirm("Are you sure you want to delete this meeting schedule?")) return;
    try {
      await axiosServices.delete(`/api/qms/meeting-schedules/${meetingId}`);
      setSelectedMeeting(null);
      setIsScheduling(false);
      setIsEditingMeeting(false);
      fetchMeetingSchedules();
    } catch (err) {
      console.error("Failed to delete meeting", err);
      alert(err.response?.data?.message || err.message || "Failed to delete meeting schedule.");
    }
  };

  const handleOpenEditForm = (meeting) => {
    setMeetingForm({
      meetingTypeId: meeting.meetingType?.id || '',
      meetingName: meeting.meetingName || '',
      subject: meeting.subject || '',
      description: meeting.description || '',
      agenda: meeting.agenda || '',
      meetingDate: meeting.meetingDate || '',
      startTime: meeting.startTime || '',
      endTime: meeting.endTime || '',
      chairedById: meeting.chairedBy?.id || '',
      hostById: meeting.hostBy?.id || '',
      participantIds: (meeting.participants || []).map(p => p.employee?.id),
      departmentIds: (meeting.departments || []).map(d => d.department?.id)
    });
    setIsEditingMeeting(true);
    setIsScheduling(true);
  };

  const handleOpenCreateForm = (initialDate = '', initialStartTime = '', initialEndTime = '') => {
    setMeetingForm({
      meetingTypeId: '',
      meetingName: '',
      subject: '',
      description: '',
      agenda: '',
      meetingDate: initialDate || new Date().toISOString().split('T')[0],
      startTime: initialStartTime || '10:00',
      endTime: initialEndTime || '11:00',
      chairedById: '',
      hostById: '',
      participantIds: [],
      departmentIds: []
    });
    setSelectedMeeting(null);
    setIsEditingMeeting(false);
    setIsScheduling(true);
  };

  // Poll channel list and messages
  useEffect(() => {
    fetchChannels();
    const intervalTime = isOpen ? 3000 : 5000;
    pollingRef.current = setInterval(() => {
      pollData();
    }, intervalTime);
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [isOpen, activeChannel?.id]);

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

  const pollData = async () => {
    try {
      const resChan = await axiosServices.get('/api/chat/channels');

      if (channels && channels.length > 0) {
        resChan.data.forEach(newC => {
          const oldC = channels.find(c => c.id === newC.id);
          const oldUnread = oldC ? oldC.unreadCount : 0;
          if (newC.unreadCount > oldUnread) {
            const lastMsg = newC.lastMessage;
            if (lastMsg && lastMsg.senderId !== currentUserId && lastMsg.senderId !== 'BOS_AI_ASSISTANT') {
              playPing();
              showDesktopNotification(lastMsg);

              if (!isOpen || !activeChannel || activeChannel.id !== newC.id) {
                setActiveToast({
                  id: lastMsg.id || new Date().getTime(),
                  senderName: lastMsg.senderName || newC.channelName || lastMsg.senderId,
                  messageContent: lastMsg.messageContent || 'Sent an attachment',
                  channel: newC
                });
                setTimeout(() => {
                  setActiveToast(null);
                }, 4000);
              }
            }
          }
        });
      }

      setChannels(resChan.data);

      if (activeChannel) {
        const updatedActive = resChan.data.find(c => c.id === activeChannel.id);
        if (updatedActive && updatedActive.members) {
          const isSomeoneTyping = updatedActive.members.some(
            m => m.userId !== currentUserId && m.isTyping
          );
          setOtherUserTyping(isSomeoneTyping);
        }
      }

      if (activeChannel) {
        const resMsg = await axiosServices.get(`/api/chat/channels/${activeChannel.id}/messages`);
        const polledMessages = resMsg.data;

        const prevCount = prevMessagesCountRef.current[activeChannel.id] || 0;
        if (polledMessages.length > prevCount) {
          const lastMsg = polledMessages[polledMessages.length - 1];
          if (lastMsg.senderId !== currentUserId && lastMsg.senderId !== 'BOS_AI_ASSISTANT') {
            playPing();
            showDesktopNotification(lastMsg);
          }
          setMessages(polledMessages);
          scrollMessageList();
          fetchSmartReplies(activeChannel.id);
        }
        prevMessagesCountRef.current[activeChannel.id] = polledMessages.length;
      }
    } catch (e) {
      console.warn("Polling request failed", e);
    }
  };

  const selectRoom = async (chan) => {
    setActiveChannel(chan);
    setIsLoadingMessages(true);
    setShowAiSummary(false);
    setShowFilesList(false);
    setSearchMessageQuery('');
    setActiveChannelTab('posts'); // Default to Posts tab like Microsoft Teams

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

      const updatedMessages = [...messages, res.data];
      setMessages(updatedMessages);
      prevMessagesCountRef.current[activeChannel.id] = updatedMessages.length;
      setNewMessage('');
      scrollMessageList();

      axiosServices.post('/api/chat/typing').catch(() => { });
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

      setTimeout(() => {
        pollData();
      }, 1000);

    } catch (e) {
      console.error("Failed to send message", e);
    }
  };

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

  const handleUserSearch = async (val = '') => {
    setSearchUserQuery(val);
    try {
      const res = await axiosServices.get(`/api/chat/search/users?query=${val}`);
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
      await fetchChannels();
      selectRoom(res.data);
      setActiveTab(0);
      setSearchUserQuery('');
      setUserSearchResults([]);
    } catch (e) {
      console.error("Failed to start direct chat", e);
    }
  };

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
      const res = await axiosServices.post('/api/files/upload', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const fileUrl = res.data;
      const fileExt = file.name.split('.').pop().toUpperCase();
      let fileType = 'DOC';
      if (['PDF'].includes(fileExt)) fileType = 'PDF';
      else if (['XLS', 'XLSX', 'CSV'].includes(fileExt)) fileType = 'EXCEL';
      else if (['PNG', 'JPG', 'JPEG', 'GIF', 'WEBP'].includes(fileExt)) fileType = 'IMAGE';

      handleSendMessage(`Sent file: ${file.name}`, 'FILE', {
        url: fileUrl,
        name: file.name,
        type: fileType
      });
    } catch (err) {
      console.error("File upload failed", err);
    }
  };

  const handleVoiceToggle = async () => {
    if (isRecordingVoice) {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }
      setIsRecordingVoice(false);
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
      setRecordingDuration(0);
    } else {
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
        setIsRecordingVoice(true);
        setTimeout(() => {
          setIsRecordingVoice(false);
          handleSendMessage('Simulated Voice Note', 'VOICE');
        }, 2000);
      }
    }
  };

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
    setAiSummary('');
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
    try {
      const res = await axiosServices.get(`/api/chat/channels/${activeChannel.id}/files`);
      setFilesList(res.data);
    } catch (e) {
      setFilesList([]);
    }
  };

  useEffect(() => {
    if (activeChannel) {
      if (activeChannelTab === 'files') fetchFilesList();
      if (activeChannelTab === 'summary') fetchAiSummary();
    }
  }, [activeChannelTab, activeChannel?.id]);

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

  const filteredMessages = messages.filter(m => {
    if (!searchMessageQuery.trim()) return true;
    return m.messageContent?.toLowerCase().includes(searchMessageQuery.toLowerCase());
  });

  // Filters channels by type depending on left sidebar active item
  const displayChannels = channels.filter(c => {
    if (teamsSidebarTab === 'chats') return c.channelType === 'DIRECT';
    if (teamsSidebarTab === 'teams') return c.channelType !== 'DIRECT';
    return true;
  });

  return (
    <>
      {/* 🚀 MICROSOFT TEAMS INSPIRED FLOATABLE LAUNCHER BUTTON */}
      <motion.div
        drag
        dragMomentum={false}
        dragTransition={{ bounceStiffness: 600, bounceDamping: 15 }}
        whileHover={{ scale: 1.1, cursor: 'grab' }}
        whileTap={{ scale: 0.9, cursor: 'grabbing' }}
        initial={{ x: 0, y: 0 }}
        style={{
          position: 'fixed',
          bottom: '100px',
          right: '24px',
          zIndex: 10000,
          touchAction: 'none'
        }}
      >
        <Tooltip title="Autonoma OneConnect (Teams Client)" placement="top">
          <Button
            variant="contained"
            onClick={() => {
              setIsOpen(!isOpen);
              requestNotificationPermission();
            }}
            sx={{
              bgcolor: TEAMS_PURPLE,
              color: '#fff',
              borderRadius: '50%',
              boxShadow: '0 8px 24px rgba(91, 95, 199, 0.45)',
              border: 'none',
              width: '56px',
              height: '56px',
              minWidth: '56px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              '&:hover': {
                bgcolor: '#464775',
                boxShadow: '0 10px 28px rgba(91, 95, 199, 0.55)'
              }
            }}
          >
            <IconMessageCircle size={26} stroke={1.8} />
            {channels.reduce((acc, c) => acc + c.unreadCount, 0) > 0 && (
              <Box
                sx={{
                  position: 'absolute',
                  top: -2,
                  right: -2,
                  minWidth: 18,
                  height: 18,
                  borderRadius: '50%',
                  bgcolor: '#C43E1C', // Microsoft Teams signature alert red
                  color: '#fff',
                  fontSize: '0.65rem',
                  fontWeight: 900,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 8px #C43E1C',
                  border: '1.5px solid #fff',
                  zIndex: 10
                }}
              >
                {channels.reduce((acc, c) => acc + c.unreadCount, 0)}
              </Box>
            )}
          </Button>
        </Tooltip>
      </motion.div>

      {/* 🛡️ STATE-OF-THE-ART MICROSOFT TEAMS CLIENT WORKSPACE */}
      <AnimatePresence>
        {isOpen && (
          <Grow in={isOpen} style={{ transformOrigin: 'bottom right' }}>
            <Box
              sx={{
                position: 'fixed',
                bottom: isMaximized ? '24px' : '170px',
                right: '24px',
                width: isMaximized ? 'calc(100vw - 48px)' : `${dimensions.width}px`,
                height: isMaximized ? 'calc(100vh - 120px)' : `${dimensions.height}px`,
                maxWidth: isMaximized ? 'none' : '95vw',
                maxHeight: isMaximized ? 'none' : '90vh',
                zIndex: 9999,
                display: 'flex',
                background: theme.palette.mode === 'dark' ? TEAMS_DARK_BG : '#FFFFFF',
                borderRadius: '8px',
                boxShadow: '0 24px 60px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.06)',
                border: `1px solid ${theme.palette.mode === 'dark' ? TEAMS_BORDER_DARK : TEAMS_BORDER_LIGHT}`,
                overflow: 'hidden',
                transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
                animation: 'teamsWindowSlideUp 0.3s ease-out',
                '@keyframes teamsWindowSlideUp': {
                  '0%': { transform: 'translateY(30px) scale(0.98)', opacity: 0 },
                  '100%': { transform: 'translateY(0) scale(1)', opacity: 1 }
                },
                '& ::-webkit-scrollbar': {
                  width: '5px',
                  height: '5px'
                },
                '& ::-webkit-scrollbar-track': {
                  background: 'transparent'
                },
                '& ::-webkit-scrollbar-thumb': {
                  background: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)',
                  borderRadius: '10px',
                  '&:hover': {
                    background: TEAMS_PURPLE
                  }
                }
              }}
            >
              {/* 📐 RESIZE HANDLE */}
              {!isMaximized && (
                <Box
                  onMouseDown={handleResizeStart}
                  onTouchStart={handleResizeStart}
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '24px',
                    height: '24px',
                    cursor: 'nw-resize',
                    zIndex: 10001
                  }}
                />
              )}

              {/* ── 1. LEFT NARROW VERTICAL BAR (Signature Microsoft Teams Edge) ── */}
              <Box
                sx={{
                  width: '68px',
                  bgcolor: theme.palette.mode === 'dark' ? '#201F1F' : '#EFEFF4',
                  borderRight: `1px solid ${theme.palette.mode === 'dark' ? TEAMS_BORDER_DARK : TEAMS_BORDER_LIGHT}`,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  py: 2.5,
                  gap: 3,
                  flexShrink: 0
                }}
              >
                {/* App Brand Logo */}
                <Avatar
                  src={companyLogoUrl}
                  sx={{
                    width: 38,
                    height: 38,
                    bgcolor: TEAMS_PURPLE,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    border: `1.5px solid ${theme.palette.mode === 'dark' ? '#444' : '#fff'}`,
                    mb: 1
                  }}
                />

                {/* Sidebar Navigation Items */}
                <Stack spacing={1.5} sx={{ width: '100%', alignItems: 'center' }}>
                  {[
                    { id: 'chats', label: 'Chat', icon: <IconMessageCircle size={22} /> },
                    { id: 'teams', label: 'Teams', icon: <IconUsers size={22} /> },
                    { id: 'calendar', label: 'Calendar', icon: <IconCalendar size={22} /> },
                    { id: 'copilot', label: 'Copilot', icon: <IconSparkles size={22} /> },
                    { id: 'files', label: 'Files', icon: <IconFolder size={22} /> }
                  ].map((item) => {
                    const isActive = teamsSidebarTab === item.id;
                    const hasNewAlert = item.id === 'chats' && channels.some(c => c.unreadCount > 0);
                    return (
                      <Tooltip key={item.id} title={item.label} placement="right">
                        <Box sx={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'center' }}>
                          {isActive && (
                            <Box
                              sx={{
                                position: 'absolute',
                                left: 0,
                                top: '10%',
                                width: '3px',
                                height: '80%',
                                bgcolor: TEAMS_PURPLE,
                                borderRadius: '0 4px 4px 0'
                              }}
                            />
                          )}
                          <IconButton
                            onClick={() => {
                              setTeamsSidebarTab(item.id);
                              if (item.id === 'calendar') {
                                setSelectedMeeting(null);
                                setIsScheduling(false);
                                setIsEditingMeeting(false);
                              } else if (item.id === 'copilot' && activeChannel) {
                                setActiveChannelTab('summary');
                              } else if (item.id === 'files' && activeChannel) {
                                setActiveChannelTab('files');
                              } else {
                                setActiveChannelTab('posts');
                              }
                            }}
                            sx={{
                              color: isActive ? TEAMS_PURPLE : (theme.palette.mode === 'dark' ? '#adadad' : '#616161'),
                              bgcolor: isActive ? (theme.palette.mode === 'dark' ? 'rgba(91,95,199,0.15)' : '#ffffff') : 'transparent',
                              borderRadius: '8px',
                              width: 46,
                              height: 46,
                              transition: 'all 0.2s',
                              '&:hover': {
                                bgcolor: theme.palette.mode === 'dark' ? '#292929' : '#e1dfdd',
                                color: TEAMS_PURPLE
                              }
                            }}
                          >
                            {hasNewAlert ? (
                              <Badge color="error" variant="dot" overlap="circular">
                                {item.icon}
                              </Badge>
                            ) : item.icon}
                          </IconButton>
                        </Box>
                      </Tooltip>
                    );
                  })}
                </Stack>

                <Box sx={{ mt: 'auto' }}>
                  <Tooltip title="Help & System Info">
                    <IconButton sx={{ color: theme.palette.mode === 'dark' ? '#adadad' : '#616161' }}>
                      <IconInfoCircle size={22} />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>

              {/* ── 2. MIDDLE & RIGHT SPLIT VIEW CONTAINER ── */}
              <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                
                {/* SYSTEM LEVEL SEARCH & TITLE Edge */}
                <Box
                  sx={{
                    bgcolor: TEAMS_PURPLE,
                    p: '10px 16px',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexShrink: 0
                  }}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, letterSpacing: '0.03em', fontSize: '0.85rem' }}>
                    Autonoma OneConnect
                  </Typography>

                  {/* Top search bar fallback (looks like Teams desktop header) */}
                  <Box sx={{ display: { xs: 'none', sm: 'flex' }, width: '40%', maxWidth: 320 }}>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="Search users or type /commands"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          height: 28,
                          borderRadius: '4px',
                          bgcolor: 'rgba(255, 255, 255, 0.15)',
                          color: '#fff',
                          fontSize: '0.75rem',
                          '& fieldset': { border: 'none' },
                          '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.25)' },
                          '&.Mui-focused': { bgcolor: '#fff', color: '#000' }
                        },
                        '& .MuiInputBase-input::placeholder': { color: 'rgba(255,255,255,0.7)', opacity: 1 },
                        '& .MuiInputBase-input:focus::placeholder': { color: '#888' }
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <IconSearch size={14} color="rgba(255,255,255,0.8)" />
                          </InputAdornment>
                        )
                      }}
                    />
                  </Box>

                  {/* Top Window Actions */}
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <Tooltip title={isMaximized ? "Restore" : "Maximize"}>
                      <IconButton size="small" onClick={() => setIsMaximized(!isMaximized)} sx={{ color: '#fff', p: 0.5 }}>
                        {isMaximized ? <IconMinimize size={16} /> : <IconMaximize size={16} />}
                      </IconButton>
                    </Tooltip>
                    <IconButton size="small" onClick={() => setIsOpen(false)} sx={{ color: '#fff', p: 0.5 }}>
                      <IconX size={18} />
                    </IconButton>
                  </Stack>
                </Box>

                {/* MAIN SPLIT Edge */}
                <Box sx={{ flexGrow: 1, display: 'flex', overflow: 'hidden' }}>

                  {/* ── A. CHANNELS / CHAT LIST (Teams Middle Sidebar Pane) ── */}
                  {(!activeChannel || isMaximized || teamsSidebarTab === 'copilot' || teamsSidebarTab === 'files' || teamsSidebarTab === 'calendar') && (
                    <Box
                      sx={{
                        width: isMaximized ? '280px' : '100%',
                        flexShrink: 0,
                        borderRight: `1px solid ${theme.palette.mode === 'dark' ? TEAMS_BORDER_DARK : TEAMS_BORDER_LIGHT}`,
                        bgcolor: theme.palette.mode === 'dark' ? '#292929' : TEAMS_LIGHT_BG,
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden'
                      }}
                    >
                      {/* Search & Actions Panel */}
                      <Box sx={{ p: 1.5, display: 'flex', gap: 1, alignItems: 'center' }}>
                        {teamsSidebarTab === 'calendar' ? (
                          <>
                            <TextField
                              fullWidth
                              size="small"
                              placeholder="Filter meetings"
                              value={searchMeetingQuery}
                              onChange={(e) => setSearchMeetingQuery(e.target.value)}
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: '4px',
                                  height: 32,
                                  bgcolor: theme.palette.mode === 'dark' ? '#1f1f1f' : '#ffffff',
                                  fontSize: '0.8rem',
                                  '& fieldset': { borderColor: theme.palette.mode === 'dark' ? '#444' : '#e1dfdd' },
                                  '&:hover fieldset': { borderColor: TEAMS_PURPLE },
                                  '&.Mui-focused fieldset': { borderColor: TEAMS_PURPLE }
                                }
                              }}
                            />
                            <Tooltip title="Schedule New Meeting">
                              <IconButton
                                onClick={() => handleOpenCreateForm()}
                                sx={{
                                  bgcolor: isScheduling && !isEditingMeeting ? TEAMS_PURPLE : 'transparent',
                                  color: isScheduling && !isEditingMeeting ? '#fff' : 'inherit',
                                  border: `1px solid ${theme.palette.mode === 'dark' ? '#444' : '#e1dfdd'}`,
                                  borderRadius: '4px',
                                  width: 32,
                                  height: 32
                                }}
                              >
                                <IconPlus size={16} />
                              </IconButton>
                            </Tooltip>
                          </>
                        ) : (
                          <>
                            <TextField
                              fullWidth
                              size="small"
                              placeholder="Filter chat lists"
                              value={searchUserQuery}
                              onChange={(e) => handleUserSearch(e.target.value)}
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: '4px',
                                  height: 32,
                                  bgcolor: theme.palette.mode === 'dark' ? '#1f1f1f' : '#ffffff',
                                  fontSize: '0.8rem',
                                  '& fieldset': { borderColor: theme.palette.mode === 'dark' ? '#444' : '#e1dfdd' },
                                  '&:hover fieldset': { borderColor: TEAMS_PURPLE },
                                  '&.Mui-focused fieldset': { borderColor: TEAMS_PURPLE }
                                }
                              }}
                            />
                            <Tooltip title="Start New Conversation">
                              <IconButton
                                onClick={() => {
                                  setActiveTab(activeTab === 1 ? 0 : 1);
                                  setSearchUserQuery('');
                                }}
                                sx={{
                                  bgcolor: activeTab === 1 ? TEAMS_PURPLE : 'transparent',
                                  color: activeTab === 1 ? '#fff' : 'inherit',
                                  border: `1px solid ${theme.palette.mode === 'dark' ? '#444' : '#e1dfdd'}`,
                                  borderRadius: '4px',
                                  width: 32,
                                  height: 32
                                }}
                              >
                                <IconPlus size={16} />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}
                      </Box>

                      {/* Header Category text based on sidebar tab */}
                      <Box sx={{ px: 2, pb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.7rem' }}>
                          {teamsSidebarTab === 'chats' ? 'Conversations' : teamsSidebarTab === 'teams' ? 'Colleague Channels' : teamsSidebarTab === 'calendar' ? 'Meeting Schedules' : teamsSidebarTab === 'copilot' ? 'AI Workspace' : 'Shared Cloud'}
                        </Typography>
                        {teamsSidebarTab === 'teams' && (
                          <Tooltip title="Create new Group Channel">
                            <IconButton size="small" onClick={() => setActiveTab(2)} sx={{ p: 0.25 }}>
                              <IconPlus size={14} />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>

                      {/* Tab switching or display lists */}
                      <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
                        {teamsSidebarTab === 'calendar' ? (
                          // ── SUB-VIEW: LIST OF MEETING SCHEDULES ──
                          <List sx={{ p: 0 }}>
                            {isLoadingSchedules ? (
                              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                                <CircularProgress size={24} sx={{ color: TEAMS_PURPLE }} />
                              </Box>
                            ) : meetingSchedules.filter(m => 
                              !searchMeetingQuery || 
                              m.meetingName?.toLowerCase().includes(searchMeetingQuery.toLowerCase()) || 
                              m.subject?.toLowerCase().includes(searchMeetingQuery.toLowerCase())
                            ).length === 0 ? (
                              <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', mt: 4, color: 'text.secondary' }}>
                                No meetings found
                              </Typography>
                            ) : (
                              meetingSchedules.filter(m => 
                                !searchMeetingQuery || 
                                m.meetingName?.toLowerCase().includes(searchMeetingQuery.toLowerCase()) || 
                                m.subject?.toLowerCase().includes(searchMeetingQuery.toLowerCase())
                              ).map((meeting) => {
                                const isSelected = selectedMeeting?.id === meeting.id;
                                const isCancelled = meeting.status === 'CANCELLED';
                                return (
                                  <ListItem
                                    button
                                    onClick={() => {
                                      setSelectedMeeting(meeting);
                                      setIsScheduling(false);
                                      setIsEditingMeeting(false);
                                    }}
                                    key={meeting.id}
                                    sx={{
                                      py: 1.25,
                                      px: 2,
                                      bgcolor: isSelected ? (theme.palette.mode === 'dark' ? '#1F1F1F' : '#FFFFFF') : 'transparent',
                                      borderBottom: `1px solid ${theme.palette.mode === 'dark' ? '#333' : '#f0f0f0'}`,
                                      borderLeft: isSelected ? `3.5px solid ${TEAMS_PURPLE}` : '3.5px solid transparent',
                                      '&:hover': { bgcolor: theme.palette.mode === 'dark' ? '#333' : '#EFEFF4' }
                                    }}
                                  >
                                    <ListItemAvatar sx={{ minWidth: 44 }}>
                                      <Avatar sx={{ 
                                        bgcolor: isCancelled ? 'rgba(211, 47, 47, 0.1)' : alpha(TEAMS_PURPLE, 0.1), 
                                        color: isCancelled ? '#d32f2f' : TEAMS_PURPLE, 
                                        width: 34, 
                                        height: 34 
                                      }}>
                                        <IconCalendarEvent size={18} />
                                      </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText
                                      primary={
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                          <Typography variant="subtitle2" noWrap sx={{ fontWeight: 700, fontSize: '0.8rem', color: isCancelled ? 'text.secondary' : (theme.palette.mode === 'dark' ? '#f8fafc' : '#1f1f1f'), textDecoration: isCancelled ? 'line-through' : 'none' }}>
                                            {meeting.meetingName}
                                          </Typography>
                                        </Box>
                                      }
                                      secondary={
                                        <Box sx={{ mt: 0.3 }}>
                                          <Typography variant="caption" sx={{ display: 'block', fontSize: '0.675rem', color: 'text.secondary', fontWeight: 500 }}>
                                            {meeting.meetingDate} • {meeting.startTime}
                                          </Typography>
                                          <Typography variant="caption" noWrap sx={{ display: 'block', fontSize: '0.65rem', color: isCancelled ? '#d32f2f' : 'text.disabled', mt: 0.1 }}>
                                            {isCancelled ? `Cancelled` : (meeting.chairedBy ? `Chaired by: ${meeting.chairedBy.employeeName}` : `Open Status`)}
                                          </Typography>
                                        </Box>
                                      }
                                    />
                                  </ListItem>
                                );
                              })
                            )}
                          </List>
                        ) : activeTab === 1 ? (
                          // ── SUB-VIEW: SEARCH USERS FOR DIRECT CHAT ──
                          <List sx={{ p: 0 }}>
                            {userSearchResults.map((u) => (
                              <ListItem
                                button
                                onClick={() => startDirectChat(u)}
                                key={u.userId}
                                sx={{
                                  py: 1,
                                  px: 2,
                                  borderBottom: `1px solid ${theme.palette.mode === 'dark' ? '#333' : '#f5f5f5'}`
                                }}
                              >
                                <ListItemAvatar>
                                  <Badge overlap="circular" anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} variant="dot" color={u.online ? 'success' : 'default'}>
                                    <Avatar src={u.imgName ? getUserImageUrl(u.imgName) : undefined} sx={{ bgcolor: TEAMS_PURPLE, width: 36, height: 36 }}>
                                      {u.userId.charAt(0).toUpperCase()}
                                    </Avatar>
                                  </Badge>
                                </ListItemAvatar>
                                <ListItemText
                                  primary={u.userId}
                                  secondary={`${u.designationName || 'BOS Staff'}`}
                                  primaryTypographyProps={{ fontSize: '0.8rem', fontWeight: 700 }}
                                  secondaryTypographyProps={{ fontSize: '0.7rem', color: 'text.secondary' }}
                                />
                              </ListItem>
                            ))}
                          </List>
                        ) : activeTab === 2 ? (
                          // ── SUB-VIEW: CREATE GROUP CHAT ──
                          <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1.8 }}>
                            <TextField
                              fullWidth
                              size="small"
                              label="Channel Name"
                              value={groupName}
                              onChange={(e) => setGroupName(e.target.value)}
                              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '4px' } }}
                            />
                            <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary' }}>Select Members:</Typography>
                            <Box sx={{ maxHeight: 150, overflowY: 'auto', border: `1px solid ${theme.palette.mode === 'dark' ? '#444' : '#e1dfdd'}`, borderRadius: '4px', p: 0.5 }}>
                              <List sx={{ p: 0 }}>
                                {userSearchResults.map((u) => (
                                  <ListItem key={u.userId} button onClick={() => toggleGroupUser(u.userId)} sx={{ py: 0.5, px: 1, borderRadius: '4px', mb: 0.5, bgcolor: selectedGroupUsers.includes(u.userId) ? 'rgba(91,95,199,0.08)' : 'transparent' }}>
                                    <Checkbox checked={selectedGroupUsers.includes(u.userId)} size="small" sx={{ p: 0.5, mr: 1, color: TEAMS_PURPLE, '&.Mui-checked': { color: TEAMS_PURPLE } }} />
                                    <ListItemText primary={u.userId} primaryTypographyProps={{ fontSize: '0.75rem', fontWeight: 600 }} />
                                  </ListItem>
                                ))}
                              </List>
                            </Box>
                            <Button fullWidth size="small" variant="contained" onClick={handleCreateGroup} disabled={!groupName.trim() || selectedGroupUsers.length === 0} sx={{ bgcolor: TEAMS_PURPLE, textTransform: 'none', fontWeight: 700, '&:hover': { bgcolor: '#464775' } }}>
                              Create Group
                            </Button>
                            <Button fullWidth size="small" variant="text" onClick={() => setActiveTab(0)} sx={{ textTransform: 'none', color: 'text.secondary' }}>
                              Cancel
                            </Button>
                          </Box>
                        ) : (
                          // ── DEFAULT VIEW: CHANNELS & DIRECT CHATS ──
                          <List sx={{ p: 0 }}>
                            {displayChannels.map((chan) => {
                              const isActive = activeChannel?.id === chan.id;
                              return (
                                <ListItem
                                  button
                                  onClick={() => selectRoom(chan)}
                                  key={chan.id}
                                  sx={{
                                    py: 1.25,
                                    px: 2,
                                    bgcolor: isActive ? (theme.palette.mode === 'dark' ? '#1F1F1F' : '#FFFFFF') : 'transparent',
                                    borderBottom: `1px solid ${theme.palette.mode === 'dark' ? '#333' : '#f0f0f0'}`,
                                    borderLeft: isActive ? `3.5px solid ${TEAMS_PURPLE}` : '3.5px solid transparent',
                                    '&:hover': { bgcolor: theme.palette.mode === 'dark' ? '#333' : '#EFEFF4' }
                                  }}
                                >
                                  <ListItemAvatar sx={{ minWidth: 46 }}>
                                    <Badge overlap="circular" anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} variant="dot" color={chan.members.some(m => m.userId !== currentUserId && m.online) ? 'success' : 'default'}>
                                      <Avatar
                                        src={chan.channelType === 'DIRECT' && chan.members.find(m => m.userId !== currentUserId)?.imgName ? getUserImageUrl(chan.members.find(m => m.userId !== currentUserId).imgName) : undefined}
                                        sx={{ bgcolor: TEAMS_PURPLE, width: 36, height: 36, fontSize: '0.85rem', fontWeight: 800 }}
                                      >
                                        {chan.channelType === 'DIRECT' ? (
                                          chan.channelName.charAt(0).toUpperCase()
                                        ) : chan.channelType === 'DEPARTMENT' ? (
                                          <IconFileText size={18} />
                                        ) : (
                                          <IconUsers size={18} />
                                        )}
                                      </Avatar>
                                    </Badge>
                                  </ListItemAvatar>
                                  <ListItemText
                                    primary={
                                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Typography variant="subtitle2" sx={{ fontWeight: chan.unreadCount > 0 ? 900 : 700, fontSize: '0.8rem', color: theme.palette.mode === 'dark' ? '#f8fafc' : '#1f1f1f' }}>
                                          {chan.channelName}
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.65rem' }}>
                                          {new Date(chan.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </Typography>
                                      </Box>
                                    }
                                    secondary={
                                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.2 }}>
                                        <Typography variant="caption" noWrap sx={{ maxWidth: '85%', color: 'text.secondary', fontWeight: chan.unreadCount > 0 ? 800 : 400 }}>
                                          {chan.lastMessageSender && `${chan.lastMessageSender}: `}{chan.lastMessage}
                                        </Typography>
                                        {chan.unreadCount > 0 && (
                                          <Box sx={{ bgcolor: '#C43E1C', color: '#fff', borderRadius: '10px', px: 0.8, py: 0.1, fontSize: '0.6rem', fontWeight: 900 }}>
                                            {chan.unreadCount}
                                          </Box>
                                        )}
                                      </Box>
                                    }
                                  />
                                </ListItem>
                              );
                            })}
                          </List>
                        )}
                      </Box>
                    </Box>
                  )}

                  {/* ── B. MAIN ACTIVE WINDOW (Teams Chat/Calendar timeline and workspace) ── */}
                  {teamsSidebarTab === 'calendar' ? (
                    <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', bgcolor: theme.palette.mode === 'dark' ? '#1F1F1F' : '#FAF9F8' }}>
                      {/* Header */}
                      <Box sx={{ p: '12px 20px', borderBottom: `1px solid ${theme.palette.mode === 'dark' ? TEAMS_BORDER_DARK : TEAMS_BORDER_LIGHT}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: theme.palette.mode === 'dark' ? '#201F1F' : '#FFFFFF' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          {(isScheduling || selectedMeeting) && (
                            <IconButton size="small" onClick={() => { setIsScheduling(false); setSelectedMeeting(null); setIsEditingMeeting(false); }} sx={{ color: 'text.primary' }}>
                              <IconArrowLeft size={18} />
                            </IconButton>
                          )}
                          <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary', fontSize: '0.95rem' }}>
                            {isScheduling ? (isEditingMeeting ? 'Edit Meeting Schedule' : 'Schedule New Meeting') : selectedMeeting ? 'Meeting Information' : 'Teams Calendar'}
                          </Typography>
                        </Box>
                        {!isScheduling && !selectedMeeting && (
                          <Button 
                            variant="contained" 
                            size="small" 
                            onClick={() => handleOpenCreateForm()}
                            startIcon={<IconPlus size={16} />}
                            sx={{ bgcolor: TEAMS_PURPLE, textTransform: 'none', fontWeight: 700, '&:hover': { bgcolor: '#464775' } }}
                          >
                            Schedule Meeting
                          </Button>
                        )}
                      </Box>

                      {/* Content Area */}
                      <Box sx={{ flexGrow: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
                        
                        {isScheduling ? (
                          // ── VIEW 1: SCHEDULE/EDIT MEETING FORM ──
                          <Box component="form" onSubmit={handleSaveMeeting} sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                              <FormControl fullWidth size="small" required>
                                <InputLabel>Meeting Type</InputLabel>
                                <Select
                                  value={meetingForm.meetingTypeId}
                                  label="Meeting Type"
                                  onChange={(e) => {
                                    const selectedTypeId = e.target.value;
                                    const meetingType = meetingMasters.find(m => m.id === parseInt(selectedTypeId));
                                    if (meetingType) {
                                      const masterEmpEntries = (meetingType.employeeName || '').split(',').map(s => s.trim()).filter(Boolean);
                                      const matchedParticipants = activeEmployees.filter(emp => 
                                        masterEmpEntries.some(entry => {
                                          const separator = entry.includes(' - ') ? ' - ' : entry.includes(';') ? ';' : null;
                                          if (separator) {
                                            const [code] = entry.split(separator);
                                            return emp.empCode === code;
                                          }
                                          return emp.employeeName === entry;
                                        })
                                      );
                                      const matchedParticipantIds = matchedParticipants.map(emp => emp.id);

                                      setMeetingForm({
                                        ...meetingForm,
                                        meetingTypeId: selectedTypeId,
                                        description: meetingForm.description || meetingType.meetingDescription || '',
                                        agenda: meetingForm.agenda || meetingType.meetingAgenda || '',
                                        participantIds: matchedParticipantIds
                                      });
                                    } else {
                                      setMeetingForm({ ...meetingForm, meetingTypeId: selectedTypeId });
                                    }
                                  }}
                                >
                                  {meetingMasters.map(m => (
                                    <MenuItem key={m.id} value={m.id}>{m.meetingName} ({m.meetingPrefix})</MenuItem>
                                  ))}
                                </Select>
                              </FormControl>
                              
                              <TextField
                                label="Meeting Name"
                                required
                                size="small"
                                fullWidth
                                value={meetingForm.meetingName}
                                onChange={(e) => setMeetingForm({ ...meetingForm, meetingName: e.target.value })}
                              />
                            </Stack>

                            <TextField
                              label="Subject"
                              size="small"
                              fullWidth
                              value={meetingForm.subject}
                              onChange={(e) => setMeetingForm({ ...meetingForm, subject: e.target.value })}
                            />

                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                              <TextField
                                label="Meeting Date"
                                type="date"
                                required
                                size="small"
                                fullWidth
                                InputLabelProps={{ shrink: true }}
                                value={meetingForm.meetingDate}
                                onChange={(e) => setMeetingForm({ ...meetingForm, meetingDate: e.target.value })}
                              />
                              <TextField
                                label="Start Time"
                                type="time"
                                required
                                size="small"
                                fullWidth
                                InputLabelProps={{ shrink: true }}
                                value={meetingForm.startTime}
                                onChange={(e) => setMeetingForm({ ...meetingForm, startTime: e.target.value })}
                              />
                              <TextField
                                label="End Time"
                                type="time"
                                required
                                size="small"
                                fullWidth
                                InputLabelProps={{ shrink: true }}
                                value={meetingForm.endTime}
                                onChange={(e) => setMeetingForm({ ...meetingForm, endTime: e.target.value })}
                              />
                            </Stack>

                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                              <FormControl fullWidth size="small">
                                <InputLabel>Chaired By</InputLabel>
                                <Select
                                  value={meetingForm.chairedById}
                                  label="Chaired By"
                                  onChange={(e) => setMeetingForm({ ...meetingForm, chairedById: e.target.value })}
                                >
                                  <MenuItem value=""><em>None</em></MenuItem>
                                  {activeEmployees.map(emp => (
                                    <MenuItem key={emp.id} value={emp.id}>{emp.employeeName} ({emp.empCode})</MenuItem>
                                  ))}
                                </Select>
                              </FormControl>

                              <FormControl fullWidth size="small">
                                <InputLabel>Host By</InputLabel>
                                <Select
                                  value={meetingForm.hostById}
                                  label="Host By"
                                  onChange={(e) => setMeetingForm({ ...meetingForm, hostById: e.target.value })}
                                >
                                  <MenuItem value=""><em>None</em></MenuItem>
                                  {activeEmployees.map(emp => (
                                    <MenuItem key={emp.id} value={emp.id}>{emp.employeeName} ({emp.empCode})</MenuItem>
                                  ))}
                                </Select>
                              </FormControl>
                            </Stack>

                            {/* Departments Multi-Select */}
                            <FormControl fullWidth size="small">
                              <InputLabel>Departments Involved</InputLabel>
                              <Select
                                multiple
                                value={meetingForm.departmentIds}
                                onChange={(e) => setMeetingForm({ ...meetingForm, departmentIds: e.target.value })}
                                input={<OutlinedInput label="Departments Involved" />}
                                renderValue={(selected) => (
                                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                    {selected.map((value) => {
                                      const dept = activeDepartments.find(d => d.id === value);
                                      return <Chip key={value} label={dept ? dept.departmentName : value} size="small" />;
                                    })}
                                  </Box>
                                )}
                              >
                                {activeDepartments.map((dept) => (
                                  <MenuItem key={dept.id} value={dept.id}>
                                    {dept.departmentName}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>

                            {/* Participants Multi-Select */}
                            <FormControl fullWidth size="small">
                              <InputLabel>Participants</InputLabel>
                              <Select
                                multiple
                                value={meetingForm.participantIds}
                                onChange={(e) => setMeetingForm({ ...meetingForm, participantIds: e.target.value })}
                                input={<OutlinedInput label="Participants" />}
                                renderValue={(selected) => (
                                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                    {selected.map((value) => {
                                      const emp = activeEmployees.find(e => e.id === value);
                                      return <Chip key={value} label={emp ? emp.employeeName : value} size="small" />;
                                    })}
                                  </Box>
                                )}
                              >
                                {activeEmployees.map((emp) => (
                                  <MenuItem key={emp.id} value={emp.id}>
                                    {emp.employeeName} ({emp.empCode})
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>

                            <TextField
                              label="Agenda"
                              multiline
                              rows={2}
                              fullWidth
                              size="small"
                              value={meetingForm.agenda}
                              onChange={(e) => setMeetingForm({ ...meetingForm, agenda: e.target.value })}
                            />

                            <TextField
                              label="Description"
                              multiline
                              rows={2}
                              fullWidth
                              size="small"
                              value={meetingForm.description}
                              onChange={(e) => setMeetingForm({ ...meetingForm, description: e.target.value })}
                            />

                            <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt: 1 }}>
                              <Button 
                                size="small" 
                                variant="outlined" 
                                onClick={() => { setIsScheduling(false); setIsEditingMeeting(false); }}
                                sx={{ textTransform: 'none' }}
                              >
                                Cancel
                              </Button>
                              <Button 
                                size="small" 
                                type="submit" 
                                variant="contained" 
                                sx={{ bgcolor: TEAMS_PURPLE, textTransform: 'none', fontWeight: 700, '&:hover': { bgcolor: '#464775' } }}
                              >
                                {isEditingMeeting ? 'Update Schedule' : 'Schedule Meeting'}
                              </Button>
                            </Stack>
                          </Box>
                        ) : selectedMeeting ? (
                          // ── VIEW 2: MEETING DETAILS VIEW ──
                          <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
                            {/* Card Details */}
                            <Paper variant="outlined" sx={{ p: 2.5, display: 'flex', flexDirection: 'column', gap: 2, bgcolor: theme.palette.mode === 'dark' ? '#292929' : '#fff', border: `1px solid ${theme.palette.mode === 'dark' ? '#444' : '#e1dfdd'}` }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 1.5 }}>
                                <Box>
                                  <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary' }}>
                                    {selectedMeeting.meetingName}
                                  </Typography>
                                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5, fontWeight: 600 }}>
                                    Schedule No: {selectedMeeting.scheduleNo}
                                  </Typography>
                                </Box>
                                <Chip 
                                  label={selectedMeeting.status} 
                                  color={selectedMeeting.status === 'CANCELLED' ? 'error' : 'success'} 
                                  size="small" 
                                  sx={{ fontWeight: 700 }}
                                />
                              </Box>

                              <Divider />

                              <Stack spacing={1.5}>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                  <Typography variant="body2" sx={{ fontWeight: 700, minWidth: 100 }}>Date & Time:</Typography>
                                  <Typography variant="body2">{selectedMeeting.meetingDate} @ {selectedMeeting.startTime} - {selectedMeeting.endTime}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                  <Typography variant="body2" sx={{ fontWeight: 700, minWidth: 100 }}>Meeting Type:</Typography>
                                  <Typography variant="body2">{selectedMeeting.meetingType?.meetingName}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                  <Typography variant="body2" sx={{ fontWeight: 700, minWidth: 100 }}>Chaired By:</Typography>
                                  <Typography variant="body2">{selectedMeeting.chairedBy ? `${selectedMeeting.chairedBy.employeeName} (${selectedMeeting.chairedBy.empCode})` : 'N/A'}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                  <Typography variant="body2" sx={{ fontWeight: 700, minWidth: 100 }}>Host By:</Typography>
                                  <Typography variant="body2">{selectedMeeting.hostBy ? `${selectedMeeting.hostBy.employeeName} (${selectedMeeting.hostBy.empCode})` : 'N/A'}</Typography>
                                </Box>
                              </Stack>

                              {selectedMeeting.departments && selectedMeeting.departments.length > 0 && (
                                <Box>
                                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>Departments Involved:</Typography>
                                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                    {selectedMeeting.departments.map((d, i) => (
                                      <Chip key={i} label={d.department?.departmentName} size="small" variant="outlined" />
                                    ))}
                                  </Box>
                                </Box>
                              )}

                              {selectedMeeting.participants && selectedMeeting.participants.length > 0 && (
                                <Box>
                                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>Participants:</Typography>
                                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                    {selectedMeeting.participants.map((p, i) => (
                                      <Chip key={i} label={p.employee?.employeeName} size="small" variant="outlined" color="primary" />
                                    ))}
                                  </Box>
                                </Box>
                              )}

                              {selectedMeeting.agenda && (
                                <Box>
                                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>Agenda:</Typography>
                                  <Typography variant="body2" sx={{ whiteSpace: 'pre-line', p: 1, bgcolor: theme.palette.mode === 'dark' ? '#1f1f1f' : '#f5f5f5', borderRadius: '4px' }}>
                                    {selectedMeeting.agenda}
                                  </Typography>
                                </Box>
                              )}

                              {selectedMeeting.description && (
                                <Box>
                                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>Description:</Typography>
                                  <Typography variant="body2" sx={{ whiteSpace: 'pre-line', p: 1, bgcolor: theme.palette.mode === 'dark' ? '#1f1f1f' : '#f5f5f5', borderRadius: '4px' }}>
                                    {selectedMeeting.description}
                                  </Typography>
                                </Box>
                              )}

                              {selectedMeeting.status === 'CANCELLED' && selectedMeeting.cancelReason && (
                                <Box sx={{ borderLeft: '3px solid #d32f2f', pl: 1.5, py: 0.5 }}>
                                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#d32f2f' }}>Cancellation Reason:</Typography>
                                  <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                                    "{selectedMeeting.cancelReason}"
                                  </Typography>
                                </Box>
                              )}
                            </Paper>

                            {/* Cancellation Reason Prompt Inline */}
                            {showCancelPrompt && (
                              <Paper variant="outlined" sx={{ p: 2, borderColor: '#d32f2f', bgcolor: theme.palette.mode === 'dark' ? '#2c2222' : '#fff8f8' }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#d32f2f', mb: 1 }}>Provide reason for cancellation:</Typography>
                                <TextField
                                  fullWidth
                                  multiline
                                  rows={2}
                                  size="small"
                                  placeholder="e.g. Host is unavailable, scheduled for another day"
                                  value={cancelReasonText}
                                  onChange={(e) => setCancelReasonText(e.target.value)}
                                  sx={{ mb: 2 }}
                                />
                                <Stack direction="row" spacing={1.5} justifyContent="flex-end">
                                  <Button size="small" variant="text" onClick={() => setShowCancelPrompt(false)}>Cancel</Button>
                                  <Button size="small" variant="contained" color="error" disabled={!cancelReasonText.trim()} onClick={handleCancelMeeting}>Confirm Cancel</Button>
                                </Stack>
                              </Paper>
                            )}

                            {/* Actions bar */}
                            {!showCancelPrompt && (
                              <Stack direction="row" spacing={1.5} justifyContent="flex-end">
                                <IconButton color="error" onClick={() => handleDeleteMeeting(selectedMeeting.id)}>
                                  <IconTrash size={20} />
                                </IconButton>
                                {selectedMeeting.status !== 'CANCELLED' && (
                                  <>
                                    <Button 
                                      size="small" 
                                      variant="outlined" 
                                      color="error"
                                      onClick={() => setShowCancelPrompt(true)}
                                      sx={{ textTransform: 'none' }}
                                    >
                                      Cancel Meeting
                                    </Button>
                                    <Button 
                                      size="small" 
                                      variant="contained" 
                                      onClick={() => handleOpenEditForm(selectedMeeting)}
                                      startIcon={<IconEdit size={16} />}
                                      sx={{ bgcolor: TEAMS_PURPLE, textTransform: 'none', '&:hover': { bgcolor: '#464775' } }}
                                    >
                                      Edit Details
                                    </Button>
                                  </>
                                )}
                              </Stack>
                            )}
                          </Box>
                        ) : (
                          // ── VIEW 3: FULL CALENDAR GRID VIEW ──
                          <Box sx={{
                            flexGrow: 1,
                            p: 2,
                            height: isMaximized ? 'calc(100vh - 190px)' : '480px',
                            minHeight: 400,
                            overflow: 'hidden',
                            display: 'flex',
                            flexDirection: 'column',
                            bgcolor: theme.palette.mode === 'dark' ? '#1a1a1a' : '#FFFFFF',
                            '& .fc-license-message': { display: 'none' },
                            '& .fc': {
                              fontFamily: 'inherit',
                              '--fc-border-color': theme.palette.mode === 'dark' ? '#333' : '#e1dfdd',
                              '--fc-today-bg-color': theme.palette.mode === 'dark' ? 'rgba(91,95,199,0.15)' : 'rgba(91,95,199,0.08)',
                              '--fc-event-bg-color': TEAMS_PURPLE,
                              '--fc-event-border-color': TEAMS_PURPLE,
                              color: theme.palette.text.primary,
                              fontSize: '0.8rem',
                              height: '100%'
                            },
                            '& .fc-col-header-cell': {
                              bgcolor: theme.palette.mode === 'dark' ? '#292929' : '#f3f2f1',
                              py: 0.5
                            },
                            '& .fc-col-header-cell-cushion': {
                              color: theme.palette.text.primary,
                              fontWeight: 700
                            },
                            '& .fc-daygrid-day-number': {
                              fontWeight: 600,
                              p: 0.5
                            },
                            '& .fc-event': {
                              cursor: 'pointer',
                              borderRadius: '4px',
                              p: 0.25,
                              fontSize: '0.72rem',
                              fontWeight: 600
                            }
                          }}>
                            <FullCalendar
                              plugins={[listPlugin, dayGridPlugin, timeGridPlugin, interactionPlugin]}
                              initialView={isMaximized ? 'dayGridMonth' : 'listWeek'}
                              headerToolbar={{
                                left: 'prev,next today',
                                center: 'title',
                                right: isMaximized ? 'dayGridMonth,timeGridWeek,listWeek' : 'listWeek'
                              }}
                              events={meetingSchedules.map(s => ({
                                id: s.id.toString(),
                                title: s.meetingName || s.subject || 'Meeting',
                                start: `${s.meetingDate}T${s.startTime}`,
                                end: `${s.meetingDate}T${s.endTime}`,
                                color: s.status === 'CANCELLED' ? '#d32f2f' : '#5B5FC7',
                                extendedProps: s
                              }))}
                              selectable
                              editable={false}
                              height="100%"
                              eventTimeFormat={{ hour: 'numeric', minute: '2-digit', meridiem: 'short' }}
                              eventClick={(arg) => {
                                const meeting = arg.event.extendedProps;
                                setSelectedMeeting(meeting);
                                setIsScheduling(false);
                                setIsEditingMeeting(false);
                              }}
                              select={(arg) => {
                                handleOpenCreateForm(arg.startStr, '10:00', '11:00');
                              }}
                            />
                          </Box>
                        )}
                      </Box>
                    </Box>
                  ) : activeChannel && (
                    <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', bgcolor: theme.palette.mode === 'dark' ? '#1F1F1F' : '#FFFFFF' }}>
                      
                      {/* Active Chat Header */}
                      <Box
                        sx={{
                          p: '12px 20px',
                          borderBottom: `1px solid ${theme.palette.mode === 'dark' ? TEAMS_BORDER_DARK : TEAMS_BORDER_LIGHT}`,
                          display: 'flex',
                          flexDirection: 'column',
                          flexShrink: 0
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            {!isMaximized && (
                              <IconButton size="small" onClick={() => setActiveChannel(null)} sx={{ color: 'text.primary', mr: -0.5 }}>
                                <IconArrowLeft size={18} />
                              </IconButton>
                            )}
                            <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary', fontSize: '0.95rem' }}>
                              {activeChannel.channelName}
                            </Typography>
                          </Box>

                          {/* Quick Header actions */}
                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                            <Tooltip title="Start Audio Call (Simulated)">
                              <IconButton size="small" sx={{ color: TEAMS_PURPLE }}><IconMicrophone size={18} /></IconButton>
                            </Tooltip>
                            <Tooltip title="Channel Options"><IconButton size="small"><IconDots size={18} /></IconButton></Tooltip>
                          </Box>
                        </Box>

                        {/* 🌟 TEAMS WINDOW TABS ("Posts", "Files", "AI Summary") */}
                        <Box sx={{ display: 'flex', gap: 2.5, mt: 1.5, borderTop: `1px solid ${theme.palette.mode === 'dark' ? '#2d2d2d' : '#f0f0f0'}`, pt: 1 }}>
                          {[
                            { id: 'posts', label: 'Posts', icon: <IconMessageCircle size={15} /> },
                            { id: 'files', label: 'Files Shared', icon: <IconPaperclip size={15} /> },
                            { id: 'summary', label: 'Copilot AI Summary', icon: <IconSparkles size={15} /> }
                          ].map((t) => (
                            <Button
                              key={t.id}
                              size="small"
                              onClick={() => setActiveChannelTab(t.id)}
                              startIcon={t.icon}
                              sx={{
                                textTransform: 'none',
                                fontWeight: activeChannelTab === t.id ? 800 : 500,
                                color: activeChannelTab === t.id ? TEAMS_PURPLE : 'text.secondary',
                                borderBottom: activeChannelTab === t.id ? `3px solid ${TEAMS_PURPLE}` : '3px solid transparent',
                                borderRadius: 0,
                                px: 0.5,
                                pb: 0.5,
                                fontSize: '0.8rem',
                                minWidth: 0,
                                '&:hover': { bgcolor: 'transparent', color: TEAMS_PURPLE }
                              }}
                            >
                              {t.label}
                            </Button>
                          ))}
                        </Box>
                      </Box>

                      {/* ── TAB 1 CONTENT: POSTS / DISCUSSIONS TIMELINE ── */}
                      {activeChannelTab === 'posts' && (
                        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                          <Box sx={{
                            flexGrow: 1,
                            p: 2.5,
                            overflowY: 'auto',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 1.8,
                            bgcolor: theme.palette.mode === 'dark' ? '#1a1a1a' : '#F3F2F1'
                          }}>
                            {isLoadingMessages ? (
                              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexGrow: 1 }}>
                                <CircularProgress size={30} sx={{ color: TEAMS_PURPLE }} />
                              </Box>
                            ) : (
                              filteredMessages.map((msg, index) => {
                                const isSelf = msg.senderId === currentUserId;
                                const isSystem = msg.senderId === 'BOS_AI_ASSISTANT' || msg.messageType === 'SYSTEM';

                                const msgDate = new Date(msg.createdAt).toDateString();
                                const prevMsgDate = index > 0 ? new Date(filteredMessages[index - 1].createdAt).toDateString() : null;
                                const showDateSeparator = msgDate !== prevMsgDate;

                                return (
                                  <Box key={msg.id || index} sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                                    {showDateSeparator && (
                                      <Box sx={{ display: 'flex', justifyContent: 'center', my: 1.5 }}>
                                        <Box sx={{ px: 1.5, py: 0.5, bgcolor: theme.palette.mode === 'dark' ? '#201f1f' : '#ffffff', borderRadius: '4px', border: '1px solid rgba(0,0,0,0.05)' }}>
                                          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '0.72rem' }}>
                                            {getFormattedSeparatorDate(msg.createdAt)}
                                          </Typography>
                                        </Box>
                                      </Box>
                                    )}

                                    {isSystem ? (
                                      // Copilot message bubble inside standard Teams style
                                      <Box sx={{ display: 'flex', gap: 1.5, my: 1, width: '90%' }}>
                                        <Avatar sx={{ bgcolor: 'rgba(91, 95, 199, 0.1)', color: TEAMS_PURPLE, width: 32, height: 32 }}>
                                          <IconSparkles size={18} />
                                        </Avatar>
                                        <Box sx={{ flexGrow: 1, bgcolor: theme.palette.mode === 'dark' ? '#201F1F' : '#fff', p: 1.8, borderRadius: '6px', border: '1px solid rgba(91,95,199,0.2)', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                                          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: TEAMS_PURPLE, mb: 0.5 }}>{msg.senderName}</Typography>
                                          <Typography variant="body2" component="div" sx={{ fontSize: '0.825rem', color: 'text.primary', whiteSpace: 'pre-line' }}>{msg.messageContent}</Typography>
                                          <Typography variant="caption" sx={{ display: 'block', mt: 0.8, color: 'text.disabled', fontSize: '0.65rem' }}>
                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                          </Typography>
                                        </Box>
                                      </Box>
                                    ) : (
                                      // Fluent style Chat message bubbles
                                      <Box sx={{ display: 'flex', width: '100%', justifyContent: isSelf ? 'flex-end' : 'flex-start' }}>
                                        <Box sx={{ display: 'flex', gap: 1, maxWidth: '80%', flexDirection: isSelf ? 'row-reverse' : 'row' }}>
                                          {!isSelf && (
                                            <Avatar src={msg.senderId ? getUserImageUrl(msg.senderId) : undefined} sx={{ width: 32, height: 32, bgcolor: TEAMS_PURPLE, fontSize: '0.8rem', fontWeight: 800 }}>
                                              {msg.senderId.charAt(0).toUpperCase()}
                                            </Avatar>
                                          )}
                                          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: isSelf ? 'flex-end' : 'flex-start' }}>
                                            {/* Sender name & Timestamp in header line */}
                                            <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'baseline', mb: 0.3 }}>
                                              <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.primary', fontSize: '0.72rem' }}>
                                                {isSelf ? 'You' : msg.senderId}
                                              </Typography>
                                              <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.625rem' }}>
                                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                              </Typography>
                                            </Box>

                                            {/* Fluent bubble */}
                                            <Box sx={{
                                              p: 1.5,
                                              borderRadius: '6px',
                                              bgcolor: isSelf ? (theme.palette.mode === 'dark' ? '#2D2C42' : '#E8E8FF') : (theme.palette.mode === 'dark' ? '#292929' : '#FFFFFF'),
                                              color: 'text.primary',
                                              border: `1px solid ${isSelf ? 'rgba(91,95,199,0.15)' : (theme.palette.mode === 'dark' ? '#333' : '#E1DFDD')}`,
                                              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                                              fontSize: '0.85rem',
                                              wordBreak: 'break-word'
                                            }}>
                                              {msg.messageType === 'TEXT' && (
                                                <Typography variant="body2" sx={{ fontSize: '0.85rem', lineHeight: 1.4 }}>
                                                  {msg.messageContent}
                                                </Typography>
                                              )}

                                              {msg.messageType === 'FILE' && (
                                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2, mt: 0.5 }}>
                                                  {(msg.attachmentType === 'IMAGE' || (msg.attachmentName && msg.attachmentName.match(/\.(jpg|jpeg|png|gif|webp)$/i))) ? (
                                                    <Box
                                                      component="img"
                                                      src={`/api/files/view/${msg.attachmentUrl}`}
                                                      alt={msg.attachmentName}
                                                      sx={{ width: '100%', maxHeight: '180px', objectFit: 'cover', borderRadius: '4px', cursor: 'pointer' }}
                                                      onClick={() => window.open(`/api/files/view/${msg.attachmentUrl}`, '_blank')}
                                                    />
                                                  ) : (
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                      <IconFileText size={22} color={TEAMS_PURPLE} />
                                                      <Box>
                                                        <Typography variant="subtitle2" sx={{ fontWeight: 800, fontSize: '0.78rem' }}>{msg.attachmentName}</Typography>
                                                        <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.625rem' }}>{msg.attachmentType} File</Typography>
                                                      </Box>
                                                    </Box>
                                                  )}
                                                  <Button size="small" variant="text" href={`/api/files/view/${msg.attachmentUrl}`} target="_blank" sx={{ textTransform: 'none', fontSize: '0.7rem', color: TEAMS_PURPLE, p: 0 }}>
                                                    Open Document
                                                  </Button>
                                                </Box>
                                              )}

                                              {msg.messageType === 'VOICE' && (
                                                <audio controls src={`/api/files/view/${msg.attachmentUrl}`} style={{ minWidth: '180px', height: '36px' }} />
                                              )}

                                              {isSelf && (
                                                <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mt: 0.5, gap: 0.3, opacity: 0.7 }}>
                                                  <Typography variant="caption" sx={{ fontSize: '0.6rem', fontWeight: 600 }}>{msg.isSeen ? 'Read' : 'Sent'}</Typography>
                                                  {msg.isSeen ? <IconChecks size={12} color={TEAMS_PURPLE} /> : <IconCheck size={12} />}
                                                </Box>
                                              )}
                                            </Box>
                                          </Box>
                                        </Box>
                                      </Box>
                                    )}
                                  </Box>
                                );
                              })
                            )}

                            {smartReplies.length > 0 && (
                              <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap', useFlexGap: true }}>
                                {smartReplies.map((r, i) => (
                                  <Button
                                    key={i}
                                    variant="outlined"
                                    size="small"
                                    onClick={() => handleSendMessage(r)}
                                    startIcon={<IconSparkles size={12} />}
                                    sx={{
                                      borderRadius: '16px',
                                      textTransform: 'none',
                                      borderColor: alpha(TEAMS_PURPLE, 0.4),
                                      color: TEAMS_PURPLE,
                                      fontSize: '0.72rem',
                                      fontWeight: 700,
                                      bgcolor: theme.palette.mode === 'dark' ? '#292929' : '#fff',
                                      '&:hover': { bgcolor: alpha(TEAMS_PURPLE, 0.05), borderColor: TEAMS_PURPLE }
                                    }}
                                  >
                                    {r}
                                  </Button>
                                ))}
                              </Stack>
                            )}

                            <div ref={messageEndRef} />
                          </Box>

                          {/* Microsoft Teams styled solid rectangular input workspace */}
                          <Box sx={{ p: 1.5, bgcolor: theme.palette.mode === 'dark' ? '#201f1f' : '#f3f2f1', borderTop: `1px solid ${theme.palette.mode === 'dark' ? TEAMS_BORDER_DARK : TEAMS_BORDER_LIGHT}` }}>
                            <Box sx={{
                              border: `1.5px solid ${theme.palette.mode === 'dark' ? '#444' : '#e1dfdd'}`,
                              borderRadius: '4px',
                              bgcolor: theme.palette.mode === 'dark' ? '#292929' : '#ffffff',
                              p: 0.5
                            }}>
                              <TextField
                                fullWidth
                                multiline
                                maxRows={3}
                                size="small"
                                placeholder={isRecordingVoice ? `Recording voice message...` : `Start a new discussion`}
                                disabled={isRecordingVoice}
                                value={newMessage}
                                onChange={handleInputChange}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSendMessage();
                                  }
                                }}
                                variant="standard"
                                InputProps={{ disableUnderline: true }}
                                sx={{ px: 1.5, '& textarea': { fontSize: '0.85rem', color: 'text.primary', py: 0.5 } }}
                              />

                              {/* Teams styled format & attachment toolbar */}
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: `1px solid ${theme.palette.mode === 'dark' ? '#383838' : '#f0f0f0'}`, pt: 0.5, mt: 0.5 }}>
                                <Stack direction="row" spacing={0.5}>
                                  <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileChange} />
                                  <IconButton size="small" onClick={triggerFileUpload}><IconPaperclip size={18} /></IconButton>
                                  
                                  {/* Emoji Button */}
                                  <Box sx={{ position: 'relative', display: 'flex' }}>
                                    <IconButton size="small" onClick={() => setShowEmojiPicker(!showEmojiPicker)}><IconMoodSmile size={18} /></IconButton>
                                    {showEmojiPicker && (
                                      <Box sx={{ position: 'absolute', bottom: '100%', left: 0, mb: 1, zIndex: 11000 }}>
                                        <EmojiPicker theme="dark" onEmojiClick={(emojiData) => { setNewMessage(prev => prev + emojiData.emoji); setShowEmojiPicker(false); }} width={280} height={350} />
                                      </Box>
                                    )}
                                  </Box>

                                  <IconButton size="small" onClick={handleVoiceToggle} color={isRecordingVoice ? 'error' : 'default'}><IconMicrophone size={18} /></IconButton>
                                </Stack>

                                <IconButton
                                  size="small"
                                  onClick={() => handleSendMessage()}
                                  disabled={newMessage.trim() === ''}
                                  sx={{ color: TEAMS_PURPLE, '&.Mui-disabled': { color: 'text.disabled' } }}
                                >
                                  <IconSend size={18} />
                                </IconButton>
                              </Box>
                            </Box>
                          </Box>
                        </Box>
                      )}

                      {/* ── TAB 2 CONTENT: SHARED FILES PANEL ── */}
                      {activeChannelTab === 'files' && (
                        <Box sx={{ flexGrow: 1, p: 3, overflowY: 'auto', bgcolor: theme.palette.mode === 'dark' ? '#1a1a1a' : '#FAF9F8' }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <IconFiles size={18} /> Files shared in this workspace
                          </Typography>
                          {filesList.length === 0 ? (
                            <Typography variant="body2" sx={{ textAlign: 'center', mt: 4, color: 'text.secondary' }}>No files shared yet.</Typography>
                          ) : (
                            <List sx={{ p: 0 }}>
                              {filesList.map((f, i) => (
                                <ListItem key={i} sx={{ border: `1px solid ${theme.palette.mode === 'dark' ? '#333' : '#e1dfdd'}`, borderRadius: '4px', mb: 1.5, bgcolor: 'background.paper' }}>
                                  <ListItemAvatar>
                                    <Avatar sx={{ bgcolor: alpha(TEAMS_PURPLE, 0.1), color: TEAMS_PURPLE }}><IconFileText size={18} /></Avatar>
                                  </ListItemAvatar>
                                  <ListItemText
                                    primary={f.attachmentName}
                                    secondary={`${f.attachmentType} • ${new Date(f.createdAt).toLocaleDateString()}`}
                                    primaryTypographyProps={{ fontSize: '0.78rem', fontWeight: 800 }}
                                    secondaryTypographyProps={{ fontSize: '0.675rem' }}
                                  />
                                  <Button size="small" href={`/api/files/view/${f.attachmentUrl}`} target="_blank" sx={{ textTransform: 'none', fontSize: '0.7rem', color: TEAMS_PURPLE }}>View File</Button>
                                </ListItem>
                              ))}
                            </List>
                          )}
                        </Box>
                      )}

                      {/* ── TAB 3 CONTENT: COPILOT AI THREAD SUMMARY ── */}
                      {activeChannelTab === 'summary' && (
                        <Box sx={{ flexGrow: 1, p: 3, overflowY: 'auto', bgcolor: theme.palette.mode === 'dark' ? '#1a1a1a' : '#FAF9F8' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                            <IconSparkles size={20} color={TEAMS_PURPLE} />
                            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: TEAMS_PURPLE }}>Microsoft Copilot Discussions Summary</Typography>
                          </Box>
                          
                          {isLoadingSummary ? (
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center', mt: 4 }}>
                              <CircularProgress size={30} sx={{ color: TEAMS_PURPLE }} />
                              <Typography variant="caption" sx={{ color: 'text.secondary' }}>Synthesizing thread transcripts...</Typography>
                            </Box>
                          ) : (
                            <Box sx={{
                              p: 2.5,
                              borderRadius: '6px',
                              bgcolor: 'background.paper',
                              border: `1px solid ${theme.palette.mode === 'dark' ? '#333' : '#e1dfdd'}`,
                              lineHeight: 1.6,
                              fontSize: '0.825rem',
                              whiteSpace: 'pre-line'
                            }}>
                              {aiSummary || "Select a chat, start posting some messages, and click this tab to let Copilot summarize the discussion points instantly!"}
                            </Box>
                          )}
                        </Box>
                      )}
                    </Box>
                  )}
                </Box>
              </Box>
            </Box>
          </Grow>
        )}
      </AnimatePresence>

      {/* 🔔 Microsoft Teams styled Toast popup */}
      <AnimatePresence>
        {activeToast && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            onClick={() => {
              setIsOpen(true);
              if (activeToast.channel) {
                selectRoom(activeToast.channel);
              }
              setActiveToast(null);
            }}
            style={{
              position: 'fixed',
              top: 24,
              right: 24,
              zIndex: 11000,
              cursor: 'pointer',
              width: '320px',
              borderRadius: '6px',
              padding: '14px',
              background: theme.palette.mode === 'dark' ? '#201F1F' : '#ffffff',
              borderLeft: `5px solid ${TEAMS_PURPLE}`,
              boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}
          >
            <Avatar src={activeToast.channel?.lastMessage?.senderId ? getUserImageUrl(activeToast.channel.lastMessage.senderId) : undefined} sx={{ bgcolor: TEAMS_PURPLE, width: 36, height: 36 }}>
              {activeToast.senderName.charAt(0).toUpperCase()}
            </Avatar>
            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, fontSize: '0.78rem', color: theme.palette.mode === 'dark' ? '#fff' : '#111' }}>
                {activeToast.senderName}
              </Typography>
              <Typography variant="caption" noWrap sx={{ color: 'text.secondary', display: 'block', fontSize: '0.7rem', mt: 0.1 }}>
                {activeToast.messageContent}
              </Typography>
            </Box>
            <IconButton size="small" onClick={(e) => { e.stopPropagation(); setActiveToast(null); }} sx={{ color: 'text.disabled' }}>
              <IconX size={14} />
            </IconButton>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
