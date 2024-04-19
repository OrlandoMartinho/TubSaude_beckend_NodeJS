import Ids from './Ids.js';

export default class Mensagem extends Ids {
    
    constructor(id, conteudo, remetente, destinatario, id_conversa, lido) {
        super(id); 


        this.conteudo = conteudo;
        this.remetente = remetente;
        this.destinatario = destinatario;
        this.id_conversa = id_conversa;
        this.lido = lido;

       


    }

}
