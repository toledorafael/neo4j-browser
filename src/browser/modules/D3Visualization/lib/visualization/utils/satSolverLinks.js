import Logic from 'logic-solver'

const initSolver = function (featureExpression) {
  var variables = getVariables(featureExpression)
  var solver = new Logic.Solver()
  solver.require(Logic.and(variables))
  return solver.solve()
}

const getVariables = function (clause) {
  return clause.split('/\\')
}

const evaluateClause = function (solver, presenceCondition) {
  var PCvariables = getVariables(presenceCondition)
  return solver.evaluate(Logic.and(PCvariables))
}

export default function (featureExpression, links) {
  var solver = initSolver(featureExpression)
  //For each link
  // evaluate link's presence condition
  //return links that returned true to their evaluation
  return true
}
