import User from './user.model.js';

export const getUserProfile = async (userId) => {
  const user = await User.findById(userId)
    .select('-password')
    .populate('companyId', 'name subdomain');
    
  if (!user) throw new Error('User not found');
  return user;
};

export const getAllUsers = async (filters = {}) => {
  return await User.find(filters)
    .select('-password')
    .populate('companyId', 'name subdomain')
    .sort({ createdAt: -1 });
};

export const updateUser = async (userId, updateData) => {
  // Prevent updating the password through this general update route
  if (updateData.password) {
    delete updateData.password;
  }

  const updatedUser = await User.findByIdAndUpdate(userId, updateData, { 
    new: true, 
    runValidators: true 
  }).select('-password');

  if (!updatedUser) throw new Error('User not found');
  return updatedUser;
};

export const deleteUser = async (userId) => {
  const user = await User.findByIdAndDelete(userId);
  if (!user) throw new Error('User not found');
  return user;
};