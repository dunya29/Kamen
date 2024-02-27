var preBasket = [];
var offerPrice = 0;

(function (window) {
    'use strict';

    if (window.JCCatalogElement)
        return;

    var BasketButton = function (params) {
        BasketButton.superclass.constructor.apply(this, arguments);
        this.buttonNode = BX.create('SPAN', {
            props: {className: 'btn btn-default btn-buy btn-sm', id: this.id},
            style: typeof params.style === 'object' ? params.style : {},
            text: params.text,
            events: this.contextEvents
        });

        if (BX.browser.IsIE()) {
            this.buttonNode.setAttribute('hideFocus', 'hidefocus');
        }
    };
    BX.extend(BasketButton, BX.PopupWindowButton);

    window.JCCatalogElement = function (arParams) {
        this.productType = 0;

        this.config = {
            useCatalog: true,
            showQuantity: true,
            showPrice: true,
            showAbsent: true,
            showOldPrice: false,
            showPercent: false,
            showSkuProps: false,
            showOfferGroup: false,
            useCompare: false,
            useStickers: false,
            useSubscribe: false,
            usePopup: false,
            useMagnifier: false,
            usePriceRanges: false,
            basketAction: ['BUY'],
            showClosePopup: false,
            templateTheme: '',
            showSlider: false,
            sliderInterval: 5000,
            useEnhancedEcommerce: false,
            dataLayerName: 'dataLayer',
            brandProperty: false,
            alt: '',
            title: '',
            magnifierZoomPercent: 200
        };

        this.checkQuantity = false;
        this.maxQuantity = 0;
        this.minQuantity = 0;
        this.stepQuantity = 1;
        this.isDblQuantity = false;
        this.canBuy = true;
        this.isGift = false;
        this.canSubscription = true;
        this.currentIsSet = false;
        this.updateViewedCount = false;

        this.currentPriceMode = '';
        this.currentPrices = [];
        this.currentPriceSelected = 0;
        this.currentQuantityRanges = [];
        this.currentQuantityRangeSelected = 0;

        this.precision = 6;
        this.precisionFactor = Math.pow(10, this.precision);

        this.visual = {};
        this.basketMode = '';
        this.product = {
            checkQuantity: false,
            maxQuantity: 0,
            stepQuantity: 1,
            startQuantity: 1,
            isDblQuantity: false,
            canBuy: true,
            canSubscription: true,
            name: '',
            pict: {},
            id: 0,
            addUrl: '',
            buyUrl: '',
            slider: {},
            sliderCount: 0,
            useSlider: false,
            sliderPict: []
        };
        this.mess = {};

        this.basketData = {
            useProps: false,
            emptyProps: false,
            quantity: 'quantity',
            props: 'prop',
            basketUrl: '',
            sku_props: '',
            sku_props_var: 'basket_props',
            add_url: '',
            buy_url: ''
        };
        this.compareData = {
            compareUrl: '',
            compareDeleteUrl: '',
            comparePath: ''
        };

        this.defaultPict = {
            preview: null,
            detail: null
        };

        this.offers = [];
        this.offerNum = 0;
        this.treeProps = [];
        this.selectedValues = {};

        this.mouseTimer = null;
        this.isTouchDevice = BX.hasClass(document.documentElement, 'bx-touch');
        this.touch = null;
        this.slider = {
            interval: null,
            progress: null,
            paused: null,
            controls: []
        };

        this.obProduct = null;
        this.obQuantity = null;
        this.obQuantityUp = null;
        this.obQuantityDown = null;
        this.obPrice = {
            price: null,
            full: null,
            discount: null,
            percent: null,
            total: null
        };
        this.obTree = null;
        this.obPriceRanges = null;
        this.obBuyBtn = null;
        this.obAddToBasketBtn = null;
        this.obBasketActions = null;
        this.obNotAvail = null;
        this.obSubscribe = null;
        this.obSkuProps = null;
        this.obMainSkuProps = null;
        this.obBigSlider = null;
        this.obMeasure = null;
        this.obQuantityLimit = {
            all: null,
            value: null
        };
        this.obCompare = null;
        this.obTabsPanel = null;

        this.node = {};
        // top panel small card
        this.smallCardNodes = {};

        this.magnify = {
            enabled: false,
            obBigImg: null,
            obBigSlider: null,
            height: 0,
            width: 0,
            timer: 0
        };
        this.currentImg = {
            id: 0,
            src: '',
            width: 0,
            height: 0
        };
        this.viewedCounter = {
            path: '/bitrix/components/bitrix/catalog.element/ajax.php',
            params: {
                AJAX: 'Y',
                SITE_ID: '',
                PRODUCT_ID: 0,
                PARENT_ID: 0
            }
        };

        this.obPopupWin = null;
        this.basketUrl = '';
        this.basketParams = {};

        this.errorCode = 0;

        if (typeof arParams === 'object') {
            this.params = arParams;
            this.initConfig();

            if (this.params.MESS) {
                this.mess = this.params.MESS;
            }

            switch (this.productType) {
                case 0: // no catalog
                case 1: // product
                case 2: // set
                    this.initProductData();
                    break;
                case 3: // sku
                    this.initOffersData();
                    break;
                default:
                    this.errorCode = -1;
            }

            this.initBasketData();
            this.initCompareData();
        }

        if (this.errorCode === 0) {
            BX.ready(BX.delegate(this.init, this));
        }

        this.params = {};

        BX.addCustomEvent('onSaleProductIsGift', BX.delegate(this.onSaleProductIsGift, this));
        BX.addCustomEvent('onSaleProductIsNotGift', BX.delegate(this.onSaleProductIsNotGift, this));
    };

    window.JCCatalogElement.prototype = {
        getEntity: function (parent, entity, additionalFilter) {
            if (!parent || !entity)
                return null;

            additionalFilter = additionalFilter || '';

            return parent.querySelector(additionalFilter + '[data-entity="' + entity + '"]');
        },

        getEntities: function (parent, entity, additionalFilter) {
            if (!parent || !entity)
                return {length: 0};

            additionalFilter = additionalFilter || '';

            return parent.querySelectorAll(additionalFilter + '[data-entity="' + entity + '"]');
        },

        onSaleProductIsGift: function (productId, offerId) {
            if (offerId && this.offers && this.offers[this.offerNum].ID == offerId) {
                this.setGift();
            }
        },

        onSaleProductIsNotGift: function (productId, offerId) {
            if (offerId && this.offers && this.offers[this.offerNum].ID == offerId) {
                this.restoreSticker();
                this.isGift = false;
                this.setPrice();
            }
        },

        reloadGiftInfo: function () {
            if (this.productType === 3) {
                this.checkQuantity = true;
                this.maxQuantity = 1;

                this.setPrice();
                this.redrawSticker({text: BX.message('PRODUCT_GIFT_LABEL')});
            }
        },

        setGift: function () {
            if (this.productType === 3) {
                // sku
                this.isGift = true;
            }

            if (this.productType === 1 || this.productType === 2) {
                // simple
                this.isGift = true;
            }

            if (this.productType === 0) {
                this.isGift = false;
            }

            this.reloadGiftInfo();
        },

        setOffer: function (offerNum) {
            this.offerNum = parseInt(offerNum);
            this.setCurrent();
        },

        init: function () {
            var i = 0,
                j = 0,
                treeItems = null;

            this.obProduct = BX(this.visual.ID);
            if (!this.obProduct) {
                this.errorCode = -1;
            }

            this.obBigSlider = BX(this.visual.BIG_SLIDER_ID);
            this.node.imageContainer = this.getEntity(this.obProduct, 'images-container');
            this.node.imageSliderBlock = this.getEntity(this.obProduct, 'images-slider-block');
            this.node.sliderProgressBar = this.getEntity(this.obProduct, 'slider-progress-bar');
            this.node.sliderControlLeft = this.getEntity(this.obBigSlider, 'slider-control-left');
            this.node.sliderControlRight = this.getEntity(this.obBigSlider, 'slider-control-right');

            if (!this.obBigSlider || !this.node.imageContainer || !this.node.imageContainer) {
                this.errorCode = -2;
            }

            if (this.config.showPrice) {
                this.obPrice.price = BX(this.visual.PRICE_ID);
                if (!this.obPrice.price && this.config.useCatalog) {
                    this.errorCode = -16;
                }
                else {
                    this.obPrice.total = BX(this.visual.PRICE_TOTAL);

                    if (this.config.showOldPrice) {
                        this.obPrice.full = BX(this.visual.OLD_PRICE_ID);
                        this.obPrice.discount = BX(this.visual.DISCOUNT_PRICE_ID);

                        if (!this.obPrice.full || !this.obPrice.discount) {
                            this.config.showOldPrice = false;
                        }
                    }

                    if (this.config.showPercent) {
                        this.obPrice.percent = BX(this.visual.DISCOUNT_PERCENT_ID);
                        if (!this.obPrice.percent) {
                            this.config.showPercent = false;
                        }
                    }
                }

                this.obBasketActions = BX(this.visual.BASKET_ACTIONS_ID);
                if (this.obBasketActions) {
                    if (BX.util.in_array('BUY', this.config.basketAction)) {
                        this.obBuyBtn = BX(this.visual.BUY_LINK);
                    }

                    if (BX.util.in_array('ADD', this.config.basketAction)) {
                        this.obAddToBasketBtn = BX(this.visual.ADD_BASKET_LINK);
                    }
                }
                this.obNotAvail = BX(this.visual.NOT_AVAILABLE_MESS);
            }

            if (this.config.showQuantity) {
                this.obQuantity = BX(this.visual.QUANTITY_ID);
                this.node.quantity = this.getEntity(this.obProduct, 'quantity-block');
                if (this.visual.QUANTITY_UP_ID) {
                    this.obQuantityUp = BX(this.visual.QUANTITY_UP_ID);
                }

                if (this.visual.QUANTITY_DOWN_ID) {
                    this.obQuantityDown = BX(this.visual.QUANTITY_DOWN_ID);
                }
            }

            if (this.productType === 3) {
                if (this.visual.TREE_ID) {
                    this.obTree = BX(this.visual.TREE_ID);
                    if (!this.obTree) {
                        this.errorCode = -256;
                    }
                }

                if (this.visual.QUANTITY_MEASURE) {
                    this.obMeasure = BX(this.visual.QUANTITY_MEASURE);
                }

                if (this.visual.QUANTITY_LIMIT && this.config.showMaxQuantity !== 'N') {
                    this.obQuantityLimit.all = BX(this.visual.QUANTITY_LIMIT);
                    if (this.obQuantityLimit.all) {
                        this.obQuantityLimit.value = this.getEntity(this.obQuantityLimit.all, 'quantity-limit-value');
                        if (!this.obQuantityLimit.value) {
                            this.obQuantityLimit.all = null;
                        }
                    }
                }

                if (this.config.usePriceRanges) {
                    this.obPriceRanges = this.getEntity(this.obProduct, 'price-ranges-block');
                }
            }

            if (this.config.showSkuProps) {
                this.obSkuProps = BX(this.visual.DISPLAY_PROP_DIV);
                this.obMainSkuProps = BX(this.visual.DISPLAY_MAIN_PROP_DIV);
            }

            if (this.config.useCompare) {
                this.obCompare = BX(this.visual.COMPARE_LINK);
            }

            if (this.config.useSubscribe) {
                this.obSubscribe = BX(this.visual.SUBSCRIBE_LINK);
            }

            this.obTabs = BX(this.visual.TABS_ID);
            this.obTabContainers = BX(this.visual.TAB_CONTAINERS_ID);
            this.obTabsPanel = BX(this.visual.TABS_PANEL_ID);

            this.smallCardNodes.panel = BX(this.visual.SMALL_CARD_PANEL_ID);
            if (this.smallCardNodes.panel) {
                this.smallCardNodes.picture = this.getEntity(this.smallCardNodes.panel, 'panel-picture');
                this.smallCardNodes.title = this.getEntity(this.smallCardNodes.panel, 'panel-title');
                this.smallCardNodes.price = this.getEntity(this.smallCardNodes.panel, 'panel-price');
                this.smallCardNodes.sku = this.getEntity(this.smallCardNodes.panel, 'panel-sku-container');
                this.smallCardNodes.oldPrice = this.getEntity(this.smallCardNodes.panel, 'panel-old-price');
                this.smallCardNodes.buyButton = this.getEntity(this.smallCardNodes.panel, 'panel-buy-button');
                this.smallCardNodes.addButton = this.getEntity(this.smallCardNodes.panel, 'panel-add-button');
                this.smallCardNodes.notAvailableButton = this.getEntity(this.smallCardNodes.panel, 'panel-not-available-button');
                this.smallCardNodes.aligner = this.getEntity(this.obProduct, 'main-button-container');
            }

            this.initPopup();
            this.initTabs();

            if (this.smallCardNodes.panel) {
                this.smallCardNodes.picture && BX.bind(this.smallCardNodes.picture.parentNode, 'click', BX.proxy(this.scrollToProduct, this));
                this.smallCardNodes.title && BX.bind(this.smallCardNodes.title, 'click', BX.proxy(this.scrollToProduct, this));
                this.smallCardNodes.sku && BX.bind(this.smallCardNodes.sku, 'click', BX.proxy(this.scrollToProduct, this));
            }

            if (this.obTabsPanel || this.smallCardNodes.panel) {
                this.checkTopPanels();
                BX.bind(window, 'scroll', BX.proxy(this.checkTopPanels, this));
            }

            if (this.errorCode === 0) {
                // product slider events
                if (this.config.showSlider && !this.isTouchDevice) {
                    BX.bind(this.obBigSlider, 'mouseenter', BX.proxy(this.stopSlider, this));
                    BX.bind(this.obBigSlider, 'mouseleave', BX.proxy(this.cycleSlider, this));
                }

                if (this.isTouchDevice) {
                    BX.bind(this.node.imageContainer, 'touchstart', BX.proxy(this.touchStartEvent, this));
                    BX.bind(this.node.imageContainer, 'touchend', BX.proxy(this.touchEndEvent, this));
                    BX.bind(this.node.imageContainer, 'touchcancel', BX.proxy(this.touchEndEvent, this));
                }

                BX.bind(this.node.sliderControlLeft, 'click', BX.proxy(this.slidePrev, this));
                BX.bind(this.node.sliderControlRight, 'click', BX.proxy(this.slideNext, this));

                if (this.config.showQuantity) {
                    if (this.obQuantityUp) {
                        BX.bind(this.obQuantityUp, 'click', BX.delegate(this.quantityUp, this));
                    }

                    if (this.obQuantityDown) {
                        BX.bind(this.obQuantityDown, 'click', BX.delegate(this.quantityDown, this));
                    }

                    if (this.obQuantity) {
                        BX.bind(this.obQuantity, 'change', BX.delegate(this.quantityChange, this));
                    }
                }

                switch (this.productType) {
                    case 0: // no catalog
                    case 1: // product
                    case 2: // set
                        if (this.product.useSlider) {
                            this.product.slider = {
                                ID: this.visual.SLIDER_CONT_ID,
                                CONT: BX(this.visual.SLIDER_CONT_ID),
                                COUNT: this.product.sliderCount
                            };
                            this.product.slider.ITEMS = this.getEntities(this.product.slider.CONT, 'slider-control');
                            for (j = 0; j < this.product.slider.ITEMS.length; j++) {
                                BX.bind(this.product.slider.ITEMS[j], 'mouseenter', BX.delegate(this.onSliderControlHover, this));
                                BX.bind(this.product.slider.ITEMS[j], 'mouseleave', BX.delegate(this.onSliderControlLeave, this));
                                BX.bind(this.product.slider.ITEMS[j], 'click', BX.delegate(this.selectSliderImg, this));
                            }

                            this.setCurrentImg(this.product.sliderPict[0], true, true);
                            this.checkSliderControls(this.product.sliderCount);

                            if (this.product.slider.ITEMS.length > 1) {
                            }
                        }

                        this.checkQuantityControls();
                        this.fixFontCheck();
                        this.setAnalyticsDataLayer('showDetail');
                        break;
                    case 3: // sku
                        treeItems = this.obTree.querySelectorAll('li');
                        for (i = 0; i < treeItems.length; i++) {
                            BX.bind(treeItems[i], 'click', BX.delegate(this.selectOfferProp, this));
                        }

                        for (i = 0; i < this.offers.length; i++) {
                            this.offers[i].SLIDER_COUNT = parseInt(this.offers[i].SLIDER_COUNT, 10) || 0;

                            if (this.offers[i].SLIDER_COUNT === 0) {
                                this.slider.controls[i] = {
                                    ID: '',
                                    COUNT: this.offers[i].SLIDER_COUNT,
                                    ITEMS: []
                                };
                            }
                            else {
                                for (j = 0; j < this.offers[i].SLIDER.length; j++) {
                                    this.offers[i].SLIDER[j].WIDTH = parseInt(this.offers[i].SLIDER[j].WIDTH, 10);
                                    this.offers[i].SLIDER[j].HEIGHT = parseInt(this.offers[i].SLIDER[j].HEIGHT, 10);
                                }

                                this.slider.controls[i] = {
                                    ID: this.visual.SLIDER_CONT_OF_ID + this.offers[i].ID,
                                    OFFER_ID: this.offers[i].ID,
                                    CONT: BX(this.visual.SLIDER_CONT_OF_ID + this.offers[i].ID),
                                    COUNT: this.offers[i].SLIDER_COUNT
                                };

                                this.slider.controls[i].ITEMS = this.getEntities(this.slider.controls[i].CONT, 'slider-control');
                                for (j = 0; j < this.slider.controls[i].ITEMS.length; j++) {
                                    BX.bind(this.slider.controls[i].ITEMS[j], 'mouseenter', BX.delegate(this.onSliderControlHover, this));
                                    BX.bind(this.slider.controls[i].ITEMS[j], 'mouseleave', BX.delegate(this.onSliderControlLeave, this));
                                    BX.bind(this.slider.controls[i].ITEMS[j], 'click', BX.delegate(this.selectSliderImg, this));
                                }
                            }
                        }

                        this.setCurrent();
                        break;
                }

                this.obBuyBtn && BX.bind(this.obBuyBtn, 'click', BX.proxy(this.buyBasket, this));
                this.smallCardNodes.buyButton && BX.bind(this.smallCardNodes.buyButton, 'click', BX.proxy(this.buyBasket, this));

                this.obAddToBasketBtn && BX.bind(this.obAddToBasketBtn, 'click', BX.proxy(this.add2Basket, this));
                this.smallCardNodes.addButton && BX.bind(this.smallCardNodes.addButton, 'click', BX.proxy(this.add2Basket, this));

                if (this.obCompare) {
                    BX.bind(this.obCompare, 'click', BX.proxy(this.compare, this));
                    BX.addCustomEvent('onCatalogDeleteCompare', BX.proxy(this.checkDeletedCompare, this));
                }
            }
        },

        initConfig: function () {
            if (this.params.PRODUCT_TYPE) {
                this.productType = parseInt(this.params.PRODUCT_TYPE, 10);
            }

            if (this.params.CONFIG.USE_CATALOG !== 'undefined' && BX.type.isBoolean(this.params.CONFIG.USE_CATALOG)) {
                this.config.useCatalog = this.params.CONFIG.USE_CATALOG;
            }

            this.config.showQuantity = this.params.CONFIG.SHOW_QUANTITY;
            this.config.showPrice = this.params.CONFIG.SHOW_PRICE;
            this.config.showPercent = this.params.CONFIG.SHOW_DISCOUNT_PERCENT;
            this.config.showOldPrice = this.params.CONFIG.SHOW_OLD_PRICE;
            this.config.showSkuProps = this.params.CONFIG.SHOW_SKU_PROPS;
            this.config.showOfferGroup = this.params.CONFIG.OFFER_GROUP;
            this.config.useCompare = this.params.CONFIG.DISPLAY_COMPARE;
            this.config.useStickers = this.params.CONFIG.USE_STICKERS;
            this.config.useSubscribe = this.params.CONFIG.USE_SUBSCRIBE;
            this.config.showMaxQuantity = this.params.CONFIG.SHOW_MAX_QUANTITY;
            this.config.relativeQuantityFactor = parseInt(this.params.CONFIG.RELATIVE_QUANTITY_FACTOR);
            this.config.usePriceRanges = this.params.CONFIG.USE_PRICE_COUNT;

            if (this.params.CONFIG.MAIN_PICTURE_MODE) {
                this.config.usePopup = BX.util.in_array('POPUP', this.params.CONFIG.MAIN_PICTURE_MODE);
                this.config.useMagnifier = BX.util.in_array('MAGNIFIER', this.params.CONFIG.MAIN_PICTURE_MODE);
            }

            if (this.params.CONFIG.ADD_TO_BASKET_ACTION) {
                this.config.basketAction = this.params.CONFIG.ADD_TO_BASKET_ACTION;
            }

            this.config.showClosePopup = this.params.CONFIG.SHOW_CLOSE_POPUP;
            this.config.templateTheme = this.params.CONFIG.TEMPLATE_THEME || '';
            this.config.showSlider = this.params.CONFIG.SHOW_SLIDER === 'Y';

            if (this.config.showSlider && !this.isTouchDevice) {
                this.config.sliderInterval = parseInt(this.params.CONFIG.SLIDER_INTERVAL) || 5000;
            }
            else {
                this.config.sliderInterval = false;
            }

            this.config.useEnhancedEcommerce = this.params.CONFIG.USE_ENHANCED_ECOMMERCE === 'Y';
            this.config.dataLayerName = this.params.CONFIG.DATA_LAYER_NAME;
            this.config.brandProperty = this.params.CONFIG.BRAND_PROPERTY;

            this.config.alt = this.params.CONFIG.ALT || '';
            this.config.title = this.params.CONFIG.TITLE || '';

            this.config.magnifierZoomPercent = parseInt(this.params.CONFIG.MAGNIFIER_ZOOM_PERCENT) || 200;

            if (!this.params.VISUAL || typeof this.params.VISUAL !== 'object' || !this.params.VISUAL.ID) {
                this.errorCode = -1;
                return;
            }

            this.visual = this.params.VISUAL;
        },

        initProductData: function () {
            var j = 0;

            if (this.params.PRODUCT && typeof this.params.PRODUCT === 'object') {
                if (this.config.showQuantity) {
                    this.product.checkQuantity = this.params.PRODUCT.CHECK_QUANTITY;
                    this.product.isDblQuantity = this.params.PRODUCT.QUANTITY_FLOAT;

                    if (this.config.showPrice) {
                        this.currentPriceMode = this.params.PRODUCT.ITEM_PRICE_MODE;
                        this.currentPrices = this.params.PRODUCT.ITEM_PRICES;
                        this.currentPriceSelected = this.params.PRODUCT.ITEM_PRICE_SELECTED;
                        this.currentQuantityRanges = this.params.PRODUCT.ITEM_QUANTITY_RANGES;
                        this.currentQuantityRangeSelected = this.params.PRODUCT.ITEM_QUANTITY_RANGE_SELECTED;
                    }

                    if (this.product.checkQuantity) {
                        this.product.maxQuantity = this.product.isDblQuantity
                            ? parseFloat(this.params.PRODUCT.MAX_QUANTITY)
                            : parseInt(this.params.PRODUCT.MAX_QUANTITY, 10);
                    }

                    this.product.stepQuantity = this.product.isDblQuantity
                        ? parseFloat(this.params.PRODUCT.STEP_QUANTITY)
                        : parseInt(this.params.PRODUCT.STEP_QUANTITY, 10);
                    this.checkQuantity = this.product.checkQuantity;
                    this.isDblQuantity = this.product.isDblQuantity;
                    this.stepQuantity = this.product.stepQuantity;
                    this.maxQuantity = this.product.maxQuantity;
                    this.minQuantity = this.currentPriceMode === 'Q' ? parseFloat(this.currentPrices[this.currentPriceSelected].MIN_QUANTITY) : this.stepQuantity;

                    if (this.isDblQuantity) {
                        this.stepQuantity = Math.round(this.stepQuantity * this.precisionFactor) / this.precisionFactor;
                    }
                }

                this.product.canBuy = this.params.PRODUCT.CAN_BUY;
                this.canSubscription = this.product.canSubscription = this.params.PRODUCT.SUBSCRIPTION;

                this.product.name = this.params.PRODUCT.NAME;
                this.product.pict = this.params.PRODUCT.PICT;
                this.product.id = this.params.PRODUCT.ID;
                this.product.category = this.params.PRODUCT.CATEGORY;

                if (this.params.PRODUCT.ADD_URL) {
                    this.product.addUrl = this.params.PRODUCT.ADD_URL;
                }

                if (this.params.PRODUCT.BUY_URL) {
                    this.product.buyUrl = this.params.PRODUCT.BUY_URL;
                }

                if (this.params.PRODUCT.SLIDER_COUNT) {
                    this.product.sliderCount = parseInt(this.params.PRODUCT.SLIDER_COUNT, 10) || 0;

                    if (this.product.sliderCount > 0 && this.params.PRODUCT.SLIDER.length) {
                        for (j = 0; j < this.params.PRODUCT.SLIDER.length; j++) {
                            this.product.useSlider = true;
                            this.params.PRODUCT.SLIDER[j].WIDTH = parseInt(this.params.PRODUCT.SLIDER[j].WIDTH, 10);
                            this.params.PRODUCT.SLIDER[j].HEIGHT = parseInt(this.params.PRODUCT.SLIDER[j].HEIGHT, 10);
                        }

                        this.product.sliderPict = this.params.PRODUCT.SLIDER;
                        this.setCurrentImg(this.product.sliderPict[0], false);
                    }
                }

                this.currentIsSet = true;
            }
            else {
                this.errorCode = -1;
            }
        },

        initOffersData: function () {
            if (this.params.OFFERS && BX.type.isArray(this.params.OFFERS)) {
                this.offers = this.params.OFFERS;
                this.offerNum = 0;

                if (this.params.OFFER_SELECTED) {
                    this.offerNum = parseInt(this.params.OFFER_SELECTED, 10) || 0;
                }

                if (this.params.TREE_PROPS) {
                    this.treeProps = this.params.TREE_PROPS;
                }

                if (this.params.DEFAULT_PICTURE) {
                    this.defaultPict.preview = this.params.DEFAULT_PICTURE.PREVIEW_PICTURE;
                    this.defaultPict.detail = this.params.DEFAULT_PICTURE.DETAIL_PICTURE;
                }

                if (this.params.PRODUCT && typeof this.params.PRODUCT === 'object') {
                    this.product.id = parseInt(this.params.PRODUCT.ID, 10);
                    this.product.name = this.params.PRODUCT.NAME;
                    this.product.category = this.params.PRODUCT.CATEGORY;
                }
            }
            else {
                this.errorCode = -1;
            }
        },

        initBasketData: function () {
            if (this.params.BASKET && typeof this.params.BASKET === 'object') {
                if (this.productType === 1 || this.productType === 2) {
                    this.basketData.useProps = this.params.BASKET.ADD_PROPS;
                    this.basketData.emptyProps = this.params.BASKET.EMPTY_PROPS;
                }

                if (this.params.BASKET.QUANTITY) {
                    this.basketData.quantity = this.params.BASKET.QUANTITY;
                }

                if (this.params.BASKET.PROPS) {
                    this.basketData.props = this.params.BASKET.PROPS;
                }

                if (this.params.BASKET.BASKET_URL) {
                    this.basketData.basketUrl = this.params.BASKET.BASKET_URL;
                }

                if (this.productType === 3) {
                    if (this.params.BASKET.SKU_PROPS) {
                        this.basketData.sku_props = this.params.BASKET.SKU_PROPS;
                    }
                }

                if (this.params.BASKET.ADD_URL_TEMPLATE) {
                    this.basketData.add_url = this.params.BASKET.ADD_URL_TEMPLATE;
                }

                if (this.params.BASKET.BUY_URL_TEMPLATE) {
                    this.basketData.buy_url = this.params.BASKET.BUY_URL_TEMPLATE;
                }

                if (this.basketData.add_url === '' && this.basketData.buy_url === '') {
                    this.errorCode = -1024;
                }
            }
        },

        initCompareData: function () {
            if (this.config.useCompare) {
                if (this.params.COMPARE && typeof this.params.COMPARE === 'object') {
                    if (this.params.COMPARE.COMPARE_PATH) {
                        this.compareData.comparePath = this.params.COMPARE.COMPARE_PATH;
                    }

                    if (this.params.COMPARE.COMPARE_URL_TEMPLATE) {
                        this.compareData.compareUrl = this.params.COMPARE.COMPARE_URL_TEMPLATE;
                    }
                    else {
                        this.config.useCompare = false;
                    }

                    if (this.params.COMPARE.COMPARE_DELETE_URL_TEMPLATE) {
                        this.compareData.compareDeleteUrl = this.params.COMPARE.COMPARE_DELETE_URL_TEMPLATE;
                    }
                    else {
                        this.config.useCompare = false;
                    }
                }
                else {
                    this.config.useCompare = false;
                }
            }
        },

        initSlider: function () {

        },

        setAnalyticsDataLayer: function (action) {
            if (!this.config.useEnhancedEcommerce || !this.config.dataLayerName)
                return;

            var item = {},
                info = {},
                variants = [],
                i, k, j, propId, skuId, propValues;

            switch (this.productType) {
                case 0: //no catalog
                case 1: //product
                case 2: //set
                    item = {
                        'id': this.product.id,
                        'name': this.product.name,
                        'price': this.currentPrices[this.currentPriceSelected] && this.currentPrices[this.currentPriceSelected].PRICE,
                        'category': this.product.category,
                        'brand': BX.type.isArray(this.config.brandProperty) ? this.config.brandProperty.join('/') : this.config.brandProperty
                    };
                    break;
                case 3: //sku
                    for (i in this.offers[this.offerNum].TREE) {
                        if (this.offers[this.offerNum].TREE.hasOwnProperty(i)) {
                            propId = i.substring(5);
                            skuId = this.offers[this.offerNum].TREE[i];

                            for (k in this.treeProps) {
                                if (this.treeProps.hasOwnProperty(k) && this.treeProps[k].ID == propId) {
                                    for (j in this.treeProps[k].VALUES) {
                                        propValues = this.treeProps[k].VALUES[j];
                                        if (propValues.ID == skuId) {
                                            variants.push(propValues.NAME);
                                            break;
                                        }
                                    }

                                }
                            }
                        }
                    }

                    item = {
                        'id': this.offers[this.offerNum].ID,
                        'name': this.offers[this.offerNum].NAME,
                        'price': this.currentPrices[this.currentPriceSelected] && this.currentPrices[this.currentPriceSelected].PRICE,
                        'category': this.product.category,
                        'brand': BX.type.isArray(this.config.brandProperty) ? this.config.brandProperty.join('/') : this.config.brandProperty,
                        'variant': variants.join('/')
                    };
                    break;
            }

            switch (action) {
                case 'showDetail':
                    info = {
                        'event': 'showDetail',
                        'ecommerce': {
                            'currencyCode': this.currentPrices[this.currentPriceSelected] && this.currentPrices[this.currentPriceSelected].CURRENCY || '',
                            'detail': {
                                'products': [{
                                    'name': item.name || '',
                                    'id': item.id || '',
                                    'price': item.price || 0,
                                    'brand': item.brand || '',
                                    'category': item.category || '',
                                    'variant': item.variant || ''
                                }]
                            }
                        }
                    };
                    break;
                case 'addToCart':
                    info = {
                        'event': 'addToCart',
                        'ecommerce': {
                            'currencyCode': this.currentPrices[this.currentPriceSelected] && this.currentPrices[this.currentPriceSelected].CURRENCY || '',
                            'add': {
                                'products': [{
                                    'name': item.name || '',
                                    'id': item.id || '',
                                    'price': item.price || 0,
                                    'brand': item.brand || '',
                                    'category': item.category || '',
                                    'variant': item.variant || '',
                                    'quantity': this.config.showQuantity && this.obQuantity ? this.obQuantity.value : 1
                                }]
                            }
                        }
                    };
                    break;
            }

            window[this.config.dataLayerName] = window[this.config.dataLayerName] || [];
            window[this.config.dataLayerName].push(info);
        },

        initTabs: function () {
            var tabs = this.getEntities(this.obTabs, 'tab'),
                panelTabs = this.getEntities(this.obTabsPanel, 'tab');

            var tabValue, targetTab, haveActive = false;

            if (tabs.length !== panelTabs.length)
                return;

            for (var i in tabs) {
                if (tabs.hasOwnProperty(i) && BX.type.isDomNode(tabs[i])) {
                    tabValue = tabs[i].getAttribute('data-value');
                    if (tabValue) {
                        targetTab = this.obTabContainers.querySelector('[data-value="' + tabValue + '"]');
                        if (BX.type.isDomNode(targetTab)) {
                            BX.bind(tabs[i], 'click', BX.proxy(this.changeTab, this));
                            BX.bind(panelTabs[i], 'click', BX.proxy(this.changeTab, this));

                            if (!haveActive) {
                                BX.addClass(tabs[i], 'active');
                                BX.addClass(panelTabs[i], 'active');
                                BX.show(targetTab);
                                haveActive = true;
                            }
                            else {
                                BX.removeClass(tabs[i], 'active');
                                BX.removeClass(panelTabs[i], 'active');
                                BX.hide(targetTab);
                            }
                        }
                    }
                }
            }
        },

        checkTouch: function (event) {
            if (!event || !event.changedTouches)
                return false;

            return event.changedTouches[0].identifier === this.touch.identifier;
        },

        touchStartEvent: function (event) {
            if (event.touches.length != 1)
                return;

            this.touch = event.changedTouches[0];
        },

        touchEndEvent: function (event) {
            if (!this.checkTouch(event))
                return;

            var deltaX = this.touch.pageX - event.changedTouches[0].pageX,
                deltaY = this.touch.pageY - event.changedTouches[0].pageY;

            if (Math.abs(deltaX) >= Math.abs(deltaY) + 10) {
                if (deltaX > 0) {
                    this.slideNext();
                }

                if (deltaX < 0) {
                    this.slidePrev();
                }
            }
        },

        cycleSlider: function (event) {
            event || (this.slider.paused = false);

            this.slider.interval && clearInterval(this.slider.interval);

            if (this.config.sliderInterval && !this.slider.paused) {
                if (this.slider.progress) {
                    this.slider.progress.stop();

                    var width = parseInt(this.node.sliderProgressBar.style.width);

                    this.slider.progress.options.duration = this.config.sliderInterval * (100 - width) / 100;
                    this.slider.progress.options.start = {width: width * 10};
                    this.slider.progress.options.finish = {width: 1000};
                    this.slider.progress.options.complete = BX.delegate(function () {
                        this.slider.interval = true;
                        this.slideNext();
                    }, this);
                    this.slider.progress.animate();
                }
                else {
                    this.slider.interval = setInterval(BX.proxy(this.slideNext, this), this.config.sliderInterval);
                }
            }
        },

        stopSlider: function (event) {
            event || (this.slider.paused = true);

            this.slider.interval && (this.slider.interval = clearInterval(this.slider.interval));

            if (this.slider.progress) {
                this.slider.progress.stop();

                var width = parseInt(this.node.sliderProgressBar.style.width);

                this.slider.progress.options.duration = this.config.sliderInterval * width / 200;
                this.slider.progress.options.start = {width: width * 10};
                this.slider.progress.options.finish = {width: 0};
                this.slider.progress.options.complete = null;
                this.slider.progress.animate();
            }
        },

        resetProgress: function () {
            this.slider.progress && this.slider.progress.stop();
            this.node.sliderProgressBar.style.width = 0;
        },

        slideNext: function () {
            return this.slide('next');
        },

        slidePrev: function () {
            return this.slide('prev');
        },

        slide: function (type) {
            if (!this.product.slider || !this.product.slider.CONT)
                return;

            var active = this.getEntity(this.product.slider.CONT, 'slider-control', '.active'),
                next = this.getItemForDirection(type, active);

            BX.removeClass(active, 'active');
            this.selectSliderImg(next);

            this.slider.interval && this.cycleSlider();
        },

        getItemForDirection: function (direction, active) {
            var activeIndex = this.getItemIndex(active),
                delta = direction === 'prev' ? -1 : 1,
                itemIndex = (activeIndex + delta) % this.product.slider.COUNT;

            return this.eq(this.product.slider.ITEMS, itemIndex);
        },

        getItemIndex: function (item) {
            return BX.util.array_values(this.product.slider.ITEMS).indexOf(item);
        },

        eq: function (obj, i) {
            var len = obj.length,
                j = +i + (i < 0 ? len : 0);

            return j >= 0 && j < len ? obj[j] : {};
        },

        scrollToProduct: function () {
            var scrollTop = BX.GetWindowScrollPos().scrollTop,
                containerTop = BX.pos(this.obProduct).top - 30;

            if (scrollTop > containerTop) {
                new BX.easing({
                    duration: 500,
                    start: {scroll: scrollTop},
                    finish: {scroll: containerTop},
                    transition: BX.easing.makeEaseOut(BX.easing.transitions.quint),
                    step: BX.delegate(function (state) {
                        window.scrollTo(0, state.scroll);
                    }, this)
                }).animate();
            }
        },

        checkTopPanels: function () {
            var scrollTop = BX.GetWindowScrollPos().scrollTop,
                targetPos;

            if (this.smallCardNodes.panel) {
                targetPos = BX.pos(this.smallCardNodes.aligner).bottom - 50;

                if (scrollTop > targetPos) {
                    BX.addClass(this.smallCardNodes.panel, 'active');
                }
                else if (BX.hasClass(this.smallCardNodes.panel, 'active')) {
                    BX.removeClass(this.smallCardNodes.panel, 'active');
                }
            }

            if (this.obTabsPanel) {
                targetPos = BX.pos(this.obTabs).top;

                if (scrollTop + 73 > targetPos) {
                    BX.addClass(this.obTabsPanel, 'active');
                }
                else if (BX.hasClass(this.obTabsPanel, 'active')) {
                    BX.removeClass(this.obTabsPanel, 'active');
                }
            }
        },

        changeTab: function (event) {
            BX.PreventDefault(event);

            var targetTabValue = BX.proxy_context && BX.proxy_context.getAttribute('data-value'),
                containers, tabs, panelTabs;

            if (!BX.hasClass(BX.proxy_context, 'active') && targetTabValue) {
                containers = this.getEntities(this.obTabContainers, 'tab-container');
                for (var i in containers) {
                    if (containers.hasOwnProperty(i) && BX.type.isDomNode(containers[i])) {
                        if (containers[i].getAttribute('data-value') === targetTabValue) {
                            BX.show(containers[i]);
                        }
                        else {
                            BX.hide(containers[i]);
                        }
                    }
                }

                tabs = this.getEntities(this.obTabs, 'tab');
                panelTabs = this.getEntities(this.obTabsPanel, 'tab');

                for (i in tabs) {
                    if (tabs.hasOwnProperty(i) && BX.type.isDomNode(tabs[i])) {
                        if (tabs[i].getAttribute('data-value') === targetTabValue) {
                            BX.addClass(tabs[i], 'active');
                            BX.addClass(panelTabs[i], 'active');
                        }
                        else {
                            BX.removeClass(tabs[i], 'active');
                            BX.removeClass(panelTabs[i], 'active');
                        }
                    }
                }
            }

            var scrollTop = BX.GetWindowScrollPos().scrollTop,
                containerTop = BX.pos(this.obTabContainers).top;

            if (scrollTop + 150 > containerTop) {
                new BX.easing({
                    duration: 500,
                    start: {scroll: scrollTop},
                    finish: {scroll: containerTop - 150},
                    transition: BX.easing.makeEaseOut(BX.easing.transitions.quint),
                    step: BX.delegate(function (state) {
                        window.scrollTo(0, state.scroll);
                    }, this)
                }).animate();
            }
        },

        initPopup: function () {
            if (this.config.usePopup) {
                this.node.imageContainer.style.cursor = 'zoom-in';
                BX.bind(this.node.imageContainer, 'click', BX.delegate(this.toggleMainPictPopup, this));
                BX.bind(document, 'keyup', BX.proxy(this.closeByEscape, this));
                BX.bind(
                    this.getEntity(this.obBigSlider, 'close-popup'),
                    'click',
                    BX.proxy(this.hideMainPictPopup, this)
                );
            }
        },

        checkSliderControls: function (count) {
            var display = count > 1 ? '' : 'none';

            this.node.sliderControlLeft && (this.node.sliderControlLeft.style.display = display);
            this.node.sliderControlRight && (this.node.sliderControlRight.style.display = display);
        },

        setCurrentImg: function (img, showImage, showPanelImage) {
            var images, l;

            this.currentImg.id = img.ID;
            this.currentImg.src = img.SRC;
            this.currentImg.width = img.WIDTH;
            this.currentImg.height = img.HEIGHT;

            if (showImage && this.node.imageContainer) {
                images = this.getEntities(this.node.imageContainer, 'image');
                l = images.length;
                while (l--) {
                    if (images[l].getAttribute('data-id') == img.ID) {
                        if (!BX.hasClass(images[l], 'active')) {
                            this.node.sliderProgressBar && this.resetProgress();
                        }

                        BX.addClass(images[l], 'active');
                    }
                    else if (BX.hasClass(images[l], 'active')) {
                        BX.removeClass(images[l], 'active');
                    }
                }
            }

            if (showPanelImage && this.smallCardNodes.picture) {
                this.smallCardNodes.picture.setAttribute('src', this.currentImg.src);
            }

            if (this.config.useMagnifier && !this.isTouchDevice) {
                this.setMagnifierParams();

                if (showImage) {
                    this.disableMagnifier(true);
                }
            }
        },

        setMagnifierParams: function () {
            var images = this.getEntities(this.node.imageContainer, 'image'),
                l = images.length,
                current;

            while (l--) {
                // disable image title show
                current = images[l].querySelector('img');
                current.setAttribute('data-title', current.getAttribute('title') || '');
                current.removeAttribute('title');

                if (images[l].getAttribute('data-id') == this.currentImg.id) {
                    BX.unbind(this.currentImg.node, 'mouseover', BX.proxy(this.enableMagnifier, this));

                    this.currentImg.node = current;
                    this.currentImg.node.style.backgroundImage = 'url(\'' + this.currentImg.src + '\')';
                    this.currentImg.node.style.backgroundSize = '100% auto';

                    BX.bind(this.currentImg.node, 'mouseover', BX.proxy(this.enableMagnifier, this));
                }
            }
        },

        enableMagnifier: function () {
            BX.bind(document, 'mousemove', BX.proxy(this.moveMagnifierArea, this));
        },

        disableMagnifier: function (animateSize) {
            if (!this.magnify.enabled)
                return;

            clearTimeout(this.magnify.timer);
            BX.removeClass(this.obBigSlider, 'magnified');
            this.magnify.enabled = false;

            this.currentImg.node.style.backgroundSize = '100% auto';
            if (animateSize) {
                // set initial size for css animation
                this.currentImg.node.style.height = this.magnify.height + 'px';
                this.currentImg.node.style.width = this.magnify.width + 'px';

                this.magnify.timer = setTimeout(
                    BX.delegate(function () {
                        this.currentImg.node.src = this.currentImg.src;
                        this.currentImg.node.style.height = '';
                        this.currentImg.node.style.width = '';
                    }, this),
                    250
                );
            }
            else {
                this.currentImg.node.src = this.currentImg.src;
                this.currentImg.node.style.height = '';
                this.currentImg.node.style.width = '';
            }

            BX.unbind(document, 'mousemove', BX.proxy(this.moveMagnifierArea, this));
        },

        moveMagnifierArea: function (e) {
            var posBigImg = BX.pos(this.currentImg.node),
                currentPos = this.inRect(e, posBigImg);

            if (this.inBound(posBigImg, currentPos)) {
                var posPercentX = (currentPos.X / this.currentImg.node.width) * 100,
                    posPercentY = (currentPos.Y / this.currentImg.node.height) * 100,
                    resolution, sliderWidth, w, h, zoomPercent;

                this.currentImg.node.style.backgroundPosition = posPercentX + '% ' + posPercentY + '%';

                if (!this.magnify.enabled) {
                    clearTimeout(this.magnify.timer);
                    BX.addClass(this.obBigSlider, 'magnified');

                    // set initial size for css animation
                    this.currentImg.node.style.height = (this.magnify.height = this.currentImg.node.clientHeight) + 'px';
                    this.currentImg.node.style.width = (this.magnify.width = this.currentImg.node.offsetWidth) + 'px';

                    resolution = this.currentImg.width / this.currentImg.height;
                    sliderWidth = this.obBigSlider.offsetWidth;

                    if (sliderWidth > this.currentImg.width && !BX.hasClass(this.obBigSlider, 'popup')) {
                        w = sliderWidth;
                        h = w / resolution;
                        zoomPercent = 100;
                    }
                    else {
                        w = this.currentImg.width;
                        h = this.currentImg.height;
                        zoomPercent = this.config.magnifierZoomPercent > 100 ? this.config.magnifierZoomPercent : 100;
                    }

                    // base64 transparent pixel
                    this.currentImg.node.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVQI12P4zwAAAgEBAKrChTYAAAAASUVORK5CYII=';
                    this.currentImg.node.style.backgroundSize = zoomPercent + '% auto';

                    // set target size
                    this.magnify.timer = setTimeout(BX.delegate(function () {
                            this.currentImg.node.style.height = h + 'px';
                            this.currentImg.node.style.width = w + 'px';
                        }, this),
                        10
                    );
                }

                this.magnify.enabled = true;
            }
            else {
                this.disableMagnifier(true);
            }
        },

        inBound: function (rect, point) {
            return (
                (point.Y >= 0 && rect.height >= point.Y)
                && (point.X >= 0 && rect.width >= point.X)
            );
        },

        inRect: function (e, rect) {
            var wndSize = BX.GetWindowSize(),
                currentPos = {
                    X: 0,
                    Y: 0,
                    globalX: 0,
                    globalY: 0
                };

            currentPos.globalX = e.clientX + wndSize.scrollLeft;

            if (e.offsetX && e.offsetX < 0) {
                currentPos.globalX -= e.offsetX;
            }

            currentPos.X = currentPos.globalX - rect.left;
            currentPos.globalY = e.clientY + wndSize.scrollTop;

            if (e.offsetY && e.offsetY < 0) {
                currentPos.globalY -= e.offsetY;
            }

            currentPos.Y = currentPos.globalY - rect.top;

            return currentPos;
        },

        setProductMainPict: function (intPict) {
            var indexPict = -1,
                i = 0,
                j = 0,
                value = '';

            if (this.product.sliderCount) {
                for (j = 0; j < this.product.sliderPict.length; j++) {
                    if (intPict === this.product.sliderPict[j].ID) {
                        indexPict = j;
                        break;
                    }
                }

                if (indexPict > -1) {
                    if (this.product.sliderPict[indexPict]) {
                        this.setCurrentImg(this.product.sliderPict[indexPict], true);
                    }

                    for (i = 0; i < this.product.slider.ITEMS.length; i++) {
                        value = this.product.slider.ITEMS[i].getAttribute('data-value');

                        if (value === intPict) {
                            BX.addClass(this.product.slider.ITEMS[i], 'active');
                        }
                        else if (BX.hasClass(this.product.slider.ITEMS[i], 'active')) {
                            BX.removeClass(this.product.slider.ITEMS[i], 'active');
                        }
                    }
                }
            }
        },

        onSliderControlHover: function () {
            var target = BX.proxy_context;

            this.mouseTimer = setTimeout(
                BX.delegate(function () {
                    this.selectSliderImg(target);
                }, this),
                200
            );
        },

        onSliderControlLeave: function () {
            clearTimeout(this.mouseTimer);
            this.mouseTimer = null;
        },

        selectSliderImg: function (target) {
            var strValue = '',
                arItem = [];

            target = BX.type.isDomNode(target) ? target : BX.proxy_context;

            if (target && target.hasAttribute('data-value')) {
                strValue = target.getAttribute('data-value');

                if (strValue.indexOf('_') !== -1) {
                    arItem = strValue.split('_');
                    this.setMainPict(arItem[0], arItem[1]);
                }
                else {
                    this.setProductMainPict(strValue);
                }
            }
        },

        setMainPict: function (intSlider, intPict, changePanelPict) {
            var index = -1,
                indexPict = -1,
                i,
                j,
                value = '',
                strValue = '';

            for (i = 0; i < this.offers.length; i++) {
                if (intSlider === this.offers[i].ID) {
                    index = i;
                    break;
                }
            }

            if (index > -1) {
                if (this.offers[index].SLIDER_COUNT > 0) {
                    for (j = 0; j < this.offers[index].SLIDER.length; j++) {
                        if (intPict === this.offers[index].SLIDER[j].ID) {
                            indexPict = j;
                            break;
                        }
                    }

                    if (indexPict > -1) {
                        if (this.offers[index].SLIDER[indexPict]) {
                            this.setCurrentImg(this.offers[index].SLIDER[indexPict], true, changePanelPict);
                        }

                        strValue = intSlider + '_' + intPict;

                        for (i = 0; i < this.product.slider.ITEMS.length; i++) {
                            value = this.product.slider.ITEMS[i].getAttribute('data-value');

                            if (value === strValue) {
                                BX.addClass(this.product.slider.ITEMS[i], 'active');
                            }
                            else if (BX.hasClass(this.product.slider.ITEMS[i], 'active')) {
                                BX.removeClass(this.product.slider.ITEMS[i], 'active');
                            }
                        }
                    }
                }
            }
        },

        setMainPictFromItem: function (index) {
            if (this.node.imageContainer) {
                var boolSet = false,
                    obNewPict = {};

                if (this.offers[index]) {
                    if (this.offers[index].DETAIL_PICTURE) {
                        obNewPict = this.offers[index].DETAIL_PICTURE;
                        boolSet = true;
                    }
                    else if (this.offers[index].PREVIEW_PICTURE) {
                        obNewPict = this.offers[index].PREVIEW_PICTURE;
                        boolSet = true;
                    }
                }

                if (!boolSet) {
                    if (this.defaultPict.detail) {
                        obNewPict = this.defaultPict.detail;
                        boolSet = true;
                    }
                    else if (this.defaultPict.preview) {
                        obNewPict = this.defaultPict.preview;
                        boolSet = true;
                    }
                }

                if (boolSet) {
                    this.setCurrentImg(obNewPict, true, true);
                }
            }
        },

        toggleMainPictPopup: function () {
            if (BX.hasClass(this.obBigSlider, 'popup')) {
                this.hideMainPictPopup();
            }
            else {
                this.showMainPictPopup();
            }
        },

        showMainPictPopup: function () {
            this.config.useMagnifier && this.disableMagnifier(false);
            BX.addClass(this.obBigSlider, 'popup');
            this.node.imageContainer.style.cursor = '';
            // remove double scroll bar
            document.body.style.overflow = 'hidden';
        },

        hideMainPictPopup: function () {
            this.config.useMagnifier && this.disableMagnifier(false);
            BX.removeClass(this.obBigSlider, 'popup');
            this.node.imageContainer.style.cursor = 'zoom-in';
            // remove double scroll bar
            document.body.style.overflow = '';
        },

        closeByEscape: function (event) {
            event = event || window.event;

            if (event.keyCode == 27) {
                this.hideMainPictPopup();
            }
        },

        quantityUp: function () {
            var curValue = 0,
                boolSet = true;

            if (this.errorCode === 0 && this.config.showQuantity && this.canBuy && !this.isGift) {
                curValue = this.isDblQuantity ? parseFloat(this.obQuantity.value) : parseInt(this.obQuantity.value, 10);
                if (!isNaN(curValue)) {
                    curValue += this.stepQuantity;

                    curValue = this.checkQuantityRange(curValue, 'up');

                    if (this.checkQuantity && curValue > this.maxQuantity) {
                        boolSet = false;
                    }

                    if (boolSet) {
                        if (this.isDblQuantity) {
                            curValue = Math.round(curValue * this.precisionFactor) / this.precisionFactor;
                        }

                        this.obQuantity.value = curValue;

                        this.setPrice();
                    }
                }
            }
        },

        quantityDown: function () {
            var curValue = 0,
                boolSet = true;

            if (this.errorCode === 0 && this.config.showQuantity && this.canBuy && !this.isGift) {
                curValue = (this.isDblQuantity ? parseFloat(this.obQuantity.value) : parseInt(this.obQuantity.value, 10));
                if (!isNaN(curValue)) {
                    curValue -= this.stepQuantity;

                    curValue = this.checkQuantityRange(curValue, 'down');

                    if (curValue < this.minQuantity) {
                        boolSet = false;
                    }

                    if (boolSet) {
                        if (this.isDblQuantity) {
                            curValue = Math.round(curValue * this.precisionFactor) / this.precisionFactor;
                        }

                        this.obQuantity.value = curValue;

                        this.setPrice();
                    }
                }
            }
        },

        quantityChange: function () {
            var curValue = 0,
                intCount;

            if (this.errorCode === 0 && this.config.showQuantity) {
                if (this.canBuy) {
                    curValue = this.isDblQuantity ? parseFloat(this.obQuantity.value) : Math.round(this.obQuantity.value);
                    if (!isNaN(curValue)) {
                        curValue = this.checkQuantityRange(curValue);

                        if (this.checkQuantity) {
                            if (curValue > this.maxQuantity) {
                                curValue = this.maxQuantity;
                            }
                        }

                        this.checkPriceRange(curValue);

                        if (curValue < this.minQuantity) {
                            curValue = this.minQuantity;
                        }
                        else {
                            intCount = Math.round(
                                Math.round(curValue * this.precisionFactor / this.stepQuantity) / this.precisionFactor
                            ) || 1;
                            curValue = (intCount <= 1 ? this.stepQuantity : intCount * this.stepQuantity);
                            curValue = Math.round(curValue * this.precisionFactor) / this.precisionFactor;
                        }

                        this.obQuantity.value = curValue;
                    }
                    else {
                        this.obQuantity.value = this.minQuantity;
                    }
                }
                else {
                    this.obQuantity.value = this.minQuantity;
                }

                this.setPrice();
            }
        },

        quantitySet: function (index) {
            var strLimit, resetQuantity;

            var newOffer = this.offers[index],
                oldOffer = this.offers[this.offerNum];

            if (this.errorCode === 0) {
                this.canBuy = newOffer.CAN_BUY;

                this.currentPriceMode = newOffer.ITEM_PRICE_MODE;
                this.currentPrices = newOffer.ITEM_PRICES;
                this.currentPriceSelected = newOffer.ITEM_PRICE_SELECTED;
                this.currentQuantityRanges = newOffer.ITEM_QUANTITY_RANGES;
                this.currentQuantityRangeSelected = newOffer.ITEM_QUANTITY_RANGE_SELECTED;

                if (this.canBuy) {
                    this.node.quantity && BX.style(this.node.quantity, 'display', '');

                    this.obBasketActions && BX.style(this.obBasketActions, 'display', '');
                    this.smallCardNodes.buyButton && BX.style(this.smallCardNodes.buyButton, 'display', '');
                    this.smallCardNodes.addButton && BX.style(this.smallCardNodes.addButton, 'display', '');

                    this.obNotAvail && BX.style(this.obNotAvail, 'display', 'none');
                    this.smallCardNodes.notAvailableButton && BX.style(this.smallCardNodes.notAvailableButton, 'display', 'none');

                    this.obSubscribe && BX.style(this.obSubscribe, 'display', 'none');
                }
                else {
                    this.node.quantity && BX.style(this.node.quantity, 'display', 'none');

                    this.obBasketActions && BX.style(this.obBasketActions, 'display', 'none');
                    this.smallCardNodes.buyButton && BX.style(this.smallCardNodes.buyButton, 'display', 'none');
                    this.smallCardNodes.addButton && BX.style(this.smallCardNodes.addButton, 'display', 'none');

                    this.obNotAvail && BX.style(this.obNotAvail, 'display', '');
                    this.smallCardNodes.notAvailableButton && BX.style(this.smallCardNodes.notAvailableButton, 'display', '');

                    if (this.obSubscribe) {
                        if (newOffer.CATALOG_SUBSCRIBE === 'Y') {
                            BX.style(this.obSubscribe, 'display', '');
                            this.obSubscribe.setAttribute('data-item', newOffer.ID);
                            BX(this.visual.SUBSCRIBE_LINK + '_hidden').click();
                        }
                        else {
                            BX.style(this.obSubscribe, 'display', 'none');
                        }
                    }
                }

                this.isDblQuantity = newOffer.QUANTITY_FLOAT;
                this.checkQuantity = newOffer.CHECK_QUANTITY;

                if (this.isDblQuantity) {
                    this.stepQuantity = Math.round(parseFloat(newOffer.STEP_QUANTITY) * this.precisionFactor) / this.precisionFactor;
                    this.maxQuantity = parseFloat(newOffer.MAX_QUANTITY);
                    this.minQuantity = this.currentPriceMode === 'Q' ? parseFloat(this.currentPrices[this.currentPriceSelected].MIN_QUANTITY) : this.stepQuantity;
                }
                else {
                    this.stepQuantity = parseInt(newOffer.STEP_QUANTITY, 10);
                    this.maxQuantity = parseInt(newOffer.MAX_QUANTITY, 10);
                    this.minQuantity = this.currentPriceMode === 'Q' ? parseInt(this.currentPrices[this.currentPriceSelected].MIN_QUANTITY) : this.stepQuantity;
                }

                if (this.config.showQuantity) {
                    var isDifferentMinQuantity = oldOffer.ITEM_PRICES.length
                        && oldOffer.ITEM_PRICES[oldOffer.ITEM_PRICE_SELECTED]
                        && oldOffer.ITEM_PRICES[oldOffer.ITEM_PRICE_SELECTED].MIN_QUANTITY != this.minQuantity;

                    if (this.isDblQuantity) {
                        resetQuantity = Math.round(parseFloat(oldOffer.STEP_QUANTITY) * this.precisionFactor) / this.precisionFactor !== this.stepQuantity
                            || isDifferentMinQuantity
                            || oldOffer.MEASURE !== newOffer.MEASURE
                            || (
                                this.checkQuantity
                                && parseFloat(oldOffer.MAX_QUANTITY) > this.maxQuantity
                                && parseFloat(this.obQuantity.value) > this.maxQuantity
                            );
                    }
                    else {
                        resetQuantity = parseInt(oldOffer.STEP_QUANTITY, 10) !== this.stepQuantity
                            || isDifferentMinQuantity
                            || oldOffer.MEASURE !== newOffer.MEASURE
                            || (
                                this.checkQuantity
                                && parseInt(oldOffer.MAX_QUANTITY, 10) > this.maxQuantity
                                && parseInt(this.obQuantity.value, 10) > this.maxQuantity
                            );
                    }

                    this.obQuantity.disabled = !this.canBuy;

                    if (resetQuantity) {
                        this.obQuantity.value = this.minQuantity;
                    }

                    if (this.obMeasure) {
                        if (newOffer.MEASURE) {
                            BX.adjust(this.obMeasure, {html: newOffer.MEASURE});
                        }
                        else {
                            BX.adjust(this.obMeasure, {html: ''});
                        }
                    }
                }

                if (this.obQuantityLimit.all) {
                    if (!this.checkQuantity || this.maxQuantity == 0) {
                        BX.adjust(this.obQuantityLimit.value, {html: ''});
                        BX.adjust(this.obQuantityLimit.all, {style: {display: 'none'}});
                    }
                    else {
                        if (this.config.showMaxQuantity === 'M') {
                            strLimit = (this.maxQuantity / this.stepQuantity >= this.config.relativeQuantityFactor)
                                ? BX.message('RELATIVE_QUANTITY_MANY')
                                : BX.message('RELATIVE_QUANTITY_FEW');
                        }
                        else {
                            strLimit = this.maxQuantity;

                            if (newOffer.MEASURE) {
                                strLimit += (' ' + newOffer.MEASURE);
                            }
                        }

                        BX.adjust(this.obQuantityLimit.value, {html: strLimit});
                        BX.adjust(this.obQuantityLimit.all, {style: {display: ''}});
                    }
                }

                if (this.config.usePriceRanges && this.obPriceRanges) {
                    if (
                        this.currentPriceMode === 'Q'
                        && newOffer.PRICE_RANGES_HTML
                    ) {
                        var rangesBody = this.getEntity(this.obPriceRanges, 'price-ranges-body'),
                            rangesRatioHeader = this.getEntity(this.obPriceRanges, 'price-ranges-ratio-header');

                        if (rangesBody) {
                            rangesBody.innerHTML = newOffer.PRICE_RANGES_HTML;
                        }

                        if (rangesRatioHeader) {
                            rangesRatioHeader.innerHTML = newOffer.PRICE_RANGES_RATIO_HTML;
                        }

                        this.obPriceRanges.style.display = '';
                    }
                    else {
                        this.obPriceRanges.style.display = 'none';
                    }

                }
            }
        },

        selectOfferProp: function () {
            var i = 0,
                strTreeValue = '',
                arTreeItem = [],
                rowItems = null,
                target = BX.proxy_context,
                smallCardItem;

            if (target && target.hasAttribute('data-treevalue')) {
                if (BX.hasClass(target, 'selected'))
                    return;

                if (typeof document.activeElement === 'object') {
                    document.activeElement.blur();
                }

                strTreeValue = target.getAttribute('data-treevalue');
                arTreeItem = strTreeValue.split('_');
                this.searchOfferPropIndex(arTreeItem[0], arTreeItem[1]);
                rowItems = BX.findChildren(target.parentNode, {tagName: 'li'}, false);

                if (rowItems && rowItems.length) {
                    for (i = 0; i < rowItems.length; i++) {
                        BX.removeClass(rowItems[i], 'selected');

                    }
                }

                BX.addClass(target, 'selected');

                if (target.hasAttribute('data-all-storon')){
                    $('.product__addit-item[data-prop-id="grav"]').removeClass('hidden');
                } else {
                    $('.product__addit-item[data-prop-id="grav"]').addClass('hidden');
                    $('input[data-id="166"]').prop('checked', false);
                    $('.selection__radio--none > input[name="service_166"]').prop('checked', true);
                    delete (preBasket['166']);
                    $('button[data-prop-id="166"]').remove();
                    $('.product__order-row[data-prop-id="166"]').remove();

                    getDiscounts();
                }

                if (this.smallCardNodes.panel) {
                    smallCardItem = this.smallCardNodes.panel.querySelector('[data-treevalue="' + strTreeValue + '"]');
                    if (smallCardItem) {
                        rowItems = this.smallCardNodes.panel.querySelectorAll('[data-sku-line="' + smallCardItem.getAttribute('data-sku-line') + '"]');

                        console.dir(rowItems);

                        for (i = 0; i < rowItems.length; i++) {
                            rowItems[i].style.display = 'none';
                        }

                        smallCardItem.style.display = '';
                    }
                }
				calculateMeters();
            }
        },

        searchOfferPropIndex: function (strPropID, strPropValue) {
            var strName = '',
                arShowValues = false,
                arCanBuyValues = [],
                allValues = [],
                index = -1,
                i, j,
                arFilter = {},
                tmpFilter = [];

            for (i = 0; i < this.treeProps.length; i++) {
                if (this.treeProps[i].ID === strPropID) {
                    index = i;
                    break;
                }
            }

            if (index > -1) {
                for (i = 0; i < index; i++) {
                    strName = 'PROP_' + this.treeProps[i].ID;
                    arFilter[strName] = this.selectedValues[strName];
                }

                strName = 'PROP_' + this.treeProps[index].ID;
                arFilter[strName] = strPropValue;

                for (i = index + 1; i < this.treeProps.length; i++) {
                    strName = 'PROP_' + this.treeProps[i].ID;
                    arShowValues = this.getRowValues(arFilter, strName);

                    if (!arShowValues)
                        break;

                    allValues = [];

                    if (this.config.showAbsent) {
                        arCanBuyValues = [];
                        tmpFilter = [];
                        tmpFilter = BX.clone(arFilter, true);

                        for (j = 0; j < arShowValues.length; j++) {
                            tmpFilter[strName] = arShowValues[j];
                            allValues[allValues.length] = arShowValues[j];
                            if (this.getCanBuy(tmpFilter))
                                arCanBuyValues[arCanBuyValues.length] = arShowValues[j];
                        }
                    }
                    else {
                        arCanBuyValues = arShowValues;
                    }

                    if (this.selectedValues[strName] && BX.util.in_array(this.selectedValues[strName], arCanBuyValues)) {
                        arFilter[strName] = this.selectedValues[strName];
                    }
                    else {
                        if (this.config.showAbsent) {
                            arFilter[strName] = (arCanBuyValues.length ? arCanBuyValues[0] : allValues[0]);
                        }
                        else {
                            arFilter[strName] = arCanBuyValues[0];
                        }
                    }

                    this.updateRow(i, arFilter[strName], arShowValues, arCanBuyValues);
                }

                this.selectedValues = arFilter;
                this.changeInfo();
            }
        },

        updateRow: function (intNumber, activeId, showId, canBuyId) {
            var i = 0,
                value = '',
                isCurrent = false,
                rowItems = null;

            var lineContainer = this.getEntities(this.obTree, 'sku-line-block');

            if (intNumber > -1 && intNumber < lineContainer.length) {
                rowItems = lineContainer[intNumber].querySelectorAll('li');
                for (i = 0; i < rowItems.length; i++) {
                    value = rowItems[i].getAttribute('data-onevalue');
                    isCurrent = value === activeId;

                    if (isCurrent) {
                        BX.addClass(rowItems[i], 'selected');
                    }
                    else {
                        BX.removeClass(rowItems[i], 'selected');
                    }

                    if (BX.util.in_array(value, canBuyId)) {
                        BX.removeClass(rowItems[i], 'notallowed');
                    }
                    else {
                        BX.addClass(rowItems[i], 'notallowed');
                    }

                    rowItems[i].style.display = BX.util.in_array(value, showId) ? '' : 'none';

                    if (isCurrent) {
                        lineContainer[intNumber].style.display = (value == 0 && canBuyId.length == 1) ? 'none' : '';
                    }
                }

                if (this.smallCardNodes.panel) {
                    rowItems = this.smallCardNodes.panel.querySelectorAll('[data-sku-line="' + intNumber + '"]');
                    for (i = 0; i < rowItems.length; i++) {
                        value = rowItems[i].getAttribute('data-onevalue');
                        isCurrent = value === activeId;

                        if (isCurrent) {
                            rowItems[i].style.display = '';
                        }
                        else {
                            rowItems[i].style.display = 'none';
                        }

                        if (BX.util.in_array(value, canBuyId)) {
                            BX.removeClass(rowItems[i], 'notallowed');
                        }
                        else {
                            BX.addClass(rowItems[i], 'notallowed');
                        }

                        if (isCurrent) {
                            rowItems[i].style.display = (value == 0 && canBuyId.length == 1) ? 'none' : '';
                        }
                    }
                }
            }
        },

        getRowValues: function (arFilter, index) {
            var arValues = [],
                i = 0,
                j = 0,
                boolSearch = false,
                boolOneSearch = true;

            if (arFilter.length === 0) {
                for (i = 0; i < this.offers.length; i++) {
                    if (!BX.util.in_array(this.offers[i].TREE[index], arValues)) {
                        arValues[arValues.length] = this.offers[i].TREE[index];
                    }
                }
                boolSearch = true;
            }
            else {
                for (i = 0; i < this.offers.length; i++) {
                    boolOneSearch = true;

                    for (j in arFilter) {
                        if (arFilter[j] !== this.offers[i].TREE[j]) {
                            boolOneSearch = false;
                            break;
                        }
                    }

                    if (boolOneSearch) {
                        if (!BX.util.in_array(this.offers[i].TREE[index], arValues)) {
                            arValues[arValues.length] = this.offers[i].TREE[index];
                        }

                        boolSearch = true;
                    }
                }
            }

            return (boolSearch ? arValues : false);
        },

        getCanBuy: function (arFilter) {
            var i,
                j = 0,
                boolOneSearch = true,
                boolSearch = false;

            for (i = 0; i < this.offers.length; i++) {
                boolOneSearch = true;

                for (j in arFilter) {
                    if (arFilter[j] !== this.offers[i].TREE[j]) {
                        boolOneSearch = false;
                        break;
                    }
                }

                if (boolOneSearch) {
                    if (this.offers[i].CAN_BUY) {
                        boolSearch = true;
                        break;
                    }
                }
            }

            return boolSearch;
        },

        setCurrent: function () {
            var i,
                j = 0,
                strName = '',
                arShowValues = false,
                arCanBuyValues = [],
                arFilter = {},
                tmpFilter = [],
                current = this.offers[this.offerNum].TREE;

            for (i = 0; i < this.treeProps.length; i++) {
                strName = 'PROP_' + this.treeProps[i].ID;
                arShowValues = this.getRowValues(arFilter, strName);

                if (!arShowValues)
                    break;

                if (BX.util.in_array(current[strName], arShowValues)) {
                    arFilter[strName] = current[strName];
                }
                else {
                    arFilter[strName] = arShowValues[0];
                    this.offerNum = 0;
                }

                if (this.config.showAbsent) {
                    arCanBuyValues = [];
                    tmpFilter = [];
                    tmpFilter = BX.clone(arFilter, true);

                    for (j = 0; j < arShowValues.length; j++) {
                        tmpFilter[strName] = arShowValues[j];

                        if (this.getCanBuy(tmpFilter)) {
                            arCanBuyValues[arCanBuyValues.length] = arShowValues[j];
                        }
                    }
                }
                else {
                    arCanBuyValues = arShowValues;
                }

                this.updateRow(i, arFilter[strName], arShowValues, arCanBuyValues);
            }

            this.selectedValues = arFilter;
            this.changeInfo();
        },

        changeInfo: function () {
                var index = -1,
                j = 0,
                boolOneSearch = true,
                eventData = {
                    currentId: (this.offerNum > -1 ? this.offers[this.offerNum].ID : 0),
                    newId: 0
                };

            var i, offerGroupNode;

            for (i = 0; i < this.offers.length; i++) {
                boolOneSearch = true;

                for (j in this.selectedValues) {
                    if (this.selectedValues[j] !== this.offers[i].TREE[j]) {
                        boolOneSearch = false;
                        break;
                    }
                }

                if (boolOneSearch) {
                    index = i;
                    break;
                }
            }

            if (index > -1) {
                if (index != this.offerNum) {
                    this.isGift = false;
                }

                this.drawImages(this.offers[index].SLIDER);
                this.checkSliderControls(this.offers[index].SLIDER_COUNT);

                for (i = 0; i < this.offers.length; i++) {

                    if (this.config.showOfferGroup && this.offers[i].OFFER_GROUP) {
                        if (offerGroupNode = BX(this.visual.OFFER_GROUP + this.offers[i].ID)) {
                            offerGroupNode.style.display = (i == index ? '' : 'none');
                        }
                    }

                    if (this.slider.controls[i].ID) {
                        if (i === index) {
                            //console.dir(this.offers[i].SLIDER_COUNT);

                            $('li.product__thumb-img').each(function () {
                                $('li.product__thumb-img').css({'display':'none'});
                                $('li.product__thumb-img a ').attr('data-imagelightbox', '');
                                $('li.product__thumb-img a ').attr('href', '');
                                $('li.product__thumb-img img').attr('src', '');
                            });

                            if (this.offers[i].SLIDER_COUNT >= 2) {
                                var coint_i = this.offers[i].SLIDER_COUNT;
                                var html_text = '';
                                for (var mi = 0; mi < coint_i; mi++) {
                                   if (mi != 0) {
                                       $('li.product__thumb-img:eq(' + (mi - 1) + ')').css({'display':'inline-block'});
                                       $('li.product__thumb-img:eq(' + (mi - 1) + ') a').attr('data-imagelightbox', 'f');
                                       $('li.product__thumb-img:eq(' + (mi - 1) + ') a').attr('href', this.offers[i].SLIDER[mi].SRC);
                                       $('li.product__thumb-img:eq(' + (mi - 1) + ') a').attr('href', this.offers[i].SLIDER[mi].SRC);
                                       $('li.product__thumb-img:eq(' + (mi - 1) + ') img').attr('src', this.offers[i].SLIDER[mi].SRC);
                                       /*html_text = (html_text + '<li class="product__thumb-img"><a class="lightbox" data-imagelightbox="' + i + '" href="' + this.offers[i].SLIDER[mi].SRC + '" onclick=""><img src="' + this.offers[i].SLIDER[mi].SRC + '" alt=""></a></li>');*/
                                   }
                                }
                            } else {

                            };

                            $('#first-photo').attr('href', this.offers[i].DETAIL_PICTURE.SRC);
                            $('.product__gallery .product__img img').attr('src', this.offers[i].DETAIL_PICTURE.SRC);

                            currentSKU = this.offers[i].ID;
                            if(this.offers[i].SIZE_MONUMENT!=""){
                                $('.installation .form-checkbox').eq(0).html('<input type="checkbox" name="installationMonument" data-id="'+arrayMontage[this.offers[i].SIZE_MONUMENT].ID+'" data-price="'+arrayMontage[this.offers[i].SIZE_MONUMENT].PRICE+'" id="installationMonument">\n' +
                                    '<label for="installationMonument" title="Монтаж памятника">Монтаж памятника <b>'+arrayMontage[this.offers[i].SIZE_MONUMENT].PRICE*1+' <i class="fa fa-rub" aria-hidden="true"></i></b></label>');
                            }else if(this.offers[i].VARIANT!=""){
                                $('.installation .form-checkbox').eq(0).html('<input type="checkbox" name="installationTombstone" data-id="'+arrayMontageNadgrobie1[this.offers[i].VARIANT].ID+'" data-price="'+arrayMontageNadgrobie1[this.offers[i].VARIANT].PRICE+'" id="installationTombstone">\n' +
                                    '<label for="installationTombstone" title="Монтаж надгробия">Монтаж надгробия <b>'+arrayMontageNadgrobie1[this.offers[i].VARIANT].PRICE*1+' <i class="fa fa-rub" aria-hidden="true"></i></b></label>');
                            }else{
                                $('.installation .form-checkbox').eq(0).empty();
                            }
                            calculateSumm();
                            var ng = $('[data-ng="' + this.offers[i].ID + '"]');
							
                            if (typeof(ng) != 'undefined' && ng.length) {
                                var ngVal = $(ng).val();
                                var name = $('[data-type="nagrobie-block"]').data('type-nadgrob');
                                var mestorozhdenie = $('[data-mestorozhdenie]').data('mestorozhdenie');
                                var curNadgrobie = $('input[name="tombstone"]:checked');
                                /*console.dir(ngVal);*/
								
								//console.log(name+"|"+ngVal+"|"+mestorozhdenie);

                                $.post('/local/ajax/ajax.php', {
                                    action: "getNagrobie",
                                    name: name,
                                    razmer: ngVal,
                                    mestorozhdenie: mestorozhdenie
                                }, function (data) {
                                    $('[data-type="nagrobie-block"]').html(data);
                                    setTimeout(function () {
                                        if (typeof (curNadgrobie) != 'undefined' && curNadgrobie.length && curNadgrobie.length > 0) {
                                            if ($(curNadgrobie).val() && $(curNadgrobie).val() != '') {
                                                var nextNadgrobie = $('input[name="tombstone"][value="' + $(curNadgrobie).val() + '"]');
                                                if (typeof (nextNadgrobie) != 'undefined' && nextNadgrobie.length && nextNadgrobie.length > 0) {
                                                    if ($(nextNadgrobie).val() && $(nextNadgrobie).val() != '') {
                                                        let idNg = $(nextNadgrobie).attr('id');
                                                        let idNgVariant = $(nextNadgrobie).data('variant');
                                                        $('label[for="' + idNg + '"').click();

                                                    }
                                                }
                                            }
                                        }
                                    }, 300);
                                });
                            }
                            this.product.slider = this.slider.controls[i];
                            this.slider.controls[i].CONT && BX.show(this.slider.controls[i].CONT);
                        }
                        else {
                            this.slider.controls[i].CONT && BX.hide(this.slider.controls[i].CONT);
                        }
                    }
                    else if (i === index) {
                        this.product.slider = {};
                    }
                }

                if (this.offers[index].SLIDER_COUNT > 0) {
                    this.setMainPict(this.offers[index].ID, this.offers[index].SLIDER[0].ID, true);
                }
                else {
                    this.setMainPictFromItem(index);
                }

                if (this.offers[index].SLIDER_COUNT > 1) {
                }
                else {
                    this.stopSlider();
                }

                if (this.config.showSkuProps) {
                    if (this.obSkuProps) {
                        if (!this.offers[index].DISPLAY_PROPERTIES) {
                            BX.adjust(this.obSkuProps, {style: {display: 'none'}, html: ''});
                        }
                        else {
                            BX.adjust(this.obSkuProps, {
                                style: {display: ''},
                                html: this.offers[index].DISPLAY_PROPERTIES
                            });
                        }
                    }

                    if (this.obMainSkuProps) {
                        if (!this.offers[index].DISPLAY_PROPERTIES_MAIN_BLOCK) {
                            BX.adjust(this.obMainSkuProps, {style: {display: 'none'}, html: ''});
                        }
                        else {
                            BX.adjust(this.obMainSkuProps, {
                                style: {display: ''},
                                html: this.offers[index].DISPLAY_PROPERTIES_MAIN_BLOCK
                            });
                        }
                    }
                }

                this.quantitySet(index);
                this.setPrice();
                this.setCompared(this.offers[index].COMPARED);

                this.offerNum = index;
                this.fixFontCheck();
                this.setAnalyticsDataLayer('showDetail');
                this.incViewedCounter();

                eventData.newId = this.offers[this.offerNum].ID;
                // only for compatible catalog.store.amount custom templates
                BX.onCustomEvent('onCatalogStoreProductChange', [this.offers[this.offerNum].ID]);
                // new event
                BX.onCustomEvent('onCatalogElementChangeOffer', [eventData]);
                eventData = null;
            }
        },

        drawImages: function (images) {
            if (!this.node.imageContainer)
                return;

            var i, img, entities = this.getEntities(this.node.imageContainer, 'image');
            for (i in entities) {
                if (entities.hasOwnProperty(i) && BX.type.isDomNode(entities[i])) {
                    BX.remove(entities[i]);
                }
            }

            for (i = 0; i < images.length; i++) {
                img = BX.create('IMG', {
                    props: {
                        src: images[i].SRC,
                        alt: this.config.alt,
                        title: this.config.title
                    }
                });

                if (i == 0) {
                    img.setAttribute('itemprop', 'image');
                }

                this.node.imageContainer.appendChild(
                    BX.create('DIV', {
                        attrs: {
                            'data-entity': 'image',
                            'data-id': images[i].ID
                        },
                        props: {
                            className: 'product-item-detail-slider-image' + (i == 0 ? ' active' : '')
                        },
                        children: [img]
                    })
                );
            }
        },

        restoreSticker: function () {
            if (this.previousStickerText) {
                this.redrawSticker({text: this.previousStickerText});
            }
            else {
                this.hideSticker();
            }
        },

        hideSticker: function () {
            BX.hide(BX(this.visual.STICKER_ID));
        },

        redrawSticker: function (stickerData) {
            stickerData = stickerData || {};
            var text = stickerData.text || '';

            var sticker = BX(this.visual.STICKER_ID);
            if (!sticker)
                return;

            BX.show(sticker);

            var previousStickerText = sticker.getAttribute('title');
            if (previousStickerText && previousStickerText != text) {
                this.previousStickerText = previousStickerText;
            }

            BX.adjust(sticker, {text: text, attrs: {title: text}});
        },

        checkQuantityRange: function (quantity, direction) {
            if (typeof quantity === 'undefined' || this.currentPriceMode !== 'Q') {
                return quantity;
            }

            quantity = parseFloat(quantity);

            var nearestQuantity = quantity;
            var range, diffFrom, absDiffFrom, diffTo, absDiffTo, shortestDiff;

            for (var i in this.currentQuantityRanges) {
                if (this.currentQuantityRanges.hasOwnProperty(i)) {
                    range = this.currentQuantityRanges[i];

                    if (
                        parseFloat(quantity) >= parseFloat(range.SORT_FROM)
                        && (
                            range.SORT_TO === 'INF'
                            || parseFloat(quantity) <= parseFloat(range.SORT_TO)
                        )
                    ) {
                        nearestQuantity = quantity;
                        break;
                    }
                    else {
                        diffFrom = parseFloat(range.SORT_FROM) - quantity;
                        absDiffFrom = Math.abs(diffFrom);
                        diffTo = parseFloat(range.SORT_TO) - quantity;
                        absDiffTo = Math.abs(diffTo);

                        if (shortestDiff === undefined || shortestDiff > absDiffFrom) {
                            if (
                                direction === undefined
                                || (direction === 'up' && diffFrom > 0)
                                || (direction === 'down' && diffFrom < 0)
                            ) {
                                shortestDiff = absDiffFrom;
                                nearestQuantity = parseFloat(range.SORT_FROM);
                            }
                        }

                        if (shortestDiff === undefined || shortestDiff > absDiffTo) {
                            if (
                                direction === undefined
                                || (direction === 'up' && diffFrom > 0)
                                || (direction === 'down' && diffFrom < 0)
                            ) {
                                shortestDiff = absDiffTo;
                                nearestQuantity = parseFloat(range.SORT_TO);
                            }
                        }
                    }
                }
            }

            return nearestQuantity;
        },

        checkPriceRange: function (quantity) {
            if (typeof quantity === 'undefined' || this.currentPriceMode !== 'Q') {
                return;
            }

            var range, found = false;

            for (var i in this.currentQuantityRanges) {
                if (this.currentQuantityRanges.hasOwnProperty(i)) {
                    range = this.currentQuantityRanges[i];

                    if (
                        parseFloat(quantity) >= parseFloat(range.SORT_FROM)
                        && (
                            range.SORT_TO === 'INF'
                            || parseFloat(quantity) <= parseFloat(range.SORT_TO)
                        )
                    ) {
                        found = true;
                        this.currentQuantityRangeSelected = range.HASH;
                        break;
                    }
                }
            }

            if (!found && (range = this.getMinPriceRange())) {
                this.currentQuantityRangeSelected = range.HASH;
            }

            for (var k in this.currentPrices) {
                if (this.currentPrices.hasOwnProperty(k)) {
                    if (this.currentPrices[k].QUANTITY_HASH == this.currentQuantityRangeSelected) {
                        this.currentPriceSelected = k;
                        break;
                    }
                }
            }
        },

        getMinPriceRange: function () {
            var range;

            for (var i in this.currentQuantityRanges) {
                if (this.currentQuantityRanges.hasOwnProperty(i)) {
                    if (
                        !range
                        || parseInt(this.currentQuantityRanges[i].SORT_FROM) < parseInt(range.SORT_FROM)
                    ) {
                        range = this.currentQuantityRanges[i];
                    }
                }
            }

            return range;
        },

        checkQuantityControls: function () {
            if (!this.obQuantity)
                return;

            var reachedTopLimit = this.checkQuantity && parseFloat(this.obQuantity.value) + this.stepQuantity > this.maxQuantity,
                reachedBottomLimit = parseFloat(this.obQuantity.value) - this.stepQuantity < this.minQuantity;

            if (reachedTopLimit) {
                BX.addClass(this.obQuantityUp, 'product-item-amount-field-btn-disabled');
            }
            else if (BX.hasClass(this.obQuantityUp, 'product-item-amount-field-btn-disabled')) {
                BX.removeClass(this.obQuantityUp, 'product-item-amount-field-btn-disabled');
            }

            if (reachedBottomLimit) {
                BX.addClass(this.obQuantityDown, 'product-item-amount-field-btn-disabled');
            }
            else if (BX.hasClass(this.obQuantityDown, 'product-item-amount-field-btn-disabled')) {
                BX.removeClass(this.obQuantityDown, 'product-item-amount-field-btn-disabled');
            }

            if (reachedTopLimit && reachedBottomLimit) {
                this.obQuantity.setAttribute('disabled', 'disabled');
            }
            else {
                this.obQuantity.removeAttribute('disabled');
            }
        },

        setPrice: function () {
            var economyInfo = '', price;

            if (this.obQuantity) {
                this.checkPriceRange(this.obQuantity.value);
            }

            this.checkQuantityControls();

            price = this.currentPrices[this.currentPriceSelected];

            if (this.isGift) {
                price.PRICE = 0;
                price.DISCOUNT = price.BASE_PRICE;
                price.PERCENT = 100;
            }



            if (this.obPrice.price) {
                if (price) {

                    BX.adjust(this.obPrice.price, {html: BX.Currency.currencyFormat(price.RATIO_PRICE, price.CURRENCY, true)});
                    this.smallCardNodes.price && BX.adjust(this.smallCardNodes.price, {
                        html: BX.Currency.currencyFormat(price.RATIO_PRICE, price.CURRENCY, true)
                    });
                    offerPrice = price.RATIO_PRICE;
                    $('#PRICE_SUMM span').html(BX.Currency.currencyFormat(price.RATIO_PRICE, price.CURRENCY, true));
                    $('[data-price]').data('prices', offerPrice);

                    countQuantity();

                    if (price.RATIO_PRICE2) {
                        if (!$('.out_discount_price').hasClass('product__order-top_price')) {
                            $('.out_discount_price').addClass('product__order-top_price');
                            $('.product__order-total-sum').removeClass('product__order-top_price');
                        }

                        $('.out_discount_price span').attr("data-price-old", price.RATIO_PRICE);
                        $('.out_discount_price span').attr("data-price-new", price.RATIO_PRICE2);

                    }

                    if (!price.RATIO_PRICE2 && $('.out_discount_price').hasClass('product__order-top_price')) {
                        $('.out_discount_price').removeClass('product__order-top_price');
                        $('.product__order-total-sum').addClass('product__order-top_price');
                        $('.out_discount_price span').attr("data-price-old", '1');
                        $('.out_discount_price span').attr("data-price-new", '1');
                    }

                    calculateSumm();


                }
                else {
                    BX.adjust(this.obPrice.price, {html: ''});
                    this.smallCardNodes.price && BX.adjust(this.smallCardNodes.price, {html: ''});
                }

                if (price && price.RATIO_PRICE !== price.RATIO_BASE_PRICE) {
                    if (this.config.showOldPrice) {
                        this.obPrice.full && BX.adjust(this.obPrice.full, {
                            style: {display: ''},
                            html: BX.Currency.currencyFormat(price.RATIO_BASE_PRICE, price.CURRENCY, true)
                        });
                        this.smallCardNodes.oldPrice && BX.adjust(this.smallCardNodes.oldPrice, {
                            style: {display: ''},
                            html: BX.Currency.currencyFormat(price.RATIO_BASE_PRICE, price.CURRENCY, true)
                        });

                        if (this.obPrice.discount) {
                            economyInfo = BX.message('ECONOMY_INFO_MESSAGE');
                            economyInfo = economyInfo.replace('#ECONOMY#', BX.Currency.currencyFormat(price.RATIO_DISCOUNT, price.CURRENCY, true));
                            BX.adjust(this.obPrice.discount, {style: {display: ''}, html: economyInfo});
                        }

                    }

                    if (this.config.showPercent) {
                        this.obPrice.percent && BX.adjust(this.obPrice.percent, {
                            style: {display: ''},
                            html: -price.PERCENT + '%'
                        });
                    }
                }
                else {
                    if (this.config.showOldPrice) {
                        this.obPrice.full && BX.adjust(this.obPrice.full, {style: {display: 'none'}, html: ''});
                        this.smallCardNodes.oldPrice && BX.adjust(this.smallCardNodes.oldPrice, {
                            style: {display: 'none'},
                            html: ''
                        });
                        this.obPrice.discount && BX.adjust(this.obPrice.discount, {style: {display: 'none'}, html: ''});
                    }

                    if (this.config.showPercent) {
                        this.obPrice.percent && BX.adjust(this.obPrice.percent, {style: {display: 'none'}, html: ''});
                    }
                }

                if (this.obPrice.total) {
                    if (price && this.obQuantity && this.obQuantity.value != this.stepQuantity) {
                        BX.adjust(this.obPrice.total, {
                            html: BX.message('PRICE_TOTAL_PREFIX') + ' <strong>'
                            + BX.Currency.currencyFormat(price.PRICE * this.obQuantity.value, price.CURRENCY, true)
                            + '</strong>',
                            style: {display: ''}
                        });
                    }
                    else {
                        BX.adjust(this.obPrice.total, {
                            html: '',
                            style: {display: 'none'}
                        });

                    }

                }
            }
        },


        compare: function (event) {
            var checkbox = this.obCompare.querySelector('[data-entity="compare-checkbox"]'),
                target = BX.getEventTarget(event),
                checked = true;

            if (checkbox) {
                checked = target === checkbox ? checkbox.checked : !checkbox.checked;
            }

            var url = checked ? this.compareData.compareUrl : this.compareData.compareDeleteUrl,
                compareLink;

            if (url) {
                if (target !== checkbox) {
                    BX.PreventDefault(event);
                    this.setCompared(checked);
                }

                switch (this.productType) {
                    case 0: // no catalog
                    case 1: // product
                    case 2: // set
                        compareLink = url.replace('#ID#', this.product.id.toString());
                        break;
                    case 3: // sku
                        compareLink = url.replace('#ID#', this.offers[this.offerNum].ID);
                        break;
                }

                BX.ajax({
                    method: 'POST',
                    dataType: checked ? 'json' : 'html',
                    url: compareLink + (compareLink.indexOf('?') !== -1 ? '&' : '?') + 'ajax_action=Y',
                    onsuccess: checked
                        ? BX.proxy(this.compareResult, this)
                        : BX.proxy(this.compareDeleteResult, this)
                });
            }
        },

        compareResult: function (result) {
            var popupContent, popupButtons;

            if (this.obPopupWin) {
                this.obPopupWin.close();
            }

            if (!BX.type.isPlainObject(result))
                return;

            this.initPopupWindow();

            if (this.offers.length > 0) {
                this.offers[this.offerNum].COMPARED = result.STATUS === 'OK';
            }

            if (result.STATUS === 'OK') {
                BX.onCustomEvent('OnCompareChange');

                popupContent = '<div style="width: 100%; margin: 0; text-align: center;"><p>'
                    + BX.message('COMPARE_MESSAGE_OK')
                    + '</p></div>';

                if (this.config.showClosePopup) {
                    popupButtons = [
                        new BasketButton({
                            text: BX.message('BTN_MESSAGE_COMPARE_REDIRECT'),
                            events: {
                                click: BX.delegate(this.compareRedirect, this)
                            },
                            style: {marginRight: '10px'}
                        }),
                        new BasketButton({
                            text: BX.message('BTN_MESSAGE_CLOSE_POPUP'),
                            events: {
                                click: BX.delegate(this.obPopupWin.close, this.obPopupWin)
                            }
                        })
                    ];
                }
                else {
                    popupButtons = [
                        new BasketButton({
                            text: BX.message('BTN_MESSAGE_COMPARE_REDIRECT'),
                            events: {
                                click: BX.delegate(this.compareRedirect, this)
                            }
                        })
                    ];
                }
            }
            else {
                popupContent = '<div style="width: 100%; margin: 0; text-align: center;"><p>'
                    + (result.MESSAGE ? result.MESSAGE : BX.message('COMPARE_UNKNOWN_ERROR'))
                    + '</p></div>';
                popupButtons = [
                    new BasketButton({
                        text: BX.message('BTN_MESSAGE_CLOSE'),
                        events: {
                            click: BX.delegate(this.obPopupWin.close, this.obPopupWin)
                        }
                    })
                ];
            }

            this.obPopupWin.setTitleBar(BX.message('COMPARE_TITLE'));
            this.obPopupWin.setContent(popupContent);
            this.obPopupWin.setButtons(popupButtons);
            this.obPopupWin.show();
        },

        compareDeleteResult: function () {
            BX.onCustomEvent('OnCompareChange');

            if (this.offers && this.offers.length) {
                this.offers[this.offerNum].COMPARED = false;
            }
        },

        setCompared: function (state) {
            if (!this.obCompare)
                return;

            var checkbox = this.getEntity(this.obCompare, 'compare-checkbox');
            if (checkbox) {
                checkbox.checked = state;
            }
        },

        setCompareInfo: function (comparedIds) {
            if (!BX.type.isArray(comparedIds))
                return;

            for (var i in this.offers) {
                if (this.offers.hasOwnProperty(i)) {
                    this.offers[i].COMPARED = BX.util.in_array(this.offers[i].ID, comparedIds);
                }
            }
        },

        compareRedirect: function () {
            if (this.compareData.comparePath) {
                location.href = this.compareData.comparePath;
            }
            else {
                this.obPopupWin.close();
            }
        },

        checkDeletedCompare: function (id) {
            switch (this.productType) {
                case 0: // no catalog
                case 1: // product
                case 2: // set
                    if (this.product.id == id) {
                        this.setCompared(false);
                    }

                    break;
                case 3: // sku
                    var i = this.offers.length;
                    while (i--) {
                        if (this.offers[i].ID == id) {
                            this.offers[i].COMPARED = false;

                            if (this.offerNum == i) {
                                this.setCompared(false);
                            }

                            break;
                        }
                    }
            }
        },

        initBasketUrl: function () {
            this.basketUrl = (this.basketMode === 'ADD' ? this.basketData.add_url : this.basketData.buy_url);

            switch (this.productType) {
                case 1: // product
                case 2: // set
                    this.basketUrl = this.basketUrl.replace('#ID#', this.product.id.toString());
                    break;
                case 3: // sku
                    this.basketUrl = this.basketUrl.replace('#ID#', this.offers[this.offerNum].ID);
                    break;
            }

            this.basketParams = {
                'ajax_basket': 'Y'
            };

            if (this.config.showQuantity) {
                this.basketParams[this.basketData.quantity] = this.obQuantity.value;
            }

            if (this.basketData.sku_props) {
                this.basketParams[this.basketData.sku_props_var] = this.basketData.sku_props;
            }
        },

        fillBasketProps: function () {
            if (!this.visual.BASKET_PROP_DIV)
                return;

            var
                i = 0,
                propCollection = null,
                foundValues = false,
                obBasketProps = null;

            if (this.basketData.useProps && !this.basketData.emptyProps) {
                if (this.obPopupWin && this.obPopupWin.contentContainer) {
                    obBasketProps = this.obPopupWin.contentContainer;
                }
            }
            else {
                obBasketProps = BX(this.visual.BASKET_PROP_DIV);
            }

            if (obBasketProps) {
                propCollection = obBasketProps.getElementsByTagName('select');
                if (propCollection && propCollection.length) {
                    for (i = 0; i < propCollection.length; i++) {
                        if (!propCollection[i].disabled) {
                            switch (propCollection[i].type.toLowerCase()) {
                                case 'select-one':
                                    this.basketParams[propCollection[i].name] = propCollection[i].value;
                                    foundValues = true;
                                    break;
                                default:
                                    break;
                            }
                        }
                    }
                }

                propCollection = obBasketProps.getElementsByTagName('input');
                if (propCollection && propCollection.length) {
                    for (i = 0; i < propCollection.length; i++) {
                        if (!propCollection[i].disabled) {
                            switch (propCollection[i].type.toLowerCase()) {
                                case 'hidden':
                                    this.basketParams[propCollection[i].name] = propCollection[i].value;
                                    foundValues = true;
                                    break;
                                case 'radio':
                                    if (propCollection[i].checked) {
                                        this.basketParams[propCollection[i].name] = propCollection[i].value;
                                        foundValues = true;
                                    }
                                    break;
                                default:
                                    break;
                            }
                        }
                    }
                }
            }

            if (!foundValues) {
                this.basketParams[this.basketData.props] = [];
                this.basketParams[this.basketData.props][0] = 0;
            }
        },

        sendToBasket: function () {
            if (!this.canBuy)
                return;

            this.initBasketUrl();
            this.fillBasketProps();
            BX.ajax({
                method: 'POST',
                dataType: 'json',
                url: this.basketUrl,
                data: this.basketParams,
                onsuccess: BX.proxy(this.basketResult, this)
            });
        },

        add2Basket: function () {
            this.basketMode = 'ADD';
            this.basket();
        },

        buyBasket: function () {
            this.basketMode = 'BUY';
            this.basket();
        },

        basket: function () {
            var contentBasketProps = '';

            if (!this.canBuy)
                return;

            switch (this.productType) {
                case 1: // product
                case 2: // set
                    if (this.basketData.useProps && !this.basketData.emptyProps) {
                        this.initPopupWindow();
                        this.obPopupWin.setTitleBar(BX.message('TITLE_BASKET_PROPS'));

                        if (BX(this.visual.BASKET_PROP_DIV)) {
                            contentBasketProps = BX(this.visual.BASKET_PROP_DIV).innerHTML;
                        }

                        this.obPopupWin.setContent(contentBasketProps);
                        this.obPopupWin.setButtons([
                            new BasketButton({
                                text: BX.message('BTN_SEND_PROPS'),
                                events: {
                                    click: BX.delegate(this.sendToBasket, this)
                                }
                            })
                        ]);
                        this.obPopupWin.show();
                    }
                    else {
                        this.sendToBasket();
                    }
                    break;
                case 3: // sku
                    this.sendToBasket();
                    break;
            }
        },

        basketResult: function (arResult) {
            var popupContent, popupButtons, productPict;

            if (this.obPopupWin) {
                this.obPopupWin.close();
            }

            if (!BX.type.isPlainObject(arResult))
                return;

            if (arResult.STATUS === 'OK') {
                this.setAnalyticsDataLayer('addToCart');
            }

            if (arResult.STATUS === 'OK' && this.basketMode === 'BUY') {
                this.basketRedirect();
            }
            else {
                this.initPopupWindow();

                if (arResult.STATUS === 'OK') {
                    BX.onCustomEvent('OnBasketChange');
                    switch (this.productType) {
                        case 1: // product
                        case 2: // set
                            productPict = this.product.pict.SRC;
                            break;
                        case 3: // sku
                            productPict = this.offers[this.offerNum].PREVIEW_PICTURE
                                ? this.offers[this.offerNum].PREVIEW_PICTURE.SRC
                                : this.defaultPict.pict.SRC;
                            break;
                    }

                    popupContent = '<div style="width: 100%; margin: 0; text-align: center;">'
                        + '<img src="' + productPict + '" height="130" style="max-height:130px"><p>'
                        + this.product.name + '</p></div>';

                    if (this.config.showClosePopup) {
                        popupButtons = [
                            new BasketButton({
                                text: BX.message('BTN_MESSAGE_BASKET_REDIRECT'),
                                events: {
                                    click: BX.delegate(this.basketRedirect, this)
                                },
                                style: {marginRight: '10px'}
                            }),
                            new BasketButton({
                                text: BX.message('BTN_MESSAGE_CLOSE_POPUP'),
                                events: {
                                    click: BX.delegate(this.obPopupWin.close, this.obPopupWin)
                                }
                            })
                        ];
                    }
                    else {
                        popupButtons = [
                            new BasketButton({
                                text: BX.message('BTN_MESSAGE_BASKET_REDIRECT'),
                                events: {
                                    click: BX.delegate(this.basketRedirect, this)
                                }
                            })
                        ];
                    }
                }
                else {
                    popupContent = '<div style="width: 100%; margin: 0; text-align: center;"><p>'
                        + (arResult.MESSAGE ? arResult.MESSAGE : BX.message('BASKET_UNKNOWN_ERROR'))
                        + '</p></div>';
                    popupButtons = [
                        new BasketButton({
                            text: BX.message('BTN_MESSAGE_CLOSE'),
                            events: {
                                click: BX.delegate(this.obPopupWin.close, this.obPopupWin)
                            }
                        })
                    ];
                }

                this.obPopupWin.setTitleBar(arResult.STATUS === 'OK' ? BX.message('TITLE_SUCCESSFUL') : BX.message('TITLE_ERROR'));
                this.obPopupWin.setContent(popupContent);
                this.obPopupWin.setButtons(popupButtons);
                this.obPopupWin.show();
            }
        },

        basketRedirect: function () {
            location.href = (this.basketData.basketUrl ? this.basketData.basketUrl : BX.message('BASKET_URL'));
        },

        initPopupWindow: function () {
            if (this.obPopupWin)
                return;

            this.obPopupWin = BX.PopupWindowManager.create('CatalogElementBasket_' + this.visual.ID, null, {
                autoHide: false,
                offsetLeft: 0,
                offsetTop: 0,
                overlay: true,
                closeByEsc: true,
                titleBar: true,
                closeIcon: true,
                contentColor: 'white',
                className: this.config.templateTheme ? 'bx-' + this.config.templateTheme : ''
            });
        },

        incViewedCounter: function () {
            if (this.currentIsSet && !this.updateViewedCount) {
                switch (this.productType) {
                    case 1:
                    case 2:
                        this.viewedCounter.params.PRODUCT_ID = this.product.id;
                        this.viewedCounter.params.PARENT_ID = this.product.id;
                        break;
                    case 3:
                        this.viewedCounter.params.PARENT_ID = this.product.id;
                        this.viewedCounter.params.PRODUCT_ID = this.offers[this.offerNum].ID;
                        break;
                    default:
                        return;
                }

                this.viewedCounter.params.SITE_ID = BX.message('SITE_ID');
                this.updateViewedCount = true;
                BX.ajax.post(
                    this.viewedCounter.path,
                    this.viewedCounter.params,
                    BX.delegate(function () {
                        this.updateViewedCount = false;
                    }, this)
                );
            }
        },

        allowViewedCount: function (update) {
            this.currentIsSet = true;

            if (update) {
                this.incViewedCounter();
            }
        },

        fixFontCheck: function () {
            if (BX.type.isDomNode(this.obPrice.price)) {
                BX.FixFontSize && BX.FixFontSize.init({
                    objList: [{
                        node: this.obPrice.price,
                        maxFontSize: 28,
                        smallestValue: false,
                        scaleBy: this.obPrice.price.parentNode
                    }],
                    onAdaptiveResize: true
                });

            }
        }
    }
})(window);

