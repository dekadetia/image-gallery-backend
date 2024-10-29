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
    const uploadPromises = [];

    request.files.forEach((file) => {
      uploadPromises.push(
        (async () => {
          try {
            const fileName = file.originalname;
            const storageRef = ref(firebase_app_storage, `images/${fileName}`);
            const thumbnailRef = ref(
              firebase_app_storage,
              `thumbnails/${fileName}`
            );

            const metadata_data = {
              customMetadata: {
                caption,
                director,
                photographer,
                year,
                alphaname,
                dimensions,
              },
            };

            // Upload original file
            await uploadBytesResumable(storageRef, file.buffer, metadata_data);

            // Create a thumbnail using buffers
            const thumbnailBuffer = await sharp(file.buffer, {
              animated: true,
              pages: -1,
            })
              .resize({ width: 200, height: 200, fit: sharp.fit.inside })
              .toBuffer();

            // Upload thumbnail buffer
            await uploadBytesResumable(
              thumbnailRef,
              thumbnailBuffer,
              metadata_data
            );

            // Retrieve URLs and metadata
            const [downloadURL, thumbDownloadURL, metadata] = await Promise.all(
              [
                getDownloadURL(storageRef),
                getDownloadURL(thumbnailRef),
                getMetadata(storageRef),
              ]
            );

            // Construct Firestore data
            const data = {
              src: downloadURL,
              thumbnail: thumbDownloadURL,
              name: fileName,
              created_at: metadata.timeCreated,
              updated_at: metadata.updated,
              size: metadata.size,
              ...metadata.customMetadata,
              contentType: metadata.contentType,
            };

            // Save metadata to Firestore
            const docRef = doc(collection(firebase_app_db, "media"), fileName);
            await setDoc(docRef, data);
          } catch (error) {
            console.error("Error uploading file:", file.originalname, error);
          }
        })()
      );
    });

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
