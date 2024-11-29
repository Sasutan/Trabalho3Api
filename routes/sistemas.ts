import {  PrismaClient } from '@prisma/client'
import { Router, Request } from 'express'
import { z } from 'zod'
import { verificaToken } from '../middlewares/verificaToken'

const prisma = new PrismaClient()
const router = Router()

const sistemaSchema = z.object({
    nome: z.string(),
    descricao: z.string()
})

router.get("/", async (req, res) => {
  try {
    const sistemas = await prisma.sistema.findMany({
      orderBy: { id: 'desc' },
      select: {
        id: true,
        nome: true,
        descricao: true,
        usuario: true
      }
    })
    res.status(200).json(sistemas)
  } catch (error) {
    res.status(500).json({erro: error})
  }
})

interface CustomRequest extends Request {
  userLogadoId?: number;
}

router.post("/", verificaToken, async (req: CustomRequest, res) => {

  const valida = sistemaSchema.safeParse(req.body)
  if (!valida.success) {
    res.status(400).json({ erro: valida.error })
    return
  }

  try {
    const sistema = await prisma.sistema.create({
      data: {
        ...valida.data,
        usuario: {
          connect: { id: req.userLogadoId }
        }
      }
    })
    res.status(201).json(sistema)
  } catch (error) {
    res.status(400).json({ error })
  }
})

router.delete("/:id", verificaToken, async (req: any, res) => {
  const { id } = req.params

  try {
    const sistema = await prisma.sistema.delete({
      where: { id: Number(id) }
    })

    await prisma.log.create({
      data: { 
        descricao: `Exclusão do sistema: ${id}`, 
        complemento: `Funcionário: ${req.userLogadoNome}`,
        usuarioId: req.userLogadoId,
        acao: 'deletar_sistema',
        usuario: req.userLogadoNome
      }
    })

    res.status(200).json(sistema)
  } catch (error) {
    res.status(400).json({ erro: error })
  }
})

router.put("/:id", verificaToken, async (req, res) => {
  const { id } = req.params

  const valida = sistemaSchema.safeParse(req.body)
  if (!valida.success) {
    res.status(400).json({ erro: valida.error })
    return
  }

  try {
    const sistema = await prisma.sistema.update({
      where: { id: Number(id) },
      data: valida.data
    })
    res.status(201).json(sistema)
  } catch (error) {
    res.status(400).json({ error })
  }
})


router.patch("/:id", async (req, res) => {
  const { id } = req.params

  const partialsistemaSchema = sistemaSchema.partial()

  const valida = partialsistemaSchema.safeParse(req.body)
  if (!valida.success) {
    res.status(400).json({ erro: valida.error })
    return
  }

  try {
    const sistema = await prisma.sistema.update({
      where: { id: Number(id) },
      data: valida.data
    })
    res.status(201).json(sistema)
  } catch (error) {
    res.status(400).json({ error })
  }
})


export default router
