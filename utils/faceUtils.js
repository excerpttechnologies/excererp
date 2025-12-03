// Face recognition utility functions

const faceUtils = {

  // Improved Euclidean distance calculation with validation
  calculateEuclideanDistance: (descriptor1, descriptor2) => {
    if (!Array.isArray(descriptor1) || !Array.isArray(descriptor2)) {
      throw new Error("Both descriptors must be arrays");
    }
    
    if (descriptor1.length !== descriptor2.length) {
      throw new Error(`Descriptors must have the same length. Got ${descriptor1.length} and ${descriptor2.length}`);
    }
    
    if (descriptor1.length !== 128) {
      throw new Error(`Expected 128-dimensional descriptors, got ${descriptor1.length}`);
    }
    
    let sum = 0;
    for (let i = 0; i < descriptor1.length; i++) {
      const val1 = parseFloat(descriptor1[i]);
      const val2 = parseFloat(descriptor2[i]);
      
      if (isNaN(val1) || isNaN(val2)) {
        throw new Error(`Invalid numeric values at index ${i}: ${val1}, ${val2}`);
      }
      
      const diff = val1 - val2;
      sum += diff * diff;
    }
    
    return Math.sqrt(sum);
  },

  // Cosine similarity (more robust for face recognition)
  calculateCosineSimilarity: (descriptor1, descriptor2) => {
    if (!Array.isArray(descriptor1) || !Array.isArray(descriptor2)) {
      throw new Error("Both descriptors must be arrays");
    }
    
    if (descriptor1.length !== descriptor2.length) {
      throw new Error("Descriptors must have the same length");
    }
    
    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;
    
    for (let i = 0; i < descriptor1.length; i++) {
      const val1 = parseFloat(descriptor1[i]);
      const val2 = parseFloat(descriptor2[i]);
      
      if (isNaN(val1) || isNaN(val2)) {
        throw new Error(`Invalid numeric values at index ${i}`);
      }
      
      dotProduct += val1 * val2;
      norm1 += val1 * val1;
      norm2 += val2 * val2;
    }
    
    if (norm1 === 0 || norm2 === 0) {
      return 0;
    }
    
    return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
  },

  // Validate face descriptor
  validateDescriptor: (descriptor) => {
    if (!descriptor) {
      return { isValid: false, error: "Descriptor is required" };
    }
    
    if (!Array.isArray(descriptor)) {
      return { isValid: false, error: "Descriptor must be an array" };
    }
    
    if (descriptor.length !== 128) {
      return { isValid: false, error: `Descriptor must have 128 values, got ${descriptor.length}` };
    }
    
    const invalidValues = descriptor.filter(val => isNaN(parseFloat(val)));
    if (invalidValues.length > 0) {
      return { isValid: false, error: "Descriptor contains invalid numeric values" };
    }
    
    return { isValid: true };
  },

  // Convert similarity percentage from distance
  distanceToSimilarity: (distance, maxDistance = 2) => {
    return Math.max(0, (1 - distance / maxDistance) * 100);
  },

  // Constants for face recognition
  DUPLICATE_THRESHOLD: 0.6,
  HIGH_SIMILARITY_THRESHOLD: 0.4,
  DESCRIPTOR_DIMENSION: 128

};

module.exports = faceUtils;