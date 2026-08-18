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

const currentDirectory = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: join(currentDirectory, '.env') })

// initialize express
const app = express()

// connect to database
await connectDB()
await connectCloudinary()

// Middlewares
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173').split(',').map((origin) => origin.trim())
app.use(cors({
    origin: (origin, callback) => callback(null, !origin || allowedOrigins.includes(origin)),
    credentials: true
}));

app.use(clerkMiddleware())

// Routes
app.get('/', (req, res) => res.send("API Working"))

app.post('/clerk', express.json(),clerkWebhooks)
app.post('/api/payment/webhook', express.raw({ type: 'application/json' }), stripeWebhook)
app.use('/api/educator', express.json(), educatorRouter)
app.use('/api/course', express.json(), courseRouter)
app.use('/api/user', express.json(), userRouter)
app.use('/api/payment', express.json(), paymentRouter)


// Port
const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})
