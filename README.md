# Quetext Backend Developer Test - Text Similarity Module

This project implements a self-contained text similarity module and an Express API wrapper.

## Prerequisites

- Node.js (v14+ recommended)
- npm

## Installation

\`\`\`bash
npm install
\`\`\`

## Starting the Server

\`\`\`bash
npm start
\`\`\`

The server will start on port `5010` by default. You can override this by setting the `PORT` environment variable.

## Running Tests

\`\`\`bash
npm test
\`\`\`

This will run both the unit tests and the API tests using Jest.

## Example Usage

You can test the API using the following `curl` command:

\`\`\`bash
curl -X POST http://localhost:5010/compare \
  -H "Content-Type: application/json" \
  -d '{"source": "The quick brown fox jumps over the lazy dog", "candidate": "A quick brown dog jumps over the log"}'
\`\`\`

## Assumptions

As per the requirements, the following assumptions were made during development:
- **String Length Limits**: The API limits string inputs to 5,000 characters. The Levenshtein distance algorithm used for the exact match score has a time complexity of `O(N*M)`. Limiting the strings ensures that the Node.js event loop is not blocked by CPU-intensive calculations. If longer strings are required, it is assumed the calculation would be offloaded to a `worker_thread`.
- **Language**: It is assumed that all submitted strings will be in English. The normalization logic handles English punctuation and alphanumeric characters appropriately but may discard non-English characters.