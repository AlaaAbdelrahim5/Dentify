const multer = require('multer');

// Configure memory storage (store file in memory as buffer)
const storage = multer.memoryStorage();

// File filter - only allow images
const imageFileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files (jpeg, jpg, png, gif, webp) are allowed!'));
  }
};

// File filter for radiology files - allow images, PDFs, and DICOM files
const radiologyFileFilter = (req, file, cb) => {
  // Allow images, PDFs, and DICOM files
  const allowedTypes = /jpeg|jpg|png|gif|webp|pdf|dcm/;
  const extname = allowedTypes.test(file.originalname.toLowerCase());
  
  // DICOM files often have application/octet-stream or application/dicom mimetype
  const allowedMimetypes = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'application/dicom',
    'application/octet-stream' // DICOM files are often sent with this mimetype
  ];
  
  const mimetype = allowedMimetypes.includes(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else if (extname) {
    // If extension is correct but mimetype doesn't match, allow it (for .dcm files)
    return cb(null, true);
  } else {
    cb(new Error('Only image, PDF, and DICOM (.dcm) files are allowed!'));
  }
};

// Configure multer for profile images
const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.PROFILE_IMAGE_MAX_SIZE)
  },
  fileFilter: imageFileFilter
});

// Configure multer for radiology files with larger size limit
const radiologyUpload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.RADIOLOGY_FILE_MAX_SIZE)
  },
  fileFilter: radiologyFileFilter
});

module.exports = upload;
module.exports.radiologyUpload = radiologyUpload;
