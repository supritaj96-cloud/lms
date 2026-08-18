import Course from "../models/Course.js";

export const getAllCourse = async (req, res)=>{
    try{
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
