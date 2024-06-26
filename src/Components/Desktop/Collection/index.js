import React, { useState, useEffect } from 'react';
import { Layout, Card, Button, Tooltip, Pagination, Empty, Divider, Typography, Tag, Select, List, Badge, Modal } from 'antd';
import { Action } from '../../Action'
import { DropdownAction } from '../DropdownAction'
import { unwrap, GET, errorCatch, QueryParam, GETWITH, If, READWITH, QueryFunc, JSX, GetMetaPropertyByPath, deleteInArray, QueryDetail, subscribe as _subscribe, unsubscribe, clean, JSXMap, getObjectDisplay, ContextFiltersToQueryFilters, contextFilterToObject } from '../../../Tool'
import { FilterOutlined, SortAscendingOutlined, SortDescendingOutlined } from '@ant-design/icons';
import { Field } from '../Field';
import { Model } from '../Model';
import { useMetaContext } from '../../Context';
import uuid from 'react-uuid';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { useCollectionFullReplacement, useCollectionPartialReplacement } from '../../../ComponetsReplacement';

const { CheckableTag } = Tag;
const { Sider } = Layout;
const { Option } = Select;
const { Text } = Typography;

var _ = require('lodash');

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

function DefaultCollection(props) {
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

        render,
        customRender,
        collectionRef,
        contextFilters,
        subscribe,

        // Collection Only Events
        onChange,   // |
        value,      // | AntFrom Item Api
        getSelectedOnly,

        onChangeRequestParameters,
        partialReplacement
    } = props;

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

    const fltrs = (props.filters) ? props.filters() : [];
    const meta = useMetaContext();
    const [loading, setLoading] = useState(false);
    const [collection, setCollection] = useState([]);
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

        let ctxFlt = ContextFiltersToQueryFilters(contextFilters)

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
                    request: () => request(state.filter),
                    state,
                });
            });
            return () => {
                unsubscribe(token);
            };
        }
    }, [subscribe, collection, setCollection, request, state]);

    // ---- AntFrom Item Api ----
    const triggerChange = (value) => {
        if (onChange) {
            onChange(value);
        }
    };
    //---------------------------
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
        let values = clean(unwrap(modelActions(item, index, { mobject, name, field, fieldName, contextObject, collection, actions: defaultAction })));
        if (!values || !values.length) return <React.Fragment></React.Fragment>;
        return <DropdownAction items={values?.map((e, idx) => ({
            key: e.key || idx,
            auth: auth,
            mode: "MenuItem",
            object: item,
            collection: collection,
            setCollection: setCollection,
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
        let values = clean(unwrap(collectionActions({ mobject, name, field, fieldName, contextObject, collection, actions: defaultAction })));
        if (!values || !values.length) return <React.Fragment></React.Fragment>;
        return values?.map((e, idx) => {
            if (_.isFunction(e)) {
                return (e({
                    collection,
                    setCollection,
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
        loading,
        update])

    const view = (items) => {
        const _render = (item, index) => {
            if (render) {
                return render(item, index, {
                    collection,
                    setCollection,
                    update
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
        return (<div className='filtered-list'>
            {/* <SpinLoading visible={loading} /> */}
            {/* {loading && <Spin tip="Загрузка" />} */}
            <List
                loading={loading}
                locale={{ emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Нет данных" /> }}
                itemLayout="horizontal"
                dataSource={items}
                renderItem={((item, index) => (
                    <List.Item key={uuid() /*item?.ID || index*/} {...actions(item, index)} style={{ backgroundColor: (isSelected(item)) ? "#e6f7ff" : "transparent", alignItems: "self-start" }} onClick={() => onSelection(item, index)}>
                        {_render(item, index)}
                    </List.Item>
                ))} />
        </div>
        );
    };

    const customProps = {
        collection,
        setCollection,
        collectionActions: () => (collectionActions) ? clean(unwrap(collectionActions({ mobject, name, field, fieldName, contextObject, collection, actions: defaultCollectionAction }))) : undefined,
        modelActions: (item, index) => (modelActions) ? clean(unwrap(modelActions(item, index, { mobject, name, field, fieldName, contextObject, collection, actions: defaultModelAction }))) : undefined,
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
    }

    return (
        <React.Fragment>
            {/* <NearestCollectionContext.Provider value={collectionRef}> */}
            <div className="collection default-collection filtered">
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
                    {(filters && filters.length > 0) && <div justify="end">
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
                        {customRender && customRender(collection, customProps)}
                        {(!customRender && PartialReplacementFunc) && <div className='partial-replacement'>
                            <PartialReplacementFunc
                                {...props}
                                {...customProps}
                            />
                        </div>}
                        {(!customRender && !PartialReplacementFunc) && <Card size="small" bordered={false} style={{ width: "100%" }}>
                            <div>
                                {title}
                                {view(collection)}
                            </div>
                        </Card>}
                    </div>
                    {((filters && filters.length > 0) && filtered) &&
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
                {(!!count && !!total && totalPages && totalPages > 1) && <Card size="small" bordered={false} style={{ display: "flex", justifyContent: "flex-end", paddingTop: "10px", paddingBottom: "10px" }}>
                    <Pagination className="filtered-pagination" size="small"
                        current={current}
                        onChange={setCurrent}
                        pageSize={count}
                        total={total}
                        showSizeChanger={false}
                    />
                </Card>}
            </div>
            {/* </NearestCollectionContext.Provider> */}
        </React.Fragment>
    );
}

export function Collection(props) {
    const { name, fieldName, fullReplacement } = props;
    // const FullReplacementFunc = useCollectionFullReplacement(fieldName, fullReplacement)
    const FullReplacementFunc = useCollectionFullReplacement(name, fullReplacement)
    if (FullReplacementFunc) {
        return (<div className='collection full-replacement'>
            <FullReplacementFunc
                {...props}
            />
        </div>)
    }
    return (
        <DefaultCollection
            {...props}
        />
    )
};