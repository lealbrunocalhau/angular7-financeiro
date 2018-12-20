import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router"
import { BreadCrumbComponent } from './components/bread-crumb/bread-crumb.component';
import { from } from 'rxjs';

@NgModule({
  declarations: [BreadCrumbComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule
  ],
  exports: [
    //modulos compartilhados
    CommonModule,
    ReactiveFormsModule,
    BreadCrumbComponent,
    RouterModule
  ]
})
export class SharedModule { }
