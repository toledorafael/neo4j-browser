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
      <h3>Stage 1</h3>
      <p className="lead">
        At this stage, you will interact with the interface to perform six
        tasks.
      </p>
    </div>
    <div className="col-sm-9">
      <div>
        <h5>
          We will provide you two queries. The first query should be used for
          the first three tasks, while the second query should be used for the
          rest of the tasks. Both queries will remain accessible the entire
          time.
        </h5>
        <h5>You can move to the next page whenever you are ready to start.</h5>
      </div>
    </div>
  </Slide>,
  <Slide key="s2">
    <div className="col-sm-3">
      <h3>Task 1.1</h3>
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
          Which <b>function(s)</b> from the returned graph may be <b>called</b>{' '}
          by the function BFS in a program variant with the configuration
          kUndirected /\ !kWeighted /\ !kDFS /\ kBFS?
        </h5>
        <NameForm id="answer1a" />
        {/*         
        <textarea id="1a" rows={5} cols={50}/>
        <br />
        <input type="button" value="Clear" onclick="eraseText"></input> */}
      </div>
    </div>
  </Slide>,
  <Slide key="s3">
    <div className="col-sm-3">
      <h3>Task 1.2</h3>
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
          Which <b>variable(s)</b> from the returned graph may be <b>written</b>{' '}
          by the function BFS in the same program variant kUndirected /\
          !kWeighted /\ !kDFS /\ kBFS?
        </h5>
        <NameForm id="answer1b" />
      </div>
    </div>
  </Slide>,
  <Slide key="s4">
    <div className="col-sm-3">
      <h3>Task 1.3</h3>
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
          Considering the same program variant (kUndirected /\ !kWeighted /\
          !kDFS /\ kBFS), which <b>variable(s)</b> from the returned graph may
          be <b>written</b> by the function BFS if we <b>enable</b> the feature
          kWeighted in the original configuration?
        </h5>
        <NameForm id="answer1c" />
      </div>
    </div>
  </Slide>,
  <Slide key="s5">
    <div className="col-sm-3">
      <h3>Task 2</h3>
      <p className="lead"></p>
    </div>
    <div className="col-sm-9">
      <div>
        <h5>
          Before starting the next task, fell free close the visualization frame
          with the results for the first task.
        </h5>
      </div>
    </div>
  </Slide>,
  <Slide key="s6">
    <div className="col-sm-3">
      <h3>Task 2.1</h3>
      <p className="lead">
        For this task, you will have to run the following query:
        <pre className="pre-scrollable code runnable remove-play-icon">
          {
            'MATCH p=(f:cFunction)-[r:call]->(t:cFunction) WHERE f<>t AND r.condition <> "true" AND t.label <> "getID" AND t.label <> "addEdge" AND t.label <> "addNgbr" AND t.label <> "getID" AND t.label <> "clearVisited" AND t.label <> "getSrcID" AND t.label <> "getTargetID" AND t.label <> "getNgbrs" RETURN *'
          }
        </pre>
      </p>
    </div>
    <div className="col-sm-9">
      <div>
        <h5>
          Which <b>function(s)</b> may be directly called by the function{' '}
          <b>handleCommands</b> in the following program variant V1:
        </h5>
        <ul>
          <li>
            V1: kWeighted /\ kUndirected /\ kDFS /\ !BFS /\ kCycle /\
            kConnectedComps /\ !kPrim
          </li>
        </ul>
        <NameForm id="answer2a" />
      </div>
    </div>
  </Slide>,
  <Slide key="s7">
    <div className="col-sm-3">
      <h3>Task 2.2</h3>
      <p className="lead">
        For this task, you will have to run the following query:
        <pre className="pre-scrollable code runnable remove-play-icon">
          {
            'MATCH p=(f:cFunction)-[r:call]->(t:cFunction) WHERE f<>t AND r.condition <> "true" AND t.label <> "getID" AND t.label <> "addEdge" AND t.label <> "addNgbr" AND t.label <> "getID" AND t.label <> "clearVisited" AND t.label <> "getSrcID" AND t.label <> "getTargetID" AND t.label <> "getNgbrs" RETURN *'
          }
        </pre>
      </p>
    </div>
    <div className="col-sm-9">
      <div>
        <h5>
          Which <b>function(s)</b> may be directly called by the function{' '}
          <b>handleCommands </b> in the program variant V2 but <b>not</b> in V1:
        </h5>
        <ul>
          <li>
            V1: kWeighted /\ kUndirected /\ kDFS /\ !BFS /\ kCycle /\
            kConnectedComps /\ !kPrim
          </li>
          <li>
            V2: kWeighted /\ kUndirected /\ !kDFS /\ BFS /\ !kCycle /\
            kConnectedComps /\ kPrim
          </li>
        </ul>
        <NameForm id="answer2b" />
      </div>
    </div>
  </Slide>,
  <Slide key="s8">
    <div className="col-sm-3">
      <h3>Task 2.3</h3>
      <p className="lead">
        For this task, you will have to run the following query:
        <pre className="pre-scrollable code runnable remove-play-icon">
          {
            'MATCH p=(f:cFunction)-[r:call]->(t:cFunction) WHERE f<>t AND r.condition <> "true" AND t.label <> "getID" AND t.label <> "addEdge" AND t.label <> "addNgbr" AND t.label <> "getID" AND t.label <> "clearVisited" AND t.label <> "getSrcID" AND t.label <> "getTargetID" AND t.label <> "getNgbrs" RETURN *'
          }
        </pre>
      </p>
    </div>
    <div className="col-sm-9">
      <div>
        <h5>
          There are <b>two</b> possible call paths between the functions
          handleCommand and DFS. Which program variant may execute both call
          paths?
        </h5>
        <ul>
          <li>
            V1: kWeighted /\ kUndirected /\ kDFS /\ !BFS /\ kCycle /\
            kConnectedComps /\ !kPrim
          </li>
          <li>
            V2: kWeighted /\ kUndirected /\ !kDFS /\ BFS /\ !kCycle /\
            kConnectedComps /\ kPrim
          </li>
        </ul>
        <NameForm id="answer2c" />
      </div>
    </div>
  </Slide>,
  <Slide key="s9">
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
