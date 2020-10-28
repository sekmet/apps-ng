import React, { useEffect, useState, useMemo } from 'react'
import styled from "styled-components"
import { observer } from 'mobx-react'
import { Button, Input, Spacer, useInput, useToasts } from '@zeit-ui/react'
import { Plus as PlusIcon } from '@zeit-ui/react-icons'

import { useStore } from "@/store"
import Container from '@/components/Container'
import Vault from './utils/Vault'
import VaultLoader from './utils/VaultLoader'
import UnlockRequired from '@/components/accounts/UnlockRequired'
import PushCommandButton from '@/components/PushCommandButton'

import { CONTRACT_PASSWORD_MANAGER, createVaultStore } from './utils/VaultStore'
import { reaction } from 'mobx'

//import Assets from './Assets'


const PasswdWrapper = styled.div`
  display: flex;
  box-sizing: border-box;
  flex-flow: column nowrap;
  min-height: 100%;`

const HeaderSectionWrapper = styled.div`
  display: flex;
  flex-flow: row nowrap;
  align-items: flex-end;
  place-content: space-between;
  padding: 21px 36px 36px;
  ${({ theme: { isXS } }) => isXS && `
    flex-flow: column nowrap;
    align-items: flex-start;
    place-content: space-between;
  `}
`

const Header = styled.h2`
  font-weight: 600;
  font-size: 42px;
  line-height: 50px;
  font-feature-settings: 'ss01' on, 'ss05' on;
  margin: 0;
`

const AccountLine = styled.p`
  font-size: 15px;
  line-height: 18px;
  font-weight: normal;
  letter-spacing: 0.05em;
  font-feature-settings: 'ss01' on, 'ss05' on;
  color: #9B9B9B;
  margin: 0 0 6px;
  max-width: 100%;
  word-break: break-all;
`

const ButtonWrapper = styled.div`
  margin-top: 5px;
  width: 200px;
`;

/**
 * Header of the PasswordManager app page
 */
const AppHeader = () => {
  const { account } = useStore()
return (
  <Container>
    <HeaderSectionWrapper>
      <Header>Password Manager!</Header>
      <AccountLine>{account.address}</AccountLine>
    </HeaderSectionWrapper>
  </Container>
)
}
/**
 * Body of the PasswordManager app page
 */
const AppBody = observer(() => {
  const { appRuntime, passwordManager } = useStore();
  const [, setToast] = useToasts()

  return (
    <Container>
      <PasswdWrapper>
      <VaultLoader>
        <Vault />
      </VaultLoader>
      </PasswdWrapper>

      <Spacer y={3}/>

      <section>
        <div>PRuntime: {appRuntime ? 'yes' : 'no'}</div>
        <div>PRuntime ping: {appRuntime.latency || '+∞'}</div>
        <div>PRuntime connected: {appRuntime?.channelReady ? 'yes' : 'no'}</div>
      </section>
      <Spacer y={1}/>

    </Container>
  )
})

/**
 * Injects the mobx store to the global state once initialized
 */
const StoreInjector = observer(({ children }) => {
  const appStore = useStore()
  const [shouldRenderContent, setShouldRenderContent] = useState(false)

  useEffect(() => {
    if (!appStore || !appStore.appRuntime) return
    if (typeof appStore.passwordManager !== 'undefined') return
    appStore.passwordManager = createVaultStore({})
  }, [appStore])

  useEffect(() => reaction(
    () => appStore.passwordManager,
    () => {
      if (appStore.passwordManager && !shouldRenderContent) {
        setShouldRenderContent(true)
      }
    },
    { fireImmediately: true })
  )

  return shouldRenderContent && children;
})

export default () => (
  <UnlockRequired>
    <StoreInjector>
      <AppBody />
    </StoreInjector>
  </UnlockRequired>
)
