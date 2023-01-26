import React, { useState, useEffect, useCallback } from 'react';
import ScrollLocker from 'rc-util/lib/Dom/scrollLocker';
import { Form, Input } from 'antd';
import { useMediaQuery } from 'react-responsive'
import { IfElse, Request, messageError, makeFormData, eventExecution, unpackFormFields, pushStateHistoryModal, preventDefault, unsubscribe, subscribe } from '../../Tool';
import useStyles from '../Styles';

import { Spin, Button, Tooltip, Tag, Modal } from 'antd';
import {
    SwipeAction as MobileSwipeAction,
    Modal as MobileModal,
    List as MobileList,
    Popup,
    SpinLoading
} from 'antd-mobile';
import RenderToLayer from '../RenderToLayer'
import Icofont from 'react-icofont';
import { EllipsisOutlined } from '@ant-design/icons';

var _ = require('lodash');

function closest(el, selector) {
    const matchesSelector = el.matches || el.webkitMatchesSelector || el.mozMatchesSelector || el.msMatchesSelector;
    while (el) {
        if (matchesSelector.call(el, selector)) {
            return el;
        }
        el = el.parentElement;
    }
    return null;
}
const onWrapTouchStart = (e) => {
    // fix touch to scroll background page on iOS
    if (!/iPhone|iPod|iPad/i.test(navigator.userAgent)) {
        return;
    }
    const pNode = closest(e.target, '.am-modal-content');
    if (!pNode) {
        e.preventDefault();
    }
}
const CurrentForm = (props) => {
    const { current, steps, object, action, setSubmit } = props;
    const [frm] = Form.useForm();
    const item = React.useMemo(() => steps[current], [steps, current]);
    const F = React.useMemo(() => item.form, [item]);// || Model;
    useEffect(() => {
        if (setSubmit) {
            if (item.noAntForm) {
                setSubmit(action, current);
            } else {
                setSubmit(frm.submit, current);
            }
        }
    }, [item, setSubmit, action, current, frm]);
    const newData = React.useMemo(() => ({ ...item.object, ...object[steps[current].key] }), [item, object, steps, current]);
    const cstep = React.useMemo(() => item.steps || steps, [item, steps]);
    const csubheader = React.useMemo(() => (item.titles && item.titles.subheader) ? item.titles.subheader : "", [item]);
    return <F
        idx={current}
        submit={action}
        object={newData}
        data={object}

        auth={props.auth}
        meta={item.meta}
        options={item.options}
        virtualized={item.virtualized}
        search={item.search}
        steps={cstep}
        subheader={csubheader}
        form={frm}
    />
};

