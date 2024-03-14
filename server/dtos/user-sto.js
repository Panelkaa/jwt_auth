module.exports = class UserDto {
    idUser;
    email;
    password;

    constructor(model) {
        this.idUser = model.idUser;
        this.email = model.email;
        this.password = model.password;
    }
}