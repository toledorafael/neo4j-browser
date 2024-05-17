import React, { useState, useEffect } from 'react'
import { ReactSearchAutocomplete } from 'react-search-autocomplete'
import { SearchBarContainer } from './styled'

function SearchBar({ onSearchSelected }: { onSearchSelected: any }) {
  const [items, setItems] = useState([
    {
      id: 0,
      name: 'Are all calls coming from the same class?',
      query: [
        'MATCH (c1:cClass)-[:contain]->(f1:cFunction)-[:call]->(f2:cFunction{id:"',
        '"}) WITH f2, f1, count(c1) as totalClasses, collect(c1) as classes RETURN DISTINCT  totalClasses, classes;'
      ]
    },
    {
      id: 1,
      name: 'How are these types or objects related?',
      query: [
        'MATCH typeRelation=(t1:cClass{id:"',
        '"})-[:compose|inherit*]->(t2:cClass{id:"',
        '"}) RETURN typeRelation;'
      ]
    },
    {
      id: 2,
      name: 'Where is this field declared in the type hierarchy?',
      query: [
        'MATCH (field:cVariable{id:"',
        '"})<-[:contain]-(class:cClass) MATCH typeHierarchy=(class)-[:compose|inherit*]->(otherType:cClass) RETURN field, typeHierarchy;'
      ]
    },
    {
      id: 3,
      name: "What is this type's type hierarchy?",
      query: [
        'MATCH typeHierarchy=(t1:cClass{id:"',
        '"})-[:compose|inherit*]->(otherType:cClass) RETURN typeHierarchy;'
      ]
    },
    {
      id: 4,
      name: 'What are the parts of this type?',
      query: [
        'MATCH (member)<-[:contain]-(class:cClass{id:"',
        '"}) RETURN member.id;'
      ]
    },
    {
      id: 5,
      name: 'Does this type have any siblings in the type hierarchy?',
      query: [
        'MATCH (subClass:cClass{id:"',
        '"})-[:inherit]->(superclass:cClass)<-[:inherit]-(sibling:cClass) RETURN DISTINCT sibling;'
      ]
    },
    {
      id: 6,
      name:
        'What are the composition, ownership, or usage relationships of this type?',
      query: [
        'MATCH (t1:cClass{id:"',
        '"})<-[:compose*]-(t3:cClass) RETURN DISTINCT t3.id;'
      ]
    },
    {
      id: 7,
      name: 'Which types is this type a part of?',
      query: [
        'MATCH (t1:cClass)<-[:compose*]-(t3:cClass{id:"',
        '"}) RETURN DISTINCT t1.id;'
      ]
    },
    {
      id: 8,
      name: 'Who implements this interface or these abstract methods?',
      query: [
        'MATCH (t1:cClass)-[:override]->(m:cFunction{id:"',
        '"}) RETURN *'
      ]
    },
    {
      id: 9,
      name: 'How does this code interact with libraries?',
      query: [
        'MATCH (cfgN:cCFGBlock)-[r]-(codeEntity) WHERE cfgN.id CONTAINS "',
        '" AND (codeEntity.id CONTAINS ";std::" OR codeEntity.filename CONTAINS "/usr/") RETURN DISTINCT r, codeEntity;'
      ]
    },
    {
      id: 10,
      name: 'How is control getting (from here to) here?',
      query: [
        'MATCH p1=(f1:cFunction{id:"',
        '"})-[:contain]->(cfgEntry1:cCFGBlock) MATCH p2=(f2:cFunction{id:"',
        '"})-[:contain]->(cfgEntry2:cCFGBlock) MATCH cfgPath=shortestPath((cfgEntry1)-[:nextCFGBlock*1..]->(cfgEntry2)) WHERE cfgEntry1.id CONTAINS "CFG:ENTRY" AND cfgEntry2.id CONTAINS "CFG:ENTRY" AND f1<>f2 RETURN cfgPath;'
      ]
    },
    {
      id: 11,
      name: 'Where is this type referenced?',
      query: [
        'MATCH reference=(v:variable{type: "',
        '"})<-[:reference]-(x) RETURN reference'
      ]
    },
    {
      id: 12,
      name: 'How is data put into this variable?',
      query: [
        'MATCH path=(source)-[:write|varWrite|parWrite|retWrite*1..3]->(target:cVariable{id: "',
        '"}) RETURN DISTINCT nodes(path);'
      ]
    },
    {
      id: 13,
      name: 'How often does a method get called?',
      query: [
        'MATCH (f1:cFunction)-[:call]->(f2:cFunction{id:"',
        '"}) WITH f2, count(f1) as totalCallers, collect(f1) as callers RETURN totalCallers;'
      ]
    },
    {
      id: 14,
      name: 'Is the method/variable ever being used?',
      query: ['MATCH (e1{id:"', '"})-[r]-(e2) RETURN count(r);']
    },
    {
      id: 15,
      name:
        'Is there an entity named something like this in that unit (project, package, or class)?',
      query: ['MATCH (e) WHERE e.id CONTAINS "', '" RETURN e']
    },
    {
      id: 16,
      name: 'Is this library code?',
      query: [
        'MATCH cfgP1=(cfgN1:cCFGBlock) WHERE cfgN1.id CONTAINS "',
        'AND (cfgN1.id CONTAINS ";std::" OR cfgN1.id CONTAINS "/usr/") RETURN DISTINCT cfgN1;'
      ]
    },
    {
      id: 17,
      name: 'Is this method or code path called frequently, or is it dead?',
      query: [
        'MATCH (f1:cFunction)-[:call]->(f2:cFunction{id:"',
        '"}) WITH f2, count(f1) as totalCallers, collect(f1) as callers RETURN DISTINCT totalCallers, callers;'
      ]
    },
    {
      id: 18,
      name: 'What are the arguments to this function?',
      query: [
        'MATCH (f:cFunction{id:"',
        '"})-[r:contain]->(v:cVariable{isParam:"1"}) RETURN v;'
      ]
    },
    {
      id: 19,
      name: 'What are the begins/ends of control blocks?',
      query: [
        'MATCH (entry:cCFGBlock)<-[:contain]-(f:cFunction {id: "',
        '"})-[:contain]->(exit:cCFGBlock) WHERE entry.id CONTAINS "CFG:ENTRY" AND exit.id CONTAINS "CFG:0" RETURN entry, exit;'
      ]
    },
    {
      id: 20,
      name: 'What are the differences between these types?',
      query: [
        'MATCH (c1:cClass{id:"',
        '"})-[:contain]->(x) MATCH (c2:cClass{id:"',
        '"})-[:contain]->(y) WITH collect(x.id) as t1Parts, collect(y.id) as t2Parts RETURN [x in t1Parts WHERE not(x in t2Parts)] as deltaInT1, [x in t2Parts WHERE not(x in t1Parts)] as deltaInT2;'
      ]
    },
    {
      id: 21,
      name: 'What exceptions or errors can this method generate?',
      query: [
        'MATCH (f:function{name:"',
        '"})-[:throw]->(e:exception) RETURN e'
      ]
    },
    {
      id: 22,
      name: 'What throws this exception?',
      query: [
        'MATCH (f:function)-[:throw]->(e:exception{type:"',
        '"}) RETURN f'
      ]
    },
    {
      id: 23,
      name: 'What are unused methods?',
      query: ['MATCH (f1:cFunction) WHERE NOT (f1)<-[:call]-() RETURN f1']
    },
    {
      id: 24,
      name: 'What code directly or indirectly uses this data?',
      query: [
        'MATCH (source:cVariable{id:"',
        '"})-[:varWrite| :parWrite | :retWrite | :varInfFunc]->(target) MATCH (target)-[destRel]->(cfgSource:cCFGBlock)<-[sourceRel]-(source) WHERE type(destRel) CONTAINS "',
        '" AND type(sourceRel) CONTAINS "',
        '" RETURN DISTINCT cfgSource;'
      ]
    },
    {
      id: 25,
      name: 'What data is being modified in this code?',
      query: [
        'MATCH cfgP1=(cfgN1:cCFGBlock)<-[:parWriteDestination|writeDestination|retWriteDestination|parWriteDestination]-(v2:cVariable) WHERE cfgN1.id CONTAINS "',
        '" RETURN v2;'
      ]
    },
    {
      id: 26,
      name: 'What does this code depend on?',
      query: [
        'MATCH (csource)-[r]->(ctarget:cCFGBlock) WHERE ctarget.id CONTAINS "',
        '" AND type(r) CONTAINS "',
        '" RETURN DISTINCT r, csource;'
      ]
    },
    {
      id: 27,
      name: 'What gets called when this method gets called?',
      query: [
        'MATCH p=(f1:cFunction{id:"',
        '"})-[:call*]->(f3:cFunction) RETURN nodes(p)'
      ]
    },
    {
      id: 28,
      name: 'Where was this variable last changed?',
      query: [
        'MATCH (source:cFunction)-[:write]->(target:cVariable{id: "',
        '"}) MATCH (target)-[:writeDestination]->(cfgSource:cCFGBlock)<-[r:writeSource]-(source) RETURN cfgSource;'
      ]
    },
    {
      id: 29,
      name: 'What is responsible for updating this field, variable?',
      query: [
        'MATCH (f:cFunction)-[:write]->(target:cVariable{id: "',
        '"}) RETURN f;'
      ]
    },
    {
      id: 30,
      name: 'What is the context of this code?',
      query: [
        'MATCH p=(f1:cFunction)-[:call*]->(f2:cFunction{id:"',
        '"}) RETURN distinct nodes(p)'
      ]
    },
    {
      id: 31,
      name:
        'What is the difference between these similar parts of the code (e.g., between sets of methods)?',
      query: [
        'MATCH (cfgN1:cCFGBlock)--(x) MATCH (cfgN2:cCFGBlock)--(y) WHERE cfgN1.id CONTAINS "',
        '" AND cfgN2.id CONTAINS "',
        '" WITH collect(DISTINCT x) as cfgN1Rels, collect(DISTINCT y) as cfgN2Rels RETURN [x in cfgN1Rels WHERE not(x in cfgN2Rels)] as delta1, [x in cfgN2Rels WHERE not(x in cfgN1Rels)] as delta2'
      ]
    },
    {
      id: 32,
      name: 'Does data from this method/code travel to the database?',
      query: [
        'MATCH path=(:function)-[:contain]->(source:variable{name:"',
        '"})-[write|read*]->(target:variable) WHERE target.isDatabase = true RETURN path'
      ]
    },
    {
      id: 33,
      name: 'Is there input coming from the user?',
      query: [
        'MATCH path=(source:variable)-[write|read*]->(target:variable) WHERE source.isUserInput = true RETURN path'
      ]
    },
    {
      id: 34,
      name: 'What data can we access from this object?',
      query: [
        'MATCH (v: cVariable{id:"',
        '"})-[:obj]->(c:cClass) MATCH (c)-[:contain]->(f:cVariable) RETURN f;'
      ]
    },
    {
      id: 35,
      name: 'What is the file name?',
      query: ['MATCH (x{id:"', '"}) RETURN x.filename;']
    },
    {
      id: 36,
      name: 'What parts of this data structure are modified by this code?',
      query: [
        'MATCH cfgP1=(c:cCFGBlock)<-[:parWriteDestination|writeDestination|retWriteDestination|parWriteDestination]-(v2:cVariable) MATCH (v2)<-[:contain]-(ds:cClass{id:"',
        '"}) WHERE c.id CONTAINS "',
        '"RETURN v2;'
      ]
    },
    {
      id: 37,
      name: 'Where is this method overridden?',
      query: [
        'MATCH (f:function{name:"',
        '", isVirtual:true})<-[:contain]-(super:class)<-[:inherit*]-(sub:class)-[:contain]->(f:function{name:"',
        '}) RETURN sub'
      ]
    },
    {
      id: 38,
      name: 'When during the execution is this method called?',
      query: [
        'MATCH p=(f1:cFunction)-[:call]->(f2:cFunction{id:"',
        '"}) MATCH cfgPath=(f1)-[r]->(cfgNode:cCFGBlock)<-[t]-(f2) RETURN cfgNode'
      ]
    },
    {
      id: 39,
      name: 'What are the constant variables and values?',
      query: ['MATCH (c:constant) RETURN c, c.value']
    },
    {
      id: 40,
      name: 'Where are instances of this class created?',
      query: ['MATCH (t:cClass{id: "', '"})<-[:obj]-(v) RETURN v;']
    },
    {
      id: 41,
      name: 'What includes are unnecessary?',
      query: [
        'MATCH (e1:file) WHERE NOT (e1)<-[:include]-(e2) RETURN e1.filename'
      ]
    },
    {
      id: 42,
      name: 'Where can this global variable be changed?',
      query: [
        'MATCH (source:cFunction)-[:write]->(target:cVariable{id: "',
        '"}) MATCH (target)-[:writeDestination]->(cfgSource:cCFGBlock)<-[r:writeSource]-(source) RETURN cfgSource;'
      ]
    },
    {
      id: 43,
      name: 'What are all include file definitions and uses?',
      query: ['MATCH (file:file{name:"', '"})<-[:include]-(file) RETURN entity']
    },
    {
      id: 44,
      name: 'Where does this information/data go?',
      query: [
        'MATCH path=(source:cVariable{id:"',
        '"})-[:varWrite|parWrite*1..3]->(target) RETURN DISTINCT nodes(path);'
      ]
    },
    {
      id: 45,
      name: 'Where is the main program?',
      query: ['MATCH (f:cFunction{id:"', '"}) RETURN f.filename;']
    },
    {
      id: 46,
      name: 'Where is the method being called?',
      query: [
        'MATCH p=(f1:cFunction)-[:call]->(f2:cFunction{id:"',
        '"}) MATCH (f1)-[r1:callSource]->(cfgNode:cCFGBlock)<-[r2]-(f2)WHERE type(r2) CONTAINS "',
        'RETURN distinct r2, cfgNode;'
      ]
    },
    {
      id: 47,
      name: 'Which API methods are called?',
      query: [
        'MATCH (n)-[:call]->(API_function) WHERE API_function CONTAINS "',
        '" RETURN API_function'
      ]
    },
    {
      id: 48,
      name: 'Where is the method defined in the type hierarchy?',
      query: [
        'MATCH (m:function{name:"',
        '})-[:contain]->(t1:type) MATCH (t1)-[:inherit*1..]->(t2:type) MATCH (t1)<-[:inherit*1..]-(t3:type) RETURN *'
      ]
    },
    {
      id: 49,
      name: 'Where is this data structure used?',
      query: [
        'MATCH (accessingFunction)-[:write]->(accessedNode:cVariable{id:"',
        '"}) MATCH (accessedFunction)-[:writeDestination]->(cfgBlock1:cCFGBlock)<-[:writeSource]-(accessingNode) RETURN DISTINCT accessingFunction, cfgBlock1 MATCH (accessingNode)<-[:varWrite| :parWrite | :retWrite | :varInfFunc]-(accessedNode:cVariable{id:"',
        '"}) MATCH (accessedNode)-[destination]->(cfgBlock2:cCFGBlock)<-[source]-(accessingNode) WHERE type(destination) CONTAINS "',
        '" AND type(source) CONTAINS "',
        '" RETURN DISTINCT accessingNode, cfgBlock2;'
      ]
    },
    {
      id: 50,
      name: 'Where is this defined?',
      query: ['MATCH (f:cFunction{id:"', '"}) RETURN f.filename;']
    },
    {
      id: 51,
      name: 'Where is this used in the code?',
      query: [
        'MATCH (usedNode:cVariable{id:"',
        '"})-[use]->(cfgBlock:cCFGBlock) WHERE type(use) CONTAINS "',
        '" OR type(use) CONTAINS "',
        '" RETURN DISTINCT cfgBlock;'
      ]
    },
    {
      id: 52,
      name: 'Who can call this?',
      query: [
        'MATCH (f1:cFunction)-[:call]->(f2:cFunction{id:"',
        '"}) RETURN distincgt f1'
      ]
    }
  ])

  //   useEffect(() => {
  //     document.title = `You clicked ${count} times`;
  //   });

  const handleOnSelect = (item: any) => {
    // TODO: update searchbar with selected item
    // this.setState({selectedQuestion: item.name})
    // TODO: show form with parameters for questions
    onSearchSelected(item.query) // TODO: paste query on editor
  }

  return (
    <SearchBarContainer style={{ width: '100%' }}>
      <ReactSearchAutocomplete
        items={items}
        onSelect={handleOnSelect}
        placeholder={'Type your question here'}
      />
    </SearchBarContainer>
  )
}

export default SearchBar
