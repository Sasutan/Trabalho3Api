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
    // Encontrar o usuário pelo e-mail
    const usuario = await prisma.usuario.findFirst({
      where: { email }
    })

    if (usuario == null) {
      res.status(400).json({ erro: mensaPadrao })
      return
    }

    // Comparar a senha fornecida com a senha armazenada no banco
    if (bcrypt.compareSync(senha, usuario.senha)) {
      // Registrar a data/hora do último login
      const dataAtual = new Date()

      await prisma.usuario.update({
        where: { id: usuario.id },
        data: { ultimoAcesso: dataAtual } // Atualizando a data do último login
      })

      // Gerar o token JWT
      const token = jwt.sign({
        userLogadoId: usuario.id,
        userLogadoNome: usuario.nome
      }, process.env.JWT_KEY as string, { expiresIn: "1h" })

      // Exibir a mensagem de boas-vindas
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
      // Caso a senha não seja correta, registrar tentativa de login inválida
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

    // Validar a senha atual
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

    // Criptografar a nova senha
    const senhaCriptografada = await bcrypt.hash(novaSenha, 10)

    // Atualizar a senha no banco de dados
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