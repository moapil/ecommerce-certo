const express = require('express')
const app = express()
const handlebars = require('express-handlebars')
const conn = require('./db/conn')
const bcrypt = require('bcrypt')
const Usuario = require('./models/Usuario')

const port = 3000
const hostname = 'localhost'

let  log = false
let usuario = ""
let tipoUsuario = ''

// ==================== express ====================

app.use(express.urlencoded({extended:true}))
app.use(express.json())
app.use(express.static('public'))

// ==================== handlebars =================

app.set('view engine', 'handlebars')
app.engine('handlebars', handlebars.engine())

// ====================cadastro=========================

app.post('/cadastrar', async(req,res)=>{
    const nome = req.body.nome
    const email = req.body.email
    const telefone = Number(req.body.telefone)
    const cpf = Number(req.body.cpf)
    const senha = req.body.senha
    const tipo = 'cliente'

    console.log(nome,email,senha,telefone,cpf, tipo)

    bcrypt.hash(senha, 10, async (err,hash)=>{
        if(err){
            console.error('Erro ao criar o hash da senha'+err)
            res.render('home', {log, usuario, tipoUsuario})
            return
        }
        try{
            await Usuario.create({nome: nome, email: email,telefone: telefone, cpf: cpf, senha: hash, tipo:tipo})
            console.log('\n')
            console.log('Senha criptografada')
            console.log('\n')

            log = true

            const pesq = await Usuario.findOne({ raw: true, where:{ nome:nome, senha: hash}})
            console.log(pesq)

            res.render('home', {log, usuario, tipoUsuario})
        }catch(error){
            console.error('Erro ao criar a senha',error)
            res.render('home', {log, usuario, tipoUsuario})
        }
    })
})

app.get('/cadastrar', (req,res)=>{
    res.render('cadastrar', {log, usuario, tipoUsuario})
})

// ====================login=========================
app.post('/login', async (req,res)=>{
    const email = req.body.email
    const senha = req.body.senha
    console.log(email,senha)
    const pesq = await Usuario.findOne({raw:true, where:{email:email}})
    console.log(pesq)
    let msg = 'Usuário não Cadastrado'
    if(pesq == null){
        res.render('login', {msg})
        
    }else{
        // comparando a senha com o uso de hash
        bcrypt.compare(senha, pesq.senha, (err,resultado)=>{
           if(err){
                console.error('Erro ao comparar a senha',err)
                res.render('home', {log, usuario, tipoUsuario})
           }else if(resultado){
            console.log('Cliente existente')
            if(pesq.tipo === 'admin'){
                log = true
                usuario = pesq.usuario
                tipoUsuario = pesq.tipo
                console.log(tipoUsuario)
                res.render('gerenciador', {log, usuario, tipoUsuario})        
            }else if(pesq.tipo === 'cliente'){
                log = true
                usuario = pesq.usuario
                tipoUsuario = pesq.tipo
                console.log(usuario)
                res.render('home', {log, usuario, tipoUsuario})
           }
           }else{
            console.log('senha incorreta')
            res.render('home', {log, usuario, tipoUsuario})
           }
        })
    }
})

app.get('/login', (req,res)=>{
    log = false
    usuario = ''
    res.render('login', {log, usuario, tipoUsuario})
})

app.get('/logout', (req,res)=>{
    log = false
    usuario = ''
    res.render('home', {log, usuario, tipoUsuario})
})

//contato

app.post("/contato",async(req,res)=>{
    const email = req.body.email
    const msg = "Enviado para o suporte com sucesso!!"
    await Usuario.findOne({raw:true, where: {email:email}})

   res.render("contato",{log,usuario,tipoUsuario,msg})
})

// ============= renderizando ======================
app.get('/guitarras',(req,res)=>{
    res.render('guitarras',{log, usuario, tipoUsuario})
})
app.get('/logout',(req,res)=>{
    cliente = false
    gerenciador = false
    res.render('home',{log, usuario, tipoUsuario})
})
app.get('/home',(req,res)=>{
    res.render('home',{log, usuario, tipoUsuario})
})
app.get('/',(req,res)=>{
    res.render('home',{log, usuario, tipoUsuario})
})
app.get('/cadastrar',(req,res)=>{
    res.render('cadastrar',{log, usuario, tipoUsuario})
})
app.get('/carrinho',(req,res)=>{
    res.render('carrinho',{log, usuario, tipoUsuario})
})
app.get('/guitarras',(req,res)=>{
    res.render('guitarras',{log, usuario, tipoUsuario})
})
app.get('/login',(req,res)=>{
    res.render('login',{log, usuario, tipoUsuario})
})
app.get('/contato',(req,res)=>{
    res.render('contato',{log, usuario, tipoUsuario})
})


// =================================================
conn.sync().then(()=>{
    app.listen(port,hostname,()=>{
        console.log(`Servidor ${hostname} rodando no ${port}`)
    })
}).catch((err)=>{
    console.log(`Não foi possível rodar o servidor devido ao erro ${err}`)
})