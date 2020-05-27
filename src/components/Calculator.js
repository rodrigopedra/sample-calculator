import React, {useEffect, useRef, useState} from 'react';
import '../styles/Calculator.css';

const OPERATIONS = {
    '+': (previous, next) => previous + next,
    '-': (previous, next) => previous - next,
    '*': (previous, next) => previous * next,
    '/': (previous, next) => previous / next,
    '=': (previous, next) => next,
};

const Display = React.forwardRef(({value, onKeyDown, onBlur}, ref) => (
    <input
        ref={ref}
        className="display"
        type="text"
        onKeyDown={onKeyDown}
        onChange={(event) => event.preventDefault()}
        onBlur={onBlur ? () => requestAnimationFrame(onBlur) : null}
        value={value} />
));

const Button = ({className, onClick, children}) => (
    <button type="button" className={className} onClick={onClick}>
        {children}
    </button>
);

const OperationButton = ({operator, isActive, calculate, children}) => (
    <Button className={isActive ? 'operation active' : 'operation'} onClick={() => calculate(operator)}>
        {children || operator}
    </Button>
);

const DigitButton = ({className, digit, handler}) => (
    <Button className={`digit ${className}`} onClick={() => handler(digit)}>
        {digit}
    </Button>
);

const Dumper = (props) => (
    <pre>{JSON.stringify(props, null, 2)}</pre>
);

const Calculator = function () {
    const [displayValue, setDisplayValue] = useState('0');
    const [isDirty, setIsDirty] = useState(false);
    const [isPending, setIsPending] = useState(false);
    const [value, setValue] = useState(null);
    const [operator, setOperator] = useState('=');
    const [previousValue, setPreviousValue] = useState(null);
    const [previousOperator, setPreviousOperator] = useState('=');

    const input = useRef(null);

    const focus = function () {
        input.current.focus();
    };

    useEffect(focus, []);

    const reset = function () {
        setDisplayValue('0');
        setIsDirty(false);
        setIsPending(false);

        setValue(null);
        setOperator('=');

        setPreviousValue(null);
        setPreviousOperator('=');

        focus();
    };

    const clear = function () {
        setDisplayValue('0');
        setIsDirty(false);

        if (operator !== '=') {
            setIsPending(true);
        }

        focus();
    };

    const changeSign = function () {
        if (isPending && operator !== '=') {
            setDisplayValue('-0');
            setIsDirty(true);
            setIsPending(false);

            return focus();
        }

        if (displayValue.startsWith('-')) {
            setDisplayValue(displayValue.slice(1));
        } else {
            setDisplayValue('-' + displayValue);
        }

        if (!['0', '-0'].includes(displayValue)) {
            setIsDirty(true);
        }

        focus();
    };

    const handlePercent = function () {
        const number = Number(displayValue);

        if (number === 0.0) {
            return focus();
        }

        const decimalPart = displayValue.replace(/^-?\d*\.?/, '');
        const newValue = number / 100.0;

        setDisplayValue(newValue.toFixed(decimalPart.length + 2));
        setIsDirty(true);

        focus();
    };

    const calculateAgain = function (nextOperator) {
        if (previousOperator === '=' || nextOperator !== '=') {
            return false;
        }

        const newValue = OPERATIONS[previousOperator](Number(displayValue), previousValue || 0.0);

        setValue(newValue);

        setDisplayValue(String(newValue));
        setIsDirty(true);
        setIsPending(true);

        return true;
    };

    const pendingCalculation = function (nextOperator) {
        if (nextOperator === '=' && operator !== '=') {
            return false;
        }

        setOperator(nextOperator);

        return true;
    };

    const calculate = function (nextOperator) {
        if (operator === '=' && calculateAgain(nextOperator)) {
            return focus();
        }

        if (isPending && pendingCalculation(nextOperator)) {
            return focus();
        }

        const number = Number(displayValue);

        if (value === null) {
            setValue(number);
        } else {
            const newValue = OPERATIONS[operator](value || 0, number);

            setValue(newValue);
            setPreviousValue(number);

            setDisplayValue(String(newValue));
            setIsDirty(true);
        }

        setIsPending(true);
        setPreviousOperator(operator);
        setOperator(nextOperator);
        focus();
    };

    const handleDigit = function (digit) {
        if (displayValue === '0') {
            setDisplayValue(digit);
        } else if (displayValue === '-0') {
            setDisplayValue('-' + digit);
        } else if (isPending) {
            setDisplayValue(digit);
        } else {
            setDisplayValue(displayValue + digit);
        }

        setIsDirty(true);
        setIsPending(false);
        focus();
    };

    const handleDot = function () {
        if (isPending) {
            setDisplayValue('0.');
            setIsDirty(true);

            setIsPending(false);

            return focus();
        }

        if (!/\./.test(displayValue)) {
            setDisplayValue(displayValue + '.');
            setIsDirty(true);

            setIsPending(false);
        }

        focus();
    };

    const handleBackspace = function () {
        const newCurrent = displayValue.slice(0, -1);

        if (newCurrent === '' || newCurrent === '-') {
            setDisplayValue('0');
        } else {
            setDisplayValue(newCurrent);
            setIsDirty(true);
        }

        focus();
    };

    const handleInput = function (event) {
        const {key} = event;

        if (/^\d$/.test(key)) {
            event.preventDefault();
            return handleDigit(String(key));
        }

        if (key === '.') {
            event.preventDefault();
            return handleDot();
        }

        if (key === 'Backspace') {
            event.preventDefault();
            return handleBackspace();
        }

        if (key === 'Escape') {
            event.preventDefault();
            return isDirty ? clear() : reset();
        }

        if (key === 'Enter') {
            event.preventDefault();
            return calculate('=');
        }

        if (key === '%') {
            event.preventDefault();
            return handlePercent();
        }

        if (Object.keys(OPERATIONS).includes(key)) {
            event.preventDefault();
            return calculate(key);
        }
    };

    return (
        <main className="wrapper">
            <Display
                ref={input}
                value={displayValue}
                onKeyDown={handleInput}
                onBlur={focus} />

            <section className="buttons">
                {isDirty ? <Button onClick={clear}>C</Button> : <Button onClick={reset}>AC</Button>}
                <Button onClick={changeSign}>&#177;</Button>
                <Button onClick={handlePercent}>%</Button>
                <OperationButton operator="/" isActive={operator === '/'} calculate={calculate}>
                    &#247;
                </OperationButton>

                <DigitButton digit="7" handler={handleDigit} />
                <DigitButton digit="8" handler={handleDigit} />
                <DigitButton digit="9" handler={handleDigit} />
                <OperationButton operator="*" isActive={operator === '*'} calculate={calculate}>
                    &times;
                </OperationButton>

                <DigitButton digit="4" handler={handleDigit} />
                <DigitButton digit="5" handler={handleDigit} />
                <DigitButton digit="6" handler={handleDigit} />
                <OperationButton operator="-" isActive={operator === '-'} calculate={calculate} />

                <DigitButton digit="1" handler={handleDigit} />
                <DigitButton digit="2" handler={handleDigit} />
                <DigitButton digit="3" handler={handleDigit} />
                <OperationButton operator="+" isActive={operator === '+'} calculate={calculate} />

                <DigitButton className="wide" digit="0" handler={handleDigit} />
                <Button className="digit" onClick={handleDot}>&bull;</Button>
                <OperationButton operator="=" calculate={calculate} />
            </section>

            <Dumper {...{displayValue, isDirty, isPending, value, operator, previousValue, previousOperator}} />
        </main>
    );
};

export default Calculator;
