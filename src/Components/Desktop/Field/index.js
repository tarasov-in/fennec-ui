import React, { useState, useEffect, useMemo, useCallback, Children } from 'react';
import locale from 'antd/es/date-picker/locale/ru_RU';
import {
    Input,
    Select,
    Checkbox,
    DatePicker,
    InputNumber,
    TimePicker,
    Slider,
    Upload,
    Image as AntImage,
    Button,
    Space,
    Spin,
} from 'antd';
import { clean, deleteInArray, errorCatch, getDisplay, getLocator, getObjectValue, GETWITH, JSXMap, pushStateHistoryModal, QueryDetail, QueryOrder, QueryParam, READWITH, unwrap, updateInArray, useHover } from '../../../Tool';
import { useMetaContext } from '../../Context';
import { InboxOutlined } from '@ant-design/icons';
import { EyeInvisibleOutlined, EyeTwoTone, UploadOutlined } from '@ant-design/icons';
import ImageEditor from '../ImageEditor';

import dayjs from 'dayjs'
import 'dayjs/locale/ru'
import weekday from "dayjs/plugin/weekday"
import localeData from "dayjs/plugin/localeData"
import { Model } from '../Model';
import { Action } from '../../Action';
import { CollectionServer } from '../CollectionServer';
import { DropdownAction } from '../DropdownAction';
import { useFieldFullReplacement, useFieldPartialReplacement } from '../../../ComponetsReplacement';
import uuid from 'react-uuid';
var utc = require('dayjs/plugin/utc')
var timezone = require('dayjs/plugin/timezone') // dependent on utc plugin
dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.locale('ru');
dayjs.extend(weekday)
dayjs.extend(localeData)

var _ = require('lodash');
const { Dragger } = Upload;
const { TextArea } = Input;
const { Option } = Select;

