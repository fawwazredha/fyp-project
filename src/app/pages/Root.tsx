import { Outlet } from 'react-router';
import { Navbar } from '../components/Navbar';
import { ChatBot } from '../components/ChatBot';

export function Root() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <ChatBot />
    </div>
  );
}
