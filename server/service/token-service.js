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
            // return tokenData.save();
        }
        const token = await db.execute(`INSERT INTO jwt_auth.token(user, refreshToken) VALUES (${userId}, "${refreshToken}")`)
            .then((data) => data)
            .catch(error => {
                console.log(error);
            })  

        return token;
    }
}

module.exports = new TokenService();