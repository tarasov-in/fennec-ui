import React, { useEffect, useState } from 'react';
import { useAuth } from '../Auth';
import { MetaContext } from '../Components/Context';
import fuuid from 'react-uuid'

//-------------------------------------------------------------------------------------
export function MetaProvider({ children }) {
    const auth = useAuth();
    const [ready, setReady] = useState(false);
    const [meta, setMeta] = useState();

    useEffect(() => {
        // if (!auth.loggedIn()) return;
        auth.fetch('/api/meta').then(res => {
            if (res && res.data) {
                var arr = Object.values(res.data).map((item) => {
                    if (!item.uuid) {
                        return { ...item, uuid: fuuid() }
                    }
                    return item;
                });
                var o = {}
                for (let i = 0; i < arr.length; i++) {
                    const element = arr[i];
                    o[element.name.toLowerCase()] = element;
                }
                setMeta(o)
                setReady(true);
            }
        });
    }, [])

    return (<MetaContext.Provider value={meta}>
        {(ready || !auth.loggedIn()) && children}
    </MetaContext.Provider>);
}
//-------------------------------------------------------------------------------------
