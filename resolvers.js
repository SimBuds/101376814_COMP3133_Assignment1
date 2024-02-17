const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { UserInputError } = require('apollo-server');

const User = require('../models/User');
const Employee = require('../models/Employee');

function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      username: user.username
    },
    process.env.SECRET_KEY,
    { expiresIn: '1h' }
  );
}

module.exports = {
  Query: {
    async getEmployees() {
      try {
        const employees = await Employee.find();
        return employees;
      } catch (err) {
        throw new Error(err);
      }
    },
    async getEmployee(_, { employeeId }) {
      try {
        const employee = await Employee.findById(employeeId);
        if (employee) {
          return employee;
        } else {
          throw new Error('Employee not found');
        }
      } catch (err) {
        throw new Error(err);
      }
    },
  },
  Mutation: {
    async register(_, { registerInput: { username, email, password } }) {
      const user = await User.findOne({ username });
      if (user) {
        throw new Error('Username is taken');
      }

      password = await bcrypt.hash(password, 12);

      const newUser = new User({
        email,
        username,
        password,
        createdAt: new Date().toISOString()
      });

      const res = await newUser.save();

      const token = generateToken(res);

      return {
        ...res._doc,
        id: res._id,
        token
      };
    },
    async login(_, { username, password }) {
      const user = await User.findOne({ username });
      if (!user) {
        throw new UserInputError('User not found');
      }

      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        throw new UserInputError('Wrong credentials');
      }

      const token = generateToken(user);

      return {
        ...user._doc,
        id: user._id,
        token
      };
    },
    async addEmployee(_, { employeeInput }) {
      const existingEmployee = await Employee.findOne({ email: employeeInput.email });
      if (existingEmployee) {
        throw new UserInputError('Employee with this email already exists');
      }

      const newEmployee = new Employee(employeeInput);

      const employee = await newEmployee.save();

      return employee;
    },
    async updateEmployee(_, { employeeId, updateInput }) {
      // Find the employee to update and ensure they exist
      const employee = await Employee.findById(employeeId);
      if (!employee) {
        throw new UserInputError('Employee not found');
      }

      // Check if the email is changing and if the new email is already taken
      if (updateInput.email && updateInput.email !== employee.email) {
        const emailExists = await Employee.findOne({ email: updateInput.email });
        if (emailExists) {
          throw new UserInputError('Email is already in use');
        }
      }

      const updatedEmployee = await Employee.findByIdAndUpdate(employeeId, updateInput, { new: true });

      return updatedEmployee;
    },
    async deleteEmployee(_, { employeeId }) {
      const employee = await Employee.findByIdAndDelete(employeeId);
      if (!employee) {
        throw new UserInputError('Employee not found');
      }
      return employee;
    },
  }
};