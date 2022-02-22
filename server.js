const Sequelize = require('sequelize');
const sequelize = new Sequelize(process.env.DATABASE_URL || 'postgres://localhost/caffeine_drinks_db')

const Drinks = sequelize.define('drinks', {
    name: {
        type: Sequelize.STRING
    }
})


const init = async() => {
    try {
        await sequelize.sync({ force: true })
        console.log('starting')
    }
    catch(ex) {
        console.log(ex)
    }
}

init()