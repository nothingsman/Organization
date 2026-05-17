import React, { useState } from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import { motion, AnimatePresence } from 'motion/react';

interface LayoutProps {
  children: React.ReactNode;
  title: string;
  onAction?: () => void;
  actionLabel?: string;
  showSearch?: boolean;
}

export default function Layout({ 
  children, 
  title, 
  onAction, 
  actionLabel, 
  showSearch = true 
}: LayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex bg-surface min-h-screen">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-64 shrink-0">
        <Sidebar />
      </div>

      {/* Mobile Sidebar overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] lg:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-72 bg-[#F8FAFC] z-[101] shadow-2xl lg:hidden flex flex-col"
            >
              <Sidebar onNavClick={() => setIsMobileMenuOpen(false)} isMobile />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Content Area */}
      <main className="flex-1 min-w-0 flex flex-col">
        <TopBar 
          title={title}
          onAction={onAction}
          actionLabel={actionLabel}
          showSearch={showSearch}
          onMenuClick={() => setIsMobileMenuOpen(true)}
        />
        <div className="flex-1">
          {children}
        </div>
      </main>
    </div>
  );
}
