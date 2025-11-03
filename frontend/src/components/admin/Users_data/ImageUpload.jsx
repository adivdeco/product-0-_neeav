// import { useState } from 'react';
// import axios from 'axios';
// import axiosClient from '../../../api/auth';

// const ImageUpload = ({ userId, onUploadSuccess }) => {
//     const [selectedFiles, setSelectedFiles] = useState([]);
//     const [uploading, setUploading] = useState(false);
//     const [uploadProgress, setUploadProgress] = useState(0);

//     const handleFileChange = (event) => {
//         const files = Array.from(event.target.files);
//         setSelectedFiles(files);
//     };

//     const uploadToCloudinary = async (file) => {
//         const formData = new FormData();
//         formData.append('avatar', file);

//         try {
//             const response = await axiosClient.post('/upload/avatar', formData, {
//                 headers: {
//                     'Content-Type': 'multipart/form-data',
//                 },
//                 onUploadProgress: (progressEvent) => {
//                     const progress = Math.round(
//                         (progressEvent.loaded * 100) / progressEvent.total
//                     );
//                     setUploadProgress(progress);
//                 },
//             });

//             return response.data;
//         } catch (error) {
//             console.error('Upload error:', error);
//             throw error;
//         }
//     };

//     const handleUpload = async () => {
//         if (selectedFiles.length === 0) return;

//         setUploading(true);
//         setUploadProgress(0);

//         try {
//             const uploadPromises = selectedFiles.map(file => uploadToCloudinary(file));
//             const results = await Promise.all(uploadPromises);

//             // Update user avatar with the first uploaded image
//             if (results.length > 0 && userId) {
//                 await axiosClient.put(`/upload/user/${userId}/avatar`, {
//                     avatar: results[0].imageUrl
//                 });
//             }

//             // Call success callback
//             if (onUploadSuccess) {
//                 onUploadSuccess(results);
//             }

//             // Clear selected files
//             setSelectedFiles([]);

//             alert('Images uploaded successfully!');

//         } catch (error) {
//             console.error('Upload failed:', error);
//             alert('Upload failed. Please try again.');
//         } finally {
//             setUploading(false);
//             setUploadProgress(0);
//         }
//     };

//     const removeFile = (index) => {
//         setSelectedFiles(prev => prev.filter((_, i) => i !== index));
//     };

//     return (
//         <div className="space-y-4">
//             {/* File Input */}
//             <div className="border-2 border-dashed border-gray-300 rounded-2xl p-6 transition-all duration-300 hover:border-blue-400 hover:bg-blue-50">
//                 <input
//                     type="file"
//                     onChange={handleFileChange}
//                     multiple
//                     accept="image/*"
//                     className="w-full"
//                     disabled={uploading}
//                 />

//                 <div className="text-center mt-4">
//                     <p className="text-sm text-gray-500">
//                         Select images to upload (PNG, JPG, GIF up to 5MB)
//                     </p>
//                 </div>
//             </div>

//             {/* Upload Progress */}
//             {uploading && (
//                 <div className="bg-gray-100 rounded-lg p-4">
//                     <div className="flex justify-between text-sm text-gray-600 mb-2">
//                         <span>Uploading...</span>
//                         <span>{uploadProgress}%</span>
//                     </div>
//                     <div className="w-full bg-gray-200 rounded-full h-2">
//                         <div
//                             className="bg-blue-600 h-2 rounded-full transition-all duration-300"
//                             style={{ width: `${uploadProgress}%` }}
//                         ></div>
//                     </div>
//                 </div>
//             )}

//             {/* Preview Area */}
//             {selectedFiles.length > 0 && (
//                 <div className="space-y-4">
//                     <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
//                         {selectedFiles.map((file, index) => (
//                             <div key={index} className="relative group">
//                                 <img
//                                     src={URL.createObjectURL(file)}
//                                     alt={file.name}
//                                     className="w-full h-24 object-cover rounded-lg"
//                                 />
//                                 <button
//                                     type="button"
//                                     onClick={() => removeFile(index)}
//                                     className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-sm"
//                                     disabled={uploading}
//                                 >
//                                     ×
//                                 </button>
//                                 <p className="text-xs text-gray-500 mt-1 truncate">{file.name}</p>
//                             </div>
//                         ))}
//                     </div>

