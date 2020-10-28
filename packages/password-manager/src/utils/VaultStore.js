import { types, flow } from 'mobx-state-tree'
import { createPersistStore } from '@/store/store'

export const CONTRACT_PASSWORD_MANAGER = 6;

const anyType = types.custom({
  isTargetType: () => true,
  getValidationMessage: () => '',
  fromSnapshot: val => val,
  toSnapshot: val => val
})

export const createVaultStore = (defaultValue = {}, options = {}) => {
  const VaultStore = types
    .model('VaultStore', {
      logins: types.array(anyType),
      error: types.maybeNull(anyType)
    })
    .views(self => ({
      get runtimeEndpointUrl () {
        return self.appSettings.phalaTeeApiUrl
      },
      get appSettings () {
        return defaultValue.appSettings
      },
      get appAccount () {
        return defaultValue.appAccount
      },
      get appRuntime () {
        return defaultValue.appRuntime
      },
      get accountId () {
        return self.appAccount.address
      },
    }))
    .actions(self => ({
      setCredential (website, email, password) {
        self.website = website;
        self.email = email;
        self.password = password
      },
      async queryPassword (runtime) {
        return await runtime.query(CONTRACT_PASSWORD_MANAGER, 'GetCredential')
      },
      updateLogins: flow(function* () {
        const res = yield self.appRuntime.query(
          CONTRACT_PASSWORD_MANAGER,
          'ListLogins',
          () => ({ availableOnly: false })
        )
        self.logins = (res?.ListLogins?.logins || []).reverse()
        self.metadata = (res?.ListLogins?.metadata || []).reverse()
      })
    }))

  //return VaultStore.create(defaultValue)
  return createPersistStore('vault', VaultStore, defaultValue)
}

