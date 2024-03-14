import { message } from "antd";
import numeral from 'numeral';
import React, { useEffect, useRef, useState } from 'react';
import PubSub from 'pubsub-js'
import uuid from 'react-uuid';
import dayjs from 'dayjs'
import 'dayjs/locale/ru'
var _ = require('lodash');
//--------------------------------------------------------------
export const publish = (msg, data) => {
    PubSub.publish(msg, data);
};
export const subscribe = (msg, func) => {
    return PubSub.subscribe(msg, func);
};
export const unsubscribe = (token) => {
    PubSub.unsubscribe(token);
};
//--------------------------------------------------------------
export const HasRoleID = (user, roleID) => {
    if (user && user.roleUser) {
        for (let i = 0; i < user.roleUser.length; i++) {
            const element = user.roleUser[i];
            if (element.roleID === roleID) {
                return true;
            }
        }
    }
    return false;
};
export const HasRole = (user, name) => {
    if (user && user.roleUser) {
        for (let i = 0; i < user.roleUser.length; i++) {
            const element = user.roleUser[i];
            if (element.role.name === name) {
                return true;
            }
        }
    }
    return false;
};
//--------------------------------------------------------------
//--------------------------------------------------------------
export const unwrap = (value, element) => {
    if (_.isFunction(value) == true) {
        return unwrap(value());
    } else if (_.isArray(value)) {
        return value
    }
    return (!element) ? [value] : value;
};
export const clean = (value, element) => {
    if (_.isArray(value)) {
        return value?.filter(e => e !== null && e !== undefined)
    }
    return (!element) ? [value]?.filter(e => e !== null && e !== undefined) : value;
};
//--------------------------------------------------------------
// Если все переданные аргументы не false/undefined/null/0
export const If = (equations, truthful) => {
    return (And(equations)) ? unwrap(truthful, true) : undefined;
};
export const IfElse = (equations, truthful, untruthful) => {
    return (And(equations)) ? unwrap(truthful, true) : unwrap(untruthful, true);
};
// Логическое И всех переданных аргументов
export const And = (args) => {
    var acc = true;
    let unwraped = unwrap(args);
    // console.log(args, unwraped);
    for (let i = 0; i < unwraped.length; i++) {
        const element = unwraped[i];
        acc = acc && element;
        if (!acc) break;
    }
    return acc;
};
// Логическое ИЛИ всех переданных аргументов
export const Or = (args) => {
    var acc = true;
    let unwraped = unwrap(args);
    for (let i = 0; i < unwraped.length; i++) {
        const element = unwraped[i];
        acc = acc || element;
    }
    return acc;
};
//--------------------------------------------------------------
const Created = () => { }; // Разрешение на создание
const Readed = () => { }; // Разрешение на чтение
const Updated = () => { }; // Разрешение на обновление
const Deleted = () => { }; // Разрешение на удаление
const Executed = () => { }; // Разрешение на исполнение
//--------------------------------------------------------------
export const uncapitalize = (str) => {
    return str.charAt(0).toLowerCase() + str.slice(1);
}
//--------------------------------------------------------------
export const QueryParams = (queryParams) => {
    let ext = "";
    if (queryParams) {
        for (let i = 0; i < queryParams.length; i++) {
            const param = queryParams[i];
            if (_.isString(param)) {
                ext += (!ext) ? param : '&' + param;
            } else if (_.isFunction(param)) {
                ext += (!ext) ? param() : '&' + param();
            }
        }
    }
    return ext;
};
export const QueryFunc = (func, name) => {
    return `f-${func}-${name}`;
};
export const QueryParam = (name, value) => {
    return `${name}=${value}`;
};
export const ObjectToQueryParam = (object, method) => {
    let f = [];
    let array = Object.entries(object);
    for (let i = 0; i < array.length; i++) {
        const element = array[i];
        if (element) {
            let keyName = (element[0].endsWith('ID') === true) ? element[0].slice(0, -2) + ".ID" : element[0];
            f.push(QueryParam(`w-${keyName}`, element[1]));
            // f.push({
            //     method: method || "eq",
            //     name: element[0],
            //     value: element[1]
            // })
        }
    }
    return f
}
export const QueryOrder = (name, value) => {
    return `s-${name}=${value}`;
};
export const QueryDetail = (value) => {
    return QueryParam("detail", (value) ? value : "none");
};
//--------------------------------------------------------------
export const CREATE = (auth, name, object, callback, error) => {
    POST(auth, '/api/query-create/' + name.toLowerCase(), object, callback, error);
};
export const READ = (auth, name, callback, error) => {
    GET(auth, '/api/query/' + name.toLowerCase(), callback, error);
};
export const READWITH = (auth, name, queryParams, callback, error) => {
    let ext = QueryParams(queryParams);
    GET(auth, '/api/query/' + name.toLowerCase() + ((ext) ? "?" + ext : ""), callback, error);
};
export const UPDATE = (auth, name, object, callback, error) => {
    POST(auth, '/api/query-update/' + name.toLowerCase(), object, callback, error);
};
export const DELETE = (auth, name, id, callback, error) => {
    GET(auth, '/api/query-delete/' + name.toLowerCase() + '/' + id, callback, error);
};
export const POST = (auth, url, object, callback, error) => {
    auth.fetch(url, {
        method: 'POST',
        body: JSON.stringify(object)
    }).then(res => {
        if (res && res.status === true) {
            if (callback) {
                callback(res);
            }
        } else if (res && res.status === false) {
            throw new FennecError(res.message/*, err.exception*/, "", res);
        }
    }).catch(error || errorCatch);
};
export const POSTFormData = (auth, url, formData, callback, error) => {
    auth.fetchForData(url, {
        method: 'POST',
        body: formData
    }).then(res => {
        if (res && res.status === true) {
            if (callback) {
                callback(res);
            }
        } else if (res && res.status === false) {
            throw new FennecError(res.message/*, err.exception*/, "", res);
        }
    }).catch(error || errorCatch);
};
export const GETWITH = (auth, url, queryParams, callback, error) => {
    let ext = QueryParams(queryParams);
    GET(auth, url + ((ext) ? "?" + ext : ""), callback, error);
};
export const GET = (auth, url, callback, error) => {
    auth.fetch(url).then(res => {
        if (res && res.status === true) {
            if (callback) {
                callback(res);
            }
        } else if (res && res.status === false) {
            throw new FennecError(res.message/*, err.exception*/, "", res);
        }
    }).catch(error || errorCatch);
};
//--------------------------------------------------------------
export const CREATEP = (auth, name, object) => {
    return POSTP(auth, '/api/query-create/' + name.toLowerCase(), object);
};
export const READP = (auth, name) => {
    return GETP(auth, '/api/query/' + name.toLowerCase());
};
export const READWITHP = (auth, name, queryParams) => {
    let ext = QueryParams(queryParams);
    return GETP(auth, '/api/query/' + name.toLowerCase() + ((ext) ? "?" + ext : ""));
};
export const UPDATEP = (auth, name, object) => {
    return POSTP(auth, '/api/query-update/' + name.toLowerCase(), object);
};
export const DELETEP = (auth, name, id) => {
    return GETP(auth, '/api/query-delete/' + name.toLowerCase() + '/' + id);
};
export const POSTP = (auth, url, object) => {
    return new Promise((resolve, reject) => {
        auth.fetch(url, {
            method: 'POST',
            body: JSON.stringify(object)
        }).then(res => {
            if (res && res.status === true) {
                resolve(res);
            } else if (res && res.status === false) {
                throw new FennecError(res.message, err.exception, res);
            }
        }).catch(reject);
    });
};
export const POSTFormDataP = (auth, url, formData) => {
    return new Promise((resolve, reject) => {
        auth.fetchForData(url, {
            method: 'POST',
            body: formData
        }).then(res => {
            if (res && res.status === true) {
                resolve(res);
            } else if (res && res.status === false) {
                throw new FennecError(res.message, err.exception, res);
            }
        }).catch(reject);
    });
};
export const GETWITHP = (auth, url, queryParams) => {
    let ext = QueryParams(queryParams);
    return GET(auth, url + ((ext) ? "?" + ext : ""));
};
export const GETP = (auth, url) => {
    return new Promise((resolve, reject) => {
        auth.fetch(url).then(res => {
            if (res && res.status === true) {
                resolve(res);
            } else if (res && res.status === false) {
                throw new FennecError(res.message, err.exception, res);
            }
        }).catch(reject);
    });
};
//--------------------------------------------------------------
export const equals = (obj1, obj2) => {
    if (obj1 === obj2)
        return true;
    if (!obj1 || !obj2 || typeof (obj1) !== "object" || typeof (obj2) !== "object")
        return false;
    //Проверяем является ли объект obj1 функцией, 
    //если да то предполагаем что obj2 тоже функция и сранвиваем коды функций 
    if (typeof (obj1) === "function") {
        if (obj1.toString() === obj2.toString())
            return true;
        else
            return false;
    }

    //Если obj2 является функцией, значит предыдущее условие 
    //показало что obj1 не является функцией, а значит obj1 != obj2
    if (typeof (obj2) === "function") {
        return false;
    }

    var obj1PropertyCount = Object.keys(obj1).length;
    var obj2PropertyCount = Object.keys(obj2).length;
    //Если количество свойств сравниваемых объектов разное, то объекты не равны
    if (obj1PropertyCount !== obj2PropertyCount)
        return false;
    //Так как предыдущее условие показало, что кол-во свойст у объектов равны, 
    //проверяем если кол-во свойств объектов равно 0, то объекты пустые, 
    //а соответственно равны
    if (obj1PropertyCount === 0)
        return true;
    for (var property in obj1) {
        var prop1 = obj1[property];
        var prop2 = obj2[property];
        //Если свойсвто prop1 является объектом, то предполагаем, 
        //что prop2 тоже объекта и проверяем на равенстов объектов свойства prop1 и prop2 
        if (typeof (prop1) === "object") {
            if (!equals(prop1, prop2)) {
                return false;
            }
            //Иначе если prop1 не является обхектом, а prop2 является объектом, 
            //останавливем сравнение
        } else if (typeof (prop2) === "object") {
            return false;
            //Если prop1 и prop2 не яляются объектами, то просто их сравниваем
        } else if (typeof (prop1) !== "object" && typeof (prop2) !== "object") {
            if (prop1 !== prop2)
                return false;
        }
    }

    return true;
}
//--------------------------------------------------------------
export const queryFilterByItem = (item) => {
    if (!item) return "";
    let query = [];
    for (const key in item) {
        if (Object.hasOwnProperty.call(item, key)) {
            const value = item[key];
            let keyName = (key.endsWith('ID') === true) ? key.slice(0, -2) + ".ID" : key;
            if (value) {
                query.push("w-" + keyName + "=" + value);
            }
        }
    }
    return query.join("&");
}
export const filterByItem = (item, element) => {
    for (const key in item) {
        if (Object.hasOwnProperty.call(item, key)) {
            const value = item[key];
            if (element[key] === value) {
                return true;
            }
        }
    }
    return false;
}

