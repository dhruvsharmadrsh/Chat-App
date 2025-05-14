import { Route,Routes } from 'react-router'

import HomePage from './pages/HomePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import SignupPage from './pages/SignUpPage.jsx';
import OnboardingPage from './pages/OnboardingPage.jsx';
import ChatPage from './pages/ChatPage.jsx';
import CallPage from './pages/CallPage.jsx';
import NotificationsPage from './pages/NotificationsPage.jsx';


const App = () => {
  return (
    <div className=" h-screen  "data-theme="night">
      
    <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/call" element={<CallPage />} />
        <Route path="/notification" element={<NotificationsPage/>} />
    </Routes>

    </div>
  )
}

export default App
