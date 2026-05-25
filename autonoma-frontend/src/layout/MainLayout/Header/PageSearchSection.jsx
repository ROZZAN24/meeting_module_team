import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import {
  Autocomplete,
  TextField,
  InputAdornment,
  IconButton,
  Tooltip,
  Box,
  Typography
} from '@mui/material';
import { IconSearch, IconX, IconMicrophone } from '@tabler/icons-react';
import { useDispatch } from 'react-redux';
import { openSnackbar } from 'store/slices/snackbar';
import menuItem from 'menu-items';

// Traverse the menu structure to collect all leaf items that have a URL
const getAllPages = (items) => {
  const pages = [];
  const traverse = (node) => {
    if (node.type === 'item' && node.url) {
      pages.push({
        title: node.title,
        url: node.url,
        pageCode: node.pageCode || '',
        id: node.id
      });
    }
    if (node.children) {
      node.children.forEach(traverse);
    }
  };
  items.forEach(traverse);
  return pages;
};

// Clean voice transcription results (strip leading/trailing punctuation and quotes)
const cleanSpeechTranscript = (text) => {
  if (!text) return '';
  return text
    .replace(/^[.,\/#!$%\^&\*;:{}=\-_`~()?"']+|[.,\/#!$%\^&\*;:{}=\-_`~()?"']+$/g, '')
    .trim();
};

export default function PageSearchSection() {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [inputValue, setInputValue] = useState('');
  const [selectedPage, setSelectedPage] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);
  const [isFocused, setIsFocused] = useState(false);
  const autocompleteRef = useRef(null);

  // Flattened pages list
  const pages = useMemo(() => getAllPages(menuItem.items), []);

  // Filter options based on both code and text
  const filterOptions = (options, { inputValue }) => {
    const query = (inputValue || '').trim();
    if (!query) return options;

    const lowerQuery = query.toLowerCase();
    const alphaNumQuery = lowerQuery.replace(/[^a-z0-9]/g, '');

    return options.filter((opt) => {
      const title = (opt.title || '').toLowerCase();
      const code = (opt.pageCode || '').toLowerCase();

      // Standard matching
      if (title.includes(lowerQuery) || code.includes(lowerQuery)) {
        return true;
      }

      // Alphanumeric fallback matching (handles punctuation/spaces from speech recognition)
      if (alphaNumQuery) {
        const alphaNumTitle = title.replace(/[^a-z0-9]/g, '');
        const alphaNumCode = code.replace(/[^a-z0-9]/g, '');
        return alphaNumTitle.includes(alphaNumQuery) || alphaNumCode.includes(alphaNumQuery);
      }

      return false;
    });
  };

  // Handle page selection
  const handlePageSelect = (event, page) => {
    if (page && page.url) {
      navigate(page.url);
      // Immediately reset search state after redirection
      setSelectedPage(null);
      setInputValue('');
    }
  };

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recog = new SpeechRecognition();
    recog.continuous = false;
    recog.interimResults = false;
    recog.lang = 'en-US';

    recog.onstart = () => setIsListening(true);

    recog.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      if (transcript) {
        const cleaned = cleanSpeechTranscript(transcript);
        setInputValue(cleaned);
        setIsFocused(true);
        if (autocompleteRef.current) {
          const inputNode = autocompleteRef.current.querySelector('input');
          if (inputNode) inputNode.focus();
        }
      }
      setIsListening(false);
    };

    recog.onerror = (event) => {
      console.error('Page search mic error', event.error);
      setIsListening(false);

      let errorMsg = 'Error during voice recognition. Please try again.';
      if (event.error === 'not-allowed') {
        errorMsg = 'Microphone permission denied. Please allow microphone access in your browser address bar/settings.';
      } else if (event.error === 'no-speech') {
        errorMsg = 'No speech detected. Please speak clearly into the microphone.';
      } else if (event.error === 'network') {
        errorMsg = 'Network error. Speech recognition requires an active internet connection.';
      } else if (event.error === 'audio-capture') {
        errorMsg = 'No microphone detected. Please connect a mic and try again.';
      }

      dispatch(
        openSnackbar({
          open: true,
          message: errorMsg,
          variant: 'alert',
          alert: { variant: 'filled' },
          severity: event.error === 'no-speech' ? 'info' : 'error',
          close: false
        })
      );
    };

    recog.onend = () => setIsListening(false);

    recognitionRef.current = recog;

    return () => {
      recog.onstart = null;
      recog.onresult = null;
      recog.onerror = null;
      recog.onend = null;
      try { recog.abort(); } catch (_) {}
      recognitionRef.current = null;
    };
  }, [dispatch]);

  const handleMicClick = useCallback((e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    const recog = recognitionRef.current;
    if (isListening) {
      if (recog) recog.stop();
    } else {
      if (recog) {
        try { recog.start(); } catch (err) { console.warn('Mic start error:', err); }
      } else {
        dispatch(
          openSnackbar({
            open: true,
            message: 'Speech Recognition is not supported by your browser.',
            variant: 'alert',
            alert: { variant: 'filled' },
            severity: 'warning',
            close: false
          })
        );
      }
    }
  }, [isListening, dispatch]);

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: isFocused ? 280 : 180,
        transition: 'all 0.3s ease-in-out',
        ml: 1
      }}
      ref={autocompleteRef}
    >
      <Autocomplete
        options={pages}
        value={selectedPage}
        onChange={handlePageSelect}
        inputValue={inputValue}
        onInputChange={(event, newInputValue) => {
          setInputValue(newInputValue);
        }}
        filterOptions={filterOptions}
        getOptionLabel={(option) => {
          if (typeof option === 'string') return option;
          return `${option.title}${option.pageCode ? ` (${option.pageCode})` : ''}`;
        }}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        size="small"
        freeSolo
        blurOnSelect
        clearOnBlur
        renderOption={(props, option) => {
          // Destructure key out of props to avoid console warnings, passing remaining props
          const { key, ...optionProps } = props;
          return (
            <Box
              component="li"
              key={option.id}
              {...optionProps}
              sx={{
                px: 1.5,
                py: 0.8,
                borderRadius: '6px',
                my: 0.2,
                mx: 0.5,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {option.title}
              </Typography>
              {option.pageCode && (
                <Typography
                  variant="caption"
                  sx={{
                    bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
                    color: 'primary.main',
                    px: 0.75,
                    py: 0.25,
                    borderRadius: '4px',
                    fontWeight: 700,
                    fontSize: '0.6875rem'
                  }}
                >
                  {option.pageCode}
                </Typography>
              )}
            </Box>
          );
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder={isListening ? 'Listening...' : 'Search page / code...'}
            variant="outlined"
            sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)'),
                borderRadius: 2,
                pr: '8px !important',
                pl: '12px !important',
                '&:hover': {
                  bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)')
                },
                '&.Mui-focused': {
                  bgcolor: 'background.paper',
                  boxShadow: (theme) => `0 4px 12px ${theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.1)'}`,
                  borderColor: 'primary.main'
                }
              },
              '& .MuiOutlinedInput-notchedOutline': { border: 'none' }
            }}
            InputProps={{
              ...params.InputProps,
              startAdornment: (
                <InputAdornment position="start" sx={{ mr: 0.5 }}>
                  <IconSearch stroke={1.5} size="16px" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  {inputValue && (
                    <IconButton
                      size="small"
                      onClick={() => setInputValue('')}
                      sx={{ p: 0.25, mr: 0.25 }}
                    >
                      <IconX stroke={1.5} size="14px" />
                    </IconButton>
                  )}
                  <Tooltip title="Voice Search Page" placement="top" arrow>
                    <IconButton
                      size="small"
                      onClick={handleMicClick}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                      }}
                      onPointerDown={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                      }}
                      onTouchStart={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                      }}
                      sx={{
                        p: 0.25,
                        color: isListening ? 'error.main' : 'text.secondary',
                        animation: isListening ? 'pagePulse 1.5s infinite ease-in-out' : 'none',
                        '@keyframes pagePulse': {
                          '0%': { opacity: 0.6 },
                          '50%': { opacity: 1 },
                          '100%': { opacity: 0.6 }
                        },
                        '&:hover': { color: 'primary.main' }
                      }}
                    >
                      <IconMicrophone stroke={1.5} size="16px" />
                    </IconButton>
                  </Tooltip>
                </InputAdornment>
              )
            }}
          />
        )}
      />
    </Box>
  );
}
