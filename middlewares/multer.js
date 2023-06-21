const multer = require('multer');
const sharpMulter = require('sharp-multer');

const folder = process.env.IMAGES_FOLDER;
const storage = sharpMulter ({
                destination: (req,  file,  callback) => callback(null, folder),
                imageOptions: {
                useTimestamp: true,
                fileFormat: "webp",
                quality: 80,
                }
           });

const upload = multer({
    storage: storage
});

module.exports = { upload };