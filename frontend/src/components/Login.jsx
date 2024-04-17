import { Box } from '@mui/material'
import '../App.css'
import { MyTextField } from './forms/MyTextField'
import { MyPassField } from './forms/MyPassField'
import { MyContainedButton } from './forms/MyContainedButton'
import { MyTextButton } from './forms/MyTextButton'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import AxiosInstance from './AxiosInstance'

export const Login = () => {
  const navigate = useNavigate()
  const {handleSubmit, control} = useForm()

  const submission = (data) => {
    AxiosInstance.post('login/', {
      email: data.email,
      password: data.password,
    }) 
    .then ((response) => { 
      localStorage.setItem('Token', response.data.token),
      navigate(`/`)
    })
    .catch((error) => {
      console.error('Error during login', error)
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
      <Box className={"loginWhiteBox"}>
        <Box className={"itemBox"}>
          <Box className={"title"}>
            Login to SMtials
          </Box>
        </Box>
        <Box className={"itemBox"}>
          <MyTextField 
            label={"Email"}
            name = {"email"}
            control = {control}
          />
        </Box>
        <Box className={"itemBox"}>
          <MyPassField 
            label={"Password"}
            name = {"password"}
            control = {control}
          />
        </Box>
        <Box className={"itemBox"}>
          <MyContainedButton 
            label = {"Login"}
            type = {"submit"}
          />
        </Box>
        <Box className={"itemBox"} sx={{marginBottom:'0px'}}>
        <Link to="/password-reset">
            <MyTextButton
              label = {"Forgot password? Reset it here"}
            />
          </Link>
        </Box>
        <Box className={"itemBox"} sx={{marginTop:'0px'}}>
          <Link to="/register">
            <MyTextButton
              label = {"No account? Register here!"}
            />
          </Link>
        </Box>


      </Box>
      </form>
    </div>
  )
}
