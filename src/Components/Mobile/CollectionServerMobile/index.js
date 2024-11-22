import React, { useState, useEffect, useCallback } from 'react';
import { Form, Button, Badge, List, Picker, SwipeAction, PageIndicator, Stepper, PickerView, Popup, Space, Empty as EmptyMobile, Mask, DotLoading } from 'antd-mobile';
import { unwrap, errorCatch, Request, QueryParam, GETWITH, READWITH, updateInArray, deleteInArray, GetMetaPropertyByPath, QueryFunc, If, QueryDetail, subscribe as _subscribe, unsubscribe, clean, ContextFiltersToQueryFilters, contextFilterToObject, getLocator } from '../../../Tool'
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
import { ModelMobile } from '../ModelMobile';
import { useCollectionFullReplacement, useCollectionPartialReplacement } from '../../../ComponetsReplacement';
import { collectionQueryParams } from '../../Desktop/CollectionServer';

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

const MaskWithLoading = ({ visible, setVisible }) => {
    return (
        <Mask visible={visible} opacity='thin' onMaskClick={(setVisible) ? () => setVisible(false) : undefined}>
            <div style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "24px",
                width: "150px",
                height: "150px",
                marginTop: "-75px",
                marginLeft: "-75px",
                // background: "white",
                // borderRadius: "16px",
            }}>
                <DotLoading color='white' />
            </div>
        </Mask >
    )
}

