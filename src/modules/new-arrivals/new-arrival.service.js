import NewArrival from './new-arrival.model.js';

export const createArrival = async (arrivalData) => {
  return await NewArrival.create(arrivalData);
};

export const getAllArrivals = async (filter = {}) => {
  return await NewArrival.find(filter).sort({ createdAt: -1 });
};

export const getArrivalById = async (id) => {
  const arrival = await NewArrival.findById(id);
  if (!arrival) throw new Error('New arrival not found');
  return arrival;
};

export const updateArrival = async (id, updateData) => {
  return await NewArrival.findByIdAndUpdate(id, updateData, { new: true });
};

export const deleteArrival = async (id) => {
  return await NewArrival.findByIdAndDelete(id);
};
