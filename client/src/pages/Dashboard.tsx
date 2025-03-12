import { useState } from "react";
import AnalyticsDashboard from "@/components/dashboard/AnalyticsDashboard";
import EventsListing from "@/components/events/EventsListing";
import ProfileManagement from "@/components/profile/ProfileManagement";
import NotificationSettings from "@/components/profile/NotificationSettings";

type TabType = 'analytics' | 'events' | 'profile' | 'notifications';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState<TabType>('analytics');

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">Monitor your event metrics and manage your account</p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button 
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'analytics' 
                ? 'border-primary text-primary' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('analytics')}
          >
            Analytics Dashboard
          </button>
          <button 
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'events' 
                ? 'border-primary text-primary' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('events')}
          >
            Browse Events
          </button>
          <button 
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'profile' 
                ? 'border-primary text-primary' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('profile')}
          >
            Profile Management
          </button>
          <button 
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'notifications' 
                ? 'border-primary text-primary' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('notifications')}
          >
            Notification Settings
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'analytics' && <AnalyticsDashboard />}
        {activeTab === 'events' && <EventsListing />}
        {activeTab === 'profile' && <ProfileManagement />}
        {activeTab === 'notifications' && <NotificationSettings />}
      </div>
    </main>
  );
};

export default Dashboard;
