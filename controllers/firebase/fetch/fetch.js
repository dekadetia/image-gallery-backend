const {
  ref,
  getDownloadURL,
  getMetadata,
  listAll,
  uploadBytesResumable,
  list,
} = require("firebase/storage");
const {
  doc,
  collection,
  setDoc,
  getDoc,
  query,
  orderBy,
  limit,
  getDocs,
  startAfter,
  startAt,
  where,
} = require("firebase/firestore");
const {
  firebase_app_storage,
  firebase_app_db,
} = require("../../../firebase/index");

const sharp = require("sharp");

const getCount = async (req, response) => {
  const listRef = ref(firebase_app_storage, "images");
  const thumnailsRef = ref(firebase_app_storage, "thumbnails");
  const listRefArray = await listAll(listRef);
  const thumnailsRefArray = await listAll(thumnailsRef);

  return response.status(200).json({
    listRef: listRefArray.items.length,
    thumnailsRef: thumnailsRefArray.items.length,
    message: "Successfully fetched all images",
  });
};

const GET_ALL_IMAGES_A_Z = async (request, response) => {
  try {
    const { lastVisibleDocId } = request.body; // Extract pagination params from request
    const collectionRef = collection(firebase_app_db, "media");
    let queryRef = query(
      collectionRef,
      orderBy("alphaname", "asc"),
    );

    // If `lastVisibleDocId` is provided, use it to start the next query
    if (lastVisibleDocId) {
      const lastDocRef = doc(collectionRef, lastVisibleDocId);
      const lastDocSnapshot = await getDoc(lastDocRef);

      if (lastDocSnapshot.exists()) {
        queryRef = query(queryRef, startAfter(lastDocSnapshot)); // Use startAfter for pagination
      } else {
        return response
          .status(404)
          .json({ error: "Last visible document not found." });
      }
    }

    // Fetch the queried documents
    const querySnapshot = await getDocs(queryRef);

    // Map through the documents and extract data
    const imagesWithData = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Check if there are more documents available for the next page
    const lastVisibleDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
    const nextPageToken = lastVisibleDoc ? lastVisibleDoc.id : null;

    // Send response with images and the next page token
    return response.status(200).json({
      images: imagesWithData,
      nextPageToken,
      message: "Successfully fetched images.",
    });
  } catch (error) {
    console.error("Error fetching images:", error);
    return response.status(500).json({
      error: "Failed to fetch images.",
      details: error.message,
    });
  }

  // try {
  //   const listRef = ref(firebase_app_storage, "images");
  //   // const listRef = ref(firebase_app_storage, "images");
  //   const res = await listAll(listRef);

  //   const imagesWithData = await Promise.all(
  //     res.items.map(async (itemRef) => {
  //       const metadata = await getMetadata(itemRef);
  //       return {
  //         name: itemRef.name,
  //         caption: metadata.customMetadata?.caption || "",
  //         year: metadata.customMetadata?.year || "",
  //         alphaname: metadata.customMetadata?.alphaname || "",
  //       };
  //     })
  //   );

  //   // Sort images by `alphaname`, but handle the case where `alphaname` might be missing
  //   imagesWithData.sort((a, b) => {
  //     const nameA = a.alphaname ? a.alphaname.toLowerCase() : "";
  //     const nameB = b.alphaname ? b.alphaname.toLowerCase() : "";
  //     return nameA.localeCompare(nameB);
  //   });

  //   return response.status(200).json({
  //     images: imagesWithData,
  //     message: "Successfully fetched all images",
  //   });
  // } catch (error) {
  //   console.error("Error loading all images:", error);

  //   // Return error with status code 400 and a descriptive error message
  //   return response.status(400).json({
  //     error: "Error fetching all images",
  //     details: error.message,
  //   });
  // }
};

