const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Import your models
const Material = require('../models/masterdata/Material');
const Customer = require('../models/masterdata/Customer');
const Vendor = require('../models/masterdata/Vendor');
const VendorPriceList = require('../models/masterdata/VendorPriceList');
const CustomerPriceList = require('../models/masterdata/CustomerPriceList');
const Tax = require('../models/masterdata/Tax');
const Location = require('../models/masterdata/location');
const GeneralCondition = require('../models/masterdata/generalcondition');
const Process = require('../models/masterdata/Processlist'); 

// Master data configurations with correct field mappings and reference fields
const masterDataConfig = {
  material: {
    model: Material,
    requiredFields: ['materialId', 'categoryName', 'description', 'baseUnit', 'orderUnit'],
    optionalFields: ['conversionValue', 'dimension', 'hsn', 'mpn', 'minstock', 'safetyStock', 'maxstock', 'pdt', 'materialgroup', 'location'],
    uniqueField: 'materialId',
    autoGenerateId: false,
    idPrefix: null,
    referenceFields: ['categoryName']
  },
  customer: {
    model: Customer,
    requiredFields: ['categoryName', 'name1', 'search', 'address1', 'contactNo', 'region', 'country'],
    optionalFields: ['name2', 'address2', 'extraAddresses', 'city', 'pincode', 'name', 'email', 'isDeleted', 'isBlocked'],
    uniqueField: 'cnNo',
    autoGenerateId: true,
    idPrefix: 'CUST',
    referenceFields: ['categoryName']
  },
  vendor: {
    model: Vendor,
    requiredFields: ['categoryName', 'name1', 'search', 'address1', 'contactNo', 'region', 'country'],
    optionalFields: ['name2', 'address2', 'extraAddresses', 'city', 'pincode', 'contactname', 'email', 'isDeleted', 'isBlocked'],
    uniqueField: 'vnNo',
    autoGenerateId: true,
    idPrefix: 'VEND',
    referenceFields: ['categoryName']
  },
  vendorPriceList: {
    model: VendorPriceList,
    requiredFields: ['categoryName', 'vendorCode', 'materialCode', 'unit', 'bum', 'orderUnit'],
    optionalFields: ['buyer', 'taxCode'],
    uniqueField: null,
    autoGenerateId: false,
    idPrefix: null,
    referenceFields: ['categoryName', 'vendorCode', 'materialCode', 'taxCode']
  },
  customerPriceList: {
    model: CustomerPriceList,
    requiredFields: ['categoryName', 'customerCode', 'materialCode', 'unit', 'bum', 'orderUnit', 'salesGroup'],
    optionalFields: ['taxCode', 'tandc'],
    uniqueField: null,
    autoGenerateId: false,
    idPrefix: null,
    referenceFields: ['categoryName', 'customerCode', 'materialCode', 'taxCode']
  },
  tax: {
    model: Tax,
    requiredFields: ['taxCode', 'taxName', 'cgst', 'sgst', 'igst'],
    optionalFields: [],
    uniqueField: 'taxCode',
    autoGenerateId: false,
    idPrefix: null,
    referenceFields: []
  },
  location: {
    model: Location,
    requiredFields: ['name'],
    optionalFields: ['address', 'city', 'state', 'country', 'postalCode', 'contactPerson', 'contactNumber'],
    uniqueField: 'name',
    autoGenerateId: false,
    idPrefix: null,
    referenceFields: []
  },
  generalCondition: {
    model: GeneralCondition,
    requiredFields: [],
    optionalFields: ['name', 'description', 'isDeleted', 'isBlocked'],
    uniqueField: 'name',
    autoGenerateId: false,
    idPrefix: null,
    referenceFields: []
  },
  process: {
    model: Process,
    requiredFields: [],
    optionalFields: ['processId', 'processDescription', 'isDeleted', 'isBlocked'],
    uniqueField: 'processId',
    autoGenerateId: false,
    idPrefix: null,
    referenceFields: []
  }
};

