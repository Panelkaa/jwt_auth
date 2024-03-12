const userService = require('../service/user-service');
const db = require('../db');
require('dotenv').config();

class UserController {
    async registration(req, res, next) {
        try {
            const {email, password} = req.body;
            const userData = await userService.registration(email, password);
            res.cookie('refreshToken', userData.refreshToken, {maxAge: 15 * 24 * 60 * 60 * 1000, httpOnly: true})
            return res.json(userData);
        } catch (error) {    
            console.log(error);         
        }
    }

    async login(req, res, next) {
        try {

        } catch (err) {

        }
    }

    async logout(req, res, next) {
        try {

        } catch (err) {

        }
    }

    async refresh(req, res, next) {
        try {

        } catch (err) {

        }
    }

    async activate(req, res, next) {
        try {
            const activationLink = req.params.link
            await userService.activate(activationLink)
            return res.redirect(process.env.CLIENT_URL)
        } catch (err) {
            console.log(err)
        }
    }

    async getUsers(req, res, next) {
        await db.execute('SELECT * FROM jwt_auth.user WHERE email = "intcodee@gmail.com"')
            .then(([data, fields]) => {res.json(data)})
            .catch(error => {
                console.log(error);
            })   
    }

}

module.exports = new UserController();