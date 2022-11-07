import React, { useState, useEffect } from 'react';
import 'moment/locale/ru';
import locale from 'antd/es/date-picker/locale/ru_RU';
import {
    Input,
    Select,
    Checkbox,
    DatePicker,
    InputNumber,
    Dropdown,
    Menu,
    TimePicker,
    Slider
} from 'antd';
import { errorCatch, getDisplay, getObjectValue, GETWITH, QueryDetail, QueryOrder, READWITH } from '../../../Tool';
import moment from 'moment';
import Icofont from 'react-icofont';
import { useMetaContext } from '../../Context';
var _ = require('lodash');

const { TextArea } = Input;
const { Option } = Select;

function GroupObj({ auth, item, value, onChange, changed }) {
    const [data, setData] = useState([]);
    const [disabled, setDisabled] = useState(true);
    const meta = useMetaContext();
    var available = true;
    useEffect(() => {
        available = true;
        return () => {
            available = false;
        };
    }, []);
    useEffect(() => {
        available = true;
        return () => {
            available = false;
        };
    }, []);
    useEffect(() => {
        if (item.source || (item && item.relation && item.relation.reference && item.relation.reference.url)) {
            let filter = item.queryFilter || item.filter || _.get(item,"relation.reference.queryFilter") || _.get(item,"relation.reference.filter");
            GETWITH(auth, item.source || item.relation.reference.url, [
                (!item.queryFilter) ? QueryDetail("model") : undefined,
                (!item.queryFilter) ? QueryOrder("ID", "ASC") : undefined,
                ...(item.queryFilter && _.isArray(item.queryFilter)) ? item.queryFilter : []
            ], ({ data }) => {
                setData((data && data.content) ? data.content : (_.has(data, 'content')) ? [] : data);
                setDisabled(false);
            }, (err, type) => errorCatch(err, type, () => { }));
        } else if (item && item.relation && item.relation.reference && item.relation.reference.data) {
            setData(item.relation.reference.data);
        } else if (item && item.relation && item.relation.reference && item.relation.reference.object) {
            let src = getObjectValue(item, "relation.reference.object");
            if (src) {
                let filter = item.queryFilter || item.filter || _.get(item,"relation.reference.queryFilter") || _.get(item,"relation.reference.filter");
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
    }, [auth, item]);
    const property = (item, value) => {
        if (item && item.relation && item.relation.reference && item.relation.reference.property && value) {
            return value[item.relation.reference.property];
        }
        if (value) {
            return value.ID;
        }
        return undefined;
    };
    const itemByProperty = (item, value) => {
        if (item.relation.reference.property) {
            return data.find(e => e[item.relation.reference.property] === value);
        }
        return data.find(e => e.ID === value);
    };
    const label = (item, value) => {
        if (item && value) {
            if (item.relation && item.relation.display && _.isFunction(item.relation.display)) {
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
    const elements = (data) => {
        if (item.dependence) {
            if (item.dependence.field && by(item)) {
                if (value[item.dependence.field] === by(item)) {
                    return data?.map(i => (
                        <Option key={property(item, value)} value={property(item, value)}>{label(item, value)}</Option>
                    ));
                }
            }
        } else {
            return data?.map(i => (
                <Option key={property(item, value)} value={property(item, value)}>{label(item, value)}</Option>
            ));
        }
    };
    return (
        <Select
            mode="multiple"
            showSearch
            value={value}
            onChange={e=>onChange(e, item, itemByProperty(item, e))}
            style={{ width: "100%" }}
            allowClear={true}
            disabled={disabled}
            filterOption={(input, element) =>
                element.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }>
            {elements(data)}
        </Select>
    )
}
function RangeTime({ value, onChange }) {
    var a = undefined;
    if (value && value[0] && value[1]) {
        a = [];
        a.push(moment(value[0]))
        a.push(moment(value[1]))
    }
    return (
        <TimePicker.RangePicker value={a} onChange={onChange} type="time" format="HH:mm:ss" locale={locale} style={{ width: "100%" }} />
    )
}
function RangeDate({ value, onChange }) {
    var a = undefined;
    if (value && value[0] && value[1]) {
        a = [];
        a.push(moment(value[0]))
        a.push(moment(value[1]))
    }
    return (
        <DatePicker.RangePicker value={a} onChange={onChange} format="DD.MM.YYYY" locale={locale} style={{ width: "100%" }} />
    )
}
function RangeDateTime({ value, onChange }) {
    var a = undefined;
    if (value && value[0] && value[1]) {
        a = [];
        a.push(moment(value[0]))
        a.push(moment(value[1]))
    }
    return (
        <DatePicker.RangePicker showTime={{ format: 'HH:mm' }} value={a} onChange={onChange} format="DD.MM.YYYY HH:mm" locale={locale} style={{ width: "100%" }} />
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
    return (
        <Slider range
            defaultValue={def}
            min={(xmin - (xmin % xstep))}
            max={(xmax + (xstep - xmax % xstep))}
            step={xstep}
            included={true}
            value={val || def}
            onChange={setVal}
            onAfterChange={onChange} />
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
    return (
        <Slider range
            defaultValue={def}
            min={(xmin - (xmin % xstep))}
            max={(xmax + (xstep - xmax % xstep))}
            step={xstep}
            value={val}
            included={true}
            onChange={setVal}
            onAfterChange={onChange} />
    )
}
function Obj({ auth, item, value, onChange, changed }) {
    const [data, setData] = useState([]);
    const [disabled, setDisabled] = useState(true);
    const meta = useMetaContext();
    var available = true;
    useEffect(() => {
        available = true;
        return () => {
            available = false;
        };
    }, []);
    useEffect(() => {
        if (item.source || (item && item.relation && item.relation.reference && item.relation.reference.url)) {
            let filter = item.queryFilter || item.filter || _.get(item,"relation.reference.queryFilter") || _.get(item,"relation.reference.filter");
            GETWITH(auth, item.source || item.relation.reference.url, [
                (!filter) ? QueryDetail("model") : undefined,
                (!filter) ? QueryOrder("ID", "ASC") : undefined,
                ...(filter && _.isArray(filter)) ? filter : []
            ], ({ data }) => {
                setData((data && data.content) ? data.content : (_.has(data, 'content')) ? [] : data);
                setDisabled(false);
            }, (err, type) => errorCatch(err, type, () => { }));
        } else if (item && item.relation && item.relation.reference && item.relation.reference.data) {
            setData(item.relation.reference.data);
        } else if (item && item.relation && item.relation.reference && item.relation.reference.object) {
            let src = getObjectValue(item, "relation.reference.object");
            if (src) {
                let filter = item.queryFilter || item.filter || _.get(item,"relation.reference.queryFilter") || _.get(item,"relation.reference.filter");
                READWITH(auth, src, [
                    (!filter) ? QueryDetail("model") : undefined,
                    (!filter) ? QueryOrder("ID", "ASC") : undefined,
                    ...(filter && _.isArray(filter)) ? filter : []
                ], ({ data }) => {
                    setData((data && data.content) ? data.content : (_.has(data, 'content')) ? [] : data);
                    setDisabled(false);
                }, (err, type) => errorCatch(err, type, () => { }));
            }
        }
    }, [auth, item]);
    const property = (item, value) => {
        if (item && item.relation && item.relation.reference && item.relation.reference.property && value) {
            return value[item.relation.reference.property];
        }
        if (value) {
            return value.ID;
        }
        return undefined;
    };
    const itemByProperty = (item, value) => {
        if (item.relation.reference.property) {
            return data.find(e => e[item.relation.reference.property] === value);
        }
        return data.find(e => e.ID === value);
    };
    const label = (item, value) => {
        if (item && value) {
            if (item.relation && item.relation.display && _.isFunction(item.relation.display)) {
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
    const elements = (data) => {
        if (item.dependence) {
            if (item.dependence.field && by(item)) {
                if (value[item.dependence.field] === by(item)) {
                    return data?.map(i => (
                        <Option key={property(item, value)} value={property(item, value)}>{label(item, value)}</Option>
                    ));
                }
            }
        } else {
            return data?.map(i => (
                <Option key={property(item, value)} value={property(item, value)}>{label(item, value)}</Option>
            ));
        }
    };
    return (
        <Select showSearch
            value={value}
            onChange={e=>onChange(e, item, itemByProperty(item, e))}
            style={{ width: "100%" }}
            allowClear={true}
            disabled={disabled}
            filterOption={(input, element) =>
                element.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }>
            {elements(data)}
        </Select>
    )
}
function DateTime({ value, onChange }) {
    return (
        <DatePicker value={(value) ? moment(value) : undefined} onChange={onChange} showTime format="DD.MM.YYYY HH:mm" locale={locale} style={{ width: "100%" }} />
    )
}
function Date({ value, onChange }) {
    return (
        <DatePicker value={(value) ? moment(value) : undefined} onChange={onChange} format="DD.MM.YYYY" locale={locale} style={{ width: "100%" }} />
    )
}
function Time({ value, onChange }) {
    return (
        <DatePicker value={(value) ? moment(value) : undefined} onChange={onChange} type="time" format="HH:mm:ss" locale={locale} style={{ width: "100%" }} />
    )
}
function Boolean({ item, value, onChange }) {
    const change = (e) => {
        onChange(e.target.checked);
    }
    return (
        <Checkbox checked={value} onChange={change}>
            {item.label}
        </Checkbox>
    )
}
function Float({ value, onChange }) {
    return (
        <InputNumber value={value} onChange={onChange} style={{ width: "100%" }} />
    )
    return (<Input.Group compact>
        <Input
            // style={{ width: 'calc(100% - 31px)' }}
            style={{ width: "100%" }}
            value={value} onChange={onChange}
            //   addonBefore={<EyeTwoTone />}
            //   addonAfter={<EyeTwoTone />}
            //   prefix={<EyeTwoTone />}
            //   suffix={<EyeTwoTone />}
            suffix={<Dropdown overlay={<Menu>
                <Menu.Item>
                    <div style={{ color: "rgba(0, 0, 0, 0.25)" }}>
                        <Icofont icon="rounded-double-right" />
                        <span style={{ fontSize: "13px", paddingLeft: "5px" }}>Больше</span>
                    </div>
                </Menu.Item>
                <Menu.Item>
                    <div style={{ color: "rgba(0, 0, 0, 0.25)" }}>
                        <Icofont icon="rounded-double-left" />
                        <span style={{ fontSize: "13px", paddingLeft: "5px" }}>Меньше</span>
                    </div>
                </Menu.Item>
            </Menu>} placement="bottomRight">
                <Icofont icon="rounded-double-right" style={{ color: "rgba(0, 0, 0, 0.25)" }} />
            </Dropdown>}
        />
        {/* <Tooltip title="copy git url">
            <Button style={{ color: "rgba(0, 0, 0, 0.25)" }} icon={<CopyOutlined />} />
            <Dropdown overlay={<Menu>
                <Menu.Item>
                    <a target="_blank" rel="noopener noreferrer" href="https://www.antgroup.com">
                        1st menu item
                    </a>
                </Menu.Item>
                <Menu.Item>
                    <a target="_blank" rel="noopener noreferrer" href="https://www.aliyun.com">
                        2nd menu item
                    </a>
                </Menu.Item>
            </Menu>} placement="bottomRight">
                <Button style={{ color: "rgba(0, 0, 0, 0.25)" }} icon={<CopyOutlined />} />
            </Dropdown>
        </Tooltip> */}
    </Input.Group>);
}
function Integer({ value, onChange }) {
    return (
        <InputNumber value={value} onChange={onChange} style={{ width: "100%" }} />
    )
}
function String({ value, onChange }) {
    return (
        <Input allowClear value={value} onChange={(v) => onChange(v.target.value)} style={{ width: "100%" }} />
    )
}
function MultilineText({ value, onChange }) {
    return (
        <TextArea rows={6} allowClear value={value} onChange={(v) => onChange(v.target.value)} style={{ width: "100%" }} />
    )
}
function Unknown({ item }) {
    return (
        <div key={item.name}>
            <div>{item.label} - {item.name}</div>
            <div>{item.uuid}</div>
        </div>
    )
}
//------------------------------------------------------------------------------------
function FilterMode(props) {
    const { auth, item, value, onChange, changed, mode } = props;
    let type = ((item.view)?item.view.type:undefined) || item.type;
    switch (item.filterType) {
        case "group":
            switch (type) {
                case "object":
                case "document":
                    return (<GroupObj auth={auth} item={item} value={value} onChange={onChange} changed={changed}></GroupObj>)
                default:
                    return (<Unknown auth={auth} item={item} value={value} onChange={onChange}></Unknown>)
            }
        case "range":
            switch (type) {
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
                case "time":
                    return (<RangeTime auth={auth} item={item} value={value} onChange={onChange}></RangeTime>)
                case "date":
                    return (<RangeDate auth={auth} item={item} value={value} onChange={onChange}></RangeDate>)
                case "datetime":
                case "time.Time":
                    return (<RangeDateTime auth={auth} item={item} value={value} onChange={onChange}></RangeDateTime>)
                default:
                    return (<Unknown auth={auth} item={item} value={value} onChange={onChange}></Unknown>)
            }
        default:
            switch (type) {
                case "text":
                    return (<String auth={auth} item={item} value={value} onChange={onChange}></String>)
                default:
                    return <ModelMode {...props} />
            }

    }
}
function ModelMode(props) {
    const { auth, item, value, onChange, changed, mode } = props;
    let type = ((item.view)?item.view.type:undefined) || item.type;
    switch (type) {
        case "text":
            return (<MultilineText auth={auth} item={item} value={value} onChange={onChange}></MultilineText>)
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
        default:
            return (<Unknown auth={auth} item={item} value={value} onChange={onChange}></Unknown>)
    }
}
//------------------------------------------------------------------------------------

// item: {
//     label: 'Сумма',
//     name: "obshchayaSumma",
//     filterType: "group", // range
//     type: "float",
//     source: "/api/query/name"
// }

export function Field(props) {
    const { auth, item, value, onChange, changed, mode } = props;
    switch (mode) {
        case "model":
            return <ModelMode {...props} />
        case "filter":
            return <FilterMode {...props} />
        default:
            return (<Unknown {...props}></Unknown>)
    }
}