const GET_ORDERED_IMAGES = async (request, response) => {
  try {
    const { lastVisibleDocId, order_by_key, order_by_value, order_by_key_2, order_by_value_2, size_limit } = request.body; // Extract pagination params from request
    
    const collectionRef = collection(firebase_app_db, "media");
    let queryRef;

    if(order_by_key_2 && order_by_value_2){
      queryRef = query(
        collectionRef,
        orderBy(order_by_key, order_by_value),
        orderBy(order_by_key_2, order_by_value_2),
        limit(size_limit)
      );
    }else{
      queryRef = query(
        collectionRef,
        orderBy(order_by_key, order_by_value),
        limit(size_limit)
      );
    }

    // If `lastVisibleDocId` is provided, use it to start the next query
    if (lastVisibleDocId) {
      const lastDocRef = doc(collectionRef, lastVisibleDocId);
      const lastDocSnapshot = await getDoc(lastDocRef);

      if (lastDocSnapshot.exists()) {
        queryRef = query(queryRef, startAfter(lastDocSnapshot));
      } else {
        return response
          .status(404)
          .json({ error: "Last visible document not found." });
      }
    }

    // Fetch the queried documents
    const querySnapshot = await getDocs(queryRef);

    // Map through the documents and extract data
    const imagesWithData = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Check if there are more documents available for the next page
    const lastVisibleDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
    const nextPageToken = lastVisibleDoc ? lastVisibleDoc.id : null;

    // Send response with images and the next page token
    return response.status(200).json({
      images: imagesWithData,
      nextPageToken,
      message: "Successfully fetched images.",
    });
  } catch (error) {
    console.error("Error fetching images:", error);
    return response.status(500).json({
      error: "Failed to fetch images.",
      details: error.message,
    });
  }

  // try {
  //   const listRef = ref(firebase_app_storage, "images");
  //   const { pageToken } = request.body;
  //   const res = await list(listRef, { maxResults: 300, pageToken: pageToken });

  //   const imagesWithData = await Promise.all(
  //     res.items.map(async (itemRef) => {
  //       const downloadURL = await getDownloadURL(itemRef);
  //       const metadata = await getMetadata(itemRef);

  //       return {
  //         src: downloadURL,
  //         name: itemRef.name,
  //         created_at: metadata.timeCreated,
  //         updated_at: metadata.updated,
  //         size: metadata.size,
  //         caption: metadata.customMetadata?.caption || "",
  //         director: metadata.customMetadata?.director || "",
  //         photographer: metadata.customMetadata?.photographer || "",
  //         year: metadata.customMetadata?.year || "",
  //         alphaname: metadata.customMetadata?.alphaname || "",
  //         contentType: metadata.contentType,
  //         dimensions: metadata.customMetadata?.dimensions || "",
  //       };
  //     })
  //   );

  //   // Sort images by `alphaname`, but handle the case where `alphaname` might be missing
  //   imagesWithData.sort((a, b) => {
  //     const nameA = a.alphaname ? a.alphaname.toLowerCase() : "";
  //     const nameB = b.alphaname ? b.alphaname.toLowerCase() : "";
  //     return nameA.localeCompare(nameB);
  //   });

  //   return response.status(200).json({
  //     images: imagesWithData,
  //     nextPageToken: res.nextPageToken || null,
  //     message: "Successfully fetched all images",
  //   });
  // } catch (error) {
  //   console.error("Error loading all images:", error);

  //   // Return error with status code 400 and a descriptive error message
  //   return response.status(400).json({
  //     error: "Error fetching all images",
  //     details: error.message,
  //   });
  // }
};

