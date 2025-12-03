const Quotation = require('../../models/purchase/Quotation');
const QuotationCategory = require('../../models/categories/QuotationCategory');

/**
 * Generate the next internal quotation number for the given RFQ category.
 *
 * @param {String} categoryId - The RFQ category ID
 * @returns {Promise<String>} - The next quotation number, zero-padded to 6 digits
 */
async function generateQTNRNumber(categoryId) {
  try {
    const category = await QuotationCategory.findById(categoryId);
    if (!category) throw new Error('Invalid RFQ Category');

    // Find all quotations for this category, select only quotationNumber
    const existingQuotations = await Quotation.find({
      rfqCategoryId: categoryId, quotationNumberType: 'internal'
    }).select('quotationNumber');

    let nextNumber = category.rangeFrom;

    if (existingQuotations.length > 0) {
      // Extract all valid numbers and find the maximum
      const usedNumbers = existingQuotations
        .map(q => {
          // If quotationNumber is a string, parse to int
          const numberPart = q.quotationNumber;
          return parseInt(numberPart, 10);
        })
        .filter(num => !isNaN(num)); // Filter out invalid numbers

      if (usedNumbers.length > 0) {
        const maxUsedNumber = Math.max(...usedNumbers);
        nextNumber = maxUsedNumber + 1;
      }
    }

    // Range check (optional, if you want to enforce a max value like PO logic)
    if (category.rangeTo && nextNumber > category.rangeTo) {
      throw new Error(`Quotation number exceeded category range. Next: ${nextNumber}, Max: ${category.rangeTo}`);
    }

    const generatedQTNRNumber = `${nextNumber.toString().padStart(6, '0')}`;

    // Optional: Ensure the number doesn't already exist to avoid race conditions
    const existingQuotation = await Quotation.findOne({ quotationNumber: generatedQTNRNumber, rfqCategoryId: categoryId });
    if (existingQuotation) {
      throw new Error(`Quotation number ${generatedQTNRNumber} already exists`);
    }

    return generatedQTNRNumber;
  } catch (error) {
    console.error('Error in generateQTNRNumber:', error);
    throw error;
  }
}

exports.createQuotation = async (req, res) => {
    try {
        const { quotationGenType, externalQuotationNumber, rfqCategoryId, ...otherData } = req.body;
        console.log('Received data:', req.body);
        let quotationNumber;
        
        if (quotationGenType === 'external') {
            // Use external quotation number
            if (!externalQuotationNumber || externalQuotationNumber.trim() === '') {
                return res.status(400).json({ error: 'External quotation number is required' });
            }
            
            // Check if external quotation number already exists
            const existingQuotation = await Quotation.findOne({ 
                quotationNumber: externalQuotationNumber.trim() 
            });
            
            if (existingQuotation) {
                return res.status(400).json({ error: 'Quotation number already exists' });
            }
            
            quotationNumber = externalQuotationNumber.trim();
        } else {
            // Generate internal quotation number
            quotationNumber = await generateQTNRNumber(rfqCategoryId);
        }

        const quotation = new Quotation({
            quotationNumber,
            rfqCategoryId,
            quotationGenType: quotationGenType || 'internal', // Store the generation type
            ...otherData
        });

        await quotation.save();
        res.status(201).json({ 
            message: 'Quotation created successfully', 
            quotation,
            generationType: quotationGenType
        });
    } catch (error) {
        console.error('Error creating quotation:', error);
        
        if (error.code === 11000) {
            // Handle duplicate key error
            return res.status(400).json({ error: 'Quotation number already exists' });
        }
        
        res.status(500).json({ error: 'Failed to create quotation' });
    }
};
exports.getAllQuotations = async (req, res) => {
  try {
    const { companyId } = req.query;

    const filter = {};
    if (companyId) filter.companyId = companyId;

    const quotations = await Quotation.find(filter);
    res.json(quotations);
  } catch (error) {
    console.error('Error fetching quotations:', error);
    res.status(500).json({ error: 'Failed to fetch quotations' });
  }
};

// Get Quotation by ID
exports.getQuotationById = async (req, res) => {
    try {
      const quotation = await Quotation.findById(req.params.id).populate('rfqCategoryId', 'categoryName');
      if (!quotation) return res.status(404).json({ message: 'Quotation not found' });
      res.json(quotation);
    } catch (error) {
      console.error('Error fetching quotation:', error);
      res.status(500).json({ message: 'Failed to fetch quotation' });
    }
  };
  
// exports.getQuotationById = async (req, res) => {
//   try {
//     const quotation = await Quotation.findById(req.params.id);
//     if (!quotation) {
//       return res.status(404).json({ message: 'Quotation not found' });
//     }
//     res.json(quotation);
//   } catch (error) {
//     console.error('Error fetching quotation:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// PUT - Update quotation by ID
exports.updateQuotationById = async (req, res) => {
  try {
    const {
      indentId,
      categoryId,
      rfqCategoryId,
      vendor,
      vendorName,
      quotationReference,
      vnNo,
      validityDate,
      note,
      location,
      buyerGroup,
      totalPrice,
      items
    } = req.body;

    const calculatedTotalPrice = totalPrice || items.reduce((sum, item) => {
      return sum + (parseFloat(item.price) || 0);
    }, 0);

    const updatedQuotation = await Quotation.findByIdAndUpdate(
      req.params.id,
      {
        indentId,
        categoryId,
        rfqCategoryId,
        vendor,
        vendorName,
        quotationReference,
        vnNo,
        validityDate,
        note,
        location,
        buyerGroup,
        totalPrice: calculatedTotalPrice,
        items
      },
      { new: true }
    );

    if (!updatedQuotation) {
      return res.status(404).json({ message: 'Quotation not found' });
    }

    res.json(updatedQuotation);
  } catch (error) {
    console.error('Error updating quotation:', error);
    res.status(500).json({ message: 'Server error' });
  }
};