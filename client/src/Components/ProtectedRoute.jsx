import { useUser } from '@clerk/clerk-react'
import { Navigate, useLocation } from 'react-router-dom'
import Loading from './student/Loading'

const ProtectedRoute = ({ children, educatorOnly = false }) => {
  const { isLoaded, isSignedIn, user } = useUser()
  const location = useLocation()
  if (!isLoaded) return <Loading />
  if (!isSignedIn) return <Navigate to="/" state={{ from: location.pathname }} replace />
  if (educatorOnly && user.publicMetadata?.role !== 'educator') return <Navigate to="/" replace />
  return children
}

export default ProtectedRoute
