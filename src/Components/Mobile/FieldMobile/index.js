import React, { useState, useEffect } from 'react';
import 'moment/locale/ru';
import { errorCatch, getDisplay, getObjectValue, GETWITH, QueryDetail, QueryOrder, READWITH } from '../../../Tool';
import moment from 'moment';
import { Checkbox, Input, List, TextArea, Slider, Picker, DatePicker, Button } from 'antd-mobile';
import { createUseStyles } from 'react-jss';
import { CalendarItem } from '../CalendarItem';
import { useMetaContext } from '../../Context';
import { ActionPickerItem } from '../../Action';
import Icofont from 'react-icofont';
var _ = require('lodash');

const { RangePicker } = DatePicker;

const isIPhone = new RegExp('\\biPhone\\b|\\biPod\\b', 'i').test(window.navigator.userAgent);
let moneyKeyboardWrapProps;
if (isIPhone) {
    moneyKeyboardWrapProps = {
        onTouchStart: e => e.preventDefault(),
    };
}

function ActionItem({ auth, item, value, onChange, changed }) {
    return (<React.Fragment>
        <ActionPickerItem
            auth={auth}
            mode="input"
            item={item}
            value={value}
            onChange={onChange}
        />
        {/* <Action
            auth={auth}
            brief={(!value) ? undefined : (item.display) ? item.display(changed[item.duplex] || value) : undefined}
            form={item.form || ModelMobile}
            okText={item.okText || "Выбрать"}
            dismissText={item.dismissText || "Отмена"}

            // virtualized={true}
            // search={search}
            meta={item.meta}
            steps={item.steps}
            triggerOptions={{
                className: classes.Act
            }}
            placeholder={item.placeholder || "выберите " + item.label.toLowerCase()}
            closable={false}
            object={value}
            titles={(item.titles) ? item.titles : {
                header: item.label,
                subheader: "",
            }}
            action={(values, unlock, close) => {
                if (onChange) {
                    onChange((item.modify) ? item.modify(values) : values, item, (item.modifyDuplex) ? item.modifyDuplex(values) : undefined);
                }
                close();
            }}
            swipe={[
                {
                    key: 'danger',
                    text: (<Icofont icon="close" />),
                    onClick: () => {
                        if (onChange) {
                            onChange(undefined, item, undefined);
                        }
                    },
                    color: 'danger',
                },
            ]}
        /> */}
    </React.Fragment>);
}
function RangeDate({ item, value, onChange }) {
    const [visible1, setVisible1] = useState(false)
    const [visible2, setVisible2] = useState(false)
    const [val, setVal] = useState([]);
    useEffect(() => {
        if (value && value.length === 2 && value[0] && value[1]) {
            setVal([
                moment(value[0]).toDate(),
                moment(value[1]).toDate()
            ]);
        } else {
            setVal([])
        }
    }, [value]);
    return (
        <div style={{ padding: "5px 0px" }}>
            <div className='bg bg-grey'
                style={{
                    textAlign: "left",
                    paddingLeft: "5px",
                    marginBottom: "5px",
                    display: "flex",
                    justifyContent: "space-between"
                }}>
                <div>{item.label}</div>
                <Button fill='none' size='mini' onClick={(v) => {
                    onChange();
                }}>
                    <Icofont icon="close" />
                </Button>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "5px" }}>
                <div onClick={() => {
                    setVisible1(true)
                }} style={{
                    flex: "1",
                    border: "1px solid #e5e5e5",
                    borderRadius: "4px",
                    padding: "2px 6px"
                }}>
                    <DatePicker
                        precision='day'
                        max={val[1]}
                        disabled={(item.view && item.view.disabled) ? item.view.disabled : false}
                        title={item.label}
                        confirmText={item.okText || "Выбрать"}
                        cancelText={item.dismissText || "Отмена"}
                        visible={visible1}
                        onClose={() => {
                            setVisible1(false)
                        }}
                        onConfirm={(v) => onChange([moment(v), (val[1]) ? moment(val[1]) : moment(v)])}
                        value={val[0] || null}
                    >
                        {value =>
                            value ? moment(value).format('YYYY-MM-DD') : <span style={{ color: "rgb(177 177 177)" }}>{item.placeholder || `выберите  ${item.label.toLowerCase()}`}</span>
                        }
                    </DatePicker>
                </div>
                <div onClick={() => {
                    setVisible2(true)
                }} style={{
                    flex: "1",
                    border: "1px solid #e5e5e5",
                    borderRadius: "4px",
                    padding: "2px 6px"
                }}>
                    <DatePicker
                        precision='day'
                        min={val[0]}
                        disabled={(item.view && item.view.disabled) ? item.view.disabled : false}
                        title={item.label}
                        confirmText={item.okText || "Выбрать"}
                        cancelText={item.dismissText || "Отмена"}
                        visible={visible2}
                        onClose={() => {
                            setVisible2(false)
                        }}
                        onConfirm={(v) => onChange([(val[0]) ? moment(val[0]) : moment(v), moment(v)])}
                        value={val[1] || null}
                    >
                        {value =>
                            value ? moment(value).format('YYYY-MM-DD') : <span style={{ color: "rgb(177 177 177)" }}>{item.placeholder || `выберите  ${item.label.toLowerCase()}`}</span>
                        }
                    </DatePicker>
                </div>
            </div>
        </div>
    )
}
function RangeFloat({ item, value, onChange }) {
    const [val, setVal] = useState();
    useEffect(() => {
        setVal(value);
    }, [value]);
    const xstep = item.step || 1;
    const xmin = item.min || item.func.min || 0;
    const xmax = item.max + xstep || item.func.max + xstep || 100000;
    const def = [(xmin - (xmin % xstep)), (xmax + (xstep - xmax % xstep))];
    const onChangeLeft = (v) => {
        if (val && val.length > 1 && v < val[1] && v < (xmax + (xstep - xmax % xstep))) {
            setVal([v, val[1]]);
        }
    };
    const onChangeRight = (v) => {
        if (val && val.length > 1 && v > val[0] && v > (xmin - (xmin % xstep))) {
            setVal([val[0], v]);
        }
    };
    return (
        <div style={{ padding: "5px 0px" }}>
            <div className='bg bg-grey' style={{
                textAlign: "left",
                paddingLeft: "5px",
                marginBottom: "5px",
                display: "flex",
                justifyContent: "space-between"
            }}>
                <div>{item.label}</div>
                <Button fill='none' size='mini' onClick={(v) => {
                    onChange();
                }}>
                    <Icofont icon="close" />
                </Button>
            </div><div style={{ display: "flex", justifyContent: "space-between", gap: "5px" }}>
                <div style={{
                    flex: "1",
                    border: "1px solid #e5e5e5",
                    borderRadius: "4px",
                    padding: "2px 6px"
                }}>
                    <Input
                        type={"number"}
                        onChange={onChangeLeft}
                        value={(val && val.length > 1) ? val[0] : def[0]}
                    />
                </div>
                <div style={{
                    flex: "1",
                    border: "1px solid #e5e5e5",
                    borderRadius: "4px",
                    padding: "2px 6px"
                }}>
                    <Input
                        type={"number"}
                        onChange={onChangeRight}
                        value={(val && val.length > 1) ? val[1] : def[1]}
                    />
                </div>
            </div>
            <div>
                <Slider
                    range
                    defaultValue={def}
                    min={(xmin - (xmin % xstep))}
                    max={(xmax + (xstep - xmax % xstep))}
                    step={xstep}
                    value={val || def}
                    onChange={setVal}
                    onAfterChange={onChange}
                />
            </div>
        </div>
    )
}
function RangeInteger({ item, value, onChange }) {
    const [val, setVal] = useState();
    useEffect(() => {
        setVal(value);
    }, [value]);
    const xstep = item.step || 1;
    const xmin = item.min || item.func.min || 0;
    const xmax = item.max + xstep || item.func.max + xstep || 100000;
    const def = [(xmin - (xmin % xstep)), (xmax + (xstep - xmax % xstep))];
    const onChangeLeft = (v) => {
        if (val && val.length > 1 && v < val[1] && v < (xmax + (xstep - xmax % xstep))) {
            setVal([v, val[1]]);
        }
    };
    const onChangeRight = (v) => {
        if (val && val.length > 1 && v > val[0] && v > (xmin - (xmin % xstep))) {
            setVal([val[0], v]);
        }
    };
    return (
        <div style={{ padding: "5px 0px" }}>
            <div className='bg bg-grey' style={{
                textAlign: "left",
                paddingLeft: "5px",
                marginBottom: "5px",
                display: "flex",
                justifyContent: "space-between"
            }}>
                <div>{item.label}</div>
                <Button fill='none' size='mini' onClick={(v) => {
                    onChange();
                }}>
                    <Icofont icon="close" />
                </Button>
            </div><div style={{ display: "flex", justifyContent: "space-between" }}>
                <div style={{
                    flex: "1",
                    border: "1px solid #e5e5e5",
                    borderRadius: "4px",
                    padding: "2px 6px"
                }}>
                    <Input
                        type={"number"}
                        onChange={onChangeLeft}
                        value={(val && val.length > 1) ? val[0] : def[0]}
                    />
                </div>
                <div style={{
                    flex: "1",
                    border: "1px solid #e5e5e5",
                    borderRadius: "4px",
                    padding: "2px 6px"
                }}>
                    <Input
                        type={"number"}
                        onChange={onChangeRight}
                        value={(val && val.length > 1) ? val[1] : def[1]}
                    />
                </div>
            </div>
            <Slider
                // style={{ marginLeft: 15, marginRight: 15, height: "22px" }}
                range
                defaultValue={def}
                min={(xmin - (xmin % xstep))}
                max={(xmax + (xstep - xmax % xstep))}
                step={xstep}
                // included={true}
                value={val || def}
                onChange={setVal}
                onAfterChange={onChange}
            />
        </div>
    )
}
function Obj({ auth, item, value, onChange, changed }) {
    const [data, setData] = useState([]);
    const meta = useMetaContext();
    const dataOrContent = (data) => {
        return (data && data.content) ? data.content : (_.has(data, 'content')) ? [] : data
    }
    const defaultQueryParams = (filter) => {
        if (!filter) {
            return [
                QueryDetail("model"),
                QueryOrder("ID", "ASC")
            ]
        } else if (_.isArray(filter)){
            return filter
        }
        return []
    }
    useEffect(() => {
        if (item.source || item.url || (item && _.get(item, "relation.reference.url")) || (item && _.get(item, "relation.reference.source"))) {
            let filter = item.queryFilter || item.filter || _.get(item, "relation.reference.queryFilter") || _.get(item, "relation.reference.filter");
            let url = item.source || item.relation.reference.url || item.relation.reference.source;
            GETWITH(auth, url, [
                ...defaultQueryParams(filter)
            ], ({ data }) => {
                setData(dataOrContent(data));
            }, (err, type) => errorCatch(err, type, () => { }));
        } else if (item && _.get(item,"relation.reference.data")) {
            setData(item.relation.reference.data);
        } else if (item && _.get(item,"relation.reference.object")) {
            let object = getObjectValue(item, "relation.reference.object");
            if (object) {
                let filter = item.queryFilter || item.filter || _.get(item,"relation.reference.queryFilter") || _.get(item,"relation.reference.filter");
                READWITH(auth, object, [
                    ...defaultQueryParams(filter)
                ], ({ data }) => {
                    setData(dataOrContent(data));
                }, (err, type) => errorCatch(err, type, () => { }));
            }
        }
    }, [auth, item]);
    const property = (item, value) => {
        if (item && _.get(item, "relation.reference.property") && value) {
            return value[item.relation.reference.property];
        }
        if (value) {
            return value.ID;
        }
        return undefined;
    };
    const itemByProperty = (item, value) => {
        if (_.get(item, "relation.reference.property")) {
            return data.find(e => e[item.relation.reference.property] === value);
        }
        return data.find(e => e.ID === value);
    };
    const label = (item, value) => {
        if (item && value) {
            if (item.display && _.isFunction(item.display)) {
                return item.display(value)
            } else if (item.relation && item.relation.display && _.isFunction(item.relation.display)) {
                return item.relation.display(value)
            } else {
                let fieldMeta = meta[getObjectValue(item, "relation.reference.object")];
                return getDisplay(value, item?.relation?.display || fieldMeta?.display, fieldMeta, meta)
            }
        }
        return "";
    };
    const by = (item) => {
        if (changed && item.dependence && item.dependence.field) {
            return (changed[item.dependence.by] && item.dependence.eq) ? changed[item.dependence.by][item.dependence.eq] : changed[item.dependence.eq];
        }
    };
    const oui = [];
    if (data) {
        data.forEach((value) => {
            if (item.dependence) {
                if (item.dependence.field && by(item)) {
                    if (value[item.dependence.field] === by(item)) {
                        oui.push({
                            label: label(item, value),
                            value: property(item, value),
                        });
                    }
                }
            } else {
                oui.push({
                    label: label(item, value),
                    value: property(item, value),
                });
            }
        });
    }
    const [visible, setVisible] = React.useState(false)
    const current = React.useMemo(() => {
        return oui?.find((e) => e.value == value)?.label
    }, [value, oui])
    return (
        <div style={{ padding: "5px 0px" }}>
            <div className='bg bg-grey' style={{
                textAlign: "left",
                paddingLeft: "5px",
                marginBottom: "5px",
                display: "flex",
                justifyContent: "space-between"
            }}>
                <div>{item.label}</div>
                <Button fill='none' size='mini' onClick={(v) => {
                    onChange(undefined, item, undefined);
                }}>
                    <Icofont icon="close" />
                </Button>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "5px" }}>
                <div onClick={() => {
                    setVisible(true)
                }} style={{
                    flex: "1",
                    border: "1px solid #e5e5e5",
                    borderRadius: "4px",
                    padding: "2px 6px"
                }}>
                    <Picker
                        visible={visible}
                        onClose={() => {
                            setVisible(false)
                        }}
                        disabled={(item && item.view && item.view.disabled) ? item.view.disabled : false}
                        value={[value]}
                        columns={[oui]}
                        onConfirm={e => {
                            if (onChange) {
                                onChange(e[0], item, itemByProperty(item, e[0]));
                            }
                        }}
                        confirmText={item.okText || 'Выбрать'}
                        cancelText={item.dismissText || 'Отмена'}>
                    </Picker>
                    {current || <span style={{ color: "rgb(177 177 177)" }}>{item.placeholder || `выберите  ${item.label.toLowerCase()}`}</span>}
                </div>
            </div>
        </div>
    )
}
// function Obj({ auth, item, value, onChange }) {
//     const [data, setData] = useState([]);
//     const [disabled, setDisabled] = useState(true);
//     const [available, setAvailable] = useState(false);
//     const meta = useMetaContext();
//     useEffect(() => {
//         if (item.source) {
//             GETWITH(auth, item.source, [
//                 (!item.queryFilter) ? QueryDetail("model") : undefined,
//                 (!item.queryFilter) ? QueryOrder("ID", "ASC") : undefined,
//                 ...(item.queryFilter && _.isArray(item.queryFilter)) ? item.queryFilter : []
//             ], ({ data }) => {
//                 setData((data && data.content) ? data.content : (_.has(data, 'content')) ? [] : data);
//                 setDisabled(false);
//             }, (err, type) => errorCatch(err, type, () => { }));
//         } else {
//             let src = getObjectValue(item, "relation.reference.object");
//             if (src) {
//                 READWITH(auth, src, [
//                     (!item.queryFilter) ? QueryDetail("model") : undefined,
//                     (!item.queryFilter) ? QueryOrder("ID", "ASC") : undefined,
//                     ...(item.queryFilter && _.isArray(item.queryFilter)) ? item.queryFilter : []
//                 ], ({ data }) => {
//                     setData((data && data.content) ? data.content : (_.has(data, 'content')) ? [] : data);
//                     setDisabled(false);
//                 }, (err, type) => errorCatch(err, type, () => { }));
//             }
//         }
//     }, [auth, item]);

