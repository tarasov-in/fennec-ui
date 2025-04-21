import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Layout, Card, Button, Tooltip, Pagination, Empty, Divider, Typography, Tag, Select, List, Table, Badge, Modal } from 'antd';
import { Action } from '../../Action'
import { DropdownAction } from '../DropdownAction'
import { unwrap, GET, errorCatch, Request, QueryParam, GETWITH, READWITH, QueryFunc, JSX, GetMetaPropertyByPath, updateInArray, deleteInArray, QueryDetail, subscribe as _subscribe, unsubscribe, clean, JSXMap, getObjectDisplay, ContextFiltersToQueryFilters, contextFilterToObject, getLocator } from '../../../Tool'
import { createUseStyles } from 'react-jss';
import { FilterOutlined, SortAscendingOutlined, SortDescendingOutlined } from '@ant-design/icons';
import { Field } from '../Field';
import { Model } from '../Model';
import { useMetaContext } from '../../Context';
import { ExclamationCircleOutlined, FullscreenExitOutlined, FullscreenOutlined } from '@ant-design/icons';
import { useCollectionFullReplacement, useCollectionPartialReplacement } from '../../../ComponetsReplacement';
import { useAuth } from '../../../Auth';
import { Overlay } from '../../Overlay';
import { PopoverModal } from '../../PopoverModal';
import "./index.css"

const { Sider } = Layout;
const { Option } = Select;
const { Text } = Typography;

var _ = require('lodash');

const useStyles = createUseStyles({
    collapse: {
        '& .ant-collapse-content > .ant-collapse-content-box': {
            padding: "0px"
        },
        '&.ant-collapse > .ant-collapse-item > .ant-collapse-header .ant-collapse-arrow': {
            top: "-3px",
            left: "10px"
        },
        '&.ant-collapse > .ant-collapse-item > .ant-collapse-header': {
            padding: "4px 10px",
            paddingLeft: "30px"
        }
    },
    cardSmall: {
        '& .ant-card-body': {
            padding: "0px"
        }
    },
    cardSmallHeader: {
        '& .ant-card-body': {
            paddingLeft: "0px",
            paddingRight: "0px"
        }
    },
    smallTable: {
        '& .ant-table .ant-table-tbody > tr > td': {
            padding: "4px 8px",
            fontSize: '12px'
        },
        '& .ant-table .ant-table-thead > tr > th': {
            padding: "4px 8px",
            fontSize: "13px"
        }
    },
    whiteCell: {
        '&.ant-table-cell-fix-right': {
            backgroundColor: "white"
        }
    },
    listItemClass: {
        '&.ant-list-item': {
            display: "flex",
            borderBottom: "none",
            padding: "4px 0"
        },
        '&.ant-list-item .ant-list-item-action': {
            marginLeft: "0px",
            // marginTop: "8px",
        },
        '&.ant-list-item .ant-list-item-action>li': {
            padding: "0 4px"
        }
    }
})

