import React, { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Tooltip from "@mui/material/Tooltip";
import Logout from "@mui/icons-material/Logout";
import AccountCircleRoundedIcon from "@mui/icons-material/AccountCircleRounded";
import AxiosInstance from "../AxiosInstance";
import { useNavigate, Link } from "react-router-dom";
import { LoginRegisterNavButton } from "./LoginRegisterNavButton";

import ListItemIcon from "@mui/material/ListItemIcon";
import IconButton from "@mui/material/IconButton";
import WorkHistoryOutlinedIcon from "@mui/icons-material/WorkHistoryOutlined";

export function AccountMenuNavbar() {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const navigate = useNavigate();
  const [authenticated, setAuthenticated] = React.useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const logoutUser = () => {
    AxiosInstance.post(`logout/`, {}).then(() => {
      localStorage.removeItem("Token");
      navigate("/");
      window.location.reload();
    });
  };

  const handleLogoutAndClose = () => {
    logoutUser();
    setAuthenticated(false);
    handleClose();
  };

  const checkAuthenticationStatus = () => {
    const token = localStorage.getItem("Token");
    return token;
  };

  useEffect(() => {
    const isAuthenticated = checkAuthenticationStatus();
    setAuthenticated(isAuthenticated);
  }, []);

  useEffect(() => {
    if (authenticated) {
      AxiosInstance.get("user-info/").then((res) => {
        setUserData(res.data);
        setLoading(false);
      });
    }
  }, [authenticated]);

  return (
    <>
      {authenticated ? (
        <React.Fragment>
          <Box>
            <Tooltip title="Account settings">
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  textAlign: "center",
                  color: "#1D212F",
                }}
              >
                {loading ? null : (
                  <p>
                    Hello <b>{userData && userData.username}</b>
                  </p>
                )}
                <IconButton
                  onClick={handleClick}
                  size="medium"
                  sx={{ ml: 2, color: "#1D212F", marginLeft: "-3px" }}
                  aria-controls={open ? "account-menu" : undefined}
                  aria-haspopup="true"
                  aria-expanded={open ? "true" : undefined}
                >
                  <AccountCircleRoundedIcon />
                </IconButton>
              </Box>
            </Tooltip>
          </Box>
          <Menu
            anchorEl={anchorEl}
            id="account-menu"
            open={open}
            onClose={handleClose}
            onClick={handleClose}
            PaperProps={{
              elevation: 0,
              sx: {
                overflow: "visible",
                filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
                mt: 1.5,
                "& .MuiAvatar-root": {
                  width: 32,
                  height: 32,
                  ml: -0.5,
                  mr: 1,
                },
                "&::before": {
                  content: '""',
                  display: "block",
                  position: "absolute",
                  top: 0,
                  right: 14,
                  width: 10,
                  height: 10,
                  bgcolor: "background.paper",
                  transform: "translateY(-50%) rotate(45deg)",
                  zIndex: 0,
                },
              },
            }}
            transformOrigin={{ horizontal: "right", vertical: "top" }}
            anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
          >
            {/* <MenuItem onClick={handleClose}>
          <Avatar /> Profile
        </MenuItem> */}

            <MenuItem onClick={handleClose}>
              <Link
                to="/projects/"
                style={{
                  textDecoration: "none",
                  color: "inherit",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <ListItemIcon>
                  <WorkHistoryOutlinedIcon />
                </ListItemIcon>
                Manage Projects
              </Link>
            </MenuItem>

            <MenuItem onClick={handleLogoutAndClose}>
              <ListItemIcon>
                <Logout fontSize="small" />
              </ListItemIcon>
              Logout
            </MenuItem>
          </Menu>
        </React.Fragment>
      ) : (
        <Box
          sx={{ display: "flex", alignItems: "center", textAlign: "center" }}
        >
          <Link to="/login" style={{ textDecoration: "none" }}>
            <LoginRegisterNavButton
              label={"Login"}
              sx={{
                color: "#1D212F",
                "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.2)" },
                "&:active": { backgroundColor: "rgba(0, 0, 0, 0.4)" },
              }}
            />
          </Link>
          <Link
            to="/register"
            style={{ textDecoration: "none", color: "#1D212F" }}
          >
            <LoginRegisterNavButton label={"Register"} />
          </Link>
        </Box>
      )}
    </>
  );
}
