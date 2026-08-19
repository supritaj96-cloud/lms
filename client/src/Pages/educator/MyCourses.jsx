import React, { useContext, useState, useEffect } from 'react'
import { AppContext } from '../../context/AppContext'
import Loading from '../../Components/student/Loading'
import { Link } from 'react-router-dom'

const MyCourses = () => {

  const {currency, getToken, request} = useContext(AppContext)

  const [courses, setCourses] = useState(null)

  const fetchEducatorCourses = async () => {
    try {
      const token = await getToken()
      const data = await request('/api/educator/courses', { token })
      setCourses(data.courses)
    } catch {
      setCourses([])
    }
  }

  const updatePublishStatus = async (course) => {
    try {
      const token = await getToken()
      await request(`/api/educator/courses/${course._id}`, {
        method: 'PUT', token,
        body: (() => { const form = new FormData(); form.append('courseData', JSON.stringify({ isPublished: !course.isPublished })); return form })()
      })
      fetchEducatorCourses()
    } catch (error) { alert(error.message) }
  }

  const removeCourse = async (course) => {
    if (!window.confirm(`Delete “${course.courseTitle}”? Courses with enrollments cannot be deleted.`)) return
    try {
      const token = await getToken()
      await request(`/api/educator/courses/${course._id}`, { method: 'DELETE', token })
      fetchEducatorCourses()
    } catch (error) { alert(error.message) }
  }

  useEffect(() =>{
    fetchEducatorCourses()
  }, [])

  return courses ? (
    <div className='min-h-screen flex flex-col items-start justify-between p-4 pt-8 md:p-8 md:pb-0'>
      <div className='w-full'>
      <h2 className="pb-4 text-xl font-semibold text-slate-800">My Courses</h2>
      <div className='sb-table flex w-full max-w-4xl flex-col items-center'>
        <table className='md:table-auto table-fixed w-full overflow-hidden'>
          <thead className="text-gray-900 border-b border-gray-500/20 text-sm text-left">
          <tr>
            <th className="px-4 py-3 font-semibold truncate">All Courses</th>
            <th className="px-4 py-3 font-semibold truncate">Earnings</th>
            <th className="px-4 py-3 font-semibold truncate">Students</th>
            <th className="px-4 py-3 font-semibold truncate">Published On</th>
            <th className="px-4 py-3 font-semibold truncate">Actions</th>

          </tr>
          </thead>
          <tbody className="text-sm text-gray-500">
            {courses.map((course) => (
              <tr key={course._id} className="border-b border-gray-500/20">
                <td className="md:px-4 pl-2 md:pl-4 py-3 flex items-center space-x-3 truncate">
                  <img src={course.courseThumbnail} alt="Course Image" className="w-16" />
                  <span className="truncate hidden md:block">{course.courseTitle}</span>
                </td>
                <td className="px-4 py-3">{currency} {Math.floor(course.enrolledStudents.length * (course.coursePrice - course.discount * course.coursePrice / 100))}</td>
                <td className="px-4 py-3">{course.enrolledStudents.length}</td>
                <td className="px-4 py-3">
                  {new Date(course.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 whitespace-nowrap space-x-2">
                  <Link className="font-medium text-[#3159d7] hover:text-[#243aa6]" to={`/educator/edit-course/${course._id}`}>Edit</Link>
                  <button className="font-medium text-[#3159d7] hover:text-[#243aa6]" onClick={() => updatePublishStatus(course)}>{course.isPublished ? 'Unpublish' : 'Publish'}</button>
                  <button className="font-medium text-rose-600 hover:text-rose-700" onClick={() => removeCourse(course)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
    </div>
  ) : <Loading/>
}

export default MyCourses
