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
      await app.prisma.user_lessons.deleteMany({ where: { lesson_id: lesson.id } })
      await app.prisma.lessons.delete({ where: { id: lesson.id } })
      await app.prisma.modules.delete({ where: { id: learningModule.id } })
      await app.prisma.areas.delete({ where: { id: area.id } })
    }
  }
}

async function createAchievementFixture (app: App) {
  const achievement = await app.prisma.achievements.create({
    data: { name: `Test Achievement ${randomUUID()}`, description: 'Fixture for progress tests' }
  })

  return {
    achievementId: achievement.id,
    cleanup: async () => {
      await app.prisma.user_achievements.deleteMany({ where: { achievement_id: achievement.id } })
      await app.prisma.achievements.delete({ where: { id: achievement.id } })
    }
  }
}

async function registerTestUser (app: App) {
  const email = `progress-${randomUUID()}@example.com`
  const res = await app.inject({
    method: 'POST',
    url: '/auth/register',
    payload: { name: 'Progress Test', email, password: 'senha1234' }
  })
  const body = JSON.parse(res.payload)

  return {
    userId: body.user.id as string,
    accessToken: body.accessToken as string,
    cleanup: async () => {
      await app.prisma.user_lessons.deleteMany({ where: { user_id: body.user.id } })
      await app.prisma.user_achievements.deleteMany({ where: { user_id: body.user.id } })
      await app.prisma.refresh_tokens.deleteMany({ where: { user_id: body.user.id } })
      await app.prisma.auth_tokens.deleteMany({ where: { user_id: body.user.id } })
      await app.prisma.users.delete({ where: { id: body.user.id } })
    }
  }
}

async function getProgress (app: App, accessToken: string) {
  return await app.inject({
    method: 'GET',
    url: '/sync/progress',
    headers: { authorization: `Bearer ${accessToken}` }
  })
}

test('GET /sync/progress requires authentication', async (t) => {
  const app = await build(t)

  const res = await app.inject({ method: 'GET', url: '/sync/progress' })

  assert.equal(res.statusCode, 401)
})

test('GET /sync/progress of a new user is empty, not an error', async (t) => {
  const app = await build(t)
  const user = await registerTestUser(app)

  const res = await getProgress(app, user.accessToken)

  assert.equal(res.statusCode, 200)
  assert.deepEqual(JSON.parse(res.payload), { lessons: [], achievements: [] })

  await user.cleanup()
})

test('GET /sync/progress returns what POST /sync stored — the round trip a new device relies on', async (t) => {
  const app = await build(t)
  const user = await registerTestUser(app)
  const lesson = await createLessonFixture(app)
  const achievement = await createAchievementFixture(app)

  const occurredAt = '2026-10-20T12:00:00.000Z'
  const sync = await app.inject({
    method: 'POST',
    url: '/sync',
    headers: { authorization: `Bearer ${user.accessToken}` },
    payload: {
      events: [
        { clientEventId: randomUUID(), type: 'lesson_completed', occurredAt, payload: { lessonId: lesson.lessonId } },
        { clientEventId: randomUUID(), type: 'achievement_unlocked', occurredAt, payload: { achievementId: achievement.achievementId } }
      ]
    }
  })
  assert.equal(sync.statusCode, 200)

  const res = await getProgress(app, user.accessToken)

  assert.equal(res.statusCode, 200)
  const body = JSON.parse(res.payload)
  assert.deepEqual(body.lessons, [{ lessonId: lesson.lessonId, completedAt: occurredAt }])
  assert.deepEqual(body.achievements, [{ achievementId: achievement.achievementId, unlockedAt: occurredAt }])

  await user.cleanup()
  await lesson.cleanup()
  await achievement.cleanup()
})

test('GET /sync/progress only returns the token owner\'s progress', async (t) => {
  const app = await build(t)
  const owner = await registerTestUser(app)
  const other = await registerTestUser(app)
  const lesson = await createLessonFixture(app)

  await app.prisma.user_lessons.create({
    data: { user_id: owner.userId, lesson_id: lesson.lessonId, completed_at: new Date() }
  })

  const ownerProgress = JSON.parse((await getProgress(app, owner.accessToken)).payload)
  const otherProgress = JSON.parse((await getProgress(app, other.accessToken)).payload)

  assert.equal(ownerProgress.lessons.length, 1)
  assert.deepEqual(otherProgress.lessons, [], 'a conta de outra pessoa nunca enxerga o progresso alheio')

  await owner.cleanup()
  await other.cleanup()
  await lesson.cleanup()
})

test('GET /sync/progress lists oldest first and keeps every lesson', async (t) => {
  const app = await build(t)
  const user = await registerTestUser(app)
  const first = await createLessonFixture(app)
  const second = await createLessonFixture(app)

  // Gravadas fora de ordem de id: a ordem esperada é a de conclusão.
  await app.prisma.user_lessons.create({ data: { user_id: user.userId, lesson_id: second.lessonId, completed_at: new Date('2026-10-01T10:00:00Z') } })
  await app.prisma.user_lessons.create({ data: { user_id: user.userId, lesson_id: first.lessonId, completed_at: new Date('2026-10-02T10:00:00Z') } })

  const body = JSON.parse((await getProgress(app, user.accessToken)).payload)

  assert.deepEqual(body.lessons.map((row: { lessonId: number }) => row.lessonId), [second.lessonId, first.lessonId])

  await user.cleanup()
  await first.cleanup()
  await second.cleanup()
})