// Enhanced reference resolution function
const resolveAllReferences = async (record, masterDataType) => {
  try {
    // Material references
    if (masterDataType === 'material') {
      // Resolve category name to categoryId ObjectId
      if (record.categoryName) {
        const MaterialCategory = require('../models/categories/MaterialCategory');
        const category = await MaterialCategory.findOne({
          companyId: record.companyId,
          financialYear: record.financialYear,
          categoryName: record.categoryName
        });

        if (category) {
          record.categoryId = category._id;
          delete record.categoryName;
        } else {
          throw new Error(`Material category '${record.categoryName}' not found. Please create the category first.`);
        }
      }
    }

    // Customer references
    else if (masterDataType === 'customer') {
      // Resolve customer category
      if (record.categoryName) {
        const CustomerCategory = require('../models/categories/CustomerCategory');
        const category = await CustomerCategory.findOne({
          companyId: record.companyId,
          financialYear: record.financialYear,
          categoryName: record.categoryName
        });

        if (category) {
          record.categoryId = category._id;
          delete record.categoryName;
        } else {
          throw new Error(`Customer category '${record.categoryName}' not found. Please create the category first.`);
        }
      }
    }

    // Vendor references
    else if (masterDataType === 'vendor') {
      // Resolve vendor category
      if (record.categoryName) {
        const VendorCategory = require('../models/categories/VendorCategory');
        const category = await VendorCategory.findOne({
          companyId: record.companyId,
          categoryName: record.categoryName
        });

        if (category) {
          record.categoryId = category._id;
          delete record.categoryName;
        } else {
          throw new Error(`Vendor category '${record.categoryName}' not found. Please create the category first.`);
        }
      }
    }

    // Customer Price List references
    else if (masterDataType === 'customerPriceList') {
      // Resolve customer category
      if (record.categoryName) {
        const CustomerCategory = require('../models/categories/CustomerCategory');
        const category = await CustomerCategory.findOne({
          companyId: record.companyId,
          financialYear: record.financialYear,
          categoryName: record.categoryName
        });

        if (category) {
          record.categoryId = category._id;
          delete record.categoryName;
        } else {
          throw new Error(`Customer category '${record.categoryName}' not found. Please create the category first.`);
        }
      }

      // Resolve customer reference
      if (record.customerName || record.customerCode) {
        const Customer = require('../models/masterdata/Customer');
        const customerQuery = {};
        
        if (record.customerCode) {
          customerQuery.cnNo = record.customerCode;
        } else if (record.customerName) {
          customerQuery.name1 = record.customerName;
        }
        
        customerQuery.companyId = record.companyId;
        customerQuery.financialYear = record.financialYear;

        const customer = await Customer.findOne(customerQuery);

        if (customer) {
          record.customerId = customer._id;
          delete record.customerName;
          delete record.customerCode;
        } else {
          throw new Error(`Customer '${record.customerName || record.customerCode}' not found. Please create the customer first.`);
        }
      }

      // Resolve material reference
      if (record.materialCode) {
        const Material = require('../models/masterdata/Material');
        const material = await Material.findOne({
          materialId: record.materialCode,
          companyId: record.companyId,
          financialYear: record.financialYear
        });

        if (material) {
          record.materialId = material._id;
          delete record.materialCode;
        } else {
          throw new Error(`Material '${record.materialCode}' not found. Please create the material first.`);
        }
      }

      // Resolve tax reference
      if (record.taxCode) {
        const Tax = require('../models/masterdata/Tax');
        const tax = await Tax.findOne({
          taxCode: record.taxCode
        });

        if (tax) {
          record.taxId = tax._id;
          delete record.taxCode;
        } else {
          throw new Error(`Tax '${record.taxCode}' not found. Please create the tax first.`);
        }
      }
    }

    // Vendor Price List references
    else if (masterDataType === 'vendorPriceList') {
      // Resolve vendor category
      if (record.categoryName) {
        const VendorCategory = require('../models/categories/VendorCategory');
        const category = await VendorCategory.findOne({
          companyId: record.companyId,
          financialYear: record.financialYear,
          categoryName: record.categoryName
        });

        if (category) {
          record.categoryId = category._id;
          delete record.categoryName;
        } else {
          throw new Error(`Vendor category '${record.categoryName}' not found. Please create the category first.`);
        }
      }

      // Resolve vendor reference
      if (record.vendorName || record.vendorCode) {
        const Vendor = require('../models/masterdata/Vendor');
        const vendorQuery = {};
        
        if (record.vendorCode) {
          vendorQuery.vnNo = record.vendorCode;
        } else if (record.vendorName) {
          vendorQuery.name1 = record.vendorName;
        }
        
        vendorQuery.companyId = record.companyId;
        vendorQuery.financialYear = record.financialYear;

        const vendor = await Vendor.findOne(vendorQuery);

        if (vendor) {
          record.vendorId = vendor._id;
          delete record.vendorName;
          delete record.vendorCode;
        } else {
          throw new Error(`Vendor '${record.vendorName || record.vendorCode}' not found. Please create the vendor first.`);
        }
      }

      // Resolve material reference
      if (record.materialCode) {
        const Material = require('../models/masterdata/Material');
        const material = await Material.findOne({
          materialId: record.materialCode,
          companyId: record.companyId,
          financialYear: record.financialYear
        });

        if (material) {
          record.materialId = material._id;
          delete record.materialCode;
        } else {
          throw new Error(`Material '${record.materialCode}' not found. Please create the material first.`);
        }
      }

      // Resolve tax reference
      if (record.taxCode) {
        const Tax = require('../models/masterdata/Tax');
        const tax = await Tax.findOne({
          taxCode: record.taxCode
        });

        if (tax) {
          record.taxId = tax._id;
          delete record.taxCode;
        } else {
          throw new Error(`Tax '${record.taxCode}' not found. Please create the tax first.`);
        }
      }
    }

    return record;
  } catch (error) {
    throw error;
  }
};

