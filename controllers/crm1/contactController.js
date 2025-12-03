const Contact = require('../../models/crm/contact');
const mongoose = require('mongoose');

class ContactController {
  // Get all contacts with filtering, sorting, and pagination
  async getContacts(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        search = '',
        sortBy = 'name',
        sortOrder = 'asc',
        tags = [],
        location = [],
        rating = [],
        status = [],
        owner = []
      } = req.query;

      // Build filter query
      const filter = {};

      // Search functionality
      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } }
        ];
      }

      // Apply filters
      if (tags.length > 0) {
        filter.tags = { $in: Array.isArray(tags) ? tags : [tags] };
      }

      if (location.length > 0) {
        filter.location = { $in: Array.isArray(location) ? location : [location] };
      }

      if (rating.length > 0) {
        filter.rating = { $in: Array.isArray(rating) ? rating.map(Number) : [Number(rating)] };
      }

      if (status.length > 0) {
        filter.status = { $in: Array.isArray(status) ? status : [status] };
      }

      if (owner.length > 0) {
        filter.owner = { $in: Array.isArray(owner) ? owner : [owner] };
      }

      // Sort configuration
      const sortConfig = {};
      sortConfig[sortBy] = sortOrder === 'desc' ? -1 : 1;

      // Pagination
      const skip = (parseInt(page) - 1) * parseInt(limit);

      // Execute query
      const contacts = await Contact.find(filter)
        .sort(sortConfig)
        .skip(skip)
        .limit(parseInt(limit));

      const totalCount = await Contact.countDocuments(filter);

      res.json({
        success: true,
        data: {
          contacts,
          totalCount,
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalCount / parseInt(limit)),
          hasNextPage: skip + parseInt(limit) < totalCount,
          hasPrevPage: parseInt(page) > 1
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching contacts',
        error: error.message
      });
    }
  }

  // Get single contact by ID
  async getContact(req, res) {
    try {
      const { id } = req.params;
      
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid contact ID'
        });
      }

      const contact = await Contact.findById(id);
      
      if (!contact) {
        return res.status(404).json({
          success: false,
          message: 'Contact not found'
        });
      }

      res.json({
        success: true,
        data: contact
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching contact',
        error: error.message
      });
    }
  }

  // Create new contact
  async createContact(req, res) {
    try {
      const contactData = req.body;
      
      // Check if email already exists
      const existingContact = await Contact.findOne({ email: contactData.email });
      if (existingContact) {
        return res.status(400).json({
          success: false,
          message: 'Contact with this email already exists'
        });
      }

      const contact = new Contact(contactData);
      await contact.save();

      res.status(201).json({
        success: true,
        message: 'Contact created successfully',
        data: contact
      });
    } catch (error) {
      if (error.name === 'ValidationError') {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: Object.values(error.errors).map(e => e.message)
        });
      }

      res.status(500).json({
        success: false,
        message: 'Error creating contact',
        error: error.message
      });
    }
  }

  // Update contact
  async updateContact(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid contact ID'
        });
      }

      // Check if email is being updated and already exists
      if (updateData.email) {
        const existingContact = await Contact.findOne({ 
          email: updateData.email, 
          _id: { $ne: id } 
        });
        
        if (existingContact) {
          return res.status(400).json({
            success: false,
            message: 'Contact with this email already exists'
          });
        }
      }

      const contact = await Contact.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      );

      if (!contact) {
        return res.status(404).json({
          success: false,
          message: 'Contact not found'
        });
      }

      res.json({
        success: true,
        message: 'Contact updated successfully',
        data: contact
      });
    } catch (error) {
      if (error.name === 'ValidationError') {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: Object.values(error.errors).map(e => e.message)
        });
      }

      res.status(500).json({
        success: false,
        message: 'Error updating contact',
        error: error.message
      });
    }
  }

  // Delete single contact
  async deleteContact(req, res) {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid contact ID'
        });
      }

      const contact = await Contact.findByIdAndDelete(id);

      if (!contact) {
        return res.status(404).json({
          success: false,
          message: 'Contact not found'
        });
      }

      res.json({
        success: true,
        message: 'Contact deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error deleting contact',
        error: error.message
      });
    }
  }

  // Delete multiple contacts
  async deleteContacts(req, res) {
    try {
      const { ids } = req.body;

      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Please provide an array of contact IDs'
        });
      }

      // Validate all IDs
      const invalidIds = ids.filter(id => !mongoose.Types.ObjectId.isValid(id));
      if (invalidIds.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid contact IDs found',
          invalidIds
        });
      }

      const result = await Contact.deleteMany({ _id: { $in: ids } });

      res.json({
        success: true,
        message: `${result.deletedCount} contacts deleted successfully`,
        deletedCount: result.deletedCount
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error deleting contacts',
        error: error.message
      });
    }
  }

  // Get contact statistics
  async getContactStats(req, res) {
    try {
      const stats = await Contact.aggregate([
        {
          $group: {
            _id: null,
            totalContacts: { $sum: 1 },
            activeContacts: {
              $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
            },
            inactiveContacts: {
              $sum: { $cond: [{ $eq: ['$status', 'inactive'] }, 1, 0] }
            },
            averageRating: { $avg: '$rating' }
          }
        }
      ]);

      const locationStats = await Contact.aggregate([
        { $group: { _id: '$location', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]);

      const ratingStats = await Contact.aggregate([
        { $group: { _id: '$rating', count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ]);

      res.json({
        success: true,
        data: {
          overview: stats[0] || {
            totalContacts: 0,
            activeContacts: 0,
            inactiveContacts: 0,
            averageRating: 0
          },
          locationStats,
          ratingStats
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching contact statistics',
        error: error.message
      });
    }
  }

  // Export contacts
  async exportContacts(req, res) {
    try {
      const { format = 'excel', ids = [] } = req.body;
      
      let filter = {};
      if (ids.length > 0) {
        filter._id = { $in: ids };
      }

      const contacts = await Contact.find(filter);

      if (format === 'excel') {
        // Implementation for Excel export would go here
        // You'd use a library like 'xlsx' or 'exceljs'
        res.json({
          success: true,
          message: 'Excel export functionality to be implemented',
          data: contacts
        });
      } else if (format === 'pdf') {
        // Implementation for PDF export would go here
        // You'd use a library like 'pdfkit' or 'puppeteer'
        res.json({
          success: true,
          message: 'PDF export functionality to be implemented',
          data: contacts
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'Invalid export format. Use "excel" or "pdf"'
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error exporting contacts',
        error: error.message
      });
    }
  }
}

module.exports = new ContactController();