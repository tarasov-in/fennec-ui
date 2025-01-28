import React, { useCallback, useMemo } from 'react';
import { useMetaContext } from '../../Context';
import { CollectionServer } from '../CollectionServer';
import { getDisplay, getObjectValue, QueryFiltersToContextFilters } from '../../../Tool';

export function CollectionByProperty(props) {
    const { auth, item, object, linksCompareFunction, links, scheme, queryDetail, modelActions, collectionActions } = props;

    const uif = useMemo(() => _.get(item, "relation.uiFilter"), [item]);
    const count = useMemo(() => item?.count || _.get(item, "relation.reference.count") || (()=>(20)), [item]);
    const url = useMemo(() => item?.source || getObjectValue(item, "relation.reference.url") || getObjectValue(item, "relation.reference.source"), [item]);
    const n = useMemo(() => getObjectValue(item, "relation.reference.object"), [item]);
    const f = useMemo(() => getObjectValue(item, "name"), [item]);
    const p = useMemo(() => getObjectValue(item, "relation.reference.property"), [item]);
    const queryFilter = useMemo(() => item?.queryFilter || _.get(item, "relation.reference.queryFilter") || _.get(item, "relation.reference.filter"), [item]);
    
    const floatingFilter = useMemo(() => item?.floatingFilter || _.get(item, "relation.floatingFilter"), [item]);
    
    const gmeta = useMetaContext();
    const filtersFromMeta = React.useCallback((name) => {
        let prop = [];
        let p = _.get(gmeta[name], "properties");
        if (p) {
            prop = p?.filter(e => _.get(e, "relation.type") !== "one-many")?.map(e => ({ ...e, sort: true, filter: true, func: (e.filterType == "range") ? ["min", "max"] : undefined }))
        }
        return prop;
    }, [gmeta]);
    const schemeProcessing = (scheme) => {
        let tailScheme = undefined
        // if (scheme && !scheme.length) {
        //     propertiesOneMany = []
        // }
        if (scheme?.length) {
            let headScheme = {}
            tailScheme = []
            for (let i = 0; i < scheme.length; i++) {
                const element = scheme[i].toLowerCase();
                let arr = element.split(".")

                if (arr && arr.length && arr[0]) {
                    headScheme[arr[0]] = true
                    arr.splice(0, 1);
                    if (arr && arr.length) {
                        let c = arr.join(".")
                        tailScheme.push(c)
                    }
                }
            }
            return tailScheme
            // let func = (linksCompareFunction) ? linksCompareFunction : (e) => _.get(e, "name");
            // propertiesOneMany = propertiesOneMany?.filter(e => {
            //     return (func(e) && (headScheme[func(e)?.toLowerCase()]))
            // })
        }
    }
    const display = useCallback((item, value) => {
        if (item && value) {
            if (item.display && _.isFunction(item.display)) {
                return item.display(value)
            } else if (item.relation && item.relation.display && _.isFunction(item.relation.display)) {
                return item.relation.display(value)
            } else {
                let fieldMeta = gmeta[getObjectValue(item, "relation.reference.object")];
                let _display = ((item?.relation?.display?.fields) ? item?.relation?.display : undefined) || ((fieldMeta?.display?.fields) ? fieldMeta?.display : undefined)
                return getDisplay(value, _display, fieldMeta, gmeta)
            }
        }
        return "";
    }, [gmeta]);

    const queryFiltersToContextFilters = useMemo(() => QueryFiltersToContextFilters(queryFilter), [queryFilter]);
    const FilterFromContextFilter = React.useCallback(() => [
        ((object) ? {
            // action: true,
            // method: "eq",
            name: p,
            value: object.ID
        } : {}),
        ...queryFiltersToContextFilters

    ], [object, p, queryFiltersToContextFilters]);

    if (!n) return;
    return (<CollectionServer
        auth={auth}
        name={n}
        source={url}
        count={count}
        field={item}
        fieldName={f}
        contextObject={object}
        contextFilters={FilterFromContextFilter}
        filters={() => (uif) ? uif() : filtersFromMeta(n)}
        floatingFilter={floatingFilter}
        mode="list"
        render={(o, idx) => {
            return display(item, o)
        }}

        linksCompareFunction={linksCompareFunction}
        linksModelActions={links}
        scheme={schemeProcessing(scheme)}
        queryDetail={queryDetail || item?.queryDetail}
        modelActions={modelActions}
        collectionActions={collectionActions}
    />)
}