export function SortingFieldsUIMobile(props) {
    const classes = useStyles()
    const { filters, value, onChange } = props;
    // const [state, setState] = useState({ name: "", order: "ASC" })
    // console.log("SortingField", value);

    const s = React.useMemo(() => {
        const so = filters?.filter(f => f.sort);
        return so?.map((item, idx) => {
            return {
                label: item.label,
                value: item.name,
                item
            };
        });
        // const l = s.find(e => e.value === value.name);
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
    // const rval = React.useMemo(() => [value.name], [value])
    const onOk = React.useCallback((v) => {
        if (v.length) {
            onSortingChangeString(v[0], filters.find(i => i.name === v[0]))
        }
    }, [filters, onSortingChangeString]);
    const [visible, setVisible] = useState(false);
    const current = React.useMemo(() => {
        return s?.find(e => e.value === value.name)?.label;
    }, [value])
    return (<React.Fragment>
        <div data-locator={getLocator(props?.locator || "sorting", props?.object)}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px", paddingRight: "10px" }}>
                <div style={{
                    fontFamily: "-apple-system, BlinkMacSystemFont, Roboto, 'Open Sans', 'Helvetica Neue', 'Noto Sans Armenian', 'Noto Sans Bengali', 'Noto Sans Cherokee', 'Noto Sans Devanagari', 'Noto Sans Ethiopic', 'Noto Sans Georgian', 'Noto Sans Hebrew', 'Noto Sans Kannada', 'Noto Sans Khmer', 'Noto Sans Lao', 'Noto Sans Osmanya', 'Noto Sans Tamil', 'Noto Sans Telugu', 'Noto Sans Thai', sans-serif",
                    // fontSize: "13px",
                    fontWeight: "600",
                    color: "rgba(0, 0, 0, 0.85)",
                    padding: "0px 21px 0px 11px",
                    // fontSize:"14px"
                }}>
                    Сортировка
                </div>
                <div style={{ flex: "auto", margin: "10px 10px", height: "1px", backgroundColor: "#f0f0f0" }}></div>
            </div>
            <div style={{ padding: "5px 0px", margin: "10px" }}>
                <div className='bg bg-grey' style={{ textAlign: "left", paddingLeft: "5px", marginBottom: "5px" }}>
                    Сортировать по
                </div>
                <div style={{ paddingBottom: "10px", display: "flex", gap: "5px" }}>
                    <div onClick={() => {
                        setVisible(true)
                    }} style={{
                        flex: "1 1 auto",
                        border: "1px solid #e5e5e5",
                        borderRadius: "4px",
                        padding: "2px 6px"
                    }}>
                        <Picker
                            data-locator={getLocator(props?.locator || "sortingselect", props?.object)}
                            columns={[s]}
                            visible={visible}
                            onClose={() => {
                                setVisible(false)
                            }}
                            cancelText="Отмена"
                            confirmText="Выбрать"
                            value={[value.name]}
                            onConfirm={onOk}
                        />
                        {current}
                    </div>
                    <div
                        data-locator={getLocator(props?.locator || "sortingorder", props?.object)}
                        onClick={sortingOrder}
                        style={{
                            flex: "0 0 35px",
                            border: "1px solid #e5e5e5",
                            borderRadius: "4px",
                            padding: "2px 6px",
                            // fontSize:"14px"
                        }}>
                        {value.order === "ASC" &&
                            <span><SortDescendingOutlined /></span>
                        }
                        {value.order === "DESC" &&
                            <span><SortAscendingOutlined /></span>
                        }
                    </div>
                </div>
            </div>
        </div>
    </React.Fragment>)
}
export function FiltersFieldsUIMobile(props) {
    const classes = useStyles()
    const { auth, filters, funcStat, value, onChange } = props;
    const f = React.useMemo(() => {
        const fl = filters?.filter(i => i.filter);
        return fl?.map((item, idx) => {
            return (
                <div key={idx} style={{ marginBottom: "10px" }}>
                    <FieldMobile
                        key={idx}
                        formItem={true}
                        auth={auth}
                        item={{ ...item, func: (funcStat && funcStat[item.name.toLowerCase()]) ? funcStat[item.name.toLowerCase()] : {} }}
                        value={value[item.name]}
                        onChange={(value) => onFilterChange(value, item)}
                    />
                </div>
            );
        });
    }, [value, filters]);
    const onFilterChange = React.useMemo(() => (v, item) => {
        if ((!v && !item?.permanent) || (item?.permanent && (v === undefined || v === null)) || (_.isArray(v) && v.length == 0)) {
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
            <div
                data-locator={getLocator(props?.locator || "filters", props?.object)}
                style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px", paddingRight: "10px" }}>
                <div style={{
                    fontFamily: "-apple-system, BlinkMacSystemFont, Roboto, 'Open Sans', 'Helvetica Neue', 'Noto Sans Armenian', 'Noto Sans Bengali', 'Noto Sans Cherokee', 'Noto Sans Devanagari', 'Noto Sans Ethiopic', 'Noto Sans Georgian', 'Noto Sans Hebrew', 'Noto Sans Kannada', 'Noto Sans Khmer', 'Noto Sans Lao', 'Noto Sans Osmanya', 'Noto Sans Tamil', 'Noto Sans Telugu', 'Noto Sans Thai', sans-serif",
                    fontWeight: "600",
                    color: "rgba(0, 0, 0, 0.85)",
                    padding: "0px 21px 0px 11px"
                }}>
                    Фильтры
                </div>
                <div style={{ flex: "auto", margin: "10px 10px", height: "1px", backgroundColor: "#f0f0f0" }}></div>
            </div>
            <div className={classes.FilterList} style={{ margin: "10px" }}>
                <List
                    data-locator={getLocator(props?.locator || "filtersfield", props?.object)}
                    style={{ backgroundColor: 'white' }} className="picker-list">
                    {f}
                </List>
            </div>
        </React.Fragment>
    </React.Fragment>)
}
export function FilteringUIMobile(props) {
    const classes = useStyles()
    const { auth, form, object, filters, funcStat } = props;
    useEffect(() => {
        form.resetFields();
        if (object) {
            form.setFieldsValue(object);
        }
    }, [object]);
    return (
        <div>
            <Form
                form={form}
                onFinish={props.submit}
                initialValues={object}
                style={{
                    '--border-bottom': "none",
                    '--border-inner': "none",
                    '--border-top': "none"
                }}
            >
                <Form.Item name="sorting">
                    <SortingFieldsUIMobile auth={auth} filters={filters} />
                </Form.Item>
                <Form.Item name="filter">
                    <FiltersFieldsUIMobile auth={auth} filters={filters} funcStat={funcStat} />
                </Form.Item>
            </Form>
        </div>)
}

function DefaultCollectionServer(props) {
    const classes = useStyles()
    const {
        auth,
        name,
        source,
        queryDetail,
        title,
        extra,

        linksModelActions,
        modelActions,
        // defaultModelActions,
        // defaultModelActionMeta,
        modelActionsTitle,
        collectionActions,
        // defaultCollectionActions,
        // defaultCollectionActionMeta,
        scheme,
        field,
        fieldName,
        contextObject,
        linksCompareFunction,


        selection, // undefined, "radio" или "checkbox"

        render,
        customRender,
        collectionRef,
        titleFunc,
        extraFunc,
        noheader,
        contextFilters,
        subscribe,

        onItemLocator,

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
        partialReplacement
    } = props;

    // const PartialReplacementFunc = useCollectionPartialReplacement(fieldName, partialReplacement)
    const PartialReplacementFunc = useCollectionPartialReplacement(name, partialReplacement)

    const meta = useMetaContext();
    const fltrs = (props.filters) ? props.filters() : [];

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

    // const [opened, setOpened] = useState(false);
    const [loading, setLoading] = useState(false);
    const [collection, _setCollection] = useState([]);
    const [response, setResponse] = useState();
    const [funcStat, setFuncStat] = useState();
    const [lastFuncStat, setLastFuncStat] = useState();
    const [state, setState] = useState({
        current: (props.page) ? parseInt(props.page()) || 1 : 1,
        sorting: defSorting((props.filters) ? fltrs : []),
        filter: defFilters((props.filters) ? fltrs : [])
    })
    const [filtered, setFiltered] = useState(false);
    const [filters, setFilters] = useState();
    const [mobject, setMObject] = useState();
    // const [sorting, setSorting] = useState({ name: "", order: "ASC" });
    // const [current, setCurrent] = useState(1);
    const [count, setCount] = useState((props.count) ? props.count() : 20);
    const [total, setTotal] = useState(1);

    useEffect(() => {
        if (onChangeRequestParameters) {
            onChangeRequestParameters({
                filter: state.filter,
                sorting: state.sorting,
                page: (parseInt(state.current) || 1),
                count
            })
        }
    }, [state.filter, state.sorting, state.current, count])


    // console.log(loading);
    const lock = () => {
        setLoading(true);
    };
    const unlock = () => {
        setLoading(false);
    };

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
        _setCollection(array);
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

    // const clearFilter = React.useCallback(() => {
    //     setFuncStat(undefined);
    // setLastFuncStat(undefined);
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
        // if (!filters || !filters.length) return;

        if (!meta || !filters) {
            return
        }

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

        // let ctxFlt = ContextFiltersToQueryFilters(contextFilters)

        // let flt = [];
        // Object.keys(state.filter).forEach(key => {
        //     var item = filters?.find(e => e.name == key);
        //     if (item) {
        //         let filterByKey = state.filter[key];
        //         switch (item?.filterType) {
        //             case "group":
        //                 switch (item?.type) {
        //                     case "object":
        //                     case "document":
        //                         flt.push(QueryParam("w-in-" + key, filterByKey))
        //                         break;
        //                     default:
        //                         flt.push(QueryParam("w-in-" + key, filterByKey))
        //                         break;
        //                 }
        //                 break;
        //             case "range":
        //                 switch (item?.type) {
        //                     case "int":
        //                     case "uint":
        //                     case "integer":
        //                     case "int64":
        //                     case "int32":
        //                     case "uint64":
        //                     case "uint32":
        //                         if (_.isArray(filterByKey) && filterByKey.length >= 2) {
        //                             flt.push(QueryParam("w-lge-" + key, filterByKey[0]))
        //                             flt.push(QueryParam("w-lwe-" + key, filterByKey[1]))
        //                         }
        //                         break;
        //                     case "double":
        //                     case "float":
        //                     case "float64":
        //                     case "float32":
        //                         if (_.isArray(filterByKey) && filterByKey.length >= 2) {
        //                             flt.push(QueryParam("w-lge-" + key, filterByKey[0]))
        //                             flt.push(QueryParam("w-lwe-" + key, filterByKey[1]))
        //                         }
        //                         break;
        //                     case "time":
        //                         if (_.isArray(filterByKey) && filterByKey.length >= 2) {
        //                             flt.push(QueryParam("w-lge-" + key, filterByKey[0].format("HH:mm:ss")))
        //                             flt.push(QueryParam("w-lwe-" + key, filterByKey[1].format("HH:mm:ss")))
        //                         }
        //                         break;
        //                     case "date":
        //                         if (_.isArray(filterByKey) && filterByKey.length >= 2) {
        //                             flt.push(QueryParam("w-lge-" + key, filterByKey[0].format("YYYY-MM-DD")))
        //                             flt.push(QueryParam("w-lwe-" + key, filterByKey[1].format("YYYY-MM-DD")))
        //                         }
        //                         break;
        //                     case "datetime":
        //                     case "time.Time":
        //                         if (_.isArray(filterByKey) && filterByKey.length >= 2) {
        //                             flt.push(QueryParam("w-lge-" + key, filterByKey[0].format("YYYY-MM-DD HH:mm")))
        //                             flt.push(QueryParam("w-lwe-" + key, filterByKey[1].format("YYYY-MM-DD HH:mm")))
        //                         }
        //                         break;
        //                     default:
        //                         if (item?.queryComparer) {
        //                             flt.push(QueryParam(`w-${item?.queryComparer}-` + key, filterByKey))
        //                         } else {
        //                             flt.push(QueryParam("w-" + key, filterByKey))
        //                         }
        //                         break;
        //                 }
        //                 break;
        //             default:
        //                 switch (item?.type) {
        //                     // queryComparer:"sim", // wsim, swsim
        //                     case "string":
        //                         flt.push(QueryParam(`w-${item?.queryComparer || "co"}-` + key, filterByKey))
        //                         break;
        //                     case "time":
        //                         flt.push(QueryParam("w-eq-" + key, filterByKey.format("HH:mm:ss")))
        //                         break;
        //                     case "date":
        //                         flt.push(QueryParam("w-eq-" + key, filterByKey.format("YYYY-MM-DD")))
        //                         break;
        //                     case "datetime":
        //                     case "time.Time":
        //                         flt.push(QueryParam("w-eq-" + key, filterByKey.format("YYYY-MM-DD HH:mm")))
        //                         break;
        //                     case "func":
        //                         flt.push(QueryParam(`${item?.queryPrefix || ""}` + key, filterByKey))
        //                         break;
        //                     default:
        //                         if (item?.queryComparer) {
        //                             flt.push(QueryParam(`w-${item?.queryComparer}-` + key, filterByKey))
        //                         } else {
        //                             flt.push(QueryParam("w-" + key, filterByKey))
        //                         }
        //                         break;
        //                 }
        //                 break;
        //         }
        //     }
        // });

        // let func = [];
        // filters?.forEach(item => {
        //     if (item.func && _.isArray(item.func)) {
        //         item.func.forEach(fu => {
        //             func.push(QueryFunc(fu, item.name))
        //         });
        //     }
        // });

        let queryParams = collectionQueryParams(filters, contextFilters, state.filter, state.sorting, state.current, count, queryDetail);
        if (source && _.isFunction(source)) {
            // lock();
            source({
                lock,
                unlock,

                page: (parseInt(state.current) || 1),
                count: count,
                sorting: state.sorting,
                filter: state.filter,
                // {stat, totalPages, size, totalElements, content}
                apply: (data) => {
                    // setResponse(data);
                    if (data?.stat) {
                        setLastFuncStat(data?.stat);
                    }
                    if (!funcStat) {
                        setFuncStat(data?.stat);
                    }
                    setCount(data?.size);
                    setTotal(data?.totalPages /*totalElements*/);
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
                setCount(data?.size);
                setTotal(data?.totalPages /*totalElements*/);
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
                setCount(data?.size);
                setTotal(data?.totalPages /*totalElements*/);
                setCollection((data && data?.content) ? data?.content : []);
                unlock();
            }, (err) => errorCatch(err, unlock));
        }
    }, [source, state.current, count, state.filter, state.sorting, funcStat, filters, contextFilters]);

    useEffect(() => {
        request();
    }, [source, name, state.filter, filters, state.sorting, state.current, _setCollection, contextFilters]);

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
            form: ModelMobile,
            name: name,
            links: linksModelActions,
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
    ], [auth, collection, collectionActions, name, mobject]);

    const RenderOnModelActions = React.useCallback((item, index, trigger, titles) => {
        // let defaultAction = defaultModelAction; 
        let defaultAction = defaultModelAction(item, index);

        if (!modelActions) return <React.Fragment>{trigger && trigger()}</React.Fragment>;
        let values = clean(unwrap(modelActions(item, index, { 
            mobject, 
            name, 
            field, 
            fieldName, 
            contextObject, 
            // collection, 
            actions: defaultAction,

            collection,
            setCollection,
            setCollectionItem,
            removeCollectionItem,
            onSelection,
            isSelected,
            lock,
            unlock,
            loading,
            update: request
         })));
        if (!values || !values.length) return <React.Fragment>{trigger && trigger()}</React.Fragment>;
        return <DropdownMobile
            auth={auth}
            titles={titles || { header: "Выберите действие" }}
            items={values?.map((e, idx) => ({
                key: e.key || idx,
                auth: auth,
                locator: props?.locator || name || fieldName,
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
            }))}
            trigger={(click) => (
                <div
                    data-locator={getLocator(props?.locator || name + "-trigger" || "trigger", props?.object)}
                    onClick={click} style={{ fontSize: "13px" }}>
                    {trigger && trigger()}
                </div>
            )} />
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
            form: ModelMobile,
            name: name,
            links: linksModelActions,
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
            // collection, 
            actions: defaultAction,

            collection,
            setCollection,
            setCollectionItem,
            removeCollectionItem,
            onSelection,
            isSelected,
            lock,
            unlock,
            loading,
            update: request
         })));
        if (!values || !values.length) return <React.Fragment></React.Fragment>;
        return <div>
            {values?.map((e, idx) => {
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
                        update: request
                    }, idx))
                }
                return (<Action
                    key={idx}
                    auth={auth}
                    mode={"button"}
                    locator={props?.locator || name || fieldName}
                    collection={collection}
                    setCollection={setCollection}
                    contextFilters={contextFilters}
                    {...e}
                />)
            })}
        </div>;
    }, [auth, collection, collectionActions, name, mobject, defaultCollectionAction]);
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
        let sr = selectedRows?.filter(e => e?.ID !== item?.ID);
        let srk = selectedRowKeys?.filter(e => e !== item?.ID);
        let vsr = value?.filter(e => e?.ID !== item?.ID);
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
    };
    const isSelected = (item) => {
        let v = selectedRows.find(e => e.ID === item.ID);
        return v !== undefined
    };
    const _render = React.useCallback((item, index) => {
        if (render) {
            return render(item, index, {
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
                update: request,
                funcStat,
                lastFuncStat,
                response
            });
        }
        return "" + item
    }, [render, loading, setCollection, setCollectionItem, removeCollectionItem, request]);
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
        // console.log(values);
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
                name: "Очистить",
                callback: () => {
                    // clearFilter
                    setState({ ...object, filter: {}, current: 1 });
                    close();
                },
            },
            {
                name: "Применить",
                callback: OkFunction,
            },
        ], []);
    const trigger = React.useCallback((click) => (
        <div onClick={click} style={{ cursor: "pointer", padding: "5px" }}>
            {!_.isEmpty(state.filter) && <Badge content={Badge.dot}>
                <Icofont icon="filter" />
            </Badge>}
            {_.isEmpty(state.filter) && <Icofont icon="filter" />}
        </div>
    ), [state.filter])
    const PaginatorChange = React.useCallback((v) => {
        setState(o => ({ ...o, current: v }));
        // window.scrollTo(0, 0);
        document.querySelector(".page").scrollTo(0, 0);
    }, [state]);
    const PaginatorRight = React.useCallback(() => {
        setState(o => {
            console.log(o);
            
            return ({ ...o, current: (parseInt(state.current) || 1) + 1 })
        });
        // window.scrollTo(0, 0);
        document.querySelector(".page").scrollTo(0, 0)
    }, [state]);
    const PaginatorLeft = React.useCallback(() => {
        setState(o => ({ ...o, current: (parseInt(state.current) || 1) - 1 }));
        // window.scrollTo(0, 0);
        document.querySelector(".page").scrollTo(0, 0)
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
                update: request
            }
        }
    }, [collection,
        loading,
        setCollection,
        setCollectionItem,
        removeCollectionItem,
        request])


    const customProps = {
        collection,
        setCollection,
        setCollectionItem,
        removeCollectionItem,
        collectionActions: () => (collectionActions) ? clean(unwrap(collectionActions({ mobject, name, field, fieldName, contextObject, collection, actions: defaultCollectionAction }))) : undefined,
        modelActions: (item, index) => (modelActions) ? clean(unwrap(modelActions(item, index, { mobject, name, field, fieldName, contextObject, collection, actions: defaultModelAction }))) : undefined,
        onSelection,
        isSelected,
        lock,
        unlock,
        loading,
        update: request,

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
    const getItemLocator = useCallback((item, index) => {
        if (onItemLocator) {
            return onItemLocator(item, index)
        } else {
            return getLocator(props?.locator || "filtered-item-" + name || "filtered-item-" + fieldName || "filtered-item", item)
        }
    }, [onItemLocator, props?.locator, name, fieldName])
    return (
        <React.Fragment>
            {/* <NearestCollectionContext.Provider value={collectionRef}> */}
            {!noheader && <BlockHeaderMobile
                title={titleView()}
                extra={titleExtra()}
            />}
            {(!filters?.length) && <div>
                <MaskWithLoading visible={loading} />
                {customRender && customRender(collection, customProps)}
                {(!customRender && PartialReplacementFunc) && <div className='partial-replacement'>
                    <PartialReplacementFunc
                        {...props}
                        {...customProps}
                    />
                </div>}
                {(!customRender && !PartialReplacementFunc) && <div>
                    {(collection && collection.length > 0) && <div>
                        <List className="my-list">
                            {collection?.map((item, index) => (
                                <Item data-locator={getItemLocator(item, index)} key={index} multipleLine align="top" wrap style={{ paddingLeft: "0px" }}>
                                    {RenderOnModelActions(item, index, () => _render(item, index), (modelActionsTitle) ? modelActionsTitle(item) : undefined)}
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
                        <EmptyMobile />
                        <div>Нет данных</div>
                    </div>}
                </div>}
            </div>}

            {(!!filters?.length) &&
                <div
                    data-locator={getLocator(props?.locator || ("collection-" + name) || ("collection-" + fieldName) || "collection", props?.object)} className="filtered" style={{ position: "relative", height: "100%", paddingTop: "5px" }}>
                    <div className={"filtered-header"} style={{
                        height: "43px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        // border: "1px solid #f0f0f0",
                        padding: "7px",
                        // borderRadius: "3px",
                    }}>
                        <div style={{ flex: "auto", paddingRight: "15px" }}>
                            {RenderOnCollectionActions()}
                        </div>
                        <div style={{ display: "flex", justifyContent: "flex-end" }}>
                            <Action
                                auth={auth}
                                action={act}
                                object={state}
                                locator={props?.locator || ("collection-filter-" + name) || ("collection-filter-" + fieldName) || "collection-filter"}
                                okText={"Применить"}
                                dismissText={"Очистить"}
                                footer={footer}
                                mode={"func"}
                                form={FilteringUIMobile}
                                filters={filters}
                                funcStat={funcStat}
                                trigger={trigger}
                            />
                        </div>
                    </div>
                    <MaskWithLoading visible={loading} />
                    {customRender && customRender(collection, {
                        collection,
                        setCollection,
                        setCollectionItem,
                        removeCollectionItem,
                        collectionActions: () => (collectionActions) ? clean(unwrap(collectionActions({ mobject, name, field, fieldName, contextObject, collection, actions: defaultCollectionAction }))) : undefined,
                        modelActions: (item, index) => (modelActions) ? clean(unwrap(modelActions(item, index, { mobject, name, field, fieldName, contextObject, collection, actions: defaultCollectionAction }))) : undefined,
                        onSelection,
                        isSelected,
                        lock,
                        unlock,
                        loading,
                        update: request,

                        linksModelActions,
                        mobject,
                        name,
                        field,
                        fieldName,
                        defaultCollectionAction,
                        defaultModelAction,
                        funcStat,
                        lastFuncStat,
                        response
                    })}
                    {!customRender && <List className="my-list filtered-list">
                        {(collection && collection.length > 0) && collection?.map((item, index) => (
                            <Item data-locator={getItemLocator(item, index)} key={index} multipleLine align="top" wrap style={{ paddingLeft: "0px" }}>
                                {RenderOnModelActions(item, index, () => _render(item, index), (modelActionsTitle) ? modelActionsTitle(item) : undefined)}
                            </Item>
                        ))}
                        {(!collection || collection.length == 0) && <div style={{
                            textAlign: "center",
                            fontSize: "18px",
                            color: "rgba(0,0,0,0.4)",
                            padding: "20px 0px"
                        }}>
                            <EmptyMobile />
                            <div>Нет данных</div>
                        </div>}
                    </List>}
                    <div style={{ padding: "15px 0px" }}>
                        {(total > 1) &&
                            <div
                                data-locator={getLocator(props?.locator || "filtered-pagination-" + name || "filtered-pagination-" + fieldName || "filtered-pagination", props?.object)}
                                style={{ display: "flex", justifyContent: "center" }}>
                                <div>
                                    <Button size='small' onClick={PaginatorLeft} disabled={(state.current <= 1)}>
                                        <Space>
                                            <Icofont icon="rounded-left" />
                                        </Space>
                                    </Button>
                                </div>
                                <div style={{ minWidth: "75px", fontSize: "14px", display: "flex", flexDirection: "column", alignItems: "center" }}>
                                    <div>{state.current}/{total}</div>
                                    <PageIndicator
                                        total={3}
                                        current={(state.current <= 1) ? 0 : (state.current >= total) ? 2 : 1}
                                    />
                                </div>
                                <div>
                                    <Button size='small' onClick={PaginatorRight} disabled={(state.current >= total)}>
                                        <Space>
                                            <Icofont icon="rounded-right" />
                                        </Space>
                                    </Button>
                                </div>
                            </div>
                        }
                    </div>
                </div>
            }
            {/* </NearestCollectionContext.Provider> */}
        </React.Fragment>
    );
}

export function CollectionServerMobile(props) {
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
        <DefaultCollectionServer
            {...props}
        />
    )
};