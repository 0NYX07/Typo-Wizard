import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Keyboard, LayoutDashboard, LogOut, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { auth } from '../services/firebase';
import { signOut } from 'firebase/auth';

export default function Navbar() {
  const { currentUser } = useAuth();
  const location = useLocation();

  const handleLogout = () => signOut(auth);

  return (
    <header className="container mx-auto px-4 py-8 flex justify-between items-center max-w-5xl">
      <Link to="/" className="text-2xl font-bold flex items-center gap-2 text-main no-underline">
        <Keyboard className="text-primary" size={28} />
        TypoWizard
      </Link>
      
      <nav className="flex gap-4">
        {currentUser ? (
          <>
            <Link to="/practice" className={`p-2 rounded-lg transition-colors ${location.pathname === '/practice' ? 'text-main' : 'text-sub hover:text-primary'}`}>
              <Keyboard size={20} />
            </Link>
            <Link to="/dashboard" className={`p-2 rounded-lg transition-colors ${location.pathname === '/dashboard' ? 'text-main' : 'text-sub hover:text-primary'}`}>
              <LayoutDashboard size={20} />
            </Link>
            <button onClick={handleLogout} className="text-sub hover:text-primary p-2 transition-colors rounded-lg hover:bg-subAlt">
              <LogOut size={20} />
            </button>
          </>
        ) : (
          <Link to="/login" className="text-sub hover:text-primary p-2 transition-colors">
            <User size={20} />
          </Link>
        )}
      </nav>
    </header>
  );
}
