export const shortenAddress = (address:string):string => {
    return `${address.substr(0,7)}...${address.slice(-5)}`;
}