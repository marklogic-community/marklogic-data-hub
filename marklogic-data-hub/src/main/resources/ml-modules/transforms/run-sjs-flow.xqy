xquery version "1.0-ml";
module namespace ml-sjsInputFlow = "http://marklogic.com/rest-api/transform/ml:sjsInputFlow";

import module namespace extut = "http://marklogic.com/rest-api/lib/extensions-util"
at "/MarkLogic/rest-api/lib/extensions-util.xqy";

declare default function namespace "http://www.w3.org/2005/xpath-functions";
declare option xdmp:mapping "false";

declare private variable $extName := "ml:sjsInputFlow";
declare private variable $modPath := "/data-hub/4/transforms/sjsInputFlow.sjs";
declare private variable $caller  := xdmp:function(
  xs:QName("applyOnce"), "/MarkLogic/rest-api/lib/extensions-util.sjs"
);

declare function ml-sjsInputFlow:source-format() as xs:string {
  "javascript"
};

declare function ml-sjsInputFlow:transform(
  $context as map:map, $params as map:map, $input as document-node()
) as document-node() {
  map:get(xdmp:apply($caller,$extName,$modPath,"transform",$context,$params,$input), "result")
};
