'use client';
import * as crublibrary from 'crublibrary';

// Initialize the library with configuration
const apiUrl = process.env.NEXT_PUBLIC_CRUD_API_URL;
const apiKey = process.env.NEXT_PUBLIC_CRUD_API_KEY;

if (!apiUrl || !apiKey) {
    throw new Error("API URL and KEY must be set in the environment variables");
}

crublibrary.config({
    apiUrl,
    apiKey
});

// Export the configured library
export default crublibrary;