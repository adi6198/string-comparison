const express = require('express');
const TextMatcher = require('./TextMatcher');

const app = express();
app.use(express.json({ limit: '100kb' }));

app.post('/compare', (req, res) => {
  const { source, candidate } = req.body;
  
  if (source === undefined || candidate === undefined) {
    return res.status(400).json({ error: 'Missing source or candidate fields' });
  }

  if (typeof source !== 'string' || typeof candidate !== 'string') {
    return res.status(400).json({ error: 'Source and candidate must be strings' });
  }

  if (source.length > 5000 || candidate.length > 5000) {
    return res.status(400).json({ error: 'Strings must not exceed 5000 characters' });
  }

  try {
    const matcher = new TextMatcher();
    const result = matcher.compare(source, candidate);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 5010;

// Start server only if this file is run directly
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

module.exports = app;
