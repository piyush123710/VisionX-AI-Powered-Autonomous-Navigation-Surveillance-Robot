import React, { useState } from 'react';
import { RobotProvider } from './context/RobotContext';
import { Header } from './components/layout/Header';
import { NavigationSidebar } from './components/layout/NavigationSidebar';
import { MobileBottomNav } from './components/layout/MobileBottomNav';

// Views
import { LandingPage } from './components/views/LandingPage';
import { DashboardView } from './components/views/DashboardView';
import { NavigationMapView } from './components/views/NavigationMapView';
import { AiVisionView } from './components/views/AiVisionView';
import { DecisionCenterView } from './components/views/DecisionCenterView';
import { RobotControlView } from './components/views/RobotControlView';
import { SensorsView } from './components/views/SensorsView';
import { SystemHealthView } from './components/views/SystemHealthView';
import { MissionControlView } from './components/views/MissionControlView';
import { AnalyticsView } from './components/views/AnalyticsView';
import { MissionReplayView } from './components/views/MissionReplayView';
import { ArchitectureView } from './components/views/ArchitectureView';
import { AlertsView } from './components/views/AlertsView';
import { SettingsView } from './components/views/SettingsView';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('landing');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  const handleSelectTab = (tab: string) => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
  };

  const renderActiveView = () => {
    switch (activeTab) {
      case 'landing':
        return <LandingPage onNavigate={handleSelectTab} />;
      case 'dashboard':
        return <DashboardView onNavigate={handleSelectTab} />;
      case 'navigation':
        return <NavigationMapView />;
      case 'vision':
        return <AiVisionView />;
      case 'decision':
        return <DecisionCenterView />;
      case 'control':
        return <RobotControlView />;
      case 'sensors':
        return <SensorsView />;
      case 'health':
        return <SystemHealthView />;
      case 'missions':
        return <MissionControlView />;
      case 'analytics':
        return <AnalyticsView />;
      case 'replay':
        return <MissionReplayView />;
      case 'architecture':
        return <ArchitectureView />;
      case 'alerts':
        return <AlertsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView onNavigate={handleSelectTab} />;
    }
  };

  return (
    <RobotProvider>
      <div className="flex h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 font-sans select-none">
        {/* Navigation Sidebar (Persistent on Laptop/Desktop, Slide-out Drawer on Mobile) */}
        <NavigationSidebar 
          currentTab={activeTab} 
          onSelectTab={handleSelectTab}
          mobileOpen={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
        />

        {/* Right / Main Content Area */}
        <div className="flex flex-col flex-1 h-full min-w-0 overflow-hidden relative">
          {/* Top Status & Telemetry Header */}
          <Header 
            currentTab={activeTab} 
            onSelectTab={handleSelectTab}
            onToggleMobileMenu={() => setIsMobileMenuOpen(prev => !prev)}
          />

          {/* Main Active Page View with mobile bottom padding */}
          <main className="flex-1 flex overflow-hidden relative pb-16 lg:pb-0">
            {renderActiveView()}
          </main>

          {/* Mobile Bottom Quick Navigation Bar (Visible only on mobile/tablet screens < lg) */}
          <MobileBottomNav 
            currentTab={activeTab}
            onSelectTab={handleSelectTab}
            onToggleMenu={() => setIsMobileMenuOpen(true)}
          />
        </div>
      </div>
    </RobotProvider>
  );
}
