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

import neo4j from 'neo4j-driver'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { deepEquals } from 'services/utils'
import * as grassActions from 'shared/modules/grass/grassDuck'
import bolt from 'services/bolt/bolt'
import { withBus } from 'react-suber'
import Explorer from '../../D3Visualization/components/Explorer'
import { StyledVisContainer } from './VisualizationView.styled'

import { CYPHER_REQUEST } from 'shared/modules/cypher/cypherDuck'
import { NEO4J_BROWSER_USER_ACTION_QUERY } from 'services/bolt/txMetadata'
import { getMaxFieldItems } from 'shared/modules/settings/settingsDuck'
import { resultHasTruncatedFields } from 'browser/modules/Stream/CypherFrame/helpers'
import { toInteger } from 'lodash-es'

type VisualizationState = any

export class Visualization extends Component<any, VisualizationState> {
  autoCompleteCallback: any
  graph: any
  state: any = {
    nodes: [],
    relationships: []
  }

  componentDidMount() {
    const { records = [] } = this.props.result
    if (records && records.length > 0) {
      this.populateDataToStateFromProps(this.props)
    }
  }

  shouldComponentUpdate(props: any, state: VisualizationState) {
    return (
      this.props.updated !== props.updated ||
      this.props.fullscreen !== props.fullscreen ||
      !deepEquals(props.graphStyleData, this.props.graphStyleData) ||
      this.state.updated !== state.updated ||
      this.props.frameHeight !== props.frameHeight ||
      this.props.autoComplete !== props.autoComplete
    )
  }

  componentDidUpdate(prevProps: any) {
    if (
      this.props.updated !== prevProps.updated ||
      this.props.autoComplete !== prevProps.autoComplete
    ) {
      this.populateDataToStateFromProps(this.props)
    }
  }

  populateDataToStateFromProps(props: any) {
    const {
      nodes,
      relationships
    } = bolt.extractNodesAndRelationshipsFromRecordsForOldVis(
      props.result.records,
      true,
      props.maxFieldItems
    )
    const hasTruncatedFields = resultHasTruncatedFields(
      props.result,
      props.maxFieldItems
    )
    this.setState({
      nodes,
      relationships,
      hasTruncatedFields,
      updated: new Date().getTime()
    })
  }

  autoCompleteRelationships(existingNodes: any, newNodes: any) {
    if (this.props.autoComplete) {
      const existingNodeIds = existingNodes.map((node: any) =>
        parseInt(node.id)
      )
      const newNodeIds = newNodes.map((node: any) => parseInt(node.id))

      this.getInternalRelationships(existingNodeIds, newNodeIds)
        .then(graph => {
          this.autoCompleteCallback &&
            this.autoCompleteCallback(graph.relationships)
        })
        .catch(() => {})
    } else {
      this.autoCompleteCallback && this.autoCompleteCallback([])
    }
  }

  getNeighbours(id: any, currentNeighbourIds = []) {
    const query = `MATCH path = (a)-[r]-(o)
                   WITH count(r) as c, a, r, o, path
                   WHERE id(a) = ${id}
                   AND NOT (id(o) IN[${currentNeighbourIds.join(',')}])
                   RETURN path, c
                   ORDER BY id(o)
                   LIMIT ${this.props.maxNeighbours -
                     currentNeighbourIds.length}`
    return new Promise((resolve, reject) => {
      this.props.bus &&
        this.props.bus.self(
          CYPHER_REQUEST,
          { query: query, queryType: NEO4J_BROWSER_USER_ACTION_QUERY },
          (response: any) => {
            if (!response.success) {
              reject(new Error())
            } else {
              const count =
                response.result.records.length > 0
                  ? parseInt(response.result.records[0].get('c').toString())
                  : 0
              const resultGraph = bolt.extractNodesAndRelationshipsFromRecordsForOldVis(
                response.result.records,
                false,
                this.props.maxFieldItems
              )
              this.autoCompleteRelationships(
                this.graph._nodes,
                resultGraph.nodes
              )
              resolve({ ...resultGraph, count: count })
            }
          }
        )
    })
  }

