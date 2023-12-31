const app = require('./app');
const db = require('./db');
const { serverPort } = require('./config');

(async () => {
  try {
    await db.connect();
    console.log('Database connection successful');
    app.listen(serverPort, async () => {
      console.log(`Server running. Use the API on port: ${serverPort}`);
    });
  } catch (error) {
    console.error('Database connection failed', error);
    process.exit(1);
  }
})();
