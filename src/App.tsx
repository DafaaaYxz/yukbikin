import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import CreateBot from './pages/CreateBot'
import Chat from './pages/Chat'

const App: React.FC = () => {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/create" element={<CreateBot />} />
          <Route path="/chat/:botId" element={<Chat />} />
        </Routes>
      </div>
    </Router>
  )
}

// Di useEffect Home.tsx atau App.tsx
useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const botId = params.get('bot');
  if (botId) {
    navigate(`/chat/${botId}`);
  }
}, []);

export default App
