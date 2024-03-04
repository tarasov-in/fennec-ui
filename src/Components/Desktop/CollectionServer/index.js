import React, { useState, useEffect } from 'react';
import { Layout, Card, Button, Tooltip, Pagination, Empty, Divider, Typography, Tag, Select, List, Table, Spin, Badge, Modal } from 'antd';
import { Action } from '../../Action'
import { DropdownAction } from '../DropdownAction'
import { unwrap, GET, errorCatch, Request, QueryParam, GETWITH, If, READWITH, QueryFunc, JSX, GetMetaPropertyByPath, updateInArray, deleteInArray, QueryDetail, subscribe as _subscribe, unsubscribe, clean, JSXMap, getObjectDisplay } from '../../../Tool'
import { createUseStyles } from 'react-jss';
import "./index.css"
import { FilterOutlined, SortAscendingOutlined, SortDescendingOutlined } from '@ant-design/icons';
import { Field } from '../Field';
import { Model } from '../Model';
import { useMetaContext } from '../../Context';
import uuid from 'react-uuid';
import { ExclamationCircleOutlined } from '@ant-design/icons';

const { CheckableTag } = Tag;
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
            padding: "6px 0"
        },
        '&.ant-list-item .ant-list-item-action': {
            marginLeft: "0px",
            marginTop: "8px",
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
            <div style={{}}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <Select
                        allowClear={true}
                        value={value.name}
                        onChange={(v) => onChange({ name: v, order: value.order })}
                        optionFilterProp="children"
                        filterOption={(input, option) =>
                            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                        }
                        style={{ width: "100%", maxWidth: "203px", marginRight: "5px" }}
                    >
                        {JSXMap(filters?.filter(f => f.sort), (item, idx) => (
                            <Option key={idx} value={item.name}>{item.label}</Option>
                        ))}
                    </Select>
                    <div>
                        {value.order === "ASC" && <Tooltip title="Восходящий">
                            <Button icon={<SortAscendingOutlined />} onClick={() => onChange({ name: value.name, order: (value.order === "ASC") ? "DESC" : "ASC" })} />
                        </Tooltip>}
                        {value.order === "DESC" && <Tooltip title="Нисходящий">
                            <Button icon={<SortDescendingOutlined />} onClick={() => onChange({ name: value.name, order: (value.order === "ASC") ? "DESC" : "ASC" })} />
                        </Tooltip>}
                    </div>
                </div>
            </div>
        </React.Fragment>
    );
}
export function FiltersFieldsUI(props) {
    const { auth, filters, funcs, value, onChange } = props;

    const onFilterChange = React.useMemo(() => (v, item) => {
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
            <div style={{}}>
                <div>
                    {JSXMap(filters?.filter(i => i.filter), (item, idx) => (
                        <div key={item.name} style={{ marginBottom: "10px" }}>
                            {item.filter && (item.type !== "bool" && item.type !== "boolean") && <Text>{item.label}</Text>}
                            <Field
                                mode="filter"
                                key={item.name}
                                auth={auth}
                                item={{ ...item, func: (funcs && funcs[item.name.toLowerCase()]) ? funcs[item.name.toLowerCase()] : {} }}
                                value={value[item.name]}
                                onChange={(value) => onFilterChange(value, item)}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </React.Fragment>
    )
}

export function CollectionServer(props) {
    const classes = useStyles()
    const {
        auth,
        name,
        source,
        queryDetail,
        title,

        modelActions,
        defaultModelActions,
        defaultnModelActionMeta,
        collectionActions,
        defaultCollectionActions,
        defaultCollectionActionMeta,

        linksModelActions,
        // linksCollectionActions,

        selection, // undefined, "radio" или "checkbox"
        mode, // table, list
        render,
        customRender,
        collectionRef,
        titleFunc,
        contextFilters,
        subscribe,

        onCollectionChange,
        // Collection Only Events
        onChange,   // |
        value,      // | AntFrom Item Api
        getSelectedOnly,

        // Collection and Model Events
        onValues, // (values, context) => { }, // если без return то просто как событие, если внутри return то замена данных
        onData,   // (values, context) => { }, // если без return то просто как событие, если внутри return то замена данных
        onClose,   // ({unlock, close}, context) => { },
        onError,  // (err, type, {unlock, close}) => {},
        onDispatch, // (values, context) => {}, // если не возвращает значения то посленеё будет вызван внутренний setCollection, 
        // если вернет функцию в качестве значения то эта функция будет вызвана вместо setCollection 
        // и в неё будет передано значение нового состояния

        onChangeRequestParameters,
    } = props;

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

    const fltrs = (props.filters) ? props.filters() : [];
    const meta = useMetaContext();
    const [loading, setLoading] = useState(false);
    const [collection, _setCollection] = useState([]);
    const [funcStat, setFuncStat] = useState();
    const [state, setState] = useState({
        filter: defFilters((props.filters) ? fltrs : []),
        newFilter: defFilters((props.filters) ? fltrs : []),
        filterChanged: false
    })
    const [filtered, setFiltered] = useState(false);
    const [filters, setFilters] = useState();
    const [mobject, setMObject] = useState();
    const [sorting, setSorting] = useState(defSorting((props.filters) ? fltrs : []));
    const [current, _setCurrent] = useState((props.page) ? props.page() : 1);
    const [count, setCount] = useState((props.count) ? props.count() : 20);
    const [total, setTotal] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        if (onChangeRequestParameters) {
            onChangeRequestParameters({
                filter: state.filter,
                sorting: sorting,
                page: current,
                count
            })
        }
    }, [state.filter, sorting, current, count])

    const setCurrent = (value) => {
        _setCurrent(value);
        window.scrollTo(0, 0);
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

    // const setDefaultFilters = React.useCallback((filters) => {
    //     if (filters && filters.length) {
    //         let filtr = defFilters(filters)//{ ...state.filter };
    //         setState({ ...state, filterChanged: false, newFilter: filtr, filter: filtr });

    //         let sorted = defSorting(filters)//{ name: "", order: "ASC" }
    //         setSorting(sorted);

    //         setCurrent(1);
    //     }
    // }, [state])
    // useEffect(() => {
    //     setDefaultFilters(filters)
    // }, [filters])

    const setCollection = React.useCallback((array) => {
        _setCollection(array);
        // console.log(array);
        if (onCollectionChange) {
            onCollectionChange(array);
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
        setState({ ...state, filterChanged: false, newFilter: {}, filter: {} });
        setCurrent(1);
    }, [current]);

    const applyFilter = React.useMemo(() => () => {
        setState({ ...state, filterChanged: false, filter: state.newFilter });
        setCurrent(1);
    }, [current, state]);

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

        let ctxFlt = [];
        if (contextFilters) {
            let ctx = clean(contextFilters());
            if (_.isArray(ctx)) {
                ctx.forEach(item => {
                    if (item) {
                        if (_.isObject(item)) {
                            ctxFlt.push(QueryParam("w-" + ((item.method) ? item.method + "-" : "eq-") + item.name, item.value))
                        } else if (_.isFunction(item)) {
                            ctxFlt.push(item())
                        } else if (_.isString(item)) {
                            ctxFlt.push(item)
                        }
                    }
                });
            }
        }

        let flt = [];
        Object.keys(filter).forEach(key => {
            var item = filters?.find(e => e.name == key);

            if (item) {
                let filterByKey = filter[key];
                switch (item?.filterType) {
                    case "group":
                        switch (item?.type) {
                            case "object":
                            case "document":
                                flt.push(QueryParam("w-in-" + key, filterByKey))
                                break;
                            default:
                                flt.push(QueryParam("w-in-" + key, filterByKey))
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
                                    flt.push(QueryParam("w-lge-" + key, filterByKey[0]))
                                    flt.push(QueryParam("w-lwe-" + key, filterByKey[1]))
                                }
                                break;
                            case "double":
                            case "float":
                            case "float64":
                            case "float32":
                                if (_.isArray(filterByKey) && filterByKey.length >= 2) {
                                    flt.push(QueryParam("w-lge-" + key, filterByKey[0]))
                                    flt.push(QueryParam("w-lwe-" + key, filterByKey[1]))
                                }
                                break;
                            case "time":
                                if (_.isArray(filterByKey) && filterByKey.length >= 2) {
                                    flt.push(QueryParam("w-lge-" + key, filterByKey[0].format("HH:mm:ss")))
                                    flt.push(QueryParam("w-lwe-" + key, filterByKey[1].format("HH:mm:ss")))
                                }
                                break;
                            case "date":
                                if (_.isArray(filterByKey) && filterByKey.length >= 2) {
                                    flt.push(QueryParam("w-lge-" + key, filterByKey[0].format("YYYY-MM-DD")))
                                    flt.push(QueryParam("w-lwe-" + key, filterByKey[1].format("YYYY-MM-DD")))
                                }
                                break;
                            case "datetime":
                            case "time.Time":
                                if (_.isArray(filterByKey) && filterByKey.length >= 2) {
                                    flt.push(QueryParam("w-lge-" + key, filterByKey[0].format("YYYY-MM-DD HH:mm")))
                                    flt.push(QueryParam("w-lwe-" + key, filterByKey[1].format("YYYY-MM-DD HH:mm")))
                                }
                                break;
                            default:
                                if (item?.queryComparer) {
                                    flt.push(QueryParam(`w-${item?.queryComparer}-` + key, filterByKey))
                                } else {
                                    flt.push(QueryParam("w-" + key, filterByKey))
                                }
                                break;
                        }
                        break;
                    default:
                        switch (item?.type) {
                            case "string":
                                // queryComparer:"sim", // wsim, swsim
                                flt.push(QueryParam(`w-${item?.queryComparer || "co"}-` + key, filterByKey))
                                break;
                            case "func":
                                flt.push(QueryParam(`${item?.queryPrefix || ""}` + key, filterByKey))
                                break;
                            default:
                                if (item?.queryComparer) {
                                    flt.push(QueryParam(`w-${item?.queryComparer}-` + key, filterByKey))
                                } else {
                                    flt.push(QueryParam("w-" + key, filterByKey))
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
                    if (!funcStat) {
                        setFuncStat(data?.stat);
                    }
                    setTotalPages(data?.totalPages);
                    setCount(data?.size);
                    setTotal(data?.totalElements);
                    setCollection((data && data?.content) ? data?.content : []);
                    // unlock();
                }
            });
        } else if (source && !_.isFunction(source)) {
            lock();
            GETWITH(auth, source, [
                QueryDetail(queryDetail || "model"),
                QueryParam(`page`, current),
                QueryParam(`count`, count),
                If(sorting.name, QueryParam(`s-${sorting.name}`, sorting.order)),
                ...flt,
                ...func,
                ...ctxFlt
            ], ({ data }) => {
                if (!funcStat) {
                    setFuncStat(data?.stat);
                }
                setTotalPages(data?.totalPages);
                setCount(data?.size);
                setTotal(data?.totalElements);
                setCollection((data && data?.content) ? data?.content : []);
                unlock();
            }, (err) => errorCatch(err, unlock));
        } else {
            lock();
            READWITH(auth, name, [
                QueryDetail(queryDetail || "model"),
                QueryParam(`page`, current),
                QueryParam(`count`, count),
                If(sorting.name, QueryParam(`s-${sorting.name}`, sorting.order)),
                ...flt,
                ...func,
                ...ctxFlt
            ], ({ data }) => {
                if (!funcStat) {
                    setFuncStat(data?.stat);
                }
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
        // console.log("request", state.filter, sorting);
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
        if (modelActions || defaultModelActions) {
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
    const RenderOnModelActions = React.useCallback((item, index) => {
        let defaultAction = (!name) ? [] : [
            {
                key: "change",
                title: "Изменить",
                action: {
                    method: "POST",
                    path: "/api/query-update/" + name.toLowerCase(),
                    mutation: "update",
                    onValues: (values) => {
                        let ctxFlt = {};
                        if (contextFilters) {
                            let ctx = clean(contextFilters());
                            if (_.isArray(ctx)) {
                                ctx.forEach(item => {
                                    if (item.action) {
                                        ctxFlt[item.name.toLowerCase() + ((item.name && item.name.endsWith("ID")) ? "" : "ID")] = item.value;
                                    }
                                });
                            }
                        }
                        return { ...values, ...ctxFlt, ID: item.ID }
                    },
                    onClose: ({ close }) => close()
                },
                contextFilters: contextFilters,
                form: Model,

                links: linksModelActions,
                queryDetail: queryDetail,
                defaultModelActions: defaultModelActions,
                defaultnModelActionMeta: defaultnModelActionMeta,
                defaultCollectionActions: defaultCollectionActions,
                defaultCollectionActionMeta: defaultCollectionActionMeta,

                modal: {
                    width: "700px"
                },
                options: {
                    initialValues: {
                        ...item
                    },
                },
                meta: (defaultnModelActionMeta) ? defaultnModelActionMeta(mobject, item) : mobject,
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
        ];
        if (defaultModelActions) return (<DropdownAction
            items={
                defaultAction?.map((e, idx) => ({
                    key: e.key || idx,
                    auth: auth,
                    mode: "MenuItem",
                    object: item,
                    collection: collection,
                    setCollection: setCollection,
                    ...e
                }))
            } />)
        if (!modelActions) return <React.Fragment></React.Fragment>;
        let values = clean(unwrap(modelActions(item, index, {name, mobject, actions: defaultAction})));
        if (!values || !values.length) return <React.Fragment></React.Fragment>;
        return <DropdownAction items={values?.map((e, idx) => ({
            key: e.key || idx,
            auth: auth,
            mode: "MenuItem",
            object: item,
            collection: collection,
            setCollection: setCollection,

            links: linksModelActions,
            queryDetail: queryDetail,
            defaultModelActions: defaultModelActions,
            defaultnModelActionMeta: defaultnModelActionMeta,
            defaultCollectionActions: defaultCollectionActions,
            defaultCollectionActionMeta: defaultCollectionActionMeta,

            ...e
        }))} />
    }, [auth, collection, modelActions, defaultModelActions, defaultnModelActionMeta, name, mobject]);
    const RenderOnCollectionActions = React.useCallback(() => {

        let defaultAction = (!name) ? [] : [
            {
                key: "create",
                title: "Создать",
                action: {
                    method: "POST",
                    path: "/api/query-create/" + name.toLowerCase(),
                    mutation: "update",
                    onValues: (values) => {
                        let ctxFlt = {};
                        if (contextFilters) {
                            let ctx = clean(contextFilters());
                            if (_.isArray(ctx)) {
                                ctx.forEach(item => {
                                    if (item.action) {
                                        ctxFlt[item.name.toLowerCase() + ((item.name && item.name.endsWith("ID")) ? "" : "ID")] = item.value;
                                    }
                                });
                            }
                        }
                        return { ...values, ...ctxFlt }
                    },
                    onClose: ({ close }) => close(),
                },
                contextFilters: contextFilters,
                form: Model,

                links: linksModelActions,
                queryDetail: queryDetail,
                defaultModelActions: defaultModelActions,
                defaultnModelActionMeta: defaultnModelActionMeta,
                defaultCollectionActions: defaultCollectionActions,
                defaultCollectionActionMeta: defaultCollectionActionMeta,

                options: {
                    initialValues: {},
                },
                meta: (defaultCollectionActionMeta) ? defaultCollectionActionMeta(mobject) : mobject,
            }
        ];
        if (defaultCollectionActions) return <div>
            {defaultAction?.map((e, idx) => <Action
                key={e.key || idx}
                auth={auth}
                mode={"button"}

                collection={collection}
                setCollection={setCollection}
                {...e}
            />)}
        </div>;
        if (!collectionActions) return <React.Fragment></React.Fragment>;
        let values = clean(unwrap(collectionActions({name, mobject, actions: defaultAction})));
        if (!values || !values.length) return <React.Fragment></React.Fragment>;
        return values?.map((e, idx) => {
            if (_.isFunction(e)) {
                return (e({
                    collection,
                    setCollection,
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

                collection={collection}
                setCollection={setCollection}

                links={linksModelActions}
                queryDetail={queryDetail}
                defaultModelActions={defaultModelActions}
                defaultnModelActionMeta={defaultnModelActionMeta}
                defaultCollectionActions={defaultCollectionActions}
                defaultCollectionActionMeta={defaultCollectionActionMeta}

                {...e}
            />)
        });
    }, [auth, collection, collectionActions, defaultCollectionActions, defaultCollectionActionMeta, name, mobject]);
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

    const onFilterChange = React.useMemo(() => (value) => {
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
                update
            }
        }
    }, [collection,
        setCollection,
        setCollectionItem,
        removeCollectionItem,
        loading,
        update])

    const view = (items) => {
        const _render = (item, index) => {
            if (render) {
                return render(item, index, {
                    collection,
                    setCollection,
                    setCollectionItem,
                    removeCollectionItem,
                    update
                });
            }
            return "" + item
        };
        const actions = (item, index) => {
            if (modelActions || defaultModelActions) {
                return {
                    actions: [RenderOnModelActions(item, index)]
                };
            }
            return {};
        };

        // if (customRender) {
        //     return customRender(items, {
        //         collection,
        //         setCollection,
        //         setCollectionItem,
        //         removeCollectionItem,
        //         update,
        //         //subscribe !!!!
        //     })
        // }

        if (mode === "list") {
            return (<div className='filtered-list'>
                {/* <SpinLoading visible={loading} /> */}
                {/* {loading && <Spin tip="Загрузка" />} */}
                <List
                    loading={loading}
                    locale={{ emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Нет данных" /> }}
                    itemLayout="horizontal"
                    dataSource={items}
                    renderItem={((item, index) => (
                        <List.Item key={index} className={classes.listItemClass} {...actions(item, index)} style={{ backgroundColor: (isSelected(item)) ? "#e6f7ff" : "transparent", alignItems: "self-start" }} onClick={() => onSelection(item, index)}>
                            {_render(item, index)}
                        </List.Item>
                    ))} />
            </div>
            );
        }
        return (
            <Table
                scroll={{ x: "auto" }}
                loading={loading}
                pagination={false}
                columns={columns()}
                rowKey={r => r.ID}
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
    return (
        <React.Fragment>
            <div className="filtered">
                <div className="filtered-header"
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        paddingBottom: "10px"
                    }}>
                    <div style={{ flex: "auto", paddingRight: "15px", display: "flex", gap: "5px" }}>
                        {RenderOnCollectionActions()}
                    </div>
                    {(filters && filters.length > 0 /*&& collection && collection.length > 0*/) && <div justify="end">
                        <Tooltip title="Фильтр и сортировка">
                            <CheckableTag
                                style={{ cursor: "pointer", margin: "0" }}
                                checked={filtered}
                                onChange={checked => setFiltered(checked)}
                            >
                                <Badge dot={(state && state.filter && Object.keys(state.filter)?.length > 0) ? true : false}>
                                    <FilterOutlined style={{ color: (filtered) ? "white" : "black" }} />
                                </Badge>
                            </CheckableTag>
                        </Tooltip>
                    </div>}
                </div>
                <Layout style={{ backgroundColor: "transparent" }} className="filtered-body">
                    <div style={{ width: "100%", marginBottom: "0px" }}>
                        {customRender && customRender(collection, {
                            collection,
                            setCollection,
                            setCollectionItem,
                            removeCollectionItem,
                            collectionActions: () => (collectionActions) ? clean(unwrap(collectionActions())) : undefined,
                            modelActions: (item, index) => (modelActions) ? clean(unwrap(modelActions(item, index))) : undefined,
                            onSelection,
                            isSelected,
                            lock,
                            unlock,
                            loading,
                            update
                        })}
                        {!customRender && <Card size="small" bordered={false} className={classes.cardSmall} style={{ width: "100%" }}>
                            <div>
                                {titleView()}
                                {view(collection)}
                            </div>
                        </Card>}
                    </div>
                    {((filters && filters.length > 0 /*&& collection && collection.length > 0*/) && filtered) &&
                        <Sider width={240} theme={"light"} style={{ margin: "0 0px 5px 10px" }} className="filtered-sider">
                            {JSX(() => {
                                const fl = filters?.filter(i => i.filter);
                                if (filtered && fl.length > 0) {
                                    return (<React.Fragment>
                                        <div style={{}}>
                                            <Button style={{ width: "100%" }} disabled={!state.filterChanged} type="primary" onClick={applyFilter}>Применить</Button>
                                        </div>
                                        <div style={{ marginTop: "5px" }}>
                                            <Button style={{ width: "100%" }} disabled={_.isEmpty(state.filter)} onClick={clearFilter}>Очистить</Button>
                                        </div>
                                    </React.Fragment>)
                                }
                                return (<React.Fragment></React.Fragment>)
                            })}
                            <SortingFieldsUI value={sorting} onChange={setSorting} filters={filters} />
                            <FiltersFieldsUI auth={auth} value={state.newFilter} onChange={onFilterChange} filters={filters} funcs={funcStat} />
                        </Sider>}
                </Layout>
                {(!!count && !!total && totalPages && totalPages > 1) && <Card size="small" bordered={false} className={classes.cardSmall} style={{ display: "flex", justifyContent: "flex-end", paddingTop: "10px", paddingBottom: "10px" }}>
                    <Pagination className="filtered-pagination" size="small"
                        current={current}
                        onChange={setCurrent}
                        pageSize={count}
                        total={total}
                        showSizeChanger={false}
                    />
                </Card>}
            </div>
        </React.Fragment>
    );
}