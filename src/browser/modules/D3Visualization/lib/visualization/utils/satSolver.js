import Logic from 'logic-solver'
import 'regenerator-runtime/runtime.js'

export default class SatSolver {
  constructor (featureExpression) {
    if (featureExpression !== '') {
      var formula = this.parse(featureExpression)
      this.solver = new Logic.Solver()
      this.solver.require(formula)
    }
  }

  solveAssuming = expression => {
    return this.solver.solveAssuming(this.parse(expression))
  }

  // split expression by operator considering parentheses
  split = (expression, operator) => {
    const result = []
    let braces = 0
    let currentChunk = ''
    for (let i = 0; i < expression.length; ++i) {
      const curCh = expression[i]
      if (curCh === '(') {
        braces++
      } else if (curCh === ')') {
        braces--
      }
      if (braces === 0 && operator === curCh) {
        result.push(currentChunk)
        currentChunk = ''
      } else currentChunk += curCh
    }
    if (currentChunk !== '') {
      result.push(currentChunk)
    }
    return result
  }
  // this will only take strings containing * operator [ no + ]
  parseDisjunctionSeparatedExpression = expression => {
    const operandsString = this.split(expression, '+')
    const operands = operandsString.map(noStr => {
      if (noStr[0] === '(') {
        const expr = noStr.substr(1, noStr.length - 2)
        // recursive call to the main function
        return this.parseNegation(expr)
      } else if (noStr[0] === '-' && noStr[1] === '(') {
        return this.parseNegation(noStr)
      }
      return noStr
    })
    if (operands.length > 1) {
      return Logic.or(operands)
    } else {
      return operands[0]
    }
  }
  // both * -
  parseConjunctionSeparatedExpression = expression => {
    const operandsString = this.split(expression, '*')
    const operands = operandsString.map(operandStr => {
      if (expression[0] === '-' && expression[1] === '(') {
        return this.parseNegation(operandStr)
      }
      return this.parseDisjunctionSeparatedExpression(operandStr)
    })
    if (operands.length > 1) {
      return Logic.and(operands)
    } else {
      return operands[0]
    }
  }

  parseNegation = expression => {
    if (expression[0] === '-' && expression[1] === '(') {
      return Logic.not(
        this.parseConjunctionSeparatedExpression(
          expression.substr(1, expression.length - 1)
        )
      )
    } else {
      return this.parseConjunctionSeparatedExpression(expression)
    }
  }

  parse = featureExpression => {
    var newFeatureExpression = featureExpression
      .replaceAll(/\s/g, '')
      .replaceAll('!', '-')
    if (
      newFeatureExpression.includes('/\\') ||
      newFeatureExpression.includes('\\/')
    ) {
      newFeatureExpression = newFeatureExpression.replaceAll('/\\', '*')
      newFeatureExpression = newFeatureExpression.replaceAll('\\/', '+')
      return this.parseNegation(newFeatureExpression)
    } else {
      return newFeatureExpression
    }
  }
}
