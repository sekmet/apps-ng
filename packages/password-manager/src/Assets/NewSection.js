import { Modal, useInput, Input, Spacer, useToasts, Popover, Button } from '@zeit-ui/react'
import React, { useCallback, useState, useMemo, useEffect } from 'react'
import { observer } from "mobx-react"
import { useTranslation } from 'react-i18next'
import styled from "styled-components"
//import Button from '@/components/Button'
import Container from "@/components/Container"
import { Balance as BalanceQuery } from '@polkadot/react-query'
import { useStore } from "@/store"
import PushCommandButton from '@/components/PushCommandButton'

import { CONTRACT_PASSWORD_MANAGER, createVaultStore } from '../utils/VaultStore'
//import ConvertToTeeModal from './ConvertToTeeModal'
//import NativeTransferModal from './NativeTransferModal'

import {
  Link2 as LinkIcon,
  InfoFill as InfoFillIcon,
  Lock as LockIcon,
  EyeOff as EyeOffIcon,
  Send as SendIcon,
  Plus as PlusIcon
} from '@zeit-ui/react-icons'
import { useModal, useTheme } from "@zeit-ui/react"

const LeftDecorationWrapper = styled.div`
  display: flex;
  flex-flow: column nowrap;
  align-items: center;
  place-content: flex-start;
  margin: 0 36px 0 0;

  ${({ theme: { isXS } }) => isXS && `
    margin: 0 24px 0 0;
  `}
`

const LeftDecorationTop = styled.div`
  width: 2px;
  height: 24px;
  background: #040035;
`
const LeftDecorationBottom = styled.div`
  width: 2px;
  flex: 1;
  background: #040035;
`
const LeftDecorationIcon = styled.div`
  width: 24px;
  height: 24px;
  margin: 3px 0;
`

const LeftDecoration = () => {
  return <LeftDecorationWrapper>
    <LeftDecorationTop />
    <LeftDecorationIcon>
      <LockIcon color="#FFFFFF" size="24" />
    </LeftDecorationIcon>
    <LeftDecorationBottom />
  </LeftDecorationWrapper>
}

const InfoWrapper = styled.div`
  color: #FFFFFF;
  --zeit-icons-background: #24005a;
  padding: 24px 0 21px;
  flex: 1;
`
const InfoHead = styled.div`
  display: flex;
  flex-flow: row nowrap;
  align-items: flex-end;
  margin: 0 0 21px;
  ${({ theme: { isXS } }) => isXS && `
    flex-flow: column;
    align-items: flex-start;
    overflow: visible;
  `}
`
const InfoHeadMain = styled.h4`
  font-weight: 600;
  font-size: 27px;
  line-height: 32px;
  margin: 0 21px 0 0;
  ${({ theme: { isXS } }) => isXS && `
  font-size: 21px;
  line-height: 36px;
  margin: 0 11px 0 0;
`}

`
const InfoHeadDesc = styled.p`
  font-weight: normal;
  font-size: 16px;
  line-height: 19px;
  color: #000000;
  margin: 0 0 4px;

  & > svg {
    vertical-align: text-top;
    margin-right: 6px;
  }

  ${({ theme: { isXS } }) => isXS && `
    font-size: 13px;
    line-height: 16px;
  `}
`
const Balance = styled.div`
  display: flex;
  flex-direction: column;
`
const BalanceHead = styled.h5`
  color: #040035;
  opacity: 0.64;
  margin: 0;
`
const BalanceValue = styled(BalanceQuery)`
  font-weight: 600;
  font-size: 36px;
  line-height: 43px;
  color: #040035;
  text-indent: -1px;
  margin: 0;

  & .ui--FormatBalance-value > .ui--FormatBalance-postfix {
    opacity: 1;
    font-weight: inherit;
  }
`

