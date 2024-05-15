import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom';
import { MyTextButton } from '../../forms/MyTextButton';
import AxiosInstance from '../../AxiosInstance';
import './TMDetailpage.css'

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';


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
            <NetworkWifi1BarIcon sx={{fontSize:'small', position:'relative', top:'2px', marginRight:'4px' }}/>{'Junior'} 
          </>
        );
      case 'regular':
        return (
          <>
            <NetworkWifi3BarIcon sx={{fontSize:'small', position:'relative', top:'2px', marginRight:'4px' }}/>{'Medium'} 
          </>
        );
      case 'senior':
        return (
          <>
            <NetworkWifiIcon sx={{fontSize:'small', position:'relative', top:'2px', marginRight:'4px' }}/>{'Senior'} 
          </>
        );
      case 'expert':
        return (
          <>
            <SignalWifi4BarIcon sx={{fontSize:'small', position:'relative', top:'2px', marginRight:'4px'}}/>{'Expert'} 
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
        <h1>Team member</h1>
        <Card className='team-member__card'>
          <CardContent className='team-member__content'>
            <div className='team-member__content--photo'>
                {TMData.tm_photo? (
                  <div style={{ height: '180px', width: '180px', overflow:'hidden', borderRadius:'90px', display:'flex', justifyContent:'center', alignItems:'center',}}>
                    <img 
                      src={TMData.tm_photo}
                      alt="Team member photo"
                      style={{ minWidth: '180px', minHeight: '180px', objectFit:'cover', objectPosition:'center' }}
                    />
                  </div>
                ) : (
                  <div style={{ height:'180px', width:'180px', border:'solid rgba(29, 33, 47, 0.1) 2px', borderRadius:'30px', display:'flex', justifyContent:'center',alignItems:'center'}}>
                    <Face6Icon style={{opacity: '40%'}}/>
                  </div>
                  )
                } 
            </div>
            <div>
              <div className='team-member__content--name'>
                <h2>{TMData.tm_name} {TMData.tm_lname} </h2>
              </div>
              <div className='team-member__content--details'>
                <div>
                  <h4>Role</h4>
                  <p>{getRoleLabel(TMData.tm_position)}</p>
                </div>
                <div>
                  <h4>Seniority</h4>
                  <p>{getSeniorityLabel(TMData.tm_seniority)}</p>
                </div>
                <div>
                  <h4>Joined</h4>
                  <p>{TMData.tm_joined} </p>
                </div>
                <div>
                  <h4>Summary</h4>
                  <p>{TMData.tm_summary}</p>
                </div>  
              </div>
              <div className="team-member__content--actions">
                <Button variant="outlined" startIcon={<EditIcon />}>
                  Edit details
                </Button>
                <Button variant="outlined" startIcon={<DeleteIcon />}>
                  Delete member
                </Button>
              </div>
            </div>
            </CardContent>
        </Card>
      </div>}
    </div>
  );
};
