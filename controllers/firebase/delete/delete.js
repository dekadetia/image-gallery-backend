const { ref, deleteObject } = require('firebase/storage');
const { firebase_app_storage } = require('../../../firebase/index');

const DeleteImage = async (request, response) => {
    try {
        const { file_name } = request.body;

        if (!file_name) {
            return response.status(400).json({ message: 'File name is required' });
        }

        const delRef = ref(firebase_app_storage, `images/${file_name}`);

        // Delete the file from Firebase storage
        await deleteObject(delRef);

        // Emit a socket event for real-time updates (if using socket)
        // socket.emit('image_deleted', { fileName: file_name });

        return response.status(200).json({ message: 'Successfully deleted image' });
    } catch (error) {
        console.error('Error deleting file:', error);
        return response.status(500).json({ message: 'Error deleting file', details: error.message });
    }
};

module.exports = {
    DeleteImage
}