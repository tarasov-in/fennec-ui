import React from 'react';

class WSocket extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            ws: {}
        };
        this.open = this.open.bind(this);
    }

    open(url, wsName, onmessage_callback, onopen_callback, onclose_callback, onerror_callback) {
        var context = this;
        const { auth } = this.props;

        if (this.state.ws[wsName] && this.state.ws[wsName].cancelConnect) {
            console.warn("Отмена открытия соединения с идентификатором " + wsName);
            return;
        }

        if (this.state.ws[wsName] && this.state.ws[wsName].socket && this.state.ws[wsName].socket.send) {
            console.error("Соединение с идентификатором " + wsName + " уже существует");
            return;
        }

        var ws = new WebSocket(url, [(auth.getToken()) || null]);
        ws.onmessage = onmessage_callback;

        ws.onerror = onerror_callback;

        ws.onopen = function () {
            context.state = {
                ...context.state,
				ws: { ...context.state.ws, [wsName]: {socket: ws } }
            };
            console.log("Установлено соединение с идентификатором " + wsName)
            // context.send(wsName, '{"test": "'+wsName+'"}')
            if(onopen_callback) onopen_callback();
        }

        ws.onclose = function (event) {
            context.state = {
                ...context.state,
				ws: { ...context.state.ws, [wsName]: {socket: undefined } }
            };
          
            if (event.wasClean) {
                // console.log('Соединение с идентификатором ' + wsName + ' закрыто');
            } else {
                // console.error('Обрыв соединения с идентификатором ' + wsName + '. Код: ' + event.code + ' причина: ' + event.reason, event); // например, "убит" процесс сервера

                //Перезапуск соединения через 5 сек
                setTimeout(function () {
                    context.open.call(context, url, wsName, onmessage_callback, onopen_callback, onclose_callback, onerror_callback)
                }, 5000)
            }
            if(onclose_callback) onclose_callback(event);
        };

        ws.onerror = function (error) {
            // console.error("Ошибка соединения с идентификатором " + wsName, error)
        }
    };
    close(wsName, cancelConnect = true) {
        console.log("Закрываем соединение " + wsName);

        if (this.state.ws[wsName] && this.state.ws[wsName].socket && this.state.ws[wsName].socket.close) {
            this.state.ws[wsName].socket.close(4100, "Client close WSocket");
        } else {
            console.error("Не найдено соединение с идентификатором " + wsName);
        }

        // this.state.ws[wsName] = { cancelConnect: cancelConnect }
        this.setState({
            ws: {...this.state.ws,
                [wsName]: { cancelConnect: cancelConnect }
            }
        });
    };
    send(wsName, data) {
        if (this.state.ws[wsName] && this.state.ws[wsName].socket && this.state.ws[wsName].socket.send) {
            this.state.ws[wsName].socket.send(data);
        } else {
            console.error("Не найдено соединение с идентификатором " + wsName);
        }
    };
};

export default WSocket;