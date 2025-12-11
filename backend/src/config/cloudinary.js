import { v2 as cloudinary } from 'cloudinary';
import env from './env.js';

cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
});

export const uploadImage = async (fileBuffer, folder = 'justoo/items') => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder,
                resource_type: 'image',
                transformation: [
                    { width: 800, height: 800, crop: 'limit' },
                    { quality: 'auto' },
                    { fetch_format: 'auto' },
                ],
            },
            (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve({
                        url: result.secure_url,
                        publicId: result.public_id,
                        width: result.width,
                        height: result.height,
                        format: result.format,
                        bytes: result.bytes,
                    });
                }
            }
        );

        uploadStream.end(fileBuffer);
    });
};

export const deleteImage = async (publicId) => {
    if (!publicId) return null;
    return cloudinary.uploader.destroy(publicId);
};

export const getOptimizedImageUrl = (publicId, options = {}) => {
    if (!publicId) return null;
    const {
        width = 400,
        height = 400,
        quality = 'auto',
        format = 'auto',
        crop = 'fill',
    } = options;

    return cloudinary.url(publicId, {
        width,
        height,
        quality,
        format,
        crop,
        secure: true,
    });
};

export const processItemImage = (item) => {
    if (!item) return item;
    const processed = { ...item };
    if (item.imagePublicId) {
        processed.imageUrls = {
            thumbnail: getOptimizedImageUrl(item.imagePublicId, { width: 150, height: 150 }),
            medium: getOptimizedImageUrl(item.imagePublicId, { width: 400, height: 400 }),
            large: getOptimizedImageUrl(item.imagePublicId, { width: 800, height: 800 }),
            original: item.image,
        };
    }
    return processed;
};

export const processItemsImages = (items) => {
    if (!Array.isArray(items)) return items;
    return items.map(processItemImage);
};

export default cloudinary;
