const { ref, updateMetadata, getDownloadURL, getMetadata } = require('firebase/storage');
const { firebase_app_storage } = require('../../../firebase/index');

const UpdateImage = async (request, response) => {
    try {
        const { file, caption, director, photographer, year, alphaname, dimensions } = request.body;
        const metadata = {
            customMetadata: {
                caption: caption,
                director: director,
                photographer: photographer,
                year: year,
                alphaname: alphaname,
                dimensions: dimensions,
            },
        };

        const storageRef = ref(firebase_app_storage, `images/${file}`);
        await updateMetadata(storageRef, metadata);

        const downloadURL = await getDownloadURL(storageRef);
        const metadata_uploaded = await getMetadata(storageRef);

        const data = {
            src: downloadURL,
            name: file,
            created_at: metadata_uploaded.timeCreated,
            updated_at: metadata_uploaded.updated,
            size: metadata_uploaded.size,
            caption: caption,
            director: director,
            photographer: photographer,
            year: year,
            alphaname: alphaname,
            contentType: metadata_uploaded.contentType,
            dimensions: dimensions,
        }

        // Send success response once all files are uploaded
        return response.status(200).json({ message: 'File updated successfully' });
    } catch (error) {
        console.error('Error uploading files:', error);
        return response.status(500).json({ error: 'File upload failed', details: error.message });
    }
}

module.exports = {
    UpdateImage,
}
