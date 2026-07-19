import { Webhook } from "svix";
import User from "../models/user.js";

export const clerkWebhooks = async (req, res) => {
    try {
        const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);

        const payload = req.body.toString();

        await whook.verify(payload, {
            "svix-id": req.headers["svix-id"],
            "svix-timestamp": req.headers["svix-timestamp"],
            "svix-signature": req.headers["svix-signature"]
        });

        const { data, type } = JSON.parse(payload);

        switch (type) {
            case "user.created": {
                const userData = {
                    _id: data.id,
                    email: data.email_addresses[0].email_address,
                    name: data.first_name + " " + data.last_name,
                    imageUrl: data.image_url,
                };

                await User.create(userData);

                res.status(200).json({ success: true });
                break;
            }

            case "user.updated": {
                const userData = {
                    email: data.email_addresses[0].email_address,
                    name: data.first_name + " " + data.last_name,
                    imageUrl: data.image_url,
                };

                await User.findByIdAndUpdate(data.id, userData);

                res.status(200).json({ success: true });
                break;
            }

            case "user.deleted": {
                await User.findByIdAndDelete(data.id);

                res.status(200).json({ success: true });
                break;
            }

            default:
                res.status(200).json({ success: true });
        }

    } catch (error) {
        console.log(error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};