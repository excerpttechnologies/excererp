const mongoose = require('mongoose');

const proposalSchema = new mongoose.Schema({
    proposalNumber: {
        type: String,
    },
    leadId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lead',
        required: true
    },
    title: {
        type: String,
        required: [true, 'Proposal title is required'],
        maxLength: [200, 'Title cannot exceed 200 characters']
    },
    description: {
        type: String,
        required: [true, 'Proposal description is required'],
        maxLength: [2000, 'Description cannot exceed 2000 characters']
    },
    proposalValue: {
        type: Number,
        required: [true, 'Proposal value is required'],
        min: [0, 'Proposal value cannot be negative']
    },
    currency: {
        type: String,
        default: 'USD',
        enum: ['USD', 'EUR', 'INR', 'GBP', 'CAD', 'AUD']
    },
    validityPeriod: {
        type: Number, // days
        default: 30,
        min: [1, 'Validity period must be at least 1 day'],
        max: [365, 'Validity period cannot exceed 365 days']
    },
    status: {
        type: String,
        enum: ['Draft', 'Submitted', 'Under Review', 'Approved', 'Rejected', 'Expired', 'Withdrawn'],
        default: 'Draft'
    },
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High', 'Critical'],
        default: 'Medium'
    },
    submittedDate: Date,
    responseDate: Date,
    approvedDate: Date,
    rejectedDate: Date,
    expiryDate: Date,
    
    // Business case details
    businessObjective: {
        type: String,
        maxLength: [1000, 'Business objective cannot exceed 1000 characters']
    },
    proposedSolution: {
        type: String,
        maxLength: [2000, 'Proposed solution cannot exceed 2000 characters']
    },
    timeline: {
        type: String,
        maxLength: [500, 'Timeline cannot exceed 500 characters']
    },
    deliverables: [{
        name: String,
        description: String,
        deliveryDate: Date
    }],
    
    // Commercial terms
    paymentTerms: {
        type: String,
        maxLength: [500, 'Payment terms cannot exceed 500 characters']
    },
    deliveryTerms: {
        type: String,
        maxLength: [500, 'Delivery terms cannot exceed 500 characters']
    },
    warrantyTerms: {
        type: String,
        maxLength: [500, 'Warranty terms cannot exceed 500 characters']
    },
    
    // Project details
    projectDuration: {
        type: Number, // in days
        min: [1, 'Project duration must be at least 1 day']
    },
    teamComposition: {
        type: String,
        maxLength: [1000, 'Team composition cannot exceed 1000 characters']
    },
    riskAssessment: {
        type: String,
        maxLength: [1000, 'Risk assessment cannot exceed 1000 characters']
    },
    
    // Company credentials
    companyCredentials: {
        type: String,
        maxLength: [1500, 'Company credentials cannot exceed 1500 characters']
    },
    pastProjects: [{
        projectName: String,
        clientName: String,
        projectValue: Number,
        completionDate: Date,
        description: String
    }],
    
    // Technical specifications
    technicalRequirements: {
        type: String,
        maxLength: [2000, 'Technical requirements cannot exceed 2000 characters']
    },
    proposedTechnology: {
        type: String,
        maxLength: [1000, 'Proposed technology cannot exceed 1000 characters']
    },
    
    // Documents and attachments
    attachments: [{
        fileName: String,
        fileUrl: String,
        fileSize: Number,
        uploadDate: { type: Date, default: Date.now },
        uploadedBy: String
    }],
    
    // Comments and notes
    internalNotes: {
        type: String,
        maxLength: [1000, 'Internal notes cannot exceed 1000 characters']
    },
    clientFeedback: {
        type: String,
        maxLength: [1000, 'Client feedback cannot exceed 1000 characters']
    },
    
    // Tracking
    createdBy: {
        type: String,
        default: ''
    },
    assignedTo: {
        type: String,
        default: ''
    },
    lastModifiedBy: String,
    
    // Metrics
    viewCount: {
        type: Number,
        default: 0
    },
    downloadCount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes for better performance
proposalSchema.index({ proposalNumber: 1 });
proposalSchema.index({ leadId: 1 });
proposalSchema.index({ status: 1 });
proposalSchema.index({ createdAt: -1 });
proposalSchema.index({ submittedDate: -1 });

// Virtual for days remaining
proposalSchema.virtual('daysRemaining').get(function() {
    if (!this.expiryDate) return null;
    const today = new Date();
    const diffTime = this.expiryDate - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for total project value
proposalSchema.virtual('totalProjectValue').get(function() {
    return this.proposalValue;
});

// FIXED: Auto-generate proposal number - moved to static method
proposalSchema.statics.generateProposalNumber = async function() {
    try {
        const currentYear = new Date().getFullYear();
        
        // Count existing proposals for current year
        const existingCount = await this.countDocuments({
            proposalNumber: { $regex: `^PROP-${currentYear}-` }
        });
        
        const nextNumber = existingCount + 1;
        const proposalNumber = `PROP-${currentYear}-${String(nextNumber).padStart(4, '0')}`;
        
        // Check if this number already exists (race condition protection)
        const exists = await this.findOne({ proposalNumber });
        if (exists) {
            // If exists, try next number
            const retryNumber = existingCount + 2;
            return `PROP-${currentYear}-${String(retryNumber).padStart(4, '0')}`;
        }
        
        return proposalNumber;
    } catch (error) {
        console.error('Error generating proposal number:', error);
        // Fallback with timestamp
        const timestamp = Date.now().toString().slice(-6);
        return `PROP-${new Date().getFullYear()}-${timestamp}`;
    }
};

// Pre-save middleware for other operations
proposalSchema.pre('save', async function(next) {
    try {
        // Generate proposal number only for new documents
        if (this.isNew && !this.proposalNumber) {
            this.proposalNumber = await this.constructor.generateProposalNumber();
        }
        
        // Set expiry date based on validity period
        if (this.submittedDate && this.validityPeriod && !this.expiryDate) {
            this.expiryDate = new Date(this.submittedDate.getTime() + (this.validityPeriod * 24 * 60 * 60 * 1000));
        }
        
        // Set status dates
        if (this.isModified('status')) {
            const now = new Date();
            switch (this.status) {
                case 'Submitted':
                    if (!this.submittedDate) this.submittedDate = now;
                    break;
                case 'Approved':
                    if (!this.approvedDate) this.approvedDate = now;
                    break;
                case 'Rejected':
                    if (!this.rejectedDate) this.rejectedDate = now;
                    break;
            }
        }
        
        next();
    } catch (error) {
        console.error('Pre-save error:', error);
        next(error);
    }
});

// Static method to get proposals by status
proposalSchema.statics.getProposalsByStatus = function(status) {
    return this.find({ status }).populate('leadId');
};

// Instance method to submit proposal
proposalSchema.methods.submit = function() {
    this.status = 'Submitted';
    this.submittedDate = new Date();
    return this.save();
};

// Instance method to approve proposal
proposalSchema.methods.approve = function() {
    this.status = 'Approved';
    this.approvedDate = new Date();
    return this.save();
};

module.exports = mongoose.model('Proposal', proposalSchema);