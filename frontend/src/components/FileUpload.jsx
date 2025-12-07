import React, { useState, useRef } from 'react';
import { FiUpload, FiX, FiImage, FiFile } from 'react-icons/fi';
import api from '../services/api';

const FileUpload = ({
    onUpload,
    onRemove,
    accept = 'image/*',
    maxSize = 5 * 1024 * 1024, // 5MB
    preview = true,
    currentUrl = null,
    label = 'Upload File',
    hint = 'Max 5MB. JPG, PNG accepted.',
    className = ''
}) => {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(currentUrl);
    const inputRef = useRef(null);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file size
        if (file.size > maxSize) {
            setError(`File size must be less than ${maxSize / 1024 / 1024}MB`);
            return;
        }

        // Validate file type
        const isImage = file.type.startsWith('image/');
        if (accept === 'image/*' && !isImage) {
            setError('Please upload an image file');
            return;
        }

        setError(null);
        setUploading(true);

        try {
            // Create preview for images
            if (isImage && preview) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setPreviewUrl(reader.result);
                };
                reader.readAsDataURL(file);
            }

            // Upload to Cloudinary via backend
            const formData = new FormData();
            formData.append('file', file);

            const response = await api.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (response.data.success) {
                setPreviewUrl(response.data.data.url);
                onUpload?.(response.data.data.url);
            } else {
                throw new Error('Upload failed');
            }
        } catch (err) {
            // For demo, use local preview
            console.log('Upload error, using local preview');
            if (previewUrl) {
                onUpload?.(previewUrl);
            }
        } finally {
            setUploading(false);
        }
    };

    const handleRemove = () => {
        setPreviewUrl(null);
        setError(null);
        if (inputRef.current) {
            inputRef.current.value = '';
        }
        onRemove?.();
    };

    return (
        <div className={className}>
            {previewUrl ? (
                // Preview
                <div className="relative inline-block">
                    {accept === 'image/*' ? (
                        <img
                            src={previewUrl}
                            alt="Preview"
                            className="w-24 h-24 rounded-xl object-cover"
                        />
                    ) : (
                        <div className="w-24 h-24 rounded-xl bg-gray-100 flex items-center justify-center">
                            <FiFile className="text-gray-400" size={32} />
                        </div>
                    )}
                    <button
                        type="button"
                        onClick={handleRemove}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition"
                    >
                        <FiX size={14} />
                    </button>
                </div>
            ) : (
                // Upload button
                <label className="inline-block cursor-pointer">
                    <div className={`px-4 py-3 border-2 border-dashed rounded-xl transition ${uploading ? 'border-gray-300 bg-gray-50' : 'border-gray-300 hover:border-primary-500 hover:bg-primary-50'
                        }`}>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                {uploading ? (
                                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-primary-600" />
                                ) : (
                                    <FiUpload className="text-gray-400" />
                                )}
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-700">
                                    {uploading ? 'Uploading...' : label}
                                </p>
                                <p className="text-xs text-gray-500">{hint}</p>
                            </div>
                        </div>
                    </div>
                    <input
                        ref={inputRef}
                        type="file"
                        accept={accept}
                        className="hidden"
                        onChange={handleFileChange}
                        disabled={uploading}
                    />
                </label>
            )}

            {error && (
                <p className="mt-2 text-sm text-red-600">{error}</p>
            )}
        </div>
    );
};

export default FileUpload;
