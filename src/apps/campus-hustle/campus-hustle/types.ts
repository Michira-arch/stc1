import React from 'react';

export enum ViewState {
  DASHBOARD = 'DASHBOARD',
  BOUNTY_BOARD = 'BOUNTY_BOARD',
  MARKETPLACE = 'MARKETPLACE',
  TOOLS = 'TOOLS',
  PROFILE = 'PROFILE'
}

export interface User {
  id: string;
  name: string;
  avatar: string;
  university: string;
  year: string;
  rating: number;
}

export interface Bounty {
  id: string;
  title: string;
  description: string;
  price: number;
  category: 'Service' | 'Errand' | 'Tech' | 'Academic';
  status: 'Open' | 'In Progress' | 'Completed';
  author: User;
  postedAt: string;
}

export interface MarketItem {
  id: string;
  title: string;
  type: 'Digital' | 'Physical' | 'Rental';
  price: number;
  image: string;
  author: User;
  description: string;
}

export interface Tool {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
}