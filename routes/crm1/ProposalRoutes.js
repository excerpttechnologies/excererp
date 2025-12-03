const express = require('express');
const { body } = require('express-validator');
const {
    getAllProposals,
    getProposalById,
    createProposal,
    updateProposal,
    deleteProposal,
    getProposalStats,
    submitProposal
} = require('../../controllers/crm/ProposalController');

const router = express.Router();

// Validation middleware
const proposalValidation = [
    body('title')
        .notEmpty()
        .withMessage('Proposal title is required')
        .isLength({ max: 200 })
        .withMessage('Title cannot exceed 200 characters'),
    
    body('description')
        .notEmpty()
        .withMessage('Proposal description is required')
        .isLength({ max: 2000 })
        .withMessage('Description cannot exceed 2000 characters'),
    
    body('proposalValue')
        .isNumeric()
        .withMessage('Proposal value must be a number')
        .custom(value => value >= 0)
        .withMessage('Proposal value cannot be negative'),
    
    body('currency')
        .optional()
        .isIn(['USD', 'EUR', 'INR', 'GBP', 'CAD', 'AUD'])
        .withMessage('Invalid currency'),
    
    body('validityPeriod')
        .optional()
        .isInt({ min: 1, max: 365 })
        .withMessage('Validity period must be between 1 and 365 days'),
    
    body('status')
        .optional()
        .isIn(['Draft', 'Submitted', 'Under Review', 'Approved', 'Rejected', 'Expired', 'Withdrawn'])
        .withMessage('Invalid status'),
    
    body('priority')
        .optional()
        .isIn(['Low', 'Medium', 'High', 'Critical'])
        .withMessage('Invalid priority'),
    
    body('leadId')
        .notEmpty()
        .withMessage('Lead ID is required')
        .isMongoId()
        .withMessage('Invalid lead ID format'),
    
    body('businessObjective')
        .optional()
        .isLength({ max: 1000 })
        .withMessage('Business objective cannot exceed 1000 characters'),
    
    body('proposedSolution')
        .optional()
        .isLength({ max: 2000 })
        .withMessage('Proposed solution cannot exceed 2000 characters'),
    
    body('timeline')
        .optional()
        .isLength({ max: 500 })
        .withMessage('Timeline cannot exceed 500 characters'),
    
    body('paymentTerms')
        .optional()
        .isLength({ max: 500 })
        .withMessage('Payment terms cannot exceed 500 characters'),
    
    body('deliveryTerms')
        .optional()
        .isLength({ max: 500 })
        .withMessage('Delivery terms cannot exceed 500 characters'),
    
    body('projectDuration')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Project duration must be at least 1 day')
];

// Routes
router.get('/stats', getProposalStats);
router.get('/', getAllProposals);
router.get('/:id', getProposalById);
router.post('/', proposalValidation, createProposal);
router.put('/:id', proposalValidation, updateProposal);
router.put('/:id/submit', submitProposal);
router.delete('/:id', deleteProposal);

module.exports = router;