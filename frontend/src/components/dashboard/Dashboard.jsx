import React from 'react'
import { Box } from '@mui/material'
import { Notes } from './dashboard/Notes'

export const Dashboard = () => {
  return (
    <Box display="flex" justifyContent="space-between">
      <Box flexBasis="50%">
        <h2 style={{margin: '0px'}}>Dashboard</h2>
      </Box>
      <Box flexBasis="50%">
        <h2 style={{margin: '0px'}}>Notes</h2>
        <Notes/>
      </Box>
    </Box>
  )
}
