const { ref, deleteObject } = require("firebase/storage");
const { firebase_app_storage, firebase_app_db } = require("../../../firebase/index");
const { deleteDoc, doc, collection } = require("firebase/firestore");

const DeleteImage = async (request, response) => {
  try {
    const { file_name } = request.body;

    if (!file_name) {
      return response.status(400).json({ message: "File name is required" });
    }

    const delRef = ref(firebase_app_storage, `images/${file_name}`);
    const delRefThumbnail = ref(
      firebase_app_storage,
      `thumbnails/${file_name}`
    );
    const docRef = doc(collection(firebase_app_db, "media"), file_name);

    // Delete the image and thumbnail from Firebase Storage
    const deleteStoragePromises = [
      deleteObject(delRef).catch((error) => {
        console.error(`Error deleting image: ${file_name}`, error);
      }),
      deleteObject(delRefThumbnail).catch((error) => {
        console.error(`Error deleting thumbnail: ${file_name}`, error);
      }),
    ];

    // Delete the Firestore document
    const deleteDocPromise = deleteDoc(docRef).catch((error) => {
      console.error(`Error deleting document: ${file_name}`, error);
    });

    // Wait for all delete operations to complete
    await Promise.all([...deleteStoragePromises, deleteDocPromise]);

    return response.status(200).json({ message: "Successfully deleted image" });
  } catch (error) {
    console.error("Error deleting file:", error);
    return response
      .status(500)
      .json({ message: "Error deleting file", details: error.message });
  }
};

module.exports = {
  DeleteImage,
};
