const jwt = require('jsonwebtoken');
const db = require('../db');

class TokenService {
    generateTokens(payload) {
        const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {expiresIn: '30m'})
        const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {expiresIn: '30d'})
        return {
            accessToken,
            refreshToken
        }
    }

    validateAccessToken(token){
        try {
            const userData = jwt.verify(token, process.env.JWT_ACCESS_SECRET) 
            return userData;
        } catch(e) {
            return null;
        }
    } 

    validateRefreshToken(token){
        try {
            const userData = jwt.verify(token, process.env.JWT_REFRESH_SECRET) 
            return userData;
        } catch(e) {
            return null;
        }
    } 

    async saveToken(userId, refreshToken) {
        const tokenData = await db.execute(`SELECT * FROM jwt_auth.token WHERE user = ${userId}`)
            .then((data) => data)
            .catch(error => {
                console.log(error);
            }) 

        if(tokenData) {
            tokenData.refreshToken = refreshToken;
            db.execute(`UPDATE jwt_auth.token
            SET refreshToken = '${refreshToken}'
            WHERE user = '${userId}';`)
            .then((data) => data)
            .catch(error => {
                console.log(error);
            })  
        }

        const token = await db.execute(`INSERT INTO jwt_auth.token(user, refreshToken) VALUES (${userId}, "${refreshToken}")`)
            .then((data) => data)
            .catch(error => {
                console.log(error);
            })  

        return token;
    }

    async removeToken(refreshToken) {
        const tokenData = await db.execute(
            `DELETE FROM jwt_auth.token WHERE refreshToken = "${refreshToken}"`)
            .then((data) => data)

        return tokenData;
    }
    
    async findToken(refreshToken) {
        const tokenData = await db.execute(
            `SELECT * FROM jwt_auth.token WHERE refreshToken = "${refreshToken}"`)
            .then((data) => data)

        return tokenData;
    }
}

module.exports = new TokenService();