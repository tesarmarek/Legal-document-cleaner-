/* eslint-env node */

const { configure } = require('quasar/wrappers');

module.exports = configure(function (ctx) {
  return {
    supportTS: true,
    boot: [],
    css: [],
    extras: [
      'roboto-font',
      'material-icons',
    ],
    build: {
      target: {
        browser: ['es2019', 'edge88', 'firefox78', 'chrome87', 'safari13.1'],
        node: 'node16'
      },
      vueRouterMode: 'hash',
    },
    devServer: {
      server: {
        type: 'http'
      },
      port: ctx.mode.ssr ? 9100 : 3000,
      open: true
    },
    framework: {
      config: {},
      plugins: []
    },
    animations: [],
    ssr: {
      pwa: false,
      prodPort: 3000,
      middlewares: [
        'render'
      ]
    },
    pwa: {
      workboxMode: 'generateSW',
      injectPwaMetaTags: true,
      swFilename: 'sw.js',
      manifestFilename: 'manifest.json',
      useCredentialsForManifestTag: false
    },
    cordova: {
    },
    capacitor: {
      hideSplashscreen: false
    },
    electron: {
      inspectPort: 5858,
      bundler: 'packager',
      packager: {
      },
      builder: {
        appId: 'html-cleaner'
      }
    },
    bex: {
      contentScripts: [
        'my-content-script'
      ],
    }
  }
}); 