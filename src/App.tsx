import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { Toaster } from "sonner";
import { Dashboard } from "./components/Dashboard";
import { AdminPanel } from "./components/AdminPanel";
import { ProfileSetup } from "./components/ProfileSetup";
import { useState } from "react";

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      <header className="sticky top-0 z-10 bg-white/90 backdrop-blur-sm shadow-lg border-b border-orange-200">
        <div className="container mx-auto px-4 h-16 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-3xl">☕</span>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
              جريس لاونج
            </h1>
            <span className="text-2xl">🏪</span>
          </div>
          <Authenticated>
            <div className="flex items-center gap-4">
              <UserInfo />
              <SignOutButton />
            </div>
          </Authenticated>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Authenticated>
          <MainContent />
        </Authenticated>
        
        <Unauthenticated>
          <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">☕🏪</div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">مرحباً بك في جريس لاونج</h2>
              <p className="text-gray-600">نظام إدارة المبالغ اليومية</p>
            </div>
            <SignInForm />
          </div>
        </Unauthenticated>
      </main>
      
      <Toaster position="top-center" />
    </div>
  );
}

function UserInfo() {
  const user = useQuery(api.auth.loggedInUser);
  
  if (!user?.profile) return null;
  
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-gray-600">مرحباً،</span>
      <span className="font-semibold text-orange-600">
        {user.profile.username}
      </span>
      {user.profile.isAdmin && (
        <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
          👑 مدير
        </span>
      )}
    </div>
  );
}

function MainContent() {
  const user = useQuery(api.auth.loggedInUser);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'admin'>('dashboard');
  
  if (user === undefined) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!user?.profile) {
    return <ProfileSetup />;
  }

  return (
    <div>
      {user.profile.isAdmin && (
        <div className="mb-6">
          <div className="flex gap-2 bg-white rounded-lg p-1 shadow-sm border border-orange-200 w-fit">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-4 py-2 rounded-md font-medium transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'text-gray-600 hover:text-orange-600'
              }`}
            >
              📊 لوحة التحكم
            </button>
            <button
              onClick={() => setActiveTab('admin')}
              className={`px-4 py-2 rounded-md font-medium transition-all ${
                activeTab === 'admin'
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'text-gray-600 hover:text-orange-600'
              }`}
            >
              👑 إدارة المستخدمين
            </button>
          </div>
        </div>
      )}

      {activeTab === 'dashboard' ? (
        <Dashboard />
      ) : (
        <AdminPanel />
      )}
    </div>
  );
}