  getVarWriteNeighbours(id: any, currentNeighbourIds = []) {
    const query = `MATCH path = (a)-[r:varWrite]->(o)
                   WITH count(r) as c, a, r, o, path
                   WHERE id(a) = ${id}
                   AND NOT (id(o) IN[${currentNeighbourIds.join(',')}])
                   RETURN path, c
                   ORDER BY id(o)
                   LIMIT ${this.props.maxNeighbours -
                     currentNeighbourIds.length}`
    return new Promise((resolve, reject) => {
      this.props.bus &&
        this.props.bus.self(
          CYPHER_REQUEST,
          { query: query, queryType: NEO4J_BROWSER_USER_ACTION_QUERY },
          (response: any) => {
            if (!response.success) {
              reject(new Error())
            } else {
              const count =
                response.result.records.length > 0
                  ? parseInt(response.result.records[0].get('c').toString())
                  : 0
              const resultGraph = bolt.extractNodesAndRelationshipsFromRecordsForOldVis(
                response.result.records,
                false,
                this.props.maxFieldItems
              )
              this.autoCompleteRelationships(
                this.graph._nodes,
                resultGraph.nodes
              )
              resolve({ ...resultGraph, count: count })
            }
          }
        )
    })
  }

  getEdgeTypeNeighbours(id: any, edgeType: any, currentNeighbourIds = []) {
    const query = `MATCH path = (a)-[r:${edgeType}]-(o)
                   WITH count(r) as c, a, r, o, path
                   WHERE id(a) = ${id}
                   AND NOT (id(o) IN[${currentNeighbourIds.join(',')}])
                   RETURN path, c
                   ORDER BY id(o)
                   LIMIT ${this.props.maxNeighbours -
                     currentNeighbourIds.length}`
    return new Promise((resolve, reject) => {
      this.props.bus &&
        this.props.bus.self(
          CYPHER_REQUEST,
          { query: query, queryType: NEO4J_BROWSER_USER_ACTION_QUERY },
          (response: any) => {
            if (!response.success) {
              reject(new Error())
            } else {
              const count =
                response.result.records.length > 0
                  ? parseInt(response.result.records[0].get('c').toString())
                  : 0
              const resultGraph = bolt.extractNodesAndRelationshipsFromRecordsForOldVis(
                response.result.records,
                false,
                this.props.maxFieldItems
              )
              this.autoCompleteRelationships(
                this.graph._nodes,
                resultGraph.nodes
              )
              resolve({ ...resultGraph, count: count })
            }
          }
        )
    })
  }

  getWhoCanCallThis(id: any, currentNeighbourIds = []) {
    const query = `MATCH path = (f1:cFunction)-[:call]->(f2:cFunction)
                   WHERE id(f2) = ${id}
                   AND NOT (id(f1) IN[${currentNeighbourIds.join(',')}])
                   RETURN distinct path`
    return new Promise((resolve, reject) => {
      this.props.bus &&
        this.props.bus.self(
          CYPHER_REQUEST,
          { query: query, queryType: NEO4J_BROWSER_USER_ACTION_QUERY },
          (response: any) => {
            if (!response.success) {
              reject(new Error())
            } else {
              // const count =
              //   response.result.records.length > 0
              //     ? parseInt(response.result.records[0].get('c').toString())
              //     : 0
              const resultGraph = bolt.extractNodesAndRelationshipsFromRecordsForOldVis(
                response.result.records,
                false,
                this.props.maxFieldItems
              )
              this.autoCompleteRelationships(
                this.graph._nodes,
                resultGraph.nodes
              )
              // resolve({ ...resultGraph, count: count })
              resolve({ ...resultGraph })
            }
          }
        )
    })
  }

