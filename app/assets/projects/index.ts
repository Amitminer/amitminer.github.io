import Portfolio from './portfolio.webp';
import CompressorX from './compressorx.webp';
import EncryptX from './encryptx.webp';
import DocsX from './docsx.webp';
import GeoGusserX from './geogusserx.webp';
import CompressCLI from './compresscli.webp';

import { StaticImageData } from 'next/image';

export const projectImages: Record<string, StaticImageData> = {
	'amitminer-portfolio': Portfolio,
	'compressorx': CompressorX,
	'encryptx': EncryptX,
	'docsx': DocsX,
	'geogusserx': GeoGusserX,
	'compresscli': CompressCLI,
};
