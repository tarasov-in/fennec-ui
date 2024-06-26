import React, { useEffect, useState } from 'react';
import { Button, List } from 'antd-mobile';
import {
    MenuOutlined,
} from '@ant-design/icons';
import './index.css'
import { Action } from '../../Action'
import { JSXMap, getLocator, unwrap } from '../../../Tool';
import uuid from 'react-uuid';
var _ = require('lodash');

export function DropdownMobile(props) {
    const { auth, buttonStyle, icon, titles, items, trigger } = props;
    const [actions, setActions] = useState([]);
    useEffect(() => {
        let i = unwrap(items);
        setActions(i?.filter(e => !!e)?.map(e => ({ ...e, uuid: uuid() })))
    }, [items])

    const getTitle = (item) => {
        return item.title || ((item.titles) ? item.titles.header : "");
    }

    
    return (
        <React.Fragment>
            <Action
                key={uuid()}
                auth={auth}
                mode={"func"}
                titles={titles}
                action={(values, unlock, close) => {
                    close();
                }}
                readonly={true}
                form={(props) => {
                    return (
                        <List className="dropdown-list" renderHeader={() => (titles && titles.block !== undefined) ? titles.block : "Выберите действие"} style={{paddingTop: "5px"}}>
                            {JSXMap(actions, (e, idx) => (<div key={idx}>
                                <Action
                                    key={e.key || idx}
                                    auth={auth}
                                    mode={"func"}
                                    // object={e}
                                    {...e}
                                    trigger={(click) => (
                                        <List.Item data-locator={getLocator(props?.locator || "dropdownitem", props?.object || {ID: idx})} key={idx} /*arrow="horizontal"*/ multipleLine wrap onClick={click} style={{fontSize:"13px"}}>
                                            {getTitle(e)}
                                        </List.Item>
                                    )}
                                />
                            </div>))}
                        </List>
                    )
                }}
                trigger={trigger || ((click) => (
                    <Button  data-locator={getLocator(props?.locator || "dropdown", props?.object)} className="dropdown" size={"small"} style={{ padding: "2px 6px", ...buttonStyle }} type="default" onClick={click}>
                        {(icon) ? icon : <MenuOutlined />}
                    </Button>
                ))}
            />
        </React.Fragment>
    );
};
