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
 *
 *
 */

// ---

import React from 'react'
import ManualLink from 'browser-components/ManualLink'
import Slide from '../../modules/Carousel/Slide'
import NameForm from '../../modules/Carousel/NameForm'
// import customizationGif from './assets/images/customizeVisual.gif'

// logAnswer() {
//   console.log()
// }

const title = 'User study'
const category = 'graphExamples'

// var button = document.getElementById('btn');
// button.addEventListener('click', function () {
//   // var message = $('textarea').val();
//   // console.log(message);
// })

// const timestamp = Math.floor((Date.now() - this.state.start) / 1000)
// localStorage.setItem('filter', filterLog)

const slides = [
  <Slide key="s1">
    <div className="col-sm-3">
      <h3>Task 1</h3>
      <p className="lead">
        For this task, you will have to run the following query:
        <pre className="pre-scrollable code runnable remove-play-icon">
          {
            'MATCH (n)-[r]-(m) WHERE r.condition <> "true" and m.label = "BFS" and n.label <> "kBFS" RETURN *'
          }
        </pre>
      </p>
    </div>
    <div className="col-sm-9">
      <div>
        <h5>
          Considering a variant with original configuration equal to kUndirected
          /\ !kDirected /\ !kWeighted /\ !kDFS /\ kBFS, list the labels of the
          nodes that <b>stop</b> interacting with function BFS if the feature
          kWeighted is enabled.
        </h5>
        <NameForm id="answer1a" />
        {/*         
        <textarea id="1a" rows={5} cols={50}/>
        <br />
        <input type="button" value="Clear" onclick="eraseText"></input> */}
      </div>
    </div>
  </Slide>,
  <Slide key="s2">
    <div className="col-sm-3">
      <h3>Task 1</h3>
      <p className="lead">
        For this task, you will have to run the following query:
        <pre className="pre-scrollable code runnable remove-play-icon">
          {
            'MATCH (n)-[r]-(m) WHERE r.condition <> "true" and m.label = "BFS" and n.label <> "kBFS" RETURN *'
          }
        </pre>
      </p>
    </div>
    <div className="col-sm-9">
      <div>
        <h5>
          Considering a variant with original configuration equal to kUndirected
          /\ !kDirected /\ !kWeighted /\ !kDFS /\ kBFS, list the labels of the
          nodes that <b>start</b> interacting with function BFS if the feature
          kWeighted is enabled.
        </h5>
        <NameForm id="answer1b" />
      </div>
    </div>
  </Slide>,
  <Slide key="s3">
    <div className="col-sm-3">
      <h3>Task 1</h3>
      <p className="lead">
        For this task, you will have to run the following query:
        <pre className="pre-scrollable code runnable remove-play-icon">
          {
            'MATCH (n)-[r]-(m) WHERE r.condition <> "true" and m.label = "BFS" and n.label <> "kBFS" RETURN *'
          }
        </pre>
      </p>
    </div>
    <div className="col-sm-9">
      <div>
        <h5>
          Considering a variant with original configuration equal to kUndirected
          /\ !kDirected /\ !kWeighted /\ !kDFS /\ kBFS, list the labels of the
          nodes that interact with function BFS <b>regardless</b> of the feature
          kWeighted being enabled or disabled.
        </h5>
        <NameForm id="answer1c" />
      </div>
    </div>
  </Slide>,
  <Slide key="s4">
    <div className="col-sm-3">
      <h3>Task 2</h3>
      <p className="lead">
        For this task, you will have to run the following query:
        <pre className="pre-scrollable code runnable remove-play-icon">
          {
            'MATCH p=(n)-[r:call]->(m)-[t:write|read]-(u) WHERE t.condition <> "true" and n.label = "handleCommands" and (m.label = "MSTPrim" or m.label = "connectedComponents" or m.label = "isCyclic") RETURN p'
          }
        </pre>
        The paths in the returning graph represent data flows in the code. Each
        data flow path starts at the node 'handleCommands' comprising a call
        link and a following read or write link.
      </p>
    </div>
    <div className="col-sm-9">
      <div>
        <h5>
          Consider that the following variants specify the use of different
          algorithms with undirected graphs:
        </h5>
        <ol>
          <li>
            kUndirected /\ !kDirected /\ kCycle /\ !kConnectedComps /\ !kPrim
          </li>
          <li>
            kUndirected /\ !kDirected /\ !kCycle /\ kConnectedComps /\ !kPrim
          </li>
          <li>
            kUndirected /\ !kDirected /\ !kCycle /\ !kConnectedComps /\ kPrim
          </li>
        </ol>
        <h5>
          Which variants may execute one or more of the dataflow paths shown in
          the graphs?
        </h5>
        <NameForm id="answer2a" />
      </div>
    </div>
  </Slide>,
  <Slide key="s5">
    <div className="col-sm-3">
      <h3>Task 2</h3>
      <p className="lead">
        For this task, you will have to run the following query:
        <pre className="pre-scrollable code runnable remove-play-icon">
          {
            'MATCH p=(n)-[r:call]->(m)-[t:write|read]-(u) WHERE t.condition <> "true" and n.label = "handleCommands" and (m.label = "MSTPrim" or m.label = "connectedComponents" or m.label = "isCyclic") RETURN p'
          }
        </pre>
        The paths in the returning graph represent data flows in the code. Each
        data flow path starts at the node 'handleCommands' comprising a call
        link and a following read or write link.
      </p>
    </div>
    <div className="col-sm-9">
      <div>
        <h5>
          Consider that the following variants specify the use of different
          algorithms with unweighted graphs:
        </h5>
        <ol>
          <li>!kWeighted /\ kCycle /\ !kConnectedComps /\ !kPrim</li>
          <li>!kWeighted /\ !kCycle /\ kConnectedComps /\ !kPrim</li>
          <li>!kWeighted /\ !kCycle /\ !kConnectedComps /\ kPrim</li>
        </ol>
        <h5>
          Which variants may execute one or more of the dataflow paths shown in
          the graphs?
        </h5>
        <NameForm id="answer2b" />
      </div>
    </div>
  </Slide>,
  <Slide key="s6">
    <div className="col-sm-3">
      <h3>Task 2</h3>
      <p className="lead">
        For this task, you will have to run the following query:
        <pre className="pre-scrollable code runnable remove-play-icon">
          {
            'MATCH p=(n)-[r:call]->(m)-[t:write|read]-(u) WHERE t.condition <> "true" and n.label = "handleCommands" and (m.label = "MSTPrim" or m.label = "connectedComponents" or m.label = "isCyclic") RETURN p'
          }
        </pre>
        The paths in the returning graph represent data flows in the code. Each
        data flow path starts at the node 'handleCommands' comprising a call
        link and a following read or write link.
      </p>
    </div>
    <div className="col-sm-9">
      <div>
        <h5>
          Consider that the following variants specify the use of the DFS search
          algorithm with different graph algorithms:
        </h5>
        <ol>
          <li>kDFS /\ !kBFS /\ kCycle /\ !kConnectedComps /\ !kPrim</li>
          <li>kDFS /\ !kBFS /\ !kCycle /\ kConnectedComps /\ !kPrim</li>
          <li>kDFS /\ !kBFS /\ !kCycle /\ !kConnectedComps /\ kPrim </li>
        </ol>
        <h5>
          Which variants may execute one or more of the dataflow paths shown in
          the graphs?
        </h5>
        <NameForm id="answer2c" />
      </div>
    </div>
  </Slide>,
  <Slide key="s6">
    <div className="col-sm-3">
      <h3>End of Stage 1</h3>
      <p className="lead">You have finished the first stage of the study.</p>
    </div>
    <div className="col-sm-9">
      <div>
        <h5>
          Let the researcher know that you finished the tasks for this stage.
          They should provide you the link for the next steps of the study.
        </h5>
      </div>
    </div>
  </Slide>
]

export default { title, category, slides }
