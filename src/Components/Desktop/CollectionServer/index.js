import React, { useState, useEffect } from 'react';
import { Layout, Card, Button, Tooltip, Pagination, Empty, Divider, Typography, Tag, Select, List, Table } from 'antd';
import 'moment/locale/ru';
import { Action } from '../../Action'
import { DropdownAction } from '../DropdownAction'
import { unwrap, GET, errorCatch, Request, QueryParam, GETWITH, If, READWITH, QueryFunc, JSX, GetMetaPropertyByPath, updateInArray, deleteInArray, QueryDetail } from '../../../Tool'
import { createUseStyles } from 'react-jss';
import "./index.css"
import { FilterOutlined, SortAscendingOutlined, SortDescendingOutlined } from '@ant-design/icons';
import 'moment/locale/ru';
import { Field } from '../Field';
import { Model } from '../Model';
import { useMetaContext } from '../../Context';

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

export function CollectionServer(props) {
    const classes = useStyles()
    const {
        auth,
        name,
        source,
        title,
        size,
        modelActions,
        defaultModelActions,
        collectionActions,
        defaultCollectionActions,
        selection, // undefined, "radio" или "checkbox"
        mode, // table, list
        render,
        titleFunc,
        contextFilters
    } = props;

    const meta = useMetaContext();

    const [loading, setLoading] = useState(false);
    const [collection, setCollection] = useState([]);
    const [funcStat, setFuncStat] = useState();
    const [state, setState] = useState({ filter: {}, newFilter: [], filterChanged: false })
    const [filtered, setFiltered] = useState(false);
    const [filters, setFilters] = useState([]);
    const [mobject, setMObject] = useState();
    const [sorting, setSorting] = useState({ name: "", order: "ASC" });
    const [current, setCurrent] = useState(1);
    const [count, setCount] = useState(20);
    const [total, setTotal] = useState(1);

    const lock = () => {
        setLoading(true);
    };
    const unlock = () => {
        setLoading(false);
    };
    useEffect(() => {
        if (name && meta) {
            let mo = meta[name];
            if (mo) {
                setMObject(mo);
                if (props.filters) {
                    let f = props.filters().map(pf => {
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
            var f = (props.filters) ? props.filters() : [];
            setFilters(f);
        }
    }, [name, meta]);

    // console.log(mobject);

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
        if (current == 1) {
            request(state.newFilter);
        } else {
            setCurrent(1);
        }
    }, [current, state]);

    const request = React.useMemo(() => (filter) => {
        if (!filters || !filters.length) return;

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

        let ctxFlt = [];
        if (contextFilters) {
            let ctx = contextFilters();
            if (_.isArray(ctx)) {
                ctx.forEach(item => {
                    ctxFlt.push(QueryParam("w-" + ((item.method) ? item.method + "-" : "eq-") + item.name, item.value))
                });
            }
        }

        let flt = [];
        Object.keys(filter).forEach(key => {
            var item = filters.find(e => e.name == key);
            let filterByKey = filter[key];
            switch (item.filterType) {
                case "group":
                    switch (item.type) {
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
                    switch (item.type) {
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
                            flt.push(QueryParam("w-" + key, filterByKey))
                            break;
                    }
                    break;
                default:
                    switch (item.type) {
                        case "string":
                            flt.push(QueryParam("w-co-" + key, filterByKey))
                            break;
                        default:
                            flt.push(QueryParam("w-" + key, filterByKey))
                            break;
                    }
                    break;
            }
        });

        let func = [];
        filters.forEach(item => {
            if (item.func && _.isArray(item.func)) {
                item.func.forEach(fu => {
                    func.push(QueryFunc(fu, item.name))
                });
            }
        });

        if (source) {
            GETWITH(auth, source, [
                QueryDetail("model"),
                QueryParam(`page`, current),
                QueryParam(`count`, count),
                If(sorting.name, QueryParam(`s-${sorting.name}`, sorting.order)),
                ...flt,
                ...func,
                ...ctxFlt
            ], ({ data }) => {
                if (!funcStat) {
                    setFuncStat(data.stat);
                }
                setCount(data.size);
                setTotal(data.totalElements);
                setCollection((data && data.content) ? data.content : []);
                unlock();
            }, (err, type) => errorCatch(err, type, unlock));
        } else {
            READWITH(auth, name, [
                QueryDetail("model"),
                QueryParam(`page`, current),
                QueryParam(`count`, count),
                If(sorting.name, QueryParam(`s-${sorting.name}`, sorting.order)),
                ...flt,
                ...func,
                ...ctxFlt
            ], ({ data }) => {
                if (!funcStat) {
                    setFuncStat(data.stat);
                }
                setCount(data.size);
                setTotal(data.totalElements);
                setCollection((data && data.content) ? data.content : []);
                unlock();
            }, (err, type) => errorCatch(err, type, unlock));
        }
    }, [current, count, sorting, funcStat, filters]);

    const update = React.useCallback(() => {
        request(state.filter);
    }, [request, state.filter]);

    useEffect(() => {
        request(state.filter);
    }, [name, state.filter, filters, sorting, current]);

    // Table Items Selection
    const [selectionType, setSelectionType] = useState(selection || 'checkbox'); // radio
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [selectedRows, setSelectedRows] = useState([]);
    useEffect(() => {
        setSelectionType(selection);
    }, [selection]);

    // Events
    const {
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
    } = props;

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
    const intermediate = (values, unlock, close, item, index) => {
        return Request(values, item, {
            auth,
            collection,
            setCollection: setCollection,
            onData: onData || ((values) => values.data),

            index,
            unlock,
            close,
            onValues,
            onClose,
            onError,
            onDispatch
        })
    };
    const RenderOnModelActions = (item, index) => {
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
                            let ctx = contextFilters();
                            console.log(ctx);
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
                title: "Удалить",
                action: (values, unlock, close, { collection, setCollection }) => {
                    GET(auth, "/api/query-delete/" + name.toLowerCase() + '/' + item.ID,
                        () => setCollection(deleteInArray(collection, item)), errorCatch
                    );
                    // POST(auth, "/api/query-delete/" + name.toLowerCase(), { ...item },
                    //     () => setCollection(deleteInArray(collection, item)), errorCatch
                    // );
                },
            }
        ];
        if (defaultModelActions) return (<DropdownAction
            items={
                defaultAction.map((e, idx) => ({
                    key: e.key || idx,
                    auth: auth,
                    mode: "MenuItem",
                    object: item,
                    ...{
                        ...e,
                        action: (values, unlock, close) => intermediate(values, unlock, close, e, idx),
                    }
                }))
            } />)
        if (!modelActions) return <React.Fragment></React.Fragment>;
        let values = unwrap(modelActions(item, index));
        if (!values || !values.length) return <React.Fragment></React.Fragment>;
        return <DropdownAction items={values.map((e, idx) => ({
            key: e.key || idx,
            auth: auth,
            mode: "MenuItem",
            object: item,
            ...{
                ...e,
                action: (values, unlock, close) => intermediate(values, unlock, close, e, idx),
            }
        }))} />
    };
    const RenderOnCollectionActions = () => {
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
                            let ctx = contextFilters();
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
                options: {
                    initialValues: {},
                },
                meta: mobject,
            }
        ];
        if (defaultCollectionActions) return <div>
            {defaultAction.map((e, idx) => <Action
                key={e.key || idx}
                auth={auth}
                mode={"button"}
                {...{
                    ...e,
                    action: (values, unlock, close) => intermediate(values, unlock, close, e, idx),
                }}
            />)}
        </div>;
        if (!collectionActions) return <React.Fragment></React.Fragment>;
        let values = unwrap(collectionActions());
        if (!values || !values.length) return <React.Fragment></React.Fragment>;
        return <div>
            {values.map((e, idx) => <Action
                key={e.key || idx}
                auth={auth}
                mode={"button"}
                {...{
                    ...e,
                    action: (values, unlock, close) => intermediate(values, unlock, close, e, idx),
                }}
            />)}
        </div>;
    };
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
        if (!selection) return {};
        let sr = selectedRows.filter(e => e.ID !== item.ID);
        let srk = selectedRowKeys.filter(e => e !== item.ID);
        let vsr = value.filter(e => e.ID !== item.ID);
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
            setSelectedRowKeys([...srk, item.ID]);
            setSelectedRows(v);
            if (!getSelectedOnly) {
                triggerChange(_.unionBy([...vsr], v, 'ID'));
            } else {
                triggerChange(v);
            }
        }
    };
    const isSelected = (item) => {
        let v = selectedRows.find(e => e.ID === item.ID);
        return v !== undefined
    };
    const filters_ui = React.useMemo(() => (filters) => {
        const fl = filters.filter(i => i.filter);
        const f = fl.map((item) => {
            return (
                <div key={((mobject) ? mobject.name : "") + item.name} style={{ marginBottom: "10px" }}>
                    {item.filter && (item.type !== "bool" || item.type !== "boolean") && <Text>{item.label}</Text>}
                    {<Field
                        mode="filter"
                        key={((mobject) ? mobject.name : "") + item.name}
                        auth={auth}
                        item={{ ...item, func: (funcStat && funcStat[item.name.toLowerCase()]) ? funcStat[item.name.toLowerCase()] : {} }}
                        value={state.newFilter[item.name]}
                        onChange={(value) => onFilterChange(value, item)}
                    />}
                </div>
            );
        });
        return (
            <React.Fragment>
                {(fl.length > 0) && <React.Fragment>
                    <Divider type="horizontal"
                        orientation="left"
                        style={{ margin: "12px 0", fontSize: "13px", fontWeight: "600", padding: "0px 15px 0px 5px" }} >
                        Фильтры
                    </Divider>
                    <div style={{ margin: "10px" }}>
                        <div>
                            {f}
                        </div>
                    </div>
                </React.Fragment>}
            </React.Fragment>
        );
    }, [funcStat, state, mobject]);
    const sorting_ui = React.useMemo(() => (filters) => {
        const so = filters.filter(f => f.sort);
        const s = so.map((item, idx) => {
            return (
                <Option key={idx} value={item.name}>{item.label}</Option>
            );
        });
        return (
            <React.Fragment>
                {(so.length > 0) && <div>
                    <Divider type="horizontal"
                        orientation="left"
                        style={{ margin: "12px 0", fontSize: "13px", fontWeight: "600", padding: "0px 15px 0px 5px" }} >
                        Сортировка
                    </Divider>
                    <div style={{ margin: "10px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <Select
                                allowClear={true}
                                value={sorting.name}
                                onChange={(value) => onSortingChangeString(value, filters.find(i => i.name === value))}
                                optionFilterProp="children"
                                filterOption={(input, option) =>
                                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                }
                                style={{ width: "100%", maxWidth: "183px", marginRight: "5px" }}
                            >{s}</Select>
                            <div>
                                {sorting.order === "ASC" && <Tooltip title="Восходящий">
                                    <Button icon={<SortAscendingOutlined />} onClick={sortingOrder} />
                                </Tooltip>}
                                {sorting.order === "DESC" && <Tooltip title="Нисходящий">
                                    <Button icon={<SortDescendingOutlined />} onClick={sortingOrder} />
                                </Tooltip>}
                            </div>
                        </div>
                    </div>
                </div>}
            </React.Fragment>
        );
    }, [sorting]);
    const sortingOrder = () => {
        if (sorting.order === "ASC") {
            setSorting({ name: sorting.name, order: "DESC" });
        } else {
            setSorting({ name: sorting.name, order: "ASC" });
        }
    }
    const onFilterChange = React.useMemo(() => (value, item) => {
        if (!value || (_.isArray(value) && value.length == 0)) {
            let f = { ...state.newFilter };
            delete f[item.name]
            setState({ ...state, filterChanged: !_.isEqual(state.filter, f), newFilter: f });
            return
        }
        let newFiltr = { ...state.newFilter, [item.name]: value };
        setState({ ...state, filterChanged: !_.isEqual(state.filter, newFiltr), newFilter: newFiltr });
    }, [state]);
    const onSortingChangeString = (value, item) => {
        setSorting({ name: value, order: sorting.order, f: (item && item.value) ? item.value : () => "" })
    };
    const view = (items) => {
        if (mode === "list") {
            const _render = (item, index) => {
                if (render) {
                    return render(item, index, {
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
            return (
                <List
                    locale={{ emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Нет данных" /> }}
                    itemLayout="horizontal"
                    dataSource={items}
                    renderItem={((item, index) => (
                        <List.Item key={index} className={classes.listItemClass} {...actions(item, index)} style={{ backgroundColor: (isSelected(item)) ? "#e6f7ff" : "transparent", alignItems: "self-start" }} onClick={() => onSelection(item, index)}>
                            {_render(item, index)}
                        </List.Item>
                    ))} />
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
                <Card size="small" bordered={(size !== "small")} className={(size === "small") ? classes.cardSmallHeader : ""}>
                    <div className="filtered-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ flex: "auto", paddingRight: "15px" }}>
                            {RenderOnCollectionActions()}
                        </div>
                        <div justify="end">
                            <Tooltip title="Фильтр и сортировка">
                                <CheckableTag
                                    style={{ cursor: "pointer" }}
                                    checked={filtered}
                                    onChange={checked => setFiltered(checked)}
                                >
                                    <FilterOutlined />
                                </CheckableTag>
                            </Tooltip>
                        </div>
                    </div>
                </Card>
                <Layout style={{ backgroundColor: "transparent" }} className="filtered-body">
                    <div style={{ width: "100%", marginBottom: (size === "small") ? "0px" : "5px" }}>
                        <Card size="small" bordered={(size !== "small")} className={(size === "small") ? classes.cardSmall : ""} style={{ width: "100%" }}>
                            <div>
                                {titleView()}
                                {view(collection)}
                            </div>
                        </Card>
                    </div>
                    {filtered && <Sider width={240} theme={"light"} style={{ margin: "0 1px 5px 5px" }} className="filtered-sider">
                        {JSX(() => {
                            const fl = filters.filter(i => i.filter);
                            if (filtered && fl.length > 0) {
                                return (<React.Fragment>
                                    <div style={{ margin: "10px" }}>
                                        <Button style={{ width: "100%" }} disabled={!state.filterChanged} type="primary" onClick={applyFilter}>Применить</Button>
                                    </div>
                                    <div style={{ margin: "10px" }}>
                                        <Button style={{ width: "100%" }} disabled={_.isEmpty(state.filter)} onClick={clearFilter}>Очистить</Button>
                                    </div>
                                </React.Fragment>)
                            }
                            return (<React.Fragment></React.Fragment>)
                        })}
                        {sorting_ui(filters)}
                        {filters_ui(filters)}
                    </Sider>}
                </Layout>
                {(!!count && !!total) && <Card size="small" bordered={(size !== "small")} className={(size === "small") ? classes.cardSmall : ""} style={{ display: "flex", justifyContent: "flex-end", paddingTop: "10px" }}>
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