import $$ from 'dom7';
import Framework7 from 'framework7/framework7.esm.bundle.js';

// import 'framework7/css/framework7.bundle.css';
import '../css/framework7.bundle.min.css';
import cordovaApp from './cordova-app.js';
import routes from './routes.js';

// import '../css/icons.css';
import '../css/app_ios.css';
import '../css/custom.css';
// import '../css/font-awesome.min.css';

import App from '../app.f7.html';
window.$$ = $$;

window.app = new Framework7({
    component: App,
    id: 'com.sooshiroom.ios.SooshiRoom',
    name: 'SooshiRoom',
    version: "3.0.0",
    root: '#prapp',
    theme: 'ios',
    initOnDeviceReady: true,
    statusbar: {
        iosOverlaysWebView: true,
        androidOverlaysWebView: false,
    },
    view: {
        iosDynamicNavbar: false,
    },
    data: function () {
        return {
            baseUrl: "https://sooshiroom.com/bitrix/templates/fn_md/el/",
            baseUrlSite: "https://sooshiroom.com",
            baseUrlAjax: "https://sooshiroom.com/ajaxJSON.php",
            scatsItems: [],
            arUser: [],
            curAddr: [],
            loadedCont: [],
            sliderItems: [],
            newsItems: [],
            topGoods: [],
            currentGoods: [],
            favGoods: [],
            loadedG: false,
            arFav: [],
            arGifts: [],
            selectedGift: 0,
            selectedGiftDID: 0,
            isSeeGift: 0,
            cartGoods: [],
            cartCount: 0,
            cartSumN: 0,
            cartSum: 0,
            cartSumInt: 0,
            cart: false,
            hrefs: [],
            fav: false,
            balls: 0,
            messages: [],
            isUsL: false,
            currentG: 0,
            homeTab: 'tab-1',
        };
    },
    on: {
        init: function () {

            var app = this;
            if (app.device.cordova) {
                // Init cordova APIs (see cordova-app.js)
                cordovaApp.init(app);
            }

            if (typeof (codePush) == "object") {
                codePush.checkForUpdate(function (update) {
                    if (!update) {

                        console.log("The app is up to date.");

                    } else {
                        console.log("An update is available! Should we download it?");

                        codePush.sync(
                            syncStatus,
                            {
                                updateDialog: {
                                    updateTitle: "Доступно обновление!",
                                    optionalInstallButtonLabel: "Установить",
                                    optionalIgnoreButtonLabel: "Игнорировать",
                                    optionalUpdateMessage: "Обновление доступно. Вы хотели бы установить его?",
                                    mandatoryUpdateMessage: "Обновление доступно. Вы хотели бы установить его?",
                                },
                                installMode: InstallMode.IMMEDIATE
                            },
                            downloadProgress
                        );

                        var downloadingProgress;

                        function syncStatus(status) {
                            switch (status) {
                                case SyncStatus.DOWNLOADING_PACKAGE:
                                    downloadingProgress = app.dialog.progress("Загрузка обновлений...", 0);
                                    break;
                                case SyncStatus.INSTALLING_UPDATE:
                                    downloadingProgress.setTitle("Установка обновлений...");
                                    downloadingProgress.setProgress(50);
                                    break;
                                case SyncStatus.UPDATE_INSTALLED:
                                    downloadingProgress.setTitle("Установка завершена.");
                                    downloadingProgress.setProgress(100);

                                    setTimeout(function () {
                                        navigator.splashscreen.show();
                                        codePush.restartApplication();
                                    }, 300);
                                    break;
                            }
                        }

                        function downloadProgress(downloadProgress) {
                            if (downloadProgress) {
                                // Update "downloading" modal with current download %
                                var progress = parseInt(downloadProgress.receivedBytes * 100 / downloadProgress.totalBytes);
                                downloadingProgress.setProgress(progress);
                                console.log("Downloading " + downloadProgress.receivedBytes + " of " + downloadProgress.totalBytes);
                            }
                            console.log(downloadProgress);
                        }
                    }
                });
            }

            var access_token = localStorage.getItem('access_token');
            if (access_token) {
                app.request.setup({
                    headers: {
                        'X-Access-Token': access_token,
                    },
                    crossDomain: true,
                });
            }

            document.addEventListener("wsCommand", function (event) {
                var data = event.detail.params;
                if (event.detail.command == "new_mess") {
                    if (app.views.main.router.currentPageEl.dataset.name == "chat") {
                        ChatPage.methods.refreshMess();
                    } else if (app.views.main.router.currentPageEl.dataset.name == "chatlist") {
                        ChatList.methods.refreshChats();
                    } else {
                        app.messNotify = app.notification.create({
                            icon: '<i class="material-icons">chat_bubble_outline</i>',
                            title: data.title,
                            subtitle: data.subtitle,
                            closeTimeout: 4000,
                            text: data.message,
                            swipeToClose: true,
                            closeOnClick: true,
                            on: {
                                click: function () {
                                    if (data.link)
                                        app.views.main.router.navigate(data.link);
                                }
                            }
                        });
                        app.messNotify.open();

                        app.request.getJSON(app.data.baseUrl + 'get_messlist.php', { s: 'list' }, function (data) {
                            if (data.fll) {
                                $$('.js_mfc').html(data.count);
                                app.data.messages.count = data.count;
                                app.data.messages.fl = data.fll;
                                $$('body').addClass("is_mfo");
                            } else {
                                $$('.js_mfc').html('0');
                                app.data.messages.count = data.count;
                                app.data.messages.fl = data.fll;
                                $$('body').removeClass("is_mfo");
                            }

                            $$(".loader-screen").hide();
                            $$(".btdt").removeClass("hide");
                        });
                    }

                } else if (event.detail.command == "redirect") {
                    if (data.link) app.views.main.router.navigate(data.link);
                }


                console.log(event.detail);
            });

            if (typeof (FCMPlugin) == "object") {
                FCMPlugin.getToken(function (token) {
                    localStorage.setItem('device_token', token);
                    app.device_token = token;
                    app.request.post(app.data.baseUrl + 'set_auth.php', { act: "token", token: token }, function (json) {

                    });
                });

                FCMPlugin.onNotification(function (data) {
                    if (data.wasTapped) {
                        if (data.link) app.views.main.router.navigate(data.link);

                    } else {

                    }

                    console.log(data);
                });
                // end FCM

            }
        }
    },
    methods: {
        logout: function (text, head) {
            if (text == "" || text == undefined)
                text = "Ыы действительно хотите выйти из аккаунта?";
            if (head == "" || head == undefined)
                head = app.name;

            app.dialog.confirm(text, head, function () {
                app.request.post(app.data.baseUrlSite, { logout_app: "Y" }, function (data) {
                    localStorage.removeItem("access_token");
                    localStorage.removeItem("device_token");
                    if (typeof (FCMPlugin) == "object") {
                        //FCMPlugin.unsubscribeFromTopic("all", function (msg){}, function (err){})
                    };
                    app.request.setup({
                        headers: {},
                    });
                    app.request.getJSON(app.data.baseUrl + 'get_user.php', { app: '' }, function (data) {
                        app.data.arUser = data;
                        app.views.main.router.navigate('/login/', { transition: 'f7-flip' });
                        window.ws.close();
                        app.methods.refreshCart();
                    });
                });
            }, function () { })
        },
        initWS: function () {
            if (app.data.arUser.CHANNEL_ID) {
                window.ws = new WebSocket('wss://sooshiroom.com/bitrix/subws/?CHANNEL_ID=' + app.data.arUser.CHANNEL_ID.CHANNEL_ID + '/' + app.data.arUser.SHARED.CHANNEL_ID + '&tag=1');
                window.ws.onopen = function () {
                    console.log("Соединение установлено.");
                };
                window.ws.onclose = function () {
                    console.log("Соединение закрыто.");
                    app.methods.initWS();
                };
                window.ws.onmessage = function (event) {
                    var dataArray = event.data.replace("#!NGINXNMS!#", "");
                    dataArray = dataArray.replace("#!NGINXNME!#", "");

                    var text = event.data.match(/#!NGINXNMS!#(.*?)#!NGINXNME!#/gm);
                    if (text != null) {
                        for (var i = 0; i < text.length; i++) {
                            text[i] = text[i].substring(12, text[i].length - 12);
                            if (text[i].length <= 0)
                                continue;

                            var message = app.methods.parseJSON(text[i]);
                            var data = null;
                            if (message && message.text)
                                data = message.text;
                        }
                    }
                    var mess = data.MESSAGE[0];
                    document.dispatchEvent(new CustomEvent("wsCommand", {
                        detail: mess
                    }));
                };
            }
        },
        parseJSON: function (data) {
            var result = null;

            try {
                if (data.indexOf("\n") >= 0)
                    eval('result = ' + data);
                else
                    result = (new Function("return " + data))();
            } catch (e) {

            }

            return result;
        },
        setAddressByGPS: function () {
            app.data.curAddr = app.data.arUser.addr.active;
            if (typeof (plugin) == "object") {
                console.log("===> request geolocation");
                setTimeout(function () {
                    plugin.google.maps.LocationService.getMyLocation({}, function (location) {
                        $$(".subtitle.ah_street").html("Определяем...");
                        console.log("===> response geolocation");
                        console.log(location);
                        setTimeout(function () {
                            var geocodeResult = app.methods.geocode(parseFloat(location.latLng.lat).toFixed(6), parseFloat(location.latLng.lng).toFixed(6));
                            if (typeof (geocodeResult.lat) != undefined && geocodeResult.addr != undefined) {
                                app.data.curAddr = geocodeResult;
                                app.data.arUser.addr.active = geocodeResult;
                                app.data.arUser.isloc = true;
                                localStorage.setItem('addressData', JSON.stringify(geocodeResult));
                                $$(".subtitle.ah_street").html(geocodeResult.addr);
                            }
                        }, 1000);
                    }, function (error) {
                        console.log(error)
                    });
                }, 1000);
            } else {

            }
        },
        setActAddr: function (id) {
            if (app.notifAddr) { app.notifAddr.close(); app.notifAddr.destroy(); }
            for (var i = 0; i < app.data.arUser.addr.list.length; i++) {
                if (app.data.arUser.addr.list[i].ID == id) {
                    app.data.arUser.addr.active = app.data.arUser.addr.list[i];
                }
            }
            $$(".a_street").val(app.data.arUser.addr.active.street);
            $$(".ah_street").html(app.data.arUser.addr.active.street);
            $$(".a_kv").val(app.data.arUser.addr.active.kv);
            $$(".a_flo").val(app.data.arUser.addr.active.flo);
            $$(".a_par").val(app.data.arUser.addr.active.par);
            $$(".a_dof").val(app.data.arUser.addr.active.dof);
            app.data.curAddr = app.data.arUser.addr.active;
            app.notifAddr = app.notification.create({
                icon: '<i class="material-icons color-green">location_fill</i>',
                title: 'Адрес доставки изменен',
                subtitle: 'Доставить на адрес:',
                closeTimeout: 2000,
                text: app.data.arUser.addr.active.street,
                closeButton: true,
                swipeToClose: true,
            });
            app.notifAddr.open();
        },
        showDMess: function () {
            if (app.notifDMess) { app.notifDMess.close(); app.notifDMess.destroy(); }
            app.request.getJSON(app.data.baseUrl + 'get_messlist.php', { s: 'd' }, function (data) {
                app.data.messages = data;
                if (app.data.messages.fl) {
                    $$('.js_mfc').html(app.data.messages.count);
                    $$('body').addClass("is_mfo");
                    app.notifDMess = app.notification.create({
                        icon: '<i class="material-icons color-green">message</i>',
                        titleRightText: app.data.messages.date,
                        title: 'Новое сообщение',
                        subtitle: app.data.messages.title,
                        closeTimeout: 4000,
                        text: app.data.messages.mess,
                        closeButton: true,
                        swipeToClose: true,
                    });
                    app.notifDMess.open();
                } else {
                    $$('.js_mfc').html('0');
                    $$('body').removeClass("is_mfo");
                }
            });
        },
        geocode: function (lat, lon) {
            var res = {};
            app.request({
                url: app.data.baseUrl + 'geocode.php',
                method: 'GET',
                dataType: 'json',
                async: false,
                data: {
                    lat: lat,
                    lon: lon,
                },
                success: function (data) {
                    res = data;
                }
            });
            return res;
        },
        showAddr: function () {
            var html = '';
            if (app.sheetA) app.sheetA.destroy();
            if (app.data.arUser.addr.list.length) {
                var l = '';
                for (var i = 0; i < app.data.arUser.addr.list.length; i++) {
                    if (app.data.arUser.addr.list[i].ID == app.data.arUser.addr.active.ID) { l = 'checked'; } else { l = ''; }
                    html += '\
								<li>\
									<a href="/map/'+ app.data.arUser.addr.list[i].ID + '/" class="link sheet-close s_close"></a>\
									<label class="item-radio item-content" onclick="app.methods.setActAddr('+ app.data.arUser.addr.list[i].ID + ')" >\
										<input type="radio" name="addr-radio" value="'+ app.data.arUser.addr.list[i].ID + '" ' + l + '  >\
										<i class="icon icon-radio mr_8"><\/i>\
										<div class="item-inner">\
											<div class="item-title">'+ app.data.arUser.addr.list[i].addr + '<\/div>\
										<\/div>\
									<\/label>\
								<\/li>\
								';
                }
                app.sheetA = app.sheet.create({
                    content: '\
					<div class="sheet-modal demo-sheet-swipe-to-close sh_gad" style="height:auto">\
						<div class="sheet-modal-inner">\
							<div class="swipe-handler"></div>\
							<div class="page-content">\
								<div class="block-title block-title-large">Адреса доставки<\/div>\
									<div class="list">\
									<ul>\
										'+ html +
                        '<\/ul>\
								<\/div>\
								<div class="padding-horizontal padding">\
									<a href="/map/0/" class="actions-close sheet-close popover-close button button-large button-fill">Добавить адрес</a>\
								</div>\
							<\/div>\
						<\/div>\
					<\/div>\
				   ',
                    swipeToClose: true,
                    backdrop: true,
                    on: {
                        open: function (sheet) {
                        },
                        close: function (sheet) {

                        },
                    },
                });
                app.sheetA.open();
            } else {
                app.views.main.router.navigate('/map/0/', { transition: 'f7-cover-v' })
            }
        },
        plus: function (id) {
            var el = $$(".b_mq_" + id);
            var c = parseInt(el.val());
            var s = 1;
            var m = 10;
            if (c + s <= m) {
                app.request.getJSON(app.data.baseUrlAjax + '?act=AddToCard', { product_id: id, qty: c + s }, function (data) {
                    app.methods.refreshCart();
                    el.val(c + s);
                    $$(".js_cbc_" + id).removeClass("c11");
                    $$(".gl_item_" + id).addClass('in_cart');
                    if (c + s == 10) {
                        $$(".js_cbcc_" + id).addClass("c210");
                    }
                    app.methods.animateValue($$('.isum_' + id), parseInt(app.data.cartGoods[id].price * c), parseInt(app.data.cartGoods[id].price * (c + s)), 400);
                });
            } else {
                if (!app.toastBottom) {
                    app.toastMax = app.toast.create({
                        text: 'Максимальное количество в корзине 10 штук',
                        position: 'top',
                        closeTimeout: 1000,
                        closeButton: true,
                    });
                }
                app.methods.refreshCart();
                app.toastMax.open();
            }
        },
        minus: function (id) {
            var el = $$(".b_mq_" + id);
            var c = parseInt(el.val());
            var s = 1;
            if (c - s >= 1) {
                app.request.getJSON(app.data.baseUrlAjax + '?act=AddToCard', { product_id: id, qty: c - s }, function (data) {
                    app.methods.refreshCart();
                    el.val(c - s);
                    if (c - s == 1) {
                        $$(".js_cbc_" + id).addClass("c11");
                    }
                    $$(".js_cbcc_" + id).removeClass("c210");
                    app.methods.animateValue($$('.isum_' + id), parseInt(app.data.cartGoods[id].price * c), parseInt(app.data.cartGoods[id].price * (c - s)), 400);
                });
            } else {
                app.methods.removeCart(app.data.cartGoods[id].ID, id);
            }
        },
        addCart: function (id) {
            if (app.data.currentGoods[id].secID == 77) {
                if (app.sous) { app.sous.close(); app.sous.destroy(); }
                $$(".tgbs").removeClass('show');
                app.sous = app.actions.create({
                    on: {
                        closed: function (actions) {
                            $$(".tgbs").addClass('show');
                        },
                    },
                    buttons: [
                        {
                            text: '<span style="color: #000;font-size: 34px;">Выберите соус</span>',
                            label: true
                        },
                        {
                            text: 'Без соуса',
                            onClick: function () {
                                app.request.getJSON(app.data.baseUrlAjax + '?act=AddToCard&prop=SAUCE&propp=Без соуса', { product_id: id }, function (data) {
                                    if (data.mqh) {
                                        $$(".gl_item_" + id).addClass('in_cart');
                                        $$(".js_cbc_" + id).addClass("c11").removeClass("c10");
                                        $$(".b_mqh_" + id).val(data.mqh);
                                        $$(".b_mq_" + id).val(1);
                                        app.methods.refreshCart();
                                    }
                                });
                            }
                        },
                        {
                            text: 'Cливочный соус',
                            onClick: function () {
                                app.request.getJSON(app.data.baseUrlAjax + '?act=AddToCard&prop=SAUCE&propp=Cливочный', { product_id: id }, function (data) {
                                    if (data.mqh) {
                                        $$(".gl_item_" + id).addClass('in_cart');
                                        $$(".js_cbc_" + id).addClass("c11").removeClass("c10");
                                        $$(".b_mqh_" + id).val(data.mqh);
                                        $$(".b_mq_" + id).val(1);
                                        app.methods.refreshCart();
                                    }
                                });
                            }
                        },
                        {
                            text: 'Кисло-сладкий соус',
                            onClick: function () {
                                app.request.getJSON(app.data.baseUrlAjax + '?act=AddToCard&prop=SAUCE&propp=Кисло-сладкий', { product_id: id }, function (data) {
                                    if (data.mqh) {
                                        $$(".gl_item_" + id).addClass('in_cart');
                                        $$(".js_cbc_" + id).addClass("c11").removeClass("c10");
                                        $$(".b_mqh_" + id).val(data.mqh);
                                        $$(".b_mq_" + id).val(1);
                                        app.methods.refreshCart();
                                    }
                                });
                            }
                        },
                        {
                            text: 'Терияки соус',
                            onClick: function () {
                                app.request.getJSON(app.data.baseUrlAjax + '?act=AddToCard&prop=SAUCE&propp=Терияки', { product_id: id }, function (data) {
                                    if (data.mqh) {
                                        $$(".gl_item_" + id).addClass('in_cart');
                                        $$(".js_cbc_" + id).addClass("c11").removeClass("c10");
                                        $$(".b_mqh_" + id).val(data.mqh);
                                        $$(".b_mq_" + id).val(1);
                                        app.methods.refreshCart();
                                    }
                                });
                            }
                        },
                    ]
                });
                app.sous.open();
            } else {
                app.request.getJSON(app.data.baseUrlAjax + '?act=AddToCard', { product_id: id }, function (data) {
                    if (data.mqh) {
                        $$(".gl_item_" + id).addClass('in_cart');
                        $$(".js_cbc_" + id).addClass("c11").removeClass("c10");
                        $$(".b_mqh_" + id).val(data.mqh);
                        $$(".b_mq_" + id).val(1);
                        app.methods.refreshCart();
                    }
                });
            }
        },
        refreshMess: function () {
            app.request.getJSON(app.data.baseUrl + 'get_mess.php', { foo: 'app' }, function (data) {
                app.data.messages = data.c;
            });
        },
        setFavorit: function (id) {
            app.request.getJSON(app.data.baseUrlAjax + '?act=setFavorite', { product_id: id }, function (data) {
                if (data.res) {
                    $$(".fav_" + id).addClass('active');
                } else {
                    $$(".fav_" + id).removeClass('active');
                }
                app.data.arFav = data.data;
                app.data.favGoods = data.data.ID;
                app.data.fav = data.data.fav;
            });
        },
        removeCart: function (id, pid) {
            app.request.getJSON(app.data.baseUrlAjax + '?act=del', { product_id: id }, function (data) {
                for (i in data.deleted) {
                    var item = data.deleted[i];
                    $$(".b_mqh_" + item.pid).val('');
                    $$(".gl_item_" + item.pid).removeClass('in_cart');
                    $$(".ci_" + item.id).addClass("zoomOut animated").once('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function () {
                        $$(this).remove();
                    });
                }
                app.methods.refreshCart();
            });

        },
        addCartT: function (id, tops) {
            var iid = parseInt(id + '' + tops + '' + '00');
            if (app.data.cartGoods[iid]) {
                app.methods.removeCart(app.data.cartGoods[iid].ID, id);
                $$('.bg_' + id).removeClass('bg-color-gray');
            } else {
                app.request.getJSON(app.data.baseUrlAjax + '?act=AddToCard&prop=TOPPS&propp=' + tops, { product_id: id }, function (data) {
                    if (data.mqh) {
                        $$('.bg_' + id).removeClass('bg-color-white').addClass('bg-color-gray');
                        app.methods.refreshCart();
                    }
                });
            }
        },
        showTops: function (id) {
            if (app.tops) { app.tops.close(); app.tops.destroy(); }
            var obj = app.data.scatsItems[85].goods;
            var gridButtons = [];
            gridButtons.push([
                {
                    text: '<i class="icon material-icons">close</i> Готово',
                },
            ]);
            for (var i = obj.length - 1; i > 9; i = i - 3) {
                var id1 = obj[i];
                var id2 = obj[i - 1];
                var id3 = obj[i - 2];
                if (app.data.cartGoods[parseInt(id1 + '' + id + '' + '00')]) { var bg1 = 'gray'; } else { var bg1 = 'white'; }
                if (app.data.cartGoods[parseInt(id2 + '' + id + '' + '00')]) { var bg2 = 'gray'; } else { var bg2 = 'white'; }
                if (app.data.cartGoods[parseInt(id3 + '' + id + '' + '00')]) { var bg3 = 'gray'; } else { var bg3 = 'white'; }
                gridButtons.push([
                    {
                        text: app.data.currentGoods[id1].goodName,
                        icon: '<img class="' + id1 + '" src="' + app.data.baseUrlSite + app.data.currentGoods[id1].goodPicL + '" style="max-width: 100%"/>' + '<i>' + app.data.currentGoods[id1].goodPrice + ' р.</i>',
                        close: false,
                        id: id1,
                        bg: bg1 + ' bg_' + id1,
                        onClick: function (actions, e) {
                            app.methods.addCartT(this.id, id);
                        }
                    },
                    {
                        text: app.data.currentGoods[id2].goodName,
                        icon: '<img class="' + id2 + '" src="' + app.data.baseUrlSite + app.data.currentGoods[id2].goodPicL + '" style="max-width: 100%"/>' + '<i>' + app.data.currentGoods[id2].goodPrice + ' р.</i>',
                        close: false,
                        id: id2,
                        bg: bg2 + ' bg_' + id2,
                        onClick: function (actions, e) {
                            app.methods.addCartT(this.id, id);
                        }
                    },
                    {
                        text: app.data.currentGoods[id3].goodName,
                        icon: '<img class="' + id3 + '" src="' + app.data.baseUrlSite + app.data.currentGoods[id3].goodPicL + '" style="max-width: 100%"/>' + '<i>' + app.data.currentGoods[id3].goodPrice + ' р.</i>',
                        close: false,
                        id: id3,
                        bg: bg3 + ' bg_' + id3,
                        onClick: function (actions, e) {
                            app.methods.addCartT(this.id, id);
                        }
                    },
                ]);
            }
            $$(".tgbs").removeClass('show');
            app.tops = app.actions.create(
                {
                    grid: true,
                    cssClass: 'topsClass',
                    on: {
                        closed: function (actions) {
                            $$(".tgbs").addClass('show');
                        },
                    },
                    buttons: gridButtons
                });
            app.tops.open();
        },
        showGood: function (id, ind = false) {
            var html = '';
            if (ind) { app.data.currentGoods[id] = app.data.allGoods[ind]; }
            if (app.data.cart) {
                if (app.data.cartGoods[id]) {
                    var fl = 'in_cart';
                    var c_id = app.data.cartGoods[id].ID;
                    var c_q = app.data.cartGoods[id].q;
                } else {
                    var fl = '';
                    var c_id = '';
                    var c_q = '0';
                }
            } else {
                var fl = '';
                var c_id = '';
                var c_q = '0';
            }
            if (app.data.fav) { if (app.data.favGoods[id]) { var f_s = "active"; } else { var f_s = " "; } } else { var f_s = ''; }
            $$(".tgbs").removeClass('show');
            $$(".tgbs").remove();
            if (app.data.currentGoods[id].secID == 77) {
                html = '<div class="js_bc gl__st gl_item_' + id + ' ' + fl + '"><button onclick="app.methods.addCart(' + id + ')" class="gbad button button-large button-raised button-fill b_r8 bg-pink "><div class="bc_t fadeIn animated">Добавить в корзину (' + app.data.currentGoods[id].goodPrice + ' р)</div><div class="bc_l"><div style="width:50px;" class="laoderhorizontal"><div></div><div></div><div></div><div></div></div></div></button><div class="gl_item_st"><div class="input-group input-group-sm"><div class="input-group-prepend"><button class="button b_r8 bg-pink  no-padding color-grey b55" onclick="app.methods.minus(' + id + ')" type="button"><i class="f7-icons">minus</i></button></div><input type="text" class="b_mq_' + id + ' form-control text-align-center width-50" placeholder="" value="' + c_q + '" readonly=""><input type="hidden" class="b_mqh_' + id + '" value="' + c_id + '" readonly=""><div class="input-group-append"><button class="button b_r8 bg-pink  no-padding color-grey b55" onclick="app.methods.plus(' + id + ')" type="button"><i class="f7-icons">plus</i></button></div></div></div><div onclick="app.methods.showTops(' + id + ')" class="tttl hinge ripple bounceInRight animated">Добавть топпинги +</div></div>';
            } else {
                html = '<div class="js_bc gl__st gl_item_' + id + ' ' + fl + '"><button onclick="app.methods.addCart(' + id + ')" class="gbad button button-large button-raised button-fill b_r8 bg-pink "><div class="bc_t fadeIn animated">Добавить в корзину (' + app.data.currentGoods[id].goodPrice + ' р)</div><div class="bc_l"><div style="width:50px;" class="laoderhorizontal"><div></div><div></div><div></div><div></div></div></div></button><div class="gl_item_st"><div class="input-group input-group-sm"><div class="input-group-prepend"><button class="button b_r8 bg-pink  no-padding color-grey b55" onclick="app.methods.minus(' + id + ')" type="button"><i class="f7-icons">minus</i></button></div><input type="text" class="b_mq_' + id + ' form-control text-align-center width-50" placeholder="" value="' + c_q + '" readonly=""><input type="hidden" class="b_mqh_' + id + '" value="' + c_id + '" readonly=""><div class="input-group-append"><button class="button b_r8 bg-pink  no-padding color-grey b55" onclick="app.methods.plus(' + id + ')" type="button"><i class="f7-icons">plus</i></button></div></div></div><div class="tttl ripple fadeIn animated"><span class="cn">В корзине <span class="js_cg">' + app.data.cartCount + '</span> <br>на <span class="js_cp">' + app.data.cartSum + '</span></span></div></div>';
            }
            $$('body').append('<div class="toast toast-bottom toast-horizontal-left tgbs slideInUp animated"><div class="js_bc"><div class="toast-text" id="tgbsb" ></div></div></div>');

            if (app.data.currentGoods[id].isN) {
                app.data.currentG = id;
                if (app.popupG) app.popupG.destroy();
                app.popupG = app.popup.create({
                    content: '\
					<div class="popup demo-popup-swipe-handler sh_g">\
						<div class="page bg-white">\
							<a href="#" class="link popup-close s_close"><\/a>\
							<div class="tigf">\
								<button class="button bf b width-auto elevation-2 fav '+ f_s + ' fav_' + id + '" onclick="app.methods.setFavorit(' + id + ')" >\
									<i class="f7-icons md-18 f2">heart_fill<\/i>\
								<\/button>\
							<\/div>\
							<div class="page-content">\
								<div class="lazyg fadeIn animated inner-white" style="background-image:url('+ app.data.baseUrlSite + app.data.currentGoods[id].goodPicB + ')"><\/div>\
								<div class="titg">\
									<span>'+ app.data.currentGoods[id].goodName + ' <div class="display-inline-block button button-round button-fill color-white text-color-black width-auto tn">' + app.data.currentGoods[id].weight + ' гр</div><\/span>\
								<\/div>\
								<div class="bigf" style="margin-bottom:80px;">\
									<div class="tigfimgs"><\/div>\
									<h3 class="bigfrh">Роллы в наборе<\/h3>\
									<div class="list media-list an"><ul class="bigfrr g_list"><\/ul><\/div>\
									<div>'+ app.data.currentGoods[id].goodDesc + '<\/div>\
								<\/div>\
							<\/div>\
						<\/div>\
					<\/div>\
				   ',
                    swipeToClose: 'to-bottom',
                    backdrop: true,
                    on: {
                        open: function (popup) {
                            $$("#tgbsb").html(html);
                            $$(".tgbs").addClass('show');
                        },
                        close: function (popup) {
                            $$(".tgbs").removeClass('show');
                            $$(".tgbs").remove();
                        },
                        opened: function (popup) {
                            var imgs = ''
                            var nam = [];
                            nam[9] = 'Новинка';
                            nam[10] = 'Хит продаж';
                            nam[11] = 'Острое';
                            nam[12] = 'Веганам';
                            for (var i = 0; i < app.data.currentGoods[id].goodYit.length; i++) {
                                imgs += '<div class="chip animated fadeIn"><div class="chip-media"><img src="static/' + app.data.currentGoods[id].goodYit[i] + '.svg"/></div><div class="chip-label">' + nam[app.data.currentGoods[id].goodYit[i]] + '</div></div>';
                            }
                            $$(".tigfimgs").html(imgs);
                            var h = '';
                            for (var i = 0; i < app.data.currentGoods[id].arRolls.length; i++) {
                                var id_r = app.data.currentGoods[id].arRolls[i];
                                if (app.data.cart) { if (app.data.cartGoods[id_r]) { var fl = 'in_cart'; var c_id = app.data.cartGoods[id_r].ID; var c_q = app.data.cartGoods[id_r].q; var c_pr = app.data.cartGoods[id_r].cartPrice; } else { var fl = ''; var c_id = ''; var c_q = '0'; var c_pr = app.data.currentGoods[id_r].goodPrice + ' р.'; } } else { var fl = ''; var c_id = ''; var c_q = '0'; var c_pr = app.data.currentGoods[id_r].goodPrice + ' р.'; }
                                if (app.data.fav) { if (app.data.favGoods[id_r]) { var flf = 'active'; } else { var flf = ''; } } else { var flf = ''; }
                                var imns = '';
                                for (var j = 0; j < app.data.currentGoods[id_r].goodIng.length; j++) {
                                    imns += app.data.currentGoods[id_r].goodIng[j] + ', ';
                                }
                                h +=
                                    '<li class="gl_item b_r">' +
                                    '<div class="fadeIn hing gl_' + app.data.currentGoods[id_r].goodYit + ' gl_item_' + app.data.currentGoods[id_r].goodID + ' ' + fl + '" >' +
                                    '<a onclick="app.methods.showGood(' + app.data.currentGoods[id_r].goodID + ')" class="item-link item-content" >' +
                                    '<div class="item-media" >' +
                                    '<div class="fav_' + app.data.currentGoods[id_r].goodID + ' favh ' + flf + '" >' +
                                    '<i class="f7-icons md-18 f2">heart_circle_fill</i>' +
                                    '</div>' +
                                    '<img class="b_r ' + app.data.currentGoods[id_r].bg + '" src="https://sooshiroom.com' + app.data.currentGoods[id_r].goodPicL + '"  width="100">' +
                                    '</div>' +
                                    '<div class="item-inner">' +
                                    '<div class="item-title-row">' +
                                    '<div class="item-title" style="height:48px;display: flex;align-items: center;" >' + app.data.currentGoods[id_r].goodName + '</div>' +
                                    '<div class="text-green font-weight-normal p_d_l">' + app.data.currentGoods[id_r].goodPrice + 'р</div>' +
                                    '</div>' +
                                    '<div class="item-subtitle">' + imns + '</div>' +
                                    '<div class="item-text"></div>' +
                                    '</div>' +
                                    '</a>' +
                                    '<div class="gl__st_' + app.data.currentGoods[id_r].goodID + '">' +
                                    '<button onclick="app.methods.addCart(' + app.data.currentGoods[id_r].goodID + ')" class="gl_item_b button button-fill color-pink button-fab button-round"><i class="f7-icons md-18">cart_fill</i></button>' +
                                    '<div class="gl_item_st">' +
                                    '<div style="margin-bottom:1px;text-align:center;font-size:13px;color:#a6a3a3" class="isum isum_' + app.data.currentGoods[id_r].goodID + '" data-id="' + app.data.currentGoods[id_r].goodID + '">' + c_pr + '</div>' +
                                    '<div class="input-group input-group-sm">' +
                                    '<div class="input-group-prepend">' +
                                    '<button class=" c1' + c_q + ' js_cbc_' + app.data.currentGoods[id_r].goodID + 'b_r8 button no-padding color-grey"  onclick="app.methods.minus(' + app.data.currentGoods[id_r].goodID + ')" type="button"><i class="f7-icons">minus</i></button>' +
                                    '</div>' +
                                    '<input type="text" class="b_mq_' + app.data.currentGoods[id_r].goodID + ' form-control text-align-center width-35" value="' + c_q + '" readonly>' +
                                    '<input type="hidden" class="b_mqh_' + app.data.currentGoods[id_r].goodID + '" value="' + c_id + '" readonly>' +
                                    '<div class="input-group-append">' +
                                    '<button class=" c2' + c_q + ' js_cbcc_' + app.data.currentGoods[id_r].goodID + 'b_r8 button no-padding color-grey" onclick="app.methods.plus(' + app.data.currentGoods[id_r].goodID + ')" type="button"><i class="f7-icons">plus</i></button>' +
                                    '</div>' +
                                    '</div>' +
                                    '</div>' +
                                    '</div>' +
                                    '</div>' +
                                    '</li>';
                            }
                            $$(".bigfrr").html(h);
                        },
                    },
                });
                app.popupG.open();
            }
            else {
                if (app.sheetG) app.sheetG.destroy();
                app.sheetG = app.sheet.create({
                    content: '\
					<div class="sheet-modal demo-sheet-swipe-to-close sh_g" style="height:auto;">\
						<div class="sheet-modal-inner bg-white">\
							<a href="#" class="link sheet-close s_close"><\/a>\
							<div class="tigf">\
								<button class="button bf b width-auto elevation-2 fav '+ f_s + ' fav_' + id + '" onclick="app.methods.setFavorit(' + id + ')" >\
									<i class="f7-icons md-18 f2">heart_fill<\/i>\
								<\/button>\
							<\/div>\
							 <div class="page-content">\
								<div class="lazyg fadeIn animated inner-white" style="background-image:url('+ app.data.baseUrlSite + app.data.currentGoods[id].goodPicB + ')"><\/div>\
								<div class="titg">\
									<span>'+ app.data.currentGoods[id].goodName + ' <div class="display-inline-block button button-round button-fill color-white text-color-black width-auto tn">' + app.data.currentGoods[id].weight + ' гр</div><\/span>\
								<\/div>\
								<div class="bigf" style="margin-bottom:80px;">\
									<div class="tigfimgsh"><\/div>\
									<div class="bigfrrh"><\/div>\
									<div>'+ app.data.currentGoods[id].goodDesc + '<\/div>\
								<\/div>\
							<\/div>\
						<\/div>\
					<\/div>\
				   ',
                    swipeToClose: true,
                    backdrop: true,
                    on: {
                        open: function (sheet) {
                            $$("#tgbsb").html(html);
                            $$(".tgbs").addClass('show');
                            var imgs = ''
                            var nam = [];
                            nam[9] = 'Новинка';
                            nam[10] = 'Хит продаж';
                            nam[11] = 'Острое';
                            nam[12] = 'Веганам';

                            for (var i = 0; i < app.data.currentGoods[id].goodYit.length; i++) {
                                imgs += '<div class="chip animated fadeIn"><div class="chip-media"><img src="static/' + app.data.currentGoods[id].goodYit[i] + '.svg"/></div><div class="chip-label">' + nam[app.data.currentGoods[id].goodYit[i]] + '</div></div>';
                            }
                            $$(".tigfimgsh").html(imgs);
                            if (app.data.currentGoods[id].goodIng.length) {
                                var h = '';
                                for (var i = 0; i < app.data.currentGoods[id].goodIng.length; i++) {
                                    h += '<div class="chip chip-outline"><div class="chip-label">' + app.data.currentGoods[id].goodIng[i] + '</div></div>';

                                }
                                $$(".bigfrrh").html(h);
                            }
                        },
                        close: function (sheet) {
                            if (app.popupG && app.popupG.opened) {
                                $$(".tgbs").removeClass('show');
                            } else {
                                $$(".tgbs").removeClass('show');
                                $$(".tgbs").remove();
                            }
                        },
                        opened: function (popup) {

                        },
                        closed: function (sheet) {
                            if (app.popupG && app.popupG.opened) {
                                if (app.data.cart) {
                                    if (app.data.cartGoods[app.data.currentG]) {
                                        var fl = 'in_cart';
                                        var c_id = app.data.cartGoods[app.data.currentG].ID;
                                        var c_q = app.data.cartGoods[app.data.currentG].q;
                                    } else {
                                        var fl = '';
                                        var c_id = '';
                                        var c_q = '0';
                                    }
                                } else {
                                    var fl = '';
                                    var c_id = '';
                                    var c_q = '0';
                                }
                                html = '<div class="js_bc gl__st gl_item_' + app.data.currentG + ' ' + fl + '"><button onclick="app.methods.addCart(' + app.data.currentG + ')" class="gbad button button-large button-raised button-fill b_r8 bg-pink "><div class="bc_t fadeIn animated">Добавить в корзину (' + app.data.currentGoods[id].goodPrice + ' р)</div><div class="bc_l"><div style="width:50px;" class="laoderhorizontal"><div></div><div></div><div></div><div></div></div></div></button><div class="gl_item_st"><div class="input-group input-group-sm"><div class="input-group-prepend"><button class="button b_r8 bg-pink  no-padding color-grey b55" onclick="app.methods.minus(' + app.data.currentG + ')" type="button"><i class="f7-icons">minus</i></button></div><input type="text" class="b_mq_' + app.data.currentG + ' form-control text-align-center width-50" placeholder="" value="' + c_q + '" readonly=""><input type="hidden" class="b_mqh_' + app.data.currentG + '" value="' + c_id + '" readonly=""><div class="input-group-append"><button class="button b_r8 bg-pink  no-padding color-grey b55" onclick="app.methods.plus(' + app.data.currentG + ')" type="button"><i class="f7-icons">plus</i></button></div></div></div><div class="tttl ripple fadeIn animated"><span class="cn">В корзине <span class="js_cg">' + app.data.cartCount + '</span> <br>на <span class="js_cp">' + app.data.cartSum + '</span></span></div></div>';
                                $$("#tgbsb").html(html);
                                $$(".tgbs").addClass('show');
                            }
                        },
                    },
                });
                app.sheetG.open();
            }
        },
        animateValue: function (id, start, end, duration) {
            if (start == end) {
                return false;
            }
            let startTimestamp = null;
            const step = (timestamp) => {
                if (!startTimestamp) startTimestamp = timestamp;
                const progress = Math.min((timestamp - startTimestamp) / duration, 1);
                id.html(app.methods.priceSet(Math.floor(progress * (end - start) + start), ' р.'));
                if (progress < 1) {
                    window.requestAnimationFrame(step);
                }
            };
            window.requestAnimationFrame(step);
        },
        priceSet: function (data, cur) {
            var price = Number.prototype.toFixed.call(parseFloat(data) || 0, 0),
                price_sep = price.replace(/(\D)/g, ","),
                price_sep = price_sep.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1 ");
            return price_sep + cur;
        },
        refreshCart: function () {
            $$(".js_bc").addClass("loading");
            var ol_sum = app.data.cartSumInt;
            app.request.getJSON(app.data.baseUrl + 'get_cart.php', { foo: 'app' }, function (data) {
                if (data.goods) { app.data.cartGoods = data.goods; }
                app.data.cartCount = data.count;
                app.data.cartSum = data.allSumF;
                app.data.cartSumN = data.allSum;
                app.data.cartSumInt = data.allSum;
                app.data.cart = data.cart;
                $$(".js_cg").html(data.count);
                $$(".js_cp").html(data.allSumF);
                if (data.count) {
                    $$(".js_cg").html(data.count);
                } else {
                    $$(".js_cg").html('0');
                }
                $$(".js_cp").html(data.allSumF);
                if (data.cart) {
                    app.methods.animateValue($$(".js_cp"), ol_sum, app.data.cartSumInt, 400);
                    setTimeout(() => { $$(".js_bc").removeClass("loading hide"); }, 400);
                    app.toolbar.show('.toolbar.js_bc');
                } else {
                    app.toolbar.hide(".toolbar.js_bc");
                    setTimeout(() => { $$(".js_bc").removeClass("loading"); }, 400);
                }
                app.methods.refreshGiftsInfo();
            });
        },
        refreshGifts: function () {
            app.request.getJSON(app.data.baseUrl + 'get_gifts.php', { act: 'cart' }, function (data) {
                app.data.arGifts = data;
                if (app.data.isSeeGift != data.giftID && data.giftFl) {
                    app.data.isSeeGift = data.giftID;
                    if (app.sheetGift) app.sheetGift.destroy();
                    app.sheetGift = app.sheet.create({
                        content: '\
						<div class="sheet-modal demo-sheet-swipe-to-close" style="height:auto">\
							<div class="sheet-modal-inner">\
								<div class="swipe-handler"></div>\
								<div class="page-content">\
									<img style="width:100%;padding-top:16px;"  src="https://sooshiroom.com'+ app.data.arGifts.giftIMG + '">\
								<\/div>\
							<\/div>\
						<\/div>\
					   ',
                        swipeToClose: true,
                        backdrop: true,
                    });
                    app.sheetGift.open();
                } else {
                    app.data.isSeeGift = 1;
                }
                app.methods.refreshGiftsInfo();
            });
        },
        refreshGiftsInfo: function () {
            var fl = false;
            for (var i = 0; i < app.data.arGifts.gifts.length; i++) {
                if (parseInt(app.data.cartSumInt) >= parseInt(app.data.arGifts.gifts[i].price)) {
                    $$('.gcf_' + app.data.arGifts.gifts[i].ID).addClass('active');
                    fl = true;
                    if (app.data.cartGoods[app.data.arGifts.gifts[i].ID]) {
                        $$('.gcf_' + app.data.arGifts.gifts[i].ID).addClass('selected');
                    }
                } else {
                    if (app.data.cartGoods[app.data.arGifts.gifts[i].ID]) {
                        app.request.getJSON(app.data.baseUrlAjax + '?act=del', { product_id: app.data.cartGoods[app.data.arGifts.gifts[i].ID].ID }, function (data) {
                            $$('.gcf_' + app.data.arGifts.gifts[i].ID).removeClass('selected active');
                        });
                    }
                    $$('.gcf_' + app.data.arGifts.gifts[i].ID).removeClass('selected active');
                }
            }
            if (fl) {
                $$('.js_gtt').html('Выберите подарок');
            } else {
                $$('.js_gtt').html('Подарки доступны от ' + app.data.arGifts.gifts[0].priceF);
            }
        },
        MD5: function (d) {
            var self = this;
            d = unescape(encodeURIComponent(d));
            var result = M(V(Y(X(d), 8 * d.length)));

            return result.toLowerCase();

            function M(d) {
                for (var _, m = "0123456789ABCDEF", f = "", r = 0; r < d.length; r++) _ = d.charCodeAt(r), f += m.charAt(_ >>> 4 & 15) + m.charAt(15 & _);
                return f
            }

            function X(d) {
                for (var _ = Array(d.length >> 2), m = 0; m < _.length; m++) _[m] = 0;
                for (m = 0; m < 8 * d.length; m += 8) _[m >> 5] |= (255 & d.charCodeAt(m / 8)) << m % 32;
                return _
            }

            function V(d) {
                for (var _ = "", m = 0; m < 32 * d.length; m += 8) _ += String.fromCharCode(d[m >> 5] >>> m % 32 & 255);
                return _
            }

            function Y(d, _) {
                d[_ >> 5] |= 128 << _ % 32, d[14 + (_ + 64 >>> 9 << 4)] = _;
                for (var m = 1732584193, f = -271733879, r = -1732584194, i = 271733878, n = 0; n < d.length; n += 16) {
                    var h = m,
                        t = f,
                        g = r,
                        e = i;
                    f = md5_ii(f = md5_ii(f = md5_ii(f = md5_ii(f = md5_hh(f = md5_hh(f = md5_hh(f = md5_hh(f = md5_gg(f = md5_gg(f = md5_gg(f = md5_gg(f = md5_ff(f = md5_ff(f = md5_ff(f = md5_ff(f, r = md5_ff(r, i = md5_ff(i, m = md5_ff(m, f, r, i, d[n + 0], 7, -680876936), f, r, d[n + 1], 12, -389564586), m, f, d[n + 2], 17, 606105819), i, m, d[n + 3], 22, -1044525330), r = md5_ff(r, i = md5_ff(i, m = md5_ff(m, f, r, i, d[n + 4], 7, -176418897), f, r, d[n + 5], 12, 1200080426), m, f, d[n + 6], 17, -1473231341), i, m, d[n + 7], 22, -45705983), r = md5_ff(r, i = md5_ff(i, m = md5_ff(m, f, r, i, d[n + 8], 7, 1770035416), f, r, d[n + 9], 12, -1958414417), m, f, d[n + 10], 17, -42063), i, m, d[n + 11], 22, -1990404162), r = md5_ff(r, i = md5_ff(i, m = md5_ff(m, f, r, i, d[n + 12], 7, 1804603682), f, r, d[n + 13], 12, -40341101), m, f, d[n + 14], 17, -1502002290), i, m, d[n + 15], 22, 1236535329), r = md5_gg(r, i = md5_gg(i, m = md5_gg(m, f, r, i, d[n + 1], 5, -165796510), f, r, d[n + 6], 9, -1069501632), m, f, d[n + 11], 14, 643717713), i, m, d[n + 0], 20, -373897302), r = md5_gg(r, i = md5_gg(i, m = md5_gg(m, f, r, i, d[n + 5], 5, -701558691), f, r, d[n + 10], 9, 38016083), m, f, d[n + 15], 14, -660478335), i, m, d[n + 4], 20, -405537848), r = md5_gg(r, i = md5_gg(i, m = md5_gg(m, f, r, i, d[n + 9], 5, 568446438), f, r, d[n + 14], 9, -1019803690), m, f, d[n + 3], 14, -187363961), i, m, d[n + 8], 20, 1163531501), r = md5_gg(r, i = md5_gg(i, m = md5_gg(m, f, r, i, d[n + 13], 5, -1444681467), f, r, d[n + 2], 9, -51403784), m, f, d[n + 7], 14, 1735328473), i, m, d[n + 12], 20, -1926607734), r = md5_hh(r, i = md5_hh(i, m = md5_hh(m, f, r, i, d[n + 5], 4, -378558), f, r, d[n + 8], 11, -2022574463), m, f, d[n + 11], 16, 1839030562), i, m, d[n + 14], 23, -35309556), r = md5_hh(r, i = md5_hh(i, m = md5_hh(m, f, r, i, d[n + 1], 4, -1530992060), f, r, d[n + 4], 11, 1272893353), m, f, d[n + 7], 16, -155497632), i, m, d[n + 10], 23, -1094730640), r = md5_hh(r, i = md5_hh(i, m = md5_hh(m, f, r, i, d[n + 13], 4, 681279174), f, r, d[n + 0], 11, -358537222), m, f, d[n + 3], 16, -722521979), i, m, d[n + 6], 23, 76029189), r = md5_hh(r, i = md5_hh(i, m = md5_hh(m, f, r, i, d[n + 9], 4, -640364487), f, r, d[n + 12], 11, -421815835), m, f, d[n + 15], 16, 530742520), i, m, d[n + 2], 23, -995338651), r = md5_ii(r, i = md5_ii(i, m = md5_ii(m, f, r, i, d[n + 0], 6, -198630844), f, r, d[n + 7], 10, 1126891415), m, f, d[n + 14], 15, -1416354905), i, m, d[n + 5], 21, -57434055), r = md5_ii(r, i = md5_ii(i, m = md5_ii(m, f, r, i, d[n + 12], 6, 1700485571), f, r, d[n + 3], 10, -1894986606), m, f, d[n + 10], 15, -1051523), i, m, d[n + 1], 21, -2054922799), r = md5_ii(r, i = md5_ii(i, m = md5_ii(m, f, r, i, d[n + 8], 6, 1873313359), f, r, d[n + 15], 10, -30611744), m, f, d[n + 6], 15, -1560198380), i, m, d[n + 13], 21, 1309151649), r = md5_ii(r, i = md5_ii(i, m = md5_ii(m, f, r, i, d[n + 4], 6, -145523070), f, r, d[n + 11], 10, -1120210379), m, f, d[n + 2], 15, 718787259), i, m, d[n + 9], 21, -343485551), m = safe_add(m, h), f = safe_add(f, t), r = safe_add(r, g), i = safe_add(i, e)
                }
                return Array(m, f, r, i)
            }

            function md5_cmn(d, _, m, f, r, i) {
                return safe_add(bit_rol(safe_add(safe_add(_, d), safe_add(f, i)), r), m)
            }

            function md5_ff(d, _, m, f, r, i, n) {
                return md5_cmn(_ & m | ~_ & f, d, _, r, i, n)
            }

            function md5_gg(d, _, m, f, r, i, n) {
                return md5_cmn(_ & f | m & ~f, d, _, r, i, n)
            }

            function md5_hh(d, _, m, f, r, i, n) {
                return md5_cmn(_ ^ m ^ f, d, _, r, i, n)
            }

            function md5_ii(d, _, m, f, r, i, n) {
                return md5_cmn(m ^ (_ | ~f), d, _, r, i, n)
            }

            function safe_add(d, _) {
                var m = (65535 & d) + (65535 & _);
                return (d >> 16) + (_ >> 16) + (m >> 16) << 16 | 65535 & m
            }

            function bit_rol(d, _) {
                return d << _ | d >>> 32 - _
            }
        }
    },
    routes: routes,
    popup: {
        closeOnEscape: true,
    },
    sheet: {
        closeOnEscape: true,
    },
    popover: {
        closeOnEscape: true,
    },
    navbar: {
        scrollTopOnTitleClick: false,
    },
    actions: {
        closeOnEscape: true,
    },
    input: {
        scrollIntoViewOnFocus: true,
        scrollIntoViewCentered: true,
    },
    dialog: {
        buttonCancel: 'Отмена',
    },

});
