import { Navigate, createBrowserRouter } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Quiz from './pages/Quiz'
import Results from './pages/Results'
import Custom from './pages/Custom'
import WordList from './pages/WordList'
import Progress from './pages/Progress'
import Settings from './pages/Settings'

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: '/', element: <Home /> },
      { path: '/quiz', element: <Quiz /> },
      { path: '/results', element: <Results /> },
      { path: '/custom', element: <Custom /> },
      { path: '/words', element: <WordList /> },
      { path: '/progress', element: <Progress /> },
      { path: '/settings', element: <Settings /> },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
])
