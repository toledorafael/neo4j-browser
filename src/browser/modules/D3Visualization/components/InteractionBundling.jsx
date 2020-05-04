import React, { Component } from 'react'
import '../lib/visualization/index'
// import { StyledZoomHolder, StyledSvgWrapper, StyledZoomButton } from './styled'
// import { ZoomInIcon, ZoomOutIcon } from 'browser-components/icons/Icons'

export class VisualAnalysisComponent extends Component {
  state = {
    zoomInLimitReached: true,
    zoomOutLimitReached: false,
    shouldResize: false
  }

  render () {
    return (
    //   <StyledSvgWrapper>
    //     <svg className='neod3viz' ref={this.graphInit.bind(this)} />
    //   </StyledSvgWrapper>
      <img src='https://media.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif' width='300' />
    )
  }
}
