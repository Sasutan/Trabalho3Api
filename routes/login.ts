import jwt from "jsonwebtoken"
import { PrismaClient } from "@prisma/client"
import { Router } from "express"
import bcrypt from "bcrypt"

const prisma = new PrismaClient()

const router = Router()

router.post("/", async (req, res) => {
  const { email, senha } = req.body

  const mensaPadrao = "Login ou senha inválidos"

  if (!email || !senha) {
    res.status(400).json({ erro: mensaPadrao })
    return
  }

  try {
    const usuario = await prisma.usuario.findFirst({
      where: { email }
    })

    if (usuario == null) {
      res.status(400).json({ erro: mensaPadrao })
      return
    }

    if (bcrypt.compareSync(senha, usuario.senha)) {
      const dataAtual = new Date()

      await prisma.usuario.update({
        where: { id: usuario.id },
        data: { ultimoAcesso: dataAtual }
      })

   
      const token = jwt.sign({
        userLogadoId: usuario.id,
        userLogadoNome: usuario.nome
      }, process.env.JWT_KEY as string, { expiresIn: "1h" })


      const ultimoAcessoMensagem = usuario.ultimoAcesso
        ? `Seu último acesso foi em: ${usuario.ultimoAcesso.toISOString()}`
        : "Este é o seu primeiro acesso ao sistema."


      res.status(200).json({
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        token,
        mensagem: `Bem-vindo ${usuario.nome}. ${ultimoAcessoMensagem}`
      })
    } else {
      await prisma.log.create({
        data: {
          descricao: "Tentativa de Acesso Inválida",
          complemento: `Usuário: ${email}`,
          usuarioId: usuario.id,
          acao: "tentativa_login",
        }
      })

      res.status(400).json({ erro: mensaPadrao })
    }
  } catch (error) {
    res.status(400).json(error)
  }
})


router.post("/notoken", async (req, res) => {
  const { email, senha } = req.body

  const mensaPadrao = "Login ou senha incorretos"

  if (!email || !senha) {
    res.status(400).json({ erro: mensaPadrao })
    return
  }

  try {
    const usuario = await prisma.usuario.findFirst({
      where: { email }
    })

    if (usuario == null) {
 
      res.status(400).json({ erro: mensaPadrao })
      return
    }

    if (bcrypt.compareSync(senha, usuario.senha)) {
      const token = jwt.sign({
        userLogadoId: usuario.id,
        userLogadoNome: usuario.nome
      },
        process.env.JWT_KEY as string,
        { expiresIn: "1h" }
      )

      res.status(200).json({
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        token
      })
    } else {


      await prisma.log.create({
        data: { 
          descricao: "Tentativa de Acesso Inválida",
          acao: "tentativa_login", 
          complemento: `Usuário: ${usuario.email}`,
          usuarioId: usuario.id
        }
      })

      res.status(400).json({ erro: mensaPadrao })
    }
  } catch (error) {
    res.status(400).json(error)
  }
})

router.put("/alterar-senha", async (req, res) => {
  const { email, senhaAtual, novaSenha } = req.body

  const mensaPadrao = "Dados inválidos"

  if (!email || !senhaAtual || !novaSenha) {
    res.status(400).json({ erro: mensaPadrao })
    return
  }

  try {
    const usuario = await prisma.usuario.findFirst({
      where: { email }
    })

    if (usuario == null) {
      res.status(400).json({ erro: "Usuário não encontrado" })
      return
    }


    if (!bcrypt.compareSync(senhaAtual, usuario.senha)) {
      await prisma.log.create({
        data: { 
          descricao: "Senha Inválida",
          acao: "senha_invalida", 
          complemento: `Usuário: ${usuario.email}`,
          usuarioId: usuario.id
        }
      })

      res.status(400).json({ erro: mensaPadrao })
      return
    }

    const senhaCriptografada = await bcrypt.hash(novaSenha, 10)

    await prisma.usuario.update({
      where: { id: usuario.id },
      data: { senha: senhaCriptografada }
    })

    res.status(200).json({ mensagem: "Senha alterada com sucesso" })
  } catch (error) {
    res.status(400).json(error)
  }
})

export default router