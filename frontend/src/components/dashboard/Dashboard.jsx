import React from 'react'
import { Box } from '@mui/material'
import NotesRTE from './dashboard/NotesRTE'

export const Dashboard = () => {
  return (
    <Box display="flex" justifyContent="space-between">
      <Box flexBasis="50%">
        <h2 style={{margin: '0px'}}>Sprint progress</h2>
        <h2 style={{marginTop: '20px'}}>Team efficiency</h2>
      </Box>
      <Box flexBasis="50%">
      <h2 style={{margin: '0px'}}>Notes</h2>
        <Box style={{ maxWidth: '100%', width: '100%' }}>
          <NotesRTE limitHeight={true}/>
        </Box>

        <h2 style={{marginTop: '20px'}}>Notifications</h2>
      </Box>
    </Box>
  )
}
