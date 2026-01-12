// src/service/qrCodeService.js

/**
 * @class QRCodeService
 * Serviço responsável pela lógica de negócio para geração de QR Codes.
 * Inclui validação, serialização e orquestração com o gerador de QR Code.
 */
class QRCodeService {
  /**
   * @param {IQRCodeGenerator} qrCodeGenerator - Uma instância do gerador de QR Code.
   */
  constructor(qrCodeGenerator) {
    if (!qrCodeGenerator || typeof qrCodeGenerator.generate !== 'function') {
      throw new Error('A valid QR Code generator must be provided.');
    }
    this.qrCodeGenerator = qrCodeGenerator;
  }

  /**
   * Gera um QR Code a partir de um objeto JSON.
   * @param {object} jsonData - O objeto JSON a ser codificado.
   * @param {object} options - Opções para a geração do QR Code (ex: format).
   * @returns {Promise<string|Buffer>} O QR Code gerado.
   * @throws {Error} Se o JSON for inválido ou houver falha na geração.
   */
  async generateQRCodeFromJson(jsonData, options) {
    if (!jsonData || typeof jsonData !== 'object') {
      throw new Error('Invalid JSON data provided. Expected an object.');
    }

    let serializedData;
    try {
      serializedData = JSON.stringify(jsonData);
    } catch (error) {
      throw new Error('Failed to serialize JSON data: ' + error.message);
    }

    if (serializedData.length === 0) {
      throw new Error('Serialized JSON data is empty.');
    }

    return this.qrCodeGenerator.generate(serializedData, options);
  }
}

module.exports = QRCodeService;
