import React, { useState, useEffect } from 'react';
import { Form, Button, Badge, List, Picker, SwipeAction, PageIndicator, Stepper } from 'antd-mobile';
import { unwrap, errorCatch, Request, QueryParam, GETWITH, READWITH, updateInArray, deleteInArray, GetMetaPropertyByPath, QueryFunc, If } from '../../../Tool'
import Icofont from 'react-icofont';
import { createUseStyles } from 'react-jss';
import { Action, ActionPickerItem } from '../../Action';
import { SortAscendingOutlined, SortDescendingOutlined } from '@ant-design/icons';
import { FieldMobile } from '../FieldMobile';
import { useMetaContext } from '../../Context';
import { BlockHeaderMobile } from '../BlockHeaderMobile';
import { DropdownMobile } from '../DropdownMobile'
import "./index.css"
import 'moment/locale/ru';
import uuid from 'react-uuid';

var _ = require('lodash');
const Item = List.Item;

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
    Obj: {
        '&.am-list-item .am-list-line .am-list-content': {
            fontSize: "14px",
            paddingTop: "0px",
            paddingBottom: "0px",
        },
        '&.am-list-item .am-list-line .am-list-arrow': {
            position: "absolute",
            right: "0",
            top: "3px",
        },
        '&.am-list-item .am-list-line .am-list-extra': {
            textAlign: "left",
            paddingTop: "0px",
            paddingBottom: "14px",
            fontWeight: "300"
        },
        '&.am-list-item': {
            paddingLeft: "0px",
        },
        '&.am-list-item .am-list-line': {
            display: "block",
            paddingRight: "0px"
        },
        '&.am-list-item .am-list-line::after': {
            backgroundColor: "transparent!important"
        }
    },
    FilterList: {
        '& .picker-list .am-list-body': {
            paddingTop: "15px"
        }
    }
})
function SortingField(props) {
    const classes = useStyles()
    const { filters, value, onChange } = props;
    // const [state, setState] = useState({ name: "", order: "ASC" })
    // console.log("SortingField", value);

    const s = React.useMemo(() => {
        const so = filters.filter(f => f.sort);
        return so.map((item, idx) => {
            return {
                label: item.label,
                value: item.name,
                item
            };
        });
        const l = s.find(e => e.value === value.name);
    }, [filters]);
    const sortingOrder = React.useCallback(() => {
        if (value.order === "ASC") {
            onChange({ name: value.name, order: "DESC" });
        } else {
            onChange({ name: value.name, order: "ASC" });
        }
    }, [value])
    const onSortingChangeString = React.useCallback((v, item) => {
        onChange({ name: v, order: value.order })
    }, [value]);
    const rval = React.useMemo(() => [value.name], [value])
    const onOk = React.useCallback((v) => {
        if (v.length) {
            onSortingChangeString(v[0], filters.find(i => i.name === v[0]))
        }
    }, [filters, onSortingChangeString]);
    return (<React.Fragment>
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px", marginTop: "25px", paddingRight: "10px" }}>
                <div style={{
                    fontFamily: "-apple-system, BlinkMacSystemFont, Roboto, 'Open Sans', 'Helvetica Neue', 'Noto Sans Armenian', 'Noto Sans Bengali', 'Noto Sans Cherokee', 'Noto Sans Devanagari', 'Noto Sans Ethiopic', 'Noto Sans Georgian', 'Noto Sans Hebrew', 'Noto Sans Kannada', 'Noto Sans Khmer', 'Noto Sans Lao', 'Noto Sans Osmanya', 'Noto Sans Tamil', 'Noto Sans Telugu', 'Noto Sans Thai', sans-serif",
                    fontSize: "13px",
                    fontWeight: "600",
                    color: "rgba(0, 0, 0, 0.85)",
                    padding: "0px 21px 0px 11px"
                }}>
                    ????????????????????
                </div>
                <div style={{ flex: "auto", margin: "10px 10px", height: "1px", backgroundColor: "#f0f0f0" }}></div>
                <div>
                    {value.order === "ASC" &&
                        <Button icon={<SortAscendingOutlined />} onClick={sortingOrder} />
                    }
                    {value.order === "DESC" &&
                        <Button icon={<SortDescendingOutlined />} onClick={sortingOrder} />
                    }
                </div>
            </div>
            <div style={{ margin: "10px" }} className={classes.FilterList}>
                <List style={{ backgroundColor: 'white' }} className="picker-list">
                    <Picker
                        data={s}
                        cols={1}
                        value={rval}
                        extra={<React.Fragment></React.Fragment>}
                        onOk={onOk}
                        okText="??????????????"
                        dismissText="????????????">
                        <List.Item className={classes.Obj} arrow="horizontal">
                            {/* {l && l.label} */}
                            ???????????????????? ???? ????????
                        </List.Item>
                    </Picker>
                </List>
            </div>
        </div>
    </React.Fragment>)
}
function FilteringField(props) {
    const classes = useStyles()
    const { auth, filters, funcStat, value, onChange } = props;
    // const [state, setState] = useState({})
    // console.log("FilteringField", value);
    const f = React.useMemo(() => {
        const fl = filters.filter(i => i.filter);
        return fl.map((item, idx) => {
            // console.log("value[item.name] = ", value[item.name]);
            return (
                <div key={idx} style={{ marginBottom: "10px" }}>
                    {/* {item.filter && (item.type !== "bool" || item.type !== "boolean") && <div>{item.label}</div>} */}
                    {<SwipeAction
                        autoClose
                        right={[
                            {
                                text: (<Icofont icon="close" />),
                                onPress: () => {
                                    onFilterChange(undefined, item)
                                },
                                style: { backgroundColor: '#F4333C', color: 'white' },
                            },
                        ]}
                    >
                        <FieldMobile
                            key={idx}
                            auth={auth}
                            item={{ ...item, func: (funcStat && funcStat[item.name.toLowerCase()]) ? funcStat[item.name.toLowerCase()] : {} }}
                            value={value[item.name]}
                            onChange={(value) => onFilterChange(value, item)}
                        /></SwipeAction>}
                </div>
            );
        });
    }, [value, filters]);

    const onFilterChange = React.useMemo(() => (v, item) => {
        if (!v || (_.isArray(v) && v.length == 0)) {
            let f = { ...value };
            delete f[item.name]
            onChange(f);
            return
        }
        let filtr = { ...value, [item.name]: v };
        onChange(filtr);
    }, [value]);
    return (<React.Fragment>
        <React.Fragment>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px", marginTop: "25px", paddingRight: "10px" }}>
                <div style={{
                    fontFamily: "-apple-system, BlinkMacSystemFont, Roboto, 'Open Sans', 'Helvetica Neue', 'Noto Sans Armenian', 'Noto Sans Bengali', 'Noto Sans Cherokee', 'Noto Sans Devanagari', 'Noto Sans Ethiopic', 'Noto Sans Georgian', 'Noto Sans Hebrew', 'Noto Sans Kannada', 'Noto Sans Khmer', 'Noto Sans Lao', 'Noto Sans Osmanya', 'Noto Sans Tamil', 'Noto Sans Telugu', 'Noto Sans Thai', sans-serif",
                    fontSize: "13px",
                    fontWeight: "600",
                    color: "rgba(0, 0, 0, 0.85)",
                    padding: "0px 21px 0px 11px"
                }}>
                    ??????????????
                </div>
                <div style={{ flex: "auto", margin: "10px 10px", height: "1px", backgroundColor: "#f0f0f0" }}></div>
            </div>
            <div style={{ margin: "10px", paddingTop: "10px" }}>
                <div className={classes.FilterList}>
                    <List style={{ backgroundColor: 'white' }} className="picker-list">
                        {f}
                    </List>
                </div>
            </div>
        </React.Fragment>
    </React.Fragment>)
}
function SortingFiltering(props) {
    const classes = useStyles()
    const { auth, form, object, filters, funcStat } = props;
    // const [state, setState] = useState({ sorting: { name: "", order: "ASC" }, filter: {} })
    useEffect(() => {
        form.resetFields();
    }, []);

    return (<Form
        form={form}
        onFinish={props.submit}
        initialValues={object}
    >
        <Form.Item name="sorting">
            <SortingField auth={auth} filters={filters} />
        </Form.Item>
        <Form.Item name="filter">
            <FilteringField auth={auth} filters={filters} funcStat={funcStat} />
        </Form.Item>
    </Form>)
}

