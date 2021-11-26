import React, { useEffect, useState } from 'react';
import Article from './Article';

let Obj = new Image();
Obj.src = "./assets/logo32.png";

function Articles(props) {

    async function setBadge(data) {
        const trayURL = props.trayCanvas(data);
        const badgeURL = props.badgeCanvas(data);
        await window.api.ipcRenderer.send('update-badge', { badgeURL, total: data, trayURL });
    }

    return (
        <>
            {props.feeds?.length > 0 && props.entries?.map((entrie, k) => {
                return (
                    <Article
                        key={entrie.id}
                        entrie={entrie}
                        feed={props.feeds.find((feed) => feed.id === entrie.feed.id)}
                        isOnline={props.isOnline}
                        isFirst={k === 0}
                        onRead={() => {
                            props.setEntries(e => e.filter(hentrie => hentrie.id !== entrie.id))
                            setBadge((props.entries.length - 1) + '')
                            if (props.entries.length - 1 === 0) window.api.ipcRenderer.send('hide-down');
                        }}
                    />
                )
            })}
            {props.entries?.length === 0 && <p className="alert">Il n'y a rien de nouveau à lire.</p>}
        </>
    );
}

export default Articles;
