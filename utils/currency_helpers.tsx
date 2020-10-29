import { ethers } from "ethers";

export const isNumeric = (value:string) => {
    return value.match(/^-?(0|[1-9][0-9]*)(\.([0-9]+)*)?$/); 
}

export const formatCurrency = (value:string, decimals:number, options?:{prefix?:string, postfix?:string}):string => {

    if(options === undefined) options = {};

    if(!isNumeric(value)) return value; 

    let [whole, fraction] = value.split('.');

    if(!whole) whole = "0";
    if(!fraction) fraction = "0"

    const wfmt =  whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

    return `${options.prefix|| ''}${wfmt}.${fraction.substr(0, decimals > fraction.length ? fraction.length : decimals)}${options.postfix|| ''}`;
}

export const toWei = (value:string):string => {
    const bn = ethers.utils.parseUnits(value, 18);
    return bn.toString();
}