export function FilterToQueryParameters(filters, filter, sorting, page, count) {
    let flt = {};
    Object.keys(filter).forEach(key => {
        var item = filters?.find(e => e.name == key);

        let filterByKey = filter[key];
        switch (item.filterType) {
            case "group":
                switch (item.type) {
                    case "object":
                    case "document":
                        flt["w-in-" + key] = (filterByKey && filterByKey.length && filterByKey.join) ? filterByKey.join(",") : filterByKey
                        break;
                    default:
                        flt["w-in-" + key] = (filterByKey && filterByKey.length && filterByKey.join) ? filterByKey.join(",") : filterByKey
                        break;
                }
                break;
            case "range":
                switch (item.type) {
                    case "int":
                    case "uint":
                    case "integer":
                    case "int64":
                    case "int32":
                    case "uint64":
                    case "uint32":
                        if (_.isArray(filterByKey) && filterByKey.length >= 2) {
                            flt["w-lge-" + key] = filterByKey[0]
                            flt["w-lwe-" + key] = filterByKey[1]
                        }
                        break;
                    case "double":
                    case "float":
                    case "float64":
                    case "float32":
                        if (_.isArray(filterByKey) && filterByKey.length >= 2) {
                            flt["w-lge-" + key] = filterByKey[0]
                            flt["w-lwe-" + key] = filterByKey[1]
                        }
                        break;
                    case "time":
                        if (_.isArray(filterByKey) && filterByKey.length >= 2) {
                            flt["w-lge-" + key] = filterByKey[0].format("HH:mm:ss")
                            flt["w-lwe-" + key] = filterByKey[1].format("HH:mm:ss")
                        }
                        break;
                    case "date":
                        if (_.isArray(filterByKey) && filterByKey.length >= 2) {
                            flt["w-lge-" + key] = filterByKey[0].format("YYYY-MM-DD")
                            flt["w-lwe-" + key] = filterByKey[1].format("YYYY-MM-DD")
                        }
                        break;
                    case "datetime":
                    case "time.Time":
                        if (_.isArray(filterByKey) && filterByKey.length >= 2) {
                            flt["w-lge-" + key] = filterByKey[0].format("YYYY-MM-DD HH:mm")
                            flt["w-lwe-" + key] = filterByKey[1].format("YYYY-MM-DD HH:mm")
                        }
                        break;
                    default:
                        flt["w-" + key] = filterByKey
                        break;
                }
                break;
            default:
                switch (item.type) {
                    case "string":
                        flt["w-co-" + key] = filterByKey
                        break;
                    default:
                        flt["w-" + key] = filterByKey
                        break;
                }
                break;
        }
    });

    // let func = [];
    // filters?.forEach(item => {
    //     if (item.func && _.isArray(item.func)) {
    //         item.func.forEach(fu => {
    //             func[fu] = item.name
    //         });
    //     }
    // });

    let srt = {}
    if (sorting?.name) {
        srt[`s-${sorting.name}`] = sorting.order
    }

    let pc = {
        page: page,
        count: count,
    }

    return { ...flt, /*...func,*/ ...srt, ...pc }
}