// Helper function to generate unique IDs
const generateUniqueId = async (model, prefix, companyId, financialYear) => {
  try {
    // Find the latest record for this company and financial year
    const latestRecord = await model.findOne(
      { companyId, financialYear },
      {},
      { sort: { createdAt: -1 } }
    );

    let nextNumber = 1;
    if (latestRecord) {
      const idField = masterDataConfig.material.model === model ? 'materialId' :
        masterDataConfig.customer.model === model ? 'cnNo' : 'vnNo';

      if (latestRecord[idField]) {
        const currentNumber = parseInt(latestRecord[idField].replace(prefix, ''));
        nextNumber = currentNumber + 1;
      }
    }

    return `${prefix}${nextNumber.toString().padStart(6, '0')}`;
  } catch (error) {
    console.error('Error generating unique ID:', error);
    return `${prefix}${Date.now()}`;
  }
};

// Validate data based on master data type
const validateRecord = (record, config) => {
  const errors = [];

  config.requiredFields.forEach(field => {
    if (!record[field] || record[field].toString().trim() === '') {
      errors.push(`${field} is required`);
    }
  });

  return errors;
};

// Helper function to validate field lengths
const validateFieldLengths = (record, masterDataType) => {
  const errors = [];

  if (masterDataType === 'tax') {
    if (record.taxCode && record.taxCode.length > 4) {
      errors.push('taxCode must be 4 characters or less');
    }
    if (record.taxName && record.taxName.length > 25) {
      errors.push('taxName must be 25 characters or less');
    }
    if (record.cgst && record.cgst.length > 2) {
      errors.push('cgst must be 2 characters or less');
    }
    if (record.sgst && record.sgst.length > 2) {
      errors.push('sgst must be 2 characters or less');
    }
    if (record.igst && record.igst.length > 2) {
      errors.push('igst must be 2 characters or less');
    }
  }

  return errors;
};

// Helper function to validate ObjectId format
const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

