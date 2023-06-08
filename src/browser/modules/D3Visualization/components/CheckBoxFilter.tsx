import React, { useEffect, useRef, useState } from 'react'
import { FilterIcon } from 'browser-components/icons/Icons'
import styled from 'styled-components'

const TooltipWrapper = styled.div`
  position: relative;
  display: inline-block;
  float: right;
`
const Tooltip = styled.div`
  position: absolute;
  z-index: 1;
  margin-top: 0.5rem;
  margin-left: -2.5rem;
  background: white;
  border: 1px solid #666;
  padding: 0.75rem;
  border-radius: 0.5rem;
  box-shadow: 0 2px 2px -1px rgba(0, 0, 0, 0.4);
`

const StyledOption = styled.div`
  display: flex;
  font-size: 1rem;
  margin: 0.375rem 0.125rem;
  flex-direction: row;
`

const StyledInput = styled.input`
  margin-right: 0.5rem;
`
type CheckBoxFilterProps = {
  options: string[]
  callback: (param: string[]) => void
}

const CheckBoxFilter = ({ options, callback }: CheckBoxFilterProps) => {
  const [showFilter, setShowFilter] = useState(false)
  const [checkedAll, setCheckedAll] = useState(true)
  const [checked, setChecked] = useState(options.map(() => true))
  const checkAllRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const numChecked = checked.filter(e => e === true).length

    if (checkAllRef && checkAllRef.current) {
      checkAllRef.current.indeterminate =
        numChecked > 0 && numChecked < options.length
    }

    setCheckedAll(numChecked === options.length)

    callback(
      options.reduce((acc: string[], cur: string, ind: number) => {
        if (checked[ind] === true) acc.push(cur)
        return acc
      }, [])
    )
  }, [checked])

  const selectAll = (): void => {
    if (checkedAll) {
      setChecked(options.map(() => false))
    } else {
      setChecked(options.map(() => true))
    }

    setCheckedAll(!checkedAll)
  }

  const selectOne = (index: number): void => {
    const updated = checked.map((state, ind) => (ind == index ? !state : state))
    setChecked(updated)
  }

  return (
    <TooltipWrapper>
      <div onClick={() => setShowFilter(!showFilter)}>
        <FilterIcon />
      </div>
      {showFilter && (
        <Tooltip>
          <StyledOption key={'all'}>
            <StyledInput
              type="checkbox"
              checked={checkedAll}
              onChange={selectAll}
              ref={checkAllRef}
            />
            All
          </StyledOption>
          {options.map((option, index) => (
            <StyledOption style={{ marginLeft: '10px' }} key={option}>
              <StyledInput
                type="checkbox"
                checked={checked[index]}
                onChange={() => selectOne(index)}
              />
              {option}
            </StyledOption>
          ))}
        </Tooltip>
      )}
    </TooltipWrapper>
  )
}

export default CheckBoxFilter
