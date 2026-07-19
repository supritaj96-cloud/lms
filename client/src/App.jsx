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


const App = () => {

  const isEducatorRoute = useMatch('/educator/*')


  return (
    <div className='text-default min-h-screen bg-white'>
      {!isEducatorRoute && <Navbar />}
      
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/course-list' element={<CoursesList/>}/>
        <Route path='/course-list/:input' element={<CoursesList />} />
        <Route path='/course/:id' element={<CourseDetails />} />
        <Route path='/my-enrollments' element={<MyEnrollments/>} />
        <Route path='/player/:courseId' element={<Player />} />
        <Route path='/loading/:path' element={<Loading />} />
        <Route path='/educator' element={<Educator />}>
          <Route path='/educator' element={<Dashboard/>}/>
          <Route path='add-course' element={<AddCourse/>}/>
          <Route path='my-courses' element={<MyCourses/>}/>
          <Route path='student-enrolled' element={<StudentsEnrolled/>}/>
        </Route>
        
      </Routes>
      
    </div>
  )
}

export default App