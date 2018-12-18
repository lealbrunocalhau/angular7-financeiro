import { Injectable, Injector } from '@angular/core';

import { BaseResourceService } from "../../../shared/services/base-resource.service";
import { CategoryService } from "../../categories/shared/category.service";
import { Entry } from "./entry.model";

import { Observable,  } from "rxjs";
import { flatMap, catchError } from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class EntryService extends BaseResourceService<Entry> {

  constructor( 
    protected injector: Injector,
    private categoryService: CategoryService
  ) { 
      super("api/entries", injector, Entry.fromJson)
    }

  // create(entry: Entry): Observable<Entry>{
  //   return this.http.post(this.apiPath, entry).pipe(
  //     catchError(this.handleError),
  //     map(this.jsonDataToEntry)
  //   )
  // }

  create(entry: Entry): Observable<Entry> {
     return this.setCategoryAndSendToServer(entry, super.create.bind(this))
  }

  // update(entry: Entry): Observable<Entry>{
  //   //montar url q vou montar
  //   const url = `${this.apiPath}/${entry.id}`;
  //   return this.http.put(url, entry).pipe(
  //     catchError(this.handleError),
  //     map(()=> entry)
  //   )
  // }

  //Adaptacao
  update(entry: Entry): Observable<Entry>{
    return this.setCategoryAndSendToServer(entry, super.update.bind(this))
    // return this.categoryService.getById(entry.categoryId).pipe(
    //   flatMap(category => {
    //     entry.category = category
        
    //     // return this.http.put(url, entry).pipe(
    //     //   catchError(this.handleError),
    //     //   map(()=> entry)
    //     // )
    //     //Mesma coisa acima e abaixo otimizado.
    //     return super.update(entry)
    //   })
    // )
    
  }

  private setCategoryAndSendToServer(entry: Entry, sendFn: any): Observable<Entry>{
    return this.categoryService.getById(entry.categoryId).pipe(
      flatMap(category => {
        entry.category = category
        return sendFn(entry)
      }),
      catchError(this.handleError)
      )
  }

}
