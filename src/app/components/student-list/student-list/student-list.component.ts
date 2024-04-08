import { Component, Input } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import CollegeData from '../../../../assets/json/colleges.json';
import StudentData from '../../../../assets/json/students.json';
import { Subject, debounceTime, distinctUntilChanged, map } from 'rxjs';

@Component({
  selector: 'app-student-list',
  templateUrl: './student-list.component.html',
  styleUrl: './student-list.component.css',
})
export class StudentListComponent {
  @Input() mode: 'add' | 'edit' = 'add';
  @Input() studentData: any;
  isOpen: boolean = false;
  studentForm: FormGroup;
  colleges: any[] = [];
  collegeList: any[] = [];
  years = [2021, 2022, 2023];
  bufferSize = 10;
  dropDownIsLoading: boolean;
  searchControl = new FormControl('');
  searchTerm$ = new Subject<string>();
  studentDetails: any[] = [];
  students: any[] = [];
  isEditModalOpen: any;
  isEditOperation: boolean;
  pageSize = 10
  currentPage = 1
  paginatedData: any[] = [];
  selectedItems: any[] = [];
  isStudentSelected = true;
  searchQuery : any;
  searchForm: FormGroup;
  filteredStudents : any[] = [];

  
  //totalPages: any;

  constructor(private fb: FormBuilder) {
    this.createForm();
  }

  ngOnInit(): void {
    this.colleges = CollegeData;
    this.collegeList = this.colleges.slice(0, this.bufferSize);
    this.initializeStudentData(); 
    this.isEditModalOpen = false;

    this.searchForm = this.fb.group({
      searchControl: [''] // Initialize with an empty string
    });


    //college search
    this.searchTerm$
      .pipe(
        debounceTime(300),
        map((searchTerm) => searchTerm.trim().toLowerCase())
      )
      .subscribe((searchTerm) => {
        this.collegeList = this.colleges.filter((college) =>
          college.name.toLowerCase().includes(searchTerm)
        );
      });

    
      // this.searchControl.valueChanges.pipe(
      //   debounceTime(300), // Debounce input for 300 milliseconds
      //   distinctUntilChanged(), // Only emit if the value has changed
      //   map((value: string) => value.trim().toLowerCase()) // Transform input value to lowercase and trim whitespace
      // ).subscribe(searchQuery => {
      //   // Filter students based on search query
      //   console.log("search", searchQuery);
      //   this.students = this.filterStudents(searchQuery);
      // });
  }
  searchStudents(): void {
    // If search query is empty, display all students
    console.log("Search", this.filteredStudents)
    if (!this.searchQuery.trim()) {
      this.students = this.students;
    } else {
      // Filter students based on search query
      console.log("Some Filter Happening")
      this.filteredStudents = this.students.filter(student => {
        // Check if student name or college contains the search query (case-insensitive)
        return student.studentName.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
               student.college.toLowerCase().includes(this.searchQuery.toLowerCase());
               
      });
    }
    this.paginateData();
  }


  initializeStudentData(){
    if(!localStorage.getItem('StudentDetails')){
      localStorage.setItem('StudentDetails',JSON.stringify(StudentData));
      this.students = this.getExistingStudents();
    } else {
      let localStorageData = this.getExistingStudents();
      localStorageData.sort((a, b) => (parseInt(a.id) < parseInt(b.id) ? 1 : -1))
      this.students = localStorageData
    }
    this.paginateData();
  }
  addStudent() {
    this.studentForm.reset();
    this.createForm();
    this.isEditModalOpen = true;
    this.isEditOperation = false;
  }
  searchCollege(searchTerm: any) {
    let strval: string;
    strval = searchTerm.term.toString();
    if (strval.length === 0) {
      console.log('zero');
      this.collegeList = this.colleges.slice(0, 10);
    } else if (strval.length > 2) {
      this.searchTerm$.next(strval);
    }
  }
  createForm() {
    this.studentForm = this.fb.group({
      studentName: [
        '',
        {
          validators: [Validators.required, Validators.minLength(3)],
          updateOn: 'blur',
        },
      ], // Adding validators for studentName
      college: ['', { validators: [Validators.required], updateOn: 'blur' }],
      gender: ['', { validators: [Validators.required], updateOn: 'blur' }],
      age: [
        '',
        {
          validators: [
            Validators.required,
            Validators.min(18),
            Validators.max(45),
          ],
          updateOn: 'blur',
        },
      ],
      courses: this.fb.array([this.createCourse()]),
      progress: ['Pending'],
      id: [''],
    });
  }

  createCourse(): FormGroup {
    return this.fb.group({
      title: [
        'Health',
        { validators: [Validators.required], updateOn: 'blur' },
      ],
      year: '2023',
    });
  }

