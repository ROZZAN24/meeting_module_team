import PropTypes from 'prop-types';
import React, { useState, useRef, useEffect } from 'react';

import Card from '@mui/material/Card';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Link from '@mui/material/Link';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import GlobalStyles from '@mui/material/GlobalStyles';
import Popover from '@mui/material/Popover';
import Paper from '@mui/material/Paper';
import Tooltip from '@mui/material/Tooltip';

import DoneAllTwoToneIcon from '@mui/icons-material/DoneAllTwoTone';
import DoneTwoToneIcon from '@mui/icons-material/DoneTwoTone';
import ReplyTwoToneIcon from '@mui/icons-material/ReplyTwoTone';
import ForwardToInboxTwoToneIcon from '@mui/icons-material/ForwardToInboxTwoTone';
import CheckBoxTwoToneIcon from '@mui/icons-material/CheckBoxTwoTone';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import InsertEmoticonTwoToneIcon from '@mui/icons-material/InsertEmoticonTwoTone';
import ContentCopyTwoToneIcon from '@mui/icons-material/ContentCopyTwoTone';
import DeleteTwoToneIcon from '@mui/icons-material/DeleteTwoTone';
import PlayArrowTwoToneIcon from '@mui/icons-material/PlayArrowTwoTone';
import PauseTwoToneIcon from '@mui/icons-material/PauseTwoTone';
import MicTwoToneIcon from '@mui/icons-material/MicTwoTone';
import PersonIcon from '@mui/icons-material/Person';
import Slider from '@mui/material/Slider';
import Avatar from '@mui/material/Avatar';
import PushPinTwoToneIcon from '@mui/icons-material/PushPinTwoTone';
import StarBorderTwoToneIcon from '@mui/icons-material/StarBorderTwoTone';

const CustomAudioPlayer = ({ src, isSent }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    const updateProgress = () => {
      setProgress((audio.currentTime / audio.duration) * 100 || 0);
    };
    
    const setAudioData = () => {
      setDuration(audio.duration);
      if (audio.currentTime > 0) updateProgress();
    };
    
    const onEnded = () => {
      setIsPlaying(false);
      setProgress(0);
    };

    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('loadedmetadata', setAudioData);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateProgress);
      audio.removeEventListener('loadedmetadata', setAudioData);
      audio.removeEventListener('ended', onEnded);
    };
  }, []);

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSliderChange = (event, newValue) => {
    const newTime = (newValue / 100) * duration;
    audioRef.current.currentTime = newTime;
    setProgress(newValue);
  };

  const formatTime = (seconds) => {
    if (isNaN(seconds)) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const waveform = [...Array(35)].map((_, i) => (
    <Box 
      key={i} 
      sx={{ 
        width: 3, 
        height: `${Math.random() * 60 + 20}%`, 
        bgcolor: progress > (i/35)*100 ? '#2db4e5' : '#cbd2d9', 
        borderRadius: '2px',
        transition: 'background-color 0.1s'
      }} 
    />
  ));

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', width: 280, gap: 1 }}>
      <audio ref={audioRef} src={src} preload="metadata" />
      
      <IconButton onClick={togglePlay} size="small" sx={{ color: 'grey.700', p: 0.5, mr: 0.5 }}>
        {isPlaying ? <PauseTwoToneIcon fontSize="large" /> : <PlayArrowTwoToneIcon fontSize="large" />}
      </IconButton>
      
      <Box sx={{ flexGrow: 1, position: 'relative', height: 44, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', height: 24, gap: '2px', position: 'relative' }}>
          {waveform}
          <Slider
            value={progress}
            onChange={handleSliderChange}
            sx={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              p: 0,
              '& .MuiSlider-track': { display: 'none' },
              '& .MuiSlider-rail': { display: 'none' },
              '& .MuiSlider-thumb': {
                width: 12,
                height: 12,
                color: '#2db4e5',
                '&:hover, &.Mui-focusVisible, &.Mui-active': { boxShadow: 'none' },
              },
            }}
          />
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
          <Typography variant="caption" sx={{ fontSize: '0.65rem', color: 'text.secondary' }}>
            {formatTime((progress / 100) * duration)}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ position: 'relative', ml: 1 }}>
        <Avatar sx={{ bgcolor: 'grey.200', color: 'grey.600', width: 44, height: 44 }}>
          <PersonIcon />
        </Avatar>
        <Box sx={{ position: 'absolute', bottom: -2, left: -6 }}>
          <MicTwoToneIcon sx={{ fontSize: '1.2rem', color: '#2db4e5' }} />
        </Box>
      </Box>
    </Box>
  );
};

