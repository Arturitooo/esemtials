import { Box } from '@mui/material'
import { useState } from 'react'
import '../App.css'
import { MyTextField } from './forms/MyTextField'
import { MyContainedButton } from './forms/MyContainedButton'
import { MyTextButton } from './forms/MyTextButton'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import AxiosInstance from './AxiosInstance'
import { MyMessage } from './forms/MyMessage'

export const PasswordReset = () => {
    const navigate = useNavigate()
    const {handleSubmit, control} = useForm()
    const [ showMessage, setShowMessage ]  = useState(false)

    const submission = (data) => {
    AxiosInstance.post('password_reset/', {
      email: data.email,
    }) 
    .then ((response) => { 
        setShowMessage(true)
    })
  }
  return (
    <div className={'background'}>
      <Box sx={{
        position: 'absolute',
        top: 10,
        left: 10,
      }}>
        <Link to="/">
          <MyTextButton
            label = {"< Home"}
          />
        </Link>
      </Box>
      {showMessage ? <MyMessage text={`If the email is correct you should receive email with instruction on how to reset the password`} severity={"info"} /> : null }
      <form onSubmit={handleSubmit(submission)}> 
      <Box className={"loginWhiteBox"}>
        <Box className={"itemBox"}>
          <Box className={"title"}>
            Request Password Reset
          </Box>
        </Box>
        <Box className={"itemBox"}>
          <MyTextField 
            label={"Email"}
            name = {"email"}
            control = {control}
          />
        </Box>
        <Box className={"itemBox"} sx={{marginBottom:'0px'}}>
          <MyContainedButton 
            label = {"Reset password"}
            type = {"submit"}
          />
        </Box>
      </Box>
      </form>
    </div>
  )
}
