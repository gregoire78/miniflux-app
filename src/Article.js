import React, { useEffect, useState } from 'react';
import moment from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/fr';
moment.locale('fr');
moment.extend(relativeTime)

let Obj = new Image();
Obj.src = "./assets/logo32.png";

function Article(props) {

    const [entries, setEntries] = useState([])
    const [feeds, setFeeds] = useState([])
    let inputRefs = [];

    async function updateEntrie(id) {
        await fetch(`${process.env.MINIFLUX_URL}/v1/entries`, {
            method: 'PUT',
            body: JSON.stringify({
                entry_ids: [id], status: 'read'
            }),
            headers: new Headers({
                'Content-Type': 'application/json',
                'Authorization': 'Basic ' + btoa(`${process.env.MINIFLUX_LOGIN}:${process.env.MINIFLUX_PASSWORD}`)
            })
        });
    }

    function setRef(ref) {
        inputRefs.push(ref);
    };

    async function setBadge(data) {
        const trayURL = props.trayCanvas(data);
        const badgeURL = props.badgeCanvas(data);
        await window.api.ipcRenderer.send('update-badge', { badgeURL, total: data, trayURL });
    }

    useEffect(() => {
        setEntries(props.entries.entries)
        setFeeds(props.feeds)
    }, [props.entries.entries, props.feeds])

    return (
        <>
            {feeds.length > 0 && entries.map((entrie, k) => {
                const f = feeds.find((feed) => {
                    return feed.id === entrie.feed.id;
                });
                let display = k === 0 ? 'block' : 'none';
                return (
                    <article key={entrie.id}>
                        <div>
                            <header>
                                <p>
                                    {(f && f.icon.data) && <img className="feed icon" src={'data:' + f.icon.data} width="16" height="16" alt={entrie.feed.title} />}
                                    <a href={entrie.url} target="_blank" rel='noreferrer noopener' className="title">
                                        {entrie.title}
                                    </a>
                                </p>
                                <ul>
                                    <li>
                                        <time dateTime={entrie.published_at}>{moment(entrie.published_at).fromNow()}</time>
                                    </li>
                                    <li>
                                        <button onClick={(e) => {
                                            if (inputRefs[k].style.display === 'none') {
                                                inputRefs[k].style.display = 'block';
                                                e.target.textContent = "cacher le contenu";
                                            } else {
                                                inputRefs[k].style.display = 'none';
                                                e.target.textContent = "voir le contenu";
                                            }
                                        }}>{display === 'none' ? 'voir' : 'cacher'} le contenu</button>
                                    </li>
                                    <li>{entrie.feed.category.title}</li>
                                </ul>
                            </header>
                            <p className="content" ref={setRef} style={{ display }} dangerouslySetInnerHTML={{ __html: entrie.content }}></p>
                        </div>
                        <div>
                            <button className="read" onClick={() => {
                                updateEntrie(entrie.id)
                                setEntries(entries.filter(hentrie => hentrie.id !== entrie.id))
                                setBadge((entries.length - 1) + '')
                                if (entries.length - 1 === 0) window.api.ipcRenderer.send('hide-down');
                            }}>✔︎ Lu</button>
                        </div>
                    </article>
                )
            })}
            {entries.length === 0 && <p className="alert">Il n'y a rien de nouveau à lire.</p>}
        </>
    );
}

export default Article;
