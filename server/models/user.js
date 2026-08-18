import mongoose from 'mongoose'

const userSchema = new mongoose.Schema(
    {
        _id: { type: String, required: true },
        name: { type: String, required: true },
        email: { type: String, required: true },
        imageUrl: { type: String, required: true },
        enrolledCourses: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Course'
            }
        ],
        courseProgress: [
            {
                courseId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Course',
                    required: true
                },
                lectureCompleted: { type: [String], default: [] },
                completedAt: { type: Date, default: null },
                lastAccessedAt: { type: Date, default: Date.now }
            }
        ]

    }, { timestamps: true });

const User = mongoose.model('User', userSchema);

export default User
