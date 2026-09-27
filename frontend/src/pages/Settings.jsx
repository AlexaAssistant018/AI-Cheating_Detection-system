import { useState } from 'react'
import { FiBell, FiShield, FiMonitor, FiSave, FiCheck } from 'react-icons/fi'
import { motion } from 'framer-motion'
import { useTheme } from '../context/ThemeContext'

const Settings = () => {
  const { theme, toggleTheme, isDark } = useTheme()
  const [saved, setSaved] = useState(false)
  const [settings, setSettings] = useState({
    // Detection Settings
    detectionInterval: 3,
    alertThreshold: 3,
    autoTerminate: false,
    
    // Notification Settings
    emailNotifications: true,
    soundAlerts: true,
    desktopNotifications: false,
    
    // Security Settings
    sessionTimeout: 30,
    requireReauth: false,
    twoFactorAuth: false,
  })

  const handleSave = () => {
    // Save settings logic here
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const handleChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const SettingSection = ({ icon: Icon, title, children }) => (
    <div className="bg-white dark:bg-dark-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-primary-50 dark:bg-primary-900/20">
          <Icon className="text-xl text-primary-600 dark:text-primary-400" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h2>
      </div>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  )

  const SettingRow = ({ label, description, children }) => (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800 last:border-0">
      <div className="flex-1">
        <p className="font-medium text-gray-900 dark:text-white">{label}</p>
        {description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{description}</p>
        )}
      </div>
      <div className="ml-4">
        {children}
      </div>
    </div>
  )

  const Toggle = ({ checked, onChange }) => (
    <button
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        checked ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-700'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Settings</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your system preferences</p>
        </div>
        <button
          onClick={handleSave}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
            saved
              ? 'bg-green-600 text-white'
              : 'bg-primary-600 hover:bg-primary-700 text-white'
          }`}
        >
          {saved ? (
            <>
              <FiCheck />
              Saved!
            </>
          ) : (
            <>
              <FiSave />
              Save Changes
            </>
          )}
        </button>
      </div>

      {/* Appearance */}
      <SettingSection icon={FiMonitor} title="Appearance">
        <SettingRow
          label="Theme"
          description="Choose your preferred color scheme"
        >
          <div className="flex gap-2">
            <button
              onClick={() => !isDark && toggleTheme()}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                !isDark
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
              }`}
            >
              Light
            </button>
            <button
              onClick={() => isDark && toggleTheme()}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                isDark
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
              }`}
            >
              Dark
            </button>
          </div>
        </SettingRow>
      </SettingSection>

      {/* Detection Settings */}
      <SettingSection icon={FiMonitor} title="Detection Settings">
        <SettingRow
          label="Detection Interval"
          description="How often to analyze frames (in seconds)"
        >
          <select
            value={settings.detectionInterval}
            onChange={(e) => handleChange('detectionInterval', Number(e.target.value))}
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-dark-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value={1}>1 second</option>
            <option value={2}>2 seconds</option>
            <option value={3}>3 seconds</option>
            <option value={5}>5 seconds</option>
          </select>
        </SettingRow>

        <SettingRow
          label="Alert Threshold"
          description="Number of violations before triggering alert"
        >
          <input
            type="number"
            min="1"
            max="10"
            value={settings.alertThreshold}
            onChange={(e) => handleChange('alertThreshold', Number(e.target.value))}
            className="w-20 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-dark-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </SettingRow>

        <SettingRow
          label="Auto-Terminate Session"
          description="Automatically end session after threshold"
        >
          <Toggle
            checked={settings.autoTerminate}
            onChange={(val) => handleChange('autoTerminate', val)}
          />
        </SettingRow>
      </SettingSection>

      {/* Notification Settings */}
      <SettingSection icon={FiBell} title="Notifications">
        <SettingRow
          label="Email Notifications"
          description="Receive alerts via email"
        >
          <Toggle
            checked={settings.emailNotifications}
            onChange={(val) => handleChange('emailNotifications', val)}
          />
        </SettingRow>

        <SettingRow
          label="Sound Alerts"
          description="Play sound when violations detected"
        >
          <Toggle
            checked={settings.soundAlerts}
            onChange={(val) => handleChange('soundAlerts', val)}
          />
        </SettingRow>

        <SettingRow
          label="Desktop Notifications"
          description="Show browser notifications"
        >
          <Toggle
            checked={settings.desktopNotifications}
            onChange={(val) => handleChange('desktopNotifications', val)}
          />
        </SettingRow>
      </SettingSection>

      {/* Security Settings */}
      <SettingSection icon={FiShield} title="Security">
        <SettingRow
          label="Session Timeout"
          description="Auto-logout after inactivity (minutes)"
        >
          <select
            value={settings.sessionTimeout}
            onChange={(e) => handleChange('sessionTimeout', Number(e.target.value))}
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-dark-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value={15}>15 minutes</option>
            <option value={30}>30 minutes</option>
            <option value={60}>1 hour</option>
            <option value={120}>2 hours</option>
          </select>
        </SettingRow>

        <SettingRow
          label="Require Re-authentication"
          description="Ask for password on sensitive actions"
        >
          <Toggle
            checked={settings.requireReauth}
            onChange={(val) => handleChange('requireReauth', val)}
          />
        </SettingRow>

        <SettingRow
          label="Two-Factor Authentication"
          description="Add extra security layer"
        >
          <Toggle
            checked={settings.twoFactorAuth}
            onChange={(val) => handleChange('twoFactorAuth', val)}
          />
        </SettingRow>
      </SettingSection>

      {/* Save Button (Mobile) */}
      <div className="md:hidden">
        <button
          onClick={handleSave}
          className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
            saved
              ? 'bg-green-600 text-white'
              : 'bg-primary-600 hover:bg-primary-700 text-white'
          }`}
        >
          {saved ? (
            <>
              <FiCheck />
              Saved!
            </>
          ) : (
            <>
              <FiSave />
              Save Changes
            </>
          )}
        </button>
      </div>
    </div>
  )
}

export default Settings
