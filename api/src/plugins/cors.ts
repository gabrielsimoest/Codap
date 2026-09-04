import fp from 'fastify-plugin'
import cors from '@fastify/cors'

/**
 * Origens do dashboard de conteúdo (pacote `dashboard/`): o dev server do Vite
 * (5173) e o preview de um build local (4173). Ficam hardcoded de propósito —
 * este plugin só existe em desenvolvimento, então não há cenário em que a
 * origem precise variar por ambiente, e uma variável nova no `.env` seria uma
 * peça de configuração sem uso real.
 */
const DASHBOARD_ORIGINS = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:4173',
  'http://127.0.0.1:4173'
]

/**
 * Habilita CORS para o dashboard, **somente quando NODE_ENV=development** —
 * mesmo critério de `swagger.ts`. Fora de dev o plugin retorna cedo e nenhum
 * cabeçalho de CORS é emitido.
 *
 * O app mobile não passa por aqui: React Native não aplica a política de mesma
 * origem, então nunca precisou de CORS. Quem precisa é só o navegador.
 */
export default fp(async (fastify) => {
  if (process.env.NODE_ENV !== 'development') {
    return
  }

  await fastify.register(cors, {
    origin: DASHBOARD_ORIGINS,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS']
  })
})
