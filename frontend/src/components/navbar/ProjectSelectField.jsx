import React, { useState, useEffect } from "react";
import AxiosInstance from "../AxiosInstance";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";

export const ProjectSelectField = () => {
  const [loading, setLoading] = useState(true);
  const [projectList, setProjectList] = useState([]);
  const [selectedProject, setSelectedProject] = useState("");

  const GetProjectsList = async () => {
    try {
      const res = await AxiosInstance.get("dashboard/project/list/");
      const data = res.data;
      setProjectList(data);
      console.log("Project list fetched:", data);
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
    setSelectedProject(event.target.value);
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <FormControl fullWidth size="small">
      <Select
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
          opacity: 0.75,
        }}
      >
        {projectList.map((project, index) => (
          <MenuItem key={index} value={project.id} sx={{ color: "#1D212F" }}>
            {project.project_name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};