  getWhatAreTheArgs(id: any, currentNeighbourIds = []) {
    const query = `MATCH path = (f1:cFunction)-[:contain]->(v1:cVariable{isParam:"1"})
    WHERE id(f1) = ${id}
    AND NOT (id(v1) IN[${currentNeighbourIds.join(',')}])
    RETURN distinct path`
    return new Promise((resolve, reject) => {
      this.props.bus &&
        this.props.bus.self(
          CYPHER_REQUEST,
          { query: query, queryType: NEO4J_BROWSER_USER_ACTION_QUERY },
          (response: any) => {
            if (!response.success) {
              reject(new Error())
            } else {
              // const count =
              //   response.result.records.length > 0
              //     ? parseInt(response.result.records[0].get('c').toString())
              //     : 0
              const resultGraph = bolt.extractNodesAndRelationshipsFromRecordsForOldVis(
                response.result.records,
                false,
                this.props.maxFieldItems
              )
              this.autoCompleteRelationships(
                this.graph._nodes,
                resultGraph.nodes
              )
              // resolve({ ...resultGraph, count: count })
              resolve({ ...resultGraph })
            }
          }
        )
    })
  }

  //  The type hierarchy path is missing
  //  MATCH (t1)-[:inherit*1..]->(t2:type)
  //  MATCH (t1)<-[:inherit*1..]-(t3:type)
  //  RETURN *

  getInWhichClassIsItDefined(id: any, currentNeighbourIds = []) {
    const query = `MATCH path = (f1:cFunction)<-[:contain]-(c1:cClass)
                   WHERE id(f1) = ${id}
                   AND NOT (id(c1) IN[${currentNeighbourIds.join(',')}])
                   RETURN distinct path`
    return new Promise((resolve, reject) => {
      this.props.bus &&
        this.props.bus.self(
          CYPHER_REQUEST,
          { query: query, queryType: NEO4J_BROWSER_USER_ACTION_QUERY },
          (response: any) => {
            if (!response.success) {
              reject(new Error())
            } else {
              // const count =
              //   response.result.records.length > 0
              //     ? parseInt(response.result.records[0].get('c').toString())
              //     : 0
              const resultGraph = bolt.extractNodesAndRelationshipsFromRecordsForOldVis(
                response.result.records,
                false,
                this.props.maxFieldItems
              )
              this.autoCompleteRelationships(
                this.graph._nodes,
                resultGraph.nodes
              )
              // resolve({ ...resultGraph, count: count })
              resolve({ ...resultGraph })
            }
          }
        )
    })
  }

  getWhereIsMethodCalled(id: any, currentNeighbourIds = []) {
    const query = `MATCH path1 = (f1:cFunction)-[:call]->(f2:cFunction)
                   MATCH path2 = (f1)-[r1:callSource]->(cfgNode:cCFGBlock)<-[r2]-(f2)
                   WHERE id(f2) = ${id}
                   AND type(r2) CONTAINS "Destination"
                   AND NOT (id(f2) IN[${currentNeighbourIds.join(',')}])
                   RETURN distinct path1, path2`
    return new Promise((resolve, reject) => {
      this.props.bus &&
        this.props.bus.self(
          CYPHER_REQUEST,
          { query: query, queryType: NEO4J_BROWSER_USER_ACTION_QUERY },
          (response: any) => {
            if (!response.success) {
              reject(new Error())
            } else {
              // const count =
              //   response.result.records.length > 0
              //     ? parseInt(response.result.records[0].get('c').toString())
              //     : 0
              const resultGraph = bolt.extractNodesAndRelationshipsFromRecordsForOldVis(
                response.result.records,
                false,
                this.props.maxFieldItems
              )
              this.autoCompleteRelationships(
                this.graph._nodes,
                resultGraph.nodes
              )
              // resolve({ ...resultGraph, count: count })
              resolve({ ...resultGraph })
            }
          }
        )
    })
  }