  get courses() {
    return this.studentForm.get('courses') as FormArray;
  }

  addCourse() {
    this.courses.push(this.createCourseFormGroup('Health', '2023'));
  }

  createCourseFormGroup(title, year) {
    return this.fb.group({
      title: title,
      year: year,
    });
  }

  submit(): void {
    if (this.studentForm.valid) {
      let studentDetails = this.getExistingStudents();
      const uniqueId = Date.now().toString() + Math.floor(Math.random() * 1000).toString();
      const studentFormDataWithId = {
        ...this.studentForm.value,
        id: uniqueId,
        progress: 'Pending',
      };
      studentDetails.push(studentFormDataWithId);
      localStorage.setItem('StudentDetails', JSON.stringify(studentDetails));
      this.initializeStudentData();
      this.studentForm.reset();
      console.log('Form submitted successfully!');
    } else {
      alert('Please fill out the form correctly.');
    }
  }

  editStudent(student: any): void {
    // Implement edit logic here

    this.studentForm.patchValue({
      studentName: student.studentName,
      college: student.college,
      gender: student.gender,
      age: student.age,

      id: student.id,
      progress: student.progress,
    });

    student.courses.forEach((course: any) => {
      this.courses.push(this.createCourseFormGroup(course.title, course.year));
    });

    this.isEditOperation = true;
  }

  deleteStudent(student: any): void {
    // Implement delete logic here
    this.isEditModalOpen = true;
    let existingStudents = this.getExistingStudents();
    const index = existingStudents.findIndex(
      (currStudent: any) => currStudent.id === student.id
    );
    if(index !== -1){
      existingStudents.splice(index, 1);
      localStorage.setItem('StudentDetails', JSON.stringify(existingStudents));
      this.students = existingStudents;
      this.initializeStudentData();
    }
  }

  onScrollToEnd() {
    console.log('scrolled till end');
    const len = this.collegeList.length;
    const more = this.colleges.slice(len, this.bufferSize + len);
    this.dropDownIsLoading = true;

    setTimeout(() => {
      this.dropDownIsLoading = false;
      this.collegeList = this.collegeList.concat(more);
    }, 200);
  }

  openModalWithData(studentData: any): void {
    this.isOpen = true;
    //this.studentData = studentData;
    console.log('Edit lcicke', studentData);
  }

  getExistingStudents(){
    let studentDetails: any[] = [];
      if (localStorage.getItem('StudentDetails')) {
        studentDetails = JSON.parse(localStorage.getItem('StudentDetails')!);
      }
      return studentDetails;
  }

  updateStudentDetails() {
    console.log('inside', this.studentForm.value);
    if (this.studentForm.valid) {
      let studentDetails: any[] = [];
      if (localStorage.getItem('StudentDetails')) {
        studentDetails = JSON.parse(localStorage.getItem('StudentDetails')!);
      }
      const index = studentDetails.findIndex(
        (student: any) => student.id === this.studentForm.value.id
      );

      if (index !== -1) {
        console.log('Update ', this.studentForm.value);
        console.log('Index ', index);
        studentDetails[index] = this.studentForm.value;
        localStorage.setItem('StudentDetails', JSON.stringify(studentDetails));
        this.studentForm.reset();
      }
    } else {
      alert('Please fill out the form correctly.');
    }
  }

  removeCourse(index: number): void {
    this.courses.removeAt(index);
  }

  paginateData(): void {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    if(this.filteredStudents.length > 0){
      this.paginatedData = this.filteredStudents.slice(startIndex, endIndex);
    }
    else{
    this.paginatedData = this.students.slice(startIndex, endIndex);
    }
    console.log("paginateddata", this.paginatedData);
  }

  get totalPages(): number[] {
    const totalItems = this.students.length;
    const totalPages = Math.ceil(totalItems / this.pageSize);
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  onPageChange(pageNumber: number): void {
    this.currentPage = pageNumber;
    this.paginateData();
  }
  
  toggleSelection(event: any, student: any): void {
    if (event.target.checked) {
      this.selectedItems.push(student);
    } else {
      const index = this.selectedItems.findIndex((item) => item === student);
      if (index !== -1) {
        this.selectedItems.splice(index, 1);
      }
    }
    if(this.selectedItems.length > 0) this.isStudentSelected = false;
    else this.isStudentSelected = true;
  }

  saveToLocalStorage(){
     localStorage.removeItem('StudentData');
     localStorage.setItem('StudentData',JSON.stringify(this.students));
     console.log("AfterSaving", JSON.parse(localStorage.getItem('StudentData')));
     //console.log(this.getExistingStudents());
  
  }

  deleteSelected() {
    for(let i = 0; i < this.selectedItems.length; i++)
      this.deleteStudent(this.selectedItems[i]);
    this.selectedItems = [];
  }
}
