import React, { useEffect, useState } from 'react';
import moment from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import 'dayjs/locale/fr';
moment.locale('fr');
moment.extend(relativeTime)
moment.extend(localizedFormat)

let Obj = new Image();
Obj.src = "./assets/logo32.png";

function Article({ entrie, feed, isOnline, onRead, isFirst = false }) {

    const [display, setDisplay] = useState(null)
    const [bookmark, setBookmark] = useState(entrie.starred)

    async function updateEntrie(id) {
        await fetch(`${process.env.MINIFLUX_URL}/v1/entries`, {
            method: 'PUT',
            body: JSON.stringify({
                entry_ids: [id], status: 'read'
            }),
            headers: new Headers({
                'Content-Type': 'application/json',
                'Authorization': 'Basic ' + window.btoa(`${process.env.MINIFLUX_LOGIN}:${process.env.MINIFLUX_PASSWORD}`)
            })
        });
    }

    async function toogleBookmark(id) {
        await fetch(`${process.env.MINIFLUX_URL}/v1/entries/${id}/bookmark`, {
            method: 'PUT',
            headers: new Headers({
                'Authorization': 'Basic ' + window.btoa(`${process.env.MINIFLUX_LOGIN}:${process.env.MINIFLUX_PASSWORD}`)
            })
        });
        setBookmark(b => !b)
    }

    return (
        <article>
            <div>
                <header>
                    <p>
                        {(feed && feed.icon.data) && <img className="feed icon" src={'data:' + feed.icon.data} width="16" height="16" alt={entrie.feed.title} />}
                        <a href={entrie.url} target="_blank" rel='noreferrer noopener' className="title">
                            {entrie.title}
                        </a>
                    </p>
                    <ul>
                        <li title={moment(entrie.published_at).format('LLLL')}>
                            <time dateTime={entrie.published_at}>{moment(entrie.published_at).fromNow()}</time>
                        </li>
                        <li>
                            <button onClick={() => {
                                setDisplay(d => d === null ? !isFirst : !d)
                            }}>
                                {display || (isFirst && display == null) ? 'cacher' : 'voir'} le contenu
                            </button>
                        </li>
                        <li>{entrie.feed.category.title}</li>
                        <li>
                            <button disabled={!isOnline} onClick={async () => await toogleBookmark(entrie.id)}>{!bookmark ? 'ajouter aux' : 'enlever des'} favoris</button>
                        </li>
                    </ul>
                </header>
                <p className="content" style={{ display: display || (isFirst && display == null) ? 'block' : 'none' }} dangerouslySetInnerHTML={{ __html: entrie.content }}></p>
            </div>
            <div>
                <button className="read" disabled={!isOnline} onClick={async () => {
                    onRead(entrie)
                    await updateEntrie(entrie.id)
                }}>✔︎ Lu</button>
            </div>
        </article>
    );
}

export default Article;
