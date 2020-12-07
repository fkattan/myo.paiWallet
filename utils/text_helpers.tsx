export const titleize = (input:string) => {
	return input.toLowerCase().replace(/(?:^|\s|-)\S/g, x => x.toUpperCase());
};

export const capitalize = (input:string) => {
    return input[0].toUpperCase() + input.slice(1);
}