//                     {/* Upload Button */}
//                     <button
//                         onClick={handleUpload}
//                         disabled={uploading || selectedFiles.length === 0}
//                         className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//                     >
//                         {uploading ? 'Uploading...' : `Upload ${selectedFiles.length} Image(s)`}
//                     </button>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default ImageUpload;






import { useState } from 'react';
import axiosClient from '../../../api/auth';

const ImageUpload = ({ userId, onUploadSuccess, onAvatarUpdate }) => {
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const handleFileChange = (event) => {
        const files = Array.from(event.target.files);
        setSelectedFiles(files);
    };

    const uploadToCloudinary = async (file) => {
        const formData = new FormData();
        formData.append('avatar', file);

        try {
            const response = await axiosClient.post('/upload/avatar', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                onUploadProgress: (progressEvent) => {
                    const progress = Math.round(
                        (progressEvent.loaded * 100) / progressEvent.total
                    );
                    setUploadProgress(progress);
                },
            });

            return response.data;
        } catch (error) {
            console.error('Upload error:', error);
            throw error;
        }
    };

    const handleUpload = async () => {
        if (selectedFiles.length === 0) return;

        setUploading(true);
        setUploadProgress(0);

        try {
            // Upload only the first file for avatar
            const result = await uploadToCloudinary(selectedFiles[0]);
            const cloudinaryUrl = result.imageUrl;

            console.log('Cloudinary upload successful:', cloudinaryUrl);

            // Call the parent callback to update the form data
            if (onAvatarUpdate) {
                onAvatarUpdate(cloudinaryUrl);
            }

            // Call success callback
            if (onUploadSuccess) {
                onUploadSuccess([result]);
            }

            // Clear selected files
            setSelectedFiles([]);

            alert('Avatar uploaded successfully! URL is ready to be saved.');

        } catch (error) {
            console.error('Upload failed:', error);
            alert('Upload failed. Please try again.');
        } finally {
            setUploading(false);
            setUploadProgress(0);
        }
    };

    const removeFile = (index) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    };

    return (
        <div className="">
            {/* File Input */}
            <div className="relative border-2 border-dashed border-gray-300 rounded-2xl p-6 transition-all duration-300 hover:border-blue-400 hover:bg-blue-50 group">

                <input
                    type="file"
                    onChange={handleFileChange}
                    // multiple
                    disabled={uploading}
                    accept="image/*"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />

                <div className="flex flex-col items-center justify-center space-y-3">
                    <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>

                    {/* <div className="text-center">
                        <p className="text-lg font-semibold text-gray-700">Upload images</p>
                        <p className="text-sm text-gray-500 mt-1">Click or drag photos here</p>
                    </div> */}
                </div>

                <div className="text-center mt-4">
                    <p className="text-sm text-gray-500">
                        Select profile image (PNG, JPG, GIF up to 5MB)
                    </p>
                </div>
            </div>

            {/* Upload Progress */}
            {uploading && (
                <div className="bg-gray-100 rounded-lg p-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                        <span>Uploading...</span>
                        <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                        ></div>
                    </div>
                </div>
            )}

            {/* Preview Area */}
            {selectedFiles.length > 0 && (
                <div className="space-y-4">
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
                                    onClick={() => removeFile(index)}
                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-sm"
                                    disabled={uploading}
                                >
                                    ×
                                </button>
                                <p className="text-xs text-gray-500 mt-1 truncate">{file.name}</p>
                            </div>
                        ))}
                    </div>

                    {/* Upload Button */}
                    <button
                        onClick={handleUpload}
                        disabled={uploading || selectedFiles.length === 0}
                        className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {uploading ? 'Uploading...' : 'Upload Avatar'}
                    </button>
                </div>
            )}
        </div>
    );
};

export default ImageUpload;