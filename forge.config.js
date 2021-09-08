const path = require('path');

module.exports =  {
  "packagerConfig": {
    "icon": "src/assets/icons/icon.ico",
    "executableName": "rss-app",
  },
  "makers": [
    {
      "name": "@electron-forge/maker-squirrel",
      "config": {
        "iconUrl": path.resolve(__dirname, 'src/assets/icons/icon.ico'),
        "setupIcon": path.resolve(__dirname, 'src/assets/icons/icon.ico')
      }
    },
    {
      "name": "@electron-forge/maker-zip",
      "platforms": [
        "darwin"
      ]
    },
    {
      "name": "@electron-forge/maker-deb",
      "config": {
        "options": {
          "icon": "src/assets/icons/png/128x128.png"
        }
      }
    },
    {
      "name": "@electron-forge/maker-rpm",
      "config": {}
    }
  ],
  "plugins": [
    [
      "@electron-forge/plugin-webpack",
      {
        "mainConfig": "./webpack.main.config.js",
        "renderer": {
          "config": "./webpack.renderer.config.js",
          "entryPoints": [
            {
              "html": "./src/index.html",
              "js": "./src/renderer.js",
              "name": "main_window",
              "preload": {
                "js": "./src/preload.js"
              }
            }
          ]
        },
        "port": 3005,
        "loggerPort": 9001
      }
    ]
  ]
}
