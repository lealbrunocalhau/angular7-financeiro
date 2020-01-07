import { Injectable, Injector } from '@angular/core';

import { Observable,  } from "rxjs";
import { flatMap, catchError, map } from "rxjs/operators";

import { BaseResourceService } from "../../../shared/services/base-resource.service";
import { CategoryService } from "../../categories/shared/category.service";
import { Entry } from "./entry.model";

import * as moment from "moment"


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

  getByMonthAndYear(month: number, year: number): Observable<Entry[]> {
    return this.getAll().pipe(
      map(entries => this.filterByMonthAndYear(entries, month, year))
    )
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

  private filterByMonthAndYear(entries: Entry[], month: number, year:number){
      return entries.filter(entry => {
        const entryDate = moment(entry.date, "DD/MM/YYYY")
        const monthMatches = entryDate.month() + 1 == month
        const yearMatches = entryDate.year() == year

        if(monthMatches && yearMatches)
          return entry
      })
  }

}

