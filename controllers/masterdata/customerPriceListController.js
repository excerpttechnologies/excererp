const CustomerPriceList = require('../../models/masterdata/CustomerPriceList');

// exports.createCustomerPrice = async (req, res) => {
//   try {
//     const { categoryId, customerId, materialId, unit, bum, orderUnit, salesGroup, taxId,tandc, companyId,financialYear} = req.body;

//     if (!categoryId || !customerId || !materialId || !unit || !bum || !orderUnit || !salesGroup) {
//       return res.status(400).json({ message: 'All required fields must be filled.' });
//     }

//     const newEntry = new CustomerPriceList({
//       ...req.body,
//       companyId,
//       financialYear
//     });

//     await newEntry.save();
//     res.status(201).json({ message: 'Customer Price List saved successfully', data: newEntry });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Server Error' });
//   }
// };



exports.createCustomerPrice = async (req, res) => {
  try {
    const { categoryId, customerId, materialId, unit, bum, price, orderUnit, salesGroup, taxId, tandc, companyId, financialYear } = req.body;

    // Validate required fields (including price)
    if (!categoryId || !customerId || !materialId || !unit || !bum || !price || !salesGroup) {
      return res.status(400).json({ message: 'All required fields must be filled.' });
    }
    if (!req.body._id) {
  delete req.body._id;
}

    console.log(req.body)
    // Create a clean data object without the _id field for new records
    const dataToSave = {
      ...req.body,
      taxId: taxId || null
    };

    const newEntry = new CustomerPriceList(req.body);
    const savedEntry = await newEntry.save();
    
    res.status(201).json({ 
      message: 'Customer Price List saved successfully', 
      data: savedEntry 
    });
  } catch (error) {
    console.error('Error creating customer price list:', error);
    res.status(500).json({ 
      message: 'Server Error',
      error: error.message 
    });
  }
};
exports.getCustomerPrices = async (req, res) => {
  try {
     const { companyId } = req.query;

    const filter = {};
    if (companyId) filter.companyId = companyId;
    

  
    const list = await CustomerPriceList.find(filter).populate('customerId categoryId materialId taxId');
    res.status(200).json(list);
    console.log("list", list);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch data' });
  }
};

exports.getCustomerPriceById = async (req, res) => {
  try {
    const price = await CustomerPriceList.findById(req.params.id);
    if (!price) return res.status(404).json({ message: 'Not found' });
    res.json(price);
    console.log("pric",price);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching record' });
  }
};

exports.updateCustomerPrice = async (req, res) => {
  try {
    const updated = await CustomerPriceList.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ message: 'Updated successfully', data: updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Update failed' });
  }
};