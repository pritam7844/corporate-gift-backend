import app from './app.js';
import dotenv from 'dotenv';
import connectDB from './config/db.js';

dotenv.config();

connectDB().catch(err => {
  console.error('Failed to connect to DB on startup:', err.message);
});

const port = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

export default app;