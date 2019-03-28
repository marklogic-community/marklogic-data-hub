import { Router, ActivatedRoute, Params } from '@angular/router';
import { Component, Input, Output, OnInit, EventEmitter, ViewChild } from '@angular/core';
import { Entity } from '../../../../models';
import { EntitiesService } from '../../../../models/entities.service';
import { SearchService } from '../../../search/search.service';
import { MapService } from '../../../mappings/map.service';
import { MappingUiComponent } from './ui/mapping-ui.component';

import * as _ from 'lodash';
import * as moment from 'moment';
import { Mapping } from "../../../mappings/mapping.model";
import { Step } from "../../models/step.model";

@Component({
  selector: 'app-mapping',
  template: `
    <app-mapping-ui
      [mapping]="this.mapping"
      [chosenEntity]="this.chosenEntity"
      [conns]="this.conns"
      [sampleDocSrcProps]="this.sampleDocSrcProps"
      [editURIVal]="this.editURIVal"
      (updateDesc)="this.updateDesc($event)"
      (updateURI)="this.updateURI($event)"
      (updateMap)="this.updateMap($event)"
      (resetMap)="this.resetMap()"
    ></app-mapping-ui>
  `
})
export class MappingComponent implements OnInit {
  @ViewChild(MappingUiComponent) private mappingUI: MappingUiComponent;

  @Input() step: Step;
  @Output() saveStep = new EventEmitter();

  // Entity Model
  public chosenEntity: Entity;
  private entityPrimaryKey: string = '';

  // Source Document
  private currentDatabase: string = 'STAGING';
  private entitiesOnly: boolean = false;
  private searchText: string = null;
  private activeFacets: any = {};
  private currentPage: number = 1;
  private pageLength: number = 1;
  public sampleDocURI: string = null;
  private sampleDocSrc: any = null;
  public sampleDocSrcProps: Array<any> = [];

  // Connections
  public conns: object = {};
  public connsOrig: object = {};
  private mapPrefix: string = 'dhf-map-';

  private entityName: string;
  public mapName: string;
  public flowName: string;

  public mapping: any = new Mapping();

  public editURIVal: string;

  /**
   * Load chosen entity to use as harmonized model.
   */
  loadEntity(): void {
    let self = this;
    this.entitiesService.entitiesChange.subscribe(entities => {
      this.chosenEntity = _.find(entities, (e: Entity) => {
        return e.name === this.entityName;
      });
      this.entityPrimaryKey = this.chosenEntity.definition.primaryKey;
      console.log('entity in mapping');
      console.log(this.chosenEntity);
    });
    this.entitiesService.getEntities();
  }

  updateURI(event) {
    this.conns = event.conns;
    this.loadSampleDocByURI(event.uri, event.uriOrig, event.connsOrig, event.save);
  }

  /**
   * Search for a sample document by entity name and load that document by its URI.
   * @param entityName An entity name
   */
  loadSampleDoc(entityName): void {
    this.activeFacets = {
      Collection: {
        values: [entityName]
      }
    };
    this.searchService.getResults(
      this.currentDatabase,
      this.entitiesOnly,
      this.searchText,
      this.activeFacets,
      this.currentPage,
      this.pageLength
    ).subscribe(response => {
      this.sampleDocURI = response.results[0].uri;
      this.editURIVal = this.sampleDocURI;
      this.loadSampleDocByURI(this.sampleDocURI, '', {}, true)
    },
      () => {},
      () => {}
    );
  }

  /**
   * Load a sample document by its URI.
   * @param uri A document URI
   * @param uriOrig Original URI in case none is found
   * @param connsOrig A connections object in case rollback is required
   * @param save {boolean} Save map after successful load.
   */
  loadSampleDocByURI(uri: string, uriOrig: string, connsOrig: Object, save: boolean): void {
    let self = this;
    this.editURIVal = uri;
    this.searchService.getDoc(this.currentDatabase, uri).subscribe(doc => {
      this.sampleDocSrcProps = [];
      this.sampleDocSrc = doc;
      _.forEach(this.sampleDocSrc['envelope']['instance'], function(val, key) {
        let prop = {
          key: key,
          val: String(val),
          type: self.getType(val)
        };
        self.sampleDocSrcProps.push(prop);
      });
      this.sampleDocURI = uri;
      if (save) {
        this.saveMap();
        console.log('map saved');
      }
    },
      (err) => {
        this.conns = connsOrig;
        self.mappingUI.uriNotFound(uri);
        }
      );
  }

