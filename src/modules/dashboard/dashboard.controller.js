import Company from '../company/company.model.js';
import Product from '../products/product.model.js';
import User from '../users/user.model.js';
import Event from '../events/event.model.js';

export const getStats = async (req, res) => {
    try {
        const today = new Date();

        const [
            totalCompanies,
            totalProducts,
            totalEmployees,
            activeEvents
        ] = await Promise.all([
            Company.countDocuments(),
            Product.countDocuments({ isGlobal: true }),
            User.countDocuments({ role: 'company_user' }),
            Event.countDocuments({
                startDate: { $lte: today },
                endDate: { $gte: today }
            })
        ]);

        res.json({
            totalCompanies,
            totalProducts,
            totalEmployees,
            activeEvents
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ message: 'Failed to fetch dashboard statistics' });
    }
};
