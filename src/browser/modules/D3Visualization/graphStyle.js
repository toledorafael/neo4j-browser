/*
 * Copyright (c) 2002-2019 "Neo4j,"
 * Neo4j Sweden AB [http://neo4j.com]
 *
 * This file is part of Neo4j.
 *
 * Neo4j is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import {
  selectorStringToArray,
  selectorArrayToString
} from 'services/grassUtils'
import SatSolver from './lib/visualization/utils/satSolver'

export default function neoGraphStyle () {
  const defaultStyle = {
    node: {
      diameter: '50px',
      color: '#A5ABB6',
      'border-color': '#9AA1AC',
      'border-width': '2px',
      'text-color-internal': '#FFFFFF',
      'font-size': '10px'
    },
    relationship: {
      color: '#A5ABB6',
      'shaft-width': '1px',
      'font-size': '8px',
      padding: '3px',
      'text-color-external': '#000000',
      'text-color-internal': '#FFFFFF',
      caption: '<type>'
    }
  }
  const defaultSizes = [
    {
      diameter: '10px'
    },
    {
      diameter: '20px'
    },
    {
      diameter: '50px'
    },
    {
      diameter: '65px'
    },
    {
      diameter: '80px'
    }
  ]
  const defaultIconCodes = [
    {
      'icon-code': 'a'
    },
    {
      'icon-code': '"'
    },
    {
      'icon-code': 'z'
    },
    {
      'icon-code': '_'
    },
    {
      'icon-code': '/'
    },
    {
      'icon-code': '>'
    },
    {
      'icon-code': 'k'
    }
  ]
  const defaultArrayWidths = [
    {
      'shaft-width': '1px'
    },
    {
      'shaft-width': '2px'
    },
    {
      'shaft-width': '3px'
    },
    {
      'shaft-width': '5px'
    },
    {
      'shaft-width': '8px'
    },
    {
      'shaft-width': '13px'
    },
    {
      'shaft-width': '25px'
    },
    {
      'shaft-width': '38px'
    }
  ]
  const defaultColors = [
    {
      color: '#FFE081',
      'border-color': '#9AA1AC',
      'text-color-internal': '#FFFFFF'
    },
    {
      color: '#C990C0',
      'border-color': '#b261a5',
      'text-color-internal': '#FFFFFF'
    },
    {
      color: '#F79767',
      'border-color': '#f36924',
      'text-color-internal': '#FFFFFF'
    },
    {
      color: '#57C7E3',
      'border-color': '#23b3d7',
      'text-color-internal': '#FFFFFF'
    },
    {
      color: '#F16667',
      'border-color': '#eb2728',
      'text-color-internal': '#FFFFFF'
    },
    {
      color: '#D9C8AE',
      'border-color': '#c0a378',
      'text-color-internal': '#604A0E'
    },
    {
      color: '#8DCC93',
      'border-color': '#5db665',
      'text-color-internal': '#604A0E'
    },
    {
      color: '#ECB5C9',
      'border-color': '#da7298',
      'text-color-internal': '#604A0E'
    },
    {
      color: '#4C8EDA',
      'border-color': '#2870c2',
      'text-color-internal': '#FFFFFF'
    },
    {
      color: '#FFC454',
      'border-color': '#d7a013',
      'text-color-internal': '#604A0E'
    },
    {
      color: '#DA7194',
      'border-color': '#cc3c6c',
      'text-color-internal': '#FFFFFF'
    },
    {
      color: '#569480',
      'border-color': '#447666',
      'text-color-internal': '#FFFFFF'
    }
  ]
  const Selector = (function () {
    function Selector (tag1, classes1) {
      this.tag = tag1
      this.classes = classes1 != null ? classes1 : []
    }

    Selector.prototype.toString = function () {
      return selectorArrayToString([this.tag].concat(this.classes))
    }

    return Selector
  })()

  const StyleRule = (function () {
    function StyleRule (selector1, props1) {
      this.selector = selector1
      this.props = props1
      if (selector1.classes.includes('condRule')) {
        this.solver = new SatSolver(selector1.classes[0])
      }
    }

    StyleRule.prototype.matches = function (selector) {
      if (this.selector.tag !== selector.tag) {
        return false
      }
      for (let i = 0; i < this.selector.classes.length; i++) {
        const classs = this.selector.classes[i]
        if (classs != null && selector.classes.indexOf(classs) === -1) {
          return false
        }
      }
      return true
    }

    StyleRule.prototype.matchesExact = function (selector) {
      return (
        this.matches(selector) &&
        this.selector.classes.length === selector.classes.length
      )
    }

    return StyleRule
  })()

  const StyleElement = (function () {
    // StyleElement combines a selector with a props which defines style
    function StyleElement (selector) {
      this.selector = selector
      this.props = {}
    }

    StyleElement.prototype.applyRules = function (rules) {
      for (let i = 0; i < rules.length; i++) {
        const rule = rules[i] // Rules are either provided at first loading or added later via updateStyle in GrassEditor.jsx
        if (rule.matches(this.selector)) {
          // find style based on tag of selector (whether it's a node or a relationship)
          this.props = { ...this.props, ...rule.props }
          this.props.caption = this.props.caption || this.props.defaultCaption
        }
      }
      return this
    }

    StyleElement.prototype.applyCondRules = function (rules) {
      // TODO: Ignore prior rules
      if (this.selector.tag === 'relationship') {
        var presenceCondition = ''
        if ('condition' in this.selector.classes[0].propertyMap) {
          presenceCondition = this.selector.classes[0].propertyMap['condition']
        }

        for (let i = 0; i < rules.length; i++) {
          let rule = rules[i] // Rules are either provided at first loading or added later via updateStyle in GrassEditor.jsx
          // if rule concerns a condition
          if (rule.selector.classes.includes('condRule')) {
            // if (featureExpression !== '') {
            //   var formula = parse(featureExpression)
            //   var solver = new Logic.Solver()
            //   solver.require(formula)
            //   var solutions = []
            //   var curSol
            //   while ((curSol = solver.solve())) {
            //     curSol.ignoreUnknownVariables()
            //     solutions.push(curSol)
            //     solver.forbid(curSol.getFormula())
            //   }
            // }

            if (presenceCondition !== '' && presenceCondition !== 'true') {
              // TODO: if array includes a solver set solver to ruleSolver and skip to 266
              // TODO: save solver with rule Array [tag,condition,isCond flag, solver]
              // var solver
              // if (!('solver' in rule.selector)) {
              //   rule.selector['solver'] = new SatSolver(rule.selector.classes[0])
              // }
              // solver = rule.selector['solver']
              if (rule.solver.evaluateUnderAllSolutions(presenceCondition)) {
                this.props = { ...this.props, ...rule.props }
                this.props.caption =
                  this.props.caption || this.props.defaultCaption
              }
            } else {
              // if condition = true or empty
              // All rules regarding any condition should apply
            }

            // if (featureExpression !== '') {
            //   var presenceCondition = ''
            //   if (checkPropertyList(rel.propertyList, 'condition')) {
            //     for (let index = 0; index < rel.propertyList.length; index++) {
            //       const element = rel.propertyList[index]
            //       if (element.key === 'condition') {
            //         presenceCondition = rel.propertyList[index].value
            //       }
            //     }
            //     if (presenceCondition !== 'true') {
            //       if (solver.evaluateUnderAllSolutions(presenceCondition)) {
            //         return 'red'
            //       }
            //     } else {
            //       return 'red'
            //     }
            //     return 'none'
            //   }
            //   // return 'red'
            // }
            // this.selector.classes[0].propertyMap['condition']
          }
        }
      }

      return this
    }

    StyleElement.prototype.get = function (attr) {
      return this.props[attr] || ''
    }

    return StyleElement
  })()

  const GraphStyle = (function () {
    function GraphStyle () {
      this.rules = []
      try {
        this.loadRules()
      } catch (_error) {
        // e = _error
      }
    }

    const parseSelector = function (key) {
      let tokens
      if (key.includes('condRule')) {
        tokens = key.split('.')
      } else {
        tokens = selectorStringToArray(key)
      }
      return new Selector(tokens[0], tokens.slice(1))
    }

    const selector = function (item) {
      if (item.isNode) {
        return nodeSelector(item)
      } else if (item.isRelationship) {
        return relationshipSelector(item)
      }
    }

    const nodeSelector = function (node) {
      node = node || {}
      const classes = node.labels != null ? node.labels : []
      return new Selector('node', classes)
    }

    const relationshipSelector = function (rel) {
      rel = rel || {}
      const classes = rel.type != null ? [rel.type] : []
      return new Selector('relationship', classes)
    }

    const conditionSelector = function (cond) {
      cond = cond || null
      let classes
      if (typeof cond === 'string' || cond instanceof String) {
        classes = cond != null ? [cond, 'condRule'] : []
      } else {
        classes = cond != null ? [cond] : []
      }

      // conditionSelector is almost the same as relationshipSelector: both under the tag "relationship"
      // and both have classes, an array of length 0 or 1
      // However, while the classes of relationshipSelector stores relationship types
      // classes of conditionSelector stores condition name
      return new Selector('relationship', classes)
    }

    const findRule = function (selector, rules) {
      for (let i = 0; i < rules.length; i++) {
        let rule = rules[i]
        if (rule.matchesExact(selector)) {
          return rule
        }
      }
    }

    const findAvailableDefaultColor = function (rules) {
      const usedColors = rules
        .filter(rule => {
          return rule.props.color != null
        })
        .map(rule => {
          return rule.props.color
        })
      let index =
        usedColors.length - 1 > defaultColors ? 0 : usedColors.length - 1
      return defaultColors[index]
    }

    const getDefaultNodeCaption = function (item) {
      if (
        !item ||
        !(item.propertyList != null ? item.propertyList.length : 0) > 0
      ) {
        return {
          defaultCaption: '<id>'
        }
      }
      const captionPrioOrder = [
        /^name$/i,
        /^title$/i,
        /^label$/i,
        /name$/i,
        /description$/i,
        /^.+/
      ]
      let defaultCaption = captionPrioOrder.reduceRight(function (
        leading,
        current
      ) {
        let hits = item.propertyList.filter(function (prop) {
          return current.test(prop.key)
        })
        if (hits.length) {
          return '{' + hits[0].key + '}'
        } else {
          return leading
        }
      },
      '')
      defaultCaption || (defaultCaption = '<id>')
      return {
        caption: defaultCaption
      }
    }

    GraphStyle.prototype.calculateStyle = function (selector) {
      return new StyleElement(selector).applyRules(this.rules)
    }

    GraphStyle.prototype.calculateCondStyle = function (selector) {
      return new StyleElement(selector).applyCondRules(this.rules)
    }

    GraphStyle.prototype.forEntity = function (item) {
      return this.calculateStyle(selector(item))
    }

    GraphStyle.prototype.setDefaultNodeStyling = function (selector, item) {
      let defaultColor = true
      let defaultCaption = true
      for (let i = 0; i < this.rules.length; i++) {
        let rule = this.rules[i]
        if (rule.selector.classes.length > 0 && rule.matches(selector)) {
          if (rule.props.hasOwnProperty('color')) {
            defaultColor = false
          }
          if (rule.props.hasOwnProperty('caption')) {
            defaultCaption = false
          }
        }
      }
      const minimalSelector = new Selector(
        selector.tag,
        selector.classes.sort().slice(0, 1)
      )
      if (defaultColor) {
        this.changeForSelector(
          minimalSelector,
          findAvailableDefaultColor(this.rules)
        )
      }
      if (defaultCaption) {
        return this.changeForSelector(
          minimalSelector,
          getDefaultNodeCaption(item)
        )
      }
    }

    GraphStyle.prototype.changeForSelector = function (selector, props) {
      let rule = findRule(selector, this.rules)
      if (rule == null) {
        rule = new StyleRule(selector, props)
        this.rules.push(rule)
      }
      rule.props = { ...rule.props, ...props }
      return rule
    }

    GraphStyle.prototype.destroyRule = function (rule) {
      const idx = this.rules.indexOf(rule)
      if (idx != null) {
        this.rules.splice(idx, 1)
      }
    }

    GraphStyle.prototype.importGrass = function (string) {
      try {
        const rules = this.parse(string)
        return this.loadRules(rules)
      } catch (_error) {
        // e = _error
      }
    }

    GraphStyle.prototype.parse = function (string) {
      const chars = string.split('')
      let insideString = false
      let insideProps = false
      let keyword = ''
      let props = ''
      let rules = {}
      for (let i = 0; i < chars.length; i++) {
        const c = chars[i]
        let skipThis = true
        switch (c) {
          case '{':
            if (!insideString) {
              insideProps = true
            } else {
              skipThis = false
            }
            break
          case '}':
            if (!insideString) {
              insideProps = false
              rules[keyword] = props
              keyword = ''
              props = ''
            } else {
              skipThis = false
            }
            break
          case "'":
            insideString ^= true
            break
          default:
            skipThis = false
        }
        if (skipThis) {
          continue
        }
        if (insideProps) {
          props += c
        } else {
          if (!c.match(/[\s\n]/)) {
            keyword += c
          }
        }
      }
      for (let k in rules) {
        const v = rules[k]
        rules[k] = {}
        v.split(';').forEach(prop => {
          const [key, val] = prop.split(':')
          if (key && val) {
            rules[k][key.trim()] = val.trim()
          }
        })
      }
      return rules
    }

    GraphStyle.prototype.resetToDefault = function () {
      this.loadRules()
      return true
    }

    GraphStyle.prototype.toSheet = function () {
      let sheet = {}
      this.rules.forEach(rule => {
        sheet[rule.selector.toString()] = rule.props
      })
      return sheet
    }

    GraphStyle.prototype.toString = function () {
      let str = ''
      this.rules.forEach(r => {
        str += r.selector.toString() + ' {\n'
        for (let k in r.props) {
          let v = r.props[k]
          if (k === 'caption') {
            v = "'" + v + "'"
          }
          str += '  ' + k + ': ' + v + ';\n'
        }
        str += '}\n\n'
      })
      return str
    }

    GraphStyle.prototype.loadRules = function (data) {
      if (typeof data !== 'object') {
        data = defaultStyle
      }
      this.rules.length = 0
      for (let key in data) {
        const props = data[key]
        this.rules.push(new StyleRule(parseSelector(key), props))
      }
      return this
    }

    GraphStyle.prototype.defaultSizes = function () {
      return defaultSizes
    }

    GraphStyle.prototype.defaultIconCodes = function () {
      return defaultIconCodes
    }

    GraphStyle.prototype.defaultArrayWidths = function () {
      return defaultArrayWidths
    }

    GraphStyle.prototype.defaultColors = function () {
      return defaultColors
    }

    GraphStyle.prototype.interpolate = function (str, item) {
      let ips = str.replace(/\{([^{}]*)\}/g, function (a, b) {
        let r = item.propertyMap[b]
        if (typeof r === 'object') {
          return r.join(', ')
        }
        if (typeof r === 'string' || typeof r === 'number') {
          return r
        }
        return ''
      })
      if (ips.length < 1 && str === '{type}' && item.isRelationship) {
        ips = '<type>'
      }
      if (ips.length < 1 && str === '{id}' && item.isNode) {
        ips = '<id>'
      }
      return ips.replace(/^<(id|type)>$/, function (a, b) {
        const r = item[b]
        if (typeof r === 'string' || typeof r === 'number') {
          return r
        }
        return ''
      })
    }

    GraphStyle.prototype.forNode = function (node) {
      node = node || {}
      const selector = nodeSelector(node)
      if ((node.labels != null ? node.labels.length : 0) > 0) {
        this.setDefaultNodeStyling(selector, node)
      }
      return this.calculateStyle(selector)
    }

    GraphStyle.prototype.forRelationship = function (rel) {
      const selector = relationshipSelector(rel)
      return this.calculateStyle(selector)
    }

    GraphStyle.prototype.forCondition = function (cond) {
      const selector = conditionSelector(cond)
      return this.calculateStyle(selector)
    }

    GraphStyle.prototype.forCondRel = function (rel) {
      const selector = conditionSelector(rel)
      return this.calculateCondStyle(selector)
    }
    return GraphStyle
  })()
  return new GraphStyle()
}
