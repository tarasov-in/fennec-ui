import React, { useState, useEffect, useMemo, useCallback } from 'react';
import 'moment/locale/ru';
import { errorCatch, getDisplay, getLocator, getObjectValue, GETWITH, IfElse, JSXMap, pushStateHistoryModal, QueryDetail, QueryOrder, QueryParam, READWITH } from '../../../Tool';
import moment from 'moment';
import { Checkbox, Input, TextArea, Slider, DatePicker, Button, ImageUploader, Popup, CheckList, SearchBar, Image as AntImage } from 'antd-mobile';
import { useMetaContext } from '../../Context';
import { ActionPickerItem } from '../../Action';


import styles from './index.less'
import { EyeInvisibleOutline, EyeOutline } from 'antd-mobile-icons'
import ImageEditor from '../ImageEditor';
import { useFieldFullReplacement, useFieldPartialReplacement, useFieldReplacement } from '../../../ComponetsReplacement';

var _ = require('lodash');

const isIPhone = new RegExp('\\biPhone\\b|\\biPod\\b', 'i').test(window.navigator.userAgent);
let moneyKeyboardWrapProps;
if (isIPhone) {
    moneyKeyboardWrapProps = {
        onTouchStart: e => e.preventDefault(),
    };
}

function UploadItems({ inputProps, auth, item, value, onChange, changed }) {
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
        maxCount: 10,
        name: 'files',
        multiple: true,
        accept: item.accept,
        onDelete: file => {
            setUrls([]);
            setFiles([]);
        },
        beforeUpload: file => {
            setFiles(o => [...o, file]);
            return file;
        },
    };
    const upload = (file) => {
        return {
            url: URL.createObjectURL(file),
        }
    }
    return (
        <div data-locator={getLocator(item?.name)} className='bg bg-grey' style={{
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
                    {...inputProps}
                >
                    {(item.trigger && _.isFunction(item.trigger)) && item.trigger(item)}
                    {/* {(item.trigger && !_.isFunction(item.trigger)) && content(item)} */}
                </ImageUploader>
            </div>
            {/* <div style={{ flex: "1" }}>
                {content(item)}
            </div> */}
        </div>
    );
}
function UploadItem({ inputProps, auth, item, value, onChange, changed }) {
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
        <div data-locator={getLocator(item?.name)} className='bg bg-grey' style={{
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
                    {...inputProps}
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
function Image({ inputProps, auth, item, value, onChange, changed }) {
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
    }

    return (
        <div data-locator={getLocator(item?.name)} style={{ padding: "5px 0px" }}>
            {(item && item.header !== false) && <div className='bg bg-grey' style={{
                textAlign: "left",
                paddingLeft: "5px",
                marginBottom: "5px",
                display: "flex",
                justifyContent: "space-between"
            }}>
                <div className={(item?.validators?.required)?'item-required':''}>{item?.label}</div>
                <Button fill='none' size='mini' 
                data-locator={getLocator(item?.name, "clear")}
                onClick={(v) => {
                    onChange(null);
                }}>
                    <i className="fa fa-times"></i>
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
                <Button 
                data-locator={getLocator(item?.name, "edit")}
                onClick={onOpenChange} size="small" fill='none'>
                    <i className="fa fa-pencil-square-o"></i>
                </Button>
                <ImageEditor
                    auth={auth}
                    item={item}
                    value={toUrl(value)}
                    onChange={onChange}
                    open={open}
                    close={close}
                    {...inputProps}
                />
            </div>
        </div>
    );
}
function ActionItem({ inputProps, auth, item, value, onChange, onAfterChange, changed }) {
    return (<React.Fragment>
        <ActionPickerItem
        data-locator={getLocator(item?.name)}
            auth={auth}
            mode="input"
            item={item}
            value={value}
            onChange={onChange}
            {...inputProps}
        />
    </React.Fragment>);
}
function RangeDate({ inputProps, item, value, onChange, onAfterChange }) {
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
        <div data-locator={getLocator(item?.name)} style={{ padding: "5px 0px" }}>
            {(item && item.header !== false) && <div className='bg bg-grey'
                style={{
                    textAlign: "left",
                    paddingLeft: "5px",
                    marginBottom: "5px",
                    display: "flex",
                    justifyContent: "space-between"
                }}>
                <div className={(item?.validators?.required)?'item-required':''}>{item?.label}</div>
                <Button fill='none' size='mini' 
                data-locator={getLocator(item?.name, "clear")}
                onClick={(v) => {
                    onChange();
                }}>
                    <i className="fa fa-times"></i>
                </Button>
            </div>}
            <div style={{ display: "flex", justifyContent: "space-between", gap: "5px" }}>
                <div 
                data-locator={getLocator(item?.name,"visible1")}
                onClick={() => {
                    setVisible1(true)
                }} style={{
                    flex: "1",
                    border: "1px solid #e5e5e5",
                    fontSize: "13px",
                    borderRadius: "4px",
                    padding: "2px 6px"
                }}>
                    <DatePicker
                    data-locator={getLocator(item?.name, "input1")}
                        style={{
                            "--item-font-size": "13px"
                        }}
                        precision='day'
                        max={val[1]}
                        min={moment().subtract(100, "years").toDate()}
                        disabled={(item.view && item.view.disabled) ? item.view.disabled : false}
                        title={item?.label}
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
                            value ? moment(value).format('YYYY-MM-DD') : <span style={{ color: "rgb(177 177 177)" }}>{item.placeholder || (`выберите  ${(item?.label) ? item?.label?.toLowerCase() : "значение"}`)}</span>
                        }
                    </DatePicker>
                </div>
                <div 
                data-locator={getLocator(item?.name,"visible2")}
                onClick={() => {
                    setVisible2(true)
                }} style={{
                    flex: "1",
                    border: "1px solid #e5e5e5",
                    fontSize: "13px",
                    borderRadius: "4px",
                    padding: "2px 6px"
                }}>
                    <DatePicker
                    data-locator={getLocator(item?.name,"input2")}
                        style={{
                            "--item-font-size": "13px"
                        }}
                        precision='day'
                        min={val[0]}
                        disabled={(item.view && item.view.disabled) ? item.view.disabled : false}
                        title={item?.label}
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
                            value ? moment(value).format('YYYY-MM-DD') : <span style={{ color: "rgb(177 177 177)" }}>{item.placeholder || (`выберите  ${(item?.label) ? item?.label?.toLowerCase() : "значение"}`)}</span>
                        }
                    </DatePicker>
                </div>
            </div>
        </div>
    )
}
function RangeFloat({ inputProps, item, value, onChange, onAfterChange }) {
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
        <div data-locator={getLocator(item?.name)} style={{ padding: "5px 0px" }}>
            {(item && item.header !== false) && <div className='bg bg-grey' style={{
                textAlign: "left",
                paddingLeft: "5px",
                marginBottom: "5px",
                display: "flex",
                justifyContent: "space-between"
            }}>
                <div className={(item?.validators?.required)?'item-required':''}>{item?.label}</div>
                <Button fill='none' size='mini' 
                data-locator={getLocator(item?.name,"clear")}
                onClick={(v) => {
                    onChange();
                }}>
                    <i className="fa fa-times"></i>
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
                    data-locator={getLocator(item?.name,"left")}
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
                    data-locator={getLocator(item?.name,"right")}
                        type={"number"}
                        onChange={onChangeRight}
                        value={(val && val.length > 1) ? val[1] : def[1]}
                    />
                </div>
            </div>
            <div>
                <Slider
                data-locator={getLocator(item?.name,"input")}
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
function FloatSlider({ inputProps, item, value, onChange, onAfterChange }) {
    const [val, setVal] = useState();
    useEffect(() => {
        setVal(value);
    }, [value]);
    const xstep = item?.step || 1;
    const xmin = item?.min || item?.func?.min || 0;
    const xmax = item?.max || item?.func?.max || 100000;

    return (
        <div data-locator={getLocator(item?.name)} style={{ padding: "5px 0px" }}>
            {(item && item.header !== false) && <div className='bg bg-grey' style={{
                textAlign: "left",
                paddingLeft: "5px",
                marginBottom: "5px",
                display: "flex",
                justifyContent: "space-between"
            }}>
                <div className={(item?.validators?.required)?'item-required':''}>{item?.label}</div>
                <Button
                    disabled={(item && item.view && item.view.disabled) ? item.view.disabled : false}
                    fill='none' size='mini' 
                    data-locator={getLocator(item?.name,"clear")}
                    onClick={(v) => {
                        onChange();
                    }}>
                    <i className="fa fa-times"></i>
                </Button>
            </div>}
            <div>
                <Slider
                data-locator={getLocator(item?.name,"input")}
                    disabled={(item && item.view && item.view.disabled) ? item.view.disabled : false}
                    range
                    min={xmin}
                    max={xmax}
                    step={xstep}
                    value={(item.realtime) ? value : val}
                    onChange={(item.realtime) ? onChange : setVal}
                    onAfterChange={(item.realtime) ? onAfterChange : onChange}
                    {...inputProps}
                />
            </div>
        </div>
    )
}
function RangeInteger({ inputProps, item, value, onChange, onAfterChange }) {
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
        <div data-locator={getLocator(item?.name)} style={{ padding: "5px 0px" }}>
            {(item && item.header !== false) && <div className='bg bg-grey' style={{
                textAlign: "left",
                paddingLeft: "5px",
                marginBottom: "5px",
                display: "flex",
                justifyContent: "space-between"
            }}>
                <div className={(item?.validators?.required)?'item-required':''}>{item?.label}</div>
                <Button fill='none' size='mini'
                data-locator={getLocator(item?.name,"clear")}
                 onClick={(v) => {
                    onChange();
                }}>
                    <i className="fa fa-times"></i>
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
                    data-locator={getLocator(item?.name, "left")}
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
                    data-locator={getLocator(item?.name, "right")}
                        type={"number"}
                        onChange={onChangeRight}
                        value={(val && val.length > 1) ? val[1] : def[1]}
                    />
                </div>
            </div>
            <Slider
            data-locator={getLocator(item?.name, "input")}
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
function IntegerSlider({ inputProps, item, value, onChange, onAfterChange }) {
    const [val, setVal] = useState();
    useEffect(() => {
        setVal(value);
    }, [value]);
    const xstep = item?.step || 1;
    const xmin = item?.min || item?.func?.min || 0;
    const xmax = item?.max || item?.func?.max || 100000;

    return (
        <div data-locator={getLocator(item?.name)} style={{ padding: "5px 0px" }}>
            {(item && item.header !== false) && <div className='bg bg-grey' style={{
                textAlign: "left",
                paddingLeft: "5px",
                marginBottom: "5px",
                display: "flex",
                justifyContent: "space-between"
            }}>
                <div className={(item?.validators?.required)?'item-required':''}>{item?.label}</div>
                <Button
                    disabled={(item && item.view && item.view.disabled) ? item.view.disabled : false}
                    fill='none' size='mini' 
                    data-locator={getLocator(item?.name, "clear")}
                    onClick={(v) => {
                        onChange();
                    }}>
                    <i className="fa fa-times"></i>
                </Button>
            </div>}
            <Slider
            data-locator={getLocator(item?.name, "input")}
                disabled={(item && item.view && item.view.disabled) ? item.view.disabled : false}
                min={xmin}
                max={xmax}
                step={xstep}
                value={(item.realtime) ? value : val}
                onChange={(item.realtime) ? onChange : setVal}
                onAfterChange={(item.realtime) ? onAfterChange : onChange}
                {...inputProps}
            />
        </div>
    )
}
function Obj({ inputProps, auth, item, value, onChange, onAfterChange, changed, contextObject, objectName, partialReplacement }) {
    const [data, setData] = useState([]);
    const meta = useMetaContext();

    const PartialReplacementFunc = useFieldPartialReplacement(_.get(item, "relation.reference.object"), partialReplacement)

    const dataOrContent = (data) => {
        return (data && data.content) ? data.content : (_.has(data, 'content')) ? [] : data
    }
    const by = (item) => {
        if (!!item?.dependence && !!item?.dependence?.field) {
            if (changed) {
                if (!!changed[item.dependence.by] && !!item.dependence.eq) {
                    return changed[item.dependence.by][item.dependence.eq]
                } else if (!!item.dependence.eq) {
                    return changed[item.dependence.eq]
                }
                return null
            }
            return null
        }
    };
    const dependenceValue = by(item);
    const defaultQueryParams = useCallback((filter) => {
        var _dependence = (item.dependence?.mode === "server" && item.dependence?.field && by(item)) ? [QueryParam(`w-${item.dependence?.field}`, by(item))] : []
        if (!filter) {
            return [
                QueryDetail("none"),
                QueryOrder("ID", "ASC"),
                ..._dependence
            ]
        } else if (_.isArray(filter)) {
            return [
                ...filter,
                ..._dependence
            ]
        }
        return [
            ..._dependence
        ]
    }, [item.dependence, changed])
    useEffect(() => {
        if (item.source || item.url || (item && _.get(item, "relation.reference.url")) || (item && _.get(item, "relation.reference.source"))) {
            let filter = item.queryFilter || _.get(item, "relation.reference.queryFilter") || _.get(item, "relation.reference.filter");
            let url = item.source || item.relation.reference.url || item.relation.reference.source;
            GETWITH(auth, url, [
                ...defaultQueryParams(filter),
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
                    ...defaultQueryParams(filter),
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
        item?.relation?.reference?.filter,
        dependenceValue
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
            return data.find(e => _.get(e, item.relation.reference.property) === value);
        }
        return data.find(e => e.ID === value);
    };
    const itemsByProperty = (item, value) => {
        return data?.filter((e) => property(item, e) === value)
        // return data?.filter(e => value?.find(f => property(item, e) === f));
    };
    const labelString = (item, value) => {
        if (item && value) {
            if (item.displayString && _.isFunction(item.displayString)) {
                return item.displayString(value)
            } else if (item.relation && item.relation.displayString && _.isFunction(item.relation.displayString)) {
                return item.relation.displayString(value)
            } else {
                let labeldisplay = label(item, value);
                if (_.isString(labeldisplay)) {
                    return labeldisplay;
                }
                let fieldMeta = meta[getObjectValue(item, "relation.reference.object")];
                let _display = ((item?.relation?.display?.fields) ? item?.relation?.display : undefined) || ((fieldMeta?.display?.fields) ? fieldMeta?.display : undefined)
                return getDisplay(value, _display, fieldMeta, meta)
            }
        }
        return "";
    };
    const label = (item, value) => {
        if (item && value) {
            if (item.display && _.isFunction(item.display)) {
                return item.display(value)
            } else if (item.relation && item.relation.display && _.isFunction(item.relation.display)) {
                return item.relation.display(value)
            } else if (PartialReplacementFunc) {
                return PartialReplacementFunc({ item, value, changed, contextObject, objectName })
            } else {
                let fieldMeta = meta[getObjectValue(item, "relation.reference.object")];
                let _display = ((item?.relation?.display?.fields) ? item?.relation?.display : undefined) || ((fieldMeta?.display?.fields) ? fieldMeta?.display : undefined)
                return getDisplay(value, _display, fieldMeta, meta)
            }
        }
        return "";
    };


    const [searchText, setSearchText] = useState('')
    const [visible, setVisible] = React.useState(false)
    const filteredItems = useMemo(() => {
        if (searchText) {
            return data.filter(i => {
                let l = labelString(item, i).toLowerCase();
                return l.includes(searchText?.toLowerCase())
            })
        } else {
            return data
        }
    }, [data, searchText])

    const elements = useCallback((data) => {
        if (item.dependence?.mode !== "server" && item.dependence) {
            if (item.dependence.field && by(item)) {
                return data?.filter(e => _.get(e, item.dependence.field) === by(item))?.map(i => (
                    <CheckList.Item
                        data-locator={getLocator(item?.name || objectName, itemByProperty(item, i))}
                        key={property(item, i)} value={property(item, i)} label={labelString(item, i)}>{label(item, i)}</CheckList.Item>
                ));
            }
        } else {
            return data?.map(i => (
                <CheckList.Item
                    data-locator={getLocator(item?.name || objectName, itemByProperty(item, i))}
                    key={property(item, i)} value={property(item, i)} label={labelString(item, i)}>{label(item, i)}</CheckList.Item>
            ));
        }
    }, [value, changed]);
    const current = React.useMemo(() => {
        // return data?.filter((e) => value?.find(f => property(item, e) === f))
        return data?.filter((e) => property(item, e) === value)
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
                <div className={(item?.validators?.required)?'item-required':''}>{item?.label}</div>
                <Button fill='none' size='mini' onClick={(v) => {
                    onChange(undefined, item, undefined);
                }}>
                    <i className="fa fa-times"></i>
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
                                    <div className={(item?.validators?.required)?'item-required':''}>{item?.label}</div>
                                </div>
                            </div>
                            <div style={{ flex: "0", padding: "0 10px" }}>
                                <SearchBar
                                    data-locator={getLocator(item?.name || objectName, "search")}
                                    value={searchText}
                                    onChange={v => {
                                        setSearchText(v)
                                    }}
                                />
                            </div>
                            <div style={{ overflowY: 'scroll', flex: "1", height: "100%" }}>
                                <div style={{ height: "100%", padding: "0px 15px 15px 15px" }}>
                                    <CheckList /*multiple*/ defaultValue={[value]}
                                        data-locator={getLocator(item?.name || objectName, "list")}
                                        onChange={e => {
                                            // onChange(e, item, itemsByProperty(item, e))
                                            onChange(_.head(e), item, itemByProperty(item, _.head(e)));
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
                    </span> : <span style={{ color: "rgb(177 177 177)" }}>{item.placeholder || (`выберите  ${(item?.label) ? item?.label?.toLowerCase() : "значение"}`)}</span>}
                </div>
            </div >
        </div >
    )
}
function GroupObj({ inputProps, auth, item, value, onChange, onAfterChange, changed, contextObject, objectName, partialReplacement }) {
    const [data, setData] = useState([]);
    const meta = useMetaContext();

    const PartialReplacementFunc = useFieldPartialReplacement(_.get(item, "relation.reference.object"), partialReplacement)

    const dataOrContent = (data) => {
        return (data && data.content) ? data.content : (_.has(data, 'content')) ? [] : data
    }
    const by = (item) => {
        if (!!item?.dependence && !!item?.dependence?.field) {
            if (changed) {
                if (!!changed[item.dependence.by] && !!item.dependence.eq) {
                    return changed[item.dependence.by][item.dependence.eq]
                } else if (!!item.dependence.eq) {
                    return changed[item.dependence.eq]
                }
                return null
            }
            return null
        }
    };
    const dependenceValue = by(item);
    const defaultQueryParams = useCallback((filter) => {
        var _dependence = (item.dependence?.mode === "server" && item.dependence?.field && by(item)) ? [QueryParam(`w-${item.dependence?.field}`, by(item))] : []
        if (!filter) {
            return [
                QueryDetail("none"),
                QueryOrder("ID", "ASC"),
                ..._dependence
            ]
        } else if (_.isArray(filter)) {
            return [
                ...filter,
                ..._dependence
            ]
        }
        return [
            ..._dependence
        ]
    }, [item.dependence, changed])
    useEffect(() => {
        if (item.source || item.url || (item && _.get(item, "relation.reference.url")) || (item && _.get(item, "relation.reference.source"))) {
            let filter = item.queryFilter || _.get(item, "relation.reference.queryFilter") || _.get(item, "relation.reference.filter");
            let url = item.source || item.relation.reference.url || item.relation.reference.source;
            GETWITH(auth, url, [
                ...defaultQueryParams(filter),
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
                    ...defaultQueryParams(filter),
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
        item?.relation?.reference?.filter,
        dependenceValue
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
    const labelString = (item, value) => {
        if (item && value) {
            if (item.displayString && _.isFunction(item.displayString)) {
                return item.displayString(value)
            } else if (item.relation && item.relation.displayString && _.isFunction(item.relation.displayString)) {
                return item.relation.displayString(value)
            } else {
                let labeldisplay = label(item, value);
                if (_.isString(labeldisplay)) {
                    return labeldisplay;
                }
                let fieldMeta = meta[getObjectValue(item, "relation.reference.object")];
                let _display = ((item?.relation?.display?.fields) ? item?.relation?.display : undefined) || ((fieldMeta?.display?.fields) ? fieldMeta?.display : undefined)
                return getDisplay(value, _display, fieldMeta, meta)
            }
        }
        return "";
    };
    const label = (item, value) => {
        if (item && value) {
            if (item.display && _.isFunction(item.display)) {
                return item.display(value)
            } else if (item.relation && item.relation.display && _.isFunction(item.relation.display)) {
                return item.relation.display(value)
            } else if (PartialReplacementFunc) {
                return PartialReplacementFunc({ item, value, changed, contextObject, objectName })
            } else {
                let fieldMeta = meta[getObjectValue(item, "relation.reference.object")];
                let _display = ((item?.relation?.display?.fields) ? item?.relation?.display : undefined) || ((fieldMeta?.display?.fields) ? fieldMeta?.display : undefined)
                return getDisplay(value, _display, fieldMeta, meta)
            }
        }
        return "";
    };

    const [searchText, setSearchText] = useState('')
    const [visible, setVisible] = React.useState(false)
    const filteredItems = useMemo(() => {
        if (searchText) {
            return data.filter(i => {
                let l = labelString(item, i).toLowerCase();
                return l.includes(searchText?.toLowerCase())
            })
        } else {
            return data
        }
    }, [data, searchText])
    const elements = useCallback((data) => {
        if (item.dependence?.mode !== "server" && item.dependence) {
            if (item.dependence.field && by(item)) {
                return data?.filter(e => _.get(e, item.dependence.field) === by(item))?.map(i => (
                    <CheckList.Item
                        data-locator={getLocator(item?.name || objectName, itemByProperty(item, i))}
                        key={property(item, i)} value={property(item, i)} label={labelString(item, i)}>{label(item, i)}</CheckList.Item>
                ));
            }
        } else {
            return data?.map(i => (
                <CheckList.Item
                    data-locator={getLocator(item?.name || objectName, itemByProperty(item, i))}
                    key={property(item, i)} value={property(item, i)} label={labelString(item, i)}>{label(item, i)}</CheckList.Item>
            ));
        }
    }, [value, changed]);
    const current = React.useMemo(() => {
        return data?.filter((e) => value?.find(f => property(item, e) === f))
        // return data?.find((e) => e.value == value)?.label
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
                <div className={(item?.validators?.required)?'item-required':''}>{item?.label}</div>
                <Button fill='none' size='mini' onClick={(v) => {
                    onChange(undefined, item, undefined);
                }}>
                    <i className="fa fa-times"></i>
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
                                    <div className={(item?.validators?.required)?'item-required':''}>{item?.label}</div>
                                </div>
                            </div>
                            <div style={{ flex: "0", padding: "0 10px" }}>
                                <SearchBar
                                    data-locator={getLocator(item?.name || objectName, "search")}
                                    value={searchText}
                                    onChange={v => {
                                        setSearchText(v)
                                    }}
                                />
                            </div>
                            <div style={{ overflowY: 'scroll', flex: "1", height: "100%" }}>
                                <div style={{ height: "100%", padding: "0px 15px 15px 15px" }}>
                                    <CheckList multiple defaultValue={value}
                                        data-locator={getLocator(item?.name || objectName, "list")}
                                        onChange={e => {
                                            onChange(e, item, itemsByProperty(item, e))
                                            // onChange(_.head(e), item, _.head(itemsByProperty(item, e)));
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
                    </span> : <span style={{ color: "rgb(177 177 177)" }}>{item.placeholder || (`выберите  ${(item?.label) ? item?.label?.toLowerCase() : "значение"}`)}</span>}
                </div>
            </div >
        </div >
    )
}
function Date({ inputProps, item, value, onChange, onAfterChange }) {
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
        <div data-locator={getLocator(item?.name)} style={{ padding: "5px 0px" }}>
            {(item && item.header !== false) && <div className='bg bg-grey' style={{
                textAlign: "left",
                paddingLeft: "5px",
                marginBottom: "5px",
                display: "flex",
                justifyContent: "space-between"
            }}>
                <div className={(item?.validators?.required)?'item-required':''}>{item?.label}</div>
                <Button fill='none' size='mini' data-locator={getLocator(item?.name, "clear")} onClick={(v) => {
                    onChange();
                }}>
                    <i className="fa fa-times"></i>
                </Button>
            </div>}
            <div style={{ display: "flex", justifyContent: "space-between", gap: "5px" }}>
                <div data-locator={getLocator(item?.name, "visible")} onClick={() => {
                    setVisible(true)
                }} style={{
                    flex: "1",
                    border: "1px solid #e5e5e5",
                    fontSize: "13px",
                    borderRadius: "4px",
                    padding: "2px 6px"
                }}>
                    <DatePicker
                        data-locator={getLocator(item?.name, "input")}
                        style={{
                            "--item-font-size": "13px"
                        }}
                        precision='day'
                        min={moment().subtract(100, "years").toDate()}
                        disabled={(item.view && item.view.disabled) ? item.view.disabled : false}
                        title={item?.label}
                        confirmText={item.okText || "Выбрать"}
                        cancelText={item.dismissText || "Отмена"}
                        visible={visible}
                        onClose={() => {
                            setVisible(false)
                        }}
                        onConfirm={value => onChange(moment(value))}
                        value={val || null}
                        {...inputProps}
                    >
                        {value =>
                            value ? moment(value).format('YYYY-MM-DD') : <span style={{ color: "rgb(177 177 177)" }}>{item.placeholder || (`выберите  ${(item?.label) ? item?.label?.toLowerCase() : "значение"}`)}</span>
                        }
                    </DatePicker>
                </div>
            </div>
        </div>
    )
}
function DateTime({ inputProps, item, value, onChange, onAfterChange }) {
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
        <div data-locator={getLocator(item?.name)} style={{ padding: "5px 0px" }}>
            {(item && item.header !== false) && <div className='bg bg-grey' style={{
                textAlign: "left",
                paddingLeft: "5px",
                marginBottom: "5px",
                display: "flex",
                justifyContent: "space-between"
            }}>
                <div className={(item?.validators?.required)?'item-required':''}>{item?.label}</div>
                <Button fill='none' size='mini' data-locator={getLocator(item?.name, "clear")} onClick={(v) => {
                    onChange();
                }}>
                    <i className="fa fa-times"></i>
                </Button>
            </div>}
            <div style={{ display: "flex", justifyContent: "space-between", gap: "5px" }}>
                <div data-locator={getLocator(item?.name, "visible")} onClick={() => {
                    setVisible(true)
                }} style={{
                    flex: "1",
                    border: "1px solid #e5e5e5",
                    fontSize: "13px",
                    borderRadius: "4px",
                    padding: "2px 6px"
                }}>
                    <DatePicker
                        data-locator={getLocator(item?.name, "input")}
                        style={{
                            "--item-font-size": "13px"
                        }}
                        precision='minute'
                        min={moment().subtract(100, "years").toDate()}
                        disabled={(item.view && item.view.disabled) ? item.view.disabled : false}
                        title={item?.label}
                        confirmText={item.okText || "Выбрать"}
                        cancelText={item.dismissText || "Отмена"}
                        visible={visible}
                        onClose={() => {
                            setVisible(false)
                        }}
                        onConfirm={value => onChange(moment(value))}
                        value={val || null}
                        {...inputProps}
                    >
                        {value =>
                            value ? moment(value).format('YYYY-MM-DD HH:mm:ss') : <span style={{ color: "rgb(177 177 177)" }}>{item.placeholder || (`выберите  ${(item?.label) ? item?.label?.toLowerCase() : "значение"}`)}</span>
                        }
                    </DatePicker>
                </div>
            </div>
        </div>
    )
}
function Time({ inputProps, item, value, onChange, onAfterChange }) {
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
        <div data-locator={getLocator(item?.name)} style={{ padding: "5px 0px" }}>
            {(item && item.header !== false) && <div className='bg bg-grey' style={{
                textAlign: "left",
                paddingLeft: "5px",
                marginBottom: "5px",
                display: "flex",
                justifyContent: "space-between"
            }}>
                <div className={(item?.validators?.required)?'item-required':''}>{item?.label}</div>
                <Button fill='none' size='mini' data-locator={getLocator(item?.name, "clear")} onClick={(v) => {
                    onChange();
                }}>
                    <i className="fa fa-times"></i>
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
                        data-locator={getLocator(item?.name, "input")}
                        style={{
                            "--item-font-size": "13px"
                        }}
                        precision='second'
                        min={moment().subtract(100, "years").toDate()}
                        disabled={(item.view && item.view.disabled) ? item.view.disabled : false}
                        title={item?.label}
                        confirmText={item.okText || "Выбрать"}
                        cancelText={item.dismissText || "Отмена"}
                        visible={visible}
                        onClose={() => {
                            setVisible(false)
                        }}
                        onConfirm={value => onChange(moment(value))}
                        value={val || null}
                        {...inputProps}
                    >
                        {value =>
                            value ? moment(value).format('HH:mm:ss') : <span style={{ color: "rgb(177 177 177)" }}>{item.placeholder || (`выберите  ${(item?.label) ? item?.label?.toLowerCase() : "значение"}`)}</span>
                        }
                    </DatePicker>
                </div>
            </div>
        </div>
    )
}
function Boolean({ inputProps, item, value, onChange, onAfterChange }) {
    return (
        <Checkbox
            data-locator={getLocator(item?.name)}
            disabled={(item.view && item.view.disabled) ? item.view.disabled : false}
            onChange={onChange}
            checked={value}
            {...inputProps}
        >
            {item?.label}
        </Checkbox>
    )
}
function Float({ inputProps, item, value, onChange, onAfterChange }) {
    return (
        <div data-locator={getLocator(item?.name)} style={{ padding: "5px 0px" }}>
            {(item && item.header !== false) && <div className='bg bg-grey' style={{
                textAlign: "left",
                paddingLeft: "5px",
                marginBottom: "5px",
                display: "flex",
                justifyContent: "space-between"
            }}>
                <div className={(item?.validators?.required)?'item-required':''}>{item?.label}</div>
                <Button fill='none' size='mini' data-locator={getLocator(item?.name, "clear")} onClick={(v) => {
                    onChange();
                }}>
                    <i className="fa fa-times"></i>
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
                        data-locator={getLocator(item?.name, "input")}
                        disabled={(item.view && item.view.disabled) ? item.view.disabled : false}
                        placeholder={item.placeholder || ("введите " + ((item?.label) ? item?.label?.toLowerCase() : "значение"))}
                        // clearable
                        onChange={v => {
                            if (!isNaN(v)) {
                                onChange(v);
                            }
                        }}
                        value={value || ""}
                        {...inputProps}
                    />
                </div>
            </div>
        </div>
    )
}
function Integer({ inputProps, item, value, onChange, onAfterChange }) {
    return (
        <div data-locator={getLocator(item?.name)} style={{ padding: "5px 0px" }}>
            {(item && item.header !== false) && <div className='bg bg-grey' style={{
                textAlign: "left",
                paddingLeft: "5px",
                marginBottom: "5px",
                display: "flex",
                justifyContent: "space-between"
            }}>
                <div className={(item?.validators?.required)?'item-required':''}>{item?.label}</div>
                <Button fill='none' size='mini' data-locator={getLocator(item?.name, "clear")} onClick={(v) => {
                    onChange();
                }}>
                    <i className="fa fa-times"></i>
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
                        data-locator={getLocator(item?.name, "input")}
                        disabled={(item.view && item.view.disabled) ? item.view.disabled : false}
                        placeholder={item.placeholder || ("введите " + ((item?.label) ? item?.label?.toLowerCase() : "значение"))}
                        // clearable
                        onChange={v => {
                            if (!isNaN(v) && _.isInteger(+v)) {
                                onChange("" + (+v));
                            }
                        }}
                        value={value || ""}
                        {...inputProps}
                    />
                </div>
            </div>
        </div>
    )
}
function String({ inputProps, item, value, onChange, onAfterChange }) {
    return (
        <div data-locator={getLocator(item?.name)} style={{ padding: "5px 0px" }}>
            {(item && item.header !== false) && <div className='bg bg-grey' style={{
                textAlign: "left",
                paddingLeft: "5px",
                marginBottom: "5px",
                display: "flex",
                justifyContent: "space-between"
            }}>
                <div className={(item?.validators?.required)?'item-required':''}>{item?.label}</div>
                <Button fill='none' size='mini' data-locator={getLocator(item?.name, "clean")} onClick={(v) => {
                    onChange();
                }}>
                    <i className="fa fa-times"></i>
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
                        data-locator={getLocator(item?.name, "input")}
                        style={{
                            "--font-size": "14px"
                        }}
                        disabled={(item.view && item.view.disabled) ? item.view.disabled : false}
                        autoSize={{ minRows: 2, maxRows: 5 }}
                        onChange={onChange}
                        value={value || ""}
                        placeholder={item.placeholder || ("введите " + ((item?.label) ? item?.label?.toLowerCase() : "значение"))}
                        {...inputProps}
                    />
                </div>
            </div>
        </div>
    )
}

function Password({ inputProps, item, value, onChange, onAfterChange }) {
    const [visible, setVisible] = useState(false)
    return (
        <div data-locator={getLocator(item?.name)} style={{ padding: "5px 0px" }}>
            {(item && item.header !== false) && <div className='bg bg-grey' style={{
                textAlign: "left",
                paddingLeft: "5px",
                marginBottom: "5px",
                display: "flex",
                justifyContent: "space-between"
            }}>
                <div className={(item?.validators?.required)?'item-required':''}>{item?.label}</div>
                <Button fill='none' size='mini' data-locator={getLocator(item?.name, "clear")} onClick={(v) => {
                    onChange();
                }}>
                    <i className="fa fa-times"></i>
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
                            data-locator={getLocator(item?.name, "input")}
                            value={value}
                            onChange={onChange}
                            className={styles.input}
                            placeholder={item.placeholder || ("введите " + ((item?.label) ? item?.label?.toLowerCase() : "значение"))}
                            type={visible ? 'text' : 'password'}
                            {...inputProps}
                        />
                        <div className={styles.eye}>
                            {!visible ? (
                                <EyeInvisibleOutline data-locator={getLocator(item?.name, "visible")} onClick={() => setVisible(true)} />
                            ) : (
                                <EyeOutline data-locator={getLocator(item?.name, "unvisible")} onClick={() => setVisible(false)} />
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
            {item?.label} - {item.name}
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

export function FieldMobile({ auth, item, value, onChange, onAfterChange, changed, isChanged, partialReplacement,
    fullReplacement, contextObject, objectName, data, inputProps }) {
    // const FullReplacementFunc = useFieldReplacement(item?.name, fullReplacement)
    // const FullReplacementFunc = useFieldFullReplacement(item?.name, fullReplacement)
    let type = ((item.view) ? item.view.type : undefined) || item.type;
    const FullReplacementFunc = useFieldFullReplacement(type, fullReplacement)
    if (FullReplacementFunc) {
        return (<FullReplacementFunc {...inputProps} data={data} auth={auth} partialReplacement={partialReplacement} contextObject={contextObject} objectName={objectName} item={item} value={value} onChange={onChange} onAfterChange={onAfterChange} isChanged={isChanged} changed={changed} />)
    }
    switch (item.filterType) {
        case "group":
            switch (item.type) {
                case "func":
                    return (props?.item?.render) ? props?.item?.render(auth, item, value, onChange, onAfterChange, isChanged, { partialReplacement, contextObject, objectName, data }) : undefined;
                case "object":
                case "document":
                    return (<GroupObj {...inputProps} auth={auth} partialReplacement={partialReplacement} contextObject={contextObject} objectName={objectName} item={item} value={value} onChange={onChange} onAfterChange={onAfterChange} isChanged={isChanged} changed={changed}></GroupObj>)
                default:
                    return (<Unknown {...inputProps} auth={auth} partialReplacement={partialReplacement} contextObject={contextObject} objectName={objectName} item={item} value={value} onChange={onChange} onAfterChange={onAfterChange} isChanged={isChanged}></Unknown>)
            }
        case "range":
            switch (item.type) {
                case "func":
                    return (props?.item?.render) ? props?.item?.render(auth, item, value, onChange, onAfterChange, isChanged, { partialReplacement, contextObject, objectName, data }) : undefined;
                case "int":
                case "uint":
                case "integer":
                case "int64":
                case "int32":
                case "uint64":
                case "uint32":
                    return (<RangeInteger {...inputProps} auth={auth} partialReplacement={partialReplacement} contextObject={contextObject} objectName={objectName} item={item} value={value} onChange={onChange} onAfterChange={onAfterChange} isChanged={isChanged}></RangeInteger>)
                case "double":
                case "float":
                case "float64":
                case "float32":
                    return (<RangeFloat {...inputProps} auth={auth} partialReplacement={partialReplacement} contextObject={contextObject} objectName={objectName} item={item} value={value} onChange={onChange} onAfterChange={onAfterChange} isChanged={isChanged}></RangeFloat>)
                case "date":
                case "time":
                case "datetime":
                case "time.Time":
                    return (<RangeDate {...inputProps} auth={auth} partialReplacement={partialReplacement} contextObject={contextObject} objectName={objectName} item={item} value={value} onChange={onChange} onAfterChange={onAfterChange} isChanged={isChanged}></RangeDate>)
                default:
                    return (<Unknown {...inputProps} auth={auth} partialReplacement={partialReplacement} contextObject={contextObject} objectName={objectName} item={item} value={value} onChange={onChange} onAfterChange={onAfterChange} isChanged={isChanged}></Unknown>)
            }
        case "slider":
            switch (item.type) {
                case "func":
                    return (props?.item?.render) ? props?.item?.render(auth, item, value, onChange, onAfterChange, isChanged, { partialReplacement, contextObject, objectName, data }) : undefined;
                case "int":
                case "uint":
                case "integer":
                case "int64":
                case "int32":
                case "uint64":
                case "uint32":
                    return (<IntegerSlider {...inputProps} auth={auth} partialReplacement={partialReplacement} contextObject={contextObject} objectName={objectName} item={item} value={value} onChange={onChange} onAfterChange={onAfterChange} isChanged={isChanged}></IntegerSlider>)
                case "double":
                case "float":
                case "float64":
                case "float32":
                    return (<FloatSlider {...inputProps} auth={auth} partialReplacement={partialReplacement} contextObject={contextObject} objectName={objectName} item={item} value={value} onChange={onChange} onAfterChange={onAfterChange} isChanged={isChanged}></FloatSlider>)
                default:
                    return (<Unknown {...inputProps} auth={auth} partialReplacement={partialReplacement} contextObject={contextObject} objectName={objectName} item={item} value={value} onChange={onChange} onAfterChange={onAfterChange} isChanged={isChanged}></Unknown>)
            }
        default:
            switch (item.type) {
                case "func":
                    return (props?.item?.render) ? props?.item?.render(auth, item, value, onChange, onAfterChange, isChanged, { partialReplacement, contextObject, objectName, data }) : undefined;
                case "string":
                    return (<String {...inputProps} auth={auth} partialReplacement={partialReplacement} contextObject={contextObject} objectName={objectName} item={item} value={value} onChange={onChange} onAfterChange={onAfterChange} isChanged={isChanged}></String>)
                case "password":
                    return (<Password {...inputProps} auth={auth} partialReplacement={partialReplacement} contextObject={contextObject} objectName={objectName} item={item} value={value} onChange={onChange} onAfterChange={onAfterChange} isChanged={isChanged}></Password>)
                case "int":
                case "uint":
                case "integer":
                case "int64":
                case "int32":
                case "uint64":
                case "uint32":
                    return (<Integer {...inputProps} auth={auth} partialReplacement={partialReplacement} contextObject={contextObject} objectName={objectName} item={item} value={value} onChange={onChange} onAfterChange={onAfterChange} isChanged={isChanged}></Integer>)
                case "double":
                case "float":
                case "float64":
                case "float32":
                    return (<Float {...inputProps} auth={auth} partialReplacement={partialReplacement} contextObject={contextObject} objectName={objectName} item={item} value={value} onChange={onChange} onAfterChange={onAfterChange} isChanged={isChanged}></Float>)
                case "boolean":
                case "bool":
                    return (<Boolean {...inputProps} auth={auth} partialReplacement={partialReplacement} contextObject={contextObject} objectName={objectName} item={item} value={value} onChange={onChange} onAfterChange={onAfterChange} isChanged={isChanged}></Boolean>)
                case "time":
                    return (<Time {...inputProps} auth={auth} partialReplacement={partialReplacement} contextObject={contextObject} objectName={objectName} item={item} value={value} onChange={onChange} onAfterChange={onAfterChange} isChanged={isChanged}></Time>)
                case "date":
                    return (<Date {...inputProps} auth={auth} partialReplacement={partialReplacement} contextObject={contextObject} objectName={objectName} item={item} value={value} onChange={onChange} onAfterChange={onAfterChange} isChanged={isChanged}></Date>)
                case "datetime":
                case "time.Time":
                    return (<DateTime {...inputProps} auth={auth} partialReplacement={partialReplacement} contextObject={contextObject} objectName={objectName} item={item} value={value} onChange={onChange} onAfterChange={onAfterChange} isChanged={isChanged}></DateTime>)
                case "object":
                case "document":
                    return (<Obj {...inputProps} auth={auth} partialReplacement={partialReplacement} contextObject={contextObject} objectName={objectName} item={item} value={value} onChange={onChange} onAfterChange={onAfterChange} isChanged={isChanged} changed={changed}></Obj>)
                case "action":
                    return (<ActionItem {...inputProps} auth={auth} partialReplacement={partialReplacement} contextObject={contextObject} objectName={objectName} item={item} value={value} onChange={onChange} onAfterChange={onAfterChange} isChanged={isChanged}></ActionItem>)
                case "file":
                    return (<UploadItem {...inputProps} auth={auth} partialReplacement={partialReplacement} contextObject={contextObject} objectName={objectName} item={item} value={value} onChange={onChange} onAfterChange={onAfterChange} isChanged={isChanged}></UploadItem>)
                case "files":
                    return (<UploadItems {...inputProps} auth={auth} partialReplacement={partialReplacement} contextObject={contextObject} objectName={objectName} item={item} value={value} onChange={onChange} onAfterChange={onAfterChange} isChanged={isChanged}></UploadItems>)
                // case "imageeditor":
                //     return (<ImageEditor {...inputProps} auth={auth} partialReplacement={partialReplacement} contextObject={contextObject} objectName={objectName} item={item} value={value} onChange={onChange} onAfterChange={onAfterChange} isChanged={isChanged}></ImageEditor>)
                case "image":
                    return (<Image {...inputProps} auth={auth} partialReplacement={partialReplacement} contextObject={contextObject} objectName={objectName} item={item} value={value} onChange={onChange} onAfterChange={onAfterChange} isChanged={isChanged}></Image>)
                default:
                    return (<Unknown {...inputProps} auth={auth} partialReplacement={partialReplacement} contextObject={contextObject} objectName={objectName} item={item} value={value} onChange={onChange} onAfterChange={onAfterChange} isChanged={isChanged}></Unknown>)
            }
    }
}