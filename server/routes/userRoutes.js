import express from 'express'
import { getUserData, rateCourse, updateCourseProgress, userEnrolledCourses } from '../controllers/userController.js'
import { requireAuth } from '../middlewares/authMiddleware.js'

const userRouter = express.Router()

userRouter.use(requireAuth)
userRouter.get('/data', getUserData)
userRouter.get('/enrolled-courses', userEnrolledCourses)
userRouter.patch('/course/:courseId/progress', updateCourseProgress)
userRouter.put('/course/:courseId/rating', rateCourse)

export default userRouter;