//Работа блока скидок (переключение значений);
$(function () {
    $('body').on('click', '#deliveryCity', function () {
        let prop_name = "Доставка",
            prop_id = "delivery",
            item_id = $(this).data('id'),
            price = $(this).data('price')*1
        ;
        if($(this).is(':checked')){
            checkPreBasket([prop_id, item_id, price]);
        }else{
            delete (preBasket[prop_id]);
            if($('#installationMonument').is(':checked')){//Монтаж возможен только с доставкой
                $('#installationMonument').click();
            }
            if($('#installationTombstone').is(':checked')){//Монтаж возможен только с доставкой
                $('#installationTombstone').click();
            }
        }
        calculateSumm();
    });
    $('body').on('click', '#installationMonument', function () {
        let prop_name = "Монтаж памятника",
            prop_id = "installationMonument",
            item_id = $(this).data('id'),
            price = $(this).data('price')*1
        ;
        if($(this).is(':checked')){
            checkPreBasket([prop_id, item_id, price]);
        }else{
            delete (preBasket[prop_id]);
        }
        if(!$('#deliveryCity').is(':checked')){//Монтаж возможен только с доставкой
            $('#deliveryCity').click();
        }
        calculateSumm();
    });
    $('body').on('click', '#installationTombstone', function () {
        let prop_name = "Монтаж надгробия",
            prop_id = "installationTombstone",
            item_id = $(this).data('id'),
            price = $(this).data('price')*1
        ;
        if($(this).is(':checked')){
            checkPreBasket([prop_id, item_id, price]);
        }else{
            delete (preBasket[prop_id]);
        }
        if(!$('#deliveryCity').is(':checked')){//Монтаж возможен только с доставкой
            $('#deliveryCity').click();
        }
        calculateSumm();
    });
    $('body').on('click', '.discont label', function () {
		var name = $(this).prop('for');
        if ($('input[name="' + name +'"]').prop("checked")) {
            $.post('/local/ajax/ajax.php', {action: "installment", installment: 'false'});
            var coupon = 0;
            $.post('/local/ajax/ajax.php', {action: "discount", coupon: coupon}/*, function (data) {console.log (data)}*/);
            $('.discont input#partial').prop("checked", true);
        } else {
            if (name == 'installment') {
                $.post('/local/ajax/ajax.php', {action: "installment", installment: 'true'});
            } else {
                $.post('/local/ajax/ajax.php', {action: "installment", installment: 'false'});
            }
            $('.discont input').prop("checked", false);
            if (name == 'pension') {
                $('.discont input#partial').prop("checked", true);
            }
        };
	});

    $('body').on('click', '.installment_question', function (e) {
         e.preventDefault();
        $('.installment_answer').css({'display':'block'});
    });
    $('body').on('click', '.installment_answer .close-btn', function (e) {
        e.preventDefault();
        $('.installment_answer').css({'display':'none'});
    });

    $('body').on('click', 'label[data-entity="addProps"]', function () {


		
        var name = $(this).data('name'),
            prop_name = $(this).data('prop-name'),
            prop_id = $(this).data('prop-id'),
            item_id = $(this).data('item-id'),
            price = $(this).data('prices'),
            variant = $(this).data('variant'),
            block = '',
            button_block = '',
            addText = ''
        ;

		

        var priceFormatted = BX.Currency.currencyFormat(price, 'руб.', true);

        var check = checkPreBasket([prop_id, item_id, price]);
        if(variant!="" && typeof(variant) != 'undefined'){
            let checkMontagNadgrobie = false;
            if($('.installation .form-checkbox input[data-id="'+arrayMontageNadgrobie[variant].ID+'"]').is(':checked')){
                checkMontagNadgrobie = true;
            }
            $('.installation .form-checkbox').eq(1).html('<input type="checkbox" '+checkMontagNadgrobie+' name="installationTombstone" data-id="'+arrayMontageNadgrobie[variant].ID+'" data-price="'+arrayMontageNadgrobie[variant].PRICE+'" id="installationTombstone">\n' +
                '<label for="installationTombstone" title="Монтаж надгробия">Монтаж надгробия <b>'+arrayMontageNadgrobie[variant].PRICE*1+' <i class="fa fa-rub" aria-hidden="true"></i></b></label>');
            if(checkMontagNadgrobie){
                console.log(checkMontagNadgrobie);
                $('#installationTombstone').click();
            }
        }else{
            $('.installation .form-checkbox').eq(1).empty();
            calculateSumm();
        }


        switch (check) {
            // Удаление товара
            case 0:
                $('button[data-prop-id="' + prop_id + '"]').remove();
                $('.product__order-row[data-prop-id="' + prop_id + '"]').remove();
                getDiscounts();
                break;
            // Замещение товара
            case 1:
                if (prop_id == 'nadgrobie') {
                    addText = '<strong>Надгробие - </strong> ';
                }
                block = '<div class="product__order-row" data-prop-id="' + prop_id + '" data-prices="' + price + '">\n' +
					'		 <button class="product__order-del" type="button" data-prop-id="' + prop_id + '" data-prices="' + price + '"></button>' +
                    '        <span class="product__order-name">' + addText + name + '</span>\n' +
                    '        <span class="product__order-qnt"></span>\n' +
                    '        <span class="product__order-price">' + price + ' руб.</span>\n' +
                    '     </div>';
                $('.product__order-row[data-prop-id="' + prop_id + '"]').replaceWith(block);
				getDiscounts();
                break;
            // Добавление товара
            case 2:
                if (prop_id == 'nadgrobie') {
                    addText = '<strong>Надгробие - </strong> ';
                }
                block = '<div class="product__order-row" data-prop-id="' + prop_id + '" data-prices="' + price + '">\n' +
					'		<button class="product__order-del" type="button" data-prop-id="' + prop_id + '" data-prices="' + price + '"></button>' +
                    '        <span class="product__order-name">' + addText + name + '</span>\n' +
                    '        <span class="product__order-qnt"></span>\n' +
                    '        <span class="product__order-price">' + price + ' руб.</span>\n' +
                    '     </div>';
                $('.product__order-row:last').after(block);

				getDiscounts();
                break;
            // Ничего не делаем
            case 3:

                break;
        }
        calculateSumm();
    });

    $('label[data-skidka]').click(function () {
        setTimeout(function () {
            var count = $(".product__order-qnt[data-quantity]").attr('data-quantity');
            countQuantity(count);
        }, 100);
    })


    /*
     *  Добавить в корзину
     */

    $('.product__btn[data-add="1"]').on('click', function (e) {
        e.preventDefault();
        var error = 0;
        var products = [];
		var coupon = $('.discont input:checked').attr("name");

		if (coupon) {
			$.post('/local/ajax/ajax.php', {action: "discount", coupon: coupon});
		};

        if (currentSKU.length > 0) {
            var countSCU = $('.product__order-row .product__order-qnt').text() * 1;
            if (typeof(inMeters) != 'undefined' && inMeters) {
                var m_length = $('[data-type="meter-length"]').val();
                var m_width = $('[data-type="meter-width"]').val();
                var field = 0;
                var price = $('[data-prices]').data('prices');
                var summ = 0;
                //console.log(m_length+'--'+m_width);

                if (m_length * 1 > 0 && m_width * 1 > 0) {
                    field = (m_length * 1 + m_width * 1) * 2;
                    summ = field * price;
                }

                if (field >= 6) {
                    $('[data-add="1"]').replaceWith('<button class="btn" type="submit" data-add="2">Перейти в корзину</button>');
				    $('body').on('click','[data-add="2"]',function(p){
					    p.preventDefault();
					    goToCard();
				    })                    
                    
                    $('.product__buy-link').remove();
                } else {
                    $('.error-block').slideDown('slow');
                    return false;
                    alert(field);
                }
            }else{
	            $('[data-add="1"]').replaceWith('<button class="btn  product__btn" type="submit" data-add="2">Перейти в корзину</button>');
	            $('body').on('click','[data-add="2"]',function(p){
					p.preventDefault();
					goToCard();
				})   
                $('.product__buy-link').remove();
            }
            products[products.length] = {"count": countSCU, "id": currentSKU * 1};
            if (preBasket.length > 0 || preBasket.nadgrobie || preBasket.delivery || preBasket.installationMonument || preBasket.installationTombstone) {
                for (preb in preBasket) {
                    products[products.length] = {"count": 1, "id": preBasket[preb].item_id};
                }
            }
            console.log(preBasket);
            $.post('/local/ajax/basket.php', {action: "add2Basket", products: products}, function (data) {
                $('#product-succes').fadeIn(500);
                $('body').append('<div class="overlay" id="js-overlay"></div>');
                
                $.post('/local/includes/header/basket.php',{},function(data2){
	               	$('.headerbar__basket').replaceWith(data2); 
                });
                
                $.post('/local/includes/header/basket_mobile.php',{},function(data3){
	               	$('a.basket-mobile').replaceWith(data3); 
                });

                setTimeout(function () {
                    $('#product-succes').fadeOut(100);
                    $('#js-overlay').remove();
                }, 2000);
            })

        } else {
            alert('Возникла ошибка');
        }

    });
    

    $('.product__size-item input').change(function () {
        calculateMeters();
    });

    $(".product__size-item input").keyup(function (event) {
        // Разрешаем: backspace, delete, tab и escape
        if (event.keyCode == 46 || event.keyCode == 8 || event.keyCode == 9 || event.keyCode == 27 ||
            // Разрешаем: Ctrl+A
            (event.keyCode == 65 && event.ctrlKey === true) ||
            // Разрешаем: home, end, влево, вправо
            (event.keyCode >= 35 && event.keyCode <= 39)) {
            // Ничего не делаем
            return;
        }
        else {
            // Обеждаемся, что это цифра, и останавливаем событие keypress
            if ((event.keyCode < 48 || event.keyCode > 57) && (event.keyCode < 96 || event.keyCode > 105)) {
                event.preventDefault();
            }
        }
        calculateMeters();
    });

    $(".value-reduce").click(
        function () {
            if ($(this).data('type')=="data-quantity") {
                if ($("#data-quantity").val() > 1) {
                    $("#data-quantity").val(parseInt($("#data-quantity").val()) - 1);
                    $("#data-quantity").change();
                }
            } else {
                var data_type = $(this).data('id');
                data_type = "#" + data_type;
                var value = $(data_type).val();
                value = parseFloat(value);
                value = value - 0.2;
                value = parseFloat(value);
                value = value.toFixed(1);
                $(data_type).val(value);
                $(data_type).attr('value', value);
                $(data_type).change();
            }
        }
    )

    $(".value-increase").click(
        function () {
            if ($(this).data('type')=="data-quantity") {
                $("#data-quantity").val(parseInt($("#data-quantity").val()) + 1);
                $("#data-quantity").change();
            } else {
                var data_type = $(this).data('id');
                data_type = "#" + data_type;
                var value = $(data_type).val();
                value = parseFloat(value);
                value = value + 0.2;
                value = parseFloat(value);
                value = value.toFixed(1);
                $(data_type).val(value);
                $(data_type).attr('value', value);
                $(data_type).change();
            }
        }
    )
});

