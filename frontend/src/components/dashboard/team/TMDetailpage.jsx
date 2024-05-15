import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom';
import { MyTextButton } from '../../forms/MyTextButton';
import AxiosInstance from '../../AxiosInstance';

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
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

export const TMDetailpage = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(true)
  const [TMData, setTMData] = useState(null)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

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

  const GetData = (id) => {
    const url = `team/teammember/${id}`;
    AxiosInstance.get(url)
    .then((res) => {
      setTMData(res.data)
      setLoading(false)
      console.log(res.data)
    })
  }

  useEffect(() => {
    GetData(id);
  },[id])

  


  return (

    <div>
      { loading ? <p>loading data...</p> : <div>
      <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="Team members">
        <TableHead>
          <TableRow>
            <TableCell>Team Member</TableCell>
            <TableCell>Role</TableCell>
            <TableCell>Seniority</TableCell>
            <TableCell>Joined</TableCell>
            <TableCell>Summary</TableCell>
            <TableCell>Modify</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
              <TableRow
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell>
                  <div style={{ display: 'flex', alignItems:'center', columnGap: '12px',}}>
                    {TMData.tm_photo? (
                      <div style={{ height: '50px', width: '50px', overflow:'hidden', borderRadius:'30px', display:'flex', justifyContent:'center',alignItems:'center',}}>
                        <img 
                          src={TMData.tm_photo}
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
                    {TMData.tm_name} {TMData.tm_lname} 
                  </div>
                </TableCell>
                <TableCell>{getRoleLabel(TMData.tm_position)}</TableCell>
                <TableCell>{getSeniorityLabel(TMData.tm_seniority)}</TableCell>
                <TableCell>
                  {TMData.tm_joined} 
                </TableCell>
                <TableCell>
                  {TMData.tm_summary} 
                </TableCell>
                <TableCell>
                  <EditIcon 
                    style={{ 
                      position: 'relative',
                      fontSize:'large',
                      marginLeft: '3px', 
                      color: '#1D212F66',  
                      top: '2px',
                      }} 
                    onMouseEnter={(e) => e.target.style.color = 'black'}
                    onMouseLeave={(e) => e.target.style.color = '#1D212F66'} 
                    // onClick={handleEditNoteName} 
                  />
                  <DeleteIcon 
                    style={{ 
                      position: 'relative',
                      fontSize:'large',
                      marginLeft: '0px', 
                      color: '#1D212F66', 
                      top: '2px',
                    }} 
                    onMouseEnter={(e) => e.target.style.color = 'black'}
                    onMouseLeave={(e) => e.target.style.color = '#1D212F66'}
                    // onClick={handleConfirmDeleteTM} 
                  />
                </TableCell>
              </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
      </div>}
    </div>
  );
};
