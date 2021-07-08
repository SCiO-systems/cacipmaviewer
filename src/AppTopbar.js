import React, {useState} from 'react';
import classNames from 'classnames';
import AppBreadcrumb from './AppBreadcrumb';
import {Dropdown} from "primereact/components/dropdown/Dropdown";
import LanguageSwitcher from "./components/LanguageSwitcher";




const AppTopbar = (props) => {
    return (
        <div className="layout-topbar">
            <div className="topbar-left">
                <button type="button" className="menu-button p-link" onClick={props.onMenuButtonClick}>
                    <i className="pi pi-chevron-left"></i>
                </button>
                <span className="topbar-separator"></span>

                <div className="layout-breadcrumb viewname" style={{ textTransform: 'uppercase' }}>
                    <AppBreadcrumb routers={props.routers} />
                </div>

                <img id="logo-mobile" className="mobile-logo" src="assets/layout/images/mapviewer_logo.png" alt="diamond-layout" />
            </div>

            <div>
                <LanguageSwitcher></LanguageSwitcher>
            </div>
        </div>
    );
}

export default AppTopbar;
