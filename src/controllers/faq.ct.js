import FAQ from '../models/FAQ.mo.js';
import mongoose from 'mongoose';
import { responseHandler, asyncHandler, ApiError } from '../utils/responseHandler.ut.js';

// Get FAQs with filters or a single FAQ by ID
export const getFAQs = asyncHandler(async (req, res) => {
  const { 
    id, 
    question,
    category,
    page = 1,
    limit = 10,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query;

  // If ID is provided, return single FAQ
  if (id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError(400, 'Invalid FAQ ID');
    }

    const faq = await FAQ.findById(id);
    if (!faq) {
      throw new ApiError(404, 'FAQ not found');
    }

    return responseHandler.success(res, {
      data: { faq }
    });
  }

  // Build filter for list operation
  const filter = {};
  if (question) filter.question = { $regex: question, $options: 'i' };
  if (category) filter.category = { $regex: category, $options: 'i' };

  // Calculate pagination
  const skip = (Number(page) - 1) * Number(limit);
  const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

  // Get total count
  const total = await FAQ.countDocuments(filter);

  // Get paginated results
  const faqs = await FAQ.find(filter)
    .sort(sort)
    .skip(skip)
    .limit(Number(limit));

  // Calculate metadata
  const totalPages = Math.ceil(total / Number(limit));
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  return responseHandler.list(res, {
    data: { faqs },
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages,
      hasNextPage,
      hasPrevPage
    },
    filters: {
      applied: Object.keys(filter).length > 0 ? filter : null,
      available: {
        id,
        question,
        category
      }
    },
    sort: {
      by: sortBy,
      order: sortOrder
    }
  });
});

// Create a new FAQ
export const createFAQ = asyncHandler(async (req, res) => {
  const { question, answer, category } = req.body;

  const newFAQ = new FAQ({
    question,
    answer,
    category
  });

  const savedFAQ = await newFAQ.save();
  
  return responseHandler.success(res, {
    statusCode: 201,
    message: 'FAQ created successfully',
    data: { faq: savedFAQ },
    meta: { id: savedFAQ._id }
  });
});

// Update a FAQ
export const updateFAQ = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    throw new ApiError(400, 'Invalid FAQ ID');
  }

  const updatedFAQ = await FAQ.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  if (!updatedFAQ) {
    throw new ApiError(404, 'FAQ not found');
  }

  return responseHandler.success(res, {
    message: 'FAQ updated successfully',
    data: { faq: updatedFAQ },
    meta: { id: updatedFAQ._id }
  });
});

// Delete a FAQ
export const deleteFAQ = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    throw new ApiError(400, 'Invalid FAQ ID');
  }

  const deletedFAQ = await FAQ.findByIdAndDelete(req.params.id);
  if (!deletedFAQ) {
    throw new ApiError(404, 'FAQ not found');
  }

  return responseHandler.success(res, {
    message: 'FAQ deleted successfully',
    meta: { id: deletedFAQ._id }
  });
});