import { React, useEffect, useMemo, useState } from 'react'
import AxiosInstance from '../AxiosInstance'

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

//icons
import Face6Icon from '@mui/icons-material/Face6';
import SignalWifi0BarIcon from '@mui/icons-material/SignalWifi0Bar';
import NetworkWifi1BarIcon from '@mui/icons-material/NetworkWifi1Bar'
import NetworkWifi3BarIcon from '@mui/icons-material/NetworkWifi3Bar';
import NetworkWifiIcon from '@mui/icons-material/NetworkWifi';
import SignalWifi4BarIcon from '@mui/icons-material/SignalWifi4Bar';



export const Team = () => {
  const [teamData, setTeamData] = useState()
  const [loading, setLoading] = useState(true)

  const getRoleLabel = (roleCode) => {
    switch (roleCode) {
      case 'sm':
        return 'Scrum Master';
      case 'fe_dev':
        return 'Frontend Developer';
      case 'be_dev':
        return 'Backend Developer';
      case 'devops':
        return 'DevOps';
      case 'des':
        return 'Designer';
      case 'qa':
        return 'Quality Engineer';
      case 'ba':
        return 'Business Analyst';
      case 'sa':
        return 'Solution Architect';
      default:
        return roleCode;
    }
  };
  const getSeniorityLabel = (seniorityCode) => {
    switch (seniorityCode) {
      case 'intern':
        return (
          <>
            <SignalWifi0BarIcon sx={{fontSize:'medium', position:'relative', top:'2px', marginRight:'4px' }}/>{'Internship'} 
          </>
        );
      case 'junior':
        return (
          <>
            <NetworkWifi1BarIcon sx={{fontSize:'medium', position:'relative', top:'2px', marginRight:'4px' }}/>{'Junior'} 
          </>
        );
      case 'regular':
        return (
          <>
            <NetworkWifi3BarIcon sx={{fontSize:'medium', position:'relative', top:'2px', marginRight:'4px' }}/>{'Medium'} 
          </>
        );
      case 'senior':
        return (
          <>
            <NetworkWifiIcon sx={{fontSize:'medium', position:'relative', top:'2px', marginRight:'4px' }}/>{'Senior'} 
          </>
        );
      case 'expert':
        return (
          <>
            <SignalWifi4BarIcon sx={{fontSize:'medium', position:'relative', top:'2px', marginRight:'4px'}}/>{'Expert'} 
          </>
        );
      default:
        return seniorityCode;
    }
  };

  const GetData = () => {
    AxiosInstance.get('team/teammember/').then((res) => {
      setTeamData(res.data)
      setLoading(false)
    })
  }

  useEffect(() => {
    GetData();
  },[])

  return (
    <div>
      <h1>Team Members</h1>
      { loading ? <p>loading data...</p> : <div>
      <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="Team members">
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Team Member</TableCell>
            <TableCell>Role</TableCell>
            <TableCell>Seniority</TableCell>
            <TableCell></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
            {teamData.map((item, index) => (
              <TableRow
                key={index}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell>{index + 1}</TableCell>
                <TableCell>
                  <div style={{ display: 'flex', alignItems:'center', columnGap: '12px',}}>
                    {item.tm_photo? (
                      <div style={{ height: '50px', width: '50px', overflow:'hidden', borderRadius:'30px', display:'flex', justifyContent:'center',alignItems:'center',}}>
                        <img 
                          src={`${item.tm_photo}`}
                          alt="Team member photo"
                          style={{ minWidth: '50px', minHeight: '50px', objectFit:'cover', objectPosition:'center' }}
                        />
                      </div>
                    ) : (
                      <div style={{ height:'50px', width:'50px', border:'solid rgba(29, 33, 47, 0.1) 2px', borderRadius:'30px', display:'flex', justifyContent:'center',alignItems:'center'}}>
                        <Face6Icon style={{opacity: '40%'}}/>
                      </div>
                      )
                    }
                    {item.tm_name} {item.tm_lname}
                  </div>
                </TableCell>
                <TableCell>{getRoleLabel(item.tm_position)}</TableCell>
                <TableCell>{getSeniorityLabel(item.tm_seniority)}</TableCell>
                <TableCell>Link to details</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      </div>}
    </div>
  );
}
