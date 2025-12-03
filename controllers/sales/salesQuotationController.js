const SalesQuotation = require('../../models/sales/salesQuotationModel');
const SaleQuotationCategory = require('../../models/categories/saleQuotationCategoryModel');
const Customer = require('../../models/masterdata/Customer'); // Assuming you have a Customer model

async function generateQuotationNumber(categoryId) {
  try {
    const category = await SaleQuotationCategory.findById(categoryId);
    if (!category) throw new Error('Category not found');

    console.log('Category range:', category.rangeFrom, 'to', category.rangeTo);

    // Find ALL quotations for this category to determine the highest number
    const existingQuotations = await SalesQuotation.find({ 
      categoryId, quotationNumberType: 'internal'
    }).select('quotationNumber');

    let nextNumber = category.rangeFrom;

    if (existingQuotations.length > 0) {
      console.log('Found existing quotations:', existingQuotations.length);
      
      // Extract all numbers and find the maximum
      const usedNumbers = existingQuotations
        .map(quotation => {
          const numberPart = quotation.quotationNumber;
          return parseInt(numberPart, 10);
        })
        .filter(num => !isNaN(num) && num >= category.rangeFrom && num <= category.rangeTo); // Filter valid numbers within range
      
      if (usedNumbers.length > 0) {
        const maxUsedNumber = Math.max(...usedNumbers);
        console.log('Highest used number:', maxUsedNumber);
        nextNumber = maxUsedNumber + 1;
      }
    }

    console.log('Next number to use:', nextNumber);

    if (nextNumber > category.rangeTo) {
      throw new Error(`Quotation number exceeded category range. Next: ${nextNumber}, Max: ${category.rangeTo}`);
    }

    const generatedQuotationNumber = nextNumber.toString();
    console.log('Generated Quotation Number:', generatedQuotationNumber);

    // Optional: Add a check to ensure this number doesn't already exist
    const existingQuotation = await SalesQuotation.findOne({ 
      quotationNumber: generatedQuotationNumber, 
      categoryId 
    });
    if (existingQuotation) {
      throw new Error(`Quotation number ${generatedQuotationNumber} already exists`);
    }

    return generatedQuotationNumber;
  } catch (error) {
    console.error('Error in generateQuotationNumber:', error);
    throw error;
  }
}

// Update your createQuotation function in the backend controller:
exports.createQuotation = async (req, res) => {
  try {
    let quotationNumber;
    
    // Check if external quotation number is provided
    if (req.body.quotationNumberType === 'external' && req.body.externalQuotationNumber) {
      // Check if external quotation number already exists
      const existingQuotation = await SalesQuotation.findOne({ 
        quotationNumber: req.body.externalQuotationNumber.trim() 
      });
      
      if (existingQuotation) {
        return res.status(400).json({ error: 'Quotation number already exists' });
      }
      
      quotationNumber = req.body.externalQuotationNumber.trim();
    } else {
      // Generate internal quotation number
      quotationNumber = await generateQuotationNumber(req.body.categoryId);
    }

    // ✅ fetch customer data using ID from frontend
    const customer = await Customer.findById(req.body.customerId);
    
    
    
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    // ✅ use name1 + name2 and trim extra spaces
    const customerName = `${customer.name1} ${customer.name2}`.trim();
console.log('req body for sale quotation:', req.body);
    // ✅ create quotation with customerName field included
    const newQuotation = new SalesQuotation({
      ...req.body,
      quotationNumber,
      customerName // this field exists in SalesQuotation schema
    });

    const saved = await newQuotation.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error('Error creating quotation:', err);
    res.status(500).json({ error: err.message });
  }
};
// Get all quotations
exports.getAllQuotations = async (req, res) => {
  const { companyId } = req.query;

    const filter = {};
    if (companyId) filter.companyId = companyId;
  try {
    const quotations = await SalesQuotation.find(filter).populate('categoryId customerId');
    res.json(quotations);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch quotations' });
  }
};
