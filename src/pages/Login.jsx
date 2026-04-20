import React, { useState } from 'react';
import { UserPlus, LogIn } from 'lucide-react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '../services/firebase';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { currentUser } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  if (currentUser) {
    return <Navigate to="/practice" />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(cred.user, { displayName: name });
      }
    } catch (err) {
      setError(err.message.replace('Firebase:', '').trim());
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center -mt-20">
      <div className="w-full max-w-md p-8 bg-subAlt/20 rounded-xl border border-subAlt/50">
        <h2 className="text-2xl mb-6 flex items-center gap-2 text-sub">
          {isLogin ? <LogIn size={24} /> : <UserPlus size={24} />}
          {isLogin ? 'login' : 'register'}
        </h2>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {!isLogin && (
            <input 
              type="text" 
              placeholder="username" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              required 
              className="bg-transparent border-0 border-b-2 border-sub text-main font-mono text-lg py-2 focus:ring-0 focus:outline-none focus:border-primary transition-colors"
            />
          )}
          <input 
            type="email" 
            placeholder="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required 
            className="bg-transparent border-0 border-b-2 border-sub text-main font-mono text-lg py-2 focus:ring-0 focus:outline-none focus:border-primary transition-colors"
          />
          <input 
            type="password" 
            placeholder="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required 
            className="bg-transparent border-0 border-b-2 border-sub text-main font-mono text-lg py-2 focus:ring-0 focus:outline-none focus:border-primary transition-colors"
          />
          
          <div className="min-h-[1.5rem] mt-2 text-error text-sm">{error}</div>
          
          <button type="submit" className="mt-4 border-2 border-sub text-sub hover:bg-primary hover:text-bg hover:border-primary p-3 rounded-lg flex items-center justify-center gap-2 transition-all font-bold text-lg">
            {isLogin ? <LogIn size={20} /> : <UserPlus size={20} />}
            {isLogin ? 'sign in' : 'sign up'}
          </button>
        </form>
        
        <p className="mt-6 text-center text-sub hover:text-main cursor-pointer transition-colors" onClick={() => { setIsLogin(!isLogin); setError(''); }}>
          {isLogin ? "don't have an account? register" : "already have an account? login"}
        </p>
      </div>
    </div>
  );
}
