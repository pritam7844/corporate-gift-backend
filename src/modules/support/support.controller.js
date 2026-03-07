import Support from './support.model.js';

export const createTicket = async (req, res, next) => {
    try {
        const { name, email, message, companyId } = req.body;

        if (!name || !email || !message) {
            return res.status(400).json({ success: false, message: 'All fields are required.' });
        }

        const ticket = await Support.create({ name, email, message, companyId });

        res.status(201).json({
            success: true,
            message: 'Support ticket submitted successfully.',
            data: ticket
        });
    } catch (error) {
        next(error);
    }
};

export const getAllTickets = async (req, res, next) => {
    try {
        const filter = req.query.companyId ? { companyId: req.query.companyId } : {};
        const tickets = await Support.find(filter)
            .populate('companyId', 'name subdomain')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, data: tickets });
    } catch (error) {
        next(error);
    }
};

export const updateTicketStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const ticket = await Support.findByIdAndUpdate(
            id,
            { status },
            { new: true, runValidators: true }
        ).populate('companyId', 'name subdomain');

        if (!ticket) {
            return res.status(404).json({ success: false, message: 'Ticket not found' });
        }

        res.status(200).json({ success: true, data: ticket });
    } catch (error) {
        next(error);
    }
};
