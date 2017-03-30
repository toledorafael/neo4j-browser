import { connect } from 'preact-redux'
import { withBus } from 'preact-suber'
import { SET_CONTENT, setContent } from 'shared/modules/editor/editorDuck'
import { addClass } from 'shared/services/dom-helpers'

const directives = [{
  selector: '[play-topic]',
  valueExtractor: (elem) => {
    return `:play ${elem.getAttribute('play-topic')}`
  }
}, {
  selector: '[help-topic]',
  valueExtractor: (elem) => {
    return `:help ${elem.getAttribute('help-topic')}`
  }
}, {
  selector: '.runnable',
  valueExtractor: (elem) => {
    return elem.textContent
  }
}]

export const Directives = (props) => {
  const callback = (elem) => {
    if (elem) {
      directives.forEach((directive) => {
        const elems = elem.querySelectorAll(directive.selector)
        Array.from(elems).forEach((e) => {
          e.onclick = () => {
            addClass(e, 'clicked')
            return props.onItemClick(directive.valueExtractor(e))
          }
        })
      })
    }
  }
  return (
    <div ref={callback}>
      {props.content}
    </div>
  )
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onItemClick: (cmd) => {
      if (!cmd.endsWith(' null')) {
        ownProps.bus.send(SET_CONTENT, setContent(cmd))
      }
    }
  }
}

export default withBus(connect(null, mapDispatchToProps)(Directives))