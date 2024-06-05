import React, { useState, useEffect } from "react";
import AxiosInstance from "../AxiosInstance";
import { MyModal } from "../forms/MyModal";
import { FormControl, Select, MenuItem } from "@mui/material";

export const ProjectSelectField = () => {
  const [loading, setLoading] = useState(true);
  const [projectList, setProjectList] = useState([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [openModal, setOpenModal] = useState(false);

  const GetProjectsList = async () => {
    try {
      const res = await AxiosInstance.get("dashboard/project/list/");
      const data = res.data;
      setProjectList(data);
      const savedProject = localStorage.getItem("project_id");
      if (
        savedProject &&
        data.some((project) => project.id === Number(savedProject))
      ) {
        setSelectedProject(Number(savedProject)); // convert savedProject to a number
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

  const handleChange = (event) => {
    if (event.target.value === "new") {
      setOpenModal(true); // open the modal if "+ New Project" is selected
    } else {
      setSelectedProject(Number(event.target.value));
      localStorage.setItem("project_id", event.target.value);
    }
  };

  const handleCloseModal = () => {
    setOpenModal(false); // function to close the modal
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <FormControl fullWidth size="small">
      <Select
        value={selectedProject}
        onChange={handleChange}
        displayEmpty
        inputProps={{ "aria-label": "Without label" }}
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
        }}
      >
        <MenuItem value="">
          <em>Choose a project</em>
        </MenuItem>
        {projectList.length > 0 &&
          projectList.map((project) => (
            <MenuItem key={project.id} value={project.id}>
              {project.project_name}
            </MenuItem>
          ))}
        <MenuItem value="new">+ New Project</MenuItem>
      </Select>
    </FormControl>

    // Modal to create a new project TBD
  );
};
