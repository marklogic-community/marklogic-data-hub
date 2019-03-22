import { Matching } from '../edit-flow/mastering/matching/matching.model';

export class Config {
  public input_file_path: string;
  public input_file_type: string;
  public output_collections: string = '';
  public output_permissions: string = '';
  public transform_module: string = '';
  public transform_namespace: string;
  public transform_param: string;

  public properties: {};
  public sourceCollection: string;
  public sourceQuery: string = '';
  public sourceUri: string = '';
  public targetEntity: string = '';
  public targetEntityType: string;
  public matchOptions: Matching;
  public customModuleUri: string;
}
