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
        database, and the list of visualization frames, with each showing the
        results of an executed query.
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
        frame to navigate through the tutorial
      </p>
    </div>
  </Slide>,
  <Slide key="s2">
    {/* // [Begin Video 2]

// Figure on the right shows the code in the file. Note that... [Explain code]. The graphical representation of that portion of the code is the subgraph returned by the query. Note that... [map some of the characteristics of the code to the graph]

// Inside the visualization frame, the user has the option to change some parameters of the visualization, like color, size of nodes, and width of links. For example, if we click on the type cVariable on the top bar, a menu with the options of visual parameters appear on the bottom bar, like the color, size, and preference on which property should appear as a node label in the visualization. As a preparation for our study, I will ask you to follow this color scheme:

// cVariable = Green

// cFunction = Purple

// cClass = Yellow

// You can move to the next video, once you finish setting up the colors 

// [End Video 2] */}
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
      {/* <p>
        To the right is a giant code block containing a single Cypher query
        statement composed of multiple CREATE clauses. This will create the
        movie graph.
      </p>
      <ol>
        <li>Click on the code block</li>
        <li>Notice it gets copied to the editor above ↑</li>
        <li>Click the editor's play button to execute</li>
        <li>Wait for the query to finish</li>
      </ol>
      <p className="text-center text-warning bg-warning">
        WARNING: This adds data to the current database, each time it is run!
      </p>
      <hr />
      <p>
        <small>:help</small> <a help-topic="cypher">cypher</a>{' '}
        <a help-topic="create">CREATE</a>
      </p> */}
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
        bar to visualize the graphical representation of this program.
      </h5>
      <pre className="pre-scrollable code runnable">
        {'MATCH (tom {name: "Tom Hanks"}) RETURN tom'}
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
      </p>
      <br />
      {/* <h3>Find</h3>
      <p>Example queries for finding individual nodes.</p>
      <ol>
        <li>Click on any query example</li>
        <li>Run the query from the editor</li>
        <li>Notice the syntax pattern</li>
        <li>Try looking for other movies or actors</li>
      </ol>
      <hr />
      <p>
        <small>:help</small> <a help-topic="match">MATCH</a>{' '}
        <a help-topic="where">WHERE</a> <a help-topic="return">RETURN</a>
      </p> */}
    </div>
    <div className="col-sm-9">
      <h5>
        If you click on any node or link of the graph the overview on the
        sidebar is replaced by the list of attributes of the selected element.
        To return to the overview, you need to deslect the clicked entity. You
        can do that by clicking on the background or on the selected entity
        once.
      </h5>
      <h5>
        As a first task, try to find the node that represents the function
        GraphApp::updateNodeName. (hint: the label of such a node should be
        "...")
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
      {/* <p className="lead">Find the actor named "Tom Hanks"...</p>
      <figure>
        <pre className="pre-scrollable code runnable">
          {'MATCH (tom {name: "Tom Hanks"}) RETURN tom'}
        </pre>
      </figure>
      <p className="lead">Find the movie with title "Cloud Atlas"...</p>
      <figure>
        <pre className="pre-scrollable code runnable">
          {'MATCH (cloudAtlas {title: "Cloud Atlas"}) RETURN cloudAtlas'}
        </pre>
      </figure>
      <p className="lead">Find 10 people...</p>
      <figure>
        <pre className="pre-scrollable code runnable">
          MATCH (people:Person) RETURN people.name LIMIT 10
        </pre>
      </figure>
      <p className="lead">Find movies released in the 1990s...</p>
      <figure>
        <pre className="pre-scrollable code runnable">
          {
            'MATCH (nineties:Movie) WHERE nineties.released >= 1990 AND nineties.released < 2000 RETURN nineties.title'
          }
        </pre>
      </figure> */}
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
      {/* <h3>Find</h3>
    <p>Example queries for finding individual nodes.</p>
    <ol>
      <li>Click on any query example</li>
      <li>Run the query from the editor</li>
      <li>Notice the syntax pattern</li>
      <li>Try looking for other movies or actors</li>
    </ol>
    <hr />
    <p>
      <small>:help</small> <a help-topic="match">MATCH</a>{' '}
      <a help-topic="where">WHERE</a> <a help-topic="return">RETURN</a>
    </p> */}
    </div>
    <div className="col-sm-9">
      <h5>
        Now find the link representing the function call highlighted in the
        code. (hint: the label of the end node should be "...")
      </h5>
      <figure>
        <pre className="code">
          {`void GraphApp::updateNodeName(std::string nodeName, std::string newName) {
 for (int i=0; i < nodes.size(); i++) {
     if (nodes[i]->getName() == nodeName) {`}
        </pre>
        <pre className="code highlighted">
          {' '}
          {`     nodes[i]->setName(newName);`}{' '}
        </pre>
        <pre className="code">
          {' '}
          {` }
 }
}`}
        </pre>
      </figure>
      {/* <p className="lead">Find the actor named "Tom Hanks"...</p>
    <figure>
      <pre className="pre-scrollable code runnable">
        {'MATCH (tom {name: "Tom Hanks"}) RETURN tom'}
      </pre>
    </figure>
    <p className="lead">Find the movie with title "Cloud Atlas"...</p>
    <figure>
      <pre className="pre-scrollable code runnable">
        {'MATCH (cloudAtlas {title: "Cloud Atlas"}) RETURN cloudAtlas'}
      </pre>
    </figure>
    <p className="lead">Find 10 people...</p>
    <figure>
      <pre className="pre-scrollable code runnable">
        MATCH (people:Person) RETURN people.name LIMIT 10
      </pre>
    </figure>
    <p className="lead">Find movies released in the 1990s...</p>
    <figure>
      <pre className="pre-scrollable code runnable">
        {
          'MATCH (nineties:Movie) WHERE nineties.released >= 1990 AND nineties.released < 2000 RETURN nineties.title'
        }
      </pre>
    </figure> */}
    </div>
  </Slide>,
  <Slide key="s5">
    {/* The answer for that question is...

// If you answered anything different than that, take some time to review the visualization and make sure you understand the mistake you made before moving to the next questions.

// The questions are listed here.  */}
    <div className="col-sm-3">
      <h3>Customizing visualization</h3>
      <p className="lead">
        The sidebar provides customization options to change visual attributes
        of the nodes and links. The customization menu appears whenever you
        click on a node label or relationship type listed in the overview. The
        star sign (*) represent visual attributes applied to all nodes or links.
      </p>
      <br />
      {/* <h3>Query</h3>
      <p>Finding patterns within the graph.</p>
      <ol>
        <li>Actors are people who acted in movies</li>
        <li>Directors are people who directed a movie</li>
        <li>What other relationships exist?</li>
      </ol>
      <hr />
      <p>
        <small>:help</small> <a help-topic="match">MATCH</a>
      </p> */}
    </div>
    <div className="col-sm-9">
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
      Add gif
      <h5>You can move to the next slide when you are done.</h5>
      {/* <p className="lead">List all Tom Hanks movies...</p>
      <figure>
        <pre className="pre-scrollable code runnable">
          {
            'MATCH (tom:Person {name: "Tom Hanks"})-[:ACTED_IN]->(tomHanksMovies) RETURN tom,tomHanksMovies'
          }
        </pre>
      </figure>
      <p className="lead">Who directed "Cloud Atlas"?</p>
      <figure>
        <pre className="pre-scrollable code runnable">
          {
            'MATCH (cloudAtlas {title: "Cloud Atlas"})<-[:DIRECTED]-(directors) RETURN directors.name'
          }
        </pre>
      </figure>
      <p className="lead">Tom Hanks' co-actors...</p>
      <figure>
        <pre className="pre-scrollable code runnable">
          {
            'MATCH (tom:Person {name:"Tom Hanks"})-[:ACTED_IN]->(m)<-[:ACTED_IN]-(coActors) RETURN coActors.name'
          }
        </pre>
      </figure>
      <p className="lead">How people are related to "Cloud Atlas"...</p>
      <figure>
        <pre className="pre-scrollable code runnable">
          {
            'MATCH (people:Person)-[relatedTo]-(:Movie {title: "Cloud Atlas"}) RETURN people.name, Type(relatedTo), relatedTo'
          }
        </pre>
      </figure> */}
    </div>
  </Slide>,
  <Slide key="s6">
    {/* The answer for that question is...

// If you answered anything different than that, take some time to review the visualization and make sure you understand the mistake you made before moving to the next questions.

// The questions are listed here.  */}
    <div className="col-sm-3">
      <h3>Customizing visualization</h3>
      <p className="lead">
        If you set the visual attributes correctly, your graph should look like
        the following:
      </p>
      <br />
      {/* <h3>Query</h3>
    <p>Finding patterns within the graph.</p>
    <ol>
      <li>Actors are people who acted in movies</li>
      <li>Directors are people who directed a movie</li>
      <li>What other relationships exist?</li>
    </ol>
    <hr />
    <p>
      <small>:help</small> <a help-topic="match">MATCH</a>
    </p> */}
    </div>
    <div className="col-sm-9">
      Add figure showing the intended colours and width
      {/* <p className="lead">List all Tom Hanks movies...</p>
    <figure>
      <pre className="pre-scrollable code runnable">
        {
          'MATCH (tom:Person {name: "Tom Hanks"})-[:ACTED_IN]->(tomHanksMovies) RETURN tom,tomHanksMovies'
        }
      </pre>
    </figure>
    <p className="lead">Who directed "Cloud Atlas"?</p>
    <figure>
      <pre className="pre-scrollable code runnable">
        {
          'MATCH (cloudAtlas {title: "Cloud Atlas"})<-[:DIRECTED]-(directors) RETURN directors.name'
        }
      </pre>
    </figure>
    <p className="lead">Tom Hanks' co-actors...</p>
    <figure>
      <pre className="pre-scrollable code runnable">
        {
          'MATCH (tom:Person {name:"Tom Hanks"})-[:ACTED_IN]->(m)<-[:ACTED_IN]-(coActors) RETURN coActors.name'
        }
      </pre>
    </figure>
    <p className="lead">How people are related to "Cloud Atlas"...</p>
    <figure>
      <pre className="pre-scrollable code runnable">
        {
          'MATCH (people:Person)-[relatedTo]-(:Movie {title: "Cloud Atlas"}) RETURN people.name, Type(relatedTo), relatedTo'
        }
      </pre>
    </figure> */}
    </div>
  </Slide>,
  <Slide key="s7">
    <div className="col-sm-3">
      <h3>Configurable software graph</h3>
      <br />
      {/* <h3>Solve</h3>
      <p>
        You've heard of the classic "Six Degrees of Kevin Bacon"? That is simply
        a shortest path query called the "Bacon Path".
      </p>
      <ol>
        <li>Variable length patterns</li>
        <li>Built-in shortestPath() algorithm</li>
      </ol>
    </div>
    <div className="col-sm-9">
      <p className="lead">
        Movies and actors up to 4 "hops" away from Kevin Bacon
      </p>
      <figure>
        <pre className="pre-scrollable code runnable">
          {`MATCH (bacon:Person {name:"Kevin Bacon"})-[*1..4]-(hollywood)
RETURN DISTINCT hollywood`}
        </pre>
      </figure>
      <p className="lead">
        Bacon path, the shortest path of any relationships to Meg Ryan
      </p>
      <figure>
        <pre className="pre-scrollable code runnable">
          {`MATCH p=shortestPath(
(bacon:Person {name:"Kevin Bacon"})-[*]-(meg:Person {name:"Meg Ryan"})
)
RETURN p`}
        </pre>
        <aside className="warn">
          Note you only need to compare property values like this when first
          creating relationships
        </aside>
      </figure> */}
    </div>
  </Slide>,
  <Slide key="s8">
    <div className="col-sm-3">
      <h5>The Movie Graph</h5>
      <br />
      {/* <h3>Recommend</h3>
      <p>
        Let's recommend new co-actors for Tom Hanks. A basic recommendation
        approach is to find connections past an immediate neighborhood which are
        themselves well connected.
      </p>
      <p>For Tom Hanks, that means:</p>
      <ol>
        <li>
          Find actors that Tom Hanks hasn't yet worked with, but his co-actors
          have.
        </li>
        <li>Find someone who can introduce Tom to his potential co-actor.</li>
      </ol> */}
    </div>
    <div className="col-sm-9">
      {/* <p className="lead">
        Extend Tom Hanks co-actors, to find co-co-actors who haven't worked with
        Tom Hanks...
      </p>
      <figure>
        <pre className="pre-scrollable code runnable">
          {`MATCH (tom:Person {name:"Tom Hanks"})-[:ACTED_IN]->(m)<-[:ACTED_IN]-(coActors),
  (coActors)-[:ACTED_IN]->(m2)<-[:ACTED_IN]-(cocoActors)
WHERE NOT (tom)-[:ACTED_IN]->()<-[:ACTED_IN]-(cocoActors) AND tom <> cocoActors
RETURN cocoActors.name AS Recommended, count(*) AS Strength ORDER BY Strength DESC`}
        </pre>
      </figure>
      <p className="lead">Find someone to introduce Tom Hanks to Tom Cruise</p>
      <figure>
        <pre className="pre-scrollable code runnable">
          {`MATCH (tom:Person {name:"Tom Hanks"})-[:ACTED_IN]->(m)<-[:ACTED_IN]-(coActors),
  (coActors)-[:ACTED_IN]->(m2)<-[:ACTED_IN]-(cruise:Person {name:"Tom Cruise"})
RETURN tom, m, coActors, m2, cruise`}
        </pre>
      </figure> */}
    </div>
  </Slide>,
  <Slide key="s9">
    <div className="col-sm-3">
      <h5>The Movie Graph</h5>
      <br />
      <h3>Clean up</h3>
      <p>When you're done experimenting, you can remove the movie data set.</p>
      <p>Note:</p>
      <ol>
        <li>Nodes can't be deleted if relationships exist</li>
        <li>Delete both nodes and relationships together</li>
      </ol>
      <p className="text-center text-warning bg-warning">
        WARNING: This will remove all Person and Movie nodes!
      </p>
      <hr />
      <p>
        <small>:help</small> <a help-topic="delete">DELETE</a>
      </p>
    </div>
    <div className="col-sm-9">
      <p className="lead">
        Delete all Movie and Person nodes, and their relationships
      </p>
      <figure>
        <pre className="pre-scrollable code runnable">
          MATCH (n) DETACH DELETE n
        </pre>
      </figure>
      <p className="lead">Prove that the Movie Graph is gone</p>
      <figure>
        <pre className="pre-scrollable code runnable">MATCH (n) RETURN n</pre>
      </figure>
    </div>
  </Slide>,
  <Slide key="s10">
    <div className="col-sm-4">
      <h3>Next steps</h3>

      <ul className="undecorated">
        <li>
          <a play-topic="northwind-graph">Northwind Graph</a> - from RDBMS to
          graph
        </li>
        <li>
          <a help-topic="cypher">Cypher</a> - Learn Cypher syntax
        </li>
        <li>
          <a
            target="_blank"
            rel="noreferrer"
            href="https://portal.graphgist.org/"
          >
            Explore more guides: Graph Gists Portal
          </a>
        </li>
      </ul>
    </div>
    <div className="col-sm-4">
      <h3>Documentation</h3>
      <ul className="undecorated">
        <li>
          <a
            target="_blank"
            rel="noreferrer"
            href="https://neo4j.com/developer/"
          >
            Developer resources
          </a>
        </li>
        <li>
          <ManualLink chapter="cypher-manual" page="/">
            Neo4j Cypher Manual
          </ManualLink>
        </li>
      </ul>
    </div>
  </Slide>
]

export default { title, category, slides }
