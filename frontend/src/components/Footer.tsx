export default function Footer() {
  return (
    <footer className="bg-gray-800 text-gray-300 py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-white font-semibold mb-2">Missing Person Identification</h3>
            <p className="text-sm">
              Helping reunite families through advanced facial recognition technology.
            </p>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-2">Quick Links</h3>
            <ul className="text-sm space-y-1">
              <li><a href="/browse" className="hover:text-white transition-colors">Browse Cases</a></li>
              <li><a href="/report" className="hover:text-white transition-colors">Report Missing Person</a></li>
              <li><a href="/search" className="hover:text-white transition-colors">Face Search</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-2">Emergency</h3>
            <p className="text-sm">
              If you have an emergency, please call your local emergency services immediately.
            </p>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-4 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} Missing Person Identification System. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
