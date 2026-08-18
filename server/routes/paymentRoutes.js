import express from 'express'
import { requireAuth } from '../middlewares/authMiddleware.js'
import { createCheckoutSession, verifyCheckoutSession } from '../controllers/paymentController.js'

const paymentRouter = express.Router()
paymentRouter.post('/checkout', requireAuth, createCheckoutSession)
paymentRouter.get('/verify/:sessionId', requireAuth, verifyCheckoutSession)

export default paymentRouter
