import AppSettings from '../models/AppSettings.mo.js';
import { responseHandler, asyncHandler, ApiError } from '../utils/responseHandler.ut.js';
import crypto from 'crypto';

const DEFAULT_APP_SETTINGS = {
  storeName: 'Store Admin X',
  defaultStoreEmail: 'contact@example.com',
  maintenanceMode: false,
  darkMode: false,
  themeAccentColor: 'var(--accent)',
  storeLogoUrl: '',
  notifications: {
    newOrderEmails: true,
    lowStockAlerts: true,
    productUpdatesNewsletter: false,
  },
  apiSettings: {},
};

async function getOrCreateSettings() {
  let settings = await AppSettings.findOne();
  if (!settings) {
    settings = new AppSettings(DEFAULT_APP_SETTINGS);
    await settings.save();
  }
  return settings;
}

// Get app settings with filters
export const getAppSettings = asyncHandler(async (req, res) => {
  const { 
    key,
    category,
    isPublic,
    page = 1,
    limit = 50,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query;

  // Build filter
  const filter = {};
  if (key) filter.key = { $regex: key, $options: 'i' };
  if (category) filter.category = category;
  if (isPublic !== undefined) filter.isPublic = isPublic === 'true';

  // Calculate pagination
  const skip = (Number(page) - 1) * Number(limit);
  const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

  // Get total count
  const total = await AppSettings.countDocuments(filter);

  // Get paginated results
  const settings = await AppSettings.find(filter)
    .sort(sort)
    .skip(skip)
    .limit(Number(limit))
    .lean(); // Use lean() to get plain JavaScript objects

  // Calculate metadata
  const totalPages = Math.ceil(total / Number(limit));
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  return responseHandler.list(res, {
    data: { settings: settings.map(setting => ({ ...setting, id: setting._id.toString() })) },
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
        key,
        category,
        isPublic
      }
    },
    sort: {
      by: sortBy,
      order: sortOrder
    }
  });
});

// Create a new app setting
export const createAppSetting = asyncHandler(async (req, res) => {
  const { key, value, description, isPublic, category } = req.body;

  // Check if setting with key already exists
  const existingSetting = await AppSettings.findOne({ key });
  if (existingSetting) {
    throw new ApiError(400, 'Setting with this key already exists');
  }

  const setting = new AppSettings({
    key,
    value,
    description,
    isPublic,
    category
  });

  const savedSetting = await setting.save();

  return responseHandler.success(res, {
    statusCode: 201,
    message: 'App setting created successfully',
    data: { setting: savedSetting },
    meta: { id: savedSetting._id }
  });
});

// Update an app setting
export const updateAppSetting = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!id) {
    throw new ApiError(400, 'Setting id is required');
  }

  const updates = req.body;
  const updatedSetting = await AppSettings.findByIdAndUpdate(
    id,
    updates,
    { new: true }
  );

  if (!updatedSetting) {
    throw new ApiError(404, 'App setting not found');
  }

  return responseHandler.success(res, {
    message: 'App setting updated successfully',
    data: { setting: updatedSetting },
    meta: { id: updatedSetting._id }
  });
});

// Delete an app setting
export const deleteAppSetting = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!id) {
    throw new ApiError(400, 'Setting id is required');
  }

  const deletedSetting = await AppSettings.findByIdAndDelete(id);
  if (!deletedSetting) {
    throw new ApiError(404, 'App setting not found');
  }

  return responseHandler.success(res, {
    message: 'App setting deleted successfully',
    meta: { id: deletedSetting._id }
  });
});

// Update app settings
export const updateAppSettings = asyncHandler(async (req, res) => {
  const body = req.body;
  const settings = await getOrCreateSettings();

  // Update fields if provided
  if (body.storeName !== undefined) settings.storeName = body.storeName;
  if (body.defaultStoreEmail !== undefined) settings.defaultStoreEmail = body.defaultStoreEmail;
  if (typeof body.maintenanceMode === 'boolean') settings.maintenanceMode = body.maintenanceMode;
  if (typeof body.darkMode === 'boolean') settings.darkMode = body.darkMode;
  if (body.themeAccentColor !== undefined) settings.themeAccentColor = body.themeAccentColor;
  if (body.storeLogoUrl !== undefined) settings.storeLogoUrl = body.storeLogoUrl;

  // Update nested objects if provided
  if (body.notifications) {
    settings.notifications = {
      ...settings.notifications,
      ...body.notifications,
    };
  }

  if (body.apiSettings) {
    settings.apiSettings = {
      ...(settings.apiSettings || {}),
      ...body.apiSettings,
    };
  }

  const updatedSettings = await settings.save();

  return responseHandler.success(res, {
    message: 'App settings updated successfully',
    data: { 
      settings: {
        ...updatedSettings.toObject(),
        id: updatedSettings._id.toString()
      }
    },
    meta: { id: updatedSettings._id }
  });
});

// Generate and save API key
export const generateApiKey = asyncHandler(async (req, res) => {
  const settings = await getOrCreateSettings();
  const apiKey = crypto.randomBytes(32).toString('hex');
  settings.apiSettings = {
    ...settings.apiSettings,
    apiKey,
    apiKeyLastGenerated: new Date(),
  };
  settings.value = { apiSettings: settings.apiSettings };
  await settings.save();

  return responseHandler.success(res, {
    message: 'API key generated successfully',
    data: { apiKey },
  });
}); 