function checkPreBasket(data) {
    var data = data || [];
    if (data.length) {
        if (typeof(preBasket[data[0]]) != 'undefined') {
            if (data[1] == 0) {
                delete(preBasket[data[0]]);
                return 0;
            } else {
                preBasket[data[0]] = {
                    "item_id": data[1],
                    "price": data[2]
                }
                return 1;
            }
        } else {
            if (data[1] > 0) {
                preBasket[data[0]] = {
                    "item_id": data[1],
                    "price": data[2]
                }
                return 2;
            } else {
                return 3;
            }
        }
    }

};



function calculateSumm(koeff, summ) {
    var summ = summ || 1;
    var koeff = koeff || 0;
    var allSumm = offerPrice * summ;

	var priceSumm;

    $('.product__order-row [data-prices]').each(function (summ) {
        var price = $(this).data('prices') * 1;
        allSumm += price;
    });




    var oldSumm = allSumm;

    if ($('.out_discount_price span').attr("data-price-old") && $('.out_discount_price span').attr("data-price-new")) {
        var price_old = $('.out_discount_price span').attr("data-price-old");
        var price_new = $('.out_discount_price span').attr("data-price-new");

        allSumm = Math.floor(allSumm) - (Math.floor(price_old)*summ) + (Math.floor(price_new)*summ);
    }


    priceSumm = (BX.Currency.currencyFormat(oldSumm, 'RUB', true));
    $('#PRICE_SUMM span').text(priceSumm);
    /*Добавляем доставку*/
    if($("#deliveryCity").is(':checked')){
        let priceDelivery = $("#deliveryCity").data('price') * 1;
        allSumm += priceDelivery;
    }
    if($("#installationMonument").is(':checked')){
        let priceMontage = $("#installationMonument").data('price') * 1;
        allSumm += priceMontage;
    }
    if($("#installationTombstone").is(':checked')){
        let priceInstallationTombstone = $("#installationTombstone").data('price') * 1;
        allSumm += priceInstallationTombstone;
    }
    installmentSumm = Math.ceil(allSumm/12);
    allSumm = allSumm - (allSumm * koeff);
    allSumm = Math.floor(allSumm);
    allSumm = (BX.Currency.currencyFormat(allSumm, 'RUB', true));
    $('.product__order-total-sum span').html(allSumm + ' <i class="fa fa-rub" aria-hidden="true"></i>');
    $('.span_installment').html('' + installmentSumm + ' <i class="fa fa-rub" aria-hidden="true"></i>/мес.');

    if ($('.out_discount_price span').attr("data-price-old") && $('.out_discount_price span').attr("data-price-new")) {
        oldSumm = (BX.Currency.currencyFormat(oldSumm, 'RUB', true));
        $('.out_discount_price span').html(oldSumm + ' <i class="fa fa-rub" aria-hidden="true"></i>');
    }
}

