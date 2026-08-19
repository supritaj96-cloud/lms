import { clerkClient, getAuth } from '@clerk/express'
import Course from '../models/Course.js'
import { Purchase } from '../models/Purchase.js'
import User from '../models/user.js'
import { v2 as cloudinary } from 'cloudinary'
import { unlink } from 'node:fs/promises'

const courseFields = ['courseTitle', 'courseDescription', 'category', 'coursePrice', 'discount', 'courseContent', 'isPublished']

const sanitizeHtml = (html = '') => String(html)
    .replace(/<\/?(script|style)[^>]*>/gi, '')
    .replace(/\son\w+\s*=\s*(['"]).*?\1/gi, '')
    .replace(/javascript:/gi, '')
    .trim()

const isValidUrl = (value) => {
    try {
        const url = new URL(value)
        return ['http:', 'https:'].includes(url.protocol)
    } catch { return false }
}

const normalizeCourseContent = (content = []) => content.map((chapter, chapterIndex) => ({
    chapterId: chapter.chapterId,
    chapterTitle: chapter.chapterTitle?.trim(),
    chapterOrder: chapterIndex + 1,
    chapterContent: (chapter.chapterContent || []).map((lecture, lectureIndex) => ({
        lectureId: lecture.lectureId,
        lectureTitle: lecture.lectureTitle?.trim(),
        lectureDuration: Number(lecture.lectureDuration),
        lectureUrl: lecture.lectureUrl?.trim(),
        isPreviewFree: Boolean(lecture.isPreviewFree),
        lectureOrder: lectureIndex + 1
    }))
}))

const getCoursePayload = (data) => {
    const payload = {}
    courseFields.forEach((field) => {
        if (data[field] !== undefined) payload[field] = data[field]
    })
    if (payload.courseDescription !== undefined) payload.courseDescription = sanitizeHtml(payload.courseDescription)
    if (payload.courseContent) payload.courseContent = normalizeCourseContent(payload.courseContent)
    if (payload.coursePrice !== undefined) payload.coursePrice = Number(payload.coursePrice)
    if (payload.discount !== undefined) payload.discount = Number(payload.discount)
    return payload
}

const validateCoursePayload = (payload, { requireAllFields = false } = {}) => {
    if (requireAllFields && (!payload.courseTitle || !payload.courseDescription || payload.coursePrice === undefined || payload.discount === undefined)) {
        throw new Error('Course title, description, price and discount are required')
    }
    if (payload.courseTitle !== undefined && (payload.courseTitle.trim().length < 3 || payload.courseTitle.trim().length > 160)) {
        throw new Error('Course title must be between 3 and 160 characters')
    }
    if (payload.courseDescription !== undefined && payload.courseDescription.replace(/<[^>]*>/g, '').trim().length < 10) {
        throw new Error('Course description must contain at least 10 characters')
    }
    if (payload.coursePrice !== undefined && (!Number.isFinite(payload.coursePrice) || payload.coursePrice < 0)) throw new Error('Course price must be a valid positive amount')
    if (payload.discount !== undefined && (!Number.isFinite(payload.discount) || payload.discount < 0 || payload.discount > 100)) throw new Error('Discount must be between 0 and 100')
    if (payload.courseContent !== undefined) {
        if (!Array.isArray(payload.courseContent)) throw new Error('Course content must be a list of chapters')
        for (const chapter of payload.courseContent) {
            if (!chapter.chapterId || !chapter.chapterTitle || !Array.isArray(chapter.chapterContent)) throw new Error('Every chapter needs a title')
            for (const lecture of chapter.chapterContent) {
                if (!lecture.lectureId || !lecture.lectureTitle || !Number.isFinite(lecture.lectureDuration) || lecture.lectureDuration <= 0 || !isValidUrl(lecture.lectureUrl)) {
                    throw new Error('Each lecture needs a title, positive duration, and valid URL')
                }
            }
        }
    }
}

const uploadThumbnail = async (file) => {
    if (!file) return null
    try {
        // The existing Cloudinary account uses an unsigned upload preset. Keep the
        // tutorial preset as the backward-compatible fallback and allow deployment
        // environments to provide their own preset.
        const preset = process.env.CLOUDINARY_UPLOAD_PRESET || 'cloudi'
        const result = await cloudinary.uploader.unsigned_upload(file.path, preset, { folder: 'lms/course-thumbnails' })
        return result.secure_url
    } finally {
        await unlink(file.path).catch(() => {})
    }
}

// Update role to educator
export const updateRoleToEducator = async (req, res) => {
    try {
        const { userId } = getAuth(req);
        if (!userId) return res.status(401).json({ success: false, message: 'User not authenticated' })

        await clerkClient.users.updateUserMetadata(userId, {
            publicMetadata: {
                role: "educator"
            }
        });

        return res.status(200).json({
            success: true,
            message: "You can publish a course now"
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Add New Course
export const addCourse = async (req, res) => {
    try {
        const { courseData } = req.body;
        const imageFile = req.file;
        const { userId: educatorId } = getAuth(req);

        if (!imageFile) {
            return res.json({
                success: false,
                message: "Thumbnail Not Attached"
            });
        }

        const parsedCourseData = getCoursePayload(JSON.parse(courseData));
        validateCoursePayload(parsedCourseData, { requireAllFields: true })
        parsedCourseData.educator = educatorId
        parsedCourseData.courseThumbnail = await uploadThumbnail(imageFile)
        const newCourse = await Course.create(parsedCourseData)

        res.status(201).json({
            success: true,
            message: "Course Added",
            course: newCourse
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Get Educator Courses
export const getEducatorCourses = async (req, res)=>{
    try {
        const { userId: educator } = getAuth(req)
        const courses = await Course.find({educator}).sort({ createdAt: -1 })
        res.status(200).json({ success: true, courses })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}

export const getEducatorCourse = async (req, res) => {
    try {
        const { userId: educator } = getAuth(req)
        const course = await Course.findOne({ _id: req.params.id, educator })
        if (!course) return res.status(404).json({ success: false, message: 'Course not found' })
        return res.json({ success: true, course })
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message })
    }
}

export const updateCourse = async (req, res) => {
    try {
        const { userId: educator } = getAuth(req)
        const course = await Course.findOne({ _id: req.params.id, educator })
        if (!course) return res.status(404).json({ success: false, message: 'Course not found' })
        const payload = getCoursePayload(JSON.parse(req.body.courseData || '{}'))
        validateCoursePayload(payload)
        if (req.file) payload.courseThumbnail = await uploadThumbnail(req.file)
        Object.assign(course, payload)
        await course.save()
        return res.json({ success: true, message: 'Course updated', course })
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message })
    }
}

export const deleteCourse = async (req, res) => {
    try {
        const { userId: educator } = getAuth(req)
        const course = await Course.findOne({ _id: req.params.id, educator })
        if (!course) return res.status(404).json({ success: false, message: 'Course not found' })
        const completedPurchases = await Purchase.exists({ courseId: course._id, status: 'completed' })
        if (completedPurchases) return res.status(409).json({ success: false, message: 'Courses with enrollments cannot be deleted' })
        await Purchase.deleteMany({ courseId: course._id, status: { $in: ['pending', 'failed'] } })
        await Course.deleteOne({ _id: course._id })
        return res.json({ success: true, message: 'Course deleted' })
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message })
    }
}
//Get Educator Dashboard Data ( Total Earning, Enrolled Students, No. of Courses)
export const educatorDashboardData = async (req, res)=>{
    try{
        const { userId: educator } = getAuth(req);
        const courses = await Course.find({educator});
        const totalCourses = courses.length;

        const courseIds = courses.map(course => course._id);

        //Calculate total earnings from purchases
        const purchases = await Purchase.find({ 
            courseId: {$in: courseIds},
            status: 'completed'
        });

        const totalEarnings = purchases.reduce((sum, purchase)=> sum + purchase.amount, 0);

        // Collect unique enrolled student IDs with their course titles
        const enrolledStudentsData = [];
        for( const course of courses){
            const students = await User.find({
                _id: {$in: course.enrolledStudents}
            }, 'name imageUrl');

            students.forEach(student => {
                enrolledStudentsData.push({
                    courseTitle: course.courseTitle,
                    student
                });
            })
        }
        res.json({success: true, dashboardData: {
            totalEarnings, enrolledStudentsData, totalCourses,
            publishedCourses: courses.filter((course) => course.isPublished).length
        }})

    } catch (error) {
        res.status(500).json({success: false, message: error.message });
    }
}

// Get Enrolled Students Data with Purchase Data
export const getEnrolledStudentsData = async (req, res) => {
    try{
        const { userId: educator } = getAuth(req);
        const courses = await Course.find({educator});
        const courseIds = courses.map(course => course._id);

        const purchases = await Purchase.find({
            courseId: { $in: courseIds },
            status: 'completed'
        }).populate('userId', 'name imageUrl').populate('courseId', 'courseTitle')

        const enrolledStudents = purchases.map(purchase => ({
            student: purchase.userId,
            courseTitle: purchase.courseId.courseTitle,
            purchaseData: purchase.createdAt
        }));

        res.json({success: true, enrolledStudents})
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }

}
