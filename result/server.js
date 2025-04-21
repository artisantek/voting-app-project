const express = require('express');
const path = require('path');
const { Pool } = require('pg'); // PostgreSQL client
require('dotenv').config(); // Load .env file for local development

const app = express();
const port = process.env.PORT || 80; // Use port 80 inside container, configurable via env

// --- Database Configuration ---
const pool = new Pool({
    user: process.env.POSTGRES_USER || 'user',
    host: process.env.POSTGRES_HOST || 'db', // Docker service name
    database: process.env.POSTGRES_DB || 'voting_db',
    password: process.env.POSTGRES_PASSWORD || 'password',
    port: 5432, // Default PostgreSQL port
});

pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1); // Exit if the pool encounters a critical error
});

pool.connect()
    .then(client => {
        console.log('Connected to PostgreSQL database');
        client.release(); // Release the client back to the pool
    })
    .catch(err => {
        console.error('Failed to connect to PostgreSQL database:', err.stack);
        // Optional: exit if DB connection is critical at startup
        // process.exit(1);
    });

// --- Middleware ---
// Set EJS as the templating engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files (CSS, client-side JS) from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// --- Routes ---

// Route to render the main results page
app.get('/', (req, res) => {
    // Just render the structure, data will be fetched by client-side JS
    res.render('index');
});

// API route to provide results data as JSON
app.get('/results', async (req, res) => {
    try {
        const queryResult = await pool.query(
            'SELECT vote, COUNT(voter_id) as count FROM votes GROUP BY vote'
        );

        let results = {
            cats: { count: 0, percentage: 0 },
            dogs: { count: 0, percentage: 0 },
            total: 0
        };

        // Process query results
        queryResult.rows.forEach(row => {
            const voteOption = row.vote.toLowerCase(); // 'Cats' -> 'cats'
            const count = parseInt(row.count, 10); // Ensure count is a number

            if (results.hasOwnProperty(voteOption)) {
                results[voteOption].count = count;
            }
        });

        results.total = results.cats.count + results.dogs.count;

        // Calculate percentages, handle division by zero
        if (results.total > 0) {
            results.cats.percentage = (results.cats.count / results.total) * 100;
            results.dogs.percentage = (results.dogs.count / results.total) * 100;
        } else {
            // If total is 0, percentages are 0 (or could be 50/50 for display)
            // Let's return 0 for calculation, UI can handle display logic
             results.cats.percentage = 0;
             results.dogs.percentage = 0;
        }

        console.log("Sending results data:", results); // Log what's being sent
        res.json(results);

    } catch (err) {
        console.error('Error querying database:', err.stack);
        res.status(500).json({ error: 'Failed to retrieve results from database.' });
    }
});

// --- Start Server ---
app.listen(port, '0.0.0.0', () => {
    console.log(`Results frontend listening on port ${port}`);
});