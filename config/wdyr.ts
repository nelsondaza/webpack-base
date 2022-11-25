import React from 'react'

if (process.env.NODE_ENV === 'development') {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require('@welldone-software/why-did-you-render')(React, { logOnDifferentValues: true })
}
