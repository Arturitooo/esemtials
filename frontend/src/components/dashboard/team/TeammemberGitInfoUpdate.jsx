import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useLocation } from "react-router-dom";
import AxiosInstance from "../../AxiosInstance";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import { Box } from "@mui/material";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";

import { MyTextField } from "../../forms/MyTextField";
import { MySelectField } from "../../forms/MySelectField";

const GitHostingOptions = [
  { label: "GitLab", value: "GitLab" },
  // { label: "GitHub", value: "GitHub" },
  // { label: "BitBucket", value: "BitBucket" },
];

export const TeammemberGitInfoUpdate = () => {
  const location = useLocation();
  const { tmData } = location.state || {};
  const navigate = useNavigate();
  const [gitInfoID, setGitInfoID] = useState(null);
  const [gitIntegrationData, setGitIntegrationData] = useState(null);

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
  const { handleSubmit, control, reset } = useForm({
    resolver: yupResolver(schema),
    defaultValues: gitIntegrationData,
  });

  const GetGitInfoID = () => {
    AxiosInstance.get(`/team/teammember-gitintegration/list/`)
      .then((res) => {
        const data = res.data;
        // Find the record where teammember matches tmData.id
        const matchingRecord = data.find(
          (item) => item.teammember === tmData.id
        );
        if (matchingRecord) {
          setGitInfoID(matchingRecord.id);
          setGitIntegrationData({
            teammemberGitHosting: matchingRecord.teammemberGitHosting,
            teammemberGitGroupID: matchingRecord.teammemberGitGroupID,
            teammemberGitUserID: matchingRecord.teammemberGitUserID,
            teammemberGitPersonalAccessToken:
              matchingRecord.teammemberGitPersonalAccessToken,
          });
        } else {
          console.error("No matching record found");
        }
      })
      .catch((error) => {
        console.error("Error fetching Git data:", error);
      });
  };

  useEffect(() => {
    if (!gitInfoID) {
      GetGitInfoID();
    }
  }, [gitInfoID]);

  useEffect(() => {
    if (gitIntegrationData) {
      reset(gitIntegrationData); // Reset the form with fetched data
    }
  }, [gitIntegrationData, reset]);

  const submission = (data) => {
    const teammember = tmData.id;
    // need to provide gitintegration record id, not the Teammember
    AxiosInstance.put(`team/teammember-gitintegration/${gitInfoID}/update/`, {
      teammember: teammember,
      teammemberGitHosting: data.teammemberGitHosting,
      teammemberGitGroupID: data.teammemberGitGroupID,
      teammemberGitUserID: data.teammemberGitUserID,
      teammemberGitPersonalAccessToken: data.teammemberGitPersonalAccessToken,
    })
      .then((response) => {
        // Check if the response status is in the 200 range
        if (response.status >= 200 && response.status < 300) {
          // Store the toast message details in localStorage
          localStorage.setItem(
            "toastMessage",
            JSON.stringify({
              type: "informative",
              content: "Updated the Git Integration data",
            })
          );
          // Redirect to the details page
          navigate(`/team/member/${teammember}`);
        } else {
          // Handle other status codes if needed
          console.error("Unexpected response status:", response.status);
        }
      })
      .catch((error) => {
        // Handle errors
        console.error("Error during submission:", error);
      });
  };

  const handleDeleteClick = () => {
    const teammember = tmData.id;
    // need to provide gitintegration record id, not the Teammember
    AxiosInstance.delete(`team/teammember-gitintegration/${gitInfoID}/delete/`)
      .then((response) => {
        // Check if the response status is in the 200 range
        if (response.status >= 200 && response.status < 300) {
          // Store the toast message details in localStorage
          localStorage.setItem(
            "toastMessage",
            JSON.stringify({
              type: "informative",
              content: "Removed Git Integration Data",
            })
          );
          // Redirect to the details page
          navigate(`/team/member/${teammember}`);
        } else {
          // Handle other status codes if needed
          console.error("Unexpected response status:", response.status);
        }
      })
      .catch((error) => {
        // Handle errors
        console.error("Error during submission:", error);
      });
  };

  return (
    <Box>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          gap: "16px",
          justifyContent: "space-between",
        }}
      >
        <h2>
          Update{" "}
          <b>
            {tmData.tm_name} {tmData.tm_lname}
          </b>
          &apos;s Git integration details
        </h2>
        <Tooltip title="Delete Git integration for the user">
          <Button variant="outlined" color="error" onClick={handleDeleteClick}>
            Delete
          </Button>
        </Tooltip>
      </div>

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
    </Box>
  );
};
