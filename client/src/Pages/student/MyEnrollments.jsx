import React, { useContext, useEffect } from 'react'
import { AppContext } from '../../context/AppContext'
import {Line} from 'rc-progress'
import Footer from '../../Components/student/Footer'
import { useSearchParams } from 'react-router-dom'


const MyEnrollments = () => {

  const {enrolledCourses, calculateCourseDuration, navigate, userData, getToken, request, fetchUserData, fetchUserEnrolledCourses} = useContext(AppContext)
  const [searchParams] = useSearchParams()
  const sessionId = searchParams.get('session_id')

  useEffect(() => {
    const verifyPayment = async () => {
      if (!sessionId) return
      try {
        const token = await getToken()
        await request(`/api/payment/verify/${sessionId}`, { token })
        await Promise.all([fetchUserData(), fetchUserEnrolledCourses()])
      } catch (error) {
        alert(error.message)
      }
    }
    verifyPayment()
  }, [sessionId])
  const getProgress = (course) => {
    const progress = userData?.courseProgress?.find((item) => item.courseId?.toString() === course._id)
    const totalLectures = course.courseContent.reduce((total, chapter) => total + chapter.chapterContent.length, 0)
    return { lectureCompleted: progress?.lectureCompleted?.length || 0, totalLectures }
  }
  return (
    <>
    <div className='md:px-36 px-8 pt-10 '>
      <h1 className='text-2xl font-semibold'>My Enrollments</h1>
      <table className='md:table-auto table-fixed w-full overflow-hidden border mt-10'>
        <thead className='text-gray-900 border-b border-gray-500/20 text-sm text-left max-sm:hidden'>
          <tr>
            <th className='px-4 py-3 font-semibold truncate'>Course</th>
            <th className='px-4 py-3 font-semibold truncate'>Duration</th>
            <th className='px-4 py-3 font-semibold truncate'>Completed</th>
            <th className='px-4 py-3 font-semibold truncate'>Status</th>
          </tr>
        </thead>
        <tbody className= 'text-gray-700'>
          {enrolledCourses.map((course)=>(
            (() => { const progress = getProgress(course); return (
            <tr key={course._id} className= 'border-b border-gray-500/20'>
              <td className='md:px-4 pl-2 md:pl-4 py-3 flex items-center space-x-3'>
                <img src={course.courseThumbnail} alt="" className='w-14 sm:w-24 md:w-28'/>
                <div className='flex-1'>
                  <p className='mb-1 max-sm:text-sm'>{course.courseTitle}</p>
                  <Line strokeWidth={2} percent={progress.totalLectures ? (progress.lectureCompleted * 100) / progress.totalLectures : 0} className='bg-gray-300 rounded-full'/>
                </div>
              </td>
              <td className='px-4 py-3 max-sm:hidden'>
                {calculateCourseDuration(course)}
              </td>
              <td className= 'px-4 py-3 max-sm:hidden'>
                {`${progress.lectureCompleted} / ${progress.totalLectures}`} <span>Lectures</span>
              </td>
              <td className='px-4 py-3 max-sm:text-right'>
                <button className='px-3 sm:px-5 py-1.5 sm:py-2 bg-blue-600 max-sm:text-xs text-white' onClick={()=> navigate('/player/' + course._id)}>
                  {progress.totalLectures > 0 && progress.lectureCompleted / progress.totalLectures === 1 ? 'Completed' :'Continue'}</button>
              </td>
            </tr>
            )})()
          ))}
        </tbody>
      </table>
    </div>

    <Footer />
    </>
  )
}

export default MyEnrollments
