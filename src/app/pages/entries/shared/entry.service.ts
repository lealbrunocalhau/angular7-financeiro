import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from "@angular/common/http";

import { Observable, throwError } from "rxjs";
import { map, catchError, flatMap } from "rxjs/operators";
import { Entry } from "./entry.model";
import { element } from 'protractor';

@Injectable({
  providedIn: 'root'
})
export class EntryService {

  private apiPath: string = "api/entries"
  constructor( private http: HttpClient) { }

  getAll(): Observable<Entry[]>{
    console.log('entri denovo')
    return this.http.get(this.apiPath).pipe(
      catchError(this.handleError),
      map(this.jsonDataToEntries)
    )
  }

  getById(id: number): Observable<Entry>{
    const url = `${this.apiPath}/${id}`;
    return this.http.get(url).pipe(
      catchError(this.handleError),
      map(this.jsonDataToEntry)
    )
  }

  create(entry: Entry): Observable<Entry>{
    return this.http.post(this.apiPath, entry).pipe(
      catchError(this.handleError),
      map(this.jsonDataToEntry)
    )
  }

  update(entry: Entry): Observable<Entry>{
    //montar url q vou montar
    const url = `${this.apiPath}/${entry.id}`;
    return this.http.put(url, entry).pipe(
      catchError(this.handleError),
      map(()=> entry)
    )
  }

  delete(id: number): Observable<any> {
    const url = `${this.apiPath}/${id}`;
    return this.http.delete(url).pipe(
      catchError(this.handleError),
      map(()=> null)
    )
  }
  
  //Metodos Privados

  private jsonDataToEntries(jsonData: any[]): Entry[]{
    console.log('Entry-service -> jsonDataToEntries')
    const entries: Entry[] = [];
    jsonData.forEach(element => entries.push(element as Entry));
    console.log(entries)
    return entries
  }

  private jsonDataToEntry(jsonData: any): Entry{
    return jsonData as Entry;
  }
  private handleError(error: any): Observable<any>{
    console.log("Erro na Requisão => ", error);
    return throwError(error);
  }

}
