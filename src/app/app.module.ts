import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { EditButtonComponent } from './components/buttons/edit-button/edit-button.component';
import { StudentFormComponent } from './components/student-form/student-form/student-form.component';
import { StudentListComponent } from './components/student-list/student-list/student-list.component';
import { ModalComponent } from './shared/modal/modal/modal.component';
import { SearchBarComponent } from './components/search-bar/search-bar/search-bar.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { StudentTableComponent } from './components/student-table/student-table/student-table.component';


@NgModule({
  declarations: [
    AppComponent,
    EditButtonComponent,
    StudentFormComponent,
    StudentListComponent,
   ModalComponent,
   SearchBarComponent,
   StudentFormComponent,
   StudentTableComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    NgSelectModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
