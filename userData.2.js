// window 添加 fingerprint方法
window.fingerprint = function (c) {
    new Fingerprint2().get(function (result, components) {
        if (c !== undefined && typeof c == 'function') {
            c(result);
        } else {
            window.fingerprint = result;
        }
    });
}

function creScript(scr, num, url) {
    var d1 = document,
        scr = d1.createElement('script'),
        s1 = d1.getElementsByTagName('script')[num];
    scr.type = 'text/javascript';
    scr.src = url;
    s1.parentNode.insertBefore(scr, s1);
    return scr
}
creScript('g1', 0, 'https://kfcdn.hy9z.com/js/fingerprint2.js')
creScript('g2', 1, 'https://kfcdn.hy9z.com/js/userData/mobile-detect.min.js')
creScript('g3', 2, 'https://webapi.amap.com/maps?v=1.4.10&key=a8e3f1d526511281bac2edf977a6ca03')

setTimeout(function () {
    function getParentUrl() {
        var url = null;
        if (parent !== window) {
            try {
                url = parent.location.origin;
            } catch (e) {
                url = document.referrer.slice(0, document.referrer.length - 1);
            }
        }
        return url;
    }
    var hostUrl = getParentUrl()
    if (hostUrl === 'https://kfadsale.hy9z.com' || hostUrl === 'https://adsale.hy9z.com') return false

    function timeout() {
        return new Promise(function (resolve, reject) {
            new Fingerprint2().get(function (result, components) {
                resolve(result)
            })
        });
    }

    timeout().then(function (res) {
        var uuidInfo = res
        var openWsSend = true
        var xhr = new XMLHttpRequest
        if (isKf) {
            xhr.open("get", 'https://kfapistore.hy9z.com/adsalev2/getip')
        } else {
            xhr.open("get", 'https://apistore.hy9z.com/adsalev2/getip')
        }

        xhr.send(null)
        xhr.onreadystatechange = function () {
            if (4 == xhr.readyState && 200 == xhr.status) {
                console.log('获取IP')
                // 基础信息
                var data1 = {
                    'act': 'basic',
                    'uuid': uuidInfo,
                    'key': '',
                    'url': window.location.href,
                    'brand': '',
                    'terminal': '',
                    'version': '',
                    'ip': xhr.responseText,
                    'lon': '',
                    'lat': '',
                    'province': '',
                    'city': '',
                    'area': ''
                }

                new AMap.Map("map").plugin("AMap.Geolocation", function () {
                    (e = new AMap.Geolocation({
                        enableHighAccuracy: true,
                        timeout: 10000,
                        maximumAge: 0,
                        noIpLocate: 0,
                        noGeoLocation: 3
                    })).getCurrentPosition(),
                        AMap.event.addListener(e, "complete", info),
                        AMap.event.addListener(e, "error", error)
                })

                function info(n) {
                    data1.province = n.addressComponent.province,
                        data1.city = n.addressComponent.city,
                        data1.area = n.addressComponent.district,
                        data1.lon = n.position.getLng(),
                        data1.lat = n.position.getLat()
                    if (data1.url || data1.url != '') {
                        getNav()
                    }
                }

                function error(n) {
                    console.log(n.info + '--' + n.message);
                    if (data1.url || data1.url != '') getNav()
                }

                function getEquipmentInfoII() {
                    var xhr = new XMLHttpRequest();
                    if (isKf) {
                        xhr.open('POST', 'https://kfapistore.hy9z.com/agent/v1/');
                    } else {
                        xhr.open('POST', 'https://apistore.hy9z.com/agent/v1/');
                    }
                    xhr.send(null);
                    xhr.onreadystatechange = function () {
                        if (this.readyState == 4 && this.status == 200) {
                            var dataInfo = JSON.parse(xhr.responseText)
                            data1.brand = dataInfo.data.deviceFamily
                            data1.terminal = dataInfo.data.deviceModel
                            data1.version = dataInfo.data.PlatformName
                            wsData()
                        } else if (this.status == 429 && this.readyState == 4) {
                            return wsData()
                        }
                    };
                }

                function deviceJudge(str) {
                    var str1 = str.split("(")[1];
                    var str2 = str1.split(")")[0];
                    return str2.split(";");
                }
                function getNav() {
                    Array.prototype.contains = function (needle) {
                        for (i in this) {
                            if (this[i].indexOf(needle) > 0)
                                return i;
                        }
                        return -1;
                    }
                    var device_type = navigator.userAgent;//获取userAgent信息 
                    var md = new MobileDetect(device_type);//初始化mobile-detect 
                    var os = md.os();//获取系统 
                    var model = "";
                    if (os == "iOS") {//ios系统的处理 
                        model = md.mobile();
                        os = md.os() + md.version("iPhone");
                        data1.version = os
                        data1.terminal = model
                        data1.brand = 'Apple'
                    } else if (os == "AndroidOS") {//Android系统的处理 
                        os = md.os() + md.version("Android");
                        var sss = device_type.split(";");
                        var needleIndex = sss.contains("Build/");
                        if (needleIndex > -1) {
                            model = sss[needleIndex].substring(0, sss[needleIndex].indexOf("Build/"));
                        }
                        data1.version = os
                        data1.terminal = model.trim()
                        if (md.phone() == 'UnknownPhone' || md.phone() == null || md.phone() == '') {
                            data1.brand = '其他'
                        } else {
                            data1.brand = md.phone()
                        }
                    } else {
                        data1.version = deviceJudge(device_type)[0].trim()
                        data1.terminal = deviceJudge(device_type)[1].trim()
                        data1.brand = deviceJudge(device_type).join('')
                    }
                    if (data1.terminal && data1.brand) {
                        wsData()
                    } else {
                        getEquipmentInfoII()
                    }
                }

                // 页面访问深度
                var data2 = {
                    'act': 'depth',
                    'uuid': uuidInfo,
                    'key': '',
                    'url': window.location.href,
                    'page_count': '',
                    'page_current': '',
                    'time': (new Date()).getTime()
                }

                var h = window.innerHeight
                // 判断可视高度不能低于480
                if (h < 480) h = 480
                // 计算出当前页面可以份几页
                data2.page_count = parseInt(document.body.scrollHeight / h)
                // 计算初始页
                var scTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop;
                if (scTop == undefined) scTop = 0;
                var point = scTop + window.screen.height;
                data2.page_current = Math.ceil(point / window.screen.height);

                function clickInfo(act) {
                    var clickInfoData = {
                        'act': act,
                        'uuid': uuidInfo,
                        'key': '',
                        'url': window.location.href,
                        'num': '1',
                        'time': (new Date()).getTime()
                    }
                    return clickInfoData
                }

                function wsData() {
                    var lockReconnect = false;
                    var ws = null
                    function createWebSocket() {
                        try {
                            ws = new WebSocket('wss://kfrobot.hy9z.com:9605')
                            ws.onopen = function () {
                                ws.send(JSON.stringify(data1))

                                window.onscroll = function () {
                                    // 获取滑动高度
                                    var t = document.documentElement.scrollTop || document.body.scrollTop
                                    // 计算当前滑到第几屏
                                    var r = (parseInt(t / h) + 1)
                                    // 判断当前与上一页不能相同 && 当前页大于上一页
                                    if (data2.page_current != r && r > data2.page_current) {
                                        data2.page_current = r
                                        if (openWsSend) ws.send(JSON.stringify(data2))
                                    }
                                }

                                $(document).on("click", ".sale_tel", function () {
                                    if (openWsSend) ws.send(JSON.stringify(clickInfo("click_tel")))
                                })
                                $(document).on("click", ".sale_map", function () {
                                    if (openWsSend) ws.send(JSON.stringify(clickInfo("click_map")))
                                })
                                $(document).on("click", ".sale_detail", function () {
                                    if (openWsSend) ws.send(JSON.stringify(clickInfo("click_xq")))
                                })
                                $(document).on("click", ".sale_appointSubmit", function () {
                                    if (openWsSend) ws.send(JSON.stringify(clickInfo("click_form")))
                                })
                            }

                            ws.onmessage = function (msg) {
                                if (JSON.parse(msg.data).basic) ws.send(JSON.stringify(data2))
                            }

                            ws.onclose = function () {
                                // websocket断开连接后禁止发送ws请求
                                openWsSend = false
                                console.log('websocket close')
                            }

                            ws.onerror = function (evt) {
                                console.log(evt)
                            }
                        } catch (e) {
                            reconnect();
                        }
                    }
                    function reconnect() {
                        if (lockReconnect) return;
                        lockReconnect = true;
                        //没连接上会一直重连，设置延迟避免请求过多
                        setTimeout(function () {
                            createWebSocket();
                            console.log("正在重连，当前时间" + new Date())
                            lockReconnect = false;
                        }, 5000);
                    }

                    createWebSocket()
                }
            }
        }
    })
}, 300)