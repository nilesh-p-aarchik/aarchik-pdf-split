const express = require('express');
const app = express();
const { Storage } = require('@google-cloud/storage');
const { format } = require('util');

const storage = new Storage({
  projectId: 'my-project-fcdab',
  credentials: require('../../satsang-book-management-firebase-adminsdk-ast1q-c2f99639c1.json'),
  predefinedAcl: 'publicRead',
  cacheControl: 'public, max-age=31536000'
});

const bucket = storage.bucket("gs://my-project-fcdab.appspot.com");

var uploadImageToStorage = async (file,folder) => {
  console.log(file);
  if (!file) {
    return null;
  }
  console.log(folder,"folder")
  let newFileName = file.name;
  console.log("blobStream " + newFileName);
  //const destinationFilename = bucket.file(`${folder}/${file.name}`);
  //console.log(destinationFilename,"destination")
 
  let fileUpload = bucket.file(`${folder}/${newFileName}`);

  const blobStream = await fileUpload.createWriteStream({
    //destination: destinationFilename,
    metadata: {
      contentType: file.mimetype
    }
  });
  const url = format(`https://storage.googleapis.com/${bucket.name}/${folder}/${newFileName}`);
  console.log("blobStream " + url);

  blobStream.end(file.data);

  return url;
}

module.exports = {
  uploadImageToStorage,
}


