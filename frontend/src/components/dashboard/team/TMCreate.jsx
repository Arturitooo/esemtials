import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { UserInfo } from "../../UserInfo";
import AxiosInstance from "../../AxiosInstance";
import { useNavigate } from "react-router-dom";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

import { MyTextField } from "../../forms/MyTextField";
import { MySelectField } from "../../forms/MySelectField";
import { MyMultipleSelectField } from "../../forms/MyMultipleSelectField";
import { MyDatePicker } from "../../forms/MyDatePicker";
import { MyMultilineTextField } from "../../forms/MyMultilineTextField";
import { MyContainedButton } from "../../forms/MyContainedButton";

import { Box } from "@mui/material";

export const TMCreate = () => {
  const { userData } = UserInfo();
  const navigate = useNavigate();
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null); // State to hold image preview URL

  const schema = yup.object().shape({
    name: yup.string().required("Name is a required field"),
    lname: yup.string().required("Last name is a required field"),
    position: yup.string().required("Position is a required field"),
    seniority: yup.string(),
    joining_date: yup.date().nullable(),
    summary: yup.string(),
  });

  const { handleSubmit, control } = useForm({
    defaultValues: {
      name: "",
      lname: "",
      position: "",
      seniority: "",
      stack: [],
      joining_date: null,
      summary: "",
      project: "",
    },
    resolver: yupResolver(schema),
  });

  dayjs.extend(utc);

  const submission = async (data) => {
    try {
      const formattedJoiningDate = data.joining_date
        ? dayjs(data.joining_date).format("YYYY-MM-DD")
        : null;
      const savedProject = localStorage.getItem("selectedProjectId");
      const formData = new FormData();
      formData.append("tm_name", data.name);
      formData.append("tm_lname", data.lname);
      formData.append("tm_seniority", data.seniority);
      formData.append("tm_position", data.position);
      formData.append("tm_stack", JSON.stringify(data.stack));
      if (data.joining_date) {
        formData.append("tm_joined", formattedJoiningDate);
      }
      formData.append("tm_summary", data.summary);
      formData.append("project", savedProject);
      if (image) {
        formData.append("tm_photo", image);
      }
      formData.append("created_by", userData.id);

      const res = await AxiosInstance.post("team/teammember/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      navigate(`/team/member/${res.data.id}`);
    } catch (error) {
      console.error("Can't create new team member", error);
    }
  };

  const optionsPosition = [
    { label: "Scrum Master", value: "sm" },
    { label: "Frontend Developer", value: "fe_dev" },
    { label: "Backend Developer", value: "be_dev" },
    { label: "Fullstack Developer", value: "fs_dev" },
    { label: "DevOps", value: "devops" },
    { label: "Designer", value: "des" },
    { label: "Quality Engineer", value: "qa" },
    { label: "Business Analyst", value: "ba" },
    { label: "Solution Architect", value: "sa" },
  ];

  const optionsSeniority = [
    { label: "Internship", value: "intern" },
    { label: "Junior", value: "junior" },
    { label: "Medium", value: "regular" },
    { label: "Senior", value: "senior" },
    { label: "Expert", value: "expert" },
  ];

  const optionsStack = [
    "Jira",
    "Trello",
    "Monday",
    "Business Analytics",
    "Fullstack",
    "Vue.js",
    "React.js",
    "Angular.js",
    "React native",
    "TypScript",
    "Three.js",
    "Flutter",
    "Android",
    "iOS",
    "GOlang",
    "Ruby on Rails",
    ".NET",
    "PHP",
    "Node",
    "Java",
    "Python",
    "Express.js",
    "Laravel",
    "Symfony",
    "Spring",
    "Django",
    "Flask",
    "NoSql",
    "Sql",
    "MongoDB",
    "Azure",
    "AWS",
    "Google Cloud",
    "Kubernetes",
    "Docker",
    "Figma",
    "Adobe XD",
    "Python Selenium",
    "Cypress",
    "AI",
    "Machine Learning",
  ];

  function handleImage(e) {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file)); // Set the image preview URL
    }
  }

  return (
    <Box>
      <h2>Create team member</h2>
      <Box sx={{ padding: "10px", backgroundColor: "white" }}>
        <form onSubmit={handleSubmit(submission)} encType="multipart/form-data">
          <MyTextField label={"Name*"} name={"name"} control={control} />
          <MyTextField label={"Last name*"} name={"lname"} control={control} />
          <MySelectField
            options={optionsPosition}
            label={"Position*"}
            name={"position"}
            control={control}
          />
          <MySelectField
            options={optionsSeniority}
            label={"Seniority"}
            name={"seniority"}
            control={control}
          />
          <MyMultipleSelectField
            options={optionsStack}
            label={"Stack"}
            name={"stack"}
            control={control}
          />
          <MyDatePicker
            label="Joining date*"
            name={"joining_date"}
            control={control}
          />
          <MyMultilineTextField
            label={"Summary"}
            name={"summary"}
            control={control}
          />
          <div style={{ marginTop: "10px" }}>
            <input
              type="file"
              accept="image/png, image/jpeg"
              name={"photo"}
              onChange={handleImage}
            />
          </div>
          <div
            style={{
              display: "flex",
              marginBottom: "10px",
              justifyContent: "center",
            }}
          >
            {imagePreview && ( // Display the image preview if available
              <Box
                component="img"
                sx={{
                  width: "50%",
                  height: "auto",
                  mt: 2,
                }}
                alt="Preview"
                src={imagePreview}
              />
            )}
          </div>
          <MyContainedButton label="Submit" type="submit" />
        </form>
      </Box>
    </Box>
  );
};
