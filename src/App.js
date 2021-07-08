import React, { useState, useEffect } from 'react';
import classNames from 'classnames';
import { Route } from 'react-router-dom';
import { useHistory } from "react-router-dom";

import AppTopBar from './AppTopbar';
import AppFooter from './AppFooter';
import AppMenu from './AppMenu';

import PrimeReact from 'primereact/utils';

import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';
import './App.scss';
import {MapDashboard} from "./components/MapDashboard";
import {TranslateProvider, useTranslate} from "./components/translate";

const App = () => {

    const [menuActive, setMenuActive] = useState(false);
    const [menuMode, setMenuMode] = useState('static');
    const [colorScheme, setColorScheme] = useState('light');
    const [menuTheme, setMenuTheme] = useState('layout-sidebar-darkgray');
    const [overlayMenuActive, setOverlayMenuActive] = useState(false);
    const [staticMenuDesktopInactive, setStaticMenuDesktopInactive] = useState(false);
    const [staticMenuMobileActive, setStaticMenuMobileActive] = useState(false);
    const [searchActive, setSearchActive] = useState(false);
    const [topbarUserMenuActive, setTopbarUserMenuActive] = useState(false);
    const [topbarNotificationMenuActive, setTopbarNotificationMenuActive] = useState(false);
    const [rightMenuActive, setRightMenuActive] = useState(false);
    const [configActive, setConfigActive] = useState(false);
    const [inputStyle, setInputStyle] = useState('outlined');
    const [ripple, setRipple] = useState(false);

    let menuClick = false;
    let searchClick = false;
    let userMenuClick = false;
    let notificationMenuClick = false;
    let rightMenuClick = false;
    let configClick = false;

    const history = useHistory();
    const i18n = useTranslate();
    const { t } = i18n;


    const menu = [

        {
            label: t(`Application.explore`), icon: "fad fa-binoculars",
            items: [
                { label: t(`Application.dashboard`), icon: "fad fa-layer-group", to: "/" }
            ]
        },
        { separator: true },
        {
            label: t(`Application.additionalTools`), icon: "fad fa-tools",
            items: [
                {
                    label: t(`Application.cacip`),
                    icon: "fad fa-database",
                    command: ()=> {
                        window.open(t(`Application.cacipLink`), '_blank');
                    }
                },
                {
                    label: "WUEMOCA",
                    icon: "fad fa-tools",
                    command: ()=> {
                        window.open(t(`Application.wuemocaLink`), '_blank');
                    }
                },
                {
                    label: "Soilgrids",
                    icon: "fad fa-tools",
                    command: ()=> {
                        window.open(t(`Application.soilgridsLink`), '_blank');
                    }
                },
                {
                    label: t(`Application.currentWeather`),
                    icon: "fad fa-tools",
                    command: ()=> {
                        window.open(t(`Application.currentWeatherLink`), '_blank');
                    }
                },
                {
                    label: t(`Application.agriculture`),
                    icon: "fad fa-tools",
                    command: ()=> {
                        window.open(t(`Application.agricultureLink`), '_blank');
                    }
                },
                {
                    label: t(`Application.centralAsiaClimateDynamics`),
                    icon: "fad fa-tools",
                    command: ()=> {
                        window.open(t(`Application.centralAsiaClimateDynamicsLink`), '_blank');
                    }
                },
                {
                    label: t(`Application.globalReservoirsLakesMonitor`),
                    icon: "fad fa-tools",
                    command: ()=> {
                        window.open(t(`Application.globalReservoirsLakesMonitorLink`), '_blank');
                    }
                },
                {
                    label: t(`Application.moreTools`),
                    icon: "fad fa-angle-double-right",
                    command: ()=> {
                        window.open(t(`Application.moreToolsLink`), '_blank');
                    }
                }
            ]
        }
    ];

    const routers = [
        { path: '/', component: MapDashboard, exact: true, meta: { breadcrumb: [{ parent:  t(`Application.dashboard`), label: t(`Application.mapDashboard`) }] } },
        { path: '/geonode', component: MapDashboard, exact: true, meta: { breadcrumb: [{ parent:  t(`Application.dashboard`), label: 'About the tool' }] } },
        { path: '/climatedynamics', component: MapDashboard, exact: true, meta: { breadcrumb: [{ parent: 'Dashboard', label: 'About the tool' }] } },
        { path: '/waterproductivity', component: MapDashboard, exact: true, meta: { breadcrumb: [{ parent: 'Dashboard', label: 'About the tool' }] } }

    ];

    useEffect(() => {
        if (staticMenuMobileActive) {
            blockBodyScroll();
        }
        else {
            unblockBodyScroll();
        }
    }, [staticMenuMobileActive]);

    const onInputStyleChange = (inputStyle) => {
        setInputStyle(inputStyle);
    };

    const onRippleChange = (e) => {
        PrimeReact.ripple = e.value;
        setRipple(e.value);
    };

    const onDocumentClick = () => {
        if (!searchClick && searchActive) {
            onSearchHide();
        }

        if (!userMenuClick) {
            setTopbarUserMenuActive(false);
        }

        if (!notificationMenuClick) {
            setTopbarNotificationMenuActive(false);
        }

        if (!rightMenuClick) {
            setRightMenuActive(false);
        }

        if (!menuClick) {
            if (isSlim()) {
                setMenuActive(false);
            }

            if (overlayMenuActive || staticMenuMobileActive) {
                hideOverlayMenu();
            }

            unblockBodyScroll();
        }

        if (configActive && !configClick) {
            setConfigActive(false);
        }

        searchClick = false;
        configClick = false;
        userMenuClick = false;
        rightMenuClick = false;
        notificationMenuClick = false;
        menuClick = false;
    };

    const onMenuClick = () => {
        menuClick = true;
    };

    const onMenuButtonClick = (event) => {
        menuClick = true;
        setTopbarUserMenuActive(false);
        setTopbarNotificationMenuActive(false);
        setRightMenuActive(false);

        if (isOverlay()) {
            setOverlayMenuActive(prevOverlayMenuActive => !prevOverlayMenuActive);
        }

        if (isDesktop()) {
            setStaticMenuDesktopInactive(prevStaticMenuDesktopInactive => !prevStaticMenuDesktopInactive);
        }
        else {
            setStaticMenuMobileActive(prevStaticMenuMobileActive => !prevStaticMenuMobileActive);
        }

        event.preventDefault();
    };

    const onMenuitemClick = (event) => {
        if (!event.item.items) {
            hideOverlayMenu();

            if (isSlim()) {
                setMenuActive(false);
            }
        }
    };

    const onRootMenuitemClick = () => {
        setMenuActive(prevMenuActive => !prevMenuActive);
    };

    const onMenuThemeChange = (name) => {
        setMenuTheme('layout-sidebar-' + name);
    };

    const onMenuModeChange = (e) => {
        setMenuMode(e.value);
    };

    const onColorSchemeChange = (e) => {
        setColorScheme(e.value);
    };

    const onTopbarUserMenuButtonClick = (event) => {
        userMenuClick = true;
        setTopbarUserMenuActive(prevTopbarUserMenuActive => !prevTopbarUserMenuActive);

        hideOverlayMenu();

        event.preventDefault();
    };

    const onTopbarNotificationMenuButtonClick = (event) => {
        notificationMenuClick = true;
        setTopbarNotificationMenuActive(prevTopbarNotificationMenuActive => !prevTopbarNotificationMenuActive);

        hideOverlayMenu();

        event.preventDefault();
    };

    const toggleSearch = () => {
        setSearchActive(prevSearchActive => !prevSearchActive);
        searchClick = true;
    };

    const onSearchClick = () => {
        searchClick = true;
    };

    const onSearchHide = () => {
        setSearchActive(false);
        searchClick = false;
    };

    const onRightMenuClick = () => {
        rightMenuClick = true;
    };

    const onRightMenuButtonClick = (event) => {
        rightMenuClick = true;
        setRightMenuActive(prevRightMenuActive => !prevRightMenuActive);
        hideOverlayMenu();
        event.preventDefault();
    };

    const onConfigClick = () => {
        configClick = true;
    };

    const onConfigButtonClick = () => {
        setConfigActive(prevConfigActive => !prevConfigActive);
        configClick = true;
    };

    const hideOverlayMenu = () => {
        setOverlayMenuActive(false);
        setStaticMenuMobileActive(false);
        unblockBodyScroll();
    };

    const blockBodyScroll = () => {
        if (document.body.classList) {
            document.body.classList.add('blocked-scroll');
        }
        else {
            document.body.className += ' blocked-scroll';
        }
    };

    const unblockBodyScroll = () => {
        if (document.body.classList) {
            document.body.classList.remove('blocked-scroll');
        }
        else {
            document.body.className = document.body.className.replace(new RegExp('(^|\\b)' +
                'blocked-scroll'.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
        }
    };

    const isSlim = () => {
        return menuMode === "slim";
    };

    const isOverlay = () => {
        return menuMode === "overlay";
    };

    const isDesktop = () => {
        return window.innerWidth > 991;
    };

    const containerClassName = classNames('layout-wrapper',
        {
            'layout-overlay': menuMode === "overlay",
            'layout-static': menuMode === "static",
            'layout-slim': menuMode === "slim",
            'layout-sidebar-dim': colorScheme === "dim",
            'layout-sidebar-dark': colorScheme === "dark",
            'layout-overlay-active': overlayMenuActive,
            'layout-mobile-active': staticMenuMobileActive,
            'layout-static-inactive': staticMenuDesktopInactive && menuMode === "static",
            'p-input-filled': inputStyle === "filled",
            'p-ripple-disabled': !ripple,
        },
        colorScheme === 'light' ? menuTheme : '');

    return (

        <div className={containerClassName} data-theme={colorScheme} onClick={onDocumentClick}>
            <div className="layout-content-wrapper">
                <AppTopBar routers={routers} topbarNotificationMenuActive={topbarNotificationMenuActive} topbarUserMenuActive={topbarUserMenuActive} onMenuButtonClick={onMenuButtonClick} onSearchClick={toggleSearch}
                    onTopbarNotification={onTopbarNotificationMenuButtonClick} onTopbarUserMenu={onTopbarUserMenuButtonClick} onRightMenuClick={onRightMenuButtonClick} onRightMenuButtonClick={onRightMenuButtonClick}></AppTopBar>

                <div className="layout-content">
                    {
                        routers.map((router, index) => {
                            if (router.exact) {
                                return <Route key={`router${index}`} path={router.path} exact component={router.component} />
                            }

                            return <Route key={`router${index}`} path={router.path} component={router.component} />
                        })
                    }
                </div>
                <AppFooter />
            </div>

            <AppMenu model={menu} menuMode={menuMode} active={menuActive} mobileMenuActive={staticMenuMobileActive} onMenuClick={onMenuClick} onMenuitemClick={onMenuitemClick} onRootMenuitemClick={onRootMenuitemClick}></AppMenu>


            <div className="layout-mask modal-in"></div>
        </div>
    );
}

export default App;
