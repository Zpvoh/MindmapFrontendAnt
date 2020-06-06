import {Component, OnInit, TemplateRef} from '@angular/core';
import {Course} from '../../course';
import {ActivatedRoute, Router} from '@angular/router';
import {SCourseService} from '../s-course.service';
import {NzModalRef, NzModalService} from 'ng-zorro-antd';

@Component({
  selector: 'app-s-courses',
  templateUrl: './s-courses.component.html',
  styleUrls: ['./s-courses.component.css']
})
export class SCoursesComponent implements OnInit {

  user_name: string;
  courses: Course[]; // 学生已选课程
  allCourse: Course[]; // 所有开课

  intentionName = ''; // 输入的课程名
  intentionCourse: Course; // 将要选的课

  code = ''; // 选课码
  tplModal: NzModalRef; // 用于输入选课码

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private courseService: SCourseService,
    private modalService: NzModalService
  ) { }

  ngOnInit() {
    this.getCourses();
    this.getAllCourse();
  }

  // 获取学生选课列表
  getCourses() {
    this.courseService.getCourses(window.sessionStorage.getItem('user_name'), window.sessionStorage.getItem('identity')).subscribe(
      value => this.setCourses(value));
  }

  setCourses(value) {
    this.courses = value;
  }

  // 获取所有课程列表
  getAllCourse() {
    this.courseService.searchCourse()
      .subscribe((value => this.setAllCourse(value)));
  }

  setAllCourse(value) {
    this.allCourse = value;
  }

  // 进入课程对应的学生本体图页
  enterCourse(course_id: string) {
    window.sessionStorage.setItem('course_id', course_id);
    this.router.navigate(['../course', course_id], {relativeTo: this.route});
  }

  // 提交选课
  onSubmit() {
    this.courseService.stuAddCourse(window.sessionStorage.getItem('user_name'), this.intentionCourse, this.code)
      .subscribe((value => this.checkSuccess(value['success'])));
  }

  // 检查选课结果
  checkSuccess(value) {
    if (value) {
      const inModal = this.modalService.success(
        {
          nzTitle: '操作成功',
          nzContent: '您已选上课程'
        });
      window.setTimeout(() => {
        inModal.destroy();
        this.tplModal.destroy();
      }, 2000);
      this.getCourses();
    } else {
      const inModal = this.modalService.error(
        {
          nzTitle: '操作失败',
          nzContent: '选课失败'
        });
      window.setTimeout(() => {
        inModal.destroy();
        this.tplModal.destroy();
      }, 2000);
    }
  }

  search() {
    this.intentionCourse = null;
    for (const c of this.allCourse) {
      if (c.course_name === this.intentionName) {
        this.intentionCourse = c;
        break;
      }
    }
  }

  inputCodeModal(tplTitle: TemplateRef<{}>, tplContent: TemplateRef<{}>, tplFooter: TemplateRef<{}>) {
    this.tplModal = this.modalService.create({
      nzTitle: tplTitle,
      nzContent: tplContent,
      nzFooter: tplFooter,
      nzMaskClosable: false
    });
  }


}
