const {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  getMetadata,
} = require("firebase/storage");
const {
  firebase_app_storage,
  firebase_app_db,
} = require("../../firebase/index");
const { collection, doc, setDoc } = require("firebase/firestore");
const sharp = require("sharp");

const index = async (request, response) => {
  return response.status(200).json({ message: "Create Working!!!!" });
};

const StoreImage = async (request, response) => {
  try {
    const { caption, director, photographer, year, alphaname, dimensions } =
      request.body;

    const uploadPromises = request.files.map(async (file) => {
      try {
        const fileName = file.originalname;
        const storageRef = ref(firebase_app_storage, `images/${fileName}`);
        const thumbnailRef = ref(
          firebase_app_storage,
          `thumbnails/${fileName}`
        );

        const metadata = {
          customMetadata: {
            caption,
            director,
            photographer,
            year,
            alphaname,
            dimensions,
          },
        };

        // Upload the original image
        await uploadBytesResumable(storageRef, file.buffer, metadata);

        // Create a thumbnail (handling animated images if applicable)
        const thumbnailBuffer = await sharp(file.buffer)
          .resize({ width: 200, height: 200, fit: sharp.fit.inside })
          .toBuffer();

        // Upload the thumbnail
        await uploadBytesResumable(thumbnailRef, thumbnailBuffer, metadata);

        // Retrieve URLs and metadata in parallel
        const [downloadURL, thumbDownloadURL, metadataSnapshot] =
          await Promise.all([
            getDownloadURL(storageRef),
            getDownloadURL(thumbnailRef),
            getMetadata(storageRef),
          ]);

        // Construct Firestore document data
        const data = {
          src: downloadURL,
          thumbnail: thumbDownloadURL,
          name: fileName,
          created_at: metadataSnapshot.timeCreated,
          updated_at: metadataSnapshot.updated,
          size: metadataSnapshot.size,
          contentType: metadataSnapshot.contentType,
          ...metadata.customMetadata,
        };

        // Save the document to Firestore
        const docRef = doc(collection(firebase_app_db, "media"), fileName);
        await setDoc(docRef, data);
      } catch (error) {
        console.error(`Error uploading file ${file.originalname}:`, error);
        throw new Error(`Upload failed for ${file.originalname}`);
      }
    });

    // Wait for all uploads to complete
    await Promise.all(uploadPromises);

    return response
      .status(200)
      .json({ message: "All files uploaded successfully" });
  } catch (error) {
    console.error("Error uploading files:", error);
    return response
      .status(500)
      .json({ error: "File upload failed", details: error.message });
  }
};

module.exports = {
  index,
  StoreImage,
};
