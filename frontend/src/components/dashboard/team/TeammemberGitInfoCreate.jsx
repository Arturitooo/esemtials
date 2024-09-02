import React from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useLocation } from "react-router-dom";
import AxiosInstance from "../../AxiosInstance";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import { Box } from "@mui/material";
import Button from "@mui/material/Button";

import { MyTextField } from "../../forms/MyTextField";
import { MySelectField } from "../../forms/MySelectField";

const GitHostingOptions = [
  { label: "GitLab", value: "GitLab" },
  { label: "GitHub", value: "GitHub" },
  { label: "BitBucket", value: "BitBucket" },
];

export const TeammemberGitInfoCreate = () => {
  const location = useLocation();
  const { tmData } = location.state || {};
  const navigate = useNavigate();

  const schema = yup.object({
    teammemberGitHosting: yup
      .string()
      .required("You need to choose the hosting"),
    teammemberGitProjectID: yup
      .number()
      .typeError("The Project ID is a number")
      .required("You need to provide the Project ID"),
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

  const submission = (data) => {
    const teammember = tmData.id;
    AxiosInstance.post("team/teammember-gitdata/create/", {
      teammember: teammember,
      teammemberGitHosting: data.teammemberGitHosting,
      teammemberGitProjectID: data.teammemberGitProjectID,
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
              type: "success",
              content: "Successfully added git integration",
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
      <h2>
        Add Git itnegration details for{" "}
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
            label={"Git Project ID"}
            name={"teammemberGitProjectID"}
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