//     const oui = [];
//     if (data) {
//         if (item.display) {
//             for (let idx = 0; idx < data.length; idx++) {
//                 const i = data[idx];
//                 oui.push({
//                     label: item.display(i),
//                     value: i.ID,
//                 });
//             }
//         } else {
//             let fieldMeta = meta[getObjectValue(item, "relation.reference.object")];
//             const display = (display) => {
//                 if (display.fields) {
//                     return display
//                 }
//             }
//             for (let idx = 0; idx < data.length; idx++) {
//                 const i = data[idx];
//                 oui.push({
//                     label: getDisplay(i, display(item.relation.display) || display(fieldMeta.display), fieldMeta, meta),
//                     value: i.ID,
//                 });
//             }
//         }
//     }
//     const [visible, setVisible] = useState(false);
//     const current = React.useMemo(() => {
//         return oui?.find(e => e.value === value)?.label;
//     }, [value])
//     return (
//         <div style={{ padding: "5px 0px" }}>
//             <div className='bg bg-grey' style={{
//                     textAlign: "left",
//                     paddingLeft: "5px",
//                     marginBottom: "5px",
//                     display: "flex",
//                     justifyContent: "space-between"
//                 }}>
//                 <div>{item.label}</div>
//                 <Button fill='none' size='mini' onClick={(v) => {
//                     onChange();
//                     }}>
//                     <Icofont icon="close" />
//                 </Button>
//             </div>
//             <div style={{ display: "flex", justifyContent: "space-between", gap: "5px" }}>
//                 <div onClick={() => {
//                     setVisible(true)
//                 }} style={{
//                     flex: "1",
//                     border: "1px solid #e5e5e5",
//                     borderRadius: "4px",
//                     padding: "2px 6px"
//                 }}>
//                     <Picker
//                         visible={visible}
//                         onClose={() => {
//                             setVisible(false)
//                         }}
//                         disabled={(item && item.view && item.view.disabled) ? item.view.disabled : false}
//                         value={[value]}
//                         columns={[oui]}
//                         onConfirm={e => {
//                             if (onChange) {
//                                 onChange(e[0]);
//                             }
//                         }}
//                         confirmText={item.okText || 'Выбрать'}
//                         cancelText={item.dismissText || 'Отмена'}>
//                     </Picker>
//                     {current || <span style={{ color: "rgb(177 177 177)" }}>{item.placeholder || `выберите  ${item.label.toLowerCase()}`}</span>}
//                 </div>
//             </div>
//         </div>
//     )
// }
function Date({ item, value, onChange }) {
    const [visible, setVisible] = useState(false)
    const [val, setVal] = useState();
    useEffect(() => {
        if (value) {
            setVal(moment(value).toDate());
        } else {
            setVal()
        }
    }, [value]);
    return (
        <div style={{ padding: "5px 0px" }}>
            <div className='bg bg-grey' style={{
                textAlign: "left",
                paddingLeft: "5px",
                marginBottom: "5px",
                display: "flex",
                justifyContent: "space-between"
            }}>
                <div>{item.label}</div>
                <Button fill='none' size='mini' onClick={(v) => {
                    onChange();
                }}>
                    <Icofont icon="close" />
                </Button>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "5px" }}>
                <div onClick={() => {
                    setVisible(true)
                }} style={{
                    flex: "1",
                    border: "1px solid #e5e5e5",
                    borderRadius: "4px",
                    padding: "2px 6px"
                }}>
                    <DatePicker
                        precision='day'

                        disabled={(item.view && item.view.disabled) ? item.view.disabled : false}
                        title={item.label}
                        confirmText={item.okText || "Выбрать"}
                        cancelText={item.dismissText || "Отмена"}
                        visible={visible}
                        onClose={() => {
                            setVisible(false)
                        }}
                        onConfirm={value => onChange(moment(value))}
                        value={val || null}
                    >
                        {value =>
                            value ? moment(value).format('YYYY-MM-DD') : <span style={{ color: "rgb(177 177 177)" }}>{item.placeholder || `выберите  ${item.label.toLowerCase()}`}</span>
                        }
                    </DatePicker>
                </div>
            </div>
        </div>
    )
}
function DateTime({ item, value, onChange }) {
    const [visible, setVisible] = useState(false)
    const [val, setVal] = useState();
    useEffect(() => {
        if (value) {
            setVal(moment(value).toDate());
        } else {
            setVal()
        }
    }, [value]);
    return (
        <div style={{ padding: "5px 0px" }}>
            <div className='bg bg-grey' style={{
                textAlign: "left",
                paddingLeft: "5px",
                marginBottom: "5px",
                display: "flex",
                justifyContent: "space-between"
            }}>
                <div>{item.label}</div>
                <Button fill='none' size='mini' onClick={(v) => {
                    onChange();
                }}>
                    <Icofont icon="close" />
                </Button>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "5px" }}>
                <div onClick={() => {
                    setVisible(true)
                }} style={{
                    flex: "1",
                    border: "1px solid #e5e5e5",
                    borderRadius: "4px",
                    padding: "2px 6px"
                }}>
                    <DatePicker
                        precision='minute'

                        disabled={(item.view && item.view.disabled) ? item.view.disabled : false}
                        title={item.label}
                        confirmText={item.okText || "Выбрать"}
                        cancelText={item.dismissText || "Отмена"}
                        visible={visible}
                        onClose={() => {
                            setVisible(false)
                        }}
                        onConfirm={value => onChange(moment(value))}
                        value={val || null}
                    >
                        {value =>
                            value ? moment(value).format('YYYY-MM-DD HH:mm:ss') : <span style={{ color: "rgb(177 177 177)" }}>{item.placeholder || `выберите  ${item.label.toLowerCase()}`}</span>
                        }
                    </DatePicker>
                </div>
            </div>
        </div>
    )
}
function Time({ item, value, onChange }) {
    const [visible, setVisible] = useState(false)
    const [val, setVal] = useState();
    useEffect(() => {
        if (value) {
            setVal(moment(value).toDate());
        } else {
            setVal()
        }
    }, [value]);
    return (
        <div style={{ padding: "5px 0px" }}>
            <div className='bg bg-grey' style={{
                textAlign: "left",
                paddingLeft: "5px",
                marginBottom: "5px",
                display: "flex",
                justifyContent: "space-between"
            }}>
                <div>{item.label}</div>
                <Button fill='none' size='mini' onClick={(v) => {
                    onChange();
                }}>
                    <Icofont icon="close" />
                </Button>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "5px" }}>
                <div onClick={() => {
                    setVisible(true)
                }} style={{
                    flex: "1",
                    border: "1px solid #e5e5e5",
                    borderRadius: "4px",
                    padding: "2px 6px"
                }}>
                    <DatePicker
                        precision='second'

                        disabled={(item.view && item.view.disabled) ? item.view.disabled : false}
                        title={item.label}
                        confirmText={item.okText || "Выбрать"}
                        cancelText={item.dismissText || "Отмена"}
                        visible={visible}
                        onClose={() => {
                            setVisible(false)
                        }}
                        onConfirm={value => onChange(moment(value))}
                        value={val || null}
                    >
                        {value =>
                            value ? moment(value).format('HH:mm:ss') : <span style={{ color: "rgb(177 177 177)" }}>{item.placeholder || `выберите  ${item.label.toLowerCase()}`}</span>
                        }
                    </DatePicker>
                </div>
            </div>
        </div>
    )
}
function Boolean({ item, value, onChange }) {
    return (
        <Checkbox
            disabled={(item.view && item.view.disabled) ? item.view.disabled : false}
            onChange={onChange}
            checked={value}
        >
            {item.label}
        </Checkbox>
    )
}
function Float({ item, value, onChange }) {
    return (
        <div style={{ padding: "5px 0px" }}>
            <div className='bg bg-grey' style={{
                textAlign: "left",
                paddingLeft: "5px",
                marginBottom: "5px",
                display: "flex",
                justifyContent: "space-between"
            }}>
                <div>{item.label}</div>
                <Button fill='none' size='mini' onClick={(v) => {
                    onChange();
                }}>
                    <Icofont icon="close" />
                </Button>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "5px" }}>
                <div style={{
                    flex: "1",
                    border: "1px solid #e5e5e5",
                    borderRadius: "4px",
                    padding: "2px 6px"
                }}>
                    <Input
                        disabled={(item.view && item.view.disabled) ? item.view.disabled : false}
                        placeholder={item.placeholder || "введите " + item.label.toLowerCase()}
                        // clearable
                        onChange={v => {
                            if (!isNaN(v)) {
                                onChange(v);
                            }
                        }}
                        value={value || ""}
                    />
                </div>
            </div>
        </div>
    )
}
function Integer({ item, value, onChange }) {
    return (
        <div style={{ padding: "5px 0px" }}>
            <div className='bg bg-grey' style={{
                textAlign: "left",
                paddingLeft: "5px",
                marginBottom: "5px",
                display: "flex",
                justifyContent: "space-between"
            }}>
                <div>{item.label}</div>
                <Button fill='none' size='mini' onClick={(v) => {
                    onChange();
                }}>
                    <Icofont icon="close" />
                </Button>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "5px" }}>
                <div style={{
                    flex: "1",
                    border: "1px solid #e5e5e5",
                    borderRadius: "4px",
                    padding: "2px 6px"
                }}>
                    <Input
                        disabled={(item.view && item.view.disabled) ? item.view.disabled : false}
                        placeholder={item.placeholder || "введите " + item.label.toLowerCase()}
                        // clearable
                        onChange={v => {
                            if (!isNaN(v) && _.isInteger(+v)) {
                                onChange("" + (+v));
                            }
                        }}
                        value={value || ""}
                    />
                </div>
            </div>
        </div>
    )
}
function String({ item, value, onChange }) {
    return (
        <div style={{ padding: "5px 0px" }}>
            <div className='bg bg-grey' style={{
                textAlign: "left",
                paddingLeft: "5px",
                marginBottom: "5px",
                display: "flex",
                justifyContent: "space-between"
            }}>
                <div>{item.label}</div>
                <Button fill='none' size='mini' onClick={(v) => {
                    onChange();
                }}>
                    <Icofont icon="close" />
                </Button>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "5px" }}>
                <div style={{
                    flex: "1",
                    border: "1px solid #e5e5e5",
                    borderRadius: "4px",
                    padding: "2px 6px"
                }}>
                    <TextArea
                        disabled={(item.view && item.view.disabled) ? item.view.disabled : false}
                        autoSize={{ minRows: 2, maxRows: 5 }}
                        onChange={onChange}
                        value={value || ""}
                        placeholder={item.placeholder || "введите " + item.label.toLowerCase()}
                    />
                </div>
            </div>
        </div>
    )
}
function Unknown({ item }) {
    return (
        <div key={item.name}>
            {item.label} - {item.name}
        </div>
    )
}