  getAreAllCallsComingFromSameClass(id: any, currentNeighbourIds = []) {
    const query = `MATCH path = (c1:cClass)-[:contain]->(f1:cFunction)-[:call]->(f2:cFunction)
                   WHERE id(f2) = ${id}
                   AND NOT (id(f1) IN[${currentNeighbourIds.join(',')}])
                   AND NOT (id(c1) IN[${currentNeighbourIds.join(',')}])
                   RETURN distinct path`
    return new Promise((resolve, reject) => {
      this.props.bus &&
        this.props.bus.self(
          CYPHER_REQUEST,
          { query: query, queryType: NEO4J_BROWSER_USER_ACTION_QUERY },
          (response: any) => {
            if (!response.success) {
              reject(new Error())
            } else {
              // const count =
              //   response.result.records.length > 0
              //     ? parseInt(response.result.records[0].get('c').toString())
              //     : 0
              const resultGraph = bolt.extractNodesAndRelationshipsFromRecordsForOldVis(
                response.result.records,
                false,
                this.props.maxFieldItems
              )
              this.autoCompleteRelationships(
                this.graph._nodes,
                resultGraph.nodes
              )
              // resolve({ ...resultGraph, count: count })
              resolve({ ...resultGraph })
            }
          }
        )
    })
  }

  getWhatCanUpdatethis(id: any, currentNeighbourIds = []) {
    const query = `MATCH path = (f:cFunction)-[:write]->(target:cVariable)
                   WHERE id(target) = ${id}
                   AND NOT (id(f) IN[${currentNeighbourIds.join(',')}])
                   RETURN distinct path`
    return new Promise((resolve, reject) => {
      this.props.bus &&
        this.props.bus.self(
          CYPHER_REQUEST,
          { query: query, queryType: NEO4J_BROWSER_USER_ACTION_QUERY },
          (response: any) => {
            if (!response.success) {
              reject(new Error())
            } else {
              // const count =
              //   response.result.records.length > 0
              //     ? parseInt(response.result.records[0].get('c').toString())
              //     : 0
              const resultGraph = bolt.extractNodesAndRelationshipsFromRecordsForOldVis(
                response.result.records,
                false,
                this.props.maxFieldItems
              )
              this.autoCompleteRelationships(
                this.graph._nodes,
                resultGraph.nodes
              )
              // resolve({ ...resultGraph, count: count })
              resolve({ ...resultGraph })
            }
          }
        )
    })
  }

  getWhereIsItDeclared(id: any, currentNeighbourIds = []) {
    const query = `MATCH path = (field:cVariable)<-[:contain]-(containingEntity)
                   WHERE id(field) = ${id}
                   AND NOT (id(containingEntity) IN[${currentNeighbourIds.join(
                     ','
                   )}])
                   RETURN distinct path`
    return new Promise((resolve, reject) => {
      this.props.bus &&
        this.props.bus.self(
          CYPHER_REQUEST,
          { query: query, queryType: NEO4J_BROWSER_USER_ACTION_QUERY },
          (response: any) => {
            if (!response.success) {
              reject(new Error())
            } else {
              // const count =
              //   response.result.records.length > 0
              //     ? parseInt(response.result.records[0].get('c').toString())
              //     : 0
              const resultGraph = bolt.extractNodesAndRelationshipsFromRecordsForOldVis(
                response.result.records,
                false,
                this.props.maxFieldItems
              )
              this.autoCompleteRelationships(
                this.graph._nodes,
                resultGraph.nodes
              )
              // resolve({ ...resultGraph, count: count })
              resolve({ ...resultGraph })
            }
          }
        )
    })
  }

  //Requires reviewing
  getWhereIsItAccessed(id: any, currentNeighbourIds = []) {
    const query = `MATCH path1 = (v: cVariable)-[:obj]->(c:cClass)
                   MATCH path2 = (c)-[:contain]->(f:cVariable)
                   WHERE id(v) = ${id}
                   AND NOT (id(c) IN[${currentNeighbourIds.join(',')}])
                   AND NOT (id(f) IN[${currentNeighbourIds.join(',')}])
                   RETURN distinct path1, path2`
    return new Promise((resolve, reject) => {
      this.props.bus &&
        this.props.bus.self(
          CYPHER_REQUEST,
          { query: query, queryType: NEO4J_BROWSER_USER_ACTION_QUERY },
          (response: any) => {
            if (!response.success) {
              reject(new Error())
            } else {
              // const count =
              //   response.result.records.length > 0
              //     ? parseInt(response.result.records[0].get('c').toString())
              //     : 0
              const resultGraph = bolt.extractNodesAndRelationshipsFromRecordsForOldVis(
                response.result.records,
                false,
                this.props.maxFieldItems
              )
              this.autoCompleteRelationships(
                this.graph._nodes,
                resultGraph.nodes
              )
              // resolve({ ...resultGraph, count: count })
              resolve({ ...resultGraph })
            }
          }
        )
    })
  }

