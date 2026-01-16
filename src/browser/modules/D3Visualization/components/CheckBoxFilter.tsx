import React, { useEffect, useRef, useState } from 'react'
import { FilterIcon, MenuIcon } from 'browser-components/icons/Icons'
import styled from 'styled-components'

const TooltipWrapper = styled.div`
  margin-left: 1rem;
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

const StyledButton = styled.button`
  background-color: #f5f5f5;
  color: black;
  font-size: 0.875rem;
  padding: 0.5rem 1rem;
  min-width: max-content;
  border-radius: 5px;
  margin: 0.5rem 0rem;
  border: 2px solid #666;
`

type CheckBoxFilterProps = {
  options: string[]
  callback: (param: string[]) => void
  type: string
  hiddenRelationshipTypes: string[]
  setRelTypeVisibility: (type: string, value: boolean) => void
}

const CheckBoxFilter = ({
  options,
  callback,
  type,
  hiddenRelationshipTypes,
  setRelTypeVisibility
}: CheckBoxFilterProps) => {
  const [showFilter, setShowFilter] = useState(false)
  const [checkedAll, setCheckedAll] = useState(true)
  const [checked, setChecked] = useState(options.map(() => true))
  const [filterApplied, setFilterApplied] = useState(false)
  const checkAllRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (hiddenRelationshipTypes !== undefined) {
      setChecked(
        options.map(option => !hiddenRelationshipTypes.includes(option))
      )
    }
  }, [hiddenRelationshipTypes])

  useEffect(() => {
    const numChecked = checked.filter(e => e === true).length

    if (checkAllRef && checkAllRef.current) {
      checkAllRef.current.indeterminate =
        numChecked > 0 && numChecked < options.length
    }

    setCheckedAll(numChecked === options.length)
    setFilterApplied(false)
  }, [checked])

  useEffect(() => {
    if (filterApplied) {
      callback(
        options.reduce((acc: string[], cur: string, ind: number) => {
          if (checked[ind] === true) acc.push(cur)
          return acc
        }, [])
      )

      options.map((option, ind) => {
        setRelTypeVisibility(option, checked[ind])
      })
    }
  }, [filterApplied])

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

  const applyFilter = () => {
    setFilterApplied(true)
  }

  return (
    <TooltipWrapper>
      <div onClick={() => setShowFilter(!showFilter)}>
        {type === 'relationship' ? <FilterIcon /> : <MenuIcon />}
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
          <StyledButton onClick={applyFilter}>
            {type === 'relationship' ? 'Apply Filter' : 'Show Information'}
          </StyledButton>
        </Tooltip>
      )}
    </TooltipWrapper>
  )
}

export default CheckBoxFilter
