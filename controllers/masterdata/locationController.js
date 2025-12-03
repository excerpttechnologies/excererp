const Location = require('../../models/masterdata/location');

// Create a new location (POST)
exports.createLocation = async (req, res) => {
    try {
        const location = new Location(req.body);
        await location.save();
        res.status(201).json(location);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Update an existing location (PATCH)
exports.updateLocation = async (req, res) => {
    try {
        const location = await Location.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!location) {
            return res.status(404).json({ error: 'Location not found' });
        }
        res.json(location);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.getAllLocations = async (req, res) => {
    try {
         const { companyId} = req.query;

    const filter = {};
    if (companyId) filter.companyId = companyId;
    //if (financialYear) filter.financialYear = financialYear;

        const locations = await Location.find(filter).sort({ createdAt: -1 });
        res.json(locations);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.getLocationById = async (req, res) => {
    try {
        const location = await Location.findById(req.params.id);
        if (!location) {
            return res.status(404).json({ error: 'Location not found' });
        }
        res.json(location);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};