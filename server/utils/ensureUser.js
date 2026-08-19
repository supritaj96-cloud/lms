import { clerkClient } from '@clerk/express'
import User from '../models/user.js'

// Webhooks can be delayed or unavailable in a new deployment.  Ensure that an
// authenticated Clerk account always has a matching MongoDB document before a
// protected action reads or writes enrollment data.
export const ensureUser = async (userId) => {
    let user = await User.findById(userId)
    if (user) return user

    const clerkUser = await clerkClient.users.getUser(userId)
    user = await User.create({
        _id: clerkUser.id,
        email: clerkUser.primaryEmailAddress?.emailAddress || '',
        name: [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ') || 'Student',
        imageUrl: clerkUser.imageUrl || ''
    })
    return user
}
