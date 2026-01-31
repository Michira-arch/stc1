import React from 'react';
import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import '@marketplace/src/globals.css';
import Landing from '@marketplace/src/pages/Landing';
import LoginPage from '@marketplace/src/pages/Login';
import SignupPage from '@marketplace/src/pages/Signup';
import Home from '@marketplace/src/pages/Home';
import CreatePost from '@marketplace/src/pages/CreatePost';
import Requests from '@marketplace/src/pages/Requests';
import CreateRequest from '@marketplace/src/pages/CreateRequest';
import Messages from '@marketplace/src/pages/Messages';
import Notifications from '@marketplace/src/pages/Notifications';
import Profile from '@marketplace/src/pages/Profile';
import UpdateProfile from '@marketplace/src/pages/UpdateProfile';
import Chat from '@marketplace/src/pages/Chat';
import DashboardLayout from '@marketplace/src/layouts/DashboardLayout';
import ResourceDetails from '@marketplace/src/pages/ResourceDetails';
import UserPostDetails from '@marketplace/src/pages/UserPostDetails';
import { Toaster } from 'sonner';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        <Route element={<DashboardLayout />}>
          <Route path="/home" element={<Home />} />
          <Route path="/home/:id" element={<ResourceDetails />} />
          <Route path="/post" element={<CreatePost />} />
          <Route path="/requests" element={<Requests />} />
          <Route path="/requests/create" element={<CreateRequest />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/messages/:id" element={<Chat />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/edit" element={<UpdateProfile />} />
          <Route path="/profile/posts/:id" element={<UserPostDetails />} />
        </Route>

        <Route path="/admin/dashboard" element={<div>Admin Dashboard (To be implemented)</div>} />
      </Routes>
      <Toaster visibleToasts={10} richColors position="top-right" />
    </Router>
  );
}
