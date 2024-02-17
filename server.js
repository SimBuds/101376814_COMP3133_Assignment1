require('dotenv').config();
const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const mongoose = require('mongoose');
const resolvers = require('./resolvers');
const typeDefs = require('./schema');

// Create an instance of ApolloServer
const server = new ApolloServer({
  typeDefs,
  resolvers
});
 
// Create an instance of Express Server
const app = express();

// Start the ApolloServer and then apply the Apollo GraphQL middleware to our Express application
(async () => {
  await server.start();
  server.applyMiddleware({ app });
})().catch(error => console.error(error));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB');
}).catch(err => {
  console.error(err);
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong');
});

// Start the server
const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});