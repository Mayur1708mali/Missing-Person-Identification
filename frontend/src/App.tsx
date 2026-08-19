import { Routes, Route } from 'react-router-dom';

function App() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Routes>
        <Route path="/" element={<div className="flex-1 flex items-center justify-center"><h1 className="text-3xl font-bold">Missing Person Identification</h1></div>} />
      </Routes>
    </div>
  );
}

export default App;
