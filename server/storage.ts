import { 
  users, 
  events, 
  tickets, 
  favorites, 
  emailNotifications,
  type User, 
  type InsertUser, 
  type Event, 
  type Ticket, 
  type InsertTicket, 
  type Favorite,
  type EmailNotification,
  type InsertEmailNotification,
  type MonthlyStat,
  type EventCategoryStat,
  type AnalyticsMetrics,
  type NotificationPreferences
} from "@shared/schema";
import { formatISO, subDays, parseISO, format, addMonths } from "date-fns";
import session from "express-session";
import MemoryStore from "memorystore";

// Interface for all storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: any): Promise<User>;
  getUserTickets(userId: number): Promise<Ticket[]>;
  getUserCreatedEvents(userId: number): Promise<Event[]>;
  
  // Session management
  sessionStore: any;
  
  // Event operations
  getEvent(id: number): Promise<Event | undefined>;
  getFilteredEvents(filters: any, page: number, pageSize: number): Promise<{ 
    events: Event[], 
    totalItems: number,
    totalPages: number
  }>;
  
  // Favorites operations
  addFavorite(userId: number, eventId: number): Promise<Favorite>;
  removeFavorite(userId: number, eventId: number): Promise<void>;
  
  // Ticket operations
  purchaseTickets(userId: number, eventId: number, ticketType: string, quantity: number): Promise<Ticket[]>;
  
  // Notification operations
  getNotificationPreferences(userId: number): Promise<NotificationPreferences>;
  updateNotificationPreferences(userId: number, preferences: NotificationPreferences): Promise<NotificationPreferences>;
  createEmailNotification(notification: InsertEmailNotification): Promise<EmailNotification>;
  
  // Analytics operations
  getAnalyticsMetrics(): Promise<AnalyticsMetrics>;
  getMonthlyRevenue(days: number): Promise<MonthlyStat[]>;
  getCategoryStats(view: string): Promise<EventCategoryStat[]>;
  getEventsPerformance(): Promise<Array<Event & { tickets_sold: number, capacity: number, revenue: number, status: string }>>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private events: Map<number, Event>;
  private tickets: Map<number, Ticket>;
  private favorites: Map<number, Favorite>;
  private emailNotifications: Map<number, EmailNotification>;
  private userId: number;
  private eventId: number;
  private ticketId: number;
  private favoriteId: number;
  private notificationId: number;
  public sessionStore: any;

  constructor() {
    this.users = new Map();
    this.events = new Map();
    this.tickets = new Map();
    this.favorites = new Map();
    this.emailNotifications = new Map();
    this.userId = 1;
    this.eventId = 1;
    this.ticketId = 1;
    this.favoriteId = 1;
    this.notificationId = 1;
    
    // Create a memory store for sessions
    const memoryStore = MemoryStore(session);
    this.sessionStore = new memoryStore({
      checkPeriod: 86400000 // Clear expired sessions every 24h
    });
    
    // Initialize with some data
    this.initializeData();
  }
  
  // Get user tickets
  async getUserTickets(userId: number): Promise<Ticket[]> {
    return Array.from(this.tickets.values()).filter(
      ticket => ticket.user_id === userId
    );
  }
  
  // Get user created events
  async getUserCreatedEvents(userId: number): Promise<Event[]> {
    return Array.from(this.events.values()).filter(
      event => event.creator_id === userId
    );
  }

  private initializeData() {
    // Create demo user
    const user: User = {
      id: this.userId++,
      username: "johndoe",
      password: "password123", // In a real app, this would be hashed
      email: "john.doe@example.com",
      first_name: "John",
      last_name: "Doe",
      phone: "(555) 123-4567",
      country: "United States",
      city: "New York",
      created_at: new Date("2023-01-01"),
      updated_at: new Date(),
      interests: ["music", "technology", "art"],
      notification_preferences: {
        emailUpdates: true,
        newsletter: true,
        smsNotifications: false,
        publicProfile: true
      }
    };
    this.users.set(user.id, user);

    // Create sample events
    const eventCategories = ["Music", "Technology", "Art & Culture", "Sports", "Food & Drink", "Business"];
    const eventLocations = [
      "Central Park, New York", 
      "Convention Center, San Francisco", 
      "Metropolitan Museum, Chicago",
      "Staples Center, Los Angeles",
      "Lincoln Center, New York",
      "Moscone Center, San Francisco"
    ];
    
    const eventImages = [
      "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=750&q=80",
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=750&q=80",
      "https://images.unsplash.com/photo-1561214115-f2f134cc4912?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=750&q=80",
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=750&q=80",
      "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=750&q=80",
      "https://images.unsplash.com/photo-1561214115-f2f134cc4912?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=750&q=80"
    ];
    
    const eventNames = [
      "Summer Music Festival",
      "Tech Conference 2023",
      "Modern Art Exhibition",
      "Championship Basketball Game",
      "Food & Wine Festival",
      "Business Leadership Summit"
    ];
    
    for (let i = 0; i < 18; i++) {
      const categoryIndex = i % eventCategories.length;
      const event: Event = {
        id: this.eventId++,
        name: eventNames[categoryIndex],
        description: `Description for ${eventNames[categoryIndex]}`,
        date: new Date(Date.now() + (i * 86400000)), // Each event is a day apart
        location: eventLocations[categoryIndex],
        image_url: eventImages[categoryIndex],
        category: eventCategories[categoryIndex],
        price_min: 25 + (i * 5),
        price_max: 100 + (i * 10),
        capacity: 300 + (i * 50),
        created_at: new Date(Date.now() - (10 * 86400000)),
        updated_at: new Date(),
        creator_id: user.id,
        is_favorite: i < 3, // First 3 events are favorites
        attendees_count: 100 + (i * 20),
        price_range: `$${25 + (i * 5)} - $${100 + (i * 10)}`
      };
      this.events.set(event.id, event);
      
      // Add some as favorites
      if (i < 3) {
        const favorite: Favorite = {
          id: this.favoriteId++,
          user_id: user.id,
          event_id: event.id,
          created_at: new Date()
        };
        this.favorites.set(favorite.id, favorite);
      }
      
      // Add some tickets
      const ticketCount = 50 + Math.floor(Math.random() * 200);
      for (let j = 0; j < ticketCount; j++) {
        const ticket: Ticket = {
          id: this.ticketId++,
          event_id: event.id,
          user_id: j < 10 ? user.id : 999, // First 10 tickets for our demo user
          ticket_type: j % 3 === 0 ? "VIP" : (j % 3 === 1 ? "Standard" : "Basic"),
          price: j % 3 === 0 ? 100 : (j % 3 === 1 ? 50 : 25),
          purchased_at: new Date(Date.now() - (Math.random() * 30 * 86400000)),
          is_used: Math.random() > 0.7
        };
        this.tickets.set(ticket.id, ticket);
      }
    }
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const now = new Date();
    const user: User = { 
      ...insertUser, 
      id,
      created_at: now,
      updated_at: now
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, userData: any): Promise<User> {
    const user = await this.getUser(id);
    if (!user) {
      throw new Error("User not found");
    }
    
    const updatedUser: User = {
      ...user,
      first_name: userData.firstName || user.first_name,
      last_name: userData.lastName || user.last_name,
      email: userData.email || user.email,
      phone: userData.phone || user.phone,
      country: userData.country || user.country,
      city: userData.city || user.city,
      interests: userData.interests || user.interests,
      notification_preferences: userData.notificationPreferences ? {
        ...user.notification_preferences,
        emailUpdates: userData.notificationPreferences.emailUpdates,
        newsletter: userData.notificationPreferences.newsletter,
        smsNotifications: userData.notificationPreferences.smsNotifications,
        publicProfile: userData.notificationPreferences.publicProfile
      } : user.notification_preferences,
      updated_at: new Date()
    };
    
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Event operations
  async getEvent(id: number): Promise<Event | undefined> {
    return this.events.get(id);
  }

  async getFilteredEvents(filters: any, page: number, pageSize: number): Promise<{ 
    events: Event[], 
    totalItems: number,
    totalPages: number
  }> {
    let events = Array.from(this.events.values());
    
    // Apply filters
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      events = events.filter(event => 
        event.name.toLowerCase().includes(searchTerm) || 
        event.description.toLowerCase().includes(searchTerm) ||
        event.location.toLowerCase().includes(searchTerm)
      );
    }
    
    if (filters.dateRange && filters.dateRange !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      switch (filters.dateRange) {
        case 'today':
          events = events.filter(event => {
            const eventDate = new Date(event.date);
            return eventDate.getDate() === today.getDate() && 
                   eventDate.getMonth() === today.getMonth() &&
                   eventDate.getFullYear() === today.getFullYear();
          });
          break;
        case 'tomorrow':
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);
          events = events.filter(event => {
            const eventDate = new Date(event.date);
            return eventDate.getDate() === tomorrow.getDate() && 
                   eventDate.getMonth() === tomorrow.getMonth() &&
                   eventDate.getFullYear() === tomorrow.getFullYear();
          });
          break;
        case 'weekend':
          const nextFriday = new Date(today);
          nextFriday.setDate(today.getDate() + ((7 - today.getDay() + 5) % 7));
          const nextSunday = new Date(nextFriday);
          nextSunday.setDate(nextFriday.getDate() + 2);
          events = events.filter(event => {
            const eventDate = new Date(event.date);
            return eventDate >= nextFriday && eventDate <= nextSunday;
          });
          break;
        case 'week':
          const weekEnd = new Date(today);
          weekEnd.setDate(today.getDate() + 7);
          events = events.filter(event => {
            const eventDate = new Date(event.date);
            return eventDate >= today && eventDate <= weekEnd;
          });
          break;
        case 'month':
          const monthEnd = new Date(today);
          monthEnd.setMonth(today.getMonth() + 1);
          events = events.filter(event => {
            const eventDate = new Date(event.date);
            return eventDate >= today && eventDate <= monthEnd;
          });
          break;
      }
    }
    
    if (filters.category && filters.category !== 'all') {
      const categoryMap: { [key: string]: string } = {
        'music': 'Music',
        'tech': 'Technology',
        'art': 'Art & Culture',
        'sports': 'Sports',
        'food': 'Food & Drink',
        'business': 'Business'
      };
      
      const category = categoryMap[filters.category];
      if (category) {
        events = events.filter(event => event.category === category);
      }
    }
    
    if (filters.priceRange && filters.priceRange !== 'all') {
      switch (filters.priceRange) {
        case 'free':
          events = events.filter(event => Number(event.price_min) === 0);
          break;
        case '1-25':
          events = events.filter(event => 
            Number(event.price_min) >= 1 && Number(event.price_min) <= 25
          );
          break;
        case '25-50':
          events = events.filter(event => 
            Number(event.price_min) >= 25 && Number(event.price_min) <= 50
          );
          break;
        case '50-100':
          events = events.filter(event => 
            Number(event.price_min) >= 50 && Number(event.price_min) <= 100
          );
          break;
        case '100+':
          events = events.filter(event => Number(event.price_min) > 100);
          break;
      }
    }
    
    if (filters.location) {
      const locationQuery = filters.location.toLowerCase();
      events = events.filter(event => 
        event.location.toLowerCase().includes(locationQuery)
      );
    }
    
    // Sort by date (most recent first)
    events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    // Paginate
    const totalItems = events.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paginatedEvents = events.slice(start, end);
    
    return {
      events: paginatedEvents,
      totalItems,
      totalPages
    };
  }

  // Favorites operations
  async addFavorite(userId: number, eventId: number): Promise<Favorite> {
    // Check if already a favorite
    const existingFavorite = Array.from(this.favorites.values()).find(
      fav => fav.user_id === userId && fav.event_id === eventId
    );
    
    if (existingFavorite) {
      return existingFavorite;
    }
    
    const favorite: Favorite = {
      id: this.favoriteId++,
      user_id: userId,
      event_id: eventId,
      created_at: new Date()
    };
    
    this.favorites.set(favorite.id, favorite);
    
    // Update the event's is_favorite property
    const event = this.events.get(eventId);
    if (event) {
      event.is_favorite = true;
      this.events.set(eventId, event);
    }
    
    return favorite;
  }

  async removeFavorite(userId: number, eventId: number): Promise<void> {
    // Find the favorite to remove
    const favorite = Array.from(this.favorites.values()).find(
      fav => fav.user_id === userId && fav.event_id === eventId
    );
    
    if (favorite) {
      this.favorites.delete(favorite.id);
      
      // Update the event's is_favorite property
      const event = this.events.get(eventId);
      if (event) {
        event.is_favorite = false;
        this.events.set(eventId, event);
      }
    }
  }

  // Ticket operations
  async purchaseTickets(userId: number, eventId: number, ticketType: string, quantity: number): Promise<Ticket[]> {
    const event = await this.getEvent(eventId);
    if (!event) {
      throw new Error("Event not found");
    }
    
    const tickets: Ticket[] = [];
    const basePrice = ticketType === "VIP" ? Number(event.price_max) : (
      ticketType === "Standard" ? (Number(event.price_min) + Number(event.price_max)) / 2 : Number(event.price_min)
    );
    
    for (let i = 0; i < quantity; i++) {
      const ticket: Ticket = {
        id: this.ticketId++,
        event_id: eventId,
        user_id: userId,
        ticket_type: ticketType,
        price: basePrice,
        purchased_at: new Date(),
        is_used: false
      };
      
      this.tickets.set(ticket.id, ticket);
      tickets.push(ticket);
    }
    
    // Update attendee count
    if (event.attendees_count !== undefined) {
      event.attendees_count += quantity;
      this.events.set(eventId, event);
    }
    
    return tickets;
  }

  // Notification operations
  async getNotificationPreferences(userId: number): Promise<NotificationPreferences> {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error("User not found");
    }
    
    // Default preferences if not set
    if (!user.notification_preferences) {
      return {
        ticketPurchases: true,
        eventReminders: true,
        eventUpdates: true,
        eventRecommendations: true,
        marketingEmails: false,
        notificationFrequency: 'immediate'
      };
    }
    
    // Map from user notification preferences to our expected format
    return {
      ticketPurchases: true,
      eventReminders: true,
      eventUpdates: true,
      eventRecommendations: user.notification_preferences.emailUpdates === true,
      marketingEmails: user.notification_preferences.newsletter === true,
      notificationFrequency: 'immediate'
    };
  }

  async updateNotificationPreferences(userId: number, preferences: NotificationPreferences): Promise<NotificationPreferences> {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error("User not found");
    }
    
    // Update user preferences
    user.notification_preferences = {
      ...user.notification_preferences,
      emailUpdates: preferences.eventRecommendations,
      newsletter: preferences.marketingEmails,
      smsNotifications: user.notification_preferences?.smsNotifications || false,
      publicProfile: user.notification_preferences?.publicProfile || true
    };
    
    this.users.set(userId, user);
    
    return preferences;
  }

  async createEmailNotification(notification: InsertEmailNotification): Promise<EmailNotification> {
    const id = this.notificationId++;
    const emailNotification: EmailNotification = {
      ...notification,
      id,
      sent_at: new Date(),
      opened: false
    };
    
    this.emailNotifications.set(id, emailNotification);
    return emailNotification;
  }

  // Analytics operations
  async getAnalyticsMetrics(): Promise<AnalyticsMetrics> {
    const tickets = Array.from(this.tickets.values());
    const events = Array.from(this.events.values());
    
    // Calculate total tickets sold
    const ticketsSold = tickets.length;
    
    // Calculate previous month tickets for growth percentage
    const now = new Date();
    const oneMonthAgo = new Date(now);
    oneMonthAgo.setMonth(now.getMonth() - 1);
    
    const thisMonthTickets = tickets.filter(ticket => new Date(ticket.purchased_at) >= oneMonthAgo).length;
    const twoMonthsAgo = new Date(now);
    twoMonthsAgo.setMonth(now.getMonth() - 2);
    const lastMonthTickets = tickets.filter(
      ticket => new Date(ticket.purchased_at) >= twoMonthsAgo && new Date(ticket.purchased_at) < oneMonthAgo
    ).length;
    
    const ticketsGrowth = lastMonthTickets ? Math.round((thisMonthTickets - lastMonthTickets) / lastMonthTickets * 100) : 0;
    
    // Calculate revenue
    const revenue = tickets.reduce((sum, ticket) => sum + Number(ticket.price), 0);
    
    // Calculate previous month revenue for growth percentage
    const thisMonthRevenue = tickets
      .filter(ticket => new Date(ticket.purchased_at) >= oneMonthAgo)
      .reduce((sum, ticket) => sum + Number(ticket.price), 0);
      
    const lastMonthRevenue = tickets
      .filter(ticket => new Date(ticket.purchased_at) >= twoMonthsAgo && new Date(ticket.purchased_at) < oneMonthAgo)
      .reduce((sum, ticket) => sum + Number(ticket.price), 0);
    
    const revenueGrowth = lastMonthRevenue ? Math.round((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue * 100) : 0;
    
    // Calculate active events
    const activeEvents = events.filter(event => new Date(event.date) >= now).length;
    
    // Calculate event growth
    const thisMonthEvents = events.filter(event => new Date(event.created_at) >= oneMonthAgo).length;
    const lastMonthEvents = events.filter(
      event => new Date(event.created_at) >= twoMonthsAgo && new Date(event.created_at) < oneMonthAgo
    ).length;
    
    const eventsGrowth = thisMonthEvents - lastMonthEvents;
    
    // Calculate total attendees
    const attendees = events.reduce((sum, event) => sum + (event.attendees_count || 0), 0);
    
    // Calculate attendee growth
    const attendeesGrowth = Math.round(ticketsGrowth / 2 + revenueGrowth / 2); // Simplified calculation
    
    return {
      ticketsSold,
      ticketsGrowth,
      revenue,
      revenueGrowth,
      activeEvents,
      eventsGrowth,
      attendees,
      attendeesGrowth
    };
  }

  async getMonthlyRevenue(days: number): Promise<MonthlyStat[]> {
    const tickets = Array.from(this.tickets.values());
    const today = new Date();
    const startDate = subDays(today, days);
    
    // Filter tickets in the date range
    const filteredTickets = tickets.filter(ticket => 
      new Date(ticket.purchased_at) >= startDate && new Date(ticket.purchased_at) <= today
    );
    
    // Group by month and calculate revenue
    const monthlyData = new Map<string, number>();
    
    filteredTickets.forEach(ticket => {
      const date = new Date(ticket.purchased_at);
      const monthKey = format(date, 'MMM yyyy');
      
      const currentRevenue = monthlyData.get(monthKey) || 0;
      monthlyData.set(monthKey, currentRevenue + Number(ticket.price));
    });
    
    // Ensure we have data points for all months in the range
    let currentDate = new Date(startDate);
    while (currentDate <= today) {
      const monthKey = format(currentDate, 'MMM yyyy');
      if (!monthlyData.has(monthKey)) {
        monthlyData.set(monthKey, 0);
      }
      currentDate = addMonths(currentDate, 1);
    }
    
    // Convert to array and sort by date
    const result: MonthlyStat[] = Array.from(monthlyData.entries()).map(([month, revenue]) => ({
      month,
      revenue
    }));
    
    // Sort by date
    result.sort((a, b) => {
      const dateA = new Date(a.month);
      const dateB = new Date(b.month);
      return dateA.getTime() - dateB.getTime();
    });
    
    return result;
  }

  async getCategoryStats(view: string): Promise<EventCategoryStat[]> {
    const events = Array.from(this.events.values());
    const tickets = Array.from(this.tickets.values());
    
    // Group by category
    const categoryData = new Map<string, { ticketCount: number, revenue: number }>();
    
    events.forEach(event => {
      const category = event.category;
      const eventTickets = tickets.filter(ticket => ticket.event_id === event.id);
      
      const ticketCount = eventTickets.length;
      const revenue = eventTickets.reduce((sum, ticket) => sum + Number(ticket.price), 0);
      
      const current = categoryData.get(category) || { ticketCount: 0, revenue: 0 };
      categoryData.set(category, {
        ticketCount: current.ticketCount + ticketCount,
        revenue: current.revenue + revenue
      });
    });
    
    // Convert to array
    const result: EventCategoryStat[] = Array.from(categoryData.entries()).map(([category, data]) => ({
      category,
      ticketCount: data.ticketCount,
      revenue: data.revenue
    }));
    
    // Sort based on view type
    if (view === 'tickets') {
      result.sort((a, b) => b.ticketCount - a.ticketCount);
    } else {
      result.sort((a, b) => b.revenue - a.revenue);
    }
    
    return result;
  }

  async getEventsPerformance(): Promise<Array<Event & { tickets_sold: number, capacity: number, revenue: number, status: string }>> {
    const events = Array.from(this.events.values());
    const tickets = Array.from(this.tickets.values());
    
    // Filter to upcoming events
    const now = new Date();
    const upcomingEvents = events.filter(event => new Date(event.date) >= now);
    
    // Get the performance data for each event
    const eventsWithPerformance = upcomingEvents.map(event => {
      const eventTickets = tickets.filter(ticket => ticket.event_id === event.id);
      const ticketsSold = eventTickets.length;
      const capacity = event.capacity;
      const revenue = eventTickets.reduce((sum, ticket) => sum + Number(ticket.price), 0);
      
      // Calculate fill rate and determine status
      const fillRate = ticketsSold / capacity;
      let status;
      
      if (fillRate >= 0.8) {
        status = "On Track";
      } else if (fillRate >= 0.6) {
        status = "Needs Attention";
      } else {
        status = "At Risk";
      }
      
      return {
        ...event,
        tickets_sold: ticketsSold,
        capacity,
        revenue,
        status
      };
    });
    
    // Sort by date (soonest first)
    eventsWithPerformance.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    return eventsWithPerformance.slice(0, 3); // Return top 3 upcoming events
  }
}

export const storage = new MemStorage();
