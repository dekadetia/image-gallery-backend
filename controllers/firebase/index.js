const { ref, getDownloadURL, uploadBytesResumable, listAll, deleteObject, getMetadata, getStorage, list, updateMetadata } = require('firebase/storage');
const io = require('socket.io-client');
const { firebase_app_storage } = require('../..');
//const socket = io("http://localhost:3000");

const index = async (request, response) => {
    return response.status(200).json({ message: 'Working!!!!' });
}

const StoreImage = async (request, response) => {
    try {
        const formData = await request.formData();
        const caption = formData.get('caption');
        const director = formData.get('director');
        const photographer = formData.get('photographer');
        const year = formData.get('year');
        const alphaname = formData.get('alphaname');
        const dimensions = formData.get('dimensions');

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

        formData.forEach((data, index) => {
            if (index !== 'caption') {
                const file = data;
                if (file) {
                    // Push the upload process into the promise array
                    uploadPromises.push(
                        (async () => {
                            const storageRef = ref(firebase_app_storage, `images/${file.name}`);
                            await uploadBytesResumable(storageRef, file, metadata);

                            const downloadURL = await getDownloadURL(storageRef);
                            const metadata_uploaded = await getMetadata(storageRef);

                            const file_info = {
                                src: downloadURL,
                                name: file.name,
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
                            };

                            // Emit the upload information via Socket.IO
                            //socket.emit('upload', file_info);
                        })()
                    );
                }
            }
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

module.exports ={
    index,
    StoreImage,
}
