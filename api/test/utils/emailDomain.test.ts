import { test } from 'node:test'
import * as assert from 'node:assert'
import { emailTypoMessage, suggestEmailCorrection } from '../../src/utils/emailDomain'
import { emailVerifiedAt, isEmailConfirmed } from '../../src/utils/emailConfirmation'
import { withNodeEnv } from '../helper'

test('suggestEmailCorrection fixes known provider typos and keeps the local part', () => {
  assert.equal(suggestEmailCorrection('ana@gmial.com'), 'ana@gmail.com')
  assert.equal(suggestEmailCorrection('ana.silva@hotmial.com'), 'ana.silva@hotmail.com')
  assert.equal(suggestEmailCorrection('ana@outlok.com'), 'ana@outlook.com')
  assert.equal(suggestEmailCorrection('ana@GMIAL.COM'), 'ana@gmail.com')
})

test('suggestEmailCorrection fixes impossible endings like .con and .com.b', () => {
  assert.equal(suggestEmailCorrection('ana@gmail.con'), 'ana@gmail.com')
  assert.equal(suggestEmailCorrection('ana@empresa.com.b'), 'ana@empresa.com.br')
  assert.equal(suggestEmailCorrection('ana@empresa.combr'), 'ana@empresa.com.br')
})

test('suggestEmailCorrection leaves valid domains alone', () => {
  for (const email of ['ana@gmail.com', 'ana@hotmail.com.br', 'ana@usp.br', 'ana@example.com', 'ana@meudominio.dev.br']) {
    assert.equal(suggestEmailCorrection(email), null, email)
  }
  assert.equal(suggestEmailCorrection('sem-arroba'), null)
})

test('emailTypoMessage is silent in development and suggests the fix elsewhere', async () => {
  assert.equal(await withNodeEnv('development', async () => emailTypoMessage('ana@gmial.com')), null)
  assert.match(await withNodeEnv(undefined, async () => emailTypoMessage('ana@gmial.com')) ?? '', /ana@gmail\.com/)
  assert.match(await withNodeEnv('production', async () => emailTypoMessage('ana@gmial.com')) ?? '', /ana@gmail\.com/)
  assert.equal(await withNodeEnv('production', async () => emailTypoMessage('ana@gmail.com')), null)
})

test('isEmailConfirmed trusts the column, and the test account only in development', async () => {
  const created = new Date('2026-01-01T00:00:00Z')
  const confirmed = { email: 'ana@example.com', email_verified_at: new Date(), created_at: created }
  const unconfirmed = { email: 'ana@example.com', email_verified_at: null, created_at: created }
  const testAccount = { email: 'teste@teste.com', email_verified_at: null, created_at: created }

  assert.equal(isEmailConfirmed(confirmed), true)
  assert.equal(isEmailConfirmed(unconfirmed), false)
  assert.equal(await withNodeEnv('development', async () => isEmailConfirmed(testAccount)), true)
  assert.equal(await withNodeEnv('production', async () => isEmailConfirmed(testAccount)), false)
  assert.equal(await withNodeEnv('development', async () => isEmailConfirmed(unconfirmed)), false)
})

test('emailVerifiedAt shows the real date, falling back to created_at only for the dev test account', async () => {
  const created = new Date('2026-01-01T00:00:00Z')
  const verified = new Date('2026-02-02T00:00:00Z')
  const testAccount = { email: 'teste@teste.com', email_verified_at: null, created_at: created }

  assert.equal(emailVerifiedAt({ email: 'ana@example.com', email_verified_at: verified, created_at: created }), verified)
  assert.equal(emailVerifiedAt({ email: 'ana@example.com', email_verified_at: null, created_at: created }), null)
  assert.equal(await withNodeEnv('development', async () => emailVerifiedAt(testAccount)), created)
  assert.equal(await withNodeEnv('production', async () => emailVerifiedAt(testAccount)), null)
})
