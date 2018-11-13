import { Component, OnInit, AfterContentChecked } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";

import { Entry } from "../shared/entry.model";
import { EntryService } from "../shared/entry.service";

import { switchMap } from "rxjs/operators";

import toastr from "toastr";

@Component({
  selector: 'app-entry-form',
  templateUrl: './entry-form.component.html',
  styleUrls: ['./entry-form.component.css']
})
export class EntryFormComponent implements OnInit, AfterContentChecked {

  //vai me dizer se estou editando ou criando abaixo
  currentAction: string;
  entryForm: FormGroup;
  pageTitle: string;
  serverErrorMessages: string[] = null;
  submittingForm: boolean = false;
  entry: Entry = new Entry();

  constructor(
    private entryService: EntryService,
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder
  ) { }

  ngOnInit() {
    this.setCurrentAction();
    this.buildEntryForm();
    this.loadEntry();
  }

  ngAfterContentChecked(){
    this.setPageTitle();
  }

  submitForm(){
    console.log('Entrei')
    //quando o usuario clicar no botao de salvar
    this.submittingForm = true;

    //verificar se esta editando ou criando entry
    if(this.currentAction == 'new'){
      this.createEntry()
    }
    else //currentAction == 'edit'
    this.updateEntry()
  }



  //Private Methods
  private setCurrentAction(){
    //verificar a rota que chegou, para saber se está editando ou adicionando
    if(this.route.snapshot.url[0].path == "new")
      this.currentAction = "new"
    else
      this.currentAction = "edit"
  }

  private buildEntryForm(){
    this.entryForm = this.formBuilder.group({
      id: [null],
      name: [null,[Validators.required, Validators.minLength(2)]],
      description: [null],
      type: [null, [Validators.required]],
      amount: [null, [Validators.required]],
      date: [null, [Validators.required]],
      paid: [null, [Validators.required]],
      categoryId: [null, [Validators.required]]
    })
  }

  private loadEntry(){
    if (this.currentAction == 'edit'){
      this.route.paramMap.pipe(
        switchMap(params => this.entryService.getById(+params.get('id')))
      )
      .subscribe(
        (entry) => {
          this.entry = entry
          this.entryForm.patchValue(entry) //binds loaded entry data to EntryForm
        },
        (error) => alert ('Ocorreu um erro no servidor, tente mais tarde. (entry-form->LoadEntry())')
      )
    }
  }


  private setPageTitle(){
    if(this.currentAction == 'new')
      this.pageTitle = 'Cadastro de Novo Lançamento'
    else{
      const entryName = this.entry.name || ''
      this.pageTitle = 'Editando Lançamento: ' + entryName  
    }
      
  }

  private createEntry(){
    //vai precisar criar um objeto do tipo entry e enviar atraves do entryService
    const entry: Entry = Object.assign(new Entry(), this.entryForm.value)

    this.entryService.create(entry)
      .subscribe(
        entry => this.actionsForSuccess(entry),
        error => this.actionsForError(error)
      )

  }

  private updateEntry(){
    const entry: Entry = Object.assign(new Entry(), this.entryForm.value)

    this.entryService.update(entry)
    .subscribe(
      entry => this.actionsForSuccess(entry),
      error => this.actionsForError(error)
    )
  }

  private actionsForSuccess(entry: Entry){
    toastr.success("Solicitação processada com sucesso")

    //forçar carregamento do componente;...sair do /new ir para / e voltar para /id/edit
    this.router.navigateByUrl("entries", {skipLocationChange: true}) //sempre absoluta esse navigateByUrl site.com.br/ //skypLocationChange, nao armazena no historico do browser, para caso ele clique em voltar n de problema de ir para a rota
    .then(
        //redirecionando para o edit
       () => this.router.navigate(['entries', entry.id, 'edit'])
    )
  }

  private actionsForError(error){
    toastr.error("Ocorreu um erro ao processar a sua solicitação!")

    this.submittingForm = false;

    if(error.status === 422) //erro de api - geralmente algum campo esta faltando por exemplo
      this.serverErrorMessages = JSON.parse(error._body).errors
    else 
      this.serverErrorMessages = ["Falha na comunicação com o servidor. Por favor, tente mais tarde."]
  }
}
