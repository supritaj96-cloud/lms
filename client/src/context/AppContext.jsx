import { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import humanizeDuration from 'humanize-duration';
import { useAuth, useUser } from "@clerk/clerk-react";
import { backendUrl, request } from '../lib/api';


export const AppContext = createContext();

export const AppContextProvider = (props)=>{

    const currency = import.meta.env.VITE_CURRENCY
    const navigate = useNavigate()


    const{getToken} = useAuth()
    const {user} = useUser()

    const[allCourses, setAllCourses] = useState([])
    const [isEducator, setIsEducator] = useState(false)
    const[enrolledCourses, setEnrolledCourses] = useState([])
    const [userData, setUserData] = useState(null)
    const [isLoadingCourses, setIsLoadingCourses] = useState(true)

    //Fetch All Courses
    const fetchAllCourses = async ()=>{
        try {
            setIsLoadingCourses(true)
            const data = await request('/api/course/all')
            setAllCourses(data.courses)
        } catch {
            setAllCourses([])
        } finally {
            setIsLoadingCourses(false)
        }
    }

    //Funnction to calculate average rating of course
    const calculateRating = (course)=>{
       if(course.courseRatings.length===0){
          return 0;
       }
       let totalRating = 0
       course.courseRatings.forEach(rating => {
          totalRating += rating.rating
       })
       return totalRating / course.courseRatings.length;
    }

    //Function to calculate course chapter Time
    const calculateChapterTime = (chapter) => {
        let time = 0
        chapter.chapterContent.map((lecture)=> time += lecture.lectureDuration)
        return humanizeDuration(time * 60 * 1000, { units: ["h", "m"]})    
    }

    //Function to Calculate Course Duration
    const calculateCourseDuration = (course) => {
        let time=0
        course.courseContent.map((chapter)=> chapter.chapterContent.map((lecture) => time += lecture.lectureDuration))
        return humanizeDuration(time * 60 * 1000, { units: ["h", "m"] })
    }

    //Function to calculate no of lectures in the course
    const calculateNoOfLectures = (course) => {
        let totalLectures = 0;
        course.courseContent.forEach(chapter => {
            if(Array.isArray(chapter.chapterContent)){
                totalLectures += chapter.chapterContent.length;
            }
        });
        return totalLectures;
    }

    //Fetch User Enrolled Courses
    const fetchUserEnrolledCourses = async ()=>{
        if (!user) {
            setEnrolledCourses([])
            return
        }
        try {
            const token = await getToken()
            const data = await request('/api/user/enrolled-courses', { token })
            setEnrolledCourses(data.enrolledCourses)
        } catch {
            setEnrolledCourses([])
        }
    }

    const fetchUserData = async () => {
        if (!user) {
            setUserData(null)
            return
        }
        try {
            const token = await getToken()
            const data = await request('/api/user/data', { token })
            setUserData(data.user)
        } catch {
            setUserData(null)
        }
    }

  useEffect(()=>{
    fetchAllCourses()
  }, [])

  useEffect(() => {
    setIsEducator(user?.publicMetadata?.role === 'educator')
    fetchUserData()
    fetchUserEnrolledCourses()
  }, [user])

    const value={
        currency, allCourses, navigate, calculateRating, isEducator, setIsEducator, calculateChapterTime, calculateCourseDuration, calculateNoOfLectures, enrolledCourses, fetchUserEnrolledCourses, fetchUserData, fetchAllCourses, getToken, user, userData, isLoadingCourses, request, backendUrl
    }

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )

}
