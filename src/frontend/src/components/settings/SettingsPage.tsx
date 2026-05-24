import AppearanceSettings from './AppearanceSettings'

export default function SettingsPage() {
  return (
    <div className="w-full max-w-sm max-h-[calc(100vh-9rem)] overflow-y-auto rounded-xl bg-background/70 backdrop-blur-md p-8 shadow-lg">
      <AppearanceSettings />
    </div>
  )
}
