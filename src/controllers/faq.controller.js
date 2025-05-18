import Faq from '../models/Faq.js';
import asyncHandler from '../middleware/asyncHandler.middleware.js';

// Get all FAQs
export const getAllFaqs = asyncHandler(async (req, res) => {
  const faqs = await Faq.find();
  res.status(200).json({
    type: 'OK',
    faqs
  });
});

// Get a single FAQ by ID
export const getFaqById = asyncHandler(async (req, res) => {
  const faq = await Faq.findById(req.params.id);
  if (!faq) {
    return res.status(404).json({
      type: 'ERROR',
      message: 'FAQ not found'
    });
  }
  res.status(200).json({
    type: 'OK',
    faq
  });
});

// Create a new FAQ
export const createFaq = asyncHandler(async (req, res) => {
  const faq = new Faq({
    question: req.body.question,
    answer: req.body.answer,
    category: req.body.category,
    isActive: req.body.isActive,
    order: req.body.order,
  });

  const newFaq = await faq.save();
  res.status(201).json({
    type: 'OK',
    message: 'FAQ created successfully'
  });
});

// Update an FAQ by ID
export const updateFaq = asyncHandler(async (req, res) => {
  const faq = await Faq.findById(req.params.id);
  if (!faq) {
    return res.status(404).json({
      type: 'ERROR',
      message: 'FAQ not found'
    });
  }

    if (req.body.question != null) {
      faq.question = req.body.question;
    }
    if (req.body.answer != null) {
      faq.answer = req.body.answer;
    }
    if (req.body.category != null) {
      faq.category = req.body.category;
    }
    if (req.body.isActive != null) {
      faq.isActive = req.body.isActive;
    }
    if (req.body.order != null) {
      faq.order = req.body.order;
    }

    const updatedFaq = await faq.save();
  res.status(200).json({
    type: 'OK',
    message: 'FAQ updated successfully'
  });
});

// Delete an FAQ by ID
export const deleteFaq = asyncHandler(async (req, res) => {
  const faq = await Faq.findById(req.params.id);
  if (!faq) {
    return res.status(404).json({
      type: 'ERROR',
      message: 'FAQ not found'
    });
  }

  await faq.remove();
  res.status(200).json({
    type: 'OK',
    message: 'FAQ deleted successfully'
  });
});