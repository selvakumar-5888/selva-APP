import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import SplashPage from './pages/splash/SplashPage'
import LoginPage from './pages/auth/LoginPage'
import SignUpPage from './pages/auth/SignUpPage'
import OnboardingPage from './pages/onboarding/OnboardingPage'
import DashboardPage from './pages/dashboard/DashboardPage'
import LibraryPage from './pages/library/LibraryPage'
import TasksPage from './pages/tasks/TasksPage'
import NotesPage from './pages/notes/NotesPage'
import FlashcardsPage from './pages/flashcards/FlashcardsPage'
import ProfilePage from './pages/profile/ProfilePage'
import StudyRoomsPage from './pages/study-rooms/StudyRoomsPage'
import LeaderboardPage from './pages/leaderboard/LeaderboardPage'

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-center" toastOptions={{ style: { background: '#09090b', color: '#f8fafc', border: '1px solid rgba(79, 172, 254, 0.2)' } }} />
      <Routes>
        <Route path="/" element={<SplashPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/library" element={<LibraryPage />} />
        <Route path="/tasks" element={<TasksPage />} />
        <Route path="/notes" element={<NotesPage />} />
        <Route path="/flashcards" element={<FlashcardsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/study-rooms" element={<StudyRoomsPage />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
