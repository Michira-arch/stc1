import React, { useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './views/Dashboard';
import BountyBoard from './views/BountyBoard';
import Marketplace from './views/Marketplace';
import Tools from './views/Tools';
import { ViewState } from './types';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.DASHBOARD);

  const renderView = () => {
    switch (currentView) {
      case ViewState.DASHBOARD:
        return <Dashboard />;
      case ViewState.BOUNTY_BOARD:
        return <BountyBoard />;
      case ViewState.MARKETPLACE:
        return <Marketplace />;
      case ViewState.TOOLS:
        return <Tools />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout currentView={currentView} setView={setCurrentView}>
      {renderView()}
    </Layout>
  );
};

export default App;