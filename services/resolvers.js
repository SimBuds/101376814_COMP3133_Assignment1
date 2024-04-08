require('dotenv').config();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { UserInputError } = require('apollo-server');

const User = require('../models/user');
const Employee = require('../models/employee');

module.exports = {
  Query: {
    // Login
    async login(_, { username, password }) {
      try {
        const user = await User.findOne({ $or: [{ username }, { email: username }] });

        if (!user) {
          throw new UserInputError('User not found');
        }

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
          throw new UserInputError('Wrong credentials');
        }

        const token = jwt.sign(
          {
            id: user._id,
            username: user.username,
            email: user.email
          },
          process.env.SECRET_KEY,
          { expiresIn: '2h' }
        );

        return {
          ...user._doc,
          id: user._id
        };

      } catch (err) {
        throw new Error(err);
      }
    },

    // Get Employees
    async getAllEmployees() {
      try {
        const employees = await Employee.find();
        return employees;
      } catch (err) {
        throw new Error(err);
      }
    },

    // Serach Employee ID
    async searchEmployeeById(_, { _id }) {
      try {
        const employee = await Employee.findById(_id);
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

    // Signup
    async signup(_, { username, email, password }) {
      try {
        const user = await User.findOne({ username });
        if (user) {
          throw new UserInputError('Username is taken');
        }
    
        password = await bcrypt.hash(password, 12);
    
        const newUser = new User({
          email,
          username,
          password,
          createdAt: new Date().toISOString()
        });
      
        const res = await newUser.save();
      
        return res._doc;
      } catch (err) {
        throw new Error(err);
      }
    },

    // Add Employee
    async addNewEmployee(_, { first_name, last_name, email, gender, salary }) {
      try {
        const existingEmployee = await Employee.findOne({ email });
        if (existingEmployee) {
          throw new UserInputError('Employee with this email already exists');
        }

        const newEmployee = new Employee({
          first_name,
          last_name,
          email,
          gender,
          salary
        });

        const employee = await newEmployee.save();

        return employee;
      } catch (err) {
        throw new Error(err);
      }
    },

    // Update Employee
    async updateEmployeeById(_, { _id, first_name, last_name, email, gender, salary }) {
      try {
        const employee = await Employee.findById(_id);
        if (!employee) {
          throw new UserInputError('Employee not found');
        }

        if (email && email !== employee.email) {
          const emailExists = await Employee.findOne({ email });
          if (emailExists) {
            throw new UserInputError('Email is already in use');
          }
        }

        const updatedEmployee = await Employee.findByIdAndUpdate(_id, { first_name, last_name, email, gender, salary }, { new: true });

        return updatedEmployee;
      } catch (err) {
        throw new Error(err);
      }
    },

    // Delete Employee By ID
    async deleteEmployeeById(_, { _id }) {
      try {
        const employee = await Employee.findByIdAndDelete(_id);
        if (!employee) {
          throw new UserInputError('Employee not found');
        }
        return employee;
      } catch (err) {
        throw new Error(err);
      }
    },
  }
};
