import { Box } from '@mui/material'
import '../App.css'
import { MyTextField } from './forms/MyTextField'
import { MyPassField } from './forms/MyPassField'
import { MyContainedButton } from './forms/MyContainedButton'
import { MyTextButton } from './forms/MyTextButton'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import AxiosInstance from './AxiosInstance'



export const Register = () => {
  const navigate = useNavigate()
  const {handleSubmit, control} = useForm()
  
  const submission = (data) => {
    AxiosInstance.post('register/', {
      email: data.email,
      username: data.username,
      password: data.password,
    }) 
    .then (() => { 
      navigate(`/`)
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
      <form onSubmit={handleSubmit(submission)}>
      <Box className={"registerWhiteBox"}>
        <Box className={"itemBox"}>
          <Box className={"title"}>
            User registration
          </Box>
        </Box>
        <Box className={"itemBox"}>
          <MyTextField 
            label = {"Email"}
            name = {"email"}
            control = {control}
          />
        </Box>
        <Box className={"itemBox"}>
          <MyTextField 
            label = {"Username"}
            name = {"username"}
            control = {control}
          />
        </Box>
        <Box className={"itemBox"}>
          <MyPassField 
            label = {"Password"}
            name = {"password"}
            control = {control}
          />
        </Box>
        <Box className={"itemBox"}>
          <MyPassField 
            label = {"Confirm Password"}
            name = {"password2"}
            control = {control}
          />
        </Box>
        <Box className={"itemBox"}>
          <MyContainedButton 
            label = {"Register"}
            type = {"submit"}
          />
        </Box>
        <Box className={"itemBox"}>
          <Link to="/login">
            <MyTextButton 
              label = {"Already registered? Login here!"}
            />
          </Link>
        </Box>
      </Box>
      </form>
    </div>
  )
}
