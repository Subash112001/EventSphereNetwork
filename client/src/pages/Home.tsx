import { Link } from "wouter";
import { Button } from "@/components/ui/button";

const Home = () => {
  return (
    <div className="bg-white">
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 bg-white sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
            <svg
              className="hidden lg:block absolute right-0 inset-y-0 h-full w-48 text-white transform translate-x-1/2"
              fill="currentColor"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <polygon points="50,0 100,0 50,100 0,100" />
            </svg>
            <div className="pt-10 sm:pt-16 lg:pt-8 xl:pt-16">
              <div className="sm:text-center lg:text-left px-4 sm:px-8 xl:pl-0">
                <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                  <span className="block">Create and discover</span>
                  <span className="block text-primary">amazing events</span>
                </h1>
                <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto lg:mx-0">
                  EventSphere is your one-stop platform for creating, managing, and discovering events. From concerts to workshops, find events that match your interests or create your own in minutes.
                </p>
                <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                  <div className="rounded-md shadow">
                    <Link href="/dashboard">
                      <Button className="w-full px-8 py-3 text-base font-medium rounded-md text-white bg-primary hover:bg-primary/90 md:py-4 md:text-lg md:px-10">
                        Get started
                      </Button>
                    </Link>
                  </div>
                  <div className="mt-3 sm:mt-0 sm:ml-3">
                    <Link href="/events">
                      <Button variant="outline" className="w-full px-8 py-3 text-base font-medium rounded-md md:py-4 md:text-lg md:px-10">
                        Browse events
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
          <img
            className="h-56 w-full object-cover sm:h-72 md:h-96 lg:w-full lg:h-full"
            src="https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1050&q=80"
            alt="People enjoying an event"
          />
        </div>
      </div>

      <div className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Enhanced Features for Event Management
            </h2>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
              We've improved the EventSphere platform with new features to make event management even better.
            </p>
          </div>

          <div className="mt-10">
            <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-primary-100 rounded-md p-3">
                      <i className="fas fa-filter text-primary-600"></i>
                    </div>
                    <div className="ml-5">
                      <h3 className="text-lg font-medium text-gray-900">Advanced Filtering</h3>
                      <p className="mt-2 text-base text-gray-500">
                        Find events by date, category, price range, and location with our improved filtering system.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-secondary-100 rounded-md p-3">
                      <i className="fas fa-chart-bar text-secondary-600"></i>
                    </div>
                    <div className="ml-5">
                      <h3 className="text-lg font-medium text-gray-900">Analytics Dashboard</h3>
                      <p className="mt-2 text-base text-gray-500">
                        Track your event performance with detailed metrics and visual charts.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                      <i className="fas fa-envelope text-green-600"></i>
                    </div>
                    <div className="ml-5">
                      <h3 className="text-lg font-medium text-gray-900">Email Notifications</h3>
                      <p className="mt-2 text-base text-gray-500">
                        Stay updated with automated emails for ticket purchases and event changes.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
