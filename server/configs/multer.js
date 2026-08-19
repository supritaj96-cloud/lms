import multer from "multer";

const storage = multer.diskStorage({})

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (_req, file, callback) => {
        if (file.mimetype.startsWith('image/')) return callback(null, true)
        callback(new Error('Only image files are allowed for course thumbnails'))
    }
})

export default upload
