const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const mongoose = require('mongoose');

// Import your typeDefs and resolvers
const typeDefs = require('./typeDefs');
const resolvers = require('./resolvers');

// Create an instance of ApolloServer
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => ({ req })
});

// Create an instance of Express
const app = express();

// Apply the Apollo GraphQL middleware to our Express application
server.applyMiddleware({ app });

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/comp3133_assigment1', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('MongoDB Connected');
    return app.listen({ port: 5000 });
  })
  .then((res) => {
    console.log(`Server running at ${res.url}`);
  })
  .catch(err => {
    console.log(err);
  });