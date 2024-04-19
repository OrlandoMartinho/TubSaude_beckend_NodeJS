const secretKey = require('../private/secretKey.json');
const jwt = require('jsonwebtoken');
const db = require('../config/dbConfig');

const token = {
    usuarioId: (accessToken) => {
        try {
            const decodedToken = jwt.verify(accessToken, secretKey.secretKey)
            if (decodedToken) {
                return decodedToken.id;
            } else {
                return null;
            }
        } catch (err) {
            return null;
        }
    }
    ,
    usuarioSenha:(accessToken)=>{
        try {
            const decodedToken = jwt.verify(accessToken, secretKey.secretKey)
            if (decodedToken) {
                return decodedToken.senha;
            } else {
                return null;
            }
        } catch (err) {
            return null;
        }

    },
    usuarioEmail: (accessToken) => {
        try {
            const decodedToken = jwt.verify(accessToken, secretKey.secretKey);
            if (decodedToken && decodedToken.user && decodedToken.user.id) {
                return decodedToken.user.email;
            } else {
                return null;
            }
        } catch (err) {
            return null;
        }
    },
    ExtrairTokenAdm: (accessToken) => {
        try {
            const decodedToken = jwt.verify(accessToken, secretKey.secretKey);
            if (!decodedToken.accessToken) {
                return null;
            } else {
                return decodedToken.accessToken;
            }
        } catch (err) {
            return null;
        }
    },
    admId: (accessToken) => {
        try {
            const decodedToken = jwt.verify(accessToken, secretKey.secretKey);
            if (decodedToken.user.id != null) {
                return decodedToken.user.id;
            } else {
                return null;
            }
        } catch (err) {
            return null;
        }
    },
    admEmail: (accessToken) => {
        try {
            const decodedToken = jwt.verify(accessToken, secretKey.secretKey);
            if (decodedToken && decodedToken.user && decodedToken.user.id) {
                return decodedToken.user.email;
            } else {
                return null;
            }
        } catch (err) {
            return null;
        }
    },
    verificarTokenMedico: (accessToken) => {
        return new Promise((resolve, reject) => {
            const email = token.medicoId(accessToken);
            const query = 'SELECT accessToken FROM medicos WHERE id_medico = ?';
            db.query(query, [email], (err, result) => {
                if (err) {
                    console.error('Erro ao buscar token do médico:', err);
                    reject(err);
                } else {
                    if (result.length === 0) {
                        resolve(false);
                    } else {
                        const medicoToken = result[0].accessToken;
                        resolve(medicoToken === accessToken);
                    }
                }
            });
        });
    },
    
    verificarTokenUsuario: (accessToken) => {
        return new Promise((resolve, reject) => {
            const email = token.usuarioId(accessToken);
            const query = 'SELECT token FROM usuarios WHERE id_usuario = ?';
            db.query(query, [email], (err, result) => {
                if (err) {
                    console.error('Erro ao buscar token do usuário:', err);
                    reject(err);
                } else {
                    if (result.length === 0) {
                        resolve(false);
                    } else {
                        const userToken = result[0].token;
                        resolve(userToken === accessToken);
                    }
                }
            });
        });
    },
    
    verificarEmailUsuario: (email) => {
        return new Promise((resolve, reject) => {
            const query = 'SELECT * FROM usuarios WHERE email = ?';
            db.query(query, [email], (err, result) => {
                if (err) {
                    console.error('Erro ao buscar email do usuário:', err);
                    reject(err);
                } else {
                    resolve(result.length === 0);
                }
            });
        });
    },
    
    
    
};

module.exports = token;
