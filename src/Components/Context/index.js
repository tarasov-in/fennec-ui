import React, { createContext } from 'react';

export const UserContext = createContext();
export function useUserContext() {
    return React.useContext(UserContext);
}

export const UserConfigContext = createContext();
export function useUserConfigContext() {
    return React.useContext(UserConfigContext);
}

export const TranslateContext = createContext();
export function useTranslateContext() {
    return React.useContext(TranslateContext);
}

export const MetaContext = createContext();
export function useMetaContext() {
    return React.useContext(MetaContext);
}
//----------------------------------------------
export function useCollectionRef(initialValue) {
    return React.useState({
        current: initialValue
    })[0]
}
//----------------------------------------------
