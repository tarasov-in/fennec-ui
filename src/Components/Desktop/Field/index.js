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
    Slider,
    Upload
} from 'antd';
import { errorCatch, getDisplay, getObjectValue, GETWITH, QueryDetail, QueryOrder, READWITH, useHover } from '../../../Tool';
import moment from 'moment';
import Icofont from 'react-icofont';
import { useMetaContext } from '../../Context';
import { InboxOutlined } from '@ant-design/icons';
import 'moment/locale/ru';
import { EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';

var _ = require('lodash');
const { Dragger } = Upload;
const { TextArea } = Input;
const { Option } = Select;

function UploadItem({ auth, item, value, onChange, changed }) {
    const [hoverRef, isHovered] = useHover();
    const [files, setFiles] = useState([]);
    useEffect(() => {
        triggerChange(files);
    }, [files]);
    const triggerChange = (changedValue) => {
        if (onChange) {
            onChange([
                ...changedValue,
            ]);
        }
    };
    const uploadingProps = {
        maxCount: 1,
        name: 'file',
        multiple: false,
        showUploadList: item.showUploadList,
        accept: item.accept,
        onRemove: file => {
            const index = files.indexOf(file);
            const newFiles = files.slice();
            newFiles.splice(index, 1);
            setFiles(newFiles);
        },
        beforeUpload: file => {
            // if (props.multiple) {
            //     setFiles([...files, file]);
            // } else {
            setFiles([file]);
            // }
            return false;
        },
        fileList: files,
    };
    const content = (item) => (
        <div style={{ padding: "15px" }}>
            <p className="ant-upload-drag-icon" style={{ marginBottom: "12px" }}>
                <InboxOutlined />
            </p>
            <p className="ant-upload-text" style={{ fontSize: "14px" }}>Нажмите для выбора или перетащите файл <br />в выделенную область</p>
            <p className="ant-upload-hint" style={{ fontSize: "13px" }}>
                {(item.accept) ? "Поддерживается загрузка файлов " + item.accept : "Поддерживается загрузка любых типов файлов"}
            </p>
        </div>
    );
    return (
        <Dragger {...uploadingProps}>
            {(item.trigger) && <div ref={hoverRef}>
                {item.trigger()}
                <div
                    style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: "rgb(240 248 255 / 82%)",
                        display: (isHovered || !value) ? "flex" : "none",
                        justifyContent: "center",
                        alignContent: "center",
                        alignItems: "center",
                    }}
                >
                    <div style={{ padding: "15px", borderRadius: "4px", backgroundColor: "rgb(255 255 255 / 67%)" }}>
                        {content(item)}
                    </div>
                </div>
            </div>}
            {!item.trigger && content(item)}
        </Dragger >
    );
}

