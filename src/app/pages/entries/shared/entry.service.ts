import { Injectable, Injector } from '@angular/core';

import { Observable, } from 'rxjs';
import { flatMap, catchError, map } from 'rxjs/operators';

import { BaseResourceService } from '../../../shared/services/base-resource.service';
import { CategoryService } from '../../categories/shared/category.service';
import { Entry } from './entry.model';

import * as moment from 'moment';


@Injectable({
  providedIn: 'root'
})
export class EntryService extends BaseResourceService<Entry> {

  constructor(
    protected injector: Injector,
    private categoryService: CategoryService
  ) {
    super('api/entries', injector, Entry.fromJson);
  }



  create(entry: Entry): Observable<Entry> {
    return this.setCategoryAndSendToServer(entry, super.create.bind(this));
  }

  update(entry: Entry): Observable<Entry> {
    return this.setCategoryAndSendToServer(entry, super.update.bind(this));
  }

  getByMonthAndYear( month: number, year: number ): Observable<Entry[]> {
    return this.getAll().pipe(
      map(entries =>
        this.filterByMonthAndYear(
          entries,
          month,
          year
        )
      )
    );
  }

  private filterByMonthAndYear(entries: Entry[], month: number, year: number) {
    return entries.filter(entry => {
      // console.log('entrei 323232');
      // console.log('Mes', month);
      // console.log('Ano', year);
      const entryDate = moment(entry.date, 'DD/MM/YYYY');
      // console.log('EntryDate', entry.date);
      // console.log('EntryDate - moment', moment(entry.date, 'DD/MM/YYYY'));
      // console.log('EntryDate resposta', entryDate);
      const monthMatches = entryDate.month() + 1 === +month;

      // console.log('MonthMatchs', monthMatches);
      const yearMatches = entryDate.year() === +year;

      // console.log('YearMatchs', yearMatches);
      if (monthMatches && yearMatches) {
        return entry;
      }
    });
  }

  private setCategoryAndSendToServer(entry: Entry, sendFn: any): Observable<Entry> {
    return this.categoryService.getById(entry.categoryId).pipe(
      flatMap(category => {
        entry.category = category;
        return sendFn(entry);
      }),
      catchError(this.handleError)
    );
  }



}

