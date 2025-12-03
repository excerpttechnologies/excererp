const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    code:String,
    address: {
        type: String,
        trim: true
    },
    city: {
        type: String,
        trim: true
    },
    state: {
        type: String,
        trim: true
    },
    country: {
        type: String,
        trim: true
    },
    postalCode: {
        type: String,
        trim: true
    },
    contactPerson: {
        type: String,
        trim: true
    },
    contactNumber: {
        type: String,
        trim: true
    },
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
   financialYear:String,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Location', locationSchema);