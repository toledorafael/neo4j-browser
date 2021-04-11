import Logic from 'logic-solver'

export default class SatSolver {
  constructor (featureExpression) {
    if (featureExpression !== '') {
      var formula = this.parse(featureExpression)
      this.solver = new Logic.Solver()
      this.solver.require(formula)
      this.solutions = []
      var curSol
      while ((curSol = this.solver.solve())) {
        curSol.ignoreUnknownVariables()
        this.solutions.push(curSol)
        this.solver.forbid(curSol.getFormula())
      }
    }
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
        // return parseConjunctionSeparatedExpression(expr)
        return this.parseNegation(expr)
      } else if (noStr[0] === '-') {
        return this.parseNegation(noStr)
      }
      return noStr
    })
    // const initialValue = 1.0
    // const result = operands.reduce((acc, no) => acc * no, initialValue)
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
      if (operandStr[0] === '-') {
        return this.parseNegation(operandStr)
      }
      return this.parseDisjunctionSeparatedExpression(operandStr)
    })
    // const initialValue = numbers[0]
    // const result = numbers.slice(1).reduce((acc, no) => acc - no, initialValue)
    if (operands.length > 1) {
      return Logic.and(operands)
    } else {
      return operands[0]
    }
  }

  parseNegation = expression => {
    if (expression[0] === '-') {
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
      // return parseConjunctionSeparatedExpression(newFeatureExpression)
      const parsedExpression = this.parseNegation(newFeatureExpression)
      return parsedExpression
    } else {
      return newFeatureExpression
    }
  }

  evaluateUnderAllSolutions = presenceCondition => {
    var newPresenceCondition = this.parse(presenceCondition)
    for (let solutionId = 0; solutionId < this.solutions.length; solutionId++) {
      const solution = this.solutions[solutionId]
      if (solution.evaluate(newPresenceCondition)) {
        return true
      }
    }
    return false
  }

  initSolver = function (featureExpression) {
    var variables = featureExpression.split('/\\')
    this.solver = new Logic.Solver()
    this.solver.require(Logic.and(variables))
    return this.solver.solve()
  }

  evaluateClause = function (presenceCondition) {
    var PCvariables = presenceCondition.split('/\\')
    return this.solver.evaluate(Logic.and(PCvariables))
  }
}

// const getVariables = function (clause) {
//   return clause.split('/\\')
// }

// export default function satSolver () {
//   var solver

//   const initSolver = function (featureExpression) {
//     var variables = featureExpression.split('/\\')
//     solver = new Logic.Solver()
//     solver.require(Logic.and(variables))
//     return solver.solve()
//   }

//   const evaluateClause = function (presenceCondition) {
//     var PCvariables = presenceCondition.split('/\\')
//     return solver.evaluate(Logic.and(PCvariables))
//   }
// }

//
//   var solver = initSolver(featureExpression)
//   //For each link
//   // evaluate link's presence condition
//   //return links that returned true to their evaluation
//   return true
// }
