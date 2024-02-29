import React, { useState, useEffect } from 'react';
import {
    Form,
    Tooltip,
    Tag,
    Tabs
} from 'antd';
import Icofont from 'react-icofont';
import { GetMeta, GetMetaProperties, formItemRules, isRequired, validator, getObjectDisplay, uncapitalize, getObjectValue, QueryDetail, QueryOrder } from '../../../Tool';
import { Field } from '../Field';
import { useFormObserverContext, useMetaContext } from '../../Context';
import { CollectionServer } from '../CollectionServer';
var _ = require('lodash');
const { CheckableTag } = Tag;
const { TabPane } = Tabs;

function Frm(props) {

    const { auth, form, meta, options, object, submit, funcStat, contextFilters, links,
        queryDetail,
        defaultModelActions,
        defaultnModelActionMeta,
        defaultCollectionActions,
        defaultCollectionActionMeta
    } = props;
    const [visible, setVisible] = useState(false);
    const [excludeFields, setExcludeFields] = useState({});
    const [fieldsFilters, setFieldsFilters] = useState({});

    useEffect(() => {
        form.resetFields();
        if (object) {
            form.setFieldsValue(object);
        }
    }, [object])
    useEffect(() => {
        let fldFlt = {};
        let ctxFlt = {};
        if (contextFilters) {
            let ctx = contextFilters();
            if (_.isArray(ctx)) {
                ctx.forEach(item => {
                    if (item.action) {
                        ctxFlt[item.name.toLowerCase()] = item.value;
                    } else {
                        fldFlt[item.name.toLowerCase()] = item.value;
                    }
                });
            }
        }
        setFieldsFilters(fldFlt);
        setExcludeFields(ctxFlt);
    }, [contextFilters]);

    const gmeta = useMetaContext();
    const filtersFromMeta = React.useCallback((name) => {
        let prop = [];
        let p = _.get(gmeta[name.toLowerCase()], "properties");
        if (p) {
            prop = p?.filter(e => _.get(e, "relation.type") !== "one-many")?.map(e => ({ ...e, sort: true, filter: true, func: (e.filterType == "range") ? ["min", "max"] : undefined }))
        }
        return prop;
    }, [gmeta]);

    var properties = GetMetaProperties(meta);
    if (!properties) return <React.Fragment></React.Fragment>;
    const propertiesFiltered = properties?.filter(e => (!e.name || (e.name && e.name.toUpperCase() !== "ID")))?.filter(e => (!e.relation || (e.relation && e.relation.type !== "one-many")));
    const propertiesOneMany = properties?.filter(e => e.relation && e.relation.type === "one-many");

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
console.log(object);
    return (
        <div>
            {(object && links && propertiesOneMany && propertiesOneMany.length > 0) &&
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
                                <Icofont icon="icofont-link-alt" />
                            </CheckableTag>
                        </Tooltip>
                    </div>
                </div>}
            <div style={{ display: (!visible) ? "block" : "none" }}>
                <Form form={form}
                    onFinish={submit}
                    onValuesChange={onValuesChange}
                    initialValues={{
                        ...object
                    }}
                    {...options}
                    labelAlign={"left"}
                    layout={"vertical"}>
                    {propertiesFiltered?.filter(e => (e.name && excludeFields[e.name.toLowerCase()]) ? false : true)?.map((item, idx) => {
                        if (!item.name && item.type === "func" && item.render) {
                            return <div key={"func_" + idx}>
                                {item.render(auth, item)}
                            </div>
                        }
                        return (<Form.Item
                            preserve={(item.hidden) ? "true" : "false"}
                            hidden={item.hidden}
                            key={item.name}
                            name={(item.type !== "object" && item.type !== "document") ? uncapitalize(item.name) : uncapitalize(item.name) + "ID"}
                            label={(item.type !== "bool" && item.type !== "boolean") ? item.label : undefined}
                            rules={formItemRules(item)}
                        >
                            <Field
                                mode="model"
                                key={item.name}
                                auth={auth}
                                filter={fieldsFilters[item.name.toLowerCase()]}
                                item={{ ...item, filterType: undefined, func: (funcStat && funcStat[item.name.toLowerCase()]) ? funcStat[item.name.toLowerCase()] : {} }}

                                isChanged={(isChangedField) ? isChangedField((item.type !== "object" && item.type !== "document") ? uncapitalize(item.name) : uncapitalize(item.name) + "ID") : undefined}
                            />
                        </Form.Item>);
                    })}
                </Form>
            </div>
            {object && <div style={{ display: (visible) ? "block" : "none" }}>
                <Tabs>
                    {propertiesOneMany.map((e, idx) => {
                        let p = getObjectValue(e, "relation.reference.property");
                        let n = getObjectValue(e, "relation.reference.object");
                        if (!n) return;
                        return (<TabPane tab={e.label} key={idx}>
                            <CollectionServer
                                auth={auth}
                                name={n}
                                contextFilters={() => (object) ? [
                                    {
                                        action: true,
                                        // method: "eq",
                                        name: p,
                                        value: object.ID
                                    }
                                ] : []}
                                filters={() => filtersFromMeta(n)}
                                mode="list"
                                render={(item, idx) => (
                                    <div style={{ padding: "0px 5px" }}>
                                        <div>{getObjectDisplay(item, n, gmeta)}</div>
                                        <div style={{ color: "#6a6a6a" }}></div>
                                    </div>
                                )}

                                linksModelActions={links}

                                queryDetail={queryDetail}
                                defaultModelActions={defaultModelActions}
                                defaultnModelActionMeta={defaultnModelActionMeta}
                                defaultCollectionActions={defaultCollectionActions}
                                defaultCollectionActionMeta={defaultCollectionActionMeta}
                            />
                        </TabPane>
                        )
                    })}
                </Tabs>
            </div>}
        </div>
    )
}

export function Model(props) {
    const { auth, meta, options, object, form, submit, funcStat, contextFilters, links,
        queryDetail,
        defaultModelActions,
        defaultnModelActionMeta,
        defaultCollectionActions,
        defaultCollectionActionMeta,
    } = props;
    var xmeta = GetMeta(meta);
    if (!xmeta) return <React.Fragment></React.Fragment>;
    return (
        <React.Fragment>
            {(props?.subheader) ? props?.subheader : <React.Fragment></React.Fragment>}
            {<Frm
                auth={auth}
                form={form}

                links={links}
                queryDetail={queryDetail}
                defaultModelActions={defaultModelActions}
                defaultnModelActionMeta={defaultnModelActionMeta}
                defaultCollectionActions={defaultCollectionActions}
                defaultCollectionActionMeta={defaultCollectionActionMeta}

                contextFilters={contextFilters}
                submit={submit}
                meta={meta}
                options={options}
                object={object}
                funcStat={funcStat}></Frm>}
        </React.Fragment>
    )
};