// src/screens/HelloWorld/index.js

import React from 'react';
import './style.css';
import { useTranslate } from  "../index";
import LanguageSwitcher from "../../LanguageSwitcher";


function HelloWorld() {
    const i18n = useTranslate();
    const { t } = i18n;

    return (
        <span className="HelloWorld">
      <header>
        <h1>{t('Application.title')}</h1>
        <h2>{t('Application.subTitle')}</h2>
      </header>
      <main>
        <LanguageSwitcher></LanguageSwitcher>
      </main>

      <footer>{t('Application.footer')}</footer>
    </span>
    );
}

export default HelloWorld;
