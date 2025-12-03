const Proposal = require('../../models/crm/Proposal');
const Lead = require('../../models/crm/Lead');
const { validationResult } = require('express-validator');

// Get all proposals
const getAllProposals = async (req, res) => {
    try {
        const { 
            status, 
            search, 
            priority,
            page = 1, 
            limit = 20, 
            sortBy = 'createdAt', 
            sortOrder = 'desc' 
        } = req.query;
        
        // Build query
        let query = {};
        
        if (status) {
            query.status = status;
        }
        
        if (priority) {
            query.priority = priority;
        }
        
        if (search) {
            query.$or = [
                { proposalNumber: { $regex: search, $options: 'i' } },
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }
        
        // Calculate skip value for pagination
        const skip = (page - 1) * limit;
        
        // Build sort object
        const sort = {};
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
        
        // Execute query with pagination and populate lead data
        const proposals = await Proposal.find(query)
            .populate('leadId', 'companyName contactPersonName email phoneNumber leadStatus')
            .sort(sort)
            .skip(skip)
            .limit(parseInt(limit));
        
        // Get total count for pagination
        const total = await Proposal.countDocuments(query);
        
        res.json({
            proposals,
            pagination: {
                current: parseInt(page),
                pages: Math.ceil(total / limit),
                total,
                limit: parseInt(limit)
            }
        });
    } catch (error) {
        console.error('Error fetching proposals:', error);
        res.status(500).json({ 
            message: 'Error fetching proposals', 
            error: error.message 
        });
    }
};

// Get single proposal by ID
const getProposalById = async (req, res) => {
    try {
        const proposal = await Proposal.findById(req.params.id)
            .populate('leadId', 'companyName contactPersonName email phoneNumber leadStatus industry');
        
        if (!proposal) {
            return res.status(404).json({ message: 'Proposal not found' });
        }
        
        // Increment view count
        proposal.viewCount += 1;
        await proposal.save();
        
        res.json(proposal);
    } catch (error) {
        console.error('Error fetching proposal:', error);
        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'Invalid proposal ID format' });
        }
        res.status(500).json({ 
            message: 'Error fetching proposal', 
            error: error.message 
        });
    }
};

// FIXED: Create new proposal with proper number generation
const createProposal = async (req, res) => {
    try {
        console.log('Creating proposal with data:', req.body);
        
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                message: 'Validation errors', 
                errors: errors.array() 
            });
        }
        
        const proposalData = req.body;
        proposalData.createdBy = '';
        proposalData.assignedTo = '';
        
        // Verify that the lead exists
        const lead = await Lead.findById(proposalData.leadId);
        if (!lead) {
            return res.status(404).json({ message: 'Lead not found' });
        }
        
        console.log('Lead found:', lead.companyName);
        
        // Generate proposal number before creating
        const proposalNumber = await Proposal.generateProposalNumber();
        proposalData.proposalNumber = proposalNumber;
        
        console.log('Generated proposal number:', proposalNumber);
        
        const proposal = new Proposal(proposalData);
        const savedProposal = await proposal.save();
        
        console.log('Proposal saved with number:', savedProposal.proposalNumber);
        
        // Update lead with proposal reference
        await Lead.findByIdAndUpdate(proposalData.leadId, {
            proposalId: savedProposal._id,
            leadStatus: 'Proposal Submitted'
        });
        
        // Populate lead data before returning
        const populatedProposal = await Proposal.findById(savedProposal._id)
            .populate('leadId', 'companyName contactPersonName email phoneNumber');
        
        res.status(201).json(populatedProposal);
    } catch (error) {
        console.error('Error creating proposal:', error);
        
        if (error.name === 'ValidationError') {
            const validationErrors = Object.values(error.errors).map(err => ({
                field: err.path,
                message: err.message
            }));
            return res.status(400).json({ 
                message: 'Validation error', 
                errors: validationErrors 
            });
        }
        
        if (error.code === 11000) {
            // Duplicate key error - retry with new number
            try {
                const newProposalNumber = await Proposal.generateProposalNumber();
                const proposalData = req.body;
                proposalData.proposalNumber = newProposalNumber;
                proposalData.createdBy = '';
                proposalData.assignedTo = '';
                
                const proposal = new Proposal(proposalData);
                const savedProposal = await proposal.save();
                
                await Lead.findByIdAndUpdate(proposalData.leadId, {
                    proposalId: savedProposal._id,
                    leadStatus: 'Proposal Submitted'
                });
                
                const populatedProposal = await Proposal.findById(savedProposal._id)
                    .populate('leadId', 'companyName contactPersonName email phoneNumber');
                
                return res.status(201).json(populatedProposal);
            } catch (retryError) {
                console.error('Retry error:', retryError);
                return res.status(500).json({ 
                    message: 'Error creating proposal after retry', 
                    error: retryError.message 
                });
            }
        }
        
        res.status(500).json({ 
            message: 'Error creating proposal', 
            error: error.message 
        });
    }
};

