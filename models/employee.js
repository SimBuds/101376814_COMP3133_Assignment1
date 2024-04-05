const mongoose = require('mongoose');

const EmployeeSchema = new mongoose.Schema({
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  gender: { type: String, required: true },
  salary: { type: Number, required: true },
});

module.exports = mongoose.model('Employee', EmployeeSchema);