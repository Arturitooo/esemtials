import { useState } from 'react'
import './App.css'
import { Home } from './components/Home'
import { Login } from './components/Login'
import Navbar from './components/Navbar'
import { Register } from './components/Register'
import { Routes, Route, useLocation } from 'react-router-dom'

function App() {
  const location = useLocation()
  const noNavbar = location.pathname === '/register' || location.pathname === '/login'
  return (
    <>
    {
      noNavbar ? 

      <Routes>
        <Route path='/register' element = { <Register/> } />
        <Route path='/login' element = { <Login/> } />
  
      </Routes>
      :
      
      <Navbar 
      content = {<Routes>
        <Route path='/' element = { <Home/> } />  
      </Routes>}
    />
    }

    </>

  )
}

export default App
