import Stripe from 'stripe'
import Course from '../models/Course.js'
import User from '../models/user.js'
import { Purchase } from '../models/Purchase.js'
import { getAuth } from '@clerk/express'

const getStripe = () => {
    if (!process.env.STRIPE_SECRET_KEY) {
        throw new Error('Stripe is not configured')
    }
    return new Stripe(process.env.STRIPE_SECRET_KEY)
}

const getFinalPrice = (course) => Math.round(
    Math.max(0, course.coursePrice - (course.coursePrice * course.discount) / 100) * 100
)

export const createCheckoutSession = async (req, res) => {
    try {
        const { userId } = getAuth(req)
        const { courseId } = req.body
        const course = await Course.findOne({ _id: courseId, isPublished: true })

        if (!course) return res.status(404).json({ success: false, message: 'Course not found' })

        const user = await User.findById(userId)
        if (!user) return res.status(404).json({ success: false, message: 'User not found' })
        if (user.enrolledCourses.some((id) => id.equals(course._id))) {
            return res.status(409).json({ success: false, message: 'You are already enrolled in this course' })
        }

        const finalPrice = getFinalPrice(course)
        if (finalPrice === 0) {
            await Promise.all([
                Purchase.create({ courseId: course._id, userId, amount: 0, status: 'completed' }),
                Course.findByIdAndUpdate(course._id, { $addToSet: { enrolledStudents: userId } }),
                User.findByIdAndUpdate(userId, { $addToSet: { enrolledCourses: course._id } })
            ])
            return res.status(201).json({ success: true, freeEnrollment: true })
        }

        const stripe = getStripe()
        const clientUrl = (process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/$/, '')
        const session = await stripe.checkout.sessions.create({
            mode: 'payment',
            payment_method_types: ['card'],
            client_reference_id: userId,
            customer_email: user.email,
            line_items: [{
                price_data: {
                    currency: (process.env.CURRENCY || 'usd').toLowerCase(),
                    product_data: { name: course.courseTitle, images: course.courseThumbnail ? [course.courseThumbnail] : [] },
                    unit_amount: finalPrice
                },
                quantity: 1
            }],
            metadata: { courseId: course._id.toString(), userId },
            success_url: `${clientUrl}/my-enrollments?payment=success&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${clientUrl}/course/${course._id}?payment=cancelled`
        })

        await Purchase.create({
            courseId: course._id,
            userId,
            amount: finalPrice / 100,
            stripeSessionId: session.id
        })

        return res.status(201).json({ success: true, sessionUrl: session.url })
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }
}

export const fulfillPurchase = async (session) => {
    const purchase = await Purchase.findOne({ stripeSessionId: session.id })
    if (!purchase || purchase.status === 'completed') return

    const courseId = session.metadata?.courseId || purchase.courseId.toString()
    const userId = session.metadata?.userId || purchase.userId
    const [course, user] = await Promise.all([
        Course.findById(courseId),
        User.findById(userId)
    ])
    if (!course || !user) throw new Error('Unable to fulfill purchase: course or user no longer exists')

    purchase.status = 'completed'
    purchase.stripePaymentIntentId = typeof session.payment_intent === 'string' ? session.payment_intent : undefined
    await Promise.all([
        purchase.save(),
        Course.findByIdAndUpdate(courseId, { $addToSet: { enrolledStudents: userId } }),
        User.findByIdAndUpdate(userId, { $addToSet: { enrolledCourses: courseId } })
    ])
}

export const verifyCheckoutSession = async (req, res) => {
    try {
        const { userId } = getAuth(req)
        const stripe = getStripe()
        const session = await stripe.checkout.sessions.retrieve(req.params.sessionId)
        if (session.metadata?.userId !== userId) {
            return res.status(403).json({ success: false, message: 'This payment belongs to another user' })
        }
        if (session.payment_status !== 'paid') {
            return res.status(400).json({ success: false, message: 'Payment is not complete' })
        }
        await fulfillPurchase(session)
        return res.json({ success: true, message: 'Enrollment confirmed' })
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message })
    }
}

export const stripeWebhook = async (req, res) => {
    const signature = req.headers['stripe-signature']
    if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
        return res.status(400).send('Missing Stripe webhook signature or secret')
    }

    try {
        const stripe = getStripe()
        const event = stripe.webhooks.constructEvent(req.body, signature, process.env.STRIPE_WEBHOOK_SECRET)
        if (event.type === 'checkout.session.completed') {
            await fulfillPurchase(event.data.object)
        } else if (event.type === 'checkout.session.expired') {
            await Purchase.findOneAndUpdate({ stripeSessionId: event.data.object.id, status: 'pending' }, { status: 'failed' })
        } else if (event.type === 'payment_intent.payment_failed') {
            await Purchase.findOneAndUpdate({ stripePaymentIntentId: event.data.object.id, status: 'pending' }, { status: 'failed' })
        }
        return res.json({ received: true })
    } catch (error) {
        return res.status(400).send(`Webhook Error: ${error.message}`)
    }
}
