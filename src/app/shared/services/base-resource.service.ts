import { BaseResourceModel } from '../models/base-resource.model';

import { Injector } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export abstract class BaseResourceService<T extends BaseResourceModel> {

  protected http: HttpClient;

  constructor(
    protected apiPath: string,
    protected injector: Injector,
    protected jsonDataToResourceFn: (jsonData: any) => T
  ) {
    this.http = injector.get(HttpClient);
  }

  getAll(): Observable<T[]> {
    return this.http.get(this.apiPath).pipe(
      // map((jsonData: Array<any>) => this.jsonDataToResources(jsonData)),
      map(
        this.jsonDataToResources.bind(this)),
      catchError(this.handleError)

    );
  }

  getById(id: number): Observable<T> {
    const url = `${this.apiPath}/${id}`;
    return this.http.get(url).pipe(
      map(this.jsonDataToResource.bind(this)),
      catchError(this.handleError)

    );
  }

  create(resource: T): Observable<T> {
    return this.http.post(this.apiPath, resource).pipe(
      map(this.jsonDataToResource.bind(this)),
      catchError(this.handleError)

    );
  }

  update(resource: T): Observable<T> {
    // montar url q vou montar
    const url = `${this.apiPath}/${resource.id}`;

    return this.http.put(url, resource).pipe(
      map(() => resource),
      catchError(this.handleError)

    );
  }

  delete(id: number): Observable<any> {
    const url = `${this.apiPath}/${id}`;
    return this.http.delete(url).pipe(
      map(() => null),
      catchError(this.handleError)

    );
  }



  // Metodos Protected

  protected jsonDataToResources(jsonData: any[]): T[] {
    const resource: T[] = [];

    console.log('Antes do Connect 1');
    jsonData.forEach(
      element => resource.push(this.jsonDataToResourceFn(element)));
      console.log('Aqui é o trabalho',)
    return resource;
  }

  protected jsonDataToResource(jsonData: any): T {
    console.log('Antes do Connect 2');
    return this.jsonDataToResourceFn(jsonData);
  }
  protected handleError(error: any): Observable<any> {
    console.log('Erro na Requisão => ', error);
    return throwError(error);
  }


}
