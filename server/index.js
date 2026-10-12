const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDB } = require('./database');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/routines', require('./routes/routines'));
app.use('/api/logs', require('./routes/logs'));
app.use('/api/journal', require('./routes/journal'));
app.use('/api/themes', require('./routes/themes'));
app.use('/api/badges', require('./routes/badges'));
app.use('/api/export', require('./routes/export'));

// Serve React build in production
const clientBuild = path.join(__dirname, '../client/dist');
app.use(express.static(clientBuild));
app.get('*', (req, res) => {
  res.sendFile(path.join(clientBuild, 'index.html'));
});

const PORT = process.env.PORT || 3001;

initDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}).catch(err => {
  console.error('Failed to init DB:', err);
  process.exit(1);
});
