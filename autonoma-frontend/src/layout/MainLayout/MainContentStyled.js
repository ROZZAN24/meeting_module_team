// material-ui
import { styled } from '@mui/material/styles';

// project imports
import { MenuOrientation } from 'config';
import { drawerWidth } from 'store/constant';

// ==============================|| MAIN LAYOUT - STYLED ||============================== //

const RIBBON_H = 96; // px — height of expanded ribbon row

const MainContentStyled = styled('main', {
  shouldForwardProp: (prop) => prop !== 'open' && prop !== 'menuOrientation' && prop !== 'borderRadius' && prop !== 'ribbonOpen'
})(({ theme, open, menuOrientation, borderRadius, ribbonOpen }) => {
  const isHorizontal = menuOrientation === MenuOrientation.HORIZONTAL;
  // Header is 64px. Compact bar is 62px. Ribbon is 96px.
  const hMargin = isHorizontal ? (ribbonOpen ? 64 + RIBBON_H : 126) : 88;

  return {
    backgroundColor: theme.vars.palette.grey[100],
    ...theme.applyStyles('dark', {
      backgroundColor: theme.vars.palette.dark[800]
    }),
    minWidth: '1%',
    width: '100%',
    minHeight: 'calc(100vh - 88px)',
    flexGrow: 1,
    padding: 0,
    marginTop: 88,
    marginRight: 0,
    borderRadius: `${borderRadius}px`,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    transition: theme.transitions.create(['margin-top', 'margin-left', 'width'], {
      easing: theme.transitions.easing.easeInOut,
      duration: theme.transitions.duration.shorter
    }),
    ...(!open && {
      [theme.breakpoints.up('md')]: {
        marginLeft: menuOrientation === MenuOrientation.VERTICAL ? -(drawerWidth - 72) : 0,
        width: `calc(100% - ${drawerWidth}px)`,
        marginTop: hMargin
      }
    }),
    ...(open && {
      marginLeft: 0,
      marginTop: hMargin,
      width: `calc(100% - ${drawerWidth}px)`,
      [theme.breakpoints.up('md')]: {
        marginTop: hMargin
      }
    }),
    [theme.breakpoints.down('md')]: {
      marginLeft: 0,
      padding: 0,
      marginTop: 88,
      ...(!open && {
        width: `calc(100% - ${drawerWidth}px)`
      })
    },
    [theme.breakpoints.down('sm')]: {
      marginLeft: 0,
      marginRight: 0
    }
  };
});

export default MainContentStyled;
