import { OnInit, AfterContentChecked, Injector } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";

import { BaseResourceModel } from "../../models/base-resource.model";
import { BaseResourceService } from "../../services/base-resource.service";

import { switchMap } from "rxjs/operators";
import toastr from "toastr";

export abstract class BaseResourceFormComponent<T extends BaseResourceModel> implements OnInit, AfterContentChecked {

  //vai me dizer se estou editando ou criando abaixo
  currentAction: string;
  resourceForm: FormGroup;
  pageTitle: string;
  serverErrorMessages: string[] = null;
  submittingForm: boolean = false;
  
  protected route: ActivatedRoute
  protected router: Router
  protected formBuilder: FormBuilder

  constructor(
    protected injector: Injector,
    public resource: T,
    protected resourceService: BaseResourceService<T>,
    protected jsonDataToResourceFn: (jsonData) => T
    
  ) { 
      this.route = this.injector.get(ActivatedRoute)
      this.router = this.injector.get(Router)
      this.formBuilder = this.injector.get(FormBuilder)
   }

  ngOnInit() {
    this.setCurrentAction();
    this.buildResourceForm();
    this.loadResource();
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
      this.createResource()
    }
    else //currentAction == 'edit'
    this.updateResource()
  }



  //Private Methods
  protected setCurrentAction(){
    //verificar a rota que chegou, para saber se está editando ou adicionando
    if(this.route.snapshot.url[0].path == "new")
      this.currentAction = "new"
    else
      this.currentAction = "edit"
  }


  protected loadResource(){
    if (this.currentAction == 'edit'){
      this.route.paramMap.pipe(
        switchMap(params => this.resourceService.getById(+params.get('id')))
      )
      .subscribe(
        (resource) => {
          this.resource = resource
          this.resourceForm.patchValue(resource) //binds loaded resource data to resourceForm
        },
        (error) => alert ('Ocorreu um erro no servidor, tente mais tarde. (category-form->LoadCategory())')
      )
    }
  }


  protected setPageTitle(){
    if(this.currentAction == 'new')
      this.pageTitle = this.creationPageTitle()
    else{
      this.pageTitle = this.editionPageTitle()
    }
      
  }

  protected creationPageTitle(): string{
      return "Novo"
  }

  protected editionPageTitle(): string {
      return "Edição"
  }


  protected createResource(){
    //vai precisar criar um objeto do tipo category e enviar atraves do categoryService
    const resource: T = this.jsonDataToResourceFn(this.resourceForm.value)

    this.resourceService.create(resource)
      .subscribe(
        resource => this.actionsForSuccess(resource),
        error => this.actionsForError(error)
      )

  }

  protected updateResource(){
    const resource: T = this.jsonDataToResourceFn(this.resourceForm.value)
    
    this.resourceService.update(resource)
    .subscribe(
      resource => this.actionsForSuccess(resource),
      error => this.actionsForError(error)
    )
  }

     private actionsForSuccess(resource: T){
    toastr.success("Solicitação processada com sucesso")

    const baseComponentPath: string =  this.route.snapshot.parent.url[0].path
    //forçar carregamento do componente;...sair do /new ir para / e voltar para /id/edit
    this.router.navigateByUrl(baseComponentPath, {skipLocationChange: true}) //sempre absoluta esse navigateByUrl site.com.br/ //skypLocationChange, nao armazena no historico do browser, para caso ele clique em voltar n de problema de ir para a rota
    .then(
        //redirecionando para o edit
       () => this.router.navigate([baseComponentPath, resource.id, 'edit'])
    )
  }
  protected actionsForError(error){
    toastr.error("Ocorreu um erro ao processar a sua solicitação!")

    this.submittingForm = false;

    if(error.status === 422) //erro de api - geralmente algum campo esta faltando por exemplo
      this.serverErrorMessages = JSON.parse(error._body).errors
    else 
      this.serverErrorMessages = ["Falha na comunicação com o servidor. Por favor, tente mais tarde."]
  }

  protected abstract buildResourceForm(): void 

}
