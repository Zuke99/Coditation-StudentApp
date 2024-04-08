import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import CollegeData from '../../../../assets/json/colleges.json';
import StudentData from '../../../../assets/json/students.json';
import { Subject, debounceTime, map } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCoffee } from '@fortawesome/free-solid-svg-icons';
import {faPenToSquare } from '@fortawesome/free-solid-svg-icons'
import {faTrash } from '@fortawesome/free-solid-svg-icons'
import {faPlus } from '@fortawesome/free-solid-svg-icons'
import {faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons'
@Component({
  selector: 'app-student-list',
  templateUrl: './student-list.component.html',
  styleUrl: './student-list.component.css',
})
export class StudentListComponent {
  faCoffee = faCoffee;
  faEdit = faPenToSquare
  faDelete = faTrash
  faAdd = faPlus
  faSearch = faMagnifyingGlass
  studentForm: FormGroup;
  colleges: any[] = []; //All Colleges
  collegeList: any[] = []; //College BufferList
  bufferSize = 10;
  isDropDownLoading: boolean;
  searchTerm$ = new Subject<string>();
  students: any[] = []; //Main Student Data
  isEditModalOpen: boolean;
  isEditOperation: boolean;
  pageSize = 10;
  currentPage = 1;
  paginatedData: any[] = []; //to Show Paginated Chunks of Data
  selectedItems: any[] = []; //to Delete Multiple Entries
  isStudentSelected = true;
  searchQuery: any; //For SearchBox
  filteredStudents: any[] = []; //SearchBox Filtered Entries
  currentStudent: any;

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.createForm();
  }

  ngOnInit(): void {
    this.colleges = CollegeData;
    this.collegeList = this.colleges.slice(0, this.bufferSize);
    this.initializeStudentData();
    this.isEditModalOpen = false;

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
  }

  //SearchBox
  searchStudents(): void {
    // If search query is empty, display all students
    if (!this.searchQuery.trim()) {
      this.students = this.students;
    } else {
      this.currentPage = 1
      this.pageSize = 10
      // Filter students based on search query
      this.filteredStudents = this.students.filter((student) => {
        return (
          student.studentName
            .toLowerCase()
            .includes(this.searchQuery.toLowerCase()) ||
          student.college.toLowerCase().includes(this.searchQuery.toLowerCase())
        );
      });
    }
    this.initializeStudentData();
  }

  initializeStudentData() {
    if (!localStorage.getItem('StudentDetails')) {
      localStorage.setItem('StudentDetails', JSON.stringify(StudentData));
      this.students = this.getExistingStudents();
    } else {
      let localStorageData = this.getExistingStudents();
      localStorageData.sort((a, b) =>
        parseInt(a.id) < parseInt(b.id) ? 1 : -1
      );
      this.students = localStorageData;
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
      ],
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
      avatar: [''],
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

  refreshCourse() {
    this.courses.clear();
  }

  createCourseFormGroup(title: any, year: any) {
    return this.fb.group({
      title: title,
      year: year,
    });
  }

  submit(): void {
    if (this.studentForm.valid) {
      let studentDetails = this.getExistingStudents();
      const uniqueId =
        Date.now().toString() + Math.floor(Math.random() * 1000).toString();
      const studentFormDataWithId = {
        ...this.studentForm.value,
        id: uniqueId,
        progress: 'Pending',
      };
      studentDetails.push(studentFormDataWithId);
      this.students = studentDetails;
      this.saveToLocalStorage();
      this.initializeStudentData();
      this.studentForm.reset();
      document.getElementById('closeModalButton').click();
      alert('Form submitted successfully!');
    } else {
      alert('Please fill out the form correctly.');
    }
  }

  editStudent(student: any): void {
   
    this.studentForm.reset();
    this.refreshCourse();
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

  deleteStudent(student: any, confirmDelete?: boolean): void {
    if(confirmDelete || confirm(`Are you Sure You want to delete Student ${student.studentName}?`) ){
    this.isEditModalOpen = true;
    let existingStudents = this.getExistingStudents();
    const index = existingStudents.findIndex(
      (currStudent: any) => currStudent.id === student.id
    );
    if (index !== -1) {
      existingStudents.splice(index, 1);
      localStorage.setItem('StudentDetails', JSON.stringify(existingStudents));
      this.students = existingStudents;
      this.initializeStudentData();
    }
  }
  }

  //load More Data on Scrolling to end
  onScrollToEnd() {
    const len = this.collegeList.length;
    const more = this.colleges.slice(len, this.bufferSize + len);
    this.isDropDownLoading = true;

    setTimeout(() => {
      this.isDropDownLoading = false;
      this.collegeList = this.collegeList.concat(more);
    }, 200);
  }

  closeModal() {
    this.studentForm.reset();
  }

  getExistingStudents() {
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
      if (this.getExistingStudents()) {
        studentDetails = this.getExistingStudents();
      }
      const index = studentDetails.findIndex(
        (student: any) => student.id === this.studentForm.value.id
      );

      if (index !== -1) {
        studentDetails[index] = this.studentForm.value;
        this.students = studentDetails;
        this.saveToLocalStorage();
        this.initializeStudentData();
        this.studentForm.reset();
        document.getElementById('closeModalButton').click();
      }
    } else {
      alert('Please fill out All Details');
    }
  }

  removeCourse(index: number): void {
    this.courses.removeAt(index);
  }
  //While Changing Pending Status
  setCurrentStudent(student: any) {
    this.currentStudent = student;
  }

  changeProgressStatus(status: any) {
    let studentList = this.getExistingStudents();
    const index = studentList.findIndex(
      (student: any) => student.id === this.currentStudent.id
    );
    if (index !== -1) {
      studentList[index].progress = status;
      this.students = studentList;
    }
    this.saveToLocalStorage();
    this.initializeStudentData();
    document.getElementById('progressModalButton').click();
  }

  paginateData(): void {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    if (this.filteredStudents.length > 0) {
      this.paginatedData = this.filteredStudents.slice(startIndex, endIndex);
    } else {
      this.paginatedData = this.students.slice(startIndex, endIndex);
    }
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
    if (this.selectedItems.length > 0) this.isStudentSelected = false;
    else this.isStudentSelected = true;
  }

  saveToLocalStorage() {
    localStorage.setItem('StudentDetails', JSON.stringify(this.students));
  }

  deleteSelected() {
    if(confirm(`Are you Sure You Want to delete these ${this.selectedItems.length} items`)){
    for (let i = 0; i < this.selectedItems.length; i++)
      this.deleteStudent(this.selectedItems[i], true);
    this.selectedItems = [];
  }
}
}
