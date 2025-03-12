import { EmailNotification, InsertEmailNotification } from "@shared/schema";
import { storage } from "../storage";
import { format } from "date-fns";

// Interface for email data
interface EmailData {
  to: string;
  subject: string;
  type: string;
  data: any;
}

// Function to send email
export async function sendEmail(emailData: EmailData): Promise<void> {
  try {
    // In a real application, you would use a service like Nodemailer
    // For this demo, we'll log the email and store it in our database
    console.log(`Sending email to ${emailData.to}`);
    console.log(`Subject: ${emailData.subject}`);
    
    // Generate email content based on template
    const content = generateEmailContent(emailData.type, emailData.data);
    
    // Store the notification in the database
    const notification: InsertEmailNotification = {
      user_id: emailData.data.user.id || 1, // Default to user ID 1 for demo
      subject: emailData.subject,
      content: content,
      type: emailData.type,
      event_id: emailData.data.event?.id,
      ticket_id: emailData.data.tickets?.id
    };
    
    await storage.createEmailNotification(notification);
    
    console.log(`Email content: ${content}`);
    console.log('Email sent successfully!');
    
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

// Function to generate email content based on template type
function generateEmailContent(type: string, data: any): string {
  switch (type) {
    case 'ticket_purchase':
      return generateTicketPurchaseEmail(data);
    case 'event_update':
      return generateEventUpdateEmail(data);
    case 'event_reminder':
      return generateEventReminderEmail(data);
    case 'recommendation':
      return generateRecommendationEmail(data);
    default:
      return generateGenericEmail(data);
  }
}

// Template for ticket purchase confirmation
function generateTicketPurchaseEmail(data: any): string {
  const { user, event, tickets } = data;
  const formattedDate = event.date ? format(new Date(event.date), 'EEE, MMM d, yyyy · h:mm a') : 'Date TBD';
  
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="padding: 20px; background-color: #eef2ff; text-align: center; border-bottom: 1px solid #ddd;">
        <h1 style="color: #4F46E5; margin: 0;">EventSphere</h1>
      </div>
      
      <div style="padding: 30px;">
        <h2 style="margin-top: 0; color: #333;">Your Ticket Confirmation</h2>
        <p style="color: #555;">Thank you for your purchase, ${user.firstName}! Your tickets for <strong>${event.name}</strong> have been confirmed.</p>
        
        <div style="background-color: #f9fafb; padding: 20px; border-radius: 5px; margin: 20px 0; border: 1px solid #eee;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
            <div style="color: #666; font-weight: 500;">Event</div>
            <div style="font-weight: 500;">${event.name}</div>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
            <div style="color: #666; font-weight: 500;">Date</div>
            <div style="font-weight: 500;">${formattedDate}</div>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
            <div style="color: #666; font-weight: 500;">Location</div>
            <div style="font-weight: 500;">${event.location}</div>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <div style="color: #666; font-weight: 500;">Ticket Type</div>
            <div style="font-weight: 500;">${tickets.type} × ${tickets.quantity}</div>
          </div>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <p style="color: #555; margin-bottom: 20px;">Your tickets will be available in the EventSphere app. You can also access them through your account on our website.</p>
          <a href="#" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: 500;">View Tickets</a>
        </div>
      </div>
      
      <div style="padding: 15px; background-color: #f9fafb; border-top: 1px solid #ddd; text-align: center; color: #666; font-size: 12px;">
        &copy; ${new Date().getFullYear()} EventSphere. All rights reserved.
      </div>
    </div>
  `;
}

// Template for event updates
function generateEventUpdateEmail(data: any): string {
  const { user, event, update } = data;
  const formattedDate = event.date ? format(new Date(event.date), 'EEE, MMM d, yyyy · h:mm a') : 'Date TBD';
  
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="padding: 20px; background-color: #eef2ff; text-align: center; border-bottom: 1px solid #ddd;">
        <h1 style="color: #4F46E5; margin: 0;">EventSphere</h1>
      </div>
      
      <div style="padding: 30px;">
        <h2 style="margin-top: 0; color: #333;">Event Update: ${event.name}</h2>
        <p style="color: #555;">Hello ${user.firstName}, we're writing to inform you about an important update to an event you're attending.</p>
        
        <div style="background-color: #f9fafb; padding: 20px; border-radius: 5px; margin: 20px 0; border: 1px solid #eee;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
            <div style="color: #666; font-weight: 500;">Event</div>
            <div style="font-weight: 500;">${event.name}</div>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
            <div style="color: #666; font-weight: 500;">Date</div>
            <div style="font-weight: 500;">${formattedDate}</div>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
            <div style="color: #666; font-weight: 500;">Location</div>
            <div style="font-weight: 500;">${event.location}</div>
          </div>
        </div>
        
        <div style="background-color: #fffbeb; padding: 20px; border-radius: 5px; margin: 20px 0; border: 1px solid #fef3c7;">
          <h3 style="margin-top: 0; color: #92400e;">Update Information</h3>
          <p style="color: #555;">${update.message}</p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="#" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: 500;">View Event Details</a>
        </div>
      </div>
      
      <div style="padding: 15px; background-color: #f9fafb; border-top: 1px solid #ddd; text-align: center; color: #666; font-size: 12px;">
        &copy; ${new Date().getFullYear()} EventSphere. All rights reserved.
      </div>
    </div>
  `;
}

// Template for event reminders
function generateEventReminderEmail(data: any): string {
  const { user, event } = data;
  const formattedDate = event.date ? format(new Date(event.date), 'EEE, MMM d, yyyy · h:mm a') : 'Date TBD';
  const daysTillEvent = Math.ceil((new Date(event.date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="padding: 20px; background-color: #eef2ff; text-align: center; border-bottom: 1px solid #ddd;">
        <h1 style="color: #4F46E5; margin: 0;">EventSphere</h1>
      </div>
      
      <div style="padding: 30px;">
        <h2 style="margin-top: 0; color: #333;">Event Reminder: ${event.name}</h2>
        <p style="color: #555;">Hello ${user.firstName}, this is a reminder that you have an upcoming event in ${daysTillEvent} days.</p>
        
        <div style="background-color: #f9fafb; padding: 20px; border-radius: 5px; margin: 20px 0; border: 1px solid #eee;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
            <div style="color: #666; font-weight: 500;">Event</div>
            <div style="font-weight: 500;">${event.name}</div>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
            <div style="color: #666; font-weight: 500;">Date</div>
            <div style="font-weight: 500;">${formattedDate}</div>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
            <div style="color: #666; font-weight: 500;">Location</div>
            <div style="font-weight: 500;">${event.location}</div>
          </div>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="#" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: 500;">View Event Details</a>
        </div>
        
        <p style="color: #555; font-size: 14px;">We look forward to seeing you at the event!</p>
      </div>
      
      <div style="padding: 15px; background-color: #f9fafb; border-top: 1px solid #ddd; text-align: center; color: #666; font-size: 12px;">
        &copy; ${new Date().getFullYear()} EventSphere. All rights reserved.
      </div>
    </div>
  `;
}

// Template for event recommendations
function generateRecommendationEmail(data: any): string {
  const { user, events } = data;
  
  let eventsHtml = '';
  events.forEach((event: any) => {
    const formattedDate = event.date ? format(new Date(event.date), 'EEE, MMM d, yyyy') : 'Date TBD';
    eventsHtml += `
      <div style="margin-bottom: 20px; border: 1px solid #eee; border-radius: 5px; overflow: hidden;">
        <div style="background-color: #f9fafb; padding: 15px;">
          <h3 style="margin: 0; color: #333;">${event.name}</h3>
          <p style="margin: 5px 0 0; color: #666; font-size: 14px;">${formattedDate} · ${event.location}</p>
        </div>
        <div style="padding: 15px;">
          <p style="color: #555; margin-top: 0; margin-bottom: 15px; font-size: 14px;">${event.description}</p>
          <a href="#" style="background-color: #4F46E5; color: white; padding: 8px 16px; text-decoration: none; border-radius: 5px; font-size: 14px; font-weight: 500;">Learn More</a>
        </div>
      </div>
    `;
  });
  
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="padding: 20px; background-color: #eef2ff; text-align: center; border-bottom: 1px solid #ddd;">
        <h1 style="color: #4F46E5; margin: 0;">EventSphere</h1>
      </div>
      
      <div style="padding: 30px;">
        <h2 style="margin-top: 0; color: #333;">Events You Might Like</h2>
        <p style="color: #555;">Hello ${user.firstName}, we've found some events that match your interests!</p>
        
        <div style="margin-top: 25px;">
          ${eventsHtml}
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="#" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: 500;">Browse More Events</a>
        </div>
      </div>
      
      <div style="padding: 15px; background-color: #f9fafb; border-top: 1px solid #ddd; text-align: center; color: #666; font-size: 12px;">
        &copy; ${new Date().getFullYear()} EventSphere. All rights reserved.<br>
        <p style="margin-top: 10px; font-size: 11px;">
          You're receiving this email because you've enabled event recommendations in your notification preferences.
          <a href="#" style="color: #4F46E5;">Unsubscribe</a>
        </p>
      </div>
    </div>
  `;
}

// Generic email template for other types
function generateGenericEmail(data: any): string {
  const { user, subject, message } = data;
  
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="padding: 20px; background-color: #eef2ff; text-align: center; border-bottom: 1px solid #ddd;">
        <h1 style="color: #4F46E5; margin: 0;">EventSphere</h1>
      </div>
      
      <div style="padding: 30px;">
        <h2 style="margin-top: 0; color: #333;">${subject || 'EventSphere Notification'}</h2>
        <p style="color: #555;">Hello ${user?.firstName || 'User'}, we have an important update for you.</p>
        
        <div style="background-color: #f9fafb; padding: 20px; border-radius: 5px; margin: 20px 0; border: 1px solid #eee;">
          <p style="color: #555; margin: 0;">${message || 'No message content provided.'}</p>
        </div>
      </div>
      
      <div style="padding: 15px; background-color: #f9fafb; border-top: 1px solid #ddd; text-align: center; color: #666; font-size: 12px;">
        &copy; ${new Date().getFullYear()} EventSphere. All rights reserved.
      </div>
    </div>
  `;
}
