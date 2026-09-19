const app = require('./app');
const connectDB = require('./config/db');
const env = require('./config/env');

const start = async () => {
  try {
    await connectDB();
    app.listen(env.port, () => {
      console.log(`Server running on port ${env.port}`);
    });
  } catch (err) {
    console.error('Failed to start server', err);
    process.exit(1);
  }
};

start();