// item: {
//     label: 'Сумма',
//     name: "obshchayaSumma",
//     filterType: "group", // range
//     type: "float",
//     source: "/api/query/name"
// }

export function FieldMobile({ auth, item, value, onChange, changed }) {
    switch (item.filterType) {
        case "group":
            switch (item.type) {
                case "func":
                    return (props.func)?props.func(auth, item, value, onChange):undefined;
                case "object":
                case "document":
                    return (<Obj auth={auth} item={item} value={value} onChange={onChange} changed={changed}></Obj>)
                default:
                    return (<Unknown auth={auth} item={item} value={value} onChange={onChange}></Unknown>)
            }
        case "range":
            switch (item.type) {
                case "func":
                    return (props.func)?props.func(auth, item, value, onChange):undefined;
                case "int":
                case "uint":
                case "integer":
                case "int64":
                case "int32":
                case "uint64":
                case "uint32":
                    return (<RangeInteger auth={auth} item={item} value={value} onChange={onChange}></RangeInteger>)
                case "double":
                case "float":
                case "float64":
                case "float32":
                    return (<RangeFloat auth={auth} item={item} value={value} onChange={onChange}></RangeFloat>)
                case "date":
                case "time":
                case "datetime":
                case "time.Time":
                    return (<RangeDate auth={auth} item={item} value={value} onChange={onChange}></RangeDate>)
                default:
                    return (<Unknown auth={auth} item={item} value={value} onChange={onChange}></Unknown>)
            }
        default:
            switch (item.type) {
                case "func":
                    return (props.func)?props.func(auth, item, value, onChange):undefined;
                case "string":
                    return (<String auth={auth} item={item} value={value} onChange={onChange}></String>)
                case "int":
                case "uint":
                case "integer":
                case "int64":
                case "int32":
                case "uint64":
                case "uint32":
                    return (<Integer auth={auth} item={item} value={value} onChange={onChange}></Integer>)
                case "double":
                case "float":
                case "float64":
                case "float32":
                    return (<Float auth={auth} item={item} value={value} onChange={onChange}></Float>)
                case "boolean":
                case "bool":
                    return (<Boolean auth={auth} item={item} value={value} onChange={onChange}></Boolean>)
                case "time":
                    return (<Time auth={auth} item={item} value={value} onChange={onChange}></Time>)
                case "date":
                    return (<Date auth={auth} item={item} value={value} onChange={onChange}></Date>)
                case "datetime":
                case "time.Time":
                    return (<DateTime auth={auth} item={item} value={value} onChange={onChange}></DateTime>)
                case "object":
                case "document":
                    return (<Obj auth={auth} item={item} value={value} onChange={onChange} changed={changed}></Obj>)
                case "action":
                    return (<ActionItem auth={auth} item={item} value={value} onChange={onChange}></ActionItem>)
                default:
                    return (<Unknown auth={auth} item={item} value={value} onChange={onChange}></Unknown>)
            }
    }
}