import classNames from 'classnames'
import PropTypes from 'prop-types'
import { PureComponent } from 'react'

import './Block.scss'

class Block extends PureComponent {
  render() {
    const { children, className, style } = this.props

    return (
      <div className={classNames('Block', className)} style={style}>
        {children}
      </div>
    )
  }
}

Block.propTypes = {
  children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]),
  className: PropTypes.string,
  style: PropTypes.object,
}

Block.defaultProps = {
  children: null,
  className: null,
  style: {},
}

export default Block
