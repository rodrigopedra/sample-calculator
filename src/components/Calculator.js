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
    const [current, setCurrent] = useState('0');
    const [isPending, setIsPending] = useState(false);
    const [value, setValue] = useState(null);
    const [operator, setOperator] = useState('=');
    const [lastValue, setLastValue] = useState(0);
    const [lastOperator, setLastOperator] = useState('=');

    // computed
    const shouldClear = !['0', '-0'].includes(current);

    const input = useRef(null);

    const focus = function () {
        input.current.focus();
    };

    useEffect(focus, []);

    const reset = function () {
        setCurrent('0');
        setIsPending(false);

        setValue(null);
        setOperator('=');

        setLastValue(0);
        setLastOperator('=');

        focus();
    };

    const clear = function () {
        setCurrent('0');
        focus();
    };

    const changeSign = function () {
        if (isPending && operator !== '=') {
            setCurrent('-0');
            setIsPending(false);

            return focus();
        }

        if (current.startsWith('-')) {
            setCurrent(current.slice(1));
        } else {
            setCurrent('-' + current);
        }

        if (operator === '=' && !isPending) {
            setValue(-Number(current));
        }

        focus();
    };

    const handlePercent = function () {
        const number = Number(current);

        if (number === 0.0) {
            return focus();
        }

        const decimalPart = current.replace(/^-?\d*\.?/, '');
        const newValue = number / 100.0;

        setCurrent(newValue.toFixed(decimalPart.length + 2));
        focus();
    };

    const calculateAgain = function (nextOperator) {
        if (lastOperator === '=' || nextOperator !== '=') {
            return false;
        }

        const newValue = OPERATIONS[lastOperator](Number(current), lastValue);

        setValue(newValue);
        setCurrent(String(newValue));
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

        const number = Number(current);

        if (value === null) {
            setValue(number);
        } else {
            const newValue = OPERATIONS[operator](value || 0, number);

            setValue(newValue);
            setLastValue(number);
            setCurrent(String(newValue));
        }

        setIsPending(true);
        setLastOperator(operator);
        setOperator(nextOperator);
        focus();
    };

    const handleDigit = function (digit) {
        if (current === '0' || isPending) {
            setCurrent(digit);
        } else if (current === '-0') {
            setCurrent('-' + digit);
        } else {
            setCurrent(current + digit);
        }

        setIsPending(false);
        focus();
    };

    const handleDot = function () {
        if (isPending) {
            setCurrent('0.');
            setIsPending(false);

            return focus();
        }

        if (!/\./.test(current)) {
            setCurrent(current + '.');
            setIsPending(false);
        }

        focus();
    };

    const handleBackspace = function () {
        const newCurrent = current.slice(0, -1);

        if (newCurrent === '' || newCurrent === '-') {
            setCurrent('0');
        } else {
            setCurrent(newCurrent);
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
            return shouldClear ? clear() : reset();
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
                value={current}
                onKeyDown={handleInput}
                onBlur={focus} />

            <section className="buttons">
                {shouldClear ? (<Button onClick={clear}>C</Button>) : <Button onClick={reset}>AC</Button>}
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

            <Dumper {...{current, isPending, value, operator, lastValue, lastOperator}} />
        </main>
    );
};

export default Calculator;
