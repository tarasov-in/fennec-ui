import React, { useState, useEffect, useMemo } from 'react';
import 'moment/locale/ru';
import { errorCatch, getDisplay, getObjectValue, GETWITH, JSXMap, pushStateHistoryModal, QueryDetail, QueryOrder, READWITH } from '../../../Tool';
import moment from 'moment';
import { Checkbox, Input, List, TextArea, Slider, Picker, DatePicker, Button, ImageUploader, Popup, Radio, Space, CheckList, SearchBar, Image as AntImage } from 'antd-mobile';
import { createUseStyles } from 'react-jss';
import { CalendarItem } from '../CalendarItem';
import { useMetaContext } from '../../Context';
import { ActionPickerItem } from '../../Action';
import Icofont from 'react-icofont';
import styles from './index.less'
import { EyeInvisibleOutline, EyeOutline } from 'antd-mobile-icons'
import { InboxOutlined } from '@ant-design/icons';
import ImageEditor from '../ImageEditor';

var _ = require('lodash');

const { RangePicker } = DatePicker;

const isIPhone = new RegExp('\\biPhone\\b|\\biPod\\b', 'i').test(window.navigator.userAgent);
let moneyKeyboardWrapProps;
if (isIPhone) {
    moneyKeyboardWrapProps = {
        onTouchStart: e => e.preventDefault(),
    };
}

function UploadItem({ auth, item, value, onChange, changed }) {
    const [files, setFiles] = useState([]);
    const [urls, setUrls] = useState([]);
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
        accept: item.accept,
        onDelete: file => {
            setUrls([]);
            setFiles([]);
        },
        beforeUpload: file => {
            setFiles([file]);
            return file;
        },
    };
    const content = (item) => (
        <div style={{ padding: "0 15px" }}>
            <p className="ant-upload-text" style={{ fontSize: "14px", marginBottom: "3px" }}>Нажмите для выбора файла</p>
            <p className="ant-upload-hint" style={{ fontSize: "13px", marginBottom: "0px" }}>
                {(item.accept) ? "Поддерживается загрузка файлов " + item.accept : "Поддерживается загрузка любых типов файлов"}
            </p>
        </div>
    );
    const upload = (file) => {
        return {
            url: URL.createObjectURL(file),
        }
    }
    return (
        <div className='bg bg-grey' style={{
            backgroundColor: "rgb(235 235 235 / 20%)",
            padding: "5px 0px",
            display: "flex",
            justifyContent: "space-between"
        }}>
            <div style={{ flex: "0" }}>
                <ImageUploader
                    style={{
                        borderRadius: "4px",
                        border: "1px solid #cfcfcf",
                        '--cell-size': '65px'
                    }}
                    value={urls}
                    onChange={(f) => {
                        setUrls(f);
                    }}
                    upload={upload}
                    {...uploadingProps}
                    showUpload={urls.length < uploadingProps.maxCount}
                >
                    {(item.trigger && _.isFunction(item.trigger)) && item.trigger(item)}
                    {(item.trigger && !_.isFunction(item.trigger)) && content(item)}
                </ImageUploader>
            </div>
            {/* <div style={{ flex: "1" }}>
                {content(item)}
            </div> */}
        </div>
    );
}

