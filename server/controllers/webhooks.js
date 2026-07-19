import { verifyWebhook } from '@clerk/express/webhooks'
import User from "../models/user.js";

export const clerkWebhooks = async (req, res) => {
    try {
        const evt = await verifyWebhook(req)

        const { data, type } = evt

        switch (type) {
            case 'user.created': {
                const userData = {
                    _id: data.id,
                    email: data.email_addresses[0].email_address,
                    name: data.first_name + " " + data.last_name,
                    imageUrl: data.image_url,
                }

                await User.create(userData)
                break
            }

            case 'user.updated': {
                const userData = {
                    email: data.email_addresses[0].email_address,
                    name: data.first_name + " " + data.last_name,
                    imageUrl: data.image_url,
                }

                await User.findByIdAndUpdate(data.id, userData)
                break
            }

            case 'user.deleted': {
                await User.findByIdAndDelete(data.id)
                break
            }
        }

        res.status(200).json({ success: true })

    } catch (error) {
        console.log(error)
        res.status(400).json({
            success: false,
            message: error.message
        })
    }
}