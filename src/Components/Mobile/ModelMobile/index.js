import React, { useState, useEffect } from 'react';
import { createUseStyles } from 'react-jss'
import 'moment/locale/ru';
import { Form } from 'antd-mobile';
import { AutoSizer, List as ListVirt } from 'react-virtualized';
import 'react-virtualized/styles.css';
import {
    Typography,
} from 'antd';
import { uncapitalize, GetMeta, GetMetaProperties, formItemRules, isRequired, validator, getLocator } from '../../../Tool';
import { FieldMobile } from '../FieldMobile';
import { useFormObserverContext } from '../../Context';
import { useModelFullReplacement, useModelPartialReplacement } from '../../../ComponetsReplacement';
var _ = require('lodash');
const { Text, Link } = Typography;
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

function Frm(props) {
    const { auth, form, name, meta, options, locator, submit, object, data, virtualized, search, partialReplacement } = props;

    const PartialReplacementFunc = useModelPartialReplacement(name, partialReplacement)

    const classes = useStyles()
    const [changed, setChanged] = useState({ ...object });
    useEffect(() => {
        form.resetFields();
        if (object) {
            form.setFieldsValue(object);
        }
    }, [object])
    var properties = GetMetaProperties(meta);
    if (!properties) return <React.Fragment></React.Fragment>;
    const propertiesFiltered = properties?.filter(e => (!e.name || (e.name && e.name.toUpperCase() !== "ID")))?.filter(e => (!e.relation || (e.relation && e.relation.type !== "one-many")));
    const propertiesOneMany = properties?.filter(e => e.relation && e.relation.type === "one-many");
    const propertiesDocuments = properties?.filter(e => e.type === "document");

    // item: {
    //     validators: {
    //         required: false
    //     }
    // }
    // item: {
    //     validators: [
    //         { required: true, message: 'Пожалуйста, выберите значение!' },
    //         { type: "array", required: true, message: 'Пожалуйста, выберите значение!' },
    //         { func: (value)=>{ return true }, message: 'Пожалуйста, выберите значение!' },
    //     ]
    // }

    const splitedValue = (name, value) => {
        let words = name?.split(",");
        let o = {};
        if (words && words.length > 1) {
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
        let words = name?.split(",");
        if (words && words.length > 1) {
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
        // console.log(value, item, obj);
        if (item && item.duplex && (item.type === "object" || item.type === "action")) {
            setChanged({ ...changed, ...splitedValue(item.name, value), ...splitedValue(item.duplex, obj) });
        } else if (item) {
            setChanged({ ...changed, ...splitedValue(item.name, value) });
        }
    };
    const propertiesVirtualized = propertiesFiltered?.filter(e => !!e);
    const [isChangedForm, isChangedField, onValuesChange] = useFormObserverContext()

    const virtualizedItem = (item, idx) => {
        if (!item.name && item.type === "func" && item.render) {
            return <div key={"func_" + idx}>
                {item.render(auth, item, { data, object })}
            </div>
        }
        if (item && !item.view || (item && item.view && item.view.unvisible === false)) {
            return (
                <Form.Item
                    preserve={(item.hidden) ? "true" : "false"}
                    hidden={item.hidden}

                    className={classes.FormItem}
                    key={idx}
                    name={uncapitalize(item.name)}
                    rules={formItemRules(item)}
                >
                    <FieldMobile
                        className={classes.Field}
                        auth={auth}
                        item={item}
                        objectName={name}
                        data={data}
                        onChange={onFieldChange}
                        changed={changed}
                        isChanged={(isChangedField) ? isChangedField(uncapitalize(item.name)) : undefined} />
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
            <div key={key} style={style} data-locator={getLocator(props?.locator || name || "model-field", propertiesVirtualized[index])}>
                {virtualizedItem(propertiesVirtualized[index], index)}
            </div>
        );
    }

    return (
        <div data-locator={getLocator(props?.locator || name || "model", props?.object)} className='model default-model'>
            <div>
                {PartialReplacementFunc && <div className='partial-replacement'>
                    <PartialReplacementFunc
                        {...props}
                        properties={properties}
                        propertiesFiltered={propertiesFiltered}
                        propertiesOneMany={propertiesOneMany}
                        tailScheme={tailScheme}
                    />
                </div>}
                {!PartialReplacementFunc && <Form
                    form={form}
                    onValuesChange={onValuesChange}
                    onFinish={(values) => {
                        submit(splitedObject(values));
                    }}
                    layout={"vertical"}
                    initialValues={{
                        ...mergedObject(propertiesVirtualized, object)
                    }}
                    {...options}
                    style={{ height: "100%", width: "100%" }}
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
                </Form>}
            </div>
        </div>
    )
}

export function ModelMobile(props) {
    const { auth, name, meta, options, form, submit, object, data, locator, virtualized, search, steps, partialReplacement, fullReplacement } = props;
    const classes = useStyles()
    const FullReplacementFunc = useModelFullReplacement(name, fullReplacement)
    if (FullReplacementFunc) {
        return (<div className='model full-replacement'>
            <FullReplacementFunc
                {...props}
            />
        </div>)
    }
    var xmeta = GetMeta(meta);
    if (!xmeta) return <React.Fragment></React.Fragment>;
    return (
        <React.Fragment>
            {<Frm className={classes.Frm}
                partialReplacement={partialReplacement}
                auth={auth} form={form} name={name} meta={meta} options={options} submit={submit} object={object} data={data} virtualized={virtualized} search={search} steps={steps} locator={locator}></Frm>}
        </React.Fragment>
    )
};