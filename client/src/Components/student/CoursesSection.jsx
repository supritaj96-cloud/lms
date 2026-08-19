import React, { useContext }from 'react'
import { Link } from 'react-router-dom'
import { AppContext } from '../../context/AppContext'
import CourseCard from './CourseCard'


const CoursesSection = () => {

  const {allCourses, isLoadingCourses} = useContext(AppContext)
  return (
    <div className='py-16 md:px-40 px-8'>
        <span className='text-sm font-semibold uppercase tracking-[0.2em] text-blue-600'>Explore courses</span>
        <h2 className='mt-2 text-3xl font-bold text-slate-900'>Learn from the best</h2>
        <p className='text-sm md:text-base text-slate-500 mt-3'>Discover practical courses across development, design, business, and more—created to help you make real progress.</p>

        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 px-4 md:px-0 md:my-16 my-10 gap-4'>
          {allCourses.slice(0,4).map((course) => <CourseCard key={course._id} course={course}/>) }
        </div>

        {!isLoadingCourses && allCourses.length === 0 && <p className='text-gray-500'>Courses could not be loaded. Please try again shortly.</p>}

        <Link to={'/course-list'} onClick={()=> scrollTo(0,0)}
        className='text-gray-500 border border-gray-500/30 px-8 py-3 rounded'>
          Show all courses
        </Link>
    </div>
  )
}

export default CoursesSection

