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
      </ol>
      <p></p>
      <p>
        Note that you are not expected to learn the query language. All required
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
        class containment). A graph representing such a program includes nodes
        representing the entities and links indicating the relationships
        established in the code.{' '}
      </p>
      <br />
    </div>
    <div className="col-sm-9">
      <h5>
        Consider a function that updates the name attribute of a Node object
        contained Graph Application:
      </h5>
      <figure>
        <pre className="code">
          {`void GraphApp::updateName(std::string nodeName, std::string newName) {
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
          'MATCH (a:cFunction)-[b]->(c) WHERE a.label CONTAINS "updateName" RETURN *'
        }
      </pre>
    </div>
  </Slide>,
  <Slide key="s3">
    <div className="col-sm-3">
      <h3>Graphical program data</h3>
      <p className="lead">
        The new frame shows the data returned by the executed query. The sidebar
        on the right provides an overview of the node labels and relationships
        types present in the visualization.
      </p>
      <br />
    </div>
    <div className="col-sm-9">
      <h5>
        You can reposition the nodes by dragging them around. If you hover, or
        click, on any node or link of the graph the overview on the sidebar is
        replaced by the information associated with the selected element. To
        return to the overview, you need to deselect the clicked entity. You can
        do that by clicking on the background or on the selected entity once.
      </h5>
      <h5>
        If you want, you can pan and zoom the visualization in the frame. You
        can pan around the graph view by clicking and dragging the background.
        You can zoom in and out by clicking on the buttons on the bottom right
        corner. You can also expand the visualization frame into fullscreen by
        clicking on the <img src="./assets/images/expand.svg" width={10} />
        &nbsp;button on the top right corner.
      </h5>
      <h5>
        As a first task, find the node that represents the function updateName.
        What is the id of such a node?
      </h5>
      <br />
      {/* <img src="./assets/images/codeSnippet.png" width={700} /> */}
    </div>
  </Slide>,
  <Slide key="s4">
    <div className="col-sm-3">
      <h3>Graphical program data</h3>
      <p className="lead">
        The new frame shows the data returned by the executed query. The sidebar
        on the right provides an overview of the node labels and relationships
        types present in the visualization.
      </p>
      <br />
    </div>
    <div className="col-sm-9">
      <h5>
        The correct answer is <b>46</b>.
      </h5>
    </div>
  </Slide>,
  <Slide key="s5">
    <div className="col-sm-3">
      <h3>Customizing visualization</h3>
      <p className="lead">
        The sidebar provides customization options to change visual attributes
        of the nodes and links. The customization menu appears whenever you
        click on a node label or relationship type listed in the overview. The
        star sign (*) represent visual attributes applied to all links.
      </p>
      <br />
    </div>
    <div className="col-sm-9">
      <img
        src="./assets/images/customizeVisual.gif"
        alt="Customization options"
      />
      <h5>The customization menu includes the following options: </h5>
      <ol>
        <li>Turn on/off the visibility of nodes and links</li>
        <li>Change the colours and diameter of nodes</li>
        <li>Change the width of links</li>
      </ol>
    </div>
  </Slide>,
  <Slide key="s6">
    <div className="col-sm-3">
      <h3>Customizing visualization</h3>
      <p className="lead">
        The sidebar provides customization options to change visual attributes
        of the nodes and links. The customization menu appears whenever you
        click on a node label or relationship type listed in the overview. The
        star sign (*) represent visual attributes applied to all links.
      </p>
      <br />
    </div>
    <div className="col-sm-9">
      <h5>
        To experiment with the customization options, perform the following
        tasks on the query results:{' '}
      </h5>
      <ol>
        <li>Set the color of cVariables to be red</li>
        <li>Set the color of cFunctions to be dark blue</li>
        <li>
          Set the width of all the links to be the fourth thickiest option
          available
        </li>
      </ol>
      <h5>You can move to the next slide when you are done.</h5>
    </div>
  </Slide>,
  <Slide key="s7">
    <div className="col-sm-3">
      <h3>Customizing visualization</h3>
      <p className="lead">
        If you set the visual attributes correctly, your graph should look like
        the following:
      </p>
      <br />
    </div>
    <div className="col-sm-9">
      <img src="./assets/images/colouredGraph.png" height="400" />
    </div>
  </Slide>,
  <Slide key="s8">
    <div className="col-sm-3">
      <h3>Configurable program graph</h3>
      <p className="lead">
        Software configuration is a fundamental aspect of software development.
        It is the ability to create software variants for different contexts of
        use. Engineers can create a configurable program that encompasses
        multiple variants that share a set of common features. At the level of
        the code, variability occurs by enabling or disabling portions of the
        code that implements certain software features.
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
        that indicate whether a feature is enabled or not. In this codebase, the
        feature variables have the prefix 'k' in their names. Hence, the feature
        kUndirected must be enabled, as well as, one of kBFS or kDFS for the
        execution of instructions inside the condition block to execute. A graph
        representing the function call, the variable declaration, the variable
        write, and their respective presence conditions looks like the
        following:
      </h5>
      <img src="./assets/images/presenceCondition.png" />
      <h5>
        The presence conditions in the graph are comprise AND ('/\'), OR ('\/'),
        and NOT ('!') operations.
      </h5>
    </div>
  </Slide>,
  // Filter introduction
  // <Slide key="s9">
  //   <div className="col-sm-3">
  //     <h3>Configurable program graph</h3>
  //     <p className="lead">
  //       The visualization frame allows you to customize links that may execute
  //       in specific program variants. To access such customization options, you
  //       must create a filter describing the feature configuration of the variant
  //       of interest.
  //     </p>
  //     <br />
  //   </div>
  //   <div className="col-sm-9">
  //     <h5>
  //       The form to create a new filter appears on the top left corner of the
  //       visualization frame when it is in fullscreen mode.
  //     </h5>
  //     <img src="./assets/images/createFilter.gif" />
  //     <h5>
  //       As an example, let's apply a filter on the small graph. Run the
  //       following query to retrieve the graph:
  //     </h5>
  //     <pre className="pre-scrollable code runnable remove-play-icon">
  //       {
  //         'MATCH (f1:cFunction{label:"DFS"})<-[r]-(g:cFunction{label:"connectedComponents"})-[t]->(f2:cFunction{label:"BFS"}) MATCH (g)-[s:write]->(o:cVariable{label:"compNum"}) RETURN *'
  //       }
  //     </pre>
  //     <h5>
  //       Once the results of the query are displayed, maximize the visualization
  //       frame, type <i>"kDFS /\ !kBFS /\ kUndirected"</i>, and click on the
  //       button below the textbox to create a filter representing a program
  //       variant with that feature configuration. Note that the links that may
  //       execute in the program variant represented by the filter are
  //       highlighted.
  //     </h5>
  //   </div>
  // </Slide>,
  // <Slide key="s10">
  //   <div className="col-sm-3">
  //     <h3>Configurable program graph</h3>
  //     <p className="lead">
  //       The visualization frame allows you to customize links that may execute
  //       in specific program variants. To access such customization options, you
  //       must create a filter describing the feature configuration of the variant
  //       of interest.
  //     </p>
  //     <br />
  //   </div>
  //   <div className="col-sm-9">
  //     <h5>There are four options for the layout of the filters:</h5>
  //     <h5>
  //       <ol>
  //         <li>
  //           Colour segments: the colour of the satisfying filters are
  //           distributed across the link
  //         </li>
  //         <li>
  //           Colour stripes: the colour of the satisfying filters are distributed
  //           along the link
  //         </li>
  //         <li>
  //           Individual links: there is an instance of the link for each
  //           satisfying filter
  //         </li>
  //         <li>
  //           Colour and shape segments: the colour and shape of the satisfying
  //           filters are distributes across the link
  //         </li>
  //       </ol>
  //     </h5>
  //     <h5>
  //       To explore the layout options, you can create a second filter. Please
  //       type <i>"!kDFS /\ kBFS /\ kUndirected"</i> to create a filter with a
  //       different configuration. Feel free to experiment and get familiar with
  //       the layout options.
  //     </h5>
  //   </div>
  // </Slide>,
  // <Slide key="s11">
  //   <div className="col-sm-3">
  //     <h3>Configurable program graph</h3>
  //     <p className="lead">
  //       The visualization frame allows you to customize links that may execute
  //       in specific program variants. To access such customization options, you
  //       must create a filter describing the feature configuration of the variant
  //       of interest.
  //     </p>
  //     <br />
  //   </div>
  //   <div className="col-sm-9">
  //     <h5>
  //       Note the legend at the bottom left corner and the sidebar on the right
  //       include the list of active filters. The legend includes buttons for the
  //       two link-colour themes: dark and light.
  //     </h5>
  //     <h5>
  //       Clicking on a filter label on the sidebar opens up the customization
  //       menu for that particular filter.
  //     </h5>
  //     <img src="./assets/images/customizeFilter.gif" />
  //     <h5>
  //       The menu includes a set of available colours to customize the visual
  //       enconding of the filters. When using the colour and shape segments, the
  //       menu also includes options of shapes for the highlighted links. The
  //       customization menu also includes the button to remove the selected
  //       filter. Please make sure to delete all the filters you have created
  //       before moving to the next slide.
  //     </h5>
  //   </div>
  // </Slide>,
  // End of filter's introduction
  <Slide key="s9">
    <div className="col-sm-3">
      <h3>Demo task</h3>
      <br />
    </div>
    <div className="col-sm-9">
      <h5>
        The tasks comprising this study will ask you to determine the presence
        of code entities interactions, represented by the links, in specific
        program variants. As an example, consider the graph returned by the
        following query:
      </h5>
      <pre className="pre-scrollable code runnable remove-play-icon">
        {
          'MATCH (a:cFunction)-[b]->(c) WHERE a.label = "DFS" AND a<>c aND b.condition <> "true" AND type(b) = "call" RETURN *'
        }
      </pre>
      <h5>
        Which of the program variants listed below include more function calls
        between DFS and other functions?
        <ul>
          <li>V1: kWeighted /\ kUndirected</li>
          <li>V2: !kWeighted /\ kUndirected</li>
        </ul>
      </h5>
    </div>
  </Slide>,
  <Slide key="s10">
    <div className="col-sm-3">
      <h3>Demo task</h3>
      <p className="lead"></p>
    </div>
    <div className="col-sm-9">
      <h5>
        The correct answer is <b>V1</b>. In that variant, DFS may call the
        function getEndNodeID and getStartNodeID. While in V2, DFS may only call
        the function getNeighbors. Take your time to go back to the graph to
        understand the correct answer, if necessary.
      </h5>
    </div>
  </Slide>,
  <Slide key="s11">
    <div className="col-sm-3">
      <h3>End of tutorial</h3>
      <p className="lead">
        Now that you are familiar with the interface, we can to start the study.
      </p>
    </div>
    <div className="col-sm-9">
      When you are ready, close the visualization frames with results of
      previous queries, click on the following query and hit the play button
      beside the top bar to initialize a new frame with the tasks for our user
      study.
    </div>
    <pre className="pre-scrollable code runnable remove-play-icon">
      {':play study'}
    </pre>
  </Slide>
]

export default { title, category, slides }
