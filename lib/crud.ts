'use client';
import * as crublibrary from 'crublibrary';

// Initialize the library with configuration
const apiUrl = "https://filepoint-backend.onrender.com";
const apiKey = "df92af88aa6f6e8468005ac6c9e9dcd3";

if (!apiUrl || !apiKey) {
    throw new Error("API URL and KEY must be set in the environment variables");
}

crublibrary.config({
    apiUrl,
    apiKey
});

// Export the configured library
export default crublibrary;