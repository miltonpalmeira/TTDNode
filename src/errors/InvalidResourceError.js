module.exports = function InvalidResourceError(message = 'Este recurso não pertence ao usuário') {
    this.name = 'InvalidResourceError';
    this.message = message;
}