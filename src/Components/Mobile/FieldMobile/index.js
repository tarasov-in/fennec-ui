import React, { useState, useEffect } from 'react';
import 'moment/locale/ru';
import {
    DatePicker
} from 'antd';
import { errorCatch, getDisplay, getObjectValue, GETWITH, QueryDetail, QueryOrder, READWITH } from '../../../Tool';
import moment from 'moment';
import { Checkbox, Input, List, TextArea, Slider, Picker } from 'antd-mobile';
import { createUseStyles } from 'react-jss';
import { CalendarItem } from '../CalendarItem';
import { useMetaContext } from '../../Context';
import { ActionPickerItem } from '../../Action';
var _ = require('lodash');

const { RangePicker } = DatePicker;

const isIPhone = new RegExp('\\biPhone\\b|\\biPod\\b', 'i').test(window.navigator.userAgent);
let moneyKeyboardWrapProps;
if (isIPhone) {
    moneyKeyboardWrapProps = {
        onTouchStart: e => e.preventDefault(),
    };
}

const useStyles = createUseStyles({
    FormNav: {
        display: "flex",
        justifyContent: "flex-end",
        paddingBottom: "10px",
    },
    FormItem: {
        '&.ant-form-item': {
            marginBottom: "0px"
        }
    },
    Field: {},
    Unknown: {},
    Act: {
        '&.am-list-item .am-list-line .am-list-brief': {
            textAlign: "left",
            paddingTop: "0px",
            paddingBottom: "14px",
            fontWeight: "300",
            fontSize: "16px",
            marginTop: "0px"
        },
        '&.am-list-item .am-list-line .am-list-content': {
            fontSize: "14px",
            paddingBottom: "0px",
        },
        '&.am-list-item .am-list-line .am-list-arrow': {
            position: "absolute",
            right: "0",
            top: "3px",
        },
        '&.am-list-item': {
            paddingLeft: "0px"
        },
        '&.am-list-item .am-list-line': {
            padding: "0px",
            display: "block",
        },
        '&.am-list-item .am-list-line::after': {
            backgroundColor: "transparent!important"
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
    Time: {
        '&.am-list-item': {
            paddingLeft: "0px"
        },
        '& .am-list-line': {
            display: "block",
        },
        '&.am-list-item .am-list-line .am-list-content': {
            fontSize: "14px",
            paddingBottom: "0px",
            paddingTop: "0px",
        },
        '&.am-list-item .am-list-line .am-list-arrow': {
            position: "absolute",
            right: "0",
            top: "3px",
        },
        '&.am-list-item .am-list-line .am-list-brief': {
            textAlign: "left",
            paddingTop: "0px",
            fontSize: "16px",
            paddingBottom: "14px",
            fontWeight: "300",
            marginTop: "0px"
        },
        '&.am-list-item .am-list-line .am-list-extra': {
            textAlign: "left",
            paddingTop: "0px",
            fontSize: "16px",
            paddingBottom: "14px",
            fontWeight: "300"
        },
        '&.am-list-item .am-list-line::after': {
            backgroundColor: "transparent!important"
        },
        '&.am-list-item': {
            paddingLeft: "0px"
        },
        '&.am-list-item .am-list-line': {
            paddingRight: "0px"
        },
    },
    Boolean: {
        '&.am-list-item': {
            paddingLeft: "0px"
        },
        '&.am-list-item .am-list-line::after': {
            backgroundColor: "transparent!important"
        }
    },
    Float: {
        '&.am-list-item': {
            paddingLeft: "0px"
        },
    },
    Integer: {
        '&.am-list-item': {
            display: "initial",
        },
        '&.am-list-item .am-list-line': {
            paddingLeft: "0px",
            display: "block",
        },
        '&.am-list-item.am-input-item': {
            paddingLeft: "0px"
        },
        '&.am-list-item .am-input-clear': {
            position: "absolute",
            right: "0",
            top: "0",
            backgroundSize: "17px auto",
            width: "17px",
            height: "17px",
            marginTop: "0px"
        },
        '&.am-list-item .am-input-label': {
            width: "100%",
            fontSize: "14px",
            minHeight: "20px",
            lineHeight: "20px"
        },
        '&.am-list-item .am-input-control': {
            paddingTop: "0px",
            paddingBottom: "14px",
            fontSize: "14px"
        },
        '&.am-list-item .am-input-control input': {
            fontSize: "16px",
            color: "#888"
        },
        '& .am-input-control input': {
            textAlign: "start",
        },
    },
    String: {
        '&.am-list-item': {
            paddingLeft: "0px",
            display: "block",
        },
        '&.am-list-item .am-textarea-clear': {
            position: "absolute",
            right: "0",
            top: "0",
            backgroundSize: "17px auto",
            width: "17px",
            height: "17px",
            marginTop: "0px"
        },
        '&.am-list-item .am-textarea-label': {
            width: "100%",
            fontSize: "14px",
            minHeight: "20px",
            lineHeight: "20px",
            marginRight: "0px"
        },
        '&.am-list-item .am-textarea-control': {
            paddingTop: "0px",
            paddingBottom: "14px",
        },
        '&.am-list-item.am-textarea-item': {
            flexDirection: "column",
            paddingLeft: "0px",
            paddingRight: "0px",
        },
        '&.am-list-item .am-textarea-control': {
            width: "100%"
        },
        '&.am-list-item .am-textarea-control textarea': {
            fontSize: "16px",
            color: "#888"
        },
        '& .am-textarea-control textarea': {
            textAlign: "start",
        },
    },
    Frm: {

    },
    Search: {
        '& .am-search': {
            height: "32px",
            padding: "0 2px",
            backgroundColor: "#efeff4",
        },
        '& .am-search-cancel.am-search-cancel-show.am-search-cancel-anim': {
            marginRight: "6px!important",
        }
    },
    RangeFloatInput: {
        '&.am-list-item.am-input-item': {
            paddingLeft: "0",
        },
        '&.am-list-item.am-input-item .am-list-line .am-input-control input': {
            textAlign: "center",
        }
    }
})

function ActionItem({ auth, item, value, onChange, changed }) {
    const classes = useStyles()
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
    // console.log("RangeDate", { item, value });
    const classes = useStyles()
    const [val, setVal] = useState();
    useEffect(() => {
        setVal(value);
    }, [value]);
    return (
        <div style={{ margin: 0 }}>
            <p className="sub-title" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'" }}>{item.label}</p>
            <RangePicker
                disabledTime
                value={val}
                // placeholder={item.placeholder || "введите " + item.label.toLowerCase()}
                onCalendarChange={(value) => {
                    onChange(value)
                }}
                onChange={(value) => {
                    setVal(value)
                }}
            />
        </div>
    )
}

function RangeFloat({ item, value, onChange }) {
    // console.log("RangeFloat", { item, value });
    const classes = useStyles()
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
        <div style={{ margin: 0 }}>
            <p className="sub-title" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'" }}>{item.label}</p>
            <div style={{ paddingBottom: "10px", display: "flex", justifyContent: "space-between", gap: "5px" }}>
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
    // console.log("RangeInteger", { item, value });
    const classes = useStyles()
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
        <div style={{ margin: 0 }}>
            <p className="sub-title" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'" }}>{item.label}</p>
            <div style={{ paddingBottom: "10px", display: "flex", justifyContent: "space-between" }}>
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
function Obj({ auth, item, value, onChange }) {
    // console.log("Obj", { item, value });
    const classes = useStyles()
    const [data, setData] = useState([]);
    const [disabled, setDisabled] = useState(true);
    const [available, setAvailable] = useState(false);
    const meta = useMetaContext();
    useEffect(() => {
        // if(available){
        if (item.source) {
            // console.log("Obj - 1");
            GETWITH(auth, item.source, [
                (!item.queryFilter) ? QueryDetail("model") : undefined,
                (!item.queryFilter) ? QueryOrder("ID", "ASC") : undefined,
                ...(item.queryFilter && _.isArray(item.queryFilter)) ? item.queryFilter : []
            ], ({ data }) => {
                // console.log("Obj - 2");
                setData((data && data.content) ? data.content : (_.has(data, 'content')) ? [] : data);
                // console.log("Obj - 3");
                setDisabled(false);
                // console.log("Obj - 4");
            }, (err, type) => errorCatch(err, type, () => { }));
        } else {
            let src = getObjectValue(item, "relation.reference.object");
            if (src) {
                READWITH(auth, src, [
                    (!item.queryFilter) ? QueryDetail("model") : undefined,
                    (!item.queryFilter) ? QueryOrder("ID", "ASC") : undefined,
                    ...(item.queryFilter && _.isArray(item.queryFilter)) ? item.queryFilter : []
                ], ({ data }) => {
                    setData((data && data.content) ? data.content : (_.has(data, 'content')) ? [] : data);
                    setDisabled(false);
                }, (err, type) => errorCatch(err, type, () => { }));
            }
        }
        // }
    }, [auth, item]);

    const oui = [];
    if (data) {
        if (item.display) {
            for (let idx = 0; idx < data.length; idx++) {
                const i = data[idx];
                oui.push({
                    label: item.display(i),
                    value: i.ID,
                });
            }
        } else {
            let fieldMeta = meta[getObjectValue(item, "relation.reference.object")];
            const display = (display) => {
                if (display.fields) {
                    return display
                }
            }
            for (let idx = 0; idx < data.length; idx++) {
                const i = data[idx];
                oui.push({
                    label: getDisplay(i, display(item.relation.display) || display(fieldMeta.display), fieldMeta, meta),
                    value: i.ID,
                });
            }
        }
    }
    const [visible, setVisible] = useState(false);
    const current = React.useMemo(() => {
        return oui?.find(e => e.value === value)?.label;
    }, [value])
    return (
        <div>
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
                        onChange(e[0]);
                    }
                }}
                confirmText={item.okText || 'Выбрать'}
                cancelText={item.dismissText || 'Отмена'}>
            </Picker>
            <List.Item className={classes.Obj} onClick={() => setVisible(true)}
                description={current || item.placeholder || "выберите " + item.label.toLowerCase()}>
                {item.label}
            </List.Item>
        </div>
    )
}
/** !!! antd */
function Date({ item, value, onChange }) {
    // console.log("Date", { item, value });
    const classes = useStyles()
    return (
        <DatePicker
            disabled={(item.view && item.view.disabled) ? item.view.disabled : false}
            mode="date"
            title="Выберите дату"
            extra={item.placeholder || "выберите " + item.label.toLowerCase()}
            locale={{
                DatePickerLocale: {
                    year: "",
                    month: "",
                    day: "",
                    hour: "",
                    minute: "",
                    am: "",
                    pm: ""
                },
                okText: item.okText || "Выбрать",
                dismissText: item.dismissText || "Отмена"
            }}
            value={value}
            onChange={onChange}
        >
            {/* <List.Item className={classes.Time}>{item.label}</List.Item> */}
        </DatePicker>
    )
}
/** !!! antd */
function DateTime({ item, value, onChange }) {
    // console.log("DateTime", { item, value });
    const classes = useStyles()
    return (
        <DatePicker
            disabled={(item.view && item.view.disabled) ? item.view.disabled : false}
            mode="time"
            title="Выберите дату"
            extra={item.placeholder || "выберите " + item.label.toLowerCase()}
            locale={{
                DatePickerLocale: {
                    year: "",
                    month: "",
                    day: "",
                    hour: "",
                    minute: "",
                    am: "",
                    pm: ""
                },
                okText: item.okText || "Выбрать",
                dismissText: item.dismissText || "Отмена"
            }}
            value={value}
            onChange={onChange}
        >
            {/* <List.Item className={classes.Time}>{item.label}</List.Item> */}
        </DatePicker>
    )
}
/** !!! antd */
function Time({ item, value, onChange }) {
    // console.log("Time", { item, value });
    const classes = useStyles()
    return (
        <DatePicker
            disabled={(item.view && item.view.disabled) ? item.view.disabled : false}
            mode="time"
            title="Выберите дату"
            extra={item.placeholder || "выберите " + item.label.toLowerCase()}
            locale={{
                DatePickerLocale: {
                    year: "",
                    month: "",
                    day: "",
                    hour: "",
                    minute: "",
                    am: "",
                    pm: ""
                },
                okText: item.okText || "Выбрать",
                dismissText: item.dismissText || "Отмена"
            }}
            value={value}
            onChange={onChange}
        >
            {/* <List.Item className={classes.Time} >{item.label}</List.Item> */}
        </DatePicker>
    )
}
function Boolean({ item, value, onChange }) {
    // console.log("Boolean", { item, value });
    const classes = useStyles()
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
    // console.log("Float", { item, value });
    const classes = useStyles()
    return (
        <Input
            disabled={(item.view && item.view.disabled) ? item.view.disabled : false}
            type={"money"}
            placeholder={item.placeholder || "введите " + item.label.toLowerCase()}
            clearable
            onChange={onChange}
            value={value}
        />
    )
}
function Integer({ item, value, onChange }) {
    // console.log("Integer", { item, value });
    const classes = useStyles()
    return (
        <Input
            disabled={(item.view && item.view.disabled) ? item.view.disabled : false}
            type={"number"}
            placeholder={item.placeholder || "введите " + item.label.toLowerCase()}
            clearable
            onChange={onChange}
            value={value}
        />
    )
}
function String({ item, value, onChange }) {
    // console.log("String", { item, value });
    const classes = useStyles()
    return (
        <TextArea
            disabled={(item.view && item.view.disabled) ? item.view.disabled : false}
            autoSize={{ minRows: 2, maxRows: 5 }}
            onChange={onChange}
            value={value}
            placeholder={item.placeholder || "введите " + item.label.toLowerCase()}
        />
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

export function FieldMobile({ auth, item, value, onChange }) {
    switch (item.filterType) {
        case "group":
            switch (item.type) {
                case "object":
                case "document":
                    return (<Obj auth={auth} item={item} value={value} onChange={onChange}></Obj>)
                default:
                    return (<Unknown auth={auth} item={item} value={value} onChange={onChange}></Unknown>)
            }
        case "range":
            switch (item.type) {
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
                    return (<Obj auth={auth} item={item} value={value} onChange={onChange}></Obj>)
                case "action":
                    return (<ActionItem auth={auth} item={item} value={value} onChange={onChange}></ActionItem>)
                default:
                    return (<Unknown auth={auth} item={item} value={value} onChange={onChange}></Unknown>)
            }
    }
}