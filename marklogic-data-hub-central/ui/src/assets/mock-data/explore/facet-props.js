export const numericRange = {"data": {"min": 11, "max": 110}};

export const stringSearchResponse = ["Adams Cole"];

export const facetProps = {
  name: "sales_region",
  constraint: "sales_region",
  key: "",
  tooltip: "",
  facetType: "xs:string",
  facetCategory: "entity",
  updateSelectedFacets: jest.fn(),
  addFacetValues: jest.fn(),
  referenceType: "element",
  entityTypeId: "",
  propertyPath: "sales_region",
  facetValues: [
    {
      "name": "Customer",
      "count": 50,
      "value": "Customer"
    },
    {
      "name": "ProductGroupLicense",
      "count": 1200,
      "value": "ProductGroupLicense"
    },
    {
      "name": "OrderDetail",
      "count": 15000,
      "value": "OrderDetail"
    },
    {
      "name": "ItemType",
      "count": 300,
      "value": "ItemType"
    },
    {
      "name": "ProductDetail",
      "count": 4095,
      "value": "ProductDetail"
    },
    {
      "name": "OrderType",
      "count": 1034,
      "value": "OrderType"
    },
    {
      "name": "Order",
      "count": 2334,
      "value": "Order"
    },
    {
      "name": "ProductGroup",
      "count": 2346,
      "value": "ProductGroup"
    },
    {
      "name": "Protein",
      "count": 607,
      "value": "Protein"
    },
    {
      "name": "Provider",
      "count": 12584,
      "value": "Provider"
    },
    {
      "name": "TestEntityForMapping",
      "count": 100,
      "value": "TestEntityForMapping"
    },
    {
      "name": "CustomerType",
      "count": 999,
      "value": "CustomerType"
    }
  ],
  database: "final"
};

export const sourceNameFacetProps = {
  name: "SourceName",
  constraint: "sourceName",
  updateSelectedFacets: jest.fn(),
  addFacetValues: jest.fn(),
  facetValues: [
    {
      "name": "loadPersonJSON",
      "count": 14, "value": "loadPersonJSON"
    },
    {
      "name": "ingest-orders",
      "count": 12,
      "value": "ingest-orders"
    },
    {
      "name": "loadCustomersJSON",
      "count": 10, "value": "loadCustomersJSON"
    },
    {
      "name": "loadCustomersXML",
      "count": 5, "value": "loadCustomersXML"
    }
  ],
  tooltip: "The name of the source of the files.",
  facetType: "xs:string", "facetCategory": "hub",
  referenceType: "field", "entityTypeId": " ",
  propertyPath: "datahubSourceName"
};

export const sourceTypeFacetProps = {
  name: "SourceType",
  constraint: "sourceType",
  updateSelectedFacets: jest.fn(),
  addFacetValues: jest.fn(),
  facetValues: [
    {
      "name": "loadPerson",
      "count": 20, "value": "loadPerson"
    },
    {
      "name": "ingestOrders",
      "count": 5,
      "value": "ingestOrders"
    },
    {
      "name": "loadCustomerJSON",
      "count": 7, "value": "loadCustomerJSON"
    }
  ],
  tooltip: "The type of source of the files.",
  facetType: "xs:string",
  facetCategory: "hub",
  referenceType: "field",
  entityTypeId: " ",
  propertyPath: "datahubSourceType"
};