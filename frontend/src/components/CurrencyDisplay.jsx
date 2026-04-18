import React from 'react';
import { getCurrencyParts } from '../utils/currency';
import { useAuth } from '../context/AuthContext';

const CurrencyDisplay = ({ amount, code, className = "", symbolClassName = "", valueClassName = "" }) => {
    const { user } = useAuth();

    // Check if an explicit code is provided, fallback to user's setting, then fallback to INR
    const finalCode = code || user?.currency || 'INR';
    const { symbol, value } = getCurrencyParts(amount || 0, finalCode);

    return (
        <span className={`inline-flex items-baseline ${className}`}>
            <span className={`text-[1em] font-bold mr-1 text-inherit ${symbolClassName}`}>
                {symbol}
            </span>
            <span className={`font-financial ${valueClassName}`}>
                {value}
            </span>
        </span>
    );
};

export default CurrencyDisplay;
