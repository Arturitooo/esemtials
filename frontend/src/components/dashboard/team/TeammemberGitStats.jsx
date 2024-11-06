import React, { useState, useEffect } from "react";
import AxiosInstance from "../../AxiosInstance";

import { Box } from "@mui/material";
import Card from "@mui/material/Card";
import Divider from "@mui/material/Divider";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";

export const TeammemberGitStats = ({ teammember }) => {
  const [codingData, setCodingData] = useState(null);
  const [gitStatsTimeframe, setGitStatsTimeframe] = useState(() => {
    // Initialize with localStorage or fallback to 7
    return Number(localStorage.getItem("gitStatsTimeframe")) || 7;
  });
  const successColor = "#42BC09";
  const errorColor = "#d10000";

  useEffect(() => {
    GetGitData(teammember);
  }, [teammember]);

  const GetGitData = (teammember_id) => {
    const url = `team/teammember-coding-stats/${teammember_id}/`;
    AxiosInstance.get(url).then((res) => {
      const data = res.data;
      setCodingData(data);
    });
  };

  const handleToggleChange = (event, newAlignment) => {
    if (newAlignment !== null) {
      // Prevent setting null
      setGitStatsTimeframe(newAlignment);
      localStorage.setItem("gitStatsTimeframe", newAlignment); // Keep localStorage updated
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
            <ToggleButton value={31}>31 days</ToggleButton>
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
                    12
                  </div>
                  <div
                    style={{
                      margin: "auto",
                      fontWeight: "400",
                      fontSize: "14px",
                      color: errorColor, // or successColor
                    }}
                  >
                    -50%
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
                    <li>
                      <a
                        href="repo address"
                        style={{
                          textDecoration: "underline",
                          color: "rgba(0, 0, 0, 0.87)",
                        }}
                        target="_blank"
                      >
                        link content
                      </a>
                    </li>
                    <li>
                      <a
                        href="repo 2 address 2"
                        style={{
                          textDecoration: "underline",
                          color: "rgba(0, 0, 0, 0.87)",
                        }}
                        target="_blank"
                      >
                        link 2 content 2
                      </a>
                    </li>
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
                <h3 style={{ margin: "0px", padding: "5px" }}>
                  Merge requests
                </h3>
                <Divider sx={{ marginBottom: "10px", width: "40%" }} />
                <Box
                  sx={{
                    display: "inline-flex",
                    flexWrap: "wrap",
                    width: "100%",
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
                    <Box>
                      <div
                        style={{
                          margin: "auto",
                          color: "rgba(32, 32, 32, 0.5)",
                          fontWeight: "400",
                          fontSize: "14px",
                        }}
                      >
                        MR&apos;s created
                      </div>
                      <div
                        style={{
                          display: "table",
                          margin: "auto",
                          fontWeight: "400",
                          fontSize: "40px",
                          lineHeight: "40px",
                        }}
                      >
                        37
                        {/* {JSON.stringify(codingData.counters7)} */}
                      </div>
                      <div
                        style={{
                          display: "table",
                          margin: "auto",
                          fontWeight: "400",
                          fontSize: "12px",
                          color: errorColor, // or successColor
                          paddingBottom: "15px",
                        }}
                      >
                        -50%
                      </div>
                    </Box>

                    <Box>
                      <div
                        style={{
                          margin: "auto",
                          color: "rgba(32, 32, 32, 0.5)",
                          fontWeight: "400",
                          fontSize: "14px",
                        }}
                      >
                        MR&apos;s reviewed
                      </div>
                      <div
                        style={{
                          display: "table",
                          margin: "auto",
                          fontWeight: "400",
                          fontSize: "40px",
                          lineHeight: "40px",
                        }}
                      >
                        51
                      </div>
                      <div
                        style={{
                          display: "table",
                          margin: "auto",
                          fontWeight: "400",
                          fontSize: "12px",
                          color: successColor, // or successColor
                        }}
                      >
                        +8%
                      </div>
                    </Box>
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
                    <Box>
                      <div
                        style={{
                          margin: "auto",
                          color: "rgba(32, 32, 32, 0.5)",
                          fontWeight: "400",
                          fontSize: "14px",
                        }}
                      >
                        MR Creation to merge time
                      </div>
                      <div
                        style={{
                          display: "table",
                          margin: "auto",
                          fontWeight: "400",
                          fontSize: "16px",
                        }}
                      >
                        <ul
                          style={{
                            margin: "0px",
                            paddingLeft: "00px",
                            fontSize: "14px",
                            lineHeight: "40px",
                          }}
                        >
                          3 days, 20 minutes
                        </ul>
                      </div>
                      <div
                        style={{
                          display: "table",
                          margin: "auto",
                          fontWeight: "400",
                          fontSize: "12px",
                          color: errorColor, // or successColor
                          paddingBottom: "15px",
                        }}
                      >
                        -17%
                      </div>
                    </Box>

                    <Box>
                      <div
                        style={{
                          margin: "auto",
                          color: "rgba(32, 32, 32, 0.5)",
                          fontWeight: "400",
                          fontSize: "15px",
                        }}
                      >
                        CR comments received
                      </div>
                      <div
                        style={{
                          display: "table",
                          margin: "auto",
                          fontWeight: "400",
                          fontSize: "40px",
                          lineHeight: "40px",
                        }}
                      >
                        86
                      </div>
                      <div
                        style={{
                          display: "table",
                          margin: "auto",
                          fontWeight: "400",
                          fontSize: "14px",
                          color: successColor, // or successColor
                        }}
                      >
                        -12%
                      </div>
                    </Box>
                  </Box>
                </Box>
              </Box>
              <Divider orientation="vertical" flexItem />
              <Box sx={{ width: "60%", paddingLeft: "10px" }}>
                <h3 style={{ margin: "0px", padding: "5px" }}>
                  Number of MR&apos;s over time
                </h3>
                <Divider sx={{ marginBottom: "10px", width: "40%" }} />
                <Box sx={{ paddingLeft: "5px" }}>XYZ</Box>
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
                <h3 style={{ margin: "0px", padding: "5px" }}>
                  Commited changes
                </h3>
                <Divider sx={{ marginBottom: "10px", width: "45%" }} />
                <Box
                  sx={{
                    display: "inline-flex",
                    flexWrap: "wrap",
                    width: "100%",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center",
                      width: "50%",
                    }}
                  >
                    <Box>
                      <div
                        style={{
                          margin: "auto",
                          color: "rgba(32, 32, 32, 0.5)",
                          fontWeight: "400",
                          fontSize: "14px",
                        }}
                      >
                        Lines of code added
                      </div>
                      <div
                        style={{
                          display: "table",
                          margin: "auto",
                          fontWeight: "400",
                          fontSize: "40px",
                          lineHeight: "40px",
                        }}
                      >
                        9637
                        {/* {JSON.stringify(codingData.counters7)} */}
                      </div>
                      <div
                        style={{
                          display: "table",
                          margin: "auto",
                          fontWeight: "400",
                          fontSize: "12px",
                          color: errorColor, // or successColor
                          paddingBottom: "15px",
                        }}
                      >
                        -50%
                      </div>
                    </Box>

                    <Box>
                      <div
                        style={{
                          margin: "auto",
                          color: "rgba(32, 32, 32, 0.5)",
                          fontWeight: "400",
                          fontSize: "14px",
                        }}
                      >
                        Lines of Code Deleted
                      </div>
                      <div
                        style={{
                          display: "table",
                          margin: "auto",
                          fontWeight: "400",
                          fontSize: "40px",
                          lineHeight: "40px",
                        }}
                      >
                        851
                      </div>
                      <div
                        style={{
                          display: "table",
                          margin: "auto",
                          fontWeight: "400",
                          fontSize: "12px",
                          color: successColor, // or successColor
                        }}
                      >
                        -3%
                      </div>
                    </Box>
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center",
                      width: "50%",
                    }}
                  >
                    <Box>
                      <div
                        style={{
                          margin: "auto",
                          color: "rgba(32, 32, 32, 0.5)",
                          fontWeight: "400",
                          fontSize: "15px",
                        }}
                      >
                        Commits Created
                      </div>
                      <div
                        style={{
                          display: "table",
                          margin: "auto",
                          fontWeight: "400",
                          fontSize: "40px",
                          lineHeight: "40px",
                        }}
                      >
                        150
                      </div>
                      <div
                        style={{
                          display: "table",
                          margin: "auto",
                          fontWeight: "400",
                          fontSize: "14px",
                          color: successColor, // or successColor
                          paddingBottom: "15px",
                        }}
                      >
                        +10%
                      </div>
                    </Box>
                    <Box>
                      <div
                        style={{
                          margin: "auto",
                          color: "rgba(32, 32, 32, 0.5)",
                          fontWeight: "400",
                          fontSize: "14px",
                        }}
                      >
                        Commits Frequency
                      </div>
                      <div
                        style={{
                          display: "table",
                          margin: "auto",
                          fontWeight: "400",
                          fontSize: "16px",
                        }}
                      >
                        <ul
                          style={{
                            margin: "0px",
                            paddingLeft: "00px",
                            fontSize: "14px",
                            lineHeight: "40px",
                          }}
                        >
                          ~2,5 commits per day
                        </ul>
                      </div>
                      <div
                        style={{
                          display: "table",
                          margin: "auto",
                          fontWeight: "400",
                          fontSize: "12px",
                          color: errorColor, // or successColor
                        }}
                      >
                        -17%
                      </div>
                    </Box>
                  </Box>
                </Box>
              </Box>
              <Divider orientation="vertical" flexItem />
              <Box sx={{ width: "60%", paddingLeft: "10px" }}>
                <h3 style={{ margin: "0px", padding: "5px" }}>
                  Lines of Code changed over time
                </h3>
                <Divider sx={{ marginBottom: "10px", width: "50%" }} />
                <Box sx={{ paddingLeft: "5px" }}>XYZ 2</Box>
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
