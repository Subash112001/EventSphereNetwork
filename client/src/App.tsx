import { useState, useMemo } from "react";
import { Switch, Route, Link } from "wouter";
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

// Ticket Detail Page
const TicketDetailPage = ({ params }: { params: { id: string } }) => {
  const ticketId = parseInt(params.id);
  const { data: ticket, isLoading, isError } = useQuery({
    queryKey: ['/api/tickets', ticketId],
    queryFn: async () => {
      const response = await fetch(`/api/tickets/${ticketId}`);
      if (!response.ok) throw new Error('Failed to fetch ticket');
      return await response.json();
    }
  });

  const { data: event } = useQuery({
    queryKey: ['/api/events', ticket?.event_id],
    queryFn: async () => {
      if (!ticket?.event_id) return null;
      const response = await fetch(`/api/events?eventId=${ticket.event_id}`);
      if (!response.ok) throw new Error('Failed to fetch event');
      const data = await response.json();
      return data.events[0];
    },
    enabled: !!ticket?.event_id
  });

  if (isLoading) {
    return <div className="container mx-auto py-8 text-center">Loading ticket details...</div>;
  }

  if (isError || !ticket) {
    return <div className="container mx-auto py-8 text-center text-red-500">Ticket not found or error loading ticket details.</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <div className="flex justify-between items-start mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Ticket #{ticket.id}</h1>
              <div className="bg-gradient-to-r from-primary/80 to-primary px-3 py-1 rounded-full text-white text-sm font-medium">
                {ticket.ticket_type}
              </div>
            </div>
            
            <div className="border-t border-gray-200 pt-4 pb-2">
              <h2 className="text-lg font-semibold mb-4">{event?.name || "Event"}</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Date & Time</p>
                  <p className="font-medium">
                    {event?.date 
                      ? new Date(event.date).toLocaleDateString('en-US', { 
                          weekday: 'short',
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric'
                        }) + ' · ' + 
                        new Date(event.date).toLocaleTimeString('en-US', { 
                          hour: 'numeric', 
                          minute: '2-digit',
                          hour12: true 
                        })
                      : "Date not available"}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 mb-1">Location</p>
                  <p className="font-medium">{event?.location || "Location not available"}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 mb-1">Price</p>
                  <p className="font-medium">${ticket.price}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 mb-1">Purchase Date</p>
                  <p className="font-medium">
                    {new Date(ticket.created_at).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric', 
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="border-t border-gray-200 mt-6 pt-6">
              <div className="flex justify-between">
                <Link href="/tickets">
                  <Button variant="outline">
                    <i className="fas fa-arrow-left mr-2"></i>
                    Back to My Tickets
                  </Button>
                </Link>
                
                <Button onClick={() => window.print()}>
                  <i className="fas fa-print mr-2"></i>
                  Print Ticket
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const TicketsPage = () => {
  const { data: tickets, isLoading, isError } = useQuery({
    queryKey: ['/api/tickets'],
    queryFn: async () => {
      const response = await fetch('/api/tickets');
      if (!response.ok) throw new Error('Failed to fetch tickets');
      return await response.json();
    }
  });

  const { data: eventsData } = useQuery({
    queryKey: ['/api/events'],
    queryFn: async () => {
      const response = await fetch('/api/events');
      if (!response.ok) throw new Error('Failed to fetch events');
      return await response.json();
    }
  });

  // Create a map of events by ID for quick lookup
  const eventsMap = useMemo(() => {
    const map = new Map();
    if (eventsData?.events) {
      eventsData.events.forEach((event: any) => {
        map.set(event.id, event);
      });
    }
    return map;
  }, [eventsData]);

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8">My Tickets</h1>
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <p className="text-gray-500">Loading your tickets...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8">My Tickets</h1>
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <p className="text-red-500">Error loading tickets. Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">My Tickets</h1>
      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-gray-500">Here you can view all your purchased tickets.</p>
        <div className="mt-6 space-y-4">
          {tickets && tickets.length > 0 ? (
            tickets.map((ticket: any) => {
              const event = eventsMap.get(ticket.event_id);
              return (
                <div key={ticket.id} className="border rounded-md p-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{event?.name || 'Unknown Event'}</h3>
                    <p className="text-sm text-gray-500">
                      {event ? new Date(event.date).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric'
                      }) : 'Unknown date'} · {ticket.ticket_type} Ticket
                    </p>
                  </div>
                  <Link href={`/tickets/${ticket.id}`}>
                    <Button variant="link" className="text-primary hover:underline">View Ticket</Button>
                  </Link>
                </div>
              );
            })
          ) : (
            <div className="text-center py-6">
              <p className="text-gray-500">You haven't purchased any tickets yet.</p>
              <Link href="/events">
                <Button className="mt-4">Browse Events</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

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
          <Route path="/tickets/:id" component={TicketDetailPage} />
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
