import { test } from 'node:test'
import * as assert from 'node:assert'
import { randomUUID } from 'node:crypto'
import { build, useDevelopmentEnv } from '../../helper'

type App = Awaited<ReturnType<typeof build>>

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/

/**
 * Idioma descartável, com limpeza registrada.
 *
 * Os testes rodam contra o NeonDB real e o currículo de verdade usa `pt`/`en` —
 * publicar neles sujaria o conteúdo que o app consome. Cada teste cria o
 * próprio idioma com código único.
 */
async function scratchLocale (app: App, t: { after: (fn: () => unknown) => void }) {
  // `locales.locale` é VarChar(8): o código precisa caber nisso.
  const code = `t${randomUUID().slice(0, 6)}`
  const locale = await app.prisma.locales.create({
    data: { locale: code, name: 'Teste' }
  })

  t.after(async () => {
    await app.prisma.content_version.deleteMany({ where: { locale_id: locale.id } })
    await app.prisma.locales.deleteMany({ where: { id: locale.id } })
  })

  return locale
}

test('GET /content-version devolve a versão mais recente de cada idioma', async (t) => {
  const app = await build(t)
  const locale = await scratchLocale(app, t)

  await app.prisma.content_version.create({
    data: { locale_id: locale.id, version: '0.0.1', changelog: 'antiga', released_at: new Date() }
  })
  await app.prisma.content_version.create({
    data: { locale_id: locale.id, version: '0.0.2', changelog: 'atual', released_at: new Date() }
  })

  const res = await app.inject({ url: '/content-version' })
  assert.equal(res.statusCode, 200)

  const body = JSON.parse(res.payload)
  assert.ok(Array.isArray(body))

  const found = body.filter((v: { locale: string }) => v.locale === locale.locale)
  assert.equal(found.length, 1, 'só a versão vigente do idioma deve aparecer')
  assert.equal(found[0].version, '0.0.2')
  assert.equal(found[0].changelog, 'atual')
  assert.match(found[0].releasedAt, DATE_ONLY)
})

test('GET /content-version desempata pelo id, não por released_at', async (t) => {
  const app = await build(t)
  const locale = await scratchLocale(app, t)

  // Mesma data nas duas: `released_at` é `@db.Date` (sem hora), então só o `id`
  // distingue qual é a vigente.
  const mesmaData = new Date()
  await app.prisma.content_version.create({
    data: { locale_id: locale.id, version: '9.9.9', changelog: 'primeira', released_at: mesmaData }
  })
  await app.prisma.content_version.create({
    data: { locale_id: locale.id, version: '0.0.1', changelog: 'segunda', released_at: mesmaData }
  })

  const res = await app.inject({ url: `/content-version?locale=${locale.locale}` })
  assert.equal(res.statusCode, 200)

  const [atual] = JSON.parse(res.payload)
  assert.equal(atual.version, '0.0.1', 'a de maior id vence, mesmo com versão "menor"')
  assert.equal(atual.changelog, 'segunda')
})

test('GET /content-version?locale= filtra por idioma', async (t) => {
  const app = await build(t)
  const locale = await scratchLocale(app, t)

  await app.prisma.content_version.create({
    data: { locale_id: locale.id, version: '1.0.0', changelog: 'x', released_at: new Date() }
  })

  const res = await app.inject({ url: `/content-version?locale=${locale.locale}` })
  assert.equal(res.statusCode, 200)

  const body = JSON.parse(res.payload)
  assert.equal(body.length, 1)
  assert.equal(body[0].locale, locale.locale)
})

test('GET /content-version de um idioma sem publicação devolve lista vazia, não 404', async (t) => {
  const app = await build(t)
  const locale = await scratchLocale(app, t)

  const res = await app.inject({ url: `/content-version?locale=${locale.locale}` })
  assert.equal(res.statusCode, 200)
  assert.deepEqual(JSON.parse(res.payload), [])
})

test('GET /content-version continua registrado fora de desenvolvimento', async (t) => {
  const previousEnv = process.env.NODE_ENV
  process.env.NODE_ENV = 'production'
  t.after(() => { process.env.NODE_ENV = previousEnv })

  const app = await build(t)

  // É o app em produção que consome esta rota — ao contrário das de escrita,
  // ela precisa existir em qualquer ambiente.
  const res = await app.inject({ url: '/content-version' })
  assert.equal(res.statusCode, 200)
})

