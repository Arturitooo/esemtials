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

import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";

dayjs.extend(localizedFormat);

const schema = yup.object({
  projectName: yup.string().required("Project name is required"),
  projectDescription: yup.string(),
});

export const Projects = () => {
  const [emptyState, setEmptyState] = useState(false);
  const { userData } = UserInfo();
  const { handleSubmit, control, reset } = useForm({
    resolver: yupResolver(schema),
  });
  const [projectData, setProjectData] = useState([]);
  const [openCreationModal, setOpenCreationModal] = useState(false);
  const [confirmProjectDelete, setConfirmProjectDelete] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [toast, setToast] = useState({ open: false, type: "", content: "" });

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

  useEffect(() => {
    GetProjectsList();
  }, []);

  useEffect(() => {
    const savedToast = localStorage.getItem("toastMessage");
    if (savedToast) {
      localStorage.removeItem("toastMessage"); // Clear the toast message from localStorage
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
        content: `You've created a new project named ${data.projectName}`,
      });
      handleCloseCreationModal();
      localStorage.setItem(
        "toastMessage",
        JSON.stringify({
          open: true,
          type: "success",
          content: `You've created a new project named ${data.projectName}`,
        })
      );
      setProjectData((prevProjects) => [...prevProjects, newProject]);
      setEmptyState(false);
    } catch (error) {
      console.error("Error creating project:", error);
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

            <Card>
              <CardContent>
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
                    <TableCell>Creation date</TableCell>
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
                        <DeleteIcon
                          style={{
                            position: "relative",
                            fontSize: "medium",
                            marginLeft: "0px",
                            color: "#1D212F66",
                            top: "2px",
                            cursor: "pointer",
                          }}
                          onMouseEnter={(e) => (e.target.style.color = "black")}
                          onMouseLeave={(e) =>
                            (e.target.style.color = "#1D212F66")
                          }
                          onClick={() => handleConfirmDeleteProject(item.id)}
                        />
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

      <MyModal
        open={confirmProjectDelete}
        handleClose={() => setConfirmProjectDelete(false)}
        title="Confirm Deletion"
        content="Are you sure you want to delete this project?"
        actions={[
          { label: "Yes", onClick: handleDeleteProject },
          { label: "No", onClick: () => setConfirmProjectDelete(false) },
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