export function ActionPickerItem({ auth, item, mode, value, onChange }) {
    const classes = useStyles()
    const _brief = React.useMemo(() => (!value) ? undefined : (item.display) ? item.display(value) : value, [value, item]);
    const okText = React.useMemo(() => item.okText || "Выбрать", [item]);
    const dismissText = React.useMemo(() => item.dismissText || "Отмена", [item]);
    const triggerOptions = {
        className: classes.Act
    };
    const placeholder = React.useMemo(() => item.placeholder || "выберите " + item.label.toLowerCase(), [item]);
    const titles = React.useMemo(() => (item.titles) ? item.titles : {
        header: item.label,
        subheader: "",
    }, [item]);
    const _action = React.useCallback((values, unlock, close) => {
        if (onChange) {
            onChange((item.modify) ? item.modify(values) : values, item, (item.modifyDuplex) ? item.modifyDuplex(values) : undefined);
        }
        close();
    }, [onChange, item]);
    const swipe = React.useMemo(() => [
        {
            key: 'danger',
            text: (<Icofont icon="close" />),
            onClick: () => {
                if (onChange) {
                    onChange(undefined, item, undefined);
                }
            },
            color: 'danger',
        },
    ], [onChange, item]);
    // item: {
    //     label: "",
    //     placeholder: "",
    //     titles: {},
    //     display: "",
    //     okText: "",
    //     dismissText: "",
    //     form: ,
    //     meta: ,
    //     steps: ,
    //     modify: (values)=>{},
    //     modifyDuplex: (values)=>{},
    // }
    return (<React.Fragment>
        <Action
            mode={mode}
            auth={auth}

            form={item.form}
            meta={item.meta}
            steps={item.steps}

            object={value}
            brief={_brief}

            okText={okText}
            dismissText={dismissText}

            triggerOptions={triggerOptions}
            triggerStyle={item.triggerStyle}
            placeholder={placeholder}
            closable={false}

            titles={titles}
            action={_action}
            swipe={swipe}
        />
    </React.Fragment>);
}
export const FooterButton = ({ key, name, callback, options, isDesktopOrLaptop }) => {
    if (isDesktopOrLaptop) {
        return (<Button key={key} onClick={callback} {...options}>{name}</Button>);
    } else {
        const btn = { text: name, onPress: callback, options };
        return (btn);
    }
}
export function Action(props) {
    const classes = useStyles()
    const isDesktopOrLaptop = useMediaQuery({ minDeviceWidth: 1224 })
    // const isPortrait = useMediaQuery({ orientation: 'portrait' })

    // Props 
    const {
        fire,
        fireClose,
        callback,
        excludeKeyPressed,
        hideMenu,
        isFormData,
        steps,
        modify,

        // footer, - функция должна возвращать массив объектов для FooterButton
        // trigger,
        // content,

        visible,
        mode,
        readonly,
        disabled,
        formWraperStyle,
        triggerStyle,
        triggerOptions,
        titles,
        brief,
        placeholder,
        swipe,
        object,
        okText,
        dismissText,
        nextText,
        backText,
        noAntForm,
        uuid
    } = props;

    // Helpers
    const scrollLocker = new ScrollLocker();

    // Internal States
    const [loading, setLoading] = useState(false);
    const [opened, setOpened] = useState(false);

    // ---------------------------------
    const [stepObject, setStepObject] = useState({});
    const [currentStep, setCurrentStep] = useState(0);

    const [form] = Form.useForm();
    const closePopup = useCallback(() => {
        form.resetFields();
        close();
    }, [form]);
    const ContentForm = props.form;
    // ---------------------------------
    const stack = [];
    const getStack = useCallback(() => {
        return stack;
    }, []);
    // ---------------------------------
    useEffect(
        () => {
            if (uuid) {
                var token_click = subscribe(`action.${uuid}.click`, function (msg, data) {
                    click();
                });
            }
            return () => {
                if (uuid) {
                    unsubscribe(`action.${uuid}`);
                }
            };
        }, [uuid])
    // ---------------------------------        
    var available = true;
    useEffect(
        () => {
            available = true;
            // if (mode && mode !== "inline") {
            //     console.log("lock",mode);
            //     scrollLocker.lock();
            // }
            return () => {
                available = false;

                // if (mode && mode !== "inline") {
                //     console.log("unLock",mode);
                //     scrollLocker.unLock();
                // }
            };
        },
        [ /* TODO: memoization parameters here */]
    );
    // ---------------------------------
    let submitCache = React.useMemo(() => ({}), []);
    const execStep = React.useCallback((current) => {
        if (submitCache[current]) {
            submitCache[current]();
        }
    }, [submitCache]);
    const setSubmit = (submit, current) => {
        submitCache[current] = submit;
    };
    // ---------------------------------
    const unlock = React.useCallback(() => {
        setLoading(false);
    }, []);
    const close = React.useCallback(() => {
        setCurrentStep(0);
        setLoading(false);
        if (mode !== "inline") {
            if (props.onClose) {
                props.onClose();
            }
            if (fire && fireClose) {
                fireClose();
            } else {
                window.history.back();
            }
        } else {
            //setOpened(false);
        }
    }, [mode, fire, fireClose, props.onClose]);
    // ---------------------------------
    const click = React.useCallback((e) => {
        if (excludeKeyPressed && excludeKeyPressed(e)) {
            return;
        }
        if ((!steps && ContentForm) || steps) {
            if (available == true) {
                pushStateHistoryModal(setOpened, getStack);
                setOpened(true);
            };
        } else {
            action({});
        }
        if (hideMenu) {
            hideMenu();
        }
    }, [steps, excludeKeyPressed, hideMenu, props.collection])
    const action = React.useCallback((_values) => {
console.log("isFormData",isFormData);
        let values = eventExecution(modify, _values, {});

        values = IfElse(form, unpackFormFields(form, values), values);
        values = IfElse(isFormData, makeFormData(values), values);

        setLoading(true);
        Request(values,
            IfElse(
                !!props.action,
                props,
                {
                    action: {
                        method: (!isFormData) ? "POST" : "POSTFormData",
                        path: `/api/` + props.document,
                        onClose: ({ unlock, close }, context) => close(),
                        onDispatch: (values, context) => () => callback, // callback(response, values, unlock, close, properties),
                        onError: (err, type, { unlock, close }) => {
                            unlock();
                            messageError(err);
                        },
                    }
                }
            ),
            {
                auth: props.auth,
                collection: props.collection || [],
                setCollection: props.setCollection || (() => { }),
                onData: (values, context) => values.data,
                unlock,
                close,
            }
        );
    }, [modify, form, isFormData, callback, props.action, props.document, props.collection, props.setCollection, props.auth]);
    // ---------------------------------
    const prev = React.useCallback(() => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        } else {
            closePopup();
        }
    }, [currentStep, closePopup]);
    const next = React.useCallback((values, item, currentStep) => {
        if (currentStep < steps.length - 1) {
            if (item && item.action) {
                setLoading(true);
                item.action(values,
                    () => setLoading(false),
                    (v) => {
                        let o = {
                            ...stepObject,
                            [steps[currentStep].key]: { ...steps[currentStep].object, ...v }
                        };
                        setStepObject(o);
                        setCurrentStep(currentStep + 1);
                        setLoading(false);
                    });
            } else {
                setStepObject(values);
                setCurrentStep(currentStep + 1);
            }
        } else {
            let o = {
                ...stepObject,
                [steps[currentStep].key]: { ...steps[currentStep].object, ...values }
            };
            action(o);
        }
    }, [steps, stepObject]);
    // ---------------------------------
    const FooterDismissFunction = () => {
        if (steps && currentStep > 0) {
            return prev;
        } else {
            if (mode !== "inline") {
                return closePopup
            } else return undefined
        }
    }
    const FooterOkFunction = () => {
        if (steps) {
            return () => {
                // console.log("execStep",submitCache);
                execStep(currentStep);
            }
        } else {
            return form.submit
            // return action
        }
    }
    const FooterDismissButtons = () => {
        if (steps && currentStep > 0) {
            return [
                FooterButton({
                    key: "dismiss",
                    name: backText || 'Назад',
                    callback: FooterDismissFunction(),
                    options: {
                        type: "ghost"
                    },
                    isDesktopOrLaptop
                })
            ];
        } else {
            if (mode !== "inline") {
                return [
                    FooterButton({
                        key: "dismiss",
                        name: dismissText || 'Закрыть',
                        callback: FooterDismissFunction(),
                        options: {
                            type: "ghost"
                        },
                        isDesktopOrLaptop
                    })
                ]
            } else return []
        }
    }
    const FooterOkButtons = () => {
        if (steps) {
            return [
                IfElse(currentStep < steps.length - 1,
                    FooterButton({
                        key: "next",
                        name: nextText || 'Далее',
                        callback: FooterOkFunction(),
                        options: {
                            type: "primary"
                        },
                        isDesktopOrLaptop
                    }),
                    FooterButton({
                        key: "ok",
                        name: okText || 'Отправить',
                        callback: FooterOkFunction(),
                        options: {
                            type: "primary"
                        },
                        isDesktopOrLaptop
                    }))
            ]
        } else {
            return [
                FooterButton({
                    key: "ok",
                    name: okText || 'Отправить',
                    callback: FooterOkFunction(),
                    options: {
                        type: "primary"
                    },
                    isDesktopOrLaptop
                })
            ]
        }
    }
    const FooterExtendedButtons = (parameters) => {
        // функция должна возвращать массив объектов для FooterButton
        if (props.footerExtendedButtons) {
            let btns = props.footerExtendedButtons(parameters);
            if (btns) {
                return btns?.map(e => FooterButton({ isDesktopOrLaptop, ...e }))
            }
        }
        return []
    }
    const footer = React.useCallback(() => {
        let ctx = {
            DismissFunction: FooterDismissFunction(),
            OkFunction: FooterOkFunction(),
            // DismissButtons: FooterDismissButtons, 
            // OkButtons: FooterOkButtons, 
            form,
            object,
            unlock,
            close,
            mode,
            readonly,
            loading
        };
        if (props.footer) {
            let btns = props.footer(ctx);
            if (btns) {
                let a = btns?.map(e => FooterButton({ isDesktopOrLaptop, ...e }))
                return a
            }
        }
        if (readonly || loading) {
            return [
                ...FooterExtendedButtons(ctx),
                ...FooterDismissButtons(),
            ]
        }
        return [
            ...FooterExtendedButtons(ctx),
            ...FooterDismissButtons(),
            ...FooterOkButtons()
        ]
    }, [props.footer, isDesktopOrLaptop, currentStep, form, object, unlock, close, mode, readonly, loading]);
    const trigger = React.useCallback(() => {
        if (fire) return <React.Fragment></React.Fragment>;
        if (isDesktopOrLaptop) {
            if (mode == "inline") {
                return <React.Fragment></React.Fragment>;
            } else if (mode == "func") {
                return (props.trigger) ? props.trigger(click) : <React.Fragment></React.Fragment>;
            } else if (mode == "MenuItem") {
                return (props.trigger) ? props.trigger(click) : <React.Fragment></React.Fragment>;
            } else if (mode == "Tag") {
                if (props.tooltip) {
                    if (props.color) {
                        return (<Tooltip title={props.tooltip}>
                            <Tag color={props.color} disabled={disabled} closable={props.closable} {...triggerOptions} style={triggerStyle} onClose={(e) => { click(); preventDefault(e); }}>{props.title}</Tag>
                        </Tooltip>);
                    } else {
                        return (<Tooltip title={props.tooltip}>
                            <Tag closable={props.closable} disabled={disabled} {...triggerOptions} style={triggerStyle} onClose={(e) => { click(); preventDefault(e); }}>{props.title}</Tag>
                        </Tooltip>);
                    }
                } else {
                    if (props.color) {
                        return (<Tag color={props.color} disabled={disabled} closable={props.closable} {...triggerOptions} style={triggerStyle} onClose={(e) => { click(); preventDefault(e); }}>{props.title}</Tag>);
                    } else {
                        return (<Tag closable={props.closable} disabled={disabled} {...triggerOptions} style={triggerStyle} onClose={(e) => { click(); preventDefault(e); }}>{props.title}</Tag>);
                    }
                }
            } else if (mode == "input") {
                return (<div>
                    <Input.Group compact style={{ display: "flex" }}>
                        <Input
                            value={(brief) ? brief : (!brief && placeholder) ? placeholder : ""}
                            disabled
                            allowClear
                            className={classes.input} />
                        <Button style={{ padding: "4px 8px" }} onClick={click}>
                            <EllipsisOutlined style={{ paddingTop: "7px", fontSize: '16px' }} />
                        </Button>
                    </Input.Group>
                </div>);
            } else if (mode == "link") {
                return (<div><Button type="link" size="small" style={triggerStyle} {...triggerOptions} onClick={click}>{props.title}</Button></div>);
            } else if (mode == "text") {
                return (<div><Button type="text" size="small" style={triggerStyle} {...triggerOptions} onClick={click}>{props.title}</Button></div>);
            } else {
                return (<div className="buttons" loading={loading.toString()}><Button onClick={click} disabled={disabled} {...triggerOptions} style={{ textAlign: "left", ...triggerStyle }}>{props.title}</Button></div>);
            }
        } else {
            if (mode == "func") {
                // console.log(props.object);
                return (props.trigger) ? props.trigger(click) : <React.Fragment></React.Fragment>;
            } else {
                const getTitle = () => {
                    return props.label || props.title || ((props.titles) ? props.titles.header : "");
                }
                let view = (<React.Fragment>
                    <MobileList.Item
                        // className={classes.Obj}
                        disabled={disabled}
                        {...triggerOptions}
                        style={{ textAlign: "left", ...triggerStyle }}
                        arrow={false}
                        // multipleLine
                        // wrap
                        onClick={click}>
                        <div>{getTitle()}</div>
                        {brief && <div>{brief}</div>}
                        {(!brief && placeholder) && <div>{placeholder}</div>}
                    </MobileList.Item>
                </React.Fragment>);
                return (
                    <React.Fragment>
                        {swipe &&
                            <MobileSwipeAction closeOnAction={true} closeOnTouchOutside={true} rightActions={swipe}>
                                {view}
                            </MobileSwipeAction>
                        }
                        {!swipe && view}
                    </React.Fragment>
                );
            }
        }
    }, [fire, object, props.action, isDesktopOrLaptop, mode, props.title, props.trigger, loading, disabled, triggerOptions, triggerStyle, props.closable]);
    const content = React.useCallback(() => {
        if (isDesktopOrLaptop) {
            const width = (props.modal) ? props.modal.width : undefined;
            const title = (props.modal && props.modal.title) ? props.modal.title : props.title;
            if (mode == "inline") {
                return (<div style={{ width: "100%", height: "100%", resize: "none" }} className='action-content'>
                    <Spin spinning={loading}>
                        {steps && <React.Fragment>
                            <CurrentForm
                                setSubmit={setSubmit}
                                auth={props.auth}
                                current={currentStep}
                                steps={steps}
                                object={stepObject}
                                action={(values) => {
                                    let o = {
                                        ...stepObject,
                                        [steps[currentStep].key]: { ...steps[currentStep].object, ...values }
                                    };
                                    next(values, steps[currentStep], currentStep);
                                }}
                            />
                        </React.Fragment>}
                        {(!steps && props.form) &&
                            <ContentForm {...props} submit={action} form={(!noAntForm) ? form : undefined} />
                        }
                        <div>
                            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }} className='action-footer'>
                                {footer()}
                            </div>
                        </div>
                    </Spin>
                </div>)
            } else {
                return (<React.Fragment>
                    <Modal
                        afterClose={props.afterClose}
                        width={width}
                        className={classes.modal}
                        title={title}
                        open={opened || (fire && visible)}
                        closable={true}
                        destroyOnClose={true}
                        onCancel={closePopup}
                        footer={footer()}
                        keyboard={false}
                        bodyStyle={(props.modal && props.modal.bodyStyle) ? props.modal.bodyStyle : {}}
                        {...props.modal}
                    >
                        <div style={{ width: "100%", height: "100%", resize: "none" }}>
                            <Spin spinning={loading}>
                                {steps && <React.Fragment>
                                    <CurrentForm
                                        setSubmit={setSubmit}
                                        auth={props.auth}
                                        current={currentStep}
                                        steps={steps}
                                        object={stepObject}
                                        action={(values) => {
                                            let o = {
                                                ...stepObject,
                                                [steps[currentStep].key]: { ...steps[currentStep].object, ...values }
                                            };
                                            next(values, steps[currentStep], currentStep);
                                        }}
                                    />
                                </React.Fragment>}
                                {(!steps && props.form) &&
                                    <ContentForm
                                        {...props}
                                        subheader={(titles && titles.subheader) ? titles.subheader : ""}
                                        submit={action}
                                        form={form}
                                    />
                                }
                            </Spin>
                        </div>
                    </Modal>
                    {trigger && trigger()}
                </React.Fragment>)
            }
        } else {
            if (mode == "inline") {
                return (<React.Fragment>
                    <div style={{
                        display: "flex",
                        flexDirection: "column",
                        height: "100%",
                    }}>
                        <div style={{ textAlign: "center", fontWeight: "600", fontSize: "14px", minHeight: ((titles && titles.header)) ? "47px" : "0px" }}>{(titles && titles.subheader) ? titles.subheader : ""}</div>
                        {!loading && <div style={{ height: "100%", padding: "0px", ...formWraperStyle }}>
                            {steps && <React.Fragment>
                                <CurrentForm
                                    setSubmit={setSubmit}
                                    auth={props.auth}
                                    current={currentStep}
                                    steps={steps}
                                    object={stepObject}
                                    action={(values) => {
                                        let o = {
                                            ...stepObject,
                                            [steps[currentStep].key]: { ...steps[currentStep].object, ...values }
                                        };
                                        next(values, steps[currentStep], currentStep);
                                    }}
                                />
                            </React.Fragment>}
                            {(!steps && props.form) &&
                                <ContentForm
                                    {...props}
                                    subheader={(titles && titles.subheader) ? titles.subheader : ""}
                                    submit={action}
                                    form={form}
                                />
                            }
                        </div>}
                        {loading && <div className="loading" style={{ height: "100%" }}>
                            <div className="align" style={{ textAlign: "center" }}>
                                <div style={{ display: "flex", justifyContent: "center" }}>
                                    <SpinLoading style={{ '--size': '48px' }} />
                                </div>
                                <span style={{ marginTop: 8 }}>Отправка ...</span>
                            </div>
                        </div>}
                        <div style={{
                            padding: "8px",
                            // left: "0",
                            width: "100%",
                            // bottom: "0",
                            zIndex: "1",
                            // position: "fixed",
                            backgroundColor: "white"
                        }}>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                {footer()?.map((e, idx) => <Button key={idx} style={{ flex: "auto" }} type="ghost" {...e.options} onClick={e.onPress}>{e.text}</Button>)}
                            </div>
                        </div>
                    </div>
                </React.Fragment>);
            } else {
                return (<React.Fragment>
                    {/* <RenderToLayer> */}
                        <Popup
                            visible={opened || (fire && visible)}
                            showCloseButton
                            bodyStyle={{ height: "100%" }}
                            onClose={closePopup}
                        >
                            <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
                                <div style={{ flex: "0", padding: "0 10px" }}>
                                    {(titles && titles.header) ?
                                        <div style={{ display: "flex", justifyContent: "center", padding: "10px 30px 10px 15px", fontSize: "16px" }}>
                                            {titles.header}
                                        </div> : undefined
                                    }
                                </div>
                                <div style={{ overflowY: 'scroll', flex: "1", height: "100%" }}>
                                    <div style={{ padding: "0 10px", textAlign: "center", fontWeight: "600", fontSize: "14px", minHeight: (!(titles && titles.header)) ? "47px" : "0px" }}>{(titles && titles.subheader) ? titles.subheader : ""}</div>
                                    {!loading && <div style={{ height: "100%", padding: "0px 15px 15px 15px" }}>
                                        {steps && <React.Fragment>
                                            <CurrentForm
                                                setSubmit={setSubmit}
                                                auth={props.auth}
                                                current={currentStep}
                                                steps={steps}
                                                object={stepObject}
                                                action={(values) => {
                                                    let o = {
                                                        ...stepObject,
                                                        [steps[currentStep].key]: { ...steps[currentStep].object, ...values }
                                                    };
                                                    next(values, steps[currentStep], currentStep);
                                                }}
                                            />
                                        </React.Fragment>}
                                        {(!steps && props.form) &&
                                            <ContentForm
                                                {...props}
                                                subheader={(titles && titles.subheader) ? titles.subheader : ""}
                                                submit={action}
                                                form={form}
                                            />
                                        }
                                    </div>}
                                    {loading && <div className="loading">
                                        <div className="align" style={{ textAlign: "center" }}>
                                            <div style={{ display: "flex", justifyContent: "center" }}>
                                                <SpinLoading style={{ '--size': '48px' }} />
                                            </div>
                                            <span style={{ marginTop: 8 }}>Отправка ...</span>
                                        </div>
                                    </div>}
                                </div>
                                <div style={{ flex: "0" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", padding: "10px" }}>
                                        {footer()?.map((e, idx) => <Button key={idx} style={{ flex: "auto" }} type="ghost" {...e.options} onClick={e.onPress}>{e.text}</Button>)}
                                    </div>
                                </div>
                            </div>
                        </Popup>
                    {/* </RenderToLayer> */}
                    {trigger && trigger()}
                </React.Fragment>);
            }
        }
    }, [mode, steps, stepObject, currentStep, stepObject, props.auth, loading, titles, opened, fire, visible, formWraperStyle, next, action, form]);

    return (<React.Fragment>
        {content && content()}
    </React.Fragment>);
}
