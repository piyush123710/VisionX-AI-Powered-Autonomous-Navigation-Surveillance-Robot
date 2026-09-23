import React from 'react';
import { 
  Home, 
  LayoutDashboard, 
  Compass, 
  Eye, 
  BrainCircuit, 
  Gamepad2, 
  Radio, 
  ActivitySquare, 
  Bell, 
  ScrollText, 
  BarChart3, 
  Film, 
  Settings, 
  Network,
  X,
  Bot
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const NavigationSidebar: React.FC<SidebarProps> = ({ 
  currentTab, 
  onSelectTab,
  mobileOpen = false,
  onCloseMobile
}) => {
  const navItems = [
    { id: 'landing', label: 'Overview & Specs', icon: Home, badge: 'Home' },
    { id: 'dashboard', label: 'Live Dashboard', icon: LayoutDashboard, badge: 'Realtime' },
    { id: 'navigation', label: 'Autonomous SLAM', icon: Compass, badge: 'Nav2' },
    { id: 'vision', label: 'AI Vision & VLM', icon: Eye, badge: 'YOLOv8' },
    { id: 'decision', label: 'AI Decision Center', icon: BrainCircuit, badge: 'Pipeline' },
    { id: 'control', label: 'Robot Teleoperation', icon: Gamepad2, badge: 'WASD' },
    { id: 'sensors', label: 'Sensors & Hardware', icon: Radio, badge: 'LiDAR' },
    { id: 'health', label: 'System Health', icon: ActivitySquare, badge: 'Diagnostics' },
    { id: 'alerts', label: 'Alerts & Events', icon: Bell, badge: 'Log' },
    { id: 'missions', label: 'Mission Control', icon: ScrollText, badge: 'Queue' },
    { id: 'analytics', label: 'Fleet Analytics', icon: BarChart3, badge: 'Metrics' },
    { id: 'replay', label: 'Mission Replay', icon: Film, badge: 'Timeline' },
    { id: 'architecture', label: 'ROS 2 Architecture', icon: Network, badge: 'Stack' },
    { id: 'settings', label: 'System Settings', icon: Settings, badge: 'Config' }
  ];

  const handleItemClick = (id: string) => {
    onSelectTab(id);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const navContent = (
    <div className="flex flex-col h-full select-none">
      {/* Category header */}
      <div className="p-3 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bot className="w-4 h-4 text-cyan-400" />
          <p className="text-[10px] font-mono uppercase tracking-wider text-slate-300 font-bold">
            Control Center Modules
          </p>
        </div>
        {/* Mobile close button */}
        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="Close menu"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Nav List */}
      <nav className="flex-1 overflow-y-auto p-2 space-y-1">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleItemClick(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-600/30 to-blue-600/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/70 border border-transparent active:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span className="truncate">{item.label}</span>
              </div>
              <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                isActive ? 'bg-cyan-900/60 text-cyan-200' : 'bg-slate-800 text-slate-400'
              }`}>
                {item.badge}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/40 text-[11px] font-mono text-slate-400">
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span>ROS 2 Humble</span>
          <span className="text-emerald-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            DDS Ready
          </span>
        </div>
        <div className="flex items-center justify-between text-[10px] text-slate-400">
          <span>Inference: TensorRT</span>
          <span className="text-cyan-400">14.2ms / 70 FPS</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* 1. Desktop & Laptop Sidebar (Persistent) */}
      <aside className="hidden lg:flex w-64 bg-slate-900/95 border-r border-slate-800 flex-col shrink-0 h-[calc(100vh-53px)]">
        {navContent}
      </aside>

      {/* 2. Mobile & Tablet Drawer Modal (Overlay) */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
            onClick={onCloseMobile}
          />
          {/* Drawer content */}
          <aside className="relative w-72 max-w-[85vw] bg-slate-900 border-r border-slate-800 h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200">
            {navContent}
          </aside>
        </div>
      )}
    </>
  );
};