export function SortingFieldsUI(props) {
    const { filters, value, onChange } = props;
    return (
        <React.Fragment>
            <Divider type="horizontal"
                orientation="left"
                style={{ margin: "12px 0", fontSize: "13px", fontWeight: "600", padding: "0px 15px 0px 0px" }} >
                Сортировка
            </Divider>
            <div data-locator={getLocator(props?.locator || "sorting", props?.object)} style={{}}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <Select
                        data-locator={getLocator(props?.locator || "sortingselect", props?.object)}
                        allowClear={true}
                        value={value.name}
                        onChange={(v) => onChange({ name: v, order: value.order })}
                        optionFilterProp="children"
                        filterOption={(input, option) =>
                            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                        }
                        style={{ width: "100%", /*maxWidth: "203px",*/ marginRight: "5px" }}
                    >
                        {JSXMap(filters?.filter(f => f.sort), (item, idx) => (
                            <Option data-locator={getLocator(props?.locator || "sortingitem", props?.object || idx)} key={idx} value={item.name}>{item.label}</Option>
                        ))}
                    </Select>
                    <div>
                        {value.order === "ASC" && <Tooltip title="Восходящий">
                            <Button icon={<SortAscendingOutlined />} data-locator={getLocator(props?.locator || "sortingasc", props?.object)} onClick={() => onChange({ name: value.name, order: (value.order === "ASC") ? "DESC" : "ASC" })} />
                        </Tooltip>}
                        {value.order === "DESC" && <Tooltip title="Нисходящий">
                            <Button icon={<SortDescendingOutlined />} data-locator={getLocator(props?.locator || "sortingdesc", props?.object)} onClick={() => onChange({ name: value.name, order: (value.order === "ASC") ? "DESC" : "ASC" })} />
                        </Tooltip>}
                    </div>
                </div>
            </div>
        </React.Fragment>
    );
}
export function FiltersFieldsUI(props) {
    const { auth, filters, funcs, value, onChange } = props;

    const _onFilterChange = React.useMemo(() => (v, item) => {
        if ((!v && !item?.permanent) || (item?.permanent && (v === undefined || v === null)) || (_.isArray(v) && v.length == 0)) {
            let f = { ...value };
            delete f[item.name]
            onChange(f);
            return
        } else {
            let newFiltr = { ...value, [item.name]: v };
            onChange(newFiltr);
        }
    }, [value]);

    return (
        <React.Fragment>
            <Divider type="horizontal"
                orientation="left"
                style={{ margin: "12px 0", fontSize: "13px", fontWeight: "600", padding: "0px 15px 0px 0px" }} >
                Фильтры
            </Divider>
            <div data-locator={getLocator(props?.locator || "filters", props?.object)} style={{}}>
                <div>
                    {JSXMap(filters?.filter(i => i.filter), (item, idx) => (
                        <div data-locator={getLocator(props?.locator || "filtersfield", props?.object)} key={item.name} style={{ marginBottom: "10px" }}>
                            {item.filter && (item.type !== "bool" && item.type !== "boolean") && <Text>{item.label}</Text>}
                            <Field
                                mode="filter"
                                formItem={true}
                                key={item.name}
                                auth={auth}
                                item={{ ...item, func: (funcs && funcs[item?.name?.toLowerCase()]) ? funcs[item.name.toLowerCase()] : {} }}
                                value={value[item.name]}
                                onChange={(value) => _onFilterChange(value, item)}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </React.Fragment>
    )
}

export function collectionQueryParams(filters, contextFilters, filter, sorting, current, count, queryDetail) {
    let ctxFlt = ContextFiltersToQueryFilters(contextFilters)

    let flt = [];
    Object.keys(filter).forEach(key => {
        var item = filters?.find(e => e.name == key);
        var akey = item?.alias || key;

        if (item?.additionalFilter) {
            let additionalFlt = ContextFiltersToQueryFilters(item?.additionalFilter)
            // flt = _.merge(flt, additionalFlt)
            // flt = [...flt,...additionalFlt]
            flt.push(...additionalFlt)
        }

        if (item) {
            let filterByKey = filter[key];
            switch (item?.filterType) {
                case "group":
                    switch (item?.type) {
                        case "object":
                        case "document":
                            flt.push(QueryParam("w-in-" + akey, filterByKey))
                            break;
                        default:
                            flt.push(QueryParam("w-in-" + akey, filterByKey))
                            break;
                    }
                    break;
                case "range":
                    switch (item?.type) {
                        case "int":
                        case "uint":
                        case "integer":
                        case "int64":
                        case "int32":
                        case "uint64":
                        case "uint32":
                            if (_.isArray(filterByKey) && filterByKey.length >= 2) {
                                flt.push(QueryParam("w-lge-" + akey, filterByKey[0]))
                                flt.push(QueryParam("w-lwe-" + akey, filterByKey[1]))
                            }
                            break;
                        case "double":
                        case "float":
                        case "float64":
                        case "float32":
                            if (_.isArray(filterByKey) && filterByKey.length >= 2) {
                                flt.push(QueryParam("w-lge-" + akey, filterByKey[0]))
                                flt.push(QueryParam("w-lwe-" + akey, filterByKey[1]))
                            }
                            break;
                        case "time":
                            if (_.isArray(filterByKey) && filterByKey.length >= 2) {
                                flt.push(QueryParam("w-lge-" + akey, filterByKey[0].format("HH:mm:ss")))
                                flt.push(QueryParam("w-lwe-" + akey, filterByKey[1].format("HH:mm:ss")))
                            }
                            break;
                        case "date":
                            if (_.isArray(filterByKey) && filterByKey.length >= 2) {
                                flt.push(QueryParam("w-lge-" + akey, filterByKey[0].format("YYYY-MM-DD")))
                                flt.push(QueryParam("w-lwe-" + akey, filterByKey[1].format("YYYY-MM-DD")))
                            }
                            break;
                        case "datetime":
                        case "time.Time":
                            if (_.isArray(filterByKey) && filterByKey.length >= 2) {
                                flt.push(QueryParam("w-lge-" + akey, filterByKey[0].format("YYYY-MM-DD HH:mm")))
                                flt.push(QueryParam("w-lwe-" + akey, filterByKey[1].format("YYYY-MM-DD HH:mm")))
                            }
                            break;
                        default:
                            if (item?.queryComparer) {
                                if (_.isFunction(item?.queryComparer)) {
                                    flt.push(QueryParam(`w-${item?.queryComparer(filterByKey, item)}-` + akey, filterByKey))
                                } else {
                                    flt.push(QueryParam(`w-${item?.queryComparer}-` + akey, filterByKey))
                                }
                            } else {
                                flt.push(QueryParam("w-" + akey, filterByKey))
                            }
                            break;
                    }
                    break;
                default:
                    switch (item?.type) {
                        case "string":
                            // queryComparer:"sim", // wsim, swsim
                            // flt.push(QueryParam(`w-${item?.queryComparer || "co"}-` + akey, filterByKey))
                            if (_.isFunction(item?.queryComparer)) {
                                flt.push(QueryParam(`w-${item?.queryComparer(filterByKey, item) || "co"}-` + akey, filterByKey))
                            } else {
                                flt.push(QueryParam(`w-${item?.queryComparer || "co"}-` + akey, filterByKey))
                            }
                            break;
                        case "func":
                            // flt.push(QueryParam(`${item?.queryPrefix || ""}` + akey, filterByKey))
                            if (_.isFunction(item?.queryPrefix)) {
                                flt.push(QueryParam(`${item?.queryPrefix(filterByKey, item) || ""}` + akey, filterByKey))
                            } else {
                                flt.push(QueryParam(`${item?.queryPrefix || ""}` + akey, filterByKey))
                            }
                            break;
                        default:
                            if (item?.queryRaw) {
                                if (_.isFunction(item?.queryRaw)) {
                                    flt.push(item?.queryRaw(filterByKey, item, akey))
                                } else {
                                    flt.push(item?.queryRaw)
                                }
                            } else
                                if (item?.queryComparer) {
                                    if (_.isFunction(item?.queryComparer)) {
                                        flt.push(QueryParam(`w-${item?.queryComparer(filterByKey, item)}-` + akey, filterByKey))
                                    } else {
                                        flt.push(QueryParam(`w-${item?.queryComparer}-` + akey, filterByKey))
                                    }
                                } else {
                                    flt.push(QueryParam("w-" + akey, filterByKey))
                                }
                            break;
                    }
                    break;
            }
        }
    });

    let func = [];
    filters?.forEach(item => {
        if (item.func && _.isArray(item.func)) {
            item.func.forEach(fu => {
                func.push(QueryFunc(fu, item.name))
            });
        }
    });
    let sort = []
    if (sorting && sorting?.name) {
        sort.push(QueryParam(`s-${sorting.name}`, sorting.order))
    }
    let params = [
        QueryDetail(queryDetail || "model"),
        QueryParam(`page`, current),
        QueryParam(`count`, count),
        ...sort,
        ...flt,
        ...func,
        ...ctxFlt
    ]
    return params;
}
function FilterButton(props) {
    const ref = useRef(null)
    const { setBounding, filtered, setFiltered, state, locator, object, name, fieldName } = props;
    useEffect(() => {
        if (ref.current) {
            if (setBounding) {
                // console.log(ref.current.getBoundingClientRect());
                setBounding(ref.current.getBoundingClientRect())
            }
        }
    }, [ref])
    return (<div
        className={`bg ${(filtered) ? "bg-altblue" : "bg-grey"} pointer`}
        style={{
            minWidth: "28px",
            fontSize: "14px",
            lineHeight: "22px",
            // backgroundColor: (filtered) ? "#1677FF" : "rgba(190, 190, 190, 0.2)"
        }}
        ref={ref}
        data-locator={getLocator(locator || "collectionfilter-" + name || "collectionfilter-" + fieldName || "collectionfilter", object)}
        onClick={e => setFiltered(o => !o)}
    >
        <Badge dot={(state && state.filter && Object.keys(state.filter)?.length > 0) ? true : false}>
            <FilterOutlined style={{ color: (filtered) ? "white" : "black" }} />
        </Badge>
    </div>)
}
function FilterContent({ auth, filters, sorting, setSorting, state, funcStat, filtered, locator, object, name, fieldName, _onFilterChange, applyFilter, clearFilter }) {
    return (<React.Fragment>
        {JSX(() => {
            const fl = filters?.filter(i => i.filter);
            if (filtered && fl.length > 0) {
                return (<React.Fragment>
                    <div style={{}}>
                        <Button
                            data-locator={getLocator(locator || "collectionfilterapply-" + name || "collectionfilterapply-" + fieldName || "collectionfilterapply", object)}
                            style={{ width: "100%" }} disabled={!state.filterChanged} type="primary" onClick={applyFilter}>Применить</Button>
                    </div>
                    <div style={{ marginTop: "5px" }}>
                        <Button
                            data-locator={getLocator(locator || "collectionfilterclear-" + name || "collectionfilterclear-" + fieldName || "collectionfilterclear", object)}
                            style={{ width: "100%" }} disabled={_.isEmpty(state.filter)} onClick={clearFilter}>Очистить</Button>
                    </div>
                </React.Fragment>)
            }
            return (<React.Fragment></React.Fragment>)
        })}
        <SortingFieldsUI value={sorting} onChange={setSorting} filters={filters} />
        <FiltersFieldsUI auth={auth} value={state.newFilter} onChange={_onFilterChange} filters={filters} funcs={funcStat} />
    </React.Fragment>)
}
function DefaultCollectionServer(props) {
    const classes = useStyles()
    const {
        auth,
        name,
        source,
        queryDetail,
        title,

        modelActions,
        collectionActions,

        linksModelActions,
        // linksCollectionActions,
        scheme,
        field,
        fieldName,
        contextObject,
        linksCompareFunction,

        selection, // undefined, "radio" или "checkbox"
        mode, // table, list
        render,
        customRender,
        collectionRef,
        titleFunc,
        contextFilters,
        subscribe,

        onItemLocator,

        onSetCollection,
        onCollectionChange,
        // Collection Only Events
        onChange,   // |
        value,      // | AntFrom Item Api
        getSelectedOnly,

        // Collection and Model Events
        onValues, // (values, context) => { }, // если без return то просто как событие, если внутри return то замена данных
        onData,   // (values, context) => { }, // если без return то просто как событие, если внутри return то замена данных
        onClose,   // ({unlock, close}, context) => { },
        onError,  // (err, {unlock, close}) => {},
        onDispatch, // (values, context) => {}, // если не возвращает значения то посленеё будет вызван внутренний setCollection, 
        // если вернет функцию в качестве значения то эта функция будет вызвана вместо setCollection 
        // и в неё будет передано значение нового состояния

        onChangeRequestParameters,
        partialReplacement,
        onApplyFilter,
        floatingFilter,
        disableScrollTo,
        style,
        headerStyle,
        bodyStyle,
        contentStyle,
        footerStyle,
        filterPopoverStyle,
        filterPopoverPlacement,
        allowFullscreen,
        // isFullscreen,
        // openFullscreen,
        // closeFullscreen
        pagination,
    } = props;

    // const PartialReplacementFunc = useCollectionPartialReplacement(fieldName, partialReplacement)
    const PartialReplacementFunc = useCollectionPartialReplacement(name, partialReplacement)

    const defFilters = (filters) => {
        var f = filters;
        if (f && f.length) {
            let filtr = {};
            for (let d = 0; d < f.length; d++) {
                const element = f[d];
                if (element.filtered) {
                    filtr = { ...filtr, [element.name]: element.filtered };
                }
            }
            return filtr;
        }
        return {};
    }
    const defSorting = (filters) => {
        let sorted = { name: "", order: "ASC" }
        var f = filters;
        if (f && f.length) {
            for (let s = 0; s < f.length; s++) {
                const element = f[s];
                if (element.sorted) {
                    sorted.name = element.name;
                    sorted.order = element.sorted;
                    break;
                }
            }
        }
        return sorted;
    }

    // const floatingFilterLayoutStyle = (floatingFilter) ? { position: "relative" } : {}
    // const floatingFilterSiderStyle = (floatingFilter) ? { padding: "10px", margin: "0px", position: "absolute", right: "0", top: "0", zIndex: "1000", borderRadius: "4px", border: "1px solid lightgrey" } : {}

    const fltrs = (props.filters) ? props.filters() : [];
    const meta = useMetaContext();
    const [loading, setLoading] = useState(false);
    const [collection, _setCollection] = useState([]);
    const [response, setResponse] = useState();
    const [funcStat, setFuncStat] = useState();
    const [lastFuncStat, setLastFuncStat] = useState();
    const [state, setState] = useState({
        filter: defFilters((props.filters) ? fltrs : []),
        newFilter: defFilters((props.filters) ? fltrs : []),
        filterChanged: false
    })
    const [filtered, setFiltered] = useState(false);
    // const [fullscreen, setFullscreen] = useState(false);
    const [filters, setFilters] = useState();
    const [mobject, setMObject] = useState();
    const [sorting, setSorting] = useState(defSorting((props.filters) ? fltrs : []));
    const [current, _setCurrent] = useState((props.page) ? (parseInt(props.page()) || 1) : 1);
    const [count, setCount] = useState((props.count) ? (parseInt(props.count()) || 20) : 20);
    const [total, setTotal] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        if (onChangeRequestParameters) {
            onChangeRequestParameters({
                filters,
                page: (parseInt(current) || 1),
                count,
                queryDetail,
                contextFilters,
                sorting,
                filter: state.filter,
                queryParams: collectionQueryParams(filters, contextFilters, state.filter, sorting, current, count, queryDetail)
            })
        }
    }, [filters, contextFilters, state.filter, sorting, current, count, queryDetail])

    const setCurrent = (value) => {
        _setCurrent(value);
        if (!disableScrollTo) {
            window.scrollTo(0, 0);
        }
    }
    const lock = () => {
        setLoading(true);
    };
    const unlock = () => {
        setLoading(false);
    };

    useEffect(() => {
        if (value) {
            if (selectionType === "radio") {
                setSelectedRowKeys(o => _.union(o, value.map(e => e?.ID)));
                setSelectedRows(o => _.unionBy(o, value, 'ID'));
            } else {
                setSelectedRowKeys(value.map(e => e?.ID));
                setSelectedRows(value);
            }
        } else {
            setSelectedRowKeys([]);
            setSelectedRows([]);
        }
    }, [value])
    useEffect(() => {
        if (name && meta) {
            let mo = meta[name] || meta[name.toLowerCase()];
            if (mo) {
                setMObject(mo);
                if (props.filters) {
                    let f = fltrs?.map(pf => {
                        let field = GetMetaPropertyByPath(meta, mo, pf.name);
                        return {
                            ...field,
                            ...pf
                        }

                    });
                    setFilters(f);
                }
            }
        } else {
            var f = (props.filters) ? fltrs : [];
            setFilters(f);
        }
    }, [name, meta]);

    const setCollection = React.useCallback((array) => {
        if (onSetCollection){
            let collection = onSetCollection(array);
            _setCollection(collection);
            if (onCollectionChange) {
                onCollectionChange(collection);
            }
        } else{
            _setCollection(array);
            if (onCollectionChange) {
                onCollectionChange(array);
            }
        }
    }, [collection]);
    const setCollectionItem = React.useCallback((item) => {
        setCollection(updateInArray(collection, item));
    }, [collection]);
    const removeCollectionItem = React.useCallback((item) => {
        setCollection(deleteInArray(collection, item));
    }, [collection]);

    const clearFilter = React.useCallback(() => {
        setFuncStat(undefined);
        setLastFuncStat(undefined);
        setState({ ...state, filterChanged: false, newFilter: {}, filter: {} });
        setCurrent(1);
        if (onApplyFilter) {
            onApplyFilter({
                filters,
                page: current,
                count,
                queryDetail,
                contextFilters,
                sorting,
                filter: {},
                queryParams: []
            })
        }
    }, [current]);

    const applyFilter = React.useMemo(() => () => {
        let o = { ...state, filterChanged: false, filter: state.newFilter }
        setState(o);
        setCurrent(1);
        if (onApplyFilter) {
            onApplyFilter({
                filters,
                page: current,
                count,
                queryDetail,
                contextFilters,
                sorting,
                filter: o?.filter,
                queryParams: collectionQueryParams(filters, contextFilters, o?.filter, sorting, current, count, queryDetail)
            })
        }
    }, [current, state, filters, contextFilters, sorting, count, queryDetail]);

    // const FunctionQueue = React.useMemo(() => {
    //     var queue = [];
    //     var add = function(fnc){
    //         queue.push(fnc);
    //     };
    //     var next = function(){
    //         var fnc = queue.shift();
    //         fnc();
    //     };
    //     return {
    //         add:add,
    //         next:next
    //     };
    // }, []);
    // var fnc1 = function(){
    //     window.setTimeout(function(){
    //         alert("1 done");
    //         FunctionQueue.next();
    //     }, 1000);
    // };
    // var fnc2 = function(){
    //     window.setTimeout(function(){
    //         alert("2 done");
    //         FunctionQueue.next();
    //     }, 5000);
    // };
    // var fnc3 = function(){
    //     window.setTimeout(function(){
    //         alert("3 done");
    //         FunctionQueue.next();
    //     }, 2000);
    // };
    // FunctionQueue.add(fnc1);
    // FunctionQueue.add(fnc2);
    // FunctionQueue.add(fnc3);
    // FunctionQueue.next();

    const request = React.useMemo(() => (filter) => {
        // if (!filters || !filters.length) return;

        // NNU = "nnu"     // not-null
        // NU = "nu"      // null
        // EQ = "eq"      // equals
        // EQI = "eqi"     // equals ignore case
        // NEQ = "neq"     // not-equals
        // LG = "lg"      // larger
        // LW = "lw"      // lower
        // LGE = "lge"     // larger-or-equals
        // LWE = "lwe"     // lower-or-equals
        // EQORNU = "eqOrNu"  // equals or null
        // LGORNU = "lgOrNu"  // larger or null
        // LWORNU = "lwOrNu"  // lower or null
        // LGEORNU = "lgeOrNu" // larger-or-equals or null
        // LWEORNU = "lweOrNu" // lower-or-equals or null
        // SW = "sw"      // start-with
        // EW = "ew"      // end-with
        // CO = "co"      // contains
        // NCO = "nco"     // not-contains
        // IN = "in"      // in
        // NIN = "nin"     // not-in

        if (!meta || !filters) {
            return
        }

        let queryParams = collectionQueryParams(filters, contextFilters, filter, sorting, current, count, queryDetail);
        if (source && _.isFunction(source)) {
            // lock();
            source({
                lock,
                unlock,

                page: current,
                count: count,
                sorting,
                filter,
                // {stat, totalPages, size, totalElements, content}
                apply: (data) => {
                    // setResponse(data);
                    if (data?.stat) {
                        setLastFuncStat(data?.stat);
                    }
                    if (!funcStat) {
                        setFuncStat(data?.stat);
                    }
                    setCurrent(data?.number || current);
                    setTotalPages(data?.totalPages);
                    setCount(data?.size);
                    setTotal(data?.totalElements);
                    setCollection((data && data?.content) ? data?.content : []);
                    // unlock();
                }
            });
        } else if (source && !_.isFunction(source)) {
            lock();
            GETWITH(auth, source, queryParams, (resp) => {
                let { data } = resp
                setResponse(resp);
                if (data?.stat) {
                    setLastFuncStat(data?.stat);
                }
                if (!funcStat) {
                    setFuncStat(data?.stat);
                }
                setCurrent(data?.number || current);
                setTotalPages(data?.totalPages);
                setCount(data?.size);
                setTotal(data?.totalElements);
                setCollection((data && data?.content) ? data?.content : []);
                unlock();
            }, (err) => errorCatch(err, unlock));
        } else {
            lock();
            READWITH(auth, name, queryParams, (resp) => {
                let { data } = resp
                setResponse(resp);
                if (data?.stat) {
                    setLastFuncStat(data?.stat);
                }
                if (!funcStat) {
                    setFuncStat(data?.stat);
                }
                setCurrent(data?.number || current);
                setTotalPages(data?.totalPages);
                setCount(data?.size);
                setTotal(data?.totalElements);
                setCollection((data && data?.content) ? data?.content : []);
                unlock();
            }, (err) => errorCatch(err, unlock));
        }
    }, [source, current, count, sorting, funcStat, filters, contextFilters]);

    const update = React.useCallback(() => {
        request(state.filter);
    }, [request, state.filter]);

    useEffect(() => {
        // console.log("request start", state.filter, sorting);
        request(state.filter);
    }, [source, name, state.filter, filters, sorting, current, contextFilters]);

    // Table Items Selection
    const [selectionType, setSelectionType] = useState(selection || 'checkbox'); // radio
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [selectedRows, setSelectedRows] = useState([]);
    useEffect(() => {
        setSelectionType(selection);
    }, [selection]);


    useEffect(() => {
        if (subscribe && subscribe.name && subscribe.func) {
            let token = _subscribe(subscribe.name, function (msg, data) {
                if (subscribe.filter && msg.startsWith(subscribe.filter)) {
                    return
                }

                return subscribe.func(data, {
                    msg,
                    collection,
                    setCollection,
                    collectionRef,
                    updateCollection: update,
                    setCollectionItem,
                    removeCollectionItem,
                    request: () => request(state.filter),
                    state,
                });
            });
            return () => {
                unsubscribe(token);
            };
        }
    }, [subscribe, collection, _setCollection, setCollectionItem, removeCollectionItem, request, state]);

    // ---- AntFrom Item Api ----
    const triggerChange = (value) => {
        if (onChange) {
            onChange(value);
        }
    };
    //---------------------------

    const columns = () => {
        var c = [];

        let tmp = (props.columns) ? props.columns({
            auth,
            collection,
            setCollection: setCollection,
            collectionRef,
            updateCollection: update,
            request: (values, itemAction) => Request(values, itemAction, {
                auth,
                collection,
                setCollection: setCollection,
                onData: onData || ((values) => values.data),

                // index,
                lock,
                unlock,
                // close,
                onValues,
                onClose,
                onError,
                onDispatch
            })
        }) : [];
        for (let i = 0; i < tmp.length; i++) {
            const cx = tmp[i];
            c.push(cx);
        }
        if (modelActions) {
            c.push({
                className: classes.whiteCell,
                title: '',
                dataIndex: '',
                key: 'x',
                fixed: 'right',
                width: 45,
                render: (text, record, index) => RenderOnModelActions(record, index)
            });
        }
        return c;
    };
    const defaultModelAction = React.useCallback((item, index) => (!name) ? [] : [
        {
            key: "update",
            title: "Изменить",
            action: {
                method: "POST",
                path: "/api/query-update/" + name.toLowerCase(),
                mutation: "update",
                onValues: (values) => {
                    let ctxFlt = contextFilterToObject(contextFilters);
                    return { ...values, ...ctxFlt, ID: item.ID }
                },
                onClose: ({ close }) => close()
            },
            contextFilters: contextFilters,
            form: Model,
            name: name,
            links: linksModelActions,
            scheme: scheme,
            linksCompareFunction: linksCompareFunction,
            // field: field,
            // fieldName: fieldName,
            contextObject: contextObject,
            queryDetail: queryDetail,
            modelActions: modelActions,
            collectionActions: collectionActions,

            modal: {
                width: "700px"
            },
            options: {
                initialValues: {
                    ...item
                },
            },
            meta: mobject,
            object: item,
        },
        {
            key: "delete",
            title: <span style={{ color: "red" }}>Удалить</span>,
            action: (values, unlock, close, { collection, setCollection }) => {
                Modal.confirm({
                    title: `Вы уверены что хотите удалить элемент?`,
                    icon: <ExclamationCircleOutlined />,
                    content: (<div>
                        {(mobject) && <div style={{ fontSize: "12px", color: "grey" }}>
                            <div>{mobject?.label}</div>
                        </div>}
                        <div>{getObjectDisplay(item, name, meta)}</div>
                    </div>),
                    okText: "Да",
                    okType: 'danger',
                    cancelText: "Нет",
                    onOk: () => {
                        GET(auth, "/api/query-delete/" + name.toLowerCase() + '/' + item.ID,
                            () => {
                                setCollection(deleteInArray(collection, item))
                            }, errorCatch
                        );
                    },
                });
            },
        }
    ], [auth, collection, collectionActions, name, mobject]);
    const RenderOnModelActions = React.useCallback((item, index) => {
        let defaultAction = defaultModelAction(item, index);
        if (!modelActions) return <React.Fragment></React.Fragment>;
        let values = clean(unwrap(modelActions(item, index, {
            mobject,
            name,
            field,
            fieldName,
            contextObject,
            contextFilters,
            // collection,
            actions: defaultAction,

            collection,
            setCollection,
            collectionRef,
            updateCollection: update,
            setCollectionItem,
            removeCollectionItem,
            onSelection,
            isSelected,
            lock,
            unlock,
            loading,
            update
        })));
        if (!values || !values.length) return <React.Fragment></React.Fragment>;
        return <DropdownAction items={values?.map((e, idx) => ({
            key: e.key || idx,
            auth: auth,
            mode: "MenuItem",
            locator: props?.locator || name || fieldName,
            object: item,
            collection: collection,
            setCollection: setCollection,
            collectionRef: collectionRef,
            updateCollection: update,
            contextFilters: contextFilters,

            links: linksModelActions,
            scheme: scheme,
            linksCompareFunction: linksCompareFunction,
            // field: field,
            // fieldName: fieldName,
            queryDetail: queryDetail,
            modelActions: modelActions,
            collectionActions: collectionActions,

            ...e
        }))} />
    }, [auth, collection, modelActions, name, mobject, defaultModelAction]);

    const defaultCollectionAction = React.useCallback(() => (!name) ? [] : [
        {
            key: "create",
            title: "Создать",
            action: {
                method: "POST",
                path: "/api/query-create/" + name.toLowerCase(),
                mutation: "update",
                onValues: (values) => {
                    let ctxFlt = contextFilterToObject(contextFilters);
                    return { ...values, ...ctxFlt }
                },
                onClose: ({ close }) => close(),
            },
            contextFilters: contextFilters,
            form: Model,
            name: name,
            links: linksModelActions,
            scheme: scheme,
            linksCompareFunction: linksCompareFunction,
            // field: field,
            // fieldName: fieldName,
            contextObject: contextObject,
            queryDetail: queryDetail,
            modelActions: modelActions,
            collectionActions: collectionActions,

            options: {
                initialValues: {},
            },
            meta: mobject,
        }
    ], [auth, collection, collectionActions, name, mobject]);
    const RenderOnCollectionActions = React.useCallback(() => {

        let defaultAction = defaultCollectionAction();
        if (!collectionActions) return <React.Fragment></React.Fragment>;
        let values = clean(unwrap(collectionActions({
            mobject,
            name,
            field,
            fieldName,
            contextObject,
            contextFilters,
            // collection,
            actions: defaultAction,

            collection,
            setCollection,
            collectionRef,
            updateCollection: update,
            setCollectionItem,
            removeCollectionItem,
            onSelection,
            isSelected,
            lock,
            unlock,
            loading,
            update
        })));
        if (!values || !values.length) return <React.Fragment></React.Fragment>;
        return values?.map((e, idx) => {
            if (_.isFunction(e)) {
                return (e({
                    collection,
                    setCollection,
                    collectionRef,
                    updateCollection: update,
                    setCollectionItem,
                    removeCollectionItem,
                    onSelection,
                    isSelected,
                    lock,
                    unlock,
                    loading,
                    update
                }, idx))
            }
            return (<Action
                key={e.key || idx}
                auth={auth}
                mode={"button"}

                locator={props?.locator || name || fieldName}
                collection={collection}
                setCollection={setCollection}
                collectionRef={collectionRef}
                updateCollection={update}
                contextFilters={contextFilters}
                links={linksModelActions}
                scheme={scheme}
                linksCompareFunction={linksCompareFunction}
                // field={field}
                // fieldName={fieldName}
                queryDetail={queryDetail}
                modelActions={modelActions}
                collectionActions={collectionActions}

                {...e}
            />)
        });
    }, [auth, collection, collectionActions, name, mobject, defaultCollectionAction]);
   
    const selectionConfig = (selectionType) => {
        if (!selection) return {};
        return {
            rowSelection: {
                type: selectionType,
                selectedRowKeys,
                onChange: (selectedRowKeys, selectedRows) => {
                    setSelectedRowKeys(selectedRowKeys);
                    setSelectedRows(selectedRows);
                    if (!getSelectedOnly) {
                        triggerChange(_.unionBy([...value], selectedRows, 'ID'));
                    } else {
                        triggerChange(selectedRows);
                    }
                },
            }
        }
    };
    const onSelection = (item) => {
        if (!selection || !item) return;
        if (selectionType === "radio") {
            setSelectedRowKeys([item.ID]);
            setSelectedRows([item]);
            triggerChange([item]);
        } else {
            let sr = selectedRows.filter(e => e?.ID !== item?.ID);
            let srk = selectedRowKeys.filter(e => e !== item?.ID);
            let vsr = value.filter(e => e?.ID !== item?.ID);
            if (sr.length !== selectedRows.length) {
                setSelectedRowKeys(srk);
                setSelectedRows(sr);
                if (!getSelectedOnly) {
                    triggerChange(_.unionBy([...vsr], sr, 'ID'));
                } else {
                    triggerChange(sr);
                }
            } else {
                let v = [...sr, item];
                setSelectedRowKeys([...srk, item?.ID]);
                setSelectedRows(v);
                if (!getSelectedOnly) {
                    triggerChange(_.unionBy([...vsr], v, 'ID'));
                } else {
                    triggerChange(v);
                }
            }
        }
    };
    const isSelected = (item) => {
        let v = selectedRows.find(e => e?.ID === item?.ID);
        return v !== undefined
    };

    const _onFilterChange = React.useMemo(() => (value) => {
        setState(o => ({ ...o, filterChanged: !_.isEqual(o.filter, value), newFilter: value }));
    }, [state]);

    React.useEffect(() => {
        if (collectionRef) {
            collectionRef.current = {
                collection,
                setCollection,
                setCollectionItem,
                removeCollectionItem,
                onSelection,
                isSelected,
                lock,
                unlock,
                loading,
                update,

                filter: state.filter,
                sorting: sorting,
                page: current,
                count
            }
        }
    }, [collection,
        setCollection,
        setCollectionItem,
        removeCollectionItem,
        loading,
        update,

        state.filter,
        sorting,
        current,
        count])

    const getItemLocator = useCallback((item, index) => {
        if (onItemLocator) {
            return onItemLocator(item, index)
        } else {
            return getLocator(props?.locator || "filtered-item-" + name || "filtered-item-" + fieldName || "filtered-item", item)
        }
    }, [onItemLocator, props?.locator, name, fieldName])

    const view = (items) => {
        const _render = (item, index) => {
            if (render) {
                return render(item, index, {
                    collection,
                    setCollection,
                    collectionRef,
                    updateCollection: update,
                    setCollectionItem,
                    removeCollectionItem,
                    update,
                    funcStat,
                    lastFuncStat,
                    response
                });
            }
            return "" + item
        };
        const actions = (item, index) => {
            if (modelActions) {
                return {
                    actions: [RenderOnModelActions(item, index)]
                };
            }
            return {};
        };

        if (mode === "list") {
            return (<div className='filtered-list'>
                {/* <SpinLoading visible={loading} /> */}
                {/* {loading && <Spin tip="Загрузка" />} */}
                <List
                    data-locator={getLocator(props?.locator || "filtered-list-" + name || "filtered-list-" + fieldName || "filtered-list", props?.object)}
                    loading={loading}
                    locale={{ emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Нет данных" /> }}
                    itemLayout="horizontal"
                    dataSource={items}
                    renderItem={((item, index) => (
                        <List.Item
                            data-locator={getItemLocator(item, index)}
                            key={index} className={classes.listItemClass} {...actions(item, index)} style={{ backgroundColor: (isSelected(item)) ? "#e6f7ff" : "transparent", alignItems: "self-start" }} onClick={() => onSelection(item, index)}>
                            {_render(item, index)}
                        </List.Item>
                    ))} />
            </div>
            );
        }
        return (
            <Table
                data-locator={getLocator(props?.locator || "filtered-table-" + name || "filtered-table-" + fieldName || "filtered-table", props?.object)}
                scroll={{ x: "auto" }}
                loading={loading}
                pagination={false}
                columns={columns()}
                rowKey={r => r.ID}
                onRow={(record, rowIndex) => {
                    return {
                        'data-locator': getItemLocator(record, rowIndex)
                        //   onClick: (event) => {}, // click row
                    };
                }}
                dataSource={(items && items.length) ? items : undefined}
                locale={{
                    emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={"Нет данных"}></Empty>
                }}
                size="small"
                {...selectionConfig(selectionType)}
            />
        );
    };
    const titleView = () => {
        if (title || titleFunc) {
            if (titleFunc) {
                return titleFunc(title)
            } else {
                return <div style={{
                    color: "rgba(0, 0, 0, 0.85)",
                    fontWeight: "500",
                    fontSize: "16px"
                }}>
                    {title}
                </div>
                return <Divider type="horizontal" orientation="left">{title}</Divider>
            }
        }
        return <React.Fragment></React.Fragment>
    };

    const customProps = {
        collection,
        setCollection,
        collectionRef,
        updateCollection: update,
        setCollectionItem,
        removeCollectionItem,
        collectionActions: () => (collectionActions) ? clean(unwrap(collectionActions({ mobject, name, field, fieldName, contextObject, collection, setCollection, actions: defaultCollectionAction() }))) : undefined,
        modelActions: (item, index) => (modelActions) ? clean(unwrap(modelActions(item, index, { mobject, name, field, fieldName, contextObject, collection, setCollection, actions: defaultModelAction(item, index) }))) : undefined,
        onSelection,
        isSelected,
        lock,
        unlock,
        loading,
        update,

        linksModelActions,
        mobject,
        name,
        field,
        fieldName,
        contextObject,
        defaultCollectionAction,
        defaultModelAction,

        funcStat,
        lastFuncStat,
        response
    }

    const [openOverlay, setOpenOverlay] = useState(false)
    const isFullscreen = openOverlay;
    const openFullscreen = () => { setOpenOverlay(true) }
    const closeFullscreen = () => { setOpenOverlay(false) }
    return (
        <Overlay
            open={openOverlay}
            setOpen={setOpenOverlay}
        >
            {/* <NearestCollectionContext.Provider value={collectionRef}> */}
            <div style={(style) ? style : {}} data-locator={getLocator(props?.locator || ("collection-" + name) || ("collection-" + fieldName) || "collection", props?.object)} className="collection default-collection filtered">
                <div className="filtered-header"
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        paddingBottom: "10px",
                        ...(headerStyle) ? headerStyle : {}
                    }}>
                    <div style={{ flex: "1 1 auto", paddingRight: "15px", display: "flex", gap: "5px" }}>
                        {RenderOnCollectionActions()}
                    </div>
                    {(filters && filters.length > 0 /*&& collection && collection.length > 0*/) && <div style={{ flex: "0 0 auto", display: "flex", justifyContent: "flex-start", gap: "5px" }}>
                        {allowFullscreen && <div
                            // className={fullscreenButtonClass}
                            // style={fullscreenButtonStyle}
                            className={`bg ${(isFullscreen) ? "bg-altblue" : "bg-grey"} pointer`}
                            style={{
                                minWidth: "28px",
                                fontSize: "14px",
                                lineHeight: "22px",
                                color: (isFullscreen) ? "white" : "black",
                                // backgroundColor: (isFullscreen) ? "#1677FF" : "rgba(190, 190, 190, 0.2)"
                            }}
                            data-locator={getLocator(props?.locator || "collectionfullscreen-" + name || "collectionfullscreen-" + fieldName || "collectionfullscreen", props?.object)}
                            onClick={(e) => { (isFullscreen) ? closeFullscreen() : openFullscreen() }}
                        >
                            {/* <i className="fa fa-arrows-alt"></i> */}
                            {(!isFullscreen) && <FullscreenOutlined />}
                            {(isFullscreen) && <FullscreenExitOutlined />}
                        </div>}
                        <div>
                            <Tooltip title="Фильтр и сортировка">

                                {(floatingFilter && !isFullscreen) && <PopoverModal
                                    // placement={(filterPopoverPlacement) ? filterPopoverPlacement : "bottomRight"}
                                    // autoAdjustOverflow={false}
                                    title="Фильтр и сортировка"
                                    open={filtered}
                                    setOpen={setFiltered}
                                    trigger={
                                        // <Button>
                                        //     <FilterOutlined style={{ color: (filtered) ? "white" : "black" }} />
                                        // </Button>
                                        <FilterButton filtered={filtered} setFiltered={setFiltered} state={state} locator={props?.locator} object={props?.object} name={name} fieldName={fieldName} />
                                    }
                                >
                                    <div style={{
                                        maxWidth: "425px",
                                        ...(filterPopoverStyle) ? filterPopoverStyle : {}
                                    }}>
                                        {((filters && filters.length > 0) && filtered) &&
                                            <FilterContent
                                                auth={auth}
                                                filters={filters}
                                                sorting={sorting}
                                                setSorting={setSorting}
                                                state={state}
                                                funcStat={funcStat}
                                                filtered={filtered}
                                                locator={props?.locator}
                                                object={props?.object}
                                                name={name}
                                                fieldName={fieldName}
                                                _onFilterChange={_onFilterChange}
                                                applyFilter={applyFilter}
                                                clearFilter={clearFilter}
                                            />
                                        }
                                    </div>
                                </PopoverModal>}
                                {/* {(floatingFilter && !isFullscreen) && <Popover
                                    placement={(filterPopoverPlacement) ? filterPopoverPlacement : "bottomRight"}
                                    autoAdjustOverflow={false}
                                    content={<div style={{
                                        maxWidth: "425px",
                                        ...(filterPopoverStyle) ? filterPopoverStyle : {}
                                    }}>
                                        {((filters && filters.length > 0) && filtered) &&
                                            <FilterContent
                                                auth={auth}
                                                filters={filters}
                                                sorting={sorting}
                                                setSorting={setSorting}
                                                state={state}
                                                funcStat={funcStat}
                                                filtered={filtered}
                                                locator={props?.locator}
                                                object={props?.object}
                                                name={name}
                                                fieldName={fieldName}
                                                _onFilterChange={_onFilterChange}
                                                applyFilter={applyFilter}
                                                clearFilter={clearFilter}
                                            />
                                        }
                                    </div>}
                                    title="Фильтр и сортировка"
                                    trigger="click"
                                    open={filtered}
                                    onOpenChange={setFiltered}
                                >
                                    <FilterButton filtered={filtered} setFiltered={setFiltered} state={state} locator={props?.locator} object={props?.object} name={name} fieldName={fieldName} />
                                </Popover>} */}
                                {(!floatingFilter || isFullscreen) &&
                                    <FilterButton filtered={filtered} setFiltered={setFiltered} state={state} locator={props?.locator} object={props?.object} name={name} fieldName={fieldName} />
                                }
                            </Tooltip>
                        </div>
                    </div>}
                </div>
                <Layout style={{ backgroundColor: "transparent", ...(bodyStyle) ? bodyStyle : {} }} className="filtered-body">
                    <div style={{ width: "100%", marginBottom: "0px", ...(isFullscreen) ? { overflow: "auto" } : {}, ...(contentStyle) ? contentStyle : {} }}>
                        {customRender && customRender(collection, customProps)}
                        {(!customRender && PartialReplacementFunc) && <div className='partial-replacement'>
                            <PartialReplacementFunc
                                {...props}
                                {...customProps}
                            />
                        </div>}
                        {(!customRender && !PartialReplacementFunc) && <Card size="small" bordered={false} className={classes.cardSmall} style={{ width: "100%" }}>
                            <div>
                                {titleView()}
                                {view(collection)}
                            </div>
                        </Card>}
                    </div>
                    {(((!floatingFilter || isFullscreen) && filters && filters.length > 0) && filtered) &&
                        <Sider width={240} theme={"light"} style={{ margin: "0 0px 5px 10px" }} className="filtered-sider">
                            <FilterContent
                                auth={auth}
                                filters={filters}
                                sorting={sorting}
                                setSorting={setSorting}
                                state={state}
                                funcStat={funcStat}
                                filtered={filtered}
                                locator={props?.locator}
                                object={props?.object}
                                name={name}
                                fieldName={fieldName}
                                _onFilterChange={_onFilterChange}
                                applyFilter={applyFilter}
                                clearFilter={clearFilter}
                            />
                            {/* {JSX(() => {
                                const fl = filters?.filter(i => i.filter);
                                if (filtered && fl.length > 0) {
                                    return (<React.Fragment>
                                        <div style={{}}>
                                            <Button
                                                data-locator={getLocator(props?.locator || "collectionfilterapply-" + name || "collectionfilterapply-" + fieldName || "collectionfilterapply", props?.object)}
                                                style={{ width: "100%" }} disabled={!state.filterChanged} type="primary" onClick={applyFilter}>Применить</Button>
                                        </div>
                                        <div style={{ marginTop: "5px" }}>
                                            <Button
                                                data-locator={getLocator(props?.locator || "collectionfilterclear-" + name || "collectionfilterclear-" + fieldName || "collectionfilterclear", props?.object)}
                                                style={{ width: "100%" }} disabled={_.isEmpty(state.filter)} onClick={clearFilter}>Очистить</Button>
                                        </div>
                                    </React.Fragment>)
                                }
                                return (<React.Fragment></React.Fragment>)
                            })}
                            <SortingFieldsUI value={sorting} onChange={setSorting} filters={filters} />
                            <FiltersFieldsUI auth={auth} value={state.newFilter} onChange={_onFilterChange} filters={filters} funcs={funcStat} /> */}
                        </Sider>
                    }
                </Layout>
                {(!!count && !!total && totalPages && totalPages > 1) &&
                    <div className="filtered-footer" style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", ...(footerStyle) ? footerStyle : {} }}>
                        <div style={{
                            // fontStyle: "italic",
                            fontSize: "14px",
                            lineHeight: "24px",
                            // fontWeight: "lighter",
                            // color: "#818181"
                        }}>
                            Элементов: {collection?.length} из {total}
                        </div>
                        {pagination && pagination({
                            current: current,
                            setCurrent: setCurrent,
                            count: count,
                            setCount: setCount,
                            total: total,
                            setTotal: setTotal,
                            totalPages: totalPages,
                            setTotalPages: setTotalPages,
                            collection,
                            setCollection: setCollection
                        })}
                        {!pagination && <Pagination className="filtered-pagination" size="small"
                            data-locator={getLocator(props?.locator || "filtered-pagination-" + name || "filtered-pagination-" + fieldName || "filtered-pagination", props?.object)}
                            current={current}
                            onChange={setCurrent}
                            pageSize={count}
                            total={total}
                            showSizeChanger={false}
                        // onShowSizeChange={onShowSizeChange}
                        />}
                    </div>
                }
            </div>
            {/* </NearestCollectionContext.Provider> */}
        </Overlay>
    );
}

export function CollectionServer(props) {
    const { name, fieldName, allowFullscreen, fullReplacement } = props;
    const auth = useAuth();

    const FullReplacementFunc = useCollectionFullReplacement(name, fullReplacement)
    if (FullReplacementFunc) {
        return (<div className='collection full-replacement'>
            <FullReplacementFunc
                {...props}
            />
        </div>)
    }

    return (<React.Fragment>
        <DefaultCollectionServer
            {...props}
        />
    </React.Fragment>
    )
};