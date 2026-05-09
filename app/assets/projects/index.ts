import Portfolio from './portfolio.webp';
import CompressorX from './compressorx.webp';
import EncryptX from './encryptx.webp';
import DocsX from './docsx.webp';
import GeoGusserX from './geogusserx.webp';
import CompressCLI from './compresscli.webp';

// Note: For preview images, I'm using the project's thumbnail image as the preview.
import PortfolioPreview from './portfolio.webp'; // using thumbnail as preview
import EncryptXPreview from './encryptx.webp';   // using thumbnail as preview
import DocsXPreview from './docsx.webp';         // using thumbnail as preview
import GeoGusserXPreview from './geogusserx.webp'; // using thumbnail as preview
import CompressCLIPreview from './compresscli.webp'; // using thumbnail as preview

import { StaticImageData } from 'next/image';

export const projectImages: Record<string, StaticImageData> = {
	'amitminer-portfolio': Portfolio,
	'compressorx': CompressorX,
	'encryptx': EncryptX,
	'docsx': DocsX,
	'geogusserx': GeoGusserX,
	'compresscli': CompressCLI,
};

export const previewImages: Record<string, StaticImageData> = {
	'amitminer-portfolio': PortfolioPreview,
	'compressorx': CompressorX,
	'encryptx': EncryptXPreview,
	'docsx': DocsXPreview,
	'geogusserx': GeoGusserXPreview,
	'compresscli': CompressCLIPreview,
};