// Update proposal
const updateProposal = async (req, res) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                message: 'Validation errors', 
                errors: errors.array() 
            });
        }
        
        const proposalId = req.params.id;
        const updateData = req.body;
        updateData.lastModifiedBy = 'sreevatsa-B-R';
        
        // Don't allow updating proposal number
        delete updateData.proposalNumber;
        
        const proposal = await Proposal.findByIdAndUpdate(
            proposalId,
            updateData,
            { 
                new: true, 
                runValidators: true 
            }
        ).populate('leadId', 'companyName contactPersonName email phoneNumber');
        
        if (!proposal) {
            return res.status(404).json({ message: 'Proposal not found' });
        }
        
        // Update lead status if proposal status changed
        if (updateData.status) {
            let leadStatus = 'Proposal Submitted';
            switch (updateData.status) {
                case 'Approved':
                    leadStatus = 'Proposal Approved';
                    break;
                case 'Rejected':
                    leadStatus = 'Closed Lost';
                    break;
                case 'Under Review':
                    leadStatus = 'Proposal Under Review';
                    break;
            }
            
            await Lead.findByIdAndUpdate(proposal.leadId._id, { leadStatus });
        }
        
        res.json(proposal);
    } catch (error) {
        console.error('Error updating proposal:', error);
        
        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'Invalid proposal ID format' });
        }
        
        if (error.name === 'ValidationError') {
            const validationErrors = Object.values(error.errors).map(err => ({
                field: err.path,
                message: err.message
            }));
            return res.status(400).json({ 
                message: 'Validation error', 
                errors: validationErrors 
            });
        }
        
        res.status(500).json({ 
            message: 'Error updating proposal', 
            error: error.message 
        });
    }
};

// Delete proposal
const deleteProposal = async (req, res) => {
    try {
        const proposal = await Proposal.findById(req.params.id);
        
        if (!proposal) {
            return res.status(404).json({ message: 'Proposal not found' });
        }
        
        // Remove proposal reference from lead
        if (proposal.leadId) {
            await Lead.findByIdAndUpdate(proposal.leadId, {
                $unset: { proposalId: 1 },
                leadStatus: 'Qualified'
            });
        }
        
        await Proposal.findByIdAndDelete(req.params.id);
        
        res.json({ message: 'Proposal deleted successfully', proposal });
    } catch (error) {
        console.error('Error deleting proposal:', error);
        
        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'Invalid proposal ID format' });
        }
        
        res.status(500).json({ 
            message: 'Error deleting proposal', 
            error: error.message 
        });
    }
};

// Get proposal statistics
const getProposalStats = async (req, res) => {
    try {
        const stats = await Proposal.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                    totalValue: { $sum: '$proposalValue' },
                    averageValue: { $avg: '$proposalValue' }
                }
            },
            {
                $sort: { count: -1 }
            }
        ]);
        
        const totalProposals = await Proposal.countDocuments();
        const totalValue = await Proposal.aggregate([
            { $group: { _id: null, total: { $sum: '$proposalValue' } } }
        ]);
        
        // Get monthly trend
        const monthlyStats = await Proposal.aggregate([
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' }
                    },
                    count: { $sum: 1 },
                    value: { $sum: '$proposalValue' }
                }
            },
            {
                $sort: { '_id.year': -1, '_id.month': -1 }
            },
            {
                $limit: 12
            }
        ]);
        
        res.json({
            totalProposals,
            totalValue: totalValue[0]?.total || 0,
            statusStats: stats,
            monthlyTrend: monthlyStats
        });
    } catch (error) {
        console.error('Error fetching proposal stats:', error);
        res.status(500).json({ 
            message: 'Error fetching proposal statistics', 
            error: error.message 
        });
    }
};

// Submit proposal (change status to submitted)
const submitProposal = async (req, res) => {
    try {
        const proposal = await Proposal.findById(req.params.id);
        
        if (!proposal) {
            return res.status(404).json({ message: 'Proposal not found' });
        }
        
        if (proposal.status !== 'Draft') {
            return res.status(400).json({ 
                message: 'Only draft proposals can be submitted' 
            });
        }
        
        const updatedProposal = await proposal.submit();
        
        // Update lead status
        await Lead.findByIdAndUpdate(proposal.leadId, { 
            leadStatus: 'Proposal Submitted' 
        });
        
        res.json(updatedProposal);
    } catch (error) {
        console.error('Error submitting proposal:', error);
        res.status(500).json({ 
            message: 'Error submitting proposal', 
            error: error.message 
        });
    }
};

module.exports = {
    getAllProposals,
    getProposalById,
    createProposal,
    updateProposal,
    deleteProposal,
    getProposalStats,
    submitProposal
};