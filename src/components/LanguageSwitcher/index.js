import React from 'react';

// Application dependencies
import {
    useTranslate,
    useTranslateDispatch,
    useTranslateState
} from "../translate/index";
import './style.css';
import {Button} from "primereact/components/button/Button";

function LanguageSwitcher() {
    const { language } = useTranslateState(); // we get the current language
    const i18n = useTranslate(); // we get the utils functions
    const { t, getLanguages } = i18n;
    const dispatch = useTranslateDispatch();

    const items = getLanguages().map(key => {

        let nextKey = "en";

        if(key === "en"){
            nextKey = "ru"
        }


        return key === language ? (
            <Button
                key={key}
                onClick={() => {
                    dispatch({ type: 'CHANGE_LANGUAGE', language: nextKey });
                }}
            >
                {t(`LanguageSwitcher.${key}`)}
            </Button>
        ) : (
            ''
        );
    });

    return (
        <section>
            <span>{items}</span>
        </section>
    );
}

export default LanguageSwitcher;
