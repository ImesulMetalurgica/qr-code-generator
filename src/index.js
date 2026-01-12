const IQRCodeGenerator = require('./domain/qrCodeGenerator');
const QRCodeProvider = require('./infra/qrcodeProvider');
const QRCodeService = require('./service/qrCodeService');
const QRCodeController = require('./controller/qrCodeController');

// Composição das dependências
const qrCodeProvider = new QRCodeProvider();
const qrCodeService = new QRCodeService(qrCodeProvider);
const qrCodeController = new QRCodeController(qrCodeService);

// Exporta o controlador para ser usado como a interface principal do módulo
module.exports = qrCodeController;

// Exemplo de uso (opcional, pode ser removido em produção ou movido para um arquivo de exemplo)
async function runExample() {
  const jsonData = {
    id: '12345',
    product: 'Example Product',
    price: 99.99,
    currency: 'BRL',
    timestamp: new Date().toISOString(),
    details: {
      store: 'Online Store',
      location: 'Brazil'
    }
  };

  console.log('Generating QR Code (PNG Buffer)...');
  try {
    const pngBuffer = await qrCodeController.generate({ data: jsonData, format: 'png' });

    console.log(`data:image/png;base64,${pngBuffer.toString('base64')}`);


  } catch (error) {
    console.error('Error during example run:', error.message);
  }
}

// Para executar o exemplo, descomente a linha abaixo
// runExample();
