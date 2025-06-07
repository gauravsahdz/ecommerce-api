import BlogPost from '../models/BlogPost.mo.js';
import mongoose from 'mongoose';
import { responseHandler, asyncHandler, ApiError } from '../utils/responseHandler.ut.js';

// Get all blog posts with filters
export const getBlogs = asyncHandler(async (req, res) => {
  const { 
    id, 
    title, 
    author, 
    slug, 
    tags,
    page = 1,
    limit = 10,
    sortBy = 'publishedAt',
    sortOrder = 'desc'
  } = req.query;

  // Build filter
  const filter = {};
  if (id && mongoose.Types.ObjectId.isValid(id)) filter._id = id;
  if (title) filter.title = { $regex: title, $options: 'i' };
  if (author && mongoose.Types.ObjectId.isValid(author)) filter.author = author;
  if (slug) filter.slug = slug;
  if (tags) filter.tags = { $in: Array.isArray(tags) ? tags : [tags] };

  // Calculate pagination
  const skip = (Number(page) - 1) * Number(limit);
  const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

  // Get total count
  const total = await BlogPost.countDocuments(filter);

  // Get paginated results
  const blogPosts = await BlogPost.find(filter)
    .populate('author')
    .sort(sort)
    .skip(skip)
    .limit(Number(limit));

  // Calculate metadata
  const totalPages = Math.ceil(total / Number(limit));
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  return responseHandler.list(res, {
    data: { blogPosts },
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
        title,
        author,
        slug,
        tags
      }
    },
    sort: {
      by: sortBy,
      order: sortOrder
    }
  });
});

// Create a new blog post
export const createBlogPost = asyncHandler(async (req, res) => {
  const { title, content, author, publishedAt, slug, tags, imageUrl } = req.body;

  if (author && !mongoose.Types.ObjectId.isValid(author)) {
    throw new ApiError(400, 'Invalid author ID');
  }

  const blogPost = new BlogPost({
    title,
    content,
    author: author ? new mongoose.Types.ObjectId(author) : undefined,
    publishedAt: publishedAt ? new Date(publishedAt) : new Date(),
    slug,
    tags,
    imageUrl
  });

  const savedBlogPost = await blogPost.save();
  
  return responseHandler.success(res, {
    statusCode: 201,
    message: 'Blog post created successfully',
    data: { blogPost: savedBlogPost },
    meta: { id: savedBlogPost._id }
  });
});

// Update a blog post
export const updateBlogPost = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    throw new ApiError(400, 'Invalid blog post ID');
  }

  const updates = req.body;
  if (updates.author && !mongoose.Types.ObjectId.isValid(updates.author)) {
    throw new ApiError(400, 'Invalid author ID');
  }

  if (updates.author) {
    updates.author = new mongoose.Types.ObjectId(updates.author);
  }

  if (updates.publishedAt) {
    updates.publishedAt = new Date(updates.publishedAt);
  }

  const updatedBlogPost = await BlogPost.findByIdAndUpdate(
    req.params.id,
    updates,
    { new: true }
  ).populate('author');

  if (!updatedBlogPost) {
    throw new ApiError(404, 'Blog post not found');
  }

  return responseHandler.success(res, {
    message: 'Blog post updated successfully',
    data: { blogPost: updatedBlogPost },
    meta: { id: updatedBlogPost._id }
  });
});

// Delete a blog post
export const deleteBlogPost = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    throw new ApiError(400, 'Invalid blog post ID');
  }

  const deletedBlogPost = await BlogPost.findByIdAndDelete(req.params.id);
  if (!deletedBlogPost) {
    throw new ApiError(404, 'Blog post not found');
  }

  return responseHandler.success(res, {
    message: 'Blog post deleted successfully',
    meta: { id: deletedBlogPost._id }
  });
}); 