import React, { useState, useEffect } from "react";
import AxiosInstance from "../../AxiosInstance";

import { Box, CircularProgress, Divider } from "@mui/material";
import Card from "@mui/material/Card";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";

import HighchartsReact from "highcharts-react-official";
import Highcharts from "highcharts";

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
  const [loading, setLoading] = useState(true);

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
      setLoading(false);
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

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

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
              <Box sx={{ width: "30%", paddingRight: "10px" }}>
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
                  <Box
                    sx={{
                      display: "inline-flex",
                      alignItems: "center", // Vertically centers content
                      justifyContent: "center", // Horizontally centers content within the Box
                      paddingBottom: "10px",
                    }}
                  >
                    <div
                      style={{
                        fontWeight: "400",
                        fontSize: "40px",
                        lineHeight: "25px", // Matches height proportionally for the font size
                        textAlign: "center",
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
                        fontWeight: "400",
                        fontSize: "14px",
                        lineHeight: "14px", // Matches font size for proper vertical centering
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
                        marginLeft: "5px", // Ensures spacing between value and change
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
              </Box>
              <Divider orientation="vertical" flexItem />
              <Box sx={{ width: "70%", paddingLeft: "10px" }}>
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
              <Box sx={{ width: "30%", paddingRight: "10px" }}>
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
                    flexDirection: "column",
                    width: "100%",
                    textAlign: "center",
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
                              Math.floor(counters7.create_to_merge7 / 3600) > 0
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
                              Math.floor(counters30.create_to_merge30 / 3600) >
                              0
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
                              Math.floor(counters30.create_to_merge30 % 60) > 0
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
                      <Box
                        sx={{
                          display: "inline-flex",
                          alignItems: "center", // Vertically centers content
                          justifyContent: "center", // Horizontally centers content within the Box
                          paddingBottom: "10px",
                        }}
                      >
                        <div
                          style={{
                            fontWeight: "400",
                            fontSize:
                              item.label === "MR create to merge time"
                                ? "14px"
                                : "30px",
                            lineHeight: "25px",
                            textAlign: "center", // Ensures item.value is centered in its container
                          }}
                        >
                          {item.value}
                        </div>
                        <div
                          style={{
                            fontWeight: "400",
                            fontSize: "10px",
                            color: item.color,
                            marginLeft: "5px", // Adds a small gap between item.value and item.change
                          }}
                        >
                          {item.change}
                        </div>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Box>

              <Divider orientation="vertical" flexItem />
              <Box
                sx={{
                  width: "70%",
                  maxWidth: "100%",
                  paddingLeft: "15px",
                  paddingRight: "30px",
                  overflow: "hidden",
                }}
              >
                <HighchartsReact
                  highcharts={Highcharts}
                  options={{
                    chart: {
                      type: "column",
                      height: 270, // Set height as per your requirement
                    },
                    title: {
                      text: "MR's over time",
                      align: "left",
                      style: {
                        fontFamily: '"Ubuntu", sans-serif',
                        fontWeight: 400,
                        fontSize: "17px",
                      },
                    },
                    credits: {
                      enabled: false,
                    },
                    xAxis: {
                      categories:
                        gitStatsTimeframe === 7
                          ? counters7.charts_last_7_days_xAxis
                          : counters30.charts_last_30_days_xAxis,
                      title: {
                        text: "",
                      },
                      labels: {
                        rotation: 0,
                        style: {
                          fontFamily: '"Ubuntu", sans-serif',
                          fontSize: "12px",
                        },
                        staggerLines: 1,
                      },
                      tickInterval: gitStatsTimeframe === 30 ? 5 : 1,
                    },
                    yAxis: {
                      min: 0,
                      title: {
                        text: "",
                      },
                      labels: {
                        style: {
                          fontFamily: '"Ubuntu", sans-serif',
                          fontSize: "12px",
                        },
                      },
                      tickInterval: 2,
                    },
                    series: [
                      {
                        name: "Reviewed",
                        data:
                          gitStatsTimeframe === 7
                            ? counters7.mrs_reviewed_last_7_days_yAxis
                            : counters30.mrs_reviewed_last_30_days_yAxis,
                        color: "#EB8A17",
                      },
                      {
                        name: "Created",
                        data:
                          gitStatsTimeframe === 7
                            ? counters7.mrs_created_last_7_days_yAxis
                            : counters30.mrs_created_last_30_days_yAxis,
                        color: "#0451E5",
                      },
                    ],
                    legend: {
                      enabled: true,
                      itemStyle: {
                        fontSize: "12px",
                      },
                    },
                    tooltip: {
                      pointFormat: "{series.name}: <b>{point.y}</b>",
                    },
                    plotOptions: {
                      column: {
                        stacking: "normal", // Enable stacking of bars
                      },
                    },
                  }}
                />
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
              <Box
                sx={{
                  width: "30%",
                  paddingRight: "10px",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
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
                    flexDirection: "column",
                    width: "80%",
                    marginLeft: "10%",
                    alignItems: "center",
                    textAlign: "center",
                    flexGrow: 1,
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
                      <Box
                        sx={{
                          display: "inline-flex",
                          alignItems: "center", // Vertically centers content
                          justifyContent: "center", // Horizontally centers content within the Box
                          paddingBottom: "10px",
                        }}
                      >
                        <div
                          style={{
                            fontWeight: "400",
                            fontSize:
                              item.label === "Commits Frequency"
                                ? "14px"
                                : "30px",
                            lineHeight: "25px",
                            textAlign: "center", // Ensures item.value is centered in its container
                          }}
                        >
                          {item.value}
                        </div>
                        <div
                          style={{
                            fontWeight: "400",
                            fontSize: "10px",
                            color: item.color,
                            marginLeft: "5px", // Adds a small gap between item.value and item.change
                          }}
                        >
                          {item.change}
                        </div>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Box>

              <Divider orientation="vertical" flexItem />
              {/* TODO - chagne the chart */}
              <Box
                sx={{ width: "70%", paddingLeft: "15px", paddingRight: "25px" }}
              >
                {gitStatsTimeframe === 7 ? (
                  <HighchartsReact
                    highcharts={Highcharts}
                    options={{
                      chart: {
                        type: "scatter",
                        height: 270,
                      },
                      title: {
                        text: "Lines of Code over time",
                        align: "left",
                        style: {
                          fontFamily: '"Ubuntu", sans-serif',
                          fontWeight: 400,
                          fontSize: "17px",
                        },
                      },
                      credits: {
                        enabled: false,
                      },
                      xAxis: {
                        categories: counters7.charts_last_7_days_xAxis,
                        title: {
                          text: "",
                        },
                        labels: {
                          style: {
                            fontFamily: '"Ubuntu", sans-serif',
                            fontSize: "12px",
                          },
                          staggerLines: 1,
                        },
                      },
                      yAxis: {
                        min: Math.min(
                          ...counters7.commits_added_lines_last_7_days_yAxis,
                          ...counters7.commits_removed_lines_last_7_days_yAxis
                        ),
                        max: Math.max(
                          ...counters7.commits_added_lines_last_7_days_yAxis,
                          ...counters7.commits_removed_lines_last_7_days_yAxis
                        ),
                        title: {
                          text: "",
                        },
                        labels: {
                          style: {
                            fontFamily: '"Ubuntu", sans-serif',
                            fontSize: "12px",
                          },
                        },
                      },
                      series: [
                        {
                          name: "Added",
                          data: counters7.commits_added_lines_last_7_days_yAxis,
                          color: "#0451E5",
                          stacking: "normal",
                        },
                        {
                          name: "Removed",
                          data: counters7.commits_removed_lines_last_7_days_yAxis,
                          color: "#1D212F",
                          stacking: "normal",
                        },
                      ],
                      legend: {
                        enabled: true,
                        itemStyle: {
                          fontSize: "12px",
                        },
                      },
                      tooltip: {
                        pointFormat: "{series.name}: <b>{point.y}</b>",
                      },
                    }}
                  />
                ) : (
                  <HighchartsReact
                    highcharts={Highcharts}
                    options={{
                      chart: {
                        type: "scatter", // Use a column chart similar to the BarChart
                        height: 270, // Keep the height the same
                      },
                      title: {
                        text: "Lines of Code change",
                        align: "left",
                        style: {
                          fontFamily: '"Ubuntu", sans-serif',
                          fontWeight: 400,
                          fontSize: "17px",
                        },
                      },
                      xAxis: {
                        categories: counters30.charts_last_30_days_xAxis,
                        title: {
                          text: "",
                        },
                        labels: {
                          style: {
                            fontFamily: '"Ubuntu", sans-serif',
                            fontSize: "12px",
                          },
                          staggerLines: 1,
                        },
                        tickInterval: gitStatsTimeframe === 30 ? 5 : 1,
                      },
                      yAxis: {
                        min: Math.min(
                          ...counters30.commits_added_lines_last_30_days_yAxis,
                          ...counters30.commits_removed_lines_last_30_days_yAxis
                        ),
                        max: Math.max(
                          ...counters30.commits_added_lines_last_30_days_yAxis,
                          ...counters30.commits_removed_lines_last_30_days_yAxis
                        ),
                        title: {
                          text: "",
                        },
                      },
                      series: [
                        {
                          name: "Added",
                          data: counters30.commits_added_lines_last_30_days_yAxis,
                          color: "#0451E5",
                          stacking: "normal",
                        },
                        {
                          name: "Removed",
                          data: counters30.commits_removed_lines_last_30_days_yAxis,
                          color: "#1D212F",
                          stacking: "normal",
                        },
                      ],
                      legend: {
                        enabled: true,
                        itemStyle: {
                          fontSize: "12px",
                        },
                      },
                      tooltip: {
                        pointFormat: "{series.name}: <b>{point.y}</b>",
                      },
                    }}
                  />
                )}
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
              <Box
                sx={{
                  width: "30%",
                  paddingRight: "10px",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
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
                    display: "flex",
                    flexDirection: "column",
                    width: "80%",
                    marginLeft: "10%",
                    alignItems: "center",
                    textAlign: "center",
                    flexGrow: 1,
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
                      <Box
                        sx={{
                          display: "inline-flex",
                          alignItems: "center", // Vertically centers content
                          justifyContent: "center", // Horizontally centers content within the Box
                          paddingBottom: "10px",
                        }}
                      >
                        <div
                          style={{
                            fontWeight: "400",
                            fontSize: "30px",
                            lineHeight: "25px",
                            textAlign: "center", // Ensures item.value is centered in its container
                          }}
                        >
                          {item.value}
                        </div>
                        <div
                          style={{
                            fontWeight: "400",
                            fontSize: "10px",
                            color: item.color,
                            marginLeft: "5px", // Adds a small gap between item.value and item.change
                          }}
                        >
                          {item.change}
                        </div>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Box>

              <Divider orientation="vertical" flexItem />
              <Box
                sx={{ width: "70%", paddingLeft: "15px", paddingRight: "25px" }}
              >
                {gitStatsTimeframe === 7 ? (
                  <HighchartsReact
                    highcharts={Highcharts}
                    options={{
                      chart: {
                        type: "column",
                        height: 270,
                      },
                      title: {
                        text: "Lines of Code over time",
                        align: "left",
                        style: {
                          fontFamily: '"Ubuntu", sans-serif',
                          fontWeight: 400,
                          fontSize: "17px",
                        },
                      },
                      credits: {
                        enabled: false,
                      },
                      xAxis: {
                        categories: counters7.charts_last_7_days_xAxis,
                        title: {
                          text: "",
                        },
                        labels: {
                          style: {
                            fontFamily: '"Ubuntu", sans-serif',
                            fontSize: "12px",
                          },
                          staggerLines: 1,
                        },
                      },
                      yAxis: {
                        min: Math.min(
                          ...counters7.commits_added_lines_last_7_days_yAxis,
                          ...counters7.commits_removed_lines_last_7_days_yAxis
                        ),
                        max: Math.max(
                          ...counters7.commits_added_lines_last_7_days_yAxis,
                          ...counters7.commits_removed_lines_last_7_days_yAxis
                        ),
                        title: {
                          text: "",
                        },
                        labels: {
                          style: {
                            fontFamily: '"Ubuntu", sans-serif',
                            fontSize: "12px",
                          },
                        },
                      },
                      series: [
                        {
                          name: "Added",
                          data: counters7.commits_added_lines_last_7_days_yAxis,
                          color: "#0451E5",
                          stacking: "normal",
                        },
                        {
                          name: "Removed",
                          data: counters7.commits_removed_lines_last_7_days_yAxis,
                          color: "#1D212F",
                          stacking: "normal",
                        },
                      ],
                      legend: {
                        enabled: true,
                        itemStyle: {
                          fontSize: "12px",
                        },
                      },
                      tooltip: {
                        pointFormat: "{series.name}: <b>{point.y}</b>",
                      },
                    }}
                  />
                ) : (
                  <HighchartsReact
                    highcharts={Highcharts}
                    options={{
                      chart: {
                        type: "column", // Use a column chart similar to the BarChart
                        height: 270, // Keep the height the same
                      },
                      title: {
                        text: "Lines of Code change",
                        align: "left",
                        style: {
                          fontFamily: '"Ubuntu", sans-serif',
                          fontWeight: 400,
                          fontSize: "17px",
                        },
                      },
                      xAxis: {
                        categories: counters30.charts_last_30_days_xAxis,
                        title: {
                          text: "",
                        },
                        labels: {
                          style: {
                            fontFamily: '"Ubuntu", sans-serif',
                            fontSize: "12px",
                          },
                          staggerLines: 1,
                        },
                        tickInterval: gitStatsTimeframe === 30 ? 5 : 1,
                      },
                      yAxis: {
                        min: Math.min(
                          ...counters30.commits_added_lines_last_30_days_yAxis,
                          ...counters30.commits_removed_lines_last_30_days_yAxis
                        ),
                        max: Math.max(
                          ...counters30.commits_added_lines_last_30_days_yAxis,
                          ...counters30.commits_removed_lines_last_30_days_yAxis
                        ),
                        title: {
                          text: "",
                        },
                      },
                      series: [
                        {
                          name: "Added",
                          data: counters30.commits_added_lines_last_30_days_yAxis,
                          color: "#0451E5",
                          stacking: "normal",
                        },
                        {
                          name: "Removed",
                          data: counters30.commits_removed_lines_last_30_days_yAxis,
                          color: "#1D212F",
                          stacking: "normal",
                        },
                      ],
                      legend: {
                        enabled: true,
                        itemStyle: {
                          fontSize: "12px",
                        },
                      },
                      tooltip: {
                        pointFormat: "{series.name}: <b>{point.y}</b>",
                      },
                    }}
                  />
                )}
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
