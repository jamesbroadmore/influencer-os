import React, { useState } from 'react';
import { useAuth, ThemeMode, NotificationPreferences } from '../context/AuthContext';
import {
  X,
  Moon,
  Sun,
  Laptop,
  Bell,
  Shield,
  User,
  LogOut,
  LogIn,
  CheckCircle,
  AlertTriangle,
  Sparkles,
  Database,
  Building2,
  Calendar,
  DollarSign,
  FileCheck
} from 'lucide-react';
import { BusinessIdentity, TaxProfile } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  business: BusinessIdentity;
  taxProfile: TaxProfile;
  onOpenAuth: () => void;
  onRestartOnboarding: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  business,
  taxProfile,
  onOpenAuth,
  onRestartOnboarding
}) => {
  const {
    user,
    userProfile,
    theme,
    setTheme,
    notificationPreferences,
    updateNotificationPreferences,
    logOut
  } = useAuth();

  const [activeTab, setActiveTab] = useState<'theme' | 'notifications' | 'account' | 'compliance'>('theme');
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!isOpen) return null;

  const handleTogglePref = async (key: keyof NotificationPreferences) => {
    const nextValue = !notificationPreferences[key];
    await updateNotificationPreferences({ [key]: nextValue });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleThemeSelect = async (mode: ThemeMode) => {
    await setTheme(mode);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const notificationItems: {
    key: keyof NotificationPreferences;
    title: string;
    description: string;
    badge: string;
    badgeColor: string;
  }[] = [
    {
      key: 'gstThresholdWarning',
      title: 'ATO $75,000 GST Threshold Radar',
      description:
        'Trigger predictive alerts when your rolling 12-month gross turnover crosses $65,000 AUD, giving you 21 days to register for GST before statutory penalties apply under the GST Act 1999.',
      badge: 'ATO Div 23',
      badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/30'
    },
    {
      key: 'basFilingReminders',
      title: 'Quarterly BAS Lodgement Deadlines',
      description:
        'Automated countdown notifications 14, 7, and 2 days before standard ATO BAS due dates (Q1: 28 Oct, Q2: 28 Feb, Q3: 28 Apr, Q4: 28 Jul).',
      badge: 'BAS Calendar',
      badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/30'
    },
    {
      key: 'superannuationDueAlerts',
      title: '12.0% Superannuation Guarantee Due Dates',
      description:
        'Notifies you when super payments for your videographers, editors, and production contractors are due into their super clearing houses (28th of the month following each quarter end).',
      badge: '12% SG Rate',
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
    },
    {
      key: 'brandDealReminders',
      title: 'Brand Deal & Invoicing Remittances',
      description:
        'Instant alerts when commercial brand campaigns, sponsored content, or agency remittances exceed their 14-day or 30-day payment terms.',
      badge: 'Commercial',
      badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/30'
    },
    {
      key: 'weeklyFinancialDigest',
      title: 'Weekly Profit & Protected Tax Escrow Summary',
      description:
        'A Monday morning digest breaking down gross income across YouTube/OnlyFans/brand deals, platform fees claimed, and your recommended tax reserve transfer.',
      badge: 'Ledger Summary',
      badgeColor: 'bg-neutral-500/10 text-neutral-300 border-neutral-700'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-neutral-900 dark:bg-neutral-900 light:bg-white border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-800 bg-neutral-950 dark:bg-neutral-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-neutral-800 flex items-center justify-center text-neutral-300">
              <Sparkles className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">System Settings & Preferences</h2>
              <p className="text-xs text-neutral-400">
                Personalize your fleshsesh workspace, theme, notifications, and cloud identity
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {saveSuccess && (
              <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-md">
                <CheckCircle className="w-3.5 h-3.5" /> Saved
              </span>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center border-b border-neutral-800 bg-neutral-950/60 px-4 gap-2 overflow-x-auto text-xs font-medium">
          <button
            onClick={() => setActiveTab('theme')}
            className={`py-3 px-3 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'theme'
                ? 'border-emerald-500 text-emerald-400 font-semibold'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Sun className="w-4 h-4" />
            <span>UI Appearance</span>
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`py-3 px-3 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'notifications'
                ? 'border-emerald-500 text-emerald-400 font-semibold'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>Notifications & Alerts</span>
          </button>
          <button
            onClick={() => setActiveTab('account')}
            className={`py-3 px-3 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'account'
                ? 'border-emerald-500 text-emerald-400 font-semibold'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Cloud Account & Auth</span>
          </button>
          <button
            onClick={() => setActiveTab('compliance')}
            className={`py-3 px-3 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'compliance'
                ? 'border-emerald-500 text-emerald-400 font-semibold'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>ABN & Entity</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* 1. Theme Settings */}
          {activeTab === 'theme' && (
            <div className="space-y-5">
              <div>
                <h3 className="text-sm font-semibold text-white">Interface Theme Mode</h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Select how creatorledger renders across your devices. Theme preference is automatically synchronized to your user profile.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Dark Mode */}
                <button
                  type="button"
                  onClick={() => handleThemeSelect('dark')}
                  className={`p-4 rounded-xl border text-left transition-all relative cursor-pointer ${
                    theme === 'dark'
                      ? 'bg-neutral-800/90 border-emerald-500 ring-1 ring-emerald-500 shadow-lg'
                      : 'bg-neutral-950 hover:bg-neutral-800/50 border-neutral-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-700 flex items-center justify-center text-emerald-400">
                      <Moon className="w-4 h-4" />
                    </div>
                    {theme === 'dark' && (
                      <span className="w-2 h-2 rounded-full bg-emerald-400 ring-4 ring-emerald-500/20"></span>
                    )}
                  </div>
                  <div className="font-semibold text-white text-xs">Dark Studio</div>
                  <p className="text-[11px] text-neutral-400 mt-1">
                    Deep blacks, high-contrast typography, emerald highlights for video editors & creators.
                  </p>
                </button>

                {/* Light Mode */}
                <button
                  type="button"
                  onClick={() => handleThemeSelect('light')}
                  className={`p-4 rounded-xl border text-left transition-all relative cursor-pointer ${
                    theme === 'light'
                      ? 'bg-neutral-800/90 border-emerald-500 ring-1 ring-emerald-500 shadow-lg'
                      : 'bg-neutral-950 hover:bg-neutral-800/50 border-neutral-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                      <Sun className="w-4 h-4" />
                    </div>
                    {theme === 'light' && (
                      <span className="w-2 h-2 rounded-full bg-emerald-400 ring-4 ring-emerald-500/20"></span>
                    )}
                  </div>
                  <div className="font-semibold text-white text-xs">Light Professional</div>
                  <p className="text-[11px] text-neutral-400 mt-1">
                    Crisp bright paper layout ideal for daylight meetings, invoices, and CPA reviews.
                  </p>
                </button>

                {/* System Mode */}
                <button
                  type="button"
                  onClick={() => handleThemeSelect('system')}
                  className={`p-4 rounded-xl border text-left transition-all relative cursor-pointer ${
                    theme === 'system'
                      ? 'bg-neutral-800/90 border-emerald-500 ring-1 ring-emerald-500 shadow-lg'
                      : 'bg-neutral-950 hover:bg-neutral-800/50 border-neutral-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-700 flex items-center justify-center text-blue-400">
                      <Laptop className="w-4 h-4" />
                    </div>
                    {theme === 'system' && (
                      <span className="w-2 h-2 rounded-full bg-emerald-400 ring-4 ring-emerald-500/20"></span>
                    )}
                  </div>
                  <div className="font-semibold text-white text-xs">System Match</div>
                  <p className="text-[11px] text-neutral-400 mt-1">
                    Automatically mirrors your macOS, Windows, iOS, or Android operating system mode.
                  </p>
                </button>
              </div>

              {/* Theme Preview Card */}
              <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-400">Active Theme Status:</span>
                  <span className="font-mono text-emerald-400 uppercase text-[11px] font-semibold">
                    {theme} MODE ACTIVE
                  </span>
                </div>
                <div className="h-2 w-full bg-neutral-900 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 w-full"></div>
                </div>
              </div>
            </div>
          )}

          {/* 2. Notification Preferences */}
          {activeTab === 'notifications' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-white">
                  Regulatory & Financial Notification Preferences
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Configure real-time monitoring and email alerts grounded in Australian taxation deadlines and commercial milestones.
                </p>
              </div>

              <div className="space-y-3">
                {notificationItems.map(item => {
                  const isEnabled = notificationPreferences[item.key];
                  return (
                    <div
                      key={item.key}
                      className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 flex items-start justify-between gap-4 transition-all hover:border-neutral-700"
                    >
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white text-xs">{item.title}</span>
                          <span
                            className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${item.badgeColor}`}
                          >
                            {item.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-neutral-400 leading-relaxed">
                          {item.description}
                        </p>
                      </div>

                      {/* Toggle Switch */}
                      <button
                        type="button"
                        onClick={() => handleTogglePref(item.key)}
                        className={`w-11 h-6 shrink-0 rounded-full transition-colors relative focus:outline-none cursor-pointer ${
                          isEnabled ? 'bg-emerald-600' : 'bg-neutral-800'
                        }`}
                        role="switch"
                        aria-checked={isEnabled}
                      >
                        <span
                          className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform mt-1 ${
                            isEnabled ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 3. Account & Authentication */}
          {activeTab === 'account' && (
            <div className="space-y-5">
              <div>
                <h3 className="text-sm font-semibold text-white">Creator Cloud Authentication</h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Manage your authenticated session and secure cloud database connection with Firestore.
                </p>
              </div>

              {user ? (
                <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-full bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-sm">
                        {user.photoURL ? (
                          <img
                            src={user.photoURL}
                            alt="User avatar"
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          user.displayName?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div>
                        <div className="font-semibold text-white text-xs">
                          {user.displayName || 'Australian Creator'}
                        </div>
                        <div className="text-[11px] text-neutral-400">{user.email}</div>
                        <div className="text-[10px] font-mono text-emerald-400 mt-0.5">
                          UID: {user.uid.slice(0, 12)}...
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={async () => {
                        await logOut();
                      }}
                      className="px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-rose-400 hover:text-rose-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>

                  <div className="pt-3 border-t border-neutral-800/80 grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-neutral-500 block text-[10px] uppercase font-mono">
                        Database Engine:
                      </span>
                      <span className="text-neutral-300 font-mono text-[11px] flex items-center gap-1 mt-0.5">
                        <Database className="w-3.5 h-3.5 text-emerald-400" />
                        Google Firestore Enterprise
                      </span>
                    </div>
                    <div>
                      <span className="text-neutral-500 block text-[10px] uppercase font-mono">
                        Sync Integrity:
                      </span>
                      <span className="text-emerald-400 font-mono text-[11px] flex items-center gap-1 mt-0.5">
                        <CheckCircle className="w-3.5 h-3.5" />
                        Live Security Hardened
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-5 rounded-xl bg-neutral-950 border border-neutral-800 text-center space-y-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-white">
                      You are currently browsing with Local Workspace Storage
                    </h4>
                    <p className="text-[11px] text-neutral-400 max-w-md mx-auto mt-1">
                      Sign in or create an account to securely sync your Australian Business Number records, invoices, bookings, and Lex AI history across all your devices.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenAuth();
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-emerald-600/20 transition-all cursor-pointer"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Sign In or Create Account</span>
                  </button>
                </div>
              )}

              {/* Data and Storage Controls */}
              <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3">
                <h4 className="text-xs font-semibold text-white">Reset & Diagnostics</h4>
                <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="text-neutral-300 block font-medium">
                      Re-run ABN & Entity Setup Wizard
                    </span>
                    <span className="text-[11px] text-neutral-500">
                      Relaunches the step-by-step statutory business onboarding wizard.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onRestartOnboarding();
                    }}
                    className="px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 text-xs font-medium cursor-pointer"
                  >
                    Relaunch Wizard
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 4. ABN & Compliance Summary */}
          {activeTab === 'compliance' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-white">Registered Entity Profile</h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Statutory details verified against Australian Business Register (ABR) Modulus-89 criteria.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1">
                  <span className="text-[10px] font-mono text-neutral-500 uppercase">
                    Legal Business Name
                  </span>
                  <div className="font-semibold text-white text-xs truncate">
                    {business.legalName}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1">
                  <span className="text-[10px] font-mono text-neutral-500 uppercase">
                    Australian Business Number
                  </span>
                  <div className="font-semibold text-emerald-400 font-mono text-xs">
                    ABN {business.abn} (Valid Mod-89)
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1">
                  <span className="text-[10px] font-mono text-neutral-500 uppercase">
                    Entity Structure
                  </span>
                  <div className="font-semibold text-white text-xs capitalize">
                    {business.entityType.replace('_', ' ')}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1">
                  <span className="text-[10px] font-mono text-neutral-500 uppercase">
                    GST Registration
                  </span>
                  <div className="font-semibold text-emerald-400 text-xs">
                    {taxProfile.gstRegistered ? 'Active (10% Domestic Tax Invoices)' : 'Not Registered (< $75k)'}
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-neutral-950/80 border border-neutral-800/80 text-[11px] text-neutral-400 flex items-start gap-2">
                <FileCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  Section 10 of the ABN Act mandates reporting changes to your legal business identity within 28 days of any modification.
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
