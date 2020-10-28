import Button from '@/components/Button'
import Container from '@/components/Container'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import { Spacer, Checkbox, Loading, useModal, useTheme } from '@zeit-ui/react'
import DestroyButton from './DestroyButton'
import { hexToSs58 } from '@phala/runtime'
import { observer } from 'mobx-react'
import { useStore } from '@/store'

import {
    InfoFill as InfoFillIcon,
    Eye as EyeIcon,
    Lock as LockIcon,
    Shield as ShieldIcon,
    Send as SendIcon,
    Target as TargetIcon,
    PlusSquare as PlusSquareIcon
  } from '@zeit-ui/react-icons'

import { useEffect, useState, useMemo } from 'react'


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
    background: #323232;
  `
  const LeftDecorationBottom = styled.div`
    width: 2px;
    flex: 1;
    background: #323232;
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
        <LockIcon color="#323232" size="24" />
      </LeftDecorationIcon>
      <LeftDecorationBottom />
    </LeftDecorationWrapper>
  }
  
  const InfoWrapper = styled.div`
    color: #040035;
    --zeit-icons-background: #73FF9A;
    padding: 24px 0 21px;
    flex: 1;
  `
  const InfoHead = styled.div`
    display: flex;
    flex-flow: row nowrap;
    align-items: flex-end;
    margin: 0 0 21px;
  `
  const InfoHeadMain = styled.h4`
    font-weight: 600;
    font-size: 21px;
    line-height: 26px;
    margin: 0 21px 0 0;
    ${({ theme: { isXS } }) => isXS && `
      font-size: 14px;
      line-height: 17px;
      margin: 0 11px 0 0;
    `}    
    color: #FF004D;
    `
  const Userlogin = styled.div`
  display: flex;
  flex-direction: column;
  `
  const UserloginHead = styled.h5`
    color: #9B9B9B;
    opacity: 0.64;
    margin: 0;
  `
  
  const UserloginValue = styled.div`
    font-weight: 600;
    font-size: 16px;
    line-height: 19px;
    color: #F2F2F2;
    text-indent: -1px;
    margin: 0;
    white-space: break-spaces;
    word-break: break-word;
  `


  const Info = ({ item, isRevealed, children }) => {
    const secretValue = useMemo(() => item.password , [item])
    const { t } = useTranslation()

    return <InfoWrapper>
      <InfoHead>
        <InfoHeadMain>
          <a href={item.website} target="_blank">{item.website}</a>
        </InfoHeadMain>
      </InfoHead>
      {isRevealed ? <Userlogin>
        <UserloginHead>E-mail / Username</UserloginHead>
        <UserloginValue>{item.email}</UserloginValue>
        <Spacer y={0.3}/>
        <UserloginHead>Password</UserloginHead>
        <UserloginValue>{secretValue}</UserloginValue>
      </Userlogin> : ''}      
      {children}
    </InfoWrapper>
  }

  const SecretBlockWrapper = styled.div`
  width: 100%;
  margin: 0;
  display: flex;
  flex-flow: row nowrap;
  padding: 0 36px 0 24px;
  box-shadow: 0 0 0 2px #323232 inset;
  box-sizing: border-box;
  border-radius: 9px;
  `
  
  const SecretBlock = ({ children, ...props }) => {
    return <Container>
      <SecretBlockWrapper {...props}>
        {children}
      </SecretBlockWrapper>
    </Container>
  }


    const LoginBlock = styled(SecretBlock)`
    margin: 0 0 18px 0;
    cursor: default;
  `
  
  const LoginItemButtonGroup = ({ isOwner, item , isRevealed, setRevealed }) => {
    const { t } = useTranslation()

    return <Button.Group>
      {isRevealed 
      ?
      <Button
        type="secondaryLight"
        icon={ShieldIcon}
        name={t('Protect')}
        onClick={() => setRevealed(false)}
      />      
      : 
      <Button
        type="secondaryLight"
        icon={EyeIcon}
        name={t('Reveal')}
        onClick={() => setRevealed(true)}
      /> }
      {isOwner && <DestroyButton {...item} />}
    </Button.Group>
  }
  
  const LoginItem = observer(({ itemIndex }) => {
    const {
      vault,
      account: { address }
    } = useStore()
  
    const { isXS } = useTheme()

    const [isRevealed, setRevealed] = useState(false)

    const item = vault.logins[itemIndex]
    const ownerAddress = useMemo(() => hexToSs58('0x' + item.metadata.owner), [item.metadata.owner])
    const isOwner = useMemo(() => (ownerAddress === address), [ownerAddress,address])

    const loginRevealed = useMemo(() => isRevealed, [isRevealed])

    if (!isOwner) { return null }
  
    return <>
      <LoginBlock>
        <LeftDecoration />
        <Info item={item} isRevealed={isRevealed}>
          {isXS && <LoginItemButtonGroup isOwner={isOwner} isRevealed={isRevealed} setRevealed={setRevealed} item={item} />}
        </Info>
        {!isXS && <LoginItemButtonGroup isOwner={isOwner} isRevealed={isRevealed} setRevealed={setRevealed} item={item} />}
      </LoginBlock>
    </>
  })
  
  const Logins = observer(() => {
    const { vault } = useStore()
  
    useEffect(() => {
        vault.updateLogins()
  
      const interval = setInterval(() => {
        try {
            vault.updateLogins()
        } catch (e) {
          console.warn(e)
        }
      }, 5000)
  
      return () => clearInterval(interval)
    }, [vault])


    return vault.logins
      ? vault.logins.map((item, index) => (
        <LoginItem key={`Logins-${item.id}`} itemIndex={index} />
      ))
      : <Loading size="large" />
  })

  export default () => {
    return <>
      <Logins />
    </>
  }