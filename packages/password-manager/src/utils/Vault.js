import React, { useCallback, useMemo } from 'react'
import styled from 'styled-components'
import Assets from '../Assets'

const Vault = () => {
  return <VaultWrapper>
    <Assets />
  </VaultWrapper>
}

const VaultWrapper = styled.div`
  display: flex;
  box-sizing: border-box;
  flex-flow: column nowrap;
  min-height: 100%;
`

export default Vault
