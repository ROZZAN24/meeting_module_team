import { useState } from 'react';

// material-ui
import Button from '@mui/material/Button';
import CardActions from '@mui/material/CardActions';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import FormControlLabel from '@mui/material/FormControlLabel';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';

// project imports
import SubCard from 'ui-component/cards/SubCard';
import AnimateButton from 'ui-component/extended/AnimateButton';
import { useFaceWatchdogContext } from 'ui-component/FaceWatchdogGuard';

// icons
import { IconCamera, IconCameraOff, IconShieldLock, IconFaceId } from '@tabler/icons-react';

const titleSX = {
  fontWeight: 600,
  display: 'flex',
  alignItems: 'center',
  '& > svg': {
    mr: 1
  }
};

// ==============================|| PROFILE 1 - SETTINGS ||============================== //

export default function Settings() {
  const watchdog = useFaceWatchdogContext();
  const watchdogEnabled = watchdog?.enabled ?? false;
  const facePresent = watchdog?.facePresent ?? null;
  const countdown = watchdog?.countdown ?? null;
  const isFeatureAllowed = watchdog?.isFeatureAllowed ?? false;

  const handleWatchdogToggle = (e) => {
    watchdog?.setEnabled(e.target.checked);
  };

  const [state1, setState1] = useState({
    checkedA: true,
    checkedB: false
  });
  const [state2, setState2] = useState({
    checkedA: true,
    checkedB: false,
    checkedC: true
  });
  const [state3, setState3] = useState({
    checkedA: true,
    checkedB: true,
    checkedC: false
  });
  const handleSwitchChange1 = (event) => {
    setState1({ ...state1, [event.target.name]: event.target.checked });
  };
  const handleSwitchChange2 = (event) => {
    setState2({ ...state2, [event.target.name]: event.target.checked });
  };
  const handleSwitchChange3 = (event) => {
    setState3({ ...state3, [event.target.name]: event.target.checked });
  };

  const [state, setState] = useState({
    checkedA: true,
    checkedB: true,
    checkedC: false,
    checkedD: false,
    checkedE: false
  });
  const handleChangeState = (event) => {
    setState({ ...state, [event.target.name]: event.target.checked });
  };

  return (
    <Stack sx={{ gap: 3 }}>

      {/* ── Security & Privacy ─────────────────────────────── */}
      <SubCard
        title={
          <Stack direction="row" alignItems="center" gap={1}>
            <IconShieldLock size={20} stroke={1.5} />
            Security &amp; Privacy
          </Stack>
        }
      >
        <Stack sx={{ gap: 2 }}>
          {/* Toggle row */}
          <Stack direction="row" alignItems="flex-start" justifyContent="space-between" gap={2}>
            <Box sx={{ flex: 1 }}>
              <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 0.5 }}>
                <IconFaceId size={18} stroke={1.5} />
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: isFeatureAllowed ? 'inherit' : 'text.disabled' }}>
                  Auto-Logout on Face Absence
                </Typography>
              </Stack>
              <Typography variant="body2" color="text.secondary">
                {isFeatureAllowed ? (
                  <>
                    If your face is not detected for <strong>30 seconds</strong>, you will be
                    automatically signed out to protect your session.
                  </>
                ) : (
                  <span style={{ color: '#f44336', fontWeight: 600 }}>
                    This feature is currently disabled by your system administrator.
                  </span>
                )}
              </Typography>
            </Box>
            <Switch
              id="face-watchdog-toggle"
              checked={watchdogEnabled}
              onChange={handleWatchdogToggle}
              disabled={!isFeatureAllowed}
              color="primary"
            />
          </Stack>

          {/* Live status indicator */}
          {watchdogEnabled && (
            <Stack direction="row" alignItems="center" gap={1}>
              {facePresent === null ? (
                <Chip
                  icon={<IconCamera size={14} />}
                  label="Initialising camera…"
                  size="small"
                  variant="outlined"
                  color="default"
                />
              ) : facePresent ? (
                <Chip
                  icon={<IconCamera size={14} />}
                  label="Face detected — session secure"
                  size="small"
                  color="success"
                  variant="outlined"
                />
              ) : (
                <Chip
                  icon={<IconCameraOff size={14} />}
                  label={countdown !== null ? `No face — logout in ${countdown}s` : 'Face not detected'}
                  size="small"
                  color={countdown !== null && countdown <= 10 ? 'error' : 'warning'}
                  variant="outlined"
                />
              )}
            </Stack>
          )}

          {/* Info alert */}
          {watchdogEnabled && (
            <Alert severity="info" sx={{ py: 0.5, fontSize: '0.78rem' }}>
              Camera access is required. The video feed is <strong>never uploaded</strong> — face
              detection runs entirely in your browser.
            </Alert>
          )}
        </Stack>
      </SubCard>

      <SubCard title="Email Settings">
        <Stack sx={{ gap: 3 }}>
        <Stack>
          <Typography variant="subtitle1">Setup Email Notification</Typography>
          <FormControlLabel
            control={<Switch checked={state1.checkedA} onChange={handleSwitchChange1} name="checkedA" color="primary" />}
            label="Email Notification"
          />
          <FormControlLabel
            control={<Switch checked={state1.checkedB} onChange={handleSwitchChange1} name="checkedB" color="primary" />}
            label="Send Copy To Personal Email"
          />
        </Stack>
        <Divider />
        <Typography variant="h5" component="span" sx={{ ...titleSX, textTransform: 'uppercase' }}>
          Activity Related Emails
        </Typography>
        <Stack>
          <Typography variant="subtitle1">When to email?</Typography>
          <FormControlLabel
            control={<Switch checked={state2.checkedA} onChange={handleSwitchChange2} name="checkedA" color="primary" />}
            label="have new notifications"
          />
          <FormControlLabel
            control={<Switch checked={state2.checkedB} onChange={handleSwitchChange2} name="checkedB" color="primary" />}
            label="you're sent a direct message"
          />
          <FormControlLabel
            control={<Switch checked={state2.checkedC} onChange={handleSwitchChange2} name="checkedC" color="primary" />}
            label="Someone adds you as a connection"
          />
        </Stack>
        <Stack>
          <Typography variant="subtitle1">When to escalate emails?</Typography>
          <FormControlLabel
            control={<Switch checked={state3.checkedA} onChange={handleSwitchChange3} name="checkedA" color="primary" />}
            label="Upon new order"
          />
          <FormControlLabel
            control={<Switch checked={state3.checkedB} onChange={handleSwitchChange3} name="checkedB" color="primary" />}
            label="New membership approval"
          />
          <FormControlLabel
            control={<Switch checked={state3.checkedC} onChange={handleSwitchChange3} name="checkedC" color="primary" />}
            label="Member registration"
          />
        </Stack>
        <Divider />
        <Typography variant="h5" component="span" sx={{ ...titleSX, textTransform: 'uppercase' }}>
          Updates From System Notification
        </Typography>
        <Stack>
          <Typography variant="subtitle1">Email you with?</Typography>
          <FormControlLabel
            control={<Checkbox checked={state.checkedA} onChange={handleChangeState} name="checkedA" color="primary" />}
            label="News about PCT-themes products and feature updates"
          />
          <FormControlLabel
            control={<Checkbox checked={state.checkedB} onChange={handleChangeState} name="checkedB" color="primary" />}
            label="Tips on getting more out of PCT-themes"
          />
          <FormControlLabel
            control={<Checkbox checked={state.checkedC} onChange={handleChangeState} name="checkedC" color="primary" />}
            label="Things you missed since you last logged into PCT-themes"
          />
          <FormControlLabel
            control={<Checkbox checked={state.checkedD} onChange={handleChangeState} name="checkedD" color="primary" />}
            label="News about products and other services"
          />
          <FormControlLabel
            control={<Checkbox checked={state.checkedE} onChange={handleChangeState} name="checkedE" color="primary" />}
            label="Tips and Document business products"
          />
        </Stack>
        </Stack>
      </SubCard>
    </Stack>
  );
}
