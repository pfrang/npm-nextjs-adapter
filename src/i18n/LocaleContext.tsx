'use client';

import React, {createContext, useContext, useState} from 'react';
import {Dict, getPhrase, loadPhrases} from './i18n';

export type LocaleContextType = {
    setLocale: (locale: string) => void,
    locale: string,
    dictionary: Dict,
    localize: (key: string, ...args: any[]) => string,
};

const LocaleContext = createContext<LocaleContextType>({
    setLocale: (locale: string) => {
    },
    locale: '',
    dictionary: {},
    localize: (key: string, ...args: any[]) => key,
});

export const useLocaleContext = () => useContext(LocaleContext);

export const LocaleContextProvider = ({children, locale}: { children: any, locale?: string }) => {
    const [currentLocale, setLocaleState] = useState(locale);
    const [dictionary, setPhrasesState] = useState<Dict>({});

    const setLocale = async (locale: string): Promise<Dict> => {
        setLocaleState(locale);
        return loadPhrases(locale).then((phrases) => {
            setPhrasesState(phrases);
            console.info(`Loaded client-side phrases for locale "${locale}"`);
            return phrases;
        });
    };

    if (locale && currentLocale !== locale) {
        // async/await is not supported in client components yet
        void setLocale(locale);
    }

    const localize = (key: string, ...args: any[]) => getPhrase(currentLocale, dictionary, key, ...args);

    return (
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        <LocaleContext.Provider value={{setLocale, locale: currentLocale, dictionary, localize}}>
            {children}
        </LocaleContext.Provider>
    );
};