import React, { useState, useEffect } from 'react';
import { Button, Menu, Dropdown } from 'antd';

import {
    MenuOutlined,
} from '@ant-design/icons';
import { JSXMap, publish } from '../../../Tool';
import { useAuth } from '../../../Auth';
import { Action } from '../../Action'

import uuid from 'react-uuid';

export function DropdownAction(props) {
    const { button, menuOptions, items } = props;
    const auth = useAuth();
    const [actions, setActions] = useState([]);
    useEffect(() => {
        if (items) {
            setActions(items?.filter(e => !!e)?.map(e => ({ ...e, uuid: uuid() })))
        }
    }, [items])

    const btn = () => {
        if (button) {
            return button();
        } else {
            return (<Button size={"small"} style={{ padding: "0 6px" }} type="default">
                <MenuOutlined />
            </Button>);
        }
    };

    return (
        <div onClick={(e) => {
            e.stopPropagation();
        }}>
            {JSXMap(actions?.filter(e => !!e.action), (e, idx) => (<div key={idx}>
                <Action
                    key={e.key || idx}
                    auth={auth}
                    mode={"MenuItem"}
                    object={e}
                    {...e}
                />
            </div>))}
            <Dropdown trigger={['click']} {...props} overlay={
                <Menu
                    {...menuOptions}
                    selectable={false}
                    items={(actions && actions.length) ? actions?.map((e, idx) => {
                        if(e.type === 'divider'){
                            return e
                        } else {
                            return {
                                key: e.uuid,
                                label: e.title || ((e.modal) ? e.modal.title : ""),
                                danger: e.danger || false
                            }
                        }
                    }) : []}
                    onClick={(e) => {
                        // e.stopPropagation();
                        if (e.key) {
                            publish(`action.${e.key}.click`, e.key);
                        }
                    }}>
                </Menu>}>
                {btn()}
            </Dropdown>
        </div>
    );
};

