import React from 'react'
import { useForm } from 'react-hook-form'
import { UserInfo } from '../../UserInfo'
import { MyTextField } from '../../forms/MyTextField'
import { MySelectField } from '../../forms/MySelectField'
import { MyMultipleSelectField } from '../../forms/MyMultipleSelectField'
import { MyDatePicker } from '../../forms/MyDatePicker'
import { MyMultilineTextField } from '../../forms/MyMultilineTextField'

import { Box } from '@mui/material'


export const TMCreate = () => {
    const { userData } = UserInfo();
    const { handleSubmit, control} = useForm()
    const optionsPosition = [
        { label: 'Scrum Master', value: 'Scrum Master' },
        { label: 'Frontend Developer', value: 'Frontend Developer' },
        { label: 'Backend Developer', value: 'Backend Developer' },
        { label: 'DevOps', value: 'DevOps' },
        { label: 'Designer', value: 'Designer' },
        { label: 'Quality Engineer', value: 'Quality Engineer' },
        { label: 'Business Analyst', value: 'Business Analyst' },
        { label: 'Solution Architect', value: 'Solution Architect' }
      ];  
    const optionsSeniority = [
        { label: 'Internship', value: 'Internship' },
        { label: 'Junior', value: 'Junior' },
        { label: 'Medium', value: 'Medium' },
        { label: 'Senior', value: 'Senior' },
        { label: 'Expert', value: 'Expert' },
      ];

    const optionsStack = [
        'Jira', 'Trello', 'Monday', 'Business Analytics', 'Fullstack',
        'Vue.js', 'React.js', 'Angular.js' ,'React native', 'TypScript', 'Three.js', 'Flutter', 'Android', 'iOS', 'GOlang', 
        'Ruby on Rails', '.NET' ,'PHP', "Node", 'Java', 'Python','Express.js', 'Laravel', 'Symfony', 'Spring', 'Django', 'Flask',
        'NoSql','Sql', 'MongoDB',
        'Azure', 'AWS','Google Cloud',
        'Kubernetes','Docker',
        'Figma', 'Adobe XD', 'Python Selenium', 'Cypress', 
        'AI', 'Machine Learning', 
      ];

    

  return (
    <Box>
        <h2>Create team member</h2>
        <Box sx={{padding:'10px',backgroundColor:'white'}}>
            <MyTextField 
                label={"Name"}
                name = {"name"}
                control = {control}
            />
            <MyTextField 
                label={"Last name"}
                name = {"lname"}
                control = {control}
            />
            <MySelectField
                options = {optionsPosition}
                label={"Position"}
                name='position'
            />
            <MySelectField
                options = {optionsSeniority}
                label={"Seniority"}
                name='seniority'
            />
            <MyMultipleSelectField
                options = {optionsStack}
                label={"Stack"}
                name='stack'
            />
            <MyDatePicker
                label="Joining date"
                name='joining_date'
            />
            <MyMultilineTextField 
                label={"Summary"}
                name = {"summary"}
            />
            {/* TO DO - adding photo and react hook */}
        </Box>
    </Box>
  )
}
