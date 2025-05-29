export type CurrencyType = {
    code: string;
    name: string;
    flag: string;
};

export type listType = CurrencyType;

export type CurrencySelectorType = {
    onSelectCurrency: (currency: CurrencyType) => void;
    initialValue?: CurrencyType | null;
};