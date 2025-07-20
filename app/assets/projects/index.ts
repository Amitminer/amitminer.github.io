import Portfolio from './portfolio.webp';
import CompressorX from './compressorx.webp';
import EncryptX from './encryptx.webp';
import DocsX from './docsx.webp';

import CompressorXPreview from './preview/compressorx.webp';
import PortfolioPreview from './portfolio.webp';
import EncryptXPreview from './encryptx.webp';
import DocsXPreview from './docsx.webp';

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