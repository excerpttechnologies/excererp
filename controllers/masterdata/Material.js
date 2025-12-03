const Material = require('../../models/masterdata/Material');
const MaterialCategory = require('../../models/categories/MaterialCategory');

exports.generateMaterialId = async (req, res) => {
  try {
    const { categoryId } = req.body;
    const category = await MaterialCategory.findById(categoryId);
    if (!category) return res.status(404).json({ message: 'Category not found' });

    const materialCount = await Material.countDocuments({ categoryId });
    const nextNumber = category.rangeStart + materialCount;

    const materialId = nextNumber;
    res.json({ materialId });
  } catch (err) {
    res.status(500).json({ error: 'Error generating material ID' });
  }
};

// Save material with both internal and external ID support
exports.createMaterial = async (req, res) => {
  try {
    const { materialId, materialIdType, ...materialData } = req.body;
    console.log("material body", req.body)
    // Check if material ID already exists
    // const existingMaterial = await Material.findOne({ materialId });
    // if (existingMaterial) {
    //   return res.status(400).json({ error: 'Material ID already exists' });
    // }

    // Validation for external material ID
    if (materialIdType === 'external') {
      if (!materialId || materialId.trim() === '') {
        return res.status(400).json({ error: 'External Material ID is required' });
      }

      if (materialId.length > 50) {
        return res.status(400).json({ error: 'External Material ID cannot exceed 50 characters' });
      }

      // Optional: Add validation for special characters or format
      const validIdPattern = /^[A-Za-z0-9_-]+$/;
      if (!validIdPattern.test(materialId)) {
        return res.status(400).json({ error: 'Material ID can only contain letters, numbers, hyphens, and underscores' });
      }
    }

    // Create material with the provided data
    const material = new Material({
      ...materialData,
      materialId,
      materialIdType: materialIdType || 'internal',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await material.save();
    res.status(201).json({ message: 'Material saved successfully', material });
  } catch (err) {
    console.error('Error saving material:', err);
    res.status(500).json({ error: 'Error saving material' });
  }
};

exports.getAllMaterials = async (req, res) => {
  try {
     const { companyId} = req.query;

    const filter = {};
     if (companyId) filter.companyId = companyId;
    // if (financialYear) filter.financialYear = financialYear;

    const materials = await Material.find(filter)
      .populate('categoryId', 'categoryName prefix');
    console.log(materials);
    res.json(materials);
  } catch (err) {
    console.error('Error fetching materials:', err);
    res.status(500).json({ error: 'Failed to fetch materials' });
  }
};

// Get material by ID
exports.getMaterialById = async (req, res) => {
  try {
    const material = await Material.findById(req.params.id).populate('categoryId', 'categoryName prefix');
    if (!material) {
      return res.status(404).json({ error: 'Material not found' });
    }
    res.json(material);
  } catch (err) {
    console.error('Error fetching material:', err);
    res.status(500).json({ error: 'Failed to fetch material' });
  }
};

// Update material
exports.updateMaterial = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Material.findByIdAndUpdate(id, req.body, { new: true });

    if (!updated) {
      return res.status(404).json({ error: 'Material not found' });
    }

    res.json({ message: 'Material updated', material: updated });
  } catch (err) {
    console.error('Error updating material:', err);
    res.status(500).json({ error: 'Failed to update material' });
  }
};
// Get material by materialId (not _id)
exports.getMaterialByMaterialId = async (req, res) => {
  try {
    console.log('Fetching material by materialId:', req.params.materialId);
    const material = await Material.findOne({ materialId: req.params.materialId })


    if (!material) {
      return res.status(404).json({ error: 'Material not found' });
    }

    res.json(material);
    console.log('Material fetched successfully:', material);
  } catch (err) {
    console.error('Error fetching material by materialId:', err);
    res.status(500).json({ error: 'Failed to fetch material by ID' });
  }
};
