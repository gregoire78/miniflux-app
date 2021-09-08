import { hot } from 'react-hot-loader';
import React, { useEffect, useState } from 'react';
import useInterval from 'use-interval';
import useOnlineStatus from './hooks/useOnlineStatus';
import Articles from './Articles';
import './index.css';
let Obj = new Image();
Obj.src = "./assets/logo32.png";

let total = 0;

function App() {
  const [entries, setEntries] = useState({});
  const [feeds, setFeedsState] = useState({});
  const [mouseFocus, setMouseFocus] = useState(false);
  const onlineStatus = useOnlineStatus();

  function trayCanvas(data, color = "black") {
    let canvas = document.createElement('canvas');
    canvas.height = 32;
    canvas.width = 32;
    let ctx = canvas.getContext("2d");
    ctx.drawImage(Obj, 0, 0, 32, 32);
    ctx.fillStyle = "#ffabab75";
    ctx.fillRect(2, 13, 28, 18);

    ctx.fillStyle = color;
    ctx.strokeStyle = 'cyan';

    ctx.font = "12pt Arial";
    ctx.textAlign = 'center';
    ctx.textBaseline = "bottom";

    ctx.font = "bold 18pt Arial";
    ctx.textAlign = 'center';
    ctx.textBaseline = "middle";
    ctx.fillText(data + "", 16, 23, 32);

    const dataURL = canvas.toDataURL();
    return dataURL;
  }

  function badgeCanvas(data) {
    let canvas = document.createElement('canvas');
    canvas.height = 32;
    canvas.width = 32;
    let ctx = canvas.getContext("2d");
    ctx.fillStyle = "orange";
    ctx.arc(16, 16, 16, 0, 2 * Math.PI);
    ctx.fill();
    ctx.fillStyle = "black";
    ctx.textAlign = 'center';
    ctx.textBaseline = "bottom";
    ctx.font = "bold 18pt Arial";
    ctx.textAlign = 'center';
    ctx.textBaseline = "middle";
    ctx.fillText(data + "", 16, 19, 32);

    const dataURL = canvas.toDataURL();
    return dataURL;
  }

  async function setBadge(load = false) {
    const isOpen = await window.api.isOpen()
    if (!isOpen || load) {
      const response = await fetch(`${process.env.MINIFLUX_URL}/v1/entries?status=unread&direction=desc&offset=0&limit=0`, {
        method: 'GET',
        headers: new Headers({
          'Authorization': 'Basic ' + btoa(`${process.env.MINIFLUX_LOGIN}:${process.env.MINIFLUX_PASSWORD}`)
        })
      });
      const data = await response.json();

      const trayURL = trayCanvas(data.total)//canvas.toDataURL();
      const badgeURL = badgeCanvas(data.total)
      await window.api.ipcRenderer.send('update-badge', { trayURL, total: data.total, badgeURL });
      /*if (data.total > total) {
        //https://www.myinstants.com/instant/tuturu/?utm_source=copy&utm_medium=share
        //await window.api.ipcRenderer.send('show-up');
      }*/
      total = data.total;
      setEntries(data);
    }
  }

  async function getFeeds() {
    let response = await fetch(`${process.env.MINIFLUX_URL}/v1/feeds`, {
      method: 'GET',
      headers: new Headers({
        'Authorization': 'Basic ' + window.btoa(`${process.env.MINIFLUX_LOGIN}:${process.env.MINIFLUX_PASSWORD}`)
      })
    });
    let data = await response.json();
    return data;
  }

  async function getIcon(id) {
    const response = await fetch(`${process.env.MINIFLUX_URL}/v1/feeds/${id}/icon`, {
      method: 'GET',
      headers: new Headers({
        'Authorization': 'Basic ' + btoa(`${process.env.MINIFLUX_LOGIN}:${process.env.MINIFLUX_PASSWORD}`)
      })
    });
    const data = await response.json();
    return data.data;
  }

  async function setFeeds() {
    const feeds = await getFeeds();

    const feedresult = await Promise.all(feeds.map(async (feed) => {
      if (feed.icon) {
        const y = await getIcon(feed.icon.feed_id);
        feed.icon = Object.assign(feed.icon, {
          data: y
        })
      }
      return feed;
    }))
    setFeedsState(feedresult);
  }

  useEffect(() => {
    if (onlineStatus) {
      setBadge(true);
      setFeeds();
    }
  }, [onlineStatus])

  useEffect(() => {
    if (!mouseFocus) {
      document.body.style.opacity = 0.85
    } else {
      document.body.style.opacity = 1
    }
  }, [mouseFocus])

  useInterval(setBadge, onlineStatus ? 10000 : false)

  return (
    <div className="App"
      onMouseEnter={() => {
        setMouseFocus(true);
      }}
      onMouseLeave={() => {
        setMouseFocus(false);
      }}>
      {!onlineStatus && <div className="offline">Vous êtes hors ligne</div>}
      {entries.entries && <Articles entries={entries} feeds={feeds} trayCanvas={trayCanvas} badgeCanvas={badgeCanvas} isOnline={onlineStatus} />}
    </div>
  );
}

export default hot(module)(App);
