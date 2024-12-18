import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { UserInfo } from "../../UserInfo";
import AxiosInstance from "../../AxiosInstance";
import { MyModal } from "../../forms/MyModal";
import { TMComments } from "./TMComments";
import { TeammemberGitStats } from "./TeammemberGitStats";
import { MyToastMessage } from "../../forms/MyToastMessage";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";

//icons
import Face6Icon from "@mui/icons-material/Face6";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import IntegrationInstructionsIcon from "@mui/icons-material/IntegrationInstructions";

export const TMDetailpage = () => {
  const { id } = useParams();
  const { userData } = UserInfo();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [tmData, setTMData] = useState(null);
  const [toast, setToast] = useState({ open: false, type: "", content: "" });
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [commentsRefreshKey, setCommentsRefreshKey] = useState(0);
  const [showAll, setShowAll] = useState(false);
  const MAX_ITEMS = 3;

  const handleConfirmDeleteTM = () => {
    setDeleteModalOpen(true);
  };

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
        return <>{"Internship"}</>;
      case "junior":
        return <>{"Junior"}</>;
      case "regular":
        return <>{"Medium"}</>;
      case "senior":
        return <>{"Senior"}</>;
      case "expert":
        return <>{"Expert"}</>;
      default:
        return seniorityCode;
    }
  };

  const GetData = (id) => {
    const url = `team/teammember/${id}`;
    AxiosInstance.get(url).then((res) => {
      const data = res.data;
      // parse string to json
      if (typeof data.tm_stack === "string") {
        data.tm_stack = JSON.parse(data.tm_stack);
      }
      setTMData(res.data);
      setLoading(false);
    });
  };

  useEffect(() => {
    GetData(id);

    // show integration form toast
    const toastMessage = localStorage.getItem("toastMessage");

    if (toastMessage) {
      const { type, content } = JSON.parse(toastMessage);
      setToast({ open: true, type, content });
      localStorage.removeItem("toastMessage"); // Clear the toast message after showing it
    }
  }, [id]);

  useEffect(() => {
    // Check if team member is part of the project after tmData is set
    if (tmData && tmData.project != localStorage.getItem("selectedProjectId")) {
      navigate("/team/");
    }
  }, [tmData, navigate]);

  const handleToggle = () => {
    setShowAll(!showAll);
  };

  const handleToastClose = () => {
    setToast({ ...toast, open: false });
  };

  const handleDeleteTM = async () => {
    await DeleteTM();
    setDeleteModalOpen(false);
    navigate("/team/", { state: { refetch: true } });
  };

  const DeleteTM = () => {
    const url = `team/teammember/${id}/`;
    AxiosInstance.delete(url).then(() => {
      console.log("you've successfully deleted the team member");
    });
  };

  const handleCommentAdded = () => {
    setCommentsRefreshKey((prevKey) => prevKey + 1);
  };

  const handleEditClick = () => {
    navigate(`/team/member/update/${id}`, { state: { tmData } });
  };

  const handleAddGitIntegrationClick = () => {
    navigate(`/team/member/${id}/add-git-integration`, { state: { tmData } });
  };

  const handleUpdateGitIntegrationClick = () => {
    navigate(`/team/member/${id}/update-git-integration`, {
      state: { tmData },
    });
  };

  const renderGitIntegrationStatus = () => {
    if (tmData.teammember_hasGitIntegration === null) {
      return (
        <span
          style={{
            color: "#d10000",
            display: "inline-flex",
            alignItems: "center",
          }}
        >
          To be integrated
          <Tooltip title="Integrate">
            <IntegrationInstructionsIcon
              style={{
                color: "rgba(0, 0, 0, 0.5)",
                marginLeft: "5px",
                cursor: "pointer",
                fontSize: "medium",
              }}
              onClick={handleAddGitIntegrationClick}
            />
          </Tooltip>
        </span>
      );
    } else if (tmData.teammember_hasGitIntegration === true) {
      return (
        <span
          style={{
            color: "#42BC09",
            display: "inline-flex",
            alignItems: "center",
          }}
        >
          Integrated
          <Tooltip title="Edit integration details">
            <EditIcon
              style={{
                color: "rgba(0, 0, 0, 0.87)",
                marginLeft: "5px",
                cursor: "pointer",
                fontSize: "medium",
              }}
              onClick={handleUpdateGitIntegrationClick}
            />
          </Tooltip>
        </span>
      );
    } else if (tmData.teammember_hasGitIntegration === false) {
      return (
        <span
          style={{
            color: "#E8A702",
            display: "inline-flex",
            alignItems: "center",
          }}
        >
          Integration broken
          <Tooltip title="Edit integration details">
            <EditIcon
              style={{
                color: "rgba(0, 0, 0, 0.5)",
                marginLeft: "5px",
                cursor: "pointer",
                fontSize: "medium",
              }}
              onClick={handleUpdateGitIntegrationClick}
            />
          </Tooltip>
        </span>
      );
    }
  };

  return (
    <div>
      {loading ? (
        <p>loading data...</p>
      ) : (
        <div>
          <h1>Team member</h1>
          <Card className="card-section team-member__card">
            <CardContent className="team-member__content">
              <div
                className="team-member__content--photo"
                style={{
                  height: "240px",
                }}
              >
                {tmData.tm_photo ? (
                  <div>
                    <img src={tmData.tm_photo} alt="Team member photo" />
                  </div>
                ) : (
                  <div
                    style={{
                      height: "180px",
                      width: "180px",
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
              </div>
              <div>
                <div className="team-member__content--name">
                  <h2>
                    {tmData.tm_name} {tmData.tm_lname}{" "}
                  </h2>
                </div>
                <div className="team-member__content--details">
                  <div>
                    <h4>Role</h4>
                    {tmData.tm_position ? (
                      <p>{getRoleLabel(tmData.tm_position)}</p>
                    ) : (
                      <p className="no-data">No data</p>
                    )}
                  </div>
                  <div>
                    <h4>Seniority</h4>
                    {tmData.tm_seniority ? (
                      <p>{getSeniorityLabel(tmData.tm_seniority)}</p>
                    ) : (
                      <p className="no-data">No data</p>
                    )}
                  </div>
                  <div>
                    <h4>Joined</h4>
                    {tmData.tm_joined ? (
                      <p>{tmData.tm_joined}</p>
                    ) : (
                      <p className="no-data">No data</p>
                    )}
                  </div>
                  <div>
                    <h4>Stack</h4>
                    {tmData.tm_stack.length > 0 ? (
                      <ul style={{ paddingLeft: "20px" }}>
                        {tmData.tm_stack
                          .slice(
                            0,
                            showAll ? tmData.tm_stack.length : MAX_ITEMS
                          )
                          .map((tech, index) => (
                            <li key={index}>
                              <p>{tech}</p>
                            </li>
                          ))}
                      </ul>
                    ) : (
                      <p className="no-data">No data</p>
                    )}
                    {tmData.tm_stack.length > MAX_ITEMS && (
                      <Button
                        onClick={handleToggle}
                        size="small"
                        sx={{
                          fontFamily: "Ubuntu",
                          fontWeight: 300,
                        }}
                      >
                        {showAll ? "less" : "more"}
                      </Button>
                    )}
                  </div>
                  <div className="grid-2-columns">
                    <h4>Summary</h4>
                    {tmData.tm_summary ? (
                      <p>{tmData.tm_summary}</p>
                    ) : (
                      <p className="no-data">No data</p>
                    )}
                  </div>
                </div>
              </div>
              <div className="team-member__content--actions">
                <Button
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={handleEditClick}
                >
                  Edit details
                </Button>
                <Button
                  variant="outlined"
                  onClick={handleConfirmDeleteTM}
                  startIcon={<DeleteIcon />}
                >
                  Delete
                </Button>
                <div>
                  <h4>Integrations</h4>
                  <p>Git repository: {renderGitIntegrationStatus()}</p>
                  {/* <p>
                    Board:{" "}
                    {tmData.teammember_hasBoardIntegration == true ? (
                      <span
                        style={{
                          color: "#42BC09",
                          display: "inline-flex",
                          alignItems: "center",
                        }}
                      >
                        Integrated
                        <Tooltip title="Edit integration details">
                          <EditIcon
                            style={{
                              color: "rgba(0, 0, 0, 0.87)",
                              marginLeft: "5px",
                              cursor: "pointer",
                              fontSize: "medium",
                            }}
                          />
                        </Tooltip>
                      </span>
                    ) : (
                      <span
                        style={{
                          color: "#d10000",
                          display: "inline-flex",
                          alignItems: "center",
                        }}
                      >
                        To be integrated
                        <Tooltip title="The feature is not supported yet.">
                          <IntegrationInstructionsIcon
                            style={{
                              color: "rgba(0, 0, 0, 0.2)",
                              marginLeft: "5px",
                              cursor: "pointer",
                              fontSize: "medium",
                            }}
                          />
                        </Tooltip>
                      </span>
                    )}{" "}
                  </p>
                  <p>
                    Calendar:{" "}
                    {tmData.teammember_hasCalendarIntegration == true ? (
                      <span
                        style={{
                          color: "#42BC09",
                          display: "inline-flex",
                          alignItems: "center",
                        }}
                      >
                        Integrated
                        <Tooltip title="Edit integration details">
                          <EditIcon
                            style={{
                              color: "rgba(0, 0, 0, 0.87)",
                              marginLeft: "5px",
                              cursor: "pointer",
                              fontSize: "medium",
                            }}
                          />
                        </Tooltip>
                      </span>
                    ) : (
                      <span
                        style={{
                          color: "#d10000",
                          display: "inline-flex",
                          alignItems: "center",
                        }}
                      >
                        To be integrated
                        <Tooltip title="The feature is not supported yet.">
                          <IntegrationInstructionsIcon
                            style={{
                              color: "rgba(0, 0, 0, 0.2)",
                              marginLeft: "5px",
                              cursor: "pointer",
                              fontSize: "medium",
                            }}
                          />
                        </Tooltip>
                      </span>
                    )}{" "}
                  </p> */}
                </div>
              </div>
            </CardContent>
          </Card>

          {tmData.teammember_hasGitIntegration && (
            <TeammemberGitStats teammember={tmData.id} />
          )}

          <TMComments
            userData={userData.id}
            tm_id={id}
            onCommentAdded={handleCommentAdded}
            key={commentsRefreshKey}
          />
        </div>
      )}

      <MyToastMessage
        type={toast.type}
        content={toast.content}
        open={toast.open}
        handleClose={handleToastClose}
      />

      <MyModal
        open={deleteModalOpen}
        handleClose={() => setDeleteModalOpen(false)}
        content={
          <>
            Are you sure you want to delete the team member{" "}
            {tmData ? (
              <>
                <strong>{tmData.tm_name}</strong>{" "}
                <strong>{tmData.tm_lname}</strong>
              </>
            ) : (
              ""
            )}
            ? All details and comments will be permanently deleted.
          </>
        }
        actions={[
          {
            label: "Cancel",
            onClick: () => setDeleteModalOpen(false),
            className: "modal-action-cancel",
          },
          { label: "Yes, delete", onClick: handleDeleteTM },
        ]}
      />
    </div>
  );
};
