import { useState } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { apiRequest } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import Home from "@/pages/Home";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import EventsListing from "@/components/events/EventsListing";
import EventFilters from "@/components/events/EventFilters";
import ProfileManagement from "@/components/profile/ProfileManagement";
import NotificationSettings from "@/components/profile/NotificationSettings";

// Page components
const EventsPage = () => (
  <div className="container mx-auto py-8">
    <h1 className="text-3xl font-bold mb-8">Browse Events</h1>
    <EventsListing />
  </div>
);

const TicketsPage = () => (
  <div className="container mx-auto py-8">
    <h1 className="text-3xl font-bold mb-8">My Tickets</h1>
    <div className="bg-white rounded-lg shadow-md p-6">
      <p className="text-gray-500">Here you can view all your purchased tickets.</p>
      {/* Ticket listing goes here */}
      <div className="mt-6 space-y-4">
        {[1, 2, 3].map((ticket) => (
          <div key={ticket} className="border rounded-md p-4 flex items-center justify-between">
            <div>
              <h3 className="font-medium">Tech Conference 2023</h3>
              <p className="text-sm text-gray-500">Mar 15, 2023 · VIP Ticket</p>
            </div>
            <button className="text-primary hover:underline">View Ticket</button>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const CreateEventPage = () => (
  <div className="container mx-auto py-8">
    <h1 className="text-3xl font-bold mb-8">Create New Event</h1>
    <div className="bg-white rounded-lg shadow-md p-6">
      <p className="text-gray-500 mb-6">Fill out the form below to create a new event.</p>
      <form className="space-y-6">
        <div>
          <label htmlFor="eventName" className="block text-sm font-medium text-gray-700">Event Name</label>
          <input type="text" id="eventName" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary" />
        </div>
        <div>
          <label htmlFor="eventDate" className="block text-sm font-medium text-gray-700">Date & Time</label>
          <input type="datetime-local" id="eventDate" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary" />
        </div>
        <div>
          <label htmlFor="eventLocation" className="block text-sm font-medium text-gray-700">Location</label>
          <input type="text" id="eventLocation" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary" />
        </div>
        <div>
          <label htmlFor="eventCategory" className="block text-sm font-medium text-gray-700">Category</label>
          <select id="eventCategory" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary">
            <option>Music</option>
            <option>Technology</option>
            <option>Art & Culture</option>
            <option>Sports</option>
            <option>Food & Drink</option>
            <option>Business</option>
          </select>
        </div>
        <div>
          <label htmlFor="eventDescription" className="block text-sm font-medium text-gray-700">Description</label>
          <textarea id="eventDescription" rows={4} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"></textarea>
        </div>
        <div className="flex justify-end">
          <button type="submit" className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90">Create Event</button>
        </div>
      </form>
    </div>
  </div>
);

const ProfilePage = () => (
  <div className="container mx-auto py-8">
    <h1 className="text-3xl font-bold mb-8">Your Profile</h1>
    <div className="bg-white rounded-lg shadow-md p-6">
      <ProfileManagement />
    </div>
  </div>
);

const SettingsPage = () => (
  <div className="container mx-auto py-8">
    <h1 className="text-3xl font-bold mb-8">Settings</h1>
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">Notification Preferences</h2>
      <NotificationSettings />
    </div>
  </div>
);

// Event Ticket Purchase Page
const EventTicketsPage = ({ params }: { params: { id: string } }) => {
  const eventId = parseInt(params.id);
  const { data: event, isLoading, isError } = useQuery({
    queryKey: ['/api/events', eventId],
    queryFn: async () => {
      const response = await fetch(`/api/events?eventId=${eventId}`);
      if (!response.ok) throw new Error('Failed to fetch event');
      const data = await response.json();
      return data.events[0];
    }
  });

  const [ticketType, setTicketType] = useState('standard');
  const [quantity, setQuantity] = useState(1);
  const { toast } = useToast();

  const purchaseTickets = async () => {
    try {
      const response = await apiRequest('POST', `/api/events/${eventId}/tickets`, {
        ticketType,
        quantity
      });
      
      toast({
        title: "Tickets purchased successfully!",
        description: `You have purchased ${quantity} ${ticketType} ticket(s) for this event.`,
        duration: 5000,
      });
      
      return response;
    } catch (error) {
      toast({
        title: "Purchase failed",
        description: "There was a problem purchasing your tickets. Please try again.",
        variant: "destructive",
        duration: 5000,
      });
      throw error;
    }
  };

  if (isLoading) {
    return <div className="container mx-auto py-8 text-center">Loading event details...</div>;
  }

  if (isError || !event) {
    return <div className="container mx-auto py-8 text-center text-red-500">Event not found or error loading event details.</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Purchase Tickets</h1>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="md:flex">
          <div className="md:w-1/3">
            <img 
              src={event.image_url} 
              alt={event.name} 
              className="h-48 w-full object-cover md:h-full"
            />
          </div>
          <div className="p-6 md:w-2/3">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{event.name}</h2>
            <div className="text-sm text-gray-600 mb-4">
              <div className="flex items-center mb-2">
                <i className="fas fa-calendar-alt mr-2"></i>
                <span>{new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} at {new Date(event.date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</span>
              </div>
              <div className="flex items-center">
                <i className="fas fa-map-marker-alt mr-2"></i>
                <span>{event.location}</span>
              </div>
            </div>

            <div className="mt-6 border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Select Tickets</h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Ticket Type</label>
                <select 
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                  value={ticketType}
                  onChange={(e) => setTicketType(e.target.value)}
                >
                  <option value="standard">Standard - ${event.price ? event.price - 50 : 49.99}</option>
                  <option value="vip">VIP - ${event.price || 99.99}</option>
                  <option value="premium">Premium - ${event.price ? event.price + 50 : 149.99}</option>
                </select>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                <select 
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value))}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                    <option key={num} value={num}>{num}</option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="text-lg font-medium">
                  Total: <span className="text-primary">${
                    ((ticketType === 'standard' && (event.price ? event.price - 50 : 49.99)) ||
                    (ticketType === 'vip' && (event.price || 99.99)) ||
                    (ticketType === 'premium' && (event.price ? event.price + 50 : 149.99))) * quantity
                  }</span>
                </div>
                <Button
                  onClick={purchaseTickets}
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
                >
                  Purchase Tickets
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

function Router() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-grow">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/events" component={() => <EventsPage />} />
          <Route path="/events/:id/tickets" component={EventTicketsPage} />
          <Route path="/tickets" component={() => <TicketsPage />} />
          <Route path="/create-event" component={() => <CreateEventPage />} />
          <Route path="/profile" component={() => <ProfilePage />} />
          <Route path="/settings" component={() => <SettingsPage />} />
          <Route component={NotFound} />
        </Switch>
      </div>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
