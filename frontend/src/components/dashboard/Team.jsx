import React, { useEffect, useState } from "react";
import AxiosInstance from "../AxiosInstance";
import { MyTextButton } from "../forms/MyTextButton";
import { Link, useLocation } from "react-router-dom";
import emptyStateImage from "../../assets/illustrations/no-friends-cat.svg";
import chooseProjectImage from "../../assets/illustrations/pick-a-project.svg";


import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";

//icons
import Face6Icon from "@mui/icons-material/Face6";
import SignalWifi0BarIcon from "@mui/icons-material/SignalWifi0Bar";
import NetworkWifi1BarIcon from "@mui/icons-material/NetworkWifi1Bar";
import NetworkWifi3BarIcon from "@mui/icons-material/NetworkWifi3Bar";
import NetworkWifiIcon from "@mui/icons-material/NetworkWifi";
import SignalWifi4BarIcon from "@mui/icons-material/SignalWifi4Bar";
import AddIcon from "@mui/icons-material/Add";

export const Team = () => {
  const [teamData, setTeamData] = useState();
  const [emptyState, setEmptyState] = useState(false);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const [selectedProjectId, setSelectedProjectId] = useState(null);

  useEffect(() => {
    const storedProjectId = localStorage.getItem("selectedProjectId");
    if (storedProjectId) {
      setSelectedProjectId(storedProjectId);
      GetData(storedProjectId);
    }
  }, []);

  useEffect(() => {
    if (selectedProjectId) {
      GetData(selectedProjectId);
    }
  }, [selectedProjectId, location.state]);

  const getRoleLabel = (roleCode) => {
    switch (roleCode) {
      case "sm":
        return "Scrum Master";
      case "fe_dev":
        return "Frontend Developer";
      case "be_dev":
        return "Backend Developer";
      case "fs_dev":
        return "Fullstack Developer";
      case "devops":
        return "DevOps";
      case "des":
        return "Designer";
      case "qa":
        return "Quality Engineer";
      case "ba":
        return "Business Analyst";
      case "sa":
        return "Solution Architect";
      default:
        return roleCode;
    }
  };
  const getSeniorityLabel = (seniorityCode) => {
    switch (seniorityCode) {
      case "intern":
        return (
          <>
            <SignalWifi0BarIcon
              sx={{
                fontSize: "medium",
                position: "relative",
                top: "2px",
                marginRight: "4px",
              }}
            />
            {"Internship"}
          </>
        );
      case "junior":
        return (
          <>
            <NetworkWifi1BarIcon
              sx={{
                fontSize: "medium",
                position: "relative",
                top: "2px",
                marginRight: "4px",
              }}
            />
            {"Junior"}
          </>
        );
      case "regular":
        return (
          <>
            <NetworkWifi3BarIcon
              sx={{
                fontSize: "medium",
                position: "relative",
                top: "2px",
                marginRight: "4px",
              }}
            />
            {"Medium"}
          </>
        );
      case "senior":
        return (
          <>
            <NetworkWifiIcon
              sx={{
                fontSize: "medium",
                position: "relative",
                top: "2px",
                marginRight: "4px",
              }}
            />
            {"Senior"}
          </>
        );
      case "expert":
        return (
          <>
            <SignalWifi4BarIcon
              sx={{
                fontSize: "medium",
                position: "relative",
                top: "2px",
                marginRight: "4px",
              }}
            />
            {"Expert"}
          </>
        );
      default:
        return seniorityCode;
    }
  };

  const GetData = (projectId) => {
    AxiosInstance.get("team/teammember/")
      .then((res) => {
        const filteredTeamMembers = res.data.filter(
          (member) => member.project === Number(projectId)
        );
        setTeamData(filteredTeamMembers);
        setEmptyState(filteredTeamMembers.length === 0);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching team members:", error);
        setLoading(false);
      });
  };

  if (!selectedProjectId) {
    return (
      <div>
      <h1>Team</h1>
      <Card className="card empty-state-card">
        <CardContent>
          <img src={chooseProjectImage} alt="choose-project"/>
          <h2>Choose a project, duh</h2>
          <p> To use the <b>Team</b> card, please select a project first.</p>
        </CardContent>
      </Card>
      </div>
    );
  }

  return (
    <div>
      {loading ? (
        <p>loading data...</p>
      ) : (
        <div>
          {emptyState ? (
            <div>
              <h1>Team</h1>
              <Card className="card empty-state-card">
                <CardContent>
                  <img src={emptyStateImage} alt="no-members"/>
                  <h2>You have no team members</h2>
                  <p>Add team members to track their progress, put notes, and more.</p>
                  <Link to="/team/member/create">
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                    >
                      New member
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <>
                  <h1>Team</h1>
                </>
                <>
                  <Link to="/team/member/create">
                    <Button
                      variant="outlined"
                      startIcon={<AddIcon />}
                      sx={{ height: "50%" }}
                    >
                      New member
                    </Button>
                  </Link>
                </>
              </div>

              <TableContainer component={Paper} sx={{ borderRadius: "15px" }}>
                <Table sx={{ minWidth: 650 }} aria-label="Team members">
                  <TableHead>
                    <TableRow>
                      <TableCell>Nr.</TableCell>
                      <TableCell>Team Member</TableCell>
                      <TableCell>Role</TableCell>
                      <TableCell>Seniority</TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {teamData.map((item, index) => (
                      <TableRow
                        key={index}
                        sx={{
                          "&:last-child td, &:last-child th": { border: 0 },
                        }}
                      >
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              columnGap: "12px",
                            }}
                          >
                            {item.tm_photo ? (
                              <div
                                style={{
                                  height: "50px",
                                  width: "50px",
                                  overflow: "hidden",
                                  borderRadius: "30px",
                                  display: "flex",
                                  justifyContent: "center",
                                  alignItems: "center",
                                }}
                              >
                                <img
                                  src={`http://127.0.0.1:8000${item.tm_photo}`}
                                  alt="Team member photo"
                                  style={{
                                    minWidth: "50px",
                                    minHeight: "50px",
                                    objectFit: "cover",
                                    objectPosition: "center",
                                  }}
                                />
                              </div>
                            ) : (
                              <div
                                style={{
                                  height: "50px",
                                  width: "50px",
                                  border: "solid rgba(29, 33, 47, 0.1) 2px",
                                  borderRadius: "30px",
                                  display: "flex",
                                  justifyContent: "center",
                                  alignItems: "center",
                                }}
                              >
                                <Face6Icon style={{ opacity: "40%" }} />
                              </div>
                            )}
                            {item.tm_lname} {item.tm_name}
                          </div>
                        </TableCell>
                        <TableCell>{getRoleLabel(item.tm_position)}</TableCell>
                        <TableCell>
                          {getSeniorityLabel(item.tm_seniority)}
                        </TableCell>
                        <TableCell>
                          <Link to={`/team/member/${item.id}`}>
                            <MyTextButton label="Details" />
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
