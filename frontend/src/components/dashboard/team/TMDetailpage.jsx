import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import AxiosInstance from '../../AxiosInstance';
import {MyModal} from '../../forms/MyModal';
import { MyTextButton } from '../../forms/MyTextButton';



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
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true)
  const [tMData, setTMData] = useState(null)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const handleConfirmDeleteTM = () => {
    setDeleteModalOpen(true);
  }

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

  const handleDeleteTM = () => {
    DeleteTM();
    setDeleteModalOpen(false);
    navigate('/team/');
  }

  const DeleteTM = () => {
    const url = `team/teammember/${id}`;
    AxiosInstance.delete(url)
    .then(() => {
      console.log("you've successfully deleted the team member")
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
                    {tMData.tm_photo? (
                      <div style={{ height: '50px', width: '50px', overflow:'hidden', borderRadius:'30px', display:'flex', justifyContent:'center',alignItems:'center',}}>
                        <img 
                          src={tMData.tm_photo}
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
                    {tMData.tm_name} {tMData.tm_lname} 
                  </div>
                </TableCell>
                <TableCell>{getRoleLabel(tMData.tm_position)}</TableCell>
                <TableCell>{getSeniorityLabel(tMData.tm_seniority)}</TableCell>
                <TableCell>
                  {tMData.tm_joined} 
                </TableCell>
                <TableCell>
                  {tMData.tm_summary} 
                </TableCell>
                <TableCell>
                  <EditIcon 
                    style={{ 
                      position: 'relative',
                      fontSize:'large',
                      marginLeft: '3px', 
                      color: '#1D212F66',  
                      top: '2px',
                      cursor:'pointer',
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
                      cursor:'pointer',
                    }} 
                    onMouseEnter={(e) => e.target.style.color = 'black'}
                    onMouseLeave={(e) => e.target.style.color = '#1D212F66'}
                    onClick={handleConfirmDeleteTM} 
                  />
                </TableCell>
              </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
      </div>}

      <MyModal
        open={deleteModalOpen}
        handleClose={() => setDeleteModalOpen(false)}
        title="Confirm Deletion"
        content={
          <span>
            Are you sure you want to delete team member{' '}
            {tMData ? (
              <>
                <strong>{tMData.tm_name}</strong> <strong>{tMData.tm_lname}</strong>
              </>
            ) : (
              ''
            )}
            ?
          </span>
        }
        actions={[
          { label: 'Yes', onClick: handleDeleteTM },
          { label: 'No', onClick: () => setDeleteModalOpen(false) },
        ]}
      />

    </div>
  );
};
