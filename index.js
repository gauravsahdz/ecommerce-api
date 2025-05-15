import express from 'express';
import connectDB from './src/config/db.js';
import cors from 'cors';
import categoryRoutes from './src/routes/category.routes.js';
import customerRoutes from './src/routes/customer.routes.js';
// Import auth routes and middleware
import authRoutes from './src/routes/auth.routes.js';
import faqRoutes from './src/routes/faq.routes.js';
import inventoryItemRoutes from './src/routes/inventoryItem.routes.js';
import orderRoutes from './src/routes/order.routes.js';
import productRoutes from './src/routes/product.routes.js';
import userRoutes from './src/routes/user.routes.js';
import requestLogger from './src/middleware/requestLogger.middleware.js';

const app = express();

// Connect to database
connectDB();

// Middleware
app.use(express.json()); // Parse JSON request bodies

// Enable CORS for all origins
app.use(cors());

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

// Apply auth middleware to protected routes (all except auth)
// You'll need to create and import your auth middleware
// app.use(authMiddleware); 

// Basic Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

const port = parseInt(process.env.PORT) || 3000;
app.listen(port, () => {
  console.log(`listening on port ${port} - \x1B]8;;http://localhost:${port}\x07Click here to open in browser\x1B]8;;\x07`);
});