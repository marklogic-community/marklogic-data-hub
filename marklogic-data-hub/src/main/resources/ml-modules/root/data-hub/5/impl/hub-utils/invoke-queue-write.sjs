/**
 Copyright (c) 2021 MarkLogic Corporation

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

var contentArray;
var baseCollections;

const consts = require("/data-hub/5/impl/consts.sjs");
const hubUtils = require("/data-hub/5/impl/hub-utils.sjs");
const temporal = require("/MarkLogic/temporal.xqy");
const temporalLib = require("/data-hub/5/temporal/hub-temporal.sjs");

const traceEvent = consts.TRACE_FLOW_RUNNER_DEBUG;
const traceEnabled = xdmp.traceEnabled(traceEvent);
const dbName = traceEnabled ? xdmp.databaseName(xdmp.database()) : null;

const temporalCollections = temporalLib.getTemporalCollections().toArray().reduce((acc, col) => {
    acc[col] = true;
    return acc;
}, {});

for (let content of contentArray) {
    let context = (content.context||{});

    const permissions = context.permissions || xdmp.defaultPermissions();

    let existingCollections = xdmp.documentGetCollections(content.uri);
    let collections = fn.distinctValues(Sequence.from(baseCollections.concat((context.collections||[])))).toArray();
    let metadata = context.metadata;
    let temporalCollection = collections.concat(existingCollections).find((col) => temporalCollections[col]);
    let isDeleteOp = !!content['$delete'];
    if (isDeleteOp) {
        if (fn.docAvailable(content.uri)) {
            if (temporalCollection) {
                temporal.documentDelete(temporalCollection, content.uri);
            } else {
                xdmp.documentDelete(content.uri);
            }
        }
    } else {
        if (temporalCollection) {
            // temporalDocURI is managed by the temporal package and must not be carried forward.
            if (metadata) {
                delete metadata.temporalDocURI;
            }
            const collectionsReservedForTemporal = ['latest', content.uri];
            if (traceEnabled) {
                hubUtils.hubTrace(traceEvent, `Inserting temporal document ${content.uri} into database ${dbName}`);
            }
            temporal.documentInsert(temporalCollection, content.uri, content.value,
                {
                    permissions,
                    collections: collections.filter((col) => !(temporalCollections[col] || collectionsReservedForTemporal.includes(col))),
                    metadata
                }
            );
        } else {
            if (traceEnabled) {
                hubUtils.hubTrace(traceEvent, `Inserting document ${content.uri} into database ${dbName}`);
            }
            xdmp.documentInsert(content.uri, content.value, {permissions, collections, metadata});
        }
    }
}
let writeInfo = {
    transaction: xdmp.transaction(),
    dateTime: fn.currentDateTime()
};
writeInfo;
