const express = require('express');
const router = express.Router();
const materialController = require('../../controllers/masterdata/Material');
router.get('/byId/:materialId', materialController.getMaterialByMaterialId);
router.post('/generate-id', materialController.generateMaterialId);
router.post('/', materialController.createMaterial);
router.get('/', materialController.getAllMaterials);

router.put('/:id', materialController.updateMaterial);
router.get('/:id', materialController.getMaterialById);
router.put('/status/:id', materialController.updateMaterial);

module.exports = router;