  /**
   * Update the sample document based on a URI.
   */
  /*
  updateSampleDoc() {
    if (this.sampleDocURI === this.editURIVal) {
      this.editingURI = false;
    } else if (Object.keys(this.conns).length > 0) {
      let result = this.dialogService.confirm(
          'Changing your source document will remove<br/>existing property selections. Proceed?',
          'Cancel', 'OK');
      result.subscribe( () => {
          let connsOrig = _.cloneDeep(this.conns);
          this.conns = {};
          // provide connsOrig for rollback purposes if needed
          this.loadSampleDocByURI(this.editURIVal, connsOrig, true);
        },(err: any) => {
          console.log('source change aborted');
          this.editingURI = false;
        },
        () => {}
      );
    } else {
     this.loadSampleDocByURI(this.editURIVal, {}, true);
    }
  }
 */
  /**
   * Update the mapping description by saving the mapping.
   */
  updateDesc(mapping) {
    this.mapping = mapping;
    this.saveMap();
  }

  /**
   * Update the mapping based on new connections submitted.
   */
  updateMap(conns) {
    this.conns = conns;
    this.saveMap();
  }

  constructor(
    private searchService: SearchService,
    private mapService: MapService,
    private entitiesService: EntitiesService,
    //private router: Router,
    //private activatedRoute: ActivatedRoute
  ) {}

  /**
   * Initialize the UI.
   */
  ngOnInit() {
    let self = this;
    if (this.step) {
      this.entityName = this.step.options['targetEntity'];
      this.mapping = this.step.options;
      this.loadEntity();
      this.loadMap();
    }
  }

  /**
   * Save the mapping artifact and then show a confirmation popup
   * and navigate to the view for that mapping.
   */
  saveMap(): void {
    let formattedConns = {};
    _.forEach(this.conns, function(srcPropName, entityPropName) {
      if (srcPropName)
        formattedConns[entityPropName] = { "sourcedFrom" : srcPropName };
    });
    this.step.options['properties'] = formattedConns;
    this.saveStep.emit(this.step);
  }

  /**
   * Handle reset button event
   */
  resetMap(): void {
    this.loadMap();
  }

  /**
   * Retrieve the mapping artifact and then get the sample document
   * and build the connection object.
   */
  loadMap() {
    let self = this;

    // TODO currently mock data doesn't refer to existing
    // docs so ignore and load based on entity
    // this.sampleDocURI = map.sourceURI;
    // this.editURIVal = this.sampleDocURI;

    // if source URI unset in mapping, load sample source doc based on entity
    // if (this.mapping && !this.mapping.sourceURI) {
      this.loadSampleDoc(this.entityName)
    // }
    // else load source doc based on source URI in mapping
    // else {
    //   this.loadSampleDocByURI(this.sampleDocURI, '', {}, false);
    // }

    self.conns = {};
    _.forEach(this.mapping.properties, function(srcObj, entityPropName) {
      self.conns[entityPropName] = srcObj.sourcedFrom;
    });
    self.connsOrig = _.clone(self.conns);

  }

  /**
   * Interpret the datatype of a property value
   * Recognize all JSON types: array, object, number, boolean, null
   * Also do a basic interpretation of dates (ISO 8601, RFC 2822)
   * @param value Property value
   * @returns {string} datatype ("array"|"object"|"number"|"date"|"boolean"|"null")
   */
  getType(value: any): string {
    let result = '';
    let RFC_2822 = 'ddd, DD MMM YYYY HH:mm:ss ZZ';
    if (_.isArray(value)) {
      result = 'array';
    } else if (_.isObject(value)) {
      result = 'object';
    }
    // Quoted numbers (example: "123") are not recognized as numbers
    else if (_.isNumber(value)) {
      result = 'number';
    }
    // Do not recognize ordinal dates (example: "1981095")
    else if (moment(value, [moment.ISO_8601, RFC_2822], true).isValid() && !/^\d+$/.test(value)) {
      result = 'date';
    } else if (_.isBoolean(value)) {
      result = 'boolean';
    } else if (_.isNull(value)) {
      result = 'null';
    } else {
      result = 'string';
    }
    return result;
  }

}
