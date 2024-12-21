import express from 'express';
import Service from '../models/Service.js'; // Assuming you have a Service model

const router = express.Router();

// Get all services
router.get('/', async (req, res) => {
  try {
    const services = await Service.find(); // Assuming you have a Service model with a 'name' field
    res.json(services);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching services' });
  }
});

export default router; // Export the router as the default export
