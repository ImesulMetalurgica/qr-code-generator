/**
 * @interface IQRCodeGenerator
 * Define o contrato para serviços de geração de QR Code.
 */
class IQRCodeGenerator {
  /**
   * Gera um QR Code a partir de um payload de dados.
   * @param {string} data - Os dados a serem codificados no QR Code (geralmente um JSON stringificado).
   * @param {object} options - Opções de geração (ex: format, errorCorrectionLevel).
   * @returns {Promise<string|Buffer>} Uma Promise que resolve com o QR Code gerado no formato especificado.
   * @throws {Error} Se houver um erro na geração do QR Code.
   */
  async generate(data, options) {
    throw new Error('Method "generate" must be implemented.');
  }
}

module.exports = IQRCodeGenerator;
