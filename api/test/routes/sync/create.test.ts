import { test } from 'node:test'
import * as assert from 'node:assert'
import { randomUUID } from 'node:crypto'
import { build } from '../../helper'

type App = Awaited<ReturnType<typeof build>>

async function createLessonFixture (app: App, extra: { xp_reward?: number; min_level?: number; is_chest?: boolean } = {}) {
  const area = await app.prisma.areas.create({ data: { name: `Sync Fixture Area ${randomUUID()}` } })
  const learningModule = await app.prisma.modules.create({ data: { area_id: area.id, index: 1 } })
  const lesson = await app.prisma.lessons.create({ data: { module_id: learningModule.id, index: 1, ...extra } })

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
      await app.prisma.xp_boosts.deleteMany({ where: { user_id: body.user.id } })
      await app.prisma.user_chest_lessons.deleteMany({ where: { user_id: body.user.id } })
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

async function syncLessons (app: App, accessToken: string, lessonIds: number[]) {
  return app.inject({
    method: 'POST',
    url: '/sync',
    headers: { authorization: `Bearer ${accessToken}` },
    payload: {
      events: lessonIds.map((lessonId) => ({
        clientEventId: randomUUID(),
        type: 'lesson_completed',
        occurredAt: new Date().toISOString(),
        payload: { lessonId }
      }))
    }
  })
}

test('POST /sync below the first level threshold credits no Bits and returns the profile', async (t) => {
  const app = await build(t)
  const user = await registerTestUser(app)
  const lesson = await createLessonFixture(app)

  const res = await syncLessons(app, user.accessToken, [lesson.lessonId])

  assert.equal(res.statusCode, 200)
  const body = JSON.parse(res.payload)
  assert.deepEqual(body.profile, { xp: 10, bits: 0 })

  const updatedUser = await app.prisma.users.findUniqueOrThrow({ where: { id: user.userId } })
  assert.equal(updatedUser.xp, 10)
  assert.equal(updatedUser.bits, 0)

  await user.cleanup()
  await lesson.cleanup()
})

test('POST /sync credits the Bits of a level when one lesson crosses its threshold', async (t) => {
  const app = await build(t)
  const user = await registerTestUser(app)
  const lesson = await createLessonFixture(app)
  await app.prisma.users.update({ where: { id: user.userId }, data: { xp: 50 } })

  const res = await syncLessons(app, user.accessToken, [lesson.lessonId])

  assert.equal(res.statusCode, 200)
  assert.deepEqual(JSON.parse(res.payload).profile, { xp: 60, bits: 20 }) // nível 2 em 54 XP

  await user.cleanup()
  await lesson.cleanup()
})

test('POST /sync credits the Bits of a level only once when one batch crosses it', async (t) => {
  const app = await build(t)
  const user = await registerTestUser(app)
  const lessons = await Promise.all(Array.from({ length: 6 }, () => createLessonFixture(app)))

  const res = await syncLessons(app, user.accessToken, lessons.map((lesson) => lesson.lessonId))

  assert.equal(res.statusCode, 200)
  const body = JSON.parse(res.payload)
  assert.ok(body.results.every((result: { status: string }) => result.status === 'applied'))
  assert.deepEqual(body.profile, { xp: 60, bits: 20 })

  const updatedUser = await app.prisma.users.findUniqueOrThrow({ where: { id: user.userId } })
  assert.equal(updatedUser.xp, 60)
  assert.equal(updatedUser.bits, 20)

  await user.cleanup()
  for (const lesson of lessons) await lesson.cleanup()
})

test('POST /sync does not pay a lesson that was already completed and the profile reflects the server', async (t) => {
  const app = await build(t)
  const user = await registerTestUser(app)
  const lesson = await createLessonFixture(app)

  const first = await syncLessons(app, user.accessToken, [lesson.lessonId])
  const second = await syncLessons(app, user.accessToken, [lesson.lessonId])

  assert.equal(JSON.parse(first.payload).results[0].status, 'applied')
  const body = JSON.parse(second.payload)
  assert.equal(body.results[0].status, 'duplicate')
  assert.deepEqual(body.profile, { xp: 10, bits: 0 })

  await user.cleanup()
  await lesson.cleanup()
})

test('POST /sync treats null xp and bits as zero', async (t) => {
  const app = await build(t)
  const user = await registerTestUser(app)
  const lesson = await createLessonFixture(app)
  await app.prisma.users.update({ where: { id: user.userId }, data: { xp: null, bits: null } })

  const res = await syncLessons(app, user.accessToken, [lesson.lessonId])

  assert.equal(res.statusCode, 200)
  assert.deepEqual(JSON.parse(res.payload).profile, { xp: 10, bits: 0 })

  await user.cleanup()
  await lesson.cleanup()
})

test('POST /sync returns the profile even when the batch is empty', async (t) => {
  const app = await build(t)
  const user = await registerTestUser(app)

  const res = await app.inject({
    method: 'POST',
    url: '/sync',
    headers: { authorization: `Bearer ${user.accessToken}` },
    payload: { events: [] }
  })

  assert.equal(res.statusCode, 200)
  assert.deepEqual(JSON.parse(res.payload).profile, { xp: 0, bits: 0 })

  await user.cleanup()
})

test('POST /sync pays the xpReward of an optional lesson', async (t) => {
  const app = await build(t)
  const user = await registerTestUser(app)
  const lesson = await createLessonFixture(app, { min_level: 8, xp_reward: 30 })

  const res = await syncLessons(app, user.accessToken, [lesson.lessonId])

  assert.equal(res.statusCode, 200)
  assert.deepEqual(JSON.parse(res.payload).profile, { xp: 30, bits: 0 })

  await user.cleanup()
  await lesson.cleanup()
})

test('POST /sync pays the Bits of every level an optional lesson crosses', async (t) => {
  const app = await build(t)
  const user = await registerTestUser(app)
  const lesson = await createLessonFixture(app, { min_level: 8, xp_reward: 100 })
  await app.prisma.users.update({ where: { id: user.userId }, data: { xp: 100 } })

  const res = await syncLessons(app, user.accessToken, [lesson.lessonId])

  assert.equal(res.statusCode, 200)
  // 100 XP é o nível 2; 200 XP é o nível 4: cruza os níveis 3 e 4 (10 × 3 + 10 × 4).
  assert.deepEqual(JSON.parse(res.payload).profile, { xp: 200, bits: 70 })

  await user.cleanup()
  await lesson.cleanup()
})

const MINUTE_MS = 60 * 1000

async function syncLessonsAt (app: App, accessToken: string, events: Array<{ lessonId: number, occurredAt: Date }>) {
  return app.inject({
    method: 'POST',
    url: '/sync',
    headers: { authorization: `Bearer ${accessToken}` },
    payload: {
      events: events.map(({ lessonId, occurredAt }) => ({
        clientEventId: randomUUID(),
        type: 'lesson_completed',
        occurredAt: occurredAt.toISOString(),
        payload: { lessonId }
      }))
    }
  })
}

async function openBoost (app: App, userId: string, startsInMinutes: number, endsInMinutes: number) {
  const now = Date.now()
  await app.prisma.xp_boosts.create({
    data: {
      user_id: userId,
      starts_at: new Date(now + startsInMinutes * MINUTE_MS),
      ends_at: new Date(now + endsInMinutes * MINUTE_MS)
    }
  })
}

test('POST /sync doubles the XP of an event inside a boost window', async (t) => {
  const app = await build(t)
  const user = await registerTestUser(app)
  const lesson = await createLessonFixture(app)
  await openBoost(app, user.userId, -1, 4)

  const res = await syncLessonsAt(app, user.accessToken, [{ lessonId: lesson.lessonId, occurredAt: new Date() }])

  assert.equal(res.statusCode, 200)
  assert.deepEqual(JSON.parse(res.payload).profile, { xp: 20, bits: 0 })

  await user.cleanup()
  await lesson.cleanup()
})

test('POST /sync does not double an event outside every window', async (t) => {
  const app = await build(t)
  const user = await registerTestUser(app)
  const [before, after] = [await createLessonFixture(app), await createLessonFixture(app)]
  await openBoost(app, user.userId, -20, -15)

  const res = await syncLessonsAt(app, user.accessToken, [
    { lessonId: before.lessonId, occurredAt: new Date(Date.now() - 30 * MINUTE_MS) }, // antes da janela
    { lessonId: after.lessonId, occurredAt: new Date() } // depois do fim
  ])

  assert.equal(res.statusCode, 200)
  assert.deepEqual(JSON.parse(res.payload).profile, { xp: 20, bits: 0 }) // 10 + 10, sem dobro

  await user.cleanup()
  await before.cleanup()
  await after.cleanup()
})

test('POST /sync doubles an event completed offline inside a window that already ended', async (t) => {
  const app = await build(t)
  const user = await registerTestUser(app)
  const lesson = await createLessonFixture(app)
  await openBoost(app, user.userId, -60, -55)

  const res = await syncLessonsAt(app, user.accessToken, [
    { lessonId: lesson.lessonId, occurredAt: new Date(Date.now() - 58 * MINUTE_MS) }
  ])

  assert.deepEqual(JSON.parse(res.payload).profile, { xp: 20, bits: 0 })

  await user.cleanup()
  await lesson.cleanup()
})

test('POST /sync doubles the xpReward of an optional lesson and pays the Bits of the levels crossed', async (t) => {
  const app = await build(t)
  const user = await registerTestUser(app)
  const lesson = await createLessonFixture(app, { min_level: 8, xp_reward: 50 })
  await app.prisma.users.update({ where: { id: user.userId }, data: { xp: 100 } })
  await openBoost(app, user.userId, -1, 4)

  const res = await syncLessonsAt(app, user.accessToken, [{ lessonId: lesson.lessonId, occurredAt: new Date() }])

  // 50 × 2 = 100 XP: de 100 (nível 2) a 200 (nível 4) cruza os níveis 3 e 4 (30 + 40 Bits).
  assert.deepEqual(JSON.parse(res.payload).profile, { xp: 200, bits: 70 })

  await user.cleanup()
  await lesson.cleanup()
})

test('POST /sync refuses a chest lesson that was not revealed (lesson_locked) and the batch goes on', async (t) => {
  const app = await build(t)
  const user = await registerTestUser(app)
  const chest = await createLessonFixture(app, { is_chest: true, xp_reward: 50 })
  const trail = await createLessonFixture(app)

  const res = await syncLessons(app, user.accessToken, [chest.lessonId, trail.lessonId])

  assert.equal(res.statusCode, 200)
  const body = JSON.parse(res.payload)
  assert.deepEqual(body.results.map((r: { status: string, error?: string }) => [r.status, r.error]), [['error', 'lesson_locked'], ['applied', undefined]])
  assert.deepEqual(body.profile, { xp: 10, bits: 0 }) // só a lição da trilha pagou
  assert.equal(await app.prisma.user_lessons.count({ where: { user_id: user.userId, lesson_id: chest.lessonId } }), 0)

  await user.cleanup()
  await chest.cleanup()
  await trail.cleanup()
})

test('POST /sync pays a revealed chest lesson with its xpReward', async (t) => {
  const app = await build(t)
  const user = await registerTestUser(app)
  const chest = await createLessonFixture(app, { is_chest: true, xp_reward: 50 })
  await app.prisma.user_chest_lessons.create({ data: { user_id: user.userId, lesson_id: chest.lessonId } })

  const res = await syncLessons(app, user.accessToken, [chest.lessonId])

  assert.equal(JSON.parse(res.payload).results[0].status, 'applied')
  assert.deepEqual(JSON.parse(res.payload).profile, { xp: 50, bits: 0 })

  await user.cleanup()
  await chest.cleanup()
})

test('POST /sync doubles at most BOOST_MAX_LESSONS lessons per window, even in one batch', async (t) => {
  const app = await build(t)
  const user = await registerTestUser(app)
  const lessons = await Promise.all(Array.from({ length: 7 }, () => createLessonFixture(app)))
  await openBoost(app, user.userId, -1, 4)

  const res = await syncLessonsAt(app, user.accessToken, lessons.map((lesson, i) => ({
    lessonId: lesson.lessonId,
    occurredAt: new Date(Date.now() - i * 1000)
  })))

  assert.equal(res.statusCode, 200)
  // 5 × 20 (dobradas) + 2 × 10 (passaram do teto da janela) = 120 XP; níveis 2 e 3 = 20 + 30 Bits.
  assert.deepEqual(JSON.parse(res.payload).profile, { xp: 120, bits: 50 })

  await user.cleanup()
  for (const lesson of lessons) await lesson.cleanup()
})

test('POST /sync counts the lessons already synced in the window when applying the cap', async (t) => {
  const app = await build(t)
  const user = await registerTestUser(app)
  const lessons = await Promise.all(Array.from({ length: 6 }, () => createLessonFixture(app)))
  await openBoost(app, user.userId, -1, 4)

  const first = await syncLessonsAt(app, user.accessToken, lessons.slice(0, 5).map((lesson) => ({ lessonId: lesson.lessonId, occurredAt: new Date() })))
  assert.deepEqual(JSON.parse(first.payload).profile.xp, 100)

  // Uma sexta lição, no mesmo intervalo, enviada depois: já não dobra.
  const second = await syncLessonsAt(app, user.accessToken, [{ lessonId: lessons[5].lessonId, occurredAt: new Date() }])
  assert.deepEqual(JSON.parse(second.payload).profile.xp, 110)

  await user.cleanup()
  for (const lesson of lessons) await lesson.cleanup()
})