// Helper function to process data type conversions
const processDataTypeConversions = (record, masterDataType) => {
  if (masterDataType === 'material') {
    // Convert numeric fields
    if (record.conversionValue) record.conversionValue = parseFloat(record.conversionValue);
    if (record.minstock) record.minstock = parseFloat(record.minstock);
    if (record.safetyStock) record.safetyStock = parseFloat(record.safetyStock);
    if (record.maxstock) record.maxstock = parseFloat(record.maxstock);
    if (record.pdt) record.pdt = parseInt(record.pdt);
  }

  if (masterDataType === 'customer' || masterDataType === 'vendor') {
    // Convert boolean fields
    if (record.isDeleted !== undefined) {
      record.isDeleted = record.isDeleted === 'true' || record.isDeleted === true;
    } else {
      record.isDeleted = false;
    }

    if (record.isBlocked !== undefined) {
      record.isBlocked = record.isBlocked === 'true' || record.isBlocked === true;
    } else {
      record.isBlocked = false;
    }

    // Handle extraAddresses array
    if (record.extraAddresses) {
      if (typeof record.extraAddresses === 'string') {
        // Split by comma if it's a string
        record.extraAddresses = record.extraAddresses.split(',').map(addr => addr.trim()).filter(addr => addr.length > 0);
      } else if (!Array.isArray(record.extraAddresses)) {
        record.extraAddresses = [];
      }
    } else {
      record.extraAddresses = [];
    }
  }

  if (masterDataType === 'vendorPriceList') {
    // Convert numeric fields
    if (record.bum) record.bum = parseFloat(record.bum);
    if (record.orderUnit) record.orderUnit = parseFloat(record.orderUnit);
  }

  if (masterDataType === 'customerPriceList') {
    // Convert numeric fields
    if (record.bum) record.bum = parseFloat(record.bum);

    // Set taxId to null if empty string
    if (record.taxId === '' || record.taxId === 'null' || record.taxId === 'NULL') {
      record.taxId = null;
    }
  }

  if (masterDataType === 'tax') {
    // Trim string fields and ensure they are strings
    if (record.taxCode) record.taxCode = record.taxCode.toString().trim();
    if (record.taxName) record.taxName = record.taxName.toString().trim();
    if (record.cgst) record.cgst = record.cgst.toString().trim();
    if (record.sgst) record.sgst = record.sgst.toString().trim();
    if (record.igst) record.igst = record.igst.toString().trim();

    // Validate field lengths
    const lengthErrors = validateFieldLengths(record, masterDataType);
    if (lengthErrors.length > 0) {
      throw new Error(lengthErrors.join(', '));
    }
  }

  if (masterDataType === 'location') {
    // Trim all string fields (schema has trim: true for all string fields)
    const stringFields = ['name', 'address', 'city', 'state', 'country', 'postalCode', 'contactPerson', 'contactNumber'];
    stringFields.forEach(field => {
      if (record[field] && typeof record[field] === 'string') {
        record[field] = record[field].trim();
      }
    });
  }

  if (masterDataType === 'generalCondition' || masterDataType === 'process') {
    // Handle boolean fields
    if (record.isDeleted !== undefined) {
      record.isDeleted = record.isDeleted === 'true' || record.isDeleted === true;
    } else {
      record.isDeleted = false;
    }

    if (record.isBlocked !== undefined) {
      record.isBlocked = record.isBlocked === 'true' || record.isBlocked === true;
    } else {
      record.isBlocked = false;
    }

    // Trim string fields
    if (masterDataType === 'generalCondition') {
      if (record.name && typeof record.name === 'string') {
        record.name = record.name.trim();
      }
      if (record.description && typeof record.description === 'string') {
        record.description = record.description.trim();
      }
    }

    if (masterDataType === 'process') {
      if (record.processId && typeof record.processId === 'string') {
        record.processId = record.processId.trim();
      }
      if (record.processDescription && typeof record.processDescription === 'string') {
        record.processDescription = record.processDescription.trim();
      }
    }
  }

  return record;
};

