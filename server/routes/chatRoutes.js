import express from 'express'
import { chatWithAssistant } from '../controllers/chatController.js'

const chatRouter = express.Router()
chatRouter.post('/', chatWithAssistant)

export default chatRouter
