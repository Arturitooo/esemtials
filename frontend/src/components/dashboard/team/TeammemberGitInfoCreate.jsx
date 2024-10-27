import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useLocation } from "react-router-dom";
import AxiosInstance from "../../AxiosInstance";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Box, Button, CircularProgress, Modal } from "@mui/material";

import { MyTextField } from "../../forms/MyTextField";
import { MySelectField } from "../../forms/MySelectField";

const GitHostingOptions = [
  { label: "GitLab", value: "GitLab" },
  { label: "GitHub", value: "GitHub" },
  { label: "BitBucket", value: "BitBucket" },
];

const LoadingOverlay = ({ open }) => (
  <Modal open={open} onClose={() => {}}>
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        fontSize: "24px",
        zIndex: 9999,
      }}
    >
      Downloading the data from the GitLab API...
      <CircularProgress color="inherit" sx={{ ml: 2 }} />
    </Box>
  </Modal>
);

export const TeammemberGitInfoCreate = () => {
  const location = useLocation();
  const { tmData } = location.state || {};
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const schema = yup.object({
    teammemberGitHosting: yup
      .string()
      .required("You need to choose the hosting"),
    teammemberGitGroupID: yup
      .number()
      .typeError("The Group ID is a number")
      .required("You need to provide the Group ID"),
    teammemberGitUserID: yup
      .number()
      .typeError("The User ID is a number")
      .required("You need to provide the User ID"),
    teammemberGitPersonalAccessToken: yup
      .string()
      .required("You need to provide the Token"),
  });
  const { handleSubmit, control } = useForm({
    resolver: yupResolver(schema),
  });

  const submission = async (data) => {
    const teammember = tmData.id;
    setLoading(true); // Start loading

    try {
      // First API call to create Git integration
      const response = await AxiosInstance.post(
        "team/teammember-gitintegration/create/",
        {
          teammember: teammember,
          teammemberGitHosting: data.teammemberGitHosting,
          teammemberGitGroupID: data.teammemberGitGroupID,
          teammemberGitUserID: data.teammemberGitUserID,
          teammemberGitPersonalAccessToken:
            data.teammemberGitPersonalAccessToken,
        }
      );

      // Check if the response status is in the 200 range
      if (response.status >= 200 && response.status < 300) {
        // Store the toast message details in localStorage
        localStorage.setItem(
          "toastMessage",
          JSON.stringify({
            type: "success",
            content: "Successfully added git integration",
          })
        );

        // Get the current timestamp
        const now = new Date();
        const now_formatted = now.toISOString();

        // Second API call to create coding stats
        const codingStatsResponse = await AxiosInstance.post(
          "team/teammember-coding-stats/create/",
          {
            teammember: teammember,
            latestUpdate: now_formatted,
          }
        );

        // Check if the coding stats response was successful
        if (
          codingStatsResponse.status >= 200 &&
          codingStatsResponse.status < 300
        ) {
          console.log("all good");
        } else {
          console.error(
            "Unexpected response status from coding stats:",
            codingStatsResponse.status
          );
        }
      } else {
        console.error("Unexpected response status:", response.status);
      }
    } catch (error) {
      // Handle errors
      console.error("Error during submission:", error);
    } finally {
      setTimeout(() => {
        setLoading(false); // Always set loading to false in the finally block
        navigate(`/team/member/${teammember}`);
      }, 30000);
    }
  };

  return (
    <Box>
      <h2>
        Add Git integration details for{" "}
        <b>
          {tmData.tm_name} {tmData.tm_lname}
        </b>
      </h2>
      <Box className="form-container" sx={{ backgroundColor: "white" }}>
        <form onSubmit={handleSubmit(submission)}>
          <MySelectField
            options={GitHostingOptions}
            label={"Git Hosting"}
            name={"teammemberGitHosting"}
            control={control}
          />
          <MyTextField
            label={"Git Group ID"}
            name={"teammemberGitGroupID"}
            control={control}
          />
          <MyTextField
            label={"Git User ID"}
            name={"teammemberGitUserID"}
            control={control}
          />
          <MyTextField
            label={"Personal Access Token"}
            name={"teammemberGitPersonalAccessToken"}
            control={control}
          />
          <Button type="submit" variant="contained">
            Submit
          </Button>
        </form>
      </Box>
      <LoadingOverlay open={loading} />
    </Box>
  );
};