const GET_RANDOM_IMAGES = async (request, response) => {
  try {
    const { pageSize = 99 } = request.body;
    const collectionRef = collection(firebase_app_db, "media");

    // Step 1: Get all document IDs from the collection
    const allDocsSnapshot = await getDocs(collectionRef);
    const allDocIds = allDocsSnapshot.docs.map((doc) => doc.id);

    if (allDocIds.length === 0) {
      return response.status(404).json({ error: "No images found." });
    }

    // Step 2: Select random IDs in memory
    const randomDocIds = [];
    while (randomDocIds.length < Math.min(pageSize, allDocIds.length)) {
      const randomIndex = Math.floor(Math.random() * allDocIds.length);
      const randomId = allDocIds[randomIndex];
      if (!randomDocIds.includes(randomId)) {
        randomDocIds.push(randomId);
      }
    }

    // Step 3: Fetch the randomly selected documents
    const promises = randomDocIds.map((id) => getDoc(doc(collectionRef, id)));
    const docsSnapshots = await Promise.all(promises);

    const images = docsSnapshots.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    }));

    return response.status(200).json({
      images,
      message: "Successfully fetched random images.",
    });
  } catch (error) {
    console.error("Error fetching random images:", error);
    return response.status(500).json({
      error: "Failed to fetch random images.",
      details: error.message,
    });
  }

  // try {
  //   // const listRef = ref(firebase_app_storage, "images");
  //   const listRef = ref(firebase_app_storage, "thumbnails");
  //   const res = await listAll(listRef);

  //   const imagesWithData = await Promise.all(
  //     res.items.map(async (itemRef) => itemRef)
  //   );

  //   const shuffleArray = (array) => {
  //     for (let i = array.length - 1; i > 0; i--) {
  //       const j = Math.floor(Math.random() * (i + 1));
  //       [array[i], array[j]] = [array[j], array[i]];
  //     }
  //     return array;
  //   };

  //   const shuffledImages = shuffleArray(imagesWithData).slice(0, 300);

  //   const finalArray = await Promise.all(
  //     shuffledImages.map(async (item) => {
  //       const downloadURL = await getDownloadURL(item);
  //       const metadata = await getMetadata(item);

  //       return {
  //         src: downloadURL,
  //         name: item.name,
  //         created_at: metadata.timeCreated,
  //         updated_at: metadata.updated,
  //         size: metadata.size,
  //         caption: metadata.customMetadata?.caption || "",
  //         director: metadata.customMetadata?.director || "",
  //         photographer: metadata.customMetadata?.photographer || "",
  //         year: metadata.customMetadata?.year || "",
  //         alphaname: metadata.customMetadata?.alphaname || "",
  //         contentType: metadata.contentType,
  //         dimensions: metadata.customMetadata?.dimensions || "",
  //       };
  //     })
  //   );

  //   return response.status(200).json({
  //     images: finalArray,
  //     message: "Successfully fetched random images",
  //   });
  // } catch (error) {
  //   console.error("Error loading all images:", error);
  //   return response.status(400).json({
  //     error: "Error fetching images",
  //     details: error.message,
  //   });
  // }
};

const GET_ALL_IMAGES = async (request, response) => {

  try {
    const { lastVisibleDocId } = request.body; // Extract pagination params from request
    const collectionRef = collection(firebase_app_db, "media");
    let queryRef = query(
      collectionRef,
      orderBy("name", "asc"),
    );

    // If `lastVisibleDocId` is provided, use it to start the next query
    if (lastVisibleDocId) {
      const lastDocRef = doc(collectionRef, lastVisibleDocId);
      const lastDocSnapshot = await getDoc(lastDocRef);

      if (lastDocSnapshot.exists()) {
        queryRef = query(queryRef, startAfter(lastDocSnapshot)); // Use startAfter for pagination
      } else {
        return response
          .status(404)
          .json({ error: "Last visible document not found." });
      }
    }

    // Fetch the queried documents
    const querySnapshot = await getDocs(queryRef);

    // Map through the documents and extract data
    const imagesWithData = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Check if there are more documents available for the next page
    const lastVisibleDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
    const nextPageToken = lastVisibleDoc ? lastVisibleDoc.id : null;

    // Send response with images and the next page token
    return response.status(200).json({
      images: imagesWithData,
      nextPageToken,
      message: "Successfully fetched images.",
    });
  } catch (error) {
    console.error("Error fetching images:", error);
    return response.status(500).json({
      error: "Failed to fetch images.",
      details: error.message,
    });
  }

  // try {
  //   const { pageToken } = request.body;

  //   const listRef = ref(firebase_app_storage, "images");
  //   const res = await list(listRef, { maxResults: 300, pageToken: pageToken });

  //   const imagesWithData = await Promise.all(
  //     res.items.map(async (itemRef) => {
  //       try {
  //         const metadata = await getMetadata(itemRef);

  //         const data = {
  //           name: itemRef.name,
  //           created_at: metadata.timeCreated,
  //           updated_at: metadata.updated,
  //           size: metadata.size,
  //           ...metadata.customMetadata,
  //           contentType: metadata.contentType,
  //         };

  //         return data;
  //       } catch (error) {
  //         console.error(`Error processing image: ${itemRef.name}`, error);
  //         return null;
  //       }
  //     })
  //   );

  //   const sortedImages = imagesWithData.sort(
  //     (a, b) => new Date(b.created_at) - new Date(a.created_at)
  //   );

  //   return response.status(200).json({
  //     images: sortedImages,
  //     nextPageToken: res.nextPageToken || null,
  //     message: "Successfully fetched all images",
  //   });
  // } catch (error) {
  //   console.error("Error loading all images:", error);
  //   return response.status(400).json({
  //     error: "Error fetching all images",
  //   });
  // }
};

