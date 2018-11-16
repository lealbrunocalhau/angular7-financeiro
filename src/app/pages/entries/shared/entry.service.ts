import { Injectable, Injector } from '@angular/core';

import { BaseResourceService } from "../../../shared/services/base-resource.service";
import { CategoryService } from "../../categories/shared/category.service";
import { Entry } from "./entry.model";

import { Observable,  } from "rxjs";
import { flatMap } from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class EntryService extends BaseResourceService<Entry> {

  constructor( 
    protected injector: Injector,
    private categoryService: CategoryService
  ) { 
      super("api/entries", injector)
    }

  // create(entry: Entry): Observable<Entry>{
  //   return this.http.post(this.apiPath, entry).pipe(
  //     catchError(this.handleError),
  //     map(this.jsonDataToEntry)
  //   )
  // }

  create(entry: Entry): Observable<Entry>{
    //adaptacao para criar category dentro do objeto Entry !!Importante
    return this.categoryService.getById(entry.categoryId).pipe(
      flatMap(category => {
        entry.category = category
       
        return super.create(entry)
      })
    )
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
    return this.categoryService.getById(entry.categoryId).pipe(
      flatMap(category => {
        entry.category = category
        
        // return this.http.put(url, entry).pipe(
        //   catchError(this.handleError),
        //   map(()=> entry)
        // )
        //Mesma coisa acima e abaixo otimizado.
        return super.update(entry)
      })
    )
    
  }

  
  //Metodos Privados

  protected jsonDataToResources(jsonData: any[]): Entry[]{
    console.log('Entry-service -> jsonDataToEntries')
    const entries: Entry[] = [];
    
    jsonData.forEach(element => {
      const entry = Object.assign(new Entry(), element)
      entries.push(entry)
    });

    console.log(entries)
    return entries
  }

  protected jsonDataToResource(jsonData: any): Entry{
    return  Object.assign(new Entry(), jsonData)
  }

}
