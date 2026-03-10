import Event from './event.model.js';

export const createEvent = async (eventData) => {
  // Ensure we can handle an array of products passed from the frontend modal
  return await Event.create(eventData);
};

export const addProductsToEvent = async (eventId, productIds) => {
  return await Event.findByIdAndUpdate(
    eventId,
    { $set: { products: productIds } },
    { new: true }
  ).populate('products');
};

export const getEventsByCompany = async (companyId) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // normalize to start of day

  // Return only events that are within today's date window
  // startDate <= today <= endDate
  return await Event.find({
    companyId,
    startDate: { $lte: today },
    endDate: { $gte: today },
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

export const updateEventById = async (id, updateData) => {
  return await Event.findByIdAndUpdate(id, updateData, { new: true });
};

export const deleteEventById = async (id) => {
  return await Event.findByIdAndDelete(id);
};