function getDiscounts(summ) {
	var summ2 = summ || 1;
    var allDiscount = 0;
    $('input[data-skidka]:checked').each(function () {
        var discount = $(this).data('skidka');
        allDiscount = allDiscount + discount * 1;
    });
    calculateSumm(allDiscount, summ2);
}

function calculateMeters() {
    var m_length = $('[data-type="meter-length"]').val();
    var m_width = $('[data-type="meter-width"]').val();
    var field = 0;
    var price = $('[data-price]').data('prices');
    var summ = 0;
    //console.log(m_length+'--'+m_width);

    if (m_length * 1 > 0 && m_width * 1 > 0) {
        field = (m_length * 1 + m_width * 1) * 2;
        summ = field * price;
    }

    /*  Минимальный заказ 6 погонных метров */
    if (field >= 6) {
        $('p.product__price').html(summ.toFixed(0) + ' <i class="fa fa-rub" aria-hidden="true"></i>');
        $('p.product__area').html(field.toFixed(2) + ' м (' + m_length + ' + ' + m_width + ') x 2');
        $('.product__order-row .product__order-qnt').text(field.toFixed(2)).attr('data-quantity', field.toFixed(2)); ;
        //$('.product__order-row .product__order-price').text(summ.toFixed(0));
		getDiscounts(field.toFixed(2));
        //$('#PRICE_SUMM span').text(summ.toFixed(0) + ' руб.');
        //$('.product__order-total-sum span').html(summ.toFixed(0) + '<i class="fa fa-rub" aria-hidden="true"></i>');
        $('.error-block').slideUp('slow');
        return false;
    } else {
        $('.error-block').slideDown('slow');
    }

}