export default function ChartHistory({ data, theme, currentUserId, onReply, onForward, selectionMode, selectedMessages, onToggleSelect, reactions, onReact }) {
  const [contextMenu, setContextMenu] = useState(null);
  const [reactionAnchorEl, setReactionAnchorEl] = useState(null);
  const [activeMessage, setActiveMessage] = useState(null);
  
  if (!data || data.length === 0) return null;
  const apiUrl = import.meta.env.VITE_API_URL || window.location.origin;

  const handleContextMenu = (event, history) => {
    event.preventDefault();
    setContextMenu(
      contextMenu === null
        ? {
            mouseX: event.clientX - 2,
            mouseY: event.clientY - 4,
          }
        : null,
    );
    setActiveMessage(history);
  };

  const handleMenuClose = () => {
    setContextMenu(null);
    setActiveMessage(null);
  };

  const handleReactionClick = (event, history) => {
    setReactionAnchorEl(event.currentTarget);
    setActiveMessage(history);
  };

  const handleReactionClose = () => {
    setReactionAnchorEl(null);
  };

  const handleAction = (action, msg = activeMessage) => {
    if (msg) {
      if (action === 'reply' && onReply) onReply(msg);
      if (action === 'forward' && onForward) onForward(msg);
      if (action === 'select' && onToggleSelect) onToggleSelect(msg);
      if (action === 'copy' && msg.messageContent) {
        navigator.clipboard.writeText(msg.messageContent);
      }
    }
    handleMenuClose();
  };

  const handleEmojiSelect = (emoji) => {
    if (activeMessage && onReact) {
      onReact(activeMessage.id, emoji);
    }
    handleReactionClose();
  };

  const handleReplyClick = (replyId) => {
    const el = document.getElementById(`message-row-${replyId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.remove('highlight-flash');
      void el.offsetWidth;
      el.classList.add('highlight-flash');
    }
  };

  const isSelected = (history) => selectedMessages?.some(m => m.id === history.id);

  return (
    <Stack spacing={1} sx={{ p: 2 }}>
      <GlobalStyles styles={{
        '@keyframes highlightFlash': {
          '0%': { backgroundColor: 'rgba(45, 180, 229, 0.4)' },
          '100%': { backgroundColor: 'transparent' }
        },
        '.highlight-flash': {
          animation: 'highlightFlash 2s ease-out forwards',
          borderRadius: '8px'
        }
      }} />
      {data.map((history, index) => {
        const isSent = history.senderId === currentUserId;
        const selected = isSelected(history);

        return (
          <Box id={`message-row-${history.id}`} key={history.id || index} sx={{ display: 'flex', justifyContent: isSent ? 'flex-end' : 'flex-start', width: '100%', alignItems: 'center', mb: 1 }}>
            <Box 
              sx={{ position: 'relative', display: 'flex', '&:hover .chat-action-btn': { opacity: 1 }, width: '100%', justifyContent: isSent ? 'flex-end' : 'flex-start', alignItems: 'center' }}
              onClick={() => { if (selectionMode && onToggleSelect) onToggleSelect(history); }}
            >
              {isSent && !selectionMode && (
                <Stack direction="row" spacing={1} className="chat-action-btn" sx={{ opacity: (contextMenu && activeMessage?.id === history.id) || (reactionAnchorEl && activeMessage?.id === history.id) ? 1 : 0, transition: 'opacity 0.2s', mr: 1 }}>
                  <Tooltip title="Reply" placement="top">
                    <IconButton size="small" onClick={(e) => { e.stopPropagation(); setActiveMessage(history); handleAction('reply', history); }} sx={{ bgcolor: 'background.paper', boxShadow: 1, '&:hover': { bgcolor: 'grey.100' }, width: 32, height: 32 }}>
                      <ReplyTwoToneIcon sx={{ fontSize: '1.1rem', color: 'text.secondary' }} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Forward" placement="top">
                    <IconButton size="small" onClick={(e) => { e.stopPropagation(); setActiveMessage(history); handleAction('forward', history); }} sx={{ bgcolor: 'background.paper', boxShadow: 1, '&:hover': { bgcolor: 'grey.100' }, width: 32, height: 32 }}>
                      <ReplyTwoToneIcon sx={{ fontSize: '1.1rem', transform: 'scaleX(-1)', color: 'text.secondary' }} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="React" placement="top">
                    <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleReactionClick(e, history); }} sx={{ bgcolor: 'background.paper', boxShadow: 1, '&:hover': { bgcolor: 'grey.100' }, width: 32, height: 32 }}>
                      <InsertEmoticonTwoToneIcon sx={{ fontSize: '1.1rem', color: 'text.secondary' }} />
                    </IconButton>
                  </Tooltip>
                </Stack>
              )}

              <Card
                elevation={1}
                onContextMenu={(e) => handleContextMenu(e, history)}
                sx={{
                  display: 'inline-block',
                  maxWidth: '75%',
                  bgcolor: selected ? 'action.selected' : (isSent ? 'primary.light' : 'secondary.light'),
                  ...theme.applyStyles('dark', { bgcolor: selected ? 'action.selected' : (isSent ? 'grey.700' : 'dark.900') }),
                  borderRadius: isSent ? '12px 12px 0 12px' : '12px 12px 12px 0',
                  cursor: selectionMode ? 'pointer' : 'default',
                  border: selected ? `2px solid ${theme.palette.primary.main}` : '2px solid transparent',
                  position: 'relative'
                }}
              >
                {selected && (
                  <Box sx={{ position: 'absolute', top: 8, left: isSent ? 8 : 'auto', right: isSent ? 'auto' : 8, zIndex: 10, color: 'primary.main', bgcolor: 'background.paper', borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 1 }}>
                    <DoneTwoToneIcon sx={{ fontSize: '1rem' }} />
                  </Box>
                )}
                <Box sx={{ p: 1.5, px: 2, position: 'relative' }}>
                  {!isSent && history.senderName && (
                    <Typography variant="subtitle2" sx={{ mb: 0.5, color: 'secondary.main', fontWeight: 600 }}>
                      {history.senderName}
                    </Typography>
                  )}
                  
                  <Box sx={{ mb: 0.5, mr: 2 }}>
                    {(() => {
                      let text = history.messageContent || '';
                      let replyBlock = null;
                      let forwardedBlock = null;

                      // Parse Reply (Supports both new ID format and old format)
                      const replyMatch = text.match(/^\[REPLY_TO:(?:([^|]+)\|)?([^|]+)\|([^\]]+)\]\n([\s\S]*)/) || text.match(/^\[REPLY_TO:([^|]+)\|([^\]]+)\]\n([\s\S]*)/);
                      if (replyMatch) {
                        const hasId = replyMatch.length === 5 && replyMatch[4] !== undefined;
                        const replyId = hasId ? replyMatch[1] : null;
                        const replyName = hasId ? replyMatch[2] : replyMatch[1];
                        const replyMsg = hasId ? replyMatch[3] : replyMatch[2];
                        const restText = hasId ? replyMatch[4] : replyMatch[3];

                        replyBlock = (
                          <Box 
                            onClick={(e) => {
                              if (replyId) {
                                e.stopPropagation();
                                const el = document.getElementById(`message-row-${replyId}`);
                                if (el) {
                                  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                  el.classList.remove('highlight-flash');
                                  void el.offsetWidth; // trigger reflow
                                  el.classList.add('highlight-flash');
                                }
                              }
                            }}
                            sx={{ mb: 1, p: 1, pb: 1.5, bgcolor: isSent ? 'rgba(0,0,0,0.08)' : 'rgba(0,0,0,0.05)', borderRadius: '4px 8px 8px 4px', borderLeft: '4px solid #00a884', cursor: replyId ? 'pointer' : 'default' }}
                          >
                            <Typography variant="subtitle2" sx={{ color: '#00a884', fontWeight: 600, mb: 0.25 }}>{replyName}</Typography>
                            <Typography variant="caption" sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', color: isSent ? 'rgba(0,0,0,0.6)' : 'text.secondary', lineHeight: 1.2 }}>
                              {replyMsg}
                            </Typography>
                          </Box>
                        );
                        text = restText;
                      }

                      // Parse Forward
                      const forwardMatch = text.match(/^\[FORWARDED_FROM:([^\]]+)\]\n([\s\S]*)/);
                      if (forwardMatch) {
                        forwardedBlock = (
                          <Box sx={{ mb: 0.5, display: 'flex', alignItems: 'center', color: isSent ? 'rgba(0,0,0,0.5)' : 'text.secondary' }}>
                            <ForwardToInboxTwoToneIcon sx={{ fontSize: '0.9rem', mr: 0.5 }} />
                            <Typography variant="caption" sx={{ fontStyle: 'italic' }}>Forwarded</Typography>
                          </Box>
                        );
                        text = forwardMatch[2];
                      }

                      return (
                        <>
                          {forwardedBlock}
                          {replyBlock}
                          {history.messageType === 'VOICE' ? (
                            <CustomAudioPlayer src={`${apiUrl}/api/files/view?path=${encodeURIComponent(history.attachmentUrl)}`} isSent={isSent} />
                          ) : history.messageType === 'FILE' || history.messageType === 'IMAGE' ? (
                            history.attachmentType === 'IMAGE' ? (
                                <img src={`${apiUrl}/api/files/view?path=${encodeURIComponent(history.attachmentUrl)}`} alt={history.attachmentName} loading="lazy" style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '8px' }} />
                            ) : (
                                <Link href={`${apiUrl}/api/files/view?path=${encodeURIComponent(history.attachmentUrl)}`} target="_blank" underline="hover">
                                  📄 {history.attachmentName || 'Download Attachment'}
                                </Link>
                            )
                          ) : (
                            <Box sx={{ color: isSent ? 'dark.900' : 'text.primary', ...theme.applyStyles('dark', { color: 'grey.100' }), wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>
                              <Typography variant="body2">{text}</Typography>
                            </Box>
                          )}
                          
                          {(history.messageType === 'FILE' || history.messageType === 'IMAGE' || history.messageType === 'VOICE') && text.trim() ? (
                            <Typography variant="body2" sx={{ mt: 1, color: isSent ? 'dark.900' : 'text.primary', wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>{text}</Typography>
                          ) : null}
                        </>
                      );
                    })()}
                  </Box>
                  
                  <Stack direction="row" alignItems="center" justifyContent="flex-end" spacing={0.5} sx={{ mt: 0.5 }}>
                    <Typography align="right" variant="caption" sx={{ fontSize: '0.65rem', color: isSent ? 'grey.600' : 'grey.500', ...theme.applyStyles('dark', { color: 'grey.400' }) }}>
                      {new Date(history.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Typography>
                    {isSent && (
                      history.isSeen ? <DoneAllTwoToneIcon sx={{ fontSize: '0.8rem', color: 'primary.main' }} /> : <DoneTwoToneIcon sx={{ fontSize: '0.8rem', color: 'grey.500' }} />
                    )}
                  </Stack>
                </Box>
              </Card>

              {!isSent && !selectionMode && (
                <Stack direction="row" spacing={1} className="chat-action-btn" sx={{ opacity: (contextMenu && activeMessage?.id === history.id) || (reactionAnchorEl && activeMessage?.id === history.id) ? 1 : 0, transition: 'opacity 0.2s', ml: 1 }}>
                  <Tooltip title="React" placement="top">
                    <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleReactionClick(e, history); }} sx={{ bgcolor: 'background.paper', boxShadow: 1, '&:hover': { bgcolor: 'grey.100' }, width: 32, height: 32 }}>
                      <InsertEmoticonTwoToneIcon sx={{ fontSize: '1.1rem', color: 'text.secondary' }} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Reply" placement="top">
                    <IconButton size="small" onClick={(e) => { e.stopPropagation(); setActiveMessage(history); handleAction('reply', history); }} sx={{ bgcolor: 'background.paper', boxShadow: 1, '&:hover': { bgcolor: 'grey.100' }, width: 32, height: 32 }}>
                      <ReplyTwoToneIcon sx={{ fontSize: '1.1rem', color: 'text.secondary' }} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Forward" placement="top">
                    <IconButton size="small" onClick={(e) => { e.stopPropagation(); setActiveMessage(history); handleAction('forward', history); }} sx={{ bgcolor: 'background.paper', boxShadow: 1, '&:hover': { bgcolor: 'grey.100' }, width: 32, height: 32 }}>
                      <ReplyTwoToneIcon sx={{ fontSize: '1.1rem', transform: 'scaleX(-1)', color: 'text.secondary' }} />
                    </IconButton>
                  </Tooltip>
                </Stack>
              )}

              {/* Reaction Badges */}
              {reactions && reactions[history.id] && reactions[history.id].length > 0 && (
                <Box sx={{ position: 'absolute', bottom: -12, right: isSent ? 16 : 'auto', left: isSent ? 'auto' : 16, zIndex: 11 }}>
                  <Paper elevation={1} sx={{ display: 'flex', alignItems: 'center', px: 1, py: 0.25, borderRadius: '12px', bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
                    {reactions[history.id].map((r, idx) => (
                      <Typography key={idx} variant="caption" sx={{ fontSize: '0.85rem' }}>{r}</Typography>
                    ))}
                  </Paper>
                </Box>
              )}
            </Box>
          </Box>
        );
      })}
      
      <Menu
        open={contextMenu !== null}
        onClose={handleMenuClose}
        anchorReference="anchorPosition"
        anchorPosition={
          contextMenu !== null
            ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
            : undefined
        }
        PaperProps={{ sx: { minWidth: 160, borderRadius: '12px', boxShadow: 3 } }}
      >
        <MenuItem onClick={() => handleAction('reply')}>
          <ReplyTwoToneIcon sx={{ mr: 1, fontSize: '1.2rem', color: 'text.secondary' }} /> Reply
        </MenuItem>
        <MenuItem onClick={() => handleAction('copy')}>
          <ContentCopyTwoToneIcon sx={{ mr: 1, fontSize: '1.2rem', color: 'text.secondary' }} /> Copy
        </MenuItem>
        <MenuItem onClick={() => handleAction('forward')}>
          <ForwardToInboxTwoToneIcon sx={{ mr: 1, fontSize: '1.2rem', color: 'text.secondary' }} /> Forward
        </MenuItem>
        <MenuItem onClick={() => handleAction('pin')}>
          <PushPinTwoToneIcon sx={{ mr: 1, fontSize: '1.2rem', color: 'text.secondary' }} /> Pin
        </MenuItem>
        <MenuItem onClick={() => handleAction('star')}>
          <StarBorderTwoToneIcon sx={{ mr: 1, fontSize: '1.2rem', color: 'text.secondary' }} /> Star
        </MenuItem>
        <MenuItem onClick={() => handleAction('select')}>
          <CheckBoxTwoToneIcon sx={{ mr: 1, fontSize: '1.2rem', color: 'text.secondary' }} /> Select
        </MenuItem>
        <MenuItem onClick={() => handleAction('delete')} sx={{ color: 'error.main' }}>
          <DeleteTwoToneIcon sx={{ mr: 1, fontSize: '1.2rem' }} color="error" /> Delete
        </MenuItem>
      </Menu>
      
      <Popover
        open={Boolean(reactionAnchorEl)}
        anchorEl={reactionAnchorEl}
        onClose={handleReactionClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        transformOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        PaperProps={{ sx: { borderRadius: '24px', px: 1, py: 0.5, mb: 1, boxShadow: 3 } }}
      >
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          {['👍', '❤️', '😂', '😮', '😢', '🙏'].map(emoji => (
            <Typography 
              key={emoji} 
              variant="h5" 
              sx={{ cursor: 'pointer', transition: 'transform 0.1s', '&:hover': { transform: 'scale(1.2)' } }}
              onClick={() => handleEmojiSelect(emoji)}
            >
              {emoji}
            </Typography>
          ))}
          <IconButton size="small" onClick={() => handleEmojiSelect('+')}><Typography variant="h5">+</Typography></IconButton>
        </Stack>
      </Popover>
    </Stack>
  );
}

ChartHistory.propTypes = { data: PropTypes.array, theme: PropTypes.any, currentUserId: PropTypes.string, onReply: PropTypes.func, onForward: PropTypes.func, selectionMode: PropTypes.bool, selectedMessages: PropTypes.array, onToggleSelect: PropTypes.func, reactions: PropTypes.object, onReact: PropTypes.func };

