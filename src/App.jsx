import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

const Practice = lazy(() => import('./pages/Practice'));
const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));

export default function App() {
  return (
    <>
      <Navbar />
      <main className="container mx-auto px-4 py-8 flex-1 flex flex-col">
        <Suspense fallback={<div className="text-sub text-center mt-20 flex items-center justify-center gap-2"><div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>Loading Engine...</div>}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Navigate to="/practice" />} />
            <Route path="/practice" element={
              <ProtectedRoute><Practice /></ProtectedRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute><Dashboard /></ProtectedRoute>
            } />
          </Routes>
        </Suspense>
      </main>
    </>
  );
}
