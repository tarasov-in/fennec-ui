import React, { useState } from 'react';
import { List, Calendar } from 'antd-mobile';
import { createUseStyles } from 'react-jss'
import moment from 'moment-timezone';
import 'moment/locale/ru';

const Item = List.Item;
const Brief = Item.Brief;

const useStyles = createUseStyles({
    Obj: {
        '&.am-list-item': {
            paddingLeft: "0px"
        },
        '&.am-list-item .am-list-line': {
            paddingRight: "0px"
        },
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
        },
        '&.am-list-item .am-list-line .am-list-arrow': {
            position: "absolute",
            right: "0",
            top: "8px",
        },
        '&.am-list-item .am-list-line .am-list-extra': {
            textAlign: "left",
            paddingTop: "0px",
        },

        '&.am-list-item': {
            paddingLeft: "0px"
        },
        '&.am-list-item .am-list-line': {
            paddingRight: "0px"
        },
    },
})

export function CalendarItem(props) {
    const classes = useStyles()
    const { onChange, value, name, placeholder, pickTime } = props;
    const [visible, setVisible] = useState(false);

    const triggerChange = (value) => {
        if (onChange) {
            onChange([
                ...value,
            ]);
        }
    };
    const onConfirm = (startTime, endTime) => {
        setVisible(false);
        triggerChange([
            moment(startTime),
            moment(endTime),
        ]);
    }

    const onCancel = () => {
        setVisible(false);
        triggerChange([
            // undefined,
            // undefined,
        ]);
    }
    const nativeValue = (value && value.length === 2) ? [value[0].toDate(), value[1].toDate()] : [];
    const format = (pickTime) => {
        return (pickTime)?"YYYY-MM-DD HH:mm":"YYYY-MM-DD";
    };
    return (<React.Fragment>
        <List.Item arrow="horizontal"
            className={props.className || classes.Time}
            onClick={() => {
                setVisible(true);
            }}
            // extra={(value) ? <span>{value[0].format("YYYY-MM-DD")} - {value[1].format("YYYY-MM-DD")}</span> : <React.Fragment></React.Fragment>}
        >
            
            <div>{name}</div>
                {value && <Brief>{value[0].format(format(pickTime))} - {value[1].format(format(pickTime))}</Brief>}
                {(!value && placeholder) && <Brief>{placeholder}</Brief>}
        </List.Item>
        <Calendar
            locale={{
                am: "AM",
                begin: "Начало",
                begin_over: "S/E",
                clear: "Очистить",
                confirm: "Выбрать",
                dateFormat: "yyyy-MM-dd",
                dateTimeFormat: "dd-MM-yyyy hh:mm",
                end: "Конец",
                lastMonth: "Этот месяц",
                lastWeek: "Эта неделя",
                loadPrevMonth: "Загрузка предыдущего месяца",
                month: "Месяц",
                monthTitle: "yyyy-MM",
                noChoose: "Не выбрана",
                over: "Конец",
                pm: "PM",
                selectEndTime: "Выберите время окончания",
                selectStartTime: "Выберите время начала",
                selectTime: "Выберете время",
                start: "Начало",
                title: "Календарь",
                today: "Сегодня",
                week: ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"],
                year: "Год",
                yesterday: "Вчера",
            }}
            pickTime={pickTime}
            showShortcut={false}
            type={"range"}
            visible={visible}
            onCancel={onCancel}
            onConfirm={onConfirm}
            // onSelectHasDisableDate={this.onSelectHasDisableDate}
            // getDateExtra={this.getDateExtra}
            defaultDate={new Date()}
            defaultValue={nativeValue}
        />
    </React.Fragment>);
}