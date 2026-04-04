declare module "topojson-client" {
  export function feature(topology: any, object: any): any;
  export function mesh(topology: any, object: any, filter?: any): any;
  export function merge(world: any, objects: any): any;
}