export function QueryParametersToFilters(urlRequestParameters, filters) {
    let flt = [...filters]
    for (let i = 0; i < flt.length; i++) {
        const item = flt[i];

        function set(item, flt, i, s) {
            let v = urlRequestParameters.get(`${s}${item.name}`)
            if (v) {
                flt[i].filtered = v;
            }
        }
        function setin(item, flt, i, s) {
            let v = urlRequestParameters.get(`${s}${item.name}`)
            if (v) {
                flt[i].filtered = (v && v.split) ? v.split(",").map((val) => {
                    let nval = parseInt(val)
                    if (!isNaN(nval)) {
                        return nval;
                    }

                    return val;
                }) : v;
            }
        }
        function seta(item, flt, i, s1, s2) {
            let v1 = urlRequestParameters.get(`${s1}${item.name}`)
            let v2 = urlRequestParameters.get(`${s2}${item.name}`)
            if (v1 && v2) {
                flt[i].filtered = [v1, v2];
            }
        }
        function setm(item, flt, i, s1, s2, format) {
            let v1 = urlRequestParameters.get(`${s1}${item.name}`)
            let v2 = urlRequestParameters.get(`${s2}${item.name}`)
            if (v1 && v2) {
                flt[i].filtered = [dayjs(v1), dayjs(v2)];
            }
        }
        switch (item.filterType) {
            case "group":
                switch (item.type) {
                    case "object":
                    case "document":
                        setin(item, flt, i, "w-in-");
                        break;
                    default:
                        setin(item, flt, i, "w-in-");
                        break;
                }
                break;
            case "range":
                switch (item.type) {
                    case "int":
                    case "uint":
                    case "integer":
                    case "int64":
                    case "int32":
                    case "uint64":
                    case "uint32":
                        seta(item, flt, i, "w-lge-", "w-lwe-");
                        break;
                    case "double":
                    case "float":
                    case "float64":
                    case "float32":
                        seta(item, flt, i, "w-lge-", "w-lwe-");
                        break;
                    case "time":
                        setm(item, flt, i, "w-lge-", "w-lwe-", "HH:mm:ss");
                        break;
                    case "date":
                        setm(item, flt, i, "w-lge-", "w-lwe-", "YYYY-MM-DD");
                        break;
                    case "datetime":
                    case "time.Time":
                        setm(item, flt, i, "w-lge-", "w-lwe-", "YYYY-MM-DD HH:mm");
                        break;
                    default:
                        set(item, flt, i, "w-");
                        break;
                }
                break;
            default:
                switch (item.type) {
                    case "string":
                        set(item, flt, i, "w-co-");
                        break;
                    default:
                        set(item, flt, i, "w-");
                        break;
                }
                break;
        }
    }

    for (let i = 0; i < flt.length; i++) {
        const item = flt[i];
        let v = urlRequestParameters.get(`s-${item.name}`)
        if (v) {
            flt[i].sorted = v;
        }
    }

    // for (let i = 0; i < flt.length; i++) {
    //     const item = flt[i];
    //     let v = urlRequestParameters.get(`f-max-${item.name}`)
    //     flt[i].func = ["max"]
    // }
    return flt
}

