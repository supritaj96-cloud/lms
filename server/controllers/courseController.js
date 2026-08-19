import Course from "../models/Course.js";

const starterCourses = [
    {
        courseTitle: 'Introduction to Web Development',
        courseDescription: '<p>Build a strong foundation in HTML, CSS and modern JavaScript. This beginner-friendly course includes practical lessons and a guided project.</p>',
        category: 'Development',
        courseThumbnail: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80',
        coursePrice: 0,
        discount: 0,
        isPublished: true,
        educator: 'starter_educator',
        courseContent: [{
            chapterId: 'starter-web-basics', chapterOrder: 1, chapterTitle: 'Web development basics',
            chapterContent: [{ lectureId: 'starter-html', lectureOrder: 1, lectureTitle: 'How the web works', lectureDuration: 20, lectureUrl: 'https://www.youtube.com/watch?v=UB1O30fR-EE', isPreviewFree: true }]
        }]
    },
    {
        courseTitle: 'UI/UX Design Fundamentals',
        courseDescription: '<p>Learn user-centred design, wireframing, visual hierarchy and the essentials needed to create clear and useful digital interfaces.</p>',
        category: 'Design',
        courseThumbnail: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=1200&q=80',
        coursePrice: 0,
        discount: 0,
        isPublished: true,
        educator: 'starter_educator',
        courseContent: [{
            chapterId: 'starter-design-basics', chapterOrder: 1, chapterTitle: 'Design foundations',
            chapterContent: [{ lectureId: 'starter-design-thinking', lectureOrder: 1, lectureTitle: 'Introduction to design thinking', lectureDuration: 18, lectureUrl: 'https://www.youtube.com/watch?v=_r0VX-aU_T8', isPreviewFree: true }]
        }]
    }
]

const ensureStarterCourses = async () => {
    const courseCount = await Course.countDocuments()
    if (courseCount === 0) await Course.insertMany(starterCourses)
}

export const getAllCourse = async (req, res)=>{
    try{
        // A fresh database should still provide a useful landing page. These
        // published, free starter courses are inserted only once; educator
        // courses remain the primary data source afterwards.
        await ensureStarterCourses()
        const { search, category } = req.query
        const filter = { isPublished: true }
        if (category) filter.category = category
        if (search) filter.courseTitle = { $regex: search, $options: 'i' }
        const courses = await Course.find(filter)
            .select(['-courseContent', '-enrolledStudents'])
            .populate({ path: 'educator', select: 'name imageUrl' })
            .sort({ createdAt: -1 })

        res.json({ success: true, courses })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}

//Get Course by Id
export const getCourseId = async (req, res)=>{
    const {id} = req.params

    try{
        const courseData = await Course.findOne({ _id: id, isPublished: true })
            .populate({ path: 'educator', select: 'name imageUrl' })
        if (!courseData) return res.status(404).json({ success: false, message: 'Course not found' })

        //Remove lectureUrl if isPreviewFree is false
        courseData.courseContent.forEach(chapter => {
            chapter.chapterContent.forEach(lecture => {
                if(!lecture.isPreviewFree){
                    lecture.lectureUrl = "";
                }
            })
        })

        res.status(200).json({ success: true, courseData })
    } catch (error) {
        res.status(400).json({ success: false, message: error.message })

    }
}
