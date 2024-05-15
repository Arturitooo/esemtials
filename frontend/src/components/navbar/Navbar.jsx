import React, {useState, useEffect} from 'react';
import { styled, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import CssBaseline from '@mui/material/CssBaseline';
import MuiAppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import ArrowRightSharpIcon from '@mui/icons-material/ArrowRightSharp';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import StickyNote2Icon from '@mui/icons-material/StickyNote2';
import GroupIcon from '@mui/icons-material/Group';
import DataSaverOffIcon from '@mui/icons-material/DataSaverOff';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
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
    marginLeft: `-${drawerWidth}px`,
    ...(open && {
      transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      marginLeft: 0,
    }),
  }),
  
);

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  transition: theme.transitions.create(['margin', 'width'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: `${drawerWidth}px`,
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  justifyContent: 'flex-end',
}));


export function Navbar(props) {
  //what's shown in the sidebar
  const {content} = props
  const location = useLocation()
  const path = location.pathname
  const navigate = useNavigate()

  const theme = useTheme();
  const [open, setOpen] = React.useState(false);
  const [authenticated, setAuthenticated] = React.useState(false);

  const isTeamSelected = path === "/team/" || /^\/team\/member\/\d+$/.test(path);

const checkAuthenticationStatus = () => {
  const token = localStorage.getItem('Token');
  return token; 
};

useEffect(() => {
  const isAuthenticated = checkAuthenticationStatus();
  setAuthenticated(isAuthenticated);
}, []);

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar position="fixed" open={open} sx={{backgroundColor:'#fff', boxShadow: '0px 1px 0px 0px rgba(0,0,0,0.1), 0px 1px 0px 0px rgba(0,0,0,0.1),0px 1px 0px 0px rgba(0,0,0,0.1)'}}>
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between'}}>
        {authenticated ? (
          <IconButton
          color="#1D212F"
          aria-label="open drawer"
          onClick={handleDrawerToggle}
          edge="start"
          sx={{ mr: 2 }}
        >
          { open ? ( <ChevronLeftIcon />) : (<MenuIcon />) }  
        </IconButton>
        ) : (null)}
          <Typography variant="h6" noWrap component="div" sx={{color:'#1D212F'}}>
          </Typography>
            <AccountMenuNavbar/>
          
        </Toolbar>
      </AppBar>
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            backgroundColor: '#1D212F',
            color: 'rgba(245, 247, 249, 0.7)',
          },
        }}
        variant="persistent"
        anchor="left"
        open={open}
      >

        <Box sx={{ marginLeft:'10px', marginTop: '10px' }}>
        <a href='/'><img 
          src={logo} 
          alt="SMtials logo" 
          width={"60%"}
        /></a>
        </Box>
        <Divider />
        <List>
            {/* <ListItem key={1} disablePadding>
              <ListItemButton component={Link} to="/dashboard" selected={"/dashboard"===path}>
                <ListItemText sx={{color: '#F5F7F9'}} primary={"Dashboard"} />
              </ListItemButton>
            </ListItem> */}
            <ListItem key={1} disablePadding>
              <ListItemButton component={Link} to="/dashboard/notes/" selected={"/dashboard/notes/"===path}>
                <StickyNote2Icon
                  style={{ 
                    position: 'relative',
                    fontSize:'large',
                    marginRight: '8px', 
                  }} 
                />
                <ListItemText sx={{color: '#F5F7F9'}} primary={"Notes"} />
              </ListItemButton>
            </ListItem>
            <ListItem key={2} disablePadding>
              <ListItemButton component={Link} to="/team/" selected={isTeamSelected}>
                <GroupIcon
                  style={{ 
                    position: 'relative',
                    fontSize:'large',
                    marginRight: '8px', 
                  }} 
                />
                <ListItemText sx={{color: '#F5F7F9'}} primary={"Team"} />
              </ListItemButton>
            </ListItem>
            <ListItem key={3} disablePadding>
              <ListItemButton component={Link} to="/monitoring/" selected={path === "/monitoring/" || path === "/monitoring/risk_register"}>
                <DataSaverOffIcon
                  style={{ 
                    position: 'relative',
                    fontSize:'large',
                    marginRight: '8px', 
                  }} 
                />
                <ListItemText sx={{color: '#F5F7F9'}} primary={"Monitoring"} />
              </ListItemButton>
            </ListItem>


        </List>
      </Drawer>
      <Main open={open}>
        <DrawerHeader />
            {content}
       
      </Main>
    </Box>
  );
}