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
        comprehend program behaviour.
      </p>
    </div>
    <div className="col-sm-9">
      <p>
        This interface comprises the top bar (the Search box above), where you
        can search for program entities (functions, variables, and classes) in
        the model, and the list of visualization frames (not yet shown - these
        will be visible after you search for an entity), in which you can
        visualize and inspect the results of the search. A visualization frame
        can be maximized to fullscreen and closed whenever you want by clicking
        the icons at the top.
      </p>
      <p>This guide will show you how to:</p>
      <ol className="big">
        <li>Search for a program entity in the model</li>
        <li>Pose questions about the shown entities</li>
        <li>Expand the model to explore the code behaviour</li>
      </ol>
      <p></p>
      <p>
        The code you will use in this study implements the game of Chess. We
        will use parts of that code as examples in this tutorial. Click on the
        arrows on the sides or bottom of this visualization frame to navigate
        through the tutorial.
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
        class containment). A graphical model representing such a program
        includes nodes representing the entities and links indicating the
        relationships established in the code.{' '}
      </p>
      <br />
    </div>
    <div className="col-sm-9">
      <h5>
        Consider a function named <b>isPinned</b> that checks if a chess piece
        is pinned by temporarily moving the piece and checking if the move
        results in the king piece being in "check":
      </h5>
      <figure>
        <pre className="code">
          {`bool Board::isPinned(int start, int dest) {
  
  bool side = arr[start]->getSide();
  Board boardCopy = *this;
  Move move{start, dest};
  boardCopy.movePiece(move);
  if (boardCopy.isInCheck(side)) {
    return false;
  }
  return true;
}`}
        </pre>
      </figure>
      <h5>
        To find the graphical representation of this function in the model, type{' '}
        <b>"isPinned"</b> in the Search box at the top bar and click the blue
        play button to query the model for an entity with that name.
      </h5>
      {/* <pre className="pre-scrollable code runnable remove-play-icon">
        {
          'MATCH (a:cFunction)-[b]->(c) WHERE a.label CONTAINS "updateName" RETURN *'
        }
      </pre> */}
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
        You can reposition the node by dragging it around. If you hover or click
        on any node of the graph, the overview on the sidebar is replaced by the
        information associated with the selected element. To return to the
        overview, you need to deselect the clicked entity. You can do that by
        clicking on the background or the selected entity once.
      </h5>
      <h5>
        You can pan and zoom the visualization in the frame if you want. You can
        pan around the graph view by clicking and dragging the background. You
        can zoom in and out by clicking on the buttons in the bottom right
        corner. You can also expand the visualization frame into fullscreen by
        clicking on the <img src="./assets/images/expand.svg" width={10} />
        &nbsp;button on the top right corner.
      </h5>
      {/* <h5>
        As a first task, find what are the args of the isPinned function?
      </h5> */}

      <br />
      {/* <img src="./assets/images/codeSnippet.png" width={700} /> */}
    </div>
  </Slide>,
  <Slide key="s4">
    <div className="col-sm-3">
      <h3>Graphical program data</h3>
      <p className="lead">
        <em>Neo4j Browser</em> answers questions you may have about the nodes in
        the model. When you click a node, the interface opens a donut menu with
        the options of questions one can ask about the node.
      </p>
      <br />
    </div>
    <div className="col-sm-9">
      <h5>
        For example, consider we are interested in learning what the arguments
        of the function <b>isPinned</b> are. Click the node to open the question
        menu and click the option "What are the args for this?" to expand the
        graph and expose the nodes representing the function's arguments.
      </h5>
      <h5>
        <pre className="code">
          {`bool Board::isPinned(int start, int dest) {
  ...
  }`}
        </pre>
      </h5>
      <h5>
        You should see the variable nodes <b>start</b> and <b>dest</b> connected
        to the function through a <i>contain</i> link.
      </h5>
    </div>
  </Slide>,
  <Slide key="s3">
    <div className="col-sm-3">
      <h3>Graphical program data</h3>
      <p className="lead">
        <em>Neo4j Browser</em> answers questions you may have about the nodes in
        the model. When you click a node, the interface opens a donut menu with
        the options of questions one can ask about the node.
      </p>
      <br />
    </div>
    <div className="col-sm-9">
      <h5>
        Suppose you are wondering which functions can be called by{' '}
        <b>isPinned</b>. Click the node to open the question menu and click the
        option "Who can be called by this?" to expand the graph and expose the
        nodes representing the function being called.
      </h5>

      <h5>
        <pre className="code">
          {`bool Board::isPinned(int start, int dest) {
  
  bool side = arr[start]->getSide();
  ...
  ...
  boardCopy.movePiece(move);
  if (boardCopy.isInCheck(side)) {
    ...
  }
  ...
}`}
        </pre>
      </h5>
      <h5>
        You should see functions <b>getSide</b>, <b>movePiece</b>, and{' '}
        <b>isInCheck</b>.
      </h5>
      {/* <h5>
        As a first task, find what are the args of the isPinned function?
      </h5> */}

      <br />
      {/* <img src="./assets/images/codeSnippet.png" width={700} /> */}
    </div>
  </Slide>,
  <Slide key="s3">
    <div className="col-sm-3">
      <h3>Graphical program data</h3>
      <p className="lead">
        <em>Neo4j Browser</em> answers questions you may have about the nodes in
        the model. When you click a node, the interface opens a donut menu with
        the options of questions one can ask about the node.
      </p>
      <br />
    </div>
    <div className="col-sm-9">
      <h5>
        The links between <b>isPinned</b> and functions <b>getSide</b>,{' '}
        <b>movePiece</b>, and <b>isInCheck</b> represent direct calls. If we are
        interested in learning about indirect calls executed by <b>isPinned</b>{' '}
        we must asked the same question to the added nodes.
      </h5>

      <h5>
        For example, check if <b>isInCheck</b> calls any function. Click on the
        node <b>isInCheck</b> and ask the question "Who can be called by this?"
      </h5>
    </div>
  </Slide>,
  <Slide key="s3">
    <div className="col-sm-3">
      <h3>Graphical program data</h3>
      <p className="lead">
        <em>Neo4j Browser</em> answers questions you may have about the nodes in
        the model. When you click a node, the interface opens a donut menu with
        the options of questions one can ask about the node.
      </p>
      <br />
    </div>
    <div className="col-sm-9">
      <h5>
        You should see function <b>isUnderAttack</b>. The current state of the
        model tells us that <b>isPinned</b> can indirectly call{' '}
        <b>isUnderAttack</b>. Since its call to <b>isInCheck</b> can lead to the
        execution of <b>isUnderAttack</b>.
      </h5>

      <h5>
        Identifying all indirect calls of a function requires the expansion of
        the call path until there are no new links to expand.
      </h5>
    </div>
  </Slide>,
  <Slide key="s5">
    <div className="col-sm-3">
      <h3>Program comprehension questions</h3>
      <p className="lead">
        <em>Neo4j Browser</em> answers questions you may have about the nodes in
        the model. When you click on a node, the interface opens a donut menu
        with the options of questions one can ask about the node.
      </p>
      <br />
    </div>
    <div className="col-sm-9">
      <p>
        The models in <em>Neo4j Browser</em> include the following types of
        links:
      </p>
      <ol className="big">
        <li>
          <b>
            <i>function1</i>
          </b>{' '}
          <u>call</u>{' '}
          <b>
            <i>function2</i>
          </b>
          : <i>function1</i> calls <i>function2</i>{' '}
        </li>
        <li>
          <b>
            <i>function</i>
          </b>{' '}
          <u>write</u>{' '}
          <b>
            <i>variable</i>
          </b>
          : <i>function</i> assigns data to <i>variable</i>
        </li>
        <li>
          <b>
            <i>variable</i>
          </b>{' '}
          <u>instanceOf</u>{' '}
          <b>
            <i>class</i>
          </b>
          : <i>variable</i> stores an instance of <i>class</i> (or <i>struct</i>
          )
        </li>
        <li>
          <b>
            <i>entity1</i>
          </b>{' '}
          <u>contain</u>{' '}
          <b>
            <i>entity2</i>
          </b>
          : <i>entity1</i> contains <i>entity2</i> in some form; for instance, a
          class contain a function
        </li>
        <li>
          <b>
            <i>variable1</i>
          </b>{' '}
          <u>varWrite</u>{' '}
          <b>
            <i>variable2</i>
          </b>
          : <i>variable1</i> is used in an assignment to <i>variable2</i>
        </li>
        <li>
          <b>
            <i>variable1</i>
          </b>{' '}
          <u>parWrite</u>{' '}
          <b>
            <i>variable2</i>
          </b>
          : <i>variable1</i> is an actual parameter whose value is passed to
          formal parameter <i>variable2</i>
        </li>
      </ol>

      <p>
        Control flow paths in the code are defined as sequences of <i>call</i>{' '}
        links. Data flow paths are sequences of variable assignments (
        <i>varWrite</i>), parameter passing (<i>parWrite</i>), and function
        return values (<i>retWrite</i>).
      </p>
    </div>
  </Slide>,
  <Slide key="s6">
    <div className="col-sm-3">
      <h3>Program comprehension questions</h3>
      <p className="lead">
        <em>Neo4j Browser</em> answers questions you may have about the nodes in
        the model. When you click on a node, the interface opens a donut menu
        with the options of questions one can ask about the node.
      </p>
      <br />
    </div>
    <div className="col-sm-9">
      <h5>
        To illustrate the representation of dataflow links, consider the
        function <b>generateMove</b>:
      </h5>

      <h5>
        <pre className="code">
          {`Move Level1::generateMove() const {
  ...
  std::vector<int> canMove;
  ...
  int rand1 = rand() % canMove.size();
  ...
}`}
        </pre>
      </h5>
      <h5>
        Search for the node repesenting the variable <b>rand1</b>. Note that an
        assignment to the variable is executed within the function, which means
        that clicking on the question button "Which function writes to this?"
        adds a new node representing the function <b>generateMove</b> and a{' '}
        <i>write</i>.
      </h5>
    </div>
  </Slide>,
  <Slide key="s6">
    <div className="col-sm-3">
      <h3>Program comprehension questions</h3>
      <p className="lead">
        <em>Neo4j Browser</em> answers questions you may have about the nodes in
        the model. When you click on a node, the interface opens a donut menu
        with the options of questions one can ask about the node.
      </p>
      <br />
    </div>
    <div className="col-sm-9">
      <h5>
        <pre className="code">
          {`Move Level1::generateMove() const {
  ...
  std::vector<int> canMove;
  ...
  int rand1 = rand() % canMove.size();
  ...
  }`}
        </pre>
        <h5>
          Similarly, note that vector <b>canMove</b> is used in the assignment
          to <b>rand1</b>. Then, clicking on question button "Which variable
          writes to this variable?" adds the node representing <b>canMove</b>{' '}
          and a <i>varWrite</i> link.
        </h5>
      </h5>
      <h5></h5>
    </div>
  </Slide>,
  <Slide key="s6">
    <div className="col-sm-3">
      <h3>Program comprehension questions</h3>
      <p className="lead">
        <em>Neo4j Browser</em> answers questions you may have about the nodes in
        the model. When you click on a node, the interface opens a donut menu
        with the options of questions one can ask about the node.
      </p>
      <br />
    </div>
    <div className="col-sm-9">
      <h5>
        To illustrate the representation of dataflow links through parameter
        passing, consider the function <b>kingMoves</b>:
      </h5>

      <h5>
        <pre className="code">
          {`vector<int> Board::kingMoves(int coord, bool side) {
    ...
        if (isUnderAttack(whiteKing, side) != -1) {}
        ...
}`}
        </pre>
      </h5>
      <h5>
        Search for the node repesenting the function <b>isUnderAttack</b>. In
        the code, note that function <b>isUnderAttack</b> is called and passed
        two actual parameter <b>whiteKing</b> and <b>side</b>. To find the
        formal parameters of the function in the graph, click on the question
        "What are the args of this?", and add nodes <b>coord</b> and <b>side</b>
        .
      </h5>
    </div>
  </Slide>,
  <Slide key="s6">
    <div className="col-sm-3">
      <h3>Program comprehension questions</h3>
      <p className="lead">
        <em>Neo4j Browser</em> answers questions you may have about the nodes in
        the model. When you click on a node, the interface opens a donut menu
        with the options of questions one can ask about the node.
      </p>
      <br />
    </div>
    <div className="col-sm-9">
      <h5>
        <pre className="code">
          {`vector<int> Board::kingMoves(int coord, bool side) {
    ...
        if (isUnderAttack(whiteKing, side) != -1) {}
        ...
}`}
        </pre>
        <h5>
          For this example, let's focus on the parameter <b>side</b>. Select
          that node and click on the question "Which variable is passed as this
          argument?". The graph is expanded by adding two nodes also named{' '}
          <b>side</b> and two <i>parWrite</i> links connecting them to the
          original <b>side</b>. To identify which of the nodes represents the
          formal parameter <b>side</b> declared in the signature of{' '}
          <b>kingMoves</b> above, you can ask the question "Where is this
          declared?" about each of the new nodes. Only one of them should be
          connected to function <b>kingMoves</b> through a <i>contain</i> link.
        </h5>

        <h5>
          Feel free to proceed to the next slide once you identify the correct
          node.
        </h5>
      </h5>
      <h5></h5>
    </div>
  </Slide>,
  <Slide key="s7">
    <div className="col-sm-3">
      <h3>Program comprehension questions</h3>
      <p className="lead">
        <em>Neo4j Browser</em> answers questions you may have about the nodes in
        the model. When you click on a node, the interface opens a donut menu
        with the options of questions one can ask about the node.
      </p>
      <br />
    </div>
    <div className="col-sm-9">
      <h5>
        After posing a question the graph will expand to include the query's
        results. You can remove the query results by re-clicking on the button
        of the posed question. Also, clicking on another menu option will remove
        the results of the previous query and reveal the results of the new
        query.
      </h5>

      <h5>
        If you pose a question that does not change the graph, meaning the
        question's answer is an empty set, <em>Neo4j Browser</em> will not make
        any changes to the graph (including not removing the results of the
        previous query). Instead, the yellow box around the question label will
        turn red to indicate that the results were empty.
      </h5>
    </div>
  </Slide>,
  <Slide key="s8">
    <div className="col-sm-3">
      <h3>Program comprehension questions</h3>
      <p className="lead">
        <em>Neo4j Browser</em> answers questions you may have about the nodes in
        the model. When you click on a node, the interface opens a donut menu
        with the options of questions one can ask about the node.
      </p>
      <br />
    </div>
    <div className="col-sm-9">
      <h5>
        To experiment with the interface, check which function may call the
        function <b>legalSlidingMoves</b>. Use the question options to identify
        the name of that function. Move to the next slide to check your answer.
      </h5>
    </div>
  </Slide>,
  <Slide key="s10">
    <div className="col-sm-3">
      <h3>Program comprehension questions</h3>
      <p className="lead">
        <em>Neo4j Browser</em> answers questions you may have about the nodes in
        the model. When you click on a node, the interface opens a donut menu
        with the options of questions one can ask about the node.
      </p>
      <br />
    </div>
    <div className="col-sm-9">
      <h5>
        The function that can call <i>legalSlidingMoves</i> is named{' '}
        <b>legalMoves</b>.
      </h5>
    </div>
  </Slide>,
  <Slide key="s11">
    <div className="col-sm-3">
      <h3>End of tutorial</h3>
      <p className="lead">
        Now that you are familiar with the interface, we can start the study.
      </p>
    </div>
    <div className="col-sm-9">
      When you are ready, close the visualization frame with results of the
      tutorial questions (clicking on the 'X' at the right top corner of each
      frame), and let the researcher know you are ready to proceed with the
      study.
    </div>
    {/* <pre className="pre-scrollable code runnable remove-play-icon">
      {':play study'}
    </pre> */}
  </Slide>
]

export default { title, category, slides }
