import React, { useState, useEffect } from 'react';
import { createUseStyles } from 'react-jss'
import 'moment/locale/ru';
import {
    Form,
    Tooltip,
    Tabs,
    Tag
} from 'antd';
import Icofont from 'react-icofont';
import { GetMeta, GetMetaProperties, getObjectDisplay, getObjectValue, uncapitalize } from '../../../Tool';
import { Field } from '../Field';

// Circular dependency: 
// src/Components/Desktop/Model/index.js -> 
// src/Components/Desktop/CollectionServer/index.js -> 
// src/Components/Desktop/Model/index.js

// import { CollectionServer } from '../CollectionServer';
import { useMetaContext } from '../../Context';
var _ = require('lodash');

const { TabPane } = Tabs;
const { CheckableTag } = Tag;

const useStyles = createUseStyles({
    FormNav: {
        display: "flex",
        justifyContent: "space-between",
        paddingBottom: "10px",
    },
    FormItem: {
    },
    Field: {},
    Unknown: {},
    Obj: {},
    Time: {},
    Boolean: {},
    Float: {},
    Integer: {},
    String: {},
    Frm: {},
})

function isRequired(item) {
    if (item && item.validators) {
        return item.validators.required;
    }

    return false;
}

function Frm(props) {
    const classes = useStyles()
    const { auth, form, meta, options, object, submit, funcStat, contextFilters } = props;
    const [visible, setVisible] = useState(false);
    const [excludeFields, setExcludeFields] = useState({});
    const [fieldsFilters, setFieldsFilters] = useState({});
    // useEffect(() => {
    //     form.resetFields();
    // }, []);
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
    const propertiesFiltered = properties?.filter(e => e.name.toUpperCase() !== "ID")?.filter(e => (!e.relation || (e.relation && e.relation.type !== "one-many")));
    const propertiesOneMany = properties?.filter(e => e.relation && e.relation.type === "one-many");

    return (
        <div>
            {(object && propertiesOneMany && propertiesOneMany.length > 0) &&
                <div className={classes.FormNav}>
                    <div>
                        {(meta.name && visible == true) && getObjectDisplay(object, meta.name, gmeta)}
                    </div>
                    <div>
                        <Tooltip title="Связи">
                            <CheckableTag
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
                    initialValues={{
                        ...object
                    }}
                    {...options}
                    labelAlign={"left"}
                    layout={"vertical"}>
                    {propertiesFiltered?.filter(e => (excludeFields[e.name.toLowerCase()]) ? false : true)?.map((item) => {
                        return (
                            <Form.Item className={classes.FormItem}
                                preserve={(item.hidden) ? "true" : "false"}
                                hidden={item.hidden}
                                key={item.name}
                                name={(item.type !== "object" && item.type !== "document") ? uncapitalize(item.name) : uncapitalize(item.name) + "ID"}
                                label={(item.type !== "bool" && item.type !== "boolean") ? item.label : undefined}
                                rules={[{ required: isRequired(item), message: 'Укажите ' + item.label.toLowerCase() + '!' }]}
                            >
                                <Field
                                    mode="model"
                                    className={classes.Field}
                                    key={item.name}
                                    auth={auth}
                                    filter={fieldsFilters[item.name.toLowerCase()]}
                                    item={{ ...item, filterType: undefined, func: (funcStat && funcStat[item.name.toLowerCase()]) ? funcStat[item.name.toLowerCase()] : {} }}
                                />
                            </Form.Item>
                        );
                    })}
                </Form>
            </div>
            {/* <div style={{ display: (visible) ? "block" : "none" }}>
                <Tabs>
                    {propertiesOneMany?.map((e, idx) => {
                        let p = getObjectValue(e, "relation.reference.property");
                        let n = getObjectValue(e, "relation.reference.object");
                        if (!n) return;
                        return (<TabPane tab={e.label} key={idx}>
                            <CollectionServer
                                auth={auth}
                                name={n.toLowerCase()}
                                contextFilters={() => (object) ? [
                                    {
                                        action: true,
                                        // method: "eq",
                                        name: p,
                                        value: object.ID
                                    }
                                ] : []}
                                filters={() => filtersFromMeta(n.toLowerCase())}
                                columns={() => [
                                    {
                                        key: "meta",
                                        title: "Описание",
                                        render: (text, record) => {
                                            return (getObjectDisplay(record, n, gmeta));
                                        }
                                    }
                                ]}

                                // mode={"list"}
                                // render={(item, idx, { setCollection, setCollectionItem, removeCollectionItem, update }) => (<div>
                                //     {getObjectDisplay(item, n, gmeta)}
                                // </div>)}

                                form={Model}
                                size={"small"}
                                defaultModelActions={true}
                                defaultCollectionActions={true}
                            />
                        </TabPane>
                        )
                    })}
                </Tabs>
            </div> */}
        </div>
    )
}

export function Model(props) {
    const classes = useStyles()
    const { auth, meta, options, object, form, submit, funcStat, contextFilters } = props;
    var xmeta = GetMeta(meta);
    if (!xmeta) return <React.Fragment></React.Fragment>;
    return (
        <React.Fragment>
            {<Frm className={classes.Frm} auth={auth} form={form} contextFilters={contextFilters} submit={submit} meta={meta} options={options} object={object} funcStat={funcStat}></Frm>}
        </React.Fragment>
    )
};