import React, { useState, useEffect } from 'react';
import { createUseStyles } from 'react-jss'
import { useMediaQuery } from 'react-responsive'
import 'moment/locale/ru';
import { Form, Input, TextArea, DatePicker, Picker, Checkbox, SwipeAction, List, SearchBar } from 'antd-mobile';
import { AutoSizer, List as ListVirt } from 'react-virtualized';
import 'react-virtualized/styles.css';
import { Action, ActionPickerItem } from '../../Action'
import {
    Typography,
} from 'antd';
import Icofont from 'react-icofont';
import { CalendarItem } from '../CalendarItem';
import { GET, errorCatch, uncapitalize, GetMeta, GetMetaProperties, getDisplay } from '../../../Tool';
import { FieldMobile } from '../FieldMobile';
var _ = require('lodash');
const { Text, Link } = Typography;
const CheckboxItem = Checkbox.CheckboxItem;
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
            lineHeight: "20px"
        },
        '&.am-list-item .am-textarea-control': {
            paddingTop: "0px",
            paddingBottom: "14px"
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
    }
})

// const Read = (auth, callback, detail, filter, name) => {
//     if (!detail) detail = 'none';
//     filter = (!filter) ? '' : '&' + filter;
//     auth.fetch('/api/query/' + name + '?detail=' + detail + filter).then(res => {
//         if (res && res.data) {
//             if (res.status === true && callback) {
//                 callback(res.data);
//             }
//         }
//     });
// };

// function Unknown({ item }) {
//     const isDesktopOrLaptop = useMediaQuery({ minDeviceWidth: 1224 })
//     // const isPortrait = useMediaQuery({ orientation: 'portrait' })
//     return (
//         <div key={item.name}>
//             {item.label} - {item.name}
//         </div>
//     )
// }
// function Act({ auth, item, value, onChange, changed }) {
//     const classes = useStyles()
//     return (<React.Fragment>
//         <ActionPickerItem 
//             auth={auth}
//             mode="input"
//             item={item}
//             value={value}
//             onChange={onChange}
//         />
//         {/* <Action
//             auth={auth}
//             brief={(!value) ? undefined : (item.display) ? item.display(changed[item.duplex] || value) : undefined}
//             form={item.form || ModelMobile}
//             okText={item.okText || "Выбрать"}
//             dismissText={item.dismissText || "Отмена"}

