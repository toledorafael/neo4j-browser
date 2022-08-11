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
      <h3>
        How to present software analysis results that are conditioned on the
        software's configuration
      </h3>
      <p className="lead">
        In this presentation, you will learn how to use <em>Neo4j Browser</em>{' '}
        to visualize analysis results of configurable software.
      </p>
    </div>
    <div className="col-sm-9">
      <p>
        This interface comprises (1) the top bar (with the "neo4j$" prompt),
        where you can run queries over the database, and (2) the list of
        visualization frames, in which you can visualize and inspect the results
        of the query. A visualization frame can be maximized to fullscreen and
        closed whenever you want by clicking the icons at the top. When a
        visualization frame is maximized to fullscreen, the top left corner of
        the visualization is populated with a form used to create{' '}
        <i>visualization filters</i> that reduce the query results.
      </p>
      {/* <p>This guide will show you how to:</p>
      <ol className="big">
        <li>Run a query about configurable program data</li>
        <li>Customize the visualization of the results</li>
        <li>Add filters representing different program variants</li>
      </ol>
      <p></p> */}
      <p>
        Note that you are not expected to learn the query language. All required
        queries will be provided - they match the queries used in the
        presentation. Click on the "next" or "back" arrow on the side of the
        visualization frame or at bottom of the frame to navigate through the
        tutorial.
      </p>
    </div>
  </Slide>,
  <Slide key="s2">
    <div className="col-sm-3">
      <h3>
        Results format - Behaviour Alteration analysis (path between components)
      </h3>
      <p className="lead">
        Click on the following query and hit the play button to create a{' '}
        <b>graphical representation</b> of analysis results with relationships
        of the same type.
      </p>
      <br />
    </div>
    <div className="col-sm-9">
      <h5></h5>
      <pre className="pre-scrollable code runnable remove-play-icon">
        {
          'MATCH p=(srcComp:component)-[r:alterBehavior]->(dstComp:component) RETURN DISTINCT srcComp, r, dstComp'
        }
      </pre>
      The resulting visualization frame and its correspondent tabular
      representation should look like the following image:
      <br />
      <img
        width="1000"
        src="./assets/images/tabularGraphicalSameType.png"
        alt="Customization options"
      />
    </div>
  </Slide>,
  <Slide key="s3">
    <div className="col-sm-3">
      <h3>
        Results format - Behaviour Alteration analysis (with internal calls)
      </h3>
      <p className="lead">
        Click on the following query and hit the play button to create a{' '}
        <b>graphical representation</b> of analysis results with relationships
        of different types.
      </p>
      <br />
    </div>
    <div className="col-sm-9">
      <h5></h5>
      <pre className="pre-scrollable code runnable remove-play-icon">
        {
          'MATCH p=(srcComp:component)-[behaviourAlterationEdge]->(dstComp:component) MATCH q=(srcComp)-[firstCall]->(intermediateComp)-[secondCall]->(dstComp) WHERE srcComp.name = "C11" AND dstComp.name = "C12" AND (intermediateComp.name = "C10" OR intermediateComp.name = "C7") RETURN Distinct srcComp, behaviourAlterationEdge, firstCall, intermediateComp, secondCall, dstComp'
        }
      </pre>
      The resulting visualization frame and its correspondent tabular
      representation should look like the following image:
      <br />
      <img
        width="1000"
        src="./assets/images/tabularGraphicalInternalLinksSmall.png"
        alt="Customization options"
      />
    </div>
  </Slide>,
  <Slide key="s4">
    <div className="col-sm-3">
      <h3>
        Results format - Behaviour Alteration analysis (with internal calls)
      </h3>
      <p className="lead">
        Click on the following query and hit the play button to create a{' '}
        <b>graphical representation</b> of a larger example of analysis results
        with relationships of different types. Feel free to move the nodes
        around with your cursor to make it easir to view the full graph and its
        labels.
      </p>
      <br />
    </div>
    <div className="col-sm-9">
      <h5></h5>
      <pre className="pre-scrollable code runnable remove-play-icon">
        {
          'MATCH p=(srcComp:component)-[r]->(dstComp:component) RETURN DISTINCT type(r), srcComp, dstComp, r'
        }
      </pre>
      The resulting visualization frame and the its correspondent tabular
      representation should look like the following image:
      <br />
      <img
        width="1000"
        src="./assets/images/tabularGraphicalInternalLinks.png"
        alt="Customization options"
      />
    </div>
  </Slide>,
  <Slide key="s5">
    <div className="col-sm-3">
      <h3>Results filtered by a single variant (small example)</h3>
      <p className="lead">
        Click on the following query and hit the play button to create a{' '}
        <b>graphical representation</b> of analysis results with relationships
        of different types. Maximize the visualization and create a filter with
        the configuration expression <b>"aid /\ art /\ !raw /\ buy"</b>. Click
        on the filter label in the sidebar to assign it a different colour.
      </p>
      <br />
    </div>
    <div className="col-sm-9">
      <h5></h5>
      <pre className="pre-scrollable code runnable remove-play-icon">
        {
          'MATCH p=(srcComp:component)-[behaviourAlterationEdge]->(dstComp:component) MATCH q=(srcComp)-[firstCall]->(intermediateComp)-[secondCall]->(dstComp) WHERE srcComp.name = "C11" AND dstComp.name = "C12" AND (intermediateComp.name = "C10" OR intermediateComp.name = "C7") RETURN Distinct srcComp, behaviourAlterationEdge, firstCall, intermediateComp, secondCall, dstComp'
        }
      </pre>
      The correspondent tabular representation should look like the following
      image:
      <br />
      <img
        width="600"
        src="./assets/images/tableSingleVariant.png"
        alt="Customization options"
      />
    </div>
  </Slide>,
  <Slide key="s6">
    <div className="col-sm-3">
      <h3>Results filtered by two variants (small example)</h3>
      <p className="lead">
        For this example, you can use the visualization created in the previous
        page and simply add a second filter. Add a second filter{' '}
        <b>"aid /\ art /\ raw /\ buy"</b>, and click on the filter's label in
        the sidebar to assign it a different colour. Make sure to remove all
        filters before running another query, unless you prefer to apply these
        same filters to the next query.
      </p>
      <br />
    </div>
    <div className="col-sm-9">
      <h5></h5>
      <pre className="pre-scrollable code runnable remove-play-icon">
        {
          'MATCH p=(srcComp:component)-[behaviourAlterationEdge]->(dstComp:component) MATCH q=(srcComp)-[firstCall]->(intermediateComp)-[secondCall]->(dstComp) WHERE srcComp.name = "C11" AND dstComp.name = "C12" AND (intermediateComp.name = "C10" OR intermediateComp.name = "C7") RETURN Distinct srcComp, behaviourAlterationEdge, firstCall, intermediateComp, secondCall, dstComp'
        }
      </pre>
      The correspondent tabular representation should look like the following
      image:
      <br />
      <img
        width="600"
        src="./assets/images/tableTwoVariants.png"
        alt="Customization options"
      />
    </div>
  </Slide>,
  <Slide key="s7">
    <div className="col-sm-3">
      <h3>Results filtered by a group of variants</h3>
      <p className="lead">
        For this example, you can use the visualization created on the previous
        page and simply change the filters. Remove all existing filters and add
        the filter <b>“!raw /\ art”</b>. Click on the filter's label in the
        sidebar to assign it a different colour.
      </p>
      <br />
    </div>
    <div className="col-sm-9">
      <h5></h5>
      <pre className="pre-scrollable code runnable remove-play-icon">
        {
          'MATCH p=(srcComp:component)-[r]->(dstComp:component) RETURN DISTINCT type(r), srcComp, dstComp, r'
        }
      </pre>
      The correspondent tabular representation should look like the following
      image:
      <br />
      <img
        width="600"
        src="./assets/images/tableMultipleVariants.png"
        alt="Customization options"
      />
    </div>
  </Slide>,
  <Slide key="s8">
    <div className="col-sm-3">
      <h3>Compare groups of variants</h3>
      <p className="lead">
        For this example, you can use the visualization created on the previous
        page and simply add a second filter. Add a second filter <b>"aid"</b>,
        and click on the filter's label in the sidebar to assign it a different
        colour.
      </p>
      <br />
    </div>
    <div className="col-sm-9">
      <h5></h5>
      <pre className="pre-scrollable code runnable remove-play-icon">
        {
          'MATCH p=(srcComp:component)-[r]->(dstComp:component) RETURN DISTINCT type(r), srcComp, dstComp, r'
        }
      </pre>
      The correspondent tabular representation should look like the following
      image:
      <br />
      <img
        width="600"
        src="./assets/images/tableMultipleGroupVariants.png"
        alt="Customization options"
      />
    </div>
  </Slide>
]

export default { title, category, slides }