// Generic import endpoint
router.post('/:masterDataType/import', async (req, res) => {
  try {
    const { masterDataType } = req.params;
    const { data, companyId, financialYear } = req.body;

    if (!masterDataConfig[masterDataType]) {
      return res.status(400).json({
        success: false,
        message: 'Invalid master data type'
      });
    }

    const config = masterDataConfig[masterDataType];
    const Model = config.model;
    const results = {
      imported: 0,
      updated: 0,
      failed: 0,
      errors: []
    };

    // Process each record
    for (let i = 0; i < data.length; i++) {
      try {
        let record = data[i];

        // Add system fields for models that have them
        if (!['tax', 'generalCondition', 'process'].includes(masterDataType)) {
          record.companyId = companyId;
          record.financialYear = financialYear;
        }

        // Resolve all references BEFORE validation
        record = await resolveAllReferences(record, masterDataType);

        const validationErrors = validateRecord(record, config);

        if (validationErrors.length > 0) {
          results.failed++;
          results.errors.push(`Row ${i + 1}: ${validationErrors.join(', ')}`);
          continue;
        }

        // Process data type conversions
        record = processDataTypeConversions(record, masterDataType);

        if (masterDataType === 'material') {
          // Validate that materialId is provided
          if (!record.materialId || record.materialId.trim() === '') {
            throw new Error('materialId is required');
          }

          // Check for duplicate materialId
          const existingMaterial = await Model.findOne({
            materialId: record.materialId,
            companyId: companyId
          });

          if (existingMaterial) {
            // Update existing record
            await Model.updateOne(
              { _id: existingMaterial._id },
              {
                $set: {
                  ...record,
                  updatedAt: new Date()
                }
              }
            );
            results.updated++;
          } else {
            // Create new record
            await Model.create(record);
            results.imported++;
          }
        }
        else if (masterDataType === 'customer') {
          // Generate customer number if not provided
          if (!record.cnNo) {
            record.cnNo = await generateUniqueId(Model, config.idPrefix, companyId, financialYear);
          }

          // Check for duplicate customer by cnNo or name1
          const existingCustomer = await Model.findOne({
            $and: [
              { companyId: companyId },
              {
                $or: [
                  { cnNo: record.cnNo },
                  { name1: record.name1 }
                ]
              }
            ]
          });

          if (existingCustomer) {
            await Model.updateOne(
              { _id: existingCustomer._id },
              {
                $set: {
                  ...record,
                  updatedAt: new Date()
                }
              }
            );
            results.updated++;
          } else {
            await Model.create(record);
            results.imported++;
          }
        }
        else if (masterDataType === 'vendor') {
          // Generate vendor number if not provided
          if (!record.vnNo) {
            record.vnNo = await generateUniqueId(Model, config.idPrefix, companyId, financialYear);
          }

          // Check for duplicate vendor by vnNo or name1
          const existingVendor = await Model.findOne({
            $and: [
              { companyId: companyId },
              {
                $or: [
                  { vnNo: record.vnNo },
                  { name1: record.name1 }
                ]
              }
            ]
          });

          if (existingVendor) {
            await Model.updateOne(
              { _id: existingVendor._id },
              {
                $set: {
                  ...record,
                  updatedAt: new Date()
                }
              }
            );
            results.updated++;
          } else {
            await Model.create(record);
            results.imported++;
          }
        }
        else if (masterDataType === 'vendorPriceList') {
          // Check for duplicate vendor price list entry
          const existingPriceList = await Model.findOne({
            categoryId: record.categoryId,
            vendorId: record.vendorId,
            materialId: record.materialId,
            unit: record.unit,
            companyId: companyId,
            financialYear: financialYear
          });

          if (existingPriceList) {
            // Update existing record
            await Model.updateOne(
              { _id: existingPriceList._id },
              {
                $set: {
                  ...record,
                  updatedAt: new Date()
                }
              }
            );
            results.updated++;
          } else {
            // Create new record
            await Model.create(record);
            results.imported++;
          }
        }
        else if (masterDataType === 'customerPriceList') {
          // Check for duplicate customer price list entry
          const existingPriceList = await Model.findOne({
            categoryId: record.categoryId,
            customerId: record.customerId,
            materialId: record.materialId,
            unit: record.unit,
            salesGroup: record.salesGroup,
            companyId: companyId,
            financialYear: financialYear
          });

          if (existingPriceList) {
            // Update existing record
            await Model.updateOne(
              { _id: existingPriceList._id },
              {
                $set: {
                  ...record,
                  updatedAt: new Date()
                }
              }
            );
            results.updated++;
          } else {
            // Create new record
            await Model.create(record);
            results.imported++;
          }
        }
        else if (masterDataType === 'tax') {
          // Check for duplicate tax by taxCode
          const existingTax = await Model.findOne({
            taxCode: record.taxCode
          });

          if (existingTax) {
            // Update existing record
            await Model.updateOne(
              { _id: existingTax._id },
              {
                $set: {
                  ...record,
                  updatedAt: new Date()
                }
              }
            );
            results.updated++;
          } else {
            // Create new record
            await Model.create(record);
            results.imported++;
          }
        }
        else if (masterDataType === 'location') {
          // Check for duplicate location by name and companyId
          const existingLocation = await Model.findOne({
            name: record.name,
            companyId: companyId
          });

          if (existingLocation) {
            // Update existing record
            await Model.updateOne(
              { _id: existingLocation._id },
              {
                $set: {
                  ...record,
                }
              }
            );
            results.updated++;
          } else {
            // Create new record (createdAt will be set by default)
            await Model.create(record);
            results.imported++;
          }
        }
        else if (masterDataType === 'generalCondition') {
          // Check for duplicate general condition by name
          let existingCondition;
          if (record.name && record.name.trim() !== '') {
            existingCondition = await Model.findOne({
              name: record.name
            });
          } else {
            // If no name provided, skip duplicate check and create new record
            existingCondition = null;
          }

          if (existingCondition) {
            // Update existing record
            await Model.updateOne(
              { _id: existingCondition._id },
              {
                $set: {
                  ...record,
                  updatedAt: new Date()
                }
              }
            );
            results.updated++;
          } else {
            // Create new record
            await Model.create(record);
            results.imported++;
          }
        }
        else if (masterDataType === 'process') {
          // Check for duplicate process by processId
          let existingProcess;
          if (record.processId && record.processId.trim() !== '') {
            existingProcess = await Model.findOne({
              processId: record.processId
            });
          } else {
            // If no processId provided, skip duplicate check and create new record
            existingProcess = null;
          }

          if (existingProcess) {
            // Update existing record
            await Model.updateOne(
              { _id: existingProcess._id },
              {
                $set: {
                  ...record,
                  updatedAt: new Date()
                }
              }
            );
            results.updated++;
          } else {
            // Create new record
            await Model.create(record);
            results.imported++;
          }
        }

      } catch (error) {
        console.error(`Error processing row ${i + 1}:`, error);
        results.failed++;
        results.errors.push(`Row ${i + 1}: ${error.message}`);
      }
    }

    res.json({
      success: true,
      message: 'Import completed',
      results
    });

  } catch (error) {
    console.error('Import error:', error);
    res.status(500).json({
      success: false,
      message: 'Import failed',
      error: error.message
    });
  }
});