//             // virtualized={true}
//             // search={search}
//             meta={item.meta}
//             steps={item.steps}
//             triggerOptions={{
//                 className: classes.Act
//             }}
//             placeholder={item.placeholder || "выберите " + item.label.toLowerCase()}
//             closable={false}
//             object={value}
//             titles={(item.titles) ? item.titles : {
//                 header: item.label,
//                 subheader: "",
//             }}
//             action={(values, unlock, close) => {
//                 if (onChange) {
//                     onChange((item.modify) ? item.modify(values) : values, item, (item.modifyDuplex) ? item.modifyDuplex(values) : undefined);
//                 }
//                 close();
//             }}
//             swipe={[
//                 {
//                     key: 'danger',
//                     text: (<Icofont icon="close" />),
//                     onClick: () => {
//                         if (onChange) {
//                             onChange(undefined, item, undefined);
//                         }
//                     },
//                     color: 'danger',
//                 },
//             ]}
//         /> */}
//     </React.Fragment>);
// }
// function Obj({ auth, item, options = {}, value, onChange, changed }) {
//     const classes = useStyles()
//     const [data, setData] = useState([]);
//     const meta = useMetaContext();
//     const [disabled, setDisabled] = useState(true);
//     useEffect(() => {
//         if (item.source || (item && item.relation && item.relation.reference && item.relation.reference.url)) {
//             GETWITH(auth, item.source, [
//                 (!item.queryFilter) ? QueryDetail("model") : undefined,
//                 (!item.queryFilter) ? QueryOrder("ID", "ASC") : undefined,
//                 ...(item.queryFilter && _.isArray(item.queryFilter)) ? item.queryFilter : []
//             ], ({ data }) => {
//                 setData((data && data.content) ? data.content : (_.has(data, 'content')) ? [] : data);
//                 setDisabled(false);
//             }, (err, type) => errorCatch(err, type, () => { }));
//         } else if (item && item.relation && item.relation.reference && item.relation.reference.data) {
//             setData(item.relation.reference.data);
//         } else if (item && item.relation && item.relation.reference && item.relation.reference.object) {
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
//     const property = (item, value) => {
//         if (item && item.relation && item.relation.reference && item.relation.reference.property && value) {
//             return value[item.relation.reference.property];
//         }
//         if (value) {
//             return value.ID;
//         }
//         return undefined;
//     };
//     const itemByProperty = (item, value) => {
//         if (item.relation.reference.property) {
//             return data.find(e => e[item.relation.reference.property] === value);
//         }
//         return data.find(e => e.ID === value);
//     };
//     const label = (item, value) => {
//         if (item && value) {
//             if (item.relation && item.relation.display && _.isFunction(item.relation.display)) {
//                 return item.relation.display(value)
//             } else {
//                 let fieldMeta = meta[getObjectValue(item, "relation.reference.object")];
//                 return getDisplay(value, item?.relation?.display || fieldMeta?.display, fieldMeta, meta)
//             }
//         }
//         return "";
//     };
//     const by = (item) => {
//         if (changed && item.dependence && item.dependence.field) {
//             return (changed[item.dependence.by] && item.dependence.eq) ? changed[item.dependence.by][item.dependence.eq] : changed[item.dependence.eq];
//         }
//     };
//     const oui = [];
//     if (data) {
//         data.forEach((value) => {
//             if (item.dependence) {
//                 if (item.dependence.field && by(item)) {
//                     if (value[item.dependence.field] === by(item)) {
//                         oui.push({
//                             label: label(item, value),
//                             value: property(item, value),
//                         });
//                     }
//                 }
//             } else {
//                 oui.push({
//                     label: label(item, value),
//                     value: property(item, value),
//                 });
//             }
//         });
//     }
//     const [visible, setVisible] = React.useState(false)
//     const current = React.useMemo(() => {
//         return oui?.find((e)=>e.value==value)?.label
//     }, [value, oui])
//     return (
//         <SwipeAction
//             closeOnAction
//             closeOnTouchOutside
//             rightActions={[
//                 {
//                     key: 'danger',
//                     text: (<Icofont icon="close" />),
//                     onClick: () => {
//                         onChange(undefined, item, undefined);
//                     },
//                     color: 'danger',
//                 },
//             ]}
//         >
//             <Picker
//                 visible={visible}
//                 disabled={(item && item.view && item.view.disabled) ? item.view.disabled : false}
//                 value={[value]}
//                 // onChange={e => {
//                 //     onChange(e[0], item, itemByProperty(item, e[0]));
//                 // }}
//                 columns={[oui]}
//                 // cols={1}
//                 // extra={item.placeholder || "выберите " + item.label.toLowerCase()}
//                 onConfirm={e => {
//                     if (onChange) {
//                         onChange(e[0], item, itemByProperty(item, e[0]));
//                     }
//                 }}
//                 confirmText={item.okText || 'Выбрать'}
//                 cancelText={item.dismissText || 'Отмена'}
//                 onClose={()=>setVisible(false)}>
//             </Picker>
//             <List>
//                 <List.Item onClick={()=>setVisible(true)} className={classes.Obj} 
//                     description={current || item.placeholder || "выберите " + item.label.toLowerCase()} /*arrow="horizontal"*/>
//                     {item.label}
//                 </List.Item>
//             </List>
//         </SwipeAction>
//     )
// }
// function Calendar({ item, value, onChange }) {
//     const classes = useStyles()
//     return (
//         <SwipeAction
//             closeOnAction
//             closeOnTouchOutside
//             rightActions={[
//                 {
//                     key: 'danger',
//                     text: (<Icofont icon="close" />),
//                     onClick: () => {
//                         onChange(undefined, item);
//                     },
//                     color: 'danger',
//                 },
//             ]}
//         >
//             <CalendarItem
//                 fields={item.fields}
//                 className={classes.Time}
//                 name={item.label}
//                 value={(value && value.length) ? value : undefined}
//                 placeholder={item.placeholder || "введите " + item.label.toLowerCase()}
//                 onChange={(value) => {
//                     onChange(value, item)
//                 }}
//             />
//         </SwipeAction>
//     )
// }
// function CalendarTime({ item, value, onChange }) {
//     const classes = useStyles()
//     return (
//         <SwipeAction
//             closeOnAction
//             closeOnTouchOutside
//             rightActions={[
//                 {
//                     key: 'danger',
//                     text: (<Icofont icon="close" />),
//                     onClick: () => {
//                         onChange(undefined, item);
//                     },
//                     color: 'danger',
//                 },
//             ]}
//         >
//             <CalendarItem
//                 fields={item.fields}
//                 pickTime={true}
//                 className={classes.Time}
//                 name={item.label}
//                 value={(value && value.length) ? value : undefined}
//                 placeholder={item.placeholder || "введите " + item.label.toLowerCase()}
//                 onChange={(value) => {
//                     onChange(value, item)
//                 }}
//             />
//         </SwipeAction>
//     )
// }
// function Time({ item, value, onChange }) {
//     const classes = useStyles()
//     return (
//         <SwipeAction
//             closeOnAction
//             closeOnTouchOutside
//             rightActions={[
//                 {
//                     key: 'danger',
//                     text: (<Icofont icon="close" />),
//                     onClick: () => {
//                         onChange(undefined, item);
//                     },
//                     color: 'danger',
//                 },
//             ]}
//         >
//             <DatePicker
//                 disabled={(item.view && item.view.disabled) ? item.view.disabled : false}
//                 mode="time"
//                 title="Выберите дату"
//                 extra={item.placeholder || "выберите " + item.label.toLowerCase()}
//                 locale={{
//                     DatePickerLocale: {
//                         year: "",
//                         month: "",
//                         day: "",
//                         hour: "",
//                         minute: "",
//                         am: "",
//                         pm: ""
//                     },
//                     okText: item.okText || "Выбрать",
//                     dismissText: item.dismissText || "Отмена"
//                 }}
//                 value={value}
//                 onChange={date => onChange(date, item)}
//             >
//                 <List.Item className={classes.Time} /*arrow="horizontal"*/>{item.label}</List.Item>
//             </DatePicker>
//         </SwipeAction>
//     )
// }
// function Date({ item, value, onChange }) {
//     const classes = useStyles()
//     return (
//         <SwipeAction
//             closeOnAction
//             closeOnTouchOutside
//             rightActions={[
//                 {
//                     key: 'danger',
//                     text: (<Icofont icon="close" />),
//                     onClick: () => {
//                         onChange(undefined, item);
//                     },
//                     color: 'danger',
//                 },
//             ]}
//         >
//             <DatePicker
//                 disabled={(item.view && item.view.disabled) ? item.view.disabled : false}
//                 mode="date"
//                 title="Выберите дату"
//                 extra={item.placeholder || "выберите " + item.label.toLowerCase()}
//                 locale={{
//                     DatePickerLocale: {
//                         year: "",
//                         month: "",
//                         day: "",
//                         hour: "",
//                         minute: "",
//                         am: "",
//                         pm: ""
//                     },
//                     okText: item.okText || "Выбрать",
//                     dismissText: item.dismissText || "Отмена"
//                 }}
//                 value={value}
//                 onChange={date => onChange(date, item)}
//             >
//                 <List.Item className={classes.Time} /*arrow="horizontal"*/>{item.label}</List.Item>
//             </DatePicker>
//         </SwipeAction>
//     )
// }
// function DateTime({ item, value, onChange }) {
//     const classes = useStyles()
//     return (
//         <SwipeAction
//             closeOnAction
//             closeOnTouchOutside
//             rightActions={[
//                 {
//                     key: 'danger',
//                     text: (<Icofont icon="close" />),
//                     onClick: () => {
//                         onChange(undefined, item);
//                     },
//                     color: 'danger',
//                 },
//             ]}
//         >
//             <DatePicker
//                 disabled={(item.view && item.view.disabled) ? item.view.disabled : false}
//                 mode="datetime"
//                 title="Выберите дату"
//                 extra={item.placeholder || "выберите " + item.label.toLowerCase()}
//                 locale={{
//                     DatePickerLocale: {
//                         year: "",
//                         month: "",
//                         day: "",
//                         hour: "",
//                         minute: "",
//                         am: "",
//                         pm: ""
//                     },
//                     okText: item.okText || "Выбрать",
//                     dismissText: item.dismissText || "Отмена"
//                 }}
//                 value={value}
//                 onChange={date => onChange(date, item)}
//             >
//                 <List.Item className={classes.Time} /*arrow="horizontal"*/>{item.label}</List.Item>
//             </DatePicker>
//         </SwipeAction>
//     )
// }
// function Boolean({ item, value, onChange }) {
//     const classes = useStyles()
//     return (
//         <CheckboxItem
//             disabled={(item.view && item.view.disabled) ? item.view.disabled : false}
//             onChange={(e) => onChange(e.target.checked, item)}
//             checked={value}
//             className={classes.Boolean}
//             onClick={() => onChange(!value, item)}
//         >
//             {item.label}
//         </CheckboxItem>
//     )
// }
// function Float({ item, value, onChange }) {
//     const classes = useStyles()
//     return (
//         <Input
//             disabled={(item.view && item.view.disabled) ? item.view.disabled : false}
//             className={classes.Float}
//             type={"number"}
//             placeholder={item.placeholder || "введите " + item.label.toLowerCase()}
//             clear
//             moneyKeyboardWrapProps={moneyKeyboardWrapProps}
//             onChange={(e) => onChange(e, item)}
//             value={value}
//         >{item.label}</Input>
//     )
// }
// function Integer({ item, value, onChange }) {
//     const classes = useStyles()
//     return (
//         <Input
//             disabled={(item.view && item.view.disabled) ? item.view.disabled : false}
//             className={classes.Integer}
//             type={"number"}
//             placeholder={item.placeholder || "введите " + item.label.toLowerCase()}
//             clear
//             moneyKeyboardWrapProps={moneyKeyboardWrapProps}
//             onChange={(e) => onChange(e, item)}
//             value={value}
//         >{item.label}</Input>
//     )
// }
// function String({ item, value, onChange }) {
//     const classes = useStyles()
//     return (
//         <TextArea
//             disabled={(item.view && item.view.disabled) ? item.view.disabled : false}
//             onChange={(e) => onChange(e, item)}
//             value={value}
//             className={classes.String}
//             title={item.label}
//             placeholder={item.placeholder || "введите " + item.label.toLowerCase()}
//             clear
//             autoHeight
//         />
//     )
// }
// function Field({ auth, form, meta, item, options, value, onChange, changed }) {
//     switch (item.type) {
//         case "string":
//             return (<String auth={auth} form={form} meta={meta} item={item} options={options} value={value} onChange={onChange} changed={changed}></String>)
//         case "int":
//             return (<Integer auth={auth} form={form} meta={meta} item={item} options={options} value={value} onChange={onChange} changed={changed}></Integer>)
//         case "uint":
//             return (<Integer auth={auth} form={form} meta={meta} item={item} options={options} value={value} onChange={onChange} changed={changed}></Integer>)
//         case "integer":
//             return (<Integer auth={auth} form={form} meta={meta} item={item} options={options} value={value} onChange={onChange} changed={changed}></Integer>)
//         case "int64":
//             return (<Integer auth={auth} form={form} meta={meta} item={item} options={options} value={value} onChange={onChange} changed={changed}></Integer>)
//         case "int32":
//             return (<Integer auth={auth} form={form} meta={meta} item={item} options={options} value={value} onChange={onChange} changed={changed}></Integer>)
//         case "uint64":
//             return (<Integer auth={auth} form={form} meta={meta} item={item} options={options} value={value} onChange={onChange} changed={changed}></Integer>)
//         case "uint32":
//             return (<Integer auth={auth} form={form} meta={meta} item={item} options={options} value={value} onChange={onChange} changed={changed}></Integer>)
//         case "double":
//             return (<Float auth={auth} form={form} meta={meta} item={item} options={options} value={value} onChange={onChange} changed={changed}></Float>)
//         case "float":
//             return (<Float auth={auth} form={form} meta={meta} item={item} options={options} value={value} onChange={onChange} changed={changed}></Float>)
//         case "float64":
//             return (<Float auth={auth} form={form} meta={meta} item={item} options={options} value={value} onChange={onChange} changed={changed}></Float>)
//         case "float32":
//             return (<Float auth={auth} form={form} meta={meta} item={item} options={options} value={value} onChange={onChange} changed={changed}></Float>)
//         case "boolean":
//             return (<Boolean auth={auth} form={form} meta={meta} item={item} options={options} value={value} onChange={onChange} changed={changed}></Boolean>)
//         case "bool":
//             return (<Boolean auth={auth} form={form} meta={meta} item={item} options={options} value={value} onChange={onChange} changed={changed}></Boolean>)
//         case "daterange":
//             return (<Calendar auth={auth} form={form} meta={meta} item={item} options={options} value={value} onChange={onChange} changed={changed}></Calendar>)
//         case "datetimerange":
//             return (<CalendarTime auth={auth} form={form} meta={meta} item={item} options={options} value={value} onChange={onChange} changed={changed}></CalendarTime>)
//         case "time":
//             return (<Time auth={auth} form={form} meta={meta} item={item} options={options} value={value} onChange={onChange} changed={changed}></Time>)
//         case "date":
//             return (<Date auth={auth} form={form} meta={meta} item={item} options={options} value={value} onChange={onChange} changed={changed}></Date>)
//         case "datetime":
//             return (<DateTime auth={auth} form={form} meta={meta} item={item} options={options} value={value} onChange={onChange} changed={changed}></DateTime>)
//         case "time.Time":
//             return (<DateTime auth={auth} form={form} meta={meta} item={item} options={options} value={value} onChange={onChange} changed={changed}></DateTime>)
//         case "object":
//             return (<Obj auth={auth} form={form} meta={meta} item={item} options={options} value={value} onChange={onChange} changed={changed}></Obj>)
//         case "action":
//             return (<Act auth={auth} form={form} meta={meta} item={item} options={options} value={value} onChange={onChange} changed={changed}></Act>)
//         default:
//             return (<Unknown auth={auth} form={form} meta={meta} item={item} options={options} value={value} onChange={onChange} changed={changed}></Unknown>)
//     }
// }
function Frm({ auth, form, meta, options, submit, object, virtualized, search }) {
    const classes = useStyles()
    const [visible, setVisible] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [changed, setChanged] = useState({ ...object });
    // useEffect(() => {
    //     form.resetFields();
    // }, [object]);
    useEffect(() => {
        form.resetFields();
        if (object) {
            form.setFieldsValue(object);
        }
    }, [object])
    var properties = GetMetaProperties(meta);
    if (!properties) return <React.Fragment></React.Fragment>;
    const propertiesFiltered = properties?.filter(e => e.name.toUpperCase() !== "ID")?.filter(e => (!e.relation || (e.relation && e.relation.type !== "one-many")));
    const propertiesOneMany = properties?.filter(e => e.relation && e.relation.type === "one-many");
    const propertiesDocuments = properties?.filter(e => e.type === "document");

    // console.log(propertiesFiltered);
    // console.log(propertiesOneMany);
    // console.log(propertiesDocuments);

    const searchFilteredProperties = (e) => {
        if (searchText) {
            return e.label.includes(searchText) || changed[e.name] !== undefined;
        }
        return true;
    };
    const splitedValue = (name, value) => {
        let words = name.split(",");
        let o = {};
        if (words.length > 1) {
            for (let i = 0; i < words.length; i++) {
                const element = words[i];
                o[element] = (_.isArray(value)) ? value[i] : value;
            }
        } else {
            o[name] = value;
        }
        return o;
    };
    const splitedObject = (values) => {
        let o = {};
        for (const key in values) {
            if (Object.hasOwnProperty.call(values, key)) {
                const value = values[key];
                o = { ...o, ...splitedValue(key, value) }
            }
        }
        return o;
    };
    const mergedValue = (name, object) => {
        let words = name.split(",");
        if (words.length > 1) {
            let arr = [];
            for (let i = 0; i < words.length; i++) {
                const element = words[i];
                arr.push(object[element.trim()]);
            }
            return arr;
        }
        return object[name];
    };
    const mergedObject = (properties, object) => {
        if (!object) return;
        let o = {};
        properties.forEach(item => {
            o[item.name] = mergedValue(item.name, object);
        });
        return o;
    };
    const onFieldChange = (value, item, obj) => {
        if (item.duplex && (item.type === "object" || item.type === "action")) {
            setChanged({ ...changed, ...splitedValue(item.name, value), ...splitedValue(item.duplex, obj) });
        } else {
            setChanged({ ...changed, ...splitedValue(item.name, value) });
        }
    };
    const propertiesVirtualized = propertiesFiltered?.filter(e => !!e)?.filter(searchFilteredProperties);
    const virtualizedItem = (item, idx) => {
        if (item && !item.view || (item && item.view && item.view.unvisible === false)) {
            return (
                <Form.Item
                    preserve={(item.hidden) ? "true" : "false"}
                    hidden={item.hidden}

                    className={classes.FormItem}
                    key={idx}
                    name={uncapitalize(item.name)}
                    rules={[{ required: item.required, message: 'Укажите ' + item.label.toLowerCase() + '!' }]}
                >
                    <FieldMobile className={classes.Field} auth={auth} item={item} onChange={onFieldChange} changed={changed}></FieldMobile>
                </Form.Item>
            );
        }
    };
    const rowRenderer = ({
        key,
        index,
        style,
    }) => {
        return (
            <div key={key} style={style}>
                {virtualizedItem(propertiesVirtualized[index], index)}
            </div>
        );
    }
    const fixedHeight = () => {
        return (!search) ? "calc(100vh - 152px)" : "calc(100vh - 210px)"
    };
    return (
        <div>
            {!visible && <div>
                {search &&
                    <div style={{ paddingBottom: "15px" }} className={classes.Search}>
                        <SearchBar
                            value={searchText}
                            placeholder="Поиск"
                            cancelText={"Отмена"}
                            onSubmit={value => setSearchText(value)}
                            onClear={() => setSearchText("")}
                            onCancel={() => setSearchText("")}
                            onChange={value => setSearchText(value)}
                        />
                    </div>
                }
                <Form
                    form={form}
                    onFinish={(values) => {
                        submit(splitedObject(values));
                    }}
                    {...options}
                    // labelalign={"left"}
                    layout={"vertical"}
                    initialValues={{
                        ...mergedObject(propertiesVirtualized, object)
                    }}
                    style={{ height: fixedHeight(), width: "100%" }}
                >
                    {virtualized && <AutoSizer>
                        {({ height, width }) => {
                            return (
                                <ListVirt
                                    height={height}
                                    width={width}
                                    rowCount={propertiesVirtualized.length}
                                    rowHeight={40}
                                    rowRenderer={rowRenderer}
                                />
                            )
                        }}
                    </AutoSizer>}
                    {!virtualized && propertiesVirtualized?.map((item, idx) => virtualizedItem(item, idx))}
                    {/* {steps && [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30]?.map(e => <div key={e} style={{ minHeight: "50px", backgroundColor: "#"+Math.floor(Math.random()*16777215).toString(16) }}>{e}</div>)} */}
                </Form>
            </div>}
            {visible && <div>
                {propertiesOneMany.length > 0 && <div>
                    <Text strong>Связи</Text>
                    {propertiesOneMany.sort((a, b) => {
                        if (a.label < b.label) {
                            return -1;
                        }
                        if (a.label > b.label) {
                            return 1;
                        }
                        return 0;
                    })?.map((e, idx) => (
                        <div key={idx} style={{ paddingLeft: "10px" }}>
                            <Link href="#">
                                {e.label}
                            </Link>
                        </div>
                    ))}
                </div>}
                {propertiesDocuments.length > 0 && <div>
                    <Text strong>Документы</Text>
                    {propertiesDocuments.sort((a, b) => {
                        if (a.label < b.label) {
                            return -1;
                        }
                        if (a.label > b.label) {
                            return 1;
                        }
                        return 0;
                    })?.map((e, idx) => (
                        <div key={idx} style={{ paddingLeft: "10px" }}>
                            <Link href="#">
                                {e.label}
                            </Link>
                        </div>
                    ))}
                </div>}
            </div>}
        </div>
    )
}

export function ModelMobile({ auth, meta, options, form, submit, object, virtualized, search, steps }) {
    const classes = useStyles()
    var xmeta = GetMeta(meta);
    if (!xmeta) return <React.Fragment></React.Fragment>;
    return (
        <React.Fragment>
            {<Frm className={classes.Frm} auth={auth} form={form} meta={meta} options={options} submit={submit} object={object} virtualized={virtualized} search={search} steps={steps}></Frm>}
        </React.Fragment>
    )
};