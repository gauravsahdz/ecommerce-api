import express from 'express';
import connectDB from './src/config/db.js';
import cors from 'cors';
import categoryRoutes from './src/routes/category.rt.js';
import customerRoutes from './src/routes/customer.rt.js';
// Import auth routes and middleware
import authRoutes from './src/routes/auth.rt.js';
import faqRoutes from './src/routes/faq.rt.js';
import inventoryItemRoutes from './src/routes/inventoryItem.rt.js';
import orderRoutes from './src/routes/order.rt.js';
import productRoutes from './src/routes/product.rt.js';
import userRoutes from './src/routes/user.rt.js';
import activityLogRoutes from './src/routes/activityLog.rt.js';
import appSettingsRoutes from './src/routes/appSettings.rt.js';
import discountCodeRoutes from './src/routes/discountCode.rt.js';
import requestLogger from './src/middleware/requestLogger.mw.js';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';
import { globalErrorHandler } from './src/utils/responseHandler.ut.js';
import { configDotenv } from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

configDotenv();

const app = express();

// Swagger setup (YAML)
const swaggerDocument = YAML.load('./src/docs/swagger.yaml');

// Connect to database
connectDB();

// Middleware
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Enable CORS for all origins
app.use(cors());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// Serve the raw swagger.yaml file
app.get('/api-docs/swagger.yaml', (req, res) => {
  res.sendFile(path.resolve('./src/docs/swagger.yaml'));
});

// Request Logger Middleware
app.use(requestLogger);

// Auth Routes (should be before auth middleware)
app.use('/api/auth', authRoutes);

// Basic Route
app.get('/', (req, res) => res.send('E-commerce Backend API'));

// API Routes
app.use('/api/categories', categoryRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/faqs', faqRoutes);
app.use('/api/inventory', inventoryItemRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/activity-logs', activityLogRoutes);
app.use('/api/app-settings', appSettingsRoutes);
app.use('/api/discount-codes', discountCodeRoutes);

// 404 Handler - Must be after all routes
app.use((req, res, next) => {
  res.status(404).json({
    type: 'ERROR',
    message: `Route ${req.originalUrl} not found`,
    meta: {
      timestamp: new Date().toISOString(),
      method: req.method,
      path: req.path
    }
  });
});

// Global Error Handler - Must be last
app.use(globalErrorHandler);

const port = parseInt(process.env.PORT) || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port} - \x1B]8;;http://localhost:${port}\x07Click here to open in browser\x1B]8;;\x07`);
  console.log(`API Documentation available at http://localhost:${port}/api-docs`);
});