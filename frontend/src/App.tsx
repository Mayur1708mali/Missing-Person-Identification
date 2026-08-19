import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AppRouter from './router';

function App() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <AppRouter />
      <Footer />
    </div>
  );
}

export default App;
