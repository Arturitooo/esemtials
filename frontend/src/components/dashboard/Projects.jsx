import React, { useState, useEffect } from "react";
import AxiosInstance from "../AxiosInstance";
import { UserInfo } from "../UserInfo";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { MyModal } from "../forms/MyModal";
import { MyTextField } from "../forms/MyTextField";
import { MyMultilineTextField } from "../forms/MyMultilineTextField";

import { Box } from "@mui/material";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";

import AddIcon from "@mui/icons-material/Add";

const schema = yup.object({
  projectName: yup.string().required("Project name is required"),
  projectDescription: yup.string(),
});

export const Projects = () => {
  const [emptyState, setEmptyState] = useState(true);
  const { userData } = UserInfo();
  const { handleSubmit, control, reset } = useForm({
    resolver: yupResolver(schema),
  });
  const [openCreationModal, setOpenCreationModal] = useState(false);

  const GetProjectsList = async () => {
    try {
      const response = await AxiosInstance.get("/dashboard/project/list");
      console.log(response.data);
      if (response.data.length === 0) {
        setEmptyState(true);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    GetProjectsList();
  }, []);

  const handleOpenCreationModal = () => {
    setOpenCreationModal(true);
  };

  const handleCloseCreationModal = () => {
    setOpenCreationModal(false);
    reset();
  };

  const handleCreateProject = async (data) => {
    try {
      const response = await AxiosInstance.post("dashboard/project/create/", {
        project_owner: userData.id,
        project_name: data.projectName,
        project_description: data.projectDescription,
        project_created: new Date().toISOString(),
        project_updated: new Date().toISOString(),
      });
      const newProject = response.data;
      localStorage.setItem("selectedProjectId", newProject.id);
      handleCloseCreationModal();
      localStorage.setItem(
        "toastMessage",
        JSON.stringify({
          open: true,
          type: "success",
          content: `You've created a new project named ${data.projectName}`,
        })
      );
      window.location.reload();
    } catch (error) {
      console.error("Error creating project:", error);
    }
  };

  return (
    <div>
      <div>
        <h1>Projects</h1>
        <Card>
          <CardContent>
            {emptyState ? (
              <div>
                <p>
                  You have no projects created yet. You can create one below😁
                </p>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  sx={{ height: "50%" }}
                  onClick={handleOpenCreationModal}
                >
                  New project
                </Button>
              </div>
            ) : (
              <p>This is full content</p>
            )}
          </CardContent>
        </Card>
      </div>
      <MyModal
        open={openCreationModal}
        handleClose={handleCloseCreationModal}
        title="Create New Project"
        content={
          <Box sx={{ padding: "10px", backgroundColor: "white" }}>
            <form onSubmit={handleSubmit(handleCreateProject)}>
              <MyTextField
                label="Project Name*"
                name="projectName"
                control={control}
              />
              <MyMultilineTextField
                label="Project Description"
                name="projectDescription"
                control={control}
              />
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 2,
                  mt: 2,
                }}
              >
                <Button variant="contained" color="primary" type="submit">
                  Create
                </Button>
                <Button variant="outlined" onClick={handleCloseCreationModal}>
                  Back
                </Button>
              </Box>
            </form>
          </Box>
        }
        actions={[]}
      />

      {/* <MyToastMessage
        type={toast.type}
        content={toast.content}
        open={toast.open}
        handleClose={handleToastClose}
      /> */}
    </div>
  );
};
