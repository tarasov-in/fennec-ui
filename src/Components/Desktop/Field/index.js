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
    Upload,
    Image as AntImage,
    Button,
} from 'antd';
import { errorCatch, getDisplay, getObjectValue, GETWITH, pushStateHistoryModal, QueryDetail, QueryOrder, READWITH, useHover } from '../../../Tool';
import moment from 'moment';
import Icofont from 'react-icofont';
import { useMetaContext } from '../../Context';
import { InboxOutlined } from '@ant-design/icons';
import 'moment/locale/ru';
import { EyeInvisibleOutlined, EyeTwoTone, UploadOutlined } from '@ant-design/icons';
import ImageEditor from '../ImageEditor';

var _ = require('lodash');
const { Dragger } = Upload;
const { TextArea } = Input;
const { Option } = Select;

function UploadItems({ auth, item, value, onChange, changed }) {
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
        maxCount: 10,
        name: 'files',
        multiple: true,
        showUploadList: item.showUploadList,
        accept: item.accept,
        onRemove: file => {
            const index = files.indexOf(file);
            const newFiles = files.slice();
            newFiles.splice(index, 1);
            setFiles(newFiles);
        },
        beforeUpload: (file, fileList) => {
            setFiles(o=>[...o, file]);
            return false;
        },
        fileList: files,
    };
    return (<Upload
        {...uploadingProps}
    >
        {!item.trigger && <Button icon={<UploadOutlined />}>Загрузить файлы</Button>}
        {item?.trigger && item?.trigger()}
    </Upload>)
}
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
                {(!item.nocontent) && <div
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
                </div>}
            </div>}
            {!item.trigger && content(item)}
        </Dragger >
    );
}
function Image({ auth, item, value, onChange, changed }) {
    const [open, setOpen] = useState(false);
    const close = () => {
        if (open) {
            window.history.back();
        }
    }

    useEffect(() => {
        if (onChange) {
            onChange(value)
        }
    }, [])

    const onOpenChange = () => {
        if (!open) {
            pushStateHistoryModal(setOpen);
            setOpen(true);
            return
        }
        close();
    }

    const toUrl = (value) => {
        if (!value) {
            return ""
        }

        if (_.isString(value)) {
            return value;
        } else if (value instanceof Blob) {
            return URL.createObjectURL(value)
        }

        return "";
    }

    return (
        <div style={{ padding: "5px 0px" }}>
            <div className='bg bg-grey' style={{
                backgroundColor: "rgb(235 235 235 / 20%)",
                padding: "5px",
                display: "flex",
                justifyContent: "space-between"
            }}>
                <div onClick={onOpenChange} style={{ cursor: "pointer" }}>
                    <AntImage
                        fallback={"data:image/png;base64,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"}
                        preview={false}
                        width={48}
                        height={48}
                        style={{ borderRadius: "6px", border: "1px solid #e5e5e5" }}
                        src={toUrl(value)}
                    />
                </div>
                <div style={{ display: "flex", gap: "5px" }}>
                    <Button onClick={onOpenChange} size="small" fill='none'>
                        <Icofont key="1" icon="ui-edit" />
                    </Button>
                    <Button fill='none' size='small' onClick={(v) => {
                        onChange(null);
                    }}>
                        <Icofont icon="close" />
                    </Button>
                </div>
                <ImageEditor
                    auth={auth}
                    item={item}
                    value={toUrl(value)}
                    onChange={onChange}
                    open={open}
                    close={close}
                />
            </div>
        </div>
    );
}
function GroupObj({ auth, item, value, onChange, onAfterChange, changed }) {
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
            let filter = item.queryFilter || _.get(item, "relation.reference.queryFilter") || _.get(item, "relation.reference.filter");
            let url = item.source || item.relation.reference.url || item.relation.reference.source;
            GETWITH(auth, url, [
                ...defaultQueryParams(filter)
            ], ({ data }) => {
                setData(dataOrContent(data));
            }, (err) => errorCatch(err, () => { }));
        } else if (item && _.get(item, "relation.reference.data")) {
            setData(item.relation.reference.data);
        } else if (item && _.get(item, "relation.reference.object")) {
            let object = getObjectValue(item, "relation.reference.object");
            if (object) {
                let filter = item.queryFilter || _.get(item, "relation.reference.queryFilter") || _.get(item, "relation.reference.filter");
                READWITH(auth, object, [
                    ...defaultQueryParams(filter)
                ], ({ data }) => {
                    setData(dataOrContent(data));
                }, (err) => errorCatch(err, () => { }));
            }
        }
    }, [
        auth,
        item?.source,
        item?.url,
        item?.queryFilter,
        item?.relation?.reference?.data,
        item?.relation?.reference?.url,
        item?.relation?.reference?.source,
        item?.relation?.reference?.queryFilter,
        item?.relation?.reference?.filter
    ]);
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
function RangeTime({ item, value, onChange, onAfterChange }) {
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
function RangeDate({ item, value, onChange, onAfterChange }) {
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
function RangeDateTime({ item, value, onChange, onAfterChange }) {
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
function RangeFloat({ item, value, onChange, onAfterChange }) {
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
            onAfterChange={(item.realtime) ? onAfterChange : onChange} />
    )
}
function FloatSlider({ item, value, onChange, onAfterChange }) {
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
            onAfterChange={(item.realtime) ? onAfterChange : onChange} />
    )
}
function RangeInteger({ item, value, onChange, onAfterChange }) {
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
            onAfterChange={(item.realtime) ? onAfterChange : onChange} />
    )
}
function IntegerSlider({ item, value, onChange, onAfterChange }) {
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
            onAfterChange={(item.realtime) ? onAfterChange : onChange} />
    )
}
function Obj({ auth, item, value, onChange, onAfterChange, changed }) {
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
            let filter = item.queryFilter || _.get(item, "relation.reference.queryFilter") || _.get(item, "relation.reference.filter");
            let url = item.source || item.relation.reference.url || item.relation.reference.source;
            GETWITH(auth, url, [
                ...defaultQueryParams(filter)
            ], ({ data }) => {
                setData(dataOrContent(data));
            }, (err) => errorCatch(err, () => { }));
        } else if (item && _.get(item, "relation.reference.data")) {
            setData(item.relation.reference.data);
        } else if (item && _.get(item, "relation.reference.object")) {
            let object = getObjectValue(item, "relation.reference.object");
            if (object) {
                let filter = item.queryFilter || _.get(item, "relation.reference.queryFilter") || _.get(item, "relation.reference.filter");
                READWITH(auth, object, [
                    ...defaultQueryParams(filter)
                ], ({ data }) => {
                    setData(dataOrContent(data));
                }, (err) => errorCatch(err, () => { }));
            }
        }
    }, [
        auth,
        item?.source,
        item?.url,
        item?.queryFilter,
        item?.relation?.reference?.data,
        item?.relation?.reference?.url,
        item?.relation?.reference?.source,
        item?.relation?.reference?.queryFilter,
        item?.relation?.reference?.filter
    ]);
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
function DateTime({ item, value, onChange, onAfterChange }) {
    return (
        <DatePicker value={(value) ? moment(value) : undefined} onChange={onChange} showTime format="DD.MM.YYYY HH:mm" locale={locale} style={{ width: "100%" }} />
    )
}
function Date({ item, value, onChange, onAfterChange }) {
    return (
        <DatePicker value={(value) ? moment(value) : undefined} onChange={onChange} format="DD.MM.YYYY" locale={locale} style={{ width: "100%" }} />
    )
}
function Time({ item, value, onChange, onAfterChange }) {
    return (
        <DatePicker value={(value) ? moment(value) : undefined} onChange={onChange} type="time" format="HH:mm:ss" locale={locale} style={{ width: "100%" }} />
    )
}
function Boolean({ item, value, onChange, onAfterChange }) {
    const change = (e) => {
        onChange(e.target.checked);
    }
    return (
        <Checkbox checked={value} onChange={change}>
            {item.label}
        </Checkbox>
    )
}
function Float({ item, value, onChange, onAfterChange }) {
    return (
        <InputNumber value={value} onChange={onChange} style={{ width: "100%" }} />
    )
}
function Integer({ item, value, onChange, onAfterChange }) {
    return (
        <InputNumber value={value} onChange={onChange} style={{ width: "100%" }} />
    )
}
function String({ item, value, onChange, onAfterChange }) {
    return (
        <Input size={(item.size) ? item.size : "middle"} allowClear value={value} onChange={(v) => onChange(v.target.value)} style={{ width: "100%" }} />
    )
}
function Password({ item, value, onChange, onAfterChange }) {
    return (
        <Input.Password allowClear value={value} onChange={(v) => onChange(v.target.value)} style={{ width: "100%" }}
            iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
        />
    )
}
function MultilineText({ item, value, onChange, onAfterChange }) {
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
    const { auth, item, value, onChange, onAfterChange, changed, mode } = props;
    let type = ((item.view) ? item.view.type : undefined) || item.type;
    switch (item.filterType) {
        case "group":
            switch (type) {
                case "func":
                    return (props?.item?.render) ? props?.item?.render(auth, item, value, onChange) : undefined;
                case "object":
                case "document":
                    return (<GroupObj auth={auth} item={item} value={value} onChange={onChange} onAfterChange={onAfterChange} changed={changed}></GroupObj>)
                default:
                    return (<Unknown auth={auth} item={item} value={value} onChange={onChange} onAfterChange={onAfterChange}></Unknown>)
            }
        case "range":
            switch (type) {
                case "func":
                    return (props?.item?.render) ? props?.item?.render(auth, item, value, onChange, onAfterChange) : undefined;
                case "int":
                case "uint":
                case "integer":
                case "int64":
                case "int32":
                case "uint64":
                case "uint32":
                    return (<RangeInteger auth={auth} item={item} value={value} onChange={onChange} onAfterChange={onAfterChange}></RangeInteger>)
                case "double":
                case "float":
                case "float64":
                case "float32":
                    return (<RangeFloat auth={auth} item={item} value={value} onChange={onChange} onAfterChange={onAfterChange}></RangeFloat>)
                case "time":
                    return (<RangeTime auth={auth} item={item} value={value} onChange={onChange} onAfterChange={onAfterChange}></RangeTime>)
                case "date":
                    return (<RangeDate auth={auth} item={item} value={value} onChange={onChange} onAfterChange={onAfterChange}></RangeDate>)
                case "datetime":
                case "time.Time":
                    return (<RangeDateTime auth={auth} item={item} value={value} onChange={onChange} onAfterChange={onAfterChange}></RangeDateTime>)
                default:
                    return (<Unknown auth={auth} item={item} value={value} onChange={onChange} onAfterChange={onAfterChange}></Unknown>)
            }
        case "slider":
            switch (type) {
                case "func":
                    return (props?.item?.render) ? props?.item?.render(auth, item, value, onChange, onAfterChange) : undefined;
                case "int":
                case "uint":
                case "integer":
                case "int64":
                case "int32":
                case "uint64":
                case "uint32":
                    return (<IntegerSlider auth={auth} item={item} value={value} onChange={onChange} onAfterChange={onAfterChange}></IntegerSlider>)
                case "double":
                case "float":
                case "float64":
                case "float32":
                    return (<FloatSlider auth={auth} item={item} value={value} onChange={onChange} onAfterChange={onAfterChange}></FloatSlider>)
                default:
                    return (<Unknown auth={auth} item={item} value={value} onChange={onChange} onAfterChange={onAfterChange}></Unknown>)
            }
        default:
            switch (type) {
                case "func":
                    return (props?.item?.render) ? props?.item?.render(auth, item, value, onChange, onAfterChange) : undefined;
                case "text":
                    return (<MultilineText auth={auth} item={item} value={value} onChange={onChange} onAfterChange={onAfterChange}></MultilineText>)
                case "string":
                    return (<String auth={auth} item={item} value={value} onChange={onChange} onAfterChange={onAfterChange}></String>)
                case "password":
                    return (<Password auth={auth} item={item} value={value} onChange={onChange} onAfterChange={onAfterChange}></Password>)
                case "int":
                case "uint":
                case "integer":
                case "int64":
                case "int32":
                case "uint64":
                case "uint32":
                    return (<Integer auth={auth} item={item} value={value} onChange={onChange} onAfterChange={onAfterChange}></Integer>)
                case "double":
                case "float":
                case "float64":
                case "float32":
                    return (<Float auth={auth} item={item} value={value} onChange={onChange} onAfterChange={onAfterChange}></Float>)
                case "boolean":
                case "bool":
                    return (<Boolean auth={auth} item={item} value={value} onChange={onChange} onAfterChange={onAfterChange}></Boolean>)
                case "time":
                    return (<Time auth={auth} item={item} value={value} onChange={onChange} onAfterChange={onAfterChange}></Time>)
                case "date":
                    return (<Date auth={auth} item={item} value={value} onChange={onChange} onAfterChange={onAfterChange}></Date>)
                case "datetime":
                case "time.Time":
                    return (<DateTime auth={auth} item={item} value={value} onChange={onChange} onAfterChange={onAfterChange}></DateTime>)
                case "object":
                case "document":
                    return (<Obj auth={auth} item={item} value={value} onChange={onChange} onAfterChange={onAfterChange} changed={changed}></Obj>)
                case "file":
                    return (<UploadItem auth={auth} item={item} value={value} onChange={onChange} onAfterChange={onAfterChange}></UploadItem>)
                case "files":
                    return (<UploadItems auth={auth} item={item} value={value} onChange={onChange} onAfterChange={onAfterChange}></UploadItems>)
                // case "imageeditor":
                //     return (<ImageEditor auth={auth} item={item} value={value} onChange={onChange} onAfterChange={onAfterChange}></ImageEditor>)
                case "image":
                    return (<Image auth={auth} item={item} value={value} onChange={onChange} onAfterChange={onAfterChange}></Image>)
                default:
                    return (<Unknown auth={auth} item={item} value={value} onChange={onChange} onAfterChange={onAfterChange}></Unknown>)
            }

    }
}