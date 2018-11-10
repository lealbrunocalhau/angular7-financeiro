import { Component, OnInit, AfterContentChecked } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";

import { Category } from "../shared/category.model";
import { CategoryService } from "../shared/category.service";

import { switchMap } from "rxjs/operators";

import toastr from "toastr";

@Component({
  selector: 'app-category-form',
  templateUrl: './category-form.component.html',
  styleUrls: ['./category-form.component.css']
})
export class CategoryFormComponent implements OnInit, AfterContentChecked {

  //vai me dizer se estou editando ou criando abaixo
  currentAction: string;
  categoryForm: FormGroup;
  pageTitle: string;
  serverErrorMessages: string[] = null;
  submittingForm: boolean = false;
  category: Category = new Category();

  constructor(
    private categoryService: CategoryService,
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder
  ) { }

  ngOnInit() {
    this.setCurrentAction();
    this.buildCategoryForm();
    this.loadCategory();
  }

  ngAfterContentChecked(){
    this.setPageTitle();
  }

  submitForm(){
    console.log('Entrei')
    //quando o usuario clicar no botao de salvar
    this.submittingForm = true;

    //verificar se esta editando ou criando category
    if(this.currentAction == 'new'){
      this.createCategory()
    }
    else //currentAction == 'edit'
    this.updateCategory()
  }



  //Private Methods
  private setCurrentAction(){
    //verificar a rota que chegou, para saber se está editando ou adicionando
    if(this.route.snapshot.url[0].path == "new")
      this.currentAction = "new"
    else
      this.currentAction = "edit"
  }

  private buildCategoryForm(){
    this.categoryForm = this.formBuilder.group({
      id: [null],
      name: [null,[Validators.required, Validators.minLength(2)]],
      description: [null]
    })
  }

  private loadCategory(){
    if (this.currentAction == 'edit'){
      this.route.paramMap.pipe(
        switchMap(params => this.categoryService.getById(+params.get('id')))
      )
      .subscribe(
        (category) => {
          this.category = category
          this.categoryForm.patchValue(category) //binds loaded category data to CategoryForm
        },
        (error) => alert ('Ocorreu um erro no servidor, tente mais tarde. (category-form->LoadCategory())')
      )
    }
  }


  private setPageTitle(){
    if(this.currentAction == 'new')
      this.pageTitle = 'Cadastro de Nova Categoria'
    else{
      const categoryName = this.category.name || ''
      this.pageTitle = 'Editando Categoria: ' + categoryName  
    }
      
  }

  private createCategory(){
    //vai precisar criar um objeto do tipo category e enviar atraves do categoryService
    const category: Category = Object.assign(new Category(), this.categoryForm.value)

    this.categoryService.create(category)
      .subscribe(
        category => this.actionsForSuccess(category),
        error => this.actionsForError(error)
      )

  }

  private updateCategory(){
    const category: Category = Object.assign(new Category(), this.categoryForm.value)

    this.categoryService.update(category)
    .subscribe(
      category => this.actionsForSuccess(category),
      error => this.actionsForError(error)
    )
  }

  private actionsForSuccess(category: Category){
    toastr.success("Solicitação processada com sucesso")

    //forçar carregamento do componente;...sair do /new ir para / e voltar para /id/edit
    this.router.navigateByUrl("categories", {skipLocationChange: true}) //sempre absoluta esse navigateByUrl site.com.br/ //skypLocationChange, nao armazena no historico do browser, para caso ele clique em voltar n de problema de ir para a rota
    .then(
        //redirecionando para o edit
       () => this.router.navigate(['categories', category.id, 'edit'])
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
