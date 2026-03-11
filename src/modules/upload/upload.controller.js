import cloudinary from '../../config/cloudinary.js';

export const uploadLogo = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        // Since we receive a buffer from multer memoryStorage, we use upload_stream
        const uploadStream = cloudinary.uploader.upload_stream(
            { folder: 'corporate_gift_logos', resource_type: 'auto' },
            (error, result) => {
                if (error) {
                    console.error('Cloudinary upload error:', error);
                    return res.status(500).json({ success: false, message: 'Failed to upload image' });
                }

                // Return the secure URL to the frontend
                res.status(200).json({
                    success: true,
                    url: result.secure_url
                });
            }
        );

        // Write the buffer to the stream and end it
        uploadStream.end(req.file.buffer);

    } catch (error) {
        console.error('Upload Error:', error);
        res.status(500).json({ success: false, message: 'Internal server error during upload' });
    }
};
