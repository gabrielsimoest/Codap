import { test } from 'node:test'
import * as assert from 'node:assert'
import { randomUUID } from 'node:crypto'
import { build, useDevelopmentEnv } from '../../helper'

type App = Awaited<ReturnType<typeof build>>

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/

/**
 * Idioma descartável, com limpeza registrada: os testes rodam contra o NeonDB
 * real, e publicar em `pt`/`en` sujaria o que o app consome (mesma regra de
 * `content-version`).
 */
async function scratchLocale (app: App, t: { after: (fn: () => unknown) => void }) {
  // `locales.locale` é VarChar(8): o código precisa caber nisso.
  const code = `t${randomUUID().slice(0, 6)}`
  const locale = await app.prisma.locales.create({ data: { locale: code, name: 'Teste' } })

  t.after(async () => {
    await app.prisma.app_version.deleteMany({ where: { locale_id: locale.id } })
    await app.prisma.locales.deleteMany({ where: { id: locale.id } })
  })

  return locale
}

test('GET /app-version devolve a mais recente de cada idioma', async (t) => {
  const app = await build(t)
  const locale = await scratchLocale(app, t)

  await app.prisma.app_version.create({
    data: { locale_id: locale.id, version: '1.0.0', changelog: 'antiga', released_at: new Date() }
  })
  await app.prisma.app_version.create({
    data: { locale_id: locale.id, version: '1.0.10', changelog: 'atual', need_update: true, released_at: new Date() }
  })

  const res = await app.inject({ url: '/app-version' })
  assert.equal(res.statusCode, 200)

  const found = JSON.parse(res.payload).filter((v: { locale: string }) => v.locale === locale.locale)
  assert.equal(found.length, 1, 'só a versão vigente do idioma deve aparecer')
  assert.equal(found[0].version, '1.0.10', 'cabe no VarChar(20): "1.0.10" estourava o VarChar(5) antigo')
  assert.equal(found[0].changelog, 'atual')
  assert.equal(found[0].needUpdate, true)
  assert.match(found[0].releasedAt, DATE_ONLY)
})

test('GET /app-version?locale= devolve o histórico do idioma, da mais nova para a mais antiga', async (t) => {
  const app = await build(t)
  const locale = await scratchLocale(app, t)

  for (const version of ['1.0.0', '1.1.0', '1.2.0']) {
    await app.prisma.app_version.create({
      data: { locale_id: locale.id, version, changelog: `v${version}`, released_at: new Date() }
    })
  }

  const res = await app.inject({ url: `/app-version?locale=${locale.locale}` })
  assert.equal(res.statusCode, 200)
  const body = JSON.parse(res.payload)
  assert.deepEqual(body.map((v: { version: string }) => v.version), ['1.2.0', '1.1.0', '1.0.0'])
  assert.equal(body[0].needUpdate, false, 'sem need_update gravado, a versão é só recomendada')

  const limited = await app.inject({ url: `/app-version?locale=${locale.locale}&limit=2` })
  assert.equal(JSON.parse(limited.payload).length, 2)
})

test('GET /app-version de um idioma sem publicação devolve lista vazia, não 404', async (t) => {
  const app = await build(t)
  const locale = await scratchLocale(app, t)

  const res = await app.inject({ url: `/app-version?locale=${locale.locale}` })
  assert.equal(res.statusCode, 200)
  assert.deepEqual(JSON.parse(res.payload), [])
})

test('GET /app-version recusa um limit fora do intervalo com 400', async (t) => {
  const app = await build(t)
  const res = await app.inject({ url: '/app-version?locale=pt&limit=500' })
  assert.equal(res.statusCode, 400)
})

test('GET /app-version continua registrado fora de desenvolvimento', async (t) => {
  const previousEnv = process.env.NODE_ENV
  process.env.NODE_ENV = 'production'
  t.after(() => { process.env.NODE_ENV = previousEnv })

  const app = await build(t)

  // É o app em produção que consome esta rota; só a publicação é de desenvolvimento.
  const res = await app.inject({ url: '/app-version' })
  assert.equal(res.statusCode, 200)

  const publish = await app.inject({
    method: 'POST',
    url: '/app-version',
    payload: { version: '1.0.0', changelogs: [{ locale: 'pt', changelog: 'x' }] }
  })
  assert.equal(publish.statusCode, 404, 'a publicação não existe em produção')
})

test('POST /app-version publica uma linha por idioma, numa transação só', async (t) => {
  useDevelopmentEnv(t)
  const app = await build(t)
  const a = await scratchLocale(app, t)
  const b = await scratchLocale(app, t)

  const res = await app.inject({
    method: 'POST',
    url: '/app-version',
    payload: {
      version: '1.2.0',
      needUpdate: true,
      changelogs: [
        { locale: a.locale, changelog: 'Corrige o idioma.' },
        { locale: b.locale, changelog: 'Fixes the language.' }
      ]
    }
  })

  assert.equal(res.statusCode, 201)
  const body = JSON.parse(res.payload)
  assert.equal(body.length, 2)
  assert.ok(body.every((v: { version: string; needUpdate: boolean }) => v.version === '1.2.0' && v.needUpdate === true))
  assert.match(body[0].releasedAt, DATE_ONLY)

  assert.equal(await app.prisma.app_version.count({ where: { locale_id: a.id } }), 1)
  assert.equal(await app.prisma.app_version.count({ where: { locale_id: b.id } }), 1)
})

test('POST /app-version não grava nada se um dos idiomas não existe (404)', async (t) => {
  useDevelopmentEnv(t)
  const app = await build(t)
  const real = await scratchLocale(app, t)

  const res = await app.inject({
    method: 'POST',
    url: '/app-version',
    payload: {
      version: '1.2.0',
      changelogs: [
        { locale: real.locale, changelog: 'x' },
        { locale: 'zz-inexistente', changelog: 'y' }
      ]
    }
  })

  assert.equal(res.statusCode, 404)
  assert.equal(await app.prisma.app_version.count({ where: { locale_id: real.id } }), 0)
})

test('POST /app-version recusa republicar a versão vigente com 409', async (t) => {
  useDevelopmentEnv(t)
  const app = await build(t)
  const locale = await scratchLocale(app, t)

  const payload = { version: '1.0.0', changelogs: [{ locale: locale.locale, changelog: 'x' }] }
  assert.equal((await app.inject({ method: 'POST', url: '/app-version', payload })).statusCode, 201)

  const second = await app.inject({ method: 'POST', url: '/app-version', payload })
  assert.equal(second.statusCode, 409)
  assert.equal(await app.prisma.app_version.count({ where: { locale_id: locale.id } }), 1, 'a duplicata não pode ter sido gravada')
})

test('POST /app-version recusa um idioma repetido e uma versão malformada com 400', async (t) => {
  useDevelopmentEnv(t)
  const app = await build(t)
  const locale = await scratchLocale(app, t)

  const repeated = await app.inject({
    method: 'POST',
    url: '/app-version',
    payload: { version: '1.0.0', changelogs: [{ locale: locale.locale, changelog: 'a' }, { locale: locale.locale, changelog: 'b' }] }
  })
  assert.equal(repeated.statusCode, 400)

  const malformed = await app.inject({
    method: 'POST',
    url: '/app-version',
    payload: { version: 'v1', changelogs: [{ locale: locale.locale, changelog: 'a' }] }
  })
  assert.equal(malformed.statusCode, 400)

  const empty = await app.inject({
    method: 'POST',
    url: '/app-version',
    payload: { version: '1.0.0', changelogs: [] }
  })
  assert.equal(empty.statusCode, 400)
})
