import React, { useState, useEffect } from "react";
import AxiosInstance from "../../AxiosInstance";

import { Box } from "@mui/material";
import Card from "@mui/material/Card";
import Divider from "@mui/material/Divider";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import { BarChart } from "@mui/x-charts/BarChart";

export const TeammemberGitStats = ({ teammember }) => {
  const [codingData, setCodingData] = useState(null);
  const [gitStatsTimeframe, setGitStatsTimeframe] = useState(() => {
    // Initialize with localStorage or fallback to 7
    return Number(localStorage.getItem("gitStatsTimeframe")) || 7;
  });
  const [counters7, setCounters7] = useState(null);
  const [counters30, setCounters30] = useState(null);
  const [previous7, setprevious7] = useState(null);
  const [previous30, setprevious30] = useState(null);

  const successColor = "#42BC09";
  const warningColor = "rgba(32, 32, 32, 0.25)";
  const errorColor = "#D10000";

  useEffect(() => {
    GetGitData(teammember);
  }, [teammember]);

  const GetGitData = (teammember_id) => {
    const url = `team/teammember-coding-stats/${teammember_id}/`;
    AxiosInstance.get(url).then((res) => {
      // save the response data to data variable
      const data = res.data;
      // stringify the data
      const stringData = JSON.stringify(data);
      const theCodingStats = JSON.parse(stringData);
      setCodingData(theCodingStats);
      const counters7 = theCodingStats.counters7;
      setCounters7(counters7);
      const counters30 = theCodingStats.counters30;
      setCounters30(counters30);
      const previous7 = theCodingStats.previous7;
      setprevious7(previous7);
      const previous30 = theCodingStats.previous30;
      setprevious30(previous30);
    });
  };

  const handleToggleChange = (event, newAlignment) => {
    if (newAlignment !== null) {
      // Prevent setting null
      setGitStatsTimeframe(newAlignment);
      localStorage.setItem("gitStatsTimeframe", newAlignment); // Keep localStorage updated
    }
  };

  const getColor = (currentValue, previousValue) => {
    if (currentValue > previousValue) return successColor;
    if (currentValue < previousValue) return errorColor;
    if (currentValue == previousValue) return warningColor;
  };

  const getNegativeColor = (currentValue, previousValue) => {
    if (currentValue > previousValue) return errorColor;
    if (currentValue < previousValue) return successColor;
    if (currentValue == previousValue) return warningColor;
  };

  const calculateChange = (currentValue, previousValue) => {
    if (currentValue === previousValue) {
      return "0%";
    } else {
      return (
        Math.round(((currentValue - previousValue) / previousValue) * 100) + "%"
      );
    }
  };

  return (
    <Box
      sx={{
        maxWidth: "100%",
        overflowX: "auto",
        whiteSpace: "pre-wrap",
        wordBreak: "break-word",
      }}
    >
      <Box
        sx={{
          display: "inline-flex",
          justifyContent: "space-between",
          width: "100%",
        }}
      >
        <h2>Coding Stats</h2>
        <Box sx={{ marginTop: "10px" }}>
          <ToggleButtonGroup
            color="primary"
            value={gitStatsTimeframe}
            exclusive
            onChange={handleToggleChange}
            aria-label="Platform"
          >
            <ToggleButton value={7}>7 days</ToggleButton>
            <ToggleButton value={30}>30 days</ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Box>

      {codingData ? (
        <Box>
          {/* Repos info */}
          <Card className="card-section">
            <Box
              sx={{
                display: "inline-flex",
                width: "100%",
                margin: "10px",
              }}
            >
              <Box sx={{ width: "40%", paddingRight: "10px" }}>
                <h3 style={{ margin: "0px", padding: "5px" }}>Repositories</h3>
                <Divider sx={{ marginBottom: "10px", width: "40%" }} />
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    justifyItems: "center",
                  }}
                >
                  <div
                    style={{
                      margin: "auto",
                      color: "rgba(32, 32, 32, 0.5)",
                      fontWeight: "400",
                      fontSize: "15px",
                    }}
                  >
                    Active repositories
                  </div>
                  <div
                    style={{
                      margin: "auto",
                      fontWeight: "400",
                      fontSize: "40px",
                      lineHeight: "40px",
                    }}
                  >
                    {gitStatsTimeframe === 7 ? (
                      <>{counters7.active_projects7}</>
                    ) : (
                      <>{counters30.active_projects30}</>
                    )}
                  </div>
                  <div
                    style={{
                      margin: "auto",
                      fontWeight: "400",
                      fontSize: "14px",
                      color:
                        gitStatsTimeframe === 7
                          ? getColor(
                              counters7.active_projects7,
                              previous7.previous_active_projects7
                            )
                          : getColor(
                              counters30.active_projects30,
                              previous30.previous_active_projects30
                            ),
                      paddingBottom: "15px",
                    }}
                  >
                    {gitStatsTimeframe === 7 ? (
                      <>
                        {calculateChange(
                          counters7.active_projects7,
                          previous7.previous_active_projects7
                        )}
                      </>
                    ) : (
                      <>
                        {calculateChange(
                          counters30.active_projects30,
                          previous30.previous_active_projects30
                        )}
                      </>
                    )}
                  </div>
                </Box>
              </Box>
              <Divider orientation="vertical" flexItem />
              <Box sx={{ width: "60%", paddingLeft: "10px" }}>
                <div>
                  <span
                    style={{
                      color: "rgba(32, 32, 32, 0.5)",
                      fontWeight: "400",
                      fontSize: "15px",
                    }}
                  >
                    Repos details:
                  </span>
                  <ul
                    style={{
                      margin: "0px",
                      paddingLeft: "20px",
                      fontSize: "14px",
                    }}
                  >
                    {gitStatsTimeframe === 7 ? (
                      <>
                        {counters7.active_projects7_list.map((projectObj) => {
                          // Extract the project ID and details
                          const [id, project] = Object.entries(projectObj)[0];
                          return (
                            <li key={id}>
                              <a
                                href={project.project_url}
                                style={{
                                  textDecoration: "underline",
                                  color: "rgba(0, 0, 0, 0.87)",
                                }}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {project.project_name}
                              </a>
                            </li>
                          );
                        })}
                      </>
                    ) : (
                      <>
                        {counters30.active_projects30_list.map((projectObj) => {
                          const [id, project] = Object.entries(projectObj)[0];
                          return (
                            <li key={id}>
                              <a
                                href={project.project_url}
                                style={{
                                  textDecoration: "underline",
                                  color: "rgba(0, 0, 0, 0.87)",
                                }}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {project.project_name}
                              </a>
                            </li>
                          );
                        })}
                      </>
                    )}
                  </ul>
                </div>
              </Box>
            </Box>
          </Card>

          {/* MRs stats */}
          <Card className="card-section">
            <Box
              sx={{
                display: "inline-flex",
                width: "100%",
                margin: "10px",
              }}
            >
              <Box sx={{ width: "40%", paddingRight: "10px" }}>
                <h3
                  style={{ margin: "0px", padding: "5px", textAlign: "left" }}
                >
                  Merge requests
                </h3>
                <Divider
                  sx={{
                    marginBottom: "15px",
                    width: "40%",
                    alignContent: "left",
                  }}
                />
                <Box
                  sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    width: "100%",
                    textAlign: "center", // Center-align all content
                  }}
                >
                  {/* Left column */}
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center",
                      width: "50%",
                    }}
                  >
                    {[
                      {
                        label: "MR's created",
                        value:
                          gitStatsTimeframe === 7
                            ? counters7.created_mrs_counter7
                            : counters30.created_mrs_counter30,
                        change:
                          gitStatsTimeframe === 7
                            ? calculateChange(
                                counters7.created_mrs_counter7,
                                previous7.previous_created_mrs_counter7
                              )
                            : calculateChange(
                                counters30.created_mrs_counter30,
                                previous30.previous_created_mrs_counter30
                              ),
                        color:
                          gitStatsTimeframe === 7
                            ? getColor(
                                counters7.created_mrs_counter7,
                                previous7.previous_created_mrs_counter7
                              )
                            : getColor(
                                counters30.created_mrs_counter30,
                                previous30.previous_created_mrs_counter30
                              ),
                      },
                      {
                        label: "CR comments received",
                        value:
                          gitStatsTimeframe === 7
                            ? counters7.comments_in_created_mrs7
                            : counters30.comments_in_created_mrs30,
                        change:
                          gitStatsTimeframe === 7
                            ? calculateChange(
                                counters7.comments_in_created_mrs7,
                                previous7.previous_comments_in_created_mrs7
                              )
                            : calculateChange(
                                counters30.comments_in_created_mrs30,
                                previous30.previous_comments_in_created_mrs30
                              ),
                        color:
                          gitStatsTimeframe === 7
                            ? getNegativeColor(
                                counters7.comments_in_created_mrs7,
                                previous7.previous_comments_in_created_mrs7
                              )
                            : getNegativeColor(
                                counters30.comments_in_created_mrs30,
                                previous30.previous_comments_in_created_mrs30
                              ),
                      },
                    ].map((item, index) => (
                      <Box key={index}>
                        <div
                          style={{
                            color: "rgba(32, 32, 32, 0.5)",
                            fontWeight: "400",
                            fontSize: "14px",
                          }}
                        >
                          {item.label}
                        </div>
                        <div
                          style={{
                            fontWeight: "400",
                            fontSize: "40px",
                            lineHeight: "40px",
                          }}
                        >
                          {item.value}
                        </div>
                        <div
                          style={{
                            fontWeight: "400",
                            fontSize: "12px",
                            color: item.color,
                            paddingBottom: "15px",
                          }}
                        >
                          {item.change}
                        </div>
                      </Box>
                    ))}
                  </Box>
                  {/* Right column */}
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center",
                      width: "50%",
                    }}
                  >
                    {[
                      {
                        label: "MR's reviewed",
                        value:
                          gitStatsTimeframe === 7
                            ? counters7.reviewed_mrs_counter7
                            : counters30.reviewed_mrs_counter30,
                        change:
                          gitStatsTimeframe === 7
                            ? calculateChange(
                                counters7.reviewed_mrs_counter7,
                                previous7.previous_reviewed_mrs_counter7
                              )
                            : calculateChange(
                                counters30.reviewed_mrs_counter30,
                                previous30.previous_reviewed_mrs_counter30
                              ),
                        color:
                          gitStatsTimeframe === 7
                            ? getColor(
                                counters7.reviewed_mrs_counter7,
                                previous7.previous_reviewed_mrs_counter7
                              )
                            : getColor(
                                counters30.reviewed_mrs_counter30,
                                previous30.previous_reviewed_mrs_counter30
                              ),
                      },
                      {
                        label: "MR create to merge time",
                        value:
                          gitStatsTimeframe === 7
                            ? `${
                                Math.floor(counters7.create_to_merge7 / 3600) >
                                0
                                  ? `${Math.floor(
                                      counters7.create_to_merge7 / 3600
                                    )} h `
                                  : ""
                              }${
                                Math.floor(
                                  (counters7.create_to_merge7 % 3600) / 60
                                ) > 0
                                  ? `${Math.floor(
                                      (counters7.create_to_merge7 % 3600) / 60
                                    )} min `
                                  : ""
                              }${
                                Math.floor(counters7.create_to_merge7 % 60) > 0
                                  ? `${Math.floor(
                                      counters7.create_to_merge7 % 60
                                    )} sec`
                                  : ""
                              }`
                            : `${
                                Math.floor(
                                  counters30.create_to_merge30 / 3600
                                ) > 0
                                  ? `${Math.floor(
                                      counters30.create_to_merge30 / 3600
                                    )} h `
                                  : ""
                              }${
                                Math.floor(
                                  (counters30.create_to_merge30 % 3600) / 60
                                ) > 0
                                  ? `${Math.floor(
                                      (counters30.create_to_merge30 % 3600) / 60
                                    )} min `
                                  : ""
                              }${
                                Math.floor(counters30.create_to_merge30 % 60) >
                                0
                                  ? `${Math.floor(
                                      counters30.create_to_merge30 % 60
                                    )} sec`
                                  : ""
                              }`,
                        change:
                          gitStatsTimeframe === 7
                            ? calculateChange(
                                counters7.create_to_merge7,
                                previous7.previous_create_to_merge7
                              )
                            : calculateChange(
                                counters30.create_to_merge30,
                                previous30.previous_create_to_merge30
                              ),
                        color:
                          gitStatsTimeframe === 7
                            ? getNegativeColor(
                                counters7.create_to_merge7,
                                previous7.previous_create_to_merge7
                              )
                            : getNegativeColor(
                                counters30.create_to_merge30,
                                previous30.previous_create_to_merge30
                              ),
                      },
                    ].map((item, index) => (
                      <Box key={index}>
                        <div
                          style={{
                            color: "rgba(32, 32, 32, 0.5)",
                            fontWeight: "400",
                            fontSize: "14px",
                          }}
                        >
                          {item.label}
                        </div>
                        <div
                          style={{
                            fontWeight: "400",
                            fontSize:
                              item.label === "MR create to merge time"
                                ? "16px"
                                : "40px",
                            lineHeight: "40px",
                          }}
                        >
                          {item.value}
                        </div>
                        <div
                          style={{
                            fontWeight: "400",
                            fontSize: "12px",
                            color: item.color,
                            paddingBottom: "15px",
                          }}
                        >
                          {item.change}
                        </div>
                      </Box>
                    ))}
                  </Box>
                </Box>
              </Box>

              <Divider orientation="vertical" flexItem />
              <Box
                sx={{
                  width: "60%",
                  maxWidth: "100%",
                  paddingLeft: "10px",
                  overflow: "hidden",
                }}
              >
                <h3 style={{ margin: "0px", padding: "5px" }}>
                  Created and Reviewed MR&apos;s over time
                </h3>
                <Divider sx={{ marginBottom: "10px", width: "60%" }} />
                <Box sx={{ paddingLeft: "5px" }}>
                  {gitStatsTimeframe === 7 ? (
                    <>
                      <BarChart
                        xAxis={[
                          {
                            data: [
                              ...counters7.mrs_created_last_7_days_xAxis,
                              ...counters7.mrs_reviewed_last_7_days_xAxis,
                            ],
                            scaleType: "band",
                          },
                        ]}
                        series={[
                          {
                            id: "created",
                            data: counters7.mrs_created_last_7_days_yAxis,
                            color: "#0451E5",
                            stack: "stack1",
                            label: "created",
                          },
                          {
                            id: "reviewed",
                            data: counters7.mrs_reviewed_last_7_days_yAxis,
                            color: "#EB8A17",
                            stack: "stack1",
                            label: "reviewed",
                          },
                        ]}
                        grid={{ horizontal: true }}
                        slotProps={{
                          legend: {
                            labelStyle: {
                              fontSize: 12,
                            },
                          },
                        }}
                        sx={{
                          "& .MuiChartsLegend-mark": {
                            x: "14px",
                            y: "-2px",
                            width: "8px",
                            height: "8px",
                          },
                        }}
                        height={190}
                      />
                    </>
                  ) : (
                    <>
                      <BarChart
                        xAxis={[
                          {
                            data: [
                              ...counters30.mrs_created_last_30_days_xAxis,
                              ...counters30.mrs_reviewed_last_30_days_xAxis,
                            ],
                            scaleType: "band",
                          },
                        ]}
                        series={[
                          {
                            id: "created",
                            data: counters30.mrs_created_last_30_days_yAxis,
                            color: "#0451E5",
                            stack: "stack1",
                            label: "created",
                          },
                          {
                            id: "reviewed",
                            data: counters30.mrs_reviewed_last_30_days_yAxis,
                            color: "#EB8A17",
                            stack: "stack1",
                            label: "reviewed",
                          },
                        ]}
                        grid={{ horizontal: true }}
                        slotProps={{
                          legend: {
                            labelStyle: {
                              fontSize: 12,
                            },
                          },
                        }}
                        sx={{
                          "& .MuiChartsLegend-mark": {
                            x: "14px",
                            y: "-2px",
                            width: "8px",
                            height: "8px",
                          },
                        }}
                        height={190}
                      />
                    </>
                  )}
                </Box>
              </Box>
            </Box>
          </Card>

          {/* Commits stats */}
          <Card className="card-section">
            <Box
              sx={{
                display: "inline-flex",
                width: "100%",
                margin: "10px",
              }}
            >
              <Box sx={{ width: "40%", paddingRight: "10px" }}>
                <h3
                  style={{ margin: "0px", padding: "5px", textAlign: "left" }}
                >
                  Commited changes
                </h3>
                <Divider
                  sx={{
                    marginBottom: "15px",
                    width: "45%",
                    alignContent: "left",
                  }}
                />
                <Box
                  sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    width: "100%",
                    textAlign: "center", // Align all content
                  }}
                >
                  {/* Left column */}
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center",
                      width: "50%",
                    }}
                  >
                    {[
                      {
                        label: "Lines of code added",
                        value:
                          gitStatsTimeframe === 7
                            ? counters7.lines_added7
                            : counters30.lines_added30,
                        change:
                          gitStatsTimeframe === 7
                            ? calculateChange(
                                counters7.lines_added7,
                                previous7.previous_lines_added7
                              )
                            : calculateChange(
                                counters30.lines_added30,
                                previous30.previous_lines_added30
                              ),
                        color:
                          gitStatsTimeframe === 7
                            ? getColor(
                                counters7.lines_added7,
                                previous7.previous_lines_added7
                              )
                            : getColor(
                                counters30.lines_added30,
                                previous30.previous_lines_added30
                              ),
                      },
                      {
                        label: "Commits Created",
                        value:
                          gitStatsTimeframe === 7
                            ? counters7.created_commits7
                            : counters30.created_commits30,
                        change:
                          gitStatsTimeframe === 7
                            ? calculateChange(
                                counters7.created_commits7,
                                previous7.previous_created_commits7
                              )
                            : calculateChange(
                                counters30.created_commits30,
                                previous30.previous_created_commits30
                              ),
                        color:
                          gitStatsTimeframe === 7
                            ? getColor(
                                counters7.created_commits7,
                                previous7.previous_created_commits7
                              )
                            : getColor(
                                counters30.created_commits30,
                                previous30.previous_created_commits30
                              ),
                      },
                    ].map((item, index) => (
                      <Box key={index}>
                        <div
                          style={{
                            color: "rgba(32, 32, 32, 0.5)",
                            fontWeight: "400",
                            fontSize: "14px",
                          }}
                        >
                          {item.label}
                        </div>
                        <div
                          style={{
                            fontWeight: "400",
                            fontSize: "40px",
                            lineHeight: "40px",
                          }}
                        >
                          {item.value}
                        </div>
                        <div
                          style={{
                            fontWeight: "400",
                            fontSize: "12px",
                            color: item.color,
                            paddingBottom: "15px",
                          }}
                        >
                          {item.change}
                        </div>
                      </Box>
                    ))}
                  </Box>
                  {/* Right column */}
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center",
                      width: "50%",
                    }}
                  >
                    {[
                      {
                        label: "Lines of Code Deleted",
                        value:
                          gitStatsTimeframe === 7
                            ? counters7.lines_removed7
                            : counters30.lines_removed30,
                        change:
                          gitStatsTimeframe === 7
                            ? calculateChange(
                                counters7.lines_removed7,
                                previous7.previous_lines_removed7
                              )
                            : calculateChange(
                                counters30.lines_removed30,
                                previous30.previous_lines_removed30
                              ),
                        color:
                          gitStatsTimeframe === 7
                            ? getNegativeColor(
                                counters7.lines_removed7,
                                previous7.previous_lines_removed7
                              )
                            : getNegativeColor(
                                counters30.lines_removed30,
                                previous30.previous_lines_removed30
                              ),
                      },
                      {
                        label: "Commits Frequency",
                        value:
                          gitStatsTimeframe === 7
                            ? `~ ${counters7.commits_frequency7} per day`
                            : `~ ${counters30.commits_frequency30} per day`,
                        change:
                          gitStatsTimeframe === 7
                            ? calculateChange(
                                counters7.commits_frequency7,
                                previous7.previous_commits_frequency7
                              )
                            : calculateChange(
                                counters30.commits_frequency30,
                                previous30.previous_commits_frequency30
                              ),
                        color:
                          gitStatsTimeframe === 7
                            ? getColor(
                                counters7.commits_frequency7,
                                previous7.previous_commits_frequency7
                              )
                            : getColor(
                                counters30.commits_frequency30,
                                previous30.previous_commits_frequency30
                              ),
                      },
                    ].map((item, index) => (
                      <Box key={index}>
                        <div
                          style={{
                            color: "rgba(32, 32, 32, 0.5)",
                            fontWeight: "400",
                            fontSize: "14px",
                          }}
                        >
                          {item.label}
                        </div>
                        <div
                          style={{
                            fontWeight: "400",
                            fontSize:
                              item.label === "Commits Frequency"
                                ? "16px"
                                : "40px",
                            lineHeight: "40px",
                          }}
                        >
                          {item.value}
                        </div>
                        <div
                          style={{
                            fontWeight: "400",
                            fontSize: "12px",
                            color: item.color,
                            paddingBottom: "15px",
                          }}
                        >
                          {item.change}
                        </div>
                      </Box>
                    ))}
                  </Box>
                </Box>
              </Box>

              <Divider orientation="vertical" flexItem />
              <Box sx={{ width: "60%", paddingLeft: "10px" }}>
                <h3 style={{ margin: "0px", padding: "5px" }}>
                  Lines of Code changed over time
                </h3>
                <Divider sx={{ marginBottom: "10px", width: "60%" }} />
                <Box sx={{ paddingLeft: "5px" }}>
                  {gitStatsTimeframe === 7 ? (
                    <>
                      <BarChart
                        xAxis={[
                          {
                            data: [
                              ...counters7.mrs_reviewed_last_7_days_xAxis,
                              ...counters7.mrs_reviewed_last_7_days_xAxis,
                            ],
                            scaleType: "band",
                          },
                        ]}
                        yAxis={[
                          {
                            min: Math.min(
                              ...counters7.commits_added_lines_last_7_days_yAxis,
                              ...counters7.commits_removed_lines_last_7_days_yAxis
                            ), // Minimum value from both datasets
                            max: Math.max(
                              ...counters7.commits_added_lines_last_7_days_yAxis,
                              ...counters7.commits_removed_lines_last_7_days_yAxis
                            ), // Maximum value from both datasets
                          },
                        ]}
                        series={[
                          {
                            id: "added",
                            data: counters7.commits_added_lines_last_7_days_yAxis,
                            color: "#0451E5",
                            stack: "stack1",
                            label: "added",
                          },
                          {
                            id: "removed",
                            data: counters7.commits_removed_lines_last_7_days_yAxis,
                            color: "#1D212F",
                            stack: "stack1",
                            label: "removed",
                          },
                        ]}
                        grid={{ horizontal: true }}
                        slotProps={{
                          legend: {
                            labelStyle: {
                              fontSize: 12,
                            },
                          },
                        }}
                        sx={{
                          "& .MuiChartsLegend-mark": {
                            x: "14px",
                            y: "-2px",
                            width: "8px",
                            height: "8px",
                          },
                        }}
                        height={190}
                      />
                    </>
                  ) : (
                    <>
                      <BarChart
                        xAxis={[
                          {
                            data: [
                              ...counters30.mrs_reviewed_last_30_days_xAxis,
                              ...counters30.mrs_reviewed_last_30_days_xAxis,
                            ],
                            scaleType: "band",
                          },
                        ]}
                        yAxis={[
                          {
                            min: Math.min(
                              ...counters30.commits_added_lines_last_30_days_yAxis,
                              ...counters30.commits_removed_lines_last_30_days_yAxis
                            ), // Minimum value from both datasets
                            max: Math.max(
                              ...counters30.commits_added_lines_last_30_days_yAxis,
                              ...counters30.commits_removed_lines_last_30_days_yAxis
                            ), // Maximum value from both datasets
                          },
                        ]}
                        series={[
                          {
                            id: "added",
                            data: counters30.commits_added_lines_last_30_days_yAxis,
                            color: "#0451E5",
                            stack: "stack1",
                            label: "added",
                            baseline: 0,
                          },
                          {
                            id: "removed",
                            data: counters30.commits_removed_lines_last_30_days_yAxis,
                            color: "#1D212F",
                            stack: "stack1",
                            label: "removed",
                            baseline: 0,
                          },
                        ]}
                        grid={{ horizontal: true }}
                        slotProps={{
                          legend: {
                            labelStyle: {
                              fontSize: 12,
                            },
                          },
                        }}
                        sx={{
                          "& .MuiChartsLegend-mark": {
                            x: "14px",
                            y: "-2px",
                            width: "8px",
                            height: "8px",
                          },
                        }}
                        height={190}
                      />
                    </>
                  )}
                </Box>
              </Box>
            </Box>
          </Card>
        </Box>
      ) : (
        <Card>
          <>Loading...</>
        </Card>
      )}
    </Box>
  );
};