function goToCard(){
    /*Переход в корзину*/
	document.location.href="/personal/card/";
}



$(function () {
    /*Удаляем товар из правого блока*/
    $('body').on('click', 'button[class="product__order-del"]', function () {

        var name = $(this).data('name'),
            prop_name = $(this).data('prop-name'),
            prop_id = $(this).data('prop-id'),
            item_id = $(this).data('item-id'),
            price = $(this).data('prices'),
            block = '',
            button_block = '',
            addText = ''
        ;


	   if (prop_id == 'nadgrobie') {
			$('input[name="tombstone"]').prop('checked', false);
			$('.selection__radio--none > input[name="tombstone"]').prop('checked', true);
		}
		else {
			$('input[data-id="'+ prop_id +'"]').prop('checked', false);
			$('.selection__radio--none > input[name="service_'+ prop_id +'"]').prop('checked', true);

		}  
		delete (preBasket[prop_id]);
		$('button[data-prop-id="' + prop_id + '"]').remove();
		$('.product__order-row[data-prop-id="' + prop_id + '"]').remove();

		getDiscounts();

	});

	$('.product__quantity-item input').change(function () {
		countQuantity();
		//console.log ('q12');
	});

    $(".product__quantity-item input").keyup(function (event) {
        // Разрешаем: backspace, delete, tab и escape
        if (event.keyCode == 46 || event.keyCode == 8 || event.keyCode == 9 || event.keyCode == 27 ||
            // Разрешаем: Ctrl+A
            (event.keyCode == 65 && event.ctrlKey === true) ||
            // Разрешаем: home, end, влево, вправо
            (event.keyCode >= 35 && event.keyCode <= 39)) {
            // Ничего не делаем
            return;
        }
        else {
            // Обеждаемся, что это цифра, и останавливаем событие keypress
            if ((event.keyCode < 48 || event.keyCode > 57) && (event.keyCode < 96 || event.keyCode > 105)) {
                event.preventDefault();
            }
        }
        countQuantity();
    });
});


