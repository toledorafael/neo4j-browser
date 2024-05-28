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
 */

import React, { useState, Dispatch, useEffect, useRef } from 'react'
import { log } from '../Logging/Log'
import { Action } from 'redux'
import SVGInline from 'react-svg-inline'
import { connect } from 'react-redux'
import { withBus } from 'react-suber'
import { useMutation } from '@apollo/client'
import {
  commandSources,
  executeCommand
} from 'shared/modules/commands/commandsDuck'
import {
  REMOVE_FAVORITE,
  updateFavoriteContent
} from 'shared/modules/favorites/favoritesDuck'
import { Bus } from 'suber'
import {
  isMac,
  printShortcut,
  FULLSCREEN_SHORTCUT
} from 'browser/modules/App/keyboardShortcuts'
import { getProjectId } from 'shared/modules/app/appDuck'
import {
  EDIT_CONTENT,
  EXPAND,
  FOCUS,
  SET_CONTENT
} from 'shared/modules/editor/editorDuck'
import {
  MainEditorWrapper,
  Header,
  EditorContainer,
  FlexContainer,
  FlexContainerInvisible,
  ScriptTitle,
  SearchBarContainer,
  QueryStyleToggleWrapper
} from './styled'
import { EditorButton, FrameButton } from 'browser-components/buttons'
import {
  ExpandIcon,
  ContractIcon,
  CloseIcon,
  DownloadIcon
} from 'browser-components/icons/Icons'
import updateFileIcon from 'icons/update-file.svg'
import updateFavoriteIcon from 'icons/update-favorite.svg'
import fileIcon from 'icons/file.svg'
import runIcon from 'icons/run-icon.svg'
import downloadIcon from 'icons/download-bottom.svg'
import {
  ADD_PROJECT_FILE,
  REMOVE_PROJECT_FILE
} from 'browser-components/ProjectFiles/projectFilesConstants'
import { getProjectFileDefaultFileName } from 'browser-components/ProjectFiles/projectFilesUtils'
import Monaco, { MonacoHandles } from './Monaco'
import { GlobalState } from 'shared/globalState'
import {
  codeFontLigatures,
  shouldEnableMultiStatementMode
} from 'shared/modules/settings/settingsDuck'
import { getUseDb } from 'shared/modules/connections/connectionsDuck'
import { getHistory } from 'shared/modules/history/historyDuck'
import { defaultNameFromDisplayContent } from 'browser-components/SavedScripts'
import { getParams } from 'shared/modules/params/paramsDuck'
import SearchBar from './SearchBar'
// import QuestionDisplay from './QuestionDisplay'
import Switch from 'react-switch'
import { Visibility } from 'semantic-ui-react'

type EditorFrameProps = {
  bus: Bus
  codeFontLigatures: boolean
  enableMultiStatementMode: boolean
  executeCommand: (cmd: string, source: string) => void
  history: string[]
  projectId: string
  updateFavorite: (id: string, value: string) => void
  useDb: null | string
  params: Record<string, unknown>
}

type SavedScript = {
  content: string
  directory?: string
  id: string
  isProjectFile: boolean
  isStatic: boolean
  name?: string
}

