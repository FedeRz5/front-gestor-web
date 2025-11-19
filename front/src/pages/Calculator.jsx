"use client"

import { useState } from "react"

export default function Calculator({ usdRate, eurRate }) {
  const [isOpen, setIsOpen] = useState(false)
  const [display, setDisplay] = useState("0")
  const [previousValue, setPreviousValue] = useState(null)
  const [operation, setOperation] = useState(null)
  const [waitingForOperand, setWaitingForOperand] = useState(false)

  const inputDigit = (digit) => {
    if (waitingForOperand) {
      setDisplay(String(digit))
      setWaitingForOperand(false)
    } else {
      setDisplay(display === "0" ? String(digit) : display + digit)
    }
  }

  const inputDot = () => {
    if (waitingForOperand) {
      setDisplay("0.")
      setWaitingForOperand(false)
    } else if (display.indexOf(".") === -1) {
      setDisplay(display + ".")
    }
  }

  const clear = () => {
    setDisplay("0")
    setPreviousValue(null)
    setOperation(null)
    setWaitingForOperand(false)
  }

  const performOperation = (nextOperation) => {
    const inputValue = Number.parseFloat(display)

    if (previousValue === null) {
      setPreviousValue(inputValue)
    } else if (operation) {
      const currentValue = previousValue || 0
      const newValue = calculate(currentValue, inputValue, operation)
      setDisplay(String(newValue))
      setPreviousValue(newValue)
    }

    setWaitingForOperand(true)
    setOperation(nextOperation)
  }

  const calculate = (firstValue, secondValue, operation) => {
    switch (operation) {
      case "+":
        return firstValue + secondValue
      case "-":
        return firstValue - secondValue
      case "*":
        return firstValue * secondValue
      case "/":
        return firstValue / secondValue
      case "=":
        return secondValue
      default:
        return secondValue
    }
  }

  const convertToUSD = () => {
    if (usdRate) {
      const result = Number.parseFloat(display) / usdRate
      setDisplay(result.toFixed(2))
      setWaitingForOperand(true)
    }
  }

  const convertToEUR = () => {
    if (eurRate) {
      const result = Number.parseFloat(display) / eurRate
      setDisplay(result.toFixed(2))
      setWaitingForOperand(true)
    }
  }

  return (
    <>
      <button className="calculator-button" onClick={() => setIsOpen(!isOpen)} aria-label="Calculadora">
        🧮
      </button>

      {isOpen && (
        <div className="calculator-modal">
          <div className="calculator-content">
            <div className="calculator-header">
              <h3>Calculadora</h3>
              <button className="calculator-close" onClick={() => setIsOpen(false)}>
                ×
              </button>
            </div>

            <div className="calculator-display">{display}</div>

            <div className="calculator-buttons">
              <button className="calc-btn calc-btn-clear" onClick={clear}>
                C
              </button>
              <button className="calc-btn calc-btn-operation" onClick={() => performOperation("/")}>
                ÷
              </button>
              <button className="calc-btn calc-btn-operation" onClick={() => performOperation("*")}>
                ×
              </button>
              <button className="calc-btn calc-btn-operation" onClick={() => performOperation("-")}>
                -
              </button>

              <button className="calc-btn" onClick={() => inputDigit(7)}>
                7
              </button>
              <button className="calc-btn" onClick={() => inputDigit(8)}>
                8
              </button>
              <button className="calc-btn" onClick={() => inputDigit(9)}>
                9
              </button>
              <button className="calc-btn calc-btn-operation" onClick={() => performOperation("+")}>
                +
              </button>

              <button className="calc-btn" onClick={() => inputDigit(4)}>
                4
              </button>
              <button className="calc-btn" onClick={() => inputDigit(5)}>
                5
              </button>
              <button className="calc-btn" onClick={() => inputDigit(6)}>
                6
              </button>
              <button className="calc-btn calc-btn-equals" onClick={() => performOperation("=")}>
                =
              </button>

              <button className="calc-btn" onClick={() => inputDigit(1)}>
                1
              </button>
              <button className="calc-btn" onClick={() => inputDigit(2)}>
                2
              </button>
              <button className="calc-btn" onClick={() => inputDigit(3)}>
                3
              </button>
              <button className="calc-btn calc-btn-currency" onClick={convertToUSD}>
                USD
              </button>

              <button className="calc-btn calc-btn-zero" onClick={() => inputDigit(0)}>
                0
              </button>
              <button className="calc-btn" onClick={inputDot}>
                .
              </button>
              <button className="calc-btn calc-btn-currency" onClick={convertToEUR}>
                EUR
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
