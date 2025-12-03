// const express = require('express');
// const router = express.Router();
// const contactController = require('../controllers/contactController');

// // GET /api/contacts - Get all contacts with filtering, sorting, pagination
// router.get('/', contactController.getContacts);

// // GET /api/contacts/stats - Get contact statistics
// router.get('/stats', contactController.getContactStats);

// // GET /api/contacts/:id - Get single contact
// router.get('/:id', contactController.getContact);

// // POST /api/contacts - Create new contact
// router.post('/', contactController.createContact);

// // PUT /api/contacts/:id - Update contact
// router.put('/:id', contactController.updateContact);

// // DELETE /api/contacts/:id - Delete single contact
// router.delete('/:id', contactController.deleteContact);

// // DELETE /api/contacts - Delete multiple contacts
// router.delete('/', contactController.deleteContacts);

// // POST /api/contacts/export - Export contacts
// router.post('/export', contactController.exportContacts);

// module.exports = router;


const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const contactController = require('../../controllers/crm/contactController');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads/avatars');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 512 * 1024 // 512KB
    },
    fileFilter: function (req, file, cb) {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    }
});

// Upload avatar endpoint
router.post('/upload/avatar', upload.single('avatar'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        const fileUrl = `/uploads/avatars/${req.file.filename}`;
        
        res.json({
            success: true,
            message: 'Avatar uploaded successfully',
            data: {
                url: fileUrl,
                filename: req.file.filename,
                size: req.file.size
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error uploading avatar',
            error: error.message
        });
    }
});

// Your existing routes...
router.get('/', contactController.getContacts);
router.get('/stats', contactController.getContactStats);
router.get('/:id', contactController.getContact);
router.post('/', contactController.createContact);
router.put('/:id', contactController.updateContact);
router.delete('/:id', contactController.deleteContact);
router.delete('/', contactController.deleteContacts);
router.post('/export', contactController.exportContacts);

module.exports = router;