import React, { useState } from 'react';
import { List, Calendar } from 'antd-mobile';
import { createUseStyles } from 'react-jss'
import moment from 'moment-timezone';
import 'moment/locale/ru';
import { useDynamicTranslateContext, useStaticTranslateContext } from '../../Context';

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
        const t = useDynamicTranslateContext();
    const tn = useStaticTranslateContext();
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
        return (pickTime) ? "YYYY-MM-DD HH:mm" : "YYYY-MM-DD";
    };
    return (<React.Fragment>
        <List.Item /*arrow="horizontal"*/
            className={props.className || classes.Time}
            onClick={() => {
                setVisible(true);
            }}
        // extra={(value) ? <span>{value[0].format("YYYY-MM-DD")} - {value[1].format("YYYY-MM-DD")}</span> : <React.Fragment></React.Fragment>}
        >

            <div>{name}</div>
            {value && <div>{value[0].format(format(pickTime))} - {value[1].format(format(pickTime))}</div>}
            {(!value && placeholder) && <div>{placeholder}</div>}
        </List.Item>
        <Calendar
            // selectionMode='range'
        locale={{
            am: "AM",
            begin: tn("Начало"),
            begin_over: "S/E",
            clear: tn("Очистить"),
            confirm: tn("Выбрать"),
            dateFormat: "yyyy-MM-dd",
            dateTimeFormat: "dd-MM-yyyy hh:mm",
            end: tn("Конец"),
            lastMonth: tn("Этот месяц"),
            lastWeek: tn("Эта неделя"),
            loadPrevMonth: tn("Загрузка предыдущего месяца"),
            month: tn("Месяц"),
            monthTitle: "yyyy-MM",
            noChoose: tn("Не выбрана"),
            over: tn("Конец"),
            pm: "PM",
            selectEndTime: tn("Выберите время окончания"),
            selectStartTime: tn("Выберите время начала"),
            selectTime: tn("Выберете время"),
            start: tn("Начало"),
            title: tn("Календарь"),
            today: tn("Сегодня"),
            week: [tn("Вс"), tn("Пн"), tn("Вт"), tn("Ср"), tn("Чт"), tn("Пт"), tn("Сб")],
            year: tn("Год"),
            yesterday: tn("Вчера"),
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