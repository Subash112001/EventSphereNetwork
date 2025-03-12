import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
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
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      <div className="lg:col-span-1">
        <EventFilters onFiltersChange={() => {}} />
      </div>
      <div className="lg:col-span-3">
        <EventsListing />
      </div>
    </div>
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

function Router() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-grow">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/events" component={() => <EventsPage />} />
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
