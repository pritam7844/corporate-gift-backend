import * as authService from './auth.service.js';

export const register = async (req, res, next) => {
  try {
    const user = await authService.registerUser(req.body);
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: user
    });
  } catch (error) {
    res.status(400);
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password, subdomain } = req.body;

    // IMPORTANT: Do NOT have an "if (!subdomain)" check here anymore!
    const result = await authService.loginUser(email, password, subdomain);

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(401).json({ success: false, message: error.message });
  }
};

export const logout = async (req, res, next) => {
  try {
    // In JWT based auth, logout is typically handled on the frontend by clearing the token.
    // However, we provide an endpoint to clear any potential cookies and return a success message
    res.clearCookie('token'); // In case auth cookies are used
    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};