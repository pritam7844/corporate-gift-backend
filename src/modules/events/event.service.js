import Event from './event.model.js';

export const createEvent = async (eventData) => {
  // Ensure we can handle an array of products passed from the frontend modal
  return await Event.create(eventData);
};

export const addProductsToEvent = async (eventId, productIds) => {
  return await Event.findByIdAndUpdate(
    eventId,
    { $addToSet: { products: { $each: productIds } } },
    { new: true }
  ).populate('products');
};

export const getEventsByCompany = async (companyId) => {
  // Employees only see active events explicitly assigned to their companyId.
  // Global events (isGlobal: true) are treated as templates and are hidden here.
  return await Event.find({
    companyId,
    status: 'active'
  }).populate('products');
};

// UPDATED: Accept a filter object
export const getAllEvents = async (filter = {}) => {
  return await Event.find(filter)
    .populate('companyId', 'name subdomain')
    .populate('products')
    .sort({ createdAt: -1 });
};

export const getEventById = async (id) => {
  const event = await Event.findById(id)
    .populate('companyId', 'name subdomain')
    .populate('products');
  if (!event) throw new Error('Event not found');
  return event;
};