function countQuantity(){
    var quantity = $('#data-quantity[data-type="data-quantity"]').val() || $('.product__order-qnt[data-quantity]').attr('data-quantity') || 1;
    var price = $('[data-price]').data('prices');
	var summ = quantity * price;
	if (quantity > 1) {
		$('.product__order-row .product__order-qnt').text(quantity);
		getDiscounts(quantity);
		//$('#PRICE_SUMM span').text(summ.toFixed(0) + ' руб.');
		//$('.product__order-total-sum span').html(summ.toFixed(0) + '<i class="fa fa-rub" aria-hidden="true"></i>');
	} else { 
		if (quantity = 1) {
			$('.product__order-row .product__order-qnt:first').text(quantity);
			getDiscounts(quantity);
		};
	}
};
/*$(function () {
    $('.selection__radio[data-nadgrobia="nadgrobia"]').on('click', function () {
        var onevalue = $(this).data('onevalue');
        $.post('/local/ajax/ajax.php', {
            action: "changeNadgrobia",
            ixm_id: arrayNadgrobia[onevalue],
            mestorozdenie: arrayNadgrobia['mestoroz'],
            variants: arrayNadgrobia['variants']
        }, function (data) {
            $('.selection__radio--tombstone').remove();
            $('.nadgrobia').html(data);
        });
    })
    $('.bx-catalog-element').remove();
});*/


