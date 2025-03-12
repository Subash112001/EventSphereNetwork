import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { sendEmail } from "./email/templates";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { insertEventSchema } from "@shared/schema";
import { setupAuth } from "./auth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication
  setupAuth(app);

  // Error handling middleware for validation errors
  const handleValidationError = (err: unknown, res: any) => {
    if (err instanceof ZodError) {
      const error = fromZodError(err);
      return res.status(400).json({ message: error.message });
    }
    console.error(err);
    return res.status(500).json({ message: "An unexpected error occurred" });
  };

  // API routes
  // Get user profile
  app.get("/api/users/profile", async (req, res) => {
    try {
      // In a real app, get the user ID from session
      const userId = 1; // Mock user ID for demonstration
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Don't send password to client
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (err) {
      handleValidationError(err, res);
    }
  });

  // Update user profile
  app.put("/api/users/profile", async (req, res) => {
    try {
      // In a real app, get the user ID from session
      const userId = 1; // Mock user ID for demonstration
      const userData = req.body;
      
      const updatedUser = await storage.updateUser(userId, userData);
      
      // Don't send password to client
      const { password, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (err) {
      handleValidationError(err, res);
    }
  });

  // Get notification preferences
  app.get("/api/users/notification-preferences", async (req, res) => {
    try {
      // In a real app, get the user ID from session
      const userId = 1; // Mock user ID for demonstration
      const preferences = await storage.getNotificationPreferences(userId);
      
      res.json(preferences);
    } catch (err) {
      handleValidationError(err, res);
    }
  });

  // Update notification preferences
  app.put("/api/users/notification-preferences", async (req, res) => {
    try {
      // In a real app, get the user ID from session
      const userId = 1; // Mock user ID for demonstration
      const preferences = req.body;
      
      const updatedPreferences = await storage.updateNotificationPreferences(userId, preferences);
      res.json(updatedPreferences);
    } catch (err) {
      handleValidationError(err, res);
    }
  });

  // Get events with filtering and pagination
  app.get("/api/events", async (req, res) => {
    try {
      const { 
        search, 
        dateRange, 
        category, 
        priceRange, 
        location, 
        distance,
        page = "1",
        eventId
      } = req.query;
      
      // If eventId is provided, return just that specific event
      if (eventId) {
        const event = await storage.getEvent(parseInt(eventId as string));
        if (!event) {
          return res.status(404).json({ message: "Event not found" });
        }
        
        // Get a user ID (in a real app this would come from the session)
        const userId = 1;
        
        // Check if this event is a favorite for the current user
        let isFavorite = false;
        try {
          // Instead of trying to iterate through storage directly, let's just
          // try to add a favorite and catch the error if it already exists
          await storage.addFavorite(userId, parseInt(eventId as string));
          await storage.removeFavorite(userId, parseInt(eventId as string));
          isFavorite = false;
        } catch (e: any) {
          // If we get an error that it's already a favorite, then set isFavorite to true
          if (e.message && e.message.includes("already")) {
            isFavorite = true;
          }
        }
        
        return res.json({
          events: [{
            ...event,
            is_favorite: isFavorite
          }]
        });
      }
      
      const pageNumber = parseInt(page as string) || 1;
      const pageSize = 9; // Number of events per page
      
      const filters = {
        search: search as string,
        dateRange: dateRange as string,
        category: category as string,
        priceRange: priceRange as string,
        location: location as string,
        distance: distance as string,
      };
      
      const { events, totalItems, totalPages } = await storage.getFilteredEvents(
        filters, 
        pageNumber, 
        pageSize
      );
      
      res.json({
        events,
        pagination: {
          currentPage: pageNumber,
          totalPages,
          totalItems,
          pageSize
        }
      });
    } catch (err) {
      handleValidationError(err, res);
    }
  });

  // Toggle favorite event
  app.post("/api/events/:id/favorite", async (req, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const { isFavorite } = req.body;
      
      // In a real app, get the user ID from session
      const userId = 1; // Mock user ID for demonstration
      
      if (isFavorite) {
        await storage.addFavorite(userId, eventId);
      } else {
        await storage.removeFavorite(userId, eventId);
      }
      
      res.json({ success: true });
    } catch (err) {
      handleValidationError(err, res);
    }
  });

  // Purchase ticket for an event
  app.post("/api/events/:id/tickets", async (req, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const { ticketType, quantity } = req.body;
      
      // In a real app, get the user ID from session
      const userId = 1; // Mock user ID for demonstration
      
      const tickets = await storage.purchaseTickets(userId, eventId, ticketType, quantity);
      
      // Send confirmation email
      const user = await storage.getUser(userId);
      const event = await storage.getEvent(eventId);
      
      if (user && event) {
        await sendEmail({
          to: user.email,
          subject: `Ticket Confirmation: ${event.name}`,
          type: 'ticket_purchase',
          data: {
            user: {
              firstName: user.first_name,
              lastName: user.last_name
            },
            event: {
              name: event.name,
              date: event.date,
              location: event.location
            },
            tickets: {
              type: ticketType,
              quantity: quantity
            }
          }
        });
      }
      
      res.json(tickets);
    } catch (err) {
      handleValidationError(err, res);
    }
  });

  // Get a specific ticket
  app.get("/api/tickets/:id", async (req, res) => {
    try {
      const ticketId = parseInt(req.params.id);
      
      // In a real app, get the user ID from the session
      const userId = 1; // Mock user ID for demonstration
      
      const ticket = await storage.getTicketById(ticketId);
      
      if (!ticket) {
        return res.status(404).json({ message: "Ticket not found" });
      }
      
      // Check if the ticket belongs to the current user
      if (ticket.user_id !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      res.json(ticket);
    } catch (err) {
      handleValidationError(err, res);
    }
  });
  
  // Get all tickets for the current user
  app.get("/api/tickets", async (req, res) => {
    try {
      // In a real app, get the user ID from the session
      const userId = 1; // Mock user ID for demonstration
      
      const tickets = await storage.getUserTickets(userId);
      res.json(tickets);
    } catch (err) {
      handleValidationError(err, res);
    }
  });
  
  // Create a new event
  app.post("/api/events", async (req, res) => {
    try {
      // In a real app, get the user ID from the session
      const userId = 1; // Mock user ID for demonstration
      
      const eventData = req.body;
      eventData.organizerId = userId;
      
      const validatedData = insertEventSchema.parse(eventData);
      const event = await storage.createEvent(validatedData);
      
      res.status(201).json(event);
    } catch (err) {
      handleValidationError(err, res);
    }
  });
  
  // Get events created by the current user
  app.get("/api/my-events", async (req, res) => {
    try {
      // In a real app, get the user ID from the session
      const userId = 1; // Mock user ID for demonstration
      
      const events = await storage.getUserEvents(userId);
      res.json(events);
    } catch (err) {
      handleValidationError(err, res);
    }
  });
  
  // Get analytics metrics
  app.get("/api/analytics/metrics", async (req, res) => {
    try {
      const metrics = await storage.getAnalyticsMetrics();
      res.json(metrics);
    } catch (err) {
      handleValidationError(err, res);
    }
  });

  // Get monthly revenue data
  app.get("/api/analytics/revenue", async (req, res) => {
    try {
      const days = parseInt(req.query.days as string) || 30;
      const revenueData = await storage.getMonthlyRevenue(days);
      res.json(revenueData);
    } catch (err) {
      handleValidationError(err, res);
    }
  });

  // Get category statistics
  app.get("/api/analytics/categories", async (req, res) => {
    try {
      const view = req.query.view as string || 'tickets';
      const categoryData = await storage.getCategoryStats(view);
      res.json(categoryData);
    } catch (err) {
      handleValidationError(err, res);
    }
  });

  // Get events performance data
  app.get("/api/analytics/events-performance", async (req, res) => {
    try {
      const eventsPerformance = await storage.getEventsPerformance();
      res.json(eventsPerformance);
    } catch (err) {
      handleValidationError(err, res);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
