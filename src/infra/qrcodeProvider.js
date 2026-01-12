const qrcode = require('qrcode');
const Jimp = require('jimp'); // Importa a biblioteca Jimp
const IQRCodeGenerator = require('../domain/qrCodeGenerator');

/**
 * @class QRCodeProvider
 * Implementação de IQRCodeGenerator usando a biblioteca 'qrcode' e 'jimp' para logos e rodapé.
 */
class QRCodeProvider extends IQRCodeGenerator {
  /**
   * Gera um QR Code a partir de dados, com opção de adicionar uma logo, rodapé e personalizar cores/margem.
   * @param {string} data - Os dados a serem codificados.
   * @param {object} [options] - Opções de geração.
   * @param {string} [options.format='png'] - Formato de saída ('png', 'svg', 'base64').
   * @param {string} [options.logo] - Caminho para a imagem da logo a ser inserida no centro do QR Code (apenas para formato 'png').
   * @param {number} [options.logoSizeRatio=0.5] - Proporção do tamanho da área da logo (incluindo padding e fundo) em relação ao QR Code (ex: 0.5 para 50%).
   * @param {number} [options.logoPaddingRatio=0.25] - Proporção do espaçamento interno da logo em relação à sua área total (ex: 0.25 para 25%).
   * @param {number} [options.qrCodeModuleScale=8] - Número de pixels por módulo do QR Code. Um valor maior resulta em um QR Code maior e mais nítido.
   * @param {object} [options.color] - Opções de cor para o QR Code.
   * @param {string} [options.color.dark='#000000ff'] - Cor dos módulos do QR Code (padrão preto).
   * @param {string} [options.color.light='#ffffffff'] - Cor do fundo do QR Code (padrão branco).
   * @param {number} [options.margin=4] - Margem branca ao redor do QR Code (padrão 4).
   * @param {string} [options.errorCorrectionLevel='H'] - Nível de correção de erro (L, M, Q, H). 'H' é o mais robusto.
   * @param {object} [options.footer] - Opções para adicionar um rodapé (apenas para formato 'png').
   * @param {string} [options.footer.text] - Texto a ser exibido no rodapé.
   * @param {string} [options.footer.iconPath] - Caminho para a imagem do ícone (ex: cadeado).
   * @param {string} [options.footer.textColor='#000000ff'] - Cor do texto do rodapé.
   * @returns {Promise<string|Buffer>} O QR Code gerado.
   */
  async generate(data, options = {}) {
    const {
      format = 'png',
      logo,
      logoSizeRatio = 0.5,
      logoPaddingRatio = 0.25,
      qrCodeModuleScale = 8, // Nova opção para escala dos módulos do QR Code
      color = {},
      margin = 4,
      errorCorrectionLevel = 'H',
      footer,
    } = options;

    const qrcodeOptions = {
      errorCorrectionLevel: errorCorrectionLevel,
      color: {
        dark: color.dark || '#000000ff',
        light: color.light || '#ffffffff',
      },
      margin: margin,
      scale: qrCodeModuleScale, // Passa a escala desejada para os módulos
    };

    try {
      if (logo && format !== 'png') {
        console.warn('Logo insertion is only supported for PNG format. Ignoring logo for other formats.');
      }
      if (footer && format !== 'png') {
        console.warn('Footer insertion is only supported for PNG format. Ignoring footer for other formats.');
      }

      if (format === 'png') {
        let qrCodeBuffer = await qrcode.toBuffer(data, { ...qrcodeOptions, type: 'png' });
        let finalImage = await Jimp.read(qrCodeBuffer);

        if (logo) {
          const logoImage = await Jimp.read(logo);
          const qrWidth = finalImage.bitmap.width;
          const qrHeight = finalImage.bitmap.height;

          // Calcula o tamanho da área total que a logo (com padding e fundo) vai ocupar
          const logoAreaSide = Math.floor(Math.min(qrWidth, qrHeight) * logoSizeRatio);

          // Calcula o padding real em pixels
          const padding = Math.floor(logoAreaSide * logoPaddingRatio);

          // Calcula o tamanho máximo que a logo pode ter dentro do container, considerando o padding
          const maxLogoInnerWidth = logoAreaSide - (padding * 2);
          const maxLogoInnerHeight = logoAreaSide - (padding * 2);

          // Cria um Jimp com fundo da mesma cor do fundo do QR Code para a área da logo
          const logoContainer = new Jimp(logoAreaSide, logoAreaSide, Jimp.cssColorToHex(qrcodeOptions.color.light));

          // Redimensiona a logo para caber dentro do espaço disponível, mantendo a proporção
          logoImage.scaleToFit(maxLogoInnerWidth, maxLogoInnerHeight);

          // Calcula a posição para centralizar a logo dentro do container, respeitando o padding
          const logoXInContainer = padding + (maxLogoInnerWidth - logoImage.bitmap.width) / 2;
          const logoYInContainer = padding + (maxLogoInnerHeight - logoImage.bitmap.height) / 2;

          // Componha a logo no centro do container
          logoContainer.composite(logoImage, logoXInContainer, logoYInContainer);

          // Calcula a posição para centralizar o container da logo no QR Code
          const x = (qrWidth - logoAreaSide) / 2;
          const y = (qrHeight - logoAreaSide) / 2;

          // Componha o container da logo (com fundo e logo) no QR Code final
          finalImage.composite(logoContainer, x, y);
        }

        if (footer && footer.text) {
          const footerHeight = 50; // Altura fixa para a área do rodapé
          const originalQrWidth = finalImage.bitmap.width;
          const originalQrHeight = finalImage.bitmap.height;

          // Cria uma nova imagem com altura extra para o rodapé
          const imageWithFooter = new Jimp(originalQrWidth, originalQrHeight + footerHeight, Jimp.cssColorToHex(qrcodeOptions.color.light));
          imageWithFooter.composite(finalImage, 0, 0); // Posiciona o QR code na parte superior

          const font = await Jimp.loadFont(Jimp.FONT_SANS_16_BLACK); // Fonte padrão
          const textColor = footer.textColor || '#000000ff'; // Cor do texto do rodapé
          const hexTextColor = Jimp.cssColorToHex(textColor);

          let contentWidth = 0;
          let iconImage = null;
          const iconSize = 24; // Tamanho desejado para o ícone

          if (footer.iconPath) {
            try {
              iconImage = await Jimp.read(footer.iconPath);
              iconImage.resize(iconSize, Jimp.AUTO); // Redimensiona o ícone, mantendo a proporção
              contentWidth += iconImage.bitmap.width;
            } catch (iconError) {
              console.warn(`Could not load footer icon from ${footer.iconPath}. Generating footer without icon.`, iconError.message);
              iconImage = null; // Garante que não tentaremos usar um ícone que falhou ao carregar
            }
          }

          const textWidth = Jimp.measureText(font, footer.text);
          contentWidth += textWidth;

          // Adiciona preenchimento entre o ícone e o texto se ambos existirem
          if (iconImage && footer.text) {
            contentWidth += 10; // Preenchimento
          }

          const startX = (originalQrWidth - contentWidth) / 2;
          let currentX = startX;
          const centerY = originalQrHeight + (footerHeight / 2);

          if (iconImage) {
            const iconY = centerY - (iconImage.bitmap.height / 2);
            imageWithFooter.composite(iconImage, currentX, iconY);
            currentX += iconImage.bitmap.width + 10; // Move currentX para depois do ícone e preenchimento
          }

          // Imprime o texto
          imageWithFooter.print(font, currentX, centerY - (Jimp.measureTextHeight(font, footer.text, originalQrWidth) / 2), {
            text: footer.text,
            alignmentX: Jimp.HORIZONTAL_ALIGN_LEFT,
            alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE,
            color: hexTextColor // Aplica a cor do texto
          }, originalQrWidth - currentX, footerHeight);

          finalImage = imageWithFooter;
        }

        return await finalImage.getBufferAsync(Jimp.MIME_PNG);
      } else if (format === 'svg') {
        return await qrcode.toString(data, { ...qrcodeOptions, type: 'svg' });
      } else if (format === 'base64') {
        return await qrcode.toDataURL(data, { ...qrcodeOptions, type: 'image/png' });
      } else {
        throw new Error(`Unsupported QR Code format: ${format}`);
      }
    } catch (error) {
      console.error('Error generating QR Code:', error);
      throw new Error('Failed to generate QR Code.');
    }
  }
}

module.exports = QRCodeProvider;