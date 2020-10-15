import Logic from 'logic-solver'

const getVariables = function (clause) {
  return clause.split('/\\')
}

export default function satSolver () {
  var solver

  const initSolver = function (featureExpression) {
    var variables = featureExpression.split('/\\')
    solver = new Logic.Solver()
    solver.require(Logic.and(variables))
    return solver.solve()
  }

  const evaluateClause = function (presenceCondition) {
    var PCvariables = presenceCondition.split('/\\')
    return solver.evaluate(Logic.and(PCvariables))
  }
}

//
//   var solver = initSolver(featureExpression)
//   //For each link
//   // evaluate link's presence condition
//   //return links that returned true to their evaluation
//   return true
// }
