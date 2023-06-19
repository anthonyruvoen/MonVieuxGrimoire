const multer = require('multer');
const sharpMulter = require('sharp-multer');


const storage = sharpMulter ({
                destination:(callback) =>callback(null, "uploads"),
                imageOptions:{
                useTimestamp: true,
                fileFormat: "webp",
                quality: 80,
                }
           });

const upload = multer({
    storage: storage
});

module.exports = { upload };