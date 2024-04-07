import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import CollegeData from '../../../../assets/json/colleges.json';

@Component({
  selector: 'app-student-form',
  templateUrl: './student-form.component.html',
  styleUrls: ['./student-form.component.css']
})
export class StudentFormComponent implements OnChanges, OnInit {
  @Input() mode: 'add' | 'edit' = 'add';
  @Input() studentData: any;
  studentForm: FormGroup;
  colleges: any[] = [];
  years = [2021,2022,2023];

  constructor(private fb: FormBuilder) {
    this.createForm();

  }

  ngOnChanges() {
    if (this.studentData && this.mode === 'edit') {
      this.studentForm.patchValue(this.studentData);
    }
  }

  ngOnInit(): void {
    this.colleges = CollegeData;
  }

  createForm() {
    this.studentForm = this.fb.group({
      studentName: '',
      college: '',
      gender: '',
      age: '',
      courses: this.fb.array([]) // Initialize courses FormArray
    });
  }

  get courses() {
    return this.studentForm.get('courses') as FormArray;
  }

  addCourse() {
    this.courses.push(this.createCourseFormGroup());
  }

  createCourseFormGroup() {
    return this.fb.group({
      title: '',
      year: ''
    });
  }

  submit() {
    console.log(this.studentForm.value);
    // Here you can handle form submission logic
  }
}
