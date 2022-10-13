import React, { Component } from 'react'
import { useState } from 'react'

// type NameForm = any
type State = any

export default function NameForm(props: any): JSX.Element {
  const [value, setValue] = useState('')
  const [disableButton, setDisableButton] = useState(() => {
    return localStorage.getItem(props.id) !== null
  })

  const handleChange = (event: any) => {
    setValue(event.target.value)
  }

  const handleSubmit = (event: any) => {
    localStorage.setItem(props.id, value)
    localStorage.setItem(props.id + '-submitTime', String(Date.now()))
    setValue('')
    setDisableButton(true)
    event.preventDefault()
  }

  return (
    <form onSubmit={handleSubmit}>
      <label>
        <textarea rows={5} cols={50} value={value} onChange={handleChange} />
      </label>
      <br />
      <input type="submit" disabled={disableButton} value="Submit" />
    </form>
  )
}
