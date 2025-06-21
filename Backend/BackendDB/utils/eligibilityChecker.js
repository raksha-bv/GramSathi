// Simple eligibility checker
export const checkEligibility = (user, scheme) => {
  const reasons = [];
  
  // Age check
  if (user.age < scheme.minAge || user.age > scheme.maxAge) {
    reasons.push(`Age must be between ${scheme.minAge} and ${scheme.maxAge}`);
  }
  
  // Gender check
  if (scheme.forGender.length && !scheme.forGender.includes("Any") && !scheme.forGender.includes(user.gender)) {
    reasons.push("Gender not eligible");
  }
  
  // Category check
  if (scheme.forCategory.length && !scheme.forCategory.includes("Any") && !scheme.forCategory.includes(user.category)) {
    reasons.push("Category not eligible");
  }
  
  // BPL check
  if (scheme.requiresBPL && !user.isBPL) {
    reasons.push("Must be Below Poverty Line");
  }
  
  // Disability check
  if (scheme.forDisabled && !user.isDisabled) {
    reasons.push("Must be disabled");
  }
  
  // Widow check
  if (scheme.forWidows && !user.isWidow) {
    reasons.push("Must be widow");
  }
  
  // Homeless check
  if (scheme.forHomeless && user.hasShelter) {
    reasons.push("Must be homeless");
  }
  
  // Occupation check
  if (scheme.forOccupation.length && !scheme.forOccupation.includes("Any") && !scheme.forOccupation.includes(user.occupation)) {
    reasons.push("Occupation not eligible");
  }
  
  return {
    isEligible: reasons.length === 0,
    reasons: reasons.length === 0 ? ["Eligible for this scheme"] : reasons
  };
};

// Get all eligible schemes for a user
export const getEligibleSchemes = async (user, allSchemes) => {
  return allSchemes.filter(scheme => {
    const eligibility = checkEligibility(user, scheme);
    return eligibility.isEligible;
  });
};