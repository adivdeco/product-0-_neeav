uploadData.put('/user/:userId/avatar', uploadSingle, async (req, res) => {
    try {
        const userId = req.params.userId;

        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // Find user and update avatar
        const user = await User.findByIdAndUpdate(
            userId,
            {
                avatar: req.file.path,
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



<div className="border-t pt-6">
    <h4 className="text-lg font-semibold text-gray-900 mb-4">Profile Image</h4>
    <div className="space-y-4">
        {/* File Input - Fixed positioning */}
        <div className="relative border-2 border-dashed border-gray-300 rounded-2xl p-6 transition-all duration-300 hover:border-blue-400 hover:bg-blue-50 group">
            <input
                type="file"
                onChange={handleFileUpdate}
                multiple
                accept="image/*"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />

            <div className="flex flex-col items-center justify-center space-y-3">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                </div>

                <div className="text-center">
                    <p className="text-lg font-semibold text-gray-700">Upload images</p>
                    <p className="text-sm text-gray-500 mt-1">Click or drag photos here</p>
                </div>
            </div>
        </div>

        {/* Preview Area */}
        {selectedFiles.length > 0 && (
            <div>
                <p className="text-sm font-medium text-gray-700 mb-3">Selected Files:</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {selectedFiles.map((file, index) => (
                        <div key={index} className="relative group">
                            <img
                                src={URL.createObjectURL(file)}
                                alt={file.name}
                                className="w-full h-24 object-cover rounded-lg"
                            />
                            <button
                                type="button"
                                onClick={() => setSelectedFiles(prev => prev.filter((_, i) => i !== index))}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-sm"
                            >
                                ×
                            </button>
                            <p className="text-xs text-gray-500 mt-1 truncate">{file.name}</p>
                        </div>
                    ))}
                </div>
            </div>
        )}
    </div>
</div>