//--------------------------------------------------------------
export function FennecError(message = "", name = "", object = {}) {
    this.name = `Error${(name) ? ": " + name : ""}`;
    this.message = message;
    this.object = object;
}
FennecError.prototype = Error.prototype;
// throw new FennecError(res.message, err.exception, res);

export const errorCatch = (err, callback) => {
    if (err) {
        message.error("" + err);
        if (callback) callback();
    }
};
export const errorAlert = (err, callback) => {
    const messageError = (err) => {
        const alertInstance = alert('Ошибка', err, [
            { text: 'OK', onPress: () => alertInstance.close() },
        ]);
        setTimeout(() => {
            alertInstance.close();
        }, 5000);
    };
    if (err) {
        messageError("" + err);
        if (callback) callback();
    }
};
export const messageError = (err) => {
    const alertInstance = alert('Ошибка', err, [
        { text: 'OK', onPress: () => alertInstance.close() },
    ]);
    setTimeout(() => {
        alertInstance.close();
    }, 5000);
};
//--------------------------------------------------------------
export const arrayUnpack = (values, field, target) => {
    var f = values[field];
    delete values[field];
    if (target && values) {
        for (let i = 0; i < target.length; i++) {
            values[target[i]] = f[i];
        }
    }
    return values;
}
//--------------------------------------------------------------
export const upgradeInArray = (array, item) => {
    if (!item) return item;
    if (_.isArray(item)) {
        return item;
    }
    return [item];
}
export const createInArray = (array, item) => {
    return updateInArray(array, item);
}
export const updateInArray = (array, item, first) => {
    if (!array) array = [];
    if (!item || !item.ID) return array;
    if (_.findIndex(array, { ID: item.ID }) >= 0) {
        return array?.map(e => IfElse(e.ID === item.ID, item, e));
    } else {
        return (first) ? [item, ...array] : [...array, item];
    }
    return;
}
export const deleteInArray = (array, item) => {
    if (!array) array = [];
    if (!item || !item.ID) return array;
    return array?.filter(e => e.ID !== item.ID);
    // mutate the original array and return removed elements
    // _.remove(array, e=>e.ID === item.ID);
}
export const triggerInArray = (array, item) => {
    if (array.find(x => x.ID === item.ID) !== undefined) {
        return deleteInArray(array, item);
    } else {
        return updateInArray(array, item);
    }
}
export const emptyInArray = (array, item) => {
    return [];
}
export const undefinedInArray = (array, item) => {
    return undefined;
}
//--------------------------------------------------------------
export const createArrayInArray = (array, item) => {
    return updateArrayInArray(array, item);
}
export const updateArrayInArray = (array, item) => {
    if (!array) array = [];
    if (_.isArray(item)) {
        let tmp = [...array];
        for (let i = 0; i < item.length; i++) {
            const it = item[i];
            tmp = updateInArray(tmp, it);
        }
        return tmp;
    } else {
        return updateInArray(array, item);
    }
}
export const deleteArrayInArray = (array, item) => {
    if (!array) array = [];
    if (_.isArray(item)) {
        let tmp = [...array];
        for (let i = 0; i < item.length; i++) {
            const it = item[i];
            tmp = deleteInArray(tmp, it);
        }
        return tmp;
    } else {
        return deleteInArray(array, item);
    }
}
export const triggerArrayInArray = (array, item) => {
    if (!array) array = [];
    if (_.isArray(item)) {
        let tmp = [...array];
        for (let i = 0; i < item.length; i++) {
            const it = item[i];
            tmp = triggerInArray(tmp, it);
        }
        return tmp;
    } else {
        return triggerInArray(array, item);
    }
}
//--------------------------------------------------------------
export const makeFormData = (values) => {
    const formData = new FormData();
    for (const key in values) {
        if (Object.hasOwnProperty.call(values, key)) {
            const value = values[key];
            if (_.isArray(value)) {
                value.forEach(item => {
                    if (item) {
                        formData.append(key, item);
                    }
                });
            } else {
                if (value) {
                    formData.append(key, value);
                }
            }
        }
    }
    return formData;
}
//--------------------------------------------------------------
export const unpackFormFields = (form, values) => {
    if (!form) return values;
    var fields = form.getFieldsValue();
    for (var name in fields) {
        if (name.startsWith("@")) {
            var flds = form?.getFieldInstance(name)?.props?.fields;
            values = arrayUnpack(values, name, flds);
        }
    }
    return values;
}
//--------------------------------------------------------------
export const preventDefault = (e) => {
    e.preventDefault();
    e.stopPropagation();
};
//--------------------------------------------------------------
export const eventExecution = (event, values, context) => {
    if (!event) return values;
    return event(values, context) || values;
};
export const detectMutation = (mutation) => {
    if (_.isFunction(mutation)) {
        return mutation;
    } else if (_.isString(mutation)) {
        switch (mutation) {
            case "upgrade": return upgradeInArray;
            case "create": return createInArray;
            case "update": return updateInArray;
            case "delete": return deleteInArray;
            case "empty": return emptyInArray;
            case "undefined": return undefinedInArray;
            default:
                return updateInArray;
        }
    }
    return updateInArray;
};
export const Request = (values, item, props) => {
    const {
        auth,
        collection,
        setCollection,
        contextFilters,
        property,
        label,
        itemByProperty,
        apply,

        index,
        lock,
        unlock,
        close,
        onValues,
        onData,
        onClose,
        onError,
        onDispatch,
    } = props;

    if (item.action) {
        let properties = {
            item,
            index,
            collection,
            setCollection,
            contextFilters,
            property,
            label,
            itemByProperty,
            apply,
        };
        if (_.isFunction(item.action)) {
            // Свойство action может быть функцией или объектом
            // action: (values, unlock, close, {item, index})=>{}
            // если функция после того как отработает вернет в качестве результата ещё одну функцию,
            // то она (_dispatch) будет вызванаивнеё передан объект сбольшимчислом параметров
            let v = eventExecution(onValues, values, properties);
            let _dispatch = item.action(v, unlock, close, properties);
            // console.log(_dispatch, item, item.action, v);
            if (_.isFunction(_dispatch)) {
                _dispatch(properties);
            }
        } else if (_.isObject(item.action)) {
            let config = item.action;
            // {
            //    ! method: "POST",
            //    ! path: "/api/request",
            //    ! mutation: "update", - может быть строкой "create", "update" или "delete", а так же функцией createInArray(array, item), updateInArray(array, item), deleteInArray(array, item) из модуля Tool или новой функцией
            //     onValues: (values, context) => {},
            //     onData: (values, context) => {},
            //     onClose: ({unlock, close}, context) => {},
            //     onError: (err, {unlock, close}) => {},
            //     onDispatch: (values, context) => {}, - может так же возвращать функцию, которая будет выполнена сразу после выполнения onDispatch с теми же параметрами, 
            //                                                           если не вернет функцию то будет выполнен метод setCollection (должен быть передан как props) в которо будет передана коллекция
            //                                                           полученная методом мутации заданной полем в объекте action (если мутация не задана то используется updateInArray)
            // }
            let _REQUEST_ = (auth, url, object, callback, error) => {
                if (config.method === "POSTFormData") {
                    return POSTFormData(auth, url, object, callback, error);
                } else if (config.method === "POST") {
                    return POST(auth, url, object, callback, error);
                }
                return GET(auth, url, callback, error);
            };
            let errFunc = config.onError || onError;
            let payload = eventExecution(config.onValues || onValues, values, properties);
            if (lock) lock();
            _REQUEST_(
                auth,
                config.path,
                payload,
                (x) => {
                    let onDispatchFunc = config.onDispatch || onDispatch;
                    let mutation = detectMutation(config.mutation);
                    let v = mutation(
                        collection,
                        eventExecution(config.onData || onData, x, properties)
                    );
                    // console.log("collection",collection);
                    // console.log("x",x);
                    if (onDispatchFunc) {
                        let _dispatch = onDispatchFunc(v, properties);
                        if (_.isFunction(_dispatch)) {
                            // _dispatch(v, x, unlock, close, properties);
                            _dispatch(v);
                        } else {
                            setCollection(v);
                        }
                    } else {
                        setCollection(v);
                    }
                    eventExecution(config.onClose || onClose, { unlock, close }, properties);
                },
                (err) => (errFunc) ? errFunc(err, { unlock, close }) : errorCatch(err, unlock)
            );
        }
    } else {
        console.error("Не задано свойство action для указанного действия")
    }
}
//-------------------------------------------------------------------
//По событию перехода на предыдущую страницу браузера (history.back())
//закрывает текущую модаль, предотвращая полное обновление страницы
export const pushStateHistoryModal = (setVisible, getStack) => {
    //История браузера
    //https://developer.mozilla.org/ru/docs/Web/API/History_API
    var cbFuncName = 'modal_' + uuid();
    window.history.replaceState({ ...window.history.state, cb: cbFuncName }, '');
    window.history.pushState(null, null, '');
    window.historyCallbackFunctions = window.historyCallbackFunctions || [];
    window.historyCallbackFunctions[cbFuncName] = function (e) {
        delete window.historyCallbackFunctions[cbFuncName];
        setVisible(false);

        window.history.replaceState({ ...window.history.state, cb: undefined }, '');
        if (getStack) {
            var stack = getStack();
            while (stack.length > 0) {
                var fun = stack.pop();
                if (fun) {
                    fun();
                }
            }
        }
    };
}
//-------------------------------------------------------------------
export function ycStorage(auth) {
    return "https://storage.yandexcloud.net/"
}
//-------------------------------------------------------------------
export function JSX(render) {
    return render();
}
export function JSXMap(array, render) {
    if (!array) return <React.Fragment></React.Fragment>;
    return array?.map((e, idx) => render(e, idx));
}
export function JSXPathMap(object, path, render) {
    let array = _.get(object, path);
    return JSXMap(array, render);
}
export function JSXIndex(array, index, render) {
    if (!array) return <React.Fragment></React.Fragment>;
    if (!_.isArray(index)) {
        if (array.length < index) return <React.Fragment></React.Fragment>;
        return render(array[index], index);
    } else {
        return index?.map((i, idx) => JSXIndex(array, i, render));
    }
}
//-------------------------------------------------------------------
export function GetMetaPropertyByPath(meta, obj, path) {
    let properties = GetMetaProperties(obj);
    let array = path?.split(".");
    if (array && array.length > 1) {
        for (let i = 0; i < array.length; i++) {
            const element = array[i];
            let property = properties.find(e => e.name.toLowerCase() == element.toLowerCase())
            let nobj = _.get(property, "relation.reference.object");
            let type = _.get(property, "relation.type");
            if (nobj) {
                let mnobj = meta[nobj];
                if (mnobj) {
                    return GetMetaPropertyByPath(meta, mnobj, array.slice(1, array.length).join("."))
                }
            }
        }
    } else {
        return properties.find(e => e.name.toLowerCase() == path.toLowerCase());
    }
};
export function GetMetaProperties(meta, exclude) {
    var xmeta = GetMeta(meta)
    if (typeof xmeta === "object" && !Array.isArray(xmeta)) {
        let p = xmeta.properties;
        if (p && exclude) {
            p = p?.filter(e => exclude.findIndex(f => f.toLowerCase() === e.name.toLowerCase()) < 0);
        }
        return p;
    } else if (typeof xmeta === "object" && Array.isArray(xmeta)) {
        return xmeta;
    } else {
        console.warn("Не удалось определить метаданные из переданного параметра");
    }
};
export function SetMetaProperties(meta, properties) {
    return (meta && _.isArray(meta)) ? properties : { ...meta, properties: properties }
};
export function GetMeta(meta) {
    if (meta && meta !== null && typeof meta === "function") {
        let m = meta();
        if (m && m !== null && typeof m === "function") {
            return GetMeta(m);
        } else if (typeof m === "object") {
            return m;
        }
    }
    return meta;
};
//-------------------------------------------------------------------
export const updateInProperties = (properties, item, first) => {
    let key = "name"
    if (!properties) properties = [];
    if (!item || !item[key]) return properties;
    if (_.findIndex(properties, { [key]: item[key] }) >= 0) {
        return properties?.map(e => IfElse(e[key] === item[key], { ...e, ...item }, e));
    } else {
        return (first) ? [item, ...properties] : [...properties, item];
    }
}
export const deleteInProperties = (properties, item) => {
    let key = "name"
    if (!properties) properties = [];
    if (!item || (!_.isArray(item) && _.isObject(item) && !item[key])) return properties;
    let i = unwrap(item);
    if(_.isArray(i)){
        return properties?.filter(e => And(i.map(c=>e[key] !== ((_.isObject(c))?c[key]:c))))
    } 
    return properties?.filter(e => e[key] !== item[key]);
}
export const triggerInProperties = (properties, item) => {
    let key = "name"
    if (properties.find(x => x[key] === item[key]) !== undefined) {
        return deleteInArray(properties, item);
    } else {
        return updateInArray(properties, item);
    }
}
export const foreachInProperties = (properties, func, item) => {
    if (!properties) properties = [];
    if (!item) return properties;
    return properties.map(n => And(func(n)) ? {...n, ...((_.isFunction(item))?item(n):item)} : n )
}
export const updatePropertiesInProperties = (properties, items) => {
    if (!properties) properties = [];
    if (_.isArray(items)) {
        let tmp = [...properties];
        for (let i = 0; i < items.length; i++) {
            const it = items[i];
            tmp = updateInProperties(tmp, it);
        }
        return tmp;
    } else {
        return updateInProperties(properties, items);
    }
}
export const deletePropertiesInProperties = (properties, items) => {
    if (!properties) properties = [];
    if (_.isArray(items)) {
        let tmp = [...properties];
        for (let i = 0; i < items.length; i++) {
            const it = items[i];
            tmp = deleteInProperties(tmp, it);
        }
        return tmp;
    } else {
        return deleteInProperties(properties, items);
    }
}
export const triggerPropertiesInProperties = (properties, items) => {
    if (!properties) properties = [];
    if (_.isArray(items)) {
        let tmp = [...properties];
        for (let i = 0; i < items.length; i++) {
            const it = items[i];
            tmp = triggerInProperties(tmp, it);
        }
        return tmp;
    } else {
        return triggerInProperties(properties, items);
    }
}
//-------------------------------------------------------------------
//-------------------------------------------------------------------
//Получение значения объекта. object - сам объект, subObject - строка содержащая описание подъобъекта.
export function getObjectValue(object, subObject) {
    //Если присутствуют под объекты.
    if (object && subObject) {
        //            var subObjects = subObject.split('.');
        //разбиваем строку subObject через "." не трогая при этом точки в угловых скобках [sdf.sdf]
        var subObjects = subObject
            .replace(/\[[\wа-яА-ЯёЁ\d\."']*\]/g, function (item) {
                return item.replace(".", "<<8>>")
            })
            .split(".")
            ?.map(function (item) {
                return item.replace(/<<8>>/g, ".");
            });
        //Перебираем под объекты
        for (var i = 0; i < subObjects.length; i++) {
            var index = subObjects[i].match(/\[.*\]/);
            var subObj = subObjects[i].replace(/\[.*\]/, "");
            if (subObj) {
                var lastObj = subObj;

                if (object === null) {
                    console.debug("Ошибка получения объекта: " + subObject + "; Не удается найти свойство: " + "\"" + subObj + "\"");
                    return;
                }

                object = object[subObj];
                if (object === undefined) {
                    console.debug("Ошибка получения объекта: " + subObject + "; Не удается найти свойство: " + "\"" + subObj + "\"");
                    return;
                }

                //Проверяем является ли под объект массивом
                if (index) {
                    var rexp = /\[([\wа-яА-ЯёЁ\d\.]+)\]|\[["|']([\wа-яА-ЯёЁ\d\.]+)["|']\]/g;
                    var matchArray;
                    //Поиск всех индексов для n-мерного массива
                    while ((matchArray = rexp.exec(index))) {
                        var matchIndex = matchArray[1] || matchArray[2];
                        if (matchIndex) {
                            object = object[matchIndex];
                            if (object === undefined) {
                                console.debug("Ошибка получения объекта: " + subObject + "; Не существует элемента с индексом: \"" + matchIndex + "\" в объекте: " + lastObj);
                                return;
                            }
                        } else {
                            console.debug("Ошибка получения объекта: " + subObject + "; Не могу получить указанный объект. Ошибка получения индекса элемента.");
                            return;
                        }
                    }
                }
            } else {
                console.debug("Ошибка получения объекта: " + subObject + "; Не могу получить указанный объект.");
                return;
            }
        }
    }
    return object;
}
export function getObjectValueOrDefault(object, subObject, defValue) {
    var result = getObjectValue(object, subObject);
    if (result === undefined || result === null) {
        if (defValue !== undefined) {
            return defValue;
        }
    }
    return result;
}
export function getObjectDisplay(data, name, meta) {
    if (!name || !meta || !data) return undefined;
    const display = (display) => {
        if (display?.fields) {
            return display
        }
    }
    // const metaObject = meta[name?.toLowerCase()];
    const metaObject = meta[name];
    return getDisplay(data, display(metaObject?.display), metaObject, meta)
}
export function getFieldDisplay(data, propertyMeta, meta) {
    if (!propertyMeta || !meta || !data) return undefined;
    const display = (display) => {
        if (display.fields) {
            return display
        }
    }
    const metaObject = meta[getObjectValue(propertyMeta, "relation.reference.object")];
    return getDisplay(data, display(propertyMeta?.relation?.display) || display(metaObject?.display), metaObject, meta)
}
/**
 * Возвращает представление объекта по его данным
 * @param {type} data данные объекта
 * @param {type} display структура представления объекта
 * @param {type} metaObject информация об объекте
 * @param {type} meta мета
 * @return представление объекта
 */
export function getDisplay(data, display, metaObject, meta) {
    var result = "";
    if (!data) {
        return result;
    }
    //        if (!display || !display.fields) {
    //            display = meta.display;
    //        }
    if (!display || !display.fields) {
        return result;
    }
    var sep = "";
    if (display.sep) {
        sep = display.sep;
    }
    for (var i = 0; i < display.fields.length; i++) {
        //получили поле, получили значение поля
        var field = display.fields[i];

        var name_field = field.value.split(".")?.map((e) => uncapitalize(e)).join(".");

        var value_field = getObjectValue(data, name_field);

        if (_.isObject(value_field)) {
            value_field = getDisplay(value_field, metaGetFieldByName(metaObject, meta, name_field)?.relation?.display, metaObject, meta);
            if (!value_field) {
                var subMeta = meta[metaGetFieldByName(metaObject, meta, name_field)?.relation?.reference?.object];
                value_field = getDisplay(getObjectValue(data, name_field), subMeta?.display, subMeta, meta);
            }
        }

        //Если задан объект meta, пытаемся отформатировать поле в соответствии с типом
        var metaField = metaGetFieldByName(metaObject, meta, name_field);

        if (metaField && metaField.type) {
            value_field = getFormatFieldValueTableView(value_field, metaField.type, metaField);
        }

        if (value_field) {
            result += ((field.prefix) || "") + value_field + ((field.suffix) || "");

            if (i < display.fields.length - 1) {
                result += sep;
            }
        }
    }

    return result;
}

/**
 * Глубоко клонирует объект objectName
 * @param objectName клонируемый объект
 * @return клонированный объек
 */
export function metaGetCloneObject(objectName, meta) {
    return _.cloneDeep(meta[objectName]);
};

/**
 * Возвращает поле по имени если такое содержится в объекте metaObject
 * @param metaObject объект метаданных или имя объекта метаданных
 * @param string|array fieldName имя поля в объекте метаданных может быть составное через точку, 
 * или массив составляющий поле
 * @return {Object}
 */
export function metaGetFieldByName(metaObject, meta, fieldName) {
    //Если передали имя объекта метаданых, то извлекаем сам объект
    if (typeof (metaObject) === "string") {
        var metaObject = metaGetCloneObject(metaObject, meta);
    } else if (typeof (metaObject) !== "object") {
        return;
    }
    if (!getObjectValue(metaObject, "properties.length") || !fieldName) {
        return;
    }

    if (typeof (fieldName) === "string") {
        fieldName = fieldName.split(".");
    }

    if (!fieldName.length || fieldName.length < 1) {
        return;
    }

    for (var tag in metaObject.properties) {
        if (metaObject.properties[tag].name?.toLowerCase() === fieldName[0].toLowerCase()) {
            //Если сейчас не последняя часть fieldName
            if (fieldName.length > 1) {
                //Если текущая часть является объектом
                var subObjectName = getObjectValue(metaObject, "properties[" + tag + "].relation.reference.object");
                if (subObjectName) {
                    return metaGetFieldByName(meta[subObjectName], fieldName.slice(1));
                } else {
                    console.error("metaGetFieldByName. Не удалось найти " + fieldName + " в объекте " + metaObject.name, metaObject);
                    return;
                }
            } else {
                return metaObject.properties[tag];
            }
        }
    }
}

/**
 * Возвращает поля DisplayFields
 * @param {type} display структура представления объекта
 * @param {type} metaObject информация об объекте
 * @param {type} parent родительский объект конкатенируется к текущему полю через точку
 * @param {type} result итоговый массив полей
 * @return массив полей
 */
export function getSortingDisplayFields(display, metaObject, meta, parent, result) {
    result = result || [];
    parent = parent || "";
    if (!display || !display.length || !metaObject) {
        return result;
    }

    for (var i = 0; i < display.length; i++) {
        var field = display[i];

        if (!field.sorting) {
            continue;
        }

        var name_field = field.value.split(".")?.map((e) => uncapitalize(e)).join(".");
        var metaField = metaGetFieldByName(metaObject, name_field);

        if (parent) {
            name_field = parent + "." + name_field;
        }
        if (getObjectValue(metaField, "relation.reference.object") && meta[metaField.relation.reference.object]) {
            var fieldMeta = meta[metaField.relation.reference.object];
            getSortingDisplayFields(metaField.relation.display || fieldMeta.display, fieldMeta, meta, name_field, result);
        } else {
            result.push(name_field);
        }
    }
    return result;
}
export function typeIsNumber(type) {
    return (type === "int" ||
        type === "integer" ||
        type === "long" ||
        type === "double" ||
        type === "bigdecimal");
}
/**
 * Извлекает значение поля для отображения в таблице
 * @return 
 */
export function getFormatFieldValueTableView(data, type, meta) {
    if (type === "boolean" || type === "bool") {
        var trueValue = getObjectValueOrDefault(meta, "booleanPresenter.trueValue", "Да");
        var falseValue = getObjectValueOrDefault(meta, "booleanPresenter.falseValue", "Нет");
        return data ? trueValue : falseValue;
        //return data ? "<span style='font-weight: 600;'>"+trueValue+"</span>" : "<span>"+falseValue+"</span>";
    }

    if (!data) {
        return '';
    }

    if (type === "timestamp" || type === "datetime" || type == "localdatetime") {
        var mDate = dayjs(data);
        if (mDate && mDate.isValid()) {
            return mDate.format("DD.MM.YYYY HH:mm:ss");
        }
    } else if (type === "date" || type == "localdate") {
        var mDate = dayjs(data);
        if (mDate && mDate.isValid()) {
            return mDate.format("DD.MM.YYYY");
        }
    } else if (type === "time" || type === "localtime") {
        var mDate = '';
        if (data.length <= 8) {
            mDate = dayjs(data, "HH:mm:ss");
        } else if (data.length > 8) {
            mDate = dayjs(data);
        }

        if (mDate && mDate.isValid()) {
            return mDate.format("HH:mm:ss");
        }
    } else if (type === "int" || type === "uint" ||
        type === "integer" ||
        type === "long") {
        return priceFormat(data);
    } else if (type === "double" ||
        type === "bigdecimal" || type === "float") {
        return priceFormat(data, 2);
    } else {
        return data;
    }

    return '';
}

/**
 * Форматирует число в формат цены
 * @param double price цена до форматирования
 * @param int precision точность
 * @return String
 */
export function priceFormat(price, precision) {
    if (!price) {
        price = 0;
    }

    if (typeof (price) === "string") {
        price = Number.parseFloat(price.trim().replace(" ", "").replace(",", "."))
    }

    if (!precision) {
        precision = 0;
    }

    var format = "0,0";
    for (var i = 0; i < precision; i++) {
        if (i === 0) {
            format += ".";
        }
        format += "0";
    }
    return numeral(price).format(format);
}

// MetaColumns(metaObj.properties, meta, ArrayOfActionObjects)
export function MetaColumns(properties, meta, onColumnClick) {
    return ({ request /*(values, itemAction)*/, auth, collection, setCollection }) => {
        const click = (record, item) => {
            if (onColumnClick && item && onColumnClick[item.name]) {
                request(record, { action: onColumnClick[item.name] });
            }
        };
        return properties?.map((item, idx) => {
            if (item.type === "object" || item.type === "document") {
                let fieldMeta = meta[getObjectValue(item, "relation.reference.object")];
                const display = (display) => {
                    if (display.fields) {
                        return display
                    }
                }
                return ({
                    title: item.label,
                    render: (text, record, index) => {
                        return (<div style={(onColumnClick && onColumnClick[item.name]) ? { cursor: "pointer", color: "#1890ff" } : {}} onClick={() => click(record, item)}>{getDisplay(record[uncapitalize(item.name)], display(item.relation.display) || display(fieldMeta.display), fieldMeta, meta)}</div>)
                    }
                })
            }
            return ({
                title: item.label,
                render: (text, record, index) => {
                    return (<div style={(onColumnClick && onColumnClick[item.name]) ? { cursor: "pointer", color: "#1890ff" } : {}} onClick={() => click(record, item)}>{getFormatFieldValueTableView(record[uncapitalize(item.name)], item.type, item)}</div>)
                }
            })
        })
    }
};

// Hook

// function App() {
//     const [hoverRef, isHovered] = useHover();
//     return <div ref={hoverRef}>{isHovered ? "😁" : "☹️"}</div>;
//   }

export function useHover() {
    const [value, setValue] = useState(false);
    const ref = useRef(null);
    const handleMouseOver = () => setValue(true);
    const handleMouseOut = () => setValue(false);
    useEffect(
        () => {
            const node = ref.current;
            if (node) {
                node.addEventListener("mouseover", handleMouseOver);
                node.addEventListener("mouseout", handleMouseOut);
                return () => {
                    node.removeEventListener("mouseover", handleMouseOver);
                    node.removeEventListener("mouseout", handleMouseOut);
                };
            }
        },
        [ref.current] // Recall only if ref changes
    );
    return [ref, value];
}
//---------------------------------------------------------------------
export function isRequired(item) {
    if (item && item.validators) {
        return item.validators.required || item.required;
    }
    return false;
}
export function validator(func, message) {
    return {
        validator: (_, value) => {
            if (func(value)) {
                return Promise.resolve();
            }
            return Promise.reject(new Error(message))
        }
    }
};
export function formItemRules(item) {
    let res = [];
    if (item && item.validators) {
        if (_.isArray(item.validators)) {
            for (let i = 0; i < item.validators.length; i++) {
                const _validator = item.validators[i];
                if (_validator.func) {
                    res.push(
                        validator(_validator.func, _validator.message),
                    );
                } else {
                    res.push(_validator);
                }
            }
        } else if (_.isObject(item.validators)) {
            if (isRequired(item) === true) {
                res.push({ required: true, message: 'Укажите ' + item.label.toLowerCase() + '!' });
            }
            if (item?.validators?.max) {
                res.push({ max: item?.validators?.max, message: `Значение должно быть не больше ${item?.validators?.max} символов!` });
            }
            if (item?.validators?.min) {
                res.push({ min: item?.validators?.min, message: `Значение должно быть не меньше ${item?.validators?.max} символов!` });
            }
            if (item?.validators?.pattern) {
                res.push({ pattern: item?.validators?.pattern, message: `Значение должно соответствовать шаблону ${item?.validators?.pattern}!` });
            }
        }
    }
    return res;
};
//---------------------------------------------------------------------