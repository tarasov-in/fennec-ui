import React, { createContext, useEffect, useState } from 'react';
var _ = require('lodash');

//-------------------------------------------------------------------------------------
// const fullReplacementFunc = useModelFullReplacement(key, fullReplacement)
// const partialReplacementFunc = useModelPartialReplacement(key, partialReplacement)
// const [mapOfFuncs, getByKey, setByKey] = useModelFullReplacementHelper()
// const [mapOfFuncs, getByKey, setByKey] = useModelPartialReplacementHelper()
//-------------------------------------------------------------------------------------
// FieldPartialReplacement
export const FieldPartialReplacement = createContext();
export function useFieldPartialReplacement(key, defaultValue) {
    let ctx = React.useContext(FieldPartialReplacement);
    if(ctx && _.isArray(ctx)){
        let [data, getByKey, setByKey] = ctx;
        if(getByKey){
            return getByKey(key) || defaultValue
        }
    }
    return defaultValue
}
export function useFieldPartialReplacementHelper() {
    return React.useContext(FieldPartialReplacement);
}
export function FieldPartialReplacementProvider({ children, initial }) {
    const [data, setData] = useState({});

    const getByKey = (key) => {
        if(key){
            return data[key]
        }
    }
    const setByKey = (key, value) => {
        setData(o => ({ ...o, [key]: value }))
    };
    useEffect(() => {
        if (initial && _.isObject(initial)) {
            setData(initial)
        }
    }, [])
    return (<FieldPartialReplacement.Provider value={[data, getByKey, setByKey]}>
        {children}
    </FieldPartialReplacement.Provider>);
}
//-------------------------------------------------------------------------------------
// FieldFullReplacement
export const FieldFullReplacement = createContext();
export function useFieldFullReplacement(key, defaultValue) {
    let ctx = React.useContext(FieldFullReplacement);
    if(ctx && _.isArray(ctx)){
        let [data, getByKey, setByKey] = ctx;
        if(getByKey){
            return getByKey(key) || defaultValue
        }
    }
    return defaultValue
}
export function useFieldFullReplacementHelper() {
    return React.useContext(FieldFullReplacement);
}
export function FieldFullReplacementProvider({ children, initial }) {
    const [data, setData] = useState({});

    const getByKey = (key) => {
        if(key){
            return data[key]
        }
    }
    const setByKey = (key, value) => {
        setData(o => ({ ...o, [key]: value }))
    };
    useEffect(() => {
        if (initial && _.isObject(initial)) {
            setData(initial)
        }
    }, [])
    return (<FieldFullReplacement.Provider value={[data, getByKey, setByKey]}>
        {children}
    </FieldFullReplacement.Provider>);
}
//-------------------------------------------------------------------------------------
// ModelPartialReplacement
export const ModelPartialReplacement = createContext();
export function useModelPartialReplacement(key, defaultValue) {
    let ctx = React.useContext(ModelPartialReplacement);
    if(ctx && _.isArray(ctx)){
        let [data, getByKey, setByKey] = ctx;
        if(getByKey){
            return getByKey(key) || defaultValue
        }
    }
    return defaultValue
}
export function useModelPartialReplacementHelper() {
    return React.useContext(ModelPartialReplacement);
}
export function ModelPartialReplacementProvider({ children, initial }) {
    const [data, setData] = useState({});

    const getByKey = (key) => {
        if(key){
            return data[key]
        }
    }
    const setByKey = (key, value) => {
        setData(o => ({ ...o, [key]: value }))
    };
    useEffect(() => {
        if (initial && _.isObject(initial)) {
            setData(initial)
        }
    }, [])
    return (<ModelPartialReplacement.Provider value={[data, getByKey, setByKey]}>
        {children}
    </ModelPartialReplacement.Provider>);
}
//-------------------------------------------------------------------------------------
// ModelFullReplacement
export const ModelFullReplacement = createContext();
export function useModelFullReplacement(key, defaultValue) {
    let ctx = React.useContext(ModelFullReplacement);
    if(ctx && _.isArray(ctx)){
        let [data, getByKey, setByKey] = ctx;
        if(getByKey){
            return getByKey(key) || defaultValue
        }
    }
    return defaultValue
}
export function useModelFullReplacementHelper() {
    return React.useContext(ModelFullReplacement);
}
export function ModelFullReplacementProvider({ children, initial }) {
    const [data, setData] = useState({});

    const getByKey = (key) => {
        if(key){
            return data[key]
        }
    }
    const setByKey = (key, value) => {
        setData(o => ({ ...o, [key]: value }))
    };
    useEffect(() => {
        if (initial && _.isObject(initial)) {
            setData(initial)
        }
    }, [])
    return (<ModelFullReplacement.Provider value={[data, getByKey, setByKey]}>
        {children}
    </ModelFullReplacement.Provider>);
}
//-------------------------------------------------------------------------------------
// CollectionPartialReplacement
export const CollectionPartialReplacement = createContext();
export function useCollectionPartialReplacement(key, defaultValue) {
    let ctx = React.useContext(CollectionPartialReplacement);
    if(ctx && _.isArray(ctx)){
        let [data, getByKey, setByKey] = ctx;
        if(getByKey){
            return getByKey(key) || defaultValue
        }
    }
    return defaultValue
}
export function useCollectionPartialReplacementHelper() {
    return React.useContext(CollectionPartialReplacement);
}
export function CollectionPartialReplacementProvider({ children, initial }) {
    const [data, setData] = useState({});

    const getByKey = (key) => {
        if(key){
            return data[key]
        }
    }
    const setByKey = (key, value) => {
        setData(o => ({ ...o, [key]: value }))
    };
    useEffect(() => {
        if (initial && _.isObject(initial)) {
            setData(initial)
        }
    }, [])
    return (<CollectionPartialReplacement.Provider value={[data, getByKey, setByKey]}>
        {children}
    </CollectionPartialReplacement.Provider>);
}
//-------------------------------------------------------------------------------------
// CollectionFullReplacement
export const CollectionFullReplacement = createContext();
export function useCollectionFullReplacement(key, defaultValue) {
    let ctx = React.useContext(CollectionFullReplacement);
    if(ctx && _.isArray(ctx)){
        let [data, getByKey, setByKey] = ctx;
        if(getByKey){
            return getByKey(key) || defaultValue
        }
    }
    return defaultValue
}
export function useCollectionFullReplacementHelper() {
    return React.useContext(CollectionFullReplacement);
}
export function CollectionFullReplacementProvider({ children, initial }) {
    const [data, setData] = useState({});

    const getByKey = (key) => {
        if(key){
            return data[key]
        }
    }
    const setByKey = (key, value) => {
        setData(o => ({ ...o, [key]: value }))
    };
    useEffect(() => {
        if (initial && _.isObject(initial)) {
            setData(initial)
        }
    }, [])
    return (<CollectionFullReplacement.Provider value={[data, getByKey, setByKey]}>
        {children}
    </CollectionFullReplacement.Provider>);
}
//-------------------------------------------------------------------------------------
