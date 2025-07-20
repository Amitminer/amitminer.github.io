import Portfolio from './portfolio.webp';
import CompressorX from './compressorx.webp';
import EncryptX from './encryptx.webp';
import DocsX from './docsx.webp';

// Note: For preview images, I'm using the project's thumbnail image as the preview.
// For CompressorX, a dedicated preview image is used.
import CompressorXPreview from './preview/compressorx_hero.webp';
import PortfolioPreview from './portfolio.webp'; // using thumbnail as preview
import EncryptXPreview from './encryptx.webp';   // using thumbnail as preview
import DocsXPreview from './docsx.webp';         // using thumbnail as preview

import { StaticImageData } from 'next/image';

export const projectImages: Record<string, StaticImageData> = {
  'amitminer-portfolio': Portfolio,
  'compressorx': CompressorX,
  'encryptx': EncryptX,
  'docsx': DocsX,
};

export const previewImages: Record<string, StaticImageData> = {
  'amitminer-portfolio': PortfolioPreview,
  'compressorx': CompressorXPreview,
  'encryptx': EncryptXPreview,
  'docsx': DocsXPreview,
}; 