// const express = require('express');
// const { body } = require('express-validator');
// const {
//   getAllLeads,
//   getLeadById,
//   createLead,
//   updateLead,
//   deleteLead,
//   getLeadStats
// } = require('../controllers/leadController');

// const router = express.Router();

// // Validation middleware
// const leadValidation = [
//   body('companyName')
//     .notEmpty()
//     .withMessage('Company name is required')
//     .isLength({ max: 100 })
//     .withMessage('Company name cannot exceed 100 characters'),
  
//   body('contactPersonName')
//     .notEmpty()
//     .withMessage('Contact person name is required')
//     .isLength({ max: 50 })
//     .withMessage('Contact person name cannot exceed 50 characters'),
  
//   body('email')
//     .isEmail()
//     .withMessage('Please provide a valid email')
//     .normalizeEmail(),
  
//   body('phoneNumber')
//     .notEmpty()
//     .withMessage('Phone number is required')
//     .matches(/^[\+]?[1-9][\d]{0,15}$/)
//     .withMessage('Please provide a valid phone number'),
  
//   body('leadSource')
//     .optional()
//     .isIn(['Website', 'Social Media', 'Referral', 'Cold Call', 'Advertisement'])
//     .withMessage('Invalid lead source'),
  
//   body('leadStatus')
//     .optional()
//     .isIn(['New', 'Contacted', 'Qualified', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'])
//     .withMessage('Invalid lead status'),
  
//   body('industry')
//     .optional()
//     .isIn(['Technology', 'Healthcare', 'Finance', 'Manufacturing', 'Retail', 'Education', 'Other'])
//     .withMessage('Invalid industry'),
  
//   body('companySize')
//     .optional()
//     .isIn(['1-10', '11-50', '51-200', '201-1000', '1000+'])
//     .withMessage('Invalid company size'),
  
//   body('annualRevenue')
//     .optional()
//     .isNumeric()
//     .withMessage('Annual revenue must be a number')
//     .custom(value => value >= 0)
//     .withMessage('Annual revenue cannot be negative'),
  
//   body('leadScore')
//     .optional()
//     .isInt({ min: 1, max: 100 })
//     .withMessage('Lead score must be between 1 and 100'),
  
//   body('assignedSalesRep')
//     .optional()
//     .isLength({ max: 50 })
//     .withMessage('Sales rep name cannot exceed 50 characters'),
  
//   body('notes')
//     .optional()
//     .isLength({ max: 1000 })
//     .withMessage('Notes cannot exceed 1000 characters'),
  
//   body('expectedDealValue')
//     .optional()
//     .isNumeric()
//     .withMessage('Expected deal value must be a number')
//     .custom(value => value >= 0)
//     .withMessage('Expected deal value cannot be negative'),
  
//   body('expectedCloseDate')
//     .optional()
//     .isISO8601()
//     .withMessage('Expected close date must be a valid date')
//     .custom(value => {
//       if (value && new Date(value) < new Date()) {
//         throw new Error('Expected close date cannot be in the past');
//       }
//       return true;
//     })
// ];

// // Routes
// router.get('/stats', getLeadStats);
// router.get('/', getAllLeads);
// router.get('/:id', getLeadById);
// router.post('/', leadValidation, createLead);
// router.put('/:id', leadValidation, updateLead);
// router.delete('/:id', deleteLead);

// module.exports = router;


const express = require('express');
const router = express.Router();
const leadController = require('../../controllers/crm/leadController');

// GET /api/leads - Get all leads
router.get('/', leadController.getLeads);

// POST /api/leads - Create new lead
router.post('/', leadController.createLead);

// GET /api/leads/campaign/:campaignId - Get leads by campaign
router.get('/campaign/:campaignId', leadController.getLeadsByCampaign);

// GET /api/leads/:id - Get lead by ID
router.get('/:id', leadController.getLeadById);

// PUT /api/leads/:id - Update lead
router.put('/:id', leadController.updateLead);

// DELETE /api/leads/:id - Delete lead
router.delete('/:id', leadController.deleteLead);

module.exports = router;