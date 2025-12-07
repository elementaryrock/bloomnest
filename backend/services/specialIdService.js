const { Patient } = require('../models');

class SpecialIdService {
  /**
   * Generate Special ID in format: MEC + YEAR + 6-digit sequence
   * Example: MEC2025000001
   */
  async generateSpecialId() {
    const currentYear = new Date().getFullYear();
    const prefix = `MEC${currentYear}`;
    
    // Find the last registered patient for this year
    const lastPatient = await Patient.findOne({
      specialId: new RegExp(`^${prefix}`)
    }).sort({ specialId: -1 });
    
    let sequenceNumber = 1;
    
    if (lastPatient) {
      // Extract the sequence number from the last Special ID
      const lastSequence = parseInt(lastPatient.specialId.slice(-6));
      sequenceNumber = lastSequence + 1;
    }
    
    // Pad with zeros to 6 digits
    const paddedNumber = sequenceNumber.toString().padStart(6, '0');
    
    const specialId = `${prefix}${paddedNumber}`;
    
    // Verify uniqueness (should be unique, but double-check)
    const exists = await Patient.findOne({ specialId });
    if (exists) {
      // If somehow it exists, recursively try the next number
      console.warn(`Special ID ${specialId} already exists, generating next...`);
      return this.generateSpecialId();
    }
    
    return specialId;
  }

  /**
   * Validate Special ID format
   * Format: MEC + 4-digit year + 6-digit sequence
   */
  validateSpecialIdFormat(specialId) {
    const pattern = /^MEC\d{10}$/;
    return pattern.test(specialId);
  }

  /**
   * Extract year from Special ID
   */
  extractYear(specialId) {
    if (!this.validateSpecialIdFormat(specialId)) {
      throw new Error('Invalid Special ID format');
    }
    return parseInt(specialId.substring(3, 7));
  }

  /**
   * Extract sequence number from Special ID
   */
  extractSequence(specialId) {
    if (!this.validateSpecialIdFormat(specialId)) {
      throw new Error('Invalid Special ID format');
    }
    return parseInt(specialId.substring(7));
  }

  /**
   * Check if Special ID exists
   */
  async exists(specialId) {
    const patient = await Patient.findOne({ specialId });
    return !!patient;
  }
}

module.exports = new SpecialIdService();
