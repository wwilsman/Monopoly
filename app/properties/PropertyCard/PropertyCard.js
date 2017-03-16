import React from 'react'
import slug from 'slug'

import Property from './PropertyCardDefault'
import RailRoad from './PropertyCardRailRoad'
import Utility from './PropertyCardUtility'

const slugify = (str) => slug(str, { lower: true })

const PropertyCard = ({ property, theme, ...props }) => (
  (property.group === 'railroad' ? (
    <RailRoad {...property} {...props}
        iconPath={`/themes/${theme}/icons.svg#railroad`}/>
  ) : property.group === 'utility' ? (
    <Utility {...property} {...props}
        iconPath={`/themes/${theme}/icons.svg#${slugify(property.name)}`}/>
  ) : (
    <Property {...property} {...props}/>
  ))
)

export default PropertyCard