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

export const ClipboardContext = createContext();
export function useClipboardContext() {
    return React.useContext(ClipboardContext);
}

//----------------------------------------------
export function useCollectionRef(initialValue) {
    return React.useState({
        current: initialValue
    })[0]
}
export function useActionRef(initialValue) {
    return React.useState({
        current: initialValue
    })[0]
}
//----------------------------------------------
// export const NearestCollectionContext = createContext();
// export function useNearestCollectionContext() {
//     return React.useContext(NearestCollectionContext);
// }
// export const NearestModelContext = createContext();
// export function useNearestModelContext() {
//     return React.useContext(NearestModelContext);
// }
// export const NearestObjectContext = createContext();
// export function useNearestObjectContext() {
//     return React.useContext(NearestObjectContext);
// }
//----------------------------------------------
export const FormObserverContext = createContext();
export function useFormObserverContext() {
    let o = React.useContext(FormObserverContext)
    return (o)?o:[];
}
//----------------------------------------------
//----------------------------------------------