function FieldLayout({ formItem, auth, item, children, style }) {
    return (<div style={style}>
        <div>
            {(item?.label && !formItem) && <div style={{}}>{item?.label}</div>}
            {(item?.description && item?.description !== item?.label) && <div style={{ color: "rgb(140, 152, 164)", fontSize: "12px" }}>
                {item?.description}
            </div>}
        </div>
        {children}
    </div>)
}
function ActionsSpace(props) {
    const { children, item, data, setData, objectName, auth, contextObject, value, onChange, loading, setLoading,
        partialReplacement,
        property: _property,
        label: _label,
        itemByProperty: _itemByProperty
    } = props;
    const meta = useMetaContext();
    const PartialReplacementFunc = useFieldPartialReplacement(item?.type, partialReplacement)

    const property = _property || ((item, value) => {
        if (item?.type == "object" || item?.type == "document") {
            if (item && _.get(item, "relation.reference.property") && value) {
                return value[item.relation.reference.property];
            }
            if (value) {
                return value.ID;
            }
        } else {
            return value;
        }
        return undefined;
    });
    const itemByProperty = _itemByProperty || ((item, value) => {
        if (item?.type == "object" || item?.type == "document") {
            if (_.get(item, "relation.reference.property")) {
                return data.find(e => e[item.relation.reference.property] === value);
            }
            if (data?.length) {
                return data.find(e => e.ID === value);
            }
        } else {
            return value;
        }
    });
    const label = _label || ((item, value) => {
        if (item && value) {
            if (item.display && _.isFunction(item.display)) {
                return item.display(value)
            } else if (item.relation && item.relation.display && _.isFunction(item.relation.display)) {
                return item.relation.display(value)
            } else if (PartialReplacementFunc) {
                return PartialReplacementFunc({ item, value, changed, contextObject, objectName })
            } else if (item?.type == "object" || item?.type == "document") {
                let fieldMeta = meta[getObjectValue(item, "relation.reference.object")];
                let _display = ((item?.relation?.display?.fields) ? item?.relation?.display : undefined) || ((fieldMeta?.display?.fields) ? fieldMeta?.display : undefined)
                return getDisplay(value, _display, fieldMeta, meta)
            } else {
                return "" + value;
            }
        }
        return "";
    });
    const labelString = (item, value) => {
        if (item && value) {
            if (item.displayString && _.isFunction(item.displayString)) {
                return item.displayString(value)
            } else if (item.relation && item.relation.displayString && _.isFunction(item.relation.displayString)) {
                return item.relation.displayString(value)
            } else if (item?.type == "object" || item?.type == "document") {
                let labeldisplay = label(item, value);
                if (_.isString(labeldisplay)) {
                    return labeldisplay;
                }
                let fieldMeta = meta[getObjectValue(item, "relation.reference.object")];
                let _display = ((item?.relation?.display?.fields) ? item?.relation?.display : undefined) || ((fieldMeta?.display?.fields) ? fieldMeta?.display : undefined)
                return getDisplay(value, _display, fieldMeta, meta)
            } else {
                return "" + value;
            }
        }
        return "";
    };

    const RendeActions = React.useCallback(() => {
        if (!item?.actions) return <React.Fragment></React.Fragment>;
        let values = clean(unwrap(item?.actions(value, item, meta)));
        if (!values || !values.length) return <React.Fragment></React.Fragment>;
        return values?.map((e, idx) => {
            if (_.isFunction(e)) {
                return (e({
                    collection: data,
                    setCollection: setData,
                    objectName: objectName,
                    contextObject: contextObject,
                    setCollectionItem: (item, first) => (!setData) ? undefined : setData(o => updateInArray(o, item, first)),
                    removeCollectionItem: (item) => (!setData) ? undefined : setData(o => deleteInArray(o, item)),
                    // onSelection,
                    // isSelected,
                    lock: () => (!setLoading) ? undefined : setLoading(true),
                    unlock: () => (!setLoading) ? undefined : setLoading(false),
                    loading,
                    property: (obj) => property(item, obj),
                    label: (obj) => label(item, obj),
                    itemByProperty: (value) => itemByProperty(item, value),
                    apply: (obj) => onChange(value, item, itemByProperty(item, value)),
                    // update
                }, idx))
            }

            return (<Action
                key={e.key || idx}
                // key={e.uid || idx}
                auth={auth}
                mode={"button"}
                disabled={loading || (item && item.view && item.view.disabled) ? item.view.disabled : false}
                item={item}
                locator={item?.name || objectName}
                object={e.object || itemByProperty(item, value)}
                objectName={objectName}
                contextObject={contextObject}
                collection={data}
                setCollection={setData}
                property={(obj) => property(item, obj)}
                label={(obj) => label(item, obj)}
                itemByProperty={(value) => itemByProperty(item, value)}
                apply={(obj) => onChange(property(item, obj), item, obj)}
                lock={() => (!setLoading) ? undefined : setLoading(true)}
                unlock={() => (!setLoading) ? undefined : setLoading(false)}
                
                {...e}
            />)
        });
    }, [item, data, loading, value, meta, contextObject, objectName]);

    const RenderDropdownActions = React.useCallback(() => {
        if (!item?.dropdownActions) return <React.Fragment></React.Fragment>;
        let values = clean(unwrap(item?.dropdownActions(value, item, meta)));
        if (!values || !values.length) return <React.Fragment></React.Fragment>;
        return <DropdownAction
            button={() => (<Button type="default">
                <i className="fa fa-ellipsis-v"></i>
                {/* <i className="fa fa-ellipsis-h"></i> */}
                {/* <i className="fa fa-angle-down"></i> */}
                {/* <i className="fa fa-chevron-down"></i> */}
                {/* <i className="fa fa-caret-down"></i> */}
                {/* <i className="fa fa-bars"></i> */}
                {/* <i className="fa fa-caret-square-o-down"></i> */}
            </Button>)}
            locator={item?.name || objectName}
            object={itemByProperty(item, value)}
            items={values?.map((e, idx) => ({
                key: e.key || idx,
                auth: auth,
                mode: "MenuItem",
                disabled: loading || (item && item.view && item.view.disabled) ? item.view.disabled : false,
                item: item,
                locator: item?.name || objectName,
                object: e.object || itemByProperty(item, value),
                objectName: objectName,
                contextObject: contextObject,
                collection: data,
                setCollection: setData,
                property: (obj) => property(item, obj),
                label: (obj) => label(item, obj),
                itemByProperty: (value) => itemByProperty(item, value),
                apply: (obj) => onChange(property(item, obj), item, obj),
                lock: () => (!setLoading) ? undefined : setLoading(true),
                unlock: () => (!setLoading) ? undefined : setLoading(false),
                ...e
            }))} />
    }, [item, data, loading, value, meta, contextObject, objectName]);

    return (<Space.Compact style={{ width: '100%' }}>
        {children}
        {item?.actions && <React.Fragment>
            {RendeActions()}
        </React.Fragment>}
        {item?.dropdownActions && <React.Fragment>
            {RenderDropdownActions()}
        </React.Fragment>}
    </Space.Compact>)
}
function UploadItems({ formItem, auth, item, value, onChange, changed }) {
    const [loading, setLoading] = useState(false);
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
            setFiles(o => [...o, file]);
            return false;
        },
        fileList: files,
    };
    return (<Upload
        {...uploadingProps}
        data-locator={getLocator(item?.name)}
    >
        {!item.trigger && <Button data-locator={getLocator(item?.name, "upload")} icon={<UploadOutlined />}>Загрузить файлы</Button>}
        {item?.trigger && item?.trigger()}
    </Upload>)
}
function UploadItem({ formItem, auth, item, value, onChange, changed }) {
    const [loading, setLoading] = useState(false);
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
        <Dragger {...uploadingProps} data-locator={getLocator(item?.name)}>
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
function Image({ formItem, auth, item, value, onChange, changed }) {
    const [loading, setLoading] = useState(false);
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
                        fallback={"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3PTWBSGcbGzM6GCKqlIBRV0dHRJFarQ0eUT8LH4BnRU0NHR0UEFVdIlFRV7TzRksomPY8uykTk/zewQfKw/9znv4yvJynLv4uLiV2dBoDiBf4qP3/ARuCRABEFAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghgg0Aj8i0JO4OzsrPv69Wv+hi2qPHr0qNvf39+iI97soRIh4f3z58/u7du3SXX7Xt7Z2enevHmzfQe+oSN2apSAPj09TSrb+XKI/f379+08+A0cNRE2ANkupk+ACNPvkSPcAAEibACyXUyfABGm3yNHuAECRNgAZLuYPgEirKlHu7u7XdyytGwHAd8jjNyng4OD7vnz51dbPT8/7z58+NB9+/bt6jU/TI+AGWHEnrx48eJ/EsSmHzx40L18+fLyzxF3ZVMjEyDCiEDjMYZZS5wiPXnyZFbJaxMhQIQRGzHvWR7XCyOCXsOmiDAi1HmPMMQjDpbpEiDCiL358eNHurW/5SnWdIBbXiDCiA38/Pnzrce2YyZ4//59F3ePLNMl4PbpiL2J0L979+7yDtHDhw8vtzzvdGnEXdvUigSIsCLAWavHp/+qM0BcXMd/q25n1vF57TYBp0a3mUzilePj4+7k5KSLb6gt6ydAhPUzXnoPR0dHl79WGTNCfBnn1uvSCJdegQhLI1vvCk+fPu2ePXt2tZOYEV6/fn31dz+shwAR1sP1cqvLntbEN9MxA9xcYjsxS1jWR4AIa2Ibzx0tc44fYX/16lV6NDFLXH+YL32jwiACRBiEbf5KcXoTIsQSpzXx4N28Ja4BQoK7rgXiydbHjx/P25TaQAJEGAguWy0+2Q8PD6/Ki4R8EVl+bzBOnZY95fq9rj9zAkTI2SxdidBHqG9+skdw43borCXO/ZcJdraPWdv22uIEiLA4q7nvvCug8WTqzQveOH26fodo7g6uFe/a17W3+nFBAkRYENRdb1vkkz1CH9cPsVy/jrhr27PqMYvENYNlHAIesRiBYwRy0V+8iXP8+/fvX11Mr7L7ECueb/r48eMqm7FuI2BGWDEG8cm+7G3NEOfmdcTQw4h9/55lhm7DekRYKQPZF2ArbXTAyu4kDYB2YxUzwg0gi/41ztHnfQG26HbGel/crVrm7tNY+/1btkOEAZ2M05r4FB7r9GbAIdxaZYrHdOsgJ/wCEQY0J74TmOKnbxxT9n3FgGGWWsVdowHtjt9Nnvf7yQM2aZU/TIAIAxrw6dOnAWtZZcoEnBpNuTuObWMEiLAx1HY0ZQJEmHJ3HNvGCBBhY6jtaMoEiJB0Z29vL6ls58vxPcO8/zfrdo5qvKO+d3Fx8Wu8zf1dW4p/cPzLly/dtv9Ts/EbcvGAHhHyfBIhZ6NSiIBTo0LNNtScABFyNiqFCBChULMNNSdAhJyNSiECRCjUbEPNCRAhZ6NSiAARCjXbUHMCRMjZqBQiQIRCzTbUnAARcjYqhQgQoVCzDTUnQIScjUohAkQo1GxDzQkQIWejUogAEQo121BzAkTI2agUIkCEQs021JwAEXI2KoUIEKFQsw01J0CEnI1KIQJEKNRsQ80JECFno1KIABEKNdtQcwJEyNmoFCJAhELNNtScABFyNiqFCBChULMNNSdAhJyNSiECRCjUbEPNCRAhZ6NSiAARCjXbUHMCRMjZqBQiQIRCzTbUnAARcjYqhQgQoVCzDTUnQIScjUohAkQo1GxDzQkQIWejUogAEQo121BzAkTI2agUIkCEQs021JwAEXI2KoUIEKFQsw01J0CEnI1KIQJEKNRsQ80JECFno1KIABEKNdtQcwJEyNmoFCJAhELNNtScABFyNiqFCBChULMNNSdAhJyNSiECRCjUbEPNCRAhZ6NSiAARCjXbUHMCRMjZqBQiQIRCzTbUnAARcjYqhQgQoVCzDTUnQIScjUohAkQo1GxDzQkQIWejUogAEQo121BzAkTI2agUIkCEQs021JwAEXI2KoUIEKFQsw01J0CEnI1KIQJEKNRsQ80JECFno1KIABEKNdtQcwJEyNmoFCJAhELNNtScABFyNiqFCBChULMNNSdAhJyNSiEC/wGgKKC4YMA4TAAAAABJRU5ErkJggg=="}
                        preview={false}
                        width={48}
                        height={48}
                        style={{ borderRadius: "6px", border: "1px solid #e5e5e5" }}
                        src={toUrl(value)}
                    />
                </div>
                <div style={{ display: "flex", gap: "5px" }}>
                    <Button data-locator={getLocator(item?.name, "edit")} onClick={onOpenChange} size="small" fill='none'>
                        <i className="fa fa-pencil-square-o"></i>
                    </Button>
                    <Button fill='none' size='small' data-locator={getLocator(item?.name, "clean")} onClick={(v) => {
                        onChange(null);
                    }}>
                        <i className="fa fa-times"></i>
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
function GroupObj({ formItem, auth, item, value, onChange, onAfterChange, changed, contextObject, objectName, partialReplacement }) {
    const [loading, setLoading] = useState(false);
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
    const elements = useCallback((data) => {
        if (item.dependence?.mode !== "server" && item.dependence) {
            if (item.dependence.field && by(item)) {
                return data?.filter(e => _.get(e, item.dependence.field) === by(item))?.map(i => (
                    <Option data-locator={getLocator(item?.name || objectName, i)} key={property(item, i)} value={property(item, i)} label={labelString(item, i)}>{label(item, i)}</Option>
                ));
            }
        } else {
            return data?.map(i => (
                <Option data-locator={getLocator(item?.name || objectName, i)} key={property(item, i)} value={property(item, i)} label={labelString(item, i)}>{label(item, i)}</Option>
            ));
        }
    }, [value, changed]);

    return (<FieldLayout formItem={formItem} item={item} style={(item?.fieldLayoutStyle) ? item.fieldLayoutStyle : { width: "100%" }}>
        <Select
            data-locator={getLocator(item?.name || objectName, itemByProperty(item, value))}
            size={(item.size) ? item.size : "middle"}
            mode="multiple"
            showSearch
            value={value}
            onChange={e => onChange(e, item, itemByProperty(item, e))}
            style={{ width: "100%" }}
            allowClear={true}
            disabled={(item && item.view && item.view.disabled) ? item.view.disabled : false}
            // filterOption={(input, element) =>
            //     element.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            // }
            filterOption={(input, option) => {
                return option?.label?.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }}
        // filterSort={(optionA, optionB) =>
        //     optionA?.label?.toLowerCase().localeCompare(optionB?.label?.toLowerCase())
        // }
        >
            {elements(data)}
        </Select>
    </FieldLayout>
    )
}
function RangeTime({ formItem, auth, item, value, onChange, onAfterChange }) {
    const [loading, setLoading] = useState(false);
    const a = useMemo(() => {
        if (value && value[0] && value[1]) {
            return [dayjs(value[0]), dayjs(value[1])]
        }
        return []
    }, [value])
    return (<FieldLayout formItem={formItem} item={item} style={(item?.fieldLayoutStyle) ? item.fieldLayoutStyle : { width: "100%" }}>
        <TimePicker.RangePicker data-locator={getLocator(item?.name)} changeOnBlur={true} value={a} onChange={onChange} type="time" format="HH:mm:ss" locale={locale} style={{ width: "100%" }} />
    </FieldLayout>)
}
function RangeDate({ formItem, auth, item, value, onChange, onAfterChange }) {
    const [loading, setLoading] = useState(false);
    const a = useMemo(() => {
        if (value && value[0] && value[1]) {
            return [dayjs(value[0]), dayjs(value[1])]
        }
        return []
    }, [value])
    return (<FieldLayout formItem={formItem} item={item} style={(item?.fieldLayoutStyle) ? item.fieldLayoutStyle : { width: "100%" }}>
        <DatePicker.RangePicker data-locator={getLocator(item?.name)} changeOnBlur={true} value={a} onChange={onChange} format="DD.MM.YYYY" locale={locale} style={{ width: "100%" }} />
    </FieldLayout>)
}
function RangeDateTime({ formItem, auth, item, value, onChange, onAfterChange }) {
    const [loading, setLoading] = useState(false);
    const a = useMemo(() => {
        if (value && value[0] && value[1]) {
            return [dayjs(value[0]), dayjs(value[1])]
        }
        return []
    }, [value])
    return (<FieldLayout formItem={formItem} item={item} style={(item?.fieldLayoutStyle) ? item.fieldLayoutStyle : { width: "100%" }}>
        <DatePicker.RangePicker data-locator={getLocator(item?.name)} changeOnBlur={true} showTime={{ format: 'HH:mm' }} value={a} onChange={onChange} format="DD.MM.YYYY HH:mm" locale={locale} style={{ width: "100%" }} />
    </FieldLayout>)
}
function RangeFloat({ formItem, auth, item, value, onChange, onAfterChange }) {
    const [loading, setLoading] = useState(false);
    const [val, setVal] = useState();
    useEffect(() => {
        setVal(value);
    }, [value]);
    const xstep = item.step || 1;
    const xmin = item.min || item.func.min || 0;
    const xmax = item.max + xstep || item.func.max + xstep || 100000;
    const def = [(xmin - (xmin % xstep)), (xmax + (xstep - xmax % xstep))];
    return (<FieldLayout formItem={formItem} item={item} style={(item?.fieldLayoutStyle) ? item.fieldLayoutStyle : { width: "100%" }}>
        <Slider
            data-locator={getLocator(item?.name)}
            range
            defaultValue={def}
            min={(xmin - (xmin % xstep))}
            max={(xmax + (xstep - xmax % xstep))}
            step={xstep}
            included={true}
            value={val || def}
            onChange={setVal}
            onAfterChange={(item.realtime) ? onAfterChange : onChange} />
    </FieldLayout>
    )
}
function FloatSlider({ formItem, auth, item, value, onChange, onAfterChange }) {
    const [loading, setLoading] = useState(false);
    const [val, setVal] = useState();
    useEffect(() => {
        setVal(value);
    }, [value]);
    const xstep = item?.step || 1;
    const xmin = item?.min || item?.func?.min || 0;
    const xmax = item?.max || item?.func?.max || 100000;
    return (<FieldLayout formItem={formItem} item={item} style={(item?.fieldLayoutStyle) ? item.fieldLayoutStyle : { width: "100%" }}>
        <Slider
            data-locator={getLocator(item?.name)}
            disabled={(item && item.view && item.view.disabled) ? item.view.disabled : false}
            min={xmin}
            max={xmax}
            step={xstep}
            value={(item.realtime) ? value : val}
            onChange={(item.realtime) ? onChange : setVal}
            onAfterChange={(item.realtime) ? onAfterChange : onChange} />
    </FieldLayout>
    )
}
function RangeInteger({ formItem, auth, item, value, onChange, onAfterChange }) {
    const [loading, setLoading] = useState(false);
    const [val, setVal] = useState();
    useEffect(() => {
        setVal(value);
    }, [value]);
    const xstep = item?.step || 1;
    const xmin = item?.min || item?.func?.min || 0;
    const xmax = item?.max + xstep || item?.func?.max + xstep || 100000;
    const def = [(xmin - (xmin % xstep)), (xmax + (xstep - xmax % xstep))];
    return (<FieldLayout formItem={formItem} item={item} style={(item?.fieldLayoutStyle) ? item.fieldLayoutStyle : { width: "100%" }}>
        <Slider
            data-locator={getLocator(item?.name)}
            range
            defaultValue={def}
            min={(xmin - (xmin % xstep))}
            max={(xmax + (xstep - xmax % xstep))}
            step={xstep}
            value={val}
            included={true}
            // onChange={setVal}
            onChange={(item.realtime) ? onChange : setVal}
            onAfterChange={(item.realtime) ? onAfterChange : onChange} />
    </FieldLayout>
    )
}
function IntegerSlider({ formItem, auth, item, value, onChange, onAfterChange }) {
    const [loading, setLoading] = useState(false);
    const [val, setVal] = useState();
    useEffect(() => {
        setVal(value);
    }, [value]);
    const xstep = item?.step || 1;
    const xmin = item?.min || item?.func?.min || 0;
    const xmax = item?.max || item?.func?.max || 100000;

    return (<FieldLayout formItem={formItem} item={item} style={(item?.fieldLayoutStyle) ? item.fieldLayoutStyle : { width: "100%" }}>
        <Slider
            data-locator={getLocator(item?.name)}
            disabled={(item && item.view && item.view.disabled) ? item.view.disabled : false}
            min={xmin}
            max={xmax}
            step={xstep}
            value={(item.realtime) ? value : val}
            onChange={(item.realtime) ? onChange : setVal}
            onAfterChange={(item.realtime) ? onAfterChange : onChange} />
    </FieldLayout>
    )
}
function Obj({ formItem, auth, item, value, onChange, onAfterChange, changed, contextObject, objectName, partialReplacement }) {
    const [loading, setLoading] = useState(false);
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

    const elements = useCallback((data) => {
        if (item.dependence?.mode !== "server" && item.dependence) {
            if (item.dependence.field && by(item)) {
                return data?.filter(e => _.get(e, item.dependence.field) === by(item))?.map(i => (
                    <Option data-locator={getLocator(item?.name || objectName, i)} key={property(item, i)} value={property(item, i)} label={labelString(item, i)}>{label(item, i)}</Option>
                ));
            }
        } else {
            return data?.map(i => (
                <Option data-locator={getLocator(item?.name || objectName, i)} key={property(item, i)} value={property(item, i)} label={labelString(item, i)}>{label(item, i)}</Option>
            ));
        }
    }, [value, changed]);

    const RendeActions = React.useCallback(() => {
        if (!item?.actions) return <React.Fragment></React.Fragment>;
        let values = clean(unwrap(item?.actions(value, item, meta)));
        if (!values || !values.length) return <React.Fragment></React.Fragment>;
        return values?.map((e, idx) => {
            if (_.isFunction(e)) {
                return (e({
                    collection: data,
                    setCollection: setData,
                    objectName: objectName,
                    contextObject: contextObject,
                    setCollectionItem: (item, first) => setData(o => updateInArray(o, item, first)),
                    removeCollectionItem: (item) => setData(o => deleteInArray(o, item)),
                    // onSelection,
                    // isSelected,
                    lock: () => setLoading(true),
                    unlock: () => setLoading(false),
                    loading,
                    property: (obj) => property(item, obj),
                    label: (obj) => label(item, obj),
                    itemByProperty: (value) => itemByProperty(item, value),
                    apply: (obj) => onChange(value, item, itemByProperty(item, value)),
                    // update
                }, idx))
            }
            return (<Action
                key={e.key || idx}
                auth={auth}
                mode={"button"}
                disabled={loading || (item && item.view && item.view.disabled) ? item.view.disabled : false}
                item={item}
                locator={item?.name || objectName}
                object={e.object || itemByProperty(item, value)}
                objectName={objectName}
                contextObject={contextObject}
                collection={data}
                setCollection={setData}
                property={(obj) => property(item, obj)}
                label={(obj) => label(item, obj)}
                itemByProperty={(value) => itemByProperty(item, value)}
                apply={(obj) => onChange(property(item, obj), item, obj)}
                {...e}
            />)
        });
    }, [item, data, loading, value, meta, contextObject, objectName]);

    const RenderDropdownActions = React.useCallback(() => {
        if (!item?.dropdownActions) return <React.Fragment></React.Fragment>;
        let values = clean(unwrap(item?.dropdownActions(value, item, meta)));
        if (!values || !values.length) return <React.Fragment></React.Fragment>;
        return <DropdownAction
            button={() => (<Button type="default">
                <i className="fa fa-ellipsis-v"></i>
                {/* <i className="fa fa-ellipsis-h"></i> */}
                {/* <i className="fa fa-angle-down"></i> */}
                {/* <i className="fa fa-chevron-down"></i> */}
                {/* <i className="fa fa-caret-down"></i> */}
                {/* <i className="fa fa-bars"></i> */}
                {/* <i className="fa fa-caret-square-o-down"></i> */}
            </Button>)}
            locator={item?.name || objectName}
            object={itemByProperty(item, value)}
            items={values?.map((e, idx) => ({
                key: e.key || idx,
                auth: auth,
                mode: "MenuItem",
                disabled: loading || (item && item.view && item.view.disabled) ? item.view.disabled : false,
                item: item,
                locator: item?.name || objectName,
                object: e.object || itemByProperty(item, value),
                objectName: objectName,
                contextObject: contextObject,
                collection: data,
                setCollection: setData,
                property: (obj) => property(item, obj),
                label: (obj) => label(item, obj),
                itemByProperty: (value) => itemByProperty(item, value),
                apply: (obj) => onChange(property(item, obj), item, obj),
                ...e
            }))} />
    }, [item, data, loading, value, meta, contextObject, objectName]);

    return (<FieldLayout formItem={formItem} item={item} style={(item?.fieldLayoutStyle) ? item.fieldLayoutStyle : { width: "100%" }}>
        <Space.Compact
            style={{
                width: '100%',
            }}
        >
            <Select showSearch
                data-locator={getLocator(item?.name || objectName, itemByProperty(item, value))}
                size={(item.size) ? item.size : "middle"}
                value={value}
                onChange={e => onChange(e, item, itemByProperty(item, e))}
                style={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    width: "100%"
                }}
                allowClear={true}
                disabled={(item && item.view && item.view.disabled) ? item.view.disabled : false}
                filterOption={(input, option) => {
                    return option?.label?.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }}
            // filterSort={(optionA, optionB) =>
            //     optionA?.label?.toLowerCase().localeCompare(optionB?.label?.toLowerCase())
            // }
            // filterOption={(input, element) =>
            //     element.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            // }
            >
                {elements(data)}
            </Select>
            {item?.actions && <React.Fragment>
                {RendeActions()}
            </React.Fragment>}
            {item?.dropdownActions && <React.Fragment>
                {RenderDropdownActions()}
            </React.Fragment>}
        </Space.Compact>
    </FieldLayout>
    )
}
function BigObj({ formItem, auth, item, value, onChange, onAfterChange, changed, contextObject, objectName, partialReplacement }) {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
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
        if (value) {
            if (item.source || item.url || (item && _.get(item, "relation.reference.url")) || (item && _.get(item, "relation.reference.source"))) {
                let filter = item.queryFilter || _.get(item, "relation.reference.queryFilter") || _.get(item, "relation.reference.filter");
                let url = item.source || item.relation.reference.url || item.relation.reference.source;
                setLoading(true)
                GETWITH(auth, url, [
                    ...defaultQueryParams(filter),
                    QueryParam("w-ID", value)
                ], ({ data }) => {
                    setData(dataOrContent(data));
                    setLoading(false)
                }, (err) => errorCatch(err, () => setLoading(false)));
                // } else if (item && _.get(item, "relation.reference.data")) {
                //     setData(item.relation.reference.data);
            } else if (item && _.get(item, "relation.reference.object")) {
                let object = getObjectValue(item, "relation.reference.object");
                if (object) {
                    let filter = item.queryFilter || _.get(item, "relation.reference.queryFilter") || _.get(item, "relation.reference.filter");
                    setLoading(true)
                    READWITH(auth, object, [
                        ...defaultQueryParams(filter),
                        QueryParam("w-ID", value)
                    ], ({ data }) => {
                        setData(dataOrContent(data));
                        setLoading(false)
                    }, (err) => errorCatch(err, () => setLoading(false)));
                }
            }
        }
    }, [
        auth,
        value,
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
    const itemByProperty = useCallback((item, value) => {
        if (_.get(item, "relation.reference.property")) {
            return data.find(e => e[item.relation.reference.property] === value);
        }
        return data.find(e => e.ID === value);
    }, [data]);

    const display = useCallback((item, value) => {
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
    }, [meta]);
    const displayString = useCallback((item, value) => {
        if (item && value) {
            if (item.displayString && _.isFunction(item.displayString)) {
                return item.displayString(value)
            } else if (item.relation && item.relation.displayString && _.isFunction(item.relation.displayString)) {
                return item.relation.displayString(value)
            } else {
                let labeldisplay = display(item, value);
                if (_.isString(labeldisplay)) {
                    return labeldisplay;
                }
                let fieldMeta = meta[getObjectValue(item, "relation.reference.object")];
                let _display = ((item?.relation?.display?.fields) ? item?.relation?.display : undefined) || ((fieldMeta?.display?.fields) ? fieldMeta?.display : undefined)
                return getDisplay(value, _display, fieldMeta, meta)
            }
        }
        return "";
    }, [meta]);
    const suffix = useCallback((item, value) => {
        if (item && value) {
            if (item.suffix && _.isFunction(item.suffix)) {
                return item.suffix(value)
            } else if (item.relation && item.relation.suffix && _.isFunction(item.relation.suffix)) {
                return item.relation.suffix(value)
            }
        }
        return undefined;
    }, [meta]);

    // const elements = useCallback((data) => {
    //     if (item.dependence?.mode !== "server" && item.dependence) {
    //         if (item.dependence.field && by(item)) {
    //             return data?.filter(e => _.get(e, item.dependence.field) === by(item))?.map(i => (
    //                 <Option key={property(item, i)} value={property(item, i)}>{display(item, i)}</Option>
    //             ));
    //         }
    //     } else {
    //         return data?.map(i => (
    //             <Option key={property(item, i)} value={property(item, i)}>{display(item, i)}</Option>
    //         ));
    //     }
    // }, [value, changed]);
    const cAction = (values, unlock, close) => {
        const { selected } = values;
        if (selected) {
            var h = _.head(selected)
            onChange(property(item, h), item, h)
        }
        close()
    }
    const cTrigger = useCallback((click) => (
        <Button
            onClick={click}
            type="default"
            size={(item.size) ? item.size : "middle"}
            disabled={(item && item.view && item.view.disabled) ? item.view.disabled : (loading) ? loading : false}
        >
            <i className="fa fa-search" style={{ fontSize: "12px" }}></i>
        </Button>
    ), [item, loading])

    const cName = useCallback((item && _.get(item, "relation.reference.object")) ? getObjectValue(item, "relation.reference.object") : undefined, [item]);
    const cSource = useCallback(item?.source || item?.relation?.reference?.url || item?.relation?.reference?.source, [item]);
    const cContextFilters = useCallback(() => defaultQueryParams(item.queryFilter || _.get(item, "relation.reference.queryFilter") || _.get(item, "relation.reference.filter")), [item]);
    const cFilters = useCallback(() => {
        var uif = _.get(item, "relation.uiFilter");
        if (uif) {
            return uif()
        }
        return meta[getObjectValue(item, "relation.reference.object")]?.properties?.map(e => ({ ...e, sort: true, filter: true }));
    }, [meta, item]);

    const cRender = (auth, _item, value, onChange) => {
        console.log(item);
        
        return (<CollectionServer
            count={_item?.count}
            floatingFilter={item?.floatingFilter || item?.relation?.floatingFilter}
            selection={"radio"}
            value={value}
            onChange={onChange}
            auth={auth}
            objectName={objectName}
            contextObject={contextObject}
            name={cName}
            source={cSource}
            contextFilters={cContextFilters}
            filters={cFilters}
            customRender={(items, {
                objectName,
                contextObject,
                collection,
                setCollection,
                setCollectionItem,
                removeCollectionItem,
                collectionActions,
                modelActions,
                onSelection,
                isSelected,
                lock,
                unlock,
                loading,
                update
            }) => {
                // console.log(value, items);
                return (
                    <div>
                        {(value && value.filter(e => !!e && items.filter(c => c.ID === e.ID) <= 0).length > 0) && <div>
                            <div style={{ fontWeight: "lighter" }}>Сейчас выбрано</div>
                            {JSXMap(value, (i, idx) => <div key={idx}>{display(item, i)}</div>)}
                            <div style={{ fontWeight: "lighter", paddingTop: "10px" }}>Можно выбрать из</div>
                        </div>}
                        <div style={{ display: "flex", flexDirection: "column" }}>
                            <Spin spinning={loading} style={{ paddingTop: "15px", paddingBottom: "15px" }} />
                            {JSXMap(items, (o, oidx) => {
                                return (<div key={oidx} onClick={(e) => { e.stopPropagation(); onSelection(o); }}
                                    className={`bg ${(isSelected(o)) ? "bg-blue dark-3" : "bg-grey-hover light"} pointer`} style={{ textAlign: "left" }}>
                                    {display(item, o)}
                                </div>)
                            })}
                        </div>
                    </div>
                )
            }}
            size={"small"}
        />)
    }
    const clear = (str) => {
        if (!str) {
            // onChange(value, item, itemByProperty(item, e))
            onChange(undefined, item, undefined)
        }
    }

    const RendeActions = React.useCallback(() => {
        if (!item?.actions) return <React.Fragment></React.Fragment>;
        let values = clean(unwrap(item?.actions(value, item, meta, contextObject)));
        if (!values || !values.length) return <React.Fragment></React.Fragment>;
        return values?.map((e, idx) => {
            if (_.isFunction(e)) {
                return (e({
                    collection: data,
                    setCollection: setData,
                    objectName: objectName,
                    contextObject: contextObject,
                    setCollectionItem: (item, first) => setData(o => updateInArray(o, item, first)),
                    removeCollectionItem: (item) => setData(o => deleteInArray(o, item)),
                    // onSelection,
                    // isSelected,
                    lock: () => setLoading(true),
                    unlock: () => setLoading(false),
                    loading,
                    property: (obj) => property(item, obj),
                    label: (obj) => display(item, obj),
                    itemByProperty: (value) => itemByProperty(item, value),
                    apply: (obj) => onChange(value, item, itemByProperty(item, value)),
                    // update
                }, idx))
            }
            return (<Action
                key={e.key || idx}
                auth={auth}
                mode={"button"}
                disabled={loading || (item && item.view && item.view.disabled) ? item.view.disabled : false}
                item={item}
                locator={item?.name || objectName}
                object={e.object || itemByProperty(item, value)}
                objectName={objectName}
                contextObject={contextObject}
                collection={data}
                setCollection={setData}
                property={(obj) => property(item, obj)}
                label={(obj) => display(item, obj)}
                itemByProperty={(value) => itemByProperty(item, value)}
                apply={(obj) => onChange(property(item, obj), item, obj)}
                {...e}
            />)
        });
    }, [item, data, loading, value, meta, contextObject, objectName]);

    const RenderDropdownActions = React.useCallback(() => {
        if (!item?.dropdownActions) return <React.Fragment></React.Fragment>;
        let values = clean(unwrap(item?.dropdownActions(value, item, meta, contextObject)));
        if (!values || !values.length) return <React.Fragment></React.Fragment>;
        return <DropdownAction
            button={() => (<Button type="default">
                <i className="fa fa-ellipsis-v"></i>
                {/* <i className="fa fa-ellipsis-h"></i> */}
                {/* <i className="fa fa-angle-down"></i> */}
                {/* <i className="fa fa-chevron-down"></i> */}
                {/* <i className="fa fa-caret-down"></i> */}
                {/* <i className="fa fa-bars"></i> */}
                {/* <i className="fa fa-caret-square-o-down"></i> */}
            </Button>)}
            locator={item?.name || objectName}
            object={itemByProperty(item, value)}
            items={values?.map((e, idx) => ({
                key: e.key || idx,
                auth: auth,
                mode: "MenuItem",
                disabled: loading || (item && item.view && item.view.disabled) ? item.view.disabled : false,
                item: item,
                locator: item?.name || objectName,
                object: e.object || itemByProperty(item, value),
                objectName: objectName,
                contextObject: contextObject,
                collection: data,
                setCollection: setData,
                property: (obj) => property(item, obj),
                label: (obj) => display(item, obj),
                itemByProperty: (value) => itemByProperty(item, value),
                apply: (obj) => onChange(property(item, obj), item, obj),
                ...e
            }))} />
    }, [item, data, loading, value, meta, contextObject, objectName]);

    return (<FieldLayout formItem={formItem} item={item} style={(item?.fieldLayoutStyle) ? item.fieldLayoutStyle : { width: "100%" }}>
        <Space.Compact
            style={{
                width: '100%',
            }}
        >
            <Input
                data-locator={getLocator(item?.name || objectName, itemByProperty(item, value))}
                suffix={(loading) ? <Spin size="small" /> : suffix(item, itemByProperty(item, value))}
                size={(item.size) ? item.size : "middle"}
                allowClear={true}
                style={{ width: "100%" }}
                // readOnly
                onChange={e => clear(e.target.value)}
                value={displayString(item, itemByProperty(item, value))}
                disabled={(item && item.view && item.view.disabled) ? item.view.disabled : (loading) ? loading : false}
            />
            <Action
                // title={`Выберите ${(item.label) ? item.label.toLowerCase() : "элемент"}`}
                title={<div>
                    <div style={{ fontSize: "12px", fontStyle: "italic", color: "rgba(0, 0, 0, 0.45)" }}>Выберите элемент</div>
                    {(item?.label) && <div>{item?.label}</div>}
                </div>}
                auth={auth}
                action={cAction}
                okText="Выбрать"
                locator={item?.name || objectName}
                object={{ selected: [itemByProperty(item, value)] }}
                modal={(item.modal) ? item.modal : { width: "600px" }}
                form={Model}
                meta={[{
                    type: "func",
                    name: "selected",
                    count: item?.count,
                    render: cRender
                }]}
                mode={"func"}
                trigger={cTrigger}
            />
            {item?.actions && <React.Fragment>
                {RendeActions()}
            </React.Fragment>}
            {item?.dropdownActions && <React.Fragment>
                {RenderDropdownActions()}
            </React.Fragment>}
        </Space.Compact>
    </FieldLayout>
    )
}
function DateTime({ formItem, auth, item, value, onChange, onAfterChange }) {
    const [loading, setLoading] = useState(false);
    return (<FieldLayout formItem={formItem} item={item} style={(item?.fieldLayoutStyle) ? item.fieldLayoutStyle : { width: "100%" }}>
        <ActionsSpace auth={auth} item={item} value={value} onChange={onChange} loading={loading} setLoading={setLoading}>
            <DatePicker
                data-locator={getLocator(item?.name)}
                changeOnBlur={true} value={(value) ? dayjs(value) : undefined} onChange={onChange} showTime format="DD.MM.YYYY HH:mm" locale={locale} style={{ width: "100%" }}
                disabled={(item && item.view && item.view.disabled) ? item.view.disabled : (loading) ? loading : false}
            />
        </ActionsSpace>
    </FieldLayout>
    )
}
function Date({ formItem, auth, item, value, onChange, onAfterChange }) {
    const [loading, setLoading] = useState(false);
    return (<FieldLayout formItem={formItem} item={item} style={(item?.fieldLayoutStyle) ? item.fieldLayoutStyle : { width: "100%" }}>
        <ActionsSpace auth={auth} item={item} value={value} onChange={onChange} loading={loading} setLoading={setLoading}>
            <DatePicker
                data-locator={getLocator(item?.name)}
                changeOnBlur={true} value={(value) ? dayjs(value) : undefined} onChange={onChange} format="DD.MM.YYYY" locale={locale} style={{ width: "100%" }}
                disabled={(item && item.view && item.view.disabled) ? item.view.disabled : (loading) ? loading : false}
            />
        </ActionsSpace>
    </FieldLayout>
    )
}
function Time({ formItem, auth, item, value, onChange, onAfterChange }) {
    const [loading, setLoading] = useState(false);
    return (<FieldLayout formItem={formItem} item={item} style={(item?.fieldLayoutStyle) ? item.fieldLayoutStyle : { width: "100%" }}>
        <ActionsSpace auth={auth} item={item} value={value} onChange={onChange} loading={loading} setLoading={setLoading}>
            <DatePicker
                data-locator={getLocator(item?.name)}
                changeOnBlur={true} value={(value) ? dayjs(value) : undefined} onChange={onChange} type="time" format="HH:mm:ss" locale={locale} style={{ width: "100%" }}
                disabled={(item && item.view && item.view.disabled) ? item.view.disabled : (loading) ? loading : false}
            />
        </ActionsSpace>
    </FieldLayout>
    )
}
function Boolean({ formItem, auth, item, value, onChange, onAfterChange }) {
    const [loading, setLoading] = useState(false);
    const change = (e) => {
        onChange(e.target.checked);
    }
    return (<FieldLayout formItem={true} item={item}>
        <Checkbox
            data-locator={getLocator(item?.name)}
            checked={value} onChange={change}
            disabled={(item && item.view && item.view.disabled) ? item.view.disabled : (loading) ? loading : false}
        >
            {item.label}
        </Checkbox>
    </FieldLayout>
    )
}
function Float({ formItem, auth, item, value, onChange, onAfterChange }) {
    const [loading, setLoading] = useState(false);
    return (<FieldLayout formItem={formItem} item={item} style={(item?.fieldLayoutStyle) ? item.fieldLayoutStyle : { width: "100%" }}>
        <ActionsSpace auth={auth} item={item} value={value} onChange={onChange} loading={loading} setLoading={setLoading}>
            <InputNumber
                data-locator={getLocator(item?.name)}
                value={value} onChange={onChange} style={{ width: "100%" }} min={item?.min || item?.validators?.min} max={item?.max || item?.validators?.max}
                disabled={(item && item.view && item.view.disabled) ? item.view.disabled : (loading) ? loading : false}
            />
        </ActionsSpace>
    </FieldLayout>
    )
}
function Integer({ formItem, auth, item, value, onChange, onAfterChange }) {
    const [loading, setLoading] = useState(false);
    return (<FieldLayout formItem={formItem} item={item} style={(item?.fieldLayoutStyle) ? item.fieldLayoutStyle : { width: "100%" }}>
        <ActionsSpace auth={auth} item={item} value={value} onChange={onChange} loading={loading} setLoading={setLoading}>
            <InputNumber
                data-locator={getLocator(item?.name)}
                value={value} onChange={onChange} style={{ width: "100%" }} min={item?.min || item?.validators?.min} max={item?.max || item?.validators?.max}
                disabled={(item && item.view && item.view.disabled) ? item.view.disabled : (loading) ? loading : false}
            />
        </ActionsSpace>
    </FieldLayout>
    )
}
function String({ formItem, auth, item, value, onChange, onAfterChange }) {
    const [loading, setLoading] = useState(false);
    return (<FieldLayout formItem={formItem} item={item} style={(item?.fieldLayoutStyle) ? item.fieldLayoutStyle : { width: "100%" }}>
        <ActionsSpace auth={auth} item={item} value={value} onChange={onChange} loading={loading} setLoading={setLoading}>
            <Input
                data-locator={getLocator(item?.name)}
                size={(item.size) ? item.size : "middle"} allowClear value={value} onChange={(v) => onChange(v.target.value)} style={{ width: "100%" }}
                disabled={(item && item.view && item.view.disabled) ? item.view.disabled : (loading) ? loading : false}
            />
        </ActionsSpace>
    </FieldLayout>
    )
}
function Password({ formItem, auth, item, value, onChange, onAfterChange }) {
    const [loading, setLoading] = useState(false);
    return (<FieldLayout formItem={formItem} item={item} style={(item?.fieldLayoutStyle) ? item.fieldLayoutStyle : { width: "100%" }}>
        <ActionsSpace auth={auth} item={item} value={value} onChange={onChange} loading={loading} setLoading={setLoading}>
            <Input.Password
                data-locator={getLocator(item?.name)}
                allowClear value={value} onChange={(v) => onChange(v.target.value)} style={{ width: "100%" }}
                iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                disabled={(item && item.view && item.view.disabled) ? item.view.disabled : (loading) ? loading : false}
            />
        </ActionsSpace>
    </FieldLayout>
    )
}
function MultilineText({ formItem, auth, item, value, onChange, onAfterChange }) {
    const [loading, setLoading] = useState(false);
    return (<FieldLayout formItem={formItem} item={item} style={(item?.fieldLayoutStyle) ? item.fieldLayoutStyle : { width: "100%" }}>
        <ActionsSpace auth={auth} item={item} value={value} onChange={onChange} loading={loading} setLoading={setLoading}>
            <TextArea
                data-locator={getLocator(item?.name)}
                rows={6} allowClear value={value} onChange={(v) => onChange(v.target.value)} style={{ width: "100%" }}
                disabled={(item && item.view && item.view.disabled) ? item.view.disabled : (loading) ? loading : false}
            />
        </ActionsSpace>
    </FieldLayout>
    )
}
function Unknown({ formItem, item }) {
    return (<FieldLayout formItem={formItem} item={item} style={(item?.fieldLayoutStyle) ? item.fieldLayoutStyle : { width: "100%" }}>
        <div key={item.name}>
            <div>{item.label} - {item.name}</div>
            <div>{item.uuid}</div>
        </div>
    </FieldLayout>
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
    const { auth, item, value, onChange, onAfterChange, changed, isChanged, partialReplacement,
        fullReplacement, contextObject, objectName, formItem, data } = props;
    let type = ((item.view) ? item.view.type : undefined) || item.type;

    // const FullReplacementFunc = useFieldFullReplacement(item?.name, fullReplacement)
    const FullReplacementFunc = useFieldFullReplacement(type, fullReplacement)
    if (FullReplacementFunc) {
        return (<FullReplacementFunc data={data} auth={auth} formItem={formItem} partialReplacement={partialReplacement} contextObject={contextObject} objectName={objectName} item={item} value={value} onChange={onChange} onAfterChange={onAfterChange} isChanged={isChanged} changed={changed} />)
    }

    switch (item.filterType) {
        case "group":
            switch (type) {
                case "func":
                    return (props?.item?.render) ? props?.item?.render(auth, item, value, onChange, onAfterChange, isChanged, { partialReplacement, contextObject, objectName, formItem, data }) : undefined;
                case "object":
                case "document":
                    return (<GroupObj auth={auth} formItem={formItem} partialReplacement={partialReplacement} contextObject={contextObject} objectName={objectName} item={item} value={value} onChange={onChange} onAfterChange={onAfterChange} isChanged={isChanged} changed={changed}></GroupObj>)
                default:
                    return (<Unknown auth={auth} formItem={formItem} partialReplacement={partialReplacement} contextObject={contextObject} objectName={objectName} item={item} value={value} onChange={onChange} onAfterChange={onAfterChange} isChanged={isChanged}></Unknown>)
            }
        case "range":
            switch (type) {
                case "func":
                    return (props?.item?.render) ? props?.item?.render(auth, item, value, onChange, onAfterChange, isChanged, { partialReplacement, contextObject, objectName, formItem, data }) : undefined;
                case "int":
                case "uint":
                case "integer":
                case "int64":
                case "int32":
                case "uint64":
                case "uint32":
                    return (<RangeInteger auth={auth} formItem={formItem} partialReplacement={partialReplacement} contextObject={contextObject} objectName={objectName} item={item} value={value} onChange={onChange} onAfterChange={onAfterChange} isChanged={isChanged}></RangeInteger>)
                case "double":
                case "float":
                case "float64":
                case "float32":
                    return (<RangeFloat auth={auth} formItem={formItem} partialReplacement={partialReplacement} contextObject={contextObject} objectName={objectName} item={item} value={value} onChange={onChange} onAfterChange={onAfterChange} isChanged={isChanged}></RangeFloat>)
                case "time":
                    return (<RangeTime auth={auth} formItem={formItem} partialReplacement={partialReplacement} contextObject={contextObject} objectName={objectName} item={item} value={value} onChange={onChange} onAfterChange={onAfterChange} isChanged={isChanged}></RangeTime>)
                case "date":
                    return (<RangeDate auth={auth} formItem={formItem} partialReplacement={partialReplacement} contextObject={contextObject} objectName={objectName} item={item} value={value} onChange={onChange} onAfterChange={onAfterChange} isChanged={isChanged}></RangeDate>)
                case "datetime":
                case "time.Time":
                    return (<RangeDateTime auth={auth} formItem={formItem} partialReplacement={partialReplacement} contextObject={contextObject} objectName={objectName} item={item} value={value} onChange={onChange} onAfterChange={onAfterChange} isChanged={isChanged}></RangeDateTime>)
                default:
                    return (<Unknown auth={auth} formItem={formItem} partialReplacement={partialReplacement} contextObject={contextObject} objectName={objectName} item={item} value={value} onChange={onChange} onAfterChange={onAfterChange} isChanged={isChanged}></Unknown>)
            }
        case "slider":
            switch (type) {
                case "func":
                    return (props?.item?.render) ? props?.item?.render(auth, item, value, onChange, onAfterChange, isChanged, { partialReplacement, contextObject, objectName, formItem, data }) : undefined;
                case "int":
                case "uint":
                case "integer":
                case "int64":
                case "int32":
                case "uint64":
                case "uint32":
                    return (<IntegerSlider auth={auth} formItem={formItem} partialReplacement={partialReplacement} contextObject={contextObject} objectName={objectName} item={item} value={value} onChange={onChange} onAfterChange={onAfterChange} isChanged={isChanged}></IntegerSlider>)
                case "double":
                case "float":
                case "float64":
                case "float32":
                    return (<FloatSlider auth={auth} formItem={formItem} partialReplacement={partialReplacement} contextObject={contextObject} objectName={objectName} item={item} value={value} onChange={onChange} onAfterChange={onAfterChange} isChanged={isChanged}></FloatSlider>)
                default:
                    return (<Unknown auth={auth} formItem={formItem} partialReplacement={partialReplacement} contextObject={contextObject} objectName={objectName} item={item} value={value} onChange={onChange} onAfterChange={onAfterChange} isChanged={isChanged}></Unknown>)
            }
        default:
            switch (type) {
                case "func":
                    return (props?.item?.render) ? props?.item?.render(auth, item, value, onChange, onAfterChange, isChanged, partialReplacement, contextObject, objectName, data) : undefined;
                case "text":
                    return (<MultilineText auth={auth} formItem={formItem} partialReplacement={partialReplacement} contextObject={contextObject} objectName={objectName} item={item} value={value} onChange={onChange} onAfterChange={onAfterChange} isChanged={isChanged}></MultilineText>)
                case "string":
                    return (<String auth={auth} formItem={formItem} partialReplacement={partialReplacement} contextObject={contextObject} objectName={objectName} item={item} value={value} onChange={onChange} onAfterChange={onAfterChange} isChanged={isChanged}></String>)
                case "password":
                    return (<Password auth={auth} formItem={formItem} partialReplacement={partialReplacement} contextObject={contextObject} objectName={objectName} item={item} value={value} onChange={onChange} onAfterChange={onAfterChange} isChanged={isChanged}></Password>)
                case "int":
                case "uint":
                case "integer":
                case "int64":
                case "int32":
                case "uint64":
                case "uint32":
                    return (<Integer auth={auth} formItem={formItem} partialReplacement={partialReplacement} contextObject={contextObject} objectName={objectName} item={item} value={value} onChange={onChange} onAfterChange={onAfterChange} isChanged={isChanged}></Integer>)
                case "double":
                case "float":
                case "float64":
                case "float32":
                    return (<Float auth={auth} formItem={formItem} partialReplacement={partialReplacement} contextObject={contextObject} objectName={objectName} item={item} value={value} onChange={onChange} onAfterChange={onAfterChange} isChanged={isChanged}></Float>)
                case "boolean":
                case "bool":
                    return (<Boolean auth={auth} formItem={formItem} partialReplacement={partialReplacement} contextObject={contextObject} objectName={objectName} item={item} value={value} onChange={onChange} onAfterChange={onAfterChange} isChanged={isChanged}></Boolean>)
                case "time":
                    return (<Time auth={auth} formItem={formItem} partialReplacement={partialReplacement} contextObject={contextObject} objectName={objectName} item={item} value={value} onChange={onChange} onAfterChange={onAfterChange} isChanged={isChanged}></Time>)
                case "date":
                    return (<Date auth={auth} formItem={formItem} partialReplacement={partialReplacement} contextObject={contextObject} objectName={objectName} item={item} value={value} onChange={onChange} onAfterChange={onAfterChange} isChanged={isChanged}></Date>)
                case "datetime":
                case "time.Time":
                    return (<DateTime auth={auth} formItem={formItem} partialReplacement={partialReplacement} contextObject={contextObject} objectName={objectName} item={item} value={value} onChange={onChange} onAfterChange={onAfterChange} isChanged={isChanged}></DateTime>)
                case "object":
                case "document":
                    if (item.mode === "dialog") {
                        return (<BigObj auth={auth} formItem={formItem} partialReplacement={partialReplacement} contextObject={contextObject} objectName={objectName} item={item} value={value} onChange={onChange} onAfterChange={onAfterChange} isChanged={isChanged} changed={changed}></BigObj>)
                    } else
                        return (<Obj auth={auth} formItem={formItem} partialReplacement={partialReplacement} contextObject={contextObject} objectName={objectName} item={item} value={value} onChange={onChange} onAfterChange={onAfterChange} isChanged={isChanged} changed={changed}></Obj>)
                case "file":
                    return (<UploadItem auth={auth} formItem={formItem} partialReplacement={partialReplacement} contextObject={contextObject} objectName={objectName} item={item} value={value} onChange={onChange} onAfterChange={onAfterChange} isChanged={isChanged}></UploadItem>)
                case "files":
                    return (<UploadItems auth={auth} formItem={formItem} partialReplacement={partialReplacement} contextObject={contextObject} objectName={objectName} item={item} value={value} onChange={onChange} onAfterChange={onAfterChange} isChanged={isChanged}></UploadItems>)
                case "imageeditor":
                    return (<ImageEditor auth={auth} formItem={formItem} partialReplacement={partialReplacement} contextObject={contextObject} objectName={objectName} item={item} value={value} onChange={onChange} onAfterChange={onAfterChange} isChanged={isChanged}></ImageEditor>)
                case "image":
                    return (<Image auth={auth} formItem={formItem} partialReplacement={partialReplacement} contextObject={contextObject} objectName={objectName} item={item} value={value} onChange={onChange} onAfterChange={onAfterChange} isChanged={isChanged}></Image>)
                default:
                    return (<Unknown auth={auth} formItem={formItem} partialReplacement={partialReplacement} contextObject={contextObject} objectName={objectName} item={item} value={value} onChange={onChange} onAfterChange={onAfterChange} isChanged={isChanged}></Unknown>);
            }

    }
}