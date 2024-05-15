import React, { useState, useEffect } from 'react'
import { ReactSearchAutocomplete } from 'react-search-autocomplete'
import { SearchBarContainer } from './styled'

function SearchBar({ onSearchSelected }: { onSearchSelected: any }) {
  const [items, setItems] = useState([
    {
      id: 0,
      name: 'Are all calls coming from the same class?'
    },
    {
      id: 1,
      name: 'How are these types or objects related?'
    },
    {
      id: 2,
      name: 'Where is this field declared in the type hierarchy?'
    },
    {
      id: 3,
      name: "What is this type's type hierarchy?"
    },
    {
      id: 4,
      name: 'What are the parts of this type?'
    }
  ])

  const [question, setQuestion] = useState('')

  //   useEffect(() => {
  //     document.title = `You clicked ${count} times`;
  //   });

  const handleOnSelect = (item: any) => {
    // TODO: update searchbar with selected item
    // this.setState({selectedQuestion: item.name})
    // TODO: show form with parameters for questions
    setQuestion(item.name)
    console.log(question)
    onSearchSelected(item) // TODO: paste query on editor
  }

  return (
    <SearchBarContainer style={{ width: '100%' }}>
      <ReactSearchAutocomplete
        items={items}
        onSelect={handleOnSelect}
        placeholder={question}
      />
    </SearchBarContainer>
  )
}

export default SearchBar
