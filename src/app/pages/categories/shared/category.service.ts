import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from "@angular/common/http";

import { Observable, throwError } from "rxjs";
import { map, catchError, flatMap } from "rxjs/operators";
import { Category } from "./category.model";
import { element } from 'protractor';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  private apiPath: string = "api/categories"
  constructor( private http: HttpClient) { }

  getAll(): Observable<Category[]>{
    console.log('entri denovo')
    return this.http.get(this.apiPath).pipe(
      catchError(this.handleError),
      map(this.jsonDataToCategories)
    )
  }

  getById(id: number): Observable<Category>{
    const url = `${this.apiPath}/${id}`;
    return this.http.get(url).pipe(
      catchError(this.handleError),
      map(this.jsonDataToCategory)
    )
  }

  create(category: Category): Observable<Category>{
    return this.http.post(this.apiPath, category).pipe(
      catchError(this.handleError),
      map(this.jsonDataToCategory)
    )
  }

  update(category: Category): Observable<Category>{
    //montar url q vou montar
    const url = `${this.apiPath}/${category.id}`;
    return this.http.put(url, category).pipe(
      catchError(this.handleError),
      map(()=> category)
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

  private jsonDataToCategories(jsonData: any[]): Category[]{
    console.log('Category-service -> jsonDataToCategories')
    const categories: Category[] = [];
    jsonData.forEach(element => categories.push(element as Category));
    console.log(categories)
    return categories
  }

  private jsonDataToCategory(jsonData: any): Category{
    return jsonData as Category;
  }
  private handleError(error: any): Observable<any>{
    console.log("Erro na Requisão => ", error);
    return throwError(error);
  }

}