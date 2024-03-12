const db = require('../db');
const bcrypt = require('bcrypt')
const uuid = require('uuid')
const mailService = require ('./mail-service');
const tokenService = require('./token-service');

class UserService {
    async registration(email, password) {
        const userVerification = await db.execute(`SELECT * FROM jwt_auth.user WHERE email = "${email}"`)
            .then(([data, fields]) => {data})
            .catch(error => {
                console.log(error, 'Такой пользователь уже есть');
            })  
        
        if(userVerification) {
            throw new Error(`Пользователь с почтой ${email} уже существует`)
        }
        const hashPassword = await bcrypt.hash(password, 3); 
        const activationLink = uuid.v4();

        const user = await db.execute(
            `INSERT INTO jwt_auth.user(email, password, isActivated, activationLink) 
            VALUES ("${email}", "${hashPassword}", "0", "${activationLink}");`)
            .then((data) => data[0]
            )
            .catch(error => {
                console.log(error.message = 'Такой пользователь уже существует')
            })  
        
        await mailService.sendActivationMail(email, `${process.env.API_URL}/api/activate/${activationLink}`);
        const tokens = tokenService.generateTokens({...user}); 
        await tokenService.saveToken(user.insertId, tokens.refreshToken);

        return {
            ...tokens,
            user: user
        }
    }

    async activate(activationLink) {
        const user = await db.execute(
            `SELECT idUser FROM jwt_auth.user WHERE activationLink = "${activationLink}"`)
            .then((data)=> data.map(function(item) {
                return item[0].idUser;
            }))
            .catch(() => {
                throw new Error('Некорректная ссылка активации')
            }) 

            if(user) {
                await db.execute(
                `UPDATE jwt_auth.user 
                SET isActivated = true
                WHERE idUser = ${user[0]}`)
                .then((data)=> data)
                .catch(() => {
                    throw new Error('Некорректная нет')
                }) 
            }
    }
 }

module.exports = new UserService();