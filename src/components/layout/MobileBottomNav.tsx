import React from 'react';
import { 
  Home, 
  LayoutDashboard, 
  Compass, 
  Gamepad2, 
  Menu
} from 'lucide-react';

interface MobileBottomNavProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onToggleMenu: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentTab,
  onSelectTab,
  onToggleMenu,
}) => {
  const quickTabs = [
    { id: 'landing', label: 'Overview', icon: Home },
    { id: 'dashboard', label: 'Live', icon: LayoutDashboard },
    { id: 'navigation', label: 'SLAM', icon: Compass },
    { id: 'control', label: 'Drive', icon: Gamepad2 }
  ];

  return (
    <nav 
      aria-label="Mobile Navigation"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-lg border-t border-slate-800/90 px-2 py-1 pb-[max(0.375rem,env(safe-area-inset-bottom))] flex items-center justify-around shadow-2xl"
    >
      {quickTabs.map(item => {
        const Icon = item.icon;
        const isActive = currentTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onSelectTab(item.id)}
            className={`flex flex-col items-center justify-center flex-1 py-1 px-1.5 rounded-lg transition-all ${
              isActive
                ? 'text-cyan-400 font-bold'
                : 'text-slate-400 hover:text-slate-200 active:scale-95'
            }`}
          >
            <div className={`p-1 rounded-md transition-colors ${
              isActive ? 'bg-cyan-500/20 text-cyan-400' : ''
            }`}>
              <Icon className="w-4 h-4" />
            </div>
            <span className="text-[10px] tracking-tight mt-0.5">{item.label}</span>
          </button>
        );
      })}

      {/* Menu / All Modules Toggle */}
      <button
        onClick={onToggleMenu}
        className="flex flex-col items-center justify-center flex-1 py-1 px-1.5 rounded-lg text-slate-400 hover:text-cyan-400 active:scale-95 transition-all"
        title="Open all modules"
      >
        <div className="p-1 rounded-md bg-slate-800 text-slate-300">
          <Menu className="w-4 h-4" />
        </div>
        <span className="text-[10px] tracking-tight mt-0.5">Modules</span>
      </button>
    </nav>
  );
};
