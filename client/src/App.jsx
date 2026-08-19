import React from 'react'
import { Routes, Route, useMatch } from 'react-router-dom'
import Home from './Pages/student/Home'
import CoursesList from './Pages/student/CoursesList'
import CourseDetails from './Pages/student/CourseDetails'
import MyEnrollments from './Pages/student/MyEnrollments'
import Player from './Pages/student/Player'
import Loading from './Components/student/Loading'
import Educator  from './Pages/educator/Educator'
import Dashboard from './Pages/educator/Dashboard'
import AddCourse from './Pages/educator/AddCourse'
import MyCourses from './Pages/educator/MyCourses'
import StudentsEnrolled from './Pages/educator/StudentsEnrolled'
import Navbar from './Components/student/Navbar'
import "quill/dist/quill.snow.css";
import ProtectedRoute from './Components/ProtectedRoute'
import ChatWidget from './Components/student/ChatWidget'


const App = () => {

  const isEducatorRoute = useMatch('/educator/*')


  return (
    <div className='text-default min-h-screen bg-[#f5f7fb]'>
      {!isEducatorRoute && <Navbar />}
      
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/course-list' element={<CoursesList/>}/>
        <Route path='/course-list/:input' element={<CoursesList />} />
        <Route path='/course/:id' element={<CourseDetails />} />
        <Route path='/my-enrollments' element={<ProtectedRoute><MyEnrollments/></ProtectedRoute>} />
        <Route path='/player/:courseId' element={<ProtectedRoute><Player /></ProtectedRoute>} />
        <Route path='/loading/:path' element={<Loading />} />
        <Route path='/educator' element={<ProtectedRoute educatorOnly><Educator /></ProtectedRoute>}>
          <Route path='/educator' element={<Dashboard/>}/>
          <Route path='add-course' element={<AddCourse/>}/>
          <Route path='my-courses' element={<MyCourses/>}/>
          <Route path='edit-course/:id' element={<AddCourse/>}/>
          <Route path='student-enrolled' element={<StudentsEnrolled/>}/>
        </Route>
        
      </Routes>
      <ChatWidget />
      
    </div>
  )
}

export default App
