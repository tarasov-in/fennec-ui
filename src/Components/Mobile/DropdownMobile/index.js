import React, { useEffect, useState } from 'react';
import { Button, List } from 'antd-mobile';
import {
    MenuOutlined,
} from '@ant-design/icons';
import './index.css'
import { Action } from '../../Action'
import { JSXMap, unwrap } from '../../../Tool';
import uuid from 'react-uuid';
var _ = require('lodash');

export function DropdownMobile(props) {
    const { auth, buttonStyle, icon, titles, items } = props;
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
                        <List renderHeader={() => (titles && titles.block !== undefined) ? titles.block : "Выберите действие"} style={{paddingTop: "5px"}}>
                            {JSXMap(actions, (e, idx) => (<div key={idx}>
                                <Action
                                    key={e.key || idx}
                                    auth={auth}
                                    mode={"func"}
                                    object={e}
                                    {...e}
                                    trigger={(click) => (
                                        <List.Item key={idx} /*arrow="horizontal"*/ multipleLine wrap onClick={click} style={{fontSize:"13px"}}>
                                            {getTitle(e)}
                                        </List.Item>
                                    )}
                                />
                            </div>))}
                        </List>
                    )
                }}
                trigger={(click) => (
                    <Button className="dropdown" size={"small"} style={{ padding: "0 2px", ...buttonStyle }} type="default" onClick={click}>
                        {(icon) ? icon : <MenuOutlined />}
                    </Button>
                )}
            />
        </React.Fragment>
    );
};
