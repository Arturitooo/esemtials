import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { UserInfo } from "../../UserInfo";
import AxiosInstance from "../../AxiosInstance";
import { useNavigate } from "react-router-dom";

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
  const { handleSubmit, control } = useForm({
    defaultValues: {
      name: "",
      lname: "",
      position: "",
      seniority: "",
      stack: [],
      joining_date: null,
      summary: "",
    },
  });

  const submission = async (data) => {
    try {
      const formattedJoiningDate = data.joining_date
        ? data.joining_date.toISOString().substring(0, 10)
        : null;
      const formData = new FormData();
      formData.append("tm_name", data.name);
      formData.append("tm_lname", data.lname);
      formData.append("tm_seniority", data.seniority);
      formData.append("tm_position", data.position);
      formData.append("tm_stack", JSON.stringify(data.stack));
      formData.append("tm_joined", formattedJoiningDate);
      formData.append("tm_summary", data.summary);
      formData.append("tm_photo", image); // Append the file
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
    console.log(e.target.files);
    setImage(e.target.files[0]);
  }

  return (
    <Box>
      <h2>Create team member</h2>
      <Box sx={{ padding: "10px", backgroundColor: "white" }}>
        <form onSubmit={handleSubmit(submission)} encType="multipart/form-data">
          <MyTextField label={"Name"} name={"name"} control={control} />
          <MyTextField label={"Last name"} name={"lname"} control={control} />
          <MySelectField
            options={optionsPosition}
            label={"Position"}
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
            label="Joining date"
            name={"joining_date"}
            control={control}
          />
          <MyMultilineTextField
            label={"Summary"}
            name={"summary"}
            control={control}
          />
          <div>
            <input
              type="file"
              accept="image/png, image/jpeg"
              name={"photo"}
              onChange={handleImage}
            />
            {/* https://stackoverflow.com/questions/61783511/django-rest-frameworkreact-js-unable-to-implement-form-parser-error-the-subm */}
          </div>
          <MyContainedButton label="Submit" type="submit" />
        </form>
      </Box>
    </Box>
  );
};