  getWhereAreInstancesCreated(id: any, currentNeighbourIds = []) {
    const query = `MATCH path = (t:cClass)<-[:instanceOf]-(v)
                   WHERE id(t) = ${id}
                   AND NOT (id(v) IN[${currentNeighbourIds.join(',')}])
                   RETURN distinct path`
    return new Promise((resolve, reject) => {
      this.props.bus &&
        this.props.bus.self(
          CYPHER_REQUEST,
          { query: query, queryType: NEO4J_BROWSER_USER_ACTION_QUERY },
          (response: any) => {
            if (!response.success) {
              reject(new Error())
            } else {
              // const count =
              //   response.result.records.length > 0
              //     ? parseInt(response.result.records[0].get('c').toString())
              //     : 0
              const resultGraph = bolt.extractNodesAndRelationshipsFromRecordsForOldVis(
                response.result.records,
                false,
                this.props.maxFieldItems
              )
              this.autoCompleteRelationships(
                this.graph._nodes,
                resultGraph.nodes
              )
              // resolve({ ...resultGraph, count: count })
              resolve({ ...resultGraph })
            }
          }
        )
    })
  }

  // MATCH (v: cVariable{id:"decl;main()::graphApp;;"})-[:obj]->(c:cClass)
  //  MATCH (c)-[:contain]->(f:cVariable)
  //  RETURN f;

  getWhatDataCanWeAccess(id: any, currentNeighbourIds = []) {
    const query = `MATCH path1 = (v: cVariable)-[:instanceOf]->(c:cClass)
                   MATCH path2 = (c)-[:contain]->(f:cVariable)
                   WHERE id(v) = ${id}
                   AND NOT (id(c) IN[${currentNeighbourIds.join(',')}])
                   AND NOT (id(f) IN[${currentNeighbourIds.join(',')}])
                   RETURN distinct path1, path2`
    return new Promise((resolve, reject) => {
      this.props.bus &&
        this.props.bus.self(
          CYPHER_REQUEST,
          { query: query, queryType: NEO4J_BROWSER_USER_ACTION_QUERY },
          (response: any) => {
            if (!response.success) {
              reject(new Error())
            } else {
              // const count =
              //   response.result.records.length > 0
              //     ? parseInt(response.result.records[0].get('c').toString())
              //     : 0
              const resultGraph = bolt.extractNodesAndRelationshipsFromRecordsForOldVis(
                response.result.records,
                false,
                this.props.maxFieldItems
              )
              this.autoCompleteRelationships(
                this.graph._nodes,
                resultGraph.nodes
              )
              // resolve({ ...resultGraph, count: count })
              resolve({ ...resultGraph })
            }
          }
        )
    })
  }

  getHiddenEdgesTypes(id: any, currentNeighbourIds = []) {
    const query = `MATCH path = (a)-[r]-(o)
                   WITH a, r, o, path, type(r) as edgeType, count(r) as total
                    WHERE id(a) = ${id}
                   AND NOT (id(o) IN[${currentNeighbourIds.join(',')}])
                   RETURN DISTINCT edgeType, total`

    return new Promise((resolve, reject) => {
      this.props.bus &&
        this.props.bus.self(
          CYPHER_REQUEST,
          { query: query, queryType: NEO4J_BROWSER_USER_ACTION_QUERY },
          (response: any) => {
            if (!response.success) {
              reject(new Error())
            } else {
              const types = bolt
                .recordsToJSON(response.result.records)
                .map((it: any) => {
                  it.total = toInteger(it.total)
                  return it
                })
              resolve({ ...types })
            }
          }
        )
    })
  }

