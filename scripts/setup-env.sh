#!/bin/bash

# Check if .env file exists
if [ -f .env ]; then
    echo ".env file already exists. Please edit it manually or delete it to create a new one."
    exit 1
fi

# Prompt for Claude API key
echo "Please enter your Claude API key:"
read -r api_key

# Create .env file
echo "CLAUDE_API_KEY=$api_key" > .env

echo ".env file created successfully!"
echo "Make sure to never commit this file to version control." 