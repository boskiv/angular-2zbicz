export const binanceSpotDomain = 'www.binance.com';
export const binanceSpotWSDomain = 'fstream.binance.com';
export const baseDomain = 'n1.zelezyaka.ru';
export const klineDomain = 'test.zelezyaka.ru';

export const encryptionKey = '0123456789abcdef';
export const environment = {
  name: 'development',
  sentryDSN:
    'https://ef41f443b4014ec7bb835d1ed0c1f259@o4505028884365312.ingest.sentry.io/4505028885282816',
  firebase: {
    apiKey: 'AIzaSyANPTfC-8sGJ97jEieiqu1npXEHi3wnUTw',
    authDomain: 'spreadfighter.firebaseapp.com',
    projectId: 'spreadfighter',
    storageBucket: 'spreadfighter.appspot.com',
    messagingSenderId: '1003234821057',
    appId: '1:1003234821057:web:d7a1ff49d27a40493c2540',
    measurementId: 'G-GD1KPHWWVD',
    functionsURL: 'https://us-central1-spreadfighter.cloudfunctions.net',
  },
  production: false,
  serviceDomain: `${baseDomain}`,
  calendarApiURL: `https://${baseDomain}/coinmarketcal/events`,
  guidedWsURL: `wss://${baseDomain}/ws/guides`,
  spikeWsURL: `wss://${baseDomain}/ws-uat/strategies`,
  spikeApiURL: `https://${baseDomain}/api/strategies`,
  stopKillerWsURL: `wss://${baseDomain}/ws-uat/stopKillers`,
  stopKillerApiURL: `https://${baseDomain}/api/stopKillers`,
  liquidationsURL: `https://${baseDomain}/api/liquidations`,
  manipulationWsURL: `wss://${baseDomain}/ws-uat/manipulationMonitors`,
  dictManipulationWsURL: `wss://${baseDomain}/ws-uat/dictManipulationMonitors`,
  manipulationApiURL: `https://${baseDomain}/api/manipulationMonitors`,
  openInterestApiURL: `http://localhost:2222/api/openInterests`,
  openInterestWS: `wss://${baseDomain}/ws/openInterests`,
  prePumpDetectorURL: `https://${baseDomain}/api/prePumpDetectors`,
  prePumpDetectorWS: `wss://${baseDomain}/ws-uat/prePumpDetectors`,
  newsApiURL: `https://${baseDomain}/api/cryptoPanicNews`,
  newsWsURL: `wss://${baseDomain}/ws-uat/cryptoPanicNews`,
  premiumIndexAPI: `https://${binanceSpotDomain}/fapi/v1/marketKlines`,
  premiumIndexWS: `wss://${binanceSpotWSDomain}/stream`,
  structureMapWsURL: `wss://${baseDomain}/ws-uat/structMapAvgs`,
  santimentsApiURL: `https://${baseDomain}api/santiments`,
  dictStructureMapWsURL: `wss://${baseDomain}/ws-uat/dictMapAvgs`,
  dictPricesMapWsURL: `wss://${baseDomain}/ws/dictPrices`,
  hiLowWsURL: `wss://${baseDomain}/ws/hiLowScanners`,
  dictHiLowWsURL: `wss://${baseDomain}/ws/dictHiLowScanners`,
  tickIndexWsURL: `wss://${baseDomain}/ws/tickIndexes`,
  binanceWS: 'wss://fstream.binance.com',
  sfNewsWsURL: `wss://${baseDomain}/ws/sfNews`,
  sfNewsApiURL: `https://${baseDomain}/news/api/messages`,
  sfNewsImagesApiURL: `https://${baseDomain}/news/api/getFileLink/`,
  quickNodeURL:
    'https://fabled-sleek-liquid.matic.discover.quiknode.pro/7ff49b385c096091ebaabe810672816eb5863bce/',
  infura: {
    nftURL: 'https://nft.api.infura.io',
    accessKey: 'ecdeb3d91ae2435c8f458747f66a8071',
    secretKey: 'b1fff038da704ac7a2699cc4f35a0801',
  },
  contractAddress: {
    alpha: '0x45009830025140dd71cc34a7df93313545ed0598',
    beta: '0xd3ef2892575f86022d94c1454c2cc6e6ea710223',
    eat: '0xb6db2c1923dad7411dad2c0c16c9997e5a481fe8',
  },
};
