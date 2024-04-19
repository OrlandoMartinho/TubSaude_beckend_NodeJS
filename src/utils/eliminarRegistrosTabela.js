const db = require('../config/dbConfig')


const deleteTable={
   
    eliminarRegistrosPorIdUsuario: async (id_usuario, tabelas) => {
        try {
            // Obter o id_usuario correspondente ao id_usuario
            const [usuario] = await db.query('SELECT id_usuario FROM usuarios WHERE id_usuario = ?', [id_usuario]);
    
            if (!usuario) {
                return { mensagem: 'Usuário não encontrado' };
            }
    
            // Objeto para rastrear o número de registros excluídos em cada tabela
            const registrosExcluidos = {};
    
            // Deletar o usuário da tabela 'usuarios'
            await db.query('DELETE FROM usuarios WHERE id_usuario = ?', [id_usuario]);
            registrosExcluidos['usuarios'] = 1;
    
            // Eliminar o id_usuario e o código de confirmação da tabela 'codigos_verificacao'
            await db.query('DELETE FROM codigos_verificacao WHERE id_usuario = ?', [id_usuario]);
            registrosExcluidos['codigos_verificacao'] = 1;
    
            // Eliminar os registros em todas as tabelas usando o id_usuario
            for (const tabela of tabelas) {
                const [result] = await db.query(`DELETE FROM ${tabela} WHERE id_usuario = ?`, [id_usuario]);
                registrosExcluidos[tabela] = result.affectedRows;
            }
    
            // Verificar se pelo menos um registro foi excluído de cada tabela
            for (const tabela in registrosExcluidos) {
                if (registrosExcluidos[tabela] === 0) {
                    return { mensagem: `Nenhum registro excluído da tabela ${tabela}` };
                }
            }
    
            return { mensagem: 'Usuário excluído com sucesso' };
        } catch (err) {
            console.error('Erro ao excluir o usuário:', err);
            return { mensagem: 'Erro ao excluir o usuário' };
        }
    }
    
    
    
    }
    





module.exports = deleteTable
