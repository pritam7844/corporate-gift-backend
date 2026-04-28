import User from './user.model.js';
import bcrypt from 'bcryptjs';

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
  try {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    // Update name if provided
    if (updateData.name) user.name = updateData.name;

    // Update password if provided
    if (updateData.password && updateData.password.trim() !== '') {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(updateData.password, salt);
    }

    const savedUser = await user.save();
    
    // Return user without password
    const result = savedUser.toObject();
    delete result.password;
    return result;
  } catch (error) {
    throw error; // Re-throw to be caught by controller
  }
};

export const deleteUser = async (userId) => {
  const user = await User.findByIdAndDelete(userId);
  if (!user) throw new Error('User not found');
  return user;
};