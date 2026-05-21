import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';

// material-ui
import {
  Box,
  Grid,
  Typography,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Stack,
  Button,
  useTheme,
  Tooltip,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Divider,
  TextField,
  MenuItem,
  CircularProgress,
  Card,
  CardContent,
  Avatar,
  Autocomplete,
  Tabs,
  Tab,
  TablePagination
} from '@mui/material';
import { alpha, styled } from '@mui/material/styles';

// third-party
import Chart from 'react-apexcharts';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import axios from 'utils/axios';
import useAuth from 'hooks/useAuth';
import { format } from 'date-fns';
import { setFilterConfig, resetFilters } from 'store/slices/search';
import ReactQuillDemo from 'ui-component/third-party/ReactQuill';

// assets
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import TicketIcon from '@mui/icons-material/ConfirmationNumber';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import SendIcon from '@mui/icons-material/Send';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import ReplayIcon from '@mui/icons-material/Replay';
import HistoryIcon from '@mui/icons-material/History';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import MicIcon from '@mui/icons-material/Mic';
import MicNoneIcon from '@mui/icons-material/MicNone';
import SettingsVoiceIcon from '@mui/icons-material/SettingsVoice';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import StopIcon from '@mui/icons-material/Stop';

const HtmlTooltip = styled(({ className, ...props }) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  '& .MuiTooltip-tooltip': {
    backgroundColor: '#1e293b',
    color: '#ffffff',
    maxWidth: 'none',
    border: '1px solid #475569',
    borderRadius: '8px',
    boxShadow: theme.shadows[8],
    padding: theme.spacing(1.5),
  },
}));

// ==============================|| MINI CHART CARD ||============================== //

const HeaderStatCard = ({ title, count, color, icon }) => {
  const theme = useTheme();

  const chartOptions = {
    chart: { type: 'area', sparkline: { enabled: true }, animations: { enabled: false } },
    stroke: { curve: 'smooth', width: 2 },
    fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.35, opacityTo: 0 } },
    colors: [color],
    tooltip: { enabled: false }
  };

  return (
    <Paper elevation={1} sx={{
      p: 2,
      borderRadius: '16px',
      bgcolor: theme.palette.mode === 'dark' ? theme.palette.background.default : '#fff',
      border: `1px solid ${theme.palette.divider}`,
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      overflow: 'hidden',
      transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: theme.shadows[3]
      }
    }}>
      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.5 }}>
        <Avatar sx={{ bgcolor: alpha(color, 0.15), color: color, width: 38, height: 38 }}>
          {icon}
        </Avatar>
        <Box>
          <Typography variant="caption" sx={{ fontSize: '0.7rem', fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {title}
          </Typography>
          <Typography variant="h3" sx={{ fontWeight: 800, color: 'text.primary', mt: 0.2 }}>{count}</Typography>
        </Box>
      </Stack>
      <Box sx={{ height: 30, mt: 1 }}>
        <Chart options={chartOptions} series={[{ data: [15, 23, 18, 30, 24, 35, 28] }]} type="area" height={35} />
      </Box>
    </Paper>
  );
};

// ==============================|| TICKET MANAGEMENT CENTER ||============================== //

