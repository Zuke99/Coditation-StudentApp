import { Component, OnInit, ViewChild } from '@angular/core';
import { StudentListComponent } from '../../student-list/student-list/student-list.component';


@Component({
  selector: 'app-student-table',
  templateUrl: './student-table.component.html',
  styleUrl: './student-table.component.css'
})
export class StudentTableComponent implements OnInit{
  students : any[] = [];
  @ViewChild('modal') modal!: StudentListComponent;
  isEditModalOpen : any;
  constructor() {}


  ngOnInit(): void {
    this.students = JSON.parse(localStorage.getItem('StudentDetails'));
  }

  editStudent(student: any): void {
    // Implement edit logic here
    this.isEditModalOpen = true
    this.modal.openModalWithData(student);
    console.log('Edit student:', student);
  }

  deleteStudent(student: any): void {
    // Implement delete logic here
    console.log('Delete student:', student);
  }


}
