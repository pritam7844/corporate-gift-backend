import * as eventService from './event.service.js';
import Event from './event.model.js';

export const createEvent = async (req, res, next) => {
  try {
    const event = await eventService.createEvent(req.body);
    res.status(201).json({ success: true, data: event });
  } catch (error) {
    next(error);
  }
};

export const updateEventProducts = async (req, res, next) => {
  try {
    const { eventId, productIds } = req.body;
    const updatedEvent = await eventService.addProductsToEvent(eventId, productIds);
    res.status(200).json({ success: true, data: updatedEvent });
  } catch (error) {
    next(error);
  }
};

export const getCompanyEvents = async (req, res, next) => {
  try {
    // SECURITY: Get companyId from the verified token, NOT the URL params.
    // This makes it impossible for an employee to spy on another company's events.
    const companyId = req.user.companyId;

    // This service call already uses .populate('products'), 
    // so they will get the event details AND the product details together!
    const events = await eventService.getEventsByCompany(companyId);
    res.status(200).json({ success: true, data: events });
  } catch (error) {
    next(error);
  }
};

export const getAllEvents = async (req, res, next) => {
  try {
    const filter = {};

    // Admin wants to see ONLY Global Master Templates
    if (req.query.isGlobal === 'true') {
      filter.isGlobal = true;
    }
    // Admin wants to see ONLY events assigned to a specific company
    else if (req.query.companyId) {
      filter.companyId = req.query.companyId;
      filter.isGlobal = false;
    }

    const events = await eventService.getAllEvents(filter);
    res.status(200).json({ success: true, data: events });
  } catch (error) {
    next(error);
  }
};
export const assignGlobalEventToCompany = async (req, res, next) => {
  try {
    const { globalEventId, companyId, startDate, endDate } = req.body;

    // 1. Find the Master Template
    const template = await Event.findById(globalEventId);
    if (!template) return res.status(404).json({ success: false, message: "Template not found" });

    // 2. Create a Private Copy for the Company using the Service
    const eventData = {
      name: template.name,
      products: template.products,
      companyId: companyId,
      isGlobal: false,
      clonedFrom: globalEventId,
      startDate: startDate || template.startDate,
      endDate: endDate || template.endDate,
      status: 'active'
    };

    const newEvent = await eventService.createEvent(eventData);

    res.status(201).json({ success: true, data: newEvent });
  } catch (error) {
    next(error);
  }
};

export const getEventByID = async (req, res, next) => {
  try {
    const event = await eventService.getEventById(req.params.id);
    res.status(200).json({ success: true, data: event });
  } catch (error) {
    next(error);
  }
};

export const updateEvent = async (req, res, next) => {
  try {
    const event = await eventService.updateEventById(req.params.id, req.body);

    // If this is a global template, cascade name/date changes to all company clones
    if (event && event.isGlobal) {
      const cascadeFields = {};
      if (req.body.name !== undefined) cascadeFields.name = req.body.name;
      if (req.body.startDate !== undefined) cascadeFields.startDate = req.body.startDate;
      if (req.body.endDate !== undefined) cascadeFields.endDate = req.body.endDate;

      if (Object.keys(cascadeFields).length > 0) {
        await Event.updateMany({ clonedFrom: req.params.id }, { $set: cascadeFields });
      }
    }

    res.status(200).json({ success: true, data: event });
  } catch (error) {
    next(error);
  }
};

export const deleteEvent = async (req, res, next) => {
  try {
    await eventService.deleteEventById(req.params.id);
    res.status(200).json({ success: true, message: 'Event deleted successfully' });
  } catch (error) {
    next(error);
  }
};