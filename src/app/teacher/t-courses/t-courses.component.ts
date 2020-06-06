import {Component, OnInit, TemplateRef} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';

import {Course} from '../../course';
import {TCourseService} from '../t-course.service';
import {NzModalRef, NzModalService} from 'ng-zorro-antd';

@Component({
  selector: 'app-t-courses',
  templateUrl: './t-courses.component.html',
  styleUrls: ['./t-courses.component.css']
})
export class TCoursesComponent implements OnInit {

  courses: Course[] = [];
  courseToAdd: Course = new Course();
  courseToDelete: Course = new Course();

  tplModal: NzModalRef; // 用于开设新课程

  constructor(
      private route: ActivatedRoute,
      private router: Router,
      private modalService: NzModalService,
      private courseService: TCourseService
  ) { }

  ngOnInit() {
    this.getCourses();
  }

  // 获取课程列表
  getCourses() {
    this.courseService.getCourses(window.sessionStorage.getItem('user_name'), window.sessionStorage.getItem('identity')).subscribe(
        value => this.setCourses(value));
  }

  setCourses(value) {
    this.courses = value;
  }

  // 进入课程对应的学生本体图页
  enterCourse(course_id: string) {
    // window.sessionStorage.setItem('course_id', course_id);
    this.router.navigate(['../course', course_id], {relativeTo: this.route});
  }

  openModal(
    tplTitle: TemplateRef<{}>,
    tplContent: TemplateRef<{}>,
    tplFooter: TemplateRef<{}>
  ) {
    this.tplModal = this.modalService.create({
      nzTitle: tplTitle,
      nzContent: tplContent,
      nzFooter: tplFooter,
      nzMaskClosable: false
    });
  }

  // 教师添加课程
  addCourse() {
    this.courseService.addCourse(
      this.courseToAdd,
      window.sessionStorage.getItem('user_name'))
      .subscribe((value => this.checkAddSuccess(value['success'])));
  }

  // 检查是否添加成功
  checkAddSuccess(value) {
    if (value) {
      // 更新课程列表
      this.getCourses();
      // 清空新增课程信息
      this.courseToAdd = new Course();

      const inModal = this.modalService.success(
        {
          nzTitle: '操作成功',
          nzContent: '课程已添加'
        });
      window.setTimeout(() => {
        inModal.destroy();
        this.tplModal.destroy();
      }, 2000);

    } else {
      const inModal = this.modalService.error(
        {
          nzTitle: '操作失败',
          nzContent: '课程ID已存在'
        });
      window.setTimeout(() => {
        inModal.destroy();
      }, 2000);
    }
  }

  deleteCourse() {
    this.courseService.deleteCourse(
      window.sessionStorage.getItem('user_name'),
      this.courseToDelete
    ).subscribe(value => this.checkDeleteSuccess(value['success']));
  }

  // 检查是否删除成功
  checkDeleteSuccess(value) {
    if (value) {
      // 更新课程列表
      this.getCourses();
      // 清空新增课程信息
      this.courseToDelete = new Course();

      const inModal = this.modalService.success(
        {
          nzTitle: '操作成功',
          nzContent: '课程已删除'
        });
      window.setTimeout(() => {
        inModal.destroy();
        this.tplModal.destroy();
      }, 2000);

    } else {
      const inModal = this.modalService.error(
        {
          nzTitle: '操作失败',
          nzContent: '课程信息不正确'
        });
      window.setTimeout(() => {
        inModal.destroy();
      }, 2000);
    }
  }
}
