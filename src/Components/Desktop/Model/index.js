import React, { useState, useEffect, useCallback } from 'react';
import {
    Form,
    Tooltip,
    Tag,
    Tabs,
    Drawer
} from 'antd';
import { GetMeta, GetMetaProperties, formItemRules, isRequired, validator, getObjectDisplay, uncapitalize, getObjectValue, QueryDetail, QueryOrder, clean, QueryParam, queryFiltersToContextFilter, contextFilterToObject, QueryFiltersToContextFilters, getDisplay, getLocator } from '../../../Tool';
import { Field } from '../Field';
import { useFormObserverContext, useMetaContext } from '../../Context';
import { CollectionServer } from '../CollectionServer';
import { useModelFullReplacement, useModelPartialReplacement } from '../../../ComponetsReplacement';
var _ = require('lodash');
const { CheckableTag } = Tag;
const { TabPane } = Tabs;

function Frm(props) {
    const { auth, form, name, meta, options, object, data, locator, submit, funcStat, contextFilters, links, scheme, linksCompareFunction, contextObject,
        queryDetail,
        modelActions,
        collectionActions,
        partialReplacement
    } = props;


    const PartialReplacementFunc = useModelPartialReplacement(name, partialReplacement)

    const [visible, setVisible] = useState(false);

    const [excludeFields, setExcludeFields] = useState();
    // const [fieldsFilters, setFieldsFilters] = useState({});

    useEffect(() => {
        form.resetFields();
        if (object) {
            form.setFieldsValue(object);
        }
    }, [object])
    
    useEffect(() => {
        let ctxFlt = contextFilterToObject(contextFilters);
        setExcludeFields(ctxFlt);
    }, [contextFilters]);

    const gmeta = useMetaContext();
    const filtersFromMeta = React.useCallback((name) => {
        let prop = [];
        let p = _.get(gmeta[name], "properties");
        //console.log(name, gmeta[name?.toLowerCase()], p);
        if (p) {
            prop = p?.filter(e => _.get(e, "relation.type") !== "one-many")?.map(e => ({ ...e, sort: true, filter: true, func: (e.filterType == "range") ? ["min", "max"] : undefined }))
        }
        return prop;
    }, [gmeta]);
    
    var properties = GetMetaProperties(meta);
    if (!properties) return <React.Fragment></React.Fragment>;
    const propertiesFiltered = properties?.filter(e => (!e.name || (e.name && e.name.toUpperCase() !== "ID")))?.filter(e => (!e.relation || (e.relation && e.relation.type !== "one-many")));
    let propertiesOneMany = properties?.filter(e => e.relation && e.relation.type === "one-many");
    let tailScheme = undefined
    if (scheme && !scheme.length) {
        propertiesOneMany = []
    }
    if (scheme?.length) {
        let headScheme = {}
        tailScheme = []
        for (let i = 0; i < scheme.length; i++) {
            const element = scheme[i].toLowerCase();
            let arr = element.split(".")

            if (arr && arr.length && arr[0]) {
                headScheme[arr[0]] = true
                arr.splice(0, 1);
                if (arr && arr.length) {
                    let c = arr.join(".")
                    tailScheme.push(c)
                }
            }
        }
        let func = (linksCompareFunction) ? linksCompareFunction : (e) => _.get(e, "name");
        propertiesOneMany = propertiesOneMany?.filter(e => {
            return (func(e) && (headScheme[func(e)?.toLowerCase()]))
        })
    }

    // const propertiesDocument = properties?.filter(e => e.relation && e.relation.type === "polymorphic");
    // const propertiesDocuments = properties.filter(e => e.type === "document");

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

    const [isChangedForm, isChangedField, onValuesChange] = useFormObserverContext()
    const [clipboardVisible, setClipboardVisible] = useState(false)

    // const PartialReplacementFunc = useFieldPartialReplacement(_.get(item, "relation.reference.object"), partialReplacement)
    const display = useCallback((item, value) => {
        if (item && value) {
            if (item.display && _.isFunction(item.display)) {
                return item.display(value)
            } else if (item.relation && item.relation.display && _.isFunction(item.relation.display)) {
                return item.relation.display(value)
                // } else if (PartialReplacementFunc) {
                //     return PartialReplacementFunc({ item, value, changed, contextObject, objectName })
            } else {
                let fieldMeta = gmeta[getObjectValue(item, "relation.reference.object")];
                let _display = ((item?.relation?.display?.fields) ? item?.relation?.display : undefined) || ((fieldMeta?.display?.fields) ? fieldMeta?.display : undefined)
                return getDisplay(value, _display, fieldMeta, gmeta)
            }
        }
        return "";
    }, [gmeta]);
    
    if (!excludeFields) return (<React.Fragment></React.Fragment>)
        
    return (
        <div data-locator={getLocator(props?.locator || name || "model", props?.object)} className='model default-model'>
            {(object && links && links !== "inline" && propertiesOneMany && propertiesOneMany.length > 0) &&
                <div className='bg bg-grey' style={{ textAlign: "left", marginBottom: "5px", padding: "3px 5px", display: "flex", justifyContent: "space-between", gap: "5px" }}>
                    <div style={{ flex: "1 1 auto" }}>
                        {(meta.name && visible == true) && <div style={{ fontSize: "12px", color: "grey" }}>
                            <div>{meta?.label}</div>
                        </div>}
                        <div>{(meta.name && visible == true) && getObjectDisplay(object, meta.name, gmeta)}</div>
                    </div>
                    <div style={{ flex: "0 0" }}>
                        <Tooltip title="Связи">
                            <CheckableTag

                                style={{ margin: "0px", marginInlineEnd: "0px" }}
                                checked={visible}
                                onChange={checked => setVisible(checked)}
                            >
                                <i className="fa fa-link"></i>
                            </CheckableTag>
                        </Tooltip>
                    </div>
                </div>}
            <div style={{ display: (!visible) ? "block" : "none" }}>
                {PartialReplacementFunc && <div className='partial-replacement'>
                    <PartialReplacementFunc
                        {...props}
                        properties={properties}
                        propertiesFiltered={propertiesFiltered}
                        propertiesOneMany={propertiesOneMany}
                        tailScheme={tailScheme}
                    />
                </div>}
                {!PartialReplacementFunc && <Form form={form}
                    onFinish={submit}
                    onValuesChange={onValuesChange}
                    initialValues={{
                        ...object
                    }}
                    {...options}
                    labelAlign={"left"}
                    layout={"vertical"}>
                    {propertiesFiltered?.filter(e => (e.name && (excludeFields[e.name?.toLowerCase()] || excludeFields[e.name?.toLowerCase() + "ID"])) ? false : true)?.map((item, idx) => {
                        if (!item?.name && item.type === "func" && item.render) {
                            return <div key={"func_" + idx}>
                                {item.render(auth, item, { data, object, contextObject, funcStat })}
                            </div>
                        }
                        return (<Form.Item
                            preserve={(item.hidden) ? "true" : "false"}
                            hidden={item.hidden}
                            key={item?.name}
                            name={(item.type !== "object" && item.type !== "document") ? uncapitalize(item?.name) : uncapitalize(item?.name) + "ID"}
                            label={(item.type !== "bool" && item.type !== "boolean") ? item.label : undefined}
                            rules={formItemRules(item)}
                            data-locator={getLocator(props?.locator || name || "model", props?.object)}
                        >
                            <Field
                                mode="model"
                                key={item?.name}
                                objectName={name}
                                contextObject={contextObject}
                                auth={auth}
                                formItem={true}
                                data={data}
                                // filter={fieldsFilters[item?.name?.toLowerCase()]}
                                item={{ ...item, filterType: undefined, func: (funcStat && funcStat[item?.name?.toLowerCase()]) ? funcStat[item?.name?.toLowerCase()] : {} }}

                                isChanged={(isChangedField) ? isChangedField((item.type !== "object" && item.type !== "document") ? uncapitalize(item?.name) : uncapitalize(item?.name) + "ID") : undefined}
                            />
                        </Form.Item>);
                    })}
                </Form>}
            </div>
            <div>
                {(object && object?.ID && propertiesOneMany && propertiesOneMany?.length > 0 && links) && <div style={{ display: (visible || links === "inline") ? "block" : "none" }}>
                    <Tabs>
                        {propertiesOneMany.map((e, idx) => {
                            let p = getObjectValue(e, "relation.reference.property");
                            let n = getObjectValue(e, "relation.reference.object");
                            let f = getObjectValue(e, "name");

                            var uif = _.get(e, "relation.uiFilter");
                            let queryFilter = e?.queryFilter || _.get(e, "relation.reference.queryFilter") || _.get(e, "relation.reference.filter");
                            let count = e?.count || _.get(e, "relation.reference.count");
                            let url = e?.source || getObjectValue(e, "relation.reference.url") || getObjectValue(e, "relation.reference.source");

                            if (!n) return;
                            return (<TabPane data-locator={getLocator(props?.locator || "model-collection" + name || "model-collection", props?.object)} tab={e.label} key={idx}>
                                <CollectionServer
                                    auth={auth}
                                    name={n}
                                    // locator={n}
                                    source={url}
                                    count={() => (count || 20)}
                                    field={e}
                                    fieldName={f}
                                    contextObject={object}
                                    linksCompareFunction={linksCompareFunction}
                                    contextFilters={() => (object) ? [
                                        {
                                            // action: true,
                                            // method: "eq",
                                            name: p,
                                            value: object.ID
                                        },
                                        ...QueryFiltersToContextFilters(queryFilter)
                                    ] : [
                                        ...QueryFiltersToContextFilters(queryFilter)
                                    ]}
                                    filters={() => (uif) ? uif() : filtersFromMeta(n)}
                                    mode="list"
                                    render={(o, idx) => {
                                        return display(e, o)
                                        // <div style={{ padding: "0px 5px" }}>
                                        //     <div>{getObjectDisplay(item, n, gmeta)}</div>
                                        //     <div style={{ color: "#6a6a6a" }}></div>
                                        // </div>
                                    }}

                                    linksModelActions={links}
                                    scheme={tailScheme}
                                    queryDetail={queryDetail}
                                    modelActions={modelActions}
                                    collectionActions={collectionActions}
                                />
                            </TabPane>
                            )
                        })}
                    </Tabs>
                </div>}

            </div>
            {/* <i className="fa fa-clone"></i>
            <i className="fa fa-clipboard"></i>
            <i className="fa fa-bookmark"></i>
            <i className="fa fa-bookmark-o"></i> */}
            {/* <Drawer
                title="Буфер обмена"
                placement="right"
                closable={false}
                onClose={() => { setClipboardVisible(false) }}
                open={clipboardVisible}
                getContainer={false}
            >
                <div>
                    <i className="fa fa-clipboard"></i>
                </div>
            </Drawer> */}
        </div>
    )
}

export function Model(props) {
    const { auth, name, meta, options, object, data, locator, form, submit, funcStat, contextFilters, links, scheme, linksCompareFunction, contextObject,
        queryDetail,
        modelActions,
        collectionActions,
        partialReplacement,
        fullReplacement
    } = props;

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
            {(props?.subheader) ? props?.subheader : <React.Fragment></React.Fragment>}
            {<Frm
                auth={auth}
                form={form}

                partialReplacement={partialReplacement}

                links={links}
                contextObject={contextObject}
                queryDetail={queryDetail}
                modelActions={modelActions}
                collectionActions={collectionActions}
                scheme={scheme}
                linksCompareFunction={linksCompareFunction}
                contextFilters={contextFilters}
                submit={submit}
                name={name}
                meta={meta}
                options={options}
                object={object}
                data={data}
                locator={locator}
                funcStat={funcStat}></Frm>}
        </React.Fragment>
    )
};