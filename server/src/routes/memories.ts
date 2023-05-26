import { FastifyInstance } from 'fastify'
import { prisma } from '../lib/prisma'
import { z } from 'zod'

export async function memoriesRoutes(app: FastifyInstance) {
  app.addHook('preHandler', async (req) => {
    await req.jwtVerify()
  })

  app.get('/memories', async (req) => {
    const memories = await prisma.memory.findMany({
      where: {
        userId: req.user.sub,
      },
      orderBy: { createdAt: 'asc' },
    })

    return memories.map((memory) => {
      const result = {
        id: memory.id,
        coverUrl: memory.coverUrl,
        except: memory.content,
      }

      if (memory.content.length <= 120) {
        result.except = memory.content.concat('.')
      } else {
        result.except = memory.content.substring(0, 120).concat('...')
      }

      return result
    })
  })

  app.get('/memories/:id', async (req, res) => {
    // const { id } = req.params

    const paramsSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = paramsSchema.parse(req.params)

    const memory = await prisma.memory.findUniqueOrThrow({
      where: { id },
    })

    if (!memory.isPublic && memory.userId !== req.user.sub) {
      return res.status(401).send({
        message: 'Essa memoria não é publica ou você não é o dono dela.',
      })
    }

    return memory
  })

  app.post('/memories', async (req) => {
    const bodySchema = z.object({
      content: z.string(),
      coverUrl: z.string(),
      isPublic: z.coerce.boolean().default(false),
    })

    const { content, coverUrl, isPublic } = bodySchema.parse(req.body)

    const memory = await prisma.memory.create({
      data: {
        content,
        coverUrl,
        isPublic,
        userId: req.user.sub,
      },
    })

    return memory
  })

  app.put('/memories/:id', async (req, res) => {
    const paramsSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = paramsSchema.parse(req.params)

    const bodySchema = z.object({
      content: z.string(),
      coverUrl: z.string(),
      isPublic: z.coerce.boolean().default(false),
    })

    const { content, coverUrl, isPublic } = bodySchema.parse(req.body)

    const findMemory = await prisma.memory.findUniqueOrThrow({
      where: {
        id,
      },
    })

    if (findMemory.userId !== req.user.sub) {
      return res.status(401).send({ message: 'Deu ruim ao atualizar' })
    }

    const newMemory = await prisma.memory.update({
      where: { id },
      data: {
        content,
        coverUrl,
        isPublic,
      },
    })

    return newMemory
  })

  app.delete('/memories/:id', async (req, res) => {
    const paramsSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = paramsSchema.parse(req.params)

    const findMemory = await prisma.memory.findUniqueOrThrow({
      where: {
        id,
      },
    })

    if (findMemory.userId !== req.user.sub) {
      return res.status(401).send({ message: 'Deu ruim ao deletar' })
    }

    await prisma.memory.delete({
      where: { id },
    })
  })
}
