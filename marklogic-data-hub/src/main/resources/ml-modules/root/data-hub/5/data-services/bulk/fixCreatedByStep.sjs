/*
  Copyright (c) 2020 MarkLogic Corporation

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*/
'use strict';

declareUpdate();

// No privilege required: Use of this is restricted to users who have update permissions on entity instances
// matching the query performed by this endpoint

const config = require("/com.marklogic.hub/config.sjs");

var endpointState;
if (!endpointState) {
  endpointState = {};
} else {
  endpointState = fn.head(xdmp.fromJSON(endpointState));
}

var workUnit = fn.head(xdmp.fromJSON(workUnit));

const batchSize = workUnit.batchSize ? workUnit.batchSize : 50;

const fixedCollection = "datahubCreatedByStep-fixed"

const stepDefinitionNames = fn.collection('http://marklogic.com/data-hub/step-definition')
  .toArray().map(stepDef => stepDef.toObject().name);

const documentQueries = [
  cts.fieldRangeQuery("datahubCreatedByStep", "=", stepDefinitionNames),
  cts.notQuery(cts.collectionQuery(fixedCollection))
];

if (endpointState.lastProcessedUri) {
  documentQueries.push(cts.rangeQuery(cts.uriReference(), ">", endpointState.lastProcessedUri));
}

const uris = cts.uris(null, ['limit=' + batchSize], cts.andQuery(documentQueries)).toArray();

if (uris.length == 0) {
  null;
} else {
  uris.forEach(uri => {
    const metadata = xdmp.documentGetMetadata(uri);

    const stepDef = fn.head(cts.search(cts.andQuery([
      cts.collectionQuery("http://marklogic.com/data-hub/step-definition"),
      cts.jsonPropertyValueQuery("name", metadata.datahubCreatedByStep)
    ])));

    // Rare, but the stepDef may no longer exist, e.g. if it was a custom one
    if (stepDef) {
      const stepDefType = stepDef.toObject().type;

      // Every stepDef should have a type, but in case it doesn't, we can't do anything further
      if (stepDefType) {
        const subject = metadata.datahubCreatedByJob + metadata.datahubCreatedInFlow + stepDefType.toLowerCase() + uri;

        // Odd - xdmp.eval works, but xdmp.invokeFunction returns no results
        const script = "var subject, predicate; cts.triples(subject, predicate, null)";
        const influencedByTriple = fn.head(xdmp.eval(script,
          {subject: sem.iri(subject), predicate: sem.iri("http://www.w3.org/ns/prov#wasInfluencedBy")},
          {database: xdmp.database(config.JOBDATABASE)}
        ));

        // It is not unusual for the triple to not exist, e.g provenance may have been disabled
        if (influencedByTriple) {
          const stepName = sem.tripleObject(influencedByTriple);
          if (stepName) {
            xdmp.documentPutMetadata(uri, {datahubCreatedByStep: stepName});
            xdmp.documentAddCollections(uri, fixedCollection);
          }
        }
      }
    }
  });


  endpointState.lastProcessedUri = uris[uris.length - 1];
  Sequence.from([endpointState, workUnit]);
}
