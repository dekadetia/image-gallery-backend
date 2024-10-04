const { ref, getDownloadURL, getMetadata, listAll, list } = require('firebase/storage');
const { firebase_app_storage } = require('../../../firebase/index');
const { response } = require('express');

// To handle a GET request to /api/all-images
const GET_ALL_IMAGES_A_Z = async (request, response) => {
    const listRef = ref(firebase_app_storage, 'images');

    try {
        const res = await listAll(listRef);

        const imagesWithData = await Promise.all(
            res.items.map(async (itemRef) => {
                const downloadURL = await getDownloadURL(itemRef);
                const metadata = await getMetadata(itemRef);

                return {
                    src: downloadURL,
                    name: itemRef.name,
                    created_at: metadata.timeCreated,
                    updated_at: metadata.updated,
                    size: metadata.size,
                    caption: metadata.customMetadata?.caption || '',
                    director: metadata.customMetadata?.director || '',
                    photographer: metadata.customMetadata?.photographer || '',
                    year: metadata.customMetadata?.year || '',
                    alphaname: metadata.customMetadata?.alphaname || '',
                    contentType: metadata.contentType,
                    dimensions: metadata.customMetadata?.dimensions || '',
                };
            })
        );

        // Sort images by `alphaname`, but handle the case where `alphaname` might be missing
        imagesWithData.sort((a, b) => {
            const nameA = a.alphaname ? a.alphaname.toLowerCase() : '';
            const nameB = b.alphaname ? b.alphaname.toLowerCase() : '';
            return nameA.localeCompare(nameB);
        });

        return response.status(200).json({
            images: imagesWithData,
            message: 'Successfully fetched all images'
        });

    } catch (error) {
        console.error('Error loading all images:', error);

        // Return error with status code 400 and a descriptive error message
        return response.status(400).json({
            error: 'Error fetching all images',
            details: error.message,
        });
    }
};


// To handle a GET request to /api/all-images
const GET_RANDOM_IMAGES = async (request, response) => {
    const listRef = ref(firebase_app_storage, 'images');

    try {
        const res = await listAll(listRef);

        const imagesWithData = await Promise.all(
            res.items.map(async (itemRef) => {
                const downloadURL = await getDownloadURL(itemRef);
                const metadata = await getMetadata(itemRef);

                return {
                    src: downloadURL,
                    name: itemRef.name,
                    created_at: metadata.timeCreated,
                    updated_at: metadata.updated,
                    size: metadata.size,
                    caption: metadata.customMetadata?.caption || '',
                    director: metadata.customMetadata?.director || '',
                    photographer: metadata.customMetadata?.photographer || '',
                    year: metadata.customMetadata?.year || '',
                    alphaname: metadata.customMetadata?.alphaname || '',
                    contentType: metadata.contentType,
                    dimensions: metadata.customMetadata?.dimensions || '',
                };
            })
        );

        // Function to shuffle the images array
        const shuffleArray = (array) => {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
            return array;
        };

        const shuffledImages = shuffleArray(imagesWithData);

        return response.status(200).json({
            images: shuffledImages,
            message: 'Successfully fetched random images',
        });

    } catch (error) {
        console.error('Error loading all images:', error);
        return response.status(400).json({
            error: 'Error fetching images',
            details: error.message,
        });
    }
};

// To handle a GET request to /api/all-images
const GET_ALL_IMAGES = async(request, response) => {
    const listRef = ref(firebase_app_storage, 'images');

    try {
        //const res = await listAll(listRef);
        const res = await list(listRef, { maxResults: 30 });

        const imagesWithData = await Promise.all(
            res.items.map(async (itemRef) => {
                const downloadURL = await getDownloadURL(itemRef);
                const metadata = await getMetadata(itemRef);
                return {
                    src: downloadURL,
                    name: itemRef.name,
                    created_at: metadata.timeCreated,
                    updated_at: metadata.updated,
                    size: metadata.size,
                    caption: metadata.customMetadata.caption || '',
                    director: metadata.customMetadata.director || '',
                    photographer: metadata.customMetadata.photographer || '',
                    year: metadata.customMetadata.year || '',
                    alphaname: metadata.customMetadata.alphaname || '',
                    contentType: metadata.contentType,
                    dimensions: metadata.customMetadata.dimensions || '',
                };
            })
        );

        return response.status(200).json({ 
            images: imagesWithData, 
            message: 'Successfully fetched all images' 
        });

    } catch (error) {
        console.error('Error loading all images:', error);
        return response.status(400).json({ 
            error: 'Error fetching all images' 
        });
    }
}

// To handle a GET request to /api
const GET_IMAGES = async(request) => {
    const { searchParams } = new URL(request.url);
    const pageToken = searchParams.get('pageToken') || null;
    const listRef = ref(storage, 'images');

    try {
        const res = pageToken
            ? await list(listRef, { maxResults: 30, pageToken })
            : await list(listRef, { maxResults: 30 });

        const imagesWithData = await Promise.all(
            res.items.map(async (itemRef) => {
                const downloadURL = await getDownloadURL(itemRef);
                const metadata = await getMetadata(itemRef);
                return {
                    src: downloadURL,
                    name: itemRef.name,
                    created_at: metadata.timeCreated,
                    updated_at: metadata.updated,
                    size: metadata.size,
                    caption: metadata.customMetadata.caption ? metadata.customMetadata.caption : '',
                    director: metadata.customMetadata.director ? metadata.customMetadata.director : '',
                    photographer: metadata.customMetadata.photographer ? metadata.customMetadata.photographer : '',
                    year: metadata.customMetadata.year ? metadata.customMetadata.year : '',
                    alphaname: metadata.customMetadata.alphaname ? metadata.customMetadata.alphaname : '',
                    contentType: metadata.contentType,
                    dimensions: metadata.customMetadata.dimensions ? metadata.customMetadata.dimensions : '',
                };
            })
        );

        return response.json({ images: imagesWithData, nextPageToken: res.nextPageToken || null, message: 'successfully fetched' }, { status: 200 });

    } catch (error) {
        console.error('Error loading images:', error);
        return response.json({ error: 'Error fetching images' }, { status: 400 });
    }
}


module.exports = {
    GET_ALL_IMAGES_A_Z,
    GET_RANDOM_IMAGES,
    GET_ALL_IMAGES,
    GET_IMAGES
}