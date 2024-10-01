const express = require('express');
const router = require('./routes/index');
const app = express();

app.use('/', router);

const port = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${port}`);
});

export default app;
