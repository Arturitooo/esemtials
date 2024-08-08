import React, { useState, useEffect } from "react";
import AxiosInstance from "../AxiosInstance";
import { UserInfo } from "../UserInfo";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { MyModal } from "../forms/MyModal";
import { MyToastMessage } from "../forms/MyToastMessage";
import { MyTextField } from "../forms/MyTextField";
import { MyMultilineTextField } from "../forms/MyMultilineTextField";
import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
import emptyStateImage from "../../assets/illustrations/no-projects.svg";

import { Box } from "@mui/material";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";

import IconButton from "@mui/material/IconButton";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import Edit from "@mui/icons-material/Edit";

dayjs.extend(localizedFormat);

const schema = yup.object({
  projectName: yup.string().required("Project name is required"),
  projectDescription: yup.string(),
});

export const Projects = () => {
  const [emptyState, setEmptyState] = useState(false);
  const { userData } = UserInfo();
  const [projectData, setProjectData] = useState([]);
  const [openCreationModal, setOpenCreationModal] = useState(false);
  const [openEditionModal, setOpenEditionModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [confirmProjectDelete, setConfirmProjectDelete] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [selectedProjectData, setSelectedProjectData] = useState(null);
  const [toast, setToast] = useState({ open: false, type: "", content: "" });
  const modalTitle = isEditMode ? "Update Project" : "Create New Project";
  const submitButtonContent = isEditMode ? "Update" : "Create";

  const { handleSubmit, control, reset } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      projectName: isEditMode ? selectedProjectData?.project_name : "",
      projectDescription: isEditMode
        ? selectedProjectData?.project_description
        : "",
    },
  });

  const GetProjectsList = async () => {
    try {
      const response = await AxiosInstance.get("/dashboard/project/list");
      console.log(response.data);
      if (response.data.length === 0) {
        setEmptyState(true);
      } else {
        setProjectData(response.data);
        setEmptyState(false);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  React.useEffect(() => {
    const toastMessage = JSON.parse(localStorage.getItem("toastMessage"));
    GetProjectsList();
    if (toastMessage) {
      setToast({
        open: true,
        type: toastMessage.type,
        content: toastMessage.content,
      });
      localStorage.removeItem("toastMessage");
    }
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
      setToast({
        open: true,
        type: "success",
        content: `Project created successfully!`,
      });
      handleCloseCreationModal();
      localStorage.setItem(
        "toastMessage",
        JSON.stringify({
          type: "success",
          content: "Project created successfully!",
        })
      );
      window.location.reload();
      setProjectData((prevProjects) => [...prevProjects, newProject]);
      setEmptyState(false);
    } catch (error) {
      console.error("Error creating project:", error);
    }
  };

  const handleOpenEditionModal = (project) => {
    setIsEditMode(true);
    setSelectedProjectData(project);
    setSelectedProjectId(project.id);
    setOpenEditionModal(true);
    reset({
      projectName: project.project_name,
      projectDescription: project.project_description,
    });
  };

  const handleCloseEditionModal = () => {
    setOpenEditionModal(false);
    setIsEditMode(false);
    reset();
  };

  const handleUpdateProject = async (data) => {
    try {
      const response = await AxiosInstance.put(
        `dashboard/project/${selectedProjectId}/update/`,
        {
          project_owner: userData.id,
          project_name: data.projectName,
          project_description: data.projectDescription,
          project_created: selectedProjectData.project_created,
          project_updated: new Date().toISOString(),
        }
      );
      const updatedProject = response.data;
      localStorage.setItem("selectedProjectId", updatedProject.id);
      setToast({
        open: true,
        type: "success",
        content: `Project updated successfully!`,
      });
      handleCloseEditionModal();
      localStorage.setItem(
        "toastMessage",
        JSON.stringify({
          type: "success",
          content: "Project updated successfully!",
        })
      );
      window.location.reload();
    } catch (error) {
      console.error("Error updating project:", error);
    }
  };

  const handleConfirmDeleteProject = (projectId) => {
    setSelectedProjectId(projectId);
    setConfirmProjectDelete(true);
  };

  const handleDeleteProject = async () => {
    try {
      await AxiosInstance.delete(
        `dashboard/project/${selectedProjectId}/delete/`
      );
      setProjectData((prevProjects) =>
        prevProjects.filter((project) => project.id !== selectedProjectId)
      );
      setConfirmProjectDelete(false);
      localStorage.setItem(
        "toastMessage",
        JSON.stringify({
          type: "success",
          content: "Project deleted successfully!",
        })
      );
      localStorage.removeItem("selectedProjectId");
      window.location.reload();
    } catch (error) {
      console.error("Error while deleting project", error);
    }
  };

  const handleToastClose = () => {
    setToast({ ...toast, open: false });
  };

  const formatDate = (dateString) => {
    return dayjs(dateString).format("MMMM D, YYYY");
  };

  return (
    <div>
      <div>
        {emptyState ? (
          <div>
            <h1>Projects</h1>
            <Card className="card empty-state-card">
              <CardContent>
                <img src={emptyStateImage} alt="no-projects"/>
                <h2>Build future with your projects</h2>
                <p>Create a project to manage and monitor performance of your teams, create TODO lists, and more.</p>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleOpenCreationModal}
                >
                  New project
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <h1>Projects</h1>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                sx={{ height: "50%" }}
                onClick={handleOpenCreationModal}
              >
                New project
              </Button>
            </div>
            <TableContainer component={Paper} sx={{ borderRadius: "15px" }}>
              <Table sx={{ minWidth: 650 }} aria-label="Team members">
                <TableHead>
                  <TableRow>
                    <TableCell>Nr.</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Created on</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {projectData.map((item, index) => (
                    <TableRow
                      key={index}
                      sx={{
                        "&:last-child td, &:last-child th": { border: 0 },
                      }}
                    >
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>
                        <b>{item.project_name}</b>
                      </TableCell>
                      <TableCell>{formatDate(item.project_created)}</TableCell>
                      <TableCell>{item.project_description}</TableCell>
                      <TableCell>
                        <div className="action-column">
                          <IconButton
                            onClick={() => handleOpenEditionModal(item)}
                            color="primary">
                            <EditIcon className="icon-S inline-icon"/>
                          </IconButton>
                          <IconButton
                            onClick={() => handleConfirmDeleteProject(item.id)}
                            color="primary"> 
                            <DeleteIcon className="icon-S inline-icon"/>
                          </IconButton>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </div>
        )}
      </div>
      <MyModal
        open={openEditionModal || openCreationModal}
        title={modalTitle}
        content={
          <Box sx={{ padding: "10px", backgroundColor: "white" }}>
            <form
              onSubmit={handleSubmit(
                isEditMode ? handleUpdateProject : handleCreateProject
              )}
            >
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
                  {submitButtonContent}
                </Button>
                <Button
                  variant="outlined"
                  onClick={
                    isEditMode
                      ? handleCloseEditionModal
                      : handleCloseCreationModal
                  }
                >
                  Back
                </Button>
              </Box>
            </form>
          </Box>
        }
        actions={[]}
      />

      <MyModal
        open={confirmProjectDelete}
        handleClose={() => setConfirmProjectDelete(false)}
        title="Are you sure?"
        content={
          <>
          <b>Deleting a project cannot be reverted.</b> You will permanently delete teams members, notes and related data. Do you still want to delete the project?
          </>
        }
        actions={[
          { label: "No, cancel", onClick: () => setConfirmProjectDelete(false), className:"modal-action-cancel"},
          { label: "Yes, delete", onClick: handleDeleteProject, className:"modal-action-red"},
        ]}
      />

      <MyToastMessage
        type={toast.type}
        content={toast.content}
        open={toast.open}
        handleClose={handleToastClose}
      />
    </div>
  );
};
