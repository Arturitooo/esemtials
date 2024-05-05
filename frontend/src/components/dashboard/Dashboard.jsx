import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Box } from '@mui/material'
import NotesRTE from './dashboard/NotesRTE'
import OpenInNewIcon from '@mui/icons-material/OpenInNew';



export const Dashboard = () => {
  const navigate = useNavigate()
  return (
    <Box display="flex" justifyContent="space-between">
      <Box flexBasis="50%" style={{ maxWidth: '50%'}}>
        <h2 style={{margin: '0px'}}>Sprint progress</h2>
        <h2 style={{marginTop: '20px'}}>Team efficiency</h2>
      </Box>
      <Box flexBasis="50%" style={{ maxWidth: '50%'}}>
        <Box sx={{display:'flex', alignItems: 'center'}}>
          <h2 style={{margin: '0px', paddingRight:'3px'}}>Notes</h2>
          <Link to="/dashboard/notes">
            <OpenInNewIcon sx={{fontSize:'medium', color:'#1D212F66', marginTop:'6px'}}/>
          </Link>
        </Box>
        <Box style={{ maxWidth: '100%', width: '100%' }}>
          <NotesRTE limitHeight={true}/>
        </Box>

        <h2 style={{marginTop: '20px'}}>Notifications</h2>
      </Box>
    </Box>
  )
}
