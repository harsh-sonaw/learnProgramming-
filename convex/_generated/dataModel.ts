/* eslint-disable */
/**
 * Generated Convex data model.
 * Run `npm run convex:dev` to regenerate this file for the deployment.
 */
import type {
  DataModelFromSchemaDefinition,
  DocumentByName,
  TableNamesInDataModel,
} from 'convex/server';
import schema from '../schema';

export type DataModel = DataModelFromSchemaDefinition<typeof schema>;
export type TableNames = TableNamesInDataModel<DataModel>;
export type Doc<TableName extends TableNames> = DocumentByName<DataModel, TableName>;