  getInternalRelationships(existingNodeIds: any, newNodeIds: any) {
    newNodeIds = newNodeIds.map(neo4j.int)
    existingNodeIds = existingNodeIds.map(neo4j.int)
    existingNodeIds = existingNodeIds.concat(newNodeIds)
    const query =
      'MATCH (a)-[r]->(b) WHERE id(a) IN $existingNodeIds AND id(b) IN $newNodeIds RETURN r;'
    return new Promise<any>((resolve, reject) => {
      this.props.bus &&
        this.props.bus.self(
          CYPHER_REQUEST,
          {
            query,
            params: { existingNodeIds, newNodeIds },
            queryType: NEO4J_BROWSER_USER_ACTION_QUERY
          },
          (response: any) => {
            if (!response.success) {
              reject(new Error())
            } else {
              resolve({
                ...bolt.extractNodesAndRelationshipsFromRecordsForOldVis(
                  response.result.records,
                  false,
                  this.props.maxFieldItems
                )
              })
            }
          }
        )
    })
  }

  setGraph(graph: any) {
    this.graph = graph
    this.autoCompleteRelationships([], this.graph._nodes)
  }

  render() {
    if (!this.state.nodes.length) return null

    return (
      <StyledVisContainer fullscreen={this.props.fullscreen}>
        <Explorer
          maxNeighbours={this.props.maxNeighbours}
          hasTruncatedFields={this.state.hasTruncatedFields}
          initialNodeDisplay={this.props.initialNodeDisplay}
          graphStyleData={this.props.graphStyleData}
          updateStyle={this.props.updateStyle}
          getNeighbours={this.getNeighbours.bind(this)}
          getVarWriteNeighbours={this.getVarWriteNeighbours.bind(this)}
          getEdgeTypeNeighbours={this.getEdgeTypeNeighbours.bind(this)}
          getHiddenEdgesTypes={this.getHiddenEdgesTypes.bind(this)}
          getWhoCanCallThis={this.getWhoCanCallThis.bind(this)}
          getWhatAreTheArgs={this.getWhatAreTheArgs.bind(this)}
          getInWhichClassIsItDefined={this.getInWhichClassIsItDefined.bind(
            this
          )}
          getWhereIsMethodCalled={this.getWhereIsMethodCalled.bind(this)}
          getAreAllCallsComingFromSameClass={this.getAreAllCallsComingFromSameClass.bind(
            this
          )}
          getWhatCanUpdatethis={this.getWhatCanUpdatethis.bind(this)}
          getWhereIsItDeclared={this.getWhereIsItDeclared.bind(this)}
          getWhereIsItAccessed={this.getWhereIsItAccessed.bind(this)}
          getWhereAreInstancesCreated={this.getWhereAreInstancesCreated.bind(
            this
          )}
          getWhatDataCanWeAccess={this.getWhatDataCanWeAccess.bind(this)}
          nodes={this.state.nodes}
          relationships={this.state.relationships}
          fullscreen={this.props.fullscreen}
          frameHeight={this.props.frameHeight}
          assignVisElement={this.props.assignVisElement}
          getAutoCompleteCallback={(callback: any) => {
            this.autoCompleteCallback = callback
          }}
          setGraph={this.setGraph.bind(this)}
        />
      </StyledVisContainer>
    )
  }
}

const mapStateToProps = (state: any) => {
  return {
    graphStyleData: grassActions.getGraphStyleData(state),
    maxFieldItems: getMaxFieldItems(state)
  }
}

const mapDispatchToProps = (dispatch: any) => {
  return {
    updateStyle: (graphStyleData: any) => {
      dispatch(grassActions.updateGraphStyleData(graphStyleData))
    }
  }
}

export const VisualizationConnectedBus = withBus(
  connect(mapStateToProps, mapDispatchToProps)(Visualization)
)