// Bulk import endpoint for large datasets
router.post('/:masterDataType/bulk-import', async (req, res) => {
  try {
    const { masterDataType } = req.params;
    const { data, companyId, financialYear } = req.body;

    if (!masterDataConfig[masterDataType]) {
      return res.status(400).json({
        success: false,
        message: 'Invalid master data type'
      });
    }

    const config = masterDataConfig[masterDataType];
    const Model = config.model;
    const results = {
      imported: 0,
      updated: 0,
      failed: 0,
      errors: []
    };

    // Process in batches for better performance
    const batchSize = 100;
    const batches = [];

    for (let i = 0; i < data.length; i += batchSize) {
      batches.push(data.slice(i, i + batchSize));
    }

    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex];
      const bulkOps = [];

      for (let i = 0; i < batch.length; i++) {
        try {
          let record = batch[i];
          const actualRowNumber = (batchIndex * batchSize) + i + 1;

          // Add system fields for models that have them
          if (!['tax'].includes(masterDataType)) {
            record.companyId = companyId;
            record.financialYear = financialYear;
          }

          // Resolve all references BEFORE validation
          record = await resolveAllReferences(record, masterDataType);

          const validationErrors = validateRecord(record, config);

          if (validationErrors.length > 0) {
            results.failed++;
            results.errors.push(`Row ${actualRowNumber}: ${validationErrors.join(', ')}`);
            continue;
          }

          // Process data type conversions
          record = processDataTypeConversions(record, masterDataType);

          if (masterDataType === 'material') {
            // Validate materialId
            if (!record.materialId || record.materialId.trim() === '') {
              throw new Error('materialId is required');
            }

            bulkOps.push({
              updateOne: {
                filter: { materialId: record.materialId, companyId: companyId },
                update: { $set: record },
                upsert: true
              }
            });
          }
          else if (masterDataType === 'customer') {
            if (!record.cnNo) {
              record.cnNo = await generateUniqueId(Model, config.idPrefix, companyId, financialYear);
            }

            bulkOps.push({
              updateOne: {
                filter: {
                  $and: [
                    { companyId: companyId },
                    {
                      $or: [
                        { cnNo: record.cnNo },
                        { name1: record.name1 }
                      ]
                    }
                  ]
                },
                update: { $set: record },
                upsert: true
              }
            });
          }
          else if (masterDataType === 'vendor') {
            if (!record.vnNo) {
              record.vnNo = await generateUniqueId(Model, config.idPrefix, companyId, financialYear);
            }

            bulkOps.push({
              updateOne: {
                filter: {
                  $and: [
                    { companyId: companyId },
                    {
                      $or: [
                        { vnNo: record.vnNo },
                        { name1: record.name1 }
                      ]
                    }
                  ]
                },
                update: { $set: record },
                upsert: true
              }
            });
          }
          else if (masterDataType === 'vendorPriceList') {
            bulkOps.push({
              updateOne: {
                filter: {
                  categoryId: record.categoryId,
                  vendorId: record.vendorId,
                  materialId: record.materialId,
                  unit: record.unit,
                  companyId: companyId,
                  financialYear: financialYear
                },
                update: { $set: record },
                upsert: true
              }
            });
          }
          else if (masterDataType === 'customerPriceList') {
            bulkOps.push({
              updateOne: {
                filter: {
                  categoryId: record.categoryId,
                  customerId: record.customerId,
                  materialId: record.materialId,
                  unit: record.unit,
                  salesGroup: record.salesGroup,
                  companyId: companyId,
                  financialYear: financialYear
                },
                update: { $set: record },
                upsert: true
              }
            });
          }
          else if (masterDataType === 'tax') {
            bulkOps.push({
              updateOne: {
                filter: { taxCode: record.taxCode },
                update: { $set: record },
                upsert: true
              }
            });
          }
          else if (masterDataType === 'location') {
            bulkOps.push({
              updateOne: {
                filter: {
                  name: record.name,
                  companyId: companyId
                },
                update: { $set: record },
                upsert: true
              }
            });
          }
          else if (masterDataType === 'generalCondition') {
            if (record.name && record.name.trim() !== '') {
              bulkOps.push({
                updateOne: {
                  filter: { name: record.name },
                  update: { $set: record },
                  upsert: true
                }
              });
            } else {
              // No name provided, just create new record
              bulkOps.push({
                insertOne: {
                  document: record
                }
              });
            }
          }
          else if (masterDataType === 'process') {
            if (record.processId && record.processId.trim() !== '') {
              bulkOps.push({
                updateOne: {
                  filter: { processId: record.processId },
                  update: { $set: record },
                  upsert: true
                }
              });
            } else {
              // No processId provided, just create new record
              bulkOps.push({
                insertOne: {
                  document: record
                }
              });
            }
          }

        } catch (error) {
          const actualRowNumber = (batchIndex * batchSize) + i + 1;
          results.failed++;
          results.errors.push(`Row ${actualRowNumber}: ${error.message}`);
        }
      }

      // Execute bulk operations
      if (bulkOps.length > 0) {
        try {
          const bulkResult = await Model.bulkWrite(bulkOps);
          results.imported += bulkResult.upsertedCount + (bulkResult.insertedCount || 0);
          results.updated += bulkResult.modifiedCount;
        } catch (error) {
          console.error(`Batch ${batchIndex + 1} error:`, error);
          results.failed += bulkOps.length;
          results.errors.push(`Batch ${batchIndex + 1}: ${error.message}`);
        }
      }
    }

    res.json({
      success: true,
      message: 'Bulk import completed',
      results
    });

  } catch (error) {
    console.error('Bulk import error:', error);
    res.status(500).json({
      success: false,
      message: 'Bulk import failed',
      error: error.message
    });
  }
});

