import { reaction } from 'mobx'
import { observer } from 'mobx-react'
import React, { useEffect, useState } from 'react'
import { useStore } from '@/store'
import { createVaultStore } from './VaultStore'

const StoreInjector = (({ children }) => {
  const vaultStore = useStore()
  const [shouldRenderContent, setShouldRenderContent] = useState(false)

  useEffect(() => {
    if (!vaultStore || !vaultStore.appRuntime) {
      return
    }
    if (typeof vaultStore.vault !== 'undefined') {
      return
    }
    vaultStore.vault = createVaultStore({
      appSettings: vaultStore.settings,
      appAccount: vaultStore.account,
      appRuntime: vaultStore.appRuntime
    })
  }, [vaultStore])

  useEffect(
    () =>
      reaction(
        () => vaultStore.vault,
        () => {
          if (vaultStore.vault && !shouldRenderContent) {
            setShouldRenderContent(true)
          }
        },
        { fireImmediately: true }),
    []
  )

  return shouldRenderContent ? children : null
})

export default observer(({ children }) => {
  const { appRuntime } = useStore()

  return (
    <StoreInjector>
      {appRuntime?.channelReady && children}
    </StoreInjector>
  )
})
