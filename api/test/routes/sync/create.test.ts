import { test } from 'node:test'
import * as assert from 'node:assert'
import { randomUUID } from 'node:crypto'
import { build } from '../../helper'

type App = Awaited<ReturnType<typeof build>>

async function createLessonFixture (app: App) {
  const area = await app.prisma.areas.create({ data: { name: `Sync Fixture Area ${randomUUID()}` } })
  const learningModule = await app.prisma.modules.create({ data: { area_id: area.id, index: 1 } })
  const lesson = await app.prisma.lessons.create({ data: { module_id: learningModule.id, index: 1 } })

  return {
    lessonId: lesson.id,
    cleanup: async () => {
      await app.prisma.lessons.delete({ where: { id: lesson.id } })
      await app.prisma.modules.delete({ where: { id: learningModule.id } })
      await app.prisma.areas.delete({ where: { id: area.id } })
    }
  }
}

async function createAchievementFixture (app: App) {
  const achievement = await app.prisma.achievements.create({
    data: { name: `Test Achievement ${randomUUID()}`, description: 'Fixture for sync tests' }
  })

  return {
    achievementId: achievement.id,
    cleanup: async () => {
      await app.prisma.achievements.delete({ where: { id: achievement.id } })
    }
  }
}

async function registerTestUser (app: App) {
  const email = `sync-${randomUUID()}@example.com`
  const res = await app.inject({
    method: 'POST',
    url: '/auth/register',
    payload: { name: 'Sync Test', email, password: 'senha1234' }
  })
  const body = JSON.parse(res.payload)

  return {
    userId: body.user.id as string,
    accessToken: body.accessToken as string,
    cleanup: async () => {
      await app.prisma.user_lessons.deleteMany({ where: { user_id: body.user.id } })
      await app.prisma.user_achievements.deleteMany({ where: { user_id: body.user.id } })
      await app.prisma.refresh_tokens.deleteMany({ where: { user_id: body.user.id } })
      await app.prisma.users.delete({ where: { id: body.user.id } })
    }
  }
}

test('POST /sync requires authentication', async (t) => {
  const app = await build(t)

  const res = await app.inject({
    method: 'POST',
    url: '/sync',
    payload: { events: [] }
  })

  assert.equal(res.statusCode, 401)
})

test('POST /sync applies a lesson_completed event and increments XP', async (t) => {
  const app = await build(t)
  const user = await registerTestUser(app)
  const lesson = await createLessonFixture(app)

  const res = await app.inject({
    method: 'POST',
    url: '/sync',
    headers: { authorization: `Bearer ${user.accessToken}` },
    payload: {
      events: [{
        clientEventId: randomUUID(),
        type: 'lesson_completed',
        occurredAt: new Date().toISOString(),
        payload: { lessonId: lesson.lessonId }
      }]
    }
  })

  assert.equal(res.statusCode, 200)
  const body = JSON.parse(res.payload)
  assert.equal(body.results.length, 1)
  assert.equal(body.results[0].status, 'applied')

  const updatedUser = await app.prisma.users.findUniqueOrThrow({ where: { id: user.userId } })
  assert.equal(updatedUser.xp, 10)

  await user.cleanup()
  await lesson.cleanup()
})

test('POST /sync replaying the same lesson_completed event is idempotent (no double XP)', async (t) => {
  const app = await build(t)
  const user = await registerTestUser(app)
  const lesson = await createLessonFixture(app)
  const clientEventId = randomUUID()
  const occurredAt = new Date().toISOString()

  const first = await app.inject({
    method: 'POST',
    url: '/sync',
    headers: { authorization: `Bearer ${user.accessToken}` },
    payload: { events: [{ clientEventId, type: 'lesson_completed', occurredAt, payload: { lessonId: lesson.lessonId } }] }
  })
  const second = await app.inject({
    method: 'POST',
    url: '/sync',
    headers: { authorization: `Bearer ${user.accessToken}` },
    payload: { events: [{ clientEventId, type: 'lesson_completed', occurredAt, payload: { lessonId: lesson.lessonId } }] }
  })

  assert.equal(JSON.parse(first.payload).results[0].status, 'applied')
  assert.equal(JSON.parse(second.payload).results[0].status, 'duplicate')

  const updatedUser = await app.prisma.users.findUniqueOrThrow({ where: { id: user.userId } })
  assert.equal(updatedUser.xp, 10)

  const rows = await app.prisma.user_lessons.findMany({ where: { user_id: user.userId, lesson_id: lesson.lessonId } })
  assert.equal(rows.length, 1)

  await user.cleanup()
  await lesson.cleanup()
})

test('POST /sync applies an achievement_unlocked event', async (t) => {
  const app = await build(t)
  const user = await registerTestUser(app)
  const achievement = await createAchievementFixture(app)

  const res = await app.inject({
    method: 'POST',
    url: '/sync',
    headers: { authorization: `Bearer ${user.accessToken}` },
    payload: {
      events: [{
        clientEventId: randomUUID(),
        type: 'achievement_unlocked',
        occurredAt: new Date().toISOString(),
        payload: { achievementId: achievement.achievementId }
      }]
    }
  })

  assert.equal(res.statusCode, 200)
  const body = JSON.parse(res.payload)
  assert.equal(body.results[0].status, 'applied')

  await user.cleanup()
  await achievement.cleanup()
})

