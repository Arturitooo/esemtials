import { useState } from 'react'
import './App.css'
import { Home } from './components/Home'
import { Login } from './components/Login'
import Navbar from './components/Navbar'
import { Register } from './components/Register'
import { Routes, Route, useLocation } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import { Dashboard } from './components/dashboard/Dashboard'
import { Team } from './components/dashboard/team/Team'

function App() {
  const location = useLocation()
  const noNavbar = location.pathname === '/register' || location.pathname === '/login'
  return (
    <div className='container'>
    {
      noNavbar ? 
      // Pages withOUT navbar in them
      <Routes>
        <Route path='/register' element = { <Register/> } />
        <Route path='/login' element = { <Login/> } />
  
      </Routes>
      :
      // Pages with the navbar in them
      <Navbar 
      content = {
      <Routes>
        <Route element={<ProtectedRoute/>}>
          {/* THESE ARE LINKS UNAVAILABLE WITHOUT LOGGING IN - it redirects now to login - TO DO - CHANGE IT LATER */}
          <Route path='/dashboard' element = { <Dashboard/> } />  
          <Route path='/team' element = { <Team/> } />  
        </Route>
        <Route path='/' element = { <Home/> } />  
      </Routes>}
    />
    }

    </div>

  )
}

export default App