const Info = observer(({ children }) => {
  const { account, passwordManager } = useStore()
  const { isXS } = useTheme()
  const websiteInput = useInput('')
  const emailInput = useInput('')
  const passwordInput = useInput('')
  const [websiteError, setWebsiteError] = useState(false)
  const [emailError, setEmailError] = useState(false)
  const [passwordError, setPasswordError] = useState(false)
  const { t } = useTranslation()

  const [innerDisabled, setInnerDisabled] = useState(false)

  const disabled = useMemo(() => !(
    !innerDisabled && !emailError && emailInput.state.trim().length && !passwordError && passwordInput.state.trim().length
  ), [emailError, emailInput.state, passwordError, passwordInput.state, innerDisabled])

  /**
   * Updates the counter by querying the passwords contract
   * The type definitions of `GetCount` request and response can be found at contract/passwords.rs
   */
  async function updateCredential () {
    if (!passwordManager) return
    try {
      const response = await passwordManager.queryCredential(appRuntime)
      // Print the response in the original to the console
      console.log('Response::GetCredential', response)

      if (!response.Error)
        passwordManager.setCredential(response.GetCredential.websiteInput.state.trim(), response.GetCredential.emailInput.state.trim(), response.GetCredential.passwordInput.state.trim())
      else
        setToast({text: response.Error}, 'error')  

    } catch (err) {
      setToast({text: err.message}, 'error')
    }
  }

  const clearForm = () => {
    websiteInput.reset()
    emailInput.reset()
    passwordInput.reset()
  }

  /**
   * The `increment` transaction payload object
   * It follows the command type definition of the contract (at contract/passwords.rs)
   */
  const addCredentialCommandPayload = useMemo(() => {
    //if (isNaN(website) || isNaN(password)) {
    //  return undefined
    //} else {
      return {
        SetCredential: {
          website: websiteInput.state.trim(),
          email: emailInput.state.trim(),
          password: passwordInput.state.trim()
        }
      }
    //}
  }, [websiteInput, emailInput, passwordInput])

  return <InfoWrapper>
    <InfoHead>
      <InfoHeadMain>
        New Credential
      </InfoHeadMain>
      {/*<InfoHeadDesc>
        {!isXS && <InfoFillIcon size={18} />}
        {t('These assets are visible on the chain.')}
      </InfoHeadDesc>*/}
    </InfoHead>
    <Balance>
    <section>
        <div>
          <Input
            {...websiteInput.bindings}
            placeholder={t('Website url')}
            width="100%"
            status={websiteError ? 'error' : undefined}
          />
          <Spacer y={.5} />
          <Input
            {...emailInput.bindings}
            placeholder={t('E-mail / Username')}
            width="100%"
            status={emailError ? 'error' : undefined}
          />
          <Spacer y={.5} />
          <Input.Password
            {...passwordInput.bindings}
            placeholder={t('Password')}
            width="100%"
            status={passwordError ? 'error' : undefined}
          />
        </div>
        <ButtonWrapper>
          {/**  
            * PushCommandButton is the easy way to send confidential contract txs.
            * Below it's configurated to send PasswordManager::AddCredential()
            */}
          {disabled 
          ? <Button disabled>Save</Button>
          : <PushCommandButton
              // tx arguments
              contractId={CONTRACT_PASSWORD_MANAGER}
              payload={addCredentialCommandPayload}
              onSuccessCallback={clearForm}
              // display messages
              modalTitle='New Credential'
              modalSubtitle={`Save credential for ${websiteInput.state.trim()}`}
              onSuccessMsg='Credential Saved / Tx succeeded'
              // button appearance
              buttonType='primaryLight'
              icon={PlusIcon}
              name='Save'
            />}
        </ButtonWrapper>
      </section>
    </Balance>
    {children}
  </InfoWrapper>
})

const NativeSectionWrapper = styled.div`
  width: 100%;
  background: #24005a;
  margin: 0 0 42px;
`

const NativeSectionInnerWrapper = styled.div`
  display: flex;
  flex-flow: row nowrap;
  padding: 0 36px 0 24px;
`

const ButtonWrapper = styled.div`
  margin-top: 5px;
  width: 200px;
`;

{/*const ModalButtonGroup = ({ convertToTeeModal, nativeTransferModal }) => {
  const { t } = useTranslation()

  return <Button.Group>
    <Button
      type="primaryDark"
      icon={EyeOffIcon}
      name={t('Convert to Secret PHA')}
      onClick={() => convertToTeeModal.setVisible(true)}
    />
    <Button
      type="secondaryDark"
      icon={SendIcon}
      name={t('Transfer')}
      onClick={() => nativeTransferModal.setVisible(true)}
    />
  </Button.Group>
}*/}



const NativeSection = () => {
  const { isXS } = useTheme()
  
  return <>
    <NativeSectionWrapper>
      <Container>
        <NativeSectionInnerWrapper>
          <LeftDecoration />
          <Info></Info>
          {/* <Info>
            {isXS && <ModalButtonGroup convertToTeeModal={convertToTeeModal} nativeTransferModal={nativeTransferModal} />}
          </Info>
          {!isXS && <ModalButtonGroup convertToTeeModal={convertToTeeModal} nativeTransferModal={nativeTransferModal} />}*/}
        </NativeSectionInnerWrapper>
      </Container>
    </NativeSectionWrapper>
  </>
}

export default observer(NativeSection)
