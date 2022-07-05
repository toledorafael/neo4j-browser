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
// import customizationGif from './assets/images/customizeVisual.gif'

// localStorage.setItem('startTutorial', '' + Date.now())
const title = 'Tutorial'
const category = 'graphExamples'
const slides = [
  <Slide key="s1">
    <div className="col-sm-3">
      <h3>Tutorial</h3>
      <p className="lead">
        In this tutorial, you will learn how to use <em>Neo4j Browser</em> to
        visualize analysis results of configurable programs.
      </p>
    </div>
    <div className="col-sm-9">
      <p>
        This interface comprises the top bar, where you can run queries over the
        database, and the list of visualization frames, in which you can
        visualize and inspect the results of the query. A visualization frame
        can be maximized to fullscreen and closed whenever you want by clicking
        the icons at the top.
      </p>
      <p>This guide will show you how to:</p>
      <ol className="big">
        <li>Run a query about configurable program data</li>
        <li>Customize the visualization of the results</li>
        <li>Add filters representing different program variants</li>
      </ol>
      <p></p>
      <p>
        Note that you are not expected to learn the query language all required
        queries will be provided to you during the study. Click on the arrows on
        the sides or bottom of this visualization frame to navigate through the
        tutorial.
      </p>
    </div>
  </Slide>,
  <Slide key="s2">
    <div className="col-sm-3">
      <h3>Graphical program data</h3>
      <p className="lead">
        {' '}
        A program comprises entities (e.g., classes, variables, functions) and
        the relationships between them (e.g., function calls, variable reads,
        class containment.) A graph representing such a program includes nodes
        representing as the entities and links indicating the relationships
        established in the code.{' '}
      </p>
      <br />
    </div>
    <div className="col-sm-9">
      <h5>
        Consider a function that updates the name attribute of a Node object:
      </h5>
      <figure>
        <pre className="code">
          {`void GraphApp::updateNodeName(std::string nodeName, std::string newName) {
   for (int i=0; i < nodes.size(); i++) {
       if (nodes[i]->getName() == nodeName) {
           nodes[i]->setName(newName);
       }
   }
}`}
        </pre>
      </figure>
      <h5>
        Now click on the following query and hit the play button beside the top
        bar to create a new visualization frame with the graphical
        representation of this program.
      </h5>
      <pre className="pre-scrollable code runnable remove-play-icon">
        {
          'MATCH (a:cFunction)-[b]->(c) WHERE a.label CONTAINS "updateNodeName" RETURN *'
        }
      </pre>
    </div>
  </Slide>,
  <Slide key="s3">
    <div className="col-sm-3">
      <h3>Graphical program data</h3>
      <p className="lead">
        The new frame shows the returned by the executed query. The sidebar on
        the right provides an overview of the node labels and relationships
        types present in the visualization.
      </p>
      <br />
    </div>
    <div className="col-sm-9">
      <h5>
        If you hover, or click, on any node or link of the graph the overview on
        the sidebar is replaced by the information associated with the selected
        element. To return to the overview, you need to deselect the clicked
        entity. You can do that by clicking on the background or on the selected
        entity once.
      </h5>
      <h5>
        As a first task, find the node that represents the function
        updateNodeName. What is the id of such a node?
      </h5>
      <br />
      {/* <img src="./assets/images/codeSnippet.png" width={700} /> */}
    </div>
  </Slide>,
  <Slide key="s3">
    <div className="col-sm-3">
      <h3>Graphical program data</h3>
      <p className="lead">
        The new frame shows the returned by the executed query. The sidebar on
        the right provides an overview of the node labels and relationships
        types present in the visualization.
      </p>
      <br />
    </div>
    <div className="col-sm-9">
      <h5>
        If you hover, or click, on any node or link of the graph the overview on
        the sidebar is replaced by the information associated with the selected
        element. To return to the overview, you need to deselect the clicked
        entity. You can do that by clicking on the background or on the selected
        entity once.
      </h5>
      <h5>
        As a first task, find the node that represents the function
        updateNodeName. What is the id of such a node?
      </h5>
      <br />
      <h5>
        The correct answer is <b>46</b>.
      </h5>
    </div>
  </Slide>,
  <Slide key="s4">
    <div className="col-sm-3">
      <h3>Customizing visualization</h3>
      <p className="lead">
        The sidebar provides customization options to change visual attributes
        of the nodes and links. The customization menu appears whenever you
        click on a node label or relationship type listed in the overview. The
        star sign (*) represent visual attributes applied to all nodes or links.
      </p>
      <br />
    </div>
    <div className="col-sm-9">
      <img
        src="./assets/images/customizeVisual.gif"
        alt="Customization options"
      />
      <h5>
        To experiment with the customization options, perform the following
        tasks on the query results:{' '}
      </h5>
      <ol>
        <li>Set the color of cVariables to be red</li>
        <li>Set the color of cFunctions to be dark blue</li>
        <li>
          Set the width of all the line width to be the fourth thickiest
          available option
        </li>
      </ol>
      <h5>You can move to the next slide when you are done.</h5>
    </div>
  </Slide>,
  <Slide key="s5">
    <div className="col-sm-3">
      <h3>Customizing visualization</h3>
      <p className="lead">
        If you set the visual attributes correctly, your graph should look like
        the following:
      </p>
      <br />
    </div>
    {/* TODO: replace gif */}
    <div className="col-sm-9">
      <img src="./assets/images/colouredGraph.png" height="400" />
    </div>
  </Slide>,
  <Slide key="s6">
    <div className="col-sm-3">
      <h3>Configurable program graph</h3>
      <p className="lead">
        Software configuration is a fundamental aspect of software development.
        It is the ability to create software variants for different contexts of
        use. Engineers can create a configurable program that encompasses
        multiple, different variants that share a set of common features. At the
        level of the code, variability occurs by enabling or disabling portions
        of the code that implements certain software features.
      </p>
      <br />
    </div>
    <div className="col-sm-9">
      <h5>
        The links in the graphs that you are going to interpret are annotated
        with their respective presence conditions. The conditions are boolean
        expressions that show the required configuration for the action
        represented by the link to occur. For example, consider the following
        code snippet:
      </h5>
      <figure>
        <pre className="code">
          {`void GraphApp::connectedComponents() {
    if ((kBFS || kDFS) && kUndirected) {
        clearVisited();
        int compNum = 3;
        ...
    }
}`}
        </pre>
      </figure>
      <h5>
        Note that the boolean variables used in the if-condition represent flags
        that indicate whether a feature is enabled or not. Hence, for the
        execution of instructions inside the condition block to occur, the
        feature kUndirected must be enabled, as well as, one of kBFS or kDFS. A
        graph representing the function call, the variable declaration, variable
        write, and their presence conditions looks like the following:
      </h5>
      <img src="./assets/images/presenceCondition.png" />
      <h5>
        The presence conditions in the graph are composed by AND ('/\'), OR
        ('\/'), and NOT ('!') operations.
      </h5>
    </div>
  </Slide>,
  <Slide key="s7">
    <div className="col-sm-3">
      <h3>Demo task</h3>
      <br />
    </div>
    <div className="col-sm-9">
      <h5>
        The tasks comprising this study will ask you to determine the presence
        of code entities interactions, or links, in specific program variants.
        As an example, consider the graph returned by the following query:
      </h5>
      <pre className="pre-scrollable code runnable remove-play-icon">
        {
          'MATCH (a:cFunction)-[b]-(c) WHERE type(b) <> "call" AND a.label CONTAINS "BFS" AND b.condition <> "true" AND NOT c.label CONTAINS "7.5.0" AND NOT c.label CONTAINS "c++" AND type(b) <> "varInfFunc" RETURN *'
        }
      </pre>
      <h5>
        Which of the following program variants include more writing
        relationships between the function BFS and its contained variables:
        <ul>
          <li>V1: kWeighted /\ !kUndirected</li>
          <li>V2: !kWeighted /\ kUndirected</li>
        </ul>
      </h5>
      Note that a feature is not considered disabled unless it is specified in
      the configuration with the operator '!'.
    </div>
  </Slide>,
  <Slide key="s8">
    <div className="col-sm-3">
      <h3>Demo task</h3>
      <p className="lead"></p>
    </div>
    <div className="col-sm-9">
      <h5>
        The correct answer is <b>V1</b> since BFS writes to the variables
        'endNodeID' and 'edge' when the feature kWeighted is set. While in V2
        the same function only writes to variable 'neighborID' when kWeighted is
        unset. Take your time to go back to the graph to understand the correct
        answer, if necessary.
      </h5>
    </div>
  </Slide>,
  <Slide key="s9">
    <div className="col-sm-3">
      <h3>End of tutorial</h3>
      <p className="lead">
        Now that you are familiar with the interface, we can to start the study.
      </p>
    </div>
    <div className="col-sm-9">
      Click on the following query and hit the play button beside the top bar to
      initialize new frame with the tasks for our user study.
    </div>
    <pre className="pre-scrollable code runnable remove-play-icon">
      {':play study'}
    </pre>
  </Slide>
]

export default { title, category, slides }