const GET_IMAGES = async (request, response) => {
  // try {
  try {
    const { pageSize = 99, lastVisibleDocId } = request.body; // Extract pagination params from request
    const collectionRef = collection(firebase_app_db, "media");
    let queryRef = query(collectionRef, limit(pageSize));

    // If `lastVisibleDocId` is provided, use it to start the next query
    if (lastVisibleDocId) {
      const lastDocRef = doc(collectionRef, lastVisibleDocId);
      const lastDocSnapshot = await getDoc(lastDocRef);

      if (lastDocSnapshot.exists()) {
        queryRef = query(queryRef, startAfter(lastDocSnapshot));
      } else {
        return response
          .status(404)
          .json({ error: "Last visible document not found." });
      }
    }

    // Fetch the queried documents
    const querySnapshot = await getDocs(queryRef);

    // Map through the documents and extract data
    const imagesWithData = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Check if there are more documents available for the next page
    const lastVisibleDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
    const nextPageToken = lastVisibleDoc ? lastVisibleDoc.id : null;

    // Send response with images and the next page token
    return response.status(200).json({
      images: imagesWithData,
      nextPageToken,
      message: "Successfully fetched images.",
    });
  } catch (error) {
    console.error("Error fetching images:", error);
    return response.status(500).json({
      error: "Failed to fetch images.",
      details: error.message,
    });
  }

  // const listRef = ref(firebase_app_storage, "thumbnails");
  // const { pageToken } = request.body;
  // const res = await list(listRef, { maxResults: 300, pageToken: pageToken });

  // // Fetch download URLs and metadata for each image
  // const imagesWithData = await Promise.all(
  //   res.items.map(async (itemRef) => {
  //     const downloadURL = await getDownloadURL(itemRef);
  //     const metadata = await getMetadata(itemRef);
  //     return {
  //       src: downloadURL,
  //       name: itemRef.name,
  //       created_at: metadata.timeCreated,
  //       updated_at: metadata.updated,
  //       size: metadata.size,
  //       caption: metadata.customMetadata?.caption || "",
  //       director: metadata.customMetadata?.director || "",
  //       photographer: metadata.customMetadata?.photographer || "",
  //       year: metadata.customMetadata?.year || "",
  //       alphaname: metadata.customMetadata?.alphaname || "",
  //       contentType: metadata.contentType,
  //       dimensions: metadata.customMetadata?.dimensions || "",
  //     };
  //   })
  // );

  // // Return the response with status 200
  // return response.status(200).json({
  //   images: imagesWithData,
  //   nextPageToken: res.nextPageToken || null,
  //   message: "Successfully fetched",
  // });
  // } catch (error) {
  //   console.error("Error loading images:", error);
  //   // Return the error response with status 400
  //   return response.status(400).json({ error: "Error fetching images" });
  // }
};

const GET_SINGLE_FILE = async (request, response) => {
  try {
    const { file } = request.body;
    const storageRef = ref(firebase_app_storage, `images/${file}`);

    const downloadURL = await getDownloadURL(storageRef);
    const metadata = await getMetadata(storageRef);

    const data = {
      src: downloadURL,
      name: file,
      created_at: metadata.timeCreated,
      updated_at: metadata.updated,
      size: metadata.size,
      caption: metadata.customMetadata?.caption || "",
      director: metadata.customMetadata?.director || "",
      photographer: metadata.customMetadata?.photographer || "",
      year: metadata.customMetadata?.year || "",
      alphaname: metadata.customMetadata?.alphaname || "",
      contentType: metadata.contentType,
      dimensions: metadata.customMetadata?.dimensions || "",
    };

    return response.status(200).json({
      file: data,
      message: "File fetched.",
    });
  } catch (error) {
    console.error("Error getting file:", error);
    return response
      .status(500)
      .json({ error: "File getting failed", details: error.message });
  }
};

module.exports = {
  GET_ALL_IMAGES_A_Z,
  GET_RANDOM_IMAGES,
  GET_ALL_IMAGES,
  GET_IMAGES,
  GET_SINGLE_FILE,
  GET_ORDERED_IMAGES,
  getCount,
};
