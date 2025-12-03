const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({


  firstName: String,
  lastName: String,
  email: String,
  phone: String,
  roles: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Role' }],
  department: String,
  qualification: String,
  otherQualification: String,
  experience: String,
  dob: String,
  joinDate: String,
  address: String,
  gender: String,
  employmentType: String,
  status: String,
  salary: String,
  employeeId: String,
  subjects: [{ subjectCode: String, subjectName: String }],
  password: String,
  profilePhoto: String,
   descriptor: { 
    type: [Number], 
    required: false,
    // validate: {
    //   validator: function(arr) {
    //     return Array.isArray(arr) && arr.length === 128;
    //   },
    //   message: 'Descriptor must be an array of 128 numbers'
    // }
  },
  image: { 
    type: String 
  },
  inTime: Date,        // Today's IN time
  outTime: Date,       // Today's OUT time  
  workingHours: Number, // Total hours worked today
  isActive: {
    type: Boolean,
    default: true
  },
  resetCode: String,
  resetCodeExpiry: Date,
     companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  Feedbacks: [{
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Registration" },
    course: String,
    batch: String,
    rating: String,
    review: String,
    subject: String
  }],
  assignedEnquiries: [{ type: mongoose.Schema.Types.ObjectId, ref: "Enquiry" }],
  followUps: [{
    enquiryId: { type: mongoose.Schema.Types.ObjectId, ref: "Enquiry" },
    status: String,
    followedUpDate: String,
    nextFollowUpDate: String,
    remark: String
  }],
  documents: {
    photo: {
      filename: String,
      path: String,
      contentType: String,
      uploadDate: { type: Date, default: Date.now }
    },
    offerLetter: { filename: String, path: String, contentType: String, uploadDate: { type: Date, default: Date.now }},
    idProof: { filename: String, path: String, contentType: String, uploadDate: { type: Date, default: Date.now }},
    addressProof: { filename: String, path: String, contentType: String, uploadDate: { type: Date, default: Date.now }},
    educationCertificates: { filename: String, path: String, contentType: String, uploadDate: { type: Date, default: Date.now }},
    bankDetails: { filename: String, path: String, contentType: String, uploadDate: { type: Date, default: Date.now }}
  }
}, { timestamps: true });

module.exports = mongoose.model("Employee", employeeSchema);
