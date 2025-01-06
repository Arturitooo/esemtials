import React, { useState, useEffect } from "react";
import AxiosInstance from "../../AxiosInstance";

import { Box } from "@mui/material";
import Card from "@mui/material/Card";
import Divider from "@mui/material/Divider";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import { BarChart } from "@mui/x-charts/BarChart";
import { ScatterChart } from "@mui/x-charts/ScatterChart";

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

  const chartData = [
    {
      id: "data-0",
      x1: 329.39,
      x2: 391.29,
      y1: 443.28,
      y2: 153.9,
    },
    {
      id: "data-1",
      x1: 96.94,
      x2: 139.6,
      y1: 110.5,
      y2: 217.8,
    },
    {
      id: "data-2",
      x1: 336.35,
      x2: 282.34,
      y1: 175.23,
      y2: 286.32,
    },
    {
      id: "data-3",
      x1: 159.44,
      x2: 384.85,
      y1: 195.97,
      y2: 325.12,
    },
    {
      id: "data-4",
      x1: 188.86,
      x2: 182.27,
      y1: 351.77,
      y2: 144.58,
    },
    {
      id: "data-5",
      x1: 143.86,
      x2: 360.22,
      y1: 43.253,
      y2: 146.51,
    },
    {
      id: "data-6",
      x1: 202.02,
      x2: 209.5,
      y1: 376.34,
      y2: 309.69,
    },
    {
      id: "data-7",
      x1: 384.41,
      x2: 258.93,
      y1: 31.514,
      y2: 236.38,
    },
    {
      id: "data-8",
      x1: 256.76,
      x2: 70.571,
      y1: 231.31,
      y2: 440.72,
    },
    {
      id: "data-9",
      x1: 143.79,
      x2: 419.02,
      y1: 108.04,
      y2: 20.29,
    },
    {
      id: "data-10",
      x1: 103.48,
      x2: 15.886,
      y1: 321.77,
      y2: 484.17,
    },
    {
      id: "data-11",
      x1: 272.39,
      x2: 189.03,
      y1: 120.18,
      y2: 54.962,
    },
    {
      id: "data-12",
      x1: 23.57,
      x2: 456.4,
      y1: 366.2,
      y2: 418.5,
    },
    {
      id: "data-13",
      x1: 219.73,
      x2: 235.96,
      y1: 451.45,
      y2: 181.32,
    },
    {
      id: "data-14",
      x1: 54.99,
      x2: 434.5,
      y1: 294.8,
      y2: 440.9,
    },
    {
      id: "data-15",
      x1: 134.13,
      x2: 383.8,
      y1: 121.83,
      y2: 273.52,
    },
    {
      id: "data-16",
      x1: 12.7,
      x2: 270.8,
      y1: 287.7,
      y2: 346.7,
    },
    {
      id: "data-17",
      x1: 176.51,
      x2: 119.17,
      y1: 134.06,
      y2: 74.528,
    },
    {
      id: "data-18",
      x1: 65.05,
      x2: 78.93,
      y1: 104.5,
      y2: 150.9,
    },
    {
      id: "data-19",
      x1: 162.25,
      x2: 63.707,
      y1: 413.07,
      y2: 26.483,
    },
    {
      id: "data-20",
      x1: 68.88,
      x2: 150.8,
      y1: 74.68,
      y2: 333.2,
    },
    {
      id: "data-21",
      x1: 95.29,
      x2: 329.1,
      y1: 360.6,
      y2: 422.0,
    },
    {
      id: "data-22",
      x1: 390.62,
      x2: 10.01,
      y1: 330.72,
      y2: 488.06,
    },
  ];

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
                  MR&apos;s over time
                </h3>
                <Divider sx={{ marginBottom: "10px", width: "20%" }} />
                <Box sx={{ paddingLeft: "5px" }}>
                  {gitStatsTimeframe === 7 ? (
                    <>
                      <BarChart
                        xAxis={[
                          {
                            data: [
                              ...counters7.charts_last_7_days_xAxis,
                              ...counters7.charts_last_7_days_xAxis,
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
                              ...counters30.charts_last_30_days_xAxis,
                              ...counters30.charts_last_30_days_xAxis,
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
                    display: "inline-flex",
                    width: "80%",
                    marginLeft: "10%",
                    justifyContent: "space-between", // Space between items
                    marginTop: "10%",
                    alignItems: "center", // Vertically align items to the center
                    gap: "20px", // Add space between items
                    textAlign: "center", // Align all content
                  }}
                >
                  {[
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

              <Divider orientation="vertical" flexItem />
              {/* TODO - chagne the chart */}
              <Box sx={{ width: "60%", paddingLeft: "10px" }}>
                <h3 style={{ margin: "0px", padding: "5px" }}>
                  Time of commits
                </h3>
                <Divider sx={{ marginBottom: "10px", width: "20%" }} />
                <Box sx={{ paddingLeft: "5px" }}>
                  {gitStatsTimeframe === 7 ? (
                    <>
                      <ScatterChart
                        height={190}
                        series={[
                          {
                            data: chartData.map((v) => ({
                              x: v.x1,
                              y: v.y1,
                              id: v.id,
                            })),
                          },
                        ]}
                      />
                    </>
                  ) : (
                    <>
                      <ScatterChart
                        height={190}
                        series={[
                          {
                            data: chartData.map((v) => ({
                              x: v.x1,
                              y: v.y1,
                              id: v.id,
                            })),
                          },
                        ]}
                      />
                    </>
                  )}
                </Box>
              </Box>
            </Box>
          </Card>

          {/* Lines of code stats */}
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
                  Lines of Code change
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
                    display: "inline-flex",
                    width: "80%",
                    marginLeft: "10%",
                    justifyContent: "space-between", // Space between items
                    marginTop: "10%",
                    alignItems: "center", // Vertically align items to the center
                    gap: "20px", // Add space between items
                    textAlign: "center", // Align all content
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
              </Box>

              <Divider orientation="vertical" flexItem />
              <Box sx={{ width: "60%", paddingLeft: "10px" }}>
                <h3 style={{ margin: "0px", padding: "5px" }}>
                  Code change over time
                </h3>
                <Divider sx={{ marginBottom: "10px", width: "40%" }} />
                <Box sx={{ paddingLeft: "5px" }}>
                  {gitStatsTimeframe === 7 ? (
                    <>
                      <BarChart
                        xAxis={[
                          {
                            data: [
                              ...counters7.charts_last_7_days_xAxis,
                              ...counters7.charts_last_7_days_xAxis,
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
                              ...counters30.charts_last_30_days_xAxis,
                              ...counters30.charts_last_30_days_xAxis,
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
