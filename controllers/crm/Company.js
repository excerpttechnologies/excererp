// controllers/companyController.js
const Company = require('../../models/crm/Company');

exports.createCompany = async (req, res) => {
  try {
    const { name, address, pincode, country, phone, email } = req.body;
    const logoPath = req.file ? `/uploads/${req.file.filename}` : null;

    const company = new Company({
      name, address, pincode, country, phone, email,
      logo: logoPath
    });

    await company.save();
    res.status(201).json(company);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Company creation failed' });
  }
};

exports.getAllCompanies = async (req, res) => {
  const companies = await Company.find();
  res.json(companies);
};
exports.getCompanyById = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }
    res.json(company);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch company' });
  }
};