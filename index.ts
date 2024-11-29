import express from 'express'
import routesUsuarios from './routes/usuarios'
import routesLogin from './routes/login'
import routesSistema from './routes/sistemas'

const app = express()
const port = 3000

app.use(express.json())

app.use('/usuarios', routesUsuarios)
app.use('/login', routesLogin)
app.use('/sistemas', routesSistema)

app.get('/', (req, res) => {    
    res.send('Api Login com Segurança')
})

app.listen(port, () => {
    console.log(`Servidor rodando na porta: ${port}`)
})