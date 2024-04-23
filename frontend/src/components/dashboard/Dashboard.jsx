import React from 'react'
import { Box } from '@mui/material'
import { Notes } from './dashboard/Notes'

export const Dashboard = () => {
  return (
    <Box display="flex" justifyContent="space-between">
      <Box flexBasis="50%">
        <h2 style={{margin: '0px'}}>Sprint progress</h2>
        <h2 style={{marginTop: '20px'}}>Team efficiency</h2>
      </Box>
      <Box flexBasis="50%">
        <Notes/>

        <h2 style={{marginTop: '20px'}}>Notifications</h2>
      </Box>
    </Box>
  )
}
