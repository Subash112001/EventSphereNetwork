import { pgTable, text, serial, integer, boolean, timestamp, jsonb, date, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  first_name: text("first_name").notNull(),
  last_name: text("last_name").notNull(),
  phone: text("phone"),
  country: text("country"),
  city: text("city"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
  interests: text("interests").array(),
  notification_preferences: jsonb("notification_preferences")
});

// Events table
export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  date: timestamp("date").notNull(),
  location: text("location").notNull(),
  image_url: text("image_url").notNull(),
  category: text("category").notNull(),
  price_min: numeric("price_min").notNull(),
  price_max: numeric("price_max").notNull(),
  capacity: integer("capacity").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
  creator_id: integer("creator_id").references(() => users.id).notNull(),
});

// Tickets table
export const tickets = pgTable("tickets", {
  id: serial("id").primaryKey(),
  event_id: integer("event_id").references(() => events.id).notNull(),
  user_id: integer("user_id").references(() => users.id).notNull(),
  ticket_type: text("ticket_type").notNull(),
  price: numeric("price").notNull(),
  purchased_at: timestamp("purchased_at").defaultNow().notNull(),
  is_used: boolean("is_used").default(false).notNull(),
});

// Favorites table to track user's favorite events
export const favorites = pgTable("favorites", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").references(() => users.id).notNull(),
  event_id: integer("event_id").references(() => events.id).notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

// Table for storing monthly revenue statistics
export const monthlyStats = pgTable("monthly_stats", {
  id: serial("id").primaryKey(),
  month: date("month").notNull(),
  revenue: numeric("revenue").notNull(),
  tickets_sold: integer("tickets_sold").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

// Table for storing event category statistics
export const categoryStats = pgTable("category_stats", {
  id: serial("id").primaryKey(),
  category: text("category").notNull(),
  ticket_count: integer("ticket_count").notNull(),
  revenue: numeric("revenue").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

// Email notifications table
export const emailNotifications = pgTable("email_notifications", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").references(() => users.id).notNull(),
  subject: text("subject").notNull(),
  content: text("content").notNull(),
  sent_at: timestamp("sent_at").defaultNow().notNull(),
  type: text("type").notNull(), // e.g., ticket_purchase, event_update, event_reminder
  event_id: integer("event_id").references(() => events.id),
  ticket_id: integer("ticket_id").references(() => tickets.id),
  opened: boolean("opened").default(false).notNull(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  first_name: true,
  last_name: true,
  phone: true,
  country: true,
  city: true,
  interests: true,
  notification_preferences: true,
});

export const insertEventSchema = createInsertSchema(events).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const insertTicketSchema = createInsertSchema(tickets).omit({
  id: true,
  purchased_at: true,
  is_used: true,
});

export const insertFavoriteSchema = createInsertSchema(favorites).omit({
  id: true,
  created_at: true,
});

export const insertEmailNotificationSchema = createInsertSchema(emailNotifications).omit({
  id: true,
  sent_at: true,
  opened: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Event = typeof events.$inferSelect & { 
  is_favorite?: boolean; 
  attendees_count?: number;
  price_range?: string;
};

export type InsertTicket = z.infer<typeof insertTicketSchema>;
export type Ticket = typeof tickets.$inferSelect;

export type InsertFavorite = z.infer<typeof insertFavoriteSchema>;
export type Favorite = typeof favorites.$inferSelect;

export type InsertEmailNotification = z.infer<typeof insertEmailNotificationSchema>;
export type EmailNotification = typeof emailNotifications.$inferSelect;

// Analytics types
export interface MonthlyStat {
  month: string;
  revenue: number;
}

export interface EventCategoryStat {
  category: string;
  ticketCount: number;
  revenue: number;
}

export interface AnalyticsMetrics {
  ticketsSold: number;
  ticketsGrowth: number;
  revenue: number;
  revenueGrowth: number;
  activeEvents: number;
  eventsGrowth: number;
  attendees: number;
  attendeesGrowth: number;
}

export interface NotificationPreferences {
  ticketPurchases: boolean;
  eventReminders: boolean;
  eventUpdates: boolean;
  eventRecommendations: boolean;
  marketingEmails: boolean;
  notificationFrequency: 'immediate' | 'daily' | 'weekly';
}
