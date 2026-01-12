/**
 * @class QRCodeController
 * Controlador responsável por receber as requisições, validar a entrada
 * e orquestrar a geração do QR Code através do serviço.
 */
class QRCodeController {
  /**
   * @param {QRCodeService} qrCodeService - Uma instância do serviço de QR Code.
   */
  constructor(qrCodeService) {
    if (!qrCodeService) {
      throw new Error('A valid QR Code service must be provided.');
    }
    this.qrCodeService = qrCodeService;
  }

  /**
   * Manipula a requisição para gerar um QR Code.
   * @param {object} payload - O payload da requisição contendo os dados JSON e opções.
   * @param {object} payload.data - O objeto JSON a ser codificado.
   * @param {string} [payload.format='png'] - O formato de saída desejado ('png', 'svg', 'base64').
   * @returns {Promise<string|Buffer>} O QR Code gerado.
   * @throws {Error} Se a entrada for inválida ou a geração falhar.
   */
  async generate(payload) {
    const { data, format } = payload;

    if (!data) {
      throw new Error('Payload must contain "data" for QR Code generation.');
    }

    try {
      const qrCode = await this.qrCodeService.generateQRCodeFromJson(data, { format });
      return qrCode;
    } catch (error) {
      console.error('Error in QRCodeController:', error.message);
      throw new Error('Failed to generate QR Code: ' + error.message);
    }
  }
}

module.exports = QRCodeController;
