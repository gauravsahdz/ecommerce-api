import Faq from '../models/Faq.js';

// Get all FAQs
export const getAllFaqs = async (req, res) => {
  try {
    const faqs = await Faq.find();
    res.status(200).json(faqs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single FAQ by ID
export const getFaqById = async (req, res) => {
  try {
    const faq = await Faq.findById(req.params.id);
    if (!faq) {
      return res.status(404).json({ message: 'FAQ not found' });
    }
    res.status(200).json(faq);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new FAQ
export const createFaq = async (req, res) => {
  const faq = new Faq({
    question: req.body.question,
    answer: req.body.answer,
    category: req.body.category,
    isActive: req.body.isActive,
    order: req.body.order,
  });

  try {
    const newFaq = await faq.save();
    res.status(201).json(newFaq);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update an FAQ by ID
export const updateFaq = async (req, res) => {
  try {
    const faq = await Faq.findById(req.params.id);
    if (!faq) {
      return res.status(404).json({ message: 'FAQ not found' });
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
    res.status(200).json(updatedFaq);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete an FAQ by ID
export const deleteFaq = async (req, res) => {
  try {
    const faq = await Faq.findById(req.params.id);
    if (!faq) {
      return res.status(404).json({ message: 'FAQ not found' });
    }

    await faq.remove();
    res.status(200).json({ message: 'FAQ deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};