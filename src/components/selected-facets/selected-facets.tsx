import React, { useContext } from 'react';
import { Icon } from 'antd';
import { MlButton } from 'marklogic-ui-library';
import { SearchContext } from '../../util/search-context';
import styles from './selected-facets.module.scss';

interface Props {
  selectedFacets: any[];
};

const SelectedFacets: React.FC<Props> = (props) => {
  const { 
    clearAllFacets,
    clearFacet,
    searchOptions,
    clearDateFacet,
    clearRangeFacet
   } = useContext(SearchContext);

   console.log('selectedFacets2',props.selectedFacets)

  return (
    <div id='selected-facets' data-cy='selected-facet-block'
      className={styles.clearContainer}
      style={ Object.entries(searchOptions.searchFacets).length === 0 ? {'visibility': 'hidden'} : {'visibility': 'visible'}}
    >
      { props.selectedFacets.length > 0 && 
        <MlButton
          size="small"
          className={styles.clearAllBtn}
          onClick={()=> clearAllFacets()}
          data-cy='clear-all-button'
        >
          <Icon type='close'/>
          Clear All
        </MlButton>
      }
      { props.selectedFacets.map((item, index) => {
                  {console.log('item',item)}

        if (item.constraint === 'createdOnRange') {
          return (
            <MlButton
              size="small"
              className={styles.dateFacet} 
              key={index}
              onClick={()=> clearDateFacet()}
              data-cy='clear-date-facet'
            >
              <Icon type='close'/>
              {item.facet.join(' ~ ')}
            </MlButton>
          )
        } else if (item.rangeValues) {
          return (
            <Button 
              size="small"
              className={styles.facetButton} 
              key={index}
              onClick={()=> clearRangeFacet(item.constraint)}
              data-cy='clear-range-facet'
            >
              <Icon type='close'/>
              {item.constraint + ': ' + item.rangeValues.lowerBound + ' - ' + item.rangeValues.upperBound}
            </Button>
          )
        }
        return (
          <MlButton
            size="small"
            className={styles.facetButton} 
            key={index}
            onClick={()=> clearFacet(item.constraint, item.facet)}
            data-cy={`clear-${item.facet}`}
          >
            <Icon type='close'/>
            {item.facet}
          </MlButton>
        )
      })}
    </div>
  );
}

export default SelectedFacets;