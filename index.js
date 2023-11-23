const express = require('express')
const app = express()
const handlebars = require('express-handlebars')
const conn = require('./db/conn')
const bcrypt = require('bcrypt')
const Usuario = require('./models/Usuario')
const Produto = require('./models/Produto')

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

//gerenciador

//cadastrar

app.post('/cadastrar_prod', async (req,res)=>{
    const nome = req.body.nome
    const quantidadeEstoque = req.body.quantidadeEstoque
    const precoUnitario = req.body.precoUnitario
    console.log(nome, quantidadeEstoque, precoUnitario)
    let msg = 'Dados Cadastrados'
    if((quantidadeEstoque != '')&&(precoUnitario != '')){
        await Produto.create({nome:nome,quantidadeEstoque: quantidadeEstoque, precoUnitario: precoUnitario})
        res.render('cadastrar_prod', {log, usuario, tipoUsuario, msg})
    }else{
        res.render('cadastrar_prod', {log, usuario, tipoUsuario, msgB})
    }
})

app.get('/cadastrar_prod', (req,res)=>{
    res.render('cadastrar_prod', {log, usuario, tipoUsuario})
})

app.get('/gerenciador', (req,res)=>{
    res.render('gerenciador', {log, usuario, tipoUsuario})    
})

//listar

app.get('/listar', async (req,res)=>{
    const dados = await Produto.findAll({raw:true})
    console.log(dados)
    res.render('listar', {log, usuario, tipoUsuario, valores:dados})
})

app.get('/listar_cli', async (req,res)=>{
    const dados = await Usuario.findAll({raw:true})
    console.log(dados)
    res.render('listar_cli', {log, usuario, tipoUsuario, dados})
})

//apagar

app.post('/apagar', async(req,res)=>{
    const id = req.body.id
    const msg = 'Dados Apagados'
    const msgB = 'Erro ao apagar'
    const pesq = await Produto.findOne({raw:true, where:{id:id}})
    if(pesq != null){
        await Produto.destroy({where:{id:id}})
        res.render('apagar', {log, usuario, tipoUsuario, msg})
    }else{
        res.render('apagar', {log, usuario, tipoUsuario, msgB})
    }
})

app.get('/apagar', (req,res)=>{
    res.render('apagar', {log, usuario, tipoUsuario})
})


app.post('/apagar_cli', async(req,res)=>{
    const id = req.body.id
    const msg = 'Dados Apagados'
    const msgB = 'Erro ao apagar'
    const pesq = await Usuario.findOne({raw:true, where:{id:id}})
    if(pesq != null){
        await Usuario.destroy({where:{id:id}})
        res.render('apagar_cli', {log, usuario, tipoUsuario, msg})
    }else{
        res.render('apagar_cli', {log, usuario, tipoUsuario, msgB})
    }
})

app.get('/apagar_cli', (req,res)=>{
    res.render('apagar_cli', {log, usuario, tipoUsuario})
})

//atualizar

app.post('/atualiza', async (req,res)=>{
    const id = req.body.id
    const nome = req.body.nome
    const quantidadeEstoque = Number(req.body.quantidadeEstoque)
    const precoUnitario = Number(req.body.precoUnitario)
    console.log(id, nome, quantidadeEstoque, precoUnitario)
    const pesq = await Produto.findOne({raw:true, where: {id:id}})
    const dados = {
        nome:nome,
        quantidadeEstoque:quantidadeEstoque,
        precoUnitario:precoUnitario,
    }
    const msg = 'Dados Alterados'
    const msgB = 'Erro'
    console.log(dados)
    if(pesq != null){
        await Produto.update(dados, {where:{id:id}})
        res.render('atualiza', {log, usuario, tipoUsuario, msg})
    }else{
        res.render('atualiza', {log, usuario, tipoUsuario, msgB})
    }
})

//perfil usuario

app.post('/perfil', async(req,res)=>{
    const email = req.body.email
    const nome = req.body.nome
    const senha = req.body.senha
    const msg1 = 'Informações Atualizadas'
    const msg2 = 'Erro ao atualizar'
    const pesq = await Usuario.findOne({raw:true, where:{email:email}})
    console.log(pesq)
    
    if((pesq != null)&&(email != '')&&(nome != '')&&(senha != '')){
        bcrypt.hash(senha, 10, async (err,hash)=>{
            if(err){
                console.error('Erro ao criar o hash da senha'+err)
                res.render('perfil', {log, usuario, tipoUsuario, msg2})
                return
            }
            try{
                const dados ={
                    email:email,
                    nome:nome,
                    senha:hash
                }
                console.log(dados)
                await Usuario.update(dados, {where:{email:email}})
    
                const pesq = await Usuario.findOne({ raw: true, where:{email:email, nome:nome, senha: hash}})
                console.log(pesq)
                log = true
                nome = nome
    
                res.render('perfil', {log, usuario, tipoUsuario, msg1})
            }catch(error){
                console.error('Erro ao criar a senha',error)
                res.render('perfil', {log, usuario, tipoUsuario, msg2})
            }
        })
    }else{
        res.render('perfil', {log, usuario, tipoUsuario, msg2})
    }
})

app.get('/perfil', (req,res)=>{
    res.render('perfil', {log, usuario, tipoUsuario})
})

//comprar

app.post('/comprar', async(req,res)=>{
    const dados_carrinho = req.body
    console.log(dados_carrinho)

    const atualiza_promise = []
    for (const item of dados_carrinho){
        const produto = await Produto.findByPk(item.id, {raw:true})
        console.log(produto)
        if(!produto || produto.quantidadeEstoque < item.qtde){
            return res.status(400).json({message:"Produto esgotado" + produto.quantidadeEstoque})
        }
        const atualiza_promessas = await Produto.update(
            {quantidadeEstoque: produto.quantidadeEstoque - item.qtde},
            {where:{id: item.id}}
        )
        atualiza_promise.push(atualiza_promessas)
    }
    try{
        await Promise.all(atualiza_promise)
        res.status(200).json({message:"Compra realizada! Obrigado e volte sempre."})
    }catch(error){
        console.error('Erro ao atualizar os dados '+ error)
        res.status(500).json({message: "Erro ao processar a compra"})
    }
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

app.get('/atualiza',(req,res)=>{
    res.render('atualiza',{log, usuario, tipoUsuario})
})

app.get('/atualiza_cli',(req,res)=>{
    res.render('atualiza_cli',{log, usuario, tipoUsuario})
})

app.get('/cadastrar_prod',(req,res)=>{
    res.render('cadastrar_prod',{log, usuario, tipoUsuario})
})

// =================================================
conn.sync().then(()=>{
    app.listen(port,hostname,()=>{
        console.log(`Servidor ${hostname} rodando no ${port}`)
    })
}).catch((err)=>{
    console.log(`Não foi possível rodar o servidor devido ao erro ${err}`)
})