import React, { Component } from 'react'
import { useState } from 'react'
import { log } from '../Logging/Log'

// type NameForm = any
type State = any

export default function NameForm(props: any): JSX.Element {
  const [value, setValue] = useState('')
  const [output, setOutput] = useState('')
  const [hideOutput, setHideOutput] = useState(true)

  const handleChange = (event: any) => {
    setValue(event.target.value)
  }

  const handleSubmit = (event: any) => {
    log(props.id + 'Submit, ' + value)
    setValue('')
    setOutput(value)
    setHideOutput(false)
    event.preventDefault()
  }

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <label>
          <textarea rows={5} cols={50} value={value} onChange={handleChange} />
        </label>
        <br />
        <input type="submit" value="Submit" />
      </form>
      <div hidden={hideOutput}>
        <p></p>
        You submitted:<br></br>
        <textarea rows={5} cols={50} value={output} readOnly={true} />
      </div>
    </div>
  )
}