function Image({ auth, item, value, onChange, changed }) {
    const [open, setOpen] = useState(false);
    const close = () => {
        if (open) {
            window.history.back();
        }
    }
 
    useEffect(()=>{
        if(onChange) {
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
    }

    return (
        <div style={{ padding: "5px 0px" }}>
            {(item && item.header !== false) && <div className='bg bg-grey' style={{
                textAlign: "left",
                paddingLeft: "5px",
                marginBottom: "5px",
                display: "flex",
                justifyContent: "space-between"
            }}>
                <div>{item.label}</div>
                <Button fill='none' size='mini' onClick={(v) => {
                    onChange(null);
                }}>
                    <Icofont icon="close" />
                </Button>
            </div>}
            <div className='bg bg-grey' style={{
                backgroundColor: "rgb(235 235 235 / 20%)",
                padding: "5px",
                display: "flex",
                justifyContent: "space-between"
            }}>
                <div onClick={onOpenChange}>
                    <AntImage
                        width={48}
                        height={48}
                        style={{ borderRadius: "6px", border: "1px solid #e5e5e5" }}
                        src={toUrl(value)}
                    />
                </div>
                <Button onClick={onOpenChange} size="small" fill='none'>
                    <Icofont key="1" icon="ui-edit" />
                </Button>
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

function ActionItem({ auth, item, value, onChange, onAfterChange, changed }) {
    return (<React.Fragment>
        <ActionPickerItem
            auth={auth}
            mode="input"
            item={item}
            value={value}
            onChange={onChange}
        />
    </React.Fragment>);
}
function RangeDate({ item, value, onChange, onAfterChange }) {
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
            {(item && item.header !== false) && <div className='bg bg-grey'
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
            </div>}
            <div style={{ display: "flex", justifyContent: "space-between", gap: "5px" }}>
                <div onClick={() => {
                    setVisible1(true)
                }} style={{
                    flex: "1",
                    border: "1px solid #e5e5e5",
                    fontSize: "13px",
                    borderRadius: "4px",
                    padding: "2px 6px"
                }}>
                    <DatePicker
                        style={{
                            "--item-font-size": "13px"
                        }}
                        precision='day'
                        max={val[1]}
                        min={moment().subtract(100, "years").toDate()}
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
                            value ? moment(value).format('YYYY-MM-DD') : <span style={{ color: "rgb(177 177 177)" }}>{item.placeholder || (`выберите  ${(item.label) ? item.label.toLowerCase() : "значение"}`)}</span>
                        }
                    </DatePicker>
                </div>
                <div onClick={() => {
                    setVisible2(true)
                }} style={{
                    flex: "1",
                    border: "1px solid #e5e5e5",
                    fontSize: "13px",
                    borderRadius: "4px",
                    padding: "2px 6px"
                }}>
                    <DatePicker
                        style={{
                            "--item-font-size": "13px"
                        }}
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
                            value ? moment(value).format('YYYY-MM-DD') : <span style={{ color: "rgb(177 177 177)" }}>{item.placeholder || (`выберите  ${(item.label) ? item.label.toLowerCase() : "значение"}`)}</span>
                        }
                    </DatePicker>
                </div>
            </div>
        </div>
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
            {(item && item.header !== false) && <div className='bg bg-grey' style={{
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
            </div>}
            <div style={{ display: "flex", justifyContent: "space-between", gap: "5px" }}>
                <div style={{
                    flex: "1",
                    border: "1px solid #e5e5e5",
                    fontSize: "13px",
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
                    fontSize: "13px",
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
function FloatSlider({ item, value, onChange, onAfterChange }) {
    const [val, setVal] = useState();
    useEffect(() => {
        setVal(value);
    }, [value]);
    const xstep = item?.step || 1;
    const xmin = item?.min || item?.func?.min || 0;
    const xmax = item?.max || item?.func?.max || 100000;

    return (
        <div style={{ padding: "5px 0px" }}>
            {(item && item.header !== false) && <div className='bg bg-grey' style={{
                textAlign: "left",
                paddingLeft: "5px",
                marginBottom: "5px",
                display: "flex",
                justifyContent: "space-between"
            }}>
                <div>{item.label}</div>
                <Button
                    disabled={(item && item.view && item.view.disabled) ? item.view.disabled : false}
                    fill='none' size='mini' onClick={(v) => {
                        onChange();
                    }}>
                    <Icofont icon="close" />
                </Button>
            </div>}
            <div>
                <Slider
                    disabled={(item && item.view && item.view.disabled) ? item.view.disabled : false}
                    range
                    min={xmin}
                    max={xmax}
                    step={xstep}
                    value={(item.realtime) ? value : val}
                    onChange={(item.realtime) ? onChange : setVal}
                    onAfterChange={(item.realtime) ? onAfterChange : onChange}
                />
            </div>
        </div>
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
            {(item && item.header !== false) && <div className='bg bg-grey' style={{
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
            </div>}
            <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div style={{
                    flex: "1",
                    border: "1px solid #e5e5e5",
                    fontSize: "13px",
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
                    fontSize: "13px",
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
function IntegerSlider({ item, value, onChange, onAfterChange }) {
    const [val, setVal] = useState();
    useEffect(() => {
        setVal(value);
    }, [value]);
    const xstep = item?.step || 1;
    const xmin = item?.min || item?.func?.min || 0;
    const xmax = item?.max || item?.func?.max || 100000;

    return (
        <div style={{ padding: "5px 0px" }}>
            {(item && item.header !== false) && <div className='bg bg-grey' style={{
                textAlign: "left",
                paddingLeft: "5px",
                marginBottom: "5px",
                display: "flex",
                justifyContent: "space-between"
            }}>
                <div>{item.label}</div>
                <Button
                    disabled={(item && item.view && item.view.disabled) ? item.view.disabled : false}
                    fill='none' size='mini' onClick={(v) => {
                        onChange();
                    }}>
                    <Icofont icon="close" />
                </Button>
            </div>}
            <Slider
                disabled={(item && item.view && item.view.disabled) ? item.view.disabled : false}
                min={xmin}
                max={xmax}
                step={xstep}
                value={(item.realtime) ? value : val}
                onChange={(item.realtime) ? onChange : setVal}
                onAfterChange={(item.realtime) ? onAfterChange : onChange}
            />
        </div>
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
            {(item && item.header !== false) && <div className='bg bg-grey' style={{
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
            </div>}
            <div style={{ display: "flex", justifyContent: "space-between", gap: "5px" }}>
                <div onClick={() => {
                    setVisible(true)
                }} style={{
                    flex: "1",
                    border: "1px solid #e5e5e5",
                    fontSize: "13px",
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
                    {current || <span style={{ color: "rgb(177 177 177)" }}>{item.placeholder || (`выберите  ${(item.label) ? item.label.toLowerCase() : "значение"}`)}</span>}
                </div>
            </div>
        </div>
    )
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
    const itemsByProperty = (item, value) => {
        return data?.filter(e => value?.find(f => property(item, e) === f));
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

    const [searchText, setSearchText] = useState('')
    const [visible, setVisible] = React.useState(false)
    const filteredItems = useMemo(() => {
        if (searchText) {
            return data.filter(i => {
                let l = label(item, i).toLowerCase();
                return l.includes(searchText?.toLowerCase())
            })
        } else {
            return data
        }
    }, [data, searchText])
    const elements = (data) => {
        if (item.dependence) {
            if (item.dependence.field && by(item)) {
                if (value[item.dependence.field] === by(item)) {
                    return data?.map(i => (
                        <CheckList.Item key={property(item, i)} value={property(item, i)}>{label(item, i)}</CheckList.Item>
                    ));
                }
            }
        } else {
            return data?.map(i => (
                <CheckList.Item key={property(item, i)} value={property(item, i)}>{label(item, i)}</CheckList.Item>
            ));
        }
    };
    const current = React.useMemo(() => {
        return data?.filter((e) => value?.find(f => property(item, e) === f))
    }, [value, data])

    return (
        <div style={{ padding: "5px 0px" }}>
            {(item && item.header !== false) && <div className='bg bg-grey' style={{
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
            </div>}
            <div style={{ display: "flex", justifyContent: "space-between", gap: "5px" }}>
                <div onClick={() => {
                    setVisible(true)
                }} style={{
                    flex: "1",
                    border: "1px solid #e5e5e5",
                    fontSize: "13px",
                    borderRadius: "4px",
                    padding: "2px 6px"
                }}>
                    <Popup
                        visible={visible}
                        showCloseButton
                        bodyStyle={{ height: "100%" }}
                        onClose={() => {
                            setVisible(false)
                        }}
                    >
                        <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
                            <div style={{ flex: "0", padding: "0 10px" }}>
                                <div style={{ display: "flex", justifyContent: "center", padding: "10px 30px 10px 15px", fontSize: "16px" }}>
                                    <div>{item.label}</div>
                                </div>
                            </div>
                            <div style={{ flex: "0", padding: "0 10px" }}>
                                <SearchBar
                                    value={searchText}
                                    onChange={v => {
                                        setSearchText(v)
                                    }}
                                />
                            </div>
                            <div style={{ overflowY: 'scroll', flex: "1", height: "100%" }}>
                                <div style={{ height: "100%", padding: "0px 15px 15px 15px" }}>
                                    <CheckList multiple defaultValue={value}
                                        onChange={e => {
                                            onChange(e, item, itemsByProperty(item, e))
                                        }}>
                                        {elements(filteredItems)}
                                    </CheckList>
                                </div>
                            </div>
                            <div style={{ flex: "0" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", padding: "10px" }}>
                                    <Button style={{ flex: "auto" }} type="ghost" onClick={() => {
                                        setVisible(false)
                                    }}>Закрыть</Button>
                                </div>
                            </div>
                        </div>
                    </Popup>
                    {(current && current.length) ? <span>
                        {JSXMap(current, (i, idx) => (
                            <span key={idx}>{label(item, i)}{(idx < current.length - 1) ? ", " : ""}</span>
                        ))}
                    </span> : <span style={{ color: "rgb(177 177 177)" }}>{item.placeholder || (`выберите  ${(item.label) ? item.label.toLowerCase() : "значение"}`)}</span>}
                </div>
            </div >
        </div >
    )
}
function Date({ item, value, onChange, onAfterChange }) {
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
            {(item && item.header !== false) && <div className='bg bg-grey' style={{
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
            </div>}
            <div style={{ display: "flex", justifyContent: "space-between", gap: "5px" }}>
                <div onClick={() => {
                    setVisible(true)
                }} style={{
                    flex: "1",
                    border: "1px solid #e5e5e5",
                    fontSize: "13px",
                    borderRadius: "4px",
                    padding: "2px 6px"
                }}>
                    <DatePicker
                        style={{
                            "--item-font-size": "13px"
                        }}
                        precision='day'
                        min={moment().subtract(100, "years").toDate()}
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
                            value ? moment(value).format('YYYY-MM-DD') : <span style={{ color: "rgb(177 177 177)" }}>{item.placeholder || (`выберите  ${(item.label) ? item.label.toLowerCase() : "значение"}`)}</span>
                        }
                    </DatePicker>
                </div>
            </div>
        </div>
    )
}
function DateTime({ item, value, onChange, onAfterChange }) {
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
            {(item && item.header !== false) && <div className='bg bg-grey' style={{
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
            </div>}
            <div style={{ display: "flex", justifyContent: "space-between", gap: "5px" }}>
                <div onClick={() => {
                    setVisible(true)
                }} style={{
                    flex: "1",
                    border: "1px solid #e5e5e5",
                    fontSize: "13px",
                    borderRadius: "4px",
                    padding: "2px 6px"
                }}>
                    <DatePicker
                        style={{
                            "--item-font-size": "13px"
                        }}
                        precision='minute'
                        min={moment().subtract(100, "years").toDate()}
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
                            value ? moment(value).format('YYYY-MM-DD HH:mm:ss') : <span style={{ color: "rgb(177 177 177)" }}>{item.placeholder || (`выберите  ${(item.label) ? item.label.toLowerCase() : "значение"}`)}</span>
                        }
                    </DatePicker>
                </div>
            </div>
        </div>
    )
}
function Time({ item, value, onChange, onAfterChange }) {
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
            {(item && item.header !== false) && <div className='bg bg-grey' style={{
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
            </div>}
            <div style={{ display: "flex", justifyContent: "space-between", gap: "5px" }}>
                <div onClick={() => {
                    setVisible(true)
                }} style={{
                    flex: "1",
                    border: "1px solid #e5e5e5",
                    borderRadius: "4px",
                    fontSize: "13px",
                    padding: "2px 6px"
                }}>
                    <DatePicker
                        style={{
                            "--item-font-size": "13px"
                        }}
                        precision='second'
                        min={moment().subtract(100, "years").toDate()}
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
                            value ? moment(value).format('HH:mm:ss') : <span style={{ color: "rgb(177 177 177)" }}>{item.placeholder || (`выберите  ${(item.label) ? item.label.toLowerCase() : "значение"}`)}</span>
                        }
                    </DatePicker>
                </div>
            </div>
        </div>
    )
}
function Boolean({ item, value, onChange, onAfterChange }) {
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
function Float({ item, value, onChange, onAfterChange }) {
    return (
        <div style={{ padding: "5px 0px" }}>
            {(item && item.header !== false) && <div className='bg bg-grey' style={{
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
            </div>}
            <div style={{ display: "flex", justifyContent: "space-between", gap: "5px" }}>
                <div style={{
                    flex: "1",
                    border: "1px solid #e5e5e5",
                    fontSize: "13px",
                    borderRadius: "4px",
                    padding: "2px 6px"
                }}>
                    <Input
                        disabled={(item.view && item.view.disabled) ? item.view.disabled : false}
                        placeholder={item.placeholder || ("введите " + ((item.label) ? item.label.toLowerCase() : "значение"))}
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
function Integer({ item, value, onChange, onAfterChange }) {
    return (
        <div style={{ padding: "5px 0px" }}>
            {(item && item.header !== false) && <div className='bg bg-grey' style={{
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
            </div>}
            <div style={{ display: "flex", justifyContent: "space-between", gap: "5px" }}>
                <div style={{
                    flex: "1",
                    border: "1px solid #e5e5e5",
                    fontSize: "13px",
                    borderRadius: "4px",
                    padding: "2px 6px"
                }}>
                    <Input
                        disabled={(item.view && item.view.disabled) ? item.view.disabled : false}
                        placeholder={item.placeholder || ("введите " + ((item.label) ? item.label.toLowerCase() : "значение"))}
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
function String({ item, value, onChange, onAfterChange }) {
    return (
        <div style={{ padding: "5px 0px" }}>
            {(item && item.header !== false) && <div className='bg bg-grey' style={{
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
            </div>}
            <div style={{ display: "flex", justifyContent: "space-between", gap: "5px" }}>
                <div style={{
                    flex: "1",
                    border: "1px solid #e5e5e5",
                    fontSize: "13px",
                    borderRadius: "4px",
                    padding: "2px 6px"
                }}>
                    <TextArea
                        style={{
                            "--font-size": "14px"
                        }}
                        disabled={(item.view && item.view.disabled) ? item.view.disabled : false}
                        autoSize={{ minRows: 2, maxRows: 5 }}
                        onChange={onChange}
                        value={value || ""}
                        placeholder={item.placeholder || ("введите " + ((item.label) ? item.label.toLowerCase() : "значение"))}
                    />
                </div>
            </div>
        </div>
    )
}
function Password({ item, value, onChange, onAfterChange }) {
    const [visible, setVisible] = useState(false)
    return (
        <div style={{ padding: "5px 0px" }}>
            {(item && item.header !== false) && <div className='bg bg-grey' style={{
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
            </div>}
            <div style={{ display: "flex", justifyContent: "space-between", gap: "5px" }}>
                <div style={{
                    flex: "1",
                    border: "1px solid #e5e5e5",
                    fontSize: "13px",
                    borderRadius: "4px",
                    padding: "2px 6px"
                }}>
                    <div className={styles.password}>
                        <Input
                            value={value}
                            onChange={onChange}
                            className={styles.input}
                            placeholder={item.placeholder || ("введите " + ((item.label) ? item.label.toLowerCase() : "значение"))}
                            type={visible ? 'text' : 'password'}
                        />
                        <div className={styles.eye}>
                            {!visible ? (
                                <EyeInvisibleOutline onClick={() => setVisible(true)} />
                            ) : (
                                <EyeOutline onClick={() => setVisible(false)} />
                            )}
                        </div>
                    </div>
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

export function FieldMobile({ auth, item, value, onChange, onAfterChange, changed }) {
    switch (item.filterType) {
        case "group":
            switch (item.type) {
                case "func":
                    return (props.func) ? props.func(auth, item, value, onChange, onAfterChange) : undefined;
                case "object":
                case "document":
                    return (<GroupObj auth={auth} item={item} value={value} onChange={onChange} onAfterChange={onAfterChange} changed={changed}></GroupObj>)
                default:
                    return (<Unknown auth={auth} item={item} value={value} onChange={onChange} onAfterChange={onAfterChange}></Unknown>)
            }
        case "range":
            switch (item.type) {
                case "func":
                    return (props.func) ? props.func(auth, item, value, onChange, onAfterChange) : undefined;
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
                case "date":
                case "time":
                case "datetime":
                case "time.Time":
                    return (<RangeDate auth={auth} item={item} value={value} onChange={onChange} onAfterChange={onAfterChange}></RangeDate>)
                default:
                    return (<Unknown auth={auth} item={item} value={value} onChange={onChange} onAfterChange={onAfterChange}></Unknown>)
            }
        case "slider":
            switch (item.type) {
                case "func":
                    return (props.func) ? props.func(auth, item, value, onChange, onAfterChange) : undefined;
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
            switch (item.type) {
                case "func":
                    return (props.func) ? props.func(auth, item, value, onChange, onAfterChange) : undefined;
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
                case "action":
                    return (<ActionItem auth={auth} item={item} value={value} onChange={onChange} onAfterChange={onAfterChange}></ActionItem>)
                case "file":
                    return (<UploadItem auth={auth} item={item} value={value} onChange={onChange} onAfterChange={onAfterChange}></UploadItem>)
                // case "imageeditor":
                //     return (<ImageEditor auth={auth} item={item} value={value} onChange={onChange} onAfterChange={onAfterChange}></ImageEditor>)
                case "image":
                    return (<Image auth={auth} item={item} value={value} onChange={onChange} onAfterChange={onAfterChange}></Image>)
                default:
                    return (<Unknown auth={auth} item={item} value={value} onChange={onChange} onAfterChange={onAfterChange}></Unknown>)
            }
    }
}