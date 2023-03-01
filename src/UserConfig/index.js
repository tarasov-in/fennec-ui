import React, { useEffect, useState } from 'react';
import 'moment/locale/ru';
import { useAuth } from '../Auth';
import { errorCatch, POST, QueryDetail, READWITH } from '../Tool';
import { UserConfigContext } from '../Components/Context';


//-------------------------------------------------------------------------------------
export function UserConfigProvider({ children }) {
    const auth = useAuth();
    const [userConfig, _setUserConfig] = useState({});
    const [ready, setReady] = useState(false));

    const deleteUserConfig = (name) => {
        if(!auth.loggedIn()) return;
        GET(auth, `/api/userconfig/delete/key/${name}`, 
        ({ data }) => {
            let i = { ...userConfig };
            delete i[name]
            _setUserConfig(i);
            if (onChange) {
                onChange(i);
            }
        }, errorCatch);
    };
    const setUserConfig = (name, value, onChange) => {
        if(!auth.loggedIn()) return;
        POST(auth, "/api/setuserconfig", {
            key: name,
            value: value
        }, ({ data }) => {
            var arr = [data];
            var obj = Object.fromEntries(arr.map(i => {
                return [
                    i.key,
                    i.value
                ]
            }));
            let i = { ...userConfig, ...obj };
            _setUserConfig(i);
            if (onChange) {
                onChange(i);
            }
        }, errorCatch);
    };
    useEffect(() => {
        if(!auth.loggedIn()) return;
        READWITH(auth, 'UserConfig', [
            QueryDetail("model")
        ], ({ data }) => {
            if (data.length > 0) {
                var obj = Object.fromEntries(data.map(i => {
                    return [
                        i.key,
                        i.value
                    ]
                }));
                _setUserConfig(obj);
            }
            setReady(true);
        }, errorCatch)
    }, [])

    return <UserConfigContext.Provider value={[userConfig, setUserConfig]}>
        {(ready) && children}
        </UserConfigContext.Provider>;
}
//-------------------------------------------------------------------------------------