function GroupObj({ auth, item, value, onChange, changed }) {
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
        } else if (_.isArray(filter)) {
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
        } else if (item && _.get(item, "relation.reference.data")) {
            setData(item.relation.reference.data);
        } else if (item && _.get(item, "relation.reference.object")) {
            let object = getObjectValue(item, "relation.reference.object");
            if (object) {
                let filter = item.queryFilter || item.filter || _.get(item, "relation.reference.queryFilter") || _.get(item, "relation.reference.filter");
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
    const elements = (data) => {
        if (item.dependence) {
            if (item.dependence.field && by(item)) {
                if (value[item.dependence.field] === by(item)) {
                    return data?.map(i => (
                        <Option key={property(item, i)} value={property(item, i)}>{label(item, i)}</Option>
                    ));
                }
            }
        } else {
            return data?.map(i => (
                <Option key={property(item, i)} value={property(item, i)}>{label(item, i)}</Option>
            ));
        }
    };
    return (
        <Select
            size={(item.size) ? item.size : "middle"}
            mode="multiple"
            showSearch
            value={value}
            onChange={e => onChange(e, item, itemByProperty(item, e))}
            style={{ width: "100%" }}
            allowClear={true}
            disabled={(item && item.view && item.view.disabled) ? item.view.disabled : false}
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
function FloatSlider({ item, value, onChange }) {
    const [val, setVal] = useState();
    useEffect(() => {
        setVal(value);
    }, [value]);
    const xstep = item?.step || 1;
    const xmin = item?.min || item?.func?.min || 0;
    const xmax = item?.max || item?.func?.max || 100000;
    return (
        <Slider
            disabled={(item && item.view && item.view.disabled) ? item.view.disabled : false}
            min={xmin}
            max={xmax}
            step={xstep}
            value={(item.realtime) ? value : val}
            onChange={(item.realtime) ? onChange : setVal}
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
function IntegerSlider({ item, value, onChange }) {
    const [val, setVal] = useState();
    useEffect(() => {
        setVal(value);
    }, [value]);
    const xstep = item?.step || 1;
    const xmin = item?.min || item?.func?.min || 0;
    const xmax = item?.max || item?.func?.max || 100000;

    return (
        <Slider
            disabled={(item && item.view && item.view.disabled) ? item.view.disabled : false}
            min={xmin}
            max={xmax}
            step={xstep}
            value={(item.realtime) ? value : val}
            onChange={(item.realtime) ? onChange : setVal}
            onAfterChange={onChange} />
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
        } else if (_.isArray(filter)) {
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
        } else if (item && _.get(item, "relation.reference.data")) {
            setData(item.relation.reference.data);
        } else if (item && _.get(item, "relation.reference.object")) {
            let object = getObjectValue(item, "relation.reference.object");
            if (object) {
                let filter = item.queryFilter || item.filter || _.get(item, "relation.reference.queryFilter") || _.get(item, "relation.reference.filter");
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
    const elements = (data) => {
        if (item.dependence) {
            if (item.dependence.field && by(item)) {
                if (value[item.dependence.field] === by(item)) {
                    return data?.map(i => (
                        <Option key={property(item, i)} value={property(item, i)}>{label(item, i)}</Option>
                    ));
                }
            }
        } else {
            return data?.map(i => (
                <Option key={property(item, i)} value={property(item, i)}>{label(item, i)}</Option>
            ));
        }
    };
    return (
        <Select showSearch
            size={(item.size) ? item.size : "middle"}
            value={value}
            onChange={e => onChange(e, item, itemByProperty(item, e))}
            style={{ width: "100%" }}
            allowClear={true}
            disabled={(item && item.view && item.view.disabled) ? item.view.disabled : false}
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
function Password({ value, onChange }) {
    return (
        <Input.Password allowClear value={value} onChange={(v) => onChange(v.target.value)} style={{ width: "100%" }}
            iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
        />
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

// item: {
//     label: 'Сумма',
//     name: "obshchayaSumma",
//     filterType: "group", // range
//     type: "float",
//     source: "/api/query/name"
// }

export function Field(props) {
    const { auth, item, value, onChange, changed, mode } = props;
    let type = ((item.view) ? item.view.type : undefined) || item.type;
    switch (item.filterType) {
        case "group":
            switch (type) {
                case "func":
                    return (props.func) ? props.func(auth, item, value, onChange) : undefined;
                case "object":
                case "document":
                    return (<GroupObj auth={auth} item={item} value={value} onChange={onChange} changed={changed}></GroupObj>)
                default:
                    return (<Unknown auth={auth} item={item} value={value} onChange={onChange}></Unknown>)
            }
        case "range":
            switch (type) {
                case "func":
                    return (props.func) ? props.func(auth, item, value, onChange) : undefined;
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
        case "slider":
            switch (type) {
                case "func":
                    return (props.func) ? props.func(auth, item, value, onChange) : undefined;
                case "int":
                case "uint":
                case "integer":
                case "int64":
                case "int32":
                case "uint64":
                case "uint32":
                    return (<IntegerSlider auth={auth} item={item} value={value} onChange={onChange}></IntegerSlider>)
                case "double":
                case "float":
                case "float64":
                case "float32":
                    return (<FloatSlider auth={auth} item={item} value={value} onChange={onChange}></FloatSlider>)
                default:
                    return (<Unknown auth={auth} item={item} value={value} onChange={onChange}></Unknown>)
            }
        default:
            switch (type) {
                case "func":
                    return (props.func) ? props.func(auth, item, value, onChange) : undefined;
                case "text":
                    return (<MultilineText auth={auth} item={item} value={value} onChange={onChange}></MultilineText>)
                case "string":
                    return (<String auth={auth} item={item} value={value} onChange={onChange}></String>)
                case "password":
                    return (<Password auth={auth} item={item} value={value} onChange={onChange}></Password>)
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
                case "file":
                    return (<UploadItem auth={auth} item={item} value={value} onChange={onChange}></UploadItem>)
                default:
                    return (<Unknown auth={auth} item={item} value={value} onChange={onChange}></Unknown>)
            }

    }
}