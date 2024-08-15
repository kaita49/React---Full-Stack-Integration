# index.js code that includes everything: establishing a connection to the MySQL database, creating the tenants table, inserting sample data, and setting up the GraphQL server with the necessary schema and resolvers.

require('dotenv').config();
const express = require('express');
const { ApolloServer, gql } = require('apollo-server-express');
const mysql = require('mysql2/promise');

// Create a MySQL connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: {
        rejectUnauthorized: false // Adjust SSL settings if necessary
    },
});

// Function to create the tenants table
async function createTable() {
    const connection = await pool.getConnection();
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS tenants (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            email VARCHAR(100) NOT NULL,
            phone VARCHAR(15),
            houseno VARCHAR(10)
        );
    `;
    
    try {
        await connection.query(createTableQuery);
        console.log('✅ Tenants table created successfully!');
    } catch (error) {
        console.error('❌ Error creating tenants table:', error.message);
    } finally {
        connection.release();
    }
}

// Function to insert sample data into the tenants table
async function insertSampleData() {
    const connection = await pool.getConnection();
    const sampleData = [
        { name: 'John Doe', email: 'john@example.com', phone: '(123) 456-7890', houseno: '001' },
        { name: 'Jane Smith', email: 'jane@example.com', phone: '(234) 567-8901', houseno: '002' },
        { name: 'Alice Johnson', email: 'alice@example.com', phone: '(345) 678-9012', houseno: '003' },
        { name: 'Bob Brown', email: 'bob@example.com', phone: '(456) 789-0123', houseno: '004' },
        { name: 'Charlie Davis', email: 'charlie@example.com', phone: '(567) 890-1234', houseno: '005' },
        { name: 'Diana Evans', email: 'diana@example.com', phone: '(678) 901-2345', houseno: '006' },
        { name: 'Edward Green', email: 'edward@example.com', phone: '(789) 012-3456', houseno: '007' },
        { name: 'Fiona White', email: 'fiona@example.com', phone: '(890) 123-4567', houseno: '008' },
        { name: 'George Black', email: 'george@example.com', phone: '(901) 234-5678', houseno: '009' },
        { name: 'Hannah Blue', email: 'hannah@example.com', phone: '(012) 345-6789', houseno: '010' },
        { name: 'Ian Red', email: 'ian@example.com', phone: '(123) 456-7891', houseno: '011' },
    ];

    try {
        for (const tenant of sampleData) {
            const { name, email, phone, houseno } = tenant;
            const insertQuery = 'INSERT INTO tenants (name, email, phone, houseno) VALUES (?, ?, ?, ?)';
            await connection.query(insertQuery, [name, email, phone, houseno]);
        }
        console.log('✅ Sample data inserted successfully!');
    } catch (error) {
        console.error('❌ Error inserting sample data:', error.message);
    } finally {
        connection.release();
    }
}

// Test the database connection
async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Database connection successful!');
        connection.release();
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
    }
}

// Define the GraphQL schema
const typeDefs = gql`
    type Tenant {
        id: ID!
        name: String!
        email: String!
        phone: String
        houseno: String
    }

    type Query {
        tenants: [Tenant]
    }
`;

// Define the resolvers
const resolvers = {
    Query: {
        tenants: async () => {
            const connection = await pool.getConnection();
            const [rows] = await connection.query('SELECT * FROM tenants');
            connection.release();
            return rows;
        },
    },
};

// Create an Express application
const app = express();

// Create an Apollo Server instance
const server = new ApolloServer({ typeDefs, resolvers });

// Apply the Apollo GraphQL middleware to the Express application
server.start().then(() => {
    server.applyMiddleware({ app });

    // Start the server
    app.listen({ port: 4000 }, () =>
        console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`)
    );
});

// Call the functions to create the table, test the connection, and insert sample data
(async () => {
    await testConnection();
    await createTable();
    await insertSampleData();
})();


----------------------------------------------------------------------------------------------------------------------------------------
-Go to your React frontend project directory

-In your React project, create a new file named ApolloProvider.js in the src directory. This file will set up the Apollo Client.

// src/ApolloProvider.js
import React from 'react';
import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client';

const client = new ApolloClient({
    uri: 'http://localhost:4000/graphql', // Your GraphQL API endpoint
    cache: new InMemoryCache(),
});

const ApolloProviderComponent = ({ children }) => {
    return <ApolloProvider client={client}>{children}</ApolloProvider>;
};

export default ApolloProviderComponent;