// Template download endpoint
router.get('/:masterDataType/template/:format', (req, res) => {
  try {
    const { masterDataType, format } = req.params;

    if (!masterDataConfig[masterDataType]) {
      return res.status(400).json({
        success: false,
        message: 'Invalid master data type'
      });
    }

    // Updated templates with reference-friendly field names
    const templates = {
      material: {
        materialId: 'MAT001',
        categoryName: 'Raw Materials', // User-friendly category name instead of ObjectId
        description: 'Sample Raw Material Description',
        baseUnit: 'KG',
        orderUnit: 'KG',
        conversionValue: 1,
        dimension: '10x10x10',
        hsn: '1234567890',
        mpn: 'MPN001',
        minstock: 10,
        safetyStock: 5,
        maxstock: 100,
        pdt: 7,
        materialgroup: 'RAW_MATERIAL',
        location: 'WH01'
      },
      customer: {
        categoryName: 'Retail Customers', // User-friendly category name
        name1: 'Sample Customer Pvt Ltd',
        name2: 'Sample Customer',
        search: 'SAMPLE_CUSTOMER',
        address1: '123, Business Street',
        address2: 'Near Business Park',
        extraAddresses: 'Alternative Address 1, Alternative Address 2',
        city: 'Mumbai',
        pincode: '400001',
        region: 'Maharashtra',
        country: 'India',
        contactNo: '9876543210',
        name: 'Contact Person Name',
        email: 'customer@example.com',
        isDeleted: false,
        isBlocked: false
      },
      vendor: {
        categoryName: 'Raw Material Suppliers', // User-friendly category name
        name1: 'Sample Vendor Pvt Ltd',
        name2: 'Sample Vendor',
        search: 'SAMPLE_VENDOR',
        address1: '456, Supplier Avenue',
        address2: 'Industrial Area',
        extraAddresses: 'Warehouse Address 1, Backup Address 2',
        city: 'Delhi',
        pincode: '110001',
        region: 'Delhi',
        country: 'India',
        contactNo: '9876543210',
        contactname: 'Vendor Contact Person',
        email: 'vendor@example.com',
        isDeleted: false,
        isBlocked: false
      },
      vendorPriceList: {
        categoryName: 'Raw Material Suppliers', // Vendor category name
        vendorCode: 'VEND000001', // Vendor code/number
        materialCode: 'MAT001', // Material code/ID
        unit: 'KG',
        bum: 150.50,
        buyer: 'John Doe',
        taxCode: 'GST1', // Tax code instead of ObjectId
        orderUnit: 100
      },
      customerPriceList: {
        categoryName: 'Retail Customers', // Customer category name
        customerCode: 'CUST000001', // Customer code/number
        materialCode: 'MAT001', // Material code/ID
        unit: 'KG',
        bum: 250.75,
        orderUnit: 'BOX',
        salesGroup: 'RETAIL',
        taxCode: 'GST1', // Tax code instead of ObjectId
        tandc: 'Payment terms: 30 days net. Delivery: FOB warehouse.'
      },
      tax: {
        taxCode: 'GST1',
        taxName: 'GST Standard Rate 18%',
        cgst: '9',
        sgst: '9',
        igst: '18'
      },
      location: {
        name: 'Main Warehouse',
        address: '123, Industrial Area, Sector 5',
        city: 'Bangalore',
        state: 'Karnataka',
        country: 'India',
        postalCode: '560001',
        contactPerson: 'Warehouse Manager',
        contactNumber: '+91-9876543210'
      },
      generalCondition: {
        name: 'Standard Terms and Conditions',
        description: 'Default terms and conditions applicable to all transactions. Payment due within 30 days. Quality complaints must be reported within 48 hours.',
        isDeleted: false,
        isBlocked: false
      },
      process: {
        processId: 'PROC001',
        processDescription: 'Standard manufacturing process for raw material conversion. Includes quality checks at each stage.',
        isDeleted: false,
        isBlocked: false
      }
    };

    const templateData = templates[masterDataType];
    const fileName = `${masterDataType}_template`;

    if (format === 'csv') {
      const headers = Object.keys(templateData).join(',');
      const values = Object.values(templateData).map(val =>
        typeof val === 'string' && val.includes(',') ? `"${val}"` : val
      ).join(',');
      const csv = `${headers}\n${values}`;

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}.csv"`);
      res.send(csv);

    } else if (format === 'excel') {
      const XLSX = require('xlsx');
      const ws = XLSX.utils.json_to_sheet([templateData]);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Template');

      const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}.xlsx"`);
      res.send(buffer);

    } else if (format === 'json') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}.json"`);
      res.json([templateData]);

    } else {
      res.status(400).json({
        success: false,
        message: 'Invalid format. Supported formats: csv, excel, json'
      });
    }

  } catch (error) {
    console.error('Template download error:', error);
    res.status(500).json({
      success: false,
      message: 'Template download failed',
      error: error.message
    });
  }
});

// Get import history endpoint
router.get('/:masterDataType/import-history', async (req, res) => {
  try {
    const { masterDataType } = req.params;
    const { companyId } = req.query;

    if (!masterDataConfig[masterDataType]) {
      return res.status(400).json({
        success: false,
        message: 'Invalid master data type'
      });
    }

    const Model = masterDataConfig[masterDataType].model;

    // For models without companyId and financialYear, don't filter by them
    const modelsWithoutCompanyFilter = ['tax', 'generalCondition', 'process'];
    const filter = modelsWithoutCompanyFilter.includes(masterDataType) ? {} : { companyId, financialYear };

    const importHistory = await Model.find(
      filter,
      { createdAt: 1, updatedAt: 1 }
    ).sort({ createdAt: -1 }).limit(50);

    res.json({
      success: true,
      data: importHistory
    });

  } catch (error) {
    console.error('Import history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch import history',
      error: error.message
    });
  }
});

module.exports = router;