const express = require('express');
const uploadData = express.Router();
const { uploadSingle, uploadMultiple } = require('../middleware/uploadMiddleware');
const User = require('../models/userSchema');

// Upload single image (for avatar)
uploadData.post('/avatar', uploadSingle, async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const imageUrl = req.file.path; // Cloudinary URL
        const imagePublicId = req.file.filename; // Cloudinary public ID

        res.status(200).json({
            message: 'Image uploaded successfully',
            imageUrl,
            imagePublicId
        });

    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ message: 'Upload failed', error: error.message });
    }
});

// Upload multiple images
uploadData.post('/multiple', uploadMultiple, async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: 'No files uploaded' });
        }

        const uploadedImages = req.files.map(file => ({
            url: file.path,
            publicId: file.filename
        }));

        res.status(200).json({
            message: 'Images uploaded successfully',
            images: uploadedImages
        });

    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ message: 'Upload failed', error: error.message });
    }
});


uploadData.put('/user/:userId/avatar', async (req, res) => {
    try {
        const userId = req.params.userId;
        const { avatar } = req.body;

        if (!avatar) {
            return res.status(400).json({ message: 'Avatar URL is required' });
        }

        // Find user and update avatar
        const user = await User.findByIdAndUpdate(
            userId,
            {
                avatar: avatar,
                updatedAt: new Date()
            },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({
            message: 'Avatar updated successfully',
            avatar: user.avatar,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        console.error('Avatar update error:', error);
        res.status(500).json({ message: 'Avatar update failed', error: error.message });
    }
});

// Delete image from Cloudinary
uploadData.delete('/image', async (req, res) => {
    try {
        const { publicId } = req.body;

        if (!publicId) {
            return res.status(400).json({ message: 'Public ID is required' });
        }

        const result = await cloudinary.uploader.destroy(publicId);

        res.status(200).json({
            message: 'Image deleted successfully',
            result
        });

    } catch (error) {
        console.error('Delete error:', error);
        res.status(500).json({ message: 'Delete failed', error: error.message });
    }
});

module.exports = uploadData;