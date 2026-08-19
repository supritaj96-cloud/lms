import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import connectDB from './configs/mongodb.js'
import { clerkWebhooks } from './controllers/webhooks.js'
import educatorRouter from './routes/educatorRoutes.js'
import { clerkMiddleware } from '@clerk/express'
import connectCloudinary from './configs/cloudinary.js'
import courseRouter from './routes/courseRoute.js'
import userRouter from './routes/userRoutes.js'
import paymentRouter from './routes/paymentRoutes.js'
import { stripeWebhook } from './controllers/paymentController.js'
import chatRouter from './routes/chatRoutes.js'

const currentDirectory = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: join(currentDirectory, '.env') })

// initialize express
const app = express()

// connect to database
await connectDB()
await connectCloudinary()

// Middlewares
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173').split(',').map((origin) => origin.trim()).filter(Boolean)
app.use(cors({
    origin: (origin, callback) => {
        const isVercelPreview = /^https:\/\/[a-z0-9-]+\.vercel\.app$/i.test(origin || '')
        callback(null, !origin || allowedOrigins.includes(origin) || isVercelPreview)
    },
    credentials: true
}));

app.use(clerkMiddleware())

// Routes
app.get('/', (req, res) => res.send("API Working"))

app.post('/clerk', express.json(),clerkWebhooks)
app.post('/api/payment/webhook', express.raw({ type: 'application/json' }), stripeWebhook)
app.use('/api/educator', express.json({ limit: '1mb' }), educatorRouter)
app.use('/api/course', express.json({ limit: '1mb' }), courseRouter)
app.use('/api/user', express.json({ limit: '1mb' }), userRouter)
app.use('/api/payment', express.json({ limit: '1mb' }), paymentRouter)
app.use('/api/chat', express.json({ limit: '20kb' }), chatRouter)

app.use((error, _req, res, _next) => {
    if (error.code === 'LIMIT_FILE_SIZE') return res.status(400).json({ success: false, message: 'Thumbnail must be 5 MB or smaller' })
    return res.status(400).json({ success: false, message: error.message || 'Invalid request' })
})


// Port
const PORT = process.env.PORT || 5000

if (!process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`)
    })
}

export default app
