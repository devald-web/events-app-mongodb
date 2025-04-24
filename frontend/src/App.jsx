import React from 'react'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import Home from './pages/Home'          // listEvents y grid de cards
import CreateEvent from './pages/CreateEvent'

function App() {
  return (
    <BrowserRouter>
      <nav className="bg-white p-4 shadow mb-6">
        <Link to="/" className="mr-4 text-blue-600 hover:underline">Home</Link>
        <Link to="/create" className="text-blue-600 hover:underline">Crear Evento</Link>
      </nav>
      <div className="px-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/create" element={<CreateEvent />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App