////* imagelightbox */////

$(function () {

    // ACTIVITY INDICATOR

        activityIndicatorOn = function () {
            $('<div id="imagelightbox-loading"><div></div></div>').appendTo('body');
        },
        activityIndicatorOff = function () {
            $('#imagelightbox-loading').remove();
        },


        // OVERLAY

        overlayOn = function () {
            $('<div id="imagelightbox-overlay"></div>').appendTo('body');
        },
        overlayOff = function () {
            $('#imagelightbox-overlay').remove();
        },


        // CLOSE BUTTON

        closeButtonOn = function (instance) {
            $('<button type="button" id="imagelightbox-close" title="Close"></button>').appendTo('body').on('click touchend', function () {
                $(this).remove();
                instance.quitImageLightbox();
                return false;
            });
        },
        closeButtonOff = function () {
            $('#imagelightbox-close').remove();
        },


        // CAPTION

        captionOn = function () {
            var description = $('a[href="' + $('#imagelightbox').attr('src') + '"] img').attr('alt');
            if (!description) {
                description = $('#first-photo img').attr('alt');

            }
            ;
            if (description.length > 0)
                $('<div id="imagelightbox-caption">' + description + '</div>').appendTo('body');
        },
        captionOff = function () {
            $('#imagelightbox-caption').remove();
        },


        // NAVIGATION

        navigationOn = function (instance, selector) {
            var images = $(selector);
            if (images.length) {
                var nav = $('<div id="imagelightbox-nav"></div>');
                for (var i = 0; i < images.length; i++)
                    nav.append('<button type="button"></button>');

                nav.appendTo('body');
                nav.on('click touchend', function () {
                    return false;
                });

                var navItems = nav.find('button');
                navItems.on('click touchend', function () {
                    var $this = $(this);
                    if (images.eq($this.index()).attr('href') != $('#imagelightbox').attr('src'))
                        instance.switchImageLightbox($this.index());

                    navItems.removeClass('active');
                    navItems.eq($this.index()).addClass('active');

                    return false;
                })
                    .on('touchend', function () {
                        return false;
                    });
            }
        },
        navigationUpdate = function (selector) {
            var items = $('#imagelightbox-nav button');
            items.removeClass('active');
            items.eq($(selector).filter('[href="' + $('#imagelightbox').attr('src') + '"]').index(selector)).addClass('active');
        },
        navigationOff = function () {
            $('#imagelightbox-nav').remove();
        },


        // ARROWS

        arrowsOn = function (instance, selector) {
            var $arrows = $('<button type="button" class="imagelightbox-arrow imagelightbox-arrow-left"></button><button type="button" class="imagelightbox-arrow imagelightbox-arrow-right"></button>');

            $arrows.appendTo('body');

            $arrows.on('click touchend', function (e) {
                e.preventDefault();

                var $this = $(this),
                    $target = $(selector + '[href="' + $('#imagelightbox').attr('src') + '"]'),
                    index = $target.index(selector);

                if ($this.hasClass('imagelightbox-arrow-left'))
                {
                    index = index - 1;
                    if (index < 0) {
                        index = $(selector).length - 1;
                    }
                }
                else {
                    index = index + 1;
                    if (index >= $(selector).length) {
                        index = 0;
                    }
                }

                instance.switchImageLightbox(index);
                return false;
            });
        },
        arrowsOff = function () {
            $('.imagelightbox-arrow').remove();
        };

    selectorF = 'a[data-imagelightbox="f"]';
    instanceF = $(selectorF).imageLightbox(
        {
            onStart: function () {
                navigationOn(instanceF, selectorF);
                overlayOn();
                closeButtonOn(instanceF);
                arrowsOn(instanceF, selectorF);
            },
            onEnd: function () {
                navigationOff();
                overlayOff();
                captionOff();
                closeButtonOff();
                arrowsOff();
                activityIndicatorOff();
            },
            onLoadStart: function () {
                captionOff();
                activityIndicatorOn();
            },
            onLoadEnd: function () {
                navigationUpdate(selectorF);
                captionOn();
                activityIndicatorOff();
                $('.imagelightbox-arrow').css('display', 'block');
            }
        });

});


$(function () {
    $('.click_photo').on('click', function () {
        var url = $(this).children('img').attr('src');
        var url_gen = $('#first-photo').attr('href');

        $('#first-photo').attr('href', url);
        $('#first-photo img').attr('src', url);
        $(this).children('img').attr('src', url_gen);
        $(this).children('a').attr('href', url_gen);
    });


    $('#meter-length').on('click', function () {
        if ($(this).val() == '0') {
            $(this).val('');
        }
    });

    $('#meter-width').on('click', function () {
        if ($(this).val() == '0') {
            $(this).val('');
        }
    });

    if ($('.selection__radio--sm.selected').is('[data-all-storon="y"]')) {
        $('.product__addit-item[data-prop-id="grav"]').removeClass('hidden');
    }

    $("#meter-length").keydown(function(event){
        if(event.keyCode == 13){
            event.preventDefault();
            return false;
        }
    });
    $("#meter-width").keydown(function(event){
        if(event.keyCode == 13){
            event.preventDefault();
            return false;
        }
    });


});
