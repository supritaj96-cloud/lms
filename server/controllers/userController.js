import User from "../models/user.js"
import { getAuth } from '@clerk/express'
import Course from '../models/Course.js'
import { ensureUser } from '../utils/ensureUser.js'


// Get User Data
export const getUserData = async (req, res) => {
    try {
        const { userId } = getAuth(req)
        
        const user = await ensureUser(userId)

        res.json({ success: true, user })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}

// Users Enrolled Courses with lecture Links
export const userEnrolledCourses = async (req, res) => {
    try {
        const { userId } = getAuth(req)
        await ensureUser(userId)
        const userData = await User.findById(userId).populate({
            path: 'enrolledCourses',
            populate: { path: 'educator', select: 'name imageUrl' }
        })

        if (!userData) {
            return res.status(404).json({ success: false, message: 'User Not Found' })
        }

        res.json({ success: true, enrolledCourses: userData.enrolledCourses })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}

export const updateCourseProgress = async (req, res) => {
    try {
        const { userId } = getAuth(req)
        const { courseId } = req.params
        const { lectureId, completed } = req.body
        const user = await ensureUser(userId)
        const course = await Course.findById(courseId)
        if (!user || !course) return res.status(404).json({ success: false, message: 'User or course not found' })
        if (!user.enrolledCourses.some((id) => id.equals(course._id))) {
            return res.status(403).json({ success: false, message: 'You are not enrolled in this course' })
        }
        const lectureExists = course.courseContent.some((chapter) => chapter.chapterContent.some((lecture) => lecture.lectureId === lectureId))
        if (!lectureExists) return res.status(404).json({ success: false, message: 'Lecture not found' })

        let progress = user.courseProgress.find((item) => item.courseId.equals(course._id))
        if (!progress) {
            progress = { courseId: course._id, lectureCompleted: [] }
            user.courseProgress.push(progress)
            progress = user.courseProgress[user.courseProgress.length - 1]
        }
        const completedSet = new Set(progress.lectureCompleted)
        if (completed) completedSet.add(lectureId)
        else completedSet.delete(lectureId)
        progress.lectureCompleted = [...completedSet]
        progress.lastAccessedAt = new Date()
        const totalLectures = course.courseContent.reduce((total, chapter) => total + chapter.chapterContent.length, 0)
        progress.completedAt = totalLectures > 0 && progress.lectureCompleted.length === totalLectures ? new Date() : null
        await user.save()
        return res.json({ success: true, progress })
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message })
    }
}

export const rateCourse = async (req, res) => {
    try {
        const { rating } = req.body
        const { courseId } = req.params
        if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
            return res.status(400).json({ success: false, message: 'Rating must be an integer from 1 to 5' })
        }
        const { userId } = getAuth(req)
        const user = await ensureUser(userId)
        const course = await Course.findById(courseId)
        if (!user || !course) return res.status(404).json({ success: false, message: 'User or course not found' })
        if (!user.enrolledCourses.some((id) => id.equals(course._id))) {
            return res.status(403).json({ success: false, message: 'Only enrolled students can rate a course' })
        }
        const existingRating = course.courseRatings.find((item) => item.userId === userId)
        if (existingRating) existingRating.rating = rating
        else course.courseRatings.push({ userId, rating })
        await course.save()
        return res.json({ success: true, courseRatings: course.courseRatings })
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message })
    }
}
