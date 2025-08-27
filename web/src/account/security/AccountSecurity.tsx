import React from 'react'
import { Sessions } from './Sessions'
import { Mfa } from './Mfa'

export default function AccountSecurity() {
  return (
    <div>
      <Sessions />
      <Mfa />
    </div>
  )
}