export function CollectionServerMobile(props) {
    const classes = useStyles()
    const {
        auth,
        name,
        source,
        title,
        extra,
        size,
        modelActions,
        collectionActions,
        selection, // undefined, "radio" ?????? "checkbox"
        mode, // table, list
        render,
        titleFunc,
        extraFunc,
        noheader
    } = props;

    const meta = useMetaContext();

    // const [opened, setOpened] = useState(false);
    const [loading, setLoading] = useState(false);
    const [collection, setCollection] = useState([]);
    const [funcStat, setFuncStat] = useState();
    const [state, setState] = useState({ current: 1, sorting: { name: "", order: "ASC" }, filter: {} })
    const [filtered, setFiltered] = useState(false);
    const [filters, setFilters] = useState([]);
    const [mobject, setMObject] = useState();
    // const [sorting, setSorting] = useState({ name: "", order: "ASC" });
    // const [current, setCurrent] = useState(1);
    const [count, setCount] = useState(15);
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

    const setCollectionItem = React.useCallback((item) => {
        setCollection(updateInArray(collection, item));
    }, [collection]);
    const removeCollectionItem = React.useCallback((item) => {
        setCollection(deleteInArray(collection, item));
    }, [collection]);

    // const clearFilter = React.useCallback(() => {
    //     setFuncStat(undefined);
    //     setState({ ...state, filterChanged: false, filter: {} });
    //     setCurrent(1);
    // }, [current]);

    // const applyFilter = React.useMemo(() => (filter) => {
    //     setState({ ...filter, filterChanged: false });
    //     if (current == 1) {
    //         request(filter);
    //     } else {
    //         setCurrent(1);
    //     }
    // }, [current, state.filter, state.sorting]);

    const request = React.useCallback(() => {
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

        let flt = [];
        Object.keys(state.filter).forEach(key => {
            var item = filters.find(e => e.name == key);
            let filterByKey = state.filter[key];
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
                QueryParam(`page`, state.current),
                QueryParam(`count`, count),
                If(state.sorting.name, QueryParam(`s-${state.sorting.name}`, state.sorting.order)),
                ...flt,
                ...func
            ], ({ data }) => {
                if (!funcStat) {
                    setFuncStat(data.stat);
                }
                setCount(data.size);
                setTotal(data.totalPages /*totalElements*/);
                setCollection((data && data.content) ? data.content : []);
                unlock();
            }, (err, type) => errorCatch(err, type, unlock));
        } else {
            READWITH(auth, name, [
                QueryParam(`page`, state.current),
                QueryParam(`count`, count),
                If(state.sorting.name, QueryParam(`s-${state.sorting.name}`, state.sorting.order)),
                ...flt,
                ...func
            ], ({ data }) => {
                if (!funcStat) {
                    setFuncStat(data.stat);
                }
                setCount(data.size);
                setTotal(data.totalPages /*totalElements*/);
                setCollection((data && data.content) ? data.content : []);
                unlock();
            }, (err, type) => errorCatch(err, type, unlock));
        }
    }, [state.current, count, state.filter, state.sorting, funcStat, filters]);

    useEffect(() => {
        request();
    }, [name, state.filter, filters, state.sorting, state.current, setCollection]);

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
        onValues, // (values, context) => { }, // ???????? ?????? return ???? ???????????? ?????? ??????????????, ???????? ???????????? return ???? ???????????? ????????????
        onData,   // (values, context) => { }, // ???????? ?????? return ???? ???????????? ?????? ??????????????, ???????? ???????????? return ???? ???????????? ????????????
        onClose,   // ({unlock, close}, context) => { },
        onError,  // (err, type, {unlock, close}) => {},
        onDispatch, // (values, context) => {}, // ???????? ???? ???????????????????? ???????????????? ???? ???????????????? ?????????? ???????????? ???????????????????? setCollection, 
        // ???????? ???????????? ?????????????? ?? ???????????????? ???????????????? ???? ?????? ?????????????? ?????????? ?????????????? ???????????? setCollection 
        // ?? ?? ?????? ?????????? ???????????????? ???????????????? ???????????? ??????????????????
    } = props;

    // ---- AntFrom Item Api ----
    const triggerChange = (value) => {
        if (onChange) {
            onChange(value);
        }
    };
    //---------------------------

    const columns = React.useCallback(() => {
        var c = [];
        let tmp = (props.columns) ? props.columns({
            auth,
            collection,
            setCollection: setCollection,
            request: (values, itemAction) => Request(values, itemAction, {
                auth,
                collection,
                setCollection: setCollection,
                onData: onData || ((values, context) => values.data),

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
    }, [modelActions, lock, auth, unlock]);
    const intermediate = (values, unlock, close, item, index) => {
        return Request(values, item, {
            auth,
            collection,
            setCollection: setCollection,
            onData: onData || ((values, context) => values.data),

            index,
            unlock,
            close,
            onValues,
            onClose,
            onError,
            onDispatch
        })
    };
    const RenderOnModelActions = React.useCallback((item, index) => {
        if (!modelActions) return <React.Fragment></React.Fragment>;
        let values = unwrap(modelActions(item, index));
        if (!values || !values.length) return <React.Fragment></React.Fragment>;
        return <DropdownMobile>
            {values.map((e, idx) => <ActionPickerItem
                key={idx}
                auth={auth}
                mode={"MenuItem"}
                object={item}
                {...{
                    collection: collection,
                    setCollection: setCollection,
                    ...e,
                    // action: (values, unlock, close) => intermediate(values, unlock, close, e, idx),
                }}
            />)}
        </DropdownMobile>;
    }, [auth, modelActions]);
    const RenderOnCollectionActions = React.useCallback(() => {
        if (!collectionActions) return <React.Fragment></React.Fragment>;
        let values = unwrap(collectionActions());
        if (!values || !values.length) return <React.Fragment></React.Fragment>;
        return <div>
            {values.map((e, idx) => <Action
                key={idx}
                auth={auth}
                mode={"button"}
                {...{
                    collection: collection,
                    setCollection: setCollection,
                    ...e,
                    // action: (values, unlock, close) => intermediate(values, unlock, close, e, idx),
                }}
            />)}
        </div>;
    }, [auth, collectionActions]);
    const hasSelected = selectedRowKeys.length > 0;
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
    const onSelection = (item, index) => {
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
    const _render = React.useCallback((item, index) => {
        if (render) {
            return render(item, index, {
                setCollection,
                setCollectionItem,
                removeCollectionItem,
                update: request
            });
        }
        return "" + item
    }, [render, setCollection, setCollectionItem, removeCollectionItem, request]);
    const actions = (item, index) => {
        let values = unwrap(modelActions(item, index));
        if (modelActions && values && values.length) {
            return {
                actions: [RenderOnModelActions(item, index)]
            };
        }
        return {};
    };
    const titleView = React.useCallback(() => {
        if (title || titleFunc) {
            if (titleFunc) {
                return titleFunc(title)
            } else {
                return title
            }
        }
        return <React.Fragment></React.Fragment>
    }, [title, titleFunc]);
    const titleExtra = React.useCallback(() => {
        if (extra || extraFunc) {
            if (extraFunc) {
                return extraFunc(extra)
            } else {
                return extra
            }
        }
        return <React.Fragment></React.Fragment>
    }, [extra, extraFunc]);
    const act = React.useCallback((values, unlock, close) => {
        // applyFilter
        setState({ ...values, current: 1 });
        close();
    }, []);
    const footer = React.useCallback(({
        DismissFunction,
        OkFunction,
        form,
        object,
        unlock,
        close,
        mode,
        readonly,
        loading
    }) => [
            {
                name: "????????????????",
                callback: () => {
                    // clearFilter
                    setState({ ...object, filter: {}, current: 1 });
                    close();
                },
            },
            {
                name: "??????????????????",
                callback: OkFunction,
            },
        ], []);
    const trigger = React.useCallback((click) => (
        <div onClick={click} style={{ cursor: "pointer", padding: "5px" }}>
            {!_.isEmpty(state.filter) && <Badge dot>
                <Icofont icon="filter" />
            </Badge>}
            {_.isEmpty(state.filter) && <Icofont icon="filter" />}
        </div>
    ), [state.filter])
    const PaginatorChange = React.useCallback((v) => setState({ ...state, current: v }), [state]);
    return (
        <React.Fragment>
            {!noheader && <BlockHeaderMobile
                title={titleView()}
                extra={titleExtra()}
            />}
            {filters.length == 0 && <div>
                {(collection && collection.length > 0) && <div>
                    <List className="my-list">
                        {(collection && collection.length > 0) && collection.map((item, index) => (
                            <Item key={index} multipleLine align="top" wrap style={{ paddingLeft: "0px" }}>
                                {_render(item, index)}
                            </Item>
                        ))}
                    </List>
                </div>}
                {(!collection || collection.length == 0) && <div style={{
                    textAlign: "center",
                    fontSize: "18px",
                    color: "rgba(0,0,0,0.4)",
                    padding: "20px 0px"
                }}>
                    <span>?????? ????????????</span>
                </div>}
            </div>}

            {filters.length > 0 &&
                <div className="filtered" style={{ position: "relative", height: "100%" }}>
                    <div style={{
                        height: "43px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        border: "1px solid #f0f0f0",
                        padding: "7px",
                        borderRadius: "3px",
                    }}>
                        <div style={{ flex: "auto", paddingRight: "15px" }}>
                            {RenderOnCollectionActions()}
                        </div>
                        <div style={{ display: "flex", justifyContent: "flex-end" }}>
                            <Action
                                auth={auth}
                                action={act}
                                object={state}
                                okText={"??????????????????"}
                                dismissText={"????????????????"}
                                footer={footer}
                                mode={"func"}
                                form={SortingFiltering}
                                filters={filters}
                                funcStat={funcStat}
                                trigger={trigger}
                            />
                        </div>
                    </div>
                    <List className="my-list">
                        {(collection && collection.length > 0) && collection.map((item, index) => (
                            <Item key={index} multipleLine align="top" wrap style={{ paddingLeft: "0px" }}>
                                {_render(item, index)}
                            </Item>
                        ))}
                    </List>
                    <div style={{ paddingTop: "15px" }}>
                        {(total > 1) &&
                            <div style={{display:"flex", justifyContent:"space-between"}}>
                                <PageIndicator
                                    total={total}
                                    current={state.current}
                                    style={{
                                        '--dot-size': '10px',
                                        '--active-dot-size': '30px',
                                        '--dot-border-radius': '50%',
                                        '--active-dot-border-radius': '15px',
                                        '--dot-spacing': '8px',
                                    }}
                                />
                                <Stepper
                                    step={1}
                                    defaultValue={1}
                                    min={1}
                                    max={total}
                                    value={state.current}
                                    onChange={PaginatorChange} />
                            </div>
                            // <Pagination className="filtered-pagination" size="small"
                            //     current={state.current}
                            //     total={total}
                            //     onChange={PaginatorChange}
                            // />
                        }
                    </div>
                </div>
            }
        </React.Fragment>
    );
}