export function MainEditor({
  bus,
  codeFontLigatures,
  enableMultiStatementMode,
  executeCommand,
  history,
  projectId,
  updateFavorite,
  useDb,
  params
}: EditorFrameProps): JSX.Element {
  const [addFile] = useMutation(ADD_PROJECT_FILE)
  const [unsaved, setUnsaved] = useState(false)
  const [isFullscreen, setFullscreen] = useState(false)
  const [currentlyEditing, setCurrentlyEditing] = useState<SavedScript | null>(
    null
  )
  const [queryArr, setQueryArr] = useState([''])
  const [queryParams, setQueryParams] = useState([''])
  const [questionArr, setQuestionArr] = useState([''])
  const [textBoxVisibility, setTextboxVisibility] = useState([false, false])
  const [cypherBarVisibility, setcypherBarVisibility] = useState(false)
  const editorRef = useRef<MonacoHandles>(null)

  const toggleFullscreen = () => {
    setFullscreen(fs => !fs)
  }

  useEffect(() => {
    editorRef.current?.resize(isFullscreen)
  }, [isFullscreen])

  useEffect(() => bus && bus.take(EXPAND, toggleFullscreen), [bus])
  useEffect(
    () =>
      bus &&
      bus.take(REMOVE_FAVORITE, ({ id }) => {
        if (id === currentlyEditing?.id) {
          setCurrentlyEditing(null)
          editorRef.current?.setValue('')
        }
      }),
    [bus, currentlyEditing]
  )
  useEffect(
    () =>
      bus &&
      bus.take(REMOVE_PROJECT_FILE, ({ name }) => {
        if (name === currentlyEditing?.name) {
          setCurrentlyEditing(null)
          editorRef.current?.setValue('')
        }
      }),
    [bus, currentlyEditing]
  )

  useEffect(
    () =>
      bus &&
      bus.take(
        EDIT_CONTENT,
        ({ message, id, isProjectFile, name, directory, isStatic }) => {
          setUnsaved(false)
          setCurrentlyEditing({
            content: message,
            id,
            isProjectFile,
            name,
            directory,
            isStatic
          })
          editorRef.current?.setValue(message)
        }
      ),
    [bus]
  )

  useEffect(() => {
    bus.take(FOCUS, () => {
      editorRef.current?.focus()
    })
  }, [bus])

  useEffect(
    () =>
      bus &&
      bus.take(SET_CONTENT, ({ message }) => {
        setUnsaved(false)
        setCurrentlyEditing(null)
        editorRef.current?.setValue(message)
      }),
    [bus]
  )

  function discardEditor() {
    editorRef.current?.setValue('')
    setCurrentlyEditing(null)
    setFullscreen(false)
  }

  function downloadLog() {
    const headers = ['participantID', 'start-tutorial', 'history']
    const filterJSON = JSON.stringify(localStorage, headers, ' ')

    const blob = new Blob([filterJSON], {
      type: 'text/json'
    })
    // Create an anchor element and dispatch a click event on it
    // to trigger a download
    const a = document.createElement('a')
    a.download = 'log.json'
    a.href = window.URL.createObjectURL(blob)
    const clickEvt = new MouseEvent('click', {
      view: window,
      bubbles: true,
      cancelable: true
    })
    a.dispatchEvent(clickEvt)
    a.remove()
  }

  const buttons = [
    // {
    //   onClick: toggleFullscreen,
    //   title: `${
    //     isFullscreen ? 'Close fullscreen ' : 'Fullscreen'
    //   } (${printShortcut(FULLSCREEN_SHORTCUT)})`,
    //   icon: isFullscreen ? <ContractIcon /> : <ExpandIcon />,
    //   testId: 'fullscreen'
    // },
    // {
    //   onClick: discardEditor,
    //   title: 'Close',
    //   icon: <CloseIcon />,
    //   testId: 'discard'
    // },
    {
      onClick: downloadLog,
      title: 'Download',
      icon: <DownloadIcon />,
      testId: 'download'
    }
  ]

  function createRunCommandFunction(source: string) {
    return () => {
      log('run query: ' + editorRef.current?.getValue())
      executeCommand(editorRef.current?.getValue() || '', source)
      editorRef.current?.setValue('')
      setCurrentlyEditing(null)
      setFullscreen(false)
    }
  }

  function changeQueryInterface() {
    if (cypherBarVisibility == false) {
      setcypherBarVisibility(true)
    } else {
      setcypherBarVisibility(false)
    }
  }

  function getName({ name, content, isProjectFile }: SavedScript) {
    if (name) {
      return name
    }
    if (isProjectFile) {
      return getProjectFileDefaultFileName(content)
    }

    return defaultNameFromDisplayContent(content)
  }

  function updateEditor(queryItem?: any) {
    let finalQuery = ''
    let currQueryArr = []
    if (queryItem) {
      setQueryArr(queryItem.query)
      setQuestionArr(queryItem.questionText)

      if (queryItem.questionText.length == 1)
        setTextboxVisibility([false, false])
      if (queryItem.questionText.length == 2)
        setTextboxVisibility([true, false])
      if (queryItem.questionText.length == 3) setTextboxVisibility([true, true])

      currQueryArr = queryItem.query
    } else {
      currQueryArr = queryArr
    }
    for (const index in currQueryArr) {
      finalQuery += currQueryArr[index]
      if (
        queryParams[0] != '' &&
        currQueryArr.length > 1 &&
        queryParams.length > parseInt(index) &&
        parseInt(index) + 1 != currQueryArr.length
      ) {
        finalQuery += queryParams[parseInt(index)]
      }
    }
    editorRef.current?.setValue(finalQuery)
  }

  function handleParamInput(event: any, index: number) {
    const params = queryParams
    params[index] = event.target.value
    setQueryParams(params)
    updateEditor()
  }

  const showUnsaved = !!(
    unsaved &&
    currentlyEditing &&
    !currentlyEditing?.isStatic
  )

  return (
    <MainEditorWrapper fullscreen={isFullscreen} data-testid="activeEditor">
      {currentlyEditing && (
        <ScriptTitle data-testid="currentlyEditing" unsaved={showUnsaved}>
          <SVGInline
            svg={currentlyEditing.isProjectFile ? fileIcon : updateFavoriteIcon}
            width="12px"
          />
          {currentlyEditing.isProjectFile ? ' Project file: ' : ' Favorite: '}
          {getName(currentlyEditing)}
          {showUnsaved ? '*' : ''}
          {currentlyEditing.isStatic ? ' (read-only)' : ''}
        </ScriptTitle>
      )}
      <QueryStyleToggleWrapper>
        <span style={{ marginRight: '6px' }}>Question</span>
        <Switch
          onChange={() => changeQueryInterface()}
          checked={cypherBarVisibility == true}
          className="react-switch"
          handleDiameter={16}
          height={24}
          width={48}
          onColor="#8ecae6"
          offColor="#181a1d"
          checkedIcon={true}
          uncheckedIcon={
            false
            // <svg
            //   height="100%"
            //   width="100%"
            //   viewBox="0 0 24 48"
            //   id="b"
            //   xmlns="http://www.w3.org/2000/svg"
            //   fill="#ffffff"
            //   stroke="#ffffff"
            //   strokeWidth=""
            //   style={{
            //     display: 'flex',
            //     flexDirection: 'row',
            //     alignItems: 'center'
            //   }}
            // >
            //   <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
            //   <g
            //     id="SVGRepo_tracerCarrier"
            //     strokeLinecap="round"
            //     strokeLinejoin="round"
            //   ></g>
            //   <g id="SVGRepo_iconCarrier">
            //     <defs>
            //       {/* <style>
            //         {
            //           'fill:none;stroke:#ffffff;stroke-linecap:round;stroke-linejoin:round;'
            //         }
            //       </style> */}
            //     </defs>
            //     <path d="m8 8-4 4 4 4m8 0 4-4-4-4m-2-3-4 14"></path>
            //   </g>
            // </svg>
            //   <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
            //   <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m8 8-4 4 4 4m8 0 4-4-4-4m-2-3-4 14"/>
            // </svg>
            //   <svg class="w-[14px] h-[14px] text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
            //   <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="0.6" d="m8 8-4 4 4 4m8 0 4-4-4-4m-2-3-4 14"/>
            // </svg>
          }
        />
        <span style={{ marginLeft: '6px' }}>Cypher</span>
      </QueryStyleToggleWrapper>
      {cypherBarVisibility ? (
        <FlexContainer>
          <Header>
            <EditorContainer>
              <Monaco
                bus={bus}
                enableMultiStatementMode={enableMultiStatementMode}
                history={history}
                fullscreen={isFullscreen}
                toggleFullscreen={toggleFullscreen}
                id={'main-editor'}
                fontLigatures={codeFontLigatures}
                onChange={() => {
                  setUnsaved(true)
                }}
                onDisplayHelpKeys={() =>
                  executeCommand(':help keys', commandSources.editor)
                }
                onExecute={createRunCommandFunction(commandSources.editor)}
                ref={editorRef}
                useDb={useDb}
                params={params}
              />
            </EditorContainer>
            {currentlyEditing && !currentlyEditing.isStatic && (
              <EditorButton
                data-testid="editor-Favorite"
                onClick={() => {
                  setUnsaved(false)
                  const editorValue = editorRef.current?.getValue() || ''

                  const { isProjectFile, name } = currentlyEditing
                  if (isProjectFile && name) {
                    addFile({
                      variables: {
                        projectId,
                        fileUpload: new File([editorValue], name),
                        overwrite: true
                      }
                    })
                  } else {
                    updateFavorite(currentlyEditing.id, editorValue)
                  }
                  setCurrentlyEditing({
                    ...currentlyEditing,
                    content: editorValue
                  })
                }}
                key={'editor-Favorite'}
                title={`Update ${
                  currentlyEditing.isProjectFile ? 'project file' : 'favorite'
                }`}
                icon={
                  currentlyEditing.isProjectFile
                    ? updateFileIcon
                    : updateFavoriteIcon
                }
                width={16}
              />
            )}
            <EditorButton
              data-testid="editor-Run"
              onClick={createRunCommandFunction(commandSources.playButton)}
              title={isMac ? 'Run (⌘↩)' : 'Run (ctrl+enter)'}
              icon={runIcon}
              key="editor-Run"
              width={16}
            />
          </Header>
          {buttons.map(({ onClick, icon, title, testId }) => (
            <FrameButton
              key={`frame-${title}`}
              title={title}
              onClick={onClick}
              dataTestId={`editor-${testId}`}
            >
              {icon}
            </FrameButton>
          ))}
        </FlexContainer>
      ) : (
        <div>
          <SearchBar onSearchSelected={updateEditor}></SearchBar>

          <FlexContainerInvisible>
            <Header>
              <EditorContainer>
                <Monaco
                  bus={bus}
                  enableMultiStatementMode={enableMultiStatementMode}
                  history={history}
                  fullscreen={isFullscreen}
                  toggleFullscreen={toggleFullscreen}
                  id={'main-editor'}
                  fontLigatures={codeFontLigatures}
                  onChange={() => {
                    setUnsaved(true)
                  }}
                  onDisplayHelpKeys={() =>
                    executeCommand(':help keys', commandSources.editor)
                  }
                  onExecute={createRunCommandFunction(commandSources.editor)}
                  ref={editorRef}
                  useDb={useDb}
                  params={params}
                />
              </EditorContainer>
              {currentlyEditing && !currentlyEditing.isStatic && (
                <EditorButton
                  data-testid="editor-Favorite"
                  onClick={() => {
                    setUnsaved(false)
                    const editorValue = editorRef.current?.getValue() || ''

                    const { isProjectFile, name } = currentlyEditing
                    if (isProjectFile && name) {
                      addFile({
                        variables: {
                          projectId,
                          fileUpload: new File([editorValue], name),
                          overwrite: true
                        }
                      })
                    } else {
                      updateFavorite(currentlyEditing.id, editorValue)
                    }
                    setCurrentlyEditing({
                      ...currentlyEditing,
                      content: editorValue
                    })
                  }}
                  key={'editor-Favorite'}
                  title={`Update ${
                    currentlyEditing.isProjectFile ? 'project file' : 'favorite'
                  }`}
                  icon={
                    currentlyEditing.isProjectFile
                      ? updateFileIcon
                      : updateFavoriteIcon
                  }
                  width={16}
                />
              )}
              {/* <EditorButton
                data-testid="editor-Run"
                onClick={createRunCommandFunction(commandSources.playButton)}
                title={isMac ? 'Run (⌘↩)' : 'Run (ctrl+enter)'}
                icon={runIcon}
                key="editor-Run"
                width={16}
              /> */}
            </Header>
            {buttons.map(({ onClick, icon, title, testId }) => (
              <FrameButton
                key={`frame-${title}`}
                title={title}
                onClick={onClick}
                dataTestId={`editor-${testId}`}
              >
                {icon}
              </FrameButton>
            ))}
          </FlexContainerInvisible>
          <div style={{ margin: '0.5em' }}>
            {questionArr[0]}
            {textBoxVisibility[0] && (
              <input
                style={{ width: '150px' }}
                onChange={event => handleParamInput(event, 0)}
              />
            )}
            {questionArr[1]}
            {textBoxVisibility[1] && (
              <input
                style={{ width: '150px' }}
                onChange={event => handleParamInput(event, 1)}
              />
            )}
            {questionArr[2]}
            {queryArr[0] != '' && (
              <EditorButton
                data-testid="editor-Run"
                onClick={createRunCommandFunction(commandSources.playButton)}
                title={isMac ? 'Run (⌘↩)' : 'Run (ctrl+enter)'}
                icon={runIcon}
                key="editor-Run"
                width={16}
              />
            )}
          </div>
        </div>
      )}
    </MainEditorWrapper>
  )
}

const mapStateToProps = (state: GlobalState) => {
  return {
    codeFontLigatures: codeFontLigatures(state),
    enableMultiStatementMode: shouldEnableMultiStatementMode(state),
    history: getHistory(state),
    projectId: getProjectId(state),
    useDb: getUseDb(state),
    params: getParams(state)
  }
}

const mapDispatchToProps = (dispatch: Dispatch<Action>) => {
  return {
    updateFavorite: (id: string, cmd: string) => {
      dispatch(updateFavoriteContent(id, cmd))
    },
    executeCommand: (cmd: string, source: string) => {
      dispatch(executeCommand(cmd, { source }))
    }
  }
}

export default withBus(connect(mapStateToProps, mapDispatchToProps)(MainEditor))
