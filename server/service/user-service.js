const db = require('../db');
const bcrypt = require('bcrypt')
const uuid = require('uuid')
const mailService = require ('./mail-service');
const tokenService = require('./token-service');
const ApiError = require('../exceptions/api-error');
const UserDto = require('../dtos/user-sto');
class UserService {
    async registration(email, password) {
        const userVerification = await db.execute(`SELECT * FROM jwt_auth.user WHERE email = "${email}"`)
            .then(([data, fields]) => {data})
            .catch(error => {
                console.log(error, 'Такой пользователь уже есть');
            })  
        
        if(userVerification) {
            throw ApiError.BadRequest(`Пользователь с почтой ${email} уже существует`)
        }
        const hashPassword = await bcrypt.hash(password, 3); 
        const activationLink = uuid.v4();

        const user = await db.execute(
            `INSERT INTO jwt_auth.user(email, password, isActivated, activationLink) 
            VALUES ("${email}", "${hashPassword}", "0", "${activationLink}");`)
            .then((data) => data[0])
            .catch(() => {
                throw ApiError.BadRequest(`Пользователь с почтой ${email} уже существует`)
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
                throw ApiError.BadRequest('Некорректная ссылка активации')
            }) 

            if(user) {
                await db.execute(
                `UPDATE jwt_auth.user 
                SET isActivated = true
                WHERE idUser = ${user[0]}`)
                .then((data)=> data)
                .catch(() => {
                    throw ApiError.BadRequest('Ссылка не активирована')
                }) 
            }
    }

    async login(email, password) {
        const user = await db.execute(`SELECT * FROM jwt_auth.user WHERE email = "${email}"`)
            .then((data) => data[0])

        if(user.length == []) {
            throw ApiError.BadRequest(`Пользователь с таким email не найден`)
        }

        const userDto = new UserDto(...user);
        const idPassEquals = await bcrypt.compare(password, userDto.password);
        
        if(!idPassEquals) {
            throw ApiError.BadRequest(`Неверный пароль`)
        }
        
        const tokens = tokenService.generateTokens({...user}); 
        await tokenService.saveToken(userDto.idUser, tokens.refreshToken);

        return { ...tokens, user: user }
    }

    async logout(refreshToken) {
        const token = await tokenService.removeToken(refreshToken)
        return token;
    }

    async refresh(refreshToken) {
        if(!refreshToken) {
            throw ApiError.UnauthorizedError();
        }

        const userData = tokenService.validateRefreshToken(refreshToken);
        const tokenFromDb = await tokenService.findToken(refreshToken)
        if(!userData || !tokenFromDb) {
            throw ApiError.UnauthorizedError();
        }  

        const user = await db.execute(`SELECT * FROM jwt_auth.user WHERE email = "${email}"`)
            .then((data) => data[0])

        const userDto = new UserDto(...user);
        const tokens = tokenService.generateTokens({...user}); 

        await tokenService.saveToken(userDto.idUser, tokens.refreshToken);

        return { ...tokens, user: user }
    }

    async getAllUser() {
        const users = db.execute(
            `SELECT * FROM jwt_auth.user`)
            .then((data) => data[0])

        return users;
    }
 }

module.exports = new UserService();