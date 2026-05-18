import { Activity, useEffect, useRef, useState } from 'react';

// material-ui
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Avatar from '@mui/material/Avatar';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Grid from '@mui/material/Grid';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// project imports
import Transitions from 'ui-component/extended/Transitions';

// assets
import TranslateTwoToneIcon from '@mui/icons-material/TranslateTwoTone';
import useConfig from 'hooks/useConfig';

const getLangIndicator = (lng) => {
  switch (lng) {
    case 'ta':
      return 'த';
    case 'hi':
      return 'ह';
    case 'fr':
      return 'F';
    case 'ro':
      return 'R';
    case 'zh':
      return '中';
    default:
      return 'E';
  }
};

// ==============================|| LOCALIZATION ||============================== //

export default function LocalizationSection() {
  const {
    state: { borderRadius, i18n },
    setField
  } = useConfig();

  const theme = useTheme();
  const downMD = useMediaQuery(theme.breakpoints.down('md'));

  const [open, setOpen] = useState(false);
  const anchorRef = useRef(null);

  const handleListItemClick = (_event, lng) => {
    setField('i18n', lng);
    
    // Set the googtrans cookie for direct translation
    const domain = window.location.hostname;
    document.cookie = `googtrans=/en/${lng}; path=/; domain=${domain}`;
    document.cookie = `googtrans=/en/${lng}; path=/`; // Localhost fallback
    
    setOpen(false);
    
    // Fast page refresh to sync standard components and let Google Translate mount translated DOM immediately
    window.location.reload();
  };

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }
    setOpen(false);
  };

  const prevOpen = useRef(open);

  useEffect(() => {
    if (prevOpen.current === true && open === false) {
      anchorRef.current.focus();
    }
    prevOpen.current = open;
  }, [open]);

  return (
    <>
      <Box sx={{ ml: { xs: 0, sm: 2 } }}>
        <Avatar
          variant="rounded"
          sx={{
            ...theme.typography.commonAvatar,
            ...theme.typography.mediumAvatar,
            transition: 'all .2s ease-in-out',
            color: theme.vars.palette.primary.dark,
            background: theme.vars.palette.primary.light,
            '&:hover, &[aria-controls="menu-list-grow"]': {
              color: theme.vars.palette.primary.light,
              background: theme.vars.palette.primary.main
            },

            ...theme.applyStyles('dark', {
              color: theme.vars.palette.primary.dark,
              background: theme.vars.palette.dark.main,
              '&:hover, &[aria-controls="menu-list-grow"]': {
                color: theme.vars.palette.primary.light,
                background: theme.vars.palette.primary.main
              }
            })
          }}
          ref={anchorRef}
          aria-controls={open ? 'menu-list-grow' : undefined}
          aria-haspopup="true"
          alt="language"
          onClick={handleToggle}
        >
          <Typography
            className="notranslate"
            variant="h5"
            sx={{
              fontWeight: 'bold',
              color: 'inherit',
              fontSize: '1.15rem'
            }}
          >
            {getLangIndicator(i18n)}
          </Typography>
        </Avatar>
      </Box>

      <Popper
        placement={downMD ? 'bottom-start' : 'bottom'}
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        transition
        disablePortal
        modifiers={[
          {
            name: 'offset',
            options: {
              offset: [downMD ? 0 : 0, 20]
            }
          }
        ]}
      >
        {({ TransitionProps }) => (
          <ClickAwayListener onClickAway={handleClose}>
            <Transitions position={downMD ? 'top-left' : 'top'} in={open} {...TransitionProps}>
              <Paper elevation={16}>
                <Activity mode={open ? 'visible' : 'hidden'}>
                  <List
                    sx={{
                      width: '100%',
                      minWidth: 200,
                      maxWidth: { xs: 250, sm: 280 },
                      borderRadius: `${borderRadius}px`
                    }}
                  >
                    <ListItemButton selected={i18n === 'en'} onClick={(event) => handleListItemClick(event, 'en')}>
                      <ListItemText
                        primary={
                          <Grid container>
                            <Typography>English</Typography>
                            <Typography variant="caption" sx={{ ml: '8px' }}>
                              (UK)
                            </Typography>
                          </Grid>
                        }
                      />
                    </ListItemButton>
                    <ListItemButton selected={i18n === 'ta'} onClick={(event) => handleListItemClick(event, 'ta')}>
                      <ListItemText
                        primary={
                          <Grid container>
                            <Typography>தமிழ்</Typography>
                            <Typography variant="caption" sx={{ ml: '8px' }}>
                              (Tamil)
                            </Typography>
                          </Grid>
                        }
                      />
                    </ListItemButton>
                    <ListItemButton selected={i18n === 'hi'} onClick={(event) => handleListItemClick(event, 'hi')}>
                      <ListItemText
                        primary={
                          <Grid container>
                            <Typography>हिन्दी</Typography>
                            <Typography variant="caption" sx={{ ml: '8px' }}>
                              (Hindi)
                            </Typography>
                          </Grid>
                        }
                      />
                    </ListItemButton>
                    <ListItemButton selected={i18n === 'fr'} onClick={(event) => handleListItemClick(event, 'fr')}>
                      <ListItemText
                        primary={
                          <Grid container>
                            <Typography>français</Typography>
                            <Typography variant="caption" sx={{ ml: '8px' }}>
                              (French)
                            </Typography>
                          </Grid>
                        }
                      />
                    </ListItemButton>
                    <ListItemButton selected={i18n === 'ro'} onClick={(event) => handleListItemClick(event, 'ro')}>
                      <ListItemText
                        primary={
                          <Grid container>
                            <Typography>Română</Typography>
                            <Typography variant="caption" sx={{ ml: '8px' }}>
                              (Romanian)
                            </Typography>
                          </Grid>
                        }
                      />
                    </ListItemButton>
                    <ListItemButton selected={i18n === 'zh'} onClick={(event) => handleListItemClick(event, 'zh')}>
                      <ListItemText
                        primary={
                          <Grid container>
                            <Typography>中国人</Typography>
                            <Typography variant="caption" sx={{ ml: '8px' }}>
                              (Chinese)
                            </Typography>
                          </Grid>
                        }
                      />
                    </ListItemButton>
                  </List>
                </Activity>
              </Paper>
            </Transitions>
          </ClickAwayListener>
        )}
      </Popper>
    </>
  );
}
