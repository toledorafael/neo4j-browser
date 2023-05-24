/*
 * Copyright (c) "Neo4j"
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

export default function neoGraphStyle() {
  const defaultStyle = {
    node: {
      diameter: '50px',
      color: 'var(--graph-color0)',
      'border-color': 'var(--border-color0)',
      'border-width': '2px',
      'text-color-internal': 'var(--graph-internal-text-color)',
      'font-size': '14px',
      caption: 'label'
    },
    relationship: {
      color: 'var(--graph-color0)',
      'shaft-width': '5px', // Check if the link gets thicker
      'head-width': '10px',
      'font-size': '14px',
      padding: '3px',
      'text-color-external': '#000000',
      'text-color-internal': 'var(--graph-internal-text-color)',
      // caption: '<type>'
      caption: '{condition}'
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
  const defaultShaftWidths = [
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
  const defaultArrowheadWidths = [
    {
      'head-width': '3px'
    },
    {
      'head-width': '5px'
    },
    {
      'head-width': '8px'
    },
    {
      'head-width': '10px'
    },
    {
      'head-width': '13px'
    },
    {
      'head-width': '18px'
    },
    {
      'head-width': '23px'
    }
  ]
  const defaultWidthsMapping = {
    'shaft-width': defaultShaftWidths,
    'head-width': defaultArrowheadWidths
  }
  // const defaultColors = [
  //   {
  //     color: '#FFE081',
  //     'border-color': '#9AA1AC',
  //     'text-color-internal': '#FFFFFF'
  //   },
  //   {
  //     color: '#C990C0',
  //     'border-color': '#b261a5',
  //     'text-color-internal': '#FFFFFF'
  //   },
  //   {
  //     color: '#F79767',
  //     'border-color': '#f36924',
  //     'text-color-internal': '#FFFFFF'
  //   },
  //   {
  //     color: '#57C7E3',
  //     'border-color': '#23b3d7',
  //     'text-color-internal': '#FFFFFF'
  //   },
  //   {
  //     color: '#F16667',
  //     'border-color': '#eb2728',
  //     'text-color-internal': '#FFFFFF'
  //   },
  //   {
  //     color: '#D9C8AE',
  //     'border-color': '#c0a378',
  //     'text-color-internal': '#604A0E'
  //   },
  //   {
  //     color: '#8DCC93',
  //     'border-color': '#5db665',
  //     'text-color-internal': '#604A0E'
  //   },
  //   {
  //     color: '#ECB5C9',
  //     'border-color': '#da7298',
  //     'text-color-internal': '#604A0E'
  //   },
  //   {
  //     color: '#4C8EDA',
  //     'border-color': '#2870c2',
  //     'text-color-internal': '#FFFFFF'
  //   },
  //   {
  //     color: '#FFC454',
  //     'border-color': '#d7a013',
  //     'text-color-internal': '#604A0E'
  //   },
  //   {
  //     color: '#DA7194',
  //     'border-color': '#cc3c6c',
  //     'text-color-internal': '#FFFFFF'
  //   },
  //   {
  //     color: '#569480',
  //     'border-color': '#447666',
  //     'text-color-internal': '#FFFFFF'
  //   }
  // ]

  const defaultColors = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(i => {
    return {
      color: `var(--graph-color${i})`,
      'border-color': `var(--border-color${i})`,
      'text-color-internal': 'var(--graph-internal-text-color)'
    }
  })

  const condColors = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(i => {
    return {
      color: `var(--condition-color${i})`,
      'text-color-internal': 'var(--graph-condition-text-color)'
    }
  })

  const defaultShapes = [
    {
      shape: ''
    },
    {
      shape: 'thinRectangle'
    },
    {
      shape: 'ellipse'
    },
    {
      shape: 'rectangle'
    },
    {
      shape: 'circle'
    },
    {
      shape: 'square'
    },
    {
      shape: 'halfCircle'
    },
    {
      shape: 'triangle'
    }
  ]

  const defaultPatterns = [
    {
      pattern: ''
    },
    {
      pattern: 'dashes 1'
    },
    {
      pattern: 'dashes 3'
    },
    {
      pattern: 'dashes 3 1'
    },
    {
      pattern: 'dashes 1 3'
    },
    {
      pattern: 'dashes 1 1 3 1'
    },
    {
      pattern: 'dashes 1 1 3 1 1 1'
    }
  ]
  const Selector = (function() {
    function Selector(this: any, tag1: any, classes1: any) {
      this.tag = tag1
      this.classes = classes1 != null ? classes1 : []
    }

    Selector.prototype.toString = function() {
      return selectorArrayToString([this.tag].concat(this.classes))
    }

    return Selector
  })()

  const StyleRule = (function() {
    function StyleRule(this: any, selector1: any, props1: any) {
      this.selector = selector1
      this.props = props1
    }

    StyleRule.prototype.matches = function(selector: any) {
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

    StyleRule.prototype.matchesExact = function(selector: any) {
      return (
        this.matches(selector) &&
        this.selector.classes.length === selector.classes.length
      )
    }

    return StyleRule
  })()

  const StyleElement = (function() {
    function StyleElement(this: any, selector: any) {
      this.selector = selector
      this.props = {}
    }

    StyleElement.prototype.applyRules = function(rules: any) {
      for (let i = 0; i < rules.length; i++) {
        const rule = rules[i] // Rules are either provided at first loading or added later via updateStyle in GrassEditor.tsx
        if (rule.matches(this.selector)) {
          // find style based on tag of selector (whether it's a node or a relationship)
          this.props = { ...this.props, ...rule.props }
          this.props.caption = this.props.caption || this.props.defaultCaption
        }
      }
      return this
    }

    StyleElement.prototype.applyCondRules = function(rules: any, solvers: any) {
      if (this.selector.tag === 'relationship') {
        let presenceCondition = ''

        if ('condition' in this.selector.classes[0].propertyMap) {
          presenceCondition = this.selector.classes[0].propertyMap['condition']
          if (presenceCondition === '' || presenceCondition === 'true') {
            presenceCondition = 'a \\/ !a'
          }
        }

        for (let i = 0; i < rules.length; i++) {
          const rule = rules[i]
          // if rule concerns a condition
          // and presence condition is not true or empty
          if (
            rule.selector.classes.includes('condRule') &&
            presenceCondition !== '' &&
            presenceCondition !== 'true'
          ) {
            const featureExpression = rule.selector.classes[0]

            // If no solver was created for this presence condition then create one
            if (!solvers[presenceCondition]) {
              solvers[presenceCondition] = {
                solver: new SatSolver(presenceCondition),
                assumptions: {}
              }
            }

            // If the result for this feature expression is not cached yet
            // Check if presence condition is satisfiable assuming the feature expression of interest
            // Save the result in cachedAssumptSolution
            if (
              !(featureExpression in solvers[presenceCondition]['assumptions'])
            ) {
              solvers[presenceCondition]['assumptions'][
                featureExpression
              ] = solvers[presenceCondition]['solver'].solveAssuming(
                featureExpression
              )
            }

            // Look up the satisfiability solution in the cached results
            if (solvers[presenceCondition]['assumptions'][featureExpression]) {
              // If no property is set for this link, create one
              if (Object.keys(this.props).length === 0) {
                this.props = { ...this.props, ...rule.props }
                this.props.pattern = this.props.color
                  ? this.props.pattern || ''
                  : ''
                this.selector.classes[0].color = rule.props.color
                this.props.caption =
                  this.props.caption || this.props.defaultCaption
              } else {
                // Merge rules
                // if (this.props.color === rule.props.color && this.props.pattern === rule.props.pattern) {
                //   this.props = { ...this.props, ...rule.props }
                //   this.props.caption =
                //     this.props.caption || this.props.defaultCaption
                // } else
                // {
                for (const key in rule.props) {
                  if (key === 'color') {
                    if (Array.isArray(this.props.color)) {
                      // If there are multiple colors add one more
                      this.props.color.push(rule.props.color)
                      this.selector.classes[0].color.push(rule.props.color)
                    } else if (this.props.color !== undefined) {
                      // Else create an array with the two colors
                      this.props.color = [this.props.color, rule.props.color]

                      this.selector.classes[0].color = [
                        this.selector.classes[0].color,
                        rule.props.color
                      ]
                    } else {
                      this.props.color = [rule.props.color]
                    }

                    if (Array.isArray(this.props.pattern)) {
                      // If there are multiple patterns add one more
                      this.props.pattern.push(rule.props.pattern || '')
                    } else if (this.props.pattern !== undefined) {
                      // Else create an array with the two patterns
                      this.props.pattern = [
                        this.props.pattern,
                        rule.props.pattern || ''
                      ]
                    } else {
                      this.props.pattern = [rule.props.pattern || '']
                    }
                  } else if (key === 'pattern') {
                    // if (rule.props.color) {
                    //   if (Array.isArray(this.props.pattern)) {
                    //     // If there are multiple patterns add one more
                    //     this.props.pattern.push(rule.props.pattern || '')
                    //   } else if (this.props.pattern) {
                    //     // Else create an array with the two patterns
                    //     this.props.pattern = [this.props.pattern, rule.props.pattern || '']
                    //   } else {
                    //     this.props.pattern = [rule.props.pattern || '']
                    //   }
                    // }
                  } else {
                    this.props[key] = rule.props[key]
                  }
                }
                // }
              }
            }
          } else {
            // TODO: if condition = true or empty
            // All rules regarding any condition should apply
          }
        }
      }

      return this
    }

    StyleElement.prototype.get = function(attr: any) {
      return this.props[attr] || ''
    }

    return StyleElement
  })()

  const GraphStyle = (function() {
    function GraphStyle(this: any) {
      this.rules = []
      // this.lastNumberOfRulesApplied = {}
      // this.ruleColor = {}
      this.solvers = {}
      try {
        this.loadRules()
      } catch (_error) {
        // e = _error
      }
    }

    const parseSelector = function(key: any) {
      let tokens
      if (key.includes('condRule')) {
        tokens = key.split('.')
      } else {
        tokens = selectorStringToArray(key)
      }
      // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
      return new Selector(tokens[0], tokens.slice(1))
    }

    const selector = function(item: any) {
      if (item.isNode) {
        return nodeSelector(item)
      } else if (item.isRelationship) {
        return relationshipSelector(item)
      }
    }

    const nodeSelector = function(node: any = {}) {
      const classes = node.labels != null ? node.labels : []
      // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
      return new Selector('node', classes)
    }

    const relationshipSelector = function(rel: any = {}) {
      const classes = rel.type != null ? [rel.type] : []
      // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
      return new Selector('relationship', classes)
    }

    const conditionSelector = function(cond: any) {
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
      // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
      return new Selector('relationship', classes)
    }

    const findRule = function(selector: any, rules: any) {
      for (let i = 0; i < rules.length; i++) {
        const rule = rules[i]
        if (rule.matchesExact(selector)) {
          return rule
        }
      }
    }

    const findAvailableCondColor = function(rules: any[]) {
      const usedColors = rules
        .filter(rule => rule.selector.classes.includes('condRule'))
        .filter(rule => rule.props.color !== null)
        .map(rule => rule.props.color)

      for (const entry of condColors) {
        if (!usedColors.includes(entry.color)) return entry
      }
      return condColors[0]
    }

    const findAvailableDefaultColor = function(rules: any) {
      const usedColors = rules
        .filter((rule: any) => {
          return rule.props.color != null
        })
        .map((rule: any) => {
          return rule.props.color
        })
      const index =
        // @ts-expect-error ts-migrate(2365) FIXME: Operator '>' cannot be applied to types 'number' a... Remove this comment to see the full error message
        usedColors.length - 1 > defaultColors ? 0 : usedColors.length - 1
      return defaultColors[index]
    }

    const findAvailableDefaultShapes = function(rules: any) {
      const usedShapes = rules
        .filter((rule: any) => {
          return rule.props.shape != null
        })
        .map((rule: any) => {
          return rule.props.shape
        })
      const index =
        usedShapes.length > defaultShapes.length - 1 ? 0 : usedShapes.length
      return defaultShapes[index]
    }

    const findAvailableDefaultPatterns = function(rules: any) {
      const usedPatterns = rules
        .filter((rule: any) => {
          return rule.props.pattern != null
        })
        .map((rule: any) => {
          return rule.props.pattern
        })
      const index =
        usedPatterns.length > defaultPatterns.length - 1
          ? 0
          : usedPatterns.length
      return defaultPatterns[index]
    }

    const getDefaultNodeCaption = function(item: any) {
      if (
        !item ||
        // @ts-expect-error ts-migrate(2365) FIXME: Operator '>' cannot be applied to types 'boolean' ... Remove this comment to see the full error message
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
      let defaultCaption = captionPrioOrder.reduceRight((leading, current) => {
        const hits = item.propertyList.filter((prop: any) =>
          current.test(prop.key)
        )
        if (hits.length) {
          return `{${hits[0].key}}`
        } else {
          return leading
        }
      }, '')
      defaultCaption || (defaultCaption = '<id>')
      return {
        caption: defaultCaption
      }
    }

    GraphStyle.prototype.calculateStyle = function(selector: any) {
      // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
      return new StyleElement(selector).applyRules(this.rules)
    }

    GraphStyle.prototype.checkColorChange = function() {
      for (let i = 0; i < this.rules.length; i++) {
        const rule = this.rules[i]
        if (this.ruleColor[i] !== rule.props.color) return true
      }
      return false
    }

    GraphStyle.prototype.calculateCondStyle = function(selector: any) {
      // if (selector.classes[0].id in this.lastNumberOfRulesApplied) {
      //   if (this.rules.length !== this.lastNumberOfRulesApplied[selector.classes[0].id] || this.checkColorChange()) {
      //     this.lastNumberOfRulesApplied[selector.classes[0].id] = this.rules.length
      //     for (let i = 0; i < this.rules.length; i++) {
      //       let rule = this.rules[i]
      //       this.ruleColor[i] = rule.props.color
      //     }
      //     return new StyleElement(selector).applyCondRules(this.rules)
      //   } else {
      //     return new StyleElement(selector)
      //   }
      // } else {
      //   this.lastNumberOfRulesApplied[selector.classes[0].id] = this.rules.length
      //   for (let i = 0; i < this.rules.length; i++) {
      //     let rule = this.rules[i]
      //     this.ruleColor[i] = rule.props.color
      //   }
      //   return new StyleElement(selector).applyCondRules(this.rules)
      // }
      // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
      return new StyleElement(selector).applyCondRules(this.rules, this.solvers)
    }

    GraphStyle.prototype.forEntity = function(item: any) {
      return this.calculateStyle(selector(item))
    }

    GraphStyle.prototype.setDefaultNodeStyling = function(
      selector: any,
      item: any
    ) {
      let defaultColor = true
      let defaultCaption = true
      for (let i = 0; i < this.rules.length; i++) {
        const rule = this.rules[i]
        if (rule.selector.classes.length > 0 && rule.matches(selector)) {
          if (rule.props.hasOwnProperty('color')) {
            defaultColor = false
          }
          if (rule.props.hasOwnProperty('caption')) {
            defaultCaption = false
          }
        }
      }
      // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
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

    GraphStyle.prototype.setDefaultRelationshipStyling = function(
      selector: any
    ) {
      let defaultShape = true
      let defaultPattern = true
      for (let i = 0; i < this.rules.length; i++) {
        const rule = this.rules[i]
        if (rule.selector.classes.length > 0 && rule.matches(selector)) {
          if (rule.props.hasOwnProperty('shape')) {
            defaultShape = false
          }
          if (rule.props.hasOwnProperty('pattern')) {
            defaultPattern = false
          }
        }
      }
      // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
      const minimalSelector = new Selector(
        selector.tag,
        selector.classes.sort().slice(0, 1)
      )
      if (defaultShape && selector.classes.length) {
        this.changeForSelector(
          minimalSelector,
          findAvailableDefaultShapes(this.rules)
        )
      }
      if (defaultPattern && selector.classes.length) {
        this.changeForSelector(
          minimalSelector,
          findAvailableDefaultPatterns(this.rules)
        )
      }
    }

    GraphStyle.prototype.changeForSelector = function(
      selector: any,
      props: any
    ) {
      let rule = findRule(selector, this.rules)
      if (rule == null) {
        // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
        rule = new StyleRule(selector, props)
        this.rules.push(rule)
      }
      rule.props = { ...rule.props, ...props }
      return rule
    }

    GraphStyle.prototype.addCondition = function(condition: string) {
      return this.changeForSelector(
        this.forCondition(condition).selector,
        findAvailableCondColor(this.rules)
      )
    }

    GraphStyle.prototype.destroyRule = function(rule: any) {
      const idx = this.rules.indexOf(rule)
      if (idx != null) {
        this.rules.splice(idx, 1)
      }
    }

    GraphStyle.prototype.destroySelector = function(selector: any) {
      const rule = findRule(selector, this.rules)
      if (rule) this.destroyRule(rule)
    }

    GraphStyle.prototype.importGrass = function(string: any) {
      try {
        const rules = this.parse(string)
        return this.loadRules(rules)
      } catch (_error) {
        // e = _error
      }
    }

    GraphStyle.prototype.parse = function(string: any) {
      const chars = string.split('')
      let insideString = false
      let insideProps = false
      let keyword = ''
      let props = ''
      const rules: any = {}
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
            // @ts-expect-error ts-migrate(2447) FIXME: The '^=' operator is not allowed for boolean types... Remove this comment to see the full error message
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
      for (const k in rules) {
        const v = rules[k]
        rules[k] = {}
        v.split(';').forEach((prop: any) => {
          const [key, val] = prop.split(':')
          if (key && val) {
            rules[k][key.trim()] = val.trim()
          }
        })
      }
      return rules
    }

    GraphStyle.prototype.resetToDefault = function() {
      this.loadRules()
      return true
    }

    GraphStyle.prototype.toSheet = function() {
      const sheet: any = {}
      this.rules.forEach((rule: any) => {
        sheet[rule.selector.toString()] = rule.props
      })
      return sheet
    }

    GraphStyle.prototype.toString = function() {
      let str = ''
      this.rules.forEach((r: any) => {
        str += `${r.selector.toString()} {\n`
        for (const k in r.props) {
          let v = r.props[k]
          if (k === 'caption') {
            v = `'${v}'`
          }
          str += `  ${k}: ${v};\n`
        }
        str += '}\n\n'
      })
      return str
    }

    GraphStyle.prototype.loadRules = function(data: any) {
      const localData = typeof data === 'object' ? data : defaultStyle
      this.rules.length = 0
      for (const key in localData) {
        const props = localData[key]
        // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
        this.rules.push(new StyleRule(parseSelector(key), props))
      }
      return this
    }

    GraphStyle.prototype.defaultSizes = function() {
      return defaultSizes
    }

    GraphStyle.prototype.defaultIconCodes = function() {
      return defaultIconCodes
    }

    GraphStyle.prototype.defaultArrayWidths = function(
      property: 'shaft-width' | 'head-width'
    ) {
      return defaultWidthsMapping[property]
    }

    GraphStyle.prototype.defaultColors = function() {
      return defaultColors
    }

    GraphStyle.prototype.condColors = function() {
      return condColors
    }

    GraphStyle.prototype.interpolate = function(str: any, item: any) {
      let ips = str.replace(/\{([^{}]*)\}/g, (_a: any, b: any) => {
        const r = item.propertyMap[b]
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
      return ips.replace(/^<(id|type)>$/, (_a: any, b: any) => {
        const r = item[b]
        if (typeof r === 'string' || typeof r === 'number') {
          return r
        }
        return ''
      })
    }

    GraphStyle.prototype.forNode = function(node: any = {}) {
      const selector = nodeSelector(node)
      if ((node.labels != null ? node.labels.length : 0) > 0) {
        this.setDefaultNodeStyling(selector, node)
      }
      return this.calculateStyle(selector)
    }

    GraphStyle.prototype.forRelationship = function(rel: any) {
      const selector = relationshipSelector(rel)
      this.setDefaultRelationshipStyling(selector, rel)
      return this.calculateStyle(selector)
    }

    GraphStyle.prototype.forCondition = function(cond: any) {
      const selector = conditionSelector(cond)
      return this.calculateStyle(selector)
    }

    GraphStyle.prototype.forCondRel = function(rel: any) {
      const selector = conditionSelector(rel)
      // TODO: if it is called from ongraphchange then calculatecondstyle
      // if called from ontick just return the selector for the relationship with the appropriate styling rules
      const resultCond = this.calculateCondStyle(selector)
      const result = this.calculateStyle(selector)
      return resultCond
    }
    return GraphStyle
  })()
  // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
  return new GraphStyle()
}
