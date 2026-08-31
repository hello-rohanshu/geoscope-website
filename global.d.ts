declare module 'd3-geo-projection';
declare module "d3-geo-polygon";
declare module "*.json" {
  const value: any;
  export default value;
}
declare module "topojson-client" {
  export function feature(topology: any, object: any): any;
  export function mesh(topology: any, object: any, filter?: any): any;
  export function merge(world: any, objects: any): any;
}