const { ref, uploadBytesResumable, getDownloadURL, getMetadata } = require('firebase/storage');
const { firebase_app_storage } = require('../../firebase/index');
const io = require('socket.io-client');
const socket = io("http://localhost:3000");

const index = async (request, response) => {
    return response.status(200).json({ message: 'Working!!!!' });
}

const StoreImage = async (request, response) => {
    try {
        // Extract metadata fields from the request body
        const { caption, director, photographer, year, alphaname, dimensions } = request.body;

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

        // Array to hold all upload promises
        const uploadPromises = [];

        // Loop through each uploaded file (from request.files) and upload it to Firebase Storage
        request.files.forEach((file) => {
            uploadPromises.push(
                (async () => {
                    const storageRef = ref(firebase_app_storage, `images/${file.originalname}`);

                    // Upload the file to Firebase
                    await uploadBytesResumable(storageRef, file.buffer, metadata);

                    // Get the file's download URL and metadata
                    const downloadURL = await getDownloadURL(storageRef);
                    const metadata_uploaded = await getMetadata(storageRef);

                    const file_info = {
                        src: downloadURL,
                        name: file.originalname,
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
                })()
            );
        });

        // Wait for all the files to be uploaded
        await Promise.all(uploadPromises);

        // Send success response once all files are uploaded
        return response.status(200).json({ message: 'All files uploaded successfully' });
    } catch (error) {
        console.error('Error uploading files:', error);
        return response.status(500).json({ error: 'File upload failed', details: error.message });
    }
};

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
            name: filename,
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
        return response.status(200).json({ message: 'All files uploaded successfully' });
    } catch (error) {
        console.error('Error uploading files:', error);
        return response.status(500).json({ error: 'File upload failed', details: error.message });
    }
}

module.exports = {
    index,
    StoreImage,
    UpdateImage,
}
