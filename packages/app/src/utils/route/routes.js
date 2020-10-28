import PhalaWalletPage from '@phala/wallet'
import AppSettingsPage from '@/components/SettingsPage'
import HelloWorldAppPage from '@phala/helloworld-app'
import PasswordManagerAppPage from '@phala/password-manager'

export const COMPONENT_ROUTES = {
  wallet: PhalaWalletPage,
  settings: AppSettingsPage,
  helloworldapp: HelloWorldAppPage,
  passwordsapp: PasswordManagerAppPage
}

export const MENU_ROUTES = {
  WALLET: '/wallet',
  SETTINGS: '/settings',
  HELLOWORLDAPP: '/helloworldapp',
  PASSWORDSAPP: '/passwordsapp'
}
