import React, { createContext, useContext, useReducer } from 'react';

import {
    getCurrentLanguage,
    setCurrentLanguage,
    getFallbackLanguage,
    setFallbackLanguage,
    getLanguages,
    setLanguages,
    getTranslations,
    setTranslations,
    t
} from './Translate';

// Configuration
const { language, fallBacklanguage, languages } = {
    language: 'en',
    fallBacklanguage: 'en',
    languages: ['en', 'ru']
};

// Init language properties

setCurrentLanguage(language);
setFallbackLanguage(fallBacklanguage);
setLanguages(languages);

// Contexts
const TranslateContext = createContext();
const TranslateStateContext = createContext();
const TranslateDispatchContext = createContext();

// Reducers
function translateReducer(state, action) {
    switch (action.type) {
        case 'CHANGE_LANGUAGE': {
            setCurrentLanguage(action.language);
            return { ...state, language: action.language };
        }
        default: {
            throw new Error(`Unhandled action type: ${action.type}`);
        }
    }
}

// Initial state
const initialState = {
    language
};

export const TranslateProvider = props => {
    const value = {
        getCurrentLanguage: props.getCurrentLanguage || getCurrentLanguage,
        setCurrentLanguage: props.setCurrentLanguage || setCurrentLanguage,
        getFallbackLanguage: props.getFallbackLanguage || getFallbackLanguage,
        setFallbackLanguage: props.setFallbackLanguage || setFallbackLanguage,
        getLanguages: props.getLanguages || getLanguages,
        setLanguages: props.setLanguages || setLanguages,
        getTranslations: props.getTranslations || getTranslations,
        setTranslations: props.setTranslations || setTranslations,
        t: props.t || t
    };
    const [state, dispatch] = useReducer(translateReducer, initialState);

    return (
        <TranslateContext.Provider value={value}>
            <TranslateStateContext.Provider value={state}>
                <TranslateDispatchContext.Provider value={dispatch}>
                    {props.children}
                </TranslateDispatchContext.Provider>
            </TranslateStateContext.Provider>
        </TranslateContext.Provider>
    );
};

export const useTranslate = () => {
    // You can use the function of provider
    const context = useContext(TranslateContext);
    if (context === undefined) {
        throw new Error('useTranslate must be used within a TranslateProvider');
    }
    return context;
};

export const useTranslateState = () => {
    const context = useContext(TranslateStateContext);
    if (context === undefined) {
        throw new Error(
            'useTranslateState must be used within a TranslateProvider'
        );
    }
    return context;
};

export const useTranslateDispatch = () => {
    const context = useContext(TranslateDispatchContext);
    if (context === undefined) {
        throw new Error(
            'useTranslateDispatch must be used within a TranslateProvider'
        );
    }
    return context;
};
