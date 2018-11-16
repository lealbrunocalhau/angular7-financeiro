import { BaseResourceModel } from "../models/base-resource.model";

import { Injector } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, throwError } from "rxjs";
import { map, catchError } from "rxjs/operators";

export abstract class BaseResourceService<T extends BaseResourceModel> {

  protected http: HttpClient

    constructor(
      protected apiPath: string,
      protected injector: Injector
    ){
      this.http = injector.get(HttpClient)            
    }

    getAll(): Observable<T[]>{
            
        return this.http.get(this.apiPath).pipe(
          catchError(this.handleError),
          map(this.jsonDataToResources)
        )
      }

    getById(id: number): Observable<T>{
        const url = `${this.apiPath}/${id}`;
        return this.http.get(url).pipe(
          catchError(this.handleError),
          map(this.jsonDataToResource)
        )
      }
    
      create(resource: T): Observable<T>{
        return this.http.post(this.apiPath, resource).pipe(
          catchError(this.handleError),
          map(this.jsonDataToResource)
        )
      }
    
      update(resource: T): Observable<T>{
        //montar url q vou montar
        const url = `${this.apiPath}/${resource.id}`;

        return this.http.put(url, resource).pipe(
          catchError(this.handleError),
          map(()=> resource)
        )
      }
    
      delete(id: number): Observable<any> {
        const url = `${this.apiPath}/${id}`;
        return this.http.delete(url).pipe(
          catchError(this.handleError),
          map(()=> null)
        )
      }


        
  //Metodos Protected

  protected jsonDataToResources(jsonData: any[]): T[]{
    const resource: T[] = [];

    jsonData.forEach(element => resource.push(element as T));
      return resource
  }

  protected jsonDataToResource(jsonData: any): T{
    return jsonData as T;
  }
  protected handleError(error: any): Observable<any>{
    console.log("Erro na Requisão => ", error);
    return throwError(error);
  }


}