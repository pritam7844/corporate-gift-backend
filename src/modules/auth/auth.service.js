import User from '../users/user.model.js';
import Company from '../company/company.model.js'; 
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const registerUser = async (userData) => {
  const { name, email, password, role, companyId } = userData;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error('User already exists with this email');
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    role,
    companyId: companyId || null // Ensure null for Admins
  });

  const userResponse = user.toObject();
  delete userResponse.password;
  return userResponse;
};

  
export const loginUser = async (email, password, subdomain) => {
  let user;

  // FIX: If subdomain is 'admin' or undefined, bypass Company lookup
  if (!subdomain || subdomain === 'admin') {
    // Only look for a user with the 'admin' role
    user = await User.findOne({ email, role: 'admin' });
    
    if (!user) {
      throw new Error('Unauthorized: Admin account not found');
    }
  } 
  // Otherwise, it's a tenant (company) login
  else {
    const company = await Company.findOne({ subdomain });
    if (!company) {
      throw new Error('Invalid company portal');
    }

    user = await User.findOne({ 
      email,
      companyId: company._id 
    }).populate('companyId');
    
    if (!user) {
      throw new Error('Invalid credentials for this company');
    }
  }

  // Password and Token logic follows...
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error('Invalid email or password');

  const token = jwt.sign(
    { 
      id: user._id, 
      role: user.role, 
      companyId: user.companyId ? user.companyId._id : null 
    },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );

  const userResponse = user.toObject();
  delete userResponse.password;
  return { user: userResponse, token };
};