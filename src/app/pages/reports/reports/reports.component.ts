import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';

import { Category } from "../../categories/shared/category.model";
import { CategoryService } from "../../categories/shared/category.service";

import { Entry } from "../../entries/shared/entry.model";
import { EntryService } from "../../entries/shared/entry.service";

import currencyFormatter from "currency-formatter"


@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css']
})
export class ReportsComponent implements OnInit {

  expenseTotal: any = 0
  revenueTotal: any = 0
  balance: any = 0

  //dados do grafico
  expenseChartData: any
  revenueChartData: any

  chartOptions = {
    scales: {
      yAxes: [
        {ticks: {
          beginAtZero: true
        }
      }]
    }
  }

  categories: Category[] = []
  entries: Entry[] = []


  @ViewChild('month') month: ElementRef = null;
  @ViewChild('year') year: ElementRef = null;

  constructor( private categoryService: CategoryService,
               private entryService: EntryService
              ) { }

  ngOnInit() {
    this.categoryService.getAll()
    .subscribe(categories => this.categories = categories)
  }


  generateReports(){
    //pegar mes e o ano q o cara escolheu
    const month = this.month.nativeElement.value
    const year = this.year.nativeElement.value

    if(!month || !year)
      alert("Você precisa escolher o mês e o ano para gerar os relatorios")
    else
      this.entryService.getByMonthAndYear(month, year).subscribe(this.setValues.bind(this))


  }

  private setValues(entries: Entry[]){
    this.entries = entries;
    this.calculateBalance()
    this.setChartData()
  }

  private calculateBalance(){
    let expenseTotal = 0
    let revenueTotal = 0

    this.entries.forEach(entry => {
      if (entry.type == 'revenue')
        revenueTotal += currencyFormatter.unformat(entry.amount, { code: 'BRL'})
      else
        expenseTotal += currencyFormatter.unformat(entry.amount, { code: 'BRL'})
    })

    this.expenseTotal = currencyFormatter.format(expenseTotal, { code: 'BRL'})
    this.revenueTotal = currencyFormatter.format(revenueTotal, { code: 'BRL'})

    this.balance = currencyFormatter.format(revenueTotal - expenseTotal, { code: 'BRL'})

  }

  private setChartData(){
    this.revenueChartData = this.getChartData('revenue', 'Gráfico de Receitas', '#9ccc65')
    this.expenseChartData = this.getChartData('expense', 'Gráfico de Despesas', '#e03131')
  }

  private getChartData(entryType: string, title:string, color: string){
    const chartData = []

    console.log('Oi Bruno 123')
    console.log(this.categories)

    this.categories.forEach(category => {
      //filtrando as entries por category e type
      console.log('Dentro da funcao getChartData()-reports.component.ts')
      console.log(category)
      console.log(this.entries)
      const filteredEntries = this.entries.filter(
        entry => (entry.categoryId == category.id) && (entry.type == entryType)
      )
      console.log('Aqui: FilteredEntries antes reduce ', filteredEntries)

      //if found entries, then sum entreis amount and add do chartData
      if (filteredEntries.length > 0) {
        const totalAmount = filteredEntries.reduce(
          (total, entry) => total + currencyFormatter.unformat(entry.amount, { code: 'BRL'}), 0
        )

        chartData.push({
          categoryName: category.name,
          totalAmount: totalAmount
        })
      }

    })

    return {
      labels: chartData.map(item => item.categoryName),
      datasets: [
        {
          label: title,
          backgroundColor: color,
          data: chartData.map(item => item.totalAmount)
        }
      ]
    }

  }

  }
