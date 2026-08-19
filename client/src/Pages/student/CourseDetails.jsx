import React, { useContext, useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { AppContext } from '../../context/AppContext'
import Loading from '../../Components/student/Loading'
import { assets } from '../../assets/LMS_assets/assets/assets'
import humanizeDuration from 'humanize-duration'
import Footer from '../../Components/student/Footer'
import YouTube from 'react-youtube'
import { useClerk } from '@clerk/clerk-react'



const CourseDetails = () => {

  const {id} = useParams()

  const [courseData, setCourseData] = useState(null)
  const [openSections, setOpenSections] = useState({})
  const [isAlreadyEnrolled, setIsAlreadyEnrolled] = useState(false)
  const [playerData, setPlayerData] = useState(null)
  const [error, setError] = useState('')
  const { openSignIn } = useClerk()




  const {calculateRating, calculateNoOfLectures, calculateCourseDuration, calculateChapterTime, currency, getToken, request, user, userData, fetchUserData, fetchUserEnrolledCourses} = useContext(AppContext)

  const fetchCourseData = async ()=>{
    try {
      setError('')
      const data = await request(`/api/course/${id}`)
      setCourseData(data.courseData)
    } catch (error) {
      setError(error.message)
      setCourseData(null)
    }
  }

  useEffect(()=>{
    fetchCourseData()
  }, [id])

  useEffect(() => {
    setIsAlreadyEnrolled(Boolean(userData?.enrolledCourses?.some((courseId) => courseId.toString() === id)))
  }, [userData, id])

  const enrollCourse = async () => {
    if (!user) return openSignIn()
    try {
      const token = await getToken()
      const data = await request('/api/payment/checkout', {
        method: 'POST', token,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId: id })
      })
      if (data.freeEnrollment) {
        await Promise.all([fetchUserData(), fetchUserEnrolledCourses()])
        return
      }
      window.location.assign(data.sessionUrl)
    } catch (error) {
      alert(error.message)
      await Promise.all([fetchUserData(), fetchUserEnrolledCourses()])
    }
  }

  const toggleSection = (index) => {
    setOpenSections((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  if (error) return <div className='min-h-screen flex items-center justify-center text-gray-600'>{error}</div>
  return courseData ? (
    <>
    <div className='relative flex flex-col-reverse items-start justify-between gap-10 px-8 pt-16 text-left md:flex-row md:px-36 md:pt-24'>

      <div className= 'absolute top-0 left-0 w-full h-section-height -z-1 bg-gradient-to-b from-cyan-100/70'></div>
        
      

        {/* left column */}
        <div className='max-w-xl z-10 text-gray-500'>
          <h1 className='text-3xl md:text-5xl font-bold text-gray-800'>{courseData.courseTitle}</h1>
          <p className= 'pt-4 md:text-base text-sm'
          dangerouslySetInnerHTML={{ __html: courseData.courseDescription.slice(0, 200)}}></p>



        {/*review and ratings*/}
        <div className='flex items-center space-x-2 pt-3 pb-1 text-sm'>
                  <p>{calculateRating(courseData)}</p>
                  <div className='flex'>
                    {[...Array(5)].map((_, i)=>(<img key={i} src={i < Math.floor(calculateRating(courseData)) ? assets.star : assets.star_blank} alt='' className='w-3.5 h-3.5' />))}
                  </div>
                  <p className='text-gray-500'>({courseData.courseRatings.length} {courseData.courseRatings.length > 1 ? 'ratings' : 'rating'})</p>

                  <p>{courseData.enrolledStudents.length} {courseData.enrolledStudents.length > 1 ? 'students' : 'student'}</p>
                </div>

                <p className='text-sm'>Course by <span className='text-blue-600 underline'>{courseData.educator?.name || 'Educator'}</span></p>

               <div className='pt-8 text-gray-800'>
                <h2 className= 'text-xl font-semibold'>Course Structure</h2>

                <div className='pt-5'>
                  {courseData.courseContent.map((chapter,index)=>(
                    <div key={index} className='mb-3 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm'>
                      <div className='flex items-center justify-between px-4 py-3 cursor-pointer select-none' onClick={()=>toggleSection(index)}>
                        <div className='flex items-center gap-2'>
                      
                      
                          <img className={`transform transition-transform ${openSections[index] ? 'rotate-180' : ''}`}
                          src={assets.down_arrow_icon} alt="arrow icon" />
                          <p className='font-medium md:text-base text-sm'>{chapter.chapterTitle}</p>
                        </div>
                        <p className='text-sm md:text-default'>{chapter.chapterContent.length} lectures- {calculateChapterTime(chapter)}</p>
                      </div>

                      <div className={`overflow-hidden transition-all duration-300 ${openSections[index] ? 'max-h-96' : 'max-h-0'}`}>
                        <ul className='list-disc md: pl-10 pl-4 pr-4 py-2 text-gray-600 border-t border-gray-300'>
                          {chapter.chapterContent.map((lecture, i)=>(
                            <li key={i} className='flex items-center gap-2 py-1'>
                              <img src={assets.play_icon} alt="play icon" className='w-4 h-4 mt-1' />
                              <div className='flex items-center justify-between w-full text-gray-800 text-xs md:text-default'>
                                <p>{lecture.lectureTitle}</p>
                                <div className='flex gap-2'>
                                  {lecture.isPreviewFree && <p 
                                  onClick={() => setPlayerData({videoId: lecture.lectureUrl.split('/').pop()})}
                                  className='text-blue-500 cursor-pointer'>Preview</p>}
                                  <p>{humanizeDuration(lecture.lectureDuration * 60 * 1000, {units: ['h', 'm']})}</p>
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                  
                </div>
                </div>

                <div className='py-20 text-sm md:text-default'>
                <h3 className='text-xl font-semibold text-gray-800'>Course Description</h3>
                <p className= 'pt-3 rich-text'
          dangerouslySetInnerHTML={{ __html: courseData.courseDescription}}></p>
              </div>
        </div>

        {/* right column */}
        <div className='sb-panel z-10 min-w-[300px] max-w-course-card overflow-hidden sm:min-w-[420px]'>
          {
             playerData ? 
                <YouTube videoId={playerData.videoId} opts={{playerVars: { autoplay: 1 }}} iframeClassName='w-full aspect-video' />
                : <img src={courseData.courseThumbnail} alt="" />
              

          }
          
          <div className='p-5'>
            <div className='flex items-center gap-2'>
              
              <img className='w-3.5' src={assets.time_left_clock_icon} alt="time left clock icon" />
            
              <p className= 'text-red-500'><span className='font-medium'>5 days</span> left at this price!</p>
            </div>

            <div className='flex gap-3 items-center pt-2'>
              <p className='text-gray-800 md: text-4xl text-2xl font-semibold'>{currency}{(courseData.coursePrice - courseData.discount * courseData.coursePrice / 100).toFixed(2)} </p>
              <p className='md:text-lg text-gray-500 line-through'>{currency}{courseData.coursePrice}</p>
              <p className='md: text-lg text-gray-500'>{courseData.discount}% off</p>
            </div>

            <div className='flex items-center text-sm md:text-default gap-4 pt-2 md:pt-4 text-gray-500'>
              <div className='flex items-center gap-1'>
                <img src={assets.star} alt="star icon" />
                <p>{calculateRating(courseData)}</p>
              </div>
              <div className='h-4 w-px bg-gray-500/40'></div>

              <div className='flex items-center gap-1'>
                <img src={assets.time_clock_icon} alt="clock icon" />
                <p>{calculateCourseDuration(courseData)}</p>
              </div>

              <div className='h-4 w-px bg-gray-500/40'></div>

              <div className='flex items-center gap-1'>
                <img src={assets.lesson_icon} alt="clock icon" />
                <p>{calculateNoOfLectures(courseData)} lessons</p>
              </div>

            </div>

            <button onClick={enrollCourse} disabled={isAlreadyEnrolled} className='sb-button-primary mt-4 w-full py-3 disabled:bg-slate-400 md:mt-6'
            >{isAlreadyEnrolled ? 'Already Enrolled' : 'Enroll Now'}</button>

            <div className= 'pt-6'>
              <p className='md:text-xl text-lg font-medium text-gray-800'>What's in the course?</p>
              <ul className= 'ml-4 pt-2 text-sm md:text-default list-disc text-gray-500'>
                <li>Lifetime access with free updates.</li>
                <li>Step-by-step, hands-on project guidance.</li>
                <li>Downloadable resources and source code.</li>
              </ul>
    
            </div>

          </div>

        </div>
      </div>
      <Footer />
    </>
  ) : <Loading/>
}

export default CourseDetails

