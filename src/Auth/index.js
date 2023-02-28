import React, { createContext, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import decode from 'jwt-decode';
import WSocket from '../IO/WSocket';
import moment from 'moment-timezone';
import 'moment/locale/ru';
import { message } from 'antd';
import Cookies from 'js-cookie'

export class AuthService {
    constructor(domain) {
        this.ws = new WSocket({ auth: this });
        var port = (process.env.REACT_APP_PORT) ? ":" + process.env.REACT_APP_PORT : "";
        var portws = (process.env.REACT_APP_PORTWS) ? ":" + process.env.REACT_APP_PORTWS : "";
        this.Hostname = window.location.hostname + port || "localhost:3000"
        this.Hostnamews = window.location.hostname + portws || "localhost:8480"
        this.schemws = process.env.REACT_APP_SCHEMWS || "ws"
        this.schemhttp = process.env.REACT_APP_SCHEMHTTP || "http"
        this.authschemhttp = process.env.REACT_APP_AUTHSCHEMHTTP || this.schemhttp
        this.domain = domain || this.schemhttp + '://' + this.Hostname
        this.appProfile = process.env.REACT_APP_PROFILE || "dev"
        this.fetch = this.fetch.bind(this)
        this.fetchRfToken = this.fetchRfToken.bind(this)
        this.login = this.login.bind(this)
        this.loginLink = this.loginLink.bind(this)
        this.logoutLink = this.logoutLink.bind(this)
        this.logoutAllLink = this.logoutAllLink.bind(this)
        this.redirect = this.redirect.bind(this)
        this.signup = this.signup.bind(this)
        this.getProfile = this.getProfile.bind(this)
        this._checkStatus = this._checkStatus.bind(this)
        this.PerformanceStart = this.PerformanceStart.bind(this)
        this.getPerformance = this.getPerformance.bind(this)
        this.getCookies = this.getCookies.bind(this)
        this.getCookie = this.getCookie.bind(this)
        this.getCity = this.getCity.bind(this)
        this.utf8_to_b64 = this.utf8_to_b64.bind(this)
        this.b64_to_utf8 = this.b64_to_utf8.bind(this)
        this.performance = new Map()
    }

    getDomainWithoutSubdomain(url) {
        const urlParts = new URL(url).hostname.split('.')

        return urlParts
            .slice(0)
            .slice(-(urlParts.length === 4 ? 3 : 2))
            .join('.')
    }
    utf8_to_b64(str) {
        return btoa(unescape(encodeURIComponent(str)));
    }
    b64_to_utf8(str) {
        return decodeURIComponent(escape(atob(str)));
    }
    getCity() {
        let c = Cookies.get("city");
        if (c) {
            try {
                let ce = this.b64_to_utf8(c)
                let [ID, name, region] = ce.split('@');
                let IDi = parseInt(ID, 10);
                if (ID && name && region) {
                    return {
                        ID: (!isNaN(IDi)) ? IDi : undefined,
                        name,
                        region
                    }
                }
            } catch (error) {

            }
        }
        return
    }
    getCookies() {
        var result = {}
        var cookies = document.cookie.split("; ");
        for (var i = 0; i < cookies.length; i++) {
            var spl = cookies[i].split("=");
            result[spl[0]] = spl[1];
        }
        return result;
    }
    getCookie(name) {
        var result = this.getCookies()
        return result[name];
    }
    getPerformance() {
        return this.performance;
    }
    PerformanceStart(path) {
        var start = performance.now();
        var endCallback = () => {
            var end = performance.now();
            if (this.performance.has(path)) {
                var prev = this.performance.get(path);
                this.performance.set(path, {
                    last: moment(new Date()).format(),
                    delta: end - start,
                    avg: Math.abs((end - start) + prev.avg) / 2,
                });
            } else {
                this.performance.set(path, {
                    last: moment(new Date()).format(),
                    delta: end - start,
                    avg: end - start,
                });
            }
        };
        return endCallback
    }
    // setHandle(options) {
    //     this.ShowMessage = options.ShowMessage
    // }
    openSocket(path, name, onmessage, onopen, onclose, onerror) {
        if (this.ws.state.ws[name]) {
            this.ws.close(name, false);
        }
        this.ws.open(this.schemws + "://" + this.Hostnamews + path, name,
            //onmessage
            function (e) {
                try {
                    var message = JSON.parse(e.data);
                    onmessage(message.type, message.payload)
                } catch (ex) { }
            },
            //onopen
            onopen,
            //onclose
            onclose,
            //onerror
            onerror
        );
    }
    closeSocket(name) {
        this.ws.close(name);
    }

    redirect(res) {
        var nurl = new URL(window.location.href);
        var refUrl = nurl.searchParams.get("service");
        if (refUrl) {
            window.location.href = refUrl;
            return
        }
        if (res.user.roleUser && res.user.roleUser.length) {
            for (var i = 0; i < res.user.roleUser.length; i++) {
                res.user.roleUser.sort(function (a, b) {
                    return a.role.priority - b.role.priority;
                });
                if (res.user.roleUser[i].roleID === 1 || res.user.roleUser[i].roleID === 2) {
                    window.location.href = "/"
                } else {
                    window.location.href = this.schemhttp + "://" + this.getDomainWithoutSubdomain(window.location.href);
                    return
                }
            }
        }
        window.location.href = this.schemhttp + "://" + this.getDomainWithoutSubdomain(window.location.href);
    }
    login(email, password) {
        return this.fetch(`/api/login`, {
            method: 'POST',
            body: JSON.stringify({
                email,
                password
            })
        }).then(res => {
            if (res && res.user) {
                localStorage.setItem('iam', res.user.ID);
                this.redirect(res);
            } else {
                return Promise.resolve(res);
            }
        })
    }

    signup(data) {
        data.genderID = +data.genderID;
        data.regionID = +data.regionID;
        data.cityID = +data.cityID;
        data.tipTelefonaID = +data.tipTelefonaID;
        return this.fetch(`/api/signup`, {
            method: 'POST',
            body: JSON.stringify(data)
        }).then(res => {
            if (res && res.user) {
                localStorage.setItem('iam', res.user.ID);
                // this.redirect(res);
            }
            return Promise.resolve(res);
        })
    }

    forgotPassword(data) {
        return this.fetch(`/api/forgot-password`, {
            method: 'POST',
            body: JSON.stringify(data)
        }).then(res => {
            return Promise.resolve(res);
        })
    }

    resetPassword(data) {
        var nurl = new URL(window.location.href);
        var token = nurl.searchParams.get("token");

        return this.fetch(`/api/reset-password?token=` + token, {
            method: 'POST',
            body: JSON.stringify(data)
        }).then(res => {
            return Promise.resolve(res);
        })
    }

    loggedIn() {
        // Checks if there is a saved token and it's still valid
        const token = this.getToken() // GEtting token from localstorage
        const refreshToken = this.getCookie("refreshToken") // GEtting token from localstorage
        return ((!!token && !this.isTokenExpired(token)) || (!!refreshToken && !this.isTokenExpired(refreshToken))) // handwaiving here
    }

    isTokenExpired(token) {
        try {
            const decoded = decode(token);
            if (decoded.exp < Date.now() / 1000) { // Checking if token is expired. N
                return true;
            }
            else
                return false;
        }
        catch (err) {
            return false;
        }
    }

    // setToken(idToken) {
    //     // Saves user token to localStorage
    //     localStorage.setItem('id_token', idToken)
    // }

    getToken() {
        // Retrieves the user token from localStorage
        return this.getCookie("token")
        // return localStorage.getItem('id_token')
    }

    logout(cb) {
        // Clear user token and profile data from localStorage
        // localStorage.removeItem('id_token');

        Cookies.remove("token")
        Cookies.remove("refreshToken")
        window.location.href = this.authschemhttp + "://auth." + this.getDomainWithoutSubdomain(window.location.href) + "/logout?service=" + window.location.href;
        // this.fetch(`/api/logout`).then(res => {
        //     if (res) {               
        //         if(cb) {
        //             cb();
        //         }
        //     }
        // })
    }
    logoutall(cb) {
        // Clear user token and profile data from localStorage
        // localStorage.removeItem('id_token');
        Cookies.remove("token")
        Cookies.remove("refreshToken")
        window.location.href = this.authschemhttp + "://auth." + this.getDomainWithoutSubdomain(window.location.href) + "/logoutall?service=" + window.location.href;
        // this.fetch(`/api/logout`).then(res => {
        //     if (res) {               
        //         if(cb) {
        //             cb();
        //         }
        //     }
        // })
    }

    loginLink(location) {
        let l = location || window.location.href;
        return this.authschemhttp + "://auth." + this.getDomainWithoutSubdomain(l) + "/login?service=" + l;
    }
    logoutLink(location) {
        let l = location || window.location.href;
        return this.authschemhttp + "://auth." + this.getDomainWithoutSubdomain(l) + "/logout?service=" + l;
    }
    logoutAllLink(location) {
        let l = location || window.location.href;
        return this.authschemhttp + "://auth." + this.getDomainWithoutSubdomain(l) + "/logoutall?service=" + l;
    }

    getProfile() {
        // Using jwt-decode npm package to decode the token
        return decode(this.getToken());
    }

    fetchRfToken = configureRefreshFetch(this)

    fetchRaw(url, options) {
        // performs api calls sending the required authentication headers
        const headers = {

        }

        // Setting Authorization header
        // Authorization: Bearer xxxxxxx.xxxxxxxx.xxxxxx
        if (this.loggedIn()) {
            headers['Authorization'] = 'Bearer ' + this.getToken()
        }
        var end = this.PerformanceStart(url);
        return this.fetchRfToken(this.domain + url, {
            headers,
            ...options
        })
            .then(this._checkStatus)
            .then(response => {
                if (end) {
                    end();
                }
                return response;
            })
    }

    fetchFile(url, options) {
        const headers = {
            // 'X-Requested-With': 'XMLHttpRequest'
        }
        // Setting Authorization header
        // Authorization: Bearer xxxxxxx.xxxxxxxx.xxxxxx
        if (this.loggedIn()) {
            headers['Authorization'] = 'Bearer ' + this.getToken()
        }
        var end = this.PerformanceStart(url);
        return this.fetchRfToken(this.domain + url, {
            headers,
            ...options
        })
            .then(this._checkStatus)
            .then((res) => {
                if (end) {
                    end();
                }
                if (res.headers.get("Content-Type") == "application/json") {
                    res.json().then((jData) => {
                        if (jData && !jData.status) {
                            message.error(jData.message)
                            return;
                        }
                    })
                } else {
                    res.blob().then(blob => {
                        let url = window.URL.createObjectURL(blob);
                        let a = document.createElement('a');
                        a.href = url;
                        //replace(/^\"+|\"+$/g, '') - trim('"')
                        let fname = res.headers.get("x-filename") || "";
                        a.download = decodeURI(fname.replace(/^\"+|\"+$/g, ''));
                        a.click();
                    });
                }
            })
    }
    fetchForData(url, options) {
        // performs api calls sending the required authentication headers
        const headers = {

        }

        // Setting Authorization header
        // Authorization: Bearer xxxxxxx.xxxxxxxx.xxxxxx
        if (this.loggedIn()) {
            headers['Authorization'] = 'Bearer ' + this.getToken()
        }
        var end = this.PerformanceStart(url);
        return this.fetchRfToken(this.domain + url, {
            headers,
            ...options
        })
            .then(this._checkStatus)
            .then(response => {
                if (end) {
                    end();
                }
                return response.json();
            })
            .then(res => {
                // if (res && !res.status) {
                //     if (this.ShowMessage) {
                //         this.ShowMessage(res.message, "danger")
                //     }
                // }
                return Promise.resolve(res);
            })
    }
    fetch(url, options) {
        // performs api calls sending the required authentication headers
        const headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }

        // Setting Authorization header
        // Authorization: Bearer xxxxxxx.xxxxxxxx.xxxxxx
        if (this.loggedIn()) {
            headers['Authorization'] = 'Bearer ' + this.getToken()
        }
        var end = this.PerformanceStart(url);
        return this.fetchRfToken(this.domain + url, {
            headers,
            ...options
        })
            .then(this._checkStatus)
            .then(response => {
                if (end) {
                    end();
                }
                return response.json();
            })
            .then(res => {
                // if (res && !res.status) {
                //     if (this.ShowMessage) {
                //         this.ShowMessage(res.message, "danger")
                //     }
                // }
                return Promise.resolve(res);
            })
    }

    _checkStatus(response) {
        // raises an error in case response status is not a success
        if (response.status >= 200 && response.status < 300) { // Success status lies between 200 to 300
            return response
        } else if (response.status == 401 && response.headers.get('x-authenticate-error') == 'NeedLogin') {
            Cookies.remove("token")
            Cookies.remove("refreshToken")
            window.location.href = this.authschemhttp + "://auth." + this.getDomainWithoutSubdomain(window.location.href) + "/login?service=" + window.location.href;
            return response;
        } else if (response.status == 403) {
            console.error(response.status, "Доступ запрещен", response.url);
            return response;
        } else {
            // if(this.ShowMessage) {
            //     this.ShowMessage(response.statusText, "danger")
            // }
            var error = new Error(response.statusText)
            error.response = response
            throw error
        }
    }
}

//-------------------------------------------------------------------------------------
let XAuthContext = createContext(null);
let NavigationContext = createContext(null);

export function AuthProvider({ children }) {
    const auth = new AuthService();
    return <XAuthContext.Provider value={auth}>{children}</XAuthContext.Provider>;
}
export function useAuth() {
    let auth = useContext(XAuthContext);
    return auth;
}
export function useNavigation() {
    let navigation = useContext(NavigationContext);
    return navigation;
}
export function RequireAuth({ children, inline }) {
    let auth = useAuth();
    // let location = useLocation();
    let navigate = useNavigate();

    if (!auth.loggedIn()) {
        // Redirect them to the /login page, but save the current location they were
        // trying to go to when they were redirected. This allows us to send them
        // along to that page after they login, which is a nicer user experience
        // than dropping them off on the home page.
        if (inline) {
            return inline;
        }
        window.location.href = auth.authschemhttp + "://auth." + auth.getDomainWithoutSubdomain(window.location.href) + "/login?service=" + window.location.href;
    }
    return <NavigationContext.Provider value={navigate}>{children}</NavigationContext.Provider>;
}
//-------------------------------------------------------------------------------------

function configureRefreshFetch(auth) {

    //Если refreshingTokenPromise != null, то начат процес обновления пары токенов.
    //Если в результате запроса приходит ответ со статусом 401 и заголовком x-authenticate-error != 'NeedLogin', 
    //в refreshingTokenPromise присваивается Promise в котором начинается процедура обновления пары токенов (/api/refresh-token).
    //Если refreshingTokenPromise != null, то все новые поступающие запросы 
    //ожидают завершения промиса и выполняются с новым токеном, если обновление пары прошло успешно, 
    //иначе пользователь отправляется на аутентификацию
    let refreshingTokenPromise = null
    window.__fetch = fetch
    window.fetch = (url, options) => {
        if (refreshingTokenPromise !== null) {
            return (
                refreshingTokenPromise
                    .then(() => {
                        if (options && options.headers && options.headers['Authorization']) {
                            options.headers['Authorization'] = 'Bearer ' + auth.getToken()
                        }
                        return __fetch(url, options)
                    })
                    .catch(() => {
                        if (options && options.headers && options.headers['Authorization']) {
                            options.headers['Authorization'] = 'Bearer ' + auth.getToken()
                        }
                        return __fetch(url, options)
                    })
            )
        }

        return __fetch(url, options).then(response => {
            let xAuthError = response.headers.get('x-authenticate-error')
            if (response.status == 401 && xAuthError != 'NeedLogin') {
                if (refreshingTokenPromise === null) {
                    refreshingTokenPromise = new Promise((resolve, reject) => {
                        __fetch(`/api/refresh-token`, {
                            method: 'POST',
                            headers: {
                                'Accept': 'application/json',
                                'Content-Type': 'application/json',
                                'Authorization': 'Bearer ' + auth.getToken()
                            },
                            body: JSON.stringify({
                                refreshToken: Cookies.get("refreshToken")
                            })
                        }).then(response => {
                            let xAuthError = response.headers.get('x-authenticate-error')
                            if (response.status == 401 && xAuthError == 'NeedLogin') {
                                Cookies.remove("token")
                                Cookies.remove("refreshToken")
                                window.location.href = auth.authschemhttp + "://auth." + auth.getDomainWithoutSubdomain(window.location.href) + "/login?service=" + window.location.href;
                                return
                            }

                            refreshingTokenPromise = null
                            resolve()
                        }).catch(error => {
                            refreshingTokenPromise = null
                            reject(error)
                        })
                    })
                }

                return refreshingTokenPromise.catch(() => {
                    throw error
                }).then(() => {
                    if (options && options.headers && options.headers['Authorization']) {
                        options.headers['Authorization'] = 'Bearer ' + auth.getToken()
                    }
                    return __fetch(url, options)
                })

            } else if (response.status == 401 && xAuthError == 'NeedLogin') {
                Cookies.remove("token")
                Cookies.remove("refreshToken")
                window.location.href = auth.authschemhttp + "://auth." + auth.getDomainWithoutSubdomain(window.location.href) + "/login?service=" + window.location.href;
                return
            }

            return response;
        })
    }

    return window.fetch
}