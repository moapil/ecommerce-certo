const { DataTypes } = require('sequelize')
const db = require('../db/conn')

const Usuario = db.define('usuario',{
    nome: {
        type: DataTypes.STRING(50), // nome do usuário
        allowNull: false  // não permite que o campo seja nulo
    },
    email: {
        type: DataTypes.STRING(100),  // nome.sobrenome@gmail.com,
        allowNull: false,  // não permite que o campo seja nulo
        unique: true  // Certifique-se de que os emails sejam únicos
    },    
    telefone: {
        type: DataTypes.INTEGER(12)  // (047) 9 8877 6655
    },
    cpf: {
        type: DataTypes.INTEGER(11),  // 999 888 777 66
        allowNull: false,  // não permite que o campo seja nulo
        unique: true  // Certifique-se de que o CPF seja único
    },
    senha: {
        type: DataTypes.STRING(100),  // sem regras, definida pelo usuário
        allowNull: false  // não permite que o campo seja nulo
    },
    tipo:{
        type: DataTypes.STRING(30) // cliente e admin
    }
},{
    createdAt: false,
    updatedAt: false
})

//  Usuario.sync({force:true})

module.exports = Usuario