test('POST /content-version publica uma versão nova', async (t) => {
  useDevelopmentEnv(t)
  const app = await build(t)
  const locale = await scratchLocale(app, t)

  const res = await app.inject({
    method: 'POST',
    url: '/content-version',
    payload: { locale: locale.locale, version: '0.1.0', changelog: 'Duas lições novas.' }
  })

  assert.equal(res.statusCode, 201)
  const body = JSON.parse(res.payload)
  assert.equal(body.locale, locale.locale)
  assert.equal(body.version, '0.1.0')
  assert.equal(body.changelog, 'Duas lições novas.')
  assert.match(body.releasedAt, DATE_ONLY)

  const stored = await app.prisma.content_version.count({ where: { locale_id: locale.id } })
  assert.equal(stored, 1)
})

test('POST /content-version recusa republicar a versão vigente com 409', async (t) => {
  useDevelopmentEnv(t)
  const app = await build(t)
  const locale = await scratchLocale(app, t)

  const payload = { locale: locale.locale, version: '0.1.0', changelog: 'x' }
  const primeira = await app.inject({ method: 'POST', url: '/content-version', payload })
  assert.equal(primeira.statusCode, 201)

  const segunda = await app.inject({ method: 'POST', url: '/content-version', payload })
  assert.equal(segunda.statusCode, 409)

  const stored = await app.prisma.content_version.count({ where: { locale_id: locale.id } })
  assert.equal(stored, 1, 'a duplicata não pode ter sido gravada')
})

test('POST /content-version aceita uma versão MENOR que a vigente (rollback)', async (t) => {
  useDevelopmentEnv(t)
  const app = await build(t)
  const locale = await scratchLocale(app, t)

  await app.inject({
    method: 'POST',
    url: '/content-version',
    payload: { locale: locale.locale, version: '0.2.0', changelog: 'nova' }
  })

  // O app rebusca por divergência, não por ordem — voltar atrás é legítimo.
  const res = await app.inject({
    method: 'POST',
    url: '/content-version',
    payload: { locale: locale.locale, version: '0.1.0', changelog: 'rollback' }
  })
  assert.equal(res.statusCode, 201)

  const atual = await app.inject({ url: `/content-version?locale=${locale.locale}` })
  assert.equal(JSON.parse(atual.payload)[0].version, '0.1.0')
})

test('POST /content-version aceita segmentos de dois dígitos (VarChar(20))', async (t) => {
  useDevelopmentEnv(t)
  const app = await build(t)
  const locale = await scratchLocale(app, t)

  // O motivo da migration: "0.0.10" tem 6 caracteres e estourava o VarChar(5).
  const res = await app.inject({
    method: 'POST',
    url: '/content-version',
    payload: { locale: locale.locale, version: '10.20.30', changelog: 'x' }
  })
  assert.equal(res.statusCode, 201)
  assert.equal(JSON.parse(res.payload).version, '10.20.30')
})

test('POST /content-version rejeita formato de versão inválido com 400', async (t) => {
  useDevelopmentEnv(t)
  const app = await build(t)
  const locale = await scratchLocale(app, t)

  for (const version of ['1.0', '1.0.0.0', 'v1.0.0', '1.0.0-beta', 'abc']) {
    const res = await app.inject({
      method: 'POST',
      url: '/content-version',
      payload: { locale: locale.locale, version, changelog: 'x' }
    })
    assert.equal(res.statusCode, 400, `"${version}" deveria ser rejeitada`)
  }
})

test('POST /content-version rejeita changelog vazio com 400', async (t) => {
  useDevelopmentEnv(t)
  const app = await build(t)
  const locale = await scratchLocale(app, t)

  const res = await app.inject({
    method: 'POST',
    url: '/content-version',
    payload: { locale: locale.locale, version: '0.1.0', changelog: '' }
  })
  assert.equal(res.statusCode, 400)
})

test('POST /content-version devolve 404 para idioma inexistente', async (t) => {
  useDevelopmentEnv(t)
  const app = await build(t)

  const res = await app.inject({
    method: 'POST',
    url: '/content-version',
    payload: { locale: 'zz', version: '0.1.0', changelog: 'x' }
  })
  assert.equal(res.statusCode, 404)
})

test('POST /content-version não é registrado fora de desenvolvimento', async (t) => {
  const previousEnv = process.env.NODE_ENV
  process.env.NODE_ENV = 'production'
  t.after(() => { process.env.NODE_ENV = previousEnv })

  const app = await build(t)

  const res = await app.inject({
    method: 'POST',
    url: '/content-version',
    payload: { locale: 'pt', version: '0.1.0', changelog: 'x' }
  })
  assert.equal(res.statusCode, 404)
})
