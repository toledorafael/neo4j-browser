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

const title = 'Tutorial'
const category = 'graphExamples'
const slides = [
  <Slide key="s1">
    <div className="col-sm-3">
      <h3>Tutorial</h3>
      <p className="lead">
        In this tutorial, you will learn how to use <em>Neo4j Browser</em> to
        visualize analysis results of configurable software.
      </p>
    </div>
    <div className="col-sm-9">
      <p>
        The interface comprises the top bar, where you can run queries over the
        database, and the list of visualization frames, in which you can
        visualize and inspect the results of an executed query. A visualization
        frame can be maximized to fullscreen and closed whenever you want.
      </p>
      <p>This guide will show you how to:</p>
      <ol className="big">
        <li>Run a query about configurable software data</li>
        <li>Customize the visualization of the results</li>
        <li>Add filters representing different software variants</li>
      </ol>
      <p></p>
      <p>
        Note that you are not expected to learn the language used to query the
        database as all required queries will be provided to you during the
        study. Click on the arrows on the sides or bottom of this visualization
        frame to navigate through the tutorial.
      </p>
    </div>
  </Slide>,
  <Slide key="s2">
    <div className="col-sm-3">
      <h3>Graphical software data</h3>
      <p className="lead">
        {' '}
        A program comprises entities (e.g., classes, variables, functions) and
        the relationships between them (e.g., function calls, variable reads,
        class containment.) A graph representing such a program would include
        nodes serving as the entities and links indicating the relationships
        established in the code.{' '}
      </p>
      <br />
    </div>
    <div className="col-sm-9">
      <h5>
        Consider an example function that updates the name attribute of a Node
        object that composes a graph data structure:
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
          'MATCH (a:cFunction)-[b]->(c) WHERE a.label CONTAINS "GraphApp::updateNodeName" RETURN *'
        }
      </pre>
    </div>
  </Slide>,
  <Slide key="s3">
    <div className="col-sm-3">
      <h3>Graphical software data</h3>
      <p className="lead">
        After running the query, a new visualization frame should be created.
        The frame shows at the center the nodes and links representing the
        results for the query. The sidebar on the right provides an overview of
        the node labels and relationships types present in the visualization.
        Feel free to inspect new visualization frame and come back to the
        tutorial whenever you are ready.
      </p>
      <br />
    </div>
    <div className="col-sm-9">
      <h5>
        If you hover, or click, on any node or link of the graph the overview on
        the sidebar is replaced by the list of attributes of the selected
        element. To return to the overview, you need to deslect the clicked
        entity. You can do that by clicking on the background or on the selected
        entity once.
      </h5>
      <h5>
        As a first task, try to find the node that represents the function
        GraphApp::updateNodeName. (hint: the label of such a node should be
        'AnalyzedCode/graphProductLine/GraphApp.h:GraphApp::updateNodeName')
      </h5>
      <br />
      <img src="./assets/images/codeSnippet.png" width={700} />
    </div>
  </Slide>,
  <Slide key="s4">
    <div className="col-sm-3">
      <h3>Graphical software data</h3>
      <p className="lead">
        After running the query, a new visualization frame should be created.
        The frame shows at the center the nodes and links representing the
        results for the query. The sidebar on the right provides an overview of
        the node labels and relationships types present in the visualization.
      </p>
      <br />
    </div>
    <div className="col-sm-9">
      <h5>
        Now find the link representing the function call highlighted in the
        code. (hint: the label of the end node should be
        'AnalyzedCode/graphProductLine/Node.h:Node::setName')
      </h5>
      <br />
      <img src="./assets/images/codeSnippetHighlighted.png" width={700} />
    </div>
  </Slide>,
  <Slide key="s5">
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
        tasks:{' '}
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
  <Slide key="s6">
    <div className="col-sm-3">
      <h3>Customizing visualization</h3>
      <p className="lead">
        If you set the visual attributes correctly, your graph should look like
        the following:
      </p>
      <br />
    </div>
    <div className="col-sm-9">
      <img src="./assets/images/coloredGraph.png" height="400" />
    </div>
  </Slide>,
  <Slide key="s7">
    <div className="col-sm-3">
      <h3>Configurable software graph</h3>
      <p className="lead">
        Software systems are developed as a set of functionalities. Each unit of
        functionality, or feature, satisfies a requirement or represents a
        design decision. The set of features provide options to the developers
        to configure the system to individual users by turning some features on
        and others off. Hence configurable software systems may include all the
        available features or a subset of them.
      </p>
      <br />
    </div>
    <div className="col-sm-9">
      <h5>
        The links in the graphs that you are going to interact are annotated
        with their respective presence conditions. The conditions are boolean
        expressions that show the feature configuration in which the action
        represented by the link may occur. For example, consider the following
        code snippet:
      </h5>
      <figure>
        <pre className="code">
          {`void GraphApp::connectedComponents() {
    if ((kBFS || kDFS) && kUndirected) {
        clearVisited();
        int compNum = 0;
        ...
    }
}`}
        </pre>
      </figure>
      <h5>
        Note that the boolean variables used in the if-condition represent flags
        that indicate whether a feature is enabled or not. Hence, for the
        instructions to be executed, the feature kUndirected must be enabled,
        meaning it must have value 'true', along with either kBFS or kDFS. A
        graph representing the function call, the variable declaration, variable
        write, and their presence conditions looks like the following:
      </h5>
      <img src="./assets/images/presenceCondition.png" />
      <h5>
        The presence conditions are composed by AND ('/\'), OR ('\/'), and NOT
        ('!') operations.
      </h5>
      {/* TODO: Add table showing the symbols meaning */}
    </div>
  </Slide>,
  <Slide key="s8">
    <div className="col-sm-3">
      <h3>Demo task</h3>
      <br />
    </div>
    <div className="col-sm-9">
      <h5>
        The tasks comprising this study will ask you to determine the presence
        of links in specific feature configurations. As an example, consider the
        graph returned by the following query:
      </h5>
      <pre className="pre-scrollable code runnable remove-play-icon">
        {
          'MATCH (a:cFunction)-[b]-(c) WHERE type(b) <> "call" AND a.label CONTAINS "GraphApp::BFS" AND b.condition <> "true" AND NOT c.label CONTAINS "7.5.0" AND NOT c.label CONTAINS "c++"RETURN *'
        }
      </pre>
      <h5>
        Which of the following feature configurations present more of graph
        links:
        <ol>
          <li>Variant 1: kWeighted /\ !kUndirected</li>
          <li>Variant 2: !kWeighted /\ kUndirected</li>
        </ol>
      </h5>
      Note that a feature is not considered disabled unless it is specified in
      the configuration.
    </div>
  </Slide>,
  <Slide key="s9">
    <div className="col-sm-3">
      <h3>Demo task</h3>
      <p className="lead"></p>
    </div>
    <div className="col-sm-9">
      <h5>
        The correct answer for the task is Variant 1 with four links, while
        Variant 2 includes three links. If your answer was incorrect, take your
        time to go back to the graph to understand where you made a mistake.
      </h5>
    </div>
  </Slide>,
  <Slide key="s10">
    <div className="col-sm-3">
      <h3>End of tutorial</h3>
      <p className="lead">
        Now that you are familiar with the interface, you are ready to start the
        study.
      </p>
    </div>
    <div className="col-sm-9">
      {/* TODO: add instructions to initiate the study */}
      {/* TODO: Add gif showing how to see attributes */}
    </div>
  </Slide>
]

export default { title, category, slides }
