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
