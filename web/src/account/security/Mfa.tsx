import React, { useState } from 'react'
import { mfaEnroll, mfaEnable, mfaDisable, EnrollResponse } from '../../api'

export function Mfa() {
  const [enroll, setEnroll] = useState<EnrollResponse | null>(null)
  const [code, setCode] = useState('')
  const [enabled, setEnabled] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const startEnroll = async () => {
    try {
      const e = await mfaEnroll()
      setEnroll(e)
    } catch (err: any) {
      setError(err.message ?? 'Error')
    }
  }

  const enable = async () => {
    try {
      await mfaEnable(code)
      setEnabled(true)
    } catch (err: any) {
      setError(err.message ?? 'Error')
    }
  }

  const disable = async () => {
    try {
      await mfaDisable()
      setEnabled(false)
      setEnroll(null)
    } catch (err: any) {
      setError(err.message ?? 'Error')
    }
  }

  return (
    <div style={{ marginTop: '2rem' }}>
      <h3>MFA</h3>
      {error && <div style={{ color: 'crimson' }}>{error}</div>}
      {!enroll && !enabled && (
        <button onClick={startEnroll}>Enroll</button>
      )}
      {enroll && !enabled && (
        <div>
          <div>Secret: {enroll.secret}</div>
          <div>URI: {enroll.uri}</div>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Code"
            style={{ marginRight: '0.5rem' }}
          />
          <button onClick={enable}>Enable</button>
        </div>
      )}
      {enabled && <button onClick={disable}>Disable</button>}
    </div>
  )
}