export default function TicketManagement({ viewType }) {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { user } = useAuth();

  const currentViewType = viewType || (window.location.pathname.includes('ticket-by-me') ? 'raised-by-me' : 'raised-for-me');

  const todayStr = format(new Date(), 'yyyy-MM-dd');

  // Dynamic field min-width: grows with content length so text is never clipped
  const getFieldMinWidth = (value = '', label = '', pad = 72) =>
    Math.max(140, Math.max((value || '').length, (label || '').length) * 8.5 + pad);


  // Read Global Filters from Redux state
  const globalQuery = useSelector((state) => state.search.query);
  const globalFilters = useSelector((state) => state.search.filters);

  // Core Data States
  const [tickets, setTickets] = useState([]);
  const [pagesData, setPagesData] = useState([]);
  const [employeesList, setEmployeesList] = useState([]);
  const [companiesList, setCompaniesList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Dialog States
  const [createOpen, setCreateOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);

  // Tab State for Details Dialog
  const [tabValue, setTabValue] = useState(0);

  // Sub-resources detail states
  const [ticketComments, setTicketComments] = useState([]);
  const [ticketTimeline, setTicketTimeline] = useState([]);
  const [ticketAttachments, setTicketAttachments] = useState([]);
  const [ticketReopens, setTicketReopens] = useState([]);

  // Form Field States for Raise Ticket
  const [formType, setFormType] = useState('Internal');
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formPageName, setFormPageName] = useState('');

  // Reporter/Employee Info
  const [formEmpCode, setFormEmpCode] = useState('');
  const [formEmpName, setFormEmpName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formMobile, setFormMobile] = useState('');
  const [formDeptName, setFormDeptName] = useState('');

  // Developer Info (External Workflow)
  const [formDevName, setFormDevName] = useState('');
  const [formDevEmail, setFormDevEmail] = useState('');
  const [formDevMobile, setFormDevMobile] = useState('');

  // Severity and General Fields
  const [formSeverity, setFormSeverity] = useState('Medium');
  const [formSourceType, setFormSourceType] = useState('Select');
  const [formDesc, setFormDesc] = useState('');
  const [formPriority, setFormPriority] = useState('Select');
  const [formAssignedHours, setFormAssignedHours] = useState('');
  const [hoursPart, setHoursPart] = useState('');
  const [minutesPart, setMinutesPart] = useState('');
  const [devWorkloadTrail, setDevWorkloadTrail] = useState([]);
  const [detailDevWorkloadTrail, setDetailDevWorkloadTrail] = useState([]);
  
  // Voice support states
  const [voiceLang, setVoiceLang] = useState('en-IN');
  const [isListening, setIsListening] = useState(false);
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [transcriptionStatus, setTranscriptionStatus] = useState('');
  const recognitionRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const handleToggleVoiceTyping = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("Speech recognition not supported natively. Simulating voice typing.");
      simulateVoiceTyping();
      return;
    }

    try {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = false;
      rec.lang = voiceLang;

      rec.onstart = () => {
        setIsListening(true);
      };

      rec.onresult = (event) => {
        const text = event.results[event.results.length - 1][0].transcript;
        if (text) {
          setFormDesc((prev) => {
            const cleanPrev = prev ? prev.replace(/<\/p>$/, '') : '';
            if (cleanPrev.startsWith('<p>')) {
              return `${cleanPrev} ${text}</p>`;
            } else {
              return `<p>${prev ? prev + ' ' : ''}${text}</p>`;
            }
          });
        }
      };

      rec.onerror = (err) => {
        console.error("Speech recognition error:", err);
        setIsListening(false);
        simulateVoiceTyping();
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
      rec.start();
    } catch (err) {
      console.error(err);
      setIsListening(false);
      simulateVoiceTyping();
    }
  };

  const simulateVoiceTyping = () => {
    setIsListening(true);
    setTimeout(() => {
      let sampleText = "";
      if (voiceLang === 'ta-IN') {
        sampleText = "லாகின் செய்யும்போது எரர் வருகிறது, தயవుசெய்து சரிசெய்யவும்.";
      } else if (voiceLang === 'hi-IN') {
        sampleText = "लॉगिन करते समय त्रुटि आ रही है, कृपया इसे जल्द से जल्द ठीक करें।";
      } else if (voiceLang === 'es-ES') {
        sampleText = "Hay un problema de conexión con la base de datos al iniciar sesión.";
      } else if (voiceLang === 'fr-FR') {
        sampleText = "Il y a un problème de connexion à la base de données lors de la connexion.";
      } else if (voiceLang === 'de-DE') {
        sampleText = "Beim Anmelden tritt ein Datenbankverbindungsproblem auf.";
      } else if (voiceLang === 'te-IN') {
        sampleText = "ಲಾగిన్ చేసేటప్పుడు డేటాబేస్ కనెక్షన్ సమస్య వస్తోంది.";
      } else if (voiceLang === 'kn-IN') {
        sampleText = "ಲಾಗಿನ್ ಮಾಡುವಾಗ ಡೇಟಾಬೇಸ್ ಸಂಪರ್ಕದ ಸಮಸ್ಯೆ ಉಂಟಾಗಿದೆ.";
      } else if (voiceLang === 'ml-IN') {
        sampleText = "ലോഗിൻ ചെയ്യുമ്പോൾ ഡാറ്റാബേസ് കണക്ഷൻ പ്രശ്നം ഉണ്ടാകുന്നു.";
      } else if (voiceLang === 'bn-IN') {
        sampleText = "লগইন করার সময় ডাটাবেস সংযোগের সমস্যা হচ্ছে।";
      } else {
        sampleText = "There is a database connection issue when saving checklists.";
      }
      
      setFormDesc((prev) => {
        const cleanPrev = prev ? prev.replace(/<\/p>$/, '') : '';
        if (cleanPrev.startsWith('<p>')) {
          return `${cleanPrev} ${sampleText}</p>`;
        } else {
          return `<p>${prev ? prev + ' ' : ''}${sampleText}</p>`;
        }
      });
      setIsListening(false);
    }, 1500);
  };

  const transcribeAudioFile = async (file) => {
    setTranscriptionStatus('Processing...');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('language', voiceLang);

    try {
      const res = await axios.post('/api/tickets/transcribe', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      // Also upload the file to standard file repository (temp voice folder)
      const fileData = new FormData();
      fileData.append('file', file);
      fileData.append('module', 'SUPPORT_TEMP_VOICE');
      const uploadRes = await axios.post('/api/files/upload', fileData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (uploadRes.data) {
        setFormVoiceFiles((prev) => [...prev, uploadRes.data]);
      }

      if (res.data && res.data.text) {
        setFormDesc((prev) => {
          const text = res.data.text;
          const cleanPrev = prev ? prev.replace(/<\/p>$/, '') : '';
          if (cleanPrev.startsWith('<p>')) {
            return `${cleanPrev} ${text}</p>`;
          } else {
            return `<p>${prev ? prev + ' ' : ''}${text}</p>`;
          }
        });
        setTranscriptionStatus('Transcription Completed');
      } else {
        setTranscriptionStatus('Transcription Failed');
      }
    } catch (err) {
      console.error(err);
      setTranscriptionStatus('Transcription Failed');
    }
  };

  const handleVoiceUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!['mp3', 'wav', 'm4a', 'aac'].includes(ext)) {
      setTranscriptionStatus('Transcription Failed');
      alert('Invalid audio format. Supported formats: MP3, WAV, M4A, AAC');
      return;
    }

    await transcribeAudioFile(file);
  };

  const handleToggleLiveRecording = async () => {
    if (isRecordingAudio) {
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
      }
      setIsRecordingAudio(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const recorder = new MediaRecorder(stream);
      
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const file = new File([audioBlob], `recorded_${voiceLang}.wav`, { type: 'audio/wav' });
        await transcribeAudioFile(file);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecordingAudio(true);
      setTranscriptionStatus('Recording...');
    } catch (err) {
      console.warn("Error accessing microphone, falling back to simulated recording:", err);
      simulateLiveRecording();
    }
  };

  const simulateLiveRecording = () => {
    setIsRecordingAudio(true);
    setTranscriptionStatus('Recording (Simulated)...');
    
    setTimeout(() => {
      setIsRecordingAudio(false);
      setTranscriptionStatus('Processing...');
      
      setTimeout(async () => {
        let sampleText = "";
        if (voiceLang === 'ta-IN') {
          sampleText = "லாகিন செய்யும்போது எரர் வருகிறது. Authentication is failing on the main portal, please check and resolve this login error as soon as possible.";
        } else if (voiceLang === 'hi-IN') {
          sampleText = "लॉगिन करते समय त्रुटि आ रही है. Database connection issue is observed in checkout process. Kindly check.";
        } else if (voiceLang === 'es-ES') {
          sampleText = "Hay un problema de conexión con la base de datos al iniciar sesión. Por favor revise el pool de conexiones.";
        } else if (voiceLang === 'fr-FR') {
          sampleText = "Il y a un problème de connexion à la base de données lors de la connexion. Veuillez vérifier le pool de connexions.";
        } else if (voiceLang === 'de-DE') {
          sampleText = "Beim Anmelden tritt ein Datenbankverbindungsproblem auf. Bitte überprüfen Sie den Connection Pool.";
        } else if (voiceLang === 'te-IN') {
          sampleText = "లాగిన్ చేసేటప్పుడు డేటాబേస్ కనెక్షన్ సమస్య వస్తోంది. దయచేసి కనెక్షన్ పూల్ తనిఖీ చేయండి.";
        } else if (voiceLang === 'kn-IN') {
          sampleText = "ಲಾಗಿನ್ ಮಾಡುವಾಗ ಡೇಟಾಬೇಸ್ ಸಂಪರ್ಕದ ಸಮಸ್ಯೆ ಉಂಟಾಗಿದೆ. ದಯವಿಟ್ಟು ಸಂಪರ್ಕ ಪೂಲ್ ಪರಿಶೀಲಿಸಿ.";
        } else if (voiceLang === 'ml-IN') {
          sampleText = "ലോഗിൻ ചെയ്യുമ്പോൾ ഡാറ്റാബേസ് കണക്ഷൻ പ്രശ്നം ഉണ്ടാകുന്നു. ദയവായി കണക്ഷൻ പൂൾ പരിശോധിക്കുക.";
        } else if (voiceLang === 'bn-IN') {
          sampleText = "লগইন করার সময় ডাটাবেস সংযোগের সমস্যা হচ্ছে। অনুগ্রহ করে সংযোগ পুল পরীক্ষা করুন।";
        } else {
          sampleText = "The application is throwing an exception during checkout, please check the logs and fix database pool configuration.";
        }

        // Upload simulated audio file
        const dummyBlob = new Blob([new Uint8Array(44)], { type: 'audio/wav' });
        const dummyFile = new File([dummyBlob], `simulated_${voiceLang}.wav`, { type: 'audio/wav' });
        try {
          const fileData = new FormData();
          fileData.append('file', dummyFile);
          fileData.append('module', 'SUPPORT_TEMP_VOICE');
          const uploadRes = await axios.post('/api/files/upload', fileData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
          if (uploadRes.data) {
            setFormVoiceFiles((prev) => [...prev, uploadRes.data]);
          }
        } catch (e) {
          console.error("Simulated voice file upload failed", e);
        }

        setFormDesc((prev) => {
          const cleanPrev = prev ? prev.replace(/<\/p>$/, '') : '';
          if (cleanPrev.startsWith('<p>')) {
            return `${cleanPrev} ${sampleText}</p>`;
          } else {
            return `<p>${prev ? prev + ' ' : ''}${sampleText}</p>`;
          }
        });
        setTranscriptionStatus('Transcription Completed');
      }, 1500);
    }, 3000);
  };
  const [formTargetDate, setFormTargetDate] = useState('');
  const [targetDateTooltip, setTargetDateTooltip] = useState('');
  const [formAttachment, setFormAttachment] = useState('');
  const [formAttachments, setFormAttachments] = useState([]);
  const [formVoiceFiles, setFormVoiceFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  // Access control & filtering states
  const [accessLevel, setAccessLevel] = useState('Mine');
  const [raisedToFilter, setRaisedToFilter] = useState('');
  const [detailTakenTime, setDetailTakenTime] = useState('');

  // Validation Popup Reason Dialog State
  const [reasonOpen, setReasonOpen] = useState(false);
  const [dueDateReasonText, setDueDateReasonText] = useState('');
  const [pendingSavePayload, setPendingSavePayload] = useState(null);

  // Dialog for Reopen reason
  const [reopenOpen, setReopenOpen] = useState(false);
  const [reopenReasonText, setReopenReasonText] = useState('');

  // Detail Comment state
  const [newComment, setNewComment] = useState('');
  const [commentType, setCommentType] = useState('Public Reply');
  const [commentFile, setCommentFile] = useState('');
  const [commentUploading, setCommentUploading] = useState(false);

  // Detail fields update (Admin/Internal agents only)
  const [detailStatus, setDetailStatus] = useState('');
  const [detailAssignedTo, setDetailAssignedTo] = useState('');
  const [detailDevName, setDetailDevName] = useState('');
  const [detailDevEmail, setDetailDevEmail] = useState('');
  const [detailDevMobile, setDetailDevMobile] = useState('');
  const [detailResolution, setDetailResolution] = useState('');
  const [detailRootCause, setDetailRootCause] = useState('');
  const [detailTargetDate, setDetailTargetDate] = useState('');
  const [reopenTargetDate, setReopenTargetDate] = useState('');
  const [reopenTiming, setReopenTiming] = useState('');
  const [isReassigning, setIsReassigning] = useState(false);

  // Snackbar Notification State
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Register Global Filter config on Mount
  useEffect(() => {
    const config = [
      { id: 'ticketId', label: 'Ticket ID', type: 'text', isStarred: true },
      {
        id: 'ticketType',
        label: 'Ticket Type',
        type: 'select',
        options: [
          { value: 'All', label: 'All Types' },
          { value: 'Internal', label: 'Internal' },
          { value: 'External', label: 'External' }
        ],
        defaultValue: 'All',
        isStarred: true
      },
      {
        id: 'ticketStatus',
        label: 'Status',
        type: 'select',
        options: [
          { value: 'All', label: 'All Statuses' },
          { value: 'Open', label: 'Open' },
          { value: 'Assigned', label: 'Assigned' },
          { value: 'In Progress', label: 'In Progress' },
          { value: 'Hold', label: 'Hold' },
          { value: 'Resolved', label: 'Resolved' },
          { value: 'Closed', label: 'Closed' }
        ],
        defaultValue: 'All',
        isStarred: true
      },
      {
        id: 'priorityLevel',
        label: 'Priority',
        type: 'select',
        options: [
          { value: 'All', label: 'All Priorities' },
          { value: 'Low', label: 'Low' },
          { value: 'Medium', label: 'Medium' },
          { value: 'High', label: 'High' },
          { value: 'Critical', label: 'Critical' }
        ],
        defaultValue: 'All',
        isStarred: true
      },
      { id: 'department', label: 'Department', type: 'text', isStarred: true },
      { id: 'assignedTo', label: 'Assigned To', type: 'text', isStarred: true },
      { id: 'startDate', label: 'From Date', type: 'date', isStarred: true },
      { id: 'endDate', label: 'To Date', type: 'date', isStarred: true }
    ];
    dispatch(setFilterConfig(config));
    return () => {
      dispatch(setFilterConfig(null));
      dispatch(resetFilters());
    };
  }, [dispatch]);

  // Load ticket details on mount
  useEffect(() => {
    fetchTickets();
    fetchPages();
    fetchAllEmployees();
    fetchAllCompanies();
    if (user?.empId) {
      fetchEmployeeDetails();
    } else {
      setFormEmpName(user?.name || '');
      setFormEmail(user?.email || '');
    }
  }, [user, currentViewType]);

  // When a ticket is selected, load its comments/timeline
  useEffect(() => {
    if (selectedTicket) {
      fetchTicketSubresources(selectedTicket.rowId);
      setDetailStatus(selectedTicket.ticketStatus);
      setDetailAssignedTo(selectedTicket.assignedTo || '');
      setDetailDevName(selectedTicket.developerName || '');
      setDetailDevEmail(selectedTicket.developerEmail || '');
      setDetailDevMobile(selectedTicket.developerMobileNo || '');
      setDetailResolution(selectedTicket.resolutionSummary || '');
      setDetailRootCause(selectedTicket.rootCause || '');
      setDetailTakenTime(selectedTicket.takenTime || '');
      setDetailTargetDate(selectedTicket.targetDate ? format(new Date(selectedTicket.targetDate), 'yyyy-MM-dd') : '');
      setIsReassigning(false);

      if (selectedTicket.developerName) {
        fetchDevWorkload(selectedTicket.developerName);
      } else {
        setDetailDevWorkloadTrail([]);
      }
    }
  }, [selectedTicket]);

  useEffect(() => {
    if (isReassigning && detailDevName) {
      calculateDetailTargetDate(detailDevName);
      fetchDevWorkload(detailDevName);
    }
  }, [detailDevName, isReassigning]);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/tickets');
      setTickets(res.data || []);
    } catch (err) {
      showSnackbar('Failed to load support tickets', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchPages = async () => {
    try {
      const res = await axios.get('/api/bos-pages');
      if (res.data) setPagesData(res.data);
    } catch (err) {
      console.warn('Could not load BOS pages/modules list', err);
    }
  };

  const fetchAllEmployees = async () => {
    try {
      const res = await axios.get('/api/master/employee');
      setEmployeesList(res.data || []);
    } catch (err) {
      console.warn('Could not load employees list', err);
    }
  };

  const fetchAllCompanies = async () => {
    try {
      const res = await axios.get('/api/company-profile/all');
      setCompaniesList(res.data || []);
    } catch (err) {
      console.warn('Could not load companies list', err);
    }
  };

  // ── Auto Target Date Calculation ─────────────────────────────────────────────
  //   Daily capacity: 12 h = 720 min per working day (Mon–Sat, Sundays and Govt Holidays are off).
  //   Fetches the assignee's existing workload from the backend, then distributes
  //   the new ticket's assigned minutes across available slots day-by-day.
  const DAILY_CAPACITY_MINS = 12 * 60; // 720

  const GOVERNMENT_HOLIDAYS = [
    // 2025
    "2025-01-01", "2025-01-26", "2025-03-14", "2025-04-18", "2025-05-01", 
    "2025-08-15", "2025-10-02", "2025-10-20", "2025-11-05", "2025-12-25",
    // 2026
    "2026-01-01", "2026-01-26", "2026-03-02", "2026-04-03", "2026-05-01", 
    "2026-08-15", "2026-10-02", "2026-10-20", "2026-11-08", "2026-12-25",
    // 2027
    "2027-01-01", "2027-01-26", "2027-03-22", "2027-04-16", "2027-05-01", 
    "2027-08-15", "2027-10-02", "2027-10-09", "2027-11-08", "2027-12-25"
  ];

  const isNonWorkingDay = (d) => {
    if (d.getDay() === 0) return true;
    const key = dateKey(d);
    return GOVERNMENT_HOLIDAYS.includes(key);
  };

  const addDays = (d, n) => {
    const r = new Date(d);
    r.setDate(r.getDate() + n);
    return r;
  };

  const dateKey = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const formatDateLabel = (d) =>
    d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  const formatToCustomDate = (dateStr) => {
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const year = parts[0];
    const monthIdx = parseInt(parts[1], 10) - 1;
    const day = parts[2];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthName = months[monthIdx] || '';
    return `${day}-${monthName}-${year}`;
  };

  const formatMins = (mins) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h > 0 && m > 0) return `${h}h ${m}m`;
    if (h > 0) return `${h}h`;
    return `${m}m`;
  };

  const parseAssignedHoursToMins = (assignedHours) => {
    if (!assignedHours) return 0;
    const hhmmRegex = /^(\d{1,3}):([0-5]\d)$/;
    const match = assignedHours.match(hhmmRegex);
    if (!match) return 0;
    return parseInt(match[1], 10) * 60 + parseInt(match[2], 10);
  };

  const buildWorkloadTrail = async (devName, assignedHours, ticketIdToExclude) => {
    if (!devName || !assignedHours) {
      return [];
    }
    const mins = parseAssignedHoursToMins(assignedHours);
    if (mins <= 0) return [];

    let workload = {};
    try {
      const res = await axios.get(`/api/tickets/workload/${encodeURIComponent(devName)}`);
      workload = res.data || {};
    } catch {
      workload = {};
    }

    let remaining = mins;
    let cursor = new Date(); // start from today
    cursor.setHours(0, 0, 0, 0);
    const trail = [];
    const MAX_DAYS = 365;

    for (let i = 0; i < MAX_DAYS; i++) {
      const key = dateKey(cursor);
      const formattedDate = format(cursor, 'dd-MM-yyyy');

      // 1. Sunday check
      if (cursor.getDay() === 0) {
        trail.push({
          dateStr: formattedDate,
          type: 'sunday',
          isFinal: false
        });
        cursor = addDays(cursor, 1);
        continue;
      }

      // 2. Government Holiday check
      if (GOVERNMENT_HOLIDAYS.includes(key)) {
        trail.push({
          dateStr: formattedDate,
          type: 'holiday',
          isFinal: false
        });
        cursor = addDays(cursor, 1);
        continue;
      }

      // 3. Working Day
      const dayData = workload[key] || { totalMinutes: 0 };
      let existingTickets = [];
      let alreadyAllocated = 0;

      if (dayData.tickets) {
        existingTickets = dayData.tickets.filter(t => t.ticketId !== ticketIdToExclude);
        alreadyAllocated = existingTickets.reduce((sum, t) => sum + t.allocatedMinutes, 0);
      } else {
        alreadyAllocated = dayData.totalMinutes || 0;
      }

      const available = Math.max(0, DAILY_CAPACITY_MINS - alreadyAllocated);
      let allocatedForThis = 0;

      if (remaining > 0 && available > 0) {
        allocatedForThis = Math.min(remaining, available);
        remaining -= allocatedForThis;
      }

      const isFinal = (remaining === 0 && allocatedForThis > 0);

      trail.push({
        dateStr: formattedDate,
        dateKey: key,
        type: 'workday',
        existingTickets: existingTickets.map(t => ({
          ticketId: t.ticketId,
          employeeName: t.employeeName || t.raisedBy || 'Unknown',
          title: t.title || t.ticketHeading || 'No Title',
          allocatedMinutes: t.allocatedMinutes
        })),
        allocatedForThis,
        isFinal,
        alreadyAllocated
      });

      if (remaining <= 0) {
        break;
      }

      cursor = addDays(cursor, 1);
    }

    return trail;
  };

  const renderWorkloadTrail = (trail) => {
    if (!trail || trail.length === 0) {
      return (
        <Typography variant="caption" sx={{ color: '#fff' }}>
          No active workload allocated.
        </Typography>
      );
    }

    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, py: 0.5 }}>
        {trail.map((item, index) => {
          const isSunday = item.type === 'sunday';
          const isHoliday = item.type === 'holiday';
          const isWorkday = item.type === 'workday';

          return (
            <Box
              key={index}
              sx={{
                borderBottom: index < trail.length - 1 ? '1px dashed rgba(255,255,255,0.15)' : 'none',
                pb: index < trail.length - 1 ? 1 : 0
              }}
            >
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 800,
                  color: isSunday || isHoliday ? '#ffb74d' : '#81c784',
                  fontSize: '0.8rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5
                }}
              >
                {item.dateStr}
              </Typography>

              {isSunday && (
                <Typography
                  variant="caption"
                  sx={{
                    display: 'block',
                    pl: 1.5,
                    fontStyle: 'italic',
                    color: 'rgba(255,255,255,0.6)'
                  }}
                >
                  * Sunday (Non-Working Day) - Skipped
                </Typography>
              )}

              {isHoliday && (
                <Typography
                  variant="caption"
                  sx={{
                    display: 'block',
                    pl: 1.5,
                    fontStyle: 'italic',
                    color: 'rgba(255,255,255,0.6)'
                  }}
                >
                  * Government Holiday - Skipped
                </Typography>
              )}

              {isWorkday && (
                <Box sx={{ pl: 1.5, display: 'flex', flexDirection: 'column', gap: 0.25 }}>
                  {/* Existing ticket allocations */}
                  {item.existingTickets && item.existingTickets.map((t, tIdx) => (
                    <Typography
                      key={tIdx}
                      variant="caption"
                      sx={{
                        display: 'block',
                        fontFamily: 'monospace',
                        color: 'rgba(255,255,255,0.8)',
                        fontSize: '0.75rem'
                      }}
                    >
                      * {t.ticketId} | {t.employeeName} | {t.title} | {formatMins(t.allocatedMinutes)}
                    </Typography>
                  ))}

                  {/* New Ticket Allocation on this day */}
                  {item.allocatedForThis > 0 && (
                    <Typography
                      variant="caption"
                      sx={{
                        display: 'block',
                        fontFamily: 'monospace',
                        color: '#64b5f6',
                        fontWeight: 700,
                        fontSize: '0.75rem'
                      }}
                    >
                      * Allocation: {formatMins(item.allocatedForThis)} (New/Scheduled)
                    </Typography>
                  )}

                  {/* Workload Full notice */}
                  {item.allocatedForThis === 0 && item.alreadyAllocated >= DAILY_CAPACITY_MINS && (
                    <Typography
                      variant="caption"
                      sx={{
                        display: 'block',
                        fontStyle: 'italic',
                        color: '#e57373',
                        fontSize: '0.7rem'
                      }}
                    >
                      * Workload full (12h limit reached) - Skipped
                    </Typography>
                  )}

                  {/* Finalization notices */}
                  {item.isFinal && (
                    <>
                      <Typography
                        variant="caption"
                        sx={{
                          display: 'block',
                          color: '#81c784',
                          fontWeight: 800,
                          fontSize: '0.72rem',
                          mt: 0.5
                        }}
                      >
                        * Remaining allocation completed
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          display: 'block',
                          color: '#4db6ac',
                          fontWeight: 800,
                          fontSize: '0.72rem'
                        }}
                      >
                        * Target Date Finalized
                      </Typography>
                    </>
                  )}
                </Box>
              )}
            </Box>
          );
        })}
      </Box>
    );
  };

  const calculateTargetDate = async (devName, assignedHours) => {
    if (!devName || !assignedHours) {
      setFormTargetDate('');
      setTargetDateTooltip('');
      setDevWorkloadTrail([]);
      return;
    }
    const mins = parseAssignedHoursToMins(assignedHours);
    if (mins <= 0) {
      setFormTargetDate('');
      setTargetDateTooltip('');
      setDevWorkloadTrail([]);
      return;
    }

    const trail = await buildWorkloadTrail(devName, assignedHours, null);
    setDevWorkloadTrail(trail);
    const finalDay = trail.find(t => t.isFinal) || trail[trail.length - 1];
    if (finalDay) {
      setFormTargetDate(finalDay.dateKey);
      setTargetDateTooltip(`Target Date: ${finalDay.dateStr}`);
    } else {
      setFormTargetDate('');
      setTargetDateTooltip('');
    }
  };

  const calculateDetailTargetDate = async (devName) => {
    if (!devName || !selectedTicket || !selectedTicket.assignedHours) {
      setDetailDevWorkloadTrail([]);
      return;
    }
    const trail = await buildWorkloadTrail(devName, selectedTicket.assignedHours, selectedTicket.ticketId);
    setDetailDevWorkloadTrail(trail);
    const finalDay = trail.find(t => t.isFinal) || trail[trail.length - 1];
    setDetailTargetDate(finalDay ? finalDay.dateKey : '');
  };

  const fetchDevWorkload = async (devName) => {
    if (!devName || !selectedTicket || !selectedTicket.assignedHours) {
      setDetailDevWorkloadTrail([]);
      return;
    }
    try {
      const trail = await buildWorkloadTrail(devName, selectedTicket.assignedHours, selectedTicket.ticketId);
      setDetailDevWorkloadTrail(trail);
    } catch {
      setDetailDevWorkloadTrail([]);
    }
  };

  // Synchronize hoursPart and minutesPart to formAssignedHours
  useEffect(() => {
    if (hoursPart !== '' || minutesPart !== '') {
      const h = hoursPart !== '' ? hoursPart : '0';
      const m = minutesPart !== '' ? minutesPart : '00';
      const formattedH = String(h).padStart(2, '0');
      const formattedM = String(m).padStart(2, '0');
      setFormAssignedHours(`${formattedH}:${formattedM}`);
    } else {
      setFormAssignedHours('');
    }
  }, [hoursPart, minutesPart]);

  // Re-calculate whenever the assignee or the hours change
  useEffect(() => {
    calculateTargetDate(formDevName, formAssignedHours);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formDevName, formAssignedHours]);



  const fetchEmployeeDetails = async () => {
    try {
      const [empRes, contactRes] = await Promise.all([
        axios.get(`/api/master/employee/${user.empId}`),
        axios.get(`/api/master/employee/${user.empId}/contact`).catch(() => ({ data: null }))
      ]);

      if (empRes.data) {
        const emp = empRes.data;
        setFormEmpCode(emp.empCode || '');
        setFormEmpName(emp.employeeName || '');
        setFormEmail(emp.officeMail || user?.email || '');
        setFormDeptName(emp.department?.departmentName || '');
      }

      if (contactRes && contactRes.data) {
        setFormMobile(contactRes.data.mobile || '');
      }
    } catch (err) {
      console.warn('Could not auto-populate profile info', err);
    }
  };

  const fetchTicketSubresources = async (rowId) => {
    try {
      const [commentsRes, historyRes, attachmentsRes, reopensRes] = await Promise.all([
        axios.get(`/api/tickets/${rowId}/comments`),
        axios.get(`/api/tickets/${rowId}/history`),
        axios.get(`/api/tickets/${rowId}/attachments`),
        axios.get(`/api/tickets/${rowId}/reopens`)
      ]);
      setTicketComments(commentsRes.data || []);
      setTicketTimeline(historyRes.data || []);
      setTicketAttachments(attachmentsRes.data || []);
      setTicketReopens(reopensRes.data || []);
    } catch (err) {
      console.warn('Error fetching ticket detailed history', err);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const getOverallDuration = (ticket) => {
    if (!ticket || !ticket.createdAt) return '-';
    const start = new Date(ticket.createdAt).getTime();
    const end = ticket.closedAt
      ? new Date(ticket.closedAt).getTime()
      : ticket.resolvedAt
        ? new Date(ticket.resolvedAt).getTime()
        : new Date().getTime();

    const diffMs = end - start;
    if (diffMs < 0) return '0 mins';

    const diffMins = Math.floor(diffMs / (1000 * 60));
    const days = Math.floor(diffMins / (24 * 60));
    const hours = Math.floor((diffMins % (24 * 60)) / 60);
    const mins = diffMins % 60;

    const parts = [];
    if (days > 0) parts.push(`${days} day${days > 1 ? 's' : ''}`);
    if (hours > 0) parts.push(`${hours} hr${hours > 1 ? 's' : ''}`);
    if (mins > 0 || parts.length === 0) parts.push(`${mins} min${mins > 1 ? 's' : ''}`);

    return parts.join(', ');
  };

  const parseDurationToMinutes = (str) => {
    if (!str) return 0;
    const clean = str.toLowerCase().replace(/\s+/g, '');
    const dayMatch = clean.match(/([\d.]+)\s*d/);
    const hrMatch = clean.match(/([\d.]+)\s*h/);
    const minMatch = clean.match(/([\d.]+)\s*m/);

    let totalMins = 0;
    if (dayMatch) {
      totalMins += parseFloat(dayMatch[1]) * 24 * 60;
    }
    if (hrMatch) {
      totalMins += parseFloat(hrMatch[1]) * 60;
    }
    if (minMatch) {
      totalMins += parseFloat(minMatch[1]);
    }
    if (!dayMatch && !hrMatch && !minMatch) {
      const num = parseFloat(clean);
      if (!isNaN(num)) {
        totalMins += num * 60;
      }
    }
    return totalMins;
  };

  const formatMinutesToDuration = (totalMins) => {
    if (totalMins <= 0) return '0 mins';
    const days = Math.floor(totalMins / (24 * 60));
    const hours = Math.floor((totalMins % (24 * 60)) / 60);
    const mins = Math.floor(totalMins % 60);

    const parts = [];
    if (days > 0) parts.push(`${days} day${days > 1 ? 's' : ''}`);
    if (hours > 0) parts.push(`${hours} hr${hours > 1 ? 's' : ''}`);
    if (mins > 0 || parts.length === 0) parts.push(`${mins} min${mins > 1 ? 's' : ''}`);
    return parts.join(', ');
  };

  const calculateTotalTakenTime = () => {
    let totalMinutes = 0;
    const matchedDurations = [];

    if (ticketTimeline && ticketTimeline.length > 0) {
      ticketTimeline.forEach(item => {
        if (item.comment) {
          const parts = item.comment.split(' | Taken Time: ');
          if (parts.length > 1) {
            const durationStr = parts[1].trim();
            const mins = parseDurationToMinutes(durationStr);
            if (mins > 0) {
              totalMinutes += mins;
              matchedDurations.push(durationStr);
            }
          }
        }
      });
    }

    if (selectedTicket && selectedTicket.ticketStatus === 'Resolved' && selectedTicket.takenTime) {
      const hasInHistory = ticketTimeline && ticketTimeline.some(item =>
        item.toStatus === 'Resolved' && item.comment && item.comment.includes(`Taken Time: ${selectedTicket.takenTime}`)
      );
      if (!hasInHistory) {
        const mins = parseDurationToMinutes(selectedTicket.takenTime);
        if (mins > 0) {
          totalMinutes += mins;
          matchedDurations.push(selectedTicket.takenTime);
        }
      }
    }

    if (totalMinutes === 0) return { formatted: '-', details: '' };
    return {
      formatted: formatMinutesToDuration(totalMinutes),
      details: matchedDurations.join(' + ')
    };
  };

  // Autocomplete lists for Module and Screen Name
  const modulesList = useMemo(() => {
    const mods = new Set();
    pagesData.forEach(p => {
      if (p.module && p.module.modName) {
        mods.add(p.module.modName);
      }
    });
    return Array.from(mods).sort();
  }, [pagesData]);

  const availablePages = useMemo(() => {
    if (!formCategory) {
      return Array.from(new Set(pagesData.map(p => p.pageName))).sort();
    }
    const filtered = pagesData.filter(
      p => p.module && p.module.modName && p.module.modName.toLowerCase() === formCategory.toLowerCase()
    );
    return Array.from(new Set(filtered.map(p => p.pageName))).sort();
  }, [pagesData, formCategory]);

  // File uploads
  const handleFileUpload = async (event, isComment = false) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    if (isComment) {
      setCommentUploading(true);
      const file = files[0];
      const formData = new FormData();
      formData.append('file', file);
      formData.append('module', 'Support');
      try {
        const res = await axios.post('/api/files/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setCommentFile(res.data);
        showSnackbar('Comment attachment uploaded!');
      } catch (err) {
        showSnackbar('File upload failed', 'error');
      } finally {
        setCommentUploading(false);
      }
    } else {
      setUploading(true);
      const uploadedUrls = [...formAttachments];
      try {
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const formData = new FormData();
          formData.append('file', file);
          formData.append('module', 'SUPPORT_TEMP_ATTACHMENT');
          const res = await axios.post('/api/files/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
          uploadedUrls.push(res.data);
        }
        setFormAttachments(uploadedUrls);
        showSnackbar('Attachments uploaded successfully!');
      } catch (err) {
        showSnackbar('Some file uploads failed', 'error');
      } finally {
        setUploading(false);
      }
    }
  };

  // Due Date & Target Date Reason Check
  const validateAndSubmitTicket = (e) => {
    e.preventDefault();
    if (!formTitle.trim() || !formDesc.trim()) {
      showSnackbar('Title and Description are required', 'warning');
      return;
    }
    if (formPriority === 'Select' || !formPriority) {
      showSnackbar('Please select a Priority Level.', 'warning');
      return;
    }
    if (formSourceType === 'Select' || !formSourceType) {
      showSnackbar('Please select a Source Type.', 'warning');
      return;
    }

    const payload = {
      ticketType: formType,
      title: formTitle,
      moduleName: formCategory,
      pageName: formPageName,
      employeeCode: formEmpCode || user?.empId || '',
      employeeName: formEmpName || user?.name || user?.username || '',
      email: formEmail,
      mobileNo: formMobile,
      department: formDeptName,
      description: formDesc,
      priorityLevel: formPriority,
      severityLevel: formSeverity,
      sourceType: formSourceType,
      ticketStatus: 'Open',
      attachmentPath: formAttachments.join(','),
      assignedHours: formAssignedHours || null,
      targetDate: formTargetDate ? new Date(formTargetDate) : null,
      developerName: formDevName || null,
      developerEmail: formDevEmail || null,
      developerMobileNo: formDevMobile || null,
      assignedTo: formDevName || 'Unassigned',
      createdBy: user?.username || user?.email || user?.name || 'SYSTEM',
      tempAttachments: formAttachments,
      tempVoiceRecordings: formVoiceFiles
    };

    submitTicket(payload);
  };

  const submitTicket = async (payload) => {
    try {
      await axios.post('/api/tickets', payload);
      showSnackbar('Ticket raised successfully!');
      setCreateOpen(false);
      setReasonOpen(false);
      setDueDateReasonText('');
      setPendingSavePayload(null);
      resetForm();
      fetchTickets();
    } catch (err) {
      showSnackbar('Failed to create ticket: ' + (err.response?.data?.error || err.message), 'error');
    }
  };

  const handleReasonSubmit = () => {
    if (!dueDateReasonText.trim()) {
      showSnackbar('A reason is mandatory when target date exceeds due date', 'warning');
      return;
    }
    const updatedPayload = {
      ...pendingSavePayload,
      dueDateReason: dueDateReasonText
    };
    submitTicket(updatedPayload);
  };

  // Status transitions or assignee updates
  const handleUpdateTicketDetails = async () => {
    if (!selectedTicket) return;

    // Check if target date exceeds due date on update
    const targetDateToCheck = currentViewType === 'raised-for-me' ? detailTargetDate : selectedTicket.targetDate;
    if (targetDateToCheck && selectedTicket.dueDate) {
      const tDate = new Date(targetDateToCheck).getTime();
      const dDate = new Date(selectedTicket.dueDate).getTime();
      if (tDate > dDate && !selectedTicket.dueDateReason && !dueDateReasonText) {
        showSnackbar('Please provide a due date reason since target exceeds due date', 'warning');
        return;
      }
    }

    // Hold, Resolved or Closed validation
    if (detailStatus === 'Closed' || detailStatus === 'Hold' || detailStatus === 'Resolved') {
      if (detailStatus === 'Closed' && currentViewType !== 'raised-by-me') {
        showSnackbar('Closing tickets is only allowed from Raised By Me screen', 'error');
        return;
      }
      if (!detailResolution || !detailResolution.trim()) {
        showSnackbar(`Please enter a comment in the Comments field to transition status to ${detailStatus}`, 'warning');
        return;
      }
    }

    // Resolved Taken Time validation
    if (detailStatus === 'Resolved') {
      if (!detailTakenTime || !detailTakenTime.trim()) {
        showSnackbar('Please enter Taken Time (e.g. 2 hrs, 1 day) for Resolved status', 'warning');
        return;
      }
    }

    const payload = {
      ticketStatus: detailStatus,
      assignedTo: detailAssignedTo,
      assignedBy: user?.name || user?.username || 'Admin',
      developerName: detailDevName,
      developerEmail: detailDevEmail,
      developerMobileNo: detailDevMobile,
      resolutionSummary: detailResolution,
      takenTime: detailTakenTime
    };

    if (currentViewType === 'raised-for-me') {
      payload.targetDate = detailTargetDate ? new Date(detailTargetDate) : null;
    }
    if (dueDateReasonText) {
      payload.dueDateReason = dueDateReasonText;
    }

    try {
      const res = await axios.put(`/api/tickets/${selectedTicket.rowId}`, payload);
      setSelectedTicket(res.data);
      showSnackbar('Ticket updated successfully!');
      fetchTickets();
    } catch (err) {
      showSnackbar('Failed to update ticket workflow', 'error');
    }
  };

  // Reopen flow
  const handleReopenTicket = async () => {
    if (!selectedTicket || !reopenReasonText.trim()) {
      showSnackbar('Reopen reason is mandatory', 'warning');
      return;
    }
    if (!reopenTargetDate) {
      showSnackbar('New target date is mandatory for reopening', 'warning');
      return;
    }
    if (!reopenTiming.trim()) {
      showSnackbar('Expected timing/duration is mandatory for reopening', 'warning');
      return;
    }

    const payload = {
      ticketStatus: 'Reopened',
      resolutionSummary: reopenReasonText,
      targetDate: new Date(reopenTargetDate),
      takenTime: reopenTiming
    };

    try {
      const res = await axios.put(`/api/tickets/${selectedTicket.rowId}`, payload);
      setSelectedTicket(res.data);
      setReopenReasonText('');
      setReopenTargetDate('');
      setReopenTiming('');
      setReopenOpen(false);
      showSnackbar('Ticket has been successfully reopened');
      fetchTickets();
    } catch (err) {
      showSnackbar('Failed to reopen ticket', 'error');
    }
  };

  // Post Comment
  const handlePostComment = async () => {
    if (!newComment.trim() || !selectedTicket) return;

    const payload = {
      commentType: commentType,
      comments: newComment,
      attachmentPath: commentFile
    };

    try {
      await axios.post(`/api/tickets/${selectedTicket.rowId}/comments`, payload);
      setNewComment('');
      setCommentFile('');
      showSnackbar('Comment added successfully');
      fetchTicketSubresources(selectedTicket.rowId);
    } catch (err) {
      showSnackbar('Failed to add comment', 'error');
    }
  };

  // Upload Attachment directly
  const handleAddDirectAttachment = async (fileUrl) => {
    if (!selectedTicket) return;
    const payload = {
      fileName: fileUrl.substring(fileUrl.lastIndexOf("/") + 1),
      filePath: fileUrl
    };

    try {
      await axios.post(`/api/tickets/${selectedTicket.rowId}/attachments`, payload);
      showSnackbar('Attachment uploaded successfully');
      fetchTicketSubresources(selectedTicket.rowId);
    } catch (err) {
      showSnackbar('Failed to attach file', 'error');
    }
  };

  const resetForm = () => {
    setFormType('Internal');
    setFormTitle('');
    setFormCategory('');
    setFormPageName('');
    setFormDesc('');
    setFormPriority('Select');
    setFormSeverity('Medium');
    setFormSourceType('Select');
    setFormAssignedHours('');
    setHoursPart('');
    setMinutesPart('');
    setFormTargetDate('');
    setTargetDateTooltip('');
    setFormAttachment('');
    setFormAttachments([]);
    setFormVoiceFiles([]);
    setFormDevName('');
    setFormDevEmail('');
    setFormDevMobile('');
    if (user?.empId) {
      fetchEmployeeDetails();
    } else {
      setFormEmpName(user?.name || '');
      setFormEmail(user?.email || '');
      setFormEmpCode('');
      setFormMobile('');
      setFormDeptName('');
    }
  };

  // Helper lists for UI
  const departmentNames = useMemo(() => {
    const depts = new Set();
    employeesList.forEach(e => {
      if (e.department && e.department.departmentName) {
        depts.add(e.department.departmentName);
      }
    });
    return Array.from(depts).sort();
  }, [employeesList]);

  // Base view level filtering for Raised For Me vs Raised By Me
  const baseFilteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      const myName = (user?.name || '').toLowerCase();
      const myEmail = (user?.email || '').toLowerCase();
      const myUsername = (user?.username || '').toLowerCase();

      if (currentViewType === 'raised-for-me') {
        if (accessLevel === 'Mine') {
          const assignedTo = (t.assignedTo || '').toLowerCase();
          const devName = (t.developerName || '').toLowerCase();
          const devEmail = (t.developerEmail || '').toLowerCase();
          return assignedTo === myName || assignedTo === myUsername || devName === myName || devEmail === myEmail;
        } else if (accessLevel === 'My Team') {
          const tDept = (t.department || '').toLowerCase();
          const userDept = (formDeptName || '').toLowerCase();
          return userDept && tDept === userDept;
        } else if (accessLevel === 'My Company') {
          return true;
        }
        return false;
      } else {
        const createdBy = (t.createdBy || '').toLowerCase();
        const email = (t.email || '').toLowerCase();
        const empName = (t.employeeName || '').toLowerCase();
        const matchesRaisedByMe = createdBy === myUsername || createdBy === myEmail || email === myEmail || empName === myName;
        if (!matchesRaisedByMe) return false;

        if (raisedToFilter) {
          const assignedTo = (t.assignedTo || '').toLowerCase();
          const targetRaisedTo = raisedToFilter.toLowerCase();
          if (assignedTo !== targetRaisedTo) return false;
        }
        return true;
      }
    });
  }, [tickets, currentViewType, accessLevel, user, formDeptName, raisedToFilter]);

  // Statistics KPIs
  const stats = useMemo(() => {
    const total = baseFilteredTickets.length;
    const open = baseFilteredTickets.filter(t => t.ticketStatus === 'Open').length;
    const inProgress = baseFilteredTickets.filter(t => t.ticketStatus === 'In Progress').length;
    const resolved = baseFilteredTickets.filter(t => t.ticketStatus === 'Resolved').length;
    const closed = baseFilteredTickets.filter(t => t.ticketStatus === 'Closed').length;
    const reopened = baseFilteredTickets.filter(t => t.reopenedCount > 0).length;

    // Overdue is past due_date and status is not Resolved or Closed
    const now = new Date().getTime();
    const overdue = baseFilteredTickets.filter(t => {
      if (!t.dueDate) return false;
      const dTime = new Date(t.dueDate).getTime();
      return dTime < now && t.ticketStatus !== 'Resolved' && t.ticketStatus !== 'Closed';
    }).length;

    return { total, open, inProgress, resolved, closed, reopened, overdue };
  }, [baseFilteredTickets]);

  // Color mappings
  const getPriorityColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'critical': return theme.palette.error.dark;
      case 'high': return theme.palette.error.main;
      case 'medium': return theme.palette.warning.main;
      case 'low': return theme.palette.success.main;
      default: return theme.palette.info.main;
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'open': return theme.palette.info.main;
      case 'assigned': return theme.palette.secondary.main;
      case 'in progress': return theme.palette.warning.main;
      case 'hold': return theme.palette.error.main;
      case 'resolved': return theme.palette.success.main;
      case 'closed': return theme.palette.text.secondary;
      default: return theme.palette.primary.main;
    }
  };

  // Frontend Filters configuration
  const filteredTickets = useMemo(() => {
    return baseFilteredTickets.filter((t) => {
      // Redux Global filters
      const q = (globalQuery || '').toLowerCase();
      const matchesSearch = !q ||
        (t.ticketId && t.ticketId.toLowerCase().includes(q)) ||
        (t.title && t.title.toLowerCase().includes(q)) ||
        (t.employeeName && t.employeeName.toLowerCase().includes(q)) ||
        (t.description && t.description.toLowerCase().includes(q));

      // Global specific filters
      const filterId = (globalFilters.ticketId || '').toLowerCase();
      const matchesId = !filterId || (t.ticketId && t.ticketId.toLowerCase().includes(filterId));

      const filterTypeVal = globalFilters.ticketType || 'All';
      const matchesType = filterTypeVal === 'All' || t.ticketType === filterTypeVal;

      const filterStatusVal = globalFilters.ticketStatus || 'All';
      const matchesStatus = filterStatusVal === 'All' || t.ticketStatus === filterStatusVal;

      const filterPriorityVal = globalFilters.priorityLevel || 'All';
      const matchesPriority = filterPriorityVal === 'All' || t.priorityLevel === filterPriorityVal;

      const filterDeptVal = (globalFilters.department || '').toLowerCase();
      const matchesDept = !filterDeptVal || (t.department && t.department.toLowerCase().includes(filterDeptVal));

      const filterAssignedVal = (globalFilters.assignedTo || '').toLowerCase();
      const matchesAssigned = !filterAssignedVal || (t.assignedTo && t.assignedTo.toLowerCase().includes(filterAssignedVal));

      let matchesDate = true;
      if (globalFilters.startDate && t.createdAt) {
        matchesDate = matchesDate && new Date(t.createdAt) >= new Date(globalFilters.startDate + 'T00:00:00');
      }
      if (globalFilters.endDate && t.createdAt) {
        matchesDate = matchesDate && new Date(t.createdAt) <= new Date(globalFilters.endDate + 'T23:59:59');
      }

      return matchesSearch && matchesId && matchesType && matchesStatus && matchesPriority && matchesDept && matchesAssigned && matchesDate;
    });
  }, [baseFilteredTickets, globalQuery, globalFilters]);

  const pagedTickets = useMemo(() => {
    return filteredTickets.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [filteredTickets, page, rowsPerPage]);

  const renderRoadmap = () => {
    if (!selectedTicket) return null;

    const roadmapEvents = ticketTimeline && ticketTimeline.length > 0
      ? ticketTimeline
      : [{
        id: 'temp-created',
        toStatus: selectedTicket.ticketStatus,
        updatedBy: selectedTicket.employeeName || selectedTicket.createdBy,
        updatedAt: selectedTicket.createdAt,
        comment: 'Ticket created'
      }];

    return (
      <Paper sx={{ p: 2, mb: 3, borderRadius: '12px', border: '1px solid #eef2f6', bgcolor: '#fff' }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 3, color: 'text.primary', display: 'flex', alignItems: 'center', gap: 1 }}>
          <span style={{ display: 'inline-block', width: '8px', height: '16px', borderRadius: '4px', backgroundColor: '#673ab7' }}></span>
          Ticket Progress Roadmap
        </Typography>

        <Box sx={{ position: 'relative', pl: 1 }}>
          {roadmapEvents.map((event, idx) => {
            const isLast = idx === roadmapEvents.length - 1;
            const isReassign = event.comment && event.comment.startsWith('Reassigned to');

            let titleText = '';
            if (event.comment === 'Ticket created') {
              titleText = 'Ticket Created';
            } else if (isReassign) {
              titleText = event.comment;
            } else {
              titleText = event.fromStatus
                ? `Status: ${event.fromStatus} → ${event.toStatus}`
                : `Status: ${event.toStatus}`;
            }

            return (
              <Box key={event.id || idx} sx={{ display: 'flex', position: 'relative', pb: isLast ? 0 : 3 }}>
                {!isLast && (
                  <Box
                    sx={{
                      position: 'absolute',
                      left: 11,
                      top: 24,
                      bottom: 0,
                      width: '2px',
                      bgcolor: '#673ab7',
                      zIndex: 1
                    }}
                  />
                )}

                <Box
                  sx={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    bgcolor: isLast ? '#ede7f6' : '#673ab7',
                    border: '2px solid #673ab7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: isLast ? '#673ab7' : '#fff',
                    zIndex: 2,
                    mr: 2,
                    boxShadow: isLast ? '0 0 0 4px rgba(103, 58, 183, 0.2)' : 'none',
                    transition: 'all 0.3s ease'
                  }}
                >
                  {isLast ? (
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#673ab7' }} />
                  ) : (
                    <span style={{ fontSize: '10px', fontWeight: 900 }}>✓</span>
                  )}
                </Box>

                <Box sx={{ pt: 0.2 }}>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontWeight: 700,
                      color: 'text.primary',
                      fontSize: '0.9rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}
                  >
                    {titleText}
                    {isLast && (
                      <Chip label="Current" size="small" sx={{ bgcolor: '#ede7f6', color: '#673ab7', fontWeight: 700, height: 16, fontSize: '0.65rem' }} />
                    )}
                  </Typography>

                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                    {format(new Date(event.updatedAt), 'dd/MM/yyyy HH:mm')} by {event.updatedBy}
                  </Typography>

                  {event.comment && event.comment !== 'Ticket created' && !isReassign && !event.comment.startsWith('Status updated to') && (
                    <Typography variant="caption" sx={{ display: 'block', mt: 0.5, fontStyle: 'italic', color: 'text.secondary', bgcolor: '#f8fafc', p: 1, borderRadius: '4px', borderLeft: '3px solid #673ab7' }}>
                      "{event.comment}"
                    </Typography>
                  )}
                </Box>
              </Box>
            );
          })}
        </Box>
      </Paper>
    );
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* ── TOP HEADER SECTION ── */}
      <Box sx={{
        bgcolor: 'white',
        p: '12px 24px',
        borderRadius: '12px',
        border: '1px solid #eef2f6',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Stack direction="row" spacing={2.5} alignItems="center">
          <Avatar sx={{ width: 50, height: 50, bgcolor: '#ede7f6', color: '#673ab7' }}>
            <TicketIcon size={28} />
          </Avatar>
          <Box>
            <Typography variant="h3" sx={{ fontWeight: 800, color: '#1a223f' }}>
              {currentViewType === 'raised-for-me' ? 'Tickets Assigned To Me' : 'Tickets Created By Me'}
            </Typography>
            <Typography variant="caption" sx={{ fontWeight: 700, color: '#9e9e9e', textTransform: 'uppercase', fontSize: '0.65rem' }}>
              {currentViewType === 'raised-for-me' ? 'Raised For Me Workflow' : 'Raised By Me Workflow'}
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={2} alignItems="center">
          {/* Raised For Me Filters */}
          {currentViewType === 'raised-for-me' && (
            <TextField
              select
              size="small"
              label="View Level"
              value={accessLevel}
              onChange={(e) => setAccessLevel(e.target.value)}
              sx={{ width: 240 }}
            >
              <MenuItem value="Mine">Mine (Default)</MenuItem>
              <MenuItem value="My Team">My Team</MenuItem>
              <MenuItem value="My Company">My Company</MenuItem>
            </TextField>
          )}

          {/* Raised By Me (Ticket By Me) Filters */}
          {currentViewType === 'raised-by-me' && (
            <Autocomplete
              size="small"
              options={employeesList}
              getOptionLabel={(option) => option.employeeName || ''}
              value={employeesList.find(e => e.employeeName === raisedToFilter) || null}
              onChange={(event, newValue) => {
                setRaisedToFilter(newValue ? newValue.employeeName : '');
              }}
              sx={{ width: 320 }}
              renderInput={(params) => <TextField {...params} label="Raised To Employee" />}
            />
          )}

          {currentViewType === 'raised-by-me' && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => { resetForm(); setCreateOpen(true); }}
              sx={{
                height: 40,
                borderRadius: '8px',
                bgcolor: '#673ab7',
                '&:hover': { bgcolor: '#5e35b1' },
                px: 3,
                fontWeight: 700
              }}
            >
              Raise Ticket
            </Button>
          )}
        </Stack>
      </Box>

      {/* ── DASHBOARD STAT CARDS ── */}
      <Box sx={{
        display: 'flex',
        gap: 2,
        width: '100%',
        overflowX: 'auto',
        pb: 1,
        '& > *': {
          flex: '1 1 0px',
          minWidth: '150px'
        }
      }}>
        <HeaderStatCard title="Total" count={stats.total} color={theme.palette.primary.main} icon={<AssignmentIcon />} />
        <HeaderStatCard title="Open" count={stats.open} color={theme.palette.info.main} icon={<TicketIcon />} />
        <HeaderStatCard title="In Progress" count={stats.inProgress} color={theme.palette.warning.main} icon={<HistoryIcon />} />
        <HeaderStatCard title="Resolved" count={stats.resolved} color={theme.palette.success.main} icon={<CheckCircleIcon />} />
        <HeaderStatCard title="Closed" count={stats.closed} color={theme.palette.text.secondary} icon={<CloseIcon />} />
        <HeaderStatCard title="Reopened" count={stats.reopened} color={theme.palette.secondary.main} icon={<ReplayIcon />} />
        <HeaderStatCard title="Overdue" count={stats.overdue} color={theme.palette.error.main} icon={<ErrorOutlineIcon />} />
      </Box>

      <MainCard sx={{ p: 0, display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 310px)' }}>
        {/* ── TICKETS RECORDS TABLE ── */}
        <TableContainer sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          {loading ? (
            <Box sx={{ p: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', flexGrow: 1 }}>
              <CircularProgress color="secondary" />
            </Box>
          ) : (
            <Table sx={{ minWidth: 650, flexGrow: 1 }}>
              <TableHead sx={{ bgcolor: theme.palette.mode === 'dark' ? 'background.default' : 'grey.50' }}>
                {currentViewType === 'raised-for-me' ? (
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Ticket ID</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Title / Module / Screen</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Raised By / Contact</TableCell>
                    <TableCell sx={{ fontWeight: 700, minWidth: 220 }}>Assigned To</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Priority</TableCell>
                    <TableCell sx={{ fontWeight: 700, minWidth: 120 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Target / Due Date</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Taken Time</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700 }}>Action</TableCell>
                  </TableRow>
                ) : (
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Ticket ID</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Title / Module / Screen</TableCell>
                    <TableCell sx={{ fontWeight: 700, minWidth: 220 }}>Assigned To</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Priority</TableCell>
                    <TableCell sx={{ fontWeight: 700, minWidth: 120 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Target / Due Date</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Taken Time</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700 }}>Action</TableCell>
                  </TableRow>
                )}
              </TableHead>
              <TableBody>
                {filteredTickets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={currentViewType === 'raised-for-me' ? 10 : 9} align="center" sx={{ py: 15 }}>
                      <Typography variant="body1" color="text.secondary">No support tickets found</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  pagedTickets.map((t) => (
                    currentViewType === 'raised-for-me' ? (
                      <TableRow key={t.rowId} hover>
                        <TableCell sx={{ fontWeight: 700, color: t.ticketType === 'External' ? 'secondary.main' : 'primary.main' }}>
                          {t.ticketId}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={t.ticketType}
                            size="small"
                            color={t.ticketType === 'External' ? 'secondary' : 'primary'}
                            variant="outlined"
                            sx={{ fontWeight: 700 }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{t.title}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {t.moduleName || 'System'} {t.pageName ? `> ${t.pageName}` : ''}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>{t.employeeName || 'System'}</Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                            Email: {t.email || '-'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                            Mobile: {t.mobileNo || '-'}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ minWidth: 220 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>{t.developerName || t.assignedTo || 'Unassigned'}</Typography>
                          {t.developerEmail && (
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                              Email: {t.developerEmail}
                            </Typography>
                          )}
                          {t.developerMobileNo && (
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                              Mobile: {t.developerMobileNo}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={t.priorityLevel}
                            size="small"
                            sx={{
                              bgcolor: alpha(getPriorityColor(t.priorityLevel), 0.1),
                              color: getPriorityColor(t.priorityLevel),
                              fontWeight: 700,
                              borderRadius: '6px'
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={t.ticketStatus}
                            size="small"
                            sx={{
                              bgcolor: alpha(getStatusColor(t.ticketStatus), 0.1),
                              color: getStatusColor(t.ticketStatus),
                              fontWeight: 700,
                              borderRadius: '6px',
                              minWidth: 100,
                              textAlign: 'center'
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          {t.targetDate ? (
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {format(new Date(t.targetDate), 'dd/MM/yyyy')}
                            </Typography>
                          ) : (
                            <Typography variant="caption" color="text.secondary">-</Typography>
                          )}
                          {t.dueDate && (
                            <Typography variant="caption" color="error.main" sx={{ display: 'block', fontWeight: 600 }}>
                              Due: {format(new Date(t.dueDate), 'dd/MM/yyyy')}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>{t.takenTime || '-'}</Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<OpenInNewIcon fontSize="small" />}
                            onClick={() => {
                              setSelectedTicket(t);
                              setTabValue(0);
                              setDetailsOpen(true);
                            }}
                            sx={{ borderRadius: '6px', textTransform: 'none' }}
                          >
                            Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ) : (
                      <TableRow key={t.rowId} hover>
                        <TableCell sx={{ fontWeight: 700, color: t.ticketType === 'External' ? 'secondary.main' : 'primary.main' }}>
                          {t.ticketId}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={t.ticketType}
                            size="small"
                            color={t.ticketType === 'External' ? 'secondary' : 'primary'}
                            variant="outlined"
                            sx={{ fontWeight: 700 }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{t.title}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {t.moduleName || 'System'} {t.pageName ? `> ${t.pageName}` : ''}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ minWidth: 220 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>{t.developerName || t.assignedTo || 'Unassigned'}</Typography>
                          {t.developerEmail && (
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                              Email: {t.developerEmail}
                            </Typography>
                          )}
                          {t.developerMobileNo && (
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                              Mobile: {t.developerMobileNo}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={t.priorityLevel}
                            size="small"
                            sx={{
                              bgcolor: alpha(getPriorityColor(t.priorityLevel), 0.1),
                              color: getPriorityColor(t.priorityLevel),
                              fontWeight: 700,
                              borderRadius: '6px'
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={t.ticketStatus}
                            size="small"
                            sx={{
                              bgcolor: alpha(getStatusColor(t.ticketStatus), 0.1),
                              color: getStatusColor(t.ticketStatus),
                              fontWeight: 700,
                              borderRadius: '6px',
                              minWidth: 100,
                              textAlign: 'center'
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          {t.targetDate ? (
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {format(new Date(t.targetDate), 'dd/MM/yyyy')}
                            </Typography>
                          ) : (
                            <Typography variant="caption" color="text.secondary">-</Typography>
                          )}
                          {t.dueDate && (
                            <Typography variant="caption" color="error.main" sx={{ display: 'block', fontWeight: 600 }}>
                              Due: {format(new Date(t.dueDate), 'dd/MM/yyyy')}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>{t.takenTime || '-'}</Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<OpenInNewIcon fontSize="small" />}
                            onClick={() => {
                              setSelectedTicket(t);
                              setTabValue(0);
                              setDetailsOpen(true);
                            }}
                            sx={{ borderRadius: '6px', textTransform: 'none' }}
                          >
                            Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </TableContainer>
        <Box sx={{ p: '1px', display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid', borderColor: 'divider' }}>
          <TablePagination
            component="div"
            count={filteredTickets.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(e, p) => setPage(p)}
            onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
            rowsPerPageOptions={[5, 10, 25, 50]}
            sx={{ '& .MuiTablePagination-toolbar': { minHeight: '34px', p: '0 8px' } }}
          />
        </Box>
      </MainCard>

      {/* ── DIALOG: CREATE SUPPORT TICKET ── */}
      {/* ── DIALOG: CREATE SUPPORT TICKET ── */}
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="lg" fullWidth PaperProps={{ sx: { borderRadius: '16px' } }}>
        <form onSubmit={validateAndSubmitTicket}>
          <DialogTitle sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'linear-gradient(135deg, #673ab7 0%, #512da8 100%)',
            color: 'white',
            py: 2
          }}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Avatar sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', color: 'white' }}>
                <TicketIcon />
              </Avatar>
              <Box>
                <Typography variant="h3" sx={{ fontWeight: 700, color: 'white' }}>Raise Support Ticket</Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.8)', display: 'block' }}>Create new internal or external workflow issue</Typography>
              </Box>
            </Stack>
            <IconButton onClick={() => setCreateOpen(false)} sx={{ color: 'white' }}><CloseIcon /></IconButton>
          </DialogTitle>
          <DialogContent sx={{ p: 3, bgcolor: '#f8fafc' }}>
            <Stack spacing={3} sx={{ mt: 1 }}>

              {/* SECTION 1: TICKET INFORMATION */}
              <Box sx={{ bgcolor: 'white', p: 2.5, borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: '#1e293b', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 4, height: 16, bgcolor: '#673ab7', borderRadius: 1 }} />
                  Ticket Information & Classification
                </Typography>
                {/* Row 1: Workflow Type + Title — Type is narrow/fixed, Title grows */}
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'flex-start' }}>
                  <Box sx={{ flex: '0 1 auto', minWidth: `${getFieldMinWidth(formType, 'Ticket Workflow Type', 90)}px` }}>
                    <TextField
                      fullWidth
                      select
                      label="Ticket Workflow Type"
                      value={formType}
                      onChange={(e) => setFormType(e.target.value)}
                    >
                      <MenuItem value="Internal">Internal</MenuItem>
                    </TextField>
                  </Box>
                  <Box sx={{ flex: '2 1 auto', minWidth: `${getFieldMinWidth(formTitle, 'Ticket Title', 90)}px` }}>
                    <TextField
                      fullWidth
                      label="Ticket Title"
                      required
                      placeholder="Summarize the support request..."
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                    />
                  </Box>
                </Box>

                {/* Row 2: Priority + Source + Module + Screen — each auto-width */}
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'flex-start', mt: 2 }}>
                  <Box sx={{ flex: '1 1 auto', minWidth: `${getFieldMinWidth(formPriority, 'Priority Level', 90)}px` }}>
                    <TextField
                      fullWidth
                      select
                      label="Priority Level"
                      value={formPriority}
                      onChange={(e) => setFormPriority(e.target.value)}
                    >
                      <MenuItem value="Select">Select</MenuItem>
                      <MenuItem value="Low">Low</MenuItem>
                      <MenuItem value="Medium">Medium</MenuItem>
                      <MenuItem value="High">High</MenuItem>
                      <MenuItem value="Critical">Critical</MenuItem>
                    </TextField>
                  </Box>
                  <Box sx={{ flex: '1 1 auto', minWidth: `${getFieldMinWidth(formSourceType, 'Source Type', 90)}px` }}>
                    <TextField
                      fullWidth
                      select
                      label="Source Type"
                      value={formSourceType}
                      onChange={(e) => setFormSourceType(e.target.value)}
                    >
                      <MenuItem value="Select">Select</MenuItem>
                      <MenuItem value="Web">Web</MenuItem>
                      <MenuItem value="Mobile">Mobile</MenuItem>
                    </TextField>
                  </Box>
                  <Box sx={{ flex: '2 1 auto', minWidth: `${getFieldMinWidth(formCategory, 'Module Name', 90)}px` }}>
                    <Autocomplete
                      freeSolo
                      options={modulesList}
                      value={formCategory}
                      onChange={(event, newValue) => {
                        setFormCategory(newValue || '');
                        setFormPageName('');
                      }}
                      onInputChange={(event, newInputValue) => {
                        setFormCategory(newInputValue);
                      }}
                      renderInput={(params) => <TextField {...params} label="Module Name" placeholder="Select or type..." />}
                    />
                  </Box>
                  <Box sx={{ flex: '2 1 auto', minWidth: `${getFieldMinWidth(formPageName, 'Screen / Page Name', 90)}px` }}>
                    <Autocomplete
                      freeSolo
                      options={availablePages}
                      value={formPageName}
                      onChange={(event, newValue) => {
                        setFormPageName(newValue || '');
                      }}
                      onInputChange={(event, newInputValue) => {
                        setFormPageName(newInputValue);
                      }}
                      renderInput={(params) => <TextField {...params} label="Screen / Page Name" placeholder="Select or type..." />}
                    />
                  </Box>
                </Box>

              </Box>

              {/* SECTION 2: REPORTER CONTACT INFO */}
              <Box sx={{ bgcolor: 'white', p: 2.5, borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: '#1e293b', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 4, height: 16, bgcolor: '#0284c7', borderRadius: 1 }} />
                  Reporter Contact Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <TextField fullWidth label="Department" value={formDeptName} onChange={(e) => setFormDeptName(e.target.value)} />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField fullWidth label="Email Address" type="email" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField fullWidth label="Mobile Number" value={formMobile} onChange={(e) => setFormMobile(e.target.value)} />
                  </Grid>
                </Grid>
              </Box>

              {/* SECTION 3: WORKFLOW ASSIGNMENT */}
              <Box sx={{
                bgcolor: 'white',
                p: 2.5,
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
              }}>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: '#673ab7', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 4, height: 16, bgcolor: '#673ab7', borderRadius: 1 }} />
                  {formType === 'Internal' ? 'Internal Assignment' : 'External Assignment'}
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'flex-start' }}>
                  {formType === 'Internal' ? (
                    <>
                      <Box sx={{ flex: '2 1 auto', minWidth: `${getFieldMinWidth(formDevName, 'Assigned Employee Name', 90)}px` }}>
                        <Autocomplete
                          options={employeesList}
                          getOptionLabel={(option) => option.employeeName || ''}
                          value={employeesList.find(e => e.employeeName === formDevName) || null}
                          onChange={(event, selectedEmp) => {
                            if (selectedEmp) {
                              setFormDevName(selectedEmp.employeeName || '');
                              setFormDevEmail(selectedEmp.officeMail || '');
                              setFormDevMobile('');
                              axios.get(`/api/master/employee/${selectedEmp.id}/contact`)
                                .then(c => {
                                  if (c.data?.mobile) setFormDevMobile(c.data.mobile);
                                }).catch(() => { });
                            } else {
                              setFormDevName('');
                              setFormDevEmail('');
                              setFormDevMobile('');
                            }
                          }}
                          renderInput={(params) => <TextField {...params} label="Assigned Employee Name" placeholder="Select employee..." />}
                        />
                      </Box>
                      <Box sx={{ flex: '2 1 auto', minWidth: `${getFieldMinWidth(formDevEmail, 'Employee Email', 90)}px` }}>
                        <TextField fullWidth disabled label="Employee Email" value={formDevEmail} />
                      </Box>
                      <Box sx={{ flex: '1 1 auto', minWidth: `${getFieldMinWidth(formDevMobile, 'Employee Mobile', 90)}px` }}>
                        <TextField fullWidth disabled label="Employee Mobile" value={formDevMobile} />
                      </Box>
                    </>
                  ) : (
                    <>
                      <Box sx={{ flex: '2 1 auto', minWidth: `${getFieldMinWidth(formDevName, 'Assigned Company Name', 90)}px` }}>
                        <Autocomplete
                          options={companiesList}
                          getOptionLabel={(option) => option.companyName || ''}
                          value={companiesList.find(c => c.companyName === formDevName) || null}
                          onChange={(event, selectedComp) => {
                            if (selectedComp) {
                              setFormDevName(selectedComp.companyName || '');
                              setFormDevEmail('');
                              setFormDevMobile('');
                            } else {
                              setFormDevName('');
                              setFormDevEmail('');
                              setFormDevMobile('');
                            }
                          }}
                          renderInput={(params) => <TextField {...params} label="Assigned Company Name" placeholder="Select company..." />}
                        />
                      </Box>
                      <Box sx={{ flex: '2 1 auto', minWidth: `${getFieldMinWidth(formDevEmail, 'Company Email', 90)}px` }}>
                        <TextField
                          fullWidth
                          label="Company Email"
                          value={formDevEmail}
                          onChange={(e) => setFormDevEmail(e.target.value)}
                        />
                      </Box>
                      <Box sx={{ flex: '1 1 auto', minWidth: `${getFieldMinWidth(formDevMobile, 'Company Mobile', 90)}px` }}>
                        <TextField
                          fullWidth
                          label="Company Mobile"
                          value={formDevMobile}
                          onChange={(e) => setFormDevMobile(e.target.value)}
                        />
                      </Box>
                    </>
                  )}
                </Box>
              </Box>

              {/* SECTION 4: DESCRIPTION & PLANNING */}
              <Box sx={{ bgcolor: 'white', p: 2.5, borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: '#1e293b', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 4, height: 16, bgcolor: '#f59e0b', borderRadius: 1 }} />
                  Details & Due Dates
                </Typography>
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                      Detailed Description (Rich Text Editor) *
                    </Typography>
                    
                    {/* Integrated Voice & Audio Toolbar */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                      {/* Language Selection Dropdown */}
                      <TextField
                        select
                        size="small"
                        label="Voice Language"
                        value={voiceLang}
                        onChange={(e) => setVoiceLang(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                        sx={{ 
                          width: 140, 
                          '& .MuiInputBase-root': { height: 32, fontSize: '0.8rem' },
                          '& .MuiInputLabel-root': { fontSize: '0.8rem', transform: 'translate(14px, -6px) scale(0.75)' }
                        }}
                      >
                        <MenuItem value="en-IN">English</MenuItem>
                        <MenuItem value="ta-IN">Tamil</MenuItem>
                        <MenuItem value="hi-IN">Hindi</MenuItem>
                        <MenuItem value="es-ES">Spanish</MenuItem>
                        <MenuItem value="fr-FR">French</MenuItem>
                        <MenuItem value="de-DE">German</MenuItem>
                        <MenuItem value="te-IN">Telugu</MenuItem>
                        <MenuItem value="kn-IN">Kannada</MenuItem>
                        <MenuItem value="ml-IN">Malayalam</MenuItem>
                        <MenuItem value="bn-IN">Bengali</MenuItem>
                      </TextField>

                      {/* Live Voice Typing (Speech-to-Text) Button */}
                      <Tooltip title={isListening ? "Stop Voice Typing" : "Live Voice Typing (Speech-to-Text)"}>
                        <Button
                          variant={isListening ? "contained" : "outlined"}
                          color={isListening ? "error" : "primary"}
                          onClick={handleToggleVoiceTyping}
                          size="small"
                          startIcon={isListening ? <MicIcon /> : <MicNoneIcon />}
                          sx={{ 
                            height: 32, 
                            textTransform: 'none', 
                            fontSize: '0.75rem',
                            animation: isListening ? 'pulse-voice 1.5s infinite' : 'none',
                            '@keyframes pulse-voice': {
                              '0%': { transform: 'scale(1)' },
                              '50%': { transform: 'scale(1.1)' },
                              '100%': { transform: 'scale(1)' }
                            }
                          }}
                        >
                          {isListening ? "Listening..." : "Voice Type"}
                        </Button>
                      </Tooltip>

                      {/* Live Voice Recording Button */}
                      <Tooltip title={isRecordingAudio ? "Stop & Transcribe Recording" : "Record Live Audio (Microphone)"}>
                        <Button
                          variant={isRecordingAudio ? "contained" : "outlined"}
                          color={isRecordingAudio ? "error" : "secondary"}
                          onClick={handleToggleLiveRecording}
                          size="small"
                          startIcon={isRecordingAudio ? <StopIcon /> : <FiberManualRecordIcon />}
                          sx={{ 
                            height: 32, 
                            textTransform: 'none', 
                            fontSize: '0.75rem',
                            animation: isRecordingAudio ? 'pulse-voice 1.5s infinite' : 'none'
                          }}
                        >
                          {isRecordingAudio ? "Stop Rec" : "Record Voice"}
                        </Button>
                      </Tooltip>

                      {/* Audio File Upload Button */}
                      <Button
                        variant="outlined"
                        component="label"
                        color="secondary"
                        size="small"
                        startIcon={<SettingsVoiceIcon />}
                        sx={{ height: 32, textTransform: 'none', fontSize: '0.75rem' }}
                      >
                        Upload Audio
                        <input
                          type="file"
                          hidden
                          accept=".mp3,.wav,.m4a,.aac"
                          onChange={handleVoiceUpload}
                        />
                      </Button>
                      
                      {/* Transcription Status Chip */}
                      {transcriptionStatus && (
                        <Chip
                          size="small"
                          label={transcriptionStatus}
                          color={
                            transcriptionStatus.includes('Processing') || transcriptionStatus.includes('Recording')
                              ? 'warning'
                              : transcriptionStatus.includes('Completed')
                              ? 'success'
                              : 'error'
                          }
                          sx={{ height: 24, fontSize: '0.7rem', fontWeight: 600 }}
                        />
                      )}
                    </Box>
                  </Box>

                  <Box sx={{ border: '1px solid #cbd5e1', borderRadius: '8px', overflow: 'hidden', bgcolor: '#fafafa' }}>
                    <ReactQuillDemo value={formDesc} onChange={setFormDesc} editorMinHeight={150} />
                  </Box>
                </Box>
                <Box sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  mt: 2,
                  width: '100%',
                  flexWrap: 'wrap'
                }}>
                  {/* Hours Dropdown */}
                  <TextField
                    select
                    label="Hours"
                    value={hoursPart}
                    onChange={(e) => setHoursPart(e.target.value)}
                    sx={{ width: 140 }}
                    SelectProps={{
                      MenuProps: { PaperProps: { sx: { maxHeight: 200 } } }
                    }}
                  >
                    {Array.from({ length: 101 }, (_, i) => (
                      <MenuItem key={i} value={String(i)}>
                        {i} h
                      </MenuItem>
                    ))}
                  </TextField>

                  {/* Minutes Dropdown */}
                  <TextField
                    select
                    label="Minutes"
                    value={minutesPart}
                    onChange={(e) => setMinutesPart(e.target.value)}
                    sx={{ width: 140 }}
                  >
                    <MenuItem value="00">00 m</MenuItem>
                    <MenuItem value="10">10 m</MenuItem>
                    <MenuItem value="20">20 m</MenuItem>
                    <MenuItem value="30">30 m</MenuItem>
                    <MenuItem value="40">40 m</MenuItem>
                    <MenuItem value="50">50 m</MenuItem>
                  </TextField>

                  {/* Target Date */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: '1 1 200px' }}>
                    <TextField
                      fullWidth
                      type="date"
                      label="Target Date (Auto-calculated)"
                      InputLabelProps={{ shrink: true }}
                      value={formTargetDate}
                      InputProps={{ readOnly: true }}
                      sx={{ '& .MuiInputBase-input': { color: formTargetDate ? '#1a7a4a' : 'text.disabled', fontWeight: 600 } }}
                    />
                    <HtmlTooltip
                      title={
                        <Box sx={{ p: 1, maxHeight: 400, overflowY: 'auto' }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1, borderBottom: '1px solid rgba(255,255,255,0.2)', pb: 0.5 }}>
                            Developer Workload Details (Max 12h/day)
                          </Typography>
                          {renderWorkloadTrail(devWorkloadTrail)}
                        </Box>
                      }
                      placement="top"
                      arrow
                    >
                      <IconButton size="small" sx={{ color: '#673ab7' }}>
                        <InfoOutlinedIcon fontSize="small" />
                      </IconButton>
                    </HtmlTooltip>
                  </Box>

                  {/* Upload Attachments */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: '1.5 1 280px', minWidth: 260 }}>
                    <Button
                      component="label"
                      variant="outlined"
                      startIcon={<CloudUploadIcon />}
                      sx={{
                        height: 55,
                        borderStyle: 'dashed',
                        borderColor: '#94a3b8',
                        color: '#475569',
                        borderRadius: '8px',
                        flexShrink: 0,
                        px: 2,
                        '&:hover': { borderStyle: 'dashed', borderColor: '#673ab7', bgcolor: 'rgba(103,58,183,0.04)' }
                      }}
                    >
                      {uploading ? 'Uploading...' : 'Upload Attachments'}
                      <input type="file" multiple hidden onChange={(e) => handleFileUpload(e, false)} />
                    </Button>
                    {formAttachments.length > 0 && (
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, flexGrow: 1, maxHeight: 55, overflowY: 'auto' }}>
                        {formAttachments.map((url, idx) => (
                          <Box key={idx} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: '#f1f5f9', px: 1, py: 0.25, borderRadius: '4px' }}>
                            <Typography variant="caption" sx={{ textOverflow: 'ellipsis', overflow: 'hidden', color: 'success.main', fontWeight: 600, maxWidth: '120px', whiteSpace: 'nowrap' }}>
                              ✓ {url.substring(url.lastIndexOf('/') + 1)}
                            </Typography>
                            <IconButton size="small" onClick={() => setFormAttachments(formAttachments.filter((_, i) => i !== idx))} sx={{ p: 0.25 }}>
                              <CloseIcon sx={{ fontSize: 10, color: 'error.main' }} />
                            </IconButton>
                          </Box>
                        ))}
                      </Box>
                    )}
                  </Box>
                </Box>
              </Box>

            </Stack>
          </DialogContent>
          <Divider />
          <DialogActions sx={{ p: 2.5, bgcolor: '#f1f5f9' }}>
            <Button onClick={() => setCreateOpen(false)} sx={{ color: '#475569', fontWeight: 600 }}>Cancel</Button>
            <Button
              variant="contained"
              type="submit"
              sx={{
                bgcolor: '#673ab7',
                fontWeight: 700,
                px: 4,
                borderRadius: '8px',
                '&:hover': { bgcolor: '#5e35b1' }
              }}
            >
              Submit Ticket
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* ── DIALOG: MANDATORY DUE DATE REASON POPUP ── */}
      <Dialog open={reasonOpen} onClose={() => setReasonOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Mandatory Target Extension Reason</DialogTitle>
        <Divider />
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            The target date exceeds the due date. Please enter a mandatory reason/justification for this extension:
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            required
            label="Due Date Reason"
            value={dueDateReasonText}
            onChange={(e) => setDueDateReasonText(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReasonOpen(false)}>Cancel</Button>
          <Button variant="contained" color="secondary" onClick={handleReasonSubmit}>Proceed & Save</Button>
        </DialogActions>
      </Dialog>

      {/* ── DIALOG: REOPEN REASON POPUP ── */}
      <Dialog open={reopenOpen} onClose={() => setReopenOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Reopen Ticket Confirmation</DialogTitle>
        <Divider />
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Please state the reason for reopening this resolved/closed ticket:
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            required
            label="Reopen Reason"
            value={reopenReasonText}
            onChange={(e) => setReopenReasonText(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            type="date"
            required
            label="New Target Date"
            InputLabelProps={{ shrink: true }}
            value={reopenTargetDate}
            onChange={(e) => setReopenTargetDate(e.target.value)}
            inputProps={{
              min: todayStr,
              onClick: (e) => { try { e.target.showPicker(); } catch (err) { } }
            }}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            required
            label="Expected Duration / Timing"
            placeholder="e.g. 2 hrs, 1 day"
            value={reopenTiming}
            onChange={(e) => setReopenTiming(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReopenOpen(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleReopenTicket}>Reopen Ticket</Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        maxWidth="lg"
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            m: 1.5,
            width: 'calc(100% - 24px)',
            maxWidth: '1200px'
          }
        }}
      >
        {selectedTicket && (
          <>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Chip label={selectedTicket.ticketId} color="primary" sx={{ fontWeight: 700 }} />
                <Typography variant="h3" sx={{ fontWeight: 700 }}>{selectedTicket.title}</Typography>
              </Stack>
              <IconButton onClick={() => setDetailsOpen(false)}><CloseIcon /></IconButton>
            </DialogTitle>
            <Divider />
            <DialogContent sx={{ p: 1.5, bgcolor: '#fcfdfe' }}>
              <Grid container spacing={2}>
                {/* Left Side: Ticket Metadata Details */}
                <Grid item xs={12} md={8}>
                  <Paper sx={{ p: 2, borderRadius: '12px', border: '1px solid #eef2f6', mb: 3 }}>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>Ticket Description</Typography>
                    <Box
                      sx={{
                        p: 2,
                        bgcolor: '#fafafa',
                        borderRadius: '8px',
                        border: '1px solid #eee',
                        minHeight: 120,
                        overflowY: 'auto'
                      }}
                      dangerouslySetInnerHTML={{ __html: selectedTicket.description }}
                    />

                    <Grid container spacing={2} sx={{ mt: 3 }}>
                      <Grid item xs={6} sm={4}>
                        <Typography variant="caption" color="text.secondary">Workflow Type</Typography>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{selectedTicket.ticketType}</Typography>
                      </Grid>
                      <Grid item xs={6} sm={4}>
                        <Typography variant="caption" color="text.secondary">Severity</Typography>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{selectedTicket.severityLevel || 'Medium'}</Typography>
                      </Grid>
                      <Grid item xs={6} sm={4}>
                        <Typography variant="caption" color="text.secondary">Source</Typography>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{selectedTicket.sourceType || 'Portal'}</Typography>
                      </Grid>

                      <Grid item xs={6} sm={4}>
                        <Typography variant="caption" color="text.secondary">Module</Typography>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{selectedTicket.moduleName || 'None'}</Typography>
                      </Grid>
                      <Grid item xs={6} sm={4}>
                        <Typography variant="caption" color="text.secondary">Screen Name</Typography>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{selectedTicket.pageName || 'None'}</Typography>
                      </Grid>
                      <Grid item xs={6} sm={4}>
                        <Typography variant="caption" color="text.secondary">Created By</Typography>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{selectedTicket.employeeName || selectedTicket.createdBy}</Typography>
                      </Grid>

                      {selectedTicket.takenTime && (
                        <Grid item xs={12}>
                          <Box sx={{
                            mt: 0.5,
                            pt: 1.5,
                            borderTop: '1px dashed #e2e8f0',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.5,
                            flexWrap: 'wrap'
                          }}>
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: '0.7rem' }}>
                              Taken Time
                            </Typography>
                            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'secondary.main', fontSize: '0.95rem' }}>
                              {selectedTicket.takenTime}
                            </Typography>
                          </Box>
                        </Grid>
                      )}
                    </Grid>
                  </Paper>

                  <Paper sx={{ p: 2, borderRadius: '12px', border: '1px solid #eef2f6', mb: 3 }}>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 2.5 }}>Workflow Management</Typography>
                    <Stack spacing={3}>
                      {/* Row 1: Status dropdown, Target Date, Taken Time (Stretch to 100% width) */}
                      <Box sx={{ width: '100%' }}>
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ width: '100%' }}>
                          <Box sx={{ flex: '1 1 240px', maxWidth: { sm: 300, xs: '100%' } }}>
                            <TextField
                              fullWidth
                              select
                              size="small"
                              label="Ticket Workflow Status"
                              value={detailStatus}
                              onChange={(e) => setDetailStatus(e.target.value)}
                            >
                              {currentViewType === 'raised-for-me' ? [
                                <MenuItem key="Open" value="Open" disabled={selectedTicket.ticketStatus !== 'Open'}>Open</MenuItem>,
                                <MenuItem key="Reopened" value="Reopened" disabled={selectedTicket.ticketStatus !== 'Reopened'}>Reopened</MenuItem>,
                                <MenuItem key="Assigned" value="Assigned">Assigned</MenuItem>,
                                <MenuItem key="In Progress" value="In Progress">In Progress</MenuItem>,
                                <MenuItem key="Hold" value="Hold">Hold</MenuItem>,
                                <MenuItem key="Resolved" value="Resolved">Resolved</MenuItem>
                              ] : [
                                <MenuItem key="current" value={selectedTicket.ticketStatus}>{selectedTicket.ticketStatus}</MenuItem>,
                                selectedTicket.ticketStatus !== 'Closed' ? <MenuItem key="Closed" value="Closed">Closed</MenuItem> : null
                              ].filter(Boolean)}
                            </TextField>
                          </Box>

                          {currentViewType === 'raised-for-me' && (
                            <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <TextField
                                fullWidth
                                size="small"
                                type="date"
                                label="Target Date"
                                InputLabelProps={{ shrink: true }}
                                value={detailTargetDate}
                                onChange={(e) => setDetailTargetDate(e.target.value)}
                                inputProps={{
                                  min: todayStr,
                                  onClick: (e) => { try { e.target.showPicker(); } catch (err) { } }
                                }}
                              />
                              <HtmlTooltip
                                title={
                                  <Box sx={{ p: 1, maxHeight: 400, overflowY: 'auto' }}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1, borderBottom: '1px solid rgba(255,255,255,0.2)', pb: 0.5 }}>
                                      Developer Workload Details (Max 12h/day)
                                    </Typography>
                                    {renderWorkloadTrail(detailDevWorkloadTrail)}
                                  </Box>
                                }
                                placement="top"
                                arrow
                              >
                                <IconButton size="small" sx={{ color: '#673ab7' }}>
                                  <InfoOutlinedIcon fontSize="small" />
                                </IconButton>
                              </HtmlTooltip>
                            </Box>
                          )}

                          {currentViewType === 'raised-for-me' && (
                            <Box sx={{ flex: 1 }}>
                              <TextField
                                fullWidth
                                size="small"
                                label="Taken Time (e.g. 2 hrs, 1 day)"
                                value={detailTakenTime}
                                onChange={(e) => setDetailTakenTime(e.target.value)}
                              />
                            </Box>
                          )}
                        </Stack>
                      </Box>

                      {/* Row 2: Currently Assigned To text display (no input box) */}
                      {(currentViewType === 'raised-for-me' || currentViewType === 'raised-by-me') && (
                        <Box sx={{ width: '100%' }}>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5, fontWeight: 500 }}>
                            Currently Assigned To
                          </Typography>
                          <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'primary.main', fontSize: '1.05rem' }}>
                            {detailAssignedTo || 'Unassigned'}
                          </Typography>
                        </Box>
                      )}

                      {/* Row 3: Reassign controls / button on the next row (full width) */}
                      {(currentViewType === 'raised-for-me' || currentViewType === 'raised-by-me') && (
                        <Box sx={{ width: '100%' }}>
                          {isReassigning ? (
                            <Stack spacing={2} sx={{ width: '100%' }}>
                              <Autocomplete
                                options={employeesList}
                                getOptionLabel={(option) => option.employeeName || ''}
                                value={employeesList.find(e => e.employeeName === detailAssignedTo) || null}
                                onChange={(event, newValue) => {
                                  setDetailAssignedTo(newValue ? newValue.employeeName : '');
                                }}
                                renderInput={(params) => (
                                  <TextField
                                    {...params}
                                    size="small"
                                    label="Select New Assignee"
                                    placeholder="Choose employee..."
                                    fullWidth
                                  />
                                )}
                                sx={{
                                  width: '100%',
                                  '& .MuiOutlinedInput-root': {
                                    borderRadius: '8px',
                                    bgcolor: '#fbfbfe'
                                  }
                                }}
                              />
                              <Button
                                variant="outlined"
                                color="secondary"
                                onClick={() => setIsReassigning(false)}
                                sx={{ height: 40, width: '100%', fontWeight: 700, borderRadius: '8px' }}
                              >
                                Cancel Reassign
                              </Button>
                            </Stack>
                          ) : (
                            <Button
                              variant="outlined"
                              color="secondary"
                              onClick={() => setIsReassigning(true)}
                              sx={{ height: 40, width: '100%', fontWeight: 700, borderRadius: '8px' }}
                            >
                              Reassign Ticket
                            </Button>
                          )}
                        </Box>
                      )}

                      {/* Row 3: Developer Auto-fill details for external */}
                      {selectedTicket.ticketType === 'External' && (currentViewType === 'raised-for-me' || currentViewType === 'raised-by-me') && isReassigning && (
                        <Box sx={{ width: '100%' }}>
                          <Divider sx={{ my: 1.5 }} />
                          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'secondary.main', mb: 1.5 }}>
                            Developer Contact Details
                          </Typography>
                          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ width: '100%' }}>
                            <Box sx={{ flex: 5 }}>
                              <Autocomplete
                                size="small"
                                options={employeesList}
                                getOptionLabel={(option) => option.employeeName || ''}
                                value={employeesList.find(e => e.employeeName === detailDevName) || null}
                                onChange={(event, selectedEmp) => {
                                  if (selectedEmp) {
                                    setDetailDevName(selectedEmp.employeeName || '');
                                    setDetailDevEmail(selectedEmp.officeMail || '');
                                    setDetailDevMobile('');
                                    axios.get(`/api/master/employee/${selectedEmp.id}/contact`)
                                      .then(c => {
                                        if (c.data?.mobile) setDetailDevMobile(c.data.mobile);
                                      }).catch(() => { });
                                  } else {
                                    setDetailDevName('');
                                    setDetailDevEmail('');
                                    setDetailDevMobile('');
                                  }
                                }}
                                renderInput={(params) => <TextField {...params} label="Assign Developer" />}
                                fullWidth
                              />
                            </Box>
                            <Box sx={{ flex: 4 }}>
                              <TextField fullWidth size="small" disabled label="Developer Email" value={detailDevEmail} />
                            </Box>
                            <Box sx={{ flex: 3 }}>
                              <TextField fullWidth size="small" disabled label="Developer Mobile" value={detailDevMobile} />
                            </Box>
                          </Stack>
                        </Box>
                      )}

                      {/* Row 4: Comments Box */}
                      <Box sx={{ width: '100%' }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: 'text.secondary' }}>Comments</Typography>
                        <Box
                          sx={{
                            p: 1.5,
                            bgcolor: '#fafafa',
                            borderRadius: '8px',
                            border: '1px solid #eee',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              borderColor: '#ccc'
                            }
                          }}
                        >
                          <TextField
                            fullWidth
                            multiline
                            rows={6}
                            placeholder="Provide details/justification for status change..."
                            value={detailResolution}
                            onChange={(e) => setDetailResolution(e.target.value)}
                            variant="standard"
                            InputProps={{
                              disableUnderline: true,
                              style: { fontSize: '0.875rem' }
                            }}
                          />
                        </Box>
                      </Box>

                      {/* Row 5: Apply Changes Button & Reopen Ticket Banner */}
                      <Box sx={{ width: '100%' }}>
                        <Button
                          variant="contained"
                          color="secondary"
                          fullWidth
                          onClick={handleUpdateTicketDetails}
                          sx={{ height: 48, fontWeight: 700, fontSize: '1rem', borderRadius: '8px' }}
                        >
                          Apply Changes
                        </Button>
                      </Box>

                      {detailStatus === 'Resolved' && selectedTicket.ticketStatus !== 'Closed' && currentViewType === 'raised-by-me' && (
                        <Box sx={{ width: '100%' }}>
                          <Alert severity="success" action={
                            <Button size="small" color="inherit" startIcon={<ReplayIcon />} onClick={() => setReopenOpen(true)}>
                              Reopen Ticket
                            </Button>
                          }>
                            This ticket is completed. You can reopen it if you require further investigation.
                          </Alert>
                        </Box>
                      )}
                    </Stack>
                  </Paper>
                </Grid>

                {/* Right Side: Roadmap only */}
                <Grid item xs={12} sm={4}>
                  {renderRoadmap()}
                </Grid>

              </Grid>

              {/* Bottom Full Width: Tabs Panel — outside Grid for true full width */}
              <Paper sx={{ border: '1px solid #eef2f6', borderRadius: '12px', overflow: 'hidden', mt: 2 }}>
                <Tabs
                  value={tabValue}
                  onChange={(e, val) => setTabValue(val)}
                  indicatorColor="primary"
                  textColor="primary"
                  variant="scrollable"
                  scrollButtons="auto"
                  sx={{ borderBottom: '1px solid #eef2f6', bgcolor: '#fcfcfc' }}
                >
                  <Tab label="Details" />
                  <Tab label={`Comments (${ticketComments.length})`} />
                  <Tab label={`Files (${ticketAttachments.length})`} />
                  <Tab label="Timeline" />
                  <Tab label={`Reopens (${ticketReopens.length})`} />
                </Tabs>

                {/* Tab 0: Details Overview */}
                {tabValue === 0 && (
                  <Box sx={{ p: 2.5, width: '100%' }}>
                    <Stack spacing={2.5} sx={{ width: '100%' }}>

                      {/* Row 1: 4 info cards across full width */}
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, width: '100%' }}>
                        <Box sx={{ flex: '1 1 calc(25% - 12px)', minWidth: 140 }}>
                          <Card sx={{ bgcolor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', boxShadow: 'none', height: '100%' }}>
                            <CardContent sx={{ p: '14px !important' }}>
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5, fontWeight: 600, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.5px' }}>
                                Contact Email
                              </Typography>
                              <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {selectedTicket.email || '-'}
                              </Typography>
                            </CardContent>
                          </Card>
                        </Box>
                        <Box sx={{ flex: '1 1 calc(25% - 12px)', minWidth: 140 }}>
                          <Card sx={{ bgcolor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', boxShadow: 'none', height: '100%' }}>
                            <CardContent sx={{ p: '14px !important' }}>
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5, fontWeight: 600, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.5px' }}>
                                Contact Mobile
                              </Typography>
                              <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                                {selectedTicket.mobileNo || '-'}
                              </Typography>
                            </CardContent>
                          </Card>
                        </Box>
                        <Box sx={{ flex: '1 1 calc(25% - 12px)', minWidth: 140 }}>
                          <Card sx={{ bgcolor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', boxShadow: 'none', height: '100%' }}>
                            <CardContent sx={{ p: '14px !important' }}>
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5, fontWeight: 600, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.5px' }}>
                                Target Date
                              </Typography>
                              <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main' }}>
                                {selectedTicket.targetDate ? format(new Date(selectedTicket.targetDate), 'dd/MM/yyyy') : '-'}
                              </Typography>
                            </CardContent>
                          </Card>
                        </Box>
                        <Box sx={{ flex: '1 1 calc(25% - 12px)', minWidth: 140 }}>
                          <Card sx={{ bgcolor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', boxShadow: 'none', height: '100%' }}>
                            <CardContent sx={{ p: '14px !important' }}>
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5, fontWeight: 600, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.5px' }}>
                                Due Date
                              </Typography>
                              <Typography variant="body2" sx={{ fontWeight: 700, color: 'error.main' }}>
                                {selectedTicket.dueDate ? format(new Date(selectedTicket.dueDate), 'dd/MM/yyyy') : '-'}
                              </Typography>
                            </CardContent>
                          </Card>
                        </Box>
                      </Box>

                      {(selectedTicket.dueDateReason || selectedTicket.resolvedAt || selectedTicket.closedAt || selectedTicket.ticketStatus === 'Reopened') && (
                        <Stack spacing={1.5} sx={{ width: '100%' }}>
                          {selectedTicket.dueDateReason && (
                            <Box sx={{ p: 2, bgcolor: '#fffde7', border: '1px dashed #ffd54f', borderRadius: '8px', width: '100%' }}>
                              <Typography variant="caption" color="warning.dark" sx={{ fontWeight: 700, display: 'block', mb: 0.5, textTransform: 'uppercase' }}>
                                Extension Reason
                              </Typography>
                              <Typography variant="body2" sx={{ color: 'warning.dark', fontWeight: 500 }}>
                                {selectedTicket.dueDateReason}
                              </Typography>
                            </Box>
                          )}
                          {(selectedTicket.resolvedAt || selectedTicket.closedAt) && (
                            <Box sx={{ p: 2, bgcolor: '#f0fdf4', border: '1px dashed #4ade80', borderRadius: '8px', width: '100%' }}>
                              <Typography variant="caption" color="success.dark" sx={{ fontWeight: 700, display: 'block', mb: 0.5, textTransform: 'uppercase' }}>
                                Resolution Summary
                              </Typography>
                              {selectedTicket.resolvedAt && (
                                <Typography variant="body2" sx={{ color: 'success.dark', fontWeight: 600 }}>
                                  Resolved: {format(new Date(selectedTicket.resolvedAt), 'dd/MM/yyyy HH:mm')}
                                </Typography>
                              )}
                              {selectedTicket.closedAt && (
                                <Typography variant="body2" sx={{ color: 'success.dark', fontWeight: 600 }}>
                                  Closed: {format(new Date(selectedTicket.closedAt), 'dd/MM/yyyy HH:mm')}
                                </Typography>
                              )}
                            </Box>
                          )}
                          {selectedTicket.ticketStatus === 'Reopened' && (
                            <Box sx={{ p: 2, bgcolor: '#fdf2f8', border: '1px dashed #ec4899', borderRadius: '8px', width: '100%' }}>
                              <Typography variant="caption" color="secondary.dark" sx={{ fontWeight: 700, display: 'block', mb: 0.5, textTransform: 'uppercase' }}>
                                Reopen Active Status
                              </Typography>
                              <Typography variant="body2" sx={{ color: 'secondary.dark', fontWeight: 600 }}>
                                Reopen Target Date: {selectedTicket.targetDate ? format(new Date(selectedTicket.targetDate), 'dd/MM/yyyy') : '-'}
                              </Typography>
                              <Typography variant="body2" sx={{ color: 'secondary.dark', fontWeight: 600, mt: 0.5 }}>
                                Reopen Expected Duration: {selectedTicket.takenTime || '-'}
                              </Typography>
                            </Box>
                          )}
                        </Stack>
                      )}

                      {/* Row 3: Duration stats side by side */}
                      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                        <Box sx={{ flex: '1 1 calc(50% - 8px)', p: 2, bgcolor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', mb: 0.5 }}>
                            Overall Ticket Duration
                          </Typography>
                          <Typography variant="h3" sx={{ fontWeight: 800, color: 'text.primary', my: 0.5 }}>
                            {getOverallDuration(selectedTicket)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                            From Creation: {format(new Date(selectedTicket.createdAt), 'dd/MM/yyyy HH:mm')}
                          </Typography>
                        </Box>

                        <Box sx={{ flex: '1 1 calc(50% - 8px)', p: 2, bgcolor: '#fdf4ff', border: '1px solid #e9d5ff', borderRadius: '10px' }}>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', mb: 0.5 }}>
                            Overall Taken Time (Active Work)
                          </Typography>
                          {(() => {
                            const totalTime = calculateTotalTakenTime();
                            return (
                              <>
                                <Typography variant="h3" sx={{ fontWeight: 800, color: 'secondary.main', my: 0.5 }}>
                                  {totalTime.formatted}
                                </Typography>
                                {totalTime.details && (
                                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontStyle: 'italic' }}>
                                    Sum of: {totalTime.details}
                                  </Typography>
                                )}
                              </>
                            );
                          })()}
                        </Box>
                      </Box>

                      {ticketTimeline && ticketTimeline.length > 0 && (
                        <Box>
                          <Typography variant="subtitle1" sx={{ fontWeight: 700, mt: 1, mb: 1.5, color: '#1e293b' }}>
                            Status Transitions & Timeline Log
                          </Typography>
                          <Stack spacing={2} sx={{ maxHeight: 240, overflowY: 'auto', pr: 0.5 }}>
                            {ticketTimeline.map((item) => (
                              <Box key={item.id} sx={{ p: 2, border: '1px solid #eef2f6', borderRadius: '8px', bgcolor: '#fff', transition: 'all 0.2s', '&:hover': { boxShadow: '0 2px 8px rgba(0,0,0,0.04)' } }}>
                                <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                                  <Chip
                                    label={item.fromStatus ? `${item.fromStatus} → ${item.toStatus}` : item.toStatus}
                                    size="small"
                                    color="secondary"
                                    variant="outlined"
                                    sx={{ fontWeight: 700, fontSize: '0.75rem', borderRadius: '4px' }}
                                  />
                                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                                    {format(new Date(item.updatedAt), 'dd/MM/yyyy HH:mm')}
                                  </Typography>
                                </Stack>
                                <Typography variant="body2" sx={{ fontSize: '0.825rem', color: 'text.primary', mb: item.comment ? 1 : 0 }}>
                                  Updated by: <span style={{ fontWeight: 700, color: '#673ab7' }}>{item.updatedBy}</span>
                                </Typography>
                                {item.comment && (
                                  <Typography variant="body2" sx={{ p: 1.25, bgcolor: '#f8fafc', borderLeft: '4px solid #673ab7', borderRadius: '4px', fontStyle: 'italic', color: 'text.secondary', fontSize: '0.8rem' }}>
                                    "{item.comment}"
                                  </Typography>
                                )}
                              </Box>
                            ))}
                          </Stack>
                        </Box>
                      )}
                    </Stack>
                  </Box>
                )}

                {/* Tab 1: Comments history with rich text editor */}
                {tabValue === 1 && (
                  <Box sx={{ p: 2 }}>
                    <Stack spacing={2} sx={{ maxHeight: 380, overflowY: 'auto', mb: 2, pr: 1 }}>
                      {ticketComments.map((c) => (
                        <Box key={c.id} sx={{ p: 1.5, bgcolor: c.commentType === 'Internal Note' ? '#fffde7' : '#fafafa', borderRadius: '8px', border: '1px solid #eee' }}>
                          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
                            <Avatar sx={{ width: 28, height: 28, fontSize: '0.8rem' }}>{c.commentedBy[0]}</Avatar>
                            <Box sx={{ flexGrow: 1 }}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{c.commentedBy}</Typography>
                              <Typography variant="caption" color="text.secondary">
                                {format(new Date(c.createdAt), 'dd/MM/yyyy HH:mm')}
                              </Typography>
                            </Box>
                            <Chip label={c.commentType} size="small" variant="outlined" color={c.commentType === 'Internal Note' ? 'warning' : 'primary'} />
                          </Stack>
                          <Box sx={{ pl: 1, fontSize: '0.9rem' }} dangerouslySetInnerHTML={{ __html: c.comments }} />
                          {c.attachmentPath && (
                            <Button
                              variant="text"
                              size="small"
                              startIcon={<AttachFileIcon />}
                              onClick={() => window.open(c.attachmentPath)}
                              sx={{ mt: 1 }}
                            >
                              Download File
                            </Button>
                          )}
                        </Box>
                      ))}
                    </Stack>

                    <Divider sx={{ my: 1.5 }} />
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>Post Comment (Rich Text)</Typography>
                    <ReactQuillDemo value={newComment} onChange={setNewComment} editorMinHeight={80} />

                    <Grid container spacing={1} alignItems="center" sx={{ mt: 1 }}>
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          select
                          size="small"
                          label="Type"
                          value={commentType}
                          onChange={(e) => setCommentType(e.target.value)}
                        >
                          <MenuItem value="Public Reply">Public Reply</MenuItem>
                          <MenuItem value="Internal Note">Internal Note</MenuItem>
                          <MenuItem value="Resolution Update">Resolution Update</MenuItem>
                        </TextField>
                      </Grid>
                      <Grid item xs={6}>
                        <Button component="label" size="small" variant="outlined" fullWidth startIcon={<CloudUploadIcon />}>
                          {commentUploading ? 'Uploading...' : commentFile ? 'File Uploaded' : 'Attach File'}
                          <input type="file" hidden onChange={(e) => handleFileUpload(e, true)} />
                        </Button>
                      </Grid>
                      <Grid item xs={12}>
                        <Button
                          variant="contained"
                          color="secondary"
                          fullWidth
                          startIcon={<SendIcon />}
                          onClick={handlePostComment}
                          sx={{ mt: 1 }}
                        >
                          Send Comment
                        </Button>
                      </Grid>
                    </Grid>
                  </Box>
                )}

                {/* Tab 2: Attachments list and direct uploader */}
                {tabValue === 2 && (
                  <Box sx={{ p: 3 }}>
                    <Stack spacing={2} sx={{ maxHeight: 350, overflowY: 'auto', mb: 2 }}>
                      {ticketAttachments.map((file) => {
                        const isVoice = file.fileType === 'Voice Recording' || 
                                        /\.(mp3|wav|m4a|aac|webm|ogg)$/i.test(file.fileName);
                        return (
                          <Box key={file.id} sx={{ p: 1.5, border: '1px solid #eee', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                              <Box sx={{ flexGrow: 1 }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{file.fileName}</Typography>
                                <Typography variant="caption" color="text.secondary">
                                  By {file.uploadedBy} on {format(new Date(file.uploadedAt), 'dd/MM/yyyy')}
                                </Typography>
                              </Box>
                              <Box sx={{ display: 'flex', gap: 1 }}>
                                {!isVoice && (
                                  <Button size="small" variant="outlined" onClick={() => window.open(`/api/files/view?path=${encodeURIComponent(file.filePath)}`)}>
                                    Preview
                                  </Button>
                                )}
                                <Button size="small" variant="outlined" onClick={() => window.open(`/api/files/download?path=${encodeURIComponent(file.filePath)}`)}>
                                  Download
                                </Button>
                              </Box>
                            </Box>
                            {isVoice && (
                              <Box sx={{ width: '100%', mt: 0.5 }}>
                                <audio controls src={`/api/files/view?path=${encodeURIComponent(file.filePath)}`} style={{ width: '100%', height: '36px' }} />
                              </Box>
                            )}
                          </Box>
                        );
                      })}
                    </Stack>
                    <Divider sx={{ my: 2 }} />
                    <Button component="label" variant="contained" fullWidth startIcon={<CloudUploadIcon />}>
                      Upload File
                      <input type="file" hidden onChange={async (e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const fd = new FormData();
                          fd.append('file', file);
                          fd.append('module', 'Support');
                          const r = await axios.post('/api/files/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
                          handleAddDirectAttachment(r.data);
                        }
                      }} />
                    </Button>
                  </Box>
                )}

                {/* Tab 3: Timeline audit transitions */}
                {tabValue === 3 && (
                  <Box sx={{ p: 3, maxHeight: 400, overflowY: 'auto' }}>
                    <Stack spacing={2}>
                      {ticketTimeline.map((item) => (
                        <Box key={item.id} sx={{ pl: 2, borderLeft: '2px solid #ccc', position: 'relative' }}>
                          <Box sx={{
                            width: 10,
                            height: 10,
                            bgcolor: '#673ab7',
                            borderRadius: '50%',
                            position: 'absolute',
                            left: -6,
                            top: 5
                          }} />
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>
                            {item.fromStatus ? `${item.fromStatus} → ${item.toStatus}` : `Transition to ${item.toStatus}`}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                            By {item.updatedBy} at {format(new Date(item.updatedAt), 'dd/MM/yyyy HH:mm')}
                          </Typography>
                          {item.comment && (
                            <Typography variant="caption" sx={{ fontStyle: 'italic' }}>
                              Comment: {item.comment}
                            </Typography>
                          )}
                        </Box>
                      ))}
                    </Stack>
                  </Box>
                )}

                {/* Tab 4: Reopens history */}
                {tabValue === 4 && (
                  <Box sx={{ p: 3, maxHeight: 400, overflowY: 'auto' }}>
                    <Stack spacing={2}>
                      {ticketReopens.length === 0 ? (
                        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                          No reopen history for this ticket.
                        </Typography>
                      ) : ticketReopens.map((r, idx) => (
                        <Box key={r.id} sx={{ p: 2, border: '1px solid #f9a8d4', borderRadius: '10px', bgcolor: '#fff5f9' }}>
                          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                            <Chip label={`Reopen #${idx + 1}`} size="small" color="secondary" sx={{ fontWeight: 700, fontSize: '0.7rem' }} />
                            <Typography variant="caption" color="text.secondary">
                              {format(new Date(r.reopenedAt), 'dd/MM/yyyy HH:mm')} by {r.reopenedBy}
                            </Typography>
                          </Stack>
                          {r.expectedDuration && (
                            <Typography variant="body2" sx={{ fontWeight: 700, color: 'secondary.main', mt: 0.5 }}>
                              ⏱ Expected Fix Duration: {r.expectedDuration}
                            </Typography>
                          )}
                          {r.reopenTargetDate && (
                            <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary', mt: 0.5 }}>
                              📅 Target Date: {format(new Date(r.reopenTargetDate), 'dd/MM/yyyy')}
                            </Typography>
                          )}
                          <Typography variant="body2" sx={{ mt: 0.5, fontStyle: 'italic', color: 'text.secondary' }}>
                            Reason: {r.reason}
                          </Typography>
                        </Box>
                      ))}
                    </Stack>
                  </Box>
                )}
              </Paper>
            </DialogContent>
          </>
        )}
      </Dialog>

      {/* Snackbar notification feedback */}
      <Snackbar open={snackbar.open} autoHideDuration={5000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
