import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { checkDbConnection } from './database/db';
import { errorHandler } from './middleware/errorHandler';

import authRoutes from './routes/auth';
import profileRoutes from './routes/profile';
import configRoutes from './routes/config';
import doctorRoutes from './routes/doctors';
import serviceRoutes from './routes/services';
import bookingRoutes from './routes/bookings';
import prescriptionRoutes from './routes/prescriptions';
import reminderRoutes from './routes/reminders';
import adminRoutes from './routes/admin';
import pharmacyRoutes from './routes/pharmacy';

dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Health Check Endpoint
app.get('/api/health', async (req, res) => {
  const dbStatus = await checkDbConnection();
  res.json({
    status: 'online',
    app: 'Tapza Care API',
    database_connected: dbStatus,
    timestamp: new Date().toISOString(),
  });
});

// API Routes Mount
app.use('/api/auth', authRoutes);
app.use('/api', profileRoutes);
app.use('/api', configRoutes);
app.use('/api', doctorRoutes);
app.use('/api', serviceRoutes);
app.use('/api', bookingRoutes);
app.use('/api', prescriptionRoutes);
app.use('/api', reminderRoutes);
app.use('/api', adminRoutes);
app.use('/api', pharmacyRoutes);

// Error Handling Middleware
app.use(errorHandler);

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`\n🚀 Tapza Care API Server running at http://localhost:${PORT}`);
    console.log(`🏥 Health endpoint: http://localhost:${PORT}/api/health\n`);
  });
}

export default app;
