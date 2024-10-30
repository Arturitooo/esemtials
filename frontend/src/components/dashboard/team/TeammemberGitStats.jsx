import React, { useState, useEffect } from "react";
import AxiosInstance from "../../AxiosInstance";

import { Box } from "@mui/material";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";

export const TeammemberGitStats = ({ teammember }) => {
  const [codingData, setCodingData] = useState(null);

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

  return (
    <Box
      sx={{
        maxWidth: "100%", // Limit width to container
        overflowX: "auto", // Enable horizontal scrolling if needed
        whiteSpace: "pre-wrap", // Wrap long text to avoid overflow
        wordBreak: "break-word", // Break long words to fit within container
      }}
    >
      <h2>Coding Stats</h2>
      <div>
        <Card className="card-section">
          <CardContent>
            {codingData ? (
              <>{JSON.stringify(codingData.counters7)}</>
            ) : (
              <>Loading...</>
            )}
          </CardContent>
        </Card>
      </div>
    </Box>
  );
};
