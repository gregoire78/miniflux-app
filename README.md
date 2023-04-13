# Miniflux electron app

This is a very small electron app for miniflux

## linux build

replace appId in packeg.json with your id `"appId": "tech.joncour.rss",`

`npm i`

`npm run make`

bin is located in `out` folder

for build `AppImage`

`npm run dist`

bin is located in `dist`

#### build with docker on linux

`docker run -it --rm -v $PWD:/usr/src/app -w /usr/src/app node:16 bash`

```bash
apt update
apt install dpkg fakeroot
su node
npm ci
npm run make:linux
npm run package:linux
```
