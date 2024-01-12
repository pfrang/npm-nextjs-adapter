import type {Context} from '../types';


import {
    RENDER_MODE,
    RENDER_MODE_HEADER,
} from '../constants';


export const getRenderMode = (context: Context): RENDER_MODE => {
    const value = context.headers?.get(RENDER_MODE_HEADER);
    const enumValue = RENDER_MODE[<keyof typeof RENDER_MODE>value?.toUpperCase()];
    return enumValue || RENDER_MODE[process.env.RENDER_MODE] || RENDER_MODE.NEXT;
};