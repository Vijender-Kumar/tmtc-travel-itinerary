// Validate if string is valid date
const isValidDate = (d) => !isNaN(new Date(d).getTime());

// Date must be greater than today
const isFutureDate = (date) => {
  const d = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return d > today;
};

// startDate < endDate
const isStartBeforeEnd = (startDate, endDate) => {
  return new Date(startDate) < new Date(endDate);
};

// Validate activities array
const validateActivities = (activities) => {
  const errors = [];

  if (!Array.isArray(activities)) return ["activities must be an array"];

  activities.forEach((a, i) => {
    if (!a.time || !a.description || !a.location) {
      errors.push(`Activity at index ${i} is missing required fields`);
    }
  });

  return errors;
};

// Main validator to bind everything
const validateItineraryDates = (data) => {
  const errors = [];

  // Validate startDate
  if (!data.startDate || !isValidDate(data.startDate)) {
    errors.push("startDate is required and must be a valid date");
  }

  // Validate endDate
  if (!data.endDate || !isValidDate(data.endDate)) {
    errors.push("endDate is required and must be a valid date");
  }

  // If both dates valid, check range logic
  if (isValidDate(data.startDate) && isValidDate(data.endDate)) {
    if (!isFutureDate(data.startDate)) {
      errors.push("startDate must be in the future (not today)");
    }

    if (!isStartBeforeEnd(data.startDate, data.endDate)) {
      errors.push("startDate must be less than endDate");
    }
  }

  // Validate activities
  if (data.activities) {
    errors.push(...validateActivities(data.activities));
  }

  return errors;
};

module.exports = {
  isValidDate,
  isFutureDate,
  isStartBeforeEnd,
  validateActivities,
  validateItineraryDates
};
