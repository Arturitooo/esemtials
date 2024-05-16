import React, {useEffect} from 'react';
import { styled, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import MuiDrawer from '@mui/material/Drawer';
import MuiAppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import CssBaseline from '@mui/material/CssBaseline';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
//icons
import StickyNote2Icon from '@mui/icons-material/StickyNote2';
import GroupIcon from '@mui/icons-material/Group';
import DataSaverOffIcon from '@mui/icons-material/DataSaverOff';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

import { useNavigate, Link, useLocation } from 'react-router-dom';
import { AccountMenuNavbar } from './AccountMenuNavbar';
import './Navbar.css'
import logo from '../../assets/smtials_logo.png';

const drawerWidth = 240;

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    ...(open && {
      transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
    }),
  }),
  
);

const openedMixin = (theme) => ({
  width: drawerWidth,
  backgroundColor:'#1D212F',
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: 'hidden',
});

const closedMixin = (theme) => ({
  backgroundColor:'#1D212F',
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  
  overflowX: 'hidden',
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up('sm')]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
}));


const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
    ...(open && {
      ...openedMixin(theme),
      '& .MuiDrawer-paper': openedMixin(theme),
    }),
    ...(!open && {
      ...closedMixin(theme),
      '& .MuiDrawer-paper': closedMixin(theme),
    }),
  }),
);


export function Navbar(props) {
  const {content} = props
  const location = useLocation()
  const path = location.pathname
  const navigate = useNavigate()
  const theme = useTheme();
  const [open, setOpen] = React.useState(false);
  const [authenticated, setAuthenticated] = React.useState(false);

  const isTeamSelected = path === "/team/" || path === "/team/member/create" || /^\/team\/member\/\d+$/.test(path);
  
  const checkAuthenticationStatus = () => {
    const token = localStorage.getItem('Token');
    return token; 
  };

  useEffect(() => {
    const isAuthenticated = checkAuthenticationStatus();
    setAuthenticated(isAuthenticated);
  }, []);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  return (
    <Box sx={{ display: 'flex' }} className="main-navbar">
      <CssBaseline />
      <AppBar position="fixed" open={open} sx={{backgroundColor:'#fff', boxShadow: '0px 1px 0px 0px rgba(0,0,0,0.1), 0px 1px 0px 0px rgba(0,0,0,0.1),0px 1px 0px 0px rgba(0,0,0,0.1)'}}>
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between'}}>
          {authenticated ? (
          <IconButton
            color="#1D212F"
            aria-label="open drawer"
            
            onClick={handleDrawerOpen}
            edge="start"
            sx={{
              marginRight: 5,
              ...(open && { display: 'none' }),
            }}
          >
            { open ? ( <ChevronLeftIcon />) : (<MenuIcon />) }
          </IconButton>
          ) : (null)}
          <Typography variant="h6" noWrap component="div">
          </Typography>
          <AccountMenuNavbar/>
        </Toolbar>
      </AppBar>
      {authenticated ? (
      <Drawer variant="permanent" open={open}>
        <DrawerHeader sx={{backgroundColor:'#1D212F',}}>
        <Box sx={{ marginLeft:'10px', marginTop: '10px' }}>
        <a href='/'><img 
          src={logo}
          alt="SMtials logo" 
          width={"60%"}
        /></a>
        </Box>
          <IconButton onClick={handleDrawerClose}>
            {theme.direction === 'rtl' ? <ChevronRightIcon sx={{color:'white'}}/> : <ChevronLeftIcon sx={{color:'white'}}/>}
          </IconButton>
          
        </DrawerHeader>
        <Divider />
        <List className="main-navbar__list">
            {/* <ListItem key={1} disablePadding>
              <ListItemButton component={Link} to="/dashboard" selected={"/dashboard"===path}>
                <ListItemText sx={{color: '#F5F7F9'}} primary={"Dashboard"} />
              </ListItemButton>
            </ListItem> */}
            <ListItem key={1} disablePadding className="main-navbar__list__item">
              <ListItemButton component={Link} to="/dashboard/notes/" selected={"/dashboard/notes/"===path}>
                <StickyNote2Icon/>
                <ListItemText className="main-navbar__list__item-text" sx={{color: '#F5F7F9'}} primary={"Notes"} />
              </ListItemButton>
            </ListItem>
            <ListItem key={2} disablePadding className="main-navbar__list__item">
              <ListItemButton component={Link} to="/team/" selected={isTeamSelected}>
                <GroupIcon/>
                <ListItemText className="main-navbar__list__item-text" sx={{color: '#F5F7F9'}} primary={"Team"} />
              </ListItemButton>
            </ListItem>
            <ListItem key={3} disablePadding className="main-navbar__list__item">
              <ListItemButton component={Link} to="/monitoring/" selected={path === "/monitoring/" || path === "/monitoring/risk_register"}>
                <DataSaverOffIcon/>
                <ListItemText className="main-navbar__list__item-text" sx={{color: '#F5F7F9'}} primary={"Monitoring"} />
              </ListItemButton>
            </ListItem>


        </List>
      </Drawer>) : (null)}
      <Main open={open}>
        <DrawerHeader />
            {content}      
      </Main>
    </Box>
  );
}