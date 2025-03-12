const Footer = () => {
  return (
    <footer className="bg-gray-900 border-t border-gray-800 relative z-10">
      <div className="max-w-7xl mx-auto py-12 px-4 overflow-hidden sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">About Us</h3>
            <p className="text-base text-gray-300">
              EventSphere is a premier event management platform that connects event organizers with attendees, providing seamless ticketing and event discovery.
            </p>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Platform</h3>
            <ul className="space-y-2">
              <li><a href="/events" className="text-base text-gray-300 hover:text-white">Browse Events</a></li>
              <li><a href="/tickets" className="text-base text-gray-300 hover:text-white">My Tickets</a></li>
              <li><a href="/create-event" className="text-base text-gray-300 hover:text-white">Create Event</a></li>
              <li><a href="/dashboard" className="text-base text-gray-300 hover:text-white">Analytics</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Support</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-base text-gray-300 hover:text-white">Help Center</a></li>
              <li><a href="#" className="text-base text-gray-300 hover:text-white">FAQs</a></li>
              <li><a href="#" className="text-base text-gray-300 hover:text-white">Contact Support</a></li>
              <li><a href="#" className="text-base text-gray-300 hover:text-white">Terms of Service</a></li>
              <li><a href="#" className="text-base text-gray-300 hover:text-white">Privacy Policy</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Contact Us</h3>
            <p className="text-base text-gray-300 mb-2">
              <i className="fas fa-map-marker-alt mr-2"></i> 123 Event Street, Suite 100<br />
              New York, NY 10001
            </p>
            <p className="text-base text-gray-300 mb-2">
              <i className="fas fa-phone mr-2"></i> +1 (555) 123-4567
            </p>
            <p className="text-base text-gray-300 mb-4">
              <i className="fas fa-envelope mr-2"></i> info@eventsphere.com
            </p>
            
            <div className="flex space-x-6">
              <a href="#" className="text-gray-400 hover:text-white">
                <span className="sr-only">Facebook</span>
                <i className="fab fa-facebook text-lg"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <span className="sr-only">Instagram</span>
                <i className="fab fa-instagram text-lg"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <span className="sr-only">Twitter</span>
                <i className="fab fa-twitter text-lg"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <span className="sr-only">LinkedIn</span>
                <i className="fab fa-linkedin text-lg"></i>
              </a>
            </div>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-gray-800">
          <p className="text-center text-base text-gray-300">&copy; {new Date().getFullYear()} EventSphere. All rights reserved.</p>
          <p className="text-center text-sm text-gray-400 mt-2">
            Designed with <i className="fas fa-heart text-red-500"></i> for event organizers and attendees
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
