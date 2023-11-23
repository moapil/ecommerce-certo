const { DataTypes } = require('sequelize')
const db = require('../db/conn')

const Produto = db.define('produto',{
    nome: {
        type: DataTypes.STRING(50), // nome do usuário
        allowNull: false  // não permite que o campo seja nulo
    },
    quantidadeEstoque: {
        type: DataTypes.STRING(100),  // nome.sobrenome@gmail.com,
        allowNull: false,  // não permite que o campo seja nulo
    },    
    precoUnitario: {
        type: DataTypes.FLOAT(12),  // (047) 9 8877 6655
        allowNull: false
    }
},{
    createdAt: false,
    updatedAt: false
})

//   Produto.sync({force:true})

module.exports = Produto