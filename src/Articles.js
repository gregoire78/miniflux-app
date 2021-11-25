import React, { useEffect, useState } from 'react';
import Article from './Article';

let Obj = new Image();
Obj.src = "./assets/logo32.png";

function Articles(props) {

    const [entries, setEntries] = useState(props.entries)
    const [feeds, setFeeds] = useState(props.feeds)

    async function setBadge(data) {
        const trayURL = props.trayCanvas(data);
        const badgeURL = props.badgeCanvas(data);
        await window.api.ipcRenderer.send('update-badge', { badgeURL, total: data, trayURL });
    }

    useEffect(() => {
        setEntries(props.entries)
        setFeeds(props.feeds)
    }, [props.entries, props.feeds])

    return (
        <>
            {feeds.length > 0 && entries.map((entrie, k) => {
                return (
                    <Article
                        key={entrie.id}
                        entrie={entrie}
                        feed={feeds.find((feed) => feed.id === entrie.feed.id)}
                        isOnline={props.isOnline}
                        isFirst={k === 0}
                        onRead={() => {
                            setEntries(entries.filter(hentrie => hentrie.id !== entrie.id))
                            setBadge((entries.length - 1) + '')
                            if (entries.length - 1 === 0) window.api.ipcRenderer.send('hide-down');
                        }}
                    />
                )
            })}
            {entries.length === 0 && <p className="alert">Il n'y a rien de nouveau à lire.</p>}
        </>
    );
}

export default Articles;
