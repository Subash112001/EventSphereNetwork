const Footer = () => {
  return (
    <footer className="bg-white">
      <div className="max-w-7xl mx-auto py-12 px-4 overflow-hidden sm:px-6 lg:px-8">
        <div className="mt-8 flex justify-center space-x-6">
          <a href="#" className="text-gray-400 hover:text-gray-500">
            <span className="sr-only">Facebook</span>
            <i className="fab fa-facebook text-xl"></i>
          </a>
          <a href="#" className="text-gray-400 hover:text-gray-500">
            <span className="sr-only">Instagram</span>
            <i className="fab fa-instagram text-xl"></i>
          </a>
          <a href="#" className="text-gray-400 hover:text-gray-500">
            <span className="sr-only">Twitter</span>
            <i className="fab fa-twitter text-xl"></i>
          </a>
        </div>
        <p className="mt-8 text-center text-base text-gray-400">&copy; {new Date().getFullYear()} EventSphere. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
