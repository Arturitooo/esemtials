import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import AxiosInstance from "../AxiosInstance";
import { MyModal } from "../forms/MyModal";
import { UserInfo } from "../UserInfo";
import { FormControl, Select, MenuItem, Box, Button } from "@mui/material";
import { MyTextField } from "../forms/MyTextField";
import { MyMultilineTextField } from "../forms/MyMultilineTextField";
import { MyToastMessage } from "../forms/MyToastMessage";
import ListItemIcon from "@mui/material/ListItemIcon";
import WorkHistoryOutlinedIcon from "@mui/icons-material/WorkHistoryOutlined";



const schema = yup.object({
  projectName: yup.string().required("Project name is required"),
  projectDescription: yup.string(),
});

export const ProjectSelectField = () => {
  const [loading, setLoading] = useState(true);
  const { userData } = UserInfo();
  const [projectList, setProjectList] = useState([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const { handleSubmit, control, reset } = useForm({
    resolver: yupResolver(schema),
  });
  const [toast, setToast] = useState({ open: false, type: "", content: "" });

  const GetProjectsList = async () => {
    try {
      const res = await AxiosInstance.get("dashboard/project/list/");
      const data = res.data;
      setProjectList(data);
      const savedProject = localStorage.getItem("selectedProjectId");
      if (
        savedProject &&
        data.some((project) => project.id === Number(savedProject))
      ) {
        setSelectedProject(Number(savedProject));
      }
    } catch (error) {
      console.error("Error fetching project list:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    GetProjectsList();
  }, []);

  useEffect(() => {
    const savedToast = localStorage.getItem("toastMessage");
    if (savedToast) {
      setToast(JSON.parse(savedToast));
      localStorage.removeItem("toastMessage"); // Clear the toast message from localStorage
    }
  }, []);

  const handleChange = (event) => {
    const value = event.target.value;
    if (value === "new") {
      setOpenModal(true);
    } else {
      setSelectedProject(value === "" ? null : value);
      if (value !== "") {
        localStorage.setItem("selectedProjectId", value);
        localStorage.setItem(
          "toastMessage",
          JSON.stringify({
            open: true,
            type: "informative",
            content: `You've changed the project`,
          })
        );
        window.location.reload();
      } else {
        localStorage.removeItem("selectedProjectId");
      }
    }
  };

  const handleCloseModal = () => {
    setOpenModal(false);
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
      setProjectList([...projectList, newProject]);
      setSelectedProject(newProject.id);
      localStorage.setItem("selectedProjectId", newProject.id);
      handleCloseModal();
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

  const handleToastClose = () => {
    setToast({ ...toast, open: false });
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <>
      <FormControl fullWidth size="small">
        <Select
          value={selectedProject || ""}
          onChange={handleChange}
          displayEmpty
          inputProps={{ "aria-label": "Without label" }}
          renderValue={(selected) => {
            if (selected === "") {
              return (
                <span style={{ color: "#F5F7F9", opacity: 0.7 }}>
                  Choose a project
                </span>
              );
            }
            const selectedProject = projectList.find(
              (project) => project.id === selected
            );
            return selectedProject ? selectedProject.project_name : "";
          }}
          sx={{
            ".MuiOutlinedInput-notchedOutline": { borderColor: "#F5F7F9" },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: "#F5F7F9",
            },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: "#F5F7F9",
            },
            ".MuiSvgIcon-root": { color: "#F5F7F9" },
            color: "#F5F7F9",
            opacity: 0.9,
            width: "100%",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {projectList &&
            projectList.length > 0 &&
            projectList.map((project) => (
              <MenuItem
                key={project.id}
                value={project.id}
                sx={{ fontFamily: "Arial", fontSize: "16px" }}
              >
                {project.project_name}
              </MenuItem>
            ))}
            <hr/>
          <MenuItem value="">
            <a href="/projects/">
              <Button 
                startIcon={<WorkHistoryOutlinedIcon className="icon-M"/>}
              >
                Manage Projects
              </Button>
            </a>
          </MenuItem>
        </Select>
      </FormControl>

      <MyModal
        open={openModal}
        handleClose={handleCloseModal}
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
                <Button variant="outlined" onClick={handleCloseModal}>
                  Back
                </Button>
              </Box>
            </form>
          </Box>
        }
        actions={[]}
      />

      <MyToastMessage
        type={toast.type}
        content={toast.content}
        open={toast.open}
        handleClose={handleToastClose}
      />
    </>
  );
};
