// Central export file for all models
module.exports = {
  Patient: require('./Patient'),
  Staff: require('./Staff'),
  Therapist: require('./Therapist'),
  Booking: require('./Booking'),
  Session: require('./Session'),
  Assessment: require('./Assessment'),
  OTP: require('./OTP'),
  Notification: require('./Notification'),
  Report: require('./Report'),
  SystemSettings: require('./SystemSettings')
};