test('POST /sync returns a per-event error for a non-existent lesson without failing the rest of the batch', async (t) => {
  const app = await build(t)
  const user = await registerTestUser(app)
  const achievement = await createAchievementFixture(app)

  const res = await app.inject({
    method: 'POST',
    url: '/sync',
    headers: { authorization: `Bearer ${user.accessToken}` },
    payload: {
      events: [
        {
          clientEventId: randomUUID(),
          type: 'lesson_completed',
          occurredAt: new Date().toISOString(),
          payload: { lessonId: 999999999 }
        },
        {
          clientEventId: randomUUID(),
          type: 'achievement_unlocked',
          occurredAt: new Date().toISOString(),
          payload: { achievementId: achievement.achievementId }
        }
      ]
    }
  })

  assert.equal(res.statusCode, 200)
  const body = JSON.parse(res.payload)
  assert.equal(body.results[0].status, 'error')
  assert.equal(body.results[0].error, 'lesson_not_found')
  assert.equal(body.results[1].status, 'applied')

  await user.cleanup()
  await achievement.cleanup()
})

test('POST /sync replaying the same achievement_unlocked event is idempotent', async (t) => {
  const app = await build(t)
  const user = await registerTestUser(app)
  const achievement = await createAchievementFixture(app)
  const clientEventId = randomUUID()
  const occurredAt = new Date().toISOString()

  const first = await app.inject({
    method: 'POST',
    url: '/sync',
    headers: { authorization: `Bearer ${user.accessToken}` },
    payload: { events: [{ clientEventId, type: 'achievement_unlocked', occurredAt, payload: { achievementId: achievement.achievementId } }] }
  })
  const second = await app.inject({
    method: 'POST',
    url: '/sync',
    headers: { authorization: `Bearer ${user.accessToken}` },
    payload: { events: [{ clientEventId, type: 'achievement_unlocked', occurredAt, payload: { achievementId: achievement.achievementId } }] }
  })

  assert.equal(JSON.parse(first.payload).results[0].status, 'applied')
  assert.equal(JSON.parse(second.payload).results[0].status, 'duplicate')

  const rows = await app.prisma.user_achievements.findMany({ where: { user_id: user.userId, achievement_id: achievement.achievementId } })
  assert.equal(rows.length, 1)

  await user.cleanup()
  await achievement.cleanup()
})

test('POST /sync returns a per-event error for a non-existent achievement', async (t) => {
  const app = await build(t)
  const user = await registerTestUser(app)

  const res = await app.inject({
    method: 'POST',
    url: '/sync',
    headers: { authorization: `Bearer ${user.accessToken}` },
    payload: {
      events: [{
        clientEventId: randomUUID(),
        type: 'achievement_unlocked',
        occurredAt: new Date().toISOString(),
        payload: { achievementId: 999999999 }
      }]
    }
  })

  assert.equal(res.statusCode, 200)
  const body = JSON.parse(res.payload)
  assert.equal(body.results[0].status, 'error')
  assert.equal(body.results[0].error, 'achievement_not_found')

  await user.cleanup()
})

test('POST /sync returns a per-event error when the payload is missing the field required by its type', async (t) => {
  const app = await build(t)
  const user = await registerTestUser(app)

  const res = await app.inject({
    method: 'POST',
    url: '/sync',
    headers: { authorization: `Bearer ${user.accessToken}` },
    payload: {
      events: [
        { clientEventId: randomUUID(), type: 'lesson_completed', occurredAt: new Date().toISOString(), payload: {} },
        { clientEventId: randomUUID(), type: 'achievement_unlocked', occurredAt: new Date().toISOString(), payload: {} }
      ]
    }
  })

  assert.equal(res.statusCode, 200)
  const body = JSON.parse(res.payload)
  assert.equal(body.results[0].status, 'error')
  assert.equal(body.results[0].error, 'missing_lesson_id')
  assert.equal(body.results[1].status, 'error')
  assert.equal(body.results[1].error, 'missing_achievement_id')

  await user.cleanup()
})

test('POST /sync rejects an unknown event type with 400', async (t) => {
  const app = await build(t)
  const user = await registerTestUser(app)

  const res = await app.inject({
    method: 'POST',
    url: '/sync',
    headers: { authorization: `Bearer ${user.accessToken}` },
    payload: {
      events: [{ clientEventId: randomUUID(), type: 'bogus_type', occurredAt: new Date().toISOString(), payload: {} }]
    }
  })

  assert.equal(res.statusCode, 400)

  await user.cleanup()
})

test('POST /sync rejects a batch larger than 100 events with 400', async (t) => {
  const app = await build(t)
  const user = await registerTestUser(app)

  const events = Array.from({ length: 101 }, () => ({
    clientEventId: randomUUID(),
    type: 'achievement_unlocked',
    occurredAt: new Date().toISOString(),
    payload: { achievementId: 1 }
  }))

  const res = await app.inject({
    method: 'POST',
    url: '/sync',
    headers: { authorization: `Bearer ${user.accessToken}` },
    payload: { events }
  })

  assert.equal(res.statusCode, 400)

  await user.cleanup()
})
