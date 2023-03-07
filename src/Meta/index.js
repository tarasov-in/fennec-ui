import React, { useEffect, useState } from 'react';
import 'moment/locale/ru';
import { useAuth } from '../Auth';
import { GET } from '../Tool';
import { MetaContext } from '../Components/Context';

//-------------------------------------------------------------------------------------
export function MetaProvider({ children }) {
    const auth = useAuth();
    const [ready, setReady] = useState(false);
    const [meta, setMeta] = useState();

    useEffect(() => {
        if (!auth.loggedIn()) return;
        GET(auth, '/api/meta', ({ data }) => {
            setMeta(data)
            setReady(true);
        });
    },[])

    return (<MetaContext.Provider value={meta}>
            {(ready || !auth.loggedIn()) && children}
        </MetaContext.Provider>);
}
//-------------------------------------------------------------------------------------
