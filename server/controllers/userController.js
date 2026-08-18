import User from "../models/user.js"


// Get User Data
export const getUserData = async (req, res) => {
    try {
        console.log("Full req.auth:", req.auth)
        const userId = req.auth.userId
        console.log("Extracted userId:", userId)
        
        const user = await User.findById(userId)

        if (!user) {
            return res.status(404).json({ success: false, message: 'User Not Found' })
        }

        res.json({ success: true, user })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}

// Users Enrolled Courses with lecture Links
export const userEnrolledCourses = async (req, res) => {
    try {
        const userId = req.auth.userId
        const userData = await User.findById(userId).populate('enrolledCourses')

        if (!userData) {
            return res.status(404).json({ success: false, message: 'User Not Found' })
        }

        res.json({ success: true, enrolledCourses: userData.enrolledCourses })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}