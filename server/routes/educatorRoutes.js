import express from 'express'
import {addCourse, deleteCourse, educatorDashboardData, getEducatorCourse, getEducatorCourses, getEnrolledStudentsData, updateCourse, updateRoleToEducator} from '../controllers/educatorController.js';
import upload from '../configs/multer.js';
import { protectEducator, requireAuth } from '../middlewares/authMiddleware.js';

const educatorRouter = express.Router()

//Add Educator Role
educatorRouter.post('/update-role', requireAuth, updateRoleToEducator)
educatorRouter.post('/add-course', protectEducator, upload.single('image'), addCourse)
educatorRouter.get('/courses', protectEducator, getEducatorCourses)
educatorRouter.get('/courses/:id', protectEducator, getEducatorCourse)
educatorRouter.put('/courses/:id', protectEducator, upload.single('image'), updateCourse)
educatorRouter.delete('/courses/:id', protectEducator, deleteCourse)
educatorRouter.get('/dashboard', protectEducator, educatorDashboardData)
educatorRouter.get('/enrolled-students' , protectEducator, getEnrolledStudentsData)


export